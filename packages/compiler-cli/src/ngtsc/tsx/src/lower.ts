/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';

import {jsonLiteral, joinMapped, MappedText, mt, TsxSourceMap} from './source_map';

/**
 * Experimental: lowers Solid-style TSX function components into ordinary decorated Angular
 * component classes, so that the rest of ngtsc (analysis, template type-checking, Ivy codegen)
 * can process them unchanged.
 *
 * ```tsx
 * export const Counter = component({selector: 'app-counter'}, () => {
 *   const step = input(1);
 *   const count = signal(0);
 *   return <button on:click={() => count.update((c) => c + step())}>{count()}</button>;
 * });
 * ```
 *
 * becomes (roughly)
 *
 * ```ts
 * @Component({selector: 'app-counter', template: '<button (click)="$fc.b1($event)">{{ $fc.b0() }}</button>', …})
 * export class Counter {
 *   readonly step = input(1);
 *   protected readonly $fc = (() => {
 *     const step = this.step;
 *     const count = signal(0);
 *     const ɵb0 = () => (count());
 *     const ɵb1 = ($event: any) => ((() => count.update((c) => c + step())) as (e: any) => unknown)($event);
 *     return {b0: ɵb0, b1: ɵb1};
 *   })();
 * }
 * ```
 *
 * Every dynamic TSX expression is hoisted into a closure inside the component function, and the
 * generated template only ever calls those closures through `$fc`, passing template-local
 * variables (`@for` items, `@if` aliases) as arguments. This keeps arbitrary TypeScript scoping
 * out of the template pipeline.
 */

/** Name of the class field holding the hoisted template bindings. */
export const TSX_BINDINGS_FIELD = '$fc';

/** Module from which the authoring APIs are imported. */
const CORE_MODULE = '@angular/core';

/** Authoring APIs that are erased by the lowering. */
const CONTROL_FLOW = new Set(['If', 'For', 'Switch', 'Case', 'Default', 'Defer']);

/** Signal-based member APIs which must be declared as class fields to be recognized. */
const MEMBER_APIS = new Set([
  'input',
  'model',
  'output',
  'viewChild',
  'viewChildren',
  'contentChild',
  'contentChildren',
]);

/** `@Component` fields that a TSX component may not set, because the lowering owns them. */
const FORBIDDEN_META = new Set(['template', 'templateUrl', 'imports', 'changeDetection']);

const FOR_IMPLICITS: Record<string, string> = {
  $index: 'number',
  $count: 'number',
  $first: 'boolean',
  $last: 'boolean',
  $even: 'boolean',
  $odd: 'boolean',
};

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

/**
 * Resolves the selector of a component referenced as a TSX tag.
 */
export interface TsxSelectorResolver {
  /**
   * @param name The exported name of the component (the imported name, not a local alias).
   * @param moduleSpecifier The module the component is imported from, or `null` if it is declared
   *     in the containing file.
   * @param containingFile The file that references the component.
   * @returns The component's selector, or `null` if it could not be determined.
   */
  resolveSelector(
    name: string,
    moduleSpecifier: string | null,
    containingFile: string,
  ): string | null;
}

export interface TsxLoweringResult {
  /** The lowered source text. */
  text: string;
  /** Errors encountered while lowering, positioned against the original source file. */
  diagnostics: ts.Diagnostic[];
  /** Maps positions in `text` back to the original TSX. */
  sourceMap: TsxSourceMap;
}

interface ImportedName {
  module: string;
  importedName: string;
}

/** A template-local variable that hoisted closures receive as a parameter. */
interface Local {
  name: string;
  type: string;
}

class TsxLoweringError extends Error {
  constructor(
    readonly node: ts.Node,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Lowers every `component(meta, fn)` declaration in a `.tsx` source file.
 *
 * @returns The lowered text, or `null` if the file declares no TSX components.
 */
export function lowerTsxComponents(
  sf: ts.SourceFile,
  resolver: TsxSelectorResolver,
): TsxLoweringResult | null {
  const imports = collectImports(sf);
  const componentFn = localNameOf(imports, CORE_MODULE, 'component');
  if (componentFn === null) {
    return null;
  }

  // Reuse the file's own `Component` import when there is one. Otherwise import it under its own
  // name, falling back to an alias only if the file already uses that name for something else.
  const existingDecorator = localNameOf(imports, CORE_MODULE, 'Component');
  const decoratorName =
    existingDecorator ?? (isNameTaken(sf, imports, 'Component') ? 'ɵngComponent' : 'Component');

  const replacements: {start: number; end: number; text: MappedText}[] = [];
  const diagnostics: ts.Diagnostic[] = [];
  const helpers = new Set<string>();

  for (const stmt of sf.statements) {
    const decl = getComponentDeclaration(stmt, componentFn);
    if (decl === null) {
      continue;
    }
    try {
      const lowerer = new ComponentLowerer(sf, imports, resolver, helpers, decoratorName);
      replacements.push({
        start: stmt.getStart(sf),
        end: stmt.end,
        text: lowerer.lower(stmt as ts.VariableStatement, decl.name, decl.call),
      });
    } catch (e) {
      if (!(e instanceof TsxLoweringError)) {
        throw e;
      }
      diagnostics.push(makeDiagnostic(sf, e.node, e.message));
    }
  }

  if (replacements.length === 0 && diagnostics.length === 0) {
    return null;
  }

  // Everything outside the component declarations is copied verbatim.
  const out = new MappedText();
  let cursor = 0;
  for (const r of replacements) {
    out.copyRange(sf.text, cursor, r.start);
    out.append(r.text);
    cursor = r.end;
  }
  out.copyRange(sf.text, cursor, sf.text.length);

  // Appended rather than prepended so that line numbers before the first component are preserved.
  // Imports and type aliases are hoisted, so their position does not matter.
  const injected: string[] = [];
  if (existingDecorator === null) {
    injected.push(decoratorName === 'Component' ? 'Component' : `Component as ${decoratorName}`);
  }
  injected.push('ChangeDetectionStrategy as ɵngChangeDetectionStrategy');
  const trailer: string[] = ['', `import {${injected.join(', ')}} from '${CORE_MODULE}';`];
  if (helpers.has('ForItem')) {
    trailer.push(
      'type ɵngForItem<T> = T extends null | undefined ? never : T extends Iterable<infer U> ? U : never;',
    );
  }
  if (helpers.has('Truthy')) {
    trailer.push(`type ɵngTruthy<T> = Exclude<T, null | undefined | false | 0 | 0n | ''>;`);
  }
  // Authoring APIs are no longer referenced once lowered; keep them "used" for `noUnusedLocals`.
  const erased = [...imports.entries()]
    .filter(
      ([, i]) =>
        i.module === CORE_MODULE &&
        (i.importedName === 'component' || CONTROL_FLOW.has(i.importedName)),
    )
    .map(([local]) => local);
  if (erased.length > 0) {
    trailer.push(`void [${erased.join(', ')}];`);
  }
  out.append(trailer.join('\n') + '\n');

  return {
    text: out.text,
    diagnostics,
    sourceMap: TsxSourceMap.fromMappedText(sf.fileName, sf.text, out),
  };
}

/**
 * Finds the selector declared by a component named `name` in `sf`. Recognizes TSX components
 * (`const X = component(...)`), decorated classes, and compiled `.d.ts` declarations.
 *
 * @returns The selector, `null` if `name` is declared but has no static selector, or `undefined`
 *     if `name` is not declared as a component in `sf`.
 */
export function findComponentSelector(sf: ts.SourceFile, name: string): string | null | undefined {
  const imports = collectImports(sf);
  const componentFn = localNameOf(imports, CORE_MODULE, 'component');

  for (const stmt of sf.statements) {
    if (componentFn !== null) {
      const decl = getComponentDeclaration(stmt, componentFn);
      if (decl !== null && decl.name === name) {
        const meta = decl.call.arguments.length === 2 ? decl.call.arguments[0] : undefined;
        if (meta !== undefined && ts.isObjectLiteralExpression(meta)) {
          const selector = getStringProperty(meta, 'selector');
          if (selector !== undefined) {
            return selector;
          }
        }
        return defaultSelector(name);
      }
    }

    if (ts.isClassDeclaration(stmt) && stmt.name?.text === name) {
      // Compiled library: `static ɵcmp: i0.ɵɵComponentDeclaration<X, "selector", …>`.
      for (const member of stmt.members) {
        if (
          ts.isPropertyDeclaration(member) &&
          member.name.getText(sf) === 'ɵcmp' &&
          member.type !== undefined &&
          ts.isTypeReferenceNode(member.type) &&
          member.type.typeArguments !== undefined &&
          member.type.typeArguments.length > 1
        ) {
          const sel = member.type.typeArguments[1];
          if (ts.isLiteralTypeNode(sel) && ts.isStringLiteral(sel.literal)) {
            return sel.literal.text;
          }
          return null;
        }
      }
      // Source: `@Component({selector: '…'})`.
      for (const decorator of ts.getDecorators(stmt) ?? []) {
        const call = decorator.expression;
        if (
          ts.isCallExpression(call) &&
          ts.isIdentifier(call.expression) &&
          call.arguments.length === 1 &&
          ts.isObjectLiteralExpression(call.arguments[0])
        ) {
          const local = call.expression.text;
          if (imports.get(local)?.importedName === 'Component') {
            return getStringProperty(call.arguments[0], 'selector') ?? null;
          }
        }
      }
    }
  }
  return undefined;
}

/** Selector given to TSX components that don't declare one. */
export function defaultSelector(name: string): string {
  return 'ng-tsx-' + name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

class ComponentLowerer {
  private readonly bindings: MappedText[] = [];
  private readonly keys: string[] = [];
  private readonly deps = new Set<string>();
  private counter = 0;

  constructor(
    private readonly sf: ts.SourceFile,
    private readonly imports: Map<string, ImportedName>,
    private readonly resolver: TsxSelectorResolver,
    private readonly helpers: Set<string>,
    private readonly decoratorName: string,
  ) {}

  lower(stmt: ts.VariableStatement, name: string, call: ts.CallExpression): MappedText {
    let meta: ts.ObjectLiteralExpression | null = null;
    let fn: ts.Expression;
    if (call.arguments.length === 1) {
      fn = call.arguments[0];
    } else if (call.arguments.length === 2) {
      const metaArg = call.arguments[0];
      if (!ts.isObjectLiteralExpression(metaArg)) {
        throw new TsxLoweringError(metaArg, 'Component metadata must be an object literal.');
      }
      meta = metaArg;
      fn = call.arguments[1];
    } else {
      throw new TsxLoweringError(call, 'component() expects (metadata, fn) or (fn).');
    }

    if (!ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) {
      throw new TsxLoweringError(fn, 'The component body must be an inline function.');
    }
    if (fn.parameters.length > 0) {
      throw new TsxLoweringError(
        fn.parameters[0],
        'TSX components take no parameters. Declare inputs with input(), model() or output().',
      );
    }

    // Split the body into member declarations (lifted to class fields), plain statements, and the
    // returned TSX.
    const fields: MappedText[] = [];
    const aliases: MappedText[] = [];
    const statements: MappedText[] = [];
    let returned: ts.Expression;

    if (ts.isBlock(fn.body)) {
      const body = fn.body.statements;
      const last = body[body.length - 1];
      if (last === undefined || !ts.isReturnStatement(last) || last.expression === undefined) {
        throw new TsxLoweringError(fn.body, 'A TSX component must end with `return <…/>`.');
      }
      for (const s of body.slice(0, -1)) {
        rejectNestedReturns(s);
        const member = this.getMemberDeclaration(s);
        if (member !== null) {
          fields.push(
            mt`  readonly ${this.copy(member.name)} = ${this.copy(member.init)};`.from(s, this.sf),
          );
          aliases.push(
            mt`    const ${member.name.text} = this.${member.name.text};`.from(s, this.sf),
          );
        } else {
          statements.push(mt`    ${this.copy(s)}`);
        }
      }
      returned = last.expression;
    } else {
      returned = fn.body;
    }

    const template = this.lowerChild(returned, []);

    const metaProps: (string | MappedText)[] = [];
    let hasSelector = false;
    if (meta !== null) {
      for (const prop of meta.properties) {
        const propName = prop.name !== undefined ? getPropertyName(prop.name) : null;
        if (propName !== null && FORBIDDEN_META.has(propName)) {
          throw new TsxLoweringError(
            prop,
            `'${propName}' cannot be set on a TSX component; it is derived from the TSX.`,
          );
        }
        if (propName === 'selector') {
          hasSelector = true;
        }
        metaProps.push(this.copy(prop));
      }
    }
    if (!hasSelector) {
      metaProps.push(`selector: ${JSON.stringify(defaultSelector(name))}`);
    }
    metaProps.push(mt`template: ${jsonLiteral(template)}`.from(returned, this.sf));
    if (this.deps.size > 0) {
      metaProps.push(`imports: [${[...this.deps].join(', ')}]`);
    }
    metaProps.push('changeDetection: ɵngChangeDetectionStrategy.OnPush');

    const isExported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
    const nameNode = stmt.declarationList.declarations[0].name;
    const setup = [
      ...aliases,
      ...statements,
      ...this.bindings.map((b) => mt`    ${b}`),
      `    return {${this.keys.map((k) => `${k}: ɵ${k}`).join(', ')}};`,
    ];
    return joinMapped(
      [
        mt`@${this.decoratorName}({\n  ${joinMapped(metaProps, ',\n  ')},\n})`.from(call, this.sf),
        mt`${isExported ? 'export ' : ''}class ${this.copy(nameNode)} {`,
        ...fields,
        mt`  protected readonly ${TSX_BINDINGS_FIELD} = (() => {`.from(fn, this.sf),
        ...setup,
        '  })();',
        '}',
      ],
      '\n',
    ).from(stmt, this.sf);
  }

  /**
   * Recognizes `const x = input(...)` (and the other signal member APIs) at the top level of the
   * component body. These become class fields so that the compiler recognizes them exactly as it
   * would in a class.
   */
  private getMemberDeclaration(
    stmt: ts.Statement,
  ): {name: ts.Identifier; init: ts.Expression} | null {
    if (
      !ts.isVariableStatement(stmt) ||
      stmt.declarationList.declarations.length !== 1 ||
      !(stmt.declarationList.flags & ts.NodeFlags.Const)
    ) {
      return null;
    }
    const decl = stmt.declarationList.declarations[0];
    if (!ts.isIdentifier(decl.name) || decl.initializer === undefined) {
      return null;
    }
    let callee: ts.Expression = decl.initializer;
    if (!ts.isCallExpression(callee)) {
      return null;
    }
    callee = callee.expression;
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'required') {
      callee = callee.expression;
    }
    if (!ts.isIdentifier(callee)) {
      return null;
    }
    const imported = this.imports.get(callee.text);
    if (imported?.module !== CORE_MODULE || !MEMBER_APIS.has(imported.importedName)) {
      return null;
    }
    return {name: decl.name, init: decl.initializer};
  }

  // ---------------------------------------------------------------------------------------------
  // Bindings

  /** Hoists `expr` into a closure and returns the template expression that calls it. */
  private bindValue(expr: ts.Expression, scope: Local[]): {call: MappedText; id: string} {
    this.rejectJsx(expr);
    const locals = this.freeLocals(expr, scope);
    const id = this.nextId();
    this.bindings.push(
      mt`const ɵ${id} = (${params(locals)}) => (${this.copy(expr)});`.from(expr, this.sf),
    );
    return {
      call: this.call(
        expr,
        id,
        locals.map((l) => l.name),
      ),
      id,
    };
  }

  /** The template expression that calls hoisted binding `id`, attributed to `node`. */
  private call(node: ts.Node, id: string, args: string[]): MappedText {
    return mt`${TSX_BINDINGS_FIELD}.${id}(${args.join(', ')})`.from(node, this.sf);
  }

  /** A verbatim copy of `node`. */
  private copy(node: ts.Node): MappedText {
    return new MappedText().copy(node, this.sf);
  }

  /** Hoists an event handler. The handler expression is re-evaluated on every event. */
  private bindEvent(expr: ts.Expression, scope: Local[]): MappedText {
    this.rejectJsx(expr);
    const locals = this.freeLocals(expr, scope);
    const id = this.nextId();
    const all = [{name: '$event', type: 'any'}, ...locals];
    this.bindings.push(
      mt`const ɵ${id} = (${params(all)}) => ((${this.copy(expr)}) as (e: any) => unknown)($event);`.from(
        expr,
        this.sf,
      ),
    );
    return this.call(
      expr,
      id,
      all.map((l) => l.name),
    );
  }

  /** Exposes a writable signal for a two-way binding. */
  private bindTwoWay(expr: ts.Expression, scope: Local[]): MappedText {
    this.rejectJsx(expr);
    const locals = this.freeLocals(expr, scope);
    if (locals.length > 0) {
      throw new TsxLoweringError(
        expr,
        `Two-way bindings can't reference template variables (${locals.map((l) => l.name).join(', ')}).`,
      );
    }
    const id = this.nextId();
    this.bindings.push(mt`const ɵ${id} = ${this.copy(expr)};`.from(expr, this.sf));
    return mt`${TSX_BINDINGS_FIELD}.${id}`.from(expr, this.sf);
  }

  /** Hoists a `track` function for `<For>`, called with the loop item. */
  private bindTrack(fn: ts.Expression, item: Local, scope: Local[]): MappedText {
    this.rejectJsx(fn);
    const locals = this.freeLocals(fn, scope).filter((l) => l.name !== item.name);
    const id = this.nextId();
    const all = [{name: 'ɵitem', type: item.type}, ...locals];
    this.bindings.push(
      mt`const ɵ${id} = (${params(all)}) => (${this.copy(fn)})(ɵitem);`.from(fn, this.sf),
    );
    return this.call(fn, id, [item.name, ...locals.map((l) => l.name)]);
  }

  private nextId(): string {
    const id = `b${this.counter++}`;
    this.keys.push(id);
    return id;
  }

  /** Template-local variables referenced by `expr`, in scope order. */
  private freeLocals(expr: ts.Node, scope: Local[]): Local[] {
    const names = new Set<string>();
    const visit = (node: ts.Node): void => {
      if (ts.isIdentifier(node)) {
        names.add(node.text);
      } else if (ts.isPropertyAccessExpression(node)) {
        visit(node.expression);
      } else if (ts.isPropertyAssignment(node)) {
        if (ts.isComputedPropertyName(node.name)) {
          visit(node.name);
        }
        visit(node.initializer);
      } else {
        ts.forEachChild(node, visit);
      }
    };
    visit(expr);
    // Later (inner) scope entries shadow earlier ones.
    const seen = new Set<string>();
    const result: Local[] = [];
    for (let i = scope.length - 1; i >= 0; i--) {
      if (names.has(scope[i].name) && !seen.has(scope[i].name)) {
        seen.add(scope[i].name);
        result.unshift(scope[i]);
      }
    }
    return result;
  }

  private rejectJsx(expr: ts.Node): void {
    const visit = (node: ts.Node): void => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
        throw new TsxLoweringError(
          node,
          'TSX is only allowed as the returned value, as element children, and in control-flow ' +
            'slots (fallback, empty, placeholder, …).',
        );
      }
      ts.forEachChild(node, visit);
    };
    visit(expr);
  }

  // ---------------------------------------------------------------------------------------------
  // Template generation

  private lowerChild(node: ts.Node, scope: Local[]): MappedText {
    if (ts.isJsxText(node)) {
      return mt`${escapeText(cleanJsxText(node.text))}`.from(node, this.sf);
    }
    if (ts.isJsxExpression(node)) {
      return node.expression === undefined
        ? new MappedText()
        : this.lowerChild(node.expression, scope);
    }
    if (ts.isParenthesizedExpression(node)) {
      return this.lowerChild(node.expression, scope);
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      return mt`${escapeText(node.text)}`.from(node, this.sf);
    }
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      return this.lowerElement(node, scope);
    }
    if (ts.isJsxFragment(node)) {
      return this.lowerChildren(node.children, scope);
    }
    if (
      ts.isConditionalExpression(node) &&
      (containsJsx(node.whenTrue) || containsJsx(node.whenFalse))
    ) {
      return this.lowerConditional(node, scope);
    }
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
      containsJsx(node.right)
    ) {
      return mt`@if (${this.bindValue(node.left, scope).call}) {${this.lowerBranch(node.right, scope)}}`.from(
        node,
        this.sf,
      );
    }
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      throw new TsxLoweringError(
        node,
        'Render callbacks are only supported as the child of <If> or <For>.',
      );
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'map' &&
      node.arguments.some(containsJsx)
    ) {
      throw new TsxLoweringError(
        node,
        'Use <For each={…} track={…}> instead of .map() to render lists.',
      );
    }
    if (ts.isExpression(node)) {
      return mt`{{ ${this.bindValue(node, scope).call} }}`.from(node, this.sf);
    }
    throw new TsxLoweringError(node, 'Unsupported TSX child.');
  }

  private lowerChildren(children: ts.NodeArray<ts.JsxChild>, scope: Local[]): MappedText {
    return joinMapped(
      children.map((c) => this.lowerChild(c, scope)),
      '',
    );
  }

  private lowerBranch(expr: ts.Expression, scope: Local[]): MappedText {
    const e = skipParens(expr);
    if (isNullish(e)) {
      return new MappedText();
    }
    return this.lowerChild(e, scope);
  }

  private lowerConditional(node: ts.ConditionalExpression, scope: Local[]): MappedText {
    const out = mt`@if (${this.bindValue(node.condition, scope).call}) {${this.lowerBranch(node.whenTrue, scope)}}`;
    let rest = skipParens(node.whenFalse);
    while (ts.isConditionalExpression(rest)) {
      out.append(
        mt` @else if (${this.bindValue(rest.condition, scope).call}) {${this.lowerBranch(rest.whenTrue, scope)}}`,
      );
      rest = skipParens(rest.whenFalse);
    }
    if (!isNullish(rest)) {
      out.append(mt` @else {${this.lowerBranch(rest, scope)}}`);
    }
    return out.from(node, this.sf);
  }

  private lowerElement(node: ts.JsxElement | ts.JsxSelfClosingElement, scope: Local[]): MappedText {
    const opening = ts.isJsxElement(node) ? node.openingElement : node;
    const children = ts.isJsxElement(node) ? node.children : undefined;
    const tag = opening.tagName;

    let tagName: string;
    let extraAttrs: string[] = [];
    if (ts.isIdentifier(tag) && /^[A-Z]/.test(tag.text)) {
      const imported = this.imports.get(tag.text);
      if (imported?.module === CORE_MODULE && CONTROL_FLOW.has(imported.importedName)) {
        return this.lowerControlFlow(imported.importedName, opening, children, scope);
      }
      ({tagName, extraAttrs} = this.resolveComponentTag(tag, imported));
      this.deps.add(tag.text);
    } else if (ts.isIdentifier(tag) || ts.isJsxNamespacedName(tag)) {
      tagName = tag.getText(this.sf);
    } else {
      throw new TsxLoweringError(tag, 'Only plain identifiers are supported as component tags.');
    }

    const attrs: (string | MappedText)[] = [...extraAttrs];
    for (const attr of opening.attributes.properties) {
      const lowered = this.lowerAttribute(attr, scope);
      if (lowered !== null) {
        attrs.push(lowered);
      }
    }

    const open = mt`<${tagName}${attrs.length > 0 ? ' ' : ''}${joinMapped(attrs, ' ')}>`.from(
      opening,
      this.sf,
    );
    if (VOID_ELEMENTS.has(tagName)) {
      if (children !== undefined && children.some((c) => !isWhitespaceText(c))) {
        throw new TsxLoweringError(node, `<${tagName}> cannot have children.`);
      }
      return open.from(node, this.sf);
    }
    const inner = children !== undefined ? this.lowerChildren(children, scope) : new MappedText();
    return mt`${open}${inner}</${tagName}>`.from(node, this.sf);
  }

  private resolveComponentTag(
    tag: ts.Identifier,
    imported: ImportedName | undefined,
  ): {tagName: string; extraAttrs: string[]} {
    const selector =
      imported !== undefined
        ? this.resolver.resolveSelector(imported.importedName, imported.module, this.sf.fileName)
        : this.resolver.resolveSelector(tag.text, null, this.sf.fileName);
    if (selector === null) {
      throw new TsxLoweringError(
        tag,
        `Could not determine the selector of '${tag.text}'. It must be a component declared with ` +
          `component() or @Component() and imported directly from the file that declares it.`,
      );
    }
    const parsed = parseSelector(selector);
    if (parsed === null) {
      throw new TsxLoweringError(tag, `Unsupported selector '${selector}' for '${tag.text}'.`);
    }
    return parsed;
  }

  private lowerAttribute(attr: ts.JsxAttributeLike, scope: Local[]): MappedText | null {
    const lowered = this.lowerAttributeText(attr, scope);
    return lowered === null ? null : mt`${lowered}`.from(attr, this.sf);
  }

  private lowerAttributeText(
    attr: ts.JsxAttributeLike,
    scope: Local[],
  ): string | MappedText | null {
    if (ts.isJsxSpreadAttribute(attr)) {
      throw new TsxLoweringError(attr, 'Spread attributes are not supported.');
    }
    let namespace: string | null = null;
    let name: string;
    if (ts.isJsxNamespacedName(attr.name)) {
      namespace = attr.name.namespace.text;
      name = attr.name.name.text;
    } else {
      name = attr.name.text;
    }

    const init = attr.initializer;
    if (init === undefined) {
      if (namespace !== null) {
        throw new TsxLoweringError(attr, `'${namespace}:${name}' requires a value.`);
      }
      return name;
    }

    if (namespace === null && name === 'ref') {
      if (!ts.isStringLiteral(init)) {
        throw new TsxLoweringError(attr, '`ref` must be a string literal (e.g. ref="input").');
      }
      return `#${init.text}`;
    }

    if (namespace === null && name === 'use') {
      const list = ts.isJsxExpression(init) && init.expression ? skipParens(init.expression) : null;
      if (
        list === null ||
        !ts.isArrayLiteralExpression(list) ||
        !list.elements.every(ts.isIdentifier)
      ) {
        throw new TsxLoweringError(
          attr,
          '`use` must be an array of directive classes, e.g. use={[Tooltip]}.',
        );
      }
      for (const el of list.elements) {
        this.deps.add((el as ts.Identifier).text);
      }
      return null;
    }

    if (ts.isStringLiteral(init)) {
      if (namespace !== null) {
        throw new TsxLoweringError(attr, `'${namespace}:${name}' requires an expression value.`);
      }
      // Keep `{{`/`@` in static values from being interpreted by the template parser.
      if (/[{}@]/.test(init.text)) {
        return `[${name}]="${escapeAttr(singleQuoted(init.text))}"`;
      }
      return `${name}="${escapeAttr(init.text)}"`;
    }

    if (!ts.isJsxExpression(init) || init.expression === undefined) {
      throw new TsxLoweringError(attr, 'Unsupported attribute value.');
    }
    const expr = init.expression;

    switch (namespace) {
      // Binding calls (`$fc.bN(a, b)`) never contain characters that need attribute escaping.
      case null:
        return mt`[${name}]="${this.bindValue(expr, scope).call}"`;
      case 'on':
        return mt`(${name})="${this.bindEvent(expr, scope)}"`;
      case 'bind':
        return mt`[(${name})]="${this.bindTwoWay(expr, scope)}"`;
      case 'attr':
      case 'class':
      case 'style':
        return mt`[${namespace}.${name}]="${this.bindValue(expr, scope).call}"`;
      default:
        throw new TsxLoweringError(
          attr.name,
          `Unknown attribute namespace '${namespace}:'. Expected on:, bind:, attr:, class: or style:.`,
        );
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Control flow

  private lowerControlFlow(
    kind: string,
    opening: ts.JsxOpeningLikeElement,
    children: ts.NodeArray<ts.JsxChild> | undefined,
    scope: Local[],
  ): MappedText {
    const attrs = this.controlFlowAttributes(opening);
    const element = opening.parent && ts.isJsxElement(opening.parent) ? opening.parent : opening;
    switch (kind) {
      case 'If':
        return this.lowerIf(opening, attrs, children, scope).from(element, this.sf);
      case 'For':
        return this.lowerFor(opening, attrs, children, scope).from(element, this.sf);
      case 'Switch':
        return this.lowerSwitch(opening, attrs, children, scope).from(element, this.sf);
      case 'Defer':
        return this.lowerDefer(opening, attrs, children, scope).from(element, this.sf);
      default:
        throw new TsxLoweringError(opening, `<${kind}> may only be used directly inside <Switch>.`);
    }
  }

  private lowerIf(
    opening: ts.JsxOpeningLikeElement,
    attrs: Map<string, ts.JsxAttributeValue>,
    children: ts.NodeArray<ts.JsxChild> | undefined,
    scope: Local[],
  ): MappedText {
    expectAttributes(opening, attrs, ['when'], ['fallback']);
    const when = this.bindValue(attrExpression(attrs.get('when')!), scope);

    let body: MappedText;
    let alias = '';
    const callback = getRenderCallback(children);
    if (callback !== null) {
      if (callback.parameters.length > 1) {
        throw new TsxLoweringError(callback, '<If> callbacks take at most one parameter.');
      }
      let inner = scope;
      const param = callback.parameters[0];
      if (param !== undefined) {
        const name = paramName(param);
        this.helpers.add('Truthy');
        inner = [...scope, {name, type: `ɵngTruthy<ReturnType<typeof ɵ${when.id}>>`}];
        alias = `; as ${name}`;
      }
      body = this.lowerCallbackBody(callback, inner);
    } else {
      body = children !== undefined ? this.lowerChildren(children, scope) : new MappedText();
    }

    const out = mt`@if (${when.call}${alias}) {${body}}`;
    const fallback = attrs.get('fallback');
    if (fallback !== undefined) {
      out.append(mt` @else {${this.lowerSlot(fallback, scope)}}`);
    }
    return out;
  }

  private lowerFor(
    opening: ts.JsxOpeningLikeElement,
    attrs: Map<string, ts.JsxAttributeValue>,
    children: ts.NodeArray<ts.JsxChild> | undefined,
    scope: Local[],
  ): MappedText {
    expectAttributes(opening, attrs, ['each', 'track'], ['empty']);
    const callback = getRenderCallback(children);
    if (callback === null) {
      throw new TsxLoweringError(
        opening,
        '<For> expects a single render callback child, e.g. {(item) => <li>{item.name}</li>}.',
      );
    }
    if (callback.parameters.length < 1 || callback.parameters.length > 2) {
      throw new TsxLoweringError(callback, '<For> callbacks take (item) or (item, {$index, …}).');
    }

    const each = this.bindValue(attrExpression(attrs.get('each')!), scope);
    this.helpers.add('ForItem');
    const item: Local = {
      name: paramName(callback.parameters[0]),
      type: `ɵngForItem<ReturnType<typeof ɵ${each.id}>>`,
    };
    const track = this.bindTrack(attrExpression(attrs.get('track')!), item, scope);

    const inner: Local[] = [...scope, item];
    const lets: string[] = [];
    const ctxParam = callback.parameters[1];
    if (ctxParam !== undefined) {
      if (!ts.isObjectBindingPattern(ctxParam.name)) {
        throw new TsxLoweringError(
          ctxParam,
          'The second <For> callback parameter must be destructured, e.g. {$index, $last}.',
        );
      }
      for (const el of ctxParam.name.elements) {
        const source = el.propertyName !== undefined ? getPropertyName(el.propertyName) : null;
        if (
          !ts.isIdentifier(el.name) ||
          el.dotDotDotToken !== undefined ||
          el.initializer !== undefined
        ) {
          throw new TsxLoweringError(el, 'Unsupported destructuring in <For> callback.');
        }
        const local = el.name.text;
        const implicit = source ?? local;
        if (!(implicit in FOR_IMPLICITS)) {
          throw new TsxLoweringError(
            el,
            `Unknown loop variable '${implicit}'. Expected one of ${Object.keys(FOR_IMPLICITS).join(', ')}.`,
          );
        }
        if (local !== implicit) {
          lets.push(`let ${local} = ${implicit}`);
        }
        inner.push({name: local, type: FOR_IMPLICITS[implicit]});
      }
    }

    const body = this.lowerCallbackBody(callback, inner);
    const out = mt`@for (${item.name} of ${each.call}; track ${track}${lets.length > 0 ? '; ' + lets.join(', ') : ''}) {${body}}`;
    const empty = attrs.get('empty');
    if (empty !== undefined) {
      out.append(mt` @empty {${this.lowerSlot(empty, scope)}}`);
    }
    return out;
  }

  private lowerSwitch(
    opening: ts.JsxOpeningLikeElement,
    attrs: Map<string, ts.JsxAttributeValue>,
    children: ts.NodeArray<ts.JsxChild> | undefined,
    scope: Local[],
  ): MappedText {
    expectAttributes(opening, attrs, ['value'], []);
    const value = this.bindValue(attrExpression(attrs.get('value')!), scope);
    const cases: MappedText[] = [];
    for (const child of children ?? []) {
      if (
        isWhitespaceText(child) ||
        (ts.isJsxExpression(child) && child.expression === undefined)
      ) {
        continue;
      }
      const el = ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) ? child : null;
      const caseOpening = el === null ? null : ts.isJsxElement(el) ? el.openingElement : el;
      const kind =
        caseOpening !== null && ts.isIdentifier(caseOpening.tagName)
          ? this.imports.get(caseOpening.tagName.text)
          : undefined;
      if (
        caseOpening === null ||
        kind?.module !== CORE_MODULE ||
        (kind.importedName !== 'Case' && kind.importedName !== 'Default')
      ) {
        throw new TsxLoweringError(child, '<Switch> may only contain <Case> and <Default>.');
      }
      const caseChildren = ts.isJsxElement(el!) ? el.children : undefined;
      const body =
        caseChildren !== undefined ? this.lowerChildren(caseChildren, scope) : new MappedText();
      const caseAttrs = this.controlFlowAttributes(caseOpening);
      if (kind.importedName === 'Case') {
        expectAttributes(caseOpening, caseAttrs, ['value'], []);
        const v = caseAttrs.get('value')!;
        const test = ts.isStringLiteral(v)
          ? singleQuoted(v.text)
          : this.bindValue(attrExpression(v), scope).call;
        cases.push(mt`@case (${test}) {${body}}`.from(child, this.sf));
      } else {
        expectAttributes(caseOpening, caseAttrs, [], []);
        cases.push(mt`@default {${body}}`.from(child, this.sf));
      }
    }
    return mt`@switch (${value.call}) {${joinMapped(cases, ' ')}}`;
  }

  private lowerDefer(
    opening: ts.JsxOpeningLikeElement,
    attrs: Map<string, ts.JsxAttributeValue>,
    children: ts.NodeArray<ts.JsxChild> | undefined,
    scope: Local[],
  ): MappedText {
    expectAttributes(opening, attrs, [], ['on', 'when', 'placeholder', 'loading', 'error']);
    const triggers: (string | MappedText)[] = [];
    const on = attrs.get('on');
    if (on !== undefined) {
      const values = staticStrings(on);
      if (values === null) {
        throw new TsxLoweringError(
          on,
          '`on` must be a string or an array of strings, e.g. on={["viewport", "timer(2s)"]}.',
        );
      }
      triggers.push(`on ${values.join(', ')}`);
    }
    const when = attrs.get('when');
    if (when !== undefined) {
      triggers.push(mt`when ${this.bindValue(attrExpression(when), scope).call}`);
    }

    const body = children !== undefined ? this.lowerChildren(children, scope) : new MappedText();
    const out =
      triggers.length > 0
        ? mt`@defer (${joinMapped(triggers, '; ')}) {${body}}`
        : mt`@defer {${body}}`;
    for (const block of ['placeholder', 'loading', 'error']) {
      const slot = attrs.get(block);
      if (slot !== undefined) {
        out.append(mt` @${block} {${this.lowerSlot(slot, scope)}}`);
      }
    }
    return out;
  }

  private lowerCallbackBody(
    callback: ts.ArrowFunction | ts.FunctionExpression,
    scope: Local[],
  ): MappedText {
    if (ts.isBlock(callback.body)) {
      const stmts = callback.body.statements;
      if (
        stmts.length !== 1 ||
        !ts.isReturnStatement(stmts[0]) ||
        stmts[0].expression === undefined
      ) {
        throw new TsxLoweringError(
          callback.body,
          'Render callbacks must return TSX directly; move other logic into the component body.',
        );
      }
      return this.lowerChild(stmts[0].expression, scope);
    }
    return this.lowerChild(callback.body, scope);
  }

  /** Lowers a TSX-valued attribute such as `fallback={<p>…</p>}` or `fallback="text"`. */
  private lowerSlot(value: ts.JsxAttributeValue, scope: Local[]): MappedText {
    if (ts.isStringLiteral(value)) {
      return mt`${escapeText(value.text)}`.from(value, this.sf);
    }
    if (ts.isJsxExpression(value) && value.expression !== undefined) {
      return this.lowerBranch(value.expression, scope);
    }
    if (ts.isJsxElement(value) || ts.isJsxSelfClosingElement(value) || ts.isJsxFragment(value)) {
      return this.lowerChild(value, scope);
    }
    throw new TsxLoweringError(value, 'Unsupported slot value.');
  }

  private controlFlowAttributes(
    opening: ts.JsxOpeningLikeElement,
  ): Map<string, ts.JsxAttributeValue> {
    const attrs = new Map<string, ts.JsxAttributeValue>();
    for (const attr of opening.attributes.properties) {
      if (ts.isJsxSpreadAttribute(attr) || ts.isJsxNamespacedName(attr.name)) {
        throw new TsxLoweringError(attr, 'Unsupported attribute on a control-flow element.');
      }
      if (attr.initializer === undefined) {
        throw new TsxLoweringError(attr, `'${attr.name.text}' requires a value.`);
      }
      attrs.set(attr.name.text, attr.initializer);
    }
    return attrs;
  }
}

// -----------------------------------------------------------------------------------------------
// Helpers

function collectImports(sf: ts.SourceFile): Map<string, ImportedName> {
  const imports = new Map<string, ImportedName>();
  for (const stmt of sf.statements) {
    if (
      !ts.isImportDeclaration(stmt) ||
      !ts.isStringLiteral(stmt.moduleSpecifier) ||
      stmt.importClause === undefined ||
      stmt.importClause.isTypeOnly
    ) {
      continue;
    }
    const module = stmt.moduleSpecifier.text;
    const bindings = stmt.importClause.namedBindings;
    if (bindings !== undefined && ts.isNamedImports(bindings)) {
      for (const el of bindings.elements) {
        if (el.isTypeOnly) {
          continue;
        }
        const importedName =
          el.propertyName !== undefined ? getPropertyName(el.propertyName) : null;
        imports.set(el.name.text, {module, importedName: importedName ?? el.name.text});
      }
    }
  }
  return imports;
}

function isNameTaken(sf: ts.SourceFile, imports: Map<string, ImportedName>, name: string): boolean {
  if (imports.has(name)) {
    return true;
  }
  return sf.statements.some((stmt) => {
    if (
      (ts.isClassDeclaration(stmt) ||
        ts.isFunctionDeclaration(stmt) ||
        ts.isEnumDeclaration(stmt) ||
        ts.isInterfaceDeclaration(stmt) ||
        ts.isTypeAliasDeclaration(stmt)) &&
      stmt.name?.text === name
    ) {
      return true;
    }
    return (
      ts.isVariableStatement(stmt) &&
      stmt.declarationList.declarations.some((d) => ts.isIdentifier(d.name) && d.name.text === name)
    );
  });
}

function localNameOf(
  imports: Map<string, ImportedName>,
  module: string,
  importedName: string,
): string | null {
  for (const [local, i] of imports) {
    if (i.module === module && i.importedName === importedName) {
      return local;
    }
  }
  return null;
}

function getComponentDeclaration(
  stmt: ts.Statement,
  componentFn: string,
): {name: string; call: ts.CallExpression} | null {
  if (!ts.isVariableStatement(stmt) || stmt.declarationList.declarations.length !== 1) {
    return null;
  }
  const decl = stmt.declarationList.declarations[0];
  if (
    !ts.isIdentifier(decl.name) ||
    decl.initializer === undefined ||
    !ts.isCallExpression(decl.initializer) ||
    !ts.isIdentifier(decl.initializer.expression) ||
    decl.initializer.expression.text !== componentFn
  ) {
    return null;
  }
  return {name: decl.name.text, call: decl.initializer};
}

function getPropertyName(name: ts.Node): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isPrivateIdentifier(name)) {
    return name.text;
  }
  return null;
}

function getStringProperty(obj: ts.ObjectLiteralExpression, name: string): string | undefined {
  for (const prop of obj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      getPropertyName(prop.name) === name &&
      (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer))
    ) {
      return prop.initializer.text;
    }
  }
  return undefined;
}

/**
 * Converts a component selector into the tag and attributes used to instantiate it. Uses the
 * first selector in a comma-separated list; attribute-only selectors are placed on a `<div>`.
 */
function parseSelector(selector: string): {tagName: string; extraAttrs: string[]} | null {
  const first = selector.split(',')[0].trim();
  const match = /^([a-zA-Z][\w-]*)?((?:\[[^\]=\s]+(?:=[^\]]*)?\])*)$/.exec(first);
  if (match === null || (match[1] === undefined && match[2] === '')) {
    return null;
  }
  const extraAttrs: string[] = [];
  for (const attr of match[2].matchAll(/\[([^\]=\s]+)(?:=([^\]]*))?\]/g)) {
    const value = attr[2]?.replace(/^["']|["']$/g, '');
    extraAttrs.push(value !== undefined ? `${attr[1]}="${escapeAttr(value)}"` : attr[1]);
  }
  return {tagName: match[1] ?? 'div', extraAttrs};
}

function rejectNestedReturns(stmt: ts.Statement): void {
  const visit = (node: ts.Node): void => {
    if (ts.isFunctionLike(node) || ts.isClassLike(node)) {
      return;
    }
    if (ts.isReturnStatement(node)) {
      throw new TsxLoweringError(
        node,
        'TSX components must have a single `return` at the end. Use <If> or <Switch> for branching.',
      );
    }
    ts.forEachChild(node, visit);
  };
  visit(stmt);
}

function getRenderCallback(
  children: ts.NodeArray<ts.JsxChild> | undefined,
): ts.ArrowFunction | ts.FunctionExpression | null {
  if (children === undefined) {
    return null;
  }
  const meaningful = children.filter((c) => !isWhitespaceText(c));
  if (meaningful.length !== 1 || !ts.isJsxExpression(meaningful[0])) {
    return null;
  }
  const expr = meaningful[0].expression && skipParens(meaningful[0].expression);
  if (expr !== undefined && (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr))) {
    return expr;
  }
  return null;
}

function paramName(param: ts.ParameterDeclaration): string {
  if (!ts.isIdentifier(param.name)) {
    throw new TsxLoweringError(param, 'Expected a plain parameter name.');
  }
  return param.name.text;
}

function expectAttributes(
  node: ts.JsxOpeningLikeElement,
  attrs: Map<string, ts.JsxAttributeValue>,
  required: string[],
  optional: string[],
): void {
  const tag = ts.isIdentifier(node.tagName) ? node.tagName.text : 'element';
  for (const name of required) {
    if (!attrs.has(name)) {
      throw new TsxLoweringError(node, `<${tag}> requires a '${name}' attribute.`);
    }
  }
  for (const name of attrs.keys()) {
    if (!required.includes(name) && !optional.includes(name)) {
      throw new TsxLoweringError(node, `<${tag}> does not support the '${name}' attribute.`);
    }
  }
}

function attrExpression(value: ts.JsxAttributeValue): ts.Expression {
  if (ts.isJsxExpression(value) && value.expression !== undefined) {
    return value.expression;
  }
  if (ts.isStringLiteral(value)) {
    return value;
  }
  throw new TsxLoweringError(value, 'Expected an expression.');
}

function staticStrings(value: ts.JsxAttributeValue): string[] | null {
  if (ts.isStringLiteral(value)) {
    return [value.text];
  }
  if (ts.isJsxExpression(value) && value.expression !== undefined) {
    const expr = skipParens(value.expression);
    if (ts.isStringLiteral(expr)) {
      return [expr.text];
    }
    if (ts.isArrayLiteralExpression(expr) && expr.elements.every(ts.isStringLiteral)) {
      return expr.elements.map((e) => (e as ts.StringLiteral).text);
    }
  }
  return null;
}

function containsJsx(node: ts.Node): boolean {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
    return true;
  }
  return ts.forEachChild(node, containsJsx) ?? false;
}

function skipParens(expr: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(expr)) {
    expr = expr.expression;
  }
  return expr;
}

function isNullish(expr: ts.Expression): boolean {
  return (
    expr.kind === ts.SyntaxKind.NullKeyword ||
    expr.kind === ts.SyntaxKind.FalseKeyword ||
    (ts.isIdentifier(expr) && expr.text === 'undefined')
  );
}

function isWhitespaceText(node: ts.Node): boolean {
  return ts.isJsxText(node) && cleanJsxText(node.text) === '';
}

/** Applies JSX whitespace semantics: lines are trimmed and blank lines dropped. */
function cleanJsxText(text: string): string {
  const lines = text.split(/\r\n|\n|\r/);
  let lastNonEmpty = 0;
  lines.forEach((line, i) => {
    if (/[^ \t]/.test(line)) {
      lastNonEmpty = i;
    }
  });
  let out = '';
  lines.forEach((raw, i) => {
    let line = raw.replace(/\t/g, ' ');
    if (i !== 0) {
      line = line.replace(/^ +/, '');
    }
    if (i !== lines.length - 1) {
      line = line.replace(/ +$/, '');
    }
    if (line !== '') {
      out += i !== lastNonEmpty ? line + ' ' : line;
    }
  });
  return out;
}

function escapeText(text: string): string {
  return text.replace(/@/g, '&#64;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
}

/** Quotes a string as a template expression literal. */
function singleQuoted(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function params(locals: Local[]): string {
  return locals.map((l) => `${l.name}: ${l.type}`).join(', ');
}

function makeDiagnostic(sf: ts.SourceFile, node: ts.Node, message: string): ts.Diagnostic {
  const start = node.getStart(sf);
  return {
    category: ts.DiagnosticCategory.Error,
    code: ngErrorCode(ErrorCode.TSX_COMPONENT_INVALID),
    file: sf,
    start,
    length: node.end - start,
    messageText: message,
  };
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseTemplate} from '@angular/compiler';
import ts from 'typescript';

import {findComponentSelector, lowerTsxComponents, TsxLoweringResult} from '../index';

const CORE_IMPORTS = `import {component, input, model, output, signal, computed, inject, viewChild, If, For, Switch, Case, Default, Defer} from '@angular/core';\n`;

function lower(source: string, selectors: Record<string, string> = {}): TsxLoweringResult {
  const sf = ts.createSourceFile(
    '/app/test.tsx',
    CORE_IMPORTS + source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const result = lowerTsxComponents(sf, {
    resolveSelector: (name) => selectors[name] ?? null,
  });
  if (result === null) {
    throw new Error('Expected the file to be lowered');
  }
  return result;
}

/** Lowers `source`, asserts there were no errors, and returns the generated template. */
function template(source: string, selectors: Record<string, string> = {}): string {
  const result = lower(source, selectors);
  expect(result.diagnostics.map((d) => d.messageText)).toEqual([]);
  const templates = [...result.text.matchAll(/^ {2}template: (".*"),$/gm)].map((m) =>
    JSON.parse(m[1]),
  );
  expect(templates.length).toBe(1);
  const parsed = parseTemplate(templates[0], '/app/test.tsx');
  expect(parsed.errors?.map((e) => e.toString()) ?? []).toEqual([]);
  return templates[0];
}

function errors(source: string): string[] {
  return lower(source).diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
}

describe('TSX component lowering', () => {
  it('should ignore files that do not import component() from @angular/core', () => {
    const sf = ts.createSourceFile(
      '/app/test.tsx',
      `const X = () => <div/>;`,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    expect(lowerTsxComponents(sf, {resolveSelector: () => null})).toBeNull();
  });

  it('should lower a component into a decorated class', () => {
    const {text, diagnostics} = lower(`
      export const Counter = component({selector: 'app-counter'}, () => {
        const initial = input.required<number>();
        const label = input('Count');
        const changed = output<number>();
        const count = signal(0);
        const inc = () => {
          count.update((c) => c + initial());
          changed.emit(count());
        };
        return <button class="counter" on:click={inc}>{label()}: {count()}</button>;
      });
    `);
    expect(diagnostics).toEqual([]);
    expect(text).toContain(`@Component({
  selector: 'app-counter',
  template: "<button class=\\"counter\\" (click)=\\"$fc.b0($event)\\">{{ $fc.b1() }}: {{ $fc.b2() }}</button>",
  changeDetection: ɵngChangeDetectionStrategy.OnPush,
})
export class Counter {
  readonly initial = input.required<number>();
  readonly label = input('Count');
  readonly changed = output<number>();
  protected readonly $fc = (() => {
    const initial = this.initial;
    const label = this.label;
    const changed = this.changed;
    const count = signal(0);`);
    expect(text).toContain('const ɵb0 = ($event: any) => ((inc) as (e: any) => unknown)($event);');
    expect(text).toContain('const ɵb1 = () => (label());');
    expect(text).toContain('const ɵb2 = () => (count());');
    expect(text).toContain('return {b0: ɵb0, b1: ɵb1, b2: ɵb2};');
    expect(text).toContain(
      `import {Component, ChangeDetectionStrategy as ɵngChangeDetectionStrategy} from '@angular/core';`,
    );
    expect(text).toContain('void [component, If, For, Switch, Case, Default, Defer];');
  });

  it('should reuse an existing Component import and alias it when the name is taken', () => {
    const reuse = lower(`
      import {Component as Cmp} from '@angular/core';
      const A = component(() => <p />);
    `).text;
    expect(reuse).toContain('@Cmp({');
    expect(reuse).toContain(
      `import {ChangeDetectionStrategy as ɵngChangeDetectionStrategy} from '@angular/core';`,
    );

    const taken = lower(`
      class Component {}
      const A = component(() => <p />);
    `).text;
    expect(taken).toContain('@ɵngComponent({');
    expect(taken).toContain(`import {Component as ɵngComponent, ChangeDetectionStrategy`);
  });

  it('should support expression-bodied components and default selectors', () => {
    const {text} = lower(`const UserCard = component(() => <p>hi</p>);`);
    expect(text).toContain(`selector: "ng-tsx-user-card"`);
    expect(text).toContain('\nclass UserCard {');
    expect(text).toContain('return {};');
  });

  it('should keep the rest of the metadata', () => {
    const {text} = lower(`
      export const Panel = component(
        {selector: 'app-panel', providers: [Store], styles: \`:host { display: block }\`},
        () => <section><ng-content select="header" /><ng-content /></section>,
      );
    `);
    expect(text).toContain('providers: [Store]');
    expect(text).toContain('styles: `:host { display: block }`');
    expect(text).toContain(
      `template: "<section><ng-content select=\\"header\\"></ng-content><ng-content></ng-content></section>"`,
    );
  });

  describe('bindings', () => {
    it('should lower each attribute kind', () => {
      expect(
        template(`
          const C = component(() => {
            const value = signal('');
            const active = signal(false);
            return (
              <input
                type="text"
                disabled
                ref="field"
                placeholder={value()}
                bind:value={value}
                attr:aria-label={'Name'}
                class:active={active()}
                style:width={'10px'}
                on:keydown={(e) => console.log(e)}
              />
            );
          });
        `),
      ).toBe(
        '<input type="text" disabled #field [placeholder]="$fc.b0()" [(value)]="$fc.b1" ' +
          '[attr.aria-label]="$fc.b2()" [class.active]="$fc.b3()" [style.width]="$fc.b4()" ' +
          '(keydown)="$fc.b5($event)">',
      );
    });

    it('should apply JSX whitespace rules (line breaks drop whitespace) and escape `@`', () => {
      expect(
        template(`
          const C = component(() => (
            <p>
              Email me @ home{' '}
              <b>now</b>
              <i>later</i>
            </p>
          ));
        `),
      ).toBe('<p>Email me &#64; home <b>now</b><i>later</i></p>');
    });

    it('should bind static values that look like template syntax', () => {
      expect(template(`const C = component(() => <p title="{{x}} @y" />);`)).toBe(
        `<p [title]="'{{x}} @y'"></p>`,
      );
    });

    it('should add `use` directives to imports without emitting an attribute', () => {
      const {text} = lower(
        `const C = component(() => <button use={[MatTooltip]} matTooltip="Hi">x</button>);`,
      );
      expect(text).toContain('imports: [MatTooltip]');
      expect(text).toContain(`template: "<button matTooltip=\\"Hi\\">x</button>"`);
    });
  });

  describe('component tags', () => {
    it('should resolve element selectors and add the component to imports', () => {
      const {text} = lower(
        `
          import {Counter} from './counter';
          const App = component(() => {
            const step = signal(1);
            return <Counter initial={1} bind:step={step} on:changed={(v) => console.log(v)} />;
          });
        `,
        {Counter: 'app-counter'},
      );
      expect(text).toContain(
        `template: "<app-counter [initial]=\\"$fc.b0()\\" [(step)]=\\"$fc.b1\\" (changed)=\\"$fc.b2($event)\\"></app-counter>"`,
      );
      expect(text).toContain('imports: [Counter]');
    });

    it('should resolve attribute selectors', () => {
      expect(
        template(
          `
          import {MatButton} from '@angular/material/button';
          const C = component(() => <MatButton>Go</MatButton>);
        `,
          {MatButton: 'button[matButton], a[matButton]'},
        ),
      ).toBe('<button matButton>Go</button>');
    });

    it('should report components whose selector cannot be resolved', () => {
      expect(errors(`import {X} from './x'; const C = component(() => <X />);`)).toEqual([
        jasmine.stringContaining(`Could not determine the selector of 'X'`),
      ]);
    });
  });

  describe('control flow', () => {
    it('should lower <If> with a fallback', () => {
      expect(
        template(`
          const C = component(() => {
            const ok = signal(true);
            return <If when={ok()} fallback={<p>no</p>}><p>yes</p></If>;
          });
        `),
      ).toBe('@if ($fc.b0()) {<p>yes</p>} @else {<p>no</p>}');
    });

    it('should lower <If> render callbacks to an alias with a narrowed type', () => {
      const {text} = lower(`
        const C = component(() => {
          const user = signal<{name: string} | null>(null);
          return <If when={user()}>{(u) => <p>{u.name}</p>}</If>;
        });
      `);
      expect(text).toContain(`template: "@if ($fc.b0(); as u) {<p>{{ $fc.b1(u) }}</p>}"`);
      expect(text).toContain('const ɵb1 = (u: ɵngTruthy<ReturnType<typeof ɵb0>>) => (u.name);');
      expect(text).toContain('type ɵngTruthy<T>');
    });

    it('should lower ternaries and && to @if chains', () => {
      expect(
        template(`
          const C = component(() => {
            const n = signal(0);
            return (
              <div>
                {n() > 1 ? <b>many</b> : n() === 1 ? <i>one</i> : 'none'}
                {n() === 0 && <span>empty</span>}
              </div>
            );
          });
        `),
      ).toBe(
        '<div>@if ($fc.b0()) {<b>many</b>} @else if ($fc.b1()) {<i>one</i>} @else {none}' +
          '@if ($fc.b2()) {<span>empty</span>}</div>',
      );
    });

    it('should lower <For> with track, renamed implicit variables and @empty', () => {
      const {text, diagnostics} = lower(`
        const C = component(() => {
          const todos = signal<{id: number; title: string}[]>([]);
          return (
            <ul>
              <For each={todos()} track={(t) => t.id} empty={<li>Nothing</li>}>
                {(todo, {$index: i, $last}) => (
                  <li class:last={$last}>{i + 1}. {todo.title}</li>
                )}
              </For>
            </ul>
          );
        });
      `);
      expect(diagnostics).toEqual([]);
      expect(text).toContain(
        'template: "<ul>@for (todo of $fc.b0(); track $fc.b1(todo); let i = $index) ' +
          '{<li [class.last]=\\"$fc.b2($last)\\">{{ $fc.b3(i) }}. {{ $fc.b4(todo) }}</li>} ' +
          '@empty {<li>Nothing</li>}</ul>"',
      );
      expect(text).toContain(
        'const ɵb1 = (ɵitem: ɵngForItem<ReturnType<typeof ɵb0>>) => ((t) => t.id)(ɵitem);',
      );
      expect(text).toContain('const ɵb3 = (i: number) => (i + 1);');
      expect(text).toContain(
        'const ɵb4 = (todo: ɵngForItem<ReturnType<typeof ɵb0>>) => (todo.title);',
      );
    });

    it('should pass outer loop variables into nested loops', () => {
      expect(
        template(`
          const C = component(() => {
            const rows = signal<{id: number; cells: {id: number}[]}[]>([]);
            return (
              <For each={rows()} track={(r) => r.id}>
                {(row) => (
                  <For each={row.cells} track={(c) => c.id}>
                    {(cell) => <td>{row.id}:{cell.id}</td>}
                  </For>
                )}
              </For>
            );
          });
        `),
      ).toBe(
        '@for (row of $fc.b0(); track $fc.b1(row)) {' +
          '@for (cell of $fc.b2(row); track $fc.b3(cell)) {<td>{{ $fc.b4(row) }}:{{ $fc.b5(cell) }}</td>}}',
      );
    });

    it('should lower <Switch>', () => {
      expect(
        template(`
          const C = component(() => {
            const mode = signal('view');
            return (
              <Switch value={mode()}>
                <Case value="edit"><b>edit</b></Case>
                <Case value={'it\\'s'}>quote</Case>
                <Default>other</Default>
              </Switch>
            );
          });
        `),
      ).toBe(
        `@switch ($fc.b0()) {@case ('edit') {<b>edit</b>} @case ($fc.b1()) {quote} @default {other}}`,
      );
    });

    it('should lower <Defer>', () => {
      expect(
        template(`
          const C = component(() => (
            <Defer on={['viewport', 'timer(2s)']} placeholder={<p>…</p>} loading="Loading">
              <p>heavy</p>
            </Defer>
          ));
        `),
      ).toBe(
        '@defer (on viewport, timer(2s)) {<p>heavy</p>} @placeholder {<p>…</p>} @loading {Loading}',
      );
    });
  });

  describe('errors', () => {
    it('should reject .map() in favor of <For>', () => {
      expect(
        errors(`const C = component(() => <ul>{[1, 2].map((n) => <li>{n}</li>)}</ul>);`),
      ).toEqual([jasmine.stringContaining('Use <For each={…} track={…}>')]);
    });

    it('should reject parameters', () => {
      expect(errors(`const C = component((props: {a: string}) => <p />);`)).toEqual([
        jasmine.stringContaining('TSX components take no parameters'),
      ]);
    });

    it('should reject early returns', () => {
      expect(
        errors(`
          const C = component(() => {
            if (Math.random() > 0.5) { return <a />; }
            return <b />;
          });
        `),
      ).toEqual([jasmine.stringContaining('single `return`')]);
    });

    it('should reject TSX used as a plain value', () => {
      expect(errors(`const C = component(() => <p title={String(<b />)} />);`)).toEqual([
        jasmine.stringContaining('TSX is only allowed'),
      ]);
    });

    it('should require track on <For>', () => {
      expect(
        errors(`const C = component(() => <For each={[1]}>{(n) => <i>{n}</i>}</For>);`),
      ).toEqual([jasmine.stringContaining(`<For> requires a 'track' attribute`)]);
    });

    it('should reject metadata the lowering owns', () => {
      expect(errors(`const C = component({template: 'x'}, () => <p />);`)).toEqual([
        jasmine.stringContaining(`'template' cannot be set on a TSX component`),
      ]);
    });

    it('should reject unknown namespaces', () => {
      expect(errors(`const C = component(() => <p foo:bar={1} />);`)).toEqual([
        jasmine.stringContaining(`Unknown attribute namespace 'foo:'`),
      ]);
    });
  });

  describe('findComponentSelector', () => {
    function find(source: string, name: string, fileName = '/app/x.tsx') {
      const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
      return findComponentSelector(sf, name);
    }

    it('should find TSX component selectors', () => {
      expect(
        find(CORE_IMPORTS + `export const A = component({selector: 'a-b'}, () => <p/>);`, 'A'),
      ).toBe('a-b');
      expect(find(CORE_IMPORTS + `export const MyCard = component(() => <p/>);`, 'MyCard')).toBe(
        'ng-tsx-my-card',
      );
    });

    it('should find decorated class selectors', () => {
      expect(
        find(
          `import {Component} from '@angular/core'; @Component({selector: 'x-y', template: ''}) export class Y {}`,
          'Y',
          '/app/y.ts',
        ),
      ).toBe('x-y');
    });

    it('should find selectors in compiled declarations', () => {
      expect(
        find(
          `import * as i0 from '@angular/core';
           export declare class Z {
             static ɵcmp: i0.ɵɵComponentDeclaration<Z, "z-z, [z]", never, {}, {}, never, never, true, never>;
           }`,
          'Z',
          '/app/z.d.ts',
        ),
      ).toBe('z-z, [z]');
    });

    it('should return undefined for unknown names', () => {
      expect(find(`export const Q = 1;`, 'Q')).toBeUndefined();
    });
  });
});

# Experimental: TSX function components

Status: **spike**, behind the internal `_experimentalTsxComponents` compiler option.

The goal is Solid's authoring shape with Angular's vocabulary. A component is a function that runs
**once** per instance, keeps state in local signals, and returns TSX. Everything else is already
Angular: `input()`, `output()`, `model()`, `inject()`, `computed()`, `effect()`, `viewChild()`,
`DestroyRef`, block control flow, `<ng-content>`, selectors and providers. The output is an
ordinary Ivy component, so DI, zoneless change detection, hydration, HMR, devtools and `TestBed`
are unchanged.

Rule of thumb: **if an Angular concept already exists, the TSX form is a direct spelling of it.**

```tsx
import {component, input, model, output, signal, computed, inject} from '@angular/core';

export const Counter = component({selector: 'app-counter'}, () => {
  const initial = input.required<number>(); // the const name is the property name
  const step = model(1);
  const changed = output<number>();

  const logger = inject(Logger); // the body runs in the injection context
  const count = signal(0);
  const total = computed(() => initial() + count());

  const increment = () => {
    count.update((c) => c + step());
    changed.emit(total());
  };

  return <button on:click={increment}>Count: {total()}</button>;
});
```

Consumed from TSX by reference (`<Counter initial={1} bind:step={step} on:changed={…} />`). From an
HTML template it's an ordinary component (`<app-counter [initial]="1" [(step)]="s" (changed)="…">`).

## Syntax

| Angular template                                            | TSX                                                                          |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `title="Hi"`                                                | `title="Hi"`                                                                 |
| `[value]="v()"`                                             | `value={v()}`                                                                |
| `(click)="f($event)"`                                       | `on:click={(e) => f(e)}`                                                     |
| `[(value)]="sig"`                                           | `bind:value={sig}`                                                           |
| `[attr.aria-label]="x"`                                     | `attr:aria-label={x}`                                                        |
| `[class.done]="d"`                                          | `class:done={d}`                                                             |
| `[style.width]="w"`                                         | `style:width={w}` (\*)                                                       |
| `#input`                                                    | `ref="input"`                                                                |
| `<ng-content select="x"/>`                                  | `<ng-content select="x" />`                                                  |
| `imports: [Dir]` + `<b dir>`                                | `<b use={[Dir]} dir>`                                                        |
| `@if (c; as v) {…} @else {…}`                               | `<If when={c} fallback={…}>{(v) => …}</If>`                                  |
| `@for (x of xs; track x.id; let i = $index) {…} @empty {…}` | `<For each={xs} track={(x) => x.id} empty={…}>{(x, {$index: i}) => …}</For>` |
| `@switch (v) { @case (a) {…} @default {…} }`                | `<Switch value={v}><Case value={a}>…</Case><Default>…</Default></Switch>`    |
| `@defer (on viewport) {…} @placeholder {…}`                 | `<Defer on="viewport" placeholder={…}>…</Defer>`                             |

Plain `c ? <A/> : <B/>` (including `else if` chains) and `c && <A/>` also lower to `@if`.

(\*) JSX attribute names can't contain `.`, so unit suffixes such as `[style.width.px]` aren't
expressible. Put the unit in the value instead.

`component(meta, fn)` accepts the same fields as `@Component`. `template`, `templateUrl`, `imports`
and `changeDetection` are rejected, because the lowering owns them, and the component is always
`OnPush`. Without a `selector`, the component gets `ng-tsx-<kebab-name>`.

Rules:

- `input()`, `model()`, `output()` and the query functions must be top-level `const`s in the body.
  This is the same rule as class field initializers.
- The body ends with a single `return <…/>`. Use `<If>`/`<Switch>` for branching.
- TSX may only appear in the returned tree, in control-flow slots and in render callbacks.
  `.map()` over TSX is rejected in favor of `<For>`.

## How it works

`NgCompilerHost.getSourceFile` runs `lowerTsxComponents` on `.tsx` files when the option is set.
Each `component(meta, fn)` is rewritten into a decorated class, so analysis, template
type-checking and Ivy codegen all run unchanged:

```ts
@Component({selector: 'app-counter', template: '<button (click)="$fc.b0($event)">Count: {{ $fc.b1() }}</button>', changeDetection: …})
export class Counter {
  readonly initial = input.required<number>();   // member APIs become real fields
  readonly step = model(1);
  readonly changed = output<number>();
  protected readonly $fc = (() => {               // the body, run once as a field initializer
    const initial = this.initial; const step = this.step; const changed = this.changed;
    const logger = inject(Logger);
    …
    const ɵb0 = ($event: any) => ((increment) as (e: any) => unknown)($event);
    const ɵb1 = () => (total());
    return {b0: ɵb0, b1: ɵb1};
  })();
}
```

Every dynamic TSX expression is hoisted into a closure inside the body. The template only calls
`$fc.bN(…)` and passes template-local variables as arguments, so TS scoping never reaches the
template pipeline. The closure parameters are typed from their source: `<For>` items as
`ɵngForItem<ReturnType<typeof ɵbEach>>`, `<If>` aliases as truthy-narrowed, and `$index` and the
other loop variables as `number`/`boolean`. As a result `strictTemplates` checks input types and
property access on loop items.

Component tags are resolved by reference. The host follows the import, including re-exports, and
reads the selector statically from `component({selector})`, from `@Component({selector})`, or from
a compiled `.d.ts` `ɵcmp` declaration.

## Source maps

The lowering records where every character of the generated file came from:

- **Copied code** (statements, `input()` initializers, binding expressions, metadata) maps
  one-to-one, so TypeScript errors such as a misspelled property land on the exact TSX token.
- **Synthesized code** (the class shell, hoisted closures, template markup) maps to the TSX node
  it was generated for. Template positions go through the JSON escaping of the inline template,
  so `strictTemplates` errors point at the JSX attribute or element that produced them.
- **Boilerplate** appended to the file (helper imports and types) has no mapping.

`NgCompilerHost` uses the map in three places:

1. `remapDiagnostics()` re-positions TypeScript and Angular diagnostics onto the original TSX,
   which is also used for the code frame.
2. `ngc`'s emit rewrites `.js.map` files and inline source maps so that they point at the `.tsx`.
   With `inlineSources`, `sourcesContent` holds the original TSX.
3. `getTsxSourceMap(fileName)` exposes it to hosts that run their own emit.

```
app.tsx:13:16 - error TS2322: Type 'string' is not assignable to type 'number'.

13       <Counter initial={"ten"} bind:step={step} on:changed={(v: number) => last.set(v)} />
                  ~~~~~~~~~~~~~~~
```

## Interop examples

A TSX component used from a class component's HTML template:

```ts
import {Component, signal} from '@angular/core';
import {Counter} from './counter'; // component({selector: 'app-counter'}, …)

@Component({
  selector: 'app-dashboard',
  imports: [Counter],
  template: `
    <app-counter [initial]="10" [(step)]="step" (changed)="onChanged($event)" />
    <p>step is {{ step() }}</p>
  `,
})
export class Dashboard {
  readonly step = signal(2);
  onChanged(total: number) {
    console.log(total);
  }
}
```

A class component, an attribute directive and a library component used from TSX:

```tsx
import {component, signal, For} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {Badge} from './badge'; // @Component({selector: 'app-badge'}) class Badge { label = input.required<string>() }

export const Toolbar = component(() => {
  const tags = signal(['new', 'sale']);
  const save = () => console.log('saved');
  return (
    <nav>
      <For each={tags()} track={(t) => t}>
        {(tag) => <Badge label={tag} />}
      </For>
      <button matButton use={[MatTooltip]} matTooltip="Save changes" on:click={save}>
        Save
      </button>
    </nav>
  );
});
```

`<MatButton>` also works as a tag: its selector, `button[matButton]`, is read from the library's
`.d.ts` and becomes `<button matButton>`.

Routing, dynamic creation and testing all take TSX components as ordinary component types:

```ts
export const routes: Routes = [{path: 'toolbar', component: Toolbar}];

const ref = createComponent(Counter, {
  environmentInjector,
  bindings: [inputBinding('initial', () => 5), outputBinding('changed', (v) => log(v))],
});

const fixture = TestBed.createComponent(Counter);
fixture.componentRef.setInput('initial', 3);
await fixture.whenStable();
```

Dependency injection is shared both ways. A service provided by a class component is visible to
TSX children through `inject()`, and `component({providers: […]})` provides to class-component
children:

```tsx
export const CartScope = component({providers: [CartStore]}, () => <ng-content />);

@Component({selector: 'cart-total', template: '{{ store.total() }}'})
export class CartTotal {
  protected readonly store = inject(CartStore); // provided by the TSX parent
}
```

## Known limitations of the spike

- **Hosts that emit on their own** (the Angular CLI's esbuild builder, Vite plugins, the
  source-to-source preprocessor) must compose source maps themselves with
  `getTsxSourceMap()` + `remapSourceMap`/`remapInlineSourceMap`. Only `ngc`'s emit does it today.
- **Template diagnostics are attribute-granular.** An error in a template binding points at the
  whole JSX attribute (`count={…}`), not just the expression.
- **No TSX type-checking in editors.** `@angular/core` doesn't ship a `JSX` namespace yet, so
  TypeScript itself doesn't check raw `.tsx` files in an IDE. The plan is
  `jsxImportSource: "@angular/core"` with `LibraryManagedAttributes` derived from
  `InputSignal`/`ModelSignal`/`OutputEmitterRef` members.
- **Incremental builds:** selectors of referenced components are read straight from disk. If a
  dependency's selector changes, dependents are not invalidated.
- **Free-variable detection is syntactic.** A callback parameter that shadows a template variable
  with the same name inside a binding is still passed as an argument. That is harmless but
  imprecise.
- **Default selectors can collide** when two selector-less components share a name.
- The long-term design lowers TSX directly to the R3 AST (`t.Node[]` → `ingestComponent`) and
  attaches traits to the `component()` call instead of a synthesized class. The source-to-source
  form was chosen for the spike because it reuses every existing compiler phase unchanged.

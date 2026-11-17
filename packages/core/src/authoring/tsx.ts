/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../interface/type';
import {Component} from '../metadata/directives';

/**
 * Metadata accepted by {@link component}. The same as `@Component`, minus the fields that a TSX
 * component derives from its body.
 *
 * @experimental
 */
export type TsxComponentMetadata = Omit<
  Component,
  'template' | 'templateUrl' | 'imports' | 'deferredImports' | 'changeDetection' | 'standalone'
>;

/**
 * Loop variables available as the second parameter of a {@link For} render callback.
 *
 * @experimental
 */
export interface TsxForContext {
  $index: number;
  $count: number;
  $first: boolean;
  $last: boolean;
  $even: boolean;
  $odd: boolean;
}

function notCompiled(name: string): Error {
  return new Error(
    `${name}() is compile-time syntax for TSX components and must be processed by the Angular ` +
      `compiler with the "_experimentalTsxComponents" option enabled.`,
  );
}

/**
 * Declares a component whose template is the TSX returned by `fn`.
 *
 * The function runs once per component instance, in an injection context. Declare inputs, outputs
 * and queries at its top level with `input()`, `model()`, `output()`, `viewChild()` and friends;
 * the constant's name becomes the property name, exactly as with a class field.
 *
 * ```tsx
 * export const Counter = component({selector: 'app-counter'}, () => {
 *   const step = input(1);
 *   const count = signal(0);
 *   return <button on:click={() => count.update((c) => c + step())}>{count()}</button>;
 * });
 * ```
 *
 * This is compile-time syntax: the Angular compiler rewrites it into a component class.
 *
 * @experimental
 */
export function component(fn: () => unknown): Type<unknown>;
export function component(meta: TsxComponentMetadata, fn: () => unknown): Type<unknown>;
export function component(): Type<unknown> {
  throw notCompiled('component');
}

/**
 * TSX spelling of `@if`. Renders its children, or the result of its render callback, when
 * `when` is truthy, and `fallback` otherwise.
 *
 * @experimental
 */
export function If<T>(props: {
  when: T;
  fallback?: unknown;
  children?: unknown | ((value: NonNullable<T>) => unknown);
}): never {
  throw notCompiled('If');
}

/**
 * TSX spelling of `@for`. `track` is required, as it is for `@for`.
 *
 * @experimental
 */
export function For<T>(props: {
  each: Iterable<T> | null | undefined;
  track: (item: T) => unknown;
  empty?: unknown;
  children: (item: T, context: TsxForContext) => unknown;
}): never {
  throw notCompiled('For');
}

/**
 * TSX spelling of `@switch`. May only contain {@link Case} and {@link Default}.
 *
 * @experimental
 */
export function Switch<T>(props: {value: T; children?: unknown}): never {
  throw notCompiled('Switch');
}

/**
 * TSX spelling of `@case`.
 *
 * @experimental
 */
export function Case(props: {value: unknown; children?: unknown}): never {
  throw notCompiled('Case');
}

/**
 * TSX spelling of `@default`.
 *
 * @experimental
 */
export function Default(props: {children?: unknown}): never {
  throw notCompiled('Default');
}

/**
 * TSX spelling of `@defer`. `on` takes the same triggers as `@defer (on …)`.
 *
 * @experimental
 */
export function Defer(props: {
  on?: string | string[];
  when?: unknown;
  placeholder?: unknown;
  loading?: unknown;
  error?: unknown;
  children?: unknown;
}): never {
  throw notCompiled('Defer');
}

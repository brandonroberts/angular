/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

/** The source text a diagnostic points at. */
function spanText(diag: ts.Diagnostic): string {
  return diag.file!.text.slice(diag.start!, diag.start! + diag.length!);
}

runInEachFileSystem(() => {
  describe('experimental TSX components', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig(
        {_experimentalTsxComponents: true, strictTemplates: true},
        // No JSX survives the lowering; `react-jsx` just keeps the output extension `.js`.
        {jsx: 'react-jsx'},
      );
    });

    it('should compile a TSX component to an Ivy component definition', () => {
      env.write(
        'counter.tsx',
        `
        import {component, input, model, output, signal} from '@angular/core';

        export const Counter = component({selector: 'app-counter'}, () => {
          const initial = input.required<number>();
          const step = model(1);
          const changed = output<number>();
          const count = signal(0);
          const inc = () => {
            count.update((c) => c + step());
            changed.emit(count());
          };
          return <button on:click={inc}>{initial() + count()}</button>;
        });
      `,
      );

      env.driveMain();
      const js = env.getContents('counter.js');
      expect(js).toContain('class Counter');
      expect(js).toContain('selectors: [["app-counter"]]');
      expect(js).toContain('inputs: { initial: [1, "initial"], step: [1, "step"] }');
      expect(js).toContain('outputs: { step: "stepChange", changed: "changed" }');
      expect(js).toContain('return ctx.$fc.b0($event);');
      expect(js).toContain('ctx.$fc.b1()');
    });

    it('should resolve component tags across files, including class components', () => {
      env.write(
        'badge.ts',
        `
        import {Component, input} from '@angular/core';

        @Component({selector: 'app-badge', template: '{{ label() }}'})
        export class Badge {
          readonly label = input.required<string>();
        }
      `,
      );
      env.write(
        'card.tsx',
        `
        import {component, input} from '@angular/core';
        export const Card = component(() => {
          const title = input('');
          return <section><h2>{title()}</h2><ng-content /></section>;
        });
      `,
      );
      env.write(
        'index.ts',
        `
        export {Card} from './card';
      `,
      );
      env.write(
        'app.tsx',
        `
        import {component, signal, For} from '@angular/core';
        import {Badge} from './badge';
        import {Card} from './index';

        export const App = component({selector: 'app-root'}, () => {
          const items = signal([{id: 1, name: 'a'}]);
          return (
            <Card title="Items">
              <For each={items()} track={(i) => i.id}>
                {(item) => <Badge label={item.name} />}
              </For>
            </Card>
          );
        });
      `,
      );

      env.driveMain();
      const js = env.getContents('app.js');
      expect(js).toContain('"ng-tsx-card"');
      expect(js).toContain('"app-badge"');
      expect(js).toMatch(/dependencies: \[[^\]]*\bCard\b/);
      expect(js).toMatch(/dependencies: \[[^\]]*\bBadge\b/);
    });

    it('should type-check the generated template', () => {
      env.write(
        'app.tsx',
        `
        import {component, input} from '@angular/core';

        const Child = component(() => {
          const count = input.required<number>();
          return <p>{count()}</p>;
        });

        export const App = component(() => <Child count={'not a number'} />);
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toContain(
        `Type 'string' is not assignable to type 'number'`,
      );
      // Reported against the original TSX, on the attribute that produced the binding.
      expect(spanText(diags[0])).toBe(`count={'not a number'}`);
    });

    it('should type-check expressions that use loop variables', () => {
      env.write(
        'app.tsx',
        `
        import {component, signal, For} from '@angular/core';

        export const App = component(() => {
          const todos = signal([{id: 1, title: 'a'}]);
          return (
            <For each={todos()} track={(t) => t.id}>
              {(todo) => <li>{todo.titel}</li>}
            </For>
          );
        });
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(ts.flattenDiagnosticMessageText(diags[0].messageText, '\n')).toContain(
        `Property 'titel' does not exist`,
      );
      expect(spanText(diags[0])).toBe('titel');
      expect(diags[0].file!.text).toContain('<For each={todos()}');
    });

    it('should emit source maps that point at the original TSX', () => {
      env.tsconfig(
        {_experimentalTsxComponents: true, strictTemplates: true},
        {jsx: 'react-jsx', sourceMap: true, inlineSources: true},
      );
      const source = `
        import {component, signal} from '@angular/core';

        export const App = component(() => {
          const count = signal(0);
          return <button on:click={() => count.update((c) => c + 1)}>{count()}</button>;
        });
      `;
      env.write('app.tsx', source);

      env.driveMain();
      const map = JSON.parse(env.getContents('app.js.map'));
      expect(map.sourcesContent).toEqual([source]);
    });

    it('should report TSX that cannot be lowered', () => {
      env.write(
        'app.tsx',
        `
        import {component} from '@angular/core';

        export const App = component(() => <ul>{[1, 2].map((n) => <li>{n}</li>)}</ul>);
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].code).toBe(ngErrorCode(ErrorCode.TSX_COMPONENT_INVALID));
      expect(diags[0].messageText).toContain('Use <For each={…} track={…}>');
    });
  });
});

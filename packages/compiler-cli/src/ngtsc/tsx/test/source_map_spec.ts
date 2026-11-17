/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {decode} from '@jridgewell/sourcemap-codec';
import ts from 'typescript';

import {
  lowerTsxComponents,
  remapInlineSourceMap,
  remapSourceMap,
  TsxLoweringResult,
} from '../index';

const SOURCE = `import {component, input, signal, For} from '@angular/core';

export const Counter = component({selector: 'app-counter'}, () => {
  const step = input(1);
  const items = signal([{id: 1, name: 'a'}]);
  const count = signal(0);
  return (
    <div>
      <button on:click={() => count.update((c) => c + step())}>{count()}</button>
      <For each={items()} track={(i) => i.id}>
        {(item) => <li title={item.name}>{item.name.toUpperCase()}</li>}
      </For>
    </div>
  );
});

export const after = 'untouched';
`;

function lower(): TsxLoweringResult {
  const sf = ts.createSourceFile(
    '/app/counter.tsx',
    SOURCE,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  return lowerTsxComponents(sf, {resolveSelector: () => null})!;
}

/** Offset of the `n`th occurrence of `needle` in `text`. */
function offsetOf(text: string, needle: string, n = 0): number {
  let pos = -1;
  for (let i = 0; i <= n; i++) {
    pos = text.indexOf(needle, pos + 1);
    expect(pos).withContext(`'${needle}' #${i}`).not.toBe(-1);
  }
  return pos;
}

describe('TSX source maps', () => {
  it('should map hoisted expressions back to the TSX exactly', () => {
    const {text, sourceMap} = lower();
    // `item.name.toUpperCase()` appears in the lowered file inside a hoisted closure.
    const generated = offsetOf(text, 'item.name.toUpperCase()');
    expect(sourceMap.toOriginalSpan(generated + 'item.'.length, 'name'.length)).toEqual({
      start: offsetOf(SOURCE, 'item.name.toUpperCase()') + 'item.'.length,
      length: 'name'.length,
    });
  });

  it('should map lifted members and statements exactly', () => {
    const {text, sourceMap} = lower();
    expect(sourceMap.toOriginalOffset(offsetOf(text, 'input(1)'))).toBe(
      offsetOf(SOURCE, 'input(1)'),
    );
    expect(sourceMap.toOriginalOffset(offsetOf(text, 'signal(0)'))).toBe(
      offsetOf(SOURCE, 'signal(0)'),
    );
  });

  it('should map template bindings to the TSX expression they came from', () => {
    const {text, sourceMap} = lower();
    // The interpolation `{{ $fc.bN() }}` for `{count()}` inside the template string literal.
    const templateStart = offsetOf(text, 'template: "');
    const call = text.indexOf('{{ $fc.', templateStart) + '{{ '.length;
    const original = offsetOf(SOURCE, 'count()}</button>');
    expect(sourceMap.toOriginalSpan(call, 8)).toEqual({start: original, length: 'count()'.length});
  });

  it('should map template attribute bindings through JSON escaping', () => {
    const {text, sourceMap} = lower();
    // `[title]=\"$fc.bN(item)\"` — the quotes are escaped in the literal, shifting offsets.
    const call = offsetOf(text, '[title]=\\"') + '[title]=\\"'.length;
    expect(sourceMap.toOriginalSpan(call, 4)).toEqual({
      start: offsetOf(SOURCE, 'item.name}'),
      length: 'item.name'.length,
    });
  });

  it('should map synthesized element markup to the JSX element', () => {
    const {text, sourceMap} = lower();
    const li = offsetOf(text, '<li ');
    const originalLi = offsetOf(SOURCE, '<li ');
    const span = sourceMap.toOriginalSpan(li, 3)!;
    expect(span.start).toBe(originalLi);
    expect(SOURCE.slice(span.start, span.start + span.length)).toBe('<li title={item.name}>');
  });

  it('should map code outside of components by offset', () => {
    const {text, sourceMap} = lower();
    expect(sourceMap.toOriginalSpan(offsetOf(text, `'untouched'`), 11)).toEqual({
      start: offsetOf(SOURCE, `'untouched'`),
      length: 11,
    });
    expect(sourceMap.toOriginalOffset(0)).toBe(0);
  });

  it('should not map appended boilerplate', () => {
    const {text, sourceMap} = lower();
    expect(sourceMap.toOriginalOffset(offsetOf(text, 'ChangeDetectionStrategy as'))).toBeNull();
  });

  describe('emitted source maps', () => {
    function transpile(inline: boolean): {code: string; map: string | undefined} {
      const {text} = lower();
      const out = ts.transpileModule(text, {
        fileName: '/app/counter.tsx',
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ES2022,
          jsx: ts.JsxEmit.Preserve,
          sourceMap: !inline,
          inlineSourceMap: inline,
          inlineSources: true,
          experimentalDecorators: true,
        },
      });
      return {code: out.outputText, map: out.sourceMapText};
    }

    /** The original line/column that the generated position of `needle` maps to. */
    function originalOf(code: string, mapJson: string, needle: string) {
      const raw = JSON.parse(mapJson);
      const pos = offsetOf(code, needle);
      const line = code.slice(0, pos).split('\n').length - 1;
      const column = pos - (code.lastIndexOf('\n', pos - 1) + 1);
      const segments = decode(raw.mappings)[line];
      // The last segment at or before the column.
      const seg = segments.filter((s) => s[0] <= column).pop()!;
      return {line: seg[2], column: seg[3], content: raw.sourcesContent?.[0]};
    }

    function lineColOf(text: string, needle: string) {
      const pos = offsetOf(text, needle);
      return {
        line: text.slice(0, pos).split('\n').length - 1,
        column: pos - (text.lastIndexOf('\n', pos - 1) + 1),
      };
    }

    it('should point emitted code at the original TSX', () => {
      const {code, map} = transpile(false);
      const remapped = remapSourceMap(map!, lower().sourceMap);
      const mapped = originalOf(code, remapped, 'item.name.toUpperCase()');
      expect({line: mapped.line, column: mapped.column}).toEqual(
        lineColOf(SOURCE, 'item.name.toUpperCase()'),
      );
      expect(mapped.content).toBe(SOURCE);
    });

    it('should rewrite inline source maps', () => {
      const {code} = transpile(true);
      const remapped = remapInlineSourceMap(code, lower().sourceMap);
      const match = /base64,([A-Za-z0-9+/=]+)\s*$/.exec(remapped)!;
      const json = Buffer.from(match[1], 'base64').toString('utf8');
      const body = remapped.slice(0, remapped.indexOf('//# sourceMappingURL'));
      const mapped = originalOf(body, json, 'signal(0)');
      expect({line: mapped.line, column: mapped.column}).toEqual(lineColOf(SOURCE, 'signal(0)'));
      expect(mapped.content).toBe(SOURCE);
    });
  });
});

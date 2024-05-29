/**
 * @file Test sequence generator
 *
 * @module dnd/sequenceGenerator.test
 */
/**
 * license {@link https://opensource.org/license/mit/|MIT}
 * Copyright 2024 Steve Butler (henspace.com).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the “Software”), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

import { test, expect } from '@jest/globals';
import { createSequence } from './sequenceGenerator.js';

test('createSequence: defaults', () => {
  const result = createSequence();
  expect(result).toEqual({
    sequence: 'BCD',
    next: 'A',
  });
});

test('createSequence: simple', () => {
  const options = {
    runes: '1234',
    repetitions: 4,
    sequences: 4,
    sequenceOffsets: [1],
    startOffset: 0,
    nextLength: 1,
  };
  const result = createSequence(options);
  expect(result).toEqual({
    sequence: '222233334444111',
    next: '1',
  });
});

test('createSequence: triple', () => {
  const options = {
    runes: '1234',
    repetitions: 5,
    sequences: 4,
    sequenceOffsets: [1, 2, 3],
    startOffset: 3,
    nextLength: 4,
  };
  const result = createSequence(options);
  expect(result).toEqual({
    sequence: '1233242232114444',
    next: '1233',
  });
});

test('createSequence: clip next length', () => {
  const options = {
    runes: 'ABCDEF',
    repetitions: 10,
    sequences: 6,
    sequenceOffsets: [1],
    startOffset: 0,
    nextLength: 100, // should be clipped to ensure 3 reps of sequence retained
  };
  const result = createSequence(options);
  const sequences = options.runes.length;
  expect(result.next).toHaveLength(
    options.repetitions * sequences - 3 * sequences
  );
});

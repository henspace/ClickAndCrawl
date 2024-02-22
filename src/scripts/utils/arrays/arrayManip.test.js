/**
 * @file Test array functions
 *
 * @module utils/arrays/arrayManip.test
 *
 * License {@link https://opensource.org/license/mit/|MIT}
 *
 * Copyright 2024 Steve Butler
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
import { getSurrounds } from './arrayManip.js';

test('Test surrounds', () => {
  const matrix = [
    ['A', 'B', 'C', 'D'],
    ['E', 'F', 'G', 'H'],
    ['I', 'J', 'K', 'L'],
    ['M', 'N', 'O', 'P'],
  ];

  let surrounds = getSurrounds(matrix, 1, 2);
  expect(matrix[1][2]).toBe('G');
  expect(surrounds.tl).toBe('B');
  expect(surrounds.above).toBe('C');
  expect(surrounds.tr).toBe('D');
  expect(surrounds.right).toBe('H');
  expect(surrounds.br).toBe('L');
  expect(surrounds.below).toBe('K');
  expect(surrounds.bl).toBe('J');
  expect(surrounds.left).toBe('F');
});

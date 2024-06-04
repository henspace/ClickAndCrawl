/**
 * @file Test array functions
 *
 * @module utils/arrays/arrayManip.test
 */
/**
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
import { getSurrounds, radiate } from './arrayManip.js';

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

test('Test radiate: radius 1', () => {
  const matrix = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y'],
  ];

  let result = radiate(matrix, {
    columnIndex: 2,
    rowIndex: 2,
    distance: 1,
  });
  const expectedMatrix = [
    ['G', 'H', 'I'],
    ['L', 'N'],
    ['Q', 'R', 'S'],
  ];
  const expectedEntries = expectedMatrix.flat();
  expect(result).toHaveLength(expectedEntries.length);
  for (const expected of expectedEntries) {
    expect(result).toContain(expected);
  }
});

test('Test radiate: radius 2', () => {
  const matrix = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y'],
  ];

  let result = radiate(matrix, {
    columnIndex: 2,
    rowIndex: 2,
    distance: 2,
  });
  const expectedMatrix = [
    ['B', 'C', 'D'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['V', 'W', 'X'],
  ];
  const expectedEntries = expectedMatrix.flat();
  expect(result).toHaveLength(expectedEntries.length);
  for (const expected of expectedEntries) {
    expect(result).toContain(expected);
  }
});

test('Test radiate: radius 2 and filter', () => {
  const matrix = [
    ['A', 'B', 'C', 'D', 'E'],
    ['F', 'G', 'H', 'I', 'J'],
    ['K', 'L', 'M', 'N', 'O'],
    ['P', 'Q', 'R', 'S', 'T'],
    ['U', 'V', 'W', 'X', 'Y'],
  ];

  let result = radiate(matrix, {
    columnIndex: 2,
    rowIndex: 2,
    distance: 2,
    filter: (entry) => entry !== 'H' && entry !== 'S' && entry !== 'F',
  });
  const expectedMatrix = [
    ['B', 'D'],
    ['G', 'I', 'J'],
    ['K', 'L', 'N', 'O'],
    ['P', 'Q', 'R', 'T'],
    ['V', 'W'],
  ];
  const expectedEntries = expectedMatrix.flat();
  expect(result).toHaveLength(expectedEntries.length);
  for (const expected of expectedEntries) {
    expect(result).toContain(expected);
  }
});

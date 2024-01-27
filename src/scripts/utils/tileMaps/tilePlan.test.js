/**
 * @file Test tile plan
 *
 * @module utils/tileMaps/tilePlan.test
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
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
import { generateTileMapPlan } from './tilePlan.js';

const map = new Map([
  [' ', undefined],
  ['#-TL', 'top left corner'],
  ['#-TR', 'top right corner'],
  ['#-BR', 'bottom right corner'],
  ['#-BL', 'bottom left corner'],

  ['#-TLI', 'bottom left corner inverted'],
  ['#-TRI', 'top right corner inverted'],
  ['#-BRI', 'bottom right corner inverted'],
  ['#-BLI', 'bottom left corner inverted'],

  ['#-L', 'wall left'],
  ['#-R', 'wall right'],
  ['#-T', 'wall top'],
  ['#-B', 'wall bottom'],

  ['--L', 'door left'],
  ['--R', 'door right'],
  ['--T', 'door top'],
  ['--B', 'door bottom'],

  ['.', 'floor'],
]);

test('Test plan from design', () => {
  const design = ['###', '#.#', '###'];

  const expectations = [
    [map.get('#-TL'), map.get('#-T'), map.get('#-TR')],
    [map.get('#-L'), map.get('.'), map.get('#-R')],
    [map.get('#-BL'), map.get('#-B'), map.get('#-BR')],
  ];

  const plan = generateTileMapPlan(design, map);
  expect(plan).toHaveLength(expectations.length);
  expectations.forEach((rowValue, rowIndex) => {
    rowValue.forEach((colValue, colIndex) => {
      expect(plan[rowIndex][colIndex]).toBe(colValue);
    });
  });
});

test('Test plan doors from design', () => {
  const design = ['#-#', '-.-', '#-#'];

  const expectations = [
    [map.get('#-TL'), map.get('--T'), map.get('#-TR')],
    [map.get('--L'), map.get('.'), map.get('--R')],
    [map.get('#-BL'), map.get('--B'), map.get('#-BR')],
  ];

  const plan = generateTileMapPlan(design, map);
  expect(plan).toHaveLength(expectations.length);
  expectations.forEach((rowValue, rowIndex) => {
    rowValue.forEach((colValue, colIndex) => {
      expect(plan[rowIndex][colIndex]).toBe(colValue);
    });
  });
});

test('Test plan from design with internal corners', () => {
  const design = ['######', '#....#', '###.##', '  #.# ', '  ### '];

  const expectations = [
    [
      map.get('#-TL'),
      map.get('#-T'),
      map.get('#-T'),
      map.get('#-T'),
      map.get('#-T'),
      map.get('#-TR'),
    ],
    [
      map.get('#-L'),
      map.get('.'),
      map.get('.'),
      map.get('.'),
      map.get('.'),
      map.get('#-R'),
    ],
    [
      map.get('#-BL'),
      map.get('#-B'),
      map.get('#-TRI'),
      map.get('.'),
      map.get('#-TLI'),
      map.get('#-BR'),
    ],
    [
      map.get(' '),
      map.get(' '),
      map.get('#-L'),
      map.get('.'),
      map.get('#-R'),
      map.get(' '),
    ],
    [
      map.get(' '),
      map.get(' '),
      map.get('#-BL'),
      map.get('#-B'),
      map.get('#-BR'),
      map.get(' '),
    ],
  ];

  const plan = generateTileMapPlan(design, map);
  expect(plan).toHaveLength(expectations.length);
  expectations.forEach((rowValue, rowIndex) => {
    rowValue.forEach((colValue, colIndex) => {
      expect(plan[rowIndex][colIndex]).toBe(colValue);
    });
  });
});

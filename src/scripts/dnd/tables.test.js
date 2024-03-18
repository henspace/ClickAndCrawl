/**
 * @file Test table
 *
 * @module dnd/tables.test
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
import * as tables from './tables.js';

test('test table entries', () => {
  const testTable = [
    { cr: 0, xp: 10 },
    { cr: 1 / 8, xp: 25 },
    { cr: 1 / 4, xp: 50 },
    { cr: 1 / 2, xp: 100 },
    { cr: 1, xp: 200 },
    { cr: 2, xp: 450 },
    { cr: 3, xp: 700 },
    { cr: 4, xp: 1100 },
    { cr: 5, xp: 1800 },
    { cr: 6, xp: 2300 },
    { cr: 7, xp: 2900 },
    { cr: 8, xp: 3900 },
    { cr: 9, xp: 5000 },
    { cr: 10, xp: 5900 },
    { cr: 11, xp: 7200 },
    { cr: 12, xp: 8400 },
    { cr: 13, xp: 10000 },
    { cr: 14, xp: 11500 },
    { cr: 15, xp: 13000 },
    { cr: 16, xp: 15000 },
    { cr: 17, xp: 18000 },
    { cr: 18, xp: 20000 },
    { cr: 19, xp: 22000 },
    { cr: 20, xp: 25000 },
    { cr: 21, xp: 33000 },
    { cr: 22, xp: 41000 },
    { cr: 23, xp: 50000 },
    { cr: 24, xp: 62000 },
    { cr: 25, xp: 75000 },
    { cr: 26, xp: 90000 },
    { cr: 27, xp: 105000 },
    { cr: 28, xp: 120000 },
    { cr: 29, xp: 135000 },
    { cr: 30, xp: 155000 },

    { cr: 100, xp: 155000 },
    { cr: '28', xp: 120000 },
  ];
  testTable.forEach((entry) => {
    expect(tables.getXpFromCr(entry.cr)).toBe(entry.xp);
  });
});

test('Get level and prof bonus', () => {
  const testTable = [
    { exp: 0, level: 1, profBonus: 2 },
    { exp: 149, level: 1, profBonus: 2 },

    { exp: 150, level: 1, profBonus: 2 },
    { exp: 299, level: 1, profBonus: 2 },

    { exp: 300, level: 2, profBonus: 2 },
    { exp: 899, level: 2, profBonus: 2 },

    { exp: 900, level: 3, profBonus: 2 },
    { exp: 2699, level: 3, profBonus: 2 },

    { exp: 2700, level: 4, profBonus: 2 },
    { exp: 6499, level: 4, profBonus: 2 },

    { exp: 6500, level: 5, profBonus: 3 },
    { exp: 13999, level: 5, profBonus: 3 },

    { exp: 14000, level: 6, profBonus: 3 },
    { exp: 22999, level: 6, profBonus: 3 },

    { exp: 23000, level: 7, profBonus: 3 },
    { exp: 33999, level: 7, profBonus: 3 },

    { exp: 34000, level: 8, profBonus: 3 },
    { exp: 47999, level: 8, profBonus: 3 },

    { exp: 48000, level: 9, profBonus: 4 },
    { exp: 63999, level: 9, profBonus: 4 },

    { exp: 64000, level: 10, profBonus: 4 },
    { exp: 84999, level: 10, profBonus: 4 },

    { exp: 85000, level: 11, profBonus: 4 },
    { exp: 99999, level: 11, profBonus: 4 },

    { exp: 100000, level: 12, profBonus: 4 },
    { exp: 119999, level: 12, profBonus: 4 },

    { exp: 120000, level: 13, profBonus: 5 },
    { exp: 139999, level: 13, profBonus: 5 },

    { exp: 140000, level: 14, profBonus: 5 },
    { exp: 164999, level: 14, profBonus: 5 },

    { exp: 165000, level: 15, profBonus: 5 },
    { exp: 194999, level: 15, profBonus: 5 },

    { exp: 195000, level: 16, profBonus: 5 },
    { exp: 224999, level: 16, profBonus: 5 },

    { exp: 225000, level: 17, profBonus: 6 },
    { exp: 264999, level: 17, profBonus: 6 },

    { exp: 265000, level: 18, profBonus: 6 },
    { exp: 304999, level: 18, profBonus: 6 },

    { exp: 305000, level: 19, profBonus: 6 },
    { exp: 354999, level: 19, profBonus: 6 },

    { exp: 355000, level: 20, profBonus: 6 },
    { exp: 999999, level: 20, profBonus: 6 },
  ];

  testTable.forEach((entry) => {
    console.log(`Test ${entry.exp}`);
    const result = tables.getLevelAndProfBonusFromExp(entry.exp);
    expect(result.level).toEqual(entry.level);
    expect(result.profBonus).toEqual(entry.profBonus);
  });
});

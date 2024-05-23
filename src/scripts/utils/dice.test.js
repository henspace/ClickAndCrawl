/**
 * @file Test dice
 *
 * @module utils/dice.test
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
import * as dice from './dice.js';

test('rollDice', () => {
  testRoll(6);
  testRoll(20);
});

test('rollMultiDice', () => {
  testMultiDiceRoll('1D6', 1, 6);
  testMultiDiceRoll('3D20', 3, 60);
  testMultiDiceRoll('2D8 + 10', 12, 36);
  expect(dice.rollMultiDice('6D1 + 30')).toEqual(36);
  expect(dice.rollMultiDice('6D1 - 5')).toEqual(1);
  expect(dice.rollMultiDice('6D1 -5')).toEqual(1);
  expect(dice.rollMultiDice('6D1- 5')).toEqual(1);
  expect(dice.rollMultiDice('6D1-5')).toEqual(1);
  expect(dice.rollMultiDice('6D1 - 10')).toEqual(-4);
});

function testRoll(sides) {
  let rolls = 1000;
  const expectedMin = 1;
  const expectedMax = sides;
  const expectedAverage = (expectedMax - expectedMin) / rolls;

  let min = Number.MAX_SAFE_INTEGER;
  let max = 0;
  for (let n = 0; n < rolls; n++) {
    const result = dice.rollDice(sides);
    console.log(`Rolled ${result}`);
    min = Math.min(min, result);
    max = Math.max(max, result);
  }
  expect(min).not.toEqual(max);
  expect((max - min) / rolls).toBeCloseTo(expectedAverage);
  expect(min).toBeGreaterThanOrEqual(expectedMin);
  expect(max).toBeLessThanOrEqual(expectedMax);
}

function testMultiDiceRoll(diceDefn, expectedMin, expectedMax) {
  let rolls = 1000;
  const expectedAverage = (expectedMax - expectedMin) / rolls;

  let min = Number.MAX_SAFE_INTEGER;
  let max = 0;
  for (let n = 0; n < rolls; n++) {
    const result = dice.rollMultiDice(diceDefn);
    console.log(`Rolled ${result}`);
    min = Math.min(min, result);
    max = Math.max(max, result);
  }
  expect(min).not.toEqual(max);
  expect((max - min) / rolls).toBeCloseTo(expectedAverage, 0);
  expect(min).toBeGreaterThanOrEqual(expectedMin);
  expect(max).toBeLessThanOrEqual(expectedMax);
}

test('isMultiDice', () => {
  expect(dice.isMultiDice('1d6')).toBe(true);
  expect(dice.isMultiDice('12d60')).toBe(true);
  expect(dice.isMultiDice('1d6 + 18')).toBe(true);
  expect(dice.isMultiDice('1d6+18')).toBe(true);
  expect(dice.isMultiDice('6')).toBe(false);
  expect(dice.isMultiDice(20)).toBe(false);
  expect(dice.isMultiDice('D7')).toBe(false);
});

test('maxRoll', () => {
  expect(dice.maxRoll('1D6')).toBe(6);
  expect(dice.maxRoll('20D12')).toBe(240);
  expect(dice.maxRoll('3D8 + 20')).toBe(84);
});

test('biggestMultiDice', () => {
  expect(dice.biggestMultiDice('2D8', '2D9')).toBe('2D9');
  expect(dice.biggestMultiDice('2D9', '2D8')).toBe('2D9');
  expect(dice.biggestMultiDice('3D7', '1D20')).toBe('3D7');
  expect(dice.biggestMultiDice('3D7', '1D20+2')).toBe('1D20+2');
});

test('changeQtyOfDice', () => {
  expect(dice.changeQtyOfDice('3D20', 6)).toBe('9D20');
  expect(dice.changeQtyOfDice('3D20', -2)).toBe('1D20');
  expect(dice.changeQtyOfDice('3D20', -6)).toBe('0D20');
  expect(dice.changeQtyOfDice('3D20 + 12', 2)).toBe('5D20+12');
});

test('getDiceDetails', () => {
  expect(dice.getDiceDetails('5D18')).toEqual({ qty: 5, sides: 18, offset: 0 });
  expect(dice.getDiceDetails('15D10')).toEqual({
    qty: 15,
    sides: 10,
    offset: 0,
  });
  expect(dice.getDiceDetails('15D10')).toEqual({
    qty: 15,
    sides: 10,
    offset: 0,
  });
  expect(dice.getDiceDetails('15D10 + 32')).toEqual({
    qty: 15,
    sides: 10,
    offset: 32,
  });
  expect(dice.getDiceDetails('15X10')).toEqual({
    qty: 0,
    sides: 0,
    offset: 0,
  });
});

test('getDiceDetailsAsString', () => {
  expect(dice.getDiceDetailsAsString({ qty: 3, sides: 16 })).toBe('3D16');
  expect(dice.getDiceDetailsAsString({ qty: 4, sides: 20, offset: 0 })).toBe(
    '4D20'
  );
  expect(dice.getDiceDetailsAsString({ qty: 6, sides: 8, offset: 10 })).toBe(
    '6D8+10'
  );
});

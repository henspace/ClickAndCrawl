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
  testMultiDiceRoll('2D8 + 10', 12, 26);
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
  expect((max - min) / rolls).toBeCloseTo(expectedAverage);
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
  expect(dice.maxRoll('3D8 + 20')).toBe(44);
});

test('biggestMultiDice', () => {
  expect(dice.biggestMultiDice('2D8', '2D9')).toBe('2D9');
  expect(dice.biggestMultiDice('2D9', '2D8')).toBe('2D9');
  expect(dice.biggestMultiDice('3D7', '1D20')).toBe('3D7');
  expect(dice.biggestMultiDice('3D7', '1D20+2')).toBe('1D20+2');
});

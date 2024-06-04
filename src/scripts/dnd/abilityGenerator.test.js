/**
 * @file Test ability generator
 *
 * @module dnd/abilityGenerator.test
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

import * as generator from './abilityGenerator.js';

/**
 * Array of ability value ranges. The first element is used for the first ability
 * @type {Array.Array<min:number, max:number>}
 */
const EXPECTED_TRAIT_RANGE = [
  [13, 15],
  [12, 14],
  [11, 13],
  [8, 13],
  [8, 13],
  [8, 13],
];

/**
 * @type {Array.Array<min:number, max:number>}
 */
const EXPECTED_DEFAULT_RANGE = [8, 15];

test('getClassAbilities FIGHTER', () => {
  const expectedOrder = ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'];
  for (let n = 0; n < 20; n++) {
    const abilities = generator.getClassAbilities('FIGHTER');
    expect(abilities.size).toBe(expectedOrder.length);
    for (let index = 0; index < expectedOrder.length; index++) {
      expect(abilities.get(expectedOrder[index])).toBeGreaterThanOrEqual(
        EXPECTED_TRAIT_RANGE[index][0]
      );
      expect(abilities.get(expectedOrder[index])).toBeLessThanOrEqual(
        EXPECTED_TRAIT_RANGE[index][1]
      );
    }
  }
});

test('getClassAbilities UNKNOWN', () => {
  const expectedOrder = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  for (let n = 0; n < 20; n++) {
    const abilities = generator.getClassAbilities('UNKNOWN');
    expect(abilities.size).toBe(expectedOrder.length);
    for (let index = 0; index < expectedOrder.length; index++) {
      expect(abilities.get(expectedOrder[index])).toBeGreaterThanOrEqual(
        EXPECTED_DEFAULT_RANGE[0]
      );
      expect(abilities.get(expectedOrder[index])).toBeLessThanOrEqual(
        EXPECTED_DEFAULT_RANGE[1]
      );
    }
  }
});

test('getAttackModifiers', () => {
  expect(generator.getAttackModifiers('ROGUE')).toEqual({ pbMultiplier: 2 });
  expect(generator.getAttackModifiers('UNKNOWN')).toEqual({ pbMultiplier: 1 });
});

test('getTraitAdjustmentDetails', () => {
  expect(generator.getTraitAdjustmentDetails('UNKNOWN')).toEqual({
    levels: [],
    traits: ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA'],
    gainPerAdjustment: 2,
    maxAbility: 20,
  });

  expect(generator.getTraitAdjustmentDetails('ROGUE')).toEqual({
    levels: [4, 8, 10, 12, 16, 19],
    traits: ['DEX', 'INT', 'CHA', 'STR', 'CON', 'WIS'],
    gainPerAdjustment: 2,
    maxAbility: 20,
  });
});

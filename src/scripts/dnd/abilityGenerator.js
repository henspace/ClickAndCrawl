/**
 * @file Generator for standard characters
 *
 * @module dnd/abilityGenerator
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

import * as maths from '../utils/maths.js';

/**
 * Array of ability value ranges. The first element is used for the first ability
 * @type {Array.Array<min:number, max:number>}
 */
const TRAIT_RANGE = [
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
const DEFAULT_RANGE = [8, 15];

/**
 * Order of abilities for character classes.
 * @type {Map<string, Array.<string>>}
 */
const CLASS_TRAIT_ORDER = new Map([
  ['FIGHTER', ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']],
  ['CLERIC', ['WIS', 'CON', 'STR', 'DEX', 'INT', 'CHA']],
  ['DEFAULT', ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA']],
]);

/**
 * Get set of abilities for a character class.
 * @param {string} characterClass
 * @returns {Map<string, number>}
 */
export function getClassAbilities(characterClass) {
  const result = new Map();
  const keys =
    CLASS_TRAIT_ORDER.get(characterClass) ?? CLASS_TRAIT_ORDER.get('DEFAULT');
  for (let index = 0; index < keys.length; index++) {
    const range =
      index < TRAIT_RANGE.length ? TRAIT_RANGE[index] : DEFAULT_RANGE;
    const value = maths.getRandomIntInclusive(range[0], range[1]);
    result.set(keys[index], value);
  }
  return result;
}

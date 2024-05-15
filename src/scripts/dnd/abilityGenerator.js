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
  ['BARBARIAN', ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA']],
  ['CLERIC', ['WIS', 'CON', 'STR', 'CHA', 'INT', 'DEX']],
  ['FIGHTER', ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']],
  ['RANGER', ['STR', 'DEX', 'INT', 'CHA', 'CON', 'WIS']],
  ['ROGUE', ['DEX', 'INT', 'CHA', 'STR', 'CON', 'WIS']],
  ['WIZARD', ['INT', 'WIS', 'STR', 'CON', 'DEX', 'CHA']],
  ['DEFAULT', ['STR', 'CON', 'DEX', 'INT', 'WIS', 'CHA']],
]);

/**
 * @typedef {Object} AttackModifiers
 * @property {number} pbMultiplier - multiplication factor for proficiency bonuses
 */
/**
 * Attack modifiers
 * @type {Map<string, AttackModifiers>}
 */
const CLASS_ATTACK_MODIFIERS = new Map([
  ['ROGUE', { pbMultiplier: 2 }],
  ['DEFAULT', { pbMultiplier: 1 }],
]);

/**
 * Trait adjustments for level changes.
 * The array holds the levels at which a trait adjustment takes place. These
 * are indexes into the classes CLASS_TRAIT_ORDER
 * @type {Map<string, number[]}
 */
const CLASS_TRAIT_ADJUSTMENT_LEVELS = new Map([
  ['BARBARIAN', [4, 8, 12, 16, 19]],
  ['CLERIC', [4, 8, 12, 16, 19]],
  ['FIGHTER', [4, 6, 8, 12, 14, 16, 19]],
  ['RANGER', [4, 8, 12, 16, 19]],
  ['ROGUE', [4, 8, 10, 12, 16, 19]],
  ['WIZARD', [4, 8, 12, 16, 19]],
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

/**
 * Get attack modifiers.
 * @param {string} characterClass
 * @returns {AttackModifiers}
 */
export function getAttackModifiers(characterClass) {
  return (
    CLASS_ATTACK_MODIFIERS.get(characterClass) ??
    CLASS_ATTACK_MODIFIERS.get('DEFAULT')
  );
}

/**
 * @typedef {Object} LevelAdjustmentDetails
 * @property {number[]} levels - array of levels at which an adjustment should be made.
 * @property {string[]} traits - array of traits in the order at which adjustments should be made
 * @property {number} gainPerAdjustment - total amount abilities can be changed.
 * @property {number} maxAbility - maximum an ability can rise to.
 */
/**
 * Get the trait adjustments for a level change.
 * Normally only one level change is expected.
 * @param {string} characterClass
 * @returns {number[]} array of levels at which characteristics should be adjusted. Undefined if none.
 */
export function getTraitAdjustmentDetails(characterClass) {
  return {
    levels: CLASS_TRAIT_ADJUSTMENT_LEVELS.get(characterClass) ?? [],
    traits:
      CLASS_TRAIT_ORDER.get(characterClass) ?? CLASS_TRAIT_ORDER.get('DEFAULT'),
    gainPerAdjustment: 2,
    maxAbility: 20,
  };
}

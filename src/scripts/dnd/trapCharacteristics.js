/**
 * @file Trap characteristics. These are derived from the 5e Severity levels p196.
 *
 * @module dnd/trapCharacteristics
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
import { AttackDetail } from './traits.js';
/**
 * @typedef {Object} TrapDetails
 * @property {number} difficulty
 * @property {AttackDetail} attack
 * @property {string} detectBy
 * @property {string} disableBy
 * @property {number} goldCoins
 */

const CHARACTERISTICS = {
  SETBACK: { dc: 11, bonus: 4, damage: ['1D10', '2D10', '4D10', '10D10'] },
  DANGEROUS: { dc: 14, bonus: 7, damage: ['2D10', '4D10', '10D10', '18D10'] },
  DEADLY: { dc: 18, bonus: 11, damage: ['4D10', '10D10', '18D10', '24D10'] },
};

/**
 * Get the trap characteristics based on its severity trait.
 * @param {number} characterLevel
 * @param {module:dnd/traits.Traits} trapTraits
 * @returns {TrapDetails}
 */
export function getCharacteristics(characterLevel, trapTraits) {
  const severity = trapTraits.get('SEVERITY', 'SETBACK');
  const details = CHARACTERISTICS[severity] ?? CHARACTERISTICS['SETBACK'];
  let damage;
  if (characterLevel < 5) {
    damage = details.damage[0];
  } else if (characterLevel < 11) {
    damage = details.damage[1];
  } else if (characterLevel < 17) {
    damage = details.damage[2];
  } else {
    damage = details.damage[3];
  }
  return {
    difficulty: details.dc,
    attack: new AttackDetail({
      damageDice: damage,
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: details.bonus,
    }),
    detectBy: trapTraits.get('DETECT_BY', 'WIS'),
    disableBy: trapTraits.get('DISABLE_BY', 'INT'),
    reward: trapTraits.get('REWARD'),
  };
}

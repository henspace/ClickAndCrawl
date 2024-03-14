/**
 * @file DnD dice rolls.
 *
 * @module dnd/dndAction
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

import * as dice from '../utils/dice.js';
import LOG from '../utils/logging.js';

/**
 * Convert a value to a modifier.
 * @param {number} value
 * @returns {number}
 */
function valueToModifier(value) {
  return Math.floor((value - 10) / 2);
}
/**
 * Roll an attack and damage dice.
 * @param {module:utils/game/actors~Actor} attacker
 * @param {module:utils/game/actors~Actor} target
 * @returns {number} amount of damage
 */
export function getMeleeDamage(attacker, target) {
  const armourClass = target.traits.effectiveAc;
  const strength = attacker.traits.get('STR', 1);
  const strengthModifier = valueToModifier(strength);
  const attackRoll = dice.rollDice(20);
  // handle fate and curses.
  if (attackRoll === 1) {
    return 0; // cursed.
  } else if (attackRoll === 20) {
    return 2 * damageRoll(attacker, target); // critical hit
  }
  const modifiers = strengthModifier; // ToDo include dexterity
  if (attackRoll + modifiers >= armourClass) {
    return damageRoll(attacker, target);
  }
  return 0;
}

/**
 * Roll a damage dice.
 * @param {module:utils/game/actors~Actor} attacker
 * @param {module:utils/game/actors~Actor} target
 * @returns {boolean} true if successful
 */
function damageRoll(attacker, target) {
  const damageDice = target.traits.get('DMG', '1D4');
  const damage = dice.rollMultiDice(damageDice);
  const modifiers = 0; // ToDo
  return damage + modifiers;
}

/**
 * poison with saving throw.
 * @returns {number}
 */
export function getPoisonDamage(attacker, target) {
  const damage = dice.rollMultiDice(attacker.traits.get('DMG', '1D4'));
  const save = attacker.traits.get('SAVE');
  if (!save) {
    LOG.info('No saving throw trait so damage applied.');
    return damage;
  }
  const saveDetail = save.match(/(\d+) *([a-zA-Z])+/);
  if (!saveDetail) {
    LOG.error(`Unrecognised save trait: ${save}`);
    return damage;
  }
  const saveCharacteristicValue = target.traits.get(saveDetail[2]);
  let modifier = saveCharacteristicValue
    ? valueToModifier(saveCharacteristicValue)
    : 0;
  if (dice.rollDice(20) + modifier >= saveDetail[1]) {
    return 0;
  } else {
    return damage;
  }
}

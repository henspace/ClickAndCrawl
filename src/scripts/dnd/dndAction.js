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
import { characteristicToModifier } from './traits.js';

/** @type number */
export const MEALS_FOR_LONG_REST = 0;
export const MEALS_FOR_SHORT_REST = 0;
export const DRINKS_FOR_LONG_REST = 0;
export const DRINKS_FOR_SHORT_REST = 0;

/**
 * Roll an attack and damage dice.
 * @param {module:dnd/traits~AttackDetail} attack
 * @param {module:players/actors~Actor} target
 * @returns {number} amount of damage
 */
export function getMeleeDamage(attack, target) {
  const diceRoll = dice.rollDice(20);
  // handle fate and curses.
  if (diceRoll === 1) {
    LOG.debug('Attack dice rolled 0: cursed.');
    return 0; // cursed.
  } else if (diceRoll === 20) {
    LOG.debug('Attack dice rolled 20: critical hit.');
    return 2 * attack.rollForDamage(); // critical hit
  }

  const attackRoll =
    diceRoll + attack.abilityModifier + attack.proficiencyBonus;
  const targetAc = target.traits.getEffectiveAc();
  LOG.debug(
    `Attack: dice: ${diceRoll}, ability modifier: ${attack.abilityModifier}, proficiency bonus: ${attack.proficiencyBonus}, target AC: ${targetAc}`
  );
  if (attackRoll >= targetAc) {
    return attack.rollForDamage();
  }
  return 0;
}

/**
 * poison with saving throw.
 * @param {module:players/actors~TraitsHolder} attack
 * @param {module:players/actors~Actor} target
 * @returns {number}
 */
export function getPoisonDamage(attacker, target) {
  const damage = dice.rollMultiDice(attacker.traits.get('DMG', '1D4'));
  const saveModifier = target.traits.getNonMeleeSaveAbilityModifier(attacker);
  const difficulty = attacker.traits.getInt('DC');
  if (!difficulty) {
    LOG.error(`Poisoner ${attacker.traits.get('NAME')} has no DC set.`);
    return damage;
  }
  if (dice.rollDice(20) + saveModifier >= difficulty) {
    return 0;
  } else {
    return damage;
  }
}

/**
 * Get consumption benefit in HP, clipped to HP max.
 * @param {module:players/actors~TraitsHolder} attack
 * @param {module:players/actors~Actor} target
 * @returns {number}
 */
export function getConsumptionBenefit(consumable, consumer) {
  const gain = dice.rollMultiDice(consumable.traits.get('HP', '1D4'));
  const currentHp = consumer.traits.get('HP', 0);
  const maxHp = consumer.traits.get('HP_MAX', currentHp);
  const shortFall = maxHp - currentHp;
  return Math.min(shortFall, gain);
}

/**
 * Magic with saving throw.
 * @param {module:dnd/traits~AttackDetail} attack
 * @param {module:players/actors~Actor} target
 * @param {module:players/actors~Artefact} spell
 * @returns {number}
 */
export function getSpellDamage(attacker, target, spell) {
  const attackerIntelligence = attacker.traits.get('INT', 1);
  const saveModifier = target.traits.getNonMeleeSaveAbilityModifier(spell);
  let difficulty = spell.traits.getInt('DC');
  if (difficulty === null || difficulty === undefined) {
    LOG.error(`Magic ${attacker.id} has no DC set.`);
    difficulty = 0;
  }

  const spellModifier =
    attacker.traits.getCharacterPb(spell) +
    characteristicToModifier(attackerIntelligence);
  const fullDifficulty = difficulty + spellModifier;
  let savingThrow = dice.rollDice(20) + saveModifier;
  const damage = dice.rollMultiDice(
    spell.traits.getDamageDiceWhenCastBy(attacker)
  );
  if (savingThrow >= fullDifficulty) {
    const factor = spell.traits.getFloat('DMG_SAVED', 0);
    return Math.round(factor * damage);
  } else {
    return damage;
  }
}

/**
 * Test if a rest can be taken.
 * A long rest takes 8 hours and cannot occur more than once.
 * So in this game we require three meals and a drink to mimic a full day.
 * For a short rest, we require 1 meal and a drink is all that is required.
 * @param {string} length - LONG or SHORT
 * @param {number} nMeals - number of meals available
 * @param {number} nDrinks - number of drinks available
 *
 * @returns {boolean}
 */
export function canRest(length, nMeals, nDrinks) {
  switch (length) {
    case 'SHORT':
      return nMeals >= MEALS_FOR_SHORT_REST && nDrinks >= DRINKS_FOR_SHORT_REST;
    case 'LONG':
      return nMeals >= MEALS_FOR_LONG_REST && nDrinks >= DRINKS_FOR_LONG_REST;
  }
  LOG.error(`Attempt to rest for unknown length of ${length}`);
  return false;
}

/**
 * Take a rest.
 * @param {module:players/actors~Actor} actor
 * @param {string} length - LONG or SHORT
 */
export function takeRest(actor, length) {
  switch (length) {
    case 'SHORT':
      {
        const hitDice = actor.traits.get('HIT_DICE');
        let hp = actor.traits.getInt('HP', 0);
        const hpMax = actor.traits.getInt('HP_MAX', hp);
        const constitutionModifier = actor.traits.getAsModifier('CON');
        const diceDetails = dice.getDiceDetails(hitDice);
        if (diceDetails.qty > 0) {
          diceDetails.qty--;
          hp += dice.rollDice(diceDetails.sides) + constitutionModifier; // just roll one.
          actor.traits.set('HP', Math.min(hp, hpMax));
          actor.traits.set(
            'HIT_DICE',
            dice.getDiceDetailsAsString(diceDetails)
          );
        }
      }
      break;
    case 'LONG':
      {
        const maxNumberOfHitDice = actor.traits.getCharacterLevel();
        const currentHitDice = actor.traits.get('HIT_DICE');
        const currentDiceDetails = dice.getDiceDetails(currentHitDice);
        const recoveredHitDice = Math.max(
          1,
          Math.ceil(0.5 * currentDiceDetails.qty)
        );
        currentDiceDetails.qty = Math.min(
          maxNumberOfHitDice,
          currentDiceDetails.qty + recoveredHitDice
        );
        actor.traits.set(
          'HIT_DICE',
          dice.getDiceDetailsAsString(currentDiceDetails)
        );
        actor.traits.set('HP', actor.traits.getInt('HP_MAX', 0));
      }
      break;
    default:
      LOG.error(`Attempt to rest for unknown length of ${length}`);
  }
}

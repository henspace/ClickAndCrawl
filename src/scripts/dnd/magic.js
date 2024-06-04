/**
 * @file Functions for handling magic
 *
 * @module dnd/magic
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

import LOG from '../utils/logging.js';

/**
 * The 5e edition spell system uses 9 spell slots.
 * This system has been simplified. In the 5e a 20th level wizard has slots
 * for two level 9 spells and 12 level 1 spells (if using other higher level slots).
 * So, we will take a level 9 spell as
 * equivalent to six level 1 spells. Applying this to any spell level
 * and using a level one spell as the base spell power unit, we get:
 * spellPower = 1 + 5 * (level - 1) / 8. This gives the following
 * powers:
 *
 * - level 1: 1
 * - level 2: 2
 * - level 3: 2
 * - level 4: 3
 * - level 5: 4
 * - level 6: 4
 * - level 7: 5
 * - level 8: 5
 * - level 9: 6
 *
 * From 5e, a wizard at level 20 has 22 slots and two at level 1.
 * So the available slots can be approximated as
 *
 * > slots = 2 + 20 * (characterLevel - 1) / 19
 *
 * Then taking the average spell power as four, we can assign
 * a total power availability of
 *
 * > total power = 4 * (2 + 20 * (characterLevel - 1) / 19)
 *
 * This results in the following values as examples.
 *
 * Level 1 character: power = 4; equivalent to 4 level 1 spells.
 * Level 20 character: power = 22; equivalent to 22 level 1 spell.
 */

/**
 * Get the power of a spell in equivalent level 1 spells.
 * @param {Traits} spellTraits
 * @returns {number} equivalent number of level one spells.
 */
export function getSpellPower(spellTraits) {
  const level = spellTraits.getInt('LEVEL', 1);
  return Math.round(1 + (5 * (level - 1)) / 8);
}

/**
 * Convert a character level to its equivalent spell level.
 * This is a simplified magic system. From 5e, magic users hit spell level 9
 * by character level 17. Available spell levels are interpolated from 1 to 9
 * across character levels 1 to 17.
 * @param {number} characterLevel 1 to 20
 * @returns {number} spell level 1 to 9
 */
export function characterLevelToSpellLevel(characterLevel) {
  return Math.min(Math.round(1 + (8 * (characterLevel - 1)) / 16), 9);
}
/**
 * This is a simplified magic system. From 5e, magic users hit spell level 9
 * by character level 17. Available spell levels are interpolated from 1 to 9
 * across character levels 1 to 17.
 * @param {module:dnd/traits.CharacterTraits} actorTraits
 * @param {module:dnd/traits.Traits} magicTraits
 * @returns {boolean}
 */
export function canActorLearnMagic(actorTraits, magicTraits) {
  // check level
  const actorLevel = actorTraits.getCharacterLevel();
  const spellLevel = magicTraits.getInt('LEVEL', 0);
  const maxSpellLevel = characterLevelToSpellLevel(actorLevel);

  if (spellLevel > maxSpellLevel) {
    LOG.info(
      `${actorTraits.get(
        'NAME'
      )} cannot learn level ${spellLevel} ${magicTraits.get(
        'NAME'
      )} as too high.`
    );
    return false;
  }

  //check casters
  const casters = magicTraits.get('CASTERS');
  if (!casters) {
    LOG.info(
      `No casters set for ${magicTraits.get('NAME')} so can be learned.`
    );
    return true; // no limitations
  }
  const actorClass = actorTraits.get('CLASS');
  if (!casters.includes(actorClass)) {
    LOG.info(
      `${actorTraits.get('NAME')} cannot learn ${magicTraits.get(
        'NAME'
      )} as not in casters.`
    );
    return false;
  }
  return true;
}

/**
 * Get the actor's available casting power.
 * If the trait does not exist, it is recreated at the max level.
 * @param {module:dnd/Traits.CharacterTraits} casterTraits
 * @return {number}
 */
export function getCastingPower(casterTraits) {
  const availablePower = casterTraits.getInt('CASTING_POWER');
  if (casterTraits.has('CASTING_POWER')) {
    return availablePower;
  } else {
    return restoreCastingPower(casterTraits);
  }
}
/**
 * Use some of the actor's casting power.
 * @param {module:dnd/Traits.CharacterTraits} casterTraits
 * @param {module:dnd/Traits.Traits} spellTraits
 */
export function useCastingPower(casterTraits, spellTraits) {
  const spellPower = getSpellPower(spellTraits);
  const availablePower = getCastingPower(casterTraits);
  const remaining = Math.max(0, availablePower - spellPower);
  casterTraits.set('CASTING_POWER', remaining);
}

/**
 * Test if actor has enough power to cast a spell.
 * @param {module:dnd/Traits.Traits} casterTraits
 * @param {module:dnd/Traits.Traits} spellTraits
 * @returns {boolean}
 */
export function canCastSpell(casterTraits, spellTraits) {
  const spellPower = getSpellPower(spellTraits);
  const availablePower = getCastingPower(casterTraits);
  return availablePower >= spellPower;
}

/**
 * Restore casting power to max.
 * @param {module:dnd/Traits.CharacterTraits} casterTraits
 * @returns {number}
 */
export function restoreCastingPower(casterTraits) {
  const characterLevel = casterTraits.getCharacterLevel();
  const maxPower = Math.round(4 * (2 + (20 * (characterLevel - 1)) / 19));
  casterTraits.set('CASTING_POWER', maxPower);
  return maxPower;
}

/**
 * Test if bless spell can be used. Bless spells can only be used
 * when the target's HP are <= spellTraits MAX_TARGET_HP value.
 * If MAX_TARGET_HP is not set, a value of 999 is used.
 * @param {module:dnd/traits.CharacterTraits} casterTraitsUnused
 * @param {module:dnd/traits.CharacterTraits} targetTraits
 * @param {module:dnd/traits.MagicTraits} spellTraits
 * @returns {boolean}
 */
export function canBless(casterTraitsUnused, targetTraits, spellTraits) {
  const maxTargetHp = spellTraits.getInt('MAX_TARGET_HP', 999);
  const targetHp = targetTraits.getInt('HP');
  if (targetHp > maxTargetHp) {
    LOG.info(
      `Targets's HP (${targetHp}) is above max target hp of ${maxTargetHp}. Spell failed.`
    );
    return false;
  }
  return true;
}

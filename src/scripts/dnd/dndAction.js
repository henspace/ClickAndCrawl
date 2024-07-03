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
import { characteristicToModifier, AttackDetail } from './traits.js';
import * as magic from './magic.js';
import { AttackMode } from '../players/actors.js';
import WORLD from '../utils/game/world.js';

/** @type number */
export const FOOD_ITEMS_FOR_LONG_REST = 3;
export const DRINKS_FOR_LONG_REST = 3;

export const FOOD_ITEMS_FOR_SHORT_REST = 1;
export const DRINKS_FOR_SHORT_REST = 1;

/**
 * @typedef {number} DifficultyValue
 */
/**
 * @enum {DifficultyValue}
 */
export const Difficulty = {
  VERY_EASY: 5,
  EASY: 10,
  MEDIUM: 15,
  HARD: 20,
  VERY_HARD: 25,
  NEARLY_IMPOSSIBLE: 30,
  IMPOSSIBLE: 999,
};

/**
 * Roll an attack and damage dice.
 * @param {module:dnd/traits~AttackDetail} attack
 * @param {module:dnd/traits.CharacterTraits} targetTraits
 * @returns {number} amount of damage
 */
export function getMeleeDamage(attack, targetTraits) {
  const attackRoll = attack.rollForAttack();
  // handle fate and curses.
  if (attackRoll.roll === 1) {
    LOG.info('Attack dice rolled 0: cursed.');
    return 0; // cursed.
  } else if (attackRoll.roll === 20) {
    LOG.info('Attack dice rolled 20: critical hit. Damage will be doubled.');
    return 2 * attack.rollForDamage(); // critical hit
  }

  const targetAc = targetTraits.getEffectiveInt('AC');
  LOG.info(`Melee: attack roll ${attackRoll.value} vs target AC ${targetAc}`);
  if (attackRoll.value >= targetAc) {
    return attack.rollForDamage();
  }
  return 0;
}

/**
 * Poison with saving throw.
 * @param {module:dnd/traits.Traits} attackerTraits
 * @param {module:dnd/traits.CharacterTraits} targetTraits
 * @returns {number}
 */
export function getPoisonDamage(attackerTraits, targetTraits) {
  const damageDice =
    attackerTraits.get('DMG_POISON') ?? attackerTraits.get('DMG', '1D4');
  const damage = dice.rollMultiDice(damageDice);
  const saveModifier =
    targetTraits.getNonMeleeSaveAbilityModifier(attackerTraits);
  const difficulty = attackerTraits.getInt('DC');
  if (!difficulty) {
    LOG.error(`Poisoner ${attackerTraits.get('NAME')} has no DC set.`);
    return damage;
  }
  const saveRoll = dice.rollDice(20);
  LOG.info(
    `Poison: save roll ${saveRoll} + modifier ${saveModifier} vs target DC ${difficulty}`
  );
  if (saveRoll + saveModifier >= difficulty) {
    const factor = attackerTraits.getFloat('DMG_SAVED', 0);
    return Math.round(factor * damage);
  } else {
    return damage;
  }
}

/**
 * Get consumption benefit in HP, clipped to HP max.
 * @param {module:dnd/traits.Traits} consumableTraits
 * @param {module:dnd/traits.Traits} consumerTraits
 * @returns {{shortFall:number, oldHp:number, newHp:number, detoxified: boolean}}
 */
export function getConsumptionBenefit(consumableTraits, consumerTraits) {
  const gain = consumableTraits.getInt('HP', 0);
  const currentHp = consumerTraits.getInt('HP', 0);
  const maxHp = consumerTraits.getInt('HP_MAX', currentHp);
  const shortFall = maxHp - currentHp;
  const appliedGain = shortFall < 0 ? 0 : Math.min(shortFall, gain);

  return {
    shortFall: shortFall,
    oldHp: currentHp,
    newHp: currentHp + appliedGain,
    detoxify: consumableTraits.get('DETOXIFY', false),
  };
}

/**
 * Get the spell damage. Uses the ATTACK to determine the mechanics used.
 * @param {module:dnd/traits.CharacterTraits} attackerTraits
 * @param {module:dnd/traits.CharacterTraits} targetTraits
 * @param {module:dnd/traits.MagicTraits} spellTraits
 * @param {number} separation - distance between attacker and target in tiles.
 * @returns {number}
 */
export function getSpellDamage(
  attackerTraits,
  targetTraits,
  spellTraits,
  separation
) {
  if (targetTraits.get('UNDEAD') && spellTraits.get('UNDEAD_IMMUNE')) {
    LOG.info(`Spell does not work on the undead.`);
    return 0;
  }
  switch (spellTraits.get('MODE')) {
    case 'MELEE':
    case 'VAMPIRIC MELEE':
      return getSpellMeleeDamage(attackerTraits, targetTraits, spellTraits);
    case 'RANGED':
      return getSpellRangedDamage(
        attackerTraits,
        targetTraits,
        spellTraits,
        separation
      );
    default:
      return getSpellNormalDamage(attackerTraits, targetTraits, spellTraits);
  }
}

/**
 * Magic using ranged attack mechanics.
 * @param {module:dnd/traits.CharacterTraits} attackerTraits
 * @param {module:dnd/traits.CharacterTraits} targetTraits
 * @param {module:dnd/traits.MagicTraits} spellTraits
 * @param {number} separation - distance between attacker and target in tiles.
 * @returns {number}
 */
function getSpellRangedDamage(
  attackerTraits,
  targetTraits,
  spellTraits,
  separation
) {
  const spellCastAbility = attackerTraits.get('SPELL_CAST', 'INT');
  const spellCastAbilityValue = attackerTraits.getEffectiveInt(
    spellCastAbility,
    1
  );
  let damageDice;
  if (spellTraits.getDamageDiceWhenCastBy) {
    damageDice = spellTraits.getDamageDiceWhenCastBy(attackerTraits);
  } else {
    damageDice = spellTraits.get('DMG', '1D4');
  }
  const attack = new AttackDetail({
    damageDice: damageDice,
    weaponType: 'MAGIC',
    proficiencyBonus: attackerTraits.getCharacterPb(spellTraits),
    abilityModifier: characteristicToModifier(spellCastAbilityValue),
    disadvantage: Math.round(separation) <= 1,
  });
  return getMeleeDamage(attack, targetTraits);
}

/**
 * Magic with using melee attack mechanics.
 * @param {module:dnd/traits.CharacterTraits} attackerTraits
 * @param {module:dnd/traits.CharacterTraits} targetTraits
 * @param {module:dnd/traits.MagicTraits} spellTraits
 * @returns {number}
 */
function getSpellMeleeDamage(attackerTraits, targetTraits, spellTraits) {
  const spellCastAbility = attackerTraits.get('SPELL_CAST', 'INT');
  const spellCastAbilityValue = attackerTraits.getEffectiveInt(
    spellCastAbility,
    1
  );
  let damageDice;
  if (spellTraits.getDamageDiceWhenCastBy) {
    damageDice = spellTraits.getDamageDiceWhenCastBy(attackerTraits);
  } else {
    damageDice = spellTraits.get('DMG', '1D4');
  }
  const attack = new AttackDetail({
    damageDice: damageDice,
    weaponType: 'MAGIC',
    proficiencyBonus: attackerTraits.getCharacterPb(spellTraits),
    abilityModifier: characteristicToModifier(spellCastAbilityValue),
  });
  return getMeleeDamage(attack, targetTraits);
}

/**
 * Magic with saving throw.
 * @param {module:dnd/traits.CharacterTraits} attackerTraits
 * @param {module:dnd/traits.CharacterTraits} targetTraits
 * @param {module:dnd/traits.MagicTraits} spellTraits
 * @returns {number}
 */
export function getSpellNormalDamage(
  attackerTraits,
  targetTraits,
  spellTraits
) {
  const saveModifier = targetTraits.getNonMeleeSaveAbilityModifier(spellTraits);
  let spellModifier = 0;
  let attackLabel;
  if (attackerTraits.get('ATTACK') === AttackMode.RANGED) {
    attackLabel = 'Ranged attack';
  } else {
    attackLabel = 'Magic';
    const spellCastAbility = attackerTraits.get('SPELL_CAST', 'INT');
    const spellCastAbilityValue = attackerTraits.getInt(spellCastAbility, 1);
    spellModifier =
      attackerTraits.getCharacterPb(spellTraits) +
      characteristicToModifier(spellCastAbilityValue);
  }

  let difficulty = spellTraits.getInt('DC');
  if (difficulty === null || difficulty === undefined) {
    LOG.error(`${attackLabel} ${attackerTraits.get('NAME')} has no DC set.`);
    difficulty = 0;
  }

  const fullDifficulty = difficulty + spellModifier;
  let savingThrow = dice.rollDice(20) + saveModifier;
  let damageDice;
  if (spellTraits.getDamageDiceWhenCastBy) {
    damageDice = spellTraits.getDamageDiceWhenCastBy(attackerTraits);
  } else {
    damageDice = spellTraits.get('DMG', '1D4');
  }
  const damage = dice.rollMultiDice(damageDice);
  LOG.info(
    `${attackLabel}: saving throw ${savingThrow} vs target DC ${fullDifficulty}`
  );
  if (savingThrow >= fullDifficulty) {
    const factor = spellTraits.getFloat('DMG_SAVED', 0);
    return Math.round(factor * damage);
  } else {
    return damage;
  }
}

/**
 * Get HP gain from spell.
 * @param {module:dnd/traits.CharacterTraits} casterTraits
 * @param {module:dnd/traits.CharacterTraits} targetTraits
 * @param {module:dnd/traits.MagicTraits} spellTraits
 * @returns {number}
 */
export function getSpellHpGain(casterTraits, targetTraits, spellTraits) {
  if (!spellTraits.has('HP_GAIN')) {
    return 0;
  }
  let hpGainDice;
  if (spellTraits.getHpGainDiceWhenCastBy) {
    hpGainDice = spellTraits.getHpGainDiceWhenCastBy(casterTraits);
  } else {
    hpGainDice = spellTraits.get('HP_GAIN', 0);
  }
  const result = dice.rollMultiDice(hpGainDice);
  const currentHp = targetTraits.getInt('HP');
  const hpMax = targetTraits.getInt('HP_MAX');
  return Math.min(result, hpMax - currentHp);
}

/**
 * @typedef {string} RestFailureValue
 */
/**
 * @enum {RestFailureValue}
 */
export const RestFailure = {
  NONE: '',
  NEED_LONG_REST: 'need long rest',
  NEED_MORE_RATIONS: 'need more rations',
};

/**
 * Get the number of hit dice remaining.
 * @param {Traits} traits - actor's traits.
 * @returns {number}
 */
export function getNumberOfRemainingHitDice(traits) {
  const hitDice = traits.get('HIT_DICE', '0D6');
  return dice.getDiceDetails(hitDice).qty - traits.getInt('SPENT_HIT_DICE');
}
/**
 * @typedef {Object} RestDetails
 * @property {boolean} possible
 * @property {RestFailureValue} failure
 */
/**
 * Test if a rest can be taken.
 * A long rest takes 8 hours and cannot occur more than once.
 * So in this game we require three meals (food items + drink) to mimic a full day.
 * For a short rest, we require 1 meal (food + drink).
 * However, a short rest requires a hit dice and if these have run out, a long rest
 * is necessary.
 * @param {number} nFood - number of meals available
 * @param {number} nDrinks - number of drinks available
 * @param {Traits} traits = actor's traits.
 * @returns {{shortRest: RestDetails, longRest: RestDetail}}
 */
export function canRest(nFood, nDrinks, traits) {
  const shortRest = { possible: true, failure: RestFailure.NONE };
  const longRest = { possible: true, failure: RestFailure.NONE };
  const availableDice = getNumberOfRemainingHitDice(traits);
  if (availableDice < 1) {
    shortRest.possible = false;
    shortRest.failure = RestFailure.NEED_LONG_REST;
  } else if (
    nFood < FOOD_ITEMS_FOR_SHORT_REST ||
    nDrinks < DRINKS_FOR_SHORT_REST
  ) {
    shortRest.possible = false;
    shortRest.failure = RestFailure.NEED_MORE_RATIONS;
  }
  if (nFood < FOOD_ITEMS_FOR_LONG_REST || nDrinks < DRINKS_FOR_LONG_REST) {
    longRest.possible = false;
    longRest.failure = RestFailure.NEED_MORE_RATIONS;
  }

  return {
    shortRest: shortRest,
    longRest: longRest,
  };
}

/**
 * Take a rest.
 * @param {module:players/actors.Actor} actor
 * @param {string} length - LONG or SHORT
 * @returns {{oldHp: number, newHp: number}}
 */
export function takeRest(actor, length) {
  const currentHp = actor.traits.getInt('HP', 0);
  let newHp = currentHp;
  switch (length) {
    case 'SHORT':
      {
        const hitDice = actor.traits.get('HIT_DICE');
        const spentHitDice = actor.traits.getInt('SPENT_HIT_DICE', 0);
        const hpMax = actor.traits.getInt('HP_MAX', currentHp);
        const constitutionModifier = actor.traits.getAsModifier('CON');
        const diceDetails = dice.getDiceDetails(hitDice);
        const availableHitDice = diceDetails.qty - spentHitDice;
        if (availableHitDice > 0) {
          newHp =
            currentHp + dice.rollDice(diceDetails.sides) + constitutionModifier; // just roll one.
          newHp = Math.min(newHp, hpMax);
          actor.traits.set('HP', newHp);
          actor.traits.set('SPENT_HIT_DICE', spentHitDice + 1);
        }
        actor.toxify?.cure();
      }
      break;
    case 'LONG':
      {
        const hitDice = actor.traits.get('HIT_DICE');
        const diceDetails = dice.getDiceDetails(hitDice);
        const recoveredHitDice = Math.max(1, Math.ceil(0.5 * diceDetails.qty));
        let spentDice =
          actor.traits.getInt('SPENT_HIT_DICE', 0) - recoveredHitDice;
        spentDice = Math.max(0, spentDice);
        actor.traits.set('SPENT_HIT_DICE', spentDice);

        newHp = actor.traits.getInt('HP_MAX', currentHp);
        actor.traits.set('HP', newHp);
        magic.restoreCastingPower(actor.traits);
        actor.toxify?.cure();
      }
      break;
    default:
      LOG.error(`Attempt to rest for unknown length of ${length}`);
  }
  return {
    oldHp: currentHp,
    newHp: newHp,
  };
}

/**
 * Detect a trap. Uses wisdom unless DETECT_BY is set.
 * @param {module:dnd/traits.Traits} detectorTraits
 * @param {module:dnd/trapCharacteristics.TrapDetails} trapDetails
 */
export function canDetectTrap(detectorTraits, trapDetails) {
  return canPerformTask(detectorTraits, {
    ability: trapDetails.detectBy,
    difficulty: trapDetails.difficulty,
    proficiency: 'TRAPS',
  });
}

/**
 * Can disable trap. Uses intelligence unless DISABLE_BY is set.
 * @param {module:dnd/traits.Traits} detectorTraits
 * @param {module:dnd/trapCharacteristics.TrapDetails} trapDetails
 */
export function canDisableTrap(detectorTraits, trapDetails) {
  return canPerformTask(detectorTraits, {
    ability: trapDetails.disableBy,
    difficulty: trapDetails.difficulty,
    proficiency: 'TRAPS',
  });
}

/**
 * Can steal from trader.
 * @param {module:dnd/traits.Traits} robberTraits
 * @param {module:dnd/traits.Traits} traderTraits
 */
export function canSteal(robberTraits, traderTraits) {
  return canPerformTask(robberTraits, {
    ability: 'DEX',
    difficulty: traderTraits.getInt('DC', Difficulty.HARD),
    proficiency: 'STEALING',
  });
}

/**
 * Can pick a lock. The difficulty of the task comes from
 * the keyTraits.
 * @param {module:dnd/traits.CharacterTraits} robberTraits
 * @param {module:dnd/traits.Traits} keyTraits
 */
export function canPickLock(robberTraits, keyTraits) {
  return canPerformTask(robberTraits, {
    ability: 'DEX',
    difficulty: keyTraits.get('DC', Difficulty.EASY),
    proficiency: 'PICK LOCK',
  });
}

/**
 * Can identify an object. The difficulty of the task comes from
 * the keyTraits. The wisdom ability is used.
 * @param {module:dnd/traits.CharacterTraits} identifierTraits
 * @param {module:dnd/traits.Traits} objectTraits
 */
export function canIdentify(identifierTraits, objectTraits) {
  return canPerformTask(identifierTraits, {
    ability: 'WIS',
    difficulty: objectTraits.get('IDENTIFY_DC', Difficulty.EASY),
    proficiency: objectTraits.get('SUBTYPE'),
  });
}

/**
 * Can perform task.
 * @param {module:dnd/traits.CharacterTraits} pickerTraits
 * @param {Object} task
 * @param {string} task.ability -e.g. DEX
 * @param {string} task.proficiency - e.g. 'PICK LOCK'
 * @param {number} task.difficulty - e.g. Difficulty.HARD
 * @returns {boolean}
 */
export function canPerformTask(pickerTraits, task) {
  const abilityValue = pickerTraits.getEffectiveInt(task.ability, 1);
  const modifier = characteristicToModifier(abilityValue);
  const profBonus = task.proficiency
    ? pickerTraits.getCharacterPb(task.proficiency)
    : 0;
  const pickRoll = dice.rollDice(20) + modifier + profBonus;
  LOG.info(
    `Try ${task.proficiency}:D20 + ability(${modifier}) + proficiency(${profBonus}): ${pickRoll} vs ${task.difficulty}`
  );
  return pickRoll >= task.difficulty;
}

/**
 * Roll dice to see if item breaks. Normally used for weapons but can be used
 * for lock picks. Enchanted weapons are more resilient.
 * @param {string} weaponType
 * @returns {boolean}
 */
export function doesItemBreak(weaponType) {
  if (!weaponType) {
    return false;
  }
  if (weaponType.includes('ENCHANTED')) {
    return dice.rollDice('3D6') === 3;
  } else {
    return dice.rollDice('3D4') === 3;
  }
}

/**
 *
 * @param {module:dnd/traits.Traits} actorTraits
 * @param {*} tilesMoved
 */
export function sneaksPast(actorTraits, tilesMoved) {
  if (tilesMoved <= 1) {
    return true;
  }
  const difficulty = tilesMoved <= 2 ? Difficulty.EASY : Difficulty.MEDIUM;
  const result = canPerformTask(actorTraits, {
    ability: 'DEX',
    proficiency: 'STEALTH',
    difficulty: difficulty,
  });
  if (result) {
    LOG.info('Crept past successfully without disturbing monsters.');
  } else {
    LOG.info('Creeping but unsuccessfully. Monsters could be disturbed.');
  }
  return result;
}

/**
 * Wake up actors around point.
 * @param {Point} point - position in world
 * @param {number} [distanceInTiles = 1]
 */
export function wakeUpSurrounding(point, distanceInTiles = 1) {
  const tileMap = WORLD.getTileMap();
  const surrounds = tileMap.getRadiating(
    tileMap.worldPointToGrid(point),
    distanceInTiles
  );
  for (const tile of surrounds) {
    const targets = tile.getOccupants();
    for (const target of targets.values()) {
      const wasSleeping = target.sleeping;
      target.sleeping = false;
      if (wasSleeping && target.alive) {
        wakeUpSurrounding(target.position, 1); // waking up wakes others.
      }
    }
  }
}

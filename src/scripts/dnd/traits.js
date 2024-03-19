/**
 * @file Dungeon and dragons properties
 *
 * @module dnd/traits
 */
/**
 * License {@link https://opensource.org/license/mit/|MIT}
 *
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
import { ArtefactType } from '../players/artefacts.js';
import * as dice from '../utils/dice.js';
import * as tables from './tables.js';
import * as arrayManip from '../utils/arrays/arrayManip.js';

import LOG from '../utils/logging.js';

/** Basic ability keys @type {string[]}*/
const ABILITY_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

/**
 * Convert a value to a modifier.
 * @param {number} value
 * @returns {number}
 */
export function characteristicToModifier(value) {
  return Math.floor((value - 10) / 2);
}

/** Apply dexterity modifier to an item to get its AC value */
function getAcUsingDexterity(item, dexterity) {
  const modifier = characteristicToModifier(dexterity);
  const armourType = item.traits.get('TYPE', '').toLowerCase();
  const armourClass = item.traits.getInt('AC', 0);
  if (armourType.includes('HEAVY')) {
    return armourClass;
  } else if (armourType.includes('MEDIUM')) {
    return armourClass + Math.min(2, modifier);
  } else {
    return armourClass + modifier;
  }
}

/**
 * Class that represents attack characteristics.
 */
export class AttackDetail {
  /** @type {string} */
  damageDice;
  /** @type {number} */
  proficiencyBonus;
  /** @type {number} */
  abilityModifier;
  /** @type {boolean} */
  twoWeaponFighting;
  /** @type {boolean} */
  isSecondAttack;
  /** @type {boolean} */
  unarmed;

  /**
   *
   * @param {Artefact} weapon
   * @param {Object} options
   * @param {string} options.damageDice
   * @param {string} options.weaponType - UNARMED makes this an unarmed strike.
   * @param {number} options.proficiencyBonus
   * @param {number} options.abilityModifier
   * @param {boolean} options.secondAttack - true if this is a second attack
   */
  constructor(options) {
    this.damageDice = options.damageDice ?? '1D1';
    const subType = options.weaponType ?? '';
    if (subType === 'UNARMED') {
      this.unarmed = true;
      this.twoWeaponFighting = false;
    } else if (subType.includes('SIMPLE') && subType.includes('LIGHT')) {
      this.twoWeaponFighting = true;
    } else {
      this.twoWeaponFighting = false;
    }
    this.proficiencyBonus = options?.proficiencyBonus ?? 0;
    this.abilityModifier = options?.abilityModifier ?? 0;
    this.isSecondAttack = options.secondAttack;
  }

  /**
   * Get unarmed damage.
   * @returns {number}
   */
  #getUnarmedDamage() {
    return 1 + this.abilityModifier; // ability modifier is the same as strength for melee
  }
  /**
   * Get maximum possible damage from this weapon ignoring the ability modifier
   * which applies to all weapons equally.
   * @returns {number}
   */
  getMaxDamage() {
    if (this.unarmed) {
      return this.#getUnarmedDamage();
    } else {
      return dice.maxRoll(this.damageDice) + this.proficiencyBonus;
    }
  }

  /**
   * Roll for attack.
   * @returns {number}
   */
  rollForAttack() {
    return dice.rollDice(20) + this.abilityModifier + this.proficiencyBonus;
  }
  /**
   * Roll for damage.
   * @returns {number}
   */
  rollForDamage() {
    if (this.unarmed) {
      return this.#getUnarmedDamage();
    }
    let modifier;
    if (this.isSecondAttack && this.abilityModifier > 0) {
      modifier = 0;
    } else {
      modifier = this.abilityModifier;
    }
    return dice.rollMultiDice(this.damageDice) + modifier;
  }

  /**
   * Clone
   * @returns {AttackDetail}
   */
  clone() {
    const attackDetail = new AttackDetail({});
    attackDetail.abilityModifier = this.abilityModifier;
    attackDetail.damageDice = this.damageDice;
    attackDetail.isSecondAttack = this.isSecondAttack;
    attackDetail.proficiencyBonus = this.proficiencyBonus;
    attackDetail.twoWeaponFighting = this.twoWeaponFighting;
    attackDetail.unarmed = this.unarmed;
    return attackDetail;
  }
}

/**
 * This is basically a Map with some special derived characteristics.
 */
export class Traits {
  /** Characteristics @type {Map<string, *>} */
  _traits;

  /**
   * Initialise the traits.
   * @param {Map<string, *> | string} initialValues
   */
  constructor(initialValues) {
    if (typeof initialValues === 'string') {
      this._traits = new Map();
      this.#setFromString(initialValues);
    } else {
      this._traits = new Map(initialValues);
    }
  }

  /**
   * Populate the traits from a string definition. The definition comprises a
   * comma separated list of characteristics with each characteristic comprising
   * a keyword followed by a space or equals sign and then its value.
   * Keywords are converted to uppercase.
   * @param {string} definition
   * @returns {Traits} returns this to allow chaining.
   * @throws {Error} if definition invalid.
   */
  #setFromString(definition) {
    definition.split(',').forEach((item) => {
      const match = item.match(/^\s*(\w+)\s*[=: ]\s*(.+?)\s*$/);
      if (!match) {
        return;
      }
      const [key, value] = this.#imposeCase(match[1], match[2]);
      if (match) {
        this.#setValueFromString(key, value.trim());
      } else {
        throw new Error(`Invalid property definition'${item}'`);
      }
    });
    this._compositeAc = this.getInt('AC', 0);
    return this;
  }

  /**
   * @param {string} key
   * @param {*} value
   * @throws {Error} thrown if key invalid.
   */
  set(key, value) {
    this._traits.set(key, value);
    this._refreshDerivedValues(key);
  }

  /**
   * Get the trait value. This will look first for the key and then the key
   * preceded by an underscore.
   * @param {string} key
   * @param {*} defValue - default value;
   * @returns {*}
   */
  get(key, defValue) {
    return this._traits.get(key) ?? this._traits.get('_' + key) ?? defValue;
  }

  /**
   * Refresh derived values.
   * This is expected to be overridden.
   * @param {string} key - key that was updated and triggered refresh.
   */
  _refreshDerivedValues(updatedKeyUnused) {}

  /**
   * Get the trait value as an int. This will look first for the key and then the key
   * preceded by an underscore.
   * @param {string} key
   * @param {*} defValue - default value;
   * @returns {number}
   */
  getInt(key, defValue) {
    const result = this.get(key, defValue);
    return maths.safeParseInt(result, defValue);
  }
  /**
   * Get the trait value as a modifier int. This will look first for the key and then the key
   * preceded by an underscore.
   * @param {string} key
   * @param {*} defValue - default value;
   * @returns {number}
   */
  getAsModifier(key, defValue) {
    const value = this.getInt(key);
    if (value === null || value === undefined) {
      return defValue;
    }
    return characteristicToModifier(value);
  }

  /**
   * Adjust case to uppercase unless an excluded characteristic. Most values are
   * converted to uppercase with a few exceptions.
   * @param {string} key
   * @param {string} value
   * @returns {string[]]} first element has the adjusted key and the second the value.
   */
  #imposeCase(key, value) {
    key = key.toUpperCase();
    if (key !== 'NAME') {
      value = value.toUpperCase();
    }
    return [key, value];
  }

  /**
   * Set the trait for key to value. This is for a value passed in by the
   * #setValueFromString method.
   * + If the value comprises two numbers separated by
   * a /, the value for the key is set to the numerator and a new key key_MAX is created,
   * set to the denominator.
   * + If the value comprises two numbers separated by a >, the value for the key
   * is set to a random value between (inclusive) the two values, and a new key key_MAX is created,set to the second number.
   * @param {string} key
   * @param {string} value
   */
  #setValueFromString(key, value) {
    switch (key) {
      case 'PROF':
        return this.#setProficienciesFromString(key, value);
      case 'COST':
        return this.#setCostValueFromString(key, value);
      case 'DMG':
        return this.#setIntOrDiceValueFromString(key, value);
      case 'HIT_DICE':
        return this.#setDiceValueFromString(key, value);
      default:
        return this.#setGenericValueFromString(key, value);
    }
  }

  /**
   * Set the trait for key to value. This is for a value passed in by the
   * #setValueFromString method.
   * + If the value comprises two numbers separated by
   * a /, the value for the key is set to the numerator and a new key key_MAX is created,
   * set to the denominator.
   * + If the value comprises two numbers separated by a >, the value for the key
   * is set to a random value between (inclusive) the two values, and a new key key_MAX is created,set to the second number.
   * @param {string} key
   * @param {string} value
   */
  #setCostValueFromString(key, value) {
    const match = value.match(/^(.*)([a-zA-Z]{2})$/);
    if (!match) {
      LOG.error(`Invalid value for COST trait: ${value}`);
      value = '0 GP';
    } else {
      const diceDefn = match[1].trim();
      let faceValue;
      if (dice.isMultiDice(diceDefn)) {
        faceValue = dice.rollMultiDice(diceDefn);
      } else {
        faceValue = maths.safeParseInt(match[1], 0);
      }
      value = `${faceValue} ${match[2]}`;
    }
    this.set(key, value);
  }
  /**
   * Set the trait for key to value. This is for a value passed in by the
   * #setValueFromString method. The dice is not rolled but stored as is.
   * @param {string} key
   * @param {string} value
   */
  #setDiceValueFromString(key, value) {
    if (!dice.isMultiDice(value)) {
      LOG.error(
        `Invalid trait value ${value} for ${key}. Dice definition required.`
      );
      value = '1D6';
    }
    this.set(key, value);
  }
  /**
   * Set the trait for key to value. This is for a value passed in by the
   * #setValueFromString method.
   * If the value is a multidice, it is rolled and the resulting value used.
   * @param {string} key
   * @param {string} value
   */
  #setIntOrDiceValueFromString(key, value) {
    if (!dice.isMultiDice(value) && isNaN(parseInt(value))) {
      LOG.error(
        `Invalid trait value ${value} for ${key}. Integer or dice definition required.`
      );
      value = '0';
    }
    this.set(key, value);
  }
  /**
   * Set the trait for key to value. This is for a value passed in by the
   * #setValueFromString method.
   * If the value is a multidice, it is rolled and the resulting value used.
   * @param {string} key
   * @param {string} value
   */
  #setGenericValueFromString(key, value) {
    if (dice.isMultiDice(value) && key !== 'DMG') {
      value = dice.rollMultiDice(value); // Note DMG is stored as dice definition as it is rolled on demand.
    }
    this.set(key, value);
  }

  /**
   * Set proficiencies.
   * @param {string} key
   * @param {string} value - ids of items in which the user is proficient. Items
   * are separated by &.
   */
  #setProficienciesFromString(key, value) {
    const items = value.split(/\s*&\s*/);
    const proficiencies = [];
    items.forEach((item) => proficiencies.push(item.toUpperCase()));
    this._traits.set('PROF', proficiencies);
  }

  /**
   * Clone traits.
   * @return {Traits}
   */
  clone() {
    return new Traits(this._traits);
  }
  /**
   * Get all traits. This is a copy of the underlying traits sorted by key name.
   * @returns {Map<string, *>}
   */
  getAllTraits() {
    return new Map([...this._traits.entries()].sort());
  }
}

/**
 * DnD character traits
 */
export class CharacterTraits extends Traits {
  // Derived traits.
  /** @type {number} */
  _compositeAc;
  /** @type {number} */
  _proficiencyBonus;
  /** @type {number} */
  _level;

  /** @type {AttackDetail[]} */
  _attacks;

  /** @type {Artefact[]} */
  _equippedWeapons;

  /** @type {Artefact[]} */
  _equippedArmour;

  /**
   *
   * @param {Map<string, *>} initialTraits
   */
  constructor(initialTraits) {
    super(initialTraits ?? new Map([['NAME', 'mystery']]));
    this._proficiencyBonus = 0;
    this.#setInitialAbilityScores(ABILITY_KEYS);
    this.#initialiseHitPoints();
    this._refreshDerivedValues();
  }

  /**
   * Clone traits.
   * @return {Traits}
   */
  clone() {
    const actorTraits = super.clone();
    actorTraits._compositeAc = this._compositeAc;
    actorTraits._proficiencyBonus = this._proficiencyBonus;
    actorTraits._level = this._level;
    actorTraits._attacks = this._attacks.map((attack) => attack.clone());
    actorTraits._equippedWeapons = this._equippedWeapons; // reference okay
    actorTraits._equippedArmour = this._equippedArmour; // reference okay
    return actorTraits;
  }

  /**
   * Calculate the ability scores unless already set.
   * @param {string[]} keys
   */
  #setInitialAbilityScores(keys) {
    const values = arrayManip.randomise([15, 14, 13, 12, 10, 8]);
    let valueIndex = 0;
    keys.forEach((key) => {
      if (!this.get(key)) {
        const value = values[valueIndex++] ?? 8;
        this.set(key, value);
      }
    });
  }

  /**
   * Initialise the hit points unless already set.
   * This is calculated as the maximum hit dice roll + the constitution modifier.
   */
  #initialiseHitPoints() {
    const alreadyHasHp = this._traits.has('HP');
    const alreadyHasHpMax = this._traits.has('HP_MAX');
    if (alreadyHasHp && alreadyHasHpMax) {
      return;
    }
    const hitDice = this.get('HIT_DICE');
    if (hitDice) {
      const con = this.getInt('CON', 0);
      const conMod = characteristicToModifier(con);
      if (!alreadyHasHpMax) {
        this.set('HP_MAX', dice.maxRoll(hitDice) + conMod);
      }
      if (!alreadyHasHp) {
        this.set('HP', dice.maxRoll(hitDice) + conMod);
      }
    } else if (alreadyHasHp) {
      this.set('HP_MAX', this.get('HP'));
    }
  }

  /**
   * Get the effective armour class;
   * @returns {number}
   */
  getEffectiveAc() {
    return this._compositeAc;
  }

  /**
   * Get the effective armour class;
   * @returns {number}
   */
  getCharacterLevel() {
    return this._level;
  }

  /**
   * Get attacks.
   * @returns {AttackDetail[]}
   */
  getAttacks() {
    return this._attacks;
  }

  /**
   * Update derived values for new artefacts.
   * @param {Artefact[]} artefacts
   */
  utiliseArtefacts(artefacts) {
    this._equippedWeapons = artefacts.filter(
      (artefact) => artefact.artefactType === ArtefactType.WEAPON
    );
    this._equippedArmour = artefacts.filter(
      (artefact) => artefact.artefactType === ArtefactType.ARMOUR
    );
    this._refreshDerivedValues();
  }

  /**
   * @override
   * Refresh all derived values.
   * @param {string} updatedKey
   */
  _refreshDerivedValues(updatedKey) {
    if (!updatedKey || ABILITY_KEYS.includes(updatedKey)) {
      this._setLevelAndProfBonusFromExp();
      this._utiliseWeapons(this._equippedWeapons);
      this._utiliseArmour(this._equippedArmour);
    }
  }
  /**
   * Armour weapons. The armour classes are combined.
   * @param {Artefact[]} armour
   */
  _utiliseArmour(armour) {
    let armourClass = this.getInt('AC', 0); // character's base AC
    if (!armour || armour.length === 0) {
      this._compositeAc = armourClass;
      return;
    }
    let dexterity = this.getInt('DEX', 1);
    let additionalArmourClass = 0;
    let shieldArmourClass = 0;
    for (const item of armour) {
      switch (item.artefactType) {
        case ArtefactType.ARMOUR:
          {
            const acTrait = item.traits.get('AC', 0);
            const acValue = getAcUsingDexterity(item, dexterity);
            if (acTrait.startsWith('+')) {
              additionalArmourClass += acValue;
            } else if (acValue > armourClass) {
              armourClass = acValue;
            }
          }
          break;
        case ArtefactType.SHIELD:
          // only one shield ever used.
          shieldArmourClass = Math.max(
            shieldArmourClass,
            item.traits.getInt('AC', 0)
          );
          break;
      }
    }
    this._compositeAc = armourClass + additionalArmourClass + shieldArmourClass;
  }

  /**  */
  /**
   * Utilise weapons. The best option for equipped weapons is automatically selected
   * to give the maximum chance of damage. Up to two weapons are supported.
   * @param {Artefact[]} [weapons = []]
   */
  _utiliseWeapons(weapons = []) {
    this._attacks = [];

    const strength = this.getInt('STR', 1);
    const abilityModifier = characteristicToModifier(strength);
    if (weapons.length > 2) {
      LOG.error(
        `Unexpected number of equipped weapons. Expected 2; received ${weapons.length}`
      );
    }
    let firstAttack;
    let weaponType;
    let damageDice;
    let proficient;
    if (weapons.length === 0) {
      damageDice = '';
      weaponType = 'UNARMED';
      proficient = true;
    } else {
      damageDice = weapons[0].traits.get('DMG', '1D1') ?? '1D1';
      weaponType = weapons[0].traits.get('TYPE') ?? '';
      proficient = this.isProficient(weapons[0]);
    }

    firstAttack = new AttackDetail({
      damageDice: damageDice,
      weaponType: weaponType,
      proficiencyBonus: proficient ? this._proficiencyBonus : 0,
      abilityModifier: abilityModifier,
      secondAttack: false,
    });

    let secondAttack;
    if (weapons.length > 1) {
      secondAttack = new AttackDetail({
        damageDice: weapons[1].traits.get('DMG', '1D1') ?? '1D1',
        weaponType: weapons[1].traits.get('TYPE') ?? '',
        proficiencyBonus: this.isProficient(weapons[1])
          ? this._proficiencyBonus
          : 0,
        abilityModifier: strength,
        secondAttack: true,
      });
    }
    if (secondAttack?.twoWeaponFighting && firstAttack.twoWeaponFighting) {
      this._attacks.push(firstAttack);
      this._attacks.push(secondAttack);
    } else if (
      secondAttack &&
      secondAttack.getMaxDamage() > firstAttack.getMaxDamage()
    ) {
      secondAttack.isSecondAttack = false;
      this._attacks.push(secondAttack);
    } else {
      this._attacks.push(firstAttack);
    }
  }

  /**
   * Set the level and prof bonus. These are calculated from the experience.
   */
  _setLevelAndProfBonusFromExp() {
    const values = tables.getLevelAndProfBonusFromExp(this._traits.get('EXP'));
    this._level = values.level;
    this._proficiencyBonus = values.profBonus;
  }

  /**
   * Increase experience based on challenge rating.
   * @param {string|number} cr
   */
  adjustForDefeatOfActor(defeated) {
    const challengeRating = defeated.traits.get('CR');
    const gainedExp = tables.getXpFromCr(challengeRating);
    const currentExp = this.getInt('EXP', 0);
    const newExp = currentExp + gainedExp;
    LOG.info(`Experience increased from ${currentExp} to ${newExp}.`);
    this.set('EXP', newExp);
    this._setLevelAndProfBonusFromExp();
  }

  /**
   * Test if proficient with an item.
   * The test looks at the artefact's TYPE trait. If it includes one of this trait's
   * PROF entries, the result is true. This means that a PROF entry of 'melee' would
   * match 'simple melee' and 'martial melee'.
   * @param {Artefact} item
   * @returns {boolean}
   */
  isProficient(artefact) {
    const proficiencies = this._traits.get('PROF');
    const artefactSubtype = artefact.traits.get('TYPE');
    for (const prof of proficiencies) {
      const words = prof.split(' ');
      let allWordsIncluded = true;
      for (const word of words) {
        if (!artefactSubtype.includes(word)) {
          allWordsIncluded = false;
          break;
        }
      }
      if (allWordsIncluded) {
        return true;
      }
    }
    return false;
  }
}

/**
 * DnD artefact traits
 */
export class ArtefactTraits extends Traits {
  /**
   *
   * @param {Map<string, *>} initialTraits
   */
  constructor(initialTraits) {
    super(initialTraits ?? new Map([['NAME', 'mystery']]));
  }
}

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
import * as dice from '../utils/dice.js';
import * as tables from './tables.js';
import {
  getTraitAdjustmentDetails,
  getClassAbilities,
  getAttackModifiers,
} from './abilityGenerator.js';
import { Difficulty } from './dndAction.js';

import LOG from '../utils/logging.js';

/**  Main character stats. Note that armour class is included. */
const CHAR_STATS_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA', 'AC'];

const FEET_PER_TILE = 7.5;
/**
 * Convert a value to a modifier.
 * @param {number} value
 * @returns {number}
 */
export function characteristicToModifier(value) {
  return Math.floor((value - 10) / 2);
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
  #twoWeaponFighting;
  /** @type {boolean} */
  unarmed;

  /**
   *
   * @param {module:players/artefacts.Artefact} weapon
   * @param {Object} options
   * @param {string} options.damageDice
   * @param {string} options.weaponType - UNARMED makes this an unarmed strike.
   * @param {number} options.proficiencyBonus
   * @param {number} options.abilityModifier
   */
  constructor(options) {
    this.damageDice = options.damageDice ?? '1D1';
    const subType = options.weaponType ?? '';
    if (subType === 'UNARMED') {
      this.unarmed = true;
      this.#twoWeaponFighting = false;
    } else if (subType.includes('SIMPLE') && subType.includes('LIGHT')) {
      this.unarmed = false;
      this.#twoWeaponFighting = true;
    } else {
      this.unarmed = false;
      this.#twoWeaponFighting = false;
    }
    this.proficiencyBonus = options?.proficiencyBonus ?? 0;
    this.abilityModifier = options?.abilityModifier ?? 0;
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
      return dice.maxRoll(this.damageDice) + this.abilityModifier;
    }
  }

  /**
   * Is two weapon fighting allowed.
   * @returns {boolean}
   */
  canUseTwoWeapons() {
    return this.#twoWeaponFighting;
  }

  /**
   * Roll for attack.
   * @returns {{roll:number, value: number}}
   */
  rollForAttack() {
    const roll = dice.rollDice(20);
    LOG.info(
      `Attack roll ${roll} + ability(${this.abilityModifier})+ proficiency(${this.proficiencyBonus})`
    );
    return {
      roll: roll,
      value: roll + this.abilityModifier + this.proficiencyBonus,
    };
  }

  /**
   * Roll for damage.
   * @returns {number}
   */
  rollForDamage() {
    if (this.unarmed) {
      return this.#getUnarmedDamage();
    }

    const damage = dice.rollMultiDice(this.damageDice) + this.abilityModifier;
    LOG.debug(
      `Damage: ${this.damageDice} + ability(${this.abilityModifier}) = ${damage}`
    );
    return damage;
  }

  /**
   * Clone
   * @returns {AttackDetail}
   */
  clone() {
    const attackDetail = new AttackDetail({});
    attackDetail.abilityModifier = this.abilityModifier;
    attackDetail.damageDice = this.damageDice;
    attackDetail.proficiencyBonus = this.proficiencyBonus;
    attackDetail.#twoWeaponFighting = this.#twoWeaponFighting;
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
    return this;
  }

  /**
   * Does traits have key.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this._traits.has(key) || this._traits.has('_' + key);
  }

  /**
   * @param {string} key
   * @param {*} value
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
   * Delete the trait value.
   * @param {string} key
   * @returns {boolean} true if deleted; false if didn't  exist
   */
  delete(key) {
    return this._traits.delete(key);
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
   * Add an integer value. Derived values are not recalculated.
   * @param {string} key
   * @param {number} value
   */
  addInt(key, value) {
    const currentValue = this.getInt(key);
    const newValue = maths.safeParseInt(value) + currentValue;
    this._traits.set(key, newValue);
  }

  /**
   * Take a value normally entered in feet and convert to tiles.
   * @param {string} key
   * @param {number} defValue - default if not found.
   * @returns {number} results rounded to nearest int.
   */
  getValueInFeetInTiles(key, defValue) {
    const valueInFeet = this.getInt(key);
    if (valueInFeet === null || valueInFeet === undefined) {
      return defValue;
    }
    return Traits.feetToTiles(valueInFeet);
  }

  /**
   * Convert a value in feet to whole number of tiles.
   * @param {*} valueInFeet
   * @returns {number}
   */
  static feetToTiles(valueInFeet) {
    return Math.round(valueInFeet / FEET_PER_TILE);
  }

  /**
   * Get the trait value as an float. This will look first for the key and then the key
   * preceded by an underscore.
   * @param {string} key
   * @param {*} defValue - default value;
   * @returns {number}
   */
  getFloat(key, defValue) {
    const result = this.get(key, defValue);
    return maths.safeParseFloat(result, defValue);
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
   * @returns {string[]} first element has the adjusted key and the second the value.
   */
  #imposeCase(key, value) {
    key = key.toUpperCase();
    if (key !== 'NAME' && key !== 'REWARD') {
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
      case '_PROF':
        return this.#setProficienciesFromString(key, value);
      case 'VALUE':
      case '_VALUE':
        return this.#setCostValueFromString(key, value);
      case 'DMG':
      case '_DMG':
      case 'HP_GAIN':
      case '_HP_GAIN':
        return this.#setIntOrDiceValueFromString(key, value);
      case 'HIT_DICE':
      case '_HIT_DICE':
        return this.#setDiceValueFromString(key, value);
      case 'DC':
      case '_DC':
      case 'IDENTIFY_DC':
      case '_IDENTIFY_DC':
        return this.#setDCValueFromString(key, value);
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
      LOG.error(`Invalid value for VALUE trait: ${value}`);
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
   * Set the trait for key to value.
   * The DC value is normally an int but a dndAction difficulty can be
   * used.
   * @param {string} key
   * @param {string} value
   */
  #setDCValueFromString(key, value) {
    let difficulty;
    if (isNaN(value)) {
      difficulty = Difficulty[value] ?? 1;
    } else {
      difficulty = maths.safeParseInt(value);
    }
    this.set(key, difficulty);
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
    let result;
    if (dice.isMultiDice(value)) {
      result = value;
    } else {
      result = parseInt(value);
      if (isNaN(result)) {
        LOG.error(
          `Invalid trait value ${value} for ${key}. Integer or dice definition required.`
        );
        result = 0;
      }
    }
    this.set(key, result);
  }
  /**
   * Set the trait for key to value. This is for a value passed in by the
   * #setValueFromString method.
   * If the value is a multidice, it is rolled and the resulting value used.
   * @param {string} key
   * @param {string} value
   */
  #setGenericValueFromString(key, value) {
    if (value === 'YES' || value === 'TRUE') {
      value = true;
    } else if (value === 'NO' || value === 'FALSE') {
      value = false;
    } else if (dice.isMultiDice(value) && key !== 'DMG') {
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
    this._traits.set(key, proficiencies);
  }

  /**
   * Clone traits.
   * @return {Traits}
   */
  clone() {
    return new Traits(this._traits);
  }
  /**
   * Get all traits. This is a copy of the underlying traits.
   * @returns {Map<string, *>}
   */
  getAllTraits() {
    return new Map([...this._traits.entries()]);
  }

  /**
   * Get all traits. This is a copy of the underlying traits sorted by key name.
   * @returns {Map<string, *>}
   */
  getAllTraitsSorted() {
    return new Map([...this._traits.entries()].sort());
  }

  /**
   * Get all trait values as a string
   */
  valuesToString() {
    let result = '';
    this._traits.forEach((value, key) => {
      if (result !== '') {
        result += ',';
      }
      result += `${key}:${value}`;
    });
    return result;
  }
  /**
   * Stringify traits.
   * @return {module:utils/persistentData~ObjectJSON}
   */
  toJSON() {
    return {
      reviver: 'Traits',
      data: [...this._traits],
    };
  }

  /**
   * Revive object created using toJSON
   * @param {Array.Array<key,value>} data - array of map initialisation values
   * @returns {Traits}
   */
  static revive(data) {
    return new Traits(new Map(data));
  }
}

/**
 * DnD magic traits
 */
export class MagicTraits extends Traits {
  /**
   *
   * @param {Map<string, *>} initialTraits
   */
  constructor(initialTraits) {
    super(initialTraits ?? new Map());
  }

  /**
   * Get the damage dice when cast by an actor.
   * @param {Traits} actorTraits
   * @returns {string}
   */
  getDamageDiceWhenCastBy(actorTraits) {
    const damageDice = this.get('DMG');
    return this.#getAdjustedDiceWhenCastBy(damageDice, actorTraits);
  }

  /**
   * Get the damage dice when cast by an actor.
   * @param {Traits} actorTraits
   * @returns {string}
   */
  getHpGainDiceWhenCastBy(actorTraits) {
    const hpDice = this.get('HP_GAIN');
    return this.#getAdjustedDiceWhenCastBy(hpDice, actorTraits);
  }
  /**
   * Get the health or damage dice when cast by an actor.
   * @param {string} baseDice
   * @param {Traits} actorTraits
   * @returns {string}
   */
  #getAdjustedDiceWhenCastBy(baseDice, actorTraits) {
    const extraDicePerLevel = this.getFloat('DICE_PER_LEVEL', 0);
    const extraDice = Math.floor(
      (actorTraits.getCharacterLevel() - 1) * extraDicePerLevel
    );
    let adjustedDice = dice.changeQtyOfDice(baseDice, extraDice);
    LOG.info(
      `Spell cast: base damage dice = ${baseDice} raised to ${adjustedDice} for level.`
    );
    return adjustedDice;
  }

  /**
   * Convert to JSON
   * @returns {module:utils/persistentData~ObjectJSON}
   */
  toJSON() {
    const json = super.toJSON();
    json.reviver = 'MagicTraits';
    return json;
  }
  /**
   * Revive from previous call to toJSON
   * @param {Array.Array<key,value>} data - array of map values
   */
  static revive(data) {
    return new MagicTraits(new Map(data));
  }
}

/**
 * @typedef {Object} ArtefactTraitsCollection
 * @property {Traits[]} weapons
 * @property {Traits[]} armour
 * @property {Traits[]} shields
 * @property {Traits[]} magic
 */
/**
 * DnD character traits
 */
export class CharacterTraits extends Traits {
  /** @type {number} */
  _proficiencyBonus;
  /** @type {number} */
  _level;

  /** @type {AttackDetail[]} */
  _attacks;

  /** @type {ArtefactTraitsCollection} */
  _availableArtefactTraits;

  /** @type {Traits[]} */
  _transientFxTraits;

  /** @type {Traits} */
  _effectiveTraits;

  /** Amount movement is reduced in tiles */
  _maxTileMovePerTurn;

  /** Flag to allow calculation of derived parameters. @type{boolean} */
  _allowRefreshDerived = false;
  /**
   *
   * @param {Map<string, *>} initialTraits
   */
  constructor(initialTraits) {
    super(initialTraits ?? new Map([['NAME', 'mystery']]));
    this._proficiencyBonus = 0;
    this.#setInitialAbilityScores();
    this._transientFxTraits = [];
    this._allowRefreshDerived = true;
    this._refreshDerivedValues();
  }

  /**
   * Get the movement per turn.
   * This takes into account any impediments to motion.
   */
  getMaxTilesPerMove() {
    return this._maxTileMovePerTurn;
  }
  /**
   * Clone traits.
   * @return {Traits}
   */
  clone() {
    /** @type {CharacterTraits} */
    const actorTraits = new CharacterTraits(this._traits);
    actorTraits._proficiencyBonus = this._proficiencyBonus;
    actorTraits._level = this._level;
    actorTraits._attacks = this._attacks.map((attack) => attack.clone());
    actorTraits._availableArtefactTraits = this._availableArtefactTraits; //reference okay
    actorTraits._effectiveTraits = this._effectiveTraits.clone();
    actorTraits._transientFxTraits = [];
    this._transientFxTraits.forEach((traits) =>
      actorTraits._transientFxTraits.push(traits.clone())
    );
    actorTraits._maxTileMovePerTurn = this._maxTileMovePerTurn;
    return actorTraits;
  }

  /**
   * Exceed abilities of another character. The character's key stats, excluding AC,
   * and EXP are set the other's + extra if they exceed the current values.
   * @param {Traits} other
   * @param {number} [extra = 0]
   */
  exceedAbilitiesAndExp(other, extra = 0) {
    ['STR', 'DEX', 'INT', 'WIS', 'CON', 'CHA', 'EXP'].forEach((key) => {
      const otherValue = other.getInt(key) + extra;
      const myValue = this.getInt(key);
      if (otherValue > myValue) {
        this.set(key, otherValue);
      }
    });
  }

  /** Add transient traits. Note only values which affect CHAR_STATS_KEYS are
   * used. To be used, the trait should begin with FX_. This is to distinguish
   * traits which affect a victim from traits which are characteristics of the
   * owner.
   * @param {Traits}
   */
  addTransientFxTraits(traits) {
    const traitsSubset = new Traits();
    let hasEffect = false;
    CHAR_STATS_KEYS.forEach((key) => {
      const fxKey = CharacterTraits.toFxKey(key);
      const value = traits.getInt(fxKey);
      if (value) {
        hasEffect = true;
        traitsSubset.set(fxKey, value);
      }
    });
    if (hasEffect) {
      this._transientFxTraits.push(traitsSubset);
      this._refreshDerivedValues();
    }
  }

  /**
   * Clear transient traits.
   */
  clearTransientFxTraits() {
    this._transientFxTraits = [];
    this._refreshDerivedValues();
  }

  /**
   * Set initial ability scores and EXP unless already set.
   */
  #setInitialAbilityScores() {
    const baseAbilities = getClassAbilities(this.get('CLASS'));
    baseAbilities.forEach((value, key) => {
      if (!this.get(key)) {
        this.set(key, value ?? 8);
      }
    });
    if (!this.has('EXP')) {
      this.set('EXP', 0);
    }
  }
  /**
   * Initialise the hit points unless already set.
   * This is calculated as the maximum hit dice roll + the constitution modifier.
   */
  _updateHitPoints() {
    const alreadyHasHp = this._traits.has('HP');
    const alreadyHasHpMax = this._traits.has('HP_MAX');
    const hitDice = this.get('HIT_DICE');
    if (alreadyHasHp && alreadyHasHpMax && !hitDice) {
      return;
    }

    if (hitDice) {
      const con = this.getInt('CON', 0);
      const conMod = characteristicToModifier(con);
      const maxRoll = dice.maxRoll(hitDice);
      const averageDiceRoll = Math.ceil((maxRoll + 1) / 2);
      const hpMax =
        maxRoll + conMod + (this._level - 1) * (averageDiceRoll + conMod);
      this.set('HP_MAX', hpMax);

      if (!alreadyHasHp) {
        this.set('HP', dice.maxRoll(hitDice) + conMod);
      }
    } else if (alreadyHasHp) {
      this.set('HP_MAX', this.get('HP'));
    }
  }

  /** Traits that affect victims rather than the owner are preceded by 'FX'.
   * This function converts a key to an FX key; i.e. 'FX_key'.
   * @param {string} key
   * @returns {string}
   */
  static toFxKey(key) {
    return `FX_${key}`;
  }

  /**
   * Test if there is an effective trait overriding the base trait.
   * @param {key}
   * @returns {boolean}
   */
  hasEffective(key) {
    return this._effectiveTraits ? this._effectiveTraits.has(key) : false;
  }
  /**
   * Get the effective traits value. This differs from the underlying traits
   * value as it can include armour, weapons, transient effects, and magical
   * items. If the value is not in the _effectiveTraits, the underlying value is
   * returned.
   * @param {key}
   * @param {*} defaultValue
   * @returns {*}
   */
  getEffective(key, defaultValue) {
    return this._effectiveTraits.get(key) ?? this.get(key, defaultValue);
  }

  /**
   * Get the effective traits value. This differs from the underlying traits
   * value as it can include armour, weapons, transient effects, and magical
   * items. If the value is not in the _effectiveTraits, the underlying value is
   * returned.
   * @param {key}
   * @param {number} defaultValue
   * @returns {number}
   */
  getEffectiveInt(key, defaultValue) {
    return maths.safeParseInt(this.getEffective(key), defaultValue);
  }

  /**
   * Get the effective character level;
   * @returns {number}
   */
  getCharacterLevel() {
    return this._level;
  }

  /** Get the save ability modifier for an attack by the attacker.
   * This is not applicable to melee attacks.
   *
   */
  getNonMeleeSaveAbilityModifier(attackerTraits) {
    const saveAbility = attackerTraits.get('SAVE_BY');
    if (!saveAbility) {
      LOG.error(`Non-melee ${attackerTraits.get('NAME')} has no SAVE_BY set.`);
      return 0;
    }
    const ability = this.getInt(saveAbility);
    return characteristicToModifier(ability ?? 0);
  }

  /**
   * Get the proficiency bonus;
   * @param {Traits| string} artefactTraitsOrType - traits or the artefact TYPE trait
   * @returns {number}
   */
  getCharacterPb(artefactTraitsOrType) {
    return this.isProficient(artefactTraitsOrType) ? this._proficiencyBonus : 0;
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
   * @param {ArtefactTraitsCollection} availableTraits
   */
  utiliseAdditionalTraits(availableTraits) {
    this._availableArtefactTraits = availableTraits;
    this._refreshDerivedValues();
  }

  /**
   * Refresh all derived values. Note that if the traits has a damage property
   * set, the values are taken directly from the traits, rather than looking
   * at equipped weapons and armour. This is because monsters have their properties
   * set including the weapons they carry. This also means it is possible to
   * equip a monster without it affecting its fighting characteristics.
   * @override
   * @param {string} updatedKey
   */
  _refreshDerivedValues(updatedKey) {
    if (!this._allowRefreshDerived) {
      return;
    }
    if (!updatedKey || CHAR_STATS_KEYS.includes(updatedKey)) {
      this._adjustForExperience();
      this._updateHitPoints();
      this._initialiseEffectiveTraits();
      if (this._traits.get('TYPE_ID') === 'ENEMY') {
        this._deriveValuesFromTraits();
      } else {
        this._utiliseTransientTraits();
        this._utiliseMagicTraits();
        this._utiliseWeaponsTraits();
        this._utiliseArmourAndShieldTraits();
        this._adjustMovementForArmour();
      }
    }
  }

  /**
   * Calculate derived values directly from the traits. I.e. ignore any equipped
   * armour or weapons.
   */
  _deriveValuesFromTraits() {
    this._maxTileMovePerTurn = this.getValueInFeetInTiles('SPEED', 1);
    this._attacks = [];
    const strength = this.getInt('STR', 1);
    const abilityModifier = characteristicToModifier(strength);
    const attack = new AttackDetail({
      damageDice: this._traits.get('DMG'),
      weaponType: 'ALMANAC',
      proficiencyBonus: this._traits.get('PB', 0),
      abilityModifier: abilityModifier,
      secondAttack: false,
    });

    this._attacks.push(attack);
  }

  /**
   * Initialise the effective traits to the base values.
   */
  _initialiseEffectiveTraits() {
    this._effectiveTraits = new Traits();
    CHAR_STATS_KEYS.forEach((key) => {
      this._effectiveTraits.set(key, this.getInt(key, 0));
    });
  }
  /**
   * Utilise transient traits. Only character stat keys are used.
   * These are added to the effect traits and should be called before
   * utilising magic, armour or weapons.

   */
  _utiliseTransientTraits() {
    this._transientFxTraits?.forEach((traits) => {
      LOG.debug(`Transient traits: ${traits.valuesToString()}`);
      this._addFxTraitsToEffectiveTraits(traits);
    });
  }

  /**
   * Add FX traits to effective traits.
   * Any traits for a CHAR_STATS_KEY preceded by 'FX_' is added to the effective
   * traits. Note the value is **added** to the existing value;
   * @param {Traits} traits
   */
  _addFxTraitsToEffectiveTraits(traits) {
    CHAR_STATS_KEYS.forEach((key) => {
      const value = traits.getInt(CharacterTraits.toFxKey(key));
      if (value) {
        this._effectiveTraits.addInt(key, value);
      }
    });
  }
  /**
   * Utilise magic traits. Only character stat keys are used.
   * Note that magic items should only affect the 6 key abilities and not the
   * armour class. An item that directly affects the AC value should be treated
   * as an ARMOUR or SHIELD item rather than a magical item.
   */
  _utiliseMagicTraits() {
    if (!this?._availableArtefactTraits?.magic) {
      return;
    }
    for (const traits of this._availableArtefactTraits.magic) {
      LOG.debug(`Magic traits: ${traits.valuesToString()}`);
      this._addFxTraitsToEffectiveTraits(traits);
    }
  }

  /**
   * Utilise armour and shields. The armour classes are combined.
   * Note that magical items must be utilised first as these might affect
   * the actor's dexterity.
   */
  _utiliseArmourAndShieldTraits() {
    let armourClass = this.getEffectiveInt('AC', 0); // character's base AC
    const armourTraits = this?._availableArtefactTraits?.armour;
    const shieldTraits = this?._availableArtefactTraits?.shields;
    let additionalArmourClass = 0;
    let shieldArmourClass = 0;
    armourTraits?.forEach((traits) => {
      const acInfo = this._getAcFromTraits(traits);
      if (acInfo.additional) {
        additionalArmourClass += acInfo.value;
      } else if (acInfo.value > armourClass) {
        armourClass = acInfo.value;
      }
    });

    shieldTraits?.forEach((traits) => {
      shieldArmourClass = Math.max(shieldArmourClass, traits.getInt('AC', 0));
    });

    const compositeAc = armourClass + additionalArmourClass + shieldArmourClass;
    this._effectiveTraits.set('AC', compositeAc);
  }

  /**
   * Armour can impede an actor's movement. This sets any movement inhibition
   * based on the armour.
   */
  _adjustMovementForArmour() {
    const baseSpeedInFeet = this.getFloat('SPEED', 1);
    this._maxTileMovePerTurn = Math.max(1, Traits.feetToTiles(baseSpeedInFeet)); // default base movement

    if (!this._availableArtefactTraits?.armour) {
      return;
    }

    for (const traits of this._availableArtefactTraits.armour) {
      if (
        traits.get('TYPE', '').toUpperCase().includes('HEAVY') &&
        traits.getInt('STR', 0) > this.getEffectiveInt('STR')
      ) {
        this._maxTileMovePerTurn = Math.max(
          1,
          Traits.feetToTiles(baseSpeedInFeet - 10)
        );
        return;
      }
    }
  }
  /**
   * Utilise weapons traits. The best option for equipped weapons is automatically selected
   * to give the maximum chance of damage. Up to two weapons are supported.
   * Note that magical items must be utilised first as these might affect the
   * character's strength.
   */
  _utiliseWeaponsTraits() {
    this._attacks = [];
    const weaponsTraits = this?._availableArtefactTraits?.weapons ?? [];

    const strength = this.getEffectiveInt('STR', 1);
    const abilityModifier = characteristicToModifier(strength);
    const attackModifiers = getAttackModifiers(this.get('CLASS'));
    const effectivePb = this._proficiencyBonus * attackModifiers.pbMultiplier;
    if (weaponsTraits.length > 2) {
      LOG.error(
        `Unexpected number of equipped weapons. Expected 2; received ${weaponsTraits.length}`
      );
    }
    let firstAttack;
    let weaponType;
    let damageDice;
    let proficient;
    if (weaponsTraits.length === 0) {
      damageDice = '';
      weaponType = 'UNARMED';
      proficient = true;
    } else {
      damageDice = weaponsTraits[0].get('DMG', '1D1') ?? '1D1';
      weaponType = weaponsTraits[0].get('TYPE') ?? '';
      proficient = this.isProficient(weaponsTraits[0]);
    }

    firstAttack = new AttackDetail({
      damageDice: damageDice,
      weaponType: weaponType,
      proficiencyBonus: proficient ? effectivePb : 0,
      abilityModifier: abilityModifier,
    });

    let secondAttack;
    if (weaponsTraits.length > 1) {
      secondAttack = new AttackDetail({
        damageDice: weaponsTraits[1].get('DMG', '1D1') ?? '1D1',
        weaponType: weaponsTraits[1].get('TYPE') ?? '',
        proficiencyBonus: this.isProficient(weaponsTraits[1]) ? effectivePb : 0,
        abilityModifier: abilityModifier,
      });
    }
    if (secondAttack?.canUseTwoWeapons() && firstAttack.canUseTwoWeapons()) {
      this._attacks.push(firstAttack);
      if (secondAttack.abilityModifier > 0) {
        secondAttack.abilityModifier = 0;
      }
      this._attacks.push(secondAttack);
    } else if (
      secondAttack &&
      secondAttack.getMaxDamage() > firstAttack.getMaxDamage()
    ) {
      this._attacks.push(secondAttack);
    } else {
      this._attacks.push(firstAttack);
    }
  }

  /**
   * Apply dexterity modifier to an item to get its AC value.
   * @param {Traits} traits
   * @returns {{additional:boolean, value:number}} additional is true if this should
   * be added to current value rather than as a replacement.
   */
  _getAcFromTraits(traits) {
    const dexterity = this.getEffectiveInt('DEX', 1);
    const modifier = characteristicToModifier(dexterity);
    const armourType = traits.get('TYPE', '').toUpperCase();
    const acTrait = traits.get('AC', 1);
    let armourClass = maths.safeParseInt(acTrait);
    if (armourType.includes('MEDIUM')) {
      armourClass += Math.min(2, modifier);
    } else if (!armourType.includes('HEAVY')) {
      armourClass += modifier;
    }
    return {
      additional: /^[+-]/.test(acTrait),
      value: armourClass,
    };
  }

  /**
   * Set the level and prof bonus. These are calculated from the experience.
   */
  _adjustForExperience() {
    const currentLevel = this._level ?? 1;
    const values = tables.getLevelAndProfBonusFromExp(this._traits.get('EXP'));
    this._level = values.level;
    this._proficiencyBonus = values.profBonus;
    this._adjustTraitsForLevelChange(currentLevel, this._level);
  }

  /**
   * Adjust traits for a level change.
   * @param {number} oldLevel
   * @param {number} newLevel
   */
  _adjustTraitsForLevelChange(oldLevel, nextLevel) {
    const details = getTraitAdjustmentDetails(this.get('CLASS'));
    if (details.levels.length === 0) {
      return;
    }
    let availableGain = 0;
    for (const level of details.levels) {
      if (level > nextLevel) {
        break;
      }
      if (level > oldLevel) {
        availableGain += details.gainPerAdjustment;
      }
    }
    let traitIndex = 0;
    while (availableGain > 0 && traitIndex < details.traits.length) {
      const key = details.traits[traitIndex];
      let value = this.get(key);
      if (value < details.maxAbility) {
        this.set(key, value + 1);
        availableGain--;
      } else {
        traitIndex++;
      }
    }
  }

  /**
   * @typedef {Object} ValueChangeInfo
   * @property {*} was
   * @property {*} now
   */
  /**
   * Increase experience, level and proficiency bonus
   *  based on challenge rating.
   * @param {Traits} defeatedTraits
   * @returns {{exp: ValueChangeInfo, level: ValueChangeInfo}}
   */
  adjustForDefeatOfActor(defeatedTraits) {
    const challengeRating = defeatedTraits.get('CR');
    const gainedExp = tables.getXpFromCr(challengeRating);
    const currentExp = this.getInt('EXP', 0);
    const newExp = currentExp + gainedExp;
    LOG.info(`Experience increased from ${currentExp} to ${newExp}.`);
    this.set('EXP', newExp);
    const currentLevel = this._level;
    this._adjustForExperience();
    const newLevel = this._level;
    return {
      exp: { was: currentExp, now: newExp },
      level: { was: currentLevel, now: newLevel },
    };
  }

  /**
   * Test if proficient with an item.
   * The test looks at the artefact's TYPE trait. If it includes one of this trait's
   * PROF entries, the result is true. This means that a PROF entry of 'melee' would
   * match 'simple melee' and 'martial melee'. You can pass in a string which will be
   * taken as the TYPE trait.
   * @param {Traits | string} artefactTraitsOrType
   * @returns {boolean}
   */
  isProficient(artefactTraitsOrType) {
    const proficiencies = this.get('PROF');
    const artefactSubtype =
      typeof artefactTraitsOrType === 'string'
        ? artefactTraitsOrType
        : artefactTraitsOrType.get('TYPE');
    if (!proficiencies || !artefactSubtype) {
      return false;
    }
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
  /**
   * Convert to JSON. Note transient FXs are not saved as these are
   * not persistent. Also additional traits from equipment are not
   * included as equipment, etc. are utilised when a character is revived.
   * @returns {module:utils/persistentData~ObjectJSON}
   */
  toJSON() {
    const json = super.toJSON();
    json.reviver = 'CharacterTraits';
    return json;
  }
  /**
   * Revive from previous call to toJSON
   * @param {Array.Array<key,value>} data - array of map values
   */
  static revive(data) {
    return new CharacterTraits(new Map(data));
  }
}

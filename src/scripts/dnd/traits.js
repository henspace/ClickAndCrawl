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
import { ArtefactType } from '../utils/game/artefacts.js';
import { biggestMultiDice } from '../utils/dice.js';
/**
 * This is basically a Map with some special derived characteristics.
 */
export class Traits {
  /** Characteristics @type {Map<string, *>} */
  #traits;

  /** @type {number} */
  #compositeAc;
  /** @type {number} */
  #compositeDmg;

  /**
   * Initialise the traits.
   * @param {Map<string, *>} initialValues
   */
  constructor(initialValues) {
    this.#traits = new Map(initialValues);
    this.#compositeAc = this.#traits.get('AC', 0);
    this.#compositeDmg = this.#traits.get('DMG', '1D4');
  }

  /**
   * Get the effective armour class;
   * @returns {number}
   */
  get effectiveAc() {
    return this.#compositeAc;
  }

  /**
   * Get the effective damage.
   * @returns {number}
   */
  get effectiveDamage() {
    return this.#compositeDmg;
  }

  /**
   * Update composite values.
   * @param {Artefact[]} artefacts
   */
  utiliseArtefacts(artefacts) {
    const baseArmourClass = this.get('AC', 0);
    const baseDamage = this.get('DMG', '1D4');
    let artefactsArmourClass = 0;
    let artefactsDamage = '1D1';
    for (const item of artefacts) {
      if (item.artefactType === ArtefactType.ARMOUR) {
        artefactsArmourClass += item.traits.get('AC', 0);
      } else if (item.artefactType === ArtefactType.WEAPON) {
        artefactsDamage = biggestMultiDice(
          item.traits.get('DMG', '1D1'),
          artefactsDamage
        );
      }
    }
    this.#compositeAc = Math.max(baseArmourClass, artefactsArmourClass);
    this.#compositeDmg = biggestMultiDice(baseDamage, artefactsDamage);
  }

  /**
   * @param {string} key
   * @param {*} value
   * @throws {Error} thrown if key invalid.
   */
  set(key, value) {
    this.#traits.set(key, value);
  }

  /**
   * Get the trait value. This will look first for the key and then the key
   * preceded by an underscore.
   * @param {string} key
   * @param {*} defValue - default value;
   * @returns {*}
   */
  get(key, defValue) {
    return this.#traits.get(key) ?? this.#traits.get('_' + key) ?? defValue;
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
  setFromString(definition) {
    definition.split(',').forEach((item) => {
      const match = item.match(/^\s*(\w+)\s*[=: ]\s*(.+?)\s*$/);
      if (!match) {
        return;
      }
      const [key, value] = this.#imposeCase(match[1], match[2]);
      if (match) {
        this.#setValue(key, value);
      } else {
        throw new Error(`Invalid property definition'${item}'`);
      }
    });
    this.#compositeAc = this.#traits.get('AC', 0);
    this.#compositeDmg = this.#traits.get('DMG', '1D4');
    return this;
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
   * Set the trait for key to value.
   * + If the value comprises two numbers separated by
   * a /, the value for the key is set to the numerator and a new key key_MAX is created,
   * set to the denominator.
   * + If the value comprises two numbers separated by a >, the value for the key
   * is set to a random value between (inclusive) the two values, and a new key key_MAX is created,set to the second number.
   * @param {string} key
   * @param {string} value
   */
  #setValue(key, value) {
    const minMaxMatch = value.match(/(\d+) *([/>]) *(\d+)([a-zA-Z ]*)/);
    if (minMaxMatch) {
      let traitValue;
      const suffix = minMaxMatch[4].trimEnd();
      if (minMaxMatch[2] === '>') {
        traitValue = maths.getRandomIntInclusive(
          minMaxMatch[1],
          minMaxMatch[3]
        );
      } else {
        traitValue = minMaxMatch[1];
      }
      this.#traits.set(key, traitValue + suffix);
      this.#traits.set(`${key}_MAX`, minMaxMatch[3] + suffix);
    } else {
      this.#traits.set(key, value);
    }
  }

  /**
   * Clone traits.
   * @return {Traits}
   */
  clone() {
    const actorTraits = new Traits(this.#traits);
    return actorTraits;
  }

  /**
   * Get all traits. This is a copy of the underlying traits sorted by key name.
   * @returns {Map<string, *>}
   */
  getAllTraits() {
    return new Map([...this.#traits.entries()].sort());
  }
}

/**
 * DnD character traits
 */
export class CharacterTraits extends Traits {
  /**
   *
   * @param {Map<string, *>} initialTraits
   */
  constructor(initialTraits) {
    super(initialTraits ?? new Map([['NAME', 'mystery']]));
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

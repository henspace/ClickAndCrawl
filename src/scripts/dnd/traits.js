/**
 * @file Dungeon and dragons properties
 *
 * @module dnd/traits
 *
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

/**
 * This is basically a Map but with the key difference that
 * only keys set during the configuration are allowed. If no keys are provided,
 * the traits are regarded as freeform and any keys are allowed.
 */
export class ActorTraits {
  /** Characteristics @type {Map<string, *>} */
  #traits;
  /** @type {boolean} */
  #freeform;

  /**
   * Initialise the traits.
   * @param {Map<string, *>} initialValues
   */
  constructor(initialValues) {
    if (initialValues) {
      this.#traits = new Map(initialValues);
      this.#freeform = false;
    } else {
      this.#traits = new Map();
      this.#freeform = true;
    }
  }

  /**
   * @param {string} key
   * @param {*} value
   * @throws {Error} thrown if key invalid.
   */
  set(key, value) {
    if (this.#freeform || this.#traits.has(key)) {
      this.#traits.set(key, value);
    } else {
      throw new Error(`Attempt to set invalid key '${key}'`);
    }
  }

  /**
   * Get the trait value.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    return this.#traits.get(key);
  }

  /**
   * Populate the traits from a string definition. The definition comprises a
   * comma separated list of characteristics with each characteristic comprising
   * a keyword followed by a space or equals sign and then its value.
   * @param {string} definition
   * @returns {ActorTraits} returns this to allow chaining.
   * @throws {Error} if definition invalid.
   */
  setFromString(definition) {
    definition.split(',').forEach((item) => {
      const match = item.match(/^\s*(\w+)\s*[=: ]\s*(.+?)\s*$/);
      if (match) {
        this.#setAutoMaxValue(match[1], match[2]);
      } else {
        throw new Error(`Invalid property definition'${item}'`);
      }
    });
    return this;
  }

  /**
   * Set the trait for key to value. If value is a fraction, then the value for
   * the key is set to the numerator and a new key key_MAX is created, set to the
   * denominator.
   * @param {string} key
   * @param {string} value
   */
  #setAutoMaxValue(key, value) {
    const minMaxMatch = value.match(/(\d+) *[/] *(\d+) */);
    if (minMaxMatch) {
      this.#traits.set(key, minMaxMatch[1]);
      this.#traits.set(`${key}_MAX`, minMaxMatch[2]);
    } else {
      this.#traits.set(key, value);
    }
  }

  /**
   * Clone traits.
   * @return {ActorTraits}
   */
  clone() {
    const actorTraits = new ActorTraits(this.#traits);
    actorTraits.#freeform = this.#freeform;
    return actorTraits;
  }
}

/**
 * DnD character traits
 */
export class CharacterTraits extends ActorTraits {
  /**
   *
   * @param {Map<string, *>} initialTraits
   */
  constructor(initialTraits) {
    super(
      initialTraits ??
        new Map([
          ['NAME', 'mystery'],
          ['MOVEMENT', 'wander'],
          ['HP', 10],
          ['HP_MAX', 10],
          ['STR', 10],
          ['STR_MAX', 10],
        ])
    );
  }
}

/**
 * @file Long term effect of toxins; this is broad and can be used for poisons
 * or diseases
 *
 * @module dnd/toxins
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

export class Toxin {
  /** @type {number} */
  #pendingHpChange;
  /** @type {number} */
  #hpPerTurn;

  /**
   * Construct toxin
   * @param {number} [hpPerTurn = 0] - HP change per turn. Can be fractional
   * @param {number} [pendingHpChange = 0] - initial amount already pending
   */
  constructor(hpPerTurn = 0, pendingHpChange = 0) {
    this.#hpPerTurn = hpPerTurn;
    this.#pendingHpChange = pendingHpChange;
  }

  /**
   * Apply toxin effect. This should be called once per turn.
   * @returns {number} change in HP for this turn. This is an integer so
   * there may not be a change on every call.
   */
  getChangeInHpThisTurn() {
    const deltaHp = this.#hpPerTurn + this.#pendingHpChange;
    const reportedChange = Math.floor(deltaHp);
    this.#pendingHpChange = deltaHp - reportedChange;
    return reportedChange;
  }

  /**
   * Apply another toxin
   * @param {number} hpPerTurn - HP per change. Can be fractional.
   */
  addToxicEffect(hpPerTurn) {
    this.#hpPerTurn += hpPerTurn;
  }

  /**
   * Clear effects.
   */
  cure() {
    this.#hpPerTurn = 0;
    this.#pendingHpChange = 0;
  }

  /**
   * Test if this is active.
   * @returns {boolean}
   */
  get isActive() {
    return this.#hpPerTurn !== 0 || this.#pendingHpChange !== 0;
  }

  /**
   * Convert to JSON.
   * Note this only stores the actor. It does not store
   * @returns {module:utils/persistentData~ObjectJSON}
   */
  toJSON() {
    return {
      reviver: 'Toxin',
      data: {
        pendingHpChange: this.#pendingHpChange,
        hpPerTurn: this.#hpPerTurn,
      },
    };
  }

  /**
   * Revive from previous call to toJSON
   * @param {Array.Array<key,value>} data - array of map values
   * @returns {Toxin}
   */
  static revive(data) {
    return new Toxin(data.hpPerTurn, data.pendingHpChange);
  }
}

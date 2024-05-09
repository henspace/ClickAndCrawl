/**
 * @file Simple management of a leaderboard
 *
 * @module utils/leaderBoard
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

export class Leaderboard {
  /** @type {number} */
  #maxLength;
  /** @type {Array.<*>} */
  #values;
  /** @type {function(a:Object, b:Object):number} */
  #sortFn;
  /** @type {function(a:Object, b:Object):boolean} */
  #equalFn;

  /**
   * Create a leaderboard. If no initialValues or maxLength are
   * provided, the max length is set to 1.
   * @param {number|Array.<*>} initialValues
   * @param {Object} options
   * @param {number} [options.maxLength = 10]
   * @param {function(a:Object, b:Object):number} sortFn - function used for sorting. Returns -1 if a comes
   * before b, 0 if they are the same position, and 1 if b comes after a.
   * @param {function(a:Object, b:Object):boolean} equalFn - function used for testing if objects are the same..
   *
   */
  constructor(initialValues, options = {}) {
    this.#values = initialValues ?? [];
    this.#maxLength = options?.maxLength ?? 10;
    this.#sortFn = options.sortFn;
    this.#equalFn = options.equalFn ?? ((a, b) => a == b);
  }

  /** Add item to leader board.
   * @param {Object} item - item to add.
   * @returns {number} position on board. 0 is top, -1 is unplaced.
   */
  add(item) {
    const existingIndex = this.indexOfEqual(item);
    if (existingIndex >= 0) {
      const existingValue = this.#values[existingIndex];
      if (this.#sortFn(item, existingValue) < 0) {
        this.#values[existingIndex] = item;
      } else {
        return -1; // This object already exists and the new version is not better.
      }
    } else {
      this.#values.push(item); // it's a new item.
    }

    this.#values.sort(this.#sortFn);
    if (this.#values.length > this.#maxLength) {
      this.#values.pop();
    }
    return this.#values.indexOf(item);
  }

  /**
   * Find object. Uses the this.#equalFn.
   * @param {Object} value
   * @returns {number} the index of the found object. -1 if not found.
   */
  indexOfEqual(value) {
    for (let index = 0; index < this.#values.length; index++) {
      if (this.#equalFn(value, this.#values[index])) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Get the current leaderboard.
   * @returns {Array.<*>} copy of leaderboard
   */
  getCurrentData() {
    return [...this.#values];
  }

  /**
   * Get the max length
   * @returns {number}
   */
  getMaxLength() {
    return this.#maxLength;
  }
}

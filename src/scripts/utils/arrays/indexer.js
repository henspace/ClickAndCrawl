/**
 * @file Simple indexer for arrays.
 *
 * @module utils/arrays/indexer
 *
 * License {@link https://opensource.org/license/mit/|MIT}
 *
 * Copyright 2024 Steve Butler
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

import * as maths from '../maths.js';

/**
 * Looping methods
 * @enum {number}
 */
export const LoopMethod = {
  WRAP: 0,
  REVERSE: 1,
  STOP: 2,
};

/**
 * Class to handle indexing through arrays. This allows an index to be incremented
 * so that it wraps at the end for a circular buffer, reverses for an oscillating
 * index or just stops at the end.
 */
export class Indexer {
  /** @type {number} */
  #length;
  /** @type {number} */
  #maxIndex;
  /** @type {number} */
  #loopMethod;
  /** @type {number} */
  #direction;
  /** @type {number} */
  #index;

  /**
   * @param {number} length
   * @param {LoopMethod} loopMethod
   */
  constructor(length, loopMethod) {
    this.#length = length;
    this.#maxIndex = length - 1;
    this.#loopMethod = loopMethod;
    this.#direction = 1;
    this.#index = 0;
  }

  /**
   * Get current index.
   */
  get index() {
    return this.#index;
  }

  /**
   * Set current index. This will be clipped to a valid value.
   */
  set index(value) {
    this.#index = maths.clip(value, 0, this.#length - 1);
  }

  /** Advance to the index.
   * @param {number} distance - amount to move. This should be positive.
   * @returns {number} the new index
   */
  advanceBy(distance) {
    if (this.#length < 1) {
      return this.#index;
    }
    switch (this.#loopMethod) {
      case LoopMethod.WRAP:
        return this.#advanceByWrap(distance);
      case LoopMethod.REVERSE:
        return this.#advanceByReverse(distance);
      case LoopMethod.NONE:
      default:
        return this.#advanceByStop(distance);
    }
  }

  /** Advance the index by distance. The direction is maintained by the indexer
   * itself. Wrap at ends.
   * @param {number} distance - amount to move. This should be positive.
   * @returns {number} the new index
   */
  #advanceByWrap(distance) {
    distance = distance % this.#length;
    this.#index += distance % this.#length;
    if (this.#index >= this.#length) {
      this.#index = this.#index - this.#length;
    }
    return this.#index;
  }

  /** Advance the index by distance. The direction is maintained by the indexer
   * itself. Reverse at ends.
   * @param {number} distance - amount to move. This should be positive.
   * @returns {number} the new index
   */
  #advanceByReverse(distance) {
    const nFullTraversals = Math.floor(distance / this.#length);
    if (nFullTraversals % 2) {
      this.#direction = -this.#direction; // odd so reversing
    }
    distance = distance % this.#length;
    if (this.#direction > 0) {
      this.#index += distance;
      const overshoot = this.#index - this.#maxIndex;
      if (overshoot > 0) {
        this.#index = this.#maxIndex - overshoot;
        this.#direction = -1;
      }
    } else if (this.#direction < 0) {
      this.#index -= distance;
      if (this.#index < 0) {
        this.#index = -this.#index;
        this.#direction = 1;
      }
    }
    return this.#index;
  }

  /** Advance the index by distance. The direction is maintained by the indexer
   * itself. Stop at ends.
   * @param {number} distance - amount to move. This should be positive.
   * @returns {number} the new index
   */
  #advanceByStop(distance) {
    if (this.#direction > 0) {
      this.#index = Math.min(this.#maxIndex, this.#index + distance);
    } else if (this.#direction < 0) {
      this.#index = Math.max(0, this.#index - distance);
    }
    return this.#index;
  }
}

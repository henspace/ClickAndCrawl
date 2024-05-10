/**
 * @file Simple ring buffer
 *
 * @module utils/ringBuffer
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

export class RingBuffer {
  /** @type {number} */
  #indexIn;
  /** @type {number} */
  #indexOut;
  /** @type {number} */
  #size;
  /** @type {Array.<*>} */
  #data;
  /**
   * Create ring buffer
   * @param {number} size
   */
  constructor(size) {
    this.#size = size;
    this.#indexIn = 0;
    this.#indexOut = 0;
    this.#data = [];
  }

  /**
   * Clear all
   */
  clear() {
    this.#data = [];
    this.#indexIn = 0;
    this.#indexOut = 0;
  }
  /**
   * Add item to the buffer.
   * @param {*} item
   */
  add(item) {
    this.#data[this.#indexIn] = item;
    this.#indexIn = this.#incIndex(this.#indexIn);
    if (this.#indexIn === this.#indexOut) {
      this.#indexOut = this.#incIndex(this.#indexOut);
    }
  }

  /** Get all the items from the buffer.
   * @returns {Array.<*>}
   */
  getAll() {
    const result = [];
    let out = this.#indexOut;
    while (out !== this.#indexIn) {
      result.push(this.#data[out]);
      out = this.#incIndex(out);
    }
    return result;
  }

  #incIndex(index) {
    index++;
    if (index > this.#size) {
      index = 0;
    }
    return index;
  }
}

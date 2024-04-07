/**
 * @file Simple protection from future parsing.
 *
 * @module utils\text\markdown\parsingWarden
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
import { stringToBase64 } from './base64.js';

/**
 * Class to protect values from future parsing.
 */
export class ParsingWarden {
  #wards = new Map();
  constructor() {}

  /** Clear all the entries */
  clear() {
    this.#wards.clear();
  }

  /**
   * Create a key code from the data.
   * @param {string} data
   * @returns {string} a unique key.
   */
  #createKeyCode(data) {
    return stringToBase64(data).replace(/=/g, ':'); // == is markdown
  }
  /**
   *
   * @param {string} data - the data to guard
   * @returns {string} the key. This can be used as the protected data. If data
   * is empty, it is returned untouched.
   */
  protect(data) {
    if (!data) {
      return data; // nothing to protect
    }
    const key = `???${this.#wards.size}${this.#createKeyCode(data)}???`;
    this.#wards.set(key, data);
    return key;
  }

  /**
   * Get the originally protected string. The protected value is removed.
   * @returns {string} the originally protected value. If not found, the key is returned.
   */
  retrieve(key) {
    const value = this.#wards.get(key);
    this.#wards.delete(key);
    if (!value) {
      console.error(`Could not find ${key} in protected data.`);
      return key;
    } else {
      return value;
    }
  }

  /**
   * Search for keys in the data and reinstate. Any retrieved values are removed.
   * @param {string} data
   * @returns {string}
   */
  reinstate(data) {
    return data.replace(/[?]{3}\d+[a-zA-Z0-9+/]+:{0,2}[?]{3}/g, (match) =>
      this.retrieve(match)
    );
  }
}

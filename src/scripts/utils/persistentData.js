/**
 * @file Settings
 *
 * @module utils/persistenData
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
import LOG from './logging.js';
import { simple32 } from './hashes.js';

/**
 * @typedef {Object} ObjectJSON
 * @property {string} reviver - name of the reviver to be called.
 * @property {*} value - value to be passed to the reviver
 */

/** Encapsulate storage. */
class PersistentData {
  /** @type {Storage}   */
  #storage;
  /**
   * Cached objects so they don't need to be reparsed.
   * @type {Map<string, *>}
   */
  #cache;

  /**
   * Create persistent data object.
   */
  constructor() {
    this.#storage = localStorage;
    this.#cache = new Map();
  }
  /**
   * Set value
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    this.#cache.set(key, value);
    try {
      this.#storage.setItem(key, this.toChecksummed(JSON.stringify(value)));
    } catch (error) {
      LOG.error(`Cannot save setting. ${error.message}`);
    }
  }

  /**
   * Get a value. Uses the cache if already set.
   * @param {string} key
   * @param {*} defaultValue
   * @param {function(key,value)} reviver - reviver function for JSON.parse
   * @returns {*} stored data or default value if not present or unparsable.
   */
  get(key, defaultValue, reviver) {
    if (this.#cache.has(key)) {
      return this.#cache.get(key);
    }
    let value = defaultValue;
    try {
      const encodedValue = this.#storage.getItem(key);
      if (encodedValue !== null) {
        value = JSON.parse(this.fromChecksummed(encodedValue), reviver);
      }
    } catch (error) {
      LOG.error(`Cannot parse value from local storage. ${error.message}`);
    }
    this.#cache.set(key, value);
    return value;
  }

  /**
   * Clear everything
   */
  clearAll() {
    this.#storage.clear();
    this.#cache.clear();
    LOG.info('All local storage cleared.');
  }

  /**
   * Set the storage object. This is normally only used for test purposes.
   * @param {Storage} storage
   */
  setStorage(storage) {
    this.#storage = storage;
  }

  /**
   * Convert data to JSON and then add a checksum prefix.
   * @param {string} str
   * @returns {string}
   */
  toChecksummed(str) {
    const hash = simple32(str);
    return `${hash}*${str}`;
  }

  /**
   * Get the original string from a checksummed version.
   * @param {*} checksummedStr
   * @returns {string} data without the checksum
   * @throws {Error}
   */
  fromChecksummed(checksummedStr) {
    const matches = checksummedStr.match(/^([a-z0-9]{8})\*(.*)$/);

    if (matches) {
      const checksum = matches[1];
      const data = matches[2];
      if (checksum === simple32(data)) {
        return matches[2];
      } else {
        throw new Error('Invalid checksum');
      }
    }
    throw new Error('Invalid format');
  }
}

const PERSISTENT_DATA = new PersistentData();

export default PERSISTENT_DATA;

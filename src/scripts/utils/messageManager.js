/**
 * @file Message manager. Wrapper for all ui messages.
 *
 * @module utils/messageManager
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

import * as maths from './maths.js';
/**
 * @type{Map<string, string}
 */
let messages;

/**
 * Add text to the messages.
 * @param {Map<string, string>} messageMap
 */
function setMap(messageMap) {
  messages = messageMap;
}

/**
 * Get a message based on the key.
 * If the value is an array, a random element from the array is chosen.
 * This is to allow variable messages.
 * @param {string} key
 */
function getText(key) {
  const value = messages.get(key);
  if (value === undefined || value === null) {
    return key;
  }
  if (Array.isArray(value)) {
    return value[maths.getRandomInt(0, value.length)];
  }
  return value;
}

/**
 * Look up the text. If not found, the key is returned unchanged. When looking
 * up the key, any leading or trailing spaces are removed, but they are replaced
 * in the result.
 * @param {string} key
 * @returns {string}
 */
function getTextWithSpaces(key) {
  const match = key.match(/^( *)(.+?)( *)$/);
  if (match) {
    return `${match[1]}${getText(match[2])}${match[3]}`;
  } else {
    return key;
  }
}
/**
 * Template function for string literals. Note that text either side of embedded
 * expressions will be treated as separate keys. Spaces either side of the keys,
 * do not form part of the key but will be retained in the result.
 * @param {string[]} strs
 * @param  {...string} value - replacement values
 */
export function i18n(strs, ...values) {
  let result = '';
  strs.forEach((key, index) => {
    const text = getTextWithSpaces(key);
    result += text;
    if (index < values.length) {
      result += values[index];
    }
  });
  return result;
}
/**
 * Object to access messages.
 */
export const MESSAGES = {
  setMap: setMap,
  getText: getText,
  getTextWithSpaces: getTextWithSpaces,
};

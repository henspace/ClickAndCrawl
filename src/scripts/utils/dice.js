/**
 * @file Simulation of dice
 *
 * @module utils/dice
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
import * as maths from './maths.js';

const MULTIDICE_REGEX = /(\d+)[dD](\d+)/;
/**
 * Roll a dice
 * @param {number} [sides = 6] - number of sides on the dice
 * @returns {number}
 */
export function rollDice(sides = 6) {
  return maths.getRandomIntInclusive(1, sides);
}

/** Test to see if string is a multidice.
 * @param {string} str
 * @returns {boolean}
 */
export function isMultiDice(str) {
  return MULTIDICE_REGEX.test(str);
}
/**
 * Roll multiple dice.
 * @param {string} dice - in format nDs. E.g. 1D6
 * @returns {number} result
 */
export function rollMultiDice(dice) {
  const match = dice.match(MULTIDICE_REGEX);
  if (!match) {
    LOG.error(
      `String ${dice} not recognised as a dice roll. Defaulting to 1D6.`
    );
    return rollDice(6);
  }
  let result = 0;
  for (let roll = 0; roll < match[1]; roll++) {
    result += rollDice(parseInt(match[2]));
  }
  return result;
}

/**
 * Get the maximum throw possible from a multidice.
 * @param {string} dice
 * @returns {number}
 */
export function maxThrow(dice) {
  const match = dice.match(MULTIDICE_REGEX);
  if (!match) {
    LOG.error(`Invalid dice format: ${dice}`);
    return 0;
  }
  return parseInt(match[1]) * parseInt(match[2]);
}

/**
 * Compare two multidice definitions and return the largest.
 * @param {string} diceA
 * @param {string} diceB
 * @returns {string}
 */
export function biggestMultiDice(diceA, diceB) {
  return maxThrow(diceA) > maxThrow(diceB) ? diceA : diceB;
}

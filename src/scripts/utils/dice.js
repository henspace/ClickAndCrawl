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

const MULTIDICE_REGEX = /(\d+)[dD](\d+)(?: *\+ *(\d+))?/;
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
 * @param {string} dice - in format nDs. E.g. 1D6. If dice is falsy or incorrectly
 * formatted the dice is taken as a 1D1. If it is an integer it is just taken as
 * that many sided dice.
 * @returns {number} result
 */
export function rollMultiDice(dice) {
  if (!dice) {
    return 1;
  }
  if (Number.isInteger(dice)) {
    return rollDice(dice);
  }
  const match = dice.match(MULTIDICE_REGEX);
  if (!match) {
    LOG.error(
      `String ${dice} not recognised as a dice roll. Defaulting to 1D1.`
    );
    return 1;
  }
  let result = 0;
  for (let roll = 0; roll < match[1]; roll++) {
    result += rollDice(parseInt(match[2]));
  }
  const offset = match[3] ? parseInt(match[3]) : 0;
  return result + offset;
}

/**
 * Get the maximum throw possible from a multidice.
 * @param {string} dice - dice in format nDs. If dice is falsy,
 * the dice is taken as a 1D1. The dice specifier can be followed by an positive
 * offset. E.g. 2d6 + 8
 * @returns {number}
 */
export function maxRoll(dice) {
  if (!dice) {
    return 1;
  }
  const match = dice.match(MULTIDICE_REGEX);
  if (!match) {
    LOG.error(`Invalid dice format: ${dice}`);
    return 0;
  }
  const offset = match[3] ? parseInt(match[3]) : 0;
  return parseInt(match[1]) * parseInt(match[2]) + offset;
}

/**
 * Compare two multidice definitions and return the largest.
 * @param {string} diceA
 * @param {string} diceB
 * @returns {string}
 */
export function biggestMultiDice(diceA, diceB) {
  return maxRoll(diceA) > maxRoll(diceB) ? diceA : diceB;
}

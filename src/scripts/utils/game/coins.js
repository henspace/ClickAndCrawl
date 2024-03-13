/**
 * @file Coins
 *
 * @module utils/game/coins
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
import LOG from '../logging.js';
const COIN_REGEX = /^ *(\d+(?:\.\d*)?) *([a-zA-Z]+) *$/;

const EXCHANGE_RATE_TO_GOLD = new Map([
  ['PP', 10],
  ['GP', 1],
  ['SP', 0.1],
  ['CP', 0.01],
]);

/**
 * @typedef {Object} CoinDetails
 * @property {number} valueFace - face value of coin
 * @property {number} valueGp - value in gold coins.
 * @property {string} type - type of coin
 */

/**
 * Get coin detail.
 * @param {string} coinDefn - e,g 1GP or 10SP. Spaces allowed between number
 * and type.
 * @returns {CoinDetails} value and type.
 */
export function getCoinDetails(coinDefn) {
  let valueFace = 0;
  let valueGp = 0;
  const parts = coinDefn.match(COIN_REGEX);
  if (!parts) {
    LOG.error(`Unrecognised coin "${coinDefn}". Value set to zero.`);
    return { valueFace: 0, valueGp: 0, type: 'GP' };
  } else {
    valueFace = parts[1];
    const exchangeRate = EXCHANGE_RATE_TO_GOLD.get(parts[2]) ?? 0;
    valueGp = parseFloat(parts[1]) * exchangeRate;
  }
  return { valueFace: valueFace, valueGp: valueGp, type: parts[2] };
}
/** Get the value of a coin in GP.
 * @param {string} coinDefn - e.g. 1GP or 10SP. Spaces allowed between number and type.
 * @returns {number} 0 if unrecognised.
 */
export function getValueInGp(coinDefn) {
  return getCoinDetails(coinDefn).valueGp;
}

/**
 * Get value as a coin definition. I.e. with it's suffix.
 * @param {string} coinDefn - current definition.
 * @param {string} [coinType = 'GP'] Get value as a type.
 * @returns {string} if coinType is unrecognised, the value is zero.
 */
export function convertToType(coinDefn, coinType) {
  const gp = getValueInGp(coinDefn);
  const exchangeRate = EXCHANGE_RATE_TO_GOLD.get(coinType);
  if (exchangeRate) {
    const value = gp / exchangeRate;
    return `${value.toFixed(2)} ${coinType}`;
  }
  return `0 ${coinType}`; // worthless in this currency
}

/**
 * Convert a number of gold pieces to its definition
 * @param {number} gp
 * @return {string} coin definition
 */
export function getCoinDefinition(gp) {
  return `${gp.toFixed(2)} GP`;
}

/** Convert gold pieces value to string.
 * Note this is similar to the coin definition but
 * includes a non breaking space.
 * @param {number} gp
 * @returns {string}
 */
export function gpAsString(gp) {
  return `${gp.toFixed(2)}\u{00A0}GP`;
}

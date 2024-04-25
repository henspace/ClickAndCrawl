/**
 * @file Tables for DND
 *
 * @module dnd/tables
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
import * as maths from '../utils/maths.js';

const CHALLENGE_XP_TABLE = [
  10, 200, 450, 700, 1100, 1800, 2300, 2900, 3900, 5000, 5900, 7200, 8400,
  10000, 11500, 13000, 15000, 18000, 20000, 22000, 25000, 33000, 41000, 50000,
  62000, 75000, 90000, 105000, 120000, 135000, 155000,
];

/** advancement table. NB. this is zero based whereas level is 1 based.
 * Refer to Beyond 1st Level, p56 in https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf
 */
const ADVANCEMENT_TABLE = [
  { exp: 0, profBonus: 2 }, // level 1
  { exp: 300, profBonus: 2 }, // level 2
  { exp: 900, profBonus: 2 }, // level 3
  { exp: 2700, profBonus: 2 }, // level 4

  { exp: 6500, profBonus: 3 }, // level 5
  { exp: 14000, profBonus: 3 }, // level 6
  { exp: 23000, profBonus: 3 }, // level 7
  { exp: 34000, profBonus: 3 }, // level 8

  { exp: 48000, profBonus: 4 }, // level 9
  { exp: 64000, profBonus: 4 }, // level 10
  { exp: 85000, profBonus: 4 }, // level 11
  { exp: 100000, profBonus: 4 }, // level 12

  { exp: 120000, profBonus: 5 }, // level 13
  { exp: 140000, profBonus: 5 }, // level 14
  { exp: 165000, profBonus: 5 }, // level 15
  { exp: 195000, profBonus: 5 }, // level 16

  { exp: 225000, profBonus: 6 }, // level 17
  { exp: 265000, profBonus: 6 }, // level 18
  { exp: 305000, profBonus: 6 }, // level 18
  { exp: 355000, profBonus: 6 }, // level 20
];

/**
 * Get experience points based on challenge rating
 * @param {number|string} crValue - challenge rating.
 * @returns {number}
 */
export function getXpFromCr(cr) {
  let crValue = maths.safeParseFloat(cr);

  if (crValue < 0.124) {
    return 10;
  } else if (crValue < 0.249) {
    return 25;
  } else if (crValue < 0.499) {
    return 50;
  } else if (crValue < 0.999) {
    return 100;
  }

  crValue = Math.min(CHALLENGE_XP_TABLE.length - 1, parseInt(crValue));
  return CHALLENGE_XP_TABLE[crValue];
}

/**
 * Get level and proficiency bonus from experience.
 * @param {string|number} exp - experience points.
 * @returns {{level:number, profBonus: number}}
 */
export function getLevelAndProfBonusFromExp(exp) {
  const expValue = maths.safeParseInt(exp, 0);
  let level = 0;
  let index = 0;
  do {
    const next = ADVANCEMENT_TABLE[index++];
    if (expValue >= next.exp) {
      level = index;
    } else {
      break;
    }
  } while (index < ADVANCEMENT_TABLE.length);

  return { level: level, profBonus: ADVANCEMENT_TABLE[level - 1].profBonus };
}

/**
 * Get min experience points for level.
 * @param {number} level
 */
export function getMinExpPointsForLevel(level) {
  level = Math.min(level, ADVANCEMENT_TABLE.length);
  level--; // array is zero based.
  if (level < 0) {
    return ADVANCEMENT_TABLE[0].exp;
  }
  return ADVANCEMENT_TABLE[level].exp;
}

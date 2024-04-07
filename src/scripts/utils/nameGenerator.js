/**
 * @file Name generator
 *
 * @module utils/nameGenerator
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

// cspell:disable
const VOWEL_SOUNDS = ['a', 'e', 'i', 'o', 'u', 'ee', 'oo'];
const START_SOUNDS = [
  'b',
  'br',
  'c',
  'ch',
  'chr',
  'cr',
  'd',
  'dr',
  'f',
  'fl',
  'fr',
  'g',
  'gl',
  'gr',
  'h',
  'j',
  'k',
  'kr',
  'kl',
  'l',
  'm',
  'n',
  'p',
  'pl',
  'pr',
  'qu',
  'r',
  's',
  'sch',
  'sh',
  'st',
  't',
  'th',
  'tr',
  'v',
  'w',
  'y',
  'z',
];

const END_SOUNDS = [
  'b',
  'bbey',
  'bble',
  'bboy',
  'bby',
  'c',
  'ch',
  'ck',
  'cky',
  'ct',
  'd',
  'f',
  'ff',
  'ffle',
  'ffy',
  'ffey',
  'g',
  'ge',
  'gey',
  'gle',
  'k',
  'l',
  'll',
  'lly',
  'lley',
  'm',
  'n',
  'ngle',
  'nny',
  'p',
  'r',
  's',
  'sk',
  'ss',
  'ssy',
  'st',
  'sty',
  't',
  'th',
  'thy',
  'v',
  'w',
  'y',
  'z',
  'zzle',
  'zzy',
];
// cspell:enable

/**
 * Get a random single word name.
 * @returns {string}
 */
export function getRandomName() {
  let name =
    maths.getRandomMember(START_SOUNDS) +
    maths.getRandomMember(VOWEL_SOUNDS) +
    maths.getRandomMember(START_SOUNDS) +
    maths.getRandomMember(VOWEL_SOUNDS) +
    maths.getRandomMember(END_SOUNDS);

  return name.charAt(0).toUpperCase() + name.substring(1);
}

/**
 * Get a random single word name.
 * @returns {string}
 */
export function getRandomFullName() {
  return `${getRandomName()} ${getRandomName()}`;
}

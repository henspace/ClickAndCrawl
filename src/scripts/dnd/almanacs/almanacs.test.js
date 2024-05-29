/**
 * @file Test almanacs
 *
 * @module dnd/almanacs/almanacs.test
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

import { test, expect } from '@jest/globals';
import * as almanacs from './almanacs.js';

test('getRandomEntry distribution', () => {
  const almanac = new almanacs.Almanac();
  almanac.common.push('common');
  almanac.uncommon.push('uncommon');
  almanac.rare.push('rare');
  almanac.veryRare.push('veryRare');
  const nEntries = 10000;
  let nCommon = 0;
  let nUncommon = 0;
  let nRare = 0;
  let nVeryRare = 0;
  for (let n = 0; n < nEntries; n++) {
    const entry = almanac.getRandomEntry();
    switch (entry) {
      case 'common':
        nCommon++;
        break;
      case 'uncommon':
        nUncommon++;
        break;
      case 'rare':
        nRare++;
        break;
      case 'veryRare':
        nVeryRare++;
        break;
    }
  }
  const total = nCommon + nUncommon + nRare + nVeryRare;
  expect(total).toEqual(nEntries);
  const proportionCommon = nCommon / total;
  const proportionUncommon = nUncommon / total;
  const proportionRare = nRare / total;
  const proportionVeryRare = nVeryRare / total;
  expect(proportionCommon).toBeCloseTo(0.8, 1);
  expect(proportionUncommon).toBeCloseTo(0.15, 1);
  expect(proportionRare).toBeCloseTo(0.04, 1);
  expect(proportionVeryRare).toBeCloseTo(0.01, 2);
});

test('getRandomUncommonEntry fallback', () => {
  const almanac = new almanacs.Almanac();
  almanac.common.push('common');
  expect(almanac.getRandomUncommonEntry()).toEqual('common');

  almanac.uncommon.push('uncommon');
  expect(almanac.getRandomUncommonEntry()).toEqual('uncommon');
});

test('getRandomRareEntry fallback', () => {
  const almanac = new almanacs.Almanac();
  almanac.common.push('common');
  expect(almanac.getRandomRareEntry()).toEqual('common');

  almanac.uncommon.push('uncommon');
  expect(almanac.getRandomRareEntry()).toEqual('uncommon');

  almanac.rare.push('rare');
  expect(almanac.getRandomRareEntry()).toEqual('rare');
});

test('getRandomVeryRareEntry fallback', () => {
  const almanac = new almanacs.Almanac();
  almanac.common.push('common');
  expect(almanac.getRandomVeryRareEntry()).toEqual('common');

  almanac.uncommon.push('uncommon');
  expect(almanac.getRandomVeryRareEntry()).toEqual('uncommon');

  almanac.rare.push('rare');
  expect(almanac.getRandomVeryRareEntry()).toEqual('rare');

  almanac.veryRare.push('veryRare');
  expect(almanac.getRandomVeryRareEntry()).toEqual('veryRare');
});

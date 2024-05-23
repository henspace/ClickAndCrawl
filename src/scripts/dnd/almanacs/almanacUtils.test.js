/**
 * @file Test almanac utils
 *
 * @module dnd/almanacs/almanacUtils.test
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

import { beforeAll, test, expect } from '@jest/globals';
import * as utils from './almanacUtils.js';
import { MESSAGES } from '../../utils/messageManager.js';

beforeAll(() => {
  MESSAGES.setMap(
    new Map([
      ['DESCRIPTION PLAIN_TEXT', 'message plain text'],
      ['DESCRIPTION PLAIN_TEXT_PV', 'message plain text pv'],
      [
        'DESCRIPTION PLAIN_TEXT?EXTENSIONS',
        'message plain text plus extensions',
      ],
      [
        'DESCRIPTION PLAIN_TEXT_PV?EXTENSIONS',
        'message plain text pv plus extensions',
      ],
      ['DESCRIPTION MAIN_INFO', 'message main info'],
    ])
  );
});

test('derivePartsFromId: no ID', () => {
  expect(utils.derivePartsFromId('')).toEqual({});
});

test('derivePartsFromId: plain id', () => {
  expect(utils.derivePartsFromId('Plain_text')).toStrictEqual({
    name: 'Plain text',
    imageName: 'plain_text',
    description: 'message plain text',
    unknownDescription: undefined,
  });
});

test('derivePartsFromId: with orientation', () => {
  expect(utils.derivePartsFromId('Plain_text_pv')).toEqual({
    name: 'Plain text',
    imageName: 'plain_text_pv',
    description: 'message plain text pv',
    unknownDescription: undefined,
  });
});

test('derivePartsFromId: with extended id: needs identification', () => {
  expect(utils.derivePartsFromId('Plain_text?extensions')).toEqual({
    name: 'Plain text',
    imageName: 'plain_text',
    description: 'message plain text plus extensions',
    unknownDescription: 'message plain text',
  });
});

test('derivePartsFromId: with orientation and extended id: needs identification', () => {
  expect(utils.derivePartsFromId('Plain_text_pv?extensions')).toEqual({
    name: 'Plain text',
    imageName: 'plain_text_pv',
    description: 'message plain text pv plus extensions',
    unknownDescription: 'message plain text pv',
  });
});

test('derivePartsFromId: with extended id: no identification', () => {
  expect(utils.derivePartsFromId('Plain_text+extensions')).toEqual({
    name: 'Plain text',
    imageName: 'plain_text',
    description: 'message plain text',
    unknownDescription: undefined,
  });
});

test('derivePartsFromId: with orientation and extended id: no identification', () => {
  expect(utils.derivePartsFromId('Plain_text_pv+extensions')).toEqual({
    name: 'Plain text',
    imageName: 'plain_text_pv',
    description: 'message plain text pv',
    unknownDescription: undefined,
  });
});

test('derivePartsFromId: with extended id: no identification, splitting definitions', () => {
  expect(utils.derivePartsFromId('Just_image/main_info')).toEqual({
    name: 'Main info',
    imageName: 'just_image',
    description: 'message main info',
    unknownDescription: undefined,
  });
});

test('derivePartsFromId: with orientation and extended id: no identification, splitting definitions', () => {
  expect(utils.derivePartsFromId('Just_image_pv/main_info')).toEqual({
    name: 'Main info',
    imageName: 'just_image_pv',
    description: 'message main info',
    unknownDescription: undefined,
  });
});

/**
 * @file Test persistent data
 *
 * @module utils/persistentData.test
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

import PERSISTENT_DATA from './persistentData.js';
import { simple32 } from './hashes.js';
import { beforeAll, beforeEach, jest, test, expect } from '@jest/globals';

const mockedStorage = (() => {
  const map = new Map();
  return {
    getItem: jest.fn((key) => map.get(key)),
    setItem: jest.fn((key, value) => map.set(key, value)),
    clear: jest.fn(() => map.clear()),
  };
})();

beforeAll(() => {
  PERSISTENT_DATA.setStorage(mockedStorage);
});

beforeEach(() => {
  jest.clearAllMocks();
  PERSISTENT_DATA.clearAll();
  mockedStorage.clear();
});

function createCheckSummedStr(str) {
  return `${simple32(str)}*${str}`;
}

test('Set with string', () => {
  const key = 'My key';
  const data = 'Test data';
  PERSISTENT_DATA.set(key, data);
  const result = mockedStorage.getItem(`ClickAndCrawl_${key}`);
  expect(result).toEqual(createCheckSummedStr(JSON.stringify(data)));
});

test('Set with object', () => {
  const key = 'My key';
  const data = { first: 'item 1', second: 'item 2' };
  PERSISTENT_DATA.set(key, data);
  const result = mockedStorage.getItem(`ClickAndCrawl_${key}`);
  expect(result).toEqual(createCheckSummedStr(JSON.stringify(data)));
});

test('Get successful', () => {
  const key = 'My key';
  const data = 'Just testing';
  // don't use persistent.set as this will result in the read using the cache.
  mockedStorage.setItem(key, createCheckSummedStr(JSON.stringify(data)));
  PERSISTENT_DATA.set(key, data);
  const result = PERSISTENT_DATA.get(key);
  expect(result).toEqual(data);
});

test('Get successful with reviver', () => {
  const key = 'My key';
  const data = 'Just testing';
  // don't use persistent.set as this will result in the read using the cache.
  mockedStorage.setItem(
    `ClickAndCrawl_${key}`,
    createCheckSummedStr(JSON.stringify(data))
  );
  const result = PERSISTENT_DATA.get(
    key,
    null,
    (key, value) => `REVIVED:${value}`
  );
  expect(result).toEqual(`REVIVED:${data}`);
});

test('Get invalid key', () => {
  const key = 'My key';
  const data = 'Just testing';
  // don't use persistent.set as this will result in the read using the cache.
  mockedStorage.setItem(
    `ClickAndCrawl_${key}`,
    createCheckSummedStr(JSON.stringify(data))
  );
  const result = PERSISTENT_DATA.get('RANDOM KEY');
  expect(result).toBeUndefined();
});

test('Get invalid key and default', () => {
  const key = 'My key';
  const data = 'Just testing';
  const defValue = 'My default';
  // don't use persistent.set as this will result in the read using the cache.
  mockedStorage.setItem(
    `ClickAndCrawl_${key}`,
    createCheckSummedStr(JSON.stringify(data))
  );
  const result = PERSISTENT_DATA.get('RANDOM KEY', defValue);
  expect(result).toBe(defValue);
});

test('Get invalid format returns undefined', () => {
  const key = 'My key';
  const data = 'Just testing';
  // don't use persistent.set as this will result in the read using the cache.
  mockedStorage.setItem(`ClickAndCrawl_${key}`, JSON.stringify(data));
  const result = PERSISTENT_DATA.get(key);
  expect(result).toBeUndefined();
});

test('Get invalid format returns default', () => {
  const key = 'My key';
  const data = 'Just testing';
  const defValue = 'My default';
  // don't use persistent.set as this will result in the read using the cache.
  mockedStorage.setItem(`ClickAndCrawl_${key}`, JSON.stringify(data));
  const result = PERSISTENT_DATA.get(key, defValue);
  expect(result).toBe(defValue);
});

test('Get invalid checksum returns undefined', () => {
  const key = 'My key';
  const data = 'Just testing';
  // don't use persistent.set as this will result in the read using the cache.
  mockedStorage.setItem(
    `ClickAndCrawl_${key}`,
    '12345678*' + JSON.stringify(data)
  );
  const result = PERSISTENT_DATA.get(key);
  expect(result).toBeUndefined();
});

test('Get invalid checksum returns default', () => {
  const key = 'My key';
  const data = 'Just testing';
  const defValue = 'My default';
  // don't use persistent.set as this will result in the read using the cache.
  mockedStorage.setItem(
    `ClickAndCrawl_${key}`,
    '12345678*' + JSON.stringify(data)
  );
  const result = PERSISTENT_DATA.get(key, defValue);
  expect(result).toBe(defValue);
});

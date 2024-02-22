/**
 * @file Test for indexer
 *
 * @module utils/arrays/indexer-test
 *
 * License {@link https://opensource.org/license/mit/|MIT}
 *
 * Copyright 2024 Steve Butler
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
import * as indexer from './indexer.js';
import { test, expect } from '@jest/globals';

test('Check index property', () => {
  const length = 4;
  const index = new indexer.Indexer(length, indexer.LoopMethod.STOP);
  expect(index.index).toBe(0);
  index.advanceBy(2);
  expect(index.index).toBe(2);
});

test('Check stop loop method', () => {
  const length = 4;
  const index = new indexer.Indexer(length, indexer.LoopMethod.STOP);
  expect(index.advanceBy(0)).toBe(0);
  expect(index.advanceBy(1)).toBe(1);
  expect(index.advanceBy(1)).toBe(2);
  expect(index.advanceBy(1)).toBe(3);
  expect(index.advanceBy(1)).toBe(3);
  expect(index.advanceBy(3)).toBe(3);
  expect(index.advanceBy(length * 5 + 2)).toBe(3);
});

test('Check wrap loop method', () => {
  const length = 4;
  const index = new indexer.Indexer(length, indexer.LoopMethod.WRAP);
  expect(index.advanceBy(0)).toBe(0);
  expect(index.advanceBy(1)).toBe(1);
  expect(index.advanceBy(1)).toBe(2);
  expect(index.advanceBy(1)).toBe(3);
  expect(index.advanceBy(1)).toBe(0);
  expect(index.advanceBy(3)).toBe(3);
  expect(index.advanceBy(2)).toBe(1);
  expect(index.advanceBy(length * 5 + 2)).toBe(3);
});

test('Check reverse loop method simple increments', () => {
  const length = 4;
  const index = new indexer.Indexer(length, indexer.LoopMethod.REVERSE);
  expect(index.advanceBy(0)).toBe(0);
  expect(index.advanceBy(1)).toBe(1);
  expect(index.advanceBy(1)).toBe(2);
  expect(index.advanceBy(1)).toBe(3);
  expect(index.advanceBy(1)).toBe(2);
  expect(index.advanceBy(1)).toBe(1);
  expect(index.advanceBy(1)).toBe(0);
  expect(index.advanceBy(1)).toBe(1);
  expect(index.advanceBy(length * 4 + 1)).toBe(2);
  expect(index.advanceBy(1)).toBe(3);
  expect(index.advanceBy(length * 5)).toBe(3);
});

test('Check reverse loop method simple increments', () => {
  const length = 4;
  const index = new indexer.Indexer(length, indexer.LoopMethod.REVERSE);
  expect(index.advanceBy(0)).toBe(0);
  expect(index.advanceBy(2)).toBe(2);
  expect(index.advanceBy(2)).toBe(2);
  expect(index.advanceBy(2)).toBe(0);
  expect(index.advanceBy(2)).toBe(2);
  expect(index.advanceBy(2)).toBe(2);
  expect(index.advanceBy(2)).toBe(0);
});

test('Check reverse loop method -- large even number of full traversals maintains direction', () => {
  const length = 4;
  const index = new indexer.Indexer(length, indexer.LoopMethod.REVERSE);
  expect(index.advanceBy(0)).toBe(0);
  expect(index.advanceBy(length * 4 + 1)).toBe(1);
  expect(index.advanceBy(length * 4 + 1)).toBe(2);
  expect(index.advanceBy(length * 4 + 1)).toBe(3);
  expect(index.advanceBy(length * 4 + 1)).toBe(2);
  expect(index.advanceBy(length * 4 + 1)).toBe(1);
  expect(index.advanceBy(length * 4 + 1)).toBe(0);
  expect(index.advanceBy(length * 4 + 1)).toBe(1);
});

test('Check reverse loop method -- large odd number of full traversals reverses direction', () => {
  const length = 4;
  const index = new indexer.Indexer(length, indexer.LoopMethod.REVERSE);
  expect(index.advanceBy(0)).toBe(0);
  expect(index.advanceBy(1)).toBe(1);
  expect(index.advanceBy(1)).toBe(2);
  expect(index.advanceBy(length * 5 + 1)).toBe(1);
  expect(index.advanceBy(1)).toBe(0);
  expect(index.advanceBy(length * 5 + 1)).toBe(1);
  expect(index.advanceBy(1)).toBe(2);
});

test('Check zero length array always 0.', () => {
  expect(
    new indexer.Indexer(length, indexer.LoopMethod.REVERSE).advanceBy(1)
  ).toBe(0);
  expect(
    new indexer.Indexer(length, indexer.LoopMethod.WRAP).advanceBy(1)
  ).toBe(0);
  expect(
    new indexer.Indexer(length, indexer.LoopMethod.STOP).advanceBy(1)
  ).toBe(0);
});

/**
 * @file Test ring buffer
 *
 * @module utils/ringBuffer.test
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
import { RingBuffer } from './ringBuffer.js';

test('Construction, addition, getAll', () => {
  const buffer = new RingBuffer(3);
  buffer.add('one');
  expect(buffer.getAll()).toEqual(['one']);
  buffer.add('two');
  expect(buffer.getAll()).toEqual(['one', 'two']);
  buffer.add('three');
  expect(buffer.getAll()).toEqual(['one', 'two', 'three']);
  buffer.add('four');
  expect(buffer.getAll()).toEqual(['two', 'three', 'four']);
  buffer.add('five');
  expect(buffer.getAll()).toEqual(['three', 'four', 'five']);
  buffer.add('six');
  expect(buffer.getAll()).toEqual(['four', 'five', 'six']);
  buffer.add('seven');
  expect(buffer.getAll()).toEqual(['five', 'six', 'seven']);
  buffer.add('eight');
  expect(buffer.getAll()).toEqual(['six', 'seven', 'eight']);
});

test('RingBuffer: clear', () => {
  const buffer = new RingBuffer(3);
  buffer.add('one');
  expect(buffer.getAll()).toEqual(['one']);
  buffer.add('two');
  expect(buffer.getAll()).toEqual(['one', 'two']);
  buffer.clear();
  expect(buffer.getAll()).toEqual([]);
  buffer.add('four');
  expect(buffer.getAll()).toEqual(['four']);
});

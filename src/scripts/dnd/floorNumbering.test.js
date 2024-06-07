/**
 * @file Test floor numbering.
 *
 * @module dnd\floorNumbering.test
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
import * as floorNumbering from './floorNumbering.js';

test('sceneToFloor', () => {
  expect(floorNumbering.sceneToFloor(0)).toBe('1');
  expect(floorNumbering.sceneToFloor(1)).toBe('B1');
  expect(floorNumbering.sceneToFloor(10)).toBe('B10');
});

test('floorToScene', () => {
  expect(floorNumbering.floorToScene('1')).toBe(0);
  expect(floorNumbering.floorToScene('B1')).toBe(1);
  expect(floorNumbering.floorToScene('B2')).toBe(2);
  expect(floorNumbering.floorToScene('B1234')).toBe(1234);
  for (let scene = 0; scene < 99; scene++) {
    expect(
      floorNumbering.floorToScene(floorNumbering.sceneToFloor(scene))
    ).toBe(scene);
  }
});

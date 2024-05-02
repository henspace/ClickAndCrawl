/**
 * @file Test hashes
 *
 * @module utils/hashes.test
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
import * as hashes from './hashes.js';

test('simple', () => {
  const testStrings = [
    '',
    'this is a test',
    'this Is a test',
    'String with `\u{1f600} extended unicode',
  ];
  const results = [];
  for (const str of testStrings) {
    const hash = hashes.simple32(str);
    expect(hash).toMatch(/^[a-f0-9]{8}$/);
    expect(results.includes(hash)).toBe(false);
    results.push(hash);
    console.log(`Hash ${str} => ${hash}`);
  }
  for (let index = 0; index < testStrings.length; index++) {
    const hash = hashes.simple32(testStrings[index]);
    expect(hash).toBe(results[index]);
  }
});

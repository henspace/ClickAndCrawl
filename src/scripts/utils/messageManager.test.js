/**
 * @file Test message manager
 *
 * @module utils/messageManager.test
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
import { test, expect, beforeAll } from '@jest/globals';
import { MESSAGES, i18n } from './messageManager.js';

const messages = new Map([
  ['PLAIN', 'Plain text'],
  ['WITH ARGS', 'Testing ${0} and ${2} and ${1}'],
  [
    'WITH NAMED ARGS',
    'Testing ${0name} and ${2another_name} and ${1yet-another-name}',
  ],
]);

beforeAll(() => {
  MESSAGES.setMap(messages);
});

test('i18n with normal arguments', () => {
  expect(i18n`PLAIN`).toBe('Plain text');
  expect(i18n`WITH ARGS ${'ONE'} and ${'TWO'} ${'THREE'}`).toBe(
    'Testing ONE and THREE and TWO'
  );
});

test('i18n with named arguments', () => {
  expect(i18n`PLAIN`).toBe('Plain text');
  expect(i18n`WITH NAMED ARGS ${'ONE'} and ${'TWO'} ${'THREE'}`).toBe(
    'Testing ONE and THREE and TWO'
  );
});

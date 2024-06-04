/**
 * @file Base64 routines
 *
 * @module utils/text/markdown/base64
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
import { safeEncodeURIComponent } from '../safeEncoder.js';

/**
 * Converts string to base64 representation. Note that the string is first encoded
 * so the base64 result represents the encoded version and not the original string.
 * @param {string} str - string to encode.
 * @returns {string}
 */
export function stringToBase64(str) {
  return window.btoa(safeEncodeURIComponent(str));
}

/**
 * converts base64 string to a string.
 * It is assumed that the original string used to create the base64 version
 * was first encoded using safeEncodeURIComponent.
 * As such the resulting base64 conversion is decoded using
 * decodeURIComponent before returning.
 * @param {string} base64
 * @returns {string}
 */
export function base64ToString(base64) {
  return decodeURIComponent(window.atob(base64));
}

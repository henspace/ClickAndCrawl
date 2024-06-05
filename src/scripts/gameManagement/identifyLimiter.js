/**
 * @file Prevent multiple identification attempts. This is to make identification
 * turn based.
 *
 * @module gameManagement\identifyLimiter
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
import LOG from '../utils/logging.js';

/** @type {boolean} */
let idCheckAllowed = true;

/**
 * Checks to see if an identification can be made. Uses the identification
 * so a subsequent call will fail.
 * @returns {boolean} if allowed.
 */
export function useIdCheck() {
  const allowed = idCheckAllowed;
  idCheckAllowed = false;
  if (!allowed) {
    LOG.info('Identification checks not allowed at present.');
  }
  return allowed;
}

/**
 * Allow id checks.
 */
export function allowIdCheck() {
  idCheckAllowed = true;
}

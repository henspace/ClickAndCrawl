/**
 * @file Simple script to clean a directory.
 * Usage: cleandDir.js path
 *
 * @module tools/cleanDir.js
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
 *
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

import * as fsPromises from 'node:fs/promises';
/* global process */
/**
 * Remove directory. It's contents are removed but the directory will remain.
 * @param {*} path
 * @returns Promise which resolves to undefined on success.
 */
function removeDir(path) {
  return fsPromises.rm(path, { force: true, recursive: true });
}

/**
 * Clean directory. It's contents are removed but the directory will remain.
 * @param {*} path
 * @returns Promise which resolves to undefined on success.
 */
function cleanDir(path) {
  return removeDir(path).then(() =>
    fsPromises.mkdir(path, { recursive: true })
  );
}

const path = process.argv[2];
if (!path) {
  console.error(
    'You must supply the path to be cleaned. E.g. cleanDir.js mypath'
  );
} else {
  console.log(`Cleaning path: ${path}`);
  await cleanDir(path);
  console.log('Successfully cleaned path.');
}

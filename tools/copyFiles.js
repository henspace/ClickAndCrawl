/**
 * @file script to copy files
 *
 * @module tools/copyFiles.js
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

import * as fsPromises from 'node:fs/promises';
import * as nodePath from 'node:path';
/* global process */

/**
 * Copy all the files from the source Dir to the targetDir. The operation is
 * recursive
 * @param {string} sourceDir
 * @param {string} targetDir
 * @param {object} [options] - options for the copy
 * @param {RegExp} [options.filter] - filter for file names to include.
 * @returns Promise that resolves to an array of the target files created.
 */
function copyFiles(sourceDir, targetDir, options) {
  options = options ?? {};
  console.log(`Copy files from ${sourceDir} to ${targetDir}`);
  return fsPromises
    .mkdir(targetDir, { recursive: true })
    .then(() => fsPromises.readdir(sourceDir, { withFileTypes: true }))
    .then((files) => {
      const promises = [];
      for (const file of files) {
        if (file.isDirectory()) {
          promises.push(
            copyFiles(
              nodePath.join(sourceDir, file.name),
              nodePath.join(targetDir, file.name),
              options
            )
          );
        } else {
          if (!options.filter || file.name.match(options.filter)) {
            promises.push(
              fsPromises.copyFile(
                nodePath.join(sourceDir, file.name),
                nodePath.join(targetDir, file.name)
              )
            );
          }
        }
      }
      return Promise.all(promises);
    });
}

if (process.argv.length < 4) {
  console.error('Incorrect usage. copyFiles srcPath destPath [filterRegex]');
} else {
  const srcPath = process.argv[2];
  const destPath = process.argv[3];
  const filter = process.argv[4];
  console.log(`Copy files from ${srcPath} to ${destPath}. Filter ${filter}`);
  copyFiles(srcPath, destPath, { filter: filter });
  console.log('Copy complete.');
}

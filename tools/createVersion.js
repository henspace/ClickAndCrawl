/**
 * @file Simple utilities for creating version.js file
 *
 * @module tools/createVersion.js
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
/* global process */

/**
 * Get the version from the package.json file
 * @param {string} packageJsonFilePath
 * @returns {Promise<{version:string, author:string}>}
 */
function getPackageVersion(packageJsonFilePath) {
  return fsPromises
    .readFile(packageJsonFilePath, { encoding: 'utf8' })
    .then((json) => JSON.parse(json))
    .then((packageObj) => ({
      version: packageObj.version,
      author: packageObj.author,
    }));
}

/**
 * Create the version file.
 * @param {string} destFilePath
 * @param {Object} details
 * @param {string} details.version
 * @param {Date} details.date
 * @param {Date} details.author
 */
function createVersionFile(destFilePath, details) {
  const content = `
/**
 * Automatically created version file. Do not edit!
 */
export const VERSION = {
  build: '${details.version}',
  date:'${details.date.toISOString().substring(0, 10)}',
  copyright: '\u{00A9} ${details.date.getFullYear()} ${details.author}'
}
`;
  return fsPromises.writeFile(destFilePath, content, { encoding: 'utf8' });
}

if (process.argv.length < 3) {
  console.error('Incorrect usage. createVersion destPath');
} else {
  const srcPath = process.argv[2];
  const destPath = process.argv[3];
  console.log(`Getting version from ${srcPath} and creating ${destPath}`);
  const packageDetails = await getPackageVersion(srcPath).then(
    (details) => details
  );

  const date = new Date();
  const buildCode = Math.round(date.getTime() / 1000).toString(36);
  await createVersionFile(destPath, {
    version: `${packageDetails.version}+${buildCode}`,
    date: date,
    author: packageDetails.author,
  });
  console.log(`Version ${packageDetails.version}; build code ${buildCode}`);
  console.log(`Created ${destPath}`);
}

/**
 * @file Various utilities for handling arrays
 *
 * @module utils/arrays/arrayManip
 */
/**
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

/**
 * @typedef Surrounds
 * @property {*} centre - value at centre
 * @property {*} tl - value to top left
 * @property {*} above - value above
 * @property {*} tr - value to top right
 * @property {*} right - value to right
 * @property {*} br - value to bottom right
 * @property {*} below - value below
 * @property {*} bl - value to bottom
 * @property {*} left - value to left
 */

/**
 * Get the surround values from a 2D matrix
 * @param {Array.<Array.<*>>} matrix
 * @param {number} rowIndex
 * @param {number} columnIndex
 * @returns {Surrounds}
 */
export function getSurrounds(matrix, rowIndex, columnIndex) {
  return {
    centre: matrix[rowIndex]?.[columnIndex],
    tl: matrix[rowIndex - 1]?.[columnIndex - 1],
    above: matrix[rowIndex - 1]?.[columnIndex],
    tr: matrix[rowIndex - 1]?.[columnIndex + 1],
    right: matrix[rowIndex]?.[columnIndex + 1],
    br: matrix[rowIndex + 1]?.[columnIndex + 1],
    below: matrix[rowIndex + 1]?.[columnIndex],
    bl: matrix[rowIndex + 1]?.[columnIndex - 1],
    left: matrix[rowIndex]?.[columnIndex - 1],
  };
}

/**
 * Randomise an array.
 * @param {Object[]} source - array to randomise. The original will be modified.
 * @returns {Object[]} The source array which will have been randomised.
 */
export function randomise(source) {
  let currentIndex = source.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // swap
    [source[currentIndex], source[randomIndex]] = [
      source[randomIndex],
      source[currentIndex],
    ];
  }

  return source;
}

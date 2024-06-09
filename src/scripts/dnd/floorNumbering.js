/**
 * @file Floor numbering utils
 *
 * @module dnd/floorNumbering
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

/**
 * Convert a scene number to a floor.
 * Scene levels go 0, 1, 2 ... etc.
 * Floors adopt US numbering and go 1, B1, B2, B3 ... etc. for basement.
 * @param {number} scene
 * @returns {string}
 */
export function sceneToFloor(scene) {
  return scene === 0 ? '1' : `B${scene}`;
}

/**
 * Convert a floor to a scene
 * Scene levels go 0, 1, 2 ... etc.
 * Floors adopt US numbering and go 1, B1, B2, B3 ... etc. for basement.
 * @param {string} floor
 * @returns {number} scene
 */
export function floorToScene(floor) {
  return floor.startsWith('B') ? parseInt(floor.substring(1)) : 0;
}

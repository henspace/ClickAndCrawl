/**
 * @file Presenters for tutorial text.
 *
 * @module tutorial/presenters
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

import { addFadingText } from '../utils/effects/transient.js';
import { Velocity } from '../utils/geometry.js';
import { Point } from '../utils/geometry.js';
import { addFadingAnimatedImage } from '../utils/effects/transient.js';

/** @type {number} */
const WORDS_PER_SECOND = 110 / 60;

/** @type {number} */
const MIN_READING_SECONDS = 5;

/**
 * Get the time required to read a line of text.
 * @param {string} text
 * @returns {number}
 */
function secondsToRead(text) {
  if (!text) {
    return MIN_READING_SECONDS;
  }
  const words = text.split(/\s/).length;
  return Math.max(MIN_READING_SECONDS, words / WORDS_PER_SECOND);
}

/**
 * Display tutorial text.
 * @param {string} text
 * @param {Object} options
 * @param {module:utils/geometry.Position} options.position
 * @returns {Promise}
 */
export function showTutorialText(text, options) {
  const readingTime = secondsToRead(text);

  addFadingAnimatedImage('click', {
    position: new Point(options.position.x, options.position.y),
    delaySecs: readingTime,
    lifetimeSecs: 0.2 * readingTime,
  });
  if (text !== '') {
    let offset = 0;
    for (const line of text.split('\n')) {
      const dims = addFadingText(line, {
        color: 'white',
        background: '#111111',
        delaySecs: readingTime,
        lifetimeSecs: 0.2 * readingTime,
        position: new Point(options.position.x, options.position.y + offset),
        velocity: new Velocity(0, -36, 0),
      });
      offset += dims.height;
    }
  }
  return Promise.resolve();
}

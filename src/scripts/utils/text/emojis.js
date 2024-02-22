/**
 * @file Support for emojis, especially as sprites.
 *
 * @module utils/text/emojis
 *
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

import LOG from '../logging.js';

export const Emojis = {
  GRINNING: '😀',
  SANTA: '🎅',
  SHAKING: '\u{1FAE8}',
};

/**
 * Check to see if the emojis are supported. Any emoji which fails to render,
 * is replaced by a number in square brackets. Note that the function just checks the centre
 * pixel so it may fail in some situations and think that a valid emoji has not
 * rendered.
 * @param {CanvasRenderingContext2D} context
 */
export function checkEmojis(context) {
  let fallbackIndex = 0;
  for (const key in Emojis) {
    const metrics = context.measureText(Emojis[key]);
    const height =
      metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    const centreToBaseLine = 0.5 * height - metrics.fontBoundingBoxDescent;
    context.fillText(Emojis[key], -0.5 * metrics.width, centreToBaseLine);
    const alphaAtCentre = context.getImageData(0, 0, 1, 1).data[3];
    if (alphaAtCentre <= 0) {
      LOG.debug(`Emoji ${key} not supported.`);
      Emojis[key] = `[${fallbackIndex++}]`;
    }
    context.clearRect(0, 0, metrics.width, height);
  }
}

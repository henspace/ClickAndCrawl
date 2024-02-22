/**
 * @file Canvas functions for handling text.
 *
 * @module utils/text/text
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

import * as fonts from './fonts.js';

/**
 * @typedef {Object} TextBounds
 * @property {number} width - width of text
 * @property {number} width - height of text
 * @property {number} offsetTop - offset from text y position to top. This is negative.
 * @property {number} offsetCentreY - offset from text y position to centre. This is negative.
 */

/**
 * Calculate the text bounds. Note that the box surrounds the entire text including
 * descenders.
 * @param {CanvasRenderingContext2D} context
 * @param {string} text
 * @returns {TextBounds}
 */
export function getTextBounds(context, text) {
  const metrics = context.measureText(text);
  return {
    width: metrics.width,
    height: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
    offsetTop: -metrics.fontBoundingBoxAscent,
    offsetCentreY:
      0.5 * (metrics.fontBoundingBoxDescent - metrics.fontBoundingBoxAscent),
  };
}

/**
 * Wrap text based on https://codepen.io/nishiohirokazu/pen/jjNyye
 * @param {CanvasRenderingContext2D} context
 * @param {string} paragraph
 * @param {import('../geometry.js').Position} position
 * @param {Object} options
 * @param {number} options.xWrapPosition - position to wrap text.
 * @param {number} [options.lineSpacing = 1] - multiplier for line height. 1 shifts lines by the total font height.
 * @returns {number} the next line y position.
 */
function wrapParagraph(context, paragraph, position, options) {
  const words = paragraph.split(' ');
  let x = position.x ?? 0;
  let y = position.y ?? 0;
  let maxLineLength = options.xWrapPosition - x;
  let lineSpacing = options.lineSpacing ?? 1;
  let line = '';
  let lineHeight;

  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    const bounds = getTextBounds(context);
    if (!lineHeight) {
      lineHeight = lineSpacing * bounds.height;
    }
    if (bounds.width > maxLineLength && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
  return y + lineHeight;
}
/**
 * Write text to the canvas. Text can be wrapped if required.
 * @param {CanvasRenderingContext2D} context
 * @param {*} text
 * @param {import('../geometry.js').Position} position
 * @param {Object} options
 * @param {number} [options.wrapAtX] - if null, undefined or zero, no wrapping occurs.
 * @param {number} [options.lineSpacing = 1] - multiplier for line height. 1 shifts lines by the total font height.
 * @param {string} [options.styleName] - named style. Picks up settings from module:utils/fonts
 * @param {string} [options.color] - color
 */
export function writeText(context, text, position, options) {
  context.font = fonts.getCss(options?.styleName);
  context.fillStyle = options?.color ?? 'white';
  if (!options?.wrapAtX) {
    context.fillText(text, position.x ?? 0, position.y ?? 0);
  } else {
    var paragraphs = text.split('\n');
    for (let n = 0; n < paragraphs.length; n++) {
      options.y = wrapParagraph(context, paragraphs[n], position, options);
    }
  }
}

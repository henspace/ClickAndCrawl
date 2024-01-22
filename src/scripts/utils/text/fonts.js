/**
 * @file Font data
 *
 * @module utils/text/fonts
 *
 * @license
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

const baseSize = 15; // minimum pixel size

/*
 * These should be replicated in the CSS.
 */
const H1_FONT_SCALE = 2.0;
const H2_FONT_SCALE = 1.5;
const H3_FONT_SCALE = 1.2;

const NORMAL_FONT = 'Arial, Helvetica, sans-serif';
const HEADING_FONT = "'Space Grotesk', sans-serif"; // cspell:disable-line
const EMOJI_SPRITE_FONT = "'Space Grotesk', sans-serif"; // cspell:disable-line

/**
 * @typedef {Object} TextInfo
 * @property {number} size
 * @property {string} fontName
 */
/**
 * Named styles.
 * @type {Object.<String, TextInfo>}
 */
const textInfo = {
  normal: { size: 15, fontName: NORMAL_FONT },
  h1: { size: 30, fontName: HEADING_FONT },
  h2: { size: 22, fontName: HEADING_FONT },
  h3: { size: 18, fontName: HEADING_FONT },
  emojiSprite: { size: 18, fontName: EMOJI_SPRITE_FONT },
};

/**
 * Sets up font sizes based on the design display width.
 * The actual normal font size is worked out using the CSS formula normally
 * based on the display width.
 * @param {number} designWidth
 */
export function initialise(designWidth) {
  textInfo.normal.size = baseSize + 0.390625 * (designWidth / 100);
  textInfo.h1.size = textInfo.normal.size * H1_FONT_SCALE;
  textInfo.h2.size = textInfo.normal.size * H2_FONT_SCALE;
  textInfo.h3.size = textInfo.normal.size * H3_FONT_SCALE;
  textInfo.emojiSprite.size = designWidth / 10;
}

/**
 * Get font CSS for styleName.
 * @param {string} styleName - default, h1, h2, or h3. Defaults to default.
 * @returns {string}
 */
export function getCss(styleName) {
  const info = textInfo[styleName] ?? textInfo['normal'];
  return `${info.size}px ${info.fontName}`;
}

/**
 * Get the root font size. This is the size base on the design dimensions and is
 * the size as written to the canvas. It does not allow for any scaling of the
 * canvas by CSS.
 */
export function getRootFontSize() {
  return textInfo.normal.size;
}

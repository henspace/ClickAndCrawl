/**
 * @file Font data
 *
 * @module utils/text/fonts
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

const DEFAULT_FONT_BASE_PX = 15; // minimum pixel size

const MIN_FONT_BASE_PX = 10;
const MAX_FONT_BASE_PX = 25;

/** @type {number} */
let currentBasePx = DEFAULT_FONT_BASE_PX;

/** @type {number} */
let designWidth = 0;

/**
 * Get the default base size as a proportion of the acceptable range.
 * @returns {number}
 */
export function getDefaultFontScale() {
  return (
    (DEFAULT_FONT_BASE_PX - MIN_FONT_BASE_PX) /
    (MAX_FONT_BASE_PX - MIN_FONT_BASE_PX)
  );
}

/*
 * These should be replicated in the CSS.
 */
const H1_FONT_SCALE = 2.0;
const H2_FONT_SCALE = 1.5;
const H3_FONT_SCALE = 1.2;

const NORMAL_FONT = "'Fondamento', cursive"; // cspell:disable-line
const HEADING_FONT = "'Fondamento', cursive"; // cspell:disable-line
const EMOJI_SPRITE_FONT = "'Fondamento', cursive"; // cspell:disable-line

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
 * @param {number} requiredDesignWidth
 */
export function initialise(requiredDesignWidth) {
  designWidth = requiredDesignWidth;
  updateFontSizes();
}

/**
 * Update font sizes. This adjusts fonts used in the game and in the UI.
 */
function updateFontSizes() {
  textInfo.normal.size = currentBasePx + 0.390625 * (designWidth / 100);
  textInfo.h1.size = textInfo.normal.size * H1_FONT_SCALE;
  textInfo.h2.size = textInfo.normal.size * H2_FONT_SCALE;
  textInfo.h3.size = textInfo.normal.size * H3_FONT_SCALE;
  textInfo.emojiSprite.size = designWidth / 10;
  document.documentElement.style.fontSize = `${textInfo.normal.size}px`;
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

/**
 * Set the CSS base pixel size. This does not affect the canvas.
 * The figure is passed as a proportion of the MIN to MAX range.
 * @param {number} scale
 */
export function setCssBaseFontScale(scale) {
  currentBasePx =
    MIN_FONT_BASE_PX + (MAX_FONT_BASE_PX - MIN_FONT_BASE_PX) * scale;
  updateFontSizes();
}

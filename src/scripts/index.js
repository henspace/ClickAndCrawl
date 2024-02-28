/**
 * @file Main entry point
 *
 * @module index
 */
/**
 * @license See {@link https://opensource.org/license/mit/|MIT}
 *
 * Copyright 2024 Steve Butler
 */
/**
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
import LOG from './utils/logging.js';
import GAME from './utils/game/game.js';

window.addEventListener('load', () => {
  const DESIGN_WIDTH = 800;
  const DESIGN_HEIGHT = 600;
  try {
    GAME.initialise({
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
      maxScale: 2.4,
      minScale: 1,
      sizingMethod: 'COVER',
      alpha: false,
    });
  } catch (error) {
    LOG.fatal(error);
  }
});

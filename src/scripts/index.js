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
import './utils/polyfills/string.js';
import LOG from './utils/logging.js';
import GAME from './gameManagement/game.js';
import PERSISTENT_DATA from './utils/persistentData.js';
import { VERSION } from './constants/autoVersion.js';
/**
 * Class that allows testing of features that may fall over in unsupported
 * browsers. As they generate a syntax error, this will not be caught.
 * The static testSupportedFeatures method should be called before clearing the
 * default HTML.
 */
class FeatureSupportTest {
  #privateMember;
  arrowFunction;

  constructor() {
    this.#privateMember = ['one', 'two', 'three'];
    this.arrowFunction = (data) => `[${data}]`;
  }
  /**
   * Getter
   * @returns {string}
   */
  get privateMember() {
    return this.#privateMember;
  }

  /**
   * @param {string} value
   */
  set privateMember(value) {
    this.#privateMember = value;
  }

  /**
   * Code that uses modern features that may not be supported by the browser.
   * @returns {string} test message
   */
  #test() {
    const arr = [this.#privateMember, 'a', 's', 's'];
    const copy = [...arr].map((entry) => this.arrowFunction(entry));
    return copy.join('');
  }

  /**
   * @param {string} text
   */
  static testSupportedFeatures(text) {
    const tester = new FeatureSupportTest();
    tester.privateMember = text; // setter
    const result = tester.#test();
    LOG.debug(`Supported feature test: ${result}`);
  }
}

/**
 * Get the maximum scale allowed for the game.
 * @returns {number}
 */
function getMaxScale() {
  return PERSISTENT_DATA.get('DO_NOT_SCALE', false) ? 1 : 2.4;
}

/**
 * Log browser information
 */
function logDebugInfo() {
  LOG.info(`Version: ${VERSION.build} ${VERSION.date}`);
  LOG.info(`Browser: ${navigator.userAgent}`);
  LOG.info(`devicePixelRatio: ${window.devicePixelRatio}`);
}

window.addEventListener('load', () => {
  logDebugInfo();
  FeatureSupportTest.testSupportedFeatures('p');
  const DESIGN_WIDTH = 800;
  const DESIGN_HEIGHT = 600;

  try {
    GAME.initialise({
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT,
      maxScale: getMaxScale(),
      minScale: 1,
      sizingMethod: 'COVER',
      alpha: false,
    });
  } catch (error) {
    LOG.fatal(error);
  }
});

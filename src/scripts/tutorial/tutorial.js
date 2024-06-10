/**
 * @file Manage tutorials
 *
 * @module tutorial/tutorial
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
 * @typedef {string} SituationValue
 */

/**
 * @enum {SituationValue}
 */
export const Situation = {
  HERO: 'HERO',
  ENTRY: 'ENTRY',
  EXIT: 'EXIT',
  MOVEMENT: 'MOVEMENT',
  INTERACTION: 'INTERACTION',
};
/**
 * Class to manage tutorials. Tutorials are effectively snippets of text that are
 * displayed when situations occur. They are only displayed the first time the
 * situation is encountered since the application starts. When all situations
 * are encountered, the tutorial is disabled unless the user re-enables it.
 */
class Tutorial {
  /** @type {function(text:string, position:module:utils/geometry.Position):Promise} */
  #presenter;

  /** @type {Map} */
  #situations;

  /**
   * Create the tutorial. It defaults to off.
   
   */
  constructor() {}

  /**
   * Set the presenter.
   * @param {function(text:string):Promise} presenter
   */
  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /** Start the tutorial. */
  start() {
    this.#situations = new Map();
    for (const key in Situation) {
      this.#situations.set(key, Situation[key]);
    }
  }

  /**
   * End the tutorial.
   */
  end() {
    this.#situations = null;
  }

  /**
   * Test if the tutorial will present a situation.
   * @param {SituationValue} situation
   * @returns {boolean}
   */
  willPresent(situation) {
    return this.#situations ? this.#situations.has(situation) : false;
  }

  /**
   * Test if tutorial complete.
   * @returns {boolean}
   */
  isComplete() {
    return !this.#situations || this.#situations.size === 0;
  }

  /**
   * Present the situation. Presentation is made via a call to the presenter
   * to display the text.
   * @param {SituationValue} situation
   * @param {string} text
   * @param {module:utils/geometry.Position} position
   * @returns {Promise} fulfils to null.
   */
  present(situation, text, position) {
    const entry = this.#situations?.has(situation);
    if (entry && this.#presenter) {
      this.#situations.delete(situation); // done
      return this.#presenter(text, position);
    } else {
      return Promise.resolve();
    }
  }
}

/** @type {Tutorial} */
export const TUTORIAL = new Tutorial();

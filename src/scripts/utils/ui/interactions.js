/**
 * @file Interactions with the ui
 *
 * @module utils/ui/interactions
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
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
 * @typedef {function} UiClickCallback
 * @param {Object} target - initial object that triggered the handler
 * @param {import('../geometry.js').Point} point - the position that was clicked in world coordinates
 */

/**
 * BAse for all UiClickHandlers
 */
export class UiClickHandler {
  /** @type {UiClickCallback} */
  #onClick;
  /** @type {UiClickCallback} */
  #onContextClick;
  /** @type {UiClickCallback} */
  #onPointerDown;
  /** @type {UiClickCallback} */
  #onPointerUp;

  /** Set click handler. Note that this does not add a listener for the event.
   * @param {UiClickCallback} handler
   */
  setOnClick(handler) {
    this.#onClick = handler;
  }

  /** Set on context Click handler.
   * @param {UiClickCallback} handler
   */
  setOnContextClick(handler) {
    this.#onContextClick = handler;
  }

  /** Set pointer down handler. Note that this does not add a listener for the event.
   * @param {UiClickCallback} handler
   */
  setOnPointerDown(handler) {
    this.#onPointerDown = handler;
  }

  /** Set pointer up handler. Note that this does not add a listener for the event.
   * @param {UiClickCallback} handler
   */
  setOnPointerUp(handler) {
    this.#onPointerUp = handler;
  }
  /**
   * Handle click
   * @param {import('../geometry.js').Point} point
   */
  actionClick(point) {
    this.#onClick?.(this, point);
  }

  /**
   * Handle context click
   * @param {import('../geometry.js').Point} point
   */
  actionContextClick(point) {
    this.#onContextClick?.(this, point);
  }

  /**
   * Handle pointer down
   * @param {import('../geometry.js').Point} point
   */
  actionPointerDown(point) {
    this.#onPointerDown?.(this, point);
  }

  /**
   * Handle pointer up
   * @param {import('../geometry.js').Point} point
   */
  actionPointerUp(point) {
    this.#onPointerUp?.(this, point);
  }
}

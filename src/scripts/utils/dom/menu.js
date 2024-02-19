/**
 * @file Classes for managing menues.
 *
 * @module utils/dom/menu
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
 *
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
 * Menu item.
 */
export class OptionButton {
  /** @type {string} */
  #label;
  /** @type {import("../sprites/imageManager.js").SpriteBitmap} */
  #image;
  /** @type {function():Promise} */
  #action;

  constructor(label, image, action) {
    this.#label = label;
    this.#image = image;
    this.#action = action;
  }

  /** Get HTML element for the button.
   * @returns {Element}
   */
  getButton() {
    const container = document.createElement('button');
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', this.#image.width);
    canvas.setAttribute('height', this.#image.height);
    const context = canvas.getContext('2d');
    context.drawImage(this.#image.image, 0, 0);
    container.appendChild(canvas);
    const labelEl = document.createElement('span');
    labelEl.innerText = this.#label;
    container.appendChild(labelEl);
    return container;
  }

  /**
   * executes the menu item's promise.
   * @returns {Promise}
   */
  execute() {
    if (this.#action) {
      return this.#action();
    } else {
      return Promise.resolve();
    }
  }
}

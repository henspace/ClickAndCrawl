/**
 * @file Classes for managing menues.
 *
 * @module utils/dom/menu
 *
 * License {@link https://opensource.org/license/mit/|MIT}
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

import IMAGE_MANAGER from '../sprites/imageManager.js';
import GameConstants from '../game/gameConstants.js';
import PERSISTENT_DATA from '../persistentData.js';

/**
 * Menu item.
 */
export class ActionButton {
  /** @type {string} */
  #label;
  /** @type {import("../sprites/imageManager.js").SpriteBitmap} */
  #bitmap;
  /** @type {function():Promise} */
  #action;

  /**
   * Create the action button.
   * @param {Object} options
   * @param {*} options.label
   * @param {*} options.image
   * @param {*} options.action
   */
  constructor(options) {
    this.#label = options.label;
    this.#bitmap = options.image;
    this.#action = options.action;
  }

  /** Get HTML element for the button.
   * @returns {Element}
   */
  getElement() {
    const container = document.createElement('button');
    const canvas = document.createElement('canvas');
    canvas.setAttribute('width', this.#bitmap.width);
    canvas.setAttribute('height', this.#bitmap.height);
    const context = canvas.getContext('2d');
    context.drawImage(this.#bitmap.image, 0, 0);
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

/**
 * Text button
 */
export class TextButtonControl {
  /**
   * @type {Element}
   */
  element;
  /** @type {string} */
  id;

  /** Create the button */
  constructor(options) {
    this.element = document.createElement('button');
    this.element.appendChild(document.createTextNode(options.label));
  }
}

/**
 * Universal control that can be used as an action button or a toggle selection.
 */
export class IconButtonControl {
  /** @type {import("../sprites/imageManager.js").SpriteBitmap} */
  #bitmapUp;
  /** @type {import("../sprites/imageManager.js").SpriteBitmap} */
  #bitmapDown;
  /** @type {Element} */
  #element;
  /** @type {CanvasRenderingContext2D} */
  #context;
  /** @type {boolean} */
  #selected;
  /** @type {function: Promise} */
  action;
  /** @type {string} */
  id;

  /**
   * Create a toggle control button. Buttons are sized the same size as a tile
   * as defined in GameConstants.TILE_SIZE.
   * @param {Object} options
   * @param {string} label
   * @param {string} id - used in responses.
   * @param {string} options.imageNameUp - the image will be taken from the IMAGE_MANAGER using index 0.
   * @param {string} [options.imageNameDown] - the image will be taken from the IMAGE_MANAGER using index 0.
   * If not provided, the up button is used.
   * @param {boolean} options.internalLabel - set whether the label in inside or outside the button.
   * @param {function: Promise} options.action - action executed on release. If this is provided, the button is
   * treated as a momentary button. Otherwise it is treated as a latched button or toggle button.
   */
  constructor(options) {
    if (!options.imageNameDown && !options.action) {
      throw Error(
        'Attempt to create a button with no down image and no action. One or other must be supplied.'
      );
    }
    this.id = options.id;
    const button = document.createElement('button');
    if (options.imageNameUp) {
      this.#bitmapUp = IMAGE_MANAGER.getSpriteBitmap(0, options.imageNameUp);
      this.#bitmapDown = options.imageNameDown
        ? IMAGE_MANAGER.getSpriteBitmap(0, options.imageNameDown)
        : this.#bitmapUp;
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', GameConstants.TILE_SIZE);
      canvas.setAttribute('height', GameConstants.TILE_SIZE);
      this.#context = canvas.getContext('2d');
      button.appendChild(canvas);
    }

    if (options.internalLabel || !this.#context) {
      this.#element = button;
      button.classList.add('icon-button-internal');
      const span = this.#element.appendChild(document.createElement('span'));
      span.appendChild(document.createTextNode(options.label));
    } else {
      button.classList.add('icon-button-external');
      this.#element = document.createElement('label');
      this.#element.appendChild(document.createTextNode(options.label));
      this.#element.appendChild(button);
    }
    this.#element.addEventListener('mousedown', () => this.#pressed());
    this.#element.addEventListener('touchstart', () => this.#pressed(), {
      passive: true,
    });
    this.#element.addEventListener('mouseup', async () => this.#released());
    this.#element.addEventListener('touchend', async () => this.#released());
    this.#element.addEventListener('touchcancel', () => this.#cancelled());
    this.selected = false;
    this.action = options.action;
  }

  /**
   * Get the underlying HTML element;
   */
  get element() {
    return this.#element;
  }

  /**
   * Get current selection state
   * @returns {boolean}
   */
  get selected() {
    return this.#selected;
  }

  /**
   * Set current selection state.
   * @param {boolean} value
   */
  set selected(value) {
    this.#selected = value;
    this.#showSelectionImage();
  }

  /** Handle pressed state. */
  #pressed() {
    this.#drawImage(this.#bitmapDown);
  }

  /** Handle released state. */
  #released() {
    this.#selected = !this.#selected;
    this.#showSelectionImage();
  }

  /** Handle cancelled event. */
  #cancelled() {
    this.#showSelectionImage();
  }

  /** show image appropriate to the current selection state. */
  #showSelectionImage() {
    this.#drawImage(this.#selected ? this.#bitmapDown : this.#bitmapUp);
  }

  /**
   * Draw image onto the button
   * @param {import('../sprites/imageManager.js').SpriteBitmap} spriteBitmap
   */
  #drawImage(spriteBitmap) {
    this.#context.clearRect(
      0,
      0,
      GameConstants.TILE_SIZE,
      GameConstants.TILE_SIZE
    );
    this.#context.drawImage(
      spriteBitmap.image,
      0.5 * (GameConstants.TILE_SIZE - spriteBitmap.width),
      0.5 * (GameConstants.TILE_SIZE - spriteBitmap.height)
    );
  }
}

/**
 * IconButtonControl but with the icons set to the standard checkbox icons.
 */
export class CheckboxControl extends IconButtonControl {
  /**
   * Create checkbox control.
   * @param {string} label
   */
  constructor(label) {
    super({
      label: label,
      imageNameUp: 'ui-checkbox00.png',
      imageNameDown: 'ui-checkbox01.png',
      internalLabel: false,
      action: null,
    });
  }
}

/**
 * Control UI types.
 * @enum {string}
 */
export const ControlType = {
  TEXT_BUTTON: 'text button',
  CHECKBOX: 'checkbox',
};

/**
 * @typedef {Object} ControlDefinition
 * @param {string} key - identification for the control. Used as a key for storage.
 * @param {string} label - text displayed on control
 * @param {*}   defValue - default value,
 * @param {ControlType} controlType - type of control required,
 * @param {boolean} persistent - whether the value is stored in persistent data.
 * @param {function: Promise} action - action to perform when clicked.
 */

/**
 * Create a control type.
 * @param {ControlDefinition} definition
 * @returns {IconButtonControl}
 */
export function createControl(definition) {
  let control;
  switch (definition.controlType) {
    case ControlType.TEXT_BUTTON:
      control = new TextButtonControl(definition);
      break;
    case ControlType.CHECKBOX:
      control = new CheckboxControl(definition.label);
      if (definition.persistent) {
        control.selected = PERSISTENT_DATA.get(
          definition.key,
          definition.defValue
        );
        control.action = () => {
          PERSISTENT_DATA.set(definition.key, control.selected);
          return definition.action ? definition.action : Promise.resolve();
        };
      } else {
        control.selected = definition.defValue;
        control.action = definition.action;
      }
      break;
  }
  return control;
}

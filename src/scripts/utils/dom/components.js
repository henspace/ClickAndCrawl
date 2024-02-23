/**
 * @file Classes for managing menus.
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
import LOG from '../logging.js';
import SYSTEM from '../system.js';

/**
 * Base control
 */
class BaseControl {
  /**
   * @type {Element}
   */
  _element;

  /** @type {string} */
  #id;

  /** @type {*} */
  #value;

  /** @type {boolean} */
  #persistent;

  /** @type {boolean} */
  closes;

  /** @type {function: Promise} */
  #action;

  /**
   * Create base control
   * @param {Object} options
   * @param {string} options.id
   * @param {string} options.label
   * @param {boolean} options.persistent - is data stored in persistent storage.
   * @param {*} options.defValue - default value
   * @param {boolean} closes - flag to indicate whether this control should be used
   * to close a dialog or form when clicked.
   */
  constructor(options) {
    if (options.closes && options.action) {
      throw new Error(
        `Attempt made to create control ${options.id} that is set to close forms and perform and action. These are mutually exclusive.`
      );
    }
    this.#id = options.id;
    this.#persistent = options.persistent;
    if (options.persistent) {
      this.#value = PERSISTENT_DATA.get(this.#id, options.defValue);
    } else {
      this.#value = options.defValue;
    }
    this.closes = options.closes;
    this.#action = options.action;
    this.listeners = 0;
  }

  /**
   * Get the underlying element
   * @returns {Element}
   */
  get element() {
    return this._element;
  }

  /**
   *
   * @returns {*}
   */
  get value() {
    return this.#value;
  }

  /**
   * Set the value.
   * @param {*} value
   */
  set value(value) {
    if (value === this.#value) {
      return;
    }
    if (this.#persistent) {
      PERSISTENT_DATA.set(this.#id, value);
    }
    this.#value = value;
  }

  /**
   * Enable action on event name.
   * @param {string} eventName
   */
  enableActionOnEvent(eventName) {
    if (this._element && this.#action) {
      this._element.addEventListener(eventName, async (event) => {
        LOG.debug(
          `Click: current target ${event.currentTarget}, target ${event.target}`
        );
        await this.#action(event);
      });
    }
  }
}

/**
 * Text button
 */
export class TextButtonControl extends BaseControl {
  /** Create the button.
   * @param {Object} options - see BaseControl plus
   * @param {function:Promise} action - function called on click.
   */
  constructor(options) {
    super(options);
    this._element = this.buildElement(options);
    this.enableActionOnEvent('click');
  }

  /**
   * @param {Object} options - see Constructor.
   * @returns {Element}
   */
  buildElement(options) {
    const element = document.createElement('button');
    element.appendChild(document.createTextNode(options.label));
    element.className = 'text-button';
    return element;
  }
}

/**
 * Text button
 */
export class BitmapButtonControl extends BaseControl {
  /** Create the button.
   * @param {Object} options - see BaseControl. Plus
   * @param {function:Promise} action - function called on click.
   * @param {number} imageIndex - index in image manager
   * @param {string} imageName
   */
  constructor(options) {
    super(options);
    this._element = this.buildElement(options);
    this.enableActionOnEvent('click');
  }

  /**
   * @param {Object} options - see Constructor.
   * @returns {Element}
   */
  buildElement(options) {
    const element = document.createElement('button');
    element.appendChild(document.createTextNode(options.label));
    element.appendChild(
      createBitmapElement(options.index, options.imageName, 'button-icon')
    );
    element.className = 'icon-button';
    return element;
  }
}

/**
 * Create a bitmap element
 * @param {number} index - index of images in the image manager
 * @param {string} imageName
 * @param {string} className
 * @returns {Element}
 */

function createBitmapElement(index = 0, imageName, className) {
  const bitmapImage = IMAGE_MANAGER.getSpriteBitmap(index, imageName);
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', GameConstants.TILE_SIZE);
  canvas.setAttribute('height', GameConstants.TILE_SIZE);
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, GameConstants.TILE_SIZE, GameConstants.TILE_SIZE);
  context.drawImage(
    bitmapImage.image,
    0.5 * (GameConstants.TILE_SIZE - bitmapImage.width),
    0.5 * (GameConstants.TILE_SIZE - bitmapImage.height)
  );
  canvas.className = className;
  return canvas;
}

class NativeCheckboxControl extends BaseControl {
  /** @type {Element} */
  #checkbox;

  /**
   * Create the NativeCheckboxControl
   * @param {string} id
   * @param {string} label
   * @param {boolean} persistent
   */
  constructor(id, label, persistent) {
    super({
      id: id,
      label: label,
      persistent: persistent,
      closes: false,
    });
    this._element = this.buildElement(label);
    this.#checkbox.checked = this.value;
    this._element.addEventListener('change', (event) => {
      this.value = this.#checkbox.checked;
    });
  }

  /**
   * Build the element
   * @param {string} label
   * @returns {Element}
   */
  buildElement(label) {
    const checkboxContainer = document.createElement('span');
    checkboxContainer.className = 'styled-checkbox';
    this.#checkbox = document.createElement('input');
    this.#checkbox.setAttribute('type', 'checkbox');
    checkboxContainer.appendChild(this.#checkbox);
    checkboxContainer.appendChild(
      createBitmapElement(0, 'ui-checkbox00.png', 'unchecked')
    );
    checkboxContainer.appendChild(
      createBitmapElement(0, 'ui-checkbox01.png', 'checked')
    );
    const element = document.createElement('label');
    element.appendChild(document.createTextNode(label));
    element.appendChild(checkboxContainer);
    return element;
  }
}

/**
 * Control UI types.
 * @enum {string}
 */
export const ControlType = {
  TEXT_BUTTON: 'text button',
  CHECKBOX: 'checkbox',
  NATIVE_CHECKBOX: 'native checkbox',
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
 * @returns {BaseControl}
 */
export function createControl(definition) {
  let control;
  switch (definition.controlType) {
    case ControlType.TEXT_BUTTON:
      control = new TextButtonControl(definition);
      break;
    case ControlType.NATIVE_CHECKBOX:
      control = new NativeCheckboxControl(
        definition.id,
        definition.label,
        definition.persistent
      );
      break;
  }
  return control;
}

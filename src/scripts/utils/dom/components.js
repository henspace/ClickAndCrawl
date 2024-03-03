/**
 * @file Classes for managing menus.
 *
 * @module utils/dom/menu
 */
/**
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

  /**
   * Create base control
   * @param {Object} options
   * @param {string} options.id
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
    this.listeners = 0;
  }
  /**
   * Get the underlying id
   * @returns {Element}
   */
  get id() {
    return this.#id;
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
}

/**
 * Text button
 */
export class TextButtonControl extends BaseControl {
  /** Create the button.
   * @param {Object} options - see BaseControl plus
   * @param {string} options.label
   * @param {function():Promise} options.action - function called on click.
   */
  constructor(options) {
    super(options);
    this._element = this.buildElement(options);
    if (options.action) {
      this._element.addEventListener('click', () => options.action());
    }
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
   * * @param {string} options.label
   * @param {function():Promise} options.action - function called on click.
   * @param {string} imageName
   */
  constructor(options) {
    super(options);
    this._element = this.buildElement(options);
    if (options.action) {
      this._element.addEventListener('click', () => options.action());
    }
  }

  /**
   * @param {Object} options - see Constructor.
   * @returns {Element}
   */
  buildElement(options) {
    const element = document.createElement('button');
    if (options.label) {
      element.appendChild(document.createTextNode(options.label));
    }
    element.appendChild(createBitmapElement(options.imageName, 'button-icon'));
    element.className = 'icon-button';
    return element;
  }
}

/**
 * Create a bitmap element
 * @param {string} imageName
 * @param {string} className
 * @returns {Element}
 */

export function createBitmapElement(imageName, className) {
  const bitmapImage = IMAGE_MANAGER.getSpriteBitmap(
    imageName ?? 'undefined.png'
  );
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

/**
 * Create a checkbox control
 */
class CheckboxControl extends BaseControl {
  /** @type {Element} */
  #checkbox;

  /**
   * Create the CheckboxControl
   * @param {ControlDefinition} options - see Base control plus
   * @param {string} options.label
   */
  constructor(options) {
    super(options);
    this._element = this.buildElement(options.label);
    this.#checkbox.checked = this.value;
    this._element.addEventListener('change', (event) => {
      this.value = this.#checkbox.checked;
      if (options.onChange) {
        options.onChange(this.value);
      }
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
      createBitmapElement('ui-checkbox00.png', 'unchecked')
    );
    checkboxContainer.appendChild(
      createBitmapElement('ui-checkbox01.png', 'checked')
    );
    const element = document.createElement('label');
    element.appendChild(document.createTextNode(label));
    element.appendChild(checkboxContainer);
    return element;
  }
}

/**
 * Range control
 */
export class RangeControl extends BaseControl {
  /** @type {Element} */
  #rangeInput;

  /**
   * Create the RangeControl
   * @param {ControlDefinition} options - see BaseControl plus
   * @param {string} options.label
   */
  constructor(options) {
    super(options);
    this._element = this.buildElement(options.label);
    this.#rangeInput.value = this.value;
    this._element.addEventListener('change', (event) => {
      this.value = this.#rangeInput.value;
      if (options.onChange) {
        options.onChange(this.value);
      }
    });
  }

  /**
   * Build the element
   * @param {string} label
   * @returns {Element}
   */
  buildElement(label) {
    const rangeContainer = document.createElement('span');
    rangeContainer.className = 'styled-range';
    this.#rangeInput = document.createElement('input');
    this.#rangeInput.setAttribute('type', 'range');
    rangeContainer.appendChild(this.#rangeInput);
    const element = document.createElement('label');
    element.appendChild(document.createTextNode(label));
    element.appendChild(rangeContainer);
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
  RANGE: 'range',
};

/**
 * @typedef {Object} ControlDefinition
 * @param {string} key - identification for the control. Used as a key for storage.
 * @param {string} label - text displayed on control
 * @param {*}   defValue - default value,
 * @param {ControlType} controlType - type of control required,
 * @param {boolean} persistent - whether the value is stored in persistent data.
 * @param {function(): Promise} action - action to perform when clicked.
 * @param {function()} onChange - action to perform when value changes.
 */

/**
 * Create a control type.
 * @param {ControlDefinition} definition
 * @returns {BaseControl}
 */
export function createControl(definition) {
  let control;
  switch (definition.controlType) {
    case ControlType.CHECKBOX:
      control = new CheckboxControl(definition);
      break;
    case ControlType.RANGE:
      control = new RangeControl(definition);
      break;
    case ControlType.TEXT_BUTTON:
      control = new TextButtonControl(definition);
      break;
    default:
      throw new Error(
        `Attempt to create unrecognised control type ${definition.controlType}`
      );
  }
  return control;
}

/**
 * Create an element.
 * @param {string} tagName
 * @param {Object} options
 * @param {string} options.className
 * @param {string} options.text
 * @param {string} options.html - has precedence over options.text.
 * @param {Element} options.child - appended after text or html.
 * @returns {Element}
 */
export function createElement(tagName, options) {
  const element = document.createElement(tagName);
  if (options.className) {
    element.className = options.className;
  }
  if (options.html) {
    element.innerHtml = options.html;
  } else if (options.text) {
    element.innerText = options.text;
  }
  if (options.child) {
    element.appendChild(options.child);
  }
  return element;
}

/**
 * Create a button bar.
 * @param {string[]} labels
 */
export function createButtonBar(labels) {
  const bar = createElement('div', { className: 'button-bar' });
  labels.forEach((label) => {
    const button = createElement('button', { text: label });
  });
  return bar;
}

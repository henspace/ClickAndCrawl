/**
 * @file Dialogs for use in the game
 *
 * @module utils/dom/ui
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

import SCREEN from '../game/screen.js';

/**
 * Dialog response codes.
 */
export const DialogResponse = {
  OK: 0,
  CANCEL: 1,
  YES: 2,
  NO: 3,
};

/**
 * Get a message element. This returns a div which contains the message text.
 * @param {string} message
 */
function createMessageElement(message) {
  const element = document.createElement('div');
  element.innerText = message;
  element.classList.add(['scrollable']);
  return element;
}

/** Create a message that is removed on any click. This sits above everything
 * as a self contained popup.
 * @param {string} message
 */
function showMessage(message) {
  const popup = document.createElement('div');
  popup.appendChild(document.createTextNode(message));
  popup.className = 'popup';
  popup.style.opacity = 1;
  document.body.appendChild(popup);
  popup.addEventListener('click', () => popup.remove());
}

/** Create an okDialog.
 * @param {string} message
 * @param {string} [okButtonLabel = 'OK']
 * @param {string} className
 * @returns {Promise} fulfils to DialogResponse.OK
 */
function showOkDialog(message, okButtonLabel = 'OK', className) {
  const container = document.createElement('div');
  container.appendChild(createMessageElement(message));
  const buttonEl = document.createElement('button');
  buttonEl.appendChild(document.createTextNode(okButtonLabel));
  container.appendChild(buttonEl);
  return SCREEN.displayOnGlass(
    container,
    [{ element: buttonEl, response: DialogResponse.OK, execute: null }],
    className
  );
}

/** Create a menu dialog.
 * @param {string} message
 * @param {IconButtonControl[]} ActionButton
 * @param {string} className
 * @returns {Promise} fulfils to DialogResponse.OK
 */
function showMenuDialog(message, actionButtons, className) {
  const container = document.createElement('div');
  container.appendChild(createMessageElement(message));
  const closers = [];
  actionButtons.forEach((button) => {
    container.appendChild(button.element);
    closers.push({
      element: button.element,
      response: button.id,
    });
  });
  return SCREEN.displayOnGlass(container, closers, className);
}

/**
 * The UI singleton.
 */
const UI = {
  showMessage: showMessage,
  showOkDialog: showOkDialog,
  showMenuDialog: showMenuDialog,
};

export default UI;

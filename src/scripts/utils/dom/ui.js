/**
 * @file Dialogs for use in the game
 *
 * @module utils/dom/ui
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

import SCREEN from '../game/screen.js';
import MESSAGES from '../messageManager.js';
import * as components from './components.js';

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
 * @param {string} messageKey - message key for the message manager.
 */
function showMessage(messageKey) {
  const message = MESSAGES.getText(messageKey);
  const popup = document.createElement('div');
  popup.appendChild(document.createTextNode(message));
  popup.className = 'popup';
  popup.style.opacity = 1;
  document.body.appendChild(popup);
  popup.addEventListener('click', () => popup.remove());
}

/** Create an okDialog.
 * @param {string} messageKey
 * @param {string} [okButtonLabelKey = 'OK']
 * @param {string} className
 * @returns {Promise} fulfils to DialogResponse.OK
 */
function showOkDialog(messageKey, okButtonLabelKey = 'OK', className) {
  const message = MESSAGES.getText(messageKey);
  const okButtonLabel = MESSAGES.getText(okButtonLabelKey);
  const container = document.createElement('div');
  container.appendChild(createMessageElement(message));
  const buttonEl = document.createElement('button');
  buttonEl.appendChild(document.createTextNode(okButtonLabel));
  container.appendChild(buttonEl);
  return SCREEN.displayOnGlass(
    container,
    [
      {
        element: buttonEl,
        id: DialogResponse.OK,
        closer: true,
      },
    ],
    className
  );
}

/** Create an ok Dialog but just showing raw html.
 * @param {string} title
 * @param {Element} element
 * @param {string} [okButtonLabelKey = 'OK']
 * @param {string} className
 * @returns {Promise} fulfils to DialogResponse.OK
 */
function showElementOkDialog(
  title,
  element,
  okButtonLabelKey = 'OK',
  className
) {
  const okButtonLabel = MESSAGES.getText(okButtonLabelKey);
  const container = document.createElement('div');
  if (title) {
    container.appendChild(components.createElement('p', { text: title }));
  }
  container.appendChild(element);
  const buttonEl = document.createElement('button');
  buttonEl.appendChild(document.createTextNode(okButtonLabel));
  container.appendChild(buttonEl);

  return SCREEN.displayOnGlass(
    container,
    [
      {
        element: buttonEl,
        id: DialogResponse.OK,
        closer: true,
      },
    ],
    className
  );
}

/** Create a controls dialog.
 * @param {string} messageKey - key to message from MESSAGES.
 * @param {BaseControl[]} actionButtons
 * @param {string} className
 * @returns {Promise} fulfils to DialogResponse.OK
 */
function showControlsDialog(messageKey, actionButtons, className) {
  const container = document.createElement('div');
  container.appendChild(createMessageElement(MESSAGES.getText(messageKey)));
  const closers = [];
  actionButtons?.forEach((button) => {
    container.appendChild(button.element);
    if (button.closes) {
      closers.push({
        element: button.element,
        response: button.id,
      });
    }
  });
  if (closers.length === 0) {
    const okButton = new components.TextButtonControl({ labelKey: 'OK' });
    container.appendChild(okButton.element);
    closers.push(okButton);
  }
  return SCREEN.displayOnGlass(container, closers, className);
}

/**
 * The UI singleton.
 */
const UI = {
  showMessage: showMessage,
  showOkDialog: showOkDialog,
  showElementOkDialog: showElementOkDialog,
  showControlsDialog: showControlsDialog,
};

export default UI;

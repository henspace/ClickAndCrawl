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
import * as components from './components.js';
import { i18n } from '../messageManager.js';
import ANIMATION_STATE_MANAGER from '../../gameManagement/animationState.js';

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
 * Called when a dialog is opened.
 */
function prepareDialog() {
  ANIMATION_STATE_MANAGER.setAnimationState(false);
}

/**
 * Called when a dialog is closed.
 */
function tearDownDialog() {
  ANIMATION_STATE_MANAGER.setAnimationState(true);
}

/**
 * Wrapper for SCREEN.displayOnGlass but calling tearDownDialog at end.
 * @param {HTMLElement} element
 * @param {Object} options
 * @param {Closers[]} options.closers - array of Closers. If not provided then the entire display
 * is used.
 * @param {string} options.className
 * @param {boolean} options.replace - replace current glass
 * @returns {Promise} fulfils to closers.closes value
 */
function displayOnGlass(element, options) {
  return SCREEN.displayOnGlass(element, options).then((response) => {
    tearDownDialog();
    return response;
  });
}
/**
 * Get a message element. This returns a div which contains the message text.
 * @param {string | string[]} message
 * @param {string} title
 */
function createMessageElement(message, title) {
  const element = components.createElement('div', {
    className: 'dialog-scroll-content',
  });
  if (title) {
    element.appendChild(
      components.createElement('p', { className: 'dialog-title', text: title })
    );
  }
  if (Array.isArray(message)) {
    for (const paragraph of message) {
      element.appendChild(createMessageElement(paragraph));
    }
  } else {
    element.appendChild(components.createElement('p', { text: message }));
  }
  element.classList.add(['scrollable']);
  return element;
}

/** Create a message that is removed on any click. This sits above everything
 * as a self contained popup.
 * @param {string} message - message for the message manager.
 */
function showMessage(message) {
  const popup = document.createElement('div');
  popup.appendChild(document.createTextNode(message));
  popup.className = 'popup';
  popup.style.opacity = 1;
  document.body.appendChild(popup);
  popup.addEventListener('click', () => popup.remove());
}

/**
 * Displays a popup element. A background glass layer is shown behind the popup
 * This is displayed in a similar way to showMessage but with the difference that
 * no event listener is added to close the popup. This is the responsibility of
 * the caller who should use the returned element to close it.
 * @param {Element} element
 * @returns {Element} the popup element.
 */
function popupElement(element) {
  const popup = document.createElement('div');
  popup.className = 'popup';
  const popupInner = document.createElement('div');
  popup.appendChild(popupInner);
  popupInner.appendChild(element);
  popup.style.opacity = 1;
  document.body.appendChild(popup);
  return popup;
}

/** Create an okDialog.
 * @param {string | string[]} message
 * @param {Object} [options = {}]
 * @param {string} [options.okButtonLabel = i18n`BUTTON OK`]
 * @param {string} options.className
 * @param {string} options.title
 * @returns {Promise} fulfils to DialogResponse.OK
 */
function showOkDialog(message, options = {}) {
  prepareDialog();
  const container = document.createElement('div');
  container.appendChild(createMessageElement(message, options.title));
  const buttonEl = document.createElement('button');
  buttonEl.appendChild(
    document.createTextNode(options.okButtonLabel ?? i18n`BUTTON OK`)
  );
  container.appendChild(buttonEl);
  return displayOnGlass(container, {
    className: options?.className,
    closers: [
      {
        element: buttonEl,
        closes: DialogResponse.OK,
      },
    ],
  });
}

/**
 * Create a choice dialog.
 * @param {string} title
 * @param {string | Element} message
 * @param {string[]} choices - labels for buttons.
 * @param {string} className - class name for the dialog.
 * @returns {number} index of selected button.
 */
function showChoiceDialog(title, message, choices, className) {
  const container = document.createElement('div');
  container.appendChild(createMessageElement(message, title));
  const actionButtons = [];
  choices?.forEach((choice, index) => {
    const button = new components.TextButtonControl({
      label: choice,
      closes: index,
    });
    actionButtons.push(button);
  });
  return showControlsDialog(message, {
    preamble: title,
    actionButtons: actionButtons,
    row: true,
    className: className,
  });
}

/** Create an ok Dialog but just showing a precreate element.
 * @param {string} title
 * @param {Element} element
 * @param {string} [okButtonLabel = 'BUTTON OK']
 * @param {string} className
 * @returns {Promise} fulfils to DialogResponse.OK
 */
function showElementOkDialog(
  title,
  element,
  okButtonLabel = i18n`BUTTON OK`,
  className
) {
  prepareDialog();
  const container = document.createElement('div');
  const scrollContainer = components.createElement('div', {
    className: 'dialog-scroll-content',
  });
  container.appendChild(scrollContainer);
  if (title) {
    scrollContainer.appendChild(
      components.createElement('p', { className: 'dialog-title', text: title })
    );
  }
  scrollContainer.appendChild(element);
  const buttonEl = document.createElement('button');
  buttonEl.appendChild(document.createTextNode(okButtonLabel));
  container.appendChild(buttonEl);

  return displayOnGlass(container, {
    closers: [
      {
        element: buttonEl,
        closes: DialogResponse.OK,
      },
    ],
    className: className,
  });
}

/** Create a controls dialog.
 * @param {string | Element} mainContent -message or element to show..
 * @param {Object} options
 * @param {Object} options.title - title
 * @param {string | Element} options.preamble - text placed before content..
 * @param {BaseControl[]} options.actionButtons
 * @param {boolean} options.row - if true, controls are in a row rather than the
 * default column.
 * @param {string} options.className
 * @param {string} options.okButtonLabel
 * @returns {Promise} fulfils to closures response value or DialogResponse.OK if
 * no closers.
 */
function showControlsDialog(mainContent, options = {}) {
  prepareDialog();
  const container = document.createElement('div');
  const scrollContainer = components.createElement('div', {
    className: 'dialog-scroll-content',
  });
  container.appendChild(scrollContainer);
  if (options.title) {
    scrollContainer.appendChild(
      components.createElement('p', {
        className: 'dialog-title',
        text: options.title,
      })
    );
  }
  if (options.preamble) {
    if (options.preamble instanceof Element) {
      scrollContainer.appendChild(options.preamble);
    } else {
      scrollContainer.appendChild(
        components.createElement('p', { text: options.preamble })
      );
    }
  }
  if (mainContent instanceof Element) {
    scrollContainer.appendChild(mainContent);
  } else {
    scrollContainer.appendChild(createMessageElement(mainContent));
  }
  const actionButtons = components.createElement('div', {
    className: options.row ? 'action-buttons-row' : 'action-buttons-col',
  });
  container.appendChild(actionButtons);
  const closers = [];
  options?.actionButtons?.forEach((button) => {
    if (!button.element.parentElement) {
      actionButtons.appendChild(button.element);
    }
    if (button.closes !== null && button.closes !== undefined) {
      closers.push({
        element: button.element,
        closes: button.closes,
      });
    }
  });
  if (closers.length === 0) {
    const okButton = new components.TextButtonControl({
      id: DialogResponse.OK,
      label: options.okButtonLabel ?? i18n`BUTTON OK`,
    });
    actionButtons.appendChild(okButton.element);
    closers.push(okButton);
  }
  return displayOnGlass(container, {
    closers: closers,
    className: options?.className,
  });
}

/**
 * The UI singleton.
 */
const UI = {
  popupElement: popupElement,
  showChoiceDialog: showChoiceDialog,
  showMessage: showMessage,
  showOkDialog: showOkDialog,
  showElementOkDialog: showElementOkDialog,
  showControlsDialog: showControlsDialog,
};

export default UI;

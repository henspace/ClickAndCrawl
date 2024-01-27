/**
 * @file Dialogs for use in the game
 *
 * @module utils/game/dialogs/dialogs
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

import { createMessageElement } from '../../dom/ui.js';
import SCREEN from '../screen.js';

/**
 * Dialog response codes.
 */
export const DialogResponse = {
  OK: 0,
  CANCEL: 1,
  YES: 2,
  NO: 3,
};

/** Create an okDialog.
 * @param {string} message
 * @param {string} [okButtonLabel = 'OK']
 * @returns {Promise} fulfils to DialogResponse.OK
 */
export function showOkDialog(message, okButtonLabel = 'OK') {
  return new Promise((resolve) => {
    SCREEN.displayHtmlElement(createMessageElement(message));
    const buttonEl = document.createElement('button');
    buttonEl.appendChild(document.createTextNode(okButtonLabel));
    buttonEl.onclick = () => resolve(DialogResponse.OK);
    SCREEN.appendHtmlElement(buttonEl);
  });
}

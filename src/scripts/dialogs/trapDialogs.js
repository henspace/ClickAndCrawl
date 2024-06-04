/**
 * @file Dialogs for handling traps
 *
 * @module dialogs/trapDialogs
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

import UI from '../utils/dom/ui.js';
import { i18n } from '../utils/messageManager.js';
import { TrapOutcome } from '../dnd/interact.js';

/**
 * Show offering disable options.
 * @param {module:dnd/traits.Traits} enactorTraitsUnused
 * @param {module:dnd/trapCharacteristics~TrapDetails} trapDetails
 * @param {string} trapDescription
 * @returns {Promise<TrapOutcome>} fulfils to TrapOutcome.ATTEMPT_DISABLE  or TrapOutcome.LEAVE
 */
export function showDisableTrap(
  enactorTraitsUnused,
  trapDetails,
  trapDescriptionUnused
) {
  return UI.showChoiceDialog(
    i18n`DIALOG TITLE TRAP DETECTED`,
    i18n`MESSAGE TRAP ATTEMPT DISABLE`,
    [i18n`BUTTON TRAP DISABLE`, i18n`BUTTON TRAP LEAVE`]
  ).then((index) =>
    index === 0 ? TrapOutcome.ATTEMPT_DISABLE : TrapOutcome.LEAVE
  );
}

/**
 * Show dialog explaining trap trigger survival.
 * @param {module:dnd/traits.Traits} enactorTraitsUnused
 * @param {module:dnd/trapCharacteristics~TrapDetails} trapDetailsUnused
 * @param {string} trapDescription
 * @returns {Promise}
 */
export function showSurvivedTrap(
  enactorTraitsUnused,
  trapDetailsUnused,
  trapDescription
) {
  return UI.showElementOkDialog(
    i18n`DIALOG TITLE TRAP TRIGGERED SURVIVED`,
    createTrapElement(trapDescription, i18n`MESSAGE TRAP TRIGGERED SURVIVED`)
  );
}

/**
 * Show dialog explaining trap trigger injury.
 * @param {module:dnd/traits.Traits} enactorTraitsUnused
 * @param {module:dnd/trapCharacteristics~TrapDetails} trapDetailsUnused
 * @param {string} trapDescription
 */
export function showInjuredByTrap(
  enactorTraitsUnused,
  trapDetailsUnused,
  trapDescription
) {
  return UI.showElementOkDialog(
    i18n`DIALOG TITLE TRAP TRIGGERED INJURED`,
    createTrapElement(trapDescription, i18n`MESSAGE TRAP TRIGGERED INJURED`)
  );
}

/**
 * Show dialog explaining trap trigger injury.
 * @param {module:dnd/traits.Traits} enactorTraitsUnused
 * @param {module:dnd/trapCharacteristics~TrapDetails} trapDetailsUnused
 * @param {string} trapDescriptionUnused
 */
export function showDisableSuccess(
  enactorTraitsUnused,
  trapDetailsUnused,
  trapDescriptionUnused
) {
  return UI.showOkDialog(
    i18n`DIALOG TITLE TRAP DISABLED`,
    createTrapElement(i18n`MESSAGE TRAP DISABLED`)
  );
}

/**
 * Create an element to describe trap and action.
 * @param {string} trapDescription
 * @param {string} message
 * @returns {Element}
 */
function createTrapElement(trapDescription, message) {
  const container = document.createElement('div');
  const description = document.createElement('p');
  description.innerText = trapDescription;
  container.appendChild(description);

  const messageEl = document.createElement('p');
  messageEl.innerText = message;
  container.appendChild(messageEl);
  return container;
}

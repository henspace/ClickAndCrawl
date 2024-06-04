/**
 * @file Dialogs for opening an exit.
 *
 * @module dialogs/openExitDialogs
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

import * as dndAction from '../dnd/dndAction.js';
import UI from '../utils/dom/ui.js';
import { i18n } from '../utils/messageManager.js';

/**
 * Attempt to open an exit.
 * @param {module:players/actors.Actor} actor
 * @param {module:players/artefacts.Artefact} key
 * @returns {Promise<boolean>} fulfils to true if picked.
 */
export function showUnpickExitDialog(actor, key) {
  return UI.showChoiceDialog(
    i18n`DIALOG TITLE LOCKED`,
    i18n`MESSAGE EXIT LOCKED`,
    [i18n`BUTTON TRY TO PICK`, i18n`BUTTON LEAVE IT`]
  ).then((choice) => (choice === 0 ? tryToPickLock(actor, key) : false));
}

/**
 * Try to pick a lock
 * @param {module:players/actors.Actor} actor
 * @param {module:players/artefacts.Artefact} key
 * @returns {Promise<boolean>} fulfils to true if picked.
 */
function tryToPickLock(actor, key) {
  if (!actor.storeManager.hasArtefactWithSameId('lock_pick')) {
    return UI.showOkDialog(i18n`MESSAGE NEED LOCK PICK`).then(() => false);
  }
  if (dndAction.canPickLock(actor.traits, key.traits)) {
    return UI.showOkDialog(i18n`MESSAGE YOU PICK THE LOCK`).then(() => true);
  } else {
    return UI.showOkDialog(i18n`MESSAGE YOU FAIL TO PICK THE LOCK`).then(
      () => false
    );
  }
}

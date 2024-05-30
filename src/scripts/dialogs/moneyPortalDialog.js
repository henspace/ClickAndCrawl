/**
 * @file Money portal dialog
 *
 * @module dialogs/moneyPortalDialog
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
import LOG from '../utils/logging.js';
import { i18n } from '../utils/messageManager.js';

/**
 * Allow actor to transfer money through portal
 * @param {module:players/actors.Actor} actor
 * @returns {Promise<number>} fulfils amount of gold transferred.
 */
export function showMoneyPortalDialog(actor) {
  const storeManager = actor.storeManager;
  if (!storeManager) {
    LOG.error('Actor with no storeManager is trying to use a gold portal.');
  }
  const gold = Math.floor(storeManager.getPurseValue());
  if (gold < 1) {
    return UI.showOkDialog(i18n`MESSAGE GOLD_PORTAL - INSUFFICIENT GOLD`).then(
      () => 0
    );
  }

  const labels = ['0%'];
  const transfers = [0];
  for (const percent of [25, 50, 75, 100]) {
    const transferValue = Math.round((gold * percent) / 100);
    if (transferValue > 1) {
      labels.push(`${percent}%`);
      transfers.push(transferValue);
    }
  }

  return UI.showChoiceDialog(
    i18n`DIALOG TITLE GOLD_PORTAL`,
    i18n`MESSAGE GOLD_PORTAL - EXPLAIN`,
    labels
  )
    .then((choice) => {
      const transferValue = transfers[choice];
      if (transferValue) {
        let transferredGold = actor.traits.getInt('GOLD_SENT', 0);
        transferredGold += transferValue;
        actor.traits.set('GOLD_SENT', transferredGold);
      }
      return transferValue;
    })
    .then((transferValue) => {
      if (transferValue) {
        storeManager.takeFromPurse(transferValue);
        return UI.showOkDialog(
          i18n`MESSAGE GOLD_PORTAL - EXPLAIN CLOSURE ${transferValue}`
        ).then(() => transferValue);
      } else {
        return 0;
      }
    });
}

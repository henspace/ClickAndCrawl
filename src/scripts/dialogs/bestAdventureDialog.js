/**
 * @file Dialog to show the best adventure
 *
 * @module dialogs/bestAdventureDialog
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
import * as components from '../utils/dom/components.js';

import { getBestAdventure } from '../gameManagement/gameSaver.js';

/**
 * Show a dialog with the best adventure results which are picked
 * up from persistent storage.
 * @returns {Promise}
 */
export function showBestAdventureDialog() {
  const bestAdventure = getBestAdventure();
  const container = components.createElement('div', {
    className: 'best-adventure',
  });
  if (bestAdventure) {
    const list = document.createElement('ul');
    container.appendChild(list);
    list.appendChild(
      components.createElement('li', {
        text: i18n`Name:${bestAdventure.name}`,
      })
    );
    list.appendChild(
      components.createElement('li', {
        text: i18n`Gold:${bestAdventure.gold.toFixed(2)}`,
      })
    );
    list.appendChild(
      components.createElement('li', {
        text: i18n`Character level:${bestAdventure.characterLevel}`,
      })
    );
    list.appendChild(
      components.createElement('li', {
        text: i18n`Experience:${bestAdventure.exp}`,
      })
    );
    list.appendChild(
      components.createElement('li', {
        text: i18n`Dungeon level:${bestAdventure.dungeonLevel}`,
      })
    );
  } else {
    container.appendChild(
      components.createElement('p', {
        text: i18n`MESSAGE NO SAVED ADVENTURE`,
      })
    );
  }

  return UI.showElementOkDialog(i18n`DIALOG TITLE BEST ADVENTURE`, container);
}

/**
 * @file Main menu
 *
 * @module menus/mainMenu
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

import UI from '../utils/dom/ui.js';
import { BitmapButtonControl } from '../utils/dom/components.js';
import { showSettingsDialog } from './settingsDialog.js';

/**
 * Display the main menu. All actions are controlled by the main menu except play
 * which results in the menu resolving.
 * @returns {Promise} fulfils to undefined if play selected.
 */
export function showMainMenu() {
  const play = new BitmapButtonControl({
    id: 'PLAY',
    labelKey: 'PLAY BUTTON',
    imageName: 'ui-play00.png',
    internalLabel: true,
    closes: true,
  });
  const settings = new BitmapButtonControl({
    id: 'SETTINGS',
    labelKey: 'SETTINGS BUTTON',
    imageName: 'ui-settings00.png',
    internalLabel: true,
    action: () => showSettingsDialog(),
    closes: false,
  });
  return UI.showControlsDialog('MAIN MENU TITLE', [settings, play], 'door');
}

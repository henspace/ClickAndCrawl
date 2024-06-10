/**
 * @file Settings dialog
 *
 * @module dialogs/settingsDialog
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

import { createControl, ControlType } from '../utils/dom/components.js';
import UI from '../utils/dom/ui.js';
import PERSISTENT_DATA from '../utils/persistentData.js';
import SOUND_MANAGER from '../utils/soundManager.js';
import { i18n, MESSAGES } from '../utils/messageManager.js';
import { showLogDialog } from './logDialog.js';
import { setFullscreenState } from '../utils/fullscreen.js';
import {
  setCssBaseFontScale,
  getDefaultFontScale,
} from '../utils/text/fonts.js';
import { TUTORIAL } from '../tutorial/tutorial.js';

/** Settings */
const SETTINGS = [
  {
    id: 'MUSIC_VOLUME',
    labelKey: 'CONTROL MUSIC VOLUME',
    defValue: 50,
    controlType: ControlType.RANGE,
    persistent: true,
    action: null,
    onChange: (value) => SOUND_MANAGER.setMusicVolumePercent(value),
  },
  {
    id: 'EFFECTS_VOLUME',
    labelKey: 'CONTROL EFFECTS VOLUME',
    defValue: 50,
    controlType: ControlType.RANGE,
    persistent: true,
    action: null,
    onChange: (value) => {
      SOUND_MANAGER.setEffectsVolumePercent(value);
      SOUND_MANAGER.playEffect('PUNCH');
    },
  },
  {
    id: 'FONT_SCALE',
    labelKey: 'CONTROL UI FONT SCALE',
    defValue: getDefaultFontScale() * 100,
    controlType: ControlType.RANGE,
    persistent: true,
    action: null,
    onChange: (value) => setCssBaseFontScale(value / 100),
  },
  {
    id: 'SHOW_QUICK_TIPS_AT_START',
    labelKey: 'CONTROL SHOW QUICK TIPS',
    defValue: true,
    controlType: ControlType.CHECKBOX,
    persistent: true,
    action: null,
    onChange: null,
  },
  {
    id: 'START_IN_FULLSCREEN',
    labelKey: 'CONTROL RUN FULLSCREEN',
    defValue: false,
    controlType: ControlType.CHECKBOX,
    persistent: true,
    action: null,
    onChange: null,
  },
  {
    id: 'HIDE_TUTORIAL',
    labelKey: 'CONTROL HIDE TUTORIAL',
    defValue: false,
    controlType: ControlType.CHECKBOX,
    persistent: true,
    action: null,
    onChange: (value) => {
      if (value) {
        TUTORIAL.end();
      } else {
        TUTORIAL.start();
      }
      return Promise.resolve();
    },
  },
  {
    id: 'DO_NOT_SCALE',
    labelKey: 'CONTROL DO NOT SCALE',
    defValue: false,
    controlType: ControlType.CHECKBOX,
    persistent: true,
    action: null,
    onChange: () => UI.showOkDialog(i18n`MESSAGE REQUIRES RESTART`),
    doNotInitialise: true,
  },
  {
    id: 'SHOW_DEBUG_LOG',
    labelKey: 'BUTTON SHOW DEBUG LOG',
    defValue: true,
    controlType: ControlType.TEXT_BUTTON,
    persistent: false,
    action: () => showLogDialog(),
    onChange: null,
  },
  {
    id: 'CLEAR_MEMORY',
    labelKey: 'BUTTON DELETE MEMORY',
    defValue: true,
    controlType: ControlType.TEXT_BUTTON,
    persistent: false,
    action: () => deleteMemory(),
    onChange: null,
  },
];

/**
 * Delete memory. Confirmation is required.
 */
function deleteMemory() {
  return UI.showChoiceDialog(
    i18n`DIALOG TITLE DELETE MEMORY`,
    i18n`MESSAGE CONFIRM DELETE MEMORY`,
    [i18n`BUTTON DELETE`, i18n`BUTTON CANCEL`]
  ).then((choice) => {
    if (choice === 0) {
      PERSISTENT_DATA.clearAll();
      return UI.showOkDialog(i18n`MESSAGE MEMORY DELETED`);
    }
  });
}
/**
 * Display the settings dialog. This retrieves the current settings from local
 * storage and allows modifications. Changes are saved immediately.
 */
export function showSettingsDialog() {
  const controls = [];
  SETTINGS.forEach((setting) => {
    controls.push(createControl(setting));
  });
  return UI.showControlsDialog(i18n`DIALOG TITLE SETTINGS`, {
    actionButtons: controls,
    className: 'door',
  }).then(() => setFullscreenState(PERSISTENT_DATA.get('START_IN_FULLSCREEN')));
}

/**
 * Loads persistent settings from stored memory and calls their onChange method.
 */
export function initialiseSettings() {
  SETTINGS.forEach((setting) => {
    setting.label = MESSAGES.getText(setting.labelKey);
    if (setting.persistent && setting.onChange && !setting.doNotInitialise) {
      const value = PERSISTENT_DATA.get(setting.id, setting.defValue);
      setting.onChange(value);
    }
  });
}

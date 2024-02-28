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

/** Settings */
const SETTINGS = [
  {
    id: 'BLOOD_ON',
    labelKey: 'BLOOD ON CONTROL',
    defValue: true,
    controlType: ControlType.CHECKBOX,
    persistent: true,
    action: null,
    closes: false,
  },
  {
    id: 'MUSIC_VOLUME',
    labelKey: 'MUSIC VOLUME CONTROL',
    defValue: 50,
    controlType: ControlType.RANGE,
    persistent: true,
    action: null,
    onChange: (value) => SOUND_MANAGER.setMusicVolumePercent(value),
    closes: false,
  },
  {
    id: 'EFFECTS_VOLUME',
    labelKey: 'EFFECTS VOLUME CONTROL',
    defValue: 50,
    controlType: ControlType.RANGE,
    persistent: true,
    action: null,
    onChange: (value) => {
      SOUND_MANAGER.setEffectsVolumePercent(value);
      SOUND_MANAGER.playEffect('PUNCH');
    },
    closes: false,
  },
];

/**
 * Display the settings dialog. This retrieves the current settings from local
 * storage and allows modifications. Changes are saved immediately.
 */
export function showSettingsDialog() {
  const controls = [];
  SETTINGS.forEach((setting) => {
    controls.push(createControl(setting));
  });
  return UI.showControlsDialog('SETTINGS DIALOG TITLE', controls, 'door');
}

/**
 * Loads persistent settings from stored memory and calls their onChange method.
 */
export function initialiseSettings() {
  SETTINGS.forEach((setting) => {
    if (setting.persistent & setting.onChange) {
      const value = PERSISTENT_DATA.get(setting.id, setting.defValue);
      setting.onChange(value);
    }
  });
}

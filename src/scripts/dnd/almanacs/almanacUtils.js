/**
 * @file Utilities for working with almanacs
 *
 * @module dnd/almanacs/almanacUtils
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

import { MESSAGES } from '../../utils/messageManager.js';
import LOG from '../../utils/logging.js';

/**
 * Takes an ID and creates name.
 * @param {string} [idMain = '?'] - id stripped of its suffix
 * @returns {string}
 */
export function createNameFromId(idMain = '?') {
  if (idMain.len < 2) {
    return idMain;
  }
  const name = idMain.replace(/_pv$/i, '').replace(/_/g, ' ');
  const capitalisedName = name.charAt(0).toUpperCase() + name.substring(1);
  return MESSAGES.getText(capitalisedName);
}

/**
 * Takes an ID and creates a description.
 * If no description an empty string is returned.
 * @param {string} id  - id stripped of its suffix
 * @returns {string}
 */
export function createDescriptionFromId(id) {
  const messageKey = `DESCRIPTION ${id.toUpperCase()}`;
  const result = MESSAGES.getText(messageKey);
  if (messageKey === result) {
    LOG.error(`No description set for ${messageKey}.`);
    return '';
  }
  return result;
}

/**
 * Takes an ID including its extension and creates name, imageName, description.
 * If needsIdentification is true the identification is also added.
 * @param {string} [id = '?']
 * @returns {{name:string, imageName:string, description:string, unknownDescription: string}}
 */
export function derivePartsFromId(id = '?') {
  const parts = id.split('+');
  const needsIdentification = parts.length > 1;
  const strippedName = parts[0];
  if (!id) {
    return {};
  }
  return {
    name: createNameFromId(strippedName),
    imageName: parts[0].toLowerCase(),
    description: createDescriptionFromId(id),
    unknownDescription: needsIdentification
      ? createDescriptionFromId(strippedName)
      : undefined,
  };
}

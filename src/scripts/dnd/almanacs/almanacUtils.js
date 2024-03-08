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

import { MESSAGES, i18n } from '../../utils/messageManager.js';
import LOG from '../../utils/logging.js';
/**
 * Takes an ID and creates a name.
 * @param {string} [id = '?']
 * @returns {string}
 */
export function createNameFromId(id = '?') {
  if (id.len < 2) {
    return id;
  }
  const name = id.replace(/_/g, ' ');
  const capitalisedName = name.charAt(0).toUpperCase() + name.substring(1);
  return MESSAGES.getText(capitalisedName);
}

/**
 * Takes an ID and creates a description.
 * If no description an empty string is returned.
 * @param {string} id
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

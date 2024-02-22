/**
 * @file Load assets. This module is placed in the assets folder to simplify
 * dynamic imports using Parcel's import.meta.url property.
 *
 * @module utils\assetLoaders.js
 *
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
import LOG from './logging.js';
/**
 * @type {Object<string, URL>} Urls for dynamically loading resources
 */
export const Urls = {
  DUNGEON_SCRIPT: new URL(
    '../../assets/stories/dungeon_script.txt',
    import.meta.url
  ),
};

/**
 * Load text file from URL.
 * @param {URL} url
 * @return {Promise} fulfils to text or null.
 */
export function loadTextFromUrl(url) {
  return fetch(url)
    .then((response) => response.text())
    .then((text) => text)
    .catch((reason) => {
      LOG.error(`Error fetching ${url}: ${reason}`);
      return null;
    });
}

/**
 * Load json from URL.
 * @param {URL} url
 * @return {Promise} fulfils to json object or null.
 */
export function loadJsonFromUrl(url) {
  return fetch(url)
    .then((response) => response.text())
    .then((text) => text)
    .catch((reason) => {
      LOG.error(`Error fetching ${url}: ${reason}`);
      return null;
    });
}

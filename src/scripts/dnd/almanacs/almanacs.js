/**
 * @file Almanacs
 *
 * @module dnd/almanacs/almanacs
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
import LOG from '../../utils/logging.js';
import * as almanacUtils from './almanacUtils.js';
import * as assetLoaders from '../../utils/assetLoaders.js';
import { strToActorType } from '../../players/actors.js';
import { strToArtefactType } from '../../players/artefacts.js';
import * as maths from '../../utils/maths.js';
/**
 * @typedef {Object} AlmanacEntry
 * @property {number} minLevel
 * @property {string} id
 * @property {ArtefactType | ActorType} type
 * @property {string} equipmentIds - comma separated equipment list
 * @property {string} traitsString
 */
/**
 * @typedef {AlmanacEntry[]} Almanac
 */

class AlmanacLibrary {
  /** @type {Map<string, Almanac>} */
  #almanacs;

  constructor() {
    this.#almanacs = new Map();
  }

  /**
   * Add Almanac
   * @param {string} key
   * @param {Almanac} almanac
   */
  addAlmanac(key, almanac) {
    this.#almanacs.set(key, almanac);
  }

  /**
   * Get Alamanac
   * @param {string} key
   * @returns {Almanac}
   */
  getAlmanac(key) {
    const result = this.#almanacs.get(key);
    if (!result) {
      LOG`Attempt to get non-existent almanac ${key}`;
    }
    return result;
  }
  /**
   * Get a random entry from the key
   * @param {string | string[]} keyOrKeys - almanac
   * @param {number} maxLevel
   * @returns {AlmanacEntry} null if none found.
   */
  getRandomEntry(keyOrKeys, maxLevel) {
    let key;
    if (Array.isArray(keyOrKeys)) {
      const index = maths.getRandomInt(0, keyOrKeys.length);
      key = keyOrKeys[index];
    } else {
      key = keyOrKeys;
    }
    let almanac;

    if (Number.isInteger(maxLevel)) {
      almanac = this.getAlmanac(key)?.filter(
        (entry) => entry.minLevel <= maxLevel
      );
    } else {
      almanac = this.getAlmanac(key);
    }

    if (almanac) {
      const index = maths.getRandomInt(0, almanac.length);
      return almanac[index];
    }
    LOG.error(`Failed to find almanac with key ${key}`);
    return;
  }

  /** Find an entry by its id.
   * @param {string} id
   * @param {string[]} keys - the almanacs to search
   * @returns {AlmanacEntry}
   */
  findById(id, keys) {
    if (!keys) {
      keys = this.#almanacs.keys();
    }
    for (const key of keys) {
      const result = this.#almanacs.get(key)?.find((entry) => entry.id === id);
      if (result) {
        return result;
      }
    }
    LOG.error(`Failed to find almanac entry for '${id}' in ${keys.join(', ')}`);
    return;
  }

  /**
   *
   * @param {string} key - almanac key
   * @param {*} type - entry type
   * @returns {module:players/artefacts~ArtefactTypeValue | module:players/artefacts~ActorTypeValue }
   */
  getItemType(key, type) {
    switch (key) {
      case 'HEROES':
      case 'ENEMIES':
      case 'TRADERS':
        return strToActorType(type);
      default:
        return strToArtefactType(type);
    }
  }
}

/**
 * Parse almanac line almanac entry
 * @param {string} line
 * @param {string} almanacKey
 */
function parseAlmanacLine(line, almanacKey) {
  const parts = line.match(
    /^ *(\d+) *, *(\w*) *, *(\w*) *(?:\[ *([\w, ]*?)])? *\*(.*)$/
  );
  if (!parts) {
    LOG.error(`Invalid almanac entry ${line}`);
    return null;
  }
  const entry = {};
  entry.minLevel = parseInt(parts[1]);
  entry.type = ALMANAC_LIBRARY.getItemType(almanacKey, parts[2]);
  entry.id = parts[3];
  entry.name = almanacUtils.createNameFromId(entry.id);
  entry.equipmentIds = csvToArray(parts[4]);
  entry.traitsString = parts[5];
  return entry;
}

/**
 * Parse comma separated list of equipment ids into array.
 * @param {string} list
 * @returns {string[]}
 */
function csvToArray(list) {
  return list ? list.trim().split(/\s*,\s*/) : list;
}

/**
 * Parse text file into almanac
 * @param {string} text
 * @param {string} key - Almanac key
 * @returns {Almanac}
 */
function parseAlmanacText(text, key) {
  const almanac = [];
  const lines = text.split(/[\r\n]+/);
  lines.forEach((line) => {
    line = line.trim();
    if (line !== '' && !line.startsWith('#')) {
      const entry = parseAlmanacLine(line, key);
      if (entry) {
        almanac.push(entry);
      }
    }
  });
  return almanac;
}

/**
 * Create the actor almanac
 * @param {Map<string, URL>} urls
 * @returns {Promise} fulfils to undefined when complete
 */
export function loadAlmanacs(urlMap) {
  const promises = [];
  urlMap.forEach((url, key) => {
    const promise = assetLoaders.loadTextFromUrl(url).then((text) => {
      ALMANAC_LIBRARY.addAlmanac(key, parseAlmanacText(text, key));
    });
    promises.push(promise);
  });
  return Promise.all(promises);
}

/**
 * @type {Map<string, Almanac>}
 */
export const ALMANAC_LIBRARY = new AlmanacLibrary();

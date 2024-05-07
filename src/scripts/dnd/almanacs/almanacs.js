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

/** Likelihoods of finding items */
const COMMON_PERCENT = 80;
const UNCOMMON_PERCENT = 25;
const RARE_PERCENT = 5;
const VERY_RARE_PERCENT = 1;

/** @typedef {string} AlmanacRarityValue */
/**
 * @enum {AlmanacRarityValue}
 */
const AlmanacRarity = {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  VERY_RARE: 'VERY RARE',
};

/**
 * @typedef {Object} AlmanacEntry
 * @property {number} minLevel
 * @property {string} id
 * @property {string} rarity - COMMON, UNCOMMON, RARE, VERY RARE
 * @property {string} imageName
 * @property {string} description
 * @property {string} typeId
 * @property {ArtefactType | ActorType} type
 * @property {string} equipmentIds - comma separated equipment list
 * @property {string} traitsString
 * @property {number} challengeRating - just used for searching the almanac
 */

class Almanac {
  /** @type {number} */
  static COMMON_CUTOFF =
    COMMON_PERCENT /
    (COMMON_PERCENT + UNCOMMON_PERCENT + RARE_PERCENT + VERY_RARE_PERCENT);
  /** @type {number} */
  static UNCOMMON_CUTOFF =
    (COMMON_PERCENT + UNCOMMON_PERCENT) /
    (COMMON_PERCENT + UNCOMMON_PERCENT + RARE_PERCENT + VERY_RARE_PERCENT);
  /** @type {number} */
  static RARE_CUTOFF =
    (COMMON_PERCENT + UNCOMMON_PERCENT + RARE_PERCENT) /
    (COMMON_PERCENT + UNCOMMON_PERCENT + RARE_PERCENT + VERY_RARE_PERCENT);
  /** @type {number} */
  static VERY_RARE_CUTOFF = 1;
  /** @type {AlmanacEntry[]} */
  common;
  /** @type {AlmanacEntry[]} */
  uncommon;
  /** @type {AlmanacEntry[]} */
  rare;
  /** @type {AlmanacEntry[]} */
  veryRare;

  /**
   * Create the almanac
   */
  constructor() {
    this.common = [];
    this.uncommon = [];
    this.rare = [];
    this.veryRare = [];
  }

  /**
   * Merge almanac with this.
   * @param {Almanac} almanac
   */
  mergeAlmanac(almanac) {
    this.common.push(...almanac.common);
    this.uncommon.push(...almanac.uncommon);
    this.rare.push(...almanac.rare);
    this.veryRare.push(...almanac.veryRare);
  }

  /** Find first element matching the callback. The search starts with common entries and moves on to
   * rare.
   * @param {function(element:AlmanacEntry, index:number, AlmanacEntry[]):truthy} callback
   * @returns {AlmanacEntry} undefined if not found.
   */
  find(callback) {
    let result = this.common.find(callback);
    if (result) {
      return result;
    }
    result = this.uncommon.find(callback);
    if (result) {
      return result;
    }
    result = this.rare.find(callback);
    if (result) {
      return result;
    }
    return this.veryRare.find(callback);
  }

  /** Create a new almanac filtering the values.
   * @param {function(element:AlmanacEntry, index:number, AlmanacEntry[]):truthy} filterFn
   * @returns {Almanac} undefined if not found.
   */
  filter(filterFn) {
    const almanac = new Almanac();
    almanac.common = filterFn ? this.common.filter(filterFn) : [...this.common];
    almanac.uncommon = filterFn
      ? this.uncommon.filter(filterFn)
      : [...this.uncommon];
    almanac.rare = filterFn ? this.rare.filter(filterFn) : [...this.rare];
    almanac.veryRare = filterFn
      ? this.veryRare.filter(filterFn)
      : [...this.veryRare];
    return almanac;
  }

  /**
   * Get a random entry from the almanac.
   * @returns {AlmanacEntry}
   */
  getRandomEntry() {
    const cutoff = Math.random();
    if (cutoff < Almanac.COMMON_CUTOFF) {
      return this.getRandomCommonEntry();
    } else if (cutoff < Almanac.UNCOMMON_CUTOFF) {
      return this.getRandomUncommonEntry();
    } else if (cutoff < Almanac.RARE_CUTOFF) {
      return this.getRandomRareEntry();
    } else {
      return this.getRandomVeryRareEntry();
    }
  }

  /**
   * Get a random entry from the almanac's common elements.
   * @returns {AlmanacEntry}
   */
  getRandomCommonEntry() {
    return maths.getRandomMember(this.common);
  }
  /**
   * Get a random entry from the almanac's uncommon elements. If there are no
   * uncommon entries, it falls back to common.
   * @returns {AlmanacEntry}
   */
  getRandomUncommonEntry() {
    if (this.uncommon.length === 0) {
      return this.getRandomCommonEntry();
    } else {
      return maths.getRandomMember(this.uncommon);
    }
  }

  /**
   * Get a random entry from the almanac's rare elements. If there are no
   * rare entries, it falls back to uncommon.
   * @returns {AlmanacEntry}
   */
  getRandomRareEntry() {
    if (this.rare.length === 0) {
      return this.getRandomUncommonEntry();
    } else {
      return maths.getRandomMember(this.rare);
    }
  }
  /**
   * Get a random entry from the almanac's very rare elements. If there are no
   * very rare entries, it falls back to rare.
   * @returns {AlmanacEntry}
   */
  getRandomVeryRareEntry() {
    if (this.veryRare.length === 0) {
      return this.getRandomRareEntry();
    } else {
      return maths.getRandomMember(this.veryRare);
    }
  }
}

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
   * Get Almanac
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
   * @param {function(entry:AlmanacEntry):boolean} filterFn
   * @returns {AlmanacEntry} null if none found.
   */
  getRandomEntry(keyOrKeys, filterFn) {
    let key;
    if (Array.isArray(keyOrKeys)) {
      key = maths.getRandomMember(keyOrKeys);
    } else {
      key = keyOrKeys;
    }
    let almanac = this.getAlmanac(key).filter(filterFn);
    if (almanac) {
      return almanac.getRandomEntry();
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

  /** Create a pool of almanacs as one new almanac.
   * Only entries who pass the filterFn test, if provided, are returned.
   * @param {string[]} keys - almanacs to search
   * @param {function(entry:AlmanacEntry):boolean} filterFn
   * @returns {Almanac}
   */
  getPooledAlmanac(almanacKeys, filterFn) {
    const pooledAlmanac = new Almanac();
    almanacKeys.forEach((key) => {
      const almanac = this.getAlmanac(key).filter(filterFn);
      pooledAlmanac.mergeAlmanac(almanac);
    });
    return pooledAlmanac;
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
      case 'OBJECTIVES':
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
 * @returns {AlmanacEntry}
 */
export function parseAlmanacLine(line, almanacKey) {
  const parts = line.match(
    /^ *(\d+) *, *(\w+ ?\w+) *, *(\w*) *, *([\w+]*) *(?:\[ *([\w, ]*?)])? *\*(.*)$/
  );
  if (!parts) {
    LOG.error(`Invalid almanac entry ${line}`);
    return null;
  }
  const entry = {};
  entry.minLevel = parseInt(parts[1]);
  entry.rarity = parts[2].toUpperCase();
  entry.typeId = parts[3];
  entry.type = ALMANAC_LIBRARY.getItemType(almanacKey, entry.typeId);
  entry.id = parts[4];
  const derivedParts = almanacUtils.derivePartsFromId(entry.id);
  entry.name = derivedParts.name;
  entry.imageName = derivedParts.imageName;
  entry.description = derivedParts.description;
  entry.equipmentIds = csvToArray(parts[5]);
  entry.traitsString = `_TYPE_ID:${entry.typeId},${parts[6]}`;
  entry.challengeRating = extractCrValue(entry.traitsString);
  return entry;
}

/**
 * Extract the CR rating as this is used as a filter.
 * @param {string} traits
 */
function extractCrValue(traits) {
  const match = traits?.match(/CR *[:=] *([\d.]+)/);
  return match ? maths.safeParseFloat(match[1], 0) : 0;
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
  const almanac = new Almanac();
  const lines = text.split(/[\r\n]+/);
  lines.forEach((line) => {
    line = line.trim();
    if (line !== '' && !line.startsWith('#')) {
      const entry = parseAlmanacLine(line, key);
      if (entry) {
        switch (entry.rarity) {
          case AlmanacRarity.VERY_RARE:
            almanac.veryRare.push(entry);
            break;
          case AlmanacRarity.RARE:
            almanac.rare.push(entry);
            break;
          case AlmanacRarity.UNCOMMON:
            almanac.uncommon.push(entry);
            break;
          case AlmanacRarity.COMMON:
          default:
            almanac.common.push(entry);
            break;
        }
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

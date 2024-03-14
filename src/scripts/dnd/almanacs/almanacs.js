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
import { strToActorType } from '../../utils/game/actors.js';
import { strToArtefactType } from '../../utils/game/artefacts.js';
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
/**
 * @type {{actors: Almanac, artefacts: Almanac}}
 */
export const AlmanacLibrary = {
  actors: {},
  artefacts: {},
};

/**
 * Parse almanac line almanac entry
 * @param {string} line
 * @param {string} type - 'ACTOR' or 'ARTEFACT'
 */
function parseAlmanacLine(line, type) {
  const parts = line.match(
    /^ *(\d+) *, *(\w*) *, *(\w*) *(?:\[ *([\w, ]*?)])? *\*(.*)$/
  );
  if (!parts) {
    LOG.error(`Invalid almanac entry ${line}`);
    return null;
  }
  const entry = {};
  entry.minLevel = parseInt(parts[1]);
  entry.type =
    type === 'ARTEFACTS'
      ? strToArtefactType(parts[2])
      : strToActorType(parts[2]);
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
 * @param {string} type - 'ACTOR' or 'ARTEFACT'
 * @returns {Almanac}
 */
function parseAlmanacText(text, type) {
  const almanac = [];
  const lines = text.split(/[\r\n]+/);
  lines.forEach((line) => {
    line = line.trim();
    if (line !== '' && !line.startsWith('#')) {
      const entry = parseAlmanacLine(line, type);
      if (entry) {
        almanac.push(entry);
      }
    }
  });
  return almanac;
}

/**
 * Create the actor almanac
 * @param {Object} urls
 * @param {URL} urls.actors - url for the actors almanac
 * @param {URL} urls.artefacts - url for the artefacts almanac
 * @returns {Promise} fulfils to undefined when complete
 */
export function loadAlmanacs(urls) {
  assetLoaders
    .loadTextFromUrl(urls.actors)
    .then((text) => {
      AlmanacLibrary.actors = parseAlmanacText(text, 'ACTORS');
    })
    .then(() => assetLoaders.loadTextFromUrl(urls.artefacts))
    .then((text) => {
      AlmanacLibrary.artefacts = parseAlmanacText(text, 'ARTEFACTS');
    });
}

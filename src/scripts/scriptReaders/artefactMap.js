/**
 * @file Map of artefacts
 *
 * @module scriptReaders/artefactMap
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
import { safeParseInt } from '../utils/maths.js';
/**
 * @typedef {Object} ArtefactMapCreator
 * @property {function():Actor} create
 */

import { Artefact, ArtefactType } from '../utils/game/artefacts.js';

/**
 * Create an artefact.
 * @param {string} imageName
 * @param {module:utils/game/artefacts~ArtefactTypeValue} artefactType
 * @param {module:dnd/traits~Traits} traits
 */
function createArtefact(imageName, artefactType, traits) {
  const artefact = new Artefact('', `${imageName}.png`, artefactType);
  artefact.value = safeParseInt(traits?.get('GP', 0));
  artefact.traits = traits;
  return artefact;
}

/**
 * Map of actor creators which are used to create actors based on a key.
 * @type {Map<string, ActorMapCreator>}
 */
const ARTEFACT_MAP = new Map([
  [
    'GOLD',
    { create: (traits) => createArtefact('gold', ArtefactType.GOLD, traits) },
  ],
  [
    'AXE',
    { create: (traits) => createArtefact('axe', ArtefactType.WEAPON, traits) },
  ],
  [
    'POLEAXE',
    {
      create: (traits) =>
        createArtefact('poleaxe', ArtefactType.TWO_HANDED_WEAPON, traits),
    },
  ],
  [
    'HELMET',
    {
      create: (traits) =>
        createArtefact('helmet', ArtefactType.HEAD_GEAR, traits),
    },
  ],
]);

export default ARTEFACT_MAP;

/**
 * @file Build artefact
 *
 * @module dnd/almanacs/artefactBuilder
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

import {
  Artefact,
  ArtefactType,
  artefactTypesEqual,
} from '../../players/artefacts.js';
import { CastSpell, ConsumeFood, TriggerTrap } from '../interact.js';
import { Traits, MagicTraits } from '../traits.js';
import LOG from '../../utils/logging.js';
import { ALMANAC_LIBRARY } from './almanacs.js';

/**
 * Create an artefact.
 * @param {module:dnd/almanacs/almanacActors~AlmanacEntry} almanacEntry
 * @param {Object} detail
 * @param {string} detail.imageName
 * @param {module:dnd/traits~Traits} detail.traits
 * @param {string} detail.description
 * @param {string} detail.unknownDescription
 *
 */
function createArtefact(almanacEntry, detail) {
  const artefact = new Artefact(
    almanacEntry,
    detail.description,
    `${detail.imageName}.png`,
    detail.unknownDescription
  );
  artefact.traits = detail.traits;
  return artefact;
}

/**
 * Create an artefact from an almanac entry.
 * @param {module:dnd/almanacs/almanacActors~AlmanacEntry} almanacEntry
 * @param {module:dnd/traits.Traits} [initialTraits] - initial traits
 * almanac entry. Normally only required if restoring an artefact from saved values.
 * @returns {module:players/artefacts.Artefact}
 */
export function buildArtefact(almanacEntry, initialTraits) {
  let traits;
  let imageName;
  if (artefactTypesEqual(almanacEntry.type, ArtefactType.SPELL)) {
    traits = initialTraits ?? new MagicTraits(almanacEntry.traitsString);
    imageName = 'spell';
  } else if (artefactTypesEqual(almanacEntry.type, ArtefactType.CANTRIP)) {
    traits = initialTraits ?? new MagicTraits(almanacEntry.traitsString);
    imageName = 'cantrip';
  } else {
    traits = initialTraits ?? new Traits(almanacEntry.traitsString);
    imageName = almanacEntry.imageName;
  }

  traits.set('NAME', almanacEntry.name);
  const artefact = createArtefact(almanacEntry, {
    description: almanacEntry.description,
    unknownDescription: almanacEntry.unknownDescription,
    imageName: imageName,
    traits: traits,
  });

  if (artefact.isTrap()) {
    artefact.interaction = new TriggerTrap(artefact);
  } else if (artefact.isMagic()) {
    artefact.interaction = new CastSpell(artefact);
  } else if (artefact.isConsumable()) {
    artefact.interaction = new ConsumeFood(artefact);
  }
  return artefact;
}

/**
 * Build an artefact from its id.
 * @param {string} id
 * @param {string[]} [keys = 'MONEY] - the almanacs to search.
 * @returns {module:players/artefacts.Artefact} null if not found
 */
export function buildArtefactFromId(id, keys = ['MONEY']) {
  const artefactEntry = ALMANAC_LIBRARY.findById(id, keys);
  if (!artefactEntry) {
    LOG.error(`Could not find artefact ${id} in ${keys} almanacs.`);
    return null;
  }
  return buildArtefact(artefactEntry);
}

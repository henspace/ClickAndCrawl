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

import { Artefact, ArtefactType } from '../../players/artefacts.js';
import { CastSpell, ConsumeFood } from '../interact.js';
import { Traits, MagicTraits } from '../traits.js';

/**
 * Create an artefact.
 * @param {string} id
 * @param {string} imageName
 * @param {module:players/artefacts~ArtefactTypeValue} artefactType
 * @param {module:dnd/traits~Traits} traits
 */
function createArtefact(id, imageName, artefactType, traits) {
  const artefact = new Artefact(id, '', `${imageName}.png`, artefactType);
  artefact.traits = traits;
  return artefact;
}

/**
 * Create an artefact from an almanac entry.
 * @param {module:dnd/almanacs/almanacActors~AlmanacEntry} almanacEntry
 * @returns {Artefact}
 */
export function buildArtefact(almanacEntry) {
  let traits;
  let imageName;
  if (almanacEntry.type === ArtefactType.SPELL) {
    traits = new MagicTraits(almanacEntry.traitsString);
    imageName = 'spell';
  } else if (almanacEntry.type === ArtefactType.CANTRIP) {
    traits = new MagicTraits(almanacEntry.traitsString);
    imageName = 'cantrip';
  } else {
    traits = new Traits(almanacEntry.traitsString);
    imageName = almanacEntry.imageName;
  }

  traits.set('NAME', almanacEntry.name);
  const artefact = createArtefact(
    almanacEntry.id,
    imageName,
    almanacEntry.type,
    traits
  );
  artefact.description = almanacEntry.description;
  if (artefact.isMagic()) {
    artefact.interaction = new CastSpell(artefact);
  } else if (artefact.isConsumable()) {
    artefact.interaction = new ConsumeFood(artefact);
  }
  return artefact;
}

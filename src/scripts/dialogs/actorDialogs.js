/**
 * @file Dialogs to show details of actors.
 *
 * @module dialogs/actorDialogs
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
import UI from '../utils/dom/ui.js';
import * as components from '../utils/dom/components.js';

/**
 * Display details about the actor.
 * @param {module:utils/game/actors~Actor} actor
 */
export function showActorDetailsDialog(actor) {
  return UI.showElementOkDialog(createActorElement(actor));
}

/**
 * Display details about the actor.
 * @param {module:utils/game/actors~Actor} actor
 */
export function showArtefactFoundBy(artefact, actor) {
  const sideBySide = document.createElement('div');
  sideBySide.className = 'side-by-side';
  sideBySide.appendChild(createActorElement(actor));
  sideBySide.appendChild(createActorElement(artefact));
  return UI.showElementOkDialog(sideBySide);
}

/**
 * Create an element describing an actor.
 * @param {module:utils/game/actors~Actor} actor
 * @returns {Element}
 */
function createActorElement(actor) {
  const container = document.createElement('div');
  container.appendChild(components.createBitmapElement(actor.iconImageName));
  container.appendChild(
    components.createElement('span', { text: actor.traits.get('NAME') })
  );
  if (actor.description) {
    const desc = document.createElement('p');
    desc.innerText = actor.description;
    container.appendChild(desc);
  }
  container.appendChild(createTraitsList(actor, ['NAME']));
  return container;
}
/**
 * Create an element showing an actors traits.
 * @param {module:utils/game/actors~Actor} actor
 * @param {string[]} excludedKeys
 * @returns {Element}
 */
function createTraitsList(actor, excludedKeys) {
  const traitsList = document.createElement('ul');
  actor.traits.getAllTraits().forEach((value, key) => {
    if (!excludedKeys.includes(key)) {
      const displayedKey = key?.replace('_', ' ');
      const item = document.createElement('li');
      const label = components.createElement('span', {
        text: `${displayedKey}: `,
      });
      const content = components.createElement('span', { text: value });
      traitsList.appendChild(item);
      item.appendChild(label);
      item.appendChild(content);
    }
  });
  return traitsList;
}

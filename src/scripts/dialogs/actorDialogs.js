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

import { i18n } from '../utils/messageManager.js';
import { StoreType } from '../utils/game/artefacts.js';

/**
 * Display details about the actor.
 * @param {module:utils/game/actors~Actor} actor
 */
export function showActorDetailsDialog(actor) {
  const container = document.createElement('div');
  container.appendChild(createActorElement(actor, { hideTraits: true }));
  let button = new components.TextButtonControl({
    label: i18n`BUTTON INVENTORY`,
    action: () => showInventory(actor),
  });
  container.appendChild(button.element);
  button = new components.TextButtonControl({
    label: i18n`BUTTON TRAITS`,
    action: () => showTraits(actor),
  });
  container.appendChild(button.element);
  return UI.showControlsDialog(container);
}

/**
 * Show actor's inventory.
 * @param {Actor} actor
 */
export function showInventory(actor) {
  const container = document.createElement('div');
  container.appendChild(
    createActorElement(actor, { hideDescription: true, hideTraits: true })
  );
  const storesToShow = [
    [i18n`Head`, StoreType.HEAD],
    [i18n`Body`, StoreType.BODY],
    [i18n`Hands`, StoreType.HANDS],
    [i18n`Feet`, StoreType.FEET],
    [i18n`Backpack`, StoreType.BACKPACK],
  ];
  storesToShow.forEach((storeInfo) => {
    const contents = actor.storeManager.getStoreContents(storeInfo[1]);
    if (contents && contents.length > 0) {
      container.appendChild(createStoreContents(storeInfo[0], contents));
    }
  });
  return UI.showControlsDialog(container);
}

/**
 * Show the actor's traits.
 * @param {Actor} actor
 * @returns {Promise}
 */
export function showTraits(actor) {
  const container = document.createElement('div');
  container.appendChild(createActorElement(actor, { hideDescription: true }));
  return UI.showControlsDialog(container);
}

/**
 * Create element showing store contents.
 * @param {string} label
 * @param {Artefact[]} contents
 * @returns {Element}
 */
function createStoreContents(label, contents) {
  const container = components.createElement('div', {
    className: 'store',
    text: label,
  });
  const contentsElement = document.createElement('div');
  container.appendChild(contentsElement);
  contents.forEach((artefact) => {
    const button = new components.BitmapButtonControl({
      imageName: artefact.iconImageName,
      action: () => UI.showOkDialog('Todo'),
    });
    container.appendChild(button.element);
  });
  return container;
}

/**
 * Display details about an artefact found by the actor.
 * @param {module:utils/game/artefacts~Artefact} artefact
 * @param {module:utils/game/actors~Actor} actor
 * @param {boolean} allowTake - If true the caller can take the artefact.
 */
export function showArtefactFoundBy(artefact, actor, allowTake) {
  const sideBySide = document.createElement('div');
  sideBySide.className = 'side-by-side';
  sideBySide.appendChild(
    createActorElement(actor, { hideDescription: true, hideTraits: true })
  );
  sideBySide.appendChild(createActorElement(artefact));
  const actionButtons = [];

  actionButtons.push(
    new components.TextButtonControl({
      id: 'LEAVE',
      label: i18n`BUTTON LEAVE ARTEFACT`,
      closes: true,
    })
  );
  actionButtons.push(
    new components.TextButtonControl({
      id: 'TAKE',
      label: i18n`BUTTON TAKE ARTEFACT`,
      closes: true,
    })
  );
  return UI.showControlsDialog(sideBySide, {
    preamble: i18n`MESSAGE FOUND ARTEFACT`,
    actionButtons: actionButtons,
    row: true,
  });
}

/**
 * Create an element describing an actor.
 * @param {module:utils/game/actors~Actor} actor
 * @param {Object} options
 * @param {boolean} options.hideDescription
 * @param {boolean} options.hideTraits
 * @returns {Element}
 */
function createActorElement(actor, options = {}) {
  const container = document.createElement('div');
  container.appendChild(components.createBitmapElement(actor.iconImageName));
  container.appendChild(
    components.createElement('span', { text: actor.traits.get('NAME') })
  );
  if (!options.hideDescription && actor.description) {
    const desc = document.createElement('p');
    desc.innerText = actor.description;
    container.appendChild(desc);
  }
  if (!options.hideTraits) {
    container.appendChild(createTraitsList(actor, ['NAME'], true));
  }
  return container;
}

/**
 * Create an element showing an actor's traits. Gold coins contained in the actor's
 * purse are included as a trait if includeGold flag is set.
 * @param {module:utils/game/actors~Actor} actor
 * @param {string[]} excludedKeys - Keys to ignore. Elements ending with _MAX are
 * automatically hidden.
 * @param {boolean} includeGold - flag to determine if gold pieces are included.
 * @returns {Element}
 */
function createTraitsList(actor, excludedKeys, includeGold) {
  const traitsList = document.createElement('ul');
  if (includeGold) {
    const goldPieces = actor.storeManager?.getPurseValue();
    if (goldPieces) {
      traitsList.appendChild(
        components.createElement('li', {
          text: i18n`${goldPieces} GOLD PIECES`,
        })
      );
    }
  }

  actor.traits?.getAllTraits().forEach((value, key) => {
    if (!excludedKeys.includes(key) && !/.*_MAX/.test(key)) {
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

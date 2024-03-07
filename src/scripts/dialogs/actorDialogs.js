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
import UI, { DialogResponse } from '../utils/dom/ui.js';
import * as components from '../utils/dom/components.js';

import { i18n } from '../utils/messageManager.js';
import { ArtefactType, StoreType } from '../utils/game/artefacts.js';
import SCENE_MANAGER from '../utils/game/sceneManager.js';

/**
 * Container for an inventory.
 */
class InventoryContainerElement {
  /** @type {Actor} */
  #actor;

  /** @type {Element} */
  #content;

  /**
   * Construct
   * @param {Actor} actor;
   */
  constructor(actor) {
    this.#actor = actor;
    this.#content = components.createElement('div', { className: 'stores' });

    this.#refresh();
  }

  /**
   * Get the container element
   */
  get element() {
    return this.#content;
  }

  /**
   * Rebuild the list
   */
  #refresh() {
    this.#content.replaceChildren();
    const storesToShow = [
      { label: i18n`Purse`, storeType: StoreType.PURSE },
      { label: i18n`Head`, storeType: StoreType.HEAD },
      { label: i18n`Body`, storeType: StoreType.BODY },
      { label: i18n`Hands`, storeType: StoreType.HANDS },
      { label: i18n`Feet`, storeType: StoreType.FEET },
      { label: i18n`Backpack`, storeType: StoreType.BACKPACK },
    ];
    storesToShow.forEach((storeInfo) => {
      const contents = this.#actor.storeManager.getStoreContents(
        storeInfo.storeType
      );
      if (contents) {
        const storeElement = this.#createStoreContents(
          storeInfo.label,
          storeInfo.storeType,
          contents
        );
        this.#content.appendChild(storeElement);
      }
    });
  }

  /**
   * Create element showing store contents.
   * @param {string} label
   * @param {StoreTypeValue} storeType
   * @param {Artefact[]} contents
   * @returns {Element}
   */
  #createStoreContents(label, storeType, contents) {
    const container = components.createElement('div', {
      className: 'store',
    });
    container.appendChild(
      components.createElement('span', {
        className: 'store-label',
        text: label,
      })
    );
    const contentsElement = components.createElement('div', {
      className: 'store-contents',
    });
    container.appendChild(contentsElement);
    contents.forEach((artefact) => {
      const button = createArtefactButtonControl(artefact, {
        owner: this.#actor,
        storeType: storeType,
        refresh: this.#refresh.bind(this),
      });
      contentsElement.appendChild(button.element);
    });
    return container;
  }
}
/**
 * Display details about the actor.
 * @param {module:utils/game/actors~Actor} actor
 */
export function showActorDetailsDialog(actor) {
  const container = document.createElement('div');
  container.appendChild(
    components.createElement('span', {
      text: i18n`Dungeon level: ${SCENE_MANAGER.getCurrentSceneLevel()}`,
    })
  );
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
  const container = components.createElement('div', { className: 'inventory' });

  container.appendChild(
    createActorElement(actor, { hideDescription: true, hideTraits: true })
  );
  const inventoryContainer = new InventoryContainerElement(actor);
  container.appendChild(inventoryContainer.element);
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
 * Display details about an artefact found by the actor.
 * @param {module:utils/game/artefacts~Artefact} artefact
 * @param {module:utils/game/actors~Actor} actor
 * @param {Object} options
 * @param {boolean} options.cannotStore - If true the caller cannot take the artefact.
 * @param {string} options.guidance - extra help
 * @returns {Promise<string>} fulfils to TAKE or LEAVE
 */
export function showArtefactFoundBy(artefact, actor, options) {
  const container = document.createElement('div');
  const sideBySide = document.createElement('div');
  container.appendChild(sideBySide);
  sideBySide.className = 'side-by-side';
  sideBySide.appendChild(
    createActorElement(actor, { hideDescription: true, hideTraits: true })
  );
  sideBySide.appendChild(createActorElement(artefact));
  const actionButtons = [];

  actionButtons.push(
    new components.TextButtonControl({
      label: i18n`BUTTON LEAVE ARTEFACT`,
      closes: 'LEAVE',
    })
  );
  if (options.cannotStore) {
    container.appendChild(
      components.createElement('p', { text: options.guidance })
    );
  } else {
    actionButtons.push(
      new components.TextButtonControl({
        label: i18n`BUTTON TAKE ARTEFACT`,
        closes: 'TAKE',
      })
    );
  }
  return UI.showControlsDialog(container, {
    preamble: i18n`MESSAGE FOUND ARTEFACT`,
    actionButtons: actionButtons,
    row: true,
  });
}

/**
 * Use artefact.
 * @param {Actor} actor - who will use the artefact.
 * @param {Artefact} artefact - the item to use.
 * @param {StoreTypeValue} storeType
 */
async function showArtefactDialog(actor, artefact, storeType) {
  switch (artefact.artefactType) {
    case ArtefactType.WEAPON:
    case ArtefactType.TWO_HANDED_WEAPON:
    case ArtefactType.HEAD_GEAR:
      return await showEquipDialog(actor, artefact, storeType);
    case ArtefactType.FOOD:
      return showFoodDialog(actor, artefact, storeType);
    case ArtefactType.SPELL:
      return showSpellDialog(actor, artefact, storeType);
  }
}

/**
 * Use weapon.
 * @param {Actor} actor - who will use the artefact.
 * @param {Artefact} artefact - the item to use.
 * @param {StoreTypeValue} storeType
 * @return {Promise} fulfils to undefined.
 */
async function showEquipDialog(actor, artefact, storeType) {
  const container = components.createElement('div', {
    className: 'use-weapon-dialog',
  });
  container.appendChild(createActorElement(artefact));

  const actionButtons = [];
  if (storeType === StoreType.BACKPACK) {
    const button = new components.TextButtonControl({
      label: i18n`BUTTON EQUIP`,
      closes: 'EQUIP',
    });
    container.appendChild(button.element);
    actionButtons.push(button);
  } else {
    const button = new components.TextButtonControl({
      label: i18n`BUTTON UNEQUIP`,
      closes: 'UNEQUIP',
    });
    container.appendChild(button.element);
    actionButtons.push(button);
  }
  let button = new components.TextButtonControl({
    label: i18n`BUTTON DISCARD`,
    closes: 'DISCARD',
  });
  container.appendChild(button.element);
  actionButtons.push(button);
  button = new components.TextButtonControl({
    label: i18n`BUTTON CANCEL`,
    closes: 'CANCEL',
  });
  container.appendChild(button.element);
  actionButtons.push(button);

  await UI.showControlsDialog(container, {
    actionButtons: actionButtons,
    row: true,
  }).then((response) => {
    switch (response) {
      case 'DISCARD':
        if (storeType === StoreType.BACKPACK) {
          actor.storeManager.discardStashed(artefact);
        } else {
          actor.storeManager.discardEquipped(artefact);
        }
        break;
      case 'EQUIP':
        actor.storeManager.equip(artefact);
        break;
      case 'UNEQUIP':
        actor.storeManager.unequip(artefact);
        break;
    }
    return;
  });
}

/**
 * Use food.
 * @param {Actor} actor - who will use the artefact.
 * @param {Artefact} artefact - the item to use.
 * @param {StoreTypeValue} storeType
 * @return {Promise} fulfils to undefined.
 */
function showFoodDialog(actorUnused, artefactUnused, storeTypeUnused) {
  return UI.showOkDialog('Use food dialog ToDo');
}

/**
 * Use spell.
 * @param {Actor} actor - who will use the artefact.
 * @param {Artefact} artefact - the item to use.
 * @param {StoreTypeValue} storeType
 * @return {Promise} fulfils to undefined.
 */
function showSpellDialog(actorUnused, artefactUnused, storeTypeUnused) {
  return UI.showOkDialog('Use spell dialog ToDo');
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
  const container = components.createElement('div', {
    className: 'actor-detail',
  });
  const idCard = components.createElement('div', {
    className: 'actor-id-card',
  });
  container.appendChild(idCard);
  idCard.appendChild(components.createBitmapElement(actor.iconImageName));
  idCard.appendChild(
    components.createElement('span', {
      text: actor.traits?.get('NAME') ?? i18n`Unknown`,
    })
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

/**
 * @param {Artefact} artefact
 * @param {Object} options
 * @param {Actor} options.owner
 * @param {StoreType} options.storeType
 * @param {function():Promise} refresh - function to call if storage changed.
 * @returns {components.BitmapButtonControl}
 */
function createArtefactButtonControl(artefact, options) {
  return new components.BitmapButtonControl({
    rightLabel: artefact.traits.get('NAME'),
    imageName: artefact.iconImageName,
    action: async () => {
      await showArtefactDialog(options.owner, artefact, options.storeType).then(
        (response) => {
          if (response === DialogResponse.OK) {
            return;
          } else {
            options.refresh?.();
            return;
          }
        }
      );
    },
  });
}

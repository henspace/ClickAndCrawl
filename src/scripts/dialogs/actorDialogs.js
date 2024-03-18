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
import { ArtefactType, StoreType } from '../players/artefacts.js';
import SCENE_MANAGER from '../gameManagement/sceneManager.js';
import { gpAsString } from '../utils/game/coins.js';
/**
 * @typedef {number} ArtefactActionTypeValue
 */
/**
 * @enum {ArtefactActionTypeValue}
 */
export const ArtefactActionType = {
  VIEW: 0,
  SELL: 1,
  PILLAGE: 2,
  FIND: 3,
};

/**
 * ArtefactActions
 * @enum {string}
 */
const ArtefactAction = {
  CANCEL: 'cancel',
  LEAVE: 'leave',
  DISCARD: 'discard',
  EQUIP: 'equip',
  STASH: 'stash',
  TAKE: 'take',
  SELL: 'sell',
  PILLAGE: 'pillage',
};

/**
 * @typedef {Object} ArtefactDialogOptions
 * @property {Actor} currentOwner - who currently owns the artefact.
 * @property {Actor} prospectiveOwner - who currently owns the artefact.
 * @property {Artefact} artefact - the item .
 * @property {StoreType} storeType
 * @property {ArtefactActionTypeValue} actionType
 * @param {function(noChain:boolean):Promise} refresh - function to call if storage changed.
 * if noChain is set, linkedInventories are not called. This is used to prevent
 * circular loops.
 * @param {boolean} showPrice
 */

/**
 * @typedef {Object} InventoryOptions
 * @property {boolean} justStash - only show stash items.
 * @property {InventoryOptions} linkedInventory - this will be refreshed at the same
 * time as the inventory.
 */
/**
 * Container for an inventory.
 */
class InventoryContainerElement {
  /** @type {ArtefactDialogOptions} */
  #options;
  /** @type {InventoryOptions} */
  #inventoryOptions;
  /** @type {Element} */
  #content;
  /** This will be refresh when this is refreshed. @type {InventoryContainerElement} */
  linkedInventory;

  /**
   * Construct
   * @param {ArtefactDialogOptions} options;
   * @param {InventoryOptions} inventoryOptions
   */
  constructor(options, inventoryOptions = {}) {
    this.#options = options;
    this.#inventoryOptions = inventoryOptions;
    this.#content = components.createElement('div', { className: 'stores' });

    this.refresh();
  }

  /**
   * Get the container element
   */
  get element() {
    return this.#content;
  }

  /**
   * Rebuild the list.
   * @param {boolean} noChain - prevent calls to linkedInventories.
   */
  refresh(noChain) {
    if (!noChain && this.linkedInventory) {
      this.linkedInventory.refresh(true); // suppress linking
    }
    this.#content.replaceChildren();
    let storesToShow = [];
    if (this.#inventoryOptions.justStash) {
      storesToShow = [];
    } else {
      storesToShow = [
        { label: i18n`Purse`, storeType: StoreType.PURSE },
        { label: i18n`Head`, storeType: StoreType.HEAD },
        { label: i18n`Body`, storeType: StoreType.BODY },
        { label: i18n`Hands`, storeType: StoreType.HANDS },
        { label: i18n`Feet`, storeType: StoreType.FEET },
      ];
    }
    if (this.#options.currentOwner.isTrader()) {
      storesToShow.push({ label: i18n`Wagon`, storeType: StoreType.WAGON });
    } else {
      storesToShow.push({
        label: i18n`Backpack`,
        storeType: StoreType.BACKPACK,
      });
    }
    storesToShow.forEach((storeInfo) => {
      const contents = this.#options.currentOwner.storeManager.getStoreContents(
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
      const options = { ...this.#options };
      options.refresh = this.refresh.bind(this);
      options.storeType = storeType;
      options.artefact = artefact;
      const button = createArtefactButtonControl(options);
      contentsElement.appendChild(button.element);
    });
    return container;
  }
}

/**
 * Show the actor's traits.
 * @param {Actor} actor
 * @returns {Promise}
 */
function showTraits(actor) {
  const container = document.createElement('div');
  container.appendChild(createActorElement(actor, { hideDescription: true }));
  return UI.showControlsDialog(container);
}

/**
 * Show actor's inventory.
 * @param {Actor} actor
 */
function showInventory(actor) {
  const container = components.createElement('div', { className: 'inventory' });

  container.appendChild(
    createActorElement(actor, { hideDescription: true, hideTraits: true })
  );
  const inventoryContainer = new InventoryContainerElement({
    currentOwner: actor,
    prospectiveOwner: actor,
  });
  container.appendChild(inventoryContainer.element);
  return UI.showControlsDialog(container);
}

/**
 * Create buttons for dialog. The buttons are added to the container.
 * @param {Element} container - container for the action buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement}
 */
function createArtefactDialogButtons(container, options) {
  const selfAction =
    options.currentOwner === options.prospectiveOwner ||
    !options.prospectiveOwner;
  if (selfAction) {
    return createSelfActionArtefactDialogButtons(container, options);
  }
  switch (options.actionType) {
    case ArtefactActionType.FIND:
      return createFindArtefactDialogButtons(container, options);
    case ArtefactActionType.SELL:
      return createSellArtefactDialogButtons(container, options);
    case ArtefactActionType.PILLAGE:
      return createPillageArtefactDialogButtons(container, options);
    case ArtefactActionType.VIEW:
    default:
      return [];
  }
}
/**
 * Create buttons for dialog. The buttons are added to the container.
 * @param {Element} container - container for the action buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement}
 */
function createFindArtefactDialogButtons(container, options) {
  const actionButtons = [];
  const possibleStore = options.prospectiveOwner.storeManager.findSuitableStore(
    options.artefact
  );
  let button;

  if (possibleStore) {
    button = new components.TextButtonControl({
      label: i18n`BUTTON TAKE ARTEFACT`,
      closes: ArtefactAction.TAKE,
    });
    container.appendChild(button.element);
    actionButtons.push(button);
  } else {
    container.appendChild(createFailedStorageGuidance(options));
  }

  button = new components.TextButtonControl({
    label: i18n`BUTTON LEAVE ARTEFACT`,
    closes: ArtefactAction.LEAVE,
  });
  container.appendChild(button.element);
  actionButtons.push(button);

  return actionButtons;
}
/**
 * Create buttons for dialog. The buttons are added to the container.
 * @param {Element} container - container for the action buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement}
 */
function createSelfActionArtefactDialogButtons(container, options) {
  if (options.artefact.artefactType === ArtefactType.COINS) {
    return;
  }
  const actionButtons = [];

  let button;

  if (options.storeType === StoreType.BACKPACK) {
    button = new components.TextButtonControl({
      label: i18n`BUTTON EQUIP`,
      closes: ArtefactAction.EQUIP,
    });
  } else if (
    !options.artefact.stashInWagon ||
    options.currentOwner.storeManager.hasWagon
  ) {
    button = new components.TextButtonControl({
      label: i18n`BUTTON STASH`,
      closes: ArtefactAction.STASH,
    });
  }
  if (button) {
    container.appendChild(button.element);
    actionButtons.push(button);
  }

  button = new components.TextButtonControl({
    label: i18n`BUTTON DISCARD`,
    closes: ArtefactAction.DISCARD,
  });
  container.appendChild(button.element);
  actionButtons.push(button);
  button = new components.TextButtonControl({
    label: i18n`BUTTON CANCEL`,
    closes: ArtefactAction.CANCEL,
  });
  container.appendChild(button.element);
  actionButtons.push(button);
  return actionButtons;
}

/**
 * Create buttons for dialog. The buttons are added to the container.
 * @param {Element} container - container for the action buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement}
 */
function createSellArtefactDialogButtons(container, options) {
  if (options.artefact.artefactType === ArtefactType.COINS) {
    return;
  }
  const actionButtons = [];
  const artefactCostInGp = options.artefact.costInGp;
  let buyersFundsInGp;
  if (options.prospectiveOwner.isTrader()) {
    buyersFundsInGp = Number.MAX_SAFE_INTEGER; // traders have unlimited funds.
  } else {
    buyersFundsInGp = options.prospectiveOwner.storeManager.getPurseValue();
  }

  // button labels shows action relative to the hero.
  // i.e. although the action may be the trader selling
  // an item, to the player this is viewed as buying.
  let button;

  const prospectiveStore =
    options.prospectiveOwner.storeManager.findSuitableStore(options.artefact);
  if (!prospectiveStore) {
    container.appendChild(createFailedStorageGuidance(options));
    if (!options.currentOwner.isTrader()) {
      createSelfActionArtefactDialogButtons(container, options);
    }
    return;
  }
  if (buyersFundsInGp < options.artefact.costInGp) {
    container.appendChild(
      createNoFundsGuidance(buyersFundsInGp, artefactCostInGp)
    );
    if (!options.currentOwner.isTrader()) {
      createSelfActionArtefactDialogButtons(container, options);
    }
    return;
  }
  button = new components.TextButtonControl({
    label: options.currentOwner.isTrader()
      ? i18n`BUTTON BUY`
      : i18n`BUTTON SELL`,
    closes: ArtefactAction.SELL,
  });

  container.appendChild(button.element);
  actionButtons.push(button);

  container.appendChild(button.element);
  actionButtons.push(button);
  button = new components.TextButtonControl({
    label: i18n`BUTTON CANCEL`,
    closes: ArtefactAction.CANCEL,
  });
  container.appendChild(button.element);
  actionButtons.push(button);
  return actionButtons;
}

/**
 * Create buttons for dialog. The buttons are added to the container.
 * @param {Element} container - container for the action buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement}
 */
function createPillageArtefactDialogButtons(container, options) {
  if (options.currentOwner.alive) {
    return createSelfActionArtefactDialogButtons(container, options);
  }
  const actionButtons = [];

  const prospectiveStore =
    options.prospectiveOwner.storeManager.findSuitableStore(options.artefact);
  if (!prospectiveStore) {
    container.appendChild(createFailedStorageGuidance(options));
    if (options.currentOwner.alive) {
      createSelfActionArtefactDialogButtons(container, options);
    }
    return;
  }

  let button = new components.TextButtonControl({
    label: i18n`BUTTON PILLAGE`,
    closes: ArtefactAction.PILLAGE,
  });

  container.appendChild(button.element);
  actionButtons.push(button);

  container.appendChild(button.element);
  actionButtons.push(button);
  button = new components.TextButtonControl({
    label: i18n`BUTTON LEAVE ARTEFACT`,
    closes: ArtefactAction.CANCEL,
  });
  container.appendChild(button.element);
  actionButtons.push(button);
  return actionButtons;
}

/**
 * Create an element advising that insufficient funds are available.
 * @param {number} availableGp
 * @param {number} requiredGp
 * @returns {Element}
 */
function createNoFundsGuidance(availableGp, requiredGp) {
  let text;
  text = i18n`MESSAGE INSUFFICIENT FUNDS ${requiredGp} ${availableGp}`;

  return components.createElement('p', { className: 'guidance', text: text });
}
/**
 * Create an element that provides guidance about why something cannot be stored.
 * @param {ArtefactDialogOptions} options
 * @returns {Element}
 */
function createFailedStorageGuidance(options) {
  let text;
  if (options.artefact.stashInWagon) {
    text = i18n`MESSAGE MAKE SPACE IN EQUIP`;
  } else {
    text = i18n`MESSAGE MAKE SPACE IN BACKPACK`;
  }
  return components.createElement('p', { className: 'guidance', text: text });
}

/**
 * Show equipment dialog.
 * @param {ArtefactDialogOptions} options
 * @return {Promise} fulfils to response from the dialog.
 */
function showEquipDialog(options) {
  const artefact = options.artefact;
  const container = components.createElement('div', {
    className: 'use-weapon-dialog',
  });
  container.appendChild(createActorElement(artefact));

  const actionButtons = createArtefactDialogButtons(container, options);

  return UI.showControlsDialog(container, {
    preamble: options.preamble,
    actionButtons: actionButtons,
    row: true,
  });
}

/**
 * Use food.
 * @param {ArtefactDialogOptions} options
 * @return {Promise} fulfils to undefined.
 */
function showFoodDialog(optionsUnused) {
  return UI.showOkDialog('Use food dialog ToDo');
}

/**
 * Use spell.
 * @param {ArtefactDialogOptions} options
 * @return {Promise} fulfils to undefined.
 */
function showSpellDialog(optionsUnused) {
  return UI.showOkDialog('Use spell dialog ToDo');
}

/**
 * Create an id card element for an actor.
 * @param {module:players/actors~Actor|module:game/artefact~Artefacts} actor
 * @returns {Element}
 */
function createIdCard(actor) {
  const idCard = components.createElement('div', {
    className: 'actor-id-card',
  });
  idCard.appendChild(components.createBitmapElement(actor.iconImageName));
  idCard.appendChild(
    components.createElement('span', {
      text: actor.traits?.get('NAME') ?? i18n`Unknown`,
    })
  );

  const hp = actor.traits.getInt('HP');
  if (hp) {
    const hpMax = actor.traits.getInt('HP_MAX');
    let hpText;
    if (hpMax) {
      hpText = i18n`(HP OUT OF VALUE) ${hp} ${hpMax}`;
    } else {
      hpText = i18n`(HP VALUE) ${hp}`;
    }
    idCard.appendChild(
      components.createElement('span', {
        text: hpText,
      })
    );
  }
  if (actor.traits.getCharacterLevel) {
    idCard.appendChild(
      components.createElement('span', {
        text: i18n`CHARACTER LEVEL: ${actor.traits.getCharacterLevel()}`,
      })
    );
  }

  return idCard;
}
/**
 * Create an element describing an actor.
 * @param {module:players/actors~Actor} actor
 * @param {Object} options
 * @param {boolean} options.hideDescription
 * @param {boolean} options.hideTraits
 * @returns {Element}
 */
function createActorElement(actor, options = {}) {
  const container = components.createElement('div', {
    className: 'actor-detail',
  });
  const idCard = createIdCard(actor);
  container.appendChild(idCard);

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
 * @param {module:players/actors~Actor|module:players/artefacts~Artefact} actor
 * @param {string[]} excludedKeys - Keys to ignore. Elements starting with an
 * underscore are automatically hidden.
 * @param {boolean} includeGold - flag to determine if gold pieces are included.
 * @returns {Element}
 */
function createTraitsList(actor, excludedKeys, includeGold) {
  const traitsList = document.createElement('ul');
  if (actor.traits.getEffectiveAc) {
    traitsList.appendChild(
      components.createElement('li', {
        text: i18n`AC (including armour)${actor.traits.getEffectiveAc()}`,
      })
    );
  }

  if (includeGold) {
    const goldPieces = actor.storeManager?.getPurseValue();
    if (goldPieces) {
      traitsList.appendChild(
        components.createElement('li', {
          text: gpAsString(goldPieces),
        })
      );
    }
  }

  actor.traits?.getAllTraits().forEach((value, key) => {
    if (value && value !== '0') {
      const displayedValue = Array.isArray(value) ? value.join(', ') : value;
      if (!excludedKeys.includes(key) && !key.startsWith('_')) {
        const displayedKey = key?.replace('_', ' ');
        const item = document.createElement('li');
        const label = components.createElement('span', {
          text: `${displayedKey}: `,
        });
        const content = components.createElement('span', {
          text: displayedValue,
        });
        traitsList.appendChild(item);
        item.appendChild(label);
        item.appendChild(content);
      }
    }
  });
  return traitsList;
}

/**
 * @param {ArtefactDialogOptions} options
 * @returns {components.BitmapButtonControl}
 */
function createArtefactButtonControl(options) {
  let label = options.artefact.traits.get('NAME');
  if (
    options.showPrice ||
    options.artefact.artefactType === ArtefactType.COINS
  ) {
    const price = options.currentOwner.isTrader()
      ? options.artefact.costInGp
      : options.artefact.sellBackPriceInGp;
    label = `${label} ${price} GP`;
  }
  return new components.BitmapButtonControl({
    rightLabel: label,
    imageName: options.artefact.iconImageName,
    action: async () => {
      await showArtefactDialog(options).then((response) => {
        if (response === DialogResponse.OK) {
          return;
        } else {
          options.refresh?.();
          return;
        }
      });
    },
  });
}

/**
 * Show a dialog where one actor can take artefacts from another.
 * @param {Actor} buyer
 * @param {Actor} seller
 * @param {boolean} pillage
 * @returns {Promise} fulfils to undefined on completion.
 */
export function showTradeOrPillageDialog(buyer, seller, pillage) {
  const container = components.createElement('div', {
    className: 'trade',
  });
  const sideBySide = components.createElement('div', {
    className: 'side-by-side',
  });
  container.appendChild(sideBySide);
  const buyerSide = components.createElement('div', {});
  const sellerSide = components.createElement('div', {});
  sideBySide.appendChild(buyerSide);
  sideBySide.appendChild(sellerSide);
  buyerSide.appendChild(createIdCard(buyer));
  sellerSide.appendChild(createIdCard(seller));

  const actionType = pillage
    ? ArtefactActionType.PILLAGE
    : ArtefactActionType.SELL;
  const buyerInventory = new InventoryContainerElement({
    currentOwner: buyer,
    prospectiveOwner: seller,
    actionType: actionType,
    showPrice: true,
  });
  const sellerInventory = new InventoryContainerElement(
    {
      currentOwner: seller,
      prospectiveOwner: buyer,
      actionType: actionType,
      showPrice: true,
    },
    { justStash: !pillage }
  );
  buyerInventory.linkedInventory = sellerInventory;
  sellerInventory.linkedInventory = buyerInventory;

  buyerSide.appendChild(buyerInventory.element);
  sellerSide.appendChild(sellerInventory.element);
  return UI.showControlsDialog(container, {
    preamble: pillage ? i18n`DIALOG TITLE PILLAGE` : i18n`DIALOG TITLE TRADE`,
  });
}

/**
 * Show a dialog where one actor can take artefacts from another.
 * @param {Actor} buyer
 * @param {Actor} seller
 * @returns {Promise} fulfils to undefined on completion.
 */
export function showTradeDialog(buyer, seller) {
  return showTradeOrPillageDialog(buyer, seller, false);
}

/**
 * Show a dialog where one actor can take artefacts from another.
 * @param {Actor} pillager
 * @param {Actor} victim
 * @returns {Promise} fulfils to undefined on completion.
 */
export function showPillageDialog(pillager, victim) {
  return showTradeOrPillageDialog(pillager, victim, true);
}

// Export dialogs
/**
 * Display details about the actor.
 * @param {module:players/actors~Actor} actor
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
 * Show artefact dialog.
 * @param {ArtefactDialogOptions} options
 * @return {Promise} fulfils to undefined on completion.
 */
export function showArtefactDialog(options) {
  if (!options.prospectiveOwner) {
    options.prospectiveOwner = options.currentOwner; // self action
  }
  const sourceStoreManager = options.currentOwner.storeManager;
  const destStoreManager = options.prospectiveOwner.storeManager;
  const artefact = options.artefact;

  let dialogFn;
  switch (options.artefact.artefactType) {
    case ArtefactType.WEAPON:
    case ArtefactType.TWO_HANDED_WEAPON:
    case ArtefactType.HEAD_GEAR:
    case ArtefactType.ARMOUR:
    case ArtefactType.SHIELD:
    case ArtefactType.COINS:
      dialogFn = showEquipDialog;
      break;
    case ArtefactType.FOOD:
      dialogFn = showFoodDialog;
      break;
    case ArtefactType.SPELL:
      dialogFn = showSpellDialog;
      break;
  }
  return dialogFn(options).then((response) => {
    switch (response) {
      case ArtefactAction.DISCARD:
        sourceStoreManager.discard(artefact);
        break;
      case ArtefactAction.EQUIP:
        destStoreManager.equip(artefact);
        break;
      case ArtefactAction.PILLAGE:
        {
          sourceStoreManager.discard(artefact);
          const store = destStoreManager.findSuitableStore(artefact);
          store.add(artefact);
        }
        break;
      case ArtefactAction.SELL:
        {
          const money = options.currentOwner.isTrader()
            ? artefact.costInGp
            : artefact.sellBackPriceInGp;
          sourceStoreManager.addToPurse(money);
          if (!options.prospectiveOwner.isTrader()) {
            destStoreManager.takeFromPurse(money); // traders have unlimited funds
          }
          sourceStoreManager.discard(artefact);
          if (artefact.stashInWagon && !destStoreManager.hasWagon) {
            destStoreManager.equip(artefact, { direct: true });
          } else {
            destStoreManager.stash(artefact, { direct: true });
          }
        }
        break;
      case ArtefactAction.STASH:
        destStoreManager.stash(artefact);
        break;
      case ArtefactAction.TAKE:
        sourceStoreManager.discard(artefact);
        if (artefact.stashInWagon && !destStoreManager.hasWagon) {
          destStoreManager.equip(artefact, { direct: true });
        } else {
          destStoreManager.stash(artefact, { direct: true });
        }
        break;
    }
    return;
  });
}

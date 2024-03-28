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
import * as dndAction from '../dnd/dndAction.js';
import LOG from '../utils/logging.js';
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
  LEARN_SPELL: 'learn',
  DISCARD: 'discard',
  EQUIP: 'equip',
  PREPARE_SPELL: 'prepare',
  STASH: 'stash',
  TAKE: 'take',
  SELL: 'sell',
  PILLAGE: 'pillage',
  USE: 'use',
};

/**
 * @typedef {Object} ArtefactDialogOptions
 * @property {Actor} currentOwner - who currently owns the artefact.
 * @property {Actor} prospectiveOwner - who currently owns the artefact.
 * @property {boolean} allowMagicUse - allow an item to be used.
 * @property {boolean} allowConsumption - allow an item to be consumed.
 * @property {boolean} allowSpellPrep - allow a spell to be prepared.
 * @property {Artefact} artefact - the item .
 * @property {StoreType} storeType
 * @property {ArtefactActionTypeValue} actionType
 * @param {function(noChain:boolean):Promise} refresh - function to call if storage changed.
 * if noChain is set, linkedInventories are not called. This is used to prevent
 * circular loops.
 * @param {boolean} showPrice
 * @param {boolean} showDamage - add damage detail to button labels.
 * @param {function(actor: Actor, artefact: Artefact):Promise} customAction - custom action on artefact click.
 */

/**
 * @typedef {string} InventoryLimitationValue
 */

/**
 * @enum {InventoryLimitationValue}
 */
const InventoryLimitation = {
  STANDARD: 'standard', // stash and equipment
  STASH_ONLY: 'stash', // just the stash
  SPELLS: 'spells', // all spells.
  MAGIC: 'magic', // all magic. Cantrips and spells, prepared or not.
  READY_MAGIC: 'ready magic',
  CANTRIPS: 'cantrips',
};
/**
 * @typedef {Object} InventoryOptions
 * @property {InventoryLimitationValue} limitation
 * @property {InventoryOptions} linkedInventory - this will be refreshed at the same
 * time as the inventory. */
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
  /** Action buttons @type {BaseControl[]} */
  #actionButtons;

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
   * @returns {Element}
   */
  get element() {
    return this.#content;
  }

  /**
   * Get the container action buttons.
   * @returns {BaseControl[]}
   */
  get actionButtons() {
    return this.#actionButtons;
  }

  /**
   * Rebuild the list.
   * @param {boolean} noChain - prevent calls to linkedInventories.
   */
  refresh(noChain) {
    this.#actionButtons = [];
    if (!noChain && this.linkedInventory) {
      this.linkedInventory.refresh(true); // suppress linking
    }
    this.#content.replaceChildren();
    let storesToShow = this.#getStoresToShow();

    storesToShow.forEach((storeInfo) => {
      const contents = this.#options.currentOwner.storeManager.getStoreContents(
        storeInfo.storeType
      );
      if (contents) {
        const storeContents = this.#createStoreContents(
          storeInfo.label,
          storeInfo.storeType,
          contents
        );
        this.#actionButtons = storeContents.actionButtons;
        this.#content.appendChild(storeContents.element);
      }
    });
  }

  /**
   * Get array of stores to show.
   * @return {{label: string, storeType: StoreType}}
   */
  #getStoresToShow() {
    let storesToShow;
    switch (this.#inventoryOptions.limitation) {
      case InventoryLimitation.SPELLS:
        storesToShow = [
          {
            label: i18n`Prepared spells`,
            storeType: StoreType.PREPARED_SPELLS,
          },
          { label: i18n`Known spells`, storeType: StoreType.SPELLS },
        ];
        break;
      case InventoryLimitation.MAGIC:
        storesToShow = [
          { label: i18n`Cantrips`, storeType: StoreType.CANTRIPS },
          {
            label: i18n`Prepared spells`,
            storeType: StoreType.PREPARED_SPELLS,
          },
          { label: i18n`Known spells`, storeType: StoreType.SPELLS },
        ];
        break;
      case InventoryLimitation.READY_MAGIC:
        storesToShow = [
          { label: i18n`Ready magic`, storeType: StoreType.PREPARED_SPELLS },
          { label: i18n`Cantrips`, storeType: StoreType.CANTRIPS },
        ];
        break;
      case InventoryLimitation.CANTRIPS:
        [{ label: i18n`Cantrips`, storeType: StoreType.CANTRIPS }];
        break;
      case InventoryLimitation.STASH_ONLY:
        storesToShow = [this.#getStashStoreInfo()];
        break;
      case InventoryLimitation.STANDARD:
      default:
        storesToShow = [
          { label: i18n`Purse`, storeType: StoreType.PURSE },
          { label: i18n`Head`, storeType: StoreType.HEAD },
          { label: i18n`Body`, storeType: StoreType.BODY },
          { label: i18n`Hands`, storeType: StoreType.HANDS },
          { label: i18n`Feet`, storeType: StoreType.FEET },
          this.#getStashStoreInfo(),
        ];
        break;
    }
    return storesToShow;
  }

  /** Get the stash store for the actor.
   * This gets the WAGON for a trader
   * @returns {label: string, storeType: StoreType}
   */
  #getStashStoreInfo() {
    if (this.#options.currentOwner.isTrader()) {
      return { label: i18n`Wagon`, storeType: StoreType.WAGON };
    } else {
      return {
        label: i18n`Backpack`,
        storeType: StoreType.BACKPACK,
      };
    }
  }
  /**
   * Create element showing store contents.
   * @param {string} label
   * @param {StoreTypeValue} storeType
   * @param {Iterator<Artefact>} contents
   * @returns {{element: Element, actionButtons: BaseControl[]}, }
   */
  #createStoreContents(label, storeType, contents) {
    const actionButtons = [];
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

    [...contents]
      .sort((a, b) => a.id < b.id)
      .forEach((artefact) => {
        const options = { ...this.#options };
        options.refresh = this.refresh.bind(this);
        options.storeType = storeType;
        options.artefact = artefact;
        const button = createArtefactButtonControl(options);
        actionButtons.push(button);
        contentsElement.appendChild(button.element);
      });
    return { element: container, actionButtons: actionButtons };
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
 * Show a rest action dialog.
 * @param {module:players/actors~Actor} actor
 * @returns {Promise} fulfils to undefined.
 */
function showRestActionDialog(actor) {
  const store = actor.storeManager.getStore(StoreType.BACKPACK);

  const meals = [];
  const drinks = [];
  store.values().forEach((item) => {
    if (item.artefactType === ArtefactType.FOOD) {
      const type = item.traits.get('TYPE');
      if (type === 'MEAL') {
        meals.push(item);
      } else if (type === 'DRINK') {
        drinks.push(item);
      }
    }
  });

  const messageContainer = document.createElement('div');
  messageContainer.appendChild(createIdCard(actor));

  const longRestPossible = dndAction.canRest(
    'LONG',
    meals.length,
    drinks.length
  );
  const shortRestPossible = dndAction.canRest(
    'SHORT',
    meals.length,
    drinks.length
  );
  const choices = [];

  messageContainer.appendChild(
    components.createElement('p', { text: i18n`MESSAGE EXPLAIN REST` })
  );
  let message;
  if (!longRestPossible && !shortRestPossible) {
    message = i18n`MESSAGE CANNOT REST`;
  } else if (!longRestPossible) {
    message = i18n`MESSAGE CANNOT REST LONG`;
  }
  messageContainer.appendChild(
    components.createElement('p', { text: message })
  );
  let shortIndex = -1;
  let longIndex = -1;
  if (shortRestPossible) {
    shortIndex = choices.length;
    choices.push(i18n`BUTTON REST SHORT`);
  }
  if (longRestPossible) {
    longIndex = choices.length;
    choices.push(i18n`BUTTON REST LONG`);
  }
  choices.push(i18n`BUTTON CANCEL`);

  return UI.showChoiceDialog(
    i18n`DIALOG TITLE CHOICES`,
    messageContainer,
    choices
  ).then((choice) => {
    if (choice === shortIndex) {
      discardItemsFromStore(store, meals, dndAction.MEALS_FOR_SHORT_REST);
      discardItemsFromStore(store, drinks, dndAction.DRINKS_FOR_SHORT_REST);
      dndAction.takeRest(actor, 'SHORT');
    } else if (choice === longIndex) {
      discardItemsFromStore(store, meals, dndAction.MEALS_FOR_LONG_REST);
      discardItemsFromStore(store, drinks, dndAction.DRINKS_FOR_LONG_REST);
      dndAction.takeRest(actor, 'LONG');
      return showPrepareSpellsDialog(actor);
    }
    return;
  });
}

/**
 * Show dialog allowing the player to prepare their spells.
 * @param {module:players/actors~Actor} actor
 */
function showPrepareSpellsDialog(actor) {
  const container = components.createElement('div', { className: 'inventory' });

  container.appendChild(
    createActorElement(actor, { hideDescription: true, hideTraits: true })
  );
  const inventoryContainer = new InventoryContainerElement(
    {
      currentOwner: actor,
      prospectiveOwner: actor,
      allowSpellPrep: true,
    },
    {
      limitation: InventoryLimitation.SPELLS,
    }
  );
  container.appendChild(inventoryContainer.element);
  return UI.showControlsDialog(container, {
    title: i18n`DIALOG TITLE PREPARE SPELLS`,
    preamble: i18n`MESSAGE EXPLAIN SPELL PREP`,
  });
}

/**
 * @param {module:players/artefacts~StoreInterface}
 * @param {module:players/artefacts~Artefact[]} items
 * @param {number} qty
 */
function discardItemsFromStore(store, items, qty) {
  if (qty > items.length) {
    LOG.error(
      'Attempt being made to discard more items than provided in array.'
    );
  }
  for (let index = 0; index < qty && index < items.length; index++) {
    const taken = store.take(items[index]);
    if (!taken) {
      LOG.error(`Trying to take artefact ${items[index]}, but none found.`);
    }
  }
}

/**
 * Show actor's inventory.
 * @param {Actor} actor
 * @param {{allowConsumption: boolean, allowMagicUse: boolean, limitation:InventoryLimitation}} [options = {}]
 */
function showInventory(actor, options = {}) {
  const container = components.createElement('div', { className: 'inventory' });

  container.appendChild(
    createActorElement(actor, { hideDescription: true, hideTraits: true })
  );
  const inventoryContainer = new InventoryContainerElement(
    {
      currentOwner: actor,
      prospectiveOwner: actor,
      allowMagicUse: options.allowMagicUse,
      allowConsumption: options.allowConsumption,
    },
    {
      limitation: options.limitation,
    }
  );
  container.appendChild(inventoryContainer.element);
  return UI.showControlsDialog(container);
}

/**
 * Show actor's inventory and allow casting of spells.
 * @param {Actor} actor
 * @param {{allowMagicUse: boolean, limitation:InventoryLimitation}} [options = {}]
 * @returns {Promise}
 */
function showCastSpells(actor) {
  const container = components.createElement('div', { className: 'inventory' });

  const inventoryContainer = new InventoryContainerElement(
    {
      currentOwner: actor,
      prospectiveOwner: actor,
      allowMagicUse: true,
      showDamage: true,
      customAction: (enactor, artefact) => artefact.interaction.react(enactor),
    },
    {
      limitation: InventoryLimitation.READY_MAGIC,
    }
  );
  container.appendChild(inventoryContainer.element);
  inventoryContainer.actionButtons?.forEach(
    (control) => (control.closes = DialogResponse.OK)
  );
  let button = new components.TextButtonControl({
    label: i18n`BUTTON CANCEL`,
    closes: DialogResponse.CANCEL,
  });
  container.appendChild(button.element);

  return UI.showControlsDialog(container, {
    title: i18n`DIALOG TITLE PICK SPELL TO CAST`,
    actionButtons: [...inventoryContainer.actionButtons, button],
  });
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
  if (!possibleStore) {
    container.appendChild(createFailedStorageGuidance(options));
  } else {
    let label;
    let action;
    if (
      possibleStore.storeType === StoreType.CANTRIPS ||
      possibleStore.storeType === StoreType.SPELLS ||
      possibleStore.storeType === StoreType.READY_SPELLS
    ) {
      label = i18n`BUTTON LEARN SPELL`;
      action = ArtefactAction.LEARN_SPELL;
    } else {
      label = i18n`BUTTON TAKE ARTEFACT`;
      action = ArtefactAction.TAKE;
    }
    button = new components.TextButtonControl({
      label: label,
      closes: action,
    });
    container.appendChild(button.element);
    actionButtons.push(button);
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
  let actionButtons = [];

  switch (options.artefact.artefactType) {
    case ArtefactType.SPELL:
      actionButtons = createSpellButtons(options);
      break;
    case ArtefactType.CANTRIP:
      actionButtons = createCantripButtons(options);
      break;
    default:
      actionButtons = createStandardArtefactButtons(options);
  }

  actionButtons.push(
    new components.TextButtonControl({
      label: i18n`BUTTON CANCEL`,
      closes: ArtefactAction.CANCEL,
    })
  );
  actionButtons.forEach((button) => container.appendChild(button.element));
  return actionButtons;
}

/**
 * Create cantrip artefact buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement[]}
 */
function createCantripButtons(options) {
  const buttons = [];
  if (options.allowMagicUse) {
    buttons.push(
      new components.TextButtonControl({
        label: getLabelForUse(options.artefact),
        closes: ArtefactAction.USE,
      })
    );
  }

  buttons.push(
    new components.TextButtonControl({
      label: i18n`Forget`,
      closes: ArtefactAction.DISCARD,
    })
  );
  return buttons;
}

/**
 * Create spell artefact buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement[]}
 */
function createSpellButtons(options) {
  const buttons = [];
  const artefact = options.artefact;
  if (options.allowMagicUse) {
    buttons.push(
      new components.TextButtonControl({
        label: getLabelForUse(options.artefact),
        closes: ArtefactAction.USE,
      })
    );
  } else if (
    options.storeType === artefact.stashStoreType &&
    options.allowSpellPrep
  ) {
    buttons.push(
      new components.TextButtonControl({
        label: i18n`BUTTON PREPARE SPELL`,
        closes: ArtefactAction.PREPARE_SPELL,
      })
    );
  }

  if (options.allowSpellPrep) {
    buttons.push(
      new components.TextButtonControl({
        label: i18n`Forget`,
        closes: ArtefactAction.DISCARD,
      })
    );
  }

  return buttons;
}

/**
 * Check to see if the artefact is allowed to be used.
 * @param {ArtefactDialogOptions} options
 * @returns {boolean}
 */
function isArtefactUsable(options) {
  const artefact = options.artefact;
  if (!artefact.isUsable()) {
    return false;
  }
  if (artefact.isMagic()) {
    return options.allowMagicUse;
  }
  if (artefact.isConsumable()) {
    return options.allowConsumption;
  }
}
/**
 * Create standard artefact buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement[]}
 */
function createStandardArtefactButtons(options) {
  const buttons = [];

  if (isArtefactUsable(options)) {
    buttons.push(
      new components.TextButtonControl({
        label: getLabelForUse(options.artefact),
        closes: ArtefactAction.USE,
      })
    );
  } else if (
    options.storeType === options.artefact.stashStoreType &&
    options.artefact.equipStoreType
  ) {
    buttons.push(
      new components.TextButtonControl({
        label: i18n`BUTTON EQUIP`,
        closes: ArtefactAction.EQUIP,
      })
    );
  } else if (
    options.storeType === options.artefact.equipStoreType &&
    (!options.artefact.stashInWagon ||
      options.currentOwner.storeManager.hasWagon)
  ) {
    buttons.push(
      new components.TextButtonControl({
        label: i18n`BUTTON STASH`,
        closes: ArtefactAction.STASH,
      })
    );
  }

  buttons.push(
    new components.TextButtonControl({
      label: options.artefact.isMagic() ? i18n`Forget` : i18n`BUTTON DISCARD`,
      closes: ArtefactAction.DISCARD,
    })
  );
  return buttons;
}

/**
 * Get a suitable label for a button to use an artefact.
 * @param {module:players/artefacts~Artefact} artefact
 * @returns {string}
 */
function getLabelForUse(artefact) {
  switch (artefact.artefactType) {
    case ArtefactType.SPELL:
    case ArtefactType.CANTRIP:
      return i18n`BUTTON CAST SPELL`;
    default:
      return i18n`BUTTON USE`;
  }
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
 * @param {string | Element} options.description - override the normal
 * description of the actor.
 * @returns {Element}
 */
function createActorElement(actor, options = {}) {
  const container = components.createElement('div', {
    className: 'actor-detail',
  });
  const idCard = createIdCard(actor);
  container.appendChild(idCard);

  let descriptionElement;
  if (!options.hideDescription) {
    if (options.description) {
      descriptionElement =
        options.description instanceof Element
          ? options.description
          : components.createElement('p', { text: options.description });
    } else if (actor.description) {
      descriptionElement = components.createElement('p', {
        text: actor.description,
      });
    }
  }
  if (descriptionElement) {
    container.appendChild(descriptionElement);
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
 * Create a label for an artefact button.
 * @param {ArtefactDialogOptions} options
 * @return {string}
 */
function createArtefactButtonLabel(options) {
  const traits = options.artefact.traits;
  let label = traits.get('NAME');
  if (options.showDamage) {
    const damage = traits.getDamageDiceWhenCastBy
      ? traits.getDamageDiceWhenCastBy(options.currentOwner)
      : traits.get('DMG');
    const range = traits.get('RANGE');
    if (damage) {
      label = `${label} DMG: ${damage}`;
    }
    if (range) {
      label = `${label} RANGE: ${damage}`;
    }
  }
  if (
    options.showPrice ||
    options.artefact.artefactType === ArtefactType.COINS
  ) {
    const price = options.currentOwner.isTrader()
      ? options.artefact.costInGp
      : options.artefact.sellBackPriceInGp;
    label = `${label} ${price.toFixed(2)} GP`;
  }
  return label;
}
/**
 * @param {ArtefactDialogOptions} options
 * @returns {components.BitmapButtonControl}
 */
function createArtefactButtonControl(options) {
  const label = createArtefactButtonLabel(options);
  let action;
  if (options.customAction) {
    action = () => options.customAction(options.currentOwner, options.artefact);
  } else {
    action = async () => {
      await showArtefactDialog(options).then((response) => {
        if (response === DialogResponse.OK) {
          return;
        } else {
          options.refresh?.();
          return;
        }
      });
    };
  }
  return new components.BitmapButtonControl({
    rightLabel: label,
    imageName: options.artefact.iconImageName,
    action: action,
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
    {
      limitation: pillage
        ? InventoryLimitation.STANDARD
        : InventoryLimitation.STASH_ONLY,
    }
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
 * @param {Object} [options = {}]
 * @param {boolean} options.allowRest
 * @param {boolean} options.allowMagicUse - can magic artefacts be used.
 * @param {boolean} options.allowConsumption - can artefacts be consumed.
 * @param {string} options.description - override the actor description
 * @param {string} options.okButtonLabel
 */
export function showActorDetailsDialog(actor, options = {}) {
  const container = document.createElement('div');
  container.appendChild(
    components.createElement('span', {
      text: i18n`Dungeon level: ${SCENE_MANAGER.getCurrentSceneLevel()}`,
    })
  );
  const actorElement = createActorElement(actor, {
    hideTraits: true,
    description: options.description,
  });
  container.appendChild(actorElement);
  let button;
  let actionButtons;
  if (!actor.isProp()) {
    button = new components.TextButtonControl({
      label: i18n`BUTTON INVENTORY`,
      action: () =>
        showInventory(actor, {
          allowConsumption: options.allowConsumption,
          allowMagicUse: options.allowMagicUse,
        }),
    });
    container.appendChild(button.element);
    button = new components.TextButtonControl({
      label: i18n`BUTTON TRAITS`,
      action: () => showTraits(actor),
    });
    container.appendChild(button.element);

    button = new components.TextButtonControl({
      label: i18n`BUTTON MAGIC`,
      action: () =>
        showInventory(actor, {
          allowMagicUse: false,
          limitation: InventoryLimitation.MAGIC,
        }),
    });
    container.appendChild(button.element);

    if (options.allowRest) {
      button = new components.TextButtonControl({
        label: i18n`BUTTON REST`,
        action: () => {
          return showRestActionDialog(actor).then(() =>
            actorElement.replaceWith(
              createActorElement(actor, { hideTraits: true })
            )
          );
        },
      });
      container.appendChild(button.element);
    }

    if (options.allowMagicUse) {
      actionButtons = [];
      button = new components.TextButtonControl({
        label: i18n`BUTTON CAST SPELL`,
      });
      button.closes = 'CAST SPELL';
      actionButtons.push(button);
      button = new components.TextButtonControl({
        label: i18n`BUTTON CANCEL`,
      });
      button.closes = 'CANCEL';
      actionButtons.push(button);
      container.appendChild(button.element);
    }
  }

  return UI.showControlsDialog(container, {
    okButtonLabel: options.okButtonLabel,
    actionButtons: actionButtons,
  }).then((closes) => {
    if (closes === 'CAST SPELL') {
      return showCastSpells(actor);
    }
    return Promise.resolve();
  });
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
    case ArtefactType.FOOD:
    case ArtefactType.SPELL:
    case ArtefactType.CANTRIP:
      dialogFn = showEquipDialog;
      break;
  }
  return dialogFn(options).then((response) => {
    switch (response) {
      case ArtefactAction.DISCARD:
        sourceStoreManager.discard(artefact);
        break;
      case ArtefactAction.PREPARE_SPELL:
      case ArtefactAction.EQUIP:
        destStoreManager.equip(artefact);
        break;
      case ArtefactAction.LEARN_SPELL:
        if (
          artefact.isMagic() &&
          destStoreManager.hasArtefactWithSameId(artefact)
        ) {
          return UI.showOkDialog(i18n`MESSAGE SPELL ALREADY KNOWN`);
        } else {
          sourceStoreManager.discard(artefact);
          const store = destStoreManager.findSuitableStore(artefact);
          store.add(artefact);
        }
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
      case ArtefactAction.USE:
        artefact.interaction.react(options.currentOwner);
        break;
    }
    return Promise.resolve();
  });
}

/**
 * Show the rest dialog for the hero
 * @param {module:players/actors~Actor} actor} heroActor
 * @returns {Promise} fulfils to null;
 */
export function showRestDialog(heroActor) {
  const messageContainer = components.createElement('div');
  messageContainer.appendChild(
    components.createElement('p', {
      text: i18n`MESSAGE REST DIALOG`,
    })
  );
  const restReqs = components.createElement('ul');
  messageContainer.appendChild(restReqs);
  restReqs.appendChild(
    components.createElement('li', {
      text: i18n`SHORT REST REQ ${dndAction.DRINKS_FOR_SHORT_REST} ${dndAction.MEALS_FOR_SHORT_REST}`,
    })
  );
  restReqs.appendChild(
    components.createElement('li', {
      text: i18n`LONG REST REQ ${dndAction.DRINKS_FOR_LONG_REST} ${dndAction.MEALS_FOR_LONG_REST}`,
    })
  );
  return showActorDetailsDialog(heroActor, {
    allowConsumption: true,
    allowRest: true,
    description: messageContainer,
    okButtonLabel: i18n`BUTTON TO NEXT ROOM`,
  });
}

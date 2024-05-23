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
import * as maths from '../utils/maths.js';
import { i18n, MESSAGES } from '../utils/messageManager.js';
import { ArtefactType, StoreType } from '../players/artefacts.js';
import SCENE_MANAGER from '../gameManagement/sceneManager.js';
import { gpAsString } from '../utils/game/coins.js';
import * as dndAction from '../dnd/dndAction.js';
import LOG from '../utils/logging.js';
import { sceneToFloor } from '../dnd/floorNumbering.js';

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
  CONTINUE: 'continue',
  CONSUME: 'consume',
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
 * @property {module:players/actors.Actor} currentOwner - who currently owns the artefact.
 * @property {module:players/actors.Actor} prospectiveOwner - who currently owns the artefact.
 * @property {boolean} allowMagicUse - allow an item to be used.
 * @property {boolean} allowConsumption - allow an item to be consumed.
 * @property {boolean} allowSpellPrep - allow a spell to be prepared.
 * @property {module:players/artefacts.Artefact} artefact - the item .
 * @property {StoreType} storeType
 * @property {ArtefactActionTypeValue} actionType
 * @param {function(noChain:boolean):Promise} refresh - function to call if storage changed.
 * if noChain is set, linkedInventories are not called. This is used to prevent
 * circular loops.
 * @param {boolean} showPrice
 * @param {boolean} showDamage - add damage detail to button labels.
 * @param {string} delayedReaction - If true, clicking on the
 * artefact will close the dialog and it will return a DelayedAction response.
 */

/**
 * @typedef {Object} DelayedAction
 * @property {function():Promise} invoke - function that can be called to instigate the
 * delayed action.
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
 * time as the inventory.
 * @property {function()} onRefresh - function to call on an inventory refresh.
 **/

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
    let empty = true;
    this.#actionButtons = [];
    if (!noChain && this.linkedInventory) {
      this.linkedInventory.refresh(true); // suppress linking
    }
    this.#content.replaceChildren();

    if (
      !this.#options.currentOwner.isHero() ||
      this.#options.currentOwner.alive
    ) {
      let storesToShow = this.#getStoresToShow();

      storesToShow.forEach((storeInfo) => {
        const contents =
          this.#options.currentOwner.storeManager.getStoreContents(
            storeInfo.storeType
          );
        if (contents) {
          empty = false;
          const storeContentsElement = this.#createStoreContents(
            storeInfo.label,
            storeInfo.storeType,
            contents
          );
          this.#content.appendChild(storeContentsElement);
        }
      });
    }
    if (empty) {
      let emptyMessage;
      if (
        this.#options.currentOwner.isHero() &&
        !this.#options.currentOwner.alive
      ) {
        emptyMessage = i18n`MESSAGE DEAD HERO HAS NO INVENTORY`;
      } else {
        emptyMessage = i18n`MESSAGE NOTHING HERE`;
      }
      this.#content.appendChild(
        components.createElement('p', {
          text: emptyMessage,
        })
      );
    }
    if (this.#inventoryOptions.onRefresh) {
      this.#inventoryOptions.onRefresh();
    }
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
          { label: i18n`Ring fingers`, storeType: StoreType.RING_FINGERS },
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
   * @returns {{label:string,storeType:StoreType}}
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
   * Create element showing store contents. Buttons created are pushed to
   * this.#actionButtons.
   * @param {string} label
   * @param {StoreTypeValue} storeType
   * @param {Iterator<Artefact>} contents
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

    [...contents]
      .sort((a, b) => a.id < b.id)
      .forEach((artefact) => {
        const options = { ...this.#options };
        options.refresh = this.refresh.bind(this);
        options.storeType = storeType;
        options.artefact = artefact;
        const button = this.#createArtefactButtonControl(options);
        if (button.closes !== null && button.closes !== undefined) {
          this.#actionButtons.push(button);
        }
        contentsElement.appendChild(button.element);
      });
    return container;
  }
  /**
   * Create an artefact button. If a custom action is set, the button is a closer.
   * Otherwise it just pops up a dialog giving details about the artefact.
   * @param {ArtefactDialogOptions} options
   * @returns {components.BitmapButtonControl}
   */
  #createArtefactButtonControl(options) {
    const label = createArtefactButtonLabel(options);
    let action;
    let closes;
    if (options.delayedReaction) {
      closes = {
        invoke: () => options.artefact.interaction.react(options.currentOwner),
      };
    } else {
      action = async () => {
        await showArtefactDialog(options).then(() => options.refresh?.());
      };
    }
    return new components.BitmapButtonControl({
      rightLabel: label,
      imageName: options.artefact.iconImageName,
      action: action,
      closes: closes,
    });
  }
}

/**
 * Show the actor's traits.
 * @param {module:players/actors.Actor} actor
 * @returns {Promise}
 */
function showTraits(actor) {
  const container = document.createElement('div');
  container.appendChild(createActorElement(actor, { hideDescription: true }));
  return UI.showControlsDialog(container);
}

/**
 * Show a rest action dialog.
 * @param {module:players/actors.Actor} actor
 * @returns {Promise} fulfils to undefined.
 */
function showRestActionDialog(actor) {
  const store = actor.storeManager.getStore(StoreType.BACKPACK);

  const meals = [];
  const drinks = [];
  store.values().forEach((item) => {
    if (item.artefactType === ArtefactType.CONSUMABLE) {
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

  messageContainer.appendChild(
    components.createElement('p', { text: i18n`MESSAGE EXPLAIN REST` })
  );
  const choices = [];
  let shortIndex = -1;
  let longIndex = -1;

  const restDetails = dndAction.canRest(
    meals.length,
    drinks.length,
    actor.traits
  );

  let message = '';
  if (!restDetails.shortRest.possible) {
    if (
      restDetails.shortRest.failure === dndAction.RestFailure.NEED_LONG_REST
    ) {
      message = i18n`MESSAGE CANNOT REST SHORT NEED LONG REST`;
    } else {
      message = i18n`MESSAGE CANNOT REST SHORT NEED RATIONS`;
    }
    messageContainer.appendChild(
      components.createElement('p', { text: message })
    );
  }
  if (!restDetails.longRest.possible) {
    message = i18n`MESSAGE CANNOT REST LONG NEED RATIONS`;

    messageContainer.appendChild(
      components.createElement('p', { text: message })
    );
  }

  if (restDetails.shortRest.possible) {
    shortIndex = choices.length;
    choices.push(i18n`BUTTON REST SHORT`);
  }
  if (restDetails.longRest.possible) {
    longIndex = choices.length;
    choices.push(i18n`BUTTON REST LONG`);
  }
  choices.push(i18n`BUTTON CONTINUE`);

  return UI.showChoiceDialog(
    i18n`DIALOG TITLE CHOICES`,
    messageContainer,
    choices
  ).then((choice) => {
    if (choice === shortIndex) {
      discardItemsFromStore(store, meals, dndAction.MEALS_FOR_SHORT_REST);
      discardItemsFromStore(store, drinks, dndAction.DRINKS_FOR_SHORT_REST);
      const result = dndAction.takeRest(actor, 'SHORT');
      return UI.showOkDialog(
        i18n`MESSAGE REST SHORT HP GAIN ${result.newHp - result.oldHp}`
      );
    } else if (choice === longIndex) {
      discardItemsFromStore(store, meals, dndAction.MEALS_FOR_LONG_REST);
      discardItemsFromStore(store, drinks, dndAction.DRINKS_FOR_LONG_REST);
      const result = dndAction.takeRest(actor, 'LONG');
      return showPrepareSpellsDialog(actor).then(() =>
        UI.showOkDialog(
          `MESSAGE REST LONG HP GAIN ${result.newHp - result.oldHp}`
        )
      );
    }
    return;
  });
}

/**
 * Show dialog allowing the player to prepare their spells.
 * @param {module:players/actors.Actor} actor
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
 * @param {module:players/actors.Actor} actor
 * @param {{allowConsumption: boolean, allowMagicUse: boolean, limitation:InventoryLimitation}} [options = {}]
 */
function showInventory(actor, options = {}) {
  const container = components.createElement('div', { className: 'inventory' });
  const actorContainer = components.createElement('div', {
    className: 'actor-container',
  });
  container.appendChild(actorContainer);
  actorContainer.appendChild(
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
      onRefresh: () =>
        actorContainer.replaceChildren(
          createActorElement(actor, { hideDescription: true, hideTraits: true })
        ),
    }
  );
  container.appendChild(inventoryContainer.element);
  return UI.showControlsDialog(container);
}

/**
 * Show actor's inventory and allow casting of spells.
 * @param {module:players/actors.Actor} actor
 * @param {{allowMagicUse: boolean, limitation:InventoryLimitation}} [options = {}]
 * @returns {Promise<DelayedAction>}
 */
function showCastSpells(actor) {
  const container = components.createElement('div', { className: 'inventory' });

  const inventoryContainer = new InventoryContainerElement(
    {
      currentOwner: actor,
      prospectiveOwner: actor,
      allowMagicUse: true,
      showDamage: true,
      delayedReaction: true,
    },
    {
      limitation: InventoryLimitation.READY_MAGIC,
    }
  );
  container.appendChild(inventoryContainer.element);
  const cancelButton = new components.TextButtonControl({
    label: i18n`BUTTON CONTINUE`,
    closes: DialogResponse.CANCEL,
  });

  return UI.showControlsDialog(container, {
    title: i18n`DIALOG TITLE PICK SPELL TO CAST`,
    actionButtons: [...inventoryContainer.actionButtons, cancelButton],
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
 * @returns {module:utils/dom/components~BaseControlElement[]}
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
    actionButtons.push(button);
  }

  button = new components.TextButtonControl({
    label: i18n`BUTTON LEAVE ARTEFACT`,
    closes: ArtefactAction.LEAVE,
  });
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
    case ArtefactType.CONSUMABLE:
      actionButtons = createConsumeButtons(options);
      break;
    case ArtefactType.KEY:
      actionButtons = createKeyButtons(options);
      break;
    default:
      actionButtons = createStandardArtefactButtons(options);
      break;
  }

  //actionButtons.forEach((button) => container.appendChild(button.element));
  actionButtons.push(
    new components.TextButtonControl({
      label: i18n`BUTTON CONTINUE`,
      closes: ArtefactAction.CONTINUE,
    })
  );
  return actionButtons;
}

/**
 * Create KEY artefact buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement[]}
 */
function createKeyButtons(optionsUnused) {
  const buttons = [];
  // nothing you can do with keys. If you discard or sell it you could get stuck.
  return buttons;
}

/**
 * Create cantrip artefact buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement[]}
 */
function createCantripButtons(options) {
  const buttons = [];
  if (options.allowMagicUse) {
    LOG.error(
      'Unexpected creation of Cantrip buttons with magic allowed. Use of Cantrips is handled by custom actions.'
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
    LOG.error(
      'Unexpected creation of Spell buttons with magic allowed. Use of Spells is handled by custom actions.'
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
        label: i18n`BUTTON FORGET`,
        closes: ArtefactAction.DISCARD,
      })
    );
  }

  return buttons;
}

/**
 * Create consume artefact buttons.
 * @param {ArtefactDialogOptions} options
 * @returns {module:utils/dom/components~BaseControlElement[]}
 */
function createConsumeButtons(options) {
  const buttons = [];

  if (isArtefactUsable(options)) {
    buttons.push(
      new components.TextButtonControl({
        label: getLabelForUse(options.artefact),
        closes: ArtefactAction.CONSUME,
      })
    );
  }
  buttons.push(
    new components.TextButtonControl({
      label: i18n`BUTTON DISCARD`,
      closes: ArtefactAction.DISCARD,
    })
  );
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
 * @param {module:players/artefacts.Artefact} artefact
 * @returns {string}
 */
function getLabelForUse(artefact) {
  switch (artefact.artefactType) {
    case ArtefactType.CONSUMABLE:
      return i18n`BUTTON CONSUME`;
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
  if (buyersFundsInGp < options.artefact.costInGp) {
    container.appendChild(
      createNoFundsGuidance(buyersFundsInGp, artefactCostInGp)
    );
    if (!options.currentOwner.isTrader()) {
      createSelfActionArtefactDialogButtons(container, options);
    }
    return;
  }

  // button labels shows action relative to the hero.
  // i.e. although the action may be the trader selling
  // an item, to the player this is viewed as buying.
  const prospectiveStore =
    options.prospectiveOwner.storeManager.findSuitableStore(options.artefact);
  if (!prospectiveStore) {
    container.appendChild(createFailedStorageGuidance(options));
    if (!options.currentOwner.isTrader()) {
      createSelfActionArtefactDialogButtons(container, options);
    }
    return;
  }
  let button = new components.TextButtonControl({
    label: options.currentOwner.isTrader()
      ? i18n`BUTTON BUY FOR GP ${options.artefact.costInGp.toFixed(2)}`
      : i18n`BUTTON SELL FOR GP ${options.artefact.sellBackPriceInGp.toFixed(
          2
        )}`,
    closes: ArtefactAction.SELL,
  });
  actionButtons.push(button);

  button = new components.TextButtonControl({
    label: i18n`BUTTON CONTINUE`,
    closes: ArtefactAction.CONTINUE,
  });
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
  actionButtons.push(button);

  button = new components.TextButtonControl({
    label: i18n`BUTTON LEAVE ARTEFACT`,
    closes: ArtefactAction.CONTINUE,
  });
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
  text = i18n`MESSAGE INSUFFICIENT FUNDS ${requiredGp.toFixed(
    2
  )} ${availableGp.toFixed(2)}`;

  return components.createElement('p', { className: 'guidance', text: text });
}
/**
 * Create an element that provides guidance about why something cannot be stored.
 * @param {ArtefactDialogOptions} options
 * @returns {Element}
 */
function createFailedStorageGuidance(options) {
  let text;
  if (options.prospectiveOwner.isTrader()) {
    text = i18n`MESSAGE TRADER CANNOT STASH`;
  } else if (options.artefact.stashInWagon) {
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
  container.appendChild(createActorElement(artefact, options));

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
  if (!actor.artefactType && hp && !actor.traits.get('_HP')) {
    const hpMax = actor.traits.getInt('HP_MAX');
    let hpText;
    if (hp === 0) {
      hpText = i18n`(DEAD)`;
    } else if (hpMax) {
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
 * @param {module:players/actors.Actor} actor
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
    if (!actor.artefactType && !actor.alive) {
      descriptionElement = createCorpseDescriptionElement(actor);
    } else if (options.description) {
      descriptionElement =
        options.description instanceof Element
          ? options.description
          : components.createElement('p', { text: options.description });
    } else if (actor.description) {
      descriptionElement = components.createElement('p', {
        text:
          actor.unknown && actor.unknownDescription
            ? actor.unknownDescription
            : actor.description,
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
 * Create an element describing a corpse.
 * @param {module:players/actors~Actor}
 * @returns {Element}
 */
function createCorpseDescriptionElement(actor) {
  let text;
  if (actor.isHero()) {
    const name = actor.traits.get('NAME');
    text = i18n`MESSAGE HERO EPITAPH FOR ${name}`;
  } else {
    text = i18n`MESSAGE GENERIC EPITAPH`;
  }
  return components.createElement('p', {
    text: text,
  });
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
  if (!actor.artefactType && !actor.alive) {
    return createCorpseDescriptionElement(actor);
  }
  const traitsList = document.createElement('ul');

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

  const readableArray = [];
  actor.traits?.getAllTraits().forEach((value, key) => {
    if (!excludedKeys.includes(key) && !key.startsWith('_')) {
      if (actor.traits.hasEffective?.(key)) {
        const effectiveValue = actor.traits.getEffectiveInt(key);
        const baseValue = maths.safeParseInt(value);
        if (effectiveValue !== baseValue) {
          const diff = effectiveValue - baseValue;
          value = `${effectiveValue} [${baseValue}${
            diff < 0 ? '-' : '+'
          }${diff}]`;
        }
      }
      readableArray.push([createReadableKey(key), createReadableValue(value)]);
    }
  });
  readableArray.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  // actor.traits?.getAllTraitsSorted().forEach((value, key) => {
  for (const traitEntry of readableArray) {
    const key = traitEntry[0];
    let value = traitEntry[1];

    if (value && value !== '0') {
      const displayedValue = Array.isArray(value) ? value.join(', ') : value;
      const item = document.createElement('li');
      const label = components.createElement('span', {
        text: `${key}: `,
      });
      const content = components.createElement('span', {
        text: displayedValue,
      });
      traitsList.appendChild(item);
      item.appendChild(label);
      item.appendChild(content);
    }
  }
  return traitsList;
}

/**
 * Convert a traits key into a more human readable version.
 * @param {string} key
 * @returns {string}
 */
function createReadableKey(key) {
  let revised = MESSAGES.getText(key);
  if (revised === key) {
    revised = key?.replace('_', ' ');
  }
  return revised.charAt(0).toUpperCase() + revised.substring(1).toLowerCase();
}

/**
 * Convert a traits value into a more human readable version.
 * @param {string} key
 * @returns {string}
 */
function createReadableValue(value) {
  if (/\d*\.?\d* *[CSGP]P/.test(value)) {
    return value; // money
  }
  if (/\d+D\d+(?: *[+-]? *\d+)?/.test(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => entry.toLowerCase());
  }
  return typeof value === 'string' ? value.toLowerCase() : value;
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
    let dice;
    let diceLabel;
    if (traits.has('HP_GAIN')) {
      diceLabel = 'HP: +';
      dice = traits.getHpGainDiceWhenCastBy
        ? traits.getHpGainDiceWhenCastBy(options.currentOwner.traits)
        : traits.get('HP_GAIN');
    } else {
      diceLabel = 'DMG: ';
      dice = traits.getDamageDiceWhenCastBy
        ? traits.getDamageDiceWhenCastBy(options.currentOwner.traits)
        : traits.get('DMG');
    }

    if (dice) {
      label = `${label} ${diceLabel}${dice}`;
    }
    let rangeText;
    if (traits.get('MODE') === 'BLESS') {
      rangeText = i18n`ACTS ON CASTER`;
    } else {
      const range = traits.get('RANGE');
      if (range) {
        rangeText = i18n`Range: ${range}`;
      }
    }
    label = `${label} ${rangeText}`;
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
 * Show a dialog where one actor can take artefacts from another.
 * @param {module:players/actors.Actor} buyer
 * @param {module:players/actors.Actor} seller
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
  const button = new components.TextButtonControl({
    label: i18n`BUTTON CONTINUE`,
  });
  button.closes = DialogResponse.CANCEL;
  const actionButtons = [];
  actionButtons.push(button);
  return UI.showControlsDialog(container, {
    preamble: pillage ? i18n`DIALOG TITLE PILLAGE` : i18n`DIALOG TITLE TRADE`,
    actionButtons: actionButtons,
  });
}

/**
 * Show a dialog where one actor can take artefacts from another.
 * @param {module:players/actors.Actor} buyer
 * @param {module:players/actors.Actor} seller
 * @returns {Promise} fulfils to undefined on completion.
 */
export function showTradeDialog(buyer, seller) {
  return showTradeOrPillageDialog(buyer, seller, false);
}

/**
 * Show a dialog where one actor can take artefacts from another.
 * @param {module:players/actors.Actor} pillager
 * @param {module:players/actors.Actor} victim
 * @returns {Promise} fulfils to undefined on completion.
 */
export function showPillageDialog(pillager, victim) {
  return showTradeOrPillageDialog(pillager, victim, true);
}

// Export dialogs
/**
 * Display details about the actor.
 * @param {module:players/actors.Actor} actor
 * @param {Object} [options = {}]
 * @param {boolean} options.allowRest
 * @param {boolean} options.allowMagicUse - can magic artefacts be used.
 * @param {boolean} options.allowConsumption - can artefacts be consumed.
 * @param {string} options.description - override the actor description
 * @param {string} options.okButtonLabel
 * @returns {Promise<DelayedAction>}
 */
export function showActorDetailsDialog(actor, options = {}) {
  const container = document.createElement('div');
  let buttonRestElement;
  container.appendChild(
    components.createElement('span', {
      text: i18n`Dungeon floor: ${sceneToFloor(
        SCENE_MANAGER.getCurrentSceneLevel()
      )}`,
    })
  );
  const actorContainer = components.createElement('div', {
    className: 'actor-container',
  });
  container.appendChild(actorContainer);
  const actorElement = createActorElement(actor, {
    hideTraits: true,
    description: options.description,
  });
  actorContainer.appendChild(actorElement);
  let button;
  let actionButtons;
  if (!actor.isProp()) {
    button = new components.TextButtonControl({
      label: i18n`BUTTON INVENTORY`,
      action: () =>
        showInventory(actor, {
          allowConsumption: options.allowConsumption,
          allowMagicUse: options.allowMagicUse,
        }).then(() => {
          actorContainer.replaceChildren(
            createActorElement(actor, {
              hideTraits: true,
              description: options.description,
            })
          );
          if (buttonRestElement && !actor.alive) {
            container.removeChild(buttonRestElement);
            buttonRestElement = undefined;
          }
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
      buttonRestElement = button.element;
      container.appendChild(button.element);
    }

    if (options.allowMagicUse) {
      actionButtons = actionButtons ?? [];
      button = new components.TextButtonControl({
        label: i18n`BUTTON CAST SPELL`,
      });
      button.closes = 'CAST SPELL';
      actionButtons.push(button);
    }
  }
  if (actionButtons) {
    button = new components.TextButtonControl({
      label: i18n`BUTTON CONTINUE`,
    });
    button.closes = DialogResponse.CANCEL;
    actionButtons.push(button);
  }

  return UI.showControlsDialog(container, {
    okButtonLabel: options.okButtonLabel,
    actionButtons: actionButtons,
  }).then((closes) => {
    switch (closes) {
      case 'CAST SPELL':
        return showCastSpells(actor);
      default:
        return Promise.resolve();
    }
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
  const sourceStoreManager = options.currentOwner?.storeManager;
  const destStoreManager = options.prospectiveOwner.storeManager;
  const artefact = options.artefact;

  const originalHideTraits = options.hideTraits;
  return identifyArtefact(options)
    .then((known) => {
      if (!known) {
        options.hideTraits = true; // hide traits if item not known
      }
      return showEquipDialog(options);
    })
    .then((response) => {
      options.hideTraits = originalHideTraits; // restore
      switch (response) {
        case ArtefactAction.CONSUME:
          sourceStoreManager.discard(artefact);
          return artefact.interaction.react(options.currentOwner);
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
          if (artefact.artefactType === ArtefactType.SPELL) {
            return UI.showOkDialog(i18n`MESSAGE EXPLAIN SPELL NEEDS REST`);
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
          if (!destStoreManager.stash(artefact)) {
            UI.showOkDialog(
              options.prospectiveOwner.isTrader()
                ? i18n`MESSAGE TRADER CANNOT STASH`
                : i18n`MESSAGE CANNOT STASH`
            );
          }
          break;
        case ArtefactAction.TAKE:
          sourceStoreManager?.discard(artefact); // store manager could be null for programmatically created artefact.
          if (artefact.stashInWagon && !destStoreManager.hasWagon) {
            destStoreManager.equip(artefact, { direct: true });
          } else {
            destStoreManager.stash(artefact, { direct: true });
          }

          break;
        case ArtefactAction.USE:
          return artefact.interaction.react(options.currentOwner);
      }
      return Promise.resolve();
    });
}

/**
 * Show dialog allowing the identification of an artefact if necessary.
 * @param {ArtefactDialogOptions} options
 * @returns {Promise<boolean>} true if known.
 */
function identifyArtefact(options) {
  if (!options.artefact?.unknown) {
    return Promise.resolve(true);
  }

  const tester = options.prospectiveOwner ?? options.currentOwner;
  const recognised = dndAction.canIdentify(
    tester.traits,
    options.artefact.traits
  );
  if (recognised) {
    options.artefact.unknown = false;
    return UI.showOkDialog(i18n`MESSAGE IDENTIFIED ITEM`).then(() => true);
  } else {
    return UI.showOkDialog(i18n`MESSAGE FAILED TO IDENTIFY`).then(() => false);
  }
}
/**
 * Show the rest dialog for the hero
 * @param {module:players/actors.Actor} actor} heroActor
 * @returns {Promise} fulfils to null;
 */
export function showRestDialog(heroActor) {
  const messageContainer = components.createElement('div');
  const nextFloor = sceneToFloor(SCENE_MANAGER.getCurrentSceneLevel() + 1);
  messageContainer.appendChild(
    components.createElement('p', {
      text: i18n`MESSAGE REST DIALOG ${nextFloor}`,
    })
  );

  return showActorDetailsDialog(heroActor, {
    allowConsumption: true,
    allowRest: true,
    description: messageContainer,
    okButtonLabel: i18n`BUTTON CONTINUE`,
  });
}

/**
 * @file Artefacts
 * Artefacts are items that exist in the game but are never rendered in the
 * tile map. They can be stored, or worn. Examples are money and weapons. They can
 * be held by actors, typically a trader or hiddenArtefact.
 * @module players/artefacts
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

import LOG from '../utils/logging.js';
import { ActorType } from './actors.js';
import * as coins from '../utils/game/coins.js';
import { i18n } from '../utils/messageManager.js';
import { Traits } from '../dnd/traits.js';

/**
 * @typedef {Object} StoreTypeValue
 * @property {number} space - amount of space in store.
 * @property {boolean} money - if true, a MoneyStore is used.
 * @property {boolean} spacesExpand - if true every artefact takes one space.
 */

/**
 * Enumeration of store types.
 * @enum {StoreTypeValue}
 */
export const StoreType = {
  HEAD: { id: 'HEAD', space: 1, money: false, spacesExpand: false },
  BODY: { id: 'BODY', space: 1, money: false, spacesExpand: false },
  HANDS: { id: 'HANDS', space: 2, money: false, spacesExpand: false },
  FEET: { id: 'FEET', space: 2, money: false, spacesExpand: false },
  BACKPACK: { id: 'BACKPACK', space: 8, money: false, spacesExpand: true },
  WAGON: { id: 'WAGON', space: 8, money: false, spacesExpand: true },
  CANTRIPS: { id: 'CANTRIPS', space: 999, money: false, spacesExpand: true },
  SPELLS: {
    id: 'SPELLS',
    space: 9,
    money: false,
    spacesExpand: true,
  },
  PREPARED_SPELLS: {
    id: 'PREPARED SPELLS',
    space: 9,
    money: false,
    spacesExpand: true,
  },
  PURSE: {
    id: 'PURSE',
    space: Number.MAX_SAFE_INTEGER,
    money: true,
    spacesExpand: false,
  },
};

/**
 * @typedef {Object} ArtefactTypeValue
 * @property {number} storageSpace - how much storage is used.
 * @property {{stash: StoreTypeValue, equip: StoreTypeValue}} storeType - storage locations
 */
/**
 * Enumeration of artefact types
 * @enum {ArtefactTypeValue}
 */
export const ArtefactType = {
  ARMOUR: {
    storageSpace: 1,
    storeType: { stash: StoreType.WAGON, equip: StoreType.BODY },
  },
  FOOD: {
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK },
  },
  CANTRIP: {
    storageSpace: 1,
    storeType: { stash: null, equip: StoreType.CANTRIPS },
  },
  SPELL: {
    storageSpace: 1,
    storeType: { stash: StoreType.SPELLS, equip: StoreType.PREPARED_SPELLS },
  },
  WEAPON: {
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.HANDS },
  },
  SHIELD: {
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.HANDS },
  },
  TWO_HANDED_WEAPON: {
    storageSpace: 2,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.HANDS },
  },
  HEAD_GEAR: {
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.HEAD },
  },
  COINS: { storageSpace: 0, storeType: { stash: StoreType.PURSE } },
};

/**
 * Convert a string to an ArtefactType
 * @param {string} str - artefact type as string but excluding the ArtefactType.
 * E.g. COIN.
 * @returns {ArtefactType} null if invalid.
 */
export function strToArtefactType(str) {
  const type = ArtefactType[str];
  if (type === null || type === undefined) {
    LOG.error(`Unrecognised artefact type: ${str}`);
  }
  return type;
}

/**
 * @interface StoreInterface
 */
/**
 * @function StoreInterface.store
 * @param {Artefact} artefact
 * @returns {boolean} true if stored, else false.
 */
/**
 * @function StoreInterface.retrieve
 * @param {Artefact} artefact
 * @returns {Artefact} the retrieved artefact which is removed from the store.
 */
/**
 * @function StoreInterface.canAdd
 * @param {Artefact} artefact
 * @returns {boolean} true if it can be added.
 */
/**
 * @function StoreInterface.has
 * @param {Artefact} artefact
 * @returns {boolean} true if it has the artefact.
 */
/**
 * @property {StoreType} StoreInterface.storeType
 */

/**
 * Store for artefacts
 * @implements {StoreInterface}
 */
class ArtefactStore {
  /** @type {number} */
  #maxSize;
  /** @type {Map<Artefact, Artefact>} */
  #artefacts;
  /** @type {number} */
  #usedSpace;
  /** @type {boolean} */
  #spacesExpand;
  /** @type {StoreType} */
  #storeType;

  /** Create store.
   * @param {number} maxSize;
   * @param {boolean} spacesExpand - if true, each space can take an artefact of
   * any size.
   */
  constructor(maxSize, spacesExpand, storeType) {
    this.#maxSize = maxSize;
    this.#usedSpace = 0;
    this.#artefacts = new Map();
    this.#spacesExpand = spacesExpand;
    this.#storeType = storeType;
  }

  /**
   * Get the store type
   * @returns {StoreType}
   */
  get storeType() {
    return this.#storeType;
  }
  /**
   * Get free space
   * @returns {number}
   */
  get freeSpace() {
    return this.#maxSize - this.#usedSpace;
  }

  /**
   * Get maximum space
   * @returns {number}
   */
  get maxSpace() {
    return this.#maxSize;
  }

  /**
   * Test if empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.#usedSpace === 0;
  }

  /** Get the space required by an artefact. If #spacesExpand
   * this is always 1.
   * @param {Artefact}
   * @returns {number}
   */
  getRequiredSpace(artefact) {
    return this.#spacesExpand ? 1 : artefact.storageSpace;
  }

  /**
   * Test if store has artefact.
   * @param {Artefact} artefact
   * @returns {boolean}
   */
  has(artefact) {
    return this.#artefacts.has(artefact);
  }

  /**
   *
   * @param {Artefact} artefact
   * @returns {boolean} true if stored; false if no room.
   */
  add(artefact) {
    const space = this.#maxSize - this.#usedSpace;
    const requiredSpace = this.getRequiredSpace(artefact);
    if (space >= requiredSpace) {
      this.#artefacts.set(artefact, artefact);
      this.#usedSpace += requiredSpace;
      return true;
    }
    return false;
  }
  /**
   * Retrieve artefact. This removes it from the store.
   * @param {Artefact} artefact - to retrieve.
   * @returns {Artefact} null if not found.
   */
  take(artefact) {
    const storedArtefact = this.#artefacts.get(artefact);
    const requiredSpace = this.getRequiredSpace(artefact);
    if (storedArtefact) {
      this.#usedSpace -= requiredSpace;
      this.#artefacts.delete(storedArtefact);
    }
    return storedArtefact;
  }

  /**
   * Take the first element.
   * @returns {Artefact} null if empty.
   */
  takeFirst() {
    if (this.isEmpty()) {
      return null;
    }
    const firstArtefact = this.#artefacts.values().next().value;
    return this.take(firstArtefact);
  }

  /**
   * Iterable values in the store.
   * @returns {Iterable<Artefacts>}
   */
  values() {
    return this.#artefacts.values();
  }

  /**
   * Test if an artefact can be stored.
   * @param {Artefact} artefact
   * @returns {boolean}
   */
  canAdd(artefact) {
    const requiredSpace = this.getRequiredSpace(artefact);
    return this.#maxSize - this.#usedSpace >= requiredSpace;
  }
}

/**
 * Gold storage. This effectively merges artifacts into one combining the COST trait.
 * Note that if only one artefact is added, it is returned. Once more than one has been
 * added a composite money artefact is returne.
 * @implements {StoreInterface}
 */
class MoneyStore {
  /** @type {Artefact} */
  #artefact;
  /** @type {boolean} */
  #multipleArtefacts;

  /** Create store.
   * @param {number} maxSize;
   */
  constructor() {
    this.#multipleArtefacts = false;
  }

  /**
   * Get store type
   * @returns {StoreType}
   */
  get storeType() {
    return StoreType.PURSE;
  }
  /**
   * Test if empty
   * @override
   * @returns {boolean}
   */
  isEmpty() {
    return !this.#artefact || this.#artefact.costInGp === 0;
  }

  /**
   * Test if store has any money.
   * @override
   * @param {Artefact} artefact
   * @returns {boolean}
   */
  has(artefactUnused) {
    return this.#artefact.costInGp > 0;
  }
  /**
   * The artefact is just used as a carrier for the cost.
   * @override
   */
  add(artefact) {
    const costDetails = artefact.costDetails;
    if (!this.#artefact) {
      this.#artefact = artefact.clone();
      return true;
    }
    const currentCostDetails = this.#artefact.costDetails;
    if (!this.#multipleArtefacts) {
      this.#artefact = MoneyStore.createGoldCoinArtefact(
        currentCostDetails.valueGp
      );
      this.#multipleArtefacts = true;
    }

    this.#artefact.costInGp = currentCostDetails.valueGp + costDetails.valueGp;
    return true;
  }

  /**
   * Retrieve an artefact.
   * @param {Artefact} artefact
   * @returns {Artefact} value set to value of gold taken which may be less
   * than the requested amount..
   */
  take(artefact) {
    const taken = Math.min(this.#artefact.costInGp, artefact.costInGp);
    this.#artefact.costInGp = this.#artefact.costInGp - taken;
    artefact.costInGp = taken; //may be less than requested.
    return artefact;
  }

  /**
   * Test if artefact can be added.
   * @param {Artefact} artefact
   * @returns {boolean}
   */
  canAdd(artefactUnused) {
    return true;
  }

  /**
   * Get iterable of values. For the gold store there is only one.
   * @returns {Iterable<Artefacts>}
   */
  values() {
    if (!this.#artefact || this.#artefact.costInGp === 0) {
      return [].values();
    } else {
      return [this.#artefact.clone()].values();
    }
  }

  /**
   * Create a gold coin artefact.
   * @param {number} gp
   * @returns {Artefact}
   */
  static createGoldCoinArtefact(gp) {
    const artefact = new Artefact(
      'coins',
      i18n`DESCRIPTION COINS`,
      'coins.png',
      ArtefactType.COINS
    );
    artefact.traits = new Traits([['NAME', 'Coins']]);
    artefact.costInGp = gp;
    return artefact;
  }
}

/**
 * Basic artefact.
 */
export class Artefact {
  /** @type {string} */
  id;
  /** @type {string} */
  iconImageName;
  /** @type {string} */
  description;
  /** @type {ArtefactTypeValue} */
  artefactType;
  /** @type {@module:dnd/traits/~ArtefactTraits} */
  traits;
  /** @type {AbstractInteraction} */
  interaction;

  /**
   * Create artefact.
   * @param {string} id
   * @param {string} description
   * @param {string} iconImageName
   * @param {number} artefactType - artefact enumeration
   */
  constructor(id, description, iconImageName, artefactType) {
    this.id = id;
    this.description = description;
    this.iconImageName = iconImageName;
    this.artefactType = artefactType;
  }

  /** Get the cost details.
   * @returns {module:game/coins~CoinDetails}
   */
  get costDetails() {
    const coinDefn = this.traits?.get('COST');
    return coins.getCoinDetails(coinDefn);
  }
  /**
   * Get the artefact cost in GP;
   * @returns {number}
   */
  get costInGp() {
    const coinDefn = this.traits?.get('COST');
    return coins.getValueInGp(coinDefn);
  }

  /**
   * Get the artefact sell back price in GP. Coins are sold back at normal cost.
   * @returns {number}
   */
  get sellBackPriceInGp() {
    if (this.artefactType === ArtefactType.COINS) {
      return this.costInGp;
    } else {
      return Math.round(75 * this.costInGp) / 100;
    }
  }

  /**
   * Set the artefact cost in GP;
   * @param {number} gp
   */
  set costInGp(gp) {
    if (!this.traits) {
      throw new Error('Artefact has no traits so cannot set cost.');
    }
    this.traits.set('COST', coins.getCoinDefinition(gp));
  }

  /** Get the storage space used by this artefact.
   * @returns {number}
   */
  get storageSpace() {
    return this.artefactType.storageSpace;
  }

  /**
   * Get stash store type
   * @returns {StoreTypeValue}
   */
  get stashStoreType() {
    return this.artefactType.storeType.stash;
  }

  /**
   * Get equip store type
   * @returns {StoreTypeValue}
   */
  get equipStoreType() {
    return this.artefactType.storeType.equip;
  }

  /** Convenience method to test if the stash store is a wagon.
   * @returns {boolean}
   */
  get stashInWagon() {
    return this.stashStoreType === StoreType.WAGON;
  }

  /**
   * @returns {StoreTypeValue}
   */
  getDefaultStoreType() {
    return (
      this.artefactType.storeType.stash ?? this.artefactType.storeType.equip
    );
  }

  /**
   * Get all store types
   * @returns {StoreTypeValue[]}
   */
  getStoreTypes() {
    const storeTypes = [];
    if (this.artefactType.storeType.stash) {
      storeTypes.push(this.artefactType.storeType.stash);
    }
    if (this.artefactType.storeType.equip) {
      storeTypes.push(this.artefactType.storeType.equip);
    }
    return storeTypes;
  }

  /**
   * Clone the artefact
   */
  clone() {
    const clone = new Artefact(
      this.id,
      this.description,
      this.iconImageName,
      this.artefactType
    );
    clone.traits = this.traits.clone();
    clone.value = this.value;
    return clone;
  }

  /**
   * Test if this is a magical item.
   * @returns {boolean}
   */
  isMagic() {
    return (
      this.artefactType === ArtefactType.SPELL ||
      this.artefactType === ArtefactType.CANTRIP
    );
  }

  /**
   * Test if this is a useable item.
   * @returns {boolean}
   */
  isUsable() {
    return !!this.interaction?.canReact();
  }

  /** Test if this is consumable.
   * @returns {boolean}
   */
  isConsumable() {
    return this.artefactType === ArtefactType.FOOD;
  }
}

/**
 * Storage for artefacts.
 */
export class ArtefactStoreManager {
  /** @type {Map<StoreLocation, Artefact[]} */
  #stores;

  /** @type {boolean} */
  #hasWagon;

  /** @type {function} */
  #onChange;

  /**
   * Construct artefact storage.
   * @param {boolean} hasWagon
   * @param {function()} onChange - called when there is an inventory change.
   */
  constructor(hasWagon, onChange) {
    this.#stores = new Map();
    this.#hasWagon = hasWagon;
    for (const storeTypeName in StoreType) {
      const storeType = StoreType[storeTypeName];
      this.#addStore(storeType);
    }
    this.#onChange = onChange;
  }

  /**
   * Test if this has a wagon
   */
  get hasWagon() {
    return this.#hasWagon;
  }

  /**
   * Notify change.
   */
  #notifyChange() {
    if (this.#onChange) {
      this.#onChange();
    }
  }
  /**
   *
   * @param {StoreType} storeType
   */
  #addStore(storeType) {
    if (storeType.money) {
      return this.#stores.set(
        storeType,
        new MoneyStore(storeType.space, storeType.spacesExpand)
      );
    }
    let storeValid = true;
    if (this.#hasWagon && storeType === StoreType.BACKPACK) {
      storeValid = false;
    } else if (!this.#hasWagon && storeType === StoreType.WAGON) {
      storeValid = false;
    }
    if (storeValid) {
      this.#stores.set(
        storeType,
        new ArtefactStore(storeType.space, storeType.spacesExpand, storeType)
      );
    }
  }

  /** Get a store from the store type. Note that a trader's wagon serves
   * both as a backpack and a wagon.
   * @param {StoreTypeValue} storeType
   * @returns {ArtefactStore}
   */
  getStore(storeType) {
    if (this.#hasWagon && storeType === StoreType.BACKPACK) {
      storeType = StoreType.WAGON;
    }
    return this.#stores.get(storeType);
  }
  /**
   * Get the store where an item should be stored. This is normally
   * the stash store. If a suitable stash store is not available, the equip store is
   * returned. This is because armour cannot be carried, just worn. The exception is
   * traders, who can store anything in their packs.
   * @param {Artefact}
   * @returns {ArtefactStore} null if it cannot be stored
   */
  findSuitableStore(artefact) {
    let storeType = artefact.stashStoreType;
    if (!this.#stores.has(storeType)) {
      storeType = artefact.equipStoreType;
    }
    const store = this.getStore(storeType);
    if (store?.canAdd(artefact)) {
      return store;
    }
    return null;
  }

  /**
   * @param {Artefact} artefact
   * @returns {boolean} true if successful; false if no space.
   */
  addArtefact(artefact) {
    const store = this.getStore(artefact.getDefaultStoreType());
    const result = store?.add(artefact);
    this.#notifyChange();
    return result;
  }

  /**
   * @typedef {Object} StorageDetails
   * @property {ArtefactStore} store
   * @property {Artefact} artefact
   */

  /**
   * Get the first stored artefact.
   * @returns {StorageDetails} null if nothing found
   */
  getFirstStorageDetails() {
    for (const store of this.#stores.values()) {
      const artefacts = store.values();
      const value = artefacts.next()?.value;
      if (value) {
        return { store: store, artefact: value };
      }
    }
    return null;
  }

  /** Test whether a similar artefact is stored. This is done by
   * testing the id.
   * @param {Artefact} artefact
   * @returns {boolean}
   */
  hasArtefactWithSameId(artefact) {
    const storageDetails = this.getAllStorageDetails();
    for (const details of storageDetails) {
      if (details.artefact.id === artefact.id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all equipped artefacts. This excludes magic
   * @returns {Artefact[]}
   */
  getAllEquippedArtefacts() {
    const result = [];
    const stores = [
      this.#stores.get(StoreType.HEAD),
      this.#stores.get(StoreType.BODY),
      this.#stores.get(StoreType.HANDS),
      this.#stores.get(StoreType.FEET),
      this.#stores.get(StoreType.CANTRIPS),
      this.#stores.get(StoreType.PREPARED_SPELLS),
    ];
    for (const store of stores) {
      store.values().forEach((item) => result.push(item));
    }
    return result;
  }
  /**
   * Get all stored artefacts.
   * @returns {StorageDetails[]}
   */
  getAllStorageDetails() {
    const storageDetails = [];
    this.#stores.values().forEach((store) => {
      store.values().forEach((artefact) => {
        storageDetails.push({ store: store, artefact: artefact });
      });
    });
    return storageDetails;
  }

  /**
   * Get current gold. A convenience method to access the PURSE
   * @returns {number}
   */
  getPurseValue() {
    const content = this.getStore(StoreType.PURSE).values();
    const artefact = content.next()?.value;
    return artefact ? artefact.costInGp : 0;
  }

  /** Add gold to purse.
   * @param {number} gp
   */
  addToPurse(gp) {
    const artefact = MoneyStore.createGoldCoinArtefact(gp);
    this.#stores.get(StoreType.PURSE).add(artefact);
    this.#notifyChange();
  }

  /**
   * Take gold from purse.
   * @param {number} gp - amount to take.
   * @returns {number} amount taken.
   */
  takeFromPurse(gp) {
    const artefact = MoneyStore.createGoldCoinArtefact(gp);
    const taken = this.#stores.get(StoreType.PURSE).take(artefact);
    this.#notifyChange();
    return taken.costInGp;
  }

  /**
   * Convenience method to get contents of a store.
   *
   * @param {StoreTypeValue} storeType
   * @returns {Iterable<Artefact>} null if empty
   */
  getStoreContents(storeType) {
    const store = this.getStore(storeType);
    return !store || store.isEmpty() ? null : store.values();
  }

  /**
   * Discard an artefact that has been equipped or stashed.
   * @param {Artefact} artefact
   * @returns {boolean} true on success.
   */
  discard(artefact) {
    if (this.discardStashed(artefact, true)) {
      return true;
    } else {
      return this.discardEquipped(artefact);
    }
  }
  /**
   * Discard an artefact that has been equipped.
   * @param {Artefact} artefact
   * @param {boolean} quiet
   * @returns {boolean} true on success.
   */
  discardEquipped(artefact, quiet) {
    const equipStore = this.getStore(artefact.equipStoreType);
    if (!equipStore) {
      if (!quiet) {
        LOG.error("Cannot discard artefact as there isn't an equip store.");
      }
      return false;
    }
    if (!equipStore.take(artefact)) {
      if (!quiet) {
        LOG.error('Artefact could not be found so not discarded.');
      }
      return false;
    }
    this.#notifyChange();
    return true;
  }
  /**
   * Discard an artefact that has been stashed.
   * @param {Artefact} artefact
   * @param {boolean} quiet
   * @returns {boolean} true on success.
   */
  discardStashed(artefact, quiet) {
    const stashStore = this.getStore(artefact.stashStoreType);
    if (!stashStore) {
      if (!quiet) {
        LOG.error("Cannot discard artefact as there isn't a stash store.");
      }
      return false;
    }
    if (!stashStore.take(artefact)) {
      if (!quiet) {
        LOG.error('Artefact could not be found so not discarded.');
      }
      return false;
    }
    this.#notifyChange();
    return true;
  }

  /**
   * Equip artefact. The artefact should normally exist in the stash unless
   * the options.direct flag is set.
   * If space is required, artefacts will be unequipped to make space.
   * @param {Artefact} artefact
   * @param {Object} options
   * @param {boolean} direct - if true, this can be a new object that does not
   * exist in the stash.
   * @returns {boolean} true on success.
   */
  equip(artefact, options = {}) {
    const stashStore = this.getStore(artefact.stashStoreType);
    const equipStore = this.getStore(artefact.equipStoreType);
    if (!stashStore && !options.direct) {
      LOG.error(
        'Cannot equip artefact as there isn`t a stash store to take it from.'
      );
      return false;
    }
    if (!equipStore) {
      LOG.error("Cannot equip artefact as there isn't an equip store.");
      return false;
    }
    const spaceRequired = artefact.storageSpace;
    if (spaceRequired > equipStore.maxSpace) {
      LOG.error('The equip store cannot hold this item.');
      return false;
    }

    const takenArtefact = stashStore?.take(artefact);
    if (!takenArtefact && !options.direct) {
      LOG.error('Could not find artefact in the stash.');
      return false;
    }

    while (equipStore.freeSpace < spaceRequired) {
      const unequiped = equipStore.takeFirst();
      stashStore?.add(unequiped);
    }

    const result = equipStore.add(artefact);
    this.#notifyChange();
    return result;
  }

  /**
   * Unequip and stash artefact. The artefact should normally exist in the equip store unless
   * the options.direct flag is set.
   * If space is required in the stash, the attempt fails.
   * @param {Artefact} artefact
   * @param {Object} options
   * @param {boolean} direct - if true, this can be a new object that does not
   * exist in the stash.
   * @returns {boolean} true on success.
   */
  stash(artefact, options = {}) {
    const stashStore = this.getStore(artefact.stashStoreType);
    const equipStore = this.getStore(artefact.equipStoreType);
    if (!stashStore) {
      LOG.info(
        'Cannot stash artefact as there isn`t a suitable stash store to put it in.'
      );
      return false;
    }
    if (!equipStore && !options.direct) {
      LOG.error(
        'No suitable equip store found. If stashing a new artefact, the direct option should be set.'
      );
      return false;
    }
    const spaceRequired = artefact.storageSpace;
    if (spaceRequired > stashStore.freeSpace) {
      LOG.error('The stash store cannot hold this item.');
      return false;
    }
    const takenArtefact = equipStore?.take(artefact);
    if (!takenArtefact && !options.direct) {
      LOG.error("The artefact hasn't been equipped so can't unequip it.");
      return false;
    }
    const result = stashStore.add(artefact);
    this.#notifyChange();
    return result;
  }
}

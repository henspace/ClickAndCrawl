/**
 * @file Artefacts
 * Artefacts are items that exist in the game but are never rendered in the
 * tile map. They can be stored, or worn. Examples are money and weapons. They can
 * be held by actors, typically a trader or hiddenArtefact.
 * @module utils/game/artefacts
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

import LOG from '../logging.js';

/**
 * @typedef {Object} StoreTypeValue
 * @property {number} space - amount of space in store.
 * @property {boolean} gold - if true, a GoldStore is used.
 * @property {boolean} spacesExpand - if true every artefact takes one space.
 */

/**
 * Enumeration of store types.
 * @enum {StoreTypeValue}
 */
export const StoreType = {
  HEAD: { space: 1, gold: false, spacesExpand: false },
  BODY: { space: 1, gold: false, spacesExpand: false },
  HANDS: { space: 2, gold: false, spacesExpand: false },
  FEET: { space: 2, gold: false, spacesExpand: false },
  BACKPACK: { space: 8, gold: false, spacesExpand: true },
  PURSE: { space: Number.MAX_SAFE_INTEGER, gold: true, spacesExpand: false },
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
  FOOD: {
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK },
  },
  SPELL: {
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK },
  },
  WEAPON: {
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
  GOLD: { storageSpace: 0, storeType: { stash: StoreType.PURSE } },
};

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

  /** Create store.
   * @param {number} maxSize;
   * @param {boolean} spacesExpand - if true, each space can take an artefact of
   * any size.
   */
  constructor(maxSize, spacesExpand) {
    this.#maxSize = maxSize;
    this.#usedSpace = 0;
    this.#artefacts = new Map();
    this.#spacesExpand = spacesExpand;
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

  /**
   *
   * @param {Artefact} artefact
   * @returns {boolean} true if stored; false if no room.
   */
  add(artefact) {
    const space = this.#maxSize - this.#usedSpace;
    const requiredSpace = this.#spacesExpand ? 1 : artefact.storageSpace;
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
    const requiredSpace = this.#spacesExpand ? 1 : storedArtefact.storageSpace;
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
   * @returns {Iterable}
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
    return this.#maxSize - this.#usedSpace > artefact.storageSpace;
  }
}

/**
 * Gold storage. This effectively merges artifacts into one combining the GC trait.
 * The last added artefact is used as the template
 * @implements {StoreInterface}
 */
class GoldStore {
  #artefact;

  /** Create store.
   * @param {number} maxSize;
   */
  constructor() {}

  /**
   * Test if empty
   * @override
   * @returns {boolean}
   */
  isEmpty() {
    return !this.#artefact;
  }
  /**
   * @override
   */
  add(artefact) {
    if (!this.#artefact) {
      this.#artefact = artefact.clone();
    } else {
      this.#artefact.value += artefact.value;
    }
  }

  /**
   * Retrieve an artefact.
   * @param {Artefact} artefact
   * @returns {Artefact} value set to value of gold taken.
   */
  take(artefact) {
    const taken = Math.min(this.#artefact.value, artefact.value);
    this.#artefact.value -= taken;
    const result = this.#artefact.clone();
    return result;
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
   * @returns {Artefact[]}
   */
  values() {
    if (!this.#artefact || this.#artefact.value === 0) {
      return [];
    } else {
      return [this.#artefact.clone()];
    }
  }
}

/**
 * Basic artefact.
 */
export class Artefact {
  /** mark up price when buying from trader */
  static MARK_UP = 1.5;
  /** mark down price when selling back to a trader */
  static MARK_DOWN = 0.5;

  /** @type {string} */
  iconImageName;
  /** @type {string} */
  description;
  /** @type {ArtefactTypeValue} */
  artefactType;
  /** Value of the artefact in gold coins. @type {number} */
  value;
  /** @type {@module:dnd/traits/~ArtefactTraits} */
  traits;

  /**
   * Create artefact.
   * @param {string} description
   * @param {string} iconImageName
   * @param {number} artefactType - artefact enumeration
   */
  constructor(description, iconImageName, artefactType) {
    this.description = description;
    this.iconImageName = iconImageName;
    this.artefactType = artefactType;
    this.value = 0;
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

  /**
   * Get the buying price.
   * @returns {number}
   */
  getPriceToBuyFromTrader() {
    return Math.floor(Artefact.MARK_UP * this.value);
  }
  /**
   * Get the buying price.
   * @returns {number}
   */
  getPriceToSellToTrader() {
    return Math.floor(Artefact.MARK_DOWN * this.value);
  }

  /**
   * @returns {StoreTypeValue}
   */
  getDefaultStoreType() {
    return this.artefactType.storeType.stash;
  }

  /**
   * Get all store types
   * @returns {StoreTypeValue[]}
   */
  getStoreTypes() {
    const storeTypes = [this.artefactType.storeType.stash];
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
      this.description,
      this.iconImageName,
      this.artefactType
    );
    clone.traits = this.traits.clone();
    clone.value = this.value;
    return clone;
  }
}

/**
 * Storage for artefacts.
 */
export class ArtefactStoreManager {
  /** @type {Map<StoreLocation, Artefact[]} */
  #stores;

  /**
   * Construct artefact storage.
   */
  constructor() {
    this.#stores = new Map();
    for (const storeTypeName in StoreType) {
      const storeType = StoreType[storeTypeName];
      if (storeType.gold) {
        this.#stores.set(
          storeType,
          new GoldStore(storeType.space, storeType.spacesExpand)
        );
      } else {
        this.#stores.set(
          storeType,
          new ArtefactStore(storeType.space, storeType.spacesExpand)
        );
      }
    }
  }

  /**
   * Test of an artefact can be stored anywhere.
   * @param {Artefact}
   * @returns {ArtefactStore} null if it cannot be stored
   */
  findSuitableStore(artefact) {
    for (const storeType of artefact.getStoreTypes()) {
      const store = this.#stores.get(storeType);
      if (store.canAdd(artefact)) {
        return store;
      }
    }
    return null;
  }

  /**
   * @param {Artefact} artefact
   * @returns {boolean} true if successful; false if no space.
   */
  addArtefact(artefact) {
    const store = this.#stores.get(artefact.getDefaultStoreType());
    return store.add(artefact);
  }

  /**
   * @typedef {Object} StorageDetails
   * @property {ArtefactStore} store
   * @property {Artefact} artefact
   */

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
    const content = this.#stores.get(StoreType.PURSE).values();
    return content.length > 0 ? content[0].value : 0;
  }

  /**
   * Convenience method to get contents of a store.
   *
   * @param {StoreTypeValue} storeType
   * @returns {Iterable<Artefact>} null if empty
   */
  getStoreContents(storeType) {
    const store = this.#stores.get(storeType);
    return store.isEmpty() ? null : store.values();
  }

  /**
   * Discard an artefact that has been equipped.
   * @param {Artefact} artefact
   * @returns {boolean} true on success.
   */
  discardEquipped(artefact) {
    const equipStore = this.#stores.get(artefact.equipStoreType);
    if (!equipStore) {
      LOG.error("Cannot discard artefact as there isn't an equip store.");
      return false;
    }
    if (!equipStore.take(artefact)) {
      LOG.error('Artefact could not be found so not discarded.');
      return false;
    }
    return true;
  }
  /**
   * Discard an artefact that has been stashed.
   * @param {Artefact} artefact
   * @returns {boolean} true on success.
   */
  discardStashed(artefact) {
    const stashStore = this.#stores.get(artefact.stashStoreType);
    if (!stashStore) {
      LOG.error("Cannot discard artefact as there isn't a stash store.");
      return false;
    }
    if (!stashStore.take(artefact)) {
      LOG.error('Artefact could not be found so not discarded.');
      return false;
    }
    return true;
  }

  /**
   * Equip artefact. The artefact should exist in the stash.
   * If space is required, artefacts will be unequipped to make space.
   * @param {Artefact} artefact
   * @returns {boolean} true on success.
   */
  equip(artefact) {
    const stashStore = this.#stores.get(artefact.stashStoreType);
    const equipStore = this.#stores.get(artefact.equipStoreType);
    if (!stashStore) {
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
    const takenArtefact = stashStore.take(artefact);
    if (!takenArtefact) {
      LOG.error('Could not find artefact in the stash.');
      return false;
    }

    while (equipStore.freeSpace < spaceRequired) {
      const unequiped = equipStore.takeFirst();
      stashStore.add(unequiped);
    }
    equipStore.add(artefact);
    return true;
  }

  /**
   * Unequip artefact. The artefact should exist in the equip store.
   * If space is required in the stash, the attempt fails.
   * @param {Artefact} artefact
   * @returns {boolean} true on success.
   */
  unequip(artefact) {
    const stashStore = this.#stores.get(artefact.stashStoreType);
    const equipStore = this.#stores.get(artefact.equipStoreType);
    if (!stashStore) {
      LOG.error(
        'Cannot unequip artefact as there isn`t a stash store to put it in.'
      );
      return false;
    }
    if (!equipStore) {
      LOG.error(
        "Cannot unequip artefact as there isn't an equip store to take it from."
      );
      return false;
    }
    const spaceRequired = artefact.storageSpace;
    if (spaceRequired > stashStore.freeSpace) {
      LOG.error('The stash store cannot hold this item.');
      return false;
    }
    const takenArtefact = equipStore.take(artefact);
    if (!takenArtefact) {
      LOG.error("The artefact hasn't been equipped so can't unequip it.");
      return false;
    }
    stashStore.add(artefact);
    return true;
  }
}

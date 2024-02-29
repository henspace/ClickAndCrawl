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
import * as maths from '../maths.js';

/**
 * @typedef {Object} StoreTypeValue
 * @property {number} space - amount of space in store.
 * @property {boolean} gold - if true, a GoldStore is used.
 */

/**
 * Enumeration of store types.
 * @enum {StoreTypeValue}
 */
export const StoreType = {
  HEAD: { space: 1, gold: false },
  BODY: { space: 1, gold: false },
  HANDS: { space: 2, gold: false },
  FEET: { space: 2, gold: false },
  BACKPACK: { space: 8, gold: false },
  PURSE: { space: Number.MAX_SAFE_INTEGER, gold: true },
};

/**
 * @typedef {Object} ArtefactTypeValue
 * @property {number} storageSpace - how much storage is used.
 * @property {StoreTypeValue} storeTypes - how much storage is used.
 */
/**
 * Enumeration of artefact types
 * @enum {ArtefactTypeValue}
 */
export const ArtefactType = {
  WEAPON: {
    storageSpace: 1,
    storeTypes: [StoreType.BACKPACK, StoreType.HANDS],
  },
  TWO_HANDED_WEAPON: {
    storageSpace: 2,
    storeTypes: [StoreType.BACKPACK, StoreType.HANDS],
  },
  GOLD: { storageSpace: 0, storeTypes: [StoreType.PURSE] },
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

  /** Create store.
   * @param {number} maxSize;
   */
  constructor(maxSize) {
    this.#maxSize = maxSize;
    this.#usedSpace = 0;
    this.#artefacts = new Map();
  }

  /**
   *
   * @param {Artefact} artefact
   * @returns {boolean} true if stored; false if no room.
   */
  add(artefact) {
    const space = this.#maxSize - this.#usedSpace;
    if (space >= artefact.storageSpace) {
      this.#artefacts.set(artefact, artefact);
      this.#usedSpace += artefact.storageSpace;
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
    if (storedArtefact) {
      this.#usedSpace -= storedArtefact.storageSpace;
    }
    return storedArtefact;
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
    return [this.#artefact.clone()];
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
  }

  /** Get the storage space used by this artefact.
   * @returns {number}
   */
  get storageSpace() {
    return this.artefactType.storageSpace;
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
    return this.artefactType.storeTypes[0];
  }

  /**
   * Get all store types
   * @returns {StoreTypeValue[]}
   */
  getStoreTypes() {
    return this.artefactType.storeTypes;
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
        this.#stores.set(storeType, new GoldStore(storeType.space));
      } else {
        this.#stores.set(storeType, new ArtefactStore(storeType.space));
      }
    }
  }

  /**
   * Test of an artefact can be stored anywhere.
   * @param {Artefact}
   * @returns {boolean}
   */
  canAdd(artefact) {
    for (const storeType of artefact.getStoreTypes()) {
      if (this.#stores.get(storeType).canAdd(artefact)) {
        return true;
      }
    }
    return false;
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
   * Get all stored artefacts.
   * @returns {Artefact[]}
   */
  getAllArtefacts() {
    const artefacts = [];
    this.#stores.values().forEach((store) => {
      store.values().forEach((artefact) => {
        artefacts.push(artefact);
      });
    });
    return artefacts;
  }
}

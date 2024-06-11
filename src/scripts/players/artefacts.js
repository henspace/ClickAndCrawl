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
import * as coins from '../utils/game/coins.js';
import { buildArtefact } from '../dnd/almanacs/artefactBuilder.js';
import { parseAlmanacLine } from '../dnd/almanacs/almanacs.js';

/**
 * @typedef {Object} StoreTypeValue
 * @property {number} space - amount of space in store.
 * @property {boolean} money - if true, a MoneyStore is used.
 * @property {boolean} spacesExpand - if true every artefact takes one space.
 */

/** @type {number} */
const UNKNOWN_ARTEFACT_COST_GP = 0.08;
/**
 * Enumeration of store types.
 * @enum {StoreTypeValue}
 */
export const StoreType = {
  HEAD: { id: 'HEAD', space: 1, money: false, spacesExpand: false },
  BODY: { id: 'BODY', space: 1, money: false, spacesExpand: false },
  WAIST: { id: 'WAIST', space: 1, money: false, spacesExpand: false },
  HANDS: { id: 'HANDS', space: 2, money: false, spacesExpand: false },
  FEET: { id: 'FEET', space: 2, money: false, spacesExpand: false },
  BACKPACK: { id: 'BACKPACK', space: 8, money: false, spacesExpand: true },
  WAGON: { id: 'WAGON', space: 8, money: false, spacesExpand: true },
  CANTRIPS: { id: 'CANTRIPS', space: 999, money: false, spacesExpand: true },
  RING_FINGERS: {
    id: 'RING_FINGERS',
    space: 2,
    money: false,
    spacesExpand: false,
  },
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
    id: 'armour',
    storageSpace: 1,
    storeType: { stash: StoreType.WAGON, equip: StoreType.BODY },
  },
  BELT: {
    id: 'belt',
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.WAIST },
  },
  CANTRIP: {
    id: 'cantrip',
    storageSpace: 1,
    storeType: { stash: null, equip: StoreType.CANTRIPS },
  },
  COINS: {
    id: 'coins',
    storageSpace: 0,
    storeType: { stash: StoreType.PURSE },
  },
  CONSUMABLE: {
    id: 'consumable',
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK },
  },
  GENERIC: {
    id: 'generic',
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK },
  },
  HEAD_GEAR: {
    id: 'head_gear',
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.HEAD },
  },
  KEY: {
    id: 'key',
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK },
  },
  RING: {
    id: 'ring',
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.RING_FINGERS },
  },
  SHIELD: {
    id: 'shield',
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.HANDS },
  },
  SPELL: {
    id: 'spell',
    storageSpace: 1,
    storeType: { stash: StoreType.SPELLS, equip: StoreType.PREPARED_SPELLS },
  },
  TRAP: {
    id: 'trap',
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK },
  },
  TWO_HANDED_WEAPON: {
    id: 'two_handed_weapon',
    storageSpace: 2,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.HANDS },
  },
  WEAPON: {
    id: 'weapon',
    storageSpace: 1,
    storeType: { stash: StoreType.BACKPACK, equip: StoreType.HANDS },
  },
};

/**
 * Create artefactType from id.
 * @param {string} id
 * @returns {ArtefactType}
 */
export function createArtefactType(id) {
  return ArtefactType[id.toUpperCase()];
}
/**
 * Compare two artefact types
 * @param {ArtefactType} itemA
 * @param {ArtefactType} itemB
 * @returns {boolean}
 */
export function artefactTypesEqual(itemA, itemB) {
  return itemA?.id === itemB?.id;
}

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
 * @property {string} StoreInterface.storeTypeId
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
   * Get store type ID
   * @returns {string}
   */
  get storeTypeId() {
    return this.#storeType.id;
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
   * Adjust capacity. Note it cannot be reduced below the number of items already
   * contained.
   * @param {number} capacity
   * @returns {number} resulting capacity
   */
  adjustCapacity(capacity) {
    this.#maxSize = Math.max(capacity, this.#usedSpace);
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
   * Get the first element. It isn't removed from storage
   * @returns {Artefact} null if empty.
   */
  getFirst() {
    if (this.isEmpty()) {
      return null;
    }
    return this.#artefacts.values().next().value;
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
 * Gold storage. This effectively merges artifacts into one combining the VALUE trait.
 * Note that if only one artefact is added, it is returned. Once more than one has been
 * added a composite money artefact is returned.
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
   * Get store type Id
   * @returns {StoreType}
   */
  get storeTypeId() {
    return StoreType.PURSE.id;
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
    const almanacEntry = parseAlmanacLine(
      `0,COMMON,COINS,gold_coins * VALUE:${gp}GP`
    );
    const artefact = buildArtefact(almanacEntry);
    artefact.costInGp = gp;
    return artefact;
  }
}

/**
 * Basic artefact.
 * @implements {module:players/actors~TraitsHolder}
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
  /** @type {module:dnd/traits~ArtefactTraits} */
  traits;
  /** @type {AbstractInteraction} */
  interaction;
  /** @type {module:dnd/almanacs/almanacs~AlmanacEntry} */
  almanacEntry;
  /** @type {boolean} */
  unknown;

  /**
   * Create artefact.
   * @param {AlmanacEntry} almanacEntry
   * @param {string} description
   * @param {string} iconImageName
   * @param {number} artefactType - artefact enumeration
   * @param {string} unknownDescription - description if not identified. If null
   * or undefined or '' the artefact is regarded as identified.
   */
  constructor(almanacEntry, description, iconImageName, unknownDescription) {
    this.id = almanacEntry.id;
    this.description = description;
    this.iconImageName = iconImageName;
    this.artefactType = almanacEntry.type;
    this.almanacEntry = almanacEntry;
    this.unknownDescription = unknownDescription;
    this.unknown = !!unknownDescription;
  }

  /** Get the cost details.
   * @returns {module:game/coins~CoinDetails}
   */
  get costDetails() {
    const coinDefn = this.traits?.get('VALUE');
    return coins.getCoinDetails(coinDefn);
  }
  /**
   * Get the artefact cost in GP;
   * @returns {number}
   */
  get costInGp() {
    if (this.unknown) {
      return UNKNOWN_ARTEFACT_COST_GP;
    }
    const coinDefn = this.traits?.get('VALUE');
    return coins.getValueInGp(coinDefn);
  }

  /**
   * Get the artefact sell back price in GP. Coins are sold back at normal cost.
   * @returns {number}
   */
  get sellBackPriceInGp() {
    if (artefactTypesEqual(this.artefactType, ArtefactType.COINS)) {
      return this.costInGp;
    } else {
      const cost = this.unknown ? UNKNOWN_ARTEFACT_COST_GP : this.costInGp;
      return Math.round(50 * cost) / 100; // 50% from p62 SRD 5.1
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
    this.traits.set('VALUE', coins.getCoinDefinition(gp));
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
      this.almanacEntry,
      this.description,
      this.iconImageName,
      this.unknownDescription
    );
    clone.traits = this.traits.clone();
    clone.value = this.value;
    clone.unknown = this.unknown;
    return clone;
  }

  /**
   * Test if this is a magical item.
   * @returns {boolean}
   */
  isMagic() {
    return (
      artefactTypesEqual(this.artefactType, ArtefactType.SPELL) ||
      artefactTypesEqual(this.artefactType, ArtefactType.CANTRIP)
    );
  }

  /**
   * Test if this is a trap item.
   * @returns {boolean}
   */
  isTrap() {
    return artefactTypesEqual(this.artefactType, ArtefactType.TRAP);
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
    return artefactTypesEqual(this.artefactType, ArtefactType.CONSUMABLE);
  }

  /**
   * Convert to JSON.
   * @returns {module:utils/persistentData~ObjectJSON}
   */
  toJSON() {
    return {
      reviver: 'Artefact',
      data: {
        almanacEntry: this.almanacEntry,
        traits: this.traits,
        unknown: this.unknown,
      },
    };
  }

  /**
   * Revive from previous call to toJSON
   * @param {Array.Array<key,value>} data - array of map values
   * @param {function(module:dnd/almanacs~AlmanacEntry,module:dnd/traits.Traits)} builder
   * @returns {Artefact}
   */
  static revive(data, builder) {
    data.almanacEntry.type = createArtefactType(data.almanacEntry.type.id);
    const artefact = builder(data.almanacEntry, data.traits);
    artefact.unknown = data.unknown;
    return artefact;
  }
}

/**
 * Storage for artefacts.
 */
export class ArtefactStoreManager {
  /** @type {Map<StoreLocation, Artefact[]>} */
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

  /** Get a store from the store type. Note that a trader's wagon serves
   * both as a backpack and a wagon.
   * @param {string} storeId
   * @returns {ArtefactStore} null if not found
   */
  getStoreByTypeId(storeTypeId) {
    for (const store of this.#stores.values()) {
      if (store.storeTypeId === storeTypeId) {
        return store;
      }
    }
    return null;
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
    let store = this.getStore(storeType);
    if (!store) {
      storeType = artefact.equipStoreType;
      store = this.getStore(storeType);
    }
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
   * @param {Artefact | string} artefactOrId
   * @returns {boolean}
   */
  hasArtefactWithSameId(artefactOrId) {
    const id =
      typeof artefactOrId === 'string' ? artefactOrId : artefactOrId.id;
    const storageDetails = this.getAllStorageDetails();
    for (const details of storageDetails) {
      if (details.artefact.id === id) {
        return true;
      }
    }
    return false;
  }

  /** Test whether a specific artefact is stored.
   * @param {Artefact} artefact
   * @returns {boolean}
   */
  hasArtefact(artefact) {
    const storageDetails = this.getAllStorageDetails();
    for (const details of storageDetails) {
      if (details.artefact === artefact) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all equipped artefacts.
   * @returns {Artefact[]}
   */
  getAllEquippedArtefacts() {
    const result = [];
    const stores = [
      this.#stores.get(StoreType.HEAD),
      this.#stores.get(StoreType.BODY),
      this.#stores.get(StoreType.WAIST),
      this.#stores.get(StoreType.HANDS),
      this.#stores.get(StoreType.RING_FINGERS),
      this.#stores.get(StoreType.FEET),
      this.#stores.get(StoreType.CANTRIPS),
      this.#stores.get(StoreType.PREPARED_SPELLS),
    ];
    for (const store of stores) {
      for (const item of store.values()) {
        result.push(item);
      }
    }
    return result;
  }
  /**
   * Get all stored artefacts.
   * @returns {StorageDetails[]}
   */
  getAllStorageDetails() {
    const storageDetails = [];
    this.#stores.forEach((store) => {
      for (const artefact of store.values()) {
        storageDetails.push({ store: store, artefact: artefact });
      }
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
   * @param {boolean} noAutoUnequip - if true, items will not be unequipped to accommodate this.
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
    const spaceRequired = equipStore.getRequiredSpace(artefact);
    if (spaceRequired > equipStore.maxSpace) {
      LOG.error('The equip store cannot hold this item.');
      return false;
    }

    if (!stashStore?.has(artefact) && !options.direct) {
      LOG.error('Could not find artefact in the stash.');
      return false;
    }

    if (!equipStore.canAdd(artefact) && options.noAutoUnequip) {
      LOG.error('No space to equip and no automatic unequipping permitted.');
      return false;
    }
    const result = this.#autoEquip(artefact, equipStore, stashStore);
    this.#notifyChange();
    return result;
  }

  /**
   * Add artefact to the equip store, unequipping existing items if necessary.
   * @param {Artefact} artefact
   * @param {ArtefactStore} equipStore
   * @param {ArtefactStore} stashStore
   * @returns {boolean} true on success.
   */
  #autoEquip(artefact, equipStore, stashStore) {
    const requiredEquipSpace = equipStore.getRequiredSpace(artefact);
    if (requiredEquipSpace > equipStore.maxSpace) {
      LOG.error('The equip store cannot hold this item.');
      return false;
    }

    if (!stashStore) {
      return equipStore.add(artefact);
    }

    let stashSpace =
      stashStore.freeSpace + stashStore.getRequiredSpace(artefact);

    const unequipedItems = [];
    while (equipStore.freeSpace < requiredEquipSpace && stashSpace > 0) {
      const unequipedItem = equipStore.takeFirst();
      unequipedItems.push(unequipedItem);
      stashSpace -= stashStore.getRequiredSpace(unequipedItem);
    }

    if (equipStore.freeSpace < requiredEquipSpace) {
      // failed. Put back the unequiped items.
      for (const item of unequipedItems) {
        equipStore.add(item);
      }
      return false;
    } else {
      stashStore.take(artefact);
      equipStore.add(artefact);
      for (const item of unequipedItems) {
        stashStore.add(item);
      }
      return true;
    }
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
      LOG.debug(
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

    if (!stashStore.canAdd(artefact)) {
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

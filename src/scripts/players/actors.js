/**
 * @file Actor classes. Actors encapsulate a Sprite and represent moving objects
 * that can interact with the game.
 *
 * @module players/actors
 */
/**
 * License {@link https://opensource.org/license/mit/|MIT}
 *
 * Copyright 2024 Steve Butler
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

import { AbstractInteraction, Toxify } from '../dnd/interact.js';
import { UiClickHandler } from '../utils/ui/interactions.js';
import { ArtefactStoreManager, ArtefactType } from './artefacts.js';
import * as dice from '../utils/dice.js';
import LOG from '../utils/logging.js';

/**
 * @typedef {Map<string, *>} Traits
 */

/**
 * @typedef {Object} TraitsHolder
 * @property {Traits} traits
 */

/**
 * @typedef {number} ActorTypeValue
 */
/** @enum{ActorTypeValue} */
export const ActorType = {
  HERO: 0,
  ENEMY: 1,
  ARTEFACT: 2,
  HIDDEN_ARTEFACT: 3,
  TRADER: 4,
  PROP: 5,
  OBJECTIVE: 6,
};

/**
 * @typedef {string} AttackModeValue
 */
/** @enum{AttackModeValue} */
export const AttackMode = {
  COMBAT: 'COMBAT',
  COMBO: 'COMBO', // melee and poison.
  POISON: 'POISON',
  MAGIC: 'MAGIC',
  RANGED: 'RANGED',
};

/**
 * @typedef {string} MoveTypeValue
 */
/**
 * @enum {MoveTypeValue}
 */
export const MoveType = {
  WANDER: 'WANDER',
  HUNT: 'HUNT',
  ORGANIC: 'ORGANIC',
};

/**
 * Convert a string to an ActorType
 * @param {string} str - actor type as string but excluding the ActorType.
 * E.g. HERO.
 * @returns {ActorType} null if invalid.
 */
export function strToActorType(str) {
  const type = ActorType[str];
  if (type === null || type === undefined) {
    LOG.error(`Unrecognised actor type: ${str}`);
  }
  return type;
}

/**
 * Actor class. An actor is a sprite that exists in the world and can interact
 * with other actors.
 * @implements {TraitsHolder}
 */
export class Actor extends UiClickHandler {
  /** @type {module:dnd/almanacs/almanacs~AlmanacEntry} */
  almanacEntry;
  /** @type {boolean} */
  #frozen;
  /** @type {module:utils/sprites/sprite~Sprite} */
  sprite;
  /** @type {Traits} */
  traits;
  /** @type {module:dnd/interact.AbstractInteraction} */
  interaction;
  /** @type {module:dnd/interact.Toxify} */
  toxify;
  /** @type {boolean} */
  alive;
  /** True if actor is disengaging from a fight. @type {boolean} */
  disengaging;
  /** @type {string} */
  description;
  /** @type {string} */
  iconImageName;
  /** @type {ArtefactStoreManager} */
  storeManager;
  /** @type {ActorType} */
  type;
  /** @type {number} */
  adventureStartTime;

  /**
   * Create the actor.
   * @param {module:utils/sprites/sprite~Sprite} sprite
   * @param {number} [type = ActorType.ENEMY] type of actor. See @link {ActorType}
   */
  constructor(sprite, type = ActorType.ENEMY) {
    super();
    this.interaction = new AbstractInteraction();
    this.sprite = sprite;
    this.sprite.obstacle = true;
    this.#frozen = false;
    this.alive = true;
    this.disengaging = false;
    this.type = type;
    this.storeManager = new ArtefactStoreManager(
      type === ActorType.TRADER || type === ActorType.HIDDEN_ARTEFACT,
      () => this.#updateTraitsFromStore()
    );
    if (type === ActorType.HERO) {
      this.adventureStartTime = new Date().getTime();
    }
  }

  /**
   * Refresh DnD properties.
   */
  #updateTraitsFromStore() {
    const items = this.storeManager.getAllEquippedArtefacts();
    const weapons = items.filter(
      (artefact) =>
        artefact.artefactType === ArtefactType.WEAPON ||
        artefact.artefactType === ArtefactType.TWO_HANDED_WEAPON
    );
    const armour = items.filter(
      (artefact) => artefact.artefactType === ArtefactType.ARMOUR
    );
    const shields = items.filter(
      (artefact) => artefact.artefactType === ArtefactType.SHIELD
    );
    const magic = items.filter(
      (artefact) =>
        artefact.isMagic() ||
        artefact.artefactType === ArtefactType.RING ||
        artefact.artefactType === ArtefactType.BELT ||
        artefact.artefactType === ArtefactType.HEAD_GEAR
    );
    this.traits.utiliseAdditionalTraits({
      weapons: weapons.map((artefact) => artefact.traits),
      armour: armour.map((artefact) => artefact.traits),
      shields: shields.map((artefact) => artefact.traits),
      magic: magic.map((artefact) => artefact.traits),
    });
  }

  /**
   * Freeze any movement.
   */
  freezeMovement() {
    this.#frozen = true;
  }
  /**
   * Get max tiles per move
   */
  getMaxTilesPerMove() {
    return this.#frozen ? 0 : this.traits.getMaxTilesPerMove();
  }
  /**
   * Test if this actor is the hero.
   * @returns {boolean}
   */
  isHero() {
    return this.type === ActorType.HERO;
  }

  /**
   * Test if this actor is an enemy.
   * @returns {boolean}
   */
  isEnemy() {
    return this.type === ActorType.ENEMY;
  }

  /**
   * Test if this actor is a trader.
   * @returns {boolean}
   */
  isTrader() {
    return this.type === ActorType.TRADER;
  }

  /**
   * Test if this actor is a hidden artefact.
   * @returns {boolean}
   */
  isHiddenArtefact() {
    return this.type === ActorType.HIDDEN_ARTEFACT;
  }

  /** Set the underlying sprite visibility.
   * @param {boolean}
   */
  set visible(value) {
    this.sprite.visible = value;
  }

  /** Get the underlying sprite visibility.
   * @returns {boolean}
   */
  get visible() {
    return this.sprite.visible;
  }
  /**
   * Get obstacle property. This comes from the underlying sprite.
   * @param {boolean} value
   */
  get obstacle() {
    return this.sprite.obstacle;
  }

  /**
   * Set as obstacle. This sets the underlying sprite's property.
   * @param {boolean} value
   */
  set obstacle(value) {
    this.sprite.obstacle = value;
  }

  /**
   * Get the actor's position.
   * @returns {module:utils/geometry~Position}
   */
  get position() {
    return this.sprite.position;
  }

  /**
   * Set the actor's position.
   * @param {module:utils/geometry~Position} value
   */
  set position(value) {
    this.sprite.position = value;
  }

  /**
   * Get the current motion.
   * @returns {Velocity}
   */

  get velocity() {
    return this.sprite.velocity;
  }

  /**
   * Set the current Velocity. Invalid values become 0.
   * @param {Velocity} nextVelocity
   */
  set velocity(nextVelocity) {
    this.sprite.velocity = nextVelocity;
  }

  /**
   * Get the sprite's image name.
   * @returns {string} null if none.
   */
  getImageFilename() {
    return this.sprite.getImageFilename();
  }

  /**
   * Is this a wandering actor.
   * @returns {boolean}
   */
  isWandering() {
    return this.traits?.get('MOVE') === MoveType.WANDER;
  }

  /**
   * Is this an organic actor.
   * @returns {boolean}
   */
  isOrganic() {
    return this.traits?.get('MOVE') === MoveType.ORGANIC;
  }

  /**
   * Is this a prop.
   * @returns {boolean}
   */
  isProp() {
    return this?.type === ActorType.PROP;
  }

  /**
   * Is this an objective
   * @returns {boolean}
   */
  isObjective() {
    return this?.type === ActorType.OBJECTIVE;
  }

  /**
   * Get the move type
   * @returns {MoveTypeValue}
   */
  get moveType() {
    return this?.traits.get('MOVE');
  }

  /**
   * Get the attack mode
   * @returns {AttackModeValue} defaults to combat
   */
  get attackMode() {
    return this?.traits.get('ATTACK', AttackMode.COMBAT);
  }

  /**
   * Test if the actor will interact.
   * @returns {boolean}
   */
  willInteract() {
    if (!this.interaction) {
      return false;
    }
    if (this.isWandering()) {
      return dice.rollDice(6) > 3;
    }
    return true;
  }

  /**
   * Is the actor passable?
   * @param {Actor} otherActor
   * @returns {boolean}
   */
  isPassableByActor(otherActor) {
    if (otherActor.isHero() && this.isHiddenArtefact()) {
      return true;
    } else {
      return (!this.alive && !this.isProp()) || !this.obstacle;
    }
  }

  /**
   * Can it share a tile location with another actor?
   * @param {Actor} otherActor
   * @returns {boolean}
   */
  canShareLocationWithActor(otherActor) {
    if (this.isOrganic()) {
      return !otherActor.isOrganic() && !otherActor.isTrader(); // don't kill off traders.
    } else if (this.isHiddenArtefact()) {
      return otherActor.isHero();
    } else if (!this.alive && otherActor.isHero()) {
      return true;
    } else {
      return !this.obstacle;
    }
  }

  /**
   * Call update on the underlying sprite
   * @param {number} deltaSeconds
   */
  update(deltaSeconds) {
    this.sprite.update(deltaSeconds);
  }

  /**
   * Handle the click but change the point to the sprite's position
   */
  actionClick(pointUnused) {
    super.actionClick(this.sprite.position);
  }
  /**
   * Handle the click but change the point to the sprite's position
   */
  actionContextClick(pointUnused) {
    super.actionContextClick(this.sprite.position);
  }

  /**
   * Handle the pointer up event but change the point to the sprite's position
   */
  actionPointerUp(pointUnused) {
    super.actionPointerUp(this.sprite.position);
  }
  /**
   * Handle the pointer down event but change the point to the sprite's position
   */
  actionPointerDown(pointUnused) {
    super.actionPointerDown(this.sprite.position);
  }

  /**
   * Convert to JSON.
   * Note this only stores the actor.
   * @returns {module:utils/persistentData~ObjectJSON}
   */
  toJSON() {
    const storageDetails = this.storeManager.getAllStorageDetails();
    const inventory = [];
    for (const detail of storageDetails) {
      inventory.push({
        storeTypeId: detail.store.storeTypeId,
        artefact: detail.artefact,
      });
    }
    return {
      reviver: 'Actor',
      data: {
        adventureStartTime: this.adventureStartTime,
        alive: this.alive,
        almanacEntry: this.almanacEntry,
        traits: this.traits,
        inventory: inventory,
        toxin: this?.toxify.getToxin(),
      },
    };
  }

  /**
   * Revive from previous call to toJSON
   * @param {Array.Array<key,value>} data - array of map values
   * @param {function(module:dnd/almanacs~AlmanacEntry,module:dnd/traits.Traits)} builder
   * @returns {Actor}
   */
  static revive(data, builder) {
    const actor = builder(data.almanacEntry, data.traits);
    actor.adventureStartTime = data.adventureStartTime;
    actor.alive = data.alive;
    actor.toxify = new Toxify(data.toxin);
    for (const item of data.inventory) {
      const store = actor.storeManager.getStoreByTypeId(item.storeTypeId);
      if (!store) {
        LOG.error(
          `Unable to find store matching ${item.storeTypeId}. Game restore abandoned.`
        );
        return;
      }
      store.add(item.artefact);
    }
    return actor;
  }
}

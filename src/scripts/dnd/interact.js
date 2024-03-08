/**
 * @file Handle fights and other interactions.
 *
 * @module dnd/interact
 */
/**
 * License {@link https://opensource.org/license/mit/|MIT}
 *
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
import { addFadingImage, addFadingText } from '../utils/effects/transient.js';
import { Velocity } from '../utils/geometry.js';
import IMAGE_MANAGER from '../utils/sprites/imageManager.js';
import { PathFollower, moveActorToPosition } from '../utils/sprites/movers.js';
import { Point } from '../utils/geometry.js';
import * as chance from './chance.js';
import UI from '../utils/dom/ui.js';
import SOUND_MANAGER from '../utils/soundManager.js';
import PERSISTENT_DATA from '../utils/persistentData.js';
import * as actorDialogs from '../dialogs/actorDialogs.js';
import { i18n } from '../utils/messageManager.js';
import { StoreType } from '../utils/game/artefacts.js';

/** Dummy interaction that does nothing
 */
export class AbstractInteraction {
  /** Actor owning the interaction @type {Actor} */
  actor;

  /**
   *
   * @param {Actor} actor
   */
  constructor(actor) {
    this.actor = actor;
  }
  /**
   * @param {module:utils/game/actors~Actor} reactor
   * @returns {Promise}
   */
  enact(reactorUnused) {
    return Promise.resolve();
  }

  /**
   * @param {module:utils/game/actors~Actor} enactor
   * @returns {Promise}
   */
  react(enactorUnused) {
    return Promise.resolve();
  }

  /**
   * Test to see if actor can run away from an interaction. If the actor cannot,
   * a failed message appears. The actual move is not undertaken
   * @param {Actor} escaper
   * @returns {boolean} true if can run
   */
  allowEscape(escaperUnused) {
    return true;
  }
}

/**
 * Class to handle fights.
 * @implements {ActorInteraction}
 */
export class Fight extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {Actor} actor - parent actor.
   */
  constructor(actor) {
    super(actor);
  }

  /**
   * @param {module:utils/game/actors~Actor} reactor
   * @returns {Promise}
   */
  enact(reactor) {
    return this.#resolveAttackerDefender(this.actor, reactor);
  }

  /**
   * @param {module:utils/game/actors~Actor} enactor
   * @returns {Promise}
   */
  react(enactor) {
    return this.#resolveAttackerDefender(enactor, this.actor);
  }

  /**
   * Test to see if actor can run away from an interaction. If the actor cannot,
   * a failed message appears. The actual move is not undertaken
   * @param {Actor} escaper
   * @returns {boolean} true if can run
   */
  allowEscape(escaper) {
    if (!chance.evades(escaper, this.actor)) {
      addFadingText('Failed to run.', {
        lifetimeSecs: 2,
        position: escaper.position,
        velocity: new Velocity(0, -100, 0),
      });
      return false;
    }
    return true;
  }

  /**
   * Display an attack
   * @param {Actor} attacker
   * @param {Actor} defender
   * @returns {Promise}
   */
  #displayAttack(attacker, defender) {
    const startPoint = Point.copy(attacker.position);
    const attackPoint = new Point(
      attacker.position.x + 0.2 * (defender.position.x - attacker.position.x),
      attacker.position.y + 0.2 * (defender.position.y - attacker.position.y)
    );
    const pathModifier = new PathFollower({
      path: [attackPoint, startPoint],
      speed: 100,
    });
    return pathModifier.applyAsTransientToSprite(attacker.sprite);
  }

  /**
   * Undertake attack. Note that the defender is not removed if its hit points
   * hit zero.
   * @param {Actor} attacker
   * @param {Actor} defender
   * @returns {Promise} fulfils to the defender's HP.
   */
  #undertakeAttack(attacker, defender) {
    return new Promise((resolve) => {
      if (!chance.hits(attacker, defender)) {
        SOUND_MANAGER.playEffect('MISS');
        addFadingText('Missed', {
          lifetimeSecs: 2,
          position: defender.position,
          velocity: new Velocity(0, -100, 0),
        });
        resolve();
        return;
      } else {
        SOUND_MANAGER.playEffect('PUNCH');
        addFadingImage(
          IMAGE_MANAGER.getSpriteBitmap(
            PERSISTENT_DATA.get('BLOOD_ON') ? 'blood-splat.png' : 'pow.png'
          ),
          {
            lifetimeSecs: 1,
            position: defender.position,
            velocity: new Velocity(0, 0, 0),
          }
        );
      }
      let defenderHP = defender.traits.get('HP', 0);
      const damage = chance.damageInflicted(attacker, defender);
      defenderHP = Math.max(0, defenderHP - damage);
      defender.traits.set('HP', defenderHP);
      if (defenderHP === 0) {
        SOUND_MANAGER.playEffect('DIE');
        LOG.info('Killed actor.');
        defender.interaction = new InteractWithCorpse(defender);
        defender.alive = false;
      } else {
        addFadingText(`-${damage} HP`, {
          lifetimeSecs: 2,
          position: new Point(defender.position.x, defender.position.y),
          velocity: new Velocity(0, 0, 0),
        });
      }
      resolve(defenderHP);
    });
  }

  /**
   * Resolve a fight.
   * @param {Actor} attacker
   * @param {Actor} defender
   * @returns {Promise}
   */
  #resolveAttackerDefender(attacker, defender) {
    return this.#displayAttack(attacker, defender).then(() =>
      this.#undertakeAttack(attacker, defender)
    );
  }
}

/**
 * Class to handle searching a corpse.
 * @implements {ActorInteraction}
 */
export class InteractWithCorpse extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {Actor} actor - parent actor.
   */
  constructor(actor) {
    super(actor);
  }

  /**
   * Respond to a search
   * @param {module:utils/game/actors~Actor} reactor
   * @returns {Promise}
   */
  async react(enactor) {
    const choice = await this.#decideAction();
    if (choice === 'MOVE') {
      return moveActorToPosition(enactor, this.actor.position);
    }
    return UI.showOkDialog(
      "A bit macabre, but you're trying to search a corpse. I haven't written the code yet."
    );
  }

  /**
   * Decide on course of action.
   * @returns {Promise<string>} fulfils to SEARCH or MOVE
   */
  async #decideAction() {
    const choice = await UI.showChoiceDialog(
      i18n`DIALOG TITLE CHOICES`,
      i18n`MESSAGE SEARCH CORPSE OR MOVE`,
      [i18n`BUTTON SEARCH`, i18n`BUTTON MOVE`]
    );
    return choice === 0 ? 'SEARCH' : 'MOVE';
  }
}

/**
 * Class to handle trading.
 */
export class Trade extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {Actor} actor - parent actor.
   */
  constructor(actor) {
    super(actor);
  }

  /**
   * Trades are passive. Only the hero can initiate a trade.
   * @param {module:utils/game/actors~Actor} enactor
   * @returns {Promise}
   */
  react(enactorUnused) {
    return UI.showOkDialog("Time to trade. I haven't written the code yet.");
  }
}

/**
 * Class to handle finding artefact
 */
export class FindArtefact extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {Actor} actor - parent actor.
   */
  constructor(actor) {
    super(actor);
  }

  /**
   * Trades are passive. Only the hero can initiate a trade.
   * @param {module:utils/game/actors~Actor} enactor
   * @returns {Promise}
   */
  async react(enactor) {
    const choice = await this.#decideAction();
    this.actor.alive = false;
    if (choice === 'MOVE') {
      return moveActorToPosition(enactor, this.actor.position);
    }
    const storageDetails = this.actor.storeManager.getAllStorageDetails();
    if (storageDetails.length > 0) {
      const storeToTakeFrom = storageDetails[0].store; // only expect one.
      const artefactToTake = storageDetails[0].artefact; // only expect one.
      const possibleStore =
        enactor.storeManager.findSuitableStore(artefactToTake);
      let options = {};
      if (!possibleStore) {
        options.cannotStore = true;
        options.guidance =
          artefactToTake.stashStoreType === StoreType.WAGON
            ? i18n`MESSAGE MAKE SPACE IN EQUIP`
            : i18n`MESSAGE MAKE SPACE IN BACKPACK`;
      }
      return actorDialogs
        .showArtefactFoundBy(artefactToTake, enactor, options)
        .then((response) => {
          if (response === 'TAKE') {
            storeToTakeFrom.take(artefactToTake);
            possibleStore.add(artefactToTake);
          }
          return null;
        });
    } else {
      return UI.showOkDialog(i18n`MESSAGE ARTEFACTS ALREADY TAKEN`);
    }
  }

  /**
   * Decide on course of action. If the artefact is still alive, the choice is
   * always to search
   * @returns {Promise<string>} fulfils to SEARCH or MOVE
   */
  async #decideAction() {
    if (this.actor.alive) {
      return Promise.resolve('SEARCH');
    }
    const choice = await UI.showChoiceDialog(
      i18n`DIALOG TITLE CHOICES`,
      i18n`MESSAGE SEARCH HOLE OR MOVE`,
      [i18n`BUTTON SEARCH`, i18n`BUTTON MOVE`]
    );
    return choice === 0 ? 'SEARCH' : 'MOVE';
  }
}

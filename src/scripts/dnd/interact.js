/**
 * @file Handle fights and other interactions.
 *
 * @module dnd/interact
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
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
import { PathFollower } from '../utils/sprites/movers.js';
import { Point } from '../utils/geometry.js';
import * as chance from './chance.js';
import UI from '../utils/dom/ui.js';

/** Dummy interaction that does nothing
 */
export class EmptyInteraction {
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
   * @param {import('../utils/game/actors.js').Actor} reactor
   * @returns {Promise}
   */
  enact(reactorUnused) {
    return Promise.resolve();
  }

  /**
   * @param {import('../utils/game/actors.js').Actor} enactor
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
export class Fight extends EmptyInteraction {
  /**
   * Construct the interaction.
   * @param {Actor} actor - parent actor.
   */
  constructor(actor) {
    super(actor);
  }

  /**
   * @param {import('../utils/game/actors.js').Actor} reactor
   * @returns {Promise}
   */
  enact(reactor) {
    return this.#resolveAttackerDefender(this.actor, reactor);
  }

  /**
   * @param {import('../utils/game/actors.js').Actor} enactor
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
        addFadingText('Missed', {
          lifetimeSecs: 2,
          position: defender.position,
          velocity: new Velocity(0, -100, 0),
        });
        resolve();
        return;
      } else {
        addFadingImage(IMAGE_MANAGER.getSpriteBitmap(0, 'blood-splat.png'), {
          lifetimeSecs: 1,
          position: defender.position,
          velocity: new Velocity(0, 0, 0),
        });
      }
      let defenderHP = defender.traits.get('HP');
      const damage = chance.damageInflicted(attacker, defender);
      defenderHP = Math.max(0, defenderHP - damage);
      defender.traits.set('HP', defenderHP);
      if (defenderHP === 0) {
        LOG.info('Killed actor.');
        defender.interaction = new SearchCorpse();
        defender.alive = false;
      } else {
        addFadingText(`-${damage} HP`, {
          lifetimeSecs: 2,
          position: defender.position,
          velocity: new Velocity(0, -200, 0),
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
export class SearchCorpse extends EmptyInteraction {
  /**
   * Construct the interaction.
   * @param {Actor} actor - parent actor.
   */
  constructor(actor) {
    super(actor);
  }

  /**
   * Respond to a search
   * @param {import('../utils/game/actors.js').Actor} reactor
   * @returns {Promise}
   */
  react(reactorUnused) {
    return UI.showOkDialog(
      "A bit macabre, but you're trying to search a corpse. I haven't written the code yet."
    );
  }
}

/**
 * Class to handle trading.
 */
export class Trade extends EmptyInteraction {
  /**
   * Construct the interaction.
   * @param {Actor} actor - parent actor.
   */
  constructor(actor) {
    super(actor);
  }

  /**
   * Trades are passive. Only the hero can initiate a trade.
   * @param {import('../utils/game/actors.js').Actor} enactor
   * @returns {Promise}
   */
  react(enactorUnused) {
    return UI.showOkDialog("Time to trade. I haven't written the code yet.");
  }
}

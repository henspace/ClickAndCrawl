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
import {
  addFadingAnimatedImage,
  addFadingImage,
  displayRisingText,
} from '../utils/effects/transient.js';
import { Velocity } from '../utils/geometry.js';
import IMAGE_MANAGER from '../utils/sprites/imageManager.js';
import { PathFollower, moveActorToPosition } from '../utils/sprites/movers.js';
import { Point } from '../utils/geometry.js';
import UI from '../utils/dom/ui.js';
import SOUND_MANAGER from '../utils/soundManager.js';
import * as actorDialogs from '../dialogs/actorDialogs.js';
import { i18n } from '../utils/messageManager.js';
import * as dndAction from './dndAction.js';
import { ActorType } from '../players/actors.js';
import { ArtefactType } from '../players/artefacts.js';
import WORLD from '../utils/game/world.js';
import { Colours } from '../constants/canvasStyles.js';

/**
 * Apply poison damage to defender
 * @param {module:players/artefacts.Artefact} poison
 * @param {module:players/actors.Actor} victim
 * @param {number} damage
 * @returns {number} resulting HP of defender
 */
function applyPoisonDamage(poison, victim, damage) {
  SOUND_MANAGER.playEffect('POISONED');
  if (damage >= 0) {
    addFadingImage(IMAGE_MANAGER.getSpriteBitmap('skull.png'), {
      delaySecs: 0,
      lifetimeSecs: 1,
      position: victim.position,
      velocity: new Velocity(0, 0, 0),
    });
    return applyDamage(poison, victim, damage);
  }
}
/**
 * Apply damage to defender
 * @param {Artefact | Actor} attacker
 * @param {module:players/actors.Actor} defender
 * @param {number} damage
 * @returns {number} resulting HP of defender
 */
function applyDamage(attacker, defender, damage) {
  if (
    !damage ||
    !defender.alive ||
    defender.isProp() ||
    defender.isHiddenArtefact()
  ) {
    return 0;
  }
  let defenderHP = defender.traits.get('HP', 0);
  defenderHP = Math.max(0, defenderHP - damage);
  defender.traits.set('HP', defenderHP);
  if (defenderHP === 0) {
    SOUND_MANAGER.playEffect('DIE');
    LOG.info('Killed actor.');
    defender.interaction = new InteractWithCorpse(defender);
    defender.alive = false;
    if (attacker.isHero?.()) {
      const change = attacker.traits.adjustForDefeatOfActor(defender);
      let text;
      if (change.level.now > change.level.was) {
        text = i18n`LEVEL UP ${change.level.now}`;
      } else if (change.exp.now > change.exp.was) {
        text = `+${change.exp.now - change.exp.was} EXP`;
      }
      if (text) {
        displayRisingText(
          text,
          attacker.position,
          Colours.HP_TRANSIENT_TEXT_HERO
        );
      }
    }
  } else {
    const textColor = defender.isHero()
      ? Colours.HP_TRANSIENT_TEXT_HERO
      : Colours.HP_TRANSIENT_TEXT_ENEMY;
    displayRisingText(`-${damage} HP`, defender.position, textColor);
  }
  return defenderHP;
}
/** Dummy interaction that does nothing
 */
export class AbstractInteraction {
  /** Actor owning the interaction @type {Actor} */
  owner;

  /**
   *
   * @param {Actor|Artefact} owner
   */
  constructor(owner) {
    this.owner = owner;
  }
  /**
   * @param {module:players/actors.Actor} reactor
   * @returns {Promise}
   */
  enact(reactorUnused) {
    return Promise.resolve();
  }

  /**
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise}
   */
  react(enactorUnused) {
    return Promise.resolve();
  }

  /**
   * Test to see if the interaction can react.
   * This should be overridden.
   * @returns {boolean}
   */
  canReact() {
    return false;
  }

  /**
   * Test to see if the interaction can enact.
   * This should be overridden.
   * @returns {boolean}
   */
  canEnact() {
    return false;
  }

  /**
   * Test to see if actor can disengage from an interaction. Actors can
   * always move away from an interaction. Disengaging is different in that
   * following actions can be affected. The interaction will not do anything
   * about the disengaging. This flag merely indicates whether callers should
   * respect an attempt to disengage.
   * @param {module:players/actors.Actor} escaper
   * @returns {boolean} true if can run
   */
  respectDisengage(escaperUnused) {
    return false;
  }
}

/**
 * Class to handle fights.
 * @implements {ActorInteraction}
 */
export class Fight extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {module:players/actors.Actor} owner - parent actor.
   */
  constructor(owner) {
    super(owner);
  }
  /**
   * @override
   * @returns {boolean}
   */
  canEnact() {
    return true;
  }
  /**
   * @override
   * @returns {boolean}
   */
  canReact() {
    return true;
  }
  /**
   * @param {module:players/actors.Actor} reactor
   * @returns {Promise}
   */
  enact(reactor) {
    return this.#resolveAttackerDefender(this.owner, reactor);
  }

  /**
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise}
   */
  react(enactor) {
    return this.#resolveAttackerDefender(enactor, this.owner);
  }

  /**
   * Test to see if actor can run away from an interaction. If the actor cannot,
   * a failed message appears. The actual move is not undertaken
   * @param {module:players/actors.Actor} escaper
   * @returns {boolean} true if can run
   */
  respectDisengage(escaperUnused) {
    return true;
  }

  /**
   * Display an attack
   * @param {module:players/actors.Actor} attacker
   * @param {module:players/actors.Actor} defender
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
   * @param {module:players/actors.Actor} attacker
   * @param {module:players/actors.Actor} defender
   * @returns {Promise} fulfils to the defender's HP.
   */
  #undertakeAllAttacks(attacker, defender) {
    let totalDamage = 0;
    let successfulAttacks = 0;
    attacker.traits.getAttacks().forEach((attack) => {
      const damage = dndAction.getMeleeDamage(attack, defender);
      if (damage > 0) {
        successfulAttacks++;
        totalDamage += damage;
      }
    });
    return new Promise((resolve) => {
      if (totalDamage <= 0) {
        SOUND_MANAGER.playEffect('MISS');
        addFadingImage(IMAGE_MANAGER.getSpriteBitmap('miss.png'), {
          delaySecs: 0,
          lifetimeSecs: 1,
          position: defender.position,
          velocity: new Velocity(0, 0, 0),
        });
        resolve();
        return;
      }
      let hitSound = successfulAttacks > 1 ? 'DOUBLE PUNCH' : 'PUNCH';
      let hitImage =
        successfulAttacks > 1 ? 'blood-splat-twice.png' : 'blood-splat.png';

      SOUND_MANAGER.playEffect(hitSound);
      addFadingImage(IMAGE_MANAGER.getSpriteBitmap(hitImage), {
        delaySecs: 0,
        lifetimeSecs: 1,
        position: defender.position,
        velocity: new Velocity(0, 0, 0),
      });
      const defenderHP = applyDamage(attacker, defender, totalDamage);
      resolve(defenderHP);
    });
  }

  /**
   * Resolve a fight.
   * @param {module:players/actors.Actor} attacker
   * @param {module:players/actors.Actor} defender
   * @returns {Promise}
   */
  #resolveAttackerDefender(attacker, defender) {
    return this.#displayAttack(attacker, defender).then(() =>
      this.#undertakeAllAttacks(attacker, defender)
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
   * @param {module:players/actors.Actor} owner - parent actor.
   */
  constructor(owner) {
    super(owner);
  }

  /**
   * @override
   * @returns {boolean}
   */
  canEnact() {
    return false;
  }
  /**
   * @override
   * @returns {boolean}
   */
  canReact() {
    return true;
  }
  /**
   * Respond to a search
   * @param {module:players/actors.Actor} reactor
   * @returns {Promise}
   */
  async react(enactor) {
    return actorDialogs.showPillageDialog(enactor, this.owner);
  }
}

/**
 * Class to handle trading.
 */
export class Trade extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {module:players/actors.Actor} owner - parent actor.
   */
  constructor(owner) {
    super(owner);
  }
  /**
   * @override
   * @returns {boolean}
   */
  canEnact() {
    return false;
  }
  /**
   * @override
   * @returns {boolean}
   */
  canReact() {
    return true;
  }
  /**
   * Trades are passive. Only the hero can initiate a trade.
   * Note there is possibility for traders to block the exit, so
   * the option to barge past is provided.
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise}
   */
  react(enactor) {
    return UI.showChoiceDialog(
      i18n`DIALOG TITLE CHOICES`,
      i18n`MESSAGE TRADE OR BARGE`,
      [i18n`BUTTON TRADE`, i18n`BUTTON BARGE`]
    ).then((choice) => {
      if (choice === 0) {
        return actorDialogs.showTradeDialog(enactor, this.owner);
      } else {
        return this.#swapPositions(enactor);
      }
    });
  }

  /**
   * Swap position with another actor
   * @param {module:players/actors.Actor} them
   * @returns {Promise} fulfils to undefined when complete.
   */
  #swapPositions(them) {
    const myPosition = Point.copy(this.owner.position);
    const theirPosition = Point.copy(them.position);
    return Promise.all([
      moveActorToPosition(them, myPosition),
      moveActorToPosition(this.owner, theirPosition),
    ]);
  }
}

/**
 * Class to handle finding artefact
 */
export class FindArtefact extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {module:players/actors.Actor} actor - parent actor.
   */
  constructor(actor) {
    super(actor);
  }
  /**
   * @override
   * @returns {boolean}
   */
  canEnact() {
    return false;
  }
  /**
   * @override
   * @returns {boolean}
   */
  canReact() {
    return true;
  }
  /**
   * Finding an artefact is a passive action and can only be initiated by another
   * actor.
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise}
   */
  async react(enactor) {
    this.owner.alive = false;
    const storageDetails = this.owner.storeManager.getFirstStorageDetails();
    if (storageDetails) {
      const artefact = storageDetails.artefact;
      return actorDialogs.showArtefactDialog({
        preamble: this.#createDiscoveryMessage(artefact),
        currentOwner: this.owner,
        prospectiveOwner: enactor,
        storeType: storageDetails.store.storeType,
        artefact: artefact,
        actionType: actorDialogs.ArtefactActionType.FIND,
      });
    } else {
      return UI.showOkDialog(i18n`MESSAGE NOTHING MORE TO DISCOVER`);
    }
  }

  /**
   * Create a message describing the action of discovery rather
   * than the artefact itself.
   * @param {*} foundArtefact
   * @returns {string}
   */
  #createDiscoveryMessage(foundArtefact) {
    if (this.owner.type === ActorType.HIDDEN_ARTEFACT) {
      return i18n`MESSAGE FOUND HIDDEN ARTEFACT`;
    } else if (foundArtefact.artefactType === ArtefactType.SPELL) {
      // must be a prop and only engraved pillars currently supported.
      return i18n`MESSAGE FOUND ENGRAVING`;
    }
    return i18n`MESSAGE FOUND GENERIC`;
  }
}

/**
 * Class to handle poisoning
 */
export class Poison extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {module:players/actors.Actor} owner - parent actor.
   */
  constructor(owner) {
    super(owner);
  }
  /**
   * @override
   * @returns {boolean}
   */
  canEnact() {
    return true;
  }
  /**
   * @override
   * @returns {boolean}
   */
  canReact() {
    return false;
  }
  /**
   * @param {module:players/actors.Actor} reactor
   * @returns {Promise}
   */
  enact(reactor) {
    const damage = dndAction.getPoisonDamage(this.owner, reactor);
    applyPoisonDamage(this.owner, reactor, damage);

    return Promise.resolve();
  }
}

/**
 * Class to handle casting a spell.
 * @implements {ActorInteraction}
 */
export class CastSpell extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {module:players/artefacts.Artefact} owner - parent spell.
   */
  constructor(owner) {
    super(owner);
  }

  /**
   * @override
   * @returns {boolean}
   */
  canEnact() {
    return false;
  }
  /**
   * @override
   * @returns {boolean}
   */
  canReact() {
    return true;
  }
  /**
   * Respond to a spell cast
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise}
   */
  async react(enactor) {
    const tileMap = WORLD.getTileMap();
    const gridPoint = tileMap.worldPointToGrid(enactor.position);
    const range = this.owner.traits.getValueInFeetInTiles('RANGE', 1);
    const maxTargets = this.owner.traits.getInt('MAX_TARGETS', 999);
    let hitTargets = 0;
    const affectedTiles = tileMap.getRadiatingUpAndDown(gridPoint, range);

    for (const tile of affectedTiles) {
      if (hitTargets > maxTargets) {
        break;
      }
      this.#displaySpell(tile.worldPoint);
      tile.getOccupants().forEach((occupant) => {
        if (occupant.isEnemy() || occupant.isTrader()) {
          hitTargets++;
          const damage = dndAction.getSpellDamage(
            enactor,
            occupant,
            this.owner
          );
          applyDamage(enactor, occupant, damage);
        }
      });
    }
    if (this.owner.artefactType === ArtefactType.SPELL) {
      enactor.storeManager.stash(this.owner); // spells have to be prepared again once used.
    }
    return Promise.resolve();
  }

  /**
   * Display a spell attack at a point.
   * @param {Point} worldPoint
   */
  #displaySpell(worldPoint) {
    const spellType = this.owner.traits.get('EFFECT');
    addFadingAnimatedImage(spellType.toLowerCase(), {
      position: worldPoint,
      delaySecs: 0,
      lifetimeSecs: 1,
    });
  }
}

/**
 * Class to handle consuming food, which in this context includes drinks.
 * @implements {ActorInteraction}
 */
export class ConsumeFood extends AbstractInteraction {
  /**
   * Construct the interaction.
   * @param {module:players/artefacts.Artefact} owner - parent actor.
   */
  constructor(owner) {
    super(owner);
  }

  /**
   * @override
   * @returns {boolean}
   */
  canEnact() {
    return false;
  }
  /**
   * @override
   * @returns {boolean}
   */
  canReact() {
    return true;
  }
  /**
   * Respond to a consume instruction
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise}
   */
  async react(enactor) {
    const traits = this.owner.traits;
    const foodType = traits.get('TYPE');
    if (foodType === 'POISON') {
      const damage = dndAction.getPoisonDamage(this.owner, enactor);
      if (damage === 0) {
        return UI.showOkDialog(i18n`MESSAGE RESISTED POISON`);
      } else if (applyPoisonDamage(this.owner, enactor, damage) <= 0) {
        return UI.showOkDialog(i18n`MESSAGE KILLED BY POISON`);
      } else {
        return UI.showOkDialog(i18n`MESSAGE IT'S POISON ${damage}`);
      }
    } else {
      let gainHp = this.owner.traits.getInt('HP', 0);
      if (gainHp === 0) {
        return UI.showOkDialog(i18n`MESSAGE CONSUME BUT NO HP GAIN`);
      }
      const enactorHp = enactor.traits.getInt('HP');
      const enactorHpMax = enactor.traits.getInt('HP_MAX');
      if (!enactorHpMax) {
        LOG.error(`Actor ${enactor.traits.get('NAME')} has no HP_MAX set`);
        return Promise.resolve();
      }
      const shortfall = enactorHpMax - enactorHp;
      if (shortfall < 0) {
        LOG.error(
          `Actor ${enactor.traits.get('NAME')} has HP higher than HP_MAX`
        );
        return Promise.resolve();
      }
      gainHp = Math.min(shortfall, gainHp);
      if (gainHp === 0) {
        return UI.showOkDialog(i18n`MESSAGE CONSUME BUT ALREADY FULL HP`);
      }
      const finalHp = enactorHp + gainHp;
      const message =
        foodType === 'POTION'
          ? i18n`MESSAGE IT'S A HEALTHY DRINK ${gainHp}`
          : i18n`MESSAGE IT'S HEALTHY ${gainHp}`;
      return UI.showOkDialog(message).then(() =>
        enactor.traits.set('HP', finalHp)
      );
    }
  }
}

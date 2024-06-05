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
import { ActorType, AttackMode } from '../players/actors.js';
import {
  ArtefactType,
  StoreType,
  artefactTypesEqual,
} from '../players/artefacts.js';
import WORLD from '../utils/game/world.js';
import { Colours } from '../constants/canvasStyles.js';
import { Toxin } from './toxins.js';
import * as magic from './magic.js';
import * as traps from './trapCharacteristics.js';
import * as trapDialogs from '../dialogs/trapDialogs.js';
import {
  buildArtefact,
  buildArtefactFromId,
} from './almanacs/artefactBuilder.js';
import * as maths from '../utils/maths.js';
import { showMoneyPortalDialog } from '../dialogs/moneyPortalDialog.js';
import { ALMANAC_LIBRARY } from './almanacs/almanacs.js';
import { pause } from '../utils/timers.js';

/**
 * Apply poison damage to defender
 * @param {module:players/artefacts.Artefact | module:players/artefacts.Actor } poison
 * @param {module:players/actors.Actor} victim
 * @param {number} damage
 * @returns {number} resulting HP of defender
 */
function applyPoisonDamage(poison, victim, damage) {
  SOUND_MANAGER.playEffect('POISONED');
  if (damage > 0) {
    LOG.info('Poisoned');
    addFadingImage(IMAGE_MANAGER.getSpriteBitmap('skull.png'), {
      delaySecs: 0,
      lifetimeSecs: 1,
      position: victim.position,
      velocity: new Velocity(0, 0, 0),
    });

    return applyDamage(poison, victim, damage);
  } else {
    addFadingImage(IMAGE_MANAGER.getSpriteBitmap('miss.png'), {
      delaySecs: 0,
      lifetimeSecs: 1,
      position: victim.position,
      velocity: new Velocity(0, 0, 0),
    });
    LOG.info(`Poison resisted.`);
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
  const defenderName = defender.traits.get('NAME');
  LOG.info(`Damage ${damage} on ${defenderName}`);
  let defenderHP = defender.traits.get('HP', 0);
  defenderHP = Math.max(0, defenderHP - damage);
  defender.traits.set('HP', defenderHP);
  if (defenderHP === 0) {
    SOUND_MANAGER.playEffect(defender.traits.get('SOUND', 'DIE'));
    LOG.info(`Killed ${defenderName}`);
    defender.interaction = new InteractWithCorpse(defender);
    defender.alive = false;
    if (attacker?.isHero?.()) {
      const change = attacker.traits.adjustForDefeatOfActor(defender.traits);
      let text;
      if (change.level.now > change.level.was) {
        text = i18n`LEVEL UP ${change.level.now}`;
      } else if (change.exp.now > change.exp.was) {
        text = `+${change.exp.now - change.exp.was} EXP`;
      }
      if (text) {
        LOG.info(text);
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
  /** Actor owning the interaction @type {module:players/actors.Actor} */
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
   * @returns {Promise} fulfils to value depending on interaction. Can be undefined
   */
  enact(reactorUnused) {
    return Promise.resolve();
  }

  /**
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise} fulfils to value depending on interaction. Can be undefined
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
    if (attacker.isHero()) {
      return this.#undertakeAllMeleeAttacks(attacker, defender);
    }
    switch (attacker.attackMode) {
      case AttackMode.COMBO:
        return this.#undertakeComboAttacks(attacker, defender);
      case AttackMode.POISON:
        return new Poison(attacker).enact(defender);
      case AttackMode.MAGIC:
      case AttackMode.RANGED:
        return new CastSpell(attacker).react(attacker);
      case AttackMode.COMBAT:
      default:
        return this.#undertakeCombatAttack(attacker, defender);
    }
  }

  /**
   * Undertake comb0 attack
   * @param {module:players/actors.Actor} attacker
   * @param {module:players/actors.Actor} defender
   * @returns {Promise} fulfils to the defender's HP.
   */
  #undertakeComboAttacks(attacker, defender) {
    const currentHp = defender.traits.getInt('HP');
    return this.#undertakeAllMeleeAttacks(attacker, defender).then((hp) => {
      if (hp <= 0) {
        return hp;
      }
      if (attacker.traits.has('DMG_POISON')) {
        // in combo, only poison if first attack hit.
        if (hp < currentHp) {
          return new Poison(attacker).enact(defender);
        } else {
          return Promise.resolve(hp);
        }
      } else {
        return this.#undertakeAllMeleeAttacks(attacker, defender); // double attack
      }
    });
  }
  /**
   * Undertake combat attack
   * @param {module:players/actors.Actor} attacker
   * @param {module:players/actors.Actor} defender
   * @returns {Promise} fulfils to the defender's HP.
   */
  #undertakeCombatAttack(attacker, defender) {
    if (!attacker.isHero()) {
      // Monsters use a spell or cantrip if available.
      const storeManager = attacker.storeManager;
      let spell = storeManager.getStore(StoreType.PREPARED_SPELLS).getFirst();
      if (!spell) {
        spell = storeManager.getStore(StoreType.CANTRIPS).getFirst();
      }
      if (spell) {
        return spell.interaction.react(attacker);
      }
    }
    return this.#undertakeAllMeleeAttacks(attacker, defender);
  }
  /**
   * Undertake attack. Note that the defender is not removed if its hit points
   * hit zero.
   * @param {module:players/actors.Actor} attacker
   * @param {module:players/actors.Actor} defender
   * @returns {Promise} fulfils to the defender's HP.
   */
  #undertakeAllMeleeAttacks(attacker, defender) {
    let totalDamage = 0;
    let successfulAttacks = 0;
    attacker.traits.getAttacks().forEach((attack) => {
      const damage = dndAction.getMeleeDamage(attack, defender.traits);
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
        resolve(defender.traits.getInt('HP', 0));
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
    LOG.info(
      `${attacker.traits?.get('NAME')} attacks ${defender.traits.get('NAME')}`
    );
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
    if (this.owner.traits.get('NO_TRADE')) {
      return UI.showOkDialog([
        i18n`MESSAGE TRADER WILL NOT TRADE`,
        i18n`MESSAGE TRADERS PROTECTED`,
      ]);
    }
    return UI.showChoiceDialog(
      i18n`DIALOG TITLE CHOICES`,
      i18n`MESSAGE TRADE STEAL OR BARGE`,
      [i18n`BUTTON TRADE`, i18n`BUTTON STEAL`, i18n`BUTTON BARGE`]
    ).then((choice) => {
      if (choice === 0) {
        return actorDialogs.showTradeDialog(enactor, this.owner);
      } else if (choice === 1) {
        return this.#attemptTheftBy(enactor);
      } else {
        return this.#swapPositions(enactor);
      }
    });
  }

  /**
   * Attempt by robber steal.
   * @param {module:players/actors.Actor} robber
   * @returns {Promise} fulfils to undefined when complete.
   */
  #attemptTheftBy(robber) {
    if (dndAction.canSteal(robber.traits, this.owner.traits)) {
      const maxGold = this.owner.traits.getInt('MAX_THEFT', 1);
      const takenGold = maths.getRandomIntInclusive(1, maxGold);
      robber.storeManager.addToPurse(takenGold);
      return UI.showOkDialog(i18n`MESSAGE STOLE GOLD ${takenGold}`);
    } else {
      this.owner.traits.set('_NO_TRADE', true);
      return UI.showOkDialog(i18n`MESSAGE TRADER ATTACKS BACK`).then(() => {
        const fight = new Fight(this.owner);
        return fight.enact(robber);
      });
    }
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
    this.owner.discovered = true;
    this.owner.alive = false;
    const storageDetails = this.owner.storeManager.getFirstStorageDetails();

    if (storageDetails) {
      let artefact = storageDetails.artefact;
      if (artefact.isTrap()) {
        const trapResult = await artefact.interaction.react(enactor);
        if (trapResult.outcome === TrapOutcome.LEAVE) {
          this.owner.alive = true; // reset trap
          return Promise.resolve();
        }
        this.owner.storeManager.discardStashed(artefact, true); // remove trap
        if (!trapResult.artefact) {
          return Promise.resolve(); // nothing to find
        }

        artefact = trapResult.artefact;
        this.owner.storeManager.stash(artefact, { direct: true }); // trap now just found artefact.
      } else if (
        artefact.isMagic() &&
        !magic.canActorLearnMagic(enactor.traits, artefact.traits)
      ) {
        return UI.showOkDialog(i18n`MESSAGE CANNOT UNDERSTAND MAGIC`);
      }
      return actorDialogs
        .showArtefactDialog({
          preamble: this.#createDiscoveryMessage(artefact),
          currentOwner: this.owner,
          prospectiveOwner: enactor,
          storeType: storageDetails.store.storeType,
          artefact: artefact,
          actionType: actorDialogs.ArtefactActionType.FIND,
          hideTraits: artefact.isMagic(),
        })
        .then(() => {
          if (this.owner.storeManager.getFirstStorageDetails()) {
            this.owner.alive = true; // still something to find.
          }
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
    } else if (foundArtefact.isMagic()) {
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
    if (this.#isImmune(reactor)) {
      return Promise.resolve();
    }
    const damage = dndAction.getPoisonDamage(this.owner.traits, reactor.traits);
    applyPoisonDamage(this.owner, reactor, damage);
    if (damage) {
      reactor.toxify?.addToxicEffect(this.owner.traits);
    }
    reactor.traits.addTransientFxTraits(this.owner.traits);
    return Promise.resolve();
  }

  /** Check if the actor is immune.
   * @return {boolean} true if immune.
   */
  #isImmune(reactor) {
    if (this.owner.isOrganic?.() && reactor.traits.transientProperties?.hover) {
      LOG.info(
        `${reactor.traits.get('NAME')} hovering so immune from organic attack.`
      );
      return true;
    }
    return false;
  }
}

/**
 * Class to handle ongoing toxic effects.
 */
export class Toxify extends AbstractInteraction {
  /** @type {Toxin} */
  #toxin;

  /**
   * Construct the interaction.
   * @param {module:dnd/toxins.Toxin} toxin - if not supplies an inactive toxin
   * is added.
   */
  constructor(toxin) {
    super(null); // no owner
    this.#toxin = toxin ?? new Toxin();
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
   * Each call applies the toxic effect so it should only be called once per turn.
   * @param {module:players/actors.Actor} reactor
   * @returns {Promise}
   */
  enact(reactor) {
    if (!this.#toxin.isActive) {
      return;
    }
    const damage = -this.#toxin.getChangeInHpThisTurn();
    applyPoisonDamage(null, reactor, damage);
    return Promise.resolve();
  }

  /**
   * Add toxic effects.
   * @param {module:dnd/traits.Traits} toxinTraits
   */
  addToxicEffect(toxinTraits) {
    const hpPerTurn = -toxinTraits.getFloat('DMG_PER_TURN', 0);
    if (hpPerTurn) {
      LOG.debug(`Add toxic effect of ${hpPerTurn} HP/turn`);
      this.#toxin.addToxicEffect(hpPerTurn);
    }
  }

  /**
   * Cure the toxic effects.
   */
  cure() {
    this.#toxin.cure();
  }

  /**
   * Test if toxins active
   */
  get isActive() {
    return this.#toxin.isActive;
  }

  /**
   * Get the underlying toxin
   * @returns {Toxin}
   */
  getToxin() {
    return this.#toxin;
  }
}

/**
 * Class to handle casting a spell. This is also used for ranged attacks.
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
   * Respond to a spell cast. Note that the magic system does not require an
   * attack role unless the attack mode is set to ATTACK
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise}
   */
  async react(enactor) {
    let retValue;
    SOUND_MANAGER.playEffect('SPELL_CHANT');

    switch (this.owner.traits.get('MODE')) {
      case 'BLESS':
        retValue = this.#enactBless(enactor);
        break;
      case 'CONJURE MEAL':
        retValue = this.#enactConjureMeal(enactor);
        break;
      case 'DETECT POISON':
        retValue = this.#enactDetectPoison(enactor);
        break;
      case 'FIND TRAPS':
        retValue = this.#enactFindTraps(enactor);
        break;
      case 'HOVER':
        retValue = this.#enactHover(enactor);
        break;
      case 'VAMPIRIC MELEE':
        retValue = this.#enactVampiricTouch(enactor);
        break;
      default:
        retValue = this.#enactMagic(enactor);
        break;
    }
    if (artefactTypesEqual(this.owner.artefactType, ArtefactType.SPELL)) {
      magic.useCastingPower(enactor.traits, this.owner.traits);
    }
    return retValue;
  }

  /**
   * Cast a standard magic spell
   * @param {module:players/actors.Actor} caster
   * @returns {Promise<number>} total damage inflicted.
   */
  #enactMagic(enactor) {
    const tileMap = WORLD.getTileMap();
    const gridPoint = tileMap.worldPointToGrid(enactor.position);
    const range = this.owner.traits.getValueInFeetInTiles('RANGE', 1);
    const maxTargets = this.owner.traits.getInt('MAX_TARGETS', 999);
    let totalDamage = 0;
    let hitTargets = 0;
    let validTargets = 0;
    const radial = this.owner.traits.get('DIRECTION') === 'RADIAL';
    const indiscriminate = this.owner.traits.get('INDISCRIMINATE');
    const affectedTiles = radial
      ? tileMap.getRadiatingVisibleTiles(range)
      : tileMap.getRadiatingCross(gridPoint, range);
    for (const tile of affectedTiles) {
      if (hitTargets >= maxTargets) {
        break;
      }

      let descendingHp = [...tile.getOccupants().values()].sort(
        (a, b) => b.traits.getInt('HP') - a.traits.getInt('HP')
      );
      for (const occupant of descendingHp) {
        if (this.#IsValidTarget(enactor, occupant, indiscriminate)) {
          validTargets++;
          const damage = dndAction.getSpellDamage(
            enactor.traits,
            occupant.traits,
            this.owner.traits
          );
          if (damage > 0) {
            totalDamage += damage;
            this.#displaySpell(tile.worldPoint);
            hitTargets++;
            applyDamage(enactor, occupant, damage);
            occupant.traits.addTransientFxTraits(this.owner.traits);
          } else {
            this.#displayFailedSpell(tile.worldPoint);
          }
        }
      }
    }
    if (validTargets === 0) {
      this.#displayFailedSpell(enactor.position);
    }
    return pause(1.5).then(() => {
      return totalDamage;
    }); // pause to allow visuals and spell chant.
  }

  /**
   * Cast a spell to find traps. The exact location is not shown but a warning is placed.
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise<undefined>}
   */
  #enactFindTraps(enactor) {
    const tileMap = WORLD.getTileMap();
    const gridPoint = tileMap.worldPointToGrid(enactor.position);
    const range = this.owner.traits.getValueInFeetInTiles('RANGE', 1);
    const radial = this.owner.traits.get('DIRECTION') === 'RADIAL';
    const searchedTiles = radial
      ? tileMap.getRadiatingVisibleTiles(range)
      : tileMap.getRadiatingCross(gridPoint, range);
    let foundTrap = false;
    for (const tile of searchedTiles) {
      if (foundTrap) {
        break;
      }
      const occupants = tile.getOccupants().values();
      for (const occupant of occupants) {
        if (occupant.isHiddenArtefact?.()) {
          const storageDetails = occupant.storeManager.getFirstStorageDetails();
          let artefact = storageDetails?.artefact;
          if (artefact?.isTrap()) {
            foundTrap = true;
            break;
          }
        }
      }
    }
    for (const tile of searchedTiles) {
      if (foundTrap) {
        this.#displaySpell(tile.worldPoint);
      } else {
        this.#displayFailedSpell(tile.worldPoint);
      }
    }
  }

  /**
   * Cast a spell on oneself. These are only for spells that have
   *  a benefit and only for heroes.
   * @param {module:players/actors.Actor} caster
   * @returns {Promise<undefined>}
   */
  #enactBless(caster) {
    if (!caster.isHero()) {
      return;
    }
    if (!magic.canBless(caster.traits, caster.traits, this.owner.traits)) {
      this.#displayFailedSpell(caster.position);
      return;
    }
    const hpGain = dndAction.getSpellHpGain(
      caster.traits,
      caster.traits,
      this.owner.traits
    );
    this.#displaySpell(caster.position);
    this.#applyAndShowHpGain(caster, hpGain);
    caster.traits.addTransientFxTraits(this.owner.traits);
    return Promise.resolve();
  }

  /** Apply and show gain for caster.
   * @param {module:players/actors.Actor} caster
   * @param {number} hpGain
   */
  #applyAndShowHpGain(caster, hpGain) {
    if (hpGain > 0) {
      caster.traits.addInt('HP', hpGain);
      displayRisingText(
        `+${hpGain}HP`,
        caster.position,
        Colours.HP_TRANSIENT_TEXT_HERO
      );
    }
  }

  /**
   * Cast a standard magic spell
   * @param {module:players/actors.Actor} caster
   * @returns {Promise<undefined>}
   */
  #enactConjureMeal(enactor) {
    const almanac = ALMANAC_LIBRARY.getAlmanac('ARTEFACTS');
    const foodEntry = almanac.find((entry) => entry.id === 'iron_rations');
    const waterEntry = almanac.find((entry) => entry.id === 'waterskin');
    let itemsStashed = 0;
    const maxMeals = 3;
    for (let meals = 0; meals < maxMeals; meals++) {
      const food = buildArtefact(foodEntry);
      if (!enactor.storeManager.stash(food, { direct: true })) {
        break;
      }
      itemsStashed++;
      const water = buildArtefact(waterEntry);
      if (!enactor.storeManager.stash(water, { direct: true })) {
        break;
      }
      itemsStashed++;
    }
    if (itemsStashed === 0) {
      return UI.showOkDialog(
        i18n`MESSAGE NO SPACE FOR CONJURED FOOD AND WATER`
      );
    } else if (itemsStashed < maxMeals * 2) {
      return UI.showOkDialog(
        i18n`MESSAGE NO SPACE FOR ALL CONJURED FOOD AND WATER`
      );
    } else {
      return UI.showOkDialog(i18n`MESSAGE CONJURED FOOD AND WATER`);
    }
  }

  /**
   * Detect poison of any items in the users backpack.
   * @param {module:players/actors.Actor} caster
   * @returns {Promise<undefined>}
   */
  #enactDetectPoison(enactor) {
    const backpackContents = enactor.storeManager
      .getStore(StoreType.BACKPACK)
      .values();
    let identifiedItem = false;
    backpackContents.forEach((artefact) => {
      if (artefact.unknown) {
        identifiedItem = true;
        artefact.unknown = false;
      }
    });
    if (identifiedItem) {
      return UI.showOkDialog(i18n`MESSAGE DETECT POISON SUCCESS`);
    } else {
      return UI.showOkDialog(i18n`MESSAGE DETECT POISON FAILURE`);
    }
  }

  /**
   * Enact a vampiric touch.
   * This is a melee attack followed by a self-cure.
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise<undefined>}
   */
  #enactVampiricTouch(enactor) {
    this.#enactMagic(enactor).then((damage) => {
      if (damage > 0) {
        const hpGain = Math.round(damage / 2);
        const currentHp = enactor.traits.getInt('HP');
        const hpMax = enactor.traits.getInt('HP_MAX');
        const appliedGain = Math.min(hpMax - currentHp, hpGain);
        LOG.info(
          `Vampiric touch convert ${damage} damage to ${appliedGain} HP.`
        );
        this.#applyAndShowHpGain(enactor, appliedGain);
      }
    });
  }

  /**
   * Apply transient hover
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise<undefined>}
   */
  #enactHover(enactor) {
    if (enactor.traits.transientProperties) {
      enactor.traits.transientProperties.hover = true;
      this.#displaySpell(enactor.position);
    }
  }

  /**
   * Test if this is a valid target.
   * @param {module:dnd/players.Actor} caster
   * @param {module:dnd/players.Actor} target
   * @param {boolean} includeTrader
   * @returns {boolean}
   */
  #IsValidTarget(caster, target, includeTrader) {
    if (caster.isHero()) {
      const possibleTarget = includeTrader
        ? target.isEnemy() || target.isTrader()
        : target.isEnemy();
      return possibleTarget && target.alive;
    } else {
      return target.isHero() && target.alive;
    }
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
      lifetimeSecs: 2,
    });
  }

  /**
   * Display a spell attack at a point.
   * @param {Point} worldPoint
   */
  #displayFailedSpell(worldPoint) {
    addFadingImage(IMAGE_MANAGER.getSpriteBitmap('failed-spell.png'), {
      position: worldPoint,
      delaySecs: 0,
      lifetimeSecs: 2,
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
    if (foodType === 'DRUG') {
      enactor.traits.addTransientFxTraits(this.owner.traits);
      return UI.showOkDialog(i18n`MESSAGE FX TRAITS APPLIED`);
    }
    if (foodType === 'POISON') {
      const damage = dndAction.getPoisonDamage(
        this.owner.traits,
        enactor.traits
      );
      if (damage === 0) {
        return UI.showOkDialog(i18n`MESSAGE RESISTED POISON`);
      } else if (applyPoisonDamage(this.owner, enactor, damage) <= 0) {
        return UI.showOkDialog(i18n`MESSAGE KILLED BY POISON`);
      } else {
        return UI.showOkDialog(i18n`MESSAGE IT'S POISON ${damage}`);
      }
    } else {
      const gainDetail = dndAction.getConsumptionBenefit(
        this.owner.traits,
        enactor.traits
      );
      const gainHp = gainDetail.newHp - gainDetail.oldHp;
      if (gainDetail.shortFall <= 0) {
        return UI.showOkDialog(i18n`MESSAGE CONSUME BUT ALREADY FULL HP`);
      }
      if (gainHp === 0) {
        return UI.showOkDialog(i18n`MESSAGE CONSUME BUT NO HP GAIN`);
      }

      const message =
        foodType === 'MEDICINE'
          ? i18n`MESSAGE IT'S A HEALTHY DRINK ${gainHp}`
          : i18n`MESSAGE IT'S HEALTHY ${gainHp}`;
      return UI.showOkDialog(message).then(() =>
        enactor.traits.set('HP', gainDetail.newHp)
      );
    }
  }
}

/**
 * @typedef {string} TrapOutcomeValue
 */
/**
 * @enum {TrapOutcomeValue}
 */
export const TrapOutcome = {
  ATTEMPT_DISABLE: 'attempt disable',
  LEAVE: 'leave',
  DISABLED: 'disabled',
  TRIGGERED: 'triggered',
};

/**
 * Class to handle triggering a trap
 * @implements {ActorInteraction}
 */
export class TriggerTrap extends AbstractInteraction {
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
   * Respond to a trap being triggered.
   * @param {module:players/actors.Actor} enactor
   * @returns {Promise<{outcome:TrapOutcome, artefact:module:players/artefacts.Artefact}>} fulfils to artefact that is found if successfully disabled.
   */
  async react(enactor) {
    let foundArtefact = null;
    const trapDetails = traps.getCharacteristics(
      enactor.traits.getCharacterLevel(),
      this.owner.traits
    );
    const action = await this.#attemptToDisable(enactor.traits, trapDetails);
    let damage;
    switch (action) {
      case TrapOutcome.TRIGGERED: {
        LOG.info('Trigger the trap.');
        damage = dndAction.getMeleeDamage(trapDetails.attack, enactor.traits);
        const dialog =
          damage === 0
            ? trapDialogs.showSurvivedTrap
            : trapDialogs.showInjuredByTrap;
        return dialog(enactor, trapDetails, this.owner.description)
          .then(() => this.#applyAndShowDamage(enactor, damage))
          .then(() => ({ outcome: action, artefact: foundArtefact }));
      }
      case TrapOutcome.DISABLED:
        LOG.info('Disabled the trap.');
        foundArtefact = buildArtefactFromId(trapDetails.reward);
        return trapDialogs
          .showDisableSuccess(enactor, trapDetails, this.owner.description)
          .then(() => ({ outcome: action, artefact: foundArtefact }));
      case TrapOutcome.LEAVE:
        LOG.info('Left the trap.');
        return Promise.resolve({ outcome: action, artefact: foundArtefact });
    }
  }

  /**
   * Apply and show damage.
   * @param {module:players/actors.Actor} enactor
   * @param {number} damage
   */
  #applyAndShowDamage(enactor, damage) {
    return new Promise((resolve) => {
      SOUND_MANAGER.playEffect('TRIGGER TRAP');
      if (damage <= 0) {
        addFadingImage(IMAGE_MANAGER.getSpriteBitmap('miss.png'), {
          delaySecs: 0,
          lifetimeSecs: 1,
          position: enactor.position,
          velocity: new Velocity(0, 0, 0),
        });
      } else {
        addFadingImage(IMAGE_MANAGER.getSpriteBitmap('blood-splat.png'), {
          delaySecs: 0,
          lifetimeSecs: 1,
          position: enactor.position,
          velocity: new Velocity(0, 0, 0),
        });
        applyDamage(this.owner, enactor, damage);
      }
      resolve();
    });
  }

  /**
   * Attempt to disable a trap if possible
   * @param {module:dnd/traits.Traits} enactorTraits
   * @param {module:dnd/trapCharacteristics~TrapDetails} trapDetails
   * @returns {Promise<string>} fulfils to 'leave', 'disable' or 'trigger'
   */
  #attemptToDisable(enactorTraits, trapDetails) {
    if (dndAction.canDetectTrap(enactorTraits, trapDetails)) {
      return trapDialogs
        .showDisableTrap(enactorTraits, trapDetails, this.owner.description)
        .then((outcome) => {
          if (outcome === TrapOutcome.LEAVE) {
            return outcome;
          }
          if (dndAction.canDisableTrap(enactorTraits, trapDetails)) {
            return TrapOutcome.DISABLED;
          } else {
            return TrapOutcome.TRIGGERED;
          }
        });
    } else {
      return Promise.resolve(TrapOutcome.TRIGGERED);
    }
  }
}

/**
 * Class to handle searching a portal.
 * @implements {ActorInteraction}
 */
export class FindPortal extends AbstractInteraction {
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
   * Respond to a interaction
   * @param {module:players/actors.Actor} reactor
   * @returns {Promise}
   */
  async react(enactor) {
    return showMoneyPortalDialog(enactor).then((sentGold) => {
      if (sentGold) {
        SOUND_MANAGER.playEffect('PORTAL');
        if (this.owner.alive) {
          this.owner.velocity = new Velocity(0, 0, 3);
          this.owner.alive = false; // dead in this context means the portal is open
        }
      }
    });
  }
}

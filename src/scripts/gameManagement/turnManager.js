/**
 * @file Manage the game turns. The turnManager is a state machine and implemented
 * as a singleton.
 *
 * @module gameManagement/turnManager
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
import { RouteFinder } from '../utils/tileMaps/pathFinder.js';
import { PathFollower } from '../utils/sprites/movers.js';
import { ClickEventFilter } from '../utils/tileMaps/tileMap.js';

import WORLD from '../utils/game/world.js';

import UI from '../utils/dom/ui.js';
import SCENE_MANAGER from './sceneManager.js';

import { addFadingText } from '../utils/effects/transient.js';
import { pause } from '../utils/timers.js';
import { Point, Position, Velocity } from '../utils/geometry.js';
import LOG from '../utils/logging.js';
import * as maths from '../utils/maths.js';
import { showMainMenu } from '../dialogs/mainMenu.js';
import { MoveType } from '../players/actors.js';
import * as actorDialogs from '../dialogs/actorDialogs.js';
import { i18n } from '../utils/messageManager.js';
import * as dice from '../utils/dice.js';
import { buildActor } from '../dnd/almanacs/actorBuilder.js';
import { restoreGameState, saveGameState } from './gameSaver.js';

/**
 * Factor that is multiplied by the maxMovesPerTurn property of an actor to determine
 * if it will bother trying to reach the hero.
 */
const TOO_MANY_TURNS_TO_REACH = 1.5;
/**
 * Max number of tiles that the hero can move for it to be allowed as disengagement.
 */
const MAX_TILES_FOR_DISENGAGEMENT = 2;
/**
 * Enumeration of supported events
 * @enum {number}
 */
const EventId = {
  MAIN_MENU: 0,
  CLICKED_FREE_GROUND: 1,
  CLICKED_ENTRANCE: 2,
  CLICKED_EXIT: 3,
};

/** Should the game be saved and restored @type {boolean} */
let persistentGame = true;

/**
 * Class that allows a simulated movement of an actor. The movement using
 * the route finder takes place immediately, so that the effect of the actor's
 * final position can be used to affect other actors without waiting for the normal
 * duration of the move. The actual motion can then be actioned by a subsequent call to reenact.
 *
 */
class ReplayableActorMover {
  /** @type {Actor} */
  #actor;
  /** @type {AbstractModifier} */
  #modifier;
  /** @type {Position} */
  #originalPosition;
  /** @type {TileMap} */
  #tileMap;
  /** @type {RouteFinder} */
  #routeFinder;
  /** @type {boolean} */
  #heroDisengaging;

  /**
   *
   * @param {module:players/actors.Actor} actor
   * @param {TileMap} tileMap
   * @param {RouteFinder} routeFinder
   * @param {boolean} heroDisengaging
   */
  constructor(actor, tileMap, routeFinder, heroDisengaging) {
    this.#actor = actor;
    this.#tileMap = tileMap;
    this.#routeFinder = routeFinder;
    this.#heroDisengaging = heroDisengaging;
  }

  /**
   * Get a target grid position based on actor type
   * @param {Point} actorGridPos
   * @returns {Point}
   */
  #getTargetGridPoint(actorGridPos) {
    if (this.#actor.moveType === MoveType.HUNT) {
      if (this.#heroDisengaging) {
        return actorGridPos; // frozen
      } else {
        const heroGridPos = this.#tileMap.worldPointToGrid(heroActor.position);
        const orthoSeparation =
          actorGridPos.getOrthoSeparation(heroGridPos) - 1;
        const maxHuntSeparation =
          this.#actor.getMaxTilesPerMove() * TOO_MANY_TURNS_TO_REACH;
        if (orthoSeparation <= maxHuntSeparation) {
          return this.#tileMap.worldPointToGrid(heroActor.position);
        }
      }
    }
    // everything else falls back to random walk.
    return this.#getRandomGridPosition(
      actorGridPos,
      this.#actor.getMaxTilesPerMove()
    );
  }
  /**
   * Move actor to new position using the route finder. The move takes place instantly
   * but can be replayed using the replay method.
   */
  moveInstantly() {
    this.#originalPosition = Position.copy(this.#actor.position);
    const actorGridPos = this.#tileMap.worldPointToGrid(this.#actor.position);
    const targetGridPos = this.#getTargetGridPoint(actorGridPos);

    if (
      !targetGridPos.coincident(actorGridPos) // && this.#tileMap.canHeroSeeGridPoint(actorGridPos)
    ) {
      this.#routeFinder.actor = this.#actor;
      let waypoints = this.#routeFinder.getDumbRouteNextTo(
        actorGridPos,
        targetGridPos,
        this.#actor.getMaxTilesPerMove()
      );
      if (waypoints.length > 0) {
        this.#modifier = new PathFollower(
          { path: waypoints, speed: 100 },
          this.#actor.sprite.modifier
        );
        this.#setActorsPosition(waypoints[waypoints.length - 1]);
      }
    }
  }

  /**
   * Get a random target point.
   * @param {Point} currentGrid
   * @param {number} maxDistance - max movement in any direction
   * @returns {Point}
   */
  #getRandomGridPosition(currentGrid, maxDistance) {
    const x = maths.getRandomIntInclusive(
      currentGrid.x - maxDistance,
      currentGrid.x + maxDistance
    );
    const y = maths.getRandomIntInclusive(
      currentGrid.y - maxDistance,
      currentGrid.y + maxDistance
    );
    const dims = this.#tileMap.getDimsInTiles();
    return new Point(
      maths.clip(x, 0, dims.width - 1),
      maths.clip(y, 0, dims.height - 1)
    );
  }

  /**
   * Set the actors position, updating the tile map occupancy as required.
   * @param {Position} position
   */
  #setActorsPosition(position) {
    const oldGridPoint = this.#tileMap.worldPointToGrid(this.#actor.position);
    this.#actor.position = position;
    const newGridPoint = this.#tileMap.worldPointToGrid(this.#actor.position);
    this.#tileMap.moveTileOccupancyGridPoint(
      this.#actor,
      oldGridPoint,
      newGridPoint
    );
  }
  /**
   * Restore the actor's original position.
   */
  #restorePosition() {
    this.#setActorsPosition(this.#originalPosition);
  }

  /**
   * Undertake the move defined by the modifier.
   * @returns {Promise} fulfils to undefined.
   */
  replay() {
    this.#restorePosition();
    if (this.#modifier) {
      this.#cloneIfOrganic();
      return this.#modifier.applyAsTransientToSprite(this.#actor.sprite);
    }
    return Promise.resolve();
  }

  /**
   * Clone the actor if currently spawning.
   */
  #cloneIfOrganic() {
    if (this.#actor.isOrganic()) {
      const clonedActor = buildActor(this.#actor.almanacEntry);
      clonedActor.position = this.#originalPosition;
      clonedActor.freezeMovement();
      WORLD.addActor(clonedActor);
    }
  }
}

/**
 * Class used to handle multiple ReplayableActorMovers.
 */
class MovementReplayer {
  /** @type {TileMap} */
  #tileMap;
  /** @type {RouteFinder} */
  #routeFinder;
  /** @type {ReplayableActorMover[]} */
  #movers;
  /** @type {boolean} */
  #heroDisengaging;
  /**
   *
   * @param {TileMap} tileMap
   * @param {RouteFinder} routeFinder
   * @param {boolean} heroDisengaging
   */
  constructor(tileMap, routeFinder, heroDisengaging) {
    this.#movers = [];
    this.#tileMap = tileMap;
    this.#routeFinder = routeFinder;
    this.#heroDisengaging = heroDisengaging;
  }

  /**
   * Add the actor and move immediately to hero. Note if the actor's movement
   * is zero, the function does nothing.
   * @param {module:players/actors.Actor} actor
   */
  addAndMoveActor(actor) {
    if (actor.getMaxTilesPerMove() === 0) {
      return;
    }
    const replayableMover = new ReplayableActorMover(
      actor,
      this.#tileMap,
      this.#routeFinder,
      this.#heroDisengaging
    );
    replayableMover.moveInstantly();
    this.#movers.push(replayableMover);
  }

  /**
   * Replay all movements in parallel.
   * @returns {Promise} fulfils to undefined when all movements complete.
   */
  replay() {
    const promises = [];
    this.#movers.forEach((mover) => promises.push(mover.replay()));
    return Promise.all(promises);
  }
}

/**
 * Basic State class
 */
class State {
  constructor() {}

  /**
   * Transition to a new state
   * @returns {Promise} fulfills to null
   */
  async transitionTo(state) {
    await this.onExit().then(() => {
      currentState = state;
      return state.onEntry();
    });
  }

  /**
   * Perform actions on entering the state.
   * @returns {Promise} fulfills to null
   */
  onEntry() {
    return Promise.resolve();
  }
  /**
   * Handle event.
   * @param {number} eventId
   * @param  {module:utils/sprites/sprite~Sprite} sprite - the sprite initiating the event
   * @param {Object} detail - object will depend on the eventId
   * @returns {Promise} fulfills to null
   */
  onEvent(eventIdUnused) {
    return Promise.resolve(null);
  }
  /**
   * Actions when the state exits
   * @returns {Promise} fulfills to null
   */
  onExit() {
    return Promise.resolve(null);
  }
}

/**
 * At WaitingToStart
 */
class WaitingToStart extends State {
  onEntry() {
    LOG.log('WaitingToStart state');
  }
  /**
   * @override
   * @param {number} eventId
   * @param  {module:utils/sprites/sprite~Sprite} point - the point initiating the event
   * @param {Object} detail - object will depend on the eventId
   */
  async onEvent(eventId, pointUnused, detailUnused) {
    if (eventId === EventId.MAIN_MENU) {
      await this.transitionTo(new AtMainMenu());
    } else {
      return Promise.resolve();
    }
  }
}

/**
 * At main Menu
 */
class AtMainMenu extends State {
  onEntry() {
    return showMainMenu().then(async (response) => {
      persistentGame = response !== 'PLAY CASUAL';
      await this.transitionTo(new AtStart());
      return;
    });
  }
}
/**
 * At start state
 */
class AtStart extends State {
  onEntry() {
    LOG.log('Enter AtStart');

    return this.#loadFirstOrContinuationScene()
      .then((continuation) => {
        const name = heroActor.traits.get('NAME');
        let message;
        if (continuation) {
          return UI.showOkDialog(i18n`MESSAGE DUNGEON INTRO CONTINUE ${name}`, {
            okButtonLabel: i18n`BUTTON ENTER DUNGEON`,
            className: 'wall',
          }).then(() => actorDialogs.showRestDialog(heroActor));
        }
        if (!persistentGame) {
          message = i18n`MESSAGE DUNGEON INTRO CASUAL ${name}')}`;
        } else {
          message = i18n`MESSAGE DUNGEON INTRO ${name}`;
        }
        return UI.showOkDialog(message, {
          okButtonLabel: i18n`BUTTON ENTER DUNGEON`,
          className: 'wall',
        });
      })
      .then(() => {
        heroActor.sprite.position =
          WORLD.getTileMap().getWorldPositionOfTileByEntry();
        return;
      })
      .then(() => {
        const intro = SCENE_MANAGER.getCurrentSceneIntro();
        if (intro) {
          return UI.showOkDialog(intro, { className: 'mask' });
        } else {
          return;
        }
      })
      .then(() => currentState.transitionTo(new HeroTurnIdle()));
  }

  /**
   * Load the first scene or if using saved games and there
   * is one in progress, load that.
   * @returns {Promise<boolean>} fulfils to true if continuation
   */
  #loadFirstOrContinuationScene() {
    const savedGame = persistentGame ? restoreGameState() : null;
    if (savedGame) {
      return SCENE_MANAGER.continueFromSavedScene(
        savedGame.sceneLevel,
        savedGame.hero
      ).then(() => true);
    } else {
      return SCENE_MANAGER.switchToFirstScene().then(() => false);
    }
  }
}

/**
 * At Game Over
 */
class AtGameOver extends State {
  async onEntry() {
    LOG.log('Enter AtGameOver');
    if (persistentGame) {
      saveGameState(heroActor);
    }
    addFadingText('YOU DIED!', {
      delaySecs: 1,
      lifetimeSecs: 2,
      position: heroActor.position,
      velocity: new Velocity(0, -100, 0),
    });
    await pause(2)
      .then(() =>
        UI.showOkDialog(i18n`MESSAGE DEFEAT`, {
          okButtonLabel: i18n`BUTTON TRY AGAIN`,
        })
      )
      .then(() => SCENE_MANAGER.unloadCurrentScene())
      .then(() => this.transitionTo(new AtMainMenu()));
  }
}

/**
 * At Game Completed
 */
class AtGameCompleted extends State {
  async onEntry() {
    LOG.log('Enter AtGameCompleted');
    if (persistentGame) {
      saveGameState(heroActor);
    }
    await UI.showOkDialog(i18n`MESSAGE VICTORY`, {
      okButtonLabel: i18n`BUTTON TRY AGAIN`,
    })
      .then(() => SCENE_MANAGER.unloadCurrentScene())
      .then(() => this.transitionTo(new AtMainMenu()));
  }
}

/**
 * State where the hero is in the map.
 */
class HeroTurnIdle extends State {
  constructor() {
    super();
  }

  /**
   * @override
   */
  async onEntry() {
    await super.onEntry();
    LOG.log('Enter HeroTurnIdle');
    await prepareHeroTurn();
    const dead = await doToxicEffectsKillHero();
    if (dead) {
      await this.transitionTo(new AtGameOver());
    }
  }
  /**
   * @override
   * @param {number} eventId
   * @param  {module:utils/sprites/sprite~Sprite} point - the point initiating the event
   * @param {Object} [detail = {}] - object will depend on the eventId
   */
  async onEvent(eventId, point, detail = {}) {
    switch (eventId) {
      case EventId.CLICKED_FREE_GROUND:
        {
          const filter = await disambiguateFilter(
            detail.filter,
            detail.occupant
          );
          if (filter === ClickEventFilter.INTERACT_TILE) {
            await interact(point);
          } else if (filter === ClickEventFilter.OCCUPIED_TILE) {
            await showOccupantDetails(detail.occupant);
          } else {
            await moveHeroToPoint(point, {
              usePathFinder:
                detail.filter !== ClickEventFilter.MOVE_OR_INTERACT_TILE,
            });
          }
          if (heroActor.traits.get('HP', 0) === 0) {
            await this.transitionTo(new AtGameOver());
          } else {
            await this.transitionTo(new ComputerTurnIdle());
          }
        }

        break;
      case EventId.CLICKED_ENTRANCE:
        await UI.showOkDialog(i18n`MESSAGE ENTRANCE STUCK`);
        break;
      case EventId.CLICKED_EXIT: {
        LOG.log('Escaping');
        const unlocked = await tryToUnlockExit();
        if (unlocked) {
          await moveHeroToPoint(point, { usePathFinder: false }).then(() =>
            startNextScene(this)
          );
        }
        break;
      }
    }
    return Promise.resolve(null);
  }
}

/**
 * State where the hero is in the map.
 */
class HeroTurnInteracting extends State {
  constructor() {
    super();
  }

  /**
   * @override
   */
  async onEntry() {
    await super.onEntry();
    LOG.log('Enter HeroTurnInteracting');
    await prepareHeroTurn();
    const dead = await doToxicEffectsKillHero();
    if (dead) {
      await this.transitionTo(new AtGameOver());
    }
  }
  /**
   * @override
   * @param {number} eventId
   * @param  {module:utils/sprites/sprite~Sprite} point - the point initiating the event
   * @param {Object} [detail = {}] - object will depend on the eventId
   */
  async onEvent(eventId, point, detail = {}) {
    switch (eventId) {
      case EventId.CLICKED_FREE_GROUND:
        {
          const filter = await disambiguateFilter(
            detail.filter,
            detail.occupant
          );
          if (filter === ClickEventFilter.INTERACT_TILE) {
            await interact(point);
          } else if (filter === ClickEventFilter.OCCUPIED_TILE) {
            await showOccupantDetails(detail.occupant);
          } else {
            await this.#tryToDisengage(point, {
              usePathFinder:
                detail.filter !== ClickEventFilter.MOVE_OR_INTERACT_TILE,
            });
          }
          if (heroActor.traits.get('HP', 0) === 0) {
            await this.transitionTo(new AtGameOver());
          } else if (
            WORLD.getTileMap().getParticipants(heroActor).length === 0
          ) {
            await this.transitionTo(new ComputerTurnIdle());
          } else {
            await this.transitionTo(new ComputerTurnInteracting());
          }
        }

        break;
      case EventId.CLICKED_ENTRANCE:
        UI.showOkDialog(i18n`MESSAGE ENTRANCE STUCK`);
        break;
      case EventId.CLICKED_EXIT: {
        const unlocked = await tryToUnlockExit();
        if (unlocked) {
          await this.#tryToDisengage(point, { usePathFinder: false }).then(() =>
            startNextScene(this)
          );
        }
        break;
      }
    }
    return Promise.resolve(null);
  }

  /**
   * Try to run. Note the hero always moves. Disengaging means the enemies won't
   * follow.
   * @param {Point} point - position in world.
   * @param {Object} [options = {usePathFinder: true}]
   * @param {boolean} options.usePathFinder - should path finder be used.
   * @returns {Promise} fulfils to undefined
   */
  #tryToDisengage(point, options = { usePathFinder: true }) {
    const tileMap = WORLD.getTileMap();
    const opponents = tileMap.getParticipants(heroActor);
    let respectDisengage = false;
    for (const opponent of opponents) {
      if (opponent.alive && opponent.interaction.respectDisengage(heroActor)) {
        respectDisengage = true;
        break;
      }
    }
    const currentGridPoint = tileMap.worldPointToGrid(heroActor.position);
    const targetGridPoint = tileMap.worldPointToGrid(point);
    const movement = currentGridPoint.getOrthoSeparation(targetGridPoint);
    if (respectDisengage && movement <= MAX_TILES_FOR_DISENGAGEMENT) {
      heroActor.disengaging = true;
    }
    return moveHeroToPoint(point, options).then(() => true);
  }
}

class ComputerTurnIdle extends State {
  constructor() {
    super();
  }
  async onEntry() {
    await super.onEntry();
    LOG.log('Enter ComputerTurnIdle');
    await applyOrganicToActors();
    const tileMap = WORLD.getTileMap();

    const routeFinder = new RouteFinder(tileMap);
    const replayer = new MovementReplayer(
      tileMap,
      routeFinder,
      heroActor.disengaging
    );
    for (const actor of WORLD.getActors().values()) {
      if (actor !== heroActor && actor.alive) {
        if (!actor.isWandering() || dice.rollDice(6) > 3) {
          replayer.addAndMoveActor(actor);
        }
      }
    }
    for (const actor of WORLD.getOrganicActors().values()) {
      if (actor.alive) {
        replayer.addAndMoveActor(actor);
      }
    }
    await replayer.replay();

    const participants = tileMap.getParticipants(heroActor);
    for (const actor of participants) {
      if (actor.isEnemy()) {
        await this.transitionTo(new HeroTurnInteracting());
        return Promise.resolve(null);
      }
    }

    await this.transitionTo(new HeroTurnIdle());
  }
}

class ComputerTurnInteracting extends State {
  constructor() {
    super();
  }
  async onEntry() {
    await super.onEntry();
    await applyOrganicToActors();
    const tileMap = WORLD.getTileMap();

    const routeFinder = new RouteFinder(tileMap);
    const replayer = new MovementReplayer(
      tileMap,
      routeFinder,
      heroActor.disengaging
    );
    const participants = tileMap.getParticipants(heroActor);
    for (const actor of WORLD.getActors().values()) {
      if (actor !== heroActor && actor.alive && actor.interaction) {
        if (participants.includes(actor) && actor.willInteract()) {
          await actor.interaction.enact(heroActor);
        } else {
          replayer.addAndMoveActor(actor);
        }
      }
    }
    for (const actor of WORLD.getOrganicActors().values()) {
      if (actor.alive) {
        replayer.addAndMoveActor(actor);
      }
    }
    await replayer.replay();

    if (heroActor.traits.get('HP', 0) === 0) {
      await this.transitionTo(new AtGameOver());
    } else if (participants.length === 0) {
      await this.transitionTo(new HeroTurnIdle());
    } else {
      await this.transitionTo(new HeroTurnInteracting());
    }

    return Promise.resolve(null);
  }
}

/**
 * Prepare hero turn
 * @returns {Promise}
 */
function prepareHeroTurn() {
  heroActor.disengaging = false;
  const tileMap = WORLD.getTileMap();
  const routes = new RouteFinder(tileMap, heroActor).getAllRoutesFrom(
    tileMap.worldPointToGrid(heroActor.sprite.position),
    heroActor.getMaxTilesPerMove()
  );
  tileMap.setMovementRoutes(routes);
  tileMap.setInteractActors(tileMap.getParticipants(heroActor));
  tileMap.calcReachableDoors(heroActor.position);
  return Promise.resolve(null);
}

/**
 * Apply any toxic effects to the hero.
 * @returns {boolean} true if dead.
 */
function doToxicEffectsKillHero() {
  if (heroActor.toxify?.isActive) {
    heroActor.toxify.enact(heroActor);
    return heroActor.traits.getInt('HP', 0) <= 0;
  }
  return false;
}

/**
 * Move to point
 * @param {Point} point
 * @param {Object} [options = {usePathFinder:true}]
 * @param {boolean} options.usePathFinder
 * @returns {Promise}
 */
function moveHeroToPoint(point, options = { usePathFinder: true }) {
  const tileMap = WORLD.getTileMap();
  let waypoints;
  if (options.usePathFinder) {
    waypoints = tileMap.getWaypointsToWorldPoint(point);
  } else {
    waypoints = [heroActor.position, point];
  }
  tileMap.setMovementRoutes(null);
  tileMap.setInteractActors(null);
  if (waypoints) {
    const modifier = new PathFollower(
      { path: waypoints, speed: 100 },
      heroActor.sprite.modifier
    );
    return modifier.applyAsTransientToSprite(heroActor.sprite);
  } else {
    return Promise.resolve();
  }
}

/**
 * Apply organic actions to all actors.
 * @returns {Promise} fulfils to undefined on completion.
 */
function applyOrganicToActors() {
  const tileMap = WORLD.getTileMap();
  const promises = [];
  WORLD.getOrganicActors().forEach((organic) => {
    const participants = tileMap.getCoincidentActors(organic);
    participants.forEach((actor) => {
      if (actor.alive && !actor.isOrganic() && organic.interaction) {
        promises.push(organic.interaction.enact(actor));
      }
    });
  });

  return Promise.all(promises);
}
/**
 * Interact with point
 * @param {Point} point - position in world.
 * @returns {Promise}
 */
function interact(point) {
  /** @type {module:utils/tileMaps/tileMap~TileMap} */
  const tileMap = WORLD.getTileMap();
  const tile = tileMap.getTileAtWorldPoint(point);
  const targets = tile.getOccupants();
  const promises = [];
  for (const target of targets.values()) {
    if (target.interaction) {
      promises.push(target.interaction.react(heroActor));
    }
  }
  return Promise.all(promises);
}

/**
 * Start next scene.
 * @param {State} currentState
 * @returns {Promise} fulfils to undefined.
 */
function startNextScene(currentState) {
  heroActor.traits.clearTransientFxTraits();
  if (persistentGame) {
    saveGameState(heroActor);
  }
  if (!SCENE_MANAGER.areThereMoreScenes()) {
    return currentState.transitionTo(new AtGameCompleted());
  }
  return SCENE_MANAGER.unloadCurrentScene()
    .then(() => actorDialogs.showRestDialog(heroActor))
    .then(() => SCENE_MANAGER.switchToNextScene())
    .then((scene) => {
      heroActor.sprite.position =
        WORLD.getTileMap().getWorldPositionOfTileByEntry();
      return scene;
    })
    .then((scene) => {
      if (scene.intro) {
        return UI.showOkDialog(scene.intro, { className: 'wall' });
      } else {
        return;
      }
    })
    .then(() => currentState.transitionTo(new HeroTurnIdle()));
}

/**
 * Show occupant details.
 * @param {module:players/actors.Actor} occupant
 * @returns {Promise} fulfils to undefined.
 */
function showOccupantDetails(occupant) {
  if (!occupant) {
    LOG.error('Clicked on tile but no occupant to view.');
    return Promise.resolve();
  }
  if (occupant.isHiddenArtefact()) {
    return UI.showOkDialog(i18n`MESSAGE GROUND DISTURBED`);
  }

  return actorDialogs.showActorDetailsDialog(occupant, {
    allowConsumption: occupant.isHero(),
    allowMagicUse: occupant.isHero(),
  });
}

/**
 * Trigger an event. This will then be passed to the current State to handle.
 * @param {number} eventId
 * @param  {module:utils/sprites/sprite~Sprite} sprite - the sprite initiating the event
 * @param {Object} detail - object will depend on the eventId
 */
function triggerEvent(eventId, sprite, detail) {
  if (ignoreEvents) {
    LOG.debug(`Ignoring event ${eventId} as still processing earlier event.`);
    return;
  }
  ignoreEvents = true;
  currentState.onEvent(eventId, sprite, detail).then(() => {
    ignoreEvents = false;
  });
}

/**
 * @param {ClickEventFilter} filter
 * @param {module:players/actors.Actor} occupant
 * @returns {Promise<ClickEventFilter>}
 */
function disambiguateFilter(filter, occupant) {
  if (filter === ClickEventFilter.MOVE_OR_INTERACT_TILE) {
    if (occupant?.isHiddenArtefact()) {
      const storageDetails = occupant.storeManager.getFirstStorageDetails();
      const artefact = storageDetails?.artefact;
      return artefact
        ? ClickEventFilter.INTERACT_TILE
        : ClickEventFilter.MOVEMENT_TILE;
    }

    return UI.showChoiceDialog(
      i18n`DIALOG TITLE CHOICES`,
      i18n`MESSAGE SEARCH OR MOVE`,
      [i18n`BUTTON CLIMB OVER`, i18n`BUTTON SEARCH`]
    ).then((choice) => {
      if (choice === 0) {
        return ClickEventFilter.MOVEMENT_TILE;
      } else {
        return ClickEventFilter.INTERACT_TILE;
      }
    });
  }
  return filter;
}
/**
 * Set the current hero sprite.
 * @returns {module:players/actors~Actor}
 */
function getHeroActor() {
  return heroActor;
}

/** Unlock the exit if necessary.
 * @returns {Promise} fulfils to true if exit can be unlocked.
 */
function tryToUnlockExit() {
  if (exitKeyArtefact) {
    if (heroActor.storeManager.discard(exitKeyArtefact)) {
      return UI.showOkDialog(i18n`MESSAGE KEY UNLOCKS EXIT`).then(() => true);
    } else {
      return UI.showOkDialog(i18n`MESSAGE EXIT LOCKED`).then(() => false);
    }
  } else {
    return Promise.resolve(true);
  }
}

/**
 * Start
 * @param {module:players/actors.Actor} actor - the hero actor
 */
function setHero(actor) {
  heroActor = actor;
}

/** Lock the exit. The actor will need to possess the artefact unlock it.
 * @param {module:players/ArtefactStoreManager.Artefact}
 */
function setExitKeyArtefact(artefact) {
  exitKeyArtefact = artefact;
}

/**
 * @type {module:players/actors~Actor}
 */
let heroActor;

/**
 * @type {State}
 */
let currentState = new WaitingToStart();

/**
 * Flag to determine whether events are accepted.
 */
let ignoreEvents = false;

/** Key required to unlock the exit. @type {module:players/artefacts.Artefact} */
let exitKeyArtefact;

/**
 * Single instance of the turn manager.
 */
const TURN_MANAGER = {
  EventId: EventId,
  getHeroActor: getHeroActor,
  setHero: setHero,
  triggerEvent: triggerEvent,
  setExitKeyArtefact: setExitKeyArtefact,
};

export default TURN_MANAGER;

/**
 * @file Manage the game turns. The turnManager is a state machine and implemented
 * as a singleton.
 *
 * @module utils/game/turnManager/turnManager
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
import { RouteFinder } from '../tileMaps/pathFinder.js';
import { PathFollower } from '../sprites/movers.js';
import { ClickEventFilter } from '../tileMaps/tileMap.js';

import WORLD from './world.js';

import UI from '../dom/ui.js';
import SCENE_MANAGER from './sceneManager.js';

import { addFadingText } from '../effects/transient.js';
import { pause } from '../timers.js';
import { Point, Position, Velocity } from '../geometry.js';
import LOG from '../logging.js';
import * as maths from '../maths.js';
import { showMainMenu } from '../../dialogs/mainMenu.js';
import { Actor } from './actors.js';
import * as actorDialogs from '../../dialogs/actorDialogs.js';
import { i18n } from '../messageManager.js';
import * as dice from '../dice.js';

/**
 * Factor that is multiplied by the maxMovesPerTurn property of an actor to determine
 * if it will bother trying to reach the hero.
 */
const TOO_MANY_TURNS_TO_REACH = 2;
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

  /**
   *
   * @param {Actor} actor
   * @param {TileMap} tileMap
   * @param {RouteFinder} routeFinder
   */
  constructor(actor, tileMap, routeFinder) {
    this.#actor = actor;
    this.#tileMap = tileMap;
    this.#routeFinder = routeFinder;
  }

  /**
   * Move actor to hero using the route finder. The move takes place instantly
   * but can be replayed using the replay method.
   */
  moveInstantly() {
    this.#originalPosition = Position.copy(this.#actor.position);
    const actorGridPos = this.#tileMap.worldPointToGrid(this.#actor.position);
    const targetGridPos = this.#actor.isWandering()
      ? this.#getRandomGridPosition(actorGridPos, this.#actor.maxTilesPerMove)
      : this.#tileMap.worldPointToGrid(heroActor.position);

    const orthoSeparation =
      Math.abs(targetGridPos.x - actorGridPos.x) +
      Math.abs(targetGridPos.y - actorGridPos.y);
    const maxSeparation = this.#actor.maxTilesPerMove * TOO_MANY_TURNS_TO_REACH;
    if (
      orthoSeparation <= maxSeparation &&
      this.#tileMap.canHeroSeeGridPoint(actorGridPos)
    ) {
      this.#routeFinder.actor = this.#actor;
      let waypoints = this.#routeFinder.getDumbRouteNextTo(
        actorGridPos,
        targetGridPos,
        this.#actor.maxTilesPerMove
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
      return this.#modifier.applyAsTransientToSprite(this.#actor.sprite);
    }
    return Promise.resolve();
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
  /**
   *
   * @param {TileMap} tileMap
   * @param {RouteFinder} routeFinder
   */
  constructor(tileMap, routeFinder) {
    this.#movers = [];
    this.#tileMap = tileMap;
    this.#routeFinder = routeFinder;
  }

  /**
   * Add the actor and move immediately to hero
   * @param {Actor} actor
   */
  addAndMoveActor(actor) {
    const replayableMover = new ReplayableActorMover(
      actor,
      this.#tileMap,
      this.#routeFinder
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
      this.transitionTo(new AtMainMenu());
    }
  }
}

/**
 * At main Menu
 */
class AtMainMenu extends State {
  onEntry() {
    return showMainMenu().then(() => this.transitionTo(new AtStart()));
  }
}
/**
 * At start state
 */
class AtStart extends State {
  onEntry() {
    LOG.log('Enter AtStart');
    return UI.showOkDialog(i18n`MESSAGE DUNGEON INTRO`, {
      okButtonLabel: i18n`BUTTON ENTER DUNGEON`,
      className: 'wall',
    })
      .then(() => SCENE_MANAGER.switchToFirstScene())
      .then((scene) => {
        heroActor.sprite.position =
          WORLD.getTileMap().getWorldPositionOfTileByEntry();
        return scene;
      })
      .then((scene) => {
        if (scene.intro) {
          return UI.showOkDialog(scene.intro, { className: 'mask' });
        } else {
          return;
        }
      })
      .then(() => currentState.transitionTo(new HeroTurnIdle()));
  }
}

/**
 * At Game Over
 */
class AtGameOver extends State {
  async onEntry() {
    LOG.log('Enter AtGameOver');
    addFadingText('YOU DIED!', {
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
  }
  /**
   * @override
   * @param {number} eventId
   * @param  {module:utils/sprites/sprite~Sprite} point - the point initiating the event
   * @param {Object} detail - object will depend on the eventId
   */
  async onEvent(eventId, point, detail) {
    switch (eventId) {
      case EventId.CLICKED_FREE_GROUND:
        {
          const filter = detail?.filter;
          if (filter === ClickEventFilter.INTERACT_TILE) {
            await interact(point);
          } else if (filter === ClickEventFilter.OCCUPIED_TILE) {
            await showOccupantDetails(detail.occupant);
          } else {
            await moveHeroToPoint(point);
          }
          this.transitionTo(new ComputerTurnIdle());
        }

        break;
      case EventId.CLICKED_ENTRANCE:
        await UI.showOkDialog(i18n`MESSAGE ENTRANCE STUCK`);
        break;
      case EventId.CLICKED_EXIT:
        LOG.log('Escaping');
        await moveHeroToPoint(point, false)
          .then(() => UI.showOkDialog(i18n`MESSAGE OPEN EXIT`))
          .then(() => startNextScene(this));
        break;
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
  }
  /**
   * @override
   * @param {number} eventId
   * @param  {module:utils/sprites/sprite~Sprite} point - the point initiating the event
   * @param {Object} detail - object will depend on the eventId
   */
  async onEvent(eventId, point, detail) {
    switch (eventId) {
      case EventId.CLICKED_FREE_GROUND:
        {
          const filter = detail?.filter;
          if (filter === ClickEventFilter.INTERACT_TILE) {
            await interact(point);
          } else if (filter === ClickEventFilter.OCCUPIED_TILE) {
            await showOccupantDetails(detail.occupant);
          } else {
            await this.#tryToRun(point);
          }
          if (WORLD.getTileMap().getParticipants(heroActor).length === 0) {
            this.transitionTo(new ComputerTurnIdle());
          } else {
            this.transitionTo(new ComputerTurnInteracting());
          }
        }

        break;
      case EventId.CLICKED_ENTRANCE:
        UI.showOkDialog(i18n`MESSAGE ENTRANCE STUCK`);
        break;
      case EventId.CLICKED_EXIT:
        await this.#tryToRun(point, false).then((success) => {
          if (success) {
            return UI.showOkDialog(i18n`MESSAGE OPEN EXIT WHILE FIGHTING`).then(
              () => startNextScene(this)
            );
          } else {
            return Promise.resolve();
          }
        });
        break;
    }
    return Promise.resolve(null);
  }

  /**
   * Try to run
   * @param {Point} point - position in world.
   * @param {boolean} [usePathFinder = true] - should path finder be used.
   * @returns {Promise} fulfils to true if successful else false.
   */
  #tryToRun(point, usePathFinder = true) {
    const opponents = WORLD.getTileMap().getParticipants(heroActor);
    for (const opponent of opponents) {
      if (opponent.alive && !opponent.interaction.allowEscape(heroActor)) {
        return Promise.resolve(false);
      }
    }
    return moveHeroToPoint(point, usePathFinder).then(() => true);
  }
}

class ComputerTurnIdle extends State {
  constructor() {
    super();
  }
  async onEntry() {
    await super.onEntry();
    LOG.log('Enter ComputerTurnIdle');
    const tileMap = WORLD.getTileMap();

    const routeFinder = new RouteFinder(tileMap);
    const replayer = new MovementReplayer(tileMap, routeFinder);
    const heroGridPoint = tileMap.worldPointToGrid(heroActor.position);
    for (const actor of WORLD.getActors().values()) {
      if (actor !== heroActor && actor.alive) {
        if (!actor.isWandering() || dice.rollDice(6) > 3) {
          replayer.addAndMoveActor(actor);
        }
      }
    }
    await replayer.replay();
    const participants = tileMap.getParticipants(heroActor);
    for (const actor of participants) {
      if (actor.isEnemy()) {
        this.transitionTo(new HeroTurnInteracting());
        return Promise.resolve(null);
      }
    }

    this.transitionTo(new HeroTurnIdle());
  }
}

class ComputerTurnInteracting extends State {
  constructor() {
    super();
  }
  async onEntry() {
    await super.onEntry();
    LOG.log('Enter ComputerTurnInteracting');
    const tileMap = WORLD.getTileMap();

    const routeFinder = new RouteFinder(tileMap);
    const replayer = new MovementReplayer(tileMap, routeFinder);
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
    await replayer.replay();
    if (heroActor.traits.get('HP', 0) === 0) {
      this.transitionTo(new AtGameOver());
    } else if (participants.length === 0) {
      this.transitionTo(new HeroTurnIdle());
    } else {
      this.transitionTo(new HeroTurnInteracting());
    }

    return Promise.resolve(null);
  }
}

/**
 * Prepare hero turn
 * @returns {Promise}
 */
function prepareHeroTurn() {
  const tileMap = WORLD.getTileMap();
  const routes = new RouteFinder(tileMap, heroActor).getAllRoutesFrom(
    tileMap.worldPointToGrid(heroActor.sprite.position),
    heroActor.maxTilesPerMove
  );
  tileMap.setMovementRoutes(routes);
  tileMap.setInteractActors(tileMap.getParticipants(heroActor));
  tileMap.calcReachableDoors(heroActor.position);
  return Promise.resolve(null);
}

/**
 * Move to point
 * @param {Point} point
 * @param {boolean} [usePathFinder = true]
 * @returns {Promise}
 */
function moveHeroToPoint(point, usePathFinder = true) {
  const tileMap = WORLD.getTileMap();
  let waypoints;
  if (usePathFinder) {
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
  if (!SCENE_MANAGER.areThereMoreScenes()) {
    return currentState.transitionTo(new AtGameCompleted());
  }
  return SCENE_MANAGER.switchToNextScene()
    .then((scene) => {
      heroActor.sprite.position =
        WORLD.getTileMap().getWorldPositionOfTileByEntry();
      return scene;
    })
    .then((scene) => {
      if (scene.intro) {
        return UI.showOkDialog(scene.intro, { className: 'mask' });
      } else {
        return;
      }
    })
    .then(() => currentState.transitionTo(new HeroTurnIdle()));
}

/**
 * Show occupant details.
 * @param {Actor} occupant
 * @returns {Promise} fulfils to undefined.
 */
function showOccupantDetails(occupant) {
  if (!occupant) {
    LOG.error('Clicked on tile but no occupant to view.');
    return Promise.resolve();
  }
  const hidden = occupant.traits?.get('HIDDEN_ARTEFACT');
  if (hidden) {
    return UI.showOkDialog(i18n`MESSAGE GROUND DISTURBED`);
  }
  return actorDialogs.showActorDetailsDialog(occupant);
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
 * Set the current hero sprite.
 * @returns {module:utils/game/actors~Actor}
 */
function getHeroActor() {
  return heroActor;
}

/**
 * Start
 * @param {module:utils/game/actors~Actor} actor - the hero actor
 */
function setHero(actor) {
  heroActor = actor;
}

/**
 * @type {module:utils/game/actors~Actor}
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

/**
 * Single instance of the turn manager.
 */
const TURN_MANAGER = {
  EventId: EventId,
  getHeroActor: getHeroActor,
  setHero: setHero,
  triggerEvent: triggerEvent,
};

export default TURN_MANAGER;

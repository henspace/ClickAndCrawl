/**
 * @file Manage the game turns. The turnManager is a state machine and implemented
 * as a singleton.
 *
 * @module utils/game/turnManager/turnManager
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
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
import * as fighting from '../../dnd/fighting.js';

import UI from '../dom/ui.js';
import SCENE_MANAGER from './sceneManager.js';
import GAME from './game.js';

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
  START_GAME: 0,
  CLICKED_FREE_GROUND: 1,
  CLICKED_ENTRANCE: 2,
  CLICKED_EXIT: 3,
};

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
   * @param  {import('../sprites/sprite.js').Sprite} sprite - the sprite initiating the event
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
    console.log('WaitingToStart state');
  }
  /**
   * @override
   * @param {number} eventId
   * @param  {import('../sprites/sprite.js').Sprite} point - the point initiating the event
   * @param {Object} detail - object will depend on the eventId
   */
  async onEvent(eventId, point, detail) {
    if (eventId === EventId.START_GAME) {
      this.transitionTo(new AtStart());
    }
  }
}

/**
 * At start state
 */
class AtStart extends State {
  onEntry() {
    console.log('Enter AtStart');
    UI.showOkDialog('You are in a dark and dingy dungeon.', 'Conquer it!').then(
      () => startNewScene(this, SCENE_MANAGER.getFirstScene())
    );
  }
}

/**
 * At Game Over
 */
class AtGameOver extends State {
  async onEntry() {
    console.log('Enter AtGameOver');
    await UI.showOkDialog('Game over. You died.', 'Try again').then(() =>
      startNewScene(this, SCENE_MANAGER.getFirstScene())
    );
  }
}

/**
 * At Game Completed
 */
class AtGameCompleted extends State {
  async onEntry() {
    console.log('Enter AtGameCompleted');
    await UI.showOkDialog("You've done it. Well done.", 'Try again').then(() =>
      startNewScene(this, SCENE_MANAGER.getFirstScene())
    );
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
    console.log('Enter HeroTurnIdle');
    await prepareHeroTurn();
  }
  /**
   * @override
   * @param {number} eventId
   * @param  {import('../sprites/sprite.js').Sprite} point - the point initiating the event
   * @param {Object} detail - object will depend on the eventId
   */
  async onEvent(eventId, point, detail) {
    switch (eventId) {
      case EventId.CLICKED_FREE_GROUND:
        {
          if (detail?.filter === ClickEventFilter.COMBAT_TILE) {
            console.error('Unexpected click on combat tile ignored.');
          } else {
            await moveHeroToPoint(point);
          }
          this.transitionTo(new ComputerTurnIdle());
        }

        break;
      case EventId.CLICKED_ENTRANCE:
        alert('Wow! Leaving so early. That bit of code is not ready yet.');
        break;
      case EventId.CLICKED_EXIT:
        console.log('Escaping');
        await moveHeroToPoint(point);
        if (SCENE_MANAGER.areThereMoreScenes()) {
          await startNewScene(this, SCENE_MANAGER.getNextScene());
        } else {
          this.transitionTo(new AtGameCompleted());
        }
        break;
    }
    return Promise.resolve(null);
  }
}

/**
 * State where the hero is in the map.
 */
class HeroTurnFighting extends State {
  constructor() {
    super();
  }

  /**
   * @override
   */
  async onEntry() {
    await super.onEntry();
    console.log('Enter HeroTurnFighting');
    await prepareHeroTurn();
  }
  /**
   * @override
   * @param {number} eventId
   * @param  {import('../sprites/sprite.js').Sprite} point - the point initiating the event
   * @param {Object} detail - object will depend on the eventId
   */
  async onEvent(eventId, point, detail) {
    switch (eventId) {
      case EventId.CLICKED_FREE_GROUND:
        {
          if (detail?.filter === ClickEventFilter.COMBAT_TILE) {
            await this.#fight(point);
          } else {
            await this.#tryToRun(point);
          }
          if (WORLD.getTileMap().getParticipants(heroActor).length === 0) {
            this.transitionTo(new ComputerTurnIdle());
          } else {
            this.transitionTo(new ComputerTurnFighting());
          }
        }

        break;
      case EventId.CLICKED_ENTRANCE:
        alert('Wow! Leaving so early. That bit of code is not ready yet.');
        break;
      case EventId.CLICKED_EXIT:
        console.log('Escaping');
        await moveHeroToPoint(point);
        if (SCENE_MANAGER.areThereMoreScenes()) {
          await startNewScene(this, SCENE_MANAGER.getNextScene());
        } else {
          this.transitionTo(new AtGameCompleted());
        }
        break;
    }
    return Promise.resolve(null);
  }

  /**
   * Fight point
   * @param {Point} point - position in world.
   * @returns {Promise}
   */
  #fight(point) {
    /** @type {import('../tileMaps/tileMap.js').TileMap} */
    const tileMap = WORLD.getTileMap();
    const tile = tileMap.getTileAtWorldPoint(point);
    const targets = tile.getOccupants();
    const promises = [];
    for (const target of targets.values()) {
      promises.push(fighting.resolveAttackerDefender(heroActor, target));
    }
    return Promise.all(promises);
  }

  /**
   * Try to run
   * @param {Point} point - position in world.
   * @returns {Promise}
   */
  #tryToRun(point) {
    const opponents = WORLD.getTileMap().getParticipants(heroActor);
    for (const opponent of opponents) {
      if (!fighting.tryToRunFromOpponent(heroActor, opponent)) {
        return Promise.resolve(false);
      }
    }
    return moveHeroToPoint(point);
  }
}

class ComputerTurnIdle extends State {
  constructor() {
    super();
  }
  async onEntry() {
    await super.onEntry();
    console.log('Enter ComputerTurnIdle');
    const tileMap = WORLD.getTileMap();

    const routeFinder = new RouteFinder(tileMap);
    for (const actor of WORLD.getActors().values()) {
      if (actor !== heroActor) {
        await moveActorUsingRouteFinder(actor, tileMap, routeFinder);
      }
    }
    if (tileMap.getParticipants(heroActor).length === 0) {
      this.transitionTo(new HeroTurnIdle());
    } else {
      this.transitionTo(new HeroTurnFighting());
    }

    return Promise.resolve(null);
  }
}

class ComputerTurnFighting extends State {
  constructor() {
    super();
  }
  async onEntry() {
    await super.onEntry();
    console.log('Enter ComputerTurnFighting');
    const tileMap = WORLD.getTileMap();

    const routeFinder = new RouteFinder(tileMap);
    const participants = tileMap.getParticipants(heroActor);
    for (const actor of WORLD.getActors().values()) {
      if (actor !== heroActor) {
        if (participants.includes(actor)) {
          await fighting.resolveAttackerDefender(actor, heroActor);
        } else {
          await moveActorUsingRouteFinder(actor, tileMap, routeFinder);
        }
      }
    }
    if (heroActor.traits.get('HP') === 0) {
      this.transitionTo(new AtGameOver());
    } else if (participants.length === 0) {
      this.transitionTo(new HeroTurnIdle());
    } else {
      this.transitionTo(new HeroTurnFighting());
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
  tileMap.setCombatActors(tileMap.getParticipants(heroActor));
  return Promise.resolve(null);
}

/**
 * Move to point
 * @param {Point} point
 * @returns {Promise}
 */
function moveHeroToPoint(point) {
  const tileMap = WORLD.getTileMap();
  const waypoints = tileMap.getWaypointsToWorldPoint(point);
  tileMap.setMovementRoutes(null);
  tileMap.setCombatActors(null);
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
 * Move actor to hero using the route finder
 * @param {Actor} actor
 * @param {TileMap} tileMap
 * @param {RouteFinder} routeFinder
 */
async function moveActorUsingRouteFinder(actor, tileMap, routeFinder) {
  const heroGridPos = tileMap.worldPointToGrid(heroActor.position);
  const actorGridPos = tileMap.worldPointToGrid(actor.position);
  const orthoSeparation =
    Math.abs(heroGridPos.x - actorGridPos.x) +
    Math.abs(heroGridPos.y - actorGridPos.y);
  const maxSeparation = actor.maxTilesPerMove * TOO_MANY_TURNS_TO_REACH;
  if (
    orthoSeparation <= maxSeparation &&
    tileMap.canHeroSeeGridPoint(actorGridPos)
  ) {
    routeFinder.actor = actor;
    const waypoints = routeFinder.getDumbRouteNextTo(
      actorGridPos,
      heroGridPos,
      actor.maxTilesPerMove
    );
    if (waypoints.length > 0) {
      const modifier = new PathFollower(
        { path: waypoints, speed: 200 },
        actor.sprite.modifier
      );
      await modifier.applyAsTransientToSprite(actor.sprite);
    }
  }
}

/**
 * Start a new scene.
 * @param {State} currentState
 * @param {AbstractScene} scene
 * @returns {Promise} fulfils to undefined.
 */
function startNewScene(currentState, scene) {
  WORLD.clearAll();
  GAME.setScene(scene).then(() => {
    heroActor.sprite.position =
      WORLD.getTileMap().getWorldPositionOfTileByEntry();
    return currentState.transitionTo(new HeroTurnIdle());
  });
}

/**
 * Trigger an event. This will then be passed to the current State to handle.
 * @param {number} eventId
 * @param  {import('../sprites/sprite.js').Sprite} sprite - the sprite initiating the event
 * @param {Object} detail - object will depend on the eventId
 */
function triggerEvent(eventId, sprite, detail) {
  if (ignoreEvents) {
    console.debug(
      `Ignoring event ${eventId} as still processing earlier event.`
    );
    return;
  }
  ignoreEvents = true;
  currentState.onEvent(eventId, sprite, detail).then(() => {
    ignoreEvents = false;
  });
}

/**
 * Set the current hero sprite.
 * @returns {import('./actors.js').Actor}
 */
function getHeroActor() {
  return heroActor;
}

/**
 * Start
 * @param {import('./actors.js').Actor} actor - the hero actor
 */
function setHero(actor) {
  heroActor = actor;
}

/**
 * @type {import('./actors.js').Actor}
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

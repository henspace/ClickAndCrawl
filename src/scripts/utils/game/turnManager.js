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

import WORLD from './world.js';

/**
 * Enumeration of supported events
 * @enum {number}
 */
const EventId = {
  CLICKED_FREE_GROUND: 0,
  CLICKED_ENTRANCE: 1,
  CLICKED_EXIT: 2,
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
  transitionTo(state) {
    this._onExit().then(() => {
      currentState = state;
      return state._onEntry();
    });
  }

  /**
   * Perform actions on entering the state.
   * @returns {Promise} fulfills to null
   */
  _onEntry() {
    console.log(`Entering ${this.constructor.name} state.`);
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
  _onExit() {
    console.log(`Exiting ${this.constructor.name} state.`);
    return Promise.resolve(null);
  }
}

/**
 * At start state
 */
class AtStart extends State {
  _onExit() {
    heroActor.sprite.position = WORLD.getTileMap().getWorldPositionOfEntrance();
    return Promise.resolve(null);
  }
}
/**
 * State where the hero is in the map.
 */
class HeroInMapIdle extends State {
  constructor() {
    super();
  }

  /**
   * @override
   */
  _onEntry() {
    const tileMap = WORLD.getTileMap();
    const routes = new RouteFinder(tileMap, heroActor).getAllRoutesFrom(
      tileMap.worldPointToGrid(heroActor.sprite.position),
      heroActor.maxTilesPerMove
    );
    tileMap.setHighlightedRoutes(routes);
    return Promise.resolve(null);
  }
  /**
   * @override
   * @param {number} eventId
   * @param  {import('../sprites/sprite.js').Sprite} point - the point initiating the event
   * @param {Object} detail - object will depend on the eventId
   */
  onEvent(eventId, point, detailUnused) {
    switch (eventId) {
      case EventId.CLICKED_FREE_GROUND: {
        const tileMap = WORLD.getTileMap();
        const waypoints = tileMap.getWaypointsToWorldPoint(point);
        tileMap.setHighlightedRoutes(null);
        if (waypoints) {
          const modifier = new PathFollower(
            { path: waypoints, speed: 100 },
            heroActor.sprite.modifier
          );
          modifier
            .applyAsTransientToSprite(heroActor.sprite)
            .then(() => this.transitionTo(new ComputerInMap()));
        }
        break;
      }
      case EventId.CLICKED_ENTRANCE:
        alert('Wow! Leaving so early. That bit of code is not ready yet.');
        break;
      case EventId.CLICKED_EXIT:
        alert('Trying to escape. That bit of code is not ready yet.');
        break;
    }
    return Promise.resolve(null);
  }
}

class ComputerInMap extends State {
  constructor() {
    super();
  }
  async _onEntry() {
    await super._onEntry();
    const tileMap = WORLD.getTileMap();
    const heroGridPos = tileMap.worldPointToGrid(heroActor.position);
    const routeFinder = new RouteFinder(tileMap);
    for (const actor of WORLD.getActors().values()) {
      if (actor !== heroActor) {
        routeFinder.actor = actor;
        const actorGridPos = tileMap.worldPointToGrid(actor.position);
        if (tileMap.canHeroSeeGridPoint(actorGridPos)) {
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
    }
    this.transitionTo(new HeroInMapIdle());
    return Promise.resolve(null);
  }
}

/**
 * @type {import('./actors.js').Actor}
 */
let heroActor;

/**
 * @type {State}
 */
let currentState = new AtStart();

/**
 * Trigger an event. This will then be passed to the current State to handle.
 * @param {number} eventId
 * @param  {import('../sprites/sprite.js').Sprite} sprite - the sprite initiating the event
 * @param {Object} detail - object will depend on the eventId
 */
function triggerEvent(eventId, sprite, detail) {
  currentState.onEvent(eventId, sprite, detail);
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
function startWithHero(actor) {
  heroActor = actor;
  currentState.transitionTo(new HeroInMapIdle());
}

/**
 * Single instance of the turn manager.
 */
const TURN_MANAGER = {
  EventId: EventId,
  getHeroActor: getHeroActor,
  startWithHero: startWithHero,
  triggerEvent: triggerEvent,
};

export default TURN_MANAGER;

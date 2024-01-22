/**
 * @file Manage the game turns. The turnManager is a state machine.
 *
 * @module utils/game/turnManager/turnManager
 *
 * @license
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

import * as world from './world.js';
/**
 * @typedef {import('./actors.js').Actor} Actor
 * @typedef {import('../sprites/sprite.js').Sprite} Sprite
 */

/**
 * Enumeration of supported events
 * @enum {number}
 */
export const EventId = {
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
   * @param {Sprite} sprite - the sprite initiating the event
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
    starActor.sprite.position = world.getTileMap().getWorldPositionOfEntrance();
    return Promise.resolve(null);
  }
}
/**
 * State where the star is in the map.
 */
class StarInMapIdle extends State {
  constructor() {
    super();
  }

  /**
   * @override
   */
  _onEntry() {
    const tileMap = world.getTileMap();
    const routes = new RouteFinder(tileMap, starActor).getAllRoutesFrom(
      tileMap.worldPointToGrid(starActor.sprite.position),
      starActor.maxTilesPerMove
    );
    tileMap.setHighlightedRoutes(routes);
    return Promise.resolve(null);
  }
  /**
   * @override
   * @param {number} eventId
   * @param {Sprite} point - the point initiating the event
   * @param {Object} detail - object will depend on the eventId
   */
  onEvent(eventId, point, detailUnused) {
    switch (eventId) {
      case EventId.CLICKED_FREE_GROUND: {
        const tileMap = world.getTileMap();
        const waypoints = tileMap.getWaypointsToWorldPoint(point);
        tileMap.setHighlightedRoutes(null);
        if (waypoints) {
          const modifier = new PathFollower(
            { path: waypoints, speed: 100 },
            starActor.sprite.modifier
          );
          modifier
            .applyAsTransientToSprite(starActor.sprite)
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
    const tileMap = world.getTileMap();
    const starGridPos = tileMap.worldPointToGrid(starActor.position);
    const routeFinder = new RouteFinder(tileMap);
    for (const actor of world.getActors().values()) {
      if (actor !== starActor) {
        routeFinder.actor = actor;
        const actorGridPos = tileMap.worldPointToGrid(actor.position);
        const waypoints = routeFinder.getDumbRouteNextTo(
          actorGridPos,
          starGridPos,
          actor.maxTilesPerMove
        );
        if (waypoints.length > 0) {
          const modifier = new PathFollower(
            { path: waypoints, speed: 200 },
            actor.sprite.modifier
          );
          await modifier.applyAsTransientToSprite(actor.sprite);
        } else {
          this.transitionTo(new StarInMapIdle());
        }
      }
    }
    this.transitionTo(new StarInMapIdle());
    return Promise.resolve(null);
  }
}

/**
 * @type {Actor}
 */
let starActor;

/**
 * @type {State}
 */
let currentState = new AtStart();

/**
 * Trigger an event. This will then be passed to the current State to handle.
 * @param {number} eventId
 * @param {Sprite} sprite - the sprite initiating the event
 * @param {Object} detail - object will depend on the eventId
 */
export function triggerEvent(eventId, sprite, detail) {
  currentState.onEvent(eventId, sprite, detail);
}

/**
 * Set the current star sprite.
 * @returns {Actor}
 */
export function getStarActor() {
  return starActor;
}

/**
 * Start
 * @param {Actor} actor - the star actor
 */
export function startWithStar(actor) {
  starActor = actor;
  currentState.transitionTo(new StarInMapIdle());
}

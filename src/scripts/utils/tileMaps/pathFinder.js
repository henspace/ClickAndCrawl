/**
 * @file Path finders within a tile map
 *
 * @module utils/tileMaps/pathFinder
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

import { Point } from '../geometry.js';
/**
 * @typedef {import('./tileMap.js').TileMap} TileMap
 * @typedef {import('./tileMap.js').Actor} Actor
 */

/**
 * Map of located routes.
 * Note that all points are grid references NOT WORLD POINTS.
 */
export class Routes {
  /** @type {Map<string, Point[]>} */
  #routes;
  /** @type {TileMap} */
  #tileMap;

  /**
   * Create routes.
   * @param {TileMap} tileMap
   */
  constructor(tileMap) {
    this.#tileMap = tileMap;
    this.#routes = new Map();
  }

  /**
   * Set route to reach coordinates
   * @param {Point[]} route
   * @param {*} x
   * @param {*} y
   */
  setRouteToCoords(route, x, y) {
    this.#routes.set(this.coordsToKey(x, y), route);
  }

  /**
   * Get route to reach coordinates
   * @param {*} x
   * @param {*} y
   * @returns {Point[]} route}
   */
  getRouteToCoords(x, y) {
    return this.#routes.get(this.coordsToKey(x, y));
  }

  /** Test if routes has route to coords.
   * @param {number} x - grid position
   * @param {number} y - grid position
   * @returns {boolean}
   */
  hasRouteToCoords(x, y) {
    return this.#routes.has(this.coordsToKey(x, y));
  }
  /**
   * Create a key for the routes map from a row and column.
   * @param {number} x
   * @param {number} y
   * @returns {string}
   */
  coordsToKey(x, y) {
    return `${x}|${y}`;
  }

  /**
   * Convert a map key to a grid reference.
   * @param {string} key
   * @returns {Point} Point giving the tile map grid reference.
   */
  keyToGridPoint(key) {
    const reference = key.split('|');
    return new Point(parseInt(reference[0]), parseInt(reference[1]));
  }

  /**
   * Get the entries
   * @returns {Iterator}
   */
  forEach(callback) {
    this.#routes.forEach((value, key, map) => callback(value, key, map));
  }

  /**
   * Check if any routes contains the coordinates
   * @param {Point} point
   * @returns {boolean}
   */
  containsGridPoint(point) {
    return this.#routes.has(this.coordsToKey(point.x, point.y));
  }

  /**
   * Get wayPoints to get to destination of x, y. The starting point is stripped
   * off. Points are returned as grid references
   * @param {Point} destination
   * @returns {Point[]} array of points to reach grid reference x, y. Null if no route.
   */
  getWaypointsAsGridPoints(destination) {
    const points = this.getRouteToCoords(destination.x, destination.y);
    if (points.length > 1) {
      return points.slice(1);
    } else {
      return null;
    }
  }

  /**
   * Get wayPoints to get to destination of x, y. The starting point is stripped
   * off.
   * @param {Point} destination
   * @returns {Point[]} array of points to reach grid reference x, y
   */
  getWaypointsAsWorldPoints(destination) {
    const waypoints = this.getWaypointsAsGridPoints(destination);
    if (waypoints) {
      return waypoints.map((gridPoint) =>
        this.#tileMap.gridPointToWorldPoint(gridPoint)
      );
    } else {
      return waypoints;
    }
  }
}
/**
 * Encapsulation of route finder for finding paths through routes.
 */
export class RouteFinder {
  /** Actor trying to find routes. @type {Actor} */
  actor;
  /** @type {Route[]} */
  #routes;
  /** @type {TileMap} */
  #tileMap;
  /** @type {Point} */
  #startPoint;

  /** Create the route finder.
   * @param {TileMap} tileMap
   * @param {Actor} actor
   */
  constructor(tileMap, actor) {
    this.#tileMap = tileMap;
    this.actor = actor;
  }
  /**
   * Find a route to the destination gridPoint. Note that it tries to find a route
   * adjacent to the target grid point, not actually on the grid point. The resulting
   * route is dumb, in that it does not try all options to maximise movement.
   * @param {Point} startingGridPoint - starting point
   * @param {Point} targetGridPoint - starting point
   * @param {*} maxMove - maximum number of moves allowed.
   * @returns {Map<string, Point[]>} null if no path available or necessary.
   */
  getDumbRouteNextTo(startingGridPoint, targetGridPoint, maxMove) {
    let destination = this.#getAdjacentTarget(
      startingGridPoint,
      targetGridPoint
    );
    if (destination.coincident(startingGridPoint)) {
      return [];
    }
    if (!this.#tileMap.isGridPointPassableByActor(destination, this.actor)) {
      destination = this.#rotateGridPointAbout(destination, targetGridPoint);
    }
    let path = [];
    let dX = Math.sign(destination.x - startingGridPoint.x);
    let dY = Math.sign(destination.y - startingGridPoint.y);
    let waypoint = Point.copy(startingGridPoint);
    let movingX = Math.random() < 0.5;
    let consecutiveFails = 0;
    while (maxMove > 0) {
      let nextPoint = Point.copy(waypoint);
      let moved = false;
      if (movingX && dX !== 0 && waypoint.x != destination.x) {
        nextPoint.x += dX;
        moved = true;
      } else if (!movingX && dY !== 0 && waypoint.y != destination.y) {
        nextPoint.y += dY;
        moved = true;
      }
      moved =
        moved &&
        this.#tileMap.isGridPointPassableByActor(nextPoint, this.actor);

      if (moved) {
        consecutiveFails = 0;
        waypoint = nextPoint;
        maxMove--;
      } else {
        if (++consecutiveFails >= 2) {
          break;
        }
        if (!waypoint.coincident(startingGridPoint)) {
          path.push(this.#tileMap.gridPointToWorldPoint(waypoint));
        }
        startingGridPoint = waypoint;
        movingX = !movingX; //flip axi
      }
    }
    if (!waypoint.coincident(startingGridPoint)) {
      path.push(this.#tileMap.gridPointToWorldPoint(waypoint));
    }

    return path;
  }

  /**
   * Get all available routes as a Map of paths.
   * @param {Point} startingGridPoint - starting point
   * @param {*} maxMove - maximum number of moves allowed.
   * @returns {Map<string, Point[]>}
   */
  getAllRoutesFrom(startingGridPoint, maxMove) {
    this.#routes = new Routes(this.#tileMap);
    this.#startPoint = startingGridPoint;
    this.#findRoutes(startingGridPoint.x, startingGridPoint.y, maxMove, null);
    return this.#routes;
  }

  /**
   * @param {number} x - tile x index of current tile
   * @param {number} y - tile y index of current tile
   * @param {number} maxTiles - the maximum number of tiles that can be moved.
   * @param {Point[]} [routePoints] - array of points that
   * represent current path taken to get here. If null, this is the start of the
   * route.
   */
  #findRoutes(x, y, movesLeft, routePoints) {
    if (!routePoints) {
      /* Initialise route. Don't check if it's clear as it may well be occupied
       * by the sprite seeking a route.
       */
      routePoints = [new Point(x, y)];
    } else {
      if (x === this.#startPoint.x && y === this.#startPoint.y) {
        return;
      } else if (!this.#isTilePassable(x, y)) {
        return;
      }
      const existingRoute = this.#routes.getRouteToCoords(x, y);
      if (!existingRoute || routePoints.length < existingRoute.length - 1) {
        routePoints.push(new Point(x, y)); // we have a route to this point
        this.#routes.setRouteToCoords(routePoints, x, y);
        movesLeft--;
      } else {
        return;
      }
    }

    if (movesLeft > 0) {
      // try all 4 directions
      this.#findRoutes(x, y - 1, movesLeft, [...routePoints]); // up
      this.#findRoutes(x + 1, y, movesLeft, [...routePoints]); // right
      this.#findRoutes(x, y + 1, movesLeft, [...routePoints]); // down
      this.#findRoutes(x - 1, y, movesLeft, [...routePoints]); // left
    }
  }

  /** Check if tile is passable.
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   *
   */
  #isTilePassable(x, y) {
    return this.#tileMap.isGridPointPassableByActor(
      new Point(x, y),
      this.actor
    );
  }

  /**
   * Get value next to the target.
   * @param {number} current
   * @param {number} target
   * @returns {number}
   */
  #valueNextTo(current, target) {
    return current > target ? target + 1 : target - 1;
  }

  #getAdjacentTarget(current, target) {
    const deltaX = target.x - current.x;
    const deltaY = target.y - current.y;
    let adjX = target.x;
    let adjY = target.y;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      adjX -= Math.sign(deltaX);
    } else {
      adjY -= Math.sign(deltaY);
    }
    return new Point(adjX, adjY);
  }

  /**
   * Rotate a grid point about a target grid point. This does not rotate to
   * diagonals.
   */
  #rotateGridPointAbout(gridPoint, originPoint) {
    if (gridPoint.x === originPoint.x && gridPoint.y < originPoint.y) {
      return new Point(gridPoint.x + 1, gridPoint.y + 1);
    } else if (gridPoint.x > originPoint.x && gridPoint.y === originPoint.y) {
      return new Point(gridPoint.x - 1, gridPoint.y + 1);
    }
    if (gridPoint.x === originPoint.x && gridPoint.y > originPoint.y) {
      return new Point(gridPoint.x - 1, gridPoint.y - 1);
    }
    if (gridPoint.x < originPoint.x && gridPoint.y === originPoint.y) {
      return new Point(gridPoint.x + 1, gridPoint.y - 1);
    }
    return gridPoint;
  }
}

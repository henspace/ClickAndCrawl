/**
 * @file Path finders within a tile map
 *
 * @module utils/tileMaps/pathFinder
 *
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

import { Point } from '../geometry.js';
import * as maths from '../maths.js';

/**
 * Map of located routes.
 * Note that all points are grid references NOT WORLD POINTS.
 */
export class Routes {
  /** @type {Map<string, Point[]>} */
  #routes;
  /** @type {import('./tileMap.js').TileMap} */
  #tileMap;

  /**
   * Create routes.
   * @param {import('./tileMap.js').TileMap} tileMap
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
    if (points && points.length > 1) {
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
  /** Actor trying to find routes. @type {import('./tileMap.js').Actor} */
  actor;
  /** @type {Route[]} */
  #routes;
  /** @type {import('./tileMap.js').TileMap} */
  #tileMap;
  /** @type {Point} */
  #startPoint;

  /** Create the route finder.
   * @param {import('./tileMap.js').TileMap} tileMap
   * @param {import('./tileMap.js').Actor} actor
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
    if (!this.#tileMap.canGridPointBeOccupiedByActor(destination, this.actor)) {
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
        this.#tileMap.canGridPointBeOccupiedByActor(nextPoint, this.actor);

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
        if (this.#canTileBeOccupied(x, y)) {
          // only save route if we are actually allowed to occupy its end point.
          this.#routes.setRouteToCoords(routePoints, x, y);
        }
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

  /** Check if tile can be occupied.
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   *
   */
  #canTileBeOccupied(x, y) {
    return this.#tileMap.canGridPointBeOccupiedByActor(
      new Point(x, y),
      this.actor
    );
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

/**
 * Ray tracer from a starting point
 */
export class RayTracer {
  /** Actor tracing rays. @type {import('./tileMap.js').Actor} */
  #actor;
  /** Start point of the ray. @type {Point} */
  #rayStartPoint;
  /** @type {import('./tileMap.js').TileMap} */
  #tileMap;
  /** @type {Map<string, Point} */
  #reachedPoints;
  /** @type {Point}   */
  #lastStartPoint;
  /** @type {Rectangle} */
  #bounds;
  /** @type {Rectangle} */
  #lastBounds;

  /** Create the ray tracer.
   * @param {import('./tileMap.js').TileMap} tileMap
   * @param {import('./tileMap.js').Actor} actor
   */
  constructor(tileMap, actor) {
    this.#tileMap = tileMap;
    this.#actor = actor;
  }

  /**
   * Find all the tiles that are reached from the actor.
   * @returns {Map<Point>} grid points of reached tiles.
   */
  findReachedTiles() {
    this.#rayStartPoint = this.#tileMap.worldPointToGrid(this.#actor.position);
    // this.#bounds = this.#tileMap.getVisibleGridPointRect();
    this.#bounds = this.#tileMap.getMapGridPointRect();
    if (
      this.#lastStartPoint &&
      this.#lastStartPoint.coincident(this.#rayStartPoint) &&
      this.#bounds &&
      this.#bounds.equals(this.#lastBounds)
    ) {
      return this.#reachedPoints;
    }

    this.#reachedPoints = new Map();
    this.#reachedPoints.set(
      this.#rayStartPoint.toString(),
      this.#rayStartPoint
    );
    this.#getRayEnds().forEach((endPoint) => {
      this.#traceRayToEnd(endPoint);
    });
    this.#lastStartPoint = this.#rayStartPoint;
    this.#lastBounds = this.#bounds;
    return this.#reachedPoints;
  }

  /**
   * Test if grid point in rays.
   * @param {Point} gridPoint
   * @returns {boolean}
   */
  isGridPointInRays(gridPoint) {
    return this.#reachedPoints
      ? this.#reachedPoints.has(gridPoint.toString())
      : false;
  }

  /**
   * Get the end point of the rays.
   * @returns {Point[]} array of the end grid points for each ray.
   */
  #getRayEnds() {
    const rayEnds = [];
    for (
      let col = this.#bounds.x;
      col <= this.#bounds.x + this.#bounds.width;
      col++
    ) {
      rayEnds.push(new Point(col, this.#bounds.y));
      rayEnds.push(new Point(col, this.#bounds.y + this.#bounds.height));
    }

    for (
      let row = this.#bounds.y + 1;
      row <= this.#bounds.y + this.#bounds.height - 1;
      row++
    ) {
      rayEnds.push(new Point(this.#bounds.x, row));
      rayEnds.push(new Point(this.#bounds.x + this.#bounds.width, row));
    }
    return rayEnds;
  }

  /**
   * Trace the ray to its end. Note that calculations are done in cartesian coordinates
   * and so Y values need to be negated during calculations.
   * @param {Point} endPoint
   */
  #traceRayToEnd(endPoint) {
    let dx;
    let dy;
    let steps;
    const angle = this.#rayStartPoint.getScreenAngleTo(endPoint);
    const compassDirection = maths.angleToEightPointCompass(angle);
    if (
      Math.abs(endPoint.x - this.#rayStartPoint.x) >=
      Math.abs(endPoint.y - this.#rayStartPoint.y)
    ) {
      dx = Math.sign(endPoint.x - this.#rayStartPoint.x);
      steps = Math.abs(endPoint.x - this.#rayStartPoint.x);
      dy = steps < 1 ? 0 : (endPoint.y - this.#rayStartPoint.y) / steps;
    } else {
      dy = Math.sign(endPoint.y - this.#rayStartPoint.y);
      steps = Math.abs(endPoint.y - this.#rayStartPoint.y);
      dx = steps < 1 ? 0 : (endPoint.x - this.#rayStartPoint.x) / steps;
    }
    let x = this.#rayStartPoint.x;
    let y = this.#rayStartPoint.y;

    let firstPoint = true;
    while (steps >= 0) {
      const gridPoint = new Point(Math.round(x), Math.round(y));
      if (firstPoint || this.#tileMap.isSeeThrough(gridPoint, this.#actor)) {
        this.#markReachedPoint(gridPoint, compassDirection);
      } else {
        break; // ray ends.
      }
      firstPoint = false;
      x += dx;
      y += dy;
      steps--;
    }
  }

  /**
   * Mark the point as reached. Note that surrounding obstacle tiles need to be
   * shown as well otherwise wall will not appear.
   * @param {Point} point
   * @param {number} compassDir - eight point compass direction of ray
   */
  #markReachedPoint(point, compassDir) {
    this.#reachedPoints.set(point.toString(), point);
    switch (compassDir) {
      case maths.CompassEightPoint.N:
        this.#markReachedIfNotSeeThrough(new Point(point.x - 1, point.y - 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x, point.y - 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x + 1, point.y - 1));
        break;
      case maths.CompassEightPoint.NE:
        this.#markReachedIfNotSeeThrough(new Point(point.x, point.y - 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x + 1, point.y - 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x + 1, point.y));
        break;
      case maths.CompassEightPoint.E:
        this.#markReachedIfNotSeeThrough(new Point(point.x + 1, point.y - 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x + 1, point.y));
        this.#markReachedIfNotSeeThrough(new Point(point.x + 1, point.y + 1));
        break;
      case maths.CompassEightPoint.SE:
        this.#markReachedIfNotSeeThrough(new Point(point.x + 1, point.y));
        this.#markReachedIfNotSeeThrough(new Point(point.x + 1, point.y + 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x, point.y + 1));
        break;
      case maths.CompassEightPoint.S:
        this.#markReachedIfNotSeeThrough(new Point(point.x - 1, point.y + 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x, point.y + 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x + 1, point.y + 1));
        break;
      case maths.CompassEightPoint.SW:
        this.#markReachedIfNotSeeThrough(new Point(point.x - 1, point.y));
        this.#markReachedIfNotSeeThrough(new Point(point.x - 1, point.y + 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x, point.y + 1));
        break;
      case maths.CompassEightPoint.W:
        this.#markReachedIfNotSeeThrough(new Point(point.x - 1, point.y - 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x - 1, point.y));
        this.#markReachedIfNotSeeThrough(new Point(point.x - 1, point.y + 1));
        break;
      case maths.CompassEightPoint.NW:
        this.#markReachedIfNotSeeThrough(new Point(point.x - 1, point.y));
        this.#markReachedIfNotSeeThrough(new Point(point.x - 1, point.y - 1));
        this.#markReachedIfNotSeeThrough(new Point(point.x, point.y - 1));
        break;
    }
  }
  /**
   * Mark a tile as Reached if not see through
   * @param {Point} point
   */
  #markReachedIfNotSeeThrough(point) {
    if (!this.#tileMap.isSeeThrough(point)) {
      this.#reachedPoints.set(point.toString(), point);
    }
  }
}

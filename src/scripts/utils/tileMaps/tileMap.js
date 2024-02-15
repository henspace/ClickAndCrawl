/**
 * @file Tile map
 *
 * @module utils/tileMaps/tileMap
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
import LOG from '../logging.js';
import { Sprite } from '../sprites/sprite.js';
import IMAGE_MANAGER from '../sprites/imageManager.js';
import {
  ImageSpriteCanvasRenderer,
  RectSpriteCanvasRenderer,
} from '../sprites/spriteRenderers.js';
import { Point, Rectangle } from '../geometry.js';
import { UiClickHandler } from '../ui/interactions.js';
import { randomise } from '../arrays/arrayManip.js';
import { getSurrounds } from '../arrays/arrayManip.js';
import SCREEN from '../game/screen.js';
import { RayTracer } from './pathFinder.js';
import TURN_MANAGER from '../game/turnManager.js';

/**
 * Detail for click events.
 * @enum {number}
 */
export const ClickEventFilter = {
  MOVEMENT_TILE: 0,
  COMBAT_TILE: 1,
};

/**
 * Roles that tiles adopt.
 * @enum {number}
 */
export const TileRole = {
  OBSTACLE: -1,
  GROUND: 0,
  ENTRANCE: 1,
  EXIT: 2,
  STAIRS_UP: 3,
  STAIRS_DOWN: 4,
};
/**
 * @typedef {Object} TileDefinition
 * @property {TileRole} role
 * @property {import('../sprites/sprite.js').SpriteClickHandler} onClick
 * @property {import('../sprites/sprite.js').SpriteClickHandler} onContextClick
 * @property {string} image - used to create the sprite.
 */

/**
 * Tile class
 */
export class Tile extends UiClickHandler {
  /** @type {Sprite} */
  sprite;
  /** @type {boolean} */
  obstacle;
  /** @type {import('../game/actors.js').Actor[]} */
  #occupants;
  /** @type {Point} */
  #gridPoint;
  /** @type {Point} */
  #worldPoint;
  /** @type {TileRole} */
  #role;

  /** Construct tile
   * @param {Sprite} tileSprite;
   * @param {Object} options;
   * @param {boolean} options.obstacle;
   * @param {!Point} options.gridPoint;
   * @param {!Point} options.worldPoint;
   * @param {TileRole} options.role;
   */
  constructor(tileSprite, options) {
    super();
    this.sprite = tileSprite;
    this.#occupants = new Map();
    this.obstacle = options.obstacle;
    this.#gridPoint = options.gridPoint;
    this.#worldPoint = options.worldPoint;
    this.#role = options.role;
  }

  /**
   * Get the role.
   */
  get role() {
    return this.#role;
  }

  /**
   * Get the grid point.
   * @returns {Point}
   */
  get gridPoint() {
    return this.#gridPoint;
  }
  /**
   * Get the world point.
   * @returns {Point}
   */
  get worldPoint() {
    return this.#worldPoint;
  }

  /** Add occupant.
   * @param {import('../game/actors.js').Actor
   */
  addOccupant(occupant) {
    this.#occupants.set(occupant, occupant);
  }

  /** Remove occupant.
   * @param {import('../game/actors.js').Actor}
   */
  deleteOccupant(occupant) {
    this.#occupants.delete(occupant);
  }

  /** get occupants.
   * @param {import('../game/actors.js').Actor[]}
   */
  getOccupants() {
    return this.#occupants;
  }

  /**
   * Handle the click but change the point to the sprites' position
   */
  actionClick(pointUnused) {
    super.actionClick(this.sprite.position);
  }
  /**
   * Handle the click but change the point to the sprites' position
   */
  actionContextClick(pointUnused) {
    super.actionClick(this.sprite.position);
  }

  /**
   * Test if occupied
   * @returns {boolean}
   */
  isOccupied() {
    return this.#occupants.size > 0;
  }

  /**
   * Test if tile can be passed by the actor
   * @param {Object} actor
   * @returns {boolean}
   */
  isPassableByActor(actor) {
    if (this.obstacle) {
      return false;
    }
    for (const occupant of this.#occupants.values()) {
      if (occupant !== actor && !occupant.isPassableByActor(actor)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Test if tile can be occupied by the actor
   * @param {Object} actor
   * @returns {boolean}
   */
  canBeOccupiedByActor(actor) {
    if (this.obstacle) {
      return false;
    }
    for (const occupant of this.#occupants.values()) {
      if (occupant !== actor && !occupant.canShareLocationWithActor(actor)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Test if tile can be seen through by the actor
   * @param {Object} actor
   * @returns {boolean}
   */
  isSeeThrough(actorUnused) {
    if (
      this.obstacle ||
      this.#role === TileRole.ENTRANCE ||
      this.#role === TileRole.EXIT
    ) {
      return false;
    }
    return true;
  }
}

/**
 * Tile map
 */
export class TileMap {
  /** @type {CanvasRenderingContext2D} */
  #context;
  /** @type {Tile[]} */
  #tiles;
  #tilesX;
  #tilesY;
  #gridSize;
  #width;
  #height;
  /** @type {import('./pathFinder.js').Routes} */
  #movementRoutes;
  /** @type {Point{}} */
  #movementGridPoints;
  /** @type {Sprite} */
  #movementTileHighlighter;
  /** @type {Tile} */
  #entrance;
  /** @type {Tile} */
  #exit;
  /** @type {Point} */
  #entryGridPointByDoor;
  /** @type {Point} */
  #exitGridPointByDoor;
  /** @type {Tile[]} */
  #randomGround;
  /** @type {RayTracer} */
  #heroRayTracer;
  /** @type {Tile[]} */
  #combatTileGridPoints;
  /** @type {Sprite} */
  #combatTileHighlighter;

  /**
   * Create tile map from 2D matrix
   * @param {CanvasRenderingContext2D} context
   * @param {TilePlan} plan
   * @param {number} gridSize - in world coordinates
   */
  constructor(context, plan, gridSize) {
    const matrix = plan.matrix;
    this.#entryGridPointByDoor = plan.entryPointByDoor;
    this.#exitGridPointByDoor = plan.exitPointByDoor;
    this.#context = context;
    this.#movementTileHighlighter = new Sprite({
      renderer: new RectSpriteCanvasRenderer(context, {
        width: gridSize,
        height: gridSize,
        fillStyle: null,
        strokeStyle: 'white',
      }),
    });
    this.#combatTileHighlighter = new Sprite({
      renderer: new RectSpriteCanvasRenderer(context, {
        width: gridSize,
        height: gridSize,
        fillStyle: null,
        strokeStyle: 'red',
      }),
    });
    this.#gridSize = gridSize;
    this.#tiles = [];
    this.#tilesY = matrix.length;
    this.#tilesX = matrix[0].length;
    this.#width = gridSize * this.tilesX;
    this.#height = gridSize * this.tilesY;
    this.#randomGround = [];
    matrix.forEach((row, rowIndex) => {
      const tileRow = [];
      this.#tiles.push(tileRow);
      row.forEach((tileDefn, columnIndex) => {
        if (tileDefn) {
          const sprite = new Sprite({
            renderer: new ImageSpriteCanvasRenderer(
              context,
              IMAGE_MANAGER.getSpriteBitmap(0, tileDefn.image)
            ),
          });
          const gridPoint = new Point(columnIndex, rowIndex);
          const worldPoint = this.gridPointToWorldPoint(gridPoint);
          let tile = new Tile(sprite, {
            obstacle: tileDefn.role === TileRole.OBSTACLE,
            gridPoint: gridPoint,
            worldPoint: worldPoint,
            role: tileDefn.role,
          });
          if (tileDefn.onClick) {
            tile.setOnClick((target, point) =>
              this.#filterClick(target, point, tileDefn.onClick)
            );
            tile.setOnContextClick(tileDefn.onContextClick);
          }
          this.processTileRole(tile);
          tileRow.push(tile);
          sprite.position.x = columnIndex * this.#gridSize + this.#gridSize / 2;
          sprite.position.y = rowIndex * this.#gridSize + this.#gridSize / 2;
        } else {
          tileRow.push(null);
        }
      });
    });
    if (!this.#entrance) {
      LOG.error('No entrance has been set. Setting to the first ground tile');
      this.#entrance = this.#randomGround[0];
    }
  }

  /**
   * Get tilemap dimensions in terms of number of tiles.
   * @returns {import('../geometry.js').Dims2D}
   */
  getDimsInTiles() {
    return { width: this.#tilesX, height: this.#tilesY };
  }
  /**
   * Process a tile's specific role.
   * @param {Tile} tile
   */
  processTileRole(tile) {
    switch (tile.role) {
      case TileRole.ENTRANCE:
        if (this.#entrance) {
          const gp = tile.gridPoint;
          LOG.error(`Duplicate entrance found at (${gp.x}, ${gp.y}). Ignored.`);
        } else {
          this.#entrance = tile;
        }
        break;
      case TileRole.EXIT:
        if (this.#exit) {
          const gp = tile.gridPoint;
          LOG.error(`Duplicate exit found at (${gp.x}, ${gp.y}). Ignored.`);
        } else {
          this.#exit = tile;
        }
        break;
      case TileRole.GROUND:
        if (!tile.gridPoint.coincident(this.#entryGridPointByDoor)) {
          this.#randomGround.push(tile);
        }
        break;
    }
  }

  /**
   * Update method to render tiles.
   * @param {number} deltaSeconds - elapsed time.
   */
  update(deltaSeconds) {
    this.#setRayTracer();
    const visibleGridPoints = this.getVisibleGridPointRect();
    for (
      let row = visibleGridPoints.y;
      row <= visibleGridPoints.y + visibleGridPoints.height;
      row++
    ) {
      for (
        let col = visibleGridPoints.x;
        col <= visibleGridPoints.x + visibleGridPoints.width;
        col++
      ) {
        if (this.#heroRayTracer?.isGridPointInRays(new Point(col, row))) {
          const tile = this.#tiles[row][col];
          tile?.sprite.update(deltaSeconds);
        }
      }
    }
    this.#highlightTiles(deltaSeconds);
  }

  /**
   * Set up the ray tracer if not already set.
   */
  #setRayTracer() {
    const hero = TURN_MANAGER.getHeroActor();
    if (hero) {
      if (!this.#heroRayTracer) {
        this.#heroRayTracer = new RayTracer(this, hero);
      }
      const heroTile = this.getTileAtWorldPoint(hero.position);
      if (heroTile) {
        const heroTileRole = heroTile.role;
        if (
          heroTileRole != TileRole.ENTRANCE &&
          heroTileRole != TileRole.EXIT
        ) {
          this.#heroRayTracer.findReachedTiles();
        }
      } else {
        LOG.error(`Hero at ${hero.position.toString()} but no tile found.`);
      }
    }
  }

  /**
   * Get the visible bounds as a rectangle in gridpoints.
   * @returns {Rectangle}
   */
  getVisibleGridPointRect() {
    const visibleBounds = SCREEN.geWorldInCanvasBounds();
    const gridPointTL = this.worldPointToGrid(
      new Point(visibleBounds.x, visibleBounds.y)
    );
    const gridPointBR = this.worldPointToGrid(
      new Point(
        visibleBounds.x + visibleBounds.width,
        visibleBounds.y + visibleBounds.height
      )
    );
    const minCol = Math.max(0, gridPointTL.x);
    const maxCol = Math.min(this.#tilesX - 1, gridPointBR.x);
    const minRow = Math.max(0, gridPointTL.y);
    const maxRow = Math.min(this.#tilesY - 1, gridPointBR.y);
    return new Rectangle(minCol, minRow, maxCol - minCol, maxRow - minRow);
  }

  /**
   * Get the gridsize
   * @returns {number}
   */
  getGridSize() {
    return this.#gridSize;
  }

  /** Get world dimensions.
   * @returns {import('../geometry.js').Dims2D}
   */
  getDimensions() {
    return { width: this.#width, height: this.#height };
  }

  /**
   * Get sprite at position.
   * @param {Point} point - in world coordinates.
   * @returns {Tile} null if no tile.
   */
  getTileAtWorldPoint(point) {
    const gridPoint = this.worldPointToGrid(point);
    return this.getTileAtGridPoint(gridPoint);
  }

  /**
   * Get sprite at position.
   * @param {Point} point - in grid coordinates.
   * @returns {Tile} null if no tile.
   */
  getTileAtGridPoint(gridPoint) {
    if (!gridPoint) {
      return null;
    }
    const row = gridPoint.y;
    const col = gridPoint.x;
    if (col >= 0 && row >= 0 && col < this.#tilesX && row < this.#tilesY) {
      return this.#tiles[row][col];
    }
    return null;
  }

  /**
   * Convert world coordinate to mad grid reference.
   * @param {Point} point
   * @returns {Point}
   */
  worldPointToGrid(point) {
    return new Point(
      Math.floor(point.x / this.#gridSize),
      Math.floor(point.y / this.#gridSize)
    );
  }

  /**
   * Get a world point aligned to the centre of a tile
   * @param {Point} point
   */
  gridAlignedWorldPoint(point) {
    const gridPoint = this.worldPointToGrid(point);
    return this.gridPointToWorldPoint(gridPoint);
  }

  /** Convert a point in tile coordinates to world coordinates.
   * @param {Point}
   * @returns {Point}
   */
  gridPointToWorldPoint(point) {
    const halfGrid = 0.5 * this.#gridSize;
    return new Point(
      point.x * this.#gridSize + halfGrid,
      point.y * this.#gridSize + halfGrid
    );
  }

  /** Get the world position of the entrance. The default is the first tile if there
   * is no door
   * @returns {Point}
   */
  getWorldPositionOfTileByEntry() {
    return this.gridPointToWorldPoint(this.#entryGridPointByDoor);
  }
  /** Get the grid position of the door at index. If there are no doors, then
   * the entrance is the first ground tile
   * @returns {Point}
   */
  getGridPositionOfEntrance() {
    return this.#entrance.gridPoint;
  }

  /**
   * Set the highlighted routes.
   * @param {*} routes
   */
  setMovementRoutes(routes) {
    this.#movementRoutes = routes;
    if (routes) {
      this.#movementGridPoints = new Map();
      this.#movementRoutes.forEach((gridPoints) =>
        gridPoints.forEach((gridPoint) => {
          this.#movementGridPoints.set(gridPoint, gridPoint);
        })
      );
    } else {
      this.#movementGridPoints = null;
    }
  }

  /**
   * Set combat tiles
   * @param {Actor[]} actors - actors where combat can take place.
   */
  setCombatActors(actors) {
    this.#combatTileGridPoints = [];
    actors?.forEach((actor) => {
      this.#combatTileGridPoints.push(this.worldPointToGrid(actor.position));
    });
  }

  /**
   * Highlight routes marked by the highlighters. There are three possible highlights:
   * movement, combat and interaction.
   * @param {number} deltaSeconds
   */
  #highlightTiles(deltaSeconds) {
    this.#highlightMovementTiles(deltaSeconds);
    this.#highlightCombatTiles(deltaSeconds);
  }

  /**
   * Highlight movement routes.
   * @param {number} deltaSeconds
   */
  #highlightMovementTiles(deltaSeconds) {
    this.#movementGridPoints?.forEach((gridPoint) => {
      this.#movementTileHighlighter.position =
        this.gridPointToWorldPoint(gridPoint);
      this.#movementTileHighlighter.update(deltaSeconds);
    });
  }

  /**
   * Highlight movement routes.
   * @param {number} deltaSeconds
   */
  #highlightCombatTiles(deltaSeconds) {
    this.#combatTileGridPoints?.forEach((gp) => {
      this.#combatTileHighlighter.position = this.gridPointToWorldPoint(gp);
      this.#combatTileHighlighter.update(deltaSeconds);
    });
  }

  /**
   * Handle a tile click.
   * To be actioned a tile must be in the highlightedRoutes
   * @param {Sprite} target - the sprite that was clicked. This prevents the need
   * to use 'this' which may not be correct in the context.
   * @param {Point} point - the position in the world that was clicked
   * @param {import('../sprites/sprite.js').SpriteClickHandler} clickHandler
   */
  #filterClick(target, point, clickHandler) {
    if (this.#movementRoutes?.containsGridPoint(this.worldPointToGrid(point))) {
      clickHandler(target, point, { filter: ClickEventFilter.MOVEMENT_TILE });
      return;
    }
    const gridPoint = this.worldPointToGrid(point);
    this.#combatTileGridPoints?.forEach((gp) => {
      if (gp.isCoincident(gridPoint)) {
        clickHandler(target, point, {
          filter: ClickEventFilter.COMBAT_TILE,
        });
        return;
      }
    });
    LOG.debug('Ignore click outside of highlighted area');
  }

  /**
   * Get waypoints to reach destination grid point
   * @param {Point} worldPoint - destination
   * @returns {Point[]} null if no route currently found.
   */
  getWaypointsToWorldPoint(worldPoint) {
    const destination = this.worldPointToGrid(worldPoint);
    return this.#movementRoutes?.getWaypointsAsWorldPoints(destination);
  }

  /**
   * Get a random unoccupied ground tile.
   * @returns {Tile} null if no free ground tile.
   */
  getRandomFreeGroundTile() {
    randomise(this.#randomGround);
    for (const tile of this.#randomGround) {
      if (!tile.isOccupied()) {
        return tile;
      }
    }
    return null;
  }

  /**
   * Test if point is passable.
   * @param {Point} gridPoint - row and col coordinates.
   * @param {import('../game/actors.js').Actor} actor - actor trying to pass
   * @returns {boolean}
   */
  isGridPointPassableByActor(gridPoint, actor) {
    const tile = this.getTileAtGridPoint(gridPoint);
    if (!tile) {
      return false;
    }

    return tile.isPassableByActor(actor);
  }

  /**
   * Test if tile can be occupied by the actor
   * @param {Point} gridPoint - row and col coordinates.
   * @param {import('../game/actors.js').Actor} actor - actor trying to occupy location
   * @returns {boolean}
   */
  canGridPointBeOccupiedByActor(gridPoint, actor) {
    const tile = this.getTileAtGridPoint(gridPoint);
    if (!tile) {
      return false;
    }
    return tile.canBeOccupiedByActor(actor);
  }

  /**
   * Is the grid point visible by the hero.
   * @param {Point} gridPoint
   * @returns {boolean}
   */
  canHeroSeeGridPoint(gridPoint) {
    return this.#heroRayTracer?.isGridPointInRays(gridPoint) ?? true;
  }

  /**
   * Test if point can be seen through.
   * @param {Point} gridPoint - row and col coordinates.
   * @param {import('../game/actors.js').Actor} actor - actor trying to see
   * @returns {boolean}
   */
  isSeeThrough(gridPoint, actor) {
    const tile = this.getTileAtGridPoint(gridPoint);
    if (!tile) {
      return true;
    }

    return tile.isSeeThrough(actor);
  }

  /**
   * Get the tiles surrounding a reference.
   * @param {Point} gridPoint
   */
  getSurroundingTiles(gridPoint) {
    return getSurrounds(this.#tiles, gridPoint.y, gridPoint.x);
  }

  /**
   * Removed occupant from the list of occupants
   * of the tile at the grid point.
   * @param {Object} occupant
   * @param {Point} gridPoint
   */
  deleteOccupancyOfGridPoint(occupant, gridPoint) {
    this.getTileAtGridPoint(gridPoint)?.deleteOccupant(occupant);
  }

  /**
   * Set the object's tile occupancy. It is removed from the list of occupants
   * of the tile at the previous point and added to those of the next.
   * @param {Object} occupant
   * @param {Point} oldGridPoint
   * @param {Point} newGridPoint
   */
  moveTileOccupancyGridPoint(occupant, oldGridPoint, newGridPoint) {
    if (newGridPoint !== oldGridPoint) {
      this.getTileAtGridPoint(oldGridPoint)?.deleteOccupant(occupant);
      this.getTileAtGridPoint(newGridPoint)?.addOccupant(occupant);
    }
  }

  /**
   * Get all the participants around an actor. Diagonals are not included in
   * potential participants.
   * @param {Actor} actor
   * @returns {Actor[]}
   */
  getParticipants(actor) {
    const participants = [];
    const surrounds = this.getSurroundingTiles(
      this.worldPointToGrid(actor.position)
    );
    const tiles = [
      surrounds.above,
      surrounds.right,
      surrounds.below,
      surrounds.left,
    ];
    tiles.forEach((tile) => {
      let tileOccupants = tile?.getOccupants();
      tileOccupants?.forEach((occupant) => {
        participants.push(occupant);
      });
    });
    return participants;
  }
}

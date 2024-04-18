/**
 * @file Tile map
 *
 * @module utils/tileMaps/tileMap
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
import { getSurrounds, radiateUpAndDown } from '../arrays/arrayManip.js';
import SCREEN from '../game/screen.js';
import { RayTracer } from './pathFinder.js';
import { Colours } from '../../constants/canvasStyles.js';

/**
 * Detail for click events.
 * @enum {number}
 */
export const ClickEventFilter = {
  MOVEMENT_TILE: 0,
  INTERACT_TILE: 1,
  OCCUPIED_TILE: 2,
  HERO_TILE: 3,
  MOVE_OR_INTERACT_TILE: 4,
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
 * @property {module:utils/sprites/sprite~SpriteClickHandler} onClick
 * @property {module:utils/sprites/sprite~SpriteClickHandler} onContextClick
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
  /** @type {module:players/actors~Actor} */
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
   * @param {import('..utils/game/actors.js').Actor
   */
  addOccupant(occupant) {
    this.#occupants.set(occupant, occupant);
  }

  /** Remove occupant.
   * @param {module:players/actors.Actor}
   */
  deleteOccupant(occupant) {
    this.#occupants.delete(occupant);
  }

  /** get occupants.
   * @returns {module:players/actors~Actor[]}
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
    if (this.#role === TileRole.ENTRANCE || this.#role === TileRole.EXIT) {
      return false;
    }
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
    if (
      (this.#role === TileRole.ENTRANCE || this.#role === TileRole.EXIT) &&
      !actor.isHero()
    ) {
      return false;
    }
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
  /** @type {module:utils/tileMaps/pathFinder~Routes} */
  #movementRoutes;
  /** @type {Point[]} */
  #movementGridPoints;
  /** @type {Sprite} */
  #movementTileHighlighter;
  /** @type {Sprite} */
  #reachableDoorTileHighlighter;
  /** @type {Tile[]} */
  #reachableDoorTileGridPoints;
  /** @type {Tile} */
  #entranceTile;
  /** @type {Tile} */
  #exitTile;
  /** @type {Point} */
  #entryGridPointByDoor;
  /** @type {Point} */
  #exitGridPointByDoor;
  /** @type {Tile[]} */
  #randomGround;
  /** @type {RayTracer} */
  #heroRayTracer;
  /** @type {Point[]} */
  #interactTileGridPoints;
  /** @type {Sprite} */
  #interactTileHighlighter;
  /** @type {Actor} */
  #heroActor;

  /**
   * Create tile map from 2D matrix
   * @param {CanvasRenderingContext2D} context
   * @param {TilePlan} plan
   * @param {number} gridSize - in world coordinates
   */
  constructor(context, plan, gridSize, heroActor) {
    this.#heroActor = heroActor;
    const matrix = plan.matrix;
    this.#entryGridPointByDoor = plan.entryPointByDoor;
    this.#exitGridPointByDoor = plan.exitPointByDoor;
    this.#context = context;
    this.#movementTileHighlighter = new Sprite({
      renderer: new RectSpriteCanvasRenderer(context, {
        width: gridSize,
        height: gridSize,
        fillStyle: Colours.MOVE_HIGHLIGHT_FILL,
        strokeStyle: Colours.MOVE_HIGHLIGHT_STROKE,
      }),
    });
    this.#reachableDoorTileHighlighter = new Sprite({
      renderer: new RectSpriteCanvasRenderer(context, {
        width: gridSize,
        height: gridSize,
        fillStyle: Colours.DOOR_HIGHLIGHT_FILL,
        strokeStyle: 'green',
      }),
    });
    this.#interactTileHighlighter = new Sprite({
      renderer: new RectSpriteCanvasRenderer(context, {
        width: gridSize,
        height: gridSize,
        fillStyle: Colours.INTERACT_HIGHLIGHT_FILL,
        strokeStyle: Colours.INTERACT_HIGHLIGHT_STROKE,
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
              IMAGE_MANAGER.getSpriteBitmap(tileDefn.image)
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
    if (!this.#entranceTile) {
      LOG.error('No entrance has been set. Setting to the first ground tile');
      this.#entranceTile = this.#randomGround[0];
    }
    if (!this.#exitTile) {
      throw new Error('No exit tile.');
    }
  }

  /**
   * Get tile map dimensions in terms of number of tiles.
   * @returns {module:utils/geometry~Dims2D}
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
        if (this.#entranceTile) {
          const gp = tile.gridPoint;
          LOG.error(`Duplicate entrance found at (${gp.x}, ${gp.y}). Ignored.`);
        } else {
          this.#entranceTile = tile;
        }
        break;
      case TileRole.EXIT:
        if (this.#exitTile) {
          const gp = tile.gridPoint;
          LOG.error(`Duplicate exit found at (${gp.x}, ${gp.y}). Ignored.`);
        } else {
          this.#exitTile = tile;
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
    if (this.#heroActor) {
      if (!this.#heroRayTracer) {
        this.#heroRayTracer = new RayTracer(this, this.#heroActor);
      }
      const heroTile = this.getTileAtWorldPoint(this.#heroActor.position);
      if (heroTile) {
        const heroTileRole = heroTile.role;
        if (
          heroTileRole != TileRole.ENTRANCE &&
          heroTileRole != TileRole.EXIT
        ) {
          this.#heroRayTracer.findReachedTiles();
        }
      }
    }
  }

  /**
   * Get the tile map bounds as a rectangle in grid points.
   * @returns {Rectangle}
   */
  getMapGridPointRect() {
    return new Rectangle(0, 0, this.#tilesX, this.#tilesY);
  }

  /**
   * Get the visible bounds as a rectangle in grid points.
   * @returns {Rectangle}
   */
  getVisibleGridPointRect() {
    const visibleBounds = SCREEN.getWorldInCanvasBounds();
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
   * Get the grid size
   * @returns {number}
   */
  getGridSize() {
    return this.#gridSize;
  }

  /** Get world dimensions.
   * @returns {module:utils/geometry~Dims2D}
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
    return this.#entranceTile.gridPoint;
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
   * Set interaction tiles
   * @param {Actor[]} actors - actors where a reaction can take place.
   */
  setInteractActors(actors) {
    this.#interactTileGridPoints = [];
    actors?.forEach((actor) => {
      if (actor.interaction.canReact()) {
        this.#interactTileGridPoints.push(
          this.worldPointToGrid(actor.position)
        );
      }
    });
  }

  /**
   * Recalculate the reachable doors.
   */
  calcReachableDoors(heroPosition) {
    this.#reachableDoorTileGridPoints = [];
    const surrounds = this.getSurroundingTiles(
      this.worldPointToGrid(heroPosition)
    );
    [surrounds.above, surrounds.right, surrounds.below, surrounds.left].forEach(
      (tile) => {
        if (tile.gridPoint.coincident(this.#exitTile.gridPoint)) {
          this.#reachableDoorTileGridPoints.push(tile.gridPoint);
        } else if (tile.gridPoint.coincident(this.#entranceTile.gridPoint)) {
          this.#reachableDoorTileGridPoints.push(tile.gridPoint);
        }
      }
    );
  }

  /**
   * Highlight routes marked by the highlighters. There are three possible highlights:
   * movement, interaction and event tiles.
   * @param {number} deltaSeconds
   */
  #highlightTiles(deltaSeconds) {
    this.#highlightMovementTiles(deltaSeconds);
    this.#highlightInteractTiles(deltaSeconds);
    this.#highlightReachableDoorTiles(deltaSeconds);
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
  #highlightInteractTiles(deltaSeconds) {
    this.#interactTileGridPoints?.forEach((gp) => {
      this.#interactTileHighlighter.position = this.gridPointToWorldPoint(gp);
      this.#interactTileHighlighter.update(deltaSeconds);
    });
  }

  /**
   * Highlight reachable door tiles.
   * @param {number} deltaSeconds
   */
  #highlightReachableDoorTiles(deltaSeconds) {
    this.#reachableDoorTileGridPoints?.forEach((gp) => {
      this.#reachableDoorTileHighlighter.position =
        this.gridPointToWorldPoint(gp);
      this.#reachableDoorTileHighlighter.update(deltaSeconds);
    });
  }

  /**
   * Handle a tile click.
   * To be actioned a tile must be in the highlightedRoutes
   * @param {Sprite} target - the sprite that was clicked. This prevents the need
   * to use 'this' which may not be correct in the context.
   * @param {Point} point - the position in the world that was clicked
   * @param {module:utils/sprites/sprite~SpriteClickHandler} clickHandler
   */
  #filterClick(target, point, clickHandler) {
    const gridPoint = this.worldPointToGrid(point);
    let occupant;
    const occupants = target.getOccupants();
    if (occupants.size > 0) {
      occupant = occupants.values().next().value;
    }

    const movement = this.#movementRoutes?.containsGridPoint(gridPoint);
    let interaction = false;
    if (this.#interactTileGridPoints) {
      for (const point of this.#interactTileGridPoints) {
        if (point.isCoincident(gridPoint)) {
          interaction = true;
          break;
        }
      }
    }
    const isDeadProp = !occupant?.alive && occupant?.isProp();
    if ((movement && interaction) || isDeadProp) {
      clickHandler(target, point, {
        filter: ClickEventFilter.MOVE_OR_INTERACT_TILE,
        occupant: occupant,
      });
      return;
    } else if (movement) {
      clickHandler(target, point, {
        filter: ClickEventFilter.MOVEMENT_TILE,
        occupant: occupant,
      });
      return;
    } else if (interaction) {
      clickHandler(target, point, {
        filter: ClickEventFilter.INTERACT_TILE,
        occupant: occupant,
      });
      return;
    }

    if (this.#reachableDoorTileGridPoints) {
      for (const gp of this.#reachableDoorTileGridPoints) {
        if (gp.isCoincident(gridPoint)) {
          clickHandler(target, point, {
            filter: ClickEventFilter.INTERACT_TILE,
          });
          return;
        }
      }
    }

    const heroGridPoint = this.worldPointToGrid(this.#heroActor.position);
    if (gridPoint.coincident(heroGridPoint)) {
      clickHandler(target, point, {
        occupant: this.#heroActor,
        filter: ClickEventFilter.OCCUPIED_TILE,
      });
      return;
    }

    if (occupant) {
      clickHandler(target, point, {
        occupant: occupant,
        filter: ClickEventFilter.OCCUPIED_TILE,
      });
    }
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
   * @param {module:players/actors.Actor} actor - actor trying to pass
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
   * @param {module:players/actors.Actor} actor - actor trying to occupy location
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
   * @param {module:players/actors.Actor} actor - actor trying to see
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
   * @returns {module:utils/arrays/arrayManip~Surrounds}
   */
  getSurroundingTiles(gridPoint) {
    return getSurrounds(this.#tiles, gridPoint.y, gridPoint.x);
  }

  /**
   * Get tiles radiating up and down.
   * @param {Point} gridPoint
   * @param {number} [distance = 1] - in tiles.
   * @returns {Tiles[]}
   */
  getRadiatingUpAndDown(gridPoint, distance = 1) {
    return radiateUpAndDown(this.#tiles, {
      rowIndex: gridPoint.y,
      columnIndex: gridPoint.x,
      distance: distance,
      filter: (tile) => tile.role === TileRole.GROUND,
    });
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
   * Get coincident actors.
   * @param {module:players/actors.Actor} actor
   * @returns {Actor[]}
   */
  getCoincidentActors(actor) {
    const tile = this.getTileAtWorldPoint(actor.position);
    return tile.getOccupants();
  }
  /**
   * Get all the participants around an actor. Diagonals are not included in
   * potential participants.
   * @param {module:players/actors.Actor} actor
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

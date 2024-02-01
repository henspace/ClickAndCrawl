/**
 * @file World limitations
 *
 * @module utils/game/world
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

import SCREEN from './screen.js';

/**
 * @type {TileMap}
 */
let worldTileMap;

/**
 * @type {Map<string, Sprite>}
 */
const actors = new Map();

/**
 * Get the world dimensions. The dimensions are based on the worldTileMap size.
 * It defaults to the screen dimensions if no map has been set.
 * @returns {{number, number}} width and height
 */
function getWorldDims() {
  return worldTileMap
    ? worldTileMap.getDimensions()
    : SCREEN.getCanvasDimensions();
}

/**
 * Add a actor to the world.
 * @param {import('./actors.js').Actor}
 */
function addActor(target) {
  actors.set(target, target);
  worldTileMap.moveTileOccupancyGridPoint(
    target,
    null,
    worldTileMap.worldPointToGrid(target.position)
  );
}

/**
 * Remove actor from the world.
 * @param {import('./actors.js').Actor}
 */
function removeActor(target) {
  actors.delete(target);
}

/**
 * Set the tile map for the world.
 * @param {TileMap}
 */
function setTileMap(tileMap) {
  worldTileMap = tileMap;
}

/**
 * Get the tile map for the world.
 * @returns {TileMap}
 */
function getTileMap() {
  return worldTileMap;
}

/**
 * Remove the tile map from the world.
 * @param {TileMap}
 */
function removeTileMap() {
  worldTileMap = null;
}

/**
 * Update the world. This calls the update methods of the tile map and all sprites/
 * @param {number} deltaSeconds
 */
function update(deltaSeconds) {
  worldTileMap?.update(deltaSeconds);
  actors.forEach((actor) => {
    const oldGridPoint = worldTileMap.worldPointToGrid(actor.position);
    actor.visible = worldTileMap.canHeroSeeGridPoint(oldGridPoint);
    actor.update(deltaSeconds);
    const newGridPoint = worldTileMap.worldPointToGrid(actor.position);
    worldTileMap.moveTileOccupancyGridPoint(actor, oldGridPoint, newGridPoint);
  });
}

/**
 * Resolve a ui click
 * @param {import('./screen.js').MappedPositions} positions - click coordinates in canvas and world coordinates.
 * @returns {boolean} true if resolved.
 */
function resolveClick(positions) {
  /*
  for (const [keyUnused, actor] of actors) {
    const sprite = actor.sprite;
    const position = sprite.uiComponent ? positions.canvas : positions.world;
    if (sprite.getBoundingBox().containsCoordinate(position.x, position.y)) {
      actor.actionClick(position);
      return true;
    }
  }
  */
  const tile = worldTileMap.getTileAtWorldPoint(positions.world);
  if (tile) {
    tile.actionClick(positions.world);
    return true;
  }
  return false;
}

/**
 * Get the actors
 * @returns {Map<Actor, Actor>}
 */
function getActors() {
  return actors;
}

/**
 * World object singleton.
 */
const WORLD = {
  addActor: addActor,
  getActors: getActors,
  getTileMap: getTileMap,
  getWorldDims: getWorldDims,
  removeTileMap: removeTileMap,
  resolveClick: resolveClick,
  removeActor: removeActor,
  setTileMap: setTileMap,
  update: update,
};

export default WORLD;

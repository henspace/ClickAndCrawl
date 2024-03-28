/**
 * @file World limitations
 *
 * @module game/world
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

import SCREEN from './screen.js';
import LOG from '../logging.js';

/**
 * @type {TileMap}
 */
let worldTileMap;

/**
 * @type {Map<string, Sprite>}
 */
const actors = new Map();

/**
 * @type {Map<string, Sprite>}
 */
const artefacts = new Map();

/**
 * Sprites that do not interact
 * @type {Map<string, Sprite>}
 */
const passiveSprites = new Map();

/**
 * Sprites that grow or spawn. These are drawn first.
 * @type {Map<string, Sprite>}
 */
const organicActors = new Map();

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
 * @param {module:players/actors~Actor}
 */
function addActor(target) {
  if (target.isOrganic()) {
    organicActors.set(target, target);
  } else {
    actors.set(target, target);
  }
  worldTileMap.moveTileOccupancyGridPoint(
    target,
    null,
    worldTileMap.worldPointToGrid(target.position)
  );
}

/**
 * Remove actor from the world.
 * @param {module:players/actors~Actor}
 */
function removeActor(target) {
  const gridPoint = worldTileMap.worldPointToGrid(target.position);
  worldTileMap.deleteOccupancyOfGridPoint(target, gridPoint);
  if (target.isOrganic()) {
    organicActors.delete(target);
  } else {
    actors.delete(target);
  }
}

/**
 * Add a artefact to the world.
 * @param {module:players/actors~Actor}
 */
function addArtefact(target) {
  artefacts.set(target, target);
  worldTileMap.moveTileOccupancyGridPoint(
    target,
    null,
    worldTileMap.worldPointToGrid(target.position)
  );
}
/**
 * Remove artefact from the world.
 * @param {module:players/actors~Actor}
 */
function removeArtefact(target) {
  const gridPoint = worldTileMap.worldPointToGrid(target.position);
  worldTileMap.deleteOccupancyOfGridPoint(target, gridPoint);
  artefacts.delete(target);
}

/**
 * Add effect sprite
 * @param {Sprite} sprite
 */
function addPassiveSprite(sprite) {
  passiveSprites.set(sprite, sprite);
}

/**
 * Add effect sprite
 * @param {Sprite} sprite
 */
function removePassiveSprite(sprite) {
  passiveSprites.delete(sprite);
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
 * Clear the map and all actors.
 */
function clearAll() {
  organicActors.forEach((actor) => removeActor(actor));
  actors.forEach((actor) => removeActor(actor));
  artefacts.forEach((actor) => removeArtefact(actor));
  passiveSprites.forEach((sprite) => removePassiveSprite(sprite));
  removeTileMap();
}

/**
 * Update the world. This calls the update methods of the tile map and all sprites/
 * @param {number} deltaSeconds
 */
function update(deltaSeconds) {
  worldTileMap?.update(deltaSeconds);
  organicActors.forEach((actor) => {
    const oldGridPoint = worldTileMap.worldPointToGrid(actor.position);
    actor.visible = worldTileMap.canHeroSeeGridPoint(oldGridPoint);
    actor.update(deltaSeconds);
    const newGridPoint = worldTileMap.worldPointToGrid(actor.position);
    worldTileMap.moveTileOccupancyGridPoint(actor, oldGridPoint, newGridPoint);
  });
  artefacts.forEach((artefact) => {
    const oldGridPoint = worldTileMap.worldPointToGrid(artefact.position);
    artefact.visible = worldTileMap.canHeroSeeGridPoint(oldGridPoint);
    artefact.update(deltaSeconds);
    const newGridPoint = worldTileMap.worldPointToGrid(artefact.position);
    worldTileMap.moveTileOccupancyGridPoint(
      artefact,
      oldGridPoint,
      newGridPoint
    );
  });
  actors.forEach((actor) => {
    const oldGridPoint = worldTileMap.worldPointToGrid(actor.position);
    actor.visible = worldTileMap.canHeroSeeGridPoint(oldGridPoint);
    actor.update(deltaSeconds);
    const newGridPoint = worldTileMap.worldPointToGrid(actor.position);
    worldTileMap.moveTileOccupancyGridPoint(actor, oldGridPoint, newGridPoint);
  });

  passiveSprites.forEach((sprite) => sprite.update(deltaSeconds));
}

/**
 * Resolve a ui click
 * @param {module:ui/interactions~MappedPositions} positions - click coordinates in canvas and world coordinates.
 * @returns {boolean} true if resolved.
 */
function resolveClick(positions) {
  const tile = worldTileMap?.getTileAtWorldPoint(positions.world);
  if (tile) {
    tile.actionClick(positions.world);
    return true;
  }
  return false;
}

/**
 * Resolve a context menu event
 * @param {module:ui/interactions~MappedPositions} positions - click coordinates in canvas and world coordinates.
 * @returns {boolean} true if resolved.
 */
function resolveContextMenu(positions) {
  const tile = worldTileMap.getTileAtWorldPoint(positions.world);
  if (tile) {
    tile.actionContextClick(positions.world);
    return true;
  }
  return false;
}

/**
 * Resolve a cancel event
 * @param {module:ui/interactions~MappedPositions} positions - click coordinates in canvas and world coordinates.
 * @returns {boolean} true if resolved.
 */
function resolveCancel(positionsUnused) {
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
 * Get the organic actors
 * @returns {Map<Actor, Actor>}
 */
function getOrganicActors() {
  return organicActors;
}

/**
 * Get the artefacts
 * @returns {Map<Actor, Actor>}
 */
function getArtefacts() {
  return actors;
}

/**
 * World object singleton.
 */
const WORLD = {
  addActor: addActor,
  addArtefact: addArtefact,
  addPassiveSprite: addPassiveSprite,
  clearAll: clearAll,
  getActors: getActors,
  getOrganicActors: getOrganicActors,
  getArtefacts: getArtefacts,
  getTileMap: getTileMap,
  getWorldDims: getWorldDims,
  removeTileMap: removeTileMap,
  resolveCancel: resolveCancel,
  resolveClick: resolveClick,
  resolveContextMenu: resolveContextMenu,
  removeActor: removeActor,
  removeArtefact: removeArtefact,
  removePassiveSprite: removePassiveSprite,
  setTileMap: setTileMap,
  update: update,
};

export default WORLD;

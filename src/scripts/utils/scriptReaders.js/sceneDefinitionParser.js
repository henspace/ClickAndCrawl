/**
 * @file Convert a screen definition into a scene.
 *
 * @module utils/scriptReaders.js/sceneDefinitionParser
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
 *
 * Copyright 2024 Steve Butler (henspace.com).
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

import IMAGE_MANAGER from '../sprites/imageManager.js';
import textureMap from '../../../assets/images/dungeon.json';
import textureUrl from '../../../assets/images/dungeon.png';
import { TileRole } from '../tileMaps/tileMap.js';

import { generateTileMapPlan } from '../tileMaps/tilePlan.js';
import { TileMap } from '../tileMaps/tileMap.js';
import TURN_MANAGER from '../game/turnManager.js';
import WORLD from '../game/world.js';
import GAME from '../game/game.js';
import * as UI from '../dom/ui.js';
import ACTOR_MAP from './actorMap.js';
import SCREEN from '../game/screen.js';

const GRID_SIZE = 48;

/**
 * @typedef {import('./tileMap.js').TileDefinition} TileDefinition
 */
/** @type {TileDefinition} */
const GROUND_DEFN = {
  role: TileRole.GROUND,
  onClick: (target, point) =>
    TURN_MANAGER.triggerEvent(TURN_MANAGER.EventId.CLICKED_FREE_GROUND, point),
  image: 'floor.png',
};

/** @type {TileDefinition} */
const ENTRANCE_DEFN = {
  role: TileRole.ENTRANCE,
  onClick: (target, point) =>
    TURN_MANAGER.triggerEvent(TURN_MANAGER.EventId.CLICKED_ENTRANCE, point),
  image: 'door-V.png',
};

/** @type {TileDefinition} */
const EXIT_DEFN = {
  role: TileRole.EXIT,
  onClick: (target, point) =>
    TURN_MANAGER.triggerEvent(TURN_MANAGER.EventId.CLICKED_EXIT, point),
  image: 'door-V.png',
};

const TILE_MAP_KEYS = new Map([
  ['x', { role: TileRole.OBSTACLE, image: 'default.png' }],
  // wall parts
  ['#-TL', { role: TileRole.OBSTACLE, image: 'corner-TL.png' }],
  ['#-T', { role: TileRole.OBSTACLE, image: 'wall-TOP.png' }],
  ['#-TR', { role: TileRole.OBSTACLE, image: 'corner-TR.png' }],
  ['#-R', { role: TileRole.OBSTACLE, image: 'wall-RIGHT.png' }],
  ['#-BR', { role: TileRole.OBSTACLE, image: 'corner-BR.png' }],
  ['#-B', { role: TileRole.OBSTACLE, image: 'wall-BOTTOM.png' }],
  ['#-BL', { role: TileRole.OBSTACLE, image: 'corner-BL.png' }],
  ['#-L', { role: TileRole.OBSTACLE, image: 'wall-LEFT.png' }],
  ['#', { role: TileRole.OBSTACLE, image: 'wall-TOP.png' }],
  // doors
  ['=-T', EXIT_DEFN],
  ['=-R', EXIT_DEFN],
  ['=-B', EXIT_DEFN],
  ['=-L', EXIT_DEFN],
  ['=', EXIT_DEFN],
  ['-', ENTRANCE_DEFN],
  // ground
  ['.', GROUND_DEFN],
  [',', GROUND_DEFN],
]);

/**
 * Definition of a scene
 */
export class SceneDefinition {
  /** @type {string} */
  intro;
  /** @type {Actors} */
  enemies;
  /** @type {string[]} */
  mapDesign;
  /**
   * Construct an empty scene
   */
  constructor() {
    this.enemies = [];
    this.mapDesign = [];
  }
}

/**
 * Create the enemies.
 * @param {SceneDefinition} sceneDefn
 * @returns {Actor[]}
 */
function createEnemies(sceneDefn) {
  const enemies = [];
  sceneDefn.enemies.forEach((enemy) => {
    enemies.push(ACTOR_MAP.get(enemy).create());
  });
  return enemies;
}

/**
 * Add the load method to the scene object.
 * @param {*} sceneDefn - the definition of the scene.
 * @returns {Promise} fulfils to null;
 */
function createLoadFn(sceneDefnUnused) {
  return () => {
    return IMAGE_MANAGER.loadSpriteMap(textureMap, textureUrl);
  };
}

/**
 * Add the load method to the scene object.
 * @param {*} sceneDefn - the definition of the scene.
 * @returns {Promise} fulfils to null;
 */
function createInitialiseFn(sceneDefn) {
  return () => {
    const tileMap = new TileMap(
      SCREEN.getContext2D(),
      generateTileMapPlan(sceneDefn.mapDesign, TILE_MAP_KEYS),
      GRID_SIZE
    );
    WORLD.setTileMap(tileMap);
    const heroActor = ACTOR_MAP.get('HERO').create();
    createEnemies(sceneDefn).forEach((enemy) => {
      WORLD.addActor(enemy);
      enemy.position = tileMap.getRandomFreeGroundTile().worldPoint;
    });

    GAME.setCameraToTrack(heroActor.sprite, 100, 0);

    WORLD.addActor(heroActor);

    TURN_MANAGER.startWithHero(heroActor);

    SCREEN.displayHtmlElement(
      UI.createMessageElement('Welcome to the dungeon.')
    );
    return Promise.resolve(null);
  };
}

/**
 * Add the load method to the scene object.
 * @param {*} sceneDefn - the definition of the scene.
 */
function createUpdateFn(sceneDefn) {
  return () => {
    return;
  };
}

/**
 * Add the load method to the scene object.
 * @param {*} sceneDefn - the definition of the scene.
 * @returns {Promise} fulfils to null;
 */
function createUnloadFn(sceneDefn) {
  return () => {
    return Promise.resolve(null);
  };
}

/**
 * Parse the scene definition to create a Scene
 * @param {SceneDefinition} sceneDefn
 * @returns {Scene}
 */
export function parseSceneDefinition(sceneDefn) {
  const scene = {};
  scene.load = createLoadFn(sceneDefn);
  scene.initialise = createInitialiseFn(sceneDefn);
  scene.update = createUpdateFn(sceneDefn);
  scene.unload = createUnloadFn(sceneDefn);
  return scene;
}

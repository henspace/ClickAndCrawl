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

import { generateTileMapPlan } from '../tileMaps/tilePlan.js';
import { TileMap } from '../tileMaps/tileMap.js';
import TURN_MANAGER from '../game/turnManager.js';
import WORLD from '../game/world.js';
import GAME from '../game/game.js';
import ACTOR_MAP from './actorMap.js';
import SCREEN from '../game/screen.js';
import { TILE_MAP_KEYS } from './symbolMapping.js';
import UI from '../dom/ui.js';
import HUD from '../game/hud.js';

const GRID_SIZE = 48;

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
    return IMAGE_MANAGER.loadSpriteMap(textureMap, textureUrl).then(() =>
      createHud()
    );
  };
}

/**
 * Create the HUD
 */
function createHud() {
  const button = HUD.addButton('hud-auto-centre-', () => {
    GAME.setTrackHeroOn();
  });
  button.position.x = -4;
  button.position.y = 0;
  HUD.setVisible(true);
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
      enemy.position = tileMap.getRandomFreeGroundTile().worldPoint;
      WORLD.addActor(enemy);
    });

    GAME.setCameraToTrack(heroActor.sprite, 200, 0);

    WORLD.addActor(heroActor);

    TURN_MANAGER.startWithHero(heroActor);

    UI.showMessage(sceneDefn.intro);
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
    HUD.clear();
    HUD.setVisible(false);
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

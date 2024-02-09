/**
 * @file Convert a screen definition into a scene.
 *
 * @module scriptReaders/sceneDefinitionParser
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

import IMAGE_MANAGER from '../utils/sprites/imageManager.js';
import textureMap from '../../assets/images/dungeon.json';
import textureUrl from '../../assets/images/dungeon.png';

import { TilePlan } from '../utils/tileMaps/tilePlan.js';
import { TileMap } from '../utils/tileMaps/tileMap.js';
import TURN_MANAGER from '../utils/game/turnManager.js';
import WORLD from '../utils/game/world.js';
import GAME from '../utils/game/game.js';
import ACTOR_MAP from './actorMap.js';
import SCREEN from '../utils/game/screen.js';
import { TILE_MAP_KEYS } from './symbolMapping.js';
import UI from '../utils/dom/ui.js';
import { CharacterTraits } from '../dnd/traits.js';
import { AbstractScene } from '../utils/game/scene.js';
const GRID_SIZE = 48;

/**
 * @typedef {Object} ActorDefn
 * @property {string} name
 * @property {import('../dnd/traits.js').CharacterTraits} traits
 */
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
    const actor = ACTOR_MAP.get(enemy.id).create();
    actor.traits = enemy.traits;
    enemies.push(actor);
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
  const tilePlan = TilePlan.generateTileMapPlan(
    sceneDefn.mapDesign,
    TILE_MAP_KEYS
  );
  return () => {
    const tileMap = new TileMap(SCREEN.getContext2D(), tilePlan, GRID_SIZE);
    WORLD.setTileMap(tileMap);
    const heroActor = ACTOR_MAP.get('HERO').create();
    heroActor.traits = new CharacterTraits();
    createEnemies(sceneDefn).forEach((enemy) => {
      enemy.position = tileMap.getRandomFreeGroundTile().worldPoint;
      WORLD.addActor(enemy);
    });

    GAME.setCameraToTrack(heroActor.sprite, 200, 0);

    WORLD.addActor(heroActor);

    TURN_MANAGER.setHero(heroActor);

    return UI.showMessage(sceneDefn.intro);
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
  const scene = new AbstractScene();
  scene.doLoad = createLoadFn(sceneDefn);
  scene.doInitialise = createInitialiseFn(sceneDefn);
  scene.doUpdate = createUpdateFn(sceneDefn);
  scene.doUnload = createUnloadFn(sceneDefn);
  return scene;
}

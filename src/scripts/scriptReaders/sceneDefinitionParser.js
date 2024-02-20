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

import { TilePlan } from '../utils/tileMaps/tilePlan.js';
import { TileMap } from '../utils/tileMaps/tileMap.js';
import TURN_MANAGER from '../utils/game/turnManager.js';
import WORLD from '../utils/game/world.js';
import ACTOR_MAP from './actorMap.js';
import SCREEN from '../utils/game/screen.js';
import { TILE_MAP_KEYS } from './symbolMapping.js';
import { AbstractScene } from '../utils/game/scene.js';
import SCENE_MANAGER from '../utils/game/sceneManager.js';
import GameConstants from '../utils/game/gameConstants.js';

const GRID_SIZE = GameConstants.TILE_SIZE;

/** @type {Actor} */
let lastHero;

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
  /** @type {ActorDefn} */
  hero;
  /** @type {ActorDefn[]} */
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
 * Create the hero. If the scene definition doesn't have a hero definition, the
 * lastHero is used.
 * @param {SceneDefinition} sceneDefn
 * @returns {Actor}
 */
function createHero(sceneDefn) {
  if (sceneDefn.hero) {
    const actor = ACTOR_MAP.get(sceneDefn.hero.id).create();
    actor.traits = sceneDefn.hero.traits.clone();
    lastHero = actor;
    return actor;
  } else {
    if (!lastHero) {
      throw new Error('No hero has been defined.');
    }
    return lastHero;
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
 * Scene created from a scene definition.
 */
class ParsedScene extends AbstractScene {
  /** @type {SceneDefinition} */
  #sceneDefn;

  /** Construct the scene from a definition. */
  constructor(sceneDefn) {
    super();
    this.#sceneDefn = sceneDefn;
  }

  /** @override */
  doLoad() {
    return Promise.resolve();
  }

  doInitialise() {
    const tilePlan = TilePlan.generateTileMapPlan(
      this.#sceneDefn.mapDesign,
      TILE_MAP_KEYS
    );
    const tileMap = new TileMap(SCREEN.getContext2D(), tilePlan, GRID_SIZE);
    WORLD.setTileMap(tileMap);
    this.heroActor = createHero(this.#sceneDefn);
    createEnemies(this.#sceneDefn).forEach((enemy) => {
      enemy.position = tileMap.getRandomFreeGroundTile().worldPoint;
      WORLD.addActor(enemy);
    });
    SCENE_MANAGER.setCameraToTrack(this.heroActor.sprite, 200, 0);
    WORLD.addActor(this.heroActor);
    TURN_MANAGER.setHero(this.heroActor);
    return Promise.resolve();
  }

  /**
   * @override
   */
  doUpdate(deltaSecondsUnused) {
    return;
  }

  /**
   * @override
   */
  doUnload() {
    return Promise.resolve(null);
  }
}
/**
 * Parse the scene definition to create a Scene
 * @param {SceneDefinition} sceneDefn
 * @returns {Scene}
 */
export function parseSceneDefinition(sceneDefn) {
  return new ParsedScene(sceneDefn);
}

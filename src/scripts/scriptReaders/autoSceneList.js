/**
 * @file Automatic scene generator
 *
 * @module scriptReaders/autoSceneList
 */
/**
 * license {@link https://opensource.org/license/mit/|MIT}
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

import { ALMANAC_LIBRARY } from '../dnd/almanacs/almanacs.js';
import { SceneDefinition } from '../gameManagement/sceneManager.js';
import * as maths from '../utils/maths.js';
import LOG from '../utils/logging.js';
import { RoomCreator } from '../utils/tileMaps/roomGenerator.js';
import { i18n } from '../utils/messageManager.js';
import { buildActor } from '../dnd/almanacs/actorBuilder.js';

/** @type {module:players/actors~Actor} */
let heroActor;

/**
 * Create a set of enemies based on the hero's level.
 * This is based on guide that 4 players should be able to
 * challenge a monster with a challenge rating equal to its
 * level as a worthy but not deadly challenge. As we have one
 * player, a challenge rating of 1/4 its level should be okay.
 * This is regarded as a medium challenge
 */
/**
 * @typedef {number} DungeonChallengeValue
 */
/**
 * @enum {DungeonChallengeValue}
 */
export const DungeonChallenge = {
  EASY: 0.125,
  MEDIUM: 0.25,
  HARD: 0.5,
};
/**
 * Create a pool of enemies based on the dungeon rating.
 * @param {DungeonChallengeValue} dungeonRating
 * @returns {module:almanacs/almanacs~Almanac}
 */
function createEnemyPoolAlmanac(dungeonRating) {
  const level = heroActor?.traits.getCharacterLevel() ?? 1;
  const maxMonsterChallenge = dungeonRating * level + 0.001; // prevent float issues.
  return ALMANAC_LIBRARY.getAlmanac('ENEMIES').filter(
    (entry) => entry.challengeRating <= maxMonsterChallenge
  );
}
/**
 * @implements {module:gameManagement/sceneManager~SceneList}
 */
class AutoSceneList {
  /** @type {number} */
  #index;
  /** @type {SceneDefinition} */
  #sceneDefn;

  /**
   */
  constructor() {
    this.reset();
  }

  /**
   * @returns {number}
   */
  getIndex() {
    return this.#index;
  }

  /**
   * Get the next scene.
   * @returns {SceneDefinition}
   */
  getNext() {
    this.#index++;
    if (this.#index === 0) {
      heroActor = null; // always a new actor at level 0
    }
    this.#buildScene();
    return this.#sceneDefn;
  }
  /**
   * Test to see if there is another scene.
   * @returns {boolean}
   */
  hasNext() {
    return true;
  }

  /**
   * Reset
   */
  reset() {
    this.#index = -1;
  }

  /**
   * Restore a saved game. Game are saved when a dungeon is exited so the call should
   * be to the next scene.
   * @param {number} index
   * @param {Actor} hero
   */
  restore(index, hero) {
    heroActor = hero;
    this.#index = index;
  }

  /** Build a scene */
  #buildScene() {
    this.#sceneDefn = new SceneDefinition();

    this.#setHero();

    this.#addIntro();
    this.#addEnemies();
    this.#addTraders();
    this.#addArtefacts();
    this.#addMap();
  }

  /**
   * Add scene introduction.
   */
  #addIntro() {
    this.#sceneDefn.intro = i18n`MESSAGE ENTER LEVEL ${this.#index}`;
  }
  /**
   * Add hero to scene.
   */
  #setHero() {
    if (!heroActor) {
      const almanacEntry = ALMANAC_LIBRARY.findById('hero', ['HEROES']);
      if (!almanacEntry) {
        throw new Error(`Could not find hero in almanacs.`);
      }
      heroActor = buildActor(almanacEntry);
    }
    this.#sceneDefn.hero = heroActor;
  }

  /**
   * Add enemies to scene.
   * @param {DungeonChallengeValue} [challenge = DungeonChallenge.MEDIUM]
   */
  #addEnemies(challenge = DungeonChallenge.MEDIUM) {
    const maxEnemies = 8;
    const enemyPoolAlmanac = createEnemyPoolAlmanac(challenge);
    let totalCr = 0;
    let totalEnemies = 0;
    while (totalCr < challenge && totalEnemies < maxEnemies) {
      const enemy = enemyPoolAlmanac.getRandomEntry();
      totalCr += enemy.challengeRating;
      totalEnemies++;
      this.#sceneDefn.enemies.push(enemy);
    }
  }

  /**
   * Add enemies to scene.
   */
  #addTraders() {
    const totalTraders = 1;
    for (let traderIndex = 0; traderIndex < totalTraders; traderIndex++) {
      const almanacEntry = ALMANAC_LIBRARY.getRandomEntry(
        'TRADERS',
        (entry) => entry.minLevel <= this.#index
      );
      this.#sceneDefn.enemies.push(almanacEntry);
    }
  }

  /**
   * Add artefacts to scene.
   */
  #addArtefacts() {
    const pooledAlmanac = ALMANAC_LIBRARY.getPooledAlmanac(
      ['ARTEFACTS', 'MAGIC', 'MONEY', 'WEAPONS'],
      (entry) => entry.minLevel <= this.#index
    );
    let totalArtefacts = maths.getRandomIntInclusive(10, 10);
    while (totalArtefacts-- > 0) {
      const almanacEntry = pooledAlmanac.getRandomEntry();
      if (almanacEntry) {
        this.#sceneDefn.artefacts.push(almanacEntry);
      }
    }
  }

  /** Add a random map */
  #addMap() {
    const creator = new RoomCreator({
      minCols: 12,
      maxCols: 40,
      maxRoomCols: 10,
      minRows: 12,
      maxRows: 40,
      maxRoomRows: 6,
    });
    this.#sceneDefn.mapDesign = creator.generate();
    LOG.debug('Random map');
    this.#sceneDefn.mapDesign.forEach((line) => LOG.debug(line));
  }
}

/**
 * Create a new auto scene list
 * @param {string} script
 * @returns {module:gameManagement/sceneManager~SceneList}
 */
export function createAutoSceneList(scriptUnused) {
  return new AutoSceneList();
}

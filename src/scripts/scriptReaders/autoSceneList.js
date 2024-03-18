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

  /** Build a scene */
  #buildScene() {
    this.#sceneDefn = new SceneDefinition();
    if (this.#index === 0) {
      this.#addHero();
    }
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
  #addHero() {
    const almanacEntry = ALMANAC_LIBRARY.findById('hero', ['HEROES']);
    if (!almanacEntry) {
      throw new Error(`Could not find hero in almanacs.`);
    }
    this.#sceneDefn.heroes.push(almanacEntry);
  }

  /**
   * Add enemies to scene.
   */
  #addEnemies() {
    const totalEnemies = maths.getRandomIntInclusive(5, 10);
    for (let enemyIndex = 0; enemyIndex < totalEnemies; enemyIndex++) {
      const almanacEntry = ALMANAC_LIBRARY.getRandomEntry(
        'ENEMIES',
        this.#index
      );
      this.#sceneDefn.enemies.push(almanacEntry);
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
        this.#index
      );
      this.#sceneDefn.enemies.push(almanacEntry);
    }
  }

  /**
   * Add artefacts to scene.
   */
  #addArtefacts() {
    const totalArtefacts = maths.getRandomIntInclusive(10, 10);
    for (
      let artefactIndex = 0;
      artefactIndex < totalArtefacts;
      artefactIndex++
    ) {
      const almanacEntry = ALMANAC_LIBRARY.getRandomEntry(
        ['WEAPONS', 'MONEY', 'ARTEFACTS'],
        this.#index
      );
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

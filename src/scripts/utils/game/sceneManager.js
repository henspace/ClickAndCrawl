/**
 * @file Scene manager
 *
 * @module utils/game/sceneManager
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

import { parseSceneDefinition } from '../../scriptReaders/sceneDefinitionParser.js';

let sceneDefinitions;

let currentIndex;

/**
 * Configure the scenes from the script.
 * @param {import('../../scriptReaders/index.js').SceneDefinition} sceneDefns
 */
function setSceneDefinitions(sceneDefns) {
  sceneDefinitions = sceneDefns;
  currentIndex = -1;
}

/**
 * @returns {import('./scene.js').Scene} scene constructed from requested scene definition.
 * null if there are no more scenes.
 */
function getNextScene() {
  currentIndex++;
  return currentIndex < sceneDefinitions.length
    ? parseSceneDefinition(sceneDefinitions[currentIndex])
    : null;
}

/**
 * Test to see if there are more scenes.
 * @returns {boolean}
 */
function areThereMoreScenes() {
  return currentIndex < sceneDefinitions.length - 1;
}

/**
 * Reset the index and return the first scene.
 * @returns {import('./scene.js').Scene} scene constructed from requested scene definition.
 * null if there are no more scenes.
 */
function getFirstScene() {
  currentIndex = -1;
  return getNextScene();
}

/**
 * SCENE_MANAGER Singleton.
 */
const SCENE_MANAGER = {
  setSceneDefinitions: setSceneDefinitions,
  getNextScene: getNextScene,
  getFirstScene: getFirstScene,
  areThereMoreScenes: areThereMoreScenes,
};

export default SCENE_MANAGER;

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
import HUD from './hud.js';
import { addFullscreenButtonToHud } from './fullscreen.js';
import { NavigationButtons, NavigationLocation } from './hudNavSet.js';
import WORLD from './world.js';
import { CameraDolly, CameraTracking } from './camera.js';
import LOG from '../logging.js';

/** @type {import('../sprites/sprite.js').Sprite}  */
let cameraDolly;

let sceneDefinitions;

let currentIndex;

let currentScene;

/** @type {import('./actors.js').Actor} */
let hero;

let navigationButtons;

/**
 * Set camera dolly
 * @param {import('../sprites/sprite.js').Sprite} sprite
 * @param {number} speed - See {@link module:utils/game/camera.createCameraDolly}
 * @param {number} proportionSeparated - See {@link module:utils/game/camera.createCameraDolly}
 */
function setCameraToTrack(sprite, speed, proportionSeparated) {
  cameraDolly = new CameraDolly(sprite, speed, proportionSeparated);
}

/**
 * Create the HUD
 */
function createHud() {
  navigationButtons = new NavigationButtons(
    cameraDolly,
    48,
    NavigationLocation.BR
  );
  addFullscreenButtonToHud();

  HUD.setVisible(true);
}

/**
 * Clear the HUD.
 */
function clearHud() {
  navigationButtons = null;
  HUD.clear();
  HUD.setVisible(false);
}
/** Set the current scene, unloading any existing scene
 * @param {import('./scene.js').Scene} scene
 * @returns {Promise} fulfils to undefined.
 * Rejects if scene is undefined or null.
 */
function setScene(scene) {
  if (!scene) {
    LOG.error(
      'Attempt made to switch to the next scene when there are no more.'
    );
    return Promise.reject();
  }
  return unloadScene(currentScene).then(() => loadScene(scene));
}

/**
 * Load scene
 * @param {import('./scene.js').Scene} scene
 * @returns {Promise} fulfills to null
 */
function loadScene(scene) {
  return scene
    .load()
    .then(() => scene.initialise())
    .then(() => {
      createHud();
      currentScene = scene;
    });
}

/**
 * Unload scene
 * @param {import('./scene.js').Scene} scene
 * @returns {Promise} fulfills to null
 */
function unloadScene(scene) {
  if (scene) {
    return scene.unload().then(() => {
      WORLD.clearAll();
      currentScene = null;
      clearHud();
      return Promise.resolve();
    });
  } else {
    return Promise.resolve(null);
  }
}

/**
 * Unload current scene
 * @returns {Promise} fulfills to null
 */
function unloadCurrentScene() {
  return unloadScene(currentScene);
}
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
 * Switch to the first scene.
 * @returns {Promise} fulfils to undefined on success.
 * Rejects if no scenes.
 */
function switchToFirstScene() {
  return setScene(getFirstScene());
}

/**
 * Switch to the next scene.
 * @returns {Promise} fulfils to undefined on success.
 * Rejects if there are no more.
 */
function switchToNextScene() {
  return setScene(getNextScene());
}

/**
 * UPdate the scene
 * @param {number} deltaSeconds
 */
function update(deltaSeconds) {
  currentScene?.update(deltaSeconds);
  cameraDolly?.update(deltaSeconds);
}

/**
 * Pan the camera.
 * @param {number} dx
 * @param {number} dy
 */
function panCameraBy(dx, dy) {
  cameraDolly.panBy(dx, dy);
  cameraDolly.setTrackingMethod(CameraTracking.OFF);
  navigationButtons.setTrackingState(false);
}

/**
 * SCENE_MANAGER Singleton.
 */
const SCENE_MANAGER = {
  areThereMoreScenes: areThereMoreScenes,
  setCameraToTrack: setCameraToTrack,
  panCameraBy: panCameraBy,
  setSceneDefinitions: setSceneDefinitions,
  switchToFirstScene: switchToFirstScene,
  switchToNextScene: switchToNextScene,
  unloadCurrentScene: unloadCurrentScene,
  update: update,
};

export default SCENE_MANAGER;

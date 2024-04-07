/**
 * @file Scene manager
 *
 * @module gameManagement/sceneManager
 */
/**
 * License {@link https://opensource.org/license/mit/|MIT}
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

import { parseSceneDefinition } from '../scriptReaders/sceneDefinitionParser.js';
import HUD from '../hud/hud.js';
import { NavigationButtons, NavigationLocation } from '../hud/hudNavSet.js';
import WORLD from '../utils/game/world.js';
import { CameraDolly, CameraTracking } from '../utils/game/camera.js';
import LOG from '../utils/logging.js';

/**
 * @interface SceneList
 */
/**
 * Get the next scene.
 * @function SceneList.getNext
 * @param{number} index
 * @returns {SceneDefinition}
 *
 */
/**
 * Has another scene.
 * @function SceneList.hasNext
 * @returns {boolean}
 *
 */
/**
 * Reset to the first scene.
 * @function SceneList.reset
 */

/**
 * Get the scene index. This will be the index of the last scene retrieved by
 * a call to getNext.
 * @function SceneList.getIndex
 * @returns {number}
 */

/**
 * Restore a saved game
 * @function SceneList.restore
 * @param {number} index
 * @param {module:players/actors.Actor} hero
 */

/** @type {module:utils/sprites/sprite~Sprite}  */
let cameraDolly;

/** @type {SceneList} */
let sceneDefnList;

let currentScene;

let navigationButtons;

/**
 * Definition of a scene
 */
export class SceneDefinition {
  /** @type {string} */
  intro;
  /** @type {Actor | ActorDefn} */
  hero;
  /** @type {ActorDefn[]} */
  enemies;
  /** @type {ActorDefn[]} */
  artefacts;
  /** @type {string[]} */
  mapDesign;
  /**
   * Construct an empty scene
   */
  constructor() {
    this.hero = null;
    this.enemies = [];
    this.artefacts = [];
    this.mapDesign = [];
  }
}

/**
 * Set camera dolly
 * @param {module:utils/sprites/sprite~Sprite} sprite
 * @param {number} speed - See {@link module:game/camera.createCameraDolly}
 * @param {number} proportionSeparated - See {@link module:game/camera.createCameraDolly}
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
    NavigationLocation.BR,
    NavigationLocation.BL
  );
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
 * @param {module:game/scene~Scene} scene
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
  return unloadScene(currentScene)
    .then(() => loadScene(scene))
    .then(() => scene);
}

/**
 * Load scene
 * @param {module:game/scene~Scene} scene
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
 * Unload scene. This can be safely called even if the
 * current scene has already been unloaded.
 * @param {module:game/scene~Scene} scene
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
 * @param {module:gameManagement/sceneManager~SceneDefinition} listOfScenes
 */
function setSceneList(listOfScenes) {
  sceneDefnList = listOfScenes;
  sceneDefnList.reset();
}

/**
 * Test to see if there are more scenes.
 * @returns {boolean}
 */
function areThereMoreScenes() {
  return sceneDefnList.hasNext();
}

/**
 * Continue from a saved scene.
 * @param {number} savedSceneLevel
 * @param {module:players/actors.Actor} savedHero
 * @returns {Promise} fulfils to the loaded scene.
 * Rejects if no scenes.
 */
function continueFromSavedScene(savedSceneLevel, savedHero) {
  sceneDefnList.restore(savedSceneLevel, savedHero);
  return setScene(getNextSceneFromList());
}
/**
 * Switch to the first scene.
 * @returns {Promise} fulfils to the loaded scene.
 * Rejects if no scenes.
 */
function switchToFirstScene() {
  sceneDefnList.reset();
  return setScene(getNextSceneFromList());
}

/**
 * Switch to the next scene.
 * @returns {Promise} fulfils to the loaded scene.
 * Rejects if there are no more.
 */
function switchToNextScene() {
  return setScene(getNextSceneFromList());
}

/**
 * Gets the next scene from the scene definition list.
 * @returns {Scene}
 */
function getNextSceneFromList() {
  return parseSceneDefinition(sceneDefnList.getNext());
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
 * Get the current scene level.
 * @returns {number}
 */
function getCurrentSceneLevel() {
  return sceneDefnList.getIndex();
}

/**
 * SCENE_MANAGER Singleton.
 */
const SCENE_MANAGER = {
  areThereMoreScenes: areThereMoreScenes,
  continueFromSavedScene: continueFromSavedScene,
  getCurrentSceneLevel: getCurrentSceneLevel,
  panCameraBy: panCameraBy,
  setCameraToTrack: setCameraToTrack,
  setSceneList: setSceneList,
  switchToFirstScene: switchToFirstScene,
  switchToNextScene: switchToNextScene,
  unloadCurrentScene: unloadCurrentScene,
  update: update,
};

export default SCENE_MANAGER;

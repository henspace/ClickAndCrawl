/**
 * @file The main game. This is a singleton as there can only be a single game.
 *
 * @module utils/game/game
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
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
import WORLD from './world.js';
import HUD from './hud.js';
import { checkEmojis } from '../text/emojis.js';
import GAME_CLOCK from '../time/clock.js';
import * as debug from '../debug.js';
import * as text from '../text/text.js';
import * as assetLoaders from '../assetLoaders.js';
import parseScript from '../scriptReaders.js/scriptParser.js';
import SCENE_MANAGER from '../game/sceneManager.js';
import { showOkDialog } from './dialogs/dialogs.js';
import { CameraDolly } from './camera.js';
import TURN_MANAGER from './turnManager.js';
import * as dragAndClick from '../dom/dragAndClick.js';

/** @type {DOMHighResTimeStamp} */
let lastTimeStamp;

/**
 * @type {import('./scene.js').Scene}
 */
let currentScene;

/**
 * @type {boolean}
 */
let updateScene = false;

/** @type {import('../sprites/sprite.js').Sprite}  */
let cameraDolly;

/**
 * Initialise the game engine.
 * @param {Object} screenOptions - @see {@link module:utils/game/screen~setScreen} for
 * details of options.
 */
async function initialise(screenOptions) {
  SCREEN.setOptions(screenOptions);
  checkEmojis(SCREEN.getContext2D());
  setupListeners();
  // Need a menu here but for now, just load the test screen.
  showOkDialog('Welcome to the Scripted Dungeon', "Let's start")
    .then(() => assetLoaders.loadTextFromUrl(assetLoaders.Urls.DUNGEON_SCRIPT))
    .then((script) => {
      SCENE_MANAGER.setSceneDefinitions(parseScript(script));
      setScene(SCENE_MANAGER.getScene(0));
    });
}

/**
 * Set up the listeners.
 */
function setupListeners() {
  const canvas = SCREEN.getScreenDetails().canvas;
  dragAndClick.addDragAndClickListeners(canvas);

  canvas.addEventListener(dragAndClick.CUSTOM_DRAG_EVENT_NAME, (event) => {
    console.log('drag');
    if (cameraDolly) {
      cameraDolly.tracking = false;
      cameraDolly.panBy(
        -SCREEN.uiToWorld(event.detail.dx),
        -SCREEN.uiToWorld(event.detail.dy)
      );
    }
  });
  canvas.addEventListener(dragAndClick.CUSTOM_END_DRAG_EVENT_NAME, (event) => {
    if (cameraDolly && event.detail) {
      cameraDolly.panBy(
        -SCREEN.uiToWorld(event.detail.dx),
        -SCREEN.uiToWorld(event.detail.dy)
      );
    }
    cameraDolly.tracking = true;
  });
  canvas.addEventListener(dragAndClick.CUSTOM_CLICK_EVENT_NAME, (event) => {
    const x = event.detail.x;
    const y = event.detail.y;
    const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
    console.log(
      `Canvas click at (${x}, ${y}): canvas (${mappedPositions.canvas.x}, ${mappedPositions.canvas.y}), world (${mappedPositions.world.x}, ${mappedPositions.world.y})`
    );
    if (!HUD.resolveClick(mappedPositions)) {
      WORLD.resolveClick(mappedPositions);
    }
  });
}

/** Set the current scene, unloading any existing scene
 * @param {import('./scene.js').Scene} scene
 */
function setScene(scene) {
  updateScene = false;
  unloadScene(currentScene)
    .then(() => loadScene(scene))
    .then(() => start());
}

/**
 * Load scene
 * @param {import('./scene.js').Scene} scene
 * @returns {Promise} fulfills to null
 */
function loadScene(scene) {
  currentScene = scene;
  return scene
    .load()
    .then(() => scene.initialise())
    .then(() => setCameraToTrack(TURN_MANAGER.getHeroActor().sprite, 50, 0));
}

/**
 * Unload scene
 * @param {import('./scene.js').Scene} scene
 * @returns {Promise} fulfills to null
 */
function unloadScene(scene) {
  return scene ? scene.unload() : Promise.resolve(null);
}

function start() {
  updateScene = true;
  window.requestAnimationFrame(gameLoop);
}

/**
 * Main animation loop.
 * @param {DOMHighResTimeStamp} timeStamp
 */
function gameLoop(timeStamp) {
  if (!updateScene) {
    return;
  }
  GAME_CLOCK.updateTimeNow(timeStamp);
  if (lastTimeStamp) {
    const deltaSeconds = (timeStamp - lastTimeStamp) / 1000;
    const screenDetails = SCREEN.getScreenDetails();
    const context = SCREEN.getContext2D();
    context.clearRect(0, 0, screenDetails.width, screenDetails.height);
    WORLD.update(deltaSeconds);
    currentScene.update(deltaSeconds);
    HUD.update(deltaSeconds);
    cameraDolly?.update(deltaSeconds);
    if (debug.OPTIONS.showFps) {
      showFps(1 / deltaSeconds);
    }
  }

  lastTimeStamp = timeStamp;
  window.requestAnimationFrame(gameLoop);
}

/**
 * Show frames per second on screen.
 * @param {number} fps - frames per second
 */
function showFps(fps) {
  text.writeText(
    SCREEN.getContext2D(),
    `FPS: ${Math.round(fps)}`,
    {
      x: 0,
      y: SCREEN.getScreenBounds().height,
    },
    { color: 'green' }
  );
}

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
 * The game singleton
 */
const GAME = {
  initialise: initialise,
  setScene: setScene,
  setCameraToTrack: setCameraToTrack,
};

export default GAME;

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
import parseScript from '../../scriptReaders/scriptParser.js';
import SCENE_MANAGER from '../game/sceneManager.js';
import UI from '../dom/ui.js';
import { CameraDolly } from './camera.js';
import { NavigationButtons, NavigationLocation } from './hudNavSet.js';
import * as pointerActions from '../dom/pointerActions.js';
import TURN_MANAGER from './turnManager.js';
import { AnimatedImage } from '../sprites/animation.js';
import { LoopMethod } from '../arrays/indexer.js';

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

/** @type {NavigationButtons} */
let navigationButtons;

/**
 * Request full screen mode.
 * @param {Element} element - what should go full screen.
 * @param {Object} options - see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen}
 * @returns {Promise}
 */
function requestFullscreen(element, options) {
  if (element.requestFullscreen) {
    return element.requestFullscreen(options);
  }
  return Promise.reject(
    new Error('Fullscreen requests not supported by browser')
  );
}
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
  UI.showOkDialog('Welcome to the Scripted Dungeon', "Let's start")
    .then(() => assetLoaders.loadTextFromUrl(assetLoaders.Urls.DUNGEON_SCRIPT))
    .then((script) => SCENE_MANAGER.setSceneDefinitions(parseScript(script)))
    .then(() => TURN_MANAGER.triggerEvent(TURN_MANAGER.EventId.START_GAME))
    .catch((error) => alert(error.message));
}

/**
 * Set up the listeners.
 */
function setupListeners() {
  const canvas = SCREEN.getCanvas();
  pointerActions.addPointerListeners(canvas);

  canvas.addEventListener(pointerActions.CUSTOM_CLICK_EVENT_NAME, (event) => {
    const x = event.detail.x;
    const y = event.detail.y;
    const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
    console.debug(
      `Canvas click at (${x}, ${y}): canvas (${mappedPositions.canvas.x}, ${mappedPositions.canvas.y}), world (${mappedPositions.world.x}, ${mappedPositions.world.y})`
    );
    if (!HUD.resolveClick(mappedPositions)) {
      WORLD.resolveClick(mappedPositions);
    }
  });

  canvas.addEventListener(
    pointerActions.CUSTOM_POINTER_DOWN_EVENT_NAME,
    (event) => {
      const x = event.detail.x;
      const y = event.detail.y;
      const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
      console.debug(
        `Canvas pointer down at (${x}, ${y}): canvas (${mappedPositions.canvas.x}, ${mappedPositions.canvas.y}), world (${mappedPositions.world.x}, ${mappedPositions.world.y})`
      );
      HUD.resolvePointerDown(mappedPositions);
    }
  );

  canvas.addEventListener(
    pointerActions.CUSTOM_POINTER_UP_EVENT_NAME,
    (event) => {
      const x = event.detail.x;
      const y = event.detail.y;
      const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
      console.debug(
        `Canvas pointer up at (${x}, ${y}): canvas (${mappedPositions.canvas.x}, ${mappedPositions.canvas.y}), world (${mappedPositions.world.x}, ${mappedPositions.world.y})`
      );
      HUD.resolvePointerUp(mappedPositions);
    }
  );

  canvas.addEventListener(
    pointerActions.CUSTOM_POINTER_CANCEL_EVENT_NAME,
    (event) => {
      const x = event.detail.x;
      const y = event.detail.y;
      const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
      console.debug(
        `Canvas pointer cancel at (${x}, ${y}): canvas (${mappedPositions.canvas.x}, ${mappedPositions.canvas.y}), world (${mappedPositions.world.x}, ${mappedPositions.world.y})`
      );
      HUD.resolvePointerCancel(mappedPositions);
    }
  );

  canvas.addEventListener('contextmenu', (event) => {
    console.debug('Context menu');
    const x = event.detail.x;
    const y = event.detail.y;
    const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
    if (!HUD.resolveContextMenu(mappedPositions)) {
      WORLD.resolveContextMenu(mappedPositions);
    }
    event.preventDefault();
  });
}

/** Set the current scene, unloading any existing scene
 * @param {import('./scene.js').Scene} scene
 * @returns {Promise} fulfils to undefined
 */
function setScene(scene) {
  return unloadScene(currentScene)
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
    .then(() => createHud());
}

/**
 * Unload scene
 * @param {import('./scene.js').Scene} scene
 * @returns {Promise} fulfills to null
 */
function unloadScene(scene) {
  if (scene) {
    return scene.unload().then(() => {
      updateScene = false;
      return clearHud();
    });
  } else {
    return Promise.resolve(null);
  }
}

function start() {
  updateScene = true;
  window.requestAnimationFrame(gameLoop);
}

/**
 * Create the HUD
 */
function createHud() {
  if (!navigationButtons) {
    navigationButtons = new NavigationButtons(
      cameraDolly,
      48,
      NavigationLocation.BR
    );
  }
  addFullscreenButton();
  HUD.setVisible(true);
}

function addFullscreenButton() {
  const fsImage = new AnimatedImage(
    0,
    {
      prefix: 'hud-fullscreen-',
      startIndex: 0,
      padding: 3,
      suffix: '.png',
    },
    { framePeriodMs: 1, loopMethod: LoopMethod.STOP }
  );
  const button = HUD.addButton(
    fsImage,
    () => {
      requestFullscreen(document.body, { navigationUI: 'hide' });
    },
    () => {
      document.exitFullscreen();
    }
  );
  button.position.x = 48;
  button.position.y = -48;
}
/**
 * Clear the HUD.
 */
function clearHud() {
  HUD.clear();
  HUD.setVisible(false);
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
    SCREEN.clearCanvas();
    SCREEN.setOpacity(currentScene.getOpacity());
    WORLD.update(deltaSeconds);
    currentScene.update(deltaSeconds);
    SCREEN.setOpacity(1);
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
      y: SCREEN.getCanvasDimensions().height,
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

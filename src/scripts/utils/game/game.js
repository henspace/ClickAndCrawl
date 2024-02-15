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
import LOG from '../logging.js';

import * as pointerActions from '../dom/pointerActions.js';
import TURN_MANAGER from './turnManager.js';

/** @type {DOMHighResTimeStamp} */
let lastTimeStamp;

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
  UI.showOkDialog('Welcome to the Scripted Dungeon', "Let's start", 'door')
    .then(() => assetLoaders.loadTextFromUrl(assetLoaders.Urls.DUNGEON_SCRIPT))
    .then((script) => SCENE_MANAGER.setSceneDefinitions(parseScript(script)))
    .then(() => TURN_MANAGER.triggerEvent(TURN_MANAGER.EventId.START_GAME))
    .then(() => startGame())
    .catch((error) => {
      LOG.error(error);
      alert(`Fatal error in main game. ${error.message}`);
      return;
    });
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
      HUD.resolvePointerDown(mappedPositions);
    }
  );

  canvas.addEventListener(
    pointerActions.CUSTOM_POINTER_UP_EVENT_NAME,
    (event) => {
      const x = event.detail.x;
      const y = event.detail.y;
      const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
      HUD.resolvePointerUp(mappedPositions);
    }
  );

  canvas.addEventListener(
    pointerActions.CUSTOM_POINTER_CANCEL_EVENT_NAME,
    (event) => {
      const x = event.detail.x;
      const y = event.detail.y;
      const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
      HUD.resolvePointerCancel(mappedPositions);
    }
  );

  canvas.addEventListener('contextmenu', (event) => {
    LOG.debug('Context menu');
    const x = event.detail.x;
    const y = event.detail.y;
    const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
    if (!HUD.resolveContextMenu(mappedPositions)) {
      WORLD.resolveContextMenu(mappedPositions);
    }
    event.preventDefault();
  });
}

/**
 * Start the game.
 */
function startGame() {
  window.requestAnimationFrame(gameLoop);
}

/**
 * Main animation loop.
 * @param {DOMHighResTimeStamp} timeStamp
 */
function gameLoop(timeStamp) {
  GAME_CLOCK.updateTimeNow(timeStamp);
  if (lastTimeStamp) {
    const deltaSeconds = (timeStamp - lastTimeStamp) / 1000;
    SCENE_MANAGER.update(deltaSeconds);
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
 * The game singleton
 */
const GAME = {
  initialise: initialise,
};

export default GAME;

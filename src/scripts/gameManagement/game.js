/**
 * @file The main game. This is a singleton as there can only be a single game.
 *
 * @module gameManagement/game
 */
/**
 * License {@link https://opensource.org/license/mit/|MIT}
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
import SCREEN from '../utils/game/screen.js';
import WORLD from '../utils/game/world.js';
import HUD from '../hud/hud.js';
import { checkEmojis } from '../utils/text/emojis.js';
import GAME_CLOCK from '../utils/time/clock.js';
import * as debug from '../utils/debug.js';
import * as text from '../utils/text/text.js';
import * as assetLoaders from '../utils/assetLoaders.js';
import { createAutoSceneList } from '../scriptReaders/autoSceneList.js';
import SCENE_MANAGER from './sceneManager.js';
import UI from '../utils/dom/ui.js';
import LOG from '../utils/logging.js';

import * as pointerActions from '../utils/dom/pointerActions.js';
import TURN_MANAGER from './turnManager.js';

import IMAGE_MANAGER from '../utils/sprites/imageManager.js';
import SOUND_MANAGER from '../utils/soundManager.js';
import { initialiseSettings } from '../dialogs/settingsDialog.js';

import MESSAGE_MAP from '../constants/messageMap.js';
import { i18n, MESSAGES } from '../utils/messageManager.js';
import { loadAlmanacs } from '../dnd/almanacs/almanacs.js';
import { AssetUrls, SpriteSheet } from '../../assets/assets.js';
import ANIMATION_STATE_MANAGER from './animationState.js';
import PERSISTENT_DATA from '../utils/persistentData.js';
import { setFullscreenState } from '../utils/fullscreen.js';

/**
 * Tile size to use throughout the game
 */
const TILE_SIZE = 48;

/** @type {DOMHighResTimeStamp} */
let lastTimeStamp;

/**
 * Initialise the game engine.
 * @param {Object} screenOptions - @see {@link module:game/screen~setScreen} for
 * details of options.
 */
async function initialise(screenOptions) {
  SCREEN.setOptions(screenOptions);
  const splashPopup = UI.popupElement(createSplashElement());
  MESSAGES.setMap(MESSAGE_MAP);
  checkEmojis(SCREEN.getContext2D());
  setupListeners();
  initialiseSettings();
  UI.showOkDialog(i18n`MESSAGE WELCOME`, {
    okButtonLabel: i18n`BUTTON START`,
    className: 'door',
  })
    .then(() => setFullscreenState(PERSISTENT_DATA.get('START_IN_FULLSCREEN')))
    .then(() => SOUND_MANAGER.loadAndPlayMusic(AssetUrls.MUSIC))
    .then(() => SOUND_MANAGER.loadEffects(AssetUrls.SOUND_EFFECTS_MAP))

    .then(() =>
      IMAGE_MANAGER.loadSpriteMap(SpriteSheet.data, SpriteSheet.textureUrl)
    )
    .then(() => assetLoaders.loadTextFromUrl(AssetUrls.DUNGEON_SCRIPT))
    .then((script) => SCENE_MANAGER.setSceneList(createAutoSceneList(script)))
    .then(() => loadAlmanacs(AssetUrls.ALMANAC_MAP))
    .then(() => {
      LOG.debug('All assets loaded. Trigger main menu.');
      splashPopup.remove();
      return TURN_MANAGER.triggerEvent(TURN_MANAGER.EventId.MAIN_MENU);
    })
    .then(() => {
      ANIMATION_STATE_MANAGER.onStartAnimation = () => startAnimation();
      ANIMATION_STATE_MANAGER.setAnimationState(true);
    })
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

  canvas.addEventListener(
    pointerActions.CUSTOM_POINTER_DRAG_EVENT_NAME,
    (event) => {
      SCENE_MANAGER.panCameraBy(-event.detail.dx, -event.detail.dy);
    }
  );

  canvas.addEventListener(
    pointerActions.CUSTOM_CONTEXT_MENU_EVENT_NAME,
    (event) => {
      const x = event.detail.x;
      const y = event.detail.y;
      const mappedPositions = SCREEN.uiCoordsToMappedPositions(x, y);
      if (!HUD.resolveContextMenu(mappedPositions)) {
        WORLD.resolveContextMenu(mappedPositions);
      }
      event.preventDefault();
    }
  );
}

/**
 * Start the game.
 */
function startAnimation() {
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
    HUD.update(deltaSeconds);
    if (debug.OPTIONS.showFps) {
      showFps(1 / deltaSeconds);
    }
  }

  lastTimeStamp = timeStamp;
  if (ANIMATION_STATE_MANAGER.isAnimationOn()) {
    window.requestAnimationFrame(gameLoop);
  }
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
 * Create the splash screen element.
 * @returns {ELement}
 */
function createSplashElement() {
  const splash = document.createElement('div');
  const image = document.createElement('img');
  image.src = AssetUrls.SPLASH_IMAGE;
  splash.appendChild(image);

  const loading = document.createElement('div');
  loading.className = 'progress-indicator';
  splash.appendChild(loading);

  const loadingText = document.createElement('p');
  loadingText.innerText = 'Loading'; // do not use message map as not loaded yet.
  splash.appendChild(loadingText);

  return splash;
}

/**
 * The game singleton
 */
const GAME = {
  TILE_SIZE: TILE_SIZE,
  initialise: initialise,
};

export default GAME;

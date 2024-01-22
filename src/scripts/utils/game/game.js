/**
 * @file The main game starting point.
 *
 * @module utils/game/game
 *
 * @license
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
import * as screen from './screen.js';
import * as world from './world.js';
import * as hud from './hud.js';
import { checkEmojis } from '../text/emojis.js';
import { updateClock } from '../time/clock.js';
import { createCameraDolly } from './camera.js';
import * as debug from '../debug.js';
import * as text from '../text/text.js';

/**
 * @typedef {import('../sprites/sprite.js').Sprite} Sprite
 * @typedef {import('./scene.js').Scene} Scene
 */

/** @type {Sprite}  */
let cameraDolly;

/** @type {DOMHighResTimeStamp} */
let lastTimeStamp;

/**
 * @type {Scene}
 */
let currentScene;

/**
 * @type {boolean}
 */
let updateScene = false;

/**
 *
 */
/**
 * Initialise the game engine.
 * @param {Object} screenOptions - @see {@link module:utils/game/screen~setScreen} for
 * details of options.
 */
export async function initialise(screenOptions) {
  screen.setScreen(screenOptions);
  checkEmojis(screen.getContext2D());
}

/** Set the current scene, unloading any existing scene
 * @param {Scene} scene
 */
export function setScene(scene) {
  updateScene = false;
  unloadScene(currentScene)
    .then(() => loadScene(scene))
    .then(() => start());
}

/**
 * Set camera dolly
 * @param {Sprite} sprite
 * @param {number} speed - See {@link module:utils/game/camera.createCameraDolly}
 * @param {number} proportionSeparated - See {@link module:utils/game/camera.createCameraDolly}
 */
export function setCameraToTrack(sprite, speed, proportionSeparated) {
  cameraDolly = createCameraDolly(sprite, speed, proportionSeparated);
}

/**
 * Load scene
 * @param {Scene} scene
 * @returns {Promise} fulfills to null
 */
function loadScene(scene) {
  currentScene = scene;
  return scene.load().then(() => scene.initialise());
}

/**
 * Unload scene
 * @param {Scene} scene
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
  updateClock(timeStamp);
  if (lastTimeStamp) {
    const deltaSeconds = (timeStamp - lastTimeStamp) / 1000;
    const screenDetails = screen.getScreenDetails();
    const context = screen.getContext2D();
    context.clearRect(0, 0, screenDetails.width, screenDetails.height);
    world.update(deltaSeconds);
    currentScene.update(deltaSeconds);
    hud.update(deltaSeconds);
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
    screen.getContext2D(),
    `FPS: ${Math.round(fps)}`,
    {
      x: 0,
      y: screen.getBounds().height,
    },
    { color: 'green' }
  );
}

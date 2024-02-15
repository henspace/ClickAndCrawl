/**
 * @file Encapsulation of a Scene. A scene equates normally to a level in a
 * dungeon.
 *
 * @module utils/game/scene
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

import WORLD from './world.js';
import HUD from './hud.js';
import SCREEN from './screen.js';

/**
 * The base scene
 */
export class AbstractScene {
  /** @type {number} */
  #globalOpacity;
  /** @type {number} */
  #deltaOpacityPerSec;

  /** @type {number} */
  #fadeInSecs;
  /** @type {number} */
  #fadeOutSecs;

  /** Fade out promise resolution @type {function}  */
  #fadeOutResolve;

  /** @type {import('./actors.js').Actor} */
  heroActor;

  /**
   * Create the scene.
   * @param {number} [fadeInSecs = 2]
   * @param {number} [fadeOutSecs = 2]
   */
  constructor(fadeInSecs = 2, fadeOutSecs = 2) {
    if (fadeInSecs > 0) {
      this.#globalOpacity = 0;
      this.#deltaOpacityPerSec = 1 / fadeInSecs;
    } else {
      this.#deltaOpacityPerSec = 1;
    }
    this.#fadeInSecs = fadeInSecs;
    this.#fadeOutSecs = fadeOutSecs;
  }

  /**
   * Get the global opacity.
   * @returns {number}
   */
  getOpacity() {
    return this.#globalOpacity;
  }
  /**
   * Called at start. Game waits for preload before calling initialise.
   * @function Scene#load
   * @returns {Promise} fulfills to null
   */
  load() {
    return this.doLoad();
  }

  /**
   * Called after load. Game waits for initialise before starting the loop.
   * @function Scene#initialise
   * @returns {Promise} fulfills to null
   */
  initialise() {
    return this.doInitialise();
  }

  /**
   * Called in animation phase
   * @function Scene#update
   * @param {number} deltaSeconds
   */
  update(deltaSeconds) {
    SCREEN.clearCanvas();
    SCREEN.setOpacity(this.#globalOpacity);
    WORLD.update(deltaSeconds);
    this.doUpdate(deltaSeconds);
    HUD.update(deltaSeconds);
    SCREEN.setOpacity(1);
    if (this.#deltaOpacityPerSec !== 0) {
      this.#globalOpacity += deltaSeconds * this.#deltaOpacityPerSec;
      if (this.#globalOpacity > 1) {
        this.#deltaOpacityPerSec = 0;
        this.#globalOpacity = 1;
      } else if (this.#globalOpacity < 0) {
        this.#deltaOpacityPerSec = 0;
        this.#globalOpacity = 0;
      }
    }
    if (this.#fadeOutResolve && this.#globalOpacity === 0) {
      this.#fadeOutResolve();
      this.#fadeOutResolve = null;
    }
  }

  /**
   * Called when scene swapped out
   * @function Scene#unload
   * @returns {Promise} fulfills to null
   */
  unload() {
    return this.#fadeOut().then(() => this.doUnload());
  }

  /**
   * Fade out the scene
   * @returns {Promise} fulfils to undefined when fade complete.
   */
  #fadeOut() {
    if (this.#fadeOutSecs > 0) {
      this.#deltaOpacityPerSec = -1 / this.#fadeOutSecs;
      return new Promise((resolve) => {
        this.#fadeOutResolve = resolve;
      });
    } else {
      return Promise.resolve();
    }
  }

  /**
   * Called at start. Game waits for preload before calling initialise.
   * This should be overridden.
   * @returns {Promise} fulfills to null
   */
  doLoad() {
    return Promise.resolve();
  }

  /**
   * Called after load. Game waits for initialise before starting the loop.
   * This should be overridden
   * @returns {Promise} fulfills to null
   */
  doInitialise() {
    return Promise.resolve();
  }

  /**
   * Called in animation phase
   * This should be overridden
   * @param {number} deltaSeconds
   */
  doUpdate(deltaSecondsUnused) {
    return Promise.resolve();
  }

  /**
   * Called when scene swapped out
   * This should be overridden
   * @returns {Promise} fulfills to null
   */
  doUnload() {
    return Promise.resolve();
  }
}

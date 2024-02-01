/**
 * @file Camera dolly class. This provides a mechanism to allow the canvas to
 * track a specified Sprite.
 *
 * @module utils/game/camera
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
import { Sprite } from '../sprites/sprite.js';
import { Tracker } from '../sprites/movers.js';

/**
 * Camera dolly class
 */
export class CameraDolly {
  /** @type {import('../sprites/sprite.js').Sprite} */
  #sprite;
  /** @type {boolean} */
  tracking;

  /**
   * Create a camera dolly. This is a sprite that is designed to track a target.
   * @param {Sprite} target
   * @param {number} speed
   * @param {number} proportionSeparated - max space between camera and target as proportion of minimum screen dimension.
   */
  constructor(target, speed, proportionSeparated = 0) {
    const canvasDims = SCREEN.getCanvasDimensions();
    const separation =
      proportionSeparated * Math.min(canvasDims.width, canvasDims.height);
    this.#sprite = new Sprite();
    new Tracker({
      prey: target,
      speed: speed,
      maxSeparation: separation,
    }).applyAsContinuousToSprite(this.#sprite);
    this.tracking = true;
  }

  /**
   * Update the camera position.
   * @param {number} deltaSeconds - elapsed time since last update.
   */
  update(deltaSeconds) {
    this.#sprite.update(deltaSeconds);
    if (this.tracking) {
      SCREEN.centreCanvasOn(this.#sprite.position);
    }
  }
  /**
   * Pan by by dX, dY. Note you should disable tracking before manually moving
   * otherwise the camera will reposition itself back onto the sprite.
   * @param {number} dX
   * @param {number} dY
   */
  panBy(dX, dY) {
    this.#sprite.position.x += dX;
    this.#sprite.position.y += dY;
    SCREEN.panCamera(dX, dY);
  }
}

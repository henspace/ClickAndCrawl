/**
 * @file Basic sprite control
 *
 * @module utils/sprites/sprite
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
import { Position, Rectangle, Velocity } from '../geometry.js';
import { SpriteCanvasRenderer } from './spriteRenderers.js'; //eslint-disable-line no-unused-vars

/**
 * @typedef {function} SpriteClickHandler
 * @param {Sprite} target - the sprite that was clicked. This prevents the need
 * to use 'this' which may not be correct in the context.
 * @param {Point} relativePoint - the position in the Sprite relative to its top left corner
 * @param {Object} detail - extended event information.
 */

/**
 * Encapsulated sprite.
 */
export class Sprite {
  /** @type {Position}*/
  #position = new Position(0, 0, 0);
  /** @type {Velocity} */
  #velocity = new Velocity(0, 0, 0);
  /** @type {SpriteCanvasRenderer[]} */
  #renderer;
  /** @type {boolean} */
  #multiRenderers;
  /** @type {AbstractModifier} */
  modifier;
  /** @type {boolean} */
  visible;
  /** @type {number} */
  opacity;

  /**
   * @param {Object} options
   * @param {SpriteCanvasRenderer } options.renderer - the renderer or renderers that render the sprite
   * rather than the world.
   */
  constructor(options) {
    this.#renderer = options?.renderer;
    this.#multiRenderers = Array.isArray(this.#renderer);
    this.visible = true;
    this.opacity = 1;
  }
  /**
   * Get the current position.
   * @returns {Position}
   */
  get position() {
    return this.#position;
  }

  /**
   * Set the current position. Invalid values become 0.
   * @param {Position} nextPosition
   */
  set position(nextPosition) {
    this.#position.x = this.valueOrZero(nextPosition.x);
    this.#position.y = this.valueOrZero(nextPosition.y);
    this.#position.rotation = this.valueOrZero(nextPosition.rotation);
  }

  /**
   * Get the current motion.
   * @returns {Velocity}
   */

  get velocity() {
    return this.#velocity;
  }

  /**
   * Set the current Velocity. Invalid values become 0.
   * @param {Velocity} nextVelocity
   */
  set velocity(nextVelocity) {
    this.#velocity.x = this.valueOrZero(nextVelocity.x);
    this.#velocity.y = this.valueOrZero(nextVelocity.y);
    this.#velocity.rotation = this.valueOrZero(nextVelocity.rotation);
  }

  /**
   * Returns the value but converts non-numeric values to 0.
   * @param {number} value
   * @returns {number}
   */
  valueOrZero(value) {
    return typeof value === 'number' ? value : 0;
  }

  /**
   * Update the sprite. Calls the sprite's mover and then renderer.
   * @param {number} deltaSeconds - elapsed time.
   */
  update(deltaSeconds) {
    if (this.modifier) {
      this.modifier = this.modifier.update(this, deltaSeconds);
    }
    if (this.visible) {
      this.#render();
    }
  }
  /**
   * Render the sprite by calling the sprite's renderer
   */
  #render() {
    if (!this.#renderer) {
      return;
    }
    if (!this.#renderer.forEach) {
      this.#renderer.render(this.#position, this.opacity);
    } else {
      this.#renderer.forEach((renderer) =>
        renderer.render(this.#position, this.opacity)
      );
    }
  }

  /** Get the bounding box for the sprite.
   * @returns {geometry.Rectangle}
   */
  getBoundingBox() {
    const boundsCanvas = this.#renderer.getBoundingBoxCanvas();
    return new Rectangle(
      this.position.x - boundsCanvas.width / 2,
      this.position.y - boundsCanvas.height / 2,
      boundsCanvas.width,
      boundsCanvas.height
    );
  }
}

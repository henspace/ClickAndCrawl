/**
 * @file Limiter for sprites
 *
 * @module utils/sprites/limiters
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
import { AbstractModifier } from './modifiers.js';
import { clip } from '../maths.js';
import { Point } from '../geometry.js';

/**
 * Limit types.
 * @enum {number}
 */
export const LimitType = {
  /** sprite centre kept within the limits. */
  CENTRE: 0,
  /** sprite kept so at least partially visible */
  PARTIAL: 1,
  /** sprite keep completely within the limits */
  FULL: 2,
};
/**
 * Simple box limiter.
 */
export class BoxLimiter extends AbstractModifier {
  /** @type {Point} */
  #topLeft;
  /** @type {Point} */
  #bottomRight;
  /** @type {number} */
  #limitType;

  /**
   *
   * @param {import('../geometry.js').Rectangle} bounds
   * @param {number} limitType - should be a LimitType value.
   * @param {number} decoratedModifier
   */
  constructor(bounds, limitType, decoratedModifier) {
    super(decoratedModifier);
    this.#topLeft = new Point(bounds.x, bounds.y);
    this.#bottomRight = bounds.getBottomRight();
    this.#limitType = limitType;
  }

  /**
   * Update the sprite.
   * @param {import('./sprite.js').Sprite} sprite
   * @param {number} deltaSecondsUnused
   * @returns {AbstractModifier}
   */
  doUpdate(sprite, deltaSecondsUnused) {
    switch (this.#limitType) {
      case LimitType.PARTIAL:
        this.#constrainPartial(sprite);
        break;
      case LimitType.FULL:
        this.#constrainFull(sprite);
        break;
      case LimitType.CENTRE:
      default:
        this.#constrainCentre(sprite);
        break;
    }
    return this;
  }

  /**
   * Update the sprite constraining the centre to the bounds.
   * @param {import('./sprite.js').Sprite} sprite
   */
  #constrainCentre(sprite) {
    sprite.position.x = clip(
      sprite.position.x,
      this.#topLeft.x,
      this.#bottomRight.x
    );
    sprite.position.y = clip(
      sprite.position.y,
      this.#topLeft.y,
      this.#bottomRight.y
    );
  }

  /**
   * Update the sprite constraining so that is is always partially visible.
   * @param {import('./sprite.js').Sprite} sprite
   */
  #constrainPartial(sprite) {
    const spriteBox = sprite.getBoundingBox();
    sprite.position.x = clip(
      sprite.position.x,
      this.#topLeft.x - spriteBox.width / 2,
      this.#bottomRight.x + spriteBox.width / 2
    );
    sprite.position.y = clip(
      sprite.position.y,
      this.#topLeft.y - spriteBox.height / 2,
      this.#bottomRight.y + spriteBox.height / 2
    );
  }

  /**
   * Update the sprite constraining so that is is always fully visible.
   * @param {import('./sprite.js').Sprite} sprite
   */
  #constrainFull(sprite) {
    const spriteBox = sprite.getBoundingBox();
    sprite.position.x = clip(
      sprite.position.x,
      this.#topLeft.x + spriteBox.width / 2,
      this.#bottomRight.x - spriteBox.width / 2
    );
    sprite.position.y = clip(
      sprite.position.y,
      this.#topLeft.y + spriteBox.height / 2,
      this.#bottomRight.y - spriteBox.height / 2
    );
  }
}

/**
 * @file Faders which adjust opacity
 *
 * @module utils/sprites/faders
 *
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

import { AbstractModifier } from './modifiers.js';

/**
 * Sprite fader
 */
export class TimeFader extends AbstractModifier {
  #deltaOpacityPerSec;

  /**
   * Construct aligner. Rotations are worked out counter clockwise from the positive
   * x axis direction. However, sprites are normally drawn vertically as you look at them;
   * i.e they are pointing downwards or at -90 degrees from the horizontal axis. You can
   * set this using the baseDirection parameter.
   * @param {number} lifetimeSecs - default alignment.
   * @param {AbstractModifier} decoratedModifier
   */
  constructor(lifetimeSecs, decoratedModifier) {
    super(decoratedModifier);
    this.#deltaOpacityPerSec = 1 / Math.max(lifetimeSecs, 0.5);
  }

  /**
   * Adjust sprite opacity depending on time. When the time is complete, this
   * modify returns null to indicate completion.
   * @param {import('./sprite.js').Sprite} sprite
   * @param {number} deltaSeconds - elapsed time
   * @returns {AbstractModifier}
   */
  doUpdate(sprite, deltaSeconds) {
    sprite.opacity = Math.max(
      0,
      sprite.opacity - deltaSeconds * this.#deltaOpacityPerSec
    );
    return sprite.opacity > 0 ? this : null;
  }
}

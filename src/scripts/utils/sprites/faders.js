/**
 * @file Faders which adjust opacity
 *
 * @module utils/sprites/faders
 */
/**
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
  /** @type {number} */
  #deltaOpacityPerSec;
  /** @type {number} */
  #delaySecs;
  /** @type {number} */
  #elapsedSecs;
  /** @type {number} */
  #easeInDuration;

  /**
   * Create fader.
   * @param {number} delaySecs - Time delay before fading.
   * @param {number} lifetimeSecs - Fading duration.
   * @param {AbstractModifier} decoratedModifier
   */
  constructor(delaySecs, lifetimeSecs, decoratedModifier) {
    super(decoratedModifier);
    this.#delaySecs = delaySecs;
    this.#easeInDuration = 0.3 * lifetimeSecs;
    const fadeOutDuration = lifetimeSecs - this.#easeInDuration;
    this.#deltaOpacityPerSec = 1 / Math.max(fadeOutDuration, 0.5);
    this.#elapsedSecs = -1; // only start counting after first update.
  }

  /**
   * Adjust sprite opacity depending on time. When the time is complete, this
   * modify returns null to indicate completion.
   * @param {module:utils/sprites/sprite~Sprite} sprite
   * @param {number} deltaSeconds - elapsed time
   * @returns {AbstractModifier}
   */
  doUpdate(sprite, deltaSeconds) {
    if (this.#elapsedSecs < 0) {
      this.#elapsedSecs = 0; // only start on first update.
    } else {
      this.#elapsedSecs += deltaSeconds;
    }

    if (this.#elapsedSecs > this.#delaySecs + this.#easeInDuration) {
      sprite.opacity = Math.max(
        0,
        1 -
          (this.#elapsedSecs - this.#delaySecs - this.#easeInDuration) *
            this.#deltaOpacityPerSec
      );
    } else {
      sprite.opacity = 1;
    }
    return sprite.opacity > 0 ? this : null;
  }
}

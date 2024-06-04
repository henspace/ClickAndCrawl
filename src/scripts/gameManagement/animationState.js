/**
 * @file CLass to handle routines to improve power management
 *
 * @module gameManagement/powerManager
 */
/**
 * license {@link https://opensource.org/license/mit/|MIT}
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

import LOG from '../utils/logging.js';

/** Class to manage the main animation state. */
class AnimationState {
  /** Function to call when starting animation @type{function} */
  onStartAnimation;
  /** @type {boolean} */
  #animationState;

  /** Used by blur and focus events to restore state @type {boolean} */
  #savedAnimationState;

  /** Construct the animation state. */
  constructor() {
    this.#animationState = false;
    this.#savedAnimationState = undefined;

    window.addEventListener('blur', () => {
      LOG.debug(`Blur: current animation state ${this.#animationState}`);
      this.#savedAnimationState = this.#animationState;
      this.setAnimationState(false);
    });
    window.addEventListener('focus', () => {
      LOG.debug(`Focus: saved animation state ${this.#savedAnimationState}`);
      this.setAnimationState(this.#savedAnimationState ?? true);
      this.#savedAnimationState = undefined; // This is to allow for debugger issue where focus can fire without preceding blur.
    });
  }

  /**
   * Set the animation state.
   * @param {boolean} state
   */
  setAnimationState(state) {
    if (state !== this.#animationState) {
      this.#animationState = state;
      if (this.#animationState && this.onStartAnimation) {
        this.onStartAnimation();
      }
    }
  }

  /**
   * @returns {boolean}
   */
  isAnimationOn() {
    return this.#animationState;
  }
}

/** Singleton animation state */
const ANIMATION_STATE_MANAGER = new AnimationState();

export default ANIMATION_STATE_MANAGER;

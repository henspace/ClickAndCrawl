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
    this.#savedAnimationState = false;

    window.addEventListener('blur', () => {
      this.#savedAnimationState = this.#animationState;
      this.setAnimationState(false);
    });
    window.addEventListener('focus', () => {
      this.setAnimationState(this.#savedAnimationState ?? true);
    });
  }

  /**
   * Set the animation state.
   * @param {boolean} state
   */
  setAnimationState(state) {
    if (state !== this.#animationState) {
      this.#animationState = state;
      LOG.info(`Set animation state to ${this.#animationState}`);
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

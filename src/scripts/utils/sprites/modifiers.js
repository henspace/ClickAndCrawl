/**
 * @file Modifiers for updates
 *
 * @module utils/sprites/modifiers
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

import LOG from '../logging.js';

/** Default timeout for transient modifiers. @type {number} */
const DEFAULT_TIMEOUT_SECS = 10;

/**
 * Base for all modifiers
 */
export class AbstractModifier {
  /** @type {AbstractModifier} */
  decoratedModifier;
  /** The resolve function for transient modifiers @type {function(*)} */
  #resolveFunc;
  /** Total active time in seconds */
  #activeSeconds;
  /** Timeout duration */
  #timeoutSeconds;

  /**
   *
   * @param {AbstractModifier} [decoratedModifier]
   */
  constructor(decoratedModifier) {
    this.#activeSeconds = 0;
    this.#timeoutSeconds = 0;
    this.decoratedModifier = decoratedModifier;
  }

  /**
   * Resolve any pending promise.
   * @param {*} fulfilValue
   */
  #resolve(fulfilValue) {
    if (this.#resolveFunc) {
      this.#resolveFunc(fulfilValue);
      this.#resolveFunc = null;
    }
  }

  /**
   * Kill this modifier. Resolves any pending promises.
   */
  kill() {
    this.#resolve();
  }

  /**
   * Apply the modifier as transient to a sprite.
   * @param {AbstractModifier} modifier
   * @param {Sprite} sprite
   * @param {number} [timeoutSeconds = DEFAULT_TIMEOUT_SECS]
   * @returns {Promise} fulfils to null on completion;
   */
  applyAsTransientToSprite(sprite, timeoutSeconds = DEFAULT_TIMEOUT_SECS) {
    this.#timeoutSeconds = timeoutSeconds;
    return new Promise((resolve) => {
      this.#resolveFunc = resolve;
      sprite.replaceTransientModifier(this);
    });
  }

  /**
   * Apply the modifier as continuous to a sprite.
   * @param {Sprite} sprite
   */
  applyAsContinuousToSprite(sprite) {
    sprite.replaceBaseModifier(this);
  }

  /** Do the update modification. If a decoratedModifier has been set, this is then
   * called. If after calling update, the modifier is removed, it is removed from
   * the owning decoratedModifier. Its children are retained.
   * @param {Sprite} sprite
   * @param {number} deltaSeconds - elapsed time since last update.
   * @returns {AbstractModifier} - the modifier required for the next update. This
   * normally returns itself. If null is return, this indicates that the modifier
   * has completed its action and can be removed from the chain of decorated
   * modifiers. This method handles removal of its own decoratedModifier, but removal
   * of the root, if appropriate, is the responsibility of the Sprite.
   */
  update(sprite, deltaSeconds) {
    if (this.#resolveFunc) {
      this.#activeSeconds += deltaSeconds;
    }
    if (this.decoratedModifier) {
      this.decoratedModifier = this.decoratedModifier?.update(
        sprite,
        deltaSeconds
      );
    }

    const nextModifier = this.doUpdate(sprite, deltaSeconds);
    if (!nextModifier || this.#activeSeconds > this.#timeoutSeconds) {
      this.#resolve(null);
      return null;
    }
    return nextModifier;
  }

  /** Do the update modification for this modifier.
   * @param {Sprite} sprite
   * @param {number} deltaSeconds - elapsed time since last update.
   * @returns {AbstractModifier} - the modifier for the next update.
   */
  doUpdate(spriteUnused, deltaSecondsUnused) {
    LOG.error('doUpdate should be overridden.');
    return this;
  }
}

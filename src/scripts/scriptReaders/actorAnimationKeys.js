/**
 * @file Standard animation keys.
 *
 * @module scriptReaders/actorAnimationKeys
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

import { LoopMethod } from '../utils/arrays/indexer.js';
import { AnimatedImage } from '../utils/sprites/animation.js';

/**
 * @typedef {Object} AnimationDefinition
 * @property {string} keyName - animation key name.
 * @property {string} suffix - appended to the image name for this animation
 * @property {Object} options - passed to AnimatedImage constructor
 */
/**
 * @typedef {Object<string, AnimationDefinition>} AnimationDefinitions
 */
/**
 * Standard animation definitions for an actor.
 * It is assumed that animation images are formed from a root name.
 * @type {AnimationDefinitions}
 */
const PeripateticAnimationDefns = {
  DEAD: {
    keyName: 'DEAD',
    suffix: 'dead',
    options: {
      framePeriodMs: 100,
      loopMethod: LoopMethod.STOP,
    },
  },
  IDLE: {
    keyName: 'IDLE',
    suffix: 'idle',
    options: {
      framePeriodMs: 300,
      loopMethod: LoopMethod.REVERSE,
    },
  },
  WALK_NORTH: {
    keyName: 'WALK_N',
    suffix: 'walk-n',
    options: {
      framePeriodMs: 100,
      loopMethod: LoopMethod.REVERSE,
    },
  },
  WALK_EAST: {
    keyName: 'WALK_E',
    suffix: 'walk-e',
    options: {
      framePeriodMs: 100,
      loopMethod: LoopMethod.REVERSE,
    },
  },
  WALK_SOUTH: {
    keyName: 'WALK_S',
    suffix: 'walk-s',
    options: {
      framePeriodMs: 100,
      loopMethod: LoopMethod.REVERSE,
    },
  },
  WALK_WEST: {
    keyName: 'WALK_W',
    suffix: 'walk-w',
    options: {
      framePeriodMs: 100,
      loopMethod: LoopMethod.REVERSE,
    },
  },
};

/**
 * Standard animation definitions for an actor holding an artefact.
 * It is assumed that animation images are formed from a root name
 */
const ArtefactHolderAnimationDefns = {
  DEAD: {
    keyName: 'DEAD',
    suffix: 'dead',
    options: {
      framePeriodMs: 100,
      loopMethod: LoopMethod.STOP,
    },
  },
  IDLE: {
    keyName: 'IDLE',
    suffix: 'idle',
    options: {
      framePeriodMs: 300,
      loopMethod: LoopMethod.REVERSE,
    },
  },
};

/**
 *
 */
class AnimationKeys {
  /** @type {AnimationDefinitions} */
  #definitions;
  /**
   * @param {AnimationDefinitions[]} definitions
   */
  constructor(definitions) {
    this.#definitions = definitions;
  }
  /**
   * Form the frame name for an image
   * @param {string} key - the key name for the animation.
   * @param {string} imageName
   */
  #formFrameNameRoot(key, imageName) {
    const suffix = this.#definitions[key]?.suffix;
    if (!suffix) {
      throw new Error(
        `Attempt made to use invalid standard animation key of '${key}'`
      );
    }
    return `${imageName}-${suffix}`;
  }

  /**
   * Get the key name.
   * @param {string} key
   * @return {string}
   */
  getKeyName(key) {
    return this.#definitions[key].keyName;
  }

  /**
   * Get default image name. This is the first frame of IDLE.
   * @returns {string} root
   */
  getDefaultImageName(root) {
    return `${this.#formFrameNameRoot('IDLE', root)}00.png`;
  }

  /**
   * Get the fallback key
   * @returns {string}
   */
  getFallbackKey() {
    return this.getKeyName('IDLE');
  }
  /**
   * Add all animations to the keyed animation.
   * @param {KeyedAnimatedImages} keyedAnimations
   * @param {string} imageName - root name for the animation image.
   */
  addAllToKeyedAnimation(keyedAnimations, imageName) {
    for (const key in this.#definitions) {
      const anim = this.#definitions[key];
      keyedAnimations.addAnimatedImage(
        this.#definitions[key].keyName,
        new AnimatedImage(
          {
            prefix: this.#formFrameNameRoot(key, imageName),
            suffix: '.png',
            startIndex: 0,
            padding: 2,
          },
          anim.options
        )
      );
    }
    keyedAnimations.setCurrentKey(this.#definitions.IDLE.keyName);
  }
}

/** Object to access standard animations. */
const StdAnimations = {
  peripatetic: new AnimationKeys(PeripateticAnimationDefns),
  artefact: new AnimationKeys(ArtefactHolderAnimationDefns),
};

export default StdAnimations;

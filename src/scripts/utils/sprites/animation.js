/**
 * @file Animation support
 *
 * @module utils/sprites/animation
 *
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

import IMAGE_MANAGER from './imageManager.js';
import GAME_CLOCK from '../time/clock.js';
import { Indexer } from '../arrays/indexer.js';
import LOG from '../logging.js';
import * as maths from '../maths.js';

/**
 * Collection of SpriteBitmap objects
 */
export class AnimatedImage {
  /** @type {boolean} */
  playing;
  /** @type {import('./imageManager.js').SpriteBitmap[]} */
  #frames;
  /** @type {Indexer} */
  #indexer;
  /** @type {number} */
  #lastFrameCount;
  /** offset used to randomise animations. @type {number} */
  #timeOffset;

  /** Period in ms for frame animations @type {number}*/
  #framePeriodMs;
  /**
   * Construct animation.
   * @param {number} textureIndex
   * @param {Object | string} filenamePattern - if a string is parsed then the image is a single frame.
   * @param {string} filenamePattern.prefix
   * @param {number} filenamePattern.startIndex - starting index.
   * @param {number} filePattern.padding - index is padded with leading zeros to padding length
   * @param {string} filenamePattern.suffix
   * @param {Object} options
   * @param {number} options.framePeriodMs - period in ms for frame animations.
   * @param {LoopMethod} options.loopMethod - method of looping animation.
   */
  constructor(textureIndex, filenamePattern, options) {
    this.#frames = [];
    this.#lastFrameCount = 0;
    this.#timeOffset = maths.getRandomInt(0, 1000);
    if (typeof filenamePattern === 'string') {
      this.#frames.push(
        IMAGE_MANAGER.getSpriteBitmap(textureIndex, filenamePattern)
      );
      return;
    }

    this.#framePeriodMs = Math.max(1, options.framePeriodMs);

    let index = filenamePattern.startIndex ?? 0;
    let padding = filenamePattern.padding ?? 0;
    let textureFrame;
    do {
      const fileName = `${filenamePattern.prefix}${index
        .toString()
        .padStart(padding, '0')}${filenamePattern.suffix}`;
      textureFrame = IMAGE_MANAGER.getSpriteBitmap(textureIndex, fileName); // imageManager.getFrame(textureIndex, fileName);
      if (textureFrame) {
        this.#frames.push(textureFrame);
      }
      index++;
    } while (textureFrame);
    this.#indexer = new Indexer(this.#frames.length, options.loopMethod);
    this.playing = true;
  }

  /**
   * Get current frame
   * @returns {import('./imageManager.js').SpriteBitmap}
   */
  getCurrentFrame() {
    if (this.#frames.length > 1) {
      if (this.playing) {
        const frameCount = GAME_CLOCK.getFrameCount(
          this.#framePeriodMs,
          this.#timeOffset
        );
        if (frameCount !== this.#lastFrameCount) {
          this.#indexer.advanceBy(frameCount - this.#lastFrameCount);
          this.#lastFrameCount = frameCount;
        }
      }
      return this.#frames[this.#indexer.index];
    } else {
      return this.#frames[0];
    }
  }

  /**
   * Manual movement of frames. Note this automatically switches off playing.
   * @param {number} index - frame index. This will be clipped to the ends of the
   * array.
   */

  setCurrentIndex(index) {
    if (this.#frames.length > 1) {
      this.playing = false;
      this.#indexer.index = index;
    }
  }

  /**
   * Get the current index.
   * @returns {number}
   */
  getCurrentIndex() {
    if (this.#frames.length > 1) {
      return this.#indexer.index;
    } else {
      return 0;
    }
  }
}

/**
 * Create keyed animated images.
 */
export class KeyedAnimatedImages {
  /** @type {Object.<string, AnimatedImage>} */
  #animatedImages;
  /** @type {string} */
  #currentImage;

  /**
   * Create the keyed animated image
   * @param {string} key
   * @param {AnimatedImage} animatedImage
   */
  constructor(key, animatedImage) {
    this.#animatedImages = {};
    this.#animatedImages[key] = animatedImage;
    this.#currentImage = animatedImage;
  }

  /**
   * Get the current image.
   */
  get image() {
    return this.#currentImage;
  }
  /**
   * Add image to available images.
   * @param {string} key
   * @param {AnimatedImage} animatedImage
   */

  addAnimatedImage(key, animatedImage) {
    this.#animatedImages[key] = animatedImage;
  }

  /**
   * Set the current animation key. Ignored if it does not exist.
   * @param {string} key
   */
  setCurrentKey(key) {
    //eslint-disable-next-line no-prototype-builtins
    if (this.#animatedImages.hasOwnProperty(key)) {
      this.#currentImage = this.#animatedImages[key];
    } else {
      LOG.error(`Attempt to set current key to nonexistent value of ${key}`);
    }
  }

  /**
   * Get current frame
   * @returns {import('./imageManager.js').SpriteBitmap}
   */
  getCurrentFrame() {
    return this.#currentImage.getCurrentFrame();
  }
}

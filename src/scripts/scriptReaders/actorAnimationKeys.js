/**
 * @file Standard animation keys.
 *
 * @module scriptReaders\actorAnimationKeys
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
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

import LOG from '../utils/logging.js';
import { LoopMethod } from '../utils/arrays/indexer.js';

/**
 * Standard animation defintions for an actor.
 * It is assumed that animation images are formed from a root nam
 */
const AnimationDefns = {
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
 * Form the frame name for an image
 * @param {string} key - the key name for the animation.
 * @param {string} imageName
 */
function formFrameNameRoot(key, imageName) {
  const suffix = AnimationDefns[key]?.suffix;
  if (!suffix) {
    throw new Error(
      `Attempt made to use invalid standard animation key of '${key}'`
    );
  }
  return `${imageName}-${suffix}`;
}

/** Object to access standard animations. */
const StdAnimations = {
  definitions: AnimationDefns,
  formFrameNameRoot: formFrameNameRoot,
};

export default StdAnimations;

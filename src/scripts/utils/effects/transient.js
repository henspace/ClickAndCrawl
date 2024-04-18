/**
 * @file Create transient effects.
 *
 * @module utils/effects/transient
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

import { Sprite } from '../sprites/sprite.js';
import {
  ImageSpriteCanvasRenderer,
  TextSpriteCanvasRenderer,
} from '../sprites/spriteRenderers.js';
import SCREEN from '../game/screen.js';
import { TimeFader } from '../sprites/faders.js';
import WORLD from '../game/world.js';
import { VelocityMover } from '../sprites/movers.js';
import { AnimatedImage } from '../sprites/animation.js';
import { LoopMethod } from '../arrays/indexer.js';
import { Acceleration, Velocity, Point } from '../geometry.js';

/**
 * Create a transient sprite
 * @param {module:utils/sprites/spriteRenderers~SpriteCanvasRenderer} renderer
 * @param {Object} options
 * @param {Point} options.position
 * @param {Velocity} options.velocity
 * @param {number} options.delaySecs
 * @param {number} options.lifetimeSecs
 */
function createFadingSprite(renderer, options) {
  const sprite = new Sprite({
    renderer: renderer,
  });
  sprite.position = options.position;
  sprite.velocity = options.velocity ?? new Velocity(0, 0, 0);
  sprite.acceleration = options.acceleration ?? new Acceleration(0, 0, 0);
  WORLD.addPassiveSprite(sprite);
  new TimeFader(options.delaySecs, options.lifetimeSecs, new VelocityMover())
    .applyAsTransientToSprite(sprite, 20)
    .then(() => WORLD.removePassiveSprite(sprite));
}

/**
 * Create a transient image
 * @param {module:utils/sprites/imageManager~SpriteBitmap} imageName
 * @param {Object} options
 * @param {Point} options.position
 * @param {Velocity} options.velocity
 * @param {Acceleration} options.acceleration
 * @param {number} options.delaySecs
 * @param {number} options.lifetimeSecs
 */
export function addFadingImage(image, options) {
  createFadingSprite(
    new ImageSpriteCanvasRenderer(SCREEN.getContext2D(), image),
    options
  );
}

/**
 * Create a transient Animated image. Images are assumed to be of the form
 * imageRootName00.png, imageRootName01.png etc.
 * @param {module:utils/sprites/imageManager~SpriteBitmap} imageRootName - no extension. png will be used.
 * @param {Object} options
 * @param {Point} options.position
 * @param {Velocity} options.velocity
 * @param {Acceleration} options.acceleration
 * @param {number} options.delaySecs
 * @param {number} options.lifetimeSecs
 */
export function addFadingAnimatedImage(imageRootName, options) {
  const image = new AnimatedImage(
    {
      prefix: imageRootName,
      suffix: '.png',
      startIndex: 0,
      padding: 2,
    },
    { framePeriodMs: 300, loopMethod: LoopMethod.REVERSE }
  );
  createFadingSprite(
    new ImageSpriteCanvasRenderer(SCREEN.getContext2D(), image),
    options
  );
}

/**
 * Create transient text
 * @param {string} text
 * @param {Object} options
 * @param {string} options.color
 * @param {Point} options.position
 * @param {Velocity} options.velocity
 * @param {Acceleration} options.acceleration
 * @param {number} options.delaySecs
 * @param {number} options.lifetimeSecs
 */
export function addFadingText(text, options) {
  createFadingSprite(
    new TextSpriteCanvasRenderer(SCREEN.getContext2D(), text, {
      color: options.color,
    }),
    options
  );
}

/**
 * Display rising text that fades.
 * @param {string} text
 * @param {module:utils/geometry~Position} position
 * @param {string} [color = 'white']
 */
export function displayRisingText(text, position, color = 'white') {
  addFadingText(text, {
    color: color,
    delaySecs: 2,
    lifetimeSecs: 3,
    position: new Point(position.x, position.y),
    velocity: new Velocity(0, -48, 0),
    acceleration: new Acceleration(0, -96, 0),
  });
}

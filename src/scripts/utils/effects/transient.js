/**
 * @file Create transient effects.
 *
 * @module utils/effects/transient
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

import { Sprite } from '../sprites/sprite.js';
import {
  ImageSpriteCanvasRenderer,
  SpriteCanvasRenderer,
  TextSpriteCanvasRenderer,
} from '../sprites/spriteRenderers.js';
import SCREEN from '../game/screen.js';
import { TimeFader } from '../sprites/faders.js';
import WORLD from '../game/world.js';
import { VelocityMover } from '../sprites/movers.js';

/**
 * Create a transient sprite
 * @param {SpriteCanvasRenderer} renderer
 * @param {Object} options
 * @param {Point} position
 * @param {Velocity} velocity
 * @param {number} lifetimeSecs
 */
export function createFadingSprite(renderer, options) {
  const sprite = new Sprite({
    renderer: renderer,
  });
  sprite.position = options.position;
  sprite.velocity = options.velocity;
  WORLD.addPassiveSprite(sprite);
  new TimeFader(options.lifetimeSecs, new VelocityMover())
    .applyAsTransientToSprite(sprite, 20)
    .then(() => WORLD.removePassiveSprite(sprite));
}

/**
 * Create a transient image
 * @param {import('../sprites/imageManager.js').SpriteBitmap} imageName
 * @param {Object} options
 * @param {Point} position
 * @param {Velocity} velocity
 * @param {number} lifetimeSecs
 */
export function addFadingImage(image, options) {
  createFadingSprite(
    new ImageSpriteCanvasRenderer(SCREEN.getContext2D(), image),
    options
  );
}

/**
 * Create transient text
 * @param {string} text
 * @param {Object} options
 * @param {Point} position
 * @param {Velocity} velocity
 * @param {number} lifetimeSecs
 */
export function addFadingText(text, options) {
  createFadingSprite(
    new TextSpriteCanvasRenderer(SCREEN.getContext2D(), text),
    options
  );
}

/**
 * @file Map of names to actor factories in the dungeon.
 *
 * @module scriptReaders/actorMap
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

import { Sprite } from '../utils/sprites/sprite.js';
import { Actor } from '../utils/game/actors.js';
import * as spriteRenderers from '../utils/sprites/spriteRenderers.js';
import IMAGE_MANAGER from '../utils/sprites/imageManager.js';
import * as animation from '../utils/sprites/animation.js';
import { LoopMethod } from '../utils/arrays/indexer.js';
import { Position } from '../utils/geometry.js';
import SCREEN from '../utils/game/screen.js';
import WORLD from '../utils/game/world.js';

/**
 * Create the actor.
 * @param {string} imageName - no extension
 * @returns {Actor}
 */
function createAnimatedActor(imageName) {
  const imageRenderer = new spriteRenderers.ImageSpriteCanvasRenderer(
    SCREEN.getContext2D(),
    new animation.KeyedAnimatedImages(
      'idle',
      new animation.AnimatedImage(
        0,
        {
          prefix: imageName,
          suffix: '.png',
          startIndex: 1,
          padding: 3,
        },
        {
          framePeriodMs: 100,
          loopMethod: LoopMethod.REVERSE,
        }
      )
    )
  );

  const gaugeRenderer = new spriteRenderers.MultiGaugeTileRenderer(
    SCREEN.getContext2D(),
    {
      tileSize: WORLD.getTileMap().getGridSize() - 2,
      fillStyles: ['red', 'blue'],
      strokeStyles: [],
    }
  );
  gaugeRenderer.setLevel(0, 0.5);
  gaugeRenderer.setLevel(1, 0.75);
  const heroActor = new Actor(
    new Sprite({
      renderer: [gaugeRenderer, imageRenderer],
    })
  );
  heroActor.position = new Position(48, 48, 0);
  heroActor.velocity = { x: -500, y: -70, rotation: 0.1 };
  return heroActor;
}

/**
 * @param {string} imageName - without extension
 * @returns {Actor}
 */
function createUnanimatedActor(imageName) {
  const actor = new Actor(
    new Sprite({
      renderer: new spriteRenderers.ImageSpriteCanvasRenderer(
        SCREEN.getContext2D(),
        IMAGE_MANAGER.getSpriteBitmap(0, `${imageName}.png`)
      ),
    })
  );
  return actor;
}

/**
 * @typedef {Object} ActorMapCreator
 * @property {function():Actor} create
 */
/**
 * Map of actor creators which are used to create actors based on a key.
 * @type {Map<string, ActorMapCreator>}
 */

const ACTOR_MAP = new Map([
  ['HERO', { create: () => createAnimatedActor('hero') }],
  ['MONSTER', { create: () => createAnimatedActor('orc') }],
]);

export default ACTOR_MAP;

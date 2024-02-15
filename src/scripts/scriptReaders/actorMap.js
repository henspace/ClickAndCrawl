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
import { Position } from '../utils/geometry.js';
import SCREEN from '../utils/game/screen.js';
import WORLD from '../utils/game/world.js';
import { Colours } from '../constants/colours.js';
import { Fight, Trade } from '../dnd/interact.js';
import StdAnimations from './actorAnimationKeys.js';
import * as maths from '../utils/maths.js';

/**
 * Specialist traits renderer
 */
class ActorTraitsRenderer extends spriteRenderers.MultiGaugeTileRenderer {
  /** @type {Actor} */
  actor;
  /**
   * The number of gauges is determined by the maximum length of the fill styles and
   * stroke styles
   * @param {CanvasRenderingContext2D} context
   * @param {Object} options
   * @param {number} options.tileSize
   * @param {string[]} options.fillStyles
   * @param {string[]} options.strokeStyles
   */
  constructor(context, options) {
    super(context, options);
  }
  /**
   * Render the sprite.
   * @param {import('../geometry.js').Position} position - this will have been adjusted to the screen.
   */
  render(position) {
    if (this.actor && this.actor.traits) {
      const hp = this.actor.traits.get('HP');
      const hpMax = this.actor.traits.get('HP_MAX');
      this.setLevel(0, hp / hpMax);
      this.setLevel(1, 1);
    }
    super.render(position);
  }
}

/**
 * Animation that automatically adjusts the animation based on the actor's velocity
 * and alive property.
 */
class ActorStateAnimator extends animation.KeyedAnimatedImages {
  /** @type {Actor} */
  #actor;

  /** Number from eight point compass. */
  #compassDir;

  /** @type{boolean}*/
  #aliveStatus;

  /**
   * Create the keyed animated image
   * @param {string} key
   * @param {AnimatedImage} animatedImage
   */
  constructor(key, animatedImage) {
    super(key, animatedImage);
    this.#compassDir = maths.CompassEightPoint.NONE;
  }

  /**
   * Set the actor who's velocity will be monitored.
   * @param {Actor} actor
   */
  setActor(actor) {
    this.#actor = actor;
    this.#aliveStatus = this.#actor.alive;
  }

  /** override */
  getCurrentFrame() {
    const dir = this.#getCurrentDirection();
    if (dir !== this.#compassDir || this.#aliveStatus != this.#actor?.alive) {
      this.#compassDir = dir;
      this.#aliveStatus = this.#actor?.alive;
      this.#setAnimationForState();
    }
    return super.getCurrentFrame();
  }

  #getCurrentDirection() {
    if (!this.#actor || this.#actor.velocity.isZero(0.1)) {
      return maths.CompassEightPoint.NONE;
    } else {
      const dir = this.#actor.velocity.getScreenDirection();
      return maths.angleToFourPointCompass(dir);
    }
  }

  /**
   * Set the appropriate animation based on the the current compass direction.
   * Only four points supported.
   */
  #setAnimationForState() {
    if (!this.#actor.alive) {
      return this.setCurrentKey(StdAnimations.definitions.DEAD.keyName);
    }
    switch (this.#compassDir) {
      case maths.CompassEightPoint.NONE:
        this.setCurrentKey(StdAnimations.definitions.IDLE.keyName);
        break;
      case maths.CompassEightPoint.E:
        this.setCurrentKey(StdAnimations.definitions.WALK_EAST.keyName);
        break;
      case maths.CompassEightPoint.N:
      case maths.CompassEightPoint.NW:
      case maths.CompassEightPoint.NE:
        this.setCurrentKey(StdAnimations.definitions.WALK_NORTH.keyName);
        break;
      case maths.CompassEightPoint.W:
        this.setCurrentKey(StdAnimations.definitions.WALK_WEST.keyName);
        break;
      default:
        this.setCurrentKey(StdAnimations.definitions.WALK_SOUTH.keyName);
        break;
    }
  }
}

/**
 * Create set of standard animations.
 * @returns {animation.KeyedAnimatedImages}
 */
function createStandardKeyFrames(imageName) {
  const keyedAnimations = new ActorStateAnimator(
    'still',
    new animation.AnimatedImage(0, `${imageName}.png`)
  );

  for (const key in StdAnimations.definitions) {
    const anim = StdAnimations.definitions[key];
    keyedAnimations.addAnimatedImage(
      StdAnimations.definitions[key].keyName,
      new animation.AnimatedImage(
        0,
        {
          prefix: StdAnimations.formFrameNameRoot(key, imageName),
          suffix: '.png',
          startIndex: 0,
          padding: 2,
        },
        anim.options
      )
    );
  }
  keyedAnimations.setCurrentKey(StdAnimations.definitions.IDLE.keyName);
  return keyedAnimations;
}
/**
 * Create the actor.
 * @param {string} imageName - no extension
 * @returns {Actor}
 */
function createAnimatedActor(imageName) {
  const keyedAnimation = createStandardKeyFrames(imageName);
  const imageRenderer = new spriteRenderers.ImageSpriteCanvasRenderer(
    SCREEN.getContext2D(),
    keyedAnimation
  );

  const traitsRenderer = new ActorTraitsRenderer(SCREEN.getContext2D(), {
    tileSize: WORLD.getTileMap().getGridSize() - 2,
    fillStyles: [Colours.HP_GAUGE, Colours.MORALE_GAUGE],
    strokeStyles: [],
  });
  const actor = new Actor(
    new Sprite({
      renderer: [traitsRenderer, imageRenderer],
    })
  );
  keyedAnimation.setActor(actor);
  traitsRenderer.actor = actor;
  actor.position = new Position(48, 48, 0);
  actor.velocity = { x: 0, y: 0, rotation: 0.1 };
  return actor;
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
 * Create animated fighter
 * @param {string} imageName - without extension
 * @returns {Actor}
 */
function createAnimatedFighter(imageName) {
  const actor = createAnimatedActor(imageName);
  actor.interaction = new Fight(actor);
  return actor;
}

/**
 * Create animated trader
 * @param {string} imageName - without extension
 * @returns {Actor}
 */
function createAnimatedTrader(imageName) {
  const actor = createAnimatedActor(imageName);
  actor.interaction = new Trade(actor);
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
  ['MONSTER', { create: () => createAnimatedFighter('orc') }],
  ['TRADER', { create: () => createAnimatedTrader('trader') }],
]);

export default ACTOR_MAP;

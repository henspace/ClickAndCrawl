/**
 * @file Movers for sprites
 *
 * @module utils/sprites/movers
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
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

import { AbstractModifier } from './modifiers.js';

/**
 * Velocity aligner
 */
export class VelocityAligner extends AbstractModifier {
  /** @type {number} */
  #baseDirection;

  /**
   * Construct aligner. Rotations are worked out counter clockwise from the positive
   * x axis direction. However, sprites are normally drawn vertically as you look at them;
   * i.e they are pointing downwards or at -90 degrees from the horizontal axis. You can
   * set this using the baseDirection parameter.
   * @param {number} baseDirection - default alignment.
   * @param {AbstractModifier} decoratedModifier
   */
  constructor(baseDirection = -Math.PI / 2, decoratedModifier) {
    super(decoratedModifier);
    this.#baseDirection = baseDirection;
  }

  /**
   * Create a VelocityAligner. This is a convenience factory method that automatically
   * sets the base direction to -90 degrees which is how sprites are normally drawn; i.e. upright
   * instead of horizontally.
   * @param {AbstractModifier} decoratedModifier
   * @returns {VelocityAligner}
   */
  static createUprightAligner(decoratedModifier) {
    return new VelocityAligner(-Math.PI / 2, decoratedModifier);
  }

  /**
   * Align sprite using its velocity.
   * @param {import('./sprite.js').Sprite} sprite
   * @param {number} deltaSeconds - elapsed time
   * @returns {AbstractModifier}
   */
  doUpdate(sprite, deltaSecondsIgnored) {
    sprite.position.rotation =
      sprite.velocity.getDirection() - this.#baseDirection;
    return this;
  }
}
/**
 * Bouncer mover
 */
export class Bouncer extends AbstractModifier {
  /** @type {import('../geometry.js').Point} */
  #topLeft;
  /** @type {import('../geometry.js').Point} */
  #bottomRight;

  /**
   * @param {import('../geometry.js').Rectangle} bounds
   * @param {AbstractModifier} decoratedModifier
   */
  constructor(bounds, decoratedModifier) {
    super(decoratedModifier);
    this.#topLeft = bounds.getTopLeft();
    this.#bottomRight = bounds.getBottomRight();
  }

  /**
   * Move sprite using its velocity and bouncing on screen.
   * @param {import('./sprite.js').Sprite} sprite
   * @param {number} deltaSeconds - elapsed time
   * @returns {AbstractModifier}
   */
  doUpdate(sprite, deltaSeconds) {
    const position = sprite.position;
    const velocity = sprite.velocity;

    position.x += velocity.x * deltaSeconds;
    position.y += velocity.y * deltaSeconds;
    position.rotation += velocity.rotation * deltaSeconds;
    if (position.x < this.#topLeft.x || position.x > this.#bottomRight.x) {
      velocity.x *= -1;
    }
    if (position.y < this.#topLeft.y || position.y > this.#bottomRight.y) {
      velocity.y *= -1;
    }

    sprite.position = position;
    sprite.velocity = velocity;
    return this;
  }
}

/**
 * Tracker mover.
 */
export class Tracker extends AbstractModifier {
  /** @type {import('./sprite.js').Sprite} */
  #prey;
  /** @type {number} */
  #maxSeparation;
  /** @type {number} */
  #speed;

  /**
   *
   * @param {Object} options
   * @param {import('./sprite.js').Sprite} options.prey
   * @param {number} options.maxSeparation - allowable distance between hunter and prey
   * @param {number} options.speed - pixels / second
   * @param {AbstractModifier} decoratedModifier
   */
  constructor(options, decoratedModifier) {
    super(decoratedModifier);
    this.#prey = options.prey;
    this.#maxSeparation = options.maxSeparation;
    this.#speed = options.speed;
  }

  /**
   * Update the sprite to track the hunter.
   * @param {import('./sprite.js').Sprite} hunter
   * @param {*} deltaSeconds
   * @returns {AbstractModifier}
   */
  doUpdate(hunter, deltaSeconds) {
    const preyPos = this.#prey.position;
    const hunterPos = hunter.position;
    if (!hunterPos.withinSquare(preyPos, this.#maxSeparation)) {
      const angle = hunterPos.getAngleTo(preyPos);
      hunter.velocity.x = this.#speed * Math.cos(angle);
      hunter.velocity.y = this.#speed * Math.sin(angle);
      const dx = hunter.velocity.x * deltaSeconds;
      const dy = hunter.velocity.y * deltaSeconds;
      hunter.position.x += this.getMinMove(dx, preyPos.x, hunterPos.x);
      hunter.position.y += this.getMinMove(dy, preyPos.y, hunterPos.y);
    }
    return this;
  }

  /**
   * Get the minimum movement to go from targetValue to currentValue.
   * @param {number} maxMovement - maximum movement. NB. In this context, max ignores sign.
   * @param {number} targetValue
   * @param {number} currentValue
   */
  getMinMove(maxMovement, targetValue, currentValue) {
    const requiredMovement = targetValue - currentValue;
    if (Math.sign(maxMovement) < 0) {
      return Math.max(maxMovement, requiredMovement);
    } else {
      return Math.min(maxMovement, requiredMovement);
    }
  }
}

/**
 * PathFollower. Provides a one-off movement.
 * Once it hits its target, it removes itself from the chain.
 */
export class PathFollower extends AbstractModifier {
  /** @type {Point[]} */
  #path;
  /** @type {number} */
  #index;
  /** @type {import('../geometry.js').Point} */
  #targetPoint;
  /** @type {number} */
  #speed;

  /**
   *
   * @param {Object} options
   * @param {Point[]} options.path
   * @param {number} options.speed - pixels / second
   * @param {AbstractModifier} decoratedModifier
   */
  constructor(options, decoratedModifier) {
    super(decoratedModifier);
    this.#path = options.path;
    this.#index = 0;
    this.#targetPoint = options.path[0];
    this.#speed = options.speed;
  }

  /**
   * Update the sprite to track the hunter.
   * @param {import('./sprite.js').Sprite} subject
   * @param {*} deltaSeconds
   * @returns {AbstractModifier}
   */
  doUpdate(subject, deltaSeconds) {
    const subjectPos = subject.position;

    const angle = subjectPos.getAngleTo(this.#targetPoint);
    subject.velocity.x = this.#speed * Math.cos(angle);
    subject.velocity.y = this.#speed * Math.sin(angle);
    const dx = subject.velocity.x * deltaSeconds;
    const dy = subject.velocity.y * deltaSeconds;
    subjectPos.x += this.getMinMove(dx, this.#targetPoint.x, subjectPos.x);
    subjectPos.y += this.getMinMove(dy, this.#targetPoint.y, subjectPos.y);
    if (subjectPos.isCoincident(this.#targetPoint)) {
      if (++this.#index >= this.#path.length) {
        return this.decoratedModifier; // Remove itself from chain
      } else {
        this.#targetPoint = this.#path[this.#index];
      }
    }
    return this;
  }

  /**
   * Get the minimum movement to go from targetValue to currentValue.
   * @param {number} maxMovement - maximum movement. NB. In this context, max ignores sign.
   * @param {number} targetValue
   * @param {number} currentValue
   */
  getMinMove(maxMovement, targetValue, currentValue) {
    const requiredMovement = targetValue - currentValue;
    if (Math.sign(maxMovement) < 0) {
      return Math.max(maxMovement, requiredMovement);
    } else {
      return Math.min(maxMovement, requiredMovement);
    }
  }
}

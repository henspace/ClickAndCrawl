/**
 * @file Functions for dealing with geometry
 *
 * @module utils/geometry
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

import * as maths from './maths.js';

/**
 * Simple 2D dimension
 * @typedef {Object} Dims2D
 * @property {number} width
 * @property {number} height
 */

/**
 * Simple encapsulation of a Point
 */
export class Point {
  /** @type {number}*/
  x;
  /** @type {number}*/
  y;

  /**
   * Create point
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Create a copy of a point.
   * @param {Point} point
   * @returns {Point}
   */
  static copy(point) {
    return new Point(point.x, point.y);
  }

  /**
   * Check if points are coincident.
   * @returns {boolean}
   */
  coincident(point) {
    return this.x === point.x && this.y === point.y;
  }

  /**
   * Get angle to target using normal cartesian coordinates; i.e up is +ve y.
   * @param {Point} targetPos
   * @returns {number} angle in radians.
   */
  getCartesianAngleTo(targetPos) {
    return Math.atan2(targetPos.y - this.y, targetPos.x - this.x);
  }

  /**
   * Get angle to target using normal screen coordinates; i.e down is +ve y.
   * @param {Point} targetPos
   * @returns {number} angle in radians.
   */
  getScreenAngleTo(targetPos) {
    return Math.atan2(this.y - targetPos.y, targetPos.x - this.x);
  }

  /**
   * String representation which can be used as key in maps.
   * @returns {string}
   */
  toString() {
    return `(${this.x},${this.y})`;
  }

  /**
   * Test if the position is at the same point, rounded to integer as this.
   * Rotation is ignored.
   * @param {Position} position
   * @returns {boolean}
   */
  isCoincident(position) {
    return (
      Math.round(this.x) === Math.round(position.x) &&
      Math.round(this.y) === Math.round(position.y)
    );
  }

  /**
   * Test if points are adjacent, i.e within one
   * @param {Point} other
   * @param {number} distance
   * @returns {boolean}
   */
  isOtherClose(other, distance) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.pow(dx, 2) + Math.pow(dy, 2) <= Math.pow(distance, 2);
  }
}
/**
 * Velocity class
 */
export class Velocity {
  /** x velocity @type {number} */
  x;
  /** y velocity @type {number} */
  y;
  /** rotational velocity @type {number} */
  rotation;

  /**
   *
   * @param {number} velX
   * @param {number} velY
   * @param {number} velRot
   */
  constructor(velX, velY, velRot) {
    this.x = velX;
    this.y = velY;
    this.rotation = velRot;
  }

  /**
   * Get the angle in radians counterclockwise from x axis. This uses cartesian
   * coordinates where the y axis is positive upwards.
   * @returns {number}
   */
  getCartesianDirection() {
    return Math.atan2(this.y, this.x);
  }
  /**
   * Get the angle in radians counterclockwise from x axis. This uses screen
   * coordinates where the y axis is positive downwards..
   * @returns {number}
   */
  getScreenDirection() {
    return Math.atan2(-this.y, this.x);
  }

  /**
   * Test if velocity effectively zero.
   * @param {number} tolerance
   * @returns {boolean}
   */
  isZero(tolerance) {
    return (
      maths.floatIsZero(this.x, tolerance) &&
      maths.floatIsZero(this.y, tolerance)
    );
  }
}

/**
 * Simple 2D position. Similar to point but including rotation.
 * @implements {Point}
 */
export class Position extends Point {
  /** type {number} */
  rotation;

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} rotation
   */
  constructor(x, y, rotation) {
    super(x, y);
    this.y = y;
    this.rotation = rotation;
  }

  /**
   * Create a Position from a Point.
   * @param {Point} point
   * @returns {Position}
   */
  static fromPoint(point) {
    return new Position(point.x, point.y, 0);
  }

  /**
   * Create copy
   * @param {Position} position
   */
  static copy(position) {
    return new Position(position.x, position.y, position.rotation);
  }

  /** Get a new position representing this position relative to a new origin.
   * @param {Position} origin
   * @returns {Position}
   */
  getRelativeTo(origin) {
    return new Position(
      this.x - origin.x,
      this.y - origin.y,
      this.rotation - origin.rotation
    );
  }

  /**
   * Test that both x and y coordinates are within the length.
   * @param {Position} targetPos
   * @param {number} length
   * @returns {boolean}
   */
  withinSquare(targetPos, length) {
    return (
      Math.abs(targetPos.x - this.x) < length &&
      Math.abs(targetPos.y - this.y) < length
    );
  }
}

/**
 * @typedef {Object} RectangleBounds
 * @property {number} x;
 * @property {number} y;
 * @property {number} right;
 * @property {number} bottom;
 * @property {number} width;
 * @property {number} height;
 */

/**
 * Simple rectangle.
 */
export class Rectangle {
  /** @type {number} */
  x;
  /** @type {number} */
  y;
  /** @type {number} */
  width;
  /** @type {number} */
  height;

  /**
   *
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   */
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /** Get the bottom right
   * @returns {Point}
   */
  getBottomRight() {
    return new Point(this.x + this.width, this.y + this.height);
  }

  /** Get the top left
   * @returns {Point}
   */
  getTopLeft() {
    return new Point(this.x, this.y);
  }
  /**
   * Test if this overlaps another rectangle
   * @param {Rectangle} otherRect
   * @returns {boolean} true if overlapping.
   */
  overlaps(otherRect) {
    const myBR = this.getBottomRight();
    const otherRectBR = otherRect.getBottomRight();
    const noOverlap =
      otherRect.x > myBR.x ||
      otherRect.y > myBR.y ||
      otherRectBR.x < this.x ||
      otherRectBR.y < this.y;
    return !noOverlap;
  }

  /**
   * Test if this rectangle contains a point
   * @param {Point | Position} point
   * @returns {boolean} - true if point contained
   */
  containsPoint(point) {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    );
  }
  /**
   * Test if this rectangle contains a coordinate
   * @param {number} x
   * @param {number} y
   * @returns {boolean} - true if point contained
   */
  containsCoordinate(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
  /**
   * Test if this rectangle equals another.
   * @param {Rectangle} otherRect
   * @returns {boolean}
   */
  equals(other) {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height
    );
  }
}

/** Min point */
export const MIN_POINT = new Point(Number.MIN_VALUE, Number.MIN_VALUE);
/** Max point */
export const MAX_POINT = new Point(Number.MAX_VALUE, Number.MAX_VALUE);

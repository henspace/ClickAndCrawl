/**
 * @file Maths utilities
 *
 * @module utils/maths
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

/**
 * Common angles
 */
const Radians = {
  DEG_22_5: (1 / 8) * Math.PI,
  DEG_45: (2 / 8) * Math.PI,
  DEG_67_5: (3 / 8) * Math.PI,
  DEG_90: (4 / 8) * Math.PI,
  DEG_112_5: (5 / 8) * Math.PI,
  DEG_135: (6 / 8) * Math.PI,
  DEG_157_7: (7 / 8) * Math.PI,
  DEG_180: Math.PI,
};

/**
 * Clip a value between min and max inclusive.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clip(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  }
  return value;
}

/** Enumeration of travel directions
 * @enum {number}
 */
export const CompassEightPoint = {
  NONE: -1,
  N: 0,
  NE: 1,
  E: 2,
  SE: 3,
  S: 4,
  SW: 5,
  W: 6,
  NW: 7,
};

/**
 * Convert an angle to an eight point compass direction.
 * Converts the angle to a compass direction.
 * @param {number} angle - -PI/2 to +PI/2. This is the same range as values returned
 * from the standard Math trigometric functions. Note that this expects the
 * angle to be based on cartesian coordinates, +y upwards. For angles calculated
 * using screen coordinates, +y downwards, you should negate the angle before
 * calling.
 * @param {number} angle - -PI/2 to +PI/2
 * @returns {number} compass point. From CompassEightPoint enum.
 */
export function angleToFourPointCompass(angle) {
  const absAngle = Math.abs(angle);
  if (absAngle <= Radians.DEG_45) {
    return CompassEightPoint.E;
  }
  if (absAngle <= Radians.DEG_135) {
    return Math.sign(angle) > 0 ? CompassEightPoint.N : CompassEightPoint.S;
  }
  return CompassEightPoint.W;
}
/**
 * Convert an angle to an eight point compass direction.
 * Converts the angle to a compass direction.
 * @param {number} angle - -PI/2 to +PI/2. This is the same range as values returned
 * from the standard Math trigometric functions. Note that this expects the
 * angle to be based on cartesian coordinates, +y upwards. For angles calculated
 * using screen coordinates, +y downwards, you should negate the angle before
 * calling.
 * @param {number} angle - -PI/2 to +PI/2
 * @returns {number} compass point. From CompassEightPoint enum.
 */
export function angleToEightPointCompass(angle) {
  const absAngle = Math.abs(angle);
  if (absAngle <= Radians.DEG_22_5) {
    return CompassEightPoint.E;
  }
  if (absAngle <= Radians.DEG_67_5) {
    return Math.sign(angle) > 0 ? CompassEightPoint.NE : CompassEightPoint.SE;
  }
  if (absAngle <= Radians.DEG_112_5) {
    return Math.sign(angle) > 0 ? CompassEightPoint.N : CompassEightPoint.S;
  }
  if (absAngle <= Radians.DEG_157_7) {
    return Math.sign(angle) > 0 ? CompassEightPoint.NW : CompassEightPoint.SW;
  }
  return CompassEightPoint.W;
}

/**
 * Get random number between min and max, inclusive
 * @param {number} min - inclusive minimum
 * @param {number} max - exclusive maximum
 * @returns {number}
 */
export function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}
/**
 * Get random number between min and max, inclusive
 * @param {number} min - inclusive minimum
 * @param {number} max -inclusive maximum
 * @returns {number}
 */
export function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

/**
 * Test if float equals another float.
 * @param {number} valueA
 * @param {number} valueB
 * @param {number} tolerance
 * @returns {boolean}
 */
export function floatsAreEqual(valueA, valueB, tolerance) {
  return valueA - valueB < tolerance;
}

/**
 * Test if float is almost zero.
 * @param {number} value
 * @param {number} tolerance
 * @returns {boolean}
 */
export function floatIsZero(value, tolerance) {
  return Math.abs(value) < tolerance;
}

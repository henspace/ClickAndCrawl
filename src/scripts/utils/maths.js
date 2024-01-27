/**
 * @file Maths utilities
 *
 * @module utils/maths
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
 * Clip a value.
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

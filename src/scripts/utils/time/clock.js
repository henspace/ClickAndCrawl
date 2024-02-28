/**
 * @file Time utilities. Two clocks exist in the games: real and turn based.
 *
 * @module utils/time/clock
 */
/**
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
 * @type {DOMHighResTimeStamp}
 */
let currentTimeMs = 0;

/**
 * @param {DOMHighResTimeStamp} timeNowMs
 */
function updateTimeNow(timeNowMs) {
  currentTimeMs = timeNowMs;
}

/**
 * Get a frame counter.
 * @param {number} framePeriodMs - time between frames
 * @param {number} [timeOffsetMs = 0] - offset to allow some randomisation
 * @returns {number}
 */
function getFrameCount(framePeriodMs, timeOffsetMs = 0) {
  return Math.floor((currentTimeMs + timeOffsetMs) / framePeriodMs);
}

/**
 *  Game clock as singleton.
 */
const GAME_CLOCK = {
  updateTimeNow: updateTimeNow,
  getFrameCount: getFrameCount,
};

export default GAME_CLOCK;

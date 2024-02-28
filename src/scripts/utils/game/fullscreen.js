/**
 * @file Fullscreen button
 *
 * @module utils/game/fullscreen
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
import { AnimatedImage } from '../sprites/animation.js';
import GameConstants from './gameConstants.js';
import HUD from './hud.js';
import { LoopMethod } from '../arrays/indexer.js';
import LOG from '../logging.js';

/** @type {Actor} */
let fullscreenButton;
let fullscreenButtonImage;

/**
 * Request full screen mode.
 * @param {Element} element - what should go full screen.
 * @param {Object} options - see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen}
 * @returns {Promise}
 */
function requestFullscreen(element, options) {
  if (element.requestFullscreen) {
    return element.requestFullscreen(options);
  }
  return Promise.reject(
    new Error('Fullscreen requests not supported by browser')
  );
}

/**
 * Add a full screen button to the HUD
 */
export function addFullscreenButtonToHud() {
  addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      LOG.debug('Exiting fullscreen mode.');
      fullscreenButtonImage.setCurrentIndex(0);
    } else {
      LOG.debug('Entering fullscreen mode');
      fullscreenButtonImage.setCurrentIndex(1);
    }
  });

  fullscreenButtonImage = new AnimatedImage(
    {
      prefix: 'hud-fullscreen',
      startIndex: 0,
      padding: 2,
      suffix: '.png',
    },
    { framePeriodMs: 1, loopMethod: LoopMethod.STOP }
  );
  fullscreenButton = HUD.addButton(
    fullscreenButtonImage,
    () => {
      requestFullscreen(document.body, { navigationUI: 'hide' });
    },
    () => {
      document.exitFullscreen();
    }
  );
  fullscreenButton.position.x = GameConstants.TILE_SIZE;
  fullscreenButton.position.y = -GameConstants.TILE_SIZE;
}

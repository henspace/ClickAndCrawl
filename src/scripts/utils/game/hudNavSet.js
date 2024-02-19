/**
 * @file Navigation button set for the HUD
 *
 * @module utils/game/hudNavSet
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

import HUD from './hud.js';
import { AnimatedImage } from '../sprites/animation.js';
import { LoopMethod } from '../arrays/indexer.js';
import { CameraTracking } from './camera.js';

/**
 * @type {number}
 */
const SCROLL_TILES_PER_SEC = 3;

/**
 * Location of the navigation buttons
 * @enum {number}
 */
export const NavigationLocation = {
  TR: 0,
  BR: 1,
  BL: 2,
  TL: 3,
};

/** Encapsulation of navigation buttons. */
export class NavigationButtons {
  /** @type {CameraDolly} */
  #cameraDolly;

  /** @type {Actor} */
  #trackingButton;

  /** @type {import('../sprites/imageManager.js').SpriteBitmap} */
  #trackingButtonImage;

  /**
   *
   * @param {CameraDolly} cameraDolly
   * @param {number} gridSize
   * @param {NavigationLocation} location
   */
  constructor(cameraDolly, gridSize, location) {
    this.#cameraDolly = cameraDolly;
    this.#createButtonSet(gridSize, location);
  }

  /**
   * Create the buttons.
   * @param {number} gridSize
   * @param {NavigationLocation} location
   */
  #createButtonSet(gridSize, location) {
    let centreX;
    let centreY;
    switch (location) {
      case NavigationLocation.TL:
        centreX = 2 * gridSize;
        centreY = 2 * gridSize;
        break;
      case NavigationLocation.TR:
        centreX = -2 * gridSize;
        centreY = 2 * gridSize;
        break;
      case NavigationLocation.BR:
        centreX = -2 * gridSize;
        centreY = -2 * gridSize;
        break;
      case NavigationLocation.BL:
        centreX = 2 * gridSize;
        centreY = -2 * gridSize;
        break;
    }
    this.#createCentreButton(centreX, centreY);
    this.#createArrowButtons(centreX, centreY, gridSize);
  }

  /** Create the centre button.
   * @param {number} centreX
   * @param {number} centreY
   */
  #createCentreButton(centreX, centreY) {
    this.#trackingButtonImage = new AnimatedImage(
      0,
      {
        prefix: 'hud-auto-centre-',
        startIndex: 0,
        padding: 3,
        suffix: '.png',
      },
      { framePeriodMs: 1, loopMethod: LoopMethod.STOP }
    );
    this.#trackingButton = HUD.addButton(
      this.#trackingButtonImage,
      () => {
        this.setTrackingState(true);
      },
      () => {
        this.setTrackingState(false);
      }
    );
    this.#trackingButton.position.x = centreX;
    this.#trackingButton.position.y = centreY;
    this.#trackingButton.actionClick(null); // defaulting to selected.
  }

  /**
   * Set the tracking state.
   * @param {boolean} on
   */
  setTrackingState(on) {
    if (on) {
      this.#trackingButtonImage.setCurrentIndex(1);
      this.#cameraDolly.setTrackingMethod(CameraTracking.HERO);
    } else {
      this.#trackingButtonImage.setCurrentIndex(0);
      this.#cameraDolly.setTrackingMethod(CameraTracking.OFF);
    }
  }

  /**
   * Create the arrow buttons
   * @param {number} centreX
   * @param {number} centreY
   * @param {number} gridSize
   */
  #createArrowButtons(centreX, centreY, gridSize) {
    const scrollSpeed = SCROLL_TILES_PER_SEC * gridSize;
    this.#createMomentaryButton(
      'hud-arrow-up-',
      centreX,
      centreY - gridSize,
      () => {
        this.setTrackingState(false);
        this.#cameraDolly.setVelocity(0, -scrollSpeed);
      },
      () => this.#cameraDolly.setTrackingMethod(CameraTracking.OFF)
    );

    this.#createMomentaryButton(
      'hud-arrow-right-',
      centreX + gridSize,
      centreY,
      () => {
        this.setTrackingState(false);
        this.#cameraDolly.setVelocity(scrollSpeed, 0);
      },
      () => this.#cameraDolly.setTrackingMethod(CameraTracking.OFF)
    );

    this.#createMomentaryButton(
      'hud-arrow-down-',
      centreX,
      centreY + gridSize,
      () => {
        this.setTrackingState(false);
        this.#cameraDolly.setVelocity(0, scrollSpeed);
      },
      () => this.#cameraDolly.setTrackingMethod(CameraTracking.OFF)
    );

    this.#createMomentaryButton(
      'hud-arrow-left-',
      centreX - gridSize,
      centreY,
      () => {
        this.setTrackingState(false);
        this.#cameraDolly.setVelocity(-scrollSpeed, 0);
      },
      () => this.#cameraDolly.setTrackingMethod(CameraTracking.OFF)
    );
  }

  /**
   * Create a momentary button.
   * @param {string} imageNamePrefix - images are assumed to be imageNamePrefixNNN.png
   * @param {number} x - x position
   * @param {number} y - y position
   * @param {function} callbackDown
   * @param {function} callbackUp
   */
  #createMomentaryButton(imageNamePrefix, x, y, callbackDown, callbackUp) {
    const animatedImage = new AnimatedImage(
      0,
      {
        prefix: imageNamePrefix,
        startIndex: 0,
        padding: 3,
        suffix: '.png',
      },
      { framePeriodMs: 1, loopMethod: LoopMethod.STOP }
    );
    let button = HUD.addMomentaryButton(
      animatedImage,
      callbackDown,
      callbackUp
    );
    button.position.x = x;
    button.position.y = y;
    animatedImage.setCurrentIndex(0);
  }
}

/**
 * @file Navigation button set for the HUD
 *
 * @module hud/hudNavSet
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

import HUD from './hud.js';
import { AnimatedImage } from '../utils/sprites/animation.js';
import { LoopMethod } from '../utils/arrays/indexer.js';
import { CameraTracking } from '../utils/game/camera.js';
import { Point } from '../utils/geometry.js';
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

  /** @type {module:utils/sprites/imageManager~SpriteBitmap} */
  #trackingButtonImage;

  /** @type {Actor} */
  #fullscreenButton;
  /** @type {AnimatedImage} */
  #fullscreenButtonImage;

  /**
   *
   * @param {CameraDolly} cameraDolly
   * @param {number} gridSize
   * @param {NavigationLocation} locationNav
   * @param {NavigationLocation} locationFullscreen
   */
  constructor(cameraDolly, gridSize, locationNav, locationFullscreen) {
    this.#cameraDolly = cameraDolly;
    this.#createButtonSet(gridSize, locationNav, false);
    this.#createFullscreenButton(gridSize, locationFullscreen);
  }

  /**
   * Create the button to handle fullscreen mode
   */
  #createFullscreenButton(gridSize, location) {
    this.#fullscreenButtonImage = new AnimatedImage(
      {
        prefix: 'hud-fullscreen',
        startIndex: 0,
        padding: 2,
        suffix: '.png',
      },
      { framePeriodMs: 1, loopMethod: LoopMethod.STOP }
    );

    this.#setFullscreenButtonImage();
    this.#fullscreenButton = HUD.addButton(
      this.#fullscreenButtonImage,
      () => {
        this.#requestFullscreen(document.body, { navigationUI: 'hide' });
      },
      () => {
        document.exitFullscreen();
      }
    );
    const centre = this.#getLocationPoint(gridSize, location, 1);
    this.#fullscreenButton.position.x = centre.x;
    this.#fullscreenButton.position.y = centre.y;
    addEventListener('fullscreenchange', () => {
      this.#setFullscreenButtonImage();
    });
  }
  /**
   * Set the image for the full screen button. It is assumed that
   * index 0 is shown when not in fullscreen and image 1 when it it.
   * @param {AnimatedI} fullscreenButtonImage
   */
  #setFullscreenButtonImage() {
    if (!document.fullscreenElement) {
      this.#fullscreenButtonImage.setCurrentIndex(0);
    } else {
      this.#fullscreenButtonImage.setCurrentIndex(1);
    }
  }
  /**
   * Request full screen mode.
   * @param {Element} element - what should go full screen.
   * @param {Object} options - see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen}
   * @returns {Promise}
   */
  #requestFullscreen(element, options) {
    if (element.requestFullscreen) {
      return element.requestFullscreen(options);
    }
    return Promise.reject(
      new Error('Fullscreen requests not supported by browser')
    );
  }

  /** Get centre point information
   * @param {number} gridSize - tile size
   * @param {NavigationLocation} location
   * @param {number} offset - offset applied to location.
   * This grid units (i.e. tiles).
   * @returns {Point}
   */
  #getLocationPoint(gridSize, location, offset) {
    const point = new Point(0, 0);
    switch (location) {
      case NavigationLocation.TL:
        point.x = offset * gridSize;
        point.y = offset * gridSize;
        break;
      case NavigationLocation.TR:
        point.x = -offset * gridSize;
        point.y = offset * gridSize;
        break;
      case NavigationLocation.BR:
        point.x = -offset * gridSize;
        point.y = -offset * gridSize;
        break;
      case NavigationLocation.BL:
        point.x = offset * gridSize;
        point.y = -offset * gridSize;
        break;
    }
    return point;
  }
  /**
   * Create the buttons.
   * @param {number} gridSize
   * @param {NavigationLocation} location
   * @param {boolean} showArrows
   */
  #createButtonSet(gridSize, location, showArrows) {
    const offset = showArrows ? 2 : 1;
    const centre = this.#getLocationPoint(gridSize, location, offset);

    this.#createCentreButton(centre.x, centre.y);
    if (showArrows) {
      this.#createArrowButtons(centre.x, centre.y, gridSize);
    }
  }

  /** Create the centre button.
   * @param {number} centreX
   * @param {number} centreY
   */
  #createCentreButton(centreX, centreY) {
    this.#trackingButtonImage = new AnimatedImage(
      {
        prefix: 'hud-auto-centre',
        startIndex: 0,
        padding: 2,
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
      'hud-arrow-up',
      centreX,
      centreY - gridSize,
      () => {
        this.setTrackingState(false);
        this.#cameraDolly.setVelocity(0, -scrollSpeed);
      },
      () => this.#cameraDolly.setTrackingMethod(CameraTracking.OFF)
    );

    this.#createMomentaryButton(
      'hud-arrow-right',
      centreX + gridSize,
      centreY,
      () => {
        this.setTrackingState(false);
        this.#cameraDolly.setVelocity(scrollSpeed, 0);
      },
      () => this.#cameraDolly.setTrackingMethod(CameraTracking.OFF)
    );

    this.#createMomentaryButton(
      'hud-arrow-down',
      centreX,
      centreY + gridSize,
      () => {
        this.setTrackingState(false);
        this.#cameraDolly.setVelocity(0, scrollSpeed);
      },
      () => this.#cameraDolly.setTrackingMethod(CameraTracking.OFF)
    );

    this.#createMomentaryButton(
      'hud-arrow-left',
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
      {
        prefix: imageNamePrefix,
        startIndex: 0,
        padding: 2,
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

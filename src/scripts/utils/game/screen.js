/**
 * @file Utilities for handling the screen size. The screen is implemented as
 * a singleton.
 * The game is configured as a world and a screen. The screen is the area that is
 * rendered with a canvas. The world is the total space in which objects can
 * exist. The world is potentially unbounded.
 *
 * The canvas is set to the same size as the screen and then the canvas is
 * resized to fit the display using CSS.
 *
 * The canvas is centred on the camera, so although the canvas rect and screen
 * rect are the same size, the screen always has its top left at 0, 0 in the world
 * whereas the canvas rect may effectively move around the world.
 *
 * @module utils/screen
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

import * as fonts from '../text/fonts.js';
import { Position, Rectangle } from '../geometry.js';
import LOG from '../logging.js';

/**
 * @typedef {Object} ScreenDetails
 * @property {HTMLCanvasElement} canvas
 * @property {number} width
 * @property {number} height
 * @property {number} x
 * @property {number} y
 */
let throttleTimer = null;

let canvas = null;
let canvasRect = null;
let canvasHalfWidth = 0;
let canvasHalfHeight = 0;
let canvasAlpha = true;
let visibleCanvasRect = null;
let gameElement = null;

let left = 0;
let top = 0;
//let screenRect;
let scale = 1;
let maxScale = 1;
let minScale = 0.1;
let sizingMethod = 'COVER';
let cameraPosition = new Position(0, 0, 0);

/**
 * Add event listener to handle resizing of the window.
 */
window.addEventListener('resize', () => {
  if (throttleTimer !== null) {
    return; // it will get handled.
  }
  throttleTimer = window.setTimeout(() => {
    resize();
    throttleTimer = null;
  }, 200);
});

/**
 * Get dimensions of the working area for the game.
 * @returns {import('../geometry.js').Dims2D}
 */
function getDisplayDims() {
  return { width: window.innerWidth, height: window.innerHeight };
}
/**
 * @param {Object} options - config options.
 * @param {number} options.width - the design width for the screen.
 * @param {number} options.height - the design height for the page.
 * @param {number} options.maxScale - maximum scaling allowed
 * @param {string} options.sizingMethod  - 'FIT' or 'COVER'. Defaults to 'FIT'
 * @param {boolean} options.alpha - Should canvas have an alpha channel
 */
function setOptions(options) {
  if (canvas) {
    LOG.error('Multiple calls to setScreen ignored.');
    return;
  }
  gameElement = document.getElementById('game-content');
  fonts.initialise(options.width);
  canvas = document.createElement('canvas');
  canvas.id = 'game-canvas';
  canvas.setAttribute('width', options.width);
  canvas.setAttribute('height', options.height);
  canvas.innerText = 'Loading the app.';
  canvasRect = new Rectangle(0, 0, options.width, options.height);
  canvasHalfWidth = options.width / 2;
  canvasHalfHeight = options.height / 2;

  gameElement.appendChild(canvas);

  maxScale = options.maxScale;
  minScale = options.minScale;
  sizingMethod = options.sizingMethod;
  canvasAlpha = options.alpha;
  sizeScreen();
  syncDomFonts();
}

/**
 * Size the screen
 * @param {number} aspectRatio - aspect ratio (width / height) of the screen
 * @param {number} windowAspectRatio - aspect ratio (width / height) of the screen
 * @param {string} method - FIT or COVER. Defaults to FIT
 */
function shouldFitHeight(aspectRatio, windowAspectRatio, sizingMethod) {
  if (sizingMethod === 'COVER') {
    return aspectRatio > windowAspectRatio;
  } else {
    return aspectRatio < windowAspectRatio;
  }
}
/**
 * Resize the screen according to the current inner window dimensions.
 */
function sizeScreen() {
  const dims = getDisplayDims();
  let aspectRatio = canvasRect.width / canvasRect.height;
  let displayedHeight = 0;
  let displayedWidth = 0;
  const windowAspectRatio = dims.width / dims.height;
  const fitHeight = shouldFitHeight(
    aspectRatio,
    windowAspectRatio,
    sizingMethod
  );
  if (fitHeight) {
    displayedHeight = dims.height;
    displayedWidth = displayedHeight * aspectRatio;
  } else {
    displayedWidth = dims.width;
    displayedHeight = displayedWidth / aspectRatio;
  }

  scale = displayedWidth / canvasRect.width;
  if (scale > maxScale) {
    scale = maxScale;
    displayedWidth = scale * canvasRect.width;
    displayedHeight = scale * canvasRect.height;
  } else if (scale < minScale) {
    scale = minScale;
    displayedWidth = scale * canvasRect.width;
    displayedHeight = scale * canvasRect.height;
  }

  left = (dims.width - displayedWidth) / 2;
  top = (dims.height - displayedHeight) / 2;

  canvas.style.left = `${left}px`;
  canvas.style.top = `${top}px`;
  canvas.style.width = `${displayedWidth}px`;
  canvas.style.height = `${displayedHeight}px`;

  let visibleCanvasWidth;
  let visibleCanvasHeight;
  let visibleCanvasOffsetX;
  let visibleCanvasOffsetY;
  if (left < 0) {
    visibleCanvasOffsetX = -left / scale;
    visibleCanvasWidth = dims.width / scale;
  } else {
    visibleCanvasOffsetX = 0;
    visibleCanvasWidth = canvasRect.width;
  }
  if (top < 0) {
    visibleCanvasOffsetY = -top / scale;
    visibleCanvasHeight = dims.height / scale;
  } else {
    visibleCanvasOffsetY = 0;
    visibleCanvasHeight = canvasRect.height;
  }

  visibleCanvasRect = new Rectangle(
    visibleCanvasOffsetX,
    visibleCanvasOffsetY,
    visibleCanvasWidth,
    visibleCanvasHeight
  );
  LOG.debug(`Scale: ${scale}`);
  LOG.debug(`Window: width: ${dims.width}, height: ${dims.height}`);
  LOG.debug(
    `Display: left: ${left}, top: ${top}, width: ${displayedWidth}, height: ${displayedHeight}`
  );
  LOG.debug(
    `Visible canvas: left: ${visibleCanvasOffsetX}, top: ${visibleCanvasOffsetY}, width: ${visibleCanvasWidth}, height: ${visibleCanvasHeight}`
  );
}

/**
 * Adjust the font sizes to ensure glass in sync with canvas.
 */
function syncDomFonts() {
  const rootFontSize = fonts.getRootFontSize() * scale;
  document.documentElement.style.fontSize = `${rootFontSize}px`;
}

/**
 * Resize the screen.
 */
function resize() {
  sizeScreen();
  syncDomFonts();
}
/**
 * @typedef {Object} screenDetails
 * @property {HTMLCanvasElement} canvas
 * @property {number} width - design width
 * @property {number} height - design height
 */

/**
 * Clear the canvas.
 */
function clearCanvas() {
  getContext2D().clearRect(0, 0, canvasRect.width, canvasRect.height);
}

/**
 * Get the bounds of the world that are plotted in the canvas.
 * @returns {Rectangle}
 */
function getWorldInCanvasBounds() {
  return new Rectangle(
    cameraPosition.x,
    cameraPosition.y,
    canvasRect.width,
    canvasRect.height
  );
}

/**
 * Get canvas dimensions.
 * @returns {Dims2D}
 */
function getCanvasDimensions() {
  return { width: canvasRect.width, height: canvasRect.height };
}

/**
 * Get the canvas context.
 * @returns {CanvasRenderingContext2D}
 */
function getContext2D() {
  return canvas.getContext('2d', { alpha: canvasAlpha });
}

/**
 * @typedef {Object} Closers
 * @property {Element} element - when clicked, this should close a display.
 * @property {number} response - the response returned if this element closed a display.
 */
/**
 * Set the content of the glass layer. OnClick events are added automatically to the
 * closers.
 * @param {HTMLElement} element
 * @param {Closers[]} closers - array of Closers. If not provided then the entire display
 * is used.
 * @param {string} className
 * @returns {Promise} fulfils to null when clicked.
 */
function displayOnGlass(element, closers, className) {
  const glass = document.createElement('div');
  document.body.appendChild(glass);
  glass.className = 'glass';
  const glassContent = document.createElement('div');
  glass.appendChild(glassContent);
  glassContent.className = 'glass-content';
  glassContent.appendChild(element);
  if (className) {
    glass.classList.add(className);
  }
  glass.style.display = 'block';
  glass.style.opacity = 1;
  const promises = [];
  if (closers && closers.length > 0) {
    closers.forEach((closer) => {
      const promise = new Promise((resolve) => {
        closer.element.addEventListener('click', async () => {
          resolve(closer.response);
        });
      });
      promises.push(promise);
    });
  } else {
    const promise = new Promise((resolve) =>
      glassContent.addEventListener('click', () => resolve())
    );
    promises.push(promise);
  }
  let closingResponse;
  return Promise.race(promises)
    .then((response) => {
      closingResponse = response;
      return wipeGlass(glass);
    })
    .then(() => closingResponse);
}

/**
 * Clear and close the glass layer. The layer is hidden and it's content removed.
 * @param {Element} glass
 * @returns {Promise} fulfils to undefined. This is to allow opacity transition.
 */
function wipeGlass(glass) {
  glass.style.opacity = 0;
  return new Promise((resolve) => {
    window.setTimeout(() => {
      glass.remove();
      resolve();
    }, 500);
  });
}

/**
 * Pan the camera.
 * @param {number} dx - movement in world units
 * @param {number} dy - movement in world units
 */
function panCamera(dx, dy) {
  cameraPosition.x += dx;
  cameraPosition.y += dy;
}

/**
 * Centre the canvas on a point
 * @param {Point} point
 */
function centreCanvasOn(point) {
  cameraPosition.x = point.x - canvasHalfWidth;
  cameraPosition.y = point.y - canvasHalfHeight;
}

/**
 * Convert a distance from ui units to world units.
 * @param {number} dist
 * @returns {number}
 */
function uiToWorld(dist) {
  return dist / scale;
}

/**
 * Convert a distance from world units to ui units.
 * @param {number} dist
 * @returns {number}
 */
function worldToUi(dist) {
  return dist * scale;
}

/**
 * @typedef {Object} MappedPositions
 * @property {Position} canvas - position on the canvas
 * @property {Position} world - position in the world
 */
/**
 * Convert ui Coordinates to world Position
 * @param {number} x  -position in the ui
 * @param {number} y  -position in the ui
 * @returns {MappedPositions} position on the canvas
 */
function uiCoordsToMappedPositions(x, y) {
  x = uiToWorld(x);
  y = uiToWorld(y);
  const canvasPosition = new Position(Math.round(x), Math.round(y));
  const worldPosition = new Position(
    Math.round(x + cameraPosition.x),
    Math.round(y + cameraPosition.y),
    -cameraPosition.rotation
  );
  return { canvas: canvasPosition, world: worldPosition };
}

/**
 * Convert world Position to canvas Position
 * @param {Position} position  -position in the world
 * @returns {Position} position on the canvas
 */
function worldPositionToCanvas(position) {
  return new Position(
    position.x - cameraPosition.x,
    position.y - cameraPosition.y,
    position.rotation
  );
}

/**
 * Convert canvas Position to world Position
 * @param {Position} position  -position on the canvas
 * @returns {Position} position in the world
 */
function canvasPositionToWorld(position) {
  return new Position(
    position.x + cameraPosition.x,
    position.y + cameraPosition.y,
    position.rotation
  );
}

/**
 * Convert glass position to world position. Negative positions are calculated as
 * offsets from the right and bottom of the glass dimensions. Otherwise they are
 * calculated as offsets from the left and top.
 * @returns {Position}
 */
function glassPositionToWorld(position) {
  const xOrigin =
    position.x < 0
      ? visibleCanvasRect.x + visibleCanvasRect.width
      : visibleCanvasRect.x;
  const yOrigin =
    position.y < 0
      ? visibleCanvasRect.y + visibleCanvasRect.height
      : visibleCanvasRect.y;

  let x = xOrigin + position.x;
  let y = yOrigin + position.y;

  return canvasPositionToWorld(new Position(x, y, position.rotation));
}

/**
 * Test if rectangle on screen.
 * @param {Rectangle} rect
 * @return {boolean} true if on screen
 */
function isOnScreen(rect) {
  return rect.overlaps(canvasRect);
}

/**
 * Test if rectangle is visible on the canvas.
 * @param {Rectangle} rect - this should have been converted to canvas coordinates
 * @return {boolean} true if on screen
 */
function isOnCanvas(rect) {
  return rect.overlaps(canvasRect);
}

/**
 * Get the dimensions of the visible canvas.
 * @returns {Rectangle}
 */
function getVisibleCanvasRect() {
  return visibleCanvasRect;
}

/**
 * Set the global opacity.
 * @param {number} opacity
 */
function setOpacity(opacity) {
  getContext2D().globalAlpha = opacity;
}
/**
 * Screen object
 */
const SCREEN = {
  canvasPositionToWorld: canvasPositionToWorld,
  centreCanvasOn: centreCanvasOn,
  clearCanvas: clearCanvas,
  displayOnGlass: displayOnGlass,
  getCanvas: () => canvas,
  getContext2D: getContext2D,
  getCanvasDimensions: getCanvasDimensions,
  getWorldInCanvasBounds: getWorldInCanvasBounds,
  getVisibleCanvasRect: getVisibleCanvasRect,
  glassPositionToWorld: glassPositionToWorld,
  isOnCanvas: isOnCanvas,
  isOnScreen: isOnScreen,
  panCamera: panCamera,
  resize: resize,
  setOpacity: setOpacity,
  setOptions: setOptions,
  wipeGlass: wipeGlass,
  worldPositionToCanvas: worldPositionToCanvas,
  worldToUi: worldToUi,
  uiCoordsToMappedPositions: uiCoordsToMappedPositions,
  uiToWorld: uiToWorld,
};

export default SCREEN;

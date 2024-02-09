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

import * as fonts from '../text/fonts.js';
import { Position, Rectangle } from '../geometry.js';

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
let glass = null;
let glassRect = new Rectangle(0, 0, 0, 0);
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
    throttleTimer = null;
    sizeScreen();
    sizeGlass();
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
    console.error('Multiple calls to setScreen ignored.');
    return;
  }
  gameElement = document.getElementById('game-content');
  fonts.initialise(options.width);
  canvas = document.createElement('canvas');
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
  addGlass();
  sizeGlass();
}

/**
 * Create a Dom layer over the canvas
 */
function addGlass() {
  glass = document.createElement('div');
  glass.id = 'glass';
  gameElement.appendChild(glass);
  glass.style.display = 'none';
  const content = document.createElement('div');
  content.id = 'glass-content';
  glass.appendChild(content);
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

  const visibleCanvasWidth = Math.min(
    dims.width / scale,
    displayedWidth / scale
  );
  const visibleCanvasHeight = Math.min(
    dims.height / scale,
    displayedHeight / scale
  );
  const visibleCanvasOffsetX = 0.5 * (canvasRect.width - visibleCanvasWidth);
  const visibleCanvasOffsetY = 0.5 * (canvasRect.height - visibleCanvasHeight);
  visibleCanvasRect = new Rectangle(
    visibleCanvasOffsetX,
    visibleCanvasOffsetY,
    visibleCanvasWidth,
    visibleCanvasHeight
  );
}

/**
 * Size the glass layer to fit over the screen
 */
function sizeGlass() {
  const dims = getDisplayDims();
  const left = Math.max(parseInt(canvas.style.left), 0);
  const top = Math.max(parseInt(canvas.style.top), 0);
  const width = Math.min(parseInt(canvas.style.width), dims.width);
  const height = Math.min(parseInt(canvas.style.height), dims.height);
  glass.style.left = `${left}px`;
  glass.style.top = `${top}px`;
  glass.style.width = `${width}px`;
  glass.style.height = `${height}px`;
  syncDomFonts();
  glassRect = new Rectangle(left, top, width, height);
}

/**
 * Adjust the font sizes to ensure glass in sync with canvas.
 */
function syncDomFonts() {
  const rootFontSize = fonts.getRootFontSize() * scale;
  document.documentElement.style.fontSize = `${rootFontSize}px`;
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
function geWorldInCanvasBounds() {
  return new Rectangle(
    cameraPosition.x,
    cameraPosition.y,
    canvasRect.width,
    canvasRect.height
  );
}

/**
 * Get visible canvas bounds.
 */
function getVisibleCanvasBounds() {
  let left = (glassRect.x - canvasRect.x) * scale;
  let top = (glassRect.y - canvasRect.y) * scale;
  let right = left + glassRect.width * scale;
  let bottom = top + glassRect.height * scale;
  // now clip
  left = Math.max(left, canvasRect.x);
  top = Math.max(top, canvasRect.y);
  right = Math.min(right, canvasRect.x + canvasRect.width);
  bottom = Math.min(bottom, canvasRect.y + canvasRect.height);
  return new Rectangle(left, top, right - left, bottom - top);
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
 * @property {number} response - the code returned if this element closed a display.
 */
/**
 * Set the content of the glass layer. OnClick events are added automatically to the
 * closers.
 * @param {HTMLElement} element
 * @param {Closers[]} closers - array of Closers. If not provided then the entire display
 * is used.
 * @returns {Promise} fulfils to null when clicked.
 */
function displayOnGlass(element, closers) {
  const content = document.getElementById('glass-content');
  content.replaceChildren(element);
  glass.style.display = 'block';
  glass.style.opacity = 1;
  return new Promise((resolve) => {
    if (closers) {
      closers.forEach((closer) => {
        closer.element.addEventListener('click', () =>
          resolve(closer.response)
        );
      });
    } else {
      content.addEventListener('click', () => resolve());
    }
  }).then(() => wipeGlass());
}

/**
 * Clear and close the glass layer. The layer is hidden and it's content removed.
 * @returns {Promise} fulfils to undefined. This is to allow opacity transition.
 */
function wipeGlass() {
  const content = document.getElementById('glass-content');
  glass.style.opacity = 0;
  return new Promise((resolve) => {
    window.setTimeout(() => {
      content.innerHTML = '';
      glass.style.display = 'none';
      resolve();
    }, 2000);
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
  /*
  let x = position.x < 0 ? glassRect.width + position.x : position.x;
  let y = position.y < 0 ? glassRect.height + position.y : position.y;
  const newPosition = new Position(
    x / scale + 0.5 * (canvasRect.width - glassRect.width / scale),
    y / scale + 0.5 * (canvasRect.height - glassRect.height / scale)
  );
  */
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
 * Get the dimensions of the glass rect. This is scaled to fit the canvas and
 * screen, so this rectangle, in canvas dimensions, is always visible.
 * @returns {Rectangle}
 */
function getGlassRect() {
  return glassRect;
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
  getGlassRect: getGlassRect,
  getVisibleCanvasBounds: getVisibleCanvasBounds,
  geWorldInCanvasBounds: geWorldInCanvasBounds,
  glassPositionToWorld: glassPositionToWorld,
  isOnCanvas: isOnCanvas,
  isOnScreen: isOnScreen,
  panCamera: panCamera,
  setOpacity: setOpacity,
  setOptions: setOptions,
  wipeGlass: wipeGlass,
  worldPositionToCanvas: worldPositionToCanvas,
  worldToUi: worldToUi,
  uiCoordsToMappedPositions: uiCoordsToMappedPositions,
  uiToWorld: uiToWorld,
};

export default SCREEN;

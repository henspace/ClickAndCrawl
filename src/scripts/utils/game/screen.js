/**
 * @file Utilities for handling the screen size.
 * The game is configured as a world and a screen. The screen is the area that is
 * rendered with a canvas. The world is the total space in which objects can
 * exist. The world is potentially unbounded.
 *
 * The canvas is set to the same size as the screen and then the canvas is
 * resized to fit the screen using CSS.
 *
 * The canvas is centred on the camera, so although the canvas rect and screen
 * rect are the same size, the screen always has its top left at 0, 0 in the world
 * whereas the canvas rect may effectively move around the world.
 *
 * @module utils/screen
 *
 * @license
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
import * as world from './world.js';
import * as hud from './hud.js';

/**
 * @typedef {import('../geometry.js').Dims2D} Dims2D
 * @typedef {import('../geometry.js').Point} Point
 */

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
let glass = null;
let left = 0;
let top = 0;
let screenRect;
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
 * @param {Object} options - config options.
 * @param {number} options.width - the design width for the screen.
 * @param {number} options.height - the design height for the page.
 * @param {number} options.maxScale - maximum scaling allowed
 * @param {string} options.sizingMethod  - 'FIT' or 'COVER'. Defaults to 'FIT'
 * @param {boolean} options.alpha - Should canvas have an alpha channel
 */
export function setScreen(options) {
  if (canvas) {
    console.error('Multiple calls to setScreen ignored.');
    return;
  }
  fonts.initialise(options.width);
  canvas = document.createElement('canvas');
  canvas.setAttribute('width', options.width);
  canvas.setAttribute('height', options.height);
  canvas.innerText = 'Loading the app.';
  canvasRect = new Rectangle(0, 0, options.width, options.height);
  canvasHalfWidth = options.width / 2;
  canvasHalfHeight = options.height / 2;

  document.body.appendChild(canvas);

  canvas.style.position = 'absolute';

  screenRect = new Rectangle(0, 0, options.width, options.height);

  maxScale = options.maxScale;
  minScale = options.minScale;
  sizingMethod = options.sizingMethod;
  canvasAlpha = options.alpha;
  sizeScreen();
  addGlass();
  sizeGlass();

  canvas.addEventListener('click', (event) => {
    const x = event.offsetX;
    const y = event.offsetY;
    const mappedPositions = uiCoordsToMappedPositions(x, y);
    console.log(
      `Canvas click at (${x}, ${y}): canvas (${mappedPositions.canvas.x}, ${mappedPositions.canvas.y}), world (${mappedPositions.world.x}, ${mappedPositions.world.y})`
    );
    if (!hud.resolveClick(mappedPositions)) {
      world.resolveClick(mappedPositions);
    }
  });
}

/**
 * Create a Dom layer over the canvas
 */
function addGlass() {
  glass = document.createElement('div');
  glass.id = 'glass';
  document.body.appendChild(glass);
  glass.style.display = 'none';
  glass.style.position = 'absolute';
  addCloseButtonToGlass();
  const content = document.createElement('div');
  content.id = 'glass-content';
  glass.appendChild(content);
}

/**
 * Add a close button to the glass. When clicked it will clear the glass.
 */
function addCloseButtonToGlass() {
  const closeButton = document.createElement('div');
  closeButton.className = 'close-button';
  glass.appendChild(closeButton);
  closeButton.addEventListener('click', () => closeGlass());
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
  let aspectRatio = screenRect.width / screenRect.height;
  let displayedHeight = 0;
  let displayedWidth = 0;
  const windowAspectRatio = window.innerWidth / window.innerHeight;
  const fitHeight = shouldFitHeight(
    aspectRatio,
    windowAspectRatio,
    sizingMethod
  );
  if (fitHeight) {
    displayedHeight = window.innerHeight;
    displayedWidth = displayedHeight * aspectRatio;
  } else {
    displayedWidth = window.innerWidth;
    displayedHeight = displayedWidth / aspectRatio;
  }

  scale = displayedWidth / screenRect.width;
  if (scale > maxScale) {
    scale = maxScale;
    displayedWidth = scale * screenRect.width;
    displayedHeight = scale * screenRect.height;
  } else if (scale < minScale) {
    scale = minScale;
    displayedWidth = scale * screenRect.width;
    displayedHeight = scale * screenRect.height;
  }

  left = (window.innerWidth - displayedWidth) / 2;
  top = (window.innerHeight - displayedHeight) / 2;

  canvas.style.left = `${left}px`;
  canvas.style.top = `${top}px`;
  canvas.style.width = `${displayedWidth}px`;
  canvas.style.height = `${displayedHeight}px`;
}

/**
 * Size the glass layer to fit over the screen
 */
function sizeGlass() {
  glass.style.left = Math.max(parseInt(canvas.style.left), 0) + 'px';
  glass.style.top = Math.max(parseInt(canvas.style.top), 0) + 'px';
  glass.style.width =
    Math.min(parseInt(canvas.style.width), window.innerWidth) + 'px';
  glass.style.height =
    Math.min(parseInt(canvas.style.height), window.innerHeight) + 'px';
  syncDomFonts();
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
 * Get the screen details.
 * @returns {ScreenDetails}
 */
export function getScreenDetails() {
  return Object.freeze({
    canvas: canvas,
    x: screenRect.x,
    y: screenRect.y,
    width: screenRect.width,
    height: screenRect.height,
  });
}

/**
 * Get screen bounds.
 * @returns {Rectangle}
 */
export function getBounds() {
  return new Rectangle(
    screenRect.x,
    screenRect.y,
    screenRect.width,
    screenRect.height
  );
}

/**
 * Get screen bounds.
 * @returns {Dims2D}
 */
export function getDimensions() {
  return { width: screenRect.width, height: screenRect.height };
}

/**
 * Get the canvas context.
 * @returns {CanvasRenderingContext2D}
 */
export function getContext2D() {
  return canvas.getContext('2d', { alpha: canvasAlpha });
}

/**
 * Set the content of the glass layer.
 * @param {HTMLElement} element
 */
export function displayHtmlElement(element) {
  const content = document.getElementById('glass-content');
  content.replaceChildren(element);
  glass.style.display = 'block';
}

/**
 * Close the glass layer. The layer is just hidden, but it's content remains.
 */
export function closeGlass() {
  glass.style.display = 'none';
}

/**
 * Clear and close the glass layer. The layer is hidden and it's content removed.
 */
export function wipeGlass() {
  const content = document.getElementById('glass-content');
  content.innerHTML = '';
  glass.style.display = 'none';
}

/**
 * Pan the camera.
 * @param {number} dx - movement in world units
 * @param {number} dy - movement in world units
 */
export function panCamera(dx, dy) {
  cameraPosition.x += dx;
  cameraPosition.y += dy;
}

/**
 * Centre the canvas on a point
 * @param {Point} point
 */
export function centreCanvasOn(point) {
  cameraPosition.x = point.x - canvasHalfWidth;
  cameraPosition.y = point.y - canvasHalfHeight;
}

/**
 * Convert a distance from ui units to world units.
 * @param {number} dist
 * @returns {number}
 */
export function uiToWorld(dist) {
  return dist / scale;
}

/**
 * Convert a distance from world units to ui units.
 * @param {number} dist
 * @returns {number}
 */
export function worldToUi(dist) {
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
export function uiCoordsToMappedPositions(x, y) {
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
export function worldPositionToCanvas(position) {
  return new Position(
    position.x - cameraPosition.x,
    position.y - cameraPosition.y,
    position.rotation
  );
}

/**
 * Test if rectangle on screen.
 * @param {Rectangle} rect
 * @return {boolean} true if on screen
 */
export function isOnScreen(rect) {
  return rect.overlaps(screenRect);
}

/**
 * Test if rectangle is visible on the canvas.
 * @param {Rectangle} rect - this should have been converted to canvas coordinates
 * @return {boolean} true if on screen
 */
export function isOnCanvas(rect) {
  return rect.overlaps(canvasRect);
}

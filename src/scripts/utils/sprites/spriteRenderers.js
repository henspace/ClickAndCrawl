/**
 * @file Handle sprite rendering on the canvas
 *
 * @module utils/sprites/spriteRenderers
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

import * as canvasText from '../text/text.js';
import * as fonts from '../text/fonts.js';
import * as debug from '../debug.js';
import SCREEN from '../game/screen.js';
import { MIN_POINT, MAX_POINT, Rectangle } from '../geometry.js';
import * as animation from './animation.js'; //eslint-disable-line no-unused-vars
import HUD from '../game/hud.js';
import { Sprite } from './sprite.js';

/**
 * @typedef {Object} RenderGeometry
 * @property {number} width
 * @property {number} height
 * @property {import('../geometry.js').Point} origin - origin relative to the centre
 */

/**
 * Convert RenderGeometry to Rectangle
 * @param {import('../geometry.js').Position} position
 * @param {RenderGeometry} renderGeom
 * @returns {import('../geometry.js').Rectangle}
 */
function renderGeometryToRect(position, renderGeom) {
  return new Rectangle(
    position.x - renderGeom.width / 2,
    position.y - renderGeom.height / 2,
    renderGeom.width,
    renderGeom.height
  );
}

/**
 * Base class for all sprite renderers.
 * @abstract
 */
export class SpriteCanvasRenderer {
  /** @type {CanvasRenderingContext2D} */
  _context;

  /** @type {import('../geometry.js').Rectangle} */
  _boundingBoxCanvas;

  /**
   * Construct base renderer
   * @param {CanvasRenderingContext2D} context
   */
  constructor(context) {
    this._context = context;
    this._boundingBoxCanvas = new Rectangle(0, 0, 0, 0);
  }

  /**
   * Get the context. This is just provided to allow classes other than children
   * to read the context. _context could be used but that is not the intent.
   */
  getContext() {
    return this._context;
  }

  /**
   * Get the axis aligned bounding box
   * @returns {import('../geometry.js').Rectangle}
   */
  getBoundingBoxCanvas() {
    return this._boundingBoxCanvas;
  }
  /**
   * Render the sprite.
   * @param {import('../geometry.js').Position} position in the world
   * @param {number} opacity
   */
  render(position, opacity) {
    position = SCREEN.worldPositionToCanvas(position);
    if (!this.isOnCanvas(position)) {
      return;
    }
    const currentAlpha = this._context.globalAlpha;
    this._context.globalAlpha = currentAlpha * opacity;
    const rotated = position.rotation;
    if (rotated) {
      this._context.save();
      this._context.translate(position.x, position.y);
      this._context.rotate(-position.rotation);
      this._context.translate(-position.x, -position.y);
    }
    this._doRender(position);
    if (rotated) {
      this._context.restore();
    }
    if (debug.OPTIONS.spriteBoxes) {
      this._context.strokeStyle = 'green';
      this._context.strokeRect(
        this._boundingBoxCanvas.x,
        this._boundingBoxCanvas.y,
        this._boundingBoxCanvas.width,
        this._boundingBoxCanvas.height
      );
    }
    this._context.globalAlpha = currentAlpha;
  }
  /**
   * Render the sprite
   * @param {import('../geometry.js').Position} position
   */
  _doRender(positionUnused) {
    console.error('_doRender method should be overridden.');
  }

  /**
   * Check if it will be on screen
   * @param {import('../geometry.js').Position} position
   * @returns {boolean} true if on screen.
   */
  isOnScreen(position) {
    const rect = new Rectangle(
      position.x - this._boundingBoxCanvas.width / 2,
      position.y - this._boundingBoxCanvas.height / 2,
      this._boundingBoxCanvas.width,
      this._boundingBoxCanvas.height
    );
    return SCREEN.isOnScreen(rect);
  }

  /**
   * Check if it will be on screen
   * @param {import('../geometry.js').Position} position - this should be in canvas coordinates.
   * @returns {boolean} true if on screen.
   */
  isOnCanvas(position) {
    const rect = new Rectangle(
      position.x - this._boundingBoxCanvas.width / 2,
      position.y - this._boundingBoxCanvas.height / 2,
      this._boundingBoxCanvas.width,
      this._boundingBoxCanvas.height
    );
    return SCREEN.isOnCanvas(rect);
  }
}

/**
 * Renderer for TextSprites.
 */
export class TextSpriteCanvasRenderer extends SpriteCanvasRenderer {
  /** Name used to access font styles from the fonts.
   * @type {string}
   */
  #styleName;

  /** @type {string} */
  #lastCalculatedText;
  /** @type {RenderGeometry} */
  #renderGeometry;

  /** @type {string} */
  text;

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {string} text
   * @param {string} [styleName = 'normal']
   */
  constructor(context, text, styleName = 'normal') {
    super(context);
    this.text = text;
    this.#styleName = styleName;
  }

  /**
   * Calculate the renderGeometry of the text.
   * @param {string} text
   */
  #calculateRenderGeometry(text) {
    this._context.font = fonts.getCss(this.#styleName);
    const metrics = this._context.measureText(text);
    this.#renderGeometry = {
      width: metrics.width,
      height: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
      origin: {
        x: -0.5 * metrics.width,
        y:
          0.5 *
          (metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent),
      },
    };
    this.#lastCalculatedText = text;
  }

  /**
   * Render the sprite
   * @param {import('../geometry.js').Position} position - this will have been adjusted to the screen.
   */
  _doRender(position) {
    if (this.text !== this.#lastCalculatedText) {
      this.#calculateRenderGeometry(this.text);
    }
    const renderPosition = {
      x: position.x + this.#renderGeometry.origin.x,
      y: position.y + this.#renderGeometry.origin.y,
      rotation: position.rotation,
    };

    canvasText.writeText(
      this._context,
      this.#lastCalculatedText,
      renderPosition,
      { styleName: this.#styleName }
    );

    this._boundingBoxCanvas = renderGeometryToRect(
      position,
      this.#renderGeometry
    );
  }
}

/**
 * Renderer for rectangle sprites
 */
export class RectSpriteCanvasRenderer extends SpriteCanvasRenderer {
  #width;
  #height;
  #halfWidth;
  #halfHeight;
  #fillStyle;
  #strokeStyle;
  /**
   *
   * @param {CanvasRenderingContext2D} context
   * @param {Object} options
   * @param {number} options.width
   * @param {number} options.height
   * @param {string} options.fillStyle
   * @param {string} options.strokeStyle
   */
  constructor(context, options) {
    super(context);
    this.#width = options.width ?? 10;
    this.#height = options.height ?? 10;
    this.#halfWidth = this.#width / 2;
    this.#halfHeight = this.#height / 2;
    this.#fillStyle = options.fillStyle;
    this.#strokeStyle = options.strokeStyle;
  }

  /**
   * Render the sprite.
   * @param {import('../geometry.js').Position} position - this will have been adjusted to the screen.
   */
  _doRender(position) {
    const x = position.x - this.#halfWidth;
    const y = position.y - this.#halfHeight;
    if (this.#fillStyle) {
      this._context.fillStyle = this.#fillStyle;
      this._context.fillRect(x, y, this.#width, this.#height);
    }
    if (this.#strokeStyle) {
      this._context.strokeStyle = this.#strokeStyle;
      this._context.strokeRect(x, y, this.#width, this.#height);
    }

    this._boundingBoxCanvas = new Rectangle(x, y, this.#width, this.#height);
  }
}

/**
 * Renderer for percentage properties.
 */
export class GaugeSpriteCanvasRenderer extends SpriteCanvasRenderer {
  #height;
  #halfHeight;
  #width;
  #halfWidth;
  #fillStyle;
  #strokeStyle;
  #offsetX;
  #offsetY;
  #fillHeight;
  #halfFillHeight;

  /**
   *
   * @param {CanvasRenderingContext2D} context
   * @param {Object} options
   * @param {number} options.width
   * @param {number} options.height
   * @param {string} options.fillStyle
   * @param {string} options.strokeStyle
   * @param {number} options.offsetX - sprite is offset from the normal sprite position.
   * @param {number} options.offsetY - sprite is offset from the normal sprite position.
   */
  constructor(context, options) {
    super(context);
    this.#height = options.height;
    this.#halfHeight = this.#height / 2;
    this.#width = options.width;
    this.#halfWidth = this.#width / 2;
    this.#fillStyle = options.fillStyle;
    this.#strokeStyle = options.strokeStyle;
    this.#offsetX = options.offsetX ?? 0;
    this.#offsetY = options.offsetY ?? 0;
    this.setLevel(0);
  }

  /** Set the level of the gauge.
   * @param {number} proportion - 0 to 1
   */
  setLevel(proportion) {
    this.#fillHeight = Math.min(proportion, 1) * this.#height;
    this.#halfFillHeight = 0.5 * this.#fillHeight;
  }

  /**
   * Render the sprite.
   * @param {import('../geometry.js').Position} position - this will have been adjusted to the screen.
   */
  _doRender(position) {
    const topStroke = position.y - this.#halfHeight + this.#offsetY;
    const topFill =
      position.y + this.#halfHeight - this.#fillHeight + this.#offsetY;

    const x = position.x - this.#halfWidth + this.#offsetX;
    if (this.#fillStyle) {
      this._context.fillStyle = this.#fillStyle;
      this._context.fillRect(x, topFill, this.#width, this.#fillHeight);
    }
    if (this.#strokeStyle) {
      this._context.strokeStyle = this.#strokeStyle;
      this._context.strokeRect(x, topStroke, this.#width, this.#height);
    }

    this._boundingBoxCanvas = new Rectangle(
      x,
      topStroke,
      this.#width,
      this.#height
    );
  }
}

/** Special renderer for multiple gauges applied over a square tile */
export class MultiGaugeTileRenderer extends SpriteCanvasRenderer {
  #gaugeRenderers;

  /**
   * The number of gauges is determined by the maximum length of the fill styles and
   * stroke styles
   * @param {CanvasRenderingContext2D} context
   * @param {Object} options
   * @param {number} options.tileSize
   * @param {string[]} options.fillStyles
   * @param {string[]} options.strokeStyles
   */
  constructor(context, options) {
    super(context);
    const nGauges = Math.max(
      options.fillStyles.length ?? 0,
      options.strokeStyles.length ?? 0
    );
    if (nGauges === 0) {
      console.error('Attempt to create MultiGaugeTileRenderer with no gauges.');
      return;
    }
    this.#gaugeRenderers = [];
    const gaugeWidth = options.tileSize / nGauges;
    let gaugePosX = -options.tileSize / 2 + gaugeWidth / 2;

    for (let index = 0; index < nGauges; index++) {
      this.#gaugeRenderers.push(
        new GaugeSpriteCanvasRenderer(context, {
          width: gaugeWidth,
          height: options.tileSize,
          fillStyle: options.fillStyles?.[index],
          strokeStyle: options.strokeStyles?.[index],
          offsetX: gaugePosX + gaugeWidth * index,
          offsetY: 0,
        })
      );
    }
  }

  /**
   * Set the level of a gauge.
   * @param {number} gaugeIndex
   * @param {number} proportion - 0 to 1
   */
  setLevel(gaugeIndex, proportion) {
    this.#gaugeRenderers[gaugeIndex]?.setLevel(proportion);
  }

  /**
   * Render the sprite.
   * @param {import('../geometry.js').Position} position - this will have been adjusted to the screen.
   */
  render(position) {
    this.#gaugeRenderers?.forEach((renderer) => renderer.render(position));
  }
}

/**
 * Renderer for Path Sprites.
 */
export class PathSpriteCanvasRenderer extends SpriteCanvasRenderer {
  /** @type {RenderGeometry} */
  #renderGeometry;

  /** @type {Point[]} */
  path;

  /**
   * Create a path renderer.
   * @param {CanvasRenderingContext2D} context
   * @param {Point[]} path
   */
  constructor(context, path) {
    super(context);
    this.path = path;
  }

  /** Calculate the rendering geometry.
   * @param {Point[]} path
   * @param {import('../geometry.js').Position} position
   */
  #calculateGeometry(path, positionUnused) {
    let minPoint = MAX_POINT;
    let maxPoint = MIN_POINT;
    path.forEach((point) => {
      minPoint.x = Math.min(minPoint.x, point.x);
      minPoint.y = Math.min(minPoint.y, point.y);
      maxPoint.x = Math.max(maxPoint.x, point.x);
      maxPoint.y = Math.max(maxPoint.y, point.y);
    });

    this.#renderGeometry = {
      width: maxPoint.x - minPoint.x,
      height: maxPoint.y - minPoint.y,
      origin: {
        x: 0.5 * (minPoint.x + maxPoint.x),
        y: 0.5 * (minPoint.y + maxPoint.y),
      },
    };
  }
  /**
   * Render the sprite.
   * @param {import('../geometry.js').Position} position - this will have been adjusted to the screen.
   */
  _doRender(position) {
    if (this.path.length < 2) {
      console.error('Path sprite needs at least 2 points.');
      return;
    }
    if (!this.#renderGeometry) {
      this.#calculateGeometry(this.path, position);
    }

    this._context.beginPath();
    this._context.strokeStyle = 'blue';
    this._context.moveTo(
      this.path[0].x + position.x,
      this.path[0].y + position.y
    );
    for (let n = 1; n < this.path.length; n++) {
      this._context.lineTo(
        this.path[n].x + position.x,
        this.path[n].y + position.y
      );
    }
    this._context.closePath();
    this._context.stroke();

    this._boundingBoxCanvas = renderGeometryToRect(
      position,
      this.#renderGeometry
    );
  }
}

/**
 * Renderer for Image Sprites.
 */
export class ImageSpriteCanvasRenderer extends SpriteCanvasRenderer {
  /** @type {import('./imageManager.js').SpriteBitmap} */
  #spriteBitmap;
  /** @type {animation.KeyedAnimatedImages} */
  #animation;

  /**
   * Create an image renderer.
   * @param {CanvasRenderingContext2D} context
   * @param {SpriteBitmap | animation.AnimatedImage | animation.KeyAnimatedImages} imageDefinition
   */
  constructor(context, imageDefinition) {
    super(context);
    if (imageDefinition?.getCurrentFrame) {
      this.#animation = imageDefinition;
      this.#spriteBitmap = this.#animation.getCurrentFrame();
    } else {
      this.#spriteBitmap = imageDefinition;
    }
    if (this.#spriteBitmap) {
      this._boundingBoxCanvas.width = this.#spriteBitmap?.width ?? 0;
      this._boundingBoxCanvas.height = this.#spriteBitmap?.height ?? 0;
    } else {
      console.error(`No image frame available for sprite.`, imageDefinition);
    }
  }

  /**
   * Render the sprite.
   * @param {import('../geometry.js').Position} position - this will have been adjusted to the screen.
   */
  _doRender(position) {
    if (!this.#spriteBitmap) {
      return;
    }
    const frame = this.#animation
      ? this.#animation.getCurrentFrame()
      : this.#spriteBitmap;

    this._boundingBoxCanvas.x = position.x - this._boundingBoxCanvas.width / 2;
    this._boundingBoxCanvas.y = position.y - this._boundingBoxCanvas.height / 2;

    this._context.drawImage(
      frame.image,
      position.x - frame.centreX,
      position.y - frame.centreY
    );
  }
}

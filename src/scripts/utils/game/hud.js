/**
 * @file Heads-up display. Unlike the world, this never pans and so positions are
 * locked to the canvas coordinates.
 *
 * @module utils/game/hud
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

import { Actor } from './actors.js';
import { ImageSpriteCanvasRenderer } from '../sprites/spriteRenderers.js';
import SCREEN from './screen.js';
import { Sprite } from '../sprites/sprite.js';
import { Position } from '../geometry.js';
import { Rectangle } from '../geometry.js';

/**
 * @type {Map<string, Sprite>}
 */
const actors = new Map();

/** @type {boolean} */
let visible = false;

/**
 * Add a button to the hud. If two callbacks are provided, an AnimatedImage
 * is required with two frames.
 * @param {SpriteBitmap | AnimatedImage} image
 * @param {import('../ui/interactions.js').UiClickCallback} callbackOn
 * @param {import('../ui/interactions.js').UiClickCallback} callbackOff
 * @returns {Actor}
 */
function addButton(image, callbackOn, callbackOff) {
  const actor = new Actor(
    new Sprite({
      renderer: new ImageSpriteCanvasRenderer(SCREEN.getContext2D(), image),
    })
  );

  actors.set(actor, actor);
  actor.setOnClick(() => {
    if (!callbackOff) {
      callbackOn();
    } else if (image.getCurrentIndex() === 0) {
      image.setCurrentIndex(1);
      callbackOn();
    } else {
      image.setCurrentIndex(0);
      callbackOff();
    }
  });
  image.setCurrentIndex(0);
  return actor;
}

/**
 * Add a momentary button to the hud. If two callbacks are provided, an AnimatedImage
 * is required with two frames.
 * @param {SpriteBitmap | AnimatedImage} image
 * @param {import('../ui/interactions.js').UiClickCallback} callbackOn
 * @param {import('../ui/interactions.js').UiClickCallback} callbackOff
 * @returns {Actor}
 */
function addMomentaryButton(image, callbackOn, callbackOff) {
  const actor = new Actor(
    new Sprite({
      renderer: new ImageSpriteCanvasRenderer(SCREEN.getContext2D(), image),
    })
  );

  actors.set(actor, actor);
  actor.setOnPointerDown(() => {
    image.setCurrentIndex(1);
    callbackOn?.();
  });
  actor.setOnPointerUp(() => {
    image.setCurrentIndex(0);
    callbackOff?.();
  });
  return actor;
}

/**
 * Remove sprite from the hud.
 * @param {import('../sprites/sprite.js').Sprite}
 */
function removeButton(target) {
  actors.delete(target);
}

/**
 * Clear the HUD
 */
function clear() {
  actors.clear();
}

/**
 * Update the world. This calls the update methods of the tile map and all sprites/
 * @param {number} deltaSeconds
 */
function update(deltaSeconds) {
  if (!visible) {
    return;
  }
  actors.forEach((sprite) => {
    const uiPos = Position.copy(sprite.position);
    sprite.position = SCREEN.glassPositionToWorld(sprite.position);
    sprite.update(deltaSeconds);
    sprite.position = uiPos;
  });
}

/**
 * Check if the click is in a actor.
 * @param {import('./screen.js').MappedPositions} positions - canvas and world positions
 * @param {Actor} actor
 */
function isHittingActor(positions, actor) {
  const actorCanvasPos = SCREEN.glassPositionToWorld(actor.position);
  let boundingBox = actor.sprite.getBoundingBox();
  const canvasBox = new Rectangle(
    actorCanvasPos.x - boundingBox.width / 2,
    actorCanvasPos.y - boundingBox.height / 2,
    boundingBox.width,
    boundingBox.height
  );

  return canvasBox.containsCoordinate(positions.world.x, positions.world.y);
}

/**
 * Resolve a ui click
 * @param {import('./screen.js').MappedPositions} positions - click in canvas and world coordinates.
 * @returns {boolean} true if resolved.
 */
function resolveClick(positions) {
  if (!visible) {
    return false;
  }
  for (const [keyUnused, actor] of actors) {
    if (isHittingActor(positions, actor)) {
      actor.actionClick(actor, positions.canvas);
      return true;
    }
  }
  return false;
}

/**
 * Resolve a pointer down
 * @param {import('./screen.js').MappedPositions} positions - click in canvas and world coordinates.
 * @returns {boolean} true if resolved.
 */
function resolvePointerDown(positions) {
  if (!visible) {
    return false;
  }
  if (!visible) {
    return false;
  }
  for (const [keyUnused, actor] of actors) {
    if (isHittingActor(positions, actor)) {
      actor.actionPointerDown(actor, positions.canvas);
      return true;
    }
  }
  return false;
}

/**
 * Resolve a ui pointer up event
 * @param {import('./screen.js').MappedPositions} positions - click in canvas and world coordinates.
 * @returns {boolean} true if resolved.
 */
function resolvePointerUp(positions) {
  if (!visible) {
    return false;
  }
  if (!visible) {
    return false;
  }
  for (const [keyUnused, actor] of actors) {
    if (isHittingActor(positions, actor)) {
      actor.actionPointerUp(actor, positions.canvas);
      return true;
    }
  }
  return false;
}

/**
 * Resolve a context menu event.
 * @param {import('./screen.js').MappedPositions} positions - click in canvas and world coordinates.
 * @returns {boolean} true if resolved.
 */
function resolveContextMenu(positionsUnused) {
  return false;
}

/**
 * Resolve a cancel event. For the HUD, a cancel event is treated the same as a pointer
 * up event.
 * @param {import('./screen.js').MappedPositions} positions - click in canvas and world coordinates.
 * @returns {boolean} true if resolved.
 */
function resolvePointerCancel(positions) {
  return resolvePointerUp(positions);
}

/**
 * Set the visibility of the HUD.
 * @param {boolean} visibility - true to show.
 */
function setVisible(visibility) {
  visible = visibility;
}

/**
 * HUD object
 */
const HUD = {
  addButton: addButton,
  addMomentaryButton: addMomentaryButton,
  clear: clear,
  removeButton: removeButton,
  update: update,
  resolvePointerCancel: resolvePointerCancel,
  resolveClick: resolveClick,
  resolveContextMenu: resolveContextMenu,
  resolvePointerDown: resolvePointerDown,
  resolvePointerUp: resolvePointerUp,
  setVisible: setVisible,
};

export default HUD;

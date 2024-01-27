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

/**
 * @type {Map<string, Sprite>}
 */
const sprites = new Map();

/** @type {boolean} */
let visible = false;

/**
 * Add a sprite to the hud.
 * The sprite's uiComponent flag is set to true.
 * @param {import('../sprites/sprite.js').Sprite}
 */
function addSprite(target) {
  target.uiComponent = true;
  sprites.set(target, target);
}

/**
 * Remove sprite from the hud.
 * @param {import('../sprites/sprite.js').Sprite}
 */
function removeSprite(target) {
  sprites.delete(target);
}

/**
 * Update the world. This calls the update methods of the tile map and all sprites/
 * @param {number} deltaSeconds
 */
function update(deltaSeconds) {
  if (!visible) {
    return;
  }
  sprites.forEach((sprite) => sprite.update(deltaSeconds));
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
  for (const [keyUnused, sprite] of sprites) {
    const position = sprite.uiComponent ? positions.canvas : positions.world;
    if (sprite.getBoundingBox().containsCoordinate(position.x, position.y)) {
      console.log('Clicked', sprite);
      sprite.actionClick(sprite, position);
      return true;
    }
  }
  return false;
}

/**
 * Set the visibility of the HUD.
 * @param {boolean} visibility - true to show.
 */
export function setVisible(visibility) {
  visible = visibility;
}

/**
 * HUD object
 */
const HUD = {
  addSprite: addSprite,
  removeSprite: removeSprite,
  update: update,
  resolveClick: resolveClick,
};

export default HUD;

/**
 * @file Conversion of map plan keys to images and tile definitions.
 *
 * @module scriptReaders/symbolMapping
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
import { TileRole } from '../utils/tileMaps/tileMap.js';
import TURN_MANAGER from '../utils/game/turnManager.js';

/**
 * @typedef {import('./tileMap.js').TileDefinition} TileDefinition
 */

/**
 * @param {string} imageName
 * @returns {TileDefinition}
 */
function createGroundDefn(imageName) {
  return {
    role: TileRole.GROUND,
    onClick: (target, point, detail) =>
      TURN_MANAGER.triggerEvent(
        TURN_MANAGER.EventId.CLICKED_FREE_GROUND,
        point,
        detail
      ),
    image: imageName,
  };
}

/**
 * @param {string} imageName
 * @returns {TileDefinition}
 */
function createEntranceDefn(imageName) {
  return {
    role: TileRole.ENTRANCE,
    onClick: (target, point, detail) =>
      TURN_MANAGER.triggerEvent(
        TURN_MANAGER.EventId.CLICKED_ENTRANCE,
        point,
        detail
      ),
    image: imageName,
  };
}

/**
 * @param {string} imageName
 * @returns {TileDefinition}
 */
function createExitDefn(imageName) {
  return {
    role: TileRole.EXIT,
    onClick: (target, point, detail) =>
      TURN_MANAGER.triggerEvent(
        TURN_MANAGER.EventId.CLICKED_EXIT,
        point,
        detail
      ),
    image: imageName,
  };
}

export const TILE_MAP_KEYS = new Map([
  ['x', { role: TileRole.OBSTACLE, image: 'block.png' }],
  // wall parts
  ['#-TL', { role: TileRole.OBSTACLE, image: 'wall-TL.png' }],
  ['#-TLI', { role: TileRole.OBSTACLE, image: 'wall-TLI.png' }],
  ['#-T', { role: TileRole.OBSTACLE, image: 'wall-T.png' }],
  ['#-TR', { role: TileRole.OBSTACLE, image: 'wall-TR.png' }],
  ['#-TRI', { role: TileRole.OBSTACLE, image: 'wall-TRI.png' }],
  ['#-R', { role: TileRole.OBSTACLE, image: 'wall-R.png' }],
  ['#-BR', { role: TileRole.OBSTACLE, image: 'wall-BR.png' }],
  ['#-BRI', { role: TileRole.OBSTACLE, image: 'wall-BRI.png' }],
  ['#-B', { role: TileRole.OBSTACLE, image: 'wall-B.png' }],
  ['#-BL', { role: TileRole.OBSTACLE, image: 'wall-BL.png' }],
  ['#-BLI', { role: TileRole.OBSTACLE, image: 'wall-BLI.png' }],
  ['#-L', { role: TileRole.OBSTACLE, image: 'wall-L.png' }],
  ['#-XI', { role: TileRole.OBSTACLE, image: 'wall-XI.png' }],
  ['#-VI', { role: TileRole.OBSTACLE, image: 'wall-VI.png' }],
  ['#-HI', { role: TileRole.OBSTACLE, image: 'wall-HI.png' }],
  ['#-TTEE', { role: TileRole.OBSTACLE, image: 'wall-TTEE.png' }],
  ['#-RTEE', { role: TileRole.OBSTACLE, image: 'wall-RTEE.png' }],
  ['#-BTEE', { role: TileRole.OBSTACLE, image: 'wall-BTEE.png' }],
  ['#-LTEE', { role: TileRole.OBSTACLE, image: 'wall-LTEE.png' }],
  ['#', { role: TileRole.OBSTACLE, image: 'block.png' }],
  // doors
  ['=-T', createExitDefn('door-T.png')],
  ['=-R', createExitDefn('door-R.png')],
  ['=-B', createExitDefn('door-B.png')],
  ['=-L', createExitDefn('door-L.png')],
  ['--T', createEntranceDefn('door-T.png')],
  ['--R', createEntranceDefn('door-R.png')],
  ['--B', createEntranceDefn('door-B.png')],
  ['--L', createEntranceDefn('door-L.png')],
  ['=', { role: TileRole.OBSTACLE, image: 'block.png' }],
  ['-', { role: TileRole.OBSTACLE, image: 'block.png' }],
  // ground
  ['.', createGroundDefn('floor.png')],
  ['.-SBW', createGroundDefn('floor-SBW.png')],
  ['.-SBE', createGroundDefn('floor-SBE.png')],

  [',-SBE', createGroundDefn('floor2-SBE.png')],
  [',-SBW', createGroundDefn('floor2-SBW.png')],
  [',', createGroundDefn('floor2.png')],
]);

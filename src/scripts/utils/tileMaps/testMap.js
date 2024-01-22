/**
 * @file Simple test map
 *
 * @module utils/tileMaps/testMap
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

import * as turnManager from '../game/turnManager.js';
import { TileRole } from './tileMap.js';

/**
 * @typedef {import('./tileMap.js').TileDefinition} TileDefinition
 */
/** @type {TileDefinition} */
const GROUND_DEFN = {
  role: TileRole.GROUND,
  onClick: (target, point) =>
    turnManager.triggerEvent(turnManager.EventId.CLICKED_FREE_GROUND, point),
  image: 'floor.png',
};

/** @type {TileDefinition} */
const ENTRANCE_DEFN = {
  role: TileRole.ENTRANCE,
  onClick: (target, point) =>
    turnManager.triggerEvent(turnManager.EventId.CLICKED_ENTRANCE, point),
  image: 'door-V.png',
};

/** @type {TileDefinition} */
const EXIT_DEFN = {
  role: TileRole.EXIT,
  onClick: (target, point) =>
    turnManager.triggerEvent(turnManager.EventId.CLICKED_EXIT, point),
  image: 'door-V.png',
};

export const testTileMapPlan = [
  'x##################   ',
  'x-,,,,,,,,,#......#   ',
  'x#,,,,,,,,,#......#   ',
  'x#.............####   ',
  'x#...__........#      ',
  'x########,,,,,,=      ',
  '________#,,,,,,#      ',
  '________###,,###      ',
  '__________#,,#        ',
  '__________####        ',
];

export const testTileMapKeys = new Map([
  ['x', { role: TileRole.OBSTACLE, image: 'default.png' }],
  // wall parts
  ['#-TL', { role: TileRole.OBSTACLE, image: 'corner-TL.png' }],
  ['#-T', { role: TileRole.OBSTACLE, image: 'wall-TOP.png' }],
  ['#-TR', { role: TileRole.OBSTACLE, image: 'corner-TR.png' }],
  ['#-R', { role: TileRole.OBSTACLE, image: 'wall-RIGHT.png' }],
  ['#-BR', { role: TileRole.OBSTACLE, image: 'corner-BR.png' }],
  ['#-B', { role: TileRole.OBSTACLE, image: 'wall-BOTTOM.png' }],
  ['#-BL', { role: TileRole.OBSTACLE, image: 'corner-BL.png' }],
  ['#-L', { role: TileRole.OBSTACLE, image: 'wall-LEFT.png' }],
  ['#', { role: TileRole.OBSTACLE, image: 'wall-TOP.png' }],
  // doors
  ['=-T', EXIT_DEFN],
  ['=-R', EXIT_DEFN],
  ['=-B', EXIT_DEFN],
  ['=-L', EXIT_DEFN],
  ['=', EXIT_DEFN],
  ['-', ENTRANCE_DEFN],
  // ground
  ['.', GROUND_DEFN],
  [',', GROUND_DEFN],
]);

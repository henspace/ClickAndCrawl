/**
 * @file Tile map support
 *
 * @module utils/tileMaps/tilePlan
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

import { getSurrounds } from '../arrays/arrayManip.js';

/** Symbol used to mark void tiles @type {string} */
const VOID_SYMBOL = 'VOID';

/** Special symbols for constructing the dungeon */
const SpecialSymbols = {
  WALL: ['#', '*', '|'],
  DOOR_IN: ['-'],
  DOOR_OUT: ['='],
  GROUND: ['.', ':', ',', ';'],
  VOID: ['_', ' '],
};

/**
 * Clarifiers appended to ambiguous design symbols.
 */
const Clarifiers = {
  TOP_LEFT: '-TL',
  TOP_LEFT_INTERNAL: '-TLI',
  TOP: '-T',
  TOP_RIGHT: '-TR',
  TOP_RIGHT_INTERNAL: '-TRI',
  RIGHT: '-R',
  BOTTOM_RIGHT: '-BR',
  BOTTOM_RIGHT_INTERNAL: '-BRI',
  BOTTOM: '-B',
  BOTTOM_LEFT: '-BL',
  BOTTOM_LEFT_INTERNAL: '-BLI',
  LEFT: '-L',
  TOP_TEE: '-TTEE',
  RIGHT_TEE: '-RTEE',
  BOTTOM_TEE: '-BTEE',
  LEFT_TEE: '-TTEE',
  CENTRE_CROSS: '-CX',
};

/**
 * Design created by users for a tile map.
 * The design comprises an array of strings. Each string is row in the tile map.
 * A single character is used for each tile. Users can use any character they want
 * except for the {@link SpecialSymbols} characters which have predefined meanings.
 * These predefined symbols can be ambiguous. E.g. the CORNER could be any of four possible
 * corners. These are clarified automatically and have a suffix added to clarify
 * its position.
 *  @typedef {string[]}TileMapDesign
 */

/**
 * Two dimensional array of tile design information. This is different from the
 * design information as the design now exists as a two dimensional array of
 * TileDefinition.
 *
 * @typedef {Array.TileDefinition[]} TilePlan
 */

/**
 * Tile Design Information.
 * @typedef {Object} TileDefinition
 * @property {string} name
 * @property {string} image
 */

/**
 * Map of symbols to names and image names. The name just allows different tile
 * types to use the same image.
 * @typedef {Map<string, TileDesignInfo>} SymbolMap
 */

/**
 * Converts a tile map design into a tile map plan
 * @param {TileMapDesign} design
 * @param {SymbolMap}} symbolMap
 */
export function generateTileMapPlan(design, symbolMap) {
  let matrix = convertToMatrix(design);
  matrix = clarifyDesign(matrix);
  return createPlan(matrix, symbolMap);
}

/**
 * Convert the user's design from array of strings into a 2D array.
 * @returns {Array.string[]}
 */
function convertToMatrix(design) {
  const matrix = [];
  let nColumns = 0;
  design.forEach((row) => {
    nColumns = Math.max(nColumns, row.length);
  });
  design.forEach((row) => {
    if (row.length < nColumns) {
      row = row + ' '.repeat(nColumns - length);
    }
    matrix.push(row.split(''));
  });
  return matrix;
}

/**
 * Go through the design matrix and convert any ambiguous symbols to more specific
 * ones
 * @param {Array.string[]} matrix
 */
function clarifyDesign(matrix) {
  const unambiguousMatrix = [];
  matrix.forEach((rowValue, rowIndex) => {
    const correctedRow = [];
    unambiguousMatrix.push(correctedRow);
    rowValue.forEach((colValue, colIndex) => {
      const surrounds = getSurrounds(matrix, rowIndex, colIndex);
      if (isVoid(colValue)) {
        colValue = VOID_SYMBOL;
      } else if (isGround(colValue)) {
        colValue = clarifyGround(colValue, surrounds);
      } else if (isPartOfWall(colValue)) {
        colValue = clarifyWallPart(colValue, surrounds);
      }
      correctedRow.push(colValue);
    });
  });
  return unambiguousMatrix;
}

/**
 * Test if symbol is a void.
 * @returns {boolean}
 */
function isVoid(symbol) {
  return SpecialSymbols.VOID.includes(symbol);
}

/**
 * Test if symbol is a door.
 * @returns {boolean}
 */
function isDoor(symbol) {
  return (
    SpecialSymbols.DOOR_IN.includes(symbol) ||
    SpecialSymbols.DOOR_OUT.includes(symbol)
  );
}

/**
 * Test if symbol is a wall.
 * @returns {boolean}
 */
function isWall(symbol) {
  return SpecialSymbols.WALL.includes(symbol);
}

/**
 * Test if symbol is ground.
 * @returns {boolean}
 */
function isGround(symbol) {
  return SpecialSymbols.GROUND.includes(symbol);
}
/**
 * Test if the symbol, unclarified, is part of a wall.
 * @param {string} symbol
 * @returns {boolean}
 */
function isPartOfWall(symbol) {
  return isWall(symbol) || isDoor(symbol);
}

/**
 * No adjustment is currently made for the ground.
 * @param {string} value
 * @param {import('../arrays/arrayManip.js').Surrounds} surrounds
 * @return {string}
 */
function clarifyGround(value, surroundsIgnored) {
  return value;
}

/**
 * Distinguish the type of tile based on its surroundings.
 * This function does not handle corners.
 * @param {string} value
 * @param {import('../arrays/arrayManip.js').Surrounds} surrounds
 * @return {string}
 */
function clarifyWallPart(value, surrounds) {
  // centre cross
  if (
    isPartOfWall(surrounds.above) &&
    isPartOfWall(surrounds.right) &&
    isPartOfWall(surrounds.below) &&
    isPartOfWall(surrounds.left)
  ) {
    return value + Clarifiers.CENTRE_CROSS;
  }
  // Tees
  if (
    isPartOfWall(surrounds.left) &&
    isPartOfWall(surrounds.right) &&
    isPartOfWall(surrounds.below)
  ) {
    return value + Clarifiers.TOP_TEE;
  }
  if (
    isPartOfWall(surrounds.above) &&
    isPartOfWall(surrounds.below) &&
    isPartOfWall(surrounds.left)
  ) {
    return value + Clarifiers.RIGHT_TEE;
  }
  if (
    isPartOfWall(surrounds.left) &&
    isPartOfWall(surrounds.right) &&
    isPartOfWall(surrounds.above)
  ) {
    return value + Clarifiers.BOTTOM_TEE;
  }
  if (
    isPartOfWall(surrounds.above) &&
    isPartOfWall(surrounds.below) &&
    isPartOfWall(surrounds.right)
  ) {
    return value + Clarifiers.LEFT_TEE;
  }
  // corners
  if (isPartOfWall(surrounds.right) && isPartOfWall(surrounds.below)) {
    return isGround(surrounds.br)
      ? value + Clarifiers.TOP_LEFT
      : value + Clarifiers.TOP_LEFT_INTERNAL;
  }
  if (isPartOfWall(surrounds.left) && isPartOfWall(surrounds.below)) {
    return isGround(surrounds.bl)
      ? value + Clarifiers.TOP_RIGHT
      : value + Clarifiers.TOP_RIGHT_INTERNAL;
  }
  if (isPartOfWall(surrounds.left) && isPartOfWall(surrounds.above)) {
    return isGround(surrounds.tl)
      ? value + Clarifiers.BOTTOM_RIGHT
      : value + Clarifiers.BOTTOM_RIGHT_INTERNAL;
  }
  if (isPartOfWall(surrounds.right) && isPartOfWall(surrounds.above)) {
    return isGround(surrounds.tr)
      ? value + Clarifiers.BOTTOM_LEFT
      : value + Clarifiers.BOTTOM_LEFT_INTERNAL;
  }
  // straights
  if (isPartOfWall(surrounds.above)) {
    // vertical
    return isGround(surrounds.right)
      ? value + Clarifiers.LEFT
      : value + Clarifiers.RIGHT;
  } else if (isPartOfWall(surrounds.right)) {
    // horizontal
    return isGround(surrounds.below)
      ? value + Clarifiers.TOP
      : value + Clarifiers.BOTTOM;
  }
  return value;
}

/**
 * Convert a clarified design plan matrix into a tile plan.
 * @param {string[][]} matrix
 * @param {Map<string, *>} symbolMap
 * @returns {Array.<Array.<*>>}
 */
function createPlan(matrix, symbolMap) {
  const planMatrix = [];
  matrix.forEach((rowValue) => {
    const planRow = [];
    planMatrix.push(planRow);
    rowValue.forEach((columnValue) => {
      planRow.push(getDesignInfo(columnValue, symbolMap));
    });
  });
  return planMatrix;
}

/** Get the design info from the symbol map.
 * @param {string} symbol - clarified symbol.
 * @param {Map<string, *>} symbolMap
 * @returns {TileDesignInfo}
 */
function getDesignInfo(symbol, symbolMap) {
  return symbolMap.get(symbol) ?? symbolMap.get(unclarifiedSymbol(symbol));
}

/**
 * Unclarify a symbol
 * @param {string} symbol
 * @return {string}
 */
function unclarifiedSymbol(symbol) {
  return symbol.charAt(0);
}

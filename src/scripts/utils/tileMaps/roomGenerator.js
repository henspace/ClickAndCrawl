/**
 * @file Random room generator
 *
 * @module utils/tileMaps/roomGenerator
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

import * as maths from '../maths.js';
import * as arrayManip from '../arrays/arrayManip.js';
import { SpecialSymbols } from './tilePlan.js';

/**
 * Class used to create rooms
 */
export class RoomCreator {
  #maxCols;
  #maxRows;
  #maxRoomCols;
  #maxRoomRows;
  #dungeon;
  /**
   *
   * @param {Object} options
   * @param {number} options.minCols
   * @param {number} options.minRows
   * @param {number} options.maxCols
   * @param {number} options.maxRows
   * @param {number} options.maxRoomWidth
   * @param {number} options.maxRoomHeight
   */
  constructor(options) {
    this.#maxCols = maths.getRandomIntInclusive(
      options.minCols,
      options.maxCols
    );
    this.#maxRows = maths.getRandomIntInclusive(
      options.minRows,
      options.maxRows
    );
    this.#maxRoomCols = options.maxRoomCols;
    this.#maxRoomRows = options.maxRoomRows;
  }

  /**
   * Get a random wall char.
   * @param {number} [qty = 1]
   * @returns {string}
   */
  #getWallChr(qty = 1) {
    let result = '';
    while (qty-- > 0) {
      result += maths.getRandomMember(SpecialSymbols.WALL);
    }
    return result;
  }

  /**
   * Get a random ground char.
   * @param {number} [qty = 1]
   * @returns {string}
   */
  #getFloorChr(qty = 1) {
    let result = '';
    while (qty-- > 0) {
      result += maths.getRandomMember(SpecialSymbols.GROUND);
    }
    return result;
  }

  /**
   * Get a random void char.
   * @param {number} [qty = 1]
   * @returns {string}
   */
  #getLandChr(qty = 1) {
    let result = '';
    while (qty-- > 0) {
      result += maths.getRandomMember(SpecialSymbols.VOID);
    }
    return result;
  }

  /**
   * Get a random door in char.
   * @param {number} [qty = 1]
   * @returns {string}
   */
  #getDoorInChr(qty = 1) {
    let result = '';
    while (qty-- > 0) {
      result += maths.getRandomMember(SpecialSymbols.DOOR_IN);
    }
    return result;
  }

  /**
   * Get a random door out char.
   * @param {number} [qty = 1]
   * @returns {string}
   */
  #getDoorOutChr(qty = 1) {
    let result = '';
    while (qty-- > 0) {
      result += maths.getRandomMember(SpecialSymbols.DOOR_OUT);
    }
    return result;
  }

  /** Test is a wall char.
   * @param {string} char
   * @returns {boolean}
   */
  #isWallChr(chr) {
    return SpecialSymbols.WALL.includes(chr);
  }

  /** Test is a floor character.
   * @param {string} char
   * @returns {boolean}
   */
  #isFloorChr(chr) {
    return SpecialSymbols.GROUND.includes(chr);
  }

  /** Test is a land character.
   * @param {string} char
   * @returns {boolean}
   */
  #isLandChr(chr) {
    return SpecialSymbols.VOID.includes(chr);
  }

  /** Test is a entrance character.
   * @param {string} char
   * @returns {boolean}
   */
  #isDoorInChr(chr) {
    return SpecialSymbols.DOOR_IN.includes(chr);
  }

  /** Test is a exit character.
   * @param {string} char
   * @returns {boolean}
   */
  #isDoorOutChr(chr) {
    return SpecialSymbols.DOOR_OUT.includes(chr);
  }
  /**
   * Generate a room.
   * @returns {String[]}
   */
  generate() {
    const minRoomCols = 4;
    const minRoomRows = 4;
    this.#dungeon = [];
    let lastLeftLandCols = 0;
    let lastRoomCols = this.#maxCols;
    while (this.#dungeon.length < this.#maxRows - minRoomRows) {
      const maxLeftLand = lastLeftLandCols + lastRoomCols - minRoomCols - 2;
      const leftLandCols =
        maxLeftLand > 0 ? maths.getRandomInt(0, maxLeftLand) : 0;
      const reqdMinRoomWidth = Math.max(
        lastLeftLandCols - leftLandCols + minRoomCols,
        minRoomCols
      );
      let reqdMaxRoomWidth = Math.min(
        this.#maxRoomCols,
        this.#maxCols - leftLandCols
      );

      const roomCols =
        reqdMaxRoomWidth > reqdMinRoomWidth
          ? maths.getRandomInt(reqdMinRoomWidth, reqdMaxRoomWidth)
          : reqdMinRoomWidth;
      const rightLandCols = this.#maxCols - leftLandCols - roomCols;
      const maxHeight = Math.min(
        this.#maxRoomRows,
        this.#maxRows - this.#dungeon.length
      );
      const roomRows = maths.getRandomInt(minRoomRows, maxHeight);
      this.#createRoom(leftLandCols, roomCols, rightLandCols, roomRows);
      lastLeftLandCols = leftLandCols;
      lastRoomCols = roomCols;
    }
    this.#removeInternalWalls();
    this.#locateDoors();
    return this.getMatrixAsStrings();
  }

  /**
   * Convert matrix to a plan design.
   * @returns {string[]}
   */
  getMatrixAsStrings() {
    return this.#dungeon.map((columns) => columns.join(''));
  }

  /**
   *
   * @param {number} leftLandCols
   * @param {number} roomCols
   * @param {number} rightLandCols
   * @param {number} numberOfRows
   */
  #createRoom(leftLandCols, roomCols, rightLandCols, numberOfRows) {
    let columns = '';
    columns += this.#getLandChr(leftLandCols);
    columns += this.#getWallChr(roomCols);
    columns += this.#getLandChr(rightLandCols);
    this.#dungeon.push(columns.split(''));
    for (let internalRow = 0; internalRow < numberOfRows - 2; internalRow++) {
      columns = '';
      columns += this.#getLandChr(leftLandCols);
      columns += this.#getWallChr(1);
      columns += this.#getFloorChr(roomCols - 2);
      columns += this.#getWallChr(1);
      columns += this.#getLandChr(rightLandCols);
      this.#dungeon.push(columns.split(''));
    }
    columns = '';
    columns += this.#getLandChr(leftLandCols);
    columns += this.#getWallChr(roomCols);
    columns += this.#getLandChr(rightLandCols);
    this.#dungeon.push(columns.split(''));
  }

  /** Go through the dungeon removing internal walls. */
  #removeInternalWalls() {
    for (let row = 1; row < this.#dungeon.length - 1; row++) {
      for (let col = 1; col < this.#dungeon[0].length - 2; col++) {
        if (
          this.#isWallChr(this.#dungeon[row][col]) &&
          this.#isWallChr(this.#dungeon[row + 1][col]) &&
          this.#isFloorChr(this.#dungeon[row - 1][col]) &&
          this.#isFloorChr(this.#dungeon[row + 2][col])
        ) {
          this.#dungeon[row][col] = this.#getFloorChr(1);
          this.#dungeon[row + 1][col] = this.#getFloorChr(1);
        }
      }
    }
  }

  /**
   * Is this a vertical wall where a door could go.
   * @param {module:utils/arrays/arrayManip~Surrounds} surrounds
   * @returns {boolean}
   */
  #isVerticalWall(surrounds) {
    return (
      this.#isWallChr(surrounds.above) &&
      this.#isWallChr(surrounds.centre) &&
      this.#isWallChr(surrounds.below)
    );
  }
  /**
   * Is this a Horizontal wall where a door could go.
   * @param {module:utils/arrays/arrayManip~Surrounds} surrounds
   * @returns {boolean}
   */
  #isHorizontalWall(surrounds) {
    return (
      this.#isWallChr(surrounds.left) &&
      this.#isWallChr(surrounds.centre) &&
      this.#isWallChr(surrounds.right)
    );
  }

  /**
   * Position the doors.
   */
  #locateDoors() {
    const possibleLocations = [];
    this.#dungeon.forEach((rowValue, rowIndex) =>
      rowValue.forEach((colValue, colIndex) => {
        const surrounds = arrayManip.getSurrounds(
          this.#dungeon,
          rowIndex,
          colIndex
        );
        if (
          this.#isHorizontalWall(surrounds) ||
          this.#isVerticalWall(surrounds)
        ) {
          possibleLocations.push({ row: rowIndex, col: colIndex });
        }
      })
    );
    const randomLocations = arrayManip.randomise(possibleLocations);
    let location = randomLocations[0];
    this.#dungeon[location.row][location.col] = this.#getDoorInChr();
    location = randomLocations[1];
    this.#dungeon[location.row][location.col] = this.#getDoorOutChr();
  }
}

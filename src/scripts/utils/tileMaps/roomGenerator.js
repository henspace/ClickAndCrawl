/**
 * @file Random room generator
 *
 * @module utils/tileMaps/roomGenerator
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
  #wallChr;
  #floorChr;
  #entranceChr;
  #exitChr;
  #landChr;
  #dungeon;
  /**
   *
   * @param {Object} options
   * @param {number} options.minCols
   * @param {number} options.minRows
   * @param {number} options.maxCols
   * @param {number} options.maxRows
   * @param {number} options.maxRoomWidth
   * @param {number} options.maxRoomheight
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
    this.#wallChr = SpecialSymbols.WALL[0];
    this.#floorChr = SpecialSymbols.GROUND[0];
    this.#landChr = SpecialSymbols.VOID[0];
    this.#entranceChr = SpecialSymbols.DOOR_IN[0];
    this.#exitChr = SpecialSymbols.DOOR_OUT[0];
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
    console.log(
      `Create room ${leftLandCols} ${roomCols} ${rightLandCols} ${numberOfRows}`
    );
    let columns = '';
    columns += this.#landChr.repeat(leftLandCols);
    columns += this.#wallChr.repeat(roomCols);
    columns += this.#landChr.repeat(rightLandCols);
    this.#dungeon.push(columns.split(''));
    for (let internalRow = 0; internalRow < numberOfRows - 2; internalRow++) {
      columns = '';
      columns += this.#landChr.repeat(leftLandCols);
      columns += this.#wallChr;
      columns += this.#floorChr.repeat(roomCols - 2);
      columns += this.#wallChr;
      columns += this.#landChr.repeat(rightLandCols);
      this.#dungeon.push(columns.split(''));
    }
    columns = '';
    columns += this.#landChr.repeat(leftLandCols);
    columns += this.#wallChr.repeat(roomCols);
    columns += this.#landChr.repeat(rightLandCols);
    this.#dungeon.push(columns.split(''));
  }

  /** Go through the dungeon removing internal walls. */
  #removeInternalWalls() {
    for (let row = 1; row < this.#dungeon.length - 1; row++) {
      for (let col = 1; col < this.#dungeon[0].length - 2; col++) {
        if (
          this.#dungeon[row][col] === this.#wallChr &&
          this.#dungeon[row + 1][col] === this.#wallChr &&
          this.#dungeon[row - 1][col] === this.#floorChr &&
          this.#dungeon[row + 2][col] === this.#floorChr
        ) {
          this.#dungeon[row][col] = this.#floorChr;
          this.#dungeon[row + 1][col] = this.#floorChr;
        }
      }
    }
  }

  /**
   * Is this a vertical wall where a door could go.
   * @param {import('../arrays/arrayManip.js').Surrounds} surrounds
   * @returns {boolean}
   */
  #isVerticalWall(surrounds) {
    return (
      surrounds.above === this.#wallChr &&
      surrounds.centre === this.#wallChr &&
      surrounds.below === this.#wallChr
    );
  }
  /**
   * Is this a Horizontal wall where a door could go.
   * @param {import('../arrays/arrayManip.js').Surrounds} surrounds
   * @returns {boolean}
   */
  #isHorizontalWall(surrounds) {
    return (
      surrounds.left === this.#wallChr &&
      surrounds.centre === this.#wallChr &&
      surrounds.right === this.#wallChr
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
    this.#dungeon[location.row][location.col] = this.#entranceChr;
    location = randomLocations[1];
    this.#dungeon[location.row][location.col] = this.#exitChr;
  }
}

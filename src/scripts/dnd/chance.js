/**
 * @file Resolve events that depend on chance or dix roles.
 *
 * @module dnd/chance
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

import { rollDice } from '../utils/dice.js';

/**
 * Can actor hit opponent
 * @param {} actor - the person attempting to perform the action.
 * @param {*} opponent - the opposing actor
 * @returns {boolean}
 */
export function hits(actor, opponent) {
  return rollDice(20) > 10; // @ToDo
}

/**
 * Can actor evade opponent.
 * @param {} actor - the person attempting to perform the action.
 * @param {*} opponent - the opposing actor
 * @returns {boolean}
 */
export function evades(actor, opponent) {
  return rollDice(20) > 10; // @ToDo
}

/**
 * Can actor evade opponent.
 * @param {} actor - the person attempting to perform the action.
 * @param {*} opponent - the opposing actor
 * @returns {number} - amount of damage inflicted.
 */
export function damageInflicted(actor, opponent) {
  return rollDice(6); // @ToDo
}

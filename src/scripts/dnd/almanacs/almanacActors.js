/**
 * @file Almanac of different actor types
 *
 * @module dnd/almanacs/almanacActors
 */
/**
 * license {@link https://opensource.org/license/mit/|MIT}
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

import { ActorType } from '../..utils/game/actors.js';
/**
 * @typedef {Object} AlmanacEntry
 * @property {number} minLevel - minimum dungeon level at which this appears.
 * @property {string} id - ID used to locate it in the actor or artefact map.
 * @property {string} traits - string representation of traits.
 */

/** Almanac
 * @type {Object<string, AlmanacEntry>}
 */
const ALMANAC_OF_ACTORS = [
  { id: 'hero', type: ActorType.HERO, minLevel: 0, traits: 'HP:20|EXP:0|AC:1' },
  {
    id: 'orc',
    type: ActorType.ENEMY,
    minLevel: 0,
    traits: 'MOVE:HUNT|HP:2|EXP:0|AC:5',
  },
  {
    id: 'trader',
    type: ActorType.TRADER,
    minLevel: 0,
    traits: 'MOVE:WANDER|EXP:0|AC:1',
  },
];

export default ALMANAC_OF_ACTORS;

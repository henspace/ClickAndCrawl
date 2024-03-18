/**
 * @file Armour types
 *
 * @module dnd/almanacs/almanacArmour
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
import { ArtefactType } from '../..utils/game/artefacts.js';

const ALMANAC_OF_ARTEFACTS = [
  {
    id: 'copper_coins',
    minLevel: 0,
    type: ArtefactType.COINS,
    traits: 'COST:10>25 CP',
  },
  {
    id: 'silver_coins',
    minLevel: 0,
    type: ArtefactType.COINS,
    traits: 'COST:10>25 SP',
  },
  {
    id: 'gold_coins',
    minLevel: 0,
    type: ArtefactType.COINS,
    traits: 'COST:10>25 GP',
  },
  {
    id: 'platinum_coins',
    minLevel: 0,
    type: ArtefactType.COINS,
    traits: 'COST:10>25 PP',
  },
  {
    id: 'armour_padded',
    minLevel: 0,
    type: ArtefactType.ARMOUR,
    traits: 'AC:11|COST:5 GP',
  },
  {
    id: 'armour_leather',
    minLevel: 0,
    type: ArtefactType.ARMOUR,
    traits: 'AC:11|COST:10 GP',
  },
  {
    id: 'armour_studded_leather',
    minLevel: 0,
    type: ArtefactType.ARMOUR,
    traits: 'AC:12|COST:45 GP',
  },
  {
    id: 'armour_scale_mail',
    minLevel: 1,
    type: ArtefactType.ARMOUR,
    traits: 'AC:14|COST:50 GP',
  },
  {
    id: 'armour_half_plate',
    minLevel: 1,
    type: ArtefactType.ARMOUR,
    traits: 'AC:15|COST:750 GP',
  },
  {
    id: 'armour_ring_mail',
    minLevel: 1,
    type: ArtefactType.ARMOUR,
    traits: 'AC:14|COST:30 GP',
  },
  {
    id: 'armour_chain_mail',
    minLevel: 1,
    type: ArtefactType.ARMOUR,
    traits: 'AC:16|COST:75 GP',
  },
  {
    id: 'armour_plate',
    minLevel: 1,
    type: ArtefactType.ARMOUR,
    traits: 'AC:18|COST:1500 GP',
  },
  {
    id: 'club',
    minLevel: 0,
    type: ArtefactType.WEAPON,
    traits: 'COST: 1 SP|DMG:1d4',
  },
];

export default ALMANAC_OF_ARTEFACTS;

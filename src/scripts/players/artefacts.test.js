/**
 * @file Test artefacts
 *
 * @module players/artefacts.test
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

import { test, expect } from '@jest/globals';
import { Artefact } from './artefacts.js';
import { buildArtefact } from '../dnd/almanacs/artefactBuilder.js';
import { parseAlmanacLine } from '../dnd/almanacs/almanacs.js';
import { Traits, MagicTraits, CharacterTraits } from '../dnd/traits.js';

test('Artefact toJson and revive', () => {
  const almanacEntry = parseAlmanacLine(
    '0,UNCOMMON,CONSUMABLE,black_flask+healing * VALUE: 2SP, _TYPE: POTION, _HP:6',
    'ARTEFACTS'
  );
  const original = buildArtefact(almanacEntry);
  const asJson = JSON.stringify(original);
  const revived = JSON.parse(asJson, (key, value) => {
    switch (value?.reviver) {
      case 'Artefact':
        return Artefact.revive(value.data, buildArtefact);
      case 'Traits':
        return Traits.revive(value.data);
      case 'CharacterTraits':
        return CharacterTraits.revive(value.data);
      case 'MagicTraits':
        return MagicTraits.revive(value.data);
      default:
        return value;
    }
  });
  /* Remove items that should not be compared. */
  revived.interaction = undefined;
  original.interaction = undefined;
  if (original.almanacEntry.equipmentIds === undefined) {
    revived.almanacEntry.equipmentIds = undefined; // it won't have been parsed as JSON.
  }
  expect(revived).toStrictEqual(original);
});

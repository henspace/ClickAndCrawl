/**
 * @file Test actors
 *
 * @module players/actors.test
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
import { jest, test, expect } from '@jest/globals';

jest.unstable_mockModule('../utils/game/screen.js', () => {
  return {
    __esModule: true,
    default: {
      setOptions: () => null,
      getContext2D: () => null,
    },
    SCREEN: {
      setOptions: () => null,
      getContext2D: () => null,
    },
  };
});

await import('../utils/game/screen.js');
const { Artefact } = await import('./artefacts.js');
const { Actor } = await import('./actors.js');
const { buildArtefact } = await import('../dnd/almanacs/artefactBuilder.js');
const { parseAlmanacLine } = await import('../dnd/almanacs/almanacs.js');
const { Traits, MagicTraits, CharacterTraits } = await import(
  '../dnd/traits.js'
);
const { buildActor } = await import('../dnd/almanacs/actorBuilder.js');
const { Toxin } = await import('../dnd/toxins.js');

test('Actor toJson and revive', () => {
  const almanacEntry = parseAlmanacLine(
    '0,COMMON,HERO,fighter1 [chain_mail_armour,shield,shortsword,gold_coins] * CLASS:FIGHTER, HIT_DICE:1D12,EXP:0, AC:10,_SPEED:30 FEET,PROF:armour&shield',
    'HEROES'
  );
  const original = buildActor(almanacEntry);
  original.toxify.addToxicEffect(new Traits('DMG_PER_TURN:312'));
  const asJson = JSON.stringify(original);
  const revived = JSON.parse(asJson, (key, value) => {
    switch (value?.reviver) {
      case 'Actor':
        return Actor.revive(value.data, buildActor);
      case 'Toxin':
        return Toxin.revive(value.data);
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
  expect(original.toxify.getToxin().getChangeInHpThisTurn()).toBe(-312);
  expect(revived.toxify.getToxin().getChangeInHpThisTurn()).toBe(-312);
});

test('Actor toJson and revive with equipment', () => {
  const almanacEntry = parseAlmanacLine(
    '0,COMMON,HERO,fighter1 [chain_mail_armour,shield,shortsword,gold_coins] * CLASS:FIGHTER, HIT_DICE:1D12,EXP:0, AC:10,_SPEED:30 FEET,PROF:armour&shield',
    'HEROES'
  );
  const original = buildActor(almanacEntry);
  original.toxify.addToxicEffect(new Traits('DMG_PER_TURN:312'));

  const artefactEntry = parseAlmanacLine(
    '0,UNCOMMON,CONSUMABLE,black_flask+healing * VALUE: 2SP, _TYPE: POTION, _HP:6',
    'ARTEFACTS'
  );
  const originalArtefact = buildArtefact(artefactEntry);
  original.storeManager.addArtefact(originalArtefact);

  const asJson = JSON.stringify(original);
  const revived = JSON.parse(asJson, (key, value) => {
    switch (value?.reviver) {
      case 'Actor':
        return Actor.revive(value.data, buildActor);
      case 'Toxin':
        return Toxin.revive(value.data);
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

  const originalArtefactDetails =
    original.storeManager.getFirstStorageDetails();
  const revivedArtefactDetails = revived.storeManager.getFirstStorageDetails();
  expect(revivedArtefactDetails.artefact.id).toEqual(
    originalArtefactDetails.artefact.id
  );
  expect(revivedArtefactDetails.store).toEqual(originalArtefactDetails.store);
});

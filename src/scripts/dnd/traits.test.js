/**
 * @file Test traits
 *
 * @module dnd/traits.test
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
import * as traits from './traits.js';

const TEST_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

test('characteristicToModifier', () => {
  expect(traits.characteristicToModifier(1)).toEqual(-5);
  expect(traits.characteristicToModifier(2)).toEqual(-4);
  expect(traits.characteristicToModifier(3)).toEqual(-4);
  expect(traits.characteristicToModifier(4)).toEqual(-3);
  expect(traits.characteristicToModifier(10)).toEqual(0);
  expect(traits.characteristicToModifier(10)).toEqual(0);
  expect(traits.characteristicToModifier(28)).toEqual(9);
  expect(traits.characteristicToModifier(29)).toEqual(9);
  expect(traits.characteristicToModifier(30)).toEqual(10);
});

test('Traits: constructor and get', () => {
  const testTraits = new traits.Traits('HP:25, DMG:1d6, STR: 20');
  expect(testTraits.get('HP')).toBe('25');
  expect(testTraits.get('DMG')).toBe('1D6');
  expect(testTraits.get('STR')).toBe('20');
});

test('CharacterTraits: addition of magic', () => {
  const characterTraits = new traits.CharacterTraits(
    new Map([
      ['STR', 10],
      ['DEX', 11],
      ['CON', 12],
      ['INT', 13],
      ['WIS', 14],
      ['CHA', 15],
    ])
  );

  const spellTraits = new traits.Traits(
    new Map([
      ['FX_STR', 20],
      ['FX_DEX', 21],
      ['FX_CON', 22],
      ['FX_INT', 23],
      ['FX_WIS', 24],
      ['FX_CHA', 25],
    ])
  );

  characterTraits.utiliseAdditionalTraits({ magic: [spellTraits] });
  TEST_KEYS.forEach((key, index) => {
    const baseTrait = index + 10;
    const fxTrait = index + 20;
    expect(characterTraits.getInt(key)).toBe(baseTrait);
    expect(characterTraits.getEffectiveInt(key)).toBe(baseTrait + fxTrait);
  });
});

test('CharacterTraits.addTransientFxTraits', () => {
  const characterTraits = new traits.CharacterTraits(
    new Map([
      ['STR', 10],
      ['DEX', 11],
      ['CON', 12],
      ['INT', 13],
      ['WIS', 14],
      ['CHA', 15],
    ])
  );

  const transientTraitsA = new traits.Traits(
    new Map([
      ['FX_STR', 20],
      ['FX_DEX', 21],
      ['FX_CON', 22],
      ['FX_INT', 23],
      ['FX_WIS', 24],
      ['FX_CHA', 25],
    ])
  );
  const transientTraitsB = new traits.Traits(
    new Map([
      ['FX_STR', 30],
      ['FX_DEX', 31],
      ['FX_CON', 32],
      ['FX_INT', 33],
      ['FX_WIS', 34],
      ['FX_CHA', 35],
    ])
  );
  characterTraits.addTransientFxTraits(transientTraitsA);
  characterTraits.addTransientFxTraits(transientTraitsB);
  TEST_KEYS.forEach((key, index) => {
    const baseTrait = 10 + index;
    const traitA = 20 + index;
    const traitB = 30 + index;
    expect(characterTraits.getInt(key)).toBe(baseTrait);
    expect(characterTraits.getEffectiveInt(key)).toBe(
      baseTrait + traitA + traitB
    );
  });
});

test('CharacterTraits.getMaxTilesPerMove', () => {
  const speedInTiles = 21;
  const speedInFeet = 21 * 7.5;
  const characterTraits = new traits.CharacterTraits(
    new Map([
      ['SPEED', `${speedInFeet} FEET`],
      ['DEX', 11],
      ['CON', 12],
      ['INT', 13],
      ['WIS', 14],
      ['CHA', 15],
    ])
  );
  expect(characterTraits.getMaxTilesPerMove()).toEqual(speedInTiles);
});

test('CharacterTraits.clone', () => {
  const characterTraits = new traits.CharacterTraits(
    new Map([
      ['STR', 10],
      ['DEX', 11],
    ])
  );

  const transientTraits = new traits.Traits(
    new Map([
      ['FX_STR', 20],
      ['FX_DEX', 21],
    ])
  );

  const weaponTraits = new traits.Traits(
    new Map([
      ['DMG', '3D6'],
      ['TYPE', 'LIGHT FINESSE'],
    ])
  );

  characterTraits.addTransientFxTraits(transientTraits);
  characterTraits.utiliseAdditionalTraits({
    weapons: [weaponTraits],
  });

  const clone = characterTraits.clone();
  expect(clone).toStrictEqual(characterTraits);
});

test('CharacterTraits.clearTransientFxTraits', () => {
  const characterTraits = new traits.CharacterTraits(
    new Map([
      ['STR', 10],
      ['DEX', 11],
      ['CON', 12],
      ['INT', 13],
      ['WIS', 14],
      ['CHA', 15],
    ])
  );

  const transientTraits = new traits.Traits(
    new Map([
      ['FX_STR', 20],
      ['FX_DEX', 21],
      ['FX_CON', 22],
      ['FX_INT', 23],
      ['FX_WIS', 24],
      ['FX_CHA', 25],
    ])
  );

  characterTraits.addTransientFxTraits(transientTraits);
  TEST_KEYS.forEach((key, index) => {
    const baseTrait = 10 + index;
    const fxTrait = 20 + index;
    expect(characterTraits.getInt(key)).toBe(baseTrait);
    expect(characterTraits.getEffectiveInt(key)).toBe(baseTrait + fxTrait);
  });
  characterTraits.clearTransientFxTraits();
  TEST_KEYS.forEach((key, index) => {
    const baseTrait = 10 + index;
    expect(characterTraits.getInt(key)).toBe(baseTrait);
    expect(characterTraits.getEffectiveInt(key)).toBe(baseTrait);
  });
});

test('CharacterTraits.toFxKey', () => {
  expect(traits.CharacterTraits.toFxKey('CHA')).toEqual('FX_CHA');
});

test('Characteristics.hasEffective', () => {
  const characterTraits = new traits.CharacterTraits(new Map([['STR', 10]]));
  const transientTraits = new traits.Traits(new Map([['FX_DEX', 21]]));
  characterTraits.addTransientFxTraits(transientTraits);
  expect(characterTraits.hasEffective('STR')).toBe(true);
  expect(characterTraits.hasEffective('DEX')).toBe(true);
  expect(characterTraits.hasEffective('SPEED')).toBe(false);
});

test('CharacterTraits.adjustForDefeatOfActor', () => {
  const initialExp = 6499;
  const cr = 4;
  const expForCr = 1100; // see https://5e.d20srd.org/srd/monsters/intro.htm
  // From https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf p56
  const expectedPb = 3;
  const expectedInitialLevel = 4;
  const expectedLevel = 5;
  const characterTraits = new traits.CharacterTraits(
    new Map([
      ['EXP', initialExp],
      ['PROF', 'ARMOUR'],
    ])
  );
  const defeatedTraits = new traits.CharacterTraits(new Map([['CR', cr]]));
  const result = characterTraits.adjustForDefeatOfActor(defeatedTraits);
  expect(result.exp.was).toEqual(initialExp);
  expect(result.level.was).toEqual(expectedInitialLevel);
  expect(result.exp.now).toEqual(initialExp + expForCr);
  expect(result.level.now).toEqual(expectedLevel);
  expect(characterTraits.getCharacterLevel()).toEqual(expectedLevel);
  expect(
    characterTraits.getCharacterPb(
      new traits.Traits(new Map([['TYPE', 'ARMOUR']]))
    )
  ).toEqual(expectedPb);
});

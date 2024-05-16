/**
 * @file Test functions for handling magic.
 *
 * @module dnd/magic.test
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
import { CharacterTraits, MagicTraits, Traits } from './traits.js';
import { getMinExpPointsForLevel } from './tables.js';
import * as magic from './magic.js';

test('canActorLearnMagic - checks casters', () => {
  const actorTraits = new CharacterTraits(
    `EXP:${getMinExpPointsForLevel(20)}, CLASS:FIGHTER`
  );
  let magicTraits = new Traits('LEVEL:0');
  expect(magic.canActorLearnMagic(actorTraits, magicTraits)).toBe(true);

  magicTraits = new Traits('LEVEL:0, CASTERS: DRUID MONK FIGHTER');
  expect(magic.canActorLearnMagic(actorTraits, magicTraits)).toBe(true);

  magicTraits = new Traits('LEVEL:0, CASTERS: DRUID MONK');
  expect(magic.canActorLearnMagic(actorTraits, magicTraits)).toBe(false);
});

test('canActorLearnMagic - checks level', () => {
  let actorTraits = new CharacterTraits(
    `EXP:${getMinExpPointsForLevel(1)}, CLASS:FIGHTER`
  );
  let magicTraits = new Traits('LEVEL:0, CASTERS:FIGHTER');
  expect(magic.canActorLearnMagic(actorTraits, magicTraits)).toBe(true);
  magicTraits = new Traits('LEVEL:1, CASTERS:FIGHTER');
  expect(magic.canActorLearnMagic(actorTraits, magicTraits)).toBe(true);
  magicTraits = new Traits('LEVEL:2, CASTERS:FIGHTER');
  expect(magic.canActorLearnMagic(actorTraits, magicTraits)).toBe(false);

  actorTraits = new CharacterTraits(
    `EXP:${getMinExpPointsForLevel(17)}, CLASS:FIGHTER`
  );
  magicTraits = new Traits('LEVEL:9, CASTERS:FIGHTER');
  expect(magic.canActorLearnMagic(actorTraits, magicTraits)).toBe(true);
});

test('getSpellPower', () => {
  expect(magic.getSpellPower(new Traits(''))).toBe(1);
  expect(magic.getSpellPower(new Traits('LEVEL:1'))).toBe(1);
  expect(magic.getSpellPower(new Traits('LEVEL:9'))).toBe(6);
});

test('useCastingPower', () => {
  for (let level = 1; level <= 9; level++) {
    const spellTraits = new Traits(`LEVEL:${level}`);
    const power = magic.getSpellPower(spellTraits);
    expect(power).toBeGreaterThanOrEqual(1);
    const castingPower = 100;
    const casterTraits = new Traits(`CASTING_POWER:${castingPower}`);
    magic.useCastingPower(casterTraits, spellTraits);
    expect(casterTraits.getInt('CASTING_POWER')).toBe(castingPower - power);
  }
  const spellTraits = new Traits(`LEVEL:9`);
  const power = magic.getSpellPower(spellTraits);
  const castingPower = 1;
  const casterTraits = new Traits(`CASTING_POWER:${castingPower}`);
  magic.useCastingPower(casterTraits, spellTraits);
  expect(power).toBeGreaterThanOrEqual(1);
  expect(casterTraits.getInt('CASTING_POWER')).toBe(0);
});

test('canCasterCastSpell', () => {
  for (let level = 1; level <= 9; level++) {
    const spellTraits = new Traits(`LEVEL:${level}`);
    const power = magic.getSpellPower(spellTraits);
    expect(power).toBeGreaterThanOrEqual(1);
    // not enough power
    let castingPower = power - 1;
    let casterTraits = new Traits(`CASTING_POWER:${castingPower}`);
    expect(magic.canCastSpell(casterTraits, spellTraits)).toBe(false);

    // exactly enough power
    castingPower = power;
    casterTraits = new Traits(`CASTING_POWER:${castingPower}`);
    expect(magic.canCastSpell(casterTraits, spellTraits)).toBe(true);

    // more than enough power
    castingPower = power + 1;
    casterTraits = new Traits(`CASTING_POWER:${castingPower}`);
    expect(magic.canCastSpell(casterTraits, spellTraits)).toBe(true);
  }
});

test('restoreCastingPower', () => {
  for (let characterLevel = 1; characterLevel <= 20; characterLevel++) {
    let casterTraits = new CharacterTraits(
      `EXP:${getMinExpPointsForLevel(characterLevel)}, CASTING_POWER:0`
    );
    expect(casterTraits.getCharacterLevel()).toBe(characterLevel);
    const expectedPower = Math.round(
      4 * (2 + (20 * (characterLevel - 1)) / 19)
    );
    expect(magic.restoreCastingPower(casterTraits)).toBe(expectedPower);
    expect(casterTraits.getInt('CASTING_POWER')).toBe(expectedPower);
  }
});

test('getCasting power creates power if non existent', () => {
  for (let characterLevel = 1; characterLevel <= 20; characterLevel++) {
    let casterTraits = new CharacterTraits(
      `EXP:${getMinExpPointsForLevel(characterLevel)}`
    );
    expect(casterTraits.getCharacterLevel()).toBe(characterLevel);
    const expectedPower = Math.round(
      4 * (2 + (20 * (characterLevel - 1)) / 19)
    );
    const result = magic.getCastingPower(casterTraits);
    expect(result).toBe(expectedPower);
    expect(casterTraits.getInt('CASTING_POWER')).toBe(expectedPower);
  }
});

test('getCasting power leaves if exists', () => {
  const expectedPower = 3;
  let casterTraits = new CharacterTraits(
    `EXP:10000, CASTING_POWER:${expectedPower}}`
  );
  const result = magic.getCastingPower(casterTraits);
  expect(result).toBe(expectedPower);
  expect(casterTraits.getInt('CASTING_POWER')).toBe(expectedPower);
});

test('useCastingPower creates casting power if non-existent', () => {
  const characterLevel = 6;
  const expectedFullPower = Math.round(
    4 * (2 + (20 * (characterLevel - 1)) / 19)
  );
  let casterTraits = new CharacterTraits(
    `EXP:${getMinExpPointsForLevel(characterLevel)}`
  );
  expect(casterTraits.has('CASTING_POWER')).toBe(false);
  const spellTraits = new Traits(`LEVEL:6`);
  const spellPower = magic.getSpellPower(spellTraits);
  magic.useCastingPower(casterTraits, spellTraits);
  const remainingPower = casterTraits.getInt('CASTING_POWER');
  expect(remainingPower).toBe(expectedFullPower - spellPower);
});

test('canCastingSpell creates casting power if non-existent', () => {
  const characterLevel = 6;
  const expectedFullPower = Math.round(
    4 * (2 + (20 * (characterLevel - 1)) / 19)
  );
  let casterTraits = new CharacterTraits(
    `EXP:${getMinExpPointsForLevel(characterLevel)}`
  );
  expect(casterTraits.has('CASTING_POWER')).toBe(false);
  const spellTraits = new Traits(`LEVEL:1`);
  const spellPower = magic.getSpellPower(spellTraits);
  expect(spellPower).toBeLessThan(expectedFullPower);
  magic.canCastSpell(casterTraits, spellTraits);
  const remainingPower = casterTraits.getInt('CASTING_POWER');
  expect(remainingPower).toBe(expectedFullPower);
});

test('canBless: default maxTargetHp', () => {
  let maxTargetHp = 1; // default
  let casterTraits = new CharacterTraits(''); // unused

  let spellTraits = new MagicTraits('');
  // target hp < maxTargetHp
  let targetTraits = new CharacterTraits(`HP:${maxTargetHp - 1}`);
  expect(magic.canBless(casterTraits, targetTraits, spellTraits)).toEqual(true);
  // target hp == maxTargetHp
  targetTraits = new CharacterTraits(`HP:${maxTargetHp}`);
  expect(magic.canBless(casterTraits, targetTraits, spellTraits)).toEqual(true);
  // target hp > maxTargetHp
  targetTraits = new CharacterTraits(`HP:${maxTargetHp + 1}`);
  expect(magic.canBless(casterTraits, targetTraits, spellTraits)).toEqual(
    false
  );
});

test('canBless: defined maxTargetHp', () => {
  let maxTargetHp = 11; // default
  let casterTraits = new CharacterTraits(''); // unused

  let spellTraits = new MagicTraits(`MAX_TARGET_HP:${maxTargetHp}`);
  // target hp < maxTargetHp
  let targetTraits = new CharacterTraits(`HP:${maxTargetHp - 1}`);
  expect(magic.canBless(casterTraits, targetTraits, spellTraits)).toEqual(true);
  // target hp == maxTargetHp
  targetTraits = new CharacterTraits(`HP:${maxTargetHp}`);
  expect(magic.canBless(casterTraits, targetTraits, spellTraits)).toEqual(true);
  // target hp > maxTargetHp
  targetTraits = new CharacterTraits(`HP:${maxTargetHp + 1}`);
  expect(magic.canBless(casterTraits, targetTraits, spellTraits)).toEqual(
    false
  );
});

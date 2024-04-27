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

/**
 * Convert an ability to a modifier based on 5e rules.
 * @param {number} abilityValue
 * @returns {number}
 */
function abilityToModifier(abilityValue) {
  return Math.floor((abilityValue - 10) / 2);
}

test('characteristicToModifier', () => {
  for (let value = 1; value <= 30; value++) {
    expect(traits.characteristicToModifier(value)).toEqual(
      abilityToModifier(value)
    );
  }
});

/**
 * Test Attack class
 */
test('AttackDetail.getMaxDamage', () => {
  const abilityModifier = 4;
  let attack = new traits.AttackDetail({
    damageDice: '3D6',
    weaponType: 'UNARMED',
    proficiencyBonus: 10,
    abilityModifier: abilityModifier,
  });
  expect(attack.getMaxDamage()).toEqual(1 + abilityModifier);

  attack = new traits.AttackDetail({
    damageDice: '3D6',
    weaponType: 'MARTIAL',
    proficiencyBonus: 10,
    abilityModifier: abilityModifier,
    secondAttack: false,
  });
  expect(attack.getMaxDamage()).toEqual(18 + abilityModifier); //3D6 +
});

test('AttackDetail.canUseTwoWeapons', () => {
  const abilityModifier = 4;
  let attack = new traits.AttackDetail({
    damageDice: '3D6',
    weaponType: 'UNARMED',
    proficiencyBonus: 10,
    abilityModifier: abilityModifier,
  });
  expect(attack.canUseTwoWeapons()).toEqual(false);

  attack = new traits.AttackDetail({
    damageDice: '3D6',
    weaponType: 'SIMPLE MELEE',
    proficiencyBonus: 10,
    abilityModifier: abilityModifier,
    secondAttack: false,
  });
  expect(attack.canUseTwoWeapons()).toEqual(false);

  attack = new traits.AttackDetail({
    damageDice: '3D6',
    weaponType: 'SIMPLE LIGHT SWORD',
    proficiencyBonus: 10,
    abilityModifier: abilityModifier,
    secondAttack: false,
  });
  expect(attack.canUseTwoWeapons()).toEqual(true);
});

test('AttackDetails.rollForAttack', () => {
  const abilityModifier = 4;
  const proficiencyBonus = 10;
  const diceN = 3;
  const diceSides = 6;
  let attack = new traits.AttackDetail({
    damageDice: `${diceN}D${diceSides}`,
    weaponType: 'MARTIAL',
    proficiencyBonus: proficiencyBonus,
    abilityModifier: abilityModifier,
  });
  for (let roll = 0; roll < 20; roll++) {
    const attackRoll = attack.rollForAttack();
    expect(attackRoll.roll).toBeGreaterThanOrEqual(1);
    expect(attackRoll.roll).toBeLessThanOrEqual(20);
    expect(attackRoll.value).toEqual(
      attackRoll.roll + abilityModifier + proficiencyBonus
    );
  }
});

test('AttackDetails.rollForDamage', () => {
  const abilityModifier = 4;
  const proficiencyBonus = 10;
  const diceN = 3;
  const diceSides = 6;
  let attack = new traits.AttackDetail({
    damageDice: `${diceN}D${diceSides}`,
    weaponType: 'UNARMED',
    proficiencyBonus: proficiencyBonus,
    abilityModifier: abilityModifier,
  });
  expect(attack.rollForDamage()).toEqual(1 + abilityModifier);

  attack = new traits.AttackDetail({
    damageDice: `${diceN}D${diceSides}`,
    weaponType: 'MARTIAL',
    proficiencyBonus: proficiencyBonus,
    abilityModifier: abilityModifier,
  });
  for (let roll = 0; roll < 20; roll++) {
    const damage = attack.rollForDamage();
    expect(damage).toBeGreaterThanOrEqual(diceN + abilityModifier);
    expect(damage).toBeLessThanOrEqual(diceN * diceSides + abilityModifier);
  }
});

test('AttackDetail.clone', () => {
  let attack = new traits.AttackDetail({
    damageDice: `4D8}`,
    weaponType: 'MARTIAL',
    proficiencyBonus: 21,
    abilityModifier: 13,
  });
  const clone = attack.clone();
  expect(clone).toStrictEqual(attack);
});

/**
 * Test Traits
 */

test('Traits: constructor', () => {
  let testTraits = new traits.Traits('HP:25, DMG:1d6, STR: 20');
  expect(testTraits.get('HP')).toBe('25');
  expect(testTraits.get('DMG')).toBe('1D6');
  expect(testTraits.get('STR')).toBe('20');

  testTraits = new traits.Traits(
    new Map([
      ['PROPA', 'valueA'],
      ['PROPB', 'valueB'],
    ])
  );
  expect(testTraits.get('PROPA')).toEqual('valueA');
  expect(testTraits.get('PROPB')).toEqual('valueB');
});

test('Traits.constructor PROF', () => {
  const testTraits = new traits.Traits('PROF:value A & value B & value C');
  const proficiencies = testTraits.get('PROF');
  expect(proficiencies).toHaveLength(3);
  expect(proficiencies[0]).toEqual('VALUE A');
  expect(proficiencies[1]).toEqual('VALUE B');
  expect(proficiencies[2]).toEqual('VALUE C');
});

test('Traits.constructor VALUE', () => {
  let testTraits = new traits.Traits('VALUE:20SP');
  expect(testTraits.get('VALUE')).toEqual('20 SP');
  for (let roll = 0; roll < 20; roll++) {
    const diceCount = 3;
    const diceSides = 8;
    testTraits = new traits.Traits(`VALUE:${diceCount}D${diceSides}SP`);
    const result = testTraits.get('VALUE');
    expect(result).toMatch(/\d{1,2} SP/);
    const value = parseInt(result);
    expect(value).toBeGreaterThanOrEqual(diceCount);
    expect(value).toBeLessThanOrEqual(diceCount * diceSides);
  }
});

test('Traits.constructor DMG', () => {
  let testTraits = new traits.Traits('DMG:3D12');
  expect(testTraits.get('DMG')).toEqual('3D12');
  testTraits = new traits.Traits('DMG:99');
  expect(testTraits.get('DMG')).toEqual(99);
  testTraits = new traits.Traits('DMG:INVALID');
  expect(testTraits.get('DMG')).toEqual(0);
});

test('Traits.constructor HIT_DICE', () => {
  let testTraits = new traits.Traits('HIT_DICE:3D12');
  expect(testTraits.get('HIT_DICE')).toEqual('3D12');
  testTraits = new traits.Traits('HIT_DICE:3');
  expect(testTraits.get('HIT_DICE')).toEqual('1D6');
  testTraits = new traits.Traits('HIT_DICE:GARBAGE');
  expect(testTraits.get('HIT_DICE')).toEqual('1D6');
});

test('Traits.constructor boolean', () => {
  let testTraits = new traits.Traits('A:yEs, B:tRue, C:nO, D: faLse');
  expect(testTraits.get('A')).toBe(true);
  expect(testTraits.get('B')).toBe(true);
  expect(testTraits.get('C')).toBe(false);
  expect(testTraits.get('D')).toBe(false);
});

test('Traits.constructor dice roll', () => {
  for (let roll = 0; roll < 20; roll++) {
    const diceCount = 3;
    const diceSides = 8;
    let testTraits = new traits.Traits(`A:${diceCount}D${diceSides}`);
    expect(testTraits.getInt('A')).toBeGreaterThanOrEqual(diceCount);
    expect(testTraits.getInt('A')).toBeLessThanOrEqual(diceCount * diceSides);
  }
});

test('Traits.constructor case imposition', () => {
  const str = 'A Name of Mixed Case';
  const testTraits = new traits.Traits(`NAME:${str}, OTHER:${str}`);
  expect(testTraits.get('NAME')).toBe(str);
  expect(testTraits.get('OTHER')).toBe(str.toUpperCase());
});

test('Traits.has', () => {
  const testTraits = new traits.Traits('PROPA:valueA, PROPB:valueB');
  testTraits.set('PROPC', 68);
  expect(testTraits.has('PROPA')).toBe(true);
  expect(testTraits.has('PROPB')).toBe(true);
  expect(testTraits.has('PROPC')).toBe(true);
});

test('Traits.get', () => {
  const testTraits = new traits.Traits('PROPA:valueA, PROPB:valueB');
  expect(testTraits.get('PROPA', 'defA')).toEqual('VALUEA');
  expect(testTraits.get('PROPB', 'defB')).toEqual('VALUEB');
  expect(testTraits.get('PROPC')).toBeUndefined();
  expect(testTraits.get('PROPC', 'defC')).toEqual('defC');
});

test('Traits.getInt', () => {
  const testTraits = new traits.Traits('PROPA:30, PROPB:40 FEET, PROPC:NAN');
  expect(testTraits.getInt('PROPA', 99)).toEqual(30);
  expect(testTraits.getInt('PROPB', 99)).toEqual(40);
  expect(testTraits.getInt('PROPC')).toEqual(0);
  expect(testTraits.getInt('PROPC', 99)).toEqual(99);
  expect(testTraits.getInt('PROPD')).toEqual(0);
});

test('Traits.addInt', () => {
  const testTraits = new traits.Traits('PROPA:30, PROPB:40 FEET, PROPC:NAN');
  expect(testTraits.getInt('PROPA')).toEqual(30);

  testTraits.addInt('PROPA', 1);
  expect(testTraits.getInt('PROPA')).toEqual(31);

  testTraits.addInt('PROPA', 'NAN');
  expect(testTraits.getInt('PROPA')).toEqual(31);

  testTraits.addInt('PROPC', 99);
  expect(testTraits.get('PROPC')).toEqual(99);
});

test('Traits.getValueInFeetInTiles', () => {
  const feet = 67;
  const tiles = Math.round(feet / 7.5);
  const testTraits = new traits.Traits(`PROPA:${feet} FEET`);
  expect(testTraits.getValueInFeetInTiles('PROPA')).toEqual(tiles);
});

test('Traits.feetToTiles', () => {
  const feet = 367;
  const tiles = Math.round(feet / 7.5);
  expect(traits.Traits.feetToTiles(feet)).toEqual(tiles);
});

test('Traits.getFloat', () => {
  const testTraits = new traits.Traits(
    'PROPA:30.123, PROPB:40.567 FEET, PROPC:NAN'
  );
  expect(testTraits.getFloat('PROPA', 99)).toBeCloseTo(30.123, 2);
  expect(testTraits.getFloat('PROPB', 99)).toBeCloseTo(40.567, 2);
  expect(testTraits.getFloat('PROPC')).toEqual(0);
  expect(testTraits.getFloat('PROPC', 99)).toEqual(99);
  expect(testTraits.getFloat('PROPD')).toEqual(0);
});

test('Traits.getAsModifier', () => {
  for (let value = 1; value <= 30; value++) {
    const mod = abilityToModifier(value);
    const testTraits = new traits.Traits(`PROP:${value}`);
    expect(testTraits.getAsModifier('PROP')).toEqual(mod);
  }
});

test('Traits.clone', () => {
  let testTraits = new traits.Traits('A:yEs, B:tRue, DMG:1D6');
  expect(testTraits.clone()).toStrictEqual(testTraits);
});

test('Traits.getAllTraits', () => {
  let testTraits = new traits.Traits('A:10,B:20');
  const allTraits = testTraits.getAllTraits();
  expect(allTraits.size).toEqual(2);
  allTraits.forEach((value, key) => {
    expect(value).toBe(testTraits.get(key));
  });
  allTraits.set('A', 100);
  expect(allTraits.get('A')).toEqual(100);
  expect(testTraits.get('A')).toEqual('10');
});

test('Traits.getAllTraitsSorted', () => {
  let testTraits = new traits.Traits('C:LETTERC,A:LETTERA,B:LETTERB');
  const allTraits = testTraits.getAllTraitsSorted();
  const entries = [...allTraits.entries()];
  expect(entries).toHaveLength(3);
  expect(entries[0][0]).toBe('A');
  expect(entries[0][1]).toBe('LETTERA');

  expect(entries[1][0]).toBe('B');
  expect(entries[1][1]).toBe('LETTERB');

  expect(entries[2][0]).toBe('C');
  expect(entries[2][1]).toBe('LETTERC');
});

test('Traits.valuesToString', () => {
  const testTraits = new traits.Traits(
    'KEYA: first, KEYB: second, KEYC: third'
  );
  expect(testTraits.valuesToString()).toBe('KEYA:FIRST,KEYB:SECOND,KEYC:THIRD');
});

/**
 * Test MagicTraits
 */
test('MagicTraits.getDamageDiceWhenCastBy', () => {
  const actorTraits = new traits.CharacterTraits('EXP:48000'); // gives level 9 based on p56 of DnD5e
  const characterLevel = actorTraits.getCharacterLevel();
  expect(characterLevel).toBe(9);
  const baseDiceCount = 3;
  const diceSides = 8;
  const dicePerLevel = 2.5;
  const expectedDiceCount =
    Math.floor((characterLevel - 1) * dicePerLevel) + baseDiceCount;
  const magicTraits = new traits.MagicTraits(
    `DMG:${baseDiceCount}D${diceSides}, DICE_PER_LEVEL:${dicePerLevel}`
  );

  expect(magicTraits.getDamageDiceWhenCastBy(actorTraits)).toEqual(
    `${expectedDiceCount}D${diceSides}`
  );
});

/**
 * Test character traits
 */
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

test('CharacterTraits.getEffective', () => {
  const characterTraits = new traits.CharacterTraits('STR:12, DEX:13, DMG:3D6');
  characterTraits.addTransientFxTraits(new traits.Traits('FX_STR:10'));
  expect(characterTraits.getEffective('STR')).toEqual(22);
  expect(characterTraits.getEffective('DEX')).toEqual(13);
  expect(characterTraits.getEffective('DMG')).toEqual('3D6');
  expect(characterTraits.getEffective('ANO', 'myFallback')).toEqual(
    'myFallback'
  );
});

test('CharacterTraits.getEffectiveInt', () => {
  const characterTraits = new traits.CharacterTraits(
    'STR:12, DEX:13, NUM:100 DAYS, WORD:STUFF'
  );
  characterTraits.addTransientFxTraits(new traits.Traits('FX_STR:10'));
  expect(characterTraits.getEffectiveInt('STR')).toEqual(22);
  expect(characterTraits.getEffectiveInt('NUM')).toEqual(100);
  expect(characterTraits.getEffectiveInt('WORD')).toEqual(0);
  expect(characterTraits.getEffectiveInt('WORD', 999)).toEqual(999);
});

test('CharacterTraits.getCharacterLevel', () => {
  // see https://5e.d20srd.org/srd/monsters/intro.htm
  // From https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf p56
  const initialExp = 6499;
  const expectedLevel = 4;
  const characterTraits = new traits.CharacterTraits(`EXP: ${initialExp}`);
  expect(characterTraits.getCharacterLevel()).toEqual(expectedLevel);
});

test('CharacterTraits.getNonMeleeSaveAbilityModifier', () => {
  const conAbility = 5;
  const dexAbility = 30;

  const characterTraits = new traits.CharacterTraits(
    `CON:${conAbility}, DEX:${dexAbility}`
  );
  expect(
    characterTraits.getNonMeleeSaveAbilityModifier(
      new traits.Traits('SAVE_ABILITY:CON')
    )
  ).toEqual(abilityToModifier(conAbility));

  expect(
    characterTraits.getNonMeleeSaveAbilityModifier(
      new traits.Traits('SAVE_ABILITY:DEX')
    )
  ).toEqual(abilityToModifier(dexAbility));

  expect(
    characterTraits.getNonMeleeSaveAbilityModifier(new traits.Traits('STR:10'))
  ).toEqual(0);
});

test('CharacterTraits.getCharacterPb', () => {
  // see https://5e.d20srd.org/srd/monsters/intro.htm
  // From https://media.wizards.com/2023/downloads/dnd/SRD_CC_v5.1.pdf p56
  const initialExp = 120000;
  const expectedPb = 5;
  const characterTraits = new traits.CharacterTraits(
    `EXP: ${initialExp}, PROF:ARMOUR`
  );
  expect(
    characterTraits.getCharacterPb(new traits.Traits('TYPE:STUFF'))
  ).toEqual(0);
  expect(
    characterTraits.getCharacterPb(new traits.Traits('TYPE:ARMOUR'))
  ).toEqual(expectedPb);
});

test('CharacterTraits.getAttacks unarmed', () => {
  const strength = 14;
  const chrTraits = new traits.CharacterTraits(`EXP:100000, STR:${strength}`);
  const expectProfPb = 4; // from page 56 of 5e
  const expectAbilityMod = abilityToModifier(strength);
  const attacks = chrTraits.getAttacks();
  expect(attacks).toHaveLength(1);
  expect(attacks[0].unarmed).toBe(true);
  expect(attacks[0].damageDice).toEqual('');
  expect(attacks[0].proficiencyBonus).toEqual(expectProfPb);
  expect(attacks[0].abilityModifier).toEqual(expectAbilityMod);
  expect(attacks[0].canUseTwoWeapons()).toEqual(false);
});

test('CharacterTraits.getAttacks pick best weapon (second). Not proficient', () => {
  const strength = 14;
  const chrTraits = new traits.CharacterTraits(`EXP:100000, STR:${strength}`);
  //const expectProfPb = 4; // from page 56 of 5e
  const expectAbilityMod = abilityToModifier(strength);
  chrTraits.utiliseAdditionalTraits({
    weapons: [
      new traits.Traits('TYPE:MARTIAL MELEE, DMG:1D6'),
      new traits.Traits('TYPE:MARTIAL MELEE, DMG:3D6'),
    ],
  });
  const attacks = chrTraits.getAttacks();
  expect(attacks).toHaveLength(1);
  expect(attacks[0].unarmed).toBe(false);
  expect(attacks[0].damageDice).toEqual('3D6');
  expect(attacks[0].proficiencyBonus).toEqual(0);
  expect(attacks[0].abilityModifier).toEqual(expectAbilityMod);
  expect(attacks[0].canUseTwoWeapons()).toEqual(false);
});

test('CharacterTraits.getAttacks pick best weapon (first). Proficient', () => {
  const strength = 14;
  const chrTraits = new traits.CharacterTraits(
    `EXP:100000, STR:${strength}, PROF:MARTIAL`
  );
  const expectProfBonus = 4; // from page 56 of 5e
  const expectAbilityMod = abilityToModifier(strength);
  chrTraits.utiliseAdditionalTraits({
    weapons: [
      new traits.Traits('TYPE:MARTIAL MELEE, DMG:5D6'),
      new traits.Traits('TYPE:MARTIAL MELEE, DMG:3D6'),
    ],
  });
  const attacks = chrTraits.getAttacks();
  expect(attacks).toHaveLength(1);
  expect(attacks[0].unarmed).toBe(false);
  expect(attacks[0].damageDice).toEqual('5D6');
  expect(attacks[0].proficiencyBonus).toEqual(expectProfBonus);
  expect(attacks[0].abilityModifier).toEqual(expectAbilityMod);
  expect(attacks[0].canUseTwoWeapons()).toEqual(false);
});

test('CharacterTraits.getAttacks Two weapon. First proficient', () => {
  // test with +ve and -ve ability modifiers
  for (const strength of [3, 14]) {
    const chrTraits = new traits.CharacterTraits(
      `EXP:100000, STR:${strength}, PROF:SHARP`
    );
    const expectProfBonus = 4; // from page 56 of 5e
    const expectAbilityMod = abilityToModifier(strength);
    const expectedSecondAbilityMod =
      expectAbilityMod < 0 ? expectAbilityMod : 0;
    chrTraits.utiliseAdditionalTraits({
      weapons: [
        new traits.Traits('TYPE:LIGHT SIMPLE MELEE SHARP, DMG:5D6'),
        new traits.Traits('TYPE:MELEE SIMPLE LIGHT, DMG:3D6'),
      ],
    });
    const attacks = chrTraits.getAttacks();
    expect(attacks).toHaveLength(2);
    expect(attacks[0].unarmed).toBe(false);
    expect(attacks[0].damageDice).toEqual('5D6');
    expect(attacks[0].proficiencyBonus).toEqual(expectProfBonus);
    expect(attacks[0].abilityModifier).toEqual(expectAbilityMod);
    expect(attacks[0].canUseTwoWeapons()).toEqual(true);

    expect(attacks[1].unarmed).toBe(false);
    expect(attacks[1].damageDice).toEqual('3D6');
    expect(attacks[1].proficiencyBonus).toEqual(0);
    expect(attacks[1].abilityModifier).toEqual(expectedSecondAbilityMod);
    expect(attacks[1].canUseTwoWeapons()).toEqual(true);
  }
});

test('CharacterTraits.utiliseAdditionalTraits: weapons', () => {
  console.log('No test necessary as covered by getAttacks testing.');
});

test('CharacterTraits.utiliseAdditionalTraits: magic', () => {
  const chrTraits = new traits.CharacterTraits(
    'STR:10,DEX:11,CON:12,INT:13,WIS:14,CHA:15'
  );

  const addedTraits = new traits.Traits(
    'FX_STR:20,FX_DEX:21,FX_CON:22,FX_INT:23,FX_WIS:24,FX_CHA:25'
  );

  chrTraits.utiliseAdditionalTraits({ magic: [addedTraits] });
  TEST_KEYS.forEach((key, index) => {
    const baseTrait = index + 10;
    const fxTrait = index + 20;
    expect(chrTraits.getInt(key)).toBe(baseTrait);
    expect(chrTraits.getEffectiveInt(key)).toBe(baseTrait + fxTrait);
  });
});

test('CharacterTraits.utiliseAdditionalTraits: armour: pick best', () => {
  const chrTraits = new traits.CharacterTraits('STR:10,AC:10,DEX:10');

  const addedArmour = [
    new traits.Traits('AC:12'),
    new traits.Traits('AC:16'),
    new traits.Traits('AC:11'),
  ];
  chrTraits.utiliseAdditionalTraits({ armour: addedArmour });
  expect(chrTraits.getInt('AC')).toBe(10);
  expect(chrTraits.getEffectiveInt('AC')).toBe(16);
});

test('CharacterTraits.utiliseAdditionalTraits: armour: pick best and add additions', () => {
  const chrTraits = new traits.CharacterTraits('STR:10,AC:10,DEX:10');

  const addedArmour = [
    new traits.Traits('AC:12'),
    new traits.Traits('AC:16'),
    new traits.Traits('AC:11'),
    new traits.Traits('AC:+2'),
    new traits.Traits('AC:+5'),
  ];
  chrTraits.utiliseAdditionalTraits({ armour: addedArmour });
  expect(chrTraits.getEffectiveInt('AC')).toBe(23);
});

test('CharacterTraits.utiliseAdditionalTraits: armour: pick best and use subtractions', () => {
  const chrTraits = new traits.CharacterTraits('STR:10,AC:10,DEX:10');

  const addedArmour = [
    new traits.Traits('AC:12'),
    new traits.Traits('AC:16'),
    new traits.Traits('AC:11'),
    new traits.Traits('AC:-2'),
    new traits.Traits('AC:-5'),
  ];
  chrTraits.utiliseAdditionalTraits({ armour: addedArmour });
  expect(chrTraits.getEffectiveInt('AC')).toBe(9);
});

test('CharacterTraits.utiliseAdditionalTraits: use dexterity', () => {
  const dexterity = 20;
  const chrTraits = new traits.CharacterTraits(`STR:10,DEX:${dexterity},AC:10`);
  const dexterityMod = abilityToModifier(dexterity);

  const addedArmour = [
    new traits.Traits('AC:12,TYPE:LIGHT LEATHER'),
    new traits.Traits('AC:16,TYPE:LIGHT LEATHER'),
    new traits.Traits('AC:11,TYPE:LIGHT LEATHER'),
  ];
  chrTraits.utiliseAdditionalTraits({ armour: addedArmour });
  expect(chrTraits.getEffectiveInt('AC')).toBe(16 + dexterityMod);
});

test('CharacterTraits.utiliseAdditionalTraits: dexterity clipped to 2 for MEDIUM', () => {
  for (let dexterity = 1; dexterity < 30; dexterity += 2) {
    const dexterityMod = abilityToModifier(dexterity);
    const chrTraits = new traits.CharacterTraits(
      `STR:10,DEX:${dexterity},AC:10`
    );
    const addedArmour = [new traits.Traits('AC:16,TYPE:MEDIUM ARMOUR')];
    chrTraits.utiliseAdditionalTraits({ armour: addedArmour });
    expect(chrTraits.getEffectiveInt('AC')).toBe(
      16 + Math.min(2, dexterityMod)
    );
  }
});

test('CharacterTraits.utiliseAdditionalTraits: no dexterity for HEAVY', () => {
  const dexterity = 20;
  const chrTraits = new traits.CharacterTraits(`STR:10,DEX:${dexterity},AC:10`);

  const addedArmour = [new traits.Traits('AC:16,TYPE:HEAVY PLATE ARMOUR')];
  chrTraits.utiliseAdditionalTraits({ armour: addedArmour });
  expect(chrTraits.getEffectiveInt('AC')).toBe(16);
});

test('CharacterTraits.utiliseAdditionalTraits: armour and shield', () => {
  const chrTraits = new traits.CharacterTraits('STR:10,AC:10,DEX:10');

  const addedArmour = [
    new traits.Traits('AC:12'),
    new traits.Traits('AC:16'),
    new traits.Traits('AC:11'),
  ];
  const addedShields = [
    new traits.Traits('AC:+3'),
    new traits.Traits('AC:+4'),
    new traits.Traits('AC:+5'),
  ];
  chrTraits.utiliseAdditionalTraits({
    armour: addedArmour,
    shields: addedShields,
  });
  console.log(chrTraits.getEffectiveInt('AC'));

  expect(chrTraits.getEffectiveInt('AC')).toBe(16 + 5);
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

test('CharacterTraits.isProficient', () => {
  let characterTraits = new traits.CharacterTraits('PROF:KEY1 & KEY2 & KEY3 ');
  expect(
    characterTraits.isProficient(new traits.Traits('TYPE:SOME WEAPON'))
  ).toEqual(false);
  expect(
    characterTraits.isProficient(new traits.Traits('TYPE:SOME WEAPON KEY2'))
  ).toEqual(true);

  characterTraits = new traits.CharacterTraits(
    'PROF:KEY1 KEYA & KEY2 KEYB & KEY3 KEYC'
  );
  expect(
    characterTraits.isProficient(new traits.Traits('TYPE:SOME WEAPON'))
  ).toEqual(false);
  expect(characterTraits.isProficient(new traits.Traits('TYPE:KEY2'))).toEqual(
    false
  );
  expect(characterTraits.isProficient(new traits.Traits('TYPE:KEYB'))).toEqual(
    false
  );

  expect(
    characterTraits.isProficient(new traits.Traits('TYPE:KEY2 KEYB'))
  ).toEqual(true);
  expect(
    characterTraits.isProficient(new traits.Traits('TYPE:KEYB KEY2'))
  ).toEqual(true);
  expect(
    characterTraits.isProficient(new traits.Traits('TYPE:KEYB KEY2 KEY99'))
  ).toEqual(true);
});

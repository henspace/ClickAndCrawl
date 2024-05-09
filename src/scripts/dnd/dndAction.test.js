/**
 * @file Test dndActions
 *
 * @module dnd/dndAction.test
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
import * as mockedDice from '../utils/dice.mockable.js';

jest.unstable_mockModule('../utils/dice.js', () => {
  return {
    __esModule: true,
    ...mockedDice,
    rollDice: jest.fn((sides) => mockedDice.rollDice(sides)),
  };
});

const mockDice = await import('../utils/dice.js');
const { characteristicToModifier } = await import('./traits.js');
const { Actor, ActorType } = await import('../players/actors.js');
const dndAction = await import('./dndAction.js');
const { CharacterTraits, Traits } = await import('./traits.js');
const { getLevelAndProfBonusFromExp, getMinExpPointsForLevel } = await import(
  './tables.js'
);

test('mockDice', () => {
  let result = mockDice.rollDice(20);
  expect(result).toBeGreaterThanOrEqual(1);
  expect(result).toBeLessThanOrEqual(20);
  mockDice.rollDice.mockReturnValueOnce(99);
  result = mockDice.rollDice(20);
  expect(result).toBe(99);
  expect(mockDice.rollMultiDice('6D1')).toBe(6);
});

test('getMeleeDamage AC > attack roll value', () => {
  const attackRoll = { roll: 16, value: 18 };
  const damage = 20;
  let attack = {
    rollForAttack: () => attackRoll,
    rollForDamage: () => damage,
  };
  const traits = new CharacterTraits(`EXP:0, AC:${attackRoll.value + 1}`);
  expect(dndAction.getMeleeDamage(attack, traits)).toBe(0);
});

test('getMeleeDamage AC < attack roll value', () => {
  const attackRoll = { roll: 16, value: 18 };
  const damage = 20;
  let attack = {
    rollForAttack: () => attackRoll,
    rollForDamage: () => damage,
  };
  const traits = new CharacterTraits(`EXP:0, AC:${attackRoll.value - 1}`);
  expect(dndAction.getMeleeDamage(attack, traits)).toBe(damage);
});

test('getMeleeDamage AC == attack roll value', () => {
  const attackRoll = { roll: 16, value: 18 };
  const damage = 20;
  let attack = {
    rollForAttack: () => attackRoll,
    rollForDamage: () => damage,
  };
  const traits = new CharacterTraits(`EXP:0, AC:${attackRoll.value}`);
  expect(dndAction.getMeleeDamage(attack, traits)).toBe(damage);
});

test('getMeleeDamage AC < attack roll value but critical miss', () => {
  const attackRoll = { roll: 1, value: 18 };
  const damage = 20;
  let attack = {
    rollForAttack: () => attackRoll,
    rollForDamage: () => damage,
  };
  const traits = new CharacterTraits(`EXP:0, AC:${attackRoll.value - 1}`);
  expect(dndAction.getMeleeDamage(attack, traits)).toBe(0);
});

test('getMeleeDamage AC > attack roll value but twice damage on critical hit', () => {
  const attackRoll = { roll: 20, value: 18 };
  const damage = 20;
  let attack = {
    rollForAttack: () => attackRoll,
    rollForDamage: () => damage,
  };
  const traits = new CharacterTraits(`EXP:0, AC:${attackRoll.value + 1}`);
  expect(dndAction.getMeleeDamage(attack, traits)).toBe(2 * damage);
});

test('getPoisonDamage: no DC set always gives damage', () => {
  const damage = 18;
  const saveModifier = -40; // reduces rollDice(20) to -ve
  const attackerTraits = new Traits(`DMG:${damage}D1`);
  const targetTraits = new Traits('');
  targetTraits.getNonMeleeSaveAbilityModifier = jest.fn(
    (traitsUnused) => saveModifier
  );
  expect(dndAction.getPoisonDamage(attackerTraits, targetTraits)).toBe(damage);
  expect(targetTraits.getNonMeleeSaveAbilityModifier.mock.calls).toHaveLength(
    1
  );
});

test('getPoisonDamage: savingThrow > difficulty gives 0 damage', () => {
  const damage = 18;
  const saveModifier = 15;
  const diceRoll = 10;
  mockDice.rollDice.mockReturnValueOnce(diceRoll);
  const savingThrow = diceRoll + saveModifier;
  const difficulty = savingThrow - 1;
  const attackerTraits = new Traits(`DMG:${damage}D1, DC:${difficulty}`);
  const targetTraits = new Traits('');
  targetTraits.getNonMeleeSaveAbilityModifier = jest.fn(
    (traitsUnused) => saveModifier
  );
  expect(dndAction.getPoisonDamage(attackerTraits, targetTraits)).toBe(0);
  expect(targetTraits.getNonMeleeSaveAbilityModifier.mock.calls).toHaveLength(
    1
  );
});

test('getPoisonDamage: savingThrow == difficulty gives 0 damage', () => {
  const damage = 18;
  const saveModifier = 15;
  const diceRoll = 10;
  mockDice.rollDice.mockReturnValueOnce(diceRoll);
  const savingThrow = diceRoll + saveModifier;
  const difficulty = savingThrow;
  const attackerTraits = new Traits(`DMG:${damage}D1, DC:${difficulty}`);
  const targetTraits = new Traits('');
  targetTraits.getNonMeleeSaveAbilityModifier = jest.fn(
    (traitsUnused) => saveModifier
  );
  expect(dndAction.getPoisonDamage(attackerTraits, targetTraits)).toBe(0);
  expect(targetTraits.getNonMeleeSaveAbilityModifier.mock.calls).toHaveLength(
    1
  );
});

test('getPoisonDamage - savingThrow < difficulty gives damage', () => {
  const damage = 18;
  const saveModifier = 15;
  const diceRoll = 10;
  mockDice.rollDice.mockReturnValueOnce(diceRoll);
  const savingThrow = diceRoll + saveModifier;
  const difficulty = savingThrow + 1;
  const attackerTraits = new Traits(`DMG:${damage}D1, DC:${difficulty}`);
  const targetTraits = new Traits('');
  targetTraits.getNonMeleeSaveAbilityModifier = jest.fn(
    (traitsUnused) => saveModifier
  );
  expect(dndAction.getPoisonDamage(attackerTraits, targetTraits)).toBe(damage);
  expect(targetTraits.getNonMeleeSaveAbilityModifier.mock.calls).toHaveLength(
    1
  );
});

test('getConsumptionBenefit - normal gain', () => {
  const gainHp = 6;
  const currentHp = 7;
  const maxHp = 30;
  const consumableTraits = new Traits(`HP:${gainHp}`);
  const consumerTraits = new Traits(`HP:${currentHp}, HP_MAX:${maxHp}`);
  const result = dndAction.getConsumptionBenefit(
    consumableTraits,
    consumerTraits
  );
  expect(result).toStrictEqual({
    shortFall: maxHp - currentHp,
    oldHp: currentHp,
    newHp: currentHp + gainHp,
  });
});

test('getConsumptionBenefit - gain clipped to max', () => {
  const gainHp = 30;
  const currentHp = 7;
  const maxHp = 10;
  const consumableTraits = new Traits(`HP:${gainHp}`);
  const consumerTraits = new Traits(`HP:${currentHp}, HP_MAX:${maxHp}`);
  const result = dndAction.getConsumptionBenefit(
    consumableTraits,
    consumerTraits
  );
  expect(result).toStrictEqual({
    shortFall: maxHp - currentHp,
    oldHp: currentHp,
    newHp: maxHp,
  });
});

test('getSpellDamage - default ability of INT - proficient save failed', () => {
  const isProficient = true;
  const exp = 125000;
  const profBonus = isProficient
    ? getLevelAndProfBonusFromExp(exp).profBonus
    : 0;
  const attackerAbilityValue = 16;
  const attackerAbilityModifier =
    characteristicToModifier(attackerAbilityValue);

  const attackerTraits = new CharacterTraits(
    `INT:${attackerAbilityValue},PROF:SPELL,EXP:${exp}`
  );

  const targetSaveAbility = 'DEX';
  const targetSaveAbilityValue = 20;
  const targetSaveModifier = characteristicToModifier(targetSaveAbilityValue);
  const targetTraits = new CharacterTraits(
    `${targetSaveAbility}:${targetSaveAbilityValue}`
  );
  targetTraits.getNonMeleeSaveAbilityModifier = jest.fn(
    (traitsUnused) => targetSaveModifier
  );

  const spellDifficulty = 14;
  const spellTraits = new Traits(
    `DC:${spellDifficulty},TYPE:${isProficient ? 'SPELL' : 'NOTHING'}`
  );
  const spellDamage = 48;
  spellTraits.getDamageDiceWhenCastBy = () => `${spellDamage}D1`;

  const fullDifficulty = spellDifficulty + profBonus + attackerAbilityModifier;
  const requiredDiceRoll = fullDifficulty - targetSaveModifier - 1;
  mockDice.rollDice.mockReturnValueOnce(requiredDiceRoll);

  const result = dndAction.getSpellDamage(
    attackerTraits,
    targetTraits,
    spellTraits
  );
  expect(result).toBe(spellDamage);
});

test('getSpellDamage - proficient - save failed', () => {
  const isProficient = true;
  const exp = 125000;
  const profBonus = isProficient
    ? getLevelAndProfBonusFromExp(exp).profBonus
    : 0;
  const attackerAbility = 'ANO';
  const attackerAbilityValue = 16;
  const attackerAbilityModifier =
    characteristicToModifier(attackerAbilityValue);

  const attackerTraits = new CharacterTraits(
    `SPELL_CAST:${attackerAbility}, ${attackerAbility}:${attackerAbilityValue},PROF:SPELL,EXP:${exp}`
  );

  const targetSaveAbility = 'DEX';
  const targetSaveAbilityValue = 20;
  const targetSaveModifier = characteristicToModifier(targetSaveAbilityValue);
  const targetTraits = new CharacterTraits(
    `${targetSaveAbility}:${targetSaveAbilityValue}`
  );
  targetTraits.getNonMeleeSaveAbilityModifier = jest.fn(
    (traitsUnused) => targetSaveModifier
  );

  const spellDifficulty = 14;
  const spellTraits = new Traits(
    `DC:${spellDifficulty},TYPE:${isProficient ? 'SPELL' : 'NOTHING'}`
  );
  const spellDamage = 48;
  spellTraits.getDamageDiceWhenCastBy = () => `${spellDamage}D1`;

  const fullDifficulty = spellDifficulty + profBonus + attackerAbilityModifier;
  const requiredDiceRoll = fullDifficulty - targetSaveModifier - 1;
  mockDice.rollDice.mockReturnValueOnce(requiredDiceRoll);

  const result = dndAction.getSpellDamage(
    attackerTraits,
    targetTraits,
    spellTraits
  );
  expect(result).toBe(spellDamage);
});

test('getSpellDamage - proficient - saving throw equals difficulty', () => {
  const isProficient = true;
  const exp = 125000;
  const profBonus = isProficient
    ? getLevelAndProfBonusFromExp(exp).profBonus
    : 0;
  const attackerAbility = 'ANO';
  const attackerAbilityValue = 16;
  const attackerAbilityModifier =
    characteristicToModifier(attackerAbilityValue);

  const attackerTraits = new CharacterTraits(
    `SPELL_CAST:${attackerAbility}, ${attackerAbility}:${attackerAbilityValue},PROF:SPELL,EXP:${exp}`
  );

  const targetSaveAbility = 'DEX';
  const targetSaveAbilityValue = 20;
  const targetSaveModifier = characteristicToModifier(targetSaveAbilityValue);
  const targetTraits = new CharacterTraits(
    `${targetSaveAbility}:${targetSaveAbilityValue}`
  );
  targetTraits.getNonMeleeSaveAbilityModifier = jest.fn(
    (traitsUnused) => targetSaveModifier
  );

  const spellDifficulty = 14;
  const spellTraits = new Traits(
    `DC:${spellDifficulty},TYPE:${isProficient ? 'SPELL' : 'NOTHING'}`
  );
  const spellDamage = 48;
  spellTraits.getDamageDiceWhenCastBy = () => `${spellDamage}D1`;

  const fullDifficulty = spellDifficulty + profBonus + attackerAbilityModifier;
  const requiredDiceRoll = fullDifficulty - targetSaveModifier;
  mockDice.rollDice.mockReturnValueOnce(requiredDiceRoll);

  const result = dndAction.getSpellDamage(
    attackerTraits,
    targetTraits,
    spellTraits
  );
  expect(result).toBe(0);
});

test('getSpellDamage - proficient - saving throw > difficulty', () => {
  const isProficient = true;
  const exp = 125000;
  const profBonus = isProficient
    ? getLevelAndProfBonusFromExp(exp).profBonus
    : 0;
  const attackerAbility = 'ANO';
  const attackerAbilityValue = 16;
  const attackerAbilityModifier =
    characteristicToModifier(attackerAbilityValue);

  const attackerTraits = new CharacterTraits(
    `SPELL_CAST:${attackerAbility}, ${attackerAbility}:${attackerAbilityValue},PROF:SPELL,EXP:${exp}`
  );

  const targetSaveAbility = 'DEX';
  const targetSaveAbilityValue = 20;
  const targetSaveModifier = characteristicToModifier(targetSaveAbilityValue);
  const targetTraits = new CharacterTraits(
    `${targetSaveAbility}:${targetSaveAbilityValue}`
  );
  targetTraits.getNonMeleeSaveAbilityModifier = jest.fn(
    (traitsUnused) => targetSaveModifier
  );

  const spellDifficulty = 14;
  const spellTraits = new Traits(
    `DC:${spellDifficulty},TYPE:${isProficient ? 'SPELL' : 'NOTHING'}`
  );
  const spellDamage = 48;
  spellTraits.getDamageDiceWhenCastBy = () => `${spellDamage}D1`;

  const fullDifficulty = spellDifficulty + profBonus + attackerAbilityModifier;
  const requiredDiceRoll = fullDifficulty - targetSaveModifier + 1;
  mockDice.rollDice.mockReturnValueOnce(requiredDiceRoll);

  const result = dndAction.getSpellDamage(
    attackerTraits,
    targetTraits,
    spellTraits
  );
  expect(result).toBe(0);
});

test('take rest short with no CON modifier', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;
  let hpMax = 30;
  actor.traits = new CharacterTraits('EXP:14000, CON:10'); // gives level 6 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', '3D6');
  const result = dndAction.takeRest(actor, 'SHORT');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBeGreaterThan(hp);
  expect(result.newHp).toBeLessThanOrEqual(hp + 6);
  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toEqual(result.newHp);
  expect(newHitDice).toBe('2D6');
});

test('take rest short with CON modifier', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;

  let hpMax = 30;
  actor.traits = new CharacterTraits('EXP:14000, CON:16'); // gives level 6 based on p56 of DnD5e
  const conModifier = actor.traits.getAsModifier('CON');
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', '3D6');
  const result = dndAction.takeRest(actor, 'SHORT');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBeGreaterThan(hp + conModifier);
  expect(result.newHp).toBeLessThanOrEqual(hp + conModifier + 6);

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toEqual(result.newHp);
  expect(newHitDice).toBe('2D6');
});

test('take rest short insufficient dice', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;
  let level = 6;
  let hpMax = 30;
  actor.traits = new CharacterTraits('EXP:14000, CON:16'); // gives level 6 based on p56 of DnD5e
  actor.traits._level = level;
  actor.traits.set('CON', 16);
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', '0D6');
  const result = dndAction.takeRest(actor, 'SHORT');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBe(hp);

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(result.newHp);
  expect(newHitDice).toBe('0D6');
});

test('take rest does not exceed HP_MAX', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 12;
  let hpMax = 12;
  actor.traits = new CharacterTraits('EXP:14000, CON:10'); // gives level 6 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', '3D6');
  const result = dndAction.takeRest(actor, 'SHORT');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBe(hpMax);

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hpMax);
  expect(newHitDice).toBe('2D6');
});

test('takeRest long rest calls cure', () => {
  const actor = new Actor({}, ActorType.HERO);
  const mockCure = jest.fn(() => console.log('cure'));
  actor.toxify = {
    cure: mockCure,
  };

  let hp = 5;
  let hpMax = 12;
  const currentHitDice = '6D20';
  actor.traits = new CharacterTraits('EXP:355000, CON:10'); // gives level 20 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', currentHitDice);

  dndAction.takeRest(actor, 'LONG');
  expect(mockCure.mock.calls).toHaveLength(1);
});

test('takeRest short does not restore casting power but long does', () => {
  const actor = new Actor({}, ActorType.HERO);
  const mockCure = jest.fn(() => console.log('cure'));
  actor.toxify = {
    cure: mockCure,
  };

  const level = 6;
  const exp = getMinExpPointsForLevel(level);
  actor.traits = new CharacterTraits(`EXP:${exp}, CASTING_POWER:0`);
  dndAction.takeRest(actor, 'SHORT');
  expect(actor.traits.getInt('CASTING_POWER')).toBe(0);
  dndAction.takeRest(actor, 'LONG');
  const expectedPower = Math.round(4 * (2 + (20 * (level - 1)) / 19));
  expect(actor.traits.getInt('CASTING_POWER')).toBe(expectedPower);
});

test('takeRest long incrementing by half current hit dice', () => {
  const actor = new Actor({}, ActorType.HERO);
  const mockCure = jest.fn(() => console.log('cure'));
  actor.toxify = {
    cure: mockCure,
  };

  let hp = 5;
  let hpMax = 12;
  const currentHitDice = '6D20';
  const expectedHitDicePostRest = '9D20';
  actor.traits = new CharacterTraits('EXP:355000, CON:10'); // gives level 20 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', currentHitDice);

  const result = dndAction.takeRest(actor, 'LONG');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBe(hpMax);
  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hpMax);
  expect(newHitDice).toBe(expectedHitDicePostRest);
});

test('takeRest long incrementing hit dice up to normal max.', () => {
  const actor = new Actor({}, ActorType.HERO);
  const mockCure = jest.fn(() => console.log('cure'));
  actor.toxify = {
    cure: mockCure,
  };

  let hp = 5;
  let hpMax = 12;
  const currentHitDice = '14D20';
  const expectedHitDicePostRest = '16D20';
  actor.traits = new CharacterTraits('EXP:195000, CON:10'); // gives level 16 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', currentHitDice);

  const result = dndAction.takeRest(actor, 'LONG');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBe(hpMax);
  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hpMax);
  expect(newHitDice).toBe(expectedHitDicePostRest);
});

test('canRest short rest possible', () => {
  expect(
    dndAction.canRest(1, 1, new CharacterTraits('HIT_DICE:1D6'))
  ).toStrictEqual({
    shortRest: {
      possible: true,
      failure: dndAction.RestFailure.NONE,
    },
    longRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_MORE_RATIONS,
    },
  });
});

test('canRest short rest no hit dice', () => {
  expect(
    dndAction.canRest(1, 1, new CharacterTraits('HIT_DICE:0D6'))
  ).toStrictEqual({
    shortRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_LONG_REST,
    },
    longRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_MORE_RATIONS,
    },
  });
  expect(
    dndAction.canRest(10, 10, new CharacterTraits('HIT_DICE:0D6'))
  ).toStrictEqual({
    shortRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_LONG_REST,
    },
    longRest: {
      possible: true,
      failure: dndAction.RestFailure.NONE,
    },
  });
});

test('canRest short rest no rations', () => {
  expect(
    dndAction.canRest(0, 1, new CharacterTraits('HIT_DICE:1D6'))
  ).toStrictEqual({
    shortRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_MORE_RATIONS,
    },
    longRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_MORE_RATIONS,
    },
  });
  expect(
    dndAction.canRest(1, 0, new CharacterTraits('HIT_DICE:1D6'))
  ).toStrictEqual({
    shortRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_MORE_RATIONS,
    },
    longRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_MORE_RATIONS,
    },
  });
});

test('canRest short success but no long rest', () => {
  expect(
    dndAction.canRest(2, 2, new CharacterTraits('HIT_DICE:1D6'))
  ).toStrictEqual({
    shortRest: {
      possible: true,
      failure: dndAction.RestFailure.NONE,
    },
    longRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_MORE_RATIONS,
    },
  });
});

test('canRest short failure but long rest sucess', () => {
  expect(
    dndAction.canRest(3, 3, new CharacterTraits('HIT_DICE:0D6'))
  ).toStrictEqual({
    shortRest: {
      possible: false,
      failure: dndAction.RestFailure.NEED_LONG_REST,
    },
    longRest: {
      possible: true,
      failure: dndAction.RestFailure.NONE,
    },
  });
});

test('canRest short and long rest success', () => {
  expect(
    dndAction.canRest(3, 3, new CharacterTraits('HIT_DICE:1D6'))
  ).toStrictEqual({
    shortRest: {
      possible: true,
      failure: dndAction.RestFailure.NONE,
    },
    longRest: {
      possible: true,
      failure: dndAction.RestFailure.NONE,
    },
  });
});

test('canDetectTrap', () => {
  let successes = 0;
  let failures = 0;
  const difficulty = 10;
  const ability = 'WIS';
  const trapDetails = {
    difficulty: difficulty,
    attackBonus: 0,
    damageDice: '1D10',
    detectBy: ability,
    disableBy: 'INT',
  };
  for (let abilityValue = 1; abilityValue <= 20; abilityValue++) {
    const modifier = characteristicToModifier(abilityValue);
    const actorTraits = new Traits(`${ability}:${abilityValue}`);
    for (let diceRoll = 1; diceRoll <= 20; diceRoll++) {
      mockDice.rollDice.mockReturnValueOnce(diceRoll);
      let expectedResult;
      if (diceRoll + modifier >= difficulty) {
        expectedResult = true;
        successes++;
      } else {
        expectedResult = false;
        failures++;
      }
      expect(dndAction.canDetectTrap(actorTraits, trapDetails)).toBe(
        expectedResult
      );
    }
    expect(successes).toBeGreaterThan(0);
    expect(failures).toBeGreaterThan(0);
  }
});

test('canDisableTrap', () => {
  let successes = 0;
  let failures = 0;
  const difficulty = 10;
  const ability = 'INT';
  const trapDetails = {
    difficulty: difficulty,
    attackBonus: 0,
    damageDice: '1D10',
    detectBy: ability,
    disableBy: 'INT',
  };
  for (let abilityValue = 1; abilityValue <= 20; abilityValue++) {
    const modifier = characteristicToModifier(abilityValue);
    const actorTraits = new Traits(`${ability}:${abilityValue}`);
    for (let diceRoll = 1; diceRoll <= 20; diceRoll++) {
      mockDice.rollDice.mockReturnValueOnce(diceRoll);
      let expectedResult;
      if (diceRoll + modifier >= difficulty) {
        expectedResult = true;
        successes++;
      } else {
        expectedResult = false;
        failures++;
      }
      expect(dndAction.canDisableTrap(actorTraits, trapDetails)).toBe(
        expectedResult
      );
    }
    expect(successes).toBeGreaterThan(0);
    expect(failures).toBeGreaterThan(0);
  }
});

test(`Standard difficulties`, () => {
  expect(dndAction.Difficulty.VERY_EASY).toBe(5);
  expect(dndAction.Difficulty.EASY).toBe(10);
  expect(dndAction.Difficulty.MEDIUM).toBe(15);
  expect(dndAction.Difficulty.HARD).toBe(20);
  expect(dndAction.Difficulty.VERY_HARD).toBe(25);
  expect(dndAction.Difficulty.NEARLY_IMPOSSIBLE).toBe(30);
});

test('canSteal', () => {
  let successes = 0;
  let failures = 0;
  const difficulty = 15;
  const ability = 'DEX';
  const traderTraits = new Traits(`DC:${difficulty}`);

  for (let abilityValue = 1; abilityValue <= 20; abilityValue++) {
    const modifier = characteristicToModifier(abilityValue);
    const actorTraits = new Traits(`${ability}:${abilityValue}`);
    for (let diceRoll = 1; diceRoll <= 20; diceRoll++) {
      mockDice.rollDice.mockReturnValueOnce(diceRoll);
      let expectedResult;
      if (diceRoll + modifier >= difficulty) {
        expectedResult = true;
        successes++;
      } else {
        expectedResult = false;
        failures++;
      }
      expect(dndAction.canSteal(actorTraits, traderTraits)).toBe(
        expectedResult
      );
    }
    expect(successes).toBeGreaterThan(0);
    expect(failures).toBeGreaterThan(0);
  }
});

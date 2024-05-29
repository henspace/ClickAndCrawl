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
const { Difficulty } = await import('./dndAction.js');
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

test('getPoisonDamage: use DMG_POISON if set', () => {
  const damage = 18;
  const saveModifier = -40; // reduces rollDice(20) to -ve
  const attackerTraits = new Traits(`DMG:1D1,DMG_POISON:${damage}D1`);
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

test('getPoisonDamage: savingThrow > difficulty gives proportion of damage', () => {
  const damage = 18;
  const saveModifier = 15;
  const diceRoll = 10;
  const dmgSaved = 0.6;
  mockDice.rollDice.mockReturnValueOnce(diceRoll);
  const savingThrow = diceRoll + saveModifier;
  const difficulty = savingThrow - 1;
  const attackerTraits = new Traits(
    `DMG:${damage}D1, DC:${difficulty}, DMG_SAVED:${dmgSaved}`
  );
  const targetTraits = new Traits('');
  targetTraits.getNonMeleeSaveAbilityModifier = jest.fn(
    (traitsUnused) => saveModifier
  );
  expect(dndAction.getPoisonDamage(attackerTraits, targetTraits)).toBe(
    Math.round(damage * dmgSaved)
  );
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

test('getHpGain', () => {
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

test('getSpellHpGain - space for restoration', () => {
  const hpMax = 20;
  const hp = 10;
  const hpGain = 4;
  const casterTraits = new CharacterTraits(`EXP:1000`);
  const targetTraits = new CharacterTraits(`HP:${hp}, HP_MAX:${hpMax}`);
  const spellTraits = new Traits(`HP_GAIN:${hpGain}`);

  spellTraits.getHpGainDiceWhenCastBy = jest.fn(() => `${hpGain}D1`);

  const result = dndAction.getSpellHpGain(
    casterTraits,
    targetTraits,
    spellTraits
  );
  expect(result).toBe(hpGain);
  expect(spellTraits.getHpGainDiceWhenCastBy).toHaveBeenCalledWith(
    casterTraits
  );
});

test('getSpellHpGain - clipped to max', () => {
  const hpMax = 20;
  const hp = 18;
  const hpGain = 4;
  const casterTraits = new CharacterTraits(`EXP:1000`);
  const targetTraits = new CharacterTraits(`HP:${hp}, HP_MAX:${hpMax}`);
  const spellTraits = new Traits(`HP_GAIN:${hpGain}`);

  spellTraits.getHpGainDiceWhenCastBy = jest.fn(() => `${hpGain}D1`);

  const result = dndAction.getSpellHpGain(
    casterTraits,
    targetTraits,
    spellTraits
  );
  expect(result).toBe(hpMax - hp);
  expect(spellTraits.getHpGainDiceWhenCastBy).toHaveBeenCalledWith(
    casterTraits
  );
});

test('getSpellHpGain - hpGain not set', () => {
  const hpMax = 20;
  const hp = 18;
  const hpGain = 1;

  const casterTraits = new CharacterTraits(`EXP:1000`);
  const targetTraits = new CharacterTraits(`HP:${hp}, HP_MAX:${hpMax}`);
  const spellTraits = new Traits(``);

  spellTraits.getHpGainDiceWhenCastBy = jest.fn(() => `${hpGain}D1`);

  const result = dndAction.getSpellHpGain(
    casterTraits,
    targetTraits,
    spellTraits
  );
  expect(result).toBe(0);
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

///////////////////////////////////////////

test('getSpellDamage - ranged - save failed', () => {
  const damage = 20;
  const difficulty = 11;
  const attackerTraits = new CharacterTraits(
    `ATTACK:RANGED, DMG:${damage}D1, DC:${difficulty}`
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

  const requiredDiceRoll = difficulty - targetSaveModifier - 1;
  mockDice.rollDice.mockReturnValueOnce(requiredDiceRoll);

  const result = dndAction.getSpellDamage(
    attackerTraits,
    targetTraits,
    attackerTraits
  );
  expect(result).toBe(damage);
});

test('getSpellDamage - ranged - save succeeded', () => {
  const damage = 20;
  const difficulty = 11;
  const attackerTraits = new CharacterTraits(
    `ATTACK:RANGED, DMG:${damage}D1, DC:${difficulty}`
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

  const requiredDiceRoll = difficulty - targetSaveModifier;
  mockDice.rollDice.mockReturnValueOnce(requiredDiceRoll);

  const result = dndAction.getSpellDamage(
    attackerTraits,
    targetTraits,
    attackerTraits
  );
  expect(result).toBe(0);
});

///////////////////////////////////////////

test('take rest short with no CON modifier', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;
  let hpMax = 30;
  let oldHitDice = '3D6';
  actor.traits = new CharacterTraits('EXP:14000, CON:10'); // gives level 6 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', `${oldHitDice}`);
  const result = dndAction.takeRest(actor, 'SHORT');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBeGreaterThan(hp);
  expect(result.newHp).toBeLessThanOrEqual(hp + 6);
  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toEqual(result.newHp);
  expect(newHitDice).toEqual(oldHitDice);
  expect(actor.traits.getInt('SPENT_HIT_DICE')).toBe(1);
});

test('take rest short with CON modifier', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;
  let hpMax = 30;
  let oldHitDice = '3D6';
  actor.traits = new CharacterTraits('EXP:14000, CON:16'); // gives level 6 based on p56 of DnD5e
  const conModifier = actor.traits.getAsModifier('CON');
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', `${oldHitDice}`);
  const result = dndAction.takeRest(actor, 'SHORT');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBeGreaterThan(hp + conModifier);
  expect(result.newHp).toBeLessThanOrEqual(hp + conModifier + 6);

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toEqual(result.newHp);
  expect(newHitDice).toBe(oldHitDice);
  expect(actor.traits.getInt('SPENT_HIT_DICE')).toBe(1);
});

test('take rest short insufficient dice', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;
  let level = 6;
  let hpMax = 30;
  let oldHitDice = '3D6';
  let spentDice = 3;
  actor.traits = new CharacterTraits('EXP:14000, CON:16'); // gives level 6 based on p56 of DnD5e
  actor.traits._level = level;
  actor.traits.set('CON', 16);
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', `${oldHitDice}`);
  actor.traits.set('SPENT_HIT_DICE', spentDice);
  const result = dndAction.takeRest(actor, 'SHORT');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBe(hp);

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(result.newHp);
  expect(newHitDice).toBe(oldHitDice);
  expect(actor.traits.getInt('SPENT_HIT_DICE')).toBe(spentDice);
});

test('take rest does not exceed HP_MAX', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 12;
  let hpMax = 12;
  let oldHitDice = '3D6';
  actor.traits = new CharacterTraits('EXP:14000, CON:10'); // gives level 6 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', `${oldHitDice}`);
  const result = dndAction.takeRest(actor, 'SHORT');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBe(hpMax);

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hpMax);
  expect(newHitDice).toBe(oldHitDice);
  expect(actor.traits.getInt('SPENT_HIT_DICE')).toBe(1);
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

test('takeRest short increments spent dice', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 12;
  const maxHitDice = 6;
  const spentHitDice = 0;
  actor.traits = new CharacterTraits('EXP:14000, CON:10'); // gives level 6 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HIT_DICE', `${maxHitDice}D20`);
  actor.traits.set('SPENT_HIT_DICE', `${spentHitDice}`);

  for (let rest = 0; rest <= maxHitDice + 2; rest++) {
    expect(actor.traits.getInt('SPENT_HIT_DICE')).toBe(
      Math.min(rest, maxHitDice)
    );
    dndAction.takeRest(actor, 'SHORT');
  }
});

test('takeRest long incrementing by half normal number of  hit dice', () => {
  const actor = new Actor({}, ActorType.HERO);
  const mockCure = jest.fn(() => console.log('cure'));
  actor.toxify = {
    cure: mockCure,
  };

  let hp = 5;
  let hpMax = 12;
  const numberOfHitDice = 10;
  const currentHitDice = `${numberOfHitDice}D20`;
  const spentDice = 9;
  const expectedSpentDiceAfterLongRest = spentDice - numberOfHitDice / 2;
  actor.traits = new CharacterTraits('EXP:355000, CON:10'); // gives level 20 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', currentHitDice);
  actor.traits.set('SPENT_HIT_DICE', spentDice);

  const result = dndAction.takeRest(actor, 'LONG');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBe(hpMax);
  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hpMax);
  expect(newHitDice).toBe(currentHitDice);
  expect(actor.traits.getInt('SPENT_HIT_DICE')).toEqual(
    expectedSpentDiceAfterLongRest
  );
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
  const spentDice = 1;
  const expectedSpentDiceAfterLongRest = 0;
  actor.traits = new CharacterTraits('EXP:195000, CON:10'); // gives level 16 based on p56 of DnD5e
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', currentHitDice);
  actor.traits.set('SPENT_HIT_DICE', spentDice);

  const result = dndAction.takeRest(actor, 'LONG');
  expect(result.oldHp).toBe(hp);
  expect(result.newHp).toBe(hpMax);
  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hpMax);
  expect(newHitDice).toBe(currentHitDice);
  expect(actor.traits.getInt('SPENT_HIT_DICE')).toBe(
    expectedSpentDiceAfterLongRest
  );
});

test('canRest short rest possible', () => {
  expect(
    dndAction.canRest(
      1,
      1,
      new CharacterTraits('HIT_DICE:6D6, SPENT_HIT_DICE:5')
    )
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
    dndAction.canRest(
      1,
      1,
      new CharacterTraits('HIT_DICE:6D6, SPENT_HIT_DICE:6')
    )
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
    dndAction.canRest(
      0,
      1,
      new CharacterTraits('HIT_DICE:1D6, SPENT_HIT_DICE:0')
    )
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
    dndAction.canRest(
      1,
      0,
      new CharacterTraits('HIT_DICE:1D6, SPENT_HIT_DICE:0')
    )
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
    dndAction.canRest(
      2,
      2,
      new CharacterTraits('HIT_DICE:1D6, SPENT_HIT_DICE:0')
    )
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
    dndAction.canRest(
      3,
      3,
      new CharacterTraits('HIT_DICE:3D6, SPENT_HIT_DICE:3')
    )
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
    dndAction.canRest(
      3,
      3,
      new CharacterTraits('HIT_DICE:1D6, SPENT_HIT_DICE:0')
    )
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
    const actorTraits = new CharacterTraits(`${ability}:${abilityValue}`);
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
    const actorTraits = new CharacterTraits(`${ability}:${abilityValue}`);
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
  expect(dndAction.Difficulty.IMPOSSIBLE).toBe(999);
});

test('canSteal', () => {
  let successes = 0;
  let failures = 0;
  const difficulty = 15;
  const ability = 'DEX';
  const traderTraits = new Traits(`DC:${difficulty}`);

  for (let abilityValue = 1; abilityValue <= 20; abilityValue++) {
    const modifier = characteristicToModifier(abilityValue);
    const actorTraits = new CharacterTraits(`${ability}:${abilityValue}`);
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

test('canPickLock', () => {
  let successes = 0;
  let failures = 0;
  const difficulty = Difficulty.HARD;
  const ability = 'DEX';
  const keyTraits = new Traits(`DC:${Difficulty.HARD}`);

  for (let abilityValue = 1; abilityValue <= 20; abilityValue++) {
    const modifier = characteristicToModifier(abilityValue);
    const actorTraits = new CharacterTraits(
      `EXP: 15000,${ability}:${abilityValue}, PROF:PICK LOCK`
    );
    const pb = actorTraits.getCharacterPb('PICK LOCK');
    expect(pb).toBeGreaterThan(0);
    for (let diceRoll = 1; diceRoll <= 20; diceRoll++) {
      mockDice.rollDice.mockReturnValueOnce(diceRoll);
      let expectedResult;
      if (diceRoll + modifier + pb >= difficulty) {
        expectedResult = true;
        successes++;
      } else {
        expectedResult = false;
        failures++;
      }
      expect(dndAction.canPickLock(actorTraits, keyTraits)).toBe(
        expectedResult
      );
    }
  }
  expect(successes).toBeGreaterThan(0);
  expect(failures).toBeGreaterThan(0);
});

test('canIdentify', () => {
  let successes = 0;
  let failures = 0;
  const difficulty = Difficulty.HARD;
  const ability = 'WIS';
  const subtype = 'PLANT';
  const objectTraits = new Traits(
    `IDENTIFY_DC:${difficulty}, SUBTYPE:${subtype}`
  );

  for (let abilityValue = 1; abilityValue <= 20; abilityValue++) {
    const modifier = characteristicToModifier(abilityValue);
    const actorTraits = new CharacterTraits(
      `EXP: 15000,${ability}:${abilityValue}, PROF:${subtype}`
    );
    const pb = actorTraits.getCharacterPb(subtype);
    expect(pb).toBeGreaterThan(0);
    for (let diceRoll = 1; diceRoll <= 20; diceRoll++) {
      mockDice.rollDice.mockReturnValueOnce(diceRoll);
      let expectedResult;
      if (diceRoll + modifier + pb >= difficulty) {
        expectedResult = true;
        successes++;
      } else {
        expectedResult = false;
        failures++;
      }
      expect(dndAction.canIdentify(actorTraits, objectTraits)).toBe(
        expectedResult
      );
    }
  }
  expect(successes).toBeGreaterThan(0);
  expect(failures).toBeGreaterThan(0);
});

test('canPerformTask: no proficiency', () => {
  let successes = 0;
  let failures = 0;
  const difficulty = 15;
  const ability = 'DEX';

  for (let abilityValue = 1; abilityValue <= 20; abilityValue++) {
    const modifier = characteristicToModifier(abilityValue);
    const actorTraits = new CharacterTraits(
      `EXP:15000,${ability}:${abilityValue}`
    );
    const pb = 0;
    for (let diceRoll = 1; diceRoll <= 20; diceRoll++) {
      mockDice.rollDice.mockReturnValueOnce(diceRoll);
      let expectedResult;
      if (diceRoll + modifier + pb >= difficulty) {
        expectedResult = true;
        successes++;
      } else {
        expectedResult = false;
        failures++;
      }
      expect(
        dndAction.canPerformTask(actorTraits, {
          ability: ability,
          difficulty: difficulty,
          proficiency: 'SOME TASK',
        })
      ).toBe(expectedResult);
    }
    expect(successes).toBeGreaterThan(0);
    expect(failures).toBeGreaterThan(0);
  }
});

test('canPerformTask: proficient', () => {
  let successes = 0;
  let failures = 0;
  const difficulty = 15;
  const ability = 'DEX';

  for (let abilityValue = 1; abilityValue <= 20; abilityValue++) {
    const modifier = characteristicToModifier(abilityValue);
    const actorTraits = new CharacterTraits(
      `EXP:15000,${ability}:${abilityValue},PROF:SOME TASK`
    );
    const pb = actorTraits.getCharacterPb('SOME TASK');
    expect(pb).toBeGreaterThan(0);
    for (let diceRoll = 1; diceRoll <= 20; diceRoll++) {
      mockDice.rollDice.mockReturnValueOnce(diceRoll);
      let expectedResult;
      if (diceRoll + modifier + pb >= difficulty) {
        expectedResult = true;
        successes++;
      } else {
        expectedResult = false;
        failures++;
      }
      expect(
        dndAction.canPerformTask(actorTraits, {
          ability: ability,
          difficulty: difficulty,
          proficiency: 'SOME TASK',
        })
      ).toBe(expectedResult);
    }
    expect(successes).toBeGreaterThan(0);
    expect(failures).toBeGreaterThan(0);
  }
});

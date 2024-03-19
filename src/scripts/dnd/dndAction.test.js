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
import { test, expect } from '@jest/globals';
import { Actor, ActorType } from '../players/actors.js';
import * as dndAction from './dndAction.js';
import { CharacterTraits } from './traits.js';

test('take rest short with no CON modifier', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;
  let level = 6;
  let hpMax = 30;
  actor.traits = new CharacterTraits();
  actor.traits._level = level;
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', '3D6');
  dndAction.takeRest(actor, 'SHORT');

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBeGreaterThan(hp);
  expect(newHitDice).toBe('2D6');
});

test('take rest short with CON modifier', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;
  let level = 6;
  let hpMax = 30;
  actor.traits = new CharacterTraits();
  actor.traits._level = level;
  actor.traits.set('CON', 16);
  const conModifier = actor.traits.getAsModifier('CON');
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', '3D6');
  dndAction.takeRest(actor, 'SHORT');

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBeGreaterThan(hp + conModifier);
  expect(newHitDice).toBe('2D6');
});

test('take rest short insufficient dice', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;
  let level = 6;
  let hpMax = 30;
  actor.traits = new CharacterTraits();
  actor.traits._level = level;
  actor.traits.set('CON', 16);
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', '0D6');
  dndAction.takeRest(actor, 'SHORT');

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hp);
  expect(newHitDice).toBe('0D6');
});

test('take rest does not exceed HP_MAX', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 10;
  let level = 6;
  let hpMax = 12;
  actor.traits = new CharacterTraits();
  actor.traits._level = level;
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', '3D6');
  dndAction.takeRest(actor, 'SHORT');

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hpMax);
  expect(newHitDice).toBe('2D6');
});

test('takeRest long incrementing by half current hit dice', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 5;
  let level = 10;
  let hpMax = 12;

  const currentHitDice = '6D20';
  const expectedHitDicePostRest = '9D20';

  actor.traits = new CharacterTraits();
  actor.traits._level = level;
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', currentHitDice);
  dndAction.takeRest(actor, 'LONG');

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hpMax);
  expect(newHitDice).toBe(expectedHitDicePostRest);
});

test('takeRest long incrementing hit dice up to normal max.', () => {
  const actor = new Actor({}, ActorType.HERO);
  let hp = 5;
  let level = 10;
  let hpMax = 12;

  const currentHitDice = '9D20';
  const expectedHitDicePostRest = '10D20';

  actor.traits = new CharacterTraits();
  actor.traits._level = level;
  actor.traits.set('HP', hp);
  actor.traits.set('HP_MAX', hpMax);
  actor.traits.set('HIT_DICE', currentHitDice);
  dndAction.takeRest(actor, 'LONG');

  const newHp = actor.traits.getInt('HP');
  const newHitDice = actor.traits.get('HIT_DICE');
  expect(newHp).toBe(hpMax);
  expect(newHitDice).toBe(expectedHitDicePostRest);
});

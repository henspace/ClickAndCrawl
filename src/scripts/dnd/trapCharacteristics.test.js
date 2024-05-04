/**
 * @file Test trapCharacteristics
 *
 * @module dnd/trapCharacteristics.test
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
import * as traps from './trapCharacteristics.js';
import { AttackDetail, Traits } from './traits.js';

test('getCharacteristics setback', () => {
  const severity = 'SETBACK';
  // Take average of ranges from p156 5e, rounded up.
  const difficulty = Math.ceil((10 + 11) / 2);
  const attackBonus = Math.ceil((3 + 5) / 2);
  const trapTraits = new Traits(`REWARD: an artefact, SEVERITY:${severity}`);
  // levels 1 to 4
  expect(traps.getCharacteristics(1, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '1D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(4, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '1D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 5 to 10
  expect(traps.getCharacteristics(5, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '2D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(10, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '2D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 11 to 16
  expect(traps.getCharacteristics(11, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '4D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(16, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '4D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 17 - 20
  expect(traps.getCharacteristics(17, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '10D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(20, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '10D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
});

test('getCharacteristics unrecognised severity falls back to setback', () => {
  const severity = 'UNKNOWN';
  // Take average of ranges from p156 5e, rounded up.
  const difficulty = Math.ceil((10 + 11) / 2);
  const attackBonus = Math.ceil((3 + 5) / 2);
  const trapTraits = new Traits(`REWARD: an artefact, SEVERITY:${severity}`);
  // levels 1 to 4
  expect(traps.getCharacteristics(1, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '1D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(4, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '1D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 5 to 10
  expect(traps.getCharacteristics(5, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '2D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(10, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '2D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 11 to 16
  expect(traps.getCharacteristics(11, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '4D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(16, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '4D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 17 - 20
  expect(traps.getCharacteristics(17, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '10D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(20, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '10D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
});

test('getCharacteristics dangerous', () => {
  const severity = 'DANGEROUS';
  // Take average of ranges from p156 5e, rounded up.
  const difficulty = Math.ceil((12 + 15) / 2);
  const attackBonus = Math.ceil((6 + 8) / 2);
  const trapTraits = new Traits(`REWARD: an artefact, SEVERITY:${severity}`);
  // levels 1 to 4
  expect(traps.getCharacteristics(1, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '2D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(4, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '2D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 5 to 10
  expect(traps.getCharacteristics(5, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '4D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(10, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '4D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 11 to 16
  expect(traps.getCharacteristics(11, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '10D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(16, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '10D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 17 - 20
  expect(traps.getCharacteristics(17, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '18D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(20, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '18D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
});

test('getCharacteristics deadly', () => {
  const severity = 'DEADLY';
  // Take average of ranges from p156 5e, rounded up.
  const difficulty = Math.ceil((16 + 20) / 2);
  const attackBonus = Math.ceil((9 + 12) / 2);
  const trapTraits = new Traits(`REWARD: an artefact, SEVERITY:${severity}`);
  // levels 1 to 4
  expect(traps.getCharacteristics(1, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '4D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(4, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '4D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 5 to 10
  expect(traps.getCharacteristics(5, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '10D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(10, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '10D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 11 to 16
  expect(traps.getCharacteristics(11, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '18D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(16, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '18D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  // levels 17 - 20
  expect(traps.getCharacteristics(17, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '24D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
  expect(traps.getCharacteristics(20, trapTraits)).toEqual({
    difficulty: difficulty,
    attack: new AttackDetail({
      damageDice: '24D10',
      weaponType: 'TRAP',
      proficiencyBonus: 0,
      abilityModifier: attackBonus,
    }),
    reward: 'an artefact',
    detectBy: 'WIS',
    disableBy: 'INT',
  });
});

test('getCharacteristics default detect and disable', () => {
  const trapTraits = new Traits(`REWARD: an artefact, SEVERITY:SETBACK`);
  const details = traps.getCharacteristics(6, trapTraits);
  expect(details.detectBy).toBe('WIS');
  expect(details.disableBy).toBe('INT');
});

test('getCharacteristics default detect and disable override', () => {
  const detectBy = 'ATTR1';
  const disableBy = 'ATTR2';
  const trapTraits = new Traits(
    `SEVERITY:SETBACK, DETECT_BY:${detectBy}, DISABLE_BY:${disableBy}`
  );
  const details = traps.getCharacteristics(6, trapTraits);
  expect(details.detectBy).toBe(detectBy);
  expect(details.disableBy).toBe(disableBy);
});

test('getCharacteristics provides reward', () => {
  const trapTraits = new Traits(`REWARD: gold_coins, SEVERITY:SETBACK`);
  const details = traps.getCharacteristics(6, trapTraits);
  expect(details.reward).toBe('gold_coins');
});

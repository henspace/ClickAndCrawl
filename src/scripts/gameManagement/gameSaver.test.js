/**
 * @file Test game saver
 *
 * @module gameManagement/gameSaver.test
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
import { beforeAll, beforeEach, jest, test, expect } from '@jest/globals';
import { sceneToFloor } from '../dnd/floorNumbering.js';

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

jest.unstable_mockModule('./sceneManager.js', () => {
  return {
    __esModule: true,
    default: {
      getCurrentSceneLevel: jest.fn(() => 1),
    },
  };
});

await import('../utils/game/screen.js');
const SCENE_MANAGER = (await import('./sceneManager.js')).default;
const { parseAlmanacLine } = await import('../dnd/almanacs/almanacs.js');
const { buildActor } = await import('../dnd/almanacs/actorBuilder.js');
const { getMinExpPointsForLevel } = await import('../dnd/tables.js');
const PERSISTENT_DATA = (await import('../utils/persistentData.js')).default;
const gameSaver = await import('./gameSaver.js');

const mockedStorage = (() => {
  const map = new Map();
  return {
    getItem: jest.fn((key) => map.get(key)),
    setItem: jest.fn((key, value) => map.set(key, value)),
    clear: jest.fn(() => map.clear()),
  };
})();

beforeAll(() => {
  PERSISTENT_DATA.setStorage(mockedStorage);
});

beforeEach(() => {
  jest.clearAllMocks();
  PERSISTENT_DATA.clearAll();
  mockedStorage.clear();
});

test('getLeaderboard', () => {
  const leaderboardData = ['lion', 'tiger', 'bear'];
  let leaderBoard = gameSaver.getLeaderboard();
  expect(leaderBoard.getCurrentData()).toEqual([]);
  PERSISTENT_DATA.set('LEADERBOARD_DATA', leaderboardData);
  leaderBoard = gameSaver.getLeaderboard();
  expect(leaderBoard.getCurrentData()).toEqual(leaderboardData);
});

test('saveGameState', () => {
  const sceneLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);
  const gold = 10;
  const goldSent = 1200;
  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  const hero = buildActor(almanacEntry);
  hero.storeManager.addToPurse(gold);
  hero.traits.set('GOLD_SENT', goldSent);
  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValueOnce(sceneLevel);
  gameSaver.saveGameState(hero);
  const leaderboard = gameSaver.getLeaderboard();
  const leaderboardData = leaderboard.getCurrentData();
  expect(leaderboardData[0]).toEqual({
    adventureStartTime: hero.adventureStartTime,
    name: hero.traits.get('NAME'),
    class: hero.traits.get('CLASS'),
    gold: gold,
    goldSent: goldSent,
    exp: exp,
    characterLevel: characterLevel,
    dungeonFloor: sceneToFloor(sceneLevel),
    completed: false,
  });
});

test('saveGameState: completed', () => {
  const sceneLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);
  const gold = 10;
  const goldSent = 5000;
  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  const hero = buildActor(almanacEntry);
  hero.storeManager.addToPurse(gold);
  hero.traits.set('GOLD_SENT', goldSent);
  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValueOnce(sceneLevel);
  gameSaver.saveGameState(hero, true);
  const leaderboard = gameSaver.getLeaderboard();
  const leaderboardData = leaderboard.getCurrentData();
  expect(leaderboardData[0]).toEqual({
    adventureStartTime: hero.adventureStartTime,
    name: hero.traits.get('NAME'),
    class: hero.traits.get('CLASS'),
    gold: gold,
    goldSent: goldSent,
    exp: exp,
    characterLevel: characterLevel,
    dungeonFloor: sceneToFloor(sceneLevel),
    completed: true,
  });
});

test('saveGameState adds if better', () => {
  const sceneLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);

  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  // fill the leaderboard.
  for (let n = 0; n <= 12; n++) {
    const hero = buildActor(almanacEntry);
    (hero.adventureStartTime = 1000 + n), hero.traits.set('NAME', `NAME${n}`);
    hero.storeManager.addToPurse(100 - n);
    hero.traits.set('GOLD_SENT', 100 + n);
    SCENE_MANAGER.getCurrentSceneLevel.mockReturnValueOnce(sceneLevel);
    gameSaver.saveGameState(hero);
  }

  const leaderboard = gameSaver.getLeaderboard();
  const leaderboardData = leaderboard.getCurrentData();
  expect(leaderboardData).toHaveLength(10);
  expect(leaderboardData[0]).toEqual({
    adventureStartTime: 1012,
    name: 'NAME12',
    class: 'FIGHTER',
    gold: 100 - 12,
    goldSent: 100 + 12,
    exp: exp,
    characterLevel: characterLevel,
    dungeonFloor: sceneToFloor(sceneLevel),
    completed: false,
  });
  expect(leaderboardData[9]).toEqual({
    adventureStartTime: 1003,
    name: 'NAME3',
    class: 'FIGHTER',
    gold: 100 - 3,
    goldSent: 100 + 3,
    exp: exp,
    characterLevel: characterLevel,
    dungeonFloor: sceneToFloor(sceneLevel),
    completed: false,
  });
});

test('restoreGameState retrieves actor and scene level', () => {
  const sceneLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);
  const gold = 10;
  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  const hero = buildActor(almanacEntry);
  hero.storeManager.addToPurse(gold);

  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValue(sceneLevel);
  gameSaver.saveGameState(hero);
  const restored = gameSaver.restoreGameState();

  /* Remove items that should not be compared. */
  restored.hero.interaction = undefined;
  hero.interaction = undefined;
  if (hero.almanacEntry.equipmentIds === undefined) {
    restored.hero.almanacEntry.equipmentIds = undefined; // it won't have been parsed as JSON.
  }
  expect(restored).toEqual({
    hero: hero,
    sceneLevel: sceneLevel,
  });
});

test('restoreGameState returns undefined if actor not alive', () => {
  const sceneLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);
  const gold = 10;
  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  const hero = buildActor(almanacEntry);
  hero.storeManager.addToPurse(gold);
  hero.alive = false;
  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValue(sceneLevel);
  gameSaver.saveGameState(hero);
  const restored = gameSaver.restoreGameState();
  expect(restored).toBeUndefined();
});

test('restoreGameState returns undefined if no saved game', () => {
  const sceneLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);
  const gold = 10;
  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  const hero = buildActor(almanacEntry);
  hero.storeManager.addToPurse(gold);
  hero.alive = false;
  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValue(sceneLevel);
  gameSaver.saveGameState(hero);
  mockedStorage.clear();
  const restored = gameSaver.restoreGameState();
  expect(restored).toBeUndefined();
});

test('restoreGameState returns undefined if completed', () => {
  const sceneLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);
  const gold = 10;
  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  const hero = buildActor(almanacEntry);
  hero.storeManager.addToPurse(gold);
  hero.alive = false;
  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValue(sceneLevel);
  gameSaver.saveGameState(hero, true);
  const restored = gameSaver.restoreGameState();
  expect(restored).toBeUndefined();
});

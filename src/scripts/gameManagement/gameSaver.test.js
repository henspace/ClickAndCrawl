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

test('getBestAdventure', () => {
  const bestAdventure = 'random data';
  PERSISTENT_DATA.set('BEST_ADVENTURE', bestAdventure);
  expect(gameSaver.getBestAdventure()).toEqual(bestAdventure);
});

test('saveGameState', () => {
  const dungeonLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);
  const gold = 10;
  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  const hero = buildActor(almanacEntry);
  hero.storeManager.addToPurse(gold);
  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValueOnce(dungeonLevel);
  gameSaver.saveGameState(hero);
  const bestAdventure = gameSaver.getBestAdventure();
  expect(bestAdventure).toEqual({
    name: hero.traits.get('NAME'),
    gold: gold,
    exp: exp,
    characterLevel: characterLevel,
    dungeonLevel: dungeonLevel,
    score: Math.floor(100 * gold * characterLevel),
  });
});

test('saveGameState overwrites if better', () => {
  const dungeonLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);
  const goldWorst = 10;
  const goldBest = 2 * goldWorst;
  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  const heroWorst = buildActor(almanacEntry);
  const heroBest = buildActor(almanacEntry);
  heroWorst.storeManager.addToPurse(goldWorst);
  heroBest.storeManager.addToPurse(goldBest);

  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValueOnce(dungeonLevel);
  gameSaver.saveGameState(heroWorst);
  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValueOnce(dungeonLevel);
  gameSaver.saveGameState(heroBest);
  const bestAdventure = gameSaver.getBestAdventure();
  expect(bestAdventure).toEqual({
    name: heroBest.traits.get('NAME'),
    gold: goldBest,
    exp: exp,
    characterLevel: characterLevel,
    dungeonLevel: dungeonLevel,
    score: Math.floor(100 * goldBest * characterLevel),
  });
});

test('saveGameState does not overwrite if worse', () => {
  const dungeonLevel = 12;
  const characterLevel = 6;
  const exp = getMinExpPointsForLevel(characterLevel);
  const goldWorst = 10;
  const goldBest = 2 * goldWorst;
  const almanacEntry = parseAlmanacLine(
    `0,COMMON,HERO,fighter1 * CLASS:FIGHTER,HIT_DICE:1D12,EXP:${exp}`,
    'HEROES'
  );
  const heroWorst = buildActor(almanacEntry);
  const heroBest = buildActor(almanacEntry);
  heroWorst.storeManager.addToPurse(goldWorst);
  heroBest.storeManager.addToPurse(goldBest);

  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValueOnce(dungeonLevel);
  gameSaver.saveGameState(heroBest);
  SCENE_MANAGER.getCurrentSceneLevel.mockReturnValueOnce(dungeonLevel);
  gameSaver.saveGameState(heroWorst);
  const bestAdventure = gameSaver.getBestAdventure();
  expect(bestAdventure).toEqual({
    name: heroBest.traits.get('NAME'),
    gold: goldBest,
    exp: exp,
    characterLevel: characterLevel,
    dungeonLevel: dungeonLevel,
    score: Math.floor(100 * goldBest * characterLevel),
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

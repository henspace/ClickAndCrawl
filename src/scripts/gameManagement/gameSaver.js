/**
 * @file Saver for games
 *
 * @module gameManagement/gameSaver
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

import SCENE_MANAGER from './sceneManager.js';
import PERSISTENT_DATA from '../utils/persistentData.js';
import LOG from '../utils/logging.js';
import { buildActor } from '../dnd/almanacs/actorBuilder.js';
import { buildArtefact } from '../dnd/almanacs/artefactBuilder.js';
import { Actor } from '../players/actors.js';
import { Artefact } from '../players/artefacts.js';
import { Traits, CharacterTraits, MagicTraits } from '../dnd/traits.js';
import { Toxin } from '../dnd/toxins.js';
import { sceneToFloor } from '../dnd/floorNumbering.js';
import { Leaderboard } from '../utils/leaderBoard.js';

/** @type {number} */
const DEFAULT_LEADERBOARD_LEN = 10;

/** @type {string} */
const LEADERBOARD_DATA_KEY = 'LEADERBOARD_DATA';

/** @typedef {Object} AdventureResult
 * @property {number} adventureStartTime
 * @property {string} name
 * @property {number} gold
 * @property {number} goldSent
 * @property {number} exp
 * @property {number} characterLevel
 * @property {number} dungeonFloor
 */

/**
 * Create an adventure result
 * @param {module:players/actors.Actor} hero
 * @param {boolean} completed
 * @returns {AdventureResult}
 */
function createAdventureResult(hero, completed) {
  const result = {
    adventureStartTime: 0,
    name: 'unknown',
    class: 'unknown',
    gold: 0,
    goldSent: 0,
    exp: 0,
    characterLevel: 0,
    dungeonFloor: 0,
    completed: false,
  };
  if (hero) {
    result.adventureStartTime = hero.adventureStartTime;
    result.name = hero.traits.get('NAME');
    result.class = hero.traits.get('CLASS');
    result.gold = hero.storeManager.getPurseValue();
    result.goldSent = hero.traits.getInt('GOLD_SENT', 0);
    result.exp = hero.traits.getInt('EXP', 0);
    result.characterLevel = hero.traits.getCharacterLevel();
    result.dungeonFloor = sceneToFloor(SCENE_MANAGER.getCurrentSceneLevel());
    result.completed = completed;
  }
  return result;
}

/**
 * Get the leaderboard.
 * @returns {module:utils/Leaderboard.LeaderBoard}
 */
export function getLeaderboard() {
  const data = PERSISTENT_DATA.get(LEADERBOARD_DATA_KEY);
  return new Leaderboard(data, {
    maxLength: DEFAULT_LEADERBOARD_LEN,
    sortFn: (a, b) => (a.goldSent > b.goldSent ? -1 : 1),
    equalFn: (a, b) =>
      a.adventureStartTime === b.adventureStartTime && a.name === b.name,
  });
}

/**
 * Get the best stored adventure result.
 * @param {AdventureResult} adventureResult
 * @returns {number} index of the new entry 0 is first. -1 is unplaced.
 */
function saveToLeaderboard(adventureResult) {
  const leaderboard = getLeaderboard();
  const index = leaderboard.add(adventureResult);
  if (index >= 0) {
    PERSISTENT_DATA.set(LEADERBOARD_DATA_KEY, leaderboard.getCurrentData());
  }
  return index;
}

/**
 * Save the current game. The adventure is also added to the leaderboard if good
 * enough.
 * @param {module:players/actors.Actor} hero
 * @param {boolean} [completed = false]
 * @returns {number} position in leaderboard. 0 is top. -1 is unplaced.
 */
export function saveGameState(hero, completed = false) {
  const adventureResult = createAdventureResult(hero, completed);
  const leaderboardIndex = saveToLeaderboard(adventureResult);
  const gameState = {
    sceneLevel: SCENE_MANAGER.getCurrentSceneLevel(),
    hero: hero,
    completed: completed,
  };
  PERSISTENT_DATA.set('GAME_STATE', gameState);
  return leaderboardIndex;
}

/** Restore the game state.
 * The state is only restored if the hero is alive.
 *
 * @returns {{hero: Actor, sceneLevel: number, completed: boolean}} - undefined if failure
 */
export function restoreGameState() {
  const gameState = PERSISTENT_DATA.get('GAME_STATE', null, revive);

  if (!gameState) {
    LOG.debug('No saved game state to restore.');
    return;
  }
  if (!gameState.hero.alive) {
    LOG.debug('Last hero state was dead, so not restoring.');
    return;
  }
  if (gameState.completed) {
    LOG.debug('Last game was completed, so not restoring.');
    return;
  }
  return { hero: gameState.hero, sceneLevel: gameState.sceneLevel };
}

/**
 * Reviver function called by JSON.parse
 * @param {string} keyUnused
 * @param {*} value
 */
function revive(keyUnused, value) {
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
}

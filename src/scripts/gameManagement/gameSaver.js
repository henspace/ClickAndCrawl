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

/** @typedef {Object} AdventureResult
 * @property {string} name
 * @property {number} gold
 * @property {number} exp
 * @property {number} characterLevel
 * @property {number} dungeonFloor
 */

/**
 * Create an adventure result
 * @param {module:players/actors.Actor} hero
 * @returns {AdventureResult}
 */
function createAdventureResult(hero) {
  const result = {
    name: 'unknown',
    gold: 0,
    exp: 0,
    characterLevel: 0,
    dungeonFloor: 0,
    score: 0,
  };
  if (hero) {
    result.name = hero.traits.get('NAME');
    result.gold = hero.storeManager.getPurseValue();
    result.exp = hero.traits.getInt('EXP', 0);
    result.characterLevel = hero.traits.getCharacterLevel();
    result.dungeonFloor = sceneToFloor(SCENE_MANAGER.getCurrentSceneLevel());
    result.score = Math.floor(100 * result.gold * result.characterLevel);
  }
  return result;
}

/**
 * Get the best stored adventure result.
 * @returns {AdventureResult}
 */
export function getBestAdventure() {
  return PERSISTENT_DATA.get('BEST_ADVENTURE');
}

/**
 * Get the best stored adventure result.
 * @param {AdventureResult} adventureResult
 */
function saveBestAdventure(adventureResult) {
  return PERSISTENT_DATA.set('BEST_ADVENTURE', adventureResult);
}

/**
 * Save the hero's adventure if better than the last.
 * @param {module:players/actors.Actor} hero
 */
function saveAdventureIfBest(hero) {
  const adventureResult = createAdventureResult(hero);
  const currentBest = getBestAdventure();
  const lastScore = currentBest?.score ?? 0;

  if (adventureResult.score > lastScore) {
    saveBestAdventure(adventureResult);
  }
}
/**
 * Save the current game. The adventure is also saved if better than previous
 * attempts.
 * @param {module:players/actors.Actor} hero
 */
export function saveGameState(hero) {
  saveAdventureIfBest(hero);
  const gameState = {
    sceneLevel: SCENE_MANAGER.getCurrentSceneLevel(),
    hero: hero,
  };
  PERSISTENT_DATA.set('GAME_STATE', gameState);
}

/** Restore the game state.
 * The state is only restored if the hero is alive.
 *
 * @returns {{hero: Actor, sceneLevel: number}} - undefined if failure
 */
export function restoreGameState() {
  const gameState = PERSISTENT_DATA.get('GAME_STATE', null, revive);

  if (!gameState) {
    LOG.info('No saved game state to restore.');
    return;
  }
  if (!gameState.hero.alive) {
    LOG.info('Last hero state was dead, so not restoring.');
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

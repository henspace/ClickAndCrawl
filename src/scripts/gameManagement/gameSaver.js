/**
 * @file Saver for games
 *
 * @module gameManagement\gameSaver
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
import { strToActorType } from '../players/actors.js';
import { strToArtefactType } from '../players/artefacts.js';

/**
 * Save the current game
 * @param {Actor} hero
 */
export function saveGameState(hero) {
  const storageDetails = hero.storeManager.getAllStorageDetails();
  const artefactDetails = [];
  storageDetails.forEach((detail) =>
    artefactDetails.push({
      storeTypeId: detail.store.storeTypeId,
      almanacEntry: detail.artefact.almanacEntry,
      traitsString: detail.artefact.traits.valuesToString(),
    })
  );

  const gameState = {
    sceneLevel: SCENE_MANAGER.getCurrentSceneLevel(),
    hero: {
      alive: hero.alive,
      almanacEntry: hero.almanacEntry,
      traitsString: hero.traits.valuesToString(),
      artefactDetails: artefactDetails,
    },
  };
  PERSISTENT_DATA.set('GAME_STATE', gameState);
}

/** Restore the game state.
 * The state is only restored if the hero is alive.
 *
 * @returns {{hero: Actor, sceneLevel: number}} - undefined if failure
 */
export function restoreGameState() {
  const gameState = PERSISTENT_DATA.get('GAME_STATE');
  if (!gameState) {
    LOG.info('No saved game state to restore.');
    return;
  }
  if (!gameState.hero.alive) {
    LOG.info('Last hero state was dead, so not restoring.');
    return;
  }
  gameState.hero.almanacEntry.equipmentIds = []; // these are intial arefacts which may have been dropped.
  gameState.hero.almanacEntry.type = strToActorType(
    gameState.hero.almanacEntry.typeId
  );
  const heroActor = buildActor(
    gameState.hero.almanacEntry,
    gameState.hero.traitsString
  );
  gameState.hero.artefactDetails.forEach((details) => {
    details.almanacEntry.type = strToArtefactType(details.almanacEntry.typeId);
    const artefact = buildArtefact(details.almanacEntry, details.traitsString);
    const store = heroActor.storeManager.getStoreByTypeId(details.storeTypeId);
    if (!store) {
      LOG.error(
        `Unable to find store matching ${details.storeTypeId}. Game restore abandoned.`
      );
      return;
    }
    store.add(artefact);
  });
  return { hero: heroActor, sceneLevel: gameState.sceneLevel };
}

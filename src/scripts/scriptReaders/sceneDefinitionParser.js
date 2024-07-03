/**
 * @file Convert a screen definition into a scene.
 *
 * @module scriptReaders/sceneDefinitionParser
 */
/**
 * License {@link https://opensource.org/license/mit/|MIT}
 *
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

import { TilePlan } from '../utils/tileMaps/tilePlan.js';
import { TileMap } from '../utils/tileMaps/tileMap.js';
import TURN_MANAGER from '../gameManagement/turnManager.js';
import WORLD from '../utils/game/world.js';
import SCREEN from '../utils/game/screen.js';
import { TILE_MAP_KEYS } from './symbolMapping.js';
import { AbstractScene } from '../utils/game/scene.js';
import SCENE_MANAGER from '../gameManagement/sceneManager.js';
import GameConstants from '../utils/game/gameConstants.js';
import { Actor, ActorType } from '../players/actors.js';

import { buildActor } from '../dnd/almanacs/actorBuilder.js';
import { buildArtefact } from '../dnd/almanacs/artefactBuilder.js';
import { ALMANAC_LIBRARY } from '../dnd/almanacs/almanacs.js';
import { rollDice } from '../utils/dice.js';
import { ArtefactType, artefactTypesEqual } from '../players/artefacts.js';
import * as almanacUtils from '../dnd/almanacs/almanacUtils.js';
import LOG from '../utils/logging.js';
import * as maths from '../utils/maths.js';

const GRID_SIZE = GameConstants.TILE_SIZE;

/** @type {module:players/actors.Actor} */
let lastHero;

/**
 * @typedef {Object} ActorDefn
 * @property {string} id
 * @property {module:dnd/traits~CharacterTraits} traits
 * @property {string} description
 */

/**
 * Create the hero. If the scene definition doesn't have a hero definition, the
 * lastHero is used.
 * @param {SceneDefinition} sceneDefn
 * @returns {module:players/actors.Actor}
 */
function createHero(sceneDefn) {
  if (sceneDefn.hero instanceof Actor) {
    lastHero = sceneDefn.hero;
  } else if (sceneDefn.hero) {
    const actor = buildActor(sceneDefn.hero);
    lastHero = actor;
  } else if (!lastHero) {
    throw new Error('No hero has been defined.');
  }

  return lastHero;
}
/**
 * Create the enemies.
 * @param {SceneDefinition} sceneDefn
 * @returns {Actor[]}
 */
function createEnemies(sceneDefn) {
  const enemies = [];
  sceneDefn.enemies.forEach((almanacEntry) => {
    const actor = buildActor(almanacEntry);
    const possibleLikelihoods = [0, 0.5, 1];
    const likelihoodSleeping =
      possibleLikelihoods[maths.getRandomInt(0, possibleLikelihoods.length)];
    if (
      !actor.traits.get('UNDEAD', false) &&
      actor.traits.get('MOVE', '') !== 'ORGANIC'
    ) {
      actor.sleeping = Math.random() <= likelihoodSleeping;
    }
    enemies.push(actor);
  });
  return enemies;
}

/**
 * Create the portal.
 * @param {SceneDefinition} sceneDefn
 * @returns {module:players/actors.Actor} null if not created.
 */
function createPortal(sceneDefn) {
  return sceneDefn.portal ? buildActor(sceneDefn.portal) : null;
}

/** Create an artefact that is located in the dungeon.
 * The artefact is placed in a suitable actor such as a
 * pillar or as a hidden artefact.
 * @param {AlmanacEntry} almanacEntry
 * @param {module:players/artefacts.Artefact} [preBuiltArtefact] if not provided, the artefact is built from the
 * almanac entry.
 * @returns {module:players/actors.Actor} actor containing the artefact
 */
function createFindableArtefact(almanacEntry, preBuiltArtefact) {
  let id;
  let type;
  if (
    artefactTypesEqual(almanacEntry.type, ArtefactType.CONSUMABLE) &&
    /SUBTYPE *: *VEGETATION/i.test(almanacEntry.traitsString)
  ) {
    id = 'vegetation';
    type = ActorType.HIDDEN_ARTEFACT;
  } else {
    switch (almanacEntry.type.id) {
      case ArtefactType.SPELL.id:
      case ArtefactType.CANTRIP.id:
        id = 'engraved_pillar';
        type = ActorType.PROP;
        break;
      default:
        {
          const roll = rollDice(6);
          if (roll < 3) {
            id = 'hidden_artefact';
          } else if (roll < 5) {
            id = 'trapdoor';
          } else {
            id = 'manhole_cover';
          }
        }
        type = ActorType.HIDDEN_ARTEFACT;
        break;
    }
  }

  const actor = buildActor({
    id: id,
    name: almanacUtils.createNameFromId(id),
    description: almanacUtils.createDescriptionFromId(id),
    imageName: id,
    type: type,
    traitsString: '',
  });
  const artefact = preBuiltArtefact ?? buildArtefact(almanacEntry);
  actor.storeManager.addArtefact(artefact);
  return actor;
}

/**
 * Create the artefacts.
 * @param {SceneDefinition} sceneDefn
 * @returns {Actor[]}
 */
function createArtefacts(sceneDefn) {
  const artefacts = [];
  sceneDefn.artefacts.forEach((almanacEntry) => {
    const holdingActor = createFindableArtefact(almanacEntry);
    artefacts.push(holdingActor);
  });
  return artefacts;
}

/**
 * Add an artefact from the almanac.
 * @param {Actor[]} actors
 * @param {AlmanacEntry} almanacEntry
 * @param {Object} options
 * @param {boolean} options.equip - if true, try to equip rather than stash.
 */
function addArtefactToActor(actor, almanacEntry, options) {
  if (almanacEntry) {
    const artefact = buildArtefact(almanacEntry);
    if (options.equip && artefact.equipStoreType) {
      actor.storeManager?.equip(artefact, { direct: true });
    } else {
      actor.storeManager?.stash(artefact, { direct: true });
    }
  }
}

/**
 * Add an artefact from the almanac.
 * @param {Actor[]} actors
 * @param {Almanac} almanac
 * @param {Object} options
 * @param {number} options.qty - number to add.
 * @param {boolean} options.equip - if true, try to equip rather than stash.
 */
function addRandomArtefactsToActor(actor, almanac, options) {
  while (options.qty-- > 0) {
    const almanacEntry = almanac.getRandomEntry();
    addArtefactToActor(actor, almanacEntry, options);
  }
}

/**
 * Scene created from a scene definition.
 */
class ParsedScene extends AbstractScene {
  /** @type {SceneDefinition} */
  #sceneDefn;

  /** Construct the scene from a definition. */
  constructor(sceneDefn) {
    super();
    this.#sceneDefn = sceneDefn;
    this.intro = sceneDefn.intro;
  }

  /** @override */
  doLoad() {
    return Promise.resolve();
  }

  doInitialise() {
    const tilePlan = TilePlan.generateTileMapPlan(
      this.#sceneDefn.mapDesign,
      TILE_MAP_KEYS
    );
    this.heroActor = createHero(this.#sceneDefn);
    const tileMap = new TileMap(
      SCREEN.getContext2D(),
      tilePlan,
      GRID_SIZE,
      this.heroActor
    );
    WORLD.setTileMap(tileMap);

    let portal = createPortal(this.#sceneDefn);
    if (portal) {
      const freeTile = tileMap.getRandomFreeGroundTile();
      if (freeTile) {
        portal.position = freeTile.worldPoint;
        WORLD.addArtefact(portal);
      } else {
        LOG.debug('No free tiles for portal.');
        portal = null;
      }
    }

    const exitKeyAlmanacEntry = ALMANAC_LIBRARY.getRandomEntry('KEYS');
    const exitKeyArtefact =
      rollDice(6) > 3 ? buildArtefact(exitKeyAlmanacEntry) : null;
    let keysToAdd = exitKeyArtefact ? 1 : 0;

    const pooledArtefactAlmanac = ALMANAC_LIBRARY.getPooledAlmanac(
      ['ARTEFACTS', 'ARMOUR', 'WEAPONS'],
      (entry) => entry.minLevel <= SCENE_MANAGER.getCurrentSceneLevel()
    );

    const water = pooledArtefactAlmanac.find(
      (entry) => entry.id === 'waterskin'
    );
    const rations = pooledArtefactAlmanac.find(
      (entry) => entry.id === 'iron_rations'
    );

    for (const enemy of createEnemies(this.#sceneDefn)) {
      const freeTile = tileMap.getRandomFreeGroundTile();
      if (!freeTile) {
        LOG.debug('No free tiles for enemy.');
        break;
      }
      enemy.position = freeTile.worldPoint;
      WORLD.addActor(enemy);
      if (enemy.isTrader()) {
        enemy.traits.exceedAbilitiesAndExp?.(this.heroActor.traits, 1);
        let qtyOfItems = 7;
        if (rollDice(6) > 3) {
          addArtefactToActor(enemy, water, { equip: false });
          qtyOfItems--;
        }
        if (rollDice(6) > 3) {
          addArtefactToActor(enemy, rations, { equip: false });
          qtyOfItems--;
        }
        addRandomArtefactsToActor(enemy, pooledArtefactAlmanac, {
          qty: qtyOfItems,
          equip: false,
        });
      } else if (
        keysToAdd &&
        !enemy.isOrganic() &&
        enemy.traits.get('HAS_KEYS')
      ) {
        enemy.storeManager.stash(exitKeyArtefact, {
          direct: true,
        });
        keysToAdd = 0;
        LOG.debug('Added key to actor.');
      }
    }
    if (keysToAdd) {
      const holdingActor = createFindableArtefact(
        exitKeyAlmanacEntry,
        exitKeyArtefact
      );
      const freeTile = tileMap.getRandomFreeGroundTile();
      if (freeTile) {
        holdingActor.position = freeTile.worldPoint;
        WORLD.addArtefact(holdingActor);
        keysToAdd = 0;
        LOG.debug('Added key as hidden object.');
      }
    }

    for (const artefact of createArtefacts(this.#sceneDefn)) {
      const freeTile = tileMap.getRandomFreeGroundTile();
      if (!freeTile) {
        LOG.debug('No free tile to add artefact.');
        break;
      }
      artefact.position = freeTile.worldPoint;
      WORLD.addArtefact(artefact);
    }
    SCENE_MANAGER.setCameraToTrack(this.heroActor.sprite, 200, 0);
    WORLD.addActor(this.heroActor);
    TURN_MANAGER.setHero(this.heroActor);
    // if keysToAdd > 0 we couldn't find a free tile for it, son don't use.
    if (keysToAdd > 0) {
      TURN_MANAGER.setExitKeyArtefact(null);
    } else {
      TURN_MANAGER.setExitKeyArtefact(exitKeyArtefact);
    }

    return Promise.resolve();
  }

  /**
   * @override
   */
  doUpdate(deltaSecondsUnused) {
    return;
  }

  /**
   * @override
   */
  doUnload() {
    return Promise.resolve(null);
  }
}

/**
 * Parse the scene definition to create a Scene
 * @param {SceneDefinition} sceneDefn
 * @returns {Scene}
 */
export function parseSceneDefinition(sceneDefn) {
  return new ParsedScene(sceneDefn);
}

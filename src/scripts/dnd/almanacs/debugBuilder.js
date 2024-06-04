/**
 * @file Class for building a debug actor
 *
 * @module dnd/almanacs/debugBuilder
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

import * as almanacs from './almanacs.js';
import { buildActor } from './actorBuilder.js';
import { buildArtefact } from './artefactBuilder.js';
import LOG from '../../utils/logging.js';
import { Traits } from '../traits.js';

const GANDALPH =
  '0,COMMON,HERO,wizard1 [chain_mail_armour,iron_rations, iron_rations, iron_rations, waterskin, waterskin, waterskin,copper_coins] * NAME:Gandalph,CLASS:WIZARD,HIT_DICE:1D8,EXP:0, AC:10,_SPEED:30 FEET';

/**
 * Create a hero depending on what is passed on the URL.
 * @returns {module:dnd/almanacs~AlmanacEntry}
 */
export function createDebugEnemyEntry() {
  if (window.location.hostname !== 'localhost') {
    return;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const enemyId = searchParams.get('ENEMY');
  if (enemyId) {
    const actors = almanacs.ALMANAC_LIBRARY.getAlmanac('ENEMIES');
    return actors?.find((entry) => entry.id === enemyId);
  } else {
    return;
  }
}
/**
 * Create a hero depending on what is passed on the URL.
 * @returns {module:players/actors.Actor}
 */
export function createDebugHero() {
  if (window.location.hostname !== 'localhost') {
    return;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const heroId = searchParams.get('HERO');
  if (!heroId) {
    return;
  }
  let hero;
  let hasAllMagic = false;
  if (heroId.toUpperCase() === 'GANDALPH') {
    const almanacEntry = almanacs.parseAlmanacLine(GANDALPH, 'HEROES');
    hero = buildActor(almanacEntry);
    hasAllMagic = true;
  } else {
    hero = buildActorFromAlmanac('HEROES', heroId);
    if (!hero) {
      return;
    }
  }
  const equipSpells = searchParams.get('equipSpells') !== null;
  const stashSpells = searchParams.get('stashSpells') !== null;
  if (equipSpells || stashSpells) {
    const magic = almanacs.ALMANAC_LIBRARY.getAlmanac('MAGIC');
    addAllMagicToHero(hero, magic.common, equipSpells, hasAllMagic);
    addAllMagicToHero(hero, magic.uncommon, equipSpells, hasAllMagic);
    addAllMagicToHero(hero, magic.rare, equipSpells, hasAllMagic);
    addAllMagicToHero(hero, magic.veryRare, equipSpells, hasAllMagic);
  }

  // Give hero an artefact defined in the search params..
  for (const key of ['ARMOUR', 'ARTEFACTS', 'PLANTS', 'WEAPONS']) {
    addToBackpack(hero, key, searchParams.get(key));
  }

  return hero;
}

/**
 * Build actor from almanac.
 * @param {string} almanacKey
 * @param {string} actorId
 * @returns {module:players/actors.Actor}
 */
function buildActorFromAlmanac(almanacKey, actorId) {
  const actors = almanacs.ALMANAC_LIBRARY.getAlmanac(almanacKey);
  const almanacEntry = actors?.find((entry) => entry.id === actorId);
  if (!almanacEntry) {
    LOG.error(
      `Cannot find actor ${actorId} in ${almanacKey} almanac, so ignoring.`
    );
    return;
  }
  const actor = buildActor(almanacEntry);
  if (!actor) {
    LOG.error(
      `Cannot build actor ${actorId} in ${almanacKey} almanac, so ignoring.`
    );
    return;
  }
  return actor;
}

/**
 *
 * @param {module:players/actors.Actor} hero
 * @param {module:dnd/almanacs/almanacs.AlmanacEntry[]} entries
 * @param {boolean} equipSpells - if true, spells don't need to be prepared.
 * @param {boolean} allMagic - if true, the hero gets everything even if they are the wrong caster
 */
function addAllMagicToHero(hero, entries, equipSpells, allMagic) {
  for (const entry of entries) {
    const traits = new Traits(entry.traitsString);
    if (
      allMagic ||
      traits.get('CASTERS', '').indexOf(hero.traits.get('CLASS', '')) >= 0
    ) {
      const magic = buildArtefact(entry);
      if (entry.typeId === 'CANTRIP' || equipSpells) {
        hero.storeManager.equip(magic, { direct: true });
      } else {
        hero.storeManager.stash(magic, { direct: true });
      }
    }
  }
}

/**
 * Add item to hero's backpack (i.e. stash)
 * @param {module:players/actors.Actor} hero
 * @param {string} key - almanac key
 * @param {string} itemId - id of the item
 */
function addToBackpack(hero, key, itemId) {
  if (!itemId) {
    return;
  }
  const items = almanacs.ALMANAC_LIBRARY.getAlmanac(key);

  const entry = items?.find((entry) => entry.id === itemId);
  if (!entry) {
    LOG.error(`Could not find ${itemId} in ${key} almanac. Ignoring.`);
    return;
  }
  const item = buildArtefact(entry);
  hero.storeManager.stash(item, { direct: true });
}

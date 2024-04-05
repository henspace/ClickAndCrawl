/**
 * @file Actor and artefact builder
 *
 * @module dnd/almanacs/actorBuilder
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

import { Sprite } from '../../utils/sprites/sprite.js';
import { Actor, ActorType, MoveType } from '../../players/actors.js';
import * as spriteRenderers from '../../utils/sprites/spriteRenderers.js';
import * as animation from '../../utils/sprites/animation.js';
import { Position } from '../../utils/geometry.js';
import SCREEN from '../../utils/game/screen.js';
import { Colours } from '../../constants/canvasStyles.js';
import { Fight, Trade, FindArtefact, Poison } from '../interact.js';
import StdAnimations from '../../scriptReaders/actorAnimationKeys.js';
import * as maths from '../../utils/maths.js';
import GameConstants from '../../utils/game/gameConstants.js';
import { CharacterTraits } from '../traits.js';
import { ALMANAC_LIBRARY } from './almanacs.js';
import { buildArtefact } from './artefactBuilder.js';
import LOG from '../../utils/logging.js';
import IMAGE_MANAGER from '../../utils/sprites/imageManager.js';
import { getRandomFullName } from '../../utils/nameGenerator.js';

/**
 * Specialist traits renderer
 */
class TraitsRenderer extends spriteRenderers.MultiGaugeTileRenderer {
  /** @type {Actor} */
  actor;
  /**
   * The number of gauges is determined by the maximum length of the fill styles and
   * stroke styles
   * @param {CanvasRenderingContext2D} context
   * @param {Object} options
   * @param {number} options.tileSize
   * @param {string[]} options.fillStyles
   * @param {string[]} options.strokeStyles
   */
  constructor(context, options) {
    super(context, options);
  }
  /**
   * Render the sprite.
   * @param {module:utils/geometry~Position} position - this will have been adjusted to the screen.
   */
  render(position) {
    if (this.actor && this.actor.traits) {
      const hp = this.actor.traits.getInt('HP', 0);
      const hpMax = this.actor.traits.getInt('HP_MAX', 1);
      this.setLevel(0, hp / hpMax);
    }
    super.render(position);
  }
}

/**
 * Animation that automatically adjusts the animation based on the actor's velocity
 * and alive property.
 */
class ActorStateAnimator extends animation.KeyedAnimatedImages {
  /** @type {Actor} */
  #actor;

  /** Number from eight point compass. */
  #compassDir;

  /** @type{boolean}*/
  #aliveStatus;

  /** @type {animation.AnimatedImage} */
  #fallbackImage;

  /**
   * Create the keyed animated image
   * @param {string} key
   * @param {AnimatedImage} animatedImage
   */
  constructor(key, animatedImage) {
    super(key, animatedImage);
    this.#compassDir = maths.CompassEightPoint.NONE;
    this.#fallbackImage = animatedImage;
  }

  /**
   * Set the actor who's velocity will be monitored.
   * @param {Actor} actor
   */
  setActor(actor) {
    this.#actor = actor;
    this.#aliveStatus = this.#actor.alive;
  }

  /** override */
  getCurrentFrame() {
    const dir = this.#getCurrentDirection();
    if (dir !== this.#compassDir || this.#aliveStatus != this.#actor?.alive) {
      this.#compassDir = dir;
      this.#aliveStatus = this.#actor?.alive;
      this.#setAnimationForState();
    }
    const frame = super.getCurrentFrame();
    return (
      frame ??
      this.#fallbackImage.getCurrentFrame() ??
      IMAGE_MANAGER.getUndefinedBitmap()
    );
  }

  #getCurrentDirection() {
    if (!this.#actor || this.#actor.velocity.isZero(0.1)) {
      return maths.CompassEightPoint.NONE;
    } else {
      const dir = this.#actor.velocity.getScreenDirection();
      return maths.angleToFourPointCompass(dir);
    }
  }

  /**
   * Set the appropriate animation based on the the current compass direction.
   * Only four points supported.
   */
  #setAnimationForState() {
    const reverse = this.#actor.disengaging;
    if (!this.#actor.alive) {
      return this.setCurrentKey(StdAnimations.peripatetic.getKeyName('DEAD'));
    }
    switch (this.#compassDir) {
      case maths.CompassEightPoint.NONE:
        this.setCurrentKey(StdAnimations.peripatetic.getKeyName('IDLE'));
        break;
      case maths.CompassEightPoint.E:
        this.setCurrentKey(
          StdAnimations.peripatetic.getKeyName(
            reverse ? 'WALK_WEST' : 'WALK_EAST'
          )
        );
        break;
      case maths.CompassEightPoint.N:
      case maths.CompassEightPoint.NW:
      case maths.CompassEightPoint.NE:
        this.setCurrentKey(
          StdAnimations.peripatetic.getKeyName(
            reverse ? 'WALK_SOUTH' : 'WALK_NORTH'
          )
        );
        break;
      case maths.CompassEightPoint.W:
        this.setCurrentKey(
          StdAnimations.peripatetic.getKeyName(
            reverse ? 'WALK_EAST' : 'WALK_WEST'
          )
        );
        break;
      default:
        this.setCurrentKey(
          StdAnimations.peripatetic.getKeyName(
            reverse ? 'WALK_NORTH' : 'WALK_SOUTH'
          )
        );
        break;
    }
  }
}

/**
 * Create set of standard animations.
 * @param {string} imageName - root name for images.
 * @returns {animation.KeyedAnimatedImages}
 */
function createStandardKeyFrames(imageName) {
  const keyedAnimations = new ActorStateAnimator(
    'still',
    new animation.AnimatedImage(`${imageName}.png`)
  );
  StdAnimations.peripatetic.addAllToKeyedAnimation(keyedAnimations, imageName);
  return keyedAnimations;
}

/**
 * Create set of standard artefact animations.
 * @returns {animation.KeyedAnimatedImages}
 */
function createArtefactKeyFrames(imageName) {
  const keyedAnimations = new ActorStateAnimator(
    'still',
    new animation.AnimatedImage(`${imageName}.png`)
  );
  StdAnimations.artefact.addAllToKeyedAnimation(keyedAnimations, imageName);
  return keyedAnimations;
}

/**
 * Create the actor.
 * @param {string} imageName - no extension
 * @param {string} iconImageName - alternative image used for dialogs. Falls back to imageName. png extension automatically added.
 * @param {module:dnd/traits~Traits} traits
 * @param {module:dnd/almanacs/almanacs~AlmanacEntry} almanacEntry
 * @returns {Actor}
 */
function createActor(imageName, iconImageName, traits, almanacEntry) {
  const keyedAnimation = createStandardKeyFrames(imageName);
  const imageRenderer = new spriteRenderers.ImageSpriteCanvasRenderer(
    SCREEN.getContext2D(),
    keyedAnimation
  );
  let renderers;
  let traitsRenderer;
  if (traits.get('MOVE') !== MoveType.ORGANIC) {
    traitsRenderer = new TraitsRenderer(SCREEN.getContext2D(), {
      tileSize: GameConstants.TILE_SIZE - 2,
      fillStyles: [Colours.HP_GAUGE],
      strokeStyles: [],
    });
    renderers = [traitsRenderer, imageRenderer];
  } else {
    renderers = [imageRenderer];
  }

  const actor = new Actor(
    new Sprite({
      renderer: renderers,
    }),
    almanacEntry.type
  );
  keyedAnimation.setActor(actor);

  if (traitsRenderer) {
    traitsRenderer.actor = actor;
  }
  actor.position = new Position(
    GameConstants.TILE_SIZE,
    GameConstants.TILE_SIZE,
    0
  );
  actor.almanacEntry = almanacEntry;
  actor.traits = traits;
  actor.maxTilesPerMove = traits.getValueInFeetInTiles('SPEED', 1);
  actor.velocity = { x: 0, y: 0, rotation: 0 };
  actor.iconImageName = iconImageName
    ? `${iconImageName}.png`
    : `${imageName}.png`;
  return actor;
}

/**
 * Create the artefact holder.
 * @param {string} imageName - no extension
 * @param {module:dnd/traits~Traits} traits
 * @param {module:dnd/almanacs/almanacs~AlmanacEntry} almanacEntry
 * @returns {Actor}
 */
function createArtefactHolder(imageName, traits, almanacEntry) {
  const keyedAnimation = createArtefactKeyFrames(imageName);
  const imageRenderer = new spriteRenderers.ImageSpriteCanvasRenderer(
    SCREEN.getContext2D(),
    keyedAnimation
  );

  const actor = new Actor(
    new Sprite({
      renderer: [imageRenderer],
    }),
    almanacEntry.type === 'SPELL' ? ActorType.PROP : ActorType.HIDDEN_ARTEFACT
  );
  keyedAnimation.setActor(actor);
  actor.position = new Position(
    GameConstants.TILE_SIZE,
    GameConstants.TILE_SIZE,
    0
  );
  actor.velocity = { x: 0, y: 0, rotation: 0 };
  actor.interaction = new FindArtefact(actor);
  actor.iconImageName = `${imageName}.png`;
  actor.traits = traits ?? new CharacterTraits();
  return actor;
}

/**
 * Create animated enemy
 * @param {string} imageName - without extension
 * @param {string} iconImageName - without extension. Name of icon for dialogs.
 * @param {module:dnd/traits~Traits} traits
 * @param {module:dnd/almanacs/almanacs~AlmanacEntry} almanacEntry
 * @returns {Actor}
 */
function createEnemy(imageName, iconImageName, traits, almanacEntry) {
  const actor = createActor(imageName, iconImageName, traits, almanacEntry);
  if (actor.isOrganic()) {
    actor.interaction = new Poison(actor);
    actor.obstacle = false;
  } else {
    actor.interaction = new Fight(actor);
  }
  return actor;
}

/**
 * Create animated prop
 * @param {string} imageName - without extension
 * @param {string} iconImageName - without extension. Name of icon for dialogs.
 * @param {module:dnd/traits~Traits} traits
 * @param {module:dnd/almanacs/almanacs~AlmanacEntry} almanacEntry
 * @returns {Actor}
 */
function createProp(imageName, iconImageName, traits, almanacEntry) {
  const actor = createActor(imageName, iconImageName, traits, almanacEntry);
  actor.interaction = new FindArtefact(actor);
  return actor;
}

/**
 * Create animated trader
 * @param {string} imageName - without extension
 * @param {string} iconImageName - alternative image used for dialogs. Fallsback to imageName. png extension automatically added.
 * @param {module:dnd/traits~Traits} traits
 * @param {module:dnd/almanacs/almanacs~AlmanacEntry} almanacEntry
 * @returns {Actor}
 */
function createTrader(imageName, iconImageName, traits, actorType) {
  const actor = createActor(imageName, iconImageName, traits, actorType);
  actor.interaction = new Trade(actor);
  return actor;
}

/**
 * @param {Actor} actor
 * @param {string[]} equipmentIds - ids of artefacts in the artefacts almanac.
 */
function equipActor(actor, equipmentIds) {
  if (!equipmentIds) {
    return;
  }

  for (const id of equipmentIds) {
    const artefactEntry = ALMANAC_LIBRARY.findById(id, [
      'MONEY',
      'WEAPONS',
      'ARMOUR',
    ]);
    if (artefactEntry) {
      const artefact = buildArtefact(artefactEntry);
      if (artefact.equipStoreType) {
        actor.storeManager.equip(artefact, { direct: true });
      } else {
        actor.storeManager.stash(artefact, { direct: true });
      }
    } else {
      LOG.error(`Cannot find ${id} artefact in almanac to equip actor.`);
    }
  }
}
/**
 * Create an actor from an almanac entry.
 * @param {module:dnd/almanacs/almanacActors~AlmanacEntry} almanacEntry
 * @param {Map<string, *>} [traitsString] - map of values to override the default
 * almanacEntry. This is normally only used if rebuilding from saved values.
 */
export function buildActor(almanacEntry, traitsString) {
  const traits = new CharacterTraits(traitsString ?? almanacEntry.traitsString);
  traits.set('NAME', almanacEntry.name);
  let actor;
  switch (almanacEntry.type) {
    case ActorType.HERO:
      actor = createActor('hero', null, traits, almanacEntry);
      actor.type = ActorType.HERO;
      traits.set('NAME', getRandomFullName());
      break;
    case ActorType.TRADER:
      actor = createTrader('trader', null, traits, almanacEntry);
      break;
    case ActorType.HIDDEN_ARTEFACT:
      actor = createArtefactHolder(
        'hidden-artefact',
        null,
        traits,
        almanacEntry
      );
      break;
    case ActorType.PROP:
      actor = createProp(almanacEntry.imageName, null, traits, almanacEntry);
      break;
    default:
      actor = createEnemy(almanacEntry.imageName, null, traits, almanacEntry);
      break;
  }

  actor.description = almanacEntry.description;
  if (almanacEntry.equipmentIds) {
    equipActor(actor, almanacEntry.equipmentIds);
  }
  return actor;
}

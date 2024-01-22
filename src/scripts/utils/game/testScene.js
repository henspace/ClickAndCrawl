/**
 * @file Simple test scene
 *
 * @module utils/game/testScene
 *
 * @license
 * Copyright 2024 Steve Butler
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

import * as screen from './screen.js';
import { Sprite } from '../sprites/sprite.js';
import * as spriteRenderers from '../sprites/spriteRenderers.js';
import * as imageManager from '../sprites/imageManager.js';
import * as animation from '../sprites/animation.js';
import { LoopMethod } from '../arrays/indexer.js';
import { Position, Velocity } from '../geometry.js';
import * as game from './game.js';
import textureMap from '../../../assets/images/dungeon.json';
import textureUrl from '../../../assets/images/dungeon.png';
import * as testMap from '../tileMaps/testMap.js';
import { TileMap } from '../tileMaps/tileMap.js';
import { generateTileMapPlan } from '../tileMaps/tilePlan.js';
import * as world from './world.js';
import * as turnManager from './turnManager.js';
import { Actor } from './actors.js';
import * as UI from '../dom/ui.js';

/** @type {Actor} */
let starActor; // just for test

/** @type {TileMap} */
let tileMap;

/**
 * Load the test scene.
 */
function initTestScene() {
  console.log('Start the Test Scene.');
  const GRID_SIZE = 48;
  tileMap = new TileMap(
    screen.getContext2D(),
    generateTileMapPlan(testMap.testTileMapPlan, testMap.testTileMapKeys),
    GRID_SIZE
  );
  world.setTileMap(tileMap);

  starActor = new Actor(
    new Sprite({
      renderer: new spriteRenderers.ImageSpriteCanvasRenderer(
        screen.getContext2D(),
        new animation.KeyedAnimatedImages(
          'idle',
          new animation.AnimatedImage(
            0,
            {
              prefix: 'player',
              suffix: '.png',
              startIndex: 1,
              padding: 3,
            },
            {
              framePeriodMs: 100,
              loopMethod: LoopMethod.REVERSE,
            }
          )
        )
      ),
    })
  );
  starActor.position = new Position(48, 48, 0);
  starActor.velocity = { x: -500, y: -70, rotation: 0.1 };

  for (let n = 0; n < 3; n++) {
    const monster = new Actor(
      new Sprite({
        renderer: new spriteRenderers.ImageSpriteCanvasRenderer(
          screen.getContext2D(),
          imageManager.getSpriteBitmap(0, 'player001.png')
        ),
      })
    );
    monster.position = tileMap.getRandomFreeGroundTile().worldPoint;
    monster.velocity = new Velocity(100, 80, 0.2);
    world.addActor(monster);
  }

  game.setCameraToTrack(starActor.sprite, 100, 0);

  world.addActor(starActor);

  turnManager.startWithStar(starActor);

  screen.displayHtmlElement(UI.messageElement('Welcome to the dungeon.'));
}

export const TEST_SCENE = {
  /** preload method */
  load: () => {
    console.log('Load called');
    return imageManager.loadSpriteMap(textureMap, textureUrl);
  },
  /** int method */
  initialise: () => {
    console.log('Initialise called');
    initTestScene();
    return Promise.resolve(null);
  },
  /** gameLoop */
  update: (deltaSecondsUnused) => {
    //nothing to do
  },
  /** unload method */
  unload: () => {
    console.log('unload called');
  },
};

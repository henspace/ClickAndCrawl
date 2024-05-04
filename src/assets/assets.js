/**
 * @file Urls
 *
 * @module src/assets/urls.js
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
import textureMap from './images/dungeon.json';

/**
 * Urls for dynamically loading resources @type {Object<string, URL>}
 */
export const AssetUrls = {
  ABOUT_MD: new URL('./guides/about.md', import.meta.url),
  ALMANAC_MAP: new Map([
    ['ARMOUR', new URL('./almanacs/armour.txt', import.meta.url)],
    ['ARTEFACTS', new URL('./almanacs/artefacts.txt', import.meta.url)],
    ['MAGIC', new URL('./almanacs/magic.txt', import.meta.url)],
    ['ENEMIES', new URL('./almanacs/monsters.txt', import.meta.url)],
    ['HEROES', new URL('./almanacs/heroes.txt', import.meta.url)],
    ['MONEY', new URL('./almanacs/money.txt', import.meta.url)],
    ['TRADERS', new URL('./almanacs/traders.txt', import.meta.url)],
    ['WEAPONS', new URL('./almanacs/weapons.txt', import.meta.url)],
    ['KEYS', new URL('./almanacs/keys.txt', import.meta.url)],
    ['TRAPS', new URL('./almanacs/traps.txt', import.meta.url)],
  ]),
  DUNGEON_SCRIPT: new URL('./stories/dungeon_script.txt', import.meta.url),
  HELP_MD: new URL('./guides/help.md', import.meta.url),
  MUSIC: new URL(
    './audio/do-alto-do-trono-da-desolacao-trimmed.mp3', // cspell:disable-line
    import.meta.url
  ),
  PRIVACY_MD: new URL('./guides/privacy.md', import.meta.url),
  QUICK_START_MD: new URL('./guides/quickStart.md', import.meta.url),
  SOUND_EFFECTS_MAP: new Map([
    ['PUNCH', new URL('./audio/punch-trimmed.mp3', import.meta.url)],
    [
      'DOUBLE PUNCH',
      new URL('./audio/punch-trimmed-double.mp3', import.meta.url),
    ],
    ['MISS', new URL('./audio/long-medium-swish-trimmed.mp3', import.meta.url)],
    ['POISONED', new URL('./audio/bubbling-trimmed.mp3', import.meta.url)],
    ['DIE', new URL('./audio/male-hurt-sound-trimmed.mp3', import.meta.url)],
    ['DIE_MONSTER', new URL('./audio/pig-oink-47167.mp3', import.meta.url)],
    [
      'DIE_MONSTER_SMALL',
      new URL('./audio/squeal-thing-103111.mp3', import.meta.url),
    ],
    [
      'TRIGGER TRAP',
      new URL('./audio/metal-blade-slice-32-195321.mp3', import.meta.url),
    ],
  ]),
  SPLASH_IMAGE: new URL('./images/click-and-crawl.png', import.meta.url),
};

/**
 * @type {{data: Object, textureUrl: URL}}
 */
export const SpriteSheet = {
  data: textureMap,
  textureUrl: new URL('./images/dungeon.png', import.meta.url),
};

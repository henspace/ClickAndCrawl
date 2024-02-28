/**
 * @file Sound manager
 *
 * @module utils/soundManager
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
import LOG from './logging.js';

/**
 * Sound manager
 */
class SoundManager {
  /** @type {Map<string, Audio>} */
  #effects;
  /** @type {Audio} */
  #music;
  /** @type {number} */
  #musicVolume;
  /** @type {number} */
  #effectsVolume;

  /**
   * Construct.
   */
  constructor() {
    this.#musicVolume = 0.5;
    this.#effectsVolume = 0.5;
    this.#effects = new Map();
  }

  /**
   * Load and play music.
   * @param {string} path - path to music
   */
  loadAndPlayMusic(path) {
    if (this.#music) {
      throw new Error('Only one music track currently supported.');
    }
    this.#music = this.#createAudioIfNotNull(path);
    if (this.#music) {
      this.#music.addEventListener('canplay', (event) => {
        this.#music.volume = this.#musicVolume;
        this.#music.loop = true;
        this.#music.play();
        window.addEventListener('blur', () => {
          this.#music.pause();
        });
        window.addEventListener('focus', () => {
          this.#music.play();
        });
      });
    }
  }
  /**
   * Load the audio sounds.
   * @param {Map<string, string>} audioPaths
   * @returns {Promise} fulfils to undefined when all sounds are ready.
   */
  loadEffects(audioPaths) {
    const promises = [];
    audioPaths.forEach((path, key) => {
      const promise = new Promise((resolve) => {
        const audio = this.#createAudioIfNotNull(path);
        if (audio) {
          audio.addEventListener('canplay', (event) => {
            this.#effects.set(key, audio);
            resolve();
          });
        }
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  }

  /**
   * Load the audio if not null
   * @param {string} url
   * @returns {Audio} new audio object or null if url is null.
   */
  #createAudioIfNotNull(url) {
    return url ? new Audio(url) : null;
  }

  /**
   * Play an effect.
   */
  playEffect(key) {
    const effect = this.#effects.get(key);
    if (effect) {
      effect.volume = this.#effectsVolume;
      effect.play();
    }
  }

  /**
   * Set the music volume.
   * @param {number} percent
   */
  setMusicVolumePercent(percent) {
    this.#musicVolume = percent / 100;
    if (this.#music) {
      this.#music.volume = this.#musicVolume;
    }
  }

  /**
   * Set the music volume.
   * @param {number} percent
   */
  setEffectsVolumePercent(percent) {
    this.#effectsVolume = percent / 100;
  }
}

const SOUND_MANAGER = new SoundManager();

export default SOUND_MANAGER;

/**
 * @file Load and manage images. The image manager is implemented as a singleton.
 *
 * @module utils/sprites/imageManager
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
 *
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

/**
 * @typedef {Object} SpriteBitmap
 * @property {Image} image
 * @property {number} width
 * @property {number} height
 * @property {number} centreX
 * @property {number} centreY
 */

/** @type {Array.Map<string, SpriteBitmap>} */
let spriteMaps = [];

/**
 * Load an image
 * @param {URL} srcUrl - source URL
 * @returns {Promise} fulfils to @type {Image}.
 */
function loadImage(srcUrl) {
  return new Promise((resolve) => {
    const image = new Image();
    image.addEventListener('load', () => {
      console.debug('Image loaded.');
      resolve(image);
    });
    image.src = srcUrl;
  });
}

/**
 * Load a number of images
 * @param {URL[]} srcUrls - array of source URLs
 * @returns {Promise} fulfils to @type {Image[]}.
 */
function loadImages(srcUrls) {
  const promises = [];
  srcUrls.forEach((url) => promises.push(loadImage(url)));
  return Promise.all(promises);
}

/**
 * Load sprite map.
 * @param {Object} spriteMapDef Sprite map definition from TexturePacker Array JSON file without multipack
 * @param {URL} textureUrl
 * @returns {Promise} fulfils to array of sprite map keys
 */
function loadSpriteMap(spriteMapDef, textureUrl) {
  return loadImage(textureUrl).then((image) =>
    buildSpriteMap(spriteMapDef, image)
  );
}

/**
 * Build the sprite map
 * @param {Object} spriteMapDef - map definition from texture mapper. Array JSON no multi pack.
 * @param {Image} texture - images providing texture for sprite map.
 * @returns {Promise} fulfils to array of sprite map keys.
 */
function buildSpriteMap(spriteMapDef, texture) {
  const promises = [];
  const map = new Map();
  spriteMaps.push(map);
  spriteMapDef.frames.forEach((frame) => {
    promises.push(
      createImageBitmap(
        texture,
        frame.frame.x,
        frame.frame.y,
        frame.frame.w,
        frame.frame.h
      ).then((spriteImage) => {
        const spriteBitmap = {
          image: spriteImage,
          width: frame.frame.w,
          height: frame.frame.h,
          centreX: frame.sourceSize.w / 2 - frame.spriteSourceSize.x,
          centreY: frame.sourceSize.h / 2 - frame.spriteSourceSize.y,
        };
        map.set(frame.filename, spriteBitmap);
        return frame.filename;
      })
    );
  });

  return Promise.all(promises);
}

/**
 * @param {number} spriteMapIndex
 * @param {string} filename
 * @returns {SpriteBitmap} null if filename not found.
 */
function getSpriteBitmap(spriteMapIndex, filename) {
  return spriteMaps[spriteMapIndex].get(filename);
}

/**
 * Singleton image manager.
 */
const IMAGE_MANAGER = {
  getSpriteBitmap: getSpriteBitmap,
  loadImage: loadImage,
  loadImages: loadImages,
  loadSpriteMap: loadSpriteMap,
};

export default IMAGE_MANAGER;

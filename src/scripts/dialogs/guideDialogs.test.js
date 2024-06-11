/**
 * @file Tests for guideDialogs
 *
 * @module dialogs/guideDialogs.test
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

import { jest, test, expect } from '@jest/globals';

jest.unstable_mockModule('../../assets/assets.js', () => {
  return {
    __esModule: true,
    AssetUrls: {
      MY_IMAGE: './some_url.jpg',
    },
  };
});

await import('../../assets/assets.js');
const guides = await import('./guideDialogs.js');

test('Image created normally', () => {
  const markdown = guides.parseMarkdownWithAssetUrls(
    '![alt text](https://my_image.jpg)'
  );
  expect(markdown).toMatch(
    /<img alt="alt text" class="" src="https:\/\/my_image.jpg" title=""/
  );
});

test('Image created using asset url', () => {
  const markdown = guides.parseMarkdownWithAssetUrls(
    '![alt text](http://ASSET_URL_MY_IMAGE)'
  );
  expect(markdown).toMatch(
    /<img alt="alt text" class="" src="\.\/some_url.jpg" title=""/
  );
});

test('Image created using asset url globally', () => {
  const markdown = guides.parseMarkdownWithAssetUrls(
    '![alt text](http://ASSET_URL_MY_IMAGE) ![alt text](http://ASSET_URL_MY_IMAGE)'
  );
  expect(markdown).toMatch(/src="\.\/some_url.jpg".*src="\.\/some_url.jpg"/);
});

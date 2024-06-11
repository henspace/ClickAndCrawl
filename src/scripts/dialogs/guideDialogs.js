/**
 * @file Dialogs showing guides which are in Markdown.
 *
 * @module dialogs/guideDialogs
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

import { loadTextFromUrl } from '../utils/assetLoaders.js';
import { parseMarkdown } from '../utils/text/markdown/markdown.js';
import { createElement, TextButtonControl } from '../utils/dom/components.js';
import { i18n } from '../utils/messageManager.js';
import UI from '../utils/dom/ui.js';
import { AssetUrls } from '../../assets/assets.js';
import { VERSION } from '../generatedFiles/version.js';

/**
 * Show the guide dialog. This is the portal to all help information.
 * It starts by showing the quick start.
 */
export function showGuideDialog() {
  const gettingStarted = new TextButtonControl({
    label: i18n`BUTTON GETTING STARTED`,
    action: () => showMarkdownDialog(AssetUrls.STARTUP_TIPS_MD),
  });

  const about = new TextButtonControl({
    label: i18n`BUTTON ABOUT AND PRIVACY`,
    action: () => showMarkdownDialog(AssetUrls.ABOUT_MD),
  });

  const help = new TextButtonControl({
    label: i18n`BUTTON HELP`,
    action: () => showMarkdownDialog(AssetUrls.HELP_MD),
  });

  return showMarkdownDialog(AssetUrls.QUICK_START_MD, {
    actionButtons: [gettingStarted, help, about],
  });
}

/**
 * Load markdown, parse and display in dialog.
 * @param {URL} url
 * @param {Object} [options = {}]
 * @param {BaseControl[]} options.actionButtons
 * @param {Object} options.okButtonLabel
 * @returns {Promise}
 */
export function showMarkdownDialog(url, options = {}) {
  return loadTextFromUrl(url).then((markdown) => {
    let html;
    let text;
    if (markdown) {
      html = parseMarkdownWithAssetUrls(markdown);
    } else {
      text = i18n`MESSAGE CANNOT LOAD URL ${url.toString()}`;
    }

    html = html
      .replace(/\$\{VERSION\}/g, `${VERSION.build} ${VERSION.date}`)
      .replace(/\$\{COPYRIGHT\}/g, `${VERSION.copyright}`);

    const container = createElement('div', {
      className: 'parsed-markdown',
      text: text,
      html: html,
    });

    return UI.showControlsDialog(container, {
      actionButtons: options.actionButtons,
      row: true,
      okButtonLabel: options.okButtonLabel,
    });
  });
}

/**
 * Markdown parser for markdown containing asset images..
 * Asset images should be entered in Markdown using normal image markdown, but with the url
 * set to http://ASSET_URL_KEY_NAME. This will be replaced by AssetUrls[KEY_NAME].
 * Note the the standard replacement function in parseMarkdown cannot be used as urls
 * are protected.
 * @param {string} markdown
 * @param {string}
 */
export function parseMarkdownWithAssetUrls(markdown) {
  let html = parseMarkdown(markdown, {
    post: [{ re: /"https?:\/\/ASSET_URL_(\w*?)"/g, rep: assetUrlReplacer }],
  });
  return html.replace(/"https?:\/\/ASSET_URL_(\w*?)"/g, assetUrlReplacer);
}

/**
 * Replace asset urls. Urls should entered in Markdown with the url
 * set to http://ASSET_URL_KEY_NAME. This will be replaced by AssetUrls[KEY_NAME].
 * @param {string} match - the match to the regex.
 * @param {string} captures - the capture groups.
 */
function assetUrlReplacer(match, ...captures) {
  const keyName = captures[0];
  if (keyName) {
    return `"${AssetUrls[keyName]}"`;
  } else {
    return '';
  }
}

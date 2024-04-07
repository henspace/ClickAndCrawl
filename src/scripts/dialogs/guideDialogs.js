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

/**
 * Show the guide dialog. This is the portal to all help information.
 * It starts by showing the quick start.
 */
export function showGuideDialog() {
  const about = new TextButtonControl({
    label: i18n`BUTTON ABOUT`,
    action: () => showMarkdownDialog(AssetUrls.ABOUT_MD),
  });

  const help = new TextButtonControl({
    label: i18n`BUTTON HELP`,
    action: () => showMarkdownDialog(AssetUrls.HELP_MD),
  });

  const privacy = new TextButtonControl({
    label: i18n`BUTTON PRIVACY`,
    action: () => showMarkdownDialog(AssetUrls.PRIVACY_MD),
  });
  return showMarkdownDialog(AssetUrls.QUICK_START_MD, [help, about, privacy]);
}

/**
 * Load markdown, parse and display in dialog.
 * @param {URL} url
 * @param {BaseControl[]} actionButtons
 * @returns {Promise}
 */
export function showMarkdownDialog(url, actionButtons) {
  return loadTextFromUrl(url).then((markdown) => {
    let html;
    let text;
    if (markdown) {
      html = parseMarkdown(markdown);
    } else {
      text = i18n`MESSAGE CANNOT LOAD URL ${url.toString()}`;
    }

    const container = createElement('div', {
      className: 'parsed-markdown',
      text: text,
      html: html,
    });
    return UI.showControlsDialog(container, {
      actionButtons: actionButtons,
      row: true,
    });
  });
}

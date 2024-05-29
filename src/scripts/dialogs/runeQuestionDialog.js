/**
 * @file Dialog with rune puzzle.
 *
 * @module dialogs/runeQuestionDialog
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

import UI from '../utils/dom/ui.js';
import { createSequence } from '../dnd/sequenceGenerator.js';
import * as maths from '../utils/maths.js';
import { i18n } from '../utils/messageManager.js';
import { createElement } from '../utils/dom/components.js';

/** @type {string} */
const RUNES =
  '\u{16a0}\u{16a2}\u{16a6}\u{16a8}\u{16b1}\u{16b2}\u{16b7}\u{16b9}\u{16ba}\u{16be}\u{16c1}\u{16c3}\u{16c7}\u{16c8}\u{16c9}\u{16ca}\u{16cf}\u{16d2}\u{16d6}\u{16d7}\u{16da}\u{16dc}\u{16de}\u{16df}';

/**
 * Show a rune puzzle. If the incorrect answer turns out to be the same as the
 * correct answer no dialog is shown and the response indicates a correct solution.
 * @param {number} currentSceneLevel
 * @returns {Promise<boolean>} fulfils to true if solved.
 */
export function showRunPuzzle(currentSceneLevel) {
  const options = createSequenceOptions(currentSceneLevel);
  const sequence = createSequence(options);
  const correct = sequence.next;
  const incorrect = createIncorrectSequence(correct, options.runes);
  if (incorrect === correct) {
    return Promise.resolve(true); // just assume successful answer.
  }
  const container = createElement('div');
  container.appendChild(
    createElement('p', {
      text: i18n`MESSAGE RUNES ON WALL`,
    })
  );
  container.appendChild(
    createElement('p', {
      className: 'runes',
      text: `${options.runes} ${sequence.sequence}`, // include runes as key
    })
  );
  container.appendChild(
    createElement('p', {
      text: i18n`MESSAGE RUNES OVER DOORS`,
    })
  );

  const goodIndex = maths.getRandomInt(0, 1);
  const badIndex = 1 - goodIndex;
  const choices = ['', ''];
  choices[goodIndex] = correct;
  choices[badIndex] = incorrect;
  return UI.showChoiceDialog(
    i18n`DIALOG TITLE RUNE PUZZLE`,
    container,
    choices,
    'rune-puzzle'
  ).then((choice) => choice === goodIndex);
}

/**
 *
 * @param {number} currentSceneLevel
 * @returns {Object} options for createSequence.
 */
function createSequenceOptions(currentSceneLevel) {
  const minRunes = 4;
  const maxRunes = 15;
  const maxSequences = 4;
  const sequences = maths.getRandomIntInclusive(
    1,
    Math.min(maxSequences, 1 + currentSceneLevel)
  );
  const nRunes = maths.getRandomIntInclusive(
    minRunes,
    Math.min(minRunes + currentSceneLevel, maxRunes)
  );
  const runesStart = maths.getRandomInt(0, RUNES.length - nRunes);
  const runes = RUNES.substring(runesStart, runesStart + nRunes);

  const offsets = [];
  for (let seq = 0; seq < nRunes; seq++) {
    offsets.push(maths.getRandomIntInclusive(1, nRunes));
  }

  return {
    runes: runes,
    repetitions: 4 + currentSceneLevel,
    sequences: sequences,
    sequenceOffsets: offsets,
    startOffset: maths.getRandomIntInclusive(0, nRunes),
    nextLength: maths.getRandomIntInclusive(2, 5),
  };
}

/**
 * Create a wrong sequence based on the correct sequence
 * @param {string} correct
 * @param {string} runes
 * @returns {string} incorrect
 */
function createIncorrectSequence(correct, runes) {
  const letters = correct.split('');
  const changedIndex = maths.getRandomInt(0, letters.length);
  for (let index = 0; index < runes.length; index++) {
    const substitute = runes.charAt(index);
    if (substitute !== letters[changedIndex]) {
      letters[changedIndex] = substitute;
      break; // now incorrect
    }
  }
  return letters.join('');
}

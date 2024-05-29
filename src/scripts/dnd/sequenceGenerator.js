/**
 * @file Sequence generator for puzzles involving pattern matching.
 *
 * @module dnd\sequenceGenerator
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

/**
 * Create a logical sequence of characters.
 * @param {Object} options
 * @param {string} [runes = 'ABCD'] - characters used for sequencing
 * @param {number} [repetitions] - number of repetitions. Min is 4.
 * @param {number} [sequences = 1] - number of interleaved sequences
 * @param {number[]} [sequenceOffsets = [1]] - offset per sequence. If array length is shorter
 * than the number of sequences, the last entry is used
 * @param {number} [startOffset = 0] - offset at start
 * @param {number} [nextLength = 1] - length of next characters in sequence
 * @returns {<sequence:string, next:string}
 */
export function createSequence(options = {}) {
  const runes = options.runes ?? 'ABCD';
  const sequences = options.sequences ?? 1;
  const repetitions = Math.max(options.repetitions ?? 0, 4);
  const sequenceOffsets = options.sequenceOffsets ?? [1];
  const startOffset = options.startOffset ?? 0;
  let nextLength = options.nextLength ?? 1;
  nextLength = Math.min((repetitions - 3) * sequences, nextLength);

  let result = '';
  for (let rep = 0; rep < repetitions; rep++) {
    for (let sequence = 0; sequence < sequences; sequence++) {
      let sequenceOffset;
      if (sequence < sequenceOffsets.length) {
        sequenceOffset = sequenceOffsets[sequence];
      } else {
        sequenceOffset = sequenceOffsets[sequenceOffsets.length - 1];
      }
      const offset = startOffset + sequenceOffset * (1 + rep);
      result += getRune(runes, offset);
    }
  }
  return {
    sequence: result.substring(0, result.length - nextLength),
    next: result.substring(result.length - nextLength),
  };
}

/**
 * Get the rune at the offset. The offset wraps if greater
 * than the length of runes.
 * @param {string} runes
 * @param {number} offset
 * @returns {string} the character
 */
function getRune(runes, offset) {
  return runes.charAt(offset % runes.length);
}

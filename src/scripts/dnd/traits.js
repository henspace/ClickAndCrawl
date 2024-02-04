/**
 * @file Dungeon and dragons properties
 *
 * @module dnd/traits
 *
 * @license
 * {@link https://opensource.org/license/mit/|MIT}
 *
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

export class CharacterTraits {
  /** Characteristics @type {Map<string, *>} */
  #traits;

  constructor() {
    this.#traits = new Map([
      ['HP', 10],
      ['STR', 10],
    ]);
  }
  /**
   * Create the characteristics from a definition. The definition comprises a
   * comma separated list of characteristics with each characteristic comprising
   * a keyword followed by a space or equals sign and then its value.
   * @param {string} definition
   */
  static fromString(definition) {
    const dnd = new CharacterTraits();
    const traits = definition.split(',');
    traits.forEach((trait) => {
      const match = trait.match(/^\s*(\w+)\s*[=: ]\s*(.+?)\s*$/);
      if (match) {
        if (dnd.#traits.has(match[1])) {
          dnd.#traits.set(match[1], match[2]);
        } else {
          throw new Error(`Invalid property name '${match[1]}'`);
        }
      } else {
        throw new Error(`Invalid property '${trait}'`);
      }
    });
  }
}

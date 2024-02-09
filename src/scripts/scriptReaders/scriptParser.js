/**
 * @file File that actually processes the script.
 * The script parser acts as a state machine as it parses the script.
 * Dungeons work as levels.
 *
 * @module scriptReaders/scriptParser
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

import ACTOR_MAP from './actorMap.js';
import { SceneDefinition } from './sceneDefinitionParser.js';
import { CharacterTraits } from '../dnd/traits.js';

/**
 * @typedef {Object} SectionParsingResult
 * @property {string} nextSectionId
 * @property {number} nextLineIndex
 */

/**
 * Section IDs
 * @enum {string}
 */
const SectionId = {
  LEVEL: 'LEVEL',
  CAST: 'CAST',
  MAP: 'MAP',
};

/** Basic parser for a section of the script. */
class AbstractSectionParser {
  /** @type {SceneDefinition} */
  sceneDefn;
  /** Lines of the script. @type {string[]} */
  lines;

  /** @type {number} lineIndex */
  lineIndex;

  /**
   * Construct parser.
   * @param {number} lines
   * @param {number} startLine
   * @param {SceneDefinition} sceneDefn
   */
  constructor(lines, startLine, sceneDefn) {
    this.lines = lines;
    this.lineIndex = startLine;
    this.sceneDefn = sceneDefn;
  }
  /**
   * Parse lines.
   * @returns {SectionParsingResult} next section and line
   * @throws {Exception} parsing error has occurred.
   */
  parse() {
    while (this.lineIndex < this.lines.length) {
      const line = this.lines[this.lineIndex];
      const nextSectionId = AbstractSectionParser.getSectionIdFromLine(line);
      if (nextSectionId) {
        return { nextSectionId: nextSectionId, nextLineIndex: this.lineIndex };
      } else {
        this.parseLine(line);
        this.lineIndex++;
      }
    }
    return null;
  }

  /**
   * Find the first section in an array of lines.
   * @param {string[]} lines 
   * @returns {SectionParsingResult} next section and line. Null if not found.
   
   */
  static findFirstSection(lines) {
    for (let index = 0; index < lines.length; index++) {
      const id = AbstractSectionParser.getSectionIdFromLine(
        lines[index].trim()
      );
      if (id) {
        return { nextSectionId: id, nextLineIndex: index };
      }
    }
    return null;
  }

  /**
   * Parse.
   * @param {string} line;
   */
  parseLine(lineUnused) {
    throw 'Method parseLine should be overridden.';
  }

  /** Check the line to see if it is a section marker.
   * @returns {string} the section section marker. Null if not a section marker.
   */
  static getSectionIdFromLine(line) {
    const match = line.match(/^\s*\[ *([\w ]+) *\]/);
    if (match) {
      return match[1].toUpperCase();
    }
    return null;
  }

  /**
   * Handle an error.
   * @param {string} message
   * @throws {Error}
   */
  fatalError(message) {
    throw new Error(
      `Error parsing script on line ${this.lineIndex + 1}: ${message}`
    );
  }

  /**
   * Handle ignorable error.
   * @param {string} message
   */
  ignoreError(message) {
    console.debug(
      `Ignoring error parsing script on line ${this.lineIndex}: ${message}`
    );
  }
}

/**
 * Parser for introductions.
 */
class IntroParser extends AbstractSectionParser {
  /**
   * Construct parser.
   * @param {number} lines
   * @param {number} startLine
   * @param {SceneDefinition} sceneDefn
   */
  constructor(lines, startLine, sceneDefn) {
    super(lines, startLine, sceneDefn);
    this.sceneDefn.intro = '';
  }
  /**
   * Parse a line.
   * @override
   */
  parseLine(line) {
    this.sceneDefn.intro += line === '' ? '\n' : line;
  }
}

/**
 * Parser for the cast list.
 */
class CastParser extends AbstractSectionParser {
  /**
   * Construct parser.
   * @param {number} lines
   * @param {number} startLine
   * @param {SceneDefinition} sceneDefn
   */
  constructor(lines, startLine, sceneDefn) {
    super(lines, startLine, sceneDefn);
  }
  /**
   * Parse a line.
   * @override
   */
  parseLine(line) {
    const match = line.match(/^\s*(\w+?) *x(\d{1,2}) *([^:]*): *([\w,:= /]*)/);
    if (match) {
      this.#parseShortFormActor(match);
    } else {
      this.#parseLongFormActor(line);
    }
  }

  /**
   * Parse a short form single line actor definition.
   * @param {string[]} matchResults - results from regex match.
   */
  #parseShortFormActor(matchResults) {
    const actorId = matchResults[1].toUpperCase();
    const number = parseInt(matchResults[2]);
    const name = matchResults[3];
    const traitsDefn = matchResults[4];
    for (let n = 0; n < number; n++) {
      if (ACTOR_MAP.has(actorId)) {
        try {
          const traits = new CharacterTraits().setFromString(traitsDefn);
          this.sceneDefn.enemies.push({
            id: actorId,
            name: name || 'mystery',
            traits: traits,
          });
        } catch (error) {
          this.fatalError(error.message);
        }
      } else {
        this.fatalError(`Cast member ${actorId} does not exist.`);
      }
    }
  }
  /**
   * Parse a line to build a long form, multiline actor
   * @param {string} line - current line.
   */
  #parseLongFormActor(lineIgnored) {
    this.fatalError('Long form actors not supported.');
  }
}

/**
 * Parser for dungeon map.
 */
class MapParser extends AbstractSectionParser {
  /**
   * Construct parser.
   * @param {number} lines
   * @param {number} startLine
   * @param {SceneDefinition} sceneDefn
   */
  constructor(lines, startLine, sceneDefn) {
    super(lines, startLine, sceneDefn);
  }
  /**
   * Parse a line.
   * @override
   */
  parseLine(line) {
    if (line !== '') {
      this.sceneDefn.mapDesign.push(line);
    }
  }
}

/** Lines of the script. @type {string[]} */
let lines;

/** Scenes @type {SceneDefinition[]} */
let sceneDefinitions;

/**
 * Get a section parser for the section Id.
 * @param {string} sectionId
 * @param {number} lineIndex
 * @param {SceneDefinition} sceneDefn
 * @returns {SectionParser} null if the id is not valid.
 */
function getParserForId(sectionId, lineIndex, sceneDefn) {
  switch (sectionId) {
    case SectionId.LEVEL:
      return new IntroParser(lines, lineIndex + 1, sceneDefn); // skip the actual section ID line.
    case SectionId.CAST:
      return new CastParser(lines, lineIndex + 1, sceneDefn); // skip the actual section ID line.
    case SectionId.MAP:
      return new MapParser(lines, lineIndex + 1, sceneDefn); // skip the actual section ID line.
  }
  return null;
}

/**
 * Parse the script.
 *  @param {string} script
 * @returns {SceneDefinition[]} array of all the scene definitions.
 * @throws {Exception} thrown on parsing error.
 */
export default function parseScript(script) {
  lines = script.split(/\r?\n/);
  sceneDefinitions = [];
  let sceneDefn = new SceneDefinition();
  const sectionHunt = AbstractSectionParser.findFirstSection(lines);
  if (!sectionHunt) {
    throw new Error(`Invalid script. No section identifiers found.`);
  }

  let parser = getParserForId(
    sectionHunt.nextSectionId,
    sectionHunt.nextLineIndex,
    sceneDefn
  );
  while (parser) {
    const result = parser.parse();
    if (!result?.nextSectionId || result.nextSectionId === SectionId.LEVEL) {
      sceneDefinitions.push(sceneDefn);
      sceneDefn = new SceneDefinition();
    }
    parser = !result
      ? null
      : getParserForId(result.nextSectionId, result.nextLineIndex, sceneDefn);
  }
  return sceneDefinitions;
}

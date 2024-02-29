/**
 * @file File that actually processes the script.
 * The script parser acts as a state machine as it parses the script.
 * Dungeons work as levels.
 *
 * @module scriptReaders/scriptParser
 */
/**
 * License {@link https://opensource.org/license/mit/|MIT}
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
import { SceneDefinition } from '../utils/game/sceneManager.js';
import { CharacterTraits } from '../dnd/traits.js';
import { RoomCreator } from '../utils/tileMaps/roomGenerator.js';
import * as maths from '../utils/maths.js';
import LOG from '../utils/logging.js';
import ARTEFACT_MAP from './artefactMap.js';

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
  HERO: 'HERO',
  LEVEL: 'LEVEL',
  CAST: 'CAST',
  MAP: 'MAP',
  ARTEFACTS: 'ARTEFACTS',
};

/** Basic parser for a section of the script. */
class AbstractSectionParser {
  /** @type {SceneDefinition} */
  sceneDefn;
  /** Lines of the script. @type {string[]} */
  lines;

  /** @type {number} */
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
   * @param {number} [startingLine = 0]
   * @returns {SectionParsingResult} next section and line. Null if not found.
   
   */
  static findFirstSection(lines, startingLine = 0) {
    for (let index = startingLine; index < lines.length; index++) {
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
    LOG.debug(
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
  /** @type {module:scriptReaders/sceneDefinitionParser~ActorDefn} */
  #lastCastMember;
  /** @type {module:scriptReaders/sceneDefinitionParser~ActorDefn[]} */
  #targetArray;

  /**
   * Construct parser.
   * @param {number} lines
   * @param {number} startLine
   * @param {SceneDefinition} sceneDefn
   * @param {module:scriptReaders/sceneDefinitionParser~ActorDefn[]} targetArray - destination for created definitions.
   */
  constructor(lines, startLine, sceneDefn, targetArray) {
    super(lines, startLine, sceneDefn);
    this.#targetArray = targetArray;
  }

  /**
   * Parse a line.
   * @override
   */
  parseLine(line) {
    let match = line.match(/^ *\+ *(.+)$/);
    if (match) {
      return this._parseExtendedTraits(match);
    }
    match = this.shortFormActorMatch(line);
    if (match) {
      return this._parseShortFormActor(match);
    }
    this._parseDescription(line);
  }

  /**
   * Match a line against a short form actor definition.
   * @param {string} line
   * @return {string[]} see String.match
   */
  shortFormActorMatch(line) {
    return line.match(
      /^\s*(\w+?)(?: *x(\d{1,2})(?: *> *(\d{1,2}))?)? *: *(.*)/
    );
  }
  /**
   * Parse a short form single line actor definition.
   * @param {string[]} matchResults - results from regex match.
   */
  _parseShortFormActor(matchResults) {
    const actorId = matchResults[1].toUpperCase();
    const minNumber = matchResults[2] ? parseInt(matchResults[2]) : 1;
    const maxNumber = matchResults[3] ? parseInt(matchResults[3]) : null;
    const traitsDefn = matchResults[4];
    const qty = maxNumber
      ? maths.getRandomIntInclusive(minNumber, maxNumber)
      : minNumber;
    for (let n = 0; n < qty; n++) {
      if (ACTOR_MAP.has(actorId) || ARTEFACT_MAP.has(actorId)) {
        try {
          const traits = new CharacterTraits().setFromString(traitsDefn);
          this.#lastCastMember = {
            id: actorId,
            traits: traits,
            description: '',
          };
          this.#targetArray.push(this.#lastCastMember);
        } catch (error) {
          this.fatalError(error.message);
        }
      } else {
        this.fatalError(`Cast member ${actorId} does not exist.`);
      }
    }
  }
  /**
   * Parse a line to add more traits.
   * @param {string[]} matchResults - See String.match.
   */
  _parseExtendedTraits(matchResults) {
    if (!this.#lastCastMember) {
      this.fatalError(
        'Cannot process extension line without preceding member line.'
      );
    } else {
      this.#lastCastMember.traits.setFromString(matchResults[1]);
    }
  }
  /**
   * Parse a line to add to the description..
   * @param {string} line
   */
  _parseDescription(line) {
    if (!this.#lastCastMember) {
      this.fatalError(
        `Cannot add description line without preceding member line.: ${line}`
      );
    } else {
      if (line === '') {
        this.#lastCastMember.description += '\n';
      } else if (this.#lastCastMember.description === '') {
        this.#lastCastMember.description += line;
      } else {
        this.#lastCastMember.description += ' ' + line;
      }
    }
  }
}

/**
 * Parser for dungeon map.
 */
class MapParser extends AbstractSectionParser {
  #randomised;
  #randomRegex;
  /**
   * Construct parser.
   * @param {number} lines
   * @param {number} startLine
   * @param {SceneDefinition} sceneDefn
   */
  constructor(lines, startLine, sceneDefn) {
    super(lines, startLine, sceneDefn);
    this.#randomised = false;
    this.#randomRegex = /^\s*random\s*$/i;
  }
  /**
   * Parse a line.
   * @override
   */
  parseLine(line) {
    if (this.#randomised) {
      return;
    }
    if (line !== '') {
      if (this.#randomRegex.test(line)) {
        const creator = new RoomCreator({
          minCols: 12,
          maxCols: 40,
          maxRoomCols: 10,
          minRows: 12,
          maxRows: 40,
          maxRoomRows: 6,
        });
        this.sceneDefn.mapDesign = creator.generate();
        this.#randomised = true;
        LOG.debug('Random map');
        this.sceneDefn.mapDesign.forEach((line) => LOG.debug(line));
      } else {
        this.sceneDefn.mapDesign.push(line);
      }
    }
  }
}

/**
 * Class to parse a script.
 * This provides access to a number of scene definitions base on a script.
 *
 */
class ScriptParser {
  /** @type {string[]} */
  #lines;
  /** @type {number} */
  #currentLine;
  /**
   * @param {string} script
   */
  constructor(script) {
    this.#currentLine = 0;
    this.#lines = script.split(/\r?\n/);
  }

  /**
   * Parse the script to get the next scene from the current line number
   * @returns {SceneDefinition} The scene definition.
   * @throws {Exception} thrown on parsing error.
   */
  getNextScene() {
    let sceneDefinition = new SceneDefinition();
    const sectionHunt = AbstractSectionParser.findFirstSection(
      this.#lines,
      this.#currentLine
    );
    if (!sectionHunt) {
      throw new Error(`Invalid script. No section identifiers found.`);
    }

    let parser = this.#getParserForId(
      sectionHunt.nextSectionId,
      sectionHunt.nextLineIndex,
      sceneDefinition
    );
    while (parser) {
      const result = parser.parse();
      if (!result?.nextSectionId || result.nextSectionId === SectionId.LEVEL) {
        this.#currentLine = result.nextLineIndex;
        return sceneDefinition;
      }
      parser = !result
        ? null
        : this.#getParserForId(
            result.nextSectionId,
            result.nextLineIndex,
            sceneDefinition
          );
    }
    return sceneDefinition;
  }

  /**
   * Move back to the start of the script.
   */
  reset() {
    this.#currentLine = 0;
  }

  /**
   * Get a section parser for the section Id.
   * @param {string} sectionId
   * @param {number} lineIndex
   * @param {SceneDefinition} sceneDefn
   * @returns {SectionParser} null if the id is not valid.
   */
  #getParserForId(sectionId, lineIndex, sceneDefn) {
    switch (sectionId) {
      case SectionId.HERO:
        return new CastParser(
          this.#lines,
          lineIndex + 1,
          sceneDefn,
          sceneDefn.heroes
        ); // skip the actual section ID line.
      case SectionId.LEVEL:
        return new IntroParser(this.#lines, lineIndex + 1, sceneDefn); // skip the actual section ID line.
      case SectionId.CAST:
        return new CastParser(
          this.#lines,
          lineIndex + 1,
          sceneDefn,
          sceneDefn.enemies
        ); // skip the actual section ID line.
      case SectionId.ARTEFACTS:
        return new CastParser(
          this.#lines,
          lineIndex + 1,
          sceneDefn,
          sceneDefn.artefacts
        ); // skip the actual section ID line.
      case SectionId.MAP:
        return new MapParser(this.#lines, lineIndex + 1, sceneDefn); // skip the actual section ID line.
    }
    throw new Error(`Invalid section ID ${sectionId}`);
  }
}

/**
 * SceneList
 * @implements {SceneList}
 */
class OndemandSceneList {
  /** @type {ScriptParser} */
  #scriptParser;
  /** @type {SceneDefinition} */
  #nextScene;
  /** Flag to prevent unnecessary resets. @type {boolean} */
  #ignoreReset;

  /**
   *
   * @param {ScriptParser} scriptParser
   */
  constructor(scriptParser) {
    this.#scriptParser = scriptParser;
    this.#ignoreReset = false;
    this.#scriptParser.reset();
  }

  /**
   * Get the scene at the index.
   */
  getNext() {
    const scene = this.#nextScene;
    if (this.#nextScene) {
      this.#nextScene = this.#scriptParser.getNextScene();
    }
    this.#ignoreReset = false;
    return scene;
  }
  /**
   * Test to see if there is another scene.
   * @returns {boolean}
   */
  hasNext() {
    return !!this.#nextScene;
  }

  /**
   * Reset
   */
  reset() {
    if (!this.#ignoreReset) {
      this.#scriptParser.reset();
      this.#nextScene = this.#scriptParser.getNextScene();
      this.#ignoreReset = true;
    }
  }
}

/**
 * Get a scenelist from the script.
 * @param {string} script
 * @returns {SceneList};
 */
export function getOndemandSceneList(script) {
  return new OndemandSceneList(new ScriptParser(script));
}

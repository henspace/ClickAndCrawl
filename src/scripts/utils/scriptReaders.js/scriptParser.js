/**
 * @file File that actually processes the script.
 * The script parser acts as a state machine as it parses the script.
 * Dungeons work as levels.
 *
 * @module utils/scriptReaders.js/scriptParser
 *
 * @license
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
 * @typedef {Object} SectionParsingResult
 * @property {string} nextSectionId
 * @property {number} lineIndex
 */

/**
 * Section IDs
 * @enum {string}
 */
const SectionId = {
  SCENE_INTRO: 'SCENE INTRO'
}

/** Basic parser for a section of the script. */
class AbstractSectionParser {
  /** Lines of the script. @type {string[]} */
  #lines;

  /** Current parsing state. @type {State} */
  #state;

  /** @type {number} lineIndex */
  #lineIndex;


  /**
   * Parse lines. 
   * @param {number} lines 
   * @param {number} index 
   * @returns {SectionParsingResult} next section id
   */
  parse(lines, index) {
    while (index < lines.length) {
      const line = lines[index++].trim();
      const nextSectionId = this.getSectionIdFromLine(line);
      if (nextSectionId) {
        return {nextSectionId: nextSectionId, lineIndex: index};
      } else {
        this.parseLine(line);
      }
    }
    return null;
  }

  /**
   * Parse.
   * @param {string} line;
   */
  parseLine(line) {
    throw Exception('Method parseLine should be overridden.');
  }

  /** Check the line to see if it is a section marker.
   * @returns {string} the section section marker. Null if not a section marker.
   */
  getSectionIdFromLine(line) {
      const match = line.match(/^\[ *([\w ]+) *\]/);
      if (match) {
        return match[1].toUpperCase();
      }  
    return null;
  }
  
}

/**
 * VoidParser. This doesn't collect any data and merely skips until a section 
 * separator is found.
 */
class VoidParser extends AbstractSectionParser {

  /**
   * @override
   */
  parseLine(line) {
    // do nothing. Just skipping
  }
}

/**
 * Parser for introductions.
 */
class IntroParser extends AbstractSectionParser {
  /** Text for the intro. Multiple lines are separated by newline characters. @type {string}*/
  text;

  /**
   * Parse a line.
   * @param {string} text 
   */
  parseLine(text) {
    this.text += text === '' ? '\n' : text;
  }
}

export class SceneDefinition {
  /** @type {string} */
  intro;

  /**
   * Construct an empty scene
   */
  constructor() {}

  /**
   * Test validity of scene definition.
   * @returns {boolean}
   */
  isValid() {
    return this.intro; /** @Todo */
  }
}

/**
 * Class to perform the parsing of a script.
 */
export class ScriptParser {
  /** Lines of the script. @type {string[]} */
  #lines;

  /** Scenes @type {SceneDefinition[]} */
  #sceneDefinitions;

  /** Scene @type {SceneDefinition} */
  #currentScene;


  /**
   * Construct a parser for the script.
   * @param {string} script 
   */
  constructor (script) {
    this.#lines = script.split(/\r?\n/);    
  }

  /**
   * Parse the script
   */
  parse() {
    this.#sceneDefinitions = [];
    const sceneDefn = new SceneDefinition();
    let parser = new VoidParser();
    const index = 0;
    do {
      const result = parser.parse(sceneDefn, this.#lines, index);
      if (!result.nextSectionId || result.nextSectionId === SectionId.LEVEL) {
        if (!sceneDefn.isValid()) {
          throw new Exception(`The scene definition ending at line ${result.lineIndex} is not valid.`);
        }
        this.#sceneDefinitions.push(sceneDefn);
      }
        
      if (isValidParserForScene(nextParser, this.#currentScene)) {
        this.#sceneDefinitions.push(this.#currentScene);
        this.#currentScene = new SceneDefinition();
      }
    }
  }

  /**
   * Test if a parser is valid for a current scene. Reasons for being invalid
   * could be because that section has already been established.
   * @param {string} id
   * @param {SceneDefinition} sceneDefn
   */
  isSectionIdValidForScene(id, sceneDefn) {
    switch id {
      case 'LEVELINTRO': return !sceneDefn.intro;
      default:
        return false;
    }
  }

  /**
   * Get a section parser.
   * @returns {SectionParser} null if the id is not valid.
   */
  getSectionParser(sectionId) {
    switch (sectionId) {
      case INTRO: return new IntroParser(this.#lines, this.#lineIndex);
    }
    return null;
  }


}

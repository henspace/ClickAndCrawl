import MESSAGES from '../utils/messageManager.js';

/**
 * @file Messages used in the application.
 *
 * @module constants/messages
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
const MESSAGE_MAP = new Map([
  ['OK', 'OK'],
  ['WELCOME', 'Welcome to dungeon. How far will you get?'],
  ['MAIN MENU TITLE', 'The Scripted Dungeon'],
  ['SETTINGS BUTTON', 'Settings'],
  ['SETTINGS DIALOG TITLE', 'Adjust settings'],
  ['PLAY BUTTON', 'Play'],
  ['BLOOD ON CONTROL', 'Blood on'],
  ['MUSIC VOLUME CONTROL', 'Music volume'],
  ['EFFECTS VOLUME CONTROL', 'Effect volume'],

  ['START BUTTON', "Let's get started."],
  [
    'DUNGEON INTRO',
    'You enter a dark and dingy dungeon. Water runs down the wall and the smell of rotting corpses fills the air',
  ],
  ['ENTER DUNGEON BUTTON', 'Enter if you dare'],
  [
    'DEFEAT',
    'Despite your valiant efforts, you died. Your legend will live on.',
  ],
  [
    'VICTORY',
    'You have conquered the dungeon. Your name will live on forever and generations will sing of your great achievements.',
  ],
  ['TRY AGAIN BUTTON', 'Try again'],
  [
    'ENTRANCE STUCK',
    [
      "The entrance is locked or jammed. You can't tell. Either way, you can't escape in that direction.",
      "You can't open the door. It seems locked or jammed. There's no way back.",
    ],
  ],
  [
    'EXIT STUCK',
    [
      'The exit is locked. You will need to find the key if you are ever to leave this dungeon.',
      'The door will not move. It appears to be locked. There must be a key here somewhere.',
    ],
  ],
  [
    'OPEN EXIT',
    [
      'The door opens and you slip away.',
      "You decide that's enough exploring this dungeon and slip away into the darkness.",
    ],
  ],
  [
    'OPEN EXIT WHILE FIGHTING',
    [
      'A dangerous move, but despite the fighting, you manage to escape.',
      'Dodging a blow, you manage to open the door and make your escape.',
    ],
  ],
]);

export default MESSAGE_MAP;

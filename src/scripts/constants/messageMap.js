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
  [
    'ARMOUR CHAIN MAIL',
    'Armour comprising interlocking steel rings over a soft cushioning fabric. The suit includes gauntlets.',
  ],
  [
    'ARMOUR HALF PLATE',
    'Shaped metal plates covering most of the body. Simple greaves protect the legs.',
  ],
  [
    'ARMOUR LEATHER',
    'Simple armour comprising stiffened leather boiled in oil along with some more flexible sections.',
  ],
  ['ARMOUR PADDED', 'Simple quilted layers of cloth and batting.'],
  [
    'ARMOUR PLATE',
    'Full plate armour with interlocking steel plates covering the entire body. A visored helmet, gauntlets, boots, and padding are included.',
  ],
  [
    'ARMOUR RING MAIL',
    'Leather armour reinforced with heavy steel rings sown into the material.',
  ],
  [
    'ARMOUR SCALE MAIL',
    'Leather coat and legging covered with overlapping steel scales.',
  ],
  [
    'ARMOUR STUDDED LEATHER',
    'Tough and flexible leather armour with the addition of steel spikes and rivets.',
  ],
  ['BUTTON CANCEL', 'Cancel'],
  ['BUTTON DISCARD', 'Discard'],
  ['BUTTON ENTER DUNGEON', 'Enter if you dare'],
  ['BUTTON EQUIP', 'Equip'],
  ['BUTTON INVENTORY', 'Inventory'],
  ['BUTTON LEAVE ARTEFACT', 'Leave'],
  ['BUTTON MOVE', 'Move'],
  ['BUTTON OK', 'OK'],
  ['BUTTON PLAY', 'Play'],
  ['BUTTON SEARCH', 'Search'],
  ['BUTTON SETTINGS', 'Settings'],
  ['BUTTON START', "Let's get started."],
  ['BUTTON TAKE ARTEFACT', 'Take'],
  ['BUTTON TRAITS', 'Traits'],
  ['BUTTON TRY AGAIN', 'Try again'],
  ['BUTTON UNEQUIP', 'Unequip'],

  ['CONTROL BLOOD ON', 'Blood on'],
  ['CONTROL EFFECTS VOLUME', 'Effect volume'],
  ['CONTROL MUSIC VOLUME', 'Music volume'],
  [
    'DESCRIPTION HERO',
    "You are a warrior whose family have fallen out of favour. You have been sent on a quest to recover the Chalice of Dark Sight. If found, your family's good name will be restored.",
  ],
  ['DESCRIPTION ORC', 'A monstrous creature with an intense hatred of humans.'],
  ['DIALOG TITLE CHOICES', 'Choose!'],
  ['DIALOG TITLE SETTINGS', 'Adjust settings'],

  ['MENU TITLE MAIN', 'The Scripted Dungeon'],

  [
    'MESSAGE ARTEFACTS ALREADY TAKEN',
    "You search but there's nothing left here.",
  ],
  [
    'MESSAGE CANNOT STORE',
    "You're carrying too much stuff to pick up what you've found.",
  ],
  ['MESSAGE ENTER LEVEL', 'You enter level'],
  [
    'MESSAGE DOOR CLOSES BEHIND YOU',
    "The door slams shut behind you. There's no way back.",
  ],
  [
    'MESSAGE DUNGEON INTRO',
    'You enter a dark and dingy dungeon. Water runs down the wall and the smell of rotting corpses fills the air',
  ],
  [
    'MESSAGE DEFEAT',
    'Despite your valiant efforts, you died. Your legend will live on.',
  ],
  [
    'MESSAGE MAKE SPACE IN BACKPACK',
    'You need to make space in your backpack by discarding or using something.',
  ],
  [
    'MESSAGE MAKE SPACE IN EQUIP',
    "You can't store this in your backpack. You need to wear it but you're already wearing something. If you want this, you'll need to unequip or discard something.",
  ],
  [
    'MESSAGE SEARCH CORPSE OR MOVE',
    [
      'You have a choice. Do you want to search the body or climb on top?',
      "You've found a corpse, but what should you do? Search for weapons and treasure or climb on top of the body?",
    ],
  ],
  [
    'MESSAGE SEARCH HOLE OR MOVE',
    [
      'You] have a choice. Do you want to search this hole or move into it?',
      "You've been here before. Do you want to search again or climb into the hole you dug?",
    ],
  ],
  [
    'MESSAGE ENTRANCE STUCK',
    [
      "The entrance is locked or jammed. You can't tell. Either way, you can't escape in that direction.",
      "You can't open the door. It seems locked or jammed. There's no way back.",
    ],
  ],
  [
    'MESSAGE EXIT STUCK',
    [
      'The exit is locked. You will need to find the key if you are ever to leave this dungeon.',
      'The door will not move. It appears to be locked. There must be a key here somewhere.',
    ],
  ],
  [
    'MESSAGE FOUND ARTEFACT',
    [
      'Good fortune smiles upon you. You found something.',
      'You find something hidden in the ground.',
      'Buried beneath the surface, you find something.',
    ],
  ],
  [
    'MESSAGE GROUND DISTURBED',
    [
      'The ground appears to have been disturbed.',
      "There's been some recent digging here.",
    ],
  ],
  [
    'MESSAGE OPEN EXIT',
    [
      'The door opens and you slip away.',
      "You decide that's enough exploring this dungeon and slip away into the darkness.",
    ],
  ],
  [
    'MESSAGE OPEN EXIT WHILE FIGHTING',
    [
      'A dangerous move, but despite the fighting, you manage to escape.',
      'Dodging a blow, you manage to open the door and make your escape.',
    ],
  ],
  ['MESSAGE WELCOME', 'Welcome to dungeon. How far will you get?'],
  [
    'MESSAGE VICTORY',
    'You have conquered the dungeon. Your name will live on forever and generations will sing of your great achievements.',
  ],
  // Miscellaneous words and phrases.
  ['Backpack', 'Backpack'],
  ['Body', 'Body'],
  ['Dungeon level:', 'Dungeon level:'],
  ['Feet', 'Feet'],
  ['GOLD PIECES', ' gold pieces'],
  ['Hands', 'Hands'],
  ['Head', 'Head'],
  ['Unknown', 'Unknown'],
]);

export default MESSAGE_MAP;

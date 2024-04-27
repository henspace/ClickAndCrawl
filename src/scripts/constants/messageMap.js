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
  ['BUTTON ABOUT', 'About'],
  ['BUTTON BUY FOR GP', 'Buy for ${0}\u{00A0}GP'],
  ['BUTTON CANCEL', 'Cancel'],
  ['BUTTON CAST SPELL', 'Cast spell'],
  ['BUTTON CONSUME', 'Consume'],
  ['BUTTON CONTINUE', 'Continue'],
  ['BUTTON CLIMB OVER', 'Climb over'],
  ['BUTTON BARGE', 'Barge past'],
  ['BUTTON BEST ADVENTURE', 'Best adventure'],

  ['BUTTON DISCARD', 'Discard'],
  ['BUTTON ENTER DUNGEON', 'Enter if you dare'],
  ['BUTTON EQUIP', 'Equip'],
  ['BUTTON FORGET', 'Forget'],
  ['BUTTON GUIDES', 'About and Help'],
  ['BUTTON HELP', 'Help'],
  ['BUTTON INVENTORY', 'Inventory'],
  ['BUTTON LEARN SPELL', 'Learn spell'],
  ['BUTTON LEAVE ARTEFACT', 'Leave'],
  ['BUTTON MAGIC', 'Magic'],
  ['BUTTON MOVE', 'Move'],
  ['BUTTON OK', 'OK'],
  ['BUTTON PILLAGE', 'Pillage'],
  ['BUTTON PLAY ADVENTURE', 'Play adventure'],
  ['BUTTON PLAY CASUAL', 'Play casual'],
  ['BUTTON PRIVACY', 'Privacy'],
  ['BUTTON PREPARE SPELL', 'Prepare'],
  ['BUTTON REST', 'Rest'],
  ['BUTTON REST LONG', 'Long rest'],
  ['BUTTON READY MAGIC', 'Ready Magic'],
  ['BUTTON REST SHORT', 'Short rest'],
  ['BUTTON SEARCH', 'Search'],
  ['BUTTON SELL FOR GP', 'Sell for ${0}\u{00A0}GP'],
  ['BUTTON SETTINGS', 'Settings'],
  ['BUTTON START', "Let's get started."],
  ['BUTTON STASH', 'Stash'],
  ['BUTTON TAKE ARTEFACT', 'Take'],
  ['BUTTON TRADE', 'Trade'],
  ['BUTTON TRAITS', 'Traits'],
  ['BUTTON TRY AGAIN', 'Try again'],
  ['BUTTON TO NEXT ROOM', 'To the next room'],
  ['BUTTON USE', 'Use'],

  ['CONTROL EFFECTS VOLUME', 'Effect volume'],
  ['CONTROL MUSIC VOLUME', 'Music volume'],
  [
    'DESCRIPTION ACID_SPLASH',
    'Casting this spell hurls acid over your enemies.',
  ],
  [
    'DESCRIPTION BARBARIAN1',
    'You are a barbarian ready to battle to the end of this dungeon in search of wealth and glory.',
  ],
  [
    'DESCRIPTION BLACK_FLASK',
    'A black flask containing a clear, pungent liquid.',
  ],
  ['DESCRIPTION BLUE_FLASK', 'A blue flask containing a clear, aromatic oil.'],
  [
    'DESCRIPTION BURNING_HANDS',
    'Casting this spell with your thumbs touching and fingers spread creates a thin sheet of flames enveloping your enemies.',
  ],
  [
    'DESCRIPTION CHAIN_MAIL_ARMOUR',
    'Armour comprising interlocking steel rings over a soft cushioning fabric. The suit includes gauntlets.',
  ],
  ['DESCRIPTION CLUB', "A simple wooden club that's seen a lot of action."],
  [
    'DESCRIPTION COINS',
    'Various coins stamped with the image of latter day kings and queens.',
  ],

  ['DESCRIPTION COPPER_COINS', 'Old copper coins of low value.'],
  ['DESCRIPTION DAGGER', 'A short and very sharp piercing weapon.'],

  [
    'DESCRIPTION ENGRAVED_PILLAR',
    'A large stone pillar covered with mystical engravings.',
  ],
  [
    'DESCRIPTION FIGHTER1',
    "You are a warrior whose family have fallen out of favour. You have been sent on a quest to recover the Chalice of Dark Sight. If found, your family's good name will be restored.",
  ],
  [
    'DESCRIPTION GOBLIN',
    "Small humanoid creature.Treat with caution. They're small but vicious.",
  ],

  [
    'DESCRIPTION GOLD_COINS',
    'Gold coins stamped with the image of latter day kings and queens.',
  ],
  [
    'DESCRIPTION HALF_PLATE_ARMOUR',
    'Shaped metal plates covering most of the body. Simple greaves protect the legs.',
  ],
  [
    'DESCRIPTION HANDAXE',
    'A small, light axe. The blade is sharp and has been looked after with care.',
  ],
  ['DESCRIPTION HIDDEN_ARTEFACT', 'There might be something hidden here.'],
  [
    'DESCRIPTION IRON_RATIONS',
    'Simple emergency rations. Crucial for resting between rooms.',
  ],
  [
    'DESCRIPTION LEATHER_ARMOUR',
    'Simple armour comprising stiffened leather boiled in oil along with some more flexible sections.',
  ],
  [
    'DESCRIPTION NOXIOUS_GAS',
    'A cloud of foul smelling gas. Poisonous and strength sapping',
  ],
  ['DESCRIPTION ORC', 'A monstrous creature with an intense hatred of humans.'],

  ['DESCRIPTION PADDED_ARMOUR', 'Simple quilted layers of cloth and batting.'],
  [
    'DESCRIPTION PLATE_ARMOUR',
    'Full plate armour with interlocking steel plates covering the entire body. A visored helmet, gauntlets, boots, and padding are included.',
  ],
  ['DESCRIPTION PLATINUM_COINS', 'Highly valued large platinum.'],
  ['DESCRIPTION RAT', 'A giant rat, diseased and vicious.'],
  [
    'DESCRIPTION RING_MAIL_ARMOUR',
    'Leather armour reinforced with heavy steel rings sown into the material.',
  ],
  [
    'DESCRIPTION RUSTY_KEY',
    "A large iron key, covered in rust. It's been lost a long time.",
  ],
  [
    'DESCRIPTION SCALE_MAIL_ARMOUR',
    'Leather coat and legging covered with overlapping steel scales.',
  ],
  [
    'DESCRIPTION SHIELD',
    'A wooden shield, carried in one hand and offering some protection.',
  ],
  ['DESCRIPTION SHORTSWORD', 'A light and highly versatile sword.'],
  [
    'DESCRIPTION SILVER_COINS',
    'Silver coins, worn and tarnished but still of value.',
  ],
  ['DESCRIPTION SLIME', 'A green sticky substance that seems to be growing.'],

  ['DESCRIPTION SPIDER', 'A giant spider with fangs dripping green venom.'],
  [
    'DESCRIPTION STUDDED_LEATHER_ARMOUR',
    'Tough and flexible leather armour with the addition of steel spikes and rivets.',
  ],
  [
    'DESCRIPTION TRADER1',
    'A wandering trader selling all manner of things gathered during many months in the dungeon.',
  ],
  [
    'DESCRIPTION TRADER2',
    'A wandering trader with a wagon stacked high with a variety of artefacts found in the dungeon.',
  ],
  [
    'DESCRIPTION WATERSKIN',
    'A leather drinking flask with fresh water. Crucial for resting between rooms.',
  ],

  ['DIALOG TITLE BEST ADVENTURE', 'The most lucrative adventure so far'],
  ['DIALOG TITLE CHOICES', 'Decisions, decisions'],
  ['DIALOG TITLE PICK SPELL TO CAST', 'Pick spell to cast'],
  ['DIALOG TITLE PILLAGE', 'Pillage corpse'],
  ['DIALOG TITLE PREPARE SPELLS', 'Prepare spells'],
  ['DIALOG TITLE SETTINGS', 'Adjust settings'],
  ['DIALOG TITLE TRADE', 'Buy and sell with trader'],

  ['MENU TITLE MAIN', 'Click and Crawl'],
  ['MENU TITLE GUIDES', 'Guides and information'],
  ['MESSAGE CANNOT LOAD URL', 'Cannot load data from ${0}'],
  [
    'MESSAGE CANNOT REST',
    "You try to rest, but you don't have enough resources to restore your health.",
  ],
  [
    'MESSAGE CANNOT STASH',
    'You need to make space in your backpack to stash this.',
  ],
  [
    'MESSAGE CANNOT STORE',
    "You're carrying too much stuff to pick up what you've found.",
  ],

  [
    'MESSAGE CANNOT REST LONG',
    'You have enough resource for a short rest, but not a long one.',
  ],
  [
    'MESSAGE CONSUME BUT ALREADY FULL HP',
    "Tastes good, but you're already in prime health. Perhaps you should've waited.",
  ],
  [
    'MESSAGE CONSUME BUT NO HP GAIN',
    'Tastes nice, but your health hasn`t improved.',
  ],
  [
    'MESSAGE ENTER LEVEL',
    "You enter level ${0}. The door slams shut behind you. There's no way back. Like it or not, your only path is to continue deeper into the depths of this stone hell.",
  ],
  ['MESSAGE EXIT LOCKED', 'The exit is locked. There must be a key somewhere.'],
  [
    'MESSAGE EXPLAIN REST',
    'Trying to use the safety of the corridor to rest and eat?',
  ],

  [
    'MESSAGE DUNGEON INTRO',
    'Welcome, ${0}. You enter a dark and dingy dungeon. Water runs down the walls and the smell of rotting corpses fills the air',
  ],
  [
    'MESSAGE DUNGEON INTRO CONTINUE',
    'Welcome back, ${0}. The adventure continues. You recognise the familiar smell of death.',
  ],
  [
    'MESSAGE DUNGEON INTRO CASUAL',
    'Welcome, ${0}. You enter a dark and dingy dungeon. Explore as far as you can but remember your progress will not be saved.',
  ],
  [
    'MESSAGE DEAD HERO HAS NO INVENTORY',
    'Dead heroes have no use for material belongings. Your inventory is lost in the dungeon, perhaps to be rediscovered by the next intrepid explorer.',
  ],
  [
    'MESSAGE DEFEAT',
    'Despite your valiant efforts, you died. Your legend will live on.',
  ],
  [
    'MESSAGE GENERIC EPITAPH',
    'Here lies the corpse of one more defeated enemy.',
  ],
  ['MESSAGE HERO EPITAPH FOR', 'Here lies the body of ${0}. Rest in peace.'],
  [
    'MESSAGE INSUFFICIENT FUNDS',
    "You don't have enough funds to purchase this item. The item costs ${0}\u{00A0}GP but you only have ${1}\u{00A0}GP.",
  ],
  ["MESSAGE IT'S A HEALTHY DRINK", 'That tastes good. +${0}HP'],
  ["MESSAGE IT'S HEALTHY", 'A bit chewy, but tastes good. +${0}HP'],
  [
    'MESSAGE KILLED BY POISON',
    'Yuk! Poison! You start to burn up, cough and vomit, before falling to the floor and dying.',
  ],
  ["MESSAGE IT'S POISON", "Yuk! It's poison. -${0}HP"],
  [
    'MESSAGE MAKE SPACE IN BACKPACK',
    'You need to make space in your backpack by discarding or using something.',
  ],
  [
    'MESSAGE MAKE SPACE IN EQUIP',
    "This is too big to store. Sell or discard what you're wearing so you can wear this.",
  ],
  [
    'MESSAGE NOTHING MORE TO DISCOVER',
    "There's nothing more for you to learn or discover here.",
  ],

  [
    'MESSAGE RESISTED POISON',
    "Yuk! It's poisonous, but you resist its toxic effects.",
  ],
  [
    'MESSAGE REST DIALOG',
    "You are on a dark staircase leading deeper into the dungeon, but safe for now. If you have enough food or drink, you can rest to restore some health. If you don't need to recover, save your rations. These are the requirements:",
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
      'You have a choice. Do you want to search this hole or move into it?',
      "You've been here before. Do you want to search again or climb into the hole you dug?",
    ],
  ],
  [
    'MESSAGE SEARCH OR MOVE',
    'You have a choice. Do you want to search this tile or move onto it?',
  ],
  [
    'MESSAGE SPELL ALREADY KNOWN',
    "You've found a spell, but you already know this incantation.",
  ],
  ['MESSAGE TRADE OR BARGE', 'Do you want to trade or barge past this guy?'],
  [
    'MESSAGE ENTRANCE STUCK',
    [
      "The entrance is locked or jammed. You can't tell. Either way, you can't escape in that direction.",
      "You can't open the door. It seems locked or jammed. There's no way back.",
    ],
  ],
  [
    'MESSAGE EXPLAIN SPELL PREP',
    'After a long rest, you can prepare spells ready for use.',
  ],
  [
    'MESSAGE FOUND HIDDEN ARTEFACT',
    [
      'Good fortune smiles upon you. You found something.',
      'You find something hidden in the ground.',
      'Buried beneath the surface, you find something.',
    ],
  ],
  [
    'MESSAGE FOUND ENGRAVING',
    'You find strange word engraved on the cold stone surface.',
  ],
  ['MESSAGE FOUND GENERIC', "It 's your lucky day. You' found something."],
  [
    'MESSAGE GROUND DISTURBED',
    [
      'The ground appears to have been disturbed.',
      "There's been some recent digging here.",
    ],
  ],
  [
    'MESSAGE KEY UNLOCKS EXIT',
    'You use the key you found earlier to unlock the door.',
  ],
  ['MESSAGE NO SAVED ADVENTURE', 'No adventure has been saved yet.'],
  ['MESSAGE NOTHING HERE', "There's nothing here."],
  [
    'MESSAGE WELCOME',
    'Welcome to the Click and Crawl old-school dungeon crawler. How far will you get?',
  ],
  [
    'MESSAGE VICTORY',
    'You have conquered the dungeon. Your name will live on forever and generations will sing of your great achievements.',
  ],
  ['LONG REST REQ', 'Long rest: drinks: ${0}; meals: ${1}'],
  ['SHORT REST REQ', 'Short rest: drinks: ${0}; meals: ${1}; hit dice: 1'],

  // Miscellaneous words and phrases.
  ['AC (including armour)', 'AC (+armour): ${0}'],
  ['Backpack', 'Backpack'],
  ['Body', 'Body'],
  ['Cantrips', 'Cantrips'],
  ['Consumables', 'Consumables'],
  ['Character level:', 'Character level: ${0}'],
  ['CHARACTER LEVEL:', 'level: ${0}'],
  ['(DEAD)', '(DEAD!)'],
  ['Dungeon level:', 'Dungeon level: ${0}'],
  ['Experience:', 'Experience: ${0}'],
  ['Feet', 'Feet'],
  ['Score:', 'Score: ${0}'],
  ['Gold:', 'Gold: ${0}\u{00A0}GP'],
  ['GOLD PIECES', ' gold pieces'],
  ['Hands', 'Hands'],
  ['Head', 'Head'],
  ['(HP OUT OF VALUE)', '(HP:\u{00A0}${0}/${1})'],
  ['(HP VALUE)', '(HP:\u{00A0}${0})'],
  ['Known spells', 'Known spells'],
  ['LEVEL UP', 'Level up to ${0}'],
  ['Name:', 'Name: ${0}'],
  ['Prepared spells', 'Prepared spells'],
  ['Ready magic', 'Ready magic'],
  ['Unknown', 'Unknown'],
  ['Wagon', 'Wagon'],
]);

export default MESSAGE_MAP;

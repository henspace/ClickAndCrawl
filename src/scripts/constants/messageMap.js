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
  ['BUTTON DELETE MEMORY', 'Delete memory'],
  ['BUTTON CONSUME', 'Consume'],
  ['BUTTON CONTINUE', 'Continue'],
  ['BUTTON CONTINUE ADVENTURE', 'Continue adventure'],
  ['BUTTON CLIMB OVER', 'Climb over'],
  ['BUTTON BARGE', 'Barge past'],
  ['BUTTON HALL OF FAME', 'Hall of fame'],
  ['BUTTON DELETE', 'DELETE!'],
  ['BUTTON DISCARD', 'Discard'],
  ['BUTTON DO NOT SHOW AGAIN', 'Do not show again'],
  ['BUTTON ENTER DUNGEON', 'Enter if you dare'],
  ['BUTTON EQUIP', 'Equip'],
  ['BUTTON FORGET', 'Forget'],
  ['BUTTON GUIDES', 'About and Help'],
  ['BUTTON HELP', 'Help'],
  ['BUTTON INVENTORY', 'Inventory'],
  ['BUTTON LEARN SPELL', 'Learn spell'],
  ['BUTTON LEAVE ARTEFACT', 'Leave'],
  ['BUTTON LEAVE IT', 'Leave it'],
  ['BUTTON MAGIC', 'Magic'],
  ['BUTTON MAIN MENU', 'Main menu'],
  ['BUTTON MOVE', 'Move'],
  ['BUTTON OK', 'OK'],
  ['BUTTON PILLAGE', 'Stash'],
  ['BUTTON PLAY ADVENTURE', 'Start adventure'],
  ['BUTTON PLAY CASUAL', 'Casual exploration'],
  ['BUTTON PRIVACY', 'Privacy'],
  ['BUTTON PREPARE SPELL', 'Prepare'],
  ['BUTTON REST', 'Rest'],
  ['BUTTON REST LONG', 'Long rest'],
  ['BUTTON READY MAGIC', 'Ready Magic'],
  ['BUTTON REST SHORT', 'Short rest'],
  ['BUTTON SEARCH', 'Search'],
  ['BUTTON SELL FOR GP', 'Sell for ${0}\u{00A0}GP'],
  ['BUTTON SETTINGS', 'Settings'],
  ['BUTTON SHOW DEBUG LOG', 'The chronicles of DeBuggle Logitall'],
  ['BUTTON START', "Let's get started."],
  ['BUTTON STASH', 'Stash'],
  ['BUTTON STEAL', 'Steal'],
  ['BUTTON TRAP DISABLE', 'Try to disable'],
  ['BUTTON TRAP LEAVE', 'Leave it alone'],
  ['BUTTON TAKE ARTEFACT', 'Stash'],
  ['BUTTON TRADE', 'Trade'],
  ['BUTTON TRAITS', 'Traits'],
  ['BUTTON TRY AGAIN', 'Try again'],
  ['BUTTON TRY TO PICK', 'Pick lock'],

  ['BUTTON USE', 'Use'],

  ['CONTROL EFFECTS VOLUME', 'Effects volume'],
  ['CONTROL MUSIC VOLUME', 'Music volume'],
  ['CONTROL SHOW QUICK TIPS', 'Show quick tips'],
  ['CONTROL RUN FULLSCREEN', 'Run fullscreen'],
  [
    'DESCRIPTION ACID_SPLASH',
    'You hurl a bubble of acid over up to two creatures within your touch.',
  ],
  [
    'DESCRIPTION ACID_ARROW',
    'You send out a shimmering green arrow that bursts into a spray of acid on impact.',
  ],
  [
    'DESCRIPTION AMBER',
    'Precious fossilized tree resin, which is much sought after in these realms.',
  ],
  [
    'DESCRIPTION ARCANE_ORB',
    'Orb used by some users of magic to focus their spells.',
  ],
  [
    'DESCRIPTION ARCANE_SWORD',
    'You create a sword-shaped plane of energy that hovers over your target and initiates a melee spell attack.',
  ],
  ['DESCRIPTION AQUAMARINE', 'A precious crystal of rare beauty.'],
  [
    'DESCRIPTION BARBARIAN1',
    'You are a barbarian ready to battle to the end of this dungeon in search of wealth and glory.',
  ],
  [
    'DESCRIPTION BELT_OF_STRENGTH',
    'A rare belt, originally crafted by dwarves and significantly increasing the strength of the wearer.',
  ],
  ['DESCRIPTION BERSERKER', 'A hate crazed berserker.'],
  [
    'DESCRIPTION BLACK_FLASK',
    'A black flask containing a clear, pungent liquid.',
  ],
  [
    'DESCRIPTION BLACK_FLASK?SERPENT_VENOM',
    'A black flask containing a clear, pungent liquid.',
  ],
  [
    'DESCRIPTION BLADE_BARRIER',
    'You create a whirling ringed-wall of spinning blades.',
  ],
  [
    'DESCRIPTION BLIGHT',
    'You cause necromantic energy to flow over a creature, draining moisture and vitality from it. The spell does not work on the undead.',
  ],
  ['DESCRIPTION BLUE_FLASK', 'A blue flask containing a clear, aromatic oil.'],
  [
    'DESCRIPTION BUGBEAR',
    'A ferocious humanoid and evil creature bent on mayhem and carnage.',
  ],
  [
    'DESCRIPTION BURNING_HANDS',
    'Casting this spell with your thumbs touching and fingers spread creates a thin sheet of flames enveloping your enemies.',
  ],
  [
    'DESCRIPTION CHAIN_MAIL_ARMOUR',
    'Armour comprising interlocking steel rings over a soft cushioning fabric. The suit includes gauntlets.',
  ],
  [
    'DESCRIPTION CHILL_TOUCH',
    'You create a ghostly skeletal hand on a creature you can touch and assail it with the chill of the grave.',
  ],
  [
    'DESCRIPTION CIRCLE_OF_DEATH',
    'You create a sphere of negative energy that ripples out around you.',
  ],
  [
    'DESCRIPTION CLERIC1',
    'You are a powerful cleric who can act as a conduit between divine powers and the mortal world.',
  ],
  ['DESCRIPTION CLUB', "A simple wooden club that's seen a lot of action."],
  [
    'DESCRIPTION COINS',
    'Various coins stamped with the image of latter day kings and queens.',
  ],
  [
    'DESCRIPTION CONE_OF_COLD',
    'You create a blast of cold air that erupts from your hands.',
  ],
  ['DESCRIPTION COPPER_COINS', 'Old copper coins of low value.'],
  [
    'DESCRIPTION COPPER_DRAGON_WYRMLING',
    'A very young copper dragon. Young, but capable of inflicting serious damage with its bite and claws.',
  ],
  [
    'DESCRIPTION CREATE_FOOD_AND_WATER',
    'You conjure some food and water to create up to three meals. You need space in your backpack to store the meals.',
  ],
  [
    'DESCRIPTION CURE_MY_WOUNDS',
    'You cast a spell allowing you to cure some of your wounds',
  ],
  ['DESCRIPTION DAGGER', 'A short and very sharp piercing weapon.'],
  [
    'DESCRIPTION DETECT_POISON',
    'You perform a ritual to identify any poisons or unidentified items in your backpack.',
  ],
  ['DESCRIPTION DIAMOND', 'A valuable and rare crystal.'],
  ['DESCRIPTION DRETCH', 'The lowest and least respected of all demons.'],
  [
    'DESCRIPTION EARTHQUAKE',
    'You create a seismic disturbance causing an intense tremor to rip through the ground.',
  ],
  [
    'DESCRIPTION ENCHANTED_BATTLE_AXE',
    'An enchanted axe increasing the power of your attacks.',
  ],
  [
    'DESCRIPTION ENGRAVED_PILLAR',
    'A large stone pillar covered with mystical engravings.',
  ],
  [
    'DESCRIPTION FETID_WATER',
    'A fetid, murky film of liquid covering the dungeon flagstones.',
  ],

  [
    'DESCRIPTION FIGHTER1',
    "You are a fighter whose family have fallen out of favour. This is your chance to restore your family's good name.",
  ],
  [
    'DESCRIPTION FIND_TRAPS',
    'You sense the presence of traps around you. You cannot learn the location of the traps though.',
  ],
  [
    'DESCRIPTION FINGER_OF_DEATH',
    'You send negative energy coursing through a creature you can see within range, causing it searing pain.',
  ],
  [
    'DESCRIPTION FIRE_BEETLE_PV',
    'A giant fire beetle. Glowing gland radiate a fiery light across the dungeon.',
  ],
  ['DESCRIPTION FIRE_BOLT', 'You hurl fire at a creature.'],
  ['DESCRIPTION FIRE_STORM', 'You create sheets of roaring flames.'],
  ['DESCRIPTION FLAIL', 'A fear inducing bludgeoning weapon.'],
  [
    'DESCRIPTION FLAME_STRIKE',
    'You create a column of divine fire almost forty feet high.',
  ],
  [
    'DESCRIPTION FUNGAL_FILM',
    'A sticky fungal film that coats the dungeon floor. Poisonous and strength sapping',
  ],
  ['DESCRIPTION FUNGUS', 'A brightly coloured red and white fungus.'],
  [
    'DESCRIPTION FUNGUS?BERSERKER_COURAGE',
    'Berserker courage fungus. Consumption creates a feeling of unstoppable power and provides a temporary adrenalin-fueled increase in strength.',
  ],
  [
    'DESCRIPTION FUNGUS?DEATH_FLY',
    'Death fly fungus. A poisonous fungus often confused with Berserker Courage.',
  ],
  ['DESCRIPTION GARGOYLE', 'A chaotic evil gargoyle.'],
  [
    'DESCRIPTION GIANT_WASP_PV',
    'A gigantic wasp making a deafening buzzing sound that echoes round the dungeon.',
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
    'DESCRIPTION GHOUL',
    'An undead creature, living amongst the dead and dying.',
  ],
  [
    'DESCRIPTION GOLD_PORTAL',
    'A magical dwarven portal used for transporting gold and platinum back to the surface.',
  ],
  [
    'DESCRIPTION GREATAXE',
    'A heavy two-handed axe capable of inflicting severe wounds when in the right hands.',
  ],
  [
    'DESCRIPTION GREATSWORD',
    'A two-handed massive sword inflicting serious slashing damage.',
  ],
  [
    'DESCRIPTION HALF_PLATE_ARMOUR',
    'Shaped metal plates covering most of the body. Simple greaves protect the legs.',
  ],
  [
    'DESCRIPTION HANDAXE',
    'A small, light axe. The blade is sharp and has been looked after with care.',
  ],
  ['DESCRIPTION HIDDEN_ARTEFACT', 'The ground appears to have been disturbed.'],
  [
    'DESCRIPTION HUNTING_TRAP',
    'A old battered hunting trap designed for catching monsters and humans.',
  ],
  [
    'DESCRIPTION ICE_STORM',
    'You cause a hail of rock-hard ice to pound to the ground around you.',
  ],
  [
    'DESCRIPTION INCENDIARY_CLOUD',
    'You create a swirling cloud of smoke shot through with white hot embers.',
  ],
  [
    'DESCRIPTION INFLICT_WOUNDS',
    'You make a melee spell attack against a creature you can touch to inflict necrotic damage.',
  ],
  [
    'DESCRIPTION IRON_RATIONS',
    'Simple emergency rations. Crucial for resting between floors.',
  ],
  ['DESCRIPTION KOBOLD', 'A small reptilian humanoid.'],
  [
    'DESCRIPTION LEATHER_ARMOUR',
    'Simple armour comprising stiffened leather boiled in oil along with some more flexible sections.',
  ],

  ['DESCRIPTION LICHEN', 'A type of lichen that grows between the flagstones.'],
  [
    'DESCRIPTION LICHEN?DRAGON_SCALE_LICHEN',
    "Dragon scale lichen. A green lichen, much sought after by explorers because of it's legendary health benefits.",
  ],
  [
    'DESCRIPTION LICHEN?LIZARD_SKIN_LICHEN',
    'Lizard skin lichen. A green lichen, closely related to dragon scale lichen, but mildly poisonous.',
  ],
  [
    'DESCRIPTION LIGHTNING_BOLT',
    "You create a stroke of lightning that shoots out from you hitting all creatures in it's path.",
  ],
  ['DESCRIPTION LOCK_PICK', 'Set of lock picks.'],
  ['DESCRIPTION LUTE', 'A beautiful lute in remarkable condition.'],
  [
    'DESCRIPTION MANHOLE_COVER',
    'A small manhole cover set into the dungeon floor.',
  ],
  ['DESCRIPTION MEAT', 'A joint of some type of meat.'],
  [
    'DESCRIPTION MEAT?HAM',
    'A joint of meat which can be used as a meal while you rest between floors.',
  ],
  [
    'DESCRIPTION MEAT?POISON_LIZARD',
    'A hunk of meat from a dungeon lizard. This is toxic to humans.',
  ],
  [
    'DESCRIPTION MEAT?ROTTING',
    "A joint of meat, but it looks and smells like it is well past it's best.",
  ],

  ['DESCRIPTION OGRE', 'A large and incredibly strong ogre.'],
  ['DESCRIPTION ORC', 'A monstrous creature with an intense hatred of humans.'],
  ['DESCRIPTION ORC_SKULL', 'An old and slightly cracked skull from a orc.'],
  ['DESCRIPTION PADDED_ARMOUR', 'Simple quilted layers of cloth and batting.'],
  [
    'DESCRIPTION PLATE_ARMOUR',
    'Full plate armour with interlocking steel plates covering the entire body. A visored helmet, gauntlets, boots, and padding are included.',
  ],
  ['DESCRIPTION PLATINUM_COINS', 'Highly valued large platinum coins.'],

  [
    'DESCRIPTION POISON_SPRAY',
    'You extend your hand toward your enemy and project a puff of noxious gas.',
  ],
  [
    'DESCRIPTION POISONERS_KIT',
    'A kit of vials of poisons and other toxic materials.',
  ],
  [
    'DESCRIPTION POWER_WORD_KILL',
    'You utter a word of power that compels a creature to die instantly.',
  ],
  [
    'DESCRIPTION POTION_OF_HEALING',
    "An aromatic potion, treasured for it's health restoration properties.",
  ],
  ['DESCRIPTION PURPLE_PLANT', 'A small herb with a purple flower.'],
  [
    'DESCRIPTION PURPLE_PLANT?DRAGON_WORT',
    "Purple dragon wort. Renowned for it's health giving properties.",
  ],
  [
    'DESCRIPTION PURPLE_PLANT?FALSUS_DRAGON_WORT',
    'Falsus dragon wort. Mimicking the medicinal dragon wort herb, this plant is highly toxic.',
  ],
  [
    'DESCRIPTION QUARTERSTAFF',
    'A large quarterstaff capable of causing significant damage in the right hands.',
  ],
  ['DESCRIPTION QUARTZ', 'A precious crystal.'],
  ['DESCRIPTION RAT_PV', 'A giant rat, diseased and vicious.'],
  [
    'DESCRIPTION RANGER1',
    'You are a ranger who is more at one with the forest. The dungeon is not your natural realm, but you are ready to take it on.',
  ],
  [
    'DESCRIPTION RING_MAIL_ARMOUR',
    'Leather armour reinforced with heavy steel rings sown into the material.',
  ],
  [
    'DESCRIPTION RING_OF_CHARISMA',
    'A magical ring that increases the charisma of the wearer.',
  ],

  [
    'DESCRIPTION RING_OF_CONSTITUTION',
    'A magical ring that increases the constitution of the wearer.',
  ],
  [
    'DESCRIPTION RING_OF_DEXTERITY',
    'A magical ring that increases the dexterity of the wearer.',
  ],
  [
    'DESCRIPTION RING_OF_INTELLIGENCE',
    'A magical ring that increases the intelligence of the wearer.',
  ],
  [
    'DESCRIPTION RING_OF_STRENGTH',
    'A magical ring that increases the strength of the wearer.',
  ],
  [
    'DESCRIPTION RING_OF_WISDOM',
    'A magical ring that increases the wisdom of the wearer.',
  ],
  [
    'DESCRIPTION ROGUE1',
    'You are a rogue whose slippery character may help you creep your way through the depths of this dark and unforgiving dungeon.',
  ],
  [
    'DESCRIPTION RUSTY_KEY',
    "A large iron key, covered in rust. It's been lost a long time.",
  ],
  [
    'DESCRIPTION SCALE_MAIL_ARMOUR',
    'Leather coat and legging covered with overlapping steel scales.',
  ],
  ['DESCRIPTION SHADOW', 'An undead shadow creature, hiding in the darkness.'],
  [
    'DESCRIPTION SHATTER',
    'You create a sudden loud ringing noise, painfully intense, that inflicts thunder damage on a creature.',
  ],
  [
    'DESCRIPTION SHIELD',
    'A wooden shield, carried in one hand and offering some protection.',
  ],
  [
    'DESCRIPTION SHOCKING_GRASP',
    'You create lightning which springs from your hands, delivering a massive shock to a creature within touching distance.',
  ],
  ['DESCRIPTION SHORTSWORD', 'A light and highly versatile sword.'],
  [
    'DESCRIPTION SILVER_COINS',
    'Silver coins, worn and tarnished but still of value.',
  ],
  [
    'DESCRIPTION SKELETON',
    "A skeleton of someone who died here many years ago. It's intent on revenge.",
  ],
  ['DESCRIPTION SLIME', 'A green sticky substance that seems to be growing.'],
  [
    'DESCRIPTION SPARE_ME',
    'You use your knowledge of necromancy to raise your health if you are nearly dying.',
  ],
  ['DESCRIPTION SPIDER_PV', 'A giant spider with fangs dripping green venom.'],
  [
    'DESCRIPTION SPIKES',
    "It's a trap. Sharp iron spikes shoot up from the ground.",
  ],
  [
    'DESCRIPTION STIRGE',
    'A blood-sucking cross between a giant mosquito and a blood curdling bat.',
  ],
  [
    'DESCRIPTION ENHANCE_ABILITY_AS_BULL',
    'You bestow upon yourself a temporary increase in your strength.',
  ],
  [
    'DESCRIPTION STUDDED_LEATHER_ARMOUR',
    'Tough and flexible leather armour with the addition of steel spikes and rivets.',
  ],
  ['DESCRIPTION TIGER_EYE', 'A precious gemstone'],
  [
    'DESCRIPTION TOMB_OF_ELDER',
    'A large ancient shrine. It appears to be stone but with a magical gold lustre.',
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
    'DESCRIPTION TRAPDOOR',
    "A small door in the floor. You can't tell what it hides.",
  ],
  [
    'DESCRIPTION VAMPIRIC_TOUCH',
    'You touch a shadow-wreathed hand on a creature to inflict necrotic damage. You draw upon the damage inflicted to help heal your own wounds.',
  ],
  [
    'DESCRIPTION VEGETATION',
    'A patch of vegetation managing to grow between the cracks in the flagstones.',
  ],
  ['DESCRIPTION VIOLET_FUNGUS', 'A moving fungus inflicting severe damage.'],
  [
    'DESCRIPTION WATERSKIN',
    'A leather drinking flask with fresh water. Crucial for resting between floors.',
  ],
  [
    'DESCRIPTION WARHAMMER',
    'A bludgeoning, versatile iron hammer favoured by many clerics.',
  ],
  [
    'DESCRIPTION WARLOCK1',
    'You are a warlock, known for you great knowledge of the supernatural forces that drive the multiverse.',
  ],
  [
    'DESCRIPTION WATER_WALK',
    'You perform a ritual to allow yourself to move across any liquid surface unharmed as your feet hover an inch or two above the ground.',
  ],
  [
    'DESCRIPTION WIGHT',
    'A wight, reanimated from the corpse of a rogue fighter whose rotting body was raised by evil necromancy.',
  ],
  [
    'DESCRIPTION WIZARD1',
    'You are a wizard determined to find your way to the final level of this dungeon using your control of magical chaos.',
  ],
  [
    'DESCRIPTION WRAITH',
    'An undead, neutral evil creature with a touch of death.',
  ],
  ['DESCRIPTION ZOMBIE', 'An undead creature roaming the dungeon floors.'],
  ['DIALOG TITLE DEBUG LOG', 'Chronicles of Debug Loggerman'],
  ['DIALOG TITLE DELETE MEMORY', 'DELETE MEMORY!'],
  ['DIALOG TITLE HALL OF FAME', 'Hall of Fame'],
  ['DIALOG TITLE CHOICES', 'Decisions, decisions'],
  ['DIALOG TITLE LOCKED', 'Locked'],
  ['DIALOG TITLE GOLD_PORTAL', 'Use the gold portal'],
  ['DIALOG TITLE PICK SPELL TO CAST', 'Pick spell to cast'],
  ['DIALOG TITLE PILLAGE', 'Pillage corpse'],
  ['DIALOG TITLE PREPARE SPELLS', 'Prepare spells'],
  ['DIALOG TITLE RUNE PUZZLE', 'Where next?'],
  ['DIALOG TITLE SETTINGS', 'Adjust settings'],
  ['DIALOG TITLE TRADE', 'Buy and sell with trader'],
  ['DIALOG TITLE TRAP DETECTED', 'Trap detected!'],
  ['DIALOG TITLE TRAP DISABLED', 'Trap disabled!'],
  ['DIALOG TITLE TRAP TRIGGERED SURVIVED', 'Trap triggered!'],
  ['DIALOG TITLE TRAP TRIGGERED INJURED', 'Trap triggered!'],
  ['MENU TITLE MAIN', 'Click and Crawl'],
  ['MENU TITLE GUIDES', 'Guides and information'],
  [
    'MESSAGE ACHIEVEMENTS',
    'You managed to reach floor ${0-floor} and sent back ${1}\u{00A0}GP to the struggling townsfolk beyond these dungeon walls.',
  ],
  ['MESSAGE CANNOT LOAD URL', 'Cannot load data from ${0}'],
  [
    'MESSAGE CANNOT REST SHORT NEED LONG REST',
    "You've had too many short rests. You need to take a long rest first.",
  ],
  [
    'MESSAGE CANNOT REST SHORT NEED RATIONS',
    "You don't have enough food or drink for a short rest. One meal and one drink are required to enjoy a short rest.",
  ],
  [
    'MESSAGE CANNOT REST LONG NEED RATIONS',
    "You don't have enough food or drink for a long rest. Three meals and three drinks are required to enjoy a long rest.",
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
    'MESSAGE CANNOT UNDERSTAND MAGIC',
    "There is strange magic written here, but it's beyond your comprehension.",
  ],
  [
    'MESSAGE CONFIRM DELETE MEMORY',
    "Are you sure you want to delete the game's memory? The Hall of Fame will be lost along with all the game settings.",
  ],
  [
    'MESSAGE CONJURED FOOD AND WATER',
    'You conjure some food and water and stash it in your backpack.',
  ],
  [
    'MESSAGE CONSUME BUT ALREADY FULL HP',
    "It tastes good, but you're already in prime health. Perhaps you should've waited.",
  ],
  [
    'MESSAGE CONSUME BUT NO HP GAIN',
    'It tastes nice, but your health doesn`t improve.',
  ],
  [
    'MESSAGE DEAD HERO HAS NO INVENTORY',
    'Dead heroes have no use for material belongings. Your inventory is lost in the dungeon, perhaps to be rediscovered by the next intrepid explorer.',
  ],
  [
    'MESSAGE DEFEAT',
    "To honour your achievements, the grateful townsfolk will add your name to a plaque in the town's Hall of Fame. Tonight the inns will be filled with songs of your heroism.",
  ],
  [
    'MESSAGE DEFEAT UNPLACED',
    'Despite your valiant efforts, your efforts will be forgotten and no bards will sing of your exploits.',
  ],
  [
    'MESSAGE DETECT POISON FAILURE',
    'You waste your spell. There were no unidentified items in your backpack.',
  ],
  [
    'MESSAGE DETECT POISON SUCCESS',
    'You identify everything in your backpack.',
  ],
  [
    'MESSAGE DUNGEON INTRO CONTINUE',
    'Welcome back, ${0}. The adventure continues. You recognise the familiar smell of death.',
  ],
  [
    'MESSAGE DUNGEON INTRO CASUAL',
    'You enter the dungeon for a quick exploration and to check on what dangers might exist before starting a full adventure. You progress will not be saved and any achievements will be lost.',
  ],
  [
    'MESSAGE ENTER FLOOR',
    "You enter dungeon floor ${0}. The door slams shut behind you. There's no way back. Like it or not, your only path is to continue deeper into the depths of this stone hell.",
  ],
  [
    'MESSAGE ENTRANCE STUCK',
    [
      "The entrance is locked or jammed. You can't tell which, but either way, you can't escape in that direction.",
      "You can't open the entrance. It seems locked or jammed. There's no way back.",
    ],
  ],
  [
    'MESSAGE EXPLAIN SPELL PREP',
    'After a long rest, you can prepare spells ready for use.',
  ],

  ['MESSAGE EXIT LOCKED', 'The exit is locked. There must be a key somewhere.'],
  [
    'MESSAGE EXPLAIN REST',
    'Trying to use the safety of the corridor to rest and eat?',
  ],
  [
    'MESSAGE EXPLAIN SPELL NEEDS REST',
    'To use a spell you need to prepare it. Preparation can only be done between dungeon floors after a long rest.',
  ],
  [
    'MESSAGE FAILED TO IDENTIFY',
    "You try to identify this item, but you're not sure exactly what it is. You might remember later.",
  ],
  [
    'MESSAGE FOUND HIDDEN ARTEFACT',
    [
      'Good fortune smiles upon you. You find something.',
      'You find something that has been hidden or lost.',
      'Buried beneath the surface, you find something.',
    ],
  ],
  [
    'MESSAGE FOUND ENGRAVING',
    'You find strange words engraved on the cold stone surface.',
  ],
  [
    'MESSAGE FOUND GENERIC',
    "It 's your lucky day. You find something that appears to have been hidden for many years.",
  ],
  ['MESSAGE FX TRAITS APPLIED', 'You feel a strange effect on your abilities.'],
  [
    'MESSAGE GENERIC EPITAPH',
    'Here lies the corpse of one more defeated enemy.',
  ],
  [
    'MESSAGE HALL OF FAME ENTRY',
    '${3-startDate}: ${0-name}; level ${1-level} ${2-class}; ${4-gold} GP sent; floor ${5-floor}',
  ],
  ['MESSAGE HERO EPITAPH FOR', 'Here lies the body of ${0}. Rest in peace.'],
  ['MESSAGE IDENTIFIED ITEM', "You manage to identify an item you've found."],

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
    'MESSAGE KEY UNLOCKS EXIT',
    'You use the key you found earlier to unlock the door.',
  ],
  [
    'MESSAGE MAKE SPACE IN BACKPACK',
    'You need to make space in your backpack by discarding or using something.',
  ],
  [
    'MESSAGE MAKE SPACE IN EQUIP',
    "This is too big to store. Sell or discard what you're wearing so you can wear this.",
  ],
  ['MESSAGE MEMORY DELETED', 'The memory has been deleted.'],
  [
    'MESSAGE NO SPACE FOR CONJURED FOOD AND WATER',
    'You conjure food and water, but it all goes to waste as you have no room left in your backpack.',
  ],
  [
    'MESSAGE NO SPACE FOR ALL CONJURED FOOD AND WATER',
    'You conjure food and water, but some of it goes to waste as you have no room left in your backpack.',
  ],
  [
    'MESSAGE GOLD_PORTAL - EXPLAIN',
    'This old dwarven gold portal can be used to transfer gold to help the desperate townsfolk who are struggling above ground. Choose how much gold you want to send.',
  ],
  [
    'MESSAGE GOLD_PORTAL - EXPLAIN CLOSURE',
    'You add ${0-gold}\u{00A0}GP to the portal. Dwarven portals remain open until they can no longer detect the presence of the opener. To prevent gold staying locked in the portal, you will need to exit the room or die to allow the portal to close.',
  ],
  [
    'MESSAGE GOLD_PORTAL - INSUFFICIENT GOLD',
    "You don't have enough gold for the portal. Copper and silver cannot be sent via the portal.",
  ],
  [
    'MESSAGE NEED LOCK PICK',
    "You can't pick a lock without a set of lock picks.",
  ],
  [
    'MESSAGE NO CASTING POWER LEFT',
    "You don't have enough casting power left to cast this spell. You will need to take a long rest to recover your energy.",
  ],
  ['MESSAGE NO SAVED ADVENTURE', 'No adventure has been saved yet.'],
  ['MESSAGE NOTHING HERE', "There's nothing here."],

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
    "You're at the top of a dark staircase leading even deeper down to floor ${0-floor}. You're safe for now. If you have enough food and drink, you can rest to recuperate, but if you don't need to recover, save your rations.",
  ],
  [
    'MESSAGE REST LONG HP GAIN',
    'Your long rest recovered ${0} HP. You are also now cured of the toxic effects of any poisons you may have encountered.',
  ],

  [
    'MESSAGE REST SHORT HP GAIN',
    'Your short rest recovered ${0} HP and gave you time to rid your body of any poisons.',
  ],
  ['MESSAGE ROUTE CHOICE - EASY', 'You choose the easier route.'],
  ['MESSAGE ROUTE CHOICE - MEDIUM', 'You choose the harder route.'],
  [
    'MESSAGE RUNES ON WALL',
    "At the bottom of the stairs there are two doors. There's an ancient inscription on wall.",
  ],
  [
    'MESSAGE RUNES OVER DOORS',
    'Above each door is a shorter inscription carved into the arch. You need to choose your path.',
  ],
  [
    'MESSAGE SEARCH CORPSE OR MOVE',
    [
      'You have a choice. Do you want to search the body or climb on top?',
      'You find a corpse, but what should you do? Search for weapons and treasure or climb on top of the body?',
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
    'You find a spell, but you already know this incantation.',
  ],
  [
    'MESSAGE STOLE GOLD',
    "Success. You pick the trader's pocket undetected and steal ${0} gold coins.",
  ],
  [
    'MESSAGE TRADE STEAL OR BARGE',
    'Do you want to trade or barge past this guy?',
  ],
  [
    'MESSAGE TRADER ATTACKS BACK',
    'The angry trader detects your clumsy attempt at robbery and strikes back at you.',
  ],
  ['MESSAGE TRADER CANNOT STASH', 'The trader has no space for this.'],
  [
    'MESSAGE TRADER WILL NOT TRADE',
    'The trader has had enough of your trickery and will not trade with you.',
  ],
  [
    'MESSAGE TRADERS PROTECTED',
    'Traders are protected from attack under the ancient law for the protection of travelling merchants.',
  ],
  [
    'MESSAGE TRAP ATTEMPT DISABLE',
    "You find a trap. You can't tell what it is though. Do you want to try to disable it?",
  ],
  [
    'MESSAGE TRAP TRIGGERED SURVIVED',
    'The trap triggers, but luckily you avoid any injury.',
  ],
  [
    'MESSAGE TRAP TRIGGERED INJURED',
    "You're caught by surprise and sustain a number of injuries from the trap.",
  ],
  [
    'MESSAGE TRAP DISABLED',
    'Taking great care you manage to disable the trap.',
  ],
  [
    'MESSAGE USE PORTAL OR MOVE',
    'You have a choice. Do you want to use this portal or move onto it?',
  ],
  [
    'MESSAGE YOU FAIL TO PICK THE LOCK',
    'This lock is tricky. Your attempt to pick it fails.',
  ],
  [
    'MESSAGE YOU PICK THE LOCK',
    'Using your skills, you manage to pick the lock.',
  ],
  [
    'MESSAGE WELCOME',
    'Welcome to the Click and Crawl old-school dungeon crawler. How far will you get?',
  ],

  // Traits keys
  ['STR', 'Strength'],
  ['DEX', 'Dexterity'],
  ['CON', 'Constitution'],
  ['INT', 'Intelligence'],
  ['WIS', 'Wisdom'],
  ['CHA', 'Charisma'],

  ['FX_STR', 'Strength change'],
  ['FX_DEX', 'Dexterity change'],
  ['FX_CON', 'Constitution change'],
  ['FX_INT', 'Intelligence change'],
  ['FX_WIS', 'Wisdom change'],
  ['FX_CHA', 'Charisma change'],

  ['AC', 'Armour class'],
  ['DMG', 'Damage'],
  ['DMG_PER_TURN', 'Damage per turn'],
  ['DC', 'Difficulty'],
  ['HP', 'Hit points'],

  [
    'TRIGGERS',
    'Content warning: this game is generally suitable for ages 12 and up and contains violence towards fantasy characters, horror sequences and death.',
  ],

  // Miscellaneous words and phrases.
  ['AC', 'armour class'],
  ['AC (including armour)', 'AC (+armour): ${0}'],
  ['ACTS ON CASTER', 'Acts on caster'],
  ['Backpack', 'Backpack'],
  ['Body', 'Body'],
  ['Cantrips', 'Cantrips'],
  ['Consumables', 'Consumables'],
  ['CHARACTER LEVEL:', 'level: ${0-level} ${1-class}'],
  ['CHA', 'charisma'],
  ['CON', 'constitution'],
  ['DC', 'difficulty challenge'],
  ['(DEAD)', '(DEAD!)'],
  ['DEX', 'dexterity'],
  ['Dungeon floor:', 'Dungeon floor: ${0}'],
  ['Experience:', 'Experience: ${0}'],
  ['Feet', 'Feet'],
  ['Score:', 'Score: ${0}'],
  ['Gold:', 'Gold: ${0}\u{00A0}GP'],
  ['GOLD PIECES', ' gold pieces'],
  ['Hands', 'Hands'],
  ['Head', 'Head'],
  ['(HP OUT OF VALUE)', '(HP:\u{00A0}${0}/${1})'],
  ['(HP VALUE)', '(HP:\u{00A0}${0})'],
  ['INT', 'intelligence'],
  ['Known spells', 'Known spells'],
  ['level', 'level'],
  ['LEVEL UP', 'Level up to ${0}'],
  ['Name:', 'Name: ${0}'],
  ['NSEW', 'north-south-east-west'],
  ['PB', 'proficiency bonus'],
  ['Prepared spells', 'Prepared spells'],
  ['Range:', 'Range: ${0-range}'],
  ['Ready magic', 'Ready magic'],
  ['Ring fingers', 'Ring fingers'],
  ['SHORT_RESTS_REMAINING', 'Short rests remaining'],
  ['STR', 'strength'],
  ['Unknown', 'Unknown'],
  ['Wagon', 'Wagon'],
  ['Waist', 'Waist'],
  ['WIS', 'wisdom'],
  ['YOU DIED!', 'YOU DIED!'],
  ['zero', 'zero'],
]);

export default MESSAGE_MAP;

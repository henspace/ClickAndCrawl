# Almanacs

The alamancs comprise a number of single line entries.

# Line format

Each entry is a single line of the form:

> minLevel,rarity, ArtefactType, id:string [starting artefacts] * traits:string

Any line beginning with a # character is ignored. The elements are described below:

- minLevel: Numeric. Minimum dungeon level at which the entry can appear.
- rarity: string: Likelihood of appearance. Values are COMMON, UNCOMMON, RARE and VERY_RARE.
- id: identifier for the entry. This is used for the image name. If you want to share
an image, the id can be extended with a + character and a suffix. Only the characters
before the + character will be used for the image name.
- starting artefacts: comma separated list of artefacts to start with. WEAPONS, ARTEFACTS and MAGIC items are allowed.
- traits: comma separated list of traits as key:value pairs.

A trait key value can be preceded by an underscore to prevent it being displayed to 
players.

The key traits depend on the almanac and are described below.

# Heroes

Heroes should not normally have traits describing the key abilities as these are
created randomly. The following key traits should be included:

- PROF: set of proficiencies. This is a set of proficiencies separated by ampersands. See below for more detail.
- CLASS: the character's class.
- HIT_DICE: the starting hit dice for the character
- AC: character's base armour class
- SPEED: character's maximum movement per turn in feet. One tile equals 7.5 feet.
- SPELL_CAST: the ability used for spell casting. Defaults to _INT_ for intelligence.

## PROF trait
Heroes can be proficient in equipment use by adding a *PROF* trait.
This is a set of proficiencies separated by ampersands. E.g.

> PROF: HEAVY ARMOUR & WOODEN SHIELD & POLEAXE

This entry would result in three proficiencies:

1. HEAVY ARMOUR
2. WOODEN SHIELD
3. POLEAXE

These are then compared against the equipment's type attribute. For a hero to be regarded as proficient, all of the words in a proficiency must be present, in any order, in the equipment's TYPE trait. 

For the example PROF trait above, the following TYPE traits would be regarded as proficient:

- TYPE: WOODEN SHIELD
- TYPE: SHIELD WOODEN
- TYPE: ARMOUR HEAVY
- TYPE: POLEAXE DAGGER 

The following TYPE traits would not be proficient:

- TYPE: SHIELD
- TYPE: WOODEN
- TYPE: ARMOUR

# Traders

Traders are normally provided with the following traits.

- MAX_THEFT: maximum number of gold coins taken when attempting to rob.
- DMG: damage inflicted after failed robbery

# Monsters

Monsters should have the following traits.

- STR,CHA,WIS,INT,DEX: standard abilities
- ATTACK: the attack mode. 
- SOUND: sound made when dieing. Defaults to die.

## ATTACK trait

Monsters have an ATTACK trait which can be set to COMBAT or POISON.
The interaction will always be a Fight but a melee or poison interaction will then be selected. If a monster has equipped spells, or cantrips, they will always be selected over a melee combat.

## Use of magic

If a monster is equipped with a spell or cantrip, the first entry is used. Spells have precedence over cantrips.
Note that prepared spells are immediately unequipped once used.

# Spells

There are three key traits for spells:

- DMG: the damage dice
- DICE_PER_LEVEL: the number of damage dice per character level. This is a floating
point value so fractional values will work.  Some spells are defined in the DnD 5e guide as increasing per spell level rather than per character level. As there are 20 character levels and 9 spell levels the spell level rate should be divided by two to give an approximate value for the DICE_PER_LEVEL.
-SAVE_BY: this defines which ability is used for saving tests. E.g. 
SAVE_BY:DEX
-DMG_SAVED: this give the proportion of damage applied if a save is successful. E.g. DMG_SAVED:0.5

# Poisons

Poisons have three key attributes:
- DMG: the damage inflicted when first applied.
- DMG_PER_TURN: the damage inflicted on every turn until cured.

# Potions

Potions can also be consumed. They have one key attribute:

- HP: the opposite to damage. This is the number of hit points gained. It is not a dice roll.

# Traps

Traps can be triggered by actors when interacting. The basic attributes are
 - SEVERITY: determines the damage and can be SETBACK, DANGEROUS or DEADLY.
 The actual damage is calculated and adjusted to the character's level.
 - DETECT_BY: the attribute to detect the trap. Defaults to WIS. Normally, you should set this to INT for magic traps.
 - DISABLE_BY: the attribute to disable the trap. Defaults to INT.
 - GOLD: the number of gold coins provided by successfully disabling a trap. This is an integer.
Traps always perform a melee attack. Magic traps are regarded as magic only for
the purposes of detection. The spell always performs a melee attack.

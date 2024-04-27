# Almanac entry

## Format

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

## Heroes

### Proficiency
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


## Monsters

### Attack mode

Monsters have an ATTACK trait which can be set to COMBAT or POISON.
The interaction will always be a Fight but a melee or poison interaction will then be selected. If a monster has equipped spells, or cantrips, they will always be selected over a melee combat.

### Magic

If a monster is equipped with a spell or cantrip, the first entry is used. Spells have precedence over cantrips.
Note that prepared spells are immediately unequipped once used.

## Spells

There are three key traits for spells:

- DMG: the damage dice
- DICE_PER_LEVEL: the number of damage dice per character level. This is a floating
point value so fractional values will work.  Some spells are defined in the DnD 5e guide as increasing per spell level rather than per character level. As there are 20 character levels and 9 spell levels the spell level rate should be divided by two to give an approximate value for the DICE_PER_LEVEL.
-SAVE_ABILITY: this defines which ability is used for saving tests. E.g. 
SAVE_ABILITY:DEX
-DMG_SAVED: this give the proportion of damage applied if a save is successful. E.g. DMG_SAVED:0.5

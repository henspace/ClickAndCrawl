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

## Poisons

Poisons should have the TYPE trait set to POISON.
If an entry is a poison, it needs the DMG and SAVE_ABILITY traits set.

## Monsters

### Poison
If the monster has the TYPE trait set to POISON, the interaction is a Poisoning interaction, otherwise it is
a fight interaction. 

### Magic
If a monster is equipped with a spell or cantrip, the first entry is used. Spells have precedence over cantrips.
Note that prepared spells are immediately unequipped once used.

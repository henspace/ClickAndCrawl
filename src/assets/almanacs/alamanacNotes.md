# Almanacs

The almanacs comprise a number of single line entries. The possible almanacs are:
- ARMOUR
- ARTEFACTS
- HEROES
- KEYS
- MAGIC
- MONEY
- ENEMIES
- PORTALS
- PLANTS
- TRADERS
- TRAPS
- WEAPONS

For debugging, you can force a particular entry to be used by including it's id
is the query string in the URL. E.g. ...?MONSTERS=wraith

# Line format

Each entry is a single line of the form:

> minLevel,rarity, entry type, id:string [starting artefacts] * traits:string

Any line beginning with a # character is ignored. The elements are described below:

- minLevel: Numeric. Minimum dungeon level at which the entry can appear.
- rarity: string: Likelihood of appearance. Values are COMMON, UNCOMMON, RARE and VERY_RARE.
- entry type: type of entry. More details are given below.
- id: identifier for the entry. This is used for the image name. If you want to share
an image, the id can be extended with a + or ? character and a suffix. Only the characters
before the + or ? character will be used for the image name. A question mark is used to define something that required identification.  
- starting artefacts: square brackets containing a comma separated list of artefacts to start with. WEAPONS, ARTEFACTS, MAGIC and MONEY items are allowed.
- traits: comma separated list of traits as key:value pairs.

A the key value for a trait can be preceded by an underscore to prevent it being displayed to players when viewing details of the character or item.

The key traits depend on the almanac and are described in more detail below.

## id

The id is used as a unique identifier for the item. It is also used to form the 
image name and the description. Sometimes you might want different almanac entries
to use the same image but still have a unique almanac entry with
different traits. This can be done by extending the id with a '+', '?' or '/' character followed by 
additional text. How the information is split depends on the separating character.

- +: the plus character uses the text before the + for the image and description.
The text following is just used to create a unique id for the entry.
- ?: the question mark uses the text before the ? for the image. The full id is 
used for the description and the text before the ? is used as the description if the hero
cannot identify it.
- /: the forward slash uses the text before the / just for the image. Everything else
is taken after the /. The / is used to allow the same image to be used for multiple entries.

- my_item
- my_item+unique

When extended using a question mark, it is assumed that multiple items need to be identified 
by the hero. Two descriptions are extracted from the message map with the following
keys:

- DESCRIPTION MY_ITEM: used if the item cannot be identified by the hero.
- DESCRIPTION MY_ITEM?UNIQUE: used if the item has been identified by the hero.

## Image names

Normally images for actors are drawn face on and vertically. The following images
can be supplied, where NN is a two digit animation index of 00, 01 ...

- *imageName-idleNN.png* : the animation played when idle
- *imageName-deadNN.png* : the animation played when dead
- *imageName-walk-nNN.png* : the animation played when walking north
- *imageName-walk-eNN.png* : the animation played when walking east
- *imageName-walk-sNN.png* : the animation played when walking south
- *imageName-walk-wNN.png* : the animation played when walking west

You must supply *imageName-idle00.png* and, ideally, *imageName-dead00.png*.

Note the image name is formed from the id by removing the *+extension* part if 
provided and then converting to lower case.

If the id ends with *_pv*, the image is expected to be in plan view. In this case
the image will be rotated automatically and the walk animations should not be
provided.

Artefacts are not animated.

## Notes on artefact values
Costs for healing potions are based on the potion of healing which costs 50 GP 
for 2D4 + 2 healing. That's  50 GP for an average of 7 HP, or approximately
7 GP per HP.

For modifiers that apply to traits, note that a trait value gets divided
by 2 when converting to a modifier. From the tables, proficiency bonuses go up 1 for
every 4 levels. So changing a trait value by 2 is equivalent to the hero raising
their level by 4.

# Traits

The traits section of the almanac entry varies for different types  of entry. These are described below. Note that characters, except the hero, 
will normally have all the standard abilities of CHA, CON, DEX,INT, STR, and WIS.

For the difficulty challenge, DC, a numeric value can be provided or
one of the following predefined text values: VERY_EASY, EASY, MEDIUM, HARD, VERY_HARD, or NEARLY_IMPOSSIBLE.

For the damage trait, DMG, a numeric value can be provided or a dice roll of the form NDS + offset; e.g. 1D6+10 which would give a range
of values from 11 to 16.

If you provide a property as a dice roll, it is rolled at the
point the actor or artefact is created.

Artefacts are given a VALUE trait in CP, SP, GP or PP. 

## ENEMY: actor
The ENEMY type covers monsters and other actors that attack.

- CR: challenge rating
- STR,CHA,WIS,INT,DEX: standard abilities
- ATTACK: the attack mode. 
- SOUND: sound made when dieing. Defaults to die.

### ATTACK trait

Monsters have an ATTACK trait which can be set to COMBAT, COMBO, MAGIC, RANGED or POISON.


The interaction will always be a Fight but a melee or poison interaction will then be selected. If a monster has equipped spells, or cantrips, they will always be selected over a melee combat.

A combo attack is two attacks. The attacks made depend on the available damage traits.

- DMG: two melee attacks
- DMG & DMG_POISON: melee followed by poison.


If the attack mode is magic or ranged, the monster itself should
have the spell traits. I.e. it is actually cast as the spell. A RANGED attack is treated the same as MAGIC but without use of the spell cast ability. The monster is treated as the spell.

### Use of magic

If a monster is equipped with a spell or cantrip, the first entry is used. Spells have precedence over cantrips.
Note that prepared spells are immediately unequipped once used.

## ARTEFACT: actor

Unused

## CONSUMABLE: artefact

Consumables come in different types defined by the TYPE and SUBTYPE trait.

- TYPE: set to MEAL, DRINK, MEDICINE or POISON
- SUBTYPE: used for checking proficiencies. Also used for hidden artefacts. Typically set to PLANT.
- IDENTIFY_DC: if set, the item needs identification.The normal description is created from id as usual. The description for unknown as  it's message map key suffixed with _UNKNOWN.


Some consumables, primarily plants, may not be known to the hero.

### Type MEAL or DRINK

These can be used a part of a full meal (1 drink + 1 meal) as part of a rest.

### Type POISON

Poisons have additional attributes:
- DMG: the damage inflicted when first applied.
- DMG_POISON: this overrides the DMG trait and is only needed for combo attacks where DMG can be used for the melee and DMG_POISON for the poison.
- DMG_PER_TURN: the damage inflicted on every turn until cured. Curing occurs after a long rest.
- DMG_SAVED: proportion of damage applied if saving throw successful. Defaults to 0.

### MEDICINE

MEDICINEs can also be consumed. They have one key attribute:

- HP: the opposite to damage. This is the number of hit points gained. It is not a dice roll.


## HIDDEN_ARTEFACT: actor,

These are automatically created by the application and should not be added
as manual entries in the almanacs. They are used to hold artefacts that can 
be discovered by the hero. The following images are used for the holding actor.

- vegetation: for consumable items with the SUBTYPE set to VEGETATION
- hidden_artefact: for all other artefacts. Randomly selected.
- manhole_cover: for all other artefacts. Randomly selected.
- trapdoor: for all other artefacts. Randomly selected.

These are similar to PROPS, but once the hero has interacted with them, they no
longer remain as obstacles to the hero.

## PROP: actor

These are similar to HIDDEN_ARTEFACTs but with one key difference: they always
remain as obstacles.

The following images are used for the holding actor.
- engraved_pillar

## TRADER: actor

A character with whom the hero can interact.

Traders are normally provided with the following traits.

- MAX_THEFT: maximum number of gold coins taken when attempting to rob.
- DMG: damage inflicted after failed robbery
- DC: how hard it is to steal.


## PORTAL

A portal through which gold can be sent back to land.

## HERO: actor

Heroes should not normally have traits describing the key abilities as these are
created randomly. However, the following key traits should be included:

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

There are also some other special proficiencies:

- LOCK PICK: improves lock picking success.
- STEALING: improves theft success.

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


# Spells

There are a number of key traits for spells:

- ATTACK: the mechanics of the spell. This can be MAGIC, the default, MELEE, or BLESS. Bless spells are beneficial and are applied to oneself.
- DMG: the damage dice
- DICE_PER_LEVEL: the number of damage dice per character level. This is a floating
point value so fractional values will work.  Some spells are defined in the DnD 5e guide as increasing per spell level rather than per character level. As there are 20 character levels and 9 spell levels the spell level rate should be divided by two to give an approximate value for the DICE_PER_LEVEL.
- MAX_TARGETS: the maximum number of creatures who can be affected by the spell.
- MAX_TARGET_HP: the max number of remaining HP the target can have to apply a BLESS spell.
-SAVE_BY: this defines which ability is used for saving tests. E.g. 
SAVE_BY:DEX
-DMG_SAVED: this give the proportion of damage applied if a save is successful. E.g. DMG_SAVED:0.5
-EFFECT: this is converted to lower case and is used as the image for the effect.
-DC: how difficult it is to save.
-HP_GAIN: similar to DMG but used if the spell increase HP rather than causes damage.
-RANGE: how far the spell reaches. If 0, the spell is cast on the caster.
# Traps

Traps can be triggered by actors when interacting. The basic attributes are
 - SEVERITY: determines the damage and can be SETBACK, DANGEROUS or DEADLY.
 The actual damage is calculated and adjusted to the character's level.
 - DETECT_BY: the attribute to detect the trap. Defaults to WIS. Normally, you should set this to INT for magic traps.
 - DISABLE_BY: the attribute to disable the trap. Defaults to INT.
 - GOLD: the number of gold coins provided by successfully disabling a trap. This is an integer.
Traps always perform a melee attack. Magic traps are regarded as magic only for
the purposes of detection. The spell always performs a melee attack.

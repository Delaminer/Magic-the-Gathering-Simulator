const Database = {};

Database['Dark Ritual'] = ['Dark Ritual', '{B}', 'Instant', '', 'Add {B}{B}{B} to your mana pool.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=221510&type=card',
    abilities: [
    //Add 3 black mana to your mana pool
    (card) => {
        card.player.mana['black'] += 3;
        card.player.updateMana();
    }
]}];

Database['Ancestral Recall'] = ['Ancestral Recall', '{U}', 'Instant', '', 'Target player draws three cards.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=95&type=card',
    abilities: [
    //Target player draws three cards
    new SpellAbility({
        //Target: a player
        targets: ['Player'],
        //When activated, target player draws three cards
        activate: (card, targets) => {
            targets[0].draw(3);
        },
    }),
]}];
Database['Lightning Bolt'] = ['Lightning Bolt', '{R}', 'Instant', '', 'Lightning Bolt deals 3 damage to any target.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=442130&type=card',
    abilities: [
    //Deal three damage to any target
    new SpellAbility({
        //Target: anything
        targets: ['Any'],
        //When activated, deal 3 damage to the target
        activate: (card, targets) => {
            targets[0].dealDamage(3, {type: 'spell', card: card}, true);
        },
    }),
]}];
Database['Healing Salve'] = ['Healing Salve', '{W}', 'Instant', '', 
    'Choose one — \n - Target player gains 3 life.\n - Prevent the next 3 damage that would be dealt to any target this turn.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=394031&type=card',
    choice: {choiceCount: 1, command: 'Chose one.', options: 
        ['Target player gains 3 life.', 'Prevent the next 3 damage that would be dealt to any target this turn.']},
    abilities: [
    //Give 3 life to a player
    new SpellAbility({
        //Target: a player
        targets: ['Player'],
        //When activated, target player draws three cards
        activate: (card, targets) => {
            targets[0].gainLife(3, {type: 'spell', card: card}, true);
        },
    }),
    //Prevent the next 3 damage dealt to any target this turn
    new SpellAbility({
        //Target: anything
        targets: ['Any'],
        //When activated, give the target 3 prevention (until end of turn)
        activate: (card, targets) => {
            targets[0].damagePrevention += 3;
            
            //Remove effect at the end of the turn
            targets[0].endOfTurnEffects.push(() => {
                //Cannot be negative, so cap it at 0
                targets[0].damagePrevention = Math.max(targets[0].damagePrevention - 3, 0);
            })
        },
    }),
]}];
Database['Giant Growth'] = ['Giant Growth', '{G}', 'Instant', '', 'Target creature gets +3/+3 until end of turn.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=442161&type=card',
    abilities: [
    //Deal three damage to any target
    new SpellAbility({
        //Target: a player
        targets: ['Creature'],
        //When activated, target player draws three cards
        activate: (card, targets) => {
            //+3/+3 Effect
            targets[0].power += 3;
            targets[0].toughness += 3;
            targets[0].update();

            //Remove effect at the end of the turn
            targets[0].endOfTurnEffects.push(() => {
                targets[0].power -= 3;
                targets[0].toughness -= 3;
                targets[0].update();
            })
        },
    }),
]}];
Database['Mox Pearl'] = ['Mox Pearl', '{0}', 'Artifact', '', '{T}: Add {W}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383021&type=card',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one white mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['white']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Mox Sapphire'] = ['Mox Sapphire', '{0}', 'Artifact', '', '{T}: Add {U}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383023&type=card',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one blue mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['blue']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Mox Jet'] = ['Mox Jet', '{0}', 'Artifact', '', '{T}: Add {B}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383020&type=card',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one black mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['black']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Mox Ruby'] = ['Mox Ruby', '{0}', 'Artifact', '', '{T}: Add {R}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383022&type=card',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one red mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['red']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Mox Emerald'] = ['Mox Emerald', '{0}', 'Artifact', '', '{T}: Add {G}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383019&type=card',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one green mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['green']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Honor of the Pure'] = ['Honor of the Pure', '{1}{W}', 'Enchantment', '', 'White creatures you control get +1/+1.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=191058&type=card',
    abilities: [
    {
        //Boost white creatures that you control

        //This is static
        type: 'static',
        //Must be a creature, must be white, and you must be controlling it
        valid: (card, sourceCard) => 
            card.types.includes('Creature') && card.colors.includes('white') && sourceCard.player === card.player && card.location == Zone.Battlefield,
        //Effect: boost power by 1, boost toughness by 1
        effect: {
            powerChange: 1,
            toughnessChange: 1,
        },
    }
]}];
Database['Prodigal Sorcerer'] = ['Prodigal Sorcerer', '{2}{U}', 'Creature', 'Human Wizard', 
'{T}: Prodigal Sorcerer deals 1 damage to any target.', {power: 1, toughness: 1, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=413609&type=card',
    abilities: [
    new ActivatedAbility({
        //Tapping ability:
        //T: Deal 1 damage to any target
        text: 'Prodigal Sorcerer deals 1 damage to any target.',
        //The only cost is to tap this creature
        cost: { tap: true },
        //Requires 1 target (a creature)
        targets: ['Any'],
        //When activated, deal 1 damage to the target
        activate: (card, targets) => {
            targets[0].dealDamage(1, {type: 'activated-ability', card: card}, true);
        },
    }),
]}];
Database['Kari Zev, Skyship Raider'] = ['Kari Zev, Skyship Raider', '{1}{R}', 'Creature', 'Human Pirate', 
'First strike, menace\n' + 'Whenever Kari Zev, Skyship Raider attacks, create Ragavan, a legendary 2/1 red Monkey creature token. '+
'Ragavan enters the battlefield tapped and attacking. Exile that token at end of combat.', {
    supertypes: 'Legendary', power: 1, toughness: 3, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=423754&type=card', abilities: [],
}];

Database['Plains'] = ['Plains', '', 'Land', 'Plains', '{W}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488462', 
}];
Database['Island'] = ['Island', '', 'Land', 'Island', '{U}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488464', 
}];
Database['Swamp'] = ['Swamp', '', 'Land', 'Swamp', '{B}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488467', 
}];
Database['Mountain'] = ['Mountain', '', 'Land', 'Mountain', '{R}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488470', 
}];
Database['Forest'] = ['Forest', '', 'Land', 'Forest', '{G}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488474', 
}];
Database['Falkenrath Reaver'] = ['Falkenrath Reaver', '{1}{R}', 'Creature', 'Vampire', '', {
    power: 2, toughness: 2, imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=414425&type=card',
}];
Database['Stone Rain'] = ['Stone Rain', '{2}{R}', 'Sorcery', '', 'Destroy target land.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=517595&type=card',
    abilities: [
    //Destroy a land
    new SpellAbility({
        //Target: a land
        targets: ['Land'],
        //When activated, deal 3 damage to the target
        activate: (card, targets) => {
            targets[0].destroy({type: 'destroy', card: card}, true);
        },
    }),
]}];
Database['Abrade'] = ['Abrade', '{1}{R}', 'Instant', '', 
'Choose one — \n - Abrade deals 3 damage to target creature.\n - Destroy target artifact.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=430772&type=card',
    choice: {choiceCount: 1, command: 'Choose one.', options:
        ['Abrade deals 3 damage to target creature.', 'Destroy target artifact.']},
    abilities: [
    //Deal 3 damage to a creature
    new SpellAbility({
        targets: ['Creature'],
        activate: (card, targets) => {
            targets[0].dealDamage(3, {type: 'spell', card: card}, true);
        },
    }),
    //Destroy an artifact
    new SpellAbility({
        targets: ['Artifact'],
        activate: (card, targets) => {
            targets[0].destroy({type: 'destroy', card: card}, true);
        },
    }),
]}];
Database['Darksteel Axe'] = ['Darksteel Axe', '{1}', 'Artifact', 'Equipment', 
    'Indestructible\nEquipped creature gets +2/+0.\nEquip {2}', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=489920&type=card',
    abilities: [
        //It has indestructible
        new KeywordAbility(Keyword.Indestructible),
        //Equip for 2, it gives the creature +2/+0
        ...Equip({ mana: '2' }, { powerChange: 2 }),
]}];
Database['Bonesplitter'] = ['Bonesplitter', '{1}', 'Artifact', 'Equipment', 
    'Equipped creature gets +2/+0.\nEquip {1}', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=500938&type=card',
    abilities: [
        //Equip for 1, it gives the creature +2/+0
        ...Equip({ mana: '1' }, { powerChange: 2 }),
]}];
Database['Savannah Lions'] = ['Savannah Lions', '{W}', 'Creature', 'Cat', '', {power: 2, toughness: 1, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=442022&type=card',
}];
Database['Epic Proportions'] = ['Epic Proportions', '{4}{G}{G}', 'Enchantment', 'Aura', 
    'Flash\nEnchant creature\nEnchanted creature gets +5/+5 and has trample.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=451097&type=card',
    abilities: [
        //This has flash
        new KeywordAbility(Keyword.Flash),
        //Enchanted creature gets +5/+5 and trample
        ...EnchantmentAura('Creature', { powerChange: 5, toughnessChange: 5, [Keyword.Trample]: true, }),
]}];
Database['Nature\'s Blessing'] = ['Nature\'s Blessing', '{2}{G}', 'Enchantment', 'Aura', 
    'Enchant creature\nEnchanted creature gets +2/+2.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=240040&type=card',
    abilities: [
        ...EnchantmentAura('Creature', { powerChange: 2, toughnessChange: 2, }),
]}];

Database['Phantom Warrior'] = ['Phantom Warrior', '{1}{U}{U}', 'Creature', 'Illusion Warrior', 'Phantom Warrior can\'t be blocked.', {power: 2, toughness: 2, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=446097&type=card', abilities: [new KeywordAbility(Keyword.Unblockable),],
}];
Database['Bog Imp'] = ['Bog Imp', '{1}{B}', 'Creature', 'Imp', 'Flying', {power: 1, toughness: 1, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=83010&type=card', abilities: [new KeywordAbility(Keyword.Flying),],
}];
Database['Giant Spider'] = ['Giant Spider', '{3}{G}', 'Creature', 'Spider', 'Reach', {power: 2, toughness: 4, abilities: [new KeywordAbility(Keyword.Reach),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/8/0/80996b0d-cd44-445e-96de-677e0018255c.jpg?1562302899',
}];
Database['Severed Legion'] = ['Severed Legion', '{1}{B}{B}', 'Creature', 'Zombie', 'Fear', {power: 2, toughness: 2, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=129693&type=card', abilities: [new KeywordAbility(Keyword.Fear),],
}];
Database['Bladetusk Boar'] = ['Bladetusk Boar', '{3}{R}', 'Creature', 'Boar', 'Intimidate', {power: 3, toughness: 2, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=380379&type=card', abilities: [new KeywordAbility(Keyword.Intimidate),],
}];
Database['Dauthi Marauder'] = ['Dauthi Marauder', '{2}{B}', 'Creature', 'Dauthi Minion', 'Shadow', {power: 3, toughness: 1, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=397395&type=card', abilities: [new KeywordAbility(Keyword.Shadow),],
}];
Database['Furtive Homunculus'] = ['Furtive Homunculus', '{1}{U}', 'Creature', 'Homunculus', 'Skulk', {power: 2, toughness: 1, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=409807&type=card', abilities: [new KeywordAbility(Keyword.Skulk),],
}];
Database['Memnite'] = ['Memnite', '{0}', 'Artifact Creature', 'Construct', '', {power: 1, toughness: 1, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=194078&type=card', 
}];
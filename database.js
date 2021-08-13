const Database = {};

Database['Dark Ritual'] = new Card('Dark Ritual', '{B}', 'Instant', '', 'Add {B}{B}{B} to your mana pool.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=221510&type=card',
    abilities: [
    //Add 3 black mana to your mana pool
    (card) => {
        card.player.mana['black'] += 3;
        card.player.updateMana();
    }
]});

Database['Ancestral Recall'] = new Card('Ancestral Recall', '{U}', 'Instant', '', 'Target player draws three cards.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=95&type=card',
    abilities: [
    //Target player draws three cards
    {
        //Target: a player
        targets: ['Player'],
        //When activated, target player draws three cards
        activate: (card, targets) => {
            targets[0].draw(3);
        },
    },
]});
Database['Lightning Bolt'] = new Card('Lightning Bolt', '{R}', 'Instant', '', 'Lightning Bolt deals 3 damage to any target.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=442130&type=card',
    abilities: [
    //Deal three damage to any target
    {
        //Target: anything
        targets: ['Any'],
        //When activated, deal 3 damage to the target
        activate: (card, targets) => {
            targets[0].dealDamage(3, {type: 'spell', card: card}, true);
        },
    },
]});
Database['Healing Salve'] = new Card('Healing Salve', '{W}', 'Instant', '', 
    'Choose one — \n - Target player gains 3 life.\n - Prevent the next 3 damage that would be dealt to any target this turn.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=394031&type=card',
    choice: {choiceCount: 1, command: 'Chose one.', options: 
        ['Target player gains 3 life.', 'Prevent the next 3 damage that would be dealt to any target this turn.']},
    abilities: [
    //Give 3 life to a player
    {
        //Target: a player
        targets: ['Player'],
        //When activated, target player draws three cards
        activate: (card, targets) => {
            targets[0].gainLife(3, {type: 'spell', card: card}, true);
        },
    },
    //Prevent the next 3 damage dealt to any target this turn
    {
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
    },
]});
Database['Giant Growth'] = new Card('Giant Growth', '{G}', 'Instant', '', 'Target creature gets +3/+3 until end of turn.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=442161&type=card',
    abilities: [
    //Deal three damage to any target
    {
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
    },
]});
Database['Mox Pearl'] = new Card('Mox Pearl', '{0}', 'Artifact', '', '{T}: Add {W}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383021&type=card',
    abilities: [
    {
        //Mana ability: Add one mana to your mana pool
        type: 'mana',
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['white']++;
            card.player.updateMana();
        },
    },
]});
Database['Mox Sapphire'] = new Card('Mox Sapphire', '{0}', 'Artifact', '', '{T}: Add {U}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383023&type=card',
    abilities: [
    {
        //Mana ability: Add one mana to your mana pool
        type: 'mana',
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['blue']++;
            card.player.updateMana();
        },
    },
]});
Database['Mox Jet'] = new Card('Mox Jet', '{0}', 'Artifact', '', '{T}: Add {B}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383020&type=card',
    abilities: [
    {
        //Mana ability: Add one mana to your mana pool
        type: 'mana',
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['black']++;
            card.player.updateMana();
        },
    },
]});
Database['Mox Ruby'] = new Card('Mox Ruby', '{0}', 'Artifact', '', '{T}: Add {R}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383022&type=card',
    abilities: [
    {
        //Mana ability: Add one mana to your mana pool
        type: 'mana',
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['red']++;
            card.player.updateMana();
        },
    },
]});
Database['Mox Emerald'] = new Card('Mox Emerald', '{0}', 'Artifact', '', '{T}: Add {G}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=383019&type=card',
    abilities: [
    {
        //Mana ability: Add one mana to your mana pool
        type: 'mana',
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['green']++;
            card.player.updateMana();
        },
    },
]});
Database['Honor of the Pure'] = new Card('Honor of the Pure', '{1}{W}', 'Enchantment', '', 'White creatures you control get +1/+1.', {
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
]});
Database['Prodigal Sorcerer'] = new Card('Prodigal Sorcerer', '{2}{U}', 'Creature', 'Human Wizard', 
'{T}: Prodigal Sorcerer deals 1 damage to any target.', {power: 1, toughness: 1, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=413609&type=card',
    abilities: [
    {
        //Tapping ability:
        //T: Deal 1 damage to any target
        
        //This is an activated ability
        type: 'activated',
        //The only cost is to tap this creature
        cost: { tap: true },
        //Requires 1 target (a creature)
        targets: ['Any'],
        //When activated, tap another target creature
        activate: (card, targets) => {
            //TODO: Get user input for who to tap
            console.log('Zapped a target!');
            if (targets[0].playerIndex != undefined) {
                //Target is a player
                targets[0].life--;
                targets[0].lifeCounter.textContent = targets[0].life;
            }
            else {
                //Target is a creature
                targets[0].damage++;
                targets[0].update();
            }
        },
    },
]});
Database['Kari Zev, Skyship Raider'] = new Card('Kari Zev, Skyship Raider', '{1}{R}', 'Creature', 'Human Pirate', 
'First strike, menace\n' + 'Whenever Kari Zev, Skyship Raider attacks, create Ragavan, a legendary 2/1 red Monkey creature token. '+
'Ragavan enters the battlefield tapped and attacking. Exile that token at end of combat.', {
    supertypes: 'Legendary', power: 1, toughness: 3, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=423754&type=card', abilities: [],
});

Database['Plains'] = new Card('Plains', '', 'Land', 'Plains', '{W}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488462', 
});
Database['Island'] = new Card('Island', '', 'Land', 'Island', '{U}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488464', 
});
Database['Swamp'] = new Card('Swamp', '', 'Land', 'Swamp', '{B}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488467', 
});
Database['Mountain'] = new Card('Mountain', '', 'Land', 'Mountain', '{R}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488470', 
});
Database['Forest'] = new Card('Forest', '', 'Land', 'Forest', '{G}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488474', 
});
Database['Falkenrath Reaver'] = new Card('Falkenrath Reaver', '{1}{R}', 'Creature', 'Vampire', '', {
    power: 2, toughness: 2, imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=414425&type=card',
});
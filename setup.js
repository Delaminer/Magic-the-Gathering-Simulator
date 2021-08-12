
let makeDeck = (deck) => {
    let out = [];
    deck.forEach(playSet => {
        for(let j = 0; j < playSet[1]; j++) {
            let card = Object.create(playSet[0]);
            card.element = card.getUI();
            out.push(card);
        }
    });
    return out;
}

let soldier = new Card('Weary Soldier', '{W}', 'Creature', 'Human Soldier', 'Vigilance', {power: 3, toughness: 2});
let bat = new Card('High Flier', '{B}{B}', 'Creature', 'Bat Horror', 'Vigilance', {power: 6, toughness: 1});
let cat = new Card('Catty kitten', '{B}', 'Creature', 'Cat', '', {power: 1, toughness: 2});
let rat = new Card('Heel Rat', '{B}{B}', 'Creature', 'Rat', 'Flying\n{1}{B}, {T}: Tap target creature.', {power: 1, toughness: 1, abilities: [
    {
        //Tapping ability:
        //T: Tap target creature.
        
        //This is an activated ability
        type: 'activated',
        //The only cost is to tap this creature
        cost: { tap: true, mana: '{1}{B}' },
        //Requires 1 target (a creature)
        targets: ['Creature'],
        //When activated, tap another target creature
        activate: (card, targets) => {
            //TODO: Get user input for who to tap
            console.log('Tapped a creature!');
            targets[0].tapped = true;
            targets[0].element.classList.add('tapped');
        },
    },
]});
let person = new Card('Super Soldier', '{W}{U}{R}', 'Creature', 'Human Soldier', '', {power: 5, toughness: 4,
imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=391863&type=card'
});

let DarkRitual = new Card('Dark Ritual', '{B}', 'Instant', '', 'Add {B}{B}{B} to your mana pool.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=221510&type=card',
    abilities: [
    //Add 3 black mana to your mana pool
    (card) => {
        card.player.mana['black'] += 3;
        card.player.updateMana();
    }
]});
let manaboost = new Card('Mana Boost', '{0}', 'Sorcery', '', 'Add twenty {W}{U}{B}{R}{G}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=476467&type=card',
    abilities: [
    (card) => {
        for(let color of ['white', 'blue', 'black', 'red', 'green'])
            card.player.mana[color] += 20;
        card.player.updateMana();
    }
]});

let AncestralRecall = new Card('Ancestral Recall', '{U}', 'Instant', '', 'Target player draws three cards.', {
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
let LightningBolt = new Card('Lightning Bolt', '{R}', 'Instant', '', 'Lightning Bolt deals 3 damage to any target.', {
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
let HealingSalve = new Card('Healing Salve', '{W}', 'Instant', '', 
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
let GiantGrowth = new Card('Giant Growth', '{G}', 'Instant', '', 'Target creature gets +3/+3 until end of turn.', {
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
let ProdigalSorcerer = new Card('Prodigal Sorcerer', '{2}{U}', 'Creature', 'Human Wizard', 
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
let KariZev = new Card('Kari Zev, Skyship Raider', '{1}{R}', 'Creature', 'Human Pirate', 
'First strike, menace\n' + 'Whenever Kari Zev, Skyship Raider attacks, create Ragavan, a legendary 2/1 red Monkey creature token. '+
'Ragavan enters the battlefield tapped and attacking. Exile that token at end of combat.', {
    supertypes: 'Legendary', power: 1, toughness: 3, 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=423754&type=card', abilities: [],
});

let Plains = new Card('Plains', '', 'Land', 'Plains', '{W}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488462', 
});
let Island = new Card('Island', '', 'Land', 'Island', '{U}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488464', 
});
let Swamp = new Card('Swamp', '', 'Land', 'Swamp', '{B}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488467', 
});
let Mountain = new Card('Mountain', '', 'Land', 'Mountain', '{R}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488470', 
});
let Forest = new Card('Forest', '', 'Land', 'Forest', '{G}', {supertypes: 'Basic', 
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?type=card&multiverseid=488474', 
});

let alexDeck = makeDeck([
    [Swamp, 20],
    [Island, 20],
    [ProdigalSorcerer, 20],
    // [Mountain, 40],
    [cat, 20],
    [rat, 20],
    // [bat, 20],
    [DarkRitual, 20],
])
let bobDeck = makeDeck([
    [Plains, 40],
    // [Forest, 40],
    [soldier, 20],
])

let test = makeDeck([
    // [ProdigalSorcerer, 20],
    [manaboost, 50],
    [person, 50],
    // [KariZev, 5],
    // [Plains, 5],
    // [Island, 5],
    // [Swamp, 50],
    // [Mountain, 5],
    // [Forest, 5],
    // [DarkRitual, 20],
    // [AncestralRecall, 20],
    [LightningBolt, 40],
    // [GiantGrowth, 40],
    [HealingSalve, 50],
])

let t2 = makeDeck([[HealingSalve, 50]])

let game = new Game("Alex", test, 'Bob', t2);

game.drawUI(document.getElementById('game'));

game.start();

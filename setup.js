
let makeDeck = (deck) => {
    let out = [];
    deck.forEach(playSet => {
        for(let j = 0; j < playSet[1]; j++) {
            let card = Object.create(playSet[0]);
            card.getUI();
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
let person = new Card('Super Soldier', '{W}{U}{R}', 'Creature', 'Human Soldier', '', {power: 5, toughness: 4});

let ritual = new Card('Dark Ritual', '{B}', 'Instant', '', 'Add {B}{B}{B} to your mana pool.', [
    //Add 3 black mana to your mana pool
    (card) => {
        card.player.mana['black'] += 3;
        card.player.updateMana();
    }
]);
let manaboost = new Card('Mana Boost', '{0}', 'Sorcery', '', 'Add twenty {W}{U}{B}{R}{G}.', [
    (card) => {
        for(let color of ['white', 'blue', 'black', 'red', 'green'])
            card.player.mana[color] += 20;
        card.player.updateMana();
    }
]);

let AncestralRecall = new Card('Ancestral Recall', '{U}', 'Instant', '', 'Target player draws three cards.', [
    //Target player draws three cards
    {
        //Target: a player
        targets: ['Player'],
        //When activated, target player draws three cards
        activate: (card, targets) => {
            targets[0].draw(3);
        },
    },
]);
let ProdigalSorcerer = new Card('Prodigal Sorcerer', '{2}{U}', 'Creature', 'Human Wizard', '{T}: Prodigal Sorcerer deals 1 damage to any target.', {power: 1, toughness: 1, abilities: [
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

let Plains = new Card('Plains', '', 'Land', 'Plains', '{W}', {supertypes: 'Basic'});
let Island = new Card('Island', '', 'Land', 'Island', '{U}', {supertypes: 'Basic'});
let Swamp = new Card('Swamp', '', 'Land', 'Swamp', '{B}', {supertypes: 'Basic'});
let Mountain = new Card('Mountain', '', 'Land', 'Mountain', '{R}', {supertypes: 'Basic'});
let Forest = new Card('Forest', '', 'Land', 'Forest', '{G}', {supertypes: 'Basic'});

let alexDeck = makeDeck([
    [Swamp, 20],
    [Island, 20],
    [ProdigalSorcerer, 20],
    // [Mountain, 40],
    [cat, 20],
    [rat, 20],
    // [bat, 20],
    [ritual, 20],
])
let bobDeck = makeDeck([
    [Plains, 40],
    // [Forest, 40],
    [soldier, 20],
])

let test = makeDeck([
    [ProdigalSorcerer, 100],
    [manaboost, 50],
    [person, 50],
])

let game = new Game("Alex", test, 'Bob', bobDeck);

game.drawUI(document.getElementById('game'));

game.start();

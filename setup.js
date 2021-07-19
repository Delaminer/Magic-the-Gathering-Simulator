
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

let soldier = new Card('Weary Soldier', 'W', 'Creature', 'Human Soldier', 'Vigilance', {power: 3, toughness: 2});
let bat = new Card('High Flier', 'BB', 'Creature', 'Bat Horror', 'Vigilance', {power: 6, toughness: 1});
let cat = new Card('Catty kitten', 'B', 'Creature', 'Cat', '', {power: 1, toughness: 2});
let rat = new Card('Heel Rat', 'B', 'Creature', 'Rat', 'Flying\nTap to tap a creature.', {power: 1, toughness: 1, abilities: [
    {
        //Tapping ability:
        //T: Tap target creature.
        
        //This is an activated ability
        type: 'activated',
        //The only cost is to tap this creature
        cost: { tap: true },
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
let ritual = new Card('Dark Ritual', 'B', 'Instant', '', 'Add BBB to your mana pool.', [
    //Add 3 black mana to your mana pool
    (card) => {
        card.player.mana['black'] += 3;
        card.player.updateMana();
    }
]);

let Plains = new Card('Plains', '', 'Basic Land', 'Plains', '');
let Island = new Card('Island', '', 'Basic Land', 'Island', '');
let Swamp = new Card('Swamp', '', 'Basic Land', 'Swamp', '');
let Mountain = new Card('Mountain', '', 'Basic Land', 'Mountain', '');
let Forest = new Card('Forest', '', 'Basic Land', 'Forest', '');

let alexDeck = makeDeck([
    [Swamp, 20],
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

let game = new Game("Alex", alexDeck, 'Bob', bobDeck);

game.drawUI(document.getElementById('game'));

game.start();

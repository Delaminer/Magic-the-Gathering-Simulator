
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
let cat = new Card('Catty kitten', 'B', 'Creature', 'Cat', '', {power: 1, toughness: 2});

let Plains = new Card('Plains', '', 'Basic Land', 'Plains', '');
let Island = new Card('Island', '', 'Basic Land', 'Island', '');
let Swamp = new Card('Swamp', '', 'Basic Land', 'Swamp', '');
let Mountain = new Card('Mountain', '', 'Basic Land', 'Mountain', '');
let Forest = new Card('Forest', '', 'Basic Land', 'Forest', '');

let alexDeck = makeDeck([
    [Swamp, 40],
    // [Mountain, 40],
    [cat, 20]
])
let bobDeck = makeDeck([
    [Plains, 40],
    // [Forest, 40],
    [soldier, 20]
])

let game = new Game("Alex", alexDeck, 'Bob', bobDeck);

game.drawUI(document.getElementById('game'));

game.start();

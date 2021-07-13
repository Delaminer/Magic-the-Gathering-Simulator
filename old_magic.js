class Game {
    constructor(name1, deck1, name2, deck2) {
        this.player1 = new Player(name1, deck1);
        this.player2 = new Player(name2, deck2);
        this.currentPlayer = 1;
    }
    drawUI(element) {
        let sideBar = document.createElement('div');
        sideBar.classList.add('sidebar');
        sideBar.textContent = this.player1.name + ' vs ' + this.player2.name;

        let main = document.createElement('div');
        main.classList.add('main');

        main.appendChild(this.player1.getUI());
        main.appendChild(this.player2.getUI());

        element.appendChild(sideBar);
        element.appendChild(main);
    }
}

class Player {
    constructor(name, deck) {
        this.name = name;
        this.life = 20;
        this.counters = [];
        this.mana = [];
        this.deck = deck;

        this.library = [];
        for(let i = 0; i < this.deck.length; i++) this.library.push(this.deck[i]);
        this.shuffle();
        
        this.graveyard = [];

        this.hand = [];
        this.draw(7);
        
        this.lands = [];
        this.permanents = [];
    }
    shuffle() {
        for(let i = 0; i < this.library.length; i++) {
            let swapWith = Math.floor(Math.random() * this.library.length);

            let temp = this.library[i];
            this.library[i] = this.library[swapWith];
            this.library[swapWith] = temp;
        }
    }
    draw(numCards) {
        for(let i = 0; i < numCards; i++) {
            let cardToDraw = this.library.pop(); //remove from end (end = top of library)
            this.hand.push(cardToDraw);
        }
    }
    getUI() {

        let playerElement = document.createElement('div');
        playerElement.classList.add('player');

        //Hand
        let handElement = document.createElement('div');
        handElement.classList.add('hand');
        let clickHandCard = (card, index) => {
            console.log('clicked '+card.name+', '+index);
        }
        this.hand.forEach((v, i) => handElement.appendChild(v.getUI(() => clickHandCard(v, i))));

        //Lands
        let landsElement = document.createElement('div');
        landsElement.classList.add('lands');
        this.lands.forEach(v => landsElement.appendChild(v.getUI()));
        
        //Permanents
        let permanentsElement = document.createElement('div');
        permanentsElement.classList.add('permanents');
        this.permanents.forEach(v => permanentsElement.appendChild(v.getUI()));



        playerElement.appendChild(handElement);
        playerElement.appendChild(landsElement);
        playerElement.appendChild(permanentsElement);
        return playerElement;
    }
}
let makeDeck = (deck) => {
    let out = [];
    deck.forEach(v => {
        for(let j = 0; j < v[1]; j++) {
            out.push(v[0]);
        }
    });
    return out;
}

class Card {
    constructor(name, cost, type, subtype, text, extra) {
        this.name = name;
        this.cost = cost;
        this.types = type.split(' ');
        this.subtypes = subtype.split(' ');
        this.text = text.split('\n');
        this.extra = extra;
    }
    getUI(onclick) {
        let cardElement = document.createElement('div');
        cardElement.onclick = onclick;
        cardElement.classList.add('card');
        
        let title = document.createElement('div');
        title.classList.add('title');
        let name = document.createElement('span');
        name.textContent = this.name;
        let cost = document.createElement('span');
        cost.textContent = this.cost;
        title.appendChild(name);
        title.appendChild(cost);
        cardElement.appendChild(title);

        let image = document.createElement('div');
        image.classList.add('image');
        let img = document.createElement('img');
        img.src = './sample_image.png';
        img.width = 140;
        img.draggable = false
        image.appendChild(img)
        cardElement.appendChild(image);

        let type = document.createElement('div');
        type.classList.add('type');
        type.textContent = this.types.join(' ') + ' - ' + this.subtypes.join(' ');
        cardElement.appendChild(type);

        let text = document.createElement('div');
        text.classList.add('text');
        text.textContent = this.text.join(' <br> ');
        cardElement.appendChild(text);

        //Creature
        if (this.types.includes('Creature')) {
            let extra = document.createElement('div');
            extra.classList.add('extra');
            extra.classList.add('creature');
            extra.textContent = this.extra.power + ' / ' + this.extra.toughness;
            cardElement.appendChild(extra);
        }

        return cardElement;
    }
}

let soldier = new Card('Weary Soldier', '2WW', 'Creature', 'Human Soldier', 'Vigilance', {power: 3, toughness: 2});
let cat = new Card('Catty kitten', 'B', 'Creature', 'Cat', '', {power: 1, toughness: 1});

let Plains = new Card('Plains', '', 'Basic Land', 'Plains', '');
let Island = new Card('Island', '', 'Basic Land', 'Island', '');
let Swamp = new Card('Swamp', '', 'Basic Land', 'Swamp', '');
let Mountain = new Card('Mountain', '', 'Basic Land', 'Mountain', '');
let Forest = new Card('Forest', '', 'Basic Land', 'Forest', '');

let alexDeck = makeDeck([
    [Swamp, 20],
    [cat, 20]
])
let bobDeck = makeDeck([
    [Plains, 20],
    [soldier, 20]
])

let game = new Game("Alex", alexDeck, 'Bob', bobDeck);

game.drawUI(document.getElementById('game'));
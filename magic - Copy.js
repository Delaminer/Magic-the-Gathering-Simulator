class Game {
    constructor(name1, deck1, name2, deck2) {
        this.player1 = new Player(name1, deck1, this, 0);
        this.player2 = new Player(name2, deck2, this, 1);
        this.currentPlayer = 0;
        this.priorityPlayer = 0;
        this.phase = 0;
        this.turn = 0;
        this.players = [this.player1, this.player2];
    }
    //Start turns and so forth.
    start() {
        //Assume who goes first has already been decided
        this.currentPlayer = 0;
        this.priorityPlayer = 0;
        this.phase = 3; //start at main
        this.turn = 1;
        this.players[this.currentPlayer].updateTurn();
    }
    progressTurn() {
        this.phase++;
        if (this.phase >= 7) {
            //Pass the turn
            this.phase = 0;
            this.turn++;
            this.currentPlayer = 1 - this.currentPlayer; //Swap players
            this.priorityPlayer = this.currentPlayer; //Set priority
        }
        this.players.forEach(player => player.updateTurn());
    }
    drawUI(element) {

        this.players.forEach((player, i) => {
            element.appendChild(player.element);
            if (i == 0) {
                let bar = document.createElement('div');
                bar.classList.add('bar');
                element.appendChild(bar);
            }
        });

        // main.appendChild(this.player1.getUI(false));
        // main.appendChild(this.player2.getUI(true));

        this.element = element; //for future reference
    }
    phaseName(index) {
        switch(index) {
            case 0:
                return 'Untap';
                break;
            case 1:
                return 'Upkeep';
                break;
            case 2:
                return 'Draw';
                break;
            case 3:
                return 'Precombat Main';
                break;
            case 4:
                return 'Combat';
                break;
            case 5:
                return 'Postcombat Main';
                break;
            case 6:
                return 'End';
                break;
            default:
                return 'Unkown';
        }
    }
}

class Player {
    constructor(name, deck, game, playerIndex) {
        this.game = game; //Save for reference
        this.playerIndex = playerIndex;
        this.name = name;
        this.life = 20;
        this.counters = [];
        this.inPayment = false;
        this.mana = {
            'colorless': 0,
            'white': 0,
            'blue': 0,
            'black': 0,
            'red': 0,
            'green': 0
        };
        this.playedLand = false;
        this.deck = deck;

        this.handElement = document.createElement('div');
        this.handElement.classList.add('hand');
        this.landsElement = document.createElement('div');
        this.landsElement.classList.add('lands');
        this.permanentsElement = document.createElement('div');
        this.permanentsElement.classList.add('permanents');
        this.libraryElement = document.createElement('div');
        this.libraryElement.classList.add('library');

        let battlefield = document.createElement('div');
        battlefield.classList.add('battlefield');
        battlefield.appendChild(this.landsElement);
        battlefield.appendChild(this.permanentsElement);
        battlefield.appendChild(this.libraryElement);

        
        let sidebar = document.createElement('div');
        sidebar.classList.add('sidebar');
        let ne = document.createElement('p');
        ne.textContent = this.name;
        sidebar.appendChild(ne);
        let le = document.createElement('p');
        le.textContent = this.life;
        sidebar.appendChild(le);

        //Add player controls
        this.moveControl = document.createElement('button');
        this.moveControl.disabled = true;
        this.moveControl.textContent = 'Pass';
        this.moveControl.classList.add('control');
        this.moveControl.onclick = () => { this.progressTurn() }

        this.moveStatus = document.createElement('p');
        this.moveStatus.classList.add('status');
        this.moveStatus.textContent = 'Please wait.';

        this.manaStatus = document.createElement('div');
        this.manaStatus.classList.add('mana');
        let colors = ['colorless', 'white', 'blue', 'black', 'red', 'green'];
        colors.forEach(color => {
            let colorElement = document.createElement('button');
            colorElement.onclick = () => {}; //Does nothing
            colorElement.classList.add('color');
            let image = document.createElement('img');
            image.src = './' + color + '.jpg';
            let amount = document.createElement('span');
            amount.textContent = '';
            colorElement.appendChild(amount);
            colorElement.appendChild(image);

            this.manaStatus[color] = colorElement;
            this.manaStatus[color].image = image;
            this.manaStatus[color].amount = amount;
            this.manaStatus.appendChild(colorElement);
        });
        this.updateMana();

        sidebar.appendChild(this.moveStatus);
        sidebar.appendChild(this.moveControl);
        sidebar.appendChild(this.manaStatus);

        let mainElement = document.createElement('div');
        mainElement.classList.add('main');
        mainElement.appendChild(sidebar);
        mainElement.appendChild(battlefield);

        this.element = document.createElement('div');
        this.element.classList.add('player');
        this.element.appendChild(mainElement);
        this.element.appendChild(this.handElement);

        this.library = [];
        for(let i = 0; i < this.deck.length; i++) { //Process all cards in the deck
            this.deck[i].location = 'library';
            this.libraryElement.appendChild(this.deck[i].element);
            this.library.push(this.deck[i]);

            this.deck[i].player = this; //Assign it's owner to this player
        }
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
            cardToDraw.location = 'hand';
            this.handElement.appendChild(cardToDraw.element);
            this.hand.push(cardToDraw);
        }
    }
    //Control flow of the turn, moving through phases and ultimately passing the turn
    progressTurn() {
        if (this.game.currentPlayer == this.playerIndex) {
            //Move on
            //Clear mana
            for(let color in this.mana) {
                this.mana[color] = 0;
            }
            this.updateMana();
            this.game.progressTurn();
        }
    }
    updateTurn() {
        //Show that a change occurred
        let phase = this.game.phase;
        let turn = this.game.turn;
        if (this.game.currentPlayer == this.playerIndex) {
            //My turn
            this.moveStatus.textContent = `Your ${this.game.phaseName(phase)} Phase.`
            if (phase == 6) {
                //End the turn
                this.moveControl.textContent = 'End turn';
            }
            else { //Proceed
                this.moveControl.textContent = `Proceed to ${this.game.phaseName(phase + 1)} Phase`;
            }
            this.moveControl.disabled = false;

            //Handle actual events
            if (phase == 0) {
                //Untap
                let untap = card => {
                    card.tapped = false;
                    card.element.classList.remove('tapped');
                };
                this.lands.forEach(untap);
                this.permanents.forEach(untap);
                this.playedLand = false;

                //That's all for this phase! Let's move on!
                this.progressTurn();
            }
            else if (phase == 2) {
                //Draw
                this.draw(1);

                //That's all for this phase! Let's move on!
                this.progressTurn();
            }
        }
        else {
            this.moveStatus.textContent = 'Please wait.';
            this.moveControl.textContent = 'Pass';
            this.moveControl.disabled = true;
        }
    }
    canPlaySorcery() {
        return this.canPlayInstant() && this.game.currentPlayer == this.playerIndex && (this.game.phase == 3 || this.game.phase == 5);
    }
    canPlayInstant() {
        return !this.inPayment && this.game.priorityPlayer == this.playerIndex;
    }
    payForCard(card, callback) {
        //Ask player to pay for the spell
        this.inPayment = true; //No shenanigans bud!
        let costLeft = Object.create(card.cost);
        let alreadyPaid = {}; //In case user wants to cancel, we can reimburse them
        this.moveStatus.textContent = "Please pay " + card.cost.text;
        let colors = ['colorless', 'white', 'blue', 'black', 'red', 'green'];
        colors.forEach(color => {
            alreadyPaid[color] = 0;
            //Add functionality
            this.manaStatus[color].onclick = () => {
                console.log('hey im paying '+color);
                if (costLeft[color] > 0) {
                    //Pay this color
                    costLeft[color]--;
                    alreadyPaid[color]++;
                    this.mana[color]--;
                }
                else if (costLeft['any'] > 0) {
                    //Pay colorless (if left)
                    costLeft['any']--;
                    alreadyPaid[color]++;
                    this.mana[color]--;
                }
                else {
                    console.log('Hey this mana is useless');
                }
                this.updateMana();

                //Check if it is complete
                let finished = true;
                for(let color in costLeft) {
                    if (typeof costLeft[color] == 'number' && costLeft[color]> 0) {
                        finished = false;
                        break;
                    }
                }
                if (finished) { //Play the card!
                    //Disable all of these pay mana click events
                    colors.forEach(color2 => {
                        this.manaStatus[color2].onclick = () => {};
                    });
                    //Restore the controls to focusing on the turn
                    this.updateTurn();
                    this.moveControl.onclick = () => { this.progressTurn() }
                    //Allow spells to be played as normal
                    this.inPayment = false;
                    //Let the card know it can be played
                    callback(true);
                }
            }
        });

        //Change what the control button does (it cancels paying for this)
        this.moveControl.textContent = 'Cancel';
        this.moveControl.onclick = () => { //Cancel playing the card
            //Disable mana payment
            colors.forEach(color => {
                this.manaStatus[color].onclick = () => {};
            });
            //Restore mana already paid
            for(let color in alreadyPaid) {
                this.mana[color] += alreadyPaid[color];
            }
            //Update mana UI
            this.updateMana();
            //Restore the controls to focusing on the turn
            this.updateTurn();
            this.moveControl.onclick = () => { this.progressTurn() }
            //Allow spells to be played as normal
            this.inPayment = false;
            //Let the card know it was cancelled
            callback(false);
        };
    }
    updateMana() {
        //Update each mana color
        for(let color in this.mana) {
            this.manaStatus[color].style.display = this.mana[color] > 0 ? 'block' : 'none';
            this.manaStatus[color].amount.textContent = this.mana[color];
        }
    }
    getUI(main) {
        console.log('deprecated.')
        let playerElement = document.createElement('div');
        playerElement.classList.add('player');

        //Hand
        let handElement = document.createElement('div');
        handElement.classList.add('hand');
        this.hand.forEach(card => {
            let cardElement = card.getUI();
            cardElement.onclick = () => {
                console.log('played ' + card.name);
                let type = card.playType();
                if (type == 'Land') {
                    landsElement.appendChild(cardElement);
                }
                else if (type == 'Creature') {
                    permanentsElement.appendChild(cardElement);
                }
                //handElement.removeChild(cardElement);
            }
            handElement.appendChild(cardElement);
        });

        //Lands
        let landsElement = document.createElement('div');
        landsElement.classList.add('lands');
        this.lands.forEach(v => landsElement.appendChild(v.getUI()));
        
        //Permanents
        let permanentsElement = document.createElement('div');
        permanentsElement.classList.add('permanents');
        this.permanents.forEach(v => permanentsElement.appendChild(v.getUI()));


        if (main) {
            playerElement.appendChild(permanentsElement);
            playerElement.appendChild(landsElement);
            playerElement.appendChild(handElement);
        }
        else {
            playerElement.appendChild(handElement);
            playerElement.appendChild(landsElement);
            playerElement.appendChild(permanentsElement);
        }
        return playerElement;
    }
}
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

class Card {
    constructor(name, cost, type, subtype, text, extra) {
        this.name = name;
        this.cost = this.calculateCost(cost);
        this.types = type.split(' ');
        this.subtypes = subtype.split(' ');
        this.text = text.split('\n');
        this.abilities = [];
        this.extra = extra;
        this.location = 'unkown';
        this.tapped = false;
        this.getUI();
        if (this.types.includes('Land')) {
            let mana = (color) => ({ type: 'mana', cost: 'T', result: color });
            //Add mana abilities for basic land types
            if (this.subtypes.includes('Plains')) {
                this.abilities.push(mana('white'));
            }
            if (this.subtypes.includes('Island')) {
                this.abilities.push(mana('blue'));
            }
            if (this.subtypes.includes('Swamp')) {
                this.abilities.push(mana('black'));
            }
            if (this.subtypes.includes('Mountain')) {
                this.abilities.push(mana('red'));
            }
            if (this.subtypes.includes('Forest')) {
                this.abilities.push(mana('green'));
            }
        }
    }
    calculateCost(cost) {
        //Convert a text cost (2WW) to a more usable representation
        let costs = {
            'any': 0,
            'colorless': 0,
            'white': 0,
            'blue': 0,
            'black': 0,
            'red': 0,
            'green': 0,
            text: cost //for ease of use
        }
        for(let i = 0; i < cost.length; i++) {
            switch(cost[i]) {
                case 'W':
                    costs['white']++;
                    break;
                case 'U':
                    costs['blue']++;
                    break;
                case 'B':
                    costs['black']++;
                    break;
                case 'R':
                    costs['red']++;
                    break;
                case 'G':
                    costs['green']++;
                    break;
                case 'C':
                    costs['colorless']++;
                    break;
                default: //Any color (numbers 1,2,3 etc)
                    //Must find ALL numbers in a row (for double digit costs like Emrakul's 15)
                    let end = i + 1;
                    let isLetter = (char) => char.toUpperCase() != char.toLowerCase();
                    while (end < cost.length && !isLetter(cost[end])) end++;
                    costs['any'] += parseInt(cost.substring(i, end));
                    i = end - 1;
            }
        }
        return costs;
    }
    playType() {
        if (this.types.includes('Land')) {
            return 'Land';
        }
        else if (this.types.includes('Creature')) {
            return 'Creature';
        }
        return 'unkown!';
    }
    getUI() {
        
        this.element = document.createElement('div');
        this.element.classList.add('card');
        
        let title = document.createElement('div');
        title.classList.add('title');
        title.textContent = this.name + ' - ' + this.cost.text;
        this.element.appendChild(title);

        let image = document.createElement('div');
        image.classList.add('image');
        let img = document.createElement('img');
        img.src = './sample_image.png';
        img.width = 100;
        img.draggable = false;
        image.appendChild(img)
        // this.element.appendChild(image);

        let type = document.createElement('div');
        type.classList.add('type');
        type.textContent = this.types.join(' ') + ' - ' + this.subtypes.join(' ');
        this.element.appendChild(type);

        let text = document.createElement('div');
        text.classList.add('text');
        text.textContent = this.text.join(' <br> ');
        this.element.appendChild(text);

        if (this.types.includes('Creature')) {
            let extra = document.createElement('div');
            extra.classList.add('extra');
            extra.textContent = this.extra.power + ' / ' + this.extra.toughness;
            this.element.appendChild(extra);
        }
        
        this.element.onclick = () => {
            switch(this.location) {
                case 'library':
                    console.log('uhhhh, im in the library how\'d you click me?')
                    break;
                case 'hand':
                    console.log('playing '+this.name);
                    //Play the card
                    switch(this.playType()) {
                        case 'Land':
                            //Put it onto the battlefield, if you haven't played on yet
                            if (!this.player.playedLand && this.player.canPlaySorcery()) {
                                this.player.playedLand = true;
                                this.location = 'lands';
                                this.player.landsElement.appendChild(this.element);
                                this.player.hand.splice(this.player.hand.indexOf(this), 1); //remove from hand
                                this.player.lands.push(this); //add to lands
                            }
                            break;
                        case 'Creature':
                            //Put it onto the battlefield (if you can afford it)
                            if (this.player.canPlaySorcery()) {
                                //Ask for player to pay for this
                                this.player.payForCard(this, (success) => {
                                    if (success) {
                                        //Play it!
                                        this.location = 'permanents';
                                        this.player.permanentsElement.appendChild(this.element);
                                        this.player.hand.splice(this.player.hand.indexOf(this), 1); //remove from hand
                                        this.player.permanents.push(this); //add to permanents
                                    }
                                });
                            }
                            break;
                        case 'unkown!':
                            //unkown
                            console.log(this.name+': unkown card type in hand: '+this.playType());
                    }
                    break;
                case 'lands':
                    //Tap the land for mana
                    if (this.abilities.length > 0) {
                        //Activate the ability
                        let ability = this.abilities[0];
                        if (ability.cost.includes('T')) {
                            //Tap it!
                            if (!this.tapped) {
                                this.tapped = true;
                                this.element.classList.add('tapped');

                                //Activate the ability!
                                this.player.mana[ability.result]++;
                                console.log('tapped for mana!');
                                this.player.updateMana();
                            }
                        }
                    }
                    break;
                case 'permanents':
                    console.log('guess ill activate an ability? idk');
                    break;
                default:
                    console.log(this.name + ': unkown card location '+this.location);
            }
        }

        
    }
}

let soldier = new Card('Weary Soldier', '2WW', 'Creature', 'Human Soldier', 'Vigilance', {power: 3, toughness: 2});
let cat = new Card('SuperCat', 'B', 'Creature', 'Cat', '', {power: 1, toughness: 1});

let Plains = new Card('Plains', '', 'Basic Land', 'Plains', '');
let Island = new Card('Island', '', 'Basic Land', 'Island', '');
let Swamp = new Card('Swamp', '', 'Basic Land', 'Swamp', '');
let Mountain = new Card('Mountain', '', 'Basic Land', 'Mountain', '');
let Forest = new Card('Forest', '', 'Basic Land', 'Forest', '');

let alexDeck = makeDeck([
    [Swamp, 40],
    [cat, 20]
])
let bobDeck = makeDeck([
    [Plains, 40],
    [soldier, 20]
])

let game = new Game("Alex", alexDeck, 'Bob', bobDeck);

game.drawUI(document.getElementById('game'));

game.start();
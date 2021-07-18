const ActionType = {
    Play: 'play',
    Play: 'pay',
    Wait: 'wait',
    Attack: 'attack',
    Block: 'block',
    BlockTarget: 'block-target',
    AttackTarget: 'attack-target',
    Unkown: 'unkown'
};
class Player {
    constructor(name, deck, game, playerIndex) {
        this.game = game; //Save for reference
        this.playerIndex = playerIndex;
        this.name = name;
        this.life = 20;
        this.counters = [];
        this.action = ActionType.Unkown;
        this.selection = {
            type: 'none',
            cards: [],
            temp: undefined
        }; // For declaring attackers and blockers, and whatever stuff comes next
        this.selectedCards = []
        this.temp = undefined; // For saving which creature is blocking, waiting for the target attacker to be selected
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
        this.graveyardElement = document.createElement('div');
        this.graveyardElement.classList.add('graveyard');
        this.exileElement = document.createElement('div');
        this.exileElement.classList.add('exile');

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
        this.lifeCounter = le;
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
            image.src = './Images/' + color + '.jpg';
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
    //Update control UI when priority is changed
    updatePriority(newPriorityPlayer, stack) {
        //All status include's the turn state at the top, so determine it here
        //Begin with whose turn it is (say either 'Yours' or 'Opponents')
        let turnStatus = (this.game.currentPlayer == this.playerIndex) ? 'Your ' : (this.game.players[this.game.currentPlayer].name + '\'s ')
        //Then the phase of the turn
        turnStatus += this.game.phaseName(this.game.phase) + ' Phase.';

        //Note: priority is swapped for the declare blockers step
        let declaringBlockers = (this.game.phase == TurnStep.DeclareBlockers) && (this.action == ActionType.Block || this.action == ActionType.BlockTarget);
        
        //Add text telling the player to declare attackers or blockers
        if (this.action == ActionType.Attack) {
            turnStatus += '\nDeclare attackers.';
        }
        else if (this.action == ActionType.Block) {
            turnStatus += '\nDeclare blockers.';
        }

        if ((newPriorityPlayer == this.playerIndex) ^ declaringBlockers) {
            //My priority!
            if (stack.length > 0) {
                //Decide whether or not to let the top spell on the stack resolves
                let stackItem = stack[stack.length - 1];
                let source = stackItem.owner == this.playerIndex ? 'You' : this.game.players[stackItem.owner].name;
                this.moveStatus.innerText = `${turnStatus}\n${source} played ${stackItem.card.name}.`;
                this.moveControl.textContent = 'Resolve';
            }
            else {
                //Decide whether or not to pass priority on the turn (pass turn)
                this.moveStatus.innerText = turnStatus;
                this.moveControl.textContent = 'Pass';
            }
            //Enable button to pass priority
            this.moveControl.disabled = false;
            this.moveControl.onclick = () => {
                this.progressTurn();
            };
            this.moveControl.style.display = 'inline-block';

        }
        else {
            //Not my priority
            if (stack.length > 0) {
                let stackItem = stack[stack.length - 1];
                let source = stackItem.owner == this.playerIndex ? 'You' : this.game.players[stackItem.owner].name;
                this.moveStatus.innerText = `${turnStatus}\n${source} played ${stackItem.card.name}.`;
            }
            else {
                this.moveStatus.innerText = `${turnStatus}\nWaiting for ${this.game.players[newPriorityPlayer].name}.`;
            }
            //Disable button
            this.moveControl.disabled = true;
            this.moveControl.onclick = () => {}; // Disable clicking no matter what.
            this.moveControl.textContent = 'Wait';
            this.moveControl.style.display = 'none';
        }
    }

    //Control flow of the turn, moving through phases and ultimately passing the turn
    progressTurn() {
        if (this.game.getPriorityPlayer() == this.playerIndex) {
            if (this.action == ActionType.Play) {
                //Pass priority, whether be resolving a spell or passing the turn
                console.log('Normal pass')
                this.game.passPriority(this.playerIndex);
            }
            else if (this.action == ActionType.Attack){
                //Attack selections have been made. If there are no selected attackers, end combat.
                

                // Selections have been made, and now it is time to play
                // Update each player's action type to Play so spells can be played properly
                console.log('attack pass')

                let priorityPlayer = this.game.getPriorityPlayer();
                let stack = this.game.stack;
                this.game.players.forEach(player => {
                    player.action = ActionType.Play;
                    player.updatePriority(priorityPlayer, stack); //Just in case
                });
            }
        }
        else if (this.action == ActionType.Block) {
            //You can only pass if there is no unassigned blocker, so check for that
            if (this.temp == undefined) {
                //All good, all blockers have been properly defined
                console.log('block pass')
                let priorityPlayer = this.game.getPriorityPlayer();
                let stack = this.game.stack;
                this.game.players.forEach(player => {
                    player.action = ActionType.Play;
                    player.updatePriority(priorityPlayer, stack); //Just in case
                });
            }
            else {
                //Hey! You forgot to assign the blocker!
                this.moveControl.textContent = 'Please assign a target for all blockers!';
            }
        }
    }

    updateTurn(clearMana) {
        //Clear mana
        if (clearMana) {
            for(let color in this.mana) {
                this.mana[color] = 0;
            }
            this.updateMana();
        }

        // Update selection type
        if (this.game.phase == TurnStep.Combat) {
            // Your selections are as attackers or blockers
            this.selection.type = this.game.currentPlayer == this.playerIndex ? 'attackers' : 'blockers';
        }
        else if (this.game.phase == TurnStep.PostcombatMain) {
            // You have no selection
            this.selection.type = 'none';
        }

        if (this.game.currentPlayer == this.playerIndex) {
            //My turn, what can I do?
            switch(this.game.phase) {
                case TurnStep.DeclareAttackers: //Declare attack
                    this.action  = ActionType.Attack;
                    break;
                case TurnStep.DeclareBlockers: //Declare block
                    this.action  = ActionType.BlockTarget;
                    break;
                default:
                    this.action = ActionType.Play;
            }
        }
        else {
            //Their turn, what can I do?
            switch(this.game.phase) {
                case TurnStep.DeclareAttackers: //Declare attack
                    this.action = ActionType.AttackTarget;
                    break;
                case TurnStep.DeclareBlockers: //Declare block
                    this.action = ActionType.Block;
                    break;
                default:
                    this.action = ActionType.Play; //Was Wait, changing to 'Play' may or may not work
            }
        }
    }

    cleanup() {
        //Cleanup all effects
        this.permanents.forEach(permanent => permanent.cleanup(true));
    }

    updatePermanents() {
        //Update UI for all permanents
        this.permanents.forEach(permanent => permanent.update());
    }

    canPlaySorcery() {
        return this.canPlayInstant() && this.game.currentPlayer == this.playerIndex && (this.game.phase == TurnStep.PrecombatMain || this.game.phase == TurnStep.PostcombatMain) && this.game.stack.length == 0;
    }

    canPlayInstant() {
        return this.action == ActionType.Play && this.game.getPriorityPlayer() == this.playerIndex;
    }

    payForCard(card, callback) {
        //Ask player to pay for the spell
        this.action = ActionType.Pay; //No shenanigans bud!
        let costLeft = Object.create(card.cost);
        let alreadyPaid = {}; //In case user wants to cancel, we can reimburse them
        this.moveStatus.textContent = "Please pay " + card.cost.text;
        let colors = ['colorless', 'white', 'blue', 'black', 'red', 'green'];
        colors.forEach(color => {
            alreadyPaid[color] = 0;
            //Add functionality
            this.manaStatus[color].onclick = () => {
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
                    console.log('Hey ' + color + ' mana is useless');
                }
                //Show new amounts of mana left
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
                    this.updateTurn(false);
                    this.moveControl.onclick = () => { this.progressTurn() }
                    //Allow spells to be played as normal
                    this.action = ActionType.Play;
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
            this.updateTurn(false);
            this.moveControl.onclick = () => { this.progressTurn() }
            //Allow spells to be played as normal
            this.action = ActionType.Play;
            //Let the card know it was cancelled
            callback(false);
        };
    }

    updateMana() {
        //Update each mana color
        for(let color in this.mana) {
            // Only display if there is some mana
            this.manaStatus[color].style.display = this.mana[color] > 0 ? 'block' : 'none';
            // Show the number of mana available
            this.manaStatus[color].amount.textContent = this.mana[color];
        }
    }

    selectAttacker(card) {
        let index = this.selection.cards.indexOf(card);
        if (index == -1) {
            //Add the card
            this.selection.cards.push(card);
            card.element.classList.add('attacker');
            console.log(`${card.name} is now attacking`);
        }
        else {
            //Remove the card
            this.selection.cards.splice(index, 1);
            card.element.classList.remove('attacker');
            console.log(`${card.name} is no longer attacking`);
        }
    }

    selectBlocker(card) {
        let index = this.selection.cards.map(data => data.blocker).indexOf(card)
        if (index != -1) {
            //Stop blocking
            let blockData = this.selection.cards.splice(index, 1)[0];
            removeLine(blockData.line);
            card.element.classList.remove('blocker');
            console.log(`${card.name} is no longer blocking`);
        }
        else if (this.temp != undefined) {
            // The player has to select an attacker to block.
            // If this was the blocker needed assignment, cancel the job.
            // If it was some other creature, change focus to this one.

            if (this.temp == card) {
                // This is the unassigned blocker, so cancel the job.
                card.element.classList.remove('blocker');
                this.temp = undefined;
                console.log(`${card.name} block cancelled`);
            }
            else {
                // This was not, so switch to this one.

                // First remove the old one
                this.temp.classList.remove('blocker');

                // Then assign this one
                this.temp = card;
                card.element.classList.add('blocker');
                console.log(`${card.name} is now blocking instead`);
            }
        }
        else {
            // Put this blocker wannabe into the temp slot, so you can choose who to target it with
            this.temp = card;
            card.element.classList.add('blocker');
            console.log(`${card.name} is now blocking`);
        }
    }

    selectBlockTarget(card) {
        // There has to be an unassigned blocker for this card to be targeted
        if (this.temp != undefined) {
            //Assign my temp blocker to block this card
            //Draw line as well connecting the two

            // Create the line element
            let line = document.createElement('div');
            // Give it some CSS
            line.classList.add('line');
            // Put into into the document so it can be rendered
            document.body.appendChild(line);
            // Connect the line from the attacker (card.element) to the blocker (this.temp.element)
            adjustLine(card.element, this.temp.element, line);

            // Add this block data
            this.selection.cards.push({
                blocker: this.temp, 
                target: card, 
                line: line
            });

            console.log(`${this.temp.name} is blocking ${card.name}`);

            // the blocker has been assigned, so remove it from the temp slot
            this.temp = undefined;
        }
    }

    isAttacking(card) {
        return this.selection.cards.includes(card);
    }

    isBlocking(card) {
        return this.selection.cards.map(blockData => blockData.blocker).includes(card);
    }
    
    // Get the blockers for the specified attacker
    getBlockers(card) {
        let blockers = [];
        this.selection.cards.forEach(blockData => {
            if (blockData.target === card) {
                blockers.push(blockData.blocker);
            }
        });
        return blockers;
    }
}
const ActionType = {
    Play: 'play',
    Pay: 'pay',
    Wait: 'wait',
    Attack: 'attack',
    Block: 'block',
    BlockTarget: 'block-target',
    AttackTarget: 'attack-target',
    Target: 'target',
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
        //For cleanup
        this.endOfTurnEffects = [];
        this.damagePrevention = 0;

        this.handElement = document.createElement('div');
        this.handElement.classList.add('hand');
        this.landsElement = document.createElement('div');
        this.landsElement.classList.add('lands');
        this.permanentsElement = document.createElement('div');
        this.permanentsElement.classList.add('permanents');
        //Extra zones UI
        for(let zone of ['graveyard', 'exile', 'library']) {
            this[zone + 'Element'] = document.createElement('div');
            this[zone + 'Element'].classList.add(zone);
            this[zone + 'Element'].classList.add('viewableZone');
            this[zone + 'Element'].dialogue = document.createElement('div');
            this[zone + 'Element'].dialogue.classList.add('dialogue');
            this[zone + 'Element'].appendChild(this[zone + 'Element'].dialogue);
            this[zone + 'Element'].titleElement = document.createElement('div');
            this[zone + 'Element'].titleElement.classList.add('title');
            this[zone + 'Element'].titleElement.textContent = this.name + '\'s ' + zone.substring(0, 1).toUpperCase() + zone.substring(1);
            this[zone + 'Element'].dialogue.appendChild(this[zone + 'Element'].titleElement);
            this[zone + 'Element'].cards = document.createElement('div');
            this[zone + 'Element'].cards.classList.add('cards');
            this[zone + 'Element'].dialogue.appendChild(this[zone + 'Element'].cards);
            this[zone + 'Element'].controls = document.createElement('div');
            this[zone + 'Element'].controls.classList.add('controls');
            this[zone + 'Element'].dialogue.appendChild(this[zone + 'Element'].controls);
            this[zone + 'Element'].closeButton = document.createElement('button');
            this[zone + 'Element'].closeButton.classList.add('close');
            this[zone + 'Element'].closeButton.textContent = 'Close';
            this[zone + 'Element'].closeButton.onclick = () => {
                this[zone + 'Element'].style.display = 'none';
            };
            this[zone + 'Element'].controls.appendChild(this[zone + 'Element'].closeButton);
        }

        let battlefield = document.createElement('div');
        battlefield.classList.add('battlefield');
        battlefield.appendChild(this.landsElement);
        battlefield.appendChild(this.permanentsElement);
        battlefield.appendChild(this.libraryElement);
        battlefield.appendChild(this.graveyardElement);
        battlefield.appendChild(this.exileElement);

        
        //Name and life elements show the player's name and life total
        let nameElement = document.createElement('p');
        nameElement.textContent = this.name;
        let lifeElement = document.createElement('p');
        lifeElement.textContent = this.life;
        this.lifeCounter = lifeElement;

        //Player element holds the player stuff (you can click on it to target the player)
        let playerElement = document.createElement('div');
        playerElement.classList.add('player');
        playerElement.appendChild(nameElement);
        playerElement.appendChild(lifeElement);
        //When clicked, the player element becomes a target of a spell or ability
        playerElement.onclick = () => {
            this.selectTarget(this, true);
        };

        //Little buttons that can open the graveyard, exile, and library
        this.visibilityControls = document.createElement('div');
        this.visibilityControls.classList.add('visibility-controls');
        for(let zone of ['graveyard', 'exile', 'library']) {
            this.visibilityControls[zone] = document.createElement('button');
            this.visibilityControls[zone].classList.add(zone + 'Display');
            this.visibilityControls[zone].textContent = 0;
            this.visibilityControls[zone].onclick = () => {
                this[zone + 'Element'].style.display = 'block';
            }
            this.visibilityControls.appendChild(this.visibilityControls[zone]);
        }
        //Disable library viewer
        this.visibilityControls.library.onclick = () => {};
        


        //Side bar holds all player control
        let sidebar = document.createElement('div');
        sidebar.classList.add('sidebar');
        sidebar.appendChild(playerElement);
        sidebar.appendChild(this.visibilityControls);

        //Add player controls
        this.moveControl = document.createElement('button');
        this.moveControl.disabled = true;
        this.moveControl.textContent = 'Pass';
        this.moveControl.classList.add('control');
        this.moveControl.onclick = () => { this.progressTurn() }
        //Add custom player controls (for questions)
        this.moveControlArray = document.createElement('div');
        this.moveControlArray.style.display = 'none';
        this.moveControlArray.innerHTML = '';
        this.moveControlArray.classList.add('control-array');

        this.moveStatus = document.createElement('p');
        this.moveStatus.classList.add('move-status');
        this.moveStatus.textContent = 'Please wait.';

        this.turnStatus = document.createElement('p');
        this.turnStatus.classList.add('turn-status');
        this.turnStatus.textContent = 'Turn status.';

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

        sidebar.appendChild(this.turnStatus);
        sidebar.appendChild(this.moveStatus);
        sidebar.appendChild(this.moveControl);
        sidebar.appendChild(this.moveControlArray);
        sidebar.appendChild(this.manaStatus);

        let mainElement = document.createElement('div');
        mainElement.classList.add('main');
        mainElement.appendChild(sidebar);
        mainElement.appendChild(battlefield);

        this.element = document.createElement('div');
        this.element.classList.add('player');
        this.element.classList.add('player' + playerIndex); //For player specific CSS
        this.element.appendChild(mainElement);
        this.element.appendChild(this.handElement);        

        //Change hand UI to keep the cards on one line
        //Use .bind(this) to ensure the function still runs as a part of this object
        window.addEventListener('load', this.updateHandUI.bind(this));
        window.addEventListener('resize', this.updateHandUI.bind(this));
        
        //Element for getting choices
        let choiceElement = document.createElement('div');
        choiceElement.classList.add('choices');
        choiceElement.style.display = 'none';
        let dialogue = document.createElement('div');
        dialogue.classList.add('dialogue');
        // dialogue.textContent = 'Sample text';
        choiceElement.appendChild(dialogue);
        
        document.body.appendChild(choiceElement);
        this.choiceElement = choiceElement;
        this.choiceDialogue = dialogue;
        //Set up dialogue
        this.choiceDialogue.cardDisplay = document.createElement('div'); //Blank element, it only holds the card
        this.choiceDialogue.cardDisplay.classList.add('card-display');
        this.choiceDialogue.appendChild(this.choiceDialogue.cardDisplay);

        this.choiceDialogue.top = document.createElement('div');
        this.choiceDialogue.top.classList.add('title');
        this.choiceDialogue.top.textContent = 'Welcome';
        this.choiceDialogue.appendChild(this.choiceDialogue.top);

        this.choiceDialogue.options = document.createElement('div');
        this.choiceDialogue.options.classList.add('options');
        this.choiceDialogue.appendChild(this.choiceDialogue.options);

        this.choiceDialogue.controls = document.createElement('div'); //For UI management
        this.choiceDialogue.controls.classList.add('controls');
        this.choiceDialogue.appendChild(this.choiceDialogue.controls);

        this.choiceDialogue.submit = document.createElement('button');
        this.choiceDialogue.submit.classList.add('submit');
        this.choiceDialogue.submit.textContent = 'Submit';
        this.choiceDialogue.controls.appendChild(this.choiceDialogue.submit);

        this.choiceDialogue.cancel = document.createElement('button');
        this.choiceDialogue.cancel.classList.add('cancel');
        this.choiceDialogue.cancel.textContent = 'Cancel';
        this.choiceDialogue.controls.appendChild(this.choiceDialogue.cancel);

        
        //Element for ordering triggers
        let orderElement = document.createElement('div');
        orderElement.classList.add('order');
        orderElement.style.display = 'none';
        //Base for everything else
        orderElement.dialogue = document.createElement('div');
        orderElement.dialogue.classList.add('dialogue');
        orderElement.appendChild(orderElement.dialogue);
        //Title
        orderElement.titleElement = document.createElement('div');
        orderElement.titleElement.classList.add('title');
        orderElement.titleElement.textContent = 'Order triggers.';
        orderElement.dialogue.appendChild(orderElement.titleElement);
        //Directions Info
        orderElement.info = document.createElement('div');
        orderElement.info.classList.add('info');
        orderElement.info.last = document.createElement('span');
        orderElement.info.last.classList.add('last');
        orderElement.info.last.textContent = 'Bottom of Stack: Resolves Last';
        orderElement.info.appendChild(orderElement.info.last);
        orderElement.info.first = document.createElement('span');
        orderElement.info.first.classList.add('first');
        orderElement.info.first.textContent = 'Top of Stack: Resolves First';
        orderElement.info.appendChild(orderElement.info.first);
        orderElement.dialogue.appendChild(orderElement.info);
        //Actual order selection
        orderElement.selection = document.createElement('div');
        orderElement.selection.classList.add('selection');
        orderElement.dialogue.appendChild(orderElement.selection);
        //Controls: Submit button (no cancel)
        orderElement.controls = document.createElement('div');
        orderElement.controls.classList.add('controls');
        orderElement.controls.submit = document.createElement('button');
        orderElement.controls.submit.classList.add('submit');
        orderElement.controls.submit.textContent = 'Submit';
        orderElement.controls.appendChild(orderElement.controls.submit);
        orderElement.dialogue.appendChild(orderElement.controls);
        document.body.appendChild(orderElement);
        this.orderElement = orderElement;

        
        this.library = [];
        for(let i = 0; i < this.deck.length; i++) { //Process all cards in the deck
            this.libraryElement.appendChild(this.deck[i].element);
            this.library.push(this.deck[i]);
            this.deck[i].setLocation(Zone.Library, false);

            this.deck[i].player = this; //Assign it's owner to this player
        }
        this.shuffle();
        
        this.lands = [];
        this.permanents = [];
        this.graveyard = [];
        this.exile = [];
        this.hand = [];

        this.draw(7);

        for(let zone of ['graveyard', 'exile', 'library'])
            this.visibilityControls[zone].textContent = this[zone].length;
    }

    /**
     * Shuffle the player's library.
     */
    shuffle() {
        for(let i = 0; i < this.library.length; i++) {
            let swapWith = Math.floor(Math.random() * this.library.length);

            let temp = this.library[i];
            this.library[i] = this.library[swapWith];
            this.library[swapWith] = temp;
        }
    }

    /**
     * Draw a number of cards
     * @param {number} numCards Number of cards to draw 
     */
    draw(numCards) {
        for(let i = 0; i < numCards; i++) {
            if (this.library.length < 1) {
                console.log(`${this.name} tried to draw a card from an empty library. ${this.name} lost the game!`);    
            }

            let cardToDraw = this.library.pop(); //remove from end (end = top of library)
            this.handElement.appendChild(cardToDraw.element);
            this.hand.push(cardToDraw);
            cardToDraw.setLocation(Zone.Hand, true);
        }
        this.updateHandUI();
    }

    /**
     * Update the hand UI by changing margins, making sure all of the cards fit perfectly on the hand bar.
     */
    updateHandUI() {
        //Update drawing of cards to handle overlaying
        for(let i = 0; i < this.hand.length; i++) {
            this.hand[i].element.style.zIndex = i + 20;
        }
        if (this.hand.length > 1) {
            let totalWidth = this.handElement.offsetWidth;
            let cardWidth = this.hand[0].element.offsetWidth;
            let takenSpace = cardWidth * this.hand.length;
            let neededSpace = takenSpace - totalWidth;
            let margin = neededSpace > 0 ? -neededSpace / (this.hand.length - 1) : 0;
            let prop = '--hand-margin' + this.playerIndex
            document.documentElement.style.setProperty(prop, margin + 'px');
        }
    }

    /**
     * Update move control UI when priority is changed.
     * The parameters are optional.
     * @param {number} newPriorityPlayer The index of the player with priority.
     * @param {Array} stack The current stack of the game.
     */
    updatePriority(newPriorityPlayer, stack) {
        //Cannot override targeting or paying with move control
        if (this.action == ActionType.Target || this.action == ActionType.Pay) return;

        //Get the values yourself if they are undefined
        if (newPriorityPlayer == undefined) newPriorityPlayer = this.game.getPriorityPlayer();
        if (stack == undefined) stack = this.game.stack;

        //All status includes the turn state at the top, so determine it here
        //Begin with whose turn it is (say either 'Yours' or 'Opponents')
        let turnStatus = (this.game.currentPlayer == this.playerIndex) ? 'Your ' : (this.game.players[this.game.currentPlayer].name + '\'s ')
        //Then the phase of the turn
        turnStatus += this.game.phaseName(this.game.phase) + ' Phase.';

        //Add text telling the player to declare attackers or blockers
        if (this.action == ActionType.Attack) {
            turnStatus += '\nDeclare attackers.';
        }
        else if (this.action == ActionType.Block) {
            turnStatus += '\nDeclare blockers.';
        }
        //Show the turn status on its element
        this.turnStatus.textContent = turnStatus;

        //Note: priority is swapped for the declare blockers step
        let declaringBlockers = (this.game.phase == TurnStep.DeclareBlockers) && 
                                (this.action == ActionType.Block || this.action == ActionType.BlockTarget);

        if ((newPriorityPlayer == this.playerIndex) ^ declaringBlockers) {
            //My priority!
            if (stack.length > 0) {
                //Decide whether or not to let the top spell on the stack resolves
                let stackItem = stack[stack.length - 1];
                //Change UI depending on if the item is an ability or a spell
                if (stackItem.isAbility) {
                    let source = stackItem.owner == this.playerIndex ? 'Your' : (this.game.players[stackItem.owner].name + '\'s');
                    this.moveStatus.innerText = `${source} ${stackItem.source.name} ability has been activated.`;
                    this.moveControl.textContent = 'Resolve';
                }
                else {
                    let source = stackItem.owner == this.playerIndex ? 'You' : this.game.players[stackItem.owner].name;
                    this.moveStatus.innerText = `${source} played ${stackItem.card.name}.`;
                    this.moveControl.textContent = 'Resolve';
                }
            }
            else {
                //Decide whether or not to pass priority on the turn (pass turn)
                this.moveStatus.innerText = '';
                this.moveControl.textContent = 'Pass';
            }
            //Enable button to pass priority
            this.moveControl.disabled = false;
            this.moveControl.onclick = () => {
                this.progressTurn();
            };
            this.moveControl.style.display = 'inline-block';
            this.moveControlArray.style.display = 'none';

            //Autopass: if we cannot take any actions, then pass priority
            //Note: I have chosen to make it so you cannot pass the first main phase (just in case)
            if (!this.canDoAnything() && !(this.game.phase == TurnStep.PrecombatMain && this.canPlaySorcery())) {
                //Pass priority! This is done by returning true, so the game knows once everything has been updated, this player can AutoPass
                console.log(this.name + ' chose to autopass');
                return true;
            }
            else {
                console.log(this.name + ' chose not to autopass.');
            }

        }
        else {
            //Not my priority
            if (stack.length > 0) {
                let stackItem = stack[stack.length - 1];
                //Change UI depending on if the item is an ability or a spell
                if (stackItem.isAbility) {
                    let source = stackItem.owner == this.playerIndex ? 'Your' : (this.game.players[stackItem.owner].name + '\'s');
                    this.moveStatus.innerText = `${source} ${stackItem.source.name} ability has been activated.`;
                }
                else {
                    let source = stackItem.owner == this.playerIndex ? 'You' : this.game.players[stackItem.owner].name;
                    this.moveStatus.innerText = `${source} played ${stackItem.card.name}.`;
                }
            }
            else {
                this.moveStatus.innerText = `Waiting for ${this.game.players[newPriorityPlayer].name}.`;
            }
            //Disable button
            this.moveControl.disabled = true;
            this.moveControl.onclick = () => {}; // Disable clicking no matter what.
            this.moveControl.textContent = 'Wait';
            this.moveControl.style.display = 'none';
            this.moveControlArray.style.display = 'none';
        }

        return false;
    }

    /**
     * Control flow of the turn, mobing through phases and ultimately passing the turn.
     */
    progressTurn() {
        if (this.game.getPriorityPlayer() == this.playerIndex) {
            if (this.action == ActionType.Play) {
                //Pass priority, whether be resolving a spell or passing the turn
                console.log(this.name + ' passed priority.');
                this.game.passPriority(this.playerIndex);
            }
            else if (this.action == ActionType.Attack){
                //Attack selections have been made. If there are no selected attackers, end combat.
                console.log(this.name + ' declared attackers.');

                //Check for attackers
                if (this.selection.cards.length > 0) {
                    //There are attackers, proceed

                    // Update each player's action type to Play so spells can be played properly
                    this.game.updatePlayers(this.game.getPriorityPlayer(),
                        //Set action to Play
                        player => player.action = ActionType.Play
                    );
                }
                else {
                    //No attackers! Skip to next main phase!
                    this.game.phase = TurnStep.PostcombatMain - 1; //So progressTurn will change it to PostCombat Main
                    this.game.progressTurn();
                }
            }
        }
        else if (this.action == ActionType.Block) {
            //You can only pass if there is no unassigned blocker, so check for that
            if (this.temp == undefined) {
                //All good, all blockers have been properly defined
                console.log(this.name + ' declared blockers.');

                // Update each player's action type to Play so spells can be played properly
                this.game.updatePlayers(this.game.getPriorityPlayer(),
                    //Set action to Play
                    player => player.action = ActionType.Play
                );
            }
            else {
                //Hey! You forgot to assign the blocker!
                this.moveControl.textContent = 'Please assign a target for all blockers!';
            }
        }
    }

    /**
     * Update the action and selection type for this phase of the turn.
     * @param {boolean} clearMana True if you want the mana to be cleared as well.
     */
    updateTurn(clearMana) {
        //Clear mana
        if (clearMana) {
            for(let color in this.mana) {
                this.mana[color] = 0;
            }
            this.updateMana();

            //Clear temp stuff here as well, because it is also cleared at the end of the phase
            this.temp = undefined;
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

    /**
     * Cleanup end of turn effects and damage for this player and its permanents.
     */
    cleanup() {
        //TODO: Clear Until EOT effects
        this.endOfTurnEffects.forEach(effect => effect(this));
        this.endOfTurnEffects = [];

        //Cleanup all effects
        this.permanents.forEach(permanent => permanent.cleanup(true, false));
    }

    /**
     * Update UI/check status of all permanents this player controls.
     */
    updatePermanents() {
        //Update UI for all permanents
        this.permanents.concat(this.lands).forEach(permanent => permanent.update());
    }

    /**
     * Get if the player can play a sorcery.
     * @returns {boolean} True if this player can play a sorcery at this time.
     */
    canPlaySorcery() {
        return this.canPlayInstant() && this.game.currentPlayer == this.playerIndex && 
            (this.game.phase == TurnStep.PrecombatMain || this.game.phase == TurnStep.PostcombatMain) && this.game.stack.length == 0;
    }

    /**
     * Get if the player can play an instant.
     * @returns {boolean} True if this player can play an instant at this time.
     */
    canPlayInstant() {
        return this.action == ActionType.Play && this.game.getPriorityPlayer() == this.playerIndex;
    }

    /**
     * Pay for a card.
     * @param {Card} card The card specified. 
     * @param {Function} callback Method to run after, it gives True if paid for, False if cancelled.
     */
    payForCard(card, callback) {
        //Ask player to pay for the spell
        this.action = ActionType.Pay; //No shenanigans bud!
        let costLeft = Object.create(card.cost);
        let alreadyPaid = {}; //In case user wants to cancel, we can reimburse them
        this.moveStatus.innerHTML = 'Please pay ' + insertSymbols(card.cost.text);
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

                    //Restore the controls and focus of the turn
                    this.updatePriority();
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

            //Allow spells to be played as normal
            this.action = ActionType.Play;
            //Restore the controls and focus of the turn
            this.updatePriority();
            //Let the card know it was cancelled
            callback(false);
        };

        
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

            //Restore the controls and focus of the turn
            this.updatePriority();
            //Allow spells to be played as normal
            this.action = ActionType.Play;
            //Let the card know it can be played
            callback(true);
        }
    }

    /**
     * Pay for a spell or ability. This allows the user to choose how to pay.
     * @param {Card} card The card either being played or the source of the ability.
     * @param {ManaCost} cost The cost that has to be paid. Generate using @link {card.calculateCost()}.
     * @param {function} paymentReceivedCallback The function to be called once user has either paid or cancelled. Returns true if the user paid.
     */
    pay(card, cost, paymentReceivedCallback) {
        //Pay a cost for a spell or ability

        this.action = ActionType.Pay; //Action type is currently pay
        let costLeft = Object.create(cost);
        let alreadyPaid = {}; //In case user wants to cancel, we can reimburse them
        this.moveStatus.innerHTML = 'Please pay ' + insertSymbols(cost.text);
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
                    //Loop through each color in the cost that's left and if it is not zero, we know we are not finished.
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
                    //Restore the controls and focus of the turn
                    this.updatePriority();
                    //Allow spells to be played as normal
                    this.action = ActionType.Play;

                    //Let the card know it can be played
                    paymentReceivedCallback(true);
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
            //Restore the controls and focus of the turn
            this.updatePriority();
            //Allow spells to be played as normal
            this.action = ActionType.Play;
            //Let the card know it was cancelled
            paymentReceivedCallback(false);
        };
    }

    /**
     * Update the UI showing how much mana this player has
     */
    updateMana() {
        //Update each mana color
        for(let color in this.mana) {
            // Only display if there is some mana
            this.manaStatus[color].style.display = this.mana[color] > 0 ? 'block' : 'none';
            // Show the number of mana available
            this.manaStatus[color].amount.textContent = this.mana[color];
        }
    }

    /**
     * Select a card for attacking
     * @param {Card} card The new attacker
     */
    selectAttacker(card) {
        let index = this.selection.cards.indexOf(card);
        if (index == -1) {
            //The card must be untapped to attack
            if (!card.tapped) {
                //Add the card
                this.selection.cards.push(card);
                card.element.classList.add('attacker');
                console.log(`${card.name} is now attacking.`);
    
                //If it doesn't have vigilance, tap it
                if (!card.hasAbility(Keyword.Vigilance)) {
                    card.tapped = true;
                    card.element.classList.add('tapped');
                }
            }
        }
        else {
            //Remove the card
            this.selection.cards.splice(index, 1);
            card.element.classList.remove('attacker');
            console.log(`${card.name} is no longer attacking.`);
            
            //Untapping the creature might be risky: 
            //If it got tapped by another source, this a free untap, 
            //but also how could that have happened? I dont know.
            card.tapped = false;
            card.element.classList.remove('tapped');
        }
    }

    /**
     * Select a card for blocking
     * @param {Card} card The new blocker
     */
    selectBlocker(card) {
        let index = this.selection.cards.map(data => data.blocker).indexOf(card)
        if (index != -1) {
            //Stop blocking
            let blockData = this.selection.cards.splice(index, 1)[0];
            removeLine(blockData.line);
            card.element.classList.remove('blocker');
            console.log(`${card.name} is no longer blocking.`);
        }
        else if (this.temp != undefined) {
            // The player has to select an attacker to block.
            // If this was the blocker needed assignment, cancel the job.
            // If it was some other creature, change focus to this one.

            if (this.temp == card) {
                // This is the unassigned blocker, so cancel the job.
                card.element.classList.remove('blocker');
                this.temp = undefined;
                console.log(`${card.name}'s block was cancelled.`);
            }
            else {
                // This was not, so switch to this one.

                // First remove the old one
                this.temp.element.classList.remove('blocker');

                console.log(`${card.name} is now blocking instead of ${this.temp.name}.`);

                // Then assign this one
                this.temp = card;
                card.element.classList.add('blocker');
            }
        }
        else {
            // Put this blocker wannabe into the temp slot, so you can choose who to target it with
            this.temp = card;
            card.element.classList.add('blocker');
            console.log(`${card.name} is now blocking.`);
        }
    }

    /**
     * Select a card as the target for a block.
     * @param {Card} card The attacker
     */
    selectBlockTarget(card) {
        // There has to be an unassigned blocker for this card to be targeted
        //The blocker also has to be legally allowed to block the target
        if (this.temp != undefined && card.validBlocker(this.temp)) {
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

            console.log(`${this.temp.name} is now blocking ${card.name}.`);

            // the blocker has been assigned, so remove it from the temp slot
            this.temp = undefined;
        }
    }

    /**
     * Selects a card or player as a target for the current spell the user is playing
     * @param {*} target The target, either a player or card
     * @param {boolean} isPlayer True if the target is a player, false if it is a card.
     */
    selectTarget(target, isPlayer) {
        //Must be in target mode
        if (this.action != ActionType.Target) return;
        //Must be the player that is doing the action
        if (this.game.getPriorityPlayer() != this.playerIndex) {
            this.game.players[this.game.getPriorityPlayer()].selectTarget(target, isPlayer)
        }
        else {
            //This is the correct player.
            //First, make sure this target is valid
            //this.temp currently stores the validate function
            if (this.temp.targets[this.temp.index].validate(target, isPlayer)) {
                //Good! It works.
                console.log(`Target is ${target.name}.`)
                this.temp.targets[this.temp.index].target = target;
                this.temp.index++;
                if (this.temp.index >= this.temp.targets.length) {
                    //Finished! Run the callback, giving the targets as input (info needs to be mapped to the targets only)
                    this.temp.callback(this.temp.targets.map(targetInfo => targetInfo.target));
                }
            }
            else {
                console.log(`Invalid target ${target.name}.`)
            }
        }
    }

    /**
     * Give something a set of targets.
     * @param {Array} targetSpecifications This array specifies how many targets are needed and what qualities do they have to have.
     * @param {Function} receiveTargetsCallback This method will be called once all targets have been obtained, 
     * returning an array of targets that follow the specs.
     * @param {Card} sourceCard The card that is requesting the targets.
     * @param {boolean} requireTargets If true, the user CANNOT cancel the designation of targets. Used for forced triggered abilities.
     */
    getTargets(targetSpecifications, receiveTargetsCallback, sourceCard, requireTargets) {
        if (targetSpecifications == undefined || targetSpecifications.length == 0) {
            //There are no specifications, so callback right away with no targets
            receiveTargetsCallback([], true);
        }
        else {
            //All players are now in Target mode as targets have to be specified.
            this.game.players.forEach(player => player.action = ActionType.Target);

            //Rewrite the callback so that original control is restored
            let newCallback = (a, b) => {
                receiveTargetsCallback(a, b);
                this.updatePriority();
            }

            //Set up the player's temp storage to handle target selection.
            //Whenever a player selects a target, it will be added to temp, and once they have all been assigned,
            //the callback will be called.
            this.temp = {
                //Callback
                callback: targets => newCallback(targets, true),
                //Targets
                targets: [],
                //How many targets have already been specified
                index: 0,
            };

            //Loop through the targets specified, getting each one in order
            targetSpecifications.forEach(targetSpec => {
                //Get a function that validates a target
                let validate = validateTarget(targetSpec, sourceCard);

                //Assign it to the player (using temp).
                this.temp.targets.push({
                    //We are adding an object containing both the validation checker and the final target
                    
                    //The undefined target (will be assigned later)
                    target: undefined,
                    //The validation function
                    validate: validate,
                });
            });

            //Update UI showing that a target needs to be specified.
            this.moveStatus.textContent = 'Please select a target.';

            //If targets aren't required, add a cancel button
            if (requireTargets != undefined && requireTargets == true) {
                //Required: hide the button
                this.moveControl.style.display = 'none';
                this.moveControlArray.style.display = 'none';
                this.moveControl.disabled = true;
                this.moveControl.onclick = () => {};
            }
            else {
                //Not required
                this.moveControl.textContent = 'Cancel';
                this.moveControl.onclick = () => { //Cancel selecting targets
                    //Let the card know it was cancelled
                    newCallback([], false);
                };
            }
        }
    }

    /**
     * Get a choice over something
     * @param {Object} choicesData The choices available and the rules on which are allowed.
     * @param {Function} choicesCallback This method will be called once the choices have been made, returning a list of the choice indices.
     */
    getChoices(card, choicesData, choicesCallback) {
        this.choiceElement.style.display = 'block';
        // this.choiceDialogue.textContent = card.name + ': Chose one.';
        let selections = choicesData.options.map(option => false);
        let validate = () => selections.filter(item => item).length == choicesData.choiceCount;

        //Display card
        this.choiceDialogue.cardDisplay.innerHTML = ''; //Clear previous card
        let cardUI = card.getUI();
        cardUI.onclick = () => {}; //This card does nothing, so disable its click
        this.choiceDialogue.cardDisplay.appendChild(cardUI);

        //Set title to the given command, so the player knows what to do
        this.choiceDialogue.top.textContent = choicesData.command;
        //Remove old options
        this.choiceDialogue.options.innerHTML = '';
        //Add new ones
        choicesData.options.forEach((option, i) => {
            let optionElement = document.createElement('div');
            let optionButton = document.createElement('button');
            optionElement.classList.add('option');
            optionButton.textContent = option;
            //Add functionality
            optionButton.onclick = () => {
                selections[i] = !selections[i];
                //Change CSS
                let selected = selections[i] ? 'add' : 'remove'
                optionElement.classList[selected]('selected');
                //Change CSS for submit button
                this.choiceDialogue.submit.disabled = !validate();
            };
            optionElement.appendChild(optionButton);
            //Connect it to dialogue
            this.choiceDialogue.options.appendChild(optionElement);
        });
        //Check if no selection is a valid selection and update the submit button's UI
        this.choiceDialogue.submit.disabled = !validate();
        //Update control buttons
        this.choiceDialogue.submit.onclick = () => {
            if (validate()) {
                //Use the selection
                //Hide the choice prompt
                this.choiceElement.style.display = 'none';
                //Change selection to match format
                choicesCallback(true, selections);
            }
        }
        this.choiceDialogue.cancel.onclick = () => {
            //Cancel the selection
            //Hide the choice prompt
            this.choiceElement.style.display = 'none';
            choicesCallback(false);
        }
    }

    /**
     * Get the user's choice over how triggers are ordered onto the stack
     * @param {Array} triggerDatas A list of triggers. Each item contains the trigger, the source, and other data.
     * @param {Function} orderCallback This method will be called once the order has been decided.
     */
    orderTriggers(triggerDatas, orderCallback) {
        //Show the order selector element
        this.orderElement.style.display = 'block';
        //Update the selecter UI, showing each ability
        this.orderElement.selection.innerHTML = '';
        const spaceBetweenTriggerElements = 30;
        //Initialize UI elements for each ability
        for(let i in triggerDatas) {
            //Create UI for this ability
            triggerDatas[i].element = AbilityUI(triggerDatas[i].ability, triggerDatas[i].abilitySource);
            //Add CSS class specific to triggered abilities that need to be selected
            triggerDatas[i].element.classList.add('triggered-ability-selection');
            this.orderElement.selection.appendChild(triggerDatas[i].element);
        };
        //Add height to the parent of the abilities to give them space
        this.orderElement.selection.style.height = triggerDatas[0].element.offsetHeight;

        //Add functionality to the UI
        triggerDatas.forEach(triggerData => {
            let element = triggerData.element;
            //Add functionality
            element.onmousedown = event => {
                event = event || window.event;
                event.preventDefault();
                element.position = event.clientX;

                document.onmouseup = () => {
                    //Find new index of trigger
                    let newIndex = -1;
                    triggerDatas.forEach((otherTrigger, otherIndex) => {
                        if (element.offsetLeft > otherTrigger.element.offsetLeft) {
                            newIndex = otherIndex;
                        }
                    });
                    if (newIndex < element.index) newIndex++;

                    //Reorder items
                    let toAdd = triggerDatas.filter(trigger => trigger != triggerData);
                    let before = toAdd.slice(0, newIndex);
                    let after = toAdd.slice(newIndex, triggerDatas.length);
                    triggerDatas = before.concat(triggerData, after);
                    setTriggerPositions();

                    //Stop movement
                    document.onmouseup = null;
                    document.onmousemove = null;
                }

                document.onmousemove = moveEvent => {
                    let movement = moveEvent.clientX - element.position;

                    //Move nearby items out of the way
                    triggerDatas.forEach((otherTrigger, index) => {
                        if (otherTrigger != triggerData) {
                            let otherElement = otherTrigger.element;

                            //Check if it is now to the left
                            let thisIndex = triggerDatas.indexOf(triggerData);
                            if (otherElement.offsetLeft > (element.offsetLeft + movement) && otherElement.index < element.index) {
                                otherElement.index = element.index + 1;
                                otherElement.style.left = otherElement.offsetLeft + element.offsetWidth + spaceBetweenTriggerElements;
                            }
                            //Check if it is now to the right
                            if (otherElement.offsetLeft < (element.offsetLeft + movement) && otherElement.index > element.index) {
                                otherElement.index = element.index - 1;
                                otherElement.style.left = otherElement.offsetLeft - (element.offsetWidth + spaceBetweenTriggerElements);
                            }
                        }
                    });
                    element.style.left = element.offsetLeft + movement;
                    element.position = moveEvent.clientX;
                }
            }
        });

        let baseLeftPosition = this.orderElement.selection.offsetLeft;
        let setTriggerPositions = () => {
            triggerDatas.forEach((triggerData, index) => {
                triggerData.element.index = index;
                triggerData.element.style.left = baseLeftPosition + index * (triggerData.element.offsetWidth + spaceBetweenTriggerElements);
            });
        }

        setTriggerPositions();

        //Add functionality to the Submit button
        this.orderElement.controls.submit.onclick = () => {
            //Hide this UI
            this.orderElement.style.display = 'none';
            //Call back
            orderCallback(triggerDatas);
        };
    }

    /**
     * Ask the player a question
     * @param {string} question A question that the player will be asked to answer.
     * @param {Array} options An array of options (strings) the player can respond with.
     * @param {Function} callback A callback function that receives the answer the player gives.
     */
    askQuestion(question, options, callback) {
        this.moveStatus.textContent = question;
        //Hide the single button control
        this.moveControl.style.display = 'none';
        //Show the multiple buttons control
        this.moveControlArray.style.display = 'block';
        //Clear all previous data
        this.moveControlArray.innerHTML = '';
        //Add options to the array
        options.forEach(option => {
            let optionElement = document.createElement('button');
            optionElement.classList.add('option');
            optionElement.textContent = option;

            optionElement.onclick = () => {
                //Select this option

                //Restore UI
                this.moveControl.style.display = 'inline-block';
                this.moveControlArray.style.display = 'none';
                this.moveControlArray.innerHTML = '';

                //Send back the option
                callback(option);
            }

            this.moveControlArray.appendChild(optionElement);
        });
    }

    /**
     * Gets if the specified card is currently attacking
     * @param {Card} card 
     * @returns {boolean} True if card is attacking
     */
    isAttacking(card) {
        return this.selection.cards.includes(card);
    }

    /**
     * Gets if the specified card is currently blocking
     * @param {Card} card 
     * @returns {boolean} True if card is blocking
     */
    isBlocking(card) {
        return this.selection.cards.map(blockData => blockData.blocker).includes(card);
    }
    
    /**
     * Get the blockers for a specified attacker
     * @param {Card} attacker Specified attacker
     * @returns {Array} All blockers for the attacker
     */
    getBlockers(attacker) {
        let blockers = [];
        this.selection.cards.forEach(blockData => {
            if (blockData.target === attacker) {
                blockers.push(blockData.blocker);
            }
        });
        return blockers;
    }

    /**
     * Deal a specified damage to this player. For prevention/protection effects, the source must be specified (TODO).
     * @param {number} damage Damage dealt
     * @param {*} source Source of the damage. This is an object with type of damage 'type' and the card 'card'.
     * @param {boolean} update True if you want state based actions to update based on this damage.
     */
    dealDamage(damage, source, update) {
        //Prevent damage
        if (this.damagePrevention > 0) {
            //Either exhaust all of the damage to deal or the damage to prevent so neither goes negative
            let reduction = Math.min(this.damagePrevention, damage);
            damage -= reduction;
            this.damagePrevention -= reduction;
        }
        
        //Lose that amount of life
        this.loseLife(damage, source, update);
    }


    /**
     * Lose an amount of life.
     * @param {number} amount Amount of life to lose
     * @param {*} source Source of the life loss. This is an object with source of life loss 'type' and the card 'card'.
     * @param {boolean} update True if you want state based actions to update based on this life loss.
     */
    loseLife(amount, source, update) {
        this.life -= amount;
        if (update) {
            //Update UI
            this.lifeCounter.textContent = this.life;

            if (this.life < 0) {
                //Lose the game.
                console.log(this.name + ' has lost the game.');
            }
        }
    }

    /**
     * Gain an amount of life.
     * @param {number} amount Amount of life to gain
     * @param {*} source Source of the life gain. This is an object with source of life gain 'type' and the card 'card'.
     * @param {boolean} update True if you want state based actions to update based on this life gain.
     */
    gainLife(amount, source, update) {
        this.life += amount;
        if (update) {
            //Update UI
            this.lifeCounter.textContent = this.life;
        }
    }
    
    /**
     * Determines if the player can make any moves in response. If not, autopass should pass the turn.
     * @returns {boolean} True if this player can make any moves
     */
    canDoAnything() {
        switch(this.action) {
            case ActionType.Play:
                //Check if you can activate an ability or play a card from your hand

                //Check if I can play an ability (including a mana ability, even though that's not a great idea)
                //Loop through both lands and permanents using concat()
                //This is a for loop and not a forEach to allow breaking if we find an ability we can play
                let cards = this.lands.concat(this.permanents)
                for(let i in cards) {
                    if (cards[i].canPlayAbility(this.mana)) {
                        return true;
                    }
                }

                //Check if I can play a spell
                for(let i in this.hand) { //Use a for loop (not forEach) to allow breaking if we find a card we can play
                    if (this.hand[i].canPlay(this.mana)) {
                        return true;
                    }
                }

                //No other actions can be made, so return false.
                return false;
                break;
            case ActionType.Attack:
            case ActionType.Block:
                //Check for creatures that can attack or block (they must be untapped)

                //Must be a permanent
                return this.permanents
                //Must be a creature and must be untapped
                .filter(permanent => !permanent.tapped && permanent.types.includes('Creature'))
                //There must be at least 1 creature that can attack
                .length > 0;
                break;
        }
        return false;
    }

    /**
     * Trigger an event
     * @param {string} eventName Name of the event
     * @param {Card} source Source of the event
     */
    triggerEvent(eventName, source) {
        if (this.triggers == undefined || this.triggers[eventName] == undefined) {
            //No triggers for this event.
            return;
        }
        this.triggers[eventName].forEach(trigger => {
            if (trigger.validateEvent(source)) {
                trigger.triggeredFunction(source);
            }
        });
    }
}
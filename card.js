
class Card {
    constructor(name, cost, type, subtype, text, extra) {
        this.name = name;
        this.cost = this.calculateCost(cost);
        this.types = type.split(' ');
        this.subtypes = subtype.split(' ');

        this.text = text.split('\n');
        this.abilities = [];

        //Add abilities depending on card type (definitely needs to be fixed)
        if (this.types.includes('Creature')) {
            //Add creature data
            this.power = extra.power;
            this.toughness = extra.toughness;
            this.damage = 0;
            //Add basic abilities
            this.text.forEach(line => {
                if (line.length > 0) //In case it is blank from the split
                    this.abilities.push(line)
            });
            if (extra.abilities != undefined) {
                //Add more abilities
                extra.abilities.forEach(ability => {
                    this.abilities.push(ability);
                });
            }
        }
        else if (this.types.includes('Instant') || this.types.includes('Sorcery')) {
            //Directly add abilities from input
            this.abilities = extra;
        }


        this.location = Zone.Unkown; //Default location
        this.tapped = false;
        this.getUI();
        if (this.types.includes('Land')) {
            //Function that creates an ability to create a color of mana
            let mana = (color) => ({
                //This is a mana ability
                type: 'mana',
                //The only cost is to tap the land
                cost: { tap: true },
                //When activated, add one colored mana to the player's mana pool
                activate: (card) => {
                    card.player.mana[color]++;
                    card.player.updateMana();
                },
            });
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
    /**
     * Generate an object that represents a mana cost.
     * @param {string} cost The cost as a string (ex: 2WU)
     * @returns {ManaCost} The cost as an object.
     */
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

    /**
     * Get the play type of this card.
     * @returns {string} one string type that defines how this card acts.
     */
    playType() {
        if (this.types.includes('Land')) {
            return 'Land';
        }
        else if (this.types.includes('Creature')) {
            return 'Creature';
        }
        else if (this.types.includes('Instant')) {
            return 'Instant';
        }
        return 'unkown!';
    }

    /**
     * Update this cards UI and checks if damage kills it.
     */
    update() {
        if (this.types.includes('Creature')) {
            if (this.damage >= this.toughness) {
                // This creature dies
                this.cleanup(false);
                this.location = Zone.Graveyard;
                this.player.graveyardElement.appendChild(this.element);
                this.player.permanents.splice(this.player.hand.indexOf(this), 1); //remove from permanents
                this.player.graveyard.push(this); //add to graveyard
            }
            this.statElement.textContent = `${this.power} / ${this.toughness - this.damage}`;
        }
    }

    /**
     * Cleanup all damage and temporary effects from the creature during the cleanup phase.
     * @param {boolean} update Whether or not to all update()
     */
    cleanup(update) {
        //Clear damage and 'until end of turn' effects
        if (this.types.includes('Creature')) {
            this.damage = 0;
        }
        //TODO: Clear Until EOT effects

        // Update UI (if requested)
        if (update)
            this.update();
    }

    /**
     * Generate the UI for this card.
     */
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
        img.src = './Images/sample_image.png';
        img.width = 100;
        img.draggable = false;
        image.appendChild(img)
        this.element.appendChild(image);

        let type = document.createElement('div');
        type.classList.add('type');
        type.textContent = this.types.join(' ') + ' - ' + this.subtypes.join(' ');
        this.element.appendChild(type);

        let text = document.createElement('div');
        text.classList.add('text');
        text.innerText = this.text.join('\n');
        this.element.appendChild(text);

        if (this.types.includes('Creature')) {
            let extra = document.createElement('span');
            extra.classList.add('extra');
            extra.textContent = this.power + ' / ' + this.toughness;
            this.element.appendChild(extra);
            this.statElement = extra; //For updating the values
        }
        
        this.element.onclick = () => {
            //Click the card
            this.click();
        };

        
    }

    /**
     * Click this card. Usually called from the element's onclick function.
     */
    click() {
        switch(this.location) {
            case Zone.Library:
                console.log('uhhhh, im in the library how\'d you click me?')
                break;
            case Zone.Hand:
                console.log('playing '+this.name);
                //Play the card
                switch(this.playType()) {
                    case 'Land':
                        //Put it onto the battlefield, if you haven't played one yet
                        if (!this.player.playedLand && this.player.canPlaySorcery()) {
                            this.player.playedLand = true;
                            this.location = Zone.Battlefield;
                            this.player.landsElement.appendChild(this.element);
                            this.player.hand.splice(this.player.hand.indexOf(this), 1); //remove from hand
                            this.player.lands.push(this); //add to lands
                        }
                        else {
                            console.log('cant play its '+this.player.action + ', ')
                        }
                        break;
                    case 'Creature':
                        //Play the creature spell
                        //You must be able to play it at this time though, so check for that
                        if ((this.abilities.includes('Flash') && this.player.canPlayInstant()) || this.player.canPlaySorcery()) {
                            //Ask for player to pay for this
                            this.player.payForCard(this, (success) => {
                                if (success) {
                                    //Add it to the stack
                                    this.location = Zone.Stack;
                                    //For when it resolves
                                    this.play = () => {
                                        //Play the creature, putting it onto the battlefield
                                        this.location = Zone.Battlefield;
                                        this.player.permanentsElement.appendChild(this.element);
                                        this.player.hand.splice(this.player.hand.indexOf(this), 1); //remove from hand
                                        this.player.permanents.push(this); //add to permanents
                                    }
                                    this.player.game.addToStack(this);
                                }
                            });
                        }
                        break;
                    case 'Instant':
                        if (this.player.canPlayInstant()) {
                            //Ask for player to pay for this
                            this.player.payForCard(this, (success) => {
                                if (success) {
                                    //Add it to the stack
                                    this.location = Zone.Stack;
                                    //For when it resolves
                                    this.play = () => {
                                        //Do what the card says
                                        this.abilities.forEach(ability => ability(this));

                                        //Once played, it goes directly to the graveyard (it's not a permanent)
                                        this.location = Zone.Graveyard;
                                        this.player.graveyardElement.appendChild(this.element);
                                        this.player.hand.splice(this.player.hand.indexOf(this), 1); //remove from hand
                                        this.player.graveyard.push(this); //add to graveyard
                                    }
                                    this.player.game.addToStack(this);
                                }
                            });
                        }
                        break;
                    case 'unkown!':
                        //unkown
                        console.log(this.name+': unkown card type in hand: '+this.playType());
                }
                break;
            case Zone.Battlefield:
                switch(this.player.action) {
                    case ActionType.Pay:
                    case ActionType.Play:
                        //To restore the action that it already was at before doing everything
                        let originalAction = this.player.action;

                        //Activate an ability (if you have priority)
                        if (this.player.game.getPriorityPlayer() == this.player.playerIndex) {
                            //You have priority, play an ability (of your choice)
                            console.log('Ability yeah!');
                            //Get a list of activated or mana abilities
                            let abilitiesToActivate = [];
                            this.abilities.forEach(ability => {
                                //Check if ability is a mana ability or an activated ability.
                                //A mana abilitiy can be activated in Pay or Play mode.
                                //An activated ability can only be activated in Play mode (because it uses the stack).
                                if (typeof ability === 'object' && (ability.type === 'mana' || (ability.type === 'activated' && this.player.action == ActionType.Play))) {
                                    abilitiesToActivate.push(ability);
                                }
                            });
                            if (abilitiesToActivate.length > 0) {
                                let ability = undefined;
                                if (abilitiesToActivate.length == 1) {
                                    //Activate the only ability available
                                    ability = abilitiesToActivate[0];
                                }
                                else {
                                    //TODO: Add user selection
                                }

                                //If an ability was selected, pay its cost and activate it
                                if (ability != undefined) {
                                    //Play the ability
                                    //First make sure tapping wont stop it
                                    //Then select targets
                                    //Then pay for it
                                    //Then play it


                                    //Either this must be untapped, or the ability cannot require a tap to run
                                    if (!this.tapped || !ability.cost.tap) {
                                        //We know the tapping situation is under control, now lets get the targets.

                                        //Get targets from the user
                                        this.player.getTargets(ability.targets, (targets) => {
                                            //Targets have been obtained, now pay for the ability (if necessary)

                                            //Once paid for, this function will run
                                            let onPayReceived = (paid) => {
                                                //Reset text
                                                this.player.updatePriority();
                                                //Reset play mode
                                                this.player.game.players.forEach(player => player.action = ActionType.Play);
                                                this.player.action = originalAction;

                                                //Must have been paid to play the ability
                                                if (paid) {
                                                    //Payment received, activate the ability.

                                                    //First, if the ability, requires a tap, tap it.
                                                    if (ability.cost.tap) {
                                                        this.tapped = true;
                                                        this.element.classList.add('tapped');
                                                    }

                                                    //Abilities receive the input (card, targets)
                                                    ability.activate(this, targets);
                                                }
                                            }

                                            if (ability.cost.mana != undefined) {
                                                //Ask the player to pay
                                                this.player.pay(this, this.calculateCost(ability.cost.mana), onPayReceived);
                                            }
                                            else {
                                                //No payment necessary, run the method immediately
                                                onPayReceived(true);
                                            }
                                        });
                                    }
                                }
                            }
                        }
                        break;
                    case ActionType.Target:
                        //User clicked on this card to target it with a spell or ability
                        this.player.selectTarget(this, false);
                        break;
                    case ActionType.Attack:
                        if (this.types.includes('Creature')) //Must be a creature that can attack
                            this.player.selectAttacker(this);
                        break;
                    case ActionType.Block:
                        if (this.types.includes('Creature') && !this.tapped) //Must be a creature that can block
                            this.player.selectBlocker(this);
                        break;
                    case ActionType.BlockTarget:
                        //Must be a creature that can attack
                        //This can only be a block target if it is attacking
                        if (this.types.includes('Creature') && this.player.isAttacking(this)) 
                        {
                            //Call the select target method on the player that is blocking my player's attack
                            this.player.game.getBlockingPlayer().selectBlockTarget(this);
                        }
                        break;
                    case ActionType.Unkown:
                        console.log(`Card ${this.name} clicked when action is unkown`)
                    case ActionType.Wait:
                    default:
                        //Nothing
                        break;
                }
            break;
            case 'stack':
                //Do nothing
            break;
            default:
                console.log(this.name + ': unkown card location '+this.location);
        }
    }


    /**
     * Returns if this card has the ability specified.
     * @param {*} ability 
     * @returns {boolean} True if this card has the specified ability
     */
    hasAbility(ability) {
        return this.abilities.includes(ability);
    }
}

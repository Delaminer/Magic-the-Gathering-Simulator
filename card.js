
class Card {
    /**
     * Create a card object. This constructor does not do everything,
     * the constructor defines the card, but not the individualized card.
     * 
     * Note: you can put all of these variables in an array (as 1 parameter)
     * 
     * @param {string} name Name of the card.
     * @param {ManaCost} cost Cost of the card.
     * @param {string} type Types this card has separated by spaces.
     * @param {string} subtype Types this card has separated by spaces.
     * @param {string} text Text to display on the card UI.
     * @param {any} extra Extra attributes, defined in a JSON style.
     */
    constructor(name, cost, type, subtype, text, extra) {
        if (cost == undefined) {
            [name, cost, type, subtype, text, extra] = name;
        }
        this.name = name;
        this.cost = new ManaCost(cost);
        //Determine the colors of this card based on its cost
        this.colors = [];
        for(let color of ['white', 'blue', 'black', 'red', 'green'])
            if (this.cost[color] > 0)
                this.colors.push(color);

        //Get the image URL (or se the default)
        this.imageURL = extra.imageURL ? extra.imageURL : 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=425693&type=card';

        this.types = type.split(' ');
        this.subtypes = subtype.split(' ');
        if (subtype === '')
            this.subtypes = []; //Avoid having a blank spot in the subtypes
        
        this.supertypes = [];

        this.text = text.split('\n');
        this.abilities = [];
        //These are called at the end of turn, for cleanup
        this.endOfTurnEffects = [];

        //Add creature properties
        if (this.types.includes('Creature')) {
            //Add creature data
            this.basePower = extra.power;
            this.baseToughness = extra.toughness;
            this.damage = 0;
            this.damagePrevention = 0;
        }

        //Get abilities differently for permanents and non-permanents
        if (this.isPermanent()) {
            // //Add basic abilities
            // this.text.forEach(line => {
            //     if (line.length > 0) //In case it is blank from the split
            //         this.abilities.push(line);
            // });
            if (extra.abilities != undefined) {
                //Add abilities
                extra.abilities.forEach(ability => {
                    this.abilities.push(CreateAbility(ability));
                });
            }
            //Allow for attachments
            this.attachments = [];
        }
        else {
            //Directly add abilities from input
            this.abilities = extra.abilities;
            this.choice = extra.choice;
        }

        //Add supertypes
        if (extra.supertypes != undefined) this.supertypes = extra.supertypes.split(' ');


        this.location = Zone.Unkown; //Default location
        this.tapped = false;
        this.element = this.getUI();
        if (this.types.includes('Land')) {
            //Function that creates an ability to create a color of mana
            let mana = (color) => new ManaAbility({
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
        this.element.onmove = () => this.update()
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
        else if (this.types.includes('Sorcery')) {
            return 'Sorcery';
        }
        else if (this.types.includes('Enchantment')) {
            return 'Enchantment';
        }
        else if (this.types.includes('Artifact')) {
            return 'Artifact';
        }
        else if (this.types.includes('Planeswalker')) {
            return 'Planeswalker';
        }
        return 'unkown!';
    }
    /**
     * Gets whether or not this card is a permanent.
     */
    isPermanent() {
        //Save comparisons by checking if it is NOT a permanent.
        return !this.types.includes('Instant') && !this.types.includes('Sorcery');
    }
    
    /**
     * Gets the creature's power right now, with all damage and effects.
     * @returns {number} The creature's power.
     */
    getPower() {
        if (this.player != undefined && this.player.game != undefined) //They must be defined for this
            return this.player.game.getPower(this);
        
        //Otherwise use the base power
        return this.basePower;
    }

    /**
     * Gets the creature's toughness right now, with all damage and effects.
     * @returns {number} The creature's toughness.
     */
    getToughness() {
        if (this.player != undefined && this.player.game != undefined) //They must be defined for this
            return this.player.game.getToughness(this);
        
        //Otherwise use the base toughness
        return this.baseToughness;
    }

    /**
     * Update this cards UI and checks if damage kills it.
     */
    update() {
        if (this.types.includes('Creature')) {
            if (this.damage >= this.getToughness()) {
                // Lethal damage: Destroy this creature
                this.destroy({type: 'lethal', source: this}, false);
            }
            this.statElement.textContent = `${this.getPower()}/${this.getToughness() - this.damage}`;
        }
        if (this.isPermanent()) {
            //Update all effects for permanents

            //Attachments:
            if (this.attachments.length > 0) {
                let thisPosition = this.element.getBoundingClientRect();
                //If an equipment moves, resulting in this card moving, the new positions also have to be updated
                let leftSide = thisPosition.left;
                let topSide = thisPosition.top + window.scrollY; //Add scrollY so absolute position is correctly determined
                this.attachments.forEach((attachment, index) => {
                    if (attachment.element.style.position != 'absolute') {
                        //Minor fix to reset possible UI issues with things changing position styles
                        setTimeout(() => this.player.game.update(), 50);
                    }
                    if (attachment.element.style.position != 'absolute' && attachment.element.getBoundingClientRect().left < thisPosition.left) {
                        //It is to the left and will be shifted
                        leftSide -= thisPosition.width;
                    }
                });
                this.attachments.forEach((attachment, index) => {
                    attachment.element.style.position = 'absolute';
                    attachment.element.style.left = leftSide + 'px';
                    attachment.element.style.top = topSide - 30*index - 30 + 'px';
                    attachment.element.style.zIndex = this.element.style.zIndex - 1 - index;
                });
            }
        }
    }

    /**
     * Deal a specified damage to this card (creature or planeswalker). For prevention/protection effects, the source must be specified (TODO).
     * @param {number} damage Damage dealt
     * @param {*} source Source. This is an object with type of damage 'type' and the card 'card'.
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

        this.damage += damage;
        if (update) {
            this.update();
        }
    }
    
    /**
     * Destroy this permanent!
     * @param {*} source The source of the effect. Specify how, and if it wasn't a state based action, from what card.
     * @param {boolean} update Whether you want state based actions to update based on this (should always be on?)
     */
    destroy(source, update) {
        //Only destroy this if it doesn't have indestructible
        if (!this.hasAbility(Keyword.Indestructible)) {
            this.moveToGraveyard(update);
        }
    }

    /**
     * Move this to the graveyard.
     */
    moveToGraveyard(update) {
        this.cleanup(update);
        this.player.graveyardElement.appendChild(this.element); //Move element
        this.player.permanents.splice(this.player.permanents.indexOf(this), 1); //remove from permanents list
        this.player.graveyard.push(this); //add to graveyard list
        this.setLocation(Zone.Graveyard); //Change status variable and update UI
    }

    /**
     * Cleanup all damage and temporary effects from the creature during the cleanup phase.
     * @param {boolean} update Whether or not to call update()
     */
    cleanup(update) {
        //Clear damage and 'until end of turn' effects
        if (this.types.includes('Creature')) {
            this.damage = 0;
        }
        //TODO: Clear Until EOT effects
        this.endOfTurnEffects.forEach(effect => effect(this));
        this.endOfTurnEffects = [];

        // Update UI (if requested)
        if (update)
            this.update();
    }

    /**
     * Generate the UI for this card.
     */
    getUI() {
        
        let uiElement = document.createElement('div');
        uiElement.classList.add('card');
        uiElement.classList.add(this.location + 'Card');

        //Determine the background color of the card based on its colors (or land colors)
        let classColors = Object.create(this.colors); //So it copies the color values, not the reference to the array
        if (this.types.includes('Land')) {
            //If it's a land, add the colors it can produce
            for(let [code, color] of [['{W}', 'white'], ['{U}', 'blue'], ['{B}', 'black'], ['{R}', 'red'], ['{G}', 'green']])
                if (this.text.includes(code)) classColors.push(color)

            if (this.text.includes('mana of any')) {
                //Multicolored
                classColors.push('white', 'blue', 'black', 'red', 'green'); //So it is marked as multicolored
            }
        }
        let classColor = 'colorless';
        if (classColors.length > 1) {
            //Multicolored
            classColor = 'multicolored';
        }
        else if (classColors.length == 1) {
            //Monocolored
            classColor = classColors[0];
        }

        uiElement.classList.add(classColor)
        
        //Title: the name and cost of the card
        let title = document.createElement('div');
        title.classList.add('title');
        let name = document.createElement('span');
        name.classList.add('name');
        name.textContent = this.name;
        title.appendChild(name);
        let cost = document.createElement('span');
        cost.classList.add('cost');
        cost.innerHTML = insertSymbols(this.cost.text);
        title.appendChild(cost);
        uiElement.appendChild(title);

        let image = document.createElement('div');
        image.classList.add('image');

        //Load a card image to draw the card's painting
        let imgSource = document.createElement('img');
        imgSource.src = this.imageURL;
        imgSource.style.display = 'none'; //Hide the image as it is used only as a source for the canvas 
        image.appendChild(imgSource);

        //The canvas displays a cropped version of the image
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'destination-over';
        imgSource.onload = () => {
            //(18,36), (205, 172) are original corners of the image
            let scale = imgSource.width / 223;
            ctx.drawImage(imgSource, scale*18, scale*36, scale*(205-18), scale*(172-36), 0, 0, canvas.width, canvas.height);
        }
        image.appendChild(canvas);
        uiElement.appendChild(image);

        //The line that shows the type and subtype (and expansion symbol)
        let type = document.createElement('div');
        type.classList.add('type');
        type.textContent = this.types.join(' ');
        if (this.subtypes.length > 0) //To avoid showing the blank hyphen, only display subtype if there is one
            type.textContent += ' - ' + this.subtypes.join(' ');
        uiElement.appendChild(type);

        let text = document.createElement('div');
        text.classList.add('text');
        text.innerHTML = insertSymbols(this.text.join('<br>'));
        uiElement.appendChild(text);

        if (this.types.includes('Creature')) {
            let stats = document.createElement('span');
            stats.classList.add('stats');
            stats.textContent = this.getPower() + '/' + this.getToughness();
            uiElement.appendChild(stats);
            this.statElement = stats; //For updating the values
        }
        
        uiElement.onclick = () => {
            //Click the card
            this.click();
        };

        return uiElement;
        
    }

    /**
     * Click this card. Usually called from the element's onclick function.
     */
    click() {
        switch(this.location) {
            case Zone.Library:
                console.log(this.name + ': uhhhh, im in the library how\'d you click me?');
                break;
            case Zone.Hand:
                console.log('Playing ' + this.name + ' from hand.');
                //Play the card
                switch(this.playType()) {
                    case 'Land':
                        //Put it onto the battlefield, if you haven't played one yet
                        if (!this.player.playedLand && this.player.canPlaySorcery()) {
                            this.player.playedLand = true;
                            this.player.landsElement.appendChild(this.element); //Move element
                            this.player.hand.splice(this.player.hand.indexOf(this), 1); //remove from hand list
                            this.player.lands.push(this); //add to lands list
                            this.setLocation(Zone.Battlefield); //Change status and update UI
                        }
                        else {
                            console.log('Cant play a land right now.');
                        }
                        break;
                    case 'Creature':
                    case 'Artifact':
                    case 'Enchantment':
                        //Play the permanent spell
                        //You must be able to play it at this time though, so check for that
                        if ((this.hasAbility(Keyword.Flash) && this.player.canPlayInstant()) || this.player.canPlaySorcery()) {
                            //If it is an Aura, then a target is needed. Check for a SpellAbility that has a target
                            let spellsOnCast = this.abilities.filter(ability => ability.type == 'spell');
                            let targetedSpells = spellsOnCast.filter(ability => ability.targets.length > 0);

                            if (targetedSpells.length > 0) {
                                //Get the target specs from these
                                let targetsNeeded = targetedSpells.map(ability => ability.targets);
                                //Flatten this 2D array into 1D
                                targetsNeeded = [].concat.apply([], targetsNeeded);

                                //Get targets
                                this.player.getTargets(targetsNeeded, allTargets => {
                                    //Reset action after getting targets
                                    this.player.game.players.forEach(player => player.action = ActionType.Play);


                                    //Pay and play the spell just like normal, except use the targets to play the spell after
                                    this.player.payForCard(this, (success) => {
                                        if (success) {
                                            //Remove it from the hand
                                            this.player.hand.splice(this.player.hand.indexOf(this), 1);
                                            //Add it to the stack
                                            this.setLocation(Zone.Stack);
                                            //For when it resolves
                                            this.play = () => {
                                                //Play the creature, putting it onto the battlefield
                                                this.player.permanentsElement.appendChild(this.element);
                                                this.player.permanents.push(this); //add to permanents
                                                this.setLocation(Zone.Battlefield);
                                                //Play the spells
                                                let targetsIndex = 0;
                                                spellsOnCast.forEach(ability => {
                                                    let targets = allTargets.slice(targetsIndex, ability.targets.length);
                                                    ability.activate(this, targets);
                                                    targetsIndex += ability.targets.length;
                                                });
        
                                                //Update everything else
                                                this.player.game.update();
                                            }
                                            this.player.game.addToStack(this, false);
                                        }
                                    });
                                }, this);
                            }
                            else {
                                //Normal permanent: just pay and play

                                //Ask for player to pay for this
                                this.player.payForCard(this, (success) => {
                                    if (success) {
                                        //Remove it from the hand
                                        this.player.hand.splice(this.player.hand.indexOf(this), 1);
                                        //Add it to the stack
                                        this.setLocation(Zone.Stack);
                                        //For when it resolves
                                        this.play = () => {
                                            //Play the creature, putting it onto the battlefield
                                            this.player.permanentsElement.appendChild(this.element);
                                            this.player.permanents.push(this); //add to permanents
                                            this.setLocation(Zone.Battlefield);
    
                                            //Update everything else
                                            this.player.game.update();
                                        }
                                        this.player.game.addToStack(this, false);
                                    }
                                });
                            }

                        }
                        break;
                    case 'Instant':
                    case 'Sorcery':
                        //Instants and sorceries are basically the same, so play them the same way (except check for different rules)

                        //It can be played if you can play a sorcery, or if its an instant and you can play one
                        if (this.player.canPlaySorcery() || (this.playType() === 'Instant' && this.player.canPlayInstant())) {
                            //Try to play the spell. Just like an ability, this is done in steps, in this order:
                            //Make choices
                            //Select targets
                            //Pay for it
                            //Play it

                            //Get choices. This determines which abilities to play. If no choice is required, play all of them.
                            //Once choices are received, run this code:
                            let receivedChoices = abilitiesChosen => {
                                

                                //Because a spell can have multiple abilities, each with its own targets, (although this has not been done yet),
                                //Each one has to collect targets, then each one is played.
                                //Group all the target specs in one, so they can be assigned one by one all at once and dealt with all at once

                                let allTargetSpecifications = [].concat.apply([], abilitiesChosen
                                                                        .map(ability => ability.targets) //Get the target specs
                                                                        .filter(targets => targets !== undefined)); //Only those that need targets

                                this.player.getTargets(allTargetSpecifications, allTargets => {
                                    //Reset action
                                    this.player.game.players.forEach(player => player.action = ActionType.Play);
                                    
                                    //Ask for player to pay for this
                                    this.player.payForCard(this, (success) => {
                                        if (success) {
                                            //Remove it from the hand
                                            this.player.hand.splice(this.player.hand.indexOf(this), 1);
                                            //Add it to the stack
                                            this.setLocation(Zone.Stack);
                                            //For when it resolves
                                            this.play = () => {
                                                //Do what the card says
                                                let targetsIndex = 0;
                                                abilitiesChosen.forEach(ability => {
                                                    if (typeof ability === 'function') {
                                                        ability(this);
                                                    }
                                                    else if (typeof ability === 'object') {
                                                        //Get targets for this ability
                                                        let targets = allTargets.slice(targetsIndex, ability.targets.length);
                                                        ability.activate(this, targets);
                                                        //increase the index counter
                                                        targetsIndex += ability.targets.length;
                                                    }
                                                });

                                                //Once played, it goes directly to the graveyard (it's not a permanent)
                                                this.player.graveyardElement.appendChild(this.element);
                                                this.player.graveyard.push(this); //add to graveyard
                                                this.setLocation(Zone.Graveyard);
                                            }
                                            this.player.game.addToStack(this, false);
                                        }
                                    });
                                }, this);
                            };

                            //Now actually get the choices from the player
                            if (this.choice) {
                                this.player.getChoices(this, this.choice, (success, choices) => {
                                    if (success) {
                                        //Use the list of indices to choose which abilities to play
                                        let abilitesToPlay = this.abilities.filter((item, index) => choices[index]);
                                        receivedChoices(abilitesToPlay);
                                    }
                                });
                            }
                            else {
                                //No choices are required, so play all of the abilites
                                receivedChoices(this.abilities);
                            }
                        }
                        break;
                    case 'unkown!':
                    default:
                        //unkown or unimplemented card type
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
                            console.log(this.name + ': trying to activate any abilities!');
                            //Get a list of activated or mana abilities
                            let abilitiesToActivate = [];
                            this.abilities.forEach(ability => {
                                //Check if the ability can be activated/played and if it can right now
                                if (ability.canPlay != undefined && 
                                    ability.canPlay(undefined, this.player.action, this.player.canPlaySorcery(), this.tapped)) {
                                    //This can be played
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

                                                    //If the ability is a mana ability, play it.
                                                    //If it's an activated ability, put it onto the stack
                                                    if (ability.type === 'mana') {
                                                        //Play it right away
                                                        ability.activate(this, targets);
                                                    }
                                                    else {
                                                        //Add the ability to the stack
                                                        this.player.game.addToStack(ability, true, this, () => ability.activate(this, targets));
                                                    }
                                                }
                                            }

                                            if (ability.cost.mana != undefined) {
                                                //Ask the player to pay for the ability
                                                this.player.pay(this, new ManaCost(ability.cost.mana), onPayReceived);
                                            }
                                            else {
                                                //No payment necessary, run the method immediately
                                                onPayReceived(true);
                                            }
                                        }, this);
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
     * Move the card to a new location
     * @param {Zone} location 
     */
    setLocation(location) {
        let handChange = this.location === Zone.Hand || location === Zone.Hand;
        let leftBattlefield = this.location === Zone.Battlefield && location !== Zone.Battlefield;

        this.element.classList.remove(this.location + 'Card');
        this.location = location;
        this.element.classList.add(this.location + 'Card');

        //Update this UI, just in case
        this.update();

        //Update hand if cards in hand changed
        if (handChange) {
            this.player.updateHandUI();
        }

        //Trigger events
        if (leftBattlefield) {
            //Triggers must exist and triggers for leave-battlefield must exist
            if (this.triggers && this.triggers['leave-battlefield']) {
                for(let triggerID in this.triggers['leave-battlefield']) {
                    //Get the trigger from the ID
                    let trigger = this.triggers['leave-battlefield'][triggerID];
                    if (trigger.validateEvent(this)) {
                        trigger.triggeredFunction(this);
                    }
                }
            }
        }
    }

    /**
     * Attach a card to this permanent.
     * @param {Card} card The card being attached (usually an Aura or Equipment)
     * @param {boolean} update Runs this.update() if true.
     */
    attach(card, update) {
        if (!this.isPermanent()) {
            console.log(this.name+': Card.attach() ran on a non-permanent!');
            return;
        }

        //Add the attachment
        this.attachments.push(card);
        
        //Update if requested
        if (update)
            this.update();
    }
    /**
     * Remove a card attached to this one
     * @param {Card} card The card being removed (usually an Aura or Equipment)
     * @param {boolean} update Runs this.update() if true.
     */
    detach(card, update) {
        if (!this.isPermanent()) {
            console.log(this.name+': Card.detach() ran on a non-permanent!');
            return;
        }

        let index = this.attachments.indexOf(card);
        if (index > -1) {
            //Remove the attachment
            this.attachments.splice(index, 1);
            //Update if requested
            if (update)
                this.update();
        }
        else {
            console.log(this.name + ': Card.detach() ran on a card (' + card.name + ') not already attached to it!');
            return;
        }
    }


    /**
     * Returns if this card has the ability specified.
     * @param {*} ability Usually a string keyword like Vigilance or Trample
     * @returns {boolean} True if this card has the specified ability
     */
    hasAbility(ability) {
        //Check the game for static abilities that grant this ability
        if (this.player != undefined && this.player.game != undefined) //They must be defined for this
            return this.player.game.hasAbility(this, ability);

        return (
            //Only get keyword abilities
            this.abilities.filter(ability => ability.type == 'keyword')
            //Get the keyword
            .map(ability => ability.keyword)
            //This list of keywords must include the ability
            .includes(ability)
        );
    }

    /**
     * Gets if this card has an ability that can be played
     * @param {*} mana How much mana the player currently has
     * @returns {boolean} True if there is an ability this card can play
     */
    canPlayAbility(mana) {
        for(let ability of this.abilities) {
            //Must be a non-keyword ability and either an activated ability or mana ability.

            //Use the convient canPlay method on the ability (if it has one)
            if (ability.canPlay != undefined && ability.canPlay(mana, this.player.action, this.player.canPlaySorcery(), this.tapped)) {
                //This can be played
                return true;
            }
            // if (typeof ability == 'object' && (ability.type == 'activated' || ability.type == 'mana')) {
            //     //First check the tapping cost (either this is untapped or it does not cost a tap)
            //     if (!this.tapped || !ability.cost.tap) {
            //         //Tapping is good, now check for mana
            //         if (ability.cost.mana == undefined || canPayCost(mana, ability.cost.mana)) {
            //             //The cost can be paid, so this ability can be played! Return true!
            //             return true;
            //         }
            //     }
            // }
        }
        //No abilities are able to be played, so return false.
        return false;
    }

    /**
     * Gets if this card can be played (from the player's hand).
     * @param {*} mana The mana available.
     * @returns {boolean} True if it can be played.
     */
    canPlay(mana) {
        //If it can be played depends on HOW it can be played
        switch(this.playType()) {
            case 'Land':
                return !this.player.playedLand && this.player.canPlaySorcery();
            case 'Instant':
                return this.player.canPlayInstant() && canPayCost(mana, this.cost);
            default: //All sorcery-like spells: Creatures, Sorceries, Enchantments, Artifacts, Planeswalkers, etc
                return this.player.canPlaySorcery() && canPayCost(mana, this.cost);
        }
    }

    
    /**
     * Add a trigger to a card for when an event occurs
     * @param {string} eventName The name of the event.
     * @param {Function} validateEvent Runs to check if the event is valid (used for specifying the event more in-depth)
     * @param {Function} triggeredFunction The function that is ran when the event occurs.
     * @returns The reference to the trigger, so it can be removed later.
     */
    addTrigger(eventName, validateEvent, triggeredFunction) {
        //First intialize the trigger database and collection for this event if needed
        if (this.triggers == undefined) {
            this.triggers = {};
        }
        if (this.triggers[eventName] == undefined) {
            this.triggers[eventName] = {};
        }

        //Make a random ID for this trigger (the trigger itself cannot be used as the ID, a lot of problems have arisen from trying that)
        let triggerID = Math.floor(Math.random() * 1000).toString();
        //Make sure the ID isn't already taken
        while (this.triggers[eventName][triggerID]) triggerID = Math.floor(Math.random() * 1000).toString();

        //Create a trigger object with the two functions givem
        let trigger = {validateEvent: validateEvent, triggeredFunction: triggeredFunction};

        //Register the trigger
        this.triggers[eventName][triggerID] = trigger;
        //Return the ID to the user
        return triggerID;
    }
    /**
     * Remove a trigger for an event
     * @param {string} eventName The name of the event.
     * @param {*} trigger The trigger to be removed.
     */
    removeTrigger(eventName, trigger) {
        //The trigger must exist to delete it
        if (this.triggers && this.triggers[eventName] && this.triggers[eventName][trigger]) {
            delete this.triggers[eventName][trigger];
        }
    }
}

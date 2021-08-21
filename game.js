const TurnStep = {
    Untap: 0,
    Upkeep: 1,
    Draw: 2,
    PrecombatMain: 3,
    Combat: 4,
    DeclareAttackers: 5,
    DeclareBlockers: 6,
    CombatDamage: 7,
    EndCombat: 8,
    PostcombatMain: 9,
    End: 10,
};

const Zone = {
    Battlefield: 'battlefield', //or permanents/land
    Hand: 'hand',
    Graveyard: 'graveyard',
    Exile: 'exile',
    Stack: 'stack',
    Library: 'library',
    Unkown: 'unkown',
};

class Game {
    constructor(name1, deck1, name2, deck2) {
        this.player1 = new Player(name1, deck1, this, 0);
        this.player2 = new Player(name2, deck2, this, 1);
        this.currentPlayer = 0;
        this.priorityPlayer = 0;
        this.phase = 0;
        this.turn = 0;
        this.players = [this.player1, this.player2];
        this.stack = [];

        //Add an update on page resize so UI doesn't break
        window.addEventListener('resize', () => this.update());
    }

    /**
     * Start the game.
     */
    start() {
        //Assume who goes first has already been decided
        this.currentPlayer = 0;
        this.priorityPlayer = 0;
        this.phase = TurnStep.PrecombatMain; //start at main
        this.turn = 1;
        //Update player statuses (as well as turn status)
        this.updatePlayers(this.currentPlayer, player => player.updateTurn(true));
    }

    /**
     * Update the turn and priority statuses of each player
     * @param {number} priorityPlayer tells the players which player has priority.
     * @param {Function} call If defined, this function runs on each player.
     */
    updatePlayers(priorityPlayer, call) {
        let autoPassPlayer = undefined;

        this.players.forEach(player => {
            if (call != undefined) {
                //There is another method to call on each player
                call(player);
            }
            if(player.updatePriority(priorityPlayer, this.stack)) {
                //This player wants to AutoPass
                autoPassPlayer = player;
            }
        });

        if (autoPassPlayer != undefined) {
            //If a player wanted to AutoPass, let them (has to be after every player gets updated)
            autoPassPlayer.progressTurn();
        }
    }

    /**
     * Pass priority from a specified player
     * @param {number} playerIndex the index of the player who has passed priority
     */
    passPriority(playerIndex) {
        //Make sure this player has priority
        if (this.getPriorityPlayer() != playerIndex) return;

        //Either pass priority for the turn, or an item on the stack
        if (this.stack.length > 0) {
            //Pass their priority for this item on the stack
            let stackItem = this.stack[this.stack.length - 1];
            
            if (stackItem.priority == this.currentPlayer) {
                //Active player passed, so pass priority to non active player
                stackItem.priority = 1 - this.currentPlayer;
                //Update player UI
                this.updatePlayers(stackItem.priority);
            }
            else {
                //Nonactive player passed, so resolve the spell


                //Resolve it either as a spell or ability
                if (stackItem.isAbility) {
                    if (stackItem.ability.optional) {
                        //Ask if you want it to resolve
                        this.players[stackItem.owner].askQuestion(`Let ${stackItem.source.name}'s ability resolve?`, ['Yes', 'No'], option => {
                            //Remove it from the stack
                            this.stack.pop();
                            //Activate it if it resolves
                            if (option == 'Yes') {
                                stackItem.activate();
                            }
                            //Remove the UI
                            stackItem.element.remove();
                            //Update player UI
                            this.updatePlayers(this.getPriorityPlayer());
                        });
                    }
                    else {
                        //Remove it from the stack
                        this.stack.pop();
                        //Activate it
                        stackItem.activate();
                        //Remove the UI
                        stackItem.element.remove();
                        //Update player UI
                        this.updatePlayers(this.getPriorityPlayer());
                    }
                }
                else {
                    //Remove it from the stack
                    this.stack.pop();
                    //Play it
                    stackItem.card.play();
                    //Update player UI
                    this.updatePlayers(this.getPriorityPlayer());
                }
            }
        }
        else {
            //Pass their priority for the turn

            if (this.priorityPlayer == this.currentPlayer) {
                //Pass priority to non active player before the phase ends
                this.priorityPlayer = 1 - this.priorityPlayer;
                //Update player UI
                this.updatePlayers(this.priorityPlayer);
            }
            else {
                //Nonactive player passed, so pass the turn
                this.progressTurn();
            }
        }
    }

    /**
     * Gets which player has priority.
     * @returns {number} The index of the player.
     */
    getPriorityPlayer() {
        if (this.stack.length > 0) {
            return this.stack[this.stack.length - 1].priority;
        }
        return this.priorityPlayer;
    }

    /**
     * Add a spell or ability to the stack
     * @param {*} item Either a Card being cast or an Ability being activated or triggered
     * @param {boolean} isAbility True if the item being added is an ability 
     * @param {Card} sourceCard For abilities, this is the source of the card
     * @param {Function} abilityFunction This function is ran when the ability is activated  
     */
    addToStack(item, isAbility, sourceCard, abilityActivate) {
        if (isAbility) {
            //It is an ability
            let ability = item;
            //Generate a UI for this ability
            let element = AbilityUI(ability, sourceCard);
            //Clear positioning adjustments
            element.style.top = '0px';
            element.style.left = '0px';
            element.style.position = 'relative';


            this.stackElement.body.appendChild(element);

            //Add the ability to the stack, and give priority to the active player
            this.stack.push({
                isAbility: true,
                ability: ability,
                source: sourceCard,
                activate: abilityActivate,
                owner: this.getPriorityPlayer(),
                priority: this.currentPlayer,
                element: element, //So it can easily be deleted later
            });
        }
        else {
            //It is a card, not an ability
            let card = item;

            //Add the card to the stack, and give priority to the active player
            this.stack.push({
                isAbility: false,
                card: card,
                owner: this.getPriorityPlayer(),
                priority: this.currentPlayer,
            });
            //Move the card's UI to the stack parent
            this.stackElement.body.appendChild(card.element);
        }

        //Notify players of the change in priority
        this.updatePlayers(this.currentPlayer);
    }

    /**
     * Progress the turn by one (or more) phase(s).
     */
    progressTurn() {
        //Increment phase and reset priority
        this.phase++;
        this.priorityPlayer = this.currentPlayer;

        console.log('Progressing turn to ' + this.phaseName(this.phase) + '.');

        //Handle phase specific events
        if (this.phase == TurnStep.Untap) {
            //Untap
            let untap = card => {
                //Make sure it actually CAN untap
                if (!this.hasAbility(card, 'cancelUntap')) {
                    card.tapped = false;
                    card.element.classList.remove('tapped');
                    //Update UI as well
                    card.update();
                }
            };
            this.players[this.currentPlayer].lands.forEach(untap);
            this.players[this.currentPlayer].permanents.forEach(untap);
            this.players[this.currentPlayer].playedLand = false;

            //That's all for this phase! Let's move on!
            this.progressTurn();
            //Stop the players from updating by ending the method early
            return;
        }
        else if (this.phase == TurnStep.Draw) {
            //Draw
            this.players[this.currentPlayer].draw(1);

            //That's all for this phase! Let's move on!
            this.progressTurn();
            //Stop the players from updating by ending the method early
            return;
        }
        else if (this.phase == TurnStep.CombatDamage) {
            //Handle combat damage
            let blockingPlayer = this.getBlockingPlayer();

            // For each attacker
            this.players[this.currentPlayer].selection.cards.forEach(attacker => {
                if (!attacker.types.includes('Creature')) {
                    console.log('This attacker isnt a creature: '+attacker.name);
                    return;
                }
                //Check if this creature was blocked
                let blockers = blockingPlayer.getBlockers(attacker);
                if (blockers.length > 0) {
                    //Deal damage to blockers
                    let damageLeft = attacker.getPower();
                    let index = 0;

                    //Deal some damage to each blocker until each one receives damage, or there is no power left
                    while (damageLeft > 0 && index < blockers.length) {
                        // Determine how much damage is needed to kill this blocker
                        let blockerHealthLeft = blockers[index].getToughness() - blockers[index].damage;
                        // Get how much damage the attacker will deal to this blocker
                        let damageToDeal = Math.min(damageLeft, blockerHealthLeft);
                        // Decrease how much damage is left to deal to other blockers (or trample to the player)
                        damageLeft -= damageToDeal;
                        // Deal the damage to the blocker
                        attacker.turnInformation.damageDealt.push(blockers[index]);
                        // blockers[index].damage += damageToDeal;
                        blockers[index].dealDamage(damageToDeal, {type: 'combat', card: attacker}, false);

                        // Take damage from the blocker
                        blockers[index].turnInformation.damageDealt.push(attacker);
                        // attacker.damage += blockers[index].power;
                        attacker.dealDamage(blockers[index].getPower(), {type: 'combat', card: blockers[index]}, false);

                        index++;
                    }
                    // If there is damage left and this attacker has trample, deal the extra damage to the player
                    if (damageLeft > 0 && attacker.hasAbility(Keyword.Trample)) {
                        //Deal damage to player
                        this.triggerEvent('combat-damage-player', attacker);
                        // blockingPlayer.life -= damageLeft;
                        blockingPlayer.dealDamage(damageLeft, {type: 'combat', card: attacker}, false);
                        damageLeft = 0;
                    }
                }
                else {
                    //Deal damage to target player
                    this.triggerEvent('combat-damage-player', attacker);
                    // blockingPlayer.life -= attacker.power;
                    blockingPlayer.dealDamage(attacker.getPower(), {type: 'combat', card: attacker}, false);
                }

            });
            //Update UI Life total
            blockingPlayer.lifeCounter.textContent = blockingPlayer.life;
            //Update each card (there could be a better way to do this)
            this.update();
            //Update a bit later as well
            setTimeout(() => this.update(), 50);
        }
        else if (this.phase == TurnStep.PostcombatMain) {
            //Stop attacking and blocking, each has a different way of doing so
            this.players.forEach(player =>  {
                if (player.selection.type == 'attackers') {
                    //Remove attackers
                    player.selection.cards.forEach(card => {
                        //Remove the attacker style
                        card.element.classList.remove('attacker');
                    });
                }
                else if (player.selection.type == 'blockers') {
                    //Remove blockers
                    player.selection.cards.forEach(card => {
                        //Remove the line element
                        removeLine(card.line);
                        //Remove the blocker style
                        card.blocker.element.classList.remove('blocker');
                    });
                }
                player.selection.cards = [];
            });
        }
        else if (this.phase > TurnStep.End) { //If it passed the end turn phase
            //Pass the turn
            this.phase = TurnStep.Untap - 1; //So it becomes 0 (untap) when the next progressturn calls
            this.turn++;
            this.currentPlayer = 1 - this.currentPlayer; //Swap players
            this.priorityPlayer = this.currentPlayer; //Set priority

            //Clear all damage
            this.players.forEach(player => player.cleanup());

            //Progress turn
            this.progressTurn();
            //Stop the players from updating by ending the method early
            return;
        }
        //Update players
        this.updatePlayers(this.currentPlayer, player => player.updateTurn(true));
    }

    /**
     * Update everything in the game
     */
    update() {
        this.players.forEach(player => player.updatePermanents());
    }

    /**
     * Generate the UI for the game.
     * @param {HTMLElement} element The parent element for the game.
     */
    drawUI(element) {
        //Add each player UI
        this.players.forEach((player, i) => {
            element.appendChild(player.element);
            if (i == 0) {
                let bar = document.createElement('div');
                bar.classList.add('bar');
                element.appendChild(bar);
            }
        });

        //Add stack UI
        this.stackElement = document.createElement('div');
        this.stackElement.classList.add('stack');
        //Title of the stack area
        let stackTitle = document.createElement('div');
        stackTitle.classList.add('title');
        stackTitle.textContent = 'The Stack'
        this.stackElement.appendChild(stackTitle);
        let stackBody = document.createElement('div');
        stackBody.classList.add('body');
        this.stackElement.appendChild(stackBody);
        this.stackElement.body = stackBody; //For reference

        //Make the stack draggable
        this.stackElement.onmousedown = (event) => {
            event = event || window.event;
            event.preventDefault();
            this.stackElement.position = [event.clientX, event.clientY];
            
            document.onmouseup = () => {
                //Stop dragging
                document.onmouseup = null;
                document.onmousemove = null;
            };
            document.onmousemove = (event) => {
                let [dx, dy] = [this.stackElement.position[0] - event.clientX, this.stackElement.position[1] - event.clientY];
                this.stackElement.style.top = (this.stackElement.offsetTop - dy) + 'px';
                this.stackElement.style.left = (this.stackElement.offsetLeft - dx) + 'px';
                this.stackElement.position[0] -= dx;
                this.stackElement.position[1] -= dy;
            };
        };

        element.appendChild(this.stackElement);

        // main.appendChild(this.player1.getUI(false));
        // main.appendChild(this.player2.getUI(true));

        this.element = element; //for future reference
    }
    /**
     * Get the name of a phase in string format.
     * @param {number} phase 
     * @returns {string} The name of the phase
     */
    phaseName(phase) {
        switch(phase) {
            case TurnStep.Untap:
                return 'Untap';
                break;
            case TurnStep.Upkeep:
                return 'Upkeep';
                break;
            case TurnStep.Draw:
                return 'Draw';
                break;
            case TurnStep.PrecombatMain:
                return 'Precombat Main';
                break;
            case TurnStep.Combat:
                return 'Combat';
                break;
            case TurnStep.DeclareAttackers:
                return 'Declare Attackers';
                break;
            case TurnStep.DeclareBlockers:
                return 'Declare Blockers';
                break;
            case TurnStep.CombatDamage:
                return 'Combat Damage';
                break;
            case TurnStep.EndCombat:
                return 'End Combat';
                break;
            case TurnStep.PostcombatMain:
                return 'Postcombat Main';
                break;
            case TurnStep.End:
                return 'End';
                break;
            default:
                return 'Unkown';
        }
    }

    /**
     * Get the player that is currently blocking
     * @returns {Player} The player object.
     */
    getBlockingPlayer() {
        return this.players[1 - this.currentPlayer];
    }

    /**
     * Get the power of a creature right now.
     * @param {Card} card The creature in subject. 
     * @returns {number} The power of the creature.
     */
    getPower(card) {
        //Players must be defined first
        if (this.players == undefined)
            return card.basePower(card);

        let powerChange = 0;
        //Get all of the static abilities in play, and check if this creature's power is changed by any of them.
        this.players.forEach(player => {
            player.permanents.concat(player.lands).forEach(permanent => {
                permanent.abilities.filter(ability => ability.type == 'static').forEach(ability => {
                    //This is a static ability. Check if it is valid, and if it changes the power
                    if (ability.valid(card, permanent)) {
                        //It is valid! Now change power if available
                        if (ability.effect.powerChange != undefined) {
                            powerChange += ability.effect.powerChange;
                        }
                    }
                });
            });
        });
        //Go through until end of turn effects and permanent effects
        card.untilEndOfTurnEffects.concat(card.permanentEffects).forEach(effect => {
            if (effect.powerChange != undefined) {
                powerChange += effect.powerChange;
            }
        });
        return card.basePower(card) + powerChange;
    }
    /**
     * Get the toughness of a creature right now.
     * @param {Card} card The creature in subject. 
     * @returns {number} The toughness of the creature.
     */
    getToughness(card) {
        //Players must be defined first
        if (this.players == undefined)
            return card.baseToughness(card);

        let toughnessChange = 0;
        //Get all of the static abilities in play, and check if this creature's toughness is changed by any of them.
        this.players.forEach(player => {
            player.permanents.concat(player.lands).forEach(permanent => {
                permanent.abilities.filter(ability => ability.type == 'static').forEach(ability => {
                    //This is a static ability. Check if it is valid, and if it changes the toughness
                    if (ability.valid(card, permanent)) {
                        //It is valid! Now change toughness if available
                        if (ability.effect.toughnessChange != undefined) {
                            toughnessChange += ability.effect.toughnessChange;
                        }
                    }
                });
            });
        });
        //Go through until end of turn effects and permanent effects
        card.untilEndOfTurnEffects.concat(card.permanentEffects).forEach(effect => {
            if (effect.toughnessChange != undefined) {
                toughnessChange += effect.toughnessChange;
            }
        });
        return card.baseToughness(card) + toughnessChange;
    }

    /**
     * Check if a card/permanent has a certain ability
     * @param {Card} card The card (permanent) in subject
     * @param {Keyword} ability The ability in question
     */
    hasAbility(card, ability) {
        //Determine if the player has the ability by default
        let base = (
            //Only get keyword abilities
            card.abilities.filter(ability => ability.type == 'keyword')
            //Get the keyword
            .map(ability => ability.keyword)
            //This list of keywords must include the ability
            .includes(ability)
        );
        
        //If they have it, return the success. If not, keep checking
        if (base) return true;

        let grantedAbility = false;
        
        //Go through until end of turn effects and permanent effects
        card.untilEndOfTurnEffects.concat(card.permanentEffects).forEach(effect => {
            //Break immediately if already found
            if (grantedAbility) return;

            if (effect[ability]) {
                grantedAbility = true;
            }
        });

        //Break early if found
        if (grantedAbility) return true;

        //Go through every static ability
        this.players.forEach(player => {
            //Break immediately if already found
            if (grantedAbility) return;

            player.permanents.concat(player.lands).forEach(permanent => {
                //Break immediately if already found
                if (grantedAbility) return;

                permanent.abilities.filter(staticAbility => staticAbility.type == 'static').forEach(staticAbility => {
                    //Break immediately if already found
                    if (grantedAbility) return;

                    //This is a static ability. Check if it is valid, and if it grants trample
                    if (staticAbility.valid(card, permanent)) {
                        //It is valid! Now check if trample is granted
                        if (staticAbility.effect[ability]) {
                            //It is!
                            grantedAbility = true;
                        }
                    }
                });
            });
        });

        //Return status
        return grantedAbility;
    }

    /**
     * Trigger an event.
     * @param {string} eventName The event that was triggered.
     * @param {*} source The source of the event.
     */
    triggerEvent(eventName, source) {

        //Store the events that will trigger in a list, so the user an choose the order of them.
        //Each item contains the triggered ability in question, as well as its source, and the event and its source (the last two are redundant)
        let triggeredEvents = {};

        //Loop through each player
        this.players.forEach((player, playerIndex) => {
            triggeredEvents[playerIndex] = [];
            //Loop through each permanent they have
            player.permanents.concat(player.lands, player.graveyard.filter(card => card.isPermanent())).forEach(permanent => {
                permanent.abilities.filter(triggeredAbility => triggeredAbility.type == 'triggered' && triggeredAbility.event == eventName)
                .forEach(triggeredAbility => {
                    //This is a static ability. Check if it is valid, and if it grants trample
                    if (triggeredAbility.valid(source, permanent)) {
                        //It is valid! This ability will be activated.
                        //Triggered abilities act similar to activated abilities.
                        //Both require targets, and both go onto the stack 
                        // (note: triggered abilities also require choices and payments, but thats a WIP)

                        //As a result, because multiple abilities can trigger (and often do), the user will HAVE to order these abilties
                        // to play them. This will take a lot of work, but is necessary to ensure each ability will activate as intended.

                        //For right now, this triggered ability will be added to a list. This list holds the abilities that will trigger,
                        // so these will be ordered by the user, and if there is only one ability, that can be put onto the stack immediately.

                        //Before adding it, there must be legal targets available for it to be added to the stack. 
                        //If there are not, do not add it to the stack.
                        let targetsNeeded = triggeredAbility.targets;
                        if (targetsNeeded != undefined && targetsNeeded.length > 0) {
                            let stillLegal = true;
                            targetsNeeded.forEach(neededTarget => {
                                if (!stillLegal) return; //Break out early

                                //Find a target for this
                                let validateFunction = validateTarget(neededTarget, permanent);
                                //Loop through EVERYTHING, looking for a valid target for this
                                let targetsFound = (
                                    //Go through players
                                    this.players.filter(player => validateFunction(player, true)).length > 0 ||
                                    //Get a list of every card in the game
                                    [].concat.apply([], 
                                    this.players.map(p => [].concat(p.lands, p.permanents, p.hand, p.library, p.exile, p.graveyard))
                                    )
                                    .filter(card => validateFunction(card, false)).length > 0
                                );
                                if (!targetsFound) {
                                    //We messed up, no legal targets
                                    stillLegal = false;
                                }
                            });
                            if (stillLegal) {
                                //Add it
                            triggeredEvents[playerIndex].push(
                                {ability: triggeredAbility, abilitySource: permanent, event: eventName, eventSource: source});
                        }
                        }
                        else {
                            //No targets needed, add it
                            triggeredEvents[playerIndex].push(
                                {ability: triggeredAbility, abilitySource: permanent, event: eventName, eventSource: source});
                        }
                    }
                });
            });
        });
        //Loop through each players triggeres and trigger them (or ask for order) in APNAP order, adding everything to the stack
        for(let i = 0; i < this.players.length; i++) {
            let playerIndex = (this.currentPlayer + i) % this.players.length; //Starts at current player, increases by 1

            if (triggeredEvents[playerIndex].length == 1) {
                let triggeredEvent = triggeredEvents[playerIndex][0];
                let ability = triggeredEvent.ability;
                let abilitySource = triggeredEvent.abilitySource;
    
                //Get targets for the ability
                abilitySource.player.getTargets(ability.targets, (targets, targetsSuccess) => {
                    //Reset play mode
                    this.players.forEach(player => player.action = ActionType.Play);
    
                    //Play the ability
                    if (targetsSuccess) {
                        this.addToStack(ability, true, abilitySource, () => ability.activate(abilitySource, targets));
                    }
                    else {
                        console.log(`Error! Triggered ability from ${triggeredEvent.abilitySource.name} for ${eventName}, failed to receive targets!`);
                    }
    
                }, abilitySource, true);
            }
            else if (triggeredEvents[playerIndex].length > 1) {
                //Get the order from the user
                this.players[playerIndex].orderTriggers(triggeredEvents[playerIndex], orderedTriggeredEvents => {
                    //These must be added asynchronously
                    let addTriggeredEventToTheStack = (triggeredEventIndex) => {
                        let triggeredEvent = triggeredEvents[playerIndex][triggeredEventIndex];
                        let ability = triggeredEvent.ability;
                        let abilitySource = triggeredEvent.abilitySource;
            
                        //Get targets for the ability
                        abilitySource.player.getTargets(ability.targets, (targets, targetsSuccess) => {
                            //Reset play mode
                            this.players.forEach(player => player.action = ActionType.Play);
            
                            //Play the ability
                            if (targetsSuccess) {
                                this.addToStack(ability, true, abilitySource, () => ability.activate(abilitySource, targets));
                                //Go to the next one
                                if (triggeredEventIndex < triggeredEvents[playerIndex].length - 1) {
                                    addTriggeredEventToTheStack(triggeredEventIndex + 1)
                                }
                            }
            
                        }, abilitySource, true);
                    }

                    //Start requests
                    addTriggeredEventToTheStack(0);
                });
            }
        }

        //Alright, we have collected a list of triggered abilities. If none have been triggered, do nothing.
        //If exactly one triggered, play that one first. If there are more than one, ask the user to choose the order and add them to the stack in that order.
        
    }

}
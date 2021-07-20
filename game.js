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

                //Remove it from the stack
                this.stack.pop();
                //Play it
                stackItem.card.play();
                //Update player UI
                this.updatePlayers(this.getPriorityPlayer());
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
     * @param {Card} card 
     */
    addToStack(card) {
        //Add the card to the stack, and give priority to the active player
        this.stack.push({
            card: card,
            owner: this.getPriorityPlayer(),
            priority: this.currentPlayer,
        });
        //Move the card's UI to the stack parent
        this.stackElement.body.appendChild(card.element);

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
                card.tapped = false;
                card.element.classList.remove('tapped');
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
                    let damageLeft = attacker.power;
                    let index = 0;

                    //Deal some damage to each blocker until each one receives damage, or there is no power left
                    while (damageLeft > 0 && index < blockers.length) {
                        // Determine how much damage is needed to kill this blocker
                        let blockerHealthLeft = blockers[index].toughness - blockers[index].damage;
                        // Get how much damage the attacker will deal to this blocker
                        let damageToDeal = Math.min(damageLeft, blockerHealthLeft);
                        // Decrease how much damage is left to deal to other blockers (or trample to the player)
                        damageLeft -= damageToDeal;
                        // Deal the damage to the blocker
                        blockers[index].damage += damageToDeal;

                        // Take damage from the blocker
                        attacker.damage += blockers[index].power;

                        index++;
                    }
                    // If there is damage left and this attacker has trample, deal the extra damage to the player
                    if (damageLeft > 0 && attacker.hasAbility('Trample')) {
                        //Deal damage to player
                        blockingPlayer.life -= damageLeft;
                        damageLeft = 0;
                    }
                }
                else {
                    //Deal damage to target player
                    blockingPlayer.life -= attacker.power;
                }

            });
            //Update UI Life total
            blockingPlayer.lifeCounter.textContent = blockingPlayer.life;
            //Update each card (there could be a better way to do this)
            this.players.forEach(player => player.updatePermanents());
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

}
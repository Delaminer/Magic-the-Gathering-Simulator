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
        this.phase = TurnStep.PrecombatMain; //start at main
        this.turn = 1;
        this.players.forEach(player => player.updateTurn());
    }
    progressTurn() {
        this.phase++;
        if (this.phase == TurnStep.CombatDamage) {
            //Handle combat damage
            let blockingPlayer = this.getBlockingPlayer();

            // For each attacker
            this.players[this.currentPlayer].selection.cards.forEach(attacker => {
                if (!attacker.types.includes('Creature')) {
                    console.log('This attacker isnt a creature: '+attacker.name);
                    return;
                }
                //Check if this creature was blocked
                let blockers = blockingPlayer.getBlockers();
                if (blockers.length > 0) {
                    //Deal damage to blockers
                    let damageLeft = attacker.power;
                    let index = 0;

                    //Deal some damage to each blocker until each one receives damage, or there is no power left
                    while (damageLeft > 0 && index < blockers.length) {
                        // Determine how much damage is needed to kill this blocker
                        let blockerHealthLeft = blockers[index].toughness - blockers[index].damage;
                        // Get how much damage the attacker will deal to this blocker
                        let damageToDeal = Math.max(damageLeft - blockerHealthLeft, 0);
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
            this.phase = 0;
            this.turn++;
            this.currentPlayer = 1 - this.currentPlayer; //Swap players
            this.priorityPlayer = this.currentPlayer; //Set priority

            //Clear all damage
            this.players.forEach(player => player.cleanup());
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

    getBlockingPlayer() {
        return this.players[1 - this.currentPlayer];
    }
}
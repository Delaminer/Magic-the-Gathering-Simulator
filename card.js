
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
        this.element.appendChild(image);

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
                            else {
                                console.log('cant play its '+this.player.action + ', ')
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
                                this.player.updateMana();
                            }
                        }
                    }
                    break;
                case 'permanents':
                    switch(this.player.action) {
                        case ActionType.Play:
                            //Activate an ability
                            console.log('Ability yeah!');
                            break;
                        case ActionType.Attack:
                            // if (this.player.selection.cards.includes(this)) {
                            //     //Stop attacking
                            //     this.player.selection.cards.splice(this.player.selection.cards.indexOf(this), 1); //remove this from the attackers
                            //     this.element.classList.remove('attacker');
                            //     console.log('not attacking');
                            // }
                            // else {
                            //     //Declare as an attacker
                            //     this.player.selection.cards.push(this); //Join the attackers
                            //     this.element.classList.add('attacker');
                            //     console.log('Attacking!');
                            // }
                            this.player.selectAttacker(this);
                            break;
                        case ActionType.Block:
                            // let index = this.player.selection.cards.map(v => v.blocker).indexOf(this)
                            // if (index >= 0) {
                            //     //Stop blocking
                            //     let blockData = this.player.selection.cards.splice(index, 1); //remove this from the blockers
                            //     removeLine(blockData.line);
                            //     this.element.classList.remove('blocker');
                            //     console.log('not blocking');
                            // }
                            // else if (this.player.temp != undefined) {
                            //     // The player has to select an attacker to block.
                            //     // If this was the blocker needed assignment, cancel the job.
                            //     // If it was some other creature, change focus to this one.

                            //     if (this.player.temp == this) {
                            //         // This is the unassigned blocker, so cancel the job.
                            //         this.element.classList.remove('blocker');
                            //         this.player.temp = undefined;
                            //         console.log('block cancelled');
                            //     }
                            //     else {
                            //         // This was not, so switch to this one.

                            //         // First remove the old one
                            //         let oldBlocker = this.player.temp;
                            //         oldBlocker.classList.remove('blocker');

                            //         // Then assign this one
                            //         this.player.temp = this;
                            //         this.element.classList.add('blocker');
                            //         console.log('this will block maybe.');
                            //     }
                            // }
                            // else {
                            //     // Put this blocker wannabe into the temp slot, so you can choose who to target it with
                            //     this.player.temp = this;
                            //     this.element.classList.add('blocker');
                            //     console.log('this will block maybe');
                            // }
                            this.player.selectBlocker(this);
                            break;
                        case ActionType.BlockTarget: 
                            // // Note: this is the incorrect player (fix, and edit code below)
                            // let blockingPlayer = this.player.game.players[1 - this.player.game.currentPlayer];
                            // console.log('Blocking player is '+blockingPlayer.name);
                            // // This can only be targeted if there is an unassigned blocker
                            // if (blockingPlayer.temp != undefined) {
                            //     //This is the target of the blocker (temp)
                            //     //Assign this target and add a line (connecting the interaction) to show it

                            //     // Create the line element
                            //     let line = document.createElement('div');
                            //     // Give it some CSS
                            //     line.classList.add('line');
                            //     // Put into into the document
                            //     document.body.appendChild(line);
                            //     // Connect the line from the attacker (this.element) to the blocker (blockingPlayer.temp.element)
                            //     adjustLine(this.element, blockingPlayer.temp.element, line);

                            //     // Add the blocker to their list with this card as its target, and add the line element for reference
                            //     blockingPlayer.selection.cards.push({blocker: blockingPlayer.temp, target: this, line: line});

                            //     console.log('So you are blocking ');

                            //     // the blocker has been assigned, so remove it from the temp slot
                            //     blockingPlayer.temp = undefined;
                            // }
                            //Call the select target method on the player that is blocking my player's attack
                            this.player.game.getBlockingPlayer().selectBlockTarget(this);
                            break;
                        case ActionType.Unkown:
                            console.log(`Card ${this.name} clicked when action is unkown`)
                        case ActionType.Wait:
                        default:
                            //Nothing
                            break;
                    }
                    break;
                default:
                    console.log(this.name + ': unkown card location '+this.location);
            }
        }

        
    }
}

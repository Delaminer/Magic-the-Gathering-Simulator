
class Card {
    constructor(name, cost, type, subtype, text, extra) {
        this.name = name;
        this.cost = this.calculateCost(cost);
        this.types = type.split(' ');
        this.subtypes = subtype.split(' ');
        this.text = text.split('\n');
        this.abilities = [];
        if (this.types.includes('Creature')) {
            //Add creature data
            this.power = extra.power;
            this.toughness = extra.toughness;
            this.damage = 0;
        }
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
    update() {
        if (this.types.includes('Creature')) {
            if (this.damage > this.toughness) {
                // This creature dies
                this.cleanup(false);
                this.player.graveyardElement.appendChild(this.element);
            }
            this.statElement.textContent = `${this.power} / ${this.toughness - this.damage}`;
        }
    }
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
        text.textContent = this.text.join(' <br> ');
        this.element.appendChild(text);

        if (this.types.includes('Creature')) {
            let extra = document.createElement('span');
            extra.classList.add('extra');
            extra.textContent = this.power + ' / ' + this.toughness;
            this.element.appendChild(extra);
            this.statElement = extra; //For updating the values
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
                            if ((this.abilities.includes('Flash') && this.player.canPlayInstant()) || this.player.canPlaySorcery()) {
                                //Ask for player to pay for this
                                this.player.payForCard(this, (success) => {
                                    if (success) {
                                        //Add it to the stack
                                        this.location = 'stack';
                                        //For when it resolves
                                        this.play = () => {
                                            this.location = 'permanents';
                                            this.player.permanentsElement.appendChild(this.element);
                                            this.player.hand.splice(this.player.hand.indexOf(this), 1); //remove from hand
                                            this.player.permanents.push(this); //add to permanents
                                        }
                                        this.player.game.addToStack(this);

                                        // //Play it!
                                        // this.location = 'permanents';
                                        // this.player.permanentsElement.appendChild(this.element);
                                        // this.player.hand.splice(this.player.hand.indexOf(this), 1); //remove from hand
                                        // this.player.permanents.push(this); //add to permanents
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
                            this.player.selectAttacker(this);
                            break;
                        case ActionType.Block:
                            this.player.selectBlocker(this);
                            break;
                        case ActionType.BlockTarget:
                            //This can only be a block target if it is attacking
                            if (this.player.isAttacking(this)) {
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

        
    }

    hasAbility(ability) {
        return this.abilities.includes(ability);
    }
}

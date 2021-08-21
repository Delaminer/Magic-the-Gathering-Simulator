/**
 * Create an ability using data! It uses the type specified to create an ability of the same type.
 * @param {*} data The data for the ability
 * @returns {Ability} The ability, or the original data.
 */
const CreateAbility = (data) => {
    //Use the data to determine the type of the ability, then create an instance of that ability and return it!
    if (data.type) {
        switch(data.type) {
            case 'activated':
                return new ActivatedAbility(data);
            case 'mana':
                return new ManaAbility(data);
            case 'spell':
                return new SpellAbility(data);
        }
    }
    return data;
}

class Ability {
    constructor(data) {
        for(let variable in data) {
            this[variable] = data[variable];
        }
        
        //Add automatic countering unless requested not to
        if (data.automaticallyCounter == undefined || data.automaticallyCounter == true) {

            //Add automatic countering/fizzle/Counter Upon Resolution if ALL targets are illegal. 
            //Individual targets CAN be illegal, those parts of the ability will just not be activated .
            //(the card definition has to deal with individual illegal targets)
            this.baseActivate = this.activate;
            this.activate = (card, targets) => {
                //Make sure at least one target is legal
                let legalTargets = 0;
                for(let i in targets) {
                    if (validateTarget(this.targets[i], card)(targets[i], targets[i] instanceof Player)) {
                        //It is valid
                        legalTargets++;
                        break;
                    }
                }
                //At least one target must have been legal, or there are no targets
                if (legalTargets > 0 || targets.length == 0) {
                    this.baseActivate(card, targets);
                }
                else {
                    console.log('No legal targets, this ability has been Countered Upon Resolution.');
                }
            };
        }
    }
    /**
     * See if you can play an ability.
     * @param {*} mana 
     * @param {*} action 
     * @param {*} sorcerySpeed 
     * @returns 
     */
    canPlay(mana, action, sorcerySpeed, tapped) {
        console.log('Ability.canPlay() ran on base level Ability class, this must be overrided for abilities of type '+this.type);
        return (this.type === 'mana' || (this.type === 'activated' && action == ActionType.Play)) &&
                //Check for timing restrictions.
                (!this.restrictions || sorcerySpeed || !this.restrictions.includes('sorcery-speed')) &&
                //Check for tapping cost
                (!tapped || !this.cost.tap) && 
                //Check for mana cost
                (mana == undefined || this.cost.mana == undefined || canPayCost(mana, this.cost.mana));
    }
}

class ActivatedAbility extends Ability {
    constructor(data) {
        super(data)
        this.type = 'activated';
    }

    canPlay(mana, action, sorcerySpeed, tapped) {
        return action == ActionType.Play &&
                //Check for timing restrictions.
                (!this.restrictions || sorcerySpeed || !this.restrictions.includes('sorcery-speed')) &&
                //Check for tapping cost
                (!tapped || !this.cost.tap) && 
                //Check for mana cost
                (mana == undefined || this.cost.mana == undefined || canPayCost(mana, this.cost.mana));
    }
}
class ManaAbility extends Ability {
    constructor(data) {
        super(data)
        this.type = 'mana';
    }

    canPlay(mana, action, sorcerySpeed, tapped) {
        //Check for timing restrictions
        return (!this.restrictions || sorcerySpeed || !this.restrictions.includes('sorcery-speed')) &&
                //Check for tapping cost
                (!tapped || !this.cost.tap) && 
                //Check for mana cost
                (mana == undefined || this.cost.mana == undefined || canPayCost(mana, this.cost.mana));
    }
}

//This is just to label abilities of spells seperately from abilities of permanents
class SpellAbility extends Ability {
    constructor(data) {
        super(data);
        this.type = 'spell';
    }
}

/**
 * Create UI for an ability, so that it can be shown on the stack and other places
 * @param {Ability} ability The ability being represented.
 * @param {Card} sourceCard The card the ability originated from.
 * @returns {HTMLElement} The created element
 */
const AbilityUI = (ability, sourceCard) => {

    //Base ability element
    let element = sourceCard.element.cloneNode(true)
    //Change type line to say ability
    element.getElementsByClassName('type')[0].textContent = 'Ability';
    //Remove the mana cost
    element.getElementsByClassName('cost')[0].remove();
    //Change the text to say only that of the ability (and no mana cost!)
    if (ability.text) {
        element.getElementsByClassName('text')[0].innerHTML = insertSymbols(ability.text);
    }
    //Remove tapped CSS
    element.classList.remove('tapped');
    //Remove stats if present
    let stats = element.getElementsByClassName('stats');
    if (stats.length > 0) stats[0].remove();
    //Draw image from original image
    element.getElementsByTagName('canvas')[0].getContext('2d').drawImage(sourceCard.element.getElementsByTagName('canvas')[0], 0, 0);
    //Add custom CSS (for things like custom shaped cards)
    element.classList.add('stack-ability');

    return element;
}

const Keyword  = {
    Deathtouch: 'Deathtouch',
    Defender: 'Defender', //added
    DoubleStrike: 'Double Strike',
    Fear: 'Fear', //added
    FirstStrike: 'First Strike',
    Flash: 'Flash', //added
    Flying: 'Flying', //added
    Haste: 'Haste',
    Hexproof: 'Hexproof',
    Indestructible: 'Indestructible', //added
    Infect: 'Infect',
    Intimidate: 'Intimidate', //added
    Lifelink: 'Lifelink',
    Menace: 'Menace',
    Reach: 'Reach', //added
    Shadow: 'Shadow', //added
    Shroud: 'Shroud',
    Skulk: 'Skulk', //added
    Trample: 'Trample', //added
    Unblockable: 'Unblockable', //added
    Wither: 'Wither',
    Vigilance: 'Vigilance', //added
}

class KeywordAbility {
    /**
     * Create a keyword ability. Very simple. Note: this is NOT an ability, canPlay is undefined
     * @param {Keyword} keyword The keyword.
     */
    constructor(keyword) {
        this.type = 'keyword';
        this.keyword = keyword;
    }
}


/**
 * Create the Equip and Equipped Creature effects.
 * @param {*} cost 
 * @param {*} effect 
 * @param {*} triggers 
 * @returns 
 */
const Equip = (cost, effect, triggers) => {
    return ([
        {
            //Boost equipped creature
            type: 'static',
            //Rules for equipping
            valid: (card, sourceCard) => 
                sourceCard.attached == card && card.types.includes('Creature') && 
                sourceCard.player == card.player && card.location == Zone.Battlefield,
            //Effect is determined by parameter
            effect: effect,
        },
        new ActivatedAbility({
            //Equip - This is an activated ability
            text: 'Equip',
            restrictions: 'sorcery-speed',
            cost: cost,
            targets: ['Creature Control'],
            activate: (card, targets) => {
                //Make sure the equip target is still legal (the ability should be countered if this is the case, but add this check just in case)
                if (!validateTarget('Creature Control', card)(targets[0], false)) {
                    //The target has been invalidated
                    return;
                }
                //If the equipment is destroyed before equipping resolves, cancel it (not all abilities fizzle when the source dies, but this does)
                if (card.location != Zone.Battlefield) {
                    return;
                }
    
                //Detach old creature if it was already attached
                if (card.attached) {
                    //Detach it
                    card.attached.detach(card, false);
                    //Remove old listeners - for when the creature dies and for when the artifact dies
                    card.attached.removeTrigger('leave-battlefield', card.attachTrigger);
                    card.removeTrigger('leave-battlefield', card.deathTrigger);
                }
    
                //Attach to the creature
                card.attached = targets[0];
                targets[0].attach(card, false);
    
                //Attach listener to auto-detach when the creature dies and save the reference
                card.attachTrigger = targets[0].addTrigger('leave-battlefield', () => true, () => {
                    //Detach from card
                    card.attached.detach(card, false);
                    //Remove listeners - for when the creature dies and for when the artifact dies
                    card.attached.removeTrigger('leave-battlefield', card.attachTrigger);
                    card.removeTrigger('leave-battlefield', card.deathTrigger);
                    //Remove reference
                    card.attached = undefined;
                    //Reset this UI
                    card.element.style.position = 'initial';
                    //Update the game
                    card.player.game.update();
                });
    
                //Attach listener to auto-detach when the artifact dies and save the reference
                card.deathTrigger = card.addTrigger('leave-battlefield', () => true, () => {
                    //Detach from card
                    card.attached.detach(card, false);
                    //Remove listeners - for when the creature dies and for when the artifact dies
                    card.attached.removeTrigger('leave-battlefield', card.attachTrigger);
                    card.removeTrigger('leave-battlefield', card.deathTrigger);
                    //Remove reference
                    card.attached = undefined;
                    //Reset this UI
                    card.element.style.position = 'initial';
                    //Update the game
                    card.player.game.update();
                });
    
                //Update everything
                targets[0].player.game.update();
            },
        }),
    ]);
}

/**
 * Return a static ability that gives a creature +1/+1 counter.
 * @returns A simple 'effect' object (like UntilEndOfTurn effects).
 */
 const PlusOnePlusOneCounter = () => {
     return {powerChange: 1, toughnessChange: 1}
}

/**
 * Create the Equip and Equipped Creature effects.
 * @param {*} cost 
 * @param {*} effect 
 * @param {*} triggers 
 * @returns 
 */
const EnchantmentAura = (targetSpecification, effect, triggers) => {
    return ([
        {
            //Boost equipped creature
            type: 'static',
            //Rules for enchanting (much more relaxed than equipping)
            valid: (card, sourceCard) => 
                sourceCard.attached == card && card.location == Zone.Battlefield,
            //Effect is determined by parameter
            effect: effect,
        },
        
        new SpellAbility({
            //Enchant target
            targets: [targetSpecification],
            automaticallyCounter: false, //Must specifically set this to false so that the ability will not automatically counter
            activate: (card, targets) => {
                //Make sure both the target and the aura are still on the battlefield when this resolves
                if (!validateTarget(targetSpecification, card)(targets[0], false) || card.location != Zone.Battlefield) {
                    //Do not destroy this, it must go DIRECTLY to the graveyard
                    card.moveLocation(Zone.Graveyard, false, true);
                    return;
                }
    
                //Attach to the creature
                card.attached = targets[0];
                targets[0].attach(card, false);
    
                //Attach listener to auto-detach when the creature dies and save the reference
                card.attachTrigger = targets[0].addTrigger('leave-battlefield', () => true, () => {
                    //Detach from card
                    card.attached.detach(card, false);
                    //Remove listeners - for when the creature dies and for when the artifact dies
                    card.attached.removeTrigger('leave-battlefield', card.attachTrigger);
                    card.removeTrigger('leave-battlefield', card.deathTrigger);
                    //Remove reference
                    card.attached = undefined;
                    //Reset this UI
                    card.element.style.position = 'initial';
                    //Go to the graveyard
                    card.moveLocation(Zone.Graveyard, false, true);
                    //Update the game
                    card.player.game.update();
                });
    
                //Attach listener to auto-detach when the artifact dies and save the reference
                card.deathTrigger = card.addTrigger('leave-battlefield', () => true, () => {
                    //Detach from card
                    card.attached.detach(card, false);
                    //Remove listeners - for when the creature dies and for when the artifact dies
                    card.attached.removeTrigger('leave-battlefield', card.attachTrigger);
                    card.removeTrigger('leave-battlefield', card.deathTrigger);
                    //Remove reference
                    card.attached = undefined;
                    //Reset this UI
                    card.element.style.position = 'initial';
                    //Go to the graveyard
                    card.moveLocation(Zone.Graveyard, false, true);
                    //Update the game
                    card.player.game.update();
                });
    
                //Update everything
                targets[0].player.game.update();
            },
        }),
    ]);
}
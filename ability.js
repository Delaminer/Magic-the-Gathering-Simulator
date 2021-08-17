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
        return !this.restrictions || sorcerySpeed || !this.restrictions.includes('sorcery-speed') &&
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

const Keyword  = {
    Trample: 'Trample',
    Deathtouch: 'Deathtouch',
    Indestructible: 'Indestructible',
}

class KeywordAbility {
    /**
     * Create a keyword ability. Very simple.
     * @param {Keyword} keyword The keyword.
     */
    constructor(keyword) {
        this.type = 'keyword';
        this.keyword = keyword;
    }
}

/**
 * Create the Equip and Equipped Creature
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
            valid: (card, sourceCard) => 
                sourceCard.attached == card && card.types.includes('Creature') && 
                sourceCard.player == card.player && card.location == Zone.Battlefield,
            //Effect: boost power by 2
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
                if (!validateTarget('Creature', card)(targets[0], false)) {
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
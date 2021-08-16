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
                if (validateTarget(this.targets[i])(targets[i], targets[i] instanceof Player)) {
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
        console.log('Can play ran on base level Ability class, this must be overrided for abilities of type '+this.type);
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
class Ability {
    constructor(data) {
        for(let variable in data) {
            this[variable] = data[variable];
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
        console.log('override me!')
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
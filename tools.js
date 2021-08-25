const colors = ['white', 'blue', 'black', 'red', 'green'];
const colorSymbols = ['colorless', 'white', 'blue', 'black', 'red', 'green'];
const colorSymbolsMap = [['colorless', 'C'], ['white', 'W'], ['blue', 'U'], ['black', 'B'], ['red', 'R'], ['green', 'G']];

class ManaCost {
    /**
     * 
     * @param {string} cost In string format (ex: 2WU)
     */
    constructor(cost) {
        this.cost = cost;
        let obj = calculateCost(cost);
        for(let variable in obj) {
            this[variable] = obj[variable];
        }
    }
}

/**
 * Generate an object that represents a mana cost.
 * @param {string} cost The cost as a string (ex: 2WU or {2}{W}{U})
 * @returns {any} The cost as an object (NOT A ManaCost object! Use new ManaCost instead!).
 */
const calculateCost = (cost) => {
    //Convert a text cost (2WW) to a more usable representation
    let costs = {
        'any': 0,
        'colorless': 0,
        'white': 0,
        'blue': 0,
        'black': 0,
        'red': 0,
        'green': 0,
        'text': cost //for ease of use
    }
    if (cost.length < 1) return costs;

    if (cost.includes('{')) {
        //Special format
        //Convert a string of terms seperated with {} to an array of each term
        //Seperating each term with {} essentially seperates them with terms of }{ 
        //and adding caps on the ends of { and }, so remove the caps and split!
        let parts = cost.substring(1, cost.length - 1).split('}{')

        parts.forEach(part => {
            switch(part) {
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
                    //Convert the string to an int and add!
                    costs['any'] += parseInt(part);
            }
        });
    }
    else {
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
        //Replace cost.text to show the better format.
        costs.text = `{${costs.any}}`;
        for(let [color, symbol] of colorSymbolsMap)
            costs.text += `{${symbol}}`.repeat(costs[color]);
    }
    return costs;
}

/**
 * Determine if the player can currently pay a cost, either for a spell or ability.
 * @param {any} mana The player's current mana pool available. 
 * @param {ManaCost} cost The cost needed to pay. This can be a string (ex: 2WU)
 * @returns {boolean} True if the player can afford to pay the cost.
 */
const canPayCost = (mana, cost) => {
    //Convert the cost to a ManaCost if necessary
    if (typeof cost == 'string') cost = new ManaCost(cost);

    //Create copies of the variables so the original values are not changed
    let costLeft = Object.create(cost);
    let manaLeft = Object.create(mana);

    //Loop through each color (do not loop through mana or cost, as they may contain unwanted variables that are NOT colors!)
    let colors = ['colorless', 'white', 'blue', 'black', 'red', 'green'];
    colors.forEach(color => {
        //First take away this color, then the 'any' color
        if (costLeft[color] > 0) {
            //Pay in this color whatever is smaller: how much I have, or how much it costs
            let amountToPay = Math.min(manaLeft[color], costLeft[color]);
            //Reduce costLeft by that much and how much of this color is left
            costLeft[color] -= amountToPay;
            manaLeft[color] -= amountToPay;
        }
        //If there is mana left, reduce the 'any' field with it.
        if (manaLeft[color] > 0) {
            //Since this mana cannot go anywhere else, just put it all into 'any', even if it goes negative (it doesn't matter)
            costLeft['any'] -= manaLeft[color];
            manaLeft[color] = 0;
        }
    });

    //Now check each color if there is some left that needs to be paid
    colors.push('any'); //Add comparison for the 'any' field
    for(let i in colors) {
        if (costLeft[colors[i]] > 0) return false; //The cost cannot be paid if ANYTHING is left.
    }

    return true;
}

// /**
//  * Checks if it is valid
//  * @param {string} targetType The classification of the target 
//  * @param {*} target The player or card being targeted
//  * @param {*} isPlayer Optional - Whether or not the target is a player
//  * @returns 
//  */
// const validTarget = (targetType, target, isPlayer) => {
//     if (isPlayer == undefined) {
//         //Find it yourself using instanceof
//         isPlayer = target instanceof Player;
//     }
//     switch(identifier) {
//         case 'Creature':
//             //Card must be a creature
//             return !isPlayer && target.types.includes('Creature');
//         case 'Land':
//             //Card must be a land
//             return !isPlayer && target.types.includes('Land');
//         case 'Artifact':
//             //Card must be an artifact
//             return !isPlayer && target.types.includes('Artifact');
//         case 'Enchantment':
//             //Card must be an artifact
//             return !isPlayer && target.types.includes('Enchantment');
//         case 'Player':
//             //Target must be a player
//             return isPlayer;
//         case 'Any':
//             //Target must be a player or creature (or planeswalker TODO)
//             return isPlayer || target.types.includes('Creature');
//         default:
//             console.log('Unkown identifier ' + identifier);
//     }
//     return false;
// }

/**
 * Get a function that checks if a target is valid following a set of specifications.
 * @param {string} targetSpec The specifications for the target, either as a function returning a target's validity, 
 * or a string of qualifications the target must meet.
 * @param {Card} sourceCard The card requesting a target. Used for determing the target's relation to the source's player.
 * @returns {Function} A function that when given a target and whether or not it is a player, return it's validity.
 */
const validateTarget = (targetSpec, sourceCard) => {
    if (typeof targetSpec == 'string') {
        //Get the controlling player to determine if a target is controlled by them or an opponent
        let controllingPlayer = sourceCard.player;

        //targetSpec is a string of identifiers
        let identifiers = targetSpec.split(' ');
        //Each identifier corresponds to a test
        let tests = [];

        //Because the zone should not have to always be specified, default the zone to HAVE TO BE on the battlefield.
        //This means it will make sure it is on the battlefield, even if you don't specify that.
        //This can be overidden with other specifications
        let zone = Zone.Battlefield;
        if (targetSpec.includes('ZoneBattlefield')) {
            zone = Zone.Battlefield;
        }
        else if (targetSpec.includes('ZoneGraveyard')) {
            zone = Zone.Graveyard;
        }
        //Add a check for the zone, unless specified not to check
        if (!targetSpec.includes('ZoneAny')) {
            //Valid if you are in the correct zone or you are a player
            tests.push((target, isPlayer) => isPlayer || target.location == zone);            
        }

        //For each identifier, add a check for it
        identifiers.forEach(identifier => {
            //Skip Zone specifiers
            if (identifier.includes('Zone')) return;

            //Create a test depending on what is needed
            // let test = (target, isPlayer) => validTarget(identifier, target, isPlayer);

            let test = () => true;
            switch(identifier) {
                case 'Control':
                    //Must be either a player or card's controller must be the source player
                    test = (target, isPlayer) => isPlayer || target.player == controllingPlayer;
                    break;
                case 'OpponentControl':
                    //Must be either a player or card's controller must not be the source player
                    test = (target, isPlayer) => isPlayer || target.player != controllingPlayer;
                    break;
                case 'Creature':
                    //Card must be a creature
                    test = (target, isPlayer) => !isPlayer && target.types.includes('Creature');
                    break;
                case 'Land':
                    //Card must be a land
                    test = (target, isPlayer) => !isPlayer && target.types.includes('Land');
                    break;
                case 'Artifact':
                    //Card must be an artifact
                    test = (target, isPlayer) => !isPlayer && target.types.includes('Artifact');
                    break;
                case 'Enchantment':
                    //Card must be an artifact
                    test = (target, isPlayer) => !isPlayer && target.types.includes('Enchantment');
                break;
                case 'Permanent':
                    //Card must be an artifact
                    test = (target, isPlayer) => !isPlayer && target.isPermanent();
                    break;
                case 'Player':
                    //Target must be a player
                    test = (target, isPlayer) => isPlayer;
                    break;
                case 'Opponent':
                    //Target must be a player and not the controlling player
                    test = (target, isPlayer) => isPlayer && target != controllingPlayer;
                    break;
                case 'Any':
                    //Target must be a player or creature (or planeswalker TODO)
                    test = (target, isPlayer) => isPlayer || target.types.includes('Creature');
                    break;
                default:
                    console.log('Unkown identifier ' + identifier);
            }

            //Add this test to the list that need to be tested
            tests.push(test);
        });

        //The target is valid if all tests pass (this is essentially a giant AND gate)
        return (target, isPlayer) => {
            for (let i in tests) {
                //All tests must return true
                if (!tests[i](target, isPlayer)) return false;
            }
            //All tests succeeded
            return true;
        }
    }
    else {
        //targetSpec is a function that validates for you
        return targetSpec;
    }
}
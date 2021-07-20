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
 * @param {string} cost The cost as a string (ex: 2WU)
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
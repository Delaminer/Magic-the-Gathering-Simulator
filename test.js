// class Aa {
//     constructor(name, age){
//         this.name = name;
//         this.age = age;
//     }
//     str() {
//         return this.name + ': ' + this.age
//     }
// }
// let a = new Aa('bob',12)
// let b = Object.create(a);
// b.name = 'joe'
// console.log(a.str())
// console.log(b.str())

let cost = 'UU34R5CWRRB'
let costs = {
    'any': 0,
    'colorless': 0,
    'white': 0,
    'blue': 0,
    'black': 0,
    'red': 0,
    'green': 0
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
            //Must find ALL numbers in a row (for double digit costs)
            let end = i + 1;
            let isLetter = (char) => char.toUpperCase() != char.toLowerCase();
            while (end < cost.length && !isLetter(cost[end])) end++;
            costs['any'] += parseInt(cost.substring(i, end));
            i = end - 1;
    }
}
console.log(costs)
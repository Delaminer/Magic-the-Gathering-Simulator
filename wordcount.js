const fs = require('fs');
fs.readFile('./wordcount.js', 'utf8', (err, data) => {
    
    let upper = data.toUpperCase()
    let lower = data.toLowerCase()

    let inWord = false;
    let count = 0;
    for(let i = 0; i < data.length; i++) {
        let letter = upper[i] != lower[i]
        if (letter && !inWord) {
            inWord = true;
            count++;
        }
        else if (!letter && inWord) {
            inWord = false;
        }
    }

    console.log(count)
})
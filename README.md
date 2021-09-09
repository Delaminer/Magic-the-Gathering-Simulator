# Magic-the-Gathering-Simulator
 A simulator for playing the trading card Magic the Gathering.

### Running
```
# Before running for the first time, run this command 
npm i

# Run this whenever you want to play
npm start
```
Then go to [http://localhost/magic.html](http://localhost/magic.html) to play.

### Changing Decks
You can change which deck to use by editing the last line of ```setup.js```:
```
// Replace each deck name with the URL of the decklist (as a TXT file)
startGame('/decks/test_deck1.txt', '/decks/starter_deck1.txt');
```

You can make your own deck by creating a TXT file (suggested you put the file in the ```decks``` folder, but it can go anywhere)
In the text file, each line has the number of a card followed by a space and then the name of the card. For example: 
```
4 Lightning Bolt
13 Mountain
```
**Please note:** not every card has been added! You can add more cards in ```database.js```.

### Adding cards

You can add your own cards (custom or from the game that have not yet been added) to the game.
Cards I have made have been put in ```database.js```, but they can be added anywhere, as long as the JS file is initialized in ```magic.html``` and the card is added to the database.

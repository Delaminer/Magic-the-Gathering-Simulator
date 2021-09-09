let id = 0;
let db = {};
let makeDeck = (deck) => {
    let out = [];
    deck.forEach(playSet => {
        //Get the card this playset represents
        let cardBase = playSet[0];
        //Convert string to database card
        //Sometimes the user does give cards as input (like dev cards), 
        //so we cannot assume the input is a string
        if (typeof playSet[0] == 'string') {
            cardBase = Database[playSet[0]];
            if (cardBase == undefined) {
                console.log(`Could not find card '${playSet[0]}' in database.`);
            }
        }

        for(let j = 0; j < playSet[1]; j++) {
            let card = new Card(cardBase);
            card.id = id++;
            card.n = card.name+'#'+card.id;
            db[card.id] = card;
            card.element = card.getUI();
            card.element.getCard = () => card;
            out.push(card);
        }
    });
    return out;
}

let getDeck = (filename, callback) => {
    fetch(filename).then(res => res.text()).then(text => {
        callback(makeDeck(text.split('\n').map(line => line.trim())
            .map(line => [line.substring(line.indexOf(' ') + 1), parseInt(line.substring(0, line.indexOf(' ')))])
        ))
    })
}

let soldier = ['Weary Soldier', '{W}', 'Creature', 'Human Soldier', 'Vigilance', {power: 3, toughness: 2, 
    abilities: [new KeywordAbility(Keyword.Vigilance),]}];
let bat = ['High Flier', '{B}{B}', 'Creature', 'Bat Horror', 'Vigilance', {power: 6, toughness: 1}];
let cat = ['Catty kitten', '{B}', 'Creature', 'Cat', '', {power: 1, toughness: 2}];
let rat = ['Heel Rat', '{B}{B}', 'Creature', 'Rat', 'Flying\n{1}{B}, {T}: Tap target creature.', {power: 1, toughness: 1, abilities: [
    {
        //Tapping ability:
        //T: Tap target creature.
        
        //This is an activated ability
        type: 'activated',
        //The only cost is to tap this creature
        cost: { tap: true, mana: '{1}{B}' },
        //Requires 1 target (a creature)
        targets: ['Creature'],
        //When activated, tap another target creature
        activate: (card, targets) => {
            //TODO: Get user input for who to tap
            console.log('Tapped a creature!');
            targets[0].tapped = true;
            targets[0].element.classList.add('tapped');
        },
    },
]}];
let person = ['Super Soldier', '{W}{U}{R}', 'Creature', 'Human Soldier', '', {power: 5, toughness: 4,
imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=391863&type=card'
}];

let manaboost = ['Mana Boost', '{0}', 'Sorcery', '', 'Add twenty {W}{U}{B}{R}{G}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=476467&type=card',
    abilities: [
    (card) => {
        for(let color of ['white', 'blue', 'black', 'red', 'green'])
            card.player.mana[color] += 20;
        card.player.updateMana();
    }
]}];

let superLand = ['Super Land', '', 'Land', '', '{T}: Add five {W}{U}{B}{R}{G}.', {
    imageURL: 'https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=438804&type=card',
    abilities: [
        new ManaAbility({
            cost: { tap: true },
            activate: (card) => {
                for(let color of ['white', 'blue', 'black', 'red', 'green'])
                    card.player.mana[color] += 5;
                card.player.updateMana();
            },
        }),
]}]

let alexDeck = makeDeck([
    ['Swamp', 20],
    ['Island', 20],
    ['Prodigal Sorcerer', 20],
    // ['Mountain', 40],
    [cat, 20],
    [rat, 20],
    // [bat, 20],
    ['Dark Ritual', 20],
])
let bobDeck = makeDeck([
    ['Plains', 40],
    // ['Forest', 40],
    [soldier, 20],
])

let test = makeDeck([
    // ['Prodigal Sorcerer', 4],
    // [superLand, 4],
    [manaboost, 3],
    // ['Darksteel Axe', 4],
    // ['Bonesplitter', 1],
    // ['Abrade', 4],
    // [soldier, 1],
    // ['Epic Proportions', 3],
    // [soldier, 5],
    // ['Stone Rain', 10],
    // ['Honor of the Pure', 3],
    // ['Mountain', 10],
    // ['Mox Ruby', 10],
    // ['Mox Pearl', 10],
    // ['Savannah Lions', 2],
    // [soldier, 10],
    // [person, 5],
    // ['Kari Zev, Skyship Raider', 5],
    // ['Plains', 1],
    // ['Island', 1],
    ['Swamp', 2],
    // ['Mountain', 5],
    // ['Forest', 1],
    // ['Healing Salve', 1],
    ['Ancestral Recall', 1],
    // ['Dark Ritual', 5],
    // ['Lightning Bolt', 2],
    // ['Giant Growth', 2],
    // ['Mox Pearl', 10],
    // ['Mox Sapphire', 10],
    // ['Mox Jet', 10],
    // ['Mox Ruby', 10],
    // ['Mox Emerald', 10],
    // ['Phantom Warrior', 1],
    // ['Bog Imp', 1],
    // ['Severed Legion', 1],
    // ['Bladetusk Boar', 1],
    // ['Dauthi Marauder', 1],
    // ['Furtive Homunculus', 1],
    // ['Memnite', 7],
    // ['Giant Spider', 1],
    // ['Cloudkin Seer', 1],
    // ['Radiant Fountain', 1],
    // ['Essence Warden', 1],
    // ['Tattered Mummy', 2],
    // ['Essence Extraction', 1],
    ['Certain Death', 1],
    // ['Dune Beetle', 2],
    // ['Inspiration', 2],
    // ['Drag Under', 2],
    // ['Bloodhunter Bat', 2],
    // ['Sphinx of Magosi', 2],
    // ['Sengir Vampire', 2],
    // ['Sleep Paralysis', 2],
    // ['Ancient Crab', 2],
    // ['Stealer of Secrets', 2],
    // ['Wind Drake', 1],
    // ['Tricks of the Trade', 2],
    ['Raise Dead', 1],
    // ['Coral Merfolk', 1],
    // ['Angler Drake', 2],
    // ['Air Elemental', 2],
    // ['Gravedigger', 2],
    // ['Alley Strangler', 2],
    // ['Cursed Minotaur', 2],
    ['Nightmare', 2],
])

let t2 = makeDeck([
    ['Prodigal Sorcerer', 4],
    ['Ancestral Recall', 5],
    [manaboost, 7],
    [soldier, 7],
    ['Phantom Warrior', 1],
    ['Bog Imp', 1],
    ['Severed Legion', 1],
    ['Bladetusk Boar', 1],
    ['Dauthi Marauder', 1],
    ['Furtive Homunculus', 1],
    ['Memnite', 1],
    ['Giant Spider', 1],
    // ['Darksteel Axe', 4],
    // ['Bonesplitter', 2],
    ['Epic Proportions', 3],
    ['Cloudkin Seer', 4],
    // ['Abrade', 4],
])

let startGame = (deck1, deck2) => {
    let useBothDecks = (deck1, deck2) => {
        let game = new Game("Alex", deck1, 'Bob', deck2);
    
        game.drawUI(document.getElementById('game'));
        
        game.start();
    }

    let useDeck1 = newDeck1 => {
        if (typeof deck2 == 'string') {
            //Load file
            getDeck(deck2, newDeck2 => {
                useBothDecks(newDeck1, newDeck2);
            });
        }
        else {
            useBothDecks(newDeck1, deck2);
        }
    }

    if (typeof deck1 == 'string') {
        //Load file
        getDeck(deck1, newDeck1 => {
            useDeck1(newDeck1);
        });
    }
    else {
        useDeck1(deck1);
    }
}

// Replace each deck name with the URL of the decklist (as a TXT file)
startGame('/Magic-the-Gathering-Simulator/decks/starter_deck1.txt', '/Magic-the-Gathering-Simulator/decks/test_deck1.txt');
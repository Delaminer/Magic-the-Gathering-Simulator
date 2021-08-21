const Database = {};

Database['Healing Salve'] = ['Healing Salve', '{W}', 'Instant', '', 
    'Choose one — \n - Target player gains 3 life.\n - Prevent the next 3 damage that would be dealt to any target this turn.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/0/f/0ff82aba-9022-4eff-a6dc-67365360d646.jpg?1561771079',
    choice: {choiceCount: 1, command: 'Chose one.', options: 
        ['Target player gains 3 life.', 'Prevent the next 3 damage that would be dealt to any target this turn.']},
    abilities: [
    //Give 3 life to a player
    new SpellAbility({
        //Target: a player
        targets: ['Player'],
        //When activated, target player draws three cards
        activate: (card, targets) => {
            targets[0].gainLife(3, {type: 'spell', card: card}, true);
        },
    }),
    //Prevent the next 3 damage dealt to any target this turn
    new SpellAbility({
        //Target: anything
        targets: ['Any'],
        //When activated, give the target 3 prevention (until end of turn)
        activate: (card, targets) => {
            targets[0].damagePrevention += 3;
            
            //Remove effect at the end of the turn
            targets[0].endOfTurnEffects.push(() => {
                //Cannot be negative, so cap it at 0
                targets[0].damagePrevention = Math.max(targets[0].damagePrevention - 3, 0);
            })
        },
    }),
]}];
Database['Ancestral Recall'] = ['Ancestral Recall', '{U}', 'Instant', '', 'Target player draws three cards.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/7/0/70e7ddf2-5604-41e7-bb9d-ddd03d3e9d0b.jpg?1559591549',
    abilities: [
    //Target player draws three cards
    new SpellAbility({
        //Target: a player
        targets: ['Player'],
        //When activated, target player draws three cards
        activate: (card, targets) => {
            targets[0].draw(3);
        },
    }),
]}];
Database['Dark Ritual'] = ['Dark Ritual', '{B}', 'Instant', '', 'Add {B}{B}{B} to your mana pool.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/e/b/ebb6664d-23ca-456e-9916-afcd6f26aa7f.jpg?1559591495',
    abilities: [
    //Add 3 black mana to your mana pool
    (card) => {
        card.player.mana['black'] += 3;
        card.player.updateMana();
    }
]}];
Database['Lightning Bolt'] = ['Lightning Bolt', '{R}', 'Instant', '', 'Lightning Bolt deals 3 damage to any target.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/e/3/e3285e6b-3e79-4d7c-bf96-d920f973b122.jpg?1562442158',
    abilities: [
    //Deal three damage to any target
    new SpellAbility({
        //Target: anything
        targets: ['Any'],
        //When activated, deal 3 damage to the target
        activate: (card, targets) => {
            targets[0].dealDamage(3, {type: 'spell', card: card}, true);
        },
    }),
]}];
Database['Giant Growth'] = ['Giant Growth', '{G}', 'Instant', '', 'Target creature gets +3/+3 until end of turn.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/6/b/6b712e6e-eb48-4a71-b95d-ce343966b236.jpg?1562436546',
    abilities: [
    //Deal three damage to any target
    new SpellAbility({
        //Target: a player
        targets: ['Creature'],
        //When activated, target creature gets +3/+3
        activate: (card, targets) => {
            targets[0].untilEndOfTurnEffects.push({powerChange: 3, toughnessChange: 3});
            //Update everything
            targets[0].player.game.update();
        },
    }),
]}];
Database['Mox Pearl'] = ['Mox Pearl', '{0}', 'Artifact', '', '{T}: Add {W}.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/e/d/ed0216a0-c5c9-4a99-b869-53e4d0256326.jpg?1614638847',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one white mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['white']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Mox Sapphire'] = ['Mox Sapphire', '{0}', 'Artifact', '', '{T}: Add {U}.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/e/a/ea1feac0-d3a7-45eb-9719-1cdaf51ea0b6.jpg?1614638862',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one blue mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['blue']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Mox Jet'] = ['Mox Jet', '{0}', 'Artifact', '', '{T}: Add {B}.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/5/f/5f6927e1-c580-483a-8e2a-6e2deb74800e.jpg?1614638844',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one black mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['black']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Mox Ruby'] = ['Mox Ruby', '{0}', 'Artifact', '', '{T}: Add {R}.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/4/5/45fd6e91-df76-497f-b642-33dc3d5f6a5a.jpg?1614638852',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one red mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['red']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Mox Emerald'] = ['Mox Emerald', '{0}', 'Artifact', '', '{T}: Add {G}.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/a/c/aced2c55-7543-4076-bcdd-36c4d649b8ae.jpg?1614638841',
    abilities: [
    new ManaAbility({
        //Mana ability: Add one green mana to your mana pool
        cost: { tap: true },
        activate: (card) => {
            card.player.mana['green']++;
            card.player.updateMana();
        },
    }),
]}];
Database['Honor of the Pure'] = ['Honor of the Pure', '{1}{W}', 'Enchantment', '', 'White creatures you control get +1/+1.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/6/5/650a6831-c352-4ca7-9f8f-43ea99a1cf33.jpg?1562645338',
    abilities: [
    {
        //Boost white creatures that you control

        //This is static
        type: 'static',
        //Must be a creature, must be white, and you must be controlling it
        valid: (card, sourceCard) => 
            card.types.includes('Creature') && card.colors.includes('white') && sourceCard.player === card.player && 
            card.location == Zone.Battlefield && sourceCard.location == Zone.Battlefield,
        //Effect: boost power by 1, boost toughness by 1
        effect: {
            powerChange: 1,
            toughnessChange: 1,
        },
    }
]}];
Database['Prodigal Sorcerer'] = ['Prodigal Sorcerer', '{2}{U}', 'Creature', 'Human Wizard', 
'{T}: Prodigal Sorcerer deals 1 damage to any target.', {power: 1, toughness: 1, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/5/0/50aef269-55f9-4d84-8bc5-29e794297f11.jpg?1580014085',
    abilities: [
    new ActivatedAbility({
        //Tapping ability:
        //T: Deal 1 damage to any target
        text: 'Prodigal Sorcerer deals 1 damage to any target.',
        //The only cost is to tap this creature
        cost: { tap: true },
        //Requires 1 target (a creature)
        targets: ['Any'],
        //When activated, deal 1 damage to the target
        activate: (card, targets) => {
            targets[0].dealDamage(1, {type: 'activated-ability', card: card}, true);
        },
    }),
]}];
Database['Kari Zev, Skyship Raider'] = ['Kari Zev, Skyship Raider', '{1}{R}', 'Creature', 'Human Pirate', 
'First strike, menace\n' + 'Whenever Kari Zev, Skyship Raider attacks, create Ragavan, a legendary 2/1 red Monkey creature token. '+
'Ragavan enters the battlefield tapped and attacking. Exile that token at end of combat.', {
    supertypes: 'Legendary', power: 1, toughness: 3, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/7/2/72495879-39ce-449d-ad2f-ef32ea46f3aa.jpg?1576381833', abilities: [],
}];

Database['Plains'] = ['Plains', '', 'Land', 'Plains', '{W}', {supertypes: 'Basic', 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/0/d/0d4e5bc1-f0c3-4ea7-a549-c36d932103b1.jpg?1594737777', 
}];
Database['Island'] = ['Island', '', 'Land', 'Island', '{U}', {supertypes: 'Basic', 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/f/c/fc9a66a1-367c-4035-a22e-00fab55be5a0.jpg?1594737796', 
}];
Database['Swamp'] = ['Swamp', '', 'Land', 'Swamp', '{B}', {supertypes: 'Basic', 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/3/0/30b3d647-3546-4ade-b395-f2370750a7a6.jpg?1594737824', 
}];
Database['Mountain'] = ['Mountain', '', 'Land', 'Mountain', '{R}', {supertypes: 'Basic', 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/b/9/b92c8925-ecfc-4ece-b83a-f12e98a938ab.jpg?1594737848', 
}];
Database['Forest'] = ['Forest', '', 'Land', 'Forest', '{G}', {supertypes: 'Basic', 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/a/4/a4df3e89-610c-4f42-a93a-e694342307cc.jpg?1594737893', 
}];
Database['Falkenrath Reaver'] = ['Falkenrath Reaver', '{1}{R}', 'Creature', 'Vampire', '', {
    power: 2, toughness: 2, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/d/7/d7b5913e-a103-4e4a-9281-8b88c1fb746e.jpg?1562201358',
}];
Database['Stone Rain'] = ['Stone Rain', '{2}{R}', 'Sorcery', '', 'Destroy target land.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/d/2/d2334c10-fa96-4f8e-8187-c7ecc00cbac8.jpg?1562742139',
    abilities: [
    //Destroy a land
    new SpellAbility({
        //Target: a land
        targets: ['Land'],
        //When activated, deal 3 damage to the target
        activate: (card, targets) => {
            targets[0].destroy({type: 'destroy', card: card}, true);
        },
    }),
]}];
Database['Abrade'] = ['Abrade', '{1}{R}', 'Instant', '', 
'Choose one — \n - Abrade deals 3 damage to target creature.\n - Destroy target artifact.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/d/2/d27d5b87-6dfc-4b99-822b-f6f8489ad275.jpg?1608912224',
    choice: {choiceCount: 1, command: 'Choose one.', options:
        ['Abrade deals 3 damage to target creature.', 'Destroy target artifact.']},
    abilities: [
    //Deal 3 damage to a creature
    new SpellAbility({
        targets: ['Creature'],
        activate: (card, targets) => {
            targets[0].dealDamage(3, {type: 'spell', card: card}, true);
        },
    }),
    //Destroy an artifact
    new SpellAbility({
        targets: ['Artifact'],
        activate: (card, targets) => {
            targets[0].destroy({type: 'destroy', card: card}, true);
        },
    }),
]}];
Database['Darksteel Axe'] = ['Darksteel Axe', '{1}', 'Artifact', 'Equipment', 
    'Indestructible\nEquipped creature gets +2/+0.\nEquip {2}', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/4/d/4d6bfe57-872d-4f69-bff5-a3f2584d6e0a.jpg?1599709024',
    abilities: [
        //It has indestructible
        new KeywordAbility(Keyword.Indestructible),
        //Equip for 2, it gives the creature +2/+0
        ...Equip({ mana: '2' }, { powerChange: 2 }),
]}];
Database['Bonesplitter'] = ['Bonesplitter', '{1}', 'Artifact', 'Equipment', 
    'Equipped creature gets +2/+0.\nEquip {1}', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/6/9/690972a8-72df-4050-a353-16e45589167c.jpg?1608917758',
    abilities: [
        //Equip for 1, it gives the creature +2/+0
        ...Equip({ tap: true }, { powerChange: 2 }),
]}];
Database['Savannah Lions'] = ['Savannah Lions', '{W}', 'Creature', 'Cat', '', {power: 2, toughness: 1, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/a/9/a9757246-e782-4d7a-8273-d9efe284edaf.jpg?1562439539',
}];
Database['Epic Proportions'] = ['Epic Proportions', '{4}{G}{G}', 'Enchantment', 'Aura', 
    'Flash\nEnchant creature\nEnchanted creature gets +5/+5 and has trample.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/7/4/7412373a-da0f-4bec-866c-5e1087f49914.jpg?1592710875',
    abilities: [
        //This has flash
        new KeywordAbility(Keyword.Flash),
        //Enchanted creature gets +5/+5 and trample
        ...EnchantmentAura('Creature', { powerChange: 5, toughnessChange: 5, [Keyword.Trample]: true, }),
]}];
Database['Phantom Warrior'] = ['Phantom Warrior', '{1}{U}{U}', 'Creature', 'Illusion Warrior', 'Phantom Warrior can\'t be blocked.', 
    {power: 2, toughness: 2, abilities: [new KeywordAbility(Keyword.Unblockable),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/9/3/93044619-0c1e-4e42-a654-a8869c73f8c5.jpg?1562924674',
}];
Database['Bog Imp'] = ['Bog Imp', '{1}{B}', 'Creature', 'Imp', 'Flying', {power: 1, toughness: 1, abilities: [new KeywordAbility(Keyword.Flying),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/8/4/846f5cda-3d93-4dfd-b1c3-1dff7b814d98.jpg?1562737863',
}];
Database['Giant Spider'] = ['Giant Spider', '{3}{G}', 'Creature', 'Spider', 'Reach', {power: 2, toughness: 4, 
    abilities: [new KeywordAbility(Keyword.Reach),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/8/0/80996b0d-cd44-445e-96de-677e0018255c.jpg?1562302899',
}];
Database['Severed Legion'] = ['Severed Legion', '{1}{B}{B}', 'Creature', 'Zombie', 'Fear', {power: 2, toughness: 2, 
    abilities: [new KeywordAbility(Keyword.Fear),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/8/2/82633f38-5af1-429e-8c9d-db536af85309.jpg?1562550727',
}];
Database['Bladetusk Boar'] = ['Bladetusk Boar', '{3}{R}', 'Creature', 'Boar', 'Intimidate', {power: 3, toughness: 2, 
    abilities: [new KeywordAbility(Keyword.Intimidate),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/5/f/5f157fb0-81ac-4108-aafc-7ee81df965a9.jpg?1593095917', 
}];
Database['Dauthi Marauder'] = ['Dauthi Marauder', '{2}{B}', 'Creature', 'Dauthi Minion', 'Shadow', {power: 3, toughness: 1, 
    abilities: [new KeywordAbility(Keyword.Shadow),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/0/1/01963759-c47e-408a-8de8-924224031c8a.jpg?1562428160', 
}];
Database['Furtive Homunculus'] = ['Furtive Homunculus', '{1}{U}', 'Creature', 'Homunculus', 'Skulk', {power: 2, toughness: 1, 
    abilities: [new KeywordAbility(Keyword.Skulk),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/f/3/f376ec9b-48ac-4ed7-bfa2-60e9dca32dd7.jpg?1576384082', 
}];
Database['Memnite'] = ['Memnite', '{0}', 'Artifact Creature', 'Construct', '', {power: 1, toughness: 1, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/4/6/469cc4e0-49c0-4009-97ea-28e44addec69.jpg?1562817049', 
}];
Database['Cloudkin Seer'] = ['Cloudkin Seer', '{2}{U}', 'Creature', 'Elemental Wizard', 
    'Flying\nWhen Cloudkin Seer enters the battlefield, draw a card.', {power: 2, toughness: 1, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/e/2/e2111753-a930-403f-9d94-a86dfcb069da.jpg?1592516341',
    abilities: [new KeywordAbility(Keyword.Flying), {
        type: 'triggered',
        text: 'When Cloudkin Seer enters the battlefield, draw a card.',
        event: 'enter-battlefield', 
        valid: (card, sourceCard) => card == sourceCard,
        targets: [],
        activate: (card, targets) => {
            card.player.draw(1);
        },
    }]
}];
Database['Radiant Fountain'] = ['Radiant Fountain', '', 'Land', '', 
    'When Radiant Fountain enters the battlefield, you gain 2 life.\n{T}: Add {C}.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/7/e/7ee5e77f-ca43-480d-ac37-48336d3bf044.jpg?1625980789',
    abilities: [
        new ManaAbility({
            cost: { tap: true },
            activate: (card) => {
                card.player.mana['colorless']++;
                card.player.updateMana();
            },
        }),
        {
            type: 'triggered',
            text: 'When Radiant Fountain enters the battlefield, you gain 2 life.',
            event: 'enter-battlefield', 
            valid: (card, sourceCard) => card == sourceCard,
            targets: [],
            activate: (card, targets) => {
                card.player.gainLife(2, {card: card, type: 'ability'}, true);
            },
        }
]}];
Database['Essence Warden'] = ['Essence Warden', '{G}', 'Creature', 'Elf Shaman', 
    'Whenever another creature enters the battlefield, you gain 1 life.', {power: 1, toughness: 1, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/3/1/31ca84d1-30a6-432b-966c-089fb6652a89.jpg?1592672942',
    abilities: [{
        type: 'triggered',
        text: 'Whenever another creature enters the battlefield, you gain 1 life.',
        event: 'enter-battlefield', 
        valid: (card, sourceCard) => sourceCard.location == Zone.Battlefield && card != sourceCard && card.types.includes('Creature'),
        targets: [],
        activate: (card, targets) => {
            card.player.gainLife(1, {card: card, type: 'ability'}, true);
        },
    }]
}];
Database['Impact Tremors'] = ['Impact Tremors', '{1}{R}', 'Enchantment', '', 
    'Whenever a creature enters the battlefield under your control, Impact Tremors deals 1 damage to each opponent.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/5/6/56fb4035-197b-4d28-9bf7-bb62c304067e.jpg?1562786545',
    abilities: [{
        type: 'triggered',
        text: 'Whenever a creature enters the battlefield under your control, Impact Tremors deals 1 damage to each opponent.',
        event: 'enter-battlefield', 
        valid: (card, sourceCard) => sourceCard.location == Zone.Battlefield && 
            card.player == sourceCard.player && card.types.includes('Creature'),
        targets: [],
        activate: (card, targets) => {
            //Get opponents
            card.player.game.players.filter(player => player != card.player)
            //Apply 1 damage to each
            .forEach(player => player.dealDamage(1, {card: card, type: 'ability'}, true));
        },
    }]
}];

Database['Tattered Mummy'] = ['Tattered Mummy', '{1}{B}', 'Creature', 'Zombie Jackal', 
    'When Tattered Mummy dies, each opponent loses 2 life.', {power: 1, toughness: 2, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/7/f/7f9a5267-eb90-43bc-bf92-fcfb06821bae.jpg?1561792134',
    abilities: [{
        type: 'triggered',
        text: 'When Tattered Mummy dies, each opponent loses 2 life.',
        event: 'death',
        valid: (card, sourceCard) => card == sourceCard,
        targets: [],
        activate: (card, targets) => {
            //Get opponents
            card.player.game.players.filter(player => player != card.player)
            //Each opponent loses 2 life
            .forEach(player => player.loseLife(2, {card: card, type: 'ability'}, true));
        },
    }]
}];
Database['Essence Extraction'] = ['Essence Extraction', '{1}{B}{B}', 'Instant', '', 
    'Essence Extraction deals 3 damage to target creature and you gain 3 life.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/d/7/d7693c10-5ebb-4896-bb60-63d03577dd60.jpg?1576381622',
    abilities: [
    //Deal three damage to target creature and gain 3 life
    new SpellAbility({
        //Target: anything
        targets: ['Creature'],
        //When activated, deal 3 damage to the target
        activate: (card, targets) => {
            //Deal damage
            targets[0].dealDamage(3, {type: 'spell', card: card}, true);
            //Gain life
            card.player.gainLife(3, {type: 'spell', card: card}, true);
        },
    }),
]}];
Database['Certain Death'] = ['Certain Death', '{5}{B}', 'Sorcery', '', 
    'Destroy target creature. Its controller loses 2 life and you gain 2 life.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/c/6/c67784b3-eb55-452e-b965-f63220b88896.jpg?1576384279',
    abilities: [
    //Deal three damage to target creature and gain 3 life
    new SpellAbility({
        //Target: anything
        targets: ['Creature'],
        //When activated, deal 3 damage to the target
        activate: (card, targets) => {
            //Destroy the creature
            targets[0].destroy({type: 'destroy', card: card}, true);
            //Its controller loses 2 life
            targets[0].player.loseLife(2, {type: 'spell', card: card}, true);
            //You gain 2 life
            card.player.gainLife(2, {type: 'spell', card: card}, true);
        },
    }),
]}];
Database['Dune Beetle'] = ['Dune Beetle', '{1}{B}', 'Creature', 'Insect', '', {power: 1, toughness: 4, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/9/2/923cb904-c725-4d57-bc17-7aa87a7cd8e0.jpg?1543675266',
}];
Database['Inspiration'] = ['Inspiration', '{3}{U}', 'Instant', '', 'Target player draws two cards.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/9/5/95233b5e-9401-4d6d-8ec4-959ca22270ff.jpg?1562199546',
    abilities: [
    //Target player draws two cards
    new SpellAbility({
        targets: ['Player'],
        activate: (card, targets) => {
            targets[0].draw(2);
        },
    }),
]}];
Database['Drag Under'] = ['Drag Under', '{2}{U}', 'Sorcery', '', 'Return target creature to its owner\'s hand.\nDraw a card.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/0/d/0dffa444-92ff-41d8-8b55-8896808bbfab.jpg?1576384096',
    abilities: [
    //Return target creature to its owner's hand and draw a card
    new SpellAbility({
        targets: ['Creature'],
        activate: (card, targets) => {
            //Return target creature to its owner's hand
            targets[0].moveLocation(Zone.Hand, true, true);
            //Draw a card
            card.player.draw(1);
        },
    }),
]}];
Database['Bloodhunter Bat'] = ['Bloodhunter Bat', '{3}{B}', 'Creature', 'Bat', 
    'Flying\nWhen Bloodhunter Bat enters the battlefield, target player loses 2 life and you gain 2 life.', {power: 2, toughness: 2, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/3/d/3ded635c-ab7c-4bb4-a771-481c4d66381e.jpg?1562198243',
    abilities: [new KeywordAbility(Keyword.Flying), {
        type: 'triggered',
        text: 'When Bloodhunter Bat enters the battlefield, target player loses 2 life and you gain 2 life.',
        event: 'enter-battlefield',
        valid: (card, sourceCard) => card == sourceCard,
        targets: ['Player'],
        activate: (card, targets) => {
            //Target player loses 2 life
            targets[0].loseLife(2, {card: card, type: 'ability'}, true);
            //You gain 2 life
            card.player.gainLife(2, {card: card, type: 'ability'}, true);
        },
    }]
}];
Database['Sphinx of Magosi'] = ['Sphinx of Magosi', '{3}{U}{U}{U}', 'Creature', 'Sphinx', 
    'Flying\n{2}{U}: Draw a card, then put a +1/+1 counter on Sphinx of Magosi.', {power: 6, toughness: 6, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/a/2/a2b4f70d-e922-4ecb-9d5a-6253f7a7716c.jpg?1562199986',
    abilities: [new KeywordAbility(Keyword.Flying), new ActivatedAbility({
            text: 'Draw a card, then put a +1/+1 counter on Sphinx of Magosi.',
            cost: { mana: '{2}{U}' },
            targets: [],
            activate: (card, targets) => {
                //Draw a card
                card.player.draw(1);
                //Put a +1/+1 counter on this
                card.permanentEffects.push(PlusOnePlusOneCounter());
                //Update everything
                card.player.game.update();
            },
        }),
    ]
}];
Database['Sengir Vampire'] = ['Sengir Vampire', '{3}{B}{B}', 'Creature', 'Vampire', 
    'Flying\nWhenever a creature dealt damage by Sengir Vampire this turn dies, put a +1/+1 counter on Sengir Vampire.', {power: 4, toughness: 4, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/5/f/5f747a37-b4bb-40bf-ae59-6d865d60cede.jpg?1573510450',
    abilities: [new KeywordAbility(Keyword.Flying), {
        type: 'triggered',
        text: 'Whenever a creature dealt damage by Sengir Vampire this turn dies, put a +1/+1 counter on Sengir Vampire.',
        event: 'death',
        valid: (card, sourceCard) => sourceCard.location == Zone.Battlefield && sourceCard.turnInformation.damageDealt.includes(card),
        targets: [],
        activate: (card, targets) => {
            //Put a +1/+1 counter on this
            card.permanentEffects.push(PlusOnePlusOneCounter());
        },
    },,
    ]
}];
Database['Sleep Paralysis'] = ['Sleep Paralysis', '{3}{U}', 'Enchantment', 'Aura', 
    'Enchant creature\nWhen Sleep Paralysis enters the battlefield, tap enchanted creature.'+
    '\nEnchanted creature doesn\' untap during its controller\'s untap step.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/2/b/2babef35-27ab-45aa-88cd-f21dccae5125.jpg?1592516504',
    abilities: [
        //Enchanted creature doesn't untap
        ...EnchantmentAura('Creature', { cancelUntap: true }),
        //On ETB, tap the creature 
        {
            type: 'triggered',
            text: 'When Sleep Paralysis enters the battlefield, tap enchanted creature.',
            event: 'enter-battlefield',
            valid: (card, sourceCard) => card == sourceCard,
            targets: [],
            activate: (card, targets) => {
                let enchantedCreature = card.attached;
                //Make sure it is still valid
                if (enchantedCreature.location == Zone.Battlefield) {
                    //Tap it
                    enchantedCreature.tapped = true;
                    enchantedCreature.element.classList.add('tapped');
                }
            },
        }
]}];
Database['Ancient Crab'] = ['Ancient Crab', '{1}{U}{U}', 'Creature', 'Crab', '', {power: 1, toughness: 5, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/7/c/7c2ca68b-15fb-4691-b549-268df92ca413.jpg?1543674868',
}];
Database['Untamed Hunger'] = ['Untamed Hunger', '{2}{B}', 'Enchantment', 'Aura', 
    'Enchant creature\nEnchanted creature gets +2/+1 and has menace.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/c/a/caccbba0-80b1-461c-b548-33d7f3a48342.jpg?1562200901',
    abilities: [
        //Enchanted creature gets +2/+1 and menace
        ...EnchantmentAura('Creature', { powerChange: 2, toughnessChange: 1, [Keyword.Menace]: true, }),
]}];
Database['Nimble Innovator'] = ['Nimble Innovator', '{3}{U}', 'Creature', 'Vedalken Artificer', 
    'When Nimble Innovator enters the battlefield, draw a card.', {power: 2, toughness: 2, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/f/6/f6dbf333-23b5-47d9-9e55-1e8fbd5a72cb.jpg?1576381340',
    abilities: [{
        type: 'triggered',
        text: 'When Nimble Innovator enters the battlefield, draw a card.',
        event: 'enter-battlefield', 
        valid: (card, sourceCard) => card == sourceCard,
        targets: [],
        activate: (card, targets) => {
            card.player.draw(1);
        },
    }]
}];
Database['Stealer of Secrets'] = ['Stealer of Secrets', '{2}{U}', 'Creature', 'Human Rogue', 
    'Whenever Stealer of Secrets deals combat damage to a player, draw a card.', {power: 2, toughness: 2, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/0/2/02acbe9b-fac7-4135-8318-5f3dc93a9e58.jpg?1562197272',
    abilities: [{
        type: 'triggered',
        text: 'Whenever Stealer of Secrets deals combat damage to a player, draw a card.',
        event: 'combat-damage-player', 
        valid: (card, sourceCard) => card == sourceCard,
        targets: [],
        activate: (card, targets) => {
            card.player.draw(1);
        },
    }]
}];
Database['Wind Drake'] = ['Wind Drake', '{2}{U}', 'Creature', 'Drake', 'Flying', {power: 2, toughness: 2, 
    abilities: [new KeywordAbility(Keyword.Flying),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/5/e/5e227a63-abea-494e-9d66-6ff0a3da14ca.jpg?1576381503',
}];
Database['Tricks of the Trade'] = ['Tricks of the Trade', '{3}{U}', 'Enchantment', 'Aura', 
    'Enchant creature\nEnchanted creature gets +2/+0 and can\'t be blocked.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/f/7/f7860cf3-c3ea-4055-8c95-6d1c8d50e69d.jpg?1562201921',
    abilities: [
        //Enchanted creature gets +2/+0 and cant be blocked
        ...EnchantmentAura('Creature', { powerChange: 2, toughnessChange: 0, [Keyword.Unblockable]: true, }),
]}];
Database['Raise Dead'] = ['Raise Dead', '{B}', 'Sorcery', '', 'Return target creature card from your graveyard to your hand.', {
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/4/9/4950c3c2-80c1-4447-ac38-cf40f76b9545.jpg?1562198355',
    abilities: [
    //Return target creature card from your graveyard to your hand
    new SpellAbility({
        targets: ['ZoneGraveyard Creature'],
        activate: (card, targets) => {
            //Return target creature card from your graveyard to your hand
            targets[0].moveLocation(Zone.Hand, true, true);
        },
    }),
]}];
Database['Coral Merfolk'] = ['Coral Merfolk', '{1}{U}', 'Creature', 'Merfolk', '', {power: 2, toughness: 1, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/6/3/63b2cdfe-31ef-43d7-b4ca-e2505d613244.jpg?1562198944',
}];
Database['Angler Drake'] = ['Angler Drake', '{4}{U}{U}', 'Creature', 'Drake', 
    'Flying\nWhen Angler Drake enters the battlefield, you may return target creature to its owner’s hand.', {power: 4, toughness: 4, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/d/1/d14c753e-c5bf-4c34-b408-ac367b6ca6ab.jpg?1543674875',
    abilities: [new KeywordAbility(Keyword.Flying), {
        type: 'triggered',
        optional: true,
        text: 'When Angler Drake enters the battlefield, you may return target creature to its owner’s hand.',
        event: 'enter-battlefield', 
        valid: (card, sourceCard) => card == sourceCard,
        targets: ['Creature'],
        activate: (card, targets) => {
            //Return target creature to its owner's hand
            targets[0].moveLocation(Zone.Hand, true, true);
        },
    }]
}];
Database['Air Elemental'] = ['Air Elemental', '{3}{U}{U}', 'Creature', 'Elemental', 'Flying', {power: 4, toughness: 4, abilities: [
    new KeywordAbility(Keyword.Flying),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/a/2/a27efec0-40c4-48bc-a21a-3af28a6529b5.jpg?1592516263',
}];
Database['Gravedigger'] = ['Gravedigger', '{3}{B}', 'Creature', 'Zombie', 
    'When Gravedigger enters the battlefield, you may return target creature card from your graveyard to your hand.', {power: 2, toughness: 2, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/0/f/0fb714a0-e61b-4ccf-8de6-3a6bf87c8315.jpg?1592516699',
    abilities: [{
        type: 'triggered',
        optional: true,
        text: 'When Gravedigger enters the battlefield, you may return target creature card from your graveyard to your hand.',
        event: 'enter-battlefield', 
        valid: (card, sourceCard) => card == sourceCard,
        targets: ['ZoneGraveyard Creature'],
        activate: (card, targets) => {
            //Return target creature card from your graveyard to your hand
            targets[0].moveLocation(Zone.Hand, true, true);
        },
    }]
}];
Database['Alley Strangler'] = ['Alley Strangler', '{2}{B}', 'Creature', 'Aetherborn Rogue', 'Menace', {
    power: 2, toughness: 3, abilities: [new KeywordAbility(Keyword.Menace),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/a/1/a131d558-5f6b-448b-a378-1882e2d02bd2.jpg?1576381609',
}];
Database['Cursed Minotaur'] = ['Cursed Minotaur', '{2}{B}', 'Creature', 'Zombie Minotaur', 'Menace', {
    power: 3, toughness: 2, abilities: [new KeywordAbility(Keyword.Menace),],
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/a/3/a3990d2f-39d9-49f9-936f-1d40adcf295c.jpg?1543675233',
}];
Database['Nightmare'] = ['Nightmare', '{5}{B}', 'Creature', 'Nightmare Horse', 
    'Flying\nNightmare’s power and toughness are each equal to the number of Swamps you control.', {
    power: card => card.player.lands.filter(land => land.subtypes.includes('Swamp')).length,
    toughness: card => card.player.lands.filter(land => land.subtypes.includes('Swamp')).length, 
    imageURL: 'https://c1.scryfall.com/file/scryfall-cards/large/front/0/5/052022ff-795f-4f50-a45c-91cf8be9fbe9.jpg?1562197283',
    abilities: [new KeywordAbility(Keyword.Flying), ]
}];
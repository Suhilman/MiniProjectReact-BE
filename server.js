const express = require('express');
const axios = require('axios');
const cors = require('cors'); 

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const isPrime = (num) => {
    if (num <= 1) return false;
    for (let i = 2, s = Math.sqrt(num); i <= s; i++)
        if (num % i === 0) return false;
    return true;
};

const fibonacci = (n) => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
};

app.get('/pokemon-list', async (req, res) => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
        const results = response.data.results;
        
        const pokemonData = await Promise.all(
            results.map(async (pokemon, index) => {
                const pokemonDetail = await axios.get(pokemon.url);
                return {
                    id: index + 1,
                    name: pokemon.name,
                    image: pokemonDetail.data.sprites.front_default,
                    types: pokemonDetail.data.types.map(type => type.type.name).join(', '),
                    moves: pokemonDetail.data.moves.slice(0, 10).map(move => move.move.name).join(', '),
                };
            })
        );
        res.json(pokemonData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch Pokemon data' });
    }
});

app.post('/catch-pokemon', (req, res) => {
    const isSuccess = Math.random() < 0.5;
    res.json({ success: isSuccess });
});

app.post('/release-pokemon', (req, res) => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const canRelease = isPrime(randomNumber);
    res.json({ success: canRelease, number: randomNumber });
});

app.post('/rename-pokemon', (req, res) => {
    const { name, renameCount } = req.body;
    const newName = `${name}-${fibonacci(renameCount)}`;
    res.json({ newName });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for votes
const votes = [];

app.post('/api/submit', (req, res) => {
    // New data structure destructuring
    const { name, choices, veto, confidence, comments } = req.body;
    
    // Basic validation
    if (!name || !choices || !choices.first || !choices.second || !choices.third || !confidence) {
        return res.status(400).json({ error: 'Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.' });
    }

    const newVote = {
        name,
        choices: {
            first: choices.first,   // 3 Points
            second: choices.second, // 2 Points
            third: choices.third    // 1 Point
        },
        veto: veto || null,         // Filter out
        confidence: confidence,     // Avg skill check
        comments: comments || '',
        timestamp: new Date().toISOString()
    };

    votes.push(newVote);
    
    console.log('--- NEW VOTE ---');
    console.log(JSON.stringify(newVote, null, 2));
    console.log(`Total Votes Collected: ${votes.length}`);

    res.json({ message: 'OK', vote: newVote });
});

app.get('/api/votes', (req, res) => {
    res.json(votes);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
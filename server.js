require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Define Mongoose Schema
const voteSchema = new mongoose.Schema({
    name: String,
    choices: {
        first: String,
        second: String,
        third: String
    },
    veto: String,
    confidence: Number,
    comments: String,
    timestamp: { type: Date, default: Date.now }
});

const Vote = mongoose.model('Vote', voteSchema);

app.post('/api/submit', async (req, res) => {
    // New data structure destructuring
    const { name, choices, veto, confidence, comments } = req.body;
    
    // Basic validation
    if (!name || !choices || !choices.first || !choices.second || !choices.third || !confidence) {
        return res.status(400).json({ error: 'Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία.' });
    }

    const newVote = new Vote({
        name,
        choices: {
            first: choices.first,   // 3 Points
            second: choices.second, // 2 Points
            third: choices.third    // 1 Point
        },
        veto: veto || null,         // Filter out
        confidence: confidence,     // Avg skill check
        comments: comments || ''
    });

    try {
        await newVote.save();
        console.log('--- NEW VOTE SAVED ---');
        console.log(JSON.stringify(newVote, null, 2));
        
        const count = await Vote.countDocuments();
        console.log(`Total Votes Collected: ${count}`);

        res.json({ message: 'OK', vote: newVote });
    } catch (error) {
        console.error('Error saving vote:', error);
        res.status(500).json({ error: 'Σφάλμα κατά την αποθήκευση της ψήφου.' });
    }
});

app.get('/api/votes', async (req, res) => {
    try {
        const votes = await Vote.find();
        res.json(votes);
    } catch (error) {
        console.error('Error fetching votes:', error);
        res.status(500).json({ error: 'Σφάλμα κατά τη φόρτωση των ψήφων.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
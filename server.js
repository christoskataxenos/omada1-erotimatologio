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

// --- MONGODB CONNECTION SETUP (Serverless Optimized) ---
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000 // Timeout faster if DB is unreachable
        });
        isConnected = db.connections[0].readyState;
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error; // Re-throw to handle in endpoints
    }
};

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
    try {
        await connectDB(); // Ensure DB is connected
        
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
    
        await newVote.save();
        console.log('--- NEW VOTE SAVED ---');
        
        res.json({ message: 'OK', vote: newVote });

    } catch (error) {
        console.error('Error in /api/submit:', error);
        res.status(500).json({ error: 'Σφάλμα κατά την αποθήκευση της ψήφου.' });
    }
});

app.get('/api/votes', async (req, res) => {
    try {
        await connectDB(); // Ensure DB is connected
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
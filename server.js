const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const mentees = [];

app.get('/api/mentees', (_req, res) => {
    res.status(200).json(mentees);
});

app.post('/api/sync', (req, res) => {
    const { name, email, stats, timestamp } = req.body;

    console.log("\n--- 🟢 NEW SYNC RECEIVED ---");
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log("Stats Array:");
    console.dir(stats, { depth: null });
    console.log("----------------------------\n");

    if (!name || !email || !timestamp) {
        return res.status(400).json({ message: 'Missing required fields: name, email, timestamp' });
    }

    const menteeRecord = {
        name,
        email,
        timestamp,
        stats: Array.isArray(stats) ? stats : [],
    };

    const existingIndex = mentees.findIndex((mentee) => mentee.email === email);

    if (existingIndex >= 0) {
        mentees[existingIndex] = menteeRecord;
    } else {
        mentees.push(menteeRecord);
    }

    res.status(200).json({ message: 'Sync successful' });
});

app.listen(3000, () => {
    console.log('Mock backend listening on http://localhost:3000');
});

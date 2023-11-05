const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const path = require('path');

const db = new sqlite3.Database('doublepark.db');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database setup
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, plate TEXT UNIQUE, contact TEXT)");
});

// API routes
app.post('/register', (req, res) => {
    const { plate, contact } = req.body;
    db.run("INSERT INTO users (plate, contact) VALUES (?, ?)", [plate, contact], (err) => {
        if (err) {
            console.error(err.message); // Log the error message for debugging
            res.status(400).json({ error: 'Registration failed!' });
        } else {
            res.json({ message: 'Successfully registered!' });
        }
    });
});

app.get('/search/:plate', (req, res) => {
    db.get("SELECT contact FROM users WHERE plate = ?", [req.params.plate], (err, row) => {
        if (err) {
            console.error(err.message); // Log the error message for debugging
            res.status(500).json({ error: 'Internal server error!' });
        } else if (!row) {
            res.status(404).json({ error: 'Plate not found!' });
        } else {
            res.json({ contact: row.contact });
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Retry connection to MongoDB — useful because mongo container may not be ready instantly
const connectWithRetry = () => {
    mongoose.connect('mongodb://mongo:27017/itemsdb')
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => {
            console.error('MongoDB connection failed, retrying in 5s...', err.message);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

// Schema and Model
const Item = mongoose.model('Item', new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    createdAt: { type: Date, default: Date.now },
}));

// GET all items
app.get('/items', async (req, res) => {
    const items = await Item.find();
    res.json(items);
});

// GET single item by ID
app.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
    } catch {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

// POST create item
app.post('/items', async (req, res) => {
    try {
        const item = await Item.create(req.body);
        res.status(201).json(item);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT update item
app.put('/items/:id', async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json(item);
    } catch {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

// DELETE item
app.delete('/items/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch {
        res.status(400).json({ error: 'Invalid ID' });
    }
});

app.listen(3000, () => console.log('API running on port 3000'));

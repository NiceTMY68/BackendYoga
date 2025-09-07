const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all customers
router.get('/', (req, res) => {
    db.all('SELECT * FROM Customers', [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

// Get a single customer
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM Customers WHERE customerId = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(row);
    });
});

// Create a new customer
router.post('/', (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email) {
        res.status(400).json({ "error": "Name and email are required" });
        return;
    }

    const sql = 'INSERT INTO Customers (name, email, phone) VALUES (?, ?, ?)';
    db.run(sql, [name, email, phone], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ "error": "Email already exists" });
            } else {
                res.status(400).json({ "error": err.message });
            }
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID }
        });
    });
});

// Update a customer
router.put('/:id', (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email) {
        res.status(400).json({ "error": "Name and email are required" });
        return;
    }

    const sql = 'UPDATE Customers SET name = ?, email = ?, phone = ? WHERE customerId = ?';
    db.run(sql, [name, email, phone, req.params.id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ "error": "Email already exists" });
            } else {
                res.status(400).json({ "error": err.message });
            }
            return;
        }
        res.json({
            message: "success",
            changes: this.changes
        });
    });
});

// Delete a customer
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM Customers WHERE customerId = ?', req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

module.exports = router;

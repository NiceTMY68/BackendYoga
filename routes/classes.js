const express = require('express');
const router = express.Router();
const db = require('../database');
const { successResponse, errorResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMetadata } = require('../utils/pagination');

// Get all yoga classes with pagination
router.get('/', (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);
    
    // Get total count
    db.get('SELECT COUNT(*) as total FROM YogaClasses', [], (err, countRow) => {
        if (err) {
            res.status(400).json(errorResponse(err.message));
            return;
        }

        // Get paginated data
        const sql = 'SELECT * FROM YogaClasses LIMIT ? OFFSET ?';
        db.all(sql, [limit, offset], (err, rows) => {
            if (err) {
                res.status(400).json(errorResponse(err.message));
                return;
            }

            const metadata = getPaginationMetadata(countRow.total, page, limit);
            res.json(successResponse({
                items: rows,
                pagination: metadata
            }));
        });
    });
});

// Get a single yoga class
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM YogaClasses WHERE classId = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(row);
    });
});

// Create a new yoga class
router.post('/', (req, res) => {
    const {
        dayOfWeek,
        startTime,
        capacity,
        duration,
        price,
        classType,
        description
    } = req.body;

    if (!dayOfWeek || !startTime || !capacity || !duration || !price || !classType) {
        res.status(400).json({ "error": "Missing required fields" });
        return;
    }

    const sql = `INSERT INTO YogaClasses 
        (dayOfWeek, startTime, capacity, duration, price, classType, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [dayOfWeek, startTime, capacity, duration, price, classType, description],
        function(err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({
                "message": "success",
                "data": { id: this.lastID }
            });
        });
});

// Update a yoga class
router.put('/:id', (req, res) => {
    const {
        dayOfWeek,
        startTime,
        capacity,
        duration,
        price,
        classType,
        description
    } = req.body;

    if (!dayOfWeek || !startTime || !capacity || !duration || !price || !classType) {
        res.status(400).json({ "error": "Missing required fields" });
        return;
    }

    const sql = `UPDATE YogaClasses SET 
        dayOfWeek = ?, 
        startTime = ?,
        capacity = ?,
        duration = ?,
        price = ?,
        classType = ?,
        description = ?,
        updatedAt = CURRENT_TIMESTAMP
        WHERE classId = ?`;

    db.run(sql, [dayOfWeek, startTime, capacity, duration, price, classType, description, req.params.id],
        function(err) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({
                message: "success",
                changes: this.changes
            });
        });
});

// Delete a yoga class
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM YogaClasses WHERE classId = ?', req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// Search classes by day of week
router.get('/search/day/:day', (req, res) => {
    db.all('SELECT * FROM YogaClasses WHERE dayOfWeek = ?', [req.params.day], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all bookings
router.get('/', (req, res) => {
    const sql = `
        SELECT b.*, 
               c.name as customerName, c.email as customerEmail,
               s.sessionDate,
               yc.classType, yc.startTime
        FROM Bookings b
        JOIN Customers c ON b.customerId = c.customerId
        JOIN Sessions s ON b.sessionId = s.sessionId
        JOIN YogaClasses yc ON s.classId = yc.classId`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

// Get a customer's bookings
router.get('/customer/:customerId', (req, res) => {
    const sql = `
        SELECT b.*, 
               s.sessionDate,
               yc.classType, yc.startTime
        FROM Bookings b
        JOIN Sessions s ON b.sessionId = s.sessionId
        JOIN YogaClasses yc ON s.classId = yc.classId
        WHERE b.customerId = ?`;

    db.all(sql, [req.params.customerId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

// Create a new booking
router.post('/', (req, res) => {
    const { sessionId, customerId } = req.body;

    if (!sessionId || !customerId) {
        res.status(400).json({ "error": "Session ID and Customer ID are required" });
        return;
    }

    // First check if the session has available capacity
    const checkCapacitySql = `
        SELECT 
            yc.capacity,
            COUNT(b.bookingId) as currentBookings
        FROM Sessions s
        JOIN YogaClasses yc ON s.classId = yc.classId
        LEFT JOIN Bookings b ON s.sessionId = b.sessionId
        WHERE s.sessionId = ?
        GROUP BY s.sessionId, yc.capacity`;

    db.get(checkCapacitySql, [sessionId], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }

        if (!row) {
            res.status(404).json({ "error": "Session not found" });
            return;
        }

        if (row.currentBookings >= row.capacity) {
            res.status(400).json({ "error": "Session is full" });
            return;
        }

        // If there's capacity, create the booking
        const insertSql = `INSERT INTO Bookings (sessionId, customerId) VALUES (?, ?)`;
        db.run(insertSql, [sessionId, customerId], function(err) {
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
});

// Update booking status
router.put('/:id', (req, res) => {
    const { status } = req.body;

    if (!status) {
        res.status(400).json({ "error": "Status is required" });
        return;
    }

    const sql = `
        UPDATE Bookings SET 
        status = ?,
        updatedAt = CURRENT_TIMESTAMP
        WHERE bookingId = ?`;

    db.run(sql, [status, req.params.id], function(err) {
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

// Cancel booking
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM Bookings WHERE bookingId = ?', req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "booking cancelled", changes: this.changes });
    });
});

module.exports = router;

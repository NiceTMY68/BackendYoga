const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all sessions
router.get('/', (req, res) => {
    const sql = `
        SELECT s.*, c.dayOfWeek, c.startTime, c.classType, t.name as teacherName 
        FROM Sessions s 
        LEFT JOIN YogaClasses c ON s.classId = c.classId
        LEFT JOIN Teachers t ON s.teacherId = t.teacherId`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

// Get a single session
router.get('/:id', (req, res) => {
    const sql = `
        SELECT s.*, c.dayOfWeek, c.startTime, c.classType, t.name as teacherName 
        FROM Sessions s 
        LEFT JOIN YogaClasses c ON s.classId = c.classId
        LEFT JOIN Teachers t ON s.teacherId = t.teacherId
        WHERE s.sessionId = ?`;

    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(row);
    });
});

// Create a new session
router.post('/', (req, res) => {
    const { classId, teacherId, sessionDate, notes } = req.body;

    if (!classId || !sessionDate) {
        res.status(400).json({ "error": "Class ID and session date are required" });
        return;
    }

    const sql = `INSERT INTO Sessions (classId, teacherId, sessionDate, notes) VALUES (?, ?, ?, ?)`;
    db.run(sql, [classId, teacherId, sessionDate, notes], function(err) {
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

// Update a session
router.put('/:id', (req, res) => {
    const { classId, teacherId, sessionDate, notes, status } = req.body;

    if (!classId || !sessionDate) {
        res.status(400).json({ "error": "Class ID and session date are required" });
        return;
    }

    const sql = `
        UPDATE Sessions SET 
        classId = ?,
        teacherId = ?,
        sessionDate = ?,
        notes = ?,
        status = ?,
        updatedAt = CURRENT_TIMESTAMP
        WHERE sessionId = ?`;

    db.run(sql, [classId, teacherId, sessionDate, notes, status, req.params.id], function(err) {
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

// Delete a session
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM Sessions WHERE sessionId = ?', req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// Search sessions by date
router.get('/search/date/:date', (req, res) => {
    const sql = `
        SELECT s.*, c.dayOfWeek, c.startTime, c.classType, t.name as teacherName 
        FROM Sessions s 
        LEFT JOIN YogaClasses c ON s.classId = c.classId
        LEFT JOIN Teachers t ON s.teacherId = t.teacherId
        WHERE date(s.sessionDate) = date(?)`;

    db.all(sql, [req.params.date], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

module.exports = router;

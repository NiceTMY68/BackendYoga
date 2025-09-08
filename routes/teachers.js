const express = require('express');
const router = express.Router();
const db = require('../database');
const { successResponse, errorResponse } = require('../utils/response');
const { getPaginationParams, getPaginationMetadata } = require('../utils/pagination');
const { generateWhereClause, generateOrderClause } = require('../utils/queryHelpers');

// Get all teachers with pagination, sorting and filtering
router.get('/', (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { sortBy, sortOrder } = req.query;
    
    const allowedFilters = ['name'];
    const allowedSortFields = ['name', 'email', 'createdAt'];
    
    // Generate where clause for name search (using LIKE)
    let whereClause = '';
    const params = [];
    if (req.query.name) {
        whereClause = 'WHERE name LIKE ?';
        params.push(`%${req.query.name}%`);
    }

    const orderClause = generateOrderClause(sortBy, sortOrder, allowedSortFields);

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM Teachers ${whereClause}`;
    
    db.get(countSql, params, (err, countRow) => {
        if (err) {
            res.status(400).json(errorResponse(err.message));
            return;
        }

        const sql = `
            SELECT * FROM Teachers 
            ${whereClause} 
            ${orderClause} 
            LIMIT ? OFFSET ?`;

        db.all(sql, [...params, limit, offset], (err, rows) => {
            if (err) {
                res.status(400).json(errorResponse(err.message));
                return;
            }

            const metadata = getPaginationMetadata(countRow.total, page, limit);
            res.json(successResponse({
                items: rows,
                pagination: metadata,
                filters: allowedFilters,
                sortFields: allowedSortFields
            }));
        });
    });
});

// Get a single teacher
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM Teachers WHERE teacherId = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(row);
    });
});

// Create a new teacher
router.post('/', (req, res) => {
    const { name, email, phone } = req.body;

    if (!name) {
        res.status(400).json({ "error": "Teacher name is required" });
        return;
    }

    const sql = 'INSERT INTO Teachers (name, email, phone) VALUES (?, ?, ?)';
    db.run(sql, [name, email, phone], function(err) {
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

// Update a teacher
router.put('/:id', (req, res) => {
    const { name, email, phone } = req.body;

    if (!name) {
        res.status(400).json({ "error": "Teacher name is required" });
        return;
    }

    const sql = 'UPDATE Teachers SET name = ?, email = ?, phone = ? WHERE teacherId = ?';
    db.run(sql, [name, email, phone, req.params.id], function(err) {
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

// Delete a teacher
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM Teachers WHERE teacherId = ?', req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// Search teachers by name
router.get('/search/name/:query', (req, res) => {
    const searchQuery = `%${req.params.query}%`;
    db.all('SELECT * FROM Teachers WHERE name LIKE ?', [searchQuery], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

module.exports = router;

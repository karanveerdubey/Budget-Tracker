const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../db'); // Database connection
const authenticateToken = require('../middleware/auth');

// Get all expenses for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Expenses WHERE user_id = $1', [req.user.id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new expense
router.post(
    '/',
    [
        body('category').notEmpty().withMessage('Category is required'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('date').isDate().withMessage('Date must be valid'),
        body('description').optional().isString(),
    ],
    authenticateToken,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { category, amount, date, description } = req.body;

        try {
            const result = await pool.query(
                'INSERT INTO Expenses (user_id, category, amount, date, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [req.user.id, category, amount, date, description]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Update an expense
router.put(
    '/:id',
    [
        body('category').optional().isString(),
        body('amount').optional().isNumeric(),
        body('date').optional().isDate(),
        body('description').optional().isString(),
    ],
    authenticateToken,
    async (req, res) => {
        const { id } = req.params;
        const { category, amount, date, description } = req.body;

        try {
            const result = await pool.query(
                'UPDATE Expenses SET category = $1, amount = $2, date = $3, description = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
                [category, amount, date, description, id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Expense not found or not authorized' });
            }

            res.status(200).json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Delete an expense
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM Expenses WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Expense not found or not authorized' });
        }

        res.status(200).json({ message: 'Expense deleted', expense: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const pool = require('../db'); // Assuming you have a db.js file exporting the pool
const cron = require('node-cron');
const router = express.Router();

// Add a New Budget
router.post(
    '/',
    [
        body('category').notEmpty().withMessage('Category is required'),
        body('limit_amount').isNumeric().withMessage('Limit amount must be a number'),
    ],
    authenticateToken,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { category, limit_amount } = req.body;

        try {
            // Check if a budget for the category already exists
            const existingBudget = await pool.query(
                'SELECT * FROM Budgets WHERE user_id = $1 AND category = $2',
                [req.user.id, category]
            );

            if (existingBudget.rows.length > 0) {
                return res.status(400).json({ error: 'Budget for this category already exists' });
            }

            // Insert the budget into the database
            const result = await pool.query(
                'INSERT INTO Budgets (user_id, category, limit_amount) VALUES ($1, $2, $3) RETURNING *',
                [req.user.id, category, limit_amount]
            );

            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error('Error in POST /budgets:', err.message);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Get All Budgets
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM Budgets WHERE user_id = $1',
            [req.user.id]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error in GET /budgets:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a Budget
router.put(
    '/:id',
    [body('limit_amount').isNumeric().withMessage('Limit amount must be a number')],
    authenticateToken,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { limit_amount } = req.body;
        const { id } = req.params;

        try {
            const result = await pool.query(
                'UPDATE Budgets SET limit_amount = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
                [limit_amount, id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Budget not found' });
            }

            res.status(200).json(result.rows[0]);
        } catch (err) {
            console.error('Error in PUT /budgets:', err.message);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// Delete a Budget
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM Budgets WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.status(200).json({ message: 'Budget deleted successfully' });
    } catch (err) {
        console.error('Error in DELETE /budgets:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// Automatically Renew Budgets Monthly
const renewBudgets = async () => {
    try {
        // Reset each budget for the new month
        const budgets = await pool.query('SELECT * FROM Budgets');

        for (const budget of budgets.rows) {
            // Reset the budget (e.g., clear used values if applicable)
            await pool.query(
                'UPDATE Budgets SET limit_amount = limit_amount WHERE id = $1',
                [budget.id]
            );
        }
    } catch (err) {
        console.error('Error in budget renewal:', err.message);
    }
};

// Schedule the renewal job to run on the 1st of every month at midnight
cron.schedule('0 0 1 * *', renewBudgets);

module.exports = router;

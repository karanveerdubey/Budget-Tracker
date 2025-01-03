import React, { useState } from 'react';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const EditBudgetForm = ({ budget, onBudgetUpdated, onCancel }) => {
    const [category, setCategory] = useState(budget.category);
    const [limitAmount, setLimitAmount] = useState(budget.limit_amount);
    const [error, setError] = useState('');

    const predefinedCategories = [
        'Rent',
        'Utilities',
        'Food',
        'Insurance',
        'Transportation',
        'Recreation',
        'Personal Care',
        'Clothing',
        'Medical',
        'Subscriptions',
        'Groceries',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!category || !limitAmount) {
            setError('All fields are required.');
            return;
        }

        const updatedBudget = {
            ...budget,
            category,
            limit_amount: limitAmount,
        };
        onBudgetUpdated(updatedBudget);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                maxWidth: 400,
                padding: 3,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: 'white',
                textAlign: 'left',
            }}
        >
            <Typography variant="h5" gutterBottom>
                Edit Budget
            </Typography>
            {error && (
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
            )}

            {/* Category Field */}
            <FormControl fullWidth margin="normal" required>
                <InputLabel>Select Category</InputLabel>
                <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label="Select Category"
                >
                    {predefinedCategories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                            {cat}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Limit Amount Field */}
            <TextField
                label="Budget Amount"
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                fullWidth
                margin="normal"
                required
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <Button variant="outlined" color="error" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                    Save
                </Button>
            </Box>
        </Box>
    );
};

export default EditBudgetForm;

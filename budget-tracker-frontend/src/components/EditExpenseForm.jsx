import React, { useState } from 'react';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const EditExpenseForm = ({ expense, onExpenseUpdated, onCancel }) => {
    const [category, setCategory] = useState(expense.category);
    const [amount, setAmount] = useState(expense.amount);
    const [date, setDate] = useState(expense.date);
    const [description, setDescription] = useState(expense.description || '');
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

        if (!category || !amount || !date) {
            setError('All fields are required.');
            return;
        }

        const updatedExpense = {
            ...expense,
            category,
            amount,
            date,
            description,
        };
        onExpenseUpdated(updatedExpense);
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
                Edit Expense
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

            {/* Amount Field */}
            <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                margin="normal"
                required
            />

            {/* Date Field */}
            <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                margin="normal"
                required
                InputLabelProps={{
                    shrink: true,
                }}
            />

            {/* Description Field */}
            <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                margin="normal"
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

export default EditExpenseForm;

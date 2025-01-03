import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    TextField,
    Button,
    Typography,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';

const AddBudgetForm = ({ onBudgetAdded }) => {
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [limitAmount, setLimitAmount] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const selectedCategory = category === 'Other' ? customCategory : category;
            const payload = { category: selectedCategory, limit_amount: limitAmount };
            const response = await axios.post(
                'http://localhost:5000/budgets',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onBudgetAdded(response.data);
            setCategory('');
            setCustomCategory('');
            setLimitAmount('');
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add budget');
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{marginBottom: 4,
                maxWidth: 400,
                padding: 3,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: 'white',
            }}
        >
            <Typography variant="h5" gutterBottom>
                Add Budget
            </Typography>
            {error && (
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
            )}

            {/* Category Selection */}
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

            {/* Custom Category Field */}
            {category === 'Other' && (
                <TextField
                    label="Custom Category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
            )}

            {/* Budget Amount */}
            <TextField
                label="Budget Amount"
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                fullWidth
                margin="normal"
                required
            />

            {/* Submit Button */}
            <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ marginTop: 2 }}
            >
                Add Budget
            </Button>
        </Box>
    );
};

export default AddBudgetForm;

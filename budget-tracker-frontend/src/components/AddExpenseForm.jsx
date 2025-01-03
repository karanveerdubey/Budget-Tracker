import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, FormControlLabel, Checkbox } from '@mui/material';
import axios from 'axios';

const AddExpenseForm = ({ onExpenseAdded }) => {
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

    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [isRecurring, setIsRecurring] = useState(false); // State for recurring expenses
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const selectedCategory = category === 'Other' ? customCategory : category;
            const payload = {
                category: selectedCategory,
                amount,
                date,
                description,
                isRecurring, // Send recurring flag
            };

            const response = await axios.post(
                'http://localhost:5000/expenses',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            onExpenseAdded(response.data);
            setCategory('');
            setCustomCategory('');
            setAmount('');
            setDate('');
            setDescription('');
            setIsRecurring(false); // Reset recurring flag
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add expense');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} 
        sx={{ marginBottom: 4, 
            maxWidth: 400,
            padding: 3,
            borderRadius: 2,
            boxShadow: 3, // Subtle shadow 
            backgroundColor: "white"
            }}>
            <Typography variant="h6" gutterBottom>
                Add Expense
            </Typography>
            {error && (
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
            )}
            <TextField
                select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
                margin="normal"
                required
            >
                {predefinedCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                        {cat}
                    </MenuItem>
                ))}
            </TextField>
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
            <TextField
                type="number"
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                type="date"
                label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{
                    shrink: true,
                }}
                required
            />
            <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                margin="normal"
                multiline
                rows={3}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        color="primary"
                    />
                }
                label={
                    <Typography
                    sx={{
                        color: 'black', // Change to your desired color
                        fontWeight: 'bold', // Optional: Add bold styling
                        fontSize: '0.9rem',
                    }}
                    >
                    Recurring Expense
                    </Typography>
                }
                
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
                Add Expense
            </Button>
        </Box>
    );
};

export default AddExpenseForm;

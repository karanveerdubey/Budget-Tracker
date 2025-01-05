import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import axios from 'axios';

const AddExpenseForm = ({
  onExpenseAdded,
  // New optional props for pre-filling data
  initialCategory = '',
  initialAmount = '',
  initialDate = '',
  initialDescription = '',
  initialIsRecurring = false,
}) => {
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
    'Other',
  ];

  // States, initialized from props if provided
  const [category, setCategory] = useState(initialCategory);
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState(initialAmount || '');
  const [date, setDate] = useState(initialDate || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [isRecurring, setIsRecurring] = useState(initialIsRecurring);
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      // If the user chose "Other" from dropdown, we use the customCategory field
      const selectedCategory = category === 'Other' ? customCategory : category;
      const payload = {
        category: selectedCategory,
        amount,
        date,
        description,
        isRecurring,
      };

      const response = await axios.post('http://localhost:5000/expenses', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Notify parent that a new expense has been added
      if (onExpenseAdded) {
        onExpenseAdded(response.data);
      }

      // Reset all fields to default
      setCategory('');
      setCustomCategory('');
      setAmount('');
      setDate('');
      setDescription('');
      setIsRecurring(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        marginBottom: 4,
        maxWidth: 400,
        padding: 3,
        borderRadius: 2,
        boxShadow: 3, // Subtle shadow
        backgroundColor: 'white',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Add Expense
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      {/* Category dropdown */}
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

      {/* Only show custom category field if "Other" is chosen */}
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

      {/* Amount */}
      <TextField
        type="number"
        label="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        margin="normal"
        required
      />

      {/* Date */}
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

      {/* Description */}
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />

      {/* Recurring Expense Checkbox */}
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
              color: 'black',
              fontWeight: 'bold',
              fontSize: '0.9rem',
            }}
          >
            Recurring Expense
          </Typography>
        }
      />

      {/* Submit Button */}
      <Button type="submit" variant="contained" color="primary" fullWidth>
        Add Expense
      </Button>
    </Box>
  );
};

export default AddExpenseForm;

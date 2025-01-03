import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import AddBudgetForm from '../components/AddBudgetForm';
import EditBudgetForm from '../components/EditBudgetForm';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [editingBudget, setEditingBudget] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBudgets = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5000/budgets', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBudgets(response.data);
            } catch (err) {
                console.error('Error fetching budgets:', err);
                setError('Failed to load budgets. Please try again later.');
            }
        };

        fetchBudgets();
    }, []);

    const handleBudgetAdded = (newBudget) => {
        setBudgets([...budgets, newBudget]);
    };

    const handleBudgetUpdated = (updatedBudget) => {
        setBudgets(
            budgets.map((budget) => (budget.id === updatedBudget.id ? updatedBudget : budget))
        );
        setEditingBudget(null);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/budgets/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBudgets(budgets.filter((budget) => budget.id !== id));
        } catch (err) {
            console.error('Error deleting budget:', err);
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>
                Budgets
            </Typography>

            {error && (
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
            )}

            {editingBudget ? (
                <EditBudgetForm
                    budget={editingBudget}
                    onBudgetUpdated={handleBudgetUpdated}
                    onCancel={() => setEditingBudget(null)}
                />
            ) : (
                <AddBudgetForm onBudgetAdded={handleBudgetAdded} />
            )}

            <List>
                {budgets.map((budget) => (
                    <ListItem
                        key={budget.id}
                        sx={{ borderBottom: '1px solid #e0e0e0', paddingY: 2 }}
                        secondaryAction={
                            <>
                                <IconButton
                                    edge="end"
                                    aria-label="edit"
                                    onClick={() => setEditingBudget(budget)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDelete(budget.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        }
                    >
                        <ListItemText
                            primary={`${budget.category}: $${budget.limit_amount}`}
                        />
                    </ListItem>
                ))}
            </List>

            <Button
                variant="contained"
                color="primary"
                sx={{ marginTop: 2 }}
                onClick={() => navigate('/dashboard')}
            >
                Go to Dashboard
            </Button>
        </Box>
    );
};

export default Budgets;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Button,
    Paper,
    Container,
} from '@mui/material';
import AddExpenseForm from '../components/AddExpenseForm';
import EditExpenseForm from '../components/EditExpenseForm';
import AddBudgetForm from '../components/AddBudgetForm';
import EditBudgetForm from '../components/EditBudgetForm';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

const Dashboard = () => {
    const [userName, setUserName] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const [editingBudget, setEditingBudget] = useState(null);
    const [error, setError] = useState('');
    const [showAllExpenses, setShowAllExpenses] = useState(false);
    const navigate = useNavigate();

    // Fetch user name and data
    useEffect(() => {
        const fetchUserName = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:5000/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserName(response.data.name || 'User');
            } catch (err) {
                console.error('Error fetching user name:', err);
            }
        };

        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const expensesResponse = await axios.get('http://localhost:5000/expenses', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setExpenses(expensesResponse.data);

                const budgetsResponse = await axios.get('http://localhost:5000/budgets', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBudgets(budgetsResponse.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
            }
        };

        fetchUserName();
        fetchData();
    }, []);

    // Logout functionality
    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token
        navigate('/'); // Redirect to login page
    };

    // Expense handlers
    const handleExpenseAdded = (newExpense) => {
        setExpenses([newExpense, ...expenses]);
    };

    const handleExpenseUpdated = (updatedExpense) => {
        setExpenses(
            expenses.map((expense) =>
                expense.id === updatedExpense.id ? updatedExpense : expense
            )
        );
        setEditingExpense(null);
    };

    const handleDeleteExpense = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setExpenses(expenses.filter((expense) => expense.id !== id));
        } catch (err) {
            console.error('Error deleting expense:', err);
        }
    };

    // Budget handlers
    const handleBudgetAdded = (newBudget) => {
        setBudgets([...budgets, newBudget]);
    };

    const handleBudgetUpdated = (updatedBudget) => {
        setBudgets(
            budgets.map((budget) => (budget.id === updatedBudget.id ? updatedBudget : budget))
        );
        setEditingBudget(null);
    };

    const handleDeleteBudget = async (id) => {
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
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                backgroundColor: '#f4f4f9',
                paddingX: 2,
                paddingY: 2,
                width: '100vw',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', color:'primary.main' }}>
                    <Typography variant="h3" gutterBottom>
                        Dashboard
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 2 }}>
                        <Box
                            sx={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: 'primary.main',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 0.5,
                            }}
                        >
                            <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {userName.charAt(0).toUpperCase()}
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                color: 'text.primary',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                            }}
                        >
                            {userName}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Box>

            {/* Error Message */}
            {error && (
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
            )}

            {/* Expenses Section */}
            <Paper
                sx={{
                    padding: 3,
                    marginBottom: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: '#ffffff',
                }}
            >
                {editingExpense ? (
                    <EditExpenseForm
                        expense={editingExpense}
                        onExpenseUpdated={handleExpenseUpdated}
                        onCancel={() => setEditingExpense(null)}
                    />
                ) : (
                    <AddExpenseForm onExpenseAdded={handleExpenseAdded} />
                )}
                <Box
                    sx={{
                        maxHeight: showAllExpenses ? 'none' : 300,
                        overflow: showAllExpenses ? 'visible' : 'auto',
                        border: '1px solid #ddd',
                        borderRadius: 2,
                        padding: 2,
                        marginTop: 2,
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Expenses
                    </Typography>
                    <List>
                        {expenses.map((expense) => (
                            <ListItem
                                key={expense.id}
                                sx={{
                                    borderBottom: '1px solid #e0e0e0',
                                    paddingY: 2,
                                }}
                                secondaryAction={
                                    <>
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            onClick={() => setEditingExpense(expense)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleDeleteExpense(expense.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                }
                            >
                                <ListItemText
                                    primary={`${expense.category}: $${expense.amount}`}
                                    secondary={
                                        <>
                                            <Typography
                                                component="span"
                                                sx={{ color: 'gray' }}
                                            >
                                                {new Date(expense.date).toLocaleDateString()}
                                            </Typography>
                                            {expense.description && (
                                                <Typography
                                                    component="p"
                                                    sx={{ marginTop: 1, color: 'gray' }}
                                                >
                                                    {expense.description}
                                                </Typography>
                                            )}
                                        </>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Button
                    variant="outlined"
                    onClick={() => setShowAllExpenses(!showAllExpenses)}
                    sx={{ marginTop: 2 }}
                >
                    {showAllExpenses ? 'Show Less' : 'Show All'}
                </Button>
            </Paper>

            {/* Budgets Section */}
            <Paper
                sx={{
                    padding: 3,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: '#ffffff',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Budgets
                </Typography>
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
                            sx={{
                                borderBottom: '1px solid #e0e0e0',
                                paddingY: 2,
                            }}
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
                                        onClick={() => handleDeleteBudget(budget.id)}
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
            </Paper>
        </Container>
    );
};

export default Dashboard;


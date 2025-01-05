import React, { useEffect, useState, useMemo } from 'react';
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
    LinearProgress,
    Select,
    MenuItem,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@mui/material';
import AddExpenseForm from '../components/AddExpenseForm';
import EditExpenseForm from '../components/EditExpenseForm';
import AddBudgetForm from '../components/AddBudgetForm';
import EditBudgetForm from '../components/EditBudgetForm';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import VisionUploader from '../components/VisionUploader';

// Chart.js auto-registration for Chart.js v4 + react-chartjs-2 v5
import 'chart.js/auto';
import { Pie, Line } from 'react-chartjs-2';

const Dashboard = () => {
    const [userName, setUserName] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [editingExpense, setEditingExpense] = useState(null);
    const [budgets, setBudgets] = useState([]);
    const [editingBudget, setEditingBudget] = useState(null);
    const [error, setError] = useState('');

    // Single timeRange state affects both expense list + the budget category table
    const [timeRange, setTimeRange] = useState('all');

    // For expanding expense list
    const [expandedExpenses, setExpandedExpenses] = useState(false);

    const navigate = useNavigate();

    // Current date for references
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // values from GPT
    const [gptDate, setGptDate] = useState('');
    const [gptAmount, setGptAmount] = useState('');
    const [gptVendor, setGptVendor] = useState('');

    // ------------------------------------------------
    // Fetch user name and data
    // ------------------------------------------------
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

    // ------------------------------------------------
    // Logout functionality
    // ------------------------------------------------
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    // ------------------------------------------------
    // Expense handlers
    // ------------------------------------------------
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

    const handleReceiptParsed = (parsed) => {
        // e.g. parsed might be { date: '2023-12-31', vendor: 'Walmart', amount: 42.5 }
        console.log('Parsed from VisionUploader: ', parsed);
    
        // Convert to the fields you want
        if (parsed.date) setGptDate(parsed.date);
        if (parsed.amount) setGptAmount(parsed.amount.toString());
        if (parsed.vendor) setGptVendor(parsed.vendor);
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

    // ------------------------------------------------
    // Budget handlers
    // ------------------------------------------------
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

    // ------------------------------------------------
    // Time range filtering logic
    // ------------------------------------------------
    const filterByTimeRange = (expense) => {
        const date = new Date(expense.date);
        switch (timeRange) {
            case '7days': {
                // Last 7 days
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(now.getDate() - 7);
                return date >= sevenDaysAgo && date <= now;
            }
            case 'thisMonth': {
                // From 1st of the current month to now
                const startOfMonth = new Date(currentYear, currentMonth, 1);
                return date >= startOfMonth && date <= now;
            }
            case 'lastMonth': {
                // from 1st of previous month to end of that previous month
                let lastMonth = currentMonth - 1;
                let lastMonthYear = currentYear;
                if (lastMonth < 0) {
                    lastMonth += 12;
                    lastMonthYear -= 1;
                }
                const startOfLastMonth = new Date(lastMonthYear, lastMonth, 1);
                const endOfLastMonth = new Date(lastMonthYear, lastMonth + 1, 0);
                return date >= startOfLastMonth && date <= endOfLastMonth;
            }
            case 'all':
            default:
                return true;
        }
    };

    // Filtered list for display in Expenses + Charts
    const filteredExpenses = useMemo(() => {
        const filtered = expenses.filter(filterByTimeRange);

  // Sort the filtered expenses by date in descending order (latest first)
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}, [expenses, timeRange]);

    // ------------------------------------------------
    // Pie Chart Data (for filtered expenses)
    // ------------------------------------------------
    const pieData = useMemo(() => {
        const totalsByCategory = {};
        filteredExpenses.forEach((expense) => {
            const amt = Number(expense.amount) || 0;
            if (!totalsByCategory[expense.category]) {
                totalsByCategory[expense.category] = 0;
            }
            totalsByCategory[expense.category] += amt;
        });

        return {
            labels: Object.keys(totalsByCategory),
            datasets: [
                {
                    data: Object.values(totalsByCategory),
                    backgroundColor: [
                        '#42a5f5',
                        '#66bb6a',
                        '#ffa726',
                        '#ab47bc',
                        '#ec407a',
                        '#26c6da',
                        '#ffca28',
                    ],
                    hoverOffset: 10,
                },
            ],
        };
    }, [filteredExpenses]);

    // ------------------------------------------------
    // Line Chart Data (for filtered expenses)
    // ------------------------------------------------
    const lineData = useMemo(() => {
        const dailyMap = {};
        filteredExpenses.forEach((exp) => {
            const d = new Date(exp.date);
            const key = d.toISOString().split('T')[0];
            const amt = Number(exp.amount) || 0;
            dailyMap[key] = (dailyMap[key] || 0) + amt;
        });

        const sortedDates = Object.keys(dailyMap).sort();
        const dataPoints = sortedDates.map((dateStr) => dailyMap[dateStr]);

        return {
            labels: sortedDates,
            datasets: [
                {
                    label: 'Total Expenses',
                    data: dataPoints,
                    borderColor: '#42a5f5',
                    backgroundColor: 'rgba(66, 165, 245, 0.2)',
                    tension: 0.3,
                    fill: true,
                },
            ],
        };
    }, [filteredExpenses]);

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
        },
        scales: {
            x: {
                grid: { display: false },
            },
            y: {
                grid: { color: 'rgba(200, 200, 200, 0.2)' },
                beginAtZero: true,
            },
        },
    };

    // ------------------------------------------------
    // Monthly Spent / Progress for Budgets
    // (always from full expenses, ignoring timeRange)
    // ------------------------------------------------
    const getMonthlySpent = (budgetCategory) => {
        return expenses
            .filter(
                (exp) =>
                    exp.category === budgetCategory &&
                    new Date(exp.date).getMonth() === currentMonth &&
                    new Date(exp.date).getFullYear() === currentYear
            )
            .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    };

    // ------------------------------------------------
    // Table Data: total expense by category (ALSO filtered
    // by timeRange for consistency) 
    // ------------------------------------------------
    const filteredCategoryTotals = useMemo(() => {
        const totals = {};
        // We use the same filteredExpenses
        filteredExpenses.forEach((exp) => {
            const c = exp.category;
            const amt = Number(exp.amount) || 0;
            if (!totals[c]) totals[c] = 0;
            totals[c] += amt;
        });
        return totals;
    }, [filteredExpenses]);

    const tableData = useMemo(() => {
        return Object.entries(filteredCategoryTotals).map(([category, amount]) => ({
            category,
            amount
        }));
    }, [filteredCategoryTotals]);

    // Calculate total sum for final row
    const totalExpenses = useMemo(() => {
        return tableData.reduce((acc, row) => acc + row.amount, 0);
    }, [tableData]);

    // ------------------------------------------------
    // Render
    // ------------------------------------------------
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
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
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
                            <Typography
                                sx={{
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                }}
                            >
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

            {/* Expenses Section + Charts */}
            <Paper
                sx={{
                    padding: 3,
                    marginBottom: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: '#ffffff',
                }}
            >
                {/* Container: form (left) + pie chart (right) */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}
                >
                    <Box sx={{ flex: 1, marginRight: { md: 2 } }}>
                        {editingExpense ? (
                            <EditExpenseForm
                                expense={editingExpense}
                                onExpenseUpdated={handleExpenseUpdated}
                                onCancel={() => setEditingExpense(null)}
                            />
                        ) : (
                            <AddExpenseForm 
                            key={`${gptDate}-${gptAmount}-${gptVendor}`}
                            initialDate={gptDate}
                            initialAmount={gptAmount}
                            initialDescription={gptVendor}
                            onExpenseAdded={handleExpenseAdded} />
                        )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
            <Typography variant="h6" marginBottom={-3} gutterBottom>
              OpenAI API
            </Typography>
            <VisionUploader onReceiptParsed={handleReceiptParsed}/>
          </Box>

                    {/* Pie Chart (no border, enlarged) */}
                    <Box
                        sx={{
                            flex: 2,
                            marginTop: { xs: 2, md: 0 },
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 2,
                        }}
                    >
                        <Box sx={{ width: 500, minHeight: 350 }}>
                            <Pie data={pieData} />
                        </Box>
                    </Box>
                </Box>

                {/* Line Chart for total expenses */}
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        borderRadius: '8px',
                        height: 300,
                    }}
                >
                    <Line data={lineData} options={lineOptions} />
                </Box>

                {/* Time Range + Expenses List (consistently styled scroll box) */}
                <Box
                    sx={{
                        marginTop: 2,
                        backgroundColor: '#fafafa',
                        boxShadow: 2,
                        borderRadius: 2,
                        padding: 2,
                        maxHeight: expandedExpenses ? 'none' : 320,
                        overflow: expandedExpenses ? 'visible' : 'auto',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            marginBottom: 2,
                        }}
                    >
                        <Typography variant="h4" gutterBottom>
                            Expenses
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* Updated time range options */}
                            <Select
                                size="small"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <MenuItem value="7days">Last 7 days</MenuItem>
                                <MenuItem value="thisMonth">This Month</MenuItem>
                                <MenuItem value="lastMonth">Last 1 Month</MenuItem>
                                <MenuItem value="all">Show All</MenuItem>
                            </Select>
                            <Button
                                variant="outlined"
                                onClick={() => setExpandedExpenses(!expandedExpenses)}
                            >
                                {expandedExpenses ? 'Collapse' : 'Expand'}
                            </Button>
                        </Box>
                    </Box>

                    <List>
                        {filteredExpenses.map((expense) => {
                            const amountNum = Number(expense.amount) || 0;
                            return (
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
                                        primary={`${expense.category}: $${amountNum.toFixed(2)}`}
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
                            );
                        })}
                    </List>
                </Box>
            </Paper>

            {/* Budgets Section + (New) Time-Toggled Table of total expense by category */}
            <Paper
                sx={{
                    padding: 3,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: '#ffffff',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Monthly Budgets
                </Typography>

                {/* The same time toggles so user can filter the budget table if needed */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h6">Filter Table by:</Typography>
                    <Select
                        size="small"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <MenuItem value="7days">Last 7 days</MenuItem>
                        <MenuItem value="thisMonth">This Month</MenuItem>
                        <MenuItem value="lastMonth">Last 1 Month</MenuItem>
                        <MenuItem value="all">Show All</MenuItem>
                    </Select>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 3,
                        alignItems: 'flex-start',
                    }}
                >
                    {/* Budget Form / Edit */}
                    <Box sx={{ flex: 1 }}>
                        {editingBudget ? (
                            <EditBudgetForm
                                budget={editingBudget}
                                onBudgetUpdated={handleBudgetUpdated}
                                onCancel={() => setEditingBudget(null)}
                            />
                        ) : (
                            <AddBudgetForm onBudgetAdded={handleBudgetAdded} />
                        )}
                    </Box>

                    {/* Modern-styled Table: total expense by category (filtered by timeRange) */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Expense by Category
                        </Typography>
                        <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>
                                            Category
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Total Spent
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2}>
                                                No expenses in this time range.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tableData.map((row) => (
                                            <TableRow key={row.category}>
                                                <TableCell>{row.category}</TableCell>
                                                <TableCell align="right">
                                                    {row.amount.toLocaleString('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                    {/* Final row: total */}
                                    {tableData.length > 0 && (
                                        <TableRow sx={{ backgroundColor: '#fafafa' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>
                                                TOTAL
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                {totalExpenses.toLocaleString('en-US', {
                                                    style: 'currency',
                                                    currency: 'USD',
                                                })}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>

                {/* Budgets List with Progress Bars */}
                <List sx={{ mt: 3 }}>
                    {budgets.map((budget) => {
                        const monthlySpent = getMonthlySpent(budget.category);
                        const monthlySpentFormatted = Number(monthlySpent).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                        });
                        const limitAmount = Number(budget.limit_amount) || 0;
                        const limitFormatted = limitAmount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                        });

                        // Progress from 0 to 100
                        const progress =
                            limitAmount > 0
                                ? Math.min((monthlySpent / limitAmount) * 100, 100)
                                : 0;

                        // If limit exceeded, color="error"
                        const progressColor =
                            monthlySpent > limitAmount ? 'error' : 'primary';

                        return (
                            <ListItem
                                key={budget.id}
                                sx={{
                                    borderBottom: '1px solid #e0e0e0',
                                    paddingY: 2,
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                }}
                                secondaryAction={
                                    <Box>
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
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={`${budget.category}: ${limitFormatted}`}
                                />
                                <Box sx={{ width: '100%', marginTop: 1 }}>
                                    <Typography variant="body2" sx={{ marginBottom: 0.5 }}>
                                        {`Spent this month: ${monthlySpentFormatted}`}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        color={progressColor}
                                        sx={{ height: 10, borderRadius: 5 }}
                                    />
                                </Box>
                            </ListItem>
                        );
                    })}
                </List>
            </Paper>
        </Container>
    );
};

export default Dashboard;

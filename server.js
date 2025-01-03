// server.js

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env

// Import route files
const usersRoutes = require('./routes/users');
const expensesRoutes = require('./routes/expenses');
const budgetsRoutes = require('./routes/budgets');

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse incoming JSON requests

// Use the routes
app.use('/users', usersRoutes); // Users routes
app.use('/expenses', expensesRoutes); // Expenses routes
app.use('/budgets', budgetsRoutes); // Budgets routes

// Test route
app.get('/', (req, res) => {
    res.send('Budget Tracker API is running!');
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace for debugging
    res.status(500).json({ error: 'Something went wrong!' }); // Send a generic error response
});

// Start the server
const PORT = process.env.PORT || 5000; // Use the port from .env or default to 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

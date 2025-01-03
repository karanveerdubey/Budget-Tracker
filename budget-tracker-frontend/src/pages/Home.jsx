import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import backgroundImage from '../assets/money.jpg';

const Home = () => {    

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100vw',
                minHeight: '100vh',
                backgroundImage: `url(${backgroundImage})`, // Set the background image
                backgroundSize: 'cover', // Ensure the image covers the entire area
                backgroundPosition: 'center', // Center the image
                backgroundRepeat: 'no-repeat', // Prevent repetition
                padding: 2,
                
            }}
        >
            <Paper
                elevation={10}
                sx={{
                    padding: 4,
                    textAlign: 'center',
                    borderRadius: 3,
                    maxWidth: 800,
                    backgroundColor: '#ffffff',
                }}
            >
                <Typography variant="h3" marginBottom={0.5} gutterBottom color="primary">
                    Welcome to Expense Tracker
                </Typography>
                <Typography variant="h7" gutterBottom color="primary">
                    By Karanveer Dubey
                </Typography>
                <Typography variant="h6" marginTop={3} gutterBottom>
                    Manage your expenses and budgets efficiently!
                </Typography>
                <Typography variant="body2" sx={{ color: 'gray', marginBottom: 2 }}>
                    For demo, sign in with:
                    <br />
                    Email: <strong>john@example.com</strong>
                    <br />
                    Password: <strong>hashedpassword</strong>
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        marginTop: 4,
                    }}
                >
                    <Button
                        href="/login"
                        variant="contained"
                        color="primary"
                        startIcon={<LoginIcon />}
                        sx={{
                            paddingX: 4,
                        }}
                    >
                        Login
                    </Button>
                    <Button
                        href="/signup"
                        variant="outlined"
                        color="primary"
                        startIcon={<AppRegistrationIcon />}
                        sx={{
                            paddingX: 4,
                        }}
                    >
                        Sign Up
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Home;

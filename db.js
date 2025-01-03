require('dotenv').config(); // load .env variables
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: 'localhost',
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT, // Default PostgreSQL port
});

module.exports = pool;

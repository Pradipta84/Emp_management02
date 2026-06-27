const mysql = require('mysql2/promise');
require('dotenv').config();

// Secure config - using .env variables
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }, // Required for Aiven cloud database
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;

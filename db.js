
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10, // Reduce max connections
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
    // Supabase/Postgres idle clients often get terminated. This is expected.
    // We only log if it's NOT a termination error to avoid noise.
    if (err.code !== 'XX000' && err.code !== '57P01') {
        console.error('Unexpected error on idle client', err);
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};

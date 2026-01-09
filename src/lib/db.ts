import { Pool } from 'pg';

// Use environment variable for connection string
// Example: postgres://postgres:password@host:5432/careytour
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
};

export default pool;

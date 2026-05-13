import { Pool } from 'pg';

// Connection string set via DATABASE_URL environment variable.
// Example: postgres://postgres:password@carey_db:5432/carey?sslmode=disable
// NOTE: SSL config is driven entirely by the connection string (sslmode param).
//       Do NOT override ssl here to avoid conflicts with sslmode=disable.
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });

export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
};

export default pool;

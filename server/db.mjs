import './env.mjs';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL es obligatorio. Copia .env.example a .env y configura PostgreSQL.');
  process.exit(1);
}

export const pool = new Pool({
  connectionString,
  max: Number(process.env.PG_POOL_MAX || 10),
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
});

pool.on('error', (error) => {
  console.error('PostgreSQL pool error', error.message);
});

export function query(text, params = []) {
  return pool.query(text, params);
}

export async function one(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows[0] ?? null;
}

export async function many(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

export async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await callback(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

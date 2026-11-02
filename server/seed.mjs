import './env.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pool } from './db.mjs';

const sql = readFileSync(resolve(process.cwd(), 'db/006_demo_seed.sql'), 'utf8');

try {
  await pool.query(sql);
  console.log('Seed demo aplicado.');
  console.log('Usuario: demo@clinica.local / Demo1234!');
} finally {
  await pool.end();
}

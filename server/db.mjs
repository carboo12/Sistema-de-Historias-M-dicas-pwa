import './env.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { Connector } from '@google-cloud/cloud-sql-connector';
import { GoogleAuth } from 'google-auth-library';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
let connector;

let pool;
if (connectionString) {
  pool = new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX || 10),
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
  });
} else {
  // Local development can use the same Cloud SQL IAM connection as the migration.
  // DATABASE_URL remains supported for local PostgreSQL or an explicit connection.
  const serviceAccountPath = resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT || 'servicekey.json');
  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    connector = new Connector({
      auth: new GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      })
    });
    const instanceConnectionName = `${serviceAccount.project_id}:${process.env.CLOUD_SQL_REGION || 'us-east4'}:${process.env.CLOUD_SQL_INSTANCE || 'studio-9955473018-e374d-service-fdc'}`;
    const options = await connector.getOptions({
      instanceConnectionName,
      authType: 'IAM',
      ipType: process.env.CLOUD_SQL_IP_TYPE || 'PUBLIC'
    });
    pool = new Pool({
      ...options,
      user: serviceAccount.client_email.replace(/\.gserviceaccount\.com$/, ''),
      database: process.env.CLOUD_SQL_DATABASE || 'fdcdb',
      max: Number(process.env.PG_POOL_MAX || 5),
      connectionTimeoutMillis: 60000
    });
  } catch (error) {
    connector?.close();
    console.error(`No se pudo configurar PostgreSQL. Define DATABASE_URL o verifica ${serviceAccountPath} y los permisos de Cloud SQL: ${error.message}`);
    process.exit(1);
  }
}

export { pool };

export async function closeDatabase() {
  await pool.end();
  connector?.close();
}

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

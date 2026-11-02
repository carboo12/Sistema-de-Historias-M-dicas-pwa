const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');
const { Client } = require('pg');

const BATCH_SIZE = 500;

function parseTuple(line, start) {
  let i = start;
  if (line[i] !== '(') return null;
  i++;
  const values = [];
  let value = '';
  let quoted = false;
  let wasQuoted = false;
  while (i < line.length) {
    const ch = line[i];
    if (quoted) {
      if (ch === '\\') {
        const next = line[i + 1];
        const escapes = { n: '\n', r: '\r', t: '\t', '0': '\0', Z: '\x1a', '\\': '\\', "'": "'", '"': '"' };
        value += escapes[next] !== undefined ? escapes[next] : next;
        i += 2;
        continue;
      }
      if (ch === "'") {
        if (line[i + 1] === "'") {
          value += "'";
          i += 2;
          continue;
        }
        quoted = false;
        i++;
        continue;
      }
      value += ch;
      i++;
      continue;
    }
    if (ch === "'") {
      quoted = true;
      wasQuoted = true;
      i++;
      continue;
    }
    if (ch === ',') {
      values.push(wasQuoted ? value : (value.trim().toUpperCase() === 'NULL' ? null : value));
      value = '';
      wasQuoted = false;
      i++;
      continue;
    }
    if (ch === ')') {
      values.push(wasQuoted ? value : (value.trim().toUpperCase() === 'NULL' ? null : value));
      return values;
    }
    value += ch;
    i++;
  }
  return null;
}

function appDatabaseStart(line) {
  return line.includes('CREATE DATABASE') && line.includes('premiummedico');
}

function appDatabaseEnd(line) {
  return line.includes('CREATE DATABASE') && line.includes('performance_schema');
}

async function main() {
  const dump = process.argv[2];
  if (!dump) {
    console.error('Usage: node db/load-legacy.js <mysql-dump.sql>');
    process.exit(1);
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const sourceFile = path.resolve(dump);
  const client = new Client({ connectionString: url });
  await client.connect();

  const batchId = crypto.randomUUID();
  await client.query(
    "insert into legacy.import_batches (id, source_file, status) values ($1, $2, 'running')",
    [batchId, path.basename(sourceFile)]
  );

  const hash = crypto.createHash('sha256');
  const counts = new Map();
  let buffer = [];
  let tableName = null;
  let columns = null;
  let total = 0;
  let inApp = false;

  const flush = async () => {
    if (buffer.length === 0) return;
    const tuples = [];
    const params = [];
    let position = 1;
    for (const row of buffer) {
      tuples.push(`($${position++},$${position++},$${position++},$${position++}::jsonb)`);
      params.push(batchId, row.tableName, row.rowNumber, JSON.stringify(row.data));
    }
    await client.query(
      `insert into legacy.raw_rows (batch_id, table_name, row_number, data) values ${tuples.join(',')}`,
      params
    );
    buffer = [];
  };

  const input = readline.createInterface({
    input: fs.createReadStream(sourceFile),
    crlfDelay: Infinity
  });

  for await (const line of input) {
    hash.update(line + '\n');

    if (appDatabaseStart(line)) {
      inApp = true;
      continue;
    }
    if (appDatabaseEnd(line)) {
      inApp = false;
      continue;
    }
    if (!inApp) continue;

    if (line.startsWith('INSERT INTO `')) {
      const match = line.match(/^INSERT INTO `([a-z0-9_]+)` \((.*?)\) VALUES/);
      if (match) {
        tableName = match[1];
        columns = match[2].split(',').map((column) => column.trim().replace(/`/g, ''));
      } else {
        tableName = null;
        columns = null;
      }
      continue;
    }

    if (!tableName || !columns) continue;
    const trimmed = line.trimStart();
    if (!trimmed.startsWith('(')) continue;

    const values = parseTuple(trimmed, 0);
    if (!values) continue;

    const data = {};
    for (let index = 0; index < columns.length; index++) {
      data[columns[index]] = index < values.length ? values[index] : null;
    }

    const nextRowNumber = (counts.get(tableName) || 0) + 1;
    counts.set(tableName, nextRowNumber);
    buffer.push({ tableName, rowNumber: nextRowNumber, data });
    total += 1;

    if (buffer.length >= BATCH_SIZE) await flush();
  }

  await flush();

  await client.query(
    "update legacy.import_batches set status = 'completed', finished_at = now(), source_hash = $2, stats = $3::jsonb where id = $1",
    [batchId, hash.digest('hex'), JSON.stringify({ rows: total, tables: counts.size })]
  );

  console.log(JSON.stringify({ batchId, rows: total, tables: counts.size }, null, 2));
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});

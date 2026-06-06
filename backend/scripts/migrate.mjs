// Database migration runner for Glance.
//
// Usage:  npm run db:migrate
// Reads DATABASE_URL from .env (the direct/session Postgres connection string from
// Supabase -> Project Settings -> Database -> Connection string). Never prints secrets.
//
// Behaviour:
//   * Probes the server (version, orioledb extension, default table access method).
//   * If the orioledb extension is installed, sets default_table_access_method='orioledb'
//     for the session so CREATE TABLE produces OrioleDB tables.
//   * Applies every db/migrations/*.sql not yet recorded in api._migrations, in order,
//     each in its own transaction. Re-running is safe (idempotent).
import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    [
      'DATABASE_URL is not set in backend/.env.',
      '',
      'Add it from Supabase -> Project Settings -> Database -> Connection string (URI).',
      'Use the "Session pooler" or "Direct connection" URI; it includes your DB password:',
      '  DATABASE_URL=postgresql://postgres.<ref>:<password>@<host>:5432/postgres',
    ].join('\n'),
  );
  process.exit(1);
}

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');
const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

await client.connect();
try {
  // --- Probe ---
  const { rows: [info] } = await client.query(
    `select current_setting('server_version') as version,
            current_setting('default_table_access_method') as default_am,
            exists(select 1 from pg_extension where extname='orioledb') as has_orioledb`,
  );
  console.log(`Postgres ${info.version} | default AM: ${info.default_am} | orioledb: ${info.has_orioledb}`);

  if (info.has_orioledb) {
    await client.query(`set default_table_access_method = 'orioledb'`);
    console.log("OrioleDB detected -> new tables will use 'orioledb'.");
  } else {
    console.log('OrioleDB extension not found -> using the default table access method.');
  }

  // --- Migration tracking ---
  await client.query('create schema if not exists api');
  await client.query(
    'create table if not exists api._migrations (id text primary key, applied_at timestamptz not null default now())',
  );
  const { rows: applied } = await client.query('select id from api._migrations');
  const done = new Set(applied.map((r) => r.id));

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();
  let ran = 0;
  for (const file of files) {
    if (done.has(file)) {
      console.log(`  skip   ${file} (already applied)`);
      continue;
    }
    const sql = await readFile(join(migrationsDir, file), 'utf8');
    process.stdout.write(`  apply  ${file} ... `);
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query('insert into api._migrations (id) values ($1)', [file]);
      await client.query('commit');
      console.log('ok');
      ran++;
    } catch (err) {
      await client.query('rollback');
      console.log('FAILED');
      throw err;
    }
  }

  // --- Verify ---
  const { rows: tables } = await client.query(
    `select table_name from information_schema.tables where table_schema='api' and table_type='BASE TABLE' order by table_name`,
  );
  console.log(`\nApplied ${ran} migration(s). Tables in api: ${tables.map((t) => t.table_name).join(', ')}`);
} finally {
  await client.end();
}

import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

export type Schema = 'kit_lab' | 'kit_test' | 'kit_bench';
export function databaseUrl(): string {
  const raw = process.env.KIT_DATABASE_URL ?? 'postgres://kit:kit_local@127.0.0.1:55437/kit_entrevista_real';
  const url = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
      || url.pathname !== '/kit_entrevista_real' || url.search !== '') {
    throw new Error('Use somente PostgreSQL local no banco kit_entrevista_real, sem parâmetros de conexão adicionais.');
  }
  return raw;
}
export function createPool(schema: Schema = 'kit_lab'): pg.Pool {
  if (!['kit_lab', 'kit_test', 'kit_bench'].includes(schema)) throw new Error('Schema do laboratório inválido');
  return new pg.Pool({ connectionString: databaseUrl(), max: 8, connectionTimeoutMillis: 5000,
    application_name: `${schema}:${randomUUID()}`,
    options: `-c search_path=${schema},public -c statement_timeout=10000` });
}
export async function resetSchema(pool: pg.Pool, schema: Schema): Promise<void> {
  if (!['kit_lab', 'kit_test', 'kit_bench'].includes(schema)) throw new Error('Schema inválido');
  await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE; CREATE SCHEMA ${schema}`);
  await pool.query(await readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8'));
  await pool.query(await readFile(new URL('../sql/fixture.sql', import.meta.url), 'utf8'));
}

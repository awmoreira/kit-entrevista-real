import { afterAll, beforeEach, expect, test } from 'vitest';
import { buildApp, type Version } from '../src/app.js';
import { createPool, databaseUrl, resetSchema } from '../src/db.js';
import { listOrders } from '../src/list-orders.js';
import { scenarios, observeScenario } from './scenarios.js';
import { stockRace } from './stock-race.js';
import { withRowLock } from './fixtures/row-lock.js';
const selected = process.env.KIT_REVIEW_VERSION ?? 'referencia';
if (!['referencia', 'candidato'].includes(selected)) throw new Error('KIT_REVIEW_VERSION inválida');
const version = selected as Version;
const pool = createPool('kit_test');
const headers = { 'x-test-identity': 'empresa-aurora', 'idempotency-key': 'referencia' };
const body = { productId: 'prod-aurora', quantity: 1 };
beforeEach(() => resetSchema(pool, 'kit_test'));
afterAll(() => pool.end());
for (const scenario of scenarios) test(`${scenario.id}: ${scenario.title}`, async () => {
  expect(await observeScenario(scenario, pool, version)).toEqual(scenario.expected);
});
test('mesma chave com conteúdo diferente recebe conflito sem novo débito', async () => {
  const app = buildApp(pool, version);
  try {
    expect((await app.inject({ method: 'POST', url: '/orders', headers, payload: body })).statusCode).toBe(201);
    const conflict = await app.inject({ method: 'POST', url: '/orders', headers, payload: { ...body, quantity: 2 } });
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json().error).toBe('idempotency_conflict');
    expect((await pool.query("SELECT available FROM stock WHERE product_id='prod-aurora'")).rows[0].available).toBe(9);
  } finally { await app.close(); }
});
test('repetições concorrentes retornam um único pedido', async () => {
  const app = buildApp(pool, version);
  try {
    const responses = await Promise.all(Array.from({ length: 6 }, () => app.inject({ method: 'POST', url: '/orders', headers, payload: body })));
    expect(responses.map(r => r.statusCode)).toEqual([201, 201, 201, 201, 201, 201]);
    expect(new Set(responses.map(r => r.json().id)).size).toBe(1);
    expect((await pool.query("SELECT available FROM stock WHERE product_id='prod-aurora'")).rows[0].available).toBe(9);
  } finally { await app.close(); }
});
test('a mesma chave é independente entre empresas', async () => {
  const app = buildApp(pool, version);
  try {
    const aurora = await app.inject({ method: 'POST', url: '/orders', headers, payload: body });
    const brisa = await app.inject({ method: 'POST', url: '/orders', headers: { ...headers, 'x-test-identity': 'empresa-brisa' },
      payload: { productId: 'prod-brisa', quantity: 1 } });
    expect(aurora.statusCode).toBe(201); expect(brisa.statusCode).toBe(201);
    expect(aurora.json().id).not.toBe(brisa.json().id);
  } finally { await app.close(); }
});
test('listagem mantém resultados, ordem e isolamento com menos consultas', async () => {
  const slow = await listOrders(pool, 'aurora', 20, 'lento');
  const fixed = await listOrders(pool, 'aurora', 20, 'corrigido');
  expect(fixed.orders).toEqual(slow.orders); expect(slow.queries).toBe(3); expect(fixed.queries).toBe(2);
  expect(fixed.orders.find(o => o.id === 'hist-aurora-1')?.items).toHaveLength(2);
  expect(fixed.orders.every(o => o.id.includes('aurora'))).toBe(true);
  await pool.query("DELETE FROM order_items WHERE order_id LIKE 'hist-aurora-%'; DELETE FROM orders WHERE tenant_id='aurora'");
  const empty = await listOrders(pool, 'aurora', 20, 'corrigido');
  expect(empty).toEqual({ orders: [], queries: 1 });
});
test('base mantém a listagem e comunica criação indisponível', async () => {
  const app = buildApp(pool, 'base');
  try {
    expect((await app.inject({ url: '/orders', headers })).statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: '/orders', headers, payload: body })).statusCode).toBe(501);
  } finally { await app.close(); }
});
test('conexão recusa destino externo, banco diferente e parâmetros adicionais', () => {
  const original = process.env.KIT_DATABASE_URL;
  try {
    for (const url of ['postgres://a:b@example.com/kit_entrevista_real', 'postgres://a:b@localhost/producao',
      'postgres://a:b@localhost/kit_entrevista_real?host=example.com']) {
      process.env.KIT_DATABASE_URL = url;
      expect(databaseUrl).toThrow('Use somente PostgreSQL local');
    }
  } finally { if (original === undefined) delete process.env.KIT_DATABASE_URL; else process.env.KIT_DATABASE_URL = original; }
});
test('o avaliador de concorrência aceita uma solução com lock de linha', async () => {
  expect(await stockRace(pool, 'referencia', withRowLock)).toEqual({ accepted: 1, rejected: 1, available: 0, orders: 1 });
});
test('reproduz o falso negativo da barreira da edição 1.0 com uma solução válida', async () => {
  await pool.query("UPDATE stock SET available=1 WHERE product_id='prod-aurora'");
  let arrived = 0;
  let release!: () => void;
  let reject!: (error: Error) => void;
  let timer: ReturnType<typeof setTimeout>;
  const gate = new Promise<void>((resolve, fail) => { release = resolve; reject = fail; });
  const afterRead = async () => {
    arrived++;
    if (arrived === 1) timer = setTimeout(() => reject(new Error('old_barrier_timeout')), 300);
    if (arrived === 2) { clearTimeout(timer); release(); }
    await gate;
  };
  const results = await Promise.allSettled(['old-a', 'old-b'].map(key => withRowLock(pool, 'aurora', body, key, { afterRead })));
  expect(results.every(r => r.status === 'rejected' && r.reason instanceof Error && r.reason.message === 'old_barrier_timeout')).toBe(true);
  expect((await pool.query("SELECT available FROM stock WHERE product_id='prod-aurora'")).rows[0].available).toBe(1);
});

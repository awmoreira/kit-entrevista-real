import { afterAll, beforeEach, expect, test } from 'vitest';
import { buildApp } from '../src/app.js';
import { createPool, databaseUrl, resetSchema } from '../src/db.js';
import { listOrders } from '../src/list-orders.js';
import { scenarios, observeScenario } from './scenarios.js';
const pool = createPool('kit_test');
const headers = { 'x-test-identity': 'empresa-aurora', 'idempotency-key': 'referencia' };
const body = { productId: 'prod-aurora', quantity: 1 };
beforeEach(() => resetSchema(pool, 'kit_test'));
afterAll(() => pool.end());
for (const scenario of scenarios) test(`${scenario.id}: ${scenario.title}`, async () => {
  expect(await observeScenario(scenario, pool, 'referencia')).toEqual(scenario.expected);
});
test('mesma chave com conteúdo diferente recebe conflito sem novo débito', async () => {
  const app = buildApp(pool, 'referencia');
  try {
    expect((await app.inject({ method: 'POST', url: '/orders', headers, payload: body })).statusCode).toBe(201);
    const conflict = await app.inject({ method: 'POST', url: '/orders', headers, payload: { ...body, quantity: 2 } });
    expect(conflict.statusCode).toBe(409);
    expect(conflict.json().error).toBe('idempotency_conflict');
    expect((await pool.query("SELECT available FROM stock WHERE product_id='prod-aurora'")).rows[0].available).toBe(9);
  } finally { await app.close(); }
});
test('repetições concorrentes retornam um único pedido', async () => {
  const app = buildApp(pool, 'referencia');
  try {
    const responses = await Promise.all(Array.from({ length: 6 }, () => app.inject({ method: 'POST', url: '/orders', headers, payload: body })));
    expect(responses.map(r => r.statusCode)).toEqual([201, 201, 201, 201, 201, 201]);
    expect(new Set(responses.map(r => r.json().id)).size).toBe(1);
    expect((await pool.query("SELECT available FROM stock WHERE product_id='prod-aurora'")).rows[0].available).toBe(9);
  } finally { await app.close(); }
});
test('a mesma chave é independente entre empresas', async () => {
  const app = buildApp(pool, 'referencia');
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

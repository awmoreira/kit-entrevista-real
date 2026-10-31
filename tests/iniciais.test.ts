import { afterAll, beforeEach, expect, test } from 'vitest';
import { buildApp } from '../src/app.js';
import { createPool, resetSchema } from '../src/db.js';
const pool = createPool('kit_test');
const app = buildApp(pool, 'proposta');
const headers = { 'x-test-identity': 'empresa-aurora', 'idempotency-key': 'teste-normal' };
beforeEach(() => resetSchema(pool, 'kit_test'));
afterAll(async () => { await app.close(); await pool.end(); });
test('lista pedidos da identidade local', async () => {
  const res = await app.inject({ url: '/orders', headers });
  expect(res.statusCode).toBe(200);
  expect(res.json().orders.map((o: {id: string}) => o.id)).toEqual(['hist-aurora-2', 'hist-aurora-1']);
});
test('cria um pedido com estoque disponível', async () => {
  const res = await app.inject({ method: 'POST', url: '/orders', headers,
    payload: { productId: 'prod-aurora', quantity: 2, priceCents: 1500 } });
  expect(res.statusCode).toBe(201);
  expect(res.json()).toMatchObject({ tenantId: 'aurora', quantity: 2, totalCents: 3000 });
  expect((await pool.query("SELECT available FROM stock WHERE product_id='prod-aurora'")).rows[0].available).toBe(8);
});
test('rejeita quantidade inválida', async () => {
  expect((await app.inject({ method: 'POST', url: '/orders', headers,
    payload: { productId: 'prod-aurora', quantity: 0 } })).statusCode).toBe(400);
});
test('rejeita produto inexistente', async () => {
  expect((await app.inject({ method: 'POST', url: '/orders', headers,
    payload: { productId: 'inexistente', quantity: 1 } })).statusCode).toBe(404);
});
test('rejeita estoque insuficiente em uma compra sequencial', async () => {
  expect((await app.inject({ method: 'POST', url: '/orders', headers,
    payload: { productId: 'prod-aurora', quantity: 11 } })).statusCode).toBe(409);
});
test('exige identidade de teste conhecida', async () => {
  expect((await app.inject({ url: '/orders' })).statusCode).toBe(401);
  expect((await app.inject({ url: '/orders', headers: { 'x-test-identity': 'toString' } })).statusCode).toBe(401);
});
test('exige chave de repetição e limita a listagem', async () => {
  expect((await app.inject({ method: 'POST', url: '/orders', headers: { 'x-test-identity': 'empresa-aurora' },
    payload: { productId: 'prod-aurora', quantity: 1 } })).statusCode).toBe(400);
  expect((await app.inject({ url: '/orders?limit=101', headers })).statusCode).toBe(400);
  expect((await app.inject({ url: '/orders?limit=1', headers })).json().orders).toHaveLength(1);
});

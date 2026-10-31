// Código de diagnóstico: consulte depois da tentativa de review.
import type { Pool } from 'pg';
import { buildApp, type Version } from '../src/app.js';
import { resetSchema } from '../src/db.js';
type Facts = Record<string, number | string>;
export interface Scenario { id: string; title: string; expected: Facts; broken: Facts; observe: (pool: Pool, version: Version) => Promise<Facts> }
const headers = { 'x-test-identity': 'empresa-aurora', 'idempotency-key': 'diagnostico' };
const body = { productId: 'prod-aurora', quantity: 1 };
async function stock(pool: Pool, product = 'prod-aurora'): Promise<number> {
  return (await pool.query<{available: number}>('SELECT available FROM stock WHERE product_id=$1', [product])).rows[0].available;
}
async function count(pool: Pool): Promise<number> {
  return Number((await pool.query("SELECT count(*) FROM orders WHERE id NOT LIKE 'hist-%'" )).rows[0].count);
}
function barrier(parties: number) {
  let arrived = 0;
  let release!: () => void;
  let timer: ReturnType<typeof setTimeout>;
  const gate = new Promise<void>((resolve, reject) => {
    release = resolve;
    timer = setTimeout(() => reject(new Error('As duas transações não atingiram a barreira em 5s')), 5000);
  });
  return async () => { if (++arrived === parties) { clearTimeout(timer); release(); } await gate; };
}
export const scenarios: Scenario[] = [
  { id: 'B01', title: 'Produto de outra empresa não pode ser comprado',
    expected: { status: 404, foreignStock: 10, orders: 0 }, broken: { status: 201, foreignStock: 9, orders: 1 },
    observe: async (pool, version) => {
      const app = buildApp(pool, version);
      try {
        const res = await app.inject({ method: 'POST', url: '/orders', headers, payload: { ...body, productId: 'prod-brisa' } });
        return { status: res.statusCode, foreignStock: await stock(pool, 'prod-brisa'), orders: await count(pool) };
      } finally { await app.close(); }
    } },
  { id: 'B02', title: 'O preço autoritativo vem do catálogo',
    expected: { status: 201, unitPriceCents: 1500, totalCents: 3000 }, broken: { status: 201, unitPriceCents: 1, totalCents: 2 },
    observe: async (pool, version) => {
      const app = buildApp(pool, version);
      try {
        const res = await app.inject({ method: 'POST', url: '/orders', headers, payload: { ...body, quantity: 2, priceCents: 1 } });
        if (res.statusCode !== 201) throw new Error('B02: a compra válida não chegou ao cálculo de preço');
        const order = res.json();
        return { status: res.statusCode, unitPriceCents: order.unitPriceCents, totalCents: order.totalCents };
      } finally { await app.close(); }
    } },
  { id: 'B03', title: 'Duas compras concorrentes não tornam estoque negativo',
    expected: { accepted: 1, rejected: 1, available: 0, orders: 1 }, broken: { accepted: 2, rejected: 0, available: -1, orders: 2 },
    observe: async (pool, version) => {
      await pool.query("UPDATE stock SET available=1 WHERE product_id='prod-aurora'");
      const app = buildApp(pool, version, { hooks: { afterRead: barrier(2) } });
      try {
        const responses = await Promise.all(['compra-a', 'compra-b'].map(key => app.inject({ method: 'POST', url: '/orders',
          headers: { ...headers, 'idempotency-key': key }, payload: body })));
        if (responses.some(r => ![201, 409].includes(r.statusCode))) throw new Error('B03: resposta inesperada antes da verificação de concorrência');
        return { accepted: responses.filter(r => r.statusCode === 201).length,
          rejected: responses.filter(r => r.statusCode === 409).length, available: await stock(pool), orders: await count(pool) };
      } finally { await app.close(); }
    } },
  { id: 'B04', title: 'Falha de persistência desfaz a reserva de estoque',
    expected: { status: 500, sqlState: '22012', available: 10, orders: 0 }, broken: { status: 500, sqlState: '22012', available: 9, orders: 0 },
    observe: async (pool, version) => {
      let sqlState = 'not_reached';
      const app = buildApp(pool, version, { hooks: { beforeInsert: async db => {
        try { await db.query('SELECT 1/0'); }
        catch (error) { sqlState = (error as {code: string}).code; throw error; }
      } } });
      try {
        const res = await app.inject({ method: 'POST', url: '/orders', headers, payload: body });
        if (sqlState !== '22012') throw new Error('B04: a falha SQL controlada não foi atingida');
        return { status: res.statusCode, sqlState, available: await stock(pool), orders: await count(pool) };
      } finally { await app.close(); }
    } },
  { id: 'B05', title: 'Repetir a mesma chave retorna o mesmo pedido',
    expected: { first: 201, second: 201, sameId: 1, available: 9, orders: 1 },
    broken: { first: 201, second: 201, sameId: 0, available: 8, orders: 2 },
    observe: async (pool, version) => {
      const app = buildApp(pool, version);
      try {
        const first = await app.inject({ method: 'POST', url: '/orders', headers, payload: body });
        const second = await app.inject({ method: 'POST', url: '/orders', headers, payload: body });
        if (first.statusCode !== 201 || second.statusCode !== 201) throw new Error('B05: as duas requisições precisam chegar à criação');
        return { first: first.statusCode, second: second.statusCode, sameId: Number(first.json().id === second.json().id),
          available: await stock(pool), orders: await count(pool) };
      } finally { await app.close(); }
    } },
];
export async function observeScenario(scenario: Scenario, pool: Pool, version: Version) {
  await resetSchema(pool, 'kit_test');
  return scenario.observe(pool, version);
}

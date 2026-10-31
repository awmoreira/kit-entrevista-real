import type { Pool } from 'pg';
import { setTimeout as delay } from 'node:timers/promises';
import { buildApp, type Version } from '../src/app.js';
import type { CreateOrder } from '../src/domain.js';

// Bloqueia a linha no banco até as duas operações concorrentes estarem em espera.
// Uma leitura comum pode avançar; SELECT FOR UPDATE também é uma solução aceita.
export async function stockRace(pool: Pool, version: Version, override?: CreateOrder) {
  await pool.query("UPDATE stock SET available=1 WHERE product_id='prod-aurora'");
  const application = (await pool.query('SHOW application_name')).rows[0].application_name as string;
  const guard = await pool.connect();
  const app = buildApp(pool, version, { createOrder: override });
  let pending: Promise<Awaited<ReturnType<typeof app.inject>>[]> | undefined;
  let committed = false;
  try {
    await guard.query('BEGIN');
    await guard.query("SELECT available FROM stock WHERE product_id='prod-aurora' FOR UPDATE");
    pending = Promise.all(['compra-a', 'compra-b'].map(key => app.inject({ method: 'POST', url: '/orders',
      headers: { 'x-test-identity': 'empresa-aurora', 'idempotency-key': key },
      payload: { productId: 'prod-aurora', quantity: 1 } })));
    const deadline = Date.now() + 5000;
    let waiters = 0;
    while (waiters < 2) {
      const state = await pool.query(`SELECT count(*)::int AS n FROM pg_stat_activity
        WHERE datname=current_database() AND application_name=$1 AND wait_event_type='Lock'`, [application]);
      waiters = state.rows[0].n as number;
      if (waiters < 2) {
        if (Date.now() >= deadline) throw new Error('B03: duas operações não atingiram a espera de lock em 5s');
        await delay(10);
      }
    }
    await guard.query('COMMIT'); committed = true;
    const responses = await pending;
    if (responses.some(r => ![201, 409].includes(r.statusCode))) throw new Error('B03: resposta inesperada antes de verificar concorrência');
    return { accepted: responses.filter(r => r.statusCode === 201).length,
      rejected: responses.filter(r => r.statusCode === 409).length,
      available: (await pool.query("SELECT available FROM stock WHERE product_id='prod-aurora'")).rows[0].available as number,
      orders: Number((await pool.query("SELECT count(*) FROM orders WHERE id NOT LIKE 'hist-%'")).rows[0].count) };
  } finally {
    if (!committed) await guard.query('ROLLBACK');
    guard.release();
    if (pending) await Promise.allSettled([pending]);
    await app.close();
  }
}

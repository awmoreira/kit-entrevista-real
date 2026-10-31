import { randomUUID } from 'node:crypto';
import { DomainError, type CreateOrder, type Order } from '../../src/domain.js';

// Solução válida que adquire lock de linha antes de reservar. Um avaliador que
// exige duas leituras simultâneas rejeitaria esta implementação indevidamente.
export const withRowLock: CreateOrder = async (pool, tenant, input, key, hooks = {}) => {
  const client = await pool.connect();
  const fingerprint = JSON.stringify([input.productId, input.quantity]);
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [JSON.stringify([tenant, key])]);
    const prior = (await client.query<{fingerprint: string; response: Order}>(
      'SELECT fingerprint,response FROM idempotency WHERE tenant_id=$1 AND key=$2', [tenant,key])).rows[0];
    if (prior) {
      if (prior.fingerprint !== fingerprint) throw new DomainError(409, 'idempotency_conflict');
      await client.query('COMMIT'); return prior.response;
    }
    const product = (await client.query<{price_cents: number; available: number}>(
      'SELECT p.price_cents,s.available FROM products p JOIN stock s ON s.product_id=p.id WHERE p.id=$1 AND p.tenant_id=$2 FOR UPDATE OF s',
      [input.productId, tenant])).rows[0];
    if (!product) throw new DomainError(404, 'product_not_found');
    if (product.available < input.quantity) throw new DomainError(409, 'insufficient_stock');
    await hooks.afterRead?.(client);
    // A exclusão por lock protege a leitura seguida de atualização sem condição.
    await client.query('UPDATE stock SET available=available-$1 WHERE product_id=$2', [input.quantity,input.productId]);
    await hooks.beforeInsert?.(client);
    const order: Order = { id: randomUUID(), tenantId: tenant, productId: input.productId,
      quantity: input.quantity, unitPriceCents: product.price_cents, totalCents: product.price_cents*input.quantity };
    await client.query('INSERT INTO orders (id,tenant_id,total_cents) VALUES ($1,$2,$3)', [order.id,tenant,order.totalCents]);
    await client.query('INSERT INTO order_items VALUES ($1,$2,$3,$4)', [order.id,input.productId,input.quantity,order.unitPriceCents]);
    await client.query('INSERT INTO idempotency VALUES ($1,$2,$3,$4)', [tenant,key,fingerprint,order]);
    await client.query('COMMIT'); return order;
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
};

import { randomUUID } from 'node:crypto';
import { DomainError, type CreateOrder, type Order } from '../domain.js';

export const createOrder: CreateOrder = async (pool, tenant, input, key, hooks = {}) => {
  const client = await pool.connect();
  const fingerprint = JSON.stringify([input.productId, input.quantity]);
  try {
    await client.query('BEGIN');
    // Serializa somente a mesma chave da mesma empresa; o lock termina com a transação.
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [JSON.stringify([tenant, key])]);
    const previous = await client.query<{fingerprint: string; response: Order}>(
      'SELECT fingerprint,response FROM idempotency WHERE tenant_id=$1 AND key=$2', [tenant, key]);
    if (previous.rows[0]) {
      if (previous.rows[0].fingerprint !== fingerprint) throw new DomainError(409, 'idempotency_conflict');
      await client.query('COMMIT');
      return previous.rows[0].response;
    }
    const { rows } = await client.query<{price_cents: number}>(
      'SELECT price_cents FROM products WHERE id=$1 AND tenant_id=$2', [input.productId, tenant]);
    if (!rows[0]) throw new DomainError(404, 'product_not_found');
    await hooks.afterRead?.();
    const reserved = await client.query(
      'UPDATE stock SET available=available-$1 WHERE product_id=$2 AND available >= $1 RETURNING available',
      [input.quantity, input.productId]);
    if (reserved.rowCount !== 1) throw new DomainError(409, 'insufficient_stock');
    await hooks.beforeInsert?.(client);
    const unitPriceCents = rows[0].price_cents;
    const order: Order = { id: randomUUID(), tenantId: tenant, productId: input.productId,
      quantity: input.quantity, unitPriceCents, totalCents: unitPriceCents * input.quantity };
    await client.query('INSERT INTO orders (id,tenant_id,total_cents) VALUES ($1,$2,$3)', [order.id, tenant, order.totalCents]);
    await client.query('INSERT INTO order_items VALUES ($1,$2,$3,$4)', [order.id, input.productId, input.quantity, unitPriceCents]);
    await client.query('INSERT INTO idempotency VALUES ($1,$2,$3,$4)', [tenant, key, fingerprint, order]);
    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
};

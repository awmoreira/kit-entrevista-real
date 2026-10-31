// Espaço de prática. Corrija esta cópia; preserve proposta.ts e referencia.ts.
import { randomUUID } from 'node:crypto';
import { DomainError, type CreateOrder, type Order } from '../domain.js';

export const createOrder: CreateOrder = async (pool, tenant, input, _key, hooks = {}) => {
  const { rows } = await pool.query<{ price_cents: number; available: number }>(
    'SELECT p.price_cents, s.available FROM products p JOIN stock s ON s.product_id=p.id WHERE p.id=$1',
    [input.productId],
  );
  const product = rows[0];
  if (!product) throw new DomainError(404, 'product_not_found');
  if (product.available < input.quantity) throw new DomainError(409, 'insufficient_stock');
  await hooks.afterRead?.(pool);
  const unitPriceCents = input.priceCents ?? product.price_cents;
  const order: Order = { id: randomUUID(), tenantId: tenant, productId: input.productId,
    quantity: input.quantity, unitPriceCents, totalCents: unitPriceCents * input.quantity };
  await pool.query('UPDATE stock SET available=available-$1 WHERE product_id=$2', [input.quantity, input.productId]);
  await hooks.beforeInsert?.(pool);
  await pool.query('INSERT INTO orders (id,tenant_id,total_cents) VALUES ($1,$2,$3)', [order.id, tenant, order.totalCents]);
  await pool.query('INSERT INTO order_items VALUES ($1,$2,$3,$4)', [order.id, input.productId, input.quantity, unitPriceCents]);
  return order;
};

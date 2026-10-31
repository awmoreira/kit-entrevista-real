import type { Pool, QueryResultRow } from 'pg';
export const orderQuery = "SELECT id,status,created_at::text AS \"createdAt\" FROM orders WHERE tenant_id=$1 AND status='confirmed' ORDER BY created_at DESC,id DESC LIMIT $2";
interface Row extends QueryResultRow { id: string; status: string; createdAt: string }
interface Item extends QueryResultRow { orderId: string; productId: string; quantity: number; unitPriceCents: number }
export async function listOrders(pool: Pool, tenant: string, limit: number, mode: 'lento' | 'corrigido') {
  let queries = 0;
  const query = async <T extends QueryResultRow>(sql: string, values: unknown[]) => {
    queries++; return (await pool.query<T>(sql, values)).rows;
  };
  const orders = await query<Row>(orderQuery, [tenant, limit]);
  const grouped = new Map<string, Omit<Item, 'orderId'>[]>();
  const itemSql = 'SELECT order_id AS "orderId",product_id AS "productId",quantity,unit_price_cents AS "unitPriceCents" FROM order_items';
  const items = mode === 'corrigido'
    ? (orders.length ? await query<Item>(`${itemSql} WHERE order_id=ANY($1::text[]) ORDER BY order_id,product_id`, [orders.map(o => o.id)]) : [])
    : (await Promise.all(orders.map(o => query<Item>(`${itemSql} WHERE order_id=$1 ORDER BY product_id`, [o.id])))).flat();
  for (const { orderId, ...item } of items) grouped.set(orderId, [...(grouped.get(orderId) ?? []), item]);
  return { orders: orders.map(o => ({ ...o, items: grouped.get(o.id) ?? [] })), queries };
}

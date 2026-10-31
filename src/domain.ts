import type { Pool, PoolClient } from 'pg';
export class DomainError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
export interface OrderInput { productId: string; quantity: number; priceCents?: number }
export interface Order {
  id: string; tenantId: string; productId: string; quantity: number;
  unitPriceCents: number; totalCents: number;
}
export interface Hooks {
  afterRead?: () => Promise<void>;
  beforeInsert?: (db: Pool | PoolClient) => Promise<void>;
}
export type CreateOrder = (pool: Pool, tenant: string, input: OrderInput, key: string, hooks?: Hooks) => Promise<Order>;

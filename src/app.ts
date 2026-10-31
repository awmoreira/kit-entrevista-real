import Fastify from 'fastify';
import { z } from 'zod';
import type { Pool } from 'pg';
import { DomainError, type Hooks } from './domain.js';
import { createOrder as base } from './versions/base.js';
import { createOrder as proposta } from './versions/proposta.js';
import { createOrder as referencia } from './versions/referencia.js';
import { listOrders } from './list-orders.js';
export type Version = 'base' | 'proposta' | 'referencia';
const creators = { base, proposta, referencia };
const identities: Record<string, string> = { 'empresa-aurora': 'aurora', 'empresa-brisa': 'brisa' };
const input = z.object({ productId: z.string().min(1).max(80), quantity: z.number().int().min(1).max(20),
  priceCents: z.number().int().min(0).max(1000000).optional() }).strict();
export function buildApp(pool: Pool, version: Version = 'proposta', options: { listMode?: 'lento' | 'corrigido'; hooks?: Hooks } = {}) {
  const app = Fastify({ logger: false, bodyLimit: 16384 });
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof DomainError) return reply.code(error.status).send({ error: error.code });
    const code = typeof error === 'object' && error !== null && 'statusCode' in error ? error.statusCode : undefined;
    const status = typeof code === 'number' && code >= 400 && code < 500 ? code : 500;
    return reply.code(status).send({ error: status === 500 ? 'internal_error' : 'invalid_request' });
  });
  app.addHook('onRequest', async (request) => {
    const token = request.headers['x-test-identity'];
    if (typeof token !== 'string' || !Object.hasOwn(identities, token)) throw new DomainError(401, 'test_identity_required');
  });
  app.get('/orders', async (request, reply) => {
    const parsed = z.object({ limit: z.coerce.number().int().min(1).max(100).default(20) }).strict().safeParse(request.query);
    if (!parsed.success) throw new DomainError(400, 'invalid_query');
    const result = await listOrders(pool, identities[request.headers['x-test-identity'] as string], parsed.data.limit,
      options.listMode ?? (version === 'referencia' ? 'corrigido' : 'lento'));
    reply.header('x-lab-sql-count', String(result.queries));
    return { orders: result.orders };
  });
  app.post('/orders', async (request, reply) => {
    const parsed = input.safeParse(request.body);
    const key = request.headers['idempotency-key'];
    if (!parsed.success || typeof key !== 'string' || !/^[a-zA-Z0-9._:-]{1,100}$/.test(key)) throw new DomainError(400, 'invalid_order');
    const result = await creators[version](pool, identities[request.headers['x-test-identity'] as string], parsed.data, key, options.hooks);
    return reply.code(201).send(result);
  });
  return app;
}

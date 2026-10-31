import { deepStrictEqual, strictEqual } from 'node:assert';
import { arch, cpus, platform, release } from 'node:os';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { buildApp } from '../src/app.js';
import { createPool, resetSchema } from '../src/db.js';
import { orderQuery } from '../src/list-orders.js';
import { version, benchmarkFiles, fingerprint } from './edition.mjs';
const pool = createPool('kit_bench');
const headers = { 'x-test-identity': 'empresa-aurora' };
const observations: { mode: string; samples: number; concurrency: number; queries: number; p50Ms: number; p95Ms: number; responseSha256: string }[] = [];
try {
  await resetSchema(pool, 'kit_bench');
  await pool.query(await readFile(new URL('../sql/volume.sql', import.meta.url), 'utf8'));
  const postgres = (await pool.query('SHOW server_version')).rows[0].server_version as string;
  const plans: Record<string, unknown> = {};
  plans.before = (await pool.query(`EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) ${orderQuery}`, ['aurora', 50])).rows[0]['QUERY PLAN'];
  let canonical = '';
  const investigationCards = [];
  const observed = buildApp(pool, 'proposta');
  try {
    for (const limit of [1, 20, 50]) {
      const response = await observed.inject({ url: `/orders?limit=${limit}`, headers });
      strictEqual(response.statusCode, 200);
      investigationCards.push({ requestedLimit: limit, returnedOrders: response.json().orders.length as number,
        queries: Number(response.headers['x-lab-sql-count']) });
    }
  } finally { await observed.close(); }
  for (const mode of ['lento', 'corrigido'] as const) {
    const app = buildApp(pool, 'referencia', { listMode: mode });
    try {
      for (let i = 0; i < 3; i++) await app.inject({ url: '/orders?limit=50', headers });
      const times: number[] = [];
      let queries = 0;
      let response = '';
      for (let i = 0; i < 20; i++) {
        const start = performance.now();
        const result = await app.inject({ url: '/orders?limit=50', headers });
        times.push(performance.now() - start);
        strictEqual(result.statusCode, 200);
        response = result.body;
        if (canonical) deepStrictEqual(JSON.parse(response), JSON.parse(canonical)); else canonical = response;
        queries = Number(result.headers['x-lab-sql-count']);
        strictEqual(queries, mode === 'lento' ? 51 : 2);
      }
      times.sort((a,b) => a-b);
      const ms = (n: number) => Math.round(n * 100) / 100;
      observations.push({ mode, samples: times.length, concurrency: 1, queries,
        p50Ms: ms(times[Math.ceil(times.length * .5)-1]), p95Ms: ms(times[Math.ceil(times.length * .95)-1]),
        responseSha256: createHash('sha256').update(response).digest('hex') });
    } finally { await app.close(); }
  }
  await pool.query('CREATE INDEX orders_tenant_status_created_idx ON orders (tenant_id,status,created_at DESC,id DESC); ANALYZE orders');
  plans.after = (await pool.query(`EXPLAIN (ANALYZE,BUFFERS,FORMAT JSON) ${orderQuery}`, ['aurora', 50])).rows[0]['QUERY PLAN'];
  await mkdir('evidencias', { recursive: true });
  const plansBytes = JSON.stringify(plans, null, 2) + '\n';
  const report = { version, capturedAt: new Date().toISOString(), transport: 'Fastify inject: HTTP em processo; PostgreSQL por TCP local',
    sourceFiles: benchmarkFiles, sourceSha256: await fingerprint(benchmarkFiles),
    plansSha256: createHash('sha256').update(plansBytes).digest('hex'), investigationCards,
    environment: { node: process.version, postgres, os: `${platform()} ${release()}`, arch: arch(), cpu: cpus()[0].model, logicalCpus: cpus().length, poolMax: 8 },
    dataset: { seed: 'generate_series 1..10000 por empresa; relógio fixo 2026-01-01 UTC', tenants: 2, orders: 20000, items: 20000,
      confirmedPerTenant: 8000, pageSize: 50, warmup: 3, indexDuringComparison: false }, observations };
  await writeFile('evidencias/benchmark.json', JSON.stringify(report, null, 2) + '\n');
  await writeFile('evidencias/planos.json', plansBytes);
  const rows = observations.map(o => `| ${o.mode} | ${o.queries} | ${o.p50Ms} ms | ${o.p95Ms} ms |`).join('\n');
  await writeFile('conteudo/medicoes.md', `# Medições capturadas\n\nEdição ${version}. Captura: ${report.capturedAt}.\n\n` +
    `Ambiente: ${report.environment.os}, ${report.environment.arch}, ${report.environment.cpu}; Node ${process.version}; PostgreSQL ${postgres}; pool máximo 8.\n\n` +
    `Dados sintéticos: 20.000 pedidos e 20.000 itens; duas empresas; 8.000 pedidos confirmados por empresa. Página de 50 pedidos, três aquecimentos e 20 amostras por versão, concorrência 1. Transporte: Fastify inject, com PostgreSQL por TCP local. A comparação ocorreu sem o índice composto nas duas versões.\n\n` +
    `| Versão | Consultas por requisição | p50 | p95 |\n| --- | --- | --- | --- |\n${rows}\n\n` +
    `As respostas completas foram comparadas a cada amostra e preservam conteúdo e ordem. O número de consultas caiu de 51 para 2. A versão lenta paraleliza as consultas de itens, limitada pelo pool; ainda executa uma consulta adicional por pedido.\n\n` +
    `Os tempos descrevem esta execução, sem rede HTTP externa ou tráfego concorrente. Não representam um SLO nem garantem o mesmo ganho em outra máquina. A extensão de índice foi medida separadamente com EXPLAIN ANALYZE e buffers, antes e depois da criação do índice, em evidencias/planos.json.\n\n` +
    `Para reproduzir: execute npm run bench com o PostgreSQL do kit ativo. O comando reescreve as evidências e este capítulo; não altera o schema kit_lab.\n`);
  console.log(JSON.stringify(report, null, 2));
} finally { await pool.end(); }

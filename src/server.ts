import { buildApp, type Version } from './app.js';
import { createPool } from './db.js';
const version = (process.argv[2] ?? 'proposta') as Version;
if (!['base', 'proposta', 'referencia'].includes(version)) throw new Error('Versão: base | proposta | referencia');
const pool = createPool();
const app = buildApp(pool, version);
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void app.close().then(() => pool.end()); });
await app.listen({ host: '127.0.0.1', port: 3337 });
console.log(`Laboratório ${version}: http://127.0.0.1:3337. Identidade: x-test-identity: empresa-aurora`);

import { createPool, resetSchema } from '../src/db.js';
const pool = createPool();
try { await resetSchema(pool, 'kit_lab'); console.log('Somente o schema kit_lab foi reiniciado; identidades Aurora e Brisa prontas.'); }
finally { await pool.end(); }

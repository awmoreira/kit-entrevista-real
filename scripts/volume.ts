import { readFile } from 'node:fs/promises';
import { createPool } from '../src/db.js';
const pool = createPool();
try {
  await pool.query(await readFile(new URL('../sql/volume.sql', import.meta.url), 'utf8'));
  console.log('kit_lab: 20.000 pedidos sintéticos; duas empresas. lab:reset retorna à amostra pequena.');
} finally { await pool.end(); }

import { deepStrictEqual, AssertionError } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import { createPool } from '../src/db.js';
import { scenarios, observeScenario } from '../tests/scenarios.js';
import { version, proofFiles, fingerprint } from './edition.mjs';
const selected = process.argv[2];
if (selected && !scenarios.some(s => s.id === selected)) throw new Error('Identificador: B01, B02, B03, B04 ou B05');
const pool = createPool('kit_test');
const results = [];
try {
  for (const scenario of scenarios.filter(s => !selected || s.id === selected)) {
    // Erros de preparação e execução escapam antes de comparar os resultados.
    const proposed = await observeScenario(scenario, pool, 'proposta');
    deepStrictEqual(proposed, scenario.broken, `${scenario.id}: o defeito não produziu o resultado específico previsto`);
    let regressionFailed = false;
    try { deepStrictEqual(proposed, scenario.expected); }
    catch (error) { if (!(error instanceof AssertionError)) throw error; regressionFailed = true; }
    if (!regressionFailed) throw new Error(`${scenario.id}: a regressão não falhou na proposta`);
    const reference = await observeScenario(scenario, pool, 'referencia');
    deepStrictEqual(reference, scenario.expected, `${scenario.id}: a referência não corrigiu o defeito`);
    results.push({ id: scenario.id, title: scenario.title, expected: scenario.expected, proposed, reference, regressionFailed });
    console.log(`${scenario.id}: falha específica na proposta; passa na referência.`);
  }
  const report = { version, capturedAt: new Date().toISOString(), node: process.version,
    postgres: (await pool.query('SHOW server_version')).rows[0].server_version,
    sourceFiles: proofFiles, sourceSha256: await fingerprint(proofFiles), results };
  await mkdir(selected ? 'tmp' : 'evidencias', { recursive: true });
  await writeFile(selected ? `tmp/prova-${selected}.json` : 'evidencias/provas-bugs.json', JSON.stringify(report, null, 2) + '\n');
} finally { await pool.end(); }

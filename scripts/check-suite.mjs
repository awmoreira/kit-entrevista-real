import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { sourceHash } from './source-hash.mjs';
import { version, releaseSteps } from './edition.mjs';
const steps = releaseSteps;
const checks = [];
const startedAt = new Date().toISOString();
await mkdir('evidencias', { recursive: true });
const save = async (status, sourceSha256) => writeFile('evidencias/checks.json', JSON.stringify({
  version, startedAt, capturedAt: new Date().toISOString(), node: process.version, status, sourceSha256, checks,
}, null, 2) + '\n');
await save('running');
for (const name of steps) {
  const start = performance.now();
  const result = spawnSync('npm', name === 'test' ? ['test'] : ['run', name], { stdio: 'inherit', shell: process.platform === 'win32', timeout: 120000 });
  checks.push({ name, exitCode: result.status ?? -1, durationMs: Math.round(performance.now() - start) });
  if (result.error || result.status !== 0) {
    await save('failed');
    if (result.error) throw result.error;
    process.exit(result.status ?? 1);
  }
}
await save('passed', await sourceHash());
console.log('Verificação da edição concluída. Inspeção visual e cópia limpa são registradas separadamente.');

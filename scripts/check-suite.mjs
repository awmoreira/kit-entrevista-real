import { spawnSync } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { sourceHash } from './source-hash.mjs';
await rm('evidencias/checks.json', { force: true });
const steps = ['typecheck', 'lint', 'test', 'test:reference', 'verify:bugs', 'docs:check', 'docs:build', 'docs:verify'];
const checks = [];
for (const name of steps) {
  const start = performance.now();
  const result = spawnSync('npm', name === 'test' ? ['test'] : ['run', name], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) throw result.error;
  checks.push({ name, exitCode: result.status, durationMs: Math.round(performance.now() - start) });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
await mkdir('evidencias', { recursive: true });
await writeFile('evidencias/checks.json', JSON.stringify({ version: '1.0.0', capturedAt: new Date().toISOString(), node: process.version, sourceSha256: await sourceHash(), checks }, null, 2) + '\n');
console.log('Verificação da edição concluída. Inspeção visual e cópia limpa são registradas separadamente.');

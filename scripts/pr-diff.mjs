import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const result = spawnSync('git', ['diff', '--no-index', '--', 'src/versions/base.ts', 'src/versions/proposta.ts'], { encoding: 'utf8' });
if (result.error || ![0, 1].includes(result.status)) throw result.error ?? new Error(result.stderr);
await mkdir('exercicios/review', { recursive: true });
await writeFile('exercicios/review/proposta.diff', result.stdout);
console.log('Diff base -> proposta atualizado em exercicios/review/proposta.diff');

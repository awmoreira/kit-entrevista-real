import { spawnSync } from 'node:child_process';
const version = process.argv[2];
if (!['referencia', 'candidato'].includes(version)) throw new Error('Escolha referencia ou candidato');
if (version === 'candidato') console.log('Avaliação de src/versions/candidato.ts. A cópia inicial deve falhar; os gabaritos não são alterados.');
const result = spawnSync('npm', ['exec', '--', 'vitest', 'run', 'tests/referencia.test.ts'], {
  env: { ...process.env, KIT_REVIEW_VERSION: version }, stdio: 'inherit', timeout: 60000,
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);

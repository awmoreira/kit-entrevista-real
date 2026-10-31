import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
export const version = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version;
export const releaseSteps = ['typecheck', 'lint', 'test', 'test:reference', 'verify:bugs', 'docs:check', 'docs:build', 'docs:verify'];
const labFiles = ['package.json', 'package-lock.json', 'src/app.ts', 'src/db.ts', 'src/domain.ts', 'src/list-orders.ts',
  'src/versions/base.ts', 'src/versions/proposta.ts', 'src/versions/referencia.ts', 'src/versions/candidato.ts',
  'sql/schema.sql', 'sql/fixture.sql', 'sql/volume.sql', 'scripts/edition.mjs'];
export const proofFiles = [...labFiles, 'tests/scenarios.ts', 'tests/stock-race.ts', 'scripts/verify-bugs.ts'];
export const benchmarkFiles = [...labFiles, 'scripts/benchmark.ts'];
export async function fingerprint(files) {
  const hash = createHash('sha256');
  for (const path of files) { hash.update(path + '\0'); hash.update(await readFile(path)); }
  return hash.digest('hex');
}
export async function visualFingerprint() {
  const volumes = JSON.parse(await readFile('conteudo/volumes.json', 'utf8'));
  return fingerprint(['package.json', 'requirements-docs.txt', 'conteudo/volumes.json', 'scripts/build-pdfs.py', ...volumes.flatMap(v => v.sources)]);
}

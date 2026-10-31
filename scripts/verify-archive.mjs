import { spawn, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { strictEqual, ok } from 'node:assert';
import { setTimeout as delay } from 'node:timers/promises';
const version = JSON.parse(await readFile('package.json', 'utf8')).version;
const folder = resolve('tmp/archive-check');
const python = process.env.KIT_PYTHON ?? (existsSync('.venv/bin/python') ? '.venv/bin/python' : 'python3');
const unpack = spawnSync(python, ['-c', `
import sys, zipfile, shutil
from pathlib import Path, PurePosixPath
archive, target = Path(sys.argv[1]), Path(sys.argv[2])
if target.exists(): shutil.rmtree(target)
target.mkdir(parents=True)
with zipfile.ZipFile(archive) as z:
    names = z.namelist()
    assert len(names) == len(set(names)), 'Arquivos duplicados'
    for name in names:
        p = PurePosixPath(name)
        assert not p.is_absolute() and '..' not in p.parts and '\\\\' not in name
        assert not any(s in p.parts for s in ['node_modules', 'minhas-respostas', '.git', '.venv', '__pycache__'])
        assert p.name != '.env'
    z.extractall(target)
`, resolve(`dist/${version}/kit-entrevista-real-${version}.zip`), folder], { stdio: 'inherit', timeout: 30000 });
if (unpack.error || unpack.status !== 0) throw unpack.error ?? new Error('Falha de extração');
const cwd = `${folder}/kit-entrevista-real-${version}`;
const manifest = JSON.parse(await readFile(`${cwd}/MANIFEST.json`, 'utf8'));
strictEqual(manifest.version, version);
for (const row of manifest.files) {
  const bytes = await readFile(`${cwd}/${row.path}`);
  strictEqual(bytes.length, row.bytes); strictEqual(createHash('sha256').update(bytes).digest('hex'), row.sha256, row.path);
}
const checks = [];
const setup = process.argv.includes('--database-ready') ? 'lab:reset' : 'lab:setup';
for (const args of [['ci'], ['run', setup], ['test'], ['run', 'test:reference'], ['run', 'verify:bugs'], ['run', 'typecheck'], ['run', 'lint'], ['run', 'docs:check']]) {
  const result = spawnSync('npm', args, { cwd, stdio: 'inherit', timeout: 180000 });
  if (result.error || result.status !== 0) throw result.error ?? new Error(`Falha na cópia limpa: npm ${args.join(' ')}`);
  checks.push(`npm ${args.join(' ')}`);
}
// Demonstra o percurso do candidato na cópia temporária: versão inicial vermelha
// e solução válida verde. Os arquivos do projeto e do ZIP permanecem intactos.
const originalCandidate = await readFile(`${cwd}/src/versions/candidato.ts`);
const negative = spawnSync('npm', ['exec', '--', 'vitest', 'run', 'tests/referencia.test.ts', '--reporter=json', '--outputFile=tmp/candidato.json'], {
  cwd, env: { ...process.env, KIT_REVIEW_VERSION: 'candidato' }, encoding: 'utf8', timeout: 60000,
});
if (negative.error) throw negative.error;
strictEqual(negative.status, 1, 'A cópia inicial do candidato deve falhar em asserts de contrato');
const negativeReport = JSON.parse(await readFile(`${cwd}/tmp/candidato.json`, 'utf8'));
const assertions = negativeReport.testResults.flatMap(r => r.assertionResults);
for (const id of ['B01','B02','B03','B04','B05']) ok(assertions.some(a => a.status === 'failed' && a.fullName.startsWith(id + ':')), `${id}: falha de contrato não executada`);
try {
  await copyFile(`${cwd}/src/versions/referencia.ts`, `${cwd}/src/versions/candidato.ts`);
  const positive = spawnSync('npm', ['run', 'test:candidate'], { cwd, stdio: 'inherit', timeout: 60000 });
  if (positive.error || positive.status !== 0) throw positive.error ?? new Error('A avaliação do candidato rejeitou a solução válida');
} finally { await writeFile(`${cwd}/src/versions/candidato.ts`, originalCandidate); }
strictEqual(createHash('sha256').update(await readFile(`${cwd}/src/versions/candidato.ts`)).digest('hex'), createHash('sha256').update(originalCandidate).digest('hex'));
let log = '';
const server = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'src/server.ts', 'referencia'], { cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', bytes => { log += bytes; }); server.stderr.on('data', bytes => { log += bytes; });
const headers = { 'x-test-identity': 'empresa-aurora' };
const http = (url, options = {}) => fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
let smoke;
try {
  const deadline = Date.now() + 15000;
  while (!log.includes('Laboratório referencia:')) {
    if (server.exitCode !== null || Date.now() > deadline) throw new Error(`Servidor não iniciou: ${log}`);
    await delay(100);
  }
  const list = await http('http://127.0.0.1:3337/orders?limit=20', { headers });
  strictEqual(list.status, 200); strictEqual(list.headers.get('x-lab-sql-count'), '2');
  strictEqual((await list.json()).orders.length, 2);
  const create = () => http('http://127.0.0.1:3337/orders', { method: 'POST', headers: { ...headers, 'content-type': 'application/json', 'idempotency-key': 'archive-smoke' },
    body: JSON.stringify({ productId: 'prod-aurora', quantity: 2, priceCents: 1 }) });
  const first = await create(); const second = await create();
  strictEqual(first.status, 201); strictEqual(second.status, 201);
  const one = await first.json(); const two = await second.json();
  strictEqual(one.id, two.id); strictEqual(one.totalCents, 3000);
  const foreign = await http('http://127.0.0.1:3337/orders', { method: 'POST', headers: { ...headers, 'content-type': 'application/json', 'idempotency-key': 'archive-foreign' },
    body: JSON.stringify({ productId: 'prod-brisa', quantity: 1 }) });
  strictEqual(foreign.status, 404);
  smoke = { transport: 'HTTP TCP real em 127.0.0.1:3337', list: 200, queries: 2, create: 201, replaySameId: true, authoritativeTotal: 3000, foreignProduct: 404 };
} finally {
  if (server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch { /* already exited */ } }
  const deadline = Date.now() + 5000;
  while (server.exitCode === null && server.signalCode === null && Date.now() < deadline) await delay(50);
  if (server.exitCode === null && server.signalCode === null && server.pid) process.kill(-server.pid, 'SIGKILL');
}
const sourceRows = manifest.files.filter(row => !row.path.startsWith('evidencias/') && !row.path.startsWith('output/'));
const sourcesSha256 = createHash('sha256').update(JSON.stringify(sourceRows)).digest('hex');
const report = { version, capturedAt: new Date().toISOString(), node: process.version, filesVerified: manifest.files.length,
  sourcesSha256, checks, candidateWorkflow: { initialFailsAllFive: true, validSolutionPasses: true, originalRestored: true },
  smoke, note: 'Hash de fontes e não do próprio ZIP para evitar autorreferência do relatório.' };
if (!process.argv.includes('--no-record')) {
  await mkdir('evidencias', { recursive: true });
  await writeFile('evidencias/copia-limpa.json', JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 2));

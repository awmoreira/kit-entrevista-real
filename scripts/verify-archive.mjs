import { spawn, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
`, resolve(`dist/kit-entrevista-real-${version}.zip`), folder], { stdio: 'inherit' });
if (unpack.error || unpack.status !== 0) throw unpack.error ?? new Error('Falha de extração');
const cwd = `${folder}/kit-entrevista-real-${version}`;
const manifest = JSON.parse(await readFile(`${cwd}/MANIFEST.json`, 'utf8'));
strictEqual(manifest.version, version);
for (const row of manifest.files) {
  const bytes = await readFile(`${cwd}/${row.path}`);
  strictEqual(bytes.length, row.bytes); strictEqual(createHash('sha256').update(bytes).digest('hex'), row.sha256, row.path);
}
const checks = [];
for (const args of [['ci'], ['run', 'lab:setup'], ['test'], ['run', 'test:reference'], ['run', 'verify:bugs'], ['run', 'typecheck'], ['run', 'lint'], ['run', 'docs:check']]) {
  const result = spawnSync('npm', args, { cwd, stdio: 'inherit' });
  if (result.error || result.status !== 0) throw result.error ?? new Error(`Falha na cópia limpa: npm ${args.join(' ')}`);
  checks.push(`npm ${args.join(' ')}`);
}
let log = '';
const server = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'src/server.ts', 'referencia'], { cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', bytes => { log += bytes; }); server.stderr.on('data', bytes => { log += bytes; });
const headers = { 'x-test-identity': 'empresa-aurora' };
let smoke;
try {
  const deadline = Date.now() + 15000;
  while (!log.includes('Laboratório referencia:')) {
    if (server.exitCode !== null || Date.now() > deadline) throw new Error(`Servidor não iniciou: ${log}`);
    await delay(100);
  }
  const list = await fetch('http://127.0.0.1:3337/orders?limit=20', { headers });
  strictEqual(list.status, 200); strictEqual(list.headers.get('x-lab-sql-count'), '2');
  strictEqual((await list.json()).orders.length, 2);
  const create = () => fetch('http://127.0.0.1:3337/orders', { method: 'POST', headers: { ...headers, 'content-type': 'application/json', 'idempotency-key': 'archive-smoke' },
    body: JSON.stringify({ productId: 'prod-aurora', quantity: 2, priceCents: 1 }) });
  const first = await create(); const second = await create();
  strictEqual(first.status, 201); strictEqual(second.status, 201);
  const one = await first.json(); const two = await second.json();
  strictEqual(one.id, two.id); strictEqual(one.totalCents, 3000);
  const foreign = await fetch('http://127.0.0.1:3337/orders', { method: 'POST', headers: { ...headers, 'content-type': 'application/json', 'idempotency-key': 'archive-foreign' },
    body: JSON.stringify({ productId: 'prod-brisa', quantity: 1 }) });
  strictEqual(foreign.status, 404);
  smoke = { transport: 'HTTP TCP real em 127.0.0.1:3337', list: 200, queries: 2, create: 201, replaySameId: true, authoritativeTotal: 3000, foreignProduct: 404 };
} finally {
  if (server.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch { /* already exited */ } }
  const deadline = Date.now() + 5000;
  while (server.exitCode === null && server.signalCode === null && Date.now() < deadline) await delay(50);
  ok(server.exitCode !== null || server.signalCode !== null, 'Servidor da verificação não encerrou');
}
const sourceRows = manifest.files.filter(row => !row.path.startsWith('evidencias/') && !row.path.startsWith('output/'));
const sourcesSha256 = createHash('sha256').update(JSON.stringify(sourceRows)).digest('hex');
const report = { version, capturedAt: new Date().toISOString(), node: process.version, filesVerified: manifest.files.length,
  sourcesSha256, checks, smoke, note: 'Hash de fontes e não do próprio ZIP para evitar autorreferência do relatório.' };
if (!process.argv.includes('--no-record')) {
  await mkdir('evidencias', { recursive: true });
  await writeFile('evidencias/copia-limpa.json', JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify(report, null, 2));

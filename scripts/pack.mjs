import { spawnSync } from 'node:child_process';
import { readFile, readdir, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { strictEqual, ok } from 'node:assert';
import { sourceHash as hashSources } from './source-hash.mjs';
const root = process.cwd();
const version = JSON.parse(await readFile('package.json', 'utf8')).version;
const volumes = JSON.parse(await readFile('conteudo/volumes.json', 'utf8'));
const pdfReport = JSON.parse(await readFile('evidencias/pdf-verificacao.json', 'utf8'));
const checks = JSON.parse(await readFile('evidencias/checks.json', 'utf8'));
strictEqual(checks.version, version);
strictEqual(checks.sourceSha256, await hashSources(), 'Execute release:check após alterar as fontes');
ok(checks.checks.length === 8 && checks.checks.every(c => c.exitCode === 0), 'Execute release:check');
const visual = JSON.parse(await readFile('evidencias/revisao-visual.json', 'utf8'));
ok(visual.approved && visual.pagesInspected === pdfReport.automaticChecks.reduce((n,r) => n+r.pages, 0), 'Inspeção visual pendente');
const sourceHash = createHash('sha256');
for (const file of ['conteudo/volumes.json', 'scripts/build-pdfs.py', ...volumes.flatMap(v => v.sources)]) sourceHash.update(await readFile(file));
strictEqual(sourceHash.digest('hex'), visual.sourcesSha256, 'Refaça a inspeção visual após mudar os materiais ou o gerador');
for (const row of pdfReport.automaticChecks) strictEqual(createHash('sha256').update(await readFile(`output/pdf/${row.file}`)).digest('hex'), row.sha256);
const dist = resolve('dist');
const stage = resolve(`tmp/package/kit-entrevista-real-${version}`);
await rm(stage, { recursive: true, force: true }); await mkdir(stage, { recursive: true }); await mkdir(dist, { recursive: true });
const roots = ['README.md', 'LICENSE', 'LICENSE-CONTENT.md', 'CHANGELOG.md', 'package.json', 'package-lock.json', '.nvmrc', '.gitignore', '.env.example', 'compose.yaml', 'tsconfig.json', 'eslint.config.mjs', 'vitest.config.ts', 'requirements-docs.txt'];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === '__pycache__' || entry.name.endsWith('.pyc')) continue;
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) await walk(path); else roots.push(path);
  }
}
for (const dir of ['src', 'sql', 'scripts', 'tests', 'conteudo', 'docs', 'exercicios', 'evidencias', 'licenses', '.github']) await walk(dir);
for (const volume of volumes) roots.push(`output/pdf/${volume.file}`);
roots.push('output/pdf/sources.json');
const records = [];
for (const path of roots.sort()) {
  const bytes = await readFile(path);
  await mkdir(dirname(`${stage}/${path}`), { recursive: true }); await copyFile(path, `${stage}/${path}`);
  records.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const manifest = JSON.stringify({ name: 'Kit Entrevista Real', version, author: 'Allan Winckler', licenses: { code: 'MIT', content: 'CC-BY-NC-4.0' }, files: records }, null, 2) + '\n';
await writeFile(`${stage}/MANIFEST.json`, manifest); await writeFile(`${dist}/MANIFEST.json`, manifest);
const python = process.env.KIT_PYTHON ?? (existsSync('.venv/bin/python') ? '.venv/bin/python' : 'python3');
const packed = spawnSync(python, ['scripts/zip-release.py', stage, `${dist}/kit-entrevista-real-${version}.zip`], { stdio: 'inherit' });
if (packed.error || packed.status !== 0) throw packed.error ?? new Error('Falha ao criar ZIP');
for (const volume of volumes) await copyFile(`output/pdf/${volume.file}`, `${dist}/${volume.file}`);
await copyFile('docs/notas-release.md', `${dist}/notas-release.md`);
const assets = [...volumes.map(v => v.file), `kit-entrevista-real-${version}.zip`, 'MANIFEST.json', 'notas-release.md'];
const sums = [];
for (const asset of assets) sums.push(`${createHash('sha256').update(await readFile(`${dist}/${asset}`)).digest('hex')}  ${asset}`);
await writeFile(`${dist}/SHA256SUMS.txt`, sums.join('\n') + '\n');
console.log(`${records.length} arquivos no ZIP; ${assets.length + 1} ativos em ${dist}.`);
process.chdir(root);

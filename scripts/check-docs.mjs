import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { strictEqual, deepStrictEqual, ok } from 'node:assert';
const read = file => readFile(file, 'utf8');
const version = JSON.parse(await read('package.json')).version;
async function markdownFiles(dir) {
  const files = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (item.isDirectory()) files.push(...await markdownFiles(`${dir}/${item.name}`));
    else if (item.name.endsWith('.md')) files.push(`${dir}/${item.name}`);
  }
  return files;
}
const files = ['README.md', 'CHANGELOG.md', 'LICENSE-CONTENT.md', ...await markdownFiles('conteudo'), ...await markdownFiles('docs')];
let links = 0;
for (const file of files) {
  const md = await read(file);
  for (const match of md.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^https?:\/\//.test(target)) { new URL(target); continue; }
    if (target.startsWith('#')) continue;
    ok((await stat(resolve(dirname(file), decodeURIComponent(target.split('#')[0])))).isFile(), `${file}: ${target}`);
    links++;
  }
  ok(!/\b(TODO|FIXME|Lorem ipsum)\b/.test(md), `Texto incompleto em ${file}`);
}
for (const [file, prefix, count] of [['conteudo/02-fundamentos.md', 'T', 24], ['conteudo/02-comportamento.md', 'C', 12]]) {
  const chunks = (await read(file)).split(new RegExp(`(?=^### ${prefix}\\d{2}\\.)`, 'm')).slice(1);
  strictEqual(chunks.length, count);
  chunks.forEach((chunk, i) => {
    ok(chunk.startsWith(`### ${prefix}${String(i+1).padStart(2, '0')}.`));
    for (const field of ['Intenção', 'Aprofundamento', 'Sinais', 'Pleno', 'Sênior']) ok(chunk.includes(`**${field}:**`), `${file}: ${field} ausente`);
  });
}
const proof = JSON.parse(await read('evidencias/provas-bugs.json'));
strictEqual(proof.version, version); strictEqual(proof.results.length, 5);
for (const row of proof.results) { strictEqual(row.regressionFailed, true); deepStrictEqual(row.reference, row.expected); }
const hash = createHash('sha256');
for (const file of ['src/versions/proposta.ts', 'src/versions/referencia.ts', 'tests/scenarios.ts']) hash.update(await readFile(file));
strictEqual(hash.digest('hex'), proof.sourceSha256, 'Atualize verify:bugs após alterar o exercício');
const bench = JSON.parse(await read('evidencias/benchmark.json'));
strictEqual(bench.version, version);
deepStrictEqual(bench.observations.map(r => r.queries), [51, 2]);
strictEqual(bench.observations[0].responseSha256, bench.observations[1].responseSha256);
const api = JSON.parse(await read('docs/openapi.json'));
strictEqual(api.info.version, version); ok(api.paths['/orders'].get && api.paths['/orders'].post);
const volumes = JSON.parse(await read('conteudo/volumes.json'));
strictEqual(volumes.length, 4);
for (const volume of volumes) for (const source of volume.sources) ok((await stat(source)).isFile());
console.log(`${files.length} Markdown, ${links} links locais, 36 perguntas, 5 provas e 4 volumes consistentes.`);

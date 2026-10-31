import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
export async function sourceHash() {
  const files = ['README.md', 'LICENSE', 'LICENSE-CONTENT.md', 'CHANGELOG.md', 'package.json', 'package-lock.json', '.nvmrc', '.gitignore', '.env.example', 'compose.yaml', 'tsconfig.json', 'eslint.config.mjs', 'vitest.config.ts', 'requirements-docs.txt'];
  async function walk(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      if (item.name === '__pycache__' || item.name.endsWith('.pyc')) continue;
      if (item.isDirectory()) await walk(`${dir}/${item.name}`); else files.push(`${dir}/${item.name}`);
    }
  }
  for (const dir of ['src', 'sql', 'scripts', 'tests', 'conteudo', 'docs', 'exercicios', 'licenses', '.github']) await walk(dir);
  const hash = createHash('sha256');
  for (const file of files.sort()) { hash.update(file + '\0'); hash.update(await readFile(file)); }
  return hash.digest('hex');
}

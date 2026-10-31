import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
const python = process.env.KIT_PYTHON ?? (existsSync('.venv/bin/python') ? '.venv/bin/python' : 'python3');
const file = process.argv.includes('--verify') ? 'scripts/verify-pdfs.py' : 'scripts/build-pdfs.py';
const result = spawnSync(python, [file, ...process.argv.slice(2)], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);

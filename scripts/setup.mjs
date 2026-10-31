import { spawnSync } from 'node:child_process';
for (const [cmd, args] of [['docker', ['compose', 'up', '-d', '--wait']], ['npm', ['run', 'lab:reset']]]) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

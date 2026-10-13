import { spawnSync } from 'node:child_process';

const result = spawnSync('git', ['-c', 'credential.interactive=never', 'credential', 'fill'], {
  input: `protocol=https\nhost=github.com\n${process.argv[2] ? 'username=' + process.argv[2] + '\n' : ''}\n`,
  encoding: 'utf8',
  env: { ...process.env, GCM_INTERACTIVE: 'never', GCM_GUI_PROMPT: 'false', GIT_TERMINAL_PROMPT: '0' },
  timeout: 25000,
  windowsHide: true
});
if (result.status !== 0) {
  console.log(JSON.stringify({ available: false, reason: 'No GitHub credential selected without interaction.' }));
  process.exit(0);
}
const credential = Object.fromEntries(result.stdout.trim().split(/\r?\n/).map(line => {
  const separator = line.indexOf('=');
  return [line.slice(0, separator), line.slice(separator + 1)];
}));
if (!credential.password) {
  console.log(JSON.stringify({ available: false, reason: 'GitHub credential did not include authentication.' }));
  process.exit(0);
}
try {
  const response = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${credential.password}`, Accept: 'application/vnd.github+json', 'User-Agent': 'geography-explorer-git-sync' },
    signal: AbortSignal.timeout(20000)
  });
  const data = await response.json();
  console.log(JSON.stringify({ available: response.ok, status: response.status, login: data.login, name: data.name }));
} catch {
  console.log(JSON.stringify({ available: false, reason: 'GitHub API connection failed.' }));
}

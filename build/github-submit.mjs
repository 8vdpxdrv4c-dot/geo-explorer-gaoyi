import { spawnSync, spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const owner = 'maklove-star';
const name = 'geo-explorer-gaoyi';
const root = 'E:/动画制作/高一地理/sites/geography-explorer';
const env = { ...process.env, GCM_INTERACTIVE: 'never', GCM_GUI_PROMPT: 'false', GIT_TERMINAL_PROMPT: '0' };
const filled = spawnSync('git', ['-c', 'credential.interactive=never', 'credential', 'fill'], {
  cwd: root, input: `protocol=https\nhost=github.com\nusername=${owner}\n\n`,
  encoding: 'utf8', env, timeout: 25000, windowsHide: true
});
if (filled.status !== 0) throw new Error('Unable to use the selected GitHub account.');
const credential = Object.fromEntries(filled.stdout.trim().split(/\r?\n/).map(line => {
  const at = line.indexOf('='); return [line.slice(0, at), line.slice(at + 1)];
}));
if (!credential.password) throw new Error('Selected GitHub account has no usable credential.');
const headers = { Authorization: `Bearer ${credential.password}`, Accept: 'application/vnd.github+json', 'User-Agent': 'geography-explorer-git-sync' };
async function api(path, method = 'GET', body) {
  const response = await fetch('https://api.github.com' + path, {
    method, headers: { ...headers, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(30000)
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}
function git(args) {
  const result = spawnSync('git', args, { cwd: root, env, encoding: 'utf8', windowsHide: true });
  if(result.status !== 0) throw new Error('Local Git operation failed: ' + args[0]);
  return result.stdout.trim();
}
const user = await api('/user');
if(!user.ok || user.data.login !== owner) throw new Error('GitHub account does not match the selected owner.');
const localHead = git(['rev-parse','HEAD']);
if(git(['status','--porcelain'])) throw new Error('The website checkout contains uncommitted changes.');
let repo = await api(`/repos/${owner}/${name}`);
let created = false;
if(repo.status === 404) {
  repo = await api('/user/repos','POST',{
    name, private:true, auto_init:false,
    description:'地理之间：基于人教版高中地理必修两册的探索学习网站，包含课程、全文搜索、收藏、学习进度和原书对照。',
    homepage:'https://geo-explorer-gaoyi-20261012.maklove120092.chatgpt.site',
    has_issues:true, has_projects:false, has_wiki:false
  });
  created = repo.status === 201;
}
if(!repo.ok) throw new Error(`GitHub repository operation failed (HTTP ${repo.status}).`);
if(!repo.data.private || repo.data.owner?.login !== owner) throw new Error('Repository owner or privacy does not match this submission.');
const cloneUrl = repo.data.clone_url;
const existingRemote = spawnSync('git',['remote','get-url','origin'],{cwd:root,env,encoding:'utf8',windowsHide:true});
if(existingRemote.status === 0 && existingRemote.stdout.trim() !== cloneUrl) throw new Error('Existing origin points to a different repository.');
if(existingRemote.status !== 0)git(['remote','add','origin',cloneUrl]);
console.log(JSON.stringify({stage:'repository_ready',url:repo.data.html_url,private:repo.data.private,created,commit:localHead}));
const pushed = await new Promise(resolve => {
  const child = spawn('git',['-c',`credential.https://github.com.username=${owner}`,'-c','credential.interactive=never','push','--set-upstream','origin','main'],{
    cwd:root,env,windowsHide:true,stdio:['ignore','pipe','pipe']
  });
  let output='';
  child.stdout.on('data',chunk=>{output+=chunk;});
  child.stderr.on('data',chunk=>{output+=chunk;});
  child.on('error',()=>resolve({code:1,output:'Git push could not start.'}));
  child.on('close',code=>resolve({code,output}));
});
if(pushed.code !== 0) {
  const safe = pushed.output.split(credential.password).join('[redacted]');
  console.error(safe);
  process.exit(1);
}
console.log(pushed.output.split(credential.password).join('[redacted]').trim());
const remote = await api(`/repos/${owner}/${name}/git/ref/heads/main`);
if(!remote.ok || remote.data.object?.sha !== localHead) throw new Error('The GitHub branch does not match the local website commit.');
const summary = {url:repo.data.html_url,owner,repository:name,private:true,branch:'main',commit:localHead,verified:true};
writeFileSync('E:/动画制作/高一地理/build/github-submission.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary));

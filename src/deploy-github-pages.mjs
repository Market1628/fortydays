// Publie une version de démonstration du site sur GitHub Pages (branche gh-pages).
//   node src/deploy-github-pages.mjs
// Prérequis : Git installé, le dossier est un dépôt dont la remote « origin » pointe sur GitHub,
// et GitHub Pages est réglé sur la branche gh-pages (dossier racine).
// La démo est générée pour l'adresse https://<compte>.github.io/<dépôt>/ et n'est pas indexée par
// les moteurs de recherche. Le dossier site/ (version fortydays.com) n'est pas modifié.
import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = dirname(fileURLToPath(import.meta.url));
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();

const remote = run('git', ['remote', 'get-url', 'origin'], { cwd: SRC });
const match = remote.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
if (!match) throw new Error(`La remote « origin » n'est pas un dépôt GitHub : ${remote}`);
const [, owner, repo] = match;
const url = `https://${owner.toLowerCase()}.github.io/${repo}/`;

const out = join(tmpdir(), `fortydays-gh-pages-${Date.now()}`);
execFileSync(process.execPath, [join(SRC, 'build.mjs')], {
  stdio: 'inherit',
  env: { ...process.env, FD_DOMAIN: `https://${owner.toLowerCase()}.github.io`, FD_BASE_PATH: `/${repo}/`, FD_NOINDEX: '1', FD_OUT: out }
});
writeFileSync(join(out, '.nojekyll'), '');   // fichiers publiés tels quels

run('git', ['init', '-q', '-b', 'gh-pages'], { cwd: out });
run('git', ['add', '-A'], { cwd: out });
run('git', ['commit', '-q', '-m', 'Démo GitHub Pages'], { cwd: out });
run('git', ['push', '-q', '-f', remote, 'gh-pages'], { cwd: out });
rmSync(out, { recursive: true, force: true });
console.log(`Démo publiée : ${url} (en ligne d'ici une à deux minutes)`);

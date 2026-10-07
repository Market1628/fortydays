// Serveur local du site statique (Node 18+, aucune dépendance).
//   node src/serve.mjs            -> http://127.0.0.1:8080/fr/  (sert le dossier site/)
//   node src/serve.mjs 5000       -> autre port
//   node src/serve.mjs 8080 --dev -> mode atelier : les fichiers de src/assets/ sont servis
//                                    directement (pas besoin de relancer le build pour le CSS/JS),
//                                    et l'outil src/tools/capture.html peut enregistrer les images.
// Les URL propres (/fr/forfaits/ -> fr/forfaits/index.html) et la page 404 se comportent
// comme chez un hébergeur.
import { createServer } from 'node:http';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { basename, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = resolve(fileURLToPath(new URL('.', import.meta.url)));
const ROOT = resolve(SRC, '..', 'site');
const PORT = Number(process.argv.find(a => /^\d+$/.test(a))) || 8080;
const DEV = process.argv.includes('--dev');

export const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

export async function resolveFile(root, urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^([/\\])+/, '');
  let file = join(root, clean);
  if (!file.startsWith(root)) return null;
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  // Mode atelier : enregistrement des images produites par src/tools/capture.html.
  if (DEV && req.method === 'POST' && url.pathname === '/__save') {
    const name = basename(url.searchParams.get('to') || '');
    if (!/^[\w.-]+\.(png|webp|jpg)$/.test(name)) { res.writeHead(400); return res.end('nom invalide'); }
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    await mkdir(join(SRC, 'assets', 'img'), { recursive: true });
    await writeFile(join(SRC, 'assets', 'img', name), Buffer.concat(chunks));
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`enregistré : src/assets/img/${name}`);
  }
  let root = ROOT, path = url.pathname;
  if (DEV && path.startsWith('/assets/')) root = SRC;
  if (DEV && path.startsWith('/tools/')) root = SRC;
  const file = await resolveFile(root, path);
  if (!file) {
    // Une adresse de dossier sans barre finale est redirigée, comme sur un hébergeur.
    if (!path.endsWith('/') && await resolveFile(root, path + '/')) {
      res.writeHead(301, { Location: path + '/' + url.search });
      return res.end();
    }
    res.writeHead(404, { 'Content-Type': MIME['.html'] });
    return res.end(await readFile(join(ROOT, '404.html')).catch(() => 'Not found'));
  }
  res.writeHead(200, {
    'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  res.end(await readFile(file));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  createServer((req, res) => handle(req, res).catch(error => {
    console.error(error);
    res.writeHead(500);
    res.end('Erreur serveur');
  })).listen(PORT, '127.0.0.1', () => {
    console.log(`40 Days : http://127.0.0.1:${PORT}/fr/${DEV ? '  (mode atelier : /tools/capture.html)' : ''}  · Ctrl+C pour arrêter`);
  });
}

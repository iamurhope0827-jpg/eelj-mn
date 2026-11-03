import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const allowed = new Set(['/index.html', '/styles.css', '/app.js']);
const server = http.createServer(async (req, res) => {
  let route;
  try { route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if (route === '/') route = '/index.html';
  const resolved = path.resolve(root, '.' + route);
  if ((!allowed.has(route) && !route.startsWith('/assets/')) || !resolved.startsWith(path.join(root, 'assets') + path.sep) && !allowed.has(route)) { res.writeHead(404).end(); return; }
  try { const data = await readFile(resolved); res.writeHead(200, { 'Content-Type': types[path.extname(resolved)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(data); }
  catch { res.writeHead(404).end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Ээлж prototype: http://127.0.0.1:' + server.address().port));

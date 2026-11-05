'use strict';
/* Carregado pelo app só nos testes (variável LFS_TEST_HOOKS): troca a internet pelos servidores simulados. */
const { net, session } = require('electron');
const http = require('http');

const LF = process.env.LFS_LF_MOCK;
const SP = process.env.LFS_SP_MOCK;

function get(url) { return new Promise((resolve) => { http.get(url, (res) => { res.resume(); resolve(res); }).on('error', () => resolve(null)); }); }

async function autoAuth(url) {
  // faz o papel do navegador: abre a página de autorização e segue o retorno para o app
  await new Promise((r) => setTimeout(r, 300));
  const res = await get(url);
  if (res && res.headers.location) await get(res.headers.location);
}

module.exports = {
  async session(ses) {
    const handler = async (req) => {
      const u = new URL(req.url);
      if (/(^|\.)last\.fm$/.test(u.hostname) || /fastly\.net$/.test(u.hostname)) {
        const target = LF + (u.hostname.endsWith('fastly.net') ? '/__img' : '') + u.pathname + u.search;
        const body = ['GET', 'HEAD'].includes(req.method) ? null : Buffer.from(await req.arrayBuffer());
        const headers = {};
        req.headers.forEach((v, k) => { headers[k] = v; });
        // pedido direto ao servidor simulado (o fetch do Electron não devolve redirecionamentos como resposta)
        return new Promise((resolve) => {
          const r = http.request(target, { method: req.method, headers }, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
              const h = new Headers();
              for (const [k, v] of Object.entries(res.headers)) if (v !== undefined) h.set(k, Array.isArray(v) ? v.join(', ') : String(v));
              const status = res.statusCode || 200;
              resolve(new Response(status === 204 || status === 304 || (status >= 300 && status < 400) ? null : Buffer.concat(chunks), { status, headers: h }));
            });
          });
          r.on('error', () => resolve(new Response('', { status: 502 })));
          if (body) r.write(body);
          r.end();
        });
      }
      if (u.hostname === 'fonts.googleapis.com') return new Response('', { headers: { 'content-type': 'text/css' } });
      return new Response('', { status: 404 });
    };
    ses.protocol.handle('https', handler);
    try { session.defaultSession.protocol.handle('https', handler); } catch (_) { /* já registrado */ }
  },
  openExternal(url) {
    (global.__opened = global.__opened || []).push(url);
    if (url.includes('/authorize') && !global.__noAutoAuth) autoAuth(url);
    if (url === 'spotify:') get(`${SP}/__test/launch`);
  },
  ready(ctx) { global.__lfs = ctx; },
  launchSpotify() { global.__launches = (global.__launches || 0) + 1; get(`${SP}/__test/launch`); },
  killSpotify() { try { require('fs').appendFileSync(process.env.LFS_TEST_LOG, 'kill\n'); } catch (_) { /* sem registro */ } },
};

'use strict';
const ENV = require('./env');
/* Abre o Chromium com a extensão Last.fm Hub carregada e páginas do Last.fm servidas localmente
 * (capturas reais do site em fixtures/lastfm). Usado pelos testes da extensão. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const EXT = ENV.EXT_DIR;
const FIX = path.join(__dirname, 'fixtures');
const SITE_CSS = fs.readFileSync(path.join(FIX, 'lastfm', 'site.css'));
const COVERS = ['red.jpg', 'blue.jpg', 'gold.jpg', 'green.jpg', 'lastfm-cover.jpg'].map((f) => fs.readFileSync(path.join(FIX, f)));

function shell(user, bodyCls, content, title = 'Last.fm') {
  const mast = fs.readFileSync(path.join(FIX, 'lastfm', 'music-masthead.html'), 'utf8').replace(/SENHOR_PEREREKO/g, user);
  return `<!doctype html><html class="js" lang="en"><head><meta charset="utf-8"><title>${title}</title><link rel="stylesheet" href="/static/lfx-site.css"></head><body class="${bodyCls}">${mast}\n${content}</body></html>`;
}

/** routes: [{ test: (url) => bool, body: (url) => string | {status, body, type} }] */
async function open({ routes = [], log = [], width = 1500, height = 1000, extraRoute = null } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lfx-ext-'));
  const ctx = await chromium.launchPersistentContext(dir, {
    headless: true, channel: 'chromium',
    args: ['--headless=new', `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`, '--no-sandbox'],
    viewport: { width, height },
  });
  const stats = { pages: [], imgs: 0 };
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    if (/fastly\.net$/.test(u.hostname)) {
      stats.imgs++;
      const n = [...u.pathname].reduce((a, c) => a + c.charCodeAt(0), 0);
      return route.fulfill({ status: 200, contentType: 'image/jpeg', body: COVERS[n % COVERS.length], headers: { 'cache-control': 'max-age=31536000' } });
    }
    if (/(^|\.)last\.fm$/.test(u.hostname)) {
      if (u.pathname === '/static/lfx-site.css') return route.fulfill({ status: 200, contentType: 'text/css', body: SITE_CSS });
      stats.pages.push(u.pathname + u.search);
      for (const r of routes) {
        if (r.test(u)) {
          const out = await r.body(u, req);
          if (typeof out === 'string') return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: out });
          return route.fulfill({ status: out.status || 200, contentType: out.type || 'text/html; charset=utf-8', body: out.body || '' });
        }
      }
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><html><body><div id="content"><div class="page-content"></div></div></body></html>' });
    }
    if (u.protocol === 'chrome-extension:' || u.protocol === 'data:') return route.continue();
    if (extraRoute) { const handled = await extraRoute(route, u, req); if (handled !== false) return; }
    return route.fulfill({ status: 200, body: '' });
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => log.push(`pageerror: ${e.message}`));
  return { ctx, page, stats, close: async () => { await ctx.close(); fs.rmSync(dir, { recursive: true, force: true }); } };
}

module.exports = { open, shell, FIX };

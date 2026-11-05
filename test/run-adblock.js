'use strict';
const ENV = require('./env');
/* Bloqueio de anúncios no app (listas do uBlock Origin Lite):
 *  - Last.fm: servidores de anúncio/rastreio não carregam, CSS esconde os espaços de anúncio do site;
 *  - plataformas no app (YouTube Music): rede, scriptlets (json-prune do YouTube) e CSS;
 *  - player do Edge: a extensão uBlock Origin Lite entra na lista de extensões (e sai ao desligar);
 *  - desligar o bloqueio deixa tudo passar. */
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const SP = require('./mock-spotify'); const LF = require('./mock-lastfm');
const LOG = path.join(os.tmpdir(), `lfp-adb-${process.pid}.txt`);
const results = [];
const check = (ok, name, info) => { results.push({ ok: !!ok, name }); console.log(`${ok ? '  ✓' : '  ✗'} ${name}${info !== undefined ? ` → ${typeof info === 'string' ? info : JSON.stringify(info)}` : ''}`); };
const until = async (fn, ms = 10000, step = 150) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn().catch(() => null); if (v) return v; await new Promise((r) => setTimeout(r, step)); } return null; };

(async () => {
  const sp = await SP.start(); const lf = await LF.start();
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfp-adb-'));
  fs.writeFileSync(path.join(data, 'configuracoes.json'), JSON.stringify({ engine: 'desktop', welcomed: true, intro: false }));
  const app = await _electron.launch({
    executablePath: ENV.ELECTRON,
    args: ['--no-sandbox', path.join(__dirname, '..', 'app')],
    env: { ...process.env, LFS_TEST_LOG: LOG, LFS_DATA_DIR: data, LFS_TEST_HOOKS: path.join(__dirname, 'hooks.js'), LFS_LF_MOCK: `http://127.0.0.1:${lf.port}`, LFS_SP_MOCK: `http://127.0.0.1:${sp.port}`, LFS_SPOTIFY_API: `http://127.0.0.1:${sp.port}/v1`, LFS_SPOTIFY_ACCOUNTS: `http://127.0.0.1:${sp.port}` },
  });
  const errs = [];
  app.process().stderr.on('data', (d) => { const s = String(d); if (/Uncaught|TypeError|ReferenceError/.test(s) && !/dbus|gpu|viz|Fontconfig|Debugger/i.test(s)) errs.push(s.trim().slice(0, 200)); });
  await app.firstWindow();
  const lfPage = await until(async () => app.windows().find((w) => w.url().includes('last.fm')), 15000);
  await until(() => app.evaluate(() => !!(global.__lfs && global.__lfs.adblock)), 15000);

  console.log('Listas');
  const st = await app.evaluate(() => ({ ready: global.__lfs.adblock.ready, rules: global.__lfs.adblock.stats.rules }));
  check(st.ready && st.rules > 15000, 'as listas do uBlock carregam no app', st);

  console.log('Last.fm');
  await lfPage.waitForLoadState('domcontentloaded');
  const net = await lfPage.evaluate(async () => {
    const tryFetch = (u) => fetch(u, { mode: 'no-cors' }).then(() => 'ok', () => 'bloqueado');
    return {
      snigel: await tryFetch('https://cdn.snigelweb.com/adengine/last.fm/loader.js'),
      pubnet: await tryFetch('https://a.pub.network/last-fm/pubfig.min.js'),
      gtm: await tryFetch('https://www.googletagmanager.com/gtag/js?id=G-JSW4CH2WD0'),
      fonts: await tryFetch('https://fonts.googleapis.com/css2?family=Inter'),
      site: await tryFetch('/home'),
    };
  });
  check(net.snigel === 'bloqueado' && net.pubnet === 'bloqueado', 'anúncios do Last.fm (Snigel, Publift) não carregam', net);
  check(net.gtm === 'bloqueado', 'rastreadores (Google Tag Manager) não carregam', net.gtm);
  check(net.fonts === 'ok' && net.site === 'ok', 'o resto do site carrega normal', net);
  const css = await lfPage.evaluate(() => { const d = document.createElement('div'); d.className = 'recs-feed-item--ad'; d.textContent = 'anúncio'; document.body.append(d); const v = getComputedStyle(d).display; d.remove(); return v; });
  check(css === 'none', 'o espaço de anúncio do Last.fm fica escondido (CSS do uBlock)', css);

  console.log('YouTube Music (dentro do app)');
  const yt = await app.evaluate(async ({ session }) => {
    const ctx = global.__lfs;
    const n = ctx.native.create('ytmusic');
    const ses = session.fromPartition('persist:plataforma-ytmusic');
    const hits = [];
    ses.protocol.handle('https', (req) => {
      hits.push(req.url);
      const u = new URL(req.url);
      if (u.hostname === 'music.youtube.com' && u.pathname === '/') {
        return new Response(`<!doctype html><html><body><div id="contents"><ytd-rich-item-renderer id="adcard"><ytd-ad-slot-renderer></ytd-ad-slot-renderer></ytd-rich-item-renderer></div>
          <script>window.ytInitialPlayerResponse = JSON.parse('{"adPlacements":[{"a":1}],"playerAds":[1],"videoDetails":{"title":"Karma Police"}}');</script>
          <script src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
          <script>window.__stats = fetch('https://music.youtube.com/api/stats/ads?ver=2').then(() => 'ok', () => 'bloqueado');</script></body></html>`, { headers: { 'content-type': 'text/html' } });
      }
      return new Response('', { headers: { 'content-type': 'text/plain' } });
    });
    await n.wc.loadURL('https://music.youtube.com/');
    await new Promise((r) => setTimeout(r, 800));
    const page = await n.wc.executeJavaScript(`(async () => ({ ads: (ytInitialPlayerResponse.adPlacements || null), playerAds: (ytInitialPlayerResponse.playerAds || null), title: ytInitialPlayerResponse.videoDetails.title, stats: await window.__stats, ima: typeof (window.google && window.google.ima), card: getComputedStyle(document.getElementById('adcard')).display }))()`);
    return { page, hits };
  });
  check(yt.page.ads === null && yt.page.playerAds === null && yt.page.title === 'Karma Police', 'os anúncios do player do YouTube são removidos por dentro (scriptlet do uBlock), a música continua', yt.page);
  check(yt.page.stats === 'bloqueado' && !yt.hits.some((h) => /imasdk|api\/stats\/ads/.test(h)), 'pedidos de anúncio do YouTube (IMA, stats/ads) não saem', yt.hits);
  check(yt.page.card === 'none', 'cartões de anúncio do YouTube ficam escondidos', yt.page.card);

  console.log('Player do Edge (Spotify, Apple Music, Tidal)');
  const ext = await app.evaluate(() => global.__lfs.playerExtensions().map((e) => ({ id: e.id, name: e.name, path: e.path })));
  const ubol = ext.find((e) => e.name === 'uBlock Origin Lite');
  check(!!ubol, 'o uBlock Origin Lite entra como extensão do player', ext.map((e) => e.name));
  const man = ubol ? JSON.parse(fs.readFileSync(path.join(ubol.path, 'manifest.json'), 'utf8')) : {};
  const det = ubol ? JSON.parse(fs.readFileSync(path.join(ubol.path, 'rulesets', 'ruleset-details.json'), 'utf8')) : [];
  const on = det.filter((r) => r.enabled).map((r) => r.id);
  check(man.key && man.host_permissions && man.host_permissions.includes('<all_urls>'), 'com identidade fixa e permissão em todos os sites (modo "Ótimo")', man.host_permissions);
  check(['ublock-filters', 'easylist', 'easyprivacy', 'pgl', 'ublock-badware', 'urlhaus-full', 'spa-1', 'adguard-spyware-url'].every((x) => on.includes(x)), 'listas já ligadas: uBlock, EasyList, EasyPrivacy, Peter Lowe, golpes, português e rastreio em links', on);

  console.log('Desligar');
  await app.evaluate(async () => { global.__lfs.store.set({ blockAds: false }); });
  const off = await lfPage.evaluate(() => fetch('https://cdn.snigelweb.com/adengine/last.fm/loader.js', { mode: 'no-cors' }).then(() => 'ok', () => 'bloqueado'));
  const ext2 = await app.evaluate(() => global.__lfs.playerExtensions().map((e) => e.name));
  check(off === 'ok' && !ext2.includes('uBlock Origin Lite'), 'com o bloqueio desligado nada é barrado e o uBOL sai do player', { off, ext2 });

  check(errs.length === 0, 'sem erros', errs.slice(0, 3));
  const bad = results.filter((r) => !r.ok);
  console.log(`\nOK: ${results.length - bad.length}\nFALHAS: ${bad.length}`);
  await app.close().catch(() => {});
  sp.stop?.(); lf.stop?.();
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

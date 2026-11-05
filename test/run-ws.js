'use strict';
const ENV = require('./env');
// 3.4: Web Scrobbler dentro do player, escolha de quem conta cada plataforma e o aviso do login do Google.
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const LF = require('./mock-lastfm'); const WP = require('./mock-webplayer'); const SP = require('./mock-spotify'); const PM = require('./mock-platform');
const OUT = process.env.OUT || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const WS_ID = 'hhinaapppaileiechjoiifaancjggfjm';

const ok = [], bad = [];
const check = (c, label, extra) => { (c ? ok : bad).push(label); console.log(c ? '  ✓' : '  ✗', label, extra !== undefined ? JSON.stringify(extra).slice(0, 200) : ''); };
const until = async (fn, ms = 10000, step = 200) => { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); if (v) return v; } catch (_) { /* tenta */ } await new Promise((r) => setTimeout(r, step)); } return v; };

async function launch(data, lf, wpm, sp, pm) {
  const app = await _electron.launch({
    executablePath: ENV.ELECTRON,
    args: ['--no-sandbox', path.join(__dirname, '..', 'app')],
    env: {
      ...process.env, LFS_DATA_DIR: data, LFS_TEST_HOOKS: path.join(__dirname, 'hooks.js'), LFS_LF_MOCK: `http://127.0.0.1:${lf.port}`,
      LFS_SP_MOCK: `http://127.0.0.1:${sp.port}`, LFS_SPOTIFY_API: `http://127.0.0.1:${sp.port}/v1`, LFS_SPOTIFY_ACCOUNTS: `http://127.0.0.1:${sp.port}`,
      LFS_PLAYER_BROWSER: CHROME, LFS_PLAYER_URL: `http://127.0.0.1:${wpm.port}`, LFS_PLAYER_LOGIN: `http://127.0.0.1:${wpm.port}/login`,
      LFS_PLAYER_HEADLESS: '1', LFS_PLAYER_NOSANDBOX: '1', LFS_INTRO: '0',
      LFS_PLATFORM_YTMUSIC: `http://127.0.0.1:${pm.port}/ytm/`, LFS_PLATFORM_DEEZER: `http://127.0.0.1:${pm.port}/deezer/`,
      LFS_LASTFM_API: `http://127.0.0.1:${lf.port}/2.0/`, LFS_LASTFM_POLL: '400',
    },
  });
  const errs = [];
  app.process().stderr.on('data', (d) => { const s = String(d); if (/Uncaught|TypeError|ReferenceError|Error:/.test(s) && !/dbus|gpu|viz|Fontconfig|Debugger|DevTools/i.test(s)) errs.push('[main] ' + s.trim()); });
  const ui = await app.firstWindow();
  ui.on('pageerror', (e) => errs.push('ui: ' + e.message));
  const toast = () => ui.evaluate(() => { const t = document.getElementById('toast'); return t && !t.hidden ? t.textContent : ''; });
  return { app, ui, errs, toast };
}

(async () => {
  const lf = await LF.start(); const sp = await SP.start(); const wpm = await WP.start({}); const pm = await PM.start();
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfpws-'));
  // já começa com o Web Scrobbler ligado (as extensões entram quando o navegador do player abre)
  fs.writeFileSync(path.join(data, 'configuracoes.json'), JSON.stringify({ webScrobbler: true, welcomed: true, intro: false }));
  const { app, ui, errs, toast } = await launch(data, lf, wpm, sp, pm);
  await until(() => ui.evaluate(() => !!document.getElementById('panelBtn')), 8000);
  await ui.keyboard.press('Escape').catch(() => {});

  console.log('Web Scrobbler no player');
  // abre o painel no Spotify: liga o player do Edge (onde a extensão roda)
  await ui.evaluate(() => window.lfs.playerLogin());
  const running = await until(() => app.evaluate(() => (global.__lfs.wp.running ? 'sim' : null)), 12000);
  check(running === 'sim', 'o player do Edge ligou');
  const loaded = await until(() => app.evaluate((_e, id) => (global.__lfs.wp.extLoaded[id] ? 'sim' : null), WS_ID), 20000);
  check(loaded === 'sim', 'a extensão Web Scrobbler carregou no player', loaded);
  const ubol = await until(() => app.evaluate((_e, id) => (global.__lfs.wp.extLoaded[id] ? 'sim' : null), 'nmikjmkhkkfabjndddkgefkeflcacmkm'), 20000);
  check(ubol === 'sim', 'o uBlock Origin Lite também carregou no player (bloqueio de anúncios)', ubol);

  // lê as opções do Web Scrobbler pelo serviço dele
  const hasOptions = await until(() => app.evaluate(async (_e, id) => {
    const o = await global.__lfs.wp.extStorageGet(id, 'sync', 'Options').catch(() => null);
    return o && typeof o === 'object' ? 'sim' : null;
  }, WS_ID), 12000);
  check(hasOptions === 'sim', 'o app consegue ler as opções do Web Scrobbler');

  console.log('Escolha de quem conta cada plataforma');
  // YouTube Music passa a ser contado pelo Web Scrobbler → deve abrir pelo Edge
  await ui.evaluate(() => window.lfs.settings({ scrobbleBy: { ytmusic: 'ws' } }));
  const eng = await until(() => app.evaluate(() => (global.__lfs.store.get('scrobbleBy').ytmusic === 'ws' ? 'ok' : null)), 6000);
  check(eng === 'ok', 'YouTube Music marcado para o Web Scrobbler');
  // engineOf não é exportado; confere pelo snapshot enviado à interface
  const snapEng = await until(async () => { const s = await ui.evaluate(() => window.lfs.state()); return s && s.engines && s.engines.ytmusic === 'edge' ? 'edge' : null; }, 6000);
  check(snapEng === 'edge', 'escolher o Web Scrobbler abre o YouTube Music pelo Edge', snapEng);

  // o conector do YouTube Music fica LIGADO no Web Scrobbler (disabledConnectors[youtube-music] = false)
  const connOk = await until(() => app.evaluate(async (_e, id) => {
    const o = await global.__lfs.wp.extStorageGet(id, 'sync', 'Options').catch(() => null);
    if (!o) return null;
    const d = o.disabledConnectors || {};
    return d['youtube-music'] === false ? 'ligado' : (`estado=${JSON.stringify(d['youtube-music'])}`);
  }, WS_ID), 12000);
  check(connOk === 'ligado', 'o conector do YouTube Music fica ligado no Web Scrobbler', connOk);

  // o scrobbler do app recua para o YouTube Music (quem conta é o Web Scrobbler)
  const owner = await app.evaluate(() => ({ owner: global.__lfs.scrob.ownerOf('ytmusic'), appEnabled: global.__lfs.scrob.enabled('ytmusic') }));
  check(owner.owner === 'ws' && owner.appEnabled === false, 'o scrobbler do app não conta o YouTube Music quando o dono é o Web Scrobbler', owner);

  // "Não contar" o SoundCloud: nem o app, nem o Web Scrobbler
  await ui.evaluate(() => window.lfs.settings({ scrobbleBy: { soundcloud: 'off' } }));
  const scOff = await until(() => app.evaluate(() => (global.__lfs.scrob.ownerOf('soundcloud') === 'off' && global.__lfs.scrob.enabled('soundcloud') === false ? 'ok' : null)), 6000);
  check(scOff === 'ok', 'SoundCloud marcado como "Não contar" não é contado por ninguém');
  const scConn = await until(() => app.evaluate(async (_e, id) => {
    const o = await global.__lfs.wp.extStorageGet(id, 'sync', 'Options').catch(() => null);
    return o && (o.disabledConnectors || {})['soundcloud'] === true ? 'desligado' : null;
  }, WS_ID), 12000);
  check(scConn === 'desligado', 'o conector do SoundCloud fica desligado no Web Scrobbler');

  console.log('Login do Google (aviso honesto, sem burlar)');
  await app.evaluate(() => global.__lfs.native.emit('google', 'ytmusic'));
  const g = await until(async () => { const t = await toast(); return /Google/.test(t) ? t : null; }, 6000);
  check(!!g && /n[aã]o aceita|dentro de apps|seguran/i.test(g), 'ao cair no login do Google, o app avisa o caminho que funciona (sem burlar)', g);

  console.log('Abrir as opções do Web Scrobbler');
  ui.evaluate(() => window.lfs.wsOptions()).catch(() => {});
  const opened = await until(() => app.evaluate(() => {
    const pops = [...global.__lfs.wp.popups.values()];
    return pops.some((p) => p.kind === 'page' || p.kind === 'ext' || /chrome-extension/.test(p.url || '')) ? 'sim' : null;
  }), 12000);
  check(opened === 'sim', 'o botão abre as opções do Web Scrobbler numa janela à parte', opened);

  check(errs.length === 0, 'sem erros', errs.slice(0, 4));

  console.log(`\nOK: ${ok.length}\nFALHAS: ${bad.length}`);
  if (bad.length) bad.forEach((b) => console.log('  ✗', b));
  await app.close().catch(() => {});
  await Promise.all([lf.stop?.(), sp.stop?.(), wpm.stop?.(), pm.stop?.()].filter(Boolean)).catch(() => {});
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

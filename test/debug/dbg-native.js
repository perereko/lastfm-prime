'use strict';
const ENV = require('../env');
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const LF = require('../mock-lastfm'); const WP = require('../mock-webplayer'); const SP = require('../mock-spotify'); const PM = require('../mock-platform');
const until = async (fn, ms = 8000, step = 150) => { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); if (v) return v; } catch (_) {} await new Promise((r) => setTimeout(r, step)); } return v; };
(async () => {
  const lf = await LF.start(); const sp = await SP.start(); const wpm = await WP.start({}); const pm = await PM.start();
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfn-'));
  const app = await _electron.launch({ executablePath: ENV.ELECTRON, args: ['--no-sandbox', ENV.APP_DIR],
    env: { ...process.env, LFS_DATA_DIR: data, LFS_TEST_HOOKS: path.join(__dirname, '..', 'hooks.js'), LFS_LF_MOCK: `http://127.0.0.1:${lf.port}`, LFS_SP_MOCK: `http://127.0.0.1:${sp.port}`, LFS_SPOTIFY_API: `http://127.0.0.1:${sp.port}/v1`, LFS_SPOTIFY_ACCOUNTS: `http://127.0.0.1:${sp.port}`,
      LFS_PLAYER_BROWSER: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', LFS_PLAYER_URL: `http://127.0.0.1:${wpm.port}`, LFS_PLAYER_HEADLESS: '1', LFS_PLAYER_NOSANDBOX: '1', LFS_INTRO: '0',
      LFS_PLATFORM_YTMUSIC: `http://127.0.0.1:${pm.port}/ytm/`, LFS_PLATFORM_DEEZER: `http://127.0.0.1:${pm.port}/deezer/` } });
  app.process().stderr.on('data', (d) => { const s = String(d); if (/Uncaught|TypeError|ReferenceError|Error:/.test(s) && !/dbus|gpu|viz|Fontconfig|Debugger|DevTools/i.test(s)) console.log('[main]', s.trim()); });
  const ui = await app.firstWindow();
  ui.on('pageerror', (e) => console.log('ui err', e.message));
  await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; w.setSize(1440, 900); });
  await ui.waitForTimeout(1500);
  await ui.keyboard.press('Escape');
  await ui.evaluate(() => window.lfs.panel({ open: true, platform: 'ytmusic' }));
  const shown = await until(() => app.evaluate(() => { const n = global.__lfs.native; return n && n.shown === 'ytmusic' ? n.get('ytmusic').view.getBounds() : null; }), 8000);
  console.log('shown', JSON.stringify(shown));
  const yt = await until(() => app.windows().find((w) => /\/ytm\//.test(w.url())), 5000);
  console.log('yt page', !!yt, yt && yt.url());
  await yt.click('#s0');
  const st = await until(() => app.evaluate(() => { const p = global.__lfs.state.player; return p && p.item ? { t: p.item.name, src: global.__lfs.state.source, playing: p.playing } : null; }), 6000);
  console.log('state', JSON.stringify(st));
  const pill = await ui.evaluate(() => document.getElementById('panelBtn').textContent);
  console.log('tabs', JSON.stringify(await ui.evaluate(() => { const t = document.getElementById('plTabs'); const r = t.getBoundingClientRect(); return { n: t.children.length, r: [r.x, r.y, r.width, r.height], key: t.dataset.key, first: t.children[0] && getComputedStyle(t.children[0]).opacity }; })));
  console.log('pill', pill);
  console.log('events', JSON.stringify(pm.events.slice(-3)));
  const r = await app.evaluate(() => global.__lfs.native.cmd('ytmusic', 'pause'));
  console.log('cmd', JSON.stringify(r), JSON.stringify(pm.events.slice(-1)));
  await ui.screenshot({ path: path.join(ENV.OUT, 'native-ui.png') });
  const img = await app.evaluate(async () => (await global.__lfs.native.get('ytmusic').wc.capturePage()).toPNG().toString('base64'));
  fs.writeFileSync(path.join(ENV.OUT, 'native-view.png'), Buffer.from(img, 'base64'));
  await ui.evaluate(() => window.lfs.panel({ open: false }));
  await ui.waitForTimeout(600);
  console.log('hidden after close', await app.evaluate(() => global.__lfs.native.shown));
  try { console.log(fs.readFileSync(path.join(data, 'registro.log'), 'utf8').split('\n').slice(-12).join('\n')); } catch (_) {}
  await app.close(); process.exit(0);
})();

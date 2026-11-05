'use strict';
const ENV = require('../env');
// Grava a abertura do app (tela inteira do xvfb) para conferir a animação quadro a quadro
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const { spawn } = require('child_process');
const LF = require('../mock-lastfm'); const SP = require('../mock-spotify');
const OUT = process.env.OUT || path.join(ENV.OUT, 'intro');
(async () => {
  const lf = await LF.start(); const sp = await SP.start();
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfp-'));
  if (process.env.SEED) fs.writeFileSync(path.join(data, 'config.json'), process.env.SEED);
  const T0 = Date.now(); const t = () => ((Date.now() - T0) / 1000).toFixed(2) + 's';
  const rec = spawn('ffmpeg', ['-nostdin', '-y', '-loglevel', 'error', '-f', 'x11grab', '-framerate', '25', '-video_size', '1600x1000', '-i', process.env.DISPLAY, '-t', process.env.SECS || '7', '-pix_fmt', 'yuv420p', path.join(OUT, 'intro.mp4')]);
  await new Promise((r) => setTimeout(r, 300));
  const app = await _electron.launch({ executablePath: ENV.ELECTRON, args: ['--no-sandbox', ENV.APP_DIR],
    env: { ...process.env, LFS_DATA_DIR: data, LFS_TEST_HOOKS: path.join(__dirname, '..', 'hooks.js'), LFS_LF_MOCK: `http://127.0.0.1:${lf.port}`, LFS_SP_MOCK: `http://127.0.0.1:${sp.port}`, LFS_SPOTIFY_API: `http://127.0.0.1:${sp.port}/v1`, LFS_SPOTIFY_ACCOUNTS: `http://127.0.0.1:${sp.port}`, LFS_LF_DELAY: process.env.LFS_LF_DELAY || '' } });
  app.process().stderr.on('data', (d) => { const s = String(d); if (/Uncaught|TypeError|ReferenceError|Error:/.test(s) && !/dbus|gpu|viz|Fontconfig|Debugger|DevTools/i.test(s)) console.log('[main]', s.trim()); });
  console.log('launched', t(), new Date().toISOString());
  const ui = await app.firstWindow();
  console.log('first window', t(), ui.url());
  ui.on('pageerror', (e) => console.log('ui err', e.message));
  await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; w.setBounds({ x: 0, y: 0, width: 1600, height: 1000 }); });
  for (const w of app.windows()) if (/intro\.html/.test(w.url())) { w.on('pageerror', (e) => console.log('intro err', e.message)); w.on('console', (m) => console.log('intro console', m.text())); }
  console.log('windows', t(), app.windows().map((w) => w.url().slice(-40)));
  if (rec.exitCode === null) await new Promise((r) => rec.on('exit', r));
  console.log('rec done', t());
  console.log('intro view still there?', await app.evaluate(() => !!global.__lfs && global.__lfs.state && true));
  console.log('state intro', JSON.stringify(await ui.evaluate(() => window.lfs.state().then((s) => s.intro))));
  await app.close();
  try { console.log(fs.readFileSync(path.join(data, 'registro.log'), 'utf8').split('\n').filter((l) => /abertura|ligado|painel/.test(l)).join('\n')); } catch (e) { console.log('sem log', e.message); }
  process.exit(0);
})();

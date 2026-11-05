'use strict';
const ENV = require('./env');
// Primeira subida do app: janela, Last.fm com o Hub, tela de conexão
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const SP = require('./mock-spotify'); const LF = require('./mock-lastfm');
const OUT = process.env.OUT || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const sp = await SP.start(); const lf = await LF.start();
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfp-'));
  const app = await _electron.launch({
    executablePath: ENV.ELECTRON,
    args: ['--no-sandbox', path.join(__dirname, '..', 'app')],
    env: { ...process.env, LFS_DATA_DIR: data, LFS_TEST_HOOKS: path.join(__dirname, 'hooks.js'), LFS_LF_MOCK: `http://127.0.0.1:${lf.port}`, LFS_SP_MOCK: `http://127.0.0.1:${sp.port}`, LFS_SPOTIFY_API: `http://127.0.0.1:${sp.port}/v1`, LFS_SPOTIFY_ACCOUNTS: `http://127.0.0.1:${sp.port}`, LFS_DEBUG: '1' },
  });
  app.process().stdout.on('data', (d) => process.stdout.write('[main] ' + d));
  app.process().stderr.on('data', (d) => { const s = String(d); if (!/dbus|gpu|libva|vaapi|viz|ozone|Fontconfig/i.test(s)) process.stdout.write('[err] ' + s); });
  const ui = await app.firstWindow();
  const errs = [];
  ui.on('pageerror', (e) => errs.push('ui: ' + e.message));
  ui.on('console', (m) => { if (m.type() === 'error') errs.push('ui console: ' + m.text()); });
  await ui.waitForTimeout(4000);
  const pages = app.windows().map((w) => w.url());
  console.log('pages', pages);
  const lfp = app.windows().find((w) => w.url().includes('last.fm'));
  if (lfp) {
    lfp.on('pageerror', (e) => errs.push('lf: ' + e.message));
    console.log('lf themed', await lfp.evaluate(() => ({ cls: document.documentElement.className, app: document.documentElement.dataset.lfxApp, title: document.title })));
  }
  console.log('overlay', await ui.evaluate(() => ({ hidden: document.getElementById('overlay').hidden, h2: document.querySelector('.sheet h2')?.textContent })));
  await ui.screenshot({ path: path.join(OUT, 's1-onboarding.png') });
  console.log('errors', errs);
  await app.close();
  sp.server.close(); process.exit(0);
})().catch((e) => { console.error('FAIL', e); process.exit(1); });

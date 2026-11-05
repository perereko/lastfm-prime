'use strict';
const ENV = require('../env');
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const LF = require('../mock-lastfm'); const SP = require('../mock-spotify');
const OUT = path.join(ENV.OUT, 'intro');
(async () => {
  const lf = await LF.start(); const sp = await SP.start();
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfp-'));
  const app = await _electron.launch({ executablePath: ENV.ELECTRON, args: ['--no-sandbox', ENV.APP_DIR],
    env: { ...process.env, LFS_DATA_DIR: data, LFS_TEST_HOOKS: path.join(__dirname, '..', 'hooks.js'), LFS_LF_MOCK: `http://127.0.0.1:${lf.port}`, LFS_SP_MOCK: `http://127.0.0.1:${sp.port}`, LFS_SPOTIFY_API: `http://127.0.0.1:${sp.port}/v1`, LFS_SPOTIFY_ACCOUNTS: `http://127.0.0.1:${sp.port}` } });
  const ui = await app.firstWindow();
  let intro = null;
  for (let i = 0; i < 50 && !intro; i++) { intro = app.windows().find((w) => /intro\.html/.test(w.url())); if (!intro) await new Promise((r) => setTimeout(r, 50)); }
  console.log('intro page', !!intro);
  intro.on('console', (m) => console.log('intro console', m.text()));
  intro.on('pageerror', (e) => console.log('intro err', e.message));
  await intro.evaluate(() => { window.__f = []; const tick = (t) => { window.__f.push([t, document.body.classList.contains('out')]); requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  setTimeout(async () => { try { const f = await intro.evaluate(() => window.__f); const out = f.filter((x) => x[1]); const go = f.filter((x) => !x[1]); const fps = (a) => a.length > 1 ? Math.round((a.length - 1) / ((a[a.length - 1][0] - a[0][0]) / 1000)) : 0; console.log('FPS go', fps(go), 'out', fps(out), 'frames out', out.length); } catch (e) { console.log('fps gone'); } }, 3600);
  for (let i = 0; i < 40; i++) {
    try {
      const info = await intro.evaluate(() => ({ t: Math.round(performance.now()), cls: document.body.className, hero: getComputedStyle(document.querySelector('.hero')).transform, an: document.getAnimations().length, r: getComputedStyle(document.querySelector('.stage')).getPropertyValue('--r') }));
      console.log(JSON.stringify(info));
    } catch (e) { console.log('gone', e.message.slice(0, 60)); break; }
    await new Promise((r) => setTimeout(r, 150));
  }
  await app.close(); process.exit(0);
})();

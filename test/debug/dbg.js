const ENV = require('../env');
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const SP = require('../mock-spotify'); const LF = require('../mock-lastfm');
(async () => {
  const sp = await SP.start(); const lf = await LF.start();
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfp-'));
  const app = await _electron.launch({ executablePath: ENV.ELECTRON, args: ['--no-sandbox', ENV.APP_DIR],
    env: { ...process.env, LFS_DATA_DIR: data, LFS_TEST_HOOKS: path.join(__dirname, '..', 'hooks.js'), LFS_LF_MOCK: `http://127.0.0.1:${lf.port}`, LFS_SP_MOCK: `http://127.0.0.1:${sp.port}`, LFS_SPOTIFY_API: `http://127.0.0.1:${sp.port}/v1`, LFS_SPOTIFY_ACCOUNTS: `http://127.0.0.1:${sp.port}` } });
  const ui = await app.firstWindow(); await ui.waitForTimeout(2500);
  const lfp = app.windows().find((w) => w.url().includes('last.fm'));
  await app.evaluate(({ ipcMain }) => { global.__pages = []; ipcMain.on('lf:page', (e, i) => global.__pages.push(i)); });
  await lfp.goto('https://www.last.fm/user/TestUser/loved'); await ui.waitForTimeout(1500);
  await ui.evaluate(() => window.lfs.overlay(true)); await ui.waitForTimeout(800);
  await ui.evaluate(() => { window.lfs.overlay(false); window.lfs.nav('url', 'https://www.last.fm/settings/applications'); });
  for (let i = 0; i < 6; i++) { await ui.waitForTimeout(700); console.log('T', i, JSON.stringify(await app.evaluate(() => ({ tracks: global.__lfs.state.page.tracks, url: global.__lfs.state.page.url, n: global.__pages.length, last: global.__pages.slice(-1)[0] })))); }
  await app.close(); process.exit(0);
})();

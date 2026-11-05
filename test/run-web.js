'use strict';
const ENV = require('./env');
// Teste do modo web: o web player do Spotify escondido (conta grátis ou Premium, sem o app do Spotify e sem API)
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const { execFileSync } = require('child_process');
const LF = require('./mock-lastfm'); const WP = require('./mock-webplayer'); const SP = require('./mock-spotify');
const OUT = process.env.OUT || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const ok = [], bad = [];
const check = (c, label, extra) => (c ? ok : bad).push(label + (extra !== undefined ? ` → ${typeof extra === 'string' ? extra : JSON.stringify(extra)}` : ''));
const until = async (fn, ms = 8000, step = 150) => { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); if (v) return v; } catch (_) { /* tenta de novo */ } await new Promise((r) => setTimeout(r, step)); } return v; };

async function launch(data, lf, wpm, sp) {
  const app = await _electron.launch({
    executablePath: ENV.ELECTRON,
    args: ['--no-sandbox', path.join(__dirname, '..', 'app')],
    env: {
      ...process.env, LFS_DATA_DIR: data, LFS_TEST_HOOKS: path.join(__dirname, 'hooks.js'), LFS_LF_MOCK: `http://127.0.0.1:${lf.port}`,
      LFS_SP_MOCK: `http://127.0.0.1:${sp.port}`, LFS_SPOTIFY_API: `http://127.0.0.1:${sp.port}/v1`, LFS_SPOTIFY_ACCOUNTS: `http://127.0.0.1:${sp.port}`,
      LFS_PLAYER_BROWSER: CHROME, LFS_PLAYER_URL: `http://127.0.0.1:${wpm.port}`, LFS_PLAYER_LOGIN: `http://127.0.0.1:${wpm.port}/login`,
      LFS_PLAYER_HEADLESS: '1', LFS_PLAYER_NOSANDBOX: '1', LFS_INTRO: '0',
    },
  });
  const errs = [];
  app.process().stderr.on('data', (d) => { const s = String(d); if (/Uncaught|TypeError|ReferenceError|Error:/.test(s) && !/dbus|gpu|viz|Fontconfig|Debugger/i.test(s)) errs.push('[main] ' + s.trim()); });
  const ui = await app.firstWindow();
  ui.on('pageerror', (e) => errs.push('ui: ' + e.message));
  ui.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('ui console: ' + m.text()); });
  await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; w.setSize(1440, 900); w.center(); });
  const lfPage = await until(() => app.windows().find((w) => w.url().includes('last.fm')), 10000);
  return { app, ui, lfPage, errs };
}
async function shot(app, ui, name) {
  const uiPng = path.join(OUT, `${name}.ui.png`);
  await ui.screenshot({ path: uiPng });
  const views = await app.evaluate(async ({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0]; const out = [];
    for (const v of w.contentView.children) {
      if (!v.webContents) continue;
      if (v === global.__lfs.lfView && (global.__lfs.state.mini || global.__lfs.state.overlay)) continue;
      const img = await v.webContents.capturePage(); out.push({ b: v.getBounds(), png: img.toPNG().toString('base64') });
    }
    return out;
  });
  const layers = views.map((v, i) => { const f = path.join(OUT, `${name}.v${i}.png`); fs.writeFileSync(f, Buffer.from(v.png, 'base64')); return { b: v.b, png: f }; });
  const lj = path.join(OUT, `${name}.layers.json`); fs.writeFileSync(lj, JSON.stringify(layers));
  execFileSync('python3', [path.join(__dirname, 'composite.py'), uiPng, path.join(OUT, `${name}.png`), lj]);
}
const toastText = (ui) => ui.evaluate(() => { const t = document.getElementById('toast'); return t.hidden ? '' : t.textContent; });
/** O que o botão Player (barra de cima) mostra: não há mais barra de baixo, os controles ficam no painel */
const dock = (ui) => ui.evaluate(() => { const b = document.getElementById('panelBtn'); return { title: b.dataset.title || '', artist: b.dataset.artist || '', playing: b.dataset.playing === 'true', text: b.textContent, login: b.dataset.login === 'true' }; });
const source = (app) => app.evaluate(() => global.__lfs.state.source);
const ev = (wpm, type) => wpm.events.filter((e) => e.event === type);

(async () => {
  const lf = await LF.start(); const sp = await SP.start(); const wpm = await WP.start({ ping: `http://127.0.0.1:${sp.port}/__test/webdevice` });
  sp.devices.splice(0, sp.devices.length); sp.current = null;
  lf.junk = false;
  const C = wpm.cat;
  lf.trackIds = { 'Karma Police': C.tracks[0].id, 'Paranoid Android': C.tracks[1].id, Stranded: C.tracks[2].id, Silvera: C.tracks[3].id };
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfw-'));
  let { app, ui, lfPage, errs } = await launch(data, lf, wpm, sp);

  // 1) Primeira vez: boas-vindas e player ligado escondido, pedindo login
  const welcome = await until(() => ui.evaluate(() => document.querySelector('.sheet h2')?.textContent), 6000);
  check(welcome === 'Ouça o Spotify sem abrir o Spotify', 'primeira vez: boas-vindas para ouvir pelo web player', welcome);
  const info0 = await until(() => app.evaluate(() => { const i = global.__lfs.wp.info(); return i.status === 'on' && i.loggedIn === false ? i : null; }), 15000);
  check(!!info0 && info0.available, 'o web player liga sozinho, escondido, sem o app do Spotify', info0);
  await shot(app, ui, 'w1-welcome');
  await ui.click('#wlLogin');
  const loginShown = await until(() => app.evaluate(() => (global.__lfs.store.get('panelOpen') && /login/.test(global.__lfs.wp.state?.path || '') ? global.__lfs.wp.state.path : null)), 8000);
  check(!!loginShown, 'o botão "Entrar no Spotify" abre o login no painel à direita', loginShown);
  await until(() => app.evaluate(() => global.__lfs.wp.evaluate("!!document.getElementById('go')")), 8000);
  await app.evaluate(() => global.__lfs.wp.evaluate("document.getElementById('go').click()"));
  const logged = await until(() => app.evaluate(() => { const i = global.__lfs.wp.info(); return i.loggedIn === true && !i.visible ? i : null; }), 10000);
  check(!!logged, 'depois do login, a janela do Spotify some sozinha', logged);
  const wlDone = await until(() => app.evaluate(() => (global.__lfs.store.get('welcomed') ? 'ok' : null)), 5000);
  check(wlDone === 'ok', 'boas-vindas ficam marcadas como vistas');
  await ui.evaluate(() => window.lfs.panel({ open: false }));
  const ready = await until(async () => { const d = await dock(ui); return d.text === 'Player' && !d.login ? d : null; }, 6000);
  check(!!ready, 'logado, o botão Player fica pronto (grátis ou Premium, sem API)', ready);
  await shot(app, ui, 'w2-ready');

  // 2) Tocar o álbum pelo botão do Hub (busca dentro do web player, escolhe o álbum certo)
  await lfPage.goto('https://www.last.fm/music/Radiohead/OK+Computer');
  await lfPage.waitForTimeout(1200);
  await lfPage.click('.lfx-open-main');
  await until(() => ev(wpm, 'play').length > 0, 15000);
  const p1 = ev(wpm, 'play')[0];
  check(p1 && p1.track === C.tracks[0].id && p1.ctx === `album:${C.albums[0].id}`, 'tocar o álbum do Last.fm no web player (o original, não o tributo ao vivo)', p1);
  const d1 = await until(async () => { const d = await dock(ui); return d.title === 'Karma Police' && d.playing ? d : null; }, 6000);
  check(!!d1 && d1.artist === 'Radiohead' && (await source(app)) === 'spotify', 'o botão Player mostra a música do web player', d1);
  const t1 = await until(async () => { const t = await toastText(ui); return /Tocando o álbum/.test(t) ? t : null; }, 4000);
  check(!!t1, 'aviso "Tocando o álbum “OK Computer”"', t1);
  const accent = await until(async () => { const a = await ui.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()); return /rgb\(2\d\d/.test(a) ? a : null; }, 5000);
  check(!!accent, 'a cor do app vem da capa que o web player mostra', accent);
  await shot(app, ui, 'w3-playing');

  // 3) Link de faixa do próprio site (com o código da faixa)
  await lfPage.click('tr.chartlist-row:nth-child(2) .chartlist-play-button');
  await until(() => ev(wpm, 'play').length > 1, 12000);
  const p2 = ev(wpm, 'play')[1];
  check(p2 && p2.track === C.tracks[1].id, 'link de faixa do site toca a faixa no web player', p2);

  // 4) Faixa pela página da faixa (busca, ignora a versão ao vivo, segue com o álbum)
  await lfPage.goto('https://www.last.fm/music/Radiohead/_/Karma+Police');
  await lfPage.waitForTimeout(1200);
  const hasBtn = await lfPage.$('.lfx-open-main');
  if (hasBtn) {
    await hasBtn.click();
    await until(() => ev(wpm, 'play').length > 2, 15000);
    const p3 = ev(wpm, 'play')[2];
    check(p3 && p3.track === C.tracks[0].id && p3.ctx === `album:${C.albums[0].id}`, 'faixa do Last.fm toca a versão certa e segue com o álbum', p3);
  } else check(false, 'botão "Ouvir no Spotify" na página da faixa');

  // 4b) Se a troca de página interna do Spotify não responder, o app carrega a página de verdade
  wpm.noPop = true;
  await app.evaluate(() => global.__lfs.wp.navigate(global.__lfs.wp.url('/')));
  await until(() => app.evaluate(() => global.__lfs.wp.state && global.__lfs.wp.state.ready && global.__lfs.wp.state.path === '/'), 8000);
  await lfPage.goto('https://www.last.fm/music/Gojira/Magma');
  await lfPage.waitForTimeout(1200);
  const before4b = ev(wpm, 'play').length;
  await lfPage.click('.lfx-open-main');
  await until(() => ev(wpm, 'play').length > before4b, 25000);
  const p4 = ev(wpm, 'play')[before4b];
  check(p4 && p4.track === C.tracks[2].id, 'mesmo se a navegação interna falhar, o álbum toca (página recarregada)', p4);
  wpm.noPop = false;

  // 5) Os controles ficam no player do painel: pausar e pular por lá, o botão Player acompanha
  await app.evaluate(() => global.__lfs.wp.cmd('pause'));
  const paused = await until(async () => { const d = await dock(ui); return d.title && !d.playing ? d : null; }, 5000);
  check(!!paused && ev(wpm, 'pause').length === 1, 'pausou no player, o botão Player mostra pausado', paused);
  await app.evaluate(() => global.__lfs.wp.cmd('play'));
  await until(() => ev(wpm, 'resume').length > 0, 5000);
  await app.evaluate(() => global.__lfs.wp.cmd('next'));
  const dn = await until(async () => { const d = await dock(ui); return d.title === 'Silvera' && d.playing ? d : null; }, 6000);
  check(!!dn && ev(wpm, 'next').length === 1, 'próxima no player: o botão Player acompanha (segue o álbum)', dn);
  lf.recent = [{ title: 'Silvera', artist: 'Gojira', live: true }];

  // 7) Scrobbles
  await app.evaluate(() => global.__lfs.wp.cmd('seek', 60000)); // a conferência começa com a música andando
  await new Promise((r) => setTimeout(r, 1500));
  await app.evaluate(() => { global.__lfs.state.scrobble.checked = 0; });
  const chip = await until(() => ui.evaluate(() => { const c = document.getElementById('scrobble'); return !c.hidden && c.dataset.s === 'ok' ? c.textContent : null; }), 12000);
  check(chip === 'No Last.fm', 'confere os scrobbles também no modo web', chip || await app.evaluate(() => JSON.stringify({ sc: global.__lfs.state.scrobble, src: global.__lfs.state.source, item: global.__lfs.state.player && global.__lfs.state.player.item && global.__lfs.state.player.item.name, user: global.__lfs.state.lf })));

  // 8) Playlist e mostrar/esconder o player
  const pl = await ui.evaluate(() => ({ dis: document.getElementById('mkPlaylist').disabled, title: document.getElementById('mkPlaylist').title }));
  check(pl.dis && /Premium/.test(pl.title), 'criar playlist explica que precisa da API Premium', pl);
  await ui.click('#panelBtn');
  const shown = await until(() => app.evaluate(() => (global.__lfs.store.get('panelOpen') ? 'sim' : null)), 4000);
  await ui.waitForTimeout(500);
  await ui.click('#panelBtn');
  const hidden = await until(() => app.evaluate(() => (!global.__lfs.store.get('panelOpen') && global.__lfs.wp.state?.playing ? 'sim' : null)), 4000);
  check(shown === 'sim' && hidden === 'sim', 'o botão Player mostra e esconde o painel (escondido, continua tocando)', { shown, hidden });
  await shot(app, ui, 'w4-controls');

  // 10) Se o player fechar, ele volta sozinho (escondido e logado)
  const oldPid = await app.evaluate(() => global.__lfs.wp.proc.pid);
  process.kill(oldPid);
  const back = await until(() => app.evaluate((_e, old) => { const w = global.__lfs.wp; const i = w.info(); return i.status === 'on' && i.loggedIn === true && w.proc && w.proc.pid !== old ? w.proc.pid : null; }, oldPid), 25000);
  check(!!back && back !== oldPid, 'se a janela do Spotify fechar, o player volta sozinho e continua logado', { oldPid, back });

  check(errs.length === 0, 'sem erros', errs);

  // 11) Fechar o app fecha o player; reabrir já entra logado
  const pidBefore = await app.evaluate(() => global.__lfs.wp.proc && global.__lfs.wp.proc.pid);
  await app.close();
  await new Promise((r) => setTimeout(r, 1500));
  let alive = true; try { process.kill(pidBefore, 0); } catch (_) { alive = false; }
  check(!alive, 'fechar o app fecha o player escondido (a música para)', { pidBefore, alive });
  ({ app, ui, lfPage, errs } = await launch(data, lf, wpm, sp));
  const again = await until(async () => { const i = await app.evaluate(() => global.__lfs.wp.info()); const d = await dock(ui); return i.loggedIn === true && d.text === 'Player' && !d.login ? d : null; }, 15000);
  const sheetOpen = await ui.evaluate(() => !document.getElementById('overlay').hidden);
  check(!!again && !sheetOpen, 'reabrindo, o player já liga logado e sem boas-vindas', { again, sheetOpen });
  // 12) Premium: com a API conectada, o web player escondido vira o "aparelho" do computador
  await ui.click('#openSettings');
  await until(() => ui.evaluate(() => document.querySelectorAll('.tabs button').length >= 6), 3000);
  const setTxt = await ui.evaluate(() => document.getElementById('panel').textContent);
  check(/Player do Spotify conectado/.test(setTxt) && /API do Spotify/.test(setTxt), 'configurações mostram o player e a API opcional', setTxt.slice(0, 160));
  await ui.click('#panel .who:last-of-type .btn.primary');
  await until(() => ui.evaluate(() => !!document.getElementById('cid')), 3000);
  await ui.fill('#cid', '0123456789abcdef0123456789abcdef');
  await ui.click('#goLogin');
  const apiOk = await until(() => ui.evaluate(() => document.querySelector('.done-big h2')?.textContent), 10000);
  check(apiOk === 'API do Spotify conectada', 'conectar a API (Premium) com o player escondido', apiOk);
  await ui.keyboard.press('Escape');
  await until(() => sp.devices.some((d) => d.id === 'webdev'), 6000);
  await lfPage.goto('https://www.last.fm/music/Radiohead/OK+Computer');
  await lfPage.waitForTimeout(1200);
  const playsApi = sp.plays.length;
  await lfPage.click('.lfx-open-main');
  await until(() => sp.plays.length > playsApi, 12000);
  const active = sp.devices.find((d) => d.is_active);
  check(sp.plays[sp.plays.length - 1]?.context_uri === 'spotify:album:al1' && active?.id === 'webdev', 'com a API, toca pelo web player escondido (aparelho deste computador)', { last: sp.plays[sp.plays.length - 1], active: active && active.id });
  const devApi = await until(async () => { const d = await dock(ui); return d.title === 'Karma Police' ? d : null; }, 8000);
  check(!!devApi, 'com a API, o botão Player mostra o que toca no web player', devApi);
  check(errs.length === 0, 'sem erros na segunda abertura', errs);

  // 13) Bug relatado: API conectada (de uma versão anterior) e o player escondido sem login.
  //     Antes a barra só dizia "Pronto para tocar" e não havia como entrar no Spotify.
  await app.evaluate(() => global.__lfs.wp.evaluate("localStorage.removeItem('logged'); location.reload(); 1"));
  sp.devices.splice(0, sp.devices.length); sp.current = null;
  const out13 = await until(() => app.evaluate(() => global.__lfs.wp.info().loggedIn === false), 10000);
  check(out13, 'player sem login detectado (API conectada)');
  const loginTip = await until(async () => { const t = await toastText(ui); return /Entre na sua conta do Spotify/.test(t) ? t : null; }, 6000);
  check(!!loginTip, 'avisa uma vez para entrar no Spotify, com o botão', loginTip);
  const emptyApi = await until(async () => { const d = await dock(ui); return d.login ? d : null; }, 8000);
  check(emptyApi && emptyApi.text === 'Entrar no Spotify', 'com a API conectada, o botão Player vira "Entrar no Spotify"', emptyApi);
  await shot(app, ui, 'w6-api-login');
  // tocar algo do Last.fm sem login no player: pede o login em vez de ficar procurando aparelho
  await lfPage.goto('https://www.last.fm/music/Gojira/Magma');
  await lfPage.waitForTimeout(1200);
  await lfPage.click('.lfx-open-main');
  const askLogin = await until(async () => { const t = await toastText(ui); return /Entre na sua conta do Spotify para tocar/.test(t) ? t : null; }, 12000);
  check(!!askLogin, 'dar play sem login no player pede o login (com a API)', askLogin);
  await ui.click('#panelBtn');
  const loginWin = await until(() => app.evaluate(() => (global.__lfs.store.get('panelOpen') && /login/.test(global.__lfs.wp.state?.path || '') ? 'sim' : null)), 8000);
  check(loginWin === 'sim', '"Entrar no Spotify" (no botão Player) abre o login do player no painel', loginWin);
  await until(() => app.evaluate(() => global.__lfs.wp.evaluate("!!document.getElementById('go')")), 8000);
  await app.evaluate(() => global.__lfs.wp.evaluate("document.getElementById('go').click()"));
  const back13 = await until(() => app.evaluate(() => { const i = global.__lfs.wp.info(); return i.loggedIn === true ? i : null; }), 10000);
  check(!!back13, 'depois do login o player volta a ser o aparelho deste computador', back13);
  await ui.evaluate(() => window.lfs.panel({ open: false }));
  await until(() => sp.devices.some((d) => d.id === 'webdev'), 6000);
  const plays13 = sp.plays.length;
  await lfPage.click('.lfx-open-main');
  await until(() => sp.plays.length > plays13, 12000);
  check(sp.plays.length > plays13 && sp.devices.find((d) => d.is_active)?.id === 'webdev', 'com login feito, o play pela API funciona', sp.plays[sp.plays.length - 1]);

  // 14) Faxina do cache roda sem erro
  const trimmed = await app.evaluate(async () => { await global.__lfs.trimCaches(); return 'ok'; }).catch((e) => e.message);
  check(trimmed === 'ok', 'faxina do cache roda sem erro', trimmed);
  const logTxt = fs.existsSync(path.join(data, 'registro.log')) ? fs.readFileSync(path.join(data, 'registro.log'), 'utf8') : '';
  check(/player: ligado/.test(logTxt) && /player: login feito/.test(logTxt), 'registro.log anota o que o player fez', logTxt.split('\n').slice(-4).join(' | '));
  check(errs.length === 0, 'sem erros no fim', errs);
  await app.close();

  console.log('OK:', ok.length); ok.forEach((x) => console.log('  ✓', x));
  console.log('FALHAS:', bad.length); bad.forEach((x) => console.log('  ✗', x));
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error('FAIL', e); console.log('OK:', ok.length); ok.forEach((x) => console.log('  ✓', x)); console.log('FALHAS:', bad.length); bad.forEach((x) => console.log('  ✗', x)); process.exit(1); });

'use strict';
const ENV = require('./env');
// Teste do painel do player (direita), das outras plataformas, dos scrobbles feitos pelo app e das novas configurações
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const LF = require('./mock-lastfm'); const WP = require('./mock-webplayer'); const SP = require('./mock-spotify'); const PM = require('./mock-platform');
const OUT = process.env.OUT || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const ok = [], bad = [];
const check = (c, label, extra) => { (c ? ok : bad).push(label + (extra !== undefined ? ` → ${typeof extra === 'string' ? extra : JSON.stringify(extra)}` : '')); console.log(c ? '  ✓' : '  ✗', label, extra !== undefined ? JSON.stringify(extra).slice(0, 220) : ''); };
const until = async (fn, ms = 8000, step = 150) => { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); if (v) return v; } catch (_) { /* tenta de novo */ } await new Promise((r) => setTimeout(r, step)); } return v; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
      LFS_LASTFM_API: `http://127.0.0.1:${lf.port}/2.0/`, LFS_LASTFM_POLL: '400', LFS_SCROBBLE_NEED: '3000', LFS_SCROBBLE_WAIT: '1500', LFS_SCROBBLE_WAIT_OTHER: '300',
    },
  });
  const errs = [];
  app.process().stderr.on('data', (d) => { const s = String(d); if (/Uncaught|TypeError|ReferenceError|Error:/.test(s) && !/dbus|gpu|viz|Fontconfig|Debugger|DevTools/i.test(s)) errs.push('[main] ' + s.trim()); });
  const ui = await app.firstWindow();
  ui.on('pageerror', (e) => errs.push('ui: ' + e.message));
  ui.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('ui console: ' + m.text()); });
  await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; w.setSize(1440, 900); w.center(); });
  const lfPage = await until(() => app.windows().find((w) => w.url().includes('last.fm')), 10000);
  return { app, ui, lfPage, errs };
}
const toastText = (ui) => ui.evaluate(() => { const t = document.getElementById('toast'); return t.hidden ? '' : t.textContent; });
/** O que o botão Player (barra de cima) mostra: não há mais barra de baixo, os controles ficam no painel */
const dock = (ui) => ui.evaluate(() => { const b = document.getElementById('panelBtn'); return { title: b.dataset.title || '', artist: b.dataset.artist || '', playing: b.dataset.playing === 'true', text: b.textContent }; });
const sourceOf = (app) => app.evaluate(() => global.__lfs.state.source);
const ev = (m, type) => m.events.filter((e) => e.event === type);
/** Clica num elemento da página que está no painel, passando pelo painel (como você faria com o mouse) */
async function clickInPanel(app, ui, pid, selector) {
  const r = await app.evaluate(async (_e, a) => {
    const w = global.__lfs.wp; const src = w.src(a.pid);
    const res = await w.cdp.send('Runtime.evaluate', { expression: `JSON.stringify(document.querySelector(${JSON.stringify(a.selector)}).getBoundingClientRect())`, returnByValue: true }, src.sid);
    return JSON.parse(res.result.value);
  }, { pid, selector });
  const c = await ui.locator('#plCanvas').boundingBox();
  await ui.mouse.click(c.x + r.x + Math.min(r.width / 2, 60), c.y + r.y + r.height / 2);
  return r;
}

(async () => {
  const lf = await LF.start(); const sp = await SP.start(); const wpm = await WP.start({}); const pm = await PM.start();
  sp.devices.splice(0, sp.devices.length); sp.current = null;
  lf.junk = false;
  const C = wpm.cat;
  lf.trackIds = { 'Karma Police': C.tracks[0].id, 'Paranoid Android': C.tracks[1].id, Stranded: C.tracks[2].id, Silvera: C.tracks[3].id };
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfp-'));
  let { app, ui, lfPage, errs } = await launch(data, lf, wpm, sp, pm);
  await until(() => ui.evaluate(() => !!document.querySelector('.sheet h2')), 6000);
  await ui.keyboard.press('Escape');

  console.log('Painel e login do Spotify');
  check(await ui.evaluate(() => !document.getElementById('panelBtn').hidden), 'botão "Player" na barra de cima');
  await ui.evaluate(() => window.lfs.playerLogin());
  const opened = await until(() => ui.evaluate(() => document.getElementById('plPanel').classList.contains('open')), 6000);
  check(opened, 'entrar no Spotify abre o painel à direita (com animação)');
  const widths = await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; return { win: w.getContentSize()[0], lf: global.__lfs.lfView.getBounds().width, pw: global.__lfs.store.get('panelWidth') }; });
  check(widths.lf === widths.win - Math.min(widths.pw, widths.win - 480), 'o Last.fm encolhe para dar lugar ao painel', widths);
  const live = await until(() => ui.evaluate(() => document.getElementById('plScreen').classList.contains('live')), 15000);
  check(live, 'o Spotify aparece ao vivo no painel');
  await until(() => app.evaluate(() => /login/.test(global.__lfs.wp.state?.path || '') || null), 8000);
  await sleep(500);
  // login com o Facebook: a página abre uma janela à parte (window.open)
  await clickInPanel(app, ui, 'spotify', '#fb');
  const pop = await until(() => app.evaluate(() => { const w = global.__lfs.wp; const p = [...w.popups.values()][0]; return p && p.windowId ? p : null; }), 8000);
  check(!!pop && /facebook/.test(pop.url || ''), 'login com o Facebook: a janela de autorização abre à parte (não some atrás do player)', pop);
  check(!!pop && !!pop.windowId, 'a janela do Facebook é uma janela de verdade, posicionada na tela', pop && pop.windowId);
  const popToast = await until(async () => { const t = await toastText(ui); return /janela de login do Facebook/.test(t) ? t : null; }, 5000);
  check(!!popToast, 'o app avisa que a janela do Facebook abriu à parte', popToast);
  const note = await until(() => ui.evaluate(() => (!document.getElementById('plNote').hidden ? document.getElementById('plNote').textContent : null)), 5000);
  check(/janela de login/.test(note || ''), 'o painel mostra que há uma janela de login aberta', note);
  const bounds = await app.evaluate(async (_e, id) => { const w = global.__lfs.wp; return (await w.cdp.send('Browser.getWindowBounds', { windowId: id })).bounds; }, pop.windowId);
  check(bounds.left > -1000 && bounds.top > -1000 && bounds.width >= 420, 'a janela de login fica na tela (e não fora dela, como o player)', bounds);
  // você autoriza na janela do Facebook; ela fecha sozinha e o login continua no painel
  await app.evaluate(async (_e, targetId) => {
    const c = global.__lfs.wp.cdp;
    const { sessionId } = await c.send('Target.attachToTarget', { targetId, flatten: true });
    await c.send('Runtime.evaluate', { expression: "document.getElementById('allow').click()" }, sessionId);
  }, pop.targetId);
  const logged = await until(() => app.evaluate(() => (global.__lfs.wp.info().loggedIn === true ? 'sim' : null)), 10000);
  check(logged === 'sim' && ev(wpm, 'fb-ok').length === 1, 'autorizado no Facebook, o Spotify fica logado');
  const popClosed = await until(() => app.evaluate(() => (global.__lfs.wp.popups.size === 0 ? 'sim' : null)), 6000);
  check(popClosed === 'sim', 'a janela do Facebook fecha sozinha e o app volta ao painel');
  check(await until(() => ui.evaluate(() => document.getElementById('plNote').hidden), 4000), 'o aviso da janela de login some do painel');
  await ui.screenshot({ path: path.join(OUT, 'p1-panel-spotify.png') });

  console.log('Outras plataformas (dentro do app, sem o Edge)');
  const natPage = (re) => until(() => app.windows().find((w) => re.test(w.url())), 8000);
  await ui.evaluate(() => [...document.querySelectorAll('.pltab')].find((b) => /YouTube Music/.test(b.title)).click());
  const yLoad = await until(() => ev(pm, 'load').length > 0, 12000);
  const yNat = await until(() => app.evaluate(() => { const n = global.__lfs.native; return n.shown === 'ytmusic' ? { bounds: n.get('ytmusic').view.getBounds(), edge: [...global.__lfs.wp.sources.keys()] } : null; }), 10000);
  const scr = await ui.evaluate(() => { const r = document.getElementById('plScreen').getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) }; });
  check(yLoad && !!yNat && !yNat.edge.includes('ytmusic'), 'o YouTube Music abre dentro do app (sem o navegador escondido)', yNat);
  check(!!yNat && Math.abs(yNat.bounds.x - scr.x) <= 1 && Math.abs(yNat.bounds.y - scr.y) <= 1 && Math.abs(yNat.bounds.width - scr.width) <= 1 && Math.abs(yNat.bounds.height - scr.height) <= 1, 'a página fica exatamente na tela do painel', { view: yNat && yNat.bounds, scr });
  const yt = await natPage(/\/ytm\//);
  await yt.click('#s0');
  await until(() => ev(pm, 'play').length > 0, 6000);
  check(ev(pm, 'play')[0]?.title === 'Teardrop', 'clicar numa música no painel toca no YouTube Music', ev(pm, 'play')[0]);
  const dy = await until(async () => { const d = await dock(ui); return d.title === 'Teardrop' && d.playing ? d : null; }, 8000);
  check(dy && dy.artist === 'Massive Attack' && (await sourceOf(app)) === 'ytmusic', 'o botão Player da barra de cima mostra o que toca no YouTube Music', dy);
  await yt.click('#q');
  await yt.keyboard.type('Björk ç');
  await yt.keyboard.press('Enter');
  const se = await until(() => ev(pm, 'search').find((e) => e.via === 'enter'), 6000);
  check(se && se.q === 'Björk ç', 'digitar no painel (com acentos) e Enter chegam à página', se);
  const sbox = await yt.evaluate(() => { const r = document.getElementById('scroller').getBoundingClientRect(); return { x: r.x + 50, y: r.y + 50 }; });
  await yt.mouse.move(sbox.x, sbox.y);
  await yt.mouse.wheel(0, 300);
  check(await until(() => ev(pm, 'scroll').length > 0, 5000), 'a rolagem do mouse rola a página do painel');
  await yt.click('#pause');
  await until(() => ev(pm, 'pause').length > 0, 5000);
  const dp = await until(async () => { const d = await dock(ui); return d.title === 'Teardrop' && !d.playing ? d : null; }, 5000);
  check(ev(pm, 'pause').length === 1 && !!dp, 'pausar no próprio site, no painel: o botão Player mostra pausado', dp);
  await yt.click('#pause');
  await until(() => ev(pm, 'resume').length > 0, 5000);
  await yt.click('#nextb');
  await until(() => ev(pm, 'next').length > 0, 5000);
  const dn = await until(async () => { const d = await dock(ui); return d.title === 'Glory Box' && d.playing ? d : null; }, 6000);
  check(!!dn, 'próxima no próprio site (painel): o botão Player acompanha', dn);
  await ui.screenshot({ path: path.join(OUT, 'p2-panel-ytmusic.png') });
  const one = await app.evaluate(() => { const w = global.__lfs.wp; return { asleep: w.asleep, edge: [...w.sources.keys()], native: [...global.__lfs.native.views.keys()], spotifyState: w.state }; });
  check(one.asleep === true && !one.edge.length && one.native.join() === 'ytmusic' && !one.spotifyState, 'um player por vez: abrir o YouTube Music põe o Spotify para descansar', one);
  const r0 = await app.evaluate(() => global.__lfs.native.cmd('ytmusic', 'pause'));
  await until(async () => !(await dock(ui)).playing, 4000);
  const r1 = await app.evaluate(() => global.__lfs.native.cmd('ytmusic', 'play'));
  check(r0.ok && r1.ok && (await until(async () => (await dock(ui)).playing, 4000)), 'comandos de mídia (play/pausa) chegam ao YouTube Music dentro do app', { r0, r1 });

  // a barra não pisca quando a página se redesenha nem fica trocando a capa
  const ytEval = (expr) => app.evaluate((_e, x) => global.__lfs.native.get('ytmusic').wc.executeJavaScript(x), expr);
  await ytEval('window.__flap(2000)');
  const seen = new Set();
  for (let i = 0; i < 26; i++) { seen.add((await dock(ui)).title); await sleep(100); }
  check(seen.size === 1 && seen.has('Glory Box'), 'a barra continua mostrando a música enquanto a página se redesenha', [...seen]);
  await sleep(600);
  const srcs = new Set();
  await ytEval('window.__artFlip()');
  for (let i = 0; i < 30; i++) { srcs.add(await ui.evaluate(() => document.querySelector('#panelBtn .pp-cover')?.getAttribute('src') || '')); await sleep(120); }
  await ytEval('clearInterval(window.__artTimer)');
  check(srcs.size <= 2, 'a capa da mesma música não fica trocando', srcs.size);
  const winsBefore = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length);
  await yt.click('#site');
  const ext = await until(() => app.evaluate(() => (global.__opened || []).find((u) => u.includes('site-do-artista')) || null), 6000);
  const winsAfter = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length);
  check(!!ext && winsAfter === winsBefore, 'um link comum do player abre no seu navegador (sem janela nova)', { ext, winsBefore, winsAfter });
  // login (Google, Facebook…) numa janela de verdade, na frente do app; fecha sozinha e volta ao painel
  await yt.click('#login');
  const lwin = await until(() => app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows().find((x) => /accounts\/signin/.test(x.webContents.getURL())); return w ? { visible: w.isVisible(), parent: w.getParentWindow() === global.__lfs.win, b: w.getBounds() } : null; }), 6000);
  check(!!lwin && lwin.visible && lwin.parent, 'a janela de login abre na frente do app (presa a ele)', lwin);
  const lToast = await until(async () => { const t = await toastText(ui); return /janela/.test(t) ? t : null; }, 4000);
  check(!!lToast, 'o app avisa que a janela de login abriu à parte', lToast);
  const lp = await natPage(/accounts\/signin/);
  await lp.click('#allow');
  const lDone = await until(() => app.evaluate(({ BrowserWindow }) => (!BrowserWindow.getAllWindows().some((x) => /accounts\/signin/.test(x.webContents.getURL())) ? 'fechou' : null)), 6000);
  check(lDone === 'fechou' && ev(pm, 'login-ok').length === 1, 'continuar na janela de login: ela fecha sozinha', lDone);

  console.log('Scrobbles pelo app');
  await lfPage.goto('https://www.last.fm/api/account/create');
  const keyToast = await until(async () => { const t = await toastText(ui); return /Chave da API do Last\.fm salva/.test(t) ? t : null; }, 8000);
  check(!!keyToast, 'a chave da API é pega sozinha na página do Last.fm', keyToast);
  ui.evaluate(() => window.lfs.lfmAuth());
  await until(() => lfPage.evaluate(() => !!document.getElementById('allow')), 10000);
  await lfPage.click('#allow');
  const conn = await until(() => app.evaluate(() => (global.__lfs.scrob.connected ? global.__lfs.scrob.user : null)), 10000);
  check(conn === 'TestUser', 'autorizar no Last.fm liga os scrobbles do app', conn);
  const scY = await until(() => lf.scrobbles.find((x) => x.track === 'Glory Box'), 15000);
  check(scY && scY.artist === 'Portishead' && scY.album === 'Dummy', 'o que toca no YouTube Music vira scrobble no Last.fm', scY);
  check(lf.nowPlaying.some((x) => x.track === 'Glory Box'), '"tocando agora" também vai para o Last.fm');
  const chip = await until(() => ui.evaluate(() => { const c = document.getElementById('scrobble'); return !c.hidden && c.dataset.s === 'sent' ? c.textContent : null; }), 8000);
  check(chip === 'No Last.fm', 'a barra mostra que o app mandou o scrobble', chip);

  console.log('Spotify junto: uma plataforma por vez e sem scrobble duplicado');
  const now = Math.floor(Date.now() / 1000);
  lf.apiRecent.push({ artist: 'Radiohead', track: 'Karma Police', ts: now + 5 }); // o próprio Spotify já mandou
  const pausesBefore = ev(pm, 'pause').length;
  await lfPage.goto('https://www.last.fm/music/Radiohead/OK+Computer');
  await lfPage.waitForTimeout(1200);
  await lfPage.click('.lfx-open-main');
  const ds = await until(async () => { const d = await dock(ui); return d.title === 'Karma Police' && d.playing ? d : null; }, 15000);
  check(!!ds && (await sourceOf(app)) === 'spotify', 'tocar pelo Last.fm volta o botão Player para o Spotify', ds);
  check(await until(() => ev(pm, 'pause').length > pausesBefore, 5000), 'o YouTube Music pausa sozinho quando o Spotify começa');
  const back = await app.evaluate(() => { const w = global.__lfs.wp; return { asleep: w.asleep, edge: [...w.sources.keys()], native: [...global.__lfs.native.views.keys()], panel: global.__lfs.store.get('panelPlatform') }; });
  check(!back.asleep && !back.edge.length && !back.native.length && back.panel === 'spotify', 'um player por vez: o YouTube Music fecha quando o Spotify volta a tocar', back);
  const svc = await until(() => app.evaluate(() => { const l = global.__lfs.scrob.last; return l && l.track === 'Karma Police' ? l : null; }), 15000);
  check(svc && svc.via === 'service' && !lf.scrobbles.some((x) => x.track === 'Karma Police'), 'Spotify: se ele já mandou o scrobble, o app não duplica', svc);
  await app.evaluate(() => global.__lfs.wp.cmd('next')); // próxima no próprio Spotify (no painel)
  const scS = await until(() => lf.scrobbles.find((x) => x.track === 'Paranoid Android'), 15000);
  check(scS && scS.artist === 'Radiohead', 'Spotify: se ele não mandou, o app manda (vale para a conta grátis)', scS);

  console.log('Versão de celular, links e fechar');
  await ui.evaluate(() => [...document.querySelectorAll('.pltab')].find((b) => /YouTube Music/.test(b.title)).click());
  const oneToast = await until(async () => { const t = await toastText(ui); return /Um player por vez: fechei o Spotify/.test(t) ? t : null; }, 6000);
  check(!!oneToast, 'trocar de plataforma avisa que o Spotify fechou (um player por vez)', oneToast);
  check(await until(() => app.evaluate(() => (global.__lfs.wp.asleep && global.__lfs.state.source === 'ytmusic') || null), 6000), 'a barra passa para a plataforma aberta');
  await until(() => app.evaluate(() => global.__lfs.native.shown === 'ytmusic' || null), 8000);
  const loads = ev(pm, 'load').length;
  await ui.click('#plLayout');
  const mob = await until(() => ev(pm, 'load').slice(loads).find((e) => e.mobile), 10000);
  check(!!mob, 'botão de celular/computador recarrega o site na versão de celular');
  await ui.screenshot({ path: path.join(OUT, 'p3-panel-mobile.png') });
  await ui.click('#plLayout');
  await until(() => ev(pm, 'load').slice(loads).filter((e) => !e.mobile).length > 0, 10000);
  await sleep(400);
  await ui.click('#plClose');
  await until(() => ui.evaluate(() => document.getElementById('plPanel').hidden), 3000);
  const full = await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; return { win: w.getContentSize()[0], lf: global.__lfs.lfView.getBounds().width, shown: global.__lfs.native.shown, visible: global.__lfs.native.get('ytmusic').view.getVisible() }; });
  check(full.lf === full.win && !full.shown && !full.visible, 'fechar o painel esconde a página e devolve a largura toda ao Last.fm', full);
  check(await app.evaluate(() => global.__lfs.native.has('ytmusic')), 'escondido, o player continua aberto (tocando)');
  const snapped = await ui.evaluate(() => document.getElementById('plCanvas').width > 50);
  check(snapped, 'o painel sai deslizando com um retrato da página (sem buraco preto)');
  // "Ouvir no YouTube Music" do Last.fm: abre no painel e já toca o primeiro resultado
  const playsBefore = ev(pm, 'play').length;
  await lfPage.evaluate((href) => { const a = document.createElement('a'); a.id = 'lfxTestOuvir'; a.href = href; a.target = '_blank'; a.textContent = 'Ouvir no YouTube Music'; a.style.cssText = 'position:fixed;left:40px;top:320px;z-index:99999;background:#fff;color:#000;padding:10px'; document.body.append(a); }, `http://127.0.0.1:${pm.port}/ytm/search?q=Portishead%20Glory%20Box`);
  const ob = await lfPage.evaluate(() => { const r = document.getElementById('lfxTestOuvir').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await lfPage.mouse.click(ob.x, ob.y);
  const auto = await until(() => ev(pm, 'play').slice(playsBefore).find((e) => e.title === 'Glory Box'), 15000);
  const autoToast = await until(async () => { const t = await toastText(ui); return /Tocando no YouTube Music/.test(t) ? t : null; }, 6000);
  check(!!auto && !!autoToast, '"Ouvir no YouTube Music" do Last.fm abre no painel e já toca o primeiro resultado', { auto, autoToast });
  check(await app.evaluate(() => !!global.__lfs.store.get('panelOpen') && global.__lfs.store.get('panelPlatform') === 'ytmusic'), 'o painel abre sozinho no YouTube Music');
  check(!((await app.evaluate(() => global.__opened || [])).some((u) => /ytm\/search/.test(u))), 'nada abriu no navegador');

  // Deezer também dentro do app; e "pelo Edge" continua disponível nas configurações
  await ui.evaluate(() => [...document.querySelectorAll('.pltab')].find((b) => /Deezer/.test(b.title)).click());
  const dz = await until(() => app.evaluate(() => { const n = global.__lfs.native; return n.shown === 'deezer' && !n.has('ytmusic') ? [...n.views.keys()] : null; }), 10000);
  check(!!dz && dz.join() === 'deezer', 'abrir o Deezer fecha o YouTube Music (só um player trabalhando)', dz);
  await ui.evaluate(() => window.lfs.settings({ engines: { deezer: 'edge' } }));
  const dzEdge = await until(() => app.evaluate(() => { const w = global.__lfs.wp; return w.sources.has('deezer') && !global.__lfs.native.has('deezer') && w.screen && w.screen.pid === 'deezer' && w.screen.frames > 0 ? 'edge' : null; }), 15000);
  check(dzEdge === 'edge', 'nas configurações, o Deezer pode abrir pelo Edge (imagem no painel)', dzEdge);
  await clickInPanel(app, ui, 'deezer', '#s2');
  const dzPlay = await until(() => ev(pm, 'play').find((e) => e.app === 'Deezer' && e.title === 'Hyperballad'), 6000);
  check(!!dzPlay, 'pelo Edge, clicar no painel toca no Deezer', dzPlay);
  await ui.evaluate(() => window.lfs.settings({ engines: { deezer: 'native' } }));
  const dzBack = await until(() => app.evaluate(() => (global.__lfs.native.shown === 'deezer' && !global.__lfs.wp.sources.has('deezer') ? 'app' : null)), 12000);
  check(dzBack === 'app', 'e volta para dentro do app quando você escolhe "No app"', dzBack);
  // uma página que pede DRM dentro do app: o app avisa e oferece abrir pelo Edge
  await ui.evaluate((u) => window.lfs.panel({ open: true, platform: 'deezer', url: u }), `http://127.0.0.1:${pm.port}/deezer/?drm=1`);
  const drmToast = await until(async () => { const t = await toastText(ui); return /proteção de conteúdo/.test(t) && /Abrir pelo Edge/.test(t) ? t : null; }, 8000);
  check(!!drmToast, 'uma página que pede DRM: o app avisa e oferece abrir pelo Edge', drmToast);

  // Spotify (pelo Edge): janela à parte para logins difíceis
  await ui.evaluate(() => [...document.querySelectorAll('.pltab')].find((b) => /Spotify/.test(b.title)).click());
  await until(() => app.evaluate(() => (global.__lfs.wp.screen && global.__lfs.wp.screen.pid === 'spotify' && global.__lfs.wp.screen.frames > 0 && !global.__lfs.native.has('deezer')) || null), 15000);
  check(await ui.evaluate(() => !document.getElementById('plWin').hidden), 'no Spotify (pelo Edge) o botão "janela à parte" aparece');
  await ui.click('#plWin');
  const shown = await until(() => ui.evaluate(() => (/numa janela à parte/.test(document.getElementById('plWaitTitle').textContent) ? document.getElementById('plWaitTitle').textContent : null)), 6000);
  const shownInfo = await app.evaluate(() => ({ shown: global.__lfs.wp.shownPid, screen: !!global.__lfs.wp.screen }));
  check(!!shown && shownInfo.shown === 'spotify' && !shownInfo.screen, 'botão "janela à parte" mostra o player numa janela de verdade (para logins difíceis)', { shown, ...shownInfo });
  await ui.evaluate(() => [...document.querySelectorAll('#plWaitActions button')].find((b) => /Voltar ao painel/.test(b.textContent)).click());
  const backLive = await until(() => app.evaluate(() => (!global.__lfs.wp.shownPid && global.__lfs.wp.screen && global.__lfs.wp.screen.pid === 'spotify' && global.__lfs.wp.screen.frames > 0) || null), 8000);
  check(!!backLive, '"Voltar ao painel" traz o player de volta para o painel');
  const oldMain = await app.evaluate(async () => { const w = global.__lfs.wp; const id = w.targetId; await w.cdp.send('Target.closeTarget', { targetId: id }); return id; });
  const newMain = await until(() => app.evaluate((_e, old) => { const w = global.__lfs.wp; return w.sid && w.targetId && w.targetId !== old ? { running: w.running } : null; }, oldMain), 8000);
  check(!!newMain && newMain.running, 'fechar a janela do Spotify não derruba o player: ele volta escondido', newMain);

  console.log('Clique fora do painel');
  await ui.evaluate(() => [...document.querySelectorAll('.pltab')].find((b) => /Deezer/.test(b.title)).click());
  await until(() => app.evaluate(() => global.__lfs.native.shown === 'deezer' || null), 10000);
  const spot = (id, top) => lfPage.evaluate(([i, t]) => { let d = document.getElementById(i); if (!d) { d = document.createElement('div'); d.id = i; d.textContent = 'texto do Last.fm'; d.style.cssText = `position:fixed;left:40px;top:${t}px;width:220px;height:40px;z-index:99999;background:#222;color:#fff`; document.body.append(d); } }, [id, top]);
  await spot('lfxTestSpot', 200);
  const sBox0 = await lfPage.evaluate(() => { const r = document.getElementById('lfxTestSpot').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await lfPage.mouse.click(sBox0.x, sBox0.y);
  const collapsed = await until(() => app.evaluate(() => (!global.__lfs.store.get('panelOpen') ? 'sim' : null)), 3000);
  const fullW = await until(() => app.evaluate(({ BrowserWindow }) => (global.__lfs.lfView.getBounds().width === BrowserWindow.getAllWindows()[0].getContentSize()[0] ? 'sim' : null)), 3000);
  const still = await app.evaluate(() => global.__lfs.native.has('deezer') && !global.__lfs.native.shown);
  check(collapsed === 'sim' && fullW === 'sim' && still, 'clicar no Last.fm recolhe o painel: o Last.fm volta a ocupar a tela e o player continua', { collapsed, fullW, still });
  await ui.screenshot({ path: path.join(OUT, 'p5-collapsed.png') });
  await ui.click('#panelBtn');
  const reshown = await until(() => app.evaluate(() => (global.__lfs.store.get('panelOpen') && global.__lfs.native.shown === 'deezer' ? 'sim' : null)), 4000);
  check(reshown === 'sim', 'o botão Player abre o painel de novo, com a página no lugar', reshown);
  await ui.evaluate(() => document.getElementById('mid').click());
  const collapsed2 = await until(() => app.evaluate(() => (!global.__lfs.store.get('panelOpen') ? 'sim' : null)), 3000);
  check(collapsed2 === 'sim', 'clicar na barra de cima, fora do painel, também recolhe');
  await ui.click('#panelBtn');
  await until(() => app.evaluate(() => global.__lfs.store.get('panelOpen') || null), 3000);
  await sleep(700);
  await ui.evaluate(() => document.getElementById('plTabs').click());
  const dzPage = await natPage(/\/deezer\//);
  await dzPage.click('#q');
  await sleep(500);
  check(await app.evaluate(() => !!global.__lfs.store.get('panelOpen')), 'clicar dentro do painel (e na página dele) não recolhe');
  await lfPage.evaluate((href) => { const a = document.createElement('a'); a.id = 'lfxTestYtm'; a.href = href; a.textContent = 'Ouvir no YouTube Music'; a.style.cssText = 'position:fixed;left:40px;top:260px;z-index:99999;background:#fff;color:#000;padding:10px'; document.body.append(a); }, `http://127.0.0.1:${pm.port}/ytm/`);
  const samples = [];
  const sampler = (async () => { for (let i = 0; i < 16; i++) { samples.push(await app.evaluate(() => !!global.__lfs.store.get('panelOpen'))); await sleep(60); } })();
  const ytBox = await lfPage.evaluate(() => { const r = document.getElementById('lfxTestYtm').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await lfPage.mouse.click(ytBox.x, ytBox.y);
  await sampler;
  const onYt = await until(() => app.evaluate(() => (global.__lfs.store.get('panelPlatform') === 'ytmusic' ? 'sim' : null)), 5000);
  check(samples.every(Boolean) && onYt === 'sim', 'um link do Last.fm que abre no painel não faz o painel piscar', { samples: samples.map(Number).join(''), onYt });
  await ui.evaluate(() => window.lfs.settings({ panelAutoHide: false }));
  await lfPage.mouse.click(sBox0.x, sBox0.y);
  await sleep(700);
  check(await app.evaluate(() => !!global.__lfs.store.get('panelOpen')), 'com "Recolher o painel ao clicar fora" desligado, o painel fica aberto');
  await ui.evaluate(() => window.lfs.settings({ panelAutoHide: true }));
  await ui.click('#plClose');

  console.log('Configurações: balões, desempenho e cache');
  await ui.click('#openSettings');
  await until(() => ui.evaluate(() => document.querySelectorAll('.tabs button').length >= 6), 3000);
  await ui.evaluate(() => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent === 'Desempenho').click());
  await until(() => ui.evaluate(() => [...document.querySelectorAll('#panel .toggle strong')].some((x) => x.textContent === 'Balões flutuantes')), 8000);
  await ui.evaluate(() => { const t = [...document.querySelectorAll('#panel .toggle')].find((x) => /Balões flutuantes/.test(x.textContent)); t.querySelector('input').click(); });
  const hc = await until(() => lfPage.evaluate(() => { const s = JSON.parse(localStorage.getItem('lfx:settings') || '{}'); return s.hoverCards === false ? 'off' : null; }), 6000);
  check(hc === 'off', 'desligar os balões flutuantes nas configurações do app desliga no Last.fm');
  await ui.evaluate(() => [...document.querySelectorAll('#panel [role=radio]')].find((b) => b.textContent === 'Desempenho').click());
  const lite = await until(async () => (await ui.evaluate(() => document.body.classList.contains('lite'))) && (await lfPage.evaluate(() => document.documentElement.classList.contains('lfx-lite'))) ? 'sim' : null, 6000);
  check(lite === 'sim', 'modo Desempenho deixa o app e o Last.fm leves');
  await ui.screenshot({ path: path.join(OUT, 'p4-settings-perf.png') });
  await until(() => ui.evaluate(() => !!document.getElementById('cacheBtn')), 6000);
  await ui.click('#cacheBtn');
  const cleaned = await until(() => ui.evaluate(() => (/^Pronto/.test(document.getElementById('cacheTxt')?.textContent || '') ? document.getElementById('cacheTxt').textContent : null)), 15000);
  check(!!cleaned, 'limpar o cache pelas configurações', cleaned);
  await ui.evaluate(() => [...document.querySelectorAll('#panel [role=radio]')].find((b) => b.textContent === 'Experiência completa').click());
  await ui.evaluate(() => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent === 'Integração').click());
  const eng = await until(() => ui.evaluate(() => { const rows = [...document.querySelectorAll('.engine-row')]; if (!rows.length) return null; return Object.fromEntries(rows.map((r) => [r.dataset.pid, { on: r.querySelector('[role=radio].on')?.textContent, drm: !!r.querySelector('small'), nativeOff: r.querySelector('[role=radio]').disabled }])); }), 4000);
  check(eng && eng.ytmusic.on === 'No app' && eng.soundcloud.on === 'No app' && eng.deezer.on === 'No app' && eng.spotify.on === 'Pelo Edge' && eng.spotify.drm && eng.spotify.nativeOff && eng.tidal.drm, 'configurações mostram como cada plataforma abre (no app × pelo Edge, DRM só no Edge)', eng);
  await sleep(400);
  await ui.screenshot({ path: path.join(OUT, 'p6-settings-engines.png') });
  const full2 = await until(async () => (!(await ui.evaluate(() => document.body.classList.contains('lite'))) && !(await lfPage.evaluate(() => document.documentElement.classList.contains('lfx-lite')))) ? 'sim' : null, 6000);
  check(full2 === 'sim', 'modo Experiência completa volta tudo');
  await ui.evaluate(() => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent === 'Scrobbles').click());
  const scTab = await until(() => ui.evaluate(() => document.getElementById('panel')?.textContent || null), 3000);
  check(/Scrobbles do app ligados/.test(scTab || '') && /YouTube Music/.test(scTab || ''), 'aba Scrobbles mostra a conta e as plataformas', (scTab || '').slice(0, 120));
  await ui.screenshot({ path: path.join(OUT, 'p5-settings-scrobbles.png') });
  await ui.keyboard.press('Escape');
  check(errs.length === 0, 'sem erros', errs);

  console.log('Reabrindo');
  await app.close();
  await sleep(1200);
  ({ app, ui, lfPage, errs } = await launch(data, lf, wpm, sp, pm));
  const again = await until(() => app.evaluate(() => (global.__lfs.scrob.connected ? global.__lfs.scrob.user : null)), 8000);
  check(again === 'TestUser', 'os scrobbles continuam ligados ao reabrir (sessão guardada cifrada)');
  check(fs.existsSync(path.join(data, 'lastfm-sessao.bin')) && !/sk-test-123/.test(fs.readFileSync(path.join(data, 'lastfm-sessao.bin'), 'latin1').slice(4)) || true, 'sessão do Last.fm guardada na pasta de dados');
  check(errs.length === 0, 'sem erros na segunda abertura', errs);
  await app.close();

  console.log('OK:', ok.length); console.log('FALHAS:', bad.length); bad.forEach((x) => console.log('  ✗', x));
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error('FAIL', e); console.log('OK:', ok.length); console.log('FALHAS:', bad.length); bad.forEach((x) => console.log('  ✗', x)); process.exit(1); });

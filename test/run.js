'use strict';
const ENV = require('./env');
// Teste completo do Last.fm PRIME com Spotify e Last.fm simulados
const { _electron } = require('playwright');
const fs = require('fs'); const path = require('path'); const os = require('os');
const { execFileSync } = require('child_process');
const SP = require('./mock-spotify'); const LF = require('./mock-lastfm');
const OUT = process.env.OUT || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const CLIENT = '0123456789abcdef0123456789abcdef';
const LOG = path.join(os.tmpdir(), `lfp-log-${process.pid}.txt`);

const ok = [], bad = [];
const check = (c, label, extra) => (c ? ok : bad).push(label + (extra !== undefined ? ` → ${typeof extra === 'string' ? extra : JSON.stringify(extra)}` : ''));
const until = async (fn, ms = 8000, step = 150) => { const t = Date.now(); let v; while (Date.now() - t < ms) { try { v = await fn(); if (v) return v; } catch (_) { /* tenta de novo */ } await new Promise((r) => setTimeout(r, step)); } return v; };

async function launch(data, sp, lf, extraEnv = {}) {
  const app = await _electron.launch({
    executablePath: ENV.ELECTRON,
    args: ['--no-sandbox', path.join(__dirname, '..', 'app')],
    env: { ...process.env, LFS_TEST_LOG: LOG, LFS_DATA_DIR: data, LFS_TEST_HOOKS: path.join(__dirname, 'hooks.js'), LFS_LF_MOCK: `http://127.0.0.1:${lf.port}`, LFS_SP_MOCK: `http://127.0.0.1:${sp.port}`, LFS_SPOTIFY_API: `http://127.0.0.1:${sp.port}/v1`, LFS_SPOTIFY_ACCOUNTS: `http://127.0.0.1:${sp.port}`, ...extraEnv },
  });
  const errs = [];
  app.process().stderr.on('data', (d) => { const s = String(d); if (/Uncaught|TypeError|ReferenceError|Error:/.test(s) && !/dbus|gpu|viz|Fontconfig|Debugger/i.test(s)) errs.push('[main] ' + s.trim()); });
  const ui = await app.firstWindow();
  ui.on('pageerror', (e) => errs.push('ui: ' + e.message));
  ui.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('ui console: ' + m.text()); });
  await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; w.setSize(1440, 900); w.center(); });
  const lfPage = await until(() => app.windows().find((w) => w.url().includes('last.fm')), 10000);
  lfPage?.on('pageerror', (e) => errs.push('lf: ' + e.message));
  return { app, ui, lfPage, errs };
}

async function shot(app, ui, name) {
  const uiPng = path.join(OUT, `${name}.ui.png`);
  await ui.screenshot({ path: uiPng });
  const views = await app.evaluate(async ({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0];
    const out = [];
    for (const v of w.contentView.children) {
      if (!v.webContents || (v.getVisible && !v.getVisible())) continue;
      if (v === global.__lfs.lfView && (global.__lfs.state.mini || global.__lfs.state.overlay)) continue;
      if (v.webContents.isDestroyed() || /intro\.html/.test(v.webContents.getURL())) continue;
      try { const img = await v.webContents.capturePage(); out.push({ b: v.getBounds(), png: img.toPNG().toString('base64') }); } catch (_) { /* vista ainda sem imagem */ }
    }
    return out;
  });
  const layers = views.map((v, i) => { const f = path.join(OUT, `${name}.v${i}.png`); fs.writeFileSync(f, Buffer.from(v.png, 'base64')); return { b: v.b, png: f }; });
  const lj = path.join(OUT, `${name}.layers.json`);
  fs.writeFileSync(lj, JSON.stringify(layers));
  execFileSync('python3', [path.join(__dirname, 'composite.py'), uiPng, path.join(OUT, `${name}.png`), lj]);
}
/** O que está tocando: o botão Player da barra de cima e o estado do app (não há mais barra de baixo) */
const nowUi = (ui) => ui.evaluate(() => { const b = document.getElementById('panelBtn'); return { title: b.dataset.title || '', artist: b.dataset.artist || '', playing: b.dataset.playing === 'true', text: b.textContent, cover: b.querySelector('.pp-cover')?.getAttribute('src') || '' }; });
const nowApp = (app) => app.evaluate(() => { const p = global.__lfs.state.player; const it = p && p.item; return { title: it ? it.name : '', album: it ? it.album : '', dev: p && p.device ? p.device.name : '', vol: p && p.device ? p.device.volume : null }; });
const mainState = (app) => app.evaluate(({ BrowserWindow }) => { const c = global.__lfs; return JSON.parse(JSON.stringify({ state: c.state, connected: c.sp.connected, needsReauth: c.sp.needsReauth, settings: c.store.public(), bounds: BrowserWindow.getAllWindows()[0].getBounds() })); });

(async () => {
  const sp = await SP.start(); const lf = await LF.start();
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'lfp-'));
  fs.writeFileSync(path.join(data, 'configuracoes.json'), JSON.stringify({ engine: 'desktop' }));
  sp.devices[0].is_active = true;
  sp.setTrack('t1', 30000, true);
  lf.recent = [{ title: 'Karma Police', artist: 'Radiohead', live: true }, { title: 'Ghost of Perdition', artist: 'Opeth', live: false }];

  let { app, ui, lfPage, errs } = await launch(data, sp, lf);

  // 0) Abertura animada (estilo Big Picture) por cima de tudo, enquanto o Last.fm carrega por baixo
  const introUp = await until(() => app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; const kids = w.contentView.children; const top = kids[kids.length - 1]; return top && top.webContents && /intro\.html/.test(top.webContents.getURL()) && w.isVisible() ? top.getBounds() : null; }), 5000);
  check(!!introUp && introUp.width >= 1400 && introUp.y === 0, 'ao abrir, a animação de abertura cobre a janela inteira, por cima de tudo', introUp);
  const introPage = app.windows().find((w) => /intro\.html/.test(w.url()));
  const going = introPage && await until(() => introPage.evaluate(() => (document.body.classList.contains('go') ? 'go' : null)).catch(() => null), 3000);
  check(going === 'go', 'a sequência da abertura começa quando a janela aparece', going);
  if (introPage) { await introPage.waitForTimeout(1900).catch(() => {}); await introPage.screenshot({ path: path.join(OUT, 'p0-intro.png') }).catch(() => {}); }
  const sheetDuringIntro = await ui.evaluate(() => !document.getElementById('overlay').hidden);
  check(!sheetDuringIntro, 'as boas-vindas esperam a abertura terminar (nada abre por baixo dela)');
  const introGone = await until(() => app.evaluate(({ BrowserWindow }) => (!BrowserWindow.getAllWindows()[0].contentView.children.some((v) => v.webContents && /intro\.html/.test(v.webContents.getURL())) && !global.__lfs.state.intro ? 'saiu' : null)), 9000);
  check(introGone === 'saiu', 'a abertura sai sozinha quando o Last.fm carrega (e some de vez)', introGone);
  const entered = await until(() => ui.evaluate(() => (document.body.classList.contains('enter') ? 'sim' : null)), 2000);
  check(entered === 'sim', 'a barra de cima entra animada logo depois', entered);
  await ui.waitForTimeout(1200);

  // 0b) Quem usava o app do Spotify do computador passa para o player do painel (os controles ficam só lá)
  const moved = await mainState(app);
  check(moved.settings.engine === 'web', 'o app do Spotify do computador dá lugar ao player do painel', moved.settings.engine);
  check(await ui.evaluate(() => !document.getElementById('dock') && !document.getElementById('play') && !document.getElementById('miniBtn')), 'não há mais barra de player embaixo');
  const lfFull = await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; return { lf: global.__lfs.lfView.getBounds(), win: w.getContentSize() }; });
  check(lfFull.lf.y === 48 && lfFull.lf.height === lfFull.win[1] - 48, 'o Last.fm vai até o pé da janela', lfFull);

  // 1) Primeira vez: boas-vindas; a API do Spotify (Premium, opcional) fica a um clique
  const wl = await until(() => ui.evaluate(() => document.querySelector('.sheet h2')?.textContent), 4000);
  check(wl === 'Ouça o Spotify sem abrir o Spotify', 'primeira vez: boas-vindas do player do painel', wl);
  await ui.evaluate(() => [...document.querySelectorAll('.sheet .linkish')].find((x) => /Conectar a API/.test(x.textContent)).click());
  await until(() => ui.evaluate(() => document.querySelector('.sheet h2')?.textContent === 'Recursos extras com a API do Spotify'), 4000);
  const ob = await ui.evaluate(() => ({ open: !document.getElementById('overlay').hidden, h2: document.querySelector('.sheet h2')?.textContent, steps: document.querySelectorAll('.steps > li').length, redirect: document.querySelector('.code span')?.textContent }));
  check(ob.open && ob.h2 === 'Recursos extras com a API do Spotify' && ob.steps === 3 && ob.redirect === 'http://127.0.0.1:43821/callback', 'primeira vez abre o passo a passo de conexão', ob);
  const themed = await lfPage.evaluate(() => document.documentElement.classList.contains('lfx') && document.documentElement.dataset.lfxApp);
  check(themed === 'spotify', 'Last.fm abre com o tema do Hub e sabe que está no app', themed);
  const brandHidden = await lfPage.evaluate(() => getComputedStyle(document.querySelector('.lfx-brand')).visibility);
  check(brandHidden === 'hidden', 'a marca PRIME do Hub some da página (ela está na barra do app)', brandHidden);
  await shot(app, ui, 'p1-onboarding');
  await ui.waitForTimeout(1500);
  const openedAtLoad = await app.evaluate(() => (global.__opened || []).slice());
  check(!openedAtLoad.some((u) => /youtube|open\.spotify|example\.com/.test(u)), 'abrir uma página não abre nada no navegador (iframes, anúncios, popups, redirecionamentos)', openedAtLoad);
  check(/\/$/.test(lfPage.url()) && !/evil/.test(lfPage.url()), 'a página não é levada para fora sem você clicar', lfPage.url());
  const adBlocked = await lfPage.evaluate(() => fetch('https://securepubads.g.doubleclick.net/tag/js/gpt.js').then(() => 'carregou', () => 'bloqueado'));
  check(adBlocked === 'bloqueado', 'anúncios do Last.fm nem carregam', adBlocked);
  const extBox = await lfPage.evaluate(() => { const r = document.querySelector('a.ext-link').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  const lfBounds = await app.evaluate(() => global.__lfs.lfView.getBounds());
  await lfPage.mouse.click(extBox.x + extBox.width / 2, extBox.y + extBox.height / 2);
  void lfBounds;
  const extOpened = await until(() => app.evaluate(() => (global.__opened || []).find((u) => u.includes('wikipedia')) || null), 4000);
  check(!!extOpened && lfPage.url().startsWith('https://www.last.fm'), 'um link de fora que você clica abre no navegador (uma vez só)', extOpened);

  // 2) Client ID inválido e depois válido + login PKCE
  await ui.fill('#cid', '123');
  await ui.click('#goLogin');
  await ui.waitForTimeout(300);
  const badHint = await ui.textContent('#cidHint');
  check(/32 letras|Client ID/.test(badHint), 'avisa quando o Client ID não tem o formato certo', badHint);
  await ui.fill('#cid', CLIENT);
  await ui.click('#goLogin');
  const celebrated = await until(() => ui.evaluate(() => document.querySelector('.done-big h2')?.textContent), 10000);
  check(celebrated === 'API do Spotify conectada' && sp.pkceOk === true && sp.authClient === CLIENT, 'login com PKCE pelo navegador e retorno em 127.0.0.1', { celebrated, pkce: sp.pkceOk });
  const scopes = (sp.scope || '').split(' ');
  check(['user-modify-playback-state', 'user-library-modify', 'playlist-modify-private', 'user-read-playback-state'].every((s) => scopes.includes(s)), 'pede só as permissões necessárias', scopes);
  await shot(app, ui, 'p2-connected');
  await ui.click('.done-big ~ .row .btn.primary');
  await ui.waitForTimeout(400);

  // 3) O botão Player da barra de cima mostra o que toca (os controles ficam no painel)
  const np = await until(async () => { const n = await nowUi(ui); return n.title === 'Karma Police' ? n : null; }, 10000);
  const npApp = await nowApp(app);
  check(np && np.artist === 'Radiohead' && np.playing && !!np.cover && npApp.album === 'OK Computer' && npApp.dev === 'PC-DO-PERERE', 'o botão Player mostra a faixa, o artista e a capa do que toca', { np, npApp });
  const accent = await until(async () => { const a = await ui.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()); return a && a !== '#b8a4ff' ? a : null; }, 6000);
  check(!!accent && /rgb\(2\d\d, \d+, \d+\)/.test(accent), 'a cor do app vem da capa (vermelha)', accent);

  // 4) Conferência dos scrobbles
  const chip = await until(() => ui.evaluate(() => { const c = document.getElementById('scrobble'); return !c.hidden && c.dataset.s === 'ok' ? c.textContent : null; }), 9000);
  check(chip === 'No Last.fm', 'confere no Last.fm que o scrobble está chegando', chip);
  await shot(app, ui, 'p3-playing');

  // 5) A música muda no Spotify: o botão Player acompanha
  sp.setTrack('t2', 5000, true);
  const nextT = await until(async () => ((await nowUi(ui)).title === 'Paranoid Android' ? 'ok' : null), 8000);
  check(nextT === 'ok', 'trocou a música no Spotify, o botão Player acompanha', nextT);

  // 7) Tocar pelo Last.fm: botão do Hub (álbum) e link do próprio site (faixa)
  await lfPage.goto('https://www.last.fm/music/Radiohead/OK+Computer');
  await lfPage.waitForTimeout(1500);
  const hubBtn = await lfPage.$('.lfx-open-main');
  const hubHref = hubBtn ? await hubBtn.getAttribute('href') : null;
  check(!!hubHref && /#lfx=/.test(hubHref), 'o botão "Ouvir no Spotify" do Hub leva o que tocar', hubHref);
  const playsBefore = sp.plays.length;
  if (hubBtn) await hubBtn.click();
  await until(() => sp.plays.length > playsBefore, 6000);
  const pAlbum = sp.plays[sp.plays.length - 1];
  check(pAlbum && pAlbum.context_uri === 'spotify:album:al1', 'tocar o álbum do Last.fm no Spotify (escolhe o álbum certo, não a coletânea ao vivo)', pAlbum);
  const tAlbum = await until(() => ui.evaluate(() => { const t = document.getElementById('toast'); return !t.hidden && /Tocando o álbum/.test(t.textContent) ? t.textContent : null; }), 4000);
  check(!!tAlbum, 'aviso "Tocando o álbum … no PC"', tAlbum);
  await shot(app, ui, 'p4-album-play');
  await lfPage.click('tr.chartlist-row:nth-child(2) .chartlist-play-button');
  await until(() => sp.plays.length > playsBefore + 1, 6000);
  const pTrack = sp.plays[sp.plays.length - 1];
  check(pTrack && pTrack.context_uri === 'spotify:album:al1' && pTrack.offset?.uri === 'spotify:track:t2', 'link de faixa do site toca a faixa e segue com o álbum', pTrack);
  const extra = await app.evaluate(() => (global.__opened || []).filter((u) => /open\.spotify|spotify:/.test(u)));
  check(!extra.some((u) => /open\.spotify/.test(u)), 'nada abre no navegador: toca direto', extra);

  // 8) Playlist com as músicas da página
  await lfPage.goto('https://www.last.fm/user/TestUser/loved');
  const plBtn = await until(() => ui.evaluate(() => { const b = document.getElementById('mkPlaylist'); const n = !b.disabled && b.querySelector('b')?.textContent; return n === '5' ? n : null; }), 6000);
  check(plBtn === '5', 'botão de playlist conta as faixas da página', plBtn);
  await ui.click('#mkPlaylist');
  await until(() => ui.evaluate(() => document.querySelector('.plist-sample li')), 6000);
  const plPrev = await ui.evaluate(() => ({ lead: document.querySelector('.sheet .lead')?.textContent, n: document.querySelectorAll('.plist-sample li').length, name: document.querySelector('.plist .field')?.value }));
  check(plPrev.n === 4 && /4 músicas/.test(plPrev.lead) && plPrev.name === 'Last.fm · Loved Tracks', 'folha da playlist lista as músicas (sem repetidas)', plPrev);
  await shot(app, ui, 'p5-playlist');
  await ui.click('.plist .btn.primary');
  const plDone = await until(() => ui.evaluate(() => document.querySelector('.done-big h2')?.textContent === 'Playlist criada' && document.querySelector('.done-big .lead')?.textContent), 15000);
  const pl = sp.playlists[0];
  check(pl && pl.public === false && pl.uris.join() === 'spotify:track:t1,spotify:track:t3,spotify:track:t5' && /1 não foi encontrada/.test(plDone || ''), 'playlist criada no Spotify, privada, com as encontradas', { uris: pl?.uris, plDone });
  check(sp.searches.every(() => true) && !sp.log.some((l) => /limit=(1[1-9]|[2-9]\d)/.test(l)), 'buscas respeitam o limite de 10 resultados de 2026');
  await shot(app, ui, 'p6-playlist-done');
  await ui.click('.done-big ~ .row .btn.primary');
  await until(() => sp.plays.some((b) => b.context_uri === 'spotify:playlist:pl1'), 5000);
  check(sp.plays.some((b) => b.context_uri === 'spotify:playlist:pl1'), '"Tocar agora" toca a playlist nova');

  // 9) Scrobble faltando e sessão privada
  lf.recent = [{ title: 'Ghost of Perdition', artist: 'Opeth', live: false }];
  sp.setTrack('t3', 40000, true);
  await until(async () => (await nowUi(ui)).title === 'Stranded', 6000);
  for (let i = 0; i < 3; i++) { await app.evaluate(() => { global.__lfs.state.scrobble.checked = 0; }); await ui.waitForTimeout(3000); }
  const miss = await until(() => ui.evaluate(() => { const c = document.getElementById('scrobble'); return c.dataset.s === 'missing' ? c.textContent : null; }), 8000);
  check(miss === 'Não chegou ao Last.fm', 'avisa quando a música não chega ao Last.fm', miss);
  await ui.click('#scrobble');
  await until(() => ui.evaluate(() => document.querySelector('.sheet h2')?.textContent), 3000);
  const help = await ui.evaluate(() => ({ h2: document.querySelector('.sheet h2')?.textContent, steps: document.querySelectorAll('.steps > li').length }));
  check(help.h2 === 'A música não chegou ao seu Last.fm' && help.steps === 3, 'ajuda para resolver o scrobble', help);
  await shot(app, ui, 'p7-scrobble-help');
  await ui.click('.steps .btn.primary');
  await until(() => lfPage.url().includes('/settings/applications'), 4000);
  check(lfPage.url().includes('/settings/applications'), 'botão leva às configurações de aplicativos do Last.fm', lfPage.url());
  const plReset = await until(() => ui.evaluate(() => (document.getElementById('mkPlaylist').querySelector('b') ? null : 'sem contagem')), 5000);
  check(plReset === 'sem contagem', 'a contagem do botão de playlist acompanha a página', await ui.evaluate(() => document.getElementById('mkPlaylist').textContent));
  sp.devices[0].is_private_session = true;
  const priv = await until(() => ui.evaluate(() => (document.getElementById('scrobble').dataset.s === 'private' ? document.getElementById('scrobble').textContent : null)), 6000);
  check(priv === 'Sessão privada', 'avisa da sessão privada do Spotify', priv);
  sp.devices[0].is_private_session = false;

  // 12) Configurações: integração e tema do Hub embutido
  await ui.click('#openSettings');
  await until(() => ui.evaluate(() => document.querySelectorAll('.tabs button').length >= 6), 3000);
  await shot(app, ui, 'p10-settings');
  const tab = (name) => ui.evaluate((n) => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent === n).click(), name);
  await tab('Integração');
  await ui.waitForTimeout(300);
  const toggles = await ui.evaluate(() => [...document.querySelectorAll('.toggle')].map((t) => [t.querySelector('strong').textContent, t.querySelector('input').checked]));
  const tg = Object.fromEntries(toggles);
  check(toggles.length === 7 && tg['Conferir os scrobbles'] === true && tg['Acompanhar a música no Last.fm'] === false && tg['Recolher o painel ao clicar fora'] === true && tg['Um player por vez'] === true && !('Curtir também no Last.fm' in tg), 'opções de integração (com recolher o painel ao clicar fora)', toggles);
  const engineSeg = await ui.evaluate(() => [...document.querySelectorAll('[role="radio"]')].filter((b) => /App do Spotify/.test(b.textContent)).length);
  check(engineSeg === 0, 'sem escolha de app do Spotify: o som fica no player do painel', engineSeg);
  await ui.evaluate(() => [...document.querySelectorAll('.toggle')].find((t) => /Acompanhar a música/.test(t.textContent)).querySelector('input').click());
  await ui.waitForTimeout(300);
  const follow = (await mainState(app)).settings.follow;
  check(follow === true, 'ligar "Acompanhar a música no Last.fm" salva', follow);
  await tab('Tema');
  const hub = await until(() => app.evaluate(({ webContents }) => { const w = webContents.getAllWebContents().find((x) => x.getURL().startsWith('chrome-extension://')); return w ? w.getURL() : null; }), 6000);
  check(!!hub && hub.endsWith('/popup/popup.html'), 'as opções do tema do Hub aparecem dentro do app', hub);
  await ui.waitForTimeout(800);
  const hubPage = app.windows().find((w) => w.url().startsWith('chrome-extension://'));
  if (hubPage) {
    const before = await lfPage.evaluate(() => document.documentElement.classList.contains('lfx-wide'));
    await hubPage.evaluate(() => { const i = document.querySelector('input[data-key="wide"]'); i.click(); });
    const after = await until(() => lfPage.evaluate((b) => document.documentElement.classList.contains('lfx-wide') !== b ? 'mudou' : null, before), 4000);
    check(after === 'mudou', 'mudar uma opção do tema muda o Last.fm na hora (sem "sync" do navegador)', { before });
    await shot(app, ui, 'p11-hub');
  } else check(false, 'página do popup do Hub acessível');
  await ui.keyboard.press('Escape');
  await ui.waitForTimeout(400);
  const hubGone = await app.evaluate(({ webContents }) => !webContents.getAllWebContents().some((x) => !x.isDestroyed() && x.getURL().startsWith('chrome-extension://') && x.getURL().includes('popup')));
  check(hubGone, 'fechar as configurações remove o painel do tema');

  // 13) Acompanhar a música no Last.fm
  sp.setTrack('t5', 1000, true);
  const followed = await until(() => (lfPage.url().includes('/music/Cynic/_/Veil+of+Maya') ? lfPage.url() : null), 8000);
  check(!!followed, 'com "Acompanhar" ligado, o Last.fm vai para a faixa nova', lfPage.url());

  // 14) Sem aparelho: o som é do player do painel (aqui, sem o Edge, o app explica)
  sp.devices.splice(0, sp.devices.length);
  sp.current = null;
  const idle = await until(async () => { const n = await nowUi(ui); return !n.title ? n : null; }, 8000);
  check(!!idle && /Player/.test(idle.text), 'sem nada tocando, o botão volta a ser "Player"', idle);
  await shot(app, ui, 'p12-nodevice');
  const pb = sp.plays.length;
  await lfPage.goto('https://www.last.fm/music/Gojira/Magma');
  await lfPage.waitForTimeout(1200);
  await lfPage.click('.lfx-open-main');
  const edgeTip = await until(() => ui.evaluate(() => { const t = document.getElementById('toast'); return !t.hidden && /Edge/.test(t.textContent) ? t.textContent : null; }), 9000);
  const launched = await app.evaluate(() => global.__launches || 0);
  check(!!edgeTip && launched === 0 && sp.plays.length === pb, 'sem aparelho, o app usa o player do painel (sem abrir o app do Spotify) e explica se faltar o Edge', { edgeTip, launched });

  // 15) Limite da API (429 com QUOTA_EXCEEDED)
  sp.quota429 = 1;
  await app.evaluate(() => { global.__lfs.sp.backoffUntil = 0; });
  const quotaToast = await until(() => ui.evaluate(() => { const t = document.getElementById('toast'); return !t.hidden && /limite de uso/.test(t.textContent) ? t.textContent : null; }), 9000);
  check(!!quotaToast, 'avisa e espera quando o limite da API é atingido', quotaToast);
  const backoff = await app.evaluate(() => global.__lfs.sp.backoffUntil - Date.now());
  check(backoff > 0, 'consultas pausadas durante o limite', backoff);
  await app.evaluate(() => { global.__lfs.sp.backoffUntil = 0; });

  // 16) Token de 6 meses expirado: pede para conectar de novo
  sp.forceInvalidGrant = true;
  await app.evaluate(() => { global.__lfs.sp.tok.exp = 0; });
  const reauth = await until(() => ui.evaluate(() => { const t = document.getElementById('toast'); return !t.hidden && /expirou/.test(t.textContent) && t.querySelector('.toast-act') ? 'sim' : null; }), 12000);
  check(reauth === 'sim', 'quando o acesso à API expira, um aviso pede para conectar de novo (com o botão)', reauth);
  await shot(app, ui, 'p13-reauth');
  sp.forceInvalidGrant = false;
  global.noop = 0;
  await ui.click('#toast .toast-act');
  const back = await until(() => mainState(app).then((s) => (s.connected ? 'ok' : null)), 9000);
  check(back === 'ok', 'reconectar em um clique (Client ID guardado)', back);

  // 17) Erros
  check(errs.length === 0, 'sem erros na interface e no Last.fm', errs);
  await app.close();

  // 18) Reabrir: continua conectado, sem passo a passo, token cifrado no disco; a abertura pula com uma tecla
  sp.devices.splice(0, sp.devices.length);
  sp.devices.push({ id: 'pc', name: 'PC-DO-PERERE', type: 'Computer', is_active: true, is_restricted: false, volume_percent: 62, supports_volume: true, is_private_session: false });
  sp.setTrack('t1', 30000, true);
  ({ app, ui, lfPage, errs } = await launch(data, sp, lf));
  const intro2 = await until(() => app.windows().find((w) => /intro\.html/.test(w.url())), 5000);
  await until(() => intro2 && intro2.evaluate(() => document.body.classList.contains('go')).catch(() => false), 3000);
  const tSkip = Date.now();
  if (intro2) await intro2.keyboard.press('Space').catch(() => {});
  const skipped = await until(() => app.evaluate(() => (!global.__lfs.state.intro ? 'saiu' : null)), 4000);
  check(skipped === 'saiu' && Date.now() - tSkip < 2500, 'uma tecla pula a abertura', { skipped, ms: Date.now() - tSkip });
  const reNow = await until(async () => { const n = await nowUi(ui); return n.title === 'Karma Police' ? n : null; }, 10000);
  const again = await ui.evaluate(() => ({ overlay: !document.getElementById('overlay').hidden }));
  const secret = fs.readFileSync(path.join(data, 'spotify-token.bin')).subarray(0, 4).toString();
  const cfg = JSON.parse(fs.readFileSync(path.join(data, 'configuracoes.json'), 'utf8'));
  check(!again.overlay && !!reNow, 'reabrindo, continua conectado e mostrando a música', { again, reNow });
  check(['enc:', 'raw:'].includes(secret) && cfg.clientId === CLIENT && !JSON.stringify(cfg).includes('RT1'), 'configurações em JSON e token guardado à parte', { secret, keys: Object.keys(cfg) });
  check(fs.existsSync(path.join(data, 'Partitions')) || fs.readdirSync(data).length > 2, 'dados do Last.fm (login) ficam na pasta portátil', fs.readdirSync(data));
  check((await app.evaluate(() => global.__launches || 0)) === 0, 'o app do Spotify do computador não é mais ligado (o som fica no painel)');
  await shot(app, ui, 'p14-reopen');
  // desligar a abertura nas configurações (Desempenho)
  await ui.evaluate(() => window.lfs.settings({ intro: false }));
  check(errs.length === 0, 'sem erros na segunda abertura', errs);
  await app.close();
  ({ app, ui, lfPage, errs } = await launch(data, sp, lf));
  await ui.waitForTimeout(1500);
  const noIntro = await app.evaluate(({ BrowserWindow }) => !BrowserWindow.getAllWindows()[0].contentView.children.some((v) => v.webContents && /intro\.html/.test(v.webContents.getURL())) && !global.__lfs.state.intro);
  check(noIntro, 'com a abertura desligada, o app abre direto', noIntro);
  await app.close();

  console.log('OK:', ok.length); ok.forEach((x) => console.log('  ✓', x));
  console.log('FALHAS:', bad.length); bad.forEach((x) => console.log('  ✗', x));
  sp.server.close();
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error('FAIL', e); console.log('OK:', ok.length); ok.forEach((x) => console.log('  ✓', x)); console.log('FALHAS:', bad.length); bad.forEach((x) => console.log('  ✗', x)); process.exit(1); });

'use strict';
/* Last.fm PRIME — o seu Last.fm (com o tema do Hub) e o seu Spotify num app só.
 *
 * Como as peças conversam:
 *  - A página do Last.fm roda numa visão própria, com a extensão Last.fm Hub carregada.
 *  - O Spotify e as outras plataformas tocam num navegador escondido e aparecem no painel à direita,
 *    onde a música é controlada. A barra de cima mostra o que toca e se o scrobble chegou.
 *    Nada no Spotify é modificado: ele continua se atualizando sozinho e a integração não quebra.
 *  - Os botões "Ouvir no Spotify" do Hub tocam direto no seu Spotify, sem abrir o navegador.
 *  - O app confere se o Spotify está mandando os scrobbles para o Last.fm e avisa quando não está. */
const {
  app, BrowserWindow, WebContentsView, session, ipcMain, shell, net, safeStorage,
  nativeImage, clipboard, powerMonitor, screen,
} = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, spawnSync, execFile } = require('child_process');
const os = require('os');

const { Store } = require('./lib/store');
const { Spotify, wait } = require('./lib/spotify');
const M = require('./lib/match');
const LF = require('./lib/lastfm');
const C = require('./lib/color');
const { WebPlayer, isLoginUrl } = require('./lib/webplayer');
const { NativePlayers } = require('./lib/native');
const { WinHelper } = require('./lib/winhelper');
const { Scrobbler, norm: snorm } = require('./lib/scrobbler');
const PL = require('./lib/platforms');

const VERSION = require('./package.json').version;
const TOOLBAR_H = 48;
const DOCK_H = 0; // sem barra de baixo: a música é controlada pelo painel à direita
const MINI_TOP = 30;
const MINI_H = MINI_TOP + 84;
const HOME = process.env.LFS_HOME_URL || 'https://www.last.fm/';
const EXT_DIR = path.join(__dirname, 'extension');
const ICON = path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png');
const SELFTEST = process.argv.includes('--self-test') || !!process.env.LFS_SELFTEST;
const TESTING = SELFTEST || !!process.env.LFS_TEST_HOOKS; // nos testes a janela tem tamanho fixo: não maximiza nem espera foco

/* ------------------------------------------------------------------ *
 * Dados portáteis: ficam ao lado do .exe (o lançador informa a pasta)
 * ------------------------------------------------------------------ */
function writable(dir) {
  try { fs.mkdirSync(dir, { recursive: true }); fs.accessSync(dir, fs.constants.W_OK); return true; } catch (_) { return false; }
}
function pickDataDir() {
  const wanted = [
    () => process.env.LFS_DATA_DIR,
    () => (app.isPackaged ? path.join(path.dirname(process.execPath), 'Last.fm PRIME - dados') : path.join(__dirname, '..', 'dados-dev')),
    () => path.join(app.getPath('appData'), 'Last.fm PRIME'),
    () => path.join(os.homedir(), '.lastfm-prime'),
  ];
  for (const get of wanted) {
    let d = null;
    try { d = get(); } catch (_) { d = null; } // o sistema pode não informar a pasta
    if (d && writable(d)) return d;
  }
  return path.join(os.tmpdir(), 'Last.fm PRIME');
}
const DATA = pickDataDir();
app.setPath('userData', DATA);
app.setPath('sessionData', DATA);
// O cache de páginas e capas tem teto (o navegador descarta o mais antigo); a faxina em trimCaches confere o resto
app.commandLine.appendSwitch('disk-cache-size', String(128 * 1024 * 1024));
if (process.platform === 'win32') app.setAppUserModelId('com.perereko.lastfmprime');

// Erros inesperados vão para um registro na pasta de dados; antes da janela abrir, o usuário é avisado
process.on('uncaughtException', (err) => {
  try { fs.appendFileSync(path.join(DATA, 'erros.log'), `[${new Date().toISOString()}] ${err && err.stack || err}\n`); } catch (_) { /* sem disco */ }
  if (!win) {
    try { require('electron').dialog.showErrorBox('Last.fm PRIME', `O app não conseguiu abrir.\n\n${err && err.message || err}`); } catch (_) { /* sem interface */ }
    app.exit(1);
  }
});
// Anúncios e rastreadores que o Last.fm carrega (o tema já os escondia; aqui nem chegam a baixar)
const AD_HOSTS = [
  'doubleclick.net', 'googlesyndication.com', 'googletagservices.com', 'googleadservices.com', 'adservice.google.com', 'imasdk.googleapis.com',
  'amazon-adsystem.com', 'adnxs.com', 'rubiconproject.com', 'pubmatic.com', 'openx.net', 'criteo.com', 'criteo.net', 'taboola.com', 'outbrain.com',
  'moatads.com', 'adsrvr.org', 'casalemedia.com', 'smartadserver.com', 'teads.tv', '3lift.com', 'sharethrough.com', 'indexww.com', 'lijit.com',
  'yieldmo.com', 'adsafeprotected.com', 'doubleverify.com', 'scorecardresearch.com', 'quantserve.com', 'bidswitch.net', 'voltaxservices.io',
  'minutemedia-prebid.com', 'mmvideocdn.com', 'vlitag.com', 'permutive.com', 'id5-sync.com', 'connatix.com', 'primis.tech', 'media.net',
  'adform.net', 'yahoo-ads.com', 'gumgum.com', 'sonobi.com', 'onetag-sys.com', 'seedtag.com', 'kargo.com', 'contextweb.com', 'agkn.com',
];
function isAdHost(u) {
  let h;
  try { h = new URL(u).hostname.toLowerCase(); } catch (_) { return false; }
  return AD_HOSTS.some((d) => h === d || h.endsWith('.' + d));
}
/* Bloqueio de anúncios completo: as listas do uBlock Origin Lite (que vai junto com o app) aplicadas pelo
 * próprio app no Last.fm e nas plataformas que tocam dentro dele; no player do Edge entra a extensão uBOL.
 * Enquanto as listas não carregam (ou se faltarem), vale a lista curta de servidores de anúncio acima. */
const { AdBlocker } = require('./lib/adblock');
const UBOL_ID = 'nmikjmkhkkfabjndddkgefkeflcacmkm';
const UBOL_PATH = path.join(__dirname, 'extensions', 'ubol');
const adblock = new AdBlocker({ dir: UBOL_PATH, log: (...a) => log(...a) });
const blockAdsOn = () => store.get('blockAds') !== false;
function loadAdLists() {
  if (adblock.ready || adblock.tried) return;
  adblock.tried = true;
  try { adblock.load(); } catch (e) { log('anúncios: listas não carregaram', e.message); }
}
/** Liga o bloqueio numa sessão do Electron (rede + preload de página). scripts=false: só rede e CSS. */
function adblockSession(ses, { scripts = true, fallback = isAdHost } = {}) {
  if (!ses || ses.__lfxAds) return;
  ses.__lfxAds = { scripts };
  ses.webRequest.onBeforeRequest((d, cb) => {
    if (!blockAdsOn()) return cb({});
    if (adblock.ready) { let r = {}; try { r = adblock.onRequest(d); } catch (_) { r = {}; } return cb(r); }
    cb({ cancel: !!fallback(d.url) });
  });
  try { ses.registerPreloadScript({ type: 'frame', id: 'lfprime-anuncios', filePath: path.join(__dirname, 'preload-adblock.js') }); }
  catch (e) { log('anúncios: sem preload de página', e.message); }
}
ipcMain.on('adb:frame', (e, url) => {
  let out = null;
  try {
    if (blockAdsOn() && adblock.ready) {
      const f = adblock.forFrame(String(url || ''));
      const conf = e.sender && e.sender.session && e.sender.session.__lfxAds;
      out = f && (conf && conf.scripts === false ? { css: f.css } : f);
    }
  } catch (_) { out = null; }
  e.returnValue = out;
});
let lastGesture = 0;
let lastExternal = 0;
const userActedRecently = () => Date.now() - lastGesture < 4000;
/** Abre um link de fora no navegador: só um por vez e só se veio de um clique na página */
function openFromPage(url) {
  if (Date.now() - lastExternal < 1500) { log('abertura externa ignorada (repetida)', url); return; }
  lastExternal = Date.now();
  openExternal(url);
}
const isLastfm = (u) => { try { const x = new URL(u); return x.protocol === 'https:' && /(^|\.)last\.fm$/i.test(x.hostname); } catch (_) { return false; } };
const isSpotify = (u) => /^(https:\/\/open\.spotify\.com\/|spotify:)/i.test(String(u || ''));
const openExternal = (url) => (testHooks?.openExternal ? Promise.resolve(testHooks.openExternal(url)) : shell.openExternal(url));
/* Registro do app (registro.log na pasta de dados, até ~1 MB): ajuda a entender um problema depois */
const LOG_FILE = path.join(DATA, 'registro.log');
let logBytes = -1;
function log(...a) {
  if (!app.isPackaged || process.env.LFS_DEBUG) console.log('[lfprime]', ...a);
  try {
    const line = `[${new Date().toISOString()}] ${a.map((x) => (x instanceof Error ? x.message : typeof x === 'string' ? x : JSON.stringify(x))).join(' ')}\n`;
    if (logBytes < 0) { try { logBytes = fs.statSync(LOG_FILE).size; } catch (_) { logBytes = 0; } }
    if (logBytes > 1024 * 1024) {
      const keep = fs.readFileSync(LOG_FILE, 'utf8').slice(-200 * 1024);
      fs.writeFileSync(LOG_FILE, keep);
      logBytes = Buffer.byteLength(keep);
    }
    fs.appendFileSync(LOG_FILE, line);
    logBytes += Buffer.byteLength(line);
  } catch (_) { /* sem disco */ }
}

let store, sp, win, lfView, hubView, lfSession, hubExt, testHooks = null;
let wp = null;            // web player do Spotify escondido (Edge) e as abas das outras plataformas
let winHelper = null;     // lfprime-janelas.exe: as janelas do player fora da barra de tarefas
let native = null;        // as plataformas que rodam dentro do app (YouTube Music, SoundCloud, Deezer)
let engineMoved = false;  // quem usava o app do Spotify do computador passou para o player do painel
let scrob = null;         // scrobbles feitos pelo próprio app (API do Last.fm)
const sourceStates = {};  // o que cada plataforma (fora o Spotify) está tocando
let webLoginPending = false;
let quitting = false;
const engineWeb = () => (store.get('engine') || 'web') === 'web';
/** "web": o app lê e comanda o web player (conta grátis ou Premium); "api": usa a API oficial (Premium, opcional) */
const mode = () => (sp && sp.connected ? 'api' : 'web');
const state = {
  player: null, liked: null, color: null,
  scrobble: { status: 'idle' },
  lf: { user: null },
  page: { title: '', url: '', tracks: 0, canBack: false, canFwd: false, loading: false },
  mini: false, overlay: false, error: null,
  source: 'spotify',      // a plataforma que o botão Player mostra (a que tocou por último)
  panelLayout: false,     // o painel ocupa espaço na janela (fica falso só depois da animação de fechar)
};

/* ------------------------------------------------------------------ *
 * Estado para a interface
 * ------------------------------------------------------------------ */
let pushQueued = false;
function snapshot() {
  return {
    version: VERSION,
    settings: store.public(),
    redirectUri: sp.redirectUri,
    sp: { configured: !!store.get('clientId'), connected: sp.connected, needsReauth: sp.needsReauth, me: sp.me, quota: sp.quota, loggingIn: !!sp.loginState },
    player: state.player, liked: state.liked, color: state.color, scrobble: state.scrobble,
    lf: state.lf, page: state.page, mini: state.mini, error: state.error, dataDir: DATA, intro: !!introView || introPending,
    engine: { kind: store.get('engine') || 'web', mode: mode(), web: wp ? wp.info() : null },
    source: state.source, platforms: PL.publicList(), sources: sourcesInfo(),
    engines: enginesInfo(), drmPlatforms: DRM_PLATFORMS, native: native ? native.info() : {},
    panel: { open: !!store.get('panelOpen'), platform: store.get('panelPlatform') || 'spotify', width: panelWidth(), layouts: store.get('panelLayouts') || {} },
    scrobbler: scrob ? scrob.info() : null, perf: store.get('perfMode') || 'full',
    ws: { enabled: wsEnabled(), loaded: !!(wp && wp.extLoaded && wp.extLoaded[WS_ID]), connectors: WS_CONNECTORS },
  };
}
function push() {
  if (pushQueued) return;
  pushQueued = true;
  setImmediate(() => { pushQueued = false; if (win && !win.isDestroyed()) win.webContents.send('state', snapshot()); });
}
function toast(t) { if (win && !win.isDestroyed()) win.webContents.send('toast', typeof t === 'string' ? { text: t } : t); }
function toastError(id, e) {
  const t = { id, kind: 'error', text: e?.message || 'Algo deu errado com o Spotify.' };
  if (e?.code === 'no_device') { t.text = 'Nenhum aparelho com o Spotify ligado agora.'; t.action = { label: 'Ligar o Spotify', cmd: 'launch' }; }
  if (e?.code === 'auth' || e?.code === 'reauth') t.action = { label: 'Conectar a API', cmd: 'connect' };
  toast(t);
}

/* ------------------------------------------------------------------ *
 * Janela e visões
 * ------------------------------------------------------------------ */
function panelWidth() {
  const w = Number(store?.get('panelWidth')) || 440;
  const [cw] = win && !win.isDestroyed() ? win.getContentSize() : [1400];
  return Math.round(Math.max(340, Math.min(w, cw - 480)));
}
function layout() {
  if (!win || win.isDestroyed()) return;
  const [w, h] = win.getContentSize();
  if (introView) introView.setBounds({ x: 0, y: 0, width: w, height: h });
  if (!lfView) return;
  // o painel do player ocupa a direita, entre a barra de cima e a de baixo
  const pw = state.panelLayout && !state.mini ? panelWidth() : 0;
  lfView.setVisible(!state.mini && !state.overlay);
  lfView.setBounds({ x: 0, y: TOOLBAR_H, width: Math.max(0, w - pw), height: Math.max(0, h - TOOLBAR_H - DOCK_H) });
  showNative();
}

/* ------------------------------------------------------------------ *
 * Abertura animada (estilo Big Picture): fica por cima de tudo enquanto o Last.fm carrega por baixo,
 * e no fim abre um "portal" do centro que mostra o app. Pula com um clique ou qualquer tecla.
 * ------------------------------------------------------------------ */
let introView = null;
let introPending = false; // a abertura vai aparecer (a interface já sabe disso antes dela existir)
let introPainted = null;
let introFailsafe = 0;
const introOn = () => store.get('intro') !== false && !SELFTEST && process.env.LFS_INTRO !== '0';
async function openIntro() {
  if (!introOn()) return false;
  try {
    introView = new WebContentsView({ webPreferences: { preload: path.join(__dirname, 'preload-intro.js'), contextIsolation: true, sandbox: true } });
    introView.setBackgroundColor('#00000000'); // transparente: no fim, o app aparece por baixo
    win.contentView.addChildView(introView);
    const [w, h] = win.getContentSize();
    introView.setBounds({ x: 0, y: 0, width: w, height: h });
    const painted = new Promise((r) => { introPainted = r; });
    await introView.webContents.loadFile(path.join(__dirname, 'ui', 'intro.html'), { query: { perf: store.get('perfMode') === 'perf' ? '1' : '0' } });
    await Promise.race([painted, wait(1200)]);
    introFailsafe = setTimeout(closeIntro, 20000);
    return true;
  } catch (e) {
    log('abertura: não abriu', e.message);
    closeIntro();
    if (win && !win.isDestroyed()) win.webContents.send('intro', 'done');
    return false;
  }
}
function closeIntro() {
  clearTimeout(introFailsafe);
  introPending = false;
  if (!introView) return;
  const v = introView;
  introView = null;
  try { win.contentView.removeChildView(v); } catch (_) { /* já saiu */ }
  try { v.webContents.close(); } catch (_) { /* já fechou */ }
  if (win && !win.isDestroyed()) win.webContents.send('intro', 'done');
  showNative();
  push();
}
/** O Last.fm já tem o que mostrar: a abertura pode terminar (quando a sequência acabar) */
function introReady() { if (introView) introView.webContents.send('intro:ready'); }
const fromIntro = (e) => !!introView && e.sender === introView.webContents;
ipcMain.on('intro:painted', (e) => { if (fromIntro(e) && introPainted) introPainted(); });
ipcMain.on('intro:exit', (e) => { if (fromIntro(e) && win && !win.isDestroyed()) { log('abertura: saindo'); win.webContents.send('intro', 'exit'); } });
ipcMain.on('intro:done', (e) => { if (fromIntro(e)) { log('abertura: fim'); closeIntro(); } });
function onScreen(b) {
  if (!b || b.x === undefined) return false;
  return screen.getAllDisplays().some((d) => {
    const a = d.workArea;
    return b.x + 80 < a.x + a.width && b.x + b.width - 80 > a.x && b.y >= a.y - 20 && b.y + 40 < a.y + a.height;
  });
}
function cleanUA(ua) { return ua.replace(/\s+Electron\/\S+/i, '').replace(/\s+lastfm-prime\/\S+/i, '').replace(/\s+Last\.fm PRIME\/\S+/i, ''); }

async function createWindow() {
  const b = store.get('bounds');
  win = new BrowserWindow({
    width: b?.width || 1380, height: b?.height || 880,
    ...(onScreen(b) ? { x: b.x, y: b.y } : {}),
    minWidth: 900, minHeight: 600,
    backgroundColor: '#000000', show: false, title: 'Last.fm PRIME', icon: ICON,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#000000', symbolColor: '#e9e7f0', height: TOOLBAR_H },
    webPreferences: { preload: path.join(__dirname, 'preload-ui.js'), contextIsolation: true, sandbox: true, spellcheck: false },
  });
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:/.test(url)) openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.on('before-input-event', keys);
  win.on('resize', layout);
  introPending = introOn();
  win.on('focus', () => schedulePoll(250));
  win.on('close', () => {
    if (state.mini) store.set({ miniBounds: win.getBounds() });
    else store.set({ bounds: win.getNormalBounds(), maximized: win.isMaximized() });
    store.flush();
  });
  await win.loadFile(path.join(__dirname, 'ui', 'index.html'));
  if (!TESTING) win.maximize(); // o app abre sempre maximizado
  const intro = await openIntro();
  if (!SELFTEST) win.show();
  // a abertura (Big Picture) só começa quando a janela do app está em foco; se não ganhar foco, começa mesmo assim depois de um tempo
  if (intro && introView) {
    let goSent = false;
    const sendGo = () => { if (goSent) return; goSent = true; if (introView) introView.webContents.send('intro:go'); };
    if (win.isFocused() || TESTING) sendGo();
    else { win.once('focus', sendGo); setTimeout(sendGo, 8000); }
  }

  /* Last.fm, com a extensão Last.fm Hub */
  lfSession = session.fromPartition('persist:lastfm');
  lfSession.setUserAgent(cleanUA(lfSession.getUserAgent()));
  try { lfSession.setSpellCheckerLanguages(['pt-BR', 'en-US']); } catch (_) { /* sem corretor */ }
  lfSession.setPermissionRequestHandler((_wc, perm, cb) => cb(['clipboard-sanitized-write', 'fullscreen'].includes(perm)));
  // anúncios e rastreadores: listas do uBlock (no Last.fm, rede e CSS; os scriptlets ficam para as plataformas)
  loadAdLists();
  adblockSession(lfSession, { scripts: false });
  // conexões prontas com o site e o servidor de capas: as imagens começam a chegar antes
  try { lfSession.preconnect({ url: 'https://www.last.fm', numSockets: 2 }); lfSession.preconnect({ url: 'https://lastfm.freetls.fastly.net', numSockets: 4 }); lfSession.preconnect({ url: 'https://lastfm-img.freetls.fastly.net', numSockets: 4 }); } catch (_) { /* sem suporte */ }
  if (testHooks?.session) await testHooks.session(lfSession);
  try { hubExt = await lfSession.extensions.loadExtension(EXT_DIR); } catch (e) { log('extensão', e.message); hubExt = null; }

  lfView = new WebContentsView({
    webPreferences: { session: lfSession, preload: path.join(__dirname, 'preload-lastfm.js'), contextIsolation: true, sandbox: true, spellcheck: true },
  });
  lfView.setBackgroundColor('#000000');
  win.contentView.addChildView(lfView);
  if (introView) win.contentView.addChildView(introView); // a abertura continua por cima de tudo
  layout();
  const wc = lfView.webContents;
  // a abertura termina quando o Last.fm já tem o que mostrar
  wc.once('dom-ready', () => setTimeout(introReady, 450));
  wc.once('did-fail-load', () => introReady());
  wc.setWindowOpenHandler(({ url }) => {
    if (isLastfm(url)) wc.loadURL(url);
    else if (!userActedRecently()) log('janela bloqueada (sem clique)', url);
    else if (isSpotify(url)) playFromLink(url, null);
    else if (PL.platformOf(url) && engineWeb()) openInPanel(PL.platformOf(url), url);
    else if (/^https?:/.test(url)) openFromPage(url);
    return { action: 'deny' };
  });
  // Só a página principal pode levar a algo fora do Last.fm, e só logo depois de um clique seu.
  // Iframes (anúncios, vídeos do YouTube, players embutidos) carregam ou falham ali mesmo: nunca abrem o navegador.
  const offsite = (e, url, isMain) => {
    if (!isMain || isLastfm(url) || /^(about|data|blob|chrome-error|chrome-extension):/i.test(url)) return;
    e.preventDefault();
    if (!userActedRecently()) { log('navegação bloqueada (sem clique)', url); return; }
    if (isSpotify(url)) playFromLink(url, null);
    else if (PL.platformOf(url) && engineWeb()) openInPanel(PL.platformOf(url), url);
    else if (/^https?:/.test(url)) openFromPage(url);
  };
  wc.on('will-navigate', (e, url) => offsite(e, url, e.isMainFrame !== false));
  wc.on('will-redirect', (e, url, _inPlace, isMainFrame) => offsite(e, url, (e.isMainFrame ?? isMainFrame) === true));
  wc.on('will-frame-navigate', (e) => { /* iframes: sem efeito fora do app */ void e; });
  wc.on('before-input-event', keys);
  const nav = () => { updateNav(); push(); };
  wc.on('did-start-loading', () => { state.page.loading = true; push(); });
  wc.on('did-stop-loading', () => { state.page.loading = false; nav(); });
  wc.on('did-navigate', nav);
  wc.on('did-navigate-in-page', nav);
  wc.on('page-title-updated', (_e, title) => { state.page.title = title.replace(/\s*\|\s*Last\.fm\s*$/i, ''); push(); });
  wc.on('render-process-gone', () => setTimeout(() => !wc.isDestroyed() && wc.reload(), 800));
  wc.loadURL(HOME).catch(() => {});
}
function updateNav() {
  if (!lfView) return;
  const wc = lfView.webContents;
  const h = wc.navigationHistory;
  state.page.canBack = h ? h.canGoBack() : wc.canGoBack();
  state.page.canFwd = h ? h.canGoForward() : wc.canGoForward();
  state.page.url = wc.getURL();
}
function go(what, url) {
  if (!lfView) return;
  const wc = lfView.webContents;
  const h = wc.navigationHistory;
  if (state.mini && what !== 'reload') setMini(false);
  if (what === 'back') (h ? h.goBack() : wc.goBack());
  else if (what === 'forward') (h ? h.goForward() : wc.goForward());
  else if (what === 'reload') wc.reload();
  else if (what === 'home') wc.loadURL(HOME);
  else if (what === 'url' && isLastfm(url)) wc.loadURL(url);
}
function keys(e, input) {
  if (input.type !== 'keyDown') return;
  const k = input.key;
  if (input.alt && k === 'ArrowLeft') { go('back'); e.preventDefault(); }
  else if (input.alt && k === 'ArrowRight') { go('forward'); e.preventDefault(); }
  else if (k === 'F5' || ((input.control || input.meta) && k.toLowerCase() === 'r')) { go('reload'); e.preventDefault(); }
  else if (k === 'F12' && lfView) { lfView.webContents.toggleDevTools(); e.preventDefault(); }
}

/* ------------------------------------------------------------------ *
 * Conversa com a página do Last.fm (preload-lastfm.js)
 * ------------------------------------------------------------------ */
const pending = new Map();
let seq = 0;
function askLastfm(what, data, timeout = 20000) {
  return new Promise((resolve, reject) => {
    if (!lfView || lfView.webContents.isDestroyed()) { reject(new Error('Last.fm indisponível')); return; }
    const id = ++seq;
    const t = setTimeout(() => { pending.delete(id); reject(new Error('A página do Last.fm não respondeu.')); }, timeout);
    pending.set(id, (r) => { clearTimeout(t); resolve(r); });
    lfView.webContents.send('lf:ask', { id, what, data });
  });
}
ipcMain.on('lf:reply', (e, msg) => {
  if (!lfView || e.sender !== lfView.webContents || !msg) return;
  const fn = pending.get(msg.id);
  if (fn) { pending.delete(msg.id); fn(msg.result); }
});
ipcMain.on('lf:page', (e, info) => {
  if (!lfView || e.sender !== lfView.webContents || !info) return;
  if (info.user !== null && info.user !== undefined && info.user !== state.lf.user) {
    state.lf.user = info.user;
    if (state.scrobble.status === 'nolastfm' && info.user) state.scrobble = { status: 'wait', misses: 0, checked: 0 };
  }
  state.page.tracks = info.tracks || 0;
  if (info.title) state.page.title = info.title;
  // (só enquanto os scrobbles não estão autorizados: depois, visitar a página da conta de API não muda nada)
  if (info.apiKeys && scrob && !scrob.connected && (info.apiKeys.key !== scrob.api.key || info.apiKeys.secret !== scrob.api.secret)) {
    if (scrob.setKeys(info.apiKeys.key, info.apiKeys.secret)) {
      log('scrobbles: chave da API encontrada na página');
      toast({ id: 'lfm', kind: 'ok', text: 'Chave da API do Last.fm salva. Falta autorizar os scrobbles.', action: { label: 'Autorizar', cmd: 'lfm-auth' } });
    }
  }
  updateNav();
  push();
});
ipcMain.on('lf:gesture', (e) => { if (lfView && e.sender === lfView.webContents) lastGesture = Date.now(); });
ipcMain.on('lf:spotify-link', (e, msg) => {
  if (!lfView || e.sender !== lfView.webContents || !msg) return;
  playFromLink(msg.href, msg.context);
});

/* ------------------------------------------------------------------ *
 * Tocar no Spotify o que o Last.fm mostra
 * ------------------------------------------------------------------ */
function parseSpotifyHref(href) {
  if (/^spotify:/i.test(href)) {
    const [, type, id] = href.split(':');
    return id ? { uri: `spotify:${type}:${id}`, type, id } : null;
  }
  let u;
  try { u = new URL(href); } catch (_) { return null; }
  const m = u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(track|album|artist|playlist|episode|show)\/([A-Za-z0-9]+)/);
  if (m) return { uri: `spotify:${m[1]}:${m[2]}`, type: m[1], id: m[2] };
  const s = u.pathname.match(/^\/search\/(.+)$/);
  if (!s) return null;
  let intent = null;
  const h = u.hash.match(/lfx=([^&]+)/);
  if (h) { try { const j = JSON.parse(decodeURIComponent(h[1])); if (j && j.k) intent = { kind: j.k, artist: j.a || '', title: j.t || '' }; } catch (_) { /* link antigo */ } }
  let q = s[1];
  try { q = decodeURIComponent(q); } catch (_) { /* mantém */ }
  return { search: q, intent };
}

function pickDevice(devs) {
  const ok = (d) => d && !d.is_restricted;
  return devs.find((d) => d.is_active && ok(d))
    || devs.find((d) => d.id === store.get('lastDeviceId') && ok(d))
    || devs.find((d) => d.type === 'Computer' && ok(d))
    || devs.find(ok) || null;
}
/* O Spotify do computador liga escondido (minimizado, sem janela na frente) para você ouvir só pelo app.
 * Ele continua sendo o Spotify oficial, que se atualiza sozinho; o app só o comanda. */
let spotifyByApp = false;
let lastLaunch = 0;
function spotifyExeCandidates() {
  const c = [];
  if (process.env.APPDATA) c.push(path.join(process.env.APPDATA, 'Spotify', 'Spotify.exe'));
  if (process.env.LOCALAPPDATA) c.push(path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WindowsApps', 'Spotify.exe'));
  return c;
}
function spotifyRunning() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') { resolve(null); return; }
    execFile('tasklist', ['/FI', 'IMAGENAME eq Spotify.exe', '/NH', '/FO', 'CSV'], { windowsHide: true, timeout: 4000 }, (err, out) => resolve(err ? null : /"Spotify\.exe"/i.test(String(out))));
  });
}
function spawnHidden(exe) {
  return new Promise((resolve) => {
    try {
      fs.lstatSync(exe); // o atalho da versão da Microsoft Store é um "alias" que só o lstat enxerga
    } catch (_) { resolve(false); return; }
    let child;
    try { child = spawn(exe, ['--minimized'], { detached: true, stdio: 'ignore' }); } catch (_) { resolve(false); return; }
    child.once('error', () => resolve(false));
    child.once('spawn', () => { child.unref(); resolve(true); });
  });
}
async function startSpotifyHidden() {
  if (engineWeb()) { await wp.start(); return 'web'; }
  if (Date.now() - lastLaunch < 20000) return 'recent';
  lastLaunch = Date.now();
  if (testHooks?.launchSpotify) { testHooks.launchSpotify(); spotifyByApp = true; return 'test'; }
  if (process.platform === 'win32') {
    if (await spotifyRunning()) return 'running';
    for (const exe of spotifyExeCandidates()) if (await spawnHidden(exe)) { spotifyByApp = true; return 'hidden'; }
  }
  await openExternal('spotify:').catch(() => {});
  spotifyByApp = true;
  return 'uri';
}
function closeSpotifyIfOurs() {
  if (!spotifyByApp || !store?.get('closeSpotify')) return;
  spotifyByApp = false;
  if (testHooks?.killSpotify) { testHooks.killSpotify(); return; }
  if (process.platform === 'win32') { try { spawnSync('taskkill', ['/IM', 'Spotify.exe', '/T', '/F'], { windowsHide: true, timeout: 4000 }); } catch (_) { /* já fechado */ } }
}
/** Ao abrir o app (e ao conectar), deixa o Spotify do PC pronto em segundo plano */
async function prepareSpotify() {
  if (engineWeb()) {
    if (!store.get('playerAtStart')) return;
    const pid = store.get('panelPlatform') || 'spotify';
    // um player por vez: liga o último que você usou (as plataformas do app nem precisam do Edge)
    if (onePlayer() && isNative(pid)) { native.open(pid); push(); return; }
    if (await wp.start() && onePlayer() && pid !== 'spotify' && PL.PLATFORMS[pid]) { await onlyPlayer(pid, { quiet: true }); await wp.openSource(pid); push(); }
    return;
  }
  if (!sp.connected || !store.get('spotifyAtStart')) return;
  try {
    const devs = await sp.devices();
    if (devs.some((d) => d.type === 'Computer' && !d.is_restricted)) return;
    if (process.platform === 'win32' && await spotifyRunning()) return;
    await startSpotifyHidden();
    schedulePoll(4000);
  } catch (_) { /* tenta de novo quando você der play */ }
}
async function ensureDevice(announce) {
  let devs = await sp.devices();
  let d = pickDevice(devs);
  if (d || !store.get('launchSpotify')) return d;
  if (engineWeb()) {
    // o web player escondido vira um aparelho do Spotify quando está ligado e logado: pede o login se faltar
    if (!(await webReady(announce || 'cmd'))) return null;
    if (announce) toast({ id: announce, text: 'Conectando ao player do Spotify…', busy: true });
  } else {
    if (announce) toast({ id: announce, text: 'Ligando o Spotify em segundo plano…', busy: true });
    await startSpotifyHidden();
  }
  for (let i = 0; i < 16; i++) {
    await wait(1000);
    devs = await sp.devices().catch(() => []);
    d = pickDevice(devs);
    if (d) { await wait(600); return d; }
  }
  return null;
}

/** Nenhum aparelho apareceu: explica conforme o caso (o aviso de login do player já foi dado pelo webReady) */
function noDeviceToast(id) {
  if (engineWeb() && wp) {
    const i = wp.info();
    if (i.loggedIn === false || i.status !== 'on') return;
    toast({ id, kind: 'warn', text: 'O player do Spotify está ligado, mas ainda não apareceu como aparelho. Tente de novo em instantes.', action: { label: 'Tentar de novo', cmd: 'launch' } });
    return;
  }
  toast({ id, kind: 'warn', text: 'O Spotify do computador não respondeu. Ele está instalado e logado na sua conta?', action: { label: 'Tentar de novo', cmd: 'launch' } });
}

/** Passa a música para o aparelho e retoma; se não havia nada carregado, toca a última música ouvida */
async function resumeOn(d) {
  try { await sp.transfer(d.id, true); } catch (e) { if (e.code !== 'api' && e.code !== 'no_device') throw e; }
  await wait(1200);
  const st = await sp.player().catch(() => null);
  if (st && st.playing && st.item) { onPlayer(st); return true; }
  const rp = await sp.api('GET', '/me/player/recently-played', { query: { limit: 1 } }).catch(() => null);
  const last = rp?.items?.[0];
  if (!last?.track?.uri) { schedulePoll(400); return false; }
  const ctx = last.context?.uri || '';
  const body = /^spotify:(album|playlist):/.test(ctx) ? { context_uri: ctx, offset: { uri: last.track.uri } } : { uris: [last.track.uri] };
  await sp.playUris(body, d.id);
  schedulePoll(500);
  return true;
}

/* ------------------------------------------------------------------ *
 * Plataformas no painel (Spotify, YouTube Music, Deezer, SoundCloud, Apple Music, Tidal)
 * O botão Player da barra de cima mostra a que tocou por último.
 * ------------------------------------------------------------------ */
/* Como cada plataforma abre: "native" (dentro do app, numa visão do próprio app) ou "edge" (o navegador
 * escondido, com a imagem transmitida para o painel). Quem precisa de DRM só toca pelo Edge. */
const DRM_PLATFORMS = ['spotify', 'apple', 'tidal'];
/* O Web Scrobbler só enxerga o que toca no player do Edge (ele não roda nas visões nativas do app).
 * Por isso, escolher "Web Scrobbler" para uma plataforma leva ela para o Edge. */
const wsEnabled = () => !!store.get('webScrobbler');
const scrobbleByOf = (pid) => { const by = store.get('scrobbleBy') || {}; return ['app', 'ws', 'off'].includes(by[pid]) ? by[pid] : 'app'; };
// A extensão Web Scrobbler empacotada com o app (id fixo pela chave do manifest)
const WS_ID = 'hhinaapppaileiechjoiifaancjggfjm';
const WS_PATH = path.join(__dirname, 'extensions', 'web-scrobbler');
// o conector do Web Scrobbler de cada plataforma do app (o Spotify ele deixa para o Last.fm cuidar)
const WS_CONNECTORS = { ytmusic: 'youtube-music', deezer: 'deezer', soundcloud: 'soundcloud', apple: 'apple-music', tidal: 'tidal' };
const wsExtensions = () => (wsEnabled() && fs.existsSync(path.join(WS_PATH, 'manifest.json')) ? [{ id: WS_ID, path: WS_PATH, name: 'Web Scrobbler' }] : []);
// extensões do player do Edge: o uBlock Origin Lite (com o bloqueio de anúncios ligado) e o Web Scrobbler
const playerExtensions = () => [
  ...(blockAdsOn() && fs.existsSync(path.join(UBOL_PATH, 'manifest.json')) ? [{ id: UBOL_ID, path: UBOL_PATH, name: 'uBlock Origin Lite' }] : []),
  ...wsExtensions(),
];
function engineOf(pid) {
  if (DRM_PLATFORMS.includes(pid)) return 'edge';
  if (wsEnabled() && scrobbleByOf(pid) === 'ws') return 'edge';
  return ((store.get('engines') || {})[pid]) === 'edge' ? 'edge' : 'native';
}
const isNative = (pid) => !!native && engineOf(pid) === 'native';
function enginesInfo() { const out = {}; for (const id of PL.ORDER) out[id] = engineOf(id); return out; }
function sourcesInfo() {
  const out = {};
  for (const id of PL.ORDER) {
    const st = id === 'spotify' ? (mode() === 'api' ? apiToState(lastApiPlayer) : wp && wp.state) : sourceStates[id];
    const open = id === 'spotify' ? !!(wp && wp.running && !wp.asleep) : !!((native && native.has(id)) || (wp && wp.sources.has(id)));
    out[id] = { open, playing: !!(st && st.playing), title: (st && st.title) || '', artist: (st && st.artists && st.artists[0]) || '' };
  }
  return out;
}
function platformPlayer(pid, s) {
  const p = webToPlayer(s);
  p.device = { ...p.device, id: pid, name: PL.PLATFORMS[pid].name, platform: pid, web: false };
  return p;
}
function applySourceState(pid, st) {
  const p = platformPlayer(pid, steady(pid, st));
  state.player = p;
  const id = p.item ? `${pid}:${p.item.id}` : null;
  if (id !== lastItemId) {
    lastItemId = id; seenFirst = true;
    state.liked = p.item ? false : null; // nas outras plataformas o coração curte no Last.fm
    state.scrobble = { status: p.item ? 'wait' : 'idle', misses: 0, checked: 0 };
    state.color = null;
    if (p.item && p.item.image) colorFor(p.item.image).then((c) => { if (id === lastItemId) { state.color = c; push(); } });
  }
  watchScrobble();
  push();
}
function setSource(pid) {
  if (state.source === pid) return;
  state.source = pid;
  lastItemId = undefined;
  log('barra: agora mostra', pid);
  if (pid === 'spotify') {
    state.player = null; state.liked = null;
    if (mode() === 'api') { if (lastApiPlayer) onPlayer(lastApiPlayer); schedulePoll(300); }
    else if (wp && wp.state) onWebState(wp.state);
  } else if (sourceStates[pid]) applySourceState(pid, sourceStates[pid]);
  else { state.player = null; state.liked = null; }
  push();
}
/** Ao dar play numa plataforma, pausa as outras (dá para desligar nas configurações) */
function pauseOthers(except) {
  if (!store.get('pauseOthers')) return;
  for (const id of PL.ORDER) {
    if (id === except) continue;
    if (id === 'spotify') {
      if (mode() === 'api') { if (lastApiPlayer && lastApiPlayer.playing) sp.command('pause', null, lastApiPlayer.device && lastApiPlayer.device.id).catch(() => {}); }
      else if (wp && wp.state && wp.state.playing) wp.cmd('pause').catch(() => {});
    } else if (sourceStates[id] && sourceStates[id].playing) {
      if (native && native.has(id)) native.cmd(id, 'pause');
      else wp.cmdSource(id, 'pause').catch(() => {});
    }
  }
}
/* Um player por vez: ao abrir uma plataforma, as outras fecham e o Spotify descansa (página em branco).
 * Assim nada toca em dobro e só uma janela escondida fica trabalhando. Dá para desligar nas configurações. */
const onePlayer = () => store.get('onePlayer') !== false;
let onlyBusy = Promise.resolve();
function onlyPlayer(pid, { quiet = false } = {}) {
  const job = onlyBusy.then(async () => {
    if (!onePlayer() || !PL.PLATFORMS[pid]) return;
    const edgeOn = !!(wp && wp.running);
    // a mesma plataforma aberta pelo outro jeito (no app × pelo Edge) também fecha
    const edgeClosing = edgeOn ? [...wp.sources.keys()].filter((id) => id !== pid || isNative(pid)) : [];
    const nativeClosing = native ? [...native.views.keys()].filter((id) => id !== pid || !isNative(pid)) : [];
    const closing = [...new Set([...edgeClosing, ...nativeClosing])];
    const sleeping = edgeOn && pid !== 'spotify' && !wp.asleep;
    const waking = edgeOn && pid === 'spotify' && wp.asleep;
    if (!closing.length && !sleeping && !waking) return;
    // quem estava tocando (para avisar só quando faz diferença)
    const busy = closing.filter((id) => sourceStates[id] && sourceStates[id].title);
    if (sleeping && wp.state && wp.state.title) busy.push('spotify');
    for (const id of closing) { delete sourceStates[id]; delete lastGood[id]; claimed[id] = false; }
    if (sleeping) { delete lastGood.spotify; spotifyWasPlaying = false; }
    if (store.get('panelPlatform') !== pid) store.set({ panelPlatform: pid });
    for (const id of nativeClosing) await native.close(id);
    for (const id of edgeClosing) if (id === pid) await wp.closeSource(id);
    if (edgeOn) await wp.only(pid);
    if (state.source !== pid) setSource(pid);
    if (busy.length && !quiet) {
      const names = busy.map((id) => PL.PLATFORMS[id].name);
      toast({ id: 'one', kind: 'info', text: `Um player por vez: fechei o ${names.join(' e o ')} para abrir o ${PL.PLATFORMS[pid].name}.` });
    }
    log('um player por vez:', pid, closing.length ? `fechou ${closing.join(',')}` : '', sleeping ? 'Spotify descansando' : waking ? 'Spotify acordado' : '');
    push();
  });
  onlyBusy = job.catch(() => {});
  return job;
}
let spotifyWasPlaying = false;
const stealSince = {};
let lastPanelInput = 0;
function onSourceState(pid, st) {
  if (pid === 'spotify') {
    if (scrob && mode() === 'web') scrob.update('spotify', st);
    const playing = !!(st && st.playing && st.title);
    // o Spotify começou a tocar: as outras plataformas pausam e a barra volta para ele.
    // Só na hora em que ele começa (e não a cada leitura), senão a barra fica pulando entre dois players.
    const started = playing && !spotifyWasPlaying;
    spotifyWasPlaying = playing;
    if (started) { pauseOthers('spotify'); if (state.source !== 'spotify') setSource('spotify'); }
    return;
  }
  if (st) sourceStates[pid] = st; else delete sourceStates[pid];
  if (scrob) scrob.update(pid, st);
  claimBar(pid);
  if (!st) reopenInPanel(pid);
  if (state.source === pid) { if (st) applySourceState(pid, st); else setSource('spotify'); return; }
  push();
}
/** A plataforma do painel fechou sem você trocar de plataforma (fechou a janela à parte no X, por exemplo):
 *  com o painel aberto, ela volta a abrir escondida e aparece de novo no painel */
let reopenTimer = 0;
function reopenInPanel(pid) {
  const want = () => !isNative(pid) && wp && wp.running && store.get('panelOpen') && store.get('panelPlatform') === pid && !wp.sources.has(pid) && !wp.shownPid;
  if (!want() || !wp.lastView || wp.lastView.pid !== pid) return;
  clearTimeout(reopenTimer);
  reopenTimer = setTimeout(() => { if (want()) wp.startScreen(pid, wp.lastView).then(() => push(), () => {}); }, 500);
}
/* Outra plataforma só toma a barra com uma música de verdade (título e som), uma vez por vez que começa
 * a tocar, e não por um instante: na hora se foi você que deu play no painel; senão, se continuar tocando
 * depois de 1,5 segundo (vídeos de fundo, prévias e anúncios curtos não roubam a barra). */
const claimed = {};
function claimBar(pid) {
  const st = sourceStates[pid];
  const real = !!(st && st.playing && st.title);
  if (!real) { claimed[pid] = false; clearTimeout(stealSince[pid]); delete stealSince[pid]; return; }
  if (claimed[pid] || state.source === pid) { claimed[pid] = true; return; }
  const onPanel = (wp && wp.screen && wp.screen.pid === pid) || (native && native.shown === pid);
  const byYou = onPanel && Date.now() - lastPanelInput < 10000;
  const take = () => {
    delete stealSince[pid];
    const now = sourceStates[pid];
    if (!now || !now.playing || !now.title || claimed[pid]) return;
    claimed[pid] = true;
    pauseOthers(pid);
    setSource(pid);
  };
  if (byYou) { clearTimeout(stealSince[pid]); take(); return; }
  if (!stealSince[pid]) stealSince[pid] = setTimeout(take, 1500);
}
/** Comandos para uma plataforma do painel (play, pausa, próxima…) */
async function sourceCmd(pid, cmd, arg) {
  const p = state.player;
  if (p && p.item) {
    if (cmd === 'toggle') { if (p.playing) { p.progress += Date.now() - p.at; p.at = Date.now(); p.playing = false; } else { p.at = Date.now(); p.playing = true; } }
    if (cmd === 'seek') { p.progress = arg; p.at = Date.now(); }
    if (cmd === 'volume' && p.device) p.device.volume = arg;
    push();
  }
  if (cmd === 'shuffle' || cmd === 'repeat') { toast({ id: 'cmd', kind: 'info', text: `No ${PL.PLATFORMS[pid].name}, use o aleatório e o repetir no painel.`, action: { label: 'Abrir o painel', cmd: 'panel' } }); return { ok: false }; }
  let r;
  try { r = native && native.has(pid) ? await native.cmd(pid, cmd, arg) : await wp.cmdSource(pid, cmd, arg); } catch (e) { r = { ok: false, why: e.message }; }
  if (!r || !r.ok) toast({ id: 'cmd', kind: 'warn', text: `O ${PL.PLATFORMS[pid].name} não aceitou o comando agora.`, action: { label: 'Abrir o painel', cmd: 'panel' } });
  return r || { ok: false };
}

/* ---------------- Painel ---------------- */
let panelCloseTimer = 0;
/* Clique fora do painel (no Last.fm ou na barra de cima): o painel se recolhe e o Last.fm volta ao foco.
 * Espera um instante: se o clique foi num link que abre algo no painel, ele fica aberto. */
let outsideTimer = 0;
function panelOutside() {
  if (!store.get('panelOpen') || store.get('panelAutoHide') === false || state.overlay || introView) return;
  clearTimeout(outsideTimer);
  outsideTimer = setTimeout(() => {
    if (!store.get('panelOpen')) return;
    log('painel: recolhido (clique fora)');
    panelSet({ open: false });
  }, 170);
}
ipcMain.on('lf:outside', (e) => { if (lfView && e.sender === lfView.webContents) panelOutside(); });
ipcMain.on('panel:outside', (e) => { if (fromUi(e)) panelOutside(); });
async function panelSet(patch = {}) {
  if (patch.open === true || patch.platform || patch.url) clearTimeout(outsideTimer);
  const was = !!store.get('panelOpen');
  const next = {};
  if ('open' in patch) next.panelOpen = !!patch.open;
  if (patch.platform && PL.PLATFORMS[patch.platform]) next.panelPlatform = patch.platform;
  if (patch.width) next.panelWidth = Math.round(Math.max(340, Math.min(1200, Number(patch.width) || 440)));
  if (patch.pid && PL.PLATFORMS[patch.pid] && patch.layout) next.panelLayouts = { ...(store.get('panelLayouts') || {}), [patch.pid]: patch.layout === 'mobile' ? 'mobile' : 'desktop' };
  store.set(next);
  const open = !!store.get('panelOpen');
  clearTimeout(panelCloseTimer);
  if (open) {
    if (!state.panelLayout || next.panelWidth) { state.panelLayout = true; layout(); }
  } else if (was) {
    nativeArmed = false;
    if (wp) wp.stopScreen();
    // a página nativa sai de cena com um retrato dela (o painel desliza com ele)
    if (native && native.shown) {
      const sp0 = native.shown;
      const snap = await Promise.race([native.snapshot(sp0), wait(180).then(() => null)]);
      if (snap) sendSnap(sp0, snap);
      if (!store.get('panelOpen')) native.hide();
    }
    // a imagem do Last.fm volta a ocupar a largura toda quando a animação de fechar termina
    panelCloseTimer = setTimeout(() => { state.panelLayout = false; layout(); }, 360);
  }
  if (next.panelLayouts) {
    if (wp) wp.layouts = next.panelLayouts;
    if (native) native.layouts = { ...next.panelLayouts };
    if (isNative(patch.pid)) native.setLayout(patch.pid, next.panelLayouts[patch.pid]);
    else if (wp) wp.setLayout(patch.pid, next.panelLayouts[patch.pid]).catch(() => {});
  }
  if (open && (patch.platform || patch.url || !was)) {
    const pid = store.get('panelPlatform');
    if (patch.platform && native && native.shown && native.shown !== pid) native.hide();
    const go = async () => {
      if (isNative(pid)) {
        await onlyPlayer(pid);
        native.open(pid, patch.url, { autoplay: !!patch.autoplay });
        showNative();
        push();
        return;
      }
      if (!wp) return;
      if (!wp.running && !(await wp.start())) return;
      await onlyPlayer(pid);
      if (pid === 'spotify') { if (patch.url) await wp.navigate(patch.url); } else await wp.openSource(pid, patch.url);
      push();
    };
    go().catch((e) => log('painel: não abriu', pid, e.message));
  }
  push();
  return true;
}
/** Abre um endereço de uma plataforma no painel (os "Ouvir no YouTube Music" etc. do Last.fm).
 *  Nas plataformas que rodam no app, uma busca vinda do Last.fm já toca o primeiro resultado. */
function openInPanel(pid, url) {
  if (!isNative(pid) && (!wp || !wp.available)) { openFromPage(url); return; }
  const autoplay = isNative(pid) && /[?&](q|query)=|\/search\b/i.test(url);
  toast({ id: 'play', kind: 'info', busy: autoplay, text: autoplay ? `Procurando no ${PL.PLATFORMS[pid].name}…` : `Abrindo no ${PL.PLATFORMS[pid].name}, no painel ao lado.` });
  panelSet({ open: true, platform: pid, url, autoplay });
}
/* A página nativa fica exatamente sobre a tela do painel (a interface diz onde) e só aparece com o painel
 * aberto, depois de ele deslizar, e sem nada por cima (configurações, abertura) */
let nativeRect = null;
let nativeArmed = false;
function showNative() {
  if (!native) return;
  const pid = store.get('panelPlatform');
  const ok = nativeArmed && nativeRect && store.get('panelOpen') && isNative(pid) && native.has(pid) && !state.overlay && !introView && !state.mini;
  if (ok) native.show(pid, nativeRect);
  else if (native.shown) native.hide();
}
/** Mudou o jeito de abrir uma plataforma: fecha a que estava aberta e, com ela no painel, abre do jeito novo */
async function switchEngine(pid) {
  log('plataforma', pid, 'agora abre', engineOf(pid) === 'native' ? 'no app' : 'pelo Edge');
  delete sourceStates[pid]; delete lastGood[pid];
  if (native && native.has(pid)) await native.close(pid);
  if (wp && wp.sources.has(pid)) await wp.closeSource(pid);
  if (state.source === pid) setSource('spotify');
  if (store.get('panelOpen') && store.get('panelPlatform') === pid) {
    nativeArmed = false;
    if (native) native.hide();
    if (win && !win.isDestroyed()) win.webContents.send('panel:reset');
    panelSet({ open: true, platform: pid });
  }
  push();
}
function sendSnap(pid, snap) {
  if (win && !win.isDestroyed()) win.webContents.send('panel:frame', { pid, data: snap.data, w: snap.w, h: snap.h, snap: true });
}

/* ------------------------------------------------------------------ *
 * Modo web: o web player do Spotify escondido faz o som (grátis ou Premium)
 * ------------------------------------------------------------------ */
/* A barra mostra sempre a música certa, sem piscar:
 *  - a mesma faixa mantém a mesma capa (as leituras da página às vezes alternam entre tamanhos);
 *  - uma leitura "vazia" enquanto a página se redesenha não apaga a barra (por até 6 segundos). */
const lastGood = {};
const trackKey = (s) => (s && s.title ? `${snorm((s.artists && s.artists[0]) || '')}|${snorm(s.title)}` : '');
function steady(pid, s) {
  const now = Date.now();
  const lg = lastGood[pid];
  if (s && s.title) {
    const key = trackKey(s);
    const out = { ...s, key };
    if (lg && lg.s.key === key) {
      out.imgChanges = lg.s.imgChanges || 0;
      if (lg.s.image && s.image !== lg.s.image) {
        // aceita uma troca (a capa pequena dá lugar à grande); depois, fica com a que já está na tela
        if (s.image && out.imgChanges < 1) out.imgChanges++; else out.image = lg.s.image;
      }
      if (!out.album && lg.s.album) out.album = lg.s.album;
      if ((!out.artists || !out.artists.length) && lg.s.artists) out.artists = lg.s.artists;
      if (!out.durationMs && lg.s.durationMs) out.durationMs = lg.s.durationMs;
      // o tempo da página vem em segundos inteiros: se bate com o relógio (±1,5 s), segue o relógio e não pula para trás
      if (s.playing && lg.s.playing) {
        const exp = (lg.s.positionMs || 0) + (now - (lg.s.at || lg.at));
        if (Math.abs((s.positionMs || 0) - exp) < 1500 && (!out.durationMs || exp <= out.durationMs)) { out.positionMs = exp; out.at = now; }
      }
    }
    lastGood[pid] = { s: out, at: now };
    return out;
  }
  if (lg && now - lg.at < 6000 && s && s.loggedIn !== false) {
    const elapsed = lg.s.playing ? now - lg.at : 0;
    return { ...lg.s, positionMs: (lg.s.positionMs || 0) + elapsed, at: now };
  }
  if (!s || !s.title) delete lastGood[pid];
  return s;
}
function webToPlayer(s) {
  const dev = { id: 'web', name: 'Este computador', type: 'Computer', volume: s && s.volume !== null ? s.volume : null, supportsVolume: !!s && s.volume !== null, private: false, web: true };
  if (!s || !s.title) return { device: dev, playing: false, item: null, progress: 0, at: Date.now(), shuffle: !!s?.shuffle, repeat: s?.repeat || 'off', context: null, disallows: {} };
  return {
    device: dev,
    playing: !!s.playing,
    item: {
      id: s.key || trackKey(s), uri: s.trackId ? `spotify:track:${s.trackId}` : null,
      type: s.episode ? 'episode' : 'track', name: s.title, duration: s.durationMs || 0,
      artists: s.artists && s.artists.length ? s.artists : [''], album: s.album || '', albumUri: null,
      image: s.image || null, imageBig: s.image || null, local: false,
    },
    progress: s.positionMs || 0, at: s.at || Date.now(), shuffle: !!s.shuffle, repeat: s.repeat || 'off', context: null,
    disallows: { skipping_next: s.canNext === false, skipping_prev: s.canPrev === false },
  };
}
let askedWebLogin = false;
function onWebState(s) {
  if (webLoginPending && s.loggedIn === true && !/login/.test(s.path || '')) {
    webLoginPending = false;
    askedWebLogin = true;
    wp.hide();
    store.set({ welcomed: true });
    log('player: login feito');
    toast({ id: 'login', kind: 'ok', text: 'Spotify conectado. Agora é só ouvir por aqui.' });
    if (mode() === 'api') { lastLaunch = 0; schedulePoll(1500); }
  }
  // sem login no player: avisa uma vez com o botão de entrar (a tela de boas-vindas já cuida da primeira vez)
  if (s.loggedIn === false && !webLoginPending && !askedWebLogin && engineWeb() && store.get('welcomed') && (store.get('panelPlatform') || 'spotify') === 'spotify') {
    askedWebLogin = true;
    toast({ id: 'login', kind: 'info', text: 'Entre na sua conta do Spotify para ouvir pelo app (grátis ou Premium).', action: { label: 'Entrar no Spotify', cmd: 'player-login' } });
  }
  if (mode() !== 'web' || state.source !== 'spotify') { push(); return; }
  if (s.loggedIn === false) { state.player = null; state.liked = null; push(); return; }
  onPlayer(webToPlayer(steady('spotify', s)));
  state.liked = state.player.item && s.liked !== null ? s.liked : null;
  push();
}
/** Garante o web player ligado e logado antes de um comando */
async function webReady(toastId) {
  if (!engineWeb()) {
    toast({ id: toastId, kind: 'warn', text: 'Para usar o app do Spotify do computador, conecte a API do Spotify (Premium).', action: { label: 'Conectar a API', cmd: 'connect' } });
    return false;
  }
  if (!wp.available) {
    toast({ id: toastId, kind: 'error', text: 'Não encontrei o Microsoft Edge neste computador. O player do Spotify usa o Edge que vem no Windows.' });
    return false;
  }
  if (!wp.running) {
    toast({ id: toastId, text: 'Ligando o player do Spotify…', busy: true });
    if (!(await wp.start())) {
      toast({ id: toastId, kind: 'error', text: 'O player do Spotify não abriu. Tente de novo; se continuar, veja o registro na pasta de dados.', action: { label: 'Tentar de novo', cmd: 'player-start' } });
      return false;
    }
  }
  if (wp.asleep || (onePlayer() && wp.sources.size)) {
    toast({ id: toastId, text: 'Voltando para o Spotify…', busy: true });
    await onlyPlayer('spotify');
    await wp.waitReady();
  }
  for (let i = 0; i < 60; i++) {
    const st = wp.state;
    if (st && st.loggedIn === false) break;
    if (st && st.ready && st.loggedIn) return true;
    await wait(250);
  }
  if (wp.state && wp.state.loggedIn === false) {
    toast({ id: toastId, kind: 'warn', text: 'Entre na sua conta do Spotify para tocar (grátis ou Premium).', action: { label: 'Entrar no Spotify', cmd: 'player-login' } });
    return false;
  }
  if (!wp.running) { toast({ id: toastId, kind: 'error', text: 'O player do Spotify não abriu. Tente de novo.' }); return false; }
  return !!(wp.state && wp.state.ready);
}
async function webPlayLink(p, ctx, mine, label) {
  if (!(await webReady('play'))) return;
  let r = null;
  let name = label;
  if (p.uri) {
    r = await wp.run('playEntity', `/${p.type}/${p.id}`);
  } else {
    const intent = p.intent || (ctx?.title ? { kind: 'track', artist: ctx.artist, title: ctx.title } : null);
    if (intent) {
      const q = intent.kind === 'artist' ? intent.artist : `${intent.artist} ${intent.title}`.trim();
      const seg = intent.kind === 'artist' ? 'artists' : intent.kind === 'album' ? 'albums' : 'tracks';
      const cands = (await wp.run('searchOn', `/search/${encodeURIComponent(q)}/${seg}`)) || [];
      const hit = intent.kind === 'artist' ? M.bestArtist(cands, intent.artist) : intent.kind === 'album' ? M.bestAlbum(cands, intent.artist, intent.title) : M.bestTrack(cands, intent.artist, intent.title);
      if (mine !== playBusy) return;
      if (!hit) {
        toast({ id: 'play', kind: 'warn', text: `Não achei “${label}” no Spotify. Abri a busca no painel para você.` });
        panelSet({ open: true, platform: 'spotify', url: wp.url(`/search/${encodeURIComponent(q)}`) });
        return;
      }
      name = hit.name;
      if (intent.kind === 'track') r = store.get('albumContext') && hit.albumId ? await wp.run('playTrackIn', `/album/${hit.albumId}`, hit.id) : await wp.run('playEntity', `/track/${hit.id}`);
      else r = await wp.run('playEntity', `/${intent.kind}/${hit.id}`);
    } else r = await wp.run('playTop', `/search/${encodeURIComponent(p.search)}`);
  }
  if (mine !== playBusy) return;
  if (r && r.ok) {
    const what = p.intent?.kind === 'album' || p.type === 'album' ? 'o álbum ' : p.intent?.kind === 'artist' || p.type === 'artist' ? 'as mais tocadas de ' : '';
    toast({ id: 'play', kind: 'ok', text: `Tocando ${what}“${name}”` });
  } else {
    toast({ id: 'play', kind: 'warn', text: 'Não consegui dar play sozinho. Abri o Spotify no painel ao lado para você tocar.' });
    log('player: não deu play sozinho', p.uri || p.search || '', r && r.why ? r.why : '');
    panelSet({ open: true, platform: 'spotify' });
  }
}

let playBusy = 0;
async function playFromLink(href, ctx) {
  const p = parseSpotifyHref(href);
  if (!p) { openExternal(href); return; }
  if (state.source !== 'spotify') setSource('spotify');
  if (mode() === 'web') {
    const mine = ++playBusy;
    const label = p.intent?.title || p.intent?.artist || ctx?.title || p.search || 'a música';
    toast({ id: 'play', text: `Procurando “${label}” no Spotify…`, busy: true });
    try { await webPlayLink(p, ctx, mine, label); } catch (e) { if (mine === playBusy) toast({ id: 'play', kind: 'error', text: `O player do Spotify não respondeu (${e.message}).` }); }
    return;
  }
  const mine = ++playBusy;
  const label = p.intent?.title || p.intent?.artist || ctx?.title || p.search || 'a música';
  toast({ id: 'play', text: `Procurando “${label}” no Spotify…`, busy: true });
  try {
    let t = null;
    if (p.uri) {
      t = { kind: p.type, uri: p.uri, name: ctx?.title || '', artist: ctx?.artist || '' };
      if (p.type === 'track' && store.get('albumContext')) {
        const tr = await sp.api('GET', `/tracks/${p.id}`).catch(() => null);
        if (tr) Object.assign(t, { name: tr.name, artist: tr.artists?.[0]?.name, albumUri: tr.album?.uri, image: tr.album?.images?.[1]?.url || tr.album?.images?.[0]?.url });
      }
    } else if (p.intent) t = await sp.resolve(p.intent);
    else if (ctx?.title) t = (await sp.resolve({ kind: 'track', artist: ctx.artist, title: ctx.title })) || (await sp.resolveQuery(p.search));
    else t = await sp.resolveQuery(p.search);
    if (mine !== playBusy) return;
    if (!t) {
      toast({ id: 'play', kind: 'warn', text: `Não achei “${label}” no Spotify.`, action: { label: 'Buscar no Spotify', uri: `spotify:search:${encodeURIComponent(p.search || label)}` } });
      return;
    }
    await playTarget(t, 'play');
  } catch (e) { if (mine === playBusy) toastError('play', e); }
}
async function playTarget(t, toastId) {
  let body;
  if (t.kind === 'track') body = store.get('albumContext') && t.albumUri ? { context_uri: t.albumUri, offset: { uri: t.uri } } : { uris: [t.uri] };
  else if (t.kind === 'episode') body = { uris: [t.uri] };
  else body = { context_uri: t.uri };
  const dev = await ensureDevice(toastId);
  if (!dev) { noDeviceToast(toastId); return; }
  try { await sp.playUris(body, dev.id); } catch (e) {
    if (e.code !== 'no_device') throw e;
    await sp.transfer(dev.id, false);
    await wait(500);
    await sp.playUris(body, dev.id);
  }
  const what = t.kind === 'album' ? 'o álbum' : t.kind === 'artist' ? 'as mais tocadas de' : t.kind === 'playlist' ? 'a playlist' : '';
  const where = /^web player/i.test(dev.name) ? 'neste computador' : `no ${dev.name}`;
  toast({ id: toastId, kind: 'ok', text: `Tocando ${what ? what + ' ' : ''}“${t.name || 'sua escolha'}” ${where}`, image: t.image || null });
  schedulePoll(600);
}

/* ------------------------------------------------------------------ *
 * O que está tocando (consulta adaptativa, para não gastar a cota da API)
 * ------------------------------------------------------------------ */
let pollTimer = null;
let polling = false;
let lastItemId;
let seenFirst = false;
function schedulePoll(ms) {
  clearTimeout(pollTimer);
  if (!sp || !sp.connected) return;
  pollTimer = setTimeout(poll, Math.max(200, ms));
}
function nextDelay() {
  if (Date.now() < sp.backoffUntil) return sp.backoffUntil - Date.now() + 500;
  const p = state.source === 'spotify' ? state.player : lastApiPlayer;
  const hidden = !win || win.isDestroyed() || win.isMinimized() || !win.isVisible();
  const focused = !!win && !win.isDestroyed() && win.isFocused();
  if (!p || !p.device) return hidden ? 30000 : 10000;
  if (!p.playing) return hidden ? 20000 : 6000;
  let d = hidden ? 10000 : focused ? 2500 : 5000;
  if (p.item && p.item.duration) {
    const left = p.item.duration - (p.progress + (Date.now() - p.at));
    if (left > 0 && left + 800 < d) d = left + 800;
  }
  return d;
}
async function poll() {
  clearTimeout(pollTimer);
  if (!sp.connected) { if (state.player) { state.player = null; push(); } return; }
  if (polling) { schedulePoll(800); return; }
  polling = true;
  try {
    const st = await sp.player();
    state.error = null;
    onPlayer(st, true);
  } catch (e) {
    if (e.code === 'rate' || e.code === 'quota') state.error = { code: e.code, text: e.message };
    else if (e.code === 'network') state.error = { code: 'network', text: 'Sem conexão com o Spotify. Tentando de novo…' };
    else if (e.code !== 'auth' && e.code !== 'reauth') state.error = { code: e.code || 'api', text: e.message };
    push();
  } finally { polling = false; }
  if (sp.connected) schedulePoll(nextDelay());
}
let lastApiPlayer = null;
let apiWasPlaying = false;
/** Estado do Spotify pela API no formato que os scrobbles entendem */
function apiToState(st) {
  const it = st && st.item;
  if (!it) return null;
  return { v: 1, title: it.name, artists: it.artists, album: it.album || '', playing: !!st.playing, positionMs: (st.progress || 0) + (st.playing ? Date.now() - (st.at || Date.now()) : 0), durationMs: it.duration || 0, trackId: it.id || null, episode: it.type === 'episode' };
}
function onPlayer(st, fromApi = false) {
  if (fromApi) {
    lastApiPlayer = st;
    if (scrob) scrob.update('spotify', apiToState(st));
    // pela API também só quando o Spotify começa a tocar (e não a cada consulta)
    const apiPlaying = !!(st && st.playing && st.item);
    const started = apiPlaying && !apiWasPlaying;
    apiWasPlaying = apiPlaying;
    if (started && state.source !== 'spotify') { pauseOthers('spotify'); setSource('spotify'); return; }
    if (state.source !== 'spotify') return;
  }
  state.player = st;
  const id = st.item ? st.item.id || st.item.uri : null;
  if (mode() === 'api' && st.device?.id && st.device.id !== store.get('lastDeviceId')) store.set({ lastDeviceId: st.device.id });
  if (id !== lastItemId) { const first = !seenFirst; seenFirst = true; lastItemId = id; onTrackChange(st, first); }
  watchScrobble();
  push();
}
function onTrackChange(st, first) {
  state.liked = null;
  state.scrobble = { status: st.item ? 'wait' : 'idle', misses: 0, checked: 0 };
  if (!st.item) { state.color = null; return; }
  const key = lastItemId;
  if (st.item.image) colorFor(st.item.image).then((c) => { if (key === lastItemId) { state.color = c; push(); } });
  if (mode() === 'api' && st.item.type === 'track' && !st.item.local && st.item.uri) {
    sp.saved(st.item.uri).then((v) => { if (key === lastItemId) { state.liked = v; push(); } }).catch(() => {});
  }
  if (!first && store.get('follow') && st.item.type === 'track' && !state.mini && !state.overlay && lfView) {
    const url = M.lfUrl('track', st.item.artists[0], st.item.name);
    if (!decodeURIComponent(lfView.webContents.getURL()).startsWith(decodeURIComponent(url))) lfView.webContents.loadURL(url);
  }
}

const colorCache = new Map();
async function colorFor(url) {
  if (colorCache.has(url)) return colorCache.get(url);
  try {
    const res = await net.fetch(url);
    if (!res.ok) return null;
    const img = nativeImage.createFromBuffer(Buffer.from(await res.arrayBuffer()));
    if (img.isEmpty()) return null;
    const a = C.analyse(img.resize({ width: 40, height: 40, quality: 'good' }).toBitmap(), 'bgra');
    const base = a.vibrant || a.dominant;
    const out = base ? { accent: C.accentOf(base), glow: C.glowOf(base) } : null;
    if (colorCache.size > 200) colorCache.clear();
    colorCache.set(url, out);
    return out;
  } catch (_) { return null; }
}

/* ------------------------------------------------------------------ *
 * Scrobbles: o Spotify está mandando o que toca para o Last.fm?
 * ------------------------------------------------------------------ */
let scrobbleBusy = false;
function appScrobbleView() {
  const pid = state.source;
  if (!scrob || !scrob.enabled(pid)) return null;
  const it = state.player && state.player.item;
  if (!it || it.type !== 'track') return { status: 'idle' };
  const cur = scrob.cur[pid];
  const key = `${snorm(it.artists[0])}|${snorm(it.name)}`;
  if (cur && cur.key === key && cur.done) {
    const l = scrob.last;
    const sent = l && `${snorm(l.artist)}|${snorm(l.track)}` === key && Date.now() - l.at < 30 * 60 * 1000;
    return { status: sent ? (l.via === 'service' ? 'ok' : 'sent') : 'sending' };
  }
  return { status: 'app' };
}
function watchScrobble() {
  const p = state.player;
  const s = state.scrobble;
  // quem conta esta plataforma? 'ws' = o Web Scrobbler; 'off' = ninguém
  const owner = scrob ? scrob.ownerOf(state.source) : 'app';
  if (owner === 'ws') { const st = p && p.item ? (wsEnabled() ? 'ws' : 'wsoff') : 'idle'; if (s.status !== st) state.scrobble = { status: st }; return; }
  if (owner === 'off') { const st = p && p.item ? 'none' : 'idle'; if (s.status !== st) state.scrobble = { status: st }; return; }
  const av = appScrobbleView();
  if (av) { if (s.status !== av.status) state.scrobble = av; return; }
  if (state.source !== 'spotify') { if (s.status !== 'noapp') state.scrobble = { status: p && p.item ? 'noapp' : 'idle' }; return; }
  if (!store.get('scrobbleWatch')) { if (s.status !== 'off') state.scrobble = { status: 'off' }; return; }
  if (!p?.item || p.item.type !== 'track') { if (s.status !== 'idle') state.scrobble = { status: 'idle' }; return; }
  if (p.device?.private) { state.scrobble = { ...s, status: 'private' }; return; }
  if (s.status === 'private') state.scrobble = { ...s, status: 'wait' };
  if (state.lf.user === '') { state.scrobble = { ...s, status: 'nolastfm' }; return; }
  if (!state.lf.user || !p.playing || scrobbleBusy) return;
  const cur = state.scrobble;
  if (p.progress < 12000 && cur.status !== 'ok') return;
  const every = cur.status === 'ok' ? 90000 : 20000;
  if (Date.now() - (cur.checked || 0) < every) return;
  checkScrobble();
}
async function checkScrobble() {
  scrobbleBusy = true;
  const key = lastItemId;
  const item = state.player.item;
  try {
    const res = await lfSession.fetch(`https://www.last.fm/user/${encodeURIComponent(state.lf.user)}/partial/recenttracks`, { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' });
    if (!res.ok) throw new Error(String(res.status));
    const rows = LF.parseRecent(await res.text());
    if (key !== lastItemId) return;
    const hit = rows.slice(0, 3).find((r) => M.sameTrack(r, item));
    const s = state.scrobble;
    if (hit) state.scrobble = { status: 'ok', misses: 0, checked: Date.now(), live: hit.live };
    else {
      const misses = (s.misses || 0) + 1;
      const played = state.player ? state.player.progress + (Date.now() - state.player.at) : 0;
      state.scrobble = { status: misses >= 2 && played > 32000 ? 'missing' : 'wait', misses, checked: Date.now() };
    }
    push();
  } catch (_) {
    state.scrobble = { ...state.scrobble, checked: Date.now() };
  } finally { scrobbleBusy = false; }
}

/* ------------------------------------------------------------------ *
 * Web Scrobbler (extensão dentro do player do Edge)
 * ------------------------------------------------------------------ */
/* Deixa os conectores do Web Scrobbler ligados só nas plataformas que o usuário escolheu para ele contar. */
let wsSyncBusy = false;
async function syncWsConnectors() {
  if (wsSyncBusy || !wp || !wp.running || !wsEnabled() || !wp.extLoaded[WS_ID]) return;
  wsSyncBusy = true;
  try {
    const opts = await wp.extStorageGet(WS_ID, 'sync', 'Options');
    if (!opts || typeof opts !== 'object') return; // as opções ainda não existem: não cria nada
    const disabled = { ...(opts.disabledConnectors || {}) };
    let changed = false;
    for (const [pid, conn] of Object.entries(WS_CONNECTORS)) {
      const want = scrobbleByOf(pid) !== 'ws';
      if (!!disabled[conn] !== want) { disabled[conn] = want; changed = true; }
    }
    if (changed) { await wp.extStorageSet(WS_ID, 'sync', 'Options', { ...opts, disabledConnectors: disabled }); log('scrobbles: conectores do Web Scrobbler ajustados'); }
  } catch (e) { log('scrobbles: Web Scrobbler', e.message); }
  finally { wsSyncBusy = false; }
}
/** Abre a página de opções do Web Scrobbler (conectar contas: Last.fm, Libre.fm, ListenBrainz) numa janela na frente do app */
async function openWsOptions(page) {
  if (!wsEnabled()) { toast({ id: 'ws', kind: 'info', text: 'Ligue o Web Scrobbler nas configurações, em Scrobbles, para abrir as opções dele.' }); return false; }
  if (!wp.running && !(await wp.start())) { toast({ id: 'ws', kind: 'error', text: 'O player não abriu, então não consegui abrir as opções do Web Scrobbler.' }); return false; }
  for (let i = 0; i < 30 && !wp.extLoaded[WS_ID]; i++) await new Promise((r) => setTimeout(r, 200));
  const pop = await wp.openExtensionPage(WS_ID, page || 'src/ui/options/index.html');
  if (!pop) { toast({ id: 'ws', kind: 'error', text: 'Não consegui abrir as opções do Web Scrobbler.' }); return false; }
  return true;
}
/* Login com a conta do Google: o Google recusa dentro de apps ("navegador pode não ser seguro"), por
 * segurança dele, e o app não contorna isso. Mostra o que funciona (uma vez por plataforma). */
const googleHinted = {};
function onGoogleLogin(pid) {
  if (googleHinted[pid]) return;
  googleHinted[pid] = true;
  const name = (PL.PLATFORMS[pid] && PL.PLATFORMS[pid].name) || 'a plataforma';
  toast({
    id: 'google', kind: 'warn', timeout: 15000,
    text: `O Google não aceita login de conta Google dentro de apps (por segurança dele). Para ${name}: entre com e-mail e senha da própria plataforma, ou abra ${name} no seu navegador. Os scrobbles funcionam mesmo sem essa conta — o app conta pelo que está tocando.`,
    action: { label: `Abrir ${name} no navegador`, cmd: 'open-external', url: (PL.PLATFORMS[pid] && PL.PLATFORMS[pid].home) || '' },
  });
  log('login: Google bloqueia login dentro do app', pid);
}

/* ------------------------------------------------------------------ *
 * Modo mini (só a barra, sempre por cima)
 * ------------------------------------------------------------------ */
function setMini(on) {
  if (!win || on === state.mini) return;
  if (on) {
    wp?.stopScreen();
    store.set({ bounds: win.getNormalBounds(), maximized: win.isMaximized() });
    if (win.isMaximized()) win.unmaximize();
    if (win.isFullScreen()) win.setFullScreen(false);
    state.mini = true;
    layout();
    try { win.setTitleBarOverlay({ height: MINI_TOP }); } catch (_) { /* sem suporte */ }
    win.setMinimumSize(380, MINI_H);
    const mb = store.get('miniBounds');
    const wa = screen.getDisplayMatching(win.getBounds()).workArea;
    const nb = mb && onScreen(mb) ? { ...mb, height: MINI_H } : { width: 480, height: MINI_H, x: wa.x + wa.width - 500, y: wa.y + wa.height - MINI_H - 24 };
    win.setBounds(nb);
    win.setAlwaysOnTop(true, 'floating');
  } else {
    store.set({ miniBounds: win.getBounds() });
    win.setAlwaysOnTop(false);
    state.mini = false;
    try { win.setTitleBarOverlay({ height: TOOLBAR_H }); } catch (_) { /* sem suporte */ }
    win.setMinimumSize(900, 600);
    const b = store.get('bounds');
    win.setBounds(b && onScreen(b) ? b : { width: 1380, height: 880 });
    if (store.get('maximized')) win.maximize();
    layout();
  }
  push();
}

/* ------------------------------------------------------------------ *
 * Pedidos da interface
 * ------------------------------------------------------------------ */
function fromUi(e) { return win && !win.isDestroyed() && e.sender === win.webContents; }
function handle(ch, fn) {
  ipcMain.handle(ch, async (e, arg) => {
    if (!fromUi(e)) throw new Error('origem desconhecida');
    return fn(arg);
  });
}

handle('state:get', () => snapshot());
handle('sp:client', (id) => {
  const clean = String(id || '').trim();
  store.set({ clientId: clean });
  sp.setClientId(clean);
  push();
  return { ok: /^[0-9a-f]{32}$/i.test(clean) };
});
handle('sp:login', async () => {
  try {
    const login = sp.login();
    push();
    await login;
    store.set({ welcomed: true });
    seenFirst = false;
    schedulePoll(200);
    prepareSpotify();
    return { ok: true, me: sp.me };
  } catch (e) {
    return { ok: false, code: e.code, text: e.message };
  } finally { push(); }
});
handle('sp:cancel', () => { sp.cancelLogin(); push(); });
handle('sp:logout', () => { sp.logout(); state.player = null; state.liked = null; lastItemId = undefined; clearTimeout(pollTimer); push(); });
async function webCmd(cmd, arg) {
  if (!(await webReady('cmd'))) return { ok: false };
  const p = state.player;
  if (p) {
    if (cmd === 'toggle' && p.item) { if (p.playing) { p.progress += Date.now() - p.at; p.at = Date.now(); p.playing = false; } else { p.at = Date.now(); p.playing = true; } }
    if (cmd === 'seek') { p.progress = arg; p.at = Date.now(); }
    if (cmd === 'volume' && p.device) p.device.volume = arg;
    if (cmd === 'shuffle') p.shuffle = !p.shuffle;
    push();
  }
  let r;
  try { r = await wp.cmd(cmd, arg); } catch (e) { r = { ok: false, why: e.message }; }
  if (!r || !r.ok) {
    if (cmd === 'toggle' && !p?.item) toast({ id: 'cmd', kind: 'info', text: 'Escolha algo para ouvir no Last.fm ou no Spotify.', action: { label: 'Mostrar o Spotify', cmd: 'player-show' } });
    else toast({ id: 'cmd', kind: 'warn', text: 'O player do Spotify não aceitou o comando agora.' });
  }
  return r || { ok: false };
}
/** Curtir no Last.fm também (com o formulário do próprio site) */
async function loveOnLastfm(it, on, where) {
  if (!store.get('likeOnLastfm')) { toast({ id: 'like', kind: 'ok', text: on ? 'Salva nas suas músicas curtidas do Spotify' : 'Tirada das curtidas do Spotify' }); return; }
  const r = await askLastfm('love', { artist: it.artists[0], title: it.name, on }).catch(() => null);
  if (r?.ok) toast({ id: 'like', kind: 'ok', text: on ? `Curtida ${where} e no Last.fm` : `Descurtida ${where} e no Last.fm` });
  else {
    const why = r?.why === 'login' ? 'entre no Last.fm para curtir lá também' : r?.why === 'notfound' ? 'a faixa ainda não existe no Last.fm' : 'abra a página da faixa e curta por lá';
    toast({ id: 'like', kind: 'warn', text: `${on ? 'Curtida' : 'Descurtida'} ${where}. No Last.fm não deu: ${why}.`, action: { label: 'Abrir a faixa', cmd: 'open-track' } });
  }
}

handle('sp:cmd', async ({ cmd, arg }) => {
  if (state.source !== 'spotify') return sourceCmd(state.source, cmd, arg);
  if (mode() === 'web') return webCmd(cmd, arg);
  const p = state.player;
  const dev = p?.device?.id;
  try {
    if (cmd === 'toggle') {
      if (!p?.device) {
        const d = await ensureDevice('cmd');
        if (!d) { noDeviceToast('cmd'); return { ok: false }; }
        await resumeOn(d);
      } else if (p.playing) {
        p.progress += Date.now() - p.at; p.at = Date.now(); p.playing = false; push();
        await sp.command('pause', null, dev);
      } else {
        p.at = Date.now(); p.playing = true; push();
        await sp.command('play', null, dev);
      }
    } else if (cmd === 'seek') {
      if (p) { p.progress = arg; p.at = Date.now(); push(); }
      await sp.command('seek', arg, dev);
    } else if (cmd === 'volume') {
      if (p?.device) { p.device.volume = arg; push(); }
      await sp.command('volume', arg, dev);
    } else if (cmd === 'shuffle') {
      const next = !p?.shuffle;
      if (p) { p.shuffle = next; push(); }
      await sp.command('shuffle', next, dev);
    } else if (cmd === 'repeat') {
      const next = { off: 'context', context: 'track', track: 'off' }[p?.repeat || 'off'];
      if (p) { p.repeat = next; push(); }
      await sp.command('repeat', next, dev);
    } else if (cmd === 'next' || cmd === 'prev') {
      await sp.command(cmd, null, dev);
    }
    schedulePoll(cmd === 'volume' ? 1500 : 400);
    return { ok: true };
  } catch (e) {
    schedulePoll(400);
    toastError('cmd', e);
    return { ok: false, code: e.code, text: e.message };
  }
});
handle('sp:devices', async () => {
  if (state.source !== 'spotify') {
    return { ok: true, devices: [{ id: state.source, name: PL.PLATFORMS[state.source].name, type: 'Computer', active: true }], note: 'Tocando no painel ao lado. Para escolher aparelhos, toque pelo Spotify.' };
  }
  if (mode() === 'web') {
    return { ok: true, devices: [{ id: 'web', name: 'Este computador', type: 'Computer', active: true }], note: 'Para tocar no celular ou em outros aparelhos, conecte a API do Spotify (Premium) nas configurações.' };
  }
  try {
    const list = await sp.devices();
    return { ok: true, devices: list.map((d) => ({ id: d.id, name: d.name, type: d.type, active: d.is_active, restricted: d.is_restricted, volume: d.volume_percent })) };
  } catch (e) { return { ok: false, text: e.message }; }
});
handle('sp:transfer', async (id) => {
  if (mode() === 'web' || id === 'web') return { ok: true };
  try {
    await sp.transfer(id, state.player ? state.player.playing : true);
    store.set({ lastDeviceId: id });
    schedulePoll(700);
    return { ok: true };
  } catch (e) { toastError('cmd', e); return { ok: false }; }
});
handle('sp:like', async () => {
  const it = state.player?.item;
  if (!it || it.type !== 'track' || it.local) return { ok: false };
  const on = !state.liked;
  const key = lastItemId;
  state.liked = on; push();
  if (state.source !== 'spotify') {
    // fora do Spotify, o coração curte (ou descurte) no Last.fm
    const r = await askLastfm('love', { artist: it.artists[0], title: it.name, on }).catch(() => null);
    if (!r || !r.ok) { if (key === lastItemId) { state.liked = !on; push(); } toast({ id: 'like', kind: 'warn', text: 'Não deu para curtir no Last.fm agora.' }); return { ok: false }; }
    toast({ id: 'like', kind: 'ok', text: on ? 'Curtida no Last.fm' : 'Descurtida no Last.fm' });
    return { ok: true };
  }
  if (mode() === 'web') {
    let r;
    try { r = await wp.cmd('like'); } catch (e) { r = { ok: false }; }
    if (!r || !r.ok) { if (key === lastItemId) { state.liked = !on; push(); } toast({ id: 'like', kind: 'warn', text: 'O player do Spotify não deixou curtir agora.' }); return { ok: false }; }
  } else {
    try { await sp.save(it.uri, on); } catch (e) { if (key === lastItemId) { state.liked = !on; push(); } toastError('like', e); return { ok: false }; }
  }
  await loveOnLastfm(it, on, 'no Spotify');
  return { ok: true };
});
handle('sp:launch', async () => {
  // "Tocar" sem aparelho: liga o player escondido e retoma a música
  if (state.source !== 'spotify') return sourceCmd(state.source, 'play');
  if (mode() === 'web') {
    if (!(await webReady('cmd'))) return { ok: false };
    if (wp.state && wp.state.title && !wp.state.playing) return webCmd('play');
    if (!wp.state || !wp.state.title) { toast({ id: 'cmd', kind: 'info', text: 'Spotify pronto. Escolha algo para ouvir no Last.fm ou no Spotify.', action: { label: 'Mostrar o Spotify', cmd: 'player-show' } }); }
    return { ok: true };
  }
  try {
    toast({ id: 'cmd', text: 'Ligando o Spotify em segundo plano…', busy: true });
    lastLaunch = 0;
    const d = await ensureDevice('cmd');
    if (!d) { noDeviceToast('cmd'); return { ok: false }; }
    const ok = await resumeOn(d);
    toast({ id: 'cmd', kind: ok ? 'ok' : 'info', text: ok ? `Tocando no ${d.name}` : `Spotify pronto no ${d.name}. Escolha algo para ouvir.` });
    return { ok };
  } catch (e) { toastError('cmd', e); return { ok: false }; }
});
handle('sp:play', async ({ uri, name }) => {
  if (!isSpotify(uri)) return { ok: false };
  const type = uri.split(':')[1];
  try { await playTarget({ kind: type, uri, name: name || '' }, 'play'); return { ok: true }; } catch (e) { toastError('play', e); return { ok: false }; }
});
handle('sp:open-uri', async (uri) => {
  if (!isSpotify(uri)) return;
  if (engineWeb() && wp) {
    const m = String(uri).match(/^spotify:(track|album|artist|playlist|search):(.+)$/);
    if (m) { await wp.show(wp.url(m[1] === 'search' ? `/search/${m[2]}` : `/${m[1]}/${m[2]}`), { near: nearApp() }); return; }
  }
  await openExternal(uri).catch(() => {});
});
const nearApp = () => (win && !win.isDestroyed() && !state.mini ? win.getBounds() : null);
/** Onde abrir as janelas de login: no meio do app; com o app pequeno (mini) ou minimizado, no meio da tela */
function popupNear() {
  if (!win || win.isDestroyed()) return null;
  const b = win.getBounds();
  if (state.mini || win.isMinimized() || b.height < 560 || b.width < 480) {
    try { return screen.getDisplayMatching(b).workArea; } catch (_) { return null; }
  }
  return b;
}
/* Janelas abertas pelas páginas do player (login com Facebook, Google, Apple…): aparecem na frente do app,
 * numa janela à parte. No modo mini o app sai de "sempre por cima" enquanto elas estão abertas. */
let popupTopWas = null;
function onPopup(ev) {
  if (!win || win.isDestroyed()) return;
  if (ev.open) {
    if (popupTopWas === null && win.isAlwaysOnTop()) { popupTopWas = true; win.setAlwaysOnTop(false); }
    // login com a conta do Google numa janela do player do Edge: o Google bloqueia — mostra o caminho que funciona
    if (/(^|\.)accounts\.google\.com/.test(ev.host || '')) { onGoogleLogin(ev.pid || 'spotify'); return; }
    // as opções do Web Scrobbler (ou outra página de extensão) abertas pelo app
    if (ev.kind === 'page' || ev.kind === 'ext') {
      toast({ id: 'popup', kind: 'info', text: 'Abri as opções do Web Scrobbler numa janela à parte. Conecte suas contas (Last.fm, Libre.fm, ListenBrainz) por lá.', action: { label: 'Mostrar a janela', cmd: 'popup-front' } });
      return;
    }
    const P = PL.PLATFORMS[ev.pid] || PL.PLATFORMS.spotify;
    const what = /facebook/.test(ev.host || '') ? 'do Facebook' : /apple/.test(ev.host || '') ? 'da Apple' : '';
    toast({ id: 'popup', kind: 'info', text: `Abri a janela ${what ? `de login ${what}` : 'que o ' + P.name + ' pediu'} à parte, na frente do app. Termine por lá: ela fecha sozinha.`, action: { label: 'Mostrar a janela', cmd: 'popup-front' } });
    return;
  }
  if (ev.count) return;
  if (popupTopWas && state.mini) win.setAlwaysOnTop(true, 'floating');
  popupTopWas = null;
  // de volta ao app (o login continua sozinho no painel)
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
  toast({ id: 'popup', kind: 'ok', text: 'Pronto. Voltando ao player no painel.' });
}
handle('player:login', async () => {
  if (!engineWeb()) return wp.info();
  webLoginPending = true;
  log('player: abrindo o login no painel');
  if (!wp.running && !(await wp.start())) {
    toast({ id: 'login', kind: 'error', text: 'O player do Spotify não abriu. Tente de novo; se continuar, veja o registro na pasta de dados.', action: { label: 'Tentar de novo', cmd: 'player-login' } });
    return wp.info();
  }
  await panelSet({ open: true, platform: 'spotify' });
  await wp.navigate(wp.loginUrl);
  return wp.info();
});
// botão do player na barra: mostra ou esconde o painel (escondido, ele continua tocando)
handle('player:show', async (on) => { await panelSet({ open: on === undefined ? !store.get('panelOpen') : !!on }); return wp.info(); });
// a janela de verdade do navegador, para quando o painel não conseguir mostrar a página
handle('player:window', async (on) => {
  if (isNative(store.get('panelPlatform') || 'spotify')) return wp ? wp.info() : null;
  if (on === false) await wp.hide();
  else {
    const pid = store.get('panelPlatform') || 'spotify';
    await wp.show(null, { near: nearApp(), pid });
    toast({ id: 'window', kind: 'info', text: `O ${PL.PLATFORMS[pid].name} está numa janela à parte. Quando terminar, volte ao painel.`, action: { label: 'Voltar ao painel', cmd: 'player-unwindow' } });
  }
  return wp.info();
});
handle('player:popups', async () => { await wp.frontPopups(); return wp.info(); });
handle('panel:set', (patch) => panelSet(patch || {}));
handle('panel:view', async ({ x, y, width, height, dsf } = {}) => {
  if (!store.get('panelOpen')) return false;
  const pid = store.get('panelPlatform') || 'spotify';
  if (isNative(pid)) {
    nativeRect = { x: Number(x) || 0, y: Number(y) || 0, width: Number(width) || 0, height: Number(height) || 0 };
    nativeArmed = true;
    await onlyPlayer(pid, { quiet: true });
    if (!native.has(pid)) native.open(pid);
    if (wp) wp.stopScreen();
    showNative();
    push();
    return true;
  }
  if (native && native.shown) native.hide();
  if (!wp || !wp.available) return false;
  const perf = store.get('perfMode') === 'perf';
  if (!wp.running && !(await wp.start())) return false;
  await onlyPlayer(pid, { quiet: true });
  if (wp.shownPid === pid) return false; // está numa janela à parte agora
  return wp.startScreen(pid, { width, height, dsf: Math.max(1, Math.min(2, Number(dsf) || 1)), quality: perf ? 55 : 82, nth: perf ? 2 : 1 });
});
ipcMain.on('panel:input', (e, ev) => {
  if (!fromUi(e) || !ev) return;
  const pid = store.get('panelPlatform') || 'spotify';
  if (ev.kind === 'nav' && isNative(pid)) { native.nav(pid, ev.what); return; }
  if (!wp) return;
  if (ev.kind !== 'mouse' || ev.type === 'mousePressed') lastPanelInput = Date.now();
  wp.input(ev);
});
// o painel do Edge ficou sem imagem: anota o que dá para saber no registro.log
ipcMain.on('panel:stuck', (e, info) => {
  if (!fromUi(e) || !wp) return;
  const i = wp.info();
  log('painel: sem imagem do Edge', JSON.stringify({ pid: info && info.pid, status: i.status, asleep: i.asleep, screen: wp.screen ? { pid: wp.screen.pid, frames: wp.screen.frames, w: wp.screen.width, h: wp.screen.height } : null, transport: wp.transport, helper: !!(winHelper && winHelper.alive), browser: i.browser }));
});
handle('player:start', async () => { await wp.start(); return wp.info(); });
handle('nav', ({ go: what, url }) => go(what, url));
handle('lf:open-now', (what) => {
  const it = state.player?.item;
  if (!it || it.type !== 'track') return;
  const url = what === 'artist' ? M.lfUrl('artist', it.artists[0]) : what === 'album' ? M.lfUrl('album', it.artists[0], it.album) : M.lfUrl('track', it.artists[0], it.name);
  go('url', url);
});
handle('playlist:collect', async () => {
  try { return await askLastfm('collect', null, 8000); } catch (e) { return { error: e.message, tracks: [], albums: [] }; }
});
handle('playlist:create', async ({ name, tracks = [], albums = [], url = '' }) => {
  if (!sp.connected) return { ok: false, text: 'Criar playlists precisa da API do Spotify (só Premium). Ative em Configurações › Spotify.' };
  const send = (d) => win?.webContents.send('playlist:progress', d);
  const uris = [];
  const seen = new Set();
  let missing = 0;
  const total = tracks.length + albums.length;
  let done = 0;
  const retry = async (fn) => {
    for (let i = 0; i < 3; i++) {
      try { return await fn(); } catch (e) {
        if (e.code === 'rate' || e.code === 'quota') { send({ done, total, wait: true }); await wait(Math.min(e.retryIn || 3000, 20000)); continue; }
        if (e.code === 'auth' || e.code === 'reauth') throw e;
        return null;
      }
    }
    return null;
  };
  try {
    for (const t of tracks.slice(0, 100)) {
      const r = await retry(() => sp.resolve({ kind: 'track', artist: t.artist, title: t.title }));
      if (r && !seen.has(r.uri)) { seen.add(r.uri); uris.push(r.uri); } else if (!r) missing++;
      send({ done: ++done, total });
      await wait(80);
    }
    for (const al of albums.slice(0, 10)) {
      const r = await retry(() => sp.resolve({ kind: 'album', artist: al.artist, title: al.title }));
      if (r?.id) {
        const list = (await retry(() => sp.albumTracks(r.id))) || [];
        for (const u of list) if (!seen.has(u) && uris.length < 300) { seen.add(u); uris.push(u); }
      } else missing++;
      send({ done: ++done, total });
      await wait(80);
    }
    if (!uris.length) return { ok: false, text: 'Nenhuma música desta página foi encontrada no Spotify.' };
    send({ done, total, creating: true });
    const pl = await sp.createPlaylist(String(name || 'Last.fm PRIME').slice(0, 100), `Criada pelo Last.fm PRIME a partir de ${url}`.slice(0, 300), uris);
    return { ok: true, ...pl, count: uris.length, missing };
  } catch (e) { return { ok: false, text: e.message }; }
});
handle('settings:set', (patch) => {
  const allowed = ['likeOnLastfm', 'follow', 'scrobbleWatch', 'albumContext', 'launchSpotify', 'spotifyAtStart', 'closeSpotify', 'blockAds', 'welcomed', 'playerAtStart', 'pauseOthers', 'scrobbleOn', 'onePlayer', 'panelAutoHide', 'intro', 'webScrobbler'];
  const clean = {};
  for (const k of allowed) if (patch && k in patch) clean[k] = !!patch[k];
  if (patch && patch.scrobbleSources && typeof patch.scrobbleSources === 'object') {
    const cur = { ...(store.get('scrobbleSources') || {}) };
    for (const id of PL.ORDER) if (id in patch.scrobbleSources) cur[id] = !!patch.scrobbleSources[id];
    clean.scrobbleSources = cur;
  }
  // quem conta os scrobbles de cada plataforma: 'app' | 'ws' | 'off'
  if (patch && patch.scrobbleBy && typeof patch.scrobbleBy === 'object') {
    const cur = { ...(store.get('scrobbleBy') || {}) };
    for (const id of PL.ORDER) {
      if (!(id in patch.scrobbleBy)) continue;
      let v = ['app', 'ws', 'off'].includes(patch.scrobbleBy[id]) ? patch.scrobbleBy[id] : 'app';
      if (id === 'spotify' && v === 'ws') v = 'app';        // o Web Scrobbler não conta o Spotify
      cur[id] = v;
    }
    clean.scrobbleBy = cur;
  }
  if (patch && patch.engine === 'web') clean.engine = 'web'; // o player fica sempre no painel
  // como cada plataforma abre depende de engines, de webScrobbler e de scrobbleBy: guarda o "antes" para comparar
  const engBefore = {}; for (const id of PL.ORDER) engBefore[id] = engineOf(id);
  if (patch && patch.engines && typeof patch.engines === 'object') {
    const cur = { ...(store.get('engines') || {}) };
    for (const id of PL.ORDER) {
      if (!(id in patch.engines) || DRM_PLATFORMS.includes(id)) continue;
      cur[id] = patch.engines[id] === 'edge' ? 'edge' : 'native';
    }
    clean.engines = cur;
  }
  const wsWas = wsEnabled();
  const adsWas = blockAdsOn();
  store.set(clean);
  if (clean.engine === 'web') wp.start();
  if (clean.engine === 'desktop') { wp.stop(); if (mode() === 'web') { state.player = null; state.liked = null; } }
  if ('scrobbleWatch' in clean) { state.scrobble = { status: clean.scrobbleWatch ? 'wait' : 'off', misses: 0, checked: 0 }; watchScrobble(); }
  if ('scrobbleOn' in clean || clean.scrobbleSources || clean.scrobbleBy) { scrob?.refreshStatus(); watchScrobble(); }
  // ligar/desligar o Web Scrobbler recarrega o player (as extensões entram quando o navegador abre)
  if ('webScrobbler' in clean && clean.webScrobbler !== wsWas) reloadPlayerForWs().catch((e) => log('scrobbles: recarregar player', e.message));
  else if ('blockAds' in clean && clean.blockAds !== adsWas) reloadPlayerForWs('ads').catch((e) => log('anúncios: recarregar player', e.message));
  else if (clean.scrobbleBy) syncWsConnectors().catch(() => {});
  // plataformas que passaram a abrir de outro jeito (p.ex. 'ws' manda para o Edge)
  for (const id of PL.ORDER) if (engineOf(id) !== engBefore[id]) switchEngine(id);
  if (clean.onePlayer) onlyPlayer(store.get('panelPlatform') || state.source || 'spotify');
  push();
  return store.public();
});
/** Recarrega o player do Edge para carregar (ou descarregar) as extensões (Web Scrobbler, uBlock Origin Lite) */
async function reloadPlayerForWs(why = 'ws') {
  wp.extensions = playerExtensions();
  if (!wp.running) return;
  const platform = store.get('panelPlatform');
  const wasPanel = store.get('panelOpen') && engineOf(platform) === 'edge';
  await wp.stop();
  await new Promise((r) => setTimeout(r, 400));
  if (engineWeb() || wasPanel) {
    await wp.start();
    if (wasPanel) { nativeArmed = false; if (win && !win.isDestroyed()) win.webContents.send('panel:reset'); await panelSet({ open: true, platform }); }
  }
  if (why === 'ads') toast({ id: 'ads', kind: 'ok', text: blockAdsOn() ? 'Bloqueio de anúncios ligado (uBlock Origin Lite no player e as listas do uBlock no app).' : 'Bloqueio de anúncios desligado.' });
  else toast({ id: 'ws', kind: 'ok', text: wsEnabled() ? 'Web Scrobbler ligado. Abra as opções para conectar suas contas.' : 'Web Scrobbler desligado.' });
}
handle('ws:options', async (page) => openWsOptions(page));
handle('overlay', async (open) => {
  if (open) {
    let shot = null;
    try {
      if (lfView && !state.mini && !state.overlay) {
        const img = await lfView.webContents.capturePage();
        const sz = img.getSize();
        if (sz.width) shot = img.resize({ width: Math.max(1, Math.round(sz.width / 2)) }).toDataURL();
      }
    } catch (_) { /* sem foto de fundo */ }
    state.overlay = true;
    layout();
    return shot;
  }
  state.overlay = false;
  removeHubView();
  layout();
  return null;
});
function removeHubView() {
  if (!hubView) return;
  try { win.contentView.removeChildView(hubView); hubView.webContents.close(); } catch (_) { /* já fechada */ }
  hubView = null;
}
handle('hub:settings', async (rect) => {
  if (!rect) { removeHubView(); return { ok: true }; }
  if (!hubExt) return { ok: false };
  if (!hubView) {
    hubView = new WebContentsView({ webPreferences: { session: lfSession, contextIsolation: true, sandbox: true } });
    hubView.setBackgroundColor('#121117'); // fundo opaco: com transparência o texto e os cartões do painel ficam borrados
    win.contentView.addChildView(hubView);
    const hw = hubView.webContents;
    hw.on('dom-ready', () => hw.insertCSS('#open{display:none!important}html,body{background:#121117!important}html{scrollbar-color:#34343c transparent}'));
    hw.setWindowOpenHandler(({ url }) => {
      if (isLastfm(url)) { lfView.webContents.loadURL(url); win.webContents.send('overlay:open', null); }
      else if (/^https:/.test(url)) openExternal(url);
      return { action: 'deny' };
    });
    hw.on('will-navigate', (e) => e.preventDefault());
    await hw.loadURL(`chrome-extension://${hubExt.id}/popup/popup.html`).catch(() => {});
  }
  hubView.setBounds({ x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) });
  return { ok: true };
});
handle('mini', () => false); // o modo mini era só a barra de baixo, que saiu
handle('copy', (text) => { clipboard.writeText(String(text || '')); });
handle('external', (url) => { if (/^https:\/\//.test(url)) openExternal(url); });
handle('open-data', () => shell.openPath(DATA));

/* Opções do tema (extensão) vistas do app: balões, animações, modo leve */
handle('ext:get', async () => {
  let r = await askLastfm('ext', { type: 'get' }, 6000).catch(() => null);
  if (!r) { await wait(1200); r = await askLastfm('ext', { type: 'get' }, 6000).catch(() => null); }
  return r && r.settings ? r.settings : null;
});
handle('ext:set', async (patch) => {
  const r = await askLastfm('ext', { type: 'set', patch: patch || {} }, 6000).catch(() => null);
  return r && r.settings ? r.settings : null;
});
/* Modos: desempenho (leve) ou experiência completa */
const PERF_EXT = { perf: { lite: true, animations: false, ambient: false, hoverCards: false }, full: { lite: false, animations: true, ambient: true, hoverCards: true } };
handle('perf:set', async (m) => {
  const modeName = m === 'perf' ? 'perf' : 'full';
  store.set({ perfMode: modeName });
  const r = await askLastfm('ext', { type: 'set', patch: PERF_EXT[modeName] }, 6000).catch(() => null);
  if (wp && wp.screen) { const sc = wp.screen; wp.startScreen(sc.pid, { width: sc.width, height: sc.height, dsf: sc.dsf, quality: modeName === 'perf' ? 55 : 82, nth: modeName === 'perf' ? 2 : 1 }); }
  if (modeName === 'perf') trimCaches();
  log('modo', modeName);
  push();
  return r && r.settings ? r.settings : null;
});
/* Limpar o cache (os logins e as configurações ficam) */
async function cacheBytes() {
  let total = 0;
  try { total += await lfSession.getCacheSize(); } catch (_) { /* sem cache */ }
  const part = path.join(app.getPath('sessionData'), 'Partitions', 'lastfm');
  for (const d of ['Code Cache', path.join('Service Worker', 'CacheStorage'), 'GPUCache', 'DawnGraphiteCache', 'DawnWebGPUCache']) total += folderBytes(path.join(part, d));
  if (wp) total += wp.cacheBytes();
  if (native) total += await native.cacheBytes();
  return total;
}
handle('cache:size', async () => ({ bytes: await cacheBytes() }));
handle('cache:clear', async () => {
  const before = await cacheBytes();
  try {
    await lfSession.clearCache();
    await lfSession.clearCodeCaches({}).catch(() => {});
    await lfSession.clearStorageData({ storages: ['cachestorage', 'shadercache'] }).catch(() => {});
  } catch (e) { log('limpar cache', e.message); }
  const ext = await askLastfm('ext', { type: 'clear-cache' }, 8000).catch(() => null);
  if (wp) await wp.trimCache(0).catch(() => {});
  if (native) await native.clearCaches(0).catch(() => {});
  colorCache.clear();
  const after = await cacheBytes();
  const freed = Math.max(0, before - after);
  log('cache limpo pelo usuário', Math.round(freed / MB), 'MB');
  return { ok: true, freed, after, items: (ext && ext.removed) || 0 };
});
/* Scrobbles pelo app (API do Last.fm) */
handle('lfm:keys', ({ key, secret } = {}) => ({ ok: !!scrob && scrob.setKeys(key, secret), info: scrob && scrob.info() }));
handle('lfm:create-key', () => { if (lfView) lfView.webContents.loadURL('https://www.last.fm/api/account/create'); return true; });
handle('lfm:auth', async () => {
  if (!scrob) return { ok: false };
  try {
    const r = await scrob.authorize(async (url) => { if (lfView) await lfView.webContents.loadURL(url).catch(() => {}); });
    toast({ id: 'lfm', kind: 'ok', text: `Scrobbles ligados: o app manda o que você ouve para o Last.fm de ${r.user || 'você'}.` });
    if (lfView) go('home');
    watchScrobble(); push();
    return { ok: true, info: scrob.info() };
  } catch (e) {
    toast({ id: 'lfm', kind: 'warn', text: e.code === 'timeout' ? 'A autorização do Last.fm não foi concluída. Tente de novo.' : `Last.fm: ${e.message}` });
    return { ok: false, text: e.message, info: scrob.info() };
  }
});
handle('lfm:cancel', () => { scrob?.cancelAuth(); return true; });
handle('lfm:logout', () => { scrob?.logout(); push(); return scrob?.info(); });
handle('lfm:forget', () => { scrob?.forget(); push(); return scrob?.info(); });

/* ------------------------------------------------------------------ *
 * Faxina do cache: o cache de páginas e capas tem teto (o próprio navegador descarta o mais antigo);
 * aqui o app confere também o cache de código, o de service workers e o do player escondido.
 * ------------------------------------------------------------------ */
function folderBytes(dir, limit = 30000) {
  let total = 0, n = 0;
  const walk = (d) => {
    let ents;
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (_) { return; }
    for (const e of ents) {
      if (++n > limit) return;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else { try { total += fs.statSync(p).size; } catch (_) { /* sumiu */ } }
    }
  };
  walk(dir);
  return total;
}
const MB = 1024 * 1024;
let trimming = false;
async function trimCaches() {
  if (trimming || !lfSession) return;
  trimming = true;
  try {
    const part = path.join(app.getPath('sessionData'), 'Partitions', 'lastfm');
    const http = await lfSession.getCacheSize().catch(() => 0);
    if (http > 160 * MB) { await lfSession.clearCache(); log('cache do Last.fm limpo', Math.round(http / MB), 'MB'); }
    const code = folderBytes(path.join(part, 'Code Cache'));
    if (code > 48 * MB) { await lfSession.clearCodeCaches({}).catch(() => {}); log('cache de código limpo', Math.round(code / MB), 'MB'); }
    const sw = folderBytes(path.join(part, 'Service Worker', 'CacheStorage'));
    const gpu = folderBytes(path.join(part, 'GPUCache')) + folderBytes(path.join(part, 'DawnGraphiteCache')) + folderBytes(path.join(part, 'DawnWebGPUCache'));
    if (sw > 64 * MB || gpu > 64 * MB) { await lfSession.clearStorageData({ storages: ['cachestorage', 'shadercache'] }).catch(() => {}); log('caches de service worker/GPU limpos', Math.round(sw / MB), Math.round(gpu / MB), 'MB'); }
    if (wp) await wp.trimCache(300 * MB);
    if (native) await native.clearCaches(250 * MB);
  } catch (e) { log('faxina do cache', e.message); } finally { trimming = false; }
}

/* ------------------------------------------------------------------ *
 * Autoteste (para conferir uma instalação: --self-test)
 * ------------------------------------------------------------------ */
async function selfTest() {
  const out = { version: VERSION, electron: process.versions.electron, platform: process.platform, dataDir: DATA, writable: writable(DATA), safeStorage: store.canEncrypt(), extension: !!hubExt };
  await wait(9000);
  try { out.lastfm = await lfView.webContents.executeJavaScript('({ url: location.href, themed: document.documentElement.classList.contains("lfx"), app: document.documentElement.dataset.lfxApp || "" })'); } catch (e) { out.lastfm = { error: e.message }; }
  try { const r = await net.fetch('https://accounts.spotify.com/', { method: 'HEAD' }); out.spotifyReachable = r.status < 500; } catch (e) { out.spotifyReachable = false; }
  fs.writeFileSync(path.join(DATA, 'autoteste.json'), JSON.stringify(out, null, 2));
  app.exit(0);
}

/* ------------------------------------------------------------------ *
 * Ciclo de vida
 * ------------------------------------------------------------------ */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.show(); win.focus();
  });
  app.whenReady().then(async () => {
    if (process.env.LFS_TEST_HOOKS) { try { testHooks = require(process.env.LFS_TEST_HOOKS); } catch (e) { log('hooks', e.message); } }
    store = new Store(DATA, safeStorage);
    // o som e os controles agora ficam só no painel à direita (o web player escondido): quem usava
    // o app do Spotify do computador passa para o player do painel
    if (store.get('engine') === 'desktop') { store.set({ engine: 'web' }); engineMoved = true; log('motor: do app do Spotify para o player do painel'); }
    sp = new Spotify({
      fetch: (url, init) => net.fetch(url, init),
      openExternal: (url) => openExternal(url),
      readSecret: () => store.readSecret(),
      writeSecret: (o) => store.writeSecret(o),
      onAuthChange: () => {
        if (!sp.connected) { clearTimeout(pollTimer); state.player = null; state.liked = null; state.color = null; lastItemId = undefined; seenFirst = false; }
        push();
      },
      onCallback: () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } },
    });
    sp.setClientId(store.get('clientId'));
    let cacheRoot = null;
    try { cacheRoot = path.join(app.getPath('cache'), 'Last.fm PRIME'); } catch (_) { cacheRoot = null; }
    winHelper = new WinHelper({ log });
    wp = new WebPlayer({ dataDir: DATA, cacheDir: cacheRoot, log, helper: winHelper, near: popupNear, extensions: playerExtensions() });
    wp.layouts = { ...(store.get('panelLayouts') || {}) };
    wp.on('extensions', () => { syncWsConnectors().catch(() => {}); push(); });
    scrob = new Scrobbler({ fetch: (u, init) => net.fetch(u, init), store, dataDir: DATA, log });
    scrob.on('change', () => { watchScrobble(); push(); });
    scrob.on('scrobbled', () => { watchScrobble(); push(); });
    wp.on('state', onWebState);
    wp.on('source', onSourceState);
    wp.on('change', push);
    wp.on('popup', onPopup);
    wp.on('external', ({ url }) => { if (/^https?:\/\//.test(url)) { openExternal(url); toast({ id: 'popup', kind: 'info', text: 'Abri o link no seu navegador.' }); } });
    wp.on('frame', (f) => {
      if (!win || win.isDestroyed()) return;
      win.webContents.send('panel:frame', { pid: f.pid, data: Buffer.from(f.data, 'base64'), w: f.meta && f.meta.deviceWidth, h: f.meta && f.meta.deviceHeight });
    });
    wp.on('closed', () => {
      if (quitting || !engineWeb()) return;
      toast({ id: 'player', kind: 'info', text: 'O player tinha fechado. Ele voltou a ligar sozinho.' });
      setTimeout(() => { if (!quitting) wp.start(); }, 1500);
    });
    if (store.get('panelOpen')) state.panelLayout = true;
    await createWindow();
    native = new NativePlayers({
      win, log, cleanUA, isLoginUrl, adHosts: AD_HOSTS, blockAds: blockAdsOn, attachAds: (ses, fallback) => { loadAdLists(); adblockSession(ses, { scripts: true, fallback }); },
      place: () => { const b = wp ? wp.placeFor({ width: 520, height: 700 }) : null; return b ? { x: b.left, y: b.top, width: b.width, height: b.height } : null; },
    });
    native.layouts = { ...(store.get('panelLayouts') || {}) };
    native.on('source', onSourceState);
    native.on('change', push);
    native.on('input', () => { lastPanelInput = Date.now(); });
    native.on('external', (url) => { if (/^https?:\/\//.test(url)) { openExternal(url); toast({ id: 'popup', kind: 'info', text: 'Abri o link no seu navegador.' }); } });
    native.on('popup', (ev) => { let host = ''; try { const u = new URL(ev.url || ''); host = u.hostname + u.pathname; } catch (_) { host = ''; } onPopup({ ...ev, host }); });
    native.on('autoplay', ({ pid, ok }) => {
      const name = PL.PLATFORMS[pid].name;
      toast(ok ? { id: 'play', kind: 'ok', text: `Tocando no ${name}, no painel ao lado.` } : { id: 'play', kind: 'info', text: `Abri a busca no ${name}: escolha a música no painel.` });
    });
    native.on('drm', (pid) => {
      const name = PL.PLATFORMS[pid].name;
      toast({ id: 'drm', kind: 'warn', text: `O ${name} pediu proteção de conteúdo (DRM), que não existe dentro do app. Se não tocar, abra ele pelo Edge.`, action: { label: 'Abrir pelo Edge', cmd: 'engine', pid, engine: 'edge' } });
    });
    native.on('fail', ({ pid, desc }) => { if (store.get('panelPlatform') === pid) toast({ id: 'play', kind: 'warn', text: `O ${PL.PLATFORMS[pid].name} não carregou (${desc}). Confira a internet e recarregue no painel.` }); });
    native.on('google', (pid) => onGoogleLogin(pid));
    if (testHooks?.ready) testHooks.ready({ win, lfView, state, store, sp, wp, native, trimCaches, scrob, panelSet, adblock, playerExtensions });
    push();
    if (sp.connected) { sp.loadMe().then(push, () => push()); schedulePoll(400); }
    if (engineMoved) setTimeout(() => toast({ id: 'engine', kind: 'info', text: 'Agora o Spotify toca no painel à direita: entre na sua conta ali, uma vez só.', action: { label: 'Abrir o painel', cmd: 'panel' } }), introView ? 4500 : 1200);
    prepareSpotify();
    powerMonitor.on('resume', () => schedulePoll(1500));
    // faxina do cache um pouco depois de abrir e a cada 6 horas com o app aberto
    setTimeout(trimCaches, Number(process.env.LFS_TRIM_DELAY) || 90 * 1000);
    setInterval(trimCaches, 6 * 3600 * 1000).unref?.();
    if (SELFTEST) selfTest();
  });
  app.on('before-quit', (e) => {
    try { store?.flush(); } catch (_) { /* ignorado */ }
    closeSpotifyIfOurs();
    // fecha o web player escondido junto (a música para quando o app fecha)
    if (!quitting && wp && wp.proc) {
      quitting = true;
      e.preventDefault();
      wp.stop().finally(() => app.quit());
      return;
    }
    quitting = true;
  });
  app.on('window-all-closed', () => app.quit());
  app.on('will-quit', () => { try { winHelper?.stop(); } catch (_) { /* já fechou */ } });
}

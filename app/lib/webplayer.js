'use strict';
/* O web player do Spotify rodando por trás do app.
 * Abre o Microsoft Edge (que já vem no Windows e toca conteúdo protegido) num perfil só do app,
 * com o web player do Spotify, e esconde a janela. O app conversa com ele pelo protocolo de
 * depuração do navegador: por um pipe (sem porta de rede) ou, se o pipe falhar, por uma porta
 * só do 127.0.0.1. Funciona na conta grátis e na Premium. */
const { EventEmitter } = require('events');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { CDP } = require('./cdp');
const { source: BRIDGE } = require('./bridge');
const { source: MEDIA_BRIDGE } = require('./bridge-media');
const { PLATFORMS } = require('./platforms');
const winhide = require('./winhide');

const BASE = (process.env.LFS_PLAYER_URL || 'https://open.spotify.com').replace(/\/$/, '');
const LOGIN = process.env.LFS_PLAYER_LOGIN || 'https://accounts.spotify.com/login?continue=https%3A%2F%2Fopen.spotify.com%2F';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// janelas abertas pelas páginas que ficam no app (login, autorização, verificação); o resto (links comuns) vai para o seu navegador
const LOGIN_HOSTS = /(^|\.)(facebook\.com|fb\.com|messenger\.com|google\.com|gstatic\.com|youtube\.com|apple\.com|icloud\.com|spotify\.com|scdn\.co|deezer\.com|tidal\.com|soundcloud\.com|live\.com|microsoftonline\.com|microsoft\.com|amazon\.com|x\.com|twitter\.com|recaptcha\.net|hcaptcha\.com|arkoselabs\.com|127\.0\.0\.1)$/i;
const LOGIN_PATH = /log-?in|oauth|auth|sign-?in|sign-?up|sso|connect|consent|account|captcha|verif|challenge|password/i;
function isLoginUrl(url) {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return true;
    if (LOGIN_HOSTS.test(u.hostname) || LOGIN_PATH.test(u.pathname)) return true;
    return Object.values(PLATFORMS).some((p) => (p.hosts || []).some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`)));
  } catch (_) { return true; }
}
// pastas de cache do perfil do player que podem ser apagadas sem perder o login
const PROFILE_CACHES = [
  ['Default', 'Cache'], ['Default', 'Code Cache'], ['Default', 'GPUCache'], ['Default', 'DawnGraphiteCache'], ['Default', 'DawnWebGPUCache'],
  ['Default', 'Service Worker', 'CacheStorage'], ['Default', 'Service Worker', 'ScriptCache'], ['GrShaderCache'], ['ShaderCache'], ['GraphiteDawnCache'],
];

/** Onde o Windows diz que o programa está instalado (registro "App Paths"), para instalações fora do padrão */
const appPathCache = {};
function appPath(exe) {
  if (exe in appPathCache) return appPathCache[exe];
  let found = null;
  for (const hive of ['HKLM', 'HKCU']) {
    try {
      const out = execFileSync('reg', ['query', `${hive}\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\${exe}`, '/ve'], { windowsHide: true, timeout: 4000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
      const m = out.match(/REG_SZ\s+(.+\.exe)/i);
      if (m) { found = m[1].trim().replace(/^"|"$/g, ''); break; }
    } catch (_) { /* não registrado aqui */ }
  }
  appPathCache[exe] = found;
  return found;
}
function candidates() {
  const env = process.env;
  const list = [];
  if (env.LFS_PLAYER_BROWSER) list.push({ exe: env.LFS_PLAYER_BROWSER, name: 'Navegador de teste' });
  if (process.platform === 'win32') {
    const pf86 = env['ProgramFiles(x86)'], pf = env.ProgramFiles, local = env.LOCALAPPDATA;
    for (const base of [pf86, pf, local].filter(Boolean)) list.push({ exe: path.join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe'), name: 'Microsoft Edge' });
    list.push({ exe: () => appPath('msedge.exe'), name: 'Microsoft Edge' });
    for (const base of [pf, pf86, local].filter(Boolean)) list.push({ exe: path.join(base, 'Google', 'Chrome', 'Application', 'chrome.exe'), name: 'Google Chrome' });
    list.push({ exe: () => appPath('chrome.exe'), name: 'Google Chrome' });
  }
  return list;
}

function dirSize(dir, limit = 20000) {
  let total = 0, n = 0;
  const walk = (d) => {
    let ents;
    try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch (_) { return; }
    for (const e of ents) {
      if (++n > limit) return;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else { try { total += fs.statSync(p).size; } catch (_) { /* sumiu */ } }
    }
  };
  walk(dir);
  return total;
}

class WebPlayer extends EventEmitter {
  constructor({ dataDir, cacheDir, log, helper = null, near = null, extensions = [] }) {
    super();
    this.helper = helper;      // lfprime-janelas.exe (tira as janelas da barra de tarefas); sem ele, PowerShell
    this.near = near;          // () => onde a janela do app está (para centralizar janelas de login nela)
    this.popups = new Map();   // janelas abertas pelas páginas (login do Facebook, Google, Apple…), mostradas na tela
    this.asleep = false;       // o Spotify "descansando" numa página em branco enquanto outra plataforma toca
    this.extensions = Array.isArray(extensions) ? extensions : [];  // extensões no player (o Web Scrobbler): [{ id, path, name }]
    this.extSids = {};         // sessão do "serviço" de cada extensão (para ler/gravar as opções)
    this.extLoaded = {};
    this.ownIds = new Set();   // páginas que o próprio app abriu (as outras, abertas pelo navegador ou por extensões, vão para a tela)
    this.ownPending = 0;
    this.dataDir = dataDir;
    this.cacheDir = cacheDir;
    this.log = log || (() => {});
    this.profile = path.join(dataDir, 'spotify-player');
    this.proc = null;
    this.cdp = null;
    this.sid = null;
    this.targetId = null;
    this.windowId = null;
    this.handles = [];
    this.state = null;
    this.status = 'off'; // off | starting | on | error
    this.error = '';
    this.detail = '';
    this.visible = false;
    this.starting = null;
    this.stopping = false;
    this.transport = this.readPrefs().transport === 'port' ? 'port' : 'pipe';
    this.sources = new Map();  // outras plataformas (YouTube Music, Deezer…), cada uma na sua janela
    this.screen = null;        // o que o painel do app está mostrando agora
    this.layouts = {};         // 'mobile' | 'desktop' por plataforma
    this.cacheLimit = 300 * 1024 * 1024;
  }

  readPrefs() { try { return JSON.parse(fs.readFileSync(path.join(this.dataDir, 'spotify-player.json'), 'utf8')) || {}; } catch (_) { return {}; } }
  writePrefs(p) { try { fs.writeFileSync(path.join(this.dataDir, 'spotify-player.json'), JSON.stringify({ ...this.readPrefs(), ...p })); } catch (_) { /* sem disco */ } }

  browser() {
    if (this.found && fs.existsSync(this.found.exe)) return this.found;
    for (const c of candidates()) {
      const exe = typeof c.exe === 'function' ? c.exe() : c.exe;
      if (!exe) continue;
      try { fs.accessSync(exe); this.found = { exe, name: c.name }; return this.found; } catch (_) { /* próximo */ }
    }
    this.found = null;
    return null;
  }
  get available() { return !!this.browser(); }
  get running() { return this.status === 'on' && !!this.cdp && !this.cdp.closed; }

  info() {
    const b = this.browser();
    return { available: !!b, browser: b ? b.name : '', status: this.status, error: this.error, detail: this.detail, visible: this.visible, shown: this.shownPid || null, asleep: this.asleep, popups: this.popups.size, loggedIn: this.state ? this.state.loggedIn : null, ready: !!(this.state && this.state.ready) };
  }

  /** Liga o player (escondido, a não ser que show seja true) */
  start({ show = false, near = null } = {}) {
    if (this.running) { if (show) return this.show(null, { near }); return Promise.resolve(true); }
    if (this.starting) return this.starting.then((ok) => (ok && show ? this.show(null, { near }).then(() => ok) : ok));
    this.starting = this._start(show, near).finally(() => { this.starting = null; });
    return this.starting;
  }

  async _start(show, near) {
    const b = this.browser();
    if (!b) { this.fail('nobrowser', 'Edge não encontrado'); return false; }
    this.status = 'starting'; this.error = ''; this.detail = ''; this.stopping = false;
    this.emit('change');
    await this.killStale(b);
    // antes de abrir (com o navegador fechado as pastas de cache podem ser apagadas sem perder o login)
    try { await this.trimCache(this.cacheLimit); } catch (_) { /* segue */ }
    let ok = await this.launch(b, this.transport);
    if (!ok && this.transport === 'pipe' && !this.stopping) {
      // alguns computadores bloqueiam o pipe: tenta pela porta local
      this.log('player: pipe falhou, tentando pela porta local', this.detail);
      await this.killStale(b);
      ok = await this.launch(b, 'port');
      if (ok) { this.transport = 'port'; this.writePrefs({ transport: 'port' }); }
    }
    if (!ok) { this.emit('change'); return false; }
    this.status = 'on'; this.error = ''; this.detail = '';
    this.emit('change');
    this.log('player: ligado', b.name, this.transport);
    // carrega as extensões (o Web Scrobbler) agora que o player já está "ligado"
    if (this.extensions.length) this.ensureExtensions().catch((e) => this.log('player: extensões', e.message));
    if (show) await this.show(null, { near });
    else this.hideSoon();
    return true;
  }

  fail(code, detail) {
    this.status = 'error'; this.error = code; this.detail = String(detail || '').slice(0, 300);
    this.log('player: erro', code, this.detail);
    this.emit('change');
  }

  async launch(b, transport) {
    const args = [
      transport === 'pipe' ? '--remote-debugging-pipe' : '--remote-debugging-port=0',
      `--user-data-dir=${this.profile}`,
      '--no-first-run', '--no-default-browser-check', '--hide-crash-restore-bubble', '--disable-sync',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1180,800', '--window-position=-20000,-20000',
      `--app=${BASE}/`,
    ];
    if (transport === 'port') args.push('--remote-debugging-address=127.0.0.1');
    // no Windows, uma janela fora da tela conta como "coberta" e o navegador para de desenhar a página:
    // sem isto, o painel do app fica sem imagem (o som continua, mas você não vê nada)
    const features = ['CalculateNativeWinOcclusion'];
    // extensões do app (o Web Scrobbler): pela linha de comando e, se o navegador não aceitar, pelo protocolo de depuração
    const exts = this.extensions.filter((e) => e && e.path && fs.existsSync(path.join(e.path, 'manifest.json')));
    if (exts.length) {
      args.push('--enable-unsafe-extension-debugging', `--load-extension=${exts.map((e) => e.path).join(',')}`);
    }
    args.push(`--disable-features=${features.join(',')}`);
    if (this.cacheDir) args.push(`--disk-cache-dir=${path.join(this.cacheDir, 'player-cache')}`, '--disk-cache-size=67108864', '--media-cache-size=33554432');
    if (process.env.LFS_PLAYER_HEADLESS) args.unshift('--headless=new');
    if (process.env.LFS_PLAYER_NOSANDBOX) args.unshift('--no-sandbox');
    const portFile = path.join(this.profile, 'DevToolsActivePort');
    try { fs.rmSync(portFile, { force: true }); } catch (_) { /* não havia */ }
    let proc;
    try {
      proc = spawn(b.exe, args, { stdio: transport === 'pipe' ? ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] : 'ignore', windowsHide: false });
    } catch (e) { this.fail('spawn', e.message); return false; }
    this.proc = proc;
    this.asleep = false;
    // o ajudante passa a cuidar das janelas deste navegador desde já (a primeira janela nem chega à barra de tarefas)
    if (this.helper && process.platform === 'win32') this.helper.watch(proc.pid);
    try { fs.mkdirSync(this.dataDir, { recursive: true }); fs.writeFileSync(path.join(this.dataDir, 'spotify-player.pid'), String(proc.pid)); } catch (_) { /* sem disco */ }
    let exited = false;
    proc.on('exit', (code) => { exited = true; if (this.status === 'starting') this.detail = `o navegador fechou (código ${code})`; this.onExit(proc); });
    proc.on('error', (e) => { exited = true; this.detail = e.message; this.onExit(proc); });
    try {
      let cdp;
      if (transport === 'pipe') cdp = CDP.pipe(proc.stdio[3], proc.stdio[4]);
      else {
        let url = null;
        for (let i = 0; i < 80 && !url && !exited; i++) {
          await wait(250);
          try { const [port, p] = fs.readFileSync(portFile, 'utf8').split(/\r?\n/); if (Number(port) > 0 && p) url = `ws://127.0.0.1:${Number(port)}${p.trim()}`; } catch (_) { /* ainda não */ }
        }
        if (!url) throw new Error(exited ? (this.detail || 'o navegador fechou') : 'sem porta de depuração');
        cdp = await CDP.websocket(url);
      }
      this.cdp = cdp;
      cdp.on('close', () => this.onExit(proc));
      cdp.on('Runtime.bindingCalled', (p, sid) => {
        if (p.name !== '__lfsPush') return;
        let st;
        try { st = JSON.parse(p.payload); } catch (_) { return; }
        if (sid === this.sid) { if (this.asleep) return; this.state = st; this.emit('state', st); this.emit('source', 'spotify', st); return; }
        for (const src of this.sources.values()) if (src.sid === sid) { src.state = st; this.emit('source', src.pid, st); return; }
      });
      cdp.on('Page.screencastFrame', (p, sid) => this.onFrame(p, sid));
      // alertas e "deseja sair desta página?" das páginas escondidas: aceita sozinho para nada ficar travado sem você ver
      cdp.on('Page.javascriptDialogOpening', (p, sid) => { cdp.send('Page.handleJavaScriptDialog', { accept: true }, sid).catch(() => {}); });
      cdp.on('Target.targetCreated', (p) => { this.onTargetCreated(p.targetInfo).catch((e) => this.log('player: janela à parte', e.message)); });
      cdp.on('Target.targetDestroyed', (p) => {
        if (p.targetId === this.targetId) {
          this.log('player: página fechada');
          // você fechou a janela do Spotify (mostrada à parte): o navegador continua com as outras plataformas,
          // então o Spotify volta a abrir escondido, sem precisar reiniciar nada
          this.visible = false;
          if (this.shownPid === 'spotify') this.shownPid = null;
          if (this.screen && this.screen.sid === this.sid) this.screen = null;
          this.targetId = null; this.sid = null; this.windowId = null; this.state = null;
          if (this.cdp === cdp && !this.stopping) setTimeout(() => { if (this.cdp === cdp && !this.sid) this.reopenMain().catch((e) => this.log('player: não reabriu o Spotify', e.message)); }, 400);
          this.emit('change');
        }
        const pop = this.popups.get(p.targetId);
        if (pop) {
          this.popups.delete(p.targetId);
          this.log('player: janela à parte fechada');
          this.emit('popup', { open: false, pid: pop.pid, count: this.popups.size });
          this.emit('change');
        }
        for (const src of this.sources.values()) {
          if (src.targetId !== p.targetId) continue;
          this.sources.delete(src.pid);
          if (this.shownPid === src.pid) this.shownPid = null;
          if (this.screen && this.screen.sid === src.sid) this.screen = null;
          this.emit('source', src.pid, null);
          this.emit('change');
        }
      });
      await this.attach();
      return true;
    } catch (e) {
      this.fail('attach', `${transport}: ${e.message}`);
      this.cdp = null;
      if (this.proc === proc) { try { proc.kill(); } catch (_) { /* já saiu */ } }
      await new Promise((r) => { if (exited) r(); else { proc.once('exit', r); setTimeout(r, 3000); } });
      return false;
    }
  }

  async attach() {
    const c = this.cdp;
    let target = null;
    for (let i = 0; i < 60 && !target; i++) {
      const { targetInfos = [] } = await c.send('Target.getTargets', {}, undefined, 12000);
      target = targetInfos.find((t) => t.type === 'page' && t.url.startsWith(BASE)) || targetInfos.find((t) => t.type === 'page' && !t.url.startsWith('chrome-extension:'));
      if (!target) await wait(250);
    }
    if (!target) throw new Error('sem página');
    await this.attachMain(target.targetId);
  }
  /* ---------------- Extensões (o Web Scrobbler) ---------------- */
  async extensionAlive(id) {
    try {
      const { targetInfos = [] } = await this.cdp.send('Target.getTargets', {});
      return targetInfos.some((t) => (t.url || '').startsWith(`chrome-extension://${id}/`));
    } catch (_) { return false; }
  }
  /** Espera a extensão aparecer (o serviço dela registra pouco depois do navegador abrir) */
  async waitExtension(id, ms = 8000) {
    const t = Date.now();
    while (Date.now() - t < ms) {
      if (!this.running) return false;
      if (await this.extensionAlive(id)) return true;
      await wait(300);
    }
    return false;
  }
  async ensureExtensions() {
    for (const e of this.extensions) {
      if (!this.running) return;
      await wait(300);
      // pela linha de comando (--load-extension) ela já pode estar entrando; se não, carrega pelo protocolo
      if (!(await this.extensionAlive(e.id))) {
        try { await this.cdp.send('Extensions.loadUnpacked', { path: e.path }, undefined, 20000); }
        catch (err) { if (!/already|installed/i.test(err.message)) this.log('player: extensão', e.name || e.id, err.message); }
      }
      // confirma pela presença de verdade do serviço dela (vale tanto pela linha de comando quanto pelo protocolo)
      const alive = await this.waitExtension(e.id, 9000);
      this.extLoaded[e.id] = alive;
      this.log('player: extensão', e.name || e.id, alive ? 'ligada' : 'não carregou');
    }
    this.emit('extensions', { ...this.extLoaded });
    this.emit('change');
  }
  /** Liga-se ao "serviço" da extensão (o service worker) para ler/gravar as opções dela por ali */
  async extWorkerSid(id) {
    const cached = this.extSids && this.extSids[id];
    if (cached) { try { await this.cdp.send('Runtime.evaluate', { expression: '1' }, cached, 2000); return cached; } catch (_) { /* caiu: reatacha */ } }
    const { targetInfos = [] } = await this.cdp.send('Target.getTargets', {});
    const sw = targetInfos.find((t) => t.type === 'service_worker' && (t.url || '').includes(`chrome-extension://${id}/`));
    if (!sw) throw new Error('serviço da extensão não encontrado');
    const { sessionId } = await this.cdp.send('Target.attachToTarget', { targetId: sw.targetId, flatten: true });
    (this.extSids || (this.extSids = {}))[id] = sessionId;
    return sessionId;
  }
  async extEval(id, expr) {
    const sid = await this.extWorkerSid(id);
    const r = await this.cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }, sid, 8000);
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text || 'erro na extensão');
    return r.result ? r.result.value : undefined;
  }
  /** Lê/grava o armazenamento de uma extensão (as opções do Web Scrobbler) pelo chrome.storage dela */
  async extStorageGet(id, area, key) {
    return this.extEval(id, `chrome.storage.${area}.get(${JSON.stringify(key)}).then((o) => o[${JSON.stringify(key)}] ?? null)`);
  }
  async extStorageSet(id, area, key, value) {
    await this.extEval(id, `chrome.storage.${area}.set(${JSON.stringify({ [key]: value })}).then(() => 'ok')`);
  }
  /** Abre a página de opções de uma extensão numa janela de verdade, na frente do app */
  async openExtensionPage(id, page = 'src/ui/options/index.html') {
    return this.openWindow(`chrome-extension://${id}/${page}`, { width: 1040, height: 800, kind: 'page', pid: 'ext' });
  }
  /** Abre uma página (as opções de uma extensão, um login) numa janela de verdade, na frente do app */
  async openWindow(url, { width = 980, height = 760, kind = 'page', pid = 'page' } = {}) {
    if (!this.running) { const ok = await this.start(); if (!ok) return null; }
    const c = this.cdp;
    const b = this.placeFor({ width, height, maxWidth: width, maxHeight: height });
    let created;
    try { created = await this.createOwn({ url, newWindow: true, left: b.left, top: b.top, width: b.width, height: b.height }); } catch (e) { this.log('player: janela não abriu', e.message); return null; }
    const pop = { targetId: created.targetId, pid, url, windowId: null, kind };
    this.popups.set(created.targetId, pop);
    try { pop.windowId = (await c.send('Browser.getWindowForTarget', { targetId: created.targetId })).windowId; } catch (_) { pop.windowId = null; }
    await this.placeWindow(pop.windowId, b);
    await this.bringFront();
    this.emit('popup', { open: true, pid, url, kind, count: this.popups.size });
    this.emit('change');
    return pop;
  }
  async closeTarget(targetId) { if (this.cdp) await this.cdp.send('Target.closeTarget', { targetId }).catch(() => {}); }
  /** Abre o Target pelo app (assim ele sabe que a página é dele e não a mostra como janela à parte) */
  async createOwn(params) {
    this.ownPending++;
    try {
      const r = await this.cdp.send('Target.createTarget', params).catch((e) => {
        // navegadores mais antigos não aceitam a posição: tenta sem ela
        if (params.left === undefined) throw e;
        const { left, top, width, height, ...rest } = params; void left; void top; void width; void height;
        return this.cdp.send('Target.createTarget', rest);
      });
      this.ownIds.add(r.targetId);
      return r;
    } finally { this.ownPending--; }
  }

  /** Liga a página principal (a do Spotify) ao app: ponte, avisos de janelas novas e versão de celular */
  async attachMain(targetId) {
    const c = this.cdp;
    const target = { targetId };
    this.targetId = targetId;
    const { sessionId } = await c.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
    this.sid = sessionId;
    await c.send('Runtime.enable', {}, sessionId);
    await c.send('Page.enable', {}, sessionId);
    await c.send('Runtime.addBinding', { name: '__lfsPush' }, sessionId);
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: BRIDGE }, sessionId);
    await c.send('Runtime.evaluate', { expression: BRIDGE }, sessionId).catch(() => {});
    // avisa quando uma página abre outra janela (login com Facebook, Google, Apple…)
    await c.send('Target.setDiscoverTargets', { discover: true }).catch(() => {});
    try { const w = await c.send('Browser.getWindowForTarget', { targetId: target.targetId }); this.windowId = w.windowId; } catch (_) { this.windowId = null; }
    if (this.layouts.spotify === 'mobile') { await this.applyLayout({ sid: sessionId }, 'mobile'); await c.send('Page.reload', {}, sessionId).catch(() => {}); }
  }
  /** A página do Spotify foi fechada mas o navegador continua: abre outra, escondida */
  async reopenMain() {
    const c = this.cdp;
    if (!c || !this.running) return;
    const off = process.env.LFS_PLAYER_HEADLESS ? {} : { left: -20000, top: -20000, width: 1000, height: 900 };
    const { targetId } = await this.createOwn({ url: 'about:blank', newWindow: true, background: true, ...off });
    await this.attachMain(targetId);
    await this.parkWindows();
    await c.send('Page.navigate', { url: this.asleep ? 'about:blank' : `${BASE}/` }, this.sid).catch(() => {});
    this.log('player: Spotify reaberto escondido');
    this.emit('change');
  }

  onExit(proc) {
    if (proc !== this.proc) return;
    const was = this.status;
    this.proc = null; this.cdp = null; this.sid = null; this.handles = []; this.visible = false; this.asleep = false;
    this.extSids = {}; this.extLoaded = {}; this.ownIds = new Set(); this.ownPending = 0; this.discoverAt = 0;
    for (const src of this.sources.values()) this.emit('source', src.pid, null);
    this.sources.clear(); this.screen = null;
    if (this.popups.size) { this.popups.clear(); this.emit('popup', { open: false, count: 0 }); }
    if (was !== 'starting' && was !== 'error') this.status = 'off';
    if (this.state) this.state = { ...this.state, playing: false };
    try { fs.rmSync(path.join(this.dataDir, 'spotify-player.pid'), { force: true }); } catch (_) { /* ignorado */ }
    this.emit('change');
    if (was === 'on' && !this.stopping) { this.log('player: o navegador fechou'); this.emit('closed'); }
  }

  /** Um player que ficou aberto de antes (o app foi encerrado à força) prende o perfil: fecha ele */
  async killStale(b) {
    const pidFile = path.join(this.dataDir, 'spotify-player.pid');
    let pid = 0;
    try { pid = Number(fs.readFileSync(pidFile, 'utf8')); } catch (_) { return; }
    try { fs.rmSync(pidFile, { force: true }); } catch (_) { /* ignorado */ }
    if (!pid || (this.proc && this.proc.pid === pid)) return;
    if (process.platform === 'win32') {
      // só encerra se o número ainda for de um navegador (o Windows reaproveita números de processo)
      const img = await winhide.imageName(pid);
      if (!img || img !== path.basename(b.exe).toLowerCase()) return;
    }
    try { process.kill(pid); this.log('player: fechado um player antigo', pid); await wait(800); } catch (_) { /* já não existia */ }
  }
  kill() { try { this.proc && this.proc.kill(); } catch (_) { /* já saiu */ } }

  async stop() {
    this.stopping = true;
    if (!this.proc) { if (this.status === 'error') { this.status = 'off'; this.emit('change'); } return; }
    const proc = this.proc;
    try { await this.cdp.send('Browser.close', {}, undefined, 3000); } catch (_) { /* fecha à força */ }
    await new Promise((r) => { if (!this.proc) r(); else { proc.once('exit', r); setTimeout(r, 2500); } });
    if (this.proc === proc) { try { proc.kill(); } catch (_) { /* já saiu */ } }
  }

  /* ---------------- Janela ---------------- */
  hideSoon() {
    // a janela pode demorar a aparecer num computador mais lento: tenta algumas vezes
    let tries = 0;
    const go = async () => {
      if (!this.running || this.visible) return;
      const n = await this.hide();
      if (!n && ++tries < 6) setTimeout(go, 1000);
    };
    setTimeout(go, 600);
  }
  /** "Estaciona" as janelas do player fora da tela, sem botão na barra de tarefas. Elas continuam
   *  "visíveis" para o navegador (nada de economia que pare a imagem ou o som), mas você não as vê:
   *  quem mostra o player é o painel do app. As janelas de login abertas pelas páginas ficam na tela.
   *  Devolve quantas janelas foram estacionadas. */
  async parkWindows() {
    if (!this.running) return 0;
    if (process.env.LFS_PLAYER_HEADLESS) return 1;
    const ids = [];
    if (!this.visible && this.windowId) ids.push(this.windowId);
    for (const src of this.sources.values()) if (src.windowId && !src.shown) ids.push(src.windowId);
    for (const id of new Set(ids)) {
      await this.cdp.send('Browser.setWindowBounds', { windowId: id, bounds: { windowState: 'normal' } }).catch(() => {});
      await this.cdp.send('Browser.setWindowBounds', { windowId: id, bounds: { left: -20000, top: -20000, width: 1000, height: 900 } }).catch(() => {});
    }
    if (process.platform === 'win32') {
      const pid = this.proc && this.proc.pid;
      // o ajudante tira da barra de tarefas tudo o que estiver fora da tela (e na hora em que aparece)
      if (this.helper && (await this.helper.ready(1500))) { this.helper.watch(pid); this.helper.sweep(); }
      else await winhide.park(pid);
    }
    return new Set(ids).size;
  }
  async hide() {
    if (!this.running) return 0;
    this.visible = false;
    this.shownPid = null;
    for (const src of this.sources.values()) src.shown = false;
    const n = await this.parkWindows();
    this.emit('change');
    return n;
  }
  /** Onde abrir uma janela na tela: centralizada no app (ou num lugar visível, sem o app por perto) */
  placeFor(want = {}, near = null) {
    near = near && near.width ? near : (typeof this.near === 'function' && this.near()) || { x: 80, y: 60, width: 1240, height: 880 };
    const width = Math.round(Math.max(420, Math.min(want.width || 560, want.maxWidth || 980, Math.max(420, near.width - 40))));
    const height = Math.round(Math.max(520, Math.min(want.height || 720, want.maxHeight || 900, Math.max(520, near.height - 40))));
    return { left: Math.round(near.x + (near.width - width) / 2), top: Math.round(near.y + Math.max(0, (near.height - height) / 2)), width, height };
  }
  async placeWindow(windowId, bounds) {
    if (!windowId || !this.cdp) return;
    await this.cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } }).catch(() => {});
    await this.cdp.send('Browser.setWindowBounds', { windowId, bounds }).catch(() => {});
  }
  /** Põe na frente as janelas do player que estão na tela (por cima do app) */
  async bringFront() {
    if (process.platform !== 'win32' || process.env.LFS_PLAYER_HEADLESS) return;
    if (this.helper && (await this.helper.ready(1500))) { this.helper.front(); return; }
    await winhide.front(this.proc && this.proc.pid);
  }
  /** Mostra a janela de verdade de uma plataforma (para quando o painel não der conta, como num login difícil) */
  async show(url, { near = null, pid = 'spotify' } = {}) {
    if (!this.running) { const ok = await this.start(); if (!ok) return; }
    if (pid === 'spotify' && this.asleep) await this.wake(url);
    else if (url) { if (pid === 'spotify') await this.navigate(url); }
    const src = pid === 'spotify' ? this.src('spotify') : await this.openSource(pid, url);
    if (!src) return;
    if (pid === 'spotify') this.visible = true; else { const real = this.sources.get(pid); if (real) real.shown = true; }
    this.shownPid = pid;
    // a janela de verdade mostra a página no tamanho dela (o painel deixa de mostrar enquanto isso)
    if (this.screen && this.screen.sid === src.sid) await this.stopScreen();
    await this.cdp.send('Emulation.clearDeviceMetricsOverride', {}, src.sid).catch(() => {});
    await this.placeWindow(src.windowId, this.placeFor({ width: 1180, height: 820, maxWidth: 1180, maxHeight: 820 }, near));
    if (src.sid) this.cdp.send('Page.bringToFront', {}, src.sid).catch(() => {});
    await this.bringFront();
    this.emit('change');
  }
  /** Uma página abriu outra janela. Login (Facebook, Google, Apple…): mostra na tela, na frente do app.
   *  Link comum (a página de um artista, uma ajuda): abre no seu navegador, sem janela nova do player. */
  async onTargetCreated(t) {
    if (!t || t.type !== 'page' || !t.openerId || this.popups.has(t.targetId)) return;
    const c = this.cdp;
    const ours = (id) => id === this.targetId || [...this.sources.values()].some((x) => x.targetId === id);
    // páginas que o próprio app abriu (as opções do Web Scrobbler, p.ex.) já são tratadas na hora em que as abre
    if (ours(t.targetId) || this.ownIds.has(t.targetId)) return;
    const openerPop = this.popups.get(t.openerId);
    let pid = openerPop ? openerPop.pid : 'spotify';
    for (const x of this.sources.values()) if (x.targetId === t.openerId) pid = x.pid;
    const pop = { targetId: t.targetId, pid, url: t.url || '', windowId: null };
    this.popups.set(t.targetId, pop);
    // o endereço de verdade chega logo depois (window.open começa em branco)
    for (let i = 0; i < 15 && (!pop.url || pop.url === 'about:blank') && this.popups.has(t.targetId) && this.cdp === c; i++) {
      await wait(100);
      try { pop.url = (await c.send('Target.getTargetInfo', { targetId: t.targetId })).targetInfo.url || ''; } catch (_) { break; }
    }
    if (!this.popups.has(t.targetId) || this.cdp !== c) return;
    if (pop.url && pop.url !== 'about:blank' && !isLoginUrl(pop.url)) {
      this.popups.delete(t.targetId);
      await c.send('Target.closeTarget', { targetId: t.targetId }).catch(() => {});
      this.log('player: link aberto no navegador', pid);
      this.emit('external', { url: pop.url, pid });
      return;
    }
    let w = null;
    for (let i = 0; i < 20 && !w && this.cdp === c && this.popups.has(t.targetId); i++) {
      try { w = await c.send('Browser.getWindowForTarget', { targetId: t.targetId }, undefined, 4000); } catch (_) { await wait(100); }
    }
    if (!w || !this.popups.has(t.targetId)) return;
    const known = new Set([this.windowId, ...[...this.sources.values()].map((x) => x.windowId)].filter(Boolean));
    if (known.has(w.windowId)) {
      // abriu como aba dentro de uma janela escondida do player: reabre o endereço numa janela à parte, na tela
      const url = pop.url;
      this.popups.delete(t.targetId);
      await c.send('Target.closeTarget', { targetId: t.targetId }).catch(() => {});
      if (!url || url === 'about:blank') return;
      const b = this.placeFor({ width: 640, height: 760 });
      let created;
      try { created = await c.send('Target.createTarget', { url, newWindow: true, left: b.left, top: b.top, width: b.width, height: b.height }).catch(() => c.send('Target.createTarget', { url, newWindow: true })); } catch (_) { return; }
      const np = { targetId: created.targetId, pid, url, windowId: null };
      this.popups.set(created.targetId, np);
      try { np.windowId = (await c.send('Browser.getWindowForTarget', { targetId: created.targetId })).windowId; } catch (_) { np.windowId = null; }
      await this.placeWindow(np.windowId, b);
    } else {
      pop.windowId = w.windowId;
      const b = w.bounds || {};
      await this.placeWindow(w.windowId, this.placeFor({ width: b.width > 200 ? b.width : 560, height: b.height > 200 ? b.height : 720 }));
    }
    await this.bringFront();
    let host = '';
    try { const u = new URL(pop.url); host = u.hostname + u.pathname; } catch (_) { host = ''; }
    this.log('player: janela à parte aberta', pid, host.split('/')[0]);
    this.emit('popup', { open: true, pid, url: pop.url, host, count: this.popups.size });
    this.emit('change');
  }
  /** Traz de novo para a frente as janelas à parte (se ficaram atrás de alguma coisa) */
  async frontPopups() {
    for (const pop of this.popups.values()) if (pop.windowId) await this.placeWindow(pop.windowId, this.placeFor({ width: 560, height: 720 }));
    await this.bringFront();
  }
  async login(near) {
    await this.show(LOGIN, { near });
  }
  get loginUrl() { return LOGIN; }

  /* ---------------- Outras plataformas ---------------- */
  /** A aba de uma plataforma (o Spotify é a janela principal) */
  src(pid) {
    if (pid === 'spotify') return this.sid ? { pid, sid: this.sid, targetId: this.targetId, windowId: this.windowId, state: this.state } : null;
    return this.sources.get(pid) || null;
  }
  /** Abre (ou reaproveita) a aba de uma plataforma; com url, vai para esse endereço */
  async openSource(pid, url) {
    const P = PLATFORMS[pid];
    if (!P) return null;
    if (!this.running) { const ok = await this.start(); if (!ok) return null; }
    if (pid === 'spotify') { if (url) await this.navigate(url); return this.src('spotify'); }
    let src = this.sources.get(pid);
    if (src && src.creating) { try { await src.creating; } catch (_) { /* tenta de novo abaixo */ } src = this.sources.get(pid); }
    if (src && src.sid) { if (url) await this.cdp.send('Page.navigate', { url }, src.sid).catch(() => {}); return src; }
    src = { pid, targetId: null, sid: null, windowId: null, state: null };
    this.sources.set(pid, src);
    const c = this.cdp;
    src.creating = (async () => {
      // abre em branco, instala a ponte e só então carrega o site (a ponte precisa chegar antes do código dele)
      const off = process.env.LFS_PLAYER_HEADLESS ? {} : { left: -20000, top: -20000, width: 1000, height: 900 };
      // navegadores mais antigos não aceitam a posição: tenta sem ela (o estacionamento logo abaixo leva a janela para fora)
      const { targetId } = await this.createOwn({ url: 'about:blank', newWindow: true, background: true, ...off });
      src.targetId = targetId;
      const { sessionId } = await c.send('Target.attachToTarget', { targetId, flatten: true });
      src.sid = sessionId;
      await c.send('Runtime.enable', {}, sessionId);
      await c.send('Page.enable', {}, sessionId);
      await c.send('Runtime.addBinding', { name: '__lfsPush' }, sessionId);
      await c.send('Page.addScriptToEvaluateOnNewDocument', { source: MEDIA_BRIDGE }, sessionId);
        if (this.layouts[pid] === 'mobile') await this.applyLayout(src, 'mobile');
      try { src.windowId = (await c.send('Browser.getWindowForTarget', { targetId })).windowId; } catch (_) { src.windowId = null; }
      // tira a janela nova da tela na hora (o estacionamento completo, sem barra de tarefas, vem logo depois)
      if (src.windowId && !process.env.LFS_PLAYER_HEADLESS) await c.send('Browser.setWindowBounds', { windowId: src.windowId, bounds: { left: -20000, top: -20000, width: 1000, height: 900 } }).catch(() => {});
      await this.parkWindows();
      await c.send('Page.navigate', { url: url || P.home }, sessionId);
    })();
    try { await src.creating; } catch (e) {
      this.sources.delete(pid);
      this.log('player: não abriu', pid, e.message);
      return null;
    } finally { delete src.creating; }
    this.log('player: aba aberta', pid);
    this.emit('change');
    return src;
  }
  async closeSource(pid) {
    const src = this.sources.get(pid);
    if (!src || !this.cdp) return;
    if (src.creating) { try { await src.creating; } catch (_) { /* fecha mesmo assim */ } }
    if (this.screen && this.screen.sid === src.sid) await this.stopScreen();
    // pausa antes de fechar (algumas páginas perguntam "deseja sair?"; o app já responde sozinho)
    await Promise.race([this.callSource(pid, 'cmd', 'pause').catch(() => {}), wait(1500)]);
    await this.cdp.send('Target.closeTarget', { targetId: src.targetId }).catch(() => {});
    if (this.sources.get(pid) === src) {
      this.sources.delete(pid);
      this.emit('source', pid, null);
      this.emit('change');
    }
    this.log('player: aba fechada', pid);
  }
  /* ---------------- Um player por vez ---------------- */
  /** Deixa aberta só a plataforma escolhida: fecha as outras e põe o Spotify para descansar (numa página
   *  em branco, sem tocar nem gastar) quando ele não é o escolhido; acorda o Spotify quando ele volta. */
  async only(pid) {
    if (!this.running) return;
    for (const id of [...this.sources.keys()]) if (id !== pid) await this.closeSource(id);
    if (pid === 'spotify') await this.wake();
    else await this.sleep();
  }
  async sleep() {
    if (!this.running || this.asleep || !this.sid) return;
    if (this.state && this.state.playing) await this.cmd('pause').catch(() => {});
    if (this.screen && this.screen.sid === this.sid) await this.stopScreen();
    this.asleep = true;
    this.state = null;
    await this.cdp.send('Page.navigate', { url: 'about:blank' }, this.sid).catch(() => {});
    this.log('player: Spotify descansando');
    this.emit('source', 'spotify', null);
    this.emit('change');
  }
  async wake(url) {
    if (!this.running || !this.asleep) return false;
    this.asleep = false;
    this.state = null;
    await this.cdp.send('Page.navigate', { url: url || `${BASE}/` }, this.sid).catch(() => {});
    this.log('player: Spotify acordado');
    this.emit('change');
    return true;
  }
  /** Espera a página do Spotify ficar pronta (depois de acordar) */
  async waitReady(ms = 15000) {
    const t = Date.now();
    while (Date.now() - t < ms) {
      if (this.state && (this.state.ready || this.state.loggedIn === false)) return true;
      if (!this.running) return false;
      await wait(200);
    }
    return false;
  }
  /** Chama a ponte de uma plataforma (reinstala se a página tiver trocado) */
  async callSource(pid, fn, ...args) {
    if (pid === 'spotify') return this.call(fn, ...args);
    const src = this.sources.get(pid);
    if (!src || !src.sid || !this.running) throw new Error('plataforma fechada');
    const ev = (expression) => this.cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, src.sid, 20000)
      .then((r) => { if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'erro na página'); return r.result ? r.result.value : undefined; });
    const expr = `window.__lfm ? window.__lfm.${fn}(${args.map((a) => JSON.stringify(a)).join(',')}) : '__nobridge__'`;
    let v = await ev(expr);
    if (v === '__nobridge__') { await ev(MEDIA_BRIDGE).catch(() => {}); v = await ev(expr); }
    return v;
  }
  async cmdSource(pid, name, arg) { return pid === 'spotify' ? this.cmd(name, arg) : this.callSource(pid, 'cmd', name, arg); }
  /** Versão de celular ou de computador do site (troca a identificação do navegador e recarrega) */
  async applyLayout(src, layout) {
    const c = this.cdp;
    const mobile = layout === 'mobile';
    if (!this.uaDesktop) { try { this.uaDesktop = (await c.send('Browser.getVersion')).userAgent.replace('HeadlessChrome', 'Chrome'); } catch (_) { this.uaDesktop = ''; } }
    const major = ((this.uaDesktop || '').match(/Chrome\/(\d+)/) || [])[1] || '141';
    const brands = [{ brand: 'Chromium', version: major }, { brand: 'Not=A?Brand', version: '24' }];
    if (mobile) {
      await c.send('Emulation.setUserAgentOverride', {
        userAgent: `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Mobile Safari/537.36`, platform: 'Linux armv8l',
        userAgentMetadata: { brands, fullVersion: `${major}.0.0.0`, platform: 'Android', platformVersion: '10.0.0', architecture: '', model: 'K', mobile: true },
      }, src.sid).catch(() => {});
    } else if (this.uaDesktop) {
      await c.send('Emulation.setUserAgentOverride', { userAgent: this.uaDesktop }, src.sid).catch(() => {});
    }
    await c.send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 }, src.sid).catch(() => {});
    await c.send('Emulation.setEmitTouchEventsForMouse', { enabled: mobile, configuration: 'mobile' }, src.sid).catch(() => {});
  }
  async setLayout(pid, layout) {
    this.layouts[pid] = layout === 'mobile' ? 'mobile' : 'desktop';
    const src = this.src(pid);
    if (!src || !this.running) return;
    await this.applyLayout(src, this.layouts[pid]);
    if (this.screen && this.screen.pid === pid) {
      const sc = this.screen;
      await this.cdp.send('Emulation.setDeviceMetricsOverride', { width: sc.width, height: sc.height, deviceScaleFactor: sc.dsf, mobile: this.layouts[pid] === 'mobile', screenWidth: sc.width, screenHeight: sc.height }, src.sid).catch(() => {});
    }
    await this.cdp.send('Page.reload', {}, src.sid).catch(() => {});
  }

  /* ---------------- Painel: a imagem ao vivo da aba e os seus cliques e teclas ---------------- */
  async startScreen(pid, { width, height, dsf = 1, quality = 80, nth = 1 } = {}) {
    if (pid === 'spotify' && this.asleep) await this.wake();
    const src = await this.openSource(pid);
    if (!src || !src.sid) return false;
    const c = this.cdp;
    const same = this.screen && this.screen.sid === src.sid;
    if (this.screen && !same) await this.stopScreen();
    width = Math.max(240, Math.round(width)); height = Math.max(240, Math.round(height));
    const mobile = this.layouts[pid] === 'mobile';
    this.screen = { pid, sid: src.sid, width, height, dsf, quality, nth, frames: same ? this.screen.frames : 0, startedAt: Date.now() };
    this.lastView = { pid, width, height, dsf, quality, nth };
    await c.send('Emulation.setFocusEmulationEnabled', { enabled: true }, src.sid).catch(() => {});
    await c.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dsf, mobile, screenWidth: width, screenHeight: height }, src.sid).catch(() => {});
    await c.send('Page.startScreencast', { format: 'jpeg', quality, maxWidth: Math.round(width * dsf), maxHeight: Math.round(height * dsf), everyNthFrame: nth }, src.sid).catch((e) => { this.log('painel: sem imagem', e.message); });
    return true;
  }
  onFrame(p, sid) {
    if (this.cdp) this.cdp.send('Page.screencastFrameAck', { sessionId: p.sessionId }, sid).catch(() => {});
    const sc = this.screen;
    if (!sc || sc.sid !== sid) return;
    sc.frames++;
    this.emit('frame', { pid: sc.pid, data: p.data, meta: p.metadata });
  }
  async stopScreen() {
    const sc = this.screen;
    this.screen = null;
    if (sc && this.cdp) await this.cdp.send('Page.stopScreencast', {}, sc.sid).catch(() => {});
  }
  /** Repassa um clique, rolagem ou tecla do painel para a página */
  input(ev) {
    const sc = this.screen;
    if (!sc || !this.cdp || !ev) return;
    const c = this.cdp, sid = sc.sid;
    const num = (v) => (Number.isFinite(v) ? v : 0);
    if (ev.kind === 'mouse') {
      c.send('Input.dispatchMouseEvent', {
        type: ev.type, x: num(ev.x), y: num(ev.y), button: ev.button || 'none', buttons: num(ev.buttons), clickCount: num(ev.clickCount),
        modifiers: num(ev.modifiers), deltaX: num(ev.deltaX), deltaY: num(ev.deltaY), pointerType: 'mouse',
      }, sid).catch(() => {});
    } else if (ev.kind === 'key') {
      c.send('Input.dispatchKeyEvent', {
        type: ev.type, key: ev.key, code: ev.code, windowsVirtualKeyCode: num(ev.keyCode), nativeVirtualKeyCode: num(ev.keyCode),
        modifiers: num(ev.modifiers), autoRepeat: !!ev.repeat, ...(ev.text ? { text: ev.text, unmodifiedText: ev.text } : {}),
      }, sid).catch(() => {});
    } else if (ev.kind === 'text' && ev.text) {
      c.send('Input.insertText', { text: String(ev.text).slice(0, 2000) }, sid).catch(() => {});
    } else if (ev.kind === 'nav') {
      if (ev.what === 'back') c.send('Runtime.evaluate', { expression: 'history.back()' }, sid).catch(() => {});
      else if (ev.what === 'forward') c.send('Runtime.evaluate', { expression: 'history.forward()' }, sid).catch(() => {});
      else if (ev.what === 'reload') c.send('Page.reload', {}, sid).catch(() => {});
      else if (ev.what === 'home' && PLATFORMS[sc.pid]) c.send('Page.navigate', { url: PLATFORMS[sc.pid].home }, sid).catch(() => {});
    }
  }

  /* ---------------- Cache ---------------- */
  /** Tamanho do cache do player e faxina (com ele ligado, pelo próprio navegador; desligado, apagando as pastas de cache) */
  cacheBytes() {
    let total = 0;
    for (const parts of PROFILE_CACHES) total += dirSize(path.join(this.profile, ...parts));
    if (this.cacheDir) total += dirSize(path.join(this.cacheDir, 'player-cache'));
    return total;
  }
  async trimCache(limit = this.cacheLimit) {
    const before = this.cacheBytes();
    if (before <= limit) return { before, after: before, cleaned: false };
    if (this.running) {
      const origins = new Set([BASE, ...Object.values(PLATFORMS).map((p) => { try { return new URL(p.home).origin; } catch (_) { return null; } }).filter(Boolean)]);
      for (const origin of origins) await this.cdp.send('Storage.clearDataForOrigin', { origin, storageTypes: 'cache_storage,shader_cache' }).catch(() => {});
      await this.cdp.send('Network.clearBrowserCache', {}, this.sid).catch(() => {});
    } else {
      for (const parts of PROFILE_CACHES) { try { fs.rmSync(path.join(this.profile, ...parts), { recursive: true, force: true }); } catch (_) { /* em uso */ } }
      if (this.cacheDir) { try { fs.rmSync(path.join(this.cacheDir, 'player-cache'), { recursive: true, force: true }); } catch (_) { /* em uso */ } }
    }
    const after = this.cacheBytes();
    this.log('player: cache limpo', Math.round(before / 1048576), '→', Math.round(after / 1048576), 'MB');
    return { before, after, cleaned: true };
  }

  /* ---------------- Página ---------------- */
  async navigate(url) {
    if (!this.running) return false;
    if (this.asleep && url && url !== 'about:blank') { this.asleep = false; this.state = null; this.emit('change'); }
    await this.cdp.send('Page.navigate', { url }, this.sid).catch(() => {});
    return true;
  }
  async evaluate(expression, timeout = 20000) {
    if (!this.running) throw new Error('player desligado');
    const r = await this.cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, this.sid, timeout);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text || 'erro na página');
    return r.result ? r.result.value : undefined;
  }
  /** Chama uma função da ponte (reinstala a ponte se a página tiver sido trocada) */
  async call(fn, ...args) {
    if (this.asleep) { await this.wake(); await this.waitReady(); }
    const expr = `window.__lfs ? window.__lfs.${fn}(${args.map((a) => JSON.stringify(a)).join(',')}) : '__nobridge__'`;
    let v = await this.evaluate(expr, 30000);
    if (v === '__nobridge__') {
      await this.evaluate(BRIDGE).catch(() => {});
      v = await this.evaluate(expr, 30000);
    }
    return v;
  }
  async cmd(name, arg) { return this.call('cmd', name, arg); }
  /** Abre uma página do Spotify e faz algo nela; se a troca de página interna não pegar, carrega a página de verdade e tenta de novo */
  async run(fn, pathname, ...args) {
    let r = await this.call(fn, pathname, ...args).catch(() => null);
    const failed = !r || (typeof r === 'object' && !Array.isArray(r) && r.ok === false && r.why !== 'faixa não encontrada');
    if (!failed) return r;
    this.log('player: recarregando', pathname);
    await this.navigate(BASE + pathname);
    for (let i = 0; i < 60; i++) { await wait(250); if (this.state && this.state.path === pathname && this.state.ready) break; }
    return this.call(fn, pathname, ...args).catch(() => r);
  }
  url(p) { return BASE + p; }
}

module.exports = { WebPlayer, BASE, isLoginUrl };

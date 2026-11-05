'use strict';
/* Players nativos: as plataformas que tocam sem proteção de conteúdo (YouTube Music, SoundCloud, Deezer)
 * rodam direto dentro do app, numa visão do próprio app no painel à direita — do jeito dos clientes de
 * código aberto (o Pear Desktop, por exemplo, faz isso com o YouTube Music). Sem navegador escondido,
 * sem imagem transmitida e sem janelas na barra de tarefas: a página é desenhada aqui e recebe o mouse e o
 * teclado direto. O que toca é lido pela Media Session (a mesma dos controles de mídia do Windows) e os
 * comandos usam os mesmos botões que as teclas de mídia. Cada plataforma guarda o seu login. */
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { WebContentsView, session, ipcMain, app } = require('electron');
const { fn: mediaBridge, drmProbe } = require('./bridge-media');
const { PLATFORMS } = require('./platforms');

/* O Google não aceita login com a conta Google dentro de apps ("este navegador pode não ser seguro"):
 * é uma proteção dele, e o app não tenta contorná-la. Quando uma plataforma vai para esse login, o app só
 * avisa e mostra os caminhos que funcionam (entrar com e-mail e senha da plataforma ou ouvir no navegador). */
const GOOGLE_LOGIN = /(^|\.)accounts\.google\.com$/i;
const isGoogleLogin = (url) => { try { return GOOGLE_LOGIN.test(new URL(url).hostname); } catch (_) { return false; } };
const MOBILE_UA = (major) => `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Mobile Safari/537.36`;

/* Clicar no primeiro resultado de uma busca (o "Ouvir no YouTube Music" do Last.fm toca direto).
 * Devolve 'playing' quando já está tocando, 'clicked' quando clicou e 'waiting' enquanto a página monta. */
const PLAYING = "(navigator.mediaSession && navigator.mediaSession.playbackState === 'playing') || [...document.querySelectorAll('video, audio')].some((m) => !m.paused && !m.ended && m.currentTime > 0)";
const AUTOPLAY = {
  ytmusic: `(() => {
    if (${PLAYING}) return 'playing';
    const click = (el) => { if (!el) return false; try { el.scrollIntoView({ block: 'center' }); } catch (_) {} el.click(); return true; };
    const top = document.querySelector('ytmusic-card-shelf-renderer');
    if (top && click(top.querySelector('ytmusic-play-button-renderer, #play-button, button[aria-label*="play" i], button[aria-label*="tocar" i], button[aria-label*="reproduzir" i]'))) return 'clicked';
    const item = document.querySelector('ytmusic-shelf-renderer ytmusic-responsive-list-item-renderer, ytmusic-responsive-list-item-renderer');
    if (item && click(item.querySelector('ytmusic-play-button-renderer') || item.querySelector('a[href*="watch"]'))) return 'clicked';
    return 'waiting';
  })()`,
  soundcloud: `(() => {
    if (${PLAYING}) return 'playing';
    const b = document.querySelector('.searchList__item .sc-button-play, .soundList__item .sc-button-play, .sound__body .sc-button-play');
    if (b) { b.click(); return 'clicked'; }
    return 'waiting';
  })()`,
};

/* A ponte entra na página antes do código do site (para ver os botões de mídia que ele registra) */
function preloadSource() {
  return `'use strict';
/* Gerado pelo Last.fm PRIME: ponte da Media Session para os players nativos. */
const { contextBridge, ipcRenderer } = require('electron');
const run = (func) => { try { contextBridge.executeInMainWorld({ func }); } catch (_) { /* página especial */ } };
run(() => { window.__lfsPush = (j) => { try { window.dispatchEvent(new CustomEvent('lfm:push', { detail: String(j) })); } catch (_) { /* ignorado */ } }; });
run(${drmProbe.toString()});
run(${mediaBridge.toString()});
window.addEventListener('lfm:push', (e) => { if (typeof e.detail === 'string' && e.detail.length < 20000) ipcRenderer.send('native:state', e.detail); });
window.addEventListener('lfm:drm', (e) => ipcRenderer.send('native:drm', String(e.detail || '').slice(0, 80)));
window.addEventListener('pointerdown', () => ipcRenderer.send('native:input'), true);
window.addEventListener('keydown', () => ipcRenderer.send('native:input'), true);
run(${keepPlaying.toString()});
`;
}

/* Mantém a música tocando sem interrupção nas plataformas que rodam dentro do app:
 *  - pula os anúncios (adianta o anúncio até o fim e silencia);
 *  - fecha o aviso "ainda está aí? / continuar assistindo" do YouTube Music (que pausa a música do nada);
 *  - se a página pausou sozinha mas deveria estar tocando, dá play de novo.
 * Roda no mundo da página (precisa do vídeo e dos botões) e só nas plataformas conhecidas. */
function keepPlaying() {
  const host = location.hostname;
  const isYT = /(^|\.)music\.youtube\.com$/.test(host) || /(^|\.)youtube\.com$/.test(host);
  const isDZ = /(^|\.)deezer\.com$/.test(host);
  const isSC = /(^|\.)soundcloud\.com$/.test(host);
  if (!isYT && !isDZ && !isSC) return;
  const click = (el) => { if (el) { try { el.click(); return true; } catch (_) { /* ignorado */ } } return false; };
  function tick() {
    try {
      const v = document.querySelector('video, audio');
      if (isYT) {
        const player = document.querySelector('ytmusic-player, #movie_player, .html5-video-player');
        const adShowing = !!(player && (player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting'))) || !!document.querySelector('.ytp-ad-player-overlay, .ytp-ad-module, .ytp-ad-text');
        // botão "pular anúncio"
        click(document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-container button'));
        // anúncio sem botão de pular: adianta até o fim e silencia
        if (adShowing && v && isFinite(v.duration) && v.duration > 0 && v.duration < 180) { try { v.muted = true; v.currentTime = v.duration; } catch (_) { /* ignorado */ } }
        // "ainda está aí?" / "continuar assistindo" (pausa a música sozinho)
        const you = document.querySelector('ytmusic-you-there-renderer');
        if (you) click(you.querySelector('button, yt-button-renderer, a'));
        click(document.querySelector('tp-yt-paper-dialog #confirm-button, yt-confirm-dialog-renderer #confirm-button, ytmusic-confirmation-dialog-renderer #button'));
        // retomar quando pausou sozinho (mas respeitando a pausa feita por você)
        if (v && v.paused && !adShowing && navigator.mediaSession && navigator.mediaSession.playbackState === 'playing') { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      } else if ((isDZ || isSC) && v && v.paused && navigator.mediaSession && navigator.mediaSession.playbackState === 'playing') {
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      }
    } catch (_) { /* ignorado */ }
  }
  setInterval(tick, 1000);
}

class NativePlayers extends EventEmitter {
  constructor({ win, log, cleanUA, isLoginUrl, place, blockAds, adHosts, attachAds }) {
    super();
    this.win = win;
    this.log = log || (() => {});
    this.cleanUA = cleanUA || ((u) => u);
    this.isLoginUrl = isLoginUrl || (() => true);
    this.place = place || (() => null);    // onde abrir as janelas de login (no meio do app)
    this.blockAds = typeof blockAds === 'function' ? blockAds : () => false; // cortar anúncios nas plataformas?
    this.adHosts = Array.isArray(adHosts) ? adHosts : [];
    this.attachAds = typeof attachAds === 'function' ? attachAds : null; // bloqueio completo (listas do uBlock), vindo do app
    this.views = new Map();
    this.shown = null;                      // plataforma visível no painel agora
    this.layouts = {};
    this.popups = 0;
    this.preload = this.writePreload();
    ipcMain.on('native:state', (e, json) => this.onPush(e.sender, json));
    ipcMain.on('native:drm', (e) => { const n = this.byWc(e.sender); if (n && !n.drm) { n.drm = true; this.log('nativo: a página pediu DRM', n.pid); this.emit('drm', n.pid); this.emit('change'); } });
    ipcMain.on('native:input', (e) => { const n = this.byWc(e.sender); if (n) this.emit('input', n.pid); });
  }

  writePreload() {
    let dir;
    try { dir = app.getPath('temp'); } catch (_) { dir = require('os').tmpdir(); }
    const file = path.join(dir, `lfprime-plataformas-${process.pid}.js`);
    try { fs.writeFileSync(file, preloadSource()); } catch (e) { this.log('nativo: sem ponte', e.message); }
    app.once('will-quit', () => { try { fs.rmSync(file, { force: true }); } catch (_) { /* já saiu */ } });
    return file;
  }

  byWc(wc) { for (const n of this.views.values()) if (n.wc === wc) return n; return null; }
  has(pid) { return this.views.has(pid); }
  get(pid) { return this.views.get(pid) || null; }
  info() {
    const out = {};
    for (const [pid, n] of this.views) out[pid] = { ready: n.ready, drm: n.drm, shown: this.shown === pid, layout: n.layout };
    return out;
  }

  onPush(wc, json) {
    const n = this.byWc(wc);
    if (!n) return;
    let st;
    try { st = JSON.parse(json); } catch (_) { return; }
    n.state = st;
    this.emit('source', n.pid, st);
  }

  /** Cria (ou reaproveita) a visão da plataforma; com url, vai para esse endereço */
  open(pid, url, { autoplay = false } = {}) {
    const P = PLATFORMS[pid];
    if (!P) return null;
    let n = this.views.get(pid);
    if (!n) n = this.create(pid);
    const target = url || (!n.loaded ? P.home : null);
    if (target) {
      n.loaded = true;
      n.autoplay = autoplay && AUTOPLAY[pid] ? { tries: 0, clicked: 0 } : null;
      n.wc.loadURL(target).catch((e) => this.log('nativo: não carregou', pid, e.message));
    }
    return n;
  }

  create(pid) {
    const partition = `persist:plataforma-${pid}`;
    const ses = session.fromPartition(partition);
    if (!ses.__lfprime) {
      ses.__lfprime = true;
      ses.setUserAgent(this.cleanUA(ses.getUserAgent()));
      ses.setPermissionRequestHandler((_wc, perm, cb) => cb(['clipboard-sanitized-write', 'fullscreen', 'mediaKeySystem'].includes(perm)));
      try { ses.setSpellCheckerEnabled(false); } catch (_) { /* sem corretor */ }
      // corta anúncios: os servidores de propaganda conhecidos e os caminhos de anúncio do YouTube
      const adUrls = [
        ...this.adHosts.flatMap((d) => [`*://${d}/*`, `*://*.${d}/*`]),
        '*://*.youtube.com/pagead/*', '*://*.youtube.com/ptracking*', '*://*.youtube.com/api/stats/ads*',
        '*://*.youtube.com/youtubei/v1/player/ad_break*', '*://*.youtube.com/get_midroll_info*', '*://*.youtube.com/get_video_info*&*ad',
      ];
      const adHost = (u) => { try { const h = new URL(u).hostname.toLowerCase(); return this.adHosts.some((d) => h === d || h.endsWith('.' + d)); } catch (_) { return false; } };
      const adPath = /\/pagead\/|\/ptracking|\/api\/stats\/ads|\/player\/ad_break|get_midroll_info/i;
      // com as listas do uBlock: todos os pedidos passam pelas regras (a lista curta fica de reserva)
      if (this.attachAds) this.attachAds(ses, (u) => adHost(u) || adPath.test(u));
      else ses.webRequest.onBeforeRequest({ urls: adUrls }, (d, cb) => cb({ cancel: this.blockAds() && (adHost(d.url) || adPath.test(d.url)) }));
    }
    const view = new WebContentsView({
      webPreferences: { session: ses, preload: this.preload, contextIsolation: true, sandbox: true, backgroundThrottling: false, autoplayPolicy: 'no-user-gesture-required', spellcheck: false },
    });
    view.setBackgroundColor('#0b0b0e');
    view.setVisible(false);
    view.setBounds({ x: 0, y: 0, width: 10, height: 10 });
    this.win.contentView.addChildView(view);
    const wc = view.webContents;
    const n = { pid, view, wc, partition, ready: false, loaded: false, state: null, drm: false, autoplay: null, layout: this.layouts[pid] === 'mobile' ? 'mobile' : 'desktop' };
    this.views.set(pid, n);
    if (n.layout === 'mobile') wc.setUserAgent(this.mobileUA());
    wc.setAudioMuted(false);
    // indo para o login do Google: avisa (uma vez) quais caminhos funcionam
    const google = (url) => { if (isGoogleLogin(url) && !n.googleWarned) { n.googleWarned = true; this.log('nativo: login do Google', pid); this.emit('google', pid); } };
    wc.on('will-navigate', (_e, url) => google(url));
    wc.on('will-redirect', (_e, url) => google(url));

    // logins (Google, Facebook, Apple…) abrem numa janela de verdade, na frente do app; links comuns vão para o seu navegador
    wc.setWindowOpenHandler(({ url }) => {
      if (url && url !== 'about:blank' && !this.isLoginUrl(url)) { this.emit('external', url); return { action: 'deny' }; }
      const b = this.place() || {};
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          parent: this.win, width: b.width || 520, height: b.height || 700, ...(b.x !== undefined ? { x: b.x, y: b.y } : {}),
          autoHideMenuBar: true, backgroundColor: '#111114', title: `Entrar — ${PLATFORMS[pid].name}`, minimizable: false,
          webPreferences: { partition, sandbox: true, contextIsolation: true },
        },
      };
    });
    wc.on('did-create-window', (child, details) => {
      const cw = child.webContents;
      if (details && details.url) google(details.url);
      cw.on('will-navigate', (_e, url) => google(url));
      cw.on('will-redirect', (_e, url) => google(url));
      this.popups++;
      this.log('nativo: janela de login aberta', pid);
      this.emit('popup', { open: true, pid, url: child.webContents.getURL(), count: this.popups });
      child.on('closed', () => {
        this.popups = Math.max(0, this.popups - 1);
        this.emit('popup', { open: false, pid, count: this.popups });
      });
    });
    wc.on('did-finish-load', () => {
      if (!n.ready) { n.ready = true; this.log('nativo: aberto', pid); this.emit('change'); }
      if (n.autoplay) this.autoplayStep(n);
    });
    wc.on('did-fail-load', (_e, code, desc, url, isMain) => { if (isMain && code !== -3) { this.log('nativo: falhou ao carregar', pid, code, desc); this.emit('fail', { pid, code, desc, url }); } });
    wc.on('render-process-gone', (_e, d) => { this.log('nativo: a página caiu', pid, d && d.reason); setTimeout(() => { if (!wc.isDestroyed()) wc.reload(); }, 800); });
    wc.on('before-input-event', (e, input) => {
      if (input.type !== 'keyDown') return;
      if (input.key === 'F5' || ((input.control || input.meta) && input.key.toLowerCase() === 'r')) { wc.reload(); e.preventDefault(); }
      else if (input.alt && input.key === 'ArrowLeft') { if (wc.navigationHistory.canGoBack()) wc.navigationHistory.goBack(); e.preventDefault(); }
      else if (input.alt && input.key === 'ArrowRight') { if (wc.navigationHistory.canGoForward()) wc.navigationHistory.goForward(); e.preventDefault(); }
    });
    this.emit('change');
    return n;
  }

  /** Toca o primeiro resultado da busca (algumas tentativas, enquanto a página monta) */
  autoplayStep(n) {
    const a = n.autoplay;
    if (!a || n.wc.isDestroyed()) return;
    if (++a.tries > 16) { n.autoplay = null; this.log('nativo: não deu play sozinho', n.pid); this.emit('autoplay', { pid: n.pid, ok: false }); return; }
    n.wc.executeJavaScript(AUTOPLAY[n.pid], true).then((r) => {
      if (n.autoplay !== a) return;
      if (r === 'playing') { n.autoplay = null; this.emit('autoplay', { pid: n.pid, ok: true }); return; }
      if (r === 'clicked') a.clicked++;
      // depois de clicar, espera a música começar antes de clicar de novo
      setTimeout(() => this.autoplayStep(n), r === 'clicked' ? 1800 : 600);
    }, () => setTimeout(() => this.autoplayStep(n), 700));
  }

  mobileUA() {
    const major = (process.versions.chrome || '140').split('.')[0];
    return MOBILE_UA(major);
  }

  /** Mostra a plataforma no painel, no retângulo que a interface reservou (as outras ficam escondidas, tocando) */
  show(pid, rect) {
    const n = this.views.get(pid);
    if (!n || !rect || !(rect.width > 20) || !(rect.height > 20)) return false;
    for (const o of this.views.values()) if (o !== n && o.view.getVisible()) o.view.setVisible(false);
    n.view.setBounds({ x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) });
    if (!n.view.getVisible()) n.view.setVisible(true);
    this.shown = pid;
    this.rect = rect;
    return true;
  }
  hide() {
    for (const n of this.views.values()) if (n.view.getVisible()) n.view.setVisible(false);
    const was = this.shown;
    this.shown = null;
    return was;
  }
  /** Retrato da página (para o painel deslizar com ela, em vez de um quadro vazio) */
  async snapshot(pid) {
    const n = this.views.get(pid);
    if (!n || !n.ready || n.wc.isDestroyed()) return null;
    try {
      const img = await n.wc.capturePage();
      if (img.isEmpty()) return null;
      const sz = img.getSize();
      return { data: img.toJPEG(82), w: sz.width, h: sz.height };
    } catch (_) { return null; }
  }
  /** Fecha a plataforma (pausa antes, para o site guardar onde parou; a música dela para) */
  async close(pid) {
    const n = this.views.get(pid);
    if (!n) return;
    if (n.state && n.state.playing) await Promise.race([this.cmd(pid, 'pause'), new Promise((r) => setTimeout(r, 400))]);
    if (this.views.get(pid) !== n) return;
    this.views.delete(pid);
    if (this.shown === pid) this.shown = null;
    try { this.win.contentView.removeChildView(n.view); } catch (_) { /* já saiu */ }
    try { n.wc.close(); } catch (_) { /* já fechou */ }
    this.log('nativo: fechado', pid);
    this.emit('source', pid, null);
    this.emit('change');
  }
  async closeAll() { for (const pid of [...this.views.keys()]) await this.close(pid); }

  /** Comandos (os mesmos das teclas de mídia): toggle, play, pause, next, prev, seek, volume */
  async cmd(pid, name, arg) {
    const n = this.views.get(pid);
    if (!n || n.wc.isDestroyed()) return { ok: false, why: 'plataforma fechada' };
    try {
      const r = await n.wc.executeJavaScript(`window.__lfm ? window.__lfm.cmd(${JSON.stringify(name)}, ${JSON.stringify(arg === undefined ? null : arg)}) : ({ ok: false, why: 'sem ponte' })`, true);
      return r || { ok: false };
    } catch (e) { return { ok: false, why: e.message }; }
  }
  nav(pid, what) {
    const n = this.views.get(pid);
    if (!n || n.wc.isDestroyed()) return;
    const h = n.wc.navigationHistory;
    if (what === 'back' && h.canGoBack()) h.goBack();
    else if (what === 'forward' && h.canGoForward()) h.goForward();
    else if (what === 'reload') n.wc.reload();
    else if (what === 'home') n.wc.loadURL(PLATFORMS[pid].home).catch(() => {});
  }
  /** Versão de celular ou de computador do site */
  setLayout(pid, layout) {
    this.layouts[pid] = layout === 'mobile' ? 'mobile' : 'desktop';
    const n = this.views.get(pid);
    if (!n) return;
    n.layout = this.layouts[pid];
    n.wc.setUserAgent(n.layout === 'mobile' ? this.mobileUA() : this.cleanUA(n.wc.session.getUserAgent()));
    n.wc.reload();
  }
  /** Cache das plataformas (as músicas e páginas guardadas; os logins ficam) */
  async cacheBytes() {
    let total = 0;
    for (const pid of Object.keys(PLATFORMS)) {
      try { total += await session.fromPartition(`persist:plataforma-${pid}`).getCacheSize(); } catch (_) { /* sem cache */ }
    }
    return total;
  }
  async clearCaches(limit = 0) {
    for (const pid of Object.keys(PLATFORMS)) {
      const ses = session.fromPartition(`persist:plataforma-${pid}`);
      try {
        const size = await ses.getCacheSize();
        if (size > limit) { await ses.clearCache(); await ses.clearStorageData({ storages: ['cachestorage', 'shadercache'] }).catch(() => {}); this.log('nativo: cache limpo', pid, Math.round(size / 1048576), 'MB'); }
      } catch (_) { /* sem cache */ }
    }
  }
}

module.exports = { NativePlayers, AUTOPLAY };

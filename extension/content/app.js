/* Last.fm Hub 2 — script de conteúdo
 * Roda em document_start: aplica as classes do tema antes da primeira pintura
 * e, quando o DOM fica pronto, monta a estrutura de app (barra lateral, busca,
 * tocando agora) e os recursos de cada página. O Last.fm troca o conteúdo por
 * AJAX (o player continua tocando), então tudo é reaplicado a cada troca, de
 * forma idempotente.
 */
(() => {
  'use strict';
  if (window.__lfxHub) return;
  window.__lfxHub = true;

  const root = document.documentElement;

  /* ================================================================ *
   * Configurações
   * ================================================================ */
  const DEFAULTS = {
    enabled: true,
    accentMode: 'auto',
    accent: '#b8a4ff',
    animations: true,
    wide: false,
    ambient: true,
    hideAds: true,
    sidebar: true,
    sideCollapsed: false,
    nowPlaying: true,
    homeDash: true,
    miniHeader: true,
    artistTabs: true,
    palette: true,
    listen: true,
    service: 'spotify',
    heroCover: true,
    listTools: true,
    stats: true,
    shortcuts: true,
    backToTop: true,
    hoverCards: true,
    social: true,
    catalog: true,
    premium: true,
    discover: true,
    match: true,
    socialHub: true,
    doppel: true,
    shows: true,
    lite: false,
  };
  const LOCAL_KEY = 'lfx:settings';
  let S = { ...DEFAULTS };
  try { Object.assign(S, JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')); } catch (_) { /* sem cache ainda */ }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function applyClasses() {
    const on = !!S.enabled;
    root.classList.toggle('lfx', on);
    root.classList.toggle('lfx-motion', on && S.animations && !reducedMotion.matches);
    root.classList.toggle('lfx-wide', on && S.wide);
    root.classList.toggle('lfx-ambient', on && S.ambient);
    root.classList.toggle('lfx-lite', on && S.lite);
    root.classList.toggle('lfx-noads', on && S.hideAds);
    root.classList.toggle('lfx-side', on && S.sidebar);
    root.classList.toggle('lfx-side-collapsed', on && S.sidebar && S.sideCollapsed);
    // Com o botão "Ouvir no…" ligado, o "Play artist/album/track" do site sai do topo
    root.classList.toggle('lfx-listen-on', on && S.listen);
    if (S.accentMode !== 'auto') root.style.setProperty('--lfx-accent', S.accent);
  }
  applyClasses();

  // Opções ficam no "sync" do navegador; onde ele não existe (o app Last.fm + Spotify), no "local"
  let SYNC_AREA = 'sync';
  async function syncGet(defs) {
    if (SYNC_AREA === 'sync') { try { return await chrome.storage.sync.get(defs); } catch (_) { SYNC_AREA = 'local'; } }
    return chrome.storage.local.get(defs);
  }
  async function syncSet(obj) {
    if (SYNC_AREA === 'sync') { try { return await chrome.storage.sync.set(obj); } catch (_) { SYNC_AREA = 'local'; } }
    return chrome.storage.local.set(obj);
  }
  const ext = {
    alive() { try { return !!chrome.runtime?.id; } catch (_) { return false; } },
    async send(msg) {
      if (!this.alive()) return null;
      try { return await chrome.runtime.sendMessage(msg); } catch (_) { return null; }
    },
    async getLocal(key, fallback) {
      if (!this.alive()) return fallback;
      try { const o = await chrome.storage.local.get(key); return o[key] ?? fallback; } catch (_) { return fallback; }
    },
    async setLocal(key, value) {
      if (!this.alive()) return;
      try { await chrome.storage.local.set({ [key]: value }); } catch (_) { /* ignorado */ }
    },
    async saveSetting(key, value) {
      S[key] = value;
      cacheSettings();
      applyClasses();
      if (!this.alive()) return;
      try { await syncSet({ [key]: value }); } catch (_) { /* ignorado */ }
    },
  };
  function cacheSettings() { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(S)); } catch (_) { /* modo privado */ } }
  async function loadSettings() {
    if (!ext.alive()) return;
    try {
      S = { ...DEFAULTS, ...(await syncGet(DEFAULTS)) };
      cacheSettings();
      applyClasses();
      if (ready) refresh(true);
    } catch (_) { /* mantém o cache */ }
  }
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== SYNC_AREA) return;
      const keys = Object.keys(changes).filter((k) => k in DEFAULTS);
      if (!keys.length) return;
      for (const k of keys) S[k] = changes[k].newValue ?? DEFAULTS[k];
      cacheSettings();
      applyClasses();
      if (ready) refresh(true);
    });
  } catch (_) { /* contexto da extensão indisponível */ }
  reducedMotion.addEventListener?.('change', applyClasses);

  /* Conversa com o app Last.fm PRIME (só existe dentro do app): o app lê e muda opções do tema
     (balões, animações, modo leve) e limpa o cache guardado pela extensão. */
  document.addEventListener('lfx:app', (e) => {
    let msg;
    try { msg = JSON.parse(e.detail); } catch (_) { return; }
    if (!msg || typeof msg !== 'object') return;
    const reply = (data) => document.dispatchEvent(new CustomEvent('lfx:app-reply', { detail: JSON.stringify({ id: msg.id, ...data }) }));
    if (msg.type === 'get') reply({ settings: S });
    else if (msg.type === 'set') {
      const patch = {};
      for (const [k, v] of Object.entries(msg.patch || {})) if (k in DEFAULTS && typeof v === typeof DEFAULTS[k]) patch[k] = v;
      Object.assign(S, patch);
      cacheSettings(); applyClasses();
      if (patch.hoverCards === false) hideHc();
      (ext.alive() ? syncSet(patch) : Promise.resolve()).catch(() => {}).finally(() => { if (ready) refresh(true); reply({ settings: S }); });
    } else if (msg.type === 'clear-cache') clearExtCache().then((removed) => reply({ removed }), () => reply({ removed: 0 }));
  });

  /* Fonte Geist (Google Fonts). Sem internet, o tema usa as fontes do sistema. */
  function injectFonts() {
    if (document.getElementById('lfx-fonts')) return;
    const head = document.head || root;
    for (const href of ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']) {
      const l = document.createElement('link');
      l.rel = 'preconnect'; l.href = href; l.crossOrigin = '';
      head.appendChild(l);
    }
    const link = document.createElement('link');
    link.id = 'lfx-fonts'; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@300..900&family=Unbounded:wght@600..900&display=swap';
    head.appendChild(link);
  }

  /* ================================================================ *
   * Utilidades
   * ================================================================ */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const LANG_RE = /^\/(de|es|fr|it|ja|pl|pt|ru|sv|tr|zh)(?=\/|$)/;
  const langPrefix = () => (location.pathname.match(LANG_RE) || [''])[0];
  const isPt = () => /^pt/i.test(document.documentElement.lang || navigator.language || '');
  const nf = new Intl.NumberFormat('pt-BR');
  const nf1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  const encName = (s) => encodeURIComponent(s).replace(/%20/g, '+');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function decodePart(s) { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch (_) { return s; } }
  function normalize(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim(); }
  function text(node) { return (node?.textContent || '').replace(/\s+/g, ' ').trim(); }
  function parseCount(str) { const n = (str || '').replace(/[^\d]/g, ''); return n ? parseInt(n, 10) : null; }
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    // imagens: decodificam fora da thread principal e, a não ser que se peça, só baixam perto da tela
    if (tag === 'img') { if (!('decoding' in attrs)) node.decoding = 'async'; if (!('loading' in attrs)) node.loading = 'lazy'; }
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v; // só ícones estáticos deste arquivo
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children) if (c != null) node.append(c);
    return node;
  }
  function imgSize(url, size) { return url ? url.replace(/\/i\/u\/[^/]+\//, `/i/u/${size}/`) : url; }
  function bgUrl(node) {
    if (!node) return null;
    const m = (node.style.backgroundImage || getComputedStyle(node).backgroundImage || '').match(/url\(["']?([^"')]+)["']?\)/);
    return m ? m[1] : null;
  }
  function isPlaceholder(url) { return !url || /\/static\/images\/|default_|2a96cbd8b46e442fc41c2b86b821562f|c6f59c1e5e7240a4c0d427abd71f3dbb|4128a6eb29f94943c9d206c08e625904|818148bf682d429dc215c1705eb27b98/.test(url); }
  function sameOriginPath(href) {
    if (!href) return null;
    try { const u = new URL(href, location.origin); return u.origin === location.origin ? u.pathname + u.search + u.hash : null; } catch (_) { return null; }
  }
  function stripLang(path) { return (path || '').replace(LANG_RE, '') || '/'; }

  /* Navega pelo roteador AJAX do Last.fm quando possível (o player não para). */
  function go(path, newTab = false) {
    if (!path) return;
    if (newTab) { window.open(path, '_blank', 'noopener'); return; }
    const host = $('#content') || document.body;
    const a = el('a', { href: path, style: 'display:none' });
    host.appendChild(a);
    a.click();
    a.remove();
  }

  let toastTimer;
  function toast(msg) {
    let t = $('.lfx-toast');
    if (!t) { t = el('div', { class: 'lfx-toast lfx-layer', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(t); }
    const o = typeof msg === 'string' ? { text: msg } : (msg || {});
    t.textContent = '';
    t.append(el('span', { class: 'lfx-toast-text', text: o.text || '' }));
    if (o.action && o.action.label) {
      t.append(el('button', { class: 'lfx-toast-act', type: 'button', onclick: () => { t.classList.remove('lfx-show'); try { o.action.run?.(); } catch (_) { /* ignorado */ } } }, o.action.label));
    }
    requestAnimationFrame(() => t.classList.add('lfx-show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('lfx-show'), o.action ? 6000 : 2200);
  }
  async function copy(value, okMsg = 'Copiado') {
    try { await navigator.clipboard.writeText(value); toast(okMsg); }
    catch (_) { toast('Não deu para copiar. Selecione o texto e use Ctrl+C.'); }
  }
  /* Datas do Last.fm ("Thursday 15 Oct 2026, 8:02am") e tempos relativos em inglês. */
  function parseLfmDate(str) {
    if (!str) return null;
    const m = str.match(/(\d{1,2})\s+([A-Za-zÀ-ÿ.]+)\s+(\d{4}),?\s+(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (!m) { const t = Date.parse(str); return isNaN(t) ? null : t; }
    const mon = normalize(m[2]).replace('.', '');
    const mi = MONTHS.findIndex((alts) => alts.some((a) => mon.startsWith(normalize(a))));
    if (mi < 0) return null;
    let h = +m[4];
    if (m[6]) h = (h % 12) + (/pm/i.test(m[6]) ? 12 : 0);
    const t = new Date(+m[3], mi, +m[1], h, +m[5]).getTime();
    return isNaN(t) ? null : t;
  }
  function ptAgo(str) {
    const s = (str || '').trim();
    const r = [[/^(\d+)\s*minutes?\s+ago$/i, 'há $1 min'], [/^(\d+)\s*hours?\s+ago$/i, 'há $1 h'], [/^(\d+)\s*days?\s+ago$/i, 'há $1 dias'],
      [/^yesterday$/i, 'ontem'], [/^just now$/i, 'agora há pouco'], [/^scrobbling now$/i, 'agora']];
    for (const [re, out] of r) if (re.test(s)) return s.replace(re, out);
    return s;
  }
  function timeAgo(ms) {
    const m = Math.round(ms / 60000);
    if (m < 1) return 'agora há pouco';
    if (m < 60) return `há ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `há ${h} h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'ontem' : `há ${d} dias`;
  }

  const I = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
  const ICON = {
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    home: I('<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>'),
    shuffle: I('<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>'),
    compass: I('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
    chart: I('<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
    calendar: I('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
    user: I('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
    users: I('<circle cx="9" cy="8" r="3.4"/><path d="M3 20c1.1-3.4 3.4-5 6-5s4.9 1.6 6 5"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6M17.5 15c2 .5 3.5 2 4.3 4.4"/>'),
    chat: I('<path d="M4 5.5h16a1 1 0 0 1 1 1V16a1 1 0 0 1-1 1H9l-4 3.5V6.5a1 1 0 0 1 1-1z"/>'),
    bell: I('<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
    masks: I('<path d="M3 4h7v6a3.5 3.5 0 0 1-7 0z"/><path d="M14 8h7v6a3.5 3.5 0 0 1-7 0z"/><path d="M5.5 7h2M16.5 11h2"/>'),
    userplus: I('<circle cx="9" cy="8" r="3.4"/><path d="M3 20c1-3.2 3.2-5 6-5 1 0 1.9.2 2.7.6"/><path d="M18 14v6M15 17h6"/>'),
    history: I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7.5V12l3 2"/>'),
    mic: I('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
    disc: I('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>'),
    note: I('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
    heart: I('<path d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.5 3.1 4.3 6.3C19.5 15.4 12 20 12 20z"/>'),
    report: I('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    collapse: I('<path d="M15 6l-6 6 6 6"/>'),
    list: I('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
    grid: I('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'),
    close: I('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="2.2"'),
    up: I('<path d="M12 19V5M5 12l7-7 7 7"/>', 'class="lfx-top-arrow" stroke-width="2.2"'),
    copy: I('<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V6a2.5 2.5 0 0 0-2.5-2.5H6A2.5 2.5 0 0 0 3.5 6v7A2.5 2.5 0 0 0 6 15.5h2.5"/>'),
    link: I('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'),
    external: I('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    chevron: I('<path d="m6 9 6 6 6-6"/>'),
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
    wide: I('<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>'),
    keyboard: I('<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17.5 10h.01M7 14h10"/>'),
    motion: I('<path d="M3 12c3-6 6-6 9 0s6 6 9 0"/>'),
    sidebar: I('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/>'),
    lyrics: I('<path d="M4 6h16M4 12h10M4 18h7"/>'),
    star: I('<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
    book: I('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>'),
    layers: I('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'),
    bookmark: I('<path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z"/>'),
    bookmarkOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4-6.5 4V4.5a1 1 0 0 1 1-1z"/></svg>',
    arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    spark: I('<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9-1.9 5.1-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>'),
    refresh: I('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 3.5V8h4.5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16m0 4.5V16h-4.5"/>'),
    nope: I('<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>'),
    check: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    ticket: I('<path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M15 6v12"/>'),
    pin: I('<path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    eyeOff: I('<path d="M3 3l18 18"/><path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-2.6 3.8M6.3 6.4A13.3 13.3 0 0 0 2.5 12c1 2.5 4.5 7 9.5 7a9.6 9.6 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  };

  /* ================================================================ *
   * Leitura da página e da conta
   * ================================================================ */
  function getPage() {
    const path = stripLang(location.pathname);
    const parts = path.split('/').filter(Boolean);
    const p = { path, parts, kind: 'other' };
    if (parts[0] === 'music' && parts[1] && !parts[1].startsWith('+')) {
      p.artist = decodePart(parts[1]);
      p.artistPath = `/music/${parts[1]}`;
      if (parts[2] === '_' && parts[3]) { p.track = decodePart(parts[3]); p.kind = parts.length === 4 ? 'track' : 'track-sub'; p.basePath = `${p.artistPath}/_/${parts[3]}`; }
      else if (parts[2] && !parts[2].startsWith('+')) { p.album = decodePart(parts[2]); p.kind = parts.length === 3 ? 'album' : 'album-sub'; p.basePath = `${p.artistPath}/${parts[2]}`; }
      else { p.kind = parts.length === 2 ? 'artist' : 'artist-sub'; p.basePath = p.artistPath; }
    } else if (parts[0] === 'user' && parts[1]) {
      p.user = decodePart(parts[1]);
      p.kind = parts.length === 2 ? 'user' : 'user-sub';
    } else if (parts[0] === 'tag' && parts[1]) { p.tag = decodePart(parts[1]); p.kind = 'tag'; }
    else if (parts[0] === 'search') p.kind = 'search';
    else if (parts[0] === 'charts') p.kind = 'charts';
    else if (parts[0] === 'home') p.kind = parts.length === 1 ? 'home' : 'home-sub';
    else if (parts.length === 0) p.kind = 'front';

    const crumb = text($('.header-new-crumb'));
    const title = text($('.header-new-title'));
    if (p.kind.startsWith('artist') && title) p.artist = title;
    if ((p.kind === 'album' || p.kind === 'track') && crumb) p.artist = crumb;
    if (p.kind === 'album' && title) p.album = title;
    if (p.kind === 'track' && title) p.track = title;
    return p;
  }

  /* Conta logada, lida do topo do site e guardada para a próxima abertura. */
  let me = null;
  async function readMe() {
    const prof = $('.auth-dropdown-profile');
    if (prof) {
      const m = stripLang(prof.getAttribute('href') || '').match(/^\/user\/([^/?#]+)/);
      if (m) {
        const cached = (await ext.getLocal('lfx:me', null)) || {};
        const name = decodePart(m[1]);
        me = {
          ...(cached.name === name ? cached : {}),
          name,
          scrobbles: parseCount(text($('.scrobble-count', prof))) ?? cached.scrobbles ?? null,
          avatar: $('.auth-avatar-desktop')?.getAttribute('src') || cached.avatar || null,
        };
        ext.setLocal('lfx:me', me);
        return me;
      }
    }
    const anon = $('.site-auth--anon, .masthead .join-cta-button');
    if (anon) { me = null; return null; }
    me = await ext.getLocal('lfx:me', null);
    return me;
  }
  const isMe = (name) => !!(me && name && me.name.toLowerCase() === String(name).toLowerCase());
  const userPath = (sub = '') => (me ? `${langPrefix()}/user/${encName(me.name)}${sub}` : `${langPrefix()}/login`);

  function artUrl(p) {
    if (p.kind === 'album' || p.kind === 'album-sub') { const s = $('.album-overview-cover-art img')?.src; if (!isPlaceholder(s)) return s; }
    if (p.kind === 'track') { const s = $('.source-album-art img')?.src; if (!isPlaceholder(s)) return s; }
    const hero = bgUrl($('.header-new-background-image')); if (!isPlaceholder(hero)) return hero;
    const userBg = bgUrl($('.header-background')); if (!isPlaceholder(userBg)) return userBg;
    const avatar = $('.header-avatar img')?.src; if (!isPlaceholder(avatar)) return avatar;
    return null;
  }

  /* ================================================================ *
   * Cores da página (tiradas da capa/foto pelo service worker)
   * ================================================================ */
  function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > .5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  const hsl = (h, s, l) => `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
  // Destaque legível sobre preto (contraste de pelo menos 5,5:1).
  function toAccent(rgb) { const [h, s] = rgbToHsl(rgb); return hsl(h, clamp(s, .5, .9), .72); }
  // Brilho: escuro o bastante para nunca competir com o texto.
  function toGlow(rgb) {
    const [h, s, l] = rgbToHsl(rgb);
    if (s < .12) return 'hsl(240 6% 30%)';
    return hsl(h, clamp(s, .3, .8), clamp(l, .32, .5));
  }
  async function colorOf(url) { return url ? ext.send({ type: 'lfx:color', url: imgSize(url, '300x300') }) : null; }

  let colorToken = 0;
  let lastArt = null;
  async function updateColors(p) {
    const token = ++colorToken;
    const url = artUrl(p);
    if (url === lastArt && url) return;
    lastArt = url;
    const seed = $('.header-new-inner')?.style.background || $('.header-new-inner')?.style.backgroundColor;
    const m = seed && seed.match(/#([0-9a-f]{6})/i);
    if (m) { const n = parseInt(m[1], 16); root.style.setProperty('--lfx-glow', toGlow([n >> 16, (n >> 8) & 255, n & 255])); }
    if (!url) { applyColor(null); return; }
    const res = await colorOf(url);
    if (token !== colorToken) return;
    applyColor(res);
  }
  function applyColor(res) {
    const st = root.style;
    if (res && res.dominant) st.setProperty('--lfx-glow', toGlow(res.vibrant || res.dominant)); else st.removeProperty('--lfx-glow');
    if (S.accentMode === 'auto' && res && res.vibrant) st.setProperty('--lfx-accent', toAccent(res.vibrant));
    else st.setProperty('--lfx-accent', S.accent);
  }

  /* ================================================================ *
   * Serviços de streaming
   * ================================================================ */
  const SERVICES = {
    spotify: ['Spotify', '#1ed760', (q) => `https://open.spotify.com/search/${q}`],
    ytmusic: ['YouTube Music', '#ff4e45', (q) => `https://music.youtube.com/search?q=${q}`],
    apple: ['Apple Music', '#fa586a', (q) => `https://music.apple.com/search?term=${q}`],
    deezer: ['Deezer', '#a238ff', (q) => `https://www.deezer.com/search/${q}`],
    tidal: ['Tidal', '#7ff3ff', (q) => `https://listen.tidal.com/search?q=${q}`],
    youtube: ['YouTube', '#ff3333', (q) => `https://www.youtube.com/results?search_query=${q}`],
    soundcloud: ['SoundCloud', '#ff7a1a', (q) => `https://soundcloud.com/search?q=${q}`],
  };
  const preferred = () => (SERVICES[S.service] ? S.service : 'spotify');
  function serviceUrl(key, query, info) {
    const url = SERVICES[key][2](encodeURIComponent(query));
    if (key !== 'spotify' || !info || !info.kind) return url;
    const artist = info.kind === 'artist' ? info.artist || info.title : info.artist;
    const title = info.kind === 'artist' ? '' : info.title;
    return `${url}#lfx=${encodeURIComponent(JSON.stringify({ k: info.kind, a: artist || '', t: title || '' }))}`;
  }

  /* Menus flutuantes: vão para o <body> enquanto abertos (ficam por cima de tudo e nada os corta)
     e abrem para cima quando falta espaço embaixo. Devolve a função que para de acompanhar o botão. */
  function placeMenu(menu, anchor, align = 'right') {
    const r = anchor.getBoundingClientRect();
    menu.style.maxHeight = '';
    menu.style.top = '0px'; menu.style.left = '0px';
    const mw = menu.offsetWidth, mh = menu.offsetHeight, gap = 8, pad = 10;
    const below = innerHeight - r.bottom - gap - pad, above = r.top - gap - pad;
    const up = mh > below && above > below;
    const room = up ? above : below;
    if (mh > room) menu.style.maxHeight = `${Math.max(120, Math.floor(room))}px`;
    const h = Math.min(mh, Math.max(120, room));
    const top = up ? r.top - gap - h : r.bottom + gap;
    let left = align === 'right' ? r.right - mw : r.left;
    left = Math.max(pad, Math.min(left, innerWidth - mw - pad));
    menu.style.top = `${Math.round(top)}px`; menu.style.left = `${Math.round(left)}px`;
    menu.classList.toggle('lfx-menu--up', up);
  }
  function floatMenu(menu, anchor, align = 'right') {
    menu.classList.add('lfx-menu--float');
    document.body.append(menu);
    placeMenu(menu, anchor, align);
    let raf = 0;
    const follow = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { if (anchor.isConnected && !menu.hidden) placeMenu(menu, anchor, align); }); };
    addEventListener('scroll', follow, { passive: true, capture: true });
    addEventListener('resize', follow, { passive: true });
    return () => { cancelAnimationFrame(raf); removeEventListener('scroll', follow, { capture: true }); removeEventListener('resize', follow); menu.classList.remove('lfx-menu--float', 'lfx-menu--up'); menu.style.top = menu.style.left = menu.style.maxHeight = ''; };
  }
  /* Lista de escolha própria (no lugar do <select> nativo, que no app abre torto ou nem abre) */
  function lfxSelect({ options, value, label, onChange, cls = '' }) {
    let cur = value;
    const btn = el('button', { class: `lfx-sel ${cls}`.trim(), type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-label': label });
    const menu = el('div', { class: 'lfx-menu lfx-sel-menu lfx-layer', role: 'listbox', 'aria-label': label, hidden: true });
    let stop = null;
    const paint = () => {
      const o = options.find((x) => x.value === cur) || options[0];
      btn.replaceChildren(o.color ? el('span', { class: 'lfx-svc-dot', style: `--c:${o.color}`, 'aria-hidden': 'true' }) : '', el('span', { class: 'lfx-sel-text', text: o.label }), el('span', { class: 'lfx-sel-chev', html: ICON.chevron, 'aria-hidden': 'true' }));
      menu.replaceChildren(...options.map((x) => el('button', { type: 'button', role: 'option', class: 'lfx-menu-item', 'aria-selected': String(x.value === cur), 'data-value': x.value, onclick: () => { set(x.value, true); close(); btn.focus(); } },
        x.color ? el('span', { class: 'lfx-svc-dot', style: `--c:${x.color}`, 'aria-hidden': 'true' }) : null, x.label, x.value === cur ? el('span', { class: 'lfx-menu-hint', html: ICON.check || '✓' }) : null)));
    };
    function set(v, fire) { if (v === cur) return; cur = v; paint(); if (fire) onChange?.(v); }
    function onDoc(e) { if (!btn.contains(e.target) && !menu.contains(e.target)) close(); }
    function close() {
      if (menu.hidden) return;
      menu.hidden = true; btn.setAttribute('aria-expanded', 'false');
      stop?.(); stop = null; menu.remove();
      document.removeEventListener('pointerdown', onDoc, true);
      if (openMenuClose === close) openMenuClose = null;
    }
    function open() {
      openMenuClose?.();
      menu.hidden = false; btn.setAttribute('aria-expanded', 'true');
      stop = floatMenu(menu, btn, 'left');
      menu.style.minWidth = `${Math.max(160, btn.offsetWidth)}px`;
      placeMenu(menu, btn, 'left');
      document.addEventListener('pointerdown', onDoc, true);
      openMenuClose = close;
      ($('[aria-selected="true"]', menu) || $('.lfx-menu-item', menu))?.focus({ preventScroll: true });
    }
    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (btn.disabled) return; menu.hidden ? open() : close(); });
    btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
    menu.addEventListener('keydown', (e) => {
      const list = $$('.lfx-menu-item', menu); const i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length]?.focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus(); }
      else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); close(); btn.focus(); }
    });
    paint();
    return { node: btn, get value() { return cur; }, set value(v) { set(v, false); }, set disabled(d) { btn.disabled = !!d; if (d) close(); }, close };
  }

  /* Botão "Ouvir no <serviço preferido>" com menu para os demais. */
  let openMenuClose = null;
  function buildOpenButton(info) {
    const { artist, title, kind } = info;
    const query = [artist, title].filter(Boolean).join(' ');
    const label = [artist, title].filter(Boolean).join(' — ');
    const pref = preferred();
    const [pName, pColor] = SERVICES[pref];
    const wrap = el('div', { class: 'lfx-listen', 'data-key': `${kind}|${query}|${pref}` });
    const main = el('a', { class: 'lfx-open-main', href: serviceUrl(pref, query, info), target: '_blank', rel: 'noopener noreferrer', title: `Abrir no ${pName}` },
      el('span', { class: 'lfx-svc-dot', style: `--c:${pColor}`, 'aria-hidden': 'true' }), `Ouvir no ${pName}`);
    const more = el('button', { class: 'lfx-open-more', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': 'Mais opções', html: ICON.chevron });
    const menu = el('div', { class: 'lfx-menu lfx-layer', role: 'menu', hidden: true });
    menu.append(el('div', { class: 'lfx-menu-label', text: 'Abrir em' }));
    for (const [key, [name, color]] of Object.entries(SERVICES)) {
      if (key === pref) continue;
      menu.append(el('a', { class: 'lfx-menu-item', role: 'menuitem', href: serviceUrl(key, query, info), target: '_blank', rel: 'noopener noreferrer' },
        el('span', { class: 'lfx-svc-dot', style: `--c:${color}`, 'aria-hidden': 'true' }), name));
    }
    const extras = [];
    if (kind === 'track') extras.push(['Letra no Genius', ICON.lyrics, `https://genius.com/search?q=${encodeURIComponent(query)}`]);
    if (kind === 'album') extras.push(['Notas no RateYourMusic', ICON.star, `https://rateyourmusic.com/search?searchterm=${encodeURIComponent(query)}&searchtype=l`]);
    if (kind === 'artist') extras.push(['Wikipédia', ICON.book, `https://${isPt() ? 'pt' : 'en'}.wikipedia.org/w/index.php?search=${encodeURIComponent(artist)}`]);
    if (extras.length) {
      menu.append(el('div', { class: 'lfx-menu-sep' }));
      for (const [name, icon, href] of extras) menu.append(el('a', { class: 'lfx-menu-item', role: 'menuitem', href, target: '_blank', rel: 'noopener noreferrer', html: icon }, name));
    }
    menu.append(el('div', { class: 'lfx-menu-sep' }));
    menu.append(el('button', { class: 'lfx-menu-item', role: 'menuitem', type: 'button', html: ICON.copy, onclick: () => { close(); copy(label, `“${label}” copiado`); } }, 'Copiar nome'));
    menu.append(el('button', { class: 'lfx-menu-item', role: 'menuitem', type: 'button', html: ICON.link, onclick: () => { close(); copy(location.href.split('#')[0], 'Link da página copiado'); } }, 'Copiar link da página'));

    const items = () => $$('.lfx-menu-item', menu);
    let stopFloat = null;
    function close() {
      menu.hidden = true; more.setAttribute('aria-expanded', 'false');
      document.removeEventListener('pointerdown', onDoc, true);
      stopFloat?.(); stopFloat = null;
      // o menu volta para dentro do botão (fica pronto para a próxima vez)
      if (wrap.isConnected) wrap.append(menu); else menu.remove();
      if (openMenuClose === close) openMenuClose = null;
    }
    function onDoc(e) { if (!wrap.contains(e.target) && !menu.contains(e.target)) close(); }
    function open() {
      openMenuClose?.();
      menu.hidden = false; more.setAttribute('aria-expanded', 'true');
      stopFloat = floatMenu(menu, more, 'right');
      document.addEventListener('pointerdown', onDoc, true);
      openMenuClose = close;
      items()[0]?.focus({ preventScroll: true });
    }
    more.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); menu.hidden ? open() : close(); });
    menu.addEventListener('keydown', (e) => {
      const list = items(); const i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length]?.focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); more.focus(); }
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a.lfx-menu-item')) close(); });
    wrap.append(main, more, menu);
    // O herói do Last.fm é um "bloco clicável"; o botão não pode disparar a navegação dele.
    wrap.addEventListener('click', (e) => e.stopPropagation());
    return wrap;
  }
  function pageMusicInfo(p) {
    if (p.kind === 'artist' || p.kind === 'artist-sub') return { kind: 'artist', artist: p.artist, title: '' };
    if (p.kind === 'album') return { kind: 'album', artist: p.artist, title: p.album };
    if (p.kind === 'track') return { kind: 'track', artist: p.artist, title: p.track };
    return null;
  }

  /* ================================================================ *
   * Estrutura de app: barra lateral, busca no topo, tocando agora
   * ================================================================ */
  let side = null;
  function buildSidebar() {
    if (side) return side;
    const scroll = el('div', { class: 'lfx-side-scroll' });
    const np = el('a', { class: 'lfx-np', href: '#', hidden: true, title: '' },
      el('span', { class: 'lfx-np-art' }),
      el('span', { class: 'lfx-np-text' },
        el('span', { class: 'lfx-np-status' }),
        el('div', { class: 'lfx-np-title' }),
        el('div', { class: 'lfx-np-artist' })));
    np.addEventListener('click', (e) => { const href = np.getAttribute('href'); if (href && href !== '#') { e.preventDefault(); go(href, e.ctrlKey || e.metaKey); } });
    const collapse = el('button', { class: 'lfx-side-collapse', type: 'button', html: ICON.collapse, onclick: () => ext.saveSetting('sideCollapsed', !S.sideCollapsed) }, el('span', { text: 'Recolher' }));
    side = el('aside', { class: 'lfx-side-bar lfx-layer', 'aria-label': 'Navegação do Last.fm Hub' }, scroll, np, collapse);
    side.addEventListener('click', (e) => {
      const a = e.target.closest('a.lfx-side-link, a.lfx-side-user');
      if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      if (a.dataset.match?.startsWith('#')) { openView(a.dataset.match.slice(1)); return; }
      go(a.getAttribute('href'));
    });
    document.body.appendChild(side);
    return side;
  }
  function sideLink(href, icon, label, match, kbd) {
    return el('a', { class: 'lfx-side-link', href, 'data-match': match, title: label, html: icon }, el('span', { text: label }), kbd ? el('kbd', { text: kbd }) : null);
  }
  function renderSidebar() {
    if (!S.sidebar) { side?.remove(); side = null; return; }
    buildSidebar();
    const scroll = $('.lfx-side-scroll', side);
    const key = JSON.stringify([me?.name, me?.scrobbles, me?.avatar, langPrefix(), S.catalog, S.premium, S.shows, S.socialHub, S.doppel]);
    if (scroll.dataset.key !== key) {
      scroll.dataset.key = key;
      scroll.textContent = '';
      const L = langPrefix();
      if (me) {
        const avatar = me.avatar && !isPlaceholder(me.avatar) ? el('img', { src: me.avatar, alt: '' }) : el('span', { class: 'lfx-side-avatar', 'aria-hidden': 'true' });
        scroll.append(el('a', { class: 'lfx-side-user', href: userPath(), title: me.name }, avatar,
          el('span', { class: 'lfx-side-user-text' },
            el('div', { class: 'lfx-side-user-name', text: me.display || me.name }),
            el('div', { class: 'lfx-side-user-sub', text: me.scrobbles != null ? `${nf.format(me.scrobbles)} scrobbles` : 'Seu perfil' }))));
      }
      const search = el('button', { class: 'lfx-side-search', type: 'button', onclick: () => openPalette() },
        el('span', { class: 'lfx-side-link', html: ICON.search }, el('span', { text: 'Buscar' }), el('kbd', { text: 'Ctrl K' })));
      scroll.append(search);
      scroll.append(el('div', { class: 'lfx-side-group', text: 'Explorar' }),
        sideLink(`${L}/home`, ICON.home, 'Início', '^/home(/|$)'),
        sideLink(`${L}/music`, ICON.compass, 'Descobrir', '^/music/?$|^/music/\\+'),
        sideLink(`${L}/charts`, ICON.chart, 'Charts', '^/charts'),
        S.shows ? sideLink(`${userPath('/library')}#shows`, ICON.calendar, 'Shows', '#shows') : sideLink(`${L}/events`, ICON.calendar, 'Shows', '^/events'));
      if (me) {
        const u = `/user/${encName(me.name)}`.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        scroll.append(el('div', { class: 'lfx-side-group', text: 'Sua música' }),
          sideLink(userPath(), ICON.user, 'Perfil', `^${u}/?$`),
          sideLink(userPath('/library'), ICON.history, 'Scrobbles', `^${u}/library/?$`),
          sideLink(userPath('/library/artists'), ICON.mic, 'Artistas', `^${u}/library/artists`),
          sideLink(userPath('/library/albums'), ICON.disc, 'Álbuns', `^${u}/library/albums`),
          sideLink(userPath('/library/tracks'), ICON.note, 'Faixas', `^${u}/library/tracks`),
          sideLink(userPath('/loved'), ICON.heart, 'Curtidas', `^${u}/loved`),
          sideLink(userPath('/listening-report/week'), ICON.report, 'Relatórios', `^${u}/listening-report`));
        if (S.catalog) scroll.append(sideLink(`${userPath('/library')}#catalogo`, ICON.layers, 'Catálogo', '#catalogo'));
        if (S.premium) scroll.append(sideLink(`${userPath('/library')}#premium`, ICON.spark, 'Premium', '#premium'));
        if (S.socialHub) scroll.append(sideLink(`${userPath('/library')}#social`, ICON.users || ICON.user, 'Amigos', '#social'));
        if (S.doppel) scroll.append(sideLink(`${userPath('/library')}#doppelganger`, ICON.masks || ICON.spark, 'Doppelgänger', '#doppelganger'));
      } else {
        scroll.append(el('div', { class: 'lfx-side-login' }, 'Entre na sua conta para ver perfil, biblioteca, relatórios e o que está tocando. ', el('a', { href: `${L}/login`, text: 'Entrar' })));
      }
    }
    // Item ativo
    const path = stripLang(location.pathname).toLowerCase();
    const view = currentView();
    for (const a of $$('.lfx-side-link[data-match]', side)) {
      const ok = a.dataset.match.startsWith('#') ? a.dataset.match === `#${view}` : !view && new RegExp(a.dataset.match, 'i').test(path);
      if (ok) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    }
    $('.lfx-side-collapse span', side).textContent = S.sideCollapsed ? 'Expandir' : 'Recolher';
    paintShowsBadge();
  }

  let topSearch = null;
  function renderTopSearch() {
    if (!S.palette || !S.sidebar) { topSearch?.remove(); topSearch = null; return; }
    if (topSearch) return;
    topSearch = el('button', { class: 'lfx-topsearch lfx-layer', type: 'button', 'aria-label': 'Buscar no Last.fm', onclick: () => openPalette(), html: ICON.search },
      el('span', { class: 'lfx-topsearch-text', text: 'Buscar artistas, álbuns, faixas…' }), el('span', { class: 'lfx-kbd', text: 'Ctrl K' }));
    document.body.appendChild(topSearch);
  }

  /* Tocando agora: lê a lista parcial de scrobbles recentes do próprio site. */
  const np = { data: null, timer: 0, busy: false, last: 0, listeners: new Set() };
  async function fetchNowPlaying(force = false) {
    if (!me || !S.nowPlaying || np.busy) return;
    if (!force && Date.now() - np.last < 25000) return;
    np.busy = true;
    try {
      const res = await fetch(`/user/${encName(me.name)}/partial/recenttracks`, { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' });
      if (!res.ok) return;
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const row = $('tr.chartlist-row', doc);
      if (!row) return;
      const a = $('.chartlist-name a', row);
      const img = $('.chartlist-image img', row)?.getAttribute('src');
      const ts = $('.chartlist-timestamp span[title], .chartlist-timestamp [title]', row)?.getAttribute('title');
      const when = parseLfmDate(ts) ?? NaN;
      const data = {
        live: row.classList.contains('chartlist-row--now-scrobbling'),
        title: text(a), artist: text($('.chartlist-artist a', row)),
        path: sameOriginPath(a?.getAttribute('href')),
        img: isPlaceholder(img) ? null : imgSize(img, '300x300'),
        when: isNaN(when) ? null : when,
        ago: ptAgo(text($('.chartlist-timestamp', row))),
        t: Date.now(),
      };
      if (data.img && data.img !== np.data?.img) {
        const c = await colorOf(data.img);
        data.color = c?.vibrant ? toGlow(c.vibrant) : c?.dominant ? toGlow(c.dominant) : null;
      } else data.color = np.data?.color || null;
      np.data = data;
      np.last = Date.now();
      ext.setLocal('lfx:np', data);
      renderNowPlaying();
      np.listeners.forEach((fn) => fn(data));
    } catch (_) { /* rede indisponível: mantém o último estado */ }
    finally { np.busy = false; }
  }
  function npStatus(d) {
    if (d.live) return 'Tocando agora';
    if (d.when) return `Último scrobble · ${timeAgo(Date.now() - d.when)}`;
    return d.ago ? `Último scrobble · ${d.ago}` : 'Último scrobble';
  }
  function renderNowPlaying() {
    const card = side && $('.lfx-np', side);
    if (!card) return;
    const d = np.data;
    if (!S.nowPlaying || !me || !d || !d.title) { card.hidden = true; return; }
    card.hidden = false;
    card.classList.toggle('lfx-live', !!d.live);
    card.setAttribute('href', d.path || '#');
    card.title = `${d.title} — ${d.artist}`;
    if (d.color) card.style.setProperty('--lfx-np-c', d.color);
    const art = $('.lfx-np-art', card);
    const cur = $('img', art);
    if (d.img) { if (!cur || cur.getAttribute('src') !== d.img) { art.textContent = ''; art.append(el('img', { src: d.img, alt: '' })); } } else art.textContent = '';
    const status = $('.lfx-np-status', card);
    status.textContent = '';
    if (d.live) status.append(el('span', { class: 'lfx-eq', 'aria-hidden': 'true', html: '<i></i><i></i><i></i>' }));
    status.append(npStatus(d));
    $('.lfx-np-title', card).textContent = d.title;
    $('.lfx-np-artist', card).textContent = d.artist;
  }
  function startNowPlaying() {
    clearInterval(np.timer);
    if (!S.nowPlaying || !me) { renderNowPlaying(); return; }
    ext.getLocal('lfx:np', null).then((d) => { if (d && !np.data) { np.data = d; renderNowPlaying(); } });
    fetchNowPlaying(true);
    np.timer = setInterval(() => { if (document.visibilityState === 'visible') fetchNowPlaying(); }, 30000);
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') fetchNowPlaying(); });

  /* ================================================================ *
   * Herói: capa, seus scrobbles, "Ouvir no", abas
   * ================================================================ */
  function enhanceHero(p) {
    const content = $('.header-new-content');
    if (!content) return;
    const title = $('.header-new-title', content);
    if (title) title.classList.toggle('lfx-long', text(title).length > 20);

    // Capa grande
    const existing = $('.lfx-hero-cover', content);
    const wrapper = $('#mantle_skin') || content.closest('.adaptive-skin-container');
    let coverSrc = null;
    if (S.heroCover && p.kind === 'album') coverSrc = $('.album-overview-cover-art img')?.src;
    if (S.heroCover && p.kind === 'track') coverSrc = $('.source-album-art img')?.src;
    if (isPlaceholder(coverSrc)) coverSrc = null;
    if (!coverSrc) {
      existing?.remove(); content.classList.remove('lfx-has-cover'); wrapper?.classList.remove('lfx-has-hero-cover');
    } else if (!existing || existing.dataset.src !== coverSrc) {
      existing?.remove();
      const name = p.kind === 'album' ? p.album : text($('.source-album-name'));
      const btn = el('button', {
        class: 'lfx-hero-cover', type: 'button', 'data-src': coverSrc,
        'aria-label': `Ampliar capa de ${name || 'álbum'}`, title: 'Ver capa em alta resolução',
        onclick: (e) => { e.stopPropagation(); openLightbox(imgSize(coverSrc, 'ar0'), name ? `${name} — ${p.artist}` : p.artist); },
      }, el('img', { src: imgSize(coverSrc, '500x500'), alt: '' }));
      content.prepend(btn);
      content.classList.add('lfx-has-cover');
      if (p.kind === 'album') wrapper?.classList.add('lfx-has-hero-cover');
    }

    // Seus scrobbles no herói
    const meta = $('.header-new-info-desktop .header-metadata-tnew', content);
    const mineSrc = $('.personal-stats-item--scrobbles .header-metadata-display a');
    const mine = meta && $('.lfx-mine', meta);
    if (meta && mineSrc && !mine) {
      meta.append(el('li', { class: 'header-metadata-tnew-item lfx-mine' },
        el('h4', { class: 'header-metadata-tnew-title', text: 'Seus scrobbles' }),
        el('div', { class: 'header-metadata-tnew-display' }, el('p', {}, el('a', { href: mineSrc.getAttribute('href'), text: text(mineSrc) })))));
    } else if (mine && !mineSrc) mine.remove();

    // Ouvir no...
    const info = pageMusicInfo(p);
    const host = $('.header-new-info-desktop', content) || content;
    const old = $('.lfx-listen', content);
    if (!S.listen || !info) { old?.remove(); return; }
    const key = `${info.kind}|${[info.artist, info.title].filter(Boolean).join(' ')}|${preferred()}`;
    if (old && old.dataset.key === key) return;
    old?.remove();
    host.appendChild(buildOpenButton(info));
  }

  /* ================================================================ *
   * "Dê um match": recomendações muito parecidas, com afinidade e descarte
   * ================================================================ */
  const match = { seedKey: '', pool: [], excluded: new Set(), ctrl: null, loading: false, seed: null };

  function matchSeed(p) {
    if (p.kind === 'artist' && p.artist) return { type: 'artist', name: p.artist, basePath: p.basePath, label: p.artist, selfPath: p.basePath };
    if (p.kind === 'album' && p.album) return { type: 'album', name: p.album, artist: p.artist, basePath: p.basePath, label: `${p.album} — ${p.artist}`, selfPath: p.basePath };
    if (p.kind === 'track' && p.track) return { type: 'track', name: p.track, artist: p.artist, basePath: p.basePath, label: `${p.track} — ${p.artist}`, selfPath: p.basePath };
    return null;
  }
  const MATCH_LABEL = { artist: 'artistas', album: 'álbuns', track: 'faixas' };

  function enhanceMatch(p) {
    const old = $('.lfx-match-btn');
    const seed = ['artist', 'album', 'track'].includes(p.kind) ? matchSeed(p) : null;
    if (!S.match || !seed) { old?.remove(); return; }
    const key = `${seed.type}:${seed.basePath}`;
    if (old && old.dataset.key === key) return;
    old?.remove();
    const host = $('.header-new-info-desktop') || $('.header-new-content');
    if (!host) return;
    const btn = el('button', {
      class: 'lfx-match-btn lfx-layer', type: 'button', 'data-key': key,
      title: `Encontrar ${MATCH_LABEL[seed.type]} muito parecidos com ${seed.name}`,
      onclick: () => openMatch(seed),
    }, el('span', { class: 'lfx-match-spark', html: ICON.spark, 'aria-hidden': 'true' }), 'Dê um match');
    host.appendChild(btn);
  }

  /* Colhe os links de música (artista/álbum/faixa) de uma página, na ordem, sem repetir. */
  function collectMusic(doc, type, exclude) {
    const scope = mainScope(doc);
    const out = []; const seen = new Set(exclude || []);
    for (const a of $$('a[href*="/music/"]', scope)) {
      const t = musicTarget(a.getAttribute('href'));
      if (!t || t.kind !== type || !text(a) || seen.has(t.path)) continue;
      const cont = a.closest('tr, li, .grid-items-item, [class*="similar"], [class*="-item"]') || a.parentElement;
      const src = cont ? ($('img', cont)?.getAttribute('src') || $('img', cont)?.getAttribute('data-src')) : null;
      out.push({ type, name: t.title, artist: t.artist, path: t.path, img: isPlaceholder(src) ? null : src });
      seen.add(t.path);
    }
    return out;
  }
  /* Tags (gênero/clima) da página atual, para recomendar álbuns parecidos. */
  function pageTags(limit) {
    const tags = [];
    for (const a of $$('.tags-list a, .catalogue-tags a, section.tags a, .tag a')) {
      const t = musicTarget(a.getAttribute('href')); if (t) continue;
      const href = sameOriginPath(a.getAttribute('href')) || '';
      const m = stripLang(href).match(/^\/tag\/([^/?#]+)/);
      if (m && text(a)) { tags.push(decodePart(m[1])); if (tags.length >= (limit || 2)) break; }
    }
    return [...new Set(tags)];
  }
  async function fetchMatchPool(seed, signal) {
    if (seed.type === 'artist') {
      const doc = await getDoc(`${seed.basePath}/+similar`, { signal });
      return collectMusic(doc, 'artist', [seed.selfPath]);
    }
    if (seed.type === 'track') {
      const doc = await getDoc(`${seed.basePath}/+similar`, { signal });
      return collectMusic(doc, 'track', [seed.selfPath]);
    }
    // álbum: não há "+similar"; recomenda álbuns do mesmo gênero (as tags do álbum)
    let tags = pageTags(2);
    if (!tags.length) { try { const td = await getDoc(`${seed.basePath}/+tags`, { signal }); tags = collectTagNames(td, 2); } catch (_) { /* sem tags */ } }
    const out = []; const seen = new Set([seed.selfPath]);
    const sameArtist = artistPathOf(seed.basePath);
    for (const tag of tags) {
      let doc; try { doc = await getDoc(`/tag/${encodeURIComponent(tag)}/albums`, { signal }); } catch (_) { continue; }
      for (const a of collectMusic(doc, 'album', [...seen])) {
        if (artistPathOf(a.path) === sameArtist) continue; // não recomenda o próprio artista
        if (seen.has(a.path)) continue;
        out.push(a); seen.add(a.path);
      }
      if (out.length >= 12) break;
    }
    return out;
  }
  function collectTagNames(doc, limit) {
    const out = [];
    for (const a of $$('a[href*="/tag/"]', mainScope(doc))) {
      const m = stripLang(sameOriginPath(a.getAttribute('href')) || '').match(/^\/tag\/([^/?#]+)$/);
      if (m && text(a)) { out.push(decodePart(m[1])); if (out.length >= (limit || 2)) break; }
    }
    return [...new Set(out)];
  }
  /* Afinidade estimada (0–100) a partir da ordem da lista de semelhantes do Last.fm. */
  function affinity(rank, total, type) {
    const top = type === 'album' ? 94 : 98;        // álbum vem por gênero (um pouco menos "idêntico")
    const span = type === 'album' ? 26 : 32;        // queda do topo até o fim da lista
    const n = Math.max(total - 1, 1);
    return Math.max(70, Math.round(top - (rank / n) * span));
  }
  async function openMatch(seed) {
    const key = `${seed.type}:${seed.basePath}`;
    match.seed = seed; match.seedKey = key;
    match.excluded = new Set(await ext.getLocal(`lfx:match-x:${key}`, []));
    buildMatchOverlay(seed);          // fecha uma janela anterior (e cancela a busca dela)
    match.ctrl = new AbortController(); // só então cria o cancelador desta busca
    paintMatch(true);
    try {
      match.loading = true;
      match.pool = await fetchMatchPool(seed, match.ctrl.signal);
      match.loading = false;
      paintMatch();
    } catch (e) {
      if (e.name === 'AbortError') return;
      match.loading = false; match.pool = []; paintMatch();
    }
  }
  function matchShown() {
    const live = match.pool.filter((x) => !match.excluded.has(x.path));
    return live.map((x, i) => ({ ...x, aff: affinity(i, Math.max(live.length, match.seed.type === 'album' ? 12 : 8), match.seed.type) }));
  }
  function closeMatch() {
    match.ctrl?.abort();
    const box = $('.lfx-match');
    if (!box) return false;
    box.classList.remove('lfx-open');
    setTimeout(() => box.remove(), 260);
    document.removeEventListener('keydown', matchKey, true);
    return true;
  }
  function matchKey(e) { if (e.key === 'Escape') { e.stopPropagation(); closeMatch(); } }
  function buildMatchOverlay(seed) {
    closeMatch();
    const grid = el('div', { class: 'lfx-match-grid' });
    const box = el('div', {
      class: 'lfx-match lfx-layer', role: 'dialog', 'aria-modal': 'true', 'aria-label': `Match para ${seed.label}`,
    },
    el('div', { class: 'lfx-match-card' },
      el('header', { class: 'lfx-match-head' },
        el('div', {},
          el('div', { class: 'lfx-match-kicker' }, el('span', { html: ICON.spark, 'aria-hidden': 'true' }), 'Dê um match'),
          el('h2', { class: 'lfx-match-title', text: seed.label }),
          el('p', { class: 'lfx-match-sub', text: `${MATCH_LABEL[seed.type][0].toUpperCase()}${MATCH_LABEL[seed.type].slice(1)} muito parecidos, do mais parecido ao menos. Descarte o que não combinar.` })),
        el('button', { class: 'lfx-icon-btn lfx-match-close', type: 'button', 'aria-label': 'Fechar', html: ICON.close, onclick: closeMatch })),
      grid,
      el('footer', { class: 'lfx-match-foot' },
        el('span', { class: 'lfx-match-note', text: 'Afinidade estimada pela semelhança do Last.fm.' }),
        el('button', { class: 'lfx-chip lfx-match-reset', type: 'button', html: ICON.undo || ICON.spark, onclick: async () => { match.excluded = new Set(); await ext.setLocal(`lfx:match-x:${match.seedKey}`, []); paintMatch(); } }, 'Restaurar descartados'))));
    box.addEventListener('click', (e) => { if (e.target === box) closeMatch(); });
    document.body.appendChild(box);
    document.addEventListener('keydown', matchKey, true);
    requestAnimationFrame(() => box.classList.add('lfx-open'));
    $('.lfx-match-close', box)?.focus();
  }
  function paintMatch(loading) {
    const grid = $('.lfx-match-grid'); if (!grid) return;
    const reset = $('.lfx-match-reset');
    if (loading || match.loading) {
      grid.replaceChildren(...Array.from({ length: 4 }, () => el('div', { class: 'lfx-match-item lfx-match-skel' })));
      if (reset) reset.hidden = true;
      return;
    }
    const shown = matchShown();
    if (reset) reset.hidden = match.excluded.size === 0;
    if (!shown.length) {
      grid.replaceChildren(el('div', { class: 'lfx-match-empty' },
        el('span', { html: ICON.spark, 'aria-hidden': 'true' }),
        el('p', { text: match.excluded.size ? 'Você descartou tudo. Restaure para ver de novo.' : `Não encontrei ${MATCH_LABEL[match.seed.type]} parecidos agora.` })));
      return;
    }
    grid.replaceChildren(...shown.map((x) => matchItem(x)));
  }
  function matchItem(x) {
    const seed = match.seed;
    const query = [x.artist, x.type === 'artist' ? '' : x.name].filter(Boolean).join(' ') || x.name;
    const info = { kind: x.type, artist: x.type === 'artist' ? x.name : x.artist, title: x.type === 'artist' ? '' : x.name };
    const pref = preferred();
    const round = x.type === 'artist';
    const card = el('div', { class: `lfx-match-item${round ? ' lfx-round-item' : ''}` },
      el('button', { class: 'lfx-match-x', type: 'button', title: 'Não se parece — descartar', 'aria-label': `Descartar ${x.name}`, html: ICON.close, onclick: () => dismissMatch(x.path) }),
      el('a', { class: 'lfx-match-art', href: x.path, 'data-go': '', title: `Abrir ${x.name} no Last.fm` },
        x.img ? el('img', { src: imgSize(x.img, '300x300'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-match-ph', html: x.type === 'artist' ? ICON.mic : x.type === 'album' ? ICON.disc : ICON.note })),
      el('div', { class: 'lfx-match-aff', title: 'Afinidade estimada pela semelhança do Last.fm' },
        el('span', { class: 'lfx-match-bar', style: `--p:${x.aff}%` }), el('span', { class: 'lfx-match-pct', text: `${x.aff}%` })),
      el('a', { class: 'lfx-match-name', href: x.path, 'data-go': '', text: x.name }),
      x.type !== 'artist' ? el('span', { class: 'lfx-match-artist', text: x.artist || '' }) : null,
      el('a', { class: 'lfx-match-play', href: serviceUrl(pref, query, info), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${SERVICES[pref][0]}` },
        el('span', { class: 'lfx-svc-dot', style: `--c:${SERVICES[pref][1]}`, 'aria-hidden': 'true' }), `Ouvir no ${SERVICES[pref][0]}`));
    return card;
  }
  async function dismissMatch(path) {
    match.excluded.add(path);
    await ext.setLocal(`lfx:match-x:${match.seedKey}`, [...match.excluded].slice(-200));
    paintMatch();
  }

  function enhanceTabs(p) {
    const header = $('header.header-new');
    const old = $('.lfx-tabs');
    const kinds = ['artist', 'album', 'track'];
    if (!S.artistTabs || !header || !kinds.includes(p.kind) || $('.secondary-nav', header)) { old?.remove(); return; }
    const base = langPrefix() + p.basePath;
    if (old && old.dataset.base === base) return;
    old?.remove();
    const sets = {
      artist: [['', 'Visão geral'], ['/+tracks', 'Faixas'], ['/+albums', 'Álbuns'], ['/+images', 'Fotos'], ['/+similar', 'Semelhantes'], ['/+events', 'Shows'], ['/+wiki', 'Biografia'], ['/+tags', 'Tags'], ['/+listeners', 'Ouvintes'], ['/+shoutbox', 'Comentários']],
      album: [['', 'Visão geral'], ['/+wiki', 'Sobre'], ['/+tags', 'Tags'], ['/+images', 'Capas'], ['/+shoutbox', 'Comentários']],
      track: [['', 'Visão geral'], ['/+wiki', 'Sobre'], ['/+albums', 'Álbuns'], ['/+tags', 'Tags'], ['/+shoutbox', 'Comentários']],
    };
    const nav = el('nav', { class: 'lfx-tabs lfx-layer', 'aria-label': 'Seções', 'data-base': base });
    for (const [suffix, label] of sets[p.kind]) {
      const a = el('a', { class: 'lfx-tab', href: base + suffix, text: label });
      if (!suffix) a.setAttribute('aria-current', 'page');
      nav.append(a);
    }
    if (me && p.kind === 'artist') nav.append(el('a', { class: 'lfx-tab', href: userPath(`/library/music/${p.artistPath.split('/')[2]}`), text: 'Na sua biblioteca' }));
    header.after(nav);
  }

  /* ================================================================ *
   * Topo compacto ao rolar
   * ================================================================ */
  let mini = null, miniIO = null, miniTarget = null;
  function heroInfo(p) {
    if (['artist', 'artist-sub', 'album', 'track'].includes(p.kind)) {
      const isArtist = p.kind.startsWith('artist');
      const img = isArtist ? bgUrl($('.header-new-background-image')) : $('.lfx-hero-cover img')?.src || artUrl(p);
      return {
        title: isArtist ? p.artist : p.kind === 'album' ? p.album : p.track,
        sub: isArtist ? 'Artista' : `${p.kind === 'album' ? 'Álbum' : 'Faixa'} · ${p.artist}`,
        img: isPlaceholder(img) ? null : imgSize(img, '300x300'), round: isArtist,
        play: $('.header-new-info-desktop .header-new-playlink, .header-new-playlink'),
        music: pageMusicInfo(p),
      };
    }
    if (p.kind === 'user' || p.kind === 'user-sub') {
      const img = $('.header-avatar img')?.src;
      return { title: text($('.header-title')) || p.user, sub: 'Perfil', img: isPlaceholder(img) ? null : img, round: true, play: null, music: null };
    }
    return null;
  }
  function enhanceMini(p) {
    const target = $('header.header-new') || $('header.header');
    const info = target && S.miniHeader ? heroInfo(p) : null;
    if (!info) { mini?.classList.remove('lfx-show'); miniIO?.disconnect(); miniTarget = null; return; }
    if (!mini) {
      mini = el('div', { class: 'lfx-mini lfx-layer', role: 'region', 'aria-label': 'Resumo da página' });
      document.body.appendChild(mini);
    }
    const key = JSON.stringify([info.title, info.sub, info.img, preferred(), S.listen]);
    if (mini.dataset.key !== key) {
      mini.dataset.key = key;
      mini.textContent = '';
      const art = el('div', { class: 'lfx-mini-art' + (info.round ? ' lfx-round' : '') });
      if (info.img) art.append(el('img', { src: info.img, alt: '' }));
      const actions = el('div', { class: 'lfx-mini-actions' });
      if (info.play && !S.listen) actions.append(el('button', { class: 'lfx-btn-play', type: 'button', 'aria-label': 'Tocar', title: 'Tocar', html: ICON.play, onclick: () => heroInfo(getPage())?.play?.click() }));
      if (info.music && S.listen) actions.append(buildOpenButton(info.music));
      mini.append(art, el('div', { class: 'lfx-mini-text' }, el('div', { class: 'lfx-mini-title', text: info.title }), el('div', { class: 'lfx-mini-sub', text: info.sub })), actions);
    }
    if (miniTarget !== target) {
      miniIO?.disconnect();
      miniTarget = target;
      miniIO = new IntersectionObserver(([en]) => {
        const show = !en.isIntersecting && en.boundingClientRect.top < 0;
        mini.classList.toggle('lfx-show', show);
        if (!show) openMenuClose?.();
      }, { rootMargin: `-${parseInt(getComputedStyle(root).getPropertyValue('--lfx-mast-h'), 10) + 90 || 150}px 0px 0px 0px`, threshold: 0 });
      miniIO.observe(target);
    }
  }

  /* ================================================================ *
   * Página inicial: painel pessoal
   * ================================================================ */
  function greeting() {
    const h = new Date().getHours();
    return h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  }
  async function dashData(force = false) {
    const cache = await ext.getLocal('lfx:dash', null);
    if (!force && cache && cache.user === me.name && Date.now() - cache.t < 10 * 60 * 1000) return cache;
    const out = { user: me.name, t: Date.now(), week: null, top: [] };
    const base = `/user/${encName(me.name)}`;
    const hdr = { headers: { 'X-Requested-With': 'XMLHttpRequest' }, credentials: 'include' };
    const [w, t] = await Promise.allSettled([
      fetch(`${base}/your-progress/week?ajax=1`, hdr).then((r) => (r.ok ? r.json() : null)),
      fetch(`${base}/library/artists?date_preset=LAST_7_DAYS&ajax=1`, hdr).then((r) => (r.ok ? r.text() : '')),
    ]);
    if (w.status === 'fulfilled' && w.value) out.week = parseCount(String(w.value.header || '').split(/\s/)[0]);
    if (t.status === 'fulfilled' && t.value) {
      const doc = new DOMParser().parseFromString(t.value, 'text/html');
      for (const row of $$('tr.chartlist-row', doc)) {
        if (row.className.includes('placeholder')) continue;
        const a = $('.chartlist-name a', row);
        const img = $('.chartlist-image img', row)?.getAttribute('src');
        const n = parseCount(text($('.chartlist-count-bar-value', row)));
        if (a) out.top.push({ name: text(a), path: sameOriginPath(a.getAttribute('href')), img: isPlaceholder(img) ? null : imgSize(img, '300x300'), n });
        if (out.top.length >= 5) break;
      }
    }
    ext.setLocal('lfx:dash', out);
    return out;
  }
  function npCard(d) {
    const card = el('a', { class: 'lfx-card lfx-card-wide lfx-card-np', href: d?.path || userPath('/library') });
    card.addEventListener('click', (e) => { e.preventDefault(); go(card.getAttribute('href'), e.ctrlKey || e.metaKey); });
    if (!d || !d.title) {
      card.append(el('div', { class: 'lfx-card-np-art lfx-skel' }), el('div', { class: 'lfx-card-np-text' }, el('div', { class: 'lfx-card-label', text: 'Tocando agora' }), el('div', { class: 'lfx-card-np-artist', text: 'Nada tocando no momento.' })));
      return card;
    }
    if (d.color) card.style.setProperty('--lfx-np-c', d.color);
    const label = el('div', { class: 'lfx-card-label' });
    if (d.live) label.append(el('span', { class: 'lfx-eq', 'aria-hidden': 'true', html: '<i></i><i></i><i></i>' }));
    label.append(npStatus(d));
    card.append(el('div', { class: 'lfx-card-np-art' }, d.img ? el('img', { src: d.img, alt: '' }) : null),
      el('div', { class: 'lfx-card-np-text' }, label, el('div', { class: 'lfx-card-np-title', text: d.title }), el('div', { class: 'lfx-card-np-artist', text: d.artist })));
    return card;
  }
  async function enhanceHome(p) {
    const existing = $('.lfx-home');
    if (!S.homeDash || p.kind !== 'home' || !me) { existing?.remove(); return; }
    const pc = $('.page-content');
    if (!pc || (existing && existing.dataset.user === me.name)) return;
    existing?.remove();
    // Saudação e painel vêm antes das abas de recomendação, como uma página inicial de app
    const box = el('section', { class: 'lfx-home lfx-layer container', 'data-user': me.name, 'aria-label': 'Seu resumo' });
    const date = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    box.append(el('div', { class: 'lfx-home-hello' }, el('div', {}, el('h1', { text: `${greeting()}, ${me.display || me.name}` }), el('p', { text: date.charAt(0).toUpperCase() + date.slice(1) }))));
    const bento = el('div', { class: 'lfx-bento' });
    box.append(bento);
    if ($('.recs-feed')) box.append(el('h2', { class: 'lfx-home-h2', text: 'Recomendações para você' }));
    const top = pc.parentElement && $('.content-top', pc.parentElement);
    if (top) top.before(box); else pc.prepend(box);

    const renderBento = (data) => {
      bento.textContent = '';
      bento.append(npCard(np.data));
      const week = el('a', { class: 'lfx-card', href: userPath('/listening-report/week') },
        el('div', { class: 'lfx-card-label', text: 'Esta semana' }),
        el('div', { class: 'lfx-card-value' }, data?.week != null ? nf.format(data.week) : '—', el('small', { text: 'scrobbles' })),
        el('div', { class: 'lfx-card-foot', text: 'Ver relatório da semana' }));
      const total = el('a', { class: 'lfx-card', href: userPath('/library') },
        el('div', { class: 'lfx-card-label', text: 'No total' }),
        el('div', { class: 'lfx-card-value' }, me.scrobbles != null ? nf.format(me.scrobbles) : '—', el('small', { text: 'scrobbles' })),
        el('div', { class: 'lfx-card-foot', text: me.since ? `Desde ${new Date(me.since).getFullYear()}` : 'Abrir a biblioteca' }));
      const topCard = el('div', { class: 'lfx-card lfx-card-wide' }, el('div', { class: 'lfx-card-label', text: 'Seus artistas da semana' }));
      const list = el('div', { class: 'lfx-toplist' });
      const max = Math.max(1, ...(data?.top || []).map((x) => x.n || 0));
      (data?.top || []).forEach((a, i) => {
        const row = el('a', { class: 'lfx-toprow', href: a.path || '#' },
          el('span', { class: 'lfx-toprow-i', text: String(i + 1) }),
          a.img ? el('img', { src: a.img, alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-toprow-ph' }),
          el('span', { class: 'lfx-toprow-name' }, a.name, el('span', { class: 'lfx-toprow-bar', style: `width:${Math.round(((a.n || 0) / max) * 100)}%; animation-delay:${0.15 + i * 0.06}s` })),
          el('span', { class: 'lfx-toprow-n', text: a.n != null ? nf.format(a.n) : '' }));
        list.append(row);
      });
      if (!data) for (let i = 0; i < 5; i++) list.append(el('div', { class: 'lfx-skel', style: 'height:34px' }));
      else if (!data.top.length) list.append(el('div', { class: 'lfx-card-foot', text: 'Nenhum scrobble nos últimos 7 dias.' }));
      topCard.append(list);
      const hero = data?.top?.[0];
      const heroCard = el('a', { class: 'lfx-card lfx-card-wide lfx-card-hero', href: hero?.path || userPath('/library/artists') });
      if (hero?.img) {
        heroCard.append(el('img', { class: 'lfx-card-hero-img', src: imgSize(hero.img, '770x0'), alt: '', decoding: 'async' }), el('span', { class: 'lfx-card-hero-shade' }));
      }
      heroCard.append(el('div', { class: 'lfx-card-label', text: 'Mais ouvido da semana' }),
        el('div', { class: 'lfx-card-value', text: hero?.name || '—' }),
        el('div', { class: 'lfx-card-foot' }, hero?.n != null ? el('b', { text: `${nf.format(hero.n)} scrobbles` }) : 'Ouça algo para aparecer aqui'));
      bento.append(week, total, topCard, heroCard);
      for (const a of $$('a.lfx-card:not(.lfx-card-np), a.lfx-toprow', bento)) {
        a.addEventListener('click', (e) => { const h = a.getAttribute('href'); if (h && h !== '#') { e.preventDefault(); go(h, e.ctrlKey || e.metaKey); } });
      }
    };
    renderBento(null);
    const data = await dashData().catch(() => null);
    if (box.isConnected) renderBento(data || { week: null, top: [] });
    const onNp = () => { if (!box.isConnected) { np.listeners.delete(onNp); return; } const old = $('.lfx-card-np', bento); old?.replaceWith(npCard(np.data)); };
    np.listeners.add(onNp);
  }

  function enhanceRecs() {
    const kinds = { track: 'Faixa', artist: 'Artista', album: 'Álbum', event: 'Show' };
    for (const li of $$('.recs-feed-item:not([data-lfx-kind])')) {
      const m = li.className.match(/recs-feed-item--(track|artist|album|event)/);
      if (m) li.setAttribute('data-lfx-kind', kinds[m[1]]);
    }
  }

  /* ================================================================ *
   * Perfil: ritmo de escuta
   * ================================================================ */
  const MONTHS = [
    ['jan', 'ene', 'gen'], ['feb', 'fev', 'fév'], ['mar', 'mär'], ['apr', 'abr', 'avr'],
    ['may', 'mai', 'mag'], ['jun', 'jui', 'giu'], ['jul', 'lug'], ['aug', 'ago', 'aoû', 'aou'],
    ['sep', 'set'], ['oct', 'out', 'okt', 'ott'], ['nov'], ['dec', 'dez', 'déc', 'dic'],
  ];
  function parseSince(str) {
    if (!str) return null;
    const s = normalize(str).replace(/[.,]/g, ' ');
    const y = s.match(/\b(19|20)\d{2}\b/); if (!y) return null;
    const d = s.match(/\b([0-3]?\d)\b/);
    let month = -1;
    for (const tok of s.split(/\s+/)) {
      if (!/^[a-z]/.test(tok)) continue;
      const i = MONTHS.findIndex((alts) => alts.some((a) => tok.startsWith(normalize(a))));
      if (i >= 0) { month = i; break; }
    }
    const date = new Date(+y[0], month >= 0 ? month : 0, d ? +d[1] : 1);
    return isNaN(date) ? null : date;
  }
  function enhanceProfile(p) {
    // visual mais caprichado nas páginas de perfil (scrobbles, mais ouvidos, sobre mim) — ver o CSS .lfx-profile
    root.classList.toggle('lfx-profile', S.stats && (p.kind === 'user' || p.kind === 'user-sub'));
    const head = $('header.header--user.header--overview');
    const existing = $('.lfx-insights');
    if (p.kind !== 'user' || !head) { existing?.remove(); return; }
    let scrobbles = null;
    for (const item of $$('.header-metadata-item', head)) {
      if (/scrobble/.test(normalize(text($('.header-metadata-title', item))))) { scrobbles = parseCount(text($('.header-metadata-display', item))); break; }
    }
    const since = parseSince(text($('.header-scrobble-since', head)));
    if (isMe(p.user) && me) {
      const display = text($('.header-title-display-name', head)) || null;
      const changed = me.display !== display || (since && me.since !== since.getTime());
      if (changed) { me.display = display; if (since) me.since = since.getTime(); ext.setLocal('lfx:me', me); renderSidebar(); }
    }
    if (!S.stats) { existing?.remove(); return; }
    if (existing && existing.dataset.user === p.user) return;
    existing?.remove();
    if (!scrobbles || !since) return;
    const days = Math.max(1, (Date.now() - since.getTime()) / 86400000);
    const perDay = scrobbles / days;
    const years = days / 365.25;
    const listenDays = (scrobbles * 3.5) / 60 / 24; // estimativa: 3,5 min por faixa
    const item = (label, value, unit, title) => el('div', { class: 'lfx-insight', title }, el('span', { class: 'lfx-insight-label', text: label }), el('span', { class: 'lfx-insight-value' }, value, unit ? el('small', { text: unit }) : null));
    const box = el('div', { class: 'lfx-insights lfx-layer', 'data-user': p.user, role: 'group', 'aria-label': 'Ritmo de escuta' },
      item('Por dia', `≈ ${nf1.format(perDay)}`, 'scrobbles', `${nf.format(scrobbles)} scrobbles em ${nf.format(Math.round(days))} dias`),
      item('Por mês', nf.format(Math.round(perDay * 30.44)), 'scrobbles', 'Média mensal desde o primeiro scrobble'),
      item('Scrobblando há', years >= 1 ? nf1.format(years) : nf.format(Math.round(days)), years >= 1 ? 'anos' : 'dias', `Desde ${since.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`),
      item('Música ouvida', `≈ ${nf.format(Math.round(listenDays))}`, 'dias', 'Estimativa considerando 3,5 minutos por faixa'));
    ($('.header-info-secondary', head) || $('.header-info', head))?.appendChild(box);
  }

  /* ================================================================ *
   * Listas: filtro instantâneo + modo grade
   * ================================================================ */
  function listKey(p) {
    const parts = p.parts.slice();
    if (parts[0] === 'user') parts.splice(1, 1);
    if (parts[0] === 'music') parts.splice(1, parts[2] === '_' ? 3 : parts[2] && !parts[2].startsWith('+') ? 2 : 1);
    return 'lfx:grid:' + (parts.join('/') || 'home');
  }
  function moveThumb(seg) {
    const on = $('button[aria-pressed="true"]', seg);
    const thumb = $('.lfx-seg-thumb', seg);
    if (!on || !thumb) return;
    thumb.style.width = `${on.offsetWidth}px`;
    thumb.style.transform = `translateX(${on.offsetLeft - 4}px)`;
  }
  const toolBars = new WeakMap();
  async function enhanceTables(p) {
    if (!S.listTools) {
      $$('.lfx-toolbar').forEach((t) => t.remove());
      $$('table.lfx-gridmode').forEach((t) => t.classList.remove('lfx-gridmode'));
      $$('tr.lfx-hidden-row').forEach((r) => r.classList.remove('lfx-hidden-row'));
      $$('[data-lfx-tools]').forEach((t) => delete t.dataset.lfxTools);
      return;
    }
    // Ferramentas de tabelas que o site já substituiu (a biblioteca recarrega a lista).
    for (const bar of $$('.lfx-toolbar')) if (!(bar.__lfxTables || []).some((t) => t.isConnected)) bar.remove();
    if (p.kind === 'user' || p.kind === 'home') return;
    const inLibrary = /\/library(\/|$)|\/\+(tracks|albums)|\/loved/.test(p.path);
    const groups = new Map();
    for (const t of $$('#content table.chartlist')) {
      const sec = t.closest('section.tracklist-section');
      const key = sec ? sec.parentElement : t;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(t);
    }
    const gridKey = listKey(p);
    for (const [, group] of groups) {
      const first = group[0];
      // A biblioteca guarda e reinsere o HTML da lista: o atributo volta, mas a
      // barra de ferramentas (e seus eventos) não. Só conta a barra que ainda existe.
      const live = toolBars.get(first);
      if (live && live.isConnected) {
        if (first.classList.contains('lfx-gridmode')) upgradeImages(group);
        continue;
      }
      const rows = () => group.flatMap((t) => $$('tr.chartlist-row', t).filter((r) => !r.className.includes('placeholder')));
      if (rows().length < (inLibrary ? 8 : 20)) continue;
      first.dataset.lfxTools = '1';
      const count = el('span', { class: 'lfx-filter-count', 'aria-live': 'polite' });
      const input = el('input', { type: 'search', placeholder: 'Filtrar nesta página', 'aria-label': 'Filtrar itens desta página', autocomplete: 'off', spellcheck: 'false' });
      const bar = el('div', { class: 'lfx-toolbar lfx-layer' }, el('label', { class: 'lfx-filter', html: ICON.search }, input), count);
      bar.__lfxTables = group;
      toolBars.set(first, bar);
      input.addEventListener('input', () => {
        const q = normalize(input.value); let shown = 0; const all = rows();
        for (const r of all) {
          if (!r.dataset.lfxText) r.dataset.lfxText = normalize(text($('.chartlist-name', r)) + ' ' + text($('.chartlist-artist', r)));
          const ok = !q || r.dataset.lfxText.includes(q);
          r.classList.toggle('lfx-hidden-row', !ok);
          if (ok) shown++;
        }
        count.textContent = q ? `${nf.format(shown)} de ${nf.format(all.length)}` : '';
      });
      input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.value = ''; input.dispatchEvent(new Event('input')); input.blur(); } });
      if (rows().some((r) => $('.chartlist-image', r))) {
        const bList = el('button', { type: 'button', 'aria-pressed': 'true', html: ICON.list }, 'Lista');
        const bGrid = el('button', { type: 'button', 'aria-pressed': 'false', html: ICON.grid }, 'Grade');
        const seg = el('div', { class: 'lfx-seg', role: 'group', 'aria-label': 'Modo de exibição' }, el('span', { class: 'lfx-seg-thumb', 'aria-hidden': 'true' }), bList, bGrid);
        const setMode = (grid, save) => {
          bList.setAttribute('aria-pressed', String(!grid));
          bGrid.setAttribute('aria-pressed', String(grid));
          for (const t of group) t.classList.toggle('lfx-gridmode', grid);
          if (grid) upgradeImages(group);
          requestAnimationFrame(() => { moveThumb(seg); alignTwoLineLists(); });
          if (save) ext.setLocal(gridKey, grid);
        };
        bList.addEventListener('click', () => setMode(false, true));
        bGrid.addEventListener('click', () => setMode(true, true));
        bar.append(seg);
        if (await ext.getLocal(gridKey, false)) setMode(true, false);
        requestAnimationFrame(() => moveThumb(seg));
      }
      const anchor = first.closest('section.tracklist-section') || first;
      anchor.parentElement.insertBefore(bar, anchor);
    }
  }
  // Em listas com barra de contagem o site põe o artista em posição absoluta,
  // embaixo do nome, com um "left" calculado para as colunas originais. Como as
  // colunas mudaram de largura, o artista caía em cima do coração; aqui ele é
  // alinhado com o início real do nome.
  function alignTwoLineLists() {
    for (const t of $$('#content table.chartlist')) {
      const row = $('tr.chartlist-row', t);
      const artist = row && $('td.chartlist-artist', row);
      const name = row && $('td.chartlist-name', row);
      const twoLine = !!(artist && name && !t.classList.contains('lfx-gridmode') && getComputedStyle(artist).position === 'absolute');
      t.classList.toggle('lfx-two-line', twoLine);
      if (!twoLine) continue;
      if (!name.offsetWidth || artist.offsetParent !== name.offsetParent) continue;
      // o CSS zera margem e recuo do artista; o texto começa onde começa o do nome
      const pad = parseFloat(getComputedStyle(name).paddingLeft) || 0;
      t.style.setProperty('--lfx-artist-left', `${Math.round(name.offsetLeft + pad)}px`);
      t.style.setProperty('--lfx-artist-w', `${Math.max(60, Math.round(name.offsetWidth - pad))}px`);
    }
  }
  let alignTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(alignTimer); alignTimer = setTimeout(alignTwoLineLists, 120); }, { passive: true });

  // Com os anúncios escondidos, várias páginas (shows, gráficos) ficam com a coluna
  // lateral vazia: um buraco de ~400px à direita. A coluna principal ocupa o espaço.
  function collapseEmptySidebars() {
    for (const side of $$('#content .page-content .row > .col-sidebar')) {
      const empty = ![...side.children].some((c) => c.offsetHeight > 2 && getComputedStyle(c).visibility !== 'hidden');
      side.parentElement.classList.toggle('lfx-no-side', empty);
    }
  }

  function upgradeImages(group) {
    for (const t of group) for (const img of $$('.chartlist-image img', t)) {
      const src = img.getAttribute('src');
      const big = imgSize(src, '300x300');
      if (big && big !== src && !isPlaceholder(big)) img.src = big;
    }
  }

  /* ================================================================ *
   * Visualizador de imagens em alta resolução
   * ================================================================ */
  function openLightbox(src, caption) {
    closeLightbox();
    const img = el('img', { alt: caption || '' });
    const meta = el('span', { class: 'lfx-lightbox-meta', text: 'Carregando…' });
    const box = el('div', { class: 'lfx-lightbox lfx-layer', role: 'dialog', 'aria-modal': 'true', 'aria-label': caption || 'Imagem' },
      img,
      el('button', { class: 'lfx-lightbox-close', type: 'button', 'aria-label': 'Fechar', html: ICON.close, onclick: closeLightbox }),
      el('div', { class: 'lfx-lightbox-bar' }, meta,
        el('a', { class: 'lfx-chip', href: src, target: '_blank', rel: 'noopener noreferrer', html: ICON.external }, 'Abrir original'),
        el('button', { class: 'lfx-chip', type: 'button', html: ICON.copy, onclick: () => copy(src, 'Link da imagem copiado') }, 'Copiar link')));
    box.addEventListener('click', (e) => { if (e.target === box) closeLightbox(); });
    img.addEventListener('load', () => { img.classList.add('lfx-loaded'); meta.textContent = `${caption ? caption + ' · ' : ''}${img.naturalWidth} × ${img.naturalHeight}`; });
    img.addEventListener('error', () => { meta.textContent = 'Não foi possível carregar a imagem original.'; });
    img.src = src;
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('lfx-open'));
    $('.lfx-lightbox-close', box).focus();
  }
  function closeLightbox() {
    const box = $('.lfx-lightbox');
    if (!box) return false;
    box.classList.remove('lfx-open');
    setTimeout(() => box.remove(), 300);
    return true;
  }

  /* ================================================================ *
   * Histórico de páginas (para a busca rápida)
   * ================================================================ */
  async function recordVisit(p) {
    const kinds = { artist: 'Artista', album: 'Álbum', track: 'Faixa', user: 'Perfil', tag: 'Tag' };
    if (!kinds[p.kind]) return;
    const title = p.kind === 'artist' ? p.artist : p.kind === 'album' ? p.album : p.kind === 'track' ? p.track : p.kind === 'user' ? p.user : p.tag;
    const sub = p.kind === 'album' || p.kind === 'track' ? p.artist : kinds[p.kind];
    let img = p.kind === 'album' ? $('.album-overview-cover-art img')?.src
      : p.kind === 'track' ? $('.source-album-art img')?.src
      : p.kind === 'artist' ? bgUrl($('.header-new-background-image'))
      : p.kind === 'user' ? $('.header-avatar img')?.src : null;
    if (isPlaceholder(img)) img = null;
    const entry = { path: location.pathname, title, sub, kind: kinds[p.kind], type: p.kind, img: img ? imgSize(img, '300x300') : null, round: p.kind === 'artist' || p.kind === 'user', t: Date.now() };
    const list = (await ext.getLocal('lfx:history', [])).filter((e) => e.path !== entry.path);
    list.unshift(entry);
    await ext.setLocal('lfx:history', list.slice(0, 30));
  }

  /* ================================================================ *
   * Busca rápida (Ctrl+K ou /), com prévia
   * ================================================================ */
  const SCOPES = [['all', 'Tudo'], ['artists', 'Artistas'], ['albums', 'Álbuns'], ['tracks', 'Faixas'], ['actions', 'Ações']];
  const palette = { open: false, node: null, input: null, list: null, preview: null, items: [], sel: 0, ctrl: null, timer: null, scope: 'all', cache: new Map() };

  function paletteActions() {
    const acts = [];
    if (me) {
      acts.push({ title: 'Meu perfil', sub: me.name, icon: ICON.user, path: userPath(), key: 'G P', kind: 'Ação' });
      acts.push({ title: 'Scrobbles recentes', sub: 'Biblioteca', icon: ICON.history, path: userPath('/library'), key: 'G L', kind: 'Ação' });
      acts.push({ title: 'Relatório da semana', sub: 'Last.week', icon: ICON.report, path: userPath('/listening-report/week'), key: 'G R', kind: 'Ação' });
      acts.push({ title: 'Meus artistas', sub: 'Biblioteca › Artistas', icon: ICON.mic, path: userPath('/library/artists'), kind: 'Ação' });
      acts.push({ title: 'Faixas curtidas', sub: 'Biblioteca › Curtidas', icon: ICON.heart, path: userPath('/loved'), kind: 'Ação' });
      if (S.catalog) acts.push({ title: 'Catálogo', sub: 'Seus gêneros, ouvir depois e descobertas', icon: ICON.layers, kind: 'Ação', run: openCatalog });
      if (S.premium) acts.push({ title: 'Recomendações Premium', sub: 'Busque por gêneros álbuns de bandas que você nunca ouviu', icon: ICON.spark, kind: 'Ação', run: openPremium });
    }
    acts.push({ title: 'Início', sub: 'Recomendações e seu resumo', icon: ICON.home, path: `${langPrefix()}/home`, key: 'G H', kind: 'Ação' });
    acts.push({ title: 'Charts globais', sub: 'Artistas e faixas em alta', icon: ICON.chart, path: `${langPrefix()}/charts`, key: 'G C', kind: 'Ação' });
    acts.push({ title: S.sidebar ? (S.sideCollapsed ? 'Expandir a barra lateral' : 'Recolher a barra lateral') : 'Mostrar a barra lateral', sub: 'Navegação à esquerda', icon: ICON.sidebar, key: 'B', kind: 'Ação', run: toggleSidebar });
    acts.push({ title: S.wide ? 'Usar layout padrão' : 'Usar layout amplo', sub: 'Aproveita telas largas e ultrawide', icon: ICON.wide, key: 'W', kind: 'Ação', run: toggleWide });
    acts.push({ title: S.animations ? 'Desativar animações' : 'Ativar animações', sub: 'Transições e efeitos de movimento', icon: ICON.motion, kind: 'Ação', run: () => { ext.saveSetting('animations', !S.animations); toast(S.animations ? 'Animações ativadas' : 'Animações desativadas'); } });
    acts.push({ title: 'Atalhos de teclado', sub: 'Ver a lista completa', icon: ICON.keyboard, key: '?', kind: 'Ação', run: openHelp });
    return acts;
  }

  function buildPalette() {
    const input = el('input', { class: 'lfx-palette-input', type: 'text', placeholder: 'Buscar artistas, álbuns, faixas ou ações', 'aria-label': 'Buscar', autocomplete: 'off', spellcheck: 'false', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': 'lfx-palette-list', 'aria-autocomplete': 'list' });
    const spinner = el('span', { class: 'lfx-spinner', hidden: true });
    const scopes = el('div', { class: 'lfx-scopes', role: 'group', 'aria-label': 'Filtrar resultados' });
    for (const [key, label] of SCOPES) {
      scopes.append(el('button', { class: 'lfx-scope', type: 'button', 'data-scope': key, 'aria-pressed': String(key === palette.scope), onclick: () => setScope(key) }, label));
    }
    const list = el('div', { class: 'lfx-palette-list', id: 'lfx-palette-list', role: 'listbox' });
    const preview = el('div', { class: 'lfx-preview', 'aria-hidden': 'true' });
    const box = el('div', { class: 'lfx-palette-backdrop lfx-layer' },
      el('div', { class: 'lfx-palette', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Busca rápida' },
        el('div', { class: 'lfx-palette-head', html: ICON.search }, input, spinner, el('span', { class: 'lfx-kbd', text: 'Esc' })),
        scopes,
        el('div', { class: 'lfx-palette-body' }, list, preview),
        el('div', { class: 'lfx-palette-foot' },
          el('span', {}, el('span', { class: 'lfx-kbd', text: '↑' }), el('span', { class: 'lfx-kbd', text: '↓' }), 'navegar'),
          el('span', {}, el('span', { class: 'lfx-kbd', text: 'Enter' }), 'abrir'),
          el('span', {}, el('span', { class: 'lfx-kbd', text: 'Ctrl' }), el('span', { class: 'lfx-kbd', text: 'Enter' }), 'nova aba'),
          el('span', {}, el('span', { class: 'lfx-kbd', text: 'Alt' }), el('span', { class: 'lfx-kbd', text: 'Enter' }), `ouvir no ${SERVICES[preferred()][0]}`),
          el('span', {}, el('span', { class: 'lfx-kbd', text: 'Tab' }), 'trocar filtro'))));
    // Qualquer clique fora da caixa fecha a busca.
    box.addEventListener('pointerdown', (e) => { if (!e.target.closest('.lfx-palette')) { e.preventDefault(); closePalette(); } });
    input.addEventListener('input', () => { clearTimeout(palette.timer); palette.timer = setTimeout(renderPalette, 200); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); selectItem(palette.sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selectItem(palette.sel - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); activateItem(palette.items[palette.sel], { newTab: e.ctrlKey || e.metaKey, service: e.altKey }); }
      else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
      else if (e.key === 'Tab') {
        e.preventDefault();
        const i = SCOPES.findIndex(([k]) => k === palette.scope);
        setScope(SCOPES[(i + (e.shiftKey ? -1 : 1) + SCOPES.length) % SCOPES.length][0]);
      }
    });
    Object.assign(palette, { node: box, input, list, preview, spinner, scopesNode: scopes });
  }
  function setScope(key) {
    palette.scope = key;
    for (const b of $$('.lfx-scope', palette.scopesNode)) b.setAttribute('aria-pressed', String(b.dataset.scope === key));
    renderPalette();
    palette.input.focus();
  }
  async function openPalette(initial = '') {
    if (!S.palette) return;
    if (!palette.node) buildPalette();
    if (!palette.open) {
      hideHc();
      const pill = topSearch?.isConnected ? topSearch.getBoundingClientRect() : null;
      document.body.appendChild(palette.node);
      palette.open = true;
      root.classList.add('lfx-searching');
      const panel = $('.lfx-palette', palette.node);
      // A caixa nasce da pílula de busca do topo e cresce até o centro da tela.
      if (pill && pill.width && root.classList.contains('lfx-motion')) {
        const r = panel.getBoundingClientRect();
        panel.style.transition = 'none';
        panel.style.transformOrigin = '0 0';
        panel.style.transform = `translate(${pill.left - r.left}px, ${pill.top - r.top}px) scale(${pill.width / r.width}, ${pill.height / r.height})`;
        panel.getBoundingClientRect();
        panel.style.transition = '';
        requestAnimationFrame(() => { palette.node.classList.add('lfx-open'); panel.style.transform = ''; });
        setTimeout(() => { if (palette.open) panel.style.transformOrigin = ''; }, 450);
      } else requestAnimationFrame(() => palette.node.classList.add('lfx-open'));
    }
    palette.input.value = initial;
    palette.input.focus();
    await renderPalette();
  }
  function closePalette() {
    if (!palette.open) return false;
    palette.open = false;
    palette.ctrl?.abort();
    root.classList.remove('lfx-searching');
    palette.node.classList.remove('lfx-open');
    const node = palette.node;
    setTimeout(() => { if (!palette.open) node.remove(); }, 300);
    return true;
  }
  function paletteItem(item, index) {
    const thumb = el('span', { class: 'lfx-palette-thumb' + (item.round ? ' lfx-round' : '') });
    if (item.img) thumb.append(el('img', { src: imgSize(item.img, '64s'), alt: '', loading: 'lazy' }));
    else thumb.innerHTML = item.icon || ICON.note;
    const node = el('a', { class: 'lfx-palette-item', role: 'option', id: `lfx-opt-${index}`, 'aria-selected': 'false', href: item.path || '#' }, thumb,
      el('span', { class: 'lfx-palette-text' }, el('div', { class: 'lfx-palette-title', text: item.title }), item.sub ? el('div', { class: 'lfx-palette-sub', text: item.sub }) : null),
      item.key ? el('span', { class: 'lfx-kbd', text: item.key }) : item.kind ? el('span', { class: 'lfx-palette-kind', text: item.kind }) : null);
    node.addEventListener('mousemove', () => { if (palette.sel !== index) selectItem(index, false); });
    node.addEventListener('click', (e) => { e.preventDefault(); activateItem(item, { newTab: e.ctrlKey || e.metaKey || e.button === 1, service: e.altKey }); });
    return node;
  }
  function renderGroups(groups, emptyText) {
    palette.list.textContent = '';
    palette.items = [];
    let i = 0;
    for (const g of groups) {
      if (!g.items.length) continue;
      palette.list.append(el('div', { class: 'lfx-palette-group', role: 'presentation', text: g.label }));
      for (const it of g.items) { palette.items.push(it); palette.list.append(paletteItem(it, i++)); }
    }
    if (!palette.items.length) palette.list.append(el('div', { class: 'lfx-palette-empty', text: emptyText || 'Nada encontrado. Pressione Enter para buscar no Last.fm.' }));
    selectItem(0, false);
  }
  function renderPreview(item) {
    const pv = palette.preview;
    if (!pv) return;
    pv.textContent = '';
    if (!item) return;
    const art = el('div', { class: 'lfx-preview-art' + (item.round ? ' lfx-round' : '') });
    if (item.img) art.append(el('img', { src: imgSize(item.img, '300x300'), alt: '' }));
    else art.innerHTML = item.icon || ICON.note;
    const music = ['artist', 'album', 'track'].includes(item.type);
    pv.append(art,
      el('div', {}, el('div', { class: 'lfx-preview-kind', text: item.kind || '' }), el('div', { class: 'lfx-preview-title', text: item.title }), item.sub ? el('div', { class: 'lfx-preview-sub', text: item.sub }) : null),
      el('div', { class: 'lfx-preview-hint' }, el('span', { class: 'lfx-kbd', text: 'Enter' }), item.run ? 'executar' : 'abrir no Last.fm',
        music ? el('span', { class: 'lfx-kbd', text: 'Alt' }) : null, music ? el('span', { class: 'lfx-kbd', text: 'Enter' }) : null, music ? `ouvir no ${SERVICES[preferred()][0]}` : null));
  }
  async function searchLastfm(q, scope, signal) {
    const key = `${scope}|${q.toLowerCase()}`;
    if (palette.cache.has(key)) return palette.cache.get(key);
    const url = scope === 'all' ? `/search?q=${encodeURIComponent(q)}` : `/search/${scope}?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal, credentials: 'include' });
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const out = scope === 'all' ? parseSearchAll(doc) : { [scope]: scope === 'tracks' ? parseTracks(doc, 12) : parseGrid(doc, scope, 12) };
    palette.cache.set(key, out);
    if (palette.cache.size > 40) palette.cache.delete(palette.cache.keys().next().value);
    return out;
  }
  function parseGrid(scopeEl, kind, max) {
    const out = [];
    for (const item of $$('.grid-items-item', scopeEl)) {
      const a = $('.grid-items-item-main-text a', item);
      const path = sameOriginPath(a?.getAttribute('href'));
      if (!path) continue;
      const img = $('img', item)?.getAttribute('src');
      const aux = $$('.grid-items-item-aux-text', item).map(text).filter(Boolean);
      out.push({ title: text(a), sub: aux.join(' · '), path, img: isPlaceholder(img) ? null : img, round: kind === 'artists', kind: kind === 'artists' ? 'Artista' : 'Álbum', type: kind === 'artists' ? 'artist' : 'album', artist: kind === 'albums' ? aux[0] : undefined, icon: kind === 'artists' ? ICON.mic : ICON.disc });
      if (out.length >= max) break;
    }
    return out;
  }
  function parseTracks(scopeEl, max) {
    const out = [];
    for (const row of $$('tr.chartlist-row', scopeEl)) {
      const a = $('.chartlist-name a', row);
      const path = sameOriginPath(a?.getAttribute('href'));
      if (!path) continue;
      const img = $('.chartlist-image img', row)?.getAttribute('src');
      const artist = text($('.chartlist-artist', row));
      out.push({ title: text(a), sub: artist, artist, path, img: isPlaceholder(img) ? null : img, kind: 'Faixa', type: 'track', icon: ICON.note });
      if (out.length >= max) break;
    }
    return out;
  }
  function parseSearchAll(doc) {
    const out = { artists: [], albums: [], tracks: [] };
    for (const section of $$('.col-main section', doc)) {
      const href = $('h2 a', section)?.getAttribute('href') || '';
      if (/\/search\/artists/.test(href)) out.artists = parseGrid(section, 'artists', 4);
      else if (/\/search\/albums/.test(href)) out.albums = parseGrid(section, 'albums', 4);
      else if (/\/search\/tracks/.test(href)) out.tracks = parseTracks(section, 5);
    }
    return out;
  }
  async function renderPalette() {
    const q = palette.input.value.trim();
    const nq = normalize(q);
    const scope = palette.scope;
    const acts = paletteActions().filter((a) => !nq || normalize(`${a.title} ${a.sub}`).includes(nq));
    palette.ctrl?.abort();
    if (scope === 'actions') { palette.spinner.hidden = true; renderGroups([{ label: 'Ações', items: acts }]); return; }
    if (q.length < 2) {
      const hist = (await ext.getLocal('lfx:history', []))
        .filter((h) => scope === 'all' || (scope === 'artists' && h.type === 'artist') || (scope === 'albums' && h.type === 'album') || (scope === 'tracks' && h.type === 'track'))
        .slice(0, 8);
      palette.spinner.hidden = true;
      renderGroups(scope === 'all' ? [{ label: 'Visitados recentemente', items: hist }, { label: 'Ações', items: acts.slice(0, 6) }] : [{ label: 'Visitados recentemente', items: hist }],
        'Digite para buscar no Last.fm.');
      return;
    }
    const searchItem = { title: `Buscar “${q}” no Last.fm`, sub: 'Página completa de resultados', icon: ICON.search, path: `${langPrefix()}/search${scope === 'all' ? '' : '/' + scope}?q=${encodeURIComponent(q)}`, kind: 'Busca' };
    palette.spinner.hidden = false;
    const ctrl = palette.ctrl = new AbortController();
    try {
      const r = await searchLastfm(q, scope, ctrl.signal);
      if (ctrl.signal.aborted || palette.input.value.trim() !== q || palette.scope !== scope) return;
      palette.spinner.hidden = true;
      const groups = scope === 'all'
        ? [{ label: 'Artistas', items: r.artists }, { label: 'Álbuns', items: r.albums }, { label: 'Faixas', items: r.tracks }, { label: 'Ações', items: acts.slice(0, 3) }, { label: 'Busca completa', items: [searchItem] }]
        : [{ label: SCOPES.find(([k]) => k === scope)[1], items: r[scope] || [] }, { label: 'Busca completa', items: [searchItem] }];
      renderGroups(groups);
    } catch (e) {
      if (e.name === 'AbortError') return;
      palette.spinner.hidden = true;
      renderGroups([{ label: 'Busca completa', items: [searchItem] }], 'Não foi possível buscar agora. Verifique a conexão.');
    }
  }
  function selectItem(i, scroll = true) {
    const n = palette.items.length;
    if (!n) { renderPreview(null); return; }
    palette.sel = (i + n) % n;
    $$('.lfx-palette-item', palette.list).forEach((node, idx) => node.setAttribute('aria-selected', String(idx === palette.sel)));
    const node = $(`#lfx-opt-${palette.sel}`, palette.list);
    palette.input.setAttribute('aria-activedescendant', node ? node.id : '');
    if (scroll) node?.scrollIntoView({ block: 'nearest' });
    renderPreview(palette.items[palette.sel]);
  }
  function activateItem(item, { newTab = false, service = false } = {}) {
    if (!item) {
      const q = palette.input.value.trim();
      if (q) { closePalette(); go(`${langPrefix()}/search?q=${encodeURIComponent(q)}`, newTab); }
      return;
    }
    closePalette();
    if (item.run) { item.run(); return; }
    if (service && ['artist', 'album', 'track'].includes(item.type)) {
      const query = item.type === 'artist' ? item.title : `${item.artist || item.sub || ''} ${item.title}`.trim();
      window.open(serviceUrl(preferred(), query, { kind: item.type, artist: item.type === 'artist' ? item.title : item.artist || item.sub, title: item.title }), '_blank', 'noopener');
      return;
    }
    go(item.path, newTab);
  }

  /* ================================================================ *
   * Atalhos de teclado
   * ================================================================ */
  function toggleWide() { ext.saveSetting('wide', !S.wide); toast(S.wide ? 'Layout amplo ativado' : 'Layout padrão'); }
  function toggleSidebar() {
    if (!S.sidebar) { ext.saveSetting('sidebar', true); toast('Barra lateral ativada'); refresh(true); return; }
    ext.saveSetting('sideCollapsed', !S.sideCollapsed);
    renderSidebar();
  }
  function openHelp() {
    if ($('.lfx-help')) return;
    const rows = [
      [['Ctrl', 'K'], 'Busca rápida'], [['/'], 'Busca rápida'], [['G', 'P'], 'Meu perfil'], [['G', 'L'], 'Scrobbles recentes'],
      [['G', 'R'], 'Relatório da semana'], [['G', 'H'], 'Início'], [['G', 'C'], 'Charts'], [['F'], 'Filtrar a lista da página'],
      [['B'], 'Recolher ou expandir a barra lateral'], [['W'], 'Alternar layout amplo'], [['?'], 'Esta ajuda'], [['Esc'], 'Fechar janelas'],
    ];
    const card = el('div', { class: 'lfx-help-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Atalhos de teclado' }, el('h2', { text: 'Atalhos de teclado' }));
    for (const [keys, label] of rows) {
      card.append(el('div', { class: 'lfx-help-row' }, el('span', { text: label }), el('span', { class: 'lfx-help-keys' }, ...keys.map((k) => el('span', { class: 'lfx-kbd', text: k })))));
    }
    const box = el('div', { class: 'lfx-help lfx-layer', tabindex: '-1' }, card);
    const close = () => { box.classList.remove('lfx-open'); setTimeout(() => box.remove(), 300); };
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    box.addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === '?') { e.preventDefault(); e.stopPropagation(); close(); } });
    document.body.appendChild(box);
    requestAnimationFrame(() => { box.classList.add('lfx-open'); box.focus(); });
  }
  let gPending = 0;
  function onKey(e) {
    if (!S.enabled) return;
    const t = e.target;
    const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
      if (!S.palette) return;
      e.preventDefault();
      palette.open ? closePalette() : openPalette();
      return;
    }
    if (e.key === 'Escape') { if (disc.spot) { closeSpotlight(); return; } if (hc.node) { hideHc(); return; } if (closeLightbox()) return; openMenuClose?.(); return; }
    if (typing || e.ctrlKey || e.metaKey || e.altKey || !S.shortcuts) return;
    const k = e.key.toLowerCase();
    if (Date.now() - gPending < 1200) {
      gPending = 0;
      const needMe = (sub) => { if (me) go(userPath(sub)); else toast('Entre na sua conta do Last.fm para usar este atalho.'); };
      const map = { p: () => needMe(''), l: () => needMe('/library'), r: () => needMe('/listening-report/week'), h: () => go(`${langPrefix()}/home`), c: () => go(`${langPrefix()}/charts`) };
      if (map[k]) { e.preventDefault(); map[k](); }
      return;
    }
    if (k === 'g') { gPending = Date.now(); return; }
    if (e.key === '/' && S.palette) { e.preventDefault(); openPalette(); return; }
    if (e.key === '?') { e.preventDefault(); openHelp(); return; }
    if (k === 'f') { const f = $('.lfx-filter input'); if (f) { e.preventDefault(); f.focus(); f.scrollIntoView({ block: 'center', behavior: 'smooth' }); } return; }
    if (k === 'w') { e.preventDefault(); toggleWide(); return; }
    if (k === 'b') { e.preventDefault(); toggleSidebar(); }
  }

  /* ================================================================ *
   * Rolagem: voltar ao topo com progresso
   * ================================================================ */
  let topBtn = null;
  function ensureTopButton() {
    if (!S.backToTop) { topBtn?.remove(); topBtn = null; return; }
    if (topBtn) return;
    const C = 2 * Math.PI * 22;
    topBtn = el('button', {
      class: 'lfx-top lfx-layer', type: 'button', 'aria-label': 'Voltar ao topo', title: 'Voltar ao topo',
      html: `<svg class="lfx-top-ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="lfx-top-track" cx="24" cy="24" r="22"/><circle class="lfx-top-bar" cx="24" cy="24" r="22" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>${ICON.up}`,
      onclick: () => window.scrollTo({ top: 0, behavior: S.animations && !reducedMotion.matches ? 'smooth' : 'auto' }),
    });
    topBtn.dataset.c = String(C);
    document.body.appendChild(topBtn);
  }
  let scrollRaf = 0;
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const y = window.scrollY;
      root.classList.toggle('lfx-scrolled', y > 24);
      if (topBtn) {
        const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        topBtn.classList.toggle('lfx-show', y > innerHeight * .9);
        topBtn.querySelector('.lfx-top-bar').setAttribute('stroke-dashoffset', String(+topBtn.dataset.c * (1 - Math.min(1, y / max))));
      }
    });
  }

  /* ================================================================ *
   * Dados sob demanda: páginas do próprio Last.fm, com fila e cache
   * ================================================================ */
  const nfc = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
  const fmtN = (n) => (n == null ? '—' : n >= 10000 ? nfc.format(n) : nf.format(n));
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const KINDS_PT = { artist: 'Artista', album: 'Álbum', track: 'Faixa' };
  const HOUR = 3600e3;

  const memo = new Map();
  function memoSet(key, entry) { memo.delete(key); memo.set(key, entry); if (memo.size > 600) memo.delete(memo.keys().next().value); }
  async function cacheGet(key, maxAge) {
    const m = memo.get(key);
    if (m && Date.now() - m.t < maxAge) return m.v;
    const s = await ext.getLocal(key, null);
    if (s && s.t && Date.now() - s.t < maxAge) { memoSet(key, s); return s.v; }
    return undefined;
  }
  function cachePut(key, v) { const e = { t: Date.now(), v }; memoSet(key, e); ext.setLocal(key, e); return v; }
  /* Faxina do cache guardado (no máximo a cada 12 h): apaga o que passou de 2 semanas e,
     se ainda sobrar demais, as entradas mais antigas. Assim o armazenamento não cresce para sempre. */
  const CACHE_KEY_RE = /^lfx:(mi|sim|simtags|lib|u|tagart3|tagart8|recs|genres|following|lfmrecs|prem:taste|prem:friends|prem:pool):/;
  /* "Limpar o cache" do app: apaga tudo o que a extensão guardou de páginas do Last.fm (opções, ouvir depois e bandas tiradas ficam) */
  async function clearExtCache() {
    memo.clear();
    if (!ext.alive()) return 0;
    const all = await chrome.storage.local.get(null);
    const keys = Object.keys(all).filter((k) => CACHE_KEY_RE.test(k) || k === 'lfx:colors');
    for (let i = 0; i < keys.length; i += 200) await chrome.storage.local.remove(keys.slice(i, i + 200));
    return keys.length;
  }
  const CACHE_MAX_AGE = 14 * 24 * HOUR, CACHE_MAX_KEYS = 2500;
  async function pruneCache() {
    if (!ext.alive()) return;
    try {
      if (Date.now() - (await ext.getLocal('lfx:pruneAt', 0)) < 12 * HOUR) return;
      await ext.setLocal('lfx:pruneAt', Date.now());
      const all = await chrome.storage.local.get(null);
      const now = Date.now();
      const dead = [];
      const live = [];
      for (const [k, v] of Object.entries(all)) {
        if (!CACHE_KEY_RE.test(k)) continue;
        if (!v || typeof v.t !== 'number' || now - v.t > CACHE_MAX_AGE) dead.push(k);
        else live.push([k, v.t]);
      }
      if (live.length > CACHE_MAX_KEYS) live.sort((a, b) => a[1] - b[1]).slice(0, live.length - CACHE_MAX_KEYS).forEach(([k]) => dead.push(k));
      for (let i = 0; i < dead.length; i += 200) await chrome.storage.local.remove(dead.slice(i, i + 200));
    } catch (_) { /* tenta na próxima */ }
  }

  // No máximo 4 pedidos ao mesmo tempo, para não pesar no site; um 429 pausa a fila.
  const net = { active: 0, queue: [], pauseUntil: 0 };
  function pump() {
    while (net.active < 4 && net.queue.length) {
      const wait = net.pauseUntil - Date.now();
      if (wait > 0) { setTimeout(pump, wait + 20); return; }
      const job = net.queue.shift();
      if (job.signal?.aborted) { job.reject(new DOMException('Cancelado', 'AbortError')); continue; }
      net.active++;
      job.fn().then(job.resolve, job.reject).finally(() => { net.active--; setTimeout(pump, 60); });
    }
  }
  function enqueue(fn, { priority = false, signal } = {}) {
    return new Promise((resolve, reject) => {
      const job = { fn, resolve, reject, signal };
      if (priority) net.queue.unshift(job); else net.queue.push(job);
      pump();
    });
  }
  async function fetchText(url, { signal, xhr = false } = {}) {
    const res = await fetch(url, { credentials: 'include', signal, headers: xhr ? { 'X-Requested-With': 'XMLHttpRequest' } : undefined });
    if (res.status === 429) net.pauseUntil = Date.now() + 10000;
    if (!res.ok) { const e = new Error(`HTTP ${res.status}`); e.status = res.status; throw e; }
    return res.text();
  }
  const parseHTML = (html) => new DOMParser().parseFromString(html, 'text/html');
  function getDoc(url, opts = {}) { return enqueue(async () => parseHTML(await fetchText(url, opts)), opts); }
  const mainScope = (doc) => $('#content .col-main', doc) || $('.col-main', doc) || $('#content', doc) || doc.body || doc;
  const urlImg = (node) => {
    if (!node) return null;
    const u = node.getAttribute('content') || (node.getAttribute('style') || '').match(/url\(["']?([^"')]+)["']?\)/)?.[1] || null;
    return isPlaceholder(u) ? null : u;
  };

  /* Classifica um link do site: artista, álbum ou faixa (sem subpáginas). */
  function musicTarget(href) {
    const path = sameOriginPath(href);
    if (!path) return null;
    const clean = stripLang(path.split(/[?#]/)[0]).replace(/\/+$/, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts[0] !== 'music' || !parts[1] || parts[1].startsWith('+')) return null;
    if (parts.length === 2) return { kind: 'artist', path: clean, artist: decodePart(parts[1]), title: decodePart(parts[1]) };
    if (parts.length === 3 && parts[2] !== '_' && !parts[2].startsWith('+')) return { kind: 'album', path: clean, artist: decodePart(parts[1]), title: decodePart(parts[2]) };
    if (parts.length === 4 && parts[2] === '_' && !parts[3].startsWith('+')) return { kind: 'track', path: clean, artist: decodePart(parts[1]), title: decodePart(parts[3]) };
    return null;
  }
  const artistPathOf = (path) => path.split('/').slice(0, 3).join('/');

  /* Números do topo das páginas de artista, álbum e faixa. */
  function headerStats(doc) {
    const out = { listeners: null, scrobbles: null, mine: null };
    let items = $$('.header-new-info-desktop .header-metadata-tnew-item', doc);
    if (!items.length) items = $$('.header-metadata-tnew-item', doc);
    items.forEach((it, i) => {
      const label = normalize(text($('.header-metadata-tnew-title', it)));
      const n = parseCount($('abbr', it)?.getAttribute('title')) ?? parseCount(text($('.header-metadata-tnew-display', it)));
      if (n == null) return;
      if (/scrobble/.test(label)) out.scrobbles ??= n;
      else if (/listen|ouvint/.test(label)) out.listeners ??= n;
      else if (i === 0) out.listeners ??= n;
      else if (i === 1) out.scrobbles ??= n;
    });
    const mine = $('.personal-stats-item--scrobbles .header-metadata-display a', doc) || $('.personal-stats-item--scrobbles a', doc);
    if (mine) out.mine = parseCount(text(mine));
    return out;
  }
  function wikiText(doc) {
    const node = $('.wiki-block-inner-2', doc) || $('.wiki-block-inner', doc) || $('.wiki-content', doc);
    if (!node) return '';
    const clone = node.cloneNode(true);
    $$('.wiki-block-cta, a[href*="/+wiki"]', clone).forEach((n) => n.remove());
    const t = text(clone).replace(/\s*(read more|ler mais)\s*$/i, '').trim();
    if (!t || /^(we don.t have|do you know any background|não temos)/i.test(t)) return '';
    return t.length > 300 ? `${t.slice(0, 297).replace(/\s+\S*$/, '')}…` : t;
  }
  function bookmarkForm(scope) {
    const form = $('form[action$="+bookmarks"], form[action*="/+bookmarks"]', scope);
    return form ? { form, btn: $('button', form) } : null;
  }
  function isBookmarked(btn) {
    if (!btn) return false;
    // O estado fica no contêiner [data-toggle-button]; o campo "action" diz o que o botão fará.
    const holder = btn.closest('[data-toggle-button-current-state]');
    const st = (holder?.getAttribute('data-toggle-button-current-state') || btn.getAttribute('data-toggle-button-current-state') || '').toLowerCase();
    if (st) return !st.startsWith('un') && st.includes('bookmark');
    const act = $('input[name="action"]', btn.form || btn.closest('form') || btn)?.value || btn.getAttribute('data-analytics-action') || '';
    return /^unbookmark/i.test(act);
  }
  function parseMusicDoc(doc, path) {
    const t = musicTarget(path) || { kind: 'artist', artist: '', title: '' };
    const kind = t.kind;
    const title = text($('.header-new-title', doc)) || t.title;
    const artist = kind === 'artist' ? title : text($('.header-new-crumb', doc)) || text($('[itemprop="byArtist"]', doc)) || t.artist;
    let img = kind === 'artist' ? urlImg($('.header-new-background-image', doc))
      : kind === 'album' ? $('.album-overview-cover-art img', doc)?.getAttribute('src')
      : $('.source-album-art img', doc)?.getAttribute('src');
    if (isPlaceholder(img)) img = null;
    if (!img && kind !== 'artist') { const og = $('meta[property="og:image"]', doc)?.getAttribute('content'); if (!isPlaceholder(og)) img = og; }
    const meta = {};
    for (const dt of $$('.catalogue-metadata-heading', doc)) {
      if (dt.closest('.visible-xs')) continue;
      const dd = dt.nextElementSibling;
      if (!dd) continue;
      const h = normalize(text(dt));
      if (/length|dura/.test(h)) meta.length ??= text(dd);
      else if (/release|lanc/.test(h)) meta.release ??= text(dd);
    }
    const bm = bookmarkForm(doc);
    return {
      kind, path, title, artist, img: img || null,
      ...headerStats(doc),
      tags: [...new Set($$('.catalogue-tags .tag a, .tags-list--global .tag a', doc).map(text).filter(Boolean))].slice(0, 6),
      bio: wikiText(doc), meta,
      similar: [...new Set($$(':is(.similar-items-sidebar-item-name, .artist-similar-artists-sidebar-item-name) a', doc).map(text).filter(Boolean))].slice(0, 3),
      topTrack: kind === 'artist' ? text($('table.chartlist .chartlist-name a', doc)) || null : null,
      album: kind === 'track' ? text($('.source-album-name a', doc)) || null : null,
      topAlbums: kind === 'artist' ? $$('.artist-top-albums-item-wrap', doc).slice(0, 4).map((li) => {
        const a = $('.artist-top-albums-item-name a', li);
        const tg = musicTarget(a?.getAttribute('href'));
        if (!tg || tg.kind !== 'album') return null;
        const cover = $('img', li)?.getAttribute('src');
        const aux = $$('.artist-top-albums-item-aux-text', li).map(text);
        return { title: text(a), path: tg.path, img: isPlaceholder(cover) ? null : cover, listeners: parseCount(aux.find((x) => /listen|ouvint/i.test(x)) || ''), meta: aux.find((x) => !/listen|ouvint/i.test(x)) || null };
      }).filter(Boolean) : undefined,
      friends: parseCount((text($('.personal-stats-item--listeners', doc)).match(/(\d[\d,.]*)/) || [])[1] || ''),
      canBookmark: !!bm, bookmarked: bm ? isBookmarked(bm.btn) : false,
    };
  }
  /* Detalhes de artista/álbum/faixa (balões, gêneros). 12 h de cache; tags aceitam 30 dias. */
  async function musicInfo(path, { signal, priority = false, maxAge = 12 * HOUR } = {}) {
    const key = `lfx:mi:${path}`;
    const hit = await cacheGet(key, maxAge);
    if (hit) return hit;
    const doc = await getDoc(path, { signal, priority });
    return cachePut(key, parseMusicDoc(doc, path));
  }

  /* Artistas da biblioteca de alguém num período (50 por página). */
  async function libArtists(user, preset = 'ALL', pages = 1, maxAge = 6 * HOUR) {
    const key = `lfx:lib:${user.toLowerCase()}:${preset}:${pages}`;
    const hit = await cacheGet(key, maxAge);
    if (hit) return hit;
    const out = [];
    for (let page = 1; page <= pages; page++) {
      const doc = await getDoc(`/user/${encName(user)}/library/artists?date_preset=${preset}&page=${page}&ajax=1`, { xhr: true });
      const rows = $$('tr.chartlist-row', doc).filter((r) => !/placeholder/.test(`${r.className} ${r.closest('table')?.className || ''}`));
      for (const row of rows) {
        const a = $('.chartlist-name a', row);
        const tg = musicTarget(a?.getAttribute('href'));
        if (!tg) continue;
        const img = $('.chartlist-image img', row)?.getAttribute('src');
        out.push({ name: text(a), path: tg.path, n: parseCount(text($('.chartlist-count-bar-value', row))) || 0, img: isPlaceholder(img) ? null : imgSize(img, '300x300') });
      }
      if (rows.length < 45) break;
    }
    return cachePut(key, out);
  }

  /* Lista genérica de artistas/álbuns/faixas de uma página (tags, marcadores). */
  function harvestMusic(scope, kinds = ['artist', 'album', 'track'], max = 60) {
    const seen = new Map();
    for (const a of $$('a[href]', scope)) {
      if (a.closest('nav, header, .pagination, .pagination-list, .tags-list, .lfx-layer, [class*="-bio"], [class*="wiki"]')) continue;
      const t = musicTarget(a.getAttribute('href'));
      if (!t || !kinds.includes(t.kind)) continue;
      const prev = seen.get(t.path);
      if (prev && prev.title) continue;
      const box = a.closest('li, tr, article') || a.parentElement;
      // O link do artista dentro do cartão de um álbum ou faixa não é um item próprio.
      if (t.kind === 'artist' && box && $$('a[href]', box).some((x) => /^(album|track)$/.test(musicTarget(x.getAttribute('href'))?.kind || ''))) continue;
      let img = $('img', a)?.getAttribute('src') || $('img', box)?.getAttribute('src') || null;
      if (isPlaceholder(img)) img = null;
      const lis = text(box).match(/([\d.,]+)\s*(listeners|ouvintes)/i);
      seen.set(t.path, {
        kind: t.kind, path: t.path, artist: t.artist,
        title: text(a) || prev?.title || '',
        img: img ? imgSize(img, '300x300') : prev?.img || null,
        listeners: lis ? parseCount(lis[1]) : prev?.listeners ?? null,
      });
      if (seen.size >= max * 2) break;
    }
    return [...seen.values()].map((x) => ({ ...x, title: x.title || x.path.split('/').filter(Boolean).slice(-1).map(decodePart)[0] })).slice(0, max);
  }

  /* ================================================================ *
   * Ouvir depois: usa os marcadores do próprio Last.fm (ficam na sua
   * conta) e, se o site não aceitar, guarda neste navegador.
   * ================================================================ */
  const LATER_KEY = 'lfx:later';
  const getLater = async () => (await ext.getLocal(LATER_KEY, [])) || [];
  async function setLaterEntry(item, on, src) {
    const list = (await getLater()).filter((x) => x.path !== item.path);
    if (on) list.unshift({ path: item.path, kind: item.kind, title: item.title, artist: item.artist || null, img: item.img || null, t: Date.now(), src });
    await ext.setLocal(LATER_KEY, list.slice(0, 500));
    return list;
  }
  async function submitBookmark({ form, btn }) {
    let fd;
    try { fd = new FormData(form, btn || undefined); } catch (_) { fd = new FormData(form); }
    const res = await fetch(new URL(form.getAttribute('action') || location.pathname, location.origin).href, {
      method: 'POST', body: fd, credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }
  async function setLater(info, want) {
    if (!me) { toast('Entre na sua conta do Last.fm para salvar para depois.'); return null; }
    let synced = false;
    try {
      const bm = bookmarkForm(await getDoc(info.path, { priority: true }));
      if (bm) { if (isBookmarked(bm.btn) !== want) await submitBookmark(bm); synced = true; }
    } catch (_) { /* sem o marcador do site: lista local */ }
    await setLaterEntry(info, want, synced ? 'lastfm' : 'local');
    info.bookmarked = want;
    const key = `lfx:mi:${info.path}`;
    const cachedInfo = memo.get(key)?.v;
    if (cachedInfo) { cachedInfo.bookmarked = want; cachePut(key, cachedInfo); }
    const name = info.title.length > 40 ? `${info.title.slice(0, 38)}…` : info.title;
    toast(want ? `“${name}” está na sua lista de ouvir depois${synced ? '' : ' (neste navegador)'}` : `“${name}” saiu da lista`);
    return want;
  }
  async function laterState(info) {
    if (info.bookmarked) return true;
    return (await getLater()).some((x) => x.path === info.path);
  }
  function laterButton(info, cls = 'lfx-icon-btn') {
    const btn = el('button', { class: `${cls} lfx-later-toggle`, type: 'button', 'aria-pressed': 'false', title: 'Ouvir depois', 'aria-label': `Ouvir depois: ${info.title}`, html: ICON.bookmark });
    const paint = (on) => {
      btn.setAttribute('aria-pressed', String(on));
      btn.innerHTML = on ? ICON.bookmarkOn : ICON.bookmark;
      btn.title = on ? 'Na sua lista de ouvir depois (clique para tirar)' : 'Ouvir depois';
      if (cls.includes('lfx-hc-btn')) btn.append(on ? 'Na sua lista' : 'Ouvir depois');
    };
    paint(false);
    laterState(info).then(paint);
    btn.addEventListener('click', async (e) => {
      e.preventDefault(); e.stopPropagation();
      if (btn.disabled) return;
      btn.disabled = true;
      const now = await setLater(info, btn.getAttribute('aria-pressed') !== 'true');
      btn.disabled = false;
      if (now != null) paint(now);
    });
    return btn;
  }

  /* ================================================================ *
   * Balão flutuante sobre artistas, álbuns e faixas
   * ================================================================ */
  const hc = { node: null, anchor: null, target: null, timer: 0, hideTimer: 0, ctrl: null, x: 0, y: 0, sx: 0, sy: 0 };
  const HC_SKIP = '.lfx-hc, .lfx-spot, .lfx-palette-backdrop, .lfx-side-bar, .lfx-mini, .lfx-tabs, .lfx-menu, .lfx-topsearch, .lfx-lightbox, .lfx-help, .masthead, .secondary-nav, .navlist, .pagination-list, [role="menu"], [role="menuitem"]';
  function hcTarget(a) {
    if (!a || a.closest(HC_SKIP)) return null;
    const t = musicTarget(a.getAttribute('href'));
    if (!t) return null;
    if (t.path.toLowerCase() === stripLang(location.pathname).replace(/\/+$/, '').toLowerCase()) return null;
    return t;
  }
  function onHcOver(e) {
    if (!S.enabled || !S.hoverCards || e.pointerType === 'touch') return;
    const node = e.target;
    if (!(node instanceof Element)) return;
    if (hc.node && hc.node.contains(node)) { clearTimeout(hc.hideTimer); return; }
    const a = node.closest('a[href]');
    const t = a ? hcTarget(a) : null;
    if (!t) {
      if (hc.anchor) { hc.anchor = null; clearTimeout(hc.timer); hc.timer = 0; }
      if (hc.node) scheduleHideHc();
      return;
    }
    if (a === hc.anchor) return;
    // A dica nativa do navegador (atributo title) apareceria por cima do balão.
    if (a.title) { if (!text(a) && !a.getAttribute('aria-label')) a.setAttribute('aria-label', a.title); a.removeAttribute('title'); }
    hc.anchor = a; hc.target = t;
    hc.x = hc.sx = e.clientX; hc.y = hc.sy = e.clientY;
    clearTimeout(hc.timer);
    if (hc.node) {
      clearTimeout(hc.hideTimer);
      if (hc.node.dataset.path === t.path) { hc.timer = 0; return; }
    }
    hc.timer = setTimeout(() => showHc(a, t), hc.node ? 260 : 520);
  }
  // Só abre quando o ponteiro "descansa" no link: passar por cima de uma grade não dispara balões.
  function onHcMove(e) {
    if (!hc.anchor || !hc.timer) return;
    hc.x = e.clientX; hc.y = e.clientY;
    if (Math.abs(e.clientX - hc.sx) + Math.abs(e.clientY - hc.sy) > 14) {
      hc.sx = e.clientX; hc.sy = e.clientY;
      clearTimeout(hc.timer);
      const a = hc.anchor, t = hc.target;
      hc.timer = setTimeout(() => showHc(a, t), hc.node ? 260 : 420);
    }
  }
  function scheduleHideHc(delay = 260) { clearTimeout(hc.hideTimer); hc.hideTimer = setTimeout(hideHc, delay); }
  function hideHc() {
    clearTimeout(hc.timer); clearTimeout(hc.hideTimer); hc.timer = 0;
    hc.ctrl?.abort(); hc.ctrl = null;
    const n = hc.node;
    hc.node = null;
    if (!n) return;
    n.classList.remove('lfx-show');
    setTimeout(() => n.remove(), 220);
  }
  function hcProvisional(a, t) {
    const box = a.closest('li, tr, .grid-items-item, .recs-feed-item') || a;
    let img = $('img', a)?.getAttribute('src') || (t.kind !== 'artist' ? $('img', box)?.getAttribute('src') : null);
    if (isPlaceholder(img)) img = null;
    const label = text(a);
    return { kind: t.kind, path: t.path, title: label && label.length < 120 ? label : t.title, artist: t.artist, img: img ? imgSize(img, '300x300') : null, provisional: true };
  }
  function linkTo(href, label, cls = '') { return el('a', { class: cls, href, 'data-go': '', text: label }); }
  function joinNodes(nodes) {
    const out = [];
    nodes.forEach((n, i) => { if (i) out.push(i === nodes.length - 1 ? ' e ' : ', '); out.push(n); });
    return out;
  }
  function releaseLine(d) {
    const bits = [];
    const date = d.meta?.release ? parseSince(d.meta.release) : null;
    if (date) bits.push(date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, ''));
    const len = d.meta?.length || '';
    const tracks = len.match(/(\d+)\s*(tracks|faixas)/i);
    const dur = len.match(/\b(\d{1,3}:\d{2}(?::\d{2})?)\b/);
    if (tracks) bits.push(`${tracks[1]} faixas`);
    if (dur) bits.push(dur[1]);
    return bits.join(' · ');
  }
  function fillHc(card, d, loading = false) {
    card.textContent = '';
    card.__info = d;
    card.classList.toggle('lfx-loading', loading);
    const kind = KINDS_PT[d.kind] || '';
    const artistHref = artistPathOf(d.path);
    if (d.kind === 'artist') {
      const banner = el('div', { class: 'lfx-hc-banner' });
      if (d.img) banner.append(el('img', { src: d.provisional ? d.img : imgSize(d.img, '770x0'), alt: '' }));
      banner.append(el('span', { class: 'lfx-hc-shade' }), el('div', { class: 'lfx-hc-head' }, el('div', { class: 'lfx-hc-kind', text: kind }), linkTo(d.path, d.title, 'lfx-hc-title')));
      card.append(banner);
    } else {
      const line = releaseLine(d);
      const year = d.meta?.release ? parseSince(d.meta.release)?.getFullYear() : null;
      card.append(el('div', { class: 'lfx-hc-top' },
        el('a', { class: 'lfx-hc-art', href: d.path, 'data-go': '' }, d.img ? el('img', { src: imgSize(d.img, '300x300'), alt: '' }) : el('span', { html: d.kind === 'album' ? ICON.disc : ICON.note })),
        el('div', { class: 'lfx-hc-headtext' },
          el('div', { class: 'lfx-hc-kind', text: year && d.kind === 'album' ? `${kind} · ${year}` : kind }),
          linkTo(d.path, d.title, 'lfx-hc-title'),
          d.artist ? linkTo(artistHref, d.artist, 'lfx-hc-artist') : null,
          d.kind === 'track' && d.album ? el('div', { class: 'lfx-hc-meta', text: `do álbum ${d.album}` }) : line ? el('div', { class: 'lfx-hc-meta', text: line }) : null)));
    }
    const body = el('div', { class: 'lfx-hc-body' });
    card.append(body);
    if (loading) {
      body.append(el('div', { class: 'lfx-hc-stats' }, el('div', { class: 'lfx-skel lfx-hc-skel' }), el('div', { class: 'lfx-skel lfx-hc-skel' }), el('div', { class: 'lfx-skel lfx-hc-skel' })),
        el('div', { class: 'lfx-skel', style: 'height:40px;border-radius:10px' }));
      return;
    }
    const stats = el('div', { class: 'lfx-hc-stats' });
    const stat = (n, label, cls = '') => el('div', { class: `lfx-hc-stat ${cls}` }, el('b', { text: fmtN(n) }), el('span', { text: label }));
    if (d.listeners != null) stats.append(stat(d.listeners, 'ouvintes'));
    if (d.scrobbles != null) stats.append(stat(d.scrobbles, 'scrobbles'));
    if (me && d.mine != null) stats.append(stat(d.mine, 'por você', 'lfx-hc-mine'));
    if (stats.childElementCount) body.append(stats);
    if (d.tags?.length) body.append(el('div', { class: 'lfx-hc-tags' }, ...d.tags.slice(0, 4).map((t) => linkTo(`/tag/${encName(t.toLowerCase())}`, t, 'lfx-hc-tag'))));
    if (d.bio) body.append(el('p', { class: 'lfx-hc-bio', text: d.bio }));
    if (d.kind === 'artist' && d.topTrack) body.append(el('div', { class: 'lfx-hc-line' }, 'Mais tocada: ', el('b', { text: d.topTrack })));
    if (d.kind === 'artist' && d.similar?.length) body.append(el('div', { class: 'lfx-hc-line' }, 'Parecido com ', ...joinNodes(d.similar.map((s) => linkTo(`/music/${encName(s)}`, s)))));
    const q = d.kind === 'artist' ? d.title : `${d.artist || ''} ${d.title}`.trim();
    const [svcName, svcColor] = SERVICES[preferred()];
    const actions = el('div', { class: 'lfx-hc-actions' },
      el('a', { class: 'lfx-hc-btn lfx-hc-primary', href: d.path, 'data-go': '' }, 'Abrir'),
      el('a', { class: 'lfx-hc-btn lfx-hc-listen', href: serviceUrl(preferred(), q, { kind: d.kind, artist: d.kind === 'artist' ? d.title : d.artist, title: d.title }), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${svcName}` },
        el('span', { class: 'lfx-svc-dot', style: `--c:${svcColor}`, 'aria-hidden': 'true' }), el('span', { text: svcName })));
    if (me) actions.append(laterButton(d, 'lfx-hc-btn lfx-hc-later'));
    body.append(actions);
  }
  function placeHc(card, a, first) {
    const r = a.getBoundingClientRect();
    const big = r.height > 64 || r.width > 460;
    const W = card.offsetWidth, H = card.offsetHeight, M = 12;
    const ax = big ? hc.x : r.left + Math.min(r.width, 160) / 2;
    const topEdge = big ? hc.y - 14 : r.top;
    const bottomEdge = big ? hc.y + 18 : r.bottom;
    if (first || !card.dataset.side) {
      const est = Math.max(H, 330);
      const below = innerHeight - M - (bottomEdge + 10);
      const above = topEdge - 10 - M;
      card.dataset.side = below >= est || below >= above ? 'below' : 'above';
    }
    const isBelow = card.dataset.side === 'below';
    const left = clamp(big ? ax - W / 2 : r.left - 6, M, Math.max(M, innerWidth - W - M));
    const top = clamp(isBelow ? bottomEdge + 10 : topEdge - 10 - H, M, Math.max(M, innerHeight - H - M));
    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;
    card.style.transformOrigin = `${Math.round(clamp(ax - left, 24, W - 24))}px ${isBelow ? '0' : '100%'}`;
  }
  async function showHc(a, t) {
    hc.timer = 0;
    if (!a.isConnected || hc.anchor !== a || !S.hoverCards) return;
    clearTimeout(hc.hideTimer);
    hc.ctrl?.abort();
    const ctrl = hc.ctrl = new AbortController();
    const old = hc.node;
    const known = memo.get(`lfx:mi:${t.path}`);
    let info = known && Date.now() - known.t < 12 * HOUR ? known.v : null;
    const card = el('div', { class: `lfx-hc lfx-layer lfx-hc--${t.kind}`, role: 'dialog', 'aria-label': `${KINDS_PT[t.kind]}: ${t.title}`, 'data-path': t.path });
    fillHc(card, info || hcProvisional(a, t), !info);
    card.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-go]');
      if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      hideHc();
      go(link.getAttribute('href'));
    });
    document.body.appendChild(card);
    hc.node = card;
    if (old) { old.classList.remove('lfx-show'); setTimeout(() => old.remove(), 180); }
    placeHc(card, a, true);
    requestAnimationFrame(() => card.classList.add('lfx-show'));
    if (info) return;
    try {
      info = await musicInfo(t.path, { signal: ctrl.signal, priority: true });
      if (ctrl.signal.aborted || hc.node !== card) return;
      fillHc(card, info);
      placeHc(card, a, false);
    } catch (err) {
      if (err.name === 'AbortError' || hc.node !== card) return;
      card.classList.remove('lfx-loading');
      $('.lfx-hc-body', card)?.replaceChildren(el('p', { class: 'lfx-hc-bio', text: 'Não deu para carregar os detalhes agora. Tente de novo em instantes.' }));
    }
  }

  /* ================================================================ *
   * Seguidores e seguindo: cartões com números, o que cada um ouve
   * e a afinidade de gosto com você
   * ================================================================ */
  const COMPAT = { super: 'Super', veryhigh: 'Muito alta', high: 'Alta', medium: 'Média', low: 'Baixa', verylow: 'Muito baixa' };
  const compatLevel = (pct) => (pct >= 85 ? 'super' : pct >= 65 ? 'veryhigh' : pct >= 45 ? 'high' : pct >= 25 ? 'medium' : pct >= 10 ? 'low' : 'verylow');
  function compatKey(c) {
    const fromClass = (c.level || '').toLowerCase().replace(/[^a-z]/g, '');
    if (COMPAT[fromClass]) return fromClass;
    const fromLabel = normalize(c.label || '').replace(/[^a-z]/g, '');
    if (COMPAT[fromLabel]) return fromLabel;
    return c.pct != null ? compatLevel(c.pct) : 'medium';
  }
  async function userInfo(name, { maxAge = 30 * 60e3 } = {}) {
    const key = `lfx:u:${name.toLowerCase()}`;
    const hit = await cacheGet(key, maxAge);
    if (hit) return hit;
    const doc = await getDoc(`/user/${encName(name)}`);
    const info = { name, scrobbles: null, artists: null, loved: null, compat: null, np: null };
    for (const item of $$('.header-metadata-item', doc)) {
      const label = normalize(text($('.header-metadata-title', item)));
      const n = parseCount(text($('.header-metadata-display', item)));
      if (/scrobble/.test(label)) info.scrobbles = n;
      else if (/artist/.test(label)) info.artists = n;
      else if (/love|curt/.test(label)) info.loved = n;
    }
    info.display = text($('.header-title-display-name', doc)) || null;
    info.since = parseSince(text($('.header-scrobble-since', doc)))?.getTime() || null;
    info.bg = urlImg($('.header-background', doc));
    const av = $('.header-avatar img, .avatar img, img.avatar, .header-title img', doc)?.getAttribute('src');
    info.avatar = isPlaceholder(av) ? null : av;
    const tm = $('.tasteometer', doc);
    if (tm) {
      const pct = parseInt($('.tasteometer-viz', tm)?.getAttribute('title') || '', 10);
      info.compat = {
        level: ([...tm.classList].find((c) => c.startsWith('tasteometer-compat-')) || '').replace('tasteometer-compat-', '') || null,
        pct: isNaN(pct) ? null : clamp(pct, 0, 100),
        label: text($('.tasteometer-compat-colour', tm)) || null,
        artists: $$('a', tm).map((x) => ({ name: x.getAttribute('title') || text(x), path: musicTarget(x.getAttribute('href'))?.path || null })).filter((x) => x.name).slice(0, 5),
      };
    }
    const row = $('#recent-tracks-section tr.chartlist-row', doc) || $('tr.chartlist-row', doc);
    if (row) {
      const a = $('.chartlist-name a', row);
      const img = $('.chartlist-image img', row)?.getAttribute('src');
      const when = parseLfmDate($('.chartlist-timestamp [title]', row)?.getAttribute('title'));
      if (a) info.np = { title: text(a), artist: text($('.chartlist-artist a', row)) || text($('.chartlist-artist', row)), path: musicTarget(a.getAttribute('href'))?.path || null, img: isPlaceholder(img) ? null : imgSize(img, '64s'), live: row.classList.contains('chartlist-row--now-scrobbling'), when, ago: ptAgo(text($('.chartlist-timestamp', row))) };
    }
    return cachePut(key, info);
  }
  /* Sem o medidor do site: compara os 100 artistas mais ouvidos de cada um. */
  async function estimateCompat(name) {
    const [a, b] = await Promise.all([libArtists(me.name, 'ALL', 2, 24 * HOUR), libArtists(name, 'ALL', 2, 24 * HOUR)]);
    if (!a.length || !b.length) return null;
    const mine = new Map(a.map((x) => [normalize(x.name), Math.log1p(x.n)]));
    let dot = 0, na = 0, nb = 0;
    const shared = [];
    for (const w of mine.values()) na += w * w;
    for (const y of b) {
      const w = Math.log1p(y.n);
      nb += w * w;
      const m = mine.get(normalize(y.name));
      if (m) { dot += w * m; shared.push({ name: y.name, path: y.path, s: w * m }); }
    }
    if (!na || !nb) return null;
    const pct = Math.round(100 * (1 - Math.exp(-3.4 * (dot / Math.sqrt(na * nb)))));
    shared.sort((p, q) => q.s - p.s);
    return { level: compatLevel(pct), pct, label: null, est: true, artists: shared.slice(0, 5).map(({ name: n, path }) => ({ name: n, path })) };
  }

  const soc = { list: null, io: null, sort: 'default', q: '', sortTimer: 0 };
  function enhanceSocial(p) {
    const on = S.social && p.kind === 'user-sub' && p.parts.length === 3 && /^(following|followers)$/.test(p.parts[2]);
    const list = on ? $('#content :is(ul, ol).user-list') : null;
    if (!list) {
      if (soc.list && !soc.list.isConnected) { soc.io?.disconnect(); soc.list = null; }
      if (!on) teardownSocial();
      return;
    }
    if (soc.list !== list) {
      soc.io?.disconnect();
      soc.list = list;
      soc.sort = 'default'; soc.q = '';
      soc.io = new IntersectionObserver((entries) => {
        for (const en of entries) if (en.isIntersecting) { soc.io.unobserve(en.target); loadSocial(en.target); }
      }, { rootMargin: '500px 0px' });
      list.classList.add('lfx-social');
      buildSocialBar(list);
    }
    let i = $$(':scope > li[data-lfx-soc]', list).length;
    for (const li of $$(':scope > li.user-list-item:not(.user-list-item-mobile-ad):not([data-lfx-soc])', list)) {
      if (prepSocialCard(li, i)) { i++; soc.io.observe(li); }
    }
    updateSocialCount();
  }
  function teardownSocial() {
    $$('.lfx-soc, .lfx-soc-bar, .lfx-soc-banner').forEach((n) => n.remove());
    $$('.lfx-social').forEach((n) => n.classList.remove('lfx-social'));
    $$('[data-lfx-soc]').forEach((n) => { delete n.dataset.lfxSoc; delete n.dataset.lfxLoaded; n.classList.remove('lfx-ucard', 'lfx-has-bg', 'lfx-filtered'); n.style.removeProperty('order'); });
    soc.io?.disconnect(); soc.list = null;
  }
  function prepSocialCard(li, index) {
    const link = $('.user-list-link', li) || $('.user-list-name a', li);
    const name = text(link) || decodePart(((link?.getAttribute('href') || '').match(/\/user\/([^/?#]+)/) || [])[1] || '');
    if (!name) return false;
    li.dataset.lfxSoc = '1';
    li.dataset.lfxUser = name;
    li.dataset.lfxIdx = String(index);
    li.classList.add('lfx-ucard');
    const img = $('.user-list-avatar img', li);
    const src = img?.getAttribute('src');
    const banner = el('div', { class: 'lfx-soc-banner', 'aria-hidden': 'true' });
    if (!isPlaceholder(src)) {
      banner.style.backgroundImage = `url("${imgSize(src, '300x300')}")`;
      img.setAttribute('src', src.replace(/\/avatar\d+s\//, '/avatar170s/'));
    }
    li.prepend(banner);
    ($('.user-list-inner-wrap', li) || li).append(el('div', { class: 'lfx-soc' },
      el('div', { class: 'lfx-soc-stats lfx-skel' }), el('div', { class: 'lfx-soc-np lfx-skel' }), el('div', { class: 'lfx-soc-match lfx-skel' })));
    return true;
  }
  async function loadSocial(li) {
    if (li.dataset.lfxLoaded) return;
    li.dataset.lfxLoaded = 'loading';
    const name = li.dataset.lfxUser;
    try {
      const info = await userInfo(name);
      if (!info.compat && me && !isMe(name)) {
        info.compat = await estimateCompat(name).catch(() => null);
        if (info.compat) cachePut(`lfx:u:${name.toLowerCase()}`, info);
      }
      li.__soc = info;
      renderSocial(li, info);
      li.dataset.lfxLoaded = '1';
      if (soc.sort !== 'default') { clearTimeout(soc.sortTimer); soc.sortTimer = setTimeout(applySocialSort, 150); }
    } catch (_) {
      li.dataset.lfxLoaded = 'err';
      $('.lfx-soc', li)?.replaceChildren(el('div', { class: 'lfx-soc-note', text: 'Não deu para carregar os dados agora.' }));
    }
  }
  function renderSocial(li, d) {
    const box = $('.lfx-soc', li);
    if (!box) return;
    box.textContent = '';
    if (d.bg) { const b = $('.lfx-soc-banner', li); if (b) b.style.backgroundImage = `url("${imgSize(d.bg, '770x0')}")`; li.classList.add('lfx-has-bg'); }
    const stats = el('div', { class: 'lfx-soc-stats' });
    if (d.scrobbles != null) stats.append(el('span', {}, el('b', { text: fmtN(d.scrobbles) }), ' scrobbles'));
    if (d.artists != null) stats.append(el('span', {}, el('b', { text: fmtN(d.artists) }), ' artistas'));
    if (d.since) stats.append(el('span', { text: `desde ${new Date(d.since).getFullYear()}` }));
    if (stats.childElementCount) box.append(stats);
    if (d.np?.title) {
      const status = d.np.live ? 'Ouvindo agora' : d.np.when ? `Ouviu ${timeAgo(Date.now() - d.np.when)}` : d.np.ago ? `Ouviu ${d.np.ago}` : 'Último scrobble';
      box.append(el('a', { class: `lfx-soc-np${d.np.live ? ' lfx-live' : ''}`, href: d.np.path || '#' },
        el('span', { class: 'lfx-soc-np-art' }, d.np.img ? el('img', { src: d.np.img, alt: '', loading: 'lazy' }) : null),
        el('span', { class: 'lfx-soc-np-text' },
          el('span', { class: 'lfx-soc-np-status' }, d.np.live ? el('span', { class: 'lfx-eq', 'aria-hidden': 'true', html: '<i></i><i></i><i></i>' }) : null, status),
          el('span', { class: 'lfx-soc-np-title', text: d.np.artist ? `${d.np.title} — ${d.np.artist}` : d.np.title }))));
    }
    if (isMe(d.name)) { box.append(el('div', { class: 'lfx-soc-note', text: 'Este é você.' })); return; }
    const c = d.compat;
    if (!c) { box.append(el('div', { class: 'lfx-soc-note', text: me ? 'Afinidade indisponível para este perfil.' : 'Entre na sua conta para ver a afinidade.' })); return; }
    const lv = compatKey(c);
    const pct = c.pct ?? { super: 95, veryhigh: 75, high: 55, medium: 35, low: 18, verylow: 6 }[lv];
    const shared = (c.artists || []).slice(0, 3).map((x) => (x.path ? el('a', { href: x.path, text: x.name }) : el('b', { text: x.name })));
    box.append(el('div', { class: `lfx-soc-match lfx-lv-${lv}`, style: `--lfx-p:${pct}` },
      el('span', { class: 'lfx-soc-ring', 'aria-hidden': 'true' }, el('b', { text: `${pct}%` })),
      el('span', { class: 'lfx-soc-match-text' },
        el('span', { class: 'lfx-soc-match-label' }, 'Afinidade ', el('b', { text: COMPAT[lv] }), c.est ? el('small', { text: ' · estimada' }) : null),
        shared.length ? el('span', { class: 'lfx-soc-shared' }, 'Vocês ouvem ', ...joinNodes(shared)) : el('span', { class: 'lfx-soc-shared', text: 'Nenhum artista em comum entre os favoritos.' }))));
  }
  function buildSocialBar(list) {
    $$('.lfx-soc-bar').forEach((n) => n.remove());
    const input = el('input', { type: 'search', placeholder: 'Filtrar por nome', 'aria-label': 'Filtrar pessoas', autocomplete: 'off', spellcheck: 'false' });
    const sorts = el('div', { class: 'lfx-seg lfx-soc-sorts', role: 'group', 'aria-label': 'Ordenar' }, el('span', { class: 'lfx-seg-thumb', 'aria-hidden': 'true' }));
    for (const [k, label] of [['default', 'Padrão'], ['compat', 'Afinidade'], ['scrobbles', 'Scrobbles'], ['live', 'Ouvindo agora']]) {
      sorts.append(el('button', { type: 'button', 'data-sort': k, 'aria-pressed': String(k === soc.sort), onclick: () => setSocialSort(k, sorts) }, label));
    }
    const bar = el('div', { class: 'lfx-soc-bar lfx-layer' }, el('label', { class: 'lfx-filter', html: ICON.search }, input), el('span', { class: 'lfx-soc-count', 'aria-live': 'polite' }), sorts);
    input.addEventListener('input', () => { soc.q = normalize(input.value); applySocialFilter(); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') { input.value = ''; soc.q = ''; applySocialFilter(); input.blur(); } });
    list.before(bar);
    requestAnimationFrame(() => moveThumb(sorts));
  }
  function socialCards() { return soc.list ? $$(':scope > li[data-lfx-soc]', soc.list) : []; }
  function updateSocialCount() {
    const out = $('.lfx-soc-count');
    if (!out) return;
    const all = socialCards();
    const shown = all.filter((li) => !li.classList.contains('lfx-filtered')).length;
    const loading = soc.sort !== 'default' ? all.filter((li) => li.dataset.lfxLoaded !== '1' && li.dataset.lfxLoaded !== 'err').length : 0;
    out.textContent = `${soc.q ? `${nf.format(shown)} de ` : ''}${nf.format(all.length)} ${all.length === 1 ? 'pessoa' : 'pessoas'}${loading ? ` · carregando ${nf.format(loading)}…` : ''}`;
  }
  function applySocialFilter() {
    for (const li of socialCards()) {
      const hay = normalize(`${li.dataset.lfxUser} ${text($('.user-list-description, .user-list-about-me', li))} ${li.__soc?.display || ''}`);
      li.classList.toggle('lfx-filtered', !!soc.q && !hay.includes(soc.q));
    }
    updateSocialCount();
  }
  function setSocialSort(k, seg) {
    soc.sort = k;
    for (const b of $$('button', seg)) b.setAttribute('aria-pressed', String(b.dataset.sort === k));
    moveThumb(seg);
    // Ordenar exige os dados de todos: carrega os que ainda não apareceram na tela.
    if (k !== 'default') for (const li of socialCards()) if (!li.dataset.lfxLoaded) { soc.io?.unobserve(li); loadSocial(li); }
    applySocialSort();
  }
  function applySocialSort() {
    const val = (li) => {
      const d = li.__soc;
      if (soc.sort === 'compat') return d?.compat ? (d.compat.pct ?? 0) : -1;
      if (soc.sort === 'scrobbles') return d?.scrobbles ?? -1;
      if (soc.sort === 'live') return d?.np ? (d.np.live ? 2e13 : d.np.when || 1) : -1;
      return 0;
    };
    const cards = socialCards();
    if (soc.sort === 'default') cards.forEach((li) => li.style.removeProperty('order'));
    else cards.map((li) => [li, val(li)]).sort((a, b) => b[1] - a[1] || +a[0].dataset.lfxIdx - +b[0].dataset.lfxIdx).forEach(([li], i) => { li.style.order = String(i); });
    updateSocialCount();
  }

  /* ================================================================ *
   * Catálogo: gêneros que você mais ouve, ouvir depois e descobertas
   * ================================================================ */
  const PERIODS = [['LAST_7_DAYS', '7 dias'], ['LAST_30_DAYS', '30 dias'], ['LAST_90_DAYS', '3 meses'], ['LAST_180_DAYS', '6 meses'], ['LAST_365_DAYS', '12 meses'], ['ALL', 'Sempre']];
  const NOT_GENRE = new Set(('seen live,favorites,favourites,favorite,favourite,my favorites,love,loved,awesome,beautiful,amazing,cool,best,good,great,'
    + 'spotify,albums i own,under 2000 listeners,male vocalists,female vocalists,male vocalist,female vocalist,vocalists,all,music,check out,'
    + 'to listen,my music,fav,favs,others,unknown,random,various,misc,live,cover,covers,'
    + 'british,american,english,uk,usa,us,canadian,australian,swedish,norwegian,finnish,danish,german,french,italian,spanish,japanese,korean,'
    + 'brazilian,brasil,brazil,brasileiro,brasileira,portuguese,portugal,polish,russian,dutch,belgian,irish,scottish,icelandic,mexican,'
    + 'argentinian,argentina,chilean,colombian,greek,israeli,chinese,european,swiss,austrian,ukrainian,czech,hungarian,turkish,'
    + 'new zealand,south african,indonesian,filipino,faroese,estonian,latvian,lithuanian,slovenian,croatian,serbian,romanian,bulgarian,'
    + 'france,germany,sweden,norway,finland,japan,canada,australia,england,scotland,ireland,italy,spain,mexico').split(','));
  const genreKey = (tag) => normalize(tag).replace(/[-_/]+/g, ' ').replace(/\s+/g, ' ').trim();
  function isGenreTag(tag, artistName) {
    const k = genreKey(tag);
    if (!k || k.length < 2 || k.length > 32) return false;
    if (NOT_GENRE.has(k) || /^(\d{2,4}s?|(19|20)\d\d|seen .*live|.*favou?rite.*|\d+ ?stars?)$/.test(k)) return false;
    return !artistName || k !== genreKey(artistName);
  }
  const cat = { node: null, period: null, genre: null, genres: [], ctrl: null, recsCtrl: null, laterFilter: 'all', showAll: false };
  const libPathRe = () => new RegExp(`^/user/${encName(me.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/library/?$`, 'i');
  function onOwnLibrary() { return !!me && libPathRe().test(stripLang(location.pathname)); }
  /* Abas próprias dentro da sua biblioteca: #catalogo e #premium */
  const VIEWS = { catalogo: { label: 'Catálogo', on: () => S.catalog }, premium: { label: 'Premium', on: () => S.premium }, social: { label: 'Amigos', on: () => S.socialHub }, doppelganger: { label: 'Doppelgänger', on: () => S.doppel }, shows: { label: 'Shows', on: () => S.shows } };
  function currentView() {
    if (!S.enabled || !me || !onOwnLibrary()) return null;
    const v = location.hash.slice(1);
    return VIEWS[v] && VIEWS[v].on() ? v : null;
  }
  const catalogOn = () => currentView() === 'catalogo';
  function openView(v) {
    if (!VIEWS[v]?.on()) return;
    if (!me) { toast('Entre na sua conta do Last.fm para usar esta aba.'); return; }
    if (onOwnLibrary()) {
      if (location.hash !== `#${v}`) history.pushState(history.state, '', `${location.pathname}${location.search}#${v}`);
      refresh();
      window.scrollTo({ top: 0 });
      return;
    }
    try { sessionStorage.setItem('lfx:route', `${v}|${Date.now()}`); } catch (_) { /* modo privado */ }
    go(userPath('/library'));
  }
  const openCatalog = () => openView('catalogo');
  const openPremium = () => openView('premium');
  function consumeCatalogFlag() {
    let flag = null;
    try { flag = sessionStorage.getItem('lfx:route'); } catch (_) { return; }
    if (!flag) return;
    const [route, ts] = flag.split('|');
    if (!VIEWS[route] || Date.now() - +ts > 20000) { try { sessionStorage.removeItem('lfx:route'); } catch (_) { /* ignorado */ } return; }
    if (!onOwnLibrary()) return;
    try { sessionStorage.removeItem('lfx:route'); } catch (_) { /* ignorado */ }
    if (location.hash !== `#${route}`) history.replaceState(history.state, '', `${location.pathname}${location.search}#${route}`);
  }
  /* Abas "Catálogo" e "Premium" ao lado de "Library" no seu perfil. */
  // As abas do PRIME ficam numa linha própria logo abaixo das abas do site. Dentro da
  // lista do site elas atrapalhavam o "Mais…" (que mede e espelha os itens originais)
  // e acabavam cortadas por baixo do cartão da faixa mais ouvida.
  const VIEW_ICON = { catalogo: 'layers', premium: 'spark', social: 'users', doppelganger: 'masks', shows: 'calendar' };
  function ensureCatalogTab(p) {
    $$('.lfx-cat-navitem').forEach((n) => n.remove());
    const nav = $('#content header .secondary-nav') || $('#content .secondary-nav');
    const mine = me && p.parts[0] === 'user' && isMe(p.user) && nav;
    const views = mine ? Object.keys(VIEWS).filter((v) => VIEWS[v].on()) : [];
    let row = $('.lfx-hubnav');
    if (!views.length) { row?.remove(); $$('.lfx-cat-dim').forEach((a) => a.classList.remove('lfx-cat-dim')); return; }
    const key = views.join(',');
    if (!row || row.dataset.key !== key || row.previousElementSibling !== nav) {
      row?.remove();
      row = el('nav', { class: 'lfx-hubnav', 'aria-label': 'Abas do Last.fm PRIME', 'data-key': key },
        ...views.map((v) => el('a', { class: `lfx-cat-link lfx-hubnav-link${v === 'premium' ? ' is-premium' : ''}`, href: `${userPath('/library')}#${v}`, 'data-view': v },
          el('span', { class: 'lfx-hubnav-ic', 'aria-hidden': 'true', html: ICON[VIEW_ICON[v]] || ICON.spark }),
          el('span', { class: 'lfx-hubnav-tx', text: VIEWS[v].label }))));
      nav.after(row);
      paintShowsBadge();
    }
    const cur = currentView();
    for (const a of $$('.lfx-hubnav-link', row)) {
      const on = a.dataset.view === cur;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    }
    for (const a of $$('.secondary-nav-item-link', nav)) a.classList.toggle('lfx-cat-dim', !!cur && a.classList.contains('secondary-nav-item-link--active'));
  }
  const hub = { node: null, view: null };
  function renderCatalog() {
    const v = currentView();
    root.classList.toggle('lfx-cat-on', !!v);
    if (hub.node && (hub.view !== v || !hub.node.isConnected)) {
      cat.ctrl?.abort(); cat.recsCtrl?.abort(); prem.ctrl?.abort(); prem.fillCtrl?.abort(); prem.fillCtrl = null; prem.result = null;
      stopSocialHub(); stopDoppel(); stopShows();
      hub.node.remove(); hub.node = null; hub.view = null; cat.node = null; prem.node = null; sh.node = null; dop.node = null; shw.node = null;
    }
    if (!v) { $$('[data-lfx-cat-hidden]').forEach((n) => n.removeAttribute('data-lfx-cat-hidden')); return; }
    if (!hub.node) {
      const first = $$('#content .page-content, #content .content-top').find((n) => !n.closest('header, .lfx-catalog') && !$('header', n));
      const header = $('#content header.header') || $('#content header');
      if (!first && !header) return;
      hub.view = v;
      hub.node = v === 'premium' ? (prem.node = buildPremium()) : v === 'social' ? (sh.node = buildSocialHub()) : v === 'doppelganger' ? (dop.node = buildDoppel()) : v === 'shows' ? (shw.node = buildShows()) : (cat.node = buildCatalog());
      if (first) first.before(hub.node); else header.after(hub.node);
      if (v === 'premium') loadPremium(); else if (v === 'social') loadSocialHub(); else if (v === 'doppelganger') loadDoppel(); else if (v === 'shows') loadShows(); else loadCatalog();
    }
    for (const n of $$('#content .page-content, #content .content-top, #content .full-bleed-ad-container')) {
      if (!n.closest('header, .lfx-catalog') && !$('header', n)) n.setAttribute('data-lfx-cat-hidden', '');
    }
  }
  /* ================================================================ *
   * Amigos (#social): uma rede social feita sobre o Last.fm —
   * notificações, feed de atualizações, o que os amigos mais ouvem,
   * caixa de mensagens (mural) e sugestões de quem seguir.
   * Tudo usa a sua conta do Last.fm, então funciona com qualquer pessoa
   * que tenha Last.fm (não é fechado só para quem usa o app).
   * ================================================================ */
  const SH_FRIEND_CAP = 30, SH_FEED_CAP = 16, SH_TOP_CAP = 14, SH_SUGG_SRC = 8;
  const sh = { node: null, tab: 'agora', friends: null, data: new Map(), ctrl: null, timer: 0, loading: false,
    shouts: null, composeTo: '', busy: false, feed: null, top: null, sugg: null, inbox: null,
    notifs: [], seen: null, bellOpen: false, loaded: new Set() };
  const QUICK = ['Curti demais! 🎧', 'Boa escolha 🔥', 'Vou ouvir também!', 'Que som é esse? 👀'];
  const SH_TABS = [['agora', 'Ouvindo agora'], ['feed', 'Feed'], ['alta', 'Em alta'], ['mensagens', 'Mensagens'], ['sugestoes', 'Sugestões']];

  function buildSocialHub() {
    const tabs = el('div', { class: 'lfx-sh-tabs', role: 'tablist' });
    for (const [k, label] of SH_TABS) tabs.append(el('button', { class: `lfx-sh-tab${k === sh.tab ? ' on' : ''}`, type: 'button', role: 'tab', 'data-tab': k, 'aria-selected': String(k === sh.tab), onclick: () => setSocialTab(k) }, label));
    const bell = el('button', { class: 'lfx-sh-bell', type: 'button', title: 'Notificações', 'aria-label': 'Notificações', onclick: toggleBell }, el('span', { html: ICON.bell || ICON.spark }), el('span', { class: 'lfx-sh-badge', hidden: true }));
    sh.bellBtn = bell;
    // o painel de notificações flutua no body (senão o layout do Last.fm o corta)
    sh.bellBox = el('div', { class: 'lfx-sh-bellpanel lfx-menu', hidden: true });
    const bellwrap = el('div', { class: 'lfx-sh-bellwrap' }, bell);
    return el('section', { class: 'container lfx-sh lfx-layer', 'aria-label': 'Amigos' },
      el('div', { class: 'lfx-sh-head' },
        el('div', { class: 'lfx-sh-head-txt' }, el('h1', {}, 'Amigos', el('span', { class: 'lfx-sh-online', hidden: true })), el('p', { text: 'De quem você segue no Last.fm: o que ouvem agora, as novidades, o que mais escutam e recados entre vocês.' })),
        el('div', { class: 'lfx-sh-head-act' }, bellwrap,
          el('button', { class: 'lfx-chip lfx-sh-refresh', type: 'button', title: 'Atualizar', onclick: () => refreshSocial(true) }, el('span', { html: ICON.refresh || ICON.spark }), 'Atualizar'))),
      tabs,
      el('div', { class: 'lfx-sh-body' }));
  }
  function setSocialTab(k) {
    if (!sh.node) return;
    closeBell();
    sh.tab = k;
    for (const b of $$('.lfx-sh-tab', sh.node)) { const on = b.dataset.tab === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); }
    ensureTab(k);
    paintSocial();
  }
  function stopSocialHub() { sh.ctrl?.abort(); sh.ctrl = null; clearTimeout(sh.timer); sh.timer = 0; sh.bellFloat?.(); sh.bellFloat = null; sh.bellBox?.remove(); sh.bellBox = null; sh.bellBtn = null; document.removeEventListener('pointerdown', bellOutside, true); sh.node = null; sh.data.clear(); sh.friends = null; sh.shouts = null; sh.feed = null; sh.top = null; sh.sugg = null; sh.inbox = null; sh.loaded = new Set(); sh.bellOpen = false; }

  async function loadSocialHub() {
    paintSocial();
    paintBell();
    if (!me) return;
    await refreshSocial(false);            // sempre busca ao abrir a aba
    const beat = () => { sh.timer = setTimeout(async () => { if (sh.node && currentView() === 'social') { await loadFriendsLive(true).catch(() => {}); await loadInbox(true).catch(() => {}); beat(); } }, 60000); };
    clearTimeout(sh.timer); beat();
  }
  /* Recarrega os dados da aba aberta (e sempre o "ouvindo agora" + notificações) */
  async function refreshSocial(fresh) {
    if (!me) return;
    sh.loaded.clear();
    await Promise.all([loadFriendsLive(fresh), loadInbox(fresh)]);
    await ensureTab(sh.tab, fresh);
  }
  async function ensureTab(k, fresh) {
    if (!me) return;
    if (sh.loaded.has(k) && !fresh) return;
    sh.loaded.add(k);
    try {
      if (k === 'feed') { sh.feed = null; paintSocial(); sh.feed = await loadFeed(fresh); }
      else if (k === 'alta') { sh.top = null; paintSocial(); sh.top = await loadTop(fresh); }
      else if (k === 'sugestoes') { sh.sugg = null; paintSocial(); sh.sugg = await loadSugg(fresh); }
      else if (k === 'mensagens') { /* já vem do loadInbox */ }
    } catch (_) { /* a aba mostra o estado vazio */ }
    if (sh.node) paintSocial();
  }
  async function socialFriends(fresh) {
    if (sh.friends && !fresh) return sh.friends;
    const names = await followingNames(fresh).catch(() => []);
    sh.friends = names.slice(0, SH_FRIEND_CAP);
    return sh.friends;
  }
  async function loadFriendsLive(fresh) {
    if (!me || sh.loading) return;
    sh.loading = true;
    try {
      const names = await socialFriends(fresh);
      if (!sh.node) return;
      sh.ctrl?.abort(); sh.ctrl = new AbortController();
      const signal = sh.ctrl.signal;
      paintSocial();
      let done = 0;
      await Promise.all(names.map((n) => (async () => {
        try { const info = await userInfo(n, { maxAge: fresh ? 25000 : 10 * 60e3 }); if (!signal.aborted) sh.data.set(n.toLowerCase(), { name: n, ...info }); }
        catch (_) { /* um amigo falhou: segue */ }
        if (!signal.aborted && sh.node && (++done % 4 === 0 || done === names.length) && (sh.tab === 'agora' || sh.tab === 'feed')) paintSocial();
      })()));
      if (!signal.aborted) { computeLiveNotifs(); paintSocial(); paintBell(); }
    } finally { sh.loading = false; }
  }
  function friendRows() {
    const rows = [...sh.data.values()].filter((d) => !isMe(d.name));
    rows.forEach((d) => { d._when = d.np?.live ? Infinity : (d.np?.when || 0); });
    rows.sort((a, b) => (b._when || 0) - (a._when || 0));
    return rows;
  }
  function liveCount() { return [...sh.data.values()].filter((d) => d.np?.live && !isMe(d.name)).length; }

  /* ---------------- Notificações ---------------- */
  async function seenState() { if (!sh.seen) sh.seen = (await ext.getLocal('lfx:social:seen', null)) || {}; return sh.seen; }
  function pushNotif(n) { sh.notifs = [n, ...sh.notifs.filter((x) => x.key !== n.key)].slice(0, 40); }
  function computeLiveNotifs() {
    const seen = sh.seen || {}; const base = !seen.init;
    const live = {};
    for (const d of sh.data.values()) { if (d.np?.live && !isMe(d.name)) live[d.name.toLowerCase()] = `${d.np.artist}|${d.np.title}`; }
    if (!base) {
      for (const [k, v] of Object.entries(live)) {
        if ((seen.live || {})[k] === v) continue;
        const d = sh.data.get(k);
        if (!d) continue;
        pushNotif({ key: `live:${k}:${v}`, type: 'live', name: d.name, text: `está ouvindo ${d.np.title}${d.np.artist ? ' — ' + d.np.artist : ''}`, img: d.avatar, path: `${langPrefix()}/user/${encName(d.name)}`, t: Date.now(), read: false });
      }
    }
    seen.live = live; seen.init = true; sh.seen = seen; ext.setLocal('lfx:social:seen', seen);
  }
  async function loadInbox(fresh) {
    if (!me) return;
    await seenState();
    try {
      const doc = await getDoc(`/user/${encName(me.name)}/shoutbox`, { priority: true });
      sh.shouts = parseShouts(doc, 60);
    } catch (_) { sh.shouts = sh.shouts || []; }
    // notificações de novos recados
    const seen = sh.seen; const base = !seen.shoutsInit;
    const sigs = sh.shouts.map((s) => `${(s.name || '').toLowerCase()}|${s.body}`);
    if (!base) {
      const old = new Set(seen.shouts || []);
      for (const s of sh.shouts) { const sig = `${(s.name || '').toLowerCase()}|${s.body}`; if (!old.has(sig) && s.name) pushNotif({ key: `shout:${sig}`, type: 'shout', name: s.name, text: `deixou um recado: “${s.body.slice(0, 60)}${s.body.length > 60 ? '…' : ''}”`, img: s.img, path: `${langPrefix()}/user/${encName(me.name)}/shoutbox`, t: s.when || Date.now(), read: false }); }
    }
    seen.shouts = sigs.slice(0, 80); seen.shoutsInit = true; sh.seen = seen; ext.setLocal('lfx:social:seen', seen);
    // caixa de mensagens: agrupa por pessoa
    sh.inbox = groupInbox(sh.shouts);
    // seguidores novos
    loadFollowerNotifs(fresh).catch(() => {});
    paintBell();
    if (sh.node && (sh.tab === 'mensagens')) paintSocial();
  }
  async function loadFollowerNotifs(fresh) {
    await seenState();
    let names = [];
    try {
      const doc = await getDoc(`/user/${encName(me.name)}/followers`);
      names = $$('.user-list-item .user-list-link', doc).map(text).filter(Boolean).slice(0, 60);
    } catch (_) { return; }
    const seen = sh.seen; const base = !seen.followersInit;
    if (!base) { const old = new Set((seen.followers || []).map((n) => n.toLowerCase())); for (const n of names) if (!old.has(n.toLowerCase())) pushNotif({ key: `follower:${n.toLowerCase()}`, type: 'follower', name: n, text: 'começou a seguir você', img: null, path: `${langPrefix()}/user/${encName(n)}`, t: Date.now(), read: false }); }
    seen.followers = names; seen.followersInit = true; sh.seen = seen; ext.setLocal('lfx:social:seen', seen);
    paintBell();
  }
  function unseenCount() { return sh.notifs.filter((n) => !n.read).length; }
  function paintBell() {
    if (!sh.node) return;
    const badge = $('.lfx-sh-badge', sh.node);
    const n = unseenCount();
    if (badge) { badge.hidden = !n; badge.textContent = n > 9 ? '9+' : String(n); }
    const panel = sh.bellBox;
    if (panel && !panel.hidden) renderBell(panel);
  }
  function closeBell() { const panel = sh.bellBox; if (panel && !panel.hidden) { panel.hidden = true; sh.bellOpen = false; sh.bellFloat?.(); sh.bellFloat = null; document.removeEventListener('pointerdown', bellOutside, true); } }
  function bellOutside(e) { if (!sh.node) return; if (!e.target.closest('.lfx-sh-bellpanel, .lfx-sh-bell')) closeBell(); }
  function toggleBell() {
    const panel = sh.bellBox;
    if (!panel || !sh.bellBtn) return;
    sh.bellOpen = panel.hidden;
    panel.hidden = !sh.bellOpen;
    if (sh.bellOpen) { renderBell(panel); if (!sh.bellFloat) sh.bellFloat = floatMenu(panel, sh.bellBtn, 'right'); else placeMenu(panel, sh.bellBtn, 'right'); sh.notifs.forEach((x) => { x.read = true; }); setTimeout(paintBell, 10); setTimeout(() => document.addEventListener('pointerdown', bellOutside, true), 0); }
    else { sh.bellFloat?.(); sh.bellFloat = null; document.removeEventListener('pointerdown', bellOutside, true); }
  }
  function renderBell(panel) {
    panel.replaceChildren(el('div', { class: 'lfx-sh-bell-head' }, el('strong', { text: 'Notificações' }), sh.notifs.length ? el('button', { class: 'lfx-sh-bell-clear', type: 'button', onclick: () => { sh.notifs = []; renderBell(panel); paintBell(); } }, 'Limpar') : null));
    if (!sh.notifs.length) { panel.append(el('div', { class: 'lfx-sh-bell-empty', text: 'Sem novidades por enquanto. Volte mais tarde!' })); return; }
    for (const n of sh.notifs.slice(0, 30)) {
      panel.append(el('a', { class: `lfx-sh-notif${n.read ? '' : ' unread'}`, href: n.path || '#', 'data-go': '' },
        n.img ? el('img', { class: 'lfx-sh-notif-av', src: imgSize(n.img, '64s'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-sh-notif-av lfx-sh-av-ph', text: (n.name || '?')[0].toUpperCase() }),
        el('span', { class: 'lfx-sh-notif-txt' }, el('b', { text: n.name || 'Alguém' }), ' ', n.text, el('span', { class: 'lfx-sh-notif-time', text: n.t ? ` · ${timeAgo(Date.now() - n.t)}` : '' }))));
    }
  }

  /* ---------------- Pintura ---------------- */
  function paintSocial() {
    if (!sh.node) return;
    const body = $('.lfx-sh-body', sh.node);
    const online = $('.lfx-sh-online', sh.node);
    if (!body) return;
    if (!me) { body.replaceChildren(socialEmpty('Entre na sua conta do Last.fm para ver seus amigos, o que estão ouvindo e trocar recados.', 'Entrar no Last.fm', () => go(`${langPrefix()}/login`))); return; }
    const n = liveCount();
    if (online) { online.hidden = !n; online.textContent = n ? `${n} ouvindo agora` : ''; }
    if (sh.tab === 'mensagens') return renderMensagens(body);
    if (sh.tab === 'feed') return renderFeed(body);
    if (sh.tab === 'alta') return renderTop(body);
    if (sh.tab === 'sugestoes') return renderSugg(body);
    // agora
    const rows = friendRows();
    const friendsUnknown = sh.friends == null;
    if ((friendsUnknown || sh.loading) && !rows.length) { body.replaceChildren(skelGrid(6)); return; }
    if (!friendsUnknown && !sh.friends.length) { body.replaceChildren(socialEmpty('Você ainda não segue ninguém no Last.fm. Siga pessoas para ver o que elas ouvem aqui.', 'Descobrir pessoas', () => setSocialTab('sugestoes'))); return; }
    const live = rows.filter((d) => d.np?.live);
    if (!live.length && !sh.loading) { body.replaceChildren(socialEmpty('Ninguém que você segue está ouvindo música agora. Veja o Feed para o que andaram ouvindo.', 'Ver o feed', () => setSocialTab('feed'))); return; }
    body.replaceChildren(el('div', { class: 'lfx-sh-grid' }, ...live.map((d, i) => stagger(friendCard(d, true), i))));
  }
  const skelGrid = (n) => el('div', { class: 'lfx-sh-grid' }, ...Array.from({ length: n }, () => el('div', { class: 'lfx-sh-card lfx-skel' })));
  const skelFeed = (n) => el('div', { class: 'lfx-sh-feed' }, ...Array.from({ length: n }, () => el('div', { class: 'lfx-sh-card lfx-skel lfx-skel-row' })));
  function stagger(node, i) { if (!S.animations || reducedMotion.matches) return node; node.style.setProperty('--d', `${Math.min(i, 12) * 40}ms`); node.classList.add('lfx-sh-in'); return node; }
  function socialEmpty(msg, btn, onclick) {
    return el('div', { class: 'lfx-sh-empty' }, el('span', { class: 'lfx-sh-empty-ic', html: ICON.users || ICON.user, 'aria-hidden': 'true' }), el('p', { text: msg }), btn ? el('button', { class: 'lfx-chip', type: 'button', onclick }, btn) : null);
  }
  function friendCard(d, big) {
    const np = d.np || {};
    const query = [np.artist, np.title].filter(Boolean).join(' ');
    const info = { kind: 'track', artist: np.artist || '', title: np.title || '' };
    const pref = preferred();
    const status = np.live ? 'Ouvindo agora' : np.when ? timeAgo(Date.now() - np.when) : np.ago || 'Último scrobble';
    const avatar = el('a', { class: 'lfx-sh-av', href: `${langPrefix()}/user/${encName(d.name)}`, 'data-go': '', title: `Perfil de ${d.display || d.name}` },
      d.avatar ? el('img', { src: imgSize(d.avatar, '174s'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-sh-av-ph', text: (d.name || '?')[0].toUpperCase() }));
    const head = el('div', { class: 'lfx-sh-card-head' }, avatar,
      el('div', { class: 'lfx-sh-who' },
        el('a', { class: 'lfx-sh-name', href: `${langPrefix()}/user/${encName(d.name)}`, 'data-go': '', text: d.display || d.name }),
        el('span', { class: `lfx-sh-status${np.live ? ' lfx-live' : ''}` }, np.live ? el('span', { class: 'lfx-eq', 'aria-hidden': 'true', html: '<i></i><i></i><i></i>' }) : null, status)));
    if (big && d.compat?.pct != null) head.append(el('span', { class: 'lfx-sh-compat', title: 'Afinidade musical com você' }, `${d.compat.pct}%`));
    const track = np.title ? el('div', { class: 'lfx-sh-track' },
      el('a', { class: 'lfx-sh-art', href: np.path || `${langPrefix()}/user/${encName(d.name)}`, 'data-go': '' }, np.img ? el('img', { src: np.img, alt: '', loading: 'lazy' }) : el('span', { html: ICON.note })),
      el('div', { class: 'lfx-sh-track-txt' }, el('span', { class: 'lfx-sh-track-title', text: np.title }), el('span', { class: 'lfx-sh-track-artist', text: np.artist || '' }))) : null;
    const actions = el('div', { class: 'lfx-sh-actions' },
      np.title ? el('a', { class: 'lfx-sh-btn primary', href: serviceUrl(pref, query, info), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${SERVICES[pref][0]}` }, el('span', { class: 'lfx-svc-dot', style: `--c:${SERVICES[pref][1]}` }), 'Ouvir igual') : null,
      el('button', { class: 'lfx-sh-btn', type: 'button', onclick: () => openCompose(d.name, np.title ? `Sobre ${np.title}${np.artist ? ' — ' + np.artist : ''}: ` : '') }, el('span', { html: ICON.chat || ICON.user }), 'Recado'),
      el('a', { class: 'lfx-sh-btn ghost', href: `${langPrefix()}/user/${encName(d.name)}`, 'data-go': '' }, 'Perfil'));
    return el('div', { class: `lfx-sh-card${big ? ' lfx-sh-big' : ''}${np.live ? ' lfx-sh-livecard' : ''}` }, head, track, actions);
  }

  /* ---------------- Feed de atualizações ---------------- */
  async function loadFeed(fresh) {
    const names = (await socialFriends(fresh)).slice(0, SH_FEED_CAP);
    const all = [];
    await Promise.all(names.map((n) => (async () => { try { const rows = await recentOf(n, 4, fresh); const d = sh.data.get(n.toLowerCase()); rows.forEach((r) => all.push({ ...r, avatar: d?.avatar || null })); } catch (_) { /* ignora */ } })()));
    all.sort((a, b) => (b.when || 0) - (a.when || 0));
    return all.slice(0, 50);
  }
  async function recentOf(name, n = 4, fresh) {
    const doc = await getDoc(`/user/${encName(name)}/partial/recenttracks`, { xhr: true, priority: !!fresh });
    const out = [];
    for (const row of $$('tr.chartlist-row', doc)) {
      const a = $('.chartlist-name a', row); if (!a) continue;
      const img = $('.chartlist-image img', row)?.getAttribute('src');
      const live = row.classList.contains('chartlist-row--now-scrobbling');
      const when = live ? Date.now() : parseLfmDate($('.chartlist-timestamp [title]', row)?.getAttribute('title'));
      out.push({ user: name, title: text(a), artist: text($('.chartlist-artist a', row)) || text($('.chartlist-artist', row)), path: musicTarget(a.getAttribute('href'))?.path || null, img: isPlaceholder(img) ? null : imgSize(img, '64s'), when, live });
      if (out.length >= n) break;
    }
    return out;
  }
  function renderFeed(body) {
    if (sh.feed == null) { body.replaceChildren(skelFeed(6)); return; }
    if (!sh.feed.length) { body.replaceChildren(socialEmpty('Sem atualizações recentes de quem você segue.')); return; }
    const pref = preferred();
    body.replaceChildren(el('div', { class: 'lfx-sh-feed' }, ...sh.feed.map((r, i) => {
      const info = { kind: 'track', artist: r.artist || '', title: r.title || '' };
      const query = [r.artist, r.title].filter(Boolean).join(' ');
      return stagger(el('div', { class: `lfx-sh-fitem${r.live ? ' lfx-sh-livecard' : ''}` },
        el('a', { class: 'lfx-sh-av sm', href: `${langPrefix()}/user/${encName(r.user)}`, 'data-go': '', title: r.user }, r.avatar ? el('img', { src: imgSize(r.avatar, '64s'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-sh-av-ph', text: (r.user || '?')[0].toUpperCase() })),
        el('a', { class: 'lfx-sh-art sm', href: r.path || '#', 'data-go': '' }, r.img ? el('img', { src: r.img, alt: '', loading: 'lazy' }) : el('span', { html: ICON.note })),
        el('div', { class: 'lfx-sh-fitem-txt' },
          el('div', { class: 'lfx-sh-fitem-top' }, el('a', { class: 'lfx-sh-name', href: `${langPrefix()}/user/${encName(r.user)}`, 'data-go': '', text: r.user }),
            el('span', { class: `lfx-sh-fitem-when${r.live ? ' lfx-live' : ''}`, text: r.live ? 'agora' : r.when ? timeAgo(Date.now() - r.when) : '' })),
          el('div', { class: 'lfx-sh-fitem-track' }, el('b', { text: r.title }), r.artist ? ` — ${r.artist}` : '')),
        el('a', { class: 'lfx-sh-btn primary sm', href: serviceUrl(pref, query, info), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${SERVICES[pref][0]}` }, el('span', { class: 'lfx-svc-dot', style: `--c:${SERVICES[pref][1]}` }), 'Ouvir')), i);
    })));
  }

  /* ---------------- Em alta entre seus amigos ---------------- */
  async function loadTop(fresh) {
    const names = (await socialFriends(fresh)).slice(0, SH_TOP_CAP);
    const tally = new Map();
    await Promise.all(names.map((n) => (async () => {
      try {
        const arts = await libArtists(n, 'LAST_7_DAYS', 1, fresh ? 60000 : 6 * HOUR);
        arts.slice(0, 20).forEach((a, i) => { const cur = tally.get(a.path) || { name: a.name, path: a.path, img: a.img, score: 0, fans: 0 }; cur.score += 20 - i; cur.fans++; if (!cur.img && a.img) cur.img = a.img; tally.set(a.path, cur); });
      } catch (_) { /* ignora */ }
    })()));
    return [...tally.values()].sort((a, b) => b.score - a.score || b.fans - a.fans).slice(0, 18);
  }
  function renderTop(body) {
    if (sh.top == null) { body.replaceChildren(el('div', { class: 'lfx-sh-topgrid' }, ...Array.from({ length: 8 }, () => el('div', { class: 'lfx-sh-topcard lfx-skel' })))); return; }
    if (!sh.top.length) { body.replaceChildren(socialEmpty('Ainda não consegui reunir o que seus amigos mais ouvem. Tente atualizar.')); return; }
    body.replaceChildren(
      el('p', { class: 'lfx-sh-sub', text: 'Os artistas mais ouvidos por quem você segue nos últimos 7 dias.' }),
      el('div', { class: 'lfx-sh-topgrid' }, ...sh.top.map((a, i) => stagger(el('a', { class: 'lfx-sh-topcard', href: a.path, 'data-go': '' },
        el('span', { class: 'lfx-sh-toprank', text: String(i + 1) }),
        el('span', { class: 'lfx-sh-topart' }, a.img ? el('img', { src: imgSize(a.img, '174s'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-sh-av-ph', html: ICON.mic })),
        el('span', { class: 'lfx-sh-topname', text: a.name }),
        el('span', { class: 'lfx-sh-topfans', text: `${a.fans} ${a.fans === 1 ? 'amigo ouve' : 'amigos ouvem'}` })), i))));
  }

  /* ---------------- Sugestões (quem seus amigos seguem) ---------------- */
  async function loadSugg(fresh) {
    const friends = await socialFriends(fresh);
    const mine = new Set(friends.map((n) => n.toLowerCase())); mine.add(me.name.toLowerCase());
    const tally = new Map();
    await Promise.all(friends.slice(0, SH_SUGG_SRC).map((n) => (async () => {
      try {
        const doc = await getDoc(`/user/${encName(n)}/following`);
        for (const li of $$('.user-list-item', doc)) {
          const a = $('.user-list-link', li); const name = text(a); if (!name || mine.has(name.toLowerCase())) continue;
          const img = $('.user-list-avatar img', li)?.getAttribute('src');
          const cur = tally.get(name.toLowerCase()) || { name, img: isPlaceholder(img) ? null : img, count: 0, via: n };
          cur.count++; if (!cur.img && !isPlaceholder(img)) cur.img = img; tally.set(name.toLowerCase(), cur);
        }
      } catch (_) { /* ignora */ }
    })()));
    return [...tally.values()].sort((a, b) => b.count - a.count).slice(0, 18);
  }
  function renderSugg(body) {
    if (sh.sugg == null) { body.replaceChildren(skelGrid(6)); return; }
    if (!sh.sugg.length) { body.replaceChildren(socialEmpty('Sem sugestões por enquanto. Siga mais pessoas para o app sugerir amigos em comum.')); return; }
    body.replaceChildren(
      el('p', { class: 'lfx-sh-sub', text: 'Pessoas que quem você segue também segue — talvez você curta.' }),
      el('div', { class: 'lfx-sh-grid' }, ...sh.sugg.map((s, i) => stagger(el('div', { class: 'lfx-sh-card lfx-sh-sugg' },
        el('div', { class: 'lfx-sh-card-head' },
          el('a', { class: 'lfx-sh-av', href: `${langPrefix()}/user/${encName(s.name)}`, 'data-go': '' }, s.img ? el('img', { src: imgSize(s.img, '174s'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-sh-av-ph', text: (s.name || '?')[0].toUpperCase() })),
          el('div', { class: 'lfx-sh-who' }, el('a', { class: 'lfx-sh-name', href: `${langPrefix()}/user/${encName(s.name)}`, 'data-go': '', text: s.name }), el('span', { class: 'lfx-sh-status', text: `${s.count} ${s.count === 1 ? 'amigo em comum' : 'amigos em comum'}` }))),
        el('div', { class: 'lfx-sh-actions' },
          el('button', { class: 'lfx-sh-btn primary', type: 'button', onclick: (e) => followUser(s.name, e.currentTarget) }, el('span', { html: ICON.userplus || ICON.users }), 'Seguir'),
          el('a', { class: 'lfx-sh-btn ghost', href: `${langPrefix()}/user/${encName(s.name)}`, 'data-go': '' }, 'Perfil'))), i))));
  }
  async function followUser(name, btn) {
    if (btn) { btn.disabled = true; btn.textContent = 'Seguindo…'; }
    try {
      const doc = await getDoc(`/user/${encName(name)}`, { priority: true });
      const form = $('form[action*="follow" i], form.js-follow, .follow-button form, button[name="follow"]', doc)?.closest('form') || $('form[action*="follow" i]', doc);
      if (!form) throw new Error('sem botão seguir');
      const fd = new FormData();
      for (const inp of $$('input[name]', form)) fd.set(inp.name, inp.value);
      const action = new URL(form.getAttribute('action') || `/user/${encName(name)}`, location.origin).href;
      const res = await fetch(action, { method: 'POST', body: fd, credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (btn) { btn.textContent = 'Seguindo'; btn.classList.remove('primary'); }
      toast(`Agora você segue ${name}.`);
      sh.friends = null;
    } catch (_) {
      if (btn) { btn.disabled = false; btn.textContent = 'Seguir'; }
      toast({ text: `Não consegui seguir por aqui. Você pode seguir no perfil da pessoa.`, action: { label: 'Abrir perfil', run: () => go(`${langPrefix()}/user/${encName(name)}`) } });
    }
  }

  /* ---------------- Mensagens (mural / recados) ---------------- */
  function groupInbox(shouts) {
    const by = new Map();
    for (const s of shouts) { if (!s.name) continue; const k = s.name.toLowerCase(); const g = by.get(k) || { name: s.name, img: s.img, items: [] }; g.items.push(s); if (!g.img && s.img) g.img = s.img; by.set(k, g); }
    return [...by.values()].sort((a, b) => (b.items[0]?.when || 0) - (a.items[0]?.when || 0));
  }
  function renderMensagens(body) {
    // não apaga o que você já estava escrevendo quando a lista atualiza em segundo plano
    const prevTo = $('.lfx-sh-to', body)?.value;
    const prevMsg = $('.lfx-sh-msg', body)?.value;
    const composer = el('div', { class: 'lfx-sh-composer' },
      el('div', { class: 'lfx-sh-comp-row' },
        el('input', { class: 'lfx-sh-to', type: 'text', placeholder: 'Para quem? (usuário do Last.fm)', value: prevTo != null ? prevTo : sh.composeTo, spellcheck: 'false', autocomplete: 'off' })),
      el('textarea', { class: 'lfx-sh-msg', placeholder: 'Escreva um recado… aparece no mural da pessoa no Last.fm.', rows: '3', maxlength: '1000' }),
      el('div', { class: 'lfx-sh-quick' }, ...QUICK.map((q) => el('button', { class: 'lfx-chip sm', type: 'button', onclick: (e) => { const ta = $('.lfx-sh-msg', e.target.closest('.lfx-sh-composer')); ta.value = ta.value ? `${ta.value} ${q}` : q; ta.focus(); } }, q))),
      el('div', { class: 'lfx-sh-comp-send' },
        el('span', { class: 'lfx-sh-hint', text: 'O recado é público no Last.fm, como um mural.' }),
        el('button', { class: 'lfx-chip primary lfx-sh-send', type: 'button', onclick: (e) => sendShout(e) }, 'Enviar recado')));
    const list = el('div', { class: 'lfx-sh-inbox' });
    if (sh.inbox == null) list.append(...Array.from({ length: 3 }, () => el('div', { class: 'lfx-sh-shout lfx-skel' })));
    else if (!sh.inbox.length) list.append(socialEmpty('Nenhum recado no seu mural ainda. Mande o primeiro para um amigo!'));
    else { list.append(el('h2', { class: 'lfx-sh-shouts-h', text: 'Sua caixa de recados' }));
      for (const g of sh.inbox) list.append(el('div', { class: 'lfx-sh-thread' },
        g.img ? el('img', { class: 'lfx-sh-shout-av', src: imgSize(g.img, '64s'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-sh-shout-av lfx-sh-av-ph', text: (g.name || '?')[0].toUpperCase() }),
        el('div', { class: 'lfx-sh-thread-main' },
          el('div', { class: 'lfx-sh-shout-top' },
            el('a', { class: 'lfx-sh-shout-name', href: `${langPrefix()}/user/${encName(g.name)}`, 'data-go': '', text: g.name }),
            el('button', { class: 'lfx-sh-reply', type: 'button', onclick: () => openCompose(g.name, '') }, 'Responder')),
          ...g.items.slice(0, 5).map((s) => el('div', { class: 'lfx-sh-bubble' }, el('p', { class: 'lfx-sh-shout-body', text: s.body }), s.when ? el('span', { class: 'lfx-sh-shout-time', text: timeAgo(Date.now() - s.when) }) : null)))));
    }
    body.replaceChildren(composer, list);
    const msg = $('.lfx-sh-msg', body); if (msg && prevMsg) msg.value = prevMsg;
  }
  function parseShouts(doc, max) {
    const out = [];
    const items = $$('.shoutbox-list > li, li.shout, .shout', mainScope(doc));
    for (const node of items) {
      const link = $('a[href*="/user/"]', node);
      const name = link ? (text(link) || decodePart((link.getAttribute('href').match(/\/user\/([^/?#]+)/) || [])[1] || '')) : '';
      const body = text($('.shout-body, .shoutbox-list-item-content, p', node));
      if (!body) continue;
      const img = $('img', node)?.getAttribute('src');
      out.push({ name, body, img: isPlaceholder(img) ? null : img, when: parseLfmDate($('[title]', node)?.getAttribute('title')) || null });
      if (out.length >= max) break;
    }
    return out;
  }
  function openCompose(name, seed) {
    sh.composeTo = name || '';
    if (sh.tab !== 'mensagens') setSocialTab('mensagens');
    else { const body = sh.node && $('.lfx-sh-body', sh.node); if (body) renderMensagens(body); }
    requestAnimationFrame(() => {
      const root2 = sh.node && $('.lfx-sh-body', sh.node);
      if (!root2) return;
      const to = $('.lfx-sh-to', root2); if (to) to.value = name || '';   // escolher "Responder"/"Recado" define o destinatário
      const ta = $('.lfx-sh-msg', root2);
      if (ta) { if (seed && !ta.value) ta.value = seed; ta.focus(); ta.scrollIntoView({ block: 'center', behavior: S.animations && !reducedMotion.matches ? 'smooth' : 'auto' }); }
    });
  }
  const text2 = (node) => (node && 'value' in node ? node.value : text(node));
  async function sendShout(e) {
    const comp = e.target.closest('.lfx-sh-composer');
    const to = text2($('.lfx-sh-to', comp)).trim();
    const msg = $('.lfx-sh-msg', comp).value.trim();
    const btn = $('.lfx-sh-send', comp);
    if (!to) { toast('Escolha para quem enviar o recado.'); return; }
    if (!msg) { toast('Escreva o recado antes de enviar.'); return; }
    if (sh.busy) return;
    sh.busy = true; btn.disabled = true; btn.textContent = 'Enviando…';
    try {
      await postShout(to, msg);
      $('.lfx-sh-msg', comp).value = '';
      toast(`Recado enviado para ${to}.`);
      if (isMe(to)) { sh.inbox = null; loadInbox(true); }
    } catch (_) {
      toast({ text: `Não deu para enviar o recado agora. Você pode mandar direto no Last.fm.`, action: { label: 'Abrir o mural', run: () => go(`${langPrefix()}/user/${encName(to)}/shoutbox`) } });
    } finally { sh.busy = false; btn.disabled = false; btn.textContent = 'Enviar recado'; }
  }
  async function postShout(user, body) {
    const doc = await getDoc(`/user/${encName(user)}/shoutbox`, { priority: true });
    const form = $('form[action*="shout" i], .shoutbox-form form, form.js-shout-form, #content form', doc);
    if (!form) throw new Error('sem formulário de recado');
    const fd = new FormData();
    for (const inp of $$('input[name]', form)) fd.set(inp.name, inp.value);
    const ta = $('textarea[name]', form);
    fd.set(ta?.name || 'body', body);
    const action = new URL(form.getAttribute('action') || `/user/${encName(user)}/shoutbox`, location.origin).href;
    const res = await fetch(action, { method: 'POST', body: fd, credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  }

  /* ================================================================ *
   * Doppelgänger (#doppelganger): o "gêmeo escondido" de uma banda.
   * Em vez dos parecidos óbvios que o Last.fm já mostra, cava os vizinhos
   * dos vizinhos (2º grau) e tira tudo o que o Last.fm sugere direto —
   * sobram sons parecidos, mas fora do óbvio, para descobrir coisa nova.
   * ================================================================ */
  const dop = { node: null, input: null, seed: null, results: null, skipped: 0, loading: false, searchCtrl: null, ctrl: null, sug: [], active: -1, debTimer: 0 };
  const dnorm = (s) => normalize(String(s || ''));

  function buildDoppel() {
    const input = el('input', { class: 'lfx-dop-input', type: 'text', placeholder: 'Digite uma banda ou artista…', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Banda ou artista', role: 'combobox', 'aria-expanded': 'false', 'aria-autocomplete': 'list' });
    input.addEventListener('input', onDopType);
    input.addEventListener('keydown', onDopKey);
    input.addEventListener('focus', () => { if (dop.sug.length) showSug(); });
    dop.input = input;
    // a lista de sugestões flutua no body (senão o layout do Last.fm a corta e ela "não aparece")
    dop.sugBox = el('div', { class: 'lfx-dop-sug lfx-menu', role: 'listbox', hidden: true });
    return el('section', { class: 'container lfx-dop lfx-layer', 'aria-label': 'Doppelgänger' },
      el('div', { class: 'lfx-dop-head' },
        el('div', { class: 'lfx-dop-kicker' }, el('span', { html: ICON.masks || ICON.spark, 'aria-hidden': 'true' }), 'Doppelgänger'),
        el('h1', { text: 'Ache o gêmeo escondido' }),
        el('p', { text: 'Digite uma banda ou artista. Em vez do óbvio que o Last.fm já sugere, o app cava os vizinhos dos vizinhos para achar sons parecidos que você provavelmente ainda não conhece.' })),
      el('div', { class: 'lfx-dop-search' }, el('span', { class: 'lfx-dop-search-ic', html: ICON.search, 'aria-hidden': 'true' }), input),
      el('div', { class: 'lfx-dop-body' }));
  }
  function loadDoppel() { setTimeout(() => { try { dop.input?.focus(); } catch (_) { /* ignora */ } }, 60); paintDopBody(); }
  function stopDoppel() { dop.searchCtrl?.abort(); dop.ctrl?.abort(); clearTimeout(dop.debTimer); dop.sugFloat?.(); dop.sugBox?.remove(); dop.node = null; dop.input = null; dop.sugBox = null; dop.sugFloat = null; dop.seed = null; dop.results = null; dop.loading = false; dop.sug = []; dop.active = -1; }

  /* ---- Busca com sugestões enquanto digita ---- */
  function onDopType(e) {
    const q = e.target.value.trim();
    clearTimeout(dop.debTimer);
    if (q.length < 2) { dop.sug = []; hideSug(); return; }
    dop.debTimer = setTimeout(() => doDopSearch(q), 220);
  }
  async function doDopSearch(q) {
    dop.searchCtrl?.abort(); dop.searchCtrl = new AbortController();
    const signal = dop.searchCtrl.signal;
    try {
      // usa a mesma busca da paleta (caminho já testado em produção); cai para a página de artistas se precisar
      let list = [];
      try { const r = await searchLastfm(q, 'all', signal); list = (r && r.artists) || []; } catch (e) { if (e.name === 'AbortError') return; }
      if (!list.length) { const r2 = await searchLastfm(q, 'artists', signal); list = (r2 && r2.artists) || []; }
      if (signal.aborted) return;
      dop.sug = list.slice(0, 7); dop.active = -1;
      renderSug();
    } catch (e) { if (e.name !== 'AbortError') { dop.sug = []; hideSug(); } }
  }
  function renderSug() {
    const box = dop.sugBox;
    if (!box) return;
    if (!dop.sug.length) { hideSug(); return; }
    box.replaceChildren(...dop.sug.map((a, i) => el('button', { class: `lfx-dop-sugitem${i === dop.active ? ' on' : ''}`, type: 'button', role: 'option', 'aria-selected': String(i === dop.active), onmousedown: (e) => { e.preventDefault(); pickSeed(a); } },
      el('span', { class: 'lfx-dop-sugav' }, a.img ? el('img', { src: imgSize(a.img, '64s'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-sh-av-ph', html: ICON.mic })),
      el('span', { class: 'lfx-dop-sugtxt' }, el('b', { text: a.title }), a.sub ? el('span', { class: 'lfx-dop-sugsub', text: a.sub }) : null))));
    showSug();
  }
  function showSug() {
    const box = dop.sugBox; if (!box || !dop.input) return;
    box.hidden = false;
    if (!dop.sugFloat) dop.sugFloat = floatMenu(box, dop.input, 'left'); else placeMenu(box, dop.input, 'left');
    dop.input.setAttribute('aria-expanded', 'true');
  }
  function hideSug() { const box = dop.sugBox; if (box) { box.hidden = true; dop.input?.setAttribute('aria-expanded', 'false'); } }
  function onDopKey(e) {
    if (!dop.sug.length) { if (e.key === 'Enter' && dop.input.value.trim().length >= 2) { e.preventDefault(); doDopSearch(dop.input.value.trim()); } return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); dop.active = (dop.active + 1) % dop.sug.length; renderSug(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); dop.active = (dop.active - 1 + dop.sug.length) % dop.sug.length; renderSug(); }
    else if (e.key === 'Enter') { e.preventDefault(); pickSeed(dop.sug[dop.active >= 0 ? dop.active : 0]); }
    else if (e.key === 'Escape') { hideSug(); }
  }
  function pickSeed(a) {
    if (!a) return;
    dop.seed = { name: a.title, path: a.path, img: a.img };
    if (dop.input) dop.input.value = a.title;
    dop.sug = []; dop.active = -1; hideSug();
    discoverDoppel();
  }

  /* ---- A descoberta "fora do óbvio" ---- */
  async function discoverDoppel() {
    const seed = dop.seed; if (!seed) return;
    dop.ctrl?.abort(); dop.ctrl = new AbortController(); const signal = dop.ctrl.signal;
    dop.loading = true; dop.results = null; paintDopBody();
    try {
      const direct = await similarOf(seed.path, signal);            // os parecidos óbvios do Last.fm
      if (signal.aborted) return;
      const exclude = new Set([seed.path, ...direct.map((d) => d.path)]);
      dop.skipped = direct.length;
      const hubs = direct.slice(0, 8);
      const tagW = new Map();                                        // impressão digital de gênero do "bairro"
      for (const d of direct) for (const t of (d.tags || [])) tagW.set(dnorm(t), (tagW.get(dnorm(t)) || 0) + 1);
      const tally = new Map();
      await Promise.all(hubs.map((h) => (async () => {
        try {
          const sec = await similarOf(h.path, signal);               // vizinhos dos vizinhos (2º grau)
          for (const c of sec) {
            if (exclude.has(c.path)) continue;                       // tira tudo o que o Last.fm já sugere direto
            const cur = tally.get(c.path) || { name: c.name, path: c.path, img: c.img, listeners: c.listeners || 0, hops: 0, via: new Set(), tags: c.tags || [] };
            cur.hops++; cur.via.add(h.name);
            if (!cur.img && c.img) cur.img = c.img;
            if (!cur.listeners && c.listeners) cur.listeners = c.listeners;
            if (!cur.tags.length && (c.tags || []).length) cur.tags = c.tags;
            tally.set(c.path, cur);
          }
        } catch (_) { /* um hub falhou: segue */ }
      })()));
      if (signal.aborted) return;
      const cand = [...tally.values()];
      for (const c of cand) {
        const tagOverlap = (c.tags || []).reduce((s, t) => s + (tagW.get(dnorm(t)) || 0), 0);
        const pop = c.listeners > 0 ? Math.log10(c.listeners) : 3;   // ~3 (mil) a ~7 (milhões)
        c.common = c.via.size;
        // muitos vizinhos apontando = relacionado de verdade; gênero em comum ajuda; muito famoso perde ponto (favorece o novo)
        c.score = c.hops * 3 + Math.min(tagOverlap, 10) * 1.1 - Math.max(0, pop - 3) * 1.2;
      }
      cand.sort((a, b) => b.score - a.score || a.listeners - b.listeners);
      dop.results = cand.slice(0, 18);
      dop.loading = false; paintDopBody();
    } catch (e) { if (e.name === 'AbortError') return; dop.loading = false; dop.results = []; paintDopBody(); }
  }
  function paintDopBody() {
    const body = dop.node && $('.lfx-dop-body', dop.node);
    if (!body) return;
    if (!me && !dop.seed) { /* funciona sem login também; só segue */ }
    if (!dop.seed) { body.replaceChildren(dopEmpty('Comece digitando uma banda ou artista acima. Escolha o nome certo na lista para o app procurar os gêmeos escondidos.')); return; }
    const head = el('div', { class: 'lfx-dop-seed' },
      el('span', { class: 'lfx-dop-seed-av' }, dop.seed.img ? el('img', { src: imgSize(dop.seed.img, '174s'), alt: '' }) : el('span', { class: 'lfx-sh-av-ph', html: ICON.mic })),
      el('div', {}, el('span', { class: 'lfx-dop-seed-kick', text: 'Gêmeos escondidos de' }), el('a', { class: 'lfx-dop-seed-name', href: dop.seed.path, 'data-go': '', text: dop.seed.name })));
    if (dop.loading) { body.replaceChildren(head, el('div', { class: 'lfx-dop-grid' }, ...Array.from({ length: 8 }, () => el('div', { class: 'lfx-dop-card lfx-skel' })))); return; }
    if (!dop.results || !dop.results.length) { body.replaceChildren(head, dopEmpty('Não achei parecidos fora do óbvio para este artista agora. Tente outro nome.')); return; }
    const pref = preferred();
    const note = el('p', { class: 'lfx-dop-note', text: `Pulei os ${dop.skipped} parecidos que o Last.fm já mostra. Estes vêm de quem se parece com ${dop.seed.name} — mais perto do que você ainda não ouviu.` });
    body.replaceChildren(head, note, el('div', { class: 'lfx-dop-grid' }, ...dop.results.map((c, i) => {
      const info = { kind: 'artist', artist: c.name, title: '' };
      return stagger(el('div', { class: 'lfx-dop-card' },
        el('span', { class: 'lfx-dop-rank', text: String(i + 1) }),
        el('a', { class: 'lfx-dop-art', href: c.path, 'data-go': '', title: `Abrir ${c.name} no Last.fm` }, c.img ? el('img', { src: imgSize(c.img, '300x300'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-sh-av-ph', html: ICON.mic })),
        el('a', { class: 'lfx-dop-name', href: c.path, 'data-go': '', text: c.name }),
        el('div', { class: 'lfx-dop-meta' }, el('span', { class: 'lfx-dop-common', title: 'Quantos parecidos de origens diferentes apontam para este artista' }, `${c.common} em comum`), c.listeners ? el('span', { class: 'lfx-dop-listeners', text: `${fmtN(c.listeners)} ouvintes` }) : null),
        (c.tags && c.tags.length) ? el('div', { class: 'lfx-dop-tags' }, ...c.tags.slice(0, 2).map((t) => el('span', { class: 'lfx-dop-tag', text: t }))) : null,
        el('div', { class: 'lfx-dop-actions' },
          el('a', { class: 'lfx-sh-btn primary sm', href: serviceUrl(pref, c.name, info), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${SERVICES[pref][0]}` }, el('span', { class: 'lfx-svc-dot', style: `--c:${SERVICES[pref][1]}` }), 'Ouvir'),
          el('a', { class: 'lfx-sh-btn ghost sm', href: c.path, 'data-go': '' }, 'Perfil'))), i);
    })));
  }
  function dopEmpty(msg) { return el('div', { class: 'lfx-sh-empty' }, el('span', { class: 'lfx-sh-empty-ic', html: ICON.masks || ICON.spark, 'aria-hidden': 'true' }), el('p', { text: msg })); }

  /* ================================================================ *
   * Shows (#shows): a agenda de shows do próprio Last.fm.
   * - Nas suas cidades: /events?location_0=<nome>&location_1=<lat>&location_2=<lon>&radius=<m>
   *   (a mesma busca da página "Events" do site, uma por cidade, todas as páginas).
   * - Para você: desses shows, primeiro os dos artistas que você ouve, depois os parecidos.
   * - Buscar artista: /music/<artista>/+events (próximos) e /+events/<ano> (que já aconteceram).
   * - Minha agenda: /user/<você>/events (vou / tenho interesse) e /events/<ano> (onde fui),
   *   com mapa. Vou / Talvez / Fui marcam a presença no próprio Last.fm (o mesmo
   *   formulário "I'm going / I'm interested" da página do evento).
   * ================================================================ */
  const shw = {
    node: null, tab: 'paravoce', cities: [], cityGeo: {}, radius: 60, cfgOpen: false,
    pool: null, poolAt: 0, recs: null, recsAt: 0, loading: false, ctrl: null, seen: null, imgs: new Map(), autoTried: false, newCount: 0,
    mine: null, mineAt: 0, mineLoading: false, att: new Map(), busy: new Set(), local: {},
    filt: { period: 'all', city: '', q: '' },
    find: { seed: null, when: 'upcoming', events: null, loading: false, mine: false, sug: [], active: -1, box: null, float: null, input: null, deb: 0, ctrl: null },
    csug: { box: null, float: null, list: [], active: -1, input: null },
    map: null, geo: null, geoBusy: false, err: '',
  };
  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const MESES_L = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const DAY = 864e5;
  const RADII = [30, 60, 100, 200];
  const MAX_CITY_PAGES = 10;
  const dayKey = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
  const monthKey = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${d.getMonth()}`; };
  const fmtDay = (ms) => { const d = new Date(ms); return `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]}`; };
  const fmtTime = (ms) => { const d = new Date(ms); const h = d.getHours(), m = d.getMinutes(); return (h || m) ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}` : ''; };
  const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const isPast = (ev) => ev.date < startOfDay(Date.now());
  function relDay(ms) {
    const diff = Math.round((startOfDay(ms) - startOfDay(Date.now())) / DAY);
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    if (diff < 0) return diff === -1 ? 'Ontem' : '';
    const dow = new Date(ms).getDay();
    if (diff <= 6 && (dow === 0 || dow === 6 || dow === 5)) return 'Este fim de semana';
    if (diff <= 7) return `Em ${diff} dias`;
    return '';
  }

  /* Cidades conhecidas (nome, estado/região, país, lat, lon, outros nomes): sugestões ao digitar e coordenadas da busca */
  const CITY_DB = [
    ['São Paulo', 'SP', 'Brasil', -23.55, -46.63, 'Sao Paulo'], ['Rio de Janeiro', 'RJ', 'Brasil', -22.91, -43.17], ['Belo Horizonte', 'MG', 'Brasil', -19.92, -43.94],
    ['Brasília', 'DF', 'Brasil', -15.79, -47.88, 'Brasilia'], ['Salvador', 'BA', 'Brasil', -12.97, -38.5], ['Fortaleza', 'CE', 'Brasil', -3.73, -38.52],
    ['Recife', 'PE', 'Brasil', -8.05, -34.88], ['Porto Alegre', 'RS', 'Brasil', -30.03, -51.23], ['Curitiba', 'PR', 'Brasil', -25.43, -49.27],
    ['Manaus', 'AM', 'Brasil', -3.12, -60.02], ['Belém', 'PA', 'Brasil', -1.46, -48.49, 'Belem'], ['Goiânia', 'GO', 'Brasil', -16.69, -49.26, 'Goiania'],
    ['Florianópolis', 'SC', 'Brasil', -27.6, -48.55, 'Florianopolis'], ['Vitória', 'ES', 'Brasil', -20.32, -40.34, 'Vitoria'], ['Natal', 'RN', 'Brasil', -5.79, -35.21],
    ['João Pessoa', 'PB', 'Brasil', -7.12, -34.86, 'Joao Pessoa'], ['Maceió', 'AL', 'Brasil', -9.67, -35.74, 'Maceio'], ['Aracaju', 'SE', 'Brasil', -10.95, -37.07],
    ['Teresina', 'PI', 'Brasil', -5.09, -42.8], ['São Luís', 'MA', 'Brasil', -2.53, -44.3, 'Sao Luis'], ['Cuiabá', 'MT', 'Brasil', -15.6, -56.1, 'Cuiaba'],
    ['Campo Grande', 'MS', 'Brasil', -20.47, -54.62], ['Porto Velho', 'RO', 'Brasil', -8.76, -63.9], ['Rio Branco', 'AC', 'Brasil', -9.97, -67.81],
    ['Macapá', 'AP', 'Brasil', 0.03, -51.07, 'Macapa'], ['Boa Vista', 'RR', 'Brasil', 2.82, -60.67], ['Palmas', 'TO', 'Brasil', -10.18, -48.33],
    ['Campinas', 'SP', 'Brasil', -22.91, -47.06], ['Santos', 'SP', 'Brasil', -23.96, -46.33], ['Ribeirão Preto', 'SP', 'Brasil', -21.18, -47.81, 'Ribeirao Preto'],
    ['Sorocaba', 'SP', 'Brasil', -23.5, -47.46], ['São José dos Campos', 'SP', 'Brasil', -23.18, -45.89, 'Sao Jose dos Campos'], ['Jundiaí', 'SP', 'Brasil', -23.19, -46.88, 'Jundiai'],
    ['Piracicaba', 'SP', 'Brasil', -22.73, -47.65], ['Bauru', 'SP', 'Brasil', -22.31, -49.06], ['São José do Rio Preto', 'SP', 'Brasil', -20.82, -49.38, 'Sao Jose do Rio Preto'],
    ['Guarulhos', 'SP', 'Brasil', -23.45, -46.53], ['Santo André', 'SP', 'Brasil', -23.66, -46.53, 'Santo Andre'], ['Niterói', 'RJ', 'Brasil', -22.88, -43.1, 'Niteroi'],
    ['Petrópolis', 'RJ', 'Brasil', -22.51, -43.18, 'Petropolis'], ['Juiz de Fora', 'MG', 'Brasil', -21.76, -43.35], ['Uberlândia', 'MG', 'Brasil', -18.92, -48.28, 'Uberlandia'],
    ['Uberaba', 'MG', 'Brasil', -19.75, -47.93], ['Montes Claros', 'MG', 'Brasil', -16.73, -43.86], ['Ouro Preto', 'MG', 'Brasil', -20.39, -43.5],
    ['Londrina', 'PR', 'Brasil', -23.31, -51.16], ['Maringá', 'PR', 'Brasil', -23.42, -51.94, 'Maringa'], ['Joinville', 'SC', 'Brasil', -26.3, -48.85],
    ['Blumenau', 'SC', 'Brasil', -26.92, -49.07], ['Balneário Camboriú', 'SC', 'Brasil', -26.99, -48.63, 'Balneario Camboriu'], ['Itajaí', 'SC', 'Brasil', -26.91, -48.66, 'Itajai'],
    ['Caxias do Sul', 'RS', 'Brasil', -29.17, -51.18], ['Pelotas', 'RS', 'Brasil', -31.77, -52.34], ['Santa Maria', 'RS', 'Brasil', -29.68, -53.81],
    ['Feira de Santana', 'BA', 'Brasil', -12.27, -38.97], ['Campina Grande', 'PB', 'Brasil', -7.23, -35.88], ['Caruaru', 'PE', 'Brasil', -8.28, -35.98],
    ['Olinda', 'PE', 'Brasil', -8.01, -34.85], ['Vila Velha', 'ES', 'Brasil', -20.33, -40.29], ['Anápolis', 'GO', 'Brasil', -16.33, -48.95, 'Anapolis'],
    ['Buenos Aires', '', 'Argentina', -34.6, -58.38], ['Santiago', '', 'Chile', -33.45, -70.67], ['Montevidéu', '', 'Uruguai', -34.9, -56.16, 'Montevideo'],
    ['Lima', '', 'Peru', -12.05, -77.04], ['Bogotá', '', 'Colômbia', 4.71, -74.07, 'Bogota'], ['Cidade do México', '', 'México', 19.43, -99.13, 'Mexico City', 'Ciudad de México'],
    ['Lisboa', '', 'Portugal', 38.72, -9.14, 'Lisbon'], ['Porto', '', 'Portugal', 41.15, -8.61], ['Madri', '', 'Espanha', 40.42, -3.7, 'Madrid'],
    ['Barcelona', '', 'Espanha', 41.39, 2.17], ['Londres', '', 'Reino Unido', 51.51, -0.13, 'London'], ['Manchester', '', 'Reino Unido', 53.48, -2.24],
    ['Paris', '', 'França', 48.86, 2.35], ['Berlim', '', 'Alemanha', 52.52, 13.4, 'Berlin'], ['Amsterdã', '', 'Holanda', 52.37, 4.9, 'Amsterdam'],
    ['Bruxelas', '', 'Bélgica', 50.85, 4.35, 'Brussels', 'Bruxelles'], ['Milão', '', 'Itália', 45.46, 9.19, 'Milan', 'Milano'], ['Roma', '', 'Itália', 41.9, 12.5, 'Rome'],
    ['Dublin', '', 'Irlanda', 53.35, -6.26], ['Estocolmo', '', 'Suécia', 59.33, 18.07, 'Stockholm'], ['Copenhague', '', 'Dinamarca', 55.68, 12.57, 'Copenhagen'],
    ['Oslo', '', 'Noruega', 59.91, 10.75], ['Viena', '', 'Áustria', 48.21, 16.37, 'Vienna', 'Wien'], ['Praga', '', 'Tchéquia', 50.08, 14.44, 'Prague'],
    ['Nova York', 'NY', 'EUA', 40.71, -74.01, 'New York', 'Brooklyn'], ['Los Angeles', 'CA', 'EUA', 34.05, -118.24], ['Chicago', 'IL', 'EUA', 41.88, -87.63],
    ['São Francisco', 'CA', 'EUA', 37.77, -122.42, 'San Francisco'], ['Austin', 'TX', 'EUA', 30.27, -97.74], ['Nashville', 'TN', 'EUA', 36.16, -86.78],
    ['Miami', 'FL', 'EUA', 25.76, -80.19], ['Seattle', 'WA', 'EUA', 47.61, -122.33], ['Toronto', '', 'Canadá', 43.65, -79.38], ['Montreal', '', 'Canadá', 45.5, -73.57],
    ['Tóquio', '', 'Japão', 35.68, 139.69, 'Tokyo'], ['Seul', '', 'Coreia do Sul', 37.57, 126.98, 'Seoul'], ['Sydney', '', 'Austrália', -33.87, 151.21], ['Melbourne', '', 'Austrália', -37.81, 144.96],
  ].map(([name, region, country, lat, lon, ...aka]) => ({ name, region, country, lat, lon, keys: [name, ...aka].map((x) => normalize(x)) }));
  const cityInfo = (name) => {
    const n = normalize(String(name || '').split(',')[0]);
    const hit = CITY_DB.find((c) => c.keys.includes(n));
    if (hit) return { name: hit.name, lat: hit.lat, lon: hit.lon, keys: hit.keys };
    const g = shw.cityGeo[n];
    return { name: String(name || '').trim(), lat: g ? g.lat : null, lon: g ? g.lon : null, keys: [n] };
  };
  function distKm(a, b) {
    const R = 6371, rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  /** Em qual das suas cidades fica a cidade do show (pela distância quando há coordenadas, senão pelo nome) */
  function cityOfEvent(ev) {
    if (ev.cityHit) return ev.cityHit;
    const ci = cityInfo(ev.city || '');
    const n = normalize(String(ev.city || '').split(',')[0]);
    for (const c of shw.cities) {
      const cc = cityInfo(c);
      if (cc.keys.includes(n)) return cc.name;
      if (ci.lat != null && cc.lat != null && distKm(ci, cc) <= shw.radius) return cc.name;
    }
    return null;
  }

  /* ---------------- Leitura das páginas de eventos do Last.fm ---------------- */
  const MONTH_NAMES = [
    ['january', 'janeiro', 'enero', 'januar', 'janvier', 'gennaio', 'styczen', 'januari', 'ocak'],
    ['february', 'fevereiro', 'febrero', 'februar', 'fevrier', 'febbraio', 'luty', 'februari', 'subat'],
    ['march', 'marco', 'marzo', 'marz', 'mars', 'marzec', 'maart', 'mart'],
    ['april', 'abril', 'avril', 'aprile', 'kwiecien', 'nisan'],
    ['may', 'maio', 'mayo', 'mai', 'maggio', 'maj', 'mei', 'mayis'],
    ['june', 'junho', 'junio', 'juni', 'juin', 'giugno', 'czerwiec', 'haziran'],
    ['july', 'julho', 'julio', 'juli', 'juillet', 'luglio', 'lipiec', 'temmuz'],
    ['august', 'agosto', 'aout', 'sierpien', 'augustus', 'agustos'],
    ['september', 'setembro', 'septiembre', 'septembre', 'settembre', 'wrzesien', 'eylul'],
    ['october', 'outubro', 'octubre', 'oktober', 'octobre', 'ottobre', 'pazdziernik', 'ekim'],
    ['november', 'novembro', 'noviembre', 'novembre', 'listopad', 'kasim'],
    ['december', 'dezembro', 'diciembre', 'dezember', 'decembre', 'dicembre', 'grudzien', 'aralik'],
  ];
  /** "Friday 30 October 2026", "Sexta-feira 30 de Outubro de 2026"… → início do dia (hora local) */
  function parseHeadingDate(str) {
    const t = normalize(str);
    const y = t.match(/\b(19|20)\d{2}\b/);
    const rest = y ? t.replace(y[0], ' ') : t;
    const d = rest.match(/\b(\d{1,2})\b/);
    const words = rest.split(/[^a-z]+/).filter(Boolean);
    const mi = MONTH_NAMES.findIndex((names) => words.some((w) => names.includes(w) || (w.length >= 3 && names[0].startsWith(w))));
    if (mi < 0 || !d) return null;
    const year = y ? +y[0] : new Date().getFullYear();
    return new Date(year, mi, +d[1]).getTime();
  }
  function rowDate(row) {
    const t = $('time[datetime]', row)?.getAttribute('datetime');
    const m = t && t.match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)).getTime();
    let h = row.closest('table')?.previousElementSibling;
    while (h && !/^H[1-4]$/.test(h.tagName)) h = h.previousElementSibling;
    return h ? parseHeadingDate(text(h)) : null;
  }
  const EV_RE = /\/(event|festival)\/(\d+)/;
  const AVATAR_RE = /^(?:avatar|imagem|image|bild|foto|immagine)\s+(?:for|de|do|da|of|von|di|dla|för|för|van|voor)\s+/i;
  function parseEventRows(doc) {
    const out = [];
    for (const row of $$('tr.events-list-item', doc)) {
      const a = $('.events-list-item-event--title a', row) || $$('a[href]', row).find((x) => EV_RE.test(x.getAttribute('href') || ''));
      const href = (a?.getAttribute('href') || '').replace(/^https?:\/\/[^/]+/, '');
      const m = href.match(EV_RE);
      if (!m) continue;
      const date = rowDate(row);
      if (!date) continue;
      const title = text(a);
      const lineupAll = text($('.events-list-item-event--lineup, .events-list-item-acts', row)).split(/\s*,\s*/).filter(Boolean);
      const im = $('.events-list-item-art img', row);
      const src = im?.getAttribute('src') || '';
      const altName = (im?.getAttribute('alt') || '').replace(AVATAR_RE, '').trim();
      const artist = altName || lineupAll[0] || title.split(/\s+[-–]\s+|:\s+/)[0].trim() || title;
      const bc = $('.attendance-badge', row)?.className || '';
      const past = date < startOfDay(Date.now());
      let att = '';
      if (/--attending/.test(bc)) att = past ? 'went' : 'going';
      else if (/--maybe/.test(bc)) att = past ? 'interested' : 'maybe';
      // agenda da cidade/sua: cidade e país separados; agenda do artista: "Perth, WA, Australia" num campo só
      let city = text($('.events-list-item-venue--city', row));
      let country = text($('.events-list-item-venue--country', row));
      if (!city && !country) {
        const parts = text($('.events-list-item-venue--address', row)).split(/\s*,\s*/).filter(Boolean);
        if (parts.length > 1) country = parts.pop();
        city = parts.join(', ');
      }
      const venue = text($('.events-list-item-venue--title', row));
      out.push({
        id: `${m[1]}:${m[2]}`, kind: m[1], url: href, title, artist,
        lineup: lineupAll.filter((n) => normalize(n) !== normalize(artist)),
        venue, city, country, date, att,
        img: src && !isPlaceholder(src) ? imgSize(src, '300x300') : null,
        crowd: $$('.events-list-item-attendees-count', row).map(text).filter(Boolean).join(' · '),
        friends: $$('.attendee-you-know a[href]', row).map((x) => ({ name: decodePart((x.getAttribute('href') || '').split('/').pop() || ''), img: $('img', x)?.getAttribute('src') || null })).filter((f) => f.name).slice(0, 6),
      });
    }
    return out;
  }
  function lastPage(doc) {
    let n = 1;
    for (const li of $$('.pagination .pagination-page', doc)) { const v = parseInt(text(li), 10); if (v > n) n = v; }
    return n;
  }
  /** Uma lista do Last.fm com todas as páginas (até max) */
  async function eventPages(url, max, signal) {
    const sep = url.includes('?') ? '&' : '?';
    const doc = await getDoc(url, { signal });
    let evs = parseEventRows(doc);
    const pages = Math.min(lastPage(doc), max);
    if (pages > 1) {
      const rest = await Promise.all(Array.from({ length: pages - 1 }, (_, i) => getDoc(`${url}${sep}page=${i + 2}`, { signal }).then(parseEventRows).catch(() => [])));
      for (const r of rest) evs = evs.concat(r);
    }
    return evs;
  }
  async function cityCoords(name) {
    const ci = cityInfo(name);
    if (ci.lat != null) return ci;
    const r = await ext.send({ type: 'lfx:geocode', queries: [name] });
    const g = r && r[name];
    if (g) { shw.cityGeo[normalize(String(name).split(',')[0])] = { lat: g.lat, lon: g.lon }; ext.setLocal('lfx:shows:citygeo', shw.cityGeo); return { ...ci, lat: g.lat, lon: g.lon }; }
    return null;
  }
  const cityUrl = (c) => `/events?location_0=${encodeURIComponent(c.name)}&location_1=${c.lat}&location_2=${c.lon}&radius=${shw.radius * 1000}`;
  /** Todos os shows do Last.fm nas suas cidades (a mesma lista de last.fm/events, cidade por cidade) */
  async function loadPool(signal) {
    const seen = new Set();
    const all = [];
    const missing = [];
    for (const name of shw.cities) {
      const c = await cityCoords(name);
      if (signal.aborted) return null;
      if (!c) { missing.push(name); continue; }
      const evs = await eventPages(cityUrl(c), MAX_CITY_PAGES, signal).catch((e) => { if (e.name === 'AbortError') throw e; return []; });
      for (const e of evs) { if (seen.has(e.id)) continue; seen.add(e.id); e.cityHit = c.name; all.push(e); }
    }
    shw.err = missing.length ? `Não encontrei ${missing.join(', ')} no mapa. Confira o nome da cidade.` : '';
    return all.sort((a, b) => a.date - b.date);
  }

  /* ---------------- Montagem ---------------- */
  const SHOW_TABS = [['paravoce', 'Para você'], ['cidades', 'Nas suas cidades'], ['buscar', 'Buscar artista'], ['agenda', 'Minha agenda']];
  function buildShows() {
    const tabs = el('div', { class: 'lfx-sh-tabs', role: 'tablist' });
    for (const [k, label] of SHOW_TABS) tabs.append(el('button', { class: `lfx-sh-tab${k === shw.tab ? ' on' : ''}`, type: 'button', role: 'tab', 'data-tab': k, 'aria-selected': String(k === shw.tab), onclick: () => setShowsTab(k) }, label));
    return el('section', { class: 'container lfx-shw lfx-layer', 'aria-label': 'Shows' },
      el('div', { class: 'lfx-shw-hero' },
        el('div', { class: 'lfx-shw-hero-txt' },
          el('div', { class: 'lfx-dop-kicker' }, el('span', { html: ICON.ticket, 'aria-hidden': 'true' }), 'Shows · agenda do Last.fm'),
          el('h1', { text: 'Seus shows, nas suas cidades' }),
          el('p', { text: 'A agenda de shows do próprio Last.fm, cidade por cidade — com os artistas que você ouve na frente, depois os parecidos. Vou, Talvez e Fui ficam salvos na sua conta do Last.fm.' })),
        el('div', { class: 'lfx-sh-head-act' }, el('button', { class: 'lfx-chip lfx-shw-refresh', type: 'button', title: 'Atualizar', onclick: () => { loadShowRecs(true); loadMine(true); } }, el('span', { html: ICON.refresh || ICON.spark }), 'Atualizar'))),
      el('div', { class: 'lfx-shw-cities' }),
      tabs,
      el('div', { class: 'lfx-sh-body' }));
  }
  function setShowsTab(k) {
    if (!shw.node) return;
    shw.tab = k;
    for (const b of $$('.lfx-sh-tab', shw.node)) { const on = b.dataset.tab === k; b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); }
    hideFindSug(); hideCitySug();
    paintShows();
    if (k === 'agenda' && me && (!shw.mine || Date.now() - shw.mineAt > 10 * 60e3)) loadMine(false);
  }
  function stopShows() {
    shw.ctrl?.abort(); shw.ctrl = null; shw.find.ctrl?.abort(); clearTimeout(shw.find.deb);
    shw.find.float?.(); shw.find.box?.remove(); shw.find.float = null; shw.find.box = null;
    shw.csug.float?.(); shw.csug.box?.remove(); shw.csug.float = null; shw.csug.box = null;
    destroyShowsMap();
    shw.node = null; shw.loading = false; shw.cfgOpen = false;
  }
  async function loadShowsState() {
    shw.cities = await ext.getLocal('lfx:shows:cities', []);
    shw.cityGeo = await ext.getLocal('lfx:shows:citygeo', {});
    const r = await ext.getLocal('lfx:shows:radius', 60);
    shw.radius = RADII.includes(r) ? r : RADII.reduce((b, x) => (Math.abs(x - r) < Math.abs(b - r) ? x : b), 60);
    shw.local = await ext.getLocal('lfx:shows:rsvp', {});
    if (!shw.geo) shw.geo = await ext.getLocal('lfx:geo', {});
    if (!shw.seen) shw.seen = new Set(await ext.getLocal('lfx:shows:seen', []));
    if (!shw.recs) {
      const c = await ext.getLocal('lfx:shows:lfm', null);
      if (c && Array.isArray(c.pool) && c.v === 2) {
        shw.pool = c.pool; shw.poolAt = c.t || 0; shw.recsAt = c.t || 0;
        shw.recs = shw.pool.filter((e) => e.reason === 'lib' || e.reason === 'sim');
        for (const e of shw.recs) e.isNew = shw.seen.size > 0 && !shw.seen.has(e.id);
      }
    }
    if (!shw.mine) {
      const m = await ext.getLocal('lfx:shows:mine', null);
      if (m && Array.isArray(m.events)) { shw.mine = m.events; shw.mineAt = m.t || 0; }
    }
  }
  async function loadShows() {
    await loadShowsState();
    renderCities(); paintShows();
    // sempre atualiza ao abrir se a lista tiver mais de 3 horas
    if (me && shw.cities.length && (!shw.recs || Date.now() - shw.recsAt > 3 * HOUR)) loadShowRecs(false);
    if (me && (!shw.mine || Date.now() - shw.mineAt > 30 * 60e3)) loadMine(false);
  }
  async function saveCities() { await ext.setLocal('lfx:shows:cities', shw.cities); }
  function addCity(name) {
    const v = String(name || '').trim();
    if (!v) return;
    const ci = cityInfo(v);
    if (!shw.cities.some((c) => normalize(c) === normalize(ci.name))) { shw.cities = [...shw.cities, ci.name]; saveCities(); renderCities(); loadShowRecs(true); }
  }
  function removeCity(c) {
    shw.cities = shw.cities.filter((x) => x !== c);
    if (shw.filt.city === c) shw.filt.city = '';
    if (shw.pool) { shw.pool = shw.pool.filter((e) => e.cityHit !== cityInfo(c).name); shw.recs = shw.pool.filter((e) => e.reason === 'lib' || e.reason === 'sim'); }
    saveCities(); renderCities(); paintShows();
    if (shw.cities.length) loadShowRecs(true);
  }

  /* ---------------- Cidades (etiquetas + sugestões ao digitar) ---------------- */
  function cityCounts() {
    const m = new Map();
    for (const e of (shw.pool || [])) { const c = e.cityHit; if (c) m.set(c, (m.get(c) || 0) + 1); }
    return m;
  }
  function renderCities() {
    const bar = shw.node && $('.lfx-shw-cities', shw.node);
    if (!bar) return;
    const prevIn = $('.lfx-shw-cityinput', bar);
    const typed = prevIn ? prevIn.value : '';
    const hadFocus = !!prevIn && document.activeElement === prevIn;
    const counts = cityCounts();
    const chips = el('div', { class: 'lfx-shw-chips' },
      ...(shw.cities || []).map((c) => el('span', { class: 'lfx-shw-chip' }, el('span', { html: ICON.pin, 'aria-hidden': 'true' }), c,
        shw.pool ? el('span', { class: 'lfx-shw-chip-n', title: 'Shows no Last.fm nesta região', text: String(counts.get(cityInfo(c).name) || 0) }) : null,
        el('button', { class: 'lfx-shw-chip-x', type: 'button', 'aria-label': `Tirar ${c}`, html: ICON.close, onclick: () => removeCity(c) }))));
    const input = el('input', { class: 'lfx-shw-cityinput', type: 'text', placeholder: shw.cities.length ? 'Adicionar outra cidade…' : 'Adicione uma cidade (ex.: São Paulo)', spellcheck: 'false', autocomplete: 'off', role: 'combobox', 'aria-expanded': 'false', 'aria-autocomplete': 'list' });
    shw.csug.input = input;
    input.addEventListener('input', () => cityTyped(input.value));
    input.addEventListener('keydown', (e) => {
      const L2 = shw.csug.list;
      if (e.key === 'ArrowDown' && L2.length) { e.preventDefault(); shw.csug.active = (shw.csug.active + 1) % L2.length; paintCitySug(); }
      else if (e.key === 'ArrowUp' && L2.length) { e.preventDefault(); shw.csug.active = (shw.csug.active - 1 + L2.length) % L2.length; paintCitySug(); }
      else if (e.key === 'Enter') { e.preventDefault(); const pick = L2[shw.csug.active >= 0 ? shw.csug.active : -1]; const val = pick ? pick.name : input.value; input.value = ''; hideCitySug(); addCity(val); setTimeout(() => $('.lfx-shw-cityinput', shw.node)?.focus(), 0); }
      else if (e.key === 'Escape') hideCitySug();
    });
    input.addEventListener('blur', () => setTimeout(hideCitySug, 150));
    const cfg = el('div', { class: 'lfx-shw-cfg' });
    if (shw.cfgOpen) {
      const radius = el('div', { class: 'lfx-shw-seg', role: 'group', 'aria-label': 'Distância' },
        ...RADII.map((km) => el('button', { type: 'button', class: shw.radius === km ? 'on' : '', 'aria-pressed': String(shw.radius === km), onclick: async () => { if (shw.radius === km) return; shw.radius = km; await ext.setLocal('lfx:shows:radius', km); renderCities(); loadShowRecs(true); } }, `${km} km`)));
      cfg.append(
        el('div', { class: 'lfx-shw-cfg-row' }, el('span', { class: 'lfx-shw-cfg-label', text: 'Shows a até' }), radius, el('span', { class: 'lfx-sh-hint', text: 'de cada cidade (o mesmo raio da busca do Last.fm).' })),
        el('p', { class: 'lfx-sh-hint' }, 'Os shows vêm da agenda do Last.fm (', el('a', { href: `${langPrefix()}/events`, 'data-go': '', text: 'last.fm/events' }), '). Faltou um show? Qualquer pessoa pode cadastrar eventos no próprio Last.fm, em ', el('a', { href: '/events/add', 'data-go': '', text: 'Adicionar evento' }), '.'));
    }
    bar.replaceChildren(
      el('div', { class: 'lfx-shw-cities-row' }, chips,
        el('div', { class: 'lfx-shw-add' }, el('span', { class: 'lfx-shw-add-ic', html: ICON.plus, 'aria-hidden': 'true' }), input),
        el('button', { class: `lfx-chip lfx-shw-cfgtoggle${shw.cfgOpen ? ' on' : ''}`, type: 'button', 'aria-expanded': String(shw.cfgOpen), onclick: () => { shw.cfgOpen = !shw.cfgOpen; renderCities(); } }, el('span', { html: ICON.pin }), `Raio · ${shw.radius} km`)),
      cfg);
    if (typed) input.value = typed;
    if (hadFocus) { input.focus(); try { input.setSelectionRange(typed.length, typed.length); } catch (_) { /* ignora */ } }
  }
  function cityTyped(q) {
    const n = normalize(q);
    if (!n) { shw.csug.list = []; hideCitySug(); return; }
    const taken = new Set(shw.cities.map((c) => normalize(c)));
    const starts = [], has = [];
    for (const c of CITY_DB) {
      if (taken.has(normalize(c.name))) continue;
      if (c.keys.some((k) => k.startsWith(n))) starts.push(c); else if (c.keys.some((k) => k.includes(n))) has.push(c);
    }
    shw.csug.list = [...starts, ...has].slice(0, 7);
    shw.csug.active = shw.csug.list.length ? 0 : -1;
    paintCitySug();
  }
  function paintCitySug() {
    const s = shw.csug;
    if (!s.list.length || !s.input || !s.input.isConnected) { hideCitySug(); return; }
    if (!s.box) s.box = el('div', { class: 'lfx-dop-sug lfx-menu lfx-shw-citysug', role: 'listbox', hidden: true });
    s.box.replaceChildren(...s.list.map((c, i) => el('button', { class: `lfx-dop-sugitem${i === s.active ? ' on' : ''}`, type: 'button', role: 'option', 'aria-selected': String(i === s.active), onmousedown: (e) => { e.preventDefault(); s.input.value = ''; hideCitySug(); addCity(c.name); } },
      el('span', { class: 'lfx-dop-sugav lfx-shw-sugpin', html: ICON.pin }),
      el('span', { class: 'lfx-dop-sugtxt' }, el('b', { text: c.name }), el('span', { class: 'lfx-dop-sugsub', text: [c.region, c.country].filter(Boolean).join(' · ') })))));
    s.box.hidden = false;
    if (!s.float || !s.box.isConnected) { s.float?.(); s.float = floatMenu(s.box, s.input, 'left'); } else placeMenu(s.box, s.input, 'left');
    s.input.setAttribute('aria-expanded', 'true');
  }
  function hideCitySug() { const s = shw.csug; if (s.box) s.box.hidden = true; s.input?.setAttribute('aria-expanded', 'false'); }

  /* ---------------- Recomendações (seus artistas primeiro, depois os parecidos) ---------------- */
  async function libraryArtists(fresh) {
    const age = fresh ? 60000 : 6 * HOUR;
    const [year, all, month] = await Promise.all([
      libArtists(me.name, 'LAST_365_DAYS', 3, age).catch(() => []),
      libArtists(me.name, 'ALL', 4, age).catch(() => []),
      libArtists(me.name, 'LAST_30_DAYS', 1, age).catch(() => []),
    ]);
    const m = new Map();
    const bump = (list, w) => list.forEach((a, i) => {
      const k = normalize(a.name);
      const cur = m.get(k) || { name: a.name, path: a.path, img: a.img, plays: 0, score: 0 };
      cur.score += w * (1 - i / Math.max(list.length, 1));
      cur.plays = Math.max(cur.plays, a.n || 0);
      if (!cur.img && a.img) cur.img = a.img;
      m.set(k, cur);
    });
    bump(year, 1.0); bump(all, 0.7); bump(month, 0.9);
    return [...m.values()].sort((a, b) => b.score - a.score);
  }
  /** Marca cada show: de um artista que você ouve (lib), parecido (sim) ou nenhum dos dois */
  function tagEvents(events, libMap, simMap) {
    for (const e of events) {
      e.reason = ''; e.rank = null; e.plays = 0; e.via = ''; e.match = '';
      for (const n of [e.artist, ...(e.lineup || [])]) {
        const k = normalize(n);
        const l = libMap.get(k);
        if (l && (e.rank == null || l.rank < e.rank)) { e.reason = 'lib'; e.rank = l.rank; e.plays = l.plays; e.match = l.name; }
      }
      if (e.reason) continue;
      for (const n of [e.artist, ...(e.lineup || [])]) {
        const s = simMap.get(normalize(n));
        if (s) { e.reason = 'sim'; e.via = s.via; e.match = n; break; }
      }
    }
  }
  async function loadShowRecs(fresh, { quiet = false } = {}) {
    if (!me) return;
    if (!shw.cities || !shw.cities.length) { if (!quiet) paintShows(); return; }
    shw.ctrl?.abort(); shw.ctrl = new AbortController(); const signal = shw.ctrl.signal;
    shw.loading = true;
    if (!quiet) { paintShows(); }
    try {
      const [pool, lib] = await Promise.all([loadPool(signal), libraryArtists(fresh)]);
      if (signal.aborted || !pool) return;
      const libMap = new Map();
      lib.forEach((a, i) => { libMap.set(normalize(a.name), { name: a.name, rank: i, plays: a.plays }); if (a.img) shw.imgs.set(normalize(a.name), a.img); });
      // os parecidos com os que você mais ouve (o seu "estilo") e que você ainda não ouve
      const simMap = new Map();
      await Promise.all(lib.slice(0, 15).map(async (a) => {
        try {
          for (const s of await similarOf(a.path, signal)) {
            const k = normalize(s.name);
            if (libMap.has(k) || simMap.has(k)) continue;
            simMap.set(k, { via: a.name });
            if (s.img) shw.imgs.set(k, s.img);
          }
        } catch (_) { /* um artista falhou: segue */ }
      }));
      if (signal.aborted) return;
      tagEvents(pool, libMap, simMap);
      for (const e of pool) if (!e.img) e.img = shw.imgs.get(normalize(e.match || e.artist)) || null;
      const recs = pool.filter((e) => e.reason === 'lib' || e.reason === 'sim');
      // o que é novidade desde a última vez
      const first = !shw.seen || !shw.seen.size;
      if (!shw.seen) shw.seen = new Set();
      for (const e of recs) e.isNew = !first && !shw.seen.has(e.id);
      if (first) { recs.forEach((e) => shw.seen.add(e.id)); ext.setLocal('lfx:shows:seen', [...shw.seen].slice(-3000)); }
      shw.pool = pool; shw.recs = recs; shw.recsAt = shw.poolAt = Date.now();
      ext.setLocal('lfx:shows:lfm', { v: 2, t: shw.recsAt, pool: pool.slice(0, 1500) });
      shw.newCount = recs.filter((e) => e.isNew && e.reason === 'lib').length;
      paintShowsBadge();
    } catch (e) { if (e.name !== 'AbortError') { shw.err = 'Não consegui abrir a agenda do Last.fm agora. Tente "Atualizar" daqui a pouco.'; shw.recs = shw.recs || []; shw.pool = shw.pool || []; } }
    finally { if (!signal.aborted) { shw.loading = false; if (shw.node) { renderCities(); if (shw.tab !== 'agenda' && shw.tab !== 'buscar') paintShows(); } } }
  }
  /** Marca como visto (zera o "Novo") depois que você abre a aba e vê a lista */
  function markShowsSeen() {
    if (!shw.recs || !shw.seen) return;
    let changed = false;
    for (const e of shw.recs) if (!shw.seen.has(e.id)) { shw.seen.add(e.id); changed = true; }
    if (changed) ext.setLocal('lfx:shows:seen', [...shw.seen].slice(-3000));
    shw.newCount = 0; paintShowsBadge();
  }
  /** Mantém você atualizado: em segundo plano, a cada 12 h, procura shows novos dos seus artistas */
  async function maybeAutoShows() {
    if (shw.autoTried || !S.enabled || !S.shows || !me) return;
    shw.autoTried = true;
    await loadShowsState();
    if (!shw.cities.length) return;
    if (shw.recs && Date.now() - shw.recsAt < 12 * HOUR) { shw.newCount = shw.recs.filter((e) => e.isNew && e.reason === 'lib' && !shw.seen.has(e.id)).length; paintShowsBadge(); return; }
    await loadShowRecs(false, { quiet: true });
    if (shw.newCount && currentView() !== 'shows') {
      const top = shw.recs.find((e) => e.isNew && e.reason === 'lib');
      toast({ text: shw.newCount === 1 && top ? `🎟️ ${top.match || top.artist} vai tocar em ${top.cityHit} (${fmtDay(top.date)})` : `🎟️ ${shw.newCount} shows novos de artistas que você ouve nas suas cidades`, action: { label: 'Ver', run: () => openView('shows') } });
    }
  }
  function paintShowsBadge() {
    const links = [side && $('.lfx-side-link[data-match="#shows"]', side), $('.lfx-hubnav-link[data-view="shows"]')].filter(Boolean);
    for (const a of links) {
      let b = $('.lfx-side-badge', a);
      if (!shw.newCount) { b?.remove(); continue; }
      if (!b) { b = el('span', { class: 'lfx-side-badge' }); a.append(b); }
      b.textContent = shw.newCount > 9 ? '9+' : String(shw.newCount);
      b.title = `${shw.newCount} shows novos de artistas que você ouve`;
    }
  }

  /* ---------------- Minha agenda no Last.fm (vou / tenho interesse / fui) ---------------- */
  async function loadMine(fresh) {
    if (!me || shw.mineLoading) return;
    shw.mineLoading = true;
    if (shw.node && shw.tab === 'agenda' && !shw.mine) paintShows();
    try {
      const base = `/user/${encName(me.name)}/events`;
      const doc = await getDoc(base, { priority: true });
      let evs = parseEventRows(doc);
      const now = new Date().getFullYear();
      const years = [...new Set($$('a[href]', doc).map((a) => +((a.getAttribute('href') || '').match(/\/events\/(\d{4})\/?$/) || [])[1]).filter((y) => y >= 1950 && y <= now + 1))].sort((a, b) => b - a).slice(0, 15);
      const hist = await Promise.all(years.map((y) => eventPages(`${base}/${y}`, 4).catch(() => [])));
      const seen = new Set();
      const all = [];
      const known = new Map((shw.pool || []).map((x) => [x.id, x]));
      for (const e of [...evs, ...hist.flat()]) {
        if (seen.has(e.id) || !e.att) continue;
        seen.add(e.id);
        // nas páginas da sua agenda o Last.fm mostra a data no lugar da foto: pega a foto da agenda da cidade ou da sua biblioteca
        if (!e.img) e.img = known.get(e.id)?.img || shw.imgs.get(normalize(e.artist)) || null;
        all.push(e);
      }
      shw.mine = all; shw.mineAt = Date.now();
      for (const e of all) shw.att.delete(e.id);
      ext.setLocal('lfx:shows:mine', { t: shw.mineAt, events: all.slice(0, 800) });
    } catch (_) { shw.mine = shw.mine || []; }
    finally {
      shw.mineLoading = false;
      if (shw.node) paintShows();
    }
  }
  /** Presença atual de um show (o que você marcou agora tem prioridade sobre a lista lida antes) */
  function attOf(ev) {
    if (ev.local) return ev.att;
    if (shw.att.has(ev.id)) return shw.att.get(ev.id);
    const mine = shw.mine && shw.mine.find((x) => x.id === ev.id);
    return mine ? mine.att : (ev.att || '');
  }
  function csrfToken(scope) {
    return $('input[name="csrfmiddlewaretoken"]', scope)?.value
      || $('input[name="csrfmiddlewaretoken"]')?.value
      || (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || '';
  }
  async function readAttendance(url) {
    const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const doc = parseHTML(await res.text());
    const form = $('form.attendance-control', doc) || $$('form', doc).find((f) => /\/attendance\/?$/.test(f.getAttribute('action') || ''));
    return { doc, form };
  }
  /** Vou / Talvez / Fui: usa o mesmo formulário da página do evento no Last.fm */
  async function setAttendance(ev, want) {
    if (ev.local) return setLocalRsvp(ev, want);
    if (shw.busy.has(ev.id)) return;
    const before = attOf(ev);
    const turnOff = before === want || (want === 'maybe' && before === 'interested');
    const value = turnOff ? 'no' : want === 'maybe' ? 'maybe' : 'attending';
    const after = turnOff ? '' : want;
    shw.busy.add(ev.id); shw.att.set(ev.id, after); paintShows();
    try {
      const { form } = await readAttendance(ev.url);
      if (!form) throw new Error('sem formulário');
      const body = new URLSearchParams();
      body.set('csrfmiddlewaretoken', csrfToken(form));
      body.set('attendance', value);
      const res = await fetch(form.getAttribute('action') || `${ev.url}/attendance`, { method: 'POST', credentials: 'include', body, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // confere na página do evento se o Last.fm guardou
      const chk = await readAttendance(ev.url).catch(() => null);
      const state = chk?.form?.getAttribute('data-ajax-form-state');
      if (state != null && state !== (value === 'no' ? '' : value)) throw new Error('não confirmou');
      shw.att.set(ev.id, after);
      if (shw.mine) {
        shw.mine = shw.mine.filter((x) => x.id !== ev.id);
        if (after) shw.mine.push({ ...ev, att: after, local: false });
        ext.setLocal('lfx:shows:mine', { t: shw.mineAt, events: shw.mine.slice(0, 800) });
      }
      const label = { going: 'Presença confirmada no Last.fm', maybe: 'Marcado como "tenho interesse" no Last.fm', went: 'Guardado no Last.fm como show que você foi' }[after];
      toast(after ? { text: `${label}: ${ev.title || ev.artist}.`, action: { label: 'Ver agenda', run: () => setShowsTab('agenda') } } : `Presença tirada no Last.fm: ${ev.title || ev.artist}.`);
    } catch (_) {
      shw.att.set(ev.id, before);
      toast({ text: 'O Last.fm não aceitou a marcação agora.', action: { label: 'Abrir o evento', run: () => go(ev.url) } });
    } finally {
      shw.busy.delete(ev.id);
      paintShows();
    }
  }
  /* Shows marcados na versão anterior (só no app, sem evento no Last.fm) */
  function localItems() {
    return Object.entries(shw.local || {}).filter(([, v]) => v && v.date).map(([id, v]) => ({
      id: `local:${id}`, localId: id, local: true, title: v.artist, artist: v.artist, lineup: v.lineup || [], venue: v.venue || '', city: v.city || '', country: v.country || '',
      date: v.date, img: v.img || null, url: '', att: v.status === 'went' ? 'went' : v.status === 'maybe' ? 'maybe' : 'going', lat: v.lat, lon: v.lon,
    }));
  }
  async function setLocalRsvp(ev, want) {
    if (!shw.local[ev.localId]) return;
    if (ev.att === want) delete shw.local[ev.localId];
    else shw.local[ev.localId].status = want;
    await ext.setLocal('lfx:shows:rsvp', shw.local);
    paintShows();
  }

  /* ---------------- Pintura ---------------- */
  function paintShows() {
    if (!shw.node) return;
    const body = $('.lfx-sh-body', shw.node);
    if (!body) return;
    if (shw.tab !== 'agenda') destroyShowsMap();
    if (!me) { body.replaceChildren(socialEmpty('Entre na sua conta do Last.fm para ver a agenda de shows dos artistas que você ouve.', 'Entrar no Last.fm', () => go(`${langPrefix()}/login`))); return; }
    if (shw.tab === 'agenda') return renderAgenda(body);
    if (shw.tab === 'buscar') return renderFind(body);
    if (!shw.cities || !shw.cities.length) { body.replaceChildren(socialEmpty('Adicione pelo menos uma cidade acima (pode ser mais de uma) para ver a agenda do Last.fm por lá.')); return; }
    if (shw.tab === 'cidades') return renderCityAgenda(body);
    // Para você
    if (shw.recs == null) { body.replaceChildren(loadingNote('Lendo a agenda do Last.fm nas suas cidades…'), showsSkel()); return; }
    const all = shw.recs.filter(periodOk).filter((e) => !shw.filt.city || e.cityHit === shw.filt.city);
    const mine = all.filter((e) => e.reason === 'lib');
    const more = all.filter((e) => e.reason === 'sim');
    const parts = [showsFilters()];
    if (shw.err) parts.push(el('p', { class: 'lfx-shw-err', text: shw.err }));
    if (shw.loading) parts.push(loadingNote(shw.recs.length ? 'Atualizando a agenda…' : 'Lendo a agenda do Last.fm nas suas cidades…'));
    const going = upcomingMine().slice(0, 6);
    if (going.length && shw.filt.period === 'all' && !shw.filt.city) parts.push(el('div', { class: 'lfx-shw-spot lfx-shw-yours' }, el('h2', { class: 'lfx-shw-sec' }, el('span', { html: ICON.check, 'aria-hidden': 'true' }), 'Na sua agenda'), el('div', { class: 'lfx-shw-strip' }, ...going.map((e, i) => stagger(spotCard(e, true), i)))));
    if (!all.length && !shw.loading) parts.push(socialEmpty(`Nenhum show de artistas que você ouve (nem de parecidos) na agenda do Last.fm ${shw.filt.period === 'all' ? 'nas suas cidades' : 'nesse período'}. Veja tudo o que tem em "Nas suas cidades".`, 'Ver a agenda das cidades', () => setShowsTab('cidades')));
    if (mine.length) {
      const top = [...mine].filter((e) => e.rank != null && e.rank < 40).sort((a, b) => a.rank - b.rank).slice(0, 8).sort((a, b) => a.date - b.date);
      if (top.length) parts.push(el('div', { class: 'lfx-shw-spot' }, el('h2', { class: 'lfx-shw-sec' }, el('span', { html: ICON.heart, 'aria-hidden': 'true' }), 'Imperdíveis: os que você mais ouve'), el('div', { class: 'lfx-shw-strip' }, ...top.map((e, i) => stagger(spotCard(e), i)))));
      parts.push(el('h2', { class: 'lfx-shw-sec' }, 'Artistas que você ouve', el('span', { class: 'lfx-shw-sec-n', text: ` · ${mine.length} ${mine.length === 1 ? 'show' : 'shows'}` })), showsTimeline(mine, { rec: true }));
    }
    if (more.length) parts.push(el('h2', { class: 'lfx-shw-sec' }, 'Pode curtir', el('span', { class: 'lfx-shw-sec-n', text: ' · parecidos com o seu gosto' })), showsTimeline(more, { rec: true }));
    if (shw.pool && shw.pool.length && all.length) parts.push(el('button', { class: 'lfx-chip lfx-shw-seeall', type: 'button', onclick: () => setShowsTab('cidades') }, el('span', { html: ICON.calendar }), `Ver todos os ${shw.pool.length} shows da agenda nas suas cidades`));
    body.replaceChildren(...parts);
    setTimeout(markShowsSeen, 2500);
  }
  const loadingNote = (t) => el('div', { class: 'lfx-shw-loading' }, el('span', { class: 'lfx-shw-spin', 'aria-hidden': 'true' }), t);
  const showsSkel = () => el('div', { class: 'lfx-shw-grid' }, ...Array.from({ length: 6 }, () => el('div', { class: 'lfx-shw-card lfx-skel' })));
  function upcomingMine() {
    const today = startOfDay(Date.now());
    return [...(shw.mine || []), ...localItems()].filter((e) => e.date >= today && (attOf(e) === 'going' || attOf(e) === 'maybe')).sort((a, b) => a.date - b.date);
  }
  function periodOk(e) {
    const p = shw.filt.period, now = Date.now();
    if (p === '7') return e.date <= now + 7 * DAY;
    if (p === '30') return e.date <= now + 30 * DAY;
    if (p === '90') return e.date <= now + 90 * DAY;
    return true;
  }
  function showsFilters(extra) {
    const counts = cityCounts();
    const seg = (items, cur, set) => el('div', { class: 'lfx-shw-seg', role: 'group' }, ...items.map(([k, label]) => el('button', { type: 'button', class: cur === k ? 'on' : '', 'aria-pressed': String(cur === k), onclick: () => { set(k); paintShows(); } }, label)));
    const cityItems = [['', 'Todas as cidades'], ...shw.cities.map((c) => [cityInfo(c).name, `${cityInfo(c).name} (${counts.get(cityInfo(c).name) || 0})`])];
    return el('div', { class: 'lfx-shw-filters' },
      extra || null,
      seg([['all', 'Tudo'], ['7', '7 dias'], ['30', '30 dias'], ['90', '3 meses']], shw.filt.period, (k) => { shw.filt.period = k; }),
      shw.cities.length > 1 ? seg(cityItems, shw.filt.city, (k) => { shw.filt.city = k; }) : null);
  }
  /* Nas suas cidades: a agenda completa do Last.fm, com filtro por texto */
  function renderCityAgenda(body) {
    const prevIn = $('.lfx-shw-qinput', body);
    const hadFocus = !!prevIn && document.activeElement === prevIn;
    const caret = prevIn ? prevIn.selectionStart : null;
    if (shw.pool == null) { body.replaceChildren(loadingNote('Lendo a agenda do Last.fm nas suas cidades…'), showsSkel()); return; }
    const q = normalize(shw.filt.q);
    const list = shw.pool.filter(periodOk).filter((e) => !shw.filt.city || e.cityHit === shw.filt.city)
      .filter((e) => !q || normalize([e.title, e.artist, ...(e.lineup || []), e.venue, e.city].join(' ')).includes(q));
    const input = el('input', { class: 'lfx-shw-qinput', type: 'search', placeholder: 'Filtrar por artista, festival ou local…', value: shw.filt.q, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Filtrar a agenda' });
    input.addEventListener('input', () => { shw.filt.q = input.value; clearTimeout(shw.find.deb); shw.find.deb = setTimeout(paintShows, 160); });
    const parts = [showsFilters(el('div', { class: 'lfx-shw-q' }, el('span', { html: ICON.search, 'aria-hidden': 'true' }), input))];
    if (shw.err) parts.push(el('p', { class: 'lfx-shw-err', text: shw.err }));
    if (shw.loading) parts.push(loadingNote('Atualizando a agenda…'));
    const yours = list.filter((e) => e.reason === 'lib').length;
    parts.push(el('h2', { class: 'lfx-shw-sec' }, 'Agenda do Last.fm', el('span', { class: 'lfx-shw-sec-n', text: ` · ${list.length} ${list.length === 1 ? 'show' : 'shows'}${yours ? ` · ${yours} de artistas que você ouve` : ''}` })));
    if (!list.length && !shw.loading) parts.push(socialEmpty(q ? 'Nada com esse nome na agenda. Tente outro termo ou a aba "Buscar artista".' : 'A agenda do Last.fm está vazia para essas cidades e período. Tente um raio maior.'));
    else parts.push(showsTimeline(list, { rec: true, compact: true }));
    body.replaceChildren(...parts);
    if (hadFocus) { const i2 = $('.lfx-shw-qinput', body); i2?.focus(); try { i2?.setSelectionRange(caret ?? i2.value.length, caret ?? i2.value.length); } catch (_) { /* ignora */ } }
  }
  /* Linha do tempo: um bloco por mês, e dentro dele um bloco por dia com os shows em grade */
  function showsTimeline(events, opts = {}) {
    const wrap = el('div', { class: 'lfx-shw-timeline' });
    let curMonth = null, curDay = null, grid = null, i = 0;
    const desc = !!opts.desc;
    const perMonth = new Map();
    for (const e of events) perMonth.set(monthKey(e.date), (perMonth.get(monthKey(e.date)) || 0) + 1);
    for (const ev of events) {
      const mk = monthKey(ev.date);
      if (mk !== curMonth) {
        curMonth = mk; curDay = null;
        const d = new Date(ev.date);
        const n = perMonth.get(mk);
        const ml = MESES_L[d.getMonth()];
        wrap.append(el('h3', { class: 'lfx-shw-monthhead' }, `${ml.charAt(0).toUpperCase()}${ml.slice(1)} de ${d.getFullYear()}`, el('span', { text: ` · ${n} ${n === 1 ? 'show' : 'shows'}` })));
      }
      const dk = dayKey(ev.date);
      if (dk !== curDay) {
        curDay = dk;
        const d = new Date(ev.date);
        const rel = desc ? '' : relDay(ev.date);
        const day = el('div', { class: `lfx-shw-day${rel === 'Hoje' ? ' today' : ''}` },
          el('div', { class: 'lfx-shw-dayhead' }, el('b', { text: String(d.getDate()) }), el('span', { class: 'lfx-shw-dow', text: DIAS[d.getDay()] }), rel ? el('em', { text: rel }) : null));
        grid = el('div', { class: 'lfx-shw-grid' });
        day.append(grid);
        wrap.append(day);
      }
      grid.append(stagger(showCard(ev, opts), i++));
    }
    return wrap;
  }
  function artBox(ev, cls) {
    const img = ev.img || (shw.pool && shw.pool.find((x) => x.id === ev.id && x.img)?.img) || shw.imgs.get(normalize(ev.match || ev.artist || ''));
    const box = el('div', { class: cls });
    if (img) { const im = el('img', { src: imgSize(img, '300x300'), alt: '', loading: 'lazy' }); im.addEventListener('error', () => { im.remove(); box.classList.add('noimg'); }); box.append(im); }
    else box.classList.add('noimg');
    box.append(el('span', { class: 'lfx-shw-initial', text: (ev.artist || ev.title || '?')[0].toUpperCase(), 'aria-hidden': 'true' }));
    return box;
  }
  function reasonChip(ev) {
    if (ev.reason === 'lib') return el('span', { class: `lfx-shw-reason lib${ev.rank != null && ev.rank < 10 ? ' top' : ''}`, title: 'Um artista que você ouve' }, el('span', { html: ICON.heart, 'aria-hidden': 'true' }),
      `${ev.match && normalize(ev.match) !== normalize(ev.artist) ? `${ev.match} · ` : ''}${ev.rank != null && ev.rank < 10 ? `Top ${ev.rank + 1} seu` : ev.plays ? `${fmtN(ev.plays)} plays seus` : 'Você ouve'}`);
    if (ev.reason === 'sim') return el('span', { class: 'lfx-shw-reason sim', title: 'Parecido com um artista que você ouve' }, `${ev.match && normalize(ev.match) !== normalize(ev.artist) ? `${ev.match}: ` : ''}parecido com ${ev.via || 'o que você ouve'}`);
    return null;
  }
  function showCard(ev, opts = {}) {
    const pref = preferred();
    const st = attOf(ev);
    const past = isPast(ev);
    const busy = shw.busy.has(ev.id);
    const where = [ev.venue, ev.city].filter(Boolean).join(' · ') || 'Local a confirmar';
    const when = fmtTime(ev.date);
    const rsvpBtn = (status, label, title) => el('button', { class: `lfx-shw-rsvp ${status}${st === status || (status === 'maybe' && st === 'interested') ? ' on' : ''}`, type: 'button', title, disabled: busy || null, 'aria-pressed': String(st === status), onclick: () => setAttendance(ev, status) }, label);
    const sub = ev.title && normalize(ev.title) !== normalize(ev.artist) ? ev.title : '';
    const STB = { going: 'Vou', maybe: 'Talvez', went: 'Fui', interested: 'Interesse' };
    return el('article', { class: `lfx-shw-card${st ? ' lfx-shw-' + (st === 'interested' ? 'maybe' : st) : ''}${ev.isNew ? ' is-new' : ''}${busy ? ' is-busy' : ''}`, 'data-id': ev.id },
      el('div', { class: 'lfx-shw-cover' }, artBox(ev, 'lfx-shw-art'),
        el('div', { class: 'lfx-shw-datechip' }, el('b', { text: String(new Date(ev.date).getDate()) }), el('span', { text: MESES[new Date(ev.date).getMonth()] })),
        ev.isNew ? el('span', { class: 'lfx-shw-new', text: 'Novo' }) : null,
        ev.kind === 'festival' ? el('span', { class: 'lfx-shw-fest', text: 'Festival' }) : null,
        st ? el('span', { class: `lfx-shw-stbadge ${st === 'interested' ? 'maybe' : st}`, text: STB[st] }) : null),
      el('div', { class: 'lfx-shw-info' },
        el('a', { class: 'lfx-shw-artist', href: `${langPrefix()}/music/${encName(ev.artist)}`, 'data-go': '', text: ev.artist }),
        sub ? el('div', { class: 'lfx-shw-title', text: sub }) : null,
        ev.lineup && ev.lineup.length ? el('div', { class: 'lfx-shw-lineup', text: `com ${ev.lineup.slice(0, 4).join(', ')}${ev.lineup.length > 4 ? ` e +${ev.lineup.length - 4}` : ''}` }) : null,
        el('div', { class: 'lfx-shw-venue' }, el('span', { html: ICON.pin, 'aria-hidden': 'true' }), where),
        el('div', { class: 'lfx-shw-meta' }, el('span', { text: fmtDay(ev.date) + (when ? ` · ${when}` : '') + (past ? ` · ${new Date(ev.date).getFullYear()}` : '') }),
          ev.cityHit && normalize(ev.cityHit) !== normalize(String(ev.city || '').split(',')[0]) ? el('span', { class: 'lfx-shw-near', text: `perto de ${ev.cityHit}` }) : null,
          ev.crowd ? el('span', { class: 'lfx-shw-crowd', text: ev.crowd }) : null),
        ev.friends && ev.friends.length ? el('div', { class: 'lfx-shw-friends', title: ev.friends.map((f) => f.name).join(', ') },
          ...ev.friends.slice(0, 4).map((f) => f.img ? el('img', { src: f.img, alt: '', loading: 'lazy' }) : el('i', { text: f.name[0] || '?' })),
          el('span', { text: `${ev.friends.length === 1 ? ev.friends[0].name : `${ev.friends.length} pessoas que você segue`} ${past ? (ev.friends.length === 1 ? 'foi' : 'foram') : (ev.friends.length === 1 ? 'vai' : 'vão')}` })) : null,
        opts.rec ? reasonChip(ev) : null,
        ev.local ? el('span', { class: 'lfx-shw-reason local', title: 'Marcado na versão anterior, só neste computador' }, 'Só no app') : null,
        el('div', { class: 'lfx-shw-actions' },
          el('div', { class: 'lfx-shw-rsvps', role: 'group', 'aria-label': 'Sua presença no Last.fm' }, ...(past
            ? [rsvpBtn('went', 'Fui', 'Marca no Last.fm que você foi')]
            : [rsvpBtn('going', 'Vou', 'Marca "I\'m going" no Last.fm'), rsvpBtn('maybe', 'Talvez', 'Marca "I\'m interested" no Last.fm')])),
          el('div', { class: 'lfx-shw-links' },
            ev.url ? el('a', { class: 'lfx-sh-btn sm', href: ev.url, 'data-go': '', title: 'Página do evento no Last.fm (ingressos, local, quem vai)' }, el('span', { html: ICON.ticket }), 'Evento') : null,
            el('a', { class: 'lfx-sh-btn ghost sm', href: serviceUrl(pref, ev.artist, { kind: 'artist', artist: ev.artist, title: '' }), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${SERVICES[pref][0]}` }, 'Ouvir')))));
  }
  function spotCard(ev, yours) {
    const st = attOf(ev);
    return el('button', { class: `lfx-shw-spotcard${yours ? ` yours ${st}` : ''}`, type: 'button', title: `${ev.artist} — ${fmtDay(ev.date)}`, onclick: () => {
      const target = $(`.lfx-shw-card[data-id="${CSS.escape(ev.id)}"]`, shw.node);
      if (!target && yours) { setShowsTab('agenda'); return; }
      target?.scrollIntoView({ block: 'center', behavior: S.animations && !reducedMotion.matches ? 'smooth' : 'auto' });
      target?.classList.add('flash'); setTimeout(() => target?.classList.remove('flash'), 1400);
    } },
    artBox(ev, 'lfx-shw-spotart'),
    el('span', { class: 'lfx-shw-spotname', text: yours ? ev.artist : (ev.match || ev.artist) }),
    el('span', { class: 'lfx-shw-spotwhen', text: `${yours ? (st === 'going' ? 'Vou · ' : 'Talvez · ') : ''}${relDay(ev.date) || fmtDay(ev.date)} · ${ev.cityHit || String(ev.city || '').split(',')[0]}` }));
  }

  /* ---------------- Buscar: a agenda de um artista no Last.fm ---------------- */
  function renderFind(body) {
    const f = shw.find;
    const prevIn = $('.lfx-shw-findinput', body);
    const typed = prevIn ? prevIn.value : null;
    const hadFocus = !!prevIn && document.activeElement === prevIn;
    const input = el('input', { class: 'lfx-dop-input lfx-shw-findinput', type: 'text', placeholder: 'Busque um artista para ver a agenda dele no Last.fm…', spellcheck: 'false', autocomplete: 'off', role: 'combobox', 'aria-expanded': 'false', value: typed != null ? typed : (f.seed ? f.seed.name : '') });
    f.input = input;
    input.addEventListener('input', () => { clearTimeout(f.deb); const q = input.value.trim(); if (q.length < 2) { f.sug = []; hideFindSug(); return; } f.deb = setTimeout(() => findSearch(q), 220); });
    input.addEventListener('keydown', (e) => {
      if (!f.sug.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); f.active = (f.active + 1) % f.sug.length; paintFindSug(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); f.active = (f.active - 1 + f.sug.length) % f.sug.length; paintFindSug(); }
      else if (e.key === 'Enter') { e.preventDefault(); pickFind(f.sug[f.active >= 0 ? f.active : 0]); }
      else if (e.key === 'Escape') hideFindSug();
    });
    input.addEventListener('blur', () => setTimeout(hideFindSug, 150));
    const seg = (items, cur, set) => el('div', { class: 'lfx-shw-seg', role: 'group' }, ...items.map(([k, label]) => el('button', { type: 'button', class: cur === k ? 'on' : '', 'aria-pressed': String(cur === k), onclick: () => { set(k); } }, label)));
    const controls = el('div', { class: 'lfx-shw-filters' },
      seg([['upcoming', 'Próximos'], ['past', 'Já aconteceram']], f.when, (k) => { if (f.when === k) return; f.when = k; if (f.seed) runFind(); else paintShows(); }),
      shw.cities.length ? seg([[false, 'Em todo lugar'], [true, 'Só nas minhas cidades']], f.mine, (k) => { f.mine = k; paintShows(); }) : null);
    const parts = [el('div', { class: 'lfx-dop-search lfx-shw-find' }, el('span', { class: 'lfx-dop-search-ic', html: ICON.search, 'aria-hidden': 'true' }), input), controls];
    if (f.loading) parts.push(loadingNote(`Abrindo a agenda de ${f.seed ? f.seed.name : 'o artista'} no Last.fm…`), showsSkel());
    else if (f.events) {
      let list = f.events;
      if (f.mine && shw.cities.length) list = list.filter((e) => cityOfEvent(e));
      parts.push(el('h2', { class: 'lfx-shw-sec' }, `${f.seed ? f.seed.name : ''}: ${f.when === 'past' ? 'shows que já aconteceram' : 'próximos shows'}`, el('span', { class: 'lfx-shw-sec-n', text: ` · ${list.length}` }),
        f.seed ? el('a', { class: 'lfx-shw-seclink', href: `${f.seed.path}/+events`, 'data-go': '', text: 'Abrir no Last.fm' }) : null));
      if (!list.length) parts.push(socialEmpty(f.mine && shw.cities.length && f.events.length ? 'Nenhum show nas suas cidades. Tente "Em todo lugar".' : f.when === 'past' ? 'O Last.fm não tem shows passados deste artista.' : 'Este artista não tem shows anunciados no Last.fm agora.'));
      else parts.push(showsTimeline(list, { desc: f.when === 'past' }));
      if (f.when === 'past' && list.length) parts.push(el('p', { class: 'lfx-sh-hint', text: 'Marque "Fui" nos shows que você foi — o Last.fm guarda no seu histórico e eles entram no mapa da sua agenda.' }));
    } else parts.push(socialEmpty('Digite o nome de um artista para ver a agenda dele no Last.fm — os próximos shows ou os que já aconteceram, para marcar os que você foi.'));
    body.replaceChildren(...parts);
    if (hadFocus) { input.focus(); try { input.setSelectionRange(input.value.length, input.value.length); } catch (_) { /* ignora */ } }
  }
  async function findSearch(q) {
    const f = shw.find;
    f.ctrl?.abort(); f.ctrl = new AbortController(); const signal = f.ctrl.signal;
    try {
      let list = [];
      try { const r = await searchLastfm(q, 'all', signal); list = (r && r.artists) || []; } catch (e) { if (e.name === 'AbortError') return; }
      if (!list.length) { const r2 = await searchLastfm(q, 'artists', signal); list = (r2 && r2.artists) || []; }
      if (signal.aborted) return;
      f.sug = list.slice(0, 7); f.active = f.sug.length ? 0 : -1;
      paintFindSug();
    } catch (e) { if (e.name !== 'AbortError') { f.sug = []; hideFindSug(); } }
  }
  function paintFindSug() {
    const f = shw.find;
    if (!f.sug.length || !f.input || !f.input.isConnected) { hideFindSug(); return; }
    if (!f.box) f.box = el('div', { class: 'lfx-dop-sug lfx-menu', role: 'listbox', hidden: true });
    f.box.replaceChildren(...f.sug.map((a, i) => el('button', { class: `lfx-dop-sugitem${i === f.active ? ' on' : ''}`, type: 'button', role: 'option', 'aria-selected': String(i === f.active), onmousedown: (e) => { e.preventDefault(); pickFind(a); } },
      el('span', { class: 'lfx-dop-sugav' }, a.img ? el('img', { src: imgSize(a.img, '64s'), alt: '', loading: 'lazy' }) : el('span', { class: 'lfx-sh-av-ph', html: ICON.mic })),
      el('span', { class: 'lfx-dop-sugtxt' }, el('b', { text: a.title }), a.sub ? el('span', { class: 'lfx-dop-sugsub', text: a.sub }) : null))));
    f.box.hidden = false;
    if (!f.float || !f.box.isConnected) { f.float?.(); f.float = floatMenu(f.box, f.input, 'left'); } else placeMenu(f.box, f.input, 'left');
    f.input.setAttribute('aria-expanded', 'true');
  }
  function hideFindSug() { const f = shw.find; if (f.box) f.box.hidden = true; f.input?.setAttribute('aria-expanded', 'false'); }
  function pickFind(a) {
    if (!a) return;
    const f = shw.find;
    f.seed = { name: a.title, path: a.path || `/music/${encName(a.title)}`, img: a.img };
    if (f.input) f.input.value = a.title;
    if (a.img) shw.imgs.set(normalize(a.title), a.img);
    f.sug = []; hideFindSug();
    runFind();
  }
  async function runFind() {
    const f = shw.find;
    if (!f.seed) return;
    f.ctrl?.abort(); f.ctrl = new AbortController(); const signal = f.ctrl.signal;
    f.loading = true; f.events = null; paintShows();
    const path = stripLang(f.seed.path).replace(/\/+$/, '');
    let evs = [];
    try {
      const doc = await getDoc(`${path}/+events`, { signal, priority: true });
      if (f.when === 'upcoming') evs = parseEventRows(doc).filter((e) => !isPast(e));
      else {
        const now = new Date().getFullYear();
        const years = [...new Set($$('a[href]', doc).map((a) => +((a.getAttribute('href') || '').match(/\/\+events\/(\d{4})\/?$/) || [])[1]).filter((y) => y >= 1950 && y <= now))].sort((a, b) => b - a).slice(0, 6);
        const lists = await Promise.all(years.map((y) => eventPages(`${path}/+events/${y}`, 3, signal).catch(() => [])));
        evs = lists.flat().filter(isPast).sort((a, b) => b.date - a.date);
      }
    } catch (e) { if (e.name === 'AbortError') return; }
    const seen = new Set();
    f.events = evs.filter((e) => (seen.has(e.id) ? false : seen.add(e.id))).map((e) => ({ ...e, img: e.img || f.seed.img }));
    f.loading = false;
    if (shw.node && shw.tab === 'buscar') paintShows();
  }

  /* ---------------- Minha agenda: mapa + listas (da sua conta do Last.fm) ---------------- */
  function renderAgenda(body) {
    if (shw.mine == null) { destroyShowsMap(); body.replaceChildren(loadingNote('Lendo a sua agenda no Last.fm…'), showsSkel()); return; }
    const items = [...shw.mine.map((e) => ({ ...e, att: attOf(e) })), ...localItems()].filter((e) => e.att);
    // o que você marcou agora mesmo e ainda não estava na lista
    for (const [id, a] of shw.att) {
      if (!a || items.some((x) => x.id === id)) continue;
      const ev = [...(shw.pool || []), ...(shw.find.events || [])].find((x) => x.id === id);
      if (ev) items.push({ ...ev, att: a });
    }
    if (!items.length) {
      destroyShowsMap();
      body.replaceChildren(...[socialEmpty('Sua agenda no Last.fm está vazia. Use Vou / Talvez nos shows de "Para você" ou "Nas suas cidades", e Fui nos que já aconteceram (em "Buscar artista" → Já aconteceram).'), mineLoadingNote()].filter(Boolean));
      return;
    }
    const today = startOfDay(Date.now());
    const upcoming = items.filter((e) => e.date >= today && (e.att === 'going' || e.att === 'maybe')).sort((a, b) => a.date - b.date);
    const past = items.filter((e) => e.att === 'went').sort((a, b) => b.date - a.date);
    const going = upcoming.filter((e) => e.att === 'going').length;
    const maybe = upcoming.filter((e) => e.att === 'maybe').length;
    const thisYear = past.filter((e) => new Date(e.date).getFullYear() === new Date().getFullYear()).length;
    const cities = new Set([...upcoming, ...past].map((e) => normalize(String(e.city || '').split(',')[0])).filter(Boolean)).size;
    const stat = (n, label, cls) => el('div', { class: `lfx-shw-stat ${cls || ''}` }, el('b', { text: String(n) }), el('span', { text: label }));
    const mapItems = [...upcoming, ...past].map((e) => ({ ...e, status: e.att }));
    const parts = [
      el('div', { class: 'lfx-shw-stats' }, stat(going, going === 1 ? 'confirmado' : 'confirmados', 'going'), stat(maybe, 'talvez', 'maybe'), stat(past.length, past.length === 1 ? 'show que fui' : 'shows que fui', 'went'), stat(thisYear, `em ${new Date().getFullYear()}`), stat(cities, cities === 1 ? 'cidade' : 'cidades')),
      mineLoadingNote(),
      buildAgendaMap(mapItems),
    ];
    if (upcoming.length) parts.push(el('h2', { class: 'lfx-shw-sec' }, 'Próximos', el('span', { class: 'lfx-shw-sec-n', text: ` · ${upcoming.length}` }), el('a', { class: 'lfx-shw-seclink', href: `/user/${encName(me.name)}/events`, 'data-go': '', text: 'Ver no Last.fm' })), showsTimeline(upcoming, {}));
    if (past.length) parts.push(el('h2', { class: 'lfx-shw-sec' }, 'Já fui', el('span', { class: 'lfx-shw-sec-n', text: ` · ${past.length}` })), showsTimeline(past, { desc: true }));
    body.replaceChildren(...parts.filter(Boolean));
  }
  const mineLoadingNote = () => (shw.mineLoading ? loadingNote('Atualizando a sua agenda no Last.fm…') : null);

  /* Coordenadas: o Last.fm só dá o nome e a cidade do local; o OpenStreetMap acha o ponto (uma vez por local) */
  const venueQuery = (e) => [e.venue, String(e.city || '').split(',')[0], e.country].filter(Boolean).join(', ');
  const cityQuery = (e) => [e.city, e.country].filter(Boolean).join(', ');
  function pointOf(e) {
    if (e.lat != null && e.lon != null && !isNaN(e.lat) && !isNaN(e.lon)) return { lat: e.lat, lon: e.lon, exact: true };
    const g = shw.geo || {};
    const v = g[geoNorm(venueQuery(e))];
    if (v) return { lat: v.lat, lon: v.lon, exact: true };
    const ci = cityInfo(e.city || '');
    if (ci.lat != null) return { lat: ci.lat, lon: ci.lon, exact: false };
    const c = g[geoNorm(cityQuery(e))];
    return c ? { lat: c.lat, lon: c.lon, exact: false } : null;
  }
  const geoNorm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  async function locateVenues(items) {
    if (shw.geoBusy) return;
    const g = shw.geo || {};
    const qs = [];
    for (const e of items) {
      if (e.lat != null) continue;
      const vq = venueQuery(e);
      if (e.venue && !(geoNorm(vq) in g)) qs.push(vq);
      else if (!(geoNorm(vq) in g) || !g[geoNorm(vq)]) { if (cityInfo(e.city || '').lat == null && !(geoNorm(cityQuery(e)) in g)) qs.push(cityQuery(e)); }
    }
    const want = [...new Set(qs)].slice(0, 25);
    if (!want.length) return;
    shw.geoBusy = true;
    try {
      const r = await ext.send({ type: 'lfx:geocode', queries: want });
      let hits = 0;
      for (const q of want) { if (r && q in r) { g[geoNorm(q)] = r[q]; if (r[q]) hits++; } }
      // locais que o OpenStreetMap não achou: tenta só a cidade
      const cityQs = [...new Set(items.filter((e) => e.venue && g[geoNorm(venueQuery(e))] === null && cityInfo(e.city || '').lat == null && !(geoNorm(cityQuery(e)) in g)).map(cityQuery))].slice(0, 10);
      if (cityQs.length) { const r2 = await ext.send({ type: 'lfx:geocode', queries: cityQs }); for (const q of cityQs) if (r2 && q in r2) { g[geoNorm(q)] = r2[q]; if (r2[q]) hits++; } }
      shw.geo = g;
      if (hits && shw.node && shw.tab === 'agenda') paintShows();
    } finally { shw.geoBusy = false; }
  }
  const ST_LABEL = { going: 'Vou', maybe: 'Talvez', went: 'Já fui' };
  const ST_COLOR = { going: '#b98cff', maybe: '#f5b63d', went: '#28d17c' };
  function buildAgendaMap(items) {
    const pts = items.map((e) => { const p = pointOf(e); return p ? { ...e, lat: p.lat, lon: p.lon, exact: p.exact } : null; }).filter(Boolean);
    const missing = items.length - pts.filter((p) => p.exact).length;
    if (missing) setTimeout(() => locateVenues(items), 0);
    const wrap = el('div', { class: 'lfx-shw-mapwrap' });
    if (!pts.length) { wrap.append(el('div', { class: 'lfx-shw-map lfx-shw-map-empty', text: 'Localizando os seus shows no mapa…' })); return wrap; }
    const toggles = el('div', { class: 'lfx-shw-maptoggles', role: 'group', 'aria-label': 'Mostrar no mapa' },
      ...['going', 'maybe', 'went'].map((st) => el('button', { type: 'button', class: `lfx-shw-mtoggle ${st} on`, 'aria-pressed': 'true', 'data-st': st }, el('i', { 'aria-hidden': 'true' }), ST_LABEL[st], el('span', { text: ` ${pts.filter((p) => p.status === st).length}` }))));
    const mapEl = el('div', { class: 'lfx-shw-leaflet', role: 'region', 'aria-label': 'Mapa dos seus shows' });
    wrap.append(mapEl, toggles, el('div', { class: 'lfx-shw-maphint', text: missing && shw.geoBusy ? 'Localizando as casas de show no mapa…' : 'Clique no mapa para usar a rodinha do mouse no zoom.' }));
    requestAnimationFrame(() => requestAnimationFrame(() => initShowsMap(mapEl, pts, toggles)));
    return wrap;
  }
  function destroyShowsMap() { try { shw.map?.remove(); } catch (_) { /* já saiu */ } shw.map = null; }
  function initShowsMap(mapEl, pts, toggles) {
    const Lf = globalThis.L;
    if (!mapEl.isConnected) return;
    if (!Lf || !Lf.map) { mapEl.replaceWith(svgShowsMap(pts)); return; }
    destroyShowsMap();
    let map;
    try { map = Lf.map(mapEl, { zoomControl: true, attributionControl: true, worldCopyJump: true, scrollWheelZoom: false, minZoom: 2 }); }
    catch (_) { mapEl.replaceWith(svgShowsMap(pts)); return; }
    shw.map = map;
    try { map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>'); } catch (_) { /* ignora */ }
    // fundo escuro do CARTO; se a página não deixar carregar direto, o serviço da extensão busca o bloco
    const Tiles = Lf.TileLayer.extend({
      createTile(coords, done) {
        const tile = document.createElement('img');
        tile.alt = ''; tile.setAttribute('role', 'presentation');
        const url = this.getTileUrl(coords);
        let viaProxy = false;
        tile.onload = () => done(null, tile);
        tile.onerror = async () => {
          if (viaProxy) { done(new Error('bloco'), tile); return; }
          viaProxy = true;
          const data = await ext.send({ type: 'lfx:tile', url });
          if (data) tile.src = data; else done(new Error('bloco'), tile);
        };
        tile.src = url;
        return tile;
      },
    });
    new Tiles('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19, attribution: '© OpenStreetMap · © CARTO' }).addTo(map);
    const layers = { going: Lf.layerGroup(), maybe: Lf.layerGroup(), went: Lf.layerGroup() };
    const dup = new Map();
    const bounds = [];
    for (const p of pts) {
      const k = `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`;
      const n = dup.get(k) || 0; dup.set(k, n + 1);
      // shows no mesmo lugar ficam lado a lado (não um em cima do outro)
      const ang = n * 2.4, off = n ? 0.0009 * Math.sqrt(n) : 0;
      const ll = [p.lat + Math.sin(ang) * off, p.lon + Math.cos(ang) * off];
      bounds.push(ll);
      const st = p.status in layers ? p.status : 'going';
      const icon = Lf.divIcon({ className: 'lfx-shw-mk', html: `<span class="lfx-shw-mk-dot ${st}${p.date >= Date.now() && st !== 'went' ? ' soon' : ''}"></span>`, iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -12] });
      const pop = el('div', { class: 'lfx-shw-pop-in' },
        el('span', { class: `lfx-shw-pop-st ${st}`, text: ST_LABEL[st] }),
        el('b', { text: p.artist }),
        p.title && normalize(p.title) !== normalize(p.artist) ? el('span', { text: p.title }) : null,
        el('span', { text: `${fmtDay(p.date)}${fmtTime(p.date) ? ` · ${fmtTime(p.date)}` : ''} · ${new Date(p.date).getFullYear()}` }),
        el('span', { text: [p.venue, p.city].filter(Boolean).join(' · ') }),
        p.url ? el('a', { href: p.url, 'data-go': '', text: 'Abrir o evento no Last.fm' }) : el('a', { href: `${langPrefix()}/music/${encName(p.artist)}`, 'data-go': '', text: 'Abrir o artista' }));
      Lf.marker(ll, { icon, title: `${p.artist} — ${p.city || ''}`, riseOnHover: true, keyboard: true }).bindPopup(pop, { className: 'lfx-shw-pop', closeButton: true, maxWidth: 260 }).addTo(layers[st]);
    }
    for (const g of Object.values(layers)) g.addTo(map);
    if (bounds.length === 1) map.setView(bounds[0], 12);
    else map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    // a rodinha só dá zoom depois de clicar no mapa (para não "prender" a rolagem da página)
    map.on('click focus', () => map.scrollWheelZoom.enable());
    mapEl.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
    for (const b of $$('.lfx-shw-mtoggle', toggles)) {
      b.addEventListener('click', () => {
        const st = b.dataset.st; const on = !b.classList.contains('on');
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
        if (on) layers[st].addTo(map); else map.removeLayer(layers[st]);
      });
    }
    setTimeout(() => { try { map.invalidateSize(); } catch (_) { /* saiu */ } }, 120);
  }
  /* Reserva: sem o Leaflet, um mapa estilizado (coordenadas projetadas num plano) */
  function svgShowsMap(pts) {
    const lats = pts.map((p) => p.lat), lons = pts.map((p) => p.lon);
    let minLat = Math.min(...lats), maxLat = Math.max(...lats), minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const padLat = Math.max(0.4, (maxLat - minLat) * 0.18), padLon = Math.max(0.4, (maxLon - minLon) * 0.18);
    minLat -= padLat; maxLat += padLat; minLon -= padLon; maxLon += padLon;
    const W = 820, H = 460;
    const sx = (lon) => ((lon - minLon) / ((maxLon - minLon) || 1)) * W;
    const sy = (lat) => (1 - (lat - minLat) / ((maxLat - minLat) || 1)) * H;
    const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let grid = '';
    for (let i = 1; i < 8; i++) { const x = (W / 8) * i; grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`; }
    for (let i = 1; i < 5; i++) { const y = (H / 5) * i; grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`; }
    let pins = '';
    pts.forEach((p) => { const x = sx(p.lon).toFixed(1), y = sy(p.lat).toFixed(1); const c = ST_COLOR[p.status] || ST_COLOR.going; pins += `<g class="lfx-shw-pin" transform="translate(${x},${y})"><circle r="16" fill="${c}" opacity="0.18"/><circle r="6" fill="${c}"/><title>${esc(p.artist)} — ${esc(p.city)} (${esc(ST_LABEL[p.status] || '')})</title></g>`; });
    const svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa dos shows marcados"><rect x="0" y="0" width="${W}" height="${H}" fill="#101015"/><g class="lfx-shw-grid">${grid}</g>${pins}</svg>`;
    return el('div', { class: 'lfx-shw-map', html: svg });
  }

  function buildCatalog() {
    const periods = el('div', { class: 'lfx-seg lfx-cat-periods', role: 'group', 'aria-label': 'Período dos gêneros' }, el('span', { class: 'lfx-seg-thumb', 'aria-hidden': 'true' }));
    for (const [k, label] of PERIODS) periods.append(el('button', { type: 'button', 'data-period': k, 'aria-pressed': 'false', onclick: () => setCatPeriod(k) }, label));
    const laterSeg = el('div', { class: 'lfx-seg lfx-later-filter', role: 'group', 'aria-label': 'Tipo' }, el('span', { class: 'lfx-seg-thumb', 'aria-hidden': 'true' }));
    for (const [k, label] of [['all', 'Tudo'], ['track', 'Faixas'], ['album', 'Álbuns'], ['artist', 'Artistas']]) {
      laterSeg.append(el('button', { type: 'button', 'data-kind': k, 'aria-pressed': String(k === cat.laterFilter), onclick: () => { cat.laterFilter = k; for (const b of $$('button', laterSeg)) b.setAttribute('aria-pressed', String(b.dataset.kind === k)); moveThumb(laterSeg); paintLater(); } }, label));
    }
    return el('section', { class: 'container lfx-catalog lfx-layer', 'aria-label': 'Catálogo' },
      el('div', { class: 'lfx-cat-head' },
        el('div', {}, el('h1', { text: 'Catálogo' }), el('p', { text: 'Os gêneros que você mais ouve, o que você guardou para depois e descobertas dentro de cada gênero.' })),
        periods),
      el('div', { class: 'lfx-cat-grid' },
        el('section', { class: 'lfx-cat-panel lfx-cat-genres' },
          el('div', { class: 'lfx-cat-panel-head' }, el('h2', { text: 'Seus gêneros' }), el('span', { class: 'lfx-cat-note' })),
          el('ol', { class: 'lfx-genres' }),
          el('button', { class: 'lfx-chip lfx-cat-more', type: 'button', hidden: true, onclick: () => { cat.showAll = !cat.showAll; paintGenres(); } })),
        el('section', { class: 'lfx-cat-panel lfx-cat-later' },
          el('div', { class: 'lfx-cat-panel-head' }, el('h2', { text: 'Ouvir depois' }), el('span', { class: 'lfx-cat-note' })),
          laterSeg,
          el('div', { class: 'lfx-later-list' }))),
      el('section', { class: 'lfx-cat-panel lfx-cat-recs' },
        el('div', { class: 'lfx-cat-panel-head' },
          el('h2', {}, 'Descobertas em ', el('span', { class: 'lfx-cat-genre-name', text: '…' })),
          el('a', { class: 'lfx-cat-taglink', href: '#' }, 'Ver a tag no Last.fm ', el('span', { html: ICON.arrow }))),
        el('p', { class: 'lfx-cat-sub', text: 'Destaques do gênero que ainda não aparecem entre os artistas que você mais ouve.' }),
        el('div', { class: 'lfx-recs' })));
  }
  async function loadCatalog() {
    cat.period = cat.period || (await ext.getLocal('lfx:cat:period', 'LAST_365_DAYS'));
    if (!PERIODS.some(([k]) => k === cat.period)) cat.period = 'LAST_365_DAYS';
    paintPeriods();
    loadGenres();
    loadLater();
  }
  function paintPeriods() {
    const seg = cat.node && $('.lfx-cat-periods', cat.node);
    if (!seg) return;
    for (const b of $$('button', seg)) b.setAttribute('aria-pressed', String(b.dataset.period === cat.period));
    requestAnimationFrame(() => { moveThumb(seg); const ls = $('.lfx-later-filter', cat.node); if (ls) moveThumb(ls); });
  }
  function setCatPeriod(k) {
    if (k === cat.period) return;
    cat.period = k;
    ext.setLocal('lfx:cat:period', k);
    paintPeriods();
    loadGenres();
  }
  /* Perfil de gêneros: tags dos seus 60 artistas mais ouvidos no período,
     pesadas pelos scrobbles. Usado pelo Catálogo e pelo Premium. */
  async function genreProfile(period, { signal, maxAge = 6 * HOUR, onStart, onProgress } = {}) {
    const key = `lfx:genres:${me.name.toLowerCase()}:${period}`;
    const hit = await cacheGet(key, maxAge);
    if (hit) return hit;
    onStart?.();
    const artists = (await libArtists(me.name, period, period === 'LAST_7_DAYS' ? 1 : 2)).slice(0, 60);
    if (signal?.aborted) throw new DOMException('Abortado', 'AbortError');
    if (!artists.length) return { genres: [], artists: 0 };
    const acc = new Map();
    const W = [1, .78, .6, .45, .34, .25];
    let done = 0;
    onProgress?.(acc, 0, artists.length);
    await Promise.all(artists.map(async (a) => {
      let tags = [];
      try { tags = (await musicInfo(a.path, { signal, maxAge: 30 * 24 * HOUR })).tags || []; } catch (_) { /* artista sem página */ }
      if (signal?.aborted) return;
      tags.filter((t) => isGenreTag(t, a.name)).slice(0, 6).forEach((t, i) => {
        const k = genreKey(t);
        const g = acc.get(k) || { key: k, name: t, score: 0, plays: 0, artists: [] };
        g.score += (a.n || 1) * W[i];
        if (i < 3) g.plays += a.n || 0;
        g.artists.push({ name: a.name, path: a.path, img: a.img, w: (a.n || 1) * W[i] });
        acc.set(k, g);
      });
      onProgress?.(acc, ++done, artists.length);
    }));
    if (signal?.aborted) throw new DOMException('Abortado', 'AbortError');
    return cachePut(key, { genres: rankGenres(acc), artists: artists.length });
  }
  async function loadGenres() {
    if (!cat.node) return;
    cat.ctrl?.abort();
    const ctrl = cat.ctrl = new AbortController();
    const node = cat.node;
    const note = $('.lfx-cat-genres .lfx-cat-note', node);
    cat.genres = [];
    paintGenres(true);
    note.textContent = '';
    const period = cat.period;
    const label = PERIODS.find(([k]) => k === period)?.[1] || '';
    const faces = await loaderFaces();
    let L = null, lastPaint = 0, result;
    try {
      result = await genreProfile(period, {
        signal: ctrl.signal,
        // Tela de carregamento sobre o catálogo desfocado enquanto as tags são lidas
        onStart: () => {
          L = showLoader(node, { title: 'Montando o seu catálogo', steps: ['Lendo a sua biblioteca', 'Lendo as tags dos seus artistas', 'Ordenando os gêneros'], faces });
          ctrl.signal.addEventListener('abort', () => L.done());
          L.step(0, `Seus artistas mais ouvidos em ${label.toLowerCase() === 'sempre' ? 'todos os tempos' : label}…`);
        },
        onProgress: (acc, done, total) => {
          if (ctrl.signal.aborted) return;
          if (done === 0) L?.step(1, `Lendo as tags dos seus artistas: 0 de ${total}`);
          L?.progress(done / total, `Lendo as tags dos seus artistas: ${done} de ${total}`);
          if (Date.now() - lastPaint > 500 || done === total) { lastPaint = Date.now(); cat.genres = rankGenres(acc); paintGenres(); }
          if (done === total) L?.step(2, 'Ordenando os gêneros…');
        },
      });
    } catch (_) {
      L?.done();
      if (!ctrl.signal.aborted) $('.lfx-genres', node).replaceChildren(el('li', { class: 'lfx-cat-empty', text: 'Não deu para ler a sua biblioteca agora. Tente de novo em instantes.' }));
      return;
    }
    if (L) setTimeout(() => L.done(), 350);
    if (ctrl.signal.aborted) return;
    if (!result.artists) { $('.lfx-genres', node).replaceChildren(el('li', { class: 'lfx-cat-empty', text: 'Nenhum scrobble neste período.' })); $('.lfx-recs', node).textContent = ''; return; }
    cat.genres = result.genres;
    note.textContent = `${result.artists} artistas analisados`;
    paintGenres();
    const pick = cat.genres.find((g) => g.key === cat.genre) || cat.genres[0];
    if (pick) selectGenre(pick); else $('.lfx-recs', node).replaceChildren(el('p', { class: 'lfx-cat-empty', text: 'Seus artistas ainda não têm tags de gênero no Last.fm.' }));
  }
  function rankGenres(acc) {
    return [...acc.values()].sort((a, b) => b.score - a.score).slice(0, 60).map((g) => ({
      key: g.key, tag: g.name.toLowerCase(), name: cap(g.name), score: g.score, plays: g.plays, count: g.artists.length,
      artists: g.artists.sort((x, y) => y.w - x.w).slice(0, 4).map(({ name, path, img }) => ({ name, path, img })),
    }));
  }
  function paintGenres(loading = false) {
    if (!cat.node) return;
    const list = $('.lfx-genres', cat.node), more = $('.lfx-cat-more', cat.node);
    list.textContent = '';
    if (loading && !cat.genres.length) {
      for (let i = 0; i < 8; i++) list.append(el('li', { class: 'lfx-skel', style: 'height:52px;border-radius:12px' }));
      more.hidden = true;
      return;
    }
    const max = cat.genres[0]?.score || 1;
    const shown = cat.showAll ? cat.genres.slice(0, 40) : cat.genres.slice(0, 12);
    shown.forEach((g, i) => {
      const on = g.key === cat.genre;
      list.append(el('li', { class: 'lfx-genre', style: `--w:${Math.max(3, Math.round((g.score / max) * 100))}%;--d:${Math.min(i, 16) * 35}ms` },
        el('button', { type: 'button', class: 'lfx-genre-btn', 'aria-pressed': String(on), onclick: () => selectGenre(g) },
          el('span', { class: 'lfx-genre-rank', text: String(i + 1) }),
          el('span', { class: 'lfx-genre-main' },
            el('span', { class: 'lfx-genre-name', text: g.name }),
            el('span', { class: 'lfx-genre-meta', text: `${g.count} ${g.count === 1 ? 'artista' : 'artistas'} · ≈ ${fmtN(g.plays)} scrobbles` }),
            el('span', { class: 'lfx-genre-bar' })),
          el('span', { class: 'lfx-genre-faces', 'aria-hidden': 'true' }, ...g.artists.slice(0, 3).map((a) => (a.img ? el('img', { src: imgSize(a.img, '64s'), alt: '', title: a.name, loading: 'lazy' }) : el('span', { class: 'lfx-genre-face', text: a.name.charAt(0) })))))));
    });
    more.hidden = cat.genres.length <= 12;
    more.textContent = cat.showAll ? 'Mostrar menos' : `Mostrar mais ${Math.min(40, cat.genres.length) - 12} gêneros`;
  }
  function selectGenre(g) {
    cat.genre = g.key;
    for (const b of $$('.lfx-genre-btn', cat.node)) b.setAttribute('aria-pressed', String(text($('.lfx-genre-name', b)) === g.name));
    $('.lfx-cat-genre-name', cat.node).textContent = g.name;
    $('.lfx-cat-taglink', cat.node).setAttribute('href', `${langPrefix()}/tag/${encName(g.tag || g.name.toLowerCase())}`);
    loadRecs(g);
  }
  async function knownArtists() {
    const all = await libArtists(me.name, 'ALL', 4, 24 * HOUR).catch(() => []);
    const recent = cat.period ? await libArtists(me.name, cat.period, cat.period === 'LAST_7_DAYS' ? 1 : 2).catch(() => []) : [];
    return new Set([...all, ...recent].map((a) => normalize(a.name)));
  }
  async function genreRecs(g, signal) {
    const key = `lfx:recs:${g.key}`;
    const hit = await cacheGet(key, 6 * HOUR);
    if (hit) return hit;
    const base = `/tag/${encName(g.tag || g.name.toLowerCase())}`;
    const [ar, al, tr] = await Promise.allSettled([getDoc(`${base}/artists`, { signal }), getDoc(`${base}/albums`, { signal }), getDoc(`${base}/tracks`, { signal })]);
    const out = {
      artists: ar.status === 'fulfilled' ? harvestMusic(mainScope(ar.value), ['artist'], 40) : [],
      albums: al.status === 'fulfilled' ? harvestMusic(mainScope(al.value), ['album'], 40) : [],
      tracks: tr.status === 'fulfilled' ? parseTracks(mainScope(tr.value), 40).map((t) => ({ kind: 'track', path: musicTarget(t.path)?.path || t.path, title: t.title, artist: t.artist, img: t.img })) : [],
    };
    if (!out.artists.length && !out.albums.length && !out.tracks.length) throw new Error('vazio');
    return cachePut(key, out);
  }
  async function loadRecs(g) {
    const box = cat.node && $('.lfx-recs', cat.node);
    if (!box) return;
    cat.recsCtrl?.abort();
    const ctrl = cat.recsCtrl = new AbortController();
    box.replaceChildren(el('div', { class: 'lfx-recs-grid' }, ...Array.from({ length: 6 }, () => el('div', { class: 'lfx-skel', style: 'aspect-ratio:1;border-radius:14px' }))));
    const L = lazyLoader($('.lfx-cat-recs', cat.node), { title: `Procurando em ${g.name}`, compact: true, faces: g.artists.map((a) => a.img) });
    let recs, known;
    try { [recs, known] = await Promise.all([genreRecs(g, ctrl.signal), knownArtists()]); }
    catch (e) { L.done(); if (!ctrl.signal.aborted) box.replaceChildren(el('p', { class: 'lfx-cat-empty', text: 'Não deu para carregar as descobertas deste gênero agora.' })); return; }
    L.done();
    if (ctrl.signal.aborted) return;
    const fresh = (x) => !known.has(normalize(x.kind === 'artist' ? x.title : x.artist || ''));
    const artists = recs.artists.filter(fresh).slice(0, 12);
    const albums = [...recs.albums.filter(fresh), ...recs.albums.filter((x) => !fresh(x))].slice(0, 12);
    const tracks = recs.tracks.filter(fresh).slice(0, 8);
    box.textContent = '';
    const card = (x) => {
      const q = x.kind === 'artist' ? x.title : `${x.artist} ${x.title}`;
      const sub = x.kind === 'artist' ? (x.listeners ? `${fmtN(x.listeners)} ouvintes` : 'Artista') : (fresh(x) ? x.artist : `${x.artist} · você já ouve`);
      return el('div', { class: `lfx-rec lfx-rec--${x.kind}` },
        el('a', { class: 'lfx-rec-art', href: x.path }, x.img ? el('img', { src: x.img, alt: '', loading: 'lazy' }) : el('span', { html: x.kind === 'artist' ? ICON.mic : ICON.disc })),
        el('div', { class: 'lfx-rec-actions' },
          el('a', { class: 'lfx-icon-btn', href: serviceUrl(preferred(), q, x), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${SERVICES[preferred()][0]}`, html: ICON.play }),
          laterButton(x)),
        el('a', { class: 'lfx-rec-name', href: x.path, text: x.title }),
        el('div', { class: 'lfx-rec-sub', text: sub }));
    };
    if (artists.length) box.append(el('h3', { class: 'lfx-recs-h', text: 'Artistas para conhecer' }), el('div', { class: 'lfx-recs-grid lfx-recs-artists' }, ...artists.map(card)));
    if (albums.length) box.append(el('h3', { class: 'lfx-recs-h', text: 'Álbuns em destaque' }), el('div', { class: 'lfx-recs-grid' }, ...albums.map(card)));
    if (tracks.length) box.append(el('h3', { class: 'lfx-recs-h', text: 'Faixas para ouvir' }), el('div', { class: 'lfx-recs-tracks' }, ...tracks.map((x) => laterRow({ ...x, src: null }, false))));
    if (!box.childElementCount) box.append(el('p', { class: 'lfx-cat-empty', text: `Você já ouve os principais nomes de ${g.name}. Tente outro gênero da lista.` }));
  }
  function laterRow(x, removable = true) {
    const q = x.kind === 'artist' ? x.title : `${x.artist || ''} ${x.title}`.trim();
    const row = el('div', { class: 'lfx-later-item', 'data-kind': x.kind },
      el('a', { class: `lfx-later-art${x.kind === 'artist' ? ' lfx-round' : ''}`, href: x.path }, x.img ? el('img', { src: imgSize(x.img, '64s'), alt: '', loading: 'lazy' }) : el('span', { html: x.kind === 'artist' ? ICON.mic : x.kind === 'album' ? ICON.disc : ICON.note })),
      el('div', { class: 'lfx-later-text' },
        el('a', { class: 'lfx-later-title', href: x.path, text: x.title }),
        el('div', { class: 'lfx-later-sub' }, x.kind === 'artist' ? 'Artista' : `${KINDS_PT[x.kind]}${x.artist ? ` · ${x.artist}` : ''}`, x.src === 'local' ? el('span', { class: 'lfx-later-local', title: 'Salvo só neste navegador', text: ' · neste navegador' }) : null)),
      el('a', { class: 'lfx-icon-btn', href: serviceUrl(preferred(), q, x), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${SERVICES[preferred()][0]}`, 'aria-label': `Ouvir ${x.title} no ${SERVICES[preferred()][0]}`, html: ICON.play }));
    if (!removable) { row.append(laterButton(x)); return row; }
    row.append(el('button', {
      class: 'lfx-icon-btn', type: 'button', title: 'Tirar da lista', 'aria-label': `Tirar ${x.title} da lista`, html: ICON.close,
      onclick: async () => {
        row.classList.add('lfx-removing');
        await setLater({ ...x, bookmarked: true }, false);
        cat.laterItems = (cat.laterItems || []).filter((y) => y.path !== x.path);
        setTimeout(paintLater, 250);
      },
    }));
    return row;
  }
  async function loadLater() {
    const box = cat.node && $('.lfx-later-list', cat.node);
    if (!box) return;
    box.replaceChildren(...Array.from({ length: 5 }, () => el('div', { class: 'lfx-skel', style: 'height:56px;border-radius:12px;margin:3px 0' })));
    const local = await getLater();
    let remote = null;
    try { remote = harvestMusic(mainScope(await getDoc('/music/+bookmarks', { priority: true })), ['track', 'album', 'artist'], 300); } catch (_) { /* sem marcadores */ }
    const map = new Map();
    for (const x of remote || []) map.set(x.path, { ...x, src: 'lastfm' });
    for (const x of local) {
      const m = map.get(x.path);
      if (m) { m.t = x.t; m.img = m.img || x.img; continue; }
      if (x.src === 'lastfm' && remote?.length) continue; // tirado dos marcadores pelo próprio site
      map.set(x.path, x);
    }
    cat.laterItems = [...map.values()].sort((a, b) => (b.t || 0) - (a.t || 0));
    paintLater();
  }
  function paintLater() {
    const box = cat.node && $('.lfx-later-list', cat.node);
    if (!box) return;
    const items = cat.laterItems || [];
    const list = cat.laterFilter === 'all' ? items : items.filter((x) => x.kind === cat.laterFilter);
    $('.lfx-cat-later .lfx-cat-note', cat.node).textContent = items.length ? `${nf.format(items.length)} ${items.length === 1 ? 'item' : 'itens'}` : '';
    box.textContent = '';
    if (!list.length) {
      box.append(el('div', { class: 'lfx-cat-empty' }, items.length ? 'Nada deste tipo na lista.' : 'Sua lista está vazia. Passe o mouse numa faixa, álbum ou artista e use “Ouvir depois”, ou o marcador das páginas do Last.fm.'));
      return;
    }
    for (const x of list.slice(0, 200)) box.append(laterRow(x));
  }

  /* ================================================================ *
   * Tela de carregamento (Premium e Catálogo): disco girando, capas em
   * órbita, etapas e barra de progresso sobre o conteúdo desfocado
   * ================================================================ */
  async function loaderFaces() {
    for (const key of [`lfx:lib:${me.name.toLowerCase()}:LAST_365_DAYS:2`, `lfx:lib:${me.name.toLowerCase()}:ALL:4`]) {
      const hit = await cacheGet(key, 30 * 24 * HOUR);
      if (hit?.length) return hit.map((a) => a.img).filter(Boolean).slice(0, 6);
    }
    return ((await ext.getLocal('lfx:dash', null))?.top || []).map((a) => a.img).filter(Boolean);
  }
  function showLoader(host, { title, steps = [], faces = [], compact = false, minShow = 650 } = {}) {
    const t0 = performance.now();
    $$(':scope > .lfx-loader', host).forEach((n) => n.remove());
    host.classList.add('lfx-loading-host');
    const stepEls = steps.map((s) => el('li', { class: 'lfx-loader-step' }, el('span', { class: 'lfx-loader-dot', 'aria-hidden': 'true' }), el('span', { text: s })));
    const fill = el('span', { class: 'lfx-loader-fill' });
    const sub = el('div', { class: 'lfx-loader-sub' });
    const pics = faces.filter(Boolean).slice(0, 6);
    const orbit = el('div', { class: 'lfx-loader-orbit', 'aria-hidden': 'true', style: `--n:${Math.max(1, pics.length)}` },
      el('span', { class: 'lfx-loader-ring' }), el('span', { class: 'lfx-loader-ring lfx-loader-ring--2' }),
      el('span', { class: 'lfx-loader-disc' }, el('span', { class: 'lfx-loader-label' })),
      el('span', { class: 'lfx-loader-sat' }, ...pics.map((src, i) => el('span', { class: 'lfx-loader-pos', style: `--i:${i}` }, el('img', { src: imgSize(src, '64s'), alt: '' })))));
    const node = el('div', { class: `lfx-loader lfx-layer${compact ? ' lfx-loader--compact' : ''}`, role: 'status', 'aria-live': 'polite' },
      el('div', { class: 'lfx-loader-card' }, orbit,
        el('div', { class: 'lfx-loader-title' }, el('span', { text: title }), el('span', { class: 'lfx-eq', 'aria-hidden': 'true', html: '<i></i><i></i><i></i>' })),
        stepEls.length && !compact ? el('ol', { class: 'lfx-loader-steps' }, ...stepEls) : null,
        el('div', { class: 'lfx-loader-bar' }, fill), sub));
    host.append(node);
    requestAnimationFrame(() => node.classList.add('lfx-show'));
    let cur = 0, finished = false;
    const paint = (frac) => { const v = steps.length ? (cur + clamp(frac, 0, 1)) / steps.length : clamp(frac, 0, 1); fill.style.width = `${Math.round(clamp(v, 0.04, 1) * 100)}%`; };
    paint(0);
    return {
      node,
      step(i, msg) {
        cur = i;
        stepEls.forEach((s, j) => { s.classList.toggle('lfx-done', j < i); s.classList.toggle('lfx-now', j === i); });
        if (msg != null) sub.textContent = msg;
        paint(0);
      },
      progress(frac, msg) { paint(frac); if (msg != null) sub.textContent = msg; },
      title(t) { $('.lfx-loader-title > span', node).textContent = t; },
      done() {
        if (finished) return;
        finished = true;
        stepEls.forEach((s) => { s.classList.add('lfx-done'); s.classList.remove('lfx-now'); });
        fill.style.width = '100%';
        // Fica um instante mínimo na tela para a animação não piscar
        setTimeout(() => {
          node.classList.remove('lfx-show');
          setTimeout(() => { node.remove(); if (!$(':scope > .lfx-loader', host)) host.classList.remove('lfx-loading-host'); }, 450);
        }, Math.max(0, minShow - (performance.now() - t0)));
      },
    };
  }
  /* Só mostra a tela se a espera passar de um instante (dados em cache não piscam). */
  function lazyLoader(host, opts, delay = 220) {
    let L = null, finished = false;
    const pending = [];
    const timer = setTimeout(() => { if (finished) return; L = showLoader(host, opts); pending.forEach(([m, a]) => L[m](...a)); }, delay);
    const call = (m) => (...a) => { if (L) L[m](...a); else if (m !== 'done') pending.push([m, a]); };
    return { step: call('step'), progress: call('progress'), title: call('title'), done() { finished = true; clearTimeout(timer); L?.done(); } };
  }

  /* ================================================================ *
   * Recomendações Premium: busca por gêneros (tags) de álbuns de
   * bandas que você nunca ouviu, fora das recomendações do Last.fm,
   * da mais compatível com o seu gosto à menos. Quem você segue com
   * afinidade alta entra só se você ligar.
   * ================================================================ */
  const prem = { node: null, minSel: null, ctrl: null, fillCtrl: null, taste: null, friendsData: null, tags: [], auto: false, ran: null, min: 95, friends: false, hidden: new Map(), result: null, undo: null };
  const PREM_MIN = [95, 90, 85, 80];
  const PREM_N = 10;
  const premPct = (raw) => clamp(Math.round(100 * (1 - Math.exp(-2.5 * raw))), 3, 98);
  const sat = (x, k = 1.2) => 1 - Math.exp(-k * Math.max(0, x || 0));
  const abortErr = () => new DOMException('Abortado', 'AbortError');
  const tasteKey = () => `lfx:prem:taste:${me.name.toLowerCase()}`;
  const friendsKey = () => `lfx:prem:friends:${me.name.toLowerCase()}:${prem.min}`;
  /* Bandas que você tirou das recomendações: não voltam (até você mostrar de novo) */
  const hiddenKey = () => `lfx:prem:hidden:${me.name.toLowerCase()}`;
  const PREM_HIDDEN_MAX = 3000;
  async function loadPremHidden() {
    const list = await ext.getLocal(hiddenKey(), []);
    prem.hidden = new Map((Array.isArray(list) ? list : []).filter((x) => x && x.k).map((x) => [x.k, x]));
  }
  function savePremHidden() {
    const list = [...prem.hidden.values()].sort((a, b) => b.t - a.t).slice(0, PREM_HIDDEN_MAX);
    ext.setLocal(hiddenKey(), list);
  }

  async function followingNames(fresh = false) {
    const key = `lfx:following:${me.name.toLowerCase()}`;
    const hit = await cacheGet(key, fresh ? 0 : 24 * HOUR);
    if (hit) return hit;
    const names = [];
    let pages = 1;
    for (let page = 1; page <= Math.min(pages, 12); page++) {
      const doc = await getDoc(`/user/${encName(me.name)}/following${page > 1 ? `?page=${page}` : ''}`);
      for (const a of $$('.user-list-item .user-list-link', doc)) { const n = text(a); if (n && !names.includes(n)) names.push(n); }
      if (page === 1) pages = Math.max(1, ...$$('.pagination-page', doc).map((x) => parseInt(text(x), 10)).filter((n) => !isNaN(n)));
    }
    return cachePut(key, names);
  }
  async function similarOf(path, signal) {
    const key = `lfx:sim:${path}`;
    const hit = await cacheGet(key, 7 * 24 * HOUR);
    if (hit) return hit;
    const doc = await getDoc(`${path}/+similar`, { signal });
    const out = [];
    for (const it of $$('.similar-artists-item-wrap', doc)) {
      const a = $('.similar-artists-item-name a', it);
      const t = musicTarget(a?.getAttribute('href'));
      if (!t || t.kind !== 'artist') continue;
      const img = $('img', it)?.getAttribute('src');
      out.push({ name: text(a), path: t.path, listeners: parseCount(text($('.similar-artists-item-listeners', it))), tags: $$('.tags-list .tag a', it).map(text).filter(Boolean).slice(0, 5), img: isPlaceholder(img) ? null : imgSize(img, '300x300') });
    }
    if (!out.length) for (const x of harvestMusic(mainScope(doc), ['artist'], 20)) out.push({ name: x.title, path: x.path, listeners: x.listeners, tags: [], img: x.img });
    return cachePut(key, out);
  }
  /* Artistas que o próprio Last.fm já recomenda (ficam de fora). */
  async function lastfmRecs(signal, fresh = false) {
    const key = `lfx:lfmrecs:${me.name.toLowerCase()}`;
    const hit = await cacheGet(key, fresh ? 0 : 24 * HOUR);
    if (hit) return hit;
    const names = new Set();
    const urls = ['/music/+recommended/artists', '/music/+recommended/artists?page=2', '/music/+recommended/artists?page=3', '/music/+recommended/albums', '/music/+recommended/albums?page=2', '/music/+recommended'];
    await Promise.all(urls.map(async (u) => {
      try {
        const doc = await getDoc(u, { signal });
        for (const a of $$('[class*="music-recommended"] :is(h3 a, [class*="album-artist"] a, [class*="-artist-name"] a)', doc)) {
          const t = musicTarget(a.getAttribute('href'));
          if (t) names.add(normalize(t.artist));
        }
      } catch (e) { if (e.name === 'AbortError') throw e; }
    }));
    return cachePut(key, [...names]);
  }
  /* Artistas mais marcados numa tag (3 páginas, cerca de 60). */
  async function tagArtists(tag, signal, deep = false) {
    // normal: 3 páginas (cerca de 60 bandas); "deep": mais 5 páginas, para quando faltam recomendações
    const key = deep ? `lfx:tagart8:${genreKey(tag)}` : `lfx:tagart3:${genreKey(tag)}`;
    const hit = await cacheGet(key, 24 * HOUR);
    if (hit) return hit;
    const out = [];
    for (const page of deep ? [4, 5, 6, 7, 8] : [1, 2, 3]) {
      const doc = await getDoc(`/tag/${encName(tag.toLowerCase())}/artists${page > 1 ? `?page=${page}` : ''}`, { signal });
      const items = $$('.big-artist-list-item', doc);
      for (const it of items) {
        const a = $('.big-artist-list-title a', it);
        const t = musicTarget(a?.getAttribute('href'));
        if (!t || t.kind !== 'artist' || out.some((x) => x.path === t.path)) continue;
        const img = $('.big-artist-list-avatar-desktop img', it)?.getAttribute('src') || $('img', it)?.getAttribute('src');
        out.push({ name: text(a), path: t.path, listeners: parseCount(text($('.big-artist-list-listeners', it))), img: isPlaceholder(img) ? null : imgSize(img, '300x300') });
      }
      if (!items.length) {
        if (page === 1) for (const x of harvestMusic(mainScope(doc), ['artist'], 40)) out.push({ name: x.title, path: x.path, listeners: x.listeners, img: x.img });
        break;
      }
    }
    return cachePut(key, out);
  }
  /* Gêneros parecidos com uma tag (a página da tag lista os "similar tags") */
  async function similarTags(tag, signal) {
    const key = `lfx:simtags:${genreKey(tag)}`;
    const hit = await cacheGet(key, 7 * 24 * HOUR);
    if (hit) return hit;
    const doc = await getDoc(`/tag/${encName(tag.toLowerCase())}`, { signal });
    const out = [...new Set($$(':is(.tags-list--similar, .tag-similar-tags, [class*="similar-tags"]) a[href*="/tag/"]', doc).map(text).filter(Boolean))].slice(0, 6);
    return cachePut(key, out);
  }

  /* Seu gosto: pesos dos seus artistas, os parecidos com os 30 principais,
     seu perfil de gêneros e o que o Last.fm já recomenda. */
  async function premTaste(report, signal, fresh = false) {
    const key = tasteKey();
    const hit = fresh ? null : await cacheGet(key, 12 * HOUR);
    if (hit) return hit;
    report('taste', 0, 'Lendo os artistas que você mais ouve…');
    const [all, year] = await Promise.all([libArtists(me.name, 'ALL', 4, fresh ? 0 : 24 * HOUR), libArtists(me.name, 'LAST_365_DAYS', 2, fresh ? 0 : 6 * HOUR)]);
    if (signal.aborted) throw abortErr();
    const weights = new Map();
    const add = (list, f) => {
      const mx = Math.log1p(list[0]?.n || 1);
      for (const a of list) { const k = normalize(a.name); const cur = weights.get(k) || { name: a.name, path: a.path, img: a.img, w: 0 }; cur.w += (f * Math.log1p(a.n)) / mx; weights.set(k, cur); }
    };
    add(all, 0.5); add(year, 0.5);
    const seeds = [...weights.values()].sort((a, b) => b.w - a.w).slice(0, 30);
    report('genres', 0, 'Lendo os gêneros dos seus artistas…');
    const prof = await genreProfile('LAST_365_DAYS', { signal, maxAge: fresh ? 0 : 14 * 24 * HOUR, onProgress: (acc, d, t) => report('genres', d / t, `Gêneros dos seus artistas: ${d} de ${t}`) })
      .catch((e) => { if (e.name === 'AbortError') throw e; return { genres: [] }; });
    const cands = new Map();
    let done = 0;
    report('similar', 0, 'Buscando bandas parecidas com as suas…');
    await Promise.all(seeds.map(async (s) => {
      try {
        (await similarOf(s.path, signal)).forEach((x, i) => {
          const k = normalize(x.name);
          if (weights.has(k)) return;
          const c = cands.get(k) || { name: x.name, path: x.path, img: x.img, listeners: x.listeners, tags: x.tags.slice(), sim: 0, simFrom: [] };
          c.sim += s.w / (1 + 0.12 * i);
          if (!c.simFrom.includes(s.name)) c.simFrom.push(s.name);
          cands.set(k, c);
        });
      } catch (e) { if (e.name === 'AbortError') throw e; }
      report('similar', ++done / seeds.length, `Parecidos com os seus artistas: ${done} de ${seeds.length}`);
    }));
    report('lfm', 0, 'Separando o que o Last.fm já recomenda…');
    const lfm = await lastfmRecs(signal, fresh).catch((e) => { if (e.name === 'AbortError') throw e; return []; });
    const lfmSet = new Set(lfm);
    return cachePut(key, {
      weights: [...weights.entries()].map(([k, v]) => [k, Math.round(v.w * 1000) / 1000]),
      seeds: seeds.map(({ name, path, img }) => ({ name, path, img })),
      cands: [...cands.values()].filter((c) => !lfmSet.has(normalize(c.name))),
      lfm,
      genres: (prof.genres || []).slice(0, 40).map(({ key: k, tag, name, score }) => ({ key: k, tag: tag || name.toLowerCase(), name, score })),
    });
  }
  /* Opcional: o que ouvem as pessoas que você segue com afinidade alta. */
  async function premFriends(report, signal, fresh = false) {
    const key = friendsKey();
    const hit = fresh ? null : await cacheGet(key, 12 * HOUR);
    if (hit) return hit;
    report('friends', 0, 'Medindo a afinidade de quem você segue…');
    const names = await followingNames(fresh).catch(() => []);
    const friends = [];
    let done = 0;
    await Promise.all(names.map(async (n) => {
      try {
        const u = await userInfo(n, { maxAge: fresh ? 0 : 3 * 24 * HOUR });
        const pct = u.compat?.pct;
        if (pct != null && pct >= prem.min) friends.push({ name: n, pct });
      } catch (_) { /* perfil indisponível */ }
      report('friends', (0.5 * ++done) / Math.max(1, names.length), `Afinidade de quem você segue: ${done} de ${names.length}`);
    }));
    if (signal.aborted) throw abortErr();
    friends.sort((a, b) => b.pct - a.pct);
    const known = new Set((prem.taste?.weights || []).map(([k]) => k)), lfm = new Set(prem.taste?.lfm || []);
    const cands = new Map();
    done = 0;
    await Promise.all(friends.map(async (f) => {
      try {
        const lib = await libArtists(f.name, 'LAST_365_DAYS', 1, fresh ? 0 : 24 * HOUR);
        const mx = Math.log1p(lib[0]?.n || 1);
        lib.forEach((x, i) => {
          const k = normalize(x.name);
          if (known.has(k) || lfm.has(k)) return;
          const c = cands.get(k) || { name: x.name, path: x.path, img: x.img, tags: [], friend: 0, friendFrom: [] };
          c.friend += (f.pct / 100) * (Math.log1p(x.n) / mx) / (1 + 0.04 * i);
          if (!c.friendFrom.some((y) => y.name === f.name)) c.friendFrom.push({ name: f.name, pct: f.pct });
          cands.set(k, c);
        });
      } catch (_) { /* biblioteca privada */ }
      report('friends', 0.5 + (0.25 * ++done) / Math.max(1, friends.length), `Bibliotecas de quem tem afinidade: ${done} de ${friends.length}`);
    }));
    // Os gêneros das bandas mais ouvidas por eles, para entrarem nas buscas por tag
    const top = [...cands.values()].sort((a, b) => b.friend - a.friend).slice(0, 40);
    done = 0;
    await Promise.all(top.map(async (c) => {
      try { c.tags = ((await musicInfo(c.path, { signal, maxAge: 7 * 24 * HOUR })).tags || []).slice(0, 6); } catch (e) { if (e.name === 'AbortError') throw e; }
      report('friends', 0.75 + (0.25 * ++done) / top.length, `Gêneros do que eles ouvem: ${done} de ${top.length}`);
    }));
    return cachePut(key, { following: names.length, friends, cands: [...cands.values()].sort((a, b) => b.friend - a.friend).slice(0, 400) });
  }

  /* Busca: candidatos com as tags pedidas (dos parecidos com você, das
     páginas das tags e, se ligado, dos amigos), conferidos um a um.
     Ordem: mais tags da busca primeiro; dentro disso, mais compatível. */
  async function premiumSearch(tags, report, signal, fresh = false, { limit = PREM_N + 12, rounds = 6 } = {}) {
    const taste = prem.taste, fr = prem.friends ? prem.friendsData : null;
    const wUser = new Map(taste.weights);
    const lfm = new Set(taste.lfm);
    const gw = new Map();
    const gTop = taste.genres[0]?.score || 1;
    for (const g of taste.genres) gw.set(g.key, g.score / gTop);
    const pool = new Map();
    const touch = (x, extraTags = []) => {
      const k = normalize(x.name);
      if (wUser.has(k) || lfm.has(k) || prem.hidden.has(k)) return null;
      let c = pool.get(k);
      if (!c) { c = { name: x.name, path: x.path, img: x.img || null, listeners: x.listeners ?? null, tags: [], sim: 0, simFrom: [], rev: 0, revFrom: [], friend: 0, friendFrom: [], tagRank: 999 }; pool.set(k, c); }
      for (const t of [...(x.tags || []), ...extraTags]) if (!c.tags.some((y) => genreKey(y) === genreKey(t))) c.tags.push(t);
      if (!c.img && x.img) c.img = x.img;
      if (c.listeners == null && x.listeners != null) c.listeners = x.listeners;
      return c;
    };
    for (const x of taste.cands) { const c = touch(x); if (c) { c.sim = x.sim; c.simFrom = x.simFrom.slice(); } }
    if (fr) for (const x of fr.cands) { const c = touch(x); if (c) { c.friend = x.friend; c.friendFrom = x.friendFrom.slice(); } }
    const want = tags.map(genreKey);
    if (tags.length) {
      report('tags', 0, `Buscando bandas em ${tags.join(', ')}…`);
      let done = 0;
      await Promise.all(tags.map(async (t) => {
        const list = await tagArtists(t, signal).catch((e) => { if (e.name === 'AbortError') throw e; return []; });
        list.forEach((x, i) => { const c = touch(x, [t]); if (c) c.tagRank = Math.min(c.tagRank, i); });
        report('tags', ++done / tags.length, `Páginas das tags: ${done} de ${tags.length}`);
      }));
    }
    if (signal.aborted) throw abortErr();
    const maxFr = Math.max(0, ...[...pool.values()].map((c) => c.friend));
    const matchOf = (c) => want.filter((k) => c.tags.some((t) => genreKey(t) === k)).length;
    const W = [1, 0.8, 0.62, 0.48, 0.36, 0.27];
    const fitOf = (c) => Math.min(1, [...new Set(c.tags.filter((t) => isGenreTag(t, c.name)).map(genreKey))].slice(0, 6).reduce((s, k, i) => s + (gw.get(k) || 0) * W[i], 0) / 2.2);
    // Compatibilidade: parecida com o que você ouve (nos dois sentidos), gêneros que batem com os seus e, se ligado, amigos
    const compat = (c) => {
      const simN = 1 - (1 - sat(c.sim)) * (1 - sat(c.rev));
      const links = new Set([...c.simFrom, ...c.revFrom]).size + (fr ? c.friendFrom.length : 0);
      const breadth = Math.min(1, links / 5);
      return fr
        ? 0.48 * simN + 0.3 * fitOf(c) + 0.12 * (maxFr ? c.friend / maxFr : 0) + 0.1 * breadth
        : 0.55 * simN + 0.35 * fitOf(c) + 0.1 * breadth;
    };
    const pre = (c) => compat(c) + (c.tagRank < 999 ? 0.06 * (1 - Math.min(c.tagRank, 60) / 60) : 0);
    const out = [];
    const seen = new Set();
    let checked = 0, total = 0;
    // Confere uma lista de candidatas (álbum, se você já ouviu, parecidas) até ter "limit" recomendações
    const checkList = async (list, { fill = false, cap = 400, roundsMax = rounds, goal = limit } = {}) => {
      list = list.filter((c) => !seen.has(normalize(c.name)));
      let idx = 0, round = 0;
      while (idx < list.length && round < roundsMax && out.length < goal && checked < cap) {
        const batch = list.slice(idx, idx + (round ? 18 : 36));
        idx += batch.length; round++;
        total = Math.max(total, checked + batch.length);
        await Promise.all(batch.map(async (c) => {
          seen.add(normalize(c.name));
          try {
            let info = await musicInfo(c.path, { signal, maxAge: fresh ? 0 : 2 * 24 * HOUR });
            if (!info.topAlbums) info = await musicInfo(c.path, { signal, maxAge: 0 });
            c.info = info;
            if ((info.mine || 0) > 0 || !info.topAlbums?.length) return; // já ouvida ou sem álbum
            const sims = await similarOf(c.path, signal).catch((e) => { if (e.name === 'AbortError') throw e; return []; });
            c.rev = 0; c.revFrom = [];
            c.sims = sims;
            sims.forEach((sm, i) => {
              const w = wUser.get(normalize(sm.name));
              if (!w) return;
              c.rev += w / (1 + 0.1 * i);
              if (c.revFrom.length < 3) c.revFrom.push(sm.name);
            });
          } catch (e) { if (e.name === 'AbortError') throw e; }
          report('details', ++checked / Math.max(total, 1), `${checked} de ${total} bandas conferidas`);
        }));
        if (signal.aborted) throw abortErr();
        for (const c of batch) {
          const info = c.info;
          if (!info || (info.mine || 0) > 0 || !info.topAlbums?.length) continue;
          if (info.tags?.length) c.tags = [...new Set([...info.tags, ...c.tags])];
          c.listeners = info.listeners ?? c.listeners;
          const match = matchOf(c);
          if (want.length && !match && !fill) continue;
          if (out.some((y) => y.c === c)) continue;
          out.push({ c, info, match, raw: compat(c), album: info.topAlbums[0], alt: info.topAlbums[1] || null, fill: fill && want.length > 0 && !match });
        }
      }
      return idx < list.length;
    };
    const ranked = (arr) => arr.map((c) => ({ c, m: matchOf(c), p: pre(c) })).sort((a, b) => b.m - a.m || b.p - a.p).map((x) => x.c);
    let all = [...pool.values()];
    let list = ranked(want.length ? all.filter((c) => matchOf(c) > 0) : all);
    let more = await checkList(list);
    // Nunca menos de 10: se faltar, abre a busca aos poucos
    if (want.length && out.length < PREM_N) {
      // 1) mais páginas das tags e as parecidas com as que já entraram
      report('details', 0, 'Poucas bandas nessas tags: buscando mais…');
      await Promise.all(tags.map(async (t) => {
        const extra = await tagArtists(t, signal, true).catch((e) => { if (e.name === 'AbortError') throw e; return []; });
        extra.forEach((x, i) => { const c = touch(x, [t]); if (c) c.tagRank = Math.min(c.tagRank, 60 + i); });
      }));
      for (const y of out.slice(0, 12)) for (const sm of (y.c.sims || []).slice(0, 12)) { const c = touch(sm); if (c && !c.simFrom.includes(y.c.name)) { c.sim += 0.3; c.simFrom.push(y.c.name); } }
      all = [...pool.values()];
      more = await checkList(ranked(all.filter((c) => matchOf(c) > 0)), { cap: 520, goal: PREM_N + 4, roundsMax: Infinity }) || more;
    }
    if (want.length && out.length < PREM_N) {
      // 2) gêneros vizinhos das tags pedidas
      report('details', 0, 'Incluindo gêneros vizinhos…');
      const near = (await Promise.all(tags.map((t) => similarTags(t, signal).catch((e) => { if (e.name === 'AbortError') throw e; return []; })))).flat();
      for (const t of [...new Set(near)].slice(0, 6)) {
        const list2 = await tagArtists(t, signal).catch((e) => { if (e.name === 'AbortError') throw e; return []; });
        list2.forEach((x, i) => { const c = touch(x, []); if (c) { c.tagRank = Math.min(c.tagRank, 80 + i); c.nearTag = c.nearTag || t; } });
      }
      all = [...pool.values()];
      await checkList(ranked(all.filter((c) => c.nearTag)), { fill: true, cap: 640, goal: PREM_N + 2, roundsMax: Infinity });
    }
    if (out.length < PREM_N) {
      // 3) completa com as mais compatíveis com o seu gosto (mesmo sem a tag)
      report('details', 0, 'Completando com as mais compatíveis com você…');
      all = [...pool.values()];
      await checkList(all.map((c) => ({ c, p: pre(c) })).sort((a, b) => b.p - a.p).map((x) => x.c), { fill: true, cap: 800, goal: PREM_N + 2, roundsMax: Infinity });
    }
    report('rank', 0.5, want.length > 1 ? 'Ordenando: mais tags primeiro, depois o seu gosto…' : 'Ordenando pela compatibilidade com o seu gosto…');
    out.sort((a, b) => Number(!!a.fill) - Number(!!b.fill) || b.match - a.match || b.raw - a.raw);
    // devolve também as sobras: entram no lugar das que você tirar
    return { items: out, want, found: out.length, more: !!more || out.length >= limit };
  }

  /* Gêneros do seu perfil (para sugestões e para o gênero da vez). */
  function premGenreList() {
    return (prem.taste?.genres || []).filter((g) => isGenreTag(g.tag)).slice(0, 14);
  }
  function canonicalTag(t) {
    const k = genreKey(t);
    return premGenreList().find((g) => g.key === k)?.tag || (prem.taste?.genres || []).find((g) => g.key === k)?.tag || t;
  }

  function buildPremium() {
    const input = el('input', { class: 'lfx-taginput-field', type: 'text', placeholder: 'Digite um gênero e aperte Enter (dá para juntar vários)', 'aria-label': 'Gêneros para buscar', autocomplete: 'off', spellcheck: 'false' });
    const chips = el('span', { class: 'lfx-taginput-chips' });
    const sugg = el('div', { class: 'lfx-taginput-sugg', role: 'listbox', hidden: true });
    const clear = el('button', { class: 'lfx-chip lfx-prem-clear', type: 'button', hidden: true }, 'Limpar');
    const form = el('form', { class: 'lfx-prem-search', role: 'search' },
      el('label', { class: 'lfx-taginput' }, el('span', { class: 'lfx-taginput-icon', html: ICON.search }), chips, input), sugg,
      el('button', { class: 'lfx-prem-go', type: 'submit' }, 'Buscar'), clear);
    const showSugg = () => {
      const q = normalize(input.value);
      const pool = [...premGenreList(), ...(prem.taste?.genres || [])].map((g) => g.tag);
      const list = [...new Set(pool)].filter((n) => (!q || normalize(n).includes(q)) && !prem.tags.some((t) => genreKey(t) === genreKey(n))).slice(0, 8);
      sugg.textContent = '';
      list.forEach((n) => sugg.append(el('button', { type: 'button', class: 'lfx-taginput-opt', role: 'option', onmousedown: (e) => { e.preventDefault(); addPremTag(n); input.value = ''; showSugg(); } }, n)));
      sugg.hidden = !list.length || document.activeElement !== input;
    };
    input.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) { e.preventDefault(); addPremTag(input.value); input.value = ''; showSugg(); }
      else if (e.key === 'Enter' && !input.value.trim()) { /* deixa o formulário buscar */ }
      else if (e.key === 'Backspace' && !input.value && prem.tags.length) { prem.tags.pop(); prem.auto = false; paintPremTags(); showSugg(); }
      else if (e.key === 'Escape') { sugg.hidden = true; }
    });
    input.addEventListener('input', showSugg);
    input.addEventListener('focus', showSugg);
    input.addEventListener('blur', () => setTimeout(() => { sugg.hidden = true; }, 120));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value.trim()) { addPremTag(input.value); input.value = ''; }
      sugg.hidden = true;
      input.blur();
      runPremium({ tags: prem.tags.slice() });
    });
    clear.addEventListener('click', () => { prem.tags = []; prem.auto = false; paintPremTags(); runPremium({ tags: [] }); });
    // Amigos: opcional, desligado por padrão
    const frBox = el('input', { type: 'checkbox', class: 'lfx-prem-switch', 'aria-label': 'Somar o gosto de quem você segue' });
    const minSel = prem.minSel = lfxSelect({
      options: PREM_MIN.map((v) => ({ value: String(v), label: `≥ ${v}%` })), value: String(prem.min), label: 'Afinidade mínima', cls: 'lfx-prem-min',
      onChange: (v) => {
        prem.min = +v; ext.setLocal('lfx:prem:min', prem.min);
        if (prem.friends) runPremium({ tags: prem.ran ? prem.ran.tags.slice() : prem.tags.slice() });
      },
    });
    minSel.disabled = !prem.friends;
    frBox.addEventListener('change', () => {
      prem.friends = frBox.checked; minSel.disabled = !prem.friends;
      ext.setLocal('lfx:prem:friends', prem.friends);
      runPremium({ tags: prem.ran ? prem.ran.tags.slice() : prem.tags.slice() });
    });
    return el('section', { class: 'container lfx-catalog lfx-premium lfx-layer', 'aria-label': 'Recomendações Premium' },
      el('div', { class: 'lfx-cat-head lfx-prem-head' },
        el('div', {},
          el('div', { class: 'lfx-prem-badge' }, el('span', { html: ICON.spark }), 'Premium'),
          el('h1', { text: 'Recomendações Premium' }),
          el('p', { text: 'Busque por gêneros e receba álbuns de bandas que você nunca ouviu, das mais compatíveis com o seu gosto às menos. Nada aqui está nas recomendações do próprio Last.fm.' })),
        el('div', { class: 'lfx-prem-tools' },
          el('label', { class: 'lfx-prem-frwrap', title: 'Opcional: soma o que ouvem as pessoas que você segue com afinidade alta' }, frBox, el('span', { text: 'Somar amigos com afinidade' }), minSel.node),
          el('button', { class: 'lfx-chip lfx-prem-hiddenbtn', type: 'button', html: ICON.eyeOff, hidden: true, 'aria-expanded': 'false', title: 'Bandas que você tirou das recomendações', onclick: () => togglePremHidden() }, el('span', { text: 'Tiradas' })),
          el('button', { class: 'lfx-chip', type: 'button', html: ICON.refresh, title: 'Refazer a coleta agora: seus scrobbles, seus gêneros e as recomendações do Last.fm', onclick: () => runPremium({ tags: prem.tags.slice(), force: true }) }, 'Recalcular'))),
      el('div', { class: 'lfx-prem-hidden', hidden: true }),
      form,
      el('div', { class: 'lfx-prem-focus lfx-prem-suggest' }),
      el('div', { class: 'lfx-prem-sources' }),
      el('div', { class: 'lfx-prem-body' }, el('div', { class: 'lfx-prem-results' })));
  }
  function addPremTag(t) {
    const v = canonicalTag(t.trim().replace(/\s+/g, ' ').toLowerCase());
    if (!v || prem.tags.some((x) => genreKey(x) === genreKey(v)) || prem.tags.length >= 5) return;
    prem.tags.push(v);
    prem.auto = false;
    paintPremTags();
  }
  function paintPremTags() {
    if (!prem.node) return;
    const chips = $('.lfx-taginput-chips', prem.node);
    chips.textContent = '';
    prem.tags.forEach((t, i) => chips.append(el('span', { class: 'lfx-tagchip' }, t,
      el('button', { type: 'button', 'aria-label': `Tirar ${t}`, html: ICON.close, onclick: (e) => { e.preventDefault(); prem.tags.splice(i, 1); prem.auto = false; paintPremTags(); } }))));
    $('.lfx-prem-clear', prem.node).hidden = !prem.tags.length;
    $('.lfx-taginput-field', prem.node).placeholder = prem.tags.length >= 5 ? 'Até 5 gêneros por busca' : prem.tags.length ? 'Mais um gênero…' : 'Digite um gênero e aperte Enter (dá para juntar vários)';
    const dirty = !prem.ran || prem.ran.tags.join('|') !== prem.tags.join('|');
    $('.lfx-prem-go', prem.node).classList.toggle('lfx-dirty', dirty);
    paintPremSuggest();
  }
  function paintPremSuggest() {
    const box = prem.node && $('.lfx-prem-suggest', prem.node);
    if (!box) return;
    box.textContent = '';
    const list = premGenreList();
    if (!list.length) return;
    if (prem.auto && prem.tags.length) box.append(el('span', { class: 'lfx-prem-focus-label' }, 'Gênero da vez: ', el('b', { text: prem.tags[0] }), el('small', { text: ' · muda a cada vez que você abre a aba' })));
    else box.append(el('span', { class: 'lfx-prem-focus-label' }, 'Seus gêneros'));
    const chips = el('div', { class: 'lfx-prem-focus-chips' });
    for (const g of list) {
      const on = prem.tags.some((t) => genreKey(t) === g.key);
      chips.append(el('button', {
        type: 'button', class: 'lfx-prem-genre', 'aria-pressed': String(on), title: on ? 'Tirar da busca' : 'Pôr na busca',
        onclick: () => {
          if (on) prem.tags = prem.tags.filter((t) => genreKey(t) !== g.key);
          else if (prem.tags.length < 5) prem.tags.push(g.tag);
          prem.auto = false;
          paintPremTags();
        },
      }, g.name));
    }
    box.append(chips);
  }
  function paintPremSources() {
    const box = prem.node && $('.lfx-prem-sources', prem.node);
    const d = prem.taste;
    if (!box || !d) return;
    box.textContent = '';
    box.append(el('span', {}, el('b', { text: String(d.seeds?.length || 0) }), ' artistas que você mais ouve como base'));
    if (d.genres?.length) box.append(el('span', {}, el('b', { text: String(d.genres.length) }), ' gêneros no seu perfil'));
    const fr = prem.friends ? prem.friendsData : null;
    if (!prem.friends) box.append(el('span', {}, 'Amigos: ', el('b', { text: 'desligado' })));
    else if (fr?.friends.length) box.append(el('span', {}, el('b', { text: String(fr.friends.length) }), ` ${fr.friends.length === 1 ? 'pessoa' : 'pessoas'} com afinidade ≥ ${prem.min}%: `, ...joinNodes([...fr.friends.slice(0, 3).map((f) => el('a', { href: `/user/${encName(f.name)}`, text: `${f.name} (${f.pct}%)` })), ...(fr.friends.length > 3 ? [el('span', { text: `mais ${fr.friends.length - 3}` })] : [])])));
    else box.append(el('span', {}, `Ninguém entre as ${nf.format(fr?.following || 0)} pessoas que você segue passa de ${prem.min}% de afinidade`));
    box.append(el('span', {}, el('b', { text: nf.format(d.lfm?.length || 0) }), ' artistas das recomendações do Last.fm ficaram de fora'));
  }
  function premSkeleton() {
    return el('div', { class: 'lfx-prem-skel' },
      el('div', { class: 'lfx-prem-podium' }, ...[0, 1, 2].map(() => el('div', { class: 'lfx-skel', style: 'aspect-ratio:.78;border-radius:20px' }))),
      ...[0, 1, 2, 3].map(() => el('div', { class: 'lfx-skel', style: 'height:96px;border-radius:16px;margin-top:10px' })));
  }
  function premAlbumMeta(album) {
    const m = album.meta || '';
    const y = m.match(/\b(19|20)\d{2}\b/)?.[0];
    const tr = m.match(/(\d+)\s*(tracks|faixas)/i)?.[1];
    return [y, tr ? `${tr} faixas` : null].filter(Boolean).join(' · ');
  }
  function premCard(x, i, big, want) {
    const { c, info, album, alt } = x;
    const pct = premPct(x.raw);
    const q = `${c.name} ${album.title}`;
    const whys = [];
    if (c.simFrom.length) whys.push(el('span', { class: 'lfx-prem-why' }, 'Parecido com ', ...joinNodes(c.simFrom.slice(0, 2).map((n) => el('b', { text: n })))));
    const rev = c.revFrom.filter((n) => !c.simFrom.some((s) => normalize(s) === normalize(n))).slice(0, 2);
    if (rev.length) whys.push(el('span', { class: 'lfx-prem-why' }, 'Lembra ', ...joinNodes(rev.map((n) => el('b', { text: n }))), ', que você ouve'));
    if (prem.friends) {
      for (const f of c.friendFrom.slice(0, 2)) whys.push(el('span', { class: 'lfx-prem-why lfx-prem-why--friend' }, el('b', { text: f.name }), ` ouve · ${f.pct}% de afinidade`));
      if (info.friends) whys.push(el('span', { class: 'lfx-prem-why' }, `${nf.format(info.friends)} ${info.friends === 1 ? 'pessoa que você segue ouve' : 'pessoas que você segue ouvem'}`));
    }
    const tagsShown = [...new Set(c.tags.filter((t) => isGenreTag(t, c.name)))];
    const tags = [...tagsShown.filter((t) => want.includes(genreKey(t))), ...tagsShown.filter((t) => !want.includes(genreKey(t)))].slice(0, 5);
    const meta = [premAlbumMeta(album), c.listeners ? `${fmtN(c.listeners)} ouvintes` : null].filter(Boolean).join(' · ');
    const node = el(big ? 'article' : 'li', { class: big ? 'lfx-prem-top' : 'lfx-prem-row', style: `--d:${Math.min(i, 14) * 50}ms` },
      el('a', { class: 'lfx-prem-art', href: album.path },
        album.img ? el('img', { src: imgSize(album.img, big ? '500x500' : '300x300'), alt: '', loading: 'lazy' }) : el('span', { html: ICON.disc }),
        el('span', { class: 'lfx-prem-rank', text: String(i + 1) }),
        x.fill ? el('span', { class: 'lfx-prem-matchbadge', text: 'parecida' }) : want.length > 1 ? el('span', { class: `lfx-prem-matchbadge${x.match === want.length ? ' lfx-full' : ''}`, text: `${x.match} de ${want.length} tags` }) : null),
      el('div', { class: 'lfx-prem-info' },
        el('a', { class: 'lfx-prem-album', href: album.path, text: album.title }),
        el('a', { class: 'lfx-prem-artist', href: c.path, text: c.name }),
        meta ? el('div', { class: 'lfx-prem-meta', text: meta }) : null,
        whys.length ? el('div', { class: 'lfx-prem-whys' }, ...whys) : null,
        tags.length ? el('div', { class: 'lfx-prem-tags' }, ...tags.map((t) => el('span', { class: `lfx-prem-tag${want.includes(genreKey(t)) ? ' lfx-on' : ''}`, text: t }))) : null,
        big && alt ? el('div', { class: 'lfx-prem-alt' }, 'Depois: ', el('a', { href: alt.path, text: alt.title })) : null),
      el('div', { class: 'lfx-prem-side' },
        el('div', { class: 'lfx-prem-meter', style: `--lfx-p:${pct}`, title: 'Compatibilidade estimada com o seu gosto' }, el('span', { class: 'lfx-prem-meter-bar' }), el('b', { text: `${pct}%` }), el('small', { text: 'compatível com você' })),
        el('div', { class: 'lfx-prem-actions' },
          el('a', { class: 'lfx-icon-btn', href: serviceUrl(preferred(), q, { kind: 'album', artist: c.name, title: album.title }), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${SERVICES[preferred()][0]}`, 'aria-label': `Ouvir ${album.title} no ${SERVICES[preferred()][0]}`, html: ICON.play }),
          laterButton({ kind: 'album', path: album.path, title: album.title, artist: c.name, img: album.img }),
          el('button', { class: 'lfx-icon-btn lfx-prem-nope', type: 'button', title: `Não quero: tirar ${c.name} e não recomendar de novo`, 'aria-label': `Tirar ${c.name} das recomendações`, html: ICON.nope, onclick: (e) => { e.preventDefault(); dismissPrem(x, node); } }))));
    node.dataset.k = normalize(c.name);
    return node;
  }
  function renderPremium(out, tags) {
    prem.result = { all: out.items.filter((x) => !prem.hidden.has(normalize(x.c.name))), want: out.want, more: !!out.more, tags: tags.slice() };
    prem.undo = null;
    paintPremResults();
  }
  /* Desenha a lista atual: as 10 primeiras que você não tirou (as outras ficam de reserva) */
  function paintPremResults({ quiet = false, fresh = null } = {}) {
    const r = prem.result;
    if (!r) return;
    const items = r.all.slice(0, PREM_N);
    paintPremResultsInto(items, r.want, r.all.length, r.tags, { quiet, fresh });
    paintPremHiddenBtn();
  }
  function paintPremResultsInto(items, want, found, tags, { quiet, fresh }) {
    const res = prem.node && $('.lfx-prem-results', prem.node);
    if (!res) return;
    res.textContent = '';
    res.classList.toggle('lfx-prem-quiet', quiet);
    if (prem.undo) res.append(premUndoBar());
    const inTags = items.filter((x) => !x.fill).length, extra = items.length - inTags;
    const tagNodes = () => joinNodes(tags.map((t) => el('b', { text: t })));
    const n = (k) => `${k} ${k === 1 ? 'álbum' : 'álbuns'}`;
    const head = el('div', { class: 'lfx-prem-resulthead' },
      tags.length && extra && !inTags
        ? el('h2', {}, `${n(items.length)} parecidos com o seu gosto`)
        : el('h2', {}, items.length ? n(inTags) : 'Nenhum álbum', tags.length ? el('span', {}, ' em ', ...tagNodes()) : el('span', { text: ' mais compatíveis com você' })),
      el('p', {}, ...(tags.length && extra
        ? (inTags ? [`E mais ${extra} ${extra === 1 ? 'parecido' : 'parecidos'} com o seu gosto para completar 10, fora dessas tags.`] : ['Não apareceu banda inédita em ', ...tagNodes(), '; completei com as mais parecidas com o que você ouve.'])
        : [want.length > 1 ? 'Primeiro quem tem mais tags da sua busca; dentro disso, do mais compatível com o seu gosto ao menos.' : 'Do mais compatível com o seu gosto ao menos.'])));
    res.append(head);
    if (!items.length) {
      res.append(el('div', { class: 'lfx-cat-empty lfx-prem-empty' }, tags.length
        ? 'Não achei bandas inéditas para você nessas tags. Confira se o nome do gênero está como no Last.fm (por exemplo, “post-metal”) ou tente outra combinação.'
        : 'Não sobrou nenhuma banda inédita aqui. Clique em Recalcular para refazer a coleta.'));
      return;
    }
    if (items.length < PREM_N && found < PREM_N) head.append(el('p', { class: 'lfx-prem-few', text: `Só ${items.length === 1 ? 'uma banda inédita apareceu' : `${items.length} bandas inéditas apareceram`} para essa busca.` }));
    const mark = (node) => { if (fresh && node.dataset.k === fresh) node.classList.add('lfx-prem-new'); return node; };
    res.append(el('div', { class: 'lfx-prem-podium' }, ...items.slice(0, 3).map((x, i) => mark(premCard(x, i, true, want)))));
    const rest = items.slice(3);
    if (!rest.length) return;
    const list = el('ol', { class: 'lfx-prem-list' });
    rest.forEach((x, j) => {
      const prev = j === 0 ? items[2] : rest[j - 1];
      if (x.fill && !prev.fill) {
        list.append(el('li', { class: 'lfx-prem-split' }, el('span', { text: 'Para completar' }), el('small', { text: 'fora dessas tags, mas parecidas com o que você ouve' })));
      } else if (!x.fill && want.length > 1 && x.match !== prev.match) {
        list.append(el('li', { class: 'lfx-prem-split' }, el('span', { text: x.match === want.length ? `Com as ${want.length} tags` : `Com ${x.match} de ${want.length} tags` })));
      }
      list.append(mark(premCard(x, j + 3, false, want)));
    });
    res.append(list);
  }

  /* "Não quero": tira a banda, guarda para não voltar e põe a próxima da reserva no lugar */
  function dismissPrem(x, node) {
    const r = prem.result;
    if (!r || !me) return;
    const k = normalize(x.c.name);
    const index = r.all.findIndex((y) => normalize(y.c.name) === k);
    if (index < 0) return;
    prem.hidden.set(k, { k, name: x.c.name, path: x.c.path, album: x.album?.title || '', t: Date.now() });
    savePremHidden();
    r.all.splice(index, 1);
    const next = r.all[PREM_N - 1];
    prem.undo = { k, item: x, index, name: x.c.name };
    const done = () => {
      paintPremResults({ quiet: true, fresh: next ? normalize(next.c.name) : null });
      if (r.all.length < PREM_N + 3 && r.more !== false) refillPrem();
    };
    if (node?.isConnected && root.classList.contains('lfx-motion')) {
      node.classList.add('lfx-prem-gone');
      setTimeout(done, 240);
    } else done();
  }
  function undoPrem() {
    const u = prem.undo, r = prem.result;
    if (!u || !r) return;
    prem.hidden.delete(u.k);
    savePremHidden();
    if (!r.all.some((y) => normalize(y.c.name) === u.k)) r.all.splice(Math.min(u.index, r.all.length), 0, u.item);
    prem.undo = null;
    paintPremResults({ quiet: true, fresh: u.k });
  }
  function premUndoBar() {
    const u = prem.undo;
    return el('div', { class: 'lfx-prem-undo', role: 'status' },
      el('span', { html: ICON.nope }),
      el('span', {}, el('b', { text: u.name }), ' saiu das recomendações e não volta mais.'),
      el('button', { class: 'lfx-chip', type: 'button', onclick: undoPrem }, 'Desfazer'),
      el('button', { class: 'lfx-icon-btn lfx-prem-undo-x', type: 'button', 'aria-label': 'Fechar aviso', html: ICON.close, onclick: (e) => { prem.undo = null; e.currentTarget.closest('.lfx-prem-undo')?.remove(); } }));
  }
  /* Quando a reserva acaba, busca mais bandas em segundo plano (o que já foi conferido vem do cache) */
  async function refillPrem() {
    const r = prem.result;
    if (!r || prem.fillCtrl || !prem.taste) return;
    const ctrl = prem.fillCtrl = new AbortController();
    try {
      const out = await premiumSearch(r.tags, () => {}, ctrl.signal, false, { limit: r.all.length + PREM_N + 10, rounds: 12 });
      if (ctrl.signal.aborted || prem.result !== r) return;
      const shown = r.all.slice(0, PREM_N);
      const seen = new Set(shown.map((y) => normalize(y.c.name)));
      const extra = out.items.filter((y) => { const k = normalize(y.c.name); if (seen.has(k) || prem.hidden.has(k)) return false; seen.add(k); return true; });
      const before = Math.min(PREM_N, r.all.length);
      r.all = [...shown, ...extra];
      r.more = !!out.more;
      if (Math.min(PREM_N, r.all.length) > before) paintPremResults({ quiet: true });
    } catch (_) { /* tenta de novo no próximo "não quero" */ } finally {
      if (prem.fillCtrl === ctrl) prem.fillCtrl = null;
    }
  }
  /* Lista das bandas tiradas, para mostrar de novo */
  function paintPremHiddenBtn() {
    const btn = prem.node && $('.lfx-prem-hiddenbtn', prem.node);
    if (!btn) return;
    btn.hidden = !prem.hidden.size;
    $('span', btn).textContent = `Tiradas (${nf.format(prem.hidden.size)})`;
    const box = $('.lfx-prem-hidden', prem.node);
    if (box && !box.hidden) paintPremHiddenList();
  }
  function togglePremHidden(force) {
    const box = prem.node && $('.lfx-prem-hidden', prem.node);
    if (!box) return;
    const open = force ?? box.hidden;
    box.hidden = !open;
    $('.lfx-prem-hiddenbtn', prem.node)?.setAttribute('aria-expanded', String(open));
    if (open) paintPremHiddenList();
    else if (box.dataset.changed) { delete box.dataset.changed; runPremium({ tags: prem.ran ? prem.ran.tags.slice() : prem.tags.slice() }); }
  }
  function paintPremHiddenList() {
    const box = $('.lfx-prem-hidden', prem.node);
    const list = [...prem.hidden.values()].sort((a, b) => b.t - a.t);
    box.textContent = '';
    const restore = (keys) => {
      keys.forEach((k) => prem.hidden.delete(k));
      savePremHidden();
      box.dataset.changed = '1';
      paintPremHiddenBtn();
      if (!prem.hidden.size) togglePremHidden(false);
    };
    box.append(el('div', { class: 'lfx-prem-hidden-head' },
      el('div', {}, el('b', { text: 'Bandas que você tirou' }), el('small', { text: ' · não aparecem mais nas recomendações' })),
      el('div', { class: 'lfx-prem-hidden-acts' },
        list.length > 1 ? el('button', { class: 'lfx-chip', type: 'button', onclick: () => restore(list.map((x) => x.k)) }, 'Mostrar todas de novo') : null,
        el('button', { class: 'lfx-chip', type: 'button', onclick: () => togglePremHidden(false) }, 'Fechar'))));
    const ul = el('ul', { class: 'lfx-prem-hidden-list' });
    for (const x of list.slice(0, 300)) {
      ul.append(el('li', {},
        el('a', { href: x.path || `/music/${encName(x.name)}`, text: x.name }),
        x.album ? el('small', { text: x.album }) : null,
        el('button', { type: 'button', class: 'lfx-prem-hidden-undo', title: `Deixar ${x.name} voltar às recomendações`, onclick: () => restore([x.k]) }, 'Mostrar de novo')));
    }
    box.append(ul);
  }
  async function loadPremium() {
    prem.min = await ext.getLocal('lfx:prem:min', 95);
    if (!PREM_MIN.includes(prem.min)) prem.min = 95;
    prem.friends = !!(await ext.getLocal('lfx:prem:friends', false));
    await loadPremHidden();
    paintPremHiddenBtn();
    // Limpa o que a versão anterior guardava (um bloco por afinidade mínima)
    if (!(await ext.getLocal('lfx:prem:v3', false))) { for (const v of PREM_MIN) ext.setLocal(`lfx:prem:pool:${me.name.toLowerCase()}:${v}`, null); ext.setLocal('lfx:prem:v3', true); }
    const box = prem.node && $('.lfx-prem-switch', prem.node);
    if (prem.node && prem.minSel) { prem.minSel.value = String(prem.min); prem.minSel.disabled = !prem.friends; }
    if (box) box.checked = prem.friends;
    paintPremTags();
    // Sem busca sua em andamento, a aba abre no "gênero da vez", que muda a cada visita
    if (!prem.tags.length || prem.auto) runPremium({ rotate: true });
    else runPremium({ tags: prem.tags.slice() });
  }
  async function runPremium({ tags = [], force = false, rotate = false } = {}) {
    if (!prem.node) return;
    prem.ctrl?.abort();
    prem.fillCtrl?.abort(); prem.fillCtrl = null;
    const ctrl = prem.ctrl = new AbortController();
    const node = prem.node;
    const res = $('.lfx-prem-results', node);
    if (!res.childElementCount) res.append(premSkeleton());
    const steps = [], order = {};
    const addStep = (label, ...stages) => { stages.forEach((s) => { order[s] = steps.length; }); steps.push(label); };
    addStep('Lendo o seu gosto', 'taste', 'genres', 'similar', 'lfm');
    if (prem.friends) addStep('Somando quem você segue', 'friends');
    if (tags.length || rotate) addStep('Buscando bandas nas tags', 'tags');
    addStep('Conferindo álbuns, seus scrobbles e parecidos', 'details');
    addStep(tags.length > 1 ? 'Ordenando por tags e compatibilidade' : 'Ordenando pela compatibilidade', 'rank');
    const title = (t) => (t.length ? `Procurando em ${t.join(' + ')}` : 'Procurando as mais compatíveis com você');
    const L = showLoader(node, { title: rotate ? 'Escolhendo o gênero da vez' : title(tags), steps, faces: await loaderFaces() });
    let last = -1;
    const report = (stage, frac, msg) => {
      if (ctrl.signal.aborted) return;
      const i = order[stage] ?? 0;
      if (i !== last) { last = i; L.step(i, msg); }
      L.progress(frac, msg);
    };
    try {
      prem.taste = await premTaste(report, ctrl.signal, force);
      if (ctrl.signal.aborted) return;
      if (rotate) {
        const rot = premGenreList().slice(0, 8);
        let idx = await ext.getLocal('lfx:prem:focus', -1);
        if (rot.length) { idx = (idx + 1) % rot.length; ext.setLocal('lfx:prem:focus', idx); prem.tags = [rot[idx].tag]; prem.auto = true; } else { prem.tags = []; prem.auto = false; }
        tags = prem.tags.slice();
        L.title(title(tags));
      }
      prem.friendsData = prem.friends ? await premFriends(report, ctrl.signal, force) : null;
      if (ctrl.signal.aborted) return;
      paintPremSources();
      paintPremTags();
      const out = await premiumSearch(tags, report, ctrl.signal, force);
      if (ctrl.signal.aborted) return;
      prem.ran = { tags: tags.slice() };
      paintPremTags();
      renderPremium(out, tags);
    } catch (e) {
      if (e.name === 'AbortError' || ctrl.signal.aborted) return;
      res.replaceChildren(el('div', { class: 'lfx-cat-empty', text: 'Não deu para montar as recomendações agora. Tente de novo em instantes.' }));
    } finally {
      L.done();
    }
  }

  /* ================================================================ *
   * Descobrir (/music): topo com mosaico de capas animado, navegação
   * por seções, prateleiras deslizantes, selos (novo, em breve, já
   * ouvido), ações rápidas nas capas, filtro do que você já ouve e o
   * "Surpreenda-me"
   * ================================================================ */
  const disc = { page: null, known: null, io: null, spot: null, hide: null };
  const DISC_LABELS = {
    'artists for you': ['Artistas para você', 'artistas'], 'new releases to check out': ['Lançamentos para você', 'lancamentos'],
    'tags to explore': ['Tags para explorar', 'tags'], 'albums you might like': ['Álbuns que você pode curtir', 'albuns'],
    'tracks you need to hear': ['Faixas que você precisa ouvir', 'faixas'], 'blasts from the past': ['Do fundo do baú', 'bau'],
    'hot right now': ['Em alta agora', 'em-alta'], 'the latest releases': ['Últimos lançamentos', 'ultimos'],
    'coming soon': ['Em breve', 'em-breve'], 'popular image galleries': ['Galerias de fotos', 'galerias'],
    'explore the live charts': ['Charts ao vivo', 'charts'],
  };
  const DISC_SHORT = { artistas: 'Artistas', lancamentos: 'Lançamentos', tags: 'Tags', albuns: 'Álbuns', faixas: 'Faixas', bau: 'Baú', 'em-alta': 'Em alta', ultimos: 'Últimos', 'em-breve': 'Em breve', galerias: 'Galerias', charts: 'Charts' };
  const DISC_CARDS = '.music-releases-item, .column-tracks-item, .music-more-artists-item, .artist-featured-items-item';
  const onDiscover = (p) => S.discover && /^\/music\/?$/i.test(p.path || stripLang(location.pathname));

  async function discKnown() {
    if (disc.known) return disc.known;
    if (!me) return (disc.known = new Set());
    const [all, year] = await Promise.all([libArtists(me.name, 'ALL', 4, 24 * HOUR).catch(() => []), libArtists(me.name, 'LAST_365_DAYS', 2, 12 * HOUR).catch(() => [])]);
    disc.known = new Set([...all, ...year].map((a) => normalize(a.name)));
    return disc.known;
  }
  const dayDiff = (d) => Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(new Date().toDateString())) / 864e5);

  // Textos do site nos cartões e nas abas do topo, em português (o original fica guardado para desfazer)
  const DISC_TABS = { overview: 'Visão geral', 'your recommendations': 'Suas recomendações', 'new releases': 'Lançamentos', bookmarks: 'Salvos' };
  const DISC_PHRASES = [[/similar to/i, 'Parecido com'], [/you'?ve scrobbled/i, 'Você já ouviu'], [/^\s*before\s*$/i, ' '], [/^\s*latest release\s*$/i, 'Último lançamento'], [/^\s*popular this week\s*$/i, 'Em alta na semana'], [/^\s*popular\s*$/i, 'Em alta'], [/^\s*and\s*$/i, ' e ']];
  function ptDiscText(blocks) {
    for (const a of $$('.content-top .minimal-navigation-item-link:not([data-lfx-en-html])')) {
      // (a aba atual tem um texto escondido para leitores de tela, que fica como está)
      const tn = [...a.childNodes].find((n) => n.nodeType === 3 && n.nodeValue.trim());
      const pt = tn && DISC_TABS[normalize(tn.nodeValue)];
      if (pt) { a.dataset.lfxEnHtml = a.innerHTML; tn.nodeValue = pt; }
    }
    for (const p of blocks.flatMap((b) => $$(':is([class$="-item-context"], .music-featured-artist-similar, [class$="-item-date"], .artist-featured-items-item-header):not([data-lfx-en-html])', b))) {
      const html = p.innerHTML;
      if (/-item-date\b/.test(p.className)) {
        const d = parseSince(text(p));
        if (!d) continue;
        p.dataset.lfxEnHtml = html; p.dataset.lfxDate = text(p);
        p.textContent = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
        continue;
      }
      for (const n of [...p.childNodes]) {
        if (n.nodeType !== 3) continue;
        let v = n.nodeValue;
        for (const [re, pt] of DISC_PHRASES) v = v.replace(re, pt);
        if (v === n.nodeValue) continue;
        if (!p.dataset.lfxEnHtml) p.dataset.lfxEnHtml = html;
        n.nodeValue = v;
      }
    }
  }

  function teardownDiscover() {
    closeSpotlight(true); disc.io?.disconnect(); disc.io = null; disc.page = null;
    $$('.lfx-disc-hero, .lfx-disc-nav, .lfx-shelf-ctrls, .lfx-shelf-side, .lfx-disc-badges, .lfx-disc-acts').forEach((n) => n.remove());
    $$('[data-lfx-disc-card]').forEach((n) => { delete n.dataset.lfxDiscCard; delete n.dataset.lfxKnown; delete n.dataset.lfxSoon; });
    $$(':is(.music-section-heading, .minimal-navigation-item-link)[data-lfx-en]').forEach((h) => { h.textContent = h.dataset.lfxEn; delete h.dataset.lfxEn; });
    $$('[data-lfx-en-html]').forEach((n) => { n.innerHTML = n.dataset.lfxEnHtml; delete n.dataset.lfxEnHtml; delete n.dataset.lfxDate; });
    $$('[data-lfx-disc]').forEach((n) => { delete n.dataset.lfxDisc; n.classList.remove('lfx-disc-section', 'lfx-disc-empty'); n.removeAttribute('id'); });
    $$('.lfx-shelf').forEach((n) => n.classList.remove('lfx-shelf', 'lfx-shelf--tags', 'lfx-shelf--round', 'lfx-at-start', 'lfx-at-end'));
    $$('.lfx-disc-media').forEach((n) => n.classList.remove('lfx-disc-media'));
    root.classList.remove('lfx-disc-on', 'lfx-disc-hide-known');
  }
  /* O site divide o Descobrir em vários blocos ".page-content" (com anúncios entre eles); todos contam */
  const discBlocks = () => $$('#content .page-content').filter((n) => !n.classList.contains('visible-xs') && !n.closest('.lfx-catalog') && !!$(':scope > section.music-section', n));
  function enhanceDiscover(p) {
    const blocks = onDiscover(p) ? discBlocks() : [];
    const pc = blocks[0] || null;
    if (!pc) {
      if (root.classList.contains('lfx-disc-on') || $('.lfx-disc-hero')) teardownDiscover();
      else if (disc.page && !disc.page.isConnected) { disc.io?.disconnect(); disc.page = null; }
      return;
    }
    root.classList.add('lfx-disc-on');
    if (disc.hide == null) {
      disc.hide = false;
      ext.getLocal('lfx:disc:hideKnown', false).then((v) => {
        disc.hide = !!v; root.classList.toggle('lfx-disc-hide-known', disc.hide);
        const sw = $('.lfx-disc-known-switch'); if (sw) sw.checked = disc.hide;
        paintDiscHeroStats();
      });
    }
    root.classList.toggle('lfx-disc-hide-known', disc.hide);
    if (disc.page !== pc) { disc.page = pc; disc.io?.disconnect(); disc.io = null; }
    const sections = blocks.flatMap((b) => $$(':scope > section.music-section', b));
    // 1) Topo com mosaico e as ações
    let hero = $(':scope > .lfx-disc-hero', pc);
    if (!hero) { hero = buildDiscHero(); pc.prepend(hero); }
    // 2) Seções: título em português, âncora e índice para a navegação
    sections.forEach((s, i) => {
      const h = $('.music-section-heading', s);
      if (!h) return;
      if (!s.dataset.lfxDisc) {
        const en = normalize(text(h));
        const [pt, slug] = DISC_LABELS[en] || [null, `secao-${i}`];
        s.dataset.lfxDisc = slug;
        s.id = `lfx-disc-${slug}`;
        s.classList.add('lfx-disc-section');
        if (pt) { h.dataset.lfxEn = text(h); h.textContent = pt; }
        h.classList.add('lfx-disc-h');
      }
      // prateleiras deslizantes
      // (as listas chegam depois do carregamento; a provisória, com capas cinzas, fica como o site mostra)
      $$(':scope .lfx-shelf-side', s).forEach((side) => { if (!side.nextElementSibling?.classList.contains('lfx-shelf')) side.remove(); });
      for (const list of $$(':scope :is(ul, ol):is(.music-releases, .music-more-artists, .music-more-tags):not(.lfx-shelf)', s)) if (!list.closest('.music-page-placeholder')) makeShelf(list, s);
      // vazio (o "baú" é só para assinantes): some
      s.classList.toggle('lfx-disc-empty', !$('li, .music-featured-item', s) && !!$('.music-section-rediscover-subscribe-banner-cta', s));
    });
    paintDiscNav(pc, sections);
    ptDiscText(blocks);
    // 3) Cartões: selos e ações rápidas
    discKnown().then((known) => {
      if (disc.page !== pc) return;
      let n = 0;
      for (const b of discBlocks()) {
        for (const card of $$(`:is(${DISC_CARDS}):not([data-lfx-disc-card])`, b)) {
          if (card.closest('.music-page-placeholder')) continue;
          // um cartão com marcação inesperada não pode travar os outros
          try { prepDiscCard(card, known); } catch (_) { card.dataset.lfxDiscCard = '1'; }
          n++;
        }
      }
      if (n) { paintDiscHeroStats(); fillDiscMosaic(); }
    }).catch(() => {});
  }

  function buildDiscHero() {
    const sw = el('input', { type: 'checkbox', class: 'lfx-prem-switch lfx-disc-known-switch', 'aria-label': 'Esconder artistas que você já ouve' });
    sw.checked = !!disc.hide;
    sw.addEventListener('change', () => {
      disc.hide = sw.checked;
      ext.setLocal('lfx:disc:hideKnown', sw.checked);
      root.classList.toggle('lfx-disc-hide-known', sw.checked);
      paintDiscHeroStats();
    });
    const name = me ? (me.display || me.name) : null;
    return el('section', { class: 'lfx-disc-hero lfx-layer', 'aria-label': 'Descobrir' },
      el('div', { class: 'lfx-disc-glow', 'aria-hidden': 'true' }),
      el('div', { class: 'lfx-disc-hero-text' },
        el('div', { class: 'lfx-disc-eyebrow' }, el('span', { html: ICON.compass }), 'Descobrir'),
        el('h1', { class: 'lfx-disc-title' }, name ? 'Música nova pra você, ' : 'Música nova pra você', name ? el('span', { class: 'lfx-disc-name', text: name }) : null),
        el('p', { class: 'lfx-disc-sub', text: 'Artistas, álbuns, faixas e tags escolhidos pelo Last.fm a partir do que você ouve.' }),
        el('div', { class: 'lfx-disc-stats', 'aria-live': 'polite' }),
        el('div', { class: 'lfx-disc-actions' },
          el('button', { class: 'lfx-disc-surprise', type: 'button', html: ICON.shuffle, onclick: () => openSpotlight() }, el('span', { text: 'Surpreenda-me' })),
          el('label', { class: 'lfx-prem-frwrap lfx-disc-known' }, sw, el('span', { text: 'Esconder o que eu já ouço' })))),
      el('div', { class: 'lfx-disc-mosaic', 'aria-hidden': 'true' }, ...[0, 1, 2].map((i) => el('div', { class: 'lfx-disc-col', style: `--col:${i}` }))));
  }
  function discCovers() {
    const seen = new Set();
    return $$('#content .page-content :is(.music-releases-item, .column-tracks-item, .artist-featured-items-item) .media-item img')
      .map((img) => img.getAttribute('src')).filter((src) => src && !isPlaceholder(src) && !seen.has(src) && seen.add(src));
  }
  function fillDiscMosaic() {
    const box = disc.page && $('.lfx-disc-mosaic', disc.page);
    if (!box) return;
    const covers = discCovers();
    // monta uma vez com capas suficientes (as seções chegam aos poucos) e só refaz se a primeira leva era curta
    const pending = !!$('.music-page-placeholder', disc.page);
    if (covers.length < 6 || (pending && covers.length < 18)) return;
    if (+box.dataset.n >= Math.min(covers.length, 18)) return;
    const pick = covers.slice(0, 24);
    box.dataset.n = String(pick.length);
    $$('.lfx-disc-col', box).forEach((col, c) => {
      const mine = pick.filter((_, i) => i % 3 === c);
      col.textContent = '';
      // duas cópias da coluna: a rolagem infinita volta ao início sem salto
      for (const k of [0, 1]) col.append(el('div', { class: 'lfx-disc-strip', 'aria-hidden': String(k === 1) }, ...mine.map((src) => el('img', { src: imgSize(src, '300x300'), alt: '', loading: 'lazy', decoding: 'async' }))));
    });
    box.classList.add('lfx-ready');
  }
  function paintDiscHeroStats() {
    const box = disc.page && $('.lfx-disc-stats', disc.page);
    if (!box) return;
    // (o site esconde um artista repetido do destaque; os escondidos por "já ouço" continuam contando)
    const cards = $$('#content .page-content [data-lfx-disc-card]').filter((c) => c.dataset.lfxKnown || c.checkVisibility?.() !== false);
    const count = (sel) => cards.filter((c) => c.matches(sel)).length;
    const known = cards.filter((c) => c.dataset.lfxKnown).length;
    const soon = cards.filter((c) => c.dataset.lfxSoon).length;
    box.textContent = '';
    const chip = (n, label) => (n ? box.append(el('span', { class: 'lfx-disc-stat' }, el('b', { text: nf.format(n) }), ` ${label}`)) : null);
    chip(count('.music-releases-item'), 'álbuns');
    chip(count('.column-tracks-item'), 'faixas');
    chip(count('.music-more-artists-item'), 'artistas');
    chip(soon, 'chegando em breve');
    if (known) box.append(el('span', { class: 'lfx-disc-stat lfx-disc-stat--known' }, el('b', { text: nf.format(known) }), disc.hide ? ' de artistas que você já ouve, escondidos' : ' de artistas que você já ouve'));
  }
  function paintDiscNav(pc, sections) {
    let nav = $(':scope > .lfx-disc-nav', pc);
    const items = sections.filter((s) => s.dataset.lfxDisc && !s.classList.contains('lfx-disc-empty'));
    const key = items.map((s) => s.dataset.lfxDisc).join('|');
    if (nav && nav.dataset.key === key) return;
    nav?.remove();
    if (!items.length) return;
    nav = el('nav', { class: 'lfx-disc-nav lfx-layer', 'aria-label': 'Seções do Descobrir', 'data-key': key },
      ...items.map((s) => el('a', { class: 'lfx-disc-chip', href: `#${s.id}`, 'data-target': s.id, onclick: (e) => {
        e.preventDefault();
        mark(s.id);
        // enquanto a página desliza até a seção, o destaque não fica pulando entre as do meio
        clearTimeout(disc.lockT); disc.lock = s.id;
        const free = () => { clearTimeout(disc.lockT); disc.lock = null; };
        addEventListener('scrollend', free, { once: true });
        disc.lockT = setTimeout(free, 1600);
        s.scrollIntoView({ behavior: root.classList.contains('lfx-motion') ? 'smooth' : 'auto', block: 'start' });
      } }, DISC_SHORT[s.dataset.lfxDisc] || text($('.music-section-heading', s)))));
    // destaca o chip e o traz para a vista mexendo só na barra (mexer na página interromperia a rolagem suave)
    function mark(id) {
      let on = null;
      for (const a of $$('.lfx-disc-chip', nav)) { const hit = a.dataset.target === id; a.classList.toggle('lfx-on', hit); if (hit) on = a; }
      if (on && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2, behavior: 'smooth' });
    }
    $(':scope > .lfx-disc-hero', pc).after(nav);
    // Seção atual em destaque enquanto você rola
    disc.io?.disconnect();
    disc.io = new IntersectionObserver((entries) => {
      if (disc.lock) return;
      for (const en of entries) if (en.isIntersecting) mark(en.target.id);
    }, { rootMargin: '-35% 0px -60% 0px' });
    items.forEach((s) => disc.io.observe(s));
  }
  function makeShelf(list, section) {
    list.classList.add('lfx-shelf');
    if (list.classList.contains('music-more-tags')) list.classList.add('lfx-shelf--tags');
    if (list.classList.contains('music-more-artists')) list.classList.add('lfx-shelf--round');
    const prev = el('button', { class: 'lfx-shelf-btn', type: 'button', 'aria-label': 'Voltar', html: ICON.collapse });
    const next = el('button', { class: 'lfx-shelf-btn lfx-shelf-btn--next', type: 'button', 'aria-label': 'Avançar', html: ICON.collapse });
    const move = (dir) => list.scrollBy({ left: dir * Math.max(240, list.clientWidth * 0.85), behavior: root.classList.contains('lfx-motion') ? 'smooth' : 'auto' });
    prev.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    const paint = () => {
      prev.disabled = list.scrollLeft < 8;
      next.disabled = list.scrollLeft + list.clientWidth > list.scrollWidth - 8;
      list.classList.toggle('lfx-at-start', prev.disabled);
      list.classList.toggle('lfx-at-end', next.disabled);
    };
    list.addEventListener('scroll', () => requestAnimationFrame(paint), { passive: true });
    new ResizeObserver(paint).observe(list);
    const head = $('.music-section-heading', section);
    let ctr = head && $(':scope > .lfx-shelf-ctrls', section);
    if (head && !ctr) { ctr = el('div', { class: 'lfx-shelf-ctrls lfx-layer' }); head.after(ctr); }
    // uma prateleira por seção ganha os botões no título; as outras ficam com botões laterais
    if (ctr && (!ctr.childElementCount || !ctr.lfxList?.isConnected)) { ctr.replaceChildren(prev, next); ctr.lfxList = list; }
    else { const side = el('div', { class: 'lfx-shelf-side lfx-layer' }, prev, next); list.before(side); }
    setTimeout(paint, 50);
  }

  function prepDiscCard(card, known) {
    card.dataset.lfxDiscCard = '1';
    const nameA = $('[class$="-item-name"] a, h3 a, h4 a', card);
    const t = musicTarget(nameA?.getAttribute('href'));
    if (!t) return;
    const artist = t.kind === 'artist' ? text(nameA) : text($('[class$="-item-artist"] a', card)) || t.artist;
    const context = text($('[class$="-item-context"]', card));
    const isKnown = !!artist && (known.has(normalize(artist)) || /you'?ve scrobbled|voce ja/i.test(normalize(context)));
    const badges = [];
    if (isKnown) { card.dataset.lfxKnown = '1'; badges.push(['Já ouvido', 'known']); }
    const dateP = $('[class$="-item-date"]', card);
    const dateTxt = dateP ? dateP.dataset.lfxDate || text(dateP) : '';
    const d = dateTxt ? parseSince(dateTxt) : null;
    if (d) {
      const diff = dayDiff(d);
      if (diff > 0) { card.dataset.lfxSoon = '1'; badges.push([diff === 1 ? 'Amanhã' : diff < 60 ? `Em ${diff} dias` : 'Em breve', 'soon']); }
      else if (diff === 0) badges.push(['Sai hoje', 'today']);
      else if (diff >= -7) badges.push(['Novo', 'new']);
    }
    const media = $('.media-item', card);
    if (!media) return;
    media.classList.add('lfx-disc-media');
    if (badges.length) media.append(el('span', { class: 'lfx-disc-badges lfx-layer' }, ...badges.map(([label, kind]) => el('span', { class: `lfx-disc-badge lfx-disc-badge--${kind}`, text: label }))));
    // Ações rápidas: ouvir no seu serviço e ouvir depois (álbuns e faixas)
    if (t.kind === 'album' || t.kind === 'track') {
      const title = text(nameA);
      const q = [artist, title].filter(Boolean).join(' ');
      const acts = el('span', { class: 'lfx-disc-acts lfx-layer' });
      if (S.listen) acts.append(el('a', { class: 'lfx-icon-btn lfx-disc-play', href: serviceUrl(preferred(), q, { kind: t.kind, artist, title }), target: '_blank', rel: 'noopener noreferrer', title: `Ouvir no ${SERVICES[preferred()][0]}`, 'aria-label': `Ouvir ${title} no ${SERVICES[preferred()][0]}`, html: ICON.play }));
      acts.append(laterButton({ kind: t.kind, path: t.path, title, artist, img: $('img', media)?.getAttribute('src') || null }));
      media.append(acts);
    }
  }

  /* "Surpreenda-me": sorteia um álbum ou faixa da página (de preferência de quem você ainda não ouve). */
  function discPool() {
    // (não depende dos selos: mesmo que eles ainda não tenham chegado, dá para sortear)
    return $$('#content .page-content:not(.visible-xs) :is(.music-releases-item, .column-tracks-item)').filter((card) => !card.closest('.music-page-placeholder')).map((card) => {
      const a = $('[class$="-item-name"] a', card);
      const t = musicTarget(a?.getAttribute('href'));
      const img = $('.media-item img', card)?.getAttribute('src');
      if (!t || !img || isPlaceholder(img)) return null;
      const artist = text($('[class$="-item-artist"] a', card)) || t.artist;
      const sec = card.closest('.music-section');
      return { kind: t.kind, path: t.path, title: text(a), artist, artistPath: `/music/${encName(artist)}`, img, known: !!card.dataset.lfxKnown, soon: !!card.dataset.lfxSoon,
        context: text($('[class$="-item-context"], [class$="-item-date"]', card)), section: sec ? text($('.music-section-heading', sec)) : '' };
    }).filter(Boolean);
  }
  function openSpotlight() {
    const all = discPool();
    if (!all.length) { toast($('#content .music-page-placeholder') ? 'As recomendações ainda estão carregando. Tente de novo em um instante.' : 'Não achei álbuns ou faixas nesta página para sortear.'); return; }
    const fresh = all.filter((x) => !x.known && !x.soon);
    const pool = fresh.length ? fresh : all;
    closeSpotlight(true);
    const reel = el('div', { class: 'lfx-spot-reel' });
    const card = el('div', { class: 'lfx-spot-card', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Surpreenda-me' },
      el('button', { class: 'lfx-icon-btn lfx-spot-close', type: 'button', 'aria-label': 'Fechar', html: ICON.close, onclick: () => closeSpotlight() }),
      el('div', { class: 'lfx-spot-eyebrow' }, el('span', { html: ICON.shuffle }), 'Sorteado pra você'),
      reel, el('div', { class: 'lfx-spot-info' }));
    const back = el('div', { class: 'lfx-spot lfx-layer' }, card);
    back.addEventListener('pointerdown', (e) => { if (e.target === back) closeSpotlight(); });
    document.body.append(back);
    disc.spot = back;
    requestAnimationFrame(() => back.classList.add('lfx-open'));
    spin(pool, reel, card);
  }
  function spin(pool, reel, card) {
    const info = $('.lfx-spot-info', card);
    info.classList.remove('lfx-show');
    // não repete a última sorteada (quando há outra opção)
    const choices = pool.length > 1 ? pool.filter((x) => x.path !== card.dataset.last) : pool;
    const pick = choices[Math.floor(Math.random() * choices.length)];
    card.dataset.last = pick.path;
    const turn = (card.lfxTurn = (card.lfxTurn || 0) + 1);
    const motion = root.classList.contains('lfx-motion');
    // A roleta: capas passando cada vez mais devagar até parar na escolhida
    const deck = [];
    for (let i = 0; i < (motion ? 14 : 0); i++) deck.push(pool[Math.floor(Math.random() * pool.length)]);
    deck.push(pick);
    reel.textContent = '';
    const strip = el('div', { class: 'lfx-spot-strip' }, ...deck.map((x) => el('img', { src: imgSize(x.img, '300x300'), alt: '', decoding: 'async', loading: 'eager' })));
    reel.append(strip);
    // a capa grande já vai baixando enquanto a roleta gira
    const big = el('img', { class: 'lfx-spot-cover', src: imgSize(pick.img, '500x500'), alt: '', decoding: 'async', loading: 'eager', fetchpriority: 'high' });
    const land = () => {
      // só a rodada atual pousa (um "Sortear outro" rápido não mistura resultados)
      if (!card.isConnected || card.lfxTurn !== turn || card.dataset.landed === String(turn)) return;
      card.dataset.landed = String(turn);
      reel.replaceChildren(big);
      info.textContent = '';
      info.append(
        el('a', { class: 'lfx-spot-title', href: pick.path, text: pick.title, onclick: () => closeSpotlight() }),
        el('a', { class: 'lfx-spot-artist', href: pick.artistPath, text: pick.artist, onclick: () => closeSpotlight() }),
        el('div', { class: 'lfx-spot-meta', text: [pick.kind === 'track' ? 'Faixa' : 'Álbum', pick.section, pick.context].filter(Boolean).join(' · ') }),
        el('div', { class: 'lfx-spot-actions' },
          el('a', { class: 'lfx-spot-btn lfx-spot-btn--main', href: serviceUrl(preferred(), `${pick.artist} ${pick.title}`, pick), target: '_blank', rel: 'noopener noreferrer', html: ICON.play }, `Ouvir no ${SERVICES[preferred()][0]}`),
          laterButton({ kind: pick.kind, path: pick.path, title: pick.title, artist: pick.artist, img: pick.img }, 'lfx-spot-btn lfx-hc-btn'),
          el('button', { class: 'lfx-spot-btn', type: 'button', html: ICON.shuffle, onclick: () => spin(pool, reel, card) }, 'Sortear outro')));
      requestAnimationFrame(() => info.classList.add('lfx-show'));
      card.style.setProperty('--lfx-spot-c', 'var(--lfx-accent)');
      colorOf(pick.img).then((c) => { if (c?.vibrant && card.isConnected) card.style.setProperty('--lfx-spot-c', toAccent(c.vibrant)); }).catch(() => {});
    };
    if (!motion) { land(); return; }
    strip.style.setProperty('--n', String(deck.length - 1));
    strip.addEventListener('animationend', land, { once: true });
    setTimeout(land, 2600);
  }
  function closeSpotlight(now = false) {
    const s = disc.spot;
    if (!s) return;
    disc.spot = null;
    if (now) { s.remove(); return; }
    s.classList.remove('lfx-open');
    setTimeout(() => s.remove(), 300);
  }

  /* ================================================================ *
   * Ciclo de vida
   * ================================================================ */
  let ready = false;
  let lastUrl = '';
  let pageNode = null;
  function markEnter() {
    // A folha da página (#mantle_skin) é trocada a cada navegação; o primeiro
    // div de #content é um espaçador vazio e não serve de alvo.
    const node = $('#mantle_skin, #content > .adaptive-skin-container');
    if (!node || node === pageNode) return;
    pageNode = node;
    if (!root.classList.contains('lfx-motion')) return;
    node.classList.add('lfx-enter');
    setTimeout(() => node.classList.remove('lfx-enter'), 1700);
  }
  /* Marca ao lado do logo: "PRIME" (Unbounded, com brilho correndo) e "by Perereko" com o link do autor. */
  const BRAND_URL = 'https://s2.rip/senhor_perereko';
  function ensureBrand() {
    const logo = $('.masthead-logo');
    if (!logo) return;
    const cur = $('.lfx-brand');
    if (cur && cur.previousElementSibling === logo) return;
    cur?.remove();
    const prime = el('span', { class: 'lfx-prime', text: 'PRIME' });
    logo.after(el('div', { class: 'lfx-brand lfx-layer' }, prime,
      el('a', { class: 'lfx-by', href: BRAND_URL, target: '_blank', rel: 'noopener noreferrer', title: 'Conheça o site do Perereko' }, 'by Perereko')));
  }
  function interceptSearchToggle() {
    const toggle = $('.masthead-search-toggle');
    if (!toggle || toggle.dataset.lfx) return;
    toggle.dataset.lfx = '1';
    toggle.addEventListener('click', (e) => {
      if (!S.enabled || !S.palette || e.shiftKey) return;
      e.preventDefault(); e.stopImmediatePropagation();
      openPalette();
    }, true);
  }
  /* Campos de busca da própria página (resultados de busca): abrem a busca central. */
  function interceptPageSearch() {
    for (const input of $$('#content form input[name="q"]:not([data-lfx-q])')) {
      input.dataset.lfxQ = '1';
      const open = (e) => {
        if (!S.enabled || !S.palette) return;
        e.preventDefault();
        input.blur();
        openPalette(input.value || '');
      };
      input.addEventListener('pointerdown', open);
      input.addEventListener('focus', (e) => { if (input.matches(':focus-visible')) open(e); });
    }
  }
  function teardown() {
    hideHc();
    teardownSocial();
    stopSocialHub(); stopDoppel(); stopShows();
    $$('.lfx-catalog, .lfx-cat-navitem, .lfx-hubnav, .lfx-loader, .lfx-sh, .lfx-dop, .lfx-shw').forEach((n) => n.remove());
    cat.ctrl?.abort(); cat.recsCtrl?.abort(); prem.ctrl?.abort(); prem.fillCtrl?.abort(); prem.fillCtrl = null;
    cat.node = null; prem.node = null; hub.node = null; hub.view = null;
    root.classList.remove('lfx-cat-on', 'lfx-searching', 'lfx-profile');
    $$('[data-lfx-cat-hidden]').forEach((n) => n.removeAttribute('data-lfx-cat-hidden'));
    $$('.lfx-cat-dim').forEach((n) => n.classList.remove('lfx-cat-dim'));
    closeMatch();
    $$('.lfx-listen, .lfx-hero-cover, .lfx-toolbar, .lfx-insights, .lfx-tabs, .lfx-match-btn, .lfx-home, .lfx-home-h2, .lfx-mine').forEach((n) => n.remove());
    $$('.lfx-has-cover').forEach((n) => n.classList.remove('lfx-has-cover'));
    $$('table.lfx-gridmode').forEach((t) => t.classList.remove('lfx-gridmode'));
    $$('[data-lfx-tools]').forEach((t) => delete t.dataset.lfxTools);
    side?.remove(); side = null;
    topSearch?.remove(); topSearch = null;
    mini?.remove(); mini = null; miniIO?.disconnect(); miniTarget = null;
    topBtn?.remove(); topBtn = null;
    $$('.lfx-brand').forEach((n) => n.remove());
    teardownDiscover();
    clearInterval(np.timer);
    root.style.removeProperty('--lfx-accent'); root.style.removeProperty('--lfx-glow');
  }

  let running = false, again = false;
  async function refresh(force = false) {
    if (running) { again = true; return; }
    running = true;
    try {
      const urlChanged = location.href !== lastUrl;
      if (urlChanged) { lastUrl = location.href; lastArt = null; openMenuClose?.(); hideHc(); closeSpotlight(true); closeMatch(); }
      if (!S.enabled) { teardown(); return; }
      const before = me?.name;
      await readMe();
      consumeCatalogFlag();
      const p = getPage();
      markEnter();
      renderSidebar();
      renderTopSearch();
      if (force || before !== me?.name || !np.timer) startNowPlaying();
      renderNowPlaying();
      enhanceHero(p);
      enhanceTabs(p);
      enhanceMatch(p);
      enhanceProfile(p);
      enhanceRecs();
      enhanceHome(p);
      ensureBrand();
      interceptSearchToggle();
      interceptPageSearch();
      ensureCatalogTab(p);
      renderCatalog();
      enhanceSocial(p);
      enhanceDiscover(p);
      if (S.shows && me) maybeAutoShows().catch(() => {}); // novidades de shows dos seus artistas, em segundo plano (a cada 12 h)
      ensureTopButton();
      enhanceMini(p);
      if (force) lastArt = null;
      updateColors(p);
      await enhanceTables(p);
      alignTwoLineLists();
      collapseEmptySidebars();
      if (urlChanged) recordVisit(p);
      onScroll();
    } finally {
      running = false;
      if (again) { again = false; setTimeout(() => refresh(), 60); }
    }
  }

  let moTimer = 0;
  function watch() {
    const target = $('#content') || document.body;
    const mo = new MutationObserver((muts) => {
      const relevant = muts.some((m) => [...m.addedNodes].some((n) => n.nodeType === 1 && !String(n.className || '').includes('lfx-')));
      if (!relevant) return;
      clearTimeout(moTimer);
      moTimer = setTimeout(() => refresh(), 90);
    });
    mo.observe(target, { childList: true, subtree: true });
    window.addEventListener('popstate', () => setTimeout(() => refresh(), 60));
  }
  function start() {
    if (ready) return;
    ready = true;
    if (!$('.lfx-progress')) root.appendChild(el('div', { class: 'lfx-progress', 'aria-hidden': 'true' }));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('keydown', onKey, true);
    // Balões
    document.addEventListener('pointerover', onHcOver, { passive: true });
    document.addEventListener('pointermove', onHcMove, { passive: true });
    document.addEventListener('pointerdown', (e) => { if (hc.node && !hc.node.contains(e.target)) hideHc(); }, true);
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && hc.node) scheduleHideHc(400); });
    window.addEventListener('scroll', () => { if (hc.node) hideHc(); else if (hc.timer) { clearTimeout(hc.timer); hc.timer = 0; hc.anchor = null; } }, { passive: true });
    window.addEventListener('blur', hideHc);
    // Catálogo: a aba abre sem recarregar e o "voltar" do navegador fecha
    document.addEventListener('click', (e) => {
      const a = e.target.closest?.('a.lfx-cat-link');
      if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      openView(a.dataset.view || 'catalogo');
    }, true);
    window.addEventListener('hashchange', () => refresh());
    // As abas do site medem a largura dos itens para decidir o que vai para "Mais…";
    // quando a fonte Geist termina de carregar as larguras mudam, então pedimos uma nova medida.
    document.fonts?.ready?.then(() => window.dispatchEvent(new Event('resize'))).catch(() => {});
    watch();
    refresh();
    // faxina do cache quando a página já estiver tranquila
    setTimeout(() => (window.requestIdleCallback || ((f) => setTimeout(f, 0)))(() => pruneCache(), { timeout: 5000 }), 4000);
  }

  injectFonts();
  loadSettings();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();

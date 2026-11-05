'use strict';
/* Roda junto da página do Last.fm (mundo isolado, sem acesso ao Node).
 * - Leva para o app os cliques em links do Spotify (o app toca direto no seu Spotify).
 * - Conta as faixas da página para o botão de playlist e diz quem está logado.
 * - Executa a pedido do app: listar as faixas da página e curtir/descurtir no Last.fm. */
const { ipcRenderer } = require('electron');

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const txt = (n) => (n ? (n.getAttribute?.('title') || n.textContent || '').replace(/\s+/g, ' ').trim() : '');
const nameOf = (n) => (n ? (n.textContent || '').replace(/\s+/g, ' ').trim() || n.getAttribute?.('title') || '' : '');
const decodePart = (s) => { try { return decodeURIComponent(String(s).replace(/\+/g, ' ')); } catch (_) { return s; } };
const stripLang = (p) => p.replace(/^\/[a-z]{2}(?=\/)/, '');

/* ---------------- Links do Spotify ---------------- */
const SPOTIFY = /^(https:\/\/open\.spotify\.com\/|spotify:)/i;
function contextOf(a) {
  // Sem informação no link (links do próprio site): tenta pela linha ou cartão em volta
  const row = a.closest('tr.chartlist-row, .column-tracks-item, .music-releases-item, .grid-items-item, li');
  if (!row) return null;
  const title = nameOf($('.chartlist-name a, [class$="-item-name"] a, .grid-items-item-main-text a', row));
  const artist = nameOf($('.chartlist-artist a, [class$="-item-artist"] a, .grid-items-item-aux-text a', row));
  return title ? { title, artist } : null;
}
// Clique na página do Last.fm: com o painel do player aberto, ele se recolhe e o Last.fm volta ao foco
// (registrado antes de tudo, para valer até nos links que o app trata, como os do Spotify)
window.addEventListener('click', (e) => { if (e.button === 0) ipcRenderer.send('lf:outside'); }, true);
window.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0) return;
  const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
  if (!a) return;
  const href = a.href || a.getAttribute('href') || '';
  if (!SPOTIFY.test(href)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  ipcRenderer.send('lf:spotify-link', { href, context: contextOf(a), page: stripLang(location.pathname) });
}, true);

// Avisa o app que você clicou ou digitou: só assim um link pode abrir algo fora do app
let lastSent = 0;
const gesture = () => { const t = Date.now(); if (t - lastSent > 500) { lastSent = t; ipcRenderer.send('lf:gesture'); } };
window.addEventListener('pointerdown', gesture, true);
window.addEventListener('keydown', gesture, true);

/* ---------------- Página atual ---------------- */
function currentUser() {
  const prof = $('.auth-dropdown-profile, a.auth-link[href*="/user/"]');
  const m = stripLang(prof?.getAttribute('href') || '').match(/^\/user\/([^/?#]+)/);
  if (m) return decodePart(m[1]);
  if ($('.site-auth--anon, .masthead .join-cta-button')) return '';
  return null; // ainda não dá para saber
}
function pageArtist() {
  // Página de álbum: o artista está na "migalha" do topo; página de artista: no título
  const crumb = $('.header-new-crumb span, .header-new-crumb');
  if (crumb && nameOf(crumb)) return nameOf(crumb);
  const m = stripLang(location.pathname).match(/^\/music\/([^/]+)/);
  return m ? decodePart(m[1]) : '';
}
function collectTracks() {
  const pa = pageArtist();
  const seen = new Set();
  const tracks = [];
  const push = (artist, title) => {
    artist = (artist || '').trim(); title = (title || '').trim();
    if (!artist || !title) return;
    const k = `${artist.toLowerCase()}\u0001${title.toLowerCase()}`;
    if (seen.has(k)) return;
    seen.add(k); tracks.push({ artist, title });
  };
  for (const row of $$('#content tr.chartlist-row')) {
    const name = $('.chartlist-name a', row);
    if (!name) continue;
    push(nameOf($('.chartlist-artist a', row)) || pa, nameOf(name));
  }
  for (const it of $$('#content .column-tracks-item')) push(nameOf($('.column-tracks-item-artist a', it)), nameOf($('.column-tracks-item-name a', it)));
  const albums = [];
  if (tracks.length < 3) {
    const aseen = new Set();
    for (const a of $$('#content a[href^="/music/"], #content a[href*="last.fm/music/"]')) {
      if (a.closest('.masthead, nav, header, .lfx-side, .lfx-palette, .lfx-hc')) continue;
      const p = stripLang(new URL(a.href, location.href).pathname);
      const m = p.match(/^\/music\/([^/]+)\/([^/]+)\/?$/);
      if (!m || m[2] === '_' || m[2].startsWith('+')) continue;
      const k = p.toLowerCase();
      if (aseen.has(k)) continue;
      aseen.add(k);
      albums.push({ artist: decodePart(m[1]), title: decodePart(m[2]) });
      if (albums.length >= 10) break;
    }
  }
  const title = document.title.replace(/\s*\|\s*Last\.fm\s*$/i, '').trim();
  return { title, url: location.href, tracks: tracks.slice(0, 100), albums };
}

let reportTimer = 0;
let lastReport = '';
function report() {
  clearTimeout(reportTimer);
  reportTimer = setTimeout(() => {
    const n = $$('#content tr.chartlist-row .chartlist-name a').length + $$('#content .column-tracks-item').length;
    const info = { user: currentUser(), title: document.title.replace(/\s*\|\s*Last\.fm\s*$/i, ''), url: location.href, tracks: n };
    if (/\/api\/account/i.test(location.pathname)) info.apiKeys = apiKeys();
    const key = JSON.stringify(info);
    if (key === lastReport) return;
    lastReport = key;
    ipcRenderer.send('lf:page', info);
  }, 400);
}
// Marca a página o quanto antes (o tema do Hub esconde a própria marca, que já está na barra do app)
function markApp() { if (document.documentElement) { document.documentElement.dataset.lfxApp = 'spotify'; return true; } return false; }
if (!markApp()) {
  const mo = new MutationObserver(() => { if (markApp()) mo.disconnect(); });
  mo.observe(document, { childList: true });
}
function boot() {
  markApp();
  report();
  const content = $('#content') || document.body;
  if (content) new MutationObserver(report).observe(content, { childList: true, subtree: true });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
window.addEventListener('pageshow', report);

/* ---------------- Pedidos do app ---------------- */
const enc = (s) => encodeURIComponent(String(s || '')).replace(/%20/g, '+');

/** Curtir/descurtir no Last.fm usando o próprio formulário do site (com o token de segurança dele) */
async function love({ artist, title, on }) {
  const res = await fetch(`/music/${enc(artist)}/_/${enc(title)}`, { credentials: 'include' });
  if (!res.ok) return { ok: false, why: res.status === 404 ? 'notfound' : 'page' };
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  const forms = Array.from(doc.querySelectorAll('form[action$="/loved"], form[action*="/loved?"]'));
  if (!forms.length) return { ok: false, why: doc.querySelector('.site-auth--anon, .join-cta-button') ? 'login' : 'noform' };
  const want = on ? 'love' : 'unlove';
  for (const f of forms) {
    const holder = f.querySelector('[data-toggle-button-current-state]') || f.closest('[data-toggle-button-current-state]');
    const state = holder?.getAttribute('data-toggle-button-current-state') || '';
    if (state && (state === 'loved') === on) return { ok: true, already: true };
    for (const b of f.querySelectorAll('button')) {
      const act = `${b.getAttribute('data-analytics-action') || ''} ${b.value || ''} ${b.getAttribute('data-type') || ''}`.toLowerCase();
      const isUn = /unlove/.test(act);
      const isLove = /love/.test(act) && !isUn;
      if (!(isUn || isLove)) continue;
      if ((want === 'love') !== isLove) { if (!state) return { ok: true, already: true }; continue; }
      const fd = new FormData(f);
      if (b.name && !fd.has(b.name)) fd.append(b.name, b.value);
      const action = new URL(f.getAttribute('action'), location.origin).toString();
      const r = await fetch(action, { method: 'POST', body: fd, credentials: 'include', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      return { ok: r.ok, why: r.ok ? '' : `http${r.status}` };
    }
  }
  return { ok: false, why: 'nobutton' };
}

/** Conversa com o tema (extensão Last.fm Hub) por eventos da página: os dois rodam em mundos isolados */
function askExtension(msg, timeout = 4000) {
  return new Promise((resolve) => {
    const rid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const done = (r) => { clearTimeout(t); document.removeEventListener('lfx:app-reply', onReply); resolve(r); };
    const onReply = (ev) => { let r; try { r = JSON.parse(ev.detail); } catch (_) { return; } if (r && r.id === rid) done(r); };
    const t = setTimeout(() => done(null), timeout);
    document.addEventListener('lfx:app-reply', onReply);
    document.dispatchEvent(new CustomEvent('lfx:app', { detail: JSON.stringify({ ...msg, id: rid }) }));
  });
}
/** Chave e segredo da API do Last.fm mostrados na página da sua conta de API */
function apiKeys() {
  const t = (document.body && document.body.innerText) || '';
  const key = t.match(/API key\s*:?\s*([0-9a-f]{32})/i);
  const sec = t.match(/Shared secret\s*:?\s*([0-9a-f]{32})/i);
  return key && sec ? { key: key[1].toLowerCase(), secret: sec[1].toLowerCase() } : null;
}

ipcRenderer.on('lf:ask', async (_e, { id, what, data }) => {
  let result = null;
  try {
    if (what === 'collect') result = collectTracks();
    else if (what === 'love') result = await love(data);
    else if (what === 'user') result = currentUser();
    else if (what === 'ext') result = await askExtension(data || {});
    else if (what === 'apikeys') result = apiKeys();
  } catch (err) { result = { ok: false, why: String(err && err.message || err) }; }
  ipcRenderer.send('lf:reply', { id, result });
});

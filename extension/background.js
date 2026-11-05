/* Last.fm Hub — service worker
 * Calcula a cor dominante e a cor "vibrante" das capas e fotos. A página do
 * Last.fm não pode ler os pixels dessas imagens (o servidor de imagens não
 * libera CORS), mas a extensão pode, graças à permissão de host.
 */
'use strict';

// Mesmos padrões de content/app.js e popup/popup.js
const DEFAULTS = {
  enabled: true, accentMode: 'auto', accent: '#b8a4ff', animations: true, wide: false,
  ambient: true, hideAds: true, sidebar: true, sideCollapsed: false, nowPlaying: true,
  homeDash: true, miniHeader: true, artistTabs: true, palette: true, listen: true,
  service: 'spotify', heroCover: true, listTools: true, stats: true, shortcuts: true, backToTop: true,
  hoverCards: true, social: true, catalog: true, premium: true, discover: true,
  match: true, socialHub: true, doppel: true, shows: true, lite: false,
};

// Na instalação e nas atualizações, completa as opções novas sem mexer nas que já existem
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install' || reason === 'update') {
    // (onde o navegador não tem "sync", como no app Last.fm + Spotify, as opções ficam no "local")
    const area = await chrome.storage.sync.get(null).then(() => chrome.storage.sync, () => chrome.storage.local);
    const current = await area.get(Object.keys(DEFAULTS));
    await area.set({ ...DEFAULTS, ...current });
  }
});

const memo = new Map();
const CACHE_KEY = 'lfx:colors';
const CACHE_MAX = 400;
const ALLOWED_HOST = /(^|\.)freetls\.fastly\.net$|(^|\.)last\.fm$/;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'lfx:color' && typeof msg.url === 'string') { colorFor(msg.url).then(sendResponse, () => sendResponse(null)); return true; }
  // Shows (agenda do Last.fm): o mapa precisa de coordenadas dos locais, que o Last.fm não publica
  if (msg && msg.type === 'lfx:geocode' && Array.isArray(msg.queries)) { geocodeMany(msg.queries).then(sendResponse, () => sendResponse({})); return true; }
  if (msg && msg.type === 'lfx:tile' && typeof msg.url === 'string') { tileData(msg.url).then(sendResponse, () => sendResponse(null)); return true; }
  return false;
});

/* ------------------------------------------------------------------ *
 * Shows: coordenadas dos locais para o mapa da agenda (OpenStreetMap / Nominatim)
 * Uma consulta por segundo (regra de uso do Nominatim) e tudo fica guardado,
 * então cada casa de show é procurada uma vez só.
 * ------------------------------------------------------------------ */
const GEO_KEY = 'lfx:geo';
const GEO_MAX = 1500;
let geoChain = Promise.resolve();
let geoLast = 0;
const geoNorm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
async function geocodeMany(queries) {
  const list = [...new Set(queries.map((q) => String(q || '').trim()).filter(Boolean))].slice(0, 40);
  const store = (await chrome.storage.local.get(GEO_KEY))[GEO_KEY] || {};
  const test = (await chrome.storage.local.get('lfx:test:geo'))['lfx:test:geo'] || null;
  const out = {};
  let changed = false;
  for (const q of list) {
    const k = geoNorm(q);
    if (store[k] !== undefined) { out[q] = store[k]; continue; }
    let hit = null;
    if (test) hit = test[q] || test[k] || null;
    else hit = await (geoChain = geoChain.then(() => nominatim(q), () => nominatim(q)));
    store[k] = hit ? { lat: hit.lat, lon: hit.lon, t: Date.now() } : null;
    out[q] = store[k];
    changed = true;
  }
  if (changed) {
    const keys = Object.keys(store);
    if (keys.length > GEO_MAX) keys.slice(0, keys.length - GEO_MAX).forEach((x) => delete store[x]);
    await chrome.storage.local.set({ [GEO_KEY]: store });
  }
  return out;
}
async function nominatim(q) {
  const wait = geoLast + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  geoLast = Date.now();
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`, { credentials: 'omit', headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const j = await res.json();
    const r = Array.isArray(j) && j[0];
    if (!r) return null;
    const lat = parseFloat(r.lat), lon = parseFloat(r.lon);
    return isNaN(lat) || isNaN(lon) ? null : { lat, lon };
  } catch (_) { return null; }
}

/* Blocos do mapa (quando a página não deixa carregar direto): o serviço baixa e devolve como data: URL */
const tileMemo = new Map();
async function tileData(url) {
  let u;
  try { u = new URL(url); } catch (_) { return null; }
  if (u.protocol !== 'https:' || !/(^|\.)basemaps\.cartocdn\.com$/.test(u.hostname)) return null;
  if (tileMemo.has(u.href)) return tileMemo.get(u.href);
  const res = await fetch(u.href, { credentials: 'omit' });
  if (!res.ok) return null;
  const buf = new Uint8Array(await res.arrayBuffer());
  let bin = '';
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  const out = `data:${res.headers.get('content-type') || 'image/png'};base64,${btoa(bin)}`;
  if (tileMemo.size > 300) tileMemo.delete(tileMemo.keys().next().value);
  tileMemo.set(u.href, out);
  return out;
}

async function colorFor(url) {
  let u;
  try { u = new URL(url); } catch (_) { return null; }
  if (u.protocol !== 'https:' || !ALLOWED_HOST.test(u.hostname)) return null;
  const key = u.pathname.split('/').pop();
  if (memo.has(key)) return memo.get(key);

  const stored = (await chrome.storage.local.get(CACHE_KEY))[CACHE_KEY] || {};
  if (stored[key]) { memo.set(key, stored[key].c); return stored[key].c; }

  const res = await fetch(u.href, { credentials: 'omit' });
  if (!res.ok) return null;
  const blob = await res.blob();
  const bmp = await createImageBitmap(blob, { resizeWidth: 56, resizeHeight: 56, resizeQuality: 'medium' });
  const canvas = new OffscreenCanvas(56, 56);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, 56, 56);
  bmp.close?.();
  const result = analyse(ctx.getImageData(0, 0, 56, 56).data);

  memo.set(key, result);
  stored[key] = { c: result, t: Date.now() };
  const keys = Object.keys(stored);
  if (keys.length > CACHE_MAX) {
    keys.sort((a, b) => stored[a].t - stored[b].t).slice(0, keys.length - CACHE_MAX).forEach((k) => delete stored[k]);
  }
  chrome.storage.local.set({ [CACHE_KEY]: stored });
  return result;
}

/* Agrupa os pixels em "baldes" de cor (4 bits por canal) e escolhe:
 *  - dominante: o balde com mais pixels;
 *  - vibrante: o balde que melhor equilibra quantidade, saturação e brilho médio.
 * Fotos em preto e branco não têm cor vibrante; nesse caso a extensão usa a
 * cor de destaque escolhida no popup. */
function analyse(px) {
  const buckets = new Map();
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 128) continue;
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const k = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    let bk = buckets.get(k);
    if (!bk) { bk = { n: 0, r: 0, g: 0, b: 0 }; buckets.set(k, bk); }
    bk.n++; bk.r += r; bk.g += g; bk.b += b;
  }
  let dominant = null, dn = -1, vibrant = null, vs = 0;
  for (const bk of buckets.values()) {
    const rgb = [bk.r / bk.n, bk.g / bk.n, bk.b / bk.n];
    if (bk.n > dn) { dn = bk.n; dominant = rgb; }
    const [, s, l] = hsl(rgb);
    if (s < .22 || l < .12 || l > .9) continue;
    const score = bk.n * s * s * (1 - Math.abs(l - .5) * 1.3);
    if (score > vs) { vs = score; vibrant = rgb; }
  }
  // Exige uma presença mínima para não pegar um detalhe minúsculo.
  if (vibrant && vs < 1.2) vibrant = null;
  const round = (c) => c && c.map((v) => Math.round(v));
  return { dominant: round(dominant), vibrant: round(vibrant) };
}

function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > .5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

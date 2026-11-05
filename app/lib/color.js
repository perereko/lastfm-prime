'use strict';
/* Cor da capa que está tocando: agrupa os pixels em "baldes" e escolhe a cor dominante e a mais vibrante.
 * Mesmo método do Last.fm Hub, para o app e o tema combinarem. Recebe pixels BGRA (nativeImage.toBitmap). */

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  if (!s) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const f = (t) => { t = (t + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
}

function analyse(px, order = 'bgra') {
  const buckets = new Map();
  const [ri, gi, bi] = order === 'rgba' ? [0, 1, 2] : [2, 1, 0];
  for (let i = 0; i + 3 < px.length; i += 4) {
    if (px[i + 3] < 128) continue;
    const r = px[i + ri], g = px[i + gi], b = px[i + bi];
    const k = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    let bk = buckets.get(k);
    if (!bk) { bk = { n: 0, r: 0, g: 0, b: 0 }; buckets.set(k, bk); }
    bk.n++; bk.r += r; bk.g += g; bk.b += b;
  }
  let dom = null, vib = null, vibScore = 0;
  for (const bk of buckets.values()) {
    const c = [bk.r / bk.n, bk.g / bk.n, bk.b / bk.n].map(Math.round);
    if (!dom || bk.n > dom.n) dom = { n: bk.n, c };
    const [, s, l] = rgbToHsl(...c);
    if (s < 0.28 || l < 0.16 || l > 0.9) continue;
    const score = Math.sqrt(bk.n) * (s * 1.6) * (1 - Math.abs(l - 0.52) * 1.4);
    if (score > vibScore) { vibScore = score; vib = c; }
  }
  return { dominant: dom?.c || null, vibrant: vib };
}

/** Cor de destaque legível sobre preto */
function accentOf(rgb) {
  if (!rgb) return null;
  const [h, s, l] = rgbToHsl(...rgb);
  const [r, g, b] = hslToRgb(h, Math.min(0.95, Math.max(0.5, s)), Math.min(0.78, Math.max(0.64, l)));
  return `rgb(${r}, ${g}, ${b})`;
}
/** Brilho de fundo (escuro, saturado) */
function glowOf(rgb) {
  if (!rgb) return null;
  const [h, s] = rgbToHsl(...rgb);
  const [r, g, b] = hslToRgb(h, Math.min(0.85, s * 0.9 + 0.1), 0.3);
  return `rgb(${r}, ${g}, ${b})`;
}

module.exports = { analyse, accentOf, glowOf, rgbToHsl };

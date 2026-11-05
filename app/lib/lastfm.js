'use strict';
/* Leitura do Last.fm do lado do app: só o necessário para conferir os scrobbles. */

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function decode(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
      return ENT[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** Linhas da lista parcial de scrobbles recentes (/user/NOME/partial/recenttracks) */
function parseRecent(html) {
  const rows = [];
  const re = /<tr\b[^>]*\bclass="([^"]*\bchartlist-row\b[^"]*)"[^>]*>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = re.exec(String(html || ''))) && rows.length < 6) {
    const cls = m[1], body = m[2];
    const name = body.match(/class="[^"]*\bchartlist-name\b[^"]*"[^>]*>[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/);
    const artist = body.match(/class="[^"]*\bchartlist-artist\b[^"]*"[^>]*>[\s\S]*?<a\b[^>]*>([\s\S]*?)<\/a>/);
    if (!name) continue;
    rows.push({ live: /chartlist-row--now-scrobbling/.test(cls), title: decode(name[1]), artist: decode(artist?.[1] || '') });
  }
  return rows;
}

module.exports = { parseRecent, decode };

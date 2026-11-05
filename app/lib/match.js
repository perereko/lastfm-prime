'use strict';
/* Comparação de nomes entre o Last.fm e o Spotify.
 * O Last.fm guarda o nome como o serviço mandou ("Karma Police - Remastered 2011"),
 * e as páginas do Hub às vezes trazem só o nome curto. Então comparamos em níveis. */

const EXTRA = /(remaster(ed)?|live|ao vivo|version|versao|edit|mix|mono|stereo|deluxe|edition|edicao|bonus|demo|acoustic|acustico|instrumental|anniversary|expanded|single|radio|explicit|clean|feat|ft|with)/;

function base(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[’`´]/g, "'")
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9']+/g, ' ')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tira o que vem entre parênteses/colchetes ou depois de " - " quando é só detalhe de versão. */
function core(s) {
  let t = String(s || '');
  t = t.replace(/\s*[([][^)\]]*[)\]]/g, (m) => (EXTRA.test(base(m)) ? '' : m));
  t = t.replace(/\s+[-–—]\s+(.*)$/, (m, rest) => (EXTRA.test(base(rest)) ? '' : m));
  return base(t);
}

function artistKey(s) { return base(s).replace(/^the /, ''); }

/** 0 a 3: 3 = igual, 2 = igual sem detalhes de versão, 1 = um contém o outro, 0 = diferente */
function nameScore(a, b) {
  const x = base(a), y = base(b);
  if (!x || !y) return 0;
  if (x === y) return 3;
  const cx = core(a), cy = core(b);
  if (cx && cx === cy) return 2;
  if (cx.length > 3 && cy.length > 3 && (cx.includes(cy) || cy.includes(cx))) return 1;
  return 0;
}

function artistScore(want, names) {
  const w = artistKey(want);
  if (!w) return 1;
  let best = 0;
  for (const n of names || []) {
    const k = artistKey(n);
    if (k === w) return 3;
    if (k && (k.includes(w) || w.includes(k))) best = Math.max(best, 1);
  }
  return best;
}

/** Escolhe o melhor resultado da busca do Spotify para o que o Last.fm mostrou. */
function bestTrack(items, artist, title) {
  let best = null, bestScore = -1;
  (items || []).forEach((t, i) => {
    if (!t) return;
    const a = artistScore(artist, (t.artists || []).map((x) => x.name));
    const n = nameScore(title, t.name);
    if (!n || (artist && !a)) return;
    // peso maior para o nome; desempata pela ordem do Spotify (que já considera popularidade)
    const s = n * 10 + a * 6 - i * 0.3 + (/live|ao vivo/.test(base(t.name)) && !/live|ao vivo/.test(base(title)) ? -4 : 0);
    if (s > bestScore) { bestScore = s; best = t; }
  });
  return best;
}

function bestAlbum(items, artist, title) {
  let best = null, bestScore = -1;
  (items || []).forEach((al, i) => {
    if (!al) return;
    const a = artistScore(artist, (al.artists || []).map((x) => x.name));
    const n = nameScore(title, al.name);
    if (!n || (artist && !a)) return;
    const typeBonus = al.album_type === 'album' ? 2 : al.album_type === 'single' ? 0.5 : 0;
    const s = n * 10 + a * 6 + typeBonus - i * 0.3;
    if (s > bestScore) { bestScore = s; best = al; }
  });
  return best;
}

function bestArtist(items, name) {
  let best = null, bestScore = -1;
  (items || []).forEach((ar, i) => {
    if (!ar) return;
    const n = artistScore(name, [ar.name]);
    if (!n) return;
    const s = n * 10 - i * 0.5;
    if (s > bestScore) { bestScore = s; best = ar; }
  });
  return best;
}

/** O Last.fm está mostrando a mesma música que o Spotify toca? */
function sameTrack(lf, sp) {
  if (!lf || !sp) return false;
  return nameScore(lf.title, sp.name) >= 1 && artistScore(lf.artist, sp.artists) >= 1;
}

/** Endereço do Last.fm para artista/álbum/faixa (o site usa + no lugar de espaço). */
function lfName(s) { return encodeURIComponent(String(s || '')).replace(/%20/g, '+'); }
function lfUrl(kind, artist, title) {
  const root = 'https://www.last.fm/music/' + lfName(artist);
  if (kind === 'artist' || !title) return root;
  return kind === 'track' ? `${root}/_/${lfName(title)}` : `${root}/${lfName(title)}`;
}

/** Filtros de campo da busca do Spotify não aceitam aspas e dois-pontos soltos. */
function clean(s) { return String(s || '').replace(/[":]/g, ' ').replace(/\s+/g, ' ').trim(); }

module.exports = { base, core, nameScore, artistScore, bestTrack, bestAlbum, bestArtist, sameTrack, lfUrl, lfName, clean };

'use strict';
/* Web player do Spotify simulado: mesma estrutura de marcadores (data-testid) e Media Session do real,
 * navegação de página única (history), busca, álbum, artista, faixa e uma barra de player que "toca". */
const http = require('http');
const fs = require('fs');
const path = require('path');

const pad = (s) => (s + '0'.repeat(22)).slice(0, 22);
const CAT = {
  artists: [
    { id: pad('art1Radiohead'), name: 'Radiohead' },
    { id: pad('art2Gojira'), name: 'Gojira' },
    { id: pad('art3Cynic'), name: 'Cynic' },
    { id: pad('art4Tribute'), name: 'Radiohead Tribute Band' },
  ],
  albums: [
    { id: pad('alb1OKComputer'), name: 'OK Computer', artist: 0, img: 'red' },
    { id: pad('alb2Magma'), name: 'Magma', artist: 1, img: 'blue' },
    { id: pad('alb3Focus'), name: 'Focus', artist: 2, img: 'green' },
    { id: pad('alb4OKLive'), name: 'OK Computer (Live Tribute)', artist: 3, img: 'gold' },
  ],
  tracks: [
    { id: pad('trk1KarmaPolice'), name: 'Karma Police', album: 0, ms: 264000 },
    { id: pad('trk2Paranoid'), name: 'Paranoid Android', album: 0, ms: 383000 },
    { id: pad('trk3Stranded'), name: 'Stranded', album: 1, ms: 271000 },
    { id: pad('trk4Silvera'), name: 'Silvera', album: 1, ms: 213000 },
    { id: pad('trk5Veil'), name: 'Veil of Maya', album: 2, ms: 220000 },
    { id: pad('trk6KarmaLive'), name: 'Karma Police - Live', album: 3, ms: 280000 },
  ],
};

function page(base, ping, noPop) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Spotify – Web Player</title>
<style>body{margin:0;font-family:sans-serif;background:#121212;color:#fff}footer{position:fixed;bottom:0;left:0;right:0;height:90px;background:#000;display:flex;gap:8px;align-items:center}button{min-width:20px;min-height:20px}</style></head>
<body><header id="top"></header><main id="main"></main><footer id="bar" hidden></footer>
<script>
const CAT = ${JSON.stringify(CAT)};
const IMG = (n) => '${base}/img/' + n + '.jpg';
const logged = () => localStorage.getItem('logged') === '1';
const S = { cur: null, ctx: null, playing: false, pos: 0, at: Date.now(), shuffle: false, repeat: 'false', liked: {}, vol: 0.6 };
const log = (ev) => fetch('/__log', { method: 'POST', body: JSON.stringify(ev) });
const T = (i) => CAT.tracks[i];
const albumOf = (t) => CAT.albums[t.album];
const artistOf = (t) => CAT.artists[albumOf(t).artist];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function pos() { return Math.min(T(S.cur).ms, S.pos + (S.playing ? Date.now() - S.at : 0)); }
function fmt(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function play(i, ctx) {
  S.cur = i; S.ctx = ctx || null; S.pos = 0; S.at = Date.now(); S.playing = true;
  const t = T(i), al = albumOf(t), ar = artistOf(t);
  navigator.mediaSession.metadata = new MediaMetadata({ title: t.name, artist: ar.name, album: al.name, artwork: [{ src: IMG(al.img), sizes: '300x300', type: 'image/jpeg' }] });
  navigator.mediaSession.playbackState = 'playing';
  log({ event: 'play', track: t.id, ctx: S.ctx });
  bar();
}
function bar() {
  const b = document.getElementById('bar');
  if (!logged()) { b.hidden = true; return; }
  b.hidden = false;
  const t = S.cur !== null ? T(S.cur) : null;
  const p = t ? pos() : 0;
  b.innerHTML = '<div data-testid="now-playing-widget">' + (t ? '<img src="' + IMG(albumOf(t).img) + '"><a data-testid="context-item-link" href="/track/' + t.id + '">' + esc(t.name) + '</a><a data-testid="context-item-info-artist" href="/artist/' + artistOf(t).id + '">' + esc(artistOf(t).name) + '</a><button data-testid="add-button" aria-checked="' + (!!S.liked[t.id]) + '" aria-label="Save to Your Library"></button>' : '') + '</div>'
    + '<button data-testid="control-button-shuffle" aria-checked="' + S.shuffle + '"></button>'
    + '<button data-testid="control-button-skip-back" ' + (t ? '' : 'disabled') + '></button>'
    + '<button data-testid="control-button-playpause" aria-label="' + (S.playing ? 'Pause' : 'Play') + '" ' + (t ? '' : 'disabled') + '></button>'
    + '<button data-testid="control-button-skip-forward" ' + (t ? '' : 'disabled') + '></button>'
    + '<button data-testid="control-button-repeat" aria-checked="' + S.repeat + '"></button>'
    + '<div data-testid="playback-position">' + fmt(p) + '</div>'
    + '<div data-testid="playback-progressbar"><input type="range" min="0" max="' + (t ? t.ms : 0) + '" step="1000" value="' + p + '"></div>'
    + '<div data-testid="playback-duration">' + (t ? fmt(t.ms) : '0:00') + '</div>'
    + '<div data-testid="volume-bar"><input type="range" min="0" max="1" step="0.01" value="' + S.vol + '"></div>';
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const id = b.dataset.testid;
  if (id === 'control-button-playpause') { if (S.playing) { S.pos = pos(); S.playing = false; navigator.mediaSession.playbackState = 'paused'; log({ event: 'pause' }); } else { S.at = Date.now(); S.playing = true; navigator.mediaSession.playbackState = 'playing'; log({ event: 'resume' }); } bar(); }
  if (id === 'control-button-skip-forward') { const order = S.ctx && S.ctx.startsWith('album:') ? CAT.tracks.map((t, i) => i).filter((i) => CAT.albums[T(i).album].id === S.ctx.slice(6)) : CAT.tracks.map((t, i) => i); const k = order.indexOf(S.cur); play(order[(k + 1) % order.length], S.ctx); log({ event: 'next' }); }
  if (id === 'control-button-skip-back') { play(S.cur, S.ctx); log({ event: 'prev' }); }
  if (id === 'control-button-shuffle') { S.shuffle = !S.shuffle; bar(); log({ event: 'shuffle', on: S.shuffle }); }
  if (id === 'control-button-repeat') { S.repeat = S.repeat === 'false' ? 'true' : S.repeat === 'true' ? 'mixed' : 'false'; bar(); log({ event: 'repeat', state: S.repeat }); }
  if (id === 'add-button') { const t = T(S.cur); S.liked[t.id] = !S.liked[t.id]; bar(); log({ event: 'like', track: t.id, on: S.liked[t.id] }); }
  if (id === 'play-button') {
    const row = b.closest('[data-testid="tracklist-row"]');
    if (row) { const i = CAT.tracks.findIndex((t) => t.id === row.dataset.id); play(i, row.dataset.ctx || null); return; }
    const card = b.closest('[data-testid="top-result-card"]');
    if (card) { play(Number(card.dataset.i), null); return; }
    const kind = location.pathname.split('/')[1], id2 = location.pathname.split('/')[2];
    if (kind === 'album') { const i = CAT.tracks.findIndex((t) => CAT.albums[t.album].id === id2); play(i, 'album:' + id2); }
    if (kind === 'artist') { const i = CAT.tracks.findIndex((t) => artistOf(t).id === id2); play(i, 'artist:' + id2); }
    if (kind === 'track') { const i = CAT.tracks.findIndex((t) => t.id === id2); play(i, null); }
  }
});
document.addEventListener('input', (e) => {
  const box = e.target.closest('[data-testid]'); if (!box) return;
  if (box.dataset.testid === 'playback-progressbar') { S.pos = Number(e.target.value); S.at = Date.now(); log({ event: 'seek', ms: S.pos }); }
  if (box.dataset.testid === 'volume-bar') { S.vol = Number(e.target.value); log({ event: 'volume', v: S.vol }); }
});
const row = (t, ctx) => '<div data-testid="tracklist-row" data-id="' + t.id + '"' + (ctx ? ' data-ctx="' + ctx + '"' : '') + '><button data-testid="play-button" aria-label="Play ' + esc(t.name) + '"></button><a href="/track/' + t.id + '">' + esc(t.name) + '</a><a href="/artist/' + artistOf(t).id + '">' + esc(artistOf(t).name) + '</a><a href="/album/' + albumOf(t).id + '">' + esc(albumOf(t).name) + '</a></div>';
const match = (q, s) => q.toLowerCase().split(/\\s+/).filter(Boolean).every((w) => s.toLowerCase().includes(w));
function render() {
  const top = document.getElementById('top'), main = document.getElementById('main');
  // como o web player real: logado, ele aparece como aparelho do Spotify Connect
  if (logged() && ${JSON.stringify(ping || '')}) fetch(${JSON.stringify(ping || '')}, { mode: 'no-cors' }).catch(() => {});
  top.innerHTML = logged() ? '<button data-testid="user-widget-link">Perereko</button>' : '<header><button>Inscrever-se</button><button>Entrar</button></header>';
  const parts = location.pathname.split('/').map(decodeURIComponent);
  let html = '';
  if (parts[1] === 'search') {
    const q = parts[2] || '', tab = parts[3] || '';
    if (tab === 'tracks') html = CAT.tracks.filter((t) => match(q, t.name + ' ' + artistOf(t).name) || match(q.split(' ').slice(-1)[0], t.name)).map((t) => row(t)).join('');
    else if (tab === 'albums') html = CAT.albums.filter((a) => match(q.split(' ').slice(-1)[0], a.name) || match(q, CAT.artists[a.artist].name)).map((a) => '<div class="card"><a href="/intl-pt/album/' + a.id + '"><img src="' + IMG(a.img) + '"></a><a href="/intl-pt/album/' + a.id + '">' + esc(a.name) + '</a><span><a href="/intl-pt/artist/' + CAT.artists[a.artist].id + '">' + esc(CAT.artists[a.artist].name) + '</a></span></div>').join('');
    else if (tab === 'artists') html = CAT.artists.filter((a) => match(q, a.name) || match(a.name, q)).map((a) => '<div class="card"><a href="/artist/' + a.id + '">' + esc(a.name) + '</a></div>').join('');
    else { const i = CAT.tracks.findIndex((t) => match(q, t.name + ' ' + artistOf(t).name + ' ' + albumOf(t).name)); html = i >= 0 ? '<div data-testid="top-result-card" data-i="' + i + '"><a href="/track/' + T(i).id + '">' + esc(T(i).name) + '</a><button data-testid="play-button" aria-label="Play"></button></div>' : '<p>Nada</p>'; }
  } else if (parts[1] === 'album') {
    const a = CAT.albums.find((x) => x.id === parts[2]);
    html = a ? '<h1>' + esc(a.name) + '</h1><div data-testid="action-bar-row"><button data-testid="play-button" aria-label="Play"></button></div>' + CAT.tracks.filter((t) => albumOf(t) === a).map((t) => row(t, 'album:' + a.id)).join('') : '';
  } else if (parts[1] === 'artist' || parts[1] === 'track') {
    html = '<div data-testid="action-bar-row"><button data-testid="play-button" aria-label="Play"></button></div>';
  } else html = '<h1>Início</h1>';
  // a busca chega um pouco depois, como no site real
  main.innerHTML = '';
  setTimeout(() => { main.innerHTML = html; }, 250);
  bar();
}
if (!${noPop ? 'true' : 'false'}) window.addEventListener('popstate', render);
setInterval(() => { if (S.cur !== null) { if (S.playing && pos() >= T(S.cur).ms) { document.querySelector('[data-testid="control-button-skip-forward"]').click(); } bar(); } }, 500);
render();
</script></body></html>`;
}
const LOGIN = `<!doctype html><html><body style="background:#000;color:#fff"><h1>Entrar no Spotify</h1><button id="go" onclick="localStorage.setItem('logged','1'); location.href='/';">Entrar</button>
<button id="fb" style="display:block;margin-top:16px;width:260px;height:44px" onclick="window.open('/facebook/dialog/oauth', 'fblogin', 'width=480,height=560'); fetch('/__log', { method: 'POST', body: JSON.stringify({ event: 'fb-open' }) });">Continuar com o Facebook</button>
<script>window.addEventListener('message', (e) => { if (e.data === 'fb-ok') { fetch('/__log', { method: 'POST', body: JSON.stringify({ event: 'fb-ok' }) }); localStorage.setItem('logged', '1'); location.href = '/'; } });</script></body></html>`;
// a janela à parte do Facebook (abre com window.open, autoriza e fecha sozinha)
const FB = `<!doctype html><html><head><title>Facebook</title></head><body style="background:#1877f2;color:#fff;font:16px Arial"><h1>Facebook</h1><p>O Spotify quer acessar sua conta.</p><button id="allow" onclick="opener.postMessage('fb-ok', '*'); setTimeout(() => window.close(), 100);">Continuar como Você</button></body></html>`;

function start(opts = {}) {
  const S = { port: 0, events: [] };
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/__log' && req.method === 'POST') {
      let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => { try { S.events.push(JSON.parse(b)); } catch (_) { /* ignorado */ } res.end('ok'); });
      return;
    }
    if (u.pathname.startsWith('/img/')) {
      const f = path.join(__dirname, 'fixtures', path.basename(u.pathname));
      if (fs.existsSync(f)) { res.writeHead(200, { 'Content-Type': 'image/jpeg' }); res.end(fs.readFileSync(f)); } else { res.writeHead(404); res.end(); }
      return;
    }
    if (u.pathname === '/favicon.ico') { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(u.pathname === '/login' ? LOGIN : u.pathname === '/facebook/dialog/oauth' ? FB : page(`http://127.0.0.1:${S.port}`, opts.ping, S.noPop));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => { S.port = server.address().port; S.server = server; S.cat = CAT; resolve(S); }));
}

module.exports = { start, CAT };

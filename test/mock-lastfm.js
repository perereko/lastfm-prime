'use strict';
/* Páginas simuladas do Last.fm (marcação igual à do site), servidas para o app nos testes. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const IMG = 'https://lastfm-img.freetls.fastly.net/i/u';
const enc = (s) => encodeURIComponent(s).replace(/%20/g, '+');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const mast = (user) => `<nav class="masthead"><div class="masthead-inner-wrap"><div class="masthead-logo"><a href="/">Last.fm</a></div>
<div class="masthead-nav-wrap"><a class="masthead-search-toggle" href="/search">Search</a>${user ? `<div class="site-auth"><a class="auth-link auth-dropdown-toggle" href="/user/${user}"><img class="auth-avatar-desktop" src="${IMG}/avatar70s/me.png"></a><div class="auth-dropdown-menu-wrap disclose-hide"><div class="auth-dropdown-menu"><a class="auth-dropdown-profile auth-link" href="/user/${user}"><div class="auth-dropdown-profile-info"><div class="username">${user}</div><div class="scrobble-count">115,401 scrobbles</div></div></a></div></div></div>` : '<div class="site-auth site-auth--anon"><a class="join-cta-button" href="/join">Sign up</a></div>'}</div></div></nav>`;
const shell = (title, body, user = 'TestUser') => `<!doctype html><html class="js"><head><meta charset="utf-8"><title>${esc(title)} | Last.fm</title><style>body{margin:0;background:#fff;color:#222;font-family:Arial}.disclose-hide{display:none}.masthead-inner-wrap{display:flex;justify-content:space-between;align-items:center;height:68px;padding:0 20px 0 0}.masthead-logo{position:relative;width:120px;height:28px;margin-left:32px}.masthead-logo a{display:block;font-size:0;width:120px;height:28px;background:#d51007;border-radius:4px}.auth-avatar-desktop{width:36px;height:36px;border-radius:50%}</style></head><body>
<div class="main-content" id="content"><div>${mast(user)}<div class="adaptive-skin-container" id="mantle_skin">${body}</div></div></div></body></html>`;
const metaItem = (t, n, abbr) => `<li class="header-metadata-tnew-item"><h4 class="header-metadata-tnew-title">${t}</h4><div class="header-metadata-tnew-display"><p><abbr class="intabbr" title="${n}">${abbr}</abbr></p></div></li>`;
const loveForm = (artist, track, loved) => `<form action="/user/TestUser/loved" method="POST" class="love-button-form"><input type="hidden" name="csrfmiddlewaretoken" value="tok123"><input type="hidden" name="artist" value="${esc(artist)}"><input type="hidden" name="track" value="${esc(track)}"><input type="hidden" name="ajax" value="1"><button type="submit" name="action" value="${loved ? 'unlove' : 'love'}" class="chartlist-love-button toggle-button" data-analytics-action="${loved ? 'UnloveTrack' : 'LoveTrack'}" data-toggle-button-current-state="${loved ? 'loved' : 'unloved'}">Love</button></form>`;

function albumPage(artist, album, list) {
  const rows = list.map(([t, sid], i) => `<tr class="chartlist-row"><td class="chartlist-index">${i + 1}</td><td class="chartlist-play"><a class="chartlist-play-button js-playlink" href="https://open.spotify.com/track/${sid}" target="_blank" title="Play on Spotify">Play</a></td><td class="chartlist-name"><a href="/music/${enc(artist)}/_/${enc(t)}" title="${esc(t)}">${t}</a></td><td class="chartlist-loved">${loveForm(artist, t, false)}</td></tr>`).join('');
  return shell(`${album} — ${artist}`, `<header class="header-new header-new--album"><div class="header-new-inner"><div class="header-new-content"><a class="header-new-crumb" href="/music/${enc(artist)}"><span>${artist}</span></a><h1 class="header-new-title">${album}</h1>
<div class="header-new-info-desktop"><ul class="header-metadata-tnew">${metaItem('Listeners', '529,075', '529K')}${metaItem('Scrobbles', '15,400,000', '15.4M')}</ul></div></div></div></header>
<div class="container page-content"><div class="row"><div class="col-sidebar"><div class="album-overview-cover-art"><img src="${IMG}/500x500/${enc(album)}.jpg"></div></div><div class="col-main">
<section id="tracklist"><table class="chartlist">${rows}</table></section></div></div></div>`);
}
function trackPage(artist, track, loved) {
  return shell(`${track} — ${artist}`, `<header class="header-new header-new--track"><div class="header-new-inner"><div class="header-new-content"><a class="header-new-crumb" href="/music/${enc(artist)}"><span>${artist}</span></a><h1 class="header-new-title">${track}</h1><div class="header-new-actions">${loveForm(artist, track, loved)}</div></div></div></header><div class="container page-content"><p class="track-marker">${esc(track)}</p></div>`);
}
function lovedPage(rows) {
  const tr = rows.map(([t, a]) => `<tr class="chartlist-row chartlist-row--with-artist"><td class="chartlist-name"><a href="/music/${enc(a)}/_/${enc(t)}" title="${esc(t)}">${t}</a></td><td class="chartlist-artist"><a href="/music/${enc(a)}" title="${esc(a)}">${a}</a></td></tr>`).join('');
  return shell('Loved Tracks', `<div class="container page-content"><h2>Loved Tracks</h2><table class="chartlist">${tr}</table></div>`);
}
function recent(rows) {
  return `<section id="recent-tracks-section"><table class="chartlist chartlist--with-index">${rows.map((r) => `<tr class="chartlist-row chartlist-row--with-artist${r.live ? ' chartlist-row--now-scrobbling' : ''}" data-x="1"><td class="chartlist-image"><img src="${IMG}/64s/x.jpg"></td><td class="chartlist-name"><a href="/music/${enc(r.artist)}/_/${enc(r.title)}" title="${esc(r.title)}">${esc(r.title)}</a></td><td class="chartlist-artist"><a href="/music/${enc(r.artist)}" title="${esc(r.artist)}">${esc(r.artist)}</a></td><td class="chartlist-timestamp"><span title="Thursday 15 Oct 2026, 8:02am">${r.live ? 'Scrobbling now' : '12 minutes ago'}</span></td></tr>`).join('')}</table></section>`;
}

const API_KEY = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
const API_SECRET = '0f9e8d7c6b5a49382716f5e4d3c2b1a0';
const md5 = (x) => require('crypto').createHash('md5').update(x, 'utf8').digest('hex');
const sigOk = (p) => { const keys = Object.keys(p).filter((k) => k !== 'format' && k !== 'api_sig' && k !== 'callback').sort(); return md5(keys.map((k) => `${k}${p[k]}`).join('') + API_SECRET) === p.api_sig; };
/** API do Last.fm (ws.audioscrobbler.com/2.0) simulada */
function apiCall(S, p) {
  const err = (code, message) => ({ error: code, message });
  if (p.api_key !== API_KEY) return err(10, 'Invalid API key');
  switch (p.method) {
    case 'auth.getToken': { if (!sigOk(p)) return err(13, 'Invalid method signature'); const t = `tok${Date.now()}`; S.tokens.add(t); return { token: t }; }
    case 'auth.getSession': if (!sigOk(p)) return err(13, 'Invalid method signature'); return S.authorized.has(p.token) ? { session: { name: S.user, key: 'sk-test-123', subscriber: 0 } } : err(14, 'Unauthorized Token');
    case 'track.updateNowPlaying': if (!sigOk(p) || p.sk !== 'sk-test-123') return err(9, 'Invalid session key'); S.nowPlaying.push({ artist: p.artist, track: p.track, album: p.album }); return { nowplaying: {} };
    case 'track.scrobble': {
      if (!sigOk(p) || p.sk !== 'sk-test-123') return err(9, 'Invalid session key');
      for (let i = 0; p[`artist[${i}]`]; i++) S.scrobbles.push({ artist: p[`artist[${i}]`], track: p[`track[${i}]`], album: p[`album[${i}]`] || '', ts: Number(p[`timestamp[${i}]`]) });
      return { scrobbles: { '@attr': { accepted: 1, ignored: 0 } } };
    }
    case 'user.getRecentTracks': {
      const list = [...S.apiRecent, ...S.scrobbles].filter((t) => !p.from || t.ts >= Number(p.from)).sort((a, b) => b.ts - a.ts)
        .map((t) => ({ artist: { '#text': t.artist }, name: t.track, date: { uts: String(t.ts) } }));
      return { recenttracks: { track: list } };
    }
    default: return err(3, 'Invalid Method');
  }
}

function start() {
  const S = { port: 0, junk: true, log: [], loves: [], recent: [{ title: 'Ghost of Perdition', artist: 'Opeth', live: false }], user: 'TestUser', lovedSet: new Set(),
    tokens: new Set(), authorized: new Set(), nowPlaying: [], scrobbles: [], apiRecent: [], apiKey: API_KEY, apiSecret: API_SECRET };
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      const u = new URL(req.url, 'http://x');
      const p = decodeURIComponent(u.pathname.replace(/\+/g, '%20'));
      S.log.push(`${req.method} ${u.pathname}`);
      const html = (s) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(s); };
      if (p === '/2.0/' || p === '/2.0') {
        const params = Object.fromEntries(req.method === 'POST' ? new URLSearchParams(body) : u.searchParams);
        res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(apiCall(S, params)));
        return;
      }
      if (p === '/api/account/create') {
        html(shell('API account', `<div class="container page-content"><h1>Your API account</h1><table><tr><th>Application name</th><td>Last.fm PRIME</td></tr><tr><th>API key</th><td>${API_KEY}</td></tr><tr><th>Shared secret</th><td>${API_SECRET}</td></tr><tr><th>Registered to</th><td>TestUser</td></tr></table></div>`, S.user));
        return;
      }
      if (p === '/api/auth/allow' && req.method === 'POST') { S.authorized.add(u.searchParams.get('token')); res.writeHead(200); res.end('ok'); return; }
      if (p === '/api/auth' || p === '/api/auth/') {
        const t = u.searchParams.get('token') || '';
        html(shell('Connect application', `<div class="container page-content"><h1>Connect Last.fm PRIME</h1><p>Allow this application to scrobble?</p><button id="allow" onclick="fetch('/api/auth/allow?token=${t}',{method:'POST'}).then(()=>{document.body.dataset.ok='1'})">Yes, allow access</button></div>`, S.user));
        return;
      }
      if (p.startsWith('/__img/')) { res.writeHead(200, { 'Content-Type': 'image/jpeg' }); res.end(fs.readFileSync(path.join(__dirname, 'fixtures', 'lastfm-cover.jpg'))); return; }
      if (req.method === 'POST' && p === '/user/TestUser/loved') {
        const f = new URLSearchParams(body.includes('Content-Disposition') ? '' : body);
        // FormData chega como multipart: extrai os campos
        const fields = {};
        for (const m of body.matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)\r\n/g)) fields[m[1]] = m[2];
        for (const [k, v] of f) fields[k] = v;
        S.loves.push({ ...fields, xrw: req.headers['x-requested-with'] || '' });
        const key = `${fields.artist}|${fields.track}`;
        if (fields.action === 'love') S.lovedSet.add(key); else S.lovedSet.delete(key);
        res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}');
        return;
      }
      if (p === `/user/${S.user}/partial/recenttracks`) { html(recent(S.recent)); return; }
      if (p === '/user/TestUser/loved') { html(lovedPage([['Karma Police', 'Radiohead'], ['Stranded', 'Gojira'], ['Veil of Maya', 'Cynic'], ['Song That Does Not Exist', 'Nobody Band'], ['Karma Police', 'Radiohead']])); return; }
      let m;
      if ((m = p.match(/^\/music\/([^/]+)\/_\/([^/]+)$/))) { html(trackPage(m[1], m[2], S.lovedSet.has(`${m[1]}|${m[2]}`))); return; }
      const tid = (name, dflt) => (S.trackIds && S.trackIds[name]) || dflt;
      if (p === '/music/Radiohead/OK Computer') { html(albumPage('Radiohead', 'OK Computer', [['Karma Police', tid('Karma Police', 't1')], ['Paranoid Android', tid('Paranoid Android', 't2')]])); return; }
      if (p === '/music/Gojira/Magma') { html(albumPage('Gojira', 'Magma', [['Stranded', tid('Stranded', 't3')], ['Silvera', tid('Silvera', 't4')]])); return; }
      if (p === '/__frame-yt') { res.writeHead(302, { Location: 'https://consent.youtube.com/m?continue=https://www.youtube.com/embed/x' }); res.end(); return; }
      if (p === '/__frame-sp') { res.writeHead(302, { Location: 'https://open.spotify.com/embed/track/t1' }); res.end(); return; }
      if (p === '/__frame-ad') { res.writeHead(302, { Location: 'https://ads.example.com/landing' }); res.end(); return; }
      if (p === '/') {
        const junk = S.junk ? `<iframe src="/__frame-yt" width="10" height="10"></iframe><iframe src="/__frame-sp" width="10" height="10"></iframe><iframe src="/__frame-ad" width="10" height="10"></iframe>
<script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
<script>setTimeout(() => { window.open('https://ads.example.com/pop'); }, 300); setTimeout(() => { location.href = 'https://evil.example.com/hijack'; }, 900);</script>` : '';
        html(shell('Home', `<div class="container page-content"><h1>Bem-vindo</h1><p class="home-marker">home</p><a href="/music/Radiohead/OK+Computer">OK Computer</a><a class="ext-link" href="https://en.wikipedia.org/wiki/Radiohead">Wikipedia</a>${junk}</div>`, S.user));
        return;
      }
      html(shell('Página', '<div class="container page-content"><p>página simulada</p></div>', S.user));
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => { S.port = server.address().port; resolve(S); }));
}

module.exports = { start };

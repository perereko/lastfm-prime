'use strict';
/* Uma plataforma de música simulada (faz o papel do YouTube Music, Deezer…): usa a Media Session como os
 * sites de verdade, sem marcadores próprios. Registra cliques, buscas e comandos para os testes. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const SONGS = [
  { title: 'Teardrop', artist: 'Massive Attack', album: 'Mezzanine', dur: 330 },
  { title: 'Glory Box', artist: 'Portishead', album: 'Dummy', dur: 306 },
  { title: 'Hyperballad', artist: 'Björk', album: 'Post', dur: 321 },
];

const PAGE = (name, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${name}</title>
<style>
  body { margin: 0; background: #111; color: #eee; font: 16px/1.3 Arial, sans-serif; }
  #top { position: absolute; left: 0; top: 0; right: 0; height: 56px; background: #c00; display: flex; align-items: center; gap: 8px; padding: 0 12px; }
  #q { width: 180px; height: 32px; font-size: 16px; }
  #go { height: 32px; }
  .song { position: absolute; left: 12px; width: 300px; height: 48px; font-size: 16px; text-align: left; }
  #s0 { top: 80px; } #s1 { top: 140px; } #s2 { top: 200px; }
  #ua { position: absolute; left: 12px; top: 270px; font-size: 12px; }
  #scroller { position: absolute; left: 12px; top: 300px; width: 300px; height: 120px; overflow: auto; background: #222; }
  #scroller div { height: 600px; }
</style></head><body>
<div id="top"><input id="q" placeholder="Buscar"><button id="go">Buscar</button></div>
${SONGS.map((s, i) => `<button class="song" id="s${i}" data-i="${i}">${s.title} — ${s.artist}</button>`).join('')}
<div id="ua"></div>
<button id="site" style="position:absolute;left:330px;top:80px;height:40px" onclick="window.open('http://localhost:' + location.port + '/site-do-artista', '_blank')">Site do artista</button>
<button id="pause" style="position:absolute;left:330px;top:140px;height:40px;width:90px">Pausar</button>
<button id="login" style="position:absolute;left:330px;top:260px;height:40px;width:90px" onclick="window.open(location.origin + '/accounts/signin', 'login', 'width=480,height=600'); fetch('/__log', { method: 'POST', body: JSON.stringify({ event: 'login-open' }) });">Entrar</button>
${extra}
<button id="nextb" style="position:absolute;left:330px;top:200px;height:40px;width:90px">Próxima</button>
<div id="scroller"><div>rolar</div></div>
<script>
const SONGS = ${JSON.stringify(SONGS)};
const log = (ev) => fetch('/__log', { method: 'POST', body: JSON.stringify({ ...ev, app: ${JSON.stringify(name)} }) });
let cur = null, playing = false, base = 0, at = Date.now();
const pos = () => base + (playing ? (Date.now() - at) / 1000 : 0);
function meta() {
  const s = SONGS[cur];
  navigator.mediaSession.metadata = new MediaMetadata({ title: s.title, artist: s.artist, album: s.album, artwork: [{ src: location.origin + '/img/red.jpg', sizes: '300x300', type: 'image/jpeg' }] });
  navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  navigator.mediaSession.setPositionState({ duration: s.dur, position: Math.min(s.dur, pos()), playbackRate: 1 });
}
function play(i) { cur = i; base = 0; at = Date.now(); playing = true; meta(); log({ event: 'play', title: SONGS[i].title }); }
document.querySelectorAll('.song').forEach((b) => b.addEventListener('click', () => play(+b.dataset.i)));
document.getElementById('go').addEventListener('click', () => log({ event: 'search', q: document.getElementById('q').value }));
document.getElementById('q').addEventListener('keydown', (e) => { if (e.key === 'Enter') log({ event: 'search', q: e.target.value, via: 'enter' }); });
document.getElementById('scroller').addEventListener('scroll', (e) => { if (e.target.scrollTop > 40 && !window.__scrolled) { window.__scrolled = true; log({ event: 'scroll', top: e.target.scrollTop }); } });
navigator.mediaSession.setActionHandler('play', () => { if (cur === null) return; at = Date.now(); playing = true; meta(); log({ event: 'resume' }); });
navigator.mediaSession.setActionHandler('pause', () => { if (cur === null) return; base = pos(); playing = false; meta(); log({ event: 'pause' }); });
navigator.mediaSession.setActionHandler('nexttrack', () => { play(((cur ?? -1) + 1) % SONGS.length); log({ event: 'next' }); });
navigator.mediaSession.setActionHandler('previoustrack', () => { play(((cur ?? 1) - 1 + SONGS.length) % SONGS.length); log({ event: 'prev' }); });
navigator.mediaSession.setActionHandler('seekto', (d) => { base = d.seekTime; at = Date.now(); meta(); log({ event: 'seek', s: Math.round(d.seekTime) }); });
// a página se redesenhando: some a informação da música por um instante (a barra do app não pode piscar)
window.__flap = (ms = 1500) => { navigator.mediaSession.metadata = null; navigator.mediaSession.playbackState = 'none'; setTimeout(meta, ms); };
// uma capa que alterna entre tamanhos a cada leitura (a barra não pode ficar trocando a capa)
window.__artFlip = () => { let n = 0; window.__artTimer = setInterval(() => { const s = SONGS[cur]; navigator.mediaSession.metadata = new MediaMetadata({ title: s.title, artist: s.artist, album: s.album, artwork: [{ src: location.origin + '/img/red.jpg?v=' + (n++ % 2), sizes: '300x300', type: 'image/jpeg' }] }); }, 700); };
// os botões do próprio site (no painel), como os de verdade
document.getElementById('pause').addEventListener('click', () => { if (cur === null) return; if (playing) { base = pos(); playing = false; meta(); log({ event: 'pause', via: 'site' }); } else { at = Date.now(); playing = true; meta(); log({ event: 'resume', via: 'site' }); } });
document.getElementById('nextb').addEventListener('click', () => { play(((cur ?? -1) + 1) % SONGS.length); log({ event: 'next', via: 'site' }); });
document.querySelectorAll('[data-play]').forEach((b) => b.addEventListener('click', () => play(+b.dataset.play)));
// uma página que pede proteção de conteúdo (DRM), como as de quem usa Widevine
if (/drm=1/.test(location.search) && navigator.requestMediaKeySystemAccess) navigator.requestMediaKeySystemAccess('com.widevine.alpha', [{ initDataTypes: ['cenc'], audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }] }]).then(() => log({ event: 'drm', ok: true }), () => log({ event: 'drm', ok: false }));
document.getElementById('ua').textContent = /Mobile/.test(navigator.userAgent) ? 'celular' : 'computador';
log({ event: 'load', mobile: /Mobile/.test(navigator.userAgent) });
</script></body></html>`;

function start() {
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
    if (u.pathname === '/accounts/signin') {
      res.end(`<!doctype html><html><head><title>Entrar</title></head><body style="background:#fff;font:16px Arial"><h1>Entrar na conta</h1><button id="allow" onclick="fetch('/__log', { method: 'POST', body: JSON.stringify({ event: 'login-ok' }) }).then(() => window.close())">Continuar</button></body></html>`);
      return;
    }
    // busca do YouTube Music: o "melhor resultado" com o botão de tocar (como no site de verdade)
    if (u.pathname.startsWith('/ytm/search')) {
      const q = (u.searchParams.get('q') || '').toLowerCase();
      const i = Math.max(0, SONGS.findIndex((x) => q.includes(x.title.toLowerCase())));
      const card = `<ytmusic-card-shelf-renderer style="position:absolute;left:12px;top:440px;display:block;width:300px;height:60px;background:#333;color:#fff">Melhor resultado: ${SONGS[i].title}<ytmusic-play-button-renderer data-play="${i}" style="display:inline-block;margin-left:8px;width:50px;height:30px;background:#c00;cursor:pointer">▶</ytmusic-play-button-renderer></ytmusic-card-shelf-renderer>`;
      res.end(PAGE('YouTube Music', card));
      return;
    }
    res.end(PAGE(u.pathname.startsWith('/deezer') ? 'Deezer' : 'YouTube Music'));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => { S.port = server.address().port; S.server = server; resolve(S); }));
}

module.exports = { start, SONGS };

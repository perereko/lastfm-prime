'use strict';
/* Servidor falso da API do Spotify (contas + Web API), com as regras de 2026:
 * busca com no máximo 10 resultados, biblioteca em /me/library com URIs, playlists em /me/playlists e /items. */
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function start() {
  const S = {
    port: 0, log: [], plays: [], loves: [], playlists: [], searches: [],
    challenge: null, pkceOk: null, codes: new Map(),
    access: 'AT0', refresh: 'RT0', forceInvalidGrant: false, quota429: 0,
    library: new Set(),
    devices: [
      { id: 'pc1', name: 'PC-DO-PERERE', type: 'Computer', is_active: true, is_restricted: false, is_private_session: false, volume_percent: 62, supports_volume: true },
      { id: 'cel1', name: 'Celular', type: 'Smartphone', is_active: false, is_restricted: false, is_private_session: false, volume_percent: 40, supports_volume: true },
    ],
    current: null, playing: true, startedAt: Date.now(), offsetMs: 0, shuffle: false, repeat: 'off', context: null,
  };
  const BASE = () => `http://127.0.0.1:${S.port}`;
  const img = (n) => [{ url: `${BASE()}/img/${n}.jpg`, width: 300, height: 300 }];
  const albums = {
    al1: { id: 'al1', name: 'OK Computer', artist: 'Radiohead', img: 'red', type: 'album' },
    al2: { id: 'al2', name: 'Magma', artist: 'Gojira', img: 'blue', type: 'album' },
    al3: { id: 'al3', name: 'Focus', artist: 'Cynic', img: 'green', type: 'album' },
    al4: { id: 'al4', name: 'Process of a New Decline', artist: 'Gorod', img: 'gold', type: 'album' },
    al5: { id: 'al5', name: 'OK Computer (Live)', artist: 'Radiohead Tribute', img: 'gold', type: 'compilation' },
  };
  const tracks = {
    t1: { id: 't1', name: 'Karma Police', al: 'al1', ms: 264000 },
    t2: { id: 't2', name: 'Paranoid Android', al: 'al1', ms: 383000 },
    t3: { id: 't3', name: 'Stranded', al: 'al2', ms: 271000 },
    t4: { id: 't4', name: 'Silvera', al: 'al2', ms: 213000 },
    t5: { id: 't5', name: 'Veil of Maya', al: 'al3', ms: 220000 },
    t6: { id: 't6', name: 'Disavowed', al: 'al4', ms: 250000 },
    t7: { id: 't7', name: 'Karma Police - Live', al: 'al5', ms: 280000 },
  };
  const artists = { ar1: 'Radiohead', ar2: 'Gojira', ar3: 'Cynic', ar4: 'Gorod' };
  const artistObj = (name) => { const id = Object.keys(artists).find((k) => artists[k] === name) || `x-${name}`; return { id, name, uri: `spotify:artist:${id}`, images: img('avatar') }; };
  const albumObj = (a) => ({ id: a.id, name: a.name, uri: `spotify:album:${a.id}`, album_type: a.type, artists: [artistObj(a.artist)], images: img(a.img) });
  const trackObj = (t) => ({ id: t.id, name: t.name, uri: `spotify:track:${t.id}`, duration_ms: t.ms, type: 'track', is_local: false, artists: [artistObj(albums[t.al].artist)], album: albumObj(albums[t.al]) });
  const order = Object.keys(tracks);
  const albumTracks = (alId) => order.filter((k) => tracks[k].al === alId);
  S.tracks = tracks; S.albums = albums;
  S.setTrack = (id, progressMs = 0, playing = true) => { S.current = id; S.offsetMs = progressMs; S.startedAt = Date.now(); S.playing = playing; };
  S.progress = () => Math.min(tracks[S.current]?.ms || 0, S.offsetMs + (S.playing ? Date.now() - S.startedAt : 0));
  S.active = () => S.devices.find((d) => d.is_active) || null;

  const readBody = (req) => new Promise((r) => { let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => r(b)); });
  const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(obj === undefined ? '' : JSON.stringify(obj)); };

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, BASE());
    const p = u.pathname;
    const body = await readBody(req);
    S.log.push(`${req.method} ${p}${u.search}`);
    // imagens
    if (p.startsWith('/img/')) {
      const f = path.join(__dirname, 'fixtures', path.basename(p));
      if (fs.existsSync(f)) { res.writeHead(200, { 'Content-Type': 'image/jpeg' }); res.end(fs.readFileSync(f)); } else { res.writeHead(404); res.end(); }
      return;
    }
    if (p === '/__test/webdevice') {
      if (!S.devices.some((d) => d.id === 'webdev')) S.devices.push({ id: 'webdev', name: 'Web Player (Chrome)', type: 'Computer', is_active: false, is_restricted: false, is_private_session: false, volume_percent: 70, supports_volume: true });
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*' }); res.end('ok'); return;
    }
    if (p === '/__test/launch') {
      S.launches = (S.launches || 0) + 1;
      setTimeout(() => { if (!S.devices.length) S.devices.push({ id: 'pc1', name: 'PC-DO-PERERE', type: 'Computer', is_active: false, is_restricted: false, is_private_session: false, volume_percent: 62, supports_volume: true }); }, 1500);
      res.writeHead(200); res.end('ok'); return;
    }
    // ---- contas ----
    if (p === '/authorize') {
      S.challenge = u.searchParams.get('code_challenge');
      S.scope = u.searchParams.get('scope');
      S.authClient = u.searchParams.get('client_id');
      const code = 'CODE' + Math.random().toString(36).slice(2, 8);
      S.codes.set(code, S.challenge);
      const back = new URL(u.searchParams.get('redirect_uri'));
      back.searchParams.set('code', code);
      back.searchParams.set('state', u.searchParams.get('state'));
      res.writeHead(302, { Location: back.toString() }); res.end();
      return;
    }
    if (p === '/api/token' && req.method === 'POST') {
      const f = new URLSearchParams(body);
      if (f.get('grant_type') === 'authorization_code') {
        const ch = S.codes.get(f.get('code'));
        S.pkceOk = !!ch && b64url(crypto.createHash('sha256').update(f.get('code_verifier') || '').digest()) === ch;
        if (!S.pkceOk) return json(res, 400, { error: 'invalid_grant', error_description: 'bad verifier' });
        S.access = 'AT' + Math.random().toString(36).slice(2, 6); S.refresh = 'RT1';
        return json(res, 200, { access_token: S.access, token_type: 'Bearer', expires_in: 3600, refresh_token: S.refresh, scope: S.scope });
      }
      if (f.get('grant_type') === 'refresh_token') {
        if (S.forceInvalidGrant || f.get('refresh_token') !== S.refresh) return json(res, 400, { error: 'invalid_grant', error_description: 'Refresh token revoked' });
        S.access = 'AT' + Math.random().toString(36).slice(2, 6);
        return json(res, 200, { access_token: S.access, token_type: 'Bearer', expires_in: 3600, scope: S.scope });
      }
      return json(res, 400, { error: 'unsupported_grant_type' });
    }
    // ---- API ----
    if (!p.startsWith('/v1/')) { res.writeHead(404); res.end(); return; }
    if (req.headers.authorization !== `Bearer ${S.access}`) return json(res, 401, { error: { status: 401, message: 'The access token expired' } });
    if (S.quota429 > 0) { S.quota429--; res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '2' }); res.end(JSON.stringify({ status: 429, message: 'Too many requests', reason: 'QUOTA_EXCEEDED' })); return; }
    const q = u.searchParams;
    const r = p.slice(3);
    const dev = S.active();
    if (r === '/me') return json(res, 200, { id: 'perereko', display_name: 'Perereko', images: img('avatar') });
    if (r === '/me/player' && req.method === 'GET') {
      if (!dev) return json(res, 204);
      const t = tracks[S.current];
      return json(res, 200, {
        device: dev, is_playing: !!t && S.playing, progress_ms: t ? S.progress() : 0, item: t ? trackObj(t) : null,
        shuffle_state: S.shuffle, repeat_state: S.repeat, context: S.context ? { uri: S.context } : null, currently_playing_type: 'track', actions: { disallows: {} },
      });
    }
    if (r === '/me/player/devices') return json(res, 200, { devices: S.devices });
    if (r === '/me/player/recently-played') return json(res, 200, { items: [{ track: trackObj(tracks.t1), played_at: new Date().toISOString(), context: { type: 'album', uri: 'spotify:album:al1' } }] });
    if (r === '/me/player' && req.method === 'PUT') {
      const b = JSON.parse(body || '{}');
      S.devices.forEach((d) => { d.is_active = d.id === b.device_ids[0]; });
      if (b.play) S.playing = true;
      S.log.push(`transfer ${b.device_ids[0]}`);
      return json(res, 204);
    }
    if (!dev && r.startsWith('/me/player/')) return json(res, 404, { error: { status: 404, message: 'Player command failed: No active device found', reason: 'NO_ACTIVE_DEVICE' } });
    if (r === '/me/player/play') {
      const did = q.get('device_id');
      if (did) S.devices.forEach((d) => { d.is_active = d.id === did; });
      if (body) {
        const b = JSON.parse(body);
        S.plays.push(b);
        let id = null;
        if (b.uris) id = b.uris[0].split(':')[2];
        else if (b.context_uri) {
          const [, type, cid] = b.context_uri.split(':');
          S.context = b.context_uri;
          if (type === 'album') id = b.offset?.uri ? b.offset.uri.split(':')[2] : albumTracks(cid)[0];
          else if (type === 'artist') id = order.find((k) => albums[tracks[k].al].artist === artists[cid]);
          else if (type === 'playlist') id = (S.playlists.find((x) => x.id === cid)?.uris[0] || 'spotify:track:t1').split(':')[2];
        }
        if (id) S.setTrack(id, 0, true);
      } else { S.offsetMs = S.progress(); S.startedAt = Date.now(); S.playing = true; }
      return json(res, 204);
    }
    if (r === '/me/player/pause') { S.offsetMs = S.progress(); S.playing = false; return json(res, 204); }
    if (r === '/me/player/next' || r === '/me/player/previous') {
      const i = order.indexOf(S.current);
      const j = r.endsWith('next') ? (i + 1) % order.length : (i - 1 + order.length) % order.length;
      S.setTrack(order[j], 0, true);
      return json(res, 204);
    }
    if (r === '/me/player/seek') { S.offsetMs = Number(q.get('position_ms')); S.startedAt = Date.now(); S.lastSeek = S.offsetMs; return json(res, 204); }
    if (r === '/me/player/volume') { dev.volume_percent = Number(q.get('volume_percent')); return json(res, 204); }
    if (r === '/me/player/shuffle') { S.shuffle = q.get('state') === 'true'; return json(res, 204); }
    if (r === '/me/player/repeat') { S.repeat = q.get('state'); return json(res, 204); }
    if (r === '/search') {
      const limit = Number(q.get('limit') || 5);
      if (limit > 10) return json(res, 400, { error: { status: 400, message: 'Invalid limit' } });
      const raw = (q.get('q') || '').toLowerCase();
      S.searches.push(raw);
      const words = raw.replace(/\b(track|artist|album):/g, ' ').split(/\s+/).filter(Boolean);
      const has = (s) => words.every((w) => s.toLowerCase().includes(w));
      const out = {};
      const types = (q.get('type') || '').split(',');
      if (types.includes('track')) out.tracks = { items: order.map((k) => tracks[k]).filter((t) => has(`${t.name} ${albums[t.al].artist} ${albums[t.al].name}`)).slice(0, limit).map(trackObj) };
      if (types.includes('album')) out.albums = { items: Object.values(albums).filter((a) => has(`${a.name} ${a.artist}`)).slice(0, limit).map(albumObj) };
      if (types.includes('artist')) out.artists = { items: Object.values(artists).filter((a) => has(a)).slice(0, limit).map(artistObj) };
      return json(res, 200, out);
    }
    let m;
    if ((m = r.match(/^\/tracks\/(\w+)$/))) return tracks[m[1]] ? json(res, 200, trackObj(tracks[m[1]])) : json(res, 404, { error: { status: 404, message: 'not found' } });
    if ((m = r.match(/^\/albums\/(\w+)\/tracks$/))) return json(res, 200, { items: albumTracks(m[1]).map((k) => trackObj(tracks[k])) });
    if (r === '/me/library/contains') return json(res, 200, (q.get('uris') || '').split(',').map((x) => S.library.has(x)));
    if (r === '/me/library') {
      for (const x of (q.get('uris') || '').split(',')) { if (req.method === 'PUT') S.library.add(x); else S.library.delete(x); }
      return json(res, 200);
    }
    if (r === '/me/playlists' && req.method === 'POST') {
      const b = JSON.parse(body);
      const pl = { id: `pl${S.playlists.length + 1}`, name: b.name, description: b.description, public: b.public, uris: [] };
      S.playlists.push(pl);
      return json(res, 201, { id: pl.id, uri: `spotify:playlist:${pl.id}`, external_urls: { spotify: `https://open.spotify.com/playlist/${pl.id}` } });
    }
    if ((m = r.match(/^\/playlists\/(\w+)\/items$/)) && req.method === 'POST') {
      const pl = S.playlists.find((x) => x.id === m[1]);
      pl.uris.push(...JSON.parse(body).uris);
      return json(res, 201, { snapshot_id: 'x' });
    }
    return json(res, 404, { error: { status: 404, message: `no route ${r}` } });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => { S.port = server.address().port; S.server = server; resolve(S); }));
}

module.exports = { start };

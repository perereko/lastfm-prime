'use strict';
/* Cliente da API oficial do Spotify (Web API).
 * - Login com Authorization Code + PKCE: o app não guarda segredo, só o Client ID do usuário.
 * - O retorno do login chega num servidorzinho local em 127.0.0.1 (o Spotify não aceita "localhost").
 * - Os tokens de atualização duram 6 meses a partir do login; depois disso pedimos para conectar de novo.
 * - Respeita os limites (429 com Retry-After e o "QUOTA_EXCEEDED" do modo de desenvolvimento). */
const http = require('http');
const crypto = require('crypto');
const M = require('./match');

const ACCOUNTS = process.env.LFS_SPOTIFY_ACCOUNTS || 'https://accounts.spotify.com';
const API = process.env.LFS_SPOTIFY_API || 'https://api.spotify.com/v1';
const PORT = Number(process.env.LFS_REDIRECT_PORT || 43821);
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = [
  'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing',
  'user-library-read', 'user-library-modify',
  'playlist-read-private', 'playlist-modify-private', 'playlist-modify-public',
  'user-read-recently-played',
].join(' ');

const b64url = (buf) => buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

class SpotifyError extends Error {
  constructor(message, code, extra = {}) { super(message); this.code = code; Object.assign(this, extra); }
}

const PAGE = (title, body, ok) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title}</title>
<style>html,body{height:100%;margin:0;background:#000;color:#f4f3f7;font:16px/1.5 "Segoe UI Variable Text","Segoe UI",system-ui,sans-serif}
main{height:100%;display:grid;place-content:center;text-align:center;padding:24px}
.mark{width:56px;height:56px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;font-size:28px;background:${ok ? '#5ee6b5' : '#ffc45c'};color:#000}
h1{font-size:26px;margin:0 0 8px;letter-spacing:-.02em}p{margin:0;color:#a7a5b3;max-width:440px}</style></head>
<body><main><div class="mark">${ok ? '✓' : '!'}</div><h1>${title}</h1><p>${body}</p></main></body></html>`;

class Spotify {
  /**
   * @param {object} o
   * @param {(url:string)=>any} o.fetch    fetch do Electron (net.fetch)
   * @param {(url:string)=>any} o.openExternal abre o navegador do sistema
   * @param {()=>object|null} o.readSecret
   * @param {(obj:object|null)=>void} o.writeSecret
   * @param {()=>void} o.onAuthChange
   * @param {()=>void} o.onCallback  traz o app para frente depois do login
   */
  constructor(o) {
    this.o = o;
    this.tok = o.readSecret();
    this.clientId = '';
    this.backoffUntil = 0;
    this.quota = false;
    this.needsReauth = false;
    this.refreshing = null;
    this.loginState = null;
    this.me = this.tok?.me || null;
  }
  setClientId(id) {
    const clean = String(id || '').trim();
    if (clean !== this.clientId && this.tok && this.tok.clientId && this.tok.clientId !== clean) {
      // outro app do Spotify: o token antigo não vale mais
      this.tok = null; this.o.writeSecret(null);
    }
    this.clientId = clean;
  }
  get connected() { return !!(this.tok && this.tok.refresh) && !this.needsReauth; }
  get redirectUri() { return REDIRECT_URI; }

  /* ---------------- Login ---------------- */
  async login() {
    if (!/^[0-9a-f]{32}$/i.test(this.clientId)) throw new SpotifyError('O Client ID tem 32 letras e números. Copie de novo do painel do Spotify.', 'client_id');
    this.cancelLogin();
    const verifier = b64url(crypto.randomBytes(64));
    const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
    const state = b64url(crypto.randomBytes(18));
    const code = await new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const u = new URL(req.url, REDIRECT_URI);
        if (u.pathname !== '/callback') { res.writeHead(404); res.end(); return; }
        const send = (status, title, body, ok) => { res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(PAGE(title, body, ok)); };
        if (u.searchParams.get('state') !== state) { send(400, 'Este link de login expirou', 'Volte ao Last.fm PRIME e clique em “Conectar o Spotify” de novo.', false); return; }
        const err = u.searchParams.get('error');
        if (err) {
          send(200, 'Login cancelado', 'O Spotify não foi conectado. Você pode tentar de novo pelo app quando quiser.', false);
          finish(); reject(new SpotifyError(err === 'access_denied' ? 'Você não autorizou o acesso no Spotify.' : `O Spotify recusou o login (${err}).`, 'denied'));
          return;
        }
        send(200, 'Spotify conectado', 'Pode fechar esta aba e voltar ao Last.fm PRIME.', true);
        finish(); resolve(u.searchParams.get('code'));
      });
      const timer = setTimeout(() => { finish(); reject(new SpotifyError('O login demorou demais. Tente de novo.', 'timeout')); }, 5 * 60 * 1000);
      const finish = () => { clearTimeout(timer); setTimeout(() => server.close(), 200); this.loginState = null; };
      server.on('error', (e) => {
        finish();
        reject(new SpotifyError(e.code === 'EADDRINUSE'
          ? `A porta ${PORT} do computador está ocupada por outro programa. Feche outras cópias do app e tente de novo.`
          : `Não deu para receber o retorno do login (${e.code || e.message}).`, 'port'));
      });
      server.listen(PORT, '127.0.0.1', () => {
        const url = `${ACCOUNTS}/authorize?` + new URLSearchParams({
          client_id: this.clientId, response_type: 'code', redirect_uri: REDIRECT_URI,
          code_challenge_method: 'S256', code_challenge: challenge, scope: SCOPES, state,
        });
        this.loginState = { cancel: () => { finish(); reject(new SpotifyError('Login cancelado.', 'cancel')); }, url };
        this.o.openExternal(url);
      });
    });
    this.o.onCallback?.();
    const t = await this.tokenRequest({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI, client_id: this.clientId, code_verifier: verifier });
    this.saveToken(t, null);
    this.needsReauth = false;
    await this.loadMe().catch(() => {});
    this.o.onAuthChange?.();
    return this.me;
  }
  cancelLogin() { this.loginState?.cancel(); this.loginState = null; }

  logout() {
    this.tok = null; this.me = null; this.needsReauth = false;
    this.o.writeSecret(null);
    this.o.onAuthChange?.();
  }

  async tokenRequest(form) {
    let res;
    try {
      res = await this.o.fetch(`${ACCOUNTS}/api/token`, {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(form).toString(),
      });
    } catch (e) { throw new SpotifyError('Sem conexão com o Spotify.', 'network'); }
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (j.error === 'invalid_grant') throw new SpotifyError('O acesso ao Spotify expirou. Conecte de novo.', 'reauth');
      if (j.error === 'invalid_client') throw new SpotifyError('O Spotify não reconheceu o Client ID. Confira o que você colou.', 'client_id');
      throw new SpotifyError(j.error_description || j.error || `Erro ${res.status} no login do Spotify.`, 'token');
    }
    return j;
  }
  saveToken(t, prev) {
    this.tok = {
      clientId: this.clientId,
      access: t.access_token,
      refresh: t.refresh_token || prev?.refresh,
      exp: Date.now() + (Number(t.expires_in) || 3600) * 1000 - 60_000,
      scope: t.scope || prev?.scope || '',
      since: prev?.since || Date.now(),
      me: this.me || prev?.me || null,
    };
    this.o.writeSecret(this.tok);
  }
  async accessToken(force = false) {
    if (!this.tok?.refresh || this.needsReauth) throw new SpotifyError('Spotify não conectado.', 'auth');
    if (!force && this.tok.access && Date.now() < this.tok.exp) return this.tok.access;
    if (!this.refreshing) {
      this.refreshing = (async () => {
        try {
          const t = await this.tokenRequest({ grant_type: 'refresh_token', refresh_token: this.tok.refresh, client_id: this.clientId || this.tok.clientId });
          this.saveToken(t, this.tok);
        } catch (e) {
          if (e.code === 'reauth' || e.code === 'client_id') { this.needsReauth = true; this.o.onAuthChange?.(); }
          throw e;
        } finally { this.refreshing = null; }
      })();
    }
    await this.refreshing;
    return this.tok.access;
  }

  /* ---------------- Chamadas ---------------- */
  async api(method, p, { query, body, retried } = {}) {
    if (Date.now() < this.backoffUntil) {
      throw new SpotifyError(this.quota ? 'O limite de uso da API do Spotify foi atingido. O app tenta de novo sozinho em alguns minutos.' : 'O Spotify pediu uma pausa. Tentando de novo em instantes.', this.quota ? 'quota' : 'rate', { retryIn: this.backoffUntil - Date.now() });
    }
    const token = await this.accessToken();
    const url = new URL(API + p);
    if (query) for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    let res;
    try {
      res = await this.o.fetch(url.toString(), {
        method,
        headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (e) { throw new SpotifyError('Sem conexão com o Spotify.', 'network'); }
    if (res.status === 401 && !retried) { await this.accessToken(true); return this.api(method, p, { query, body, retried: true }); }
    if (res.status === 204 || res.status === 202) return null;
    const txt = await res.text();
    let j = null;
    try { j = txt ? JSON.parse(txt) : null; } catch (_) { j = null; }
    if (res.status === 429) {
      const ra = Math.max(1, Number(res.headers.get('retry-after')) || 5);
      this.quota = (j?.reason || j?.error?.reason) === 'QUOTA_EXCEEDED';
      this.backoffUntil = Date.now() + Math.min(ra, this.quota ? 3600 : 300) * 1000;
      throw new SpotifyError(this.quota ? 'O limite de uso da API do Spotify foi atingido. O app tenta de novo sozinho em alguns minutos.' : 'O Spotify pediu uma pausa. Tentando de novo em instantes.', this.quota ? 'quota' : 'rate', { retryIn: ra * 1000 });
    }
    if (!res.ok) {
      const reason = j?.error?.reason || '';
      let msg = j?.error?.message || `Erro ${res.status} no Spotify.`;
      if (reason === 'NO_ACTIVE_DEVICE' || (res.status === 404 && /device/i.test(msg))) throw new SpotifyError('Nenhum aparelho com o Spotify aberto.', 'no_device', { status: res.status });
      if (reason === 'PREMIUM_REQUIRED') msg = 'Esse comando precisa do Spotify Premium.';
      if (res.status === 403 && /scope/i.test(msg)) { this.needsReauth = true; this.o.onAuthChange?.(); msg = 'O app precisa de uma permissão nova. Conecte o Spotify de novo.'; }
      throw new SpotifyError(msg, reason === 'PREMIUM_REQUIRED' ? 'premium' : 'api', { status: res.status, reason });
    }
    this.quota = false;
    return j;
  }

  async loadMe() {
    const me = await this.api('GET', '/me');
    this.me = { id: me.id, name: me.display_name || me.id, image: (me.images || []).slice(-1)[0]?.url || (me.images || [])[0]?.url || null };
    if (this.tok) { this.tok.me = this.me; this.o.writeSecret(this.tok); }
    return this.me;
  }

  /* ---------------- Player ---------------- */
  static normalize(j) {
    if (!j) return { device: null, playing: false, item: null, progress: 0, at: Date.now() };
    const it = j.item;
    const dev = j.device ? {
      id: j.device.id, name: j.device.name, type: j.device.type, volume: j.device.volume_percent,
      supportsVolume: j.device.supports_volume !== false, private: !!j.device.is_private_session, restricted: !!j.device.is_restricted,
    } : null;
    let item = null;
    if (it) {
      const imgs = it.album?.images || it.images || it.show?.images || [];
      const pick = imgs.find((x) => x.width && x.width <= 320 && x.width >= 200) || imgs[1] || imgs[0];
      const big = imgs[0];
      item = {
        id: it.id, uri: it.uri, type: it.type, name: it.name, duration: it.duration_ms || 0,
        artists: it.artists ? it.artists.map((a) => a.name) : [it.show?.publisher || it.show?.name || ''],
        album: it.album?.name || it.show?.name || '', albumUri: it.album?.uri || null,
        image: pick?.url || null, imageBig: big?.url || pick?.url || null,
        local: !!it.is_local,
      };
    }
    return {
      device: dev, playing: !!j.is_playing, item, progress: j.progress_ms || 0, at: Date.now(),
      shuffle: !!j.shuffle_state, repeat: j.repeat_state || 'off', context: j.context?.uri || null,
      disallows: j.actions?.disallows || {},
    };
  }
  async player() { return Spotify.normalize(await this.api('GET', '/me/player', { query: { additional_types: 'episode' } })); }
  async devices() { return (await this.api('GET', '/me/player/devices'))?.devices || []; }
  async transfer(id, play) { return this.api('PUT', '/me/player', { body: { device_ids: [id], play: !!play } }); }

  async command(cmd, arg, deviceId) {
    const q = deviceId ? { device_id: deviceId } : undefined;
    switch (cmd) {
      case 'play': return this.api('PUT', '/me/player/play', { query: q });
      case 'pause': return this.api('PUT', '/me/player/pause', { query: q });
      case 'next': return this.api('POST', '/me/player/next', { query: q });
      case 'prev': return this.api('POST', '/me/player/previous', { query: q });
      case 'seek': return this.api('PUT', '/me/player/seek', { query: { position_ms: Math.max(0, Math.round(arg)), device_id: deviceId } });
      case 'volume': return this.api('PUT', '/me/player/volume', { query: { volume_percent: Math.max(0, Math.min(100, Math.round(arg))), device_id: deviceId } });
      case 'shuffle': return this.api('PUT', '/me/player/shuffle', { query: { state: !!arg, device_id: deviceId } });
      case 'repeat': return this.api('PUT', '/me/player/repeat', { query: { state: arg, device_id: deviceId } });
      default: throw new SpotifyError('Comando desconhecido.', 'api');
    }
  }
  async playUris(body, deviceId) { return this.api('PUT', '/me/player/play', { query: deviceId ? { device_id: deviceId } : undefined, body }); }
  async queue(uri, deviceId) { return this.api('POST', '/me/player/queue', { query: { uri, device_id: deviceId } }); }

  /* ---------------- Biblioteca (endpoints novos de 2026: /me/library com URIs) ---------------- */
  async saved(uri) { const r = await this.api('GET', '/me/library/contains', { query: { uris: uri } }); return Array.isArray(r) ? !!r[0] : false; }
  async save(uri, on) { return this.api(on ? 'PUT' : 'DELETE', '/me/library', { query: { uris: uri } }); }

  /* ---------------- Busca ---------------- */
  async search(q, type, limit = 10) { return this.api('GET', '/search', { query: { q, type, limit: Math.min(10, limit) } }); }

  /** Acha no Spotify o que o Last.fm mostrou: { kind: 'track'|'album'|'artist', artist, title } */
  async resolve(intent) {
    const kind = intent.kind || 'track';
    const artist = intent.artist || '';
    const title = intent.title || '';
    if (kind === 'artist') {
      for (const q of [`artist:${M.clean(artist)}`, M.clean(artist)]) {
        const r = await this.search(q, 'artist');
        const hit = M.bestArtist(r?.artists?.items, artist);
        if (hit) return { kind, uri: hit.uri, name: hit.name, artist: hit.name, image: hit.images?.[1]?.url || hit.images?.[0]?.url || null };
      }
      return null;
    }
    if (kind === 'album') {
      for (const q of [`album:${M.clean(title)} artist:${M.clean(artist)}`, `${M.clean(artist)} ${M.clean(title)}`]) {
        const r = await this.search(q, 'album');
        const hit = M.bestAlbum(r?.albums?.items, artist, title);
        if (hit) return { kind, uri: hit.uri, name: hit.name, artist: hit.artists?.[0]?.name || artist, image: hit.images?.[1]?.url || hit.images?.[0]?.url || null, id: hit.id };
      }
      return null;
    }
    for (const q of [`track:${M.clean(title)} artist:${M.clean(artist)}`, `${M.clean(artist)} ${M.clean(title)}`]) {
      const r = await this.search(q, 'track');
      const hit = M.bestTrack(r?.tracks?.items, artist, title);
      if (hit) return { kind: 'track', uri: hit.uri, name: hit.name, artist: hit.artists?.[0]?.name || artist, albumUri: hit.album?.uri || null, image: hit.album?.images?.[1]?.url || hit.album?.images?.[0]?.url || null };
    }
    return null;
  }

  /** Busca livre (links de busca sem informação extra) */
  async resolveQuery(q) {
    const r = await this.search(M.clean(q), 'track,album,artist', 5);
    const nq = M.base(q);
    const tr = (r?.tracks?.items || []).find((t) => M.base(`${t.artists?.[0]?.name} ${t.name}`) === nq);
    if (tr) return { kind: 'track', uri: tr.uri, name: tr.name, artist: tr.artists?.[0]?.name, albumUri: tr.album?.uri, image: tr.album?.images?.[1]?.url || null };
    const al = (r?.albums?.items || []).find((a) => M.base(`${a.artists?.[0]?.name} ${a.name}`) === nq);
    if (al) return { kind: 'album', uri: al.uri, name: al.name, artist: al.artists?.[0]?.name, image: al.images?.[1]?.url || null, id: al.id };
    const ar = (r?.artists?.items || []).find((a) => M.base(a.name) === nq);
    if (ar) return { kind: 'artist', uri: ar.uri, name: ar.name, artist: ar.name, image: ar.images?.[1]?.url || null };
    const t0 = r?.tracks?.items?.[0];
    return t0 ? { kind: 'track', uri: t0.uri, name: t0.name, artist: t0.artists?.[0]?.name, albumUri: t0.album?.uri, image: t0.album?.images?.[1]?.url || null } : null;
  }

  async albumTracks(id) {
    const r = await this.api('GET', `/albums/${id}/tracks`, { query: { limit: 50 } });
    return (r?.items || []).map((t) => t.uri).filter(Boolean);
  }

  /* ---------------- Playlists (endpoints novos de 2026: /me/playlists e /items) ---------------- */
  async createPlaylist(name, description, uris, onProgress) {
    const pl = await this.api('POST', '/me/playlists', { body: { name, description, public: false } });
    for (let i = 0; i < uris.length; i += 100) {
      await this.api('POST', `/playlists/${pl.id}/items`, { body: { uris: uris.slice(i, i + 100) } });
      onProgress?.(Math.min(uris.length, i + 100));
    }
    return { id: pl.id, uri: pl.uri, url: pl.external_urls?.spotify || `https://open.spotify.com/playlist/${pl.id}` };
  }
}

module.exports = { Spotify, SpotifyError, REDIRECT_URI, SCOPES, wait };

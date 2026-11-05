'use strict';
/* Scrobbles feitos pelo próprio app, pela API oficial do Last.fm (com a chave de API da sua conta).
 *
 * Vale para tudo o que toca no painel: Spotify, YouTube Music, Deezer, SoundCloud, Apple Music e Tidal.
 * Regras do Last.fm: a faixa precisa ter mais de 30 segundos e ser ouvida por metade da duração ou
 * 4 minutos (o que vier primeiro). Antes de mandar, o app confere se a faixa já está no seu Last.fm
 * (o Spotify, o Deezer e o Tidal têm a própria ligação com o Last.fm): assim nada fica duplicado.
 * O que não der para mandar na hora (sem internet) fica numa fila e vai depois. */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const API = process.env.LFS_LASTFM_API || 'https://ws.audioscrobbler.com/2.0/';
const AUTH = process.env.LFS_LASTFM_AUTH || 'https://www.last.fm/api/auth/';
// plataformas com ligação própria com o Last.fm: espera um pouco antes de conferir
const NATIVE = new Set(['spotify', 'deezer', 'tidal']);
const AD = /^(advertisement|an[uú]ncio|publicidade|propaganda|spotify|ad)$/i;

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\s*[([].*?(remaster|ao vivo|live|mono|stereo|version|vers[aã]o|edit|mix|deluxe).*?[)\]]/g, '')
  .replace(/\s+-\s+(\d{4}\s+)?remaster.*$/, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const md5 = (s) => crypto.createHash('md5').update(s, 'utf8').digest('hex');

class LastfmApi {
  constructor({ fetch }) { this.fetch = fetch; this.key = ''; this.secret = ''; this.sk = ''; }
  set({ key, secret, sk }) { if (key !== undefined) this.key = key || ''; if (secret !== undefined) this.secret = secret || ''; if (sk !== undefined) this.sk = sk || ''; }
  sign(params) {
    const keys = Object.keys(params).filter((k) => k !== 'format' && k !== 'callback').sort();
    return md5(keys.map((k) => `${k}${params[k]}`).join('') + this.secret);
  }
  async call(method, params = {}, { post = false, signed = false, session = false } = {}) {
    if (!this.key) throw Object.assign(new Error('Falta a chave da API do Last.fm.'), { code: 'nokey' });
    const p = { ...params, method, api_key: this.key };
    if (session) p.sk = this.sk;
    if (signed || session) p.api_sig = this.sign(p);
    p.format = 'json';
    const body = new URLSearchParams(p).toString();
    let res;
    try {
      res = post
        ? await this.fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
        : await this.fetch(`${API}?${body}`, { method: 'GET' });
    } catch (e) { throw Object.assign(new Error('Sem conexão com o Last.fm.'), { code: 'network' }); }
    let j = null;
    try { j = await res.json(); } catch (_) { /* resposta sem JSON */ }
    if (!res.ok || (j && j.error)) {
      const code = j && j.error;
      const map = { 4: 'auth', 9: 'session', 10: 'nokey', 13: 'nokey', 14: 'pending', 15: 'expired', 26: 'nokey', 29: 'rate', 11: 'offline', 16: 'offline' };
      throw Object.assign(new Error((j && j.message) || `Last.fm ${res.status}`), { code: map[code] || (res.status >= 500 ? 'offline' : 'api'), lfm: code });
    }
    return j || {};
  }
  async getToken() { return (await this.call('auth.getToken', {}, { signed: true })).token; }
  authUrl(token) { return `${AUTH}?api_key=${encodeURIComponent(this.key)}&token=${encodeURIComponent(token)}`; }
  async getSession(token) { return (await this.call('auth.getSession', { token }, { signed: true })).session; }
  nowPlaying(t) {
    const p = { artist: t.artist, track: t.track };
    if (t.album) p.album = t.album;
    if (t.durationMs) p.duration = String(Math.round(t.durationMs / 1000));
    return this.call('track.updateNowPlaying', p, { post: true, session: true });
  }
  scrobble(list) {
    const p = {};
    list.slice(0, 50).forEach((t, i) => {
      p[`artist[${i}]`] = t.artist; p[`track[${i}]`] = t.track; p[`timestamp[${i}]`] = String(t.ts);
      if (t.album) p[`album[${i}]`] = t.album;
      if (t.durationMs) p[`duration[${i}]`] = String(Math.round(t.durationMs / 1000));
    });
    return this.call('track.scrobble', p, { post: true, session: true });
  }
  async recent(user, from) {
    const j = await this.call('user.getRecentTracks', { user, limit: '30', from: String(Math.max(0, from)), extended: '0' });
    const list = j && j.recenttracks && j.recenttracks.track;
    return (Array.isArray(list) ? list : list ? [list] : []).map((x) => ({
      artist: (x.artist && (x.artist['#text'] || x.artist.name)) || '', track: x.name || '',
      ts: x.date ? Number(x.date.uts) : null, live: !!(x['@attr'] && x['@attr'].nowplaying),
    }));
  }
}

class Scrobbler extends EventEmitter {
  constructor({ fetch, store, dataDir, log }) {
    super();
    this.api = new LastfmApi({ fetch });
    this.store = store;
    this.log = log || (() => {});
    this.queueFile = path.join(dataDir, 'scrobbles-na-fila.json');
    this.cur = {};          // faixa atual de cada plataforma
    this.sent = [];         // últimos enviados (para não repetir)
    this.queue = [];
    this.user = '';
    this.status = 'off';    // off | nokey | noauth | ok | error
    this.lastError = '';
    this.last = null;       // último scrobble { artist, track, pid, via, at }
    this.authing = null;
    try { this.queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8')) || []; } catch (_) { this.queue = []; }
    const sec = store.readSecret('lastfm') || {};
    this.api.set({ key: sec.key, secret: sec.secret, sk: sec.sk });
    this.user = sec.user || '';
    this.refreshStatus();
    this.retryTimer = setInterval(() => this.flush(), 60 * 1000);
    this.retryTimer.unref?.();
  }

  get configured() { return !!(this.api.key && this.api.secret); }
  get connected() { return this.configured && !!this.api.sk; }
  refreshStatus() {
    const before = this.status;
    this.status = !this.store.get('scrobbleOn') ? 'off' : !this.configured ? 'nokey' : !this.api.sk ? 'noauth' : this.lastError ? 'error' : 'ok';
    if (before !== this.status) this.emit('change');
  }
  info() {
    return { status: this.status, configured: this.configured, connected: this.connected, user: this.user, pending: this.queue.length, last: this.last, error: this.lastError, authing: !!this.authing, key: this.api.key ? `${this.api.key.slice(0, 4)}…${this.api.key.slice(-4)}` : '' };
  }
  save() { this.store.writeSecret(this.configured || this.api.sk ? { key: this.api.key, secret: this.api.secret, sk: this.api.sk, user: this.user } : null, 'lastfm'); }

  /** Chave e segredo da API (da página https://www.last.fm/api/account/create) */
  setKeys(key, secret) {
    key = String(key || '').trim().toLowerCase(); secret = String(secret || '').trim().toLowerCase();
    if (!/^[0-9a-f]{32}$/.test(key) || !/^[0-9a-f]{32}$/.test(secret)) return false;
    const changed = key !== this.api.key;
    this.api.set({ key, secret, ...(changed ? { sk: '' } : {}) });
    if (changed) this.user = '';
    this.lastError = '';
    this.save(); this.refreshStatus(); this.emit('change');
    return true;
  }
  logout() { this.api.set({ sk: '' }); this.user = ''; this.save(); this.refreshStatus(); this.emit('change'); }
  forget() { this.api.set({ key: '', secret: '', sk: '' }); this.user = ''; this.save(); this.refreshStatus(); this.emit('change'); }

  /** Autorização: abre a página do Last.fm (open) e espera você clicar em "Yes, allow access" */
  async authorize(open) {
    if (!this.configured) throw Object.assign(new Error('Falta a chave da API do Last.fm.'), { code: 'nokey' });
    if (this.authing) return this.authing;
    this.authing = (async () => {
      const token = await this.api.getToken();
      await open(this.api.authUrl(token));
      this.emit('change');
      const until = Date.now() + 5 * 60 * 1000;
      while (Date.now() < until && this.authing) {
        await new Promise((r) => setTimeout(r, Number(process.env.LFS_LASTFM_POLL) || 2500));
        try {
          const s = await this.api.getSession(token);
          if (s && s.key) {
            this.api.set({ sk: s.key }); this.user = s.name || ''; this.lastError = '';
            this.save(); this.refreshStatus();
            this.log('scrobbles: conectado como', this.user);
            this.flush();
            return { ok: true, user: this.user };
          }
        } catch (e) { if (e.code !== 'pending' && e.code !== 'network') throw e; }
      }
      throw Object.assign(new Error('A autorização no Last.fm não foi concluída.'), { code: 'timeout' });
    })();
    try { return await this.authing; } finally { this.authing = null; this.emit('change'); }
  }
  cancelAuth() { this.authing = null; this.emit('change'); }

  /** Quem conta os scrobbles desta plataforma: 'app', 'ws' (Web Scrobbler) ou 'off' */
  ownerOf(pid) {
    const by = this.store.get('scrobbleBy') || {};
    return ['app', 'ws', 'off'].includes(by[pid]) ? by[pid] : 'app';
  }
  /** O próprio app conta esta plataforma? (só quando o dono é 'app' e a conta do Last.fm está ligada) */
  enabled(pid) {
    return this.ownerOf(pid) === 'app' && this.store.get('scrobbleOn') && this.connected;
  }

  /** Recebe o estado de uma plataforma a cada mudança (e a cada poucos segundos enquanto toca) */
  update(pid, s) {
    const now = Date.now();
    let cur = this.cur[pid];
    // nada tocando, podcast, ou anúncio do Spotify grátis (sem álbum e sem link de faixa)
    if (!s || !s.title || s.episode || (pid === 'spotify' && !s.album && !s.trackId)) { if (cur) { cur.playing = false; cur.lastAt = now; } return; }
    const artist = (s.artists && s.artists[0]) || '';
    const track = s.title;
    if (!artist || AD.test(track.trim()) || AD.test(artist.trim())) return;
    const key = `${norm(artist)}|${norm(track)}`;
    const pos = s.positionMs || 0;
    // faixa nova, ou a mesma recomeçou do zero depois de já ter sido ouvida
    const restarted = cur && cur.key === key && cur.done && pos < 5000 && cur.lastPos > pos + 20000;
    if (!cur || cur.key !== key || restarted) {
      cur = this.cur[pid] = { pid, key, artist, track, album: s.album || '', durationMs: s.durationMs || 0, ts: Math.floor((now - pos) / 1000), played: 0, lastAt: now, playing: !!s.playing, lastPos: pos, nowSent: false, done: false };
    } else {
      if (cur.playing) cur.played += Math.max(0, Math.min(now - cur.lastAt, 15000));
      cur.lastAt = now; cur.playing = !!s.playing; cur.lastPos = pos;
      if (!cur.durationMs && s.durationMs) cur.durationMs = s.durationMs;
      if (!cur.album && s.album) cur.album = s.album;
    }
    if (!this.enabled(pid)) return;
    if (cur.playing && !cur.nowSent) {
      cur.nowSent = true;
      this.api.nowPlaying(cur).then(() => this.emit('now', { pid, artist, track }), (e) => this.fail(e));
    }
    const dur = cur.durationMs;
    if (dur && dur <= 30000) return; // curta demais para o Last.fm
    const need = Number(process.env.LFS_SCROBBLE_NEED) || (dur ? Math.min(dur / 2, 240000) : 240000);
    if (!cur.done && cur.played >= need) {
      cur.done = true;
      this.submit({ pid, artist: cur.artist, track: cur.track, album: cur.album, durationMs: cur.durationMs, ts: cur.ts });
    }
  }

  async submit(t) {
    // já mandado agora há pouco (a mesma faixa detectada duas vezes)?
    if (this.sent.some((x) => x.key === `${norm(t.artist)}|${norm(t.track)}` && Math.abs(x.ts - t.ts) < 120)) return;
    this.sent.push({ key: `${norm(t.artist)}|${norm(t.track)}`, ts: t.ts });
    if (this.sent.length > 50) this.sent.shift();
    // confere se o próprio serviço (ou outro scrobbler) já mandou
    const wait = NATIVE.has(t.pid) ? Number(process.env.LFS_SCROBBLE_WAIT ?? 75000) : Number(process.env.LFS_SCROBBLE_WAIT_OTHER ?? 4000);
    if (wait) await new Promise((r) => setTimeout(r, wait));
    try {
      if (this.user) {
        const list = await this.api.recent(this.user, t.ts - 90);
        const k = `${norm(t.artist)}|${norm(t.track)}`;
        if (list.some((x) => !x.live && `${norm(x.artist)}|${norm(x.track)}` === k)) {
          this.last = { artist: t.artist, track: t.track, pid: t.pid, via: 'service', at: Date.now() };
          this.log('scrobbles: já estava no Last.fm', t.pid, t.artist, '-', t.track);
          this.emit('scrobbled', this.last);
          this.emit('change');
          return;
        }
      }
    } catch (e) { if (e.code === 'session' || e.code === 'nokey') { this.fail(e); return; } /* sem conferir: manda assim mesmo */ }
    this.queue.push({ artist: t.artist, track: t.track, album: t.album, durationMs: t.durationMs, ts: t.ts, pid: t.pid });
    this.saveQueue();
    await this.flush();
  }
  saveQueue() { try { fs.writeFileSync(this.queueFile, JSON.stringify(this.queue.slice(-500))); } catch (_) { /* sem disco */ } }
  async flush() {
    if (this.flushing || !this.queue.length || !this.connected) return;
    this.flushing = true;
    try {
      // o Last.fm só aceita scrobbles de até 14 dias
      const limit = Math.floor(Date.now() / 1000) - 13.5 * 24 * 3600;
      this.queue = this.queue.filter((t) => t.ts > limit);
      while (this.queue.length) {
        const batch = this.queue.slice(0, 50);
        await this.api.scrobble(batch);
        this.queue.splice(0, batch.length);
        this.saveQueue();
        const t = batch[batch.length - 1];
        this.last = { artist: t.artist, track: t.track, pid: t.pid, via: 'app', at: Date.now() };
        this.lastError = '';
        this.log('scrobbles: enviado', batch.length, t.pid, t.artist, '-', t.track);
        this.emit('scrobbled', this.last);
      }
    } catch (e) { this.fail(e); } finally { this.flushing = false; this.refreshStatus(); this.emit('change'); }
  }
  fail(e) {
    if (e.code === 'session') { this.api.set({ sk: '' }); this.save(); this.lastError = 'A autorização do Last.fm foi revogada. Autorize de novo.'; }
    else if (e.code === 'nokey') this.lastError = 'A chave da API do Last.fm não é válida.';
    else if (e.code === 'network' || e.code === 'offline' || e.code === 'rate') this.lastError = '';
    else this.lastError = e.message;
    if (e.code !== 'network') this.log('scrobbles: erro', e.code || '', e.message);
    this.refreshStatus();
    this.emit('change');
  }
}

module.exports = { Scrobbler, LastfmApi, norm };

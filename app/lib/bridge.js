'use strict';
/* Ponte instalada dentro do web player do Spotify (roda na página, no navegador escondido).
 * Lê o que está tocando e aperta os botões do próprio player, como você faria com o mouse.
 * Usa os marcadores data-testid do web player e a Media Session (a mesma que alimenta os
 * controles de mídia do Windows). Se o Spotify mudar algum marcador, só esta parte precisa de ajuste. */

function bridge() {
  if (window.__lfs) return;
  const T = (id, root = document) => root.querySelector(`[data-testid="${id}"]`);
  const TT = (id, root = document) => Array.from(root.querySelectorAll(`[data-testid="${id}"]`));
  const txt = (n) => (n ? (n.textContent || '').replace(/\s+/g, ' ').trim() : '');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const idOf = (href, kind) => { const m = String(href || '').match(new RegExp(`/${kind}/([A-Za-z0-9]{10,})`)); return m ? m[1] : null; };
  const parseTime = (s) => {
    const p = String(s || '').trim().replace(/^-/, '').split(':').map((x) => Number(x));
    if (!p.length || p.some((x) => Number.isNaN(x))) return 0;
    return p.reduce((a, b) => a * 60 + b, 0) * 1000;
  };
  const visible = (el) => !!el && !el.disabled && el.getAttribute('aria-disabled') !== 'true';
  // sem login o Spotify usa endereços como /intl-pt/album/…; compara tudo sem esse prefixo
  const norm = (p) => String(p || '').replace(/^\/intl-[a-z]{2}(?:-[a-z]{2,4})?(?=\/)/i, '') || '/';
  const here = (p) => norm(location.pathname) === norm(p);
  const OUT_TXT = /^(entrar|log in|login|inscrever-se|inscreva-se|sign up|cadastre-se)$/i;
  function auth(pp) {
    if (T('user-widget-link') || T('user-widget-avatar')) return true;
    if (T('login-button') || T('signup-button')) return false;
    const top = document.querySelector('header') || document.querySelector('[data-testid="topbar-content-wrapper"]') || document.body;
    for (const b of top.querySelectorAll('button, a')) { if (OUT_TXT.test(txt(b))) return false; }
    return T('now-playing-bar') || pp ? true : null;
  }

  function rangeOf(id) {
    const box = T(id);
    return box ? box.querySelector('input[type="range"]') : null;
  }
  function setRange(input, value) {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function read() {
    const md = navigator.mediaSession && navigator.mediaSession.metadata;
    const widget = T('now-playing-widget');
    const link = widget && (T('context-item-link', widget) || widget.querySelector('a[href*="/track/"], a[href*="/episode/"]'));
    const artistEls = widget ? (TT('context-item-info-artist', widget).length ? TT('context-item-info-artist', widget) : Array.from(widget.querySelectorAll('a[href*="/artist/"]'))) : [];
    let image = null;
    if (md && md.artwork && md.artwork.length) {
      image = md.artwork.slice().sort((a, b) => (parseInt(b.sizes, 10) || 0) - (parseInt(a.sizes, 10) || 0))[0].src;
    } else if (widget) image = (widget.querySelector('img') || {}).src || null;
    const pp = T('control-button-playpause');
    const label = pp ? pp.getAttribute('aria-label') || '' : '';
    const ms = navigator.mediaSession ? navigator.mediaSession.playbackState : 'none';
    const playing = ms === 'playing' || (ms !== 'paused' && /paus/i.test(label));
    const prog = rangeOf('playback-progressbar');
    let positionMs = parseTime(txt(T('playback-position')));
    let durationMs = parseTime(txt(T('playback-duration')));
    if (prog && Number(prog.max) > 1000) { positionMs = Number(prog.value) || positionMs; durationMs = Number(prog.max) || durationMs; }
    const sh = T('control-button-shuffle');
    const rp = T('control-button-repeat');
    const rpState = rp ? rp.getAttribute('aria-checked') : 'false';
    const like = widget && (widget.querySelector('button[data-testid="add-button"]') || widget.querySelector('button[aria-checked][aria-label*="Liked"], button[aria-checked][aria-label*="Curtid"]'));
    const vol = rangeOf('volume-bar');
    const href = link ? link.getAttribute('href') || '' : '';
    return {
      v: 1,
      path: norm(location.pathname),
      loggedIn: auth(pp),
      ready: !!pp,
      playing,
      title: (md && md.title) || txt(link),
      artists: md && md.artist ? md.artist.split(/,\s*/) : artistEls.map(txt).filter(Boolean),
      album: (md && md.album) || '',
      image,
      trackId: idOf(href, 'track'),
      episode: /\/episode\//.test(href),
      positionMs, durationMs,
      shuffle: sh ? sh.getAttribute('aria-checked') === 'true' : false,
      repeat: rpState === 'mixed' ? 'track' : rpState === 'true' ? 'context' : 'off',
      liked: like ? like.getAttribute('aria-checked') === 'true' : null,
      volume: vol ? Math.round((Number(vol.value) / (Number(vol.max) || 1)) * 100) : null,
      canNext: visible(T('control-button-skip-forward')),
      canPrev: visible(T('control-button-skip-back')),
      at: Date.now(),
    };
  }

  // Envia o estado ao app quando muda (e de tempos em tempos, para o relógio da música)
  let last = '';
  let lastSent = 0;
  function tick() {
    try {
      const s = read();
      const key = JSON.stringify({ ...s, at: 0, positionMs: Math.round(s.positionMs / 4000) });
      if (key !== last || Date.now() - lastSent > 5000) {
        last = key; lastSent = Date.now();
        if (typeof window.__lfsPush === 'function') window.__lfsPush(JSON.stringify(s));
      }
      // aviso de cookies: escolhe só os necessários
      const reject = document.getElementById('onetrust-reject-all-handler');
      if (reject && reject.offsetParent !== null) reject.click();
    } catch (_) { /* página trocando */ }
  }
  setInterval(tick, 700);
  if (navigator.mediaSession) {
    // reage na hora quando o Spotify troca a música
    try {
      const proto = Object.getPrototypeOf(navigator.mediaSession);
      const desc = Object.getOwnPropertyDescriptor(proto, 'metadata');
      if (desc && desc.set) {
        Object.defineProperty(navigator.mediaSession, 'metadata', {
          configurable: true,
          get() { return desc.get.call(this); },
          set(v) { desc.set.call(this, v); setTimeout(tick, 50); },
        });
      }
    } catch (_) { /* segue com o relógio */ }
  }

  async function waitFor(fn, ms = 8000, step = 150) {
    const t = Date.now();
    while (Date.now() - t < ms) {
      try { const v = fn(); if (v) return v; } catch (_) { /* tenta de novo */ }
      await sleep(step);
    }
    return null;
  }
  function go(path) {
    if (here(path)) return true;
    history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
    return true;
  }

  /** Candidatos na página de busca do próprio Spotify */
  function candidates(kind) {
    const main = document.querySelector('main') || document.body;
    if (kind === 'tracks') {
      return TT('tracklist-row', main).map((row) => {
        const a = row.querySelector('a[href*="/track/"]');
        const al = row.querySelector('a[href*="/album/"]');
        return a ? { id: idOf(a.getAttribute('href'), 'track'), name: txt(a), artists: Array.from(row.querySelectorAll('a[href*="/artist/"]')).map((x) => ({ name: txt(x) })), albumId: al ? idOf(al.getAttribute('href'), 'album') : null } : null;
      }).filter((x) => x && x.id).slice(0, 10);
    }
    const type = kind === 'albums' ? 'album' : 'artist';
    const seen = new Map();
    for (const a of main.querySelectorAll(`a[href*="/${type}/"]`)) {
      const id = idOf(a.getAttribute('href'), type);
      if (!id) continue;
      const name = txt(a);
      const cur = seen.get(id) || { id, name: '', artists: [], album_type: 'album' };
      if (name.length > cur.name.length) cur.name = name;
      if (type === 'album' && !cur.artists.length) {
        let box = a;
        for (let i = 0; i < 5 && box; i++) { box = box.parentElement; if (box && box.querySelector('a[href*="/artist/"]')) break; }
        if (box) cur.artists = Array.from(box.querySelectorAll('a[href*="/artist/"]')).map((x) => ({ name: txt(x) }));
      }
      seen.set(id, cur);
      if (seen.size >= 10) break;
    }
    return Array.from(seen.values()).filter((x) => x.name);
  }

  function clickPlayHere() {
    const btn = document.querySelector('[data-testid="action-bar-row"] [data-testid="play-button"]') || document.querySelector('main [data-testid="play-button"]');
    if (!btn) return false;
    const label = btn.getAttribute('aria-label') || '';
    if (/paus/i.test(label)) return true; // já está tocando isto
    btn.click();
    return true;
  }
  function dblRow(trackId) {
    const row = TT('tracklist-row').find((r) => { const a = r.querySelector('a[href*="/track/"]'); return a && idOf(a.getAttribute('href'), 'track') === trackId; });
    if (!row) return false;
    const play = row.querySelector('button[data-testid="play-button"], button[aria-label^="Play"], button[aria-label^="Tocar"], button[aria-label^="Reproduzir"]');
    if (play) { play.click(); return true; }
    row.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    return true;
  }
  const playingNow = () => { const s = read(); return s.playing ? s : null; };

  window.__lfs = {
    read,
    tick,
    go,
    candidates,
    async open(path, ready) {
      go(path);
      const ok = await waitFor(() => here(path) && (ready ? document.querySelector(ready) : true), 9000);
      return !!ok;
    },
    async searchOn(path) {
      go(path);
      return waitFor(() => { const kind = path.split('/')[3] || 'tracks'; const c = candidates(kind); return c.length ? c : null; }, 9000);
    },
    async playEntity(path) {
      go(path);
      const btn = await waitFor(() => here(path) && (document.querySelector('[data-testid="action-bar-row"] [data-testid="play-button"]') || document.querySelector('main [data-testid="play-button"]')), 9000);
      if (!btn) return { ok: false, why: 'sem botão de tocar' };
      const before = read().title;
      clickPlayHere();
      const s = await waitFor(() => { const r = read(); return r.playing && (r.title !== before || r.title) ? r : null; }, 8000);
      return { ok: !!s };
    },
    async playTrackIn(path, trackId) {
      go(path);
      const row = await waitFor(() => here(path) && TT('tracklist-row').find((r) => { const a = r.querySelector('a[href*="/track/"]'); return a && idOf(a.getAttribute('href'), 'track') === trackId; }), 9000);
      if (!row) return { ok: false, why: 'faixa não encontrada' };
      dblRow(trackId);
      const s = await waitFor(() => { const r = read(); return r.playing && r.trackId === trackId ? r : null; }, 8000);
      return { ok: !!s };
    },
    async playTop(path) {
      go(path);
      const btn = await waitFor(() => here(path) && document.querySelector('[data-testid="top-result-card"] [data-testid="play-button"], [data-testid="top-result-card"] button'), 9000);
      if (!btn) return { ok: false, why: 'sem resultado' };
      btn.click();
      return { ok: !!(await waitFor(playingNow, 8000)) };
    },
    cmd(name, arg) {
      const click = (id) => { const b = T(id); if (!visible(b)) return { ok: false, why: `botão ${id} indisponível` }; b.click(); setTimeout(tick, 80); return { ok: true }; };
      switch (name) {
        case 'toggle': return click('control-button-playpause');
        case 'play': return read().playing ? { ok: true } : click('control-button-playpause');
        case 'pause': return read().playing ? click('control-button-playpause') : { ok: true };
        case 'next': return click('control-button-skip-forward');
        case 'prev': return click('control-button-skip-back');
        case 'shuffle': return click('control-button-shuffle');
        case 'repeat': return click('control-button-repeat');
        case 'seek': {
          const r = rangeOf('playback-progressbar');
          if (!r) return { ok: false, why: 'sem barra de progresso' };
          const max = Number(r.max) || 1;
          const v = max > 1000 ? arg : (arg / Math.max(1, read().durationMs)) * max;
          setRange(r, Math.max(0, Math.min(max, Math.round(v)))); setTimeout(tick, 80);
          return { ok: true };
        }
        case 'volume': {
          const r = rangeOf('volume-bar');
          if (!r) return { ok: false, why: 'sem controle de volume' };
          const max = Number(r.max) || 1;
          setRange(r, (Math.max(0, Math.min(100, arg)) / 100) * max); setTimeout(tick, 80);
          return { ok: true };
        }
        case 'like': {
          const w = T('now-playing-widget');
          const b = w && (w.querySelector('button[data-testid="add-button"]') || w.querySelector('button[aria-checked]'));
          if (!b) return { ok: false, why: 'sem botão de curtir' };
          b.click(); setTimeout(tick, 120);
          return { ok: true };
        }
        default: return { ok: false, why: 'comando desconhecido' };
      }
    },
  };
  tick();
}

module.exports = { source: `(${bridge.toString()})();` };

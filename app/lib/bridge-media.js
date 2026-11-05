'use strict';
/* Ponte genérica para os players de música na web (YouTube Music, Deezer, SoundCloud, Apple Music, Tidal…).
 * Roda dentro da página, antes do código do site. Lê o que está tocando pela Media Session (a mesma
 * informação que aparece nos controles de mídia do Windows) e pelo elemento de áudio/vídeo, e aperta
 * play, pausa, próxima e anterior pelos mesmos comandos que as teclas de mídia usam. Não depende do
 * desenho de cada site, por isso continua funcionando quando eles mudam a página. */

function mediaBridge() {
  if (window.__lfm) return;
  const handlers = {};
  const medias = new Set();
  let pos = null; // último setPositionState: { duration, position, playbackRate, at }

  // ---- ganchos na Media Session ----
  try {
    const ms = navigator.mediaSession;
    if (ms) {
      const proto = Object.getPrototypeOf(ms);
      const setAH = proto.setActionHandler;
      proto.setActionHandler = function (action, fn) {
        if (fn) handlers[action] = fn; else delete handlers[action];
        try { return setAH.call(this, action, fn); } catch (_) { return undefined; }
      };
      const setPS = proto.setPositionState;
      if (setPS) {
        proto.setPositionState = function (st) {
          if (st && Number.isFinite(st.duration)) pos = { duration: st.duration, position: st.position || 0, rate: st.playbackRate || 1, at: Date.now() };
          else pos = null;
          try { return setPS.call(this, st); } catch (_) { return undefined; }
        };
      }
      for (const prop of ['metadata', 'playbackState']) {
        const d = Object.getOwnPropertyDescriptor(proto, prop);
        if (d && d.set) {
          Object.defineProperty(ms, prop, {
            configurable: true,
            get() { return d.get.call(this); },
            set(v) { d.set.call(this, v); setTimeout(tick, 30); },
          });
        }
      }
    }
  } catch (_) { /* segue só com o elemento de mídia */ }

  // ---- elementos de áudio/vídeo (inclusive os que nunca entram na página) ----
  try {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...a) { medias.add(this); setTimeout(tick, 30); return play.apply(this, a); };
  } catch (_) { /* ignorado */ }
  // vídeos mudos de fundo, prévias em loop e anúncios curtos não contam como "a música que está tocando"
  const audible = (m) => !!m && !m.muted && m.volume > 0 && !(m.loop && !(m.duration > 90));
  const mediaEl = () => {
    for (const m of document.querySelectorAll('audio, video')) medias.add(m);
    let best = null;
    for (const m of medias) {
      if (!m || !(m.currentSrc || m.src || m.srcObject) || !audible(m)) continue;
      if (!best || (!m.paused && best.paused) || (m.duration > 0 && !(best.duration > 0))) best = m;
    }
    return best;
  };

  const txt = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  function read() {
    const ms = navigator.mediaSession;
    const md = ms && ms.metadata;
    const el = mediaEl();
    const state = ms ? ms.playbackState : 'none';
    const elPlaying = !!el && !el.paused && !el.ended && el.readyState > 2;
    // só conta como tocando uma música de verdade: com título e com som
    const hasTitle = !!(md && txt(md.title));
    const playing = hasTitle && (state === 'playing' ? (!el || elPlaying || el.paused === false || !medias.size) : (state !== 'paused' && elPlaying));
    let durationMs = 0, positionMs = 0;
    if (pos && pos.duration > 0) {
      durationMs = pos.duration * 1000;
      positionMs = Math.min(durationMs, (pos.position + (playing ? ((Date.now() - pos.at) / 1000) * pos.rate : 0)) * 1000);
    } else if (el && Number.isFinite(el.duration) && el.duration > 0) {
      durationMs = el.duration * 1000; positionMs = el.currentTime * 1000;
    }
    let image = null;
    if (md && md.artwork && md.artwork.length) image = md.artwork.slice().sort((a, b) => (parseInt(b.sizes, 10) || 0) - (parseInt(a.sizes, 10) || 0))[0].src;
    const artist = md ? txt(md.artist) : '';
    return {
      v: 2,
      path: location.pathname,
      host: location.hostname,
      ready: true,
      loggedIn: null,
      playing,
      title: md ? txt(md.title) : '',
      artists: artist ? artist.split(/\s*(?:,|&|\bfeat\.?|\bft\.?|•|·)\s*/i).filter(Boolean).slice(0, 4) : [],
      album: md ? txt(md.album) : '',
      image,
      positionMs: Math.round(positionMs), durationMs: Math.round(durationMs),
      volume: el ? Math.round(el.volume * 100) : null,
      canNext: !!handlers.nexttrack,
      canPrev: !!handlers.previoustrack,
      liked: null, shuffle: false, repeat: 'off',
      at: Date.now(),
    };
  }

  let last = '', lastSent = 0;
  function tick() {
    try {
      const s = read();
      const key = JSON.stringify({ ...s, at: 0, positionMs: Math.round(s.positionMs / 5000) });
      if (key !== last || Date.now() - lastSent > 5000) {
        last = key; lastSent = Date.now();
        if (typeof window.__lfsPush === 'function') window.__lfsPush(JSON.stringify(s));
      }
    } catch (_) { /* página trocando */ }
  }
  setInterval(tick, 1000);

  function act(action, details) {
    const fn = handlers[action];
    if (!fn) return false;
    try { fn({ action, ...details }); return true; } catch (_) { return false; }
  }
  window.__lfm = {
    read,
    cmd(name, arg) {
      const el = mediaEl();
      const playing = read().playing;
      const done = (ok, why) => { setTimeout(tick, 120); return ok ? { ok: true } : { ok: false, why: why || 'sem controle' }; };
      switch (name) {
        case 'toggle': return name === 'toggle' && playing ? this.cmd('pause') : this.cmd('play');
        case 'play': if (act('play')) return done(true); if (el) { el.play().catch(() => {}); return done(true); } return done(false);
        case 'pause': if (act('pause')) return done(true); if (el) { el.pause(); return done(true); } return done(false);
        case 'next': return done(act('nexttrack'), 'sem próxima');
        case 'prev': return done(act('previoustrack'), 'sem anterior');
        case 'seek': {
          if (act('seekto', { seekTime: arg / 1000, fastSeek: false })) return done(true);
          if (el) { el.currentTime = arg / 1000; return done(true); }
          return done(false);
        }
        case 'volume': if (el) { el.volume = Math.max(0, Math.min(1, arg / 100)); return done(true); } return done(false);
        default: return done(false, 'comando desconhecido');
      }
    },
  };
  tick();
}

/* Avisa quando a página pede proteção de conteúdo (DRM) e o navegador não tem: o app sugere abrir pelo Edge */
function drmProbe() {
  try {
    const orig = navigator.requestMediaKeySystemAccess && navigator.requestMediaKeySystemAccess.bind(navigator);
    if (!orig) return;
    navigator.requestMediaKeySystemAccess = function (ks, cfg) {
      return orig(ks, cfg).catch((e) => {
        try { window.dispatchEvent(new CustomEvent('lfm:drm', { detail: String(ks || '') })); } catch (_) { /* ignorado */ }
        throw e;
      });
    };
  } catch (_) { /* sem DRM nenhum */ }
}

module.exports = { source: `(${mediaBridge.toString()})();`, fn: mediaBridge, drmProbe };

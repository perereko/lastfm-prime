'use strict';
/* Plataformas que tocam no painel do app. Todas rodam no mesmo navegador escondido (o Edge, que toca
 * conteúdo protegido), cada uma na sua aba, com o login que você fizer nela. */
const env = process.env;
const SPOTIFY = (env.LFS_PLAYER_URL || 'https://open.spotify.com').replace(/\/$/, '');

const PLATFORMS = {
  spotify: { name: 'Spotify', color: '#1ed760', home: `${SPOTIFY}/`, hosts: ['open.spotify.com'] },
  ytmusic: { name: 'YouTube Music', color: '#ff4e45', home: env.LFS_PLATFORM_YTMUSIC || 'https://music.youtube.com/', hosts: ['music.youtube.com'], search: (q) => `https://music.youtube.com/search?q=${encodeURIComponent(q)}` },
  deezer: { name: 'Deezer', color: '#a238ff', home: env.LFS_PLATFORM_DEEZER || 'https://www.deezer.com/br/', hosts: ['www.deezer.com', 'deezer.com'], search: (q) => `https://www.deezer.com/search/${encodeURIComponent(q)}` },
  soundcloud: { name: 'SoundCloud', color: '#ff7a1a', home: env.LFS_PLATFORM_SOUNDCLOUD || 'https://soundcloud.com/discover', hosts: ['soundcloud.com', 'm.soundcloud.com'], search: (q) => `https://soundcloud.com/search?q=${encodeURIComponent(q)}` },
  apple: { name: 'Apple Music', color: '#fa586a', home: env.LFS_PLATFORM_APPLE || 'https://music.apple.com/br/browse', hosts: ['music.apple.com'], search: (q) => `https://music.apple.com/br/search?term=${encodeURIComponent(q)}` },
  tidal: { name: 'Tidal', color: '#7ff3ff', home: env.LFS_PLATFORM_TIDAL || 'https://listen.tidal.com/', hosts: ['listen.tidal.com'], search: (q) => `https://listen.tidal.com/search?q=${encodeURIComponent(q)}` },
};
const ORDER = ['spotify', 'ytmusic', 'deezer', 'soundcloud', 'apple', 'tidal'];

/** De qual plataforma é um endereço (ou null) */
function platformOf(url) {
  let u;
  try { u = new URL(url); } catch (_) { return null; }
  for (const id of ORDER) {
    const p = PLATFORMS[id];
    if (p.hosts.includes(u.hostname)) return id;
    try { if (new URL(p.home).host === u.host) return id; } catch (_) { /* endereço de teste */ }
  }
  return null;
}

/** O que a interface precisa saber de cada plataforma */
const publicList = () => ORDER.map((id) => ({ id, name: PLATFORMS[id].name, color: PLATFORMS[id].color }));

module.exports = { PLATFORMS, ORDER, platformOf, publicList };

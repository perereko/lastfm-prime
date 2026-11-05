'use strict';
/* Configurações (JSON) e segredos (tokens do Spotify) na pasta de dados do app.
 * Os tokens são cifrados com o cofre do sistema (DPAPI no Windows) quando disponível. */
const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  clientId: '',
  welcomed: false,
  likeOnLastfm: true,      // curtir no Spotify também curte no Last.fm
  follow: false,           // a página do Last.fm acompanha a música que toca
  scrobbleWatch: true,     // avisa quando o Spotify não manda o scrobble
  albumContext: true,      // tocar uma faixa e seguir com o resto do álbum
  launchSpotify: true,     // liga o Spotify do PC, escondido, quando nenhum aparelho está ativo
  spotifyAtStart: true,    // deixa o Spotify do PC pronto em segundo plano ao abrir o app
  closeSpotify: true,      // fecha o Spotify junto com o app (só quando foi o app que o ligou)
  blockAds: true,          // corta anúncios e rastreadores do Last.fm antes de carregarem
  engine: 'web',           // 'web': web player do Spotify escondido (grátis ou Premium); 'desktop': app do Spotify (precisa da API)
  playerAtStart: true,     // liga o web player escondido ao abrir o app
  // Painel do player à direita
  panelOpen: false,
  panelPlatform: 'spotify',
  panelWidth: 440,
  panelLayouts: {},        // { plataforma: 'mobile' | 'desktop' }
  pauseOthers: true,       // ao dar play numa plataforma, pausa as outras
  onePlayer: true,         // só um player aberto por vez (os outros fecham, o Spotify descansa)
  panelAutoHide: true,     // clicar fora do painel do player recolhe o painel
  intro: true,             // animação de abertura ao abrir o app
  // Scrobbles feitos pelo próprio app (API do Last.fm com a sua chave)
  scrobbleOn: true,
  scrobbleSources: { spotify: true, ytmusic: true, deezer: true, soundcloud: true, apple: true, tidal: true },
  // Quem conta os scrobbles de cada plataforma: 'app' (o próprio app), 'ws' (a extensão Web Scrobbler) ou 'off'
  scrobbleBy: { spotify: 'app', ytmusic: 'app', deezer: 'app', soundcloud: 'app', apple: 'app', tidal: 'app' },
  // Usar a extensão Web Scrobbler dentro do player (precisa recarregar o player ao ligar/desligar)
  webScrobbler: false,
  // Desempenho
  perfMode: 'full',        // 'full' (experiência completa) | 'perf' (desempenho)
  lastDeviceId: '',
  bounds: null,
  maximized: false,
  miniBounds: null,
};

class Store {
  constructor(dir, safeStorage) {
    this.dir = dir;
    this.file = path.join(dir, 'configuracoes.json');
    this.secretFile = path.join(dir, 'spotify-token.bin');
    this.secretFiles = { spotify: this.secretFile, lastfm: path.join(dir, 'lastfm-sessao.bin') };
    this.safe = safeStorage;
    this.data = { ...DEFAULTS };
    try { Object.assign(this.data, JSON.parse(fs.readFileSync(this.file, 'utf8'))); } catch (_) { /* primeira vez */ }
    this.migrate();
    this.timer = null;
  }
  /** Ajusta configurações de versões antigas sem perder as escolhas do usuário */
  migrate() {
    const by = { ...DEFAULTS.scrobbleBy, ...(this.data.scrobbleBy && typeof this.data.scrobbleBy === 'object' ? this.data.scrobbleBy : {}) };
    // versões antigas tinham só "ligado/desligado" por plataforma (scrobbleSources): desligado vira "não contar"
    const src = this.data.scrobbleSources;
    if (src && typeof src === 'object') { for (const id of Object.keys(DEFAULTS.scrobbleBy)) if (src[id] === false && !(this.data.scrobbleBy && this.data.scrobbleBy[id])) by[id] = 'off'; }
    for (const id of Object.keys(by)) if (!['app', 'ws', 'off'].includes(by[id])) by[id] = 'app';
    if (by.spotify === 'ws') by.spotify = 'app'; // o Web Scrobbler não conta o Spotify (ele deixa isso para o próprio Last.fm)
    this.data.scrobbleBy = by;
  }
  get(k) { return this.data[k]; }
  set(patch) {
    Object.assign(this.data, patch);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), 300);
  }
  flush() {
    clearTimeout(this.timer);
    try {
      fs.mkdirSync(this.dir, { recursive: true });
      const tmp = this.file + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
      fs.renameSync(tmp, this.file);
    } catch (_) { /* pasta sem permissão de escrita: segue com o que está na memória */ }
  }
  public() {
    const { bounds, miniBounds, maximized, lastDeviceId, ...rest } = this.data;
    return rest;
  }

  canEncrypt() { try { return !!this.safe && this.safe.isEncryptionAvailable(); } catch (_) { return false; } }
  readSecret(name = 'spotify') {
    try {
      const raw = fs.readFileSync(this.secretFiles[name] || this.secretFile);
      if (raw.subarray(0, 4).toString() === 'enc:') return JSON.parse(this.safe.decryptString(raw.subarray(4)));
      if (raw.subarray(0, 4).toString() === 'raw:') return JSON.parse(raw.subarray(4).toString('utf8'));
    } catch (_) { /* sem token, ou cifrado em outro computador/usuário */ }
    return null;
  }
  writeSecret(obj, name = 'spotify') {
    const file = this.secretFiles[name] || this.secretFile;
    try {
      fs.mkdirSync(this.dir, { recursive: true });
      if (!obj) { fs.rmSync(file, { force: true }); return; }
      const json = JSON.stringify(obj);
      const buf = this.canEncrypt()
        ? Buffer.concat([Buffer.from('enc:'), this.safe.encryptString(json)])
        : Buffer.concat([Buffer.from('raw:'), Buffer.from(json, 'utf8')]);
      fs.writeFileSync(file, buf);
    } catch (_) { /* ignorado */ }
  }
}

module.exports = { Store, DEFAULTS };

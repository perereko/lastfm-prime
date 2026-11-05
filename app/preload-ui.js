'use strict';
/* Ponte entre a interface do app (barra de cima, painel do player, folhas) e o processo principal. */
const { contextBridge, ipcRenderer } = require('electron');

const on = (ch) => (fn) => {
  const h = (_e, data) => fn(data);
  ipcRenderer.on(ch, h);
  return () => ipcRenderer.removeListener(ch, h);
};

contextBridge.exposeInMainWorld('lfs', {
  state: () => ipcRenderer.invoke('state:get'),
  onState: on('state'),
  onToast: on('toast'),
  onPage: on('page'),
  onProgress: on('playlist:progress'),
  onOverlay: on('overlay:open'),
  onIntro: on('intro'),

  setClientId: (id) => ipcRenderer.invoke('sp:client', id),
  login: () => ipcRenderer.invoke('sp:login'),
  cancelLogin: () => ipcRenderer.invoke('sp:cancel'),
  logout: () => ipcRenderer.invoke('sp:logout'),
  cmd: (cmd, arg) => ipcRenderer.invoke('sp:cmd', { cmd, arg }),
  devices: () => ipcRenderer.invoke('sp:devices'),
  transfer: (id) => ipcRenderer.invoke('sp:transfer', id),
  like: () => ipcRenderer.invoke('sp:like'),
  launchSpotify: () => ipcRenderer.invoke('sp:launch'),
  playerLogin: () => ipcRenderer.invoke('player:login'),
  playerShow: (on) => ipcRenderer.invoke('player:show', on),
  playerStart: () => ipcRenderer.invoke('player:start'),
  playerWindow: (on) => ipcRenderer.invoke('player:window', on),
  popupFront: () => ipcRenderer.invoke('player:popups'),

  // painel do player à direita
  panel: (patch) => ipcRenderer.invoke('panel:set', patch),
  panelView: (v) => ipcRenderer.invoke('panel:view', v),
  panelInput: (ev) => ipcRenderer.send('panel:input', ev),
  panelOutside: () => ipcRenderer.send('panel:outside'),
  panelStuck: (info) => ipcRenderer.send('panel:stuck', info),
  onFrame: on('panel:frame'),
  onPanelReset: on('panel:reset'),

  // tema, desempenho e cache
  extGet: () => ipcRenderer.invoke('ext:get'),
  extSet: (patch) => ipcRenderer.invoke('ext:set', patch),
  perf: (mode) => ipcRenderer.invoke('perf:set', mode),
  cacheSize: () => ipcRenderer.invoke('cache:size'),
  clearCache: () => ipcRenderer.invoke('cache:clear'),

  // scrobbles pelo app
  lfmKeys: (key, secret) => ipcRenderer.invoke('lfm:keys', { key, secret }),
  lfmCreateKey: () => ipcRenderer.invoke('lfm:create-key'),
  lfmAuth: () => ipcRenderer.invoke('lfm:auth'),
  lfmCancel: () => ipcRenderer.invoke('lfm:cancel'),
  lfmLogout: () => ipcRenderer.invoke('lfm:logout'),
  lfmForget: () => ipcRenderer.invoke('lfm:forget'),

  nav: (go, url) => ipcRenderer.invoke('nav', { go, url }),
  openNow: (what) => ipcRenderer.invoke('lf:open-now', what),
  collect: () => ipcRenderer.invoke('playlist:collect'),
  createPlaylist: (data) => ipcRenderer.invoke('playlist:create', data),
  openSpotifyUri: (uri) => ipcRenderer.invoke('sp:open-uri', uri),
  playUri: (uri, name) => ipcRenderer.invoke('sp:play', { uri, name }),

  settings: (patch) => ipcRenderer.invoke('settings:set', patch),
  overlay: (open) => ipcRenderer.invoke('overlay', open),
  hubSettings: (rect) => ipcRenderer.invoke('hub:settings', rect),
  copy: (text) => ipcRenderer.invoke('copy', text),
  external: (url) => ipcRenderer.invoke('external', url),
  openData: () => ipcRenderer.invoke('open-data'),
  wsOptions: (page) => ipcRenderer.invoke('ws:options', page),
});

'use strict';
/* Ponte da animação de abertura com o app: começar, Last.fm pronto, saída e fim. */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lfi', {
  painted: () => ipcRenderer.send('intro:painted'),
  exit: () => ipcRenderer.send('intro:exit'),
  done: () => ipcRenderer.send('intro:done'),
  onGo: (fn) => { ipcRenderer.on('intro:go', () => fn()); },
  onReady: (fn) => { ipcRenderer.on('intro:ready', () => fn()); },
});

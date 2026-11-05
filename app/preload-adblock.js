'use strict';
/* Bloqueio de anúncios dentro das páginas (Last.fm e plataformas que tocam no app).
 * Roda no começo de cada página, antes do código do site:
 *  - esconde os espaços de anúncio específicos do site (CSS do uBlock);
 *  - roda os "scriptlets" do uBlock no mundo da página (desarmam anúncios por dentro, como os do YouTube)
 *    e os do mundo isolado.
 * O que vale para cada site vem do app (listas do uBlock Origin Lite que vão junto com ele). */
const { ipcRenderer, contextBridge, webFrame } = require('electron');

(() => {
  let r = null;
  try { r = ipcRenderer.sendSync('adb:frame', location.href); } catch (_) { r = null; }
  if (!r) return;
  if (r.main) {
    try { contextBridge.executeInMainWorld({ func: new Function(r.main) }); } catch (_) { /* página especial */ }
  }
  if (r.isolated) {
    try { new Function(r.isolated)(); } catch (_) { /* página especial */ }
  }
  if (r.css) {
    try { webFrame.insertCSS(r.css, { cssOrigin: 'user' }); } catch (_) { /* página especial */ }
  }
})();

'use strict';
/* Caminhos usados pelos testes, sem nada fixo da máquina:
 * - ELECTRON_BIN: o executável do Electron (padrão: o do pacote "electron" instalado pelo npm);
 * - LFS_EXT_DIR: a extensão Last.fm Hub (padrão: a pasta extension/ do repositório). */
const path = require('path');
const ROOT = path.join(__dirname, '..');
let electron = process.env.ELECTRON_BIN;
if (!electron) { try { electron = require('electron'); } catch (_) { electron = 'electron'; } }
module.exports = {
  ROOT,
  ELECTRON: electron,
  APP_DIR: path.join(ROOT, 'app'),
  EXT_DIR: process.env.LFS_EXT_DIR || path.join(ROOT, 'extension'),
  OUT: process.env.OUT || path.join(__dirname, 'out'),
};

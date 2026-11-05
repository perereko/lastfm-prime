#!/usr/bin/env node
'use strict';
/* Copia a extensão Last.fm Hub (extension/) para dentro do app (app/extension/), que é de onde o app a carrega.
 * Roda antes de abrir o app em desenvolvimento e antes de empacotar. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'extension');
const DST = path.join(ROOT, 'app', 'extension');
fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(DST, { recursive: true });
for (const item of ['manifest.json', 'background.js', 'content', 'popup', 'icons', 'vendor']) {
  fs.cpSync(path.join(SRC, item), path.join(DST, item), { recursive: true });
}
console.log('extensão copiada:', JSON.parse(fs.readFileSync(path.join(DST, 'manifest.json'), 'utf8')).version);

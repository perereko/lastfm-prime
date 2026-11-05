'use strict';
/* Doppelgänger (#doppelganger): busca com sugestões e recomendações "fora do óbvio"
 * (vizinhos dos vizinhos, tirando os parecidos que o Last.fm já sugere). */
const H = require('./ext-harness');
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const USER = 'SENHOR_PEREREKO';
const results = [];
const check = (ok, name, info) => { results.push({ ok: !!ok, name }); console.log(`${ok ? '  ✓' : '  ✗'} ${name}${info !== undefined ? ` → ${typeof info === 'string' ? info : JSON.stringify(info)}` : ''}`); };
const until = async (fn, ms = 10000, step = 150) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn().catch(() => null); if (v) return v; await new Promise((r) => setTimeout(r, step)); } return null; };
const enc = (s) => encodeURIComponent(s).replace(/%20/g, '+');

function gridItems(names) {
  return names.map((n) => `<div class="grid-items-item"><a href="/music/${enc(n)}"><img src="https://lastfm-img.freetls.fastly.net/i/u/300x300/${enc(n)}.jpg"></a><p class="grid-items-item-main-text"><a href="/music/${enc(n)}">${n}</a></p><p class="grid-items-item-aux-text">500,000 listeners</p></div>`).join('');
}
// página de busca combinada (/search?q=) — é o caminho que o app usa primeiro, igual à paleta
function searchAll(names) {
  return `<!doctype html><html><body><div id="content"><div class="col-main"><section><h2><a href="/search/artists">Artists</a></h2><div class="grid-items">${gridItems(names)}</div></section></div></div></body></html>`;
}
// página dedicada de artistas (/search/artists?q=) — usada como reserva
function searchArtists(names) {
  return `<!doctype html><html><body><div id="content"><div class="col-main"><section><h2><a href="/search/artists">Artists</a></h2><div class="grid-items">${gridItems(names)}</div></section></div></div></body></html>`;
}
function similarPage(list) {
  const items = list.map(([n, listeners, tag]) => `<li class="similar-artists-item-wrap"><div class="similar-artists-item-name"><a href="/music/${enc(n)}">${n}</a></div><img src="https://lastfm-img.freetls.fastly.net/i/u/300x300/${enc(n)}.jpg"><span class="similar-artists-item-listeners">${listeners} listeners</span><ul class="tags-list"><li class="tag"><a href="/tag/${enc(tag)}">${tag}</a></li></ul></li>`).join('');
  return `<!doctype html><html><body><div id="content"><div class="col-main"><ul class="similar-artists">${items}</ul></div></div></body></html>`;
}
// grafo: Radiohead (semente) → parecidos óbvios: Thom Yorke, Muse, Coldplay (devem ser EXCLUÍDOS dos resultados)
const DIRECT = [['Thom Yorke', '900,000', 'alternative'], ['Muse', '3,000,000', 'alternative rock'], ['Coldplay', '5,000,000', 'alternative rock']];
const HUBS = {
  'Thom Yorke': [['Atoms for Peace', '400,000', 'electronic'], ['Flying Lotus', '600,000', 'electronic'], ['Burial', '500,000', 'electronic'], ['Muse', '3,000,000', 'rock']],
  Muse: [['Biffy Clyro', '700,000', 'rock'], ['Flying Lotus', '600,000', 'electronic'], ['Coldplay', '5,000,000', 'rock'], ['Royal Blood', '800,000', 'rock']],
  Coldplay: [['Keane', '900,000', 'rock'], ['Travis', '600,000', 'rock'], ['Flying Lotus', '600,000', 'electronic']],
};

(async () => {
  const log = [];
  const libContent = fs.readFileSync(path.join(H.FIX, 'lastfm', 'library-content.html'), 'utf8');
  const libCls = fs.readFileSync(path.join(H.FIX, 'lastfm', 'library-bodyclass.txt'), 'utf8');
  const routes = [
    { test: (u) => u.pathname === `/user/${USER}/library`, body: () => H.shell(USER, libCls, libContent, 'Library') },
    { test: (u) => u.pathname === '/search', body: () => searchAll(['Radiohead', 'Radiators']) },
    { test: (u) => u.pathname === '/search/artists', body: () => searchArtists(['Radiohead', 'Radiators']) },
    { test: (u) => u.pathname === '/music/Radiohead/+similar', body: () => similarPage(DIRECT) },
  ];
  for (const [hub, list] of Object.entries(HUBS)) routes.push({ test: (u) => u.pathname === `/music/${enc(hub)}/+similar`, body: () => similarPage(list) });

  const h = await H.open({ log, routes });
  const { page, close } = h;
  await page.goto(`https://www.last.fm/user/${USER}/library#doppelganger`, { waitUntil: 'domcontentloaded' });

  const view = await until(() => page.$('.lfx-dop'), 10000);
  check(!!view, 'a aba Doppelgänger aparece');
  const input = await until(() => page.$('.lfx-dop-input'), 4000);
  check(!!input, 'tem o campo para digitar a banda');

  // digitar mostra sugestões de artistas cadastrados
  await page.fill('.lfx-dop-input', 'rad');
  const sug = await until(async () => { const n = await page.$$eval('.lfx-dop-sugitem', (e) => e.length); return n >= 1 ? n : null; }, 8000);
  check(sug >= 1, 'enquanto digita, aparecem sugestões de artistas', sug);
  const firstSug = await page.$eval('.lfx-dop-sugitem b', (e) => e.textContent).catch(() => '');
  check(/Radiohead/.test(firstSug), 'a sugestão traz o artista cadastrado no Last.fm', firstSug);

  // escolher Radiohead dispara a descoberta "fora do óbvio"
  await page.click('.lfx-dop-sugitem');
  const cards = await until(async () => { const n = await page.$$eval('.lfx-dop-card:not(.lfx-skel)', (e) => e.length); return n >= 3 ? n : null; }, 12000);
  check(cards >= 3, 'ao escolher a banda, sugere artistas parecidos', cards);

  const names = await page.$$eval('.lfx-dop-name', (els) => els.map((e) => e.textContent));
  check(names.includes('Flying Lotus'), 'traz quem muitos vizinhos apontam (Flying Lotus)', names);
  check(names[0] === 'Flying Lotus', 'o mais "fora do óbvio" porém relacionado vem em primeiro (maior co-ocorrência)', names[0]);
  check(!names.includes('Muse') && !names.includes('Coldplay') && !names.includes('Thom Yorke'), 'os parecidos óbvios do Last.fm NÃO entram nos resultados', names);
  const common = await page.$eval('.lfx-dop-common', (e) => e.textContent).catch(() => '');
  check(/3 em comum/.test(common), 'mostra quantos vizinhos em comum apontam para o artista', common);
  const note = await page.$eval('.lfx-dop-note', (e) => e.textContent).catch(() => '');
  check(/Pulei os 3 parecidos/.test(note), 'avisa que pulou os parecidos óbvios do Last.fm', note.slice(0, 60));
  const hasPlay = await page.$eval('.lfx-dop-card .lfx-sh-btn.primary', (e) => /Ouvir/.test(e.textContent)).catch(() => false);
  check(hasPlay, 'cada sugestão tem botão para ouvir e abrir o perfil');

  const noErr = log.filter((l) => !/Failed to load resource|net::ERR|status of 4|status of 5/.test(l));
  check(noErr.length === 0, 'sem erros no console', noErr.slice(0, 4));

  const bad = results.filter((r) => !r.ok);
  console.log(`\nOK: ${results.length - bad.length}\nFALHAS: ${bad.length}`);
  await close();
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

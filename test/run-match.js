'use strict';
/* "Dê um match": botão nas páginas de artista/álbum/faixa, 4+ recomendações parecidas com afinidade,
 * ordenadas do mais parecido ao menos, e com descarte (entra o próximo no lugar). */
const H = require('./ext-harness');
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const USER = 'SENHOR_PEREREKO';
const results = [];
const check = (ok, name, info) => { results.push({ ok: !!ok, name }); console.log(`${ok ? '  ✓' : '  ✗'} ${name}${info !== undefined ? ` → ${typeof info === 'string' ? info : JSON.stringify(info)}` : ''}`); };
const until = async (fn, ms = 8000, step = 150) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn().catch(() => null); if (v) return v; await new Promise((r) => setTimeout(r, step)); } return null; };

// página de artista (o getPage classifica /music/<nome> como "artist")
const artistPage = () => H.shell(USER, 'artist-page', '<div id="content"><div class="col-main"><header class="header-new"><div class="header-new-content"><div class="header-new-info-desktop"><h1 class="header-new-title">Radiohead</h1></div></div></header></div></div>', 'Radiohead | Last.fm');
// a lista de artistas semelhantes (o que o botão busca)
function similarArtists() {
  const names = ['Thom Yorke', 'Atoms for Peace', 'Jeff Buckley', 'Portishead', 'Blur', 'Muse', 'Pixies'];
  const items = names.map((n, i) => `<li class="similar-artists-item"><a href="/music/${encodeURIComponent(n).replace(/%20/g, '+')}">${n}</a><img src="https://lastfm-img.freetls.fastly.net/i/u/300x300/${i}.jpg" alt="${n}"></li>`).join('');
  return `<!doctype html><html><body><div id="content"><div class="col-main"><ul class="similar-artists">${items}</ul></div></div></body></html>`;
}

(async () => {
  const log = [];
  const h = await H.open({ log, routes: [
    { test: (u) => u.pathname === '/music/Radiohead', body: artistPage },
    { test: (u) => u.pathname === '/music/Radiohead/+similar', body: similarArtists },
  ] });
  const { page, ctx, close } = h;
  const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  await page.goto('https://www.last.fm/music/Radiohead', { waitUntil: 'domcontentloaded' });

  const btn = await until(() => page.$('.lfx-match-btn'), 10000);
  check(!!btn, 'o botão "Dê um match" aparece na página de artista');
  if (btn) {
    const label = await page.$eval('.lfx-match-btn', (b) => b.textContent.trim());
    check(/match/i.test(label), 'o botão tem o texto "Dê um match"', label);
    await btn.click();
    const items = await until(async () => { const n = await page.$$eval('.lfx-match-item:not(.lfx-match-skel)', (els) => els.length); return n >= 4 ? n : null; }, 12000);
    check(items >= 4, 'mostra pelo menos 4 recomendações do mesmo tipo (artistas)', items);

    // afinidade em ordem decrescente (do mais parecido ao menos)
    const pcts = await page.$$eval('.lfx-match-pct', (els) => els.map((e) => parseInt(e.textContent, 10)));
    const sorted = pcts.every((v, i) => i === 0 || pcts[i - 1] >= v);
    check(sorted && pcts[0] >= pcts[pcts.length - 1] && pcts.length >= 4, 'as recomendações vêm da mais parecida para a menos (afinidade decrescente)', pcts);
    check(pcts[0] >= 85, 'a recomendação mais parecida tem afinidade alta', pcts[0]);

    // descartar a primeira: some e entra outra no lugar (continua com 4+)
    const firstName = await page.$eval('.lfx-match-item .lfx-match-name', (e) => e.textContent);
    await page.$eval('.lfx-match-item .lfx-match-x', (b) => b.click());
    const gone = await until(async () => {
      const names = await page.$$eval('.lfx-match-item .lfx-match-name', (els) => els.map((e) => e.textContent));
      return (!names.includes(firstName) && names.length >= 4) ? names.length : null;
    }, 6000);
    check(!!gone, 'descartar uma recomendação tira ela e puxa a próxima (mantém 4+)', { removed: firstName, now: gone });

    // o descarte fica guardado
    const excluded = await until(async () => sw.evaluate(async () => {
      const raw = await chrome.storage.local.get(null);
      const k = Object.keys(raw).find((x) => x.startsWith('lfx:match-x:'));
      return k ? raw[k] : null;
    }), 4000);
    check(Array.isArray(excluded) && excluded.length >= 1, 'o descarte fica guardado para não voltar', excluded);
  }

  const noErr = log.filter((l) => !/Failed to load resource|net::ERR/.test(l));
  check(noErr.length === 0, 'sem erros no console', noErr.slice(0, 4));

  const bad = results.filter((r) => !r.ok);
  console.log(`\nOK: ${results.length - bad.length}\nFALHAS: ${bad.length}`);
  await close();
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

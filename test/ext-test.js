'use strict';
/* Testes da extensão Last.fm Hub com páginas reais do Last.fm (capturadas em fixtures/lastfm):
 *  - Descobrir: todas as seções (o site divide a página em vários blocos) e o "Surpreenda-me"
 *  - Premium: "Não quero" tira a banda, outra entra no lugar, não volta depois e dá para desfazer
 *  - Cache: entradas velhas da extensão são limpas */
const H = require('./ext-harness');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const USER = 'SENHOR_PEREREKO';
const results = [];
function check(ok, name, info) {
  results.push({ ok: !!ok, name });
  console.log(`${ok ? '  ✓' : '  ✗'} ${name}${info !== undefined ? ` → ${typeof info === 'string' ? info : JSON.stringify(info)}` : ''}`);
}
const until = async (fn, ms = 8000, step = 150) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn().catch(() => null); if (v) return v; await new Promise((r) => setTimeout(r, step)); } return null; };

const musicPage = () => H.shell(USER, 'music-landing-overview namespace--music_overview content-top-has-nav', fs.readFileSync(path.join(H.FIX, 'lastfm', 'music-content.html'), 'utf8'), 'Music | Last.fm');
const albumPage = () => H.shell(USER, fs.readFileSync(path.join(H.FIX, 'lastfm', 'album-bodyclass.txt'), 'utf8'), fs.readFileSync(path.join(H.FIX, 'lastfm', 'album-content.html'), 'utf8'), 'OK Computer — Radiohead | Last.fm');
const libPage = () => H.shell(USER, fs.readFileSync(path.join(H.FIX, 'lastfm', 'library-bodyclass.txt'), 'utf8'), fs.readFileSync(path.join(H.FIX, 'lastfm', 'library-content.html'), 'utf8'), `${USER}’s Library | Last.fm`);

/** Gosto e bandas candidatas já no cache da extensão (o Premium não precisa ir ao site) */
function seed(n = 40) {
  const now = Date.now();
  const e = (v, t = now) => ({ t, v });
  const bands = Array.from({ length: n }, (_, i) => ({ name: `Banda ${String(i + 1).padStart(2, '0')}`, path: `/music/Banda+${String(i + 1).padStart(2, '0')}` }));
  const data = {
    [`lfx:prem:taste:${USER.toLowerCase()}`]: e({
      weights: [['isis', 1], ['neurosis', 0.8]], seeds: [{ name: 'Isis', path: '/music/Isis', img: null }], lfm: [],
      cands: bands.map((b, i) => ({ ...b, img: null, listeners: 5000, tags: ['post-metal', 'sludge'], sim: 3 - i * 0.05, simFrom: ['Isis'] })),
      genres: [{ key: 'post metal', tag: 'post-metal', name: 'Post-metal', score: 10 }, { key: 'sludge', tag: 'sludge', name: 'Sludge', score: 5 }],
    }),
    'lfx:tagart3:post metal': e([]),
    'lfx:prem:focus': -1,
    'lfx:pruneAt': 0,
  };
  bands.forEach((b, i) => {
    data[`lfx:mi:${b.path}`] = e({ kind: 'artist', path: b.path, title: b.name, artist: b.name, img: null, mine: 0, listeners: 5000 + i, tags: ['post-metal', 'sludge'], friends: 0,
      topAlbums: [{ title: `Disco ${i + 1}`, path: `${b.path}/Disco+${i + 1}`, img: `https://lastfm-img.freetls.fastly.net/i/u/300x300/b${i}.jpg`, meta: '2019 · 8 tracks' }] });
    data[`lfx:sim:${b.path}`] = e([]);
  });
  // lixo antigo de cache, para a limpeza
  for (let i = 0; i < 30; i++) data[`lfx:mi:/music/Velha+${i}`] = e({ kind: 'artist', title: `Velha ${i}` }, now - 40 * 24 * 3600e3);
  data[`lfx:sim:/music/Velha`] = e([], now - 40 * 24 * 3600e3);
  return data;
}

(async () => {
  const log = [];
  const h = await H.open({ log, routes: [
    { test: (u) => /^\/music\/?$/.test(u.pathname), body: musicPage },
    { test: (u) => u.pathname === `/user/${USER}/library`, body: libPage },
    { test: (u) => u.pathname === '/music/Radiohead/OK+Computer', body: albumPage },
  ] });
  const { page, ctx } = h;
  const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  const store = (fn, arg) => sw.evaluate(fn, arg);

  console.log('Descobrir');
  await page.goto('https://www.last.fm/music');
  await page.waitForSelector('.lfx-disc-hero', { timeout: 15000 });
  const disc = await until(() => page.evaluate(() => {
    const pool = document.querySelectorAll('#content .page-content :is(.music-releases-item, .column-tracks-item)[data-lfx-disc-card]').length;
    return pool > 50 ? { pool, nav: [...document.querySelectorAll('.lfx-disc-chip')].map((a) => a.textContent), heroes: document.querySelectorAll('.lfx-disc-hero').length } : null;
  }), 12000);
  check(disc && disc.nav.length >= 9, 'o índice do Descobrir mostra todas as seções (a página vem em vários blocos)', disc && disc.nav.join(', '));
  check(disc && disc.heroes === 1, 'um só topo no Descobrir');
  check(disc && disc.pool > 50, 'selos e ações em todos os cartões, não só no primeiro bloco', disc && disc.pool);
  const tab = await page.evaluate(() => [...document.querySelectorAll('.content-top .minimal-navigation-item-link')].map((a) => a.textContent.replace(/\s+/g, ' ').trim()));
  check(tab[0] && /^Visão geral/.test(tab[0]), 'aba atual traduzida ("Visão geral")', tab.join(' | '));

  await page.evaluate(() => document.querySelector('.lfx-disc-surprise').click());
  const landed = await until(() => page.evaluate(() => { const i = document.querySelector('.lfx-spot-info.lfx-show'); return i && i.textContent.includes('Sortear outro') ? document.querySelector('.lfx-spot-title')?.textContent : null; }), 6000);
  check(landed, 'Surpreenda-me gira e para num álbum ou faixa, com os botões', landed);
  await page.screenshot({ path: path.join(OUT, 'ext-surpreenda.png') });
  await page.evaluate(() => [...document.querySelectorAll('.lfx-spot-btn')].find((b) => /Sortear outro/.test(b.textContent)).click());
  await page.waitForTimeout(150);
  await page.evaluate(() => [...document.querySelectorAll('.lfx-spot-btn')].find((b) => /Sortear outro/.test(b.textContent))?.click());
  const second = await until(() => page.evaluate((first) => { const i = document.querySelector('.lfx-spot-info.lfx-show'); const t = document.querySelector('.lfx-spot-title')?.textContent; return i && t ? { t, covers: document.querySelectorAll('.lfx-spot-reel img').length } : null; }, landed), 6000);
  check(second && second.covers === 1, '"Sortear outro" (mesmo clicado duas vezes rápido) pousa numa só', second);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check(await page.evaluate(() => !document.querySelector('.lfx-spot')), 'Esc fecha o sorteio');
  const errs1 = log.filter((l) => /pageerror/.test(l));
  check(!errs1.length, 'sem erros no Descobrir', errs1);

  console.log('Listas suspensas');
  await page.goto('https://www.last.fm/music/Radiohead/OK+Computer');
  await page.waitForSelector('.lfx-open-more', { timeout: 15000 });
  await page.waitForTimeout(800);
  const mb = await page.evaluate(() => { const b = document.querySelector('.lfx-open-more').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  await page.mouse.click(mb.x, mb.y);
  const menuInfo = await until(() => page.evaluate(() => {
    const m = document.querySelector('body > .lfx-menu--float:not([hidden])');
    if (!m) return null;
    const r = m.getBoundingClientRect();
    const items = [...m.querySelectorAll('.lfx-menu-item')];
    const clickable = items.every((it) => { const b = it.getBoundingClientRect(); if (b.bottom > innerHeight || b.top < 0) return true; const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return it.contains(hit); });
    return { inView: r.top >= 0 && r.bottom <= innerHeight + 1, n: items.length, clickable };
  }), 3000);
  check(menuInfo && menuInfo.inView && menuInfo.clickable && menuInfo.n >= 6, '"Ouvir no…": o menu abre por cima de tudo, inteiro na tela e clicável', menuInfo);
  await page.keyboard.press('Escape');
  check(await until(() => page.evaluate(() => !document.querySelector('body > .lfx-menu--float'))), 'Esc fecha o menu');
  const pop = await ctx.newPage();
  await pop.goto(`chrome-extension://${new URL(sw.url()).host}/popup/popup.html`);
  await pop.waitForSelector('[data-service="ytmusic"]');
  await pop.click('[data-service="ytmusic"]');
  await pop.waitForTimeout(300);
  check(await pop.evaluate(() => document.querySelectorAll('select').length === 0 && document.querySelector('[data-service="ytmusic"]').getAttribute('aria-checked') === 'true'), 'configurações do Hub: serviço preferido em botões (sem lista suspensa nativa)');
  await pop.click('[data-service="spotify"]');
  await pop.close();

  console.log('Premium');
  await store((d) => chrome.storage.local.set(d), seed());
  await page.goto(`https://www.last.fm/user/${USER}/library#premium`);
  const list0 = await until(() => page.evaluate(() => { const n = [...document.querySelectorAll('.lfx-premium [data-k]')].map((x) => x.dataset.k); return n.length >= 10 ? n : null; }), 15000);
  check(list0 && list0.length === 10, 'Premium mostra 10 álbuns', list0 && list0.slice(0, 4));
  check(await page.evaluate(() => document.querySelectorAll('.lfx-premium .lfx-prem-nope').length === 10), 'cada recomendação tem o botão "Não quero"');
  await page.screenshot({ path: path.join(OUT, 'ext-premium.png') });

  // tira a primeira
  await page.evaluate(() => document.querySelector('.lfx-premium [data-k] .lfx-prem-nope').click());
  const list1 = await until(() => page.evaluate((first) => { const n = [...document.querySelectorAll('.lfx-premium [data-k]:not(.lfx-prem-gone)')].map((x) => x.dataset.k); return n.length === 10 && !n.includes(first) ? n : null; }, list0[0]), 4000);
  check(list1, 'tirar uma recomendação põe outra no lugar (continua com 10)', list1 && list1.slice(-2));
  check(list1 && list1[9] === 'banda 11', 'quem entra é a próxima mais compatível', list1 && list1[9]);
  const bar = await page.evaluate(() => document.querySelector('.lfx-prem-undo')?.textContent);
  check(/Banda 01/.test(bar || ''), 'aviso com "Desfazer"', bar);
  const saved = await store((k) => chrome.storage.local.get(k).then((o) => o[k]), `lfx:prem:hidden:${USER.toLowerCase()}`);
  check(saved && saved.length === 1 && saved[0].name === 'Banda 01', 'a banda tirada fica guardada', saved && saved.map((x) => x.name));
  check(await page.evaluate(() => /Tiradas \(1\)/.test(document.querySelector('.lfx-prem-hiddenbtn:not([hidden])')?.textContent || '')), 'botão "Tiradas (1)" aparece');

  // desfaz
  await page.evaluate(() => [...document.querySelectorAll('.lfx-prem-undo button')].find((b) => /Desfazer/.test(b.textContent)).click());
  const list2 = await until(() => page.evaluate(() => { const n = [...document.querySelectorAll('.lfx-premium [data-k]')].map((x) => x.dataset.k); return n[0] === 'banda 01' ? n : null; }), 3000);
  check(list2 && list2.length === 10, '"Desfazer" traz a banda de volta no mesmo lugar', list2 && list2.slice(0, 2));

  // tira 3 e recarrega: não voltam
  for (const k of ['banda 02', 'banda 05', 'banda 07']) {
    await page.evaluate((key) => document.querySelector(`.lfx-premium [data-k="${key}"] .lfx-prem-nope`).click(), k);
    await page.waitForTimeout(450);
  }
  await page.goto('https://www.last.fm/music');
  await page.goto(`https://www.last.fm/user/${USER}/library#premium`);
  const list3 = await until(() => page.evaluate(() => { const n = [...document.querySelectorAll('.lfx-premium [data-k]')].map((x) => x.dataset.k); return n.length >= 10 ? n : null; }), 15000);
  check(list3 && !list3.some((k) => ['banda 02', 'banda 05', 'banda 07'].includes(k)) && list3.length === 10, 'as tiradas não voltam ao abrir a aba de novo', list3 && list3.slice(0, 5));

  // tira várias seguidas: a reserva se refaz sozinha
  for (let i = 0; i < 14; i++) {
    await page.evaluate(() => document.querySelector('.lfx-premium [data-k]:not(.lfx-prem-gone) .lfx-prem-nope')?.click());
    await page.waitForTimeout(330);
  }
  const list4 = await until(() => page.evaluate(() => { const n = [...document.querySelectorAll('.lfx-premium [data-k]:not(.lfx-prem-gone)')].map((x) => x.dataset.k); return n.length === 10 ? n : null; }), 6000);
  const hid = await store((k) => chrome.storage.local.get(k).then((o) => (o[k] || []).length), `lfx:prem:hidden:${USER.toLowerCase()}`);
  check(list4 && hid === 17, 'tirando várias seguidas, sempre entram outras (a reserva é refeita)', { shown: list4 && list4.length, hidden: hid });

  // lista das tiradas: mostrar de novo
  await page.evaluate(() => document.querySelector('.lfx-prem-hiddenbtn').click());
  const panel = await until(() => page.evaluate(() => { const b = document.querySelector('.lfx-prem-hidden:not([hidden])'); return b ? b.querySelectorAll('li').length : null; }), 3000);
  check(panel === 17, 'a lista das tiradas mostra todas', panel);
  await page.screenshot({ path: path.join(OUT, 'ext-premium-hidden.png') });
  await page.evaluate(() => [...document.querySelectorAll('.lfx-prem-hidden li')].find((li) => /Banda 02/.test(li.textContent)).querySelector('button').click());
  await page.evaluate(() => [...document.querySelectorAll('.lfx-prem-hidden-acts button')].find((b) => /Fechar/.test(b.textContent)).click());
  const list5 = await until(() => page.evaluate(() => { const n = [...document.querySelectorAll('.lfx-premium [data-k]')].map((x) => x.dataset.k); return n.includes('banda 02') ? n : null; }), 15000);
  check(list5, '"Mostrar de novo" devolve a banda às recomendações', list5 && list5.slice(0, 3));
  // nunca menos de 10: uma tag que nenhuma banda tem é completada com as mais compatíveis
  await page.evaluate(() => document.querySelector('.lfx-prem-clear:not([hidden])')?.click());
  await page.waitForTimeout(600);
  await page.fill('.lfx-taginput-field', 'drone');
  await page.press('.lfx-taginput-field', 'Enter');
  await page.evaluate(() => document.querySelector('.lfx-prem-go').click());
  const few = await until(() => page.evaluate(() => {
    const h = document.querySelector('.lfx-prem-resulthead h2')?.textContent || '';
    const sub = document.querySelector('.lfx-prem-resulthead p')?.textContent || '';
    if (!/drone/.test(h + sub)) return null;
    return { h, n: document.querySelectorAll('.lfx-premium [data-k]').length, fill: [...document.querySelectorAll('.lfx-prem-matchbadge')].filter((b) => b.textContent === 'parecida').length, split: document.querySelector('.lfx-prem-split')?.textContent || '' };
  }), 20000);
  check(few && few.n === 10, 'uma busca com poucas bandas ainda traz 10 recomendações', few);
  check(few && (few.fill > 0 || /completar/i.test(few.split)), 'as que completam aparecem marcadas ("parecida")', few && { fill: few.fill, split: few.split });
  // lista de escolha própria (sem <select> nativo) na afinidade mínima
  const sel = await page.evaluate(() => ({ native: document.querySelectorAll('.lfx-premium select').length, custom: !!document.querySelector('.lfx-premium .lfx-sel') }));
  check(sel.native === 0 && sel.custom, 'Premium sem lista suspensa nativa (a do app abria fora do lugar)', sel);
  const errs2 = log.filter((l) => /pageerror/.test(l));
  check(!errs2.length, 'sem erros no Premium', errs2);

  console.log('Cache');
  const keys = await store(() => chrome.storage.local.get(null).then((o) => Object.keys(o)));
  check(!keys.some((k) => /Velha/.test(k)), 'entradas de cache com mais de 2 semanas são apagadas', keys.filter((k) => /Velha/.test(k)).length);
  check(keys.some((k) => k === 'lfx:mi:/music/Banda+01'), 'o cache recente continua');

  await h.close();
  const bad = results.filter((r) => !r.ok);
  console.log(`\nOK: ${results.length - bad.length}  FALHAS: ${bad.length}`);
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

'use strict';
/* Aba "Amigos" (#social): ouvindo agora, feed, em alta, mensagens (mural), sugestões e notificações. */
const H = require('./ext-harness');
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const USER = 'SENHOR_PEREREKO';
const results = [];
const check = (ok, name, info) => { results.push({ ok: !!ok, name }); console.log(`${ok ? '  ✓' : '  ✗'} ${name}${info !== undefined ? ` → ${typeof info === 'string' ? info : JSON.stringify(info)}` : ''}`); };
const until = async (fn, ms = 10000, step = 150) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn().catch(() => null); if (v) return v; await new Promise((r) => setTimeout(r, step)); } return null; };
const enc = (s) => encodeURIComponent(s).replace(/%20/g, '+');

const FRIENDS = [
  { name: 'Amiga Ana', live: true, track: 'Creep', artist: 'Radiohead', tpath: '/music/Radiohead/_/Creep' },
  { name: 'Beto', live: true, track: 'Teardrop', artist: 'Massive Attack', tpath: '/music/Massive+Attack/_/Teardrop' },
  { name: 'Carla', live: false, track: 'Alright', artist: 'Supergrass', tpath: '/music/Supergrass/_/Alright', ago: '15 Oct 2026, 8:02am' },
  { name: 'Dido', live: false, track: 'Roads', artist: 'Portishead', tpath: '/music/Portishead/_/Roads', ago: '15 Oct 2026, 7:30am' },
];
const RECENT = { Creep: 'Radiohead', 'No Surprises': 'Radiohead', Karma: 'Radiohead' };

function followingPage(names) {
  const items = names.map((n) => `<li class="user-list-item"><div class="user-list-avatar"><img src="https://lastfm-img.freetls.fastly.net/i/u/avatar70s/${enc(n)}.jpg"></div><a class="user-list-link" href="/user/${enc(n)}">${n}</a></li>`).join('');
  return `<!doctype html><html><body><div id="content"><div class="col-main"><ul class="user-list">${items}</ul></div></div></body></html>`;
}
function friendProfile(f) {
  const row = `<section id="recent-tracks-section"><table><tr class="chartlist-row${f.live ? ' chartlist-row--now-scrobbling' : ''}">
    <td class="chartlist-image"><img src="https://lastfm-img.freetls.fastly.net/i/u/64s/${enc(f.track)}.jpg"></td>
    <td class="chartlist-name"><a href="${f.tpath}">${f.track}</a></td>
    <td class="chartlist-artist"><a href="/music/${enc(f.artist)}">${f.artist}</a></td>
    <td class="chartlist-timestamp">${f.live ? 'Scrobbling now' : `<span title="${f.ago}">${f.ago}</span>`}</td></tr></table></section>`;
  const content = `<div id="content"><div class="col-main">
    <span class="header-avatar"><img src="https://lastfm-img.freetls.fastly.net/i/u/avatar170s/${enc(f.name)}.jpg"></span>
    <div class="header-metadata"><div class="header-metadata-item"><div class="header-metadata-title">Scrobbles</div><div class="header-metadata-display">12,345</div></div></div>
    ${row}</div></div>`;
  return H.shell(USER, 'user-page', content, `${f.name} | Last.fm`);
}
function recentPartial(f) {
  const extra = [['No Surprises', 'Radiohead', '/music/Radiohead/_/No+Surprises', '14 Oct 2026, 10:00pm'], ['Paranoid', 'Radiohead', '/music/Radiohead/_/Paranoid', '14 Oct 2026, 9:30pm']];
  const rows = [[f.track, f.artist, f.tpath, f.live ? null : f.ago], ...extra].map(([t, a, p, when]) => `<tr class="chartlist-row${!when && f.live ? ' chartlist-row--now-scrobbling' : ''}">
    <td class="chartlist-image"><img src="https://lastfm-img.freetls.fastly.net/i/u/64s/${enc(t)}.jpg"></td>
    <td class="chartlist-name"><a href="${p}">${t}</a></td><td class="chartlist-artist"><a href="/music/${enc(a)}">${a}</a></td>
    <td class="chartlist-timestamp">${when ? `<span title="${when}">${when}</span>` : 'Scrobbling now'}</td></tr>`).join('');
  return `<table>${rows}</table>`;
}
function libArtistsPage() {
  const arts = [['Radiohead', 120], ['Massive Attack', 80], ['Portishead', 60], ['Blur', 40]];
  const rows = arts.map(([n, c]) => `<tr class="chartlist-row"><td class="chartlist-name"><a href="/music/${enc(n)}">${n}</a></td><td class="chartlist-image"><img src="https://lastfm-img.freetls.fastly.net/i/u/300x300/${enc(n)}.jpg"></td><td><span class="chartlist-count-bar-value">${c}</span></td></tr>`).join('');
  return `<table>${rows}</table>`;
}
function myShoutbox() {
  const content = `<div id="content"><div class="col-main">
    <form action="/user/${USER}/shoutbox" method="post"><input type="hidden" name="csrfmiddlewaretoken" value="tok-abc"><textarea name="message"></textarea><button type="submit">Shout</button></form>
    <ul class="shoutbox-list">
      <li class="shout"><a href="/user/Amiga+Ana">Amiga Ana</a><img src="https://lastfm-img.freetls.fastly.net/i/u/64s/ana.jpg"><div class="shout-body">Curti sua playlist!</div><span title="15 Oct 2026, 8:02am">há pouco</span></li>
      <li class="shout"><a href="/user/Beto">Beto</a><img src="https://lastfm-img.freetls.fastly.net/i/u/64s/beto.jpg"><div class="shout-body">Bom gosto, hein</div><span title="14 Oct 2026, 9:00pm">ontem</span></li>
    </ul></div></div>`;
  return H.shell(USER, 'user-page', content, `${USER} shoutbox`);
}
function friendShoutbox(name) {
  return `<!doctype html><html><body><div id="content"><div class="col-main"><form action="/user/${enc(name)}/shoutbox" method="post"><input type="hidden" name="csrfmiddlewaretoken" value="tok-xyz"><textarea name="message"></textarea></form></div></div></body></html>`;
}

(async () => {
  const log = []; const posts = [];
  const libContent = fs.readFileSync(path.join(H.FIX, 'lastfm', 'library-content.html'), 'utf8');
  const libCls = fs.readFileSync(path.join(H.FIX, 'lastfm', 'library-bodyclass.txt'), 'utf8');
  const routes = [
    { test: (u) => u.pathname === `/user/${USER}/library`, body: () => H.shell(USER, libCls, libContent, 'Library') },
    { test: (u) => u.pathname === `/user/${USER}/following`, body: () => followingPage(FRIENDS.map((f) => f.name)) },
    { test: (u) => u.pathname === `/user/${USER}/followers`, body: () => followingPage(['Novato', 'Beto']) },
    { test: (u) => u.pathname === `/user/${USER}/shoutbox`, body: (u, req) => { if (req.method() === 'POST') { posts.push({ to: USER, data: req.postData() }); return { status: 200, body: 'ok' }; } return myShoutbox(); } },
  ];
  for (const f of FRIENDS) {
    routes.push({ test: (u) => u.pathname === `/user/${enc(f.name)}`, body: () => friendProfile(f) });
    routes.push({ test: (u) => u.pathname === `/user/${enc(f.name)}/partial/recenttracks`, body: () => recentPartial(f) });
    routes.push({ test: (u) => u.pathname === `/user/${enc(f.name)}/library/artists`, body: libArtistsPage });
    routes.push({ test: (u) => u.pathname === `/user/${enc(f.name)}/following`, body: () => followingPage(['Comum1', 'Comum2', f.name === 'Beto' ? 'Comum1' : 'Solo']) });
    routes.push({ test: (u) => u.pathname === `/user/${enc(f.name)}/shoutbox`, body: (u, req) => { if (req.method() === 'POST') { posts.push({ to: f.name, data: req.postData() }); return { status: 200, body: 'ok' }; } return friendShoutbox(f.name); } });
  }

  const h = await H.open({ log, routes });
  const { page, ctx, close } = h;
  const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  // estado "visto" antigo para gerar notificações (recados, ao vivo, seguidor novo)
  await sw.evaluate(() => chrome.storage.local.set({ 'lfx:social:seen': { init: true, live: {}, shouts: [], shoutsInit: true, followers: ['Beto'], followersInit: true } }));
  await page.goto(`https://www.last.fm/user/${USER}/library#social`, { waitUntil: 'domcontentloaded' });

  const view = await until(() => page.$('.lfx-sh'), 10000);
  check(!!view, 'a aba "Amigos" aparece');
  check(await page.evaluate(() => document.documentElement.classList.contains('lfx-profile')), 'o visual caprichado de perfil é aplicado nas páginas de usuário');
  const tabs = await page.$$eval('.lfx-sh-tab', (els) => els.map((e) => e.textContent.trim())).catch(() => []);
  check(tabs.length === 5 && tabs[0] === 'Ouvindo agora', 'tem 5 seções (Ouvindo agora, Feed, Em alta, Mensagens, Sugestões)', tabs);

  // Ouvindo agora
  const live = await until(async () => { const n = await page.$$eval('.lfx-sh-livecard', (e) => e.length); return n >= 2 ? n : null; }, 12000);
  check(live >= 2, 'mostra quem está ouvindo agora', live);

  // Notificações (bell) — recados novos + ao vivo + seguidor novo
  const badge = await until(async () => { const b = await page.$eval('.lfx-sh-badge', (e) => (e.hidden ? '' : e.textContent)).catch(() => ''); return b ? b : null; }, 12000);
  check(!!badge, 'o sininho mostra um contador de novidades', badge);
  await page.click('.lfx-sh-bell');
  const notifs = await until(async () => { const n = await page.$$eval('.lfx-sh-notif', (e) => e.length); return n >= 2 ? n : null; }, 6000);
  check(notifs >= 2, 'o painel de notificações lista as novidades', notifs);
  const kinds = await page.$$eval('.lfx-sh-notif-txt', (els) => els.map((e) => e.textContent)).catch(() => []);
  check(kinds.some((t) => /ouvindo/.test(t)) && kinds.some((t) => /recado/.test(t)), 'as notificações incluem "ouvindo agora" e "recado"', kinds.slice(0, 3));
  const cleared = await until(async () => { const b = await page.$eval('.lfx-sh-badge', (e) => e.hidden).catch(() => false); return b ? 'ok' : null; }, 4000);
  check(cleared === 'ok', 'abrir as notificações zera o contador');
  await page.click('.lfx-sh-bell'); // fecha
  await until(async () => (await page.$eval('.lfx-sh-bellpanel', (e) => e.hidden).catch(() => false)) ? 'ok' : null, 4000);

  // Feed
  await page.click('.lfx-sh-tab[data-tab="feed"]');
  const feed = await until(async () => { const n = await page.$$eval('.lfx-sh-fitem', (e) => e.length); return n >= 5 ? n : null; }, 10000);
  check(feed >= 5, 'o Feed junta os scrobbles recentes de vários amigos', feed);

  // Em alta
  await page.click('.lfx-sh-tab[data-tab="alta"]');
  const top = await until(async () => { const n = await page.$$eval('.lfx-sh-topcard:not(.lfx-skel)', (e) => e.length); return n >= 3 ? n : null; }, 10000);
  check(top >= 3, 'Em alta mostra os artistas mais ouvidos pelos amigos', top);
  const first = await page.$eval('.lfx-sh-topcard .lfx-sh-topname', (e) => e.textContent).catch(() => '');
  check(/Radiohead/.test(first), 'o mais ouvido entre os amigos vem em primeiro', first);

  // Sugestões
  await page.click('.lfx-sh-tab[data-tab="sugestoes"]');
  const sugg = await until(async () => { const n = await page.$$eval('.lfx-sh-sugg', (e) => e.length); return n >= 1 ? n : null; }, 10000);
  check(sugg >= 1, 'Sugestões mostra pessoas que seus amigos seguem', sugg);

  // Mensagens: inbox agrupado + enviar
  await page.click('.lfx-sh-tab[data-tab="mensagens"]');
  const threads = await until(async () => { const n = await page.$$eval('.lfx-sh-thread', (e) => e.length); return n >= 2 ? n : null; }, 8000);
  check(threads >= 2, 'a caixa de mensagens agrupa os recados por pessoa', threads);
  await page.$eval('.lfx-sh-reply', (b) => b.click());
  const to = await until(async () => { const v = await page.$eval('.lfx-sh-to', (i) => i.value).catch(() => ''); return v || null; }, 4000);
  check(!!to, 'responder preenche o destinatário', to);
  await page.fill('.lfx-sh-to', 'Beto');
  await page.fill('.lfx-sh-msg', 'Curti demais esse som!');
  await page.click('.lfx-sh-send');
  const sent = await until(async () => posts.find((p) => p.to === 'Beto') || null, 8000);
  check(!!sent, 'enviar o recado faz o POST para o mural do amigo', sent && sent.to);
  check(sent && /tok-xyz/.test(sent.data || '') && /Curti demais esse som/.test(sent.data || ''), 'o recado vai com o token e o texto');

  const noErr = log.filter((l) => !/Failed to load resource|net::ERR|status of 4|status of 5/.test(l));
  check(noErr.length === 0, 'sem erros no console', noErr.slice(0, 4));

  const bad = results.filter((r) => !r.ok);
  console.log(`\nOK: ${results.length - bad.length}\nFALHAS: ${bad.length}`);
  await close();
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

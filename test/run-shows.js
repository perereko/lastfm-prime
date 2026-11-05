'use strict';
/* Shows (#shows) sobre a agenda do próprio Last.fm:
 * - /events?location_0..2&radius (uma busca por cidade, com todas as páginas)
 * - recomendações (seus artistas primeiro, depois os parecidos), linha do tempo por mês/dia
 * - "Nas suas cidades" (agenda completa com filtro), "Buscar artista" (/+events e /+events/<ano>)
 * - presença Vou/Talvez/Fui pelo formulário do evento (/event/<id>/attendance)
 * - "Minha agenda" lida de /user/<você>/events (+ anos), com mapa (Leaflet) e números.
 * A marcação imita a do site (events-list-anhv1, group-heading, attendance-badge, attendance-control). */
const H = require('./ext-harness');
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const USER = 'SENHOR_PEREREKO';
const results = [];
const check = (ok, name, info) => { results.push({ ok: !!ok, name }); console.log(`${ok ? '  ✓' : '  ✗'} ${name}${info !== undefined ? ` → ${typeof info === 'string' ? info : JSON.stringify(info)}` : ''}`); };
const until = async (fn, ms = 12000, step = 150) => { const t = Date.now(); while (Date.now() - t < ms) { const v = await fn().catch(() => null); if (v) return v; await new Promise((r) => setTimeout(r, step)); } return null; };
const enc = (s) => encodeURIComponent(s).replace(/%20/g, '+');
const TILE = fs.readFileSync(path.join(H.FIX, 'blue.jpg'));

/* ---------------- dados ---------------- */
const LIB = [['Radiohead', 120], ['Muse', 80], ['Boygenius', 40]];
const SIMILAR = { Radiohead: ['Portishead', 'Muse', 'Massive Attack'] };
const day = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
const EV = [];
const add = (o) => { EV.push({ friends: [], going: 3, ...o, date: day(o.days) }); };
// São Paulo (60 km)
add({ id: '9001', title: 'Radiohead', artist: 'Radiohead', lineup: ['Radiohead', 'Thom Yorke'], venue: 'Allianz Parque', city: 'São Paulo', country: 'Brazil', days: 10, where: 'sp' });
add({ id: '9002', title: 'Muse: Will of the People', artist: 'Muse', lineup: ['Muse'], venue: 'Arena Guarulhos', city: 'Guarulhos', country: 'Brazil', days: 12, where: 'sp' });
add({ id: '9003', kind: 'festival', title: 'Verão do Caos', artist: 'Aeternus', lineup: ['Aeternus', 'Portishead', 'Luvart'], venue: 'Caverna Rock Pub', city: 'São Paulo', country: 'Brazil', days: 15, where: 'sp' });
add({ id: '9005', title: 'Opeth: The Last Will and Testament', artist: 'Opeth', lineup: ['Opeth'], venue: 'Espaço Unimed', city: 'São Paulo', country: 'Brazil', days: 8, where: 'sp', friends: ['ChalhublRainbow', 'abreuthai5'], going: 57 });
for (let i = 0; i < 30; i++) add({ id: String(9100 + i), title: `Banda Local ${i + 1}`, artist: `Banda Local ${i + 1}`, lineup: [], venue: 'Bar do Rock', city: 'São Paulo', country: 'Brazil', days: 30 + i, where: 'sp' });
// na 2ª página da lista de São Paulo
add({ id: '9006', title: 'Boygenius', artist: 'Boygenius', lineup: ['Boygenius'], venue: 'Audio', city: 'São Paulo', country: 'Brazil', days: 75, where: 'sp' });
// Belo Horizonte (a página vem em português)
add({ id: '9004', title: 'Muse', artist: 'Muse', lineup: ['Muse'], venue: 'Mineirão', city: 'Belo Horizonte', country: 'Brazil', days: 20, where: 'bh' });
// só na agenda do artista (fora das cidades)
add({ id: '9007', title: 'Radiohead', artist: 'Radiohead', lineup: ['Radiohead'], venue: 'RAC Arena', city: 'Perth, WA', country: 'Australia', days: 40, where: 'none' });
// passados
add({ id: '8001', title: 'Leprous em São Paulo', artist: 'Leprous', lineup: ['Leprous'], venue: 'VIP Station', city: 'São Paulo', country: 'Brazil', days: -200, where: 'past' });
add({ id: '8002', title: 'Fabio Lione Epic Tales', artist: 'Fabio Lione', lineup: ['Fabio Lione'], venue: 'Mister Rock', city: 'Belo Horizonte', country: 'Brazil', days: -230, where: 'past' });
add({ id: '8003', title: 'Radiohead', artist: 'Radiohead', lineup: ['Radiohead'], venue: 'Jockey Club', city: 'São Paulo', country: 'Brazil', days: -260, where: 'past' });
const byId = Object.fromEntries(EV.map((e) => [e.id, e]));
const urlOf = (e) => `/${e.kind || 'event'}/${e.id}+${enc(e.title)}`;
// presença no "Last.fm" (o servidor de teste guarda): Opeth (vou), Leprous (fui), Fabio Lione (tive interesse)
const STATE = { 9005: 'attending', 8001: 'attending', 8002: 'maybe' };
const FAIL = new Set(['9006']); // o Last.fm recusa a marcação deste
const posts = [];

/* ---------------- páginas ---------------- */
const MONTH_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DOW_PT = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00:00`;
function row(e, { dateCell = false } = {}) {
  const st = STATE[e.id] || '';
  const past = e.date < day(0);
  const badge = st === 'attending' ? `<span class=" attendance-badge attendance-badge--attending " title="${past ? 'You went' : 'You’re going'}"> ${past ? 'You went' : 'You’re going'} </span>`
    : st === 'maybe' ? `<span class=" attendance-badge attendance-badge--maybe "> ${past ? 'You were interested' : 'You’re interested'} </span>` : '';
  const art = dateCell
    ? `<time datetime="${isoOf(e.date)}" class="calendar-icon"><span class="calendar-icon-month"> ${MONTH_EN[e.date.getMonth()].slice(0, 3)} </span><span class="calendar-icon-day"> ${e.date.getDate()} </span></time>`
    : `<span class="avatar "><img src="https://lastfm-img.freetls.fastly.net/i/u/avatar70s/${e.id}abc.jpg" alt="Avatar for ${e.artist}" loading="lazy"></span>`;
  const friends = e.friends.length ? `<ul class="attendees-you-know-list">${e.friends.map((f) => `<li class="attendee-you-know"><a class="attendee-you-know-avatar" href="/user/${f}"><span class="avatar"><img src="https://lastfm-img.freetls.fastly.net/i/u/64s/${f}.png" alt="Avatar for ${f}"></span></a></li>`).join('')}</ul>` : '';
  return `<tr class=" events-list-item js-link-block "><td class="events-list-item-art">${art}</td><td class="events-list-item-status"></td>
    <td class="events-list-item-event"><div class="events-list-item-event--title"><a href="${urlOf(e)}" class="link-block-target"> ${e.title} </a></div>${e.lineup.length ? `<div class="events-list-item-event--lineup"> ${e.lineup.join(', ')} </div>` : ''}<a class=" events-list-cover-link js-link-block-cover-link " href="${urlOf(e)}" tabindex="-1" aria-hidden="true"></a></td>
    <td class="events-list-item-venue"><div class="events-list-item-venue--title"> ${e.venue} </div><div class="events-list-item-venue--address"><div class="events-list-item-venue--city">${e.city}</div><div class="events-list-item-venue--country">${e.country}</div></div></td>
    <td class="events-list-item-user-attendance">${badge}</td>
    <td class="events-list-item-attendees"><a href="${urlOf(e)}/attendance" class="events-list-item-attendees-count">${e.going} ${past ? 'went' : 'going'}</a>${friends}</td></tr>`;
}
const shell = (inner, title = 'Events') => `<!doctype html><html lang="en"><body><div id="content"><div class="col-main"><h1>${title}</h1>${inner}</div></div></body></html>`;
function byDay(list, heading) {
  let html = '', cur = '';
  for (const e of list) {
    const k = isoOf(e.date);
    if (k !== cur) { if (cur) html += '</tbody></table>'; cur = k; html += `<h2 class="group-heading">${heading(e.date)}</h2><table class="events-list-anhv1"><tbody>`; }
    html += row(e);
  }
  return html + (cur ? '</tbody></table>' : '');
}
const pager = (cur, total) => (total > 1 ? `<nav class="pagination"><ul class="pagination-list">${Array.from({ length: total }, (_, i) => `<li class="pagination-page">${i + 1 === cur ? i + 1 : `<a href="?page=${i + 1}">${i + 1}</a>`}</li>`).join('')}<li class="pagination-next"><a href="?page=${cur + 1}">Next</a></li></ul></nav>` : '');
const cityReqs = [];
function cityPage(u) {
  const lat = parseFloat(u.searchParams.get('location_1'));
  const where = lat < -21 ? 'sp' : lat > -21 && lat < -18 ? 'bh' : '';
  cityReqs.push({ name: u.searchParams.get('location_0'), lat, lon: u.searchParams.get('location_2'), radius: u.searchParams.get('radius'), page: u.searchParams.get('page') || '1' });
  const list = EV.filter((e) => e.where === where && e.date >= day(0)).sort((a, b) => a.date - b.date);
  const pageN = +(u.searchParams.get('page') || 1);
  const pages = Math.max(1, Math.ceil(list.length / 30));
  const slice = list.slice((pageN - 1) * 30, pageN * 30);
  const heading = where === 'bh' ? (d) => `${DOW_PT[d.getDay()]} ${d.getDate()} de ${MONTH_PT[d.getMonth()]} de ${d.getFullYear()}` : (d) => `${DOW_EN[d.getDay()]} ${d.getDate()} ${MONTH_EN[d.getMonth()]} ${d.getFullYear()}`;
  return shell(`<div class="events-filters"></div><section>${byDay(slice, heading)}${pager(pageN, pages)}</section>`, 'Events near you');
}
function listWithDates(list, monthOnly) {
  let html = '', cur = '';
  for (const e of list) {
    const k = `${e.date.getFullYear()}-${e.date.getMonth()}`;
    if (k !== cur) { if (cur) html += '</tbody></table>'; cur = k; html += `<h2 class="event-section-date-heading">${MONTH_EN[e.date.getMonth()]}${monthOnly ? '' : ` ${e.date.getFullYear()}`}</h2><table class="events-list-anhv1"><tbody>`; }
    html += row(e, { dateCell: true });
  }
  return html + (cur ? '</tbody></table>' : '');
}
const years = () => `<ul class="events-history">${[2026, 2025, new Date().getFullYear()].filter((v, i, a) => a.indexOf(v) === i).map((y) => `<li><a href="/user/${USER}/events/${y}">${y}</a></li>`).join('')}</ul>`;
function userEvents() {
  const list = EV.filter((e) => STATE[e.id] && e.date >= day(0)).sort((a, b) => a.date - b.date);
  return shell(`<h2 class="metadata-title">Going To</h2>${list.length ? listWithDates(list, true) : '<p class="no-data-message">No upcoming events.</p>'}<h2 class="user-sidebar-header">Events History</h2>${years()}`, 'Events');
}
function userYear(y) {
  const list = EV.filter((e) => STATE[e.id] && e.date < day(0) && e.date.getFullYear() === y).sort((a, b) => a.date - b.date);
  return shell(`<h2 class="metadata-title">Went To</h2>${listWithDates(list, false)}${years()}`, `Events ${y}`);
}
// a agenda do artista no Last.fm usa outra marcação (nome no link, "acts", endereço num campo só)
function artistRow(e) {
  return `<tr class=" events-list-item js-link-block "><td class="events-list-item-date" itemprop="startDate" content="${isoOf(e.date)}"><time datetime="${isoOf(e.date)}" class="events-list-item-date-icon"><span class="events-list-item-date-icon-month"> ${MONTH_EN[e.date.getMonth()].slice(0, 3)} </span><span class="events-list-item-date-icon-day"> ${e.date.getDate()} </span></time></td><td class="events-list-item-status"> </td>
    <td class="events-list-item-event"><a href="${urlOf(e)}" class="events-list-item-event-name link-block-target" itemprop="url"><span itemprop="performer"><span itemprop="name">${e.title}</span></span></a><div class="events-list-item-acts"> ${e.lineup.filter((x) => x !== e.artist).join(', ')} </div></td>
    <td class="events-list-item-venue" itemprop="location"><div class="events-list-item-venue--title" itemprop="name"> ${e.venue} </div><div class="events-list-item-venue--address" itemprop="address"> ${e.city}, ${e.country} </div></td>
    <td class="events-list-item-user-attendance"> </td><td class="events-list-item-attendees"><a href="${urlOf(e)}/attendance" class="events-list-item-attendees-count">${e.going} going</a> · <a href="${urlOf(e)}/attendance/interested" class="events-list-item-attendees-count">1 interested</a></td></tr>`;
}
function artistList(list) {
  let html = '', cur = '';
  for (const e of list) {
    const k = `${e.date.getFullYear()}-${e.date.getMonth()}`;
    if (k !== cur) { if (cur) html += '</tbody></table>'; cur = k; html += `<h2 class="event-section-date-heading">${MONTH_EN[e.date.getMonth()]} ${e.date.getFullYear()}</h2><table class="events-list"><tbody>`; }
    html += artistRow(e);
  }
  return html + (cur ? '</tbody></table>' : '');
}
function artistEvents(name, y) {
  if (y) return shell(artistList(EV.filter((e) => e.artist === name && e.date < day(0) && e.date.getFullYear() === y)));
  const list = EV.filter((e) => e.artist === name && e.date >= day(0)).sort((a, b) => a.date - b.date);
  const ys = [...new Set(EV.filter((e) => e.artist === name && e.date < day(0)).map((e) => e.date.getFullYear()))];
  return shell(`<h2 class="subpage-title">Events</h2><p class="no-data-message">This artist doesn't have any upcoming events near you.</p>${artistList(list)}${ys.map((x) => `<a href="/music/${enc(name)}/+events/${x}">${x}</a>`).join('')}`);
}
function eventPage(id) {
  const e = byId[id];
  const st = STATE[id] || '';
  return shell(`<h1 itemprop="name">${e.title}</h1><form action="${urlOf(e)}/attendance" method="post" class="attendance-control" data-ajax-form="" data-ajax-form-state="${st}"><input type="hidden" name="csrfmiddlewaretoken" value="tok123"><button type="submit" name="attendance" value="attending">I’m going</button><button type="submit" name="attendance" value="maybe">I’m interested</button><button type="submit" name="attendance" value="no">No</button></form>`, e.title);
}
function libArtistsPage() {
  const rows = LIB.map(([n, c]) => `<tr class="chartlist-row"><td class="chartlist-name"><a href="/music/${enc(n)}">${n}</a></td><td class="chartlist-image"><img src="https://lastfm-img.freetls.fastly.net/i/u/300x300/${enc(n)}.jpg"></td><td><span class="chartlist-count-bar-value">${c}</span></td></tr>`).join('');
  return `<table>${rows}</table>`;
}
function similarPage(list) {
  const items = list.map((n) => `<li class="similar-artists-item-wrap"><div class="similar-artists-item-name"><a href="/music/${enc(n)}">${n}</a></div><img src="https://lastfm-img.freetls.fastly.net/i/u/300x300/${enc(n)}.jpg"><span class="similar-artists-item-listeners">500,000 listeners</span></li>`).join('');
  return `<!doctype html><html><body><div id="content"><div class="col-main"><ul class="similar-artists">${items}</ul></div></div></body></html>`;
}
function searchAll(names) {
  const items = names.map((n) => `<div class="grid-items-item"><a href="/music/${enc(n)}"><img src="https://lastfm-img.freetls.fastly.net/i/u/300x300/${enc(n)}.jpg"></a><p class="grid-items-item-main-text"><a href="/music/${enc(n)}">${n}</a></p><p class="grid-items-item-aux-text">1,000,000 listeners</p></div>`).join('');
  return `<!doctype html><html><body><div id="content"><div class="col-main"><section><h2><a href="/search/artists">Artists</a></h2><div class="grid-items">${items}</div></section></div></div></body></html>`;
}

(async () => {
  const log = [];
  const libContent = fs.readFileSync(path.join(H.FIX, 'lastfm', 'library-content.html'), 'utf8');
  const libCls = fs.readFileSync(path.join(H.FIX, 'lastfm', 'library-bodyclass.txt'), 'utf8');
  const routes = [
    { test: (u) => u.pathname === `/user/${USER}/library`, body: () => H.shell(USER, libCls, libContent, 'Library') },
    { test: (u) => u.pathname === `/user/${USER}/library/artists`, body: libArtistsPage },
    { test: (u) => /^\/music\/[^/]+\/\+similar$/.test(u.pathname), body: (u) => similarPage(SIMILAR[decodeURIComponent(u.pathname.split('/')[2]).replace(/\+/g, ' ')] || []) },
    { test: (u) => u.pathname === '/search', body: () => searchAll(['Radiohead', 'Radiators']) },
    { test: (u) => u.pathname === '/events', body: cityPage },
    { test: (u) => u.pathname === `/user/${USER}/events`, body: userEvents },
    { test: (u) => /^\/user\/[^/]+\/events\/\d{4}$/.test(u.pathname), body: (u) => userYear(+u.pathname.split('/').pop()) },
    { test: (u) => /^\/music\/[^/]+\/\+events(\/\d{4})?$/.test(u.pathname), body: (u) => { const p = u.pathname.split('/'); return artistEvents(decodeURIComponent(p[2]).replace(/\+/g, ' '), p[4] ? +p[4] : 0); } },
    { test: (u) => /^\/(event|festival)\/\d+/.test(u.pathname), body: (u, req) => {
      const id = u.pathname.match(/\/(?:event|festival)\/(\d+)/)[1];
      if (/\/attendance$/.test(u.pathname) && req.method() === 'POST') {
        const p = new URLSearchParams(req.postData() || '');
        posts.push({ id, attendance: p.get('attendance'), csrf: p.get('csrfmiddlewaretoken'), xhr: req.headers()['x-requested-with'] });
        if (FAIL.has(id)) return { status: 500, body: 'erro' };
        if (p.get('csrfmiddlewaretoken') !== 'tok123') return { status: 403, body: 'csrf' };
        STATE[id] = p.get('attendance') === 'no' ? '' : p.get('attendance');
        return { status: 200, type: 'application/json', body: '{"ok":true}' };
      }
      return eventPage(id);
    } },
  ];
  let tiles = 0;
  const h = await H.open({ log, routes, extraRoute: async (route, u) => { if (/basemaps\.cartocdn\.com$/.test(u.hostname)) { tiles++; await route.fulfill({ status: 200, contentType: 'image/jpeg', body: TILE }); return true; } return false; } });
  const { page, ctx, close } = h;
  const sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker');
  // o service worker não passa pelo Playwright: as coordenadas dos locais vêm de uma semente de teste.
  // "seen" já tem algo (não é a 1ª vez) → os shows encontrados agora contam como novidade.
  await sw.evaluate(() => chrome.storage.local.set({
    'lfx:test:geo': { 'Allianz Parque, São Paulo, Brazil': { lat: -23.5275, lon: -46.6783 }, 'VIP Station, São Paulo, Brazil': { lat: -23.6, lon: -46.65 }, 'Mineirão, Belo Horizonte, Brazil': { lat: -19.866, lon: -43.971 } },
    'lfx:shows:cities': ['São Paulo'], 'lfx:shows:seen': ['event:1'],
  }));

  console.log('Sempre atualizado (em segundo plano)');
  await page.goto(`https://www.last.fm/user/${USER}/library`, { waitUntil: 'domcontentloaded' });
  const badge = await until(async () => { const t = await page.$eval('.lfx-side-link[data-match="#shows"] .lfx-side-badge', (e) => e.textContent).catch(() => ''); return t || null; }, 20000);
  check(!!badge, 'sem abrir a aba, o app acha shows novos dos seus artistas na agenda do Last.fm e avisa na barra lateral', badge);
  const toastT = await until(async () => { const t = await page.$eval('.lfx-toast', (e) => e.textContent).catch(() => ''); return /🎟️/.test(t) ? t : null; }, 6000);
  check(!!toastT, 'e avisa com uma notificação', toastT);
  const sp = cityReqs.find((r) => /São Paulo/.test(r.name || ''));
  check(sp && Math.abs(sp.lat + 23.55) < 0.01 && sp.radius === '60000', 'busca na agenda do Last.fm (/events) com a cidade, coordenadas e raio', sp);
  check(cityReqs.some((r) => r.page === '2'), 'lê todas as páginas da agenda da cidade', cityReqs.map((r) => r.page));

  console.log('Para você');
  await page.click('.lfx-side-link[data-match="#shows"]');
  const view = await until(() => page.$('.lfx-shw'), 10000);
  check(!!view, 'a aba Shows abre pela barra lateral');
  const tabs = await page.$$eval('.lfx-shw .lfx-sh-tab', (e) => e.map((x) => x.textContent.trim()));
  check(tabs.join('|') === 'Para você|Nas suas cidades|Buscar artista|Minha agenda', 'abas Para você, Nas suas cidades, Buscar artista e Minha agenda', tabs);
  const cards = await until(async () => { const n = await page.$$eval('.lfx-shw-card:not(.lfx-skel)', (e) => e.length); return n >= 3 ? n : null; }, 15000);
  check(cards >= 3, 'mostra shows da agenda nas suas cidades', cards);
  const artists = await page.$$eval('.lfx-shw-timeline .lfx-shw-artist', (els) => els.map((e) => e.textContent));
  check(artists.includes('Radiohead') && artists.includes('Muse'), 'Radiohead e Muse (que você ouve) em São Paulo e região', artists);
  check(artists.includes('Boygenius'), 'acha também o show que estava na 2ª página da agenda', artists);
  check(!artists.some((a) => /Banda Local/.test(a)) && !artists.includes('Opeth'), 'shows de quem você não ouve ficam fora de "Para você"', artists);
  const near = await page.$$eval('.lfx-shw-near', (e) => e.map((x) => x.textContent)).catch(() => []);
  check(near.some((t) => /perto de São Paulo/.test(t)), 'show em Guarulhos aparece como "perto de São Paulo"', near);
  const secs = await page.$$eval('.lfx-shw-sec', (e) => e.map((x) => x.textContent));
  check(secs.findIndex((t) => /Artistas que você ouve/.test(t)) >= 0 && secs.findIndex((t) => /Pode curtir/.test(t)) > secs.findIndex((t) => /Artistas que você ouve/.test(t)), 'prioriza os seus artistas e depois os parecidos', secs);
  const sim = await page.$$eval('.lfx-shw-reason.sim', (e) => e.map((x) => x.textContent)).catch(() => []);
  check(sim.some((t) => /Portishead: parecido com Radiohead/.test(t)), 'festival com um parecido no line-up (Portishead, parecido com Radiohead)', sim);
  const fest = await page.$$eval('.lfx-shw-fest', (e) => e.length).catch(() => 0);
  check(fest >= 1, 'festivais aparecem marcados', fest);
  const yours = await until(async () => { const t = await page.$$eval('.lfx-shw-yours .lfx-shw-spotname', (e) => e.map((x) => x.textContent)); return t.length ? t : null; }, 8000);
  check(yours && yours.includes('Opeth'), '"Na sua agenda" mostra o show que você já marcou no Last.fm', yours);
  const spot = await page.$$eval('.lfx-shw-spot:not(.lfx-shw-yours) .lfx-shw-spotcard', (e) => e.length).catch(() => 0);
  check(spot >= 1, 'destaca os imperdíveis (os que você mais ouve)', spot);
  const month = await page.$eval('.lfx-shw-monthhead', (e) => e.textContent).catch(() => '');
  check(/de 20\d\d/.test(month), 'agrupa por mês…', month);
  const rhDay = await page.$$eval('.lfx-shw-card', (cs) => { const c = cs.find((x) => x.querySelector('.lfx-shw-artist')?.textContent === 'Radiohead'); return c?.querySelector('.lfx-shw-datechip b')?.textContent; });
  check(rhDay === String(day(10).getDate()), '…e por dia, com a data certa lida da agenda', rhDay);
  const isNew = await page.$$eval('.lfx-shw-new', (e) => e.length).catch(() => 0);
  check(isNew >= 1, 'marca os shows novos desde a última vez', isNew);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, 'shows-paravoce.png') });

  // segunda cidade (página em português)
  await page.fill('.lfx-shw-cityinput', 'Belo');
  const csug = await until(async () => { const t = await page.$$eval('.lfx-shw-citysug .lfx-dop-sugitem b', (e) => e.map((x) => x.textContent)); return t.length ? t : null; }, 5000);
  check(csug && csug[0] === 'Belo Horizonte', 'ao digitar uma cidade, aparecem sugestões', csug);
  await page.press('.lfx-shw-cityinput', 'Enter');
  const chips = await until(async () => { const t = await page.$$eval('.lfx-shw-chip', (e) => e.map((x) => x.textContent)); return t.length >= 2 ? t : null; }, 5000);
  check(chips && chips.some((t) => /Belo Horizonte/.test(t)), 'dá para usar mais de uma cidade ao mesmo tempo', chips);
  const leftover = await page.$eval('.lfx-shw-cityinput', (e) => e.value);
  check(leftover === '', 'o campo de cidade fica limpo depois de adicionar', leftover);
  const bh = await until(async () => { const t = await page.$$eval('.lfx-shw-card', (cs) => cs.filter((c) => /Mineirão/.test(c.textContent)).map((c) => c.querySelector('.lfx-shw-datechip b')?.textContent)); return t.length ? t : null; }, 15000);
  check(bh && bh[0] === String(day(20).getDate()), 'o show de Belo Horizonte entra (data lida da página em português)', bh);
  const cityFilter = await page.$$eval('.lfx-shw-filters .lfx-shw-seg button', (e) => e.map((x) => x.textContent)).catch(() => []);
  check(cityFilter.some((t) => /Belo Horizonte \(1\)/.test(t)) && cityFilter.some((t) => /São Paulo \(35\)/.test(t)), 'filtro por cidade com a contagem de shows da agenda', cityFilter);

  console.log('Presença no Last.fm');
  const rhCard = '.lfx-shw-timeline .lfx-shw-card[data-id="event:9001"]';
  await page.click(`${rhCard} .lfx-shw-rsvp.going`);
  const post1 = await until(async () => posts.find((p) => p.id === '9001'), 6000);
  check(post1 && post1.attendance === 'attending' && post1.csrf === 'tok123' && post1.xhr === 'XMLHttpRequest', '"Vou" envia o formulário do evento no Last.fm (com o token)', post1);
  const on = await until(async () => { const n = await page.$$eval(`${rhCard} .lfx-shw-rsvp.going.on`, (e) => e.length); return n || null; }, 6000);
  check(on >= 1 && STATE['9001'] === 'attending', 'e o Last.fm guarda: o botão fica marcado', STATE['9001']);
  const t1 = await until(async () => { const t = await page.$eval('.lfx-toast', (e) => e.textContent).catch(() => ''); return /Last\.fm/.test(t) ? t : null; }, 4000);
  check(!!t1, 'confirma com um aviso', t1);
  await page.click('.lfx-shw-timeline .lfx-shw-card[data-id="event:9002"] .lfx-shw-rsvp.maybe');
  await until(async () => (STATE['9002'] === 'maybe' ? 1 : null), 6000);
  check(STATE['9002'] === 'maybe', '"Talvez" marca "I\'m interested" no Last.fm', STATE['9002']);
  await page.click('.lfx-shw-timeline .lfx-shw-card[data-id="event:9006"] .lfx-shw-rsvp.going');
  const failT = await until(async () => { const t = await page.$eval('.lfx-toast', (e) => e.textContent).catch(() => ''); return /não aceitou/.test(t) ? t : null; }, 6000);
  const failOn = await page.$$eval('.lfx-shw-card[data-id="event:9006"] .lfx-shw-rsvp.going.on', (e) => e.length);
  check(!!failT && failOn === 0, 'se o Last.fm recusar, avisa e desfaz', { failT, failOn });

  console.log('Nas suas cidades');
  await page.click('.lfx-shw .lfx-sh-tab[data-tab="cidades"]');
  const allN = await until(async () => { const n = await page.$$eval('.lfx-shw-card:not(.lfx-skel)', (e) => e.length); return n >= 30 ? n : null; }, 8000);
  check(allN === 36, 'mostra a agenda completa do Last.fm nas cidades (todas as páginas)', allN);
  await page.fill('.lfx-shw-qinput', 'opeth');
  const filtered = await until(async () => { const t = await page.$$eval('.lfx-shw-card .lfx-shw-artist', (e) => e.map((x) => x.textContent)); return t.length === 1 ? t : null; }, 4000);
  check(filtered && filtered[0] === 'Opeth', 'filtro por texto (artista, festival, local)', filtered);
  const friends = await page.$eval('.lfx-shw-friends span', (e) => e.textContent).catch(() => '');
  check(/2 pessoas que você segue vão/.test(friends), 'mostra quem você segue que vai', friends);
  const tour = await page.$eval('.lfx-shw-title', (e) => e.textContent).catch(() => '');
  check(/The Last Will and Testament/.test(tour), 'nome da turnê embaixo do artista', tour);
  const opethSt = await page.$eval('.lfx-shw-card .lfx-shw-stbadge', (e) => e.textContent).catch(() => '');
  check(opethSt === 'Vou', 'a presença que já estava no Last.fm aparece no cartão', opethSt);
  await page.screenshot({ path: path.join(OUT, 'shows-cidades.png') });
  await page.fill('.lfx-shw-qinput', '');

  console.log('Buscar artista');
  await page.click('.lfx-shw .lfx-sh-tab[data-tab="buscar"]');
  await page.fill('.lfx-shw-findinput', 'Radio');
  const fsug = await until(async () => { const n = await page.$$eval('.lfx-dop-sug:not([hidden]) .lfx-dop-sugitem', (e) => e.length); return n || null; }, 6000);
  check(fsug >= 1, 'busca de artista com sugestões ao digitar', fsug);
  await page.press('.lfx-shw-findinput', 'Enter');
  const found = await until(async () => { const t = await page.$$eval('.lfx-shw-card .lfx-shw-venue', (e) => e.map((x) => x.textContent)); return t.length >= 2 ? t : null; }, 8000);
  check(found && found.some((t) => /RAC Arena · Perth, WA$/.test(t)) && found.some((t) => /Allianz Parque · São Paulo$/.test(t)), 'mostra a agenda do artista no Last.fm (em todo lugar), com local e cidade', found);
  await page.$$eval('.lfx-shw-filters .lfx-shw-seg button', (bs) => bs.find((b) => /Só nas minhas cidades/.test(b.textContent)).click());
  const mineOnly = await until(async () => { const t = await page.$$eval('.lfx-shw-card .lfx-shw-venue', (e) => e.map((x) => x.textContent)); return t.length === 1 ? t : null; }, 4000);
  check(mineOnly && /Allianz/.test(mineOnly[0]), '"Só nas minhas cidades" deixa só o de São Paulo', mineOnly);
  await page.screenshot({ path: path.join(OUT, 'shows-buscar.png') });
  await page.$$eval('.lfx-shw-filters .lfx-shw-seg button', (bs) => bs.find((b) => /Em todo lugar/.test(b.textContent)).click());
  await page.$$eval('.lfx-shw-filters .lfx-shw-seg button', (bs) => bs.find((b) => /Já aconteceram/.test(b.textContent)).click());
  const pastCard = await until(async () => { const t = await page.$$eval('.lfx-shw-venue', (e) => e.map((x) => x.textContent)); return t.some((x) => /Jockey Club/.test(x)) ? t : null; }, 8000);
  check(!!pastCard, 'mostra shows que já aconteceram (do histórico do Last.fm)', pastCard);
  const onlyFui = await page.$$eval('.lfx-shw-card .lfx-shw-rsvp', (e) => e.map((x) => x.textContent)).catch(() => []);
  check(onlyFui.length && onlyFui.every((t) => t === 'Fui'), 'num show passado só aparece "Fui"', onlyFui);
  await page.click('.lfx-shw-card[data-id="event:8003"] .lfx-shw-rsvp.went');
  await until(async () => (STATE['8003'] === 'attending' ? 1 : null), 6000);
  check(STATE['8003'] === 'attending', '"Fui" guarda no Last.fm', STATE['8003']);

  console.log('Minha agenda (da sua conta) com mapa');
  await page.click('.lfx-shw .lfx-sh-tab[data-tab="agenda"]');
  const leaflet = await until(() => page.$('.lfx-shw-leaflet.leaflet-container'), 10000);
  check(!!leaflet, 'a agenda mostra um mapa de verdade (com zoom e arrastar)');
  const stats = await until(async () => { const s = await page.$$eval('.lfx-shw-stat b', (e) => e.map((x) => x.textContent)); return s.length === 5 && s[2] === '2' ? s : null; }, 10000);
  check(stats && stats[0] === '2' && stats[1] === '1' && stats[2] === '2', 'números: 2 confirmados (Opeth + Radiohead), 1 talvez, 2 shows que fui', stats);
  const marks = await until(async () => { const n = await page.$$eval('.lfx-shw-mk', (e) => e.length); return n >= 5 ? n : null; }, 8000);
  check(marks === 5, 'um pin para cada show da agenda (o "tive interesse" antigo não entra)', marks);
  const kinds = await page.$$eval('.lfx-shw-mk-dot', (e) => [...new Set(e.map((x) => [...x.classList].find((c) => ['going', 'maybe', 'went'].includes(c))))]);
  check(['going', 'maybe', 'went'].every((k) => kinds.includes(k)), 'cada tipo de pin tem a sua cor', kinds);
  const loadedTiles = await until(async () => { const n = await page.$$eval('.lfx-shw-leaflet img.leaflet-tile-loaded', (e) => e.length); return n || null; }, 8000);
  check(loadedTiles >= 1, 'o fundo do mapa carrega', { loadedTiles, tiles });
  const geo = await until(async () => { const g = await sw.evaluate(() => chrome.storage.local.get('lfx:geo').then((r) => r['lfx:geo'] || {})); return g['allianz parque, sao paulo, brazil'] ? g : null; }, 8000) || {};
  check(geo['allianz parque, sao paulo, brazil'] && geo['allianz parque, sao paulo, brazil'].lat < -23, 'localiza a casa de show (e guarda para a próxima vez)', Object.keys(geo));
  await page.click('.lfx-shw-mtoggle.went');
  const fewer = await until(async () => { const n = await page.$$eval('.lfx-shw-mk-dot.went', (e) => e.length); return n === 0 ? 'ok' : null; }, 4000);
  check(fewer === 'ok', 'dá para esconder/mostrar cada tipo de pin');
  await page.click('.lfx-shw-mtoggle.went');
  await page.click('.lfx-shw-mk');
  const pop = await until(async () => { const t = await page.$eval('.lfx-shw-pop', (e) => e.textContent).catch(() => ''); return t || null; }, 4000);
  check(!!pop && /Abrir o evento no Last\.fm/.test(pop), 'clicar no pin mostra o show e o link do evento', pop && pop.slice(0, 90));
  const stray = await page.$eval('.lfx-shw .lfx-sh-body', (b) => [...b.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent));
  check(stray.length === 0, 'sem texto solto na agenda', stray);
  const opImg = await page.$eval('.lfx-shw-card[data-id="event:9005"] .lfx-shw-art img', (i) => i.getAttribute('src')).catch(() => '');
  check(/9005abc/.test(opImg), 'shows da sua agenda usam a foto da agenda da cidade', opImg);
  const lists = await page.$$eval('.lfx-shw-sec', (e) => e.map((x) => x.textContent));
  check(lists.some((t) => /Próximos/.test(t)) && lists.some((t) => /Já fui/.test(t)), 'listas de próximos e dos que já fui', lists);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'shows-agenda.png') });
  // tirar a presença
  await page.click('.lfx-shw-timeline .lfx-shw-card[data-id="event:9001"] .lfx-shw-rsvp.going');
  await until(async () => (STATE['9001'] === '' ? 1 : null), 6000);
  const gone = await until(async () => { const n = await page.$$eval('.lfx-shw-timeline .lfx-shw-card[data-id="event:9001"]', (e) => e.length); return n === 0 ? 'ok' : null; }, 6000);
  check(STATE['9001'] === '' && gone === 'ok', 'clicar de novo em "Vou" tira a presença no Last.fm e some da agenda', STATE['9001']);

  const noErr = log.filter((l) => !/Failed to load resource|net::ERR|status of 4|status of 5/.test(l));
  check(noErr.length === 0, 'sem erros no console', noErr.slice(0, 4));

  const bad = results.filter((r) => !r.ok);
  console.log(`\nOK: ${results.length - bad.length}\nFALHAS: ${bad.length}`);
  await close();
  process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

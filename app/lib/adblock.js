'use strict';
/* Bloqueador de anúncios do app (Last.fm e plataformas que tocam dentro do app: YouTube Music, Deezer,
 * SoundCloud…).
 *
 * As listas são as do uBlock Origin Lite que vai junto com o app (EasyList, EasyPrivacy, uBlock filters,
 * Peter Lowe, uBlock badware, URLhaus e a lista AdGuard em espanhol/português), já convertidas pelo uBOL
 * em regras declarativas — as mesmas que o Edge/Chrome usam. O Electron não roda extensões de bloqueio
 * (falta a API declarativeNetRequest), então o app aplica essas regras ele mesmo, do jeito do uBOL no
 * modo "Ótimo":
 *  - rede: cada pedido passa pelas regras (bloquear, permitir, trocar por um arquivo "vazio" inofensivo);
 *  - cosmético: esconde os espaços de anúncio específicos de cada site (CSS);
 *  - scriptlets: os pequenos scripts do uBlock que desarmam anúncios por dentro da página (YouTube etc.).
 * O Edge (Spotify, Apple Music, Tidal) roda o próprio uBOL como extensão. */
const fs = require('fs');
const path = require('path');

const DEFAULT_RULESETS = ['ublock-filters', 'easylist', 'easyprivacy', 'pgl', 'ublock-badware', 'urlhaus-full', 'spa-1'];
const TYPES = { mainFrame: 'main_frame', subFrame: 'sub_frame', stylesheet: 'stylesheet', script: 'script', image: 'image', font: 'font', object: 'object', xhr: 'xmlhttprequest', ping: 'ping', cspReport: 'csp_report', media: 'media', webSocket: 'websocket', webTransport: 'webtransport', webbundle: 'webbundle', other: 'other' };
// mesma prioridade: permitir > permitir tudo do quadro > bloquear > trocar por https > redirecionar
const RANK = { allow: 5, allowAllRequests: 4, block: 3, upgradeScheme: 2, redirect: 1 };
const MIME = { js: 'text/javascript', mp3: 'audio/mpeg', mp4: 'video/mp4', gif: 'image/gif', png: 'image/png', html: 'text/html', txt: 'text/plain', json: 'application/json', css: 'text/css', xml: 'text/xml', vtt: 'text/vtt' };
const STOP = new Set(['http', 'https', 'www', 'com', 'net', 'org', 'js', 'html', 'php', 'ws', 'wss']);
const TOKEN_RE = /[a-z0-9%]{2,}/g;
const isAlnum = (c) => /[A-Za-z0-9%]/.test(c);

/* ---------------- Domínio registrável (lista de sufixos públicos) ---------------- */
class Suffixes {
  constructor(text) {
    this.rules = new Set(); this.wild = new Set(); this.except = new Set();
    for (let line of String(text || '').split('\n')) {
      line = line.trim();
      if (!line || line.startsWith('//')) continue;
      line = line.split(/\s/)[0].toLowerCase();
      if (line.startsWith('!')) this.except.add(line.slice(1));
      else if (line.startsWith('*.')) this.wild.add(line.slice(2));
      else this.rules.add(line);
    }
    this.memo = new Map();
  }
  domain(host) {
    if (!host) return '';
    const hit = this.memo.get(host);
    if (hit !== undefined) return hit;
    let out = host;
    if (!/^[\d.]+$/.test(host) && !host.includes(':')) {
      const labels = host.split('.');
      let suffixLen = 1;
      for (let i = 0; i < labels.length; i++) {
        const cand = labels.slice(i).join('.');
        if (this.except.has(cand)) { suffixLen = labels.length - i - 1; break; }
        if (this.rules.has(cand)) { suffixLen = labels.length - i; break; }
        if (i + 1 < labels.length && this.wild.has(labels.slice(i + 1).join('.'))) { suffixLen = labels.length - i; break; }
      }
      out = labels.length > suffixLen ? labels.slice(labels.length - suffixLen - 1).join('.') : host;
    }
    if (this.memo.size > 5000) this.memo.clear();
    this.memo.set(host, out);
    return out;
  }
}

const hostOf = (u) => { if (!u) return ''; const m = /^[a-z][a-z0-9+.-]*:\/\/(?:[^@/?#]*@)?(\[[^\]]*\]|[^:/?#]*)/i.exec(u); return m ? m[1].toLowerCase() : ''; };
const hostIn = (host, d) => host === d || (host.length > d.length && host.endsWith(d) && host[host.length - d.length - 1] === '.');

/** urlFilter do DNR (|| | ^ *) → expressão regular */
function compileUrlFilter(f, caseSensitive) {
  let re = '', i = 0, end = f.length, tail = '';
  if (f.startsWith('||')) { re = '^[a-z][a-z0-9+.-]*:(?://)?(?:[^/?#]*[.@])?'; i = 2; }
  else if (f.startsWith('|')) { re = '^'; i = 1; }
  if (end > i && f[end - 1] === '|') { end--; tail = '$'; }
  for (; i < end; i++) {
    const c = f[i];
    if (c === '*') re += '.*';
    else if (c === '^') re += '(?:[^A-Za-z0-9_\\-.%]|$)';
    else re += c.replace(/[.+?${}()|[\]\\/]/g, '\\$&');
  }
  return new RegExp(re + tail, caseSensitive ? '' : 'i');
}
/** O "pedaço" mais seguro do filtro para achar a regra rápido (precisa estar delimitado no filtro) */
function bestToken(f) {
  let best = '', bestStop = '';
  const re = /[A-Za-z0-9%]+/g;
  let m;
  const start = f.startsWith('||') ? 2 : f.startsWith('|') ? 1 : 0;
  const stop = f.length > start && f.endsWith('|') ? f.length - 1 : f.length;
  while ((m = re.exec(f))) {
    const a = m.index, b = a + m[0].length;
    if (m[0].length < 2) continue;
    const okStart = a === start ? start > 0 : (a > 0 && f[a - 1] !== '*' && !isAlnum(f[a - 1]));
    const okEnd = b === stop ? stop < f.length : (b < f.length && f[b] !== '*' && !isAlnum(f[b]));
    if (!okStart || !okEnd) continue;
    const t = m[0].toLowerCase();
    if (STOP.has(t)) { if (t.length > bestStop.length) bestStop = t; continue; }
    if (t.length > best.length) best = t;
  }
  return best || bestStop;
}

class AdBlocker {
  constructor({ dir, rulesets = DEFAULT_RULESETS, log = () => {}, pslFile } = {}) {
    this.dir = dir;
    this.rulesetIds = rulesets;
    this.log = log;
    this.pslFile = pslFile;
    this.ready = false;
    this.stats = { rules: 0, blocked: 0, redirected: 0, allowed: 0 };
    this.byToken = new Map(); this.byDomain = new Map(); this.byInitiator = new Map(); this.generic = []; this.regex = [];
    this.specific = []; // dados de CSS por site de cada lista
    this.scriptlets = { MAIN: [], ISOLATED: [] }; // { id, hosts: Set|null('*'), file }
    this.codeCache = new Map(); this.frameCache = new Map(); this.dataUrls = new Map();
    this.allowFrames = new Map();
  }

  /* ---------------- Carregar as listas ---------------- */
  load() {
    const t0 = Date.now();
    const rs = path.join(this.dir, 'rulesets');
    try { this.psl = new Suffixes(fs.readFileSync(this.pslFile || path.join(__dirname, 'public_suffix_list.dat'), 'utf8')); }
    catch (_) { this.psl = new Suffixes(''); }
    let id = 0;
    for (const rsId of this.rulesetIds) {
      for (const sub of ['main', 'regex']) {
        let list;
        try { list = JSON.parse(fs.readFileSync(path.join(rs, sub, `${rsId}.json`), 'utf8')); } catch (_) { continue; }
        for (const r of list) { if (this.addRule(r, ++id)) this.stats.rules++; }
      }
      try {
        const sp = JSON.parse(fs.readFileSync(path.join(rs, 'scripting', 'specific', `${rsId}.json`), 'utf8'));
        if (sp && Array.isArray(sp.hostnames)) { sp.index = new Map(sp.hostnames.map((h, i) => [h, i])); this.specific.push(sp); }
      } catch (_) { /* lista sem CSS específico */ }
    }
    try {
      const details = new Map(JSON.parse(fs.readFileSync(path.join(rs, 'scriptlet-details.json'), 'utf8')));
      for (const rsId of this.rulesetIds) {
        const d = details.get(rsId);
        if (!d) continue;
        for (const world of ['MAIN', 'ISOLATED']) {
          const hosts = d[world];
          if (!hosts || !hosts.length) continue;
          const file = path.join(rs, 'scripting', 'scriptlet', world === 'MAIN' ? 'main' : 'isolated', `${rsId}.js`);
          if (!fs.existsSync(file)) continue;
          this.scriptlets[world].push({ id: rsId, file, hosts: hosts.includes('*') ? null : new Set(hosts) });
        }
      }
    } catch (_) { /* sem scriptlets */ }
    this.ready = this.stats.rules > 0;
    this.log('anúncios: listas carregadas', this.stats.rules, 'regras', `${Date.now() - t0} ms`);
    return this.ready;
  }
  addRule(r, id) {
    const c = r.condition || {};
    const a = r.action || {};
    if (!RANK[a.type]) return false; // modifyHeaders e afins ficam de fora
    if (c.responseHeaders || c.excludedResponseHeaders) return false; // só dá para saber depois da resposta
    if (a.type === 'redirect' && !(a.redirect && (a.redirect.extensionPath || a.redirect.url))) return false;
    const rule = { id, p: r.priority || 1, a: a.type, c, redirect: a.redirect || null, re: null, lit: '' };
    // o maior trecho literal do filtro: um "includes" barato antes da expressão regular
    if (c.urlFilter && !c.isUrlFilterCaseSensitive) rule.lit = c.urlFilter.replace(/^\|\|?|\|$/g, '').toLowerCase().split(/[*^]/).reduce((b, x) => (x.length > b.length ? x : b), '');
    if (c.requestDomains && c.requestDomains.length) {
      for (const d of c.requestDomains) { const k = d.toLowerCase(); (this.byDomain.get(k) || this.byDomain.set(k, []).get(k)).push(rule); }
      return true;
    }
    if (c.urlFilter) {
      const t = bestToken(c.urlFilter);
      if (t) { (this.byToken.get(t) || this.byToken.set(t, []).get(t)).push(rule); return true; }
    } else if (c.regexFilter) { this.regex.push(rule); return true; }
    if (c.initiatorDomains && c.initiatorDomains.length) {
      for (const d of c.initiatorDomains) { const k = d.toLowerCase(); (this.byInitiator.get(k) || this.byInitiator.set(k, []).get(k)).push(rule); }
      return true;
    }
    this.generic.push(rule);
    return true;
  }

  /* ---------------- Rede ---------------- */
  condOk(rule, q) {
    const c = rule.c;
    if (c.resourceTypes) { if (!c.resourceTypes.includes(q.type)) return false; }
    else if (q.type === 'main_frame') return false; // sem tipos: vale para tudo, menos a página principal
    if (c.excludedResourceTypes && c.excludedResourceTypes.includes(q.type)) return false;
    if (c.requestMethods && !c.requestMethods.includes(q.method)) return false;
    if (c.excludedRequestMethods && c.excludedRequestMethods.includes(q.method)) return false;
    if (c.requestDomains && !c.requestDomains.some((d) => hostIn(q.host, d))) return false;
    if (c.excludedRequestDomains && c.excludedRequestDomains.some((d) => hostIn(q.host, d))) return false;
    if (c.initiatorDomains && !(q.init && c.initiatorDomains.some((d) => hostIn(q.init, d)))) return false;
    if (c.excludedInitiatorDomains && q.init && c.excludedInitiatorDomains.some((d) => hostIn(q.init, d))) return false;
    if (c.topDomains && !(q.top && c.topDomains.some((d) => hostIn(q.top, d)))) return false;
    if (c.excludedTopDomains && q.top && c.excludedTopDomains.some((d) => hostIn(q.top, d))) return false;
    if (c.domainType) {
      const third = q.third();
      if ((c.domainType === 'thirdParty') !== third) return false;
    }
    if (c.urlFilter) {
      if (rule.lit && !q.lower.includes(rule.lit)) return false;
      if (!rule.re) { try { rule.re = compileUrlFilter(c.urlFilter, !!c.isUrlFilterCaseSensitive); } catch (_) { rule.re = /(?!)/; } }
      if (!rule.re.test(q.url)) return false;
    } else if (c.regexFilter) {
      if (!rule.re) { try { rule.re = new RegExp(c.regexFilter, c.isUrlFilterCaseSensitive ? '' : 'i'); } catch (_) { rule.re = /(?!)/; } }
      if (!rule.re.test(q.url)) return false;
    }
    return true;
  }
  /** A regra vencedora para um pedido (ou null) */
  decide(q) {
    let best = null;
    const consider = (list) => {
      if (!list) return;
      for (const r of list) {
        if (best && (r.p < best.p || (r.p === best.p && RANK[r.a] <= RANK[best.a]))) continue;
        if (this.condOk(r, q)) best = r;
      }
    };
    // pelo domínio pedido (e os domínios "pais")
    for (let h = q.host; h; ) { consider(this.byDomain.get(h)); const i = h.indexOf('.'); h = i < 0 ? '' : h.slice(i + 1); }
    // pelos pedaços do endereço
    const lower = q.lower;
    const seen = new Set();
    let m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(lower))) { const t = m[0]; if (seen.has(t)) continue; seen.add(t); consider(this.byToken.get(t)); }
    if (q.init) for (let h = q.init; h; ) { consider(this.byInitiator.get(h)); const i = h.indexOf('.'); h = i < 0 ? '' : h.slice(i + 1); }
    consider(this.regex);
    consider(this.generic);
    return best;
  }
  dataUrl(p) {
    if (this.dataUrls.has(p)) return this.dataUrls.get(p);
    let out = null;
    try {
      const file = path.join(this.dir, p.replace(/^\/+/, ''));
      if (!file.startsWith(this.dir)) return null;
      const ext = path.extname(file).slice(1).toLowerCase();
      out = `data:${MIME[ext] || 'application/octet-stream'};base64,${fs.readFileSync(file).toString('base64')}`;
    } catch (_) { out = null; }
    this.dataUrls.set(p, out);
    return out;
  }
  /** Decide um pedido do Electron: {} (segue), {cancel:true} ou {redirectURL} */
  onRequest(d) {
    const url = d.url || '';
    if (!/^(https?|wss?):/i.test(url)) return {};
    const type = TYPES[d.resourceType] || 'other';
    let frame = null, wc = null;
    try { frame = d.frame || null; } catch (_) { frame = null; }
    try { wc = d.webContents || null; } catch (_) { wc = null; }
    const safeUrl = (o) => { try { return (o && o.url) || ''; } catch (_) { return ''; } };
    let init = '', top = '';
    const pageUrl = (() => { try { return wc && !wc.isDestroyed() ? wc.getURL() : ''; } catch (_) { return ''; } })();
    if (type === 'main_frame') { top = hostOf(url); }
    else if (type === 'sub_frame') { init = hostOf(safeUrl(frame && (() => { try { return frame.parent; } catch (_) { return null; } })()) || pageUrl || d.referrer); top = hostOf(pageUrl); }
    else { init = hostOf(safeUrl(frame) || d.referrer || pageUrl); top = hostOf(pageUrl) || init; }
    const host = hostOf(url);
    const psl = this.psl;
    const q = { url, lower: url.toLowerCase(), host, type, method: String(d.method || 'GET').toLowerCase(), init, top, third: () => !!init && psl.domain(init) !== psl.domain(host) };
    const rule = this.decide(q);
    // "permitir tudo" (exceções de página inteira): vale para os pedidos daquela página
    const wcId = d.webContentsId;
    if (type === 'main_frame') this.allowFrames.delete(wcId);
    if (rule && rule.a === 'allowAllRequests' && (type === 'main_frame')) { this.allowFrames.set(wcId, rule.p); }
    const pageAllow = this.allowFrames.get(wcId);
    if (!rule || rule.a === 'allow' || rule.a === 'allowAllRequests' || rule.a === 'upgradeScheme') { if (rule) this.stats.allowed++; return {}; }
    if (pageAllow !== undefined && pageAllow >= rule.p) return {};
    if (rule.a === 'block') { this.stats.blocked++; return { cancel: true }; }
    if (rule.a === 'redirect') {
      const target = rule.redirect.extensionPath ? this.dataUrl(rule.redirect.extensionPath) : rule.redirect.url;
      if (target) { this.stats.redirected++; return { redirectURL: target }; }
      this.stats.blocked++; return { cancel: true };
    }
    return {};
  }

  /* ---------------- Cosmético e scriptlets (por página) ---------------- */
  hostContexts(host) {
    const hns = [host];
    for (let pos = 0; ; ) { pos = host.indexOf('.', pos) + 1; if (pos === 0) break; hns.push(host.slice(pos)); }
    hns.push('*');
    const ens = [];
    for (let hn of hns) { for (;;) { const pos = hn.lastIndexOf('.'); if (pos === -1) break; hn = hn.slice(0, pos); ens.push(`${hn}.*`); } }
    return { hns, ens };
  }
  cssFor(host) {
    const { hns, ens } = this.hostContexts(host);
    const selectors = new Set(), exceptions = new Set();
    const addList = (sp, ilist) => {
      let list;
      try { list = JSON.parse(`[${sp.selectorLists[ilist]}]`); } catch (_) { return; }
      for (const i of list) { if (i >= 0) selectors.add(sp.selectors[i]); else exceptions.add(sp.selectors[~i]); }
    };
    for (const sp of this.specific) {
      for (const n of hns) { const i = sp.index.get(n); if (i !== undefined) addList(sp, sp.selectorListRefs[i]); }
      if (sp.hasEntities) for (const n of ens) { const i = sp.index.get(n); if (i !== undefined) addList(sp, sp.selectorListRefs[i]); }
      const rx = sp.regexes || [];
      for (let i = 0; i + 2 < rx.length; i += 3) {
        if (!host.includes(rx[i])) continue;
        try { if (new RegExp(rx[i + 1]).test(host)) addList(sp, rx[i + 2]); } catch (_) { /* expressão inválida */ }
      }
    }
    for (const e of exceptions) selectors.delete(e);
    const plain = [...selectors].filter((s) => s && !s.startsWith('{'));
    return plain.length ? `${plain.join(',\n')}{display:none!important;}` : '';
  }
  code(file) {
    if (this.codeCache.has(file)) return this.codeCache.get(file);
    let src = '';
    try { src = fs.readFileSync(file, 'utf8'); } catch (_) { src = ''; }
    this.codeCache.set(file, src);
    return src;
  }
  scriptsFor(world, host) {
    const { hns, ens } = this.hostContexts(host);
    const out = [];
    for (const s of this.scriptlets[world]) {
      if (s.hosts && !hns.some((h) => s.hosts.has(h)) && !ens.some((h) => s.hosts.has(h))) continue;
      const src = this.code(s.file);
      if (src) out.push(src);
    }
    return out.join('\n;\n');
  }
  /** O que a página precisa receber ao começar a carregar */
  forFrame(url) {
    const host = hostOf(url);
    if (!host || !/^https?:/i.test(url)) return null;
    if (this.frameCache.has(host)) return this.frameCache.get(host);
    const out = { css: this.cssFor(host), main: this.scriptsFor('MAIN', host), isolated: this.scriptsFor('ISOLATED', host) };
    if (this.frameCache.size > 200) this.frameCache.clear();
    this.frameCache.set(host, out);
    return out;
  }
}

module.exports = { AdBlocker, DEFAULT_RULESETS, compileUrlFilter, bestToken, Suffixes, hostOf };

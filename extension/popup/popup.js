'use strict';

// Mesmos padrões de content/app.js e background.js
const DEFAULTS = {
  enabled: true, accentMode: 'auto', accent: '#b8a4ff', animations: true, wide: false,
  ambient: true, hideAds: true, sidebar: true, sideCollapsed: false, nowPlaying: true,
  homeDash: true, miniHeader: true, artistTabs: true, palette: true, listen: true,
  service: 'spotify', heroCover: true, listTools: true, stats: true, shortcuts: true, backToTop: true,
  hoverCards: true, social: true, catalog: true, premium: true, discover: true, match: true, socialHub: true, doppel: true, shows: true, lite: false,
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const nf = new Intl.NumberFormat('pt-BR');

let state = { ...DEFAULTS };

function render() {
  for (const input of $$('input[data-key]')) input.checked = !!state[input.dataset.key];
  $('#body').classList.toggle('off', !state.enabled);
  $('#status').textContent = state.enabled ? 'Tema ativo no Last.fm' : 'Tema desligado: o Last.fm aparece como o original';

  const current = state.accentMode === 'auto' ? 'auto' : state.accent;
  for (const sw of $$('.swatch')) sw.setAttribute('aria-checked', String(sw.dataset.accent === current));
  const shown = state.accentMode === 'auto' ? '#b8a4ff' : state.accent;
  document.documentElement.style.setProperty('--accent', shown);
  $('#accent-hint').textContent = state.accentMode === 'auto'
    ? 'Cada página ganha a cor da própria capa ou foto. Em imagens sem cor, usa o lilás.'
    : 'A mesma cor em todas as páginas.';

  for (const b of $$('#service [data-service]')) {
    const on = b.dataset.service === state.service;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on ? 0 : -1;
  }
  $('#service-row').classList.toggle('dim', !state.listen && !state.palette);
}

// Opções no "sync" do navegador; onde ele não existe (o app Last.fm + Spotify), no "local"
async function syncGet(defs) {
  try { return await chrome.storage.sync.get(defs); } catch (_) { return chrome.storage.local.get(defs); }
}
async function syncSet(obj) {
  try { return await chrome.storage.sync.set(obj); } catch (_) { return chrome.storage.local.set(obj); }
}

async function save(patch) {
  Object.assign(state, patch);
  render();
  await syncSet(patch);
}

// Conta: a página guarda quem está logado; aqui só mostramos
async function renderAccount() {
  let me = null;
  try { me = (await chrome.storage.local.get('lfx:me'))['lfx:me'] || null; } catch (_) { /* sem acesso */ }
  const link = $('#account');
  if (!me || !me.name) return;
  link.href = `https://www.last.fm/user/${encodeURIComponent(me.name)}`;
  link.classList.add('in');
  $('#account-name').textContent = me.display || me.name;
  $('#account-sub').textContent = me.scrobbles != null ? `${nf.format(me.scrobbles)} scrobbles · abrir perfil` : 'Abrir perfil';
  const av = $('#account-avatar');
  if (me.avatar) {
    const img = document.createElement('img');
    img.src = me.avatar; img.alt = '';
    av.textContent = ''; av.append(img);
  }
}

async function init() {
  state = { ...DEFAULTS, ...(await syncGet(DEFAULTS)) };
  render();
  renderAccount();

  for (const input of $$('input[data-key]')) {
    input.addEventListener('change', () => save({ [input.dataset.key]: input.checked }));
  }
  // Serviço preferido: botões (sem lista suspensa nativa, que no app abria fora do lugar)
  for (const b of $$('#service [data-service]')) b.addEventListener('click', () => save({ service: b.dataset.service }));
  $('#service').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    const list = $$('#service [data-service]');
    const i = list.indexOf(document.activeElement);
    const next = list[(i + (['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : -1) + list.length) % list.length];
    next.focus(); next.click(); e.preventDefault();
  });
  for (const sw of $$('.swatch')) {
    sw.addEventListener('click', () => {
      const v = sw.dataset.accent;
      save(v === 'auto' ? { accentMode: 'auto' } : { accentMode: 'fixed', accent: v });
    });
  }
  // Setas movem a seleção entre as cores, como um grupo de rádio.
  $('.swatches').addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const list = $$('.swatch');
    const i = list.indexOf(document.activeElement);
    const next = list[(i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
    next.focus();
    next.click();
    e.preventDefault();
  });

  $('#open').addEventListener('click', () => chrome.tabs.create({ url: 'https://www.last.fm/' }));
  $('#reset').addEventListener('click', () => save({ ...DEFAULTS }));
}

init();

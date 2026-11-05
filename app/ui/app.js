'use strict';
/* Interface do Last.fm PRIME: barra de cima, painel do player (direita), avisos e folhas.
   A música é controlada só pelo painel: lá aparecem o Spotify e as outras plataformas, ao vivo. */
(() => {
  const $ = (id) => document.getElementById(id);
  const I = window.ICON;
  const api = window.lfs;

  /** Cria elementos sem innerHTML para textos (nomes de músicas vêm de fora) */
  function h(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v; // só para ícones nossos
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'style') for (const [p, val] of Object.entries(v)) n.style.setProperty(p, val);
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return n;
  }
  const fmt = (ms) => {
    const s = Math.max(0, Math.floor((ms || 0) / 1000)), m = Math.floor(s / 60), hh = Math.floor(m / 60);
    return hh ? `${hh}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` : `${m}:${String(s % 60).padStart(2, '0')}`;
  };
  const nf = new Intl.NumberFormat('pt-BR');

  /* ---------------- Ícones fixos ---------------- */
  const icons = { back: 'back', fwd: 'fwd', reload: 'reload', openSettings: 'sliders' };
  for (const [id, ic] of Object.entries(icons)) $(id).innerHTML = I[ic];

  let S = null;

  /* ---------------- Barra de cima ---------------- */
  $('back').onclick = () => api.nav('back');
  $('fwd').onclick = () => api.nav('forward');
  $('reload').onclick = () => api.nav('reload');
  $('home').onclick = () => api.nav('home');
  $('byLink').onclick = () => api.external('https://s2.rip/senhor_perereko');
  $('openSettings').onclick = () => openSheet('settings');
  $('mkPlaylist').onclick = () => openSheet('playlist');
  $('scrobble').onclick = () => {
    const st = S?.scrobble?.status;
    if (st === 'nolastfm') api.nav('url', 'https://www.last.fm/login');
    else if (st === 'noapp' || st === 'app' || st === 'sending' || st === 'sent' || st === 'ws' || st === 'wsoff' || st === 'none') openSheet('settings', 'scrobbles');
    else openSheet('scrobble');
  };

  /* Clique fora do painel do player (na barra de cima): o painel se recolhe e o Last.fm volta ao foco.
     Os cliques na página do Last.fm são avisados pela própria página. */
  document.addEventListener('click', (e) => {
    if (e.button !== 0 || !S?.panel?.open) return;
    if (e.target.closest && e.target.closest('#plPanel, #panelBtn, #toast, #overlay')) return;
    api.panelOutside();
  }, true);

  /* A entrada do app: quando a animação de abertura termina, a barra de cima chega deslizando */
  let afterIntro = null;
  api.onIntro((ev) => {
    if (ev === 'exit') { document.body.classList.remove('enter'); void document.body.offsetWidth; document.body.classList.add('enter'); setTimeout(() => document.body.classList.remove('enter'), 1600); }
    if (ev === 'done' && afterIntro) { const f = afterIntro; afterIntro = null; setTimeout(f, 350); }
  });

  /* ---------------- Painel do player (direita) ----------------
     Dois jeitos de mostrar uma plataforma aqui:
       - nativo (YouTube Music, SoundCloud, Deezer): a página roda dentro do app, numa visão posta
         exatamente sobre esta área — o app só diz onde ela fica;
       - pelo Edge (Spotify, Apple Music, Tidal, que precisam de DRM): a imagem ao vivo vem do navegador
         escondido, e os cliques, a rolagem e as teclas daqui vão para lá.
     Fechar o painel só esconde: a música continua tocando. */
  const PL = { open: false, pid: '', shownPid: '', frames: 0, drawing: false, next: null, viewKey: '', viewTimer: 0, closeTimer: 0, openedAt: 0, snaps: {}, waitSince: 0, stuck: false };
  const isNative = (pid) => (S?.engines?.[pid] || 'edge') === 'native';
  const plPanel = $('plPanel'), plScreen = $('plScreen'), plCanvas = $('plCanvas'), plType = $('plType');
  const plCtx = plCanvas.getContext('2d', { alpha: false });
  $('plBack').innerHTML = I.back; $('plReload').innerHTML = I.reload; $('plClose').innerHTML = I.close;
  $('plBack').onclick = () => api.panelInput({ kind: 'nav', what: 'back' });
  $('plReload').onclick = () => { PL.frames = 0; api.panelInput({ kind: 'nav', what: 'reload' }); };
  $('plClose').onclick = () => api.panel({ open: false });
  $('plWin').innerHTML = I.external;
  $('plWin').onclick = () => api.playerWindow(true);
  $('panelBtn').onclick = () => {
    if ($('panelBtn').dataset.login === 'true' && !S?.panel?.open) api.playerLogin();
    else api.panel({ open: !S?.panel?.open });
  };
  $('plLayout').onclick = () => {
    const pid = S?.panel?.platform || 'spotify';
    const cur = S?.panel?.layouts?.[pid] === 'mobile' ? 'mobile' : 'desktop';
    PL.frames = 0; plScreen.classList.remove('live');
    api.panel({ pid, layout: cur === 'mobile' ? 'desktop' : 'mobile' });
  };
  const PL_ABBR = { spotify: 'Sp', ytmusic: 'YT', deezer: 'Dz', soundcloud: 'SC', apple: 'AM', tidal: 'Ti' };
  const plColor = (pid) => (S?.platforms || []).find((x) => x.id === pid)?.color || '#1ed760';
  const plName = (pid) => (S?.platforms || []).find((x) => x.id === pid)?.name || 'Spotify';

  // onde fica a tela do painel → a plataforma é desenhada exatamente ali (e nesse tamanho)
  function sendView(force) {
    if (!PL.open) return;
    // a página nativa só entra depois que o painel terminou de deslizar (ela não acompanha a animação)
    const wait = isNative(PL.pid) ? 480 - (Date.now() - PL.openedAt) : 0;
    if (wait > 0) { clearTimeout(PL.viewTimer); PL.viewTimer = setTimeout(() => sendView(force), wait + 10); return; }
    const r = plScreen.getBoundingClientRect();
    if (r.width < 50 || r.height < 50) return;
    const v = { x: Math.round(r.left), y: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height), dsf: Math.round((window.devicePixelRatio || 1) * 100) / 100 };
    const w = S?.engine?.web || {};
    const key = `${PL.pid}|${v.x}|${v.y}|${v.width}|${v.height}|${v.dsf}|${S?.perf}|${S?.panel?.layouts?.[PL.pid] || ''}|${w.status}|${w.shown || ''}|${w.asleep ? 1 : 0}|${S?.engines?.[PL.pid] || ''}`;
    if (!force && key === PL.viewKey) return;
    PL.viewKey = key;
    if (!isNative(PL.pid) && !PL.frames) { PL.waitSince = Date.now(); PL.stuck = false; }
    api.panelView(v);
  }
  new ResizeObserver(() => { clearTimeout(PL.viewTimer); PL.viewTimer = setTimeout(() => sendView(false), 140); }).observe(plScreen);

  // a plataforma mudou de jeito de abrir (no app × pelo Edge): o painel pede a tela de novo
  api.onPanelReset(() => { PL.viewKey = ''; PL.frames = 0; PL.stuck = false; plScreen.classList.remove('live'); setTimeout(() => sendView(true), 80); });

  // sem imagem do Edge depois de um tempo: o painel explica e oferece a janela à parte
  setInterval(() => {
    if (!PL.open || isNative(PL.pid) || PL.frames || PL.stuck || !PL.waitSince) return;
    const w = S?.engine?.web || {};
    if (w.status !== 'on' || w.shown === PL.pid || Date.now() - PL.waitSince < 14000) return;
    PL.stuck = true;
    api.panelStuck({ pid: PL.pid });
    if (S) renderPanel(S);
  }, 2000);

  // imagens que chegam: desenha a mais nova (as do meio são puladas se o computador estiver ocupado)
  api.onFrame((f) => {
    // retrato de uma página nativa (o painel desliza com ele): guarda para a próxima vez também
    if (f.snap) { PL.snaps[f.pid] = f; if (f.pid !== PL.pid) return; PL.next = f; if (!PL.drawing) drawNext(); return; }
    if (!PL.open || f.pid !== PL.pid) return;
    PL.next = f;
    if (!PL.drawing) drawNext();
  });
  async function drawNext() {
    const f = PL.next; PL.next = null;
    if (!f) return;
    PL.drawing = true;
    try {
      const bmp = await createImageBitmap(new Blob([f.data], { type: 'image/jpeg' }));
      if (plCanvas.width !== bmp.width || plCanvas.height !== bmp.height) { plCanvas.width = bmp.width; plCanvas.height = bmp.height; }
      plCtx.drawImage(bmp, 0, 0);
      bmp.close?.();
      if (!f.snap) PL.frames++;
      PL.shownPid = f.pid;
      if (!plScreen.classList.contains('live')) plScreen.classList.add('live');
    } catch (_) { /* imagem com defeito: espera a próxima */ }
    PL.drawing = false;
    if (PL.next) drawNext();
  }

  // cliques e rolagem: a posição no painel é a mesma posição na página (o tamanho é igual)
  const mods = (e) => (e.altKey ? 1 : 0) | (e.ctrlKey ? 2 : 0) | (e.metaKey ? 4 : 0) | (e.shiftKey ? 8 : 0);
  const BTN = ['left', 'middle', 'right'];
  const at = (e) => { const r = plCanvas.getBoundingClientRect(); return { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) }; };
  let moveQueued = null;
  plCanvas.addEventListener('pointerdown', (e) => {
    if (!plScreen.classList.contains('live') || isNative(PL.pid)) return;
    e.preventDefault();
    plType.focus({ preventScroll: true });
    plCanvas.setPointerCapture(e.pointerId);
    api.panelInput({ kind: 'mouse', type: 'mousePressed', ...at(e), button: BTN[e.button] || 'left', buttons: e.buttons, clickCount: Math.max(1, e.detail || 1), modifiers: mods(e) });
  });
  plCanvas.addEventListener('pointerup', (e) => {
    if (!plScreen.classList.contains('live')) return;
    api.panelInput({ kind: 'mouse', type: 'mouseReleased', ...at(e), button: BTN[e.button] || 'left', buttons: e.buttons, clickCount: Math.max(1, e.detail || 1), modifiers: mods(e) });
  });
  plCanvas.addEventListener('pointermove', (e) => {
    if (!plScreen.classList.contains('live')) return;
    const first = !moveQueued;
    moveQueued = { kind: 'mouse', type: 'mouseMoved', ...at(e), button: e.buttons & 1 ? 'left' : 'none', buttons: e.buttons, modifiers: mods(e) };
    if (first) requestAnimationFrame(() => { const m = moveQueued; moveQueued = null; if (m) api.panelInput(m); });
  });
  plCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const k = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 400 : 1;
    api.panelInput({ kind: 'mouse', type: 'mouseWheel', ...at(e), deltaX: e.deltaX * k, deltaY: e.deltaY * k, modifiers: mods(e) });
  }, { passive: false });
  plCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
  plCanvas.addEventListener('dblclick', (e) => e.preventDefault());

  // teclado: as teclas especiais vão como teclas; letras com acento (´ + a) chegam prontas pelo campo escondido
  const SPECIAL = { Backspace: 8, Tab: 9, Enter: 13, Escape: 27, PageUp: 33, PageDown: 34, End: 35, Home: 36, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Delete: 46 };
  plType.addEventListener('focus', () => plScreen.classList.add('focused'));
  plType.addEventListener('blur', () => plScreen.classList.remove('focused'));
  plType.addEventListener('keydown', (e) => {
    if (e.isComposing || e.key === 'Dead' || e.key === 'Process') return;
    const code = SPECIAL[e.key];
    const shortcut = (e.ctrlKey || e.metaKey) && e.key.length === 1;
    if (shortcut && e.key.toLowerCase() === 'v') return; // colar: chega pelo evento "paste"
    if (code || shortcut || e.key.length === 1) {
      e.preventDefault();
      const text = !shortcut && e.key.length === 1 ? e.key : e.key === 'Enter' ? '\r' : undefined;
      api.panelInput({ kind: 'key', type: text ? 'keyDown' : 'rawKeyDown', key: e.key, code: e.code, keyCode: code || e.keyCode, modifiers: mods(e), repeat: e.repeat, text });
    }
  });
  plType.addEventListener('keyup', (e) => {
    if (e.isComposing || e.key === 'Dead') return;
    const code = SPECIAL[e.key];
    if (code || e.key.length === 1) api.panelInput({ kind: 'key', type: 'keyUp', key: e.key, code: e.code, keyCode: code || e.keyCode, modifiers: mods(e) });
  });
  plType.addEventListener('compositionend', (e) => { if (e.data) api.panelInput({ kind: 'text', text: e.data }); plType.value = ''; });
  plType.addEventListener('input', (e) => {
    if (e.isComposing) return;
    if (e.data && e.inputType === 'insertText') api.panelInput({ kind: 'text', text: e.data });
    plType.value = '';
  });
  plType.addEventListener('paste', (e) => {
    e.preventDefault();
    const t = e.clipboardData && e.clipboardData.getData('text/plain');
    if (t) api.panelInput({ kind: 'text', text: t });
  });

  // largura: arraste a borda esquerda
  const grip = $('plGrip');
  let gripStart = null, gripSent = 0;
  grip.addEventListener('pointerdown', (e) => { e.preventDefault(); grip.setPointerCapture(e.pointerId); grip.classList.add('drag'); gripStart = { x: e.clientX, w: plPanel.getBoundingClientRect().width }; });
  grip.addEventListener('pointermove', (e) => {
    if (!gripStart) return;
    const w = Math.round(Math.max(340, Math.min(window.innerWidth - 480, gripStart.w + (gripStart.x - e.clientX))));
    plPanel.style.setProperty('--pw', `${w}px`);
    if (Date.now() - gripSent > 60) { gripSent = Date.now(); api.panel({ width: w }); }
  });
  const gripEnd = () => { if (!gripStart) return; gripStart = null; grip.classList.remove('drag'); api.panel({ width: Math.round(plPanel.getBoundingClientRect().width) }); };
  grip.addEventListener('pointerup', gripEnd);
  grip.addEventListener('pointercancel', gripEnd);

  function plWait(title, sub, actions = [], err = false) {
    $('plWaitTitle').textContent = title;
    $('plWaitSub').textContent = sub || '';
    const a = $('plWaitActions'); a.textContent = '';
    for (const x of actions) a.append(x);
    $('plWait').classList.toggle('err', err);
  }
  function renderPanel(s) {
    const p = s.panel || {};
    const pid = p.platform || 'spotify';
    const color = plColor(pid);
    const web = s.engine?.web || {};
    // botão da barra de cima
    const pb = $('panelBtn');
    const src = s.sources?.[s.source] || {};
    pb.hidden = false; // sem a barra de baixo, este botão é o caminho para o player (e mostra o que toca)
    pb.setAttribute('aria-pressed', String(!!p.open));
    pb.style.setProperty('--pc', plColor(s.source));
    // o que está tocando, só para você saber (os controles ficam no painel)
    const it = s.player?.item || null;
    const playing = !!(s.player?.playing && it);
    // sem nada tocando e o Spotify sem login: o botão leva direto ao login (no painel)
    const needLogin = !it && s.source === 'spotify' && web.available && web.status === 'on' && web.loggedIn === false && !web.asleep;
    const pkey = JSON.stringify([it?.name, it?.artists?.[0], it?.image, playing, src.playing, !!p.open, needLogin, !!web.available]);
    if (pb.dataset.key !== pkey) {
      pb.dataset.key = pkey;
      pb.dataset.title = it?.name || '';
      pb.dataset.artist = it?.artists?.[0] || '';
      pb.dataset.playing = String(playing);
      const lead = playing || src.playing ? h('span', { class: 'pp-eq', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')) : h('span', { class: 'pp-dot', 'aria-hidden': 'true' });
      if (it) {
        pb.classList.add('has-now');
        pb.replaceChildren(lead,
          it.image ? h('img', { class: 'pp-cover', src: it.image, alt: '', decoding: 'async' }) : null,
          h('span', { class: 'pp-text' }, h('b', { text: it.name }), it.artists?.[0] ? h('span', { class: 'pp-artist', text: ` · ${it.artists[0]}` }) : null));
        const where = plName(s.source);
        pb.title = `${playing ? 'Tocando' : 'Pausado'} no ${where}: ${it.name}${it.artists?.[0] ? ` — ${it.artists[0]}` : ''}. Clique para ${p.open ? 'esconder' : 'mostrar'} o painel${p.open ? ' (a música continua)' : ''}.`;
      } else {
        pb.classList.remove('has-now');
        pb.replaceChildren(lead, h('span', { class: 'pp-text' }, h('b', { text: needLogin ? 'Entrar no Spotify' : 'Player' })));
        pb.title = needLogin ? 'Entre na sua conta do Spotify (grátis ou Premium): o login abre no painel à direita' : p.open ? 'Esconder o player (ele continua tocando)' : 'Mostrar o player ao lado: o Spotify e as outras plataformas';
      }
      pb.classList.toggle('warn', needLogin || !web.available);
      pb.dataset.login = String(needLogin);
      pb.setAttribute('aria-label', pb.title);
    }
    plPanel.style.setProperty('--pc', color);
    if (!PL.open || Number.parseFloat(plPanel.style.getPropertyValue('--pw')) !== p.width) if (!gripStart) plPanel.style.setProperty('--pw', `${p.width || 440}px`);
    // abas das plataformas
    const tabs = $('plTabs');
    const tkey = JSON.stringify([pid, s.settings?.onePlayer !== false, (s.platforms || []).map((x) => x.id), Object.entries(s.sources || {}).map(([k, v]) => `${k}${v.playing ? 1 : 0}`)]);
    if (tabs.dataset.key !== tkey) {
      tabs.dataset.key = tkey;
      tabs.replaceChildren(...(s.platforms || []).map((x, i) => {
        const playing = s.sources?.[x.id]?.playing;
        const one = S?.settings?.onePlayer !== false && x.id !== pid;
        return h('button', {
          class: 'pltab', role: 'tab', 'aria-selected': String(x.id === pid), title: playing ? `${x.name}: tocando` : one ? `Abrir o ${x.name} (um player por vez: o ${plName(pid)} fecha)` : x.name, style: { '--c': x.color, '--i': String(i) },
          onclick: () => { if (x.id !== (S?.panel?.platform)) { PL.frames = 0; plScreen.classList.remove('live'); api.panel({ open: true, platform: x.id }); } },
        }, playing ? h('span', { class: 'pp-eq', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')) : h('span', { class: 'pt-dot', 'aria-hidden': 'true', text: PL_ABBR[x.id] || x.name.slice(0, 2) }), h('span', { class: 'pt-name', text: x.id === 'ytmusic' ? 'YT Music' : x.name }));
      }));
    }
    const layout = p.layouts?.[pid] === 'mobile' ? 'mobile' : 'desktop';
    $('plLayout').innerHTML = layout === 'mobile' ? I.computer : I.phone;
    $('plLayout').title = layout === 'mobile' ? 'Usar a versão de computador do site' : 'Usar a versão de celular do site';
    // abrir e fechar com animação
    if (p.open && !PL.open) {
      PL.open = true; PL.viewKey = ''; PL.openedAt = Date.now();
      // página nativa: o painel desliza com o último retrato dela, e a página de verdade entra no fim
      if (isNative(pid) && PL.snaps[pid]) { PL.pid = pid; PL.next = PL.snaps[pid]; if (!PL.drawing) drawNext(); }
      clearTimeout(PL.closeTimer);
      plPanel.hidden = false;
      plPanel.classList.remove('closing');
      void plPanel.offsetWidth;
      plPanel.classList.add('tabs-enter');
      clearTimeout(PL.tabsTimer); PL.tabsTimer = setTimeout(() => plPanel.classList.remove('tabs-enter'), 1100);
      requestAnimationFrame(() => { plPanel.classList.add('open'); setTimeout(() => sendView(true), 60); });
    } else if (!p.open && PL.open) {
      PL.open = false;
      plPanel.classList.add('closing');
      plPanel.classList.remove('open');
      plType.blur();
      PL.closeTimer = setTimeout(() => { if (!PL.open) { plPanel.hidden = true; plScreen.classList.remove('live'); PL.frames = 0; } }, 360);
    }
    if (pid !== PL.pid) { PL.pid = pid; PL.frames = 0; PL.stuck = false; plScreen.classList.remove('live'); if (isNative(pid) && PL.snaps[pid]) { PL.next = PL.snaps[pid]; if (!PL.drawing) drawNext(); } }
    const nat = isNative(pid);
    const natInfo = s.native?.[pid] || {};
    plScreen.classList.toggle('native', nat);
    $('plWin').hidden = nat; // a janela à parte é só para o Edge (as nativas abrem os logins sozinhas)
    if (nat) {
      const what = plName(pid);
      if (natInfo.ready) plScreen.classList.add('live');
      if (natInfo.drm && !s.sources?.[pid]?.playing) {
        $('plNote').hidden = true;
        plWait(`O ${what} pediu proteção de conteúdo (DRM)`, 'Dentro do app não há DRM. Se a música não tocar, abra ele pelo Edge.', [h('button', { class: 'btn primary', onclick: () => api.settings({ engines: { [pid]: 'edge' } }) }, 'Abrir pelo Edge')]);
      } else plWait(`Abrindo o ${what}…`, 'Ele roda aqui dentro do app, sem navegador escondido. Entre na sua conta ali mesmo, se quiser.');
      if (PL.open) sendView(false);
      return;
    }
    // o player numa janela à parte, ou uma janela de login aberta
    const shownHere = web.shown === pid;
    if (shownHere && plScreen.classList.contains('live')) { plScreen.classList.remove('live'); PL.frames = 0; }
    const note = $('plNote');
    if (web.popups > 0 && !shownHere) {
      note.hidden = false;
      $('plNoteText').textContent = 'Uma janela de login está aberta à parte.';
      $('plNoteBtn').textContent = 'Mostrar';
      $('plNoteBtn').onclick = () => api.popupFront();
    } else note.hidden = true;
    if (PL.open) sendView(false);
    // enquanto a imagem não chega
    if (shownHere) plWait(`O ${plName(pid)} está numa janela à parte`, 'Use a janela à vontade (para um login, por exemplo). Quando terminar, ele volta para cá.', [h('button', { class: 'btn primary', onclick: () => api.playerWindow(false) }, 'Voltar ao painel'), h('button', { class: 'btn', onclick: () => api.playerWindow(true) }, 'Mostrar a janela')]);
    else if (!web.available) plWait('Não encontrei o Microsoft Edge', 'O player usa o Edge que vem no Windows para tocar o Spotify e as outras plataformas.', [], true);
    else if (web.status === 'error') plWait('O player não abriu', web.detail || 'Tente de novo.', [h('button', { class: 'btn primary', onclick: () => api.playerStart() }, 'Tentar de novo')], true);
    else if (PL.stuck) plWait(`A imagem do ${plName(pid)} não chegou ao painel`, 'Use ele numa janela à parte enquanto isso (ele continua tocando e mandando os scrobbles). O arquivo registro.log, na pasta de dados, mostra o motivo.', [h('button', { class: 'btn primary', onclick: () => api.playerWindow(true) }, 'Abrir numa janela à parte'), h('button', { class: 'btn', onclick: () => { PL.stuck = false; PL.waitSince = Date.now(); api.panelInput({ kind: 'nav', what: 'reload' }); sendView(true); } }, 'Tentar de novo')], true);
    else plWait(`Abrindo o ${plName(pid)}…`, pid === 'spotify' ? 'Grátis ou Premium. Entre na sua conta aqui mesmo, se pedir.' : 'Entre na sua conta aqui mesmo, se pedir. O que tocar vai para o Last.fm.');
  }

  /* ---------------- Desenho do estado ---------------- */
  let lastErr = '';
  let reauthWarned = false;

  function render(s) {
    S = s;
    const root = document.documentElement;
    if (s.color?.accent) { root.style.setProperty('--accent', s.color.accent); root.style.setProperty('--glow', s.color.glow); }
    else { root.style.removeProperty('--accent'); root.style.removeProperty('--glow'); }
    // barra de cima
    $('back').disabled = !s.page.canBack;
    $('fwd').disabled = !s.page.canFwd;
    $('pageTitle').textContent = s.page.title || '';
    const pl = $('mkPlaylist');
    pl.disabled = !s.sp.connected;
    pl.innerHTML = I.playlist;
    pl.append('Criar playlist');
    if (s.page.tracks) pl.append(h('b', { text: nf.format(Math.min(s.page.tracks, 100)) }));
    pl.title = s.sp.connected ? 'Criar uma playlist no Spotify com as músicas desta página' : 'Criar playlists precisa da API do Spotify (Premium). Ative em Configurações › Spotify.';

    document.body.classList.toggle('lite', s.perf === 'perf');
    renderPanel(s);

    // scrobbles
    renderScrobble(s);

    // o acesso à API do Spotify (opcional) expirou: avisa uma vez, com o botão de conectar de novo
    if (s.sp.needsReauth && !reauthWarned) { reauthWarned = true; showToast({ id: 'reauth', kind: 'warn', text: 'O acesso à API do Spotify expirou (vale 6 meses).', action: { label: 'Conectar de novo', cmd: 'reconnect' } }); }
    if (!s.sp.needsReauth) reauthWarned = false;

    // avisos de limite / rede (uma vez por mudança)
    const ek = s.error ? `${s.error.code}:${s.error.text}` : '';
    if (ek && ek !== lastErr && s.error.code !== 'no_device') showToast({ id: 'err', kind: 'warn', text: s.error.text });
    lastErr = ek;

    if (sheet.kind === 'connect') paintConnect();
    if (sheet.kind === 'welcome') paintWelcome();
    if (sheet.kind === 'settings' && sheet.tab === 'spotify') paintSettings();
  }

  const SCROBBLE = {
    ok: ['No Last.fm', 'O Spotify está mandando esta música para o seu Last.fm.'],
    wait: ['Conferindo o Last.fm', 'Vendo se a música apareceu nos seus scrobbles.'],
    missing: ['Não chegou ao Last.fm', 'Esta música não apareceu nos seus scrobbles. Clique para ver como resolver.'],
    private: ['Sessão privada', 'Com a sessão privada do Spotify ligada, nada vai para o Last.fm. Clique para saber mais.'],
    nolastfm: ['Entre no Last.fm', 'Entre na sua conta do Last.fm para o app conferir os scrobbles.'],
    app: ['Vai para o Last.fm', 'O app manda esta música para o seu Last.fm quando você ouvir metade dela (ou 4 minutos).'],
    sending: ['Mandando ao Last.fm', 'Conferindo se ela já está no seu Last.fm e mandando o scrobble.'],
    sent: ['No Last.fm', 'O app mandou esta música para o seu Last.fm.'],
    noapp: ['Sem scrobble', 'Ligue os scrobbles do app (Configurações › Scrobbles) para esta música ir para o Last.fm.'],
    ws: ['Web Scrobbler', 'O Web Scrobbler conta esta plataforma. Abra as opções dele (Configurações › Scrobbles) para ver os destinos (Last.fm, Libre.fm, ListenBrainz).'],
    wsoff: ['Web Scrobbler desligado', 'Esta plataforma está marcada para o Web Scrobbler, mas ele está desligado. Ligue em Configurações › Scrobbles.'],
    none: ['Não contado', 'Você escolheu não contar os scrobbles desta plataforma. Mude em Configurações › Scrobbles.'],
  };
  function renderScrobble(s) {
    const chip = $('scrobble');
    const st = s.scrobble?.status;
    const it = s.player?.item;
    const conf = SCROBBLE[st];
    chip.hidden = !conf || !it || it.type !== 'track';
    if (chip.hidden) return;
    chip.dataset.s = st;
    chip.textContent = conf[0];
    chip.title = conf[1];
  }

  /* ---------------- Avisos (no meio da barra de cima) ---------------- */
  const toastEl = $('toast');
  let toastTimer = 0;
  let toastId = '';
  function showToast(t) {
    if (!t || !t.text) return;
    clearTimeout(toastTimer);
    toastId = t.id || '';
    toastEl.textContent = '';
    toastEl.dataset.kind = t.kind || 'info';
    if (t.busy) toastEl.append(h('span', { class: 'toast-spin' }));
    else if (t.image) toastEl.append(h('img', { class: 'toast-img', src: t.image, alt: '' }));
    else toastEl.append(h('span', { class: 'toast-dot' }));
    toastEl.append(h('span', { class: 'toast-text', text: t.text, title: t.text }));
    if (t.action) {
      toastEl.append(h('button', {
        class: 'toast-act', onclick: () => {
          hideToast();
          const a = t.action;
          if (a.cmd === 'connect') openSheet('connect');
          else if (a.cmd === 'player-login') api.playerLogin();
          else if (a.cmd === 'player-show') api.playerShow(true);
          else if (a.cmd === 'player-hide') api.playerShow(false);
          else if (a.cmd === 'player-start') api.playerStart();
          else if (a.cmd === 'panel') api.panel({ open: true });
          else if (a.cmd === 'popup-front') api.popupFront();
          else if (a.cmd === 'engine' && a.pid) api.settings({ engines: { [a.pid]: a.engine } });
          else if (a.cmd === 'reconnect') { if (S?.sp?.configured) quickLogin(); else openSheet('connect'); }
          else if (a.cmd === 'player-unwindow') api.playerWindow(false);
          else if (a.cmd === 'lfm-auth') { closeSheet(); api.lfmAuth(); }
          else if (a.cmd === 'open-data') api.openData();
          else if (a.cmd === 'open-external' && a.url) api.external(a.url);
          else if (a.cmd === 'ws-options') api.wsOptions();
          else if (a.cmd === 'launch') api.launchSpotify();
          else if (a.cmd === 'open-track') api.openNow('track');
          else if (a.uri) api.openSpotifyUri(a.uri);
        },
      }, t.action.label));
    }
    toastEl.append(h('button', { class: 'toast-x', 'aria-label': 'Fechar aviso', html: I.close, onclick: hideToast }));
    toastEl.hidden = false;
    toastEl.style.animation = 'none'; void toastEl.offsetWidth; toastEl.style.animation = '';
    const ms = t.busy ? 25000 : t.action ? 9000 : t.kind === 'error' || t.kind === 'warn' ? 7000 : 4200;
    toastTimer = setTimeout(hideToast, ms);
  }
  function hideToast() { clearTimeout(toastTimer); toastEl.hidden = true; toastId = ''; }

  /* ---------------- Folhas ---------------- */
  const overlay = $('overlay');
  const sheetEl = $('sheet');
  const sheet = { kind: '', tab: 'spotify', busy: false };
  async function openSheet(kind, data) {
    if (overlay.hidden) {
      const shot = await api.overlay(true);
      if (shot) $('overlayBg').src = shot; else $('overlayBg').removeAttribute('src');
      overlay.hidden = false;
    } else api.hubSettings(null);
    sheet.kind = kind;
    sheet.celebrated = false;
    sheet.spKey = '';
    sheetEl.textContent = '';
    sheetEl.append(h('button', { class: 'ib sheet-x', 'aria-label': 'Fechar', title: 'Fechar (Esc)', html: I.close, onclick: closeSheet }));
    const body = h('div', { class: 'sheet-body' });
    sheetEl.append(body);
    sheet.body = body;
    if (kind === 'connect') buildConnect();
    else if (kind === 'welcome') buildWelcome();
    else if (kind === 'settings') buildSettings(data);
    else if (kind === 'playlist') buildPlaylist();
    else if (kind === 'scrobble') buildScrobble();
    sheetEl.querySelector('input, .btn.primary')?.focus();
  }
  function closeSheet() {
    if (overlay.hidden) return;
    if (sheet.kind === 'playlist' && sheet.busy) return; // a playlist está sendo criada
    if ((sheet.kind === 'connect' || sheet.kind === 'welcome') && !S?.settings?.welcomed) api.settings({ welcomed: true });
    sheet.kind = '';
    overlay.hidden = true;
    sheetEl.textContent = '';
    api.overlay(false);
  }
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay || e.target === $('overlayBg')) closeSheet(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeSheet();
  });
  api.onOverlay(() => closeSheet());

  /* Conectar o Spotify (passo a passo) */
  function buildConnect() {
    const b = sheet.body;
    const redirect = S?.redirectUri || 'http://127.0.0.1:43821/callback';
    const copyBtn = (text) => h('button', {
      onclick: async (e) => { await api.copy(text); const btn = e.currentTarget; btn.textContent = 'Copiado'; setTimeout(() => { btn.textContent = 'Copiar'; }, 1600); },
    }, 'Copiar');
    const field = h('input', { class: 'field', id: 'cid', placeholder: 'Cole aqui o Client ID (32 letras e números)', spellcheck: 'false', autocomplete: 'off', value: S?.settings?.clientId || '' });
    const hint = h('div', { class: 'hint', id: 'cidHint' });
    const save = async () => {
      const v = field.value.trim();
      const ok = /^[0-9a-f]{32}$/i.test(v);
      field.classList.toggle('bad', !ok && !!v);
      hint.classList.toggle('err', !ok && !!v);
      hint.textContent = !v ? '' : ok ? 'Client ID salvo.' : 'Esse não parece um Client ID: ele tem 32 letras (a a f) e números.';
      if (ok) await api.setClientId(v);
      return ok;
    };
    field.addEventListener('change', save);
    field.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); save().then((ok) => ok && quickLogin()); } });

    b.append(
      h('h2', { text: 'Recursos extras com a API do Spotify' }),
      h('p', { class: 'lead', text: 'Opcional, só para contas Premium. Com a API, o app cria playlists com as músicas das páginas do Last.fm e toca no celular ou na caixa de som. Para só ouvir, não precisa disto.' }),
      h('ol', { class: 'steps' },
        h('li', { id: 'st1' },
          h('div', null,
            h('h3', { text: 'Crie o seu acesso no painel do Spotify' }),
            h('p', { text: 'Entre com a sua conta Premium, clique em Create app e preencha nome e descrição como quiser.' }),
            h('ul', null,
              h('li', null, 'Em ', h('b', { text: 'Redirect URIs' }), ', cole este endereço e clique em ', h('b', { text: 'Add' }), ':'),
            ),
            h('div', { class: 'code' }, h('span', { text: redirect }), copyBtn(redirect)),
            h('ul', null,
              h('li', null, 'Em ', h('b', { text: 'Which API/SDKs are you planning to use?' }), ', marque ', h('b', { text: 'Web API' }), '.'),
              h('li', null, 'Aceite os termos e clique em ', h('b', { text: 'Save' }), '.'),
            ),
            h('div', { class: 'row' }, h('button', { class: 'btn', html: I.external, onclick: () => api.external('https://developer.spotify.com/dashboard') }, 'Abrir o painel do Spotify')),
          )),
        h('li', { id: 'st2' },
          h('div', null,
            h('h3', { text: 'Cole o Client ID' }),
            h('p', { text: 'Na página do app que você criou, abra Settings e copie o Client ID.' }),
            h('div', { class: 'row' }, field, h('button', { class: 'btn', onclick: save }, 'Salvar')),
            hint,
          )),
        h('li', { id: 'st3' },
          h('div', null,
            h('h3', { text: 'Autorize o app' }),
            h('p', { text: 'O navegador abre a página do Spotify pedindo permissão. Clique em Concordo e volte para cá.' }),
            h('div', { class: 'row' },
              h('button', { class: 'btn primary', id: 'goLogin', onclick: async () => { if (await save()) quickLogin(); else { field.focus(); hint.classList.add('err'); hint.textContent = 'Cole o Client ID antes de autorizar.'; } } }, 'Conectar o Spotify')),
            h('div', { class: 'hint', id: 'loginHint' }),
          )),
      ),
      h('div', { class: 'note', html: I.alert }, h('span', { text: 'Desde 2026 o Spotify exige Premium na conta que cria o acesso. A autorização vale por 6 meses; depois o app pede para conectar de novo, em um clique.' })),
    );
    paintConnect();
  }
  function paintConnect() {
    if (!S || sheet.kind !== 'connect') return;
    const done2 = !!S.sp.configured;
    const done3 = !!S.sp.connected;
    $('st1')?.classList.toggle('done', done2);
    $('st2')?.classList.toggle('done', done2);
    $('st3')?.classList.toggle('done', done3);
    const lh = $('loginHint');
    const go = $('goLogin');
    if (!lh || !go) return;
    if (S.sp.loggingIn) { lh.className = 'hint'; lh.textContent = 'Esperando a autorização no navegador…'; go.disabled = true; }
    else { go.disabled = false; if (!lh.classList.contains('err')) lh.textContent = ''; }
    if (done3 && !sheet.celebrated) {
      sheet.celebrated = true;
      const b = sheet.body;
      b.textContent = '';
      b.append(
        h('div', { class: 'done-big' }, h('span', { class: 'mark', html: I.check }),
          h('div', null, h('h2', { text: 'API do Spotify conectada' }), h('p', { class: 'lead', style: { margin: '0' }, text: S.sp.me?.name ? `Conta: ${S.sp.me.name}.` : 'Tudo pronto.' }))),
        h('p', { text: 'Agora dá para criar playlists com as músicas das páginas e escolher onde tocar: este computador, o celular ou a caixa de som.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: closeSheet }, 'Começar')),
      );
    }
  }
  /* Boas-vindas: ouvir pelo web player escondido (grátis ou Premium) */
  function buildWelcome() {
    const b = sheet.body;
    b.append(
      h('h2', { text: 'Ouça o Spotify sem abrir o Spotify' }),
      h('p', { class: 'lead', text: 'O app toca pelo web player do Spotify, num painel à direita que você mostra e esconde quando quiser (escondido, a música continua). Funciona com a conta grátis (com os anúncios do Spotify) e com a Premium, e não precisa do app do Spotify instalado.' }),
      h('ol', { class: 'steps' },
        h('li', { id: 'wl1' }, h('div', null,
          h('h3', { text: 'Entre na sua conta do Spotify' }),
          h('p', { text: 'O Spotify abre no painel à direita do app. Entre na sua conta ali mesmo; depois é só ouvir, e dá para esconder o painel quando quiser.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn primary', id: 'wlLogin', onclick: () => { api.settings({ welcomed: true }); closeSheet(); api.playerLogin(); } }, 'Entrar no Spotify')),
          h('div', { class: 'hint', id: 'wlHint' }))),
        h('li', { id: 'wl2' }, h('div', null,
          h('h3', { text: 'Dê play' }),
          h('p', { text: 'No painel à direita ou em qualquer “Ouvir no Spotify” do Last.fm. Clicou no Last.fm, o painel se recolhe e a música continua.' })))),
      h('div', { class: 'note', id: 'wlNote', html: I.alert },
        h('span', null, 'Tem Premium? Dá para ligar recursos extras: criar playlists com as músicas das páginas e tocar no celular ou na caixa de som. ',
          h('span', { class: 'linkish', onclick: () => openSheet('connect') }, 'Conectar a API (opcional)'))),
    );
    paintWelcome();
  }
  function paintWelcome() {
    if (!S || sheet.kind !== 'welcome') return;
    const w = S.engine?.web || {};
    const inn = w.loggedIn === true;
    $('wl1')?.classList.toggle('done', inn);
    $('wl2')?.classList.toggle('done', inn && !!S.player?.item);
    const btn = $('wlLogin');
    if (btn) { btn.textContent = inn ? 'Conectado' : 'Entrar no Spotify'; btn.disabled = inn || !w.available; }
    const hint = $('wlHint');
    if (hint && inn) hint.textContent = 'Pronto. Pode fechar esta janela.';
    if (hint && !w.available) { hint.className = 'hint err'; hint.textContent = 'Não encontrei o Microsoft Edge neste computador; o player do Spotify usa o Edge do Windows.'; }
  }

  async function quickLogin() {
    const lh = $('loginHint');
    if (lh) { lh.className = 'hint'; lh.textContent = 'Abrindo o Spotify no navegador…'; }
    const r = await api.login();
    if (!r.ok && r.code !== 'cancel') {
      if (lh) { lh.className = 'hint err'; lh.textContent = r.text; }
      else showToast({ id: 'login', kind: 'error', text: r.text });
    } else if (r.ok && sheet.kind !== 'connect') showToast({ id: 'login', kind: 'ok', text: `Spotify conectado${r.me?.name ? ` como ${r.me.name}` : ''}` });
  }

  /* Configurações */
  function buildSettings(tab) {
    sheet.tab = tab || sheet.tab || 'spotify';
    const b = sheet.body;
    const tabs = h('div', { class: 'tabs', role: 'tablist' });
    const panel = h('div', { class: 'panel', id: 'panel' });
    const TABS = [['spotify', 'Spotify'], ['scrobbles', 'Scrobbles'], ['integracao', 'Integração'], ['desempenho', 'Desempenho'], ['tema', 'Tema'], ['sobre', 'Sobre']];
    for (const [k, label] of TABS) {
      tabs.append(h('button', { role: 'tab', class: sheet.tab === k ? 'on' : '', 'aria-selected': String(sheet.tab === k), onclick: () => { api.hubSettings(null); sheet.tab = k; b.textContent = ''; buildSettings(k); } }, label));
    }
    b.append(h('h2', { text: 'Configurações' }), h('p', { class: 'lead', text: 'Como o Last.fm, o Spotify e as outras plataformas trabalham juntos neste app.' }), tabs, panel);
    const toggle = (title, desc, checked, onChange) => {
      const input = h('input', { type: 'checkbox', checked: !!checked });
      input.addEventListener('change', () => onChange(input.checked, input));
      return h('label', { class: 'toggle' }, h('div', null, h('strong', { text: title }), h('span', { text: desc })), input);
    };
    if (sheet.tab === 'spotify') paintSettings();
    else if (sheet.tab === 'scrobbles') buildScrobbleSettings(panel, toggle);
    else if (sheet.tab === 'desempenho') buildPerfSettings(panel, toggle);
    else if (sheet.tab === 'integracao') {
      const eng = 'web'; // o som toca no player do painel (o web player escondido)
      const T = [
        ['scrobbleWatch', 'Conferir os scrobbles', 'Avisa quando a música do Spotify não aparece no seu Last.fm, ou quando a sessão privada está ligada.'],
        ['follow', 'Acompanhar a música no Last.fm', 'Quando a música muda, a página do Last.fm vai para a faixa que está tocando.'],
        ['albumContext', 'Seguir com o álbum', 'Ao tocar uma faixa pelo Last.fm, o Spotify continua com o resto do álbum dela.'],
        ...(eng === 'web' ? [
          ['playerAtStart', 'Ligar o player ao abrir o app', 'O web player do Spotify liga escondido assim que o app abre, pronto para tocar.'],
        ] : [
          ['spotifyAtStart', 'Deixar o Spotify pronto ao abrir o app', 'O Spotify do computador liga escondido, sem janela, assim que o app abre.'],
          ['launchSpotify', 'Ligar o Spotify quando precisar', 'Se nenhum aparelho estiver ligado na hora do play, o app liga o Spotify do computador escondido.'],
          ['closeSpotify', 'Fechar o Spotify junto com o app', 'Quando foi o app que ligou o Spotify, ele fecha junto e a música para.'],
        ]),
        ['blockAds', 'Bloquear anúncios', 'Com o uBlock Origin já configurado: as listas EasyList, EasyPrivacy, uBlock filters, Peter Lowe, a de golpes/malware e a lista em português valem no Last.fm e nas plataformas que tocam dentro do app (YouTube Music, Deezer, SoundCloud); no Spotify, Apple Music e Tidal (player do Edge) roda a extensão uBlock Origin Lite. Anúncios e rastreadores nem carregam, o app pula propaganda e a música não para no meio.'],
        ...(eng === 'web' ? [
          ['panelAutoHide', 'Recolher o painel ao clicar fora', 'Clicou no Last.fm ou na barra de cima, o painel do player se recolhe (a música continua) e o Last.fm volta a ocupar a tela.'],
          ['onePlayer', 'Um player por vez', 'Ao abrir uma plataforma no painel, a outra fecha (o Spotify descansa até você voltar para ele). Nada toca em dobro e só um player fica trabalhando.'],
          ...(S.settings.onePlayer === false ? [['pauseOthers', 'Pausar as outras ao dar play', 'Com vários players abertos, dar play num deles pausa os outros.']] : []),
        ] : []),
      ];
      for (const [k, title, desc] of T) {
        const input = h('input', { type: 'checkbox', checked: k === 'panelAutoHide' || k === 'onePlayer' ? S.settings[k] !== false : !!S.settings[k] });
        input.addEventListener('change', () => api.settings({ [k]: input.checked }));
        panel.append(h('label', { class: 'toggle' }, h('div', null, h('strong', { text: title }), h('span', { text: desc })), input));
      }
      // como cada plataforma abre no painel: dentro do app (nativo) ou pelo Edge (para quem precisa de DRM)
      const plats = h('div', { class: 'engines' }, h('strong', { text: 'Como cada plataforma abre no painel' }),
        h('p', { class: 'hint', style: { margin: '4px 0 8px' }, text: 'No app: a página roda aqui dentro, sem navegador escondido (mais leve e mais rápido). Pelo Edge: o navegador escondido, necessário para quem usa proteção de conteúdo (DRM).' }));
      for (const x of S.platforms || []) {
        const drm = (S.drmPlatforms || []).includes(x.id);
        const cur = drm ? 'edge' : (S.settings?.engines?.[x.id] === 'edge' ? 'edge' : 'native');
        const seg = h('div', { class: 'tabs', role: 'radiogroup', 'aria-label': `Como o ${x.name} abre` });
        for (const [k, label] of [['native', 'No app'], ['edge', 'Pelo Edge']]) {
          seg.append(h('button', { role: 'radio', class: cur === k ? 'on' : '', 'aria-checked': String(cur === k), disabled: drm && k === 'native', title: drm && k === 'native' ? `O ${x.name} precisa de DRM, que só o Edge tem` : '', onclick: () => { if (cur !== k) api.settings({ engines: { [x.id]: k } }).then((st) => { if (st) S.settings = st; if (sheet.kind !== 'settings' || sheet.tab !== 'integracao') return; b.textContent = ''; buildSettings('integracao'); }); } }, label));
        }
        plats.append(h('div', { class: 'engine-row', 'data-pid': x.id }, h('span', { class: 'engine-name', style: { '--c': x.color } }, x.name, drm ? h('small', { text: 'precisa de DRM' }) : null), seg));
      }
      panel.prepend(plats); // o mais importante desta aba fica em cima
    } else if (sheet.tab === 'tema') {
      const slot = h('div', { class: 'hub-slot', id: 'hubSlot' }, 'Carregando as opções do tema…');
      panel.append(h('p', { style: { margin: '0' }, text: 'As mesmas opções da extensão Last.fm Hub. Elas valem só para este app.' }), slot);
      requestAnimationFrame(placeHub);
    } else {
      panel.append(
        h('div', { class: 'about' },
          h('div', null, h('b', { text: 'Last.fm PRIME' }), ` ${S.version}, com o tema Last.fm Hub, o Spotify e outras plataformas integrados.`),
          h('div', { text: 'As plataformas tocam pelos sites oficiais, no painel à direita. O YouTube Music, o Deezer e o SoundCloud rodam direto dentro do app; o Spotify, o Apple Music e o Tidal precisam de proteção de conteúdo (DRM) e tocam pelo Microsoft Edge que vem no Windows, escondido. Os seus logins ficam só neste computador.' }),
          h('div', { text: 'Os scrobbles feitos pelo app usam a API oficial do Last.fm, com a chave da sua conta. Opcionalmente, o Web Scrobbler conta determinadas plataformas e envia também para Libre.fm e ListenBrainz.' }),
          h('div', {}, 'Inclui o ', h('span', { class: 'linkish', onclick: () => api.external('https://github.com/web-scrobbler/web-scrobbler') }, 'Web Scrobbler'), ' (© Web Scrobbler Team, licença MIT) e o tema Last.fm Hub.'),
          h('div', { text: 'O login com conta Google é bloqueado pelo próprio Google dentro de apps, por segurança — use o e-mail e senha da plataforma. Os scrobbles não dependem desse login.' }),
          h('div', { text: 'Seus logins e configurações ficam nesta pasta, ao lado do programa:' }),
          h('div', { class: 'code' }, h('span', { text: S.dataDir }), h('button', { onclick: () => api.openData() }, 'Abrir')),
          h('div', null, 'Feito ', h('span', { class: 'linkish', onclick: () => api.external('https://s2.rip/senhor_perereko') }, 'by Perereko'), '.'),
        ),
      );
    }
  }
  /* Aba Scrobbles: o próprio app manda o que você ouve (em qualquer plataforma) para o Last.fm */
  function buildScrobbleSettings(panel, toggle) {
    const sc = S.scrobbler || {};
    const st = sc.status;
    const card = h('div', { class: 'who' }, h('span', { class: 'avatar', html: I.check }),
      h('div', { class: 'grow' },
        h('strong', { text: sc.connected ? `Scrobbles do app ligados${sc.user ? ` · ${sc.user}` : ''}` : sc.configured ? 'Falta autorizar os scrobbles' : 'Scrobbles do app desligados' }),
        h('span', { text: sc.connected ? (st === 'error' ? sc.error : sc.pending ? `${sc.pending} ${sc.pending === 1 ? 'scrobble esperando' : 'scrobbles esperando'} a internet voltar.` : sc.last ? `Último: ${sc.last.artist} — ${sc.last.track}${sc.last.via === 'service' ? ' (já tinha chegado pelo serviço)' : ''}` : 'Tudo o que tocar no painel vai para o seu Last.fm.') : 'Com eles, tudo o que tocar no painel conta no Last.fm, sem depender de cada serviço.' })),
      sc.connected ? h('button', { class: 'btn', onclick: async () => { await api.lfmLogout(); rebuild(); } }, 'Desconectar') : null);
    panel.append(card);
    const rebuild = () => { const b = sheet.body; b.textContent = ''; buildSettings('scrobbles'); };
    if (!sc.connected) {
      const key = h('input', { class: 'field', placeholder: 'API key (32 letras e números)', spellcheck: 'false', autocomplete: 'off' });
      const sec = h('input', { class: 'field', placeholder: 'Shared secret (32 letras e números)', spellcheck: 'false', autocomplete: 'off' });
      const hint = h('div', { class: 'hint', id: 'lfmHint' });
      panel.append(h('ol', { class: 'steps' },
        h('li', { class: sc.configured ? 'done' : '' }, h('div', null,
          h('h3', { text: 'Crie a sua chave da API do Last.fm' }),
          h('p', { text: 'É de graça e leva um minuto. Na página que abre, preencha Application name (por exemplo, Last.fm PRIME), deixe o resto em branco e clique em Submit. O app pega a chave sozinho.' }),
          h('div', { class: 'row' },
            h('button', { class: sc.configured ? 'btn' : 'btn primary', html: I.external, onclick: () => { closeSheet(); api.lfmCreateKey(); } }, sc.configured ? 'Criar outra chave' : 'Criar a chave no Last.fm')),
          sc.configured ? h('div', { class: 'hint', text: `Chave salva: ${sc.key}` }) : h('details', { class: 'manual' }, h('summary', { text: 'Já tenho uma chave' }),
            h('div', { class: 'row' }, key), h('div', { class: 'row' }, sec),
            h('div', { class: 'row' }, h('button', { class: 'btn', onclick: async () => {
              const r = await api.lfmKeys(key.value, sec.value);
              if (r.ok) rebuild(); else { hint.className = 'hint err'; hint.textContent = 'A chave e o segredo têm 32 letras (a a f) e números cada.'; }
            } }, 'Salvar a chave')), hint))),
        h('li', null, h('div', null,
          h('h3', { text: 'Autorize o app' }),
          h('p', { text: 'O Last.fm pergunta se o app pode mandar scrobbles para a sua conta. Clique em Yes, allow access e pronto.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn primary', disabled: !sc.configured, onclick: () => { closeSheet(); api.lfmAuth(); } }, sc.authing ? 'Esperando a autorização…' : 'Autorizar os scrobbles'))))));
    }
    panel.append(toggle('Mandar scrobbles pelo app', 'O app manda para o Last.fm o que você ouvir no painel, seguindo as regras do Last.fm (metade da música ou 4 minutos).', S.settings.scrobbleOn, (v) => api.settings({ scrobbleOn: v })));

    // Web Scrobbler: a extensão de código aberto, para quem quer mandar também para Libre.fm / ListenBrainz
    const ws = S.ws || {};
    const wsOn = !!S.settings.webScrobbler;
    panel.append(h('div', { class: 'who', style: { marginTop: '12px' } }, h('span', { class: 'avatar', html: I.check }),
      h('div', { class: 'grow' },
        h('strong', { text: wsOn ? (ws.loaded ? 'Web Scrobbler ligado' : 'Web Scrobbler ligando…') : 'Web Scrobbler (extensão)' }),
        h('span', { text: wsOn
          ? 'Conecte suas contas (Last.fm, Libre.fm, ListenBrainz) nas opções dele. Escolha abaixo quais plataformas ele conta.'
          : 'Extensão de código aberto (licença MIT). Ligue para contar scrobbles pelo Web Scrobbler e enviar também para Libre.fm e ListenBrainz.' })),
      h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: wsOn, onchange: (e) => api.settings({ webScrobbler: e.target.checked }).then((st) => { if (st) S.settings = st; rebuild(); }) }), h('span', { class: 'track' }))));
    if (wsOn) panel.append(h('div', { class: 'row' }, h('button', { class: 'btn', html: I.external, onclick: () => api.wsOptions() }, 'Abrir o Web Scrobbler')));

    // Quem conta cada plataforma
    panel.append(h('p', { class: 'hint', style: { margin: '14px 0 4px' }, text: 'Quem conta cada plataforma. O Web Scrobbler só funciona pelo Microsoft Edge, então escolhê-lo abre essa plataforma pelo Edge. O Spotify, o Deezer e o Tidal têm ligação própria com o Last.fm: o app confere antes e não duplica.' }));
    const by = S.settings.scrobbleBy || {};
    for (const x of S.platforms || []) {
      const cur = ['app', 'ws', 'off'].includes(by[x.id]) ? by[x.id] : 'app';
      const opts = x.id === 'spotify' ? [['app', 'App'], ['off', 'Não contar']] : [['app', 'App'], ['ws', 'Web Scrobbler'], ['off', 'Não contar']];
      const seg = h('div', { class: 'tabs sm', role: 'radiogroup', 'aria-label': `Scrobbles do ${x.name}` });
      for (const [k, label] of opts) {
        seg.append(h('button', {
          role: 'radio', class: cur === k ? 'on' : '', 'aria-checked': String(cur === k),
          onclick: () => {
            if (cur === k) return;
            const patch = { scrobbleBy: { [x.id]: k } };
            if (k === 'ws' && !wsOn) patch.webScrobbler = true; // escolher o Web Scrobbler já liga a extensão
            api.settings(patch).then((st) => { if (st) S.settings = st; if (sheet.kind === 'settings' && sheet.tab === 'scrobbles') rebuild(); });
          },
        }, label));
      }
      panel.append(h('div', { class: 'engine-row' }, h('div', { class: 'grow' }, h('strong', { text: x.name }), h('span', { class: 'hint', text: cur === 'ws' ? 'Contado pelo Web Scrobbler (abre pelo Edge).' : cur === 'off' ? 'Não entra nos scrobbles.' : 'O app manda para o seu Last.fm.' })), seg));
    }
    if (sc.configured) panel.append(h('div', { class: 'row', style: { marginTop: '12px' } }, h('button', { class: 'btn', onclick: async () => { await api.lfmForget(); rebuild(); } }, 'Apagar a chave da API')));
  }
  /* Aba Desempenho: modos, balões, animações e o cache */
  async function buildPerfSettings(panel, toggle) {
    const mode = S.perf === 'perf' ? 'perf' : 'full';
    const seg = h('div', { class: 'tabs', role: 'radiogroup', 'aria-label': 'Modo' });
    for (const [k, label] of [['full', 'Experiência completa'], ['perf', 'Desempenho']]) {
      seg.append(h('button', { role: 'radio', class: mode === k ? 'on' : '', 'aria-checked': String(mode === k), onclick: async () => { await api.perf(k); S.perf = k; document.body.classList.toggle('lite', k === 'perf'); if (sheet.kind !== 'settings' || sheet.tab !== 'desempenho') return; const b = sheet.body; b.textContent = ''; buildSettings('desempenho'); } }, label));
    }
    panel.append(h('div', null, h('strong', { text: 'Modo' }),
      h('p', { class: 'hint', style: { margin: '4px 0 10px' }, text: mode === 'perf' ? 'Sem desfoques, animações, brilho ambiente e balões; a imagem do player fica mais leve. Bom para computadores modestos ou para jogar com o app aberto.' : 'Tudo ligado: animações, desfoques, brilho na cor da capa, balões e a imagem do player em alta qualidade.' }), seg));
    panel.append(toggle('Animação de abertura', 'Toda vez que o app abre, uma entrada animada em tela cheia enquanto o Last.fm carrega. Um clique ou qualquer tecla pula.', S.settings.intro !== false, (v) => api.settings({ intro: v })));
    const box = h('div', { class: 'perf-opts' }, h('p', { class: 'hint', text: 'Carregando as opções do tema…' }));
    panel.append(box);
    const cache = h('div', { class: 'who' }, h('span', { class: 'avatar', html: I.folder }),
      h('div', { class: 'grow' }, h('strong', { text: 'Cache' }), h('span', { id: 'cacheTxt', text: 'Medindo…' })),
      h('button', { class: 'btn', id: 'cacheBtn', onclick: async (e) => {
        const btn = e.currentTarget; btn.disabled = true; btn.textContent = 'Limpando…';
        const r = await api.clearCache();
        btn.disabled = false; btn.textContent = 'Limpar o cache';
        $('cacheTxt').textContent = r.freed >= 1048576 ? `Pronto: ${mb(r.freed)} liberados. Agora: ${mb(r.after)}. Logins e configurações ficaram.` : `Pronto: o cache já estava enxuto (${mb(r.after)} agora). Logins e configurações ficaram.`;
      } }, 'Limpar o cache'));
    panel.append(h('div', { style: { marginTop: '14px' } }, cache));
    const mb = (b) => (b >= 1048576 ? `${nf.format(Math.round(b / 1048576))} MB` : `${nf.format(Math.round((b || 0) / 1024))} KB`);
    api.cacheSize().then((r) => { const t = $('cacheTxt'); if (t) t.textContent = `${mb(r.bytes)} em capas, páginas e players guardados. O app limpa sozinho de tempos em tempos.`; });
    const ext = await api.extGet();
    box.textContent = '';
    if (!ext) { box.append(h('p', { class: 'hint', text: 'Abra uma página do Last.fm para ajustar as opções do tema.' })); return; }
    const set = (patch) => api.extSet(patch);
    box.append(
      toggle('Balões flutuantes', 'Ao passar o mouse num artista, álbum ou faixa, um balão mostra números, tags e um resumo.', ext.hoverCards, (v) => set({ hoverCards: v })),
      toggle('Animações', 'Entrada das páginas, capas que surgem ao rolar e efeitos ao passar o mouse.', ext.animations, (v) => set({ animations: v })),
      toggle('Brilho ambiente', 'A cor da capa ou da foto tinge o topo da página.', ext.ambient, (v) => set({ ambient: v })),
      toggle('Modo leve no Last.fm', 'Sem desfoques e sem mosaicos animados nas páginas.', ext.lite, (v) => set({ lite: v })),
    );
  }
  function paintSettings() {
    const panel = $('panel');
    if (!panel || sheet.tab !== 'spotify') return;
    const sp = S.sp;
    const w = S.engine?.web || {};
    const key = JSON.stringify([sp.connected, sp.needsReauth, sp.me, sp.configured, sp.quota, S.settings.clientId, w, S.engine?.kind]);
    if (key === sheet.spKey) return;
    sheet.spKey = key;
    panel.textContent = '';
    if (S.engine?.kind === 'web') {
      panel.append(h('div', { class: 'who' }, h('span', { class: 'avatar', html: I.disc }),
        h('div', { class: 'grow' }, h('strong', { text: w.loggedIn ? 'Player do Spotify conectado' : w.available ? 'Player do Spotify sem login' : 'Player do Spotify indisponível' }),
          h('span', { text: !w.available ? 'Não encontrei o Microsoft Edge neste computador.' : w.status === 'on' ? `Tocando pelo web player escondido (${w.browser}). Grátis ou Premium.` : 'Desligado. Ele liga quando você dá play.' })),
        h('button', { class: 'btn', disabled: !w.available, onclick: () => api.playerShow(!w.visible) }, w.visible ? 'Esconder' : 'Mostrar'),
        h('button', { class: w.loggedIn ? 'btn' : 'btn primary', disabled: !w.available, onclick: () => api.playerLogin() }, w.loggedIn ? 'Trocar de conta' : 'Entrar')));
      panel.append(h('p', { class: 'hint', style: { margin: '6px 0 0' }, text: 'API do Spotify (opcional, só Premium): cria playlists e toca em outros aparelhos.' }));
    }
    const av = sp.me?.image ? h('img', { src: sp.me.image, alt: '' }) : h('span', { class: 'avatar', html: I.disc });
    panel.append(h('div', { class: 'who' }, av,
      h('div', { class: 'grow' }, h('strong', { text: sp.connected ? `API: ${sp.me?.name || 'conta conectada'}` : 'API do Spotify não conectada' }),
        h('span', { text: sp.connected ? 'Playlists e outros aparelhos liberados' : sp.needsReauth ? 'O acesso expirou (vale 6 meses). Conecte de novo.' : 'Opcional. Precisa de conta Premium.' })),
      sp.connected
        ? h('button', { class: 'btn', onclick: () => api.logout() }, 'Desconectar')
        : h('button', { class: 'btn primary', onclick: () => openSheet('connect') }, 'Conectar')));
    if (sp.configured) {
      const id = S.settings.clientId;
      panel.append(h('div', { class: 'row' },
        h('span', { style: { color: 'var(--ink-2)' }, text: `Client ID: ${id.slice(0, 6)}…${id.slice(-4)}` }),
        h('button', { class: 'btn', onclick: () => openSheet('connect') }, 'Trocar')));
    }
    if (sp.quota) panel.append(h('div', { class: 'note warn', html: I.alert }, h('span', { text: 'O limite de uso da API do Spotify foi atingido. O app diminui as consultas e volta ao normal sozinho.' })));
  }
  function placeHub() {
    const slot = $('hubSlot');
    if (!slot || overlay.hidden) return;
    const r = slot.getBoundingClientRect();
    const w = Math.min(400, r.width - 16);
    api.hubSettings({ x: r.left + (r.width - w) / 2, y: r.top + 8, width: w, height: r.height - 16 });
  }
  sheetEl.addEventListener('scroll', () => { if (sheet.kind === 'settings' && sheet.tab === 'tema') placeHub(); });
  window.addEventListener('resize', () => { if (sheet.kind === 'settings' && sheet.tab === 'tema') placeHub(); });

  /* Playlist com as músicas da página */
  async function buildPlaylist() {
    const b = sheet.body;
    b.append(h('h2', { text: 'Criar playlist no Spotify' }), h('p', { class: 'lead', text: 'Lendo as músicas desta página…' }));
    const data = await api.collect();
    if (sheet.kind !== 'playlist') return;
    b.textContent = '';
    const tracks = data?.tracks || [];
    const albums = data?.albums || [];
    if (!tracks.length && !albums.length) {
      b.append(h('h2', { text: 'Nada para virar playlist aqui' }),
        h('p', { class: 'lead', text: 'Abra uma página com músicas: um chart, as suas curtidas, um álbum, as faixas de um artista ou o Descobrir.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn', onclick: closeSheet }, 'Fechar')));
      return;
    }
    const what = tracks.length ? `${nf.format(tracks.length)} ${tracks.length === 1 ? 'música' : 'músicas'}` : `${nf.format(albums.length)} ${albums.length === 1 ? 'álbum inteiro' : 'álbuns inteiros'}`;
    const name = h('input', { class: 'field', value: `Last.fm · ${data.title || 'PRIME'}`.slice(0, 100), maxlength: '100', 'aria-label': 'Nome da playlist' });
    const list = h('ol', { class: 'plist-sample' }, ...(tracks.length ? tracks : albums).slice(0, 40).map((t) => h('li', null, t.title, h('span', { text: t.artist }))));
    const go = h('button', { class: 'btn primary', html: I.playlist }, 'Criar playlist');
    b.append(
      h('h2', { text: 'Criar playlist no Spotify' }),
      h('p', { class: 'lead', text: `Com ${what} desta página. A playlist fica privada na sua conta; o que não existir no Spotify fica de fora.` }),
      h('div', { class: 'plist' }, h('div', { class: 'row' }, name), list, h('div', { class: 'row' }, go, h('button', { class: 'btn', onclick: closeSheet }, 'Cancelar'))),
    );
    go.onclick = async () => {
      sheet.busy = true;
      const meter = h('div', { class: 'meter' }, h('i'));
      const status = h('p', { class: 'lead', text: 'Procurando as músicas no Spotify…' });
      b.textContent = '';
      b.append(h('h2', { text: 'Criando a playlist' }), status, meter);
      const off = api.onProgress((d) => {
        meter.firstChild.style.setProperty('--m', `${d.total ? (d.done / d.total) * 100 : 0}%`);
        status.textContent = d.creating ? 'Montando a playlist…' : d.wait ? 'O Spotify pediu uma pausa; continuando em instantes…' : `Procurando no Spotify: ${nf.format(d.done)} de ${nf.format(d.total)}`;
      });
      const r = await api.createPlaylist({ name: name.value.trim() || 'Last.fm PRIME', tracks, albums, url: data.url });
      off();
      sheet.busy = false;
      if (sheet.kind !== 'playlist') return;
      b.textContent = '';
      if (!r.ok) {
        b.append(h('h2', { text: 'A playlist não foi criada' }), h('p', { class: 'lead', text: r.text || 'Algo deu errado.' }), h('div', { class: 'row' }, h('button', { class: 'btn', onclick: closeSheet }, 'Fechar')));
        return;
      }
      b.append(
        h('div', { class: 'done-big' }, h('span', { class: 'mark', html: I.check }),
          h('div', null, h('h2', { text: 'Playlist criada' }), h('p', { class: 'lead', style: { margin: '0' }, text: `${nf.format(r.count)} ${r.count === 1 ? 'música' : 'músicas'} em “${name.value.trim() || 'Last.fm PRIME'}”.${r.missing ? ` ${nf.format(r.missing)} não ${r.missing === 1 ? 'foi encontrada' : 'foram encontradas'} no Spotify.` : ''}` }))),
        h('div', { class: 'row', style: { 'margin-top': '18px' } },
          h('button', { class: 'btn primary', html: I.play, onclick: () => { api.playUri(r.uri, name.value.trim()); closeSheet(); } }, 'Tocar agora'),
          h('button', { class: 'btn', html: I.external, onclick: () => api.openSpotifyUri(r.uri) }, 'Abrir no Spotify'),
          h('button', { class: 'btn', onclick: closeSheet }, 'Fechar')),
      );
    };
  }

  /* Ajuda dos scrobbles */
  function buildScrobble() {
    const b = sheet.body;
    const st = S?.scrobble?.status;
    const it = S?.player?.item;
    if (st === 'private') {
      b.append(
        h('h2', { text: 'Sessão privada ligada no Spotify' }),
        h('p', { class: 'lead', text: 'Enquanto ela estiver ligada, o Spotify não manda o que você ouve para o Last.fm.' }),
        h('p', { text: 'Para desligar no Spotify do computador: clique na sua foto, no canto de cima, e desmarque Sessão privada. No celular: Configurações › Privacidade e social › Sessão privada.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn', onclick: closeSheet }, 'Entendi')));
      return;
    }
    b.append(
      h('h2', { text: st === 'ok' ? 'Os scrobbles estão chegando' : 'A música não chegou ao seu Last.fm' }),
      h('p', { class: 'lead', text: st === 'ok' ? `“${it?.name || ''}” apareceu no seu Last.fm. O app continua conferindo enquanto você ouve.` : `O Spotify está tocando “${it?.name || 'esta música'}”, mas ela não apareceu nos seus scrobbles recentes.` }),
    );
    if (st === 'ok') { b.append(h('div', { class: 'row' }, h('button', { class: 'btn', onclick: closeSheet }, 'Fechar'))); return; }
    b.append(
      h('div', { class: 'note', html: I.check },
        h('span', null, h('b', { text: 'Jeito mais garantido: ' }), 'deixe o próprio app mandar os scrobbles. Ele confere o seu Last.fm antes e não duplica nada. ',
          h('span', { class: 'linkish', onclick: () => openSheet('settings', 'scrobbles') }, 'Ligar os scrobbles do app'))),
      h('ol', { class: 'steps' },
        h('li', null, h('div', null, h('h3', { text: 'Confira a conexão do Spotify no Last.fm' }),
          h('p', { text: 'Nas configurações do Last.fm, em Aplicativos, o Spotify precisa aparecer como conectado. Se não estiver, conecte por lá.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => { closeSheet(); api.nav('url', 'https://www.last.fm/settings/applications'); } }, 'Abrir as configurações do Last.fm')))),
        h('li', null, h('div', null, h('h3', { text: 'Veja se a sessão privada está desligada' }),
          h('p', { text: 'No Spotify, a sessão privada impede os scrobbles. Ela fica no menu da sua foto.' }))),
        h('li', null, h('div', null, h('h3', { text: 'Dê alguns segundos' }),
          h('p', { text: 'O Last.fm às vezes demora para mostrar o que está tocando. O app confere de novo sozinho e o aviso some quando a música aparecer.' })))),
    );
  }

  /* ---------------- Ligações ---------------- */
  api.onState(render);
  api.onToast(showToast);
  api.state().then((s) => {
    render(s);
    if (!s.sp.connected && !s.settings.welcomed && !s.sp.needsReauth) {
      const welcome = () => openSheet(s.engine?.web?.loggedIn ? 'connect' : 'welcome');
      // com a animação de abertura na tela, as boas-vindas esperam ela terminar
      if (s.intro) afterIntro = welcome; else setTimeout(welcome, 900);
    }
  });
})();

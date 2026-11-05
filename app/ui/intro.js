'use strict';
/* Abertura do Last.fm PRIME: comanda a sequência, a poeira de estrelas e a saída.
 * O app avisa quando pode começar (a janela apareceu) e quando o Last.fm já carregou; a abertura
 * dura pelo menos o tempo da sequência e espera o Last.fm (com aviso de "carregando" se demorar). */
(() => {
  const api = window.lfi || { painted() {}, exit() {}, done() {}, onGo() {}, onReady() {} };
  const root = document.documentElement;
  const body = document.body;
  const lite = new URLSearchParams(location.search).get('perf') === '1';
  if (lite) body.classList.add('lite');

  const MIN = lite ? 1900 : 2500;    // a sequência inteira (disco, nome) antes de poder sair
  const WAIT_MSG = 2900;             // depois disso, se o Last.fm ainda não chegou, mostra "carregando"
  const MAX = 12000;                 // nunca prende o app mais que isso

  /* ---------------- Tamanhos ---------------- */
  function size() {
    const d = Math.round(Math.max(170, Math.min(320, Math.min(innerWidth, innerHeight) * 0.34)));
    const sw = Math.round(d * 1.18);
    root.style.setProperty('--d', `${d}px`);
    root.style.setProperty('--sw', `${sw}px`);
    root.style.setProperty('--over', ((innerWidth / sw) * 1.04).toFixed(3));
  }
  size();
  addEventListener('resize', () => { size(); fit(); });

  /* ---------------- Poeira de estrelas (vira velocidade de dobra na saída) ---------------- */
  const cv = document.getElementById('dust');
  const cx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, CY = 0;
  function fit() {
    DPR = Math.min(2, devicePixelRatio || 1);
    W = cv.width = Math.round(innerWidth * DPR);
    H = cv.height = Math.round(innerHeight * DPR);
    CY = H * 0.44;
  }
  fit();
  const COLORS = ['#b8a4ff', '#ff8fd1', '#f4f3f7', '#9fd8ff'];
  const N = lite ? 45 : 150;
  const P = [];
  const spawn = (p, fresh) => {
    p.a = Math.random() * Math.PI * 2;
    p.z = fresh ? Math.random() : 0.02 + Math.random() * 0.08; // 0 = no centro, 1 = na borda
    p.v = 0.0009 + Math.random() * 0.0024;
    p.s = 0.6 + Math.random() * 1.6;
    p.c = COLORS[(Math.random() * COLORS.length) | 0];
    p.px = null; p.py = null;
    return p;
  };
  for (let i = 0; i < N; i++) P.push(spawn({}, true));
  let warp = 0.35, warpTo = 1, alpha = 0, alphaTo = 0, last = performance.now(), running = true;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(48, now - last); last = now;
    warp += (warpTo - warp) * Math.min(1, dt / 220);
    alpha += (alphaTo - alpha) * Math.min(1, dt / 500);
    cx.clearRect(0, 0, W, H);
    const R = Math.hypot(W, H) * 0.6;
    for (const p of P) {
      p.z += p.v * warp * dt * (0.4 + p.z * 1.8);
      if (p.z > 1.05) { spawn(p, false); continue; }
      const d = p.z * p.z * R;
      const x = W / 2 + Math.cos(p.a) * d;
      const y = CY + Math.sin(p.a) * d * 0.82;
      const a = Math.min(1, p.z * 2.4) * alpha;
      cx.globalAlpha = a;
      if (warp > 3 && p.px !== null) {
        // em velocidade de dobra, cada estrela vira um risco
        cx.strokeStyle = p.c;
        cx.lineWidth = p.s * DPR * (0.6 + p.z);
        cx.beginPath(); cx.moveTo(p.px, p.py); cx.lineTo(x, y); cx.stroke();
      } else {
        cx.fillStyle = p.c;
        cx.beginPath(); cx.arc(x, y, p.s * DPR * (0.4 + p.z), 0, Math.PI * 2); cx.fill();
      }
      p.px = x; p.py = y;
    }
    cx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------------- A sequência ---------------- */
  let started = false, ready = false, minDone = false, exiting = false;
  function start() {
    if (started) return;
    started = true;
    body.classList.add('go');
    setTimeout(() => { alphaTo = 1; }, 300);
    setTimeout(() => { minDone = true; maybeExit(); }, MIN);
    setTimeout(() => { if (!exiting && !ready) body.classList.add('waiting'); }, WAIT_MSG);
    setTimeout(() => { ready = true; maybeExit(); }, MAX);
  }
  function maybeExit() { if (ready && minDone) exit(false); }
  function exit(fast) {
    if (exiting) return;
    if (!started) start();
    exiting = true;
    body.classList.remove('waiting');
    body.classList.add('out');
    if (fast) body.classList.add('fast');
    warpTo = lite ? 6 : 14; alphaTo = 1;
    api.exit();
    setTimeout(() => { alphaTo = 0; }, fast ? 250 : 450);
    // o app só tira a abertura depois que o portal abriu por inteiro
    setTimeout(() => { running = false; api.done(); }, fast ? 680 : 1080);
  }

  api.onGo(start);
  api.onReady(() => { ready = true; maybeExit(); });
  // normalmente o app manda começar quando a janela ganha foco; isto é só uma rede de segurança se esse aviso nunca chegar
  setTimeout(start, 15000);
  // pular: um clique ou qualquer tecla
  addEventListener('pointerdown', () => exit(true));
  addEventListener('keydown', () => exit(true));

  requestAnimationFrame(() => requestAnimationFrame(() => api.painted()));
})();

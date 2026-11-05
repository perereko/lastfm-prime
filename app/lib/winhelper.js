'use strict';
/* Conversa com o lfprime-janelas.exe, o ajudante que tira as janelas do player da barra de tarefas
 * (e põe na frente as janelas de login). Ele fica rodando enquanto o app estiver aberto e reage na hora
 * em que uma janela aparece. Se ele não puder rodar (antivírus, pasta sem permissão), o app volta para
 * o PowerShell, que faz o mesmo de forma mais lenta. */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class WinHelper {
  constructor({ exe, log } = {}) {
    this.exe = exe || path.join(__dirname, '..', 'bin', 'lfprime-janelas.exe');
    this.log = log || (() => {});
    this.proc = null;
    this.alive = false;   // respondeu "ready"
    this.failed = 0;
    this.pid = 0;
  }

  get usable() { return process.platform === 'win32' && fs.existsSync(this.exe) && this.failed < 3; }

  ensure() {
    if (this.proc) return true;
    if (!this.usable) return false;
    let p;
    try {
      p = spawn(this.exe, [], { stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true });
    } catch (e) { this.failed++; this.log('janelas: o ajudante não abriu', e.message); return false; }
    this.proc = p;
    this.alive = false;
    let buf = '';
    p.stdout.on('data', (d) => {
      buf += d;
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (line === 'ready') { this.alive = true; if (this.pid) this.write(`watch ${this.pid}`); }
      }
    });
    p.stdin.on('error', () => { /* fechou */ });
    p.on('error', (e) => { this.failed++; this.log('janelas: erro no ajudante', e.message); this.drop(p); });
    p.on('exit', (code) => { if (this.proc === p && code) { this.failed++; this.log('janelas: o ajudante fechou', code); } this.drop(p); });
    return true;
  }
  drop(p) { if (this.proc === p) { this.proc = null; this.alive = false; } }
  write(line) {
    if (!this.proc) return false;
    try { this.proc.stdin.write(`${line}\n`); return true; } catch (_) { return false; }
  }
  /** Passa a cuidar das janelas deste processo (o navegador do player) */
  watch(pid) { this.pid = Number(pid) || 0; if (this.ensure() && this.alive) this.write(`watch ${this.pid}`); }
  /** Confere as janelas agora */
  sweep() { if (this.ensure()) this.write('sweep'); }
  /** As janelas do player que estiverem na tela vão para a frente */
  front() { if (this.ensure()) this.write('front'); }
  /** Espera o ajudante responder (até ms); devolve se ele está funcionando */
  async ready(ms = 2500) {
    if (!this.ensure()) return false;
    const t = Date.now();
    while (!this.alive && this.proc && Date.now() - t < ms) await new Promise((r) => setTimeout(r, 50));
    return this.alive;
  }
  stop() { const p = this.proc; this.proc = null; this.alive = false; if (p) { try { p.stdin.end(); } catch (_) { /* já saiu */ } setTimeout(() => { try { p.kill(); } catch (_) { /* já saiu */ } }, 1500).unref?.(); } }
}

module.exports = { WinHelper };

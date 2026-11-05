'use strict';
/* Conversa com um navegador Chromium (Edge/Chrome) pelo protocolo de depuração (CDP).
 * Dois caminhos:
 *  - pipe (padrão): o navegador abre com --remote-debugging-pipe; mensagens JSON separadas por \0
 *    nos descritores 3 (entrada) e 4 (saída). Não abre porta de rede nenhuma.
 *  - websocket (reserva): o navegador abre com --remote-debugging-port=0, só no 127.0.0.1. */
const { EventEmitter } = require('events');

class CDP extends EventEmitter {
  constructor() {
    super();
    this.seq = 0;
    this.waiting = new Map();
    this.closed = false;
    this.write = () => { throw new Error('sem conexão'); };
  }

  /** Pipe: writable = descritor 3 do navegador, readable = descritor 4 */
  static pipe(writable, readable) {
    const c = new CDP();
    let parts = [];
    readable.on('data', (chunk) => {
      let start = 0;
      let i;
      while ((i = chunk.indexOf(0, start)) >= 0) {
        parts.push(chunk.subarray(start, i));
        const raw = Buffer.concat(parts).toString('utf8');
        parts = [];
        start = i + 1;
        c.onMessage(raw);
      }
      if (start < chunk.length) parts.push(chunk.subarray(start));
    });
    const end = () => c.end();
    readable.on('end', end);
    readable.on('close', end);
    readable.on('error', end);
    writable.on('error', end);
    c.write = (s) => writable.write(s + '\0');
    return c;
  }

  /** WebSocket (reserva quando o pipe não funciona) */
  static websocket(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const WS = globalThis.WebSocket;
      if (!WS) { reject(new Error('sem WebSocket')); return; }
      const c = new CDP();
      let ws;
      try { ws = new WS(url); } catch (e) { reject(e); return; }
      const timer = setTimeout(() => { try { ws.close(); } catch (_) { /* já fechado */ } reject(new Error('websocket: sem resposta')); }, timeout);
      ws.onopen = () => { clearTimeout(timer); c.write = (s) => ws.send(s); c.ws = ws; resolve(c); };
      ws.onmessage = (ev) => c.onMessage(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString('utf8'));
      ws.onerror = () => { clearTimeout(timer); c.end(); reject(new Error('websocket: erro')); };
      ws.onclose = () => c.end();
    });
  }

  onMessage(raw) {
    let msg;
    try { msg = JSON.parse(raw); } catch (_) { return; }
    if (msg.id !== undefined && this.waiting.has(msg.id)) {
      const { resolve, reject, timer } = this.waiting.get(msg.id);
      this.waiting.delete(msg.id);
      clearTimeout(timer);
      if (msg.error) reject(Object.assign(new Error(msg.error.message || 'CDP'), { data: msg.error }));
      else resolve(msg.result || {});
    } else if (msg.method) {
      this.emit('event', msg.method, msg.params || {}, msg.sessionId);
      this.emit(msg.method, msg.params || {}, msg.sessionId);
    }
  }

  end() {
    if (this.closed) return;
    this.closed = true;
    for (const { reject, timer } of this.waiting.values()) { clearTimeout(timer); reject(new Error('navegador fechado')); }
    this.waiting.clear();
    try { this.ws && this.ws.close(); } catch (_) { /* já fechado */ }
    this.emit('close');
  }

  send(method, params = {}, sessionId, timeout = 20000) {
    if (this.closed) return Promise.reject(new Error('navegador fechado'));
    const id = ++this.seq;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.waiting.delete(id); reject(new Error(`${method}: sem resposta`)); }, timeout);
      this.waiting.set(id, { resolve, reject, timer });
      try { this.write(JSON.stringify(msg)); } catch (e) { clearTimeout(timer); this.waiting.delete(id); reject(e); }
    });
  }
}

module.exports = { CDP };

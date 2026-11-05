'use strict';
/* Esconde e mostra a janela do web player no Windows (sem botão na barra de tarefas).
 * Usa o PowerShell que já vem no Windows, com chamadas diretas à API de janelas. */
const { spawn, execFile } = require('child_process');

const TYPES = `
Add-Type -Namespace LfPrime -Name W -MemberDefinition @'
[DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, System.IntPtr l);
public delegate bool EnumProc(System.IntPtr h, System.IntPtr l);
[DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(System.IntPtr h, out uint pid);
[DllImport("user32.dll")] public static extern bool ShowWindow(System.IntPtr h, int cmd);
[DllImport("user32.dll")] public static extern bool IsWindowVisible(System.IntPtr h);
[DllImport("user32.dll")] public static extern bool IsWindow(System.IntPtr h);
[DllImport("user32.dll")] public static extern bool SetForegroundWindow(System.IntPtr h);
[DllImport("user32.dll")] public static extern bool SetWindowPos(System.IntPtr h, System.IntPtr after, int x, int y, int cx, int cy, uint flags);
[DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowTextLength(System.IntPtr h);
[DllImport("user32.dll", EntryPoint="GetWindowLongPtrW")] public static extern System.IntPtr GetWindowLongPtr(System.IntPtr h, int i);
[DllImport("user32.dll", EntryPoint="SetWindowLongPtrW")] public static extern System.IntPtr SetWindowLongPtr(System.IntPtr h, int i, System.IntPtr v);
[DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(System.IntPtr h, System.Text.StringBuilder s, int n);
[DllImport("user32.dll")] public static extern bool IsIconic(System.IntPtr h);
[DllImport("user32.dll")] public static extern bool BringWindowToTop(System.IntPtr h);
[DllImport("user32.dll")] public static extern bool GetWindowRect(System.IntPtr h, out RECT r);
public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
'@
`;

function run(script, timeout = 15000) {
  return new Promise((resolve) => {
    let out = '';
    let ps;
    try {
      // o script vai inteiro como "comando codificado": lido pela entrada padrão, o PowerShell executa linha por
      // linha e pode pular blocos de várias linhas sem avisar
      const encoded = Buffer.from(script, 'utf16le').toString('base64');
      ps = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch (_) { resolve(null); return; }
    const timer = setTimeout(() => { try { ps.kill(); } catch (_) { /* já saiu */ } resolve(null); }, timeout);
    ps.stdout.on('data', (d) => { out += d; });
    ps.on('error', () => { clearTimeout(timer); resolve(null); });
    ps.on('close', () => { clearTimeout(timer); resolve(out); });
  });
}

// janelas do navegador (de nível superior, com título) que pertencem ao processo
const ENUM = (pid, body) => `${TYPES}
$found = New-Object System.Collections.Generic.List[string]
$cb = [LfPrime.W+EnumProc]{ param($h, $l)
  $p = 0; [void][LfPrime.W]::GetWindowThreadProcessId($h, [ref]$p)
  if ($p -eq ${Number(pid)} -and [LfPrime.W]::GetWindowTextLength($h) -gt 0) {
    $sb = New-Object System.Text.StringBuilder 256; [void][LfPrime.W]::GetClassName($h, $sb, 256)
    if ($sb.ToString() -like 'Chrome_WidgetWin_*') { ${body} }
  }
  return $true
}
[void][LfPrime.W]::EnumWindows($cb, [System.IntPtr]::Zero)
$found -join ','`;
const ids = (out) => String(out || '').trim().split(',').filter((x) => /^\d+$/.test(x));

/** Esconde as janelas visíveis do processo e devolve quais eram (para mostrar de novo depois) */
async function hide(pid) {
  if (process.platform !== 'win32' || !pid) return [];
  return ids(await run(ENUM(pid, `if ([LfPrime.W]::IsWindowVisible($h)) { [void][LfPrime.W]::ShowWindow($h, 0); $found.Add($h.ToInt64().ToString()) }`)));
}

/** Tira da barra de tarefas e do Alt+Tab as janelas do player que já estão fora da tela (o app as leva
 *  para lá pelo próprio navegador). Elas continuam "visíveis" para o navegador, assim a imagem do painel
 *  e o som continuam. Janelas na tela (login do Facebook/Google, o player que você pediu para ver) ficam
 *  como estão. Devolve quantas janelas estão estacionadas. */
async function park(pid) {
  if (process.platform !== 'win32' || !pid) return 0;
  // WS_EX_TOOLWINDOW (0x80) liga, WS_EX_APPWINDOW (0x40000) desliga; esconde e mostra para a barra de tarefas perceber.
  // ShowWindow 4 = SW_SHOWNOACTIVATE
  const out = await run(ENUM(pid, `
      $r = New-Object LfPrime.W+RECT; [void][LfPrime.W]::GetWindowRect($h, [ref]$r)
      if (-not [LfPrime.W]::IsIconic($h) -and ($r.Left -le -10000 -or $r.Top -le -10000)) {
        $ex = [LfPrime.W]::GetWindowLongPtr($h, -20).ToInt64()
        $want = ($ex -bor 0x80) -band (-bnot 0x40000)
        if ($want -ne $ex) { [void][LfPrime.W]::ShowWindow($h, 0); [void][LfPrime.W]::SetWindowLongPtr($h, -20, [System.IntPtr]::new($want)); [void][LfPrime.W]::ShowWindow($h, 4) }
        $found.Add($h.ToInt64().ToString())
      }`));
  return ids(out).length;
}

/** As janelas do player que estão na tela voltam a ser janelas normais (com botão) e vêm para a frente */
async function front(pid) {
  if (process.platform !== 'win32' || !pid) return 0;
  // SWP_NOMOVE|SWP_NOSIZE|SWP_SHOWWINDOW (0x43); -1 = sempre por cima, -2 = normal
  const out = await run(ENUM(pid, `
      $r = New-Object LfPrime.W+RECT; [void][LfPrime.W]::GetWindowRect($h, [ref]$r)
      if ([LfPrime.W]::IsWindowVisible($h) -and -not [LfPrime.W]::IsIconic($h) -and $r.Left -gt -10000 -and $r.Top -gt -10000) {
        $ex = [LfPrime.W]::GetWindowLongPtr($h, -20).ToInt64()
        if (($ex -band 0x80) -ne 0) { [void][LfPrime.W]::ShowWindow($h, 0); [void][LfPrime.W]::SetWindowLongPtr($h, -20, [System.IntPtr]::new($ex -band (-bnot 0x80))); [void][LfPrime.W]::ShowWindow($h, 4) }
        [void][LfPrime.W]::SetWindowPos($h, [System.IntPtr]::new(-1), 0, 0, 0, 0, 0x43)
        [void][LfPrime.W]::SetWindowPos($h, [System.IntPtr]::new(-2), 0, 0, 0, 0, 0x43)
        [void][LfPrime.W]::BringWindowToTop($h)
        [void][LfPrime.W]::SetForegroundWindow($h)
        $found.Add($h.ToInt64().ToString())
      }`));
  return ids(out).length;
}

/** Todas as janelas do processo, visíveis ou não */
async function find(pid) {
  if (process.platform !== 'win32' || !pid) return [];
  return ids(await run(ENUM(pid, '$found.Add($h.ToInt64().ToString())')));
}

/** Mostra as janelas e as traz para a frente (por cima do app, mesmo vindo de outro processo) */
async function show(handles) {
  if (process.platform !== 'win32' || !handles || !handles.length) return false;
  const list = handles.filter((x) => /^\d+$/.test(String(x))).join(',');
  if (!list) return false;
  // SW_RESTORE (9); por um instante "sempre por cima" (-1) e de volta ao normal (-2): sobe sem roubar o foco à força
  const out = await run(`${TYPES}
$ok = 0
foreach ($x in @(${list})) {
  $h = [System.IntPtr]::new([long]$x)
  if (-not [LfPrime.W]::IsWindow($h)) { continue }
  [void][LfPrime.W]::ShowWindow($h, 9)
  [void][LfPrime.W]::SetWindowPos($h, [System.IntPtr]::new(-1), 0, 0, 0, 0, 0x0043)
  [void][LfPrime.W]::SetWindowPos($h, [System.IntPtr]::new(-2), 0, 0, 0, 0, 0x0043)
  [void][LfPrime.W]::SetForegroundWindow($h)
  $ok++
}
"ok:$ok"`);
  const m = String(out || '').match(/ok:(\d+)/);
  return !!(m && Number(m[1]) > 0);
}

/** Confere se um PID é mesmo um navegador (antes de encerrar um processo antigo) */
function imageName(pid) {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') { resolve(null); return; }
    execFile('tasklist', ['/FI', `PID eq ${Number(pid)}`, '/NH', '/FO', 'CSV'], { windowsHide: true, timeout: 5000 }, (err, out) => {
      if (err) { resolve(null); return; }
      const m = String(out).match(/^"([^"]+)"/m);
      resolve(m ? m[1].toLowerCase() : '');
    });
  });
}

module.exports = { hide, show, find, park, front, imageName, _scripts: { ENUM, TYPES } };

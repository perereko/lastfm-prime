#!/usr/bin/env python3
"""Monta o Last.fm PRIME portátil: Electron + app dentro de um único .exe (lançador em Go).
Uso: python build/package.py win|linux

Precisa de: Node.js, Go 1.24+ e, para o .exe do Windows, llvm-rc e llvm-cvtres (ícone e versão do .exe).
O Electron é baixado sozinho das versões oficiais no GitHub na primeira vez (fica em .cache/electron)."""
import json, os, shutil, subprocess, sys, zipfile, stat, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EL = os.environ.get('ELECTRON_ZIPS', os.path.join(ROOT, '.cache', 'electron'))
VER_EL = 'v44.8.0'
target = sys.argv[1] if len(sys.argv) > 1 else 'win'
ver = json.load(open(f'{ROOT}/app/package.json'))['version']

def electron_zip(plat):
    """O zip oficial do Electron; baixa se ainda não estiver no cache."""
    name = f'electron-{VER_EL}-{plat}.zip'
    dest = os.path.join(EL, name)
    if not os.path.exists(dest):
        os.makedirs(EL, exist_ok=True)
        url = f'https://github.com/electron/electron/releases/download/{VER_EL}/{name}'
        print('baixando', url)
        urllib.request.urlretrieve(url, dest + '.part')
        os.replace(dest + '.part', dest)
    return dest

subprocess.run(['node', os.path.join(ROOT, 'build', 'sync-ext.js')], check=True)
stage = f'{ROOT}/build/stage-{target}'
shutil.rmtree(stage, ignore_errors=True)
with zipfile.ZipFile(electron_zip("win32-x64" if target == "win" else "linux-x64")) as z:
    z.extractall(stage)
    if target != 'win':
        for info in z.infolist():
            mode = (info.external_attr >> 16) & 0o777
            if mode:
                os.chmod(os.path.join(stage, info.filename), mode)
# sem o app padrão do Electron
for f in ('resources/default_app.asar',):
    p = os.path.join(stage, f)
    if os.path.exists(p): os.remove(p)
# só os idiomas usados (português e inglês)
loc = os.path.join(stage, 'locales')
for f in os.listdir(loc):
    if f not in ('en-US.pak', 'pt-BR.pak'):
        os.remove(os.path.join(loc, f))
if target == 'win':
    os.rename(os.path.join(stage, 'electron.exe'), os.path.join(stage, 'Last.fm PRIME.exe'))
# o app
shutil.copytree(f'{ROOT}/app', os.path.join(stage, 'resources', 'app'), ignore=shutil.ignore_patterns('dados-dev', '*.map', 'icon-1024.png'))
# o ajudante das janelas do player (tira as janelas da barra de tarefas), só no Windows
if target == 'win':
    helper_out = os.path.join(stage, 'resources', 'app', 'bin', 'lfprime-janelas.exe')
    os.makedirs(os.path.dirname(helper_out), exist_ok=True)
    subprocess.run(['go', 'build', '-trimpath', '-ldflags', '-H windowsgui -s -w', '-o', helper_out, '.'], check=True, cwd=f'{ROOT}/helper',
                   env=dict(os.environ, CGO_ENABLED='0', GOFLAGS='-mod=mod', GOPROXY='off', GOOS='windows', GOARCH='amd64'))
    print('ajudante', round(os.path.getsize(helper_out) / 1e6, 1), 'MB')

# pacote embutido
payload = f'{ROOT}/launcher/payload.zip'
if os.path.exists(payload): os.remove(payload)
with zipfile.ZipFile(payload, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for base, dirs, files in os.walk(stage):
        dirs.sort()
        for fn in sorted(files):
            full = os.path.join(base, fn)
            rel = os.path.relpath(full, stage).replace(os.sep, '/')
            zi = zipfile.ZipInfo.from_file(full, rel)
            zi.compress_type = zipfile.ZIP_DEFLATED
            with open(full, 'rb') as fh:
                z.writestr(zi, fh.read(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
print('payload', round(os.path.getsize(payload) / 1e6, 1), 'MB')

env = dict(os.environ, CGO_ENABLED='0', GOFLAGS='-mod=mod', GOPROXY='off')
os.makedirs(f'{ROOT}/dist', exist_ok=True)
syso = f'{ROOT}/launcher/rsrc_windows_amd64.syso'
if target == 'win':
    shutil.copy(f'{ROOT}/app/assets/icon.ico', f'{ROOT}/launcher/icon.ico')
    vc = ','.join((ver.split('.') + ['0', '0', '0'])[:4])
    rc = open(f'{ROOT}/launcher/launcher.rc.in').read().replace('VER_COMMA', vc).replace('VER_STR', f'"{ver}"')
    rc = '\n'.join(l for l in rc.splitlines() if not l.startswith('#define'))
    open(f'{ROOT}/launcher/launcher.rc', 'w').write(rc)
    subprocess.run(['llvm-rc', '-no-preprocess', '/FO', f'{ROOT}/launcher/launcher.res', f'{ROOT}/launcher/launcher.rc'], check=True, cwd=f'{ROOT}/launcher')
    subprocess.run(['llvm-cvtres', '/MACHINE:X64', f'/OUT:{syso}', f'{ROOT}/launcher/launcher.res'], check=True)
    out = f'{ROOT}/dist/Last.fm PRIME.exe'
    subprocess.run(['go', 'build', '-trimpath', '-ldflags', '-H windowsgui -s -w', '-o', out, '.'], check=True, cwd=f'{ROOT}/launcher', env=dict(env, GOOS='windows', GOARCH='amd64'))
else:
    if os.path.exists(syso): os.remove(syso)
    out = f'{ROOT}/dist/lastfm-prime-linux-teste'
    subprocess.run(['go', 'build', '-trimpath', '-ldflags', '-s -w', '-o', out, '.'], check=True, cwd=f'{ROOT}/launcher', env=dict(env, GOOS='linux', GOARCH='amd64'))
print('saída', out, round(os.path.getsize(out) / 1e6, 1), 'MB')

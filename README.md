# Last.fm PRIME

App para Windows que junta o **Last.fm** (com um tema próprio, preto e moderno) e os seus players de música — Spotify, YouTube Music, Deezer, SoundCloud, Apple Music e Tidal — num lugar só, com scrobbles, recomendações, aba social, agenda de shows e bloqueio de anúncios.

by Perereko · versão do app **3.11.0** · extensão Last.fm Hub **2.17.0**

## Como o projeto é dividido

| Pasta | O que é | Tecnologia |
|---|---|---|
| [`extension/`](extension) | **Last.fm Hub**: a extensão que redesenha o Last.fm e traz as abas extras (Catálogo, Premium, Amigos, Doppelgänger, Shows, Dê um match). Funciona sozinha no Chrome/Edge/Brave/Opera e também vai dentro do app. | JavaScript (Manifest V3) |
| [`app/`](app) | **O app Last.fm PRIME**: janela do Last.fm, painel dos players, barra do que está tocando, scrobbler, configurações. | Electron 44 + Node.js |
| [`app/lib/`](app/lib) | Módulos do app: player do Spotify (API e Edge), players nativos, scrobbler do Last.fm, bloqueio de anúncios, etc. | Node.js |
| [`app/ui/`](app/ui) | Interface do app (barra de cima, painel, configurações, abertura animada). | HTML/CSS/JS |
| [`app/extensions/`](app/extensions) | Extensões de terceiros que vão junto com o app (Web Scrobbler e uBlock Origin Lite). | — |
| [`launcher/`](launcher) | Lançador: o `.exe` único e portátil que carrega o app dentro de si. | Go |
| [`helper/`](helper) | Ajudante do Windows que tira da barra de tarefas as janelas escondidas do player do Edge. | Go |
| [`build/`](build) | Scripts de montagem (copiar a extensão para o app, gerar o ícone, empacotar o `.exe`). | Python / Node.js |
| [`test/`](test) | Testes automáticos com servidores simulados do Last.fm e do Spotify. | Node.js + Playwright |

### Módulos do app (`app/lib/`)

- `spotify.js` — API do Spotify (login, player, playlists).
- `webplayer.js` / `winhide.js` / `winhelper.js` — player do Spotify/Apple Music/Tidal num Edge escondido, mostrado no painel do app.
- `native.js` / `bridge-media.js` — YouTube Music, Deezer e SoundCloud tocando direto dentro do app.
- `scrobbler.js` / `lastfm.js` — scrobbles e curtidas no Last.fm.
- `adblock.js` — bloqueio de anúncios com as listas do uBlock Origin Lite.
- `match.js`, `color.js`, `store.js`, `platforms.js`, `cdp.js`, `bridge.js` — busca de músicas entre serviços, cores das capas, configurações, lista de plataformas e comunicação com o Edge.

## Rodando em desenvolvimento

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install          # instala o Electron e o Playwright (só para desenvolvimento)
npm start            # copia a extensão para o app e abre o Last.fm PRIME
```

Para testar só a extensão no navegador: abra `chrome://extensions`, ative o **Modo do desenvolvedor**, clique em **Carregar sem compactação** e escolha a pasta `extension/`.

## Testes

```bash
npx playwright install chromium   # uma vez só
npm test              # teste principal do app
npm run test:app      # app, painel, player do Edge, Web Scrobbler e bloqueio de anúncios
npm run test:abas     # Dê um match, Amigos, Doppelgänger e Shows
npm run test:extensao # extensão Last.fm Hub
```

No Linux sem tela, rode com `xvfb-run -a npm test`. Variáveis opcionais: `ELECTRON_BIN` (outro executável do Electron) e `LFS_EXT_DIR` (outra pasta da extensão).

## Gerando o `.exe`

Precisa de Node.js, Python 3, [Go](https://go.dev) 1.24+ e, para o ícone e a versão do `.exe`, `llvm-rc` e `llvm-cvtres` (vêm com o [LLVM](https://llvm.org)).

```bash
npm run build:win     # gera dist/Last.fm PRIME.exe
```

O Electron é baixado sozinho na primeira vez (fica em `.cache/electron`). O resultado é um único `.exe` portátil: na primeira vez ele extrai o app numa pasta de cache, e os logins e configurações ficam em "Last.fm PRIME - dados", ao lado do `.exe`.

## Componentes de terceiros

Veja [THIRD_PARTY.md](THIRD_PARTY.md).

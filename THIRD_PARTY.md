# Componentes de terceiros

| Componente | Onde | Versão | Licença |
|---|---|---|---|
| [uBlock Origin Lite](https://github.com/uBlockOrigin/uBOL-home) (Raymond Hill e colaboradores) | `app/extensions/ubol/` | 2026.1006.1931 | GPL-3.0 — veja `app/extensions/ubol/LICENSE.txt` |
| [Web Scrobbler](https://github.com/web-scrobbler/web-scrobbler) | `app/extensions/web-scrobbler/` | 3.23.1 | MIT — veja `app/extensions/web-scrobbler/NOTICE.txt` |
| [Leaflet](https://leafletjs.com) | `extension/vendor/` | 1.9.4 | BSD-2-Clause — veja `extension/vendor/LEAFLET-LICENSE.txt` |
| [Public Suffix List](https://publicsuffix.org) (Mozilla) | `app/lib/public_suffix_list.dat` | — | MPL-2.0 |
| [Electron](https://www.electronjs.org) | baixado no build | 44.8.0 | MIT |

Mudanças feitas no uBlock Origin Lite: só a chave `key` no `manifest.json` (para o app reconhecer a extensão pelo mesmo id) e as listas "AdGuard Spanish/Portuguese" e "AdGuard URL Tracking Protection" ligadas por padrão em `rulesets/ruleset-details.json`.

Os mapas da aba Shows usam blocos do [CARTO](https://carto.com) com dados do [OpenStreetMap](https://www.openstreetmap.org/copyright), e a localização das casas de show vem do Nominatim (OpenStreetMap).

`test/fixtures/lastfm/` tem cópias de páginas e do CSS do site do Last.fm, usadas só pelos testes automáticos.

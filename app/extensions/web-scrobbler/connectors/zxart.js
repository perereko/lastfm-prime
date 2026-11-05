"use strict";
(() => {
  // src/connectors/zxart.ts
  Connector.playerSelector = "zx-player .player-bar";
  Connector.pauseButtonSelector = [
    `${Connector.playerSelector} button[aria-label="\u041F\u0430\u0443\u0437\u0430"]`,
    `${Connector.playerSelector} button[aria-label="Pause"]`,
    `${Connector.playerSelector} button[aria-label="Pausa"]`
  ];
  Connector.artistTrackSelector = `${Connector.playerSelector} .player-progress-text`;
})();

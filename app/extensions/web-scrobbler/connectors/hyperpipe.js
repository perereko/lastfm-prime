"use strict";
(() => {
  // src/connectors/hyperpipe.ts
  Connector.useMediaSessionApi();
  Connector.playButtonSelector = "#btn-play-pause.bi-play";
  Connector.playerSelector = "#statusbar";
  Connector.currentTimeSelector = ".statusbar-progress-container > :first-child";
  Connector.durationSelector = ".statusbar-progress-container > :last-child";
})();

"use strict";
(() => {
  // src/connectors/byte.fm.ts
  Connector.playerSelector = ".player";
  Connector.artistTrackSelector = ".player-current-title";
  Connector.isPlaying = () => Util.getTextFromSelectors(".player-play-button>span") !== "play";
  Connector.onReady = Connector.onStateChanged;
})();

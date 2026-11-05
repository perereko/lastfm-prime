"use strict";
(() => {
  // src/connectors/chillhop-radio.ts
  Connector.playerSelector = "#player";
  Connector.artistSelector = ".p-track-artist";
  Connector.trackSelector = ".p-track-title";
  Connector.isPlaying = () => Util.hasElementClass("#player", "playing");
})();

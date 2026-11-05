"use strict";
(() => {
  // src/connectors/kosmik-dstroyer.ts
  Connector.playerSelector = "#now-playing";
  Connector.artistSelector = "#track-artist";
  Connector.trackSelector = "#track-title";
  Connector.trackArtSelector = "#cover-art";
  Connector.isPlaying = () => Util.getTextFromSelectors("#play-pause-button") === "[ PAUSE ]";
})();

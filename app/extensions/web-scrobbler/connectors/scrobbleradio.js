"use strict";
(() => {
  // src/connectors/scrobbleradio.ts
  Connector.playerSelector = "#player";
  Connector.trackSelector = "#title";
  Connector.artistSelector = "#artist";
  Connector.albumSelector = "#album";
  Connector.isPlaying = () => Util.hasElementClass("#metadata", "playing");
})();

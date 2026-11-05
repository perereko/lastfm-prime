"use strict";
(() => {
  // src/connectors/leanplayer.ts
  Connector.playerSelector = ".mediaplayer";
  Connector.pauseButtonSelector = ".btn-stop";
  Connector.trackSelector = "#track-info-artist";
  Connector.artistSelector = "#track-info-title";
  Connector.trackArtSelector = "#album-art";
  Connector.isTrackArtDefault = (trackArtUrl) => !(trackArtUrl?.includes("albumart.leanplayer.com") ?? false);
})();

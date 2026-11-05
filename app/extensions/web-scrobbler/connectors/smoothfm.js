"use strict";
(() => {
  // src/connectors/smoothfm.ts
  Connector.playerSelector = ".nowplaying";
  Connector.artistSelector = "#playerArtistName";
  Connector.trackSelector = "#playerSongName";
  Connector.isPlaying = () => Util.hasElementClass(".player-play", "hidden");
})();

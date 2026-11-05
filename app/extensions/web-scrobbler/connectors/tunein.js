"use strict";
(() => {
  // src/connectors/tunein.ts
  var STATIONS_SWAP = ["Cat-Country-987", "885-FM-So-Cal"];
  var playerBar = "[class^=player-module__playerContainer]";
  var artistTrackSelector = "#playerTitle";
  var stationNameSelector = "[class^=nowPlaying-module__link]";
  Connector.playerSelector = playerBar;
  Connector.getArtistTrack = () => {
    const artistTrackText = Util.getTextFromSelectors(artistTrackSelector);
    if (artistTrackText) {
      const swap = shouldSwapArtistTrack();
      return Util.splitArtistTrack(artistTrackText, null, swap);
    }
    return null;
  };
  Connector.trackArtSelector = "#playerArtwork";
  Connector.pauseButtonSelector = `${playerBar} [data-icon=stop]`;
  function shouldSwapArtistTrack() {
    const stationUrl = Util.getAttrFromSelectors(stationNameSelector, "href");
    if (!stationUrl) {
      return false;
    }
    for (const station of STATIONS_SWAP) {
      if (stationUrl.includes(station)) {
        return true;
      }
    }
    return false;
  }
})();

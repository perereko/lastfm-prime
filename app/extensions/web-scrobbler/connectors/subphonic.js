"use strict";
(() => {
  // src/connectors/subphonic.ts
  Connector.playerSelector = "#playdeck";
  Connector.getArtist = () => {
    return Util.getTextFromSelectors("#songdetails_artist")?.split(" - ")[0];
  };
  Connector.trackSelector = "#songdetails_song";
  Connector.isPlaying = () => !document.querySelector("#playdeck audio").paused;
  Connector.getAlbum = () => {
    return Util.getTextFromSelectors("#songdetails_artist")?.split(" - ")[1];
  };
  Connector.trackArtSelector = "#coverartimage img";
  Connector.currentTimeSelector = "#played";
  Connector.durationSelector = "#duration";
})();

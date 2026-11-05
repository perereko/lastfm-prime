"use strict";
(() => {
  // src/connectors/instantaudio.ts
  Connector.playerSelector = "#radio";
  Connector.artistSelector = ".playlist__artist-name";
  Connector.trackSelector = ".playlist__song-name";
  Connector.trackArtSelector = ".playlist__img";
  Connector.pauseButtonSelector = ".btn-play #radio-button.stop";
  Connector.playButtonSelector = ".btn-play #radio-button.play";
  Connector.getTrack = () => {
    return Util.getTextFromSelectors(Connector.trackSelector)?.replace(
      / §\d+$/,
      // https://regex101.com/r/MIJclS/1
      ""
    );
  };
})();

"use strict";
(() => {
  // src/connectors/ultraproduction.ts
  Connector.playerSelector = ".player__container";
  Connector.trackArtSelector = ".player__play";
  Connector.artistSelector = ".player__current .player__artist";
  Connector.trackSelector = ".player__current .player__song";
  Connector.pauseButtonSelector = ".player__play.player__play_pause";
  Connector.scrobblingDisallowedReason = () => {
    const station = document.querySelector(
      ".player__current .player__radio"
    )?.textContent;
    if (station) {
      Connector.meta.label = station;
    }
    const lowerStation = station?.toLowerCase().trim();
    if (lowerStation === Connector.getTrack()?.toLowerCase().trim() || lowerStation === Connector.getArtist()?.toLowerCase().trim()) {
      return "FilteredTag";
    }
    return null;
  };
})();

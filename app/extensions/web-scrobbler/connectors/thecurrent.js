"use strict";
(() => {
  // src/connectors/thecurrent.ts
  var filter = MetadataFilter.createFilter({
    track: cleanupTrack,
    artist: cleanupArtist
  });
  Connector.playerSelector = "aside#player";
  Connector.trackSelector = "aside#player .player-title";
  Connector.artistSelector = "aside#player .player-title";
  Connector.isPlaying = () => Util.hasElementClass(".player-btn-play-pause-outer", "is-playing");
  Connector.onReady = Connector.onStateChanged;
  Connector.applyFilter(filter);
  function cleanupTrack(track) {
    return track.replace(/^(.*?)\s(by)\s(.*?)$/i, "$1");
  }
  function cleanupArtist(artist) {
    return artist.replace(/^(.*?)\s(by)\s(.*?)$/i, "$3");
  }
})();

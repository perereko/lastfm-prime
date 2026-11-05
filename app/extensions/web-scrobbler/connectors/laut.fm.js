"use strict";
(() => {
  // src/connectors/laut.fm.ts
  Connector.playerSelector = ".fm-player";
  Connector.artistSelector = ".player-display__meta .player-display__meta--artist";
  Connector.trackSelector = ".player-display__meta .player-display__meta--title";
  Connector.pauseButtonSelector = ".fm-player__btn .btn--icon-playing";
  function removeEnclosingQuotes(track) {
    return track.trim().slice(1, -1);
  }
  var filter = MetadataFilter.createFilter({ track: removeEnclosingQuotes });
  Connector.applyFilter(filter);
})();

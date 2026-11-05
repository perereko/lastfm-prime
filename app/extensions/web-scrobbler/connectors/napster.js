"use strict";
(() => {
  // src/connectors/napster.ts
  Connector.playerSelector = "#player";
  Connector.trackSelector = "#player .player-track";
  Connector.artistSelector = "#player .player-artist";
  Connector.albumSelector = "#player .player-play-container";
  Connector.playButtonSelector = "#player .icon-play-button";
  var filter = MetadataFilter.createFilter({
    // Remove the dash in front of the artist name
    artist: (text) => text.replace(/- /, "")
  });
  Connector.applyFilter(filter);
})();

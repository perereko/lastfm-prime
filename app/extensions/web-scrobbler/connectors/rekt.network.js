"use strict";
(() => {
  // src/connectors/rekt.network.ts
  Connector.playerSelector = "body";
  Connector.artistTrackSelector = "#nowplaying";
  Connector.playButtonSelector = "#playerPlay";
  var filter = MetadataFilter.createFilter({
    artist: onlyArtist
  });
  Connector.applyFilter(filter);
  function onlyArtist(artist) {
    const chunks = artist.split("\n");
    return chunks[chunks.length - 1];
  }
})();

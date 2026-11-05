"use strict";
(() => {
  // src/connectors/lounge.fm.ts
  Connector.playerSelector = "#player";
  Connector.artistSelector = "#artist";
  Connector.trackSelector = "#title";
  Connector.trackArtSelector = "#imgCover";
  Connector.albumSelector = "#album";
  Connector.isPlaying = () => Util.hasElementClass("#player", "playing");
  var filter = MetadataFilter.createFilter({
    artist: removeVonPrefix,
    album: removeAlbumPrefix
  });
  Connector.applyFilter(filter);
  function removeVonPrefix(text) {
    return text.replace("von ", "");
  }
  function removeAlbumPrefix(text) {
    return text.replace(", Album: ", "");
  }
})();

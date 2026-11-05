"use strict";
(() => {
  // src/connectors/fritz.ts
  Connector.playerSelector = "#main";
  Connector.artistSelector = ".artist";
  Connector.trackSelector = ".songtitle";
  Connector.pauseButtonSelector = ".audioplayer-playing";
  var filter = MetadataFilter.createFilter({
    artist: (artist) => {
      const updatedArtist = artist.replace(".feat", ";");
      if (updatedArtist.includes(";")) {
        return updatedArtist.split(";")[0].trim();
      }
      return updatedArtist.trim();
    }
  });
  Connector.applyFilter(filter);
})();

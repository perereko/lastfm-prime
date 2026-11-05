"use strict";
(() => {
  // src/connectors/cytu-be.ts
  function removeCurrentlyPlaying(text) {
    return text.replace(/^Currently\s*Playing:\s*/i, "");
  }
  var filter = MetadataFilter.createFilter({
    artist: removeCurrentlyPlaying,
    track: removeCurrentlyPlaying
  });
  Connector.playerSelector = "#videowrap";
  Connector.artistTrackSelector = "#currenttitle";
  Connector.applyFilter(filter);
})();

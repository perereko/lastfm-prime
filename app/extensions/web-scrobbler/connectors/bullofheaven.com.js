"use strict";
(() => {
  // src/connectors/bullofheaven.com.ts
  var artistName = "Bull of Heaven";
  var trackPrefixRegex = /\d+ - /;
  var filter = MetadataFilter.createFilter({ track: removeNumericPrefixes });
  Connector.applyFilter(filter);
  function removeNumericPrefixes(track) {
    return track.replace(trackPrefixRegex, "");
  }
  Connector.playerSelector = "#jp_container_N";
  Connector.getArtist = () => artistName;
  Connector.trackSelector = ".jp-playlist-current .playlist-title";
  Connector.trackArtSelector = "#jp_poster_0";
  Connector.currentTimeSelector = ".jp-current-time";
  Connector.durationSelector = ".jp-duration";
  Connector.playButtonSelector = ".jp-play";
})();

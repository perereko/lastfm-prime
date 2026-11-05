"use strict";
(() => {
  // src/connectors/technobase.fm.ts
  var filter = MetadataFilter.createFilter({
    track: replaceWith
  });
  Connector.applyFilter(filter);
  Connector.isPlaying = () => Util.hasElementClass(".streamplayer-button", "playing");
  Connector.playerSelector = ".stream-wrapper";
  Connector.artistSelector = ".streamplayer-artist .streamplayer-link";
  Connector.trackSelector = ".streamplayer-title .streamplayer-link";
  function replaceWith(text) {
    return text.replace(/\swith\s/, " & ");
  }
})();

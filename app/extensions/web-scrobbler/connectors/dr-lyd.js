"use strict";
(() => {
  // src/connectors/dr-lyd.ts
  Connector.playerSelector = "[class^=Player_PlayerBar_bar]";
  Connector.playButtonSelector = 'button[title="Afspil"]';
  Connector.artistSelector = "[class^=MusicArtistRole_role]";
  var filter = MetadataFilter.createFilter({
    track: cleanupTrack
  });
  Connector.trackSelector = "[class^=MusicTrackLine_title]";
  Connector.applyFilter(filter);
  function cleanupTrack(text) {
    return text.replace("\u201C", "").replace("\u201D", "");
  }
})();

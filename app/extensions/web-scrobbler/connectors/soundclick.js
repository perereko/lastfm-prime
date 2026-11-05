"use strict";
(() => {
  // src/connectors/soundclick.ts
  var filter = MetadataFilter.createFilter({
    track: cleanupTrack
  });
  Connector.playerSelector = "#playerWrap";
  Connector.artistSelector = "#playerSCLK_artistName";
  Connector.trackSelector = ".songActive .playlist-songtitle";
  Connector.applyFilter(filter);
  function cleanupTrack(text) {
    const artist = Connector.getArtist() ?? "";
    return text.substr((text.match(artist)?.index ?? 0) + artist.length + 3).replace(/^\*[^*]+\*/, "").replace(/([(*]|- )?buy \d+ get \d+ .*$/i, "");
  }
  Connector.playButtonSelector = "#btnPlay";
  Connector.currentTimeSelector = "#currentTime";
  Connector.durationSelector = "#totalTime";
  Connector.trackArtSelector = "#playerSCLK_songPicture";
  Connector.isTrackArtDefault = (trackArtUrl) => {
    return Boolean(trackArtUrl?.includes("/images/brand/logo_dark.svg"));
  };
  Connector.getUniqueID = () => {
    return Util.getAttrFromSelectors("#playerWrap", "data-songid");
  };
})();

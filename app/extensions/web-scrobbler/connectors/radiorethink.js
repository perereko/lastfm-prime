"use strict";
(() => {
  // src/connectors/radiorethink.ts
  var trackArtSelector = "#currentTracklookupImage";
  Connector.playerSelector = "body";
  Connector.pauseButtonSelector = ".bottom-bar .pause";
  Connector.artistSelector = "#currentTrackArtist";
  Connector.trackSelector = "#currentTrackTrack";
  Connector.albumSelector = "#currentTrackAlbum";
  Connector.getTrackArt = () => {
    const trackArtUrl = Util.extractImageUrlFromSelectors(trackArtSelector);
    return trackArtUrl && trackArtUrl.replace(/\._SL\d+_/, "");
  };
  Connector.isTrackArtDefault = (url) => url?.includes("placeHolderCovers");
})();

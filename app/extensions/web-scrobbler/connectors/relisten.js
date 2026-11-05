"use strict";
(() => {
  // src/connectors/relisten.ts
  var ARTISTALBUM_SEPARATOR = "\u2013";
  var artistAlbumSelector = ".player .content .info .band-title";
  Connector.currentTimeSelector = ".player div.timing:not(.duration) div:last-child";
  Connector.durationSelector = ".player div.timing.duration div:last-child";
  Connector.playerSelector = ".navigation > .player";
  Connector.trackSelector = ".player .content .info .song-title";
  Connector.getTrackInfo = () => {
    const artistAlbum = Util.getTextFromSelectors(artistAlbumSelector);
    return Util.splitArtistAlbum(artistAlbum, [ARTISTALBUM_SEPARATOR]);
  };
  Connector.isPlaying = () => {
    return Boolean(document.querySelector(".playpause .fas.fa-pause"));
  };
})();

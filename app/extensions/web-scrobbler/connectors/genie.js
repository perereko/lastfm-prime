"use strict";
(() => {
  // src/connectors/genie.ts
  Connector.playerSelector = "#music-player";
  Connector.artistSelector = "#ArtistNameArea";
  Connector.trackSelector = "#SongTitleArea";
  Connector.getAlbum = () => {
    return Util.getAttrFromSelectors("#AlbumImgArea > img", "alt");
  };
  Connector.currentTimeSelector = "span.fp-elapsed";
  Connector.durationSelector = "span.fp-remaining";
  Connector.isPlaying = () => {
    const btn = document.querySelector(".fp-playbtn");
    return btn?.innerHTML === "\uC77C\uC2DC\uC815\uC9C0";
  };
  Connector.trackArtSelector = "#AlbumImgArea img";
})();

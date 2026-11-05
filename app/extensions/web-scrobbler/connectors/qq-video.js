"use strict";
(() => {
  // src/connectors/qq-video.ts
  var artistTrackRe = /(.+?)《(.+?)》/;
  function setupCoverPlayer() {
    Connector.getArtistTrack = () => {
      const text = Util.getAttrFromSelectors(
        ".video_title ._base_title",
        "title"
      );
      return extractArtistTrack(text);
    };
  }
  function setupPagePlayer() {
    Connector.getArtistTrack = () => {
      const text = Util.getAttrFromSelectors(".video_title", "title");
      return extractArtistTrack(text);
    };
  }
  function isCoverPlayer() {
    return window.location.href.includes("x/cover/");
  }
  function isPagePlayer() {
    return window.location.href.includes("x/page/");
  }
  function extractArtistTrack(artistTrackStr) {
    if (!artistTrackStr) {
      return null;
    }
    const match = artistTrackStr.match(artistTrackRe);
    if (match) {
      return { artist: match[1], track: match[2] };
    }
    return null;
  }
  function setupConnector() {
    Connector.playerSelector = ".container_player";
    if (isCoverPlayer()) {
      setupCoverPlayer();
    } else if (isPagePlayer()) {
      setupPagePlayer();
    } else {
      Util.debugLog("Unknown player", "warn");
    }
  }
  setupConnector();
})();

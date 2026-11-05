"use strict";
(() => {
  // src/connectors/youtube-embed.ts
  var VIDEO_SELECTOR = ".html5-main-video";
  function getVideoUrl() {
    return Util.getAttrFromSelectors(".ytp-title-link", "href");
  }
  function getVideoId() {
    const videoUrl = getVideoUrl();
    return Util.getYtVideoIdFromUrl(videoUrl);
  }
  function setupConnector() {
    const videoElement = document.querySelector(
      VIDEO_SELECTOR
    );
    if (!videoElement) {
      return;
    }
    videoElement.addEventListener("timeupdate", Connector.onStateChanged);
    Connector.getArtistTrack = () => {
      const videoTitle = Util.getTextFromSelectors(".ytp-title-link");
      return Util.processYtVideoTitle(videoTitle);
    };
    Connector.getCurrentTime = () => videoElement.currentTime;
    Connector.getDuration = () => videoElement.duration;
    Connector.isPlaying = () => {
      return Util.hasElementClass(".html5-video-player", "playing-mode");
    };
    Connector.getOriginUrl = () => {
      const videoId = getVideoId();
      return `https://youtu.be/${videoId}`;
    };
    Connector.getUniqueID = () => {
      return getVideoId();
    };
    Connector.applyFilter(MetadataFilter.createYouTubeFilter());
  }
  setupConnector();
})();

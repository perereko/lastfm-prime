"use strict";
(() => {
  // src/connectors/nicovideo.ts
  var filter = MetadataFilter.createFilter({
    track: removeDecorationText,
    artist: selectPrimaryName
  });
  var videoSelector = ".PlayerPresenter video";
  Connector.playerSelector = ".PlayerPresenter > :nth-child(1)";
  Connector.artistSelector = ".w_\\[var\\(\\-\\-watch\\-owner\\-information\\-width\\)\\] > :nth-child(2)";
  Connector.trackSelector = ".grid-area_\\[bottom\\] .fs_xl";
  Connector.durationSelector = ".max-h_watchcontroller\\.height .ff_metanumber > :nth-child(3)";
  Connector.currentTimeSelector = ".max-h_watchController\\.height .ff_metaNumber > :nth-child(1)";
  Connector.isPlaying = () => {
    const video = document.querySelector(videoSelector);
    if (!video) {
      return false;
    }
    return video.currentTime > 0 && !video.paused && !video.ended;
  };
  Connector.getUniqueID = () => window.location.pathname.replace(/\/$/, "").replace(/.*\//, "");
  Connector.applyFilter(filter);
  function removeDecorationText(text) {
    const decorationPattern = /^【[^】]*】\s*|\s*【[^【]*】$|^\[[^\]]*\]\s*|\s*\[[^[]*\]$/g;
    const extraInfoPattern = /\s*(\/[^/]+|／[^／]+|[^\da-zA-Z]-[^\da-zA-Z][^-]+|\sfeat\..+|\sft\..+)$/i;
    const titlePattern = /「(.+)」|『(.+)』|'(.+)'|"(.+)"/;
    const match = text.match(titlePattern);
    if (match) {
      return match[1] || match[2] || match[3] || match[4];
    }
    return text.replace(decorationPattern, "").replace(extraInfoPattern, "");
  }
  function selectPrimaryName(text) {
    const nameWithoutSuffix = text.replace(/\sさん$/, "");
    const namePattern = /^(.+?)\s*([/／].+|\([^(]+\)$|（[^（]+）$)/;
    const match = nameWithoutSuffix.match(namePattern);
    if (match) {
      return match[1];
    }
    return nameWithoutSuffix;
  }
})();

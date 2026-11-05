"use strict";
(() => {
  // src/connectors/deezer.ts
  var deezerFilter = MetadataFilter.createRemasteredFilter();
  var trackInfo = {};
  var isPlaying = false;
  var isPodcast = false;
  Connector.isPlaying = () => isPlaying;
  Connector.isPodcast = () => isPodcast;
  Connector.getTrackInfo = () => trackInfo;
  Connector.applyFilter(deezerFilter);
  Connector.onScriptEvent = (event) => {
    switch (event.data.type) {
      case "DEEZER_STATE":
        ({ trackInfo, isPlaying, isPodcast } = event.data);
        Connector.onStateChanged();
        break;
      default:
        break;
    }
  };
  Connector.injectScript("connectors/deezer-dom-inject.js");
  Connector.useMediaSessionApi();
})();

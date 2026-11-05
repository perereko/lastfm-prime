"use strict";
(() => {
  // src/connectors/radio7.ts
  Connector.playerSelector = ".swiper-intro-inner";
  Connector.artistTrackSelector = "#dziesma";
  Connector.pauseButtonSelector = ".amazingaudioplayer-pause";
  Connector.scrobblingDisallowedReason = () => Connector.getArtist() === "Radio7" ? "FilteredTag" : null;
})();

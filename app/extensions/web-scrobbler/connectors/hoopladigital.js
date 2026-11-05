"use strict";
(() => {
  // src/connectors/hoopladigital.ts
  Connector.playerSelector = "#root";
  Connector.pauseButtonSelector = "button[aria-label=Pause]";
  Connector.trackSelector = ".text-current > p:first-of-type";
  Connector.artistSelector = ".text-current > p:nth-of-type(2)";
  Connector.albumSelector = "button.text-hoopla-blue-800 ~ div > a";
  Connector.getTrackArt = () => {
    const trackArtUrl = Util.extractImageUrlFromSelectors(
      "#expand-button ~ img"
    );
    if (trackArtUrl) {
      return trackArtUrl.replace(/(?<=_)\d{3}(?=\.jpeg)/, "916");
    }
    return null;
  };
  Connector.durationSelector = ".w-64 > span:last-of-type span";
  Connector.currentTimeSelector = ".w-64 > span:first-of-type span";
})();

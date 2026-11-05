"use strict";
(() => {
  // src/connectors/nowyswiat.ts
  Connector.playerSelector = "#player";
  Connector.trackSelector = "#neoplayer-title";
  Connector.artistSelector = "#neoplayer-subtitle";
  Connector.trackArtSelector = "#neoplayer-image";
  Connector.isPlaying = () => {
    const visibility = Util.getCSSPropertyFromSelectors(
      "#neoplayer-play",
      "visibility"
    );
    return visibility === "hidden";
  };
  Connector.isStateChangeAllowed = () => {
    const artist = Util.getTextFromSelectors("#neoplayer-subtitle");
    return artist !== "Radio Nowy \u015Awiat";
  };
  Connector.onReady = Connector.onStateChanged;
})();

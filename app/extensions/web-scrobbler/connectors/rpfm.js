"use strict";
(() => {
  // src/connectors/rpfm.ts
  var props = {
    trackSelector: ".radio-current-track",
    artistSelector: ".radio-current-artist",
    trackArtSelector: ".radio-current-cover",
    durationSelector: ".track-time-duration",
    currentTimeSelector: ".track-time-position"
  };
  Connector.playerSelector = ".app-player";
  for (const prop in props) {
    const selector = props[prop];
    Object.defineProperty(Connector, prop, {
      get: () => `${getCurrentContext()} ${selector}`
    });
  }
  Connector.isTrackArtDefault = (url) => url?.includes("no-cover");
  Connector.isPlaying = () => Util.getDataFromSelectors(".app-player", "status") === "play";
  Connector.isStateChangeAllowed = () => {
    const artist = Connector.getArtist();
    return artist !== null && artist !== "\u0420\u0435\u043A\u043B\u0430\u043C\u0430";
  };
  function getCurrentContext() {
    const single = Util.hasElementClass(
      Connector.playerSelector,
      "single-player"
    );
    return single ? ".app-player-panel" : "#broadcast-panel";
  }
})();

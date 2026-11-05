"use strict";
(() => {
  // src/connectors/echo.ts
  var trackInfo;
  var queryPlayerElement = () => document.querySelector("app-root")?.shadowRoot?.querySelector("app-header")?.shadowRoot?.querySelector("echo-player");
  Connector.getTrackInfo = () => trackInfo;
  Connector.isPlaying = () => !!trackInfo;
  var startObserving = (player) => {
    player.addEventListener("track-playing", (event) => {
      const customEvent = event;
      const providerId = customEvent.detail.providerId;
      if (providerId === "spotify") {
        trackInfo = void 0;
      } else {
        trackInfo = {
          track: customEvent.detail.trackName,
          artist: customEvent.detail.artistName,
          album: customEvent.detail.albumName
        };
      }
      Connector.onStateChanged();
    });
    player.addEventListener("track-paused", () => {
      trackInfo = void 0;
      Connector.onStateChanged();
    });
  };
  var timer = setInterval(() => {
    const player = queryPlayerElement();
    if (player) {
      startObserving(player);
      clearInterval(timer);
    }
  }, 2e3);
})();

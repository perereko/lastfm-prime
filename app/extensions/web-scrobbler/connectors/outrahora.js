"use strict";
(() => {
  // src/connectors/outrahora.ts
  var isEmbedBar = window.location.hostname !== "radio.outrahora.com";
  if (isEmbedBar) {
    Connector.playerSelector = "#outrahora-radio-widget";
    Connector.useTabAudibleApi();
  } else {
    Connector.playerSelector = "#playerView";
    Util.bindListeners(
      ["audio"],
      ["playing", "pause", "waiting"],
      Connector.onStateChanged
    );
    Connector.isPlaying = () => !document.querySelector("audio")?.paused;
  }
  Connector.useMediaSessionApi();
})();

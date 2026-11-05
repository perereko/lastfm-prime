"use strict";
(() => {
  // src/connectors/coderadio.ts
  Connector.playerSelector = ".now-playing";
  Connector.artistSelector = '.now-playing div[data-meta="artist"]';
  Connector.trackSelector = '.now-playing div[data-meta="title"]';
  Connector.albumSelector = '.now-playing div[data-meta="album"]';
  Connector.isPlaying = () => Util.getAttrFromSelectors("#toggle-play-pause", "aria-label") !== "Play";
})();

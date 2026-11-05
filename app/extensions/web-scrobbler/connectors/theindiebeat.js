"use strict";
(() => {
  // src/connectors/theindiebeat.ts
  Connector.playerSelector = ".audio-player-container";
  Connector.artistSelector = "#artist a";
  Connector.trackSelector = "#title";
  Connector.albumSelector = "#album";
  var filter = MetadataFilter.createFilter({
    duration: cleanupDuration,
    currentTime: cleanupCurrentTime
  });
  Connector.durationSelector = "#playtime";
  Connector.applyFilter(filter);
  function cleanupDuration(text) {
    return text.split(" / ")?.[1];
  }
  Connector.currentTimeSelector = "#playtime";
  function cleanupCurrentTime(text) {
    return text.split(" / ")?.[0];
  }
  Connector.trackArtSelector = "#art";
  Connector.isPlaying = () => !document.querySelector("audio")?.paused;
})();

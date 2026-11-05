"use strict";
(() => {
  // src/connectors/radyoplyr.ts
  Connector.playerSelector = ".cstRadyoPlayer";
  Connector.artistTrackSelector = "#NowPlaying";
  Connector.isPlaying = () => Util.isElementVisible('.plyr__controls button[data-plyr="pause"]');
  var radioName = Util.getTextFromSelectors(".copyright")?.match(
    /Copyright ©\s*(.+?)\s*\d{4,}/
  )?.[1];
  if (radioName) {
    Connector.meta.label = radioName;
  }
})();

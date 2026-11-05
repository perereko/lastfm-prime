"use strict";
(() => {
  // src/connectors/jazzandrain.ts
  Connector.playerSelector = "#componentWrapper";
  Connector.artistTrackSelector = ".fontMeasure";
  Connector.isPlaying = () => {
    return Util.getAttrFromSelectors(".controls_toggle img", "src")?.includes(
      "pause"
    );
  };
})();

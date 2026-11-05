"use strict";
(() => {
  // src/connectors/wwoz.ts
  var wwozFilter = MetadataFilter.createFilter({
    track: (text) => MetadataFilter.filterWithFilterRules(text, wwozFilterRules)
  });
  var wwozFilterRules = [
    { source: /"(.+?)"/g, target: "$1" },
    { source: /\s*\[[^\]]+]$/, target: "" },
    { source: /\s*\([^)]*version\)$/i, target: "" }
  ];
  Connector.playerSelector = "#player";
  Connector.artistSelector = "#player .artist";
  Connector.trackSelector = "#player .title";
  Connector.isPlaying = () => Util.hasElementClass("#oz-audio-container", "jp-state-playing");
  Connector.applyFilter(wwozFilter);
})();

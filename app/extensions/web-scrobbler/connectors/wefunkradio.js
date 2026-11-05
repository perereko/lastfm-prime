"use strict";
(() => {
  // src/connectors/wefunkradio.ts
  var wefunkradioArtistFilterRules = [
    { source: /\s*talk \(over\s+(.+)$/i, target: "$1" }
  ];
  var wefunkradioTrackFilterRules = [
    { source: /\s*\((?:start|end|beginning) of [^)]+ set\)$/i, target: "" },
    { source: /^([^()]*)\)$/, target: "$1" }
  ];
  var wefunkradioFilter = MetadataFilter.createFilter({
    artist: (text) => MetadataFilter.filterWithFilterRules(
      text,
      wefunkradioArtistFilterRules
    ),
    track: (text) => MetadataFilter.filterWithFilterRules(text, wefunkradioTrackFilterRules)
  });
  Connector.playerSelector = ".player-control";
  Connector.artistTrackSelector = ".player-control-title";
  Connector.applyFilter(wefunkradioFilter);
  Connector.scrobblingDisallowedReason = () => {
    const filteredTerms = [/\([^)]*\bunknown\b[^)]*\)/i];
    const track = Connector.getArtistTrack();
    return filteredTerms.some((term) => track?.track?.match(term)) ? "FilteredTag" : null;
  };
})();

"use strict";
(() => {
  // src/connectors/dnalounge.ts
  Connector.useTabAudibleApi();
  Connector.getArtistTrack = () => {
    const artistTrack = Util.getTextFromSelectors("#metadata");
    if (!artistTrack) {
      return null;
    }
    return /^DNA Pizza Music Videos: (?<artist>.+) -- (?<track>.+) \(\d+\)(?:\s★)?$/g.exec(
      artistTrack
    )?.groups;
  };
})();

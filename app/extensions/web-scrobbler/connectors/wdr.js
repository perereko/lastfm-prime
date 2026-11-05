"use strict";
(() => {
  // src/connectors/wdr.ts
  var filter = MetadataFilter.createFilter({ artist: cleanupArtist });
  Connector.applyFilter(filter);
  Connector.playerSelector = ".wdrrCurrentChannels";
  Connector.artistTrackSelector = ".wdrrCurrentShowTitleTitle";
  Connector.pauseButtonSelector = "#playCtrl.playing";
  Connector.scrobblingDisallowedReason = () => {
    const artistTrack = Util.getTextFromSelectors(
      Connector.artistTrackSelector
    );
    const disallowedStrings = [
      "1Live",
      "WDR 2",
      "WDR 3",
      "WDR 4",
      "WDR 5",
      "COSMO"
    ];
    const containsDisallowedString = artistTrack !== null && disallowedStrings.some(
      (disallowedString) => artistTrack.includes(disallowedString)
    );
    return containsDisallowedString ? "FilteredTag" : null;
  };
  function cleanupArtist(artist) {
    const patterns = [/ & .*/, / x .*/, / feat\..*/];
    let cleanedArtist = artist;
    patterns.forEach((pattern) => {
      cleanedArtist = cleanedArtist.replace(pattern, "");
    });
    return cleanedArtist.trim();
  }
})();

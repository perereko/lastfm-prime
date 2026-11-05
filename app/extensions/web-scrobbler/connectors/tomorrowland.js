"use strict";
(() => {
  // src/connectors/tomorrowland.ts
  Connector.playerSelector = ".sidebar-player";
  Connector.getArtistTrack = () => Util.splitArtistTrack(
    Util.getTextFromSelectors(".meta-title"),
    [" \xB7"],
    true
  );
  Connector.pauseButtonSelector = "#Group-5";
})();

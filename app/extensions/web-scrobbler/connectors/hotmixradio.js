"use strict";
(() => {
  // src/connectors/hotmixradio.ts
  Connector.playerSelector = "#new_ajax-player";
  Connector.getArtist = () => getScrollableText("#hotmixPlayerSongArtist");
  Connector.getTrack = () => getScrollableText("#hotmixPlayerSongTitle");
  Connector.trackArtSelector = "#hotmixPlayerSongCover";
  Connector.pauseButtonSelector = "#play-pause .fa-pause";
  function getScrollableText(selector) {
    return Util.getTextFromSelectors(`${selector} a`) || Util.getTextFromSelectors(selector);
  }
})();

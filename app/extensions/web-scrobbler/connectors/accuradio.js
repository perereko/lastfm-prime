"use strict";
(() => {
  // src/connectors/accuradio.ts
  Connector.playerSelector = "#playerContents";
  Connector.artistSelector = "#songartist div:first-child, #songartist";
  Connector.getArtist = () => getScrollableText("#songartist");
  Connector.getTrack = () => getScrollableText("#songtitle");
  Connector.getAlbum = () => getScrollableText("#songalbum");
  Connector.trackArtSelector = "#albumArtImg";
  Connector.pauseButtonSelector = "#playerPauseButton";
  Connector.timeInfoSelector = "#progressWrapper";
  function getScrollableText(selector) {
    return Util.getTextFromSelectors(`${selector} div`) || Util.getTextFromSelectors(selector);
  }
})();

"use strict";
(() => {
  // src/connectors/radioplayer.ts
  var artistSelector = ".playing-now .pod-title";
  var trackSelector = ".playing-now .pod-desc";
  Connector.playerSelector = ".radioplayer-head";
  Connector.playButtonSelector = "#play";
  Connector.artistTrackSelector = [".song-text", ".scrolling-text"];
  Connector.getTrackInfo = () => {
    const frame = document.querySelector(
      "#radiofeed_iframe"
    );
    const radioFeedFrame = frame.contentWindow?.document || frame.contentDocument;
    if (!radioFeedFrame) {
      return null;
    }
    const artist = radioFeedFrame.querySelector(artistSelector)?.textContent;
    const track = radioFeedFrame.querySelector(trackSelector)?.textContent;
    return { artist, track };
  };
})();

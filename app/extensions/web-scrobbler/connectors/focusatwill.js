"use strict";
(() => {
  // src/connectors/focusatwill.ts
  var OBSERVER_THROTTLE_INTERVAL = 1e3;
  var filter = MetadataFilter.createFilter({ artist: removeByPrefix });
  var trackInfoSelector = "._2Os_QRvaRk-4LyqyE4fhsh";
  var trackInfoBtnSelector = "footer button";
  Connector.onReady = setupObserver;
  Connector.playerSelector = "#root";
  Connector.artistSelector = `${trackInfoSelector} > div:nth-child(2)`;
  Connector.trackSelector = `${trackInfoSelector} > div:nth-child(1)`;
  Connector.isPlaying = () => {
    return !Util.hasElementClass('[data-test-id="playButton"]', "undefined");
  };
  Connector.isStateChangeAllowed = () => {
    return Boolean(Connector.getArtist() && Connector.getTrack());
  };
  Connector.applyFilter(filter);
  function removeByPrefix(text) {
    return text.replace("By: ", "");
  }
  function setupObserver() {
    new MutationObserver(
      Util.throttle(() => {
        const trackInfoButton = document.querySelector(
          trackInfoBtnSelector
        );
        const isButtonActive = Util.getCSSPropertyFromSelectors(
          trackInfoBtnSelector,
          "opacity"
        ) === "1";
        if (isButtonActive) {
          trackInfoButton.click();
        }
      }, OBSERVER_THROTTLE_INTERVAL)
    ).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true
    });
  }
})();

"use strict";
(() => {
  // src/connectors/musicoin.ts
  Connector.getArtist = () => {
    return getIframeElement("#player-artist")?.textContent;
  };
  Connector.getTrack = () => {
    return getIframeElement("#player-title")?.textContent;
  };
  Connector.getDuration = () => {
    const duration = getIframeElement("#player-time-left")?.textContent;
    return Util.stringToSeconds(duration);
  };
  Connector.getCurrentTime = () => {
    const currentTime = getIframeElement("#player-time-played")?.textContent;
    return Util.stringToSeconds(currentTime);
  };
  Connector.isPlaying = () => {
    const playButton = getIframeElement("#player-play-button");
    if (!playButton) {
      return false;
    }
    return Util.getCSSProperty(playButton, "display") === "none";
  };
  Connector.getTrackArt = () => {
    const imageSrc = getIframeElement("#player-badge-image")?.getAttribute(
      "src"
    );
    const url = `${window.location.protocol}//${window.location.host}${imageSrc}`;
    return url;
  };
  Connector.getUniqueID = () => {
    const trackUrl = getIframeElement("#player")?.getAttribute("src");
    if (trackUrl) {
      return trackUrl.split("/").at(-1);
    }
    return null;
  };
  Connector.applyFilter(MetadataFilter.createRemasteredFilter());
  function getIframeElement(selector) {
    const frame = document.querySelector("#playerFrame");
    const content = frame.contentDocument || frame.contentWindow?.document;
    return content?.querySelector(selector);
  }
  function onPlayerLoaded() {
    Util.debugLog("Player loaded, setting up observer");
    const observer = new MutationObserver(Connector.onStateChanged);
    const observeTarget = document.querySelector("#playerFrame").contentDocument?.getElementById("player-section");
    const config = {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    };
    if (!observeTarget) {
      return;
    }
    observer.observe(observeTarget, config);
  }
  var timer = setInterval(() => {
    const iframe = document.getElementById("playerFrame");
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc?.readyState === "complete" || iframeDoc?.readyState === "interactive") {
      onPlayerLoaded();
      clearInterval(timer);
    }
  }, 2e3);
})();

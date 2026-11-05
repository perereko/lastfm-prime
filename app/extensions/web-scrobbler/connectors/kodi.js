"use strict";
(() => {
  // src/connectors/kodi.ts
  var fields = {
    artist: {
      selector: ".playing-subtitle",
      func: Util.getTextFromSelectors.bind(Util)
    },
    track: {
      selector: ".playing-title",
      func: Util.getTextFromSelectors.bind(Util)
    },
    currentTime: {
      selector: ".playing-time-current",
      func: Util.getSecondsFromSelectors.bind(Util)
    },
    duration: {
      selector: ".playing-time-duration",
      func: Util.getSecondsFromSelectors.bind(Util)
    },
    trackArt: {
      selector: ".playing-thumb",
      func: (selectors) => getTrackArtUrl(selectors)
    }
  };
  var kodiPlayerSelector = "#player-kodi";
  var localPlayerSelector = "#player-local";
  Connector.playerSelector = "#player-wrapper";
  Connector.getTrackInfo = () => {
    const context = getCurrentContext();
    const trackInfo = {};
    for (const field in fields) {
      const { selector, func } = fields[field];
      const fullSelector = `${context} ${selector}`;
      trackInfo[field] = func(fullSelector);
    }
    return trackInfo;
  };
  Connector.isPlaying = () => {
    const body = document.querySelector("body");
    if (body?.classList.contains("active-player-local")) {
      return body.classList.contains("local-playing");
    }
    if (body?.classList.contains("active-player-kodi")) {
      return body.classList.contains("kodi-playing");
    }
    throw new Error("Unknown context");
  };
  function getCurrentContext() {
    const body = document.querySelector("body");
    if (body?.classList.contains("active-player-local")) {
      return localPlayerSelector;
    }
    if (body?.classList.contains("active-player-kodi")) {
      return kodiPlayerSelector;
    }
    throw new Error("Unknown context");
  }
  function getTrackArtUrl(selector) {
    return Util.extractUrlFromCssProperty(
      Util.getCSSPropertyFromSelectors(selector, "background-image")
    );
  }
})();

"use strict";
(() => {
  // src/connectors/suno.ts
  var currentTimeSelector = "div.min-w-8.text-right.text-xs";
  var durationTimeSelector = "div.min-w-8.text-left.text-xs";
  Connector.playerSelector = 'div:has(a[aria-label^="Playbar: Title"]):has(button[aria-label^="Playbar: Play button"], button[aria-label^="Playbar: Pause button"])';
  Connector.artistSelector = 'a[aria-label^="Playbar: Artist"]';
  Connector.trackSelector = 'a[aria-label^="Playbar: Title"]';
  Connector.trackArtSelector = 'img[aria-label^="Playbar: Cover image"]';
  Connector.getCurrentTime = () => getTimeSeconds("current" /* Current */);
  Connector.getDuration = () => getTimeSeconds("duration" /* Duration */);
  Connector.playButtonSelector = 'button[aria-label^="Playbar: Play button"]';
  function getTimeSeconds(part) {
    const selector = part === "current" /* Current */ ? currentTimeSelector : durationTimeSelector;
    const el = document.querySelector(selector);
    return Util.stringToSeconds(el?.textContent?.trim() ?? "");
  }
})();

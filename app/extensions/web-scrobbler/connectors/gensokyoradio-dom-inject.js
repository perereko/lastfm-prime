"use strict";
(() => {
  // src/connectors/gensokyoradio-dom-inject.ts
  if ("cleanup" in window && typeof window.cleanup === "function") {
    window.cleanup();
  }
  window.cleanup = (() => {
    const listeners = ["play", "pause", "ended", "emptied", "suspend"];
    setupEventListener();
    function sendUpdateEvent() {
      window.postMessage(
        {
          sender: "web-scrobbler",
          isPlaying: !window.audio.paused
        },
        "*"
      );
    }
    function setupEventListener() {
      const audio = window.audio;
      for (const type of listeners) {
        audio.addEventListener(type, sendUpdateEvent);
      }
      sendUpdateEvent();
    }
    return () => {
      const audio = window.audio;
      if (!audio) {
        return;
      }
      for (const type of listeners) {
        audio.removeEventListener(type, sendUpdateEvent);
      }
    };
  })();
})();

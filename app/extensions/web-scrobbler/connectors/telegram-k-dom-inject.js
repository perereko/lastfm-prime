"use strict";
(() => {
  // src/connectors/telegram-k-dom-inject.ts
  if ("cleanup" in window && typeof window.cleanup === "function") {
    window.cleanup();
  }
  window.cleanup = (() => {
    const W = window;
    function extractAttributes(attributes) {
      const data = {};
      for (const attribute of attributes) {
        for (const key in attribute) {
          data[key] = attribute[key];
        }
      }
      return data;
    }
    function listener() {
      const details = W.appMediaPlaybackController.getPlayingDetails();
      const attribute = extractAttributes(details.doc.attributes);
      const { file_name: fileName } = attribute;
      window.postMessage(
        {
          sender: "web-scrobbler",
          type: "TELEGRAM_K_STATE",
          state: {
            _track: attribute.title || fileName,
            _artist: attribute.performer || fileName,
            getUniqueID: details.doc.id,
            getDuration: details.doc.duration,
            isPlaying: details.media.paused === false,
            isStateChangeAllowed: details.doc.type === "audio"
          }
        },
        "*"
      );
    }
    function toggleEventListeners(name) {
      const api = W.appMediaPlaybackController;
      const method = `${name}EventListener`;
      const events = ["play", "pause"];
      for (const event of events) {
        api[method](event, listener);
      }
    }
    const observer = new MutationObserver(() => {
      if ("appMediaPlaybackController" in W) {
        observer.disconnect();
        toggleEventListeners("add");
      }
    });
    observer.observe(document.body, { childList: true });
    return () => {
      observer.disconnect();
      toggleEventListeners("remove");
    };
  })();
})();

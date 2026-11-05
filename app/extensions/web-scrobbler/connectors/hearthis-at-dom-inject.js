"use strict";
(() => {
  // src/connectors/hearthis-at-dom-inject.ts
  if ("cleanup" in window && typeof window.cleanup === "function") {
    window.cleanup();
  }
  window.cleanup = (() => {
    function isUpdate(obj) {
      return Boolean(
        obj.data && typeof obj.data === "object" && "sender" in obj.data && obj.data.sender === "web-scrobbler" && "type" in obj.data && obj.data.type
      );
    }
    function listenForUpdates(e) {
      if (!isUpdate(e) || e.data.type !== "update") {
        return;
      }
      const customWindow = window;
      const currentSong = customWindow.playlist.info.filter(
        (e2) => e2.id === customWindow.replaceId?.toString()
      )[0];
      window.postMessage(
        {
          sender: "web-scrobbler",
          type: "info",
          artist: currentSong?.artist,
          title: currentSong?.title,
          img: currentSong?.img,
          currentTime: customWindow.intposition / 1e3
        },
        "*"
      );
    }
    window.addEventListener("message", listenForUpdates);
    return () => {
      window.removeEventListener("message", listenForUpdates);
    };
  })();
})();

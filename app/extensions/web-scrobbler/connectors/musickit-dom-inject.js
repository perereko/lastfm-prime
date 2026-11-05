"use strict";
(() => {
  // src/connectors/musickit-dom-inject.ts
  if ("cleanup" in window && typeof window.cleanup === "function") {
    window.cleanup();
  }
  window.cleanup = (() => {
    addEventListeners();
    async function addEventListeners() {
      const Events = window.MusicKit.Events;
      const instance = await getInstance();
      instance.addEventListener(Events.metadataDidChange, sendEvent);
      instance.addEventListener(Events.playbackStateDidChange, sendEvent);
      instance.addEventListener(Events.nowPlayingItemDidChange, sendEvent);
      sendEvent();
    }
    async function getInstance() {
      const api = window.MusicKit;
      const initInstance = api?.getInstance();
      if (initInstance) {
        return initInstance?.player ?? initInstance;
      }
      let i = 0;
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const instance = api?.getInstance();
          if (instance) {
            clearInterval(interval);
            resolve(instance?.player ?? instance);
            return;
          }
          if (i++ > 100) {
            clearInterval(interval);
            reject(new Error("MusicKit instance not found"));
          }
        }, 100);
      });
    }
    function sendEvent() {
      getTrackInfo().then((trackInfo) => {
        instanceIsPlaying().then((isPlaying) => {
          window.postMessage(
            {
              sender: "web-scrobbler",
              type: "MUSICKIT_STATE",
              trackInfo,
              isPlaying
            },
            "*"
          );
        });
      });
    }
    async function getTrackInfo() {
      const instance = await getInstance();
      const item = instance.nowPlayingItem;
      return {
        album: item?.albumName,
        track: item?.title,
        artist: item?.artistName,
        albumArtist: item?.container?.attributes?.artistName,
        trackArt: getArtwork(item?.artworkURL ?? ""),
        duration: instance.currentPlaybackDuration,
        uniqueID: item?.id,
        currentTime: instance.currentPlaybackTime
      };
    }
    function getArtwork(url) {
      return url.replace("{w}x{h}bb", "256x256bb");
    }
    async function instanceIsPlaying() {
      return (await getInstance()).isPlaying;
    }
    return async () => {
      const Events = window.MusicKit.Events;
      const instance = await getInstance();
      instance.removeEventListener(Events.metadataDidChange, sendEvent);
      instance.removeEventListener(Events.playbackStateDidChange, sendEvent);
      instance.removeEventListener(Events.nowPlayingItemDidChange, sendEvent);
    };
  })();
})();

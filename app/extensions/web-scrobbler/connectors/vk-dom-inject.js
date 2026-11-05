"use strict";
(() => {
  // src/connectors/vk-dom-inject.ts
  if ("cleanup" in window && typeof window.cleanup === "function") {
    window.cleanup();
  }
  window.cleanup = (() => {
    const INFO_ID = 0;
    const INFO_OWNER_ID = 1;
    const INFO_TRACK = 3;
    const INFO_ARTIST = 4;
    const INFO_DURATION = 5;
    const INFO_TRACK_ARTS = 14;
    const INFO_ADDITIONAL = 16;
    const listeners = {};
    setupEventListeners();
    function sendUpdateEvent(type) {
      const ctx = window.ap;
      const audioObject = ctx._currentAudio;
      if (!audioObject) {
        return;
      }
      const currentTime = window.ap._impl._currentAudioEl?.currentTime;
      if (currentTime === audioObject[INFO_DURATION]) {
        return;
      }
      const trackArt = extractTrackArt(audioObject[INFO_TRACK_ARTS]);
      let track = audioObject[INFO_TRACK];
      const additionalInfo = audioObject[INFO_ADDITIONAL];
      if (additionalInfo) {
        track = `${track} (${additionalInfo})`;
      }
      const album = (() => {
        const type2 = ctx._currentPlaylist?._ref.getType();
        return type2 === "album" ? ctx._currentPlaylist?._ref.getTitle() : null;
      })();
      window.postMessage(
        {
          sender: "web-scrobbler",
          type,
          trackInfo: {
            currentTime,
            trackArt,
            track,
            album,
            duration: audioObject[INFO_DURATION],
            uniqueID: `${audioObject[INFO_OWNER_ID]}_${audioObject[INFO_ID]}`,
            artist: audioObject[INFO_ARTIST]
          }
        },
        "*"
      );
    }
    function setupEventListeners() {
      for (const e of ["start", "progress", "pause", "stop"]) {
        listeners[e] = sendUpdateEvent.bind(null, e);
        window.ap.subscribers.push({
          et: e,
          cb: listeners[e]
        });
      }
      if (window.ap.isPlaying()) {
        sendUpdateEvent("start");
      }
    }
    function extractTrackArt(trackArts) {
      const trackArtArr = trackArts.split(",");
      return trackArtArr.pop();
    }
    return () => {
      window.ap.subscribers = window.ap.subscribers.filter(
        (e) => !(e.et && typeof e.et === "string" && e.cb === listeners[e.et])
      );
    };
  })();
})();

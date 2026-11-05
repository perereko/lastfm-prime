"use strict";
(() => {
  // src/connectors/deezer-dom-inject.ts
  if ("cleanup" in window && typeof window.cleanup === "function") {
    window.cleanup();
  }
  window.cleanup = (() => {
    initConnector();
    function initConnector() {
      let retries = 0;
      if ("dzPlayer" in window && window.dzPlayer && "Events" in window && window.Events) {
        addEventListeners();
      } else if (retries < 6) {
        window.setTimeout(function() {
          initConnector();
          retries++;
        }, 1007);
      } else {
        Util.debugLog("Failed to initialize deezer connector!", "warn");
      }
    }
    function addEventListeners() {
      if (!("Events" in window)) {
        return;
      }
      const ev = window.Events;
      ev.subscribe(ev.player.play, sendEvent);
      ev.subscribe(ev.player.playing, sendEvent);
      sendEvent();
    }
    function cleanupEventListeners() {
      if (!("Events" in window)) {
        return;
      }
      const ev = window.Events;
      ev.unsubscribe(ev.player.play, sendEvent);
      ev.unsubscribe(ev.player.playing, sendEvent);
    }
    function sendEvent() {
      window.setTimeout(() => {
        const trackInfo = getCurrentMediaInfo();
        const isitPlaying = isPlaying();
        window.postMessage(
          {
            sender: "web-scrobbler",
            type: "DEEZER_STATE",
            trackInfo,
            isPlaying: isitPlaying,
            isPodcast: isPodcast()
          },
          "*"
        );
      }, 1e3);
    }
    function getCurrentMediaInfo() {
      if (!("dzPlayer" in window)) {
        return;
      }
      const player = window.dzPlayer;
      const currentMedia = player.getCurrentSong();
      if (currentMedia === null) {
        return null;
      }
      if (currentMedia.EXTERNAL) {
        return null;
      }
      const mediaType = currentMedia.__TYPE__;
      const currentTime = player.getPosition();
      let duration = player.getDuration();
      if (typeof duration === "string") {
        duration = parseInt(duration);
      }
      let trackInfo = null;
      switch (mediaType) {
        case "episode": {
          trackInfo = getEpisodeInfo(currentMedia);
          break;
        }
        case "song": {
          trackInfo = getTrackInfo(currentMedia);
          break;
        }
      }
      if (!trackInfo) {
        Util.debugLog(
          `Unable to load track info for ${mediaType} media type`,
          "warn"
        );
        return null;
      }
      trackInfo.currentTime = currentTime;
      trackInfo.duration = duration;
      return trackInfo;
    }
    function getTrackInfo(currentMedia) {
      let trackTitle = currentMedia.SNG_TITLE;
      const trackVersion = currentMedia.VERSION;
      if (trackVersion) {
        trackTitle = `${trackTitle} ${trackVersion}`;
      }
      return {
        artist: currentMedia.ART_NAME,
        track: trackTitle,
        album: currentMedia.ALB_TITLE,
        uniqueID: currentMedia.SNG_ID,
        trackArt: getTrackArt(currentMedia.ALB_PICTURE)
      };
    }
    function getEpisodeInfo(currentMedia) {
      return {
        artist: currentMedia.SHOW_NAME,
        track: currentMedia.EPISODE_TITLE,
        uniqueID: currentMedia.EPISODE_ID
      };
    }
    function isPlaying() {
      if (!("dzPlayer" in window)) {
        return;
      }
      return window.dzPlayer.isPlaying();
    }
    function isPodcast() {
      if (!("dzPlayer" in window)) {
        return;
      }
      const currentMedia = window.dzPlayer.getCurrentSong();
      if (currentMedia === null) {
        return null;
      }
      return currentMedia.__TYPE__ === "episode";
    }
    function getTrackArt(pic) {
      return `https://e-cdns-images.dzcdn.net/images/cover/${pic}/264x264-000000-80-0-0.jpg`;
    }
    return () => {
      cleanupEventListeners();
    };
  })();
})();

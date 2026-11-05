"use strict";
(() => {
  // src/connectors/ilovemusic-dom-inject.ts
  if ("cleanup" in window && typeof window.cleanup === "function") {
    window.cleanup();
  }
  window.cleanup = (() => {
    function getArtwork(data) {
      if ("img" in data) {
        return data.img;
      } else if ("cover" in data) {
        return data.cover;
      }
    }
    function listener() {
      const { channel, radio, channelSequence } = window.ilr3;
      const id = String(channel);
      const target = channelSequence.find((x) => x.id === id);
      const data = target?.channel?.current || target?.channel;
      if (data) {
        window.postMessage(
          {
            sender: "web-scrobbler",
            type: "ILOVEMUSIC_STATE",
            state: {
              getTrack: data.title,
              getArtist: data.artist,
              getTrackArt: getArtwork(data),
              isPlaying: radio.playing
            }
          },
          "*"
        );
      }
    }
    const observer = new MutationObserver(listener);
    observer.observe(document.getElementById("ilrplayer"), {
      childList: true
    });
    observer.observe(document.getElementById("above_player_inner"), {
      childList: true
    });
    return () => {
      observer.disconnect();
    };
  })();
})();

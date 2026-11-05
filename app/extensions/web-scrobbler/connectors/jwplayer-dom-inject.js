"use strict";
(() => {
  // src/connectors/jwplayer-dom-inject.ts
  if (typeof window.cleanup === "function") {
    window.cleanup();
  }
  window.cleanup = (() => {
    let player;
    const sendData = () => {
      window.postMessage(
        {
          sender: "web-scrobbler",
          state: {
            isPlaying: player.getState() === "playing",
            getDuration: player.getDuration(),
            getTrack: player.getPlaylistItem().title,
            getArtist: player.getPlaylistItem().artist,
            // .map() is needed for videos with subtitles
            // DOMException: VTTCue object could not be cloned.
            getPlaylist: player.getPlaylist().map((playlistItem) => playlistItem.title)
          }
        },
        "*"
      );
    };
    const init = () => {
      if (!window.jwplayer) {
        return;
      }
      player = window.jwplayer();
      if (player.on) {
        player.on("play", sendData);
        player.on("pause", sendData);
        clearInterval(timer);
      }
    };
    const timer = setInterval(init, 2e3);
    init();
    return () => {
      clearInterval(timer);
      player.off("play", sendData);
      player.off("pause", sendData);
    };
  })();
})();

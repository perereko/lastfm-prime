"use strict";
(() => {
  // src/connectors/wqxr.ts
  Connector.playerSelector = ".nypr-player.is-audiostream";
  Connector.playButtonSelector = '.nypr-player-controls [data-test-selector="listen-button"]';
  Connector.isPlaying = () => Util.hasElementClass(Connector.playButtonSelector, "is-playing");
  Connector.artistTrackSelector = ".nypr-player-track-info .text-crawl-scroll";
  Connector.getArtistTrack = () => {
    const artistTrackAndShow = Util.getTextFromSelectors(
      Connector.artistTrackSelector
    );
    if (!artistTrackAndShow) {
      return;
    }
    const show = Util.getTextFromSelectors(
      `${Connector.artistTrackSelector} .nypr-player-link`
    );
    if (!show) {
      return;
    }
    const [left, right] = artistTrackAndShow.split(" - ", 2);
    let artistTrack;
    if (left.trim() === show.trim()) {
      artistTrack = right;
    } else if (right.trim() === show.trim()) {
      artistTrack = left;
    }
    if (artistTrack) {
      return Util.splitArtistTrack(artistTrack, [", "]);
    }
  };
  Util.bindListeners(
    ["audio"],
    ["playing", "pause", "timeupdate"],
    Connector.onStateChanged
  );
})();

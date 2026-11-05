"use strict";
(() => {
  // src/connectors/teleplay.ts
  Connector.playerSelector = "#player";
  Connector.trackSelector = "#now-playing-title";
  Connector.artistSelector = "#now-playing-artist";
  Connector.playButtonSelector = "#play-icon";
  Connector.currentTimeSelector = "#current-time";
  Connector.durationSelector = "#total-time";
  Connector.trackArtSelector = "#now-playing-thumb img";
  Connector.isPlaying = () => {
    const audioPlayer = document.querySelector(
      "#audio-player"
    );
    return audioPlayer ? !audioPlayer.paused : false;
  };
  Connector.getCurrentTime = () => {
    const audioPlayer = document.querySelector(
      "#audio-player"
    );
    return audioPlayer ? Math.floor(audioPlayer.currentTime) : 0;
  };
  Connector.getDuration = () => {
    const audioPlayer = document.querySelector(
      "#audio-player"
    );
    return audioPlayer ? Math.floor(audioPlayer.duration) : 0;
  };
  Connector.getUniqueID = () => {
    const title = document.querySelector("#now-playing-title")?.textContent;
    const artist = document.querySelector("#now-playing-artist")?.textContent;
    const audioPlayer = document.querySelector(
      "#audio-player"
    );
    const src = audioPlayer?.src || "";
    const fileIdMatch = src.match(/\/stream\/([^/?]+)/);
    const fileId = fileIdMatch ? fileIdMatch[1] : src;
    return `${artist || "unknown"}-${title || "unknown"}-${fileId}`.toLowerCase().replace(/\s+/g, "-");
  };
  var filter = MetadataFilter.createFilter({
    // Remove common file extensions and quality indicators
    track: (text) => {
      return text.replace(/\.(mp3|m4a|flac|ogg|wav)$/i, "").replace(/\s*\[.*?\]\s*/g, "").replace(/\s*\(.*?kbps\)/gi, "").trim();
    },
    // Clean up artist names
    artist: (text) => {
      return text.replace(/\s*\[.*?\]\s*/g, "").trim();
    }
  });
  Connector.applyFilter(filter);
})();

"use strict";
(() => {
  // src/connectors/playlist-randomizer.ts
  Connector.playerSelector = "#root";
  Connector.trackArtSelector = ".Mui-selected .MuiListItemAvatar-root .MuiAvatar-circular .MuiAvatar-img";
  var trackSelector = ".Mui-selected .MuiListItemText-root .MuiListItemText-primary";
  Connector.isPlaying = () => {
    const playButton = document.querySelector('button[title="Play"]');
    const tooltip = document.querySelector(".MuiTooltip-popper");
    const tooltipText = tooltip ? tooltip.innerText : "";
    if (playButton || tooltipText.includes("Play")) {
      return false;
    }
    return true;
  };
  Connector.getArtistTrack = () => {
    const currentTrack = document.querySelector(trackSelector);
    if (!currentTrack) {
      return null;
    }
    let { artist, track } = Util.processYtVideoTitle(
      currentTrack.firstChild?.nodeValue
    );
    if (!artist) {
      const regex = /^(.*) - Topic$/;
      artist = currentTrack.lastChild?.innerText.replace(
        regex,
        "$1"
      );
    }
    if (!track) {
      track = currentTrack.firstChild?.nodeValue;
    }
    return { artist, track };
  };
  Connector.applyFilter(MetadataFilter.createYouTubeFilter());
  Connector.onReady = Connector.onStateChanged;
})();

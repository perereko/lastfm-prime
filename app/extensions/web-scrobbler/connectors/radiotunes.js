"use strict";
(() => {
  // src/connectors/radiotunes.ts
  var playerBar = "#webplayer-region";
  var trackArtSelectors = [
    // Radiotunes
    "#art",
    // DI
    ".track-region .artwork img"
  ];
  var filter = MetadataFilter.createFilter({ artist: removeTrailingDash });
  Connector.playerSelector = playerBar;
  var artistSelector = ".artist-name";
  Connector.artistSelector = artistSelector;
  var trackSelector = ".track-name";
  Connector.trackSelector = trackSelector;
  Connector.playButtonSelector = ".icon-play";
  Connector.currentTimeSelector = ".timeinfo .time";
  Connector.durationSelector = ".timeinfo .total";
  Connector.getTrackArt = () => {
    const trackArtUrl = Util.extractImageUrlFromSelectors(trackArtSelectors);
    if (trackArtUrl) {
      return trackArtUrl.split("?")[0];
    }
    return null;
  };
  Connector.isPlaying = () => {
    return Util.getAttrFromSelectors("#webplayer-region", "data-state") === "playing";
  };
  Connector.applyFilter(filter);
  function removeTrailingDash(text) {
    return text.replace(/\s-\s$/, "");
  }
  Connector.getOriginUrl = () => {
    let playerArtist = Util.getTextFromSelectors(artistSelector);
    const playerTitle = Util.getTextFromSelectors(trackSelector);
    const pageArtist = Util.getTextFromSelectors(
      ".now-playing-component__artist"
    );
    const pageTitle = Util.getTextFromSelectors(
      ".now-playing-component__title"
    );
    if (playerArtist !== null) {
      playerArtist = playerArtist.trim();
      if (playerArtist.endsWith(" -")) {
        playerArtist = playerArtist.substring(0, playerArtist.length - 2);
      }
    }
    if (playerArtist === pageArtist && playerTitle === pageTitle) {
      const url = new URL(document.location.href);
      return url.origin + Util.getAttrFromSelectors(".now-playing-component__title", "href");
    }
    return document.location.href;
  };
})();

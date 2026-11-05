"use strict";
(() => {
  // src/connectors/siriusxm-player.ts
  var filter = MetadataFilter.createFilter({
    track: [removeYear, removeCover, removeExclusive]
  });
  var playerBar = "[class*='playbackControls']";
  Connector.playerSelector = playerBar;
  Connector.artistTrackSelector = `${playerBar} [class*='title']`;
  Connector.trackArtSelector = `${playerBar} [class*='trackImage'] img[class*='image-image']`;
  Connector.playButtonSelector = `${playerBar} button[aria-label='Play'], ${playerBar} button[aria-label='Reproducir']`;
  Connector.pauseButtonSelector = `${playerBar} button[aria-label='Pause'], ${playerBar} button[aria-label='Pausar']`;
  Connector.loveButtonSelector = `${playerBar} button[aria-label='Thumb up'], ${playerBar} button[aria-label='Pulgar hacia arriba']`;
  Connector.unloveButtonSelector = `${playerBar} button[aria-label='Thumb down'], ${playerBar} button[aria-label='Pulgar hacia abajo']`;
  Connector.scrobblingDisallowedReason = () => {
    const artist = Connector.getArtist()?.toLowerCase();
    const track = Connector.getTrack()?.toLowerCase();
    const filteredTerms = [
      "@siriusxm",
      "@jennylsq",
      "@radiomadison",
      "@morningmashup",
      "@drewfromtv",
      "@firstwave",
      "@jaronbf",
      "@jbonamassa",
      "@markyramone",
      "@siriusxmwillie",
      "@sluggodoug",
      "@thechainsmokers",
      "josiah",
      "1-877-33-sirius",
      "@sxm",
      // will broadly catch a bunch of sxm Twitter handles
      "altnation",
      ".ca",
      ".com",
      "indie 1.0",
      "#",
      "facebook",
      "twitter",
      "bdcast"
    ];
    return filteredTerms.some(
      (term) => artist?.includes(term) || track?.includes(term)
    ) ? "FilteredTag" : null;
  };
  Connector.applyFilter(filter);
  function removeExclusive(track) {
    return track.replace(/\sEXCLUSIVE/g, "");
  }
  function removeCover(track) {
    return track.replace(/\([^)]*\b(?:cover|Cover)\b[^)]*\)/g, "");
  }
  function removeYear(track) {
    return track.replace(/\s\(\d{2}\)\s?$/g, "");
  }
})();

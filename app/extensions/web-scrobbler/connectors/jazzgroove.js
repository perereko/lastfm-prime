"use strict";
(() => {
  // src/connectors/jazzgroove.ts
  var jgPlayer = ".jg-player";
  var jgSong = `${jgPlayer} .jg-song`;
  var filter = MetadataFilter.createFilter({
    track: [
      MetadataFilter.removeLive,
      MetadataFilter.removeRemastered,
      MetadataFilter.removeVersion
    ]
  });
  Connector.playerSelector = jgPlayer;
  Connector.artistSelector = [
    `${jgSong} .MuiTypography-body2`,
    `${jgSong} .MuiTypography-caption`
  ];
  Connector.trackSelector = [
    `${jgSong} .MuiTypography-h6`,
    `${jgSong} .MuiTypography-body1`
  ];
  Connector.trackArtSelector = `${jgSong} .jg-player__album-art__image`;
  Connector.isTrackArtDefault = () => {
    const defaultImages = ["Mix1", "Mix2", "Dreams", "Gems", "Smooth"];
    return defaultImages.some(
      (image) => Connector.getTrackArt()?.includes(`${image}.jpg`)
    );
  };
  Connector.scrobblingDisallowedReason = () => {
    const jgRegex = /TJG|Jazz\s?Groove(.org)?/i;
    if (jgRegex.test(Connector.getArtist() ?? Connector.getTrack() ?? "") || Connector.isTrackArtDefault()) {
      return "IsAd";
    }
    return null;
  };
  Connector.isPlaying = () => !Util.hasElementClass(jgPlayer, "jg-player--paused");
  Connector.applyFilter(filter);
})();

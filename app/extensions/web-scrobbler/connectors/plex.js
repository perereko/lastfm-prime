"use strict";
(() => {
  // src/connectors/plex.ts
  var titleContainer = "[class*=PlayerControlsMetadata]";
  var plexFilter = MetadataFilter.createFilter({
    album: removeUnknownAlbum
  });
  Connector.useMediaSessionApi();
  Connector.playerSelector = [
    "[class^=PlayerContainer-container]",
    "[class^=Player-miniPlayerContainer]"
  ];
  Connector.trackSelector = `${titleContainer} a[class*=MetadataPosterTitle]`;
  Connector.albumSelector = `${titleContainer} [class*=MetadataPosterTitle-title] > a:nth-child(3)`;
  Connector.artistSelector = `${titleContainer} [class*=MetadataPosterTitle-title] > a:nth-child(1)`;
  Connector.timeInfoSelector = `${Connector.playerSelector.toString()} [class*=DurationRemaining-container]`;
  Connector.trackArtSelector = [
    `${Connector.playerSelector.toString()} [class^=PosterCardImg-imageContainer] div`,
    "[class^=AudioVideoFullPlayer] [class^=PosterCardImg-imageContainer] div"
  ];
  Connector.pauseButtonSelector = [
    `${Connector.playerSelector.toString()} [data-testid="pauseButton"]`,
    `${Connector.playerSelector.toString()} [class^=plex-icon-player-pause]`
  ];
  Connector.artistTrackSelector = `${Connector.playerSelector.toString()} [class*=MetadataPosterTitle-title]`;
  Connector.applyFilter(MetadataFilter.createYouTubeFilter().extend(plexFilter));
  Connector.getTrack = () => {
    if (Connector.getArtist()) {
      return Util.getTextFromSelectors(Connector.trackSelector);
    }
    return null;
  };
  function removeUnknownAlbum(text) {
    return text.replace("[Unknown Album]", "");
  }
})();

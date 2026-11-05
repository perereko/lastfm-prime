"use strict";
(() => {
  // src/connectors/audius.ts
  Connector.playerSelector = '[class*="playBar"]';
  Connector.playButtonSelector = `${Connector.playerSelector} [aria-label="play track"]`;
  var artistSelector = `${Connector.playerSelector} [class*="_artistName_"]`;
  var trackSelector = `${Connector.playerSelector} [class*="_trackTitle_"]`;
  Connector.getArtistTrack = () => {
    const track = Util.getTextFromSelectors(trackSelector);
    const artistTrack = Util.splitArtistTrack(track, [" - "]);
    artistTrack.track ??= track;
    artistTrack.artist ??= Util.getTextFromSelectors(artistSelector);
    return artistTrack;
  };
  Connector.durationSelector = `${Connector.playerSelector} [class*="timestampEnd"]`;
  Connector.currentTimeSelector = `${Connector.playerSelector} [class*="timestampStart"]`;
  Connector.trackArtSelector = '[class*="coverArtLink"] img';
})();

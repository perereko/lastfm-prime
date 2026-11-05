"use strict";
(() => {
  // src/connectors/ampwall.ts
  var MULTIPLE_ARTIST_DELIMITER = " &&&& ";
  var VARIOUS_ARTISTS_REGEXP = /variou?s\sartists?/i;
  var SEPARATORS = [" - ", " | "];
  Connector.playerSelector = '[data-testid="global-audio-player"]';
  Connector.trackArtSelector = '[data-testid="global-audio-player"] > div > a > img';
  Connector.playButtonSelector = "#audio-player-play-button";
  Connector.currentTimeSelector = '[data-testid="global-audio-player"]  [id^="player_timeElapsed"]';
  Connector.durationSelector = '[data-testid="global-audio-player"]  [id^="player_timeTotal"]';
  Connector.getAlbum = () => Util.getAttrFromSelectors(
    "#audio-player-track-title",
    "data-audio-player-album-name"
  );
  Connector.getArtistTrack = () => {
    let track = Util.getTextFromSelectors("#audio-player-track-title") ?? "";
    const artistData = Util.getAttrFromSelectors(
      "#audio-player-track-artists",
      "data-audio-player-track-artists"
    ) ?? "";
    let artist = "";
    ({ artist, track } = parseArtistTrackData(artistData, track));
    if (isVariousArtists(artist, track)) {
      ({ artist, track } = getArtistDetailsFromTrack(artist, track));
    }
    return { artist, track };
  };
  function parseArtistTrackData(text, track) {
    const artists = text.split(MULTIPLE_ARTIST_DELIMITER);
    return { artist: Util.joinArtistStrings(artists), track };
  }
  function isVariousArtists(mainArtist, track) {
    return VARIOUS_ARTISTS_REGEXP.test(mainArtist ?? "") && Util.findSeparator(track ?? "", SEPARATORS);
  }
  function getArtistDetailsFromTrack(artist, track) {
    const detailsFromTrack = Util.splitArtistTrack(track);
    if (detailsFromTrack?.artist && detailsFromTrack?.track) {
      return {
        artist: detailsFromTrack.artist,
        track: detailsFromTrack.track
      };
    }
    return { artist, track };
  }
})();

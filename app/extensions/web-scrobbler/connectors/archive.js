"use strict";
(() => {
  // src/connectors/archive.ts
  var numericTrackRegex = /^\d+\w+/;
  var filter = MetadataFilter.createFilter({ track: removeNumericPrefixes });
  function removeNumericPrefixes(track) {
    if (hasAllTracksNumericPrefix()) {
      return track.trim().replace(/^(\d+\w+)/, "");
    }
    return track;
  }
  function hasAllTracksNumericPrefix() {
    const playlist = state?.getPlaylist ?? [];
    let hasAllTracksNumericPrefix2 = true;
    for (const track of playlist) {
      if (!numericTrackRegex.test(track.trim() ?? "")) {
        hasAllTracksNumericPrefix2 = false;
        break;
      }
    }
    return hasAllTracksNumericPrefix2;
  }
  Connector.applyFilter(filter);
  Connector.albumArtistSelector = '[itemprop="creator"]';
  Connector.albumSelector = '[itemprop="name"]';
  Connector.getTrackArt = () => {
    const theaterElement = document.querySelector("ia-music-theater");
    if (theaterElement === null) {
      return null;
    }
    return theaterElement.querySelector("img")?.getAttribute("src");
  };
  Connector.injectScript("connectors/jwplayer-dom-inject.js");
  var state = {};
  Connector.onScriptEvent = (event) => {
    state = event.data.state;
    Connector.onStateChanged();
  };
  Connector.isPlaying = () => state?.isPlaying;
  Connector.getDuration = () => state?.getDuration;
  Connector.getTrack = () => state?.getTrack;
  Connector.getArtist = () => state?.getArtist;
})();

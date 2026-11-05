"use strict";
(() => {
  // src/connectors/gaana.ts
  var lastTrackTitle = null;
  var songInfo = null;
  Connector.playerSelector = ".player";
  Connector.trackArtSelector = ".player-artwork img";
  Connector.getArtistTrack = () => {
    requestSongInfo();
    return songInfo;
  };
  Connector.isPlaying = () => {
    if (Util.isArtistTrackEmpty(songInfo)) {
      return false;
    }
    return Util.hasElementClass(".playPause", "pause");
  };
  async function requestSongInfo() {
    if (isNewSongPlaying()) {
      const relativeUrl = Util.getAttrFromSelectors("#atitle a", "href");
      const albumInfoUrl = `https://gaana.com${relativeUrl}`;
      try {
        songInfo = await fetchSongInfo(albumInfoUrl);
      } catch (err) {
        Util.debugLog(`Error: ${err}`, "error");
        resetSongInfo();
      }
    }
  }
  function resetSongInfo() {
    songInfo = null;
  }
  function isNewSongPlaying() {
    const track = Util.getTextFromSelectors("#stitle");
    if (lastTrackTitle !== track) {
      lastTrackTitle = track;
      return true;
    }
    return false;
  }
  async function fetchSongInfo(albumInfoUrl) {
    const track = lastTrackTitle;
    let artist = null;
    const response = await fetch(albumInfoUrl);
    const result = await response.text();
    const doc = new DOMParser().parseFromString(result, "text/html");
    const songElements = doc.querySelectorAll(".s_c > ul > [data-value]");
    for (const song of songElements) {
      const songTitleElement = song.querySelector(".s_title .sng_c");
      if (songTitleElement) {
        const songTitle = songTitleElement.textContent?.trim();
        if (songTitle === track) {
          const artists = song.querySelectorAll(".s_artist .sng_c");
          artist = Util.joinArtists(Array.from(artists));
          break;
        }
      }
    }
    return { artist, track };
  }
})();

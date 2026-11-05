"use strict";
(() => {
  // src/connectors/eulerbeats.ts
  Connector.playerSelector = "#root";
  Connector.isPlaying = () => !!document.querySelector(".eulerbeats-main.eulerbeats-is-playing");
  Connector.getUniqueID = () => getSeed();
  Connector.getAlbum = () => "Euler";
  Connector.getArtist = () => "EulerBeats";
  Connector.getTrack = () => document.title.split(" | ")[1];
  Connector.getTrackArt = () => {
    const release = getRelease();
    return `https://media.eulerbeats.com/${release === "genesis" ? "" : `${release}/`}${getSeed()}.png`;
  };
  function getRelease() {
    return window.location.pathname.split("/")[1];
  }
  function getSeed() {
    const release = getRelease();
    let tokenId = Number(window.location.pathname.split("/")[2]);
    if (release === "enigma") {
      if (tokenId % 2 !== 0) {
        tokenId -= 1;
      }
      return tokenId.toString(16).padStart(12, "0");
    } else if (release === "genesis") {
      if (tokenId > 274877906944) {
        tokenId = tokenId - 274877906944;
      }
      return tokenId.toString(16).padStart(10, "0");
    }
  }
})();

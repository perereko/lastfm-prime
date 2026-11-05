"use strict";
(() => {
  // src/connectors/eggs.ts
  var filter = MetadataFilter.createFilter({
    track: removeMV
  });
  var trackInfo = {};
  var timeInfo = {};
  var isPlaying = false;
  Connector.getTimeInfo = () => {
    const { currentTime, duration } = document.querySelector(
      "#aPlayer"
    );
    return { currentTime, duration };
  };
  Connector.playerSelector = ".m-upload-list";
  Connector.applyFilter(filter);
  Connector.injectScript("./connectors/eggs-dom-inject.js");
  if (window.location.href.includes("/artist/")) {
    setupArtistPlayer();
  } else {
    setupSongPlayer();
  }
  function setupYoutubePlayer() {
    Connector.getTrackInfo = () => trackInfo;
    Connector.isPlaying = () => isPlaying;
    Connector.getTimeInfo = () => timeInfo;
  }
  function setupArtistPlayer() {
    const observer = new MutationObserver(checkToggleArtist);
    observer.observe(document.body, { childList: true });
    setArtistConnector();
  }
  function setArtistConnector() {
    Connector.getTrackInfo = () => {
      const currTrack = document.querySelector('.pause[style*="display: block"]') || document.querySelector(".playw:hover");
      const parentLi = currTrack?.closest("li");
      if (!parentLi) {
        return;
      }
      const songInfo = {
        artist: parentLi?.querySelector(".artist_name")?.textContent,
        track: (parentLi?.querySelector(".player")).dataset.srcname,
        trackArt: (parentLi?.querySelector("img")).src
      };
      return songInfo;
    };
    Connector.isPlaying = () => document.querySelectorAll('.pause[style*="display: block;"]').length !== 0;
  }
  function setupSongPlayer() {
    Connector.trackArtSelector = ".img-album img";
    Connector.artistSelector = ".artist_name a";
    Connector.trackSelector = "#js-product-name-0 p";
    Connector.pauseButtonSelector = ".pause";
  }
  function checkToggleArtist(mutationList) {
    const removedList = mutationList[0].removedNodes;
    if (removedList.length) {
      if (removedList[0].classList.contains(
        "fancybox-overlay"
      )) {
        setArtistConnector();
      }
    }
  }
  Connector.onScriptEvent = (event) => {
    trackInfo = event.data.trackInfo;
    isPlaying = event.data.isPlaying;
    timeInfo = event.data.timeInfo;
    if (event.data.playerType === "youtube") {
      Connector.onStateChanged();
    } else if (event.data.playerType === "youtubestart") {
      setupYoutubePlayer();
    }
  };
  function removeMV(text) {
    return text.replace(/(\(MV\)|【MV】|MV)$/, "");
  }
})();

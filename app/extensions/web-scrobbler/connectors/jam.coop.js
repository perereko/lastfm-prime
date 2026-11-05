"use strict";
(() => {
  // src/connectors/jam.coop.ts
  var trackListSelector = '[data-player-target="track"]';
  var progressSelector = '[data-player-target="progress"]';
  var getCurrentTrackListElement = () => {
    const playingTrackName = Connector.getTrack();
    if (!playingTrackName) {
      return null;
    }
    const trackListElements = Util.queryElements(trackListSelector);
    if (!trackListElements) {
      return null;
    }
    for (const trackListElem of trackListElements) {
      const trackListElemTitle = trackListElem.querySelector(
        "span.cursor-pointer"
      );
      if (trackListElemTitle?.textContent === playingTrackName) {
        return trackListElem;
      }
    }
    return null;
  };
  var getProgressPercentage = () => {
    const progressElements = Util.queryElements(progressSelector);
    if (!progressElements || !progressElements.length) {
      return 0;
    }
    const widthCss = progressElements[0].style.width;
    return parseFloat(widthCss);
  };
  Connector.playerSelector = '[data-controller="player"]';
  Connector.playButtonSelector = '[data-action="player#play"]';
  Connector.pauseButtonSelector = '[data-action="player#pause"]';
  Connector.artistSelector = `${Connector.playerSelector} h2`;
  Connector.trackSelector = `${Connector.playerSelector} h3`;
  Connector.albumSelector = `${Connector.playerSelector} h1`;
  Connector.trackArtSelector = `${Connector.playerSelector} img`;
  Connector.isPlaying = () => {
    const elements = Util.queryElements(Connector.pauseButtonSelector);
    if (!elements || !elements.length) {
      return false;
    }
    return !elements[0].classList.contains("hidden");
  };
  Connector.getUniqueID = () => {
    const currentTrackListElem = getCurrentTrackListElement();
    if (!currentTrackListElem) {
      return null;
    }
    return currentTrackListElem.getAttribute("data-track-url");
  };
  Connector.getDuration = () => {
    const currentTrackListElem = getCurrentTrackListElement();
    if (!currentTrackListElem) {
      return null;
    }
    const durationElem = currentTrackListElem.querySelector("span:nth-child(2)");
    if (!durationElem) {
      return null;
    }
    return Util.stringToSeconds(durationElem.textContent);
  };
  Connector.getCurrentTime = () => {
    const duration = Connector.getDuration() ?? 0;
    const percentage = getProgressPercentage();
    return duration * percentage / 100;
  };
  setInterval(Connector.onStateChanged, 1e3);
})();

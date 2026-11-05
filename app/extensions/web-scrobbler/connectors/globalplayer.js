"use strict";
(() => {
  // src/connectors/globalplayer.ts
  Connector.playerSelector = ".globalplayer";
  var playbarSelector = '.globalplayer [data-testid="playbar"]';
  var showInfoTitleSelector = `${playbarSelector} [data-testid="show-info-title"]`;
  Connector.trackSelector = `${showInfoTitleSelector}>:first-child`;
  Connector.artistSelector = `${showInfoTitleSelector}>:last-child`;
  Connector.pauseButtonSelector = `${playbarSelector} button[data-testid="play-pause-button"][aria-pressed="true"]`;
  Connector.trackArtSelector = `${playbarSelector} img`;
  Connector.scrobblingDisallowedReason = () => document.querySelector(showInfoTitleSelector)?.childElementCount === 1 ? "FilteredTag" : null;
})();

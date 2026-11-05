"use strict";
(() => {
  // src/connectors/abc.net.au.ts
  Connector.playerSelector = '[data-component="Container"]';
  var trackSelector = ">a>div>div";
  var artistSelector = "+h3";
  var songInfoSelector = `${Connector.playerSelector} h1:has(${trackSelector}):has(${artistSelector})`;
  Connector.artistSelector = `${songInfoSelector}${artistSelector}`;
  Connector.trackSelector = `${songInfoSelector}${trackSelector}`;
  Connector.trackArtSelector = `${Connector.playerSelector} img:last-child`;
  Connector.pauseButtonSelector = `${Connector.playerSelector} button>svg[data-component="Stop"]`;
})();

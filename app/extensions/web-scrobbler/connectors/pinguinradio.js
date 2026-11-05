"use strict";
(() => {
  // src/connectors/pinguinradio.ts
  Connector.playerSelector = "app-audiofooter";
  var trackInfoSelector = `${Connector.playerSelector} :has(>a>span)`;
  Connector.trackSelector = `${trackInfoSelector} :not(a)>span`;
  Connector.artistSelector = `${trackInfoSelector}>a>span`;
  Connector.useTabAudibleApi();
})();

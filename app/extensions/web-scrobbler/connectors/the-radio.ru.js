"use strict";
(() => {
  // src/connectors/the-radio.ru.ts
  Connector.playerSelector = ".pla";
  Connector.artistSelector = ".pla-artist";
  Connector.trackSelector = ".pla-song";
  Connector.isPlaying = () => Util.hasElementClass(".pla-ava", "pla-ava--vinyl");
})();

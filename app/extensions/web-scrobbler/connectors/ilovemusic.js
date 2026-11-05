"use strict";
(() => {
  // src/connectors/ilovemusic.ts
  var state = {
    getTrack: null,
    getArtist: null,
    getTrackArt: null,
    isPlaying: false
  };
  for (const prop in state) {
    Object.defineProperty(Connector, prop, {
      value: () => state[prop]
    });
  }
  Connector.getTrackArt = () => Util.normalizeUrl(state.getTrackArt);
  Connector.onScriptEvent = (event) => {
    if (event.data.type === "ILOVEMUSIC_STATE") {
      const newState = event.data.state;
      for (const name in state) {
        Object.defineProperty(state, name, {
          value: newState[name]
        });
      }
      Connector.onStateChanged();
    }
  };
  Connector.injectScript("connectors/ilovemusic-dom-inject.js");
})();

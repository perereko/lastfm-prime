"use strict";
(() => {
  // src/connectors/telegram-k.ts
  var state = {
    _track: null,
    _artist: null,
    getUniqueID: null,
    getDuration: void 0,
    isPlaying: false,
    isStateChangeAllowed: true
  };
  for (const prop in state) {
    if (prop.startsWith("_")) {
      continue;
    }
    Object.defineProperty(Connector, prop, {
      value: () => state[prop]
    });
  }
  Connector.onScriptEvent = (event) => {
    if (event.data.type === "TELEGRAM_K_STATE") {
      const newState = event.data.state;
      for (const name in state) {
        Object.defineProperty(state, name, {
          value: newState[name]
        });
      }
      Connector.onStateChanged();
    }
  };
  Connector.getArtistTrack = () => {
    const artist = state._artist;
    const track = state._track;
    if (artist === track) {
      return Util.splitArtistTrack(artist);
    }
    return { artist, track };
  };
  Connector.injectScript("connectors/telegram-k-dom-inject.js");
  var filter = MetadataFilter.createFilter({
    track: trimSuffix
  });
  Connector.applyFilter(filter);
  function trimSuffix(track) {
    const index = track.lastIndexOf(".");
    if (index === -1) {
      return track;
    }
    return track.substring(0, index);
  }
})();

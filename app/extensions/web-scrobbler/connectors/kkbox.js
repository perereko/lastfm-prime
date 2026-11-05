"use strict";
(() => {
  // src/connectors/kkbox.ts
  Connector.artistSelector = ".yKVKxJ";
  Connector.trackSelector = ".hayDaa>a";
  Connector.playerSelector = ".mngLWd";
  Connector.trackArtSelector = ".kl3pDr img";
  Connector.pauseButtonSelector = ".k-icon-now_playing-pause";
  Connector.getTimeInfo = () => Util.splitTimeInfo(
    document.querySelector(".bR5Q8S").innerText
  );
  var filter = MetadataFilter.createFilter({
    track: getLocalName,
    artist: getLocalName
  });
  Connector.applyFilter(filter);
  function getLocalName(name) {
    const localName = name.replace(/[ -~].*?\((.*?)\)/, "$1");
    return localName.match(/[!-~]/) ? name : localName;
  }
})();

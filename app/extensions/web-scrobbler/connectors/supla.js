"use strict";
(() => {
  // src/connectors/supla.ts
  Connector.playerSelector = "main";
  Connector.playButtonSelector = ".r-play-button";
  Connector.getArtistTrack = () => {
    const artistTrackContainer = getArtistTrackContainer();
    if (artistTrackContainer) {
      return Util.splitArtistTrack(artistTrackContainer.textContent);
    }
    return null;
  };
  function getArtistTrackContainer() {
    const containers = document.querySelectorAll(
      "[class^=RadioHeader__WidgetContent]"
    );
    for (const container of containers) {
      for (const child of container.childNodes) {
        if (child.textContent === "music_note") {
          return container.lastChild;
        }
      }
    }
    return null;
  }
})();

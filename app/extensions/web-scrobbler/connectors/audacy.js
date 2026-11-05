"use strict";
(() => {
  // src/connectors/audacy.ts
  var filter = MetadataFilter.createFilter({ artist: removeDashes });
  var audioPlayer = '[aria-label="Audio player"]';
  var buttonFullscreen = 'button[aria-label="Open full-screen player"]';
  Connector.playerSelector = "#root";
  Connector.playButtonSelector = `${audioPlayer} button[aria-label=Play]`;
  Connector.isPodcast = () => Util.isElementVisible(`${audioPlayer} button[aria-label$="15 seconds"]`);
  Connector.trackSelector = `${audioPlayer} ${buttonFullscreen} span:first-of-type`;
  Connector.artistSelector = `${audioPlayer} ${buttonFullscreen} span:nth-of-type(2)`;
  Connector.getArtist = () => Util.getTextFromSelectors(Connector.artistSelector)?.split(" \u2022 ")[0];
  Connector.trackArtSelector = `${audioPlayer} ${buttonFullscreen} img`;
  Connector.isTrackArtDefault = (url) => url?.includes("radioimg.audacy.com") || url?.startsWith("data:image");
  Connector.scrobblingDisallowedReason = () => {
    const artist = Connector.getArtist();
    const track = Connector.getTrack();
    if (artist === track || artist?.includes("Audacy") || Util.getTextFromSelectors(Connector.artistSelector) === artist && !Connector.isPodcast()) {
      if (track?.startsWith("Advertisement")) {
        return "IsAd";
      }
      return "FilteredTag";
    }
    return null;
  };
  Connector.applyFilter(filter);
  function removeDashes(text) {
    if (Connector.isPodcast()) {
      return text;
    }
    return text.replace(/-/g, " ");
  }
})();

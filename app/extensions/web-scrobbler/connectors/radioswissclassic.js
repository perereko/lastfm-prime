"use strict";
(() => {
  // src/connectors/radioswissclassic.ts
  Connector.playerSelector = ".player-bar";
  Connector.trackSelector = ".current-song .md-font";
  Connector.artistSelector = ".current-song .sm-font";
  Connector.trackArtSelector = ".current-song a > img";
  Connector.isPlaying = () => {
    return Util.hasElementClass(".player-bar .play", "stop");
  };
  Connector.applyFilter(
    MetadataFilter.createFilter({
      track: [
        // Removing "currently playing" in case the text grabber picks up the GIF's alt text
        (text) => text.replace(/^currently playing/i, "").trim()
      ],
      artist: [
        // Optional: Clean up generic artist names if you want
        (text) => text === "Anonymus" ? "Anonymous" : text
      ]
    })
  );
})();

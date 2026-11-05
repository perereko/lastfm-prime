"use strict";
(() => {
  // src/connectors/listen.moe.ts
  var filter = MetadataFilter.createFilter(
    MetadataFilter.createFilterSetForFields(
      ["artist", "track", "album", "albumArtist"],
      trimSpaces
    )
  );
  var filterRules = [
    { source: /\t/g, target: " " },
    { source: /\n/g, target: " " },
    { source: /\s+/g, target: " " }
  ];
  Connector.playerSelector = ".glass";
  Connector.artistSelector = ".glass .text-xs";
  Connector.getTrack = () => {
    const element = document.querySelector(".glass .font-semibold");
    if (!element) {
      return null;
    }
    let text = "";
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else {
        break;
      }
    }
    return text;
  };
  Connector.pauseButtonSelector = ".glass button.rounded-full:has(svg rect)";
  Connector.applyFilter(filter);
  function trimSpaces(text) {
    return MetadataFilter.filterWithFilterRules(text, filterRules);
  }
})();

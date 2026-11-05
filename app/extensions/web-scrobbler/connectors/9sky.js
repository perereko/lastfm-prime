"use strict";
(() => {
  // src/connectors/9sky.ts
  var rightBrackets = ")|\u0F3B\u0F3D\u169C\u201B\u201F\u2046\u207E\u208E\u2309\u230B\u232A\u2769\u276B\u276D\u276F\u2771\u2773\u2775\u27C6\u27E7\u27E9\u27EB\u27ED\u27EF\u2984\u2986\u2988\u298A\u298C\u298E\u2990\u2992\u2994\u2996\u2998\u29D9\u29DB\u29FD\u2E23\u2E25\u2E27\u2E29\u2E43\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\uFD40\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48\uFE5A\uFE5C\uFE5E\uFF09\uFF3C\uFF5C\uFF60\uFF63";
  var titleBrackets = "\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\uFD40\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48";
  Util.bindListeners(
    ["audio", "video"],
    ["playing", "pause", "timeupdate"],
    Connector.onStateChanged
  );
  Connector.getTimeInfo = () => {
    const { duration, currentTime } = Util.queryElements([
      "audio",
      "video"
    ])?.[0];
    return { duration, currentTime };
  };
  Connector.isPlaying = () => {
    const media = Util.queryElements([
      "audio",
      "video"
    ])?.[0];
    return Boolean(media?.currentTime && !media.paused && !media.ended);
  };
  Connector.playerSelector = ".music_bg, .mv_box";
  Connector.trackSelector = ".musicright_box2, #name_h3 a:first-child";
  Connector.artistSelector = ".musicright_box3 a, #name_h3 a:last-child";
  Connector.trackArtSelector = "#playimg";
  Connector.getUniqueID = () => {
    const element = Util.queryElements(".li1 img")?.[0]?.closest("ul");
    const text = element?.getAttribute("id");
    const match = /id=(\d+)/g.exec(location.search);
    return text && `a${text.slice(4)}` || match && `v${match[1]}` || null;
  };
  var filter = MetadataFilter.createFilter({ track: filterTrack });
  function filterTrack(text) {
    const regex = new RegExp(`^.*([${rightBrackets}]).*$`);
    const filteredText = text.replace(regex, filterBrackets);
    return filteredText.replace(/[\s_—－-][^_—－-]+(?:版|version|mv)\s*$/i, "");
  }
  function filterBrackets(text, bracket) {
    const i = text.lastIndexOf(bracket);
    const j = text.indexOf(String.fromCharCode(bracket.charCodeAt(0) - 1));
    const b = text.slice(j + 1, i);
    if (!/(?:版|version|mv)\s*$/i.test(b)) {
      return titleBrackets.includes(bracket) ? b : text;
    }
    const filteredText = Array.from(text);
    filteredText.splice(j, i - j + 1);
    return filteredText.join("");
  }
  Connector.applyFilter(filter);
})();

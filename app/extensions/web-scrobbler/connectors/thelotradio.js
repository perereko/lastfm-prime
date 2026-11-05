"use strict";
(() => {
  // src/connectors/thelotradio.ts
  Connector.playerSelector = "video";
  var headerPlayer = `.${CSS.escape("[&>*]:h-(--header-height)")}`;
  Connector.isStateChangeAllowed = () => {
    const liveLabel = Util.getTextFromSelectors(`${headerPlayer} li.bg-purple`);
    const isLive = liveLabel === "THE LOT LIVE";
    return !isLive;
  };
  Util.bindListeners(
    ["video"],
    ["playing", "pause", "timeupdate"],
    Connector.onStateChanged
  );
  Util.bindListeners(["ul li > button"], ["click"], Connector.onStateChanged);
  var missingTracklistSelector = 'img[src^="/images/crying-nicolas-cage.gif"]';
  var showTitleSelector = 'header h1:has(+ div div button[aria-label="Save Episode"])';
  function isMissingTracklist() {
    return Util.isElementVisible(missingTracklistSelector);
  }
  var notDisplayNone = ':not([style*="display: none"])';
  var nowPlayingSelector = `.grid${notDisplayNone} ul li > button.text-purple`;
  var nowPlayingNextSelector = `.grid${notDisplayNone} ul li:has(button.text-purple) + li > button`;
  var trackSelector = `${nowPlayingSelector} > div > span:nth-of-type(2) > span:first-of-type`;
  var artistSelector = `${nowPlayingSelector} > div > span:nth-of-type(2) > span.opacity-40`;
  Connector.getTrack = () => {
    if (isMissingTracklist()) {
      return getTextContentFromSelectors(showTitleSelector);
    }
    return getTextContentFromSelectors(trackSelector);
  };
  Connector.getArtist = () => {
    if (isMissingTracklist()) {
      return "The Lot Radio";
    }
    return getTextContentFromSelectors(artistSelector);
  };
  var fullDurationSelector = `${headerPlayer} span.hidden.${CSS.escape("xl:inline")}`;
  Connector.getDuration = () => {
    if (isMissingTracklist()) {
      const fullDuration = Util.queryElements(fullDurationSelector)?.[0];
      if (!fullDuration) {
        return void 0;
      }
      return Util.stringToSeconds(
        fullDuration?.innerText.replace(" / ", "0")
      );
    }
    const nowPlayingStart = Util.queryElements(
      `${nowPlayingSelector} > div > span:first-of-type`
    )?.[0];
    if (!nowPlayingStart) {
      return void 0;
    }
    const nextPlayingStart = Util.queryElements(
      `${nowPlayingNextSelector} > div > span:first-of-type`
    )?.[0];
    let nextTimestamp;
    if (nextPlayingStart) {
      nextTimestamp = nextPlayingStart.innerText;
    } else {
      const fullDuration = Util.queryElements(fullDurationSelector)?.[0];
      nextTimestamp = fullDuration?.innerText.replace(" / ", "0");
    }
    if (!nextTimestamp) {
      return void 0;
    }
    return Util.stringToSeconds(nextTimestamp) - Util.stringToSeconds(nowPlayingStart.innerText);
  };
  function getTextContentFromSelectors(selectors, defaultValue = null) {
    if (selectors === null) {
      return defaultValue;
    }
    const elements = Util.queryElements(selectors);
    if (!elements) {
      return defaultValue;
    }
    for (const element of elements) {
      const text = element.textContent;
      if (text) {
        return text;
      }
    }
    return defaultValue;
  }
})();

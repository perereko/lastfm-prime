"use strict";
(() => {
  // src/connectors/idagio.ts
  var trackSelector = '[class*="player-PlayerInfo__infoEl--"]';
  var symphonySelector = `${trackSelector} span:nth-child(3) span:first-child`;
  var commonNameSelector = `${trackSelector} span:nth-child(3) span:nth-child(2)`;
  var directorSelector = '[class*="player-PlayerInfo__recordingInfo--"]>span:first-child span';
  Connector.playerSelector = '[class*="player-PlayerBar__bar--"]';
  Connector.artistSelector = `${trackSelector} span:first-child`;
  Connector.getTrack = getCurrentTrack;
  Connector.getAlbum = getCurrentSymphony;
  Connector.currentTimeSelector = '[class*="player-PlayerProgress__progress--"]>span';
  Connector.durationSelector = '[class*="player-PlayerProgress__timeTotal--"] span';
  Connector.pauseButtonSelector = '[class*="player-PlayerControls__btn--"][data-test="player-controls.pause-btn"]';
  Connector.scrobblingDisallowedReason = () => Util.getTextFromSelectors(
    '[class*="player-PlayerInfo__recordingInfo--"]'
  ) === "Sponsor message" ? "IsAd" : null;
  function getCurrentTrack() {
    let track = Util.getTextFromSelectors(trackSelector)?.split("\xA0\u2013\xA0").slice(1).join(": ").trim();
    if (track?.at(-1) === "\u2013") {
      track = track.slice(0, -1);
    }
    return track;
  }
  function getCurrentSymphony() {
    const symphonyShort = Util.getTextFromSelectors(symphonySelector)?.split(
      / in [A-G]| op. [0-9]| KV [0-9]/
    )[0];
    const commonName = Util.getTextFromSelectors(commonNameSelector) || "";
    const director = removeParenthesis(
      Util.getTextFromSelectors(directorSelector)
    );
    return `${symphonyShort}${commonName} (${director})`;
  }
  function removeParenthesis(text) {
    return text?.replace(/\s*\(.*?\)\s*/g, "");
  }
})();

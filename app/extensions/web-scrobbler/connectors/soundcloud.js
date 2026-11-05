"use strict";
(() => {
  // src/connectors/soundcloud.ts
  var artistSelector = [
    ".playbackSoundBadge__titleContextContainer > a",
    "[class*=MiniPlayer_MiniPlayerArtist]"
  ];
  var trackSelector = [
    ".playbackSoundBadge__titleLink > span:nth-child(2)",
    "[class*=MiniPlayer_MiniPlayerTrack]"
  ];
  var trackArtSelector = [
    ".playControls span.sc-artwork",
    "[class*=MiniPlayer_MiniPlayerArtworkImage]"
  ];
  var desktopDurationSelector = ".playbackTimeline__duration > span:nth-child(2)";
  var desktopCurrentTimeSelector = ".playbackTimeline__timePassed > span:nth-child(2)";
  var mobileProgressSelector = "[class*=MiniPlayer_MiniPlayerProgressBar]";
  Connector.playerSelector = [".playControls", "[class*=MiniPlayer_MiniPlayer]"];
  Connector.getCurrentTime = () => {
    const desktopCurrentTime = document.querySelector(
      desktopCurrentTimeSelector
    );
    if (desktopCurrentTime) {
      return Util.getSecondsFromSelectors(desktopCurrentTimeSelector);
    }
    return Number(
      document.querySelector(mobileProgressSelector)?.getAttribute("value")
    );
  };
  Connector.getDuration = () => {
    const time = getDurationOrRemainingTime();
    return time && time > 0 ? time : null;
  };
  Connector.getRemainingTime = () => {
    const time = getDurationOrRemainingTime();
    return time && time < 0 ? time : null;
  };
  Connector.getArtistTrack = () => {
    let { artist, track } = Util.processSoundCloudTrack(
      Util.getTextFromSelectors(trackSelector)
    );
    if (!artist) {
      artist = Util.getTextFromSelectors(artistSelector);
    }
    return { artist, track };
  };
  Connector.getTrackArt = () => {
    const trackArtUrl = Util.extractImageUrlFromSelectors(trackArtSelector);
    if (trackArtUrl) {
      return trackArtUrl.replace("-t50x50.", "-t200x200.");
    }
    return null;
  };
  Connector.isPlaying = () => Util.hasElementClass(".playControl", "playing") || document.querySelector("[class*=IconButton_Medium]")?.getAttribute("data-testid") === "miniplayer-pause";
  Connector.loveButtonSelector = ".playControls .sc-button-like:not(.sc-button-selected)";
  Connector.unloveButtonSelector = ".playControls .sc-button-like.sc-button-selected";
  Connector.getUniqueID = () => {
    const titleLink = document.querySelector(
      ".playbackSoundBadge__titleLink"
    );
    if (!titleLink) {
      return null;
    }
    const url = new URL(titleLink.href);
    return url.origin + url.pathname;
  };
  Connector.getOriginUrl = () => {
    return Connector.getUniqueID();
  };
  Connector.scrobblingDisallowedReason = () => {
    const soundPlaying = document.querySelector(
      "div:not(.playlist).sound.playing"
    );
    if (soundPlaying && soundPlaying.querySelector(".sc-label-private")) {
      return "IsPrivate";
    }
    const activeCompactTrack = document.querySelector(
      ".compactTrackListItem.active"
    );
    if (activeCompactTrack && !activeCompactTrack.querySelector(".compactTrackListItem__plays")) {
      return "IsPrivate";
    }
    if (/\/sets\//.test(new URL(document.URL).pathname)) {
      const activeTrack = document.querySelector(".active");
      if (activeTrack && activeTrack.querySelector(".sc-label-private")) {
        return "IsPrivate";
      }
    } else if (document.querySelector(".fullListenHero") && document.querySelector(".sc-label-private")) {
      return "IsPrivate";
    }
  };
  var filterArtistPremiereRules = [
    { source: /^\s*Premiere.*:\s*/i, target: "" },
    { source: /^\s*\*\*Premiere\*\*\s*/i, target: "" }
  ];
  var filterTrackPremiereRules = [{ source: /\[.*Premiere.*\]/i, target: "" }];
  function filterArtistPremiere(text) {
    return MetadataFilter.filterWithFilterRules(
      text,
      filterArtistPremiereRules
    );
  }
  function filterTrackPremiere(text) {
    return MetadataFilter.filterWithFilterRules(text, filterTrackPremiereRules);
  }
  Connector.applyFilter(
    MetadataFilter.createYouTubeFilter().append({
      artist: filterArtistPremiere,
      track: filterTrackPremiere
    })
  );
  function getDurationOrRemainingTime() {
    const desktopDuration = document.querySelector(desktopDurationSelector);
    if (desktopDuration) {
      return Util.getSecondsFromSelectors(desktopDurationSelector);
    }
    return Number(
      document.querySelector(mobileProgressSelector)?.getAttribute("max")
    );
  }
})();

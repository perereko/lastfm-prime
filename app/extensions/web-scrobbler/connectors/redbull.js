"use strict";
(() => {
  // src/connectors/redbull.ts
  var ALLOWED_TYPES = ["video.other", "video.episode"];
  var ARTIST_TRACK_GETTERS = ["videoTitle", "pageTitle", "description"];
  var PAGE_TITLE_REG_EXP = {
    pattern: /(.+)\sby\s([^-–]+)/,
    groups: { artist: 2, track: 1 }
  };
  var artistTrack = {
    artist: null,
    track: null
  };
  Connector.playerSelector = "#app";
  Connector.currentTimeSelector = ".rbPlyr-timeElapsed";
  Connector.durationSelector = ".rbPlyr-timeDuration";
  Connector.getUniqueID = () => {
    const text = Util.getAttrFromSelectors(
      "[data-content-id]",
      "data-content-id"
    );
    return text && text.split(":").at(-2);
  };
  Connector.getArtistTrack = () => {
    for (const getter of ARTIST_TRACK_GETTERS) {
      artistTrack = getArtistTrackFrom(getter);
      if (!Util.isArtistTrackEmpty(artistTrack)) {
        break;
      }
    }
    return artistTrack;
  };
  Connector.playButtonSelector = "rbPlyr-playPause:not(.rbPlyr-pause)";
  Connector.scrobblingDisallowedReason = () => {
    const pageType = Util.getAttrFromSelectors(
      'meta[property="og:type"]',
      "content"
    );
    const categoryLink = Util.getAttrFromSelectors('a[href*="/tags/"]', "href");
    return pageType && ALLOWED_TYPES.includes(pageType) && categoryLink && "music" === categoryLink.split("/").pop() ? null : "Other";
  };
  function getArtistTrackFrom(getter) {
    const track = artistTrack.track && artistTrack.track.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (getter === "videoTitle") {
      const text = Util.getAttrFromSelectors(
        'meta[property="og:title"]',
        "content"
      );
      if (!text) {
        return artistTrack;
      }
      artistTrack = Util.splitArtistTrack(text);
      if (Util.isArtistTrackEmpty(artistTrack)) {
        artistTrack = Util.processYtVideoTitle(text);
      }
      if (Util.isArtistTrackEmpty(artistTrack)) {
        artistTrack.track = text;
      }
    } else if (getter === "pageTitle") {
      const pageTitle = Util.getTextFromSelectors("title");
      const text = pageTitle && pageTitle.split(":").at(-1)?.replace(/( music)? video$/i, "");
      if (!text || !text.match(track ?? "")) {
        return artistTrack;
      }
      const regPage = text.match(PAGE_TITLE_REG_EXP.pattern);
      if (regPage) {
        artistTrack.artist = regPage[PAGE_TITLE_REG_EXP.groups.artist];
      }
      if (Util.isArtistTrackEmpty(artistTrack)) {
        const ytResult = Util.processYtVideoTitle(text);
        if (ytResult.track?.match(track ?? "")) {
          artistTrack.artist = ytResult.artist;
        } else if (ytResult.artist?.match(track ?? "")) {
          artistTrack.artist = ytResult.track;
        }
      }
    } else if (getter === "description") {
      const text = Util.getAttrFromSelectors(
        'meta[property="og:description"]',
        "content"
      );
      if (!text) {
        return artistTrack;
      }
      const regDesc = text.match(new RegExp(`(.*)${track}(.*)`));
      if (!regDesc) {
        return artistTrack;
      }
      const regResult = regDesc[2].match(/\bby\b(.*[^.])\.?/);
      if (regResult) {
        artistTrack.artist = regResult[1];
      } else if (regDesc[1]) {
        artistTrack.artist = regDesc[1]?.match(/(.*)\b.+\b/)?.[1];
      }
    }
    return artistTrack;
  }
})();

"use strict";
(() => {
  // src/connectors/bilibili.ts
  var videoTitleSelector = ".video-title";
  var videoSelector = "video";
  var tagPanelSelector = ".tag-panel";
  var tagLinkSelector = ".tag-link";
  var uploaderSelector = ".up-name";
  var bgmTagSelector = ".bgm-tag .tag-link .tag-txt";
  var PlayerSelector = ".bpx-player-container";
  var currentTimeSelector = ".bpx-player-ctrl-time-current";
  var durationSelector = ".bpx-player-ctrl-time-duration";
  var trackPattern = /[《『「](.*?)[》』」]/g;
  var artistPattern = /[【](.*?)[】]/g;
  var decorationPattern = /[(（](.*?)[)）]/g;
  var coveredByPattern = /by\s*(.*)|CV.\s*(.*)/i;
  var artistLeftSeparators = ["-", "\u2014"];
  var artistRightSeparators = ["/", "\uFF0F"];
  var lastVideoTitle = null;
  var songInfo = null;
  var videoInfo = {
    title: "",
    upLoader: "",
    tags: [],
    bgmTag: null
  };
  var onlyScrobbleContainsMusicTag = true;
  var useScrobbleTagFilter = true;
  var tagFilterKeyWords = ["\u6559\u5B66"];
  var filterKeyWords = [
    "4K",
    "MV",
    "\u97F3\u4E50",
    "hires",
    "\u65E0\u635F",
    "hdr",
    "\u7FFB\u5531",
    "\u539F\u521B",
    "\u5F39\u5531",
    "cover",
    "live",
    "\u52A8\u753B",
    "\u7EFC\u5408",
    "\u6F14\u5531",
    "Hi-Res",
    "\u4E2D\u5B57",
    "\u53CC\u8BED",
    "vocaloid",
    "\u5B57\u5E55",
    "\u5973\u58F0",
    "\u7537\u58F0",
    "\u73B0\u573A",
    "\u5B8C\u6574\u7248",
    "\u5F00\u53E3\u8DEA",
    "op",
    "ed",
    "\u7247\u5C3E\u66F2",
    "\u7247\u5934\u66F2"
  ];
  function getVideoInfo() {
    videoInfo.title = Util.getTextFromSelectors(videoTitleSelector) ?? "";
    videoInfo.upLoader = Util.getTextFromSelectors(uploaderSelector) ?? "";
    const tagPanel = document.querySelector(tagPanelSelector);
    if (tagPanel) {
      const tagElements = tagPanel.querySelectorAll(tagLinkSelector);
      const tags = Array.from(tagElements).map(
        (tagElement) => tagElement.textContent || ""
      );
      videoInfo.tags = tags;
    }
    videoInfo.bgmTag = Util.getTextFromSelectors(bgmTagSelector)?.replace(
      decorationPattern,
      ""
    ) ?? null;
  }
  Connector.playerSelector = PlayerSelector;
  Connector.currentTimeSelector = currentTimeSelector;
  Connector.durationSelector = durationSelector;
  Connector.scrobbleInfoLocationSelector = ".video-info-detail";
  Connector.scrobbleInfoStyle = {
    ...Connector.scrobbleInfoStyle,
    fontSize: "13px",
    fontWeight: "400",
    marginLeft: "10px"
  };
  Connector.isPlaying = () => {
    const video = document.querySelector(videoSelector);
    if (!video) {
      return false;
    }
    return video.currentTime > 0 && !video.paused && !video.ended;
  };
  Connector.getUniqueID = () => {
    const currentURL = Connector.getOriginUrl();
    const match = currentURL ? currentURL.match(/\/video\/(BV[0-9A-Za-z]+)/) : null;
    if (match) {
      const bvNumber = match[1];
      return bvNumber;
    }
    return null;
  };
  Connector.getChannelId = () => new URL(
    document.querySelector(uploaderSelector)?.href ?? "https://bilibili.com/"
  ).pathname.split("/").pop();
  Connector.channelLabelSelector = ".up-name";
  Connector.scrobblingDisallowedReason = () => {
    const tags = videoInfo.tags;
    if (onlyScrobbleContainsMusicTag) {
      if (!tags.includes("\u97F3\u4E50")) {
        return "FilteredTag";
      }
    }
    if (useScrobbleTagFilter) {
      if (tags.some((tag) => isIncludeElems(tag, tagFilterKeyWords))) {
        return "FilteredTag";
      }
    }
    return null;
  };
  Connector.getArtistTrack = () => {
    getSongInfo();
    return songInfo;
  };
  function isNewSongPlaying() {
    const title = videoInfo.title;
    if (lastVideoTitle !== title) {
      lastVideoTitle = title;
      return true;
    }
    return false;
  }
  function resetSongInfo() {
    songInfo = null;
  }
  function resetVideoInfo() {
    videoInfo = {
      title: "",
      upLoader: "",
      tags: [],
      bgmTag: null
    };
  }
  function getSongInfo() {
    getVideoInfo();
    if (isNewSongPlaying()) {
      try {
        Connector.resetState();
        songInfo = grepSongInfo();
      } catch (err) {
        const error = err;
        Util.debugLog(`Error:${error}`, "error");
        resetSongInfo();
        resetVideoInfo();
      }
    }
  }
  function itemFilter(items, filterKeyWords2) {
    return items.filter(
      (item) => !filterKeyWords2.some((keyword) => {
        return item.toLowerCase().includes(keyword.toLowerCase());
      })
    );
  }
  function grepSongInfo() {
    let track = null;
    let artist = null;
    const possibleArtist = [];
    const possibleTrack = [];
    const filteredTags = itemFilter(videoInfo.tags, filterKeyWords);
    const title = videoInfo.title;
    let matched = [];
    matched = getMatchedTextArray(title, coveredByPattern);
    possibleArtist.push(...matched);
    matched = getMatchedTextArray(title, artistPattern);
    possibleArtist.push(...itemFilter(matched, filterKeyWords));
    const uploaderName = videoInfo.upLoader;
    possibleArtist.push(uploaderName);
    matched = getMatchedTextArray(title, trackPattern);
    possibleTrack.push(...itemFilter(matched, filterKeyWords));
    const titleWithoutDecoration = title.replace(trackPattern, "").replace(artistPattern, "").replace(decorationPattern, "");
    if (!(isIncludeElems(title, artistLeftSeparators) || isIncludeElems(title, artistRightSeparators))) {
      possibleTrack.push(titleWithoutDecoration);
    }
    artistLeftSeparators.forEach((separator) => {
      const result = extractText(titleWithoutDecoration, separator);
      if (result) {
        const [leftPart, rightPart] = result;
        possibleTrack.push(rightPart);
        possibleArtist.push(leftPart);
      }
    });
    artistRightSeparators.forEach((separator) => {
      const result = extractText(titleWithoutDecoration, separator);
      if (result) {
        const [leftPart, rightPart] = result;
        possibleTrack.push(leftPart);
        possibleArtist.push(rightPart);
      }
    });
    Util.debugLog(
      `PossibleTrack: ${possibleTrack.toString()}
PossibleArtist: ${possibleArtist.toString()}
FilteredTags: ${filteredTags.toString()}`,
      "log"
    );
    if (filteredTags.length !== 0) {
      Util.debugLog(`Filtered tags: ${filteredTags.toString()}`, "log");
      const matchedArtist = getMatchedTags(possibleArtist, filteredTags);
      artist = getFirstNonNull(matchedArtist);
      const matchedTrack = getMatchedTags(possibleTrack, filteredTags);
      track = getFirstNonNull(matchedTrack);
      Util.debugLog(
        `Matched artist: ${matchedArtist.toString()}
Matched track: ${matchedTrack.toString()}
Filtered tags: ${filteredTags.toString()}`
      );
      if (!track) {
        if (filteredTags.length === 1) {
          track = filteredTags[0];
        }
        if (filteredTags.length === 2 && artist !== null) {
          const tagWithoutArtist = filteredTags.filter(
            (tag) => tag !== artist
          );
          track = tagWithoutArtist[0];
        }
      }
      if (!artist) {
        if (filteredTags.length === 2 && track !== null) {
          const tagWithoutTrack = filteredTags.filter(
            (tag) => tag !== track
          );
          artist = tagWithoutTrack[0];
        }
      }
    } else {
      Util.debugLog("have no filtered tag");
    }
    const bgmTag = videoInfo.bgmTag;
    track = bgmTag ? bgmTag : track;
    if (!artist) {
      artist = getFirstNonNull(possibleArtist);
    }
    if (!track) {
      track = getFirstNonNull(possibleTrack);
    }
    return { artist, track };
  }
  function extractText(text, separator) {
    const regex = new RegExp(`([^${separator}]+)\\s*${separator}\\s*(.+)`);
    const match = text.match(regex);
    if (match) {
      const leftPart = match[1];
      const rightPart = match[2];
      return [leftPart, rightPart];
    }
    return null;
  }
  function getFirstNonNull(arr) {
    for (const element of arr) {
      if (element) {
        return element;
      }
    }
    return null;
  }
  function getMatchedTags(textFragment, tags) {
    const matchedTags = [];
    if (textFragment) {
      textFragment.forEach((fragment) => {
        tags.forEach((tag) => {
          if (fragment && fragment.toLowerCase().includes(tag.toLowerCase()) && !matchedTags.includes(tag)) {
            matchedTags.push(tag);
          }
        });
      });
    }
    return matchedTags;
  }
  function getMatchedTextArray(text, pattern) {
    let match;
    const matchedArray = [];
    if (pattern.global) {
      while ((match = pattern.exec(text)) !== null) {
        matchedArray.push(match[1]);
      }
    } else {
      match = text.match(pattern);
      if (match) {
        matchedArray.push(match[1]);
      }
    }
    return matchedArray;
  }
  function isIncludeElems(item, elemList) {
    return elemList.some(
      (elem) => item.toLowerCase().includes(elem.toLowerCase())
    );
  }
})();

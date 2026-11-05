"use strict";
(() => {
  // src/connectors/youtube.ts
  var videoSelector = ".html5-main-video";
  var chapterNameSelector = ".html5-video-player .ytp-chapter-title-content";
  var videoTitleSelector = [
    ".html5-video-player .ytp-title-link",
    ".slim-video-information-title .yt-core-attributed-string"
  ];
  var channelNameSelector = [
    "#top-row .ytd-channel-name a",
    ".slim-owner-channel-name .yt-core-attributed-string"
  ];
  var videoDescriptionSelector = [
    "#description.ytd-expandable-video-description-body-renderer",
    "#meta-contents #description",
    ".crawler-full-description"
  ];
  var categoryPending = "YT_DUMMY_CATEGORY_PENDING";
  var categoryUnknown = "YT_DUMMY_CATEGORY_UNKNOWN";
  var categoryMusic = "Music";
  var categoryEntertainment = "Entertainment";
  var allowedCategories = [];
  var categoryCache = /* @__PURE__ */ new Map();
  var scrobbleMusicRecognisedOnly = false;
  var getTrackInfoFromYtMusicEnabled = false;
  var currentVideoDescription = null;
  var artistTrackFromDescription = null;
  var getTrackInfoFromYoutubeMusicCache = {};
  var trackInfoGetters = [
    getTrackInfoFromChapters,
    getTrackInfoFromYoutubeMusic,
    getTrackInfoFromDescription,
    getTrackInfoFromTitle
  ];
  readConnectorOptions();
  setupEventListener();
  Connector.playerSelector = ["#content", "#player"];
  Connector.scrobbleInfoLocationSelector = "#primary #title.ytd-watch-metadata";
  Connector.scrobbleInfoStyle = {
    ...Connector.scrobbleInfoStyle,
    fontSize: "1.17em",
    fontWeight: "700"
  };
  Connector.loveButtonSelector = 'ytd-watch-metadata like-button-view-model button[aria-pressed="false"]';
  Connector.unloveButtonSelector = 'ytd-watch-metadata like-button-view-model button[aria-pressed="true"]';
  Connector.getChannelId = () => new URL(
    Util.queryElements([
      "#upload-info .ytd-channel-name .yt-simple-endpoint",
      ".slim-owner-icon-and-title"
    ])?.[0]?.href ?? "https://youtube.com/"
  ).pathname.slice(1);
  Connector.channelLabelSelector = [
    "#primary #title+#top-row ytd-channel-name .yt-formatted-string",
    ".slim-owner-icon-and-title .yt-core-attributed-string"
  ];
  Connector.getTrackInfo = () => {
    const trackInfo = {};
    if (getTrackInfoFromYtMusicEnabled) {
      const videoId = getVideoId();
      if (!getTrackInfoFromYoutubeMusicCache[videoId ?? ""]) {
        getTrackInfoFromYoutubeMusic();
        return trackInfo;
      }
    }
    for (const getter of trackInfoGetters) {
      const currentTrackInfo = getter();
      if (!currentTrackInfo) {
        continue;
      }
      if (!trackInfo.artist) {
        trackInfo.artist = currentTrackInfo.artist;
      }
      if (!trackInfo.track) {
        trackInfo.track = currentTrackInfo.track;
      }
      if (!trackInfo.album && "album" in currentTrackInfo) {
        trackInfo.album = currentTrackInfo.album;
      }
      if (!Util.isArtistTrackEmpty(trackInfo)) {
        break;
      }
    }
    return trackInfo;
  };
  Connector.getTimeInfo = () => {
    const videoElement = document.querySelector(
      videoSelector
    );
    if (videoElement && !areChaptersAvailable()) {
      let { currentTime, duration, playbackRate } = videoElement;
      currentTime /= playbackRate;
      duration /= playbackRate;
      return { currentTime, duration };
    }
    return null;
  };
  Connector.isPlaying = () => {
    return Util.hasElementClass(".html5-video-player", "playing-mode");
  };
  Connector.getOriginUrl = () => {
    const videoId = getVideoId();
    return `https://youtu.be/${videoId}`;
  };
  Connector.getUniqueID = () => {
    if (areChaptersAvailable()) {
      return null;
    }
    return getVideoId();
  };
  Connector.scrobblingDisallowedReason = () => {
    if (document.querySelector(".ad-showing")) {
      return "IsAd";
    }
    if (!isVideoStartedPlaying()) {
      return "Other";
    }
    if (scrobbleMusicRecognisedOnly) {
      const videoId = getVideoId();
      const ytMusicCache = getTrackInfoFromYoutubeMusicCache[videoId ?? ""];
      if (!ytMusicCache) {
        getTrackInfoFromYoutubeMusic();
        return "IsLoading";
      }
      if (!ytMusicCache.done) {
        return "IsLoading";
      }
      if (!ytMusicCache.recognisedByYtMusic) {
        return "NotOnYouTubeMusic";
      }
    }
    return isVideoCategoryAllowed() ? null : "ForbiddenYouTubeCategory";
  };
  Connector.applyFilter(
    MetadataFilter.createYouTubeFilter().append({
      artist: [removeLtrRtlChars, removeNumericPrefix],
      track: [removeLtrRtlChars, removeNumericPrefix]
    })
  );
  function setupEventListener() {
    document.querySelector(videoSelector)?.addEventListener("timeupdate", Connector.onStateChanged);
  }
  function areChaptersAvailable() {
    const text = Util.getTextFromSelectors(chapterNameSelector);
    if (document.querySelector(
      ".ytp-chapter-title-content.sponsorBlock-segment-title"
    )) {
      return false;
    }
    if (!document.querySelector(
      '[target-id="engagement-panel-macro-markers-description-chapters"]'
    )) {
      return false;
    }
    return text;
  }
  function getVideoId() {
    const miniPlayerVideoUrl = Util.getAttrFromSelectors(
      "ytd-miniplayer[active] [selected] a",
      "href"
    );
    if (miniPlayerVideoUrl) {
      return Util.getYtVideoIdFromUrl(miniPlayerVideoUrl);
    }
    const videoIDDesktop = Util.getAttrFromSelectors(
      "ytd-watch-flexy",
      "video-id"
    );
    if (videoIDDesktop) {
      return videoIDDesktop;
    }
    const videoIDMobile = new URLSearchParams(window.location.search).get("v");
    return videoIDMobile;
  }
  function getVideoCategory() {
    const videoId = getVideoId();
    if (!videoId) {
      return null;
    }
    if (categoryCache.has(videoId)) {
      return categoryCache.get(videoId);
    }
    categoryCache.set(videoId, categoryPending);
    fetchCategoryName(videoId).then((category) => {
      Util.debugLog(`Fetched category for ${videoId}: ${category}`);
      categoryCache.set(videoId, category);
    }).catch((err) => {
      Util.debugLog(
        `Failed to fetch category for ${videoId}: ${err}`,
        "warn"
      );
      categoryCache.set(videoId, categoryUnknown);
    });
    return null;
  }
  async function fetchCategoryName(videoId) {
    const videoUrl = `${location.origin}/watch?v=${videoId}`;
    try {
      const response = await fetch(videoUrl);
      const rawHtml = await response.text();
      const categoryMatch = rawHtml.match(/"category":"(.+?)"/);
      if (categoryMatch !== null) {
        return categoryMatch[1];
      }
    } catch {
    }
    return categoryUnknown;
  }
  async function readConnectorOptions() {
    if (await Util.getOption("YouTube", "scrobbleMusicOnly")) {
      allowedCategories.push(categoryMusic);
    }
    if (await Util.getOption("YouTube", "scrobbleEntertainmentOnly")) {
      allowedCategories.push(categoryEntertainment);
    }
    Util.debugLog(`Allowed categories: ${allowedCategories.join(", ")}`);
    if (await Util.getOption("YouTube", "scrobbleMusicRecognisedOnly")) {
      scrobbleMusicRecognisedOnly = true;
      Util.debugLog("Only scrobbling when recognised by YouTube Music");
    }
    if (await Util.getOption("YouTube", "enableGetTrackInfoFromYtMusic")) {
      getTrackInfoFromYtMusicEnabled = true;
      Util.debugLog("Get track info from YouTube Music enabled");
    }
  }
  function getVideoDescription() {
    return Util.getTextFromSelectors(videoDescriptionSelector)?.trim() ?? null;
  }
  function getTrackInfoFromDescription() {
    const description = getVideoDescription();
    if (currentVideoDescription === description) {
      return artistTrackFromDescription;
    }
    currentVideoDescription = description;
    artistTrackFromDescription = Util.parseYtVideoDescription(description);
    return artistTrackFromDescription;
  }
  function getTrackInfoFromYoutubeMusic() {
    if (!getTrackInfoFromYtMusicEnabled && !scrobbleMusicRecognisedOnly) {
      return {};
    }
    const videoId = getVideoId();
    if (!getTrackInfoFromYoutubeMusicCache[videoId ?? ""]) {
      getTrackInfoFromYoutubeMusicCache[videoId ?? ""] = {
        videoId: null,
        done: false,
        currentTrackInfo: {}
      };
    } else {
      if (!getTrackInfoFromYtMusicEnabled) {
        return {};
      }
      if (getTrackInfoFromYoutubeMusicCache[videoId ?? ""].done) {
        return getTrackInfoFromYoutubeMusicCache[videoId ?? ""].currentTrackInfo;
      }
      return {};
    }
    const body = JSON.stringify({
      context: {
        client: {
          // parameters are needed, you get a 400 if you omit these
          // specific values are just what I got when doing a request
          // using firefox
          clientName: "WEB_REMIX",
          clientVersion: "1.20221212.01.00"
        }
      },
      captionParams: {},
      videoId
    });
    fetch("https://music.youtube.com/youtubei/v1/player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body
    }).then((response) => response.json()).then((videoInfo) => {
      getTrackInfoFromYoutubeMusicCache[videoId ?? ""] = {
        done: true,
        recognisedByYtMusic: videoInfo.videoDetails?.musicVideoType?.startsWith(
          "MUSIC_VIDEO_"
        ) || false
      };
      if (videoInfo.videoDetails?.musicVideoType === "MUSIC_VIDEO_TYPE_OMV") {
        getTrackInfoFromYoutubeMusicCache[videoId ?? ""].currentTrackInfo = {
          artist: videoInfo.videoDetails.author,
          track: videoInfo.videoDetails.title
        };
      }
    }).catch((err) => {
      Util.debugLog(
        `Failed to fetch youtube music data for ${videoId}: ${err}`,
        "warn"
      );
      getTrackInfoFromYoutubeMusicCache[videoId ?? ""] = {
        done: true,
        recognisedByYtMusic: false
      };
    });
  }
  function getTrackInfoFromChapters() {
    if (!areChaptersAvailable()) {
      return {
        artist: null,
        track: null
      };
    }
    const chapterName = Util.getTextFromSelectors(chapterNameSelector);
    const artistTrack = Util.processYtVideoTitle(chapterName);
    if (!artistTrack.track) {
      artistTrack.track = chapterName;
    }
    return artistTrack;
  }
  function getTrackInfoFromTitle() {
    let { artist, track } = Util.processYtVideoTitle(
      Util.getTextFromSelectors(videoTitleSelector)
    );
    if (!artist) {
      const channelName = Util.getTextFromSelectors(channelNameSelector);
      const re = (
        // eslint-disable-next-line no-irregular-whitespace
        /^(?:Mavzu|Тема|الموضوع|ਵਿਸ਼ਾ)\s[–-]\s|(?:(?:\s[-—–]|[:՝])\s(?:Onderwerp|Mövzu|Topik|tema|Tema|téma|Emne|Thema|teema|Topic|gaia|Paksa|Sujet|Isihloko|Efni|Mada|tēma|téma|emne|temat|Tópico|Subiect|aihekanava|Ämne|Chủ đề|Konu|тэма|Тема|Тақырып|Сэдэв|тема|Θέμα|թեմա|נושא|موضوع|عنوان|विषय|বিষয়বস্তু|বিষয়|મુદ્દો|ବିଷୟ|தலைப்பு|అంశం|ವಿಷಯ|വിഷയം|මාතෘකාව|หัวข้อ|ຫົວ​ຂໍ້|ခေါင်းစဉ်|თემა|ርዕስ|ប្រធាន​បទ|主题|主題|トピック|주제)|\s\(tema\))$/
      );
      artist = channelName?.replace(re, "") ?? null;
    }
    return { artist, track };
  }
  function removeLtrRtlChars(text) {
    return MetadataFilter.filterWithFilterRules(text, [
      { source: /\u200e/g, target: "" },
      { source: /\u200f/g, target: "" }
    ]);
  }
  function removeNumericPrefix(text) {
    return MetadataFilter.filterWithFilterRules(text, [
      // `NN.` or `NN)`
      { source: /^\d{1,2}[.)]\s?/, target: "" },
      /*
       * `(NN).` Ref: https://www.youtube.com/watch?v=KyabZRQeQgk
       * NOTE Initial tracklist format is (NN)  dd:dd  Artist - Track
       * YouTube adds a dot symbol after the numeric prefix.
       */
      { source: /^\(\d{1,2}\)\./, target: "" }
    ]);
  }
  function isVideoStartedPlaying() {
    const videoElement = document.querySelector(
      videoSelector
    );
    return videoElement && videoElement.currentTime > 0;
  }
  function isVideoCategoryAllowed() {
    if (allowedCategories.length === 0) {
      return true;
    }
    const videoCategory = getVideoCategory();
    if (!videoCategory) {
      return false;
    }
    return allowedCategories.includes(videoCategory) || videoCategory === categoryUnknown;
  }
})();

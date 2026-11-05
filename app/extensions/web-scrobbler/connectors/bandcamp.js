"use strict";
(() => {
  // src/connectors/bandcamp.ts
  var VARIOUS_ARTISTS_REGEXP = /variou?s\sartists?/i;
  var SEPARATORS = [" - ", " | "];
  var bandcampFilter = MetadataFilter.createFilter({
    artist: MetadataFilter.removeZeroWidth,
    track: MetadataFilter.removeZeroWidth,
    album: [MetadataFilter.removeZeroWidth, removePreOrderSuffix],
    albumArtist: MetadataFilter.removeZeroWidth
  });
  if (document.querySelector("main#p-tralbum-page") === null) {
    setupDesktopConnector();
  } else {
    setupMobileConnector();
  }
  Connector.applyFilter(bandcampFilter);
  function setupMobileConnector() {
    bandcampFilter = bandcampFilter.extend(
      MetadataFilter.createFilter({
        artist: [removeByPrefix]
      })
    );
    Connector.playerSelector = "#player";
    Connector.isPlaying = () => document.querySelector(".playbutton.playing") !== null;
    Connector.artistSelector = ".tralbum-artist";
    Connector.albumArtistSelector = ".tralbum-artist";
    Connector.trackSelector = ".current-track > span:nth-child(2)";
    Connector.albumSelector = ".tralbum-name";
    Connector.durationSelector = ".duration-text";
    Connector.currentTimeSelector = ".progress-text";
    Connector.trackArtSelector = "#tralbum-art-carousel img";
    Connector.getOriginUrl = () => document.location.href.split("?")[0];
  }
  function setupDesktopConnector() {
    initEventListeners();
    initGenericProperties();
    if (isAlbumPage()) {
      Util.debugLog("Init props for album player");
      initPropertiesForSongAndAlbumPlayer();
      initPropertiesForAlbumPlayer();
    } else if (isSongPage()) {
      Util.debugLog("Init props for song player");
      initPropertiesForSongAndAlbumPlayer();
      initPropertiesForSongPlayer();
    } else if (isCollectionsPage()) {
      Util.debugLog("Init props for collections player");
      initPropertiesForCollectionsPlayer();
    } else if (isFeedPage()) {
      Util.debugLog("Init props for feed player");
      initPropertiesForFeedPlayer();
    } else if (isDiscoverPage()) {
      Util.debugLog("Init props for discover player");
      initPropertiesForDiscoverPlayer();
    } else if (isPlaylistPage()) {
      Util.debugLog("Init props for playlist player");
      initPropertiesForPlaylistPlayer();
    } else {
      Util.debugLog("Init props for home page");
      initPropertiesForHomePage();
    }
  }
  function initGenericProperties() {
    Connector.getArtist = () => null;
    Connector.getTrack = () => null;
    Connector.getArtistTrack = () => {
      const artist = Util.getTextFromSelectors(Connector.artistSelector);
      let track = Util.getTextFromSelectors(Connector.trackSelector);
      if (isArtistVarious(artist, track)) {
        return Util.splitArtistTrack(track, SEPARATORS);
      }
      if (trackContainsRecordSide()) {
        track = Util.removeRecordSide(track);
      }
      return { artist, track };
    };
    Connector.isPlaying = () => document.querySelector(".playing") !== null;
    Connector.getUniqueID = () => {
      const audioElements = document.getElementsByTagName("audio");
      for (const audioElement of audioElements) {
        const audioSrc = audioElement.getAttribute("src");
        if (!audioSrc) {
          continue;
        }
        const audioIdMatch = /&id=(\d+)&/.exec(audioSrc);
        return audioIdMatch && audioIdMatch[1];
      }
      return null;
    };
    Connector.getOriginUrl = () => document.location.href.split("?")[0];
  }
  function initPropertiesForDiscoverPlayer() {
    bandcampFilter = bandcampFilter.extend(
      MetadataFilter.createFilter({
        artist: [removeByPrefix],
        album: [removeFromPrefix]
      })
    );
    Connector.playerSelector = ".discover-player";
    Connector.artistSelector = ".player-info a:nth-child(3)";
    Connector.albumSelector = ".player-info a:nth-child(2)";
    Connector.trackSelector = ".player-info p";
    Connector.trackArtSelector = "img.cover";
    Connector.durationSelector = ".playback-time.total";
    Connector.currentTimeSelector = ".playback-time.current";
    Connector.isPlaying = () => {
      const playButton = document.querySelector(
        ".player-top button.play-pause-button"
      );
      return playButton !== null && playButton.querySelector("svg.pause-circle-outline-icon") !== null;
    };
  }
  function initPropertiesForAlbumPlayer() {
    Connector.artistSelector = "#name-section a";
    Connector.albumArtistSelector = "#name-section a";
    Connector.trackSelector = ".title-section .title";
    Connector.albumSelector = "#name-section .trackTitle";
  }
  function initPropertiesForSongPlayer() {
    Connector.artistSelector = ".albumTitle span:last-of-type a";
    Connector.albumArtistSelector = ".albumTitle span:last-of-type a";
    Connector.trackSelector = "#name-section .trackTitle";
    Connector.albumSelector = "#name-section .fromAlbum";
  }
  function initPropertiesForSongAndAlbumPlayer() {
    Connector.currentTimeSelector = ".time_elapsed";
    Connector.durationSelector = ".time_total";
    Connector.trackArtSelector = "#tralbumArt > a > img";
  }
  function initPropertiesForCollectionsPlayer() {
    Connector.artistSelector = ".now-playing .artist span";
    Connector.trackSelector = ".info-progress .title span:last-child";
    Connector.albumSelector = ".now-playing .title";
    Connector.timeInfoSelector = ".pos-dur";
    Connector.trackArtSelector = ".now-playing img";
    Connector.getOriginUrl = () => Util.getOriginUrl(
      ".playing .collection-title-details a, .playing .buy-now a"
    );
  }
  function initPropertiesForFeedPlayer() {
    bandcampFilter = bandcampFilter.extend(
      MetadataFilter.createFilter({
        artist: [removeByPrefix]
      })
    );
    Connector.artistSelector = ".waypoint-artist-title";
    Connector.trackSelector = ".waypoint-item-title";
    Connector.trackArtSelector = "#track_play_waypoint img";
    Connector.playButtonSelector = "#track_play_waypoint.playing";
    Connector.getOriginUrl = () => Util.getOriginUrl(".playing .buy-now a");
  }
  function initPropertiesForPlaylistPlayer() {
    bandcampFilter = bandcampFilter.extend(
      MetadataFilter.createFilter({
        artist: [removeByPrefix]
      })
    );
    const playerContext = ".track-list-item.currently-playing ";
    const trackMeta = ".floating-player .track-meta";
    Connector.playerSelector = ".floating-player";
    Connector.artistSelector = `${playerContext} .artist-name`;
    Connector.trackSelector = `${playerContext} .title-text`;
    Connector.albumSelector = `${playerContext} .album-title > strong`;
    Connector.trackArtSelector = `${playerContext} .g-image`;
    Connector.isPlaying = () => document.querySelector(".floating-player .play-pause-button")?.getAttribute("aria-label") === "Pause";
    Connector.getUniqueID = () => document.querySelector(trackMeta)?.getAttribute("id") ?? null;
    Connector.getDuration = () => {
      const duration = document.querySelector(trackMeta)?.getAttribute("duration");
      return duration ? parseFloat(duration) : null;
    };
  }
  function initPropertiesForHomePage() {
    const weeklyPlayerContext = ".bcweekly.playing ~ .bcweekly-info";
    Connector.artistSelector = [
      `${weeklyPlayerContext} .bcweekly-current .track-artist a`,
      ".detail-artist a"
    ];
    Connector.trackSelector = [
      `${weeklyPlayerContext} .bcweekly-current .track-title`,
      ".track_info .title"
    ];
    Connector.albumSelector = [
      `${weeklyPlayerContext} .bcweekly-current .track-album`,
      ".detail-album"
    ];
    Connector.trackArtSelector = [
      `${weeklyPlayerContext} .bcweekly-current .ratio-1-1`,
      ".discover-detail-inner img"
    ];
    Connector.getUniqueID = () => {
      if (document.querySelector(".bcweekly.playing") !== null) {
        const { bcw_data: bandcampWeeklyData } = getData(
          "#pagedata",
          "data-blob"
        );
        const currentShowId = location.search.match(/show=(\d+)?/)?.[1];
        if (currentShowId && currentShowId in bandcampWeeklyData) {
          const currentShowData = bandcampWeeklyData[currentShowId];
          const currentTrackIndex = Util.getDataFromSelectors(
            ".bcweekly-current",
            "index"
          );
          return currentShowData.tracks[currentTrackIndex ?? ""].track_id;
        }
      }
      return null;
    };
    Connector.getOriginUrl = () => Util.getOriginUrl(".playable.playing[href], .playable.playing + a");
  }
  function isAlbumPage() {
    return getPageType() === "album";
  }
  function isSongPage() {
    return getPageType() === "song";
  }
  function isFeedPage() {
    return getPageType() === "profile";
  }
  function isCollectionsPage() {
    return document.querySelector("#carousel-player") !== null;
  }
  function isDiscoverPage() {
    const url = new URL(document.location.href);
    return url.pathname.startsWith("/discover");
  }
  function isPlaylistPage() {
    return getPageType() === "music.playlist";
  }
  function getTrackNodes() {
    let trackNodes = document.querySelectorAll("thisshouldbeempty");
    if (isAlbumPage()) {
      trackNodes = document.querySelectorAll(".track_list .track-title");
    } else if (isCollectionsPage()) {
      trackNodes = document.querySelectorAll(".queue .title span:last-child");
    }
    return trackNodes;
  }
  function isArtistVarious(artist, track) {
    const trackNodes = getTrackNodes();
    if (trackNodes.length !== 0) {
      const artists = [...trackNodes].map((trackNode) => trackNode.textContent).filter(
        (trackName) => Util.findSeparator(trackName ?? "", SEPARATORS)
      ).map(
        (trackName) => Util.splitArtistTrack(trackName, SEPARATORS).artist
      );
      if (trackNodes.length - artists.length > 1) {
        return false;
      }
      if (artists.every((artist2) => !artist2 || artist2.length <= 2)) {
        return false;
      }
      return true;
    }
    if (VARIOUS_ARTISTS_REGEXP.test(artist ?? "")) {
      return Util.findSeparator(track, SEPARATORS) !== null;
    }
    return false;
  }
  function trackContainsRecordSide() {
    const trackNodes = getTrackNodes();
    let numTracksWithRecordSide = 0;
    for (const trackNode of trackNodes) {
      const trackName = trackNode.textContent;
      if (trackName?.substring(0, 3).match(Util.RECORD_SIDE_REGEX) || trackName?.substring(0, 4).match(Util.RECORD_SIDE_REGEX)) {
        numTracksWithRecordSide++;
      }
    }
    return numTracksWithRecordSide === trackNodes.length;
  }
  function getPageType() {
    return Util.getAttrFromSelectors('meta[property="og:type"]', "content");
  }
  function initEventListeners() {
    const events = ["playing", "pause", "timeupdate"];
    const audioElements = document.getElementsByTagName("audio");
    for (const event of events) {
      for (const audioElement of audioElements) {
        audioElement.addEventListener(event, Connector.onStateChanged);
      }
    }
  }
  function getData(selector, attr) {
    const element = document.querySelector(selector);
    if (element) {
      const rawData = element.getAttribute(attr);
      return JSON.parse(rawData ?? "");
    }
    return {};
  }
  function removeByPrefix(text) {
    return text.replace("by ", "");
  }
  function removeFromPrefix(text) {
    return text.replace("from ", "");
  }
  function removePreOrderSuffix(text) {
    return text.replace(/ ?pre-order/i, "");
  }
})();

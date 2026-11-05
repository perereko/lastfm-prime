"use strict";
(() => {
  // src/connectors/youtube-music.ts
  var adSelector = ".ytmusic-player-bar.advertisement";
  var mediaInfo = {
    playbackState: "none",
    metadata: {
      title: "",
      artist: "",
      artwork: [{ src: "" }],
      album: ""
    }
  };
  Connector.onScriptEvent = (event) => {
    mediaInfo.playbackState = event.data.playbackState;
    mediaInfo.metadata = event.data.metadata;
  };
  Connector.playerSelector = "ytmusic-player-bar";
  Connector.isTrackArtDefault = (url) => {
    return Boolean(url?.includes("cover_track_default"));
  };
  Connector.getAlbum = () => mediaInfo.metadata?.album;
  Connector.getTrackArt = () => {
    const artworks = mediaInfo.metadata?.artwork;
    return artworks?.[artworks.length - 1].src;
  };
  Connector.getArtistTrack = () => {
    let artist;
    let track;
    const metadata = mediaInfo.metadata;
    if (metadata?.album) {
      artist = metadata.artist;
      track = metadata.title;
    } else {
      ({ artist, track } = Util.processYtVideoTitle(metadata?.title));
      if (!artist) {
        artist = metadata?.artist;
      }
    }
    return { artist, track };
  };
  Connector.timeInfoSelector = ".ytmusic-player-bar.time-info";
  Connector.isPlaying = () => mediaInfo.playbackState === "playing";
  Connector.loveButtonSelector = 'ytmusic-like-button-renderer #button-shape-like button[aria-pressed="false"]';
  Connector.unloveButtonSelector = 'ytmusic-like-button-renderer #button-shape-like button[aria-pressed="true"]';
  Connector.getUniqueID = () => {
    const uniqueId = new URLSearchParams(window.location.search).get("v");
    if (uniqueId) {
      return uniqueId;
    }
    const videoUrl = Util.getAttrFromSelectors(".yt-uix-sessionlink", "href");
    return Util.getYtVideoIdFromUrl(videoUrl);
  };
  Connector.scrobblingDisallowedReason = () => Util.isElementVisible(adSelector) ? "IsAd" : null;
  function filterYoutubeIfNonAlbum(text) {
    return Connector.getAlbum() ? text : MetadataFilter.youtube(text);
  }
  var youtubeMusicFilter = MetadataFilter.createFilter({
    track: [
      filterYoutubeIfNonAlbum,
      MetadataFilter.removeRemastered,
      MetadataFilter.removeLive
    ],
    album: [MetadataFilter.removeRemastered, MetadataFilter.removeLive]
  });
  Connector.applyFilter(youtubeMusicFilter);
  Connector.injectScript("connectors/youtube-music-dom-inject.js");
})();

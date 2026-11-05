"use strict";
(() => {
  // src/connectors/eggs-dom-inject.ts
  if ("cleanup" in window && typeof window.cleanup === "function") {
    window.cleanup();
  }
  window.cleanup = (() => {
    const isArtistPage = window.location.href.includes("/artist/");
    let frameID = "";
    let currentTime = 0;
    let duration = 0;
    let videoFrameCleanUp = () => {
    };
    let observerCleanUp = () => {
    };
    let videoId = "";
    if (isArtistPage) {
      const observer = new MutationObserver(toggleExternalPlayer);
      observer.observe(document.body, { childList: true });
      observerCleanUp = () => {
        observer.disconnect();
      };
    } else if ("player" in window) {
      window.player.addEventListener(
        "onStateChange",
        onYoutubeSongStateChange
      );
    }
    function toggleExternalPlayer(mutationList) {
      const removedList = mutationList[0].removedNodes;
      const addedList = mutationList[0].addedNodes;
      if (addedList.length) {
        if (addedList[0].classList.contains(
          "fancybox-type-inline"
        )) {
          replaceYoutubeVideo();
          return null;
        }
      }
      if (removedList.length) {
        if (removedList[0].classList.contains(
          "fancybox-overlay"
        )) {
          onYoutubeClose();
          return null;
        }
      }
    }
    function replaceYoutubeVideo() {
      const videoFrame = document.querySelector(
        ".fancybox-inner iframe"
      );
      videoId = videoFrame.src.split("/").pop()?.split("?")[0];
      videoFrame.src += "&enablejsapi=1&widgetid=1";
      frameID = videoFrame.id;
      function onLoad() {
        let message = JSON.stringify({
          event: "listening",
          id: frameID,
          channel: "widget"
        });
        if (videoFrame.contentWindow) {
          videoFrame.contentWindow.postMessage(message, "*");
        }
        message = JSON.stringify({
          event: "command",
          func: "addEventListener",
          args: ["onStateChange"],
          id: frameID,
          channel: "widget"
        });
        if (videoFrame.contentWindow) {
          videoFrame.contentWindow.postMessage(message, "*");
        }
      }
      videoFrame.addEventListener("load", onLoad);
      videoFrameCleanUp = () => {
        videoFrame.removeEventListener("load", onLoad);
      };
    }
    function onMessage(event) {
      if (event.origin !== "https://www.youtube.com") {
        return;
      }
      const data = JSON.parse(event.data);
      switch (data.event) {
        case "onStateChange":
          onYoutubeStateChange(data);
          break;
        case "infoDelivery":
          getTimestamps(data);
          break;
      }
    }
    window.addEventListener("message", onMessage);
    function onYoutubeStateChange(data) {
      const currentPlayer = document.querySelector(
        `.btnPaly[data-src="${videoId}"]`
      );
      const parentElmt = currentPlayer && currentPlayer.closest("li") || document;
      const playerTypeSuffix = data.info === -1 ? "start" : "";
      window.postMessage(
        {
          sender: "web-scrobbler",
          playerType: `youtube${playerTypeSuffix}`,
          isPlaying: data.info === 1,
          timeInfo: {
            currentTime: currentTime || 0,
            duration
          },
          trackInfo: {
            artist: parentElmt.querySelector(
              `.artist_name${isArtistPage ? "" : " a"}`
            )?.textContent,
            track: parentElmt.querySelector(
              `.product_name${isArtistPage ? " a" : " p"}`
            )?.textContent
          }
        },
        "*"
      );
    }
    function onYoutubeClose() {
      const currentPlayer = document.querySelector(`a[href*="${videoId}"]`);
      const parentElmt = currentPlayer && currentPlayer.closest("li") || document;
      window.postMessage(
        {
          sender: "web-scrobbler",
          playerType: "youtube",
          isPlaying: false,
          timeInfo: {
            currentTime,
            duration
          },
          trackInfo: {
            artist: parentElmt.querySelector(
              `.artist_name${isArtistPage ? "" : " a"}`
            )?.textContent,
            track: parentElmt.querySelector(
              `.product_name${isArtistPage ? " a" : " p"}`
            )?.textContent
          }
        },
        "*"
      );
    }
    function onYoutubeSongStateChange(event) {
      const currentPlayer = document.querySelector(`a[href*="${videoId}"]`);
      const parentElmt = currentPlayer && currentPlayer.closest("li") || document;
      const playerTypeSuffix = event.data === -1 ? "start" : "";
      window.postMessage(
        {
          sender: "web-scrobbler",
          playerType: `youtube${playerTypeSuffix}`,
          isPlaying: event.data === 1,
          timeInfo: {
            currentTime: event.target.getCurrentTime(),
            duration: event.target.getDuration()
          },
          trackInfo: {
            artist: parentElmt.querySelector(
              `.artist_name${isArtistPage ? "" : " a"}`
            )?.textContent,
            track: parentElmt.querySelector(
              `.product_name${isArtistPage ? " a" : " p"}`
            )?.textContent
          }
        },
        "*"
      );
    }
    function getTimestamps(data) {
      if (data.info) {
        if (data.info.currentTime) {
          currentTime = data.info.currentTime;
        }
        if (data.info.duration) {
          duration = data.info.duration;
        }
      }
    }
    function initializeYoutube() {
      const videoFrame = document.querySelector(
        ".fancybox-inner iframe"
      );
      if (!videoFrame) {
        return;
      }
      onYoutubeSongStateChange({
        data: -1,
        target: {
          getCurrentTime: () => 0,
          getDuration: () => 0
        }
      });
      videoId = videoFrame.src.split("/").pop()?.split("?")[0];
      let message = JSON.stringify({
        event: "command",
        func: "pauseVideo",
        args: [],
        id: frameID,
        channel: "widget"
      });
      videoFrame.contentWindow?.postMessage(message, "*");
      message = JSON.stringify({
        event: "command",
        func: "playVideo",
        args: [],
        id: frameID,
        channel: "widget"
      });
      videoFrame.contentWindow?.postMessage(message, "*");
    }
    initializeYoutube();
    return () => {
      videoFrameCleanUp();
      observerCleanUp();
      window.removeEventListener("message", onMessage);
      if (!isArtistPage || !("player" in window)) {
        return;
      }
      window.player.removeEventListener(
        "onStateChange",
        onYoutubeSongStateChange
      );
    };
  })();
})();

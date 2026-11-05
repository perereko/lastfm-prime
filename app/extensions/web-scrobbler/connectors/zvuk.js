"use strict";
(() => {
  // src/connectors/zvuk.ts
  Connector.playerSelector = '[class*="PlayerBar_playerContainer"]';
  Connector.currentTimeSelector = '[class*="ProgressBar_timerStart"]';
  Connector.getDuration = () => {
    const currentTime = Connector.getCurrentTime();
    if (!currentTime) {
      return null;
    }
    const progressElement = document.querySelector(
      '[class*="ProgressBar_progress__"]'
    );
    if (!progressElement) {
      return null;
    }
    const progressDecimal = (100 + Number(progressElement.style.transform.slice(11, -2))) / 100;
    return currentTime / progressDecimal;
  };
  Connector.useTabAudibleApi();
  Connector.useMediaSessionApi();
})();

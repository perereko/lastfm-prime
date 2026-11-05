"use strict";
(() => {
  // src/connectors/webhook-auth-dom-inject.ts
  setInterval(() => {
    if (window.wsState() === "ACCEPTED" /* Accepted */) {
      const search = new URLSearchParams(window.location.search);
      window.postMessage(
        {
          sender: "web-scrobbler",
          type: "confirmLogin",
          applicationName: search.get("applicationName"),
          userApiUrl: search.get("userApiUrl")
        },
        "*"
      );
      window.setWSState("CONFIRMED" /* Confirmed */);
    }
  }, 1e3);
})();

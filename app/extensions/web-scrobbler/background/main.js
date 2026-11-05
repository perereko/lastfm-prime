const At = "Disallowed", De = "Disabled", kt = "Error", vt = "Ignored", St = "Loading", Rt = "Playing", Et = "Paused", Tt = "Scrobbled", Lt = "Unknown", G = "Unsupported", xt = "Loved", Nt = "Unloved";
function ze(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
var re = { exports: {} }, Pt = re.exports, Ne;
function Ot() {
  return Ne || (Ne = 1, (function(s, e) {
    (function(t, a) {
      a(s);
    })(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : Pt, function(t) {
      if (!(globalThis.chrome && globalThis.chrome.runtime && globalThis.chrome.runtime.id))
        throw new Error("This script should only be loaded in a browser extension.");
      if (globalThis.browser && globalThis.browser.runtime && globalThis.browser.runtime.id)
        t.exports = globalThis.browser;
      else {
        const a = "The message port closed before a response was received.", r = (n) => {
          const g = {
            alarms: {
              clear: {
                minArgs: 0,
                maxArgs: 1
              },
              clearAll: {
                minArgs: 0,
                maxArgs: 0
              },
              get: {
                minArgs: 0,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            bookmarks: {
              create: {
                minArgs: 1,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getChildren: {
                minArgs: 1,
                maxArgs: 1
              },
              getRecent: {
                minArgs: 1,
                maxArgs: 1
              },
              getSubTree: {
                minArgs: 1,
                maxArgs: 1
              },
              getTree: {
                minArgs: 0,
                maxArgs: 0
              },
              move: {
                minArgs: 2,
                maxArgs: 2
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeTree: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            browserAction: {
              disable: {
                minArgs: 0,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              enable: {
                minArgs: 0,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              getBadgeBackgroundColor: {
                minArgs: 1,
                maxArgs: 1
              },
              getBadgeText: {
                minArgs: 1,
                maxArgs: 1
              },
              getPopup: {
                minArgs: 1,
                maxArgs: 1
              },
              getTitle: {
                minArgs: 1,
                maxArgs: 1
              },
              openPopup: {
                minArgs: 0,
                maxArgs: 0
              },
              setBadgeBackgroundColor: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setBadgeText: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setIcon: {
                minArgs: 1,
                maxArgs: 1
              },
              setPopup: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setTitle: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            browsingData: {
              remove: {
                minArgs: 2,
                maxArgs: 2
              },
              removeCache: {
                minArgs: 1,
                maxArgs: 1
              },
              removeCookies: {
                minArgs: 1,
                maxArgs: 1
              },
              removeDownloads: {
                minArgs: 1,
                maxArgs: 1
              },
              removeFormData: {
                minArgs: 1,
                maxArgs: 1
              },
              removeHistory: {
                minArgs: 1,
                maxArgs: 1
              },
              removeLocalStorage: {
                minArgs: 1,
                maxArgs: 1
              },
              removePasswords: {
                minArgs: 1,
                maxArgs: 1
              },
              removePluginData: {
                minArgs: 1,
                maxArgs: 1
              },
              settings: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            commands: {
              getAll: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            contextMenus: {
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeAll: {
                minArgs: 0,
                maxArgs: 0
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            cookies: {
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 1,
                maxArgs: 1
              },
              getAllCookieStores: {
                minArgs: 0,
                maxArgs: 0
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              set: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            devtools: {
              inspectedWindow: {
                eval: {
                  minArgs: 1,
                  maxArgs: 2,
                  singleCallbackArg: !1
                }
              },
              panels: {
                create: {
                  minArgs: 3,
                  maxArgs: 3,
                  singleCallbackArg: !0
                },
                elements: {
                  createSidebarPane: {
                    minArgs: 1,
                    maxArgs: 1
                  }
                }
              }
            },
            downloads: {
              cancel: {
                minArgs: 1,
                maxArgs: 1
              },
              download: {
                minArgs: 1,
                maxArgs: 1
              },
              erase: {
                minArgs: 1,
                maxArgs: 1
              },
              getFileIcon: {
                minArgs: 1,
                maxArgs: 2
              },
              open: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              pause: {
                minArgs: 1,
                maxArgs: 1
              },
              removeFile: {
                minArgs: 1,
                maxArgs: 1
              },
              resume: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              },
              show: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            extension: {
              isAllowedFileSchemeAccess: {
                minArgs: 0,
                maxArgs: 0
              },
              isAllowedIncognitoAccess: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            history: {
              addUrl: {
                minArgs: 1,
                maxArgs: 1
              },
              deleteAll: {
                minArgs: 0,
                maxArgs: 0
              },
              deleteRange: {
                minArgs: 1,
                maxArgs: 1
              },
              deleteUrl: {
                minArgs: 1,
                maxArgs: 1
              },
              getVisits: {
                minArgs: 1,
                maxArgs: 1
              },
              search: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            i18n: {
              detectLanguage: {
                minArgs: 1,
                maxArgs: 1
              },
              getAcceptLanguages: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            identity: {
              launchWebAuthFlow: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            idle: {
              queryState: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            management: {
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              getSelf: {
                minArgs: 0,
                maxArgs: 0
              },
              setEnabled: {
                minArgs: 2,
                maxArgs: 2
              },
              uninstallSelf: {
                minArgs: 0,
                maxArgs: 1
              }
            },
            notifications: {
              clear: {
                minArgs: 1,
                maxArgs: 1
              },
              create: {
                minArgs: 1,
                maxArgs: 2
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              getPermissionLevel: {
                minArgs: 0,
                maxArgs: 0
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            },
            pageAction: {
              getPopup: {
                minArgs: 1,
                maxArgs: 1
              },
              getTitle: {
                minArgs: 1,
                maxArgs: 1
              },
              hide: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setIcon: {
                minArgs: 1,
                maxArgs: 1
              },
              setPopup: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              setTitle: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              },
              show: {
                minArgs: 1,
                maxArgs: 1,
                fallbackToNoCallback: !0
              }
            },
            permissions: {
              contains: {
                minArgs: 1,
                maxArgs: 1
              },
              getAll: {
                minArgs: 0,
                maxArgs: 0
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              request: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            runtime: {
              getBackgroundPage: {
                minArgs: 0,
                maxArgs: 0
              },
              getPlatformInfo: {
                minArgs: 0,
                maxArgs: 0
              },
              openOptionsPage: {
                minArgs: 0,
                maxArgs: 0
              },
              requestUpdateCheck: {
                minArgs: 0,
                maxArgs: 0
              },
              sendMessage: {
                minArgs: 1,
                maxArgs: 3
              },
              sendNativeMessage: {
                minArgs: 2,
                maxArgs: 2
              },
              setUninstallURL: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            sessions: {
              getDevices: {
                minArgs: 0,
                maxArgs: 1
              },
              getRecentlyClosed: {
                minArgs: 0,
                maxArgs: 1
              },
              restore: {
                minArgs: 0,
                maxArgs: 1
              }
            },
            storage: {
              local: {
                clear: {
                  minArgs: 0,
                  maxArgs: 0
                },
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                set: {
                  minArgs: 1,
                  maxArgs: 1
                }
              },
              managed: {
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                }
              },
              sync: {
                clear: {
                  minArgs: 0,
                  maxArgs: 0
                },
                get: {
                  minArgs: 0,
                  maxArgs: 1
                },
                getBytesInUse: {
                  minArgs: 0,
                  maxArgs: 1
                },
                remove: {
                  minArgs: 1,
                  maxArgs: 1
                },
                set: {
                  minArgs: 1,
                  maxArgs: 1
                }
              }
            },
            tabs: {
              captureVisibleTab: {
                minArgs: 0,
                maxArgs: 2
              },
              create: {
                minArgs: 1,
                maxArgs: 1
              },
              detectLanguage: {
                minArgs: 0,
                maxArgs: 1
              },
              discard: {
                minArgs: 0,
                maxArgs: 1
              },
              duplicate: {
                minArgs: 1,
                maxArgs: 1
              },
              executeScript: {
                minArgs: 1,
                maxArgs: 2
              },
              get: {
                minArgs: 1,
                maxArgs: 1
              },
              getCurrent: {
                minArgs: 0,
                maxArgs: 0
              },
              getZoom: {
                minArgs: 0,
                maxArgs: 1
              },
              getZoomSettings: {
                minArgs: 0,
                maxArgs: 1
              },
              goBack: {
                minArgs: 0,
                maxArgs: 1
              },
              goForward: {
                minArgs: 0,
                maxArgs: 1
              },
              highlight: {
                minArgs: 1,
                maxArgs: 1
              },
              insertCSS: {
                minArgs: 1,
                maxArgs: 2
              },
              move: {
                minArgs: 2,
                maxArgs: 2
              },
              query: {
                minArgs: 1,
                maxArgs: 1
              },
              reload: {
                minArgs: 0,
                maxArgs: 2
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              removeCSS: {
                minArgs: 1,
                maxArgs: 2
              },
              sendMessage: {
                minArgs: 2,
                maxArgs: 3
              },
              setZoom: {
                minArgs: 1,
                maxArgs: 2
              },
              setZoomSettings: {
                minArgs: 1,
                maxArgs: 2
              },
              update: {
                minArgs: 1,
                maxArgs: 2
              }
            },
            topSites: {
              get: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            webNavigation: {
              getAllFrames: {
                minArgs: 1,
                maxArgs: 1
              },
              getFrame: {
                minArgs: 1,
                maxArgs: 1
              }
            },
            webRequest: {
              handlerBehaviorChanged: {
                minArgs: 0,
                maxArgs: 0
              }
            },
            windows: {
              create: {
                minArgs: 0,
                maxArgs: 1
              },
              get: {
                minArgs: 1,
                maxArgs: 2
              },
              getAll: {
                minArgs: 0,
                maxArgs: 1
              },
              getCurrent: {
                minArgs: 0,
                maxArgs: 1
              },
              getLastFocused: {
                minArgs: 0,
                maxArgs: 1
              },
              remove: {
                minArgs: 1,
                maxArgs: 1
              },
              update: {
                minArgs: 2,
                maxArgs: 2
              }
            }
          };
          if (Object.keys(g).length === 0)
            throw new Error("api-metadata.json has not been included in browser-polyfill");
          class p extends WeakMap {
            constructor(i, h = void 0) {
              super(h), this.createItem = i;
            }
            get(i) {
              return this.has(i) || this.set(i, this.createItem(i)), super.get(i);
            }
          }
          const y = (c) => c && typeof c == "object" && typeof c.then == "function", R = (c, i) => (...h) => {
            n.runtime.lastError ? c.reject(new Error(n.runtime.lastError.message)) : i.singleCallbackArg || h.length <= 1 && i.singleCallbackArg !== !1 ? c.resolve(h[0]) : c.resolve(h);
          }, k = (c) => c == 1 ? "argument" : "arguments", I = (c, i) => function(w, ...j) {
            if (j.length < i.minArgs)
              throw new Error(`Expected at least ${i.minArgs} ${k(i.minArgs)} for ${c}(), got ${j.length}`);
            if (j.length > i.maxArgs)
              throw new Error(`Expected at most ${i.maxArgs} ${k(i.maxArgs)} for ${c}(), got ${j.length}`);
            return new Promise((v, u) => {
              if (i.fallbackToNoCallback)
                try {
                  w[c](...j, R({
                    resolve: v,
                    reject: u
                  }, i));
                } catch (o) {
                  console.warn(`${c} API method doesn't seem to support the callback parameter, falling back to call it without a callback: `, o), w[c](...j), i.fallbackToNoCallback = !1, i.noCallback = !0, v();
                }
              else i.noCallback ? (w[c](...j), v()) : w[c](...j, R({
                resolve: v,
                reject: u
              }, i));
            });
          }, Y = (c, i, h) => new Proxy(i, {
            apply(w, j, v) {
              return h.call(j, c, ...v);
            }
          });
          let D = Function.call.bind(Object.prototype.hasOwnProperty);
          const U = (c, i = {}, h = {}) => {
            let w = /* @__PURE__ */ Object.create(null), j = {
              has(u, o) {
                return o in c || o in w;
              },
              get(u, o, m) {
                if (o in w)
                  return w[o];
                if (!(o in c))
                  return;
                let d = c[o];
                if (typeof d == "function")
                  if (typeof i[o] == "function")
                    d = Y(c, c[o], i[o]);
                  else if (D(h, o)) {
                    let z = I(o, h[o]);
                    d = Y(c, c[o], z);
                  } else
                    d = d.bind(c);
                else if (typeof d == "object" && d !== null && (D(i, o) || D(h, o)))
                  d = U(d, i[o], h[o]);
                else if (D(h, "*"))
                  d = U(d, i[o], h["*"]);
                else
                  return Object.defineProperty(w, o, {
                    configurable: !0,
                    enumerable: !0,
                    get() {
                      return c[o];
                    },
                    set(z) {
                      c[o] = z;
                    }
                  }), d;
                return w[o] = d, d;
              },
              set(u, o, m, d) {
                return o in w ? w[o] = m : c[o] = m, !0;
              },
              defineProperty(u, o, m) {
                return Reflect.defineProperty(w, o, m);
              },
              deleteProperty(u, o) {
                return Reflect.deleteProperty(w, o);
              }
            }, v = Object.create(c);
            return new Proxy(v, j);
          }, _ = (c) => ({
            addListener(i, h, ...w) {
              i.addListener(c.get(h), ...w);
            },
            hasListener(i, h) {
              return i.hasListener(c.get(h));
            },
            removeListener(i, h) {
              i.removeListener(c.get(h));
            }
          }), X = new p((c) => typeof c != "function" ? c : function(h) {
            const w = U(h, {}, {
              getContent: {
                minArgs: 0,
                maxArgs: 0
              }
            });
            c(w);
          }), Z = new p((c) => typeof c != "function" ? c : function(h, w, j) {
            let v = !1, u, o = new Promise((F) => {
              u = function(P) {
                v = !0, F(P);
              };
            }), m;
            try {
              m = c(h, w, u);
            } catch (F) {
              m = Promise.reject(F);
            }
            const d = m !== !0 && y(m);
            if (m !== !0 && !d && !v)
              return !1;
            const z = (F) => {
              F.then((P) => {
                j(P);
              }, (P) => {
                let me;
                P && (P instanceof Error || typeof P.message == "string") ? me = P.message : me = "An unexpected error occurred", j({
                  __mozWebExtensionPolyfillReject__: !0,
                  message: me
                });
              }).catch((P) => {
                console.error("Failed to send onMessage rejected reply", P);
              });
            };
            return z(d ? m : o), !0;
          }), ee = ({
            reject: c,
            resolve: i
          }, h) => {
            n.runtime.lastError ? n.runtime.lastError.message === a ? i() : c(new Error(n.runtime.lastError.message)) : h && h.__mozWebExtensionPolyfillReject__ ? c(new Error(h.message)) : i(h);
          }, te = (c, i, h, ...w) => {
            if (w.length < i.minArgs)
              throw new Error(`Expected at least ${i.minArgs} ${k(i.minArgs)} for ${c}(), got ${w.length}`);
            if (w.length > i.maxArgs)
              throw new Error(`Expected at most ${i.maxArgs} ${k(i.maxArgs)} for ${c}(), got ${w.length}`);
            return new Promise((j, v) => {
              const u = ee.bind(null, {
                resolve: j,
                reject: v
              });
              w.push(u), h.sendMessage(...w);
            });
          }, se = {
            devtools: {
              network: {
                onRequestFinished: _(X)
              }
            },
            runtime: {
              onMessage: _(Z),
              onMessageExternal: _(Z),
              sendMessage: te.bind(null, "sendMessage", {
                minArgs: 1,
                maxArgs: 3
              })
            },
            tabs: {
              sendMessage: te.bind(null, "sendMessage", {
                minArgs: 2,
                maxArgs: 3
              })
            }
          }, l = {
            clear: {
              minArgs: 1,
              maxArgs: 1
            },
            get: {
              minArgs: 1,
              maxArgs: 1
            },
            set: {
              minArgs: 1,
              maxArgs: 1
            }
          };
          return g.privacy = {
            network: {
              "*": l
            },
            services: {
              "*": l
            },
            websites: {
              "*": l
            }
          }, U(n, se, g);
        };
        t.exports = r(chrome);
      }
    });
  })(re)), re.exports;
}
var Ct = Ot();
const b = /* @__PURE__ */ ze(Ct), Be = "*", It = "[hidden]", Ut = 50;
function C(s, e = "log") {
  const t = console[e];
  if (typeof t != "function")
    throw new TypeError(`Unknown log type: ${e}`);
  t(s);
}
function Pe(s, e) {
  if (s && e) {
    const t = Be.repeat(s.length);
    return e.replace(s, t);
  }
  return e;
}
function qe(s) {
  return s ? typeof s == "string" ? Be.repeat(s.length) : Array.isArray(s) ? `[Array(${s.length})]` : It : s === null ? "null" : s?.toString() ?? "undefined";
}
function M(s, e) {
  return new Promise((t, a) => {
    const r = setTimeout(() => {
      a(new Error("promise timeout"));
    }, s);
    e.then(
      (n) => {
        clearTimeout(r), t(n);
      },
      (n) => {
        clearTimeout(r), a(n);
      }
    );
  });
}
function _t() {
  return !!(!self.window || (location.href.startsWith("safari-web-extension") || location.href.startsWith("moz-extension")) && location.href.endsWith("generated_background_page.html"));
}
async function Fe(s) {
  const e = await fetch(s, {
    method: "GET"
  });
  return e.ok ? e.text() : null;
}
class Mt {
  events = /* @__PURE__ */ new Map();
  /**
   * Attach event listener
   *
   * @param event - event to listen to
   * @param fn - callback function
   */
  on(e, t) {
    const a = this.events.get(e) || [];
    this.events.set(e, [...a, t]);
  }
  /**
   * Disconnect event listener
   *
   * @param event - event to disconnect from
   * @param fn - callback function to disconnect
   */
  off(e, t) {
    const a = this.events.get(e) || [];
    this.events.set(
      e,
      a.filter((r) => r !== t)
    );
  }
  /**
   * Emit event
   *
   * @param event - event type to emit
   * @param args - arguments to pass to callback functions
   */
  emit(e, ...t) {
    for (const a of this.events.get(e) || [])
      a(...t);
  }
}
var f = /* @__PURE__ */ ((s) => (s.RESULT_OK = "ok", s.RESULT_IGNORE = "ignored", s.ERROR_AUTH = "error-auth", s.ERROR_OTHER = "error-other", s))(f || {});
class Dt {
  queue = [];
  isActive = !1;
  shouldPrint = (b.storage.sync || b.storage.local).get("Options").then((e) => e.Options?.debugLoggingEnabled);
  /**
   * Enqueue a log message to be printed.
   * @param text - Debug message
   * @param logType - Log type
   */
  push(e, t) {
    this.queue.push({ text: e, logType: t }), this.start();
  }
  /**
   * Process the queue to print logs in order.
   */
  async start() {
    if (!this.isActive) {
      this.isActive = !0;
      try {
        for (let e = 0; e < 100 && this.queue.length > 0; e++) {
          const t = this.queue.shift();
          if (t && await this.shouldPrint) {
            const a = console[t.logType];
            if (typeof a != "function")
              throw new TypeError(
                `Unknown log type: ${t.logType}`
              );
            const r = `Web Scrobbler: ${t.text?.toString()}`;
            a(r);
          }
        }
        this.isActive = !1;
      } catch {
        this.isActive = !1;
      }
    }
  }
}
const zt = new Dt();
function S(s, e = "log") {
  zt.push(s, e);
}
function Bt(s, e) {
  for (const t of s)
    if (t[e] === f.RESULT_IGNORE)
      return "ignored";
  for (const t of s)
    if (t[e] !== f.RESULT_OK)
      return "error";
  return "success";
}
const Oe = 3e3;
class $e {
  // V extends DataModels[K], T extends Record<K, V>
  storage;
  namespace;
  requests = [];
  autoIncrement = 0;
  emitter = new Mt();
  /**
   * interval to ensure the locking doesnt get stuck permanently
   */
  interval = setInterval(() => {
    this.unlock();
  }, Oe);
  /**
   * @param storage - StorageArea object
   * @param namespace - Storage namespace
   */
  constructor(e, t) {
    this.storage = e, this.namespace = t;
  }
  unlock() {
    this.requests = this.requests.slice(1), this.emitter.emit("updateLock", this.requests[0]), clearInterval(this.interval), this.interval = setInterval(() => {
      this.unlock();
    }, Oe);
  }
  /**
   * Read data from storage, don't respect locking
   * @returns Storage data
   */
  async get() {
    try {
      const e = await this.storage.get(this.namespace);
      if (this.namespace in e)
        return e[this.namespace];
    } catch (e) {
      S(`StorageWrapper#get(${this.namespace}); ${e}`);
    }
    return null;
  }
  /**
   * Read data from storage, respect locking
   * @returns Storage data
   */
  async getLocking() {
    return await new Promise((t) => {
      const a = this.autoIncrement++;
      if (this.requests.push(a), this.requests[0] === a) {
        t(!0);
        return;
      }
      const r = (n) => {
        n === a && (t(!0), this.emitter.off("updateLock", r));
      };
      this.emitter.on("updateLock", r);
    }), this.get();
  }
  /**
   * Save data to storage, don't lock storage
   * @param data - Data to save
   */
  async set(e) {
    const t = {
      [this.namespace]: e
    };
    try {
      await this.storage.set(t);
    } catch (a) {
      S(`StorageWrapper#set(${this.namespace}); ${a}`);
    }
  }
  /**
   * Save data to storage, and lock storage
   * @param data - Data to save
   */
  async setLocking(e) {
    try {
      await this.set(e);
    } catch (t) {
      S(t, "warn");
    }
    this.unlock();
  }
  /**
   * Extend saved data by given one.
   * @param data - Data to add
   */
  async update(e) {
    const t = await this.getLocking(), a = Object.assign(t ?? {}, e);
    await this.setLocking(a);
  }
  /**
   * Log storage data to console output.
   * @param hiddenKeys - Array of keys should be hidden
   */
  /* istanbul ignore next */
  async debugLog(e = []) {
    const t = await this.get(), r = JSON.stringify(t, (n, g) => e.includes(n) ? qe(g) : g, 2);
    location?.protocol === "chrome-extension:" && S(`storage.${this.namespace} = ${r}`, "info");
  }
  /**
   * Clear storage.
   */
  async clear() {
    try {
      await this.storage.remove(this.namespace);
    } catch (e) {
      S(`StorageWrapper#remove(${this.namespace}); ${e}`);
    }
  }
}
const T = 0, B = 1, He = "Connectors", Ge = "ConnectorsOverrideOptions", Ke = "customPatterns", We = "Notifications", qt = "BlockedTags", Ft = "LocalCache", Je = "NativeScrobblerNotification", Ve = "Blocklists", Qe = "Options", ye = "StateManagement", je = "DisabledTabs", Ye = "RegexEdits", he = "ScrobbleCache", Xe = "Core", $t = {
  [He]: B,
  [Ge]: B,
  [Ke]: B,
  [We]: B,
  // make sure to update '@/core/util/debug' if you change this
  [Qe]: B,
  LastFM: T,
  LibreFM: T,
  ListenBrainz: T,
  Maloja: T,
  Webhook: T,
  Pleroma: T,
  [Je]: T,
  [Ve]: T,
  [Ft]: T,
  [Ye]: T,
  [he]: T,
  [qt]: T,
  [Xe]: T,
  [ye]: T,
  [je]: T
};
function L(s) {
  switch ($t[s]) {
    case B:
      return Gt(s);
    case T:
      return Ae(s);
    default:
      throw new Error(`Unknown storage namespace: ${s}`);
  }
}
function Ht(s) {
  return Ae(s);
}
function Ae(s) {
  const e = b.storage.local;
  return new $e(e, s);
}
function Gt(s) {
  const e = b.storage.sync || b.storage.local;
  return new $e(e, s);
}
async function N(s, e) {
  return b.tabs.sendMessage(s, e);
}
function E(s) {
  return (e) => e(s);
}
function Ze(...s) {
  b.runtime.onMessage.addListener(
    (e, t) => {
      let a = !1;
      for (const r of s) {
        const n = r((g) => {
          if (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            e.type === g.type
          )
            return a = !0, g.fn(
              // eslint-disable-next-line
              e.payload,
              t
            );
        });
        if (a)
          return Promise.resolve(n);
      }
    }
  );
}
async function Kt(s) {
  return b.runtime.sendMessage(s);
}
async function Wt(s) {
  return b.runtime.sendMessage(s);
}
const et = [
  {
    label: "YouTube",
    matches: ["*://www.youtube.com/*", "*://m.youtube.com/*"],
    js: "youtube.js",
    id: "youtube",
    usesBlocklist: !0
  },
  {
    label: "MySpace",
    matches: ["*://myspace.com/*"],
    js: "myspace.js",
    id: "myspace"
  },
  {
    label: "Bandcamp Daily",
    matches: ["*://daily.bandcamp.com/*"],
    js: "bandcamp-daily.js",
    id: "bandcamp-daily"
  },
  {
    label: "Bandcamp Embed",
    matches: ["*://*.bandcamp.com/EmbeddedPlayer/*"],
    js: "bandcamp-embed.js",
    id: "bandcamp-embed",
    allFrames: !0
  },
  {
    label: "Bandcamp",
    matches: ["*://*.bandcamp.com/*", "*://bandcamp.com/*"],
    js: "bandcamp.js",
    id: "bandcamp"
  },
  {
    label: "Buy Music Club",
    matches: ["*://www.buymusic.club/*"],
    js: "buymusicclub.js",
    id: "buymusicclub"
  },
  {
    label: "Pandora",
    matches: ["*://www.pandora.com/*"],
    js: "pandora.js",
    id: "pandora"
  },
  {
    label: "Pakartot",
    matches: ["*://www.pakartot.lt/*"],
    js: "pakartot.js",
    id: "pakartot"
  },
  {
    label: "Deezer",
    matches: ["*://www.deezer.com/*"],
    js: "deezer.js",
    id: "deezer"
  },
  {
    label: "WEFUNK Radio",
    matches: ["*://session.wefunkradio.com/*", "*://www.wefunkradio.com/*"],
    js: "wefunkradio.js",
    id: "wefunkradio"
  },
  {
    label: "SoundCloud",
    matches: ["*://soundcloud.com/*", "*://m.soundcloud.com/*"],
    js: "soundcloud.js",
    id: "soundcloud"
  },
  {
    label: "Amazon Music",
    matches: [
      "*://music.amazon.*/*",
      "*://www.amazon.*/gp/dmusic/cloudplayer/*"
    ],
    js: "amazon.js",
    id: "amazon"
  },
  {
    label: "Amazon Echo",
    matches: ["*://alexa.amazon.*/spa/*"],
    js: "amazon-alexa.js",
    id: "amazon-alexa"
  },
  {
    label: "Radio Vas3k Club",
    matches: ["https://radio.vas3k.club/*"],
    js: "vas3kradio.js",
    id: "vas3kradio"
  },
  {
    label: "VK",
    matches: ["*://vk.ru/*", "*://vk.com/*"],
    js: "vk.js",
    id: "vk"
  },
  {
    label: "iHeart",
    matches: ["*://*.iheart.com/*"],
    js: "iheart.js",
    id: "iheart"
  },
  {
    label: "Indie Shuffle",
    matches: ["*://www.indieshuffle.com/*"],
    js: "indieshuffle.js",
    id: "indieshuffle"
  },
  {
    label: "Tuba.FM",
    matches: ["*://fm.tuba.pl/*"],
    js: "tubafm.js",
    id: "tubafm"
  },
  {
    label: "Spotify Embed",
    matches: ["*://open.spotify.com/embed/*"],
    js: "spotify-embed.js",
    id: "spotify-embed",
    allFrames: !0
  },
  {
    label: "Spotify",
    matches: ["*://open.spotify.com/*"],
    js: "spotify.js",
    id: "spotify",
    hasNativeScrobbler: !0
  },
  {
    label: "Dandelion Radio",
    matches: ["*://www.dandelionradio.com/player.htm"],
    js: "dandelionradio.js",
    id: "dandelionradio"
  },
  {
    label: "SoGreatandPowerful",
    matches: ["*://sogreatandpowerful.com/*"],
    js: "sogreatandpowerful.js",
    id: "sogreatandpowerful"
  },
  {
    label: "Radio Cidade",
    matches: [
      "*://radiocidade.fm/player/*",
      "*://play.radiomania.com.br/*",
      "*://*.melodia.com.br/*",
      "*://jb.fm/player/*"
    ],
    js: "radiocidade.js",
    id: "radiocidade"
  },
  {
    label: "Radio Nova",
    matches: ["*://www.nova.fr/*"],
    js: "nova.js",
    id: "nova"
  },
  {
    label: "Радио Premium",
    matches: ["*://rpfm.ru/*"],
    js: "rpfm.js",
    id: "rpfm"
  },
  {
    label: "Focus@Will",
    matches: ["*://www.focusatwill.com/*"],
    js: "focusatwill.js",
    id: "focusatwill"
  },
  {
    label: "Subphonic (owncloud plugin)",
    matches: ["*://*/*/apps/subphonic/minisub/*"],
    js: "subphonic.js",
    id: "subphonic"
  },
  {
    label: "Nextcloud music",
    matches: ["*://*/apps/music/*"],
    js: "nextcloud-music.js",
    id: "nextcloud-music"
  },
  {
    label: "Digitally Imported",
    matches: ["*://www.di.fm/*"],
    js: "radiotunes.js",
    id: "di"
  },
  {
    label: "BBC Sounds",
    matches: ["*://*.bbc.co.uk/*"],
    js: "bbc-sounds.js",
    id: "bbc-sounds"
  },
  {
    label: "Gaana",
    matches: ["*://gaana.com/*"],
    js: "gaana.js",
    id: "gaana"
  },
  {
    label: "Яндекс.Музыка",
    matches: [
      "*://music.yandex.ru/*",
      "*://music.yandex.by/*",
      "*://music.yandex.kz/*",
      "*://music.yandex.ua/*",
      "*://music.yandex.com/*"
    ],
    js: "yandex-music.js",
    id: "yandex-music"
  },
  {
    label: "Plex",
    matches: [
      "*://*32400/web/*",
      "*://plex.tv/web/*",
      "*://*.plex.tv/web/*",
      "*://*.plex.tv/desktop*"
    ],
    js: "plex.js",
    id: "plex"
  },
  {
    label: "TuneIn",
    matches: ["*://tunein.com/*"],
    js: "tunein.js",
    id: "tunein"
  },
  {
    label: "Mixcloud Embed",
    matches: ["*://player-widget.mixcloud.com/*"],
    js: "mixcloud-embed.js",
    id: "mixcloud-embed",
    allFrames: !0
  },
  {
    label: "Mixcloud",
    matches: ["*://*.mixcloud.com/*"],
    js: "mixcloud.js",
    id: "mixcloud"
  },
  {
    label: "ReverbNation",
    matches: ["*://www.reverbnation.com/*"],
    js: "reverbnation.js",
    id: "reverbnation"
  },
  {
    label: "NRK Radio",
    matches: ["*://radio.nrk.no/*"],
    js: "nrk-radio.js",
    id: "nrk-radio"
  },
  {
    label: "Internet Archive",
    matches: ["*://archive.org/details/*"],
    js: "archive.js",
    id: "archive"
  },
  {
    label: "Odnoklassniki",
    matches: ["*://odnoklassniki.ru/*", "*://ok.ru/*"],
    js: "odnoklassniki.js",
    id: "odnoklassniki"
  },
  {
    label: "outrahora rádio",
    matches: ["*://*.outrahora.com/*"],
    js: "outrahora.js",
    id: "outrahora"
  },
  {
    label: "Overcast",
    matches: ["*://overcast.fm/*"],
    js: "overcast.js",
    id: "overcast"
  },
  {
    label: "Online Radio Box",
    matches: ["*://onlineradiobox.com/*", "*://p.onlineradiobox.com/*"],
    js: "onlineradiobox.js",
    id: "onlineradiobox"
  },
  {
    label: "163 Music",
    matches: ["*://music.163.com/*"],
    js: "163-music.js",
    id: "163-music"
  },
  {
    label: "Ambient Sleeping Pill",
    matches: ["*://ambientsleepingpill.com/"],
    js: "ambientsleepingpill.js",
    id: "ambientsleepingpill"
  },
  {
    label: "a.m. ambient",
    matches: ["*://amambient.com/"],
    js: "ambientsleepingpill.js",
    id: "amambient"
  },
  {
    label: "Tidal",
    matches: ["*://tidal.com/*"],
    js: "tidal.js",
    id: "tidal"
  },
  {
    label: "Hype Machine Featured Albums",
    matches: ["*://hypem.com/album/*"],
    js: "hypem-albums.js",
    id: "hypem-premieres"
  },
  {
    label: "Hype Machine",
    matches: ["*://hypem.com/*"],
    js: "hypem.js",
    id: "hypem"
  },
  {
    label: "J1 Radio",
    matches: [
      "*://www.j1fm.tokyo/player/*",
      "*://www.j1fm.tokyo/michi/player/*"
    ],
    js: "aiircom.js",
    id: "j1-radio"
  },
  {
    label: "JazzAndRain",
    matches: ["*://*.jazzandrain.com/*"],
    js: "jazzandrain.js",
    id: "jazzandrain"
  },
  {
    label: "AccuRadio",
    matches: ["*://www.accuradio.com/*"],
    js: "accuradio.js",
    id: "accuradio"
  },
  {
    label: "I Love Music",
    matches: ["*://ilovemusic.de/*"],
    js: "ilovemusic.js",
    id: "ilmovemusic"
  },
  {
    label: "Imusic.am",
    matches: ["*://imusic.am/*"],
    js: "imusic.am.js",
    id: "imusic.am"
  },
  {
    label: "Player.fm",
    matches: ["*://player.fm/*"],
    js: "player.fm.js",
    id: "player.fm"
  },
  {
    label: "Sound Test",
    matches: ["*://sndtst.com/*"],
    js: "sndtst.js",
    id: "sndtst"
  },
  {
    label: "RadioTunes",
    matches: ["*://www.radiotunes.com/*"],
    js: "radiotunes.js",
    id: "radiotunes"
  },
  {
    label: "RockRadio",
    matches: ["*://www.rockradio.com/*"],
    js: "radiotunes.js",
    id: "rockradio"
  },
  {
    label: "ClassicalRadio",
    matches: ["*://www.classicalradio.com/*"],
    js: "radiotunes.js",
    id: "classicalradio"
  },
  {
    label: "Audacy",
    matches: ["*://www.audacy.com/*"],
    js: "audacy.js",
    id: "audacy"
  },
  {
    label: "Audius",
    matches: ["*://audius.co/*"],
    js: "audius.js",
    id: "audius"
  },
  {
    label: "Jamendo",
    matches: ["*://www.jamendo.com/*"],
    js: "jamendo.js",
    id: "jamendo"
  },
  {
    label: "Bandzone.cz",
    matches: ["*://bandzone.cz/*"],
    js: "bandzone.cz.js",
    id: "bandzone.cz"
  },
  {
    label: "Music Player for Google Drive",
    matches: ["*://www.driveplayer.com/*"],
    js: "driveplayer.js",
    id: "driveplayer"
  },
  {
    label: "Kodi",
    js: "kodi.js",
    id: "kodi"
  },
  {
    label: "RMFON",
    matches: ["*://www.rmfon.pl/*"],
    js: "rmfon.js",
    id: "rmfon"
  },
  {
    label: "Radio 357",
    matches: ["*://radio357.pl/*"],
    js: "radio357.js",
    id: "radio357"
  },
  {
    label: "JazzRadio",
    matches: ["*://www.jazzradio.com/*"],
    js: "radiotunes.js",
    id: "jazzradio"
  },
  {
    label: "Zen Radio",
    matches: ["*://www.zenradio.com/*"],
    js: "radiotunes.js",
    id: "zenradio"
  },
  {
    label: "SomaFM",
    matches: ["*://somafm.com/player/*", "*://somafm.com/player24/*"],
    js: "somafm.js",
    id: "somafm"
  },
  {
    label: "Free Music Archive",
    matches: ["*://*.freemusicarchive.org/*"],
    js: "freemusicarchive.js",
    id: "freemusicarchive"
  },
  {
    label: "Reddit Music Player",
    matches: ["*://musicplayer.io/"],
    js: "redditmusicplayer.js",
    id: "redditmusicplayer"
  },
  {
    label: "Новое Радио",
    matches: ["*://www.novoeradio.by/*"],
    js: "novoeradio.js",
    id: "novoeradio"
  },
  {
    label: "Radio Paradise",
    matches: ["*://radioparadise.com/*"],
    js: "radioparadise.js",
    id: "radioparadise",
    allFrames: !0
  },
  {
    label: "Beatport",
    matches: ["*://www.beatport.com/*"],
    js: "beatport.js",
    id: "beatport"
  },
  {
    label: "FluxFM Berlin",
    matches: ["*://www.fluxfm.de/*"],
    js: "fluxfm.js",
    id: "fluxfm"
  },
  {
    label: "Noise FM",
    matches: ["*://noisefm.ru/*", "*://en.noisefm.ru/*"],
    js: "noisefm.js",
    id: "noisefm",
    allFrames: !0
  },
  {
    label: "WWOZ",
    matches: ["*://www.wwoz.org/listen/player/*"],
    js: "wwoz.js",
    id: "wwoz"
  },
  {
    label: "Sonerezh",
    matches: ["*://sonerezh.*/*", "*://*/*sonerezh*"],
    js: "sonerezh.js",
    id: "sonerezh"
  },
  {
    label: "Youradio",
    matches: ["*://www.youradio.cz/*"],
    js: "youradio.js",
    id: "youradio"
  },
  {
    label: "Nightwave Plaza",
    matches: ["*://plaza.one/*"],
    js: "plaza.js",
    id: "plaza"
  },
  {
    label: "Genie",
    matches: ["*://www.genie.co.kr/player/fPlayer*"],
    js: "genie.js",
    id: "genie"
  },
  {
    label: "Bugs",
    matches: ["*://music.bugs.co.kr/newPlayer*"],
    js: "bugs.js",
    id: "bugs"
  },
  {
    label: "openfm",
    matches: ["*://open.fm/*"],
    js: "openfm.js",
    id: "openfm"
  },
  {
    label: "Pinguin Radio",
    matches: ["*://pinguinradio.com/*"],
    js: "pinguinradio.js",
    id: "pinguinradio"
  },
  {
    label: "JioSaavn",
    matches: ["*://www.jiosaavn.com/*"],
    js: "jiosaavn.js",
    id: "jiosaavn"
  },
  {
    label: "Anghami",
    matches: ["*://*.anghami.com/*"],
    js: "anghami.js",
    id: "anghami"
  },
  {
    label: "Mail.ru Music",
    matches: ["*://my.mail.ru/music", "*://my.mail.ru/music/*"],
    js: "mail.ru.js",
    id: "mail.ru"
  },
  {
    label: "Emby/Jellyfin",
    matches: ["*://*8096/web/*", "*://*8920/web/*", "*://app.emby.media/*"],
    js: "emby.js",
    id: "emby"
  },
  {
    label: "Freegal Music",
    matches: ["*://*.freegalmusic.com/*"],
    js: "freegalmusic.js",
    id: "freegalmusic"
  },
  {
    label: "hoopla",
    matches: ["*://www.hoopladigital.com/*"],
    js: "hoopladigital.js",
    id: "hoopladigital"
  },
  {
    label: "MUSICat",
    // musicat.co/libraries
    matches: [
      "*://capitalcityrecords.ca/*",
      // EDMONTON PUBLIC LIBRARY
      "*://amplify817.org/*",
      // FORT WORTH PUBLIC LIBRARY
      "*://playback.spl.org/*",
      // THE SEATTLE PUBLIC LIBRARY
      "*://hum.slcpl.org/*",
      // SALT LAKE CITY PUBLIC LIBRARY
      "*://hclib.musicat.co/*",
      // HENNEPIN COUNTY LIBRARY
      "*://atxlibrary.musicat.co/*",
      // AUSTIN PUBLIC LIBRARY
      "*://librarymusicproject.com/*",
      // MULTNOMAH COUNTY LIBRARY
      "*://stacks.carnegielibrary.org/*",
      // CARNEGIE LIBRARY of PITTSBURGH
      "*://tracksmusiclibrary.org/*",
      // CHAPEL HILL PUBLIC LIBRARY
      "*://flipside.apl.org/*",
      // APPLETON PUBLIC LIBRARY
      "*://qcbeats.org/*",
      // DAVENPORT PUBLIC LIBRARY
      "*://boombox.nashvillepubliclibrary.org/*",
      // NASHVILLE PUBLIC LIBRARY
      "*://thebeathartford.co/*",
      // HARTFORD PUBLIC LIBRARY
      "*://records.lilaccitylocal.com/*",
      // SPOKANE PUBLIC LIBRARY
      "*://baybeats.sfpl.org/*",
      // SAN FRANCISCO PUBLIC LIBRARY
      "*://vibes.kdl.org/*",
      // KENT DISTRICT LIBRARY
      "*://blast.hmcpl.org/*",
      // HUNTSVILLE-MADISON COUNTY PUBLIC LIBRARY
      "*://music.lplks.org/*",
      // LAWRENCE PUBLIC LIBRARY
      "*://memphis.musicat.co/*",
      // MEMPHIS PUBLIC LIBRARIES
      "*://sawdustcitysounds.org/*",
      // L.E. PHILLIPS MEMORIAL PUBLIC LIBRARY
      "*://crescentcitysounds.org/*",
      // NEW ORLEANS PUBLIC LIBRARY
      "*://waves.tadl.org/*",
      // TRAVERSE AREA PUBLIC LIBARY
      "*://smllogjam.org/*",
      // SHREVE MEMORIAL LIBRARY
      "*://pimadesertstreams.org/*",
      // PIMA COUNTY PUBLIC LIBRARY
      "*://redstickrhythms.org/*"
      // EAST BATON ROUGE PARISH LIBRARY
    ],
    js: "musicat.js",
    id: "musicat"
  },
  {
    label: "Q-Dance",
    matches: ["*://www.q-dance.com/*"],
    js: "q-dance.js",
    id: "q-dance"
  },
  {
    label: "Listen.moe",
    matches: ["*://listen.moe/*"],
    js: "listen.moe.js",
    id: "listen.moe"
  },
  {
    label: "anime(bits)",
    matches: [
      "*://radio.animebits.moe/",
      "*://radio.animebits.moe/player/*"
    ],
    js: "animebits.js",
    id: "animebits"
  },
  {
    label: "ULTRA Production Radios",
    matches: [
      "*://www.nashe.ru/*",
      "*://www.rockfm.ru/*",
      "*://radiojazzfm.ru/*",
      "*://radioultra.ru/*"
    ],
    js: "ultraproduction.js",
    id: "ultraproduction"
  },
  {
    label: "Listen Live",
    matches: ["*://player.listenlive.co/*"],
    js: "listenlive.js",
    id: "listenlive"
  },
  {
    label: "Rayo",
    matches: [
      "*://hellorayo.co.uk/*/play/*",
      "*://hellorayo.co.uk/*/player/*"
    ],
    js: "planetradio.js",
    id: "planetradio"
  },
  {
    label: "RadioPlayer",
    matches: [
      "*://ukradioplayer.*/*",
      "*://radioplayer.*/*",
      // Generic patterns
      "*://*/radioplayer/*",
      "*://*/radio/player/",
      "*://*/*/radio/player/"
    ],
    js: "radioplayer.js",
    id: "radioplayer"
  },
  {
    label: "deltaradio",
    matches: ["*://www.deltaradio.de/*"],
    js: "deltaradio.de.js",
    id: "deltaradio.de"
  },
  {
    label: "Radio Bob",
    matches: ["*://*.radiobob.de/*"],
    js: "radiobob.js",
    id: "radiobob"
  },
  {
    label: "ByteFM",
    matches: ["*://www.byte.fm/*"],
    js: "byte.fm.js",
    id: "byte.fm"
  },
  {
    label: "Deutschlandfunk Nova",
    matches: ["*://www.deutschlandfunknova.de/*"],
    js: "deutschlandfunknova.js",
    id: "deutschlandfunknova"
  },
  {
    label: "QQ Music",
    matches: ["*://y.qq.com/*"],
    js: "qq-music.js",
    id: "qq-music"
  },
  {
    label: "QQ Video",
    matches: ["*://v.qq.com/x/*"],
    js: "qq-video.js",
    id: "qq-video"
  },
  {
    label: "Naver Vibe",
    matches: ["*://vibe.naver.com/*"],
    js: "naver-vibe.js",
    id: "naver-vibe"
  },
  {
    label: "Soribada",
    matches: ["*://www.soribada.com/*"],
    js: "soribada.js",
    id: "soribada"
  },
  {
    label: "Flo",
    matches: ["*://www.music-flo.com/*"],
    js: "music-flo.js",
    id: "music-flo"
  },
  {
    label: "Discogs",
    matches: ["*://www.discogs.com/*"],
    js: "youtube-embed.js",
    id: "youtube-embed",
    allFrames: !0
  },
  {
    label: "NPR",
    matches: ["*://www.npr.org/*"],
    js: "npr.js",
    id: "npr"
  },
  {
    label: "Streemlion",
    matches: ["*://listen.streemlion.com/*"],
    js: "streemlion.js",
    id: "streemlion"
  },
  {
    label: "eMusic",
    matches: ["*://www.emusic.com/*"],
    js: "emusic.js",
    id: "emusic"
  },
  {
    label: "LyricsTraining",
    matches: ["*://lyricstraining.com/*"],
    js: "lyricstraining.js",
    id: "lyricstraining"
  },
  {
    label: "Music Walker",
    matches: ["*://musicwalker.app/*"],
    js: "musicwalker.js",
    id: "musicwalker"
  },
  {
    label: "radioeins",
    matches: ["*://www.radioeins.de/livestream/*"],
    js: "radioeins.js",
    id: "radioeins"
  },
  {
    label: "Fritz",
    matches: ["*://www.fritz.de/livestream/*"],
    js: "fritz.js",
    id: "fritz"
  },
  {
    label: "Musicoin",
    matches: ["*://musicoin.org/*"],
    js: "musicoin.js",
    id: "musicoin"
  },
  {
    label: "Phish.in",
    matches: ["*://phish.in/*"],
    js: "phish.in.js",
    id: "phish.in"
  },
  {
    label: "Rainwave",
    matches: [
      "*://rainwave.cc/*",
      "*://all.rainwave.cc/*",
      "*://game.rainwave.cc/*",
      "*://chiptune.rainwave.cc/*",
      "*://ocr.rainwave.cc/*",
      "*://covers.rainwave.cc/*"
    ],
    js: "rainwave.js",
    id: "rainwave"
  },
  {
    label: "Радиоволна.нет",
    matches: ["*://radiovolna.net/*"],
    js: "radiovolna.js",
    id: "radiovolna"
  },
  {
    label: "pCloud",
    matches: ["*://my.pcloud.com/*"],
    js: "pcloud.js",
    id: "pcloud"
  },
  {
    label: "JetSetRadio Live",
    matches: ["*://jetsetradio.live/*"],
    js: "jetsetradio.live.js",
    id: "jetsetradio.live"
  },
  {
    label: "Radio France",
    matches: ["*://www.radiofrance.fr/*"],
    js: "radiofrance.js",
    id: "radiofrance"
  },
  {
    label: "RemixRotation",
    matches: ["*://remixrotation.com/*"],
    js: "remixrotation.js",
    id: "remixrotation"
  },
  {
    label: "WFMU",
    matches: ["*://wfmu.org/*", "*://freeform.wfmu.org/*"],
    js: "wfmu.js",
    id: "wfmu"
  },
  {
    label: "SiriusXM",
    matches: [
      "*://www.siriusxm.com/*",
      "*://www.siriusxm.ca/*",
      "*://*.siriusxm.com/player/*"
    ],
    js: "siriusxm-player.js",
    id: "siriusxm-player"
  },
  {
    label: "1ting",
    matches: [
      "*://www.1ting.com/player/*",
      "*://www.1ting.com/p_*",
      "*://www.1ting.com/album*",
      "*://www.1ting.com/rand.php*",
      "*://www.1ting.com/day/*",
      "*://h5.1ting.com/*"
    ],
    js: "1ting.js",
    id: "1ting"
  },
  {
    label: "Douban Artists",
    matches: ["*://music.douban.com/artists/player/*"],
    js: "douban-artists.js",
    id: "douban-artists"
  },
  {
    label: "Kugou",
    matches: ["*://www.kugou.com/song/*"],
    js: "kugou.js",
    id: "kugou"
  },
  {
    label: "Gimme Radio",
    matches: [
      "*://gimmeradio.com/*",
      "*://www.gimmeradio.com/*",
      "*://gimmecountry.com/*",
      "*://www.gimmecountry.com/*",
      "*://gimmemetal.com/*",
      "*://www.gimmemetal.com/*"
    ],
    js: "gimmeradio.js",
    id: "gimmeradio"
  },
  {
    label: "9sky",
    matches: ["*://www.9sky.com/music*", "*://www.9sky.com/mv/detail*"],
    js: "9sky.js",
    id: "9sky"
  },
  {
    label: "Vagalume.FM",
    matches: ["*://vagalume.fm/*", "*://*.vagalume.com.br/*"],
    js: "vagalume.js",
    id: "vagalume"
  },
  {
    label: "Radiooooo",
    matches: ["*://app.radiooooo.com/*", "*://mobile.radiooooo.com/*"],
    js: "radiooooo.js",
    id: "radiooooo"
  },
  {
    label: "LetsLoop",
    matches: ["*://letsloop.com/*"],
    js: "letsloop.js",
    id: "letsloop"
  },
  {
    label: "mujRozhlas",
    matches: ["*://www.mujrozhlas.cz/*"],
    js: "mujrozhlas.js",
    id: "rozhlas"
  },
  {
    label: "blocSonic",
    matches: ["*://*.blocsonic.com/*"],
    js: "blocsonic.js",
    id: "blocsonic"
  },
  {
    label: "Resonate",
    matches: ["*://stream.resonate.coop/*"],
    js: "resonate.js",
    id: "resonate"
  },
  {
    label: "KEXP",
    matches: ["*://*.kexp.org/*"],
    js: "kexp.js",
    id: "kexp"
  },
  {
    label: "Hotmixradio.fr",
    matches: ["*://www.hotmixradio.fr/*"],
    js: "hotmixradio.js",
    id: "hotmixradio"
  },
  {
    label: "Aphex Twin",
    matches: ["*://aphextwin.warp.net/*"],
    js: "warp-aphextwin.js",
    id: "warp-aphextwin"
  },
  {
    label: "Zachary Seguin Music",
    matches: ["*://music.zacharyseguin.ca/*"],
    js: "musickit.js",
    id: "zacharyseguin"
  },
  {
    label: "Joox",
    matches: ["*://www.joox.com/*"],
    js: "joox.js",
    id: "joox"
  },
  {
    label: "Musish",
    matches: ["*://musi.sh/*"],
    js: "musickit.js",
    id: "musish"
  },
  {
    label: "1001tracklists",
    matches: ["*://www.1001tracklists.com/tracklist/*"],
    js: "1001tracklists.js",
    id: "1001tracklists"
  },
  {
    label: "YouTube Music",
    matches: ["*://music.youtube.com/*"],
    js: "youtube-music.js",
    id: "youtube-music"
  },
  {
    label: "Radiozenders.FM",
    matches: ["*://www.radiozenders.fm/*"],
    js: "radiozenders.js",
    id: "radiozenders"
  },
  {
    label: "Invidious",
    matches: ["*://*.invidio.us/*"],
    js: "invidious.js",
    id: "invidious"
  },
  {
    label: "Piped",
    matches: ["*://piped.video/*"],
    js: "piped.js",
    id: "piped"
  },
  {
    label: "Pretzel",
    matches: ["*://*.pretzel.rocks/*"],
    js: "pretzel.js",
    id: "pretzel"
  },
  {
    label: "Primordial Radio",
    matches: ["*://primordialradio.com/*"],
    js: "primordialradio.js",
    id: "primordialradio"
  },
  {
    label: "Radio Kyivstar",
    matches: ["*://radio.kyivstar.ua/*"],
    js: "kyivstar.js",
    id: "kyivstar"
  },
  {
    label: "Funkwhale",
    js: "funkwhale.js",
    id: "funkwhale"
  },
  {
    label: "Radio.co",
    matches: ["*://embed.radio.co/player/*"],
    js: "radioco.js",
    id: "radioco",
    allFrames: !0
  },
  {
    label: "R/a/dio",
    matches: ["*://r-a-d.io/*"],
    js: "r-a-d.io.js",
    id: "r-a-d.io"
  },
  {
    label: "Apple Music",
    matches: ["*://*music.apple.com/*"],
    js: "musickit.js",
    id: "apple-music"
  },
  {
    label: "Watch2Gether",
    matches: ["*://w2g.tv/*"],
    js: "watch2gether.js",
    id: "watch2gether"
  },
  {
    label: "Poolsuite",
    matches: ["*://poolsuite.net/*"],
    js: "poolsuite.js",
    id: "poolsuite"
  },
  {
    label: "GDS.FM",
    matches: ["*://www.gds.fm/*", "*://gds.fm/*"],
    js: "gds.fm.js",
    id: "gds"
  },
  {
    label: "RadioJavan",
    matches: ["*://play.radiojavan.com/*"],
    js: "radiojavan.js",
    id: "radiojavan"
  },
  {
    label: "Audiomack",
    matches: ["*://audiomack.com/*"],
    js: "audiomack.js",
    id: "audiomack"
  },
  {
    label: "Global Player",
    matches: ["*://www.globalplayer.com/*"],
    js: "globalplayer.js",
    id: "globalplayer"
  },
  {
    label: "The Current",
    matches: ["*://www.thecurrent.org/*"],
    js: "thecurrent.js",
    id: "thecurrent"
  },
  {
    label: "GRRIF",
    matches: ["*://*.grrif.ch/*"],
    js: "grrif.js",
    id: "grrif"
  },
  {
    label: "newgrounds",
    matches: ["*://www.newgrounds.com/audio*"],
    js: "newgrounds.js",
    id: "newgrounds"
  },
  {
    label: "Jango",
    matches: ["*://www.jango.com/*"],
    js: "jango.js",
    id: "jango"
  },
  {
    label: "Radio Record",
    matches: ["*://www.radiorecord.ru/*"],
    js: "radiorecord.js",
    id: "radiorecord"
  },
  {
    label: "Imago Radio",
    matches: ["*://*.imago.fm/*"],
    js: "imago.js",
    id: "imago"
  },
  {
    label: "Provoda.ch",
    matches: ["*://*.provoda.ch/*"],
    js: "provoda.ch.js",
    id: "provoda.ch"
  },
  {
    label: "Atomic Music Space",
    matches: ["*://stream.atomicmusic.space/*"],
    js: "atomicmusic.space.js",
    id: "atomicmusic.space"
  },
  {
    label: "The-radio.ru",
    matches: ["*://the-radio.ru/*"],
    js: "the-radio.ru.js",
    id: "the-radio.ru"
  },
  {
    label: "HQ Radio",
    matches: ["*://hqradio.ru/*"],
    js: "hqradio.js",
    id: "hqradio"
  },
  {
    label: "Smooth FM",
    matches: ["*://smoothfm.iol.pt/*"],
    js: "smoothfm.js",
    id: "smoothfm"
  },
  {
    label: "Relisten.net",
    matches: ["*://relisten.net/*"],
    js: "relisten.js",
    id: "relisten"
  },
  {
    label: "UpBeatRadio",
    matches: ["*://upbeatradio.net/*"],
    js: "upbeatradio.js",
    id: "upbeatradio"
  },
  {
    label: "Chillhop",
    matches: ["*://chillhop.com/*"],
    js: "chillhop.js",
    id: "chillhop"
  },
  {
    label: "Chillhop Radio",
    matches: ["*://app.chillhop.com/*"],
    js: "chillhop-radio.js",
    id: "chillhop-radio"
  },
  {
    label: "Shuffle",
    matches: ["*://shuffle.one/play*"],
    js: "shuffleone.js",
    id: "shuffleone"
  },
  {
    label: "JB FM",
    matches: ["*://jb.fm/player/*"],
    js: "jb.fm.js",
    id: "jbfm"
  },
  {
    label: "SECTOR Radio",
    matches: ["*://sectorradio.ru/*"],
    js: "sectorradio.js",
    id: "sectorradio"
  },
  {
    label: "LiveOne",
    matches: ["*://*.liveone.com/*"],
    js: "liveone.js",
    id: "liveone"
  },
  {
    label: "PocketCasts",
    matches: ["*://play.pocketcasts.com/*"],
    js: "pocketcasts.js",
    id: "pocketcasts"
  },
  {
    label: "Clyp",
    matches: ["*://clyp.it/*"],
    js: "clyp.js",
    id: "clyp"
  },
  {
    label: "RTBF Radio",
    matches: ["*://www.rtbf.be/radio/*"],
    js: "rtbf.js",
    id: "rtbf"
  },
  {
    label: "Musify",
    matches: ["*://*.musify.club/*"],
    js: "musify.js",
    id: "musify"
  },
  {
    label: "Radio Rethink",
    matches: ["*://www.radiorethink.com/*"],
    js: "radiorethink.js",
    id: "radiorethink"
  },
  {
    label: "SoundClick",
    matches: ["*://www.soundclick.com/*"],
    js: "soundclick.js",
    id: "soundclick"
  },
  {
    label: "Napster",
    matches: ["*://app.napster.com/*"],
    js: "napster.js",
    id: "napster"
  },
  {
    label: "abc.net.au",
    matches: ["*://www.abc.net.au/*/*live*/*"],
    js: "abc.net.au.js",
    id: "abcnetau"
  },
  {
    label: "JQBX",
    matches: ["*://app.jqbx.fm/*"],
    js: "jqbx.js",
    id: "jqbx"
  },
  {
    label: "Supla",
    matches: ["*://*.supla.fi/*"],
    js: "supla.js",
    id: "supla"
  },
  {
    label: "swr3",
    matches: ["*://www.swr3.de/*", "*://www.swr.de/*"],
    js: "swr3.js",
    id: "swr3"
  },
  {
    label: "Epidemic Sound",
    matches: ["*://*.epidemicsound.com/*"],
    js: "epidemicsound.js",
    id: "epidemicsound"
  },
  {
    label: "Rekt Network",
    matches: ["*://rekt.network/*"],
    js: "rekt.network.js",
    id: "rektnetwork"
  },
  {
    label: "Nightride FM",
    matches: ["*://nightride.fm/*"],
    js: "nightride.fm.js",
    id: "nightridefm"
  },
  {
    label: "Qobuz",
    matches: ["*://*.qobuz.com/*"],
    js: "qobuz.js",
    id: "qobuz"
  },
  {
    label: "TruckersFM",
    matches: ["*://*.truckers.fm/*"],
    js: "truckersfm.js",
    id: "truckersfm"
  },
  {
    label: "detektor.fm",
    matches: ["*://detektor.fm/*"],
    js: "detektorfm.js",
    id: "detektorfm"
  },
  {
    label: "iBroadcast",
    matches: ["*://media.ibroadcast.com/*"],
    js: "ibroadcast.js",
    id: "ibroadcast"
  },
  {
    label: "Radio7",
    matches: ["*://radio7.lv/*"],
    js: "radio7.js",
    id: "radio7lv"
  },
  {
    label: "Radio Nemiers",
    matches: ["*://radionemiers.com/*"],
    js: "radionemiers.js",
    id: "radionemiers"
  },
  {
    label: "Eggs",
    matches: ["*://eggs.mu/*"],
    js: "eggs.js",
    id: "eggs"
  },
  {
    label: "SubFire",
    matches: ["*://p.subfireplayer.net/*"],
    js: "subfire.js",
    id: "subfire"
  },
  {
    label: "Idagio",
    matches: ["*://app.idagio.com/*"],
    js: "idagio.js",
    id: "idagio"
  },
  {
    label: "Relax FM",
    matches: ["*://relax-fm.ru/*"],
    js: "relaxfm.js",
    id: "relaxfm"
  },
  {
    label: "Laut.fm",
    matches: ["*://laut.fm/*"],
    js: "laut.fm.js",
    id: "laut.fm"
  },
  {
    label: "Magnatune",
    matches: ["*://magnatune.com/*"],
    js: "magnatune.js",
    id: "magnatune"
  },
  {
    label: "Libre.fm",
    matches: ["*://libre.fm/*"],
    js: "librefm.js",
    id: "librefm"
  },
  {
    label: "Brain.fm",
    matches: ["*://my.brain.fm/*"],
    js: "brainfm.js",
    id: "brainfm"
  },
  {
    label: "bullofheaven.com",
    matches: ["*://bullofheaven.com/*"],
    js: "bullofheaven.com.js",
    id: "bullofheavencom"
  },
  {
    label: "All Classical Radio",
    matches: ["*://player.allclassical.org/*"],
    js: "allclassical.org.js",
    id: "allclassicalportland"
  },
  {
    label: "Migu Music",
    matches: ["*://music.migu.cn/*"],
    js: "migu-music.js",
    id: "migu-music"
  },
  {
    label: "Weibo",
    matches: ["*://weibo.com/*", "*://*.weibo.com/*"],
    js: "weibo.js",
    id: "weibo"
  },
  {
    label: "Street Voice",
    matches: ["*://www.streetvoice.cn/*", "*://streetvoice.com/*"],
    js: "streetvoice.js",
    id: "streetvoice"
  },
  {
    label: "Red Bull",
    matches: ["*://www.redbull.com/*"],
    js: "redbull.js",
    id: "redbull"
  },
  {
    label: "Synology",
    matches: [
      "*://*5000/*",
      "*://*5001/*",
      "*://*/?launchApp=SYNO.SDS.AudioStation.Application*"
    ],
    js: "synology.js",
    id: "synology"
  },
  {
    label: "Ragya",
    matches: ["*://www.ragya.com/*"],
    js: "ragya.js",
    id: "ragya"
  },
  {
    label: "CodeRadio",
    matches: ["*://coderadio.freecodecamp.org/*"],
    js: "coderadio.js",
    id: "coderadio"
  },
  {
    label: "LITT Live",
    matches: ["*://littlive.com/*"],
    js: "littlive.js",
    id: "dashradio"
  },
  {
    label: "Niconico",
    matches: ["*://www.nicovideo.jp/*"],
    js: "nicovideo.js",
    id: "nicovideo"
  },
  {
    label: "Звук",
    matches: ["*://zvuk.com/*"],
    js: "zvuk.js",
    id: "zvuk"
  },
  {
    label: "Navidrome",
    js: "navidrome.js",
    id: "navidrome"
  },
  {
    label: "LMS",
    js: "lms.js",
    id: "lms"
  },
  {
    label: "deepcut",
    matches: ["*://deepcut.live/*"],
    js: "deepcut.js",
    id: "deepcut.fm"
  },
  {
    label: "Burntable",
    matches: ["*://*.burntable.com/*"],
    js: "burntable.js",
    id: "burntable"
  },
  {
    label: "Stingray Music",
    matches: ["*://*.stingray.com/*"],
    js: "stingray.js",
    id: "stingray"
  },
  {
    label: "CBC Music",
    matches: ["*://www.cbc.ca/listen/cbc-music-playlists*"],
    js: "cbcmusic.js",
    id: "cbcmusic"
  },
  {
    label: "leanplayer",
    matches: ["*://*.leanplayer.com/*"],
    js: "leanplayer.js",
    id: "leanplayer"
  },
  {
    label: "Playlist Randomizer",
    matches: [
      "*://www.playlist-randomizer.com/*",
      "*://playlist-randomizer.com/*"
    ],
    js: "playlist-randomizer.js",
    id: "playlist-randomizer"
  },
  {
    label: "QueUp",
    matches: ["*://www.queup.net/*"],
    js: "queup.js",
    id: "queup"
  },
  {
    label: "SoundStack",
    matches: [
      "*://*.mystreamplayer.com/*",
      "*://player.gotradio.com/*",
      "*://player.live365.com/*",
      "*://player.181fm.com/*"
    ],
    js: "soundstack.js",
    id: "soundstack",
    allFrames: !0
  },
  {
    label: "Live365",
    matches: ["*://live365.com/*"],
    js: "live365.js",
    id: "live365"
  },
  {
    label: "Lounge.fm",
    matches: ["*://www.lounge.fm/*"],
    js: "lounge.fm.js",
    id: "lounge.fm"
  },
  {
    label: "EulerBeats",
    matches: ["*://eulerbeats.com/*"],
    js: "eulerbeats.js",
    id: "eulerbeats"
  },
  {
    label: "X-Team Radio",
    matches: ["*://radio.x-team.com/*"],
    js: "xteam-radio.js",
    id: "xteam-radio"
  },
  {
    label: "Calm",
    matches: ["*://*.calm.com/*"],
    js: "calm.js",
    id: "calm"
  },
  {
    label: "Keakie",
    matches: ["*://*.keakie.com/*"],
    js: "keakie.js",
    id: "keakie"
  },
  {
    label: "KKBOX",
    matches: ["*://*play.kkbox.com/*"],
    js: "kkbox.js",
    id: "kkbox"
  },
  {
    label: "Thrill Jockey",
    matches: ["*://thrilljockey.com/products/*"],
    js: "thrilljockey.js",
    id: "thrilljockey"
  },
  {
    label: "MediaStream",
    matches: [
      "*://sonarfm.cl/*",
      "*://playfm.cl/*",
      "*://player.wkmradio.com/*",
      "*://www.rockaxis.com/*"
    ],
    js: "mediastream.js",
    id: "mediastream"
  },
  {
    label: "Rock&Pop Chile",
    matches: ["*://www.rockandpop.cl/*"],
    js: "rockandpopcl.js",
    id: "rockandpopcl"
  },
  {
    label: "WYEP",
    matches: ["*://wyep.org/*"],
    js: "wyep.js",
    id: "wyep"
  },
  {
    label: "ZENO",
    matches: ["*://*zeno.fm/*"],
    js: "zeno.js",
    id: "zeno"
  },
  {
    label: "Naxos Music Library",
    matches: ["*://*.naxosmusiclibrary.com/*"],
    js: "naxosmusiclibrary.js",
    id: "naxosmusiclibrary"
  },
  {
    label: "Klassik Radio Plus",
    matches: ["*://klassikradioplus.de/*"],
    js: "klassikradioplus.js",
    id: "klassikradioplus"
  },
  {
    label: "Beetle",
    js: "beetle.js",
    id: "beetle"
  },
  {
    label: "RefNet",
    matches: ["*://listen.refnet.fm/*"],
    js: "refnet.js",
    id: "refnet"
  },
  {
    label: "La Radio du bord de l'eau",
    matches: ["*://*auborddeleau.radio/*"],
    js: "auborddeleau.radio.js",
    id: "auborddeleau.radio",
    allFrames: !0
  },
  {
    label: "Radio Willy",
    matches: ["*://*willy.radio/player/willy/*"],
    js: "willy.radio.js",
    id: "willy.radio"
  },
  {
    label: "NIGHT.FM",
    matches: ["*://*night.fm/*"],
    js: "night.fm.js",
    id: "night.fm"
  },
  {
    label: "Radio Nowy Swiat",
    matches: ["*://nowyswiat.online/*"],
    js: "nowyswiat.js",
    id: "nowyswiat"
  },
  {
    label: "Radiolla",
    matches: ["*://*radiolla.com/*"],
    js: "radiolla.js",
    id: "radiolla"
  },
  {
    label: "Oxigenio.fm",
    matches: ["*://*oxigenio.fm/*"],
    js: "oxigenio.fm.js",
    id: "oxigenio.fm"
  },
  {
    label: "Intergalactic FM",
    matches: ["*://*intergalactic.fm/*"],
    js: "intergalacticfm.js",
    id: "intergalactic.fm"
  },
  {
    label: "Irama Nusantara",
    matches: ["*://*.iramanusantara.org/*"],
    js: "iramanusantara.js",
    id: "iramanusantara"
  },
  {
    label: "Yammat FM",
    matches: ["*://*yammat.fm/*"],
    js: "yammat.fm.js",
    id: "yammat.fm"
  },
  {
    label: "Husk Recordings",
    matches: ["*://huskrecordings.com/music/*"],
    js: "huskrecordings.js",
    id: "huskrecordings"
  },
  {
    label: "nugs.net",
    matches: ["*://play.nugs.net/*"],
    js: "nugs.js",
    id: "nugs"
  },
  {
    label: "livephish.com",
    matches: ["*://plus.livephish.com/*"],
    js: "livephish.js",
    id: "livephish.com"
  },
  {
    label: "Ishkur's Guide to Electronic Music",
    matches: ["*://music.ishkur.com/*"],
    js: "ishkur.js",
    id: "music.ishkur.com"
  },
  {
    label: "Nonoki",
    matches: ["*://nonoki.com/music/*"],
    js: "nonoki.js",
    id: "nonoki"
  },
  {
    label: "Beatbump",
    matches: ["*://beatbump.io/*"],
    js: "beatbump.js",
    id: "beatbump"
  },
  {
    label: "LINE MUSIC",
    matches: ["*://music.line.me/*"],
    js: "line-music.js",
    id: "linemusic"
  },
  {
    label: "KCRW",
    matches: ["*://www.kcrw.com/*"],
    js: "kcrw.js",
    id: "kcrw"
  },
  {
    label: "World Fusion Radio",
    matches: ["*://worldfusionradio.com/*"],
    js: "worldfusionradio.js",
    id: "worldfusionradio"
  },
  {
    label: "Hardtunes",
    matches: [
      "*://www.hard-tunes.de/*",
      "*://www.hardtunes.com/*",
      "*://www.hardtunes.fr/*",
      "*://www.hardtunes.it/*",
      "*://www.hardtunes.nl/*"
    ],
    js: "hardtunes.js",
    id: "hardtunes"
  },
  {
    label: "KINK",
    matches: ["*://kink.nl/player", "*://kink.nl/player/*"],
    js: "kinknl.js",
    id: "kinknl"
  },
  {
    label: "The Jazz Groove",
    matches: ["*://jazzgroove.org/*"],
    js: "jazzgroove.js",
    id: "jazzgroove"
  },
  {
    label: "XRAY.FM",
    matches: ["*://*.xray.fm/*"],
    js: "xrayfm.js",
    id: "xrayfm"
  },
  {
    label: "DKFM Shoegaze Radio",
    matches: ["*://decayfm.com/*"],
    js: "decayfm.js",
    id: "decayfm"
  },
  {
    label: "QCIndie",
    matches: ["*://www.qcindie.com/listen-live/*"],
    js: "qcindie.js",
    id: "qcindie"
  },
  {
    label: "Colorado Public Radio",
    matches: ["*://www.cpr.org/*"],
    js: "cpr.js",
    id: "cpr"
  },
  {
    label: "WXPN",
    matches: ["*://xpn.org/*"],
    js: "xpn.js",
    id: "xpn"
  },
  {
    label: "FRISKY",
    matches: ["*://*.frisky.fm/*"],
    js: "friskyfm.js",
    id: "friskyfm"
  },
  {
    label: "LightningStream",
    matches: [
      "*://*.lightningstream.com/Player*",
      "*://*.lightningstream.com/player*"
    ],
    js: "lightningstream.js",
    id: "lightningstream"
  },
  {
    label: "Securenet Systems",
    matches: [
      "*://radio.securenetsystems.net/*",
      "*://stream*.securenetsystems.net/*"
    ],
    js: "securenetsystems.js",
    id: "securenetsystems"
  },
  {
    label: "uwu radio",
    matches: ["*://radio.uwu.network/*"],
    js: "uwu-radio.js",
    id: "uwu-radio"
  },
  {
    label: "Amazing Radio",
    matches: ["*://amazingradio.com/*", "*://amazingradio.us/*"],
    js: "amazingradio.js",
    id: "amazingradio"
  },
  {
    label: "DR Lyd",
    matches: ["*://www.dr.dk/lyd*"],
    js: "dr-lyd.js",
    id: "dr-lyd"
  },
  {
    label: "ROCK ANTENNE",
    matches: [
      "*://www.rockantenne.de/*",
      "*://www.rockantenne.bayern/*",
      "*://www.rockantenne.hamburg/*",
      "*://www.rockantenne.nrw/*",
      "*://www.rockantenne.at/*"
    ],
    js: "rockantenne.js",
    id: "rockantenne"
  },
  {
    label: "copyparty",
    matches: ["*://127.0.0.1:3923/*", "*://a.ocv.me/*"],
    js: "copyparty.js",
    id: "copyparty"
  },
  {
    label: "Radio Caprice",
    matches: ["*://radcap.ru/*"],
    js: "radcap.js",
    id: "radcap"
  },
  {
    label: "TrackerHub",
    matches: ["*://trackerhub.vercel.app/*", "*://trackerhub.cx/*"],
    js: "trackerhub.js",
    id: "trackerhub"
  },
  {
    label: "Gensokyo Radio",
    matches: ["*://gensokyoradio.net/*"],
    js: "gensokyoradio.js",
    id: "gensokyoradio"
  },
  {
    label: "Stationhead",
    matches: ["*://*stationhead.com/*"],
    js: "stationhead.js",
    id: "stationhead"
  },
  {
    label: "TECHNOBASE.FM",
    matches: [
      "*://*technobase.fm/*",
      "*://*housetime.fm/*",
      "*://*hardbase.fm/*",
      "*://*trancebase.fm/*",
      "*://*coretime.fm/*",
      "*://*clubtime.fm/*",
      "*://*teatime.fm/*",
      "*://*replay.fm/*"
    ],
    js: "technobase.fm.js",
    id: "technobase.fm"
  },
  {
    label: "Telegram A",
    matches: ["*://web.telegram.org/a/*"],
    js: "telegram-a.js",
    id: "telegram-a"
  },
  {
    label: "Telegram K",
    matches: ["*://web.telegram.org/k/*"],
    js: "telegram-k.js",
    id: "telegram-k"
  },
  {
    label: "TuneGenieEmbed",
    matches: ["*://b3.tunegenie.com/*"],
    js: "tunegenie-embed.js",
    id: "tunegenie-embed",
    allFrames: !0
  },
  {
    label: "TuneGenie",
    matches: ["*://*.tunegenie.com/*"],
    js: "tunegenie.js",
    id: "tunegenie"
  },
  {
    label: "RTL+ Musik",
    matches: ["*://plus.rtl.de/*"],
    js: "rtl-plus-musik.js",
    id: "rtl-plus-musik"
  },
  {
    label: "Tomorrowland",
    matches: ["*://www.tomorrowland.com/*"],
    js: "tomorrowland.js",
    id: "tomorrowland"
  },
  {
    label: "hearthis.at",
    matches: ["*://hearthis.at/*"],
    js: "hearthis-at.js",
    id: "hearthis-at"
  },
  {
    label: "Radio Italia",
    matches: ["*://www.radioitalia.it/*"],
    js: "radio-italia.js",
    id: "radio-italia"
  },
  {
    label: "Lyden av Norge",
    matches: ["*://www.lydenavnorge.no/*"],
    js: "lyden-av-norge.js",
    id: "lyden-av-norge"
  },
  {
    label: "audio.com",
    matches: ["*://audio.com/*"],
    js: "audio.js",
    id: "audio-com"
  },
  {
    label: "AfroCharts",
    matches: ["*://*.afrocharts.com/*"],
    js: "afrocharts.js",
    id: "afrocharts"
  },
  {
    label: "Ed Banger Records",
    matches: ["*://*.edbangerrecords.com/*"],
    js: "ed-banger-records.js",
    id: "ed-banger-records"
  },
  {
    label: "Hyperpipe",
    matches: ["*://hyperpipe.surge.sh/*"],
    js: "hyperpipe.js",
    id: "hyperpipe"
  },
  {
    label: "Radiofreccia",
    matches: ["*://play.rtl.it/live/*"],
    js: "radiofreccia.js",
    id: "radiofreccia"
  },
  {
    label: "khinsider",
    matches: ["*://downloads.khinsider.com/*"],
    js: "khinsider.js",
    id: "khinsider"
  },
  {
    label: "WDR",
    matches: ["*://*.wdr.de/radio/*"],
    js: "wdr.js",
    id: "wdr"
  },
  {
    label: "radio.de",
    matches: ["*://www.radio.de/*", "*://www.radio.net/*"],
    js: "radio.de.js",
    id: "radiode"
  },
  {
    label: "FMSpins",
    matches: ["*://*.fmspins.com/*"],
    js: "fmspins.js",
    id: "fmspins"
  },
  {
    label: "KissVK",
    matches: ["*://kissvk.top/*"],
    js: "kissvk.js",
    id: "kissvk"
  },
  {
    label: "Radio Student",
    matches: ["*://www.radiostudent.hr/*"],
    js: "radiostudent.js",
    id: "radiostudent"
  },
  {
    label: "BiliBili",
    matches: ["*://www.bilibili.com/*"],
    js: "bilibili.js",
    id: "bilibili",
    usesBlocklist: !0
  },
  {
    label: "jam.coop",
    matches: ["*://jam.coop/*"],
    js: "jam.coop.js",
    id: "jam.coop"
  },
  {
    label: "Zing MP3",
    matches: ["*://zingmp3.vn/*"],
    js: "zingmp3.js",
    id: "zingmp3"
  },
  {
    label: "NTS",
    matches: ["*://*nts.live/*"],
    js: "nts.js",
    id: "nts"
  },
  {
    label: "earth.fm",
    matches: ["*://earth.fm/*"],
    js: "earth.fm.js",
    id: "earthfm"
  },
  {
    label: "apt-get's auditorium",
    matches: ["*://tunes.apt-get.xyz/*"],
    js: "apt-get-tunes.js",
    id: "apt-get-tunes"
  },
  {
    label: "AzuraCast",
    js: "azuracast.js",
    id: "azuracast"
  },
  {
    label: "scrobblerad.io",
    matches: ["*://scrobblerad.io/*"],
    js: "scrobbleradio.js",
    id: "scrobbleradio"
  },
  {
    label: "VocaDB",
    matches: ["*://vocadb.net/*"],
    js: "vocadb.js",
    id: "vocadb"
  },
  {
    label: "UtaiteDB",
    matches: ["*://utaitedb.net/*"],
    js: "vocadb.js",
    id: "utaitedb"
  },
  {
    label: "TouhouDB",
    matches: ["*://touhoudb.com/*"],
    js: "vocadb.js",
    id: "touhoudb"
  },
  {
    label: "weareone.fm",
    matches: ["*://weareone.fm/*"],
    js: "weareone.js",
    id: "weareone"
  },
  {
    label: "Bollerwagen",
    matches: ["*://radiobollerwagen.de/*"],
    js: "bollerwagen.js",
    id: "bollerwagen"
  },
  {
    label: "МТС Музыка",
    matches: ["*://music.mts.ru/*"],
    js: "mts-music.js",
    id: "mts-music"
  },
  {
    label: "ChirpRadio",
    matches: ["*://chirpradio.org/*"],
    js: "chirpradio.js",
    id: "chirpradio"
  },
  {
    label: "OnlyHit",
    matches: ["*://onlyhit.us/*"],
    js: "onlyhit.js",
    id: "onlyhit"
  },
  {
    label: "InstantAudio",
    matches: [
      "*://instant.audio/*",
      // North America
      "*://radiosdecuba.com/*",
      "*://radio.ht/*",
      "*://jamaicaradio.net/*",
      "*://emisoras.com.mx/*",
      "*://radiosdepuertorico.com/*",
      "*://radios.com.do/*",
      "*://trinidadradiostations.net/*",
      // Central America
      "*://radios.co.cr/*",
      "*://radios.com.sv/*",
      "*://emisoras.com.gt/*",
      "*://radios.hn/*",
      "*://radios.co.ni/*",
      "*://radios.com.pa/*",
      // South America
      "*://radioarg.com/*",
      "*://radios.com.bo/*",
      "*://radiosaovivo.net/*",
      "*://emisora.cl/*",
      "*://radios.com.co/*",
      "*://radios.com.ec/*",
      "*://emisoras.com.py/*",
      "*://radios.com.pe/*",
      "*://surinaamseradio.com/*",
      "*://radios.com.uy/*",
      "*://radio.co.ve/*",
      // Europe
      "*://radiosonline.be/*",
      "*://ceskaradiaonline.cz/*",
      "*://radio.co.dk/*",
      "*://radiolisten.de/*",
      "*://raadiod.com/*",
      "*://emisora.org.es/*",
      "*://ecouterradioenligne.com/*",
      "*://radiofona.com.gr/*",
      "*://radios.hr/*",
      "*://ieradio.org/*",
      "*://ascoltareradio.com/*",
      "*://latvijasradio.com/*",
      "*://radios.lu/*",
      "*://radijas.org/*",
      "*://radiohallgatas.hu/*",
      "*://nederlandseradio.nl/*",
      "*://nettradionorge.com/*",
      "*://radios.co.at/*",
      "*://onlineradio.pl/*",
      "*://radioonline.com.pt/*",
      "*://radio.org.ro/*",
      "*://radiosonline.ch/*",
      "*://siradio.si/*",
      "*://radiostanice.rs/*",
      "*://nettiradiot.org/*",
      "*://radio.org.se/*",
      "*://internetradiouk.com/*",
      "*://bg-radio.org/*",
      "*://radio.pp.ru/*",
      "*://radioua.net/*",
      // Africa
      "*://radioalgerie.eu/*",
      "*://radio.co.cm/*",
      "*://radio.cd/*",
      "*://radio.co.ci/*",
      "*://radio.com.gh/*",
      "*://radio.or.ke/*",
      "*://radio.mg/*",
      "*://radio.co.ma/*",
      "*://egyptradio.net/*",
      "*://radio.org.ng/*",
      "*://radio.sn/*",
      "*://radiosa.org/*",
      "*://radiotunisienne.org/*",
      "*://radio.co.ug/*",
      // Asia
      "*://radio-bd.com/*",
      "*://radioonline.kr/*",
      "*://radios.hk/*",
      "*://onlineradios.in/*",
      "*://radioonline.co.id/*",
      "*://radioonline.my/*",
      "*://radionp.com/*",
      "*://jpradio.jp/*",
      "*://radio.net.pk/*",
      "*://radio.org.ph/*",
      "*://radiosingapore.org/*",
      "*://radio.com.lk/*",
      "*://vietnamradio.org/*",
      "*://radios.org.il/*",
      "*://radioth.net/*",
      "*://zhibo.fm/*",
      "*://radios.tw/*",
      // Oceania
      "*://radioau.net/*",
      "*://radio.org.nz/*"
    ],
    js: "instantaudio.js",
    id: "instantaudio"
  },
  {
    label: "Basspistol Radio",
    matches: ["*://*.basspistol.com/*"],
    js: "basspistol.js",
    id: "basspistol"
  },
  {
    label: "MyTuner",
    matches: ["*://mytuner-radio.com/*"],
    js: "mytuner.js",
    id: "mytuner"
  },
  {
    label: "Mirlo",
    matches: ["*://mirlo.space/*"],
    js: "mirlo.js",
    id: "mirlo"
  },
  {
    label: "Simulator Radio",
    matches: ["*://*.simulatorradio.com/*"],
    js: "simulatorradio.js",
    id: "simulatorradio"
  },
  {
    label: "Echo",
    matches: ["*://echo.sleepyfran.me/*"],
    js: "echo.js",
    id: "echo"
  },
  {
    label: "Gizz Tapes",
    matches: ["*://tapes.kglw.net/*"],
    js: "tapes-kglw.js",
    id: "tapes-kglw"
  },
  {
    label: "Systrum Sistum Radio",
    matches: ["*://systrum.net/*"],
    js: "systrum.js",
    id: "systrum"
  },
  {
    label: "cosine.club",
    matches: ["*://cosine.club/*"],
    js: "cosine.club.js",
    id: "cosine.club"
  },
  {
    label: "The Indie Beat Radio",
    matches: ["*://theindiebeat.fm/*"],
    js: "theindiebeat.js",
    id: "theindiebeat"
  },
  {
    label: "Musique Approximative",
    matches: ["*://*.musiqueapproximative.net/*"],
    js: "musiqueapproximative.js",
    id: "musiqueapproximative"
  },
  {
    label: "Suno AI",
    matches: ["*://suno.com/*"],
    js: "suno.js",
    id: "suno"
  },
  {
    label: "[untitled]",
    matches: ["*://untitled.stream/*"],
    js: "untitled.js",
    id: "[untitled]"
  },
  {
    label: "DAB Music Player",
    matches: ["*://dab.yeet.su/*", "*://dabmusic.xyz/*"],
    js: "dabmusic.js",
    id: "dabmusic"
  },
  {
    label: "GBS-FM",
    matches: ["*://gbs.fm/*"],
    js: "gbs.fm.js",
    id: "gbs"
  },
  {
    label: "Yumi Co. Radio",
    matches: ["*://yumicoradio.net/*"],
    js: "yumicoradio.js",
    id: "yumicoradio"
  },
  {
    label: "Kosmik Dstroyer",
    matches: ["*://kosmik-dstroyer.top/*"],
    js: "kosmik-dstroyer.js",
    id: "kosmik-dstroyer"
  },
  {
    label: "LaTeX 4000",
    matches: ["*://nonacademic.net/*"],
    js: "nonacademic.js",
    id: "nonacademic"
  },
  {
    label: "gravity.fm",
    matches: ["*://gravity.fm/*"],
    js: "gravity.fm.js",
    id: "gravity"
  },
  {
    label: "Archaic Horizon",
    matches: ["*://archaichorizon.com/*", "*://www.archaichorizon.com/*"],
    js: "archaichorizon.js",
    id: "archaichorizon"
  },
  {
    label: "Aonsoku",
    matches: ["*://aonsoku.vercel.app/*"],
    js: "aonsoku.js",
    id: "aonsoku"
  },
  {
    label: "CREAMER NATION",
    matches: ["*://creamernation.men/*"],
    js: "creamernation.js",
    id: "creamer-nation"
  },
  {
    label: "Feishin",
    matches: ["*://feishin.vercel.app/*"],
    js: "feishin.js",
    id: "feishin"
  },
  {
    label: "Ampwall",
    matches: ["*://ampwall.com/*"],
    js: "ampwall.js",
    id: "ampwall"
  },
  {
    label: "WQXR",
    matches: ["*://www.wqxr.org/*"],
    js: "wqxr.js",
    id: "wqxr"
  },
  {
    label: "Monochrome",
    matches: [
      "*://monochrome.prigoana.com/*",
      "*://monochrome.tf/*",
      "*://monochrome.samidy.com/*",
      "*://monochrome-back.pages.dev/*"
    ],
    js: "monochrome.js",
    id: "monochrome"
  },
  {
    label: "WeeklyBeats",
    matches: ["*://weeklybeats.com/*"],
    js: "weeklybeats.js",
    id: "weeklybeats"
  },
  {
    label: "XRaydio",
    matches: ["*://xraydio.net/*"],
    js: "xraydio.js",
    id: "xraydio"
  },
  {
    label: "Cytu.be",
    matches: ["*://cytu.be/r/*"],
    js: "cytu-be.js",
    id: "cytu-be"
  },
  {
    label: "Telegram Audio Player",
    matches: ["*://teleplay.rv7.nl/*"],
    js: "teleplay.js",
    id: "teleplay"
  },
  {
    label: "Subvert",
    matches: ["*://*.subvert.fm/*"],
    js: "subvert.js",
    id: "subvert"
  },
  {
    label: "Debrid Vault",
    matches: ["*://debridvault.elfhosted.com/*"],
    js: "debridvault.js",
    id: "debridvault"
  },
  {
    label: "Radio Swiss Classic",
    matches: [
      "*://www.radioswissclassic.ch/*",
      "*://www.radioswissjazz.ch/*",
      "*://www.radioswisspop.ch/*"
    ],
    js: "radioswissclassic.js",
    id: "radioswissclassic"
  },
  {
    label: "Rockserwis.fm",
    matches: ["*://rockserwis.fm/*"],
    js: "rockserwis.fm.js",
    id: "rockserwis.fm"
  },
  {
    label: "Bossa Jazz Brasil",
    matches: ["*://bossajazzbrasil.com/ouca-on-line/*"],
    js: "bossajazzbrazil.js",
    id: "bossajazzbrazil"
  },
  {
    label: "Kiss rádio",
    matches: ["*://www.kiss.cz/online/*"],
    js: "kiss.js",
    id: "kiss"
  },
  {
    label: "Radio SAW",
    matches: ["*://www.radiosaw.de/*"],
    js: "radiosaw.js",
    id: "radiosaw"
  },
  {
    label: "Radio SWH",
    matches: ["*://play.radioswh.lv/*"],
    js: "radioswh.js",
    id: "radioswh"
  },
  {
    label: "Star FM",
    matches: ["*://tv3.lv/starfm/online/*"],
    js: "starfm.js",
    id: "starfm"
  },
  {
    label: "bandwagon",
    matches: ["*://bandwagon.fm/*"],
    js: "bandwagon.js",
    id: "bandwagon"
  },
  {
    label: "Meloradio",
    matches: ["*://player.meloradio.pl/*"],
    js: "meloradio.js",
    id: "meloradio"
  },
  {
    label: "The Indie Beat Television",
    matches: ["*://tv.theindiebeat.fm/*"],
    js: "theindiebeat-owncast.js",
    id: "theindiebeat-tv"
  },
  {
    label: "escradio",
    matches: ["*://www.escradio.com/player/*"],
    js: "escradio.js",
    id: "escradio"
  },
  {
    label: "musicMe",
    matches: ["*://*.musicme.com/*"],
    js: "musicme.js",
    id: "musicme",
    allFrames: !0
  },
  {
    label: "zxART",
    matches: ["*://zxart.ee/*"],
    js: "zxart.js",
    id: "zxart"
  },
  {
    label: "DNA Lounge",
    matches: ["*://www.dnalounge.com/webcast/video.html"],
    js: "dnalounge.js",
    id: "dnalounge"
  },
  {
    label: "The Lot Radio",
    matches: ["*://www.thelotradio.com/shows/*"],
    js: "thelotradio.js",
    id: "thelotradio"
  },
  {
    label: "pixabay",
    matches: [
      "*://pixabay.com/music/*",
      "*://pixabay.com/users/*",
      "*://pixabay.com/playlists/*",
      "*://pixabay.com/accounts/playlists/*"
    ],
    js: "pixabay.js",
    id: "pixabay"
  },
  {
    label: "WPGU",
    matches: ["*://wpgu.com/*"],
    js: "wpgu.js",
    id: "wpgu"
  },
  {
    label: "Radyo Plyr",
    matches: ["*://radyovoyage.com/*", "*://radioeksen.com/*"],
    js: "radyoplyr.js",
    id: "radyoplyr"
  },
  {
    label: "SoundScout",
    matches: ["*://www.soundscout.com/player/*"],
    js: "soundscout.js",
    id: "soundscout"
  }
];
function tt(s) {
  return s.replace(/[$()*+.?[\\^{|}]/g, "\\$&");
}
function Ce(s) {
  return s.split("*").map(tt).join(".*");
}
function Jt(s) {
  if (typeof s != "string")
    return null;
  const e = /^(\*|https?):\/\/([^/]*)(\/.*)/.exec(s);
  if (!e)
    return null;
  const t = e[1], a = e[2], r = e[3];
  let n = "^";
  if (t === "*" ? n += "https?" : n += `${t}`, n += tt("://"), a === "*")
    n += "[^\\/]+";
  else if (a) {
    let g = a;
    a.startsWith("*.") && (n += "([^\\/]+\\.|)", g = g.substr(2)), n += Ce(g);
  } else
    return null;
  return n += Ce(r), n += "$", new RegExp(n);
}
function Vt(s, e) {
  const t = Jt(e);
  return t ? t.test(s) : !1;
}
const Qt = L(Ke);
function Yt() {
  return Qt.get();
}
async function ke(s) {
  const e = await Yt() || {};
  for (const t of et) {
    const a = t.matches || [];
    e[t.id] && a.push(...e[t.id]);
    for (const r of a)
      if (Vt(s, r))
        return t;
  }
  return null;
}
const H = L(Qe), ge = L(
  He
), st = L(
  Ge
), ve = "useNotifications", Se = "useUnrecognizedSongNotifications", at = "showInfobox", rt = "scrobblePodcasts", it = "autoToggleLove", ot = "forceRecognize", nt = "scrobbleRecognizedTracks", lt = "scrobbleEditedTracksOnly", Xt = "scrobblePercent", ne = "disabledConnectors", Zt = "debugLoggingEnabled", es = "albumGuessingDisabled", ts = "albumGuessingUneditedOnly", ss = "albumGuessingAllTracks", ct = {
  [ot]: !1,
  [rt]: !0,
  [ve]: !0,
  [Se]: !1,
  [nt]: !0,
  [lt]: !1,
  [Zt]: !1,
  [Xt]: Ut,
  [at]: !0,
  [it]: !0,
  [es]: !1,
  [ts]: !0,
  [ss]: !1,
  [ne]: {}
}, as = {
  [ot]: !1,
  [nt]: !0,
  [lt]: !1,
  [rt]: !0,
  [ve]: !0,
  [Se]: !1,
  [at]: !0,
  [it]: !0
}, be = {
  YouTube: {
    scrobbleMusicRecognisedOnly: !0,
    enableGetTrackInfoFromYtMusic: !0,
    scrobbleMusicOnly: !0,
    scrobbleEntertainmentOnly: !1
  }
};
async function rs() {
  const s = { ...ct, ...await H.get() };
  await H.set(s), H.debugLog([ne]);
  const e = {
    ...be,
    ...await ge.get()
  };
  for (const t in be) {
    const a = t;
    e[a] = {
      ...be[a],
      ...e[a]
    };
  }
  await ge.set(e), ge.debugLog(), st.debugLog();
}
async function is() {
  const s = await H.get();
  if (!s)
    throw new Error("No options data found");
  for (const e of Object.keys(s[ne])) {
    let t = !1;
    for (const a of et)
      if (a.id === e) {
        t = !0;
        break;
      }
    t || delete s[ne][e];
  }
}
async function dt(s, e) {
  if (ns(s), e !== void 0) {
    const a = await os(e, s);
    if (a !== void 0)
      return a;
  }
  return (await H.get())?.[s];
}
async function os(s, e) {
  return ls(e) ? (await st.get())?.[s]?.[e] : void 0;
}
function ns(s) {
  if (!(s in ct))
    throw new Error(`Unknown option key: ${s}`);
  return !0;
}
function ls(s) {
  return s in as;
}
rs().then(is);
class Re {
  /**
   * Get song artist.
   *
   * @returns Song artist
   */
  getArtist() {
    return this.processed.artist || this.parsed.artist;
  }
  /**
   * Get song title.
   *
   * @returns Song title
   */
  getTrack() {
    return this.processed.track || this.parsed.track;
  }
  /**
   * Get song album.
   *
   * @returns Song album
   */
  getAlbum() {
    return this.processed.album || this.parsed.album;
  }
  /**
   * Return song's album artist (Optional)
   * @returns Album artist
   */
  getAlbumArtist() {
    return this.processed.albumArtist || this.parsed.albumArtist;
  }
  /**
   * Returns song's processed or parsed duration in seconds.
   * Parsed duration (received from connector) is preferred.
   *
   * @returns Song duration
   */
  getDuration() {
    return this.parsed.duration || this.processed.duration;
  }
  /**
   * Return the track art URL associated with the song.
   * Parsed track art (received from connector) is preferred.
   *
   * @returns Track art URL
   */
  getTrackArt() {
    return this.parsed.trackArt || this.metadata.trackArtUrl || null;
  }
  /**
   * Get formatted "Artist - Track" string. Return null if song is empty.
   *
   * @returns Formatted string
   */
  getArtistTrackString() {
    return this.isEmpty() ? null : `${this.getArtist() ?? "undefined"} — ${this.getTrack() ?? "undefined"}`;
  }
  /**
   * Get song unique ID.
   *
   * @returns Unique ID
   */
  getUniqueId() {
    return this.parsed.uniqueID;
  }
  /**
   * Get song source URL.
   *
   * @returns source URL.
   */
  getOriginUrl() {
    return this.parsed.originUrl;
  }
  /**
   * Check if song is empty. Empty song means it's missing
   * either artist or track title.
   *
   * @returns True if song is empty; false otherwise
   */
  isEmpty() {
    return !(this.getArtist() && this.getTrack());
  }
  /**
   * Check if song is valid. The song means valid if it's known by
   * scrobbler service or is corrected by the user.
   *
   * @returns True if song is valid; false otherwise
   */
  isValid() {
    return this.flags.isValid || this.flags.isCorrectedByUser;
  }
  /**
   * Check if song equals another song.
   * @param song - Song instance to compare
   * @returns Check result
   */
  equals(e) {
    if (!e || !(e instanceof Re))
      return !1;
    const t = this.getUniqueId(), a = e.getUniqueId();
    return t || a ? t === a : this.getArtist() === e.getArtist() && this.getTrack() === e.getTrack() && this.getAlbum() === e.getAlbum();
  }
  /**
   * Get a string representing the song.
   *
   * @returns String representing the object.
   */
  toString() {
    return JSON.stringify(this, null, 2);
  }
  /**
   * Get song data to send it to different context.
   *
   * @returns Object contain song data
   */
  getCloneableData() {
    return {
      parsed: this.parsed,
      noRegex: this.noRegex,
      processed: this.processed,
      metadata: this.metadata,
      flags: this.flags,
      connector: this.connector
    };
  }
  /**
   * Set `Love` status of song.
   *
   * This function is supposed to be used by multiple scrobblers
   * (services). Each service can have different value of `Love` flag;
   * the behavior of the function is to set `Love` to true, if all
   * services have the song with `Love` set to true.
   * @param isLoved - Flag means song is loved or not
   * @param force - Force status assignment
   */
  setLoveStatus(e, t = !1) {
    if (t) {
      this.metadata.userloved = e;
      return;
    }
    e ? this.metadata.userloved === void 0 && (this.metadata.userloved = !0) : this.metadata.userloved = !1;
  }
  /**
   * Custom fields can be defined by user.
   */
  static get USER_FIELDS() {
    return ["artist", "track", "album", "albumArtist"];
  }
  /**
   * Fields used to identify song.
   */
  static get BASE_FIELDS() {
    return ["artist", "track", "album", "albumArtist"];
  }
  /**
   * Fields in a processed song.
   */
  static get PROCESSED_FIELDS() {
    return ["track", "album", "artist", "albumArtist", "duration"];
  }
}
var ie = { exports: {} }, cs = ie.exports, Ie;
function ds() {
  return Ie || (Ie = 1, (function(s) {
    (function(e) {
      function t(l, c) {
        var i = (l & 65535) + (c & 65535), h = (l >> 16) + (c >> 16) + (i >> 16);
        return h << 16 | i & 65535;
      }
      function a(l, c) {
        return l << c | l >>> 32 - c;
      }
      function r(l, c, i, h, w, j) {
        return t(a(t(t(c, l), t(h, j)), w), i);
      }
      function n(l, c, i, h, w, j, v) {
        return r(c & i | ~c & h, l, c, w, j, v);
      }
      function g(l, c, i, h, w, j, v) {
        return r(c & h | i & ~h, l, c, w, j, v);
      }
      function p(l, c, i, h, w, j, v) {
        return r(c ^ i ^ h, l, c, w, j, v);
      }
      function y(l, c, i, h, w, j, v) {
        return r(i ^ (c | ~h), l, c, w, j, v);
      }
      function R(l, c) {
        l[c >> 5] |= 128 << c % 32, l[(c + 64 >>> 9 << 4) + 14] = c;
        var i, h, w, j, v, u = 1732584193, o = -271733879, m = -1732584194, d = 271733878;
        for (i = 0; i < l.length; i += 16)
          h = u, w = o, j = m, v = d, u = n(u, o, m, d, l[i], 7, -680876936), d = n(d, u, o, m, l[i + 1], 12, -389564586), m = n(m, d, u, o, l[i + 2], 17, 606105819), o = n(o, m, d, u, l[i + 3], 22, -1044525330), u = n(u, o, m, d, l[i + 4], 7, -176418897), d = n(d, u, o, m, l[i + 5], 12, 1200080426), m = n(m, d, u, o, l[i + 6], 17, -1473231341), o = n(o, m, d, u, l[i + 7], 22, -45705983), u = n(u, o, m, d, l[i + 8], 7, 1770035416), d = n(d, u, o, m, l[i + 9], 12, -1958414417), m = n(m, d, u, o, l[i + 10], 17, -42063), o = n(o, m, d, u, l[i + 11], 22, -1990404162), u = n(u, o, m, d, l[i + 12], 7, 1804603682), d = n(d, u, o, m, l[i + 13], 12, -40341101), m = n(m, d, u, o, l[i + 14], 17, -1502002290), o = n(o, m, d, u, l[i + 15], 22, 1236535329), u = g(u, o, m, d, l[i + 1], 5, -165796510), d = g(d, u, o, m, l[i + 6], 9, -1069501632), m = g(m, d, u, o, l[i + 11], 14, 643717713), o = g(o, m, d, u, l[i], 20, -373897302), u = g(u, o, m, d, l[i + 5], 5, -701558691), d = g(d, u, o, m, l[i + 10], 9, 38016083), m = g(m, d, u, o, l[i + 15], 14, -660478335), o = g(o, m, d, u, l[i + 4], 20, -405537848), u = g(u, o, m, d, l[i + 9], 5, 568446438), d = g(d, u, o, m, l[i + 14], 9, -1019803690), m = g(m, d, u, o, l[i + 3], 14, -187363961), o = g(o, m, d, u, l[i + 8], 20, 1163531501), u = g(u, o, m, d, l[i + 13], 5, -1444681467), d = g(d, u, o, m, l[i + 2], 9, -51403784), m = g(m, d, u, o, l[i + 7], 14, 1735328473), o = g(o, m, d, u, l[i + 12], 20, -1926607734), u = p(u, o, m, d, l[i + 5], 4, -378558), d = p(d, u, o, m, l[i + 8], 11, -2022574463), m = p(m, d, u, o, l[i + 11], 16, 1839030562), o = p(o, m, d, u, l[i + 14], 23, -35309556), u = p(u, o, m, d, l[i + 1], 4, -1530992060), d = p(d, u, o, m, l[i + 4], 11, 1272893353), m = p(m, d, u, o, l[i + 7], 16, -155497632), o = p(o, m, d, u, l[i + 10], 23, -1094730640), u = p(u, o, m, d, l[i + 13], 4, 681279174), d = p(d, u, o, m, l[i], 11, -358537222), m = p(m, d, u, o, l[i + 3], 16, -722521979), o = p(o, m, d, u, l[i + 6], 23, 76029189), u = p(u, o, m, d, l[i + 9], 4, -640364487), d = p(d, u, o, m, l[i + 12], 11, -421815835), m = p(m, d, u, o, l[i + 15], 16, 530742520), o = p(o, m, d, u, l[i + 2], 23, -995338651), u = y(u, o, m, d, l[i], 6, -198630844), d = y(d, u, o, m, l[i + 7], 10, 1126891415), m = y(m, d, u, o, l[i + 14], 15, -1416354905), o = y(o, m, d, u, l[i + 5], 21, -57434055), u = y(u, o, m, d, l[i + 12], 6, 1700485571), d = y(d, u, o, m, l[i + 3], 10, -1894986606), m = y(m, d, u, o, l[i + 10], 15, -1051523), o = y(o, m, d, u, l[i + 1], 21, -2054922799), u = y(u, o, m, d, l[i + 8], 6, 1873313359), d = y(d, u, o, m, l[i + 15], 10, -30611744), m = y(m, d, u, o, l[i + 6], 15, -1560198380), o = y(o, m, d, u, l[i + 13], 21, 1309151649), u = y(u, o, m, d, l[i + 4], 6, -145523070), d = y(d, u, o, m, l[i + 11], 10, -1120210379), m = y(m, d, u, o, l[i + 2], 15, 718787259), o = y(o, m, d, u, l[i + 9], 21, -343485551), u = t(u, h), o = t(o, w), m = t(m, j), d = t(d, v);
        return [u, o, m, d];
      }
      function k(l) {
        var c, i = "", h = l.length * 32;
        for (c = 0; c < h; c += 8)
          i += String.fromCharCode(l[c >> 5] >>> c % 32 & 255);
        return i;
      }
      function I(l) {
        var c, i = [];
        for (i[(l.length >> 2) - 1] = void 0, c = 0; c < i.length; c += 1)
          i[c] = 0;
        var h = l.length * 8;
        for (c = 0; c < h; c += 8)
          i[c >> 5] |= (l.charCodeAt(c / 8) & 255) << c % 32;
        return i;
      }
      function Y(l) {
        return k(R(I(l), l.length * 8));
      }
      function D(l, c) {
        var i, h = I(l), w = [], j = [], v;
        for (w[15] = j[15] = void 0, h.length > 16 && (h = R(h, l.length * 8)), i = 0; i < 16; i += 1)
          w[i] = h[i] ^ 909522486, j[i] = h[i] ^ 1549556828;
        return v = R(w.concat(I(c)), 512 + c.length * 8), k(R(j.concat(v), 640));
      }
      function U(l) {
        var c = "0123456789abcdef", i = "", h, w;
        for (w = 0; w < l.length; w += 1)
          h = l.charCodeAt(w), i += c.charAt(h >>> 4 & 15) + c.charAt(h & 15);
        return i;
      }
      function _(l) {
        return unescape(encodeURIComponent(l));
      }
      function X(l) {
        return Y(_(l));
      }
      function Z(l) {
        return U(X(l));
      }
      function ee(l, c) {
        return D(_(l), _(c));
      }
      function te(l, c) {
        return U(ee(l, c));
      }
      function se(l, c, i) {
        return c ? i ? ee(c, l) : te(c, l) : i ? X(l) : Z(l);
      }
      s.exports ? s.exports = se : e.md5 = se;
    })(cs);
  })(ie)), ie.exports;
}
var us = ds();
const ms = /* @__PURE__ */ ze(us);
class gs {
  storageRef;
  constructor() {
    this.storageRef = null;
  }
  _init(e) {
    this.storageRef = e;
  }
  /**
   * Remove all data from the storage.
   */
  async clear() {
    if (this.storageRef)
      return await this.storageRef.clear();
  }
  /**
   * Return data from the storage.
   *
   * @returns Storage data
   */
  async getData() {
    return this.storageRef ? await this.storageRef.get() : (C("Storage reference is not initialized", "warn"), null);
  }
  /**
   * Overwrite a given data to the storage.
   *
   * @param data - Data to save
   * @returns Storage data
   */
  async saveData(e) {
    if (!this.storageRef) {
      C("Storage reference is not initialized", "warn");
      return;
    }
    return await this.storageRef.set(e);
  }
  /**
   * Append a given data in the storage.
   *
   * @param data - Data to save
   * @returns Storage data
   */
  async updateData(e) {
    if (!this.storageRef) {
      C("Storage reference is not initialized", "warn");
      return;
    }
    return await this.storageRef.update(e);
  }
}
function ut(s) {
  const e = Object.entries(s).reduce(
    (t, [a, r]) => (typeof r == "string" ? t[a] = r : typeof r == "number" ? t[a] = r.toString() : (typeof r > "u" || r === null) && (t[a] = ""), t),
    {}
  );
  return new URLSearchParams(e).toString();
}
async function bs() {
  return (await b.runtime.getPlatformInfo()).os;
}
async function hs() {
  return (await b.windows.getCurrent()).state === "fullscreen";
}
function Ue(s) {
  b.tabs.update(s, { active: !0 });
}
function fs() {
  return b.runtime.getManifest().version;
}
function q(s, e) {
  return b.i18n.getMessage(s, e);
}
const ps = [
  {
    search: {
      track: null,
      artist: null,
      album: "(.*) - Single",
      albumArtist: null
    },
    replace: {
      track: null,
      artist: null,
      album: "$1",
      albumArtist: null
    }
  },
  {
    search: {
      track: null,
      artist: null,
      album: "(.*) - EP",
      albumArtist: null
    },
    replace: {
      track: null,
      artist: null,
      album: "$1",
      albumArtist: null
    }
  }
];
async function ws() {
  const s = L(Ye);
  await s.get() || s.set(ps);
}
class ys extends gs {
  MAX_SCROBBLE_CACHE_SIZE = 1e3;
  /**
   * Replace the data for a scrobble in the scrobble cache
   *
   * @param id - ID of the scrobble to modify
   * @param scrobble - data to replace it with
   */
  async replaceScrobble(e, t) {
    const a = await this.getScrobbleCacheStorageLocking();
    if (a) {
      for (let r = 0; r < a.length; r++)
        a[r].id === e && (a[r] = {
          ...t,
          id: e
        });
      await this.saveScrobbleCacheToStorageLocking(a);
    }
  }
  /**
   * Save scrobble to the storage.
   *
   * @param scrobble - {@link CacheScrobbleData} to save
   *
   * @returns the id of the new scrobble
   */
  async pushScrobble(e) {
    const t = await this.getScrobbleCacheStorageLocking();
    if (t === null)
      return await this.saveScrobbleCacheToStorageLocking([
        {
          ...e,
          id: 1
        }
      ]), 1;
    const a = (t.at(-1)?.id ?? 0) + 1;
    return t.push({
      ...e,
      id: a
    }), await this.saveScrobbleCacheToStorageLocking(
      t.slice(-this.MAX_SCROBBLE_CACHE_SIZE)
    ), a;
  }
  async deleteScrobbles(e) {
    const t = await this.getScrobbleCacheStorageLocking();
    if (!t)
      return;
    const a = /* @__PURE__ */ new Map();
    for (const r of e)
      a.set(r, !0);
    await this.saveScrobbleCacheToStorageLocking(
      t.filter((r) => a.get(r.id) !== !0)
    );
  }
}
class js extends ys {
  scrobbleCacheStorage = this.getStorage();
  init() {
    this._init(
      Ae(he)
    );
  }
  /** @override */
  async getScrobbleCacheStorage() {
    return this.scrobbleCacheStorage.get();
  }
  /** @override */
  async getScrobbleCacheStorageLocking() {
    return this.scrobbleCacheStorage.getLocking();
  }
  /** @override */
  async saveScrobbleCacheToStorage(e) {
    return await this.scrobbleCacheStorage.set(e);
  }
  /** @override */
  async saveScrobbleCacheToStorageLocking(e) {
    return await this.scrobbleCacheStorage.setLocking(e);
  }
  /** @override */
  getStorage() {
    return L(he);
  }
}
const As = new js(), Ee = {
  [At]: !0,
  [Rt]: !0,
  [Et]: !0,
  [Tt]: !0,
  [St]: !0,
  [Lt]: !0,
  [vt]: !0,
  [kt]: !0,
  [xt]: !0,
  [Nt]: !0
};
L(je);
const J = L(ye), ks = L(Ve), A = {
  ENABLE_CONNECTOR: "enableConnector",
  DISABLE_CONNECTOR: "disableConnector",
  DISABLE_UNTIL_CLOSED: "disableUntilClosed",
  ENABLE_CHANNEL: "enableChannel",
  DISABLE_CHANNEL: "disableChannel"
};
async function vs(s, e) {
  if (!s)
    return [];
  const t = [];
  for (const r of s)
    t.push(e(r));
  const a = [];
  for (const [r, n] of (await Promise.all(t)).entries())
    n && a.push(s[r]);
  return a;
}
async function Te(s) {
  return vs(s, async (e) => {
    try {
      const t = await b.tabs.get(e.tabId);
      return await ke(t.url ?? ""), !0;
    } catch {
      return !1;
    }
  });
}
async function Ss(s) {
  return N(s, {
    type: "getChannelDetails",
    payload: void 0
  });
}
async function Rs(s, e) {
  const t = (await ks.get())?.[e.id];
  return !t || !t[s] ? null : t[s];
}
function Es() {
  return J.unlock();
}
async function K(s) {
  return J.setLocking(s);
}
async function Le(s, e) {
  const t = Ls(s);
  let a = e;
  a || (a = await le());
  const r = await Ts(a);
  return t && !Ee[r.mode] ? t : r;
}
async function Ts(s) {
  try {
    if (!await b.tabs.get(s))
      throw new Error("Tab not found");
    const t = await N(s, {
      type: "getConnectorDetails",
      payload: void 0
    });
    return {
      tabId: s,
      mode: t.mode,
      permanentMode: t.permanentMode,
      song: t.song
    };
  } catch {
    return {
      tabId: s,
      mode: G,
      permanentMode: G,
      song: null
    };
  }
}
function Ls(s) {
  for (const e of s)
    if (Ee[e.mode])
      return e;
  return null;
}
async function le() {
  const s = { active: !0, lastFocusedWindow: !0 }, [e] = await b.tabs.query(s);
  return e?.id ?? -1;
}
async function mt() {
  const s = await J.get() ?? xe;
  return Le(s.activeTabs);
}
async function ue() {
  return await J.getLocking() ?? xe;
}
async function xs() {
  return (await J.get())?.browserPreferredTheme ?? "light";
}
const xe = {
  activeTabs: [],
  browserPreferredTheme: "light"
};
function gt(s) {
  N(s, {
    type: "setConnectorState",
    payload: !1
  });
}
function bt(s) {
  N(s, {
    type: "setConnectorState",
    payload: !0
  });
}
function Ns(s) {
  N(s, {
    type: "addToBlocklist",
    payload: void 0
  });
}
function Ps(s) {
  N(s, {
    type: "removeFromBlocklist",
    payload: void 0
  });
}
function Os(s) {
  N(s, {
    type: "disableConnectorUntilTabIsClosed",
    payload: void 0
  });
}
class O extends Re {
  parsed;
  processed;
  noRegex;
  flags;
  metadata;
  connector;
  controllerTabId;
  constructor(e, t) {
    super(), this.parsed = e.parsed, this.processed = e.processed, this.noRegex = e.noRegex, this.flags = e.flags, this.metadata = e.metadata, this.connector = e.connector, this.controllerTabId = t;
  }
  resetData() {
    N(this.controllerTabId, {
      type: "resetData",
      payload: void 0
    });
  }
  resetInfo() {
    N(this.controllerTabId, {
      type: "resetInfo",
      payload: void 0
    });
  }
}
async function Cs(s) {
  Wt({
    type: "currentTab",
    payload: s
  }).catch((e) => {
    console.warn(e);
  }), await Is(s), Us(s);
}
async function Is(s) {
  if (s.mode === G) {
    b.contextMenus?.update(A.ENABLE_CONNECTOR, {
      visible: !1
    }), b.contextMenus?.update(A.DISABLE_CONNECTOR, {
      visible: !1
    }), b.contextMenus?.update(A.DISABLE_UNTIL_CLOSED, {
      visible: !1
    }), b.contextMenus?.update(A.DISABLE_CHANNEL, {
      visible: !1
    }), b.contextMenus?.update(A.ENABLE_CHANNEL, {
      visible: !1
    });
    return;
  }
  const e = await b.tabs.get(s.tabId), t = await ke(e.url ?? "");
  if (s.mode === De) {
    b.contextMenus?.update(A.ENABLE_CONNECTOR, {
      visible: !0,
      title: q("menuEnableConnector", t?.label)
    }), b.contextMenus?.update(A.DISABLE_CONNECTOR, {
      visible: !1
    }), b.contextMenus?.update(A.DISABLE_UNTIL_CLOSED, {
      visible: !1
    }), b.contextMenus?.update(A.DISABLE_CHANNEL, {
      visible: !1
    }), b.contextMenus?.update(A.ENABLE_CHANNEL, {
      visible: !1
    });
    return;
  }
  b.contextMenus?.update(A.ENABLE_CONNECTOR, {
    visible: !1
  }), b.contextMenus?.update(A.DISABLE_CONNECTOR, {
    visible: !0,
    title: q("menuDisableConnector", t?.label)
  }), b.contextMenus?.update(A.DISABLE_UNTIL_CLOSED, {
    visible: !0,
    title: q("menuDisableUntilTabClosed", t?.label)
  });
  const a = await Ss(s.tabId);
  !a || !a.channelInfo?.id || !a.connector ? (b.contextMenus?.update(A.DISABLE_CHANNEL, {
    visible: !1
  }), b.contextMenus?.update(A.ENABLE_CHANNEL, {
    visible: !1
  })) : await Rs(
    a.channelInfo.id,
    a.connector
  ) ? (b.contextMenus?.update(A.DISABLE_CHANNEL, {
    visible: !1
  }), b.contextMenus?.update(A.ENABLE_CHANNEL, {
    visible: !0,
    title: q("menuEnableChannel", a.channelInfo.label)
  })) : (b.contextMenus?.update(A.DISABLE_CHANNEL, {
    visible: !0,
    title: q("menuDisableChannel", a.channelInfo.label)
  }), b.contextMenus?.update(A.ENABLE_CHANNEL, {
    visible: !1
  }));
}
function ae(s) {
  const e = b.runtime.getURL(s);
  return e.startsWith("safari") ? s : e;
}
async function Us(s) {
  let e = "";
  if (s.song) {
    const r = new O(s.song, -1);
    e = `${r.getArtist()} - ${r.getTrack()}`;
  }
  const t = await _s(), a = (r) => `icons/action_${s.mode.toLowerCase()}_${r}_${t}.png`;
  b.action.setIcon({
    path: {
      16: ae(a(16)),
      19: ae(a(19)),
      32: ae(a(32)),
      38: ae(a(38))
    }
  }), b.action.setTitle({
    title: q(`pageAction${s.mode}`, e)
  });
}
async function _s() {
  return b.notifications ? xs() : "safari";
}
class Ms {
  storage = L(
    Je
  );
  /**
   * Add connector ID to list of connectors that has been notified about.
   *
   * @param id - ID of connector to add
   */
  async saveHasNotified(e) {
    if (!e)
      return;
    let t = await this.storage.getLocking();
    t || (t = {}), t[e] = !0, await this.storage.setLocking(t);
  }
  /**
   * @param id - ID of connector to check
   *
   * @returns true if notification has not been given for connector; false otherwise
   */
  async shouldNotifyAboutNativeScrobbler(e) {
    const t = await this.storage.get();
    return t ? !t[e] : !0;
  }
}
const Ds = b.runtime.getManifest(), zs = {
  type: "basic",
  iconUrl: b.runtime.getURL(Ds.icons?.["128"] ?? "")
}, ce = b.runtime.getURL("/img/cover_art_default.png"), Bs = b.runtime.getURL("img/cover_art_unknown.png"), qs = 5e3, W = {};
let oe = null;
async function Fs() {
  return b?.notifications ? await bs() === "mac" ? !await hs() : !0 : !1;
}
async function ht(s) {
  return dt(ve, s.id);
}
function $s(s, e) {
  W[s] = e;
}
function Hs(s) {
  W[s] && delete W[s];
}
async function V(s, e) {
  if (!await Fs())
    throw new Error("Notifications are not available");
  typeof e == "function" && (s.isClickable = !0);
  const t = {
    ...zs,
    ...s
  };
  let a;
  try {
    a = await b.notifications?.create(
      "",
      t
    );
  } catch (r) {
    if (t.iconUrl === ce)
      throw r;
    t.iconUrl = ce, a = await b.notifications?.create(
      "",
      t
    );
  }
  return typeof e == "function" && $s(a, e), a;
}
async function Gs(s) {
  const e = new Ms();
  if (!s.hasNativeScrobbler || !await e.shouldNotifyAboutNativeScrobbler(
    s.id
  ))
    return;
  const t = {
    title: b.i18n.getMessage(
      "notificationNativeScrobbler",
      s.label
    ),
    message: b.i18n.getMessage("notificationNativeScrobblerText")
  };
  try {
    await V(t, () => {
      b.tabs.create({
        url: b.runtime.getURL(
          "src/ui/options/index.html?p=connectors"
        )
      });
    }), await e.saveHasNotified(s.id);
  } catch (a) {
    S("Unable to show native scrobbler notification: ", "warn"), S(a, "warn");
  }
}
async function Ks(s, e, t) {
  if (!await ht(e))
    return;
  const a = s.metadata.label, r = s.getTrackArt() || ce;
  let n = s.getArtist(), g = s.getTrack();
  const p = s.getAlbum();
  p && (n = `${n ?? "null"}
${p}`);
  const y = s.metadata.userPlayCount;
  if (y) {
    const k = b.i18n.getMessage(
      "infoYourScrobbles",
      y.toString()
    );
    n = `${n ?? "null"}
${k}`;
  }
  const R = {
    iconUrl: r,
    title: g ?? "null",
    message: n ?? "null",
    silent: !0,
    contextMessage: a
  };
  ft(), oe = setTimeout(() => {
    V(R, t).then((k) => {
      s.metadata.notificationId = k;
    }).catch((k) => {
      S("Unable to show now playing notification: ", "warn"), S(k, "warn");
    });
  }, qs);
}
function Ws(s) {
  if (!s.metadata.notificationId)
    throw new Error("Notification ID is not set");
  ft(), ea(s.metadata.notificationId);
}
async function Js(s, e, t) {
  if (!await dt(
    Se,
    e.id
  ))
    return;
  const a = {
    iconUrl: Bs,
    title: b.i18n.getMessage("notificationNotRecognized"),
    message: b.i18n.getMessage("notificationNotRecognizedText")
  };
  try {
    const r = await V(a, t);
    s.metadata.notificationId = r;
  } catch (r) {
    S("Unable to show song not recognized notification: ", "warn"), S(r, "warn");
  }
}
const Vs = 3, fe = L(
  We
);
async function Qs() {
  return ((await fe.get())?.authDisplayCount || 0) < Vs;
}
async function Ys() {
  let s = await fe.get();
  s || (s = {
    authDisplayCount: 0
  }), s.authDisplayCount = s.authDisplayCount + 1, await fe.set(s);
}
async function Xs() {
  if (!await Qs())
    return;
  const s = {
    title: b.i18n.getMessage("notificationConnectAccounts"),
    message: b.i18n.getMessage("notificationConnectAccountsText")
  };
  try {
    await V(s, () => {
      b.tabs.create({
        url: b.runtime.getURL(
          "src/ui/options/index.html?p=accounts"
        )
      });
    });
  } catch (e) {
    S("Unable to show auth notification: ", "warn"), S(e, "warn"), b.tabs.create({
      url: b.runtime.getURL("src/ui/options/index.html?p=accounts")
    });
  }
  Ys();
}
async function Zs(s, e) {
  if (!await ht(s.connector))
    return;
  const t = s.getTrackArt() || ce, a = `${s.getTrack()}
${s.getArtist()}`, r = e ? b.i18n.getMessage("pageActionLoved", a) : b.i18n.getMessage("pageActionUnloved", a), n = {
    iconUrl: t,
    title: r,
    message: a
  };
  try {
    await V(n, null);
  } catch (g) {
    S("Unable to show loved notification: ", "warn"), S(g, "warn");
  }
}
function ea(s) {
  s && b.notifications?.clear(s);
}
function ft() {
  oe && (clearTimeout(oe), oe = null);
}
b.notifications?.onClicked.addListener((s) => {
  S(`Notification onClicked: ${s}`), W[s] && W[s](s);
});
b.notifications?.onClosed.addListener((s) => {
  Hs(s);
});
async function ta(s) {
  if (typeof s.id > "u")
    throw new Error(`Could not identify tab: ${JSON.stringify(s)}`);
  let e = s.url;
  if (typeof e > "u" && (e = await b.tabs.get(s.id).then((t) => t.url)), typeof e > "u")
    throw new Error(
      `Could not identify URL of tab: ${JSON.stringify(s)}`
    );
  return sa(s.id, e);
}
async function sa(s, e) {
  if (!await ke(e))
    return;
  b.scripting.executeScript({
    target: { tabId: s },
    files: ["content/main.js"]
  });
}
async function aa() {
  const s = await b.tabs?.query({});
  for (const e of s ?? [])
    try {
      await ta(e);
    } catch (t) {
      console.warn("Error while injecting into tab: ", t);
    }
}
class Q {
  storage;
  userApiUrl = null;
  userToken = null;
  arrayProperties = null;
  constructor() {
    this.storage = this.initStorage(), this.initUserProps(), Ze(
      E({
        type: "updateScrobblerProperties",
        fn: () => {
          this.initUserProps();
        }
      })
    );
  }
  /**
   * Get user property values.
   *
   * Each property is a property used internally in scrobblers.
   * Users can edit custom properties in the extension settings.
   */
  async getUserProperties() {
    const e = await this.storage.get();
    return !e || !("properties" in e) || !e.properties ? {} : e.properties;
  }
  /**
   * Apply user properties.
   *
   * Each property is a property used internally in scrobblers.
   * Users can edit custom properties in the extension settings.
   *
   * @param props - Object contains user properties
   */
  async applyUserProperties(e) {
    this.applyProps(e, this.getUserDefinedProperties());
    let t = await this.storage.get();
    if (t || (t = {}), !t) {
      C("No data in storage", "error");
      return;
    }
    if ((!("properties" in t) || t.properties === void 0) && (t.properties = {}), !("properties" in t) || t.properties === void 0) {
      C("No properties in storage", "error");
      return;
    }
    for (const a in e) {
      const r = e[a];
      r ? t.properties[a] = r : a in t.properties && delete t.properties[a];
    }
    await this.storage.set(t);
  }
  /**
   * Return a list of user-defined scrobbler properties.
   *
   * @returns a list of user-defined scrobbler properties.
   */
  getUserDefinedProperties() {
    return [];
  }
  /**
   * Return a list of user-defined scrobbler array properties.
   *
   * @returns a list of user-defined scrobbler array properties.
   */
  getUserDefinedArrayProperties() {
    return [];
  }
  /**
   * Get array property values
   *
   * Each property is a property used internally in scrobblers.
   * Users can add and remove custom array properties in the extension settings.
   */
  async getArrayProperties() {
    const e = await this.storage.get();
    return !e || !("arrayProperties" in e) || !e.arrayProperties ? [] : e.arrayProperties;
  }
  /**
   * Add array property values
   *
   * Each property is a property used internally in scrobblers.
   * Users can add and remove custom array properties in the extension settings.
   *
   * @param props - The properties to add to the array.
   */
  async addUserArrayProperties(e) {
    let t = await this.storage.get();
    if ((!t || !("arrayProperties" in t) || !t.arrayProperties) && (t = {
      arrayProperties: []
    }), !t || !("arrayProperties" in t) || !t.arrayProperties) {
      C("No data in storage", "error");
      return;
    }
    t.arrayProperties.push(e), this.applyArrayProps(
      t.arrayProperties,
      this.getUserDefinedArrayProperties()
    ), await this.storage.set(t);
  }
  /**
   * Apply array property values
   *
   * Replaces the property array with the one supplied in parameters.
   *
   * @param props - property values to apply
   */
  async applyUserArrayProperties(e) {
    let t = await this.storage.get();
    if ((!t || !("arrayProperties" in t) || !t.arrayProperties) && (t = {
      arrayProperties: []
    }), !t || !("arrayProperties" in t) || !t.arrayProperties) {
      C("No data in storage", "error");
      return;
    }
    t.arrayProperties = e, this.applyArrayProps(
      t.arrayProperties,
      this.getUserDefinedArrayProperties()
    ), await this.storage.set(t);
  }
  /**
   * Remove session info.
   */
  async signOut() {
    const e = await this.storage.get();
    if (!e) {
      C("No data in storage", "error");
      return;
    }
    "sessionID" in e && delete e.sessionID, "sessionName" in e && delete e.sessionName, "arrayProperties" in e && delete e.arrayProperties, await this.storage.set(e);
  }
  /**
   * Get URL to profile page.
   * @returns Profile URL
   */
  async getProfileUrl() {
    const { sessionName: e } = await this.getSession();
    return `${this.getBaseProfileUrl()}${e ?? "undefined"}`;
  }
  /** Scrobbler features. */
  /**
   * Check if service supports loving songs.
   * @returns True if service supports that; false otherwise
   */
  canLoveSong() {
    return !1;
  }
  /**
   * Check if service supports retrieving of song info.
   * @returns True if service supports that; false otherwise
   */
  canLoadSongInfo() {
    return !1;
  }
  /**
   * Apply filters over song object. Override if scrobbler requires custom global filtering.
   *
   * @param song - the song about to be dispatched
   * @returns updated song
   */
  applyFilter(e) {
    return e;
  }
  /** Constants */
  /**
   * Get timeout of all API requests in milliseconds.
   */
  get REQUEST_TIMEOUT() {
    return 15e3;
  }
  /** Misc */
  /**
   * Helper function to show debug output.
   * @param text - Debug message
   * @param logType - Log type
   */
  debugLog(e, t = "log") {
    const a = `${this.getLabel()}: ${e}`;
    C(a, t);
  }
  /** Internal functions */
  initStorage() {
    const e = ["token", "sessionID", "sessionName"];
    e.push(...this.getUserDefinedProperties());
    const t = Ht(this.getStorageName());
    return t.debugLog(e), t;
  }
  async initUserProps() {
    const e = await this.storage.get();
    if (e && "properties" in e)
      for (const t in e.properties)
        t === "userApiUrl" && "userApiUrl" in e.properties && (this.userApiUrl = e.properties.userApiUrl), t === "userToken" && "userToken" in e.properties && (this.userToken = e.properties.userToken);
    e && "arrayProperties" in e && (this.arrayProperties = e.arrayProperties ?? []);
  }
  applyProps(e, t) {
    for (const a in e) {
      if (!t.includes(a))
        throw new Error(`Unknown property: ${a}`);
      const r = e[a];
      if (r === void 0)
        throw new Error(`Property is not set: ${a}`);
      r && a in this ? this[a] = e[a] : a in this && delete this[a];
    }
  }
  applyArrayProps(e, t) {
    if (!e)
      throw new Error("No props passed to applyArrayProps()");
    if (e.length === 0) {
      this.arrayProperties = [];
      return;
    }
    for (const a of e)
      for (const [r, n] of Object.entries(a)) {
        if (!t.includes(r))
          throw new Error(`Unknown property: ${r}`);
        if (n === void 0)
          throw new Error(`Property is not set: ${r}`);
      }
    this.arrayProperties = e;
  }
}
class pt extends Q {
  isLocalOnly = !1;
  /** @override */
  async getAuthUrl() {
    const e = {
      method: "auth.gettoken"
    };
    let t = null, a = await this.storage?.get();
    try {
      t = (await this.sendRequest(
        { method: "GET" },
        e,
        !1
      )).token;
    } catch {
      throw this.debugLog("Error acquiring a token", "warn"), new Error("Error acquiring a token");
    }
    return a || (a = { token: t }), a.token = t, "sessionID" in a && delete a.sessionID, "sessionName" in a && delete a.sessionName, await this.storage.set(a), `${this.getBaseAuthUrl()}?api_key=${this.getApiKey()}&token=${t || ""}`;
  }
  /** @override */
  async getSession() {
    const e = await this.storage.get();
    if (!e)
      throw new Error(f.ERROR_AUTH);
    if (!("token" in e)) {
      if (!("sessionID" in e))
        throw new Error(f.ERROR_AUTH);
      return {
        sessionID: e.sessionID ?? "undefined",
        sessionName: e.sessionName
      };
    }
    const t = e.token || null;
    if (t !== null)
      try {
        const a = await this.tradeTokenForSession(t);
        return delete e.token, e.sessionID = a.sessionID, e.sessionName = a.sessionName, await this.storage.set(e), a;
      } catch {
        throw this.debugLog("Failed to trade token for session", "warn"), await this.signOut(), new Error(f.ERROR_AUTH);
      }
    return {
      sessionID: e.sessionID,
      sessionName: e.sessionName
    };
  }
  /** @override */
  async isReadyForGrantAccess() {
    const e = await this.storage.get();
    return !e || !("token" in e) ? !1 : !!e.token;
  }
  /** @override */
  async sendNowPlaying(e) {
    const { sessionID: t } = await this.getSession(), a = {
      method: "track.updatenowplaying",
      track: e.getTrack(),
      artist: e.getArtist(),
      sk: t
    };
    e.getAlbum() && (a.album = e.getAlbum()), e.getAlbumArtist() && (a.albumArtist = e.getAlbumArtist()), e.getDuration() && (a.duration = `${e.getDuration() ?? ""}`);
    const r = await this.sendRequest({ method: "POST" }, a);
    return this.processResponse(r);
  }
  /** @override */
  async sendPaused() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendResumedPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async scrobble(e) {
    const { sessionID: t } = await this.getSession(), a = {
      method: "track.scrobble",
      sk: t
    };
    for (const [g, p] of e.slice(0, 50).entries())
      a[`timestamp[${g}]`] = p.metadata.startTimestamp.toString(), a[`track[${g}]`] = p.getTrack(), a[`artist[${g}]`] = p.getArtist(), p.getAlbum() && (a[`album[${g}]`] = p.getAlbum()), p.getAlbumArtist() && (a[`albumArtist[${g}]`] = p.getAlbumArtist());
    const r = await this.sendRequest(
      { method: "POST" },
      a
    ), n = this.processResponse(r);
    if (n === f.RESULT_OK) {
      const g = r.scrobbles;
      if (g) {
        const p = g["@attr"].ignored;
        if (Number(p) === 0)
          return new Array(
            Math.min(e.length, 50)
          ).fill(f.RESULT_OK);
        if (!Array.isArray(g.scrobble))
          return new Array(
            Math.min(e.length, 50)
          ).fill(f.RESULT_IGNORE);
        const y = {};
        for (const [k, I] of e.entries())
          y[I.metadata.startTimestamp.toString()] = k;
        const R = new Array(Math.min(e.length, 50));
        for (const k of g.scrobble)
          R[y[k.timestamp]] = k.ignoredMessage.code === "0" ? f.RESULT_OK : f.RESULT_IGNORE;
      } else
        return new Array(
          Math.min(e.length, 50)
        ).fill(f.ERROR_OTHER);
    }
    return new Array(Math.min(e.length, 50)).fill(
      n
    );
  }
  /** @override */
  async toggleLove(e, t) {
    const { sessionID: a } = await this.getSession(), r = {
      method: t ? "track.love" : "track.unlove",
      track: e.getTrack(),
      artist: e.getArtist(),
      sk: a
    }, n = await this.sendRequest({ method: "POST" }, r);
    return this.processResponse(n);
  }
  /** @override */
  canLoveSong() {
    return !0;
  }
  /** Internal functions. */
  /**
   * Execute asynchronous request.
   *
   * API key will be added to params by default and all parameters will be
   * encoded for use in query string internally.
   *
   * @param  options - Fetch options
   * @param  params - Object of key =\> value url parameters
   * @param  signed - Should the request be signed?
   * @returns Parsed response
   */
  async sendRequest(e, t, a = !0) {
    const r = this.makeRequestUrl(t, a), n = fetch(r, e), g = this.REQUEST_TIMEOUT;
    let p = null, y = null;
    try {
      p = await M(g, n), y = await p.json();
    } catch {
      throw new Error(f.ERROR_OTHER);
    }
    const R = JSON.stringify(y, null, 2), k = ra(y, R);
    if (!p.ok)
      throw this.debugLog(`${t.method} response:
${k}`, "error"), "error" in y && y.error === 9 && (await this.signOut(), this.debugLog(
        "error 9 received, triggering signOut so that user grant access again."
      )), new Error(f.ERROR_OTHER);
    return this.debugLog(`${t.method} response:
${k}`), y;
  }
  /**
   * Make a call to API to trade token for session ID.
   * Assume the token was authenticated by the user.
   *
   * @param token - Token provided by scrobbler service
   * @returns Session data
   */
  async tradeTokenForSession(e) {
    const t = { method: "auth.getsession", token: e }, a = await this.sendRequest(
      { method: "GET" },
      t
    );
    if (this.processResponse(a) !== f.RESULT_OK)
      throw new Error(f.ERROR_AUTH);
    const n = a.session.name;
    return { sessionID: a.session.key, sessionName: n };
  }
  /**
   * Create URL of API request based on API params.
   * @param params - Object of key =\> value url parameters
   * @param signed - Should the request be signed?
   * @returns URL of API request
   */
  makeRequestUrl(e, t) {
    e.api_key = this.getApiKey(), e.format = "json", t && (e.api_sig = this.generateSign(e));
    const a = ut(e);
    return `${this.getApiUrl()}?${a}`;
  }
  /**
   * Compute string for signing request.
   * See http://www.last.fm/api/authspec#8
   * @param params - Parameters of API method
   * @returns Signed parameters
   */
  generateSign(e) {
    const t = Object.keys(e).sort();
    let a = "";
    for (const r of t)
      ["format", "callback"].includes(r) || (a += `${r}${e[r] || ""}`);
    return ms(a + this.getApiSecret());
  }
  /**
   * Process response and return service call result.
   * @param responseData - Response data
   * @returns Response result
   */
  processResponse(e) {
    return e.error ? f.ERROR_OTHER : f.RESULT_OK;
  }
}
function ra(s, e) {
  let t = e;
  const a = [s.token], r = s.session;
  r && (a.push(r.name), a.push(r.key));
  for (const n of a)
    typeof n == "string" ? t = Pe(n, t) : typeof n == "number" && (t = Pe(n.toString(), t));
  return t;
}
class ia extends pt {
  /** @override */
  getApiUrl() {
    return "https://ws.audioscrobbler.com/2.0/";
  }
  /** @override */
  getApiKey() {
    return "d9bb1870d3269646f740544d9def2c95";
  }
  /** @override */
  getApiSecret() {
    return "2160733a567d4a1a69a73fad54c564b2";
  }
  /** @override */
  getBaseAuthUrl() {
    return "https://www.last.fm/api/auth/";
  }
  /** @override */
  getBaseProfileUrl() {
    return "https://last.fm/user/";
  }
  /** @override */
  getId() {
    return "lastfm";
  }
  /** @override */
  getLabel() {
    return "Last.fm";
  }
  /** @override */
  getStatusUrl() {
    return "http://status.last.fm/";
  }
  /** @override */
  getStorageName() {
    return "LastFM";
  }
  /** @override */
  async getSongInfo(e) {
    const t = {
      track: e.getTrack(),
      artist: e.getArtist(),
      method: "track.getinfo"
    };
    try {
      const { sessionName: g } = await this.getSession();
      t.username = g;
    } catch {
    }
    e.getAlbum() && (t.album = e.getAlbum());
    const a = await this.sendRequest(
      { method: "GET" },
      t,
      !1
    );
    if (this.processResponse(a) !== f.RESULT_OK)
      throw new Error("Unable to load song info");
    const n = this.parseSongInfo(a);
    return this.canLoveSong() && n && N(e.controllerTabId, {
      type: "updateLove",
      payload: {
        isLoved: n.userloved || !1
      }
    }), n;
  }
  /** @override */
  canLoadSongInfo() {
    return !0;
  }
  /**
   * Parse service response and return parsed data.
   * @param responseData - Last.fm track.getInfo response data
   * @returns Parsed song info
   */
  parseSongInfo(e) {
    const t = {}, a = e.track, r = e.track.album, n = e.track.artist, g = a.userloved;
    if (g ? t.userloved = g === "1" : t.userloved = void 0, t.artist = n.name, t.artistUrl = n.url, t.track = a.name, t.trackUrl = a.url, t.duration = parseInt(a.duration) / 1e3 || null, r && (t.album = r.title, t.albumUrl = r.url, t.albumMbId = r.mbid, Array.isArray(r.image))) {
      const p = r.image.reduce(
        (R, k) => (R[k.size] = k["#text"], R),
        {}
      ), y = ["extralarge", "large", "medium"];
      for (const R of y) {
        const k = p[R];
        if (k) {
          t.trackArtUrl = k;
          break;
        }
      }
    }
    return t.userPlayCount = parseInt(a.userplaycount) || 0, t;
  }
  /** @override */
  applyFilter(e) {
    if (e.getAlbumArtist()) {
      const t = e.getAlbumArtist() || "";
      e.parsed.albumArtist = t.includes("Various Artists") ? "Various Artists" : t;
    }
    return e;
  }
}
class oa extends pt {
  /** @override */
  getApiUrl() {
    return "https://libre.fm/2.0/";
  }
  /** @override */
  getApiKey() {
    return "r8i1y91hz71tcx7vyrp9hk1alhqp1898";
  }
  /** @override */
  getApiSecret() {
    return "8187db5vg234yq6tm7o62q8mtl1niala";
  }
  /** @override */
  getBaseAuthUrl() {
    return "https://www.libre.fm/api/auth/";
  }
  /** @override */
  getBaseProfileUrl() {
    return "https://libre.fm/user/";
  }
  /** @override */
  getLabel() {
    return "Libre.fm";
  }
  /** @override */
  getStatusUrl() {
    return "";
  }
  /** @override */
  getStorageName() {
    return "LibreFM";
  }
  async getSongInfo() {
    return Promise.resolve({});
  }
  /** @override */
  sendRequest(e, t, a) {
    return e.method?.toLowerCase() === "post" && (e.headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    }, e.body = ut(t)), super.sendRequest(e, t, a);
  }
}
const na = "https://listenbrainz.org/settings/", pe = "https://api.listenbrainz.org/1", la = `${pe}/submit-listens`;
class ca extends Q {
  isLocalOnly = !1;
  async getSongInfo() {
    return Promise.resolve({});
  }
  /** @override */
  async getAuthUrl() {
    const e = await this.storage.get();
    let t;
    return e && "properties" in e && (t = e.properties), t ? await this.storage.set({ isAuthStarted: !0, properties: t }) : await this.storage.set({ isAuthStarted: !0 }), "https://listenbrainz.org/login/musicbrainz?next=%2Fsettings%2F";
  }
  /** @override */
  getBaseProfileUrl() {
    return "https://listenbrainz.org/user/";
  }
  /** @override */
  getLabel() {
    return "ListenBrainz";
  }
  /** @override */
  async getProfileUrl() {
    return this.userToken ? "" : await super.getProfileUrl();
  }
  /** @override */
  getStatusUrl() {
    return this.userToken ? "" : "https://listenbrainz.org/current-status";
  }
  /** @override */
  getStorageName() {
    return "ListenBrainz";
  }
  /** @override */
  getUserDefinedProperties() {
    return ["userApiUrl", "userToken"];
  }
  /** @override */
  async signOut() {
    (this.userApiUrl || this.userToken) && await this.applyUserProperties({
      userApiUrl: null,
      userToken: null
    }), await super.signOut();
  }
  /** @override */
  async getSession() {
    if (this.userToken)
      return { sessionID: this.userToken };
    const e = await this.storage.get();
    if (!e)
      throw this.debugLog("no data", "error"), await this.signOut(), new Error(f.ERROR_AUTH);
    if ("isAuthStarted" in e && e.isAuthStarted)
      try {
        const t = await this.requestSession();
        return e.sessionID = t.sessionID, e.sessionName = t.sessionName, delete e.isAuthStarted, await this.storage.set(e), t;
      } catch {
        throw this.debugLog("Failed to get session", "warn"), await this.signOut(), new Error(f.ERROR_AUTH);
      }
    else if (!("sessionID" in e) || !e.sessionID)
      throw new Error(f.ERROR_AUTH);
    return {
      sessionID: e.sessionID,
      sessionName: e.sessionName
    };
  }
  /** @override */
  async isReadyForGrantAccess() {
    if (this.userToken)
      return !1;
    const e = await this.storage.get();
    return !e || !("isAuthStarted" in e) ? !1 : e.isAuthStarted ?? !1;
  }
  /** @override */
  async sendNowPlaying(e) {
    const { sessionID: t } = await this.getSession(), r = {
      listen_type: "playing_now",
      payload: [
        {
          track_metadata: this.makeTrackMetadata(e)
        }
      ]
    };
    return this.sendScrobbleRequest(r, t);
  }
  /** @override */
  async sendPaused() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendResumedPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async scrobble(e, t) {
    const { sessionID: a } = await this.getSession(), r = {
      listen_type: t ? "single" : "import",
      payload: e.slice(0, 50).map((g) => ({
        listened_at: g.metadata.startTimestamp,
        track_metadata: this.makeTrackMetadata(g)
      }))
    }, n = await this.sendScrobbleRequest(r, a);
    return new Array(Math.min(e.length, 50)).fill(
      n
    );
  }
  /** @override */
  async toggleLove(e, t) {
    const a = e.getTrack(), r = e.getArtist();
    if (typeof a != "string" || typeof r != "string")
      throw new Error(
        `Invalid track ${JSON.stringify({ artist: r, track: a })}`
      );
    const n = new URLSearchParams({
      recording_name: a,
      artist_name: r
    });
    let g = {};
    try {
      g = await this.listenBrainzApi(
        "GET",
        `${pe}/metadata/lookup?${n.toString()}`,
        null,
        null
      );
    } catch {
    }
    if (this.debugLog(
      `lookup result: ${JSON.stringify(g, null, 2)}`
    ), !g.recording_mbid)
      return this.debugLog(
        `Could not lookup metadata for song: ${e.toString()}`
      ), {};
    const { sessionID: p } = await this.getSession(), y = {
      recording_mbid: g.recording_mbid,
      score: t ? 1 : 0
    }, R = await this.listenBrainzApi(
      "POST",
      `${pe}/feedback/recording-feedback`,
      y,
      p
    );
    return this.processResult(R);
  }
  /** @override */
  canLoveSong() {
    return !0;
  }
  /** Private methods. */
  async listenBrainzApi(e, t, a, r) {
    const n = {
      method: e,
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    };
    a && (n.body = JSON.stringify(a)), r && n.headers && (n.headers.Authorization = `Token ${r}`);
    const g = fetch(t, n), p = this.REQUEST_TIMEOUT;
    let y = null, R = null;
    try {
      R = await M(p, g), y = await R.json();
    } catch {
      throw this.debugLog("Error while sending request", "error"), new Error(f.ERROR_OTHER);
    }
    switch (R.status) {
      case 400:
        throw this.debugLog("Invalid JSON sent", "error"), new Error(f.ERROR_AUTH);
      case 401:
        throw this.debugLog("Invalid Authorization sent", "error"), new Error(f.ERROR_AUTH);
    }
    return this.debugLog(JSON.stringify(y, null, 2)), y;
  }
  async sendScrobbleRequest(e, t) {
    const a = await this.listenBrainzApi(
      "POST",
      this.userApiUrl || la,
      e,
      t
    );
    return this.processResult(a);
  }
  async requestSession() {
    let e = null;
    try {
      e = await this.fetchSession(na);
    } catch {
      this.debugLog("request session timeout", "warn");
    }
    if (e) {
      const t = qe(e.sessionID);
      return this.debugLog(`Session ID: ${t}`), e;
    }
    throw new Error(f.ERROR_AUTH);
  }
  async fetchSession(e) {
    this.debugLog(`Use ${e}`);
    const t = _t() ? Fe(e) : Kt({
      type: "sendListenBrainzRequest",
      payload: {
        url: e
      }
    }), a = this.REQUEST_TIMEOUT, r = await M(a, t);
    if (r !== null) {
      let n = null;
      const g = r.match(
        /<script id="global-react-props" type="application\/json">(.*?)<\/script>/
      )?.[1];
      g && (n = JSON.parse(
        g
      ));
      const p = n?.current_user.name, y = n?.current_user.auth_token;
      if (y && p)
        return { sessionID: y, sessionName: p };
    }
    return null;
  }
  processResult(e) {
    return e.status !== "ok" ? f.ERROR_OTHER : f.RESULT_OK;
  }
  makeTrackMetadata(e) {
    const t = {
      artist_name: e.getArtist() ?? "",
      track_name: e.getTrack() ?? "",
      additional_info: {
        submission_client: "Web Scrobbler",
        submission_client_version: fs(),
        music_service_name: e.metadata.label
      }
    }, a = e.getAlbum();
    a && (t.release_name = a);
    const r = e.getOriginUrl();
    r && (t.additional_info.origin_url = r);
    const n = e.getAlbumArtist();
    n && (t.additional_info.release_artist_name = n), r && e.metadata.label === "Spotify" && (t.additional_info.spotify_id = r);
    const g = e.getDuration();
    return g && (t.additional_info.duration = g), t;
  }
}
class da extends Q {
  isLocalOnly = !0;
  /** @override */
  getStorageName() {
    return "Maloja";
  }
  /** @override */
  getLabel() {
    return "Maloja";
  }
  /** @override */
  getStatusUrl() {
    return "";
  }
  /** @override */
  getUserDefinedProperties() {
    return ["userApiUrl", "userToken"];
  }
  /** @override */
  async getProfileUrl() {
    return Promise.resolve("");
  }
  /** @override */
  async getAuthUrl() {
    return Promise.resolve("");
  }
  /** @override */
  getBaseProfileUrl() {
    return "";
  }
  /** @override */
  getSongInfo() {
    return Promise.resolve({});
  }
  toggleLove() {
    return Promise.resolve(f.ERROR_OTHER);
  }
  /** @override */
  async getSession() {
    if (!this.userToken)
      throw new Error(f.ERROR_AUTH);
    return Promise.resolve({ sessionID: this.userToken });
  }
  /** @override */
  isReadyForGrantAccess() {
    return Promise.resolve(!1);
  }
  /** @override */
  sendNowPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendPaused() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendResumedPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async scrobble(e) {
    const t = [];
    for (const a of e.slice(0, 50)) {
      const r = this.makeTrackMetadata(a);
      t.push(this.sendRequest(r, this.userToken));
    }
    return Promise.all(t);
  }
  /** Private methods */
  async sendRequest(e, t) {
    e.key = t;
    const a = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e)
    }, r = fetch(this.userApiUrl, a), n = this.REQUEST_TIMEOUT;
    let g = null;
    try {
      if (g = await M(n, r), g.status !== 200)
        return f.ERROR_OTHER;
    } catch {
      return this.debugLog("Error while sending request", "error"), f.ERROR_OTHER;
    }
    return f.RESULT_OK;
  }
  makeTrackMetadata(e) {
    const t = {
      artist: e.getArtist() ?? "",
      title: e.getTrack() ?? "",
      time: e.metadata.startTimestamp
    }, a = e.getAlbum();
    a && (t.album = a);
    const r = e.getAlbumArtist();
    return r && (t.albumartists = [r]), t;
  }
}
class ua extends Q {
  isLocalOnly = !0;
  /** @override */
  getBaseProfileUrl() {
    return "";
  }
  /** @override */
  getLabel() {
    return "Webhook";
  }
  /** @override */
  getStatusUrl() {
    return "";
  }
  /** @override */
  getStorageName() {
    return "Webhook";
  }
  /** @override */
  getSession() {
    return !this.arrayProperties || this.arrayProperties.length === 0 ? Promise.reject(new Error("")) : Promise.resolve({ sessionID: "webhook" });
  }
  /** @override */
  getAuthUrl() {
    return Promise.resolve("");
  }
  /** @override */
  isReadyForGrantAccess() {
    return Promise.resolve(!1);
  }
  /** @override */
  async getProfileUrl() {
    return Promise.resolve("");
  }
  /** @override */
  getUserDefinedArrayProperties() {
    return ["applicationName", "userApiUrl"];
  }
  async getSongInfo() {
    return Promise.resolve({});
  }
  /** @override */
  async sendRequest(e) {
    if (!this.arrayProperties || this.arrayProperties.length === 0)
      return f.ERROR_AUTH;
    this.debugLog(
      `Webhook - sendRequest: ${JSON.stringify(e, null, 2)}`
    );
    const t = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(e)
    }, a = [];
    for (const n of this.arrayProperties)
      a.push(fetch(n.userApiUrl, t));
    const r = this.REQUEST_TIMEOUT;
    try {
      const n = await M(
        r,
        Promise.all(a)
      );
      for (const g of n)
        if (g.status !== 200)
          return this.debugLog(`Error in ${g.url}.`, "error"), f.ERROR_OTHER;
    } catch {
      return this.debugLog("Error while sending request", "error"), f.ERROR_OTHER;
    }
    return f.RESULT_OK;
  }
  /** @override */
  async sendNowPlaying(e) {
    return this.sendRequest({
      eventName: "nowplaying",
      time: Date.now(),
      data: { song: e }
    });
  }
  /** @override */
  async sendPaused(e) {
    return this.sendRequest({
      eventName: "paused",
      time: Date.now(),
      data: { song: e }
    });
  }
  /** @override */
  async sendResumedPlaying(e) {
    return this.sendRequest({
      eventName: "resumedplaying",
      time: Date.now(),
      data: { song: e }
    });
  }
  /** @override */
  async scrobble(e, t) {
    const a = await this.sendRequest({
      eventName: "scrobble",
      time: Date.now(),
      // send the first song as a separate argument to avoid breaking older implementations
      data: {
        song: e[0],
        songs: e,
        currentlyPlaying: t
      }
    });
    return new Array(e.length).fill(a);
  }
  /** @override */
  toggleLove(e, t) {
    return this.sendRequest({
      eventName: "loved",
      time: Date.now(),
      data: { song: e, isLoved: t }
    });
  }
}
class ma extends Q {
  isLocalOnly = !0;
  /** @override */
  getStorageName() {
    return "Pleroma";
  }
  /** @override */
  getLabel() {
    return "Pleroma";
  }
  /** @override */
  getStatusUrl() {
    return "";
  }
  /** @override */
  getUserDefinedProperties() {
    return ["userApiUrl", "userToken"];
  }
  /** @override */
  async getProfileUrl() {
    return Promise.resolve("");
  }
  /** @override */
  async getAuthUrl() {
    return Promise.resolve("");
  }
  /** @override */
  getBaseProfileUrl() {
    return "";
  }
  /** @override */
  getSongInfo() {
    return Promise.resolve({});
  }
  toggleLove() {
    return Promise.resolve(f.ERROR_OTHER);
  }
  /** @override */
  async getSession() {
    if (!this.userToken)
      throw new Error(f.ERROR_AUTH);
    const e = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.userToken}`
      }
    }, t = `https://${this.userApiUrl}/api/v1/accounts/verify_credentials`, a = fetch(t, e), r = this.REQUEST_TIMEOUT;
    let n = null;
    try {
      if (n = await M(r, a), n.status !== 200)
        throw new Error(f.ERROR_AUTH);
      const g = await n.json(), p = g ? g.fqn : "";
      return { sessionID: this.userToken, sessionName: p };
    } catch {
      throw this.debugLog("Error while sending request", "error"), new Error(f.ERROR_AUTH);
    }
  }
  /** @override */
  isReadyForGrantAccess() {
    return Promise.resolve(!1);
  }
  /** @override */
  sendNowPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendResumedPlaying() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async sendPaused() {
    return Promise.resolve(f.RESULT_OK);
  }
  /** @override */
  async scrobble(e) {
    const t = [];
    for (const a of e.slice(0, 50)) {
      const r = this.makeTrackMetadata(a);
      t.push(this.sendRequest(r, this.userToken));
    }
    return Promise.all(t);
  }
  /** Private methods */
  async sendRequest(e, t) {
    const a = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t}`
      },
      body: JSON.stringify(e)
    }, r = `https://${this.userApiUrl}/api/v1/pleroma/scrobble`, n = fetch(r, a), g = this.REQUEST_TIMEOUT;
    let p = null;
    try {
      if (p = await M(g, n), p.status !== 200)
        return f.ERROR_OTHER;
    } catch {
      return this.debugLog("Error while sending request", "error"), f.ERROR_OTHER;
    }
    return f.RESULT_OK;
  }
  makeTrackMetadata(e) {
    const t = {
      artist: e.getArtist() ?? "",
      title: e.getTrack() ?? "",
      length: e.getDuration(),
      url: e.parsed.originUrl ?? ""
    }, a = e.getAlbum();
    return a && (t.album = a), t;
  }
}
const $ = [
  new ia(),
  new oa(),
  new ca(),
  new da(),
  new ua(),
  new ma()
];
function _e(s, e) {
  return e.some((t) => t.getLabel() === s.getLabel());
}
class ga {
  /**
   * Scrobblers that are bound, meaning they have valid session IDs.
   */
  boundScrobblers = [];
  /**
   * Bind all registered scrobblers.
   * @returns Array of bound scrobblers
   */
  async bindAllScrobblers() {
    for (const e of $)
      try {
        await e.getSession(), this.bindScrobbler(e);
      } catch {
        S(`Unable to bind ${e.getLabel()}`, "warn");
      }
    return this.boundScrobblers;
  }
  /**
   * Bind given scrobbler.
   * @param scrobbler - Scrobbler instance
   */
  bindScrobbler(e) {
    _e(e, this.boundScrobblers) || (this.boundScrobblers.push(e), S(`Bind ${e.getLabel()} scrobbler`));
  }
  /**
   * Unbind given scrobbler.
   * @param scrobbler - Scrobbler instance
   */
  unbindScrobbler(e) {
    if (_e(e, this.boundScrobblers)) {
      const t = this.boundScrobblers.indexOf(e);
      this.boundScrobblers.splice(t, 1), S(`Unbind ${e.getLabel()} scrobbler`);
    } else
      S(`${e.getLabel()} is not bound`, "error");
  }
  /**
   * Retrieve song info using scrobbler APIs.
   * @param song - Song instance
   * @returns Promise resolved with array of song info objects
   */
  getSongInfo(e) {
    const t = $.filter((a) => a.canLoadSongInfo());
    return S(`Send "get info" request: ${t.length}`), Promise.all(
      t.map(async (a) => {
        try {
          return await a.getSongInfo(e);
        } catch {
          return S(
            `Unable to get song info from ${a.getLabel()}`,
            "warn"
          ), null;
        }
      })
    );
  }
  /**
   * Send now playing notification to each bound scrobbler.
   * @param song - Song instance
   * @returns Promise that will be resolved then the task will complete
   */
  sendNowPlaying(e) {
    return S(`Send "now playing" request: ${this.boundScrobblers.length}`), Promise.all(
      this.boundScrobblers.map(async (t) => {
        try {
          return await t.sendNowPlaying(
            t.applyFilter(e)
          );
        } catch (a) {
          return this.processErrorResult(
            t,
            a
          );
        }
      })
    );
  }
  /**
   * Send now playing notification to each bound scrobbler.
   * @param song - Song instance
   * @returns Promise that will be resolved then the task will complete
   */
  sendPaused(e) {
    const t = this.boundScrobblers.filter(
      (a) => typeof a.sendPaused == "function"
    );
    return t.length === 0 ? Promise.resolve([f.RESULT_OK]) : (S(`Send "paused" request: ${t.length}`), Promise.all(
      t.map(async (a) => {
        try {
          return await a.sendPaused(
            a.applyFilter(e)
          );
        } catch (r) {
          return this.processErrorResult(
            a,
            r
          );
        }
      })
    ));
  }
  /**
   * Send now playing notification to each bound scrobbler.
   * @param song - Song instance
   * @returns Promise that will be resolved then the task will complete
   */
  sendResumedPlaying(e) {
    const t = this.boundScrobblers.filter(
      (a) => typeof a.sendResumedPlaying == "function"
    );
    return t.length === 0 ? Promise.resolve([f.RESULT_OK]) : (S(`Send "paused" request: ${t.length}`), Promise.all(
      t.map(async (a) => {
        try {
          return await a.sendResumedPlaying(
            a.applyFilter(e)
          );
        } catch (r) {
          return this.processErrorResult(
            a,
            r
          );
        }
      })
    ));
  }
  /**
   * Scrobble song to each bound scrobbler.
   * @param song - Song instance
   * @returns Promise that will be resolved then the task will complete
   */
  async scrobble(e, t) {
    S(`Send "scrobble" request: ${this.boundScrobblers.length}`);
    const a = await Promise.all(
      this.boundScrobblers.map(async (r) => {
        try {
          return await r.scrobble(
            e.map(r.applyFilter),
            t
          );
        } catch (n) {
          return this.processScrobbleErrorResult(
            r,
            n
          );
        }
      })
    );
    for (let r = 0; r < a[0].length; r++)
      await As.pushScrobble({
        song: e[r].getCloneableData(),
        status: Bt(a, r)
      });
    return a;
  }
  /**
   * Toggle song love status.
   * @param song - Song instance
   * @param flag - Flag indicates song is loved
   * @returns Promise that will be resolved then the task will complete
   */
  async toggleLove(e, t) {
    const a = $.filter((n) => n.canLoveSong());
    return S(`Send "${t ? "love" : "unlove"}" request: ${a.length}`), Promise.all(
      a.map(async (n) => {
        try {
          return await n.toggleLove(e, t);
        } catch (g) {
          return this.processErrorResult(
            n,
            g
          );
        }
      })
    );
  }
  /**
   * Get all registered scrobblers.
   * @returns Array of bound scrobblers
   */
  getRegisteredScrobblers() {
    return $;
  }
  /**
   * Get scrobbler by label.
   * @param label - Scrobbler label
   * @returns Found scrobbler object
   */
  getScrobblerByLabel(e) {
    for (const t of $)
      if (t.getLabel() === e)
        return t;
    return null;
  }
  /**
   * Process result received from scrobbler.
   * @param scrobbler - Scrobbler instance
   * @param result - API call result
   * @returns Promise resolved with result object
   */
  async processErrorResult(e, t) {
    const a = t === f.ERROR_OTHER, r = t === f.ERROR_AUTH;
    if (!(a || r))
      throw new Error(`Invalid result: ${t}`);
    return r && (await e.isReadyForGrantAccess() || this.unbindScrobbler(e)), t;
  }
  /**
   * Process result received from scrobbler when scrobbling.
   * Scrobbling has array result so logic is slightly different
   * @param scrobbler - Scrobbler instance
   * @param result - API call result
   * @returns Promise resolved with result object
   */
  async processScrobbleErrorResult(e, t) {
    const a = t[0] === f.ERROR_OTHER, r = t[0] === f.ERROR_AUTH;
    if (!(a || r))
      throw new Error(`Invalid result: ${t[0]}`);
    return r && (await e.isReadyForGrantAccess() || this.unbindScrobbler(e)), t;
  }
}
const x = new ga();
async function ba(s) {
  return await x.bindAllScrobblers(), Gs(s.connector), x.sendNowPlaying(s);
}
async function ha(s) {
  return await x.bindAllScrobblers(), x.sendPaused(s);
}
async function fa(s) {
  return await x.bindAllScrobblers(), x.sendResumedPlaying(s);
}
async function pa(s, e) {
  return await x.bindAllScrobblers(), x.scrobble(s, e);
}
async function wa(s) {
  return await x.bindAllScrobblers(), x.getSongInfo(s);
}
async function ya(s, e) {
  await x.bindAllScrobblers();
  const t = await x.toggleLove(s, e);
  if (t.some((a) => a === f.ERROR_OTHER))
    throw new Error("An error occurred while toggling love for track");
  return t;
}
const we = L(je);
async function de(s, e) {
  const t = await Le(s, e);
  return Cs(t), t;
}
b.runtime.onStartup.addListener(jt);
b.runtime.onInstalled.addListener(La);
b.tabs.onRemoved.addListener((s) => {
  Aa(s);
});
b.tabs.onUpdated.addListener(
  (s, e, t) => {
    va(s, e, t);
  }
);
b.tabs.onActivated.addListener(
  (s) => {
    ka(s);
  }
);
b.contextMenus?.onClicked.addListener(
  (s) => {
    xa(s);
  }
);
b.commands?.onCommand.addListener(
  (s) => {
    ja(s);
  }
);
async function ja(s) {
  const e = await mt(), t = e.song?.metadata.userloved;
  switch (s) {
    case "toggle-connector":
      e.mode === De ? bt(e.tabId) : gt(e.tabId);
      break;
    case "love-song":
      t || Me(e.tabId, !0, !0);
      break;
    case "unlove-song":
      t && Me(e.tabId, !1, !0);
      break;
  }
}
function Me(s, e, t) {
  N(s ?? -1, {
    type: "toggleLove",
    payload: {
      isLoved: e,
      shouldShowNotification: t
    }
  });
}
async function Aa(s) {
  const e = await ue(), t = await Te(e.activeTabs);
  await K({
    activeTabs: t,
    browserPreferredTheme: e.browserPreferredTheme
  });
  const a = await le();
  de(t, a);
  const r = await we.get();
  r?.[s] && (delete r[s], we.set(r));
}
async function ka(s) {
  await wt(s.tabId, !0);
}
async function va(s, e, t) {
  t?.active && e.status === "complete" && await wt(s, !1);
}
async function wt(s, e) {
  const t = await ue();
  let a = e ? t.activeTabs.filter((g) => g.tabId !== s) : t.activeTabs;
  const r = await Le(a, s);
  Ee[r.mode] && r.tabId === s && (e ? a = [r, ...a] : a = a.map(
    (g) => g.tabId === s ? r : g
  ));
  const n = await Te(a);
  await K({
    activeTabs: n,
    browserPreferredTheme: t.browserPreferredTheme
  }), de(n, s);
}
async function yt(s, e) {
  if (!s)
    throw new Error("No tabid given");
  let t = !1;
  try {
    const a = await ue(), r = await Te(a.activeTabs);
    for (let p = 0; p < r.length; p++) {
      if (r[p].tabId !== s)
        continue;
      r[p] = e(r[p]), t = !0, await K({
        activeTabs: r,
        browserPreferredTheme: a.browserPreferredTheme
      });
      const y = await le();
      de(r, y);
      return;
    }
    t = !0;
    const n = [
      e({
        tabId: s,
        mode: G,
        permanentMode: G,
        song: null
      }),
      ...r
    ];
    await K({
      activeTabs: n,
      browserPreferredTheme: a.browserPreferredTheme
    });
    const g = await le();
    de(r, g);
  } catch {
    t || Es();
  }
}
async function Sa(s, e, t) {
  await yt(s, (a) => ({
    tabId: a.tabId,
    mode: e,
    permanentMode: t,
    song: a.song
  }));
}
async function Ra(s, e) {
  await yt(s, (t) => ({
    tabId: t.tabId,
    mode: t.mode,
    permanentMode: t.permanentMode,
    song: e
  }));
}
Ze(
  /**
   * Listener triggered on change of controller mode in a tab.
   */
  E({
    type: "controllerModeChange",
    fn: ({ mode: s, permanentMode: e }, t) => {
      Sa(t.tab?.id, s, e), console.log(`changed mode to ${s} in tab ${t.tab?.id}`);
    }
  }),
  /**
   * Listener triggered on change of currently playing song in a tab.
   */
  E({
    type: "songUpdate",
    fn: (s, e) => {
      Ra(e.tab?.id, s), console.log(`song changed in tab ${e.tab?.id}`), console.log(s);
    }
  }),
  /**
   * Listener called by content script that wants to know the tab ID of the tab it is connected to.
   * Returns the tab ID of the content script.
   */
  E({
    type: "getTabId",
    fn: (s, e) => (console.log("getting tab id"), console.log(s, e.tab?.id), e.tab?.id)
  }),
  /**
   * Listener called by a controller to trigger a now playing notification.
   */
  E({
    type: "showNowPlaying",
    fn: (s, e) => {
      Ks(
        new O(s.song, e.tab?.id ?? -1),
        s.connector,
        () => {
          Ue(e.tab?.id ?? -1);
        }
      );
    }
  }),
  /**
   * Listener called by a controller to trigger sending of now playing info.
   */
  E({
    type: "setNowPlaying",
    fn: (s, e) => ba(
      new O(s.song, e.tab?.id ?? -1)
    )
  }),
  /**
   * Listener called by a controller to trigger sending paused song on every pause.
   */
  E({
    type: "setPaused",
    fn: (s, e) => ha(
      new O(s.song, e.tab?.id ?? -1)
    )
  }),
  /**
   * Listener called by a controller to trigger sending playing song on every resumed play.
   */
  E({
    type: "setResumedPlaying",
    fn: (s, e) => fa(
      new O(s.song, e.tab?.id ?? -1)
    )
  }),
  /**
   * Listener called by a controller to trigger a scrobble.
   */
  E({
    type: "scrobble",
    fn: (s, e) => pa(
      s.songs.map(
        (t) => new O(t, e.tab?.id ?? -1)
      ),
      s.currentlyPlaying
    )
  }),
  /**
   * Listener called by a controller to trigger getting song info.
   */
  E({
    type: "getSongInfo",
    fn: (s, e) => wa(
      new O(s.song, e.tab?.id ?? -1)
    )
  }),
  /**
   * Listener called by a controller to love or unlove a song.
   */
  E({
    type: "toggleLove",
    fn: (s, e) => {
      const t = new O(s.song, e.tab?.id ?? -1);
      return s.shouldShowNotification && Zs(t, s.isLoved), ya(t, s.isLoved);
    }
  }),
  /**
   * Listener called by a content script to attempt signing into musicbrainz.
   * This has to be done in background script, as safari blocks sending necessary cookies in other scripts.
   */
  E({
    type: "sendListenBrainzRequest",
    fn: async (s) => Fe(s.url)
  }),
  /**
   * Listener called by a controller to trigger clearing now playing notification.
   */
  E({
    type: "clearNowPlaying",
    fn: (s, e) => {
      Ws(new O(s.song, e.tab?.id ?? -1));
    }
  }),
  /**
   * Listener called by a controller to trigger showing a notification telling the user the song was not recognized.
   */
  E({
    type: "showSongNotRecognized",
    fn: (s, e) => {
      Js(
        new O(s.song, e.tab?.id ?? -1),
        s.connector,
        () => {
          Ue(e.tab?.id ?? -1);
        }
      );
    }
  }),
  /**
   * Listener called by a content script to update the browser preferred theme.
   */
  E({
    type: "updateTheme",
    fn: async (s) => {
      const e = await ue();
      await K({
        activeTabs: e.activeTabs,
        browserPreferredTheme: s
      });
    }
  }),
  /**
   * Listener called by a content script to fetch through background script.
   */
  E({
    type: "fetch",
    fn: async ({ url: s, init: e }) => {
      const t = await fetch(s, e);
      return t.ok ? {
        ok: !0,
        content: await t.text()
      } : {
        ok: !1,
        content: ""
      };
    }
  }),
  /**
   * Listener called by a content script to figure out whether it is currently audible
   */
  E({
    type: "isTabAudible",
    fn: async (s, e) => {
      const t = e.tab?.id;
      return typeof t != "number" ? Promise.resolve(!0) : (await b.tabs.get(t)).audible ?? !0;
    }
  })
);
async function Ea() {
  const s = L(Xe);
  let e = await s.get();
  e || (e = {
    appVersion: ""
  }), e.appVersion = b.runtime.getManifest().version, await s.set(e), s.debugLog();
}
async function Ta() {
  return (await x.bindAllScrobblers()).length > 0;
}
function jt() {
  L(ye).set(xe), we.set({}), ws(), Ea(), Ta().then((e) => {
    e || (console.warn("No scrobblers are bound"), Xs());
  }), b.contextMenus?.create({
    id: A.ENABLE_CONNECTOR,
    visible: !1,
    contexts: ["action"],
    title: "Error: You should not be seeing this"
  }), b.contextMenus?.create({
    id: A.DISABLE_CONNECTOR,
    visible: !1,
    contexts: ["action"],
    title: "Error: You should not be seeing this"
  }), b.contextMenus?.create({
    id: A.DISABLE_UNTIL_CLOSED,
    visible: !1,
    contexts: ["action"],
    title: "Error: You should not be seeing this"
  }), b.contextMenus.create({
    id: A.ENABLE_CHANNEL,
    visible: !1,
    contexts: ["action"],
    title: "Error: You should not be seeing this"
  }), b.contextMenus.create({
    id: A.DISABLE_CHANNEL,
    visible: !1,
    contexts: ["action"],
    title: "Error: You should not be seeing this"
  });
}
function La() {
  jt(), aa();
}
async function xa(s) {
  const e = await mt();
  switch (s.menuItemId) {
    case A.ENABLE_CONNECTOR: {
      bt(e.tabId);
      break;
    }
    case A.DISABLE_CONNECTOR: {
      gt(e.tabId);
      break;
    }
    case A.DISABLE_UNTIL_CLOSED: {
      Os(e.tabId);
      break;
    }
    case A.ENABLE_CHANNEL: {
      Ps(e.tabId);
      break;
    }
    case A.DISABLE_CHANNEL: {
      Ns(e.tabId);
      break;
    }
  }
}

/* Daylight, offline.

   The shell is cache-first because fonts and code do not change within a
   version; HTML is network-first with a cache fallback so a push to Pages
   lands on the next open. Bump VERSION with every release - old caches are
   dropped on activate. */
var VERSION = "daylight-v7";
var SHELL = [
  "./", "./index.html",
  "./css/tokens.css", "./css/shell.css", "./css/scene.css",
  "./css/cards.css", "./css/you.css", "./css/overlays.css",
  "./js/data.js", "./js/state.js", "./js/audio.js", "./js/sky.js",
  "./js/fx.js", "./js/art.js", "./js/cardui.js", "./js/scene.js",
  "./js/collection.js", "./js/you.js", "./js/coach.js", "./js/app.js",
  "./fonts.css",
  "./fonts/bricolage-latin.woff2", "./fonts/bricolage-latin-ext.woff2",
  "./fonts/instrument-latin.woff2", "./fonts/instrument-latin-ext.woff2",
  "./fonts/jbmono-latin.woff2", "./fonts/jbmono-latin-ext.woff2",
  "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(VERSION).then(function(c){ return c.addAll(SHELL); })
      .then(function(){ return self.skipWaiting(); })
  );
});
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if (k !== VERSION) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function(e){
  if (e.request.method !== "GET") return;
  var isHTML = e.request.mode === "navigate"
    || (e.request.headers.get("accept") || "").indexOf("text/html") >= 0;
  if (isHTML){
    e.respondWith(
      fetch(e.request).then(function(r){
        var copy = r.clone();
        caches.open(VERSION).then(function(c){ c.put(e.request, copy); });
        return r;
      }).catch(function(){ return caches.match(e.request); })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(hit){ return hit || fetch(e.request); })
  );
});

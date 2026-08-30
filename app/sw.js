/* Daylight, offline.

   LESSON LEARNED THE HARD WAY: this file shipped two full redesigns without
   its VERSION changing, so returning browsers kept serving the old design
   from cache-first CSS/JS forever - the owner reviewed a three-round-old
   build twice and was told he was looking at new work. Never again:

   - Everything same-origin is NETWORK-FIRST now. The cache exists so the
     game still opens on a plane, not to save requests. One player, tiny
     files: freshness wins.
   - VERSION changes with every release, and the build number is painted on
     the title card and the You screen so what the phone runs is visible. */
var VERSION = "daylight-v13";
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
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function(r){
      if (r && r.ok){
        var copy = r.clone();
        caches.open(VERSION).then(function(c){ c.put(e.request, copy); });
      }
      return r;
    }).catch(function(){
      /* offline: the cache answers, ignoring any ?v= cache-buster */
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});

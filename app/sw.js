/* Daylight, offline.

   The point is not saving bandwidth. It is that a game opens instantly and
   still opens on a plane, in a lift, and in the seventh hour of a Singapore to
   London red-eye — and that a thing you install on your home screen should not
   go blank the moment the signal does.

   The shell is cache-first because the fonts and icons never change within a
   version. index.html is network-first with a cache fallback, so a push to
   Pages lands on the next open rather than the next cache eviction.

   Bump VERSION whenever the app changes. Old caches are dropped on activate. */
var VERSION = "daylight-v5";
var SHELL = [
  "./",
  "./index.html",
  "./fonts.css",
  "./fonts/bricolage-latin.woff2",
  "./fonts/bricolage-latin-ext.woff2",
  "./fonts/instrument-latin.woff2",
  "./fonts/instrument-latin-ext.woff2",
  "./fonts/jbmono-latin.woff2",
  "./fonts/jbmono-latin-ext.woff2",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(VERSION)
      /* One miss must not fail the whole install, or a renamed icon takes the
         service worker down with it. */
      .then(function(c){ return Promise.all(SHELL.map(function(u){
        return c.add(u).catch(function(){});
      })); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === VERSION ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var isPage = req.mode === "navigate" || /\.html?$/.test(url.pathname);
  if (isPage){
    /* Newest wins when there is a network; the cache is the fallback. */
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(VERSION).then(function(c){ c.put(req, copy); });
        return res;
      }).catch(function(){
        return caches.match(req).then(function(m){ return m || caches.match("./index.html"); });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function(m){
      return m || fetch(req).then(function(res){
        if (res && res.status === 200 && res.type === "basic"){
          var copy = res.clone();
          caches.open(VERSION).then(function(c){ c.put(req, copy); });
        }
        return res;
      });
    })
  );
});

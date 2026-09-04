/* Daylight, offline - and, since v15, the thing that taps him on the shoulder.

   LESSON LEARNED THE HARD WAY: this file shipped two full redesigns without
   its VERSION changing, so returning browsers kept serving the old design
   from cache-first CSS/JS forever - the owner reviewed a three-round-old
   build twice and was told he was looking at new work. Never again:

   - Everything same-origin is NETWORK-FIRST now. The cache exists so the
     game still opens on a plane, not to save requests. One player, tiny
     files: freshness wins.
   - VERSION changes with every release, and the build number is painted on
     the title card and the You screen so what the phone runs is visible. */
var VERSION = "daylight-v25";
/* Written by the app on every save; read here when a push lands, because a
   service worker cannot see localStorage. Never versioned, never deleted. */
var STATE_CACHE = "daylight-state";
var SHELL = [
  "./", "./index.html",
  "./css/tokens.css", "./css/shell.css", "./css/scene.css",
  "./css/cards.css", "./css/body.css", "./css/you.css", "./css/overlays.css",
  "./js/data.js", "./js/state.js", "./js/audio.js", "./js/sky.js",
  "./js/fx.js", "./js/art.js", "./js/cardui.js", "./js/scene.js",
  "./js/collection.js", "./js/quest.js", "./js/gym.js", "./js/food.js",
  "./js/basics.js", "./js/work.js", "./js/vault.js", "./js/you.js",
  "./js/coach.js", "./js/app.js",
  "./fonts.css",
  "./fonts/nunito-latin.woff2", "./fonts/nunito-latin-ext.woff2",
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
      return Promise.all(keys.map(function(k){
        if (k !== VERSION && k !== STATE_CACHE) return caches.delete(k);
      }));
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

/* ------------------------------------------------------------ the nudge
   The payload is dumb on purpose - one scheduled ping a day from a public
   repo's Actions cron, carrying nothing personal. The device makes it
   smart: the app mirrors today's shape into STATE_CACHE on every save, so
   the notification can name what is actually still open. If the mirror is
   stale (app not opened today), it falls back to a plain question. */
function localISO(d){
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
    + "-" + String(d.getDate()).padStart(2, "0");
}
self.addEventListener("push", function(e){
  e.waitUntil((async function(){
    var state = null;
    try {
      var c = await caches.open(STATE_CACHE);
      var r = await c.match("state");
      if (r) state = await r.json();
    } catch(err){}

    var title = "Daylight", body = "Anything still open today?";
    var openN = 0;
    if (state && state.day === localISO(new Date())){
      if (state.open && state.open.length){
        openN = state.open.length;
        title = state.run > 0 ? "The run is at stake" : "Day at risk";
        body = state.open.join(" and ") + (state.open.length === 1 ? " is" : " are")
          + " still open" + (state.run > 0 ? ". " + state.run + " days on the line." : ".");
      } else {
        title = "Day is in";
        body = "All three landed. Nothing needed tonight.";
      }
    }
    try {
      if (navigator.setAppBadge){
        if (openN) await navigator.setAppBadge(openN);
        else await navigator.clearAppBadge();
      }
    } catch(err){}
    /* iOS requires a visible notification per push; the quiet good-news one
       still shows, but says so and asks nothing. */
    await self.registration.showNotification(title, {
      body: body,
      icon: "./icon-180.png",
      badge: "./icon-180.png",
      tag: "daylight-nudge",
      data: { url: "./index.html" }
    });
  })());
});
self.addEventListener("notificationclick", function(e){
  e.notification.close();
  e.waitUntil((async function(){
    var list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (var i = 0; i < list.length; i++){
      if ("focus" in list[i]){ return list[i].focus(); }
    }
    if (self.clients.openWindow) return self.clients.openWindow("./index.html");
  })());
});

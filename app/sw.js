/* Daylight, offline - and, since v15, the thing that taps him on the shoulder
   (twice a day since v37).

   LESSON LEARNED THE HARD WAY: this file shipped two full redesigns without
   its VERSION changing, so returning browsers kept serving the old design
   from cache-first CSS/JS forever - the owner reviewed a three-round-old
   build twice and was told he was looking at new work. Never again:

   - Everything same-origin is NETWORK-FIRST now. The cache exists so the
     game still opens on a plane, not to save requests. One player, tiny
     files: freshness wins.
   - VERSION changes with every release, and the build number is painted on
     the title card and the You screen so what the phone runs is visible. */
var VERSION = "daylight-v37";
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

/* ------------------------------------------------------------ the nudges
   Two a day from a public repo's cron, each carrying one word - "morning"
   or "evening" - and nothing else. The device writes the words, from the
   mirror the app leaves in STATE_CACHE on every save: today's open pillars,
   the run and the record, the next chip, the week so far, and a brief for
   today and tomorrow. So the 08:00 push can describe a day the app has not
   been opened on, and the 22:15 one can say exactly what is at stake - or
   notice that the app has not been opened at all. composeNudge is pure, so
   it is tested off the phone. */
var DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function localISO(d){
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
    + "-" + String(d.getDate()).padStart(2, "0");
}
function dayBefore(isoStr){
  var d = new Date(isoStr + "T00:00:00"); d.setDate(d.getDate() - 1); return localISO(d);
}
function chipLine(st){
  if (!st || !st.chip || !(st.chip.away > 0) || st.chip.away > 7) return "";
  return st.chip.away + (st.chip.away === 1 ? " day" : " days") + " to the "
    + String(st.chip.name).toLowerCase() + " chip.";
}
function composeNudge(kind, st, nowISO, dow){
  var fresh = !!(st && st.day === nowISO);
  var stale1 = !!(st && st.day === dayBefore(nowISO));
  var brief = st && st.briefs && st.briefs[nowISO];
  var badgeOn = !st || st.badgeOn !== 0;
  var out = { title: "Daylight", body: "", badge: 0 };

  if (kind === "morning"){
    if (brief){
      out.title = brief.head;
      var parts = [brief.first];
      if (brief.gym) parts.push(brief.gym + ".");
      if (brief.card) parts.push(brief.card);
      out.body = parts.join(" ");
    } else {
      out.title = DAY_NAMES[dow] + ".";
      out.body = "Three things make a day. Train before Malta wakes.";
    }
    var cl = chipLine(st);
    if (cl) out.body += " " + cl;
    /* the morning badge is the day's whole debt; it clears as the pillars land */
    out.badge = badgeOn ? (fresh ? (st.open || []).length : 3) : 0;
    return out;
  }

  /* evening */
  if (fresh){
    var open = st.open || [];
    if (open.length){
      out.badge = badgeOn ? open.length : 0;
      out.title = st.run > 0 ? "The run is at stake" : "Day at risk";
      out.body = open.join(" and ") + (open.length === 1 ? " is" : " are") + " still open"
        + (st.run > 0 ? ". " + st.run + " days on the line." : ".");
      if (st.best >= 7 && st.run >= st.best) out.body += " Tonight is a new record.";
      else if (st.best >= 7 && st.best - st.run <= 3) out.body += " " + (st.best - st.run) + " from your record.";
    } else {
      out.title = "Day is in";
      out.body = "All three landed. Nothing needed tonight.";
      var cl2 = chipLine(st);
      if (cl2) out.body += " " + cl2;
    }
  } else if (stale1){
    out.badge = badgeOn ? 3 : 0;
    out.title = "Not opened today";
    out.body = st.run > 0
      ? "Yesterday’s run of " + st.run + " is on the line. Tick what you did."
      : "Tick what you did before the day closes.";
  } else {
    out.title = "Daylight";
    out.body = "Anything still open today?";
    out.badge = 0;
  }
  if (dow === 0 && fresh && st.week && st.week.of >= 6){
    out.body += " This week: " + st.week.full + " of 7 full days.";
  }
  return out;
}

self.addEventListener("push", function(e){
  e.waitUntil((async function(){
    var kind = "evening";
    try { var pl = e.data ? e.data.json() : null; if (pl && pl.t === "morning") kind = "morning"; } catch(err){}
    var state = null;
    try {
      var c = await caches.open(STATE_CACHE);
      var r = await c.match("state");
      if (r) state = await r.json();
    } catch(err){}
    var now = new Date();
    var n = composeNudge(kind, state, localISO(now), now.getDay());
    try {
      if (navigator.setAppBadge){
        if (n.badge) await navigator.setAppBadge(n.badge);
        else await navigator.clearAppBadge();
      }
    } catch(err){}
    /* iOS requires a visible notification per push; the quiet good-news one
       still shows, but says so and asks nothing. */
    await self.registration.showNotification(n.title, {
      body: n.body,
      icon: "./icon-180.png",
      badge: "./icon-180.png",
      tag: "daylight-" + kind,
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

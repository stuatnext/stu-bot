/* Daylight, offline - and, since v15, the thing that taps him on the shoulder
   (twice a day from v37, five times a day since v51).

   LESSON LEARNED THE HARD WAY: this file shipped two full redesigns without
   its VERSION changing, so returning browsers kept serving the old design
   from cache-first CSS/JS forever - the owner reviewed a three-round-old
   build twice and was told he was looking at new work. Never again:

   - Everything same-origin is NETWORK-FIRST now. The cache exists so the
     game still opens on a plane, not to save requests. One player, tiny
     files: freshness wins.
   - VERSION changes with every release, and the build number is painted on
     the title card and the You screen so what the phone runs is visible. */
var VERSION = "daylight-v65";
/* Written by the app on every save; read here when a push lands, because a
   service worker cannot see localStorage. Never versioned, never deleted. */
var STATE_CACHE = "daylight-state";
var SHELL = [
  "./", "./index.html",
  "./css/tokens.css", "./css/shell.css",
  "./css/cards.css", "./css/body.css", "./css/you.css", "./css/overlays.css",
  "./css/calm.css", "./css/poster.css", "./css/board.css", "./css/arcade.css",
  "./js/data.js", "./js/state.js", "./js/audio.js", "./js/sky.js",
  "./js/world.js", "./js/fx.js", "./js/art.js", "./js/cardui.js", "./js/scene.js", "./js/board.js",
  "./js/collection.js", "./js/quest.js", "./js/gym.js", "./js/food.js",
  "./js/week.js", "./js/dispatch.js",
  "./js/basics.js", "./js/care.js", "./js/skin.js", "./js/games.js", "./js/people.js",
  "./js/jokers.js", "./js/run.js", "./js/task.js", "./js/opening.js",
  "./js/work.js", "./js/vault.js", "./js/you.js",
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
   Five a day from a public repo's cron, each carrying one word and nothing
   else. The device writes the words, from the mirror the app leaves in
   STATE_CACHE on every save: today's open pillars, the run and the record,
   the next chip, the week so far, the routines still open, the shift in the
   phone's own clock, and a brief for today and tomorrow. So a push can
   describe a day the app has not been opened on, and say exactly what is at
   stake - or notice that the app has not been opened at all.

   THE SENDER KNOWS NOTHING. It has never seen the record and never will:
   the payload is one of five words. Everything personal is composed here,
   on the phone, from the phone's own copy. That is the whole reason the
   scheduler can live in a public repository.

   WHY THE LOCAL HOUR DECIDES, NOT THE PAYLOAD. The crons are fixed UTC and
   he travels constantly, so a ping labelled "morning" in Singapore lands at
   one in the morning in Sheffield. The label is therefore only a fallback:
   what a ping says is chosen from the hour it actually arrives at, on the
   clock of the phone it arrives on. Six bands, one job each, and the band
   before dawn does nothing but stay quiet - iOS insists on a visible
   notification per push, so the honest move is to make that one silent and
   short rather than to pretend it is a morning briefing.

   composeNudge is pure, so it is tested off the phone. */
var DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function localISO(d){
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
    + "-" + String(d.getDate()).padStart(2, "0");
}
function dayBefore(isoStr){
  var d = new Date(isoStr + "T00:00:00"); d.setDate(d.getDate() - 1); return localISO(d);
}
/* The band the ping landed in. In Singapore the five crons land at 08:07,
   12:20, 15:40, 22:15 and 23:40, which is one ping per band bar the quiet
   one. Anywhere else they land where they land and still say the right
   thing for the hour. */
function slotFor(kind, hour){
  if (typeof hour !== "number") return kind === "morning" ? "morning" : "evening";
  if (hour < 5)  return "night";
  if (hour < 11) return "morning";
  if (hour < 15) return "midday";
  if (hour < 19) return "shift";
  if (hour < 23) return "evening";
  return "bed";
}
function chipLine(st){
  if (!st || !st.chip || !(st.chip.away > 0) || st.chip.away > 7) return "";
  return st.chip.away + (st.chip.away === 1 ? " day" : " days") + " to the "
    + String(st.chip.name).toLowerCase() + " chip.";
}
/* The open pillars minus "Stopped", for the bands that land before the shift
   has finished - finishing on time is not something he can have failed at
   while the shift is still running, and a ping that says so is a ping that
   cries wolf. */
function openNow(st){
  var open = (st && st.open) || [], keys = (st && st.openKeys) || [];
  if (keys.length !== open.length) return open.slice();
  return open.filter(function(x, i){ return keys[i] !== "stop"; });
}
function andList(a){
  if (a.length <= 1) return a[0] || "";
  if (a.length === 2) return a[0] + " and " + a[1];
  return a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
}
/* The one sentence a push can carry that he genuinely does not know, because
   it is arithmetic across a time zone and a calendar: who he has drifted
   furthest from, and whether they are awake right now. Only ever one, only
   ever when they are actually past the rhythm he set himself. */
function whoLine(st){
  var w = st && st.who;
  if (!w || !w.name) return "";
  return w.since + " since " + w.name
    + (w.at ? " \u00b7 " + w.at + " there" + (w.up ? " and up." : ", asleep.") : ".");
}
/* The other sentence he cannot work out for himself: which window is about to
   shut. Only when it is close enough to matter - "eleven hours left" is not
   news, and a push that manufactures urgency is one he turns off. */
function shutLine(st){
  var w = st && st.shut;
  if (!w || !w.label || !(w.left > 0) || w.left > 170) return "";
  var h = Math.floor(w.left / 60), m = w.left % 60;
  var left = h && m ? h + "h " + m + "m" : h ? h + "h" : m + "m";
  return w.label + " shuts at " + w.at + " \u2014 " + left + " left.";
}
function careWord(st, part, label){
  var c = st && st.care && st.care[part];
  return !!(c && c.indexOf(label) !== -1);
}
function composeNudge(kind, st, nowISO, dow, hour){
  var fresh = !!(st && st.day === nowISO);
  var stale1 = !!(st && st.day === dayBefore(nowISO));
  var brief = st && st.briefs && st.briefs[nowISO];
  var badgeOn = !st || st.badgeOn !== 0;
  var slot = slotFor(kind, hour);
  var open = fresh ? (st.open || []) : [];
  var live = fresh ? openNow(st) : [];
  var run = (fresh && st.run) || 0;
  var out = { title: "Daylight", body: "", badge: 0, slot: slot, silent: false };

  /* ------------------------------------------------------- before dawn
     He is asleep. Say the least a visible notification can say. */
  if (slot === "night"){
    out.silent = true;
    out.title = "Daylight";
    out.body = fresh
      ? (open.length ? open.length + (open.length === 1 ? " thing" : " things") + " still open today."
                     : "The day is in.")
      : "Nothing needed.";
    return out;
  }

  /* ---------------------------------------------------------- morning
     The shape of the day, in his own words from the brief. */
  if (slot === "morning"){
    if (brief){
      out.title = brief.head;
      var parts = [brief.first];
      if (brief.gym) parts.push(brief.gym + ".");
      if (brief.card) parts.push(brief.card);
      out.body = parts.join(" ");
    } else {
      out.title = DAY_NAMES[dow] + (st && st.where ? " · " + st.where.c : "") + ".";
      out.body = "Three things make a day. Train before Malta wakes.";
    }
    /* one extra sentence at most: the chip if one is close, otherwise the level */
    var cl = chipLine(st);
    var wl0 = whoLine(st);
    if (wl0 && st && st.who && st.who.up) out.body += " " + wl0;
    else if (cl) out.body += " " + cl;
    else if (st && st.level && st.level.away && st.level.away <= 2)
      out.body += " Level " + (st.level.n + 1) + " in " + st.level.away
        + (st.level.away === 1 ? " full day." : " full days.");
    /* the morning badge is the day's whole debt; it clears as the pillars land */
    out.badge = badgeOn ? (fresh ? open.length : 3) : 0;
    return out;
  }

  /* ----------------------------------------------------------- midday
     The hours that are his before the shift takes the evening. This is the
     one that asks about sunscreen, because it is the one that lands while
     he is deciding whether to go out. */
  if (slot === "midday"){
    var sh = fresh && st.shift ? st.shift : null;
    out.badge = badgeOn ? open.length : 0;
    out.title = !sh ? "The open hours"
      : sh.none ? "No shift today"
      : "Malta wakes at " + sh.start;
    if (!fresh){
      out.title = "The open hours";
      out.body = "Anything done today? The app has not been opened.";
      out.badge = 0;
    } else if (live.length){
      out.body = andList(live) + (live.length === 1 ? " is" : " are") + " still open"
        + (sh && !sh.none ? ". The window is now." : ". Now is the easy time.");
    } else {
      out.body = open.length
        ? "Everything you can do before the shift is done."
        : "All three are in. The rest of the day is yours.";
    }
    var sl = fresh ? shutLine(st) : "";
    if (sl) out.body += " " + sl;
    else if (fresh && careWord(st, "day", "Sunscreen")) out.body += " Sunscreen before you go out.";
    return out;
  }

  /* ------------------------------------------------------------ shift
     Malta is on, or about to be. Nothing here nags about stopping - the
     shift has not finished yet, so that is not a thing he can have failed. */
  if (slot === "shift"){
    var sh2 = fresh && st.shift ? st.shift : null;
    out.badge = badgeOn ? open.length : 0;
    if (!fresh){
      out.title = "Daylight";
      out.body = "Anything still open today?";
      out.badge = 0;
      return out;
    }
    if (live.length){
      out.title = sh2 && !sh2.none ? "Before Malta takes the evening" : "Still open";
      var sl2 = shutLine(st);
      out.body = andList(live) + (live.length === 1 ? " is" : " are") + " still open"
        + (sl2 ? ". " + sl2 : run > 0 ? ". " + run + " days on the line." : ".");
    } else if (open.length){
      out.title = sh2 && !sh2.none ? "Finish at " + sh2.end : "One left";
      out.body = "Everything else is in. " + (sh2 && !sh2.none
        ? "Closing the laptop on time is the last one."
        : "Just the stop left.");
    } else {
      out.title = "Day is in";
      out.body = "All three landed before the evening. Nothing owed.";
    }
    return out;
  }

  /* ---------------------------------------------------------- evening
     The one that has always been here: what is still open, and what it
     costs. */
  if (slot === "evening"){
    if (fresh){
      if (open.length){
        out.badge = badgeOn ? open.length : 0;
        out.title = run > 0 ? "The run is at stake" : "Day at risk";
        out.body = andList(open) + (open.length === 1 ? " is" : " are") + " still open"
          + (run > 0 ? ". " + run + " days on the line." : ".");
        /* if home is one of the open ones, who it is beats what it is worth */
        var wl = open.indexOf("Family") !== -1 ? whoLine(st) : "";
        if (wl) out.body += " " + wl;
        else if (st.best >= 7 && run >= st.best) out.body += " Tonight is a new record.";
        else if (st.best >= 7 && st.best - run <= 3) out.body += " " + (st.best - run) + " from your record.";
        else if (st.level && st.level.away === 1) out.body += " Tonight is a level.";
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
    }
    if (dow === 0 && fresh && st.week && st.week.of >= 6){
      out.body += " This week: " + st.week.full + " of 7 full days.";
    }
    return out;
  }

  /* -------------------------------------------------------------- bed
     Last call on the day, and the only band that carries the wind-down. */
  out.badge = badgeOn ? open.length : 0;
  if (!fresh){
    out.badge = badgeOn ? 3 : 0;
    out.title = "Not opened today";
    out.body = (st && st.run > 0)
      ? "A run of " + st.run + " is on the line. Tick what you did."
      : "Tick what you did before the day closes.";
    return out;
  }
  if (open.length){
    out.title = "Last call";
    out.body = andList(open) + (open.length === 1 ? " is" : " are") + " still open"
      + (run > 0 ? ". " + run + " days on the line." : ".");
  } else {
    out.title = "Day is in";
    out.body = "All three landed.";
  }
  var tail = [];
  if (careWord(st, "night", "Wind down")) tail.push("Phone down, water poured");
  if (careWord(st, "day", "Moisturiser")) tail.push("moisturiser in the shower");
  if (tail.length) out.body += " " + tail.join(", ") + ".";
  return out;
}

self.addEventListener("push", function(e){
  e.waitUntil((async function(){
    /* the payload is one of five words and carries nothing else; it is only
       a fallback for the hour, which is what actually decides the words */
    var kind = "evening";
    try {
      var pl = e.data ? e.data.json() : null;
      if (pl && typeof pl.t === "string") kind = pl.t;
    } catch(err){}
    var state = null;
    try {
      var c = await caches.open(STATE_CACHE);
      var r = await c.match("state");
      if (r) state = await r.json();
    } catch(err){}
    var now = new Date();
    var n = composeNudge(kind, state, localISO(now), now.getDay(), now.getHours());
    try {
      if (navigator.setAppBadge){
        if (n.badge) await navigator.setAppBadge(n.badge);
        else await navigator.clearAppBadge();
      }
    } catch(err){}
    /* iOS requires a visible notification per push; the quiet good-news one
       still shows, but says so and asks nothing. Tagging by band rather than
       by payload means two pings that land in the same band replace each
       other instead of stacking - which is what happens on a travel day. */
    await self.registration.showNotification(n.title, {
      body: n.body,
      icon: "./icon-180.png",
      badge: "./icon-180.png",
      silent: !!n.silent,
      tag: "daylight-" + n.slot,
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

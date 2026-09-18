"use strict";

/* ========================================================================
   state.js - the save, the clock, and every rule of the game.

   All state lives in localStorage under one key that has not changed since
   v4: a nine-generation-old save opens in this build with its days, cards,
   pot and freezes intact. Every count here is recomputed from the record
   rather than incremented, so nothing can drift.
   ======================================================================== */
/* ---------------------------------------------------------------- storage
   v5 reads a v4 save untouched: every field the old app wrote still means the
   same thing, and the two new ones (crafted, spent spares) default empty. */
var KEY = "daylight.v4";
var S = load();

function load(){
  var d = { camp:"Singapore", wake:"08:30", bed:"23:45", done:{}, skip:{}, filter:0,
            days:{}, threads:{}, cards:{}, rewards:{}, claimed:{}, openedDay:0, openedStreak:0,
            theme:null, mute:false, rate:0, spends:[], freezes:{},
            crafted:{}, sparesSpent:0, seen:{}, booted:0, onboarded:0, cardsWhy:0,
            season:1, vault:{}, setsEver:0, liftPick:{}, work:{},
            quests:{}, lived:{}, chips:{}, chipRewards:{}, lastBackup:0,
            monthSeen:{}, pushOn:0, look:"sky", badge:1, autoZone:1, showDone:{}, notes:{},
            where:{}, walks:{}, levelSeen:0, gymHere:null, care:{},
            people:[], spoke:{}, peopleSeeded:0, lastOpen:"", lastSeen:0,
            jokers:{}, jokerSlots:[], slotsBought:0, anteSeen:"",
            lifts:{}, food:{}, waist:[], kg:0,
            water:{}, sleep:{}, out:{},
            hand:{ do:[], in:[] }, doneDo:{}, kept:{}, dealtDo:{}, dealtIn:{},
            /* anything not listed here does not survive a reload */
            sess:null, folds:{}, pushBundle:"", pushMade:"" };
  try {
    var raw = localStorage.getItem(KEY);
    if (raw){ var p = JSON.parse(raw); for (var k in d) if (k in p) d[k] = p[k]; }
  } catch(e){}
  /* A save with history belongs to someone who already knows what the three
     are. Only a genuinely empty one gets the tutorial board. */
  if (!d.onboarded && Object.keys(d.days).length) d.onboarded = 1;
  return d;
}
function save(){
  FD = null; XPC = null;
  if (typeof TIERS !== "undefined") TIERS = null;
  if (typeof GMC !== "undefined") GMC = null;
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){}
  mirrorState();
}
/* A copy of the day's shape where the service worker can reach it (it cannot
   read localStorage), so a push can say what is actually true instead of
   guessing. Written on every save, read when a ping lands. Since v37 it
   also carries tomorrow's brief, so the 08:00 push can describe a day the
   app has not been opened on yet. Fire-and-forget; the app never waits. */
function mirrorState(){
  try {
    if (typeof caches === "undefined") return;
    var t = today(), tm = shift(1);
    var owing = PILLARS.filter(function(g){ return required(g[0], t) && !pDone(t, g[0]); });
    var open = owing.map(function(g){ return g[1]; });
    var openKeys = owing.map(function(g){ return g[0]; });
    var briefs = {};
    briefs[t] = briefFor(t);
    briefs[tm] = briefFor(tm);
    var sit = situation(), r = rank();
    var sh = shape();
    var body = { day: t, open: open, openKeys: openKeys, run: dayRun(), best: bestRunEver(),
                 chip: chipNext(), week: weekScore(), briefs: briefs,
                 where: sit.home ? null : { c: sit.city, k: sit.kind },
                 level: { n: r.level, name: r.name, away: daysToNext(r) },
                 /* the routines still open, split by the part of the day they
                    belong to, so a ping can ask for the one it is standing in
                    without ever asking for the other */
                 care: typeof careOpen === "function"
                   ? { day: careOpen("day"), night: careOpen("night") } : null,
                 /* the shift, in the phone's own clock, so the middle-of-the-day
                    pings can say what is actually about to happen */
                 shift: { start: sh.startT, end: sh.endT, none: !!sh.noShift },
                 /* whoever he has drifted furthest past, and what o'clock it
                    is where they are - the one thing a push can tell him that
                    he genuinely does not know */
                 who: (function(){
                   if (typeof personDue !== "function") return null;
                   var d = personDue();
                   if (!d) return null;
                   var m = zoneMin(d.tz);
                   return { name: d.name, since: sinceWord(d.id),
                            at: m === null ? "" : hhmm(m),
                            up: m === null ? 0 : (windowAt(m) === "asleep" ? 0 : 1) };
                 })(),
                 /* the window closing soonest, so a ping can say the one thing
                    that is genuinely about to stop being possible rather than
                    counting what is open */
                 shut: (function(){
                   if (typeof winClosing !== "function") return null;
                   try {
                     var w = winClosing(t);
                     if (!w) return null;
                     return { label: w.label, left: Math.round(winLeft(w)),
                              at: hhmm(w.shut % 1440),
                              who: w.who || "" };
                   } catch(e){ return null; }
                 })(),
                 badgeOn: S.badge ? 1 : 0 };
    caches.open("daylight-state").then(function(c){
      return c.put("state", new Response(JSON.stringify(body),
        { headers: { "Content-Type": "application/json" } }));
    }).catch(function(){});
  } catch(e){}
}

/* days[iso] = { p:{}, said:"...", kept:bool, bedok:bool, gap:"..." } */
function day(iso){
  var d = S.days[iso];
  if (!d){ d = S.days[iso] = { p:{} }; }
  if (!d.p) d.p = {};
  return d;
}

/* ---------------------------------------------------------------- dates */
function iso(d){
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-"
       + String(d.getDate()).padStart(2,"0");
}
function today(){ return iso(new Date()); }
function shift(n){ var d = new Date(); d.setDate(d.getDate()+n); return iso(d); }
function nice(s){
  var p = s.split("-"), m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return Number(p[2]) + " " + m[Number(p[1])-1];
}
/* Saturday and Sunday. There is no Malta shift on either, which is the whole
   reason the "Stopped" pillar behaves differently on them. */
function isWeekend(k){
  var d = new Date(k + "T00:00:00").getDay();
  return d === 0 || d === 6;
}

/* ---------------------------------------------------------------- day shape */
function t2m(s){ var p = s.split(":"); return Number(p[0])*60 + Number(p[1]); }
function hhmm(m){ m = ((m % 1440) + 1440) % 1440;
  return String(Math.floor(m/60)).padStart(2,"0") + ":" + String(m%60).padStart(2,"0"); }
/* ------------------------------------------------------------ the clock
   Where he is standing, read off the phone with no permission: the IANA zone
   names the place, the offset lands the shift, and both already follow the
   clocks changing wherever he is. The manual camp is the fallback for a
   phone left on Singapore time. */
function deviceZone(){
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch(e){ return ""; }
}
function deviceOffset(){ return -new Date().getTimezoneOffset(); }
function zoneCity(z){
  if (ZONES[z]) return ZONES[z][0];
  var tail = String(z || "").split("/").pop().replace(/_/g, " ");
  return tail || "somewhere new";
}
function offset(){
  if (S.autoZone !== 0 && deviceZone()) return deviceOffset();
  for (var i=0;i<CAMPS.length;i++) if (CAMPS[i][0] === S.camp) return CAMPS[i][1];
  return 480;
}
/* --------------------------------------------------------- where he is
   One record a day: the city the phone's clock says he woke up in, and what
   a day there usually is. Written on the first open of each day and never
   rewritten, so a flight keeps the city it started in and the past cannot
   change under him.

   The kind is a first guess only - Sofia reads as a work trip, Bali as a
   holiday - and one tap on Today corrects it for the whole stay. Nothing is
   ever ticked or untucked on his behalf; the only thing a holiday changes is
   that Stopped is carried, exactly as it is at the weekend. */
function whereOn(k){ return (S.where || {})[k] || null; }
function whereKeys(){ return Object.keys(S.where || {}).sort(); }
function campKind(name){
  if (name === "Singapore") return "home";
  if (/Sheffield|UK/.test(name || "")) return "family";
  if (name === "Valletta") return "hq";
  return "work";
}
function guessKind(z, k){
  if (ZONES[z]) return ZONES[z][1];
  return isWeekend(k) ? "holiday" : "work";       /* an unlisted zone: a weekday is work */
}
function noteWhere(){
  var k = today(), rec = whereOn(k);
  var z = S.autoZone === 0 ? "" : deviceZone();
  if (rec){
    /* The day used to be stamped on the first open and never looked at again,
       so a flight home at noon left him standing in the country he took off
       from until midnight. The phone's clock is the ground truth: if it has
       moved since the stamp, and he has not set the place himself, the day
       moves with it. */
    if (z && !rec.m && !rec.g && rec.z !== z){
      rec.c = zoneCity(z); rec.z = z; rec.k = guessKind(z, k);
      delete rec.f;
      var yz = whereOn(shift(-1));
      if (yz && yz.z === z && yz.f){ rec.k = yz.k; rec.f = 1; }
      save();
    }
    return rec;
  }
  var made = z
    ? { c: zoneCity(z), z: z, k: guessKind(z, k) }
    : { c: String(S.camp || "Singapore").replace(" / UK", ""), z: "", k: campKind(S.camp) };
  /* a stay he has already corrected keeps its correction */
  var y = whereOn(shift(-1));
  if (y && y.z === made.z && y.f){ made.k = y.k; made.f = 1; }
  S.where = S.where || {};
  S.where[k] = made;
  save();
  return made;
}
/* The zone we know a place by, so naming a city can set the clock with it. */
function zoneFor(city){
  for (var z in ZONES) if (ZONES[z][0] === city) return z;
  return "";
}
/* The nearest place we know to a fix, and how far off it is. */
function placeFromFix(la, lo){
  var best = null, bestKm = Infinity;
  PLACES.forEach(function(pl){
    var km = kmBetween([la, lo], [pl[1], pl[2]]);
    if (km < bestKm){ bestKm = km; best = pl; }
  });
  if (!best) return null;
  return { city: best[0], kind: best[3], km: Math.round(bestKm), near: bestKm <= PLACE_KM };
}
/* What the ground says, which beats the clock. A fix speaks for now and only
   now, so it writes today and leaves the days behind it alone - he may well
   have been in Germany yesterday. Marked so the clock cannot undo it. */
function setWhereFromFix(la, lo){
  var hit = placeFromFix(la, lo);
  if (!hit || !hit.near) return hit;
  var k = today();
  S.where = S.where || {};
  var was = (whereOn(k) || {}).c;
  S.where[k] = { c: hit.city, z: zoneFor(hit.city), k: hit.kind, g: 1 };
  save();
  hit.was = was;
  hit.changed = was !== hit.city;
  return hit;
}
/* His own answer, which beats the clock. Applied backwards over the stay the
   way a work/holiday correction is, so one tap fixes the whole trip, and
   marked so the next open does not quietly put it back. */
function setWhere(city){
  var k = today(), rec = whereOn(k) || {}, wasCity = rec.c;
  var z = zoneFor(city);
  var made = { c: city, z: z, k: campKind(city) === "home" ? "home" : (ZONES[z] ? ZONES[z][1] : "work"), m: 1 };
  S.where = S.where || {};
  var d = k;
  for (var i = 0; i < 90; i++){
    var r = whereOn(d);
    if (i > 0 && (!r || r.c !== wasCity)) break;
    S.where[d] = { c: made.c, z: made.z, k: made.k, m: 1 };
    d = shiftFrom(d, -1);
  }
  save();
  return made;
}
/* How many days this stay has run, counting back while the city holds. */
function tripDay(k, rec){
  if (!rec || rec.k === "home") return 0;
  var n = 0, d = k;
  for (var i = 0; i < 90; i++){
    var r = whereOn(d);
    if (!r || r.c !== rec.c) break;
    n++;
    d = shiftFrom(d, -1);
  }
  return Math.max(1, n);
}
function shiftFrom(k, n){
  var d = new Date(k + "T00:00:00"); d.setDate(d.getDate() + n); return iso(d);
}
function kindWord(kind){
  return kind === "holiday" ? "holiday" : kind === "work" ? "work trip"
       : kind === "hq" ? "head office" : kind === "family" ? "home leave" : "home";
}
function situation(k){
  k = k || today();
  var rec = whereOn(k);
  if (!rec && k === today()){
    var z = S.autoZone === 0 ? "" : deviceZone();
    rec = z ? { c: zoneCity(z), z: z, k: guessKind(z, k) }
            : { c: String(S.camp || "Singapore").replace(" / UK", ""), z: "", k: campKind(S.camp) };
  }
  if (!rec) rec = { c: "Singapore", z: "Asia/Singapore", k: "home" };
  var city = rec.c, pin = pinToday();
  /* Sheffield and London are one time zone; only a pin can tell them apart */
  if (rec.k === "family" && pin && pin.l) city = pin.l;
  return { zone: rec.z, city: city, kind: rec.k, set: !!rec.f,
           home: rec.k === "home", away: rec.k !== "home",
           word: kindWord(rec.k), day: tripDay(k, rec) };
}
/* His correction, applied backwards over the whole stay so one tap covers it. */
function flipWhere(){
  var k = today(), rec = whereOn(k);
  if (!rec || rec.k === "home") return null;
  var to = rec.k === "holiday" ? "work" : "holiday";
  var d = k;
  for (var i = 0; i < 90; i++){
    var r = whereOn(d);
    if (!r || r.c !== rec.c) break;
    r.k = to; r.f = 1;
    d = shiftFrom(d, -1);
  }
  save();
  return to;
}
function holidayOn(k){ var r = whereOn(k); return !!(r && r.k === "holiday"); }
/* A day whose city is not the one before it: he was in the air. It carries
   the run the way a freeze does, and costs him nothing - a routine that
   survives travel is the whole point. */
function flying(k){
  var rec = whereOn(k);
  if (!rec) return false;
  var ks = whereKeys(), i = ks.indexOf(k);
  if (i <= 0) return false;
  return (S.where[ks[i - 1]] || {}).z !== rec.z;
}
function carried(k){ return frozen(k) || flying(k); }

/* ------------------------------------------------------------- Sheffield
   The one clock that is not his and not Malta's. Computed, never typed:
   the app used to say "About 07:00 in Sheffield right now" at any hour, from
   any city. */
function ukOffset(when){ return euSummer(when || new Date()) ? 60 : 0; }
function sheffieldMin(){
  var n = new Date();
  var utc = n.getUTCHours() * 60 + n.getUTCMinutes();
  return ((utc + ukOffset(n)) % 1440 + 1440) % 1440;
}
function sheffieldAwake(){ var m = sheffieldMin(); return m >= 7 * 60 && m < 21 * 60 + 30; }
function familyLine(){
  var sit = situation();
  if (sit.kind === "family") return "You are there. Sitting with someone is the call.";
  var m = sheffieldMin(), t = hhmm(m);
  if (m < 7 * 60 || m >= 22 * 60)
    return t + " in Sheffield \u2014 asleep. The window opens in " + dur((7 * 60 - m + 1440) % 1440) + ".";
  if (m < 9 * 60) return t + " in Sheffield \u2014 kettle-on hour.";
  if (m < 12 * 60) return "Mid-morning in Sheffield, " + t + ". A good window.";
  if (m < 17 * 60) return "Afternoon in Sheffield, " + t + ". They are about.";
  return "Evening in Sheffield, " + t + " \u2014 the best window of the day.";
}
function stopLine(){
  var sh = shape();
  if (sh.noShift) return "No shift today \u2014 carried.";
  if (sh.now >= sh.end) return "Malta finished at " + sh.endT + ". Shut the laptop and take the point.";
  if (sh.working) return "Malta until " + sh.endT + " \u00b7 " + dur(sh.end - sh.now) + " to go.";
  return "Malta runs " + sh.startT + "\u2013" + sh.endT + " here. Stopping on time is the whole skill.";
}

/* -------------------------------------------------------------- the pin
   One location read, on a tap, never at launch: iOS re-asks home-screen apps
   every time, so this is a button and not a background habit. It is kept
   OUTSIDE the save - exportSave and the coach file carry everything in S, and
   a coordinate has no business in either. Two decimals is about a kilometre:
   enough to centre a map search, not enough to name a street. */
var PIN_KEY = "daylight.pin";
function pinToday(){
  try {
    var raw = localStorage.getItem(PIN_KEY);
    if (!raw) return null;
    var p = JSON.parse(raw);
    return p && p.d === today() ? p : null;
  } catch(e){ return null; }
}
function pinSave(la, lo){
  var label = null;
  if (kmBetween([la, lo], HOMES.Sheffield) <= 40) label = "Sheffield";
  else if (kmBetween([la, lo], HOMES.Singapore) <= 40) label = "Singapore";
  var p = { d: today(), la: la, lo: lo, l: label };
  try { localStorage.setItem(PIN_KEY, JSON.stringify(p)); } catch(e){}
  return p;
}
/* The maps link for a search, centred on the pin when there is a fresh one. */
function nearHref(key){
  var p = pinToday();
  return mapsURL(NEAR[key] || key, p ? [p.la, p.lo] : null,
    typeof isiOS === "function" ? isiOS() : false);
}

/* Great-circle km between two [lat, lng] pairs. */
function kmBetween(a, b){
  var R = 6371, dLat = (b[0] - a[0]) * Math.PI / 180, dLon = (b[1] - a[1]) * Math.PI / 180;
  var s = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
/* A search handed to the phone's own maps app - Apple on an iPhone, Google
   elsewhere. Nothing is fetched; the URL is opened and the app steps back. */
function mapsURL(q, pt, ios){
  var query = encodeURIComponent(q);
  if (ios) return "https://maps.apple.com/?q=" + query + (pt ? "&sll=" + pt[0].toFixed(2) + "," + pt[1].toFixed(2) : "");
  return "https://www.google.com/maps/search/?api=1&query=" + query
    + (pt ? "&center=" + pt[0].toFixed(2) + "," + pt[1].toFixed(2) : "");
}
function shape(){
  var off = offset(), wake = t2m(S.wake);
  var w = workUTC(new Date());
  var start = w[0] + off, end = w[1] + off;
  var n = new Date(), nowLocal = n.getHours()*60 + n.getMinutes();
  var wknd = isWeekend(today()), hol = holidayOn(today());
  return {
    start:start, end:end, wake:wake, now:nowLocal,
    startT:hhmm(start), endT:hhmm(end),
    morning:Math.max(0, start - wake),
    evening:Math.max(0, 1380 - end),
    untilWork:start - nowLocal,
    working: nowLocal >= start && nowLocal < end && !wknd && !hol,
    late: end >= 1440,
    weekend: wknd,
    /* a holiday has no shift to finish, exactly like a Saturday */
    holiday: hol,
    noShift: wknd || hol
  };
}
function dur(m){
  m = Math.max(0, Math.round(m));
  var h = Math.floor(m/60), r = m%60;
  if (h && r) return h + "h " + r + "m";
  return h ? h + "h" : r + "m";
}

/* ------------------------------------------------------------ the three
   A pillar is required on a day when it is possible to do it honestly.
   "Stopped" means finishing when the shift finishes, and at the weekend there
   is no shift to finish - so it is carried rather than owed. This is the same
   rule his Mandarin study already runs on: weekdays only, the weekend absorbed
   rather than counted as a failure. It only ever adds days; nothing he has
   already earned can go down. */
function required(key, k){
  /* A holiday is a weekend that lasts longer: there is no Malta shift to
     finish, so Stopped is carried rather than owed. This only ever turns an
     owed day into a met one, so nothing he has already earned can go down. */
  if (key === "stop" && (isWeekend(k) || holidayOn(k))) return false;
  return true;
}
function pDone(k, key){
  var d = S.days[k];
  return !!(d && d.p && d.p[key]);
}
/* Satisfied for the purposes of a full day and a streak: either ticked, or not
   owed today. */
function pMet(k, key){ return pDone(k, key) || !required(key, k); }
function allThree(k){
  return PILLARS.every(function(g){ return pMet(k, g[0]); })
      && PILLARS.some(function(g){ return pDone(k, g[0]); });
}
function monthOf(k){ return k.slice(0, 7); }

/* The number the flame wears: consecutive full days ending today or
   yesterday, frozen days carrying the run without counting. */
/* ------------------------------------------------------------- side quests
   One held card a day asks something of him. Completing it pays spares and
   XP - never money, the pot stays consistency-only - and marks the card
   "lived", which no pack can do. */
function cardDo(c){
  var f = SET_DO[c[2]] || SET_DO_ANY;
  return CARD_DO[c[0]] || f(c[0], c);
}
/* A lived card is the record. Living one used to be possible only on the day
   the hash happened to pick it as the side quest; now any held card can be
   lived from its own sheet, and both routes land here. Paid once per card,
   from the record, so neither route can pay twice. */
function livedCount(){ return Object.keys(S.lived || {}).length; }
function liveCard(name){
  if (!(S.cards || {})[name]) return false;
  S.lived = S.lived || {};
  if (S.lived[name]) return false;
  S.lived[name] = today();
  save();
  return true;
}
function questFor(k){
  var q = (S.quests || {})[k];
  /* Once the day's quest has been acted on it is pinned by name. Before this,
     the card was re-derived from the held pool on every call, so opening a
     pack - or living the card - moved the quest to a different card while it
     was showing as done. */
  if (q && q.card && cardByName(q.card) && (S.cards || {})[q.card]){
    var pinned = cardByName(q.card);
    return { card: pinned, text: cardDo(pinned), done: !!q.done, swaps: q.swaps || 0 };
  }
  var all = CARDS.filter(function(c){ return (S.cards || {})[c[0]]; });
  /* The day's quest should be something he has not done yet. Only once every
     held card is lived does it start sending him back round. */
  var fresh = all.filter(function(c){ return !(S.lived || {})[c[0]]; });
  var held = fresh.length ? fresh : all;
  if (!held.length) return null;
  var skip = q && q.swaps ? q.swaps : 0;
  var h = 0, str = k + "~q" + skip;
  for (var j = 0; j < str.length; j++) h = (h * 31 + str.charCodeAt(j)) >>> 0;
  var c = held[h % held.length];
  return { card: c, text: cardDo(c), done: !!(q && q.done), swaps: skip };
}
function questsDone(){
  var n = 0;
  Object.keys(S.quests || {}).forEach(function(k){ if (S.quests[k].done) n++; });
  return n;
}

/* --------------------------------------------------------------- the chips
   Earned at the longest run he has ever held; never taken back. */
function bestRunEver(){
  var keys = Object.keys(S.days).filter(allThree).sort();
  if (!keys.length) return 0;
  var best = 0, run = 0;
  var d = new Date(keys[0] + "T00:00:00");
  var end = new Date(keys[keys.length - 1] + "T00:00:00");
  while (d <= end){
    var k = iso(d);
    if (allThree(k)){ run++; if (run > best) best = run; }
    else if (!carried(k)) run = 0;
    d.setDate(d.getDate() + 1);
  }
  return best;
}
function chipsEarned(){
  var b = Math.max(bestRunEver(), dayRun());
  return CHIPS.filter(function(c){ return b >= c[0]; });
}
/* the next chip not yet celebrated, if the current run has reached it */
function chipDue(){
  var run = dayRun();
  for (var i = 0; i < CHIPS.length; i++){
    var t = CHIPS[i][0];
    if (run >= t && !(S.chips || {})[t]) return CHIPS[i];
  }
  return null;
}
/* Chips earned before chips existed are marked quietly at startup - a
   ceremony for something he did weeks ago would be the app applauding
   itself. Only a run that crosses a threshold live gets the moment. */
function backfillChips(){
  var b = bestRunEver(), touched = 0;
  S.chips = S.chips || {};
  CHIPS.forEach(function(c){
    if (b >= c[0] && !S.chips[c[0]]){ S.chips[c[0]] = today(); touched = 1; }
  });
  if (touched) save();
}

/* ---------------------------------------------------------------- next up
   What the hour points at. The shift is the spine: train before Malta
   wakes, family in the Sheffield-friendly window, stop when it closes. */
function nextUp(){
  var t = today(), sh = shape(), dw = new Date().getDay();
  var open = PILLARS.filter(function(g){ return required(g[0], t) && !pDone(t, g[0]); })
                    .map(function(g){ return g[0]; });
  if (!open.length) return null;
  var wake = sheffieldAwake();
  if (open.indexOf("stop") >= 0 && !sh.noShift && sh.now >= sh.end) return "stop";
  /* Mum's day, but only once there is somebody awake to answer. The old rule
     fired at any hour on a Wednesday, which in Singapore meant being told to
     ring Sheffield at two in the morning. */
  if (open.indexOf("family") >= 0 && dw === 3 && wake) return "family";
  if (open.indexOf("train") >= 0 && (sh.noShift || sh.now < sh.start)) return "train";
  if (open.indexOf("family") >= 0 && wake) return "family";
  return open[0];
}
function tipFor(key, day){
  var pool = TIPS[key] || [];
  if (!pool.length) return "";
  var k = (day || today()) + key, h = 0;
  for (var j = 0; j < k.length; j++) h = (h * 33 + k.charCodeAt(j)) >>> 0;
  return pool[h % pool.length];
}

/* ------------------------------------------------------- the one instruction
   His words: "when I go to the today page, I want to know what my top
   priorities are without being overwhelmed by information." So the sky card
   stops counting and starts instructing: one line saying what to do, one
   saying when - or, on the last thing left, what is at stake.

   Every screen and both pushes read this same function, so the app can never
   tell him two different things about the same day. */
/* opts.noPacks: ask for the day rather than the backlog. The front page uses
   it, because "open it below" is nonsense on a screen with no below - and
   because a pile of unopened packs is a nice problem, not the thing the day
   is about. */
function priority(opts){
  var t = today(), sit = situation();
  var w = packsWaiting(), packs = w.day + w.streak;
  /* A waiting pack used to take the hero on any day it existed, which meant
     that once a few had stacked up the one sentence that says what to do
     said "25 packs waiting" every hour of every day instead. The prize is
     not the mission. It leads only when there is nothing left to ask for -
     the rest of the time the chest below says so, which is its job. */
  if (packs && !(opts && opts.noPacks) && allThree(t))
    return { ask: packs === 1 ? "That is a pack." : packs + " packs waiting.",
             sub: "Earned, not given.",
             cta: { tab: "cards", label: packs === 1 ? "Open it" : "Open them" } };
  var rc = recordChase(), r = rank(), dn = daysToNext(r);
  if (allThree(t)){
    var tb = briefFor(shift(1));
    var wk = typeof weekState === "function" ? weekState() : null;
    var sub = wk && !wk.kept && wk.alive && wk.need === 1
                ? "One more full day keeps the week."
            : rc && rc.at ? "Record pace \u2014 " + rc.run + " days. Back tomorrow."
            : dn && dn <= 3 ? "Level " + (r.level + 1) + " in " + dn + (dn === 1 ? " full day." : " full days.")
            : wk && wk.kept ? "The week is kept. Nothing owed until Monday."
            : "Tomorrow \u00b7 " + (tb.gym || tb.first);
    return { ask: "Today is in.", sub: sub, won: 1 };
  }

  /* A comeback is a fact about the day, not an instruction - so it colours
     the line underneath rather than replacing the only sentence on the screen
     that says what to do. "Back." on its own answers nothing. */
  var come = S.onboarded && isComebackDay(t) ? gapBefore(t, recordStart()) : 0;
  var back = come ? " Away " + come + " days \u2014 today pays double." : "";

  var owed = PILLARS.filter(function(g){ return required(g[0], t) && !pDone(t, g[0]); }).length;
  var up = nextUp();
  /* The stake. A game that never tells you what is on the line is a list of
     chores, so this is checked on every owed day and not only on the last
     thing left: the record first, then the level, then the chip, then the
     week - and the week is the one that is true most often, which is the
     whole reason it became the unit in v50. */
  var wkS = typeof weekState === "function" ? weekState() : null;
  var chip = typeof chipNext === "function" ? chipNext() : null;
  var stake = null;
  if (owed === 1 && rc) stake = rc.at ? "One more \u2014 tonight beats your record of " + rc.best + "."
                                      : "One more \u2014 " + rc.away + " from your record of " + rc.best + ".";
  else if (owed === 1 && dn === 1) stake = "One more \u2014 tonight is a level.";
  else if (owed === 1 && chip && chip.away === 1) stake = "One more \u2014 tonight mints the "
    + String(chip.name).toLowerCase() + " chip.";
  else if (wkS && !wkS.kept && wkS.alive && wkS.need === wkS.left && wkS.left > 0)
    stake = wkS.left === 1 ? "Last day of the week \u2014 this one keeps it."
          : "Every day left has to land to keep the week.";
  else if (wkS && !wkS.kept && wkS.alive && wkS.need === 1)
    stake = "A full day today keeps the week.";

  if (!up) return { ask: owed === 3 ? "Three things make a day."
                       : "Two things make a " + DAY_NAMES[new Date().getDay()] + ".",
                    sub: (stake || "Tick what you have done.") + back };

  /* Every branch now carries ONE obvious thing to do. A game has a button
     that starts the thing; this screen used to have a button on exactly one
     of three branches, which is why it read as a list to be audited rather
     than a session to be played. */
  if (up === "train"){
    var ga = typeof gymAsk === "function" ? gymAsk() : null;
    return { ask: ga ? ga.ask : "Train.",
             sub: (stake || (ga ? ga.sub : "Gym, a run, or a long walk.")) + back,
             cta: (ga && ga.cta) ? ga.cta : { tab: "gym", label: "Open the gym" } };
  }
  if (up === "family"){
    var due = typeof personDue === "function" ? personDue() : null;
    var roster = typeof peopleEmpty === "function" && !peopleEmpty();
    return { ask: due ? "Ring " + due.name + "." : "Call home.",
             sub: (stake || (typeof peopleLine === "function" ? peopleLine() : familyLine())) + back,
             cta: { act: "people", label: roster ? (due ? "Ring " + due.name : "Who did you speak to?")
                                                 : "Log the call" } };
  }
  var sh = shape();
  var over = sh.now >= sh.end && !sh.noShift;
  return { ask: over ? "Stop. Malta finished at " + sh.endT + "." : "Stop when Malta does.",
           sub: (stake || stopLine()) + back,
           cta: (over || sh.noShift) ? { act: "tick:stop", label: "I finished on time" } : null };
}
/* What the row the hour points at says inside the row itself. */
function planLine(key){
  if (key === "train"){
    var ga = typeof gymAsk === "function" ? gymAsk() : null;
    return ga && ga.row ? ga.row : tipFor("train");
  }
  if (key === "family") return typeof peopleLine === "function" ? peopleLine() : familyLine();
  return stopLine();
}

/* ------------------------------------------------------------ the brief
   A day, described before it happens: which pillar comes first and when,
   which gym session it is, and the card that is asking. Written for two
   readers - the sky card the moment today is in (tomorrow, as the thing to
   look forward to) and the 08:00 push, which reads it off the mirror. */
var DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function briefFor(k){
  var d = new Date(k + "T00:00:00"), dow = d.getDay(), t = today();
  var wkend = dow === 0 || dow === 6;
  var w = workUTC(d), start = hhmm(w[0] + offset());
  var sit = situation(k > t ? t : k);        /* tomorrow is described from where he is tonight */
  var hol = holidayOn(k) || (k > t && sit.kind === "holiday");
  var head = DAY_NAMES[dow]
    + (sit.home ? "" : " · " + sit.city)
    + (dow === 3 ? " · Mum’s day" : (wkend || hol) ? " · no shift" : "");
  var first = hol
    ? "Two things make a holiday: move, and call home."
    : dow === 0
    ? "Two things make a Sunday. Train early, call home. Tape at the navel first, before you eat."
    : wkend
    ? "Two things make a " + DAY_NAMES[dow] + ". Train early, call home."
    : "Train before Malta wakes at " + start + (sit.home ? "." : ", which is " + start + " where you are.");
  /* the gym only knows sessions once gym.js is loaded; the brief degrades */
  var gym = null;
  if (typeof stageLifts === "function" && typeof nextSessionKey === "function"){
    var key;
    if (k === t) key = todaySession() || nextSessionKey();
    else {
      var lt = (S.lifts || {})[t];
      if (lt && lt.s && Object.keys(lt.ex || {}).length){
        var at = SESSIONS.map(function(x){ return x[0]; }).indexOf(lt.s);
        key = SESSIONS[(at + 1) % SESSIONS.length][0];
      } else key = nextSessionKey();
    }
    if (typeof gymWords === "function") gym = gymWords(k, key);
    if (!gym){
      var n = stageLifts(key).length;
      gym = "Session " + key + ", " + n + (n === 1 ? " move" : " moves");
    }
  }
  var card = null;
  var hd = typeof handDo === "function" ? handDo() : [];
  if (hd.length) card = hd[0][1];
  else {
    var q = questFor(k);
    if (q) card = q.card[0] + " — " + q.text;
  }
  return { day: k, dow: dow, name: DAY_NAMES[dow], head: head, first: first,
           gym: gym, card: card };
}

/* ---------------------------------------------------------- the record chase
   Racing his own best self. Only speaks once the record is worth chasing
   (a week) and the run is within a week of it. */
function recordChase(){
  var run = dayRun(), best = bestRunEver();
  if (best < 7) return null;
  if (run >= best) return { at: true, run: run, best: best, away: 0 };
  var away = best - run;
  if (away > 7) return null;
  return { at: false, run: run, best: best, away: away };
}
/* the first chip not yet minted, and how far the current run is from it */
function chipNext(){
  var run = dayRun();
  for (var i = 0; i < CHIPS.length; i++){
    if (!(S.chips || {})[CHIPS[i][0]]){
      return { t: CHIPS[i][0], name: CHIPS[i][1], away: Math.max(0, CHIPS[i][0] - run) };
    }
  }
  return null;
}
/* Monday to today: full days so far this week, and how many days that is */
function weekScore(){
  if (typeof weekKey !== "function") return null;
  var days = weekDays(weekKey()), full = 0;
  days.forEach(function(k){ if (allThree(k)) full++; });
  return { full: full, of: days.length };
}

/* ------------------------------------------------------------ the comeback
   Real games never punish the return; the return is the win. A full day that
   follows three or more straight misses is a comeback, and it pays double.
   Derived from the record like everything else, so it can never be claimed
   twice and needs no button. Frozen days are not misses. */
function recordStart(){
  var first = null;
  PILLARS.forEach(function(g){
    var f = firstDay(g[0]);
    if (f && (!first || f < first)) first = f;
  });
  return first;
}
function gapBefore(k, first){
  var d = new Date(k + "T00:00:00"), n = 0;
  for (var i = 0; i < 60; i++){
    d.setDate(d.getDate() - 1);
    var j = iso(d);
    if (!first || j < first) break;
    if (allThree(j) || carried(j)) break;
    n++;
  }
  return n;
}
/* A comeback needs something to come back TO. The first version tested only
   for a three-day gap, which meant a two-day-old record with one gym session
   in it greeted him as a returning veteran - "Back. That was the hard part."
   on a screen showing 0/5 and an empty week. Nonsense, and the bad kind:
   the app claiming to know him when it plainly does not.

   So there has to be a habit behind the gap. Ten days of record and three
   full days is the floor; below that a quiet few days is just a new thing
   that has not started yet, and the app should say so rather than stage a
   homecoming. */
var COMEBACK_MIN_DAYS = 10, COMEBACK_MIN_FULL = 3;
function recordAge(){
  var first = recordStart();
  if (!first) return 0;
  return Math.round((new Date(today() + "T00:00:00")
    - new Date(first + "T00:00:00")) / 86400000) + 1;
}
function isComebackDay(k){
  k = k || today();
  var first = recordStart();
  if (!first || k <= first) return false;
  if (recordAge() < COMEBACK_MIN_DAYS) return false;
  if (fullDays() < COMEBACK_MIN_FULL) return false;
  return gapBefore(k, first) >= 3;
}
function comebackDays(){
  var first = recordStart();
  if (!first) return 0;
  return Object.keys(S.days).filter(allThree).filter(function(k){
    return k > first && gapBefore(k, first) >= 3;
  }).length;
}

/* ------------------------------------------------------------- the months
   His call, against the clean-reset school: a bad month is not deleted, it
   is remembered, because the pattern in it is the lesson. Everything here
   derives from the record - nothing new is stored, so it can never drift. */
function monthsWithData(){
  var set = {};
  Object.keys(S.days).forEach(function(k){ set[k.slice(0, 7)] = 1; });
  Object.keys(S.freezes || {}).forEach(function(k){ set[k.slice(0, 7)] = 1; });
  return Object.keys(set).sort();
}
function monthName(ym){
  return ["January","February","March","April","May","June","July","August",
    "September","October","November","December"][Number(ym.slice(5, 7)) - 1] + " " + ym.slice(0, 4);
}
function monthLedger(ym){
  var t = today();
  var first = null;
  PILLARS.forEach(function(g){
    var f = firstDay(g[0]);
    if (f && (!first || f < first)) first = f;
  });
  var start = new Date(ym + "-01T00:00:00");
  var end = new Date(start); end.setMonth(end.getMonth() + 1); end.setDate(0);
  /* a run standing at the 1st carries in from last month - walk back so the
     month is credited with the run he was actually on */
  var run = 0, back = new Date(start);
  for (;;){
    back.setDate(back.getDate() - 1);
    var bk = iso(back);
    if (allThree(bk)) run++;
    else if (!carried(bk)) break;
  }
  var full = 0, possible = 0, best = run, frozenUsed = 0;
  var missPW = { train:[0,0,0,0,0,0,0], family:[0,0,0,0,0,0,0], stop:[0,0,0,0,0,0,0] };
  var d = new Date(start);
  for (; d <= end; d.setDate(d.getDate() + 1)){
    var k = iso(d);
    if (k > t) break;
    if (!first || k < first) continue;
    /* today is still being played - it cannot have "broken" yet */
    if (k === t && !allThree(k)) break;
    possible++;
    if (allThree(k)){ full++; run++; if (run > best) best = run; }
    else if (carried(k)){ if (frozen(k)) frozenUsed++; }   /* a flight is not a miss either */
    else {
      run = 0;
      var dw = new Date(k + "T00:00:00").getDay();
      PILLARS.forEach(function(g){
        if (required(g[0], k) && !pDone(k, g[0])) missPW[g[0]][dw]++;
      });
    }
  }
  var quests = Object.keys(S.quests || {}).filter(function(k){
    return k.slice(0, 7) === ym && S.quests[k].done;
  }).length;
  var chips = Object.keys(S.chips || {}).filter(function(c){
    return String((S.chips || {})[c]).slice(0, 7) === ym;
  }).map(Number).sort(function(a, b){ return a - b; });
  return { ym: ym, full: full, possible: possible, best: best,
           frozenUsed: frozenUsed, missPW: missPW, quests: quests, chips: chips,
           lesson: monthLesson(missPW, possible) };
}
/* One deterministic sentence per month: which pillar broke, and whether the
   breaks cluster on a weekday. Code, not model - the lesson never wobbles. */
function monthLesson(missPW, possible){
  if (!possible) return null;
  var worst = null, worstN = 0, totals = {};
  PILLARS.forEach(function(g){
    var n = missPW[g[0]].reduce(function(a, b){ return a + b; }, 0);
    totals[g[0]] = n;
    if (n > worstN){ worstN = n; worst = g; }
  });
  if (!worstN) return "Clean. Nothing to fix.";
  var w = missPW[worst[0]], top = 0;
  for (var i = 1; i < 7; i++) if (w[i] > w[top]) top = i;
  var line = worst[1] + " broke " + worstN + (worstN === 1 ? " time" : " times");
  if (w[top] >= 2 && w[top] * 2 >= worstN){
    line += " — " + w[top] + " of them on "
      + ["Sundays","Mondays","Tuesdays","Wednesdays","Thursdays","Fridays","Saturdays"][top] + ".";
  } else {
    line += ", spread across the week.";
  }
  return line;
}
function prevMonthKey(){
  var d = new Date(today() + "T00:00:00");
  d.setDate(0);
  return iso(d).slice(0, 7);
}
/* The recap that greets a new month, once: the month that just closed, held
   up before it is filed. */
function monthRecapDue(){
  var pm = prevMonthKey();
  if ((S.monthSeen || {})[pm]) return null;
  if (monthsWithData().indexOf(pm) < 0) return null;
  var L = monthLedger(pm);
  return L.possible ? L : null;
}

/* --------------------------------------------------------- the coach file
   The loop he asked for: download this, hand it to Claude, get the next
   tuning of the game back. Instructions ride inside the file so any future
   session knows what it is holding. */
/* The coach file is the one thing in this app that is meant to leave the
   phone. Everything else - the pin, the backups, the push payloads - was
   built on the rule that the record stays here, and this file is the single
   deliberate exception, handed over by him, on purpose.

   Which means the people have to come out of it. Their names are now the
   most personal thing the app holds, and they add nothing whatsoever to a
   tuning question: what a coach needs is the SHAPE - how many, what rhythm,
   how far adrift, what time zone the call has to cross - and all of that
   survives being anonymous. So the roster, the call log and the written
   notes are all rewritten as "Person 1", "Person 2" on the way out.

   exportSave is deliberately NOT touched. That file is his own restore
   point; it goes from his phone to his own storage and back. */
function coachSafe(){
  var copy = {}, k;
  for (k in S) copy[k] = S[k];
  var names = [];
  copy.people = (S.people || []).map(function(p, i){
    names.push(String(p.name || ""));
    return { id: "p" + (i + 1), name: "Person " + (i + 1),
             where: p.where || "", tz: p.tz || "", every: p.every || 0 };
  });
  var spoke = {};
  (S.people || []).forEach(function(p, i){
    var l = (S.spoke || {})[p.id];
    if (l && l.length) spoke["p" + (i + 1)] = l;
  });
  copy.spoke = spoke;
  /* the day's written line can name them too, and that log is the part of
     the file most worth reading, so it is rewritten rather than dropped */
  if (S.notes){
    var notes = {};
    Object.keys(S.notes).forEach(function(d){
      var line = String(S.notes[d]);
      names.forEach(function(n, i){
        if (n.length >= 3) line = line.split(n).join("Person " + (i + 1));
      });
      notes[d] = line;
    });
    copy.notes = notes;
  }
  return copy;
}

function coachExport(){
  var derived = {
    months: monthsWithData().map(monthLedger),
    bestRunEver: bestRunEver(),
    currentRun: dayRun(),
    fullDays: fullDays(),
    questDaysOffered: Object.keys(S.quests || {}).length,
    questsDone: questsDone(),
    swapsUsed: Object.keys(S.quests || {}).filter(function(k){ return S.quests[k].swaps; }).length,
    livedCards: Object.keys(S.lived || {}),
    chips: S.chips || {},
    chipRewards: S.chipRewards || {},
    heldCards: heldCount(),
    totalCards: CARDS.length,
    spends: S.spends || [],
    rate: rate(),
    comebacks: comebackDays(),
    look: S.look || "sky",
    badge: S.badge ? 1 : 0,
    pushOn: S.pushOn ? 1 : 0,
    people: (S.people || []).length,
    callsLogged: Object.keys(S.spoke || {}).reduce(function(n, id){
      return n + ((S.spoke[id] || []).length); }, 0),
    adrift: (typeof personOver === "function")
      ? (S.people || []).filter(function(p){ return personOver(p) > 0; }).length : 0,
    routineDays: Object.keys(S.care || {}).length
  };
  return "# Daylight coach file\n\n"
    + "Exported " + today() + " from build " + (typeof BUILD !== "undefined" ? BUILD : "?") + ".\n\n"
    + "**Stuart:** hand this file to Claude (claude.ai or Claude Code, repo stuatnext/stu-bot)\n"
    + "with a sentence on how the last stretch actually felt.\n\n"
    + "**Claude:** read `docs/coaching.md` in stuatnext/stu-bot if you can reach it. Either way:\n"
    + "analyse the JSON below. Find the weakest pillar and any weekday pattern in the month\n"
    + "ledgers; judge whether the tips, side quests and chips are pulling their weight (quest\n"
    + "completion rate, lived cards, named rewards); then propose the smallest change to the\n"
    + "game that would most improve his consistency. Tune, do not redesign - and check the\n"
    + "proposal against what he has already approved before building anything.\n\n"
    + "Names in the roster, the call log and the written notes are replaced with\n"
    + "`Person 1`, `Person 2` and so on before export. That is deliberate: the shape\n"
    + "is what a tuning question needs, and who they are is his business.\n\n"
    + "```json\n"
    + JSON.stringify({ exported: today(), derived: derived, save: coachSafe() }, null, 1)
    + "\n```\n";
}

/* ------------------------------------------------------------- the record */
function exportSave(){ return JSON.stringify(S); }
function importSave(text){
  var p = JSON.parse(text);
  if (!p || typeof p !== "object" || !p.days) throw new Error("not a Daylight save");
  for (var k in S) if (k in p) S[k] = p[k];
  save();
}
function backupOverdue(){
  if (fullDays() < 7) return false;
  if (!S.lastBackup) return true;
  return (new Date(today() + "T00:00:00") - new Date(S.lastBackup + "T00:00:00")) / 86400000 > 30;
}

function dayRun(){
  var n = 0, d = new Date(), k = iso(d);
  if (!allThree(k)){ d.setDate(d.getDate() - 1); k = iso(d); }
  while (allThree(k) || carried(k)){
    if (allThree(k)) n++;
    d.setDate(d.getDate() - 1); k = iso(d);
  }
  return n;
}

/* The first day this pillar was ever recorded. Nothing before it counts as a
   miss - days before he started using the app are not failures. */
function firstDay(key){
  var ks = Object.keys(S.days).filter(function(k){ return pDone(k, key); }).sort();
  return ks.length ? ks[0] : null;
}

/* Freezes are spent by hand. An earlier version spent them the moment the
   streak walker found a gap, which meant they were gone before he knew a day
   had gone wrong - a safety net you cannot feel is not a safety net. */
function frozen(k){ return !!(S.freezes || {})[k]; }
function freezesUsed(month){
  return Object.keys(S.freezes || {}).filter(function(k){ return monthOf(k) === month; }).length;
}
function freezesLeft(month){
  return Math.max(0, FREEZES_PER_MONTH - freezesUsed(month || monthOf(today())));
}
function canFreeze(k){
  if (k > today() || allThree(k)) return false;
  if (flying(k)) return false;            /* a travel day already carries */
  return frozen(k) || freezesLeft(monthOf(k)) > 0;
}

/* Walk back from today. A frozen day carries the run across without counting
   toward it. A day the pillar was not owed on is skipped entirely. */
function streak(key){
  var first = firstDay(key);
  if (!first) return 0;
  var n = 0, now = new Date();
  for (var i = 0; i < 500; i++){
    var k = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
    if (k < first) break;
    if (pDone(k, key)){ n++; continue; }
    if (!required(key, k)) continue;        /* no shift to finish, so nothing owed */
    if (k === today()) continue;            /* today is not a miss until it is over */
    if (carried(k)) continue;               /* frozen on purpose, or a day in the air */
    break;
  }
  return n;
}
function bestStreak(){
  return Math.max.apply(null, PILLARS.map(function(g){ return streak(g[0]); }));
}
function totalDone(key){
  var n = 0;
  Object.keys(S.days).forEach(function(k){ if (pDone(k, key)) n++; });
  return n;
}

/* Counted once per change rather than once per card per pack draw. */
var FD = null;
function fullDays(){
  if (FD === null) FD = Object.keys(S.days).filter(allThree).length;
  return FD;
}

/* --------------------------------------------------------------- the packs
   Recomputed from the record rather than incremented, so nothing can drift and
   nothing can be lost. That property is worth more than any urgency mechanic,
   which is why there are no timers and nothing expires. */
function packCounts(){
  var full = Object.keys(S.days).filter(allThree).sort();
  var streakPacks = 0, run = 0, prev = null;
  full.forEach(function(k){
    if (prev){
      var gap = Math.round((new Date(k) - new Date(prev)) / 86400000);
      run = gap === 1 ? run + 1 : 1;
    } else run = 1;
    if (run % 7 === 0) streakPacks++;
    prev = k;
  });
  return { day: full.length, streak: streakPacks };
}
function packsWaiting(){
  var e = packCounts();
  return { day: Math.max(0, e.day - (S.openedDay || 0)),
           streak: Math.max(0, e.streak - (S.openedStreak || 0)) };
}
function packsTotal(){ var w = packsWaiting(); return w.day + w.streak; }

/* Weights track the pool rather than a guess at it, so a common pull is not
   four commons deep before an uncommon appears. */
function poolWeights(){
  var n = [0,0,0], i;
  for (i = 0; i < CARDS.length; i++) if (inPool(CARDS[i])) n[CARDS[i][1]]++;
  var t = n[0] + n[1] + n[2];
  if (!t) return [62, 27, 11];
  /* A mild bias toward common, so rare stays worth something. */
  return [n[0] / t * 100 * 1.25, n[1] / t * 100, n[2] / t * 100 * 0.72];
}
function rollRarity(r, boosted){
  var w = poolWeights();
  if (boosted) w = [w[0] * 0.62, w[1] * 1.15, w[2] * 2.1];
  var total = w[0] + w[1] + w[2], x = r * total;
  if (x < w[0]) return 0;
  if (x < w[0] + w[1]) return 1;
  return 2;
}

/* Gold is earned by hand and locked sets are not his yet, so neither can turn
   up in a pack. Pulling a card for a set you cannot see is a bug that looks
   like a feature until you try to find it. */
function inPool(c){ return c[2] !== "gold" && setOpen(c[2]); }

function openPack(kind){
  var size = kind === "streak" ? STREAK_PACK_SIZE : PACK_SIZE;
  var boosted = kind === "streak";
  var got = [], seed = (Date.now() ^ (Math.random() * 4294967296)) >>> 0;
  for (var n = 0; n < size; n++){
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    var rar = rollRarity(((seed >>> 8) & 0xffff) / 65536, boosted);
    var tier = CARDS.filter(function(c){ return c[1] === rar && inPool(c); });
    if (!tier.length) tier = CARDS.filter(function(c){ return c[1] === 0 && inPool(c); });
    if (!tier.length) tier = CARDS.filter(inPool);
    if (!tier.length) break;
    var fresh = tier.filter(function(c){ return !(S.cards || {})[c[0]] && got.indexOf(c[0]) < 0; });
    var from = fresh.length ? fresh : tier.filter(function(c){ return got.indexOf(c[0]) < 0; });
    if (!from.length) from = tier;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    var card = from[seed % from.length];
    got.push(card[0]);
    S.cards = S.cards || {};
    S.cards[card[0]] = (S.cards[card[0]] || 0) + 1;
    S.seen = S.seen || {};
    if (S.cards[card[0]] === 1) S.seen[card[0]] = 0;   /* new, not yet looked at */
  }
  /* Then the two that are not collected: something to do and something to
     keep. They ride on top of the collectibles rather than replacing one, or
     the deck would take three times as long to finish. Into the hand, oldest
     out if it is full - a Do card is a nudge, not a debt. */
  S.hand = S.hand || { do: [], in: [] };
  var d = pickDo();
  if (d){
    S.hand.do.push(d[0]);
    while (S.hand.do.length > 3) S.hand.do.shift();
    S.dealtDo = S.dealtDo || {}; S.dealtDo[d[0]] = (S.dealtDo[d[0]] || 0) + 1;
    got.push({ k: "do", id: d[0] });
  }
  var ins = pickIn();
  if (ins){
    S.hand.in.push(ins[0]);
    while (S.hand.in.length > 3) S.hand.in.shift();
    S.dealtIn = S.dealtIn || {}; S.dealtIn[ins[0]] = (S.dealtIn[ins[0]] || 0) + 1;
    got.push({ k: "in", id: ins[0] });
  }
  /* Every streak pack, and every third day pack, carries a joker. This is
     the reason a pack is worth opening: until now it paid cards into a
     binder nobody played with, and the loop dead-ended there. */
  if (typeof jokerDue === "function"){
    var owed = kind === "streak" || ((S.openedDay || 0) + 1) % 3 === 0;
    if (owed){
      /* Granted, but deliberately NOT pushed into got: that array drives the
         card ceremony, which counts every entry as a card and stalls on one
         it cannot draw. A joker is also too big to bury between two hawker
         cards - it gets its own reveal once the stage has closed. */
      var j = jokerDue();
      if (j){ grantJoker(j[0]); JOKER_PULLED = j[0]; }
    }
  }
  if (kind === "streak") S.openedStreak = (S.openedStreak || 0) + 1;
  else S.openedDay = (S.openedDay || 0) + 1;
  save();
  return got;
}

/* ------------------------------------------------------------- the hand
   Do and Inspire cards live here until they are done, kept or let go. */
var BY_DO = {}, BY_IN = {};
ACTIONS.forEach(function(a){ BY_DO[a[0]] = a; });
INSPIRE.forEach(function(i){ BY_IN[i[0]] = i; });
function actionById(id){ return BY_DO[id]; }
function inspireById(id){ return BY_IN[id]; }
/* Rows, not ids. The first version used filter(actionById), which keeps the
   ids and drops nothing - so every consumer read a[1] off a string and the
   hand rendered as "0 / 1 / undefined", and Did it could find nothing to do. */
function handDo(){ return ((S.hand || {}).do || []).map(actionById).filter(Boolean); }
function handIn(){ return ((S.hand || {}).in || []).map(inspireById).filter(Boolean); }

/* Least-dealt first, so the pool is walked before anything repeats. A Do
   done in the last three weeks is not offered again; an Inspire he kept is
   never offered again - he has it. */
function pickFrom(pool, dealt, skip){
  var c = pool.filter(function(x){ return !skip(x[0]); });
  if (!c.length) return null;
  var least = Math.min.apply(null, c.map(function(x){ return dealt[x[0]] || 0; }));
  var pick = c.filter(function(x){ return (dealt[x[0]] || 0) === least; });
  return pick[Math.floor(Math.random() * pick.length)];
}
function pickDo(){
  var hand = (S.hand || {}).do || [], done = S.doneDo || {};
  var cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 21);
  var recent = iso(cutoff);
  return pickFrom(ACTIONS, S.dealtDo || {}, function(id){
    return hand.indexOf(id) >= 0 || (done[id] && done[id] >= recent);
  });
}
function pickIn(){
  var hand = (S.hand || {}).in || [], kept = S.kept || {};
  return pickFrom(INSPIRE, S.dealtIn || {}, function(id){
    return hand.indexOf(id) >= 0 || !!kept[id];
  });
}
function doneDoCount(){ return Object.keys(S.doneDo || {}).length; }
function keptCount(){ return Object.keys(S.kept || {}).length; }
function doIt(id){
  var h = (S.hand || {}).do || [], i = h.indexOf(id);
  if (i < 0 || !actionById(id)) return false;
  h.splice(i, 1);
  S.doneDo = S.doneDo || {}; S.doneDo[id] = today();
  save(); return true;
}
function keepIn(id){
  var h = (S.hand || {}).in || [], i = h.indexOf(id);
  if (i < 0 || !inspireById(id)) return false;
  h.splice(i, 1);
  S.kept = S.kept || {}; S.kept[id] = today();
  save(); return true;
}
function letGo(id){
  var h = (S.hand || {}).in || [], i = h.indexOf(id);
  if (i < 0) return false;
  h.splice(i, 1); save(); return true;
}

/* ---------------------------------------------------------------- spares
   Seventy-two per cent of everything he will ever pull is a card he already
   holds. That used to be worth nothing. Now a spare is worth spares, and
   spares finish a set.

   They are not money. They never appear on the Pot screen, nothing converts
   between the two, and they cannot buy a pack - a pack is what the three
   pillars earned or it is not a pack. Recomputed from the record, like
   everything else here, so the number cannot drift. */
function sparesEarned(){
  var n = 0, held = S.cards || {};
  /* Vault copies do not pay again - only what is in front of him now. */
  CARDS.forEach(function(c){
    var have = held[c[0]] || 0;
    if (have > 1) n += (have - 1) * RARITY[c[1]][4];
  });
  n += livedCount() * 10;
  n += doneDoCount() * 10;
  /* The five mini games pay spares. His framing, and the right one: the
     small loop should feed the big one rather than run beside it. Derived
     from the record like everything else in here, so a day he cleared last
     month is already paid for. */
  if (typeof gamesPaid === "function") n += gamesPaid();
  return n;
}
function spares(){ return Math.max(0, sparesEarned() - (S.sparesSpent || 0)); }
function craftCost(c){ return RARITY[c[1]][5]; }
function canCraft(c){
  return !!c && c[1] !== 3 && !(S.cards || {})[c[0]] && setOpen(c[2]) && spares() >= craftCost(c);
}
function craft(name){
  var c = cardByName(name);
  if (!canCraft(c)) return false;
  S.sparesSpent = (S.sparesSpent || 0) + craftCost(c);
  S.cards = S.cards || {};
  S.cards[name] = 1;
  S.crafted = S.crafted || {};
  S.crafted[name] = today();
  S.seen = S.seen || {};
  S.seen[name] = 0;
  save();
  return true;
}
/* Spares no longer buy a card by name, because naming the cards he is missing
   is the spoiler he asked me to remove. He buys a rarity out of a set and the
   deck picks; the card is turned over on the stage like any other. The cost is
   the rarity's cost either way, so nothing about the economy moves. */
function craftPool(setKey, r){
  return setCards(setKey).filter(function(c){
    return c[1] === Number(r) && !(S.cards || {})[c[0]];
  });
}
function canCraftR(setKey, r){
  return setOpen(setKey) && Number(r) !== 3
      && craftPool(setKey, r).length > 0 && spares() >= RARITY[Number(r)][5];
}
function craftRandom(setKey, r){
  var pool = craftPool(setKey, r);
  if (!canCraftR(setKey, r) || !pool.length) return null;
  var pick = pool[Math.floor(Math.random() * pool.length)];
  return craft(pick[0]) ? pick[0] : null;
}

/* ------------------------------------------------------------- collection */
var BY_NAME = {};
CARDS.forEach(function(c){ BY_NAME[c[0]] = c; });
function cardByName(n){ return BY_NAME[n]; }
function setNeeds(key){
  var s = SETS.filter(function(x){ return x[0] === key; })[0];
  return s && s[3] ? s[3] : 0;
}
function setOpen(key){ return fullDays() >= setNeeds(key); }
function setCards(key){ return CARDS.filter(function(c){ return c[2] === key; }); }
function setHeld(key){
  return setCards(key).filter(function(c){ return (S.cards || {})[c[0]]; }).length;
}
function setsComplete(){
  return SETS.filter(function(s){ return setHeld(s[0]) === setCards(s[0]).length; }).length;
}
function heldCount(){ return Object.keys(S.cards || {}).length; }
function goldHeld(){
  return CARDS.filter(function(c){ return c[1] === 3 && (S.cards || {})[c[0]]; }).length;
}
function newCount(){
  var n = 0, seen = S.seen || {};
  Object.keys(S.cards || {}).forEach(function(k){ if (seen[k] === 0) n++; });
  return n;
}
/* The nearest set to finishing. "One more card" is a much better prompt than
   "collect them all". */
function nearestSet(){
  var best = null;
  SETS.forEach(function(s){
    if (s[0] === "gold" || !setOpen(s[0])) return;
    var total = setCards(s[0]).length, have = setHeld(s[0]);
    if (have === total || have === 0) return;
    var left = total - have;
    if (!best || left < best.left) best = { set: s, left: left, have: have, total: total };
  });
  return best;
}
function nextDoor(){
  return SETS.filter(function(s){ return !setOpen(s[0]); })
             .sort(function(a, b){ return a[3] - b[3]; })[0] || null;
}

/* --------------------------------------------------------------- progression */
/* ------------------------------------------------------------- the vault
   Everything ever collected, across every season. The current season lives in
   S.cards and gets folded in here when the deck rolls over.

   This exists because rank, XP and the pot were all read off S.cards, so
   clearing it for a new season would have collapsed his level and shrunk the
   pot. Nothing earned is allowed to go backwards. */
function everHeld(name){
  return ((S.vault || {})[name] || 0) + ((S.cards || {})[name] ? 1 : 0);
}
/* How many times a set has been completed across all seasons.

   Monotonic against play, but NOT against me: he has asked me to keep writing
   new cards as his life happens, and a single card added to an already
   complete set drops that set's minimum back to zero. Measured, it cost 100 XP
   and fifteen dollars the moment a card was appended. So the number ratchets -
   a high-water mark he can only ever climb, because nothing I do to the deck
   afterwards should take something off him. */
function setsCompleteRaw(){
  var n = 0;
  SETS.forEach(function(s){
    var cs = setCards(s[0]);
    if (!cs.length) return;
    var m = everHeld(cs[0][0]);
    cs.forEach(function(c){ var v = everHeld(c[0]); if (v < m) m = v; });
    n += m;
  });
  return n;
}
function setsCompleteEver(){
  var n = setsCompleteRaw(), hi = Number(S.setsEver) || 0;
  if (n > hi){ S.setsEver = n; hi = n; }   /* persisted by the next save */
  return hi;
}
function season(){ return Math.max(1, Number(S.season) || 1); }

/* --------------------------------------------------- levelling by turning up
   Everything here is a count of days already in the record, so it can only
   rise as days are added, and the same record can never be worth less than it
   was on the build before. The crest finally moves for the thing he is
   actually training. */
function mondayOf(k){
  var d = new Date(k + "T00:00:00"), back = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - back);
  return iso(d);
}
function weekFullMap(){
  var m = {};
  Object.keys(S.days || {}).forEach(function(k){
    if (allThree(k)){ var w = mondayOf(k); m[w] = (m[w] || 0) + 1; }
  });
  return m;
}
function goodWeeks(){
  var m = weekFullMap(), n = 0;
  for (var w in m) if (m[w] >= GOOD_WEEK) n++;
  return n;
}
function perfectWeeks(){
  var m = weekFullMap(), n = 0;
  for (var w in m) if (m[w] >= 7) n++;
  return n;
}
function monthFull(ym){
  return Object.keys(S.days || {}).filter(function(k){
    return k.slice(0, 7) === ym && allThree(k);
  }).length;
}
function solidMonths(){
  return monthsWithData().filter(function(ym){ return monthFull(ym) >= SOLID_MONTH; }).length;
}
function chipXP(){
  var n = 0;
  chipsEarned().forEach(function(c){ n += STEADY.chips[CHIPS.indexOf(c)] || 0; });
  return n;
}
function steadyXP(){
  return fullDays() * STEADY.day
       + comebackDays() * STEADY.comeback
       + goodWeeks() * STEADY.goodWeek
       + perfectWeeks() * STEADY.perfectWeek
       + solidMonths() * STEADY.month
       + chipXP();
}
/* How many full days to the next rank, at the value of a day that carries no
   week or month bonus with it. A floor, so the line is a promise. */
function daysToNext(r){
  r = r || rank();
  if (!r.to) return null;
  return Math.max(1, Math.ceil((r.to - r.xp) / XP_PER_FULL_DAY));
}
function levelDue(){
  var r = rank();
  return r.level > (Number(S.levelSeen) || 0) ? r : null;
}

var XPC = null;
function xp(){
  if (XPC !== null) return XPC;
  var n = 0;
  /* A card is worth its full value the first time it is collected and a
     quarter of it in every season after, so the ladder keeps climbing without
     the second season being worth as much as the first. */
  CARDS.forEach(function(c){
    var times = everHeld(c[0]);
    if (!times) return;
    var v = RARITY[c[1]][3];
    n += v + Math.round(v * 0.25) * (times - 1);
  });
  Object.keys(S.days).forEach(function(k){ if (allThree(k)) n += 15; });
  n += Object.keys(S.done || {}).length * 20;
  n += setsCompleteEver() * 100;
  n += livedCount() * 20;
  n += doneDoCount() * 20;
  n += keptCount() * 5;
  n += comebackDays() * 15;          /* the first day back counts twice */
  n += steadyXP();                   /* v39: the day itself, the week, the month, the chips */
  XPC = n;
  return n;
}

/* Every non-gold card held, with every set open. Trophies are excluded: they
   are claimed when a real thing happens and cannot be pulled. */
function deckComplete(){
  var open = SETS.every(function(s){ return s[0] === "gold" || setOpen(s[0]); });
  if (!open) return false;
  return CARDS.every(function(c){
    return c[1] === 3 || c[2] === "gold" || (S.cards || {})[c[0]];
  });
}

/* Fold the season into the vault and deal a fresh deck. Trophies stay on the
   table, the spare balance is carried across exactly, and rank, pot and XP do
   not move - the only thing that changes is that there are cards to find
   again. A healthy life has no completion screen and neither does this. */
function rollSeason(){
  if (!deckComplete()) return false;
  var balance = spares();
  S.vault = S.vault || {};
  var keep = {};
  Object.keys(S.cards || {}).forEach(function(name){
    var c = cardByName(name);
    if (c && c[1] === 3){ keep[name] = S.cards[name]; return; }   /* trophies stay */
    S.vault[name] = (S.vault[name] || 0) + 1;
  });
  S.cards = keep;
  S.seen = {};
  S.crafted = {};
  S.season = season() + 1;
  /* Spares are a balance, not a total, so it is restored by moving the spent
     offset rather than by storing the balance anywhere. */
  S.sparesSpent = sparesEarned() - balance;
  save();
  return true;
}
/* Ranks do not run out. Past the last named one they keep going in numbered
   tiers, each costing half again as much as the last - because a healthy life
   has no completion screen, and a level bar that fills for the final time and
   then sits there is the app quietly announcing it is finished with you. */
var RANK_TOP_STEP = 5500;
function rankTier(n){
  /* n is 1-based beyond the named list: Ask him he'll know II, III, ... */
  var roman = ["II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
  return RANKS[RANKS.length - 1][1] + " " + (roman[n - 1] || (n + 1));
}
function rankFloor(n){
  /* Threshold of the nth tier past the named list, growing 1.5x each time. */
  var at = RANKS[RANKS.length - 1][0], step = RANK_TOP_STEP;
  for (var i = 0; i < n; i++){ at += step; step = Math.round(step * 1.5); }
  return at;
}
function rank(){
  var x = xp(), i = 0;
  for (var j = 0; j < RANKS.length; j++) if (x >= RANKS[j][0]) i = j;
  var last = RANKS.length - 1;
  if (i === last && x >= rankFloor(1)){
    var n = 1;
    while (x >= rankFloor(n + 1) && n < 60) n++;
    return { level: RANKS.length + n, name: rankTier(n), xp: x,
             from: rankFloor(n), to: rankFloor(n + 1), nextName: rankTier(n + 1) };
  }
  var next = RANKS[i + 1] || null;
  if (!next && i === last){
    return { level: i + 1, name: RANKS[i][1], xp: x,
             from: RANKS[i][0], to: rankFloor(1), nextName: rankTier(1) };
  }
  return { level: i + 1, name: RANKS[i][1], xp: x,
           from: RANKS[i][0], to: next ? next[0] : null, nextName: next ? next[1] : null };
}

/* ------------------------------------------------------------------- the pot
   His idea and a better one than XP: a number in real money that builds while
   he is consistent and goes down when he spends it on himself.

   He sets the rate, because a rate the app picked would be the app deciding
   what his consistency is worth. Everything else is a multiple of it, so the
   whole economy moves when he changes one number. */
function rate(){ var r = Number(S.rate); return r > 0 ? r : RATE_DEFAULT; }
function potEarned(){
  var r = rate(), pc = packCounts();
  return {
    days:      pc.day * r,
    streaks:   pc.streak * r * 2,
    sets:      setsCompleteEver() * r * 3,
    trophies:  goldHeld() * r * 5,
    challenges: typeof questEarned === "function" ? questEarned() : 0,
    comebacks: comebackDays() * r
  };
}
function potSpent(){
  return (S.spends || []).reduce(function(a, s){ return a + Number(s[1] || 0); }, 0);
}
/* Summed generically rather than by name. The first version listed the four
   keys it knew about, so adding challenges put money in the breakdown that
   never arrived in the pot - earned, displayed, and silently dropped. */
function potTotal(){
  var e = potEarned(), n = 0;
  for (var k in e) if (Object.prototype.hasOwnProperty.call(e, k)) n += Number(e[k]) || 0;
  return n;
}
function pot(){ return potTotal() - potSpent(); }
function money(n){
  return "$" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
}
function num(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

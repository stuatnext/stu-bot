"use strict";

/* ========================================================================
   board.js - Today, as a world that moved while he was away.

   v57 made Today a board. He looked at it and said: "I didn't ask for a copy
   of Balatro. I asked for a game that can be as sticky as Balatro." Fair.
   Jokers, an ante, chips x mult and a fan of cream playing cards is that
   game's furniture, not its engine.

   Asked what the spine should actually be, he picked: a world that moves
   without you. Opening it is finding out what happened, not reporting what
   you did.

   So the screen reads top to bottom as news, then the day, then the day's
   windows:

     the hour, one line
     WHILE YOU WERE AWAY   - what the world did, with times on it
     THE DAY               - his shift and home's waking hours on one axis,
                             with now moving across it
     the five basics
     what is in play, and the button that does it
     THE WINDOWS           - open, shutting in, shut, done
     the week and what today is worth, quietly, at the bottom

   The important structural change is the last one. For seven rounds the
   score was the biggest thing on the screen, which made the app a scoreboard
   for a chore list. The score is now a line at the bottom. What leads is
   what changed - because that is the only thing that can be new when he
   opens it at 08:47 without being nagged.

   Everything here READS. world.js can report that time passed; neither file
   can report that he did something.
   ======================================================================== */

var B_PICK = "";        /* which window is in the panel, "" = let the day decide */
var NEWS = null;        /* the news, captured once per arrival */
var AWAY = 0;           /* how long he was gone, read before the arrival is stamped */
var WALKED = false;     /* the walk from where he was has played for this arrival */
var B_SIG = "";         /* the day and every station's state, as last drawn */
var B_CARD = "";        /* the card, as last drawn */

/* ------------------------------------------------------------- the arrival
   The news has to be read BEFORE the open is stamped, or looking at it is
   what clears it. Captured once, held for the session, and refreshed when he
   comes back to the app after long enough for the world to have moved. */
function arrive(force){
  if (NEWS !== null && !force) return NEWS;
  AWAY = awayMin();
  WALKED = false;
  NEWS = worldNews();
  markSeen();
  return NEWS;
}

/* ================================================================== the view
   Today is a place, not a page.

   Nine rounds of mine were arrangements of panels, and his verdict on the
   last one was the right one: "Complete redesign. Like a real game not a
   dashboard." Fewer boxes is still boxes. A game screen is not a tidier
   readout - it is a SCENE. There is somewhere you are, something drawn, one
   thing your eye goes to, and you touch the thing itself rather than a
   button with a verb printed on it.

   So: his day, drawn side-on.

     - The sky is the real hour, the same seven phases Daylight has had since
       v37, and the sun rides the same arc it has always ridden.
     - The ground is the city he is actually standing in. Singapore towers,
       Sheffield hills, a plane when he is in the air.
     - A PATH runs across the day, left to right, wake to wake.
     - The things the day asks for are STATIONS on that path, standing at the
       hour they are actually open.
     - And he is on it - a small figure at this minute, walking right, all
       day, whether the app is open or not.

   That last part is the whole thing. Open it after nine hours asleep and he
   does not read that time passed: he watches himself walk from where he was
   to where he is, past the stations he missed and the ones still lit. The
   world moving without him stops being a paragraph and becomes the reason
   to look.
   ======================================================================== */

function viewBoard(){
  var k = today();
  TODAY_MORE = "";
  arrive();
  var wins = sceneWins(winList(k)), sel = boardPick(wins);
  B_SIG = boardSig(wins, k);
  B_CARD = scCardHTML(sel, k);
  /* One button that walks the day, because he should not have to choose
     which station to stand at before he can start. */
  /* ONE action on this screen. The card used to carry its own button and the
     runner another underneath it, which is two ways to do the same thing
     stacked on top of each other. The card says what he is standing at; the
     button starts there. */
  var left = typeof runCount === "function" ? runCount("day") : 0;
  var at = sel && sel.kind !== "pack" ? (sel.kind === "skinset" ? sel.first : sel.id) : "";
  var start = left
    ? "<button class='tk-start' data-run='day'"
      + (at ? " data-runat='" + esc(at) + "'" : "") + ">"
      + (at && sel.state === "open" ? "Start here" : "Start the day")
      + "<em>" + left + " left</em></button>"
    : "";
  return "<div class='b-t'>" + scWorldHTML(wins, sel) + B_CARD
    + start + TODAY_MORE + "</div>";
}

/* ===================================================== the world, elsewhere
   Every other tab is a room in the same place, so every other tab opens on
   the same sky at the same hour, above the same skyline, with the same
   currency in the corner. Only Today gets the path, the stations and him
   walking on them - the rest get the horizon and then their own business.

   Without this the app was a scene plus five dashboards, which is five
   dashboards. */
function worldHead(name){
  var sit = situation(), ph = skyPhase();
  var night = ph === "night" || ph === "deepnight";
  var h = "<div class='rm'>";

  /* A WINDOW, not a banner. v61 pasted a band of sky across the top of five
     unchanged lists and he called it what it was: a moon. The sky belongs in
     these rooms the way sky belongs in a room - through a window in the wall,
     small, with the same hour and the same skyline in it. Everything below it
     is then indoors, which is the point: five rooms in one place. */
  h += "<div class='rm-win' data-sky='" + esc(ph) + "'>";
  if (night){
    h += "<div class='sc-stars'>";
    for (var i = 0; i < 7; i++){
      h += "<i style='left:" + ((hashOf("q" + i) % 900) / 10).toFixed(1)
        + "%;top:" + ((hashOf("z" + i) % 560) / 10).toFixed(1) + "%'></i>";
    }
    h += "</div>";
  }
  var p = arcPt(shape().now / 1440);
  h += "<span class='sc-sun" + (night ? " moon" : "") + "' style='left:"
    + (8 + (p[0] - 12) / 100 * 84).toFixed(1) + "%; top:"
    + (16 + (p[1] / 58) * 44).toFixed(1) + "%'></span>";
  h += scGroundHTML(sit);
  h += "<i class='rm-bar'></i><i class='rm-bar v'></i></div>";

  h += "<div class='rm-c'><button class='rm-t' data-tab='today'>"
    + esc(hhmm(nowMin())) + "</button>"
    + "<span class='rm-p'>" + esc(sit.home ? shortToday() : sit.city) + "</span>"
    + (name ? "<span class='rm-n'>" + esc(name) + "</span>" : "") + "</div>";
  h += scStatsHTML();
  return h + "</div>";
}

/* The routines are one station on the path rather than five: they have a tab
   of their own now, and five pins inside the same half hour is a smudge, not
   a signpost. The run still walks them one at a time - this is the scene's
   reading of the day, not the day's. */
function sceneWins(wins){
  var out = [], care = null;
  wins.forEach(function(w){
    if (w.kind !== "care"){ out.push(w); return; }
    if (!care){
      care = { id: "skin", kind: "skinset", label: "Skin", short: "Skin", col: "#7FD4C1",
               open: w.open, shut: w.shut, n: 0, on: 0, first: "" };
      out.push(care);
    }
    care.n++;
    if (w.done) care.on++; else if (!care.first) care.first = w.id;
    care.shut = Math.max(care.shut, w.shut);
  });
  if (care){
    var left = care.n - care.on;
    care.done = left === 0;
    care.why = care.done ? "The routine is done."
      : left + (left === 1 ? " step left" : " steps left") + " in the routine.";
    care.a = sinceWake(care.open); care.b = sinceWake(care.shut);
    if (care.b <= care.a) care.b = 1440;
    care.state = winState(care);
  }
  return out;
}

/* ------------------------------------------------------------- the world */
/* The three numbers that used to live in the stat bar. The bar went with the
   dashboard - a scene with a dashboard bolted to the top of it is a scene
   with a dashboard bolted to the top of it - but the pot is real money he
   pays himself, and he has asked where it was once already when it was
   hidden. So they sit in the corner, the way a game keeps its currency. */
function scStatsHTML(){
  var r = rank(), run = dayRun(), pt = pot(), sp = spares();
  /* Three separate buttons, not one: the old stat bar's crest went to You,
     its pot chip opened the vault and its shards went to the deck, and all
     three of those routes have to survive the bar going. */
  var h = "<div class='sc-stats'>";
  /* the level wears its progress: a ring that fills towards the next one */
  var xpPct = r.to > r.from ? Math.max(0, Math.min(1, (r.xp - r.from) / (r.to - r.from))) : 1;
  h += "<button class='sc-lv' data-tab='you' aria-label='Level " + r.level + "' style='--xp:"
    + xpPct.toFixed(3) + "'><b>" + r.level + "</b></button>";
  if (fullDays() > 0)
    h += "<button class='sc-s" + (run === 0 ? " cold" : "") + "' data-tab='cards'"
      + " aria-label='Streak'>" + svg("flame", 12) + num(run) + "</button>";
  h += "<button class='sc-s gold' data-tab='vault' aria-label='The pot'>"
    + num(pt) + "</button>";
  if (sparesEarned() > 0)
    h += "<button class='sc-s jade' data-tab='cards' aria-label='Spares'>"
      + num(sp) + "</button>";
  return h + "</div>";
}

/* ------------------------------------------------------------- the world */
function scWorldHTML(wins, sel){
  var s = shape(), sit = situation(), ph = skyPhase();
  var night = ph === "night" || ph === "deepnight";
  var nowPos = sinceWake(nowMin()) / 1440 * 100;
  /* where he was standing when he last closed it, so the walk back is real -
     once per arrival. Every tap on Today redraws it, and replaying nine
     hours of walking because he marked something done is a stutter. */
  var wasPos = nowPos;
  if (AWAY > 2 && !WALKED) wasPos = sinceWake(((nowMin() - AWAY) % 1440 + 1440) % 1440) / 1440 * 100;
  if (wasPos > nowPos) wasPos = 1.5;            /* he slept through the fold */
  nowPos = Math.max(1.5, Math.min(98.5, nowPos));
  wasPos = Math.max(1.5, Math.min(98.5, wasPos));

  roadScale();
  var h = "<div class='sc' data-sky='" + esc(ph) + "' style='--gh:" + ROAD_H + "px'>";

  /* the sky: stars and the sun on the arc it has ridden since v4. Drawn as
     elements rather than inside a stretched SVG, because a circle in a
     viewBox scaled to fill a phone is an egg. */
  if (night){
    h += "<div class='sc-stars'>";
    for (var i = 0; i < 20; i++){
      h += "<i style='left:" + ((hashOf("s" + i) % 980) / 10).toFixed(1)
        + "%;top:" + ((hashOf("y" + i) % 520) / 10).toFixed(1)
        + "%;opacity:" + (0.25 + (hashOf("o" + i) % 55) / 100).toFixed(2) + "'></i>";
    }
    h += "</div>";
  }
  /* three clouds by day, because a flat blue half-screen is a wall and a sky
     with something moving across it is a sky */
  if (!night && ph !== "dusk"){
    h += "<div class='sc-cl'><i style='--t:12%;--l:-18%;--d:0s;--s:1'></i>"
      + "<i style='--t:26%;--l:-46%;--d:-38s;--s:.72'></i>"
      + "<i style='--t:6%;--l:-78%;--d:-74s;--s:.55'></i></div>";
  }
  var p = arcPt(s.now / 1440);
  var sunX = 6 + (p[0] - 12) / 100 * 88, sunY = 8 + (p[1] / 58) * 52;
  h += "<span class='sc-sun" + (night ? " moon" : "") + "' style='left:" + sunX.toFixed(1)
    + "%; top:" + sunY.toFixed(1) + "%'></span>";

  /* the ground he woke up on, and the road across it */
  h += scGroundHTML(sit);
  h += scRoadHTML(nowPos);

  h += "<div class='sc-pins'>";
  var placed = wins.map(function(w){
    return { w: w, x: sinceWake(w.open) / 1440 * 100 };
  }).sort(function(a, b){ return a.x - b.x; });
  var MIN = 18.5;
  placed.forEach(function(q, i){
    q.x = Math.max(7, Math.min(93, q.x));
    if (i && q.x - placed[i - 1].x < MIN) q.x = placed[i - 1].x + MIN;
  });
  /* if that pushed the last one off the end, shuffle the whole line back */
  var over = placed.length ? placed[placed.length - 1].x - 93 : 0;
  if (over > 0) placed.forEach(function(q){ q.x = q.x - over; });
  placed.forEach(function(q){ q.x = Math.max(10, Math.min(90, q.x)); });
  B_XS = placed.map(function(q){ return q.x; });
  /* v75: every station stands ON the road, at the height the road is at
     that hour - one row of medallions, not two staggered rows of pins. The
     one he is standing at bounces and, if it is open, flies a NOW flag. */
  placed.forEach(function(q){
    var w = q.w, picked = sel && w.id === sel.id;
    h += "<button class='sc-p " + w.state + (picked ? " up" : "")
      + "' data-pick='" + esc(w.id) + "' style='left:" + q.x.toFixed(1)
      + "%; bottom:" + (roadY(q.x) - 24 * ROAD_S).toFixed(0) + "px; --pil:" + w.col + "'>"
      + (picked && w.state === "open" ? "<span class='sc-flag'>Now</span>" : "")
      + "<span class='sc-pk'>" + svg(scPin(w), 20) + "</span>"
      + "<span class='sc-pn'>" + esc(w.short || w.label)
      + (w.state === "soon" ? "<small>" + esc(hhmm(w.open)) + "</small>" : "") + "</span>"
      + "</button>";
  });

  /* him, walking the road */
  var mw = meX(wasPos), mn = meX(nowPos);
  if (mw > mn) mw = mn;
  h += "<span class='sc-me' style='left:" + mw.toFixed(2) + "%; bottom:"
    + (roadY(mw) - 3).toFixed(1) + "px' data-to='" + mn.toFixed(2) + "' data-from='"
    + mw.toFixed(2) + "'>" + scWalker() + "</span>";
  h += "</div>";

  /* The clock, and under it the place. The city is not decoration: he is in
     a different one most weeks, the app guesses it from the phone's own
     clock, and the guess has to be correctable by touching it. That button
     has existed since v39 and it nearly went out with the dashboard. */
  var guessed = !sit.home && typeof whereIsGuessed === "function" && whereIsGuessed();
  h += "<div class='sc-hud'><button class='sc-t' data-work='1'>"
    + esc(hhmm(nowMin())) + "</button>";
  h += sit.home
    ? "<button class='b-loc sc-c' data-notthere='1'>" + esc(shortToday()) + "</button>"
    : "<button class='b-loc sc-c" + (guessed ? " ask" : "") + "' data-"
      + (guessed ? "locate" : "notthere") + "='1'>" + esc(sit.city)
      + (guessed ? " " + svg("pin", 11) : "") + "</button>";
  h += "</div>";
  h += scGoalHTML(k0());
  h += scStatsHTML();
  h += scNewsHTML(meX(nowPos));
  return h + "</div>";
}

/* The three numbers that used to live in the stat bar. The bar went with the
   dashboard - a scene with a dashboard bolted to the top of it is a scene
   with a dashboard bolted to the top of it - but the pot is real money he
   pays himself, and he has asked where it was once already when it was
   hidden. So they sit in the corner, the way a game keeps its currency. */

function scPin(w){
  if (w.kind === "pillar") return w.key === "train" ? "run"
    : w.key === "family" ? "phone" : "clock";
  if (w.kind === "care" || w.kind === "skinset") return "drop";
  if (w.kind === "pack") return "pack";
  return "cards";
}
/* v75: him, as a character rather than a stick. Chunky and outlined like a
   sticker, facing the way the day goes, legs that swing while he walks and
   a small bob while he waits. */
function scWalker(){
  return "<svg viewBox='0 0 32 46' aria-hidden='true'>"
    + "<g class='lg l2'><rect x='15.5' y='29' width='6' height='14' rx='3'/></g>"
    + "<g class='lg l1'><rect x='10.5' y='29' width='6' height='14' rx='3'/></g>"
    + "<rect class='tee' x='8' y='16' width='16' height='16' rx='6'/>"
    + "<path class='arm' d='M22.5 20.5q4 3 3 7.5'/>"
    + "<circle class='skin' cx='16' cy='10.5' r='7.6'/>"
    + "<path class='hair' d='M8.6 9.4q.6-7 7.6-7.2 6.6.2 7.4 6.2-3.2-1.8-7.4-1.4-4.4.4-7.6 2.4z'/>"
    + "<circle class='eye' cx='19.2' cy='11' r='1.15'/>"
    + "<path class='smile' d='M18 14.2q1.6 1 3 .1'/></svg>";
}
/* The road across the ground: one gentle curve through the day, the same
   function placing the stations and him on it, so they stand on the road
   rather than near it. x is 0-100 across the day, the answer is pixels up
   from the bottom of the scene. */
/* On a shorter phone the ground and the road shrink together, so the sky
   keeps room for the clock and the bubble. 844 points is his phone. */
var ROAD_S = 1, ROAD_H = 214;
function roadScale(){
  ROAD_S = Math.max(.72, Math.min(1, ((typeof window !== "undefined" && window.innerHeight) || 844) / 844));
  ROAD_H = Math.round(214 * ROAD_S);
}
function roadY(x){ return ROAD_S * (100 + 34 * Math.sin(2 * Math.PI * 0.85 * x / 100 + 0.5)); }
/* Where he is drawn: at this minute on the road, unless that puts him on
   top of a station - then a step before it, walking up to it, so neither
   covers the other. */
var B_XS = [];
function meX(x){
  for (var i = 0; i < B_XS.length; i++){
    if (Math.abs(x - B_XS[i]) < 7.5){
      /* no room before the first station: stand just past it instead */
      return B_XS[i] - 7.5 >= 5 ? B_XS[i] - 7.5 : B_XS[i] + 7.5;
    }
  }
  return Math.max(5, x);
}
function scRoadHTML(nowPos){
  var pts = [], walked = [];
  for (var x = -4; x <= 104; x += 2){
    var pt = x.toFixed(0) + " " + (ROAD_H - roadY(x)).toFixed(1);
    pts.push(pt);
    if (x <= nowPos) walked.push(pt);
  }
  walked.push(nowPos.toFixed(1) + " " + (ROAD_H - roadY(nowPos)).toFixed(1));
  var d = "M" + pts.join(" L"), dw = "M" + walked.join(" L");
  return "<div class='sc-road' aria-hidden='true'><svg viewBox='0 0 100 " + ROAD_H
    + "' preserveAspectRatio='none'>"
    + "<path class='r0' d='" + d + "' vector-effect='non-scaling-stroke'/>"
    + "<path class='r1' d='" + d + "' vector-effect='non-scaling-stroke'/>"
    + "<path class='r2' d='" + d + "' vector-effect='non-scaling-stroke'/>"
    + "<path class='rw' d='" + dw + "' vector-effect='non-scaling-stroke'/>"
    + "</svg></div>";
}
/* The day's goal, in the corner where a game keeps it: the three pillars as
   three coins, lit when done, a dashed ring when today does not ask for it. */
function k0(){ return today(); }
function scGoalHTML(k){
  if (!S.onboarded) return "";
  var owed = 0, got = 0, h = "<div class='sc-goal' aria-label='Today'>";
  PILLARS.forEach(function(g){
    var done = pDone(k, g[0]), req = required(g[0], k);
    if (req) owed++;
    if (done && req) got++;
    h += "<i class='gc" + (done ? " on" : req ? "" : " rest") + "' style='--pil:" + g[4] + "'>"
      + svg(g[2], 12) + "</i>";
  });
  var all = allThree(k);
  h += "<span>" + (all ? "Day complete" : got + " of " + owed + " today") + "</span>";
  return h + "</div>";
}

/* Where he woke up, as a silhouette against his own sky. Three places and a
   fourth for the air, because he is on a plane most weeks and a day in the
   air is a real day. */
function scGroundHTML(sit){
  var city = (sit.city || "").toLowerCase(), kind = sit.kind, sky = "";
  if (kind === "family" || /sheffield|london|manchester|leeds|york/.test(city)){
    sky = "<path class='f2' d='M0 78q54-40 108-14t84-30 96 20 72-10V120H0z'/>"
        + "<path class='f1' d='M0 98q62-30 116-8t86-22 158 16v36H0z'/>"
        + "<path class='f1' d='M58 100V68h7v32zM63 68l3-13 3 13zM268 102V74h6v28zM271 74l3-11 3 11z'/>";
  } else if (kind === "home" || /singapore|kuala|jakarta|bangkok|hong/.test(city)){
    sky = "<path class='f1' d='M0 120V84h16v-30h13v30h12V38l10-12 10 12v46h14V62h15v22h17V44h18v40"
        + "h13V20l12-16 12 16v64h16V50h17v34h14V30h15v54h19V66h15v18h18V40h13v44h16v36z'/>"
        + "<path class='f2' d='M196 40l13-18 13 18v14h-26z'/>"
        + "<circle class='f2' cx='209' cy='30' r='2.6'/>";
  } else {
    sky = "<path class='f1' d='M0 120V88h22v-26h15v26h18V56h16v32h20V72h16v16h21V44h16v44"
        + "h21V66h16v22h21V52h15v36h24V76h15v12h20v32z'/>";
  }
  return "<svg class='sc-far' viewBox='0 0 360 120' preserveAspectRatio='none' aria-hidden='true'>"
    + sky + "</svg><span class='sc-gr'></span>";
}

/* One line of news, sitting in the sky rather than in a panel. It is the
   only sentence on the screen that is not attached to a thing he can touch,
   so it is written small and it is never more than one. */
function scNewsHTML(nowPos){
  var rec = S.onboarded ? monthRecapDue() : null;
  var n0 = rec ? { head: monthName(rec.ym) + " is filed.", ym: rec.ym, month: 1 }
        : (NEWS && NEWS[0]);
  if (!n0){
    var dsp = S.onboarded && typeof dispatchFor === "function" ? dispatchFor(today()) : "";
    if (!dsp) return "";
    n0 = { head: dsp, quiet: 1 };
  }
  var rest = (NEWS || []).length - (rec ? 0 : 1);
  /* v75: said by him, in a bubble whose tail points at where he stands,
     rather than a grey bar floating in the sky that read like an error */
  var at = nowPos == null ? 50 : nowPos;
  return "<button class='sc-news" + (n0.quiet ? " quiet" : "") + "' style='--x:" + at.toFixed(1)
    + "vw' data-"
    + (n0.month ? "monthok='" + esc(n0.ym) : "news='1") + "'>"
    + esc(n0.head)
    + (n0.month ? "<em>Noted</em>" : rest > 0 ? "<em>+" + rest + "</em>" : "")
    + "</button>";
}

/* --------------------------------------------------------------- the card
   What the station he is standing at asks, and the one button that does it.
   It sits at the bottom because that is where his thumb is. */
/* On Today the card is the label on the station he is standing at, not a
   second control surface: the run is the way things get done here. */
function scCardHTML(sel, k){
  var fwd = "";
  if (S.onboarded && allThree(k) && typeof tomorrowLine === "function"){
    var tl = tomorrowLine();
    if (tl) fwd = "<span class='b-pl-t'>Tomorrow \u00b7 " + esc(tl) + "</span>";
  }
  if (!sel){
    var pr0 = priority();
    return "<div class='b-pl won'><b>" + esc(pr0.ask) + "</b>"
      + "<span>" + esc(pr0.sub || "") + "</span>" + fwd + "</div>";
  }
  return bPlayHTML(sel, k, fwd, 1);
}

/* Which station he is standing at. His pick if it is still there, else the
   one closing soonest, else the next one to open, else whatever is left. */
function boardPick(wins){
  var i;
  for (i = 0; i < wins.length; i++) if (wins[i].id === B_PICK) return wins[i];
  var open = wins.filter(function(w){ return w.state === "open" && !w.done; });
  if (open.length){
    open.sort(function(a, b){
      if ((a.rank || 0) !== (b.rank || 0)) return (a.rank || 0) - (b.rank || 0);
      return winLeft(a) - winLeft(b);
    });
    return open[0];
  }
  var soon = wins.filter(function(w){ return w.state === "soon"; });
  if (soon.length){
    soon.sort(function(a, b){ return winLeft(a) - winLeft(b); });
    return soon[0];
  }
  for (i = 0; i < wins.length; i++) if (!wins[i].done) return wins[i];
  return null;
}

/* --------------------------------------------------------------- the card */
function bPlayHTML(sel, k, fwd, quiet){
  fwd = fwd || "";
  var up = nextUp(), pr = priority({ noPacks: 1 });
  var isUp = sel.kind === "pillar" && sel.key === up && !sel.done;
  /* A card is a thing in Singapore he has collected, and "Rain tree." on
     its own told him nothing. So it says what the thing is, which set it
     is from, and what it asks of him - or what he did, once he has. */
  var cd = sel.kind === "card" ? sel.card.card : null;
  var ask = isUp ? pr.ask
          : cd ? cd[0]
          : sel.kind === "todo" ? sel.todo[1] + "."
          : sel.label + ".";
  var say = cd ? (cd[3] || "")
          : sel.done ? (sel.kind === "pillar" ? doneLine(sel.key) : "Done today.")
          : isUp ? (bSecond(pr.ask, pr.sub) || sel.why)
          : sel.kind === "care" ? careSay(sel.key, k)
          : sel.why;
  var state = bStateWord(sel);
  var setNm = "";
  if (cd) SETS.forEach(function(st){ if (st[0] === cd[2]) setNm = st[1]; });
  var icon = cd ? "<i class='b-pl-ic art'>" + esc(CARD_ART[cd[0]] || "\u2728") + "</i>"
           : "<i class='b-pl-ic'>" + svg(scPin(sel), 24) + "</i>";

  var h = "<div class='b-pl " + sel.state + (cd ? " is-card" : "") + "' style='--pil:" + sel.col + "'>";
  h += icon;
  h += "<span class='b-pl-h'><span class='b-pl-n'>" + esc(cd ? "Card \u00b7 " + setNm : sel.label) + "</span>"
    + (sel.chip ? "<em class='b-pl-p'>+" + sel.chip + "</em>" : "")
    + "<em class='b-pl-c'>" + esc(state) + "</em></span>";
  h += "<b>" + esc(ask) + "</b>";
  h += "<span>" + esc(say) + "</span>";
  if (cd && sel.card.text)
    h += "<span class='b-pl-q'><em>" + (sel.done ? "You did it" : "The ask") + "</em>"
      + esc(sel.card.text) + "</span>";
  if (quiet) return h + fwd + "</div>";
  h += "<span class='b-pl-a'>";
  if (sel.kind === "pillar"){
    var lab = sel.done ? "Undo" : sel.key === "family" ? "Log the call" : "Mark done";
    var cta = isUp && pr.cta ? pr.cta : null;
    if (cta)
      h += "<button class='b-go'" + (cta.act ? " data-cta='" + esc(cta.act) + "'"
        : " data-tab='" + esc(cta.tab) + "'") + ">" + esc(cta.label)
        + svg("arrow", 15) + "</button>";
    if (!(cta && cta.label === lab))
      h += "<button class='b-do" + (sel.done ? " undo" : "") + "' data-p='"
        + esc(sel.key) + "'>" + lab + "</button>";
  } else if (sel.kind === "care"){
    h += "<button class='b-go' data-care='" + esc(sel.key) + "'>"
      + (sel.done ? "Undo" : "Did it") + "</button>";
  } else if (sel.kind === "card"){
    if (!sel.done){
      h += "<button class='b-go' data-questdone='1'>Did it</button>";
      if (!sel.card.swaps) h += "<button class='b-do' data-questswap='1'>Swap it</button>";
    }
  } else if (sel.kind === "todo"){
    h += "<button class='b-go' data-doit='" + esc(sel.todo[0]) + "'>Did it</button>";
  } else if (sel.kind === "pack"){
    h += "<button class='b-go' data-open='1'>" + esc(sel.btn || "Open it") + "</button>";
  }
  h += "</span>";
  return h + fwd + "</div>";
}
function bStateWord(sel){
  var left = winLeft(sel);
  return sel.state === "done" ? "done"
       : sel.state === "open" ? dur(left) + " left"
       : sel.state === "soon" ? "opens " + hhmm(sel.open)
       : "shut " + dur(left) + " ago";
}

/* -------------------------------------------------------------- the minute
   The board is made of time, so the minute has to move it: the clock, the
   minutes left on the card, and him on the path. Before v70 the tick in
   app.js still reached for the parts of the old board, found none of them,
   and left the clock reading whatever time he opened it at.

   When a station opens or shuts, or the day turns over, the whole board is
   drawn again - it holds nothing typed. Otherwise only the card is swapped,
   and only when its words changed, so the clouds do not jump every minute.
   Returns true when the caller should redraw the board. */
function boardSig(wins, k){
  return k + "|" + wins.map(function(w){
    return w.id + ":" + w.state + (w.done ? "+" : "");
  }).join(",");
}
function boardTick(){
  var k = today(), wins = sceneWins(winList(k));
  if (boardSig(wins, k) !== B_SIG) return true;
  var card = document.querySelector("#screen .b-pl");
  var html = scCardHTML(boardPick(wins), k);
  if (card && html !== B_CARD){ card.outerHTML = html; B_CARD = html; }
  var me = document.querySelector("#screen .sc-me");
  if (me){
    var xn = meX(Math.max(1.5, Math.min(98.5, sinceWake(nowMin()) / 1440 * 100))), x = xn.toFixed(2);
    me.dataset.to = x;
    me.style.left = x + "%";
    me.style.bottom = (roadY(xn) - 3).toFixed(1) + "px";
  }
  return false;
}

/* priority() writes the headline and the line under it, and on some days
   they are the same sentence twice. On a card that is the whole panel, the
   echo is dropped and the station's own line stands in. */
function bSecond(ask, sub){
  if (!sub) return "";
  var a = String(ask).toLowerCase().replace(/[^a-z0-9 ]/g, "");
  var b = String(sub).toLowerCase().replace(/[^a-z0-9 ]/g, "");
  var head = a.split(" ").slice(0, 4).join(" ");
  if (head && head.length > 8 && b.indexOf(head) !== -1) return "";
  if (b.length > 8 && a.indexOf(b.split(" ").slice(0, 4).join(" ")) !== -1) return "";
  return sub;
}

/* After every render: let him walk. The figure is drawn where he was when
   he last closed the app and then slides to this minute, which is the whole
   of "the world moved while you were away" said without a sentence. */
function scSettle(){
  var me = document.querySelector("#screen .sc-me");
  if (!me || me.dataset.to == null) return;
  var to = Number(me.dataset.to), from = Number(me.dataset.from || to);
  WALKED = true;
  var put = function(x){ me.style.left = x.toFixed(2) + "%"; me.style.bottom = (roadY(x) - 3).toFixed(1) + "px"; };
  if (reduced() || Math.abs(to - from) < 0.4){ put(to); return; }
  /* the walk follows the curve of the road, a frame at a time, legs going */
  var t0 = null, span = Math.min(2200, 700 + Math.abs(to - from) * 28);
  me.classList.add("walk");
  var step = function(ts){
    if (!me.isConnected) return;
    if (t0 === null) t0 = ts;
    var u = Math.min(1, (ts - t0) / span), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    put(from + (to - from) * e);
    if (u < 1) requestAnimationFrame(step); else me.classList.remove("walk");
  };
  requestAnimationFrame(step);
}

/* The rest of what happened, on request. */
function askNews(){
  var h = "<div class='b-wl'>";
  (NEWS || []).forEach(function(n){
    var at = n.at ? hhmm(new Date(n.at).getHours() * 60 + new Date(n.at).getMinutes()) : "\u00b7";
    h += "<span class='b-wr'><em>" + esc(at + "  " + n.head)
      + (n.sub ? " " + n.sub : "") + "</em></span>";
  });
  if (!(NEWS || []).length) h += "<span class='b-wr'><em>Nothing while you were gone.</em></span>";
  return ask({ title: "While you were away",
    say: AWAY >= 25 ? "You were gone " + dur(AWAY) + "." : "Since you last looked.",
    html: h + "</div>", cancel: "Done" });
}

/* --------------------------------------------------------- the working
   Every chip that scored and every multiplier that applied, itemised. The
   engine is only worth having if he can audit it - the fastest way to stop
   believing a number is to be unable to account for it - but it does not
   need eighty pixels of the board every day to answer a question he asks
   once a week. */
function workingHTML(k){
  k = k || today();
  var lines = chipLines(k), mlines = multLines(k);
  var h = "<div class='b-wl'>";
  if (!lines.length) h += "<span class='b-wr'><em>Nothing yet today</em><b>0</b></span>";
  lines.forEach(function(x){
    h += "<span class='b-wr" + (x.joker ? " j" : "") + "'><em>" + esc(x.label)
      + "</em><b>+" + x.n + "</b></span>";
  });
  h += "<span class='b-wr tot'><em>Chips</em><b>" + num(chipsOn(k)) + "</b></span>";
  mlines.forEach(function(x){
    h += "<span class='b-wr m" + (x.joker ? " j" : "") + "'><em>" + esc(x.label)
      + "</em><b>" + (x.kind === "times" ? "×" + x.n : "+" + x.n) + "</b></span>";
  });
  h += "<span class='b-wr tot'><em>Multiplier</em><b>"
    + multOn(k).toFixed(2).replace(/0$/, "") + "</b></span>";
  h += "<span class='b-wr sum'><em>Score today</em><b>" + num(scoreOn(k)) + "</b></span>";
  return h + "</div>";
}
/* Everything the scene deliberately does not draw, behind the clock: the
   five basics, the week, and the day's arithmetic. A scene earns its calm by
   having somewhere to put the numbers, not by losing them. */
function dayHTML(k){
  var h = "<div class='b-vt'>";
  VITALS.forEach(function(v){
    var on = vitalMet(v[0], k);
    var val = v[0] === "water"   ? waterOn(k) + "/" + WATER_GLASSES
            : v[0] === "sleep"   ? (sleepOn(k) ? sleepOn(k) + "h" : "\u2013")
            : v[0] === "protein" ? num(proteinOn(k)) + "g"
            : (on ? "yes" : "\u2013");
    h += "<span class='b-v" + (on ? " on" : "") + "'>" + esc(v[1].toLowerCase())
      + " <b>" + esc(val) + "</b></span>";
  });
  h += "</div>";
  var a = typeof anteState === "function" ? anteState() : null;
  if (a){
    h += "<div class='w-ft'><span class='w-fd'>";
    weekAll(a.wk).forEach(function(d, i){
      var future = d > k, isToday = d === k;
      var full = !future && allThree(d), ice = !future && frozen(d);
      var miss = !future && !isToday && !full && !ice && startedBy(d);
      h += "<em class='" + (full ? "on" : ice ? "ice" : miss ? "miss"
        : isToday ? "now" : "soon") + "'></em>";
    });
    h += "</span><span class='w-fw'>" + num(a.got) + " of " + num(a.target)
      + " this week</span></div>";
  }
  return h + workingHTML(k);
}
function askWorking(){
  return ask({
    title: "The day so far",
    say: "Chips are what you did. The multiplier is what the record has earned, "
       + "plus whatever is true of the world today.",
    html: dayHTML(today()),
    options: [
      { id: "sleep", label: "Log last night" },
      { id: "out",   label: "I got outside" },
      { id: "cond",  label: "Conditions",
        note: "What is standing over the day, and what it is worth" }
    ],
    cancel: "Done"
  }).then(function(v){
    if (v === "cond" && typeof askJokers === "function") return askJokers();
    if (v === "sleep" && typeof askSleep === "function") return askSleep();
    if (v === "out" && typeof tapOut === "function") return tapOut();
  });
}

/* Playing the window already in the panel. The board's contract is
   pick-then-play, but the window closing soonest is picked for him, so the
   commonest action on the screen must not cost two taps and a decision. A
   second tap on a window already open in the panel runs its first button. */
function boardPlay(){
  var btn = document.querySelector("#screen .b-pl .b-go, #screen .b-pl .b-do");
  if (btn) btn.click();
  return !!btn;
}

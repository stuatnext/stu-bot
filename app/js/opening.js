"use strict";

/* ========================================================================
   opening.js - the front page.

   The honest problem with the app before this file: opening it showed
   exactly the state he closed it in. Nothing had happened. Every habit app
   that people actually open every day has an arrival - a thing that changed
   while you were not looking, waiting on the first screen - and this one
   had the same three empty circles it had last night, which makes opening
   it an act of obligation rather than of curiosity.

   So: once a day, on the first open, the app has a front page ready. It
   works like a newspaper and not like a dashboard. Yesterday's result at
   the top, because that is the thing that changed. Today's fixture under
   it, because that is what he is here for. One line the app wrote. A rule
   between them. Then it is gone and Today is Today.

   The constraint that shaped it: he has told me three separate times that
   the screens are too busy, and once that hiding things behind drawers is
   not a fix. So this is allowed to exist only because it is a MOMENT and
   not a block - it takes the whole screen for four seconds and then it is
   not anywhere. Nothing was added to Today to build it.

   It never appears twice in a day, never on the very first run (the title
   card and the tour own that), and never while a ceremony is on screen.
   ======================================================================== */

var OPENING = null;
/* Days since he last opened it, read BEFORE the open is recorded - showing
   the page is itself an open, so reading it afterwards always says nought. */
var OPEN_GAP = 0;

/* Yesterday, and what it did. Carried days - a weekend where there was no
   shift to finish, a frozen day - are not misses and do not read as one. */
function lastClosedDay(){
  var d = new Date();
  d.setDate(d.getDate() - 1);
  return iso(d);
}
function dayVerdict(k){
  if (!PILLARS.some(function(g){ return !!firstDay(g[0]); })) return null;
  var started = PILLARS.some(function(g){ var f = firstDay(g[0]); return f && k >= f; });
  if (!started) return null;
  var full = allThree(k), ice = frozen(k);
  var req = PILLARS.filter(function(g){ return required(g[0], k); });
  var missed = req.filter(function(g){ return !pDone(k, g[0]); });
  /* "Nothing ticked" has to be measured against what the day actually asked
     for, not against three: a Saturday asks for two, because there is no
     shift to finish, and calling that a two-out-of-three miss would be the
     app inventing a failure. */
  return {
    k: k, full: full, ice: ice, missed: missed,
    kicker: dayName(k) + " closed",
    head: full ? "All three landed."
        : ice ? "Covered by a freeze."
        : (req.length && missed.length === req.length) ? "Nothing ticked."
        : missed.map(function(g){ return g[1]; }).join(" and ") + " did not land.",
    sub: full ? null
       : missed.length === 1 ? "The other two did."
       : null
  };
}

/* The seven marks of the week he is standing in, drawn small. Same reading
   as the meter on Today so the two never disagree. */
function openWeekHTML(){
  var w = weekState(), days = weekAll(w.key), t = today();
  var h = "<div class='op-wk'>";
  days.forEach(function(k, i){
    var future = k > t, full = !future && allThree(k), ice = !future && frozen(k);
    h += "<span class='op-d" + (full ? " on" : "") + (ice ? " ice" : "")
      + (k === t ? " now" : "") + (future ? " soon" : "") + "'></span>";
  });
  h += "</div><div class='op-wl'>" + w.full + " of " + WEEK_LINE
    + (w.kept ? " · kept" : "") + " this week</div>";
  return h;
}

/* The two or three facts worth carrying into the day. Never more than three,
   and each has to be something he could not read off the three circles. */
function openFacts(ask){
  var out = [], t = today();
  ask = String(ask || "");
  var run = dayRun(), best = bestRunEver();
  if (run > 0) out.push(["Run", run + (run === 1 ? " day" : " days")
    + (best >= 7 && run >= best ? " \u00b7 a record" : "")]);
  /* Only when the headline is not already about that person: the front page
     saying "Ring Mum" and then "Home: 2 weeks since Mum" underneath is the
     same redundancy he has objected to on every other screen. */
  if (typeof personDue === "function"){
    var due = personDue();
    if (due && ask.indexOf(due.name) === -1){
      var m = typeof zoneMin === "function" ? zoneMin(due.tz) : null;
      out.push(["Home", sinceWord(due.id) + " since " + due.name
        + (m === null ? "" : " \u00b7 " + hhmm(m) + " there")]);
    }
  }
  if (typeof packsWaiting === "function"){
    var pw = packsWaiting(), np = pw.day + pw.streak;
    if (np > 0) out.push(["Waiting", np + (np === 1 ? " pack" : " packs") + " to open"]);
  }
  var wr = typeof weekRun === "function" ? weekRun() : 0;
  if (wr > 0) out.push(["Weeks kept", wr + " running"]);
  if (typeof chipNext === "function"){
    var c = chipNext();
    if (c && c.away > 0 && c.away <= 14)
      out.push(["Next chip", c.away + (c.away === 1 ? " day" : " days") + " \u00b7 " + c.name]);
  }
  var r = rank(), dn = daysToNext(r);
  if (dn && dn <= 10) out.push(["Level " + (r.level + 1), "about " + dn
    + (dn === 1 ? " full day" : " full days")]);
  return out.slice(0, 3);
}

function openingHTML(){
  var t = today(), v = dayVerdict(lastClosedDay());
  var gap = OPEN_GAP;
  var sit = situation(), s = shape(), pr = priority({ noPacks: true });
  var h = "<div class='op-in'>";

  /* --- what happened while he was away --- */
  if (gap > 2){
    /* Away for a while. Say so plainly and without a telling-off: the app
       that scolds you for coming back is the app you do not come back to. */
    h += "<div class='op-back'><span class='op-k'>" + gap + " days since you opened this</span>"
      + "<b>Nothing was lost.</b>"
      + "<span class='op-s'>The record is where you left it and the week starts on Mondays "
      + "regardless.</span></div>";
  } else if (v){
    h += "<div class='op-y'><span class='op-k'>" + esc(v.kicker) + "</span>"
      + "<b class='" + (v.full ? "won" : v.ice ? "ice" : "") + "'>" + esc(v.head) + "</b>"
      + (v.sub ? "<span class='op-s'>" + esc(v.sub) + "</span>" : "")
      + "</div>";
  }
  h += openWeekHTML();

  h += "<div class='op-rule'></div>";

  /* --- today --- */
  h += "<div class='op-t'><span class='op-k'>" + esc(dayName(t).toUpperCase()) + " "
    + new Date().getDate() + " " + MONTHS_SHORT[new Date().getMonth()].toUpperCase()
    + (sit.home ? "" : " · " + esc(sit.city.toUpperCase()))
    + (s.noShift ? " · NO SHIFT" : " · MALTA " + s.startT + "–" + s.endT)
    + "</span>";
  h += "<b>" + esc(pr.ask) + "</b>";
  if (pr.sub) h += "<span class='op-s'>" + esc(pr.sub) + "</span>";
  h += "</div>";

  /* --- the two or three numbers --- */
  var facts = openFacts(pr.ask + " " + (pr.sub || ""));
  if (facts.length){
    h += "<div class='op-f'>";
    facts.forEach(function(f){
      h += "<div class='op-fr'><span>" + esc(f[0]) + "</span><b>" + esc(f[1]) + "</b></div>";
    });
    h += "</div>";
  }

  h += "<button class='op-go' data-openclose='1'>Start the day</button>";
  h += "</div>";
  return h;
}

/* ------------------------------------------------------------- tomorrow
   The day this app went quiet on was the day he finished: three ticks, a
   pack, and then nothing until the next morning. A game with nothing after
   the win is a game you stop opening, so a finished day now faces forward.

   One line, and only on a day that is already in - it is not a fourth thing
   to do, it is the fixture list. What is in it, in order of how much it
   would actually get him out of bed: what the week still needs, tomorrow's
   session, and who is due a call. */
function tomorrowLine(){
  var tm = shift(1), bits = [dayName(tm)];
  var w = typeof weekState === "function" ? weekState() : null;
  /* only worth saying while it is still reachable and not already kept */
  if (w && !w.kept && w.alive && w.need > 0 && w.left > 0)
    bits.push(w.need === 1 ? "one more keeps the week"
            : w.need + " more to keep the week");
  var b = typeof briefFor === "function" ? briefFor(tm) : null;
  if (b && b.gym) bits.push(b.gym);
  if (typeof personDue === "function"){
    var due = personDue();
    if (due) bits.push(due.name + " is due");
  }
  return bits.slice(0, 3).join(" \u00b7 ");
}

/* Shown once a day, on the first open, and never in the way of anything
   else. Everything about the timing here is defensive: this is the first
   thing he sees, so it must never be the thing that stops him getting in. */
function openingDue(){
  if (!S.onboarded) return false;                  /* the tour owns day one  */
  if (S.lastOpen === today()) return false;        /* once a day             */
  if (typeof COACH !== "undefined" && COACH && COACH.on) return false;
  if (MODAL || (typeof ST !== "undefined" && ST)) return false;
  if (!document.getElementById("gate") || !document.getElementById("gate").hidden) return false;
  /* nothing to report on a record with no days behind it */
  return !!dayVerdict(lastClosedDay()) || !!S.lastOpen;
}
function showOpening(){
  if (!openingDue()) return;
  var el = document.getElementById("opening");
  if (!el) return;
  OPEN_GAP = S.lastOpen ? Math.round((new Date(today() + "T00:00:00")
    - new Date(S.lastOpen + "T00:00:00")) / 86400000) : 0;
  S.lastOpen = today(); save();
  el.innerHTML = openingHTML();
  el.hidden = false;
  /* anywhere, not just the button: this is a page to glance at and dismiss,
     and hunting for a target is the opposite of that */
  el.onclick = function(){ closeOpening(); };
  /* one frame, so the transition has something to run from */
  requestAnimationFrame(function(){ el.classList.add("on"); });
  OPENING = 1;
  sfx("tap");
}
function closeOpening(){
  if (!OPENING) return;
  OPENING = null;
  var el = document.getElementById("opening");
  if (!el) return;
  el.classList.remove("on");
  el.classList.add("going");
  sfx("done"); buzz(10);
  setTimeout(function(){
    el.hidden = true;
    el.className = "";
    el.innerHTML = "";
  }, reduced() ? 0 : 420);
}

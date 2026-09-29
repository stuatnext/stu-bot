"use strict";

/* ========================================================================
   world.js - the clock the app keeps for itself.

   His correction, and it is the sharpest one yet: "I didn't ask for a copy
   of Balatro. I asked for a game that can be as sticky as Balatro." Seven
   rounds of mine had taken the reference literally - jokers, chips x mult,
   an ante, a hand of playing cards - which is Balatro's nouns wearing his
   life as a skin.

   What he actually picked, asked straight, was a world that moves without
   him. Opening the app should be finding out what happened, not reporting
   what he did. That is AdVenture Capitalist's real hook rather than its
   arithmetic: it ran while you were away, so coming back is a reward.

   And it is available to this app honestly, which is the whole reason it is
   worth building. His life genuinely moves while he is not looking:

     - Sheffield wakes up and goes to bed on a clock eight hours behind him.
     - Malta's shift starts and ends on a third clock.
     - The gap since he last rang his dad goes up by one every midnight.
     - Windows open and shut: the gym before the shift, the call while
       someone is awake, sunscreen while the sun is up, the wind-down.
     - He gets on planes, and the whole board shifts by a few hours.

   None of that needs inventing. Every event in this file is a FUNCTION OF
   THE RECORD AND THE CLOCK - the same rule run.js is built on. The world
   can report that time passed; it can never report that he did something.

   ------------------------------------------------------------------------
   HIS DAY, NOT THE CALENDAR DAY. Everything here is measured in minutes
   since he woke, 0 to 1440, because his shift ends at 23:00 and Sheffield's
   evening lands at four in the morning where he is standing. A midnight
   axis would cut his own day in half and put the most important window of
   it in two pieces.
   ======================================================================== */

var PWAKE = 390, PSLEEP = 1350;   /* 06:30 - 22:30, the hours a person is reachable */

/* ------------------------------------------------------------ the clocks */
function nowMin(){ var n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
/* Minutes another zone is ahead of him, signed, so it reads the way he would
   say it: Sheffield is -480, "eight hours behind". */
function zoneShift(tz){
  var m = zoneMin(tz);
  if (m === null) return null;
  var d = (m - nowMin() + 1440) % 1440;
  return d > 720 ? d - 1440 : d;
}
/* What his own clock says when theirs says theirMin. The one piece of
   arithmetic that stands between him and ringing home. */
function myMinFor(tz, theirMin){
  var s = zoneShift(tz);
  if (s === null) return null;
  return ((theirMin - s) % 1440 + 1440) % 1440;
}
/* The axis. 0 is the minute he got up; 1440 is the minute he gets up again. */
function wakeMin(){ return t2m(S.wake || "08:30"); }
function bedMin(){ return t2m(S.bed || BED_DEFAULT); }
/* Where his day starts on the axis. Usually the minute he gets up - but he
   works someone else's hours from a third country, and on a posting where
   Malta starts before his alarm the shift would wrap round to the far right
   of the strip and read as happening at the end of the day. So the anchor is
   pulled back to whichever comes first, his alarm or his shift. */
function dayAnchor(){
  var wake = wakeMin(), s = shape();
  if (s.noShift) return wake;
  var d = ((s.start - wake) % 1440 + 1440) % 1440;
  return d > 1080 ? ((s.start - 30) % 1440 + 1440) % 1440 : wake;
}
function sinceWake(min){ return ((min - dayAnchor()) % 1440 + 1440) % 1440; }

/* ------------------------------------------------------------- the windows
   The day as a set of things that are open, shutting, or shut. This is the
   board now: not a list of what he owes, but a picture of what is still
   reachable and for how long.

   [ id, label, colour, what it is worth, a function returning its hours ]
   Hours are minutes on HIS clock; a window that runs past midnight is fine,
   because the axis is his day rather than the date. */
function winList(k){
  k = k || today();
  var s = shape(), sit = situation(k), out = [];
  var wake = wakeMin(), bed = bedMin();

  /* Trained - before the shift if there is one, otherwise all day. A window
     that is only ever "today" is not a window, so this one is honest about
     the fact that his mornings are the only free hours he has. */
  /* v83: ill - rest is the training, and there is no station to fail */
  if (!sickOn(k)) out.push({ id: "p:train", kind: "pillar", key: "train", label: "Train",
    col: "#5AC8F5", chip: CHIP.pillar, rank: 0, short: "Train",
    done: pDone(k, "train"),
    /* On a posting where Malta starts before his alarm there is no free
       morning at all, so the window is the whole day rather than a
       twenty-three-hour wrap that reads as "open for another 22h". */
    open: wake, shut: (s.noShift || ((s.start - wake + 1440) % 1440) > 1080) ? bed : s.start,
    why: s.noShift ? "No shift - the whole day is yours"
       : ((s.start - wake + 1440) % 1440) > 1080
         ? "Malta is already on - fit it where you can"
         : "Before Malta starts at " + s.startT });

  /* The people. Each one carries their own window, because each one is on
     their own clock - which is the single most useful thing this app knows
     and the reason the third pillar is not a checkbox. */
  var ppl = typeof people === "function" ? people() : [];
  var famDone = pDone(k, "family");
  var best = null;
  ppl.forEach(function(p){
    var o = myMinFor(p.tz, PWAKE), c = myMinFor(p.tz, PSLEEP);
    if (o === null) return;
    var over = typeof personOver === "function" ? personOver(p) : 0;
    var spoke = typeof spokeOn === "function" && spokeOn(p.id, k);
    var w = { id: "w:" + p.id, kind: "person", pid: p.id, label: p.name,
      col: "#FF8FA3", chip: 0, done: spoke, open: o, shut: c, over: over,
      why: p.where ? p.where + " is awake " + hhmm(o) + "–" + hhmm(c)
                     + " your time" : "" };
    if (!spoke && (!best || over > best.over)) best = w;
  });
  /* One card for the pillar, wearing the window of whoever is most overdue -
     three separate people on the board is a roster, not a day. */
  if (best || !ppl.length){
    var fo = best ? best.open : myMinFor("Europe/London", PWAKE);
    var fc = best ? best.shut : myMinFor("Europe/London", PSLEEP);
    out.push({ id: "p:family", kind: "pillar", key: "family", label: "Family",
      col: "#FF8FA3", chip: CHIP.pillar, rank: 0, short: "Family", done: famDone,
      open: fo === null ? wake : fo, shut: fc === null ? bed : fc,
      who: best ? best.label : "",
      /* peopleLine is the single most useful sentence this app writes - who,
         what o'clock it is there, and how long it has been. The window's own
         hours are drawn on the strip above; the panel gets the sentence. */
      why: (typeof peopleLine === "function" && typeof peopleEmpty === "function"
            && !peopleEmpty()) ? peopleLine()
         : best ? best.why : "A conversation with someone at home" });
  } else {
    out.push({ id: "p:family", kind: "pillar", key: "family", label: "Family",
      col: "#FF8FA3", chip: CHIP.pillar, rank: 0, short: "Family", done: famDone,
      open: wake, shut: bed, why: "A conversation with someone at home" });
  }

  /* Stopped - it only exists once the shift has an end to finish at, and it
     shuts, because "did you stop on time" stops being answerable at some
     point in the evening. */
  if (!s.noShift){
    out.push({ id: "p:stop", kind: "pillar", key: "stop", label: "Stop",
      col: "#F2B735", chip: CHIP.pillar, rank: 0, short: "Stop",
      done: pDone(k, "stop"),
      open: Math.max(0, s.end - 30), shut: s.end + 120,
      why: "Malta finishes at " + s.endT });
  }

  /* The routines, on the hours they are actually about. */
  if (typeof ROUTINES !== "undefined" && typeof careDue === "function"){
    var dayOpen = wake - 30, dayShut = bed - 150;
    if (dayShut <= dayOpen) dayShut = dayOpen + 600;
    ROUTINES.forEach(function(r){
      if (!careDue(r[0], k)) return;
      if (typeof careLive === "function" && !careLive(r[0])) return;
      var night = r[3] === "night";
      out.push({ id: "c:" + r[0], kind: "care", key: r[0], label: r[1],
        short: { sun: "Sun", skin: "Skin", bed: "Bed" }[r[0]] || r[1],
        col: "#3FD9A0", chip: CHIP.routine, rank: 1, done: careOn(k, r[0]),
        open: night ? dayShut : dayOpen, shut: night ? bed + 60 : dayShut,
        why: r[2] });
    });
  }

  /* v81: the kit. A routine he has nothing to do with is held back, and
     this one step stands in for all of it until he has - asked first, then
     shopped for. It does not shut; a Watsons is open late. */
  /* v82: not on a vegetating day - nothing else is asked */
  if (typeof kitWanted === "function" && S.onboarded && !(typeof vegOn === "function" && vegOn(k))){
    var kw = kitWanted();
    if (kw.length){
      out.push({ id: "kit", kind: "kit", label: kitLabel(kw), short: "Kit",
        col: "#FF8FB3", chip: 0, rank: 2, done: 0, open: wake, shut: bed + 15,
        kit: kw, why: kitWhy(kw) });
    }
  }

  /* The day's card, which is open as long as the day is. Something he put in
     his own hand outranks one the app drew for him. */
  var hd = (typeof handDo === "function" && S.onboarded) ? handDo() : [];
  /* v78: a date night is an evening station of its own on the days he
     picked - done, it is a Tim & me step */
  if (typeof dateNightOn === "function" && S.onboarded && dateNightOn(k)){
    var nm = nightMin();
    out.push({ id: "date", kind: "date", label: "Date night", short: "Date night",
      col: "#FF5A7A", chip: 0, rank: 1, done: dateNightDone(k) ? 1 : 0,
      open: nm, shut: Math.max(nm + 150, bed), why: "Yours and Tim's. Laptop shut, phones away." });
  }
  /* v82: the week. Coffee somewhere new on the days that have it, before
     the lunch crowd; and the day's focus - the business, community,
     Mandarin, his name - takes the slot. A vegetating day has neither and
     nothing in the slot: nothing else is asked. */
  var dfc = (typeof dayFocus === "function" && S.onboarded) ? dayFocus(k) : "";
  var veg = (typeof vegOn === "function" && S.onboarded) ? vegOn(k) : false;
  if (typeof coffeeDay === "function" && S.onboarded && coffeeDay(k)){
    var cw = coffeeWindow(k), cp = coffeePick(k);
    out.push({ id: "coffee", kind: "coffee", label: "Coffee somewhere new", short: "Coffee",
      col: "#E0A15A", chip: 0, rank: 2, done: coffeeOn(k) ? 1 : 0, open: cw[0], shut: cw[1],
      why: coffeeOn(k) ? "Found one. Coffee passport: " + coffeePassport() + "."
         : cp[0] + ", " + cafeWhere(cp) + ". " + coffeeWhen(cp, cw[0]) });
  }
  if (dfc){
    var fst = focusToday(k), fo = FOCI[dfc];
    out.push({ id: "focus", kind: "focus", label: fo[0], short: fo[1], col: fo[3], chip: 0, rank: 1,
      done: focusDoneOn(k) ? 1 : 0, open: wake, shut: s.noShift ? bed : s.start,
      focus: fst, why: fst ? fst.how : "" });
  }
  /* v77: a focus skill's small step for the week takes the slot first -
     he chose the focus, and it is the thing that moves his life, not just
     his day. Done, and the slot goes back to his own hand or the card.
     v82: only on a day the week has not given a focus to. */
  var free = !dfc && !veg;
  var ls = (free && typeof lifeStep === "function" && S.onboarded) ? lifeStep(k) : null;
  if (ls){
    var sk = skillDef(ls.skill);
    out.push({ id: "life", kind: "life", label: sk[1], short: "Level up",
      col: sk[3], chip: 0, rank: 2, done: 0, open: wake, shut: bed + 15,
      life: ls, why: ls.act[3] + "." });
  } else if (free && hd.length){
    out.push({ id: "todo", kind: "todo", label: hd[0][1], short: "To do",
      col: "#CE82FF", chip: 0, rank: 2, done: 0, open: wake, shut: bed + 15,
      todo: hd[0], why: hd[0][2] });
  } else if (free && typeof questFor === "function" && S.onboarded){
    var q = questFor(k);
    if (q) out.push({ id: "card", kind: "card", label: "The card", short: "Card",
      col: "#CE82FF", chip: CHIP.card, rank: 2, done: !!q.done,
      open: wake, shut: bed + 15, card: q,
      why: q.done ? "Done." : q.text });
  }

  /* A waiting pack is not a window - it does not shut - but it is a thing
     the day is holding for him, and the row is where the day's things live. */
  if (typeof packsWaiting === "function"){
    var pw = packsWaiting(), packs = pw.day + pw.streak;
    if (packs) out.push({ id: "pack", kind: "pack",
      label: packs === 1 ? "A pack" : packs + " packs", short: "Packs",
      btn: packs === 1 ? "Open it" : "Open them",
      col: "#FFC800", chip: 0, rank: 3, done: 0, open: wake, shut: bed + 15,
      why: packs === 1 ? "A pack, earned by a day you had."
                       : packs + " packs, earned by days you had." });
  }

  out.forEach(function(w){
    w.a = sinceWake(w.open);
    w.b = sinceWake(w.shut);
    /* v82: a window that opens a little before he wakes - the morning
       routine opens half an hour early - is open from the moment he is up,
       not "soon" for the next twenty-three hours */
    if (w.a >= 1260 && w.b < w.a) w.a = 0;
    if (w.b <= w.a) w.b = 1440;            /* runs to the end of his day */
    w.state = winState(w);
  });
  return out;
}
/* Where a window stands right now. "Shut" is information, never an
   accusation: a gym window that closed at four is a fact about the day, and
   the app saying so is the difference between a world and a nag. */
function winState(w){
  if (w.done) return "done";
  var n = sinceWake(nowMin());
  if (n < w.a) return "soon";
  if (n < w.b) return "open";
  return "shut";
}
function winLeft(w){
  var n = sinceWake(nowMin());
  if (w.state === "soon") return w.a - n;
  if (w.state === "open") return w.b - n;
  return n - w.b;
}
/* The one closing soonest, which is the only genuinely urgent thing the app
   can ever say. Done windows and shut ones are not urgent. */
function winClosing(k){
  var live = winList(k).filter(function(w){ return w.state === "open" && !w.done; });
  if (!live.length) return null;
  live.sort(function(a, b){ return winLeft(a) - winLeft(b); });
  return live[0];
}

/* ==================================================================== news
   What happened while he was not looking. Every item is a moment with a
   time on it, derived from the clock and the record, and the list is bounded
   by when he last had the app open.

   The rule this file lives or dies by: a moment can say that time passed. It
   can never say that he did something, or undo something he did. */
function lastSeenMs(){ return Number(S.lastSeen) || 0; }
function markSeen(){ S.lastSeen = Date.now(); save(); }
/* How long he was away, in minutes, capped at a week so a returning user
   after a month is not told about six hundred sunrises. */
function awayMin(){
  var ls = lastSeenMs();
  if (!ls) return 0;
  return Math.min(10080, Math.max(0, Math.round((Date.now() - ls) / 60000)));
}

/* A moment that happened at a given minute-of-day, resolved to the most
   recent time it actually occurred. */
function lastOccurrence(min){
  var n = new Date();
  var d = new Date(n.getFullYear(), n.getMonth(), n.getDate(),
                   Math.floor(min / 60), min % 60, 0, 0);
  if (d.getTime() > n.getTime()) d.setDate(d.getDate() - 1);
  return d.getTime();
}
function nextOccurrence(min){
  var n = new Date();
  var d = new Date(n.getFullYear(), n.getMonth(), n.getDate(),
                   Math.floor(min / 60), min % 60, 0, 0);
  if (d.getTime() <= n.getTime()) d.setDate(d.getDate() + 1);
  return d.getTime();
}

/* Everything the world did in the window he was away for. */
function worldNews(){
  var out = [], ls = lastSeenMs(), now = Date.now();
  if (!ls) return out;
  var from = Math.max(ls, now - 10080 * 60000);
  function add(at, tone, head, sub){
    if (at <= from || at > now) return;
    out.push({ at: at, tone: tone, head: head, sub: sub || "" });
  }

  var s = shape(), k = today();

  /* The day rolled over. The one moment that is about the record rather
     than the clock - and it still only reads it. */
  var mid = lastOccurrence(0);
  if (mid > from){
    var y = shiftFrom(k, -1);
    var full = allThree(y), ice = frozen(y);
    add(mid, full ? "good" : ice ? "flat" : "cold",
      full ? dayName(y) + " landed, all three."
        : ice ? dayName(y) + " was covered by a freeze."
        : dayName(y) + " closed without all three.",
      full ? "The run carried." : "Nothing owed for it now. Today is its own day.");
  }

  /* Malta. His shift starting and ending is the spine of his day and he is
     asleep for neither, but he is often away from the app for both. */
  if (!s.noShift){
    add(lastOccurrence(s.start), "flat", "Malta started.", "Shift until " + s.endT + ".");
    var endAt = lastOccurrence(s.end % 1440);
    if (endAt > from){
      add(endAt, pDone(k, "stop") ? "good" : "warn", "Malta finished.",
        pDone(k, "stop") ? "You stopped with it." : "Stopped is still open.");
    }
  }

  /* The people, waking and going to bed on their own clocks. This is the
     part no other app could write for him. */
  var ppl = typeof people === "function" ? people() : [];
  ppl.forEach(function(p){
    var o = myMinFor(p.tz, PWAKE), c = myMinFor(p.tz, PSLEEP);
    if (o === null) return;
    var over = typeof personOver === "function" ? personOver(p) : 0;
    var spoke = typeof spokeOn === "function" && spokeOn(p.id, k);
    add(lastOccurrence(o), over > 0 && !spoke ? "warn" : "flat",
      p.name + " woke up.",
      p.where ? hhmm(PWAKE) + " in " + p.where
        + (over > 0 && !spoke ? " · " + sinceWord(p.id) + " since you spoke" : "") : "");
    if (!spoke){
      add(lastOccurrence(c), over > 0 ? "cold" : "flat",
        p.name + " went to bed.",
        p.where ? "That window is shut until " + hhmm(o) + " your time." : "");
    }
  });

  /* Packs that accrued while he was away. Already earned, never invented. */
  if (typeof packsWaiting === "function"){
    var w = packsWaiting(), packs = w.day + w.streak;
    if (packs && mid > from)
      add(mid + 1000, "good", packs === 1 ? "A pack is waiting." : packs + " packs are waiting.",
        "Earned by days you already had.");
  }

  out.sort(function(a, b){ return b.at - a.at; });
  return out;
}

/* What is about to happen, in order, so the board can show the day coming
   rather than only the day so far. */
function worldNext(n){
  var out = [], s = shape(), k = today();
  function add(at, label, sub){ if (at) out.push({ at: at, label: label, sub: sub || "" }); }
  if (!s.noShift){
    if (!s.working && nowMin() < s.start) add(nextOccurrence(s.start), "Malta starts", s.startT);
    else if (s.working) add(nextOccurrence(s.end % 1440), "Malta finishes", s.endT);
  }
  var ppl = typeof people === "function" ? people() : [];
  ppl.forEach(function(p){
    var m = zoneMin(p.tz);
    if (m === null) return;
    var asleep = windowAt(m) === "asleep";
    var at = asleep ? nextOccurrence(myMinFor(p.tz, PWAKE))
                    : nextOccurrence(myMinFor(p.tz, PSLEEP));
    add(at, p.name + (asleep ? " wakes" : " turns in"),
      p.where ? hhmm(asleep ? PWAKE : PSLEEP) + " there" : "");
  });
  var cl = winClosing(k);
  if (cl) add(nextOccurrence(cl.shut % 1440), cl.label + " shuts", hhmm(cl.shut % 1440));
  out.sort(function(a, b){ return a.at - b.at; });
  return n ? out.slice(0, n) : out;
}

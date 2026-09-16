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

/* ------------------------------------------------------------- the arrival
   The news has to be read BEFORE the open is stamped, or looking at it is
   what clears it. Captured once, held for the session, and refreshed when he
   comes back to the app after long enough for the world to have moved. */
function arrive(force){
  if (NEWS !== null && !force) return NEWS;
  AWAY = awayMin();
  NEWS = worldNews();
  markSeen();
  return NEWS;
}

/* ================================================================== the view */
function viewBoard(){
  var k = today();
  TODAY_MORE = "";
  arrive();
  var wins = winList(k), sel = boardPick(wins);
  var h = "<div class='b-t'>";

  h += bHourHTML();
  h += wNewsHTML();
  h += wDayHTML(wins);
  h += bVitalsHTML(k);
  h += wNextHTML();
  h += bPlayHTML(sel, k);
  h += wWindowsHTML(wins, sel);
  h += wFootHTML(k);
  h += TODAY_MORE;
  return h + "</div>";
}

/* ------------------------------------------------------------- the hour
   Daylight's soul, down to one line and a 34px arc: the date, the city he is
   standing in, and whose hours he is keeping. The three facts the rest of
   the screen assumes. */
function bHourHTML(){
  var s = shape(), sit = situation(), ph = skyPhase();
  var night = ph === "night" || ph === "deepnight" || ph === "dusk";
  var guessed = !sit.home && typeof whereIsGuessed === "function" && whereIsGuessed();
  var now = arcPt(s.now / 1440);
  var h = "<div class='b-hr'><svg viewBox='0 0 124 64' aria-hidden='true'>"
    + "<polyline class='arc' points='" + arcSeg(0, 1) + "'/>";
  if (!s.weekend && s.end > s.start)
    h += "<polyline class='band' points='"
      + arcSeg(s.start / 1440, Math.min(s.end, 1439) / 1440) + "'/>";
  h += "<circle class='orb" + (night ? " moon" : "") + "' cx='" + now[0].toFixed(1)
    + "' cy='" + now[1].toFixed(1) + "' r='9'/></svg>";
  h += "<i>" + esc(shortToday())
    + (sit.home ? "" : " · <button class='b-loc" + (guessed ? " ask" : "") + "' data-"
        + (guessed ? "locate" : "notthere") + "='1'>" + esc(sit.city) + "</button>")
    + " · " + esc(shortDial(s)) + "</i>";
  return h + "</div>";
}

/* ==================================================================== news
   What the world did while he was not looking. The month recap rides at the
   top of it when one is due, because a month closing is the largest thing
   that ever happens to this record and a feed is where news belongs. */
function wNewsHTML(){
  var items = [], rec = S.onboarded ? monthRecapDue() : null;
  if (rec) items.push({ month: 1, tone: "good", head: monthName(rec.ym) + ", filed.",
    sub: rec.full + " of " + rec.possible + " full days · best run " + rec.best
       + (rec.lesson ? ". " + rec.lesson : ""), ym: rec.ym });
  (NEWS || []).forEach(function(n){ items.push(n); });
  var dsp = S.onboarded && typeof dispatchFor === "function" ? dispatchFor(today()) : "";
  if (!items.length && !dsp) return "";
  /* Three on a phone with room for three. A 4.7-inch screen has room for two
     and the board is supposed to fit one screen, which is worth more than
     the third item - the news is sorted with the newest first, so what goes
     is always the oldest thing that happened. */
  var room = (typeof window !== "undefined" && window.innerHeight < 700) ? 2 : 3;
  /* The day's dispatch is pinned to the bottom of the feed. It is an
     observation rather than an event, which is why it has a bullet instead
     of a time - and it is the one line that is always there, so a morning
     with nothing to report still has something true to say. */
  items = items.slice(0, Math.max(0, room - (dsp ? 1 : 0)));
  if (dsp) items.push({ dispatch: 1, tone: "flat", head: dsp });

  var h = "<div class='w-news'><div class='w-nh'>"
    + (AWAY >= 25 ? "While you were away · " + dur(AWAY) : "Since you looked")
    + "</div>";
  items.forEach(function(n){
    var at = n.at ? hhmm(new Date(n.at).getHours() * 60 + new Date(n.at).getMinutes()) : "";
    h += "<div class='w-n " + esc(n.tone || "flat") + (n.dispatch ? " w-nd" : "") + "'>"
      + (at ? "<em>" + at + "</em>" : "<em class='w-nm'>•</em>")
      + "<span><b>" + esc(n.head) + "</b>"
      + (n.sub ? "<i>" + esc(n.sub) + "</i>" : "") + "</span>"
      + (n.month ? "<button class='w-nok' data-monthok='" + esc(n.ym) + "'>Noted</button>" : "")
      + "</div>";
  });
  return h + "</div>";
}

/* ================================================================= the day
   His shift and home's waking hours on one axis, with now moving across it.

   This is the picture the app has owed him since v1 and never drew. He works
   Malta's hours from Singapore and his family is eight hours behind him: the
   honest reason he does not ring home is not that he forgets, it is that the
   only window is inside his own shift. A list of three things can never say
   that. One axis can say it at a glance, and it says it differently every
   day, because he is on a plane most weeks.

   The axis is HIS day - wake to wake - not the calendar's. A midnight axis
   would cut his shift in half and put Sheffield's evening in two pieces. */
function wDayHTML(wins){
  var s = shape(), anchor = dayAnchor();
  var nowPos = sinceWake(nowMin()) / 1440 * 100;
  var h = "<div class='w-tl'>";

  /* Lane one: Malta. Lane two: home. The labels live in a gutter on the left
     rather than inside the bands - a band is two hours wide on a phone and
     any word put inside it is a word cut in half. */
  h += "<div class='w-lane'><span class='w-lk'>Malta</span><span class='w-tr'>";
  if (!s.noShift) h += wBands("shift", s.start, s.end);
  h += wNow(nowPos, 1);
  h += "</span><span class='w-lv'>" + esc(s.noShift ? "none" : s.startT + "\u2013" + s.endT)
    + "</span></div>";

  var ppl = (typeof people === "function" ? people() : []).filter(function(p){
    return zoneMin(p.tz) !== null;
  });
  /* Whoever is furthest past their rhythm gets the lane - the point of the
     picture is the window he keeps missing, not a roster. */
  var lead = null;
  ppl.forEach(function(p){
    var over = typeof personOver === "function" ? personOver(p) : 0;
    if (!lead || over > lead.over) lead = { p: p, over: over };
  });
  h += "<div class='w-lane'><span class='w-lk'>"
    + esc(lead ? (lead.p.where || lead.p.name) : "Home") + "</span><span class='w-tr'>";
  if (lead) h += wBands("ppl", myMinFor(lead.p.tz, PWAKE), myMinFor(lead.p.tz, PSLEEP));
  h += wNow(nowPos, 0);
  h += "</span><span class='w-lv'>"
    + esc(lead ? hhmm(myMinFor(lead.p.tz, PWAKE)) + "\u2013"
                 + hhmm(myMinFor(lead.p.tz, PSLEEP)) : "\u2013")
    + "</span></div>";

  /* The hours it is crossing, in the same column as the tracks so the ticks
     line up with the bands above them. */
  h += "<div class='w-lane ax'><span class='w-lk'></span><span class='w-tr w-ax'>";
  for (var q = 0; q <= 4; q++){
    h += "<span style='left:" + (q * 25) + "%'>" + hhmm(anchor + q * 360) + "</span>";
  }
  h += "</span><span class='w-lv'></span></div>";
  return h + "</div>";
}
/* A window that runs past the end of his day comes back round at the start
   of it, so it is drawn as the two pieces it actually is. Sheffield is awake
   from half past two in his afternoon until half past six the next morning;
   one rectangle cannot say that, and the version that tried drew a four-hour
   stub against the right-hand edge. */
function wBands(cls, openMin, shutMin){
  var a = sinceWake(openMin) / 1440 * 100, b = sinceWake(shutMin) / 1440 * 100;
  function bar(x, w){
    return "<i class='w-b " + cls + "' style='left:" + x.toFixed(1) + "%;width:"
      + Math.max(1.2, w).toFixed(1) + "%'></i>";
  }
  if (b > a) return bar(a, b - a);
  return bar(a, 100 - a) + bar(0, b);
}

/* Now, drawn inside each track so the two segments meet as one line without
   any arithmetic about where the label gutter ends. */
function wNow(pos, head){
  return "<span class='w-now' style='left:" + pos.toFixed(2) + "%'>"
    + (head ? "<b></b>" : "") + "</span>";
}

/* ------------------------------------------------------------ the basics
   Five marks, four chips apiece, always there and tapped straight from the
   board. They are the one part of the day with no window at all. */
function bVitalsHTML(k){
  var h = "<div class='b-vt'>";
  VITALS.forEach(function(v){
    var on = vitalMet(v[0], k);
    var act = v[0] === "sleep" ? " data-sleep='1'"
            : v[0] === "out"   ? " data-out='1'"
            : v[0] === "water" ? " data-tab='basics'"
            : v[0] === "protein" ? " data-tab='food'"
            : " data-tab='gym'";
    var val = v[0] === "water"   ? waterOn(k) + "/" + WATER_GLASSES
            : v[0] === "sleep"   ? (sleepOn(k) ? sleepOn(k) + "h" : "–")
            : v[0] === "protein" ? num(proteinOn(k)) + "g"
            : (on ? "✓" : "–");
    h += "<button class='b-v" + (on ? " on" : "") + "'" + act + ">"
      + "<span class='b-vv'>" + esc(val) + "</span>"
      + "<span class='b-vl'>" + esc(v[1]) + "</span></button>";
  });
  return h + "</div>";
}

/* ================================================================== next
   The world has a past, a now and a future, and the board now shows all
   three: the news above, the day strip in the middle, and this. It also
   earns the space between the basics and the panel, which on a tall phone
   was a band of empty felt.

   Only boundaries go here - a shift ending, somebody waking, a window
   shutting - because those are the things that happen without him. */
function wNextHTML(){
  if (!S.onboarded || typeof worldNext !== "function") return "<div class='b-gap'></div>";
  /* A 4.7-inch screen does not have room for the future as well as the past,
     and the past is the half he cannot get anywhere else. */
  if (typeof window !== "undefined" && window.innerHeight < 700) return "<div class='b-gap'></div>";
  var next = worldNext(2), now = Date.now();
  if (!next.length) return "<div class='b-gap'></div>";
  var h = "<div class='w-next'><div class='w-nh'>Next</div>";
  next.forEach(function(x){
    h += "<div class='w-x'><em>" + esc(dur((x.at - now) / 60000)) + "</em>"
      + "<b>" + esc(x.label) + "</b>"
      + (x.sub ? "<i>" + esc(x.sub) + "</i>" : "") + "</div>";
  });
  return h + "</div>";
}

/* ============================================================== the windows
   The day as things that are open, shutting, or shut. Not a checklist: a
   checklist is the same every morning and this is never the same twice,
   because the shift, the city and whoever is awake all move.

   A shut window is information and never an accusation. The gym window
   closing at four is a fact about the day; the app saying so plainly is the
   difference between a world and a nag. */
function wWindowsHTML(wins, sel){
  var h = "<div class='w-wins' data-n='" + wins.length + "'>";
  wins.forEach(function(w){
    var left = winLeft(w), picked = sel && w.id === sel.id;
    var n = sinceWake(nowMin());
    var pct = w.state === "open" ? Math.max(0, Math.min(100, (n - w.a) / (w.b - w.a) * 100))
            : w.state === "shut" ? 100 : 0;
    h += "<button class='w-w " + w.state + (picked ? " up" : "") + "'"
      + " data-pick='" + esc(w.id) + "' style='--pil:" + w.col + "'>"
      + "<span class='w-wt'>" + esc(w.short || w.label) + "</span>"
      + "<span class='w-ws'>" + esc(
          w.state === "done" ? ""
        : w.state === "soon" ? hhmm(w.open)
        : wDur(left)) + "</span>"
      + "<span class='w-wb'><i style='width:" + pct.toFixed(0) + "%'></i></span>"
      + "<span class='w-wk'>" + (w.state === "done" ? svg("tick", 13)
        : w.state === "shut" ? "shut" : w.state === "soon" ? "opens" : "open") + "</span>"
      + "</button>";
  });
  return h + "</div>";
}
/* dur() to the minute is right in a sentence and wrong on a tile fifty
   pixels wide: with eleven hours left the minutes are noise that pushes the
   hours out of view. */
function wDur(m){
  m = Math.max(0, Math.round(m));
  return m >= 180 ? Math.round(m / 60) + "h" : dur(m);
}

/* Which window is in the panel. His pick if it still exists, else the one
   closing soonest, else the first thing still open, else nothing left. */
function boardPick(wins){
  var i;
  for (i = 0; i < wins.length; i++) if (wins[i].id === B_PICK) return wins[i];
  /* Open windows first, and among them the day before the prize: a stack of
     46 unopened packs is not what the afternoon is for, and it was winning
     the panel outright because it is the one thing that never shuts. */
  var open = wins.filter(function(w){ return w.state === "open" && !w.done; });
  if (open.length){
    open.sort(function(a, b){
      if ((a.rank || 0) !== (b.rank || 0)) return (a.rank || 0) - (b.rank || 0);
      return winLeft(a) - winLeft(b);
    });
    return open[0];
  }
  for (i = 0; i < wins.length; i++) if (wins[i].state === "soon") return wins[i];
  for (i = 0; i < wins.length; i++) if (!wins[i].done) return wins[i];
  return null;
}

/* --------------------------------------------------------------- the play
   The window in the panel: what it asks, how long it is open for, and the
   button that does it. One at a time, because a screen that asks for six
   things asks for nothing. */
function bPlayHTML(sel, k){
  var fwd = "";
  if (S.onboarded && allThree(k) && typeof tomorrowLine === "function"){
    var tl = tomorrowLine();
    if (tl) fwd = "<span class='b-pl-t'>Tomorrow · " + esc(tl) + "</span>";
  }
  if (!sel){
    var pr0 = priority();
    return "<div class='b-pl won'><b>" + esc(pr0.ask) + "</b>"
      + "<span>" + esc(pr0.sub || "") + "</span>" + fwd + "</div>";
  }

  var up = nextUp(), pr = priority({ noPacks: 1 });
  var isUp = sel.kind === "pillar" && sel.key === up && !sel.done;
  var ask = isUp ? pr.ask
          : sel.kind === "card" ? sel.card.card[0] + "."
          : sel.kind === "todo" ? sel.todo[1] + "."
          : sel.label + ".";
  var say = sel.done ? (sel.kind === "pillar" ? doneLine(sel.key) : "Done today.")
          : isUp ? (bSecond(pr.ask, pr.sub) || sel.why)
          : sel.kind === "care" ? careSay(sel.key, k)
          : sel.why;
  var left = winLeft(sel);
  var state = sel.state === "done" ? "Done"
            : sel.state === "open" ? "Open for another " + dur(left)
            : sel.state === "soon" ? "Opens at " + hhmm(sel.open)
            : "Shut " + dur(left) + " ago";

  var h = "<div class='b-pl " + sel.state + "' style='--pil:" + sel.col + "'>";
  h += "<span class='b-pl-h'><span class='b-pl-n'>" + esc(sel.label) + "</span>"
    + (sel.chip ? "<em class='b-pl-p'>+" + sel.chip + "</em>" : "")
    + "<em class='b-pl-c'>" + esc(state) + "</em></span>";
  h += "<b>" + esc(ask) + "</b>";
  h += "<span>" + esc(say) + "</span>";
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
/* priority() writes the headline and the line under it, and on some days
   they are the same sentence twice - "Stop. Malta finished at 15:00." over
   "Malta finished at 15:00. Shut the laptop." On a panel that is the whole
   card, the echo is dropped and the window's own line stands in. */
function bSecond(ask, sub){
  if (!sub) return "";
  var a = String(ask).toLowerCase().replace(/[^a-z0-9 ]/g, "");
  var b = String(sub).toLowerCase().replace(/[^a-z0-9 ]/g, "");
  var head = a.split(" ").slice(0, 4).join(" ");
  if (head && head.length > 8 && b.indexOf(head) !== -1) return "";
  if (b.length > 8 && a.indexOf(b.split(" ").slice(0, 4).join(" ")) !== -1) return "";
  return sub;
}

/* --------------------------------------------------------------- the foot
   The week, what today is worth, and what is standing over it. All of it
   demoted to one line: for seven rounds the score was the biggest thing on
   the screen, which is what made this a scoreboard attached to a chore list.
   It opens its own working. */
function wFootHTML(k){
  if (!S.onboarded) return "<div class='w-ft'></div>";
  var a = typeof anteState === "function" ? anteState() : null;
  var score = scoreOn(k), mult = multOn(k);
  var live = typeof jokerLive === "function" ? jokerLive(k) : {};
  var on = Object.keys(live).filter(function(x){ return live[x]; }).length;
  var h = "<button class='w-ft' data-work='1'>";

  /* The seven days, still. They have been on Today since v50 and "did I do
     Tuesday" is worth being able to answer without navigating - but the week
     is state, not news, so it is seven marks in the footer rather than a
     panel of its own. */
  if (a){
    h += "<span class='w-fd'>";
    weekAll(a.wk).forEach(function(d, i){
      var future = d > k, isToday = d === k;
      var full = !future && allThree(d), ice = !future && frozen(d);
      var miss = !future && !isToday && !full && !ice && startedBy(d);
      h += "<em class='" + (full ? "on" : ice ? "ice" : miss ? "miss"
        : isToday ? "now" : "soon") + "'>" + "MTWTFSS"[i] + "</em>";
    });
    h += "</span>";
    h += "<span class='w-fw'><b>" + num(a.got) + "</b>/" + num(a.target) + "</span>";
  }
  h += "<span class='w-fs'>Today <b>" + num(score) + "</b></span>";
  h += "<span class='w-fm'>\u00d7" + mult.toFixed(2).replace(/0$/, "")
    + (on ? " \u00b7 " + on : "") + "</span>";
  return h + "</button>";
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
function askWorking(){
  return ask({
    title: "The working",
    say: "Chips are what you did. The multiplier is what the record has earned, "
       + "plus whatever is true of the world today.",
    html: workingHTML(today()),
    options: [{ id: "cond", label: "Conditions",
                note: "What is standing over the day, and what it is worth" }],
    cancel: "Done"
  }).then(function(v){
    if (v === "cond" && typeof askJokers === "function") return askJokers();
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

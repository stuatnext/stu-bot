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
  h += bPlayHTML(sel, k);
  h += wWindowsHTML(wins, sel);
  h += bVitalsHTML(k);
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
    sub: rec.full + " of " + rec.possible + " full days \u00b7 best run " + rec.best,
    ym: rec.ym });
  (NEWS || []).forEach(function(n){ items.push(n); });
  var n0 = items[0];
  if (!n0){
    /* Nothing happened while he was away, so the line the app wrote about the
       day stands in. There is always something true to say. */
    var dsp = S.onboarded && typeof dispatchFor === "function" ? dispatchFor(today()) : "";
    if (!dsp) return "";
    n0 = { dispatch: 1, tone: "flat", head: dsp };
  }
  var at = n0.at ? hhmm(new Date(n0.at).getHours() * 60 + new Date(n0.at).getMinutes()) : "";
  var h = "<div class='w-news " + esc(n0.tone || "flat") + (n0.dispatch ? " w-nd" : "") + "'>";
  h += "<span class='w-nh'>" + (n0.dispatch ? "Today" : "While you were away") + "</span>";
  h += "<b>" + (at ? "<em>" + at + "</em> " : "") + esc(n0.head) + "</b>";
  if (n0.sub) h += "<i>" + esc(n0.sub) + "</i>";
  var rest = (NEWS || []).length - (rec ? 0 : 1);
  if (n0.month || rest > 0){
    h += "<span class='w-na'>";
    if (n0.month) h += "<button class='w-nok' data-monthok='" + esc(n0.ym) + "'>Noted</button>";
    if (rest > 0) h += "<button class='w-nmore' data-news='1'>" + rest + " more</button>";
    h += "</span>";
  }
  return h + "</div>";
}

/* The rest of what happened, on request. One thing on the board and the
   others a tap away is the difference between news and a wall. */
function askNews(){
  var h = "<div class='b-wl'>";
  (NEWS || []).forEach(function(n){
    var at = n.at ? hhmm(new Date(n.at).getHours() * 60 + new Date(n.at).getMinutes()) : "\u00b7";
    h += "<span class='b-wr'><em>" + esc(at + "  " + n.head)
      + (n.sub ? " " + n.sub : "") + "</em></span>";
  });
  return ask({ title: "While you were away",
    say: AWAY >= 25 ? "You were gone " + dur(AWAY) + "." : "Since you last looked.",
    html: h + "</div>", cancel: "Done" });
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

  /* Lane one: Malta. Lane two: home, and only when there is somebody on the
     roster to be awake - an empty lane with a dash in it was pure furniture. */
  h += "<div class='w-lane'><span class='w-lk'>Malta</span><span class='w-tr'>";
  if (!s.noShift) h += wBands("shift", s.start, s.end);
  h += wNow(nowPos, 1);
  h += "</span></div>";

  var ppl = (typeof people === "function" ? people() : []).filter(function(p){
    return zoneMin(p.tz) !== null;
  });
  var lead = null;
  ppl.forEach(function(p){
    var over = typeof personOver === "function" ? personOver(p) : 0;
    if (!lead || over > lead.over) lead = { p: p, over: over };
  });
  if (lead){
    h += "<div class='w-lane'><span class='w-lk'>"
      + esc(lead.p.where || lead.p.name) + "</span><span class='w-tr'>";
    h += wBands("ppl", myMinFor(lead.p.tz, PWAKE), myMinFor(lead.p.tz, PSLEEP));
    h += wNow(nowPos, 0);
    h += "</span></div>";
  }

  h += "<div class='w-lane ax'><span class='w-lk'></span><span class='w-tr w-ax'>";
  for (var q = 0; q <= 4; q++){
    h += "<span style='left:" + (q * 25) + "%'>" + hhmm(anchor + q * 360) + "</span>";
  }
  h += "</span></div>";
  return h + "</div>";
}

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
            : v[0] === "sleep"   ? (sleepOn(k) ? sleepOn(k) + "h" : "\u2013")
            : v[0] === "protein" ? num(proteinOn(k)) + "g"
            : (on ? "yes" : "\u2013");
    h += "<button class='b-v" + (on ? " on" : "") + "'" + act + ">"
      + esc(v[1].toLowerCase()) + " <b>" + esc(val) + "</b></button>";
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
  var h = "<div class='w-wins'>";
  wins.forEach(function(w){
    var picked = sel && w.id === sel.id;
    h += "<button class='w-w " + w.state + (picked ? " up" : "") + "'"
      + " data-pick='" + esc(w.id) + "' style='--pil:" + w.col + "'>"
      + "<i></i>" + esc(w.short || w.label) + "</button>";
  });
  return h + "</div>";
}

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
  if (!S.onboarded) return "";
  var a = typeof anteState === "function" ? anteState() : null;
  var h = "<button class='w-ft' data-work='1'>";
  if (a){
    h += "<span class='w-fd'>";
    weekAll(a.wk).forEach(function(d, i){
      var future = d > k, isToday = d === k;
      var full = !future && allThree(d), ice = !future && frozen(d);
      var miss = !future && !isToday && !full && !ice && startedBy(d);
      h += "<em class='" + (full ? "on" : ice ? "ice" : miss ? "miss"
        : isToday ? "now" : "soon") + "'></em>";
    });
    h += "</span>";
    h += "<span class='w-fw'>" + num(a.got) + " of " + num(a.target) + " this week</span>";
  }
  /* The multiplier stays, in six characters. It is the only sign on the
     board that the conditions do anything at all, and a build you cannot see
     working is a build you stop believing in. */
  var m = multOn(k);
  h += "<span class='w-fs'>today <b>" + num(scoreOn(k)) + "</b>"
    + (m > 1 ? " \u00d7" + m.toFixed(1) : "") + "</span>";
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

"use strict";

/* ========================================================================
   scene.js - what Today is made of, now that Today is a table.

   This file used to BE the Today screen: a sky card, a week meter, three
   quest rows, a chest, a payout panel. board.js replaced all of it, and
   every one of those renderers has been deleted rather than left lying
   around - two files drawing the same day is how they start disagreeing.

   What stays here is what the board is built out of and what the board
   cannot own: the sun's arc, the day's short labels, and the ceremonies
   that take the screen when something lands - the pillar tap, the day's
   card, the medallion and the level-up.
   ======================================================================== */

/* ------------------------------------------------------------- the sun arc
   Daylight's soul, down from a world to a watch face to a 34px strip at the
   top of the table. Still the real hour, still the real shift band. */
function arcPt(u){
  var x0 = 12, y0 = 58, cx = 62, cy = 2, x1 = 112, y1 = 58, v = 1 - u;
  return [v*v*x0 + 2*v*u*cx + u*u*x1, v*v*y0 + 2*v*u*cy + u*u*y1];
}
function arcSeg(a, b){
  var pts = [], n = Math.max(2, Math.round((b - a) * 40));
  for (var i = 0; i <= n; i++){
    var q = arcPt(a + (b - a) * i / n);
    pts.push(q[0].toFixed(1) + "," + q[1].toFixed(1));
  }
  return pts.join(" ");
}
/* The slim clock has one line for the date, the city and the shift, so both
   halves lose their long forms. "Malta has 09:00 - 16:00" was always a
   slightly odd sentence anyway. */
function shortToday(){
  var d = new Date();
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]
    + " " + d.getDate() + " " + MONTHS_SHORT[d.getMonth()];
}
function shortDial(s){
  if (s.holiday) return "no shift";
  if (s.weekend) return "no shift";
  return "Malta " + s.startT + "\u2013" + s.endT;
}
/* A ticked row said "done" three times over. Family can say who, which is
   the only one of the three where the answer is a person. */
function doneLine(key){
  if (key === "family" && typeof spokeToday === "function"){
    var did = spokeToday();
    if (did.length) return "spoke to " + did.map(function(p){ return p.name; }).join(" and ");
  }
  return "done";
}
function dayName(k){
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    [new Date(k + "T00:00:00").getDay()];
}

/* ------------------------------------------------------------ the week strip
   Seven dots ending on today: a full day burns green, a frozen one is ice,
   a miss is hollow, today is ringed. Consistency you can see at a glance. */
/* A day only counts as missed once he had actually started - days before the
   record begins are not failures, and never have been in this app. */
function startedBy(k){
  return PILLARS.some(function(g){ var f = firstDay(g[0]); return f && k >= f; });
}





/* ==================================================================== TODAY */
var TODAY_MORE = "";




/* The most important interaction in the app. When the third one lands, the
   celebration takes the screen and the pack drops onto the tile the thumb is
   still on - no navigation, no snackbar, and nothing opened on his behalf. */
function tapPillar(key, btn){
  var t = today(), d = day(t), wasFull = allThree(t);
  if (d.p[key]) delete d.p[key]; else d.p[key] = 1;
  save();
  var nowFull = allThree(t);

  if (!wasFull && nowFull){
    var w = packsWaiting();
    buzz([28, 60, 28, 60, 55]);
    sfx("full");
    /* A run crossing a chip threshold outranks the daily fanfare: the
       medallion ceremony takes the screen instead, and is never repeated.
       Except during the tutorial - the first pack is the lesson there, so
       day one's chip is minted quietly and waits in the case. */
    var due = chipDue();
    if (due && !S.onboarded){
      S.chips = S.chips || {};
      S.chips[due[0]] = t;
      save();
      due = null;
    }
    if (due){
      S.chips = S.chips || {};
      S.chips[due[0]] = t;
      save();
      setTimeout(function(){ showChip(due); }, reduced() ? 0 : 420);
    } else {
      celebrate(w.streak ? "Seven in a row" : "All three",
        w.streak ? "A streak pack. Five cards, better odds." : "That is a pack, and " + money(rate()) + " in the pot.");
    }
    /* the day's XP, flying to the crest the way the money flies to the pot */
    if (btn && !reduced()){
      setTimeout(function(){
        fly(btn, "#crest", "+" + (15 + STEADY.day) + " XP", "var(--gold2)");
      }, 200);
    }
    if (btn){
      btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
      burst(btn, "#3FD9A0");
      fly(btn, "#chipPot", "+" + money(rate()), "var(--gold2)");
    }
    setTimeout(function(){ render({ keepScroll: true, animate: true }); }, reduced() ? 0 : 620);
    return;
  }
  if (d.p[key]){ buzz(14); sfx("tick");
    if (btn){
      btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
      burst(btn, PILLARS.filter(function(g){ return g[0] === key; })[0][4]);
    }
  } else { sfx("untick"); }
  render({ keepScroll: true, animate: true });
}

/* ------------------------------------------------------------ the side quest */
function questDone(btn){
  var t = today(), q = questFor(t);
  if (!q || q.done){ sfx("no"); return; }
  S.quests = S.quests || {};
  S.quests[t] = { done: 1, swaps: q.swaps, card: q.card[0] };
  liveCard(q.card[0]);
  save();
  sfx("rare"); buzz([16, 40, 20]);
  if (btn) burst(btn, "#FFC800");
  render({ keepScroll: true, animate: true });
}
/* One swap a day. A quest you can reroll forever is a quest you never do. */
function questSwap(){
  var t = today(), q = questFor(t);
  if (!q || q.done || q.swaps){ sfx("no"); return; }
  S.quests = S.quests || {};
  S.quests[t] = { done: 0, swaps: 1 };
  /* Pin the swapped-to card, or a pack opened later would swap it again. */
  var nq = questFor(t);
  if (nq) S.quests[t].card = nq.card[0];
  save();
  sfx("tap"); buzz(10);
  render({ keepScroll: true, animate: true });
}

/* ================================================================= the chips
   The AA idea: a medallion for the run, handed over once, never taken back.
   Drawn inline so each chip's own metal carries through app and case. */
function medalSVG(chip, extra){
  var t = chip[0], face = chip[2], edge = chip[3], ink = chip[4];
  return "<svg class='medal" + (extra ? " " + extra : "") + "' viewBox='0 0 120 120' aria-hidden='true'>"
    + "<circle cx='60' cy='60' r='56' fill='" + edge + "'/>"
    + "<circle cx='60' cy='60' r='47' fill='" + face + "'/>"
    + "<circle cx='60' cy='60' r='41.5' fill='none' stroke='" + edge
      + "' stroke-width='1.8' stroke-dasharray='2.2 4.4'/>"
    + "<text x='60' y='" + (t > 99 ? 68 : 70) + "' text-anchor='middle' fill='" + ink
      + "' style='font:900 " + (t > 99 ? 34 : 40) + "px Nunito,sans-serif'>" + t + "</text>"
    + "<text x='60' y='88' text-anchor='middle' fill='" + ink
      + "' opacity='.72' style='font:800 10.5px Nunito,sans-serif;letter-spacing:.24em'>"
    + (t === 1 ? "DAY" : "DAYS") + "</text></svg>";
}

/* The ceremony. Bigger than a pack on purpose: this is the sober-chip moment,
   the thing he asked for by name, and it only ever happens live. */
function showChip(chip){
  var el = document.getElementById("chip");
  if (!el) return;
  var i = CHIPS.indexOf(chip);
  var reward = (S.chipRewards || {})[chip[0]];
  var line = reward
    ? "You named the reward. Collect it: " + reward
    : (CHIP_HINT[i]
        ? "Worth a real reward - say, " + CHIP_HINT[i].toLowerCase() + ". Name it in You."
        : "Chips are never taken back. This one is yours for good.");
  el.innerHTML = "<div class='chipw'>"
    + "<div class='chipk'>Chip earned</div>"
    + medalSVG(chip, "big")
    + "<h2>" + esc(chip[1]) + "</h2>"
    + "<p>" + esc(line) + "</p>"
    + "<button class='btn pri' data-chipdone='1'>Keep going</button></div>";
  el.className = "on";
  document.body.style.overflow = "hidden";
  sfx("level"); buzz([30, 60, 30, 60, 90]);
  confetti();
}
/* ------------------------------------------------------------- where he is
   One fold, only when he is not in Singapore: what the day here is, the two
   clocks that matter, and the three things the app cannot answer from his own
   record - what is around him, where exactly he is, and whether this is work
   or a holiday. */
function gapWord(){
  var g = offset() - ukOffset();
  var sign = g >= 0 ? "+" : "\u2212", m = Math.abs(g);
  return sign + Math.floor(m / 60) + "h" + (m % 60 ? String(m % 60) : "");
}
function whatChanges(sit){
  var sh = shape();
  if (sit.kind === "holiday")
    return "Two things make a holiday: move, and call home. There is no Malta shift to finish, "
         + "so Stopped is carried, the way it is on a Saturday. Nothing you have built can break here.";
  if (sit.kind === "family")
    return "Malta runs " + sh.startT + "\u2013" + sh.endT + " on this clock, so the mornings are yours. "
         + "Being in the room is the call. A walk with someone is Trained.";
  if (sit.kind === "hq")
    return "The shift is on your own clock for once: " + sh.startT + "\u2013" + sh.endT + ". "
         + "Train before it, call home after.";
  return "Move and call home are the same anywhere. Stopped is still Malta\u2019s close \u2014 "
       + sh.endT + " on this clock. Any gym counts, and a walk always has.";
}
function whereFoldHTML(sit){
  var sh = shape(), pin = pinToday();
  var inner = facts([
    [sh.noShift ? "\u2014" : sh.startT + "\u2013" + sh.endT, "Malta, here"],
    [gapWord(), "vs Sheffield"],
    ["day " + sit.day, "of the stay"]
  ]);
  inner += "<p class='fine'>" + whatChanges(sit) + "</p>";
  inner += "<div class='btns tight'>"
    + "<button class='btn quiet' data-near='eat'>Around you</button>"
    + (pin ? "<button class='btn quiet' data-pinme='1'>Pinned \u00b7 " + esc(pin.l || "here") + "</button>"
           : "<button class='btn quiet' data-pinme='1'>Pin me here</button>")
    + ((sit.kind === "work" || sit.kind === "holiday")
        ? "<button class='btn quiet' data-flip='1'>Actually a "
          + (sit.kind === "work" ? "holiday" : "work trip") + "</button>" : "")
    /* The clock can be wrong - a phone left on the old zone, a layover, a
       flight home the app has not caught up with. This is the way to say so
       without turning the clock off altogether. */
    + "<button class='btn quiet' data-locate='1'>Use my location</button>"
    + "<button class='btn quiet' data-notthere='1'>Not in " + esc(sit.city) + "</button>"
    + "</div>";
  return fold("where:" + sit.city.toLowerCase().replace(/[^a-z]+/g, ""),
    esc(sit.city) + " \u00b7 " + sit.word, "day " + sit.day, inner, sit.day === 1);
}

/* ------------------------------------------------------------- the level
   Crossing a rank used to be a 0.7-second scale pop on a 44px circle with a
   bare digit in it. His sentence was "I want to feel like I'm levelling up",
   so it takes the screen, in the chip's own grammar, and it names the reason:
   the days, not the cards. */
function crestSVG(level){
  return "<svg class='medal big' viewBox='0 0 120 120' aria-hidden='true'>"
    + "<circle cx='60' cy='60' r='56' fill='#E6A800'/>"
    + "<circle cx='60' cy='60' r='47' fill='#FFF4CC'/>"
    + "<circle cx='60' cy='60' r='41.5' fill='none' stroke='#E6A800' stroke-width='1.8' stroke-dasharray='2.2 4.4'/>"
    + "<text x='60' y='" + (level > 99 ? 68 : 70) + "' text-anchor='middle' fill='#7A5B00'"
    + " style='font:900 " + (level > 99 ? 34 : 40) + "px Nunito,sans-serif'>" + level + "</text>"
    + "<text x='60' y='88' text-anchor='middle' fill='#7A5B00' opacity='.72'"
    + " style='font:800 10.5px Nunito,sans-serif;letter-spacing:.24em'>LEVEL</text></svg>";
}
function showLevel(r){
  var el = document.getElementById("chip");
  if (!el) return;
  /* stamped before it is painted, so no close path can replay it */
  S.levelSeen = r.level; save();
  var dn = daysToNext(r), gw = goodWeeks();
  el.innerHTML = "<div class='chipw'>"
    + "<div class='chipk'>Level up</div>"
    + crestSVG(r.level)
    + "<h2>" + esc(r.name) + "</h2>"
    + "<p>" + num(fullDays()) + (fullDays() === 1 ? " full day" : " full days")
    + (gw ? " and " + gw + (gw === 1 ? " good week" : " good weeks") : "") + " did that."
    + (dn ? " Level " + (r.level + 1) + " in " + dn + (dn === 1 ? " full day." : " full days.") : "")
    + "</p>"
    + "<button class='btn pri' data-chipdone='1'>Keep going</button></div>";
  el.className = "on";
  document.body.style.overflow = "hidden";
  sfx("level"); buzz([30, 60, 30, 60, 90]);
  confetti();
}
function levelBusy(){
  return !!MODAL
    || (typeof ST !== "undefined" && !!ST)
    || (typeof SESSION !== "undefined" && !!SESSION)
    || (typeof COACH !== "undefined" && COACH.on)
    || !!document.getElementById("sheet").className
    || !!document.getElementById("stage").className
    || !!document.getElementById("chip").className
    || !!document.getElementById("fx").className;
}
/* Called at the end of every render, so a level earned from a pack, a card or
   a quest gets its moment once whatever was on top has closed. The first v39
   load stamps the number silently - a ceremony for work done weeks ago is the
   app applauding itself, which is the rule backfillChips already follows. */
function levelSync(){
  if (!S.onboarded || levelSync._on) return;
  var r = levelDue();
  if (!r) return;
  if (!Number(S.levelSeen)){ S.levelSeen = r.level; save(); return; }
  /* Wait for whatever is on top - the all-three confetti, a pack stage, a
     chip - and then take the screen. Ceremonies queue, they do not collide. */
  levelSync._on = 1;
  var tries = 0;
  setTimeout(function wait(){
    var rr = levelDue();
    if (!rr){ levelSync._on = 0; return; }
    if (levelBusy()){
      if (++tries > 40){ levelSync._on = 0; return; }   /* twenty seconds: leave it to the next render */
      setTimeout(wait, 500);
      return;
    }
    levelSync._on = 0;
    showLevel(rr);
  }, 420);
}
function closeChip(){
  var el = document.getElementById("chip");
  if (!el || !el.className) return;
  el.className = ""; el.innerHTML = "";
  document.body.style.overflow = "";
  sfx("tap");
  render({ keepScroll: true, animate: true });
}

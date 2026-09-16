"use strict";

/* ========================================================================
   board.js - Today, rebuilt as a table you play at.

   His words, after six rounds: "Why haven't you changed the layout, design
   or structure? It still looks entirely the same."

   He was right, and it is worth writing down exactly how. Every round from
   v51 to v56 changed what sat INSIDE the same frame - a pale ground, a top
   stat bar, a vertically scrolling column of white rounded cards, a six-tab
   light bar at the bottom. I added an engine in v56 and then rendered it as
   two more white rounded cards in the same column, which is a list of
   numbers about a game rather than a game.

   Balatro and AdVenture Capitalist are not columns of cards you scroll. They
   are BOARDS: one screen, nothing below the fold, everything in a fixed
   place, and the whole surface is the game. You look at the same table every
   time you open it, and you read it in a second because nothing has moved.

   So Today is now a table:

       the hour, one thin line, because Daylight is still a day
     +---------------------------------------------------------+
     |  JOKERS  (slots, always shown)    |   THE BASICS (5)     |
     +-----------------+-----------------------------------+---+
     |  THE WEEK       |          chips  x  mult               |
     |  (the blind:    |              = SCORE                  |
     |   target, days) |                                       |
     +-----------------+---------------------------------------+
     |  what the selected card asks, and the button that       |
     |  does it                                                |
     +---------------------------------------------------------+
     |        [ THE HAND - cards, fanned, tappable ]            |
     +---------------------------------------------------------+

   The hand is the change that matters. The three pillars, the day's card,
   the routines that are live this hour and any waiting pack are no longer
   rows in a list - they are cards you hold, each with its chip value printed
   in the corner, and you pick one up before you play it. That is a different
   interaction, not a different paint job: nothing on this screen is a row,
   nothing scrolls, and the thing you are doing is picking a card.

   Everything here READS the record. Same rule as run.js: the board can score
   a day, never author one.
   ======================================================================== */

var B_PICK = "";        /* which card is in hand, "" = let the day decide */
var B_LAST = -1;        /* last score painted, so a rise can pop */

/* --------------------------------------------------------------- the hand
   What he is holding right now. Order is deliberate and fixed: the three
   that carry the day, then the day's card, then whatever the hour has asked
   for, then the pack. A hand that reorders itself is a hand you have to read
   every time. */
function boardHand(k){
  k = k || today();
  var up = nextUp(), pr = priority({ noPacks: 1 }), out = [];

  /* A month just closed. It used to sit across the top of the table as a
     panel and took a fifth of the board with it - on a card it costs
     nothing, and it is the one card that plays itself to the front. */
  var rec = S.onboarded ? monthRecapDue() : null;
  if (rec) out.push({ id: "recap", kind: "recap", name: monthName(rec.ym).split(" ")[0],
    face2: monthName(rec.ym).split(" ")[0].slice(0, 3),
    pip: "case", col: "#CE82FF", chip: 0, done: 0,
    ask: monthName(rec.ym) + ", filed.",
    say: rec.full + " of " + rec.possible + " full days \u00b7 best run " + rec.best
       + (rec.lesson ? ". " + rec.lesson : ""),
    act: { key: "monthok", val: rec.ym, label: "Noted \u00b7 it keeps" } });

  PILLARS.forEach(function(g){
    var on = pDone(k, g[0]);
    var carry = !on && !required(g[0], k);
    if (carry) return;                       /* no shift to finish is not a card */
    var isUp = g[0] === up && !on;
    out.push({
      id: "p:" + g[0], kind: "pillar", key: g[0],
      name: g[1], pip: g[2], col: g[4], chip: CHIP.pillar,
      done: on, up: isUp,
      ask: isUp ? pr.ask : g[1] + ".",
      say: on ? doneLine(g[0])
         : isUp ? bSecond(pr.ask, pr.sub) || planLine(g[0])
         : (g[0] === "family" && typeof peopleEmpty === "function" && !peopleEmpty())
           ? peopleLine() : g[3],
      cta: isUp && pr.cta ? pr.cta : null
    });
  });

  /* the day's card - a dare, drawn once a day, worth more than a routine */
  var hd = (typeof handDo === "function" && S.onboarded) ? handDo() : [];
  if (hd.length){
    var a = hd[0];
    out.push({ id: "todo", kind: "todo", name: "To do", pip: "pen", col: "#CE82FF",
      face2: "To do",
      chip: 0, done: 0, ask: a[1] + ".", say: a[2],
      act: { key: "doit", val: a[0], label: "Did it" } });
  } else if (S.onboarded && typeof questFor === "function"){
    var q = questFor(k);
    if (q) out.push({ id: "card", kind: "card", name: "The card", pip: "cards",
      face2: "Card",
      col: "#CE82FF", chip: CHIP.card, done: !!q.done,
      face: q.card[2] === "zh" ? (q.card[4] || "词")
        : (CARD_ART[q.card[0]] || SET_ART[q.card[2]] || "⭐"),
      ask: q.card[0] + ".", say: q.done ? "That card is done." : q.text,
      act: q.done ? null : { key: "questdone", val: "1", label: "Did it" },
      alt: q.done || q.swaps ? null : { key: "questswap", val: "1", label: "Swap it" } });
  }

  /* the routines the hour has actually asked for */
  if (S.onboarded && typeof careNow === "function"){
    careNow().forEach(function(r){
      var on = careOn(k, r[0]);
      out.push({ id: "c:" + r[0], kind: "care", name: r[1], pip: "drop",
        face2: { sun: "Sun", skin: "Skin", bed: "Bed" }[r[0]] || r[1],
        col: "#3FD9A0", chip: CHIP.routine, done: on,
        ask: r[1] + ".", say: on ? "Done today. " + careRun(r[0]) + " in a row."
                                : careSay(r[0], k),
        act: { key: "care", val: r[0], label: on ? "Undo" : "Did it" } });
    });
  }

  /* a waiting pack is a card in the hand, because opening it is a move */
  var w = packsWaiting(), packs = w.day + w.streak;
  if (packs) out.push({ id: "pack", kind: "pack", name: packs > 1 ? packs + " packs" : "A pack",
    face2: packs > 1 ? packs + " packs" : "Pack",
    pip: "pack", col: "#FFC800", chip: 0, done: 0,
    ask: packs === 1 ? "A pack, earned." : packs + " packs, earned.",
    say: "Cards, and every so often a joker.",
    act: { key: "open", val: "1", label: packs === 1 ? "Open it" : "Open them" } });

  return out;
}
/* priority() writes the headline and the line under it, and on some days
   they are the same sentence twice - "Stop. Malta finished at 15:00." over
   "Malta finished at 15:00. Shut the laptop." On a card that is the whole
   panel, so the echo is dropped and the pillar's own line stands in. */
function bSecond(ask, sub){
  if (!sub) return "";
  var a = String(ask).toLowerCase().replace(/[^a-z0-9 ]/g, "");
  var b = String(sub).toLowerCase().replace(/[^a-z0-9 ]/g, "");
  var head = a.split(" ").slice(0, 4).join(" ");
  if (head && head.length > 8 && b.indexOf(head) !== -1) return "";
  if (b.length > 8 && a.indexOf(b.split(" ").slice(0, 4).join(" ")) !== -1) return "";
  return sub;
}

/* Which card is face-up. His pick if it still exists, else the one the day
   is pointing at, else the first thing left to do, else nothing. */
function boardPick(hand){
  var i, sel = null;
  for (i = 0; i < hand.length; i++) if (hand[i].id === B_PICK) sel = hand[i];
  if (sel) return sel;
  /* news first, once a month, and never again once he has said so */
  for (i = 0; i < hand.length; i++) if (hand[i].kind === "recap") return hand[i];
  for (i = 0; i < hand.length; i++) if (hand[i].up) return hand[i];
  for (i = 0; i < hand.length; i++) if (!hand[i].done) return hand[i];
  return null;
}

/* ============================================================== the table */
function viewBoard(){
  var k = today();
  TODAY_MORE = "";
  var hand = boardHand(k), sel = boardPick(hand);
  var h = "<div class='b-t'>";

  h += bHourHTML();

  h += "<div class='b-rail'>" + bJokersHTML(k) + bVitalsHTML(k) + "</div>";
  h += "<div class='b-mid'>" + bWeekHTML() + bScoreHTML(k) + "</div>";
  h += bPlayHTML(sel, k);
  /* Felt. On a tall phone there is slack between the card in play and the
     hand, and it has to go somewhere: three fifths of it here, two fifths
     into the panel. Stretching one of them to fill a third of the screen
     reads as a bug rather than as a table. */
  h += "<div class='b-gap'></div>";
  h += bHandHTML(hand, sel);
  h += bFootHTML(k, hand);
  h += TODAY_MORE;
  return h + "</div>";
}

/* ------------------------------------------------------------- the hour
   Daylight's soul, down to one line and a 16px arc. The date, where he is
   standing, and whose hours he is keeping - the three facts the rest of the
   table assumes. The city is still the button that fixes the city. */
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

/* ------------------------------------------------------------ the jokers
   Top left, where Balatro keeps them, and ALWAYS drawn. The old row returned
   an empty string until he owned one, so the single genuinely new mechanic
   was invisible on the only account that matters. Empty slots are the point:
   a shelf with gaps in it is a thing you want to fill. */
function bJokersHTML(k){
  var held = typeof jokersHeld === "function" ? jokersHeld() : [];
  var slots = typeof jokerSlots === "function" ? jokerSlots() : 3;
  var used = typeof jokerSlotsUsed === "function" ? jokerSlotsUsed() : 0;
  var live = typeof jokerLive === "function" ? jokerLive(k) : {};
  var h = "<button class='b-jk' data-jokers='1' aria-label='Your jokers'>";
  held.forEach(function(j, i){
    h += "<span class='b-j" + (live[j[0]] ? " on" : "") + (j[3] > 1 ? " w" : "")
      + "' style='--i:" + i + "'><b>" + esc(j[6] || j[1]) + "</b><i>"
      + (j[5].kind === "times" ? "×" + j[5].n
       : j[5].kind === "add" ? "+" + j[5].n : "+" + j[5].n + "c") + "</i></span>";
  });
  for (var e = used; e < slots; e++) h += "<span class='b-j x'><b>+</b></span>";
  return h + "</button>";
}

/* ------------------------------------------------------------ the basics
   Balatro's consumable slots, and the same idea: small, always there, worth
   a little each, tapped straight from the table without picking anything up.
   Five marks, four chips apiece. */
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
            : v[0] === "train"   ? (on ? "✓" : "–")
            : (on ? "✓" : "–");
    h += "<button class='b-v" + (on ? " on" : "") + "'" + act + ">"
      + "<span class='b-vv'>" + esc(val) + "</span>"
      + "<span class='b-vl'>" + esc(v[1]) + "</span></button>";
  });
  return h + "</div>";
}

/* -------------------------------------------------------------- the week
   Balatro's blind panel: what you are playing against, what it pays, and how
   far in you are. Left of the score, permanently, so the target is never a
   thing you scroll to. */
function bWeekHTML(){
  if (!S.onboarded || typeof anteState !== "function")
    return "<div class='b-wk'><span class='b-wk-k'>Week one</span>"
      + "<b class='b-wk-n'>–</b><span class='b-wk-s'>Starts today</span></div>";
  var a = anteState(), t = today();
  var h = "<div class='b-wk" + (a.beat ? " beat" : "") + "'>";
  h += "<span class='b-wk-k'>Week " + a.n + "</span>";
  h += "<b class='b-wk-n'>" + num(a.target) + "</b>";
  h += "<span class='b-wk-g'>" + num(a.got) + " so far</span>";
  h += "<span class='b-wk-b'><i style='width:" + a.pct + "%'></i></span>";
  var days = weekAll(a.wk);
  h += "<span class='b-wk-d'>";
  days.forEach(function(d, i){
    var future = d > t, isToday = d === t;
    var full = !future && allThree(d), ice = !future && frozen(d);
    var miss = !future && !isToday && !full && !ice && startedBy(d);
    h += "<em class='" + (full ? "on" : ice ? "ice" : miss ? "miss" : isToday ? "now" : "soon")
      + "'>" + "MTWTFSS"[i] + "</em>";
  });
  h += "</span>";
  h += "<span class='b-wk-s'>" + esc(a.beat ? "Beaten." : num(a.need) + " to go") + "</span>";
  return h + "</div>";
}

/* ------------------------------------------------------------- the score
   Two framed numbers and an operator, the way the game that does this best
   does it: chips in blue, mult in red, the product underneath in the biggest
   type on the screen. It moves while he ticks, which is the entire reason to
   tick anything in front of it. */
function bScoreHTML(k){
  if (!S.onboarded) return "<div class='b-sc'><span class='b-sc-k'>Today</span>"
    + "<b class='b-sc-v'>0</b></div>";

  var chips = chipsOn(k), mult = multOn(k), score = scoreOn(k);
  var rose = score > B_LAST && B_LAST >= 0;
  B_LAST = score;
  /* A button, because a number you cannot account for is a number you stop
     believing. The old board printed the working underneath and it cost
     eighty pixels every day to answer a question he asks once a week; now
     the panel opens it. */
  var h = "<button class='b-sc" + (score > 0 ? " live" : "") + (rose ? " up" : "")
    + "' data-work='1'>";
  h += "<span class='b-sc-k'>Score today</span>";
  h += "<b class='b-sc-v'>" + num(score) + "</b>";
  h += "<span class='b-sc-eq'><em class='b-sc-c'>" + num(chips) + "</em>"
    + "<i>×</i><em class='b-sc-m'>" + mult.toFixed(2).replace(/0$/, "") + "</em></span>";
  /* A board reading 0 x 1.0 = 0 looks like an engine that does not work. It
     works; he has not played yet. So say what finishing is worth, which is
     the only number on a fresh morning worth looking at. */
  var ceil = scoreCeiling(k);
  if (ceil > score) h += "<span class='b-sc-p'>" + num(ceil) + " if today lands</span>";
  return h + "</button>";
}

/* -------------------------------------------------------------- the play
   The card in hand, face up: what it asks, and the button that does it.
   One card at a time, because a screen that asks for six things asks for
   nothing. */
function bPlayHTML(sel, k){
  /* Once the three are in, the board owes him a reason to come back. It used
     to be its own strip under the board; here it rides the panel, because
     the panel is the only part of the table that talks in sentences. */
  var fwd = "";
  if (S.onboarded && allThree(k) && typeof tomorrowLine === "function"){
    var tl = tomorrowLine();
    if (tl) fwd = "<span class='b-pl-t'>Tomorrow \u00b7 " + esc(tl) + "</span>";
  }
  if (!sel){
    var pr = priority();
    return "<div class='b-pl won'><b>" + esc(pr.ask) + "</b>"
      + "<span>" + esc(pr.sub || "") + "</span>" + fwd + "</div>";
  }
  var h = "<div class='b-pl" + (sel.done ? " got" : "") + "' style='--pil:" + sel.col + "'>";
  h += "<span class='b-pl-h'>" + (sel.chip ? "<em class='b-pl-c'>+" + sel.chip
        + " chips</em>" : "") + "<span class='b-pl-n'>" + esc(sel.name) + "</span></span>";
  h += "<b>" + esc(sel.ask) + "</b>";
  h += "<span>" + esc(sel.say) + "</span>";
  h += "<span class='b-pl-a'>";
  if (sel.kind === "pillar"){
    var lab = sel.done ? "Undo" : sel.key === "family" ? "Log the call" : "Mark done";
    if (sel.cta && !sel.done)
      h += "<button class='b-go'" + (sel.cta.act ? " data-cta='" + esc(sel.cta.act) + "'"
        : " data-tab='" + esc(sel.cta.tab) + "'") + ">" + esc(sel.cta.label)
        + svg("arrow", 15) + "</button>";
    /* Family's own CTA opens the roster, which IS logging the call - the
       board briefly offered "Log the call" twice, side by side. */
    if (!(sel.cta && !sel.done && sel.cta.label === lab))
      h += "<button class='b-do" + (sel.done ? " undo" : "") + "' data-p='" + esc(sel.key) + "'>"
        + lab + "</button>";
  } else {
    if (sel.act) h += "<button class='b-go' data-" + sel.act.key + "='"
      + esc(sel.act.val) + "'>" + esc(sel.act.label) + "</button>";
    if (sel.alt) h += "<button class='b-do' data-" + sel.alt.key + "='"
      + esc(sel.alt.val) + "'>" + esc(sel.alt.label) + "</button>";
  }
  h += "</span>";
  return h + fwd + "</div>";
}

/* --------------------------------------------------------------- the hand
   Cards. Actual ones - corner value, a pip, a name, fanned from the centre
   and lifted when picked. This is the part that makes the screen a table
   instead of a list, so it gets the bottom third and the thumb's reach. */
function bHandHTML(hand, sel){
  var n = hand.length, mid = (n - 1) / 2;
  var h = "<div class='b-hd' data-n='" + n + "'>";
  hand.forEach(function(c, i){
    var picked = sel && c.id === sel.id;
    h += "<button class='b-c" + (c.done ? " got" : "") + (picked ? " up" : "")
      + (c.up && !c.done ? " nxt" : "") + "' data-pick='" + esc(c.id) + "'"
      + " style='--pil:" + c.col + "; --i:" + i + "; --d:" + (i - mid).toFixed(2) + "'>"
      + (c.chip ? "<span class='b-c-v'>" + c.chip + "</span>" : "")
      + "<span class='b-c-p'>" + (c.face ? esc(c.face) : svg(c.pip, 26)) + "</span>"
      + "<span class='b-c-n'>" + esc(c.face2 || c.name) + "</span>"
      + (c.done ? "<span class='b-c-t'>" + svg("tick", 15) + "</span>" : "")
      + "</button>";
  });
  return h + "</div>";
}

/* Playing the card that is already in his hand. The board's contract is
   pick-then-play, but the card the day is pointing at is picked for him, so
   the commonest action on the screen - tick the thing it just asked for -
   must not cost two taps and a decision. A second tap on a card already
   lifted runs whatever its panel's first button does. */
function boardPlay(){
  var btn = document.querySelector("#screen .b-pl .b-go, #screen .b-pl .b-do");
  if (btn) btn.click();
  return !!btn;
}

/* --------------------------------------------------------------- the foot
   One line of run info, the way a card game keeps hands and discards in the
   corner: how much of today is still unplayed, and the day's dispatch when
   there is one worth reading. */
function bFootHTML(k, hand){
  var left = hand.filter(function(c){ return !c.done; }).length;
  var h = "<div class='b-ft'>";
  h += "<span>" + (left ? left + (left === 1 ? " card left" : " cards left")
    : "Hand played") + "</span>";
  /* What the day noticed. It is the one line on the board written in
     sentences rather than numbers, so it keeps its place at the bottom
     whatever the score is doing - the chips still on the table are the score
     panel's job, and were briefly said twice. */
  var dsp = S.onboarded && typeof dispatchFor === "function" ? dispatchFor(k) : "";
  if (dsp) h += "<span class='b-ft-s'>\u00b7</span>"
    + "<span class='b-ft-d'>" + esc(dsp) + "</span>";
  return h + "</div>";
}

/* --------------------------------------------------------- the working
   Every chip that scored and every multiplier that applied, itemised. The
   engine is only worth having if he can audit it, and the fastest way to
   stop believing a number is to be unable to account for it. */
function workingHTML(k){
  k = k || today();
  var lines = chipLines(k);
  var mlines = multLines(k);
  var h = "<div class='b-wl'>";
  if (!lines.length) h += "<span class='b-wr'><em>Nothing yet today</em><b>0</b></span>";
  lines.forEach(function(x){
    h += "<span class='b-wr" + (x.joker ? " j" : "") + "'><em>" + esc(x.label)
      + "</em><b>+" + x.n + "</b></span>";
  });
  h += "<span class='b-wr tot'><em>Chips</em><b>" + num(chipsOn(k)) + "</b></span>";
  mlines.forEach(function(x){
    h += "<span class='b-wr m" + (x.joker ? " j" : "") + "'><em>" + esc(x.label)
      + "</em><b>" + (x.kind === "times" ? "\u00d7" + x.n : "+" + x.n) + "</b></span>";
  });
  h += "<span class='b-wr tot'><em>Mult</em><b>"
    + multOn(k).toFixed(2).replace(/0$/, "") + "</b></span>";
  h += "<span class='b-wr sum'><em>Score today</em><b>" + num(scoreOn(k)) + "</b></span>";
  return h + "</div>";
}
function askWorking(){
  return ask({
    title: "The working",
    say: "Chips are what you did. The multiplier is what the record has earned.",
    html: workingHTML(today()),
    cancel: "Done"
  });
}

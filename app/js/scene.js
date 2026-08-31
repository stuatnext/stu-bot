"use strict";

/* ========================================================================
   scene.js - Today, as a consistency-training screen.

   His own brief, in his own words: "like a training app - a consistency
   training app - probably a little like Duolingo," keeping the unlockables
   and the pot. So Today is the daily session: the hour on one living sky
   card, the week you are standing in, the three things as big pressable
   quest rows, and the chest that fills as they land. One viewport.
   ======================================================================== */

/* ------------------------------------------------------------ the sky card
   Daylight's soul, demoted from world to watch face: the hour's own
   gradient, a mini arc with the sun or moon at now, and the shift line. */
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
function skyCardHTML(){
  var s = shape(), ph = skyPhase();
  var night = ph === "night" || ph === "deepnight" || ph === "dusk";
  var h = "<div class='skycard'>";
  h += "<svg viewBox='0 0 124 64' aria-hidden='true'>";
  h += "<polyline class='arc' points='" + arcSeg(0, 1) + "'/>";
  if (!s.weekend && s.end > s.start){
    h += "<polyline class='band' points='"
      + arcSeg(s.start / 1440, Math.min(s.end, 1439) / 1440) + "'/>";
  }
  var now = arcPt(s.now / 1440);
  h += "<circle class='orb" + (night ? " moon" : "") + "' cx='" + now[0].toFixed(1)
    + "' cy='" + now[1].toFixed(1) + "' r='6'/>";
  if (!night){
    for (var k = 0; k < 8; k++){
      var ra = k * Math.PI / 4;
      h += "<line class='ray' x1='" + (now[0] + Math.cos(ra) * 8.4).toFixed(1)
        + "' y1='" + (now[1] + Math.sin(ra) * 8.4).toFixed(1)
        + "' x2='" + (now[0] + Math.cos(ra) * 11.4).toFixed(1)
        + "' y2='" + (now[1] + Math.sin(ra) * 11.4).toFixed(1) + "'/>";
    }
  } else {
    h += "<circle class='cut' cx='" + (now[0] + 3.4).toFixed(1) + "' cy='"
      + (now[1] - 2.4).toFixed(1) + "' r='5.2'/>";
  }
  h += "</svg>";
  h += "<div class='skybd'><b>" + esc(niceToday()) + "</b>"
    + "<span>" + esc(dialLabel(s)) + "</span></div></div>";
  return h;
}
function dialLabel(s){
  if (s.weekend) return "No shift today";
  if (s.working) return "Malta until " + s.endT;
  if (s.now < s.start) return "Malta has " + s.startT + " \u2013 " + s.endT;
  return "Done at " + s.endT;
}
function niceToday(){
  var d = new Date();
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]
    + " " + d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
}
function dayName(k){
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    [new Date(k + "T00:00:00").getDay()];
}

/* ------------------------------------------------------------ the week strip
   Seven dots ending on today: a full day burns green, a frozen one is ice,
   a miss is hollow, today is ringed. Consistency you can see at a glance. */
function weekHTML(){
  var h = "<div class='week'>", d = new Date();
  d.setDate(d.getDate() - 6);
  for (var i = 0; i < 7; i++){
    var k = iso(d), isToday = k === today();
    var full = allThree(k), ice = frozen(k);
    var cls = full ? "on" : ice ? "ice" : "";
    var started = PILLARS.some(function(g){ var f = firstDay(g[0]); return f && k >= f; });
    h += "<span class='wd " + cls + (isToday ? " now" : "") + (started ? "" : " off") + "'>"
      + "<i>" + (full ? svg("tick", 13) : ice ? svg("snow", 12) : "") + "</i>"
      + "<b>" + "SMTWTFS"[d.getDay()] + "</b></span>";
    d.setDate(d.getDate() + 1);
  }
  return h + "</div>";
}

/* ---------------------------------------------------------------- the chest */
function gemHTML(done, packs){
  var h = "<span class='gcore'>" + svg("pack", 30)
    + (packs > 1 ? "<b class='gn'>" + packs + "</b>" : "") + "</span>";
  h += "<span class='gbd'><b>" + (packs
      ? (packs === 1 ? "A pack is ready" : packs + " packs are ready")
      : "Today\u2019s pack") + "</b>"
    + "<span class='dcount'>" + (packs ? "Tap to open" : done + "<i>/3</i> to earn it") + "</span></span>";
  if (!packs){
    h += "<span class='gbar'><i style='width:" + Math.round(done / 3 * 100) + "%'></i></span>";
  }
  return h;
}

/* ==================================================================== TODAY */
function viewToday(){
  var t = today(), d = day(t);
  var w = packsWaiting(), packs = w.day + w.streak;
  var done = PILLARS.filter(function(g){ return pDone(t, g[0]); }).length;
  var h = "";

  /* one line, his */
  var owed = PILLARS.filter(function(g){ return required(g[0], t) && !pDone(t, g[0]); }).length;
  var ask, sub;
  if (packs){
    ask = packs === 1 ? "That is a pack." : packs + " packs waiting.";
    sub = "Earned, not given. Open it below.";
  } else if (allThree(t)){
    ask = "Today is in."; sub = "The streak holds. Back tomorrow.";
  } else if (!done){
    if (owed === 3){ ask = "Three things make a day."; sub = "Tick what you have done."; }
    else { ask = "Two things make a " + dayName(t) + "."; sub = "No shift to stop today."; }
  } else {
    ask = owed === 1 ? "One more." : owed + " to go.";
    sub = "All of them earns the pack.";
  }
  h += "<div class='hello'><p class='ask'>" + esc(ask) + "</p>"
    + "<p class='asksub'>" + esc(sub) + "</p></div>";

  h += skyCardHTML();
  h += weekHTML();

  /* the session: three big pressable rows. The hour points at one of them -
     that row wears the arrow and speaks, so "what now?" never needs asking. */
  var up = nextUp();
  h += "<div class='quests'>";
  PILLARS.forEach(function(g){
    var on = pDone(t, g[0]), st = streak(g[0]), carried = !on && !required(g[0], t);
    var isUp = g[0] === up && !on && !carried;
    h += "<button class='pil q" + g[0] + (on ? " on" : "") + (carried ? " carried" : "")
      + (isUp ? " up" : "")
      + "' data-p='" + g[0] + "' style='--pil:" + g[4] + "' aria-pressed='" + (on ? "true" : "false") + "'>"
      + "<span class='qic'>" + svg(g[2], 24) + "</span>"
      + "<span class='qbd'><b>" + esc(g[1])
      + (isUp ? "<i class='now'>Now</i>" : "") + "</b><span>"
      + esc(carried ? "No shift today \u2014 carried" : isUp ? tipFor(g[0]) : g[5]) + "</span></span>"
      + (st > 0 && !carried ? "<span class='qst'>" + svg("flame" in ICONS ? "flame" : "tick", 12) + st + "</span>" : "")
      + "<span class='qchk'>" + (on ? svg("tick", 20) : "") + "</span>"
      + "</button>";
  });
  h += "</div>";

  /* the chest */
  h += "<" + (packs ? "button" : "div") + " class='gem" + (packs ? " won" : "") + "'"
    + (packs ? " data-open='1'" : "") + ">" + gemHTML(done, packs)
    + "</" + (packs ? "button" : "div") + ">";

  /* the side quest: one held card asks something of him. This is what makes
     the collection a deck instead of wallpaper - his call, his words. */
  if (S.onboarded){
    var q = questFor(t);
    if (q){
      var qa = q.card[2] === "zh" ? (q.card[4] || "\u8bcd")
        : (CARD_ART[q.card[0]] || SET_ART[q.card[2]] || "\u2b50");
      h += "<div class='quest" + (q.done ? " qdone" : "") + "'>"
        + "<span class='qgl" + (q.card[2] === "zh" ? " zh" : "") + "'>" + esc(qa) + "</span>"
        + "<span class='qtx'><b>" + (q.done ? "Side quest \u00b7 lived" : "Side quest \u00b7 " + esc(q.card[0])) + "</b>"
        + "<span>" + esc(q.done
            ? "+10 spares, +20 XP \u00b7 " + q.card[0] + " is a lived card now."
            : q.text) + "</span></span>"
        + (q.done
            ? "<span class='qwin'>" + svg("tick", 18) + "</span>"
            : "<span class='qact'><button class='qgo' data-questdone='1'>Did it</button>"
              + (q.swaps ? "" : "<button class='qswap' data-questswap='1'>Swap</button>")
              + "</span>")
        + "</div>";
    }
  }
  return h;
}

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
  S.quests[t] = { done: 1, swaps: q.swaps };
  S.lived = S.lived || {};
  if (!S.lived[q.card[0]]) S.lived[q.card[0]] = t;
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
function closeChip(){
  var el = document.getElementById("chip");
  if (!el || !el.className) return;
  el.className = ""; el.innerHTML = "";
  document.body.style.overflow = "";
  sfx("tap");
  render({ keepScroll: true, animate: true });
}

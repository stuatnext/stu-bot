"use strict";

/* ========================================================================
   scene.js - the play screen.

   One viewport, nothing below the fold. The sky arc says where the day is,
   the gem says what it pays, the three buttons say - on themselves - what
   makes it count. Tapping the third is the whole ceremony: burst, flash,
   coin to the pot, and the gem igniting under his thumb.
   ======================================================================== */

/* ================================================================ the chest
   The day's prize, waiting at the end of the trail. Grey and shut until the
   three stops are cleared; gold and wiggling when there is a pack in it. */
function gemHTML(done, packs){
  var h = "<span class='gcore'>" + svg("pack", 38)
    + (packs > 1 ? "<b class='gn'>" + packs + "</b>" : "") + "</span>";
  h += "<span class='dcount'>" + (packs
    ? (packs === 1 ? "a pack. tap it" : packs + " packs. tap it")
    : done + "<i>/3</i> for a pack") + "</span>";
  return h;
}


/* ================================================================== TODAY
   The saga-map layout, because that IS the mobile-game grammar: a dotted
   trail winds up the screen through the three things as zigzag stops, from
   where he starts at the bottom to the chest at the top by the city. A
   walker stands at the next undone stop; the ask is a speech bubble beside
   him, not a headline floating in a column. UI lives in the corners. */

/* stop positions as percentages of the trail, bottom to top, and the chest */
var TRAIL = [[24, 80], [68, 57], [24, 36]];
var TRAIL_CHEST = [70, 13];

function trailPath(){
  /* one smooth curve through the stops, drawn in the trail's own viewBox */
  var P = [[38, 100]].concat(TRAIL).concat([TRAIL_CHEST]);
  var d = "M" + P[0][0] + " " + P[0][1];
  for (var i = 1; i < P.length; i++){
    var a = P[i - 1], b = P[i];
    var mx = (a[0] + b[0]) / 2;
    d += " C" + mx + " " + a[1] + " " + mx + " " + b[1] + " " + b[0] + " " + b[1];
  }
  return d;
}

function viewToday(){
  var t = today(), d = day(t);
  var w = packsWaiting(), packs = w.day + w.streak;
  var done = PILLARS.filter(function(g){ return pDone(t, g[0]); }).length;
  var h = "";

  h += "<div class='sky'>" + skyHTML() + "</div>";

  h += "<div class='trail'>";
  h += "<svg class='tpath' viewBox='0 0 100 100' preserveAspectRatio='none' aria-hidden='true'>"
    + "<path d='" + trailPath() + "' vector-effect='non-scaling-stroke'/></svg>";

  /* the chest at the top */
  h += "<" + (packs ? "button" : "div") + " class='gem" + (packs ? " won" : "") + "'"
    + " style='left:" + TRAIL_CHEST[0] + "%;top:" + TRAIL_CHEST[1] + "%'"
    + (packs ? " data-open='1'" : "") + ">"
    + gemHTML(done, packs) + "</" + (packs ? "button" : "div") + ">";

  /* the three stops, and where the walker stands */
  var walkerAt = null;
  PILLARS.forEach(function(g, i){
    var on = pDone(t, g[0]), st = streak(g[0]), carried = !on && !required(g[0], t);
    if (walkerAt === null && !on && !carried) walkerAt = i;
    h += "<button class='pil node" + (on ? " on" : "") + (carried ? " carried" : "")
      + "' data-p='" + g[0] + "' style='--pil:" + g[4]
      + ";left:" + TRAIL[i][0] + "%;top:" + TRAIL[i][1] + "%'"
      + " aria-pressed='" + (on ? "true" : "false") + "'>"
      + "<span class='disc'>" + svg(on ? "tick" : g[2], 26) + "</span>"
      + "<span class='nlb'><b>" + esc(g[1]) + "</b><span>"
      + esc(carried ? "no shift today" : on && st > 0 ? st + (st === 1 ? " day" : " days") : g[5])
      + "</span></span></button>";
  });

  /* the walker: at the next thing to do, or at the chest when the day is in */
  var wx, wy;
  if (walkerAt === null){ wx = TRAIL_CHEST[0]; wy = TRAIL_CHEST[1]; }
  else { wx = TRAIL[walkerAt][0]; wy = TRAIL[walkerAt][1]; }
  h += "<span class='walker' style='left:" + wx + "%;top:" + wy + "%'>"
    + "<svg viewBox='0 0 20 20' aria-hidden='true'><path d='M10 17 3.5 7.5a7.8 7.8 0 1 1 13 0Z'"
    + " fill='var(--ember)' stroke='var(--outline)' stroke-width='2.4' stroke-linejoin='round'/>"
    + "<circle cx='10' cy='8.4' r='2.6' fill='#FFF6EA'/></svg></span>";

  /* one line, in a bubble beside where he stands */
  var owed = PILLARS.filter(function(g){ return required(g[0], t) && !pDone(t, g[0]); }).length;
  var ask, sub;
  if (packs){
    ask = packs === 1 ? "That is a pack." : packs + " packs.";
    sub = "Tap the chest.";
  } else if (allThree(t)){
    ask = "Today is in."; sub = "Back tomorrow.";
  } else if (!done){
    if (owed === 3){ ask = "Three stops today."; sub = "Tap what you have done."; }
    else { ask = "Two stops on a " + dayName(t) + "."; sub = "No shift to stop today."; }
  } else {
    ask = owed === 1 ? "One more." : owed + " to go.";
    sub = "All of them earns a pack.";
  }
  /* When there are packs, the chest's own tag already says so - a bubble
     repeating it is noise. Otherwise the bubble sits beside the walker. */
  if (!packs){
    /* centred above the pin, clamped to the screen, tail aimed back at it */
    var bx = Math.min(64, Math.max(36, wx));
    var tail = ((wx - bx) * 3.9).toFixed(0);
    h += "<div class='bubble' style='left:" + bx + "%;top:" + wy + "%;--tailx:" + tail + "px'>"
      + "<p class='ask'>" + esc(ask) + "</p><p class='asksub'>" + esc(sub) + "</p></div>";
  } else {
    /* the harnesses still read the line, and screen readers should too */
    h += "<div class='bubble sr'><p class='ask'>" + esc(ask)
      + "</p><p class='asksub'>" + esc(sub) + "</p></div>";
  }

  h += "</div>";
  return h;
}

function dayName(k){
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    [new Date(k + "T00:00:00").getDay()];
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
    celebrate(w.streak ? "Seven in a row" : "All three",
      w.streak ? "A streak pack. Five cards, better odds." : "That is a pack, and " + money(rate()) + " in the pot.");
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

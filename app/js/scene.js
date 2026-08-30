"use strict";

/* ========================================================================
   scene.js - the play screen.

   One viewport, nothing below the fold. The sky arc says where the day is,
   the gem says what it pays, the three buttons say - on themselves - what
   makes it count. Tapping the third is the whole ceremony: burst, flash,
   coin to the pot, and the gem igniting under his thumb.
   ======================================================================== */

/* ============================================================== the places
   The three things stop being labelled circles and become places in the
   world: a gym kiosk, a phone booth, an office door. Same buttons, same
   data-p, same coach targets - different nouns on the screen. */
function propSVG(key){
  var O = "#33285A";
  if (key === "train") return ""
    + "<svg viewBox='0 0 92 96' aria-hidden='true'>"
    + "<rect x='14' y='34' width='64' height='50' rx='7' fill='#FFF9EC' stroke='" + O + "' stroke-width='3.5'/>"
    + "<path d='M10 24h72l-5 16h-62Z' fill='#5AC8F5' stroke='" + O + "' stroke-width='3.5' stroke-linejoin='round'/>"
    + "<path d='M24.5 24.8 21 40M38 24.8 36 40M52 24.8 54 40M66.5 24.8 70 40' stroke='" + O + "' stroke-width='2' opacity='.35'/>"
    + "<rect x='24' y='52' width='26' height='32' rx='4' fill='#5AC8F5' stroke='" + O + "' stroke-width='3'/>"
    + "<g stroke='" + O + "' stroke-width='3.4' stroke-linecap='round'>"
    + "<path d='M58 64h14'/><path d='M58 58v12M72 58v12'/></g>"
    + "</svg>";
  if (key === "family") return ""
    + "<svg viewBox='0 0 92 96' aria-hidden='true'>"
    + "<rect x='24' y='16' width='44' height='70' rx='7' fill='#FF8FA3' stroke='" + O + "' stroke-width='3.5'/>"
    + "<rect x='19' y='8' width='54' height='14' rx='6' fill='#E8617E' stroke='" + O + "' stroke-width='3.5'/>"
    + "<rect x='31' y='28' width='30' height='34' rx='4' fill='#FFF3F0' stroke='" + O + "' stroke-width='3'/>"
    + "<path d='M31 45h30M46 28v34' stroke='" + O + "' stroke-width='2' opacity='.4'/>"
    + "<path d='M39 74c2.6-3.4 11.4-3.4 14 0' fill='none' stroke='" + O + "' stroke-width='3.6' stroke-linecap='round'/>"
    + "<circle cx='38' cy='74' r='2.6' fill='" + O + "'/><circle cx='54' cy='74' r='2.6' fill='" + O + "'/>"
    + "</svg>";
  return ""
    + "<svg viewBox='0 0 92 96' aria-hidden='true'>"
    + "<rect x='16' y='14' width='60' height='72' rx='7' fill='#F2B735' stroke='" + O + "' stroke-width='3.5'/>"
    + "<rect x='16' y='14' width='60' height='14' rx='7' fill='#D89412' stroke='" + O + "' stroke-width='3.5'/>"
    + "<rect x='36' y='44' width='22' height='42' rx='4' fill='#8C6ED9' stroke='" + O + "' stroke-width='3'/>"
    + "<circle cx='53' cy='66' r='2.4' fill='#FFF9EC'/>"
    + "<rect class='win' x='22' y='33' width='12' height='12' rx='3' fill='#FFE9A8' stroke='" + O + "' stroke-width='2.6'/>"
    + "<rect class='win' x='58' y='33' width='12' height='12' rx='3' fill='#FFE9A8' stroke='" + O + "' stroke-width='2.6'/>"
    + "</svg>";
}

/* ============================================================== the buddy
   Someone has to live here. A small round fellow in a coral tee and a sun
   cap: he breathes while he waits, hops along the path when a place is
   tapped, and cheers when the day lands. The speech bubble is his. */
function buddySVG(){
  var O = "#33285A";
  return "<svg viewBox='0 0 60 78' aria-hidden='true'>"
    + "<g stroke='" + O + "' stroke-width='5' stroke-linecap='round'>"
    + "<path class='b-legL' d='M24 62v9'/><path class='b-legR' d='M36 62v9'/></g>"
    + "<rect x='17' y='38' width='26' height='27' rx='9' fill='#FF6B5E' stroke='" + O + "' stroke-width='3.4'/>"
    + "<path class='b-armL' d='M17 46c-5 2-7 6-7 10' fill='none' stroke='" + O + "' stroke-width='4.6' stroke-linecap='round'/>"
    + "<path class='b-armR' d='M43 46c5 2 7 6 7 10' fill='none' stroke='" + O + "' stroke-width='4.6' stroke-linecap='round'/>"
    + "<circle cx='30' cy='22' r='16' fill='#FFD9B0' stroke='" + O + "' stroke-width='3.4'/>"
    + "<path d='M14.5 19a16 16 0 0 1 31 0c-4-5-9.5-7.5-15.5-7.5S18.5 14 14.5 19Z' fill='#FFC93C' stroke='" + O + "' stroke-width='3'/>"
    + "<rect x='26' y='8.6' width='16' height='5.4' rx='2.7' fill='#FFC93C' stroke='" + O + "' stroke-width='2.6'/>"
    + "<circle cx='24.5' cy='23' r='2' fill='" + O + "'/><circle cx='35.5' cy='23' r='2' fill='" + O + "'/>"
    + "<path d='M25.5 29.5q4.5 3.6 9 0' fill='none' stroke='" + O + "' stroke-width='2.4' stroke-linecap='round'/>"
    + "</svg>";
}

/* the ground the path runs through, and a cloud for the sky */
function groundSVG(){
  return "<svg class='ground' viewBox='0 0 390 520' preserveAspectRatio='none' aria-hidden='true'>"
    + "<path class='g2' d='M0 205 Q90 178 195 200 T390 192 V520 H0 Z'/>"
    + "<path class='g1' d='M0 322 Q120 292 230 318 T390 306 V520 H0 Z'/>"
    + "<path class='g0' d='M0 442 Q100 412 210 438 T390 424 V520 H0 Z'/>"
    + "</svg>";
}
function cloudSVG(){
  return "<svg viewBox='0 0 96 44' aria-hidden='true'>"
    + "<path d='M20 36a12 12 0 0 1 3-23.5A16 16 0 0 1 53 8.6 13 13 0 0 1 76 14a11.5 11.5 0 0 1 1 22Z'"
    + " fill='#FFF9EC' stroke='#33285A' stroke-width='3' stroke-linejoin='round' opacity='.95'/></svg>";
}

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

  h += "<div class='sky'>" + skyHTML()
    + "<span class='cloud c1'>" + cloudSVG() + "</span>"
    + "<span class='cloud c2'>" + cloudSVG() + "</span></div>";

  h += "<div class='trail'>";
  h += groundSVG();
  h += "<svg class='tpath' viewBox='0 0 100 100' preserveAspectRatio='none' aria-hidden='true'>"
    + "<path d='" + trailPath() + "' vector-effect='non-scaling-stroke'/></svg>";

  /* the chest at the top */
  h += "<" + (packs ? "button" : "div") + " class='gem" + (packs ? " won" : "") + "'"
    + " style='left:" + TRAIL_CHEST[0] + "%;top:" + TRAIL_CHEST[1] + "%'"
    + (packs ? " data-open='1'" : "") + ">"
    + gemHTML(done, packs) + "</" + (packs ? "button" : "div") + ">";

  /* the three places, and where the buddy stands */
  var walkerAt = null;
  PILLARS.forEach(function(g, i){
    var on = pDone(t, g[0]), st = streak(g[0]), carried = !on && !required(g[0], t);
    if (walkerAt === null && !on && !carried) walkerAt = i;
    h += "<button class='pil node" + (on ? " on" : "") + (carried ? " carried" : "")
      + "' data-p='" + g[0] + "' style='--pil:" + g[4]
      + ";left:" + TRAIL[i][0] + "%;top:" + TRAIL[i][1] + "%'"
      + " aria-pressed='" + (on ? "true" : "false") + "'>"
      + "<span class='prop'>" + propSVG(g[0])
      + (on ? "<i class='tickb'>" + svg("tick", 15) + "</i>" : "") + "</span>"
      + "<span class='nlb'><b>" + esc(g[1]) + "</b><span>"
      + esc(carried ? "no shift today" : on && st > 0 ? st + (st === 1 ? " day" : " days") : g[5])
      + "</span></span></button>";
  });

  /* the buddy: at the next place to visit, or by the chest when the day is in */
  var wx, wy;
  if (walkerAt === null){ wx = TRAIL_CHEST[0] - 14; wy = TRAIL_CHEST[1] + 4; }
  else { wx = TRAIL[walkerAt][0] + 16; wy = TRAIL[walkerAt][1] + 1; }
  h += "<span class='buddy" + (walkerAt === null ? " cheer" : "") + "' style='left:" + wx
    + "%;top:" + wy + "%'>" + buddySVG() + "</span>";

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
  /* remember where the buddy is standing, so he can be seen to walk */
  var was = document.querySelector("#screen .buddy");
  var wasAt = was ? was.getBoundingClientRect() : null;
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
    setTimeout(function(){
      render({ keepScroll: true, animate: true });
      buddyWalk(wasAt);
    }, reduced() ? 0 : 620);
    return;
  }
  if (d.p[key]){ buzz(14); sfx("tick");
    if (btn){
      btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
      burst(btn, PILLARS.filter(function(g){ return g[0] === key; })[0][4]);
    }
  } else { sfx("untick"); }
  render({ keepScroll: true, animate: true });
  buddyWalk(wasAt);
}


/* After a re-render the buddy simply appears at his new place; this slides
   him there from where he was instead, with a hop. Pure presentation - the
   state was already saved before the frame moved. */
function buddyWalk(fromRect){
  if (reduced() || !fromRect) return;
  var el = document.querySelector("#screen .buddy");
  if (!el || !el.animate) return;
  var now = el.getBoundingClientRect();
  var dx = fromRect.left - now.left, dy = fromRect.top - now.top;
  if (!dx && !dy) return;
  el.animate(
    [{ transform: "translate(calc(-50% + " + dx.toFixed(0) + "px), calc(-96% + " + dy.toFixed(0) + "px))" },
     { transform: "translate(-50%, -96%)" }],
    { duration: 560, easing: "cubic-bezier(.3,.9,.4,1)" });
  el.classList.add("hop");
  setTimeout(function(){ el.classList.remove("hop"); }, 600);
}

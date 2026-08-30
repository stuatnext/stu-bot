"use strict";

/* ========================================================================
   coach.js - the three-tap tutorial.

   A coach mark, not a reduced board: the screen dims, one control is cut
   out of the dark, one sentence sits beside it. Two modes off the same
   steps - a first run waits for each thing to actually be done; a replay
   from You is a tour that advances on a tap and ticks nothing on the
   player's behalf.
   ======================================================================== */

/* ==================================================================== the coach
   The previous pass called a stripped-down board a tutorial. It was not one -
   it removed clutter but never told anyone what to do. This points at the
   thing, says one sentence, and will not advance until it has been pressed.

   Steps are declared by what they are waiting for, so the tutorial cannot get
   out of step with the app: each one re-reads the real state to decide whether
   it is still needed. */
var COACH_STEPS = [
  { at: [".pil", ".trail"],
    head: "Start here.",
    say: "Tap one of these if you have done it today. Moved on purpose, spoke to someone at "
       + "home, or finished when the shift finished.",
    tap: "Tap one", tourTap: "Next",
    want: function(){ return PILLARS.some(function(g){ return pDone(today(), g[0]); }); } },

  { at: [".pil:not(.on)", ".trail"],
    head: "Now the rest.",
    say: "Three of them is a full day. A full day is a pack of cards, and money in the pot.",
    tap: "Keep going", tourTap: "Next",
    want: function(){ return allThree(today()); } },

  { at: [".gem", ".trail"],
    head: "That is a pack.",
    say: "Earned, not given. Tap it and turn the cards over yourself.",
    tourHead: "The sky is the clock.",
    tourSay: "The arc above is your whole day - midnight to midnight, noon at the top - with "
           + "Malta's shift as the bright band and the sun riding it at now. Tick the three "
           + "and this becomes a pack.",
    tap: "Open it", tourTap: "Got it",
    want: function(){ return !packsTotal(); } }
];
var COACH = { i: -1, on: false, tour: false };

function coachEl(){ return document.getElementById("coach"); }
function sheetOpen(){ return !!document.getElementById("sheet").className; }
function coachStop(){
  COACH.on = false; COACH.tour = false; COACH.i = -1; COACH.target = null;
  var el = coachEl(); el.className = ""; el.innerHTML = "";
}
function coachSkip(){
  var tour = COACH.tour;
  coachStop();
  if (tour) return;
  S.onboarded = 1; save();
  render({ animate: true });
  toast("Skipped. It is under You if you want it back.");
}
function coachEnd(){
  var tour = COACH.tour;
  coachStop();
  if (tour) toast("That is the whole thing. Three taps a day.", true);
}
/* The first step whose selector actually matches. A replay runs on a board
   where the pillars are already ticked, so ".pil:not(.on)" hits nothing and
   the tour would have stopped dead on step two. */
function coachPick(step){
  for (var i = 0; i < step.at.length; i++){
    var e = document.querySelector(step.at[i]);
    if (e) return e;
  }
  return null;
}
/* Two modes, one set of steps. First run waits for the thing to actually be
   done before it moves on. A replay from More is a tour: every step is shown
   in order, a tap advances it, and nothing is ticked on his behalf. */
function coachNext(){
  if (!COACH.on) return;
  if (COACH.tour){
    COACH.i++;
    if (COACH.i >= COACH_STEPS.length){ coachEnd(); return; }
    return coachPaint();
  }
  for (var i = 0; i < COACH_STEPS.length; i++){
    if (!COACH_STEPS[i].want()){ COACH.i = i; return coachPaint(); }
  }
  coachStop();                       /* everything taught */
}
function coachPaint(){
  var step = COACH_STEPS[COACH.i], el = coachEl();
  var target = coachPick(step);
  if (!target){ coachStop(); return; }
  var r = target.getBoundingClientRect();
  var pad = 8, H = window.innerHeight;
  var top = Math.max(6, r.top - pad), left = Math.max(6, r.left - pad);
  var w = Math.min(window.innerWidth - 12, r.width + pad * 2);
  var h = r.height + pad * 2;

  /* the copy goes on whichever side has the room */
  var below = (H - (top + h)) > 240;
  var pos = below ? "top:" + (top + h + 18).toFixed(0) + "px"
                  : "bottom:" + (H - top + 18).toFixed(0) + "px";
  var head = (COACH.tour && step.tourHead) || step.head;
  var say  = (COACH.tour && step.tourSay)  || step.say;
  var cue  = (COACH.tour && step.tourTap)  || step.tap;

  el.innerHTML =
      "<div class='catch'></div>"
    + "<div class='spot' style='top:" + top.toFixed(0) + "px;left:" + left.toFixed(0)
    +   "px;width:" + w.toFixed(0) + "px;height:" + h.toFixed(0) + "px'></div>"
    + "<div class='say' style='" + pos + "'><b>" + esc(head) + "</b>"
    +   "<span>" + esc(say) + "</span>"
    +   "<em class='pips'>" + COACH_STEPS.map(function(_, n){
          return "<i" + (n === COACH.i ? " class='on'" : "") + "></i>"; }).join("")
    +   "</em><i>" + esc(cue) + "</i></div>"
    + "<div class='skip'><button data-coachskip='1'>"
    +   (COACH.tour ? "Close" : "Skip this") + "</button></div>";
  el.className = "on";

  /* The dimming lives on .spot, which never takes a tap; .catch takes it and
     forwards to the element we are holding. Hit-testing through a mask does
     not work - masks are paint-only - which is why the first version looped. */
  COACH.target = target;
  el.querySelector(".catch").onclick = function(ev){
    ev.stopPropagation();
    if (COACH.tour){ sfx("tap"); coachNext(); return; }
    if (COACH.target) COACH.target.click();
    /* The tap may have opened the pack stage on top of us. Stand down until
       the board is the front-most thing again. */
    setTimeout(coachSync, 60);
  };
}
function coachStart(tour){
  if (!tour && S.onboarded) return;
  COACH.on = true; COACH.tour = !!tour; COACH.i = -1;
  setTimeout(coachNext, 260);
}
/* Re-point after every render, because the thing it points at has moved. */
function coachSync(){
  if (!COACH.on) return;
  requestAnimationFrame(function(){
    if (ST || MODAL || sheetOpen()){ coachEl().className = ""; return; }
    if (COACH.tour){ if (COACH.i >= 0) coachPaint(); return; }
    coachNext();
  });
}

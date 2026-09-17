"use strict";

/* ========================================================================
   skin.js - the Skin tab.

   He asked for it outright, and it had been half-living inside care.js since
   v51: moisturiser in the shower, sunscreen when it is worth it, and being
   better at doing things before bed. Three things with nowhere of their own,
   shown as two chips on another screen.

   A routine is the single most run-shaped thing in this app - a short fixed
   order of small steps, the same every day, where the whole difficulty is
   starting. So this tab is a ring of the steps and a button that starts
   them, and the runner does the rest one at a time.

   Morning and evening are different routines, and the tab shows whichever
   one the hour is in - the same rule care.js has used from the start, so
   sunscreen is never asked for at ten at night.
   ======================================================================== */

/* The steps the hour is asking for, done or not. */
function skinSet(){
  var w = careWindow(), t = today();
  return ROUTINES.filter(function(r){
    return r[3] === w && careDue(r[0], t) && careLive(r[0]);
  });
}
function skinDone(){
  var t = today();
  return skinSet().filter(function(r){ return careOn(t, r[0]); }).length;
}
/* "Morning routine" at nine at night is a lie the clock can tell: the day
   band runs until two and a half hours before lights-out. Daytime is the
   honest word for it. */
function skinName(){ return careWindow() === "night" ? "Evening" : "Daytime"; }

function viewSkin(){
  var t = today(), set = skinSet(), done = skinDone(), n = set.length;
  var h = "";

  /* ------------------------------------------------------------ the room
     The same ring the Gym uses, because it is the same shape of thing: a
     short fixed order you either start or do not. */
  h += "<div class='stage skin" + (done === n ? " done" : "") + "'>";
  h += "<div class='stage-h'>" + esc(skinName()) + " routine</div>";
  /* With two steps a five-degree gap is a hairline and the ring reads as one
     unbroken track - a routine you have not started yet looks like a thing
     with no parts. The fewer the steps, the wider the gap between them. */
  var segs = Math.max(1, n);
  var RR = 78, CC = 2 * Math.PI * RR;
  var gapA = segs <= 1 ? 0 : segs === 2 ? 16 : segs <= 4 ? 10 : 6, stepA = 360 / segs;
  var segLen = (CC * (stepA - gapA) / 360).toFixed(1);
  h += "<div class='rig'><svg viewBox='0 0 200 200' aria-hidden='true'>";
  for (var si = 0; si < segs; si++){
    h += "<circle class='rg" + (si < done ? " on" : "") + "' cx='100' cy='100' r='" + RR + "'"
      + " stroke-dasharray='" + segLen + " " + CC.toFixed(1) + "'"
      + " transform='rotate(" + (-90 + si * stepA + gapA / 2).toFixed(1) + " 100 100)'/>";
  }
  h += "</svg><div class='rig-c'><b>" + done + "</b><span>/ " + n + "</span></div></div>";
  h += "<div class='stage-l'>" + esc(done === n
      ? (careWindow() === "night" ? "Done. Phone on the side." : "Done. Out you go.")
      : set.filter(function(r){ return !careOn(t, r[0]); })
           .map(function(r){ return r[1]; }).join(" · ")) + "</div>";
  h += "</div>";

  if (done < n) h += "<div class='actionbar'><button data-run='skin'>"
    + (done ? "Carry on" : "Start the " + skinName().toLowerCase() + " routine") + "</button></div>";

  /* Under it: every routine in the app with how long it has been kept. This
     is the only page where a skincare streak is the subject rather than a
     footnote on somebody else's screen. */
  h += "<div class='shelf7'><div class='shelf7-h'>Kept<em>"
    + ROUTINES.length + " routines</em></div><div class='runs'>";
  ROUTINES.forEach(function(r){
    var on = careOn(t, r[0]), due = careDue(r[0], t), run = careRun(r[0]);
    h += "<div class='rr" + (on ? " on" : "") + (due ? "" : " off") + "'>"
      + "<span class='rr-t'>" + esc(r[1]) + "</span>"
      + "<span class='rr-s'>" + esc(!due ? "not needed here" : on ? "done today"
          : r[3] === "night" ? "tonight" : "in the day") + "</span>"
      + "<span class='rr-n'>" + (run ? run + (run === 1 ? " day" : " days") : "—") + "</span>"
      + "</div>";
  });
  h += "</div><p class='fine'>None of these touch the streak. They are kept "
    + "because they are kept.</p></div>";
  return h;
}

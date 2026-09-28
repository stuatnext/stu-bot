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
  /* v81: steps held for the kit are not in the set; with none left in
     this half of the day, the room says so instead of "Done". */
  var want = typeof kitWanted === "function" ? kitWanted("skin") : [];
  var held = !n && want.length;

  /* ------------------------------------------------------------ the room
     The same ring the Gym uses, because it is the same shape of thing: a
     short fixed order you either start or do not. */
  h += "<div class='stage skin" + (done === n && !held ? " done" : "") + "'>";
  h += gameTop("skin", skinName() + " routine");
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
  /* held for the kit: the bag, not a nought out of nought */
  h += "</svg><div class='rig-c'>" + (held ? "<i class='rig-bag'>" + svg("bag", 50) + "</i>"
      : "<b>" + done + "</b><span>/ " + n + "</span>") + "</div></div>";
  h += "<div class='stage-l'>" + esc(held ? "Get the kit first. The routine starts the day you have it."
      : done === n
      ? (careWindow() === "night" ? "Done. Phone on the side." : "Done. Out you go.")
      : set.filter(function(r){ return !careOn(t, r[0]); })
           .map(function(r){ return r[1]; }).join(" · ")) + "</div>";
  h += "</div>";

  h += gameBar("skin",
    done >= n ? "" : done ? "Carry on" : "Start the " + skinName().toLowerCase() + " routine",
    done >= n ? "" : "data-run='skin'");
  /* The kit, right under the game while any of it is missing - it is the
     level he is on. Once it is all there it goes behind a door with the
     record, where Ran out lives. */
  if (want.length) h += kitPanelHTML("skin");

  /* Behind the one door: every routine in the app with how long it has been
     kept. This is the only page where a skincare streak is the subject
     rather than a footnote on somebody else's screen - but it is a record,
     and a record belongs under the game, not in front of it. */
  var kept = "<div class='runs'>";
  ROUTINES.forEach(function(r){
    var on = careOn(t, r[0]), due = careDue(r[0], t), run = careRun(r[0]);
    var need = typeof kitBlocks === "function" && kitBlocks(r[0]) ? kitFor(r[0]) : null;
    kept += "<div class='rr" + (on ? " on" : "") + (due ? "" : " off") + "'>"
      + "<span class='rr-t'>" + esc(r[1]) + "</span>"
      + "<span class='rr-s'>" + esc(need ? "needs " + need.name.toLowerCase()
          : !due ? "not needed here" : on ? "done today"
          : r[3] === "night" ? "tonight" : "in the day") + "</span>"
      + "<span class='rr-n'>" + (run ? run + (run === 1 ? " day" : " days") : "—") + "</span>"
      + "</div>";
  });
  kept += "</div><p class='fine'>None of these touch the streak. They are kept "
    + "because they are kept.</p>";
  var doors = [ fold("keptroutines", "Kept", ROUTINES.length + " routines", kept, false) ];
  if (!want.length && typeof kitPanelHTML === "function")
    doors.push(fold("skinkit", "Kit", "all there", kitPanelHTML("skin", 1), false));
  h += drawers(doors);
  return h;
}

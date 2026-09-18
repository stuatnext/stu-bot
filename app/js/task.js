"use strict";

/* ========================================================================
   task.js - the runner. Tap start, then one thing at a time.

   His ask, in his own words: "I'd prefer it if I can just tap start and then
   do one task after another - that's more gamified as well, because if you
   press start and then you get the first task then I know exactly what to
   focus on."

   He is describing the thing the Gym has had since v29 and no other tab ever
   got: a guided session. You do not read the gym tab, you start it, and it
   tells you the one movement you are on. Every other tab handed him a list
   and left the choosing to him - which is both more work and, as he says,
   less of a game.

   So this is that, generalised. Any tab can hand the runner a kind; the
   runner works out the steps from the record, puts ONE of them on the
   screen, and moves on when it is done or skipped. It also fixes the other
   complaint in the same breath: a tab whose detail lives inside a run does
   not have to fit six sections above the fold, because there is only the
   object and a button.

   The rule the rest of the app runs on holds here too: the runner only ever
   calls the same functions the buttons call. It reads the record to decide
   what is left; it never writes a day of its own.
   ======================================================================== */

var RUN = null;          /* { kind, ids, i } */

/* Which tabs can be run, and what the run is called. */
var RUN_KINDS = {
  day:  { title: "Today",       done: "That is the day." },
  work: { title: "Work",        done: "Enough for one sitting." },
  food: { title: "Food",        done: "Every meal logged." },
  skin: { title: "Skin",        done: "Routine done." }
};

/* ------------------------------------------------------------- the steps
   Worked out fresh from the record every time, never stored. A step that
   has been done since the run started simply is not returned any more. */
function runStepsFor(kind){
  var k = today(), out = [];
  if (kind === "day"){
    winList(k).forEach(function(w){
      if (w.done || w.kind === "pack") return;
      /* The op is what the station's own button does. A card he put in his
         own hand is done by its card id, not by the window's, or the run
         would tick it off without the record ever hearing about it. */
      /* The kicker names the part of the day, not the step. It was the
         window's own label, which on a routine meant "MOISTURISER" printed
         over "Moisturiser." twice. */
      var kick = w.kind === "care" ? (careWindow() === "night" ? "Tonight\u2019s routine" : "The routine")
               : w.kind === "todo" ? "From your own hand"
               : w.kind === "card" ? "The card"
               : w.kind === "pillar" ? w.label
               : w.label;
      out.push({
        id: w.id, kicker: kick, col: w.col,
        title: w.kind === "pillar" && w.key === nextUp() ? priority({ noPacks: 1 }).ask
             : w.kind === "card" ? w.card.card[0] + "."
             : w.kind === "todo" ? w.todo[1] + "."
             : w.label + ".",
        say: w.kind === "care" ? careSay(w.key, k) : w.why,
        shut: w.state === "shut",
        op: w.kind === "todo" ? "t:" + w.todo[0] : w.id
      });
    });
  } else if (kind === "work"){
    WORKAREAS.forEach(function(a){
      WORKITEMS.forEach(function(i){
        if (i[1] !== a[0] || workDone(i[0])) return;
        out.push({ id: "w:" + i[0], kicker: a[1], col: "#CE82FF",
                   title: i[2], say: i[3], op: "w:" + i[0] });
      });
    });
  } else if (kind === "food"){
    mealPlan().forEach(function(m){
      if (anchorDone(k, m.slot)) return;
      var sug = typeof suggestOrder === "function" ? suggestOrder(m.slot) : null;
      out.push({ id: "m:" + m.slot, kicker: hhmm(m.at) + " · " + m.label,
                 col: "#3FD9A0", title: m.label + ".",
                 say: sug ? sug[0] + " — " + num(sug[1]) + "g" : "Log what you actually ate.",
                 op: "m:" + m.slot });
    });
  } else if (kind === "skin"){
    careNow().forEach(function(r){
      if (careOn(k, r[0])) return;
      out.push({ id: "c:" + r[0], kicker: careWindow() === "night" ? "Tonight" : "Today",
                 col: "#7FD4C1", title: r[1] + ".", say: careSay(r[0], k), op: "c:" + r[0] });
    });
  }
  return out;
}
/* How many the run has to offer, for the button that starts it. */
function runCount(kind){ return runStepsFor(kind).length; }

/* ------------------------------------------------------------ the run */
function startRun(kind, from){
  var steps = runStepsFor(kind);
  if (!steps.length) return;
  var ids = steps.map(function(s){ return s.id; });
  /* Starting "here" means starting at the station he was looking at, not at
     the top of a list he has already scrolled past. */
  var at = from ? ids.indexOf(from) : 0;
  RUN = { kind: kind, ids: ids, i: at < 0 ? 0 : at, did: 0, ticked: {} };
  var el = document.getElementById("task");
  el.className = "on";
  document.body.style.overflow = "hidden";
  sfx("nav"); buzz(10);
  paintRun();
}
function closeRun(){
  var el = document.getElementById("task");
  if (el){ el.className = ""; el.innerHTML = ""; }
  document.body.style.overflow = "";
  RUN = null;
  render({ keepScroll: true, animate: true });
}
/* The step he is on: the first id still outstanding at or after the cursor.
   Anything he did on the way past is stepped over rather than shown again. */
function runStep(){
  if (!RUN) return null;
  var live = runStepsFor(RUN.kind), byId = {};
  live.forEach(function(s){ byId[s.id] = s; });
  for (var n = RUN.i; n < RUN.ids.length; n++){
    if (byId[RUN.ids[n]]){ RUN.i = n; return byId[RUN.ids[n]]; }
  }
  RUN.i = RUN.ids.length;
  return null;
}
function runNext(){
  if (!RUN) return;
  RUN.i++;
  paintRun();
}

function paintRun(){
  var el = document.getElementById("task");
  if (!el || !RUN) return;
  var meta = RUN_KINDS[RUN.kind] || { title: "Run", done: "Done." };
  var step = runStep();
  var total = RUN.ids.length;
  var at = Math.min(RUN.i + 1, total);

  /* The step's colour is set on the whole run frame, not just the text, so
     the button he presses is the colour of the thing he is pressing it for. */
  var h = "<div class='tk' style='--pil:"
    + ((step && step.col) || "#8FD4FF") + "'>";
  h += "<div class='tk-top'><button class='tk-x' data-runclose='1' aria-label='Leave'>&times;</button>"
    + "<span class='tk-k'>" + esc(meta.title) + "</span>"
    + "<span class='tk-c'>" + (step ? at + " of " + total : total + " of " + total) + "</span></div>";

  /* The pips: done, skipped, here, still to come. Walking past something is
     not the same as doing it, and a row of seven green bars over a run where
     he ticked nothing was the app congratulating him for scrolling. */
  h += "<div class='tk-pips'>";
  for (var p = 0; p < total; p++){
    var st = RUN.ticked[RUN.ids[p]] ? "did"
           : p === RUN.i && step ? "now"
           : p < RUN.i ? "skip" : "";
    h += "<i" + (st ? " data-s='" + st + "'" : "") + "></i>";
  }
  h += "</div>";

  if (step){
    h += "<div class='tk-body' data-n='" + at + "'>";
    h += "<div class='tk-kk'>" + esc(step.kicker) + "</div>";
    h += "<h2>" + esc(step.title) + "</h2>";
    if (step.say) h += "<p>" + esc(step.say) + "</p>";
    if (step.shut) h += "<p class='tk-shut'>That window has shut. It still counts if you do it.</p>";
    h += "</div>";
    h += "<div class='tk-acts'>"
      + "<button class='tk-go' data-runop='" + esc(step.op) + "'>Did it</button>"
      + "<button class='tk-skip' data-runskip='1'>Not now</button>"
      + "</div>";
  } else {
    /* the end of the run */
    h += "<div class='tk-body done" + (RUN.did ? "" : " none") + "'>";
    h += "<div class='tk-kk'>" + (RUN.did ? "Run finished" : "Nothing left") + "</div>";
    h += "<h2>" + esc(RUN.did >= total ? meta.done
        : RUN.did ? RUN.did + " of " + total + " done."
        : "Nothing ticked this time.") + "</h2>";
    if (RUN.kind === "day" && typeof scoreOn === "function")
      h += "<p>Today is worth " + num(scoreOn(today())) + " so far.</p>";
    /* The prize, said out loud at the moment it is won. A mini game that
       pays silently is not a game, it is a checklist with a number on it. */
    var gid = { work: "work", food: "food", skin: "skin" }[RUN.kind];
    if (gid && typeof gameClear === "function" && gameClear(gid, today())){
      h += "<p class='tk-prize'>" + esc(gameName(gid)) + " cleared. +"
        + gamePrize(gid) + " spares."
        + (gameSwept(today()) ? " All five today \u2014 +" + SWEEP + " more." : "")
        + "</p>";
    }
    h += "</div>";
    h += "<div class='tk-acts'><button class='tk-go' data-runclose='1'>Done</button></div>";
  }
  return (el.innerHTML = h + "</div>");
}

/* -------------------------------------------------------------- the ops
   Every one of these calls the same function the tab's own button calls.
   The runner is a way of being asked one thing at a time; it is not a
   second way of writing to the record. */
function runOp(op){
  if (!RUN) return;
  var id = RUN.ids[RUN.i];
  var kind = op.split(":")[0], val = op.slice(op.indexOf(":") + 1);
  /* Ticked means the record says so. Two of these ops open a sheet he can
     back out of, and a run that counted a cancelled sheet as a win would be
     the app marking its own homework. */
  var mark = function(){ RUN.did++; RUN.ticked[id] = 1; };
  var after = function(){ mark(); sfx("tick"); buzz(12); runNext(); };
  var settled = function(ok){ if (ok) mark(); runNext(); };

  if (op === "card"){ if (typeof questDone === "function") questDone(); return after(); }
  if (kind === "t"){ if (typeof doItUI === "function") doItUI(val); return after(); }
  if (kind === "p"){
    if (val === "family" && typeof askPeople === "function"
        && typeof peopleEmpty === "function" && (!peopleEmpty() || !S.peopleSeeded)){
      return askPeople().then(function(){ settled(pDone(today(), "family")); });
    }
    tapPillar(val); return after();
  }
  if (kind === "c"){ tapCare(val); return after(); }
  if (kind === "w"){ toggleWork(val); return after(); }
  if (kind === "m"){
    if (typeof askAnchor === "function")
      return askAnchor(val).then(function(){ settled(anchorDone(today(), val)); });
    return after();
  }
  return after();
}

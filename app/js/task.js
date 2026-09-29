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

var RUN = null;          /* { kind, ids, i, ticked, snap, dir } */

/* Which tabs can be run, and what the run is called. */
var RUN_KINDS = {
  day:  { title: "Today",       done: "That is the day." },
  work: { title: "Work",        done: "Enough for one sitting." },
  food: { title: "Food",        done: "Every meal logged." },
  skin: { title: "Skin",        done: "Routine done." }
};

/* ------------------------------------------------------------- the steps
   Worked out fresh from the record every time, never stored. A step that
   has been done since the run started is not offered as one to do - but
   with `all` it comes back marked done, so walking back through the run
   can show it, and take it back. */
function runStepsFor(kind, all){
  var k = today(), out = [];
  if (kind === "day"){
    /* v82: the day's plan gives every step its minute, adds the steps only
       the plan knows (coming round, meals, Mandarin, admin), and the run
       walks them in that order - "built chronologically" */
    var plan = (S.onboarded && typeof dayPlan === "function") ? dayPlan(k) : null, at = {};
    if (plan) plan.forEach(function(b){ at[b.id] = b.at; });
    winList(k).forEach(function(w){
      if (w.kind === "pack") return;
      /* The op is what the station's own button does. A card he put in his
         own hand is done by its card id, not by the window's, or the run
         would tick it off without the record ever hearing about it. */
      /* The kicker names the part of the day, not the step. It was the
         window's own label, which on a routine meant "MOISTURISER" printed
         over "Moisturiser." twice. */
      var kick = w.kind === "care" ? (careWindow() === "night" ? "Tonight\u2019s routine" : "The routine")
               : w.kind === "todo" ? "From your own hand"
               : w.kind === "card" ? "The card"
               : w.kind === "life" ? "Level up \u00b7 " + w.label
               : w.kind === "date" ? "Tim & me"
               : w.kind === "kit" ? "Level zero \u00b7 the kit"
               : w.kind === "focus" ? (w.focus ? focusWord(w.focus) : w.label)
               : w.kind === "coffee" ? "Coffee somewhere new"
               : w.kind === "pillar" ? w.label
               : w.label;
      if (at[w.id] != null) kick = hhmm(at[w.id]) + " \u00b7 " + kick;
      out.push({
        id: w.id, kicker: kick, col: w.col, at: at[w.id],
        title: w.kind === "pillar" && w.key === nextUp() ? priority({ noPacks: 1 }).ask
             : w.kind === "focus" && w.focus ? w.focus.t + "."
             : w.kind === "coffee" ? coffeePick(k)[0] + "."
             : w.kind === "card" ? w.card.card[0] + "."
             : w.kind === "life" ? w.life.act[1] + "."
             : w.kind === "todo" ? w.todo[1] + "."
             : w.label + ".",
        say: w.kind === "care" ? careSay(w.key, k) : w.why,
        shut: w.state === "shut",
        /* the Train step can be done smaller, not just done or skipped */
        small: w.kind === "pillar" && w.key === "train",
        /* the kit is gone through, not done in one tap */
        go: w.kind === "kit" ? "Go through it" : w.kind === "coffee" ? "I went" : "",
        op: w.kind === "todo" ? "t:" + w.todo[0] : w.id,
        done: !!w.done,
        /* which skill and step, so a level-up step can be taken back */
        skill: w.life ? w.life.skill : "", act: w.life ? w.life.act[0] : ""
      });
    });
    if (plan){
      planSteps(k, plan).forEach(function(s){ out.push(s); });
      out.sort(function(a, b){
        var x = a.at == null ? 1e9 : sinceWake(a.at), y = b.at == null ? 1e9 : sinceWake(b.at);
        return x - y;
      });
    }
  } else if (kind === "work"){
    WORKAREAS.forEach(function(a){
      WORKITEMS.forEach(function(i){
        if (i[1] !== a[0]) return;
        out.push({ id: "w:" + i[0], kicker: a[1], col: "#CE82FF",
                   title: i[2], say: i[3], op: "w:" + i[0], done: workDone(i[0]) });
      });
    });
  } else if (kind === "food"){
    mealPlan().forEach(function(m){
      var sug = typeof suggestOrder === "function" ? suggestOrder(m.slot) : null;
      out.push({ id: "m:" + m.slot, kicker: hhmm(m.at) + " · " + m.label,
                 col: "#3FD9A0", title: m.label + ".",
                 say: sug ? sug[0] + " — " + num(sug[1]) + "g" : "Log what you actually ate.",
                 op: "m:" + m.slot, done: anchorDone(k, m.slot) });
    });
  } else if (kind === "skin"){
    careNow().forEach(function(r){
      out.push({ id: "c:" + r[0], kicker: careWindow() === "night" ? "Tonight" : "Today",
                 col: "#7FD4C1", title: r[1] + ".", say: careSay(r[0], k), op: "c:" + r[0],
                 done: careOn(k, r[0]) });
    });
  }
  return all ? out : out.filter(function(s){ return !s.done; });
}
/* How many the run has to offer, for the button that starts it. */
function runCount(kind){ return runStepsFor(kind).length; }

/* ------------------------------------------------------------ the run */
function startRun(kind, from){
  /* v82: the day's run is the whole day - done steps too, green on the pips
     behind him - so a done row tapped in "Your day" opens on that step,
     stamped, with its Undo. The other runs are what is left. */
  var whole = kind === "day" && S.onboarded;
  var steps = runStepsFor(kind, whole);
  var first = -1;
  steps.forEach(function(s, n){ if (first < 0 && !s.done) first = n; });
  if (!steps.length || (first < 0 && !from)) return;
  var ids = steps.map(function(s){ return s.id; }), snap = {};
  steps.forEach(function(s){ snap[s.id] = s; });
  /* Starting "here" means starting at the station he was looking at, not at
     the top of a list he has already scrolled past. */
  var at = from ? ids.indexOf(from) : first;
  if (at < 0) at = first < 0 ? 0 : first;
  /* snap keeps each step as he saw it, so one he has done can still be
     shown when he walks back to it; dir is which way he last moved */
  RUN = { kind: kind, ids: ids, i: at < 0 ? 0 : at, ticked: {}, snap: snap, dir: 1, n: 0 };
  var el = document.getElementById("task");
  el.className = "on";
  document.body.style.overflow = "hidden";
  runSwipe(el);
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

/* v80. His words, over a screenshot of step 6 of 6: "I can't go back and
   forward here." The run only ever went one way - Did it or Not now, and
   whatever was behind him was gone, including a tap he did not mean. So
   every step now has three states, read from the record rather than kept:
   open (still to do), did (the record says so, or he ticked it here) and
   gone (the day moved on and the step with it - a routine whose window
   changed). Back and forward walk the open and the done ones; a done one
   shows as done and can be taken back with the same function its own
   button uses. */
function runLive(){
  var by = {};
  runStepsFor(RUN.kind, true).forEach(function(s){
    by[s.id] = s;
    /* keep the picture fresh while it is still to do; once done, keep the
       one he did - the slot may already be showing the next thing */
    if (!s.done && !RUN.ticked[s.id]) RUN.snap[s.id] = s;
  });
  return by;
}
function runState(n, live){
  var id = RUN.ids[n], s = live[id];
  if (RUN.ticked[id]) return "did";
  if (!s) return "gone";
  return s.done ? "did" : "open";
}
/* The next step from `from` going `dir`, of the kind wanted - any that
   has not gone, unless told to look only for the ones still to do. */
function runSeek(from, dir, openOnly, live){
  live = live || runLive();
  for (var n = from + dir; n >= 0 && n < RUN.ids.length; n += dir){
    var st = runState(n, live);
    if (openOnly ? st === "open" : st !== "gone") return n;
  }
  return -1;
}
/* The step under the cursor. Gone ones are stepped over in the direction
   he was going, so Back never lands on a blank. */
function runStep(){
  if (!RUN) return null;
  var live = runLive(), len = RUN.ids.length, n = RUN.i;
  while (n >= 0 && n < len && runState(n, live) === "gone") n += RUN.dir < 0 ? -1 : 1;
  if (n < 0){ n = 0; while (n < len && runState(n, live) === "gone") n++; }
  RUN.i = Math.min(n, len);
  if (RUN.i >= len) return { s: null, live: live };
  var id = RUN.ids[RUN.i], st = runState(RUN.i, live);
  return { s: st === "open" ? live[id] : (RUN.snap[id] || live[id]), st: st, live: live };
}
function runGo(n, dir){
  RUN.i = n; RUN.dir = dir;
  paintRun();
}
/* After a step is done: on to the next one still to do. */
function runNext(){
  if (!RUN) return;
  var n = runSeek(RUN.i, 1, true);
  runGo(n < 0 ? RUN.ids.length : n, 1);
}
/* Not now, Next, a swipe left: one step on, done or not. */
function runFwd(){
  if (!RUN || RUN.i >= RUN.ids.length) return;
  var n = runSeek(RUN.i, 1);
  sfx("tap"); buzz(6);
  runGo(n < 0 ? RUN.ids.length : n, 1);
}
/* Back, a swipe right: one step back, done or not - from the end too. */
function runBack(){
  if (!RUN) return;
  var n = runSeek(Math.min(RUN.i, RUN.ids.length), -1);
  if (n < 0){ sfx("no"); return; }
  sfx("tap"); buzz(6);
  runGo(n, -1);
}
/* A pip, tapped: straight to that step. */
function runJump(n){
  if (!RUN || !(n >= 0 && n < RUN.ids.length) || n === RUN.i) return;
  if (runState(n, runLive()) === "gone"){ sfx("no"); return; }
  sfx("tap"); buzz(6);
  runGo(n, n < RUN.i ? -1 : 1);
}
/* From the end: back to the first one he left. */
function runLeft(){
  if (!RUN) return;
  var n = runSeek(-1, 1, true);
  if (n < 0) return;
  sfx("tap"); buzz(6);
  runGo(n, -1);
}
/* A swipe is the other half of back and forward on a phone. Horizontal,
   deliberate and quick, or it is a scroll or a tap that wandered. */
function runSwipe(el){
  if (el.dataset.sw) return;
  el.dataset.sw = "1";
  var x0 = null, y0 = 0, t0 = 0;
  el.addEventListener("touchstart", function(e){
    if (!RUN || e.touches.length !== 1){ x0 = null; return; }
    x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
  }, { passive: true });
  el.addEventListener("touchend", function(e){
    if (!RUN || x0 === null) return;
    var t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    x0 = null;
    if (Math.abs(dx) < 56 || Math.abs(dy) > Math.abs(dx) * 0.6 || Date.now() - t0 > 700) return;
    if (typeof MODAL !== "undefined" && MODAL) return;
    if (dx < 0) runFwd(); else runBack();
  }, { passive: true });
}

function paintRun(){
  var el = document.getElementById("task");
  if (!el || !RUN) return;
  var meta = RUN_KINDS[RUN.kind] || { title: "Run", done: "Done." };
  var cur = runStep(), step = cur.s, live = cur.live;
  var total = RUN.ids.length;
  var at = Math.min(RUN.i + 1, total);
  var states = RUN.ids.map(function(x, n){ return runState(n, live); });
  var did = states.filter(function(st){ return st === "did"; }).length;
  var left = states.filter(function(st){ return st === "open"; }).length;
  var real = states.filter(function(st){ return st !== "gone"; }).length;
  var canBack = states.slice(0, RUN.i).some(function(st){ return st !== "gone"; });
  var was = step && cur.st === "did";

  /* The step's colour is set on the whole run frame, not just the text, so
     the button he presses is the colour of the thing he is pressing it for. */
  /* the first screen rises in as it always did; after that the step slides
     the way he went, so back feels like back */
  var move = RUN.n++ ? (RUN.dir < 0 ? " go-b" : RUN.dir > 0 ? " go-f" : " go-0") : "";
  var h = "<div class='tk" + move + "' style='--pil:"
    + ((step && step.col) || "#8FD4FF") + "'>";
  h += "<div class='tk-top'><button class='tk-x' data-runclose='1' aria-label='Leave'>&times;</button>"
    + "<span class='tk-k'>" + esc(meta.title) + "</span>"
    + "<span class='tk-c'>" + (step ? at + " of " + total : total + " of " + total) + "</span></div>";

  /* The pips: done, skipped, here, still to come. Walking past something is
     not the same as doing it, and a row of seven green bars over a run where
     he ticked nothing was the app congratulating him for scrolling. Each
     one is a button now - a tap goes straight to that step. */
  h += "<div class='tk-pips'>";
  for (var p = 0; p < total; p++){
    var st = states[p], here = p === RUN.i && step;
    var look = st === "did" ? "did" : st === "gone" ? "gone"
             : here ? "now" : p < RUN.i ? "skip" : "";
    h += "<button data-runjump='" + p + "'" + (here ? " data-at='1' aria-current='step'" : "")
      + (st === "gone" ? " disabled" : "")
      + " aria-label='Step " + (p + 1) + (st === "did" ? ", done" : "") + "'>"
      + "<i" + (look ? " data-s='" + look + "'" : "") + "></i></button>";
  }
  h += "</div>";

  var nav = function(fwd){
    return "<div class='tk-nav'>"
      + "<button class='tk-skip tk-bk' data-runback='1'" + (canBack ? "" : " disabled") + "><b class='tk-ch'>‹</b>Back</button>"
      + (fwd || "") + "</div>";
  };
  if (step && !was){
    h += "<div class='tk-body' data-n='" + at + "'>";
    h += "<div class='tk-kk'>" + esc(step.kicker) + "</div>";
    h += "<h2>" + esc(step.title) + "</h2>";
    if (step.say) h += "<p>" + esc(step.say) + "</p>";
    if (step.shut) h += "<p class='tk-shut'>That window has shut. It still counts if you do it.</p>";
    h += "</div>";
    h += "<div class='tk-acts'>"
      + "<button class='tk-go' data-runop='" + esc(step.op) + "'>" + esc(step.go || "Did it") + "</button>"
      /* "Not now" on training was the whole day's training gone. The third
         answer keeps it: the short version, at home, or a walk. */
      + (step.small && typeof askLowDay === "function"
          ? "<button class='tk-skip tk-small' data-runsmall='1'>Something smaller</button>" : "")
      + nav("<button class='tk-skip tk-fw' data-runfwd='1'>Not now<b class='tk-ch'>›</b></button>")
      + "</div>";
  } else if (step){
    /* A step he has done, walked back to. It says so, and the tap he did
       not mean comes off with the same function that put it on. */
    var undo = runCanUndo(step);
    h += "<div class='tk-body was' data-n='" + at + "'>";
    h += "<span class='tk-stamp'>" + svg("tick", 18) + "Done</span>";
    h += "<div class='tk-kk'>" + esc(step.kicker) + "</div>";
    h += "<h2>" + esc(step.title) + "</h2>";
    h += "<p>" + (undo ? "Did not actually do it? Undo puts it back on the day."
                       : "This one is on the record. Change it from its own tab.") + "</p>";
    h += "</div>";
    h += "<div class='tk-acts'>"
      + (undo ? "<button class='tk-skip tk-undo' data-runundo='1'>↺ Undo</button>" : "")
      + nav("<button class='tk-skip tk-fw' data-runfwd='1'>Next<b class='tk-ch'>›</b></button>")
      + "</div>";
  } else {
    /* the end of the run */
    h += "<div class='tk-body done" + (did ? "" : " none") + "'>";
    h += "<div class='tk-kk'>" + (did ? "Run finished" : "End of the run") + "</div>";
    h += "<h2>" + esc(did >= real ? meta.done
        : did ? did + " of " + real + " done."
        : "Nothing ticked this time.") + "</h2>";
    if (RUN.kind === "day" && typeof scoreOn === "function")
      h += "<p>Today is worth " + num(scoreOn(today())) + " so far.</p>";
    /* The prize, said out loud at the moment it is won. A mini game that
       pays silently is not a game, it is a checklist with a number on it. */
    var gid = { work: "work", food: "food", skin: "skin" }[RUN.kind];
    if (gid && typeof gameClear === "function" && gameClear(gid, today())){
      h += "<p class='tk-prize'>" + esc(gameName(gid)) + " cleared. +"
        + gamePrize(gid) + " spares."
        + (gameSwept(today()) ? " All five today — +" + SWEEP + " more." : "")
        + "</p>";
    }
    h += "</div>";
    h += "<div class='tk-acts'><button class='tk-go' data-runclose='1'>Done</button>"
      + nav(left ? "<button class='tk-skip tk-fw' data-runleft='1'>"
          + (left === 1 ? "The one left" : "The " + left + " left") + "<b class='tk-ch'>›</b></button>" : "")
      + "</div>";
  }
  return (el.innerHTML = h + "</div>");
}

/* ------------------------------------------------------------- the undo
   The same functions the tabs' own buttons use to take a tap back - the
   run still never writes a day of its own. Offered only when the record
   says there is something to take back. */
function runOpParts(op){
  return { kind: op.split(":")[0], val: op.slice(op.indexOf(":") + 1) };
}
function runCanUndo(s){
  var o = runOpParts(s.op), k = today();
  if (s.op === "card"){ var q = typeof questFor === "function" ? questFor(k) : null; return !!(q && q.done); }
  if (s.op === "life") return !!s.skill && lifeEntries().some(function(e){
    return e[0] === k && e[1] === s.skill && e[2] === s.act; });
  if (s.op === "date") return typeof dateNightDone === "function" && dateNightDone(k);
  if (s.op === "wake" || s.op === "week" || s.op === "clean") return !!dayRec(k)[s.op];
  if (s.op === "zh") return zhDone(k);
  if (s.op === "shake") return shakeOn(k);
  if (s.op === "admin") return adminDone(k);
  if (s.op === "focus") return focusDoneOn(k);
  if (s.op === "coffee") return coffeeOn(k);
  if (o.kind === "focusc") return !!(dayRec(k).focusc || {})[o.val];
  if (o.kind === "cleanc") return dayRec(k).cleanc === "z" + o.val;
  if (o.kind === "t") return !!(S.doneDo || {})[o.val];
  if (o.kind === "p") return pDone(k, o.val);
  if (o.kind === "c") return careOn(k, o.val);
  if (o.kind === "w") return workDone(o.val);
  if (o.kind === "m") return anchorDone(k, o.val);
  return false;
}
function runUndo(){
  if (!RUN) return;
  var id = RUN.ids[RUN.i], s = RUN.snap[id];
  if (!s || !runCanUndo(s)){ sfx("no"); return; }
  var o = runOpParts(s.op);
  if (s.op === "card") questUndo();
  else if (s.op === "life") undoLife(s.skill, s.act);
  else if (s.op === "date") undoLife("us", "date");
  else if (s.op === "wake" || s.op === "week" || s.op === "clean") planUntick(s.op);
  else if (s.op === "zh") undoLife("zh", "study");
  else if (s.op === "shake") undoFood("snack");
  else if (s.op === "admin") undoAdmin();
  else if (s.op === "focus") undoFocus();
  else if (s.op === "coffee") undoCoffee();
  else if (o.kind === "focusc") undoFocusCarry(o.val);
  else if (o.kind === "cleanc") undoCleanCarry();
  else if (o.kind === "t") undoDoUI(o.val);
  else if (o.kind === "p") tapPillar(o.val);
  else if (o.kind === "c") tapCare(o.val);
  else if (o.kind === "w") toggleWork(o.val);
  else if (o.kind === "m") undoFood(o.val);
  delete RUN.ticked[id];
  buzz(8);
  RUN.dir = 0;
  paintRun();
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
  var mark = function(){ if (RUN) RUN.ticked[id] = 1; };
  var after = function(){ mark(); sfx("tick"); buzz(12); runNext(); };
  var settled = function(ok){ if (ok) mark(); runNext(); };

  if (op === "card"){ if (typeof questDone === "function") questDone(); return after(); }
  /* v82: the plan's own steps */
  if (op === "wake"){ planTick("wake"); return after(); }
  if (op === "week"){ planTick("week"); return after(); }
  if (op === "clean"){ planTick("clean"); return after(); }
  if (op === "shake") return askShake().then(function(){ settled(shakeOn(today())); });
  if (op === "zh"){ logLife("zh", "study"); return after(); }
  if (op === "admin"){ doAdmin(); return after(); }
  if (op === "focus"){ doFocus(); return after(); }
  if (op === "coffee") return askCoffee().then(function(){ settled(coffeeOn(today())); });
  /* the kit: one sheet per thing; ticked only when nothing is left to get */
  if (op === "kit") return askKit().then(function(){ settled(!kitWanted().length); });
  if (op === "life"){ if (typeof lifeDoStep === "function") lifeDoStep(); return after(); }
  if (op === "date"){ if (typeof logLife === "function" && !dateNightDone(today())) logLife("us", "date"); return after(); }
  /* v101: carried over from another day */
  if (kind === "focusc"){ doFocusCarry(val); return after(); }
  if (kind === "cleanc"){ doCleanCarry(val); return after(); }
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

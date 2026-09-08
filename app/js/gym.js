/* ===================================================================== gym
   Sessions, lifts and the waist. Nothing else - he asked for Body to be about
   the gym and nothing but, and he was right that a tab holding training, food,
   water and sleep at once was four subjects wearing one hat. */

function viewGym(){
  var t = today(), h = "";

  /* --- the session, at whatever stage he has unlocked */
  var open = todaySession(), key = open || nextSessionKey();
  var st = stage(), nx = nextStage(), list = stageLifts(key);
  var doneN = 0;
  list.forEach(function(ex, i){ if (loggedToday(pickFor(key, i))) doneN++; });

  /* The tab opens on the one thing it is about: how much of today's session
     is on the board. Everything under it qualifies that number. */
  var doneS = sessionsDone();
  var wNow = (S.waist || []).slice(-1)[0];
  h += hero({
    tone: "flame", icon: "dumb", kicker: "Today\u2019s session \u00b7 " + key,
    big: doneN, unit: "/ " + list.length,
    line: doneN === list.length ? "Every move logged. That is the session."
        : doneN ? "moves logged \u2014 " + (list.length - doneN) + " to go"
        : "moves waiting at 24/7 Tanjong Pagar",
    pct: Math.round(100 * doneN / Math.max(1, list.length)),
    foot: doneS ? num(doneS) + (doneS === 1 ? " session" : " sessions") + " logged all time"
        : "Turning up is the thing being trained. One move counts."
  });
  /* The way in. A newbie does not want a list; he wants to be told what to
     do next, one thing at a time, and to be told when to rest. That is the
     guided session. The list under it is the overview, and still works. */
  var resume = S.sess && S.sess.day === t;
  h += "<div class='btns'><button class='btn pri big' data-startsession='" + key + "'>"
    + (resume ? "Resume today\u2019s session" : doneN ? "Continue the session" : "Start the session")
    + "</button></div>";
  if (!doneS && !doneN){
    h += "<p class='fine' style='text-align:center;margin:-4px 0 12px'>It walks you through it: what "
      + "the machine is, how to set it, what to lift, when to rest. Nothing to work out.</p>";
  }

  h += gymProgressHTML();

  h += "<div class='rulehead'><h3>Today's moves</h3><span></span>"
    + "<em>" + (doneN ? doneN + " of " + list.length + " logged" : "next up") + "</em></div>";

  var stgh = "<div class='stg'>"
    + "<div class='sh'><b>" + esc(st[1]) + "</b>"
    + "<span>" + list.length + (list.length === 1 ? " move" : " moves")
    + " &middot; " + st[3] + " sets</span></div>"
    + "<p class='fine'>" + esc(st[4]) + "</p>";
  if (nx){
    var need = nx[0] - doneS, span = Math.max(1, nx[0] - st[0]);
    var pctS = Math.min(100, Math.round(100 * (doneS - st[0]) / span));
    stgh += "<div class='sbar'><i style='width:" + pctS + "%'></i></div>"
      + "<p class='fine'>" + need + " more " + (need === 1 ? "session" : "sessions")
      + " unlocks <b>" + esc(nx[1]) + "</b>.</p>";
  } else {
    stgh += "<p class='fine'>" + num(doneS) + " sessions logged.</p>";
  }
  stgh += "</div>";
  h += fold("stage", esc(st[1]), num(doneS) + (doneS === 1 ? " session" : " sessions")
    + (nx ? " \u00b7 " + (nx[0] - doneS) + " to " + esc(nx[1]) : ""), stgh, false);

  if (!doneN && !doneS){
    h += "<p class='fine' style='margin:0 0 10px'>24/7 Fitness, Tanjong Pagar. Tap an exercise to "
      + "log it. The arrows swap it for a machine that does the same job.</p>";
  }

  h += "<div class='lifts'>";
  list.forEach(function(ex, i){
    var name = pickFor(key, i);
    var had = loggedToday(name), t2 = nextTarget(ex, name);
    var swapped = name !== ex[0];
    h += "<div class='liftrow'>";
    h += "<button class='lift" + (had ? " on" : "") + "' data-lift='" + key + ":" + i + "'>"
      + "<span class='lb2'><b>" + esc(name) + "</b>"
      + "<span>" + esc(swapped ? "for " + ex[0].toLowerCase() : ex[4])
      + " &middot; " + restClock(restOf(ex)) + " rest</span></span>"
      + "<span class='lv'>" + (had
          ? had.w + "kg<em>" + had.r.join(" &middot; ") + "</em>"
          : (t2.w ? t2.w + "kg<em>" + esc(t2.tag || "") + "</em>"
                  : "<span class='new'>new</span>")) + "</span></button>";
    h += "<button class='swap' data-how='" + key + ":" + i + "' aria-label='How to do " + esc(name) + "'>?</button>"
      + "<button class='swap' data-swap='" + key + ":" + i + "'"
      + " aria-label='Swap " + esc(name) + "'>&#8646;</button></div>";
  });
  h += "</div>";

  var held = sessionFor(key)[1].slice(list.length);
  if (held.length){
    h += "<div class='hold'>" + held.length + " more "
      + (held.length === 1 ? "move" : "moves") + " in this session, locked for now &mdash; "
      + esc(held.map(function(x){ return x[0].toLowerCase(); }).join(", ")) + ".</div>";
  }

  if (doneN){
    var already = day(t).p.train;
    h += "<div class='btns'><button class='btn" + (already ? " quiet" : " pri") + "' data-finish='1'>"
      + (already ? "Trained is marked" : "Finish &mdash; mark Trained") + "</button></div>";
    if (!already) h += "<p class='fine'>One exercise counts. Ten minutes counts. Turning up is the "
      + "thing you are training here.</p>";
  }

  /* --- waist, which belongs with the gym rather than with the food */
  var wh = "";
  var w = (S.waist || []).slice(-1)[0];
  var prev = (S.waist || []).slice(-2)[0];
  wh += "<div class='panel wst'><div class='pnum'><b>"
    + (w ? w[1] + "<small>cm</small>" : "&mdash;")
    + "</b><span>" + (w ? "measured " + esc(nice(w[0])) : "not measured yet") + "</span></div>";
  if (w && prev && prev[1] !== w[1]){
    var dlt = w[1] - prev[1];
    wh += "<p class='fine " + (dlt < 0 ? "good" : "") + "'>"
      + (dlt < 0 ? "Down " + Math.abs(dlt).toFixed(1) : "Up " + dlt.toFixed(1))
      + "cm since " + esc(nice(prev[0])) + ".</p>";
  }
  wh += "<p class='fine'>Not the scale. On this plan your weight is meant to rise, so the waist is "
    + "the number that answers what you actually asked.</p>"
    + "<div class='btns'><button class='btn' data-waist='1'>Measure</button></div></div>";

  h += "<div class='btns'><button class='btn quiet' data-go='../docs/train.html'>The whole plan, on paper</button></div>";
  h += fold("waist", "Waist", w ? w[1] + "cm \u00b7 " + esc(nice(w[0])) : "not measured yet", wh, false);
  return h;
}

/* ==================================================================== body
   Gym and food, in the one place. The point of this tab is that he should
   never have to remember a number: what he lifted last time decides what to
   lift today, and what he has eaten decides what to order next.

   He has an SpLD around short-term memory and told me so. Everything here is
   built on the assumption that anything not written down is gone. */

function kg(){ return Number(S.kg) > 0 ? Number(S.kg) : KG_DEFAULT; }
function proteinTarget(){ return Math.round(1.8 * kg()); }















/* --------------------------------------------------------------- the food */
function foodOn(k){ return (S.food || {})[k] || []; }
function proteinOn(k){
  return foodOn(k).reduce(function(a, f){ return a + Number(f[1] || 0); }, 0);
}
function anchorDone(k, slot){
  return foodOn(k).some(function(f){ return f[2] === slot; });
}
function logFood(name, grams, slot){
  var k = today();
  S.food = S.food || {};
  S.food[k] = foodOn(k).concat([[String(name).slice(0, 60), Number(grams) || 0, slot || "any"]]);
  save();
  var left = proteinTarget() - proteinOn(k);
  buzz(12); sfx(left <= 0 ? "done" : "tick");
  toast(left <= 0 ? "Protein done for today." : num(left) + "g to go.");
  render({ keepScroll: true });
}
function undoFood(){
  var k = today(), list = foodOn(k);
  if (!list.length) return;
  list.pop(); S.food[k] = list; save(); sfx("untick");
  render({ keepScroll: true });
}
/* The order that best closes the gap, rather than the biggest one. */
function suggestOrder(slot){
  var left = proteinTarget() - proteinOn(today());
  if (left <= 0) return null;
  var pool = ORDERS.filter(function(o){ return o[2] === "any" || o[2] === slot; });
  if (!pool.length) pool = ORDERS;
  var best = pool[0], gap = Math.abs(pool[0][1] - left);
  pool.forEach(function(o){
    var g = Math.abs(o[1] - left);
    if (g < gap){ gap = g; best = o; }
  });
  return best;
}

/* -------------------------------------------------------------- the lifts */
function liftDays(){ return Object.keys(S.lifts || {}).sort(); }
/* Sessions that count. Today counts only once he has finished it, which does
   two things: the stage cannot change under his feet halfway through a
   workout, and the moment it does change is the moment he pressed Finish -
   so the ceremony and the panel agree with each other. */
function sessionsDone(){
  return liftDays().filter(function(k){
    if (!Object.keys(S.lifts[k].ex || {}).length) return false;
    return k !== today() || !!day(k).p.train;
  }).length;
}
function stageAt(n){
  var s = STAGES[0];
  STAGES.forEach(function(x){ if (n >= x[0]) s = x; });
  return s;
}
function stage(){ return stageAt(sessionsDone()); }
function nextStage(){
  var n = sessionsDone();
  for (var i = 0; i < STAGES.length; i++) if (STAGES[i][0] > n) return STAGES[i];
  return null;
}
/* The exercises this stage actually shows, in programme order. */
function stageLifts(sKey){
  var s = sessionFor(sKey);
  return s ? s[1].slice(0, stage()[2]) : [];
}
function sessionFor(key){
  return SESSIONS.filter(function(s){ return s[0] === key; })[0];
}
/* A to B to C and round again, from whatever was logged last. */
function nextSessionKey(){
  var ks = liftDays();
  for (var i = ks.length - 1; i >= 0; i--){
    var s = S.lifts[ks[i]].s;
    var at = SESSIONS.map(function(x){ return x[0]; }).indexOf(s);
    if (at >= 0) return SESSIONS[(at + 1) % SESSIONS.length][0];
  }
  return "A";
}
function todaySession(){
  var e = (S.lifts || {})[today()];
  return e ? e.s : null;
}
function lastLift(name){
  var ks = liftDays();
  for (var i = ks.length - 1; i >= 0; i--){
    var ex = S.lifts[ks[i]].ex || {};
    if (ex[name] && ex[name].r && ex[name].r.length) return ex[name];
  }
  return null;
}
/* ------------------------------------------------- reading what he actually did
   The old rule knew one move: if every set hit the top of the range, add one
   notch off a load-scaled table. That has no answer for the three things that
   actually happen. Twenty reps when the range tops out at ten - the weight is
   light, and one notch will still leave it light. Four reps when the range
   starts at eight - he is buried, and "add a rep wherever you can" is the
   worst thing to tell him. And three sessions at the same weight and the same
   reps, which is a stall, and stalls are where people quit.

   So it reads the history instead of the last line of it. */
function liftHistory(name, n){
  var ks = liftDays(), out = [];
  for (var i = ks.length - 1; i >= 0 && out.length < n; i--){
    var e = (S.lifts[ks[i]].ex || {})[name];
    if (e && e.r && e.r.length){
      out.push({ k: ks[i], w: Number(e.w) || 0, r: e.r.map(Number) });
    }
  }
  return out;                                  /* newest first */
}
function lowRep(h){ return Math.min.apply(null, h.r); }
function topRep(h){ return Math.max.apply(null, h.r); }
function sumReps(h){ return h.r.reduce(function(a, b){ return a + b; }, 0); }

/* Epley, capped at fifteen reps because above that it stops describing
   anything real. Capping biases every estimate low, which is the right
   direction to be wrong in when the answer is a weight he is going to put
   over his chest. */
function e1rm(w, reps){ return w * (1 + Math.min(reps, 15) / 30); }
function loadFor(max, reps){ return max / (1 + reps / 30); }

/* Gym kit comes in 2.5kg plates and 2kg dumbbells, not in decimals. */
function roundLoad(w){
  if (w >= 20) return Math.round(w / 2.5) * 2.5;
  if (w >= 10) return Math.round(w);
  return Math.round(w * 2) / 2;
}
/* The smallest change worth making at a given load. */
function minInc(w){ return w >= 20 ? 2.5 : w >= 10 ? 1 : 0.5; }
function deloadFrom(w){
  var d = roundLoad(w * 0.9);
  if (d >= w) d = roundLoad(w - stepFor(w));
  return Math.max(stepFor(w), d);
}

function nextTarget(ex, name){
  name = name || ex[0];
  var setsWant = stage()[3], lo = ex[2], hi = ex[3];
  var H = liftHistory(name, 3);

  if (!H.length){
    /* A blank is the worst thing to hand someone standing at a machine, so
       every loaded movement opens on a number. It is a starting point, not a
       prescription - the rule underneath it is the one in the next sentence. */
    var open = START[name];
    return { first: true, w: open || null, tag: "to start",
             say: (open ? "Start around " + open + "kg. " : "")
                + "You should finish the first set feeling you had two or three more in you." };
  }

  var last = H[0], worst = lowRep(last), best = topRep(last);
  /* Judged on the movement actually being done, not on the slot's default -
     swapping to the leg press was still telling him to find a dumbbell. */
  var doing = name.toLowerCase();
  var how = (doing.indexOf("dumbbell") >= 0 || doing.indexOf("goblet") >= 0
             || doing.indexOf("farmer") >= 0 || doing.indexOf("carry") >= 0)
          ? "Or the next dumbbell up." : "Or the next notch up.";

  /* CLEARED IT. The jump is sized from what he actually lifted rather than off
     a fixed table: the weight that should put the worst of those sets back at
     the bottom of the range. It comes out gentler than a flat step on a heavy
     machine and larger on a light one, which is the point. Never more than a
     fifth up in one session, whatever the arithmetic says. */
  if (last.r.length >= setsWant && worst >= hi){
    var want = loadFor(e1rm(last.w, worst), lo);
    var up = roundLoad(Math.min(want, last.w * 1.2));
    /* Slots with a fixed rep count (3 x 10, no window) have nothing to convert,
       so the estimate lands back on the same weight. They get the smallest
       honest bump instead of a step off the dial table - one notch of that
       table is ten kilos at the top, which is a sixth of the load. */
    if (up <= last.w){
      up = roundLoad(Math.max(last.w * 1.05, last.w + minInc(last.w)));
    }
    return { w: up, reps: lo, tag: "x " + lo,
      say: worst >= hi + 3
        ? worst + " reps on every set when the range stops at " + hi + " means the weight is "
          + "light, not that you are ready for one more notch. " + up + "kg, back to " + lo + "."
        : "Every set at " + hi + ". Up to " + up + "kg"
          + (lo < hi ? ", back to " + lo : "") + ". " + how };
  }

  /* BURIED. Short of the bottom of the range. Once is a bad day; twice at the
     same weight is the weight, and backing off is the programme working. */
  if (best < lo){
    if (H[1] && H[1].w === last.w && topRep(H[1]) < lo){
      var down = deloadFrom(last.w);
      return { w: down, reps: lo, tag: "ease off",
        say: "Two sessions short of " + lo + " at " + last.w + "kg. Down to " + down
           + "kg and build it back - that is the plan working, not you failing." };
    }
    return { w: last.w, reps: lo, tag: "x " + lo,
      say: "Short of " + lo + " last time. Same " + last.w + "kg, and " + lo
         + " on the first set is the whole job." };
  }

  /* STALLED. Three sessions at one weight with no more total reps than the
     first of them. Backing off ten per cent and running it up again beats
     grinding, and swapping the movement is a real answer too. */
  if (H.length >= 3 && H[1].w === last.w && H[2].w === last.w
      && sumReps(last) <= sumReps(H[2])){
    var back = deloadFrom(last.w);
    return { w: back, reps: lo, tag: "ease off",
      say: "Three sessions at " + last.w + "kg without adding a rep. Down to " + back
         + "kg and run it back up, or swap the movement with the arrows." };
  }

  /* IN THE RANGE. Hold and chase reps, and name the set that is holding it. */
  return { w: last.w, reps: null, tag: "add a rep",
    say: "Stay at " + last.w + "kg. Add a rep wherever you can \u2014 "
       + worst + " is the set to beat." };
}
/* Which variant he is using in a slot. Stored per slot, so swapping to the
   hack squat sticks until he swaps back, and each variant keeps its own
   history - a leg press and a goblet squat are not the same number, and
   averaging them would make the progression advice nonsense. */
function slotId(sKey, i){ return sKey + ":" + i; }
function pickFor(sKey, i){
  var ex = sessionFor(sKey)[1][i];
  var chosen = (S.liftPick || {})[slotId(sKey, i)];
  if (!chosen) return ex[0];
  if (chosen === ex[0] || (ex[5] || []).indexOf(chosen) >= 0) return chosen;
  return ex[0];                       /* a variant I later renamed or removed */
}
function swapNames(ex){ return [ex[0]].concat(ex[5] || []); }

function askSwap(sKey, i){
  var ex = sessionFor(sKey)[1][i], cur = pickFor(sKey, i);
  ask({
    title: "Swap the movement",
    say: "Same job, different kit. Whichever is free is the right one &mdash; a busy rack "
       + "is not a reason to go home. Each keeps its own weights.",
    options: swapNames(ex).map(function(n){
      var last = lastLift(n);
      return { id: n, label: n + (n === cur ? "  (using)" : ""),
               note: last ? "last " + last.w + "kg" : (n === ex[0] ? "the default" : "not tried yet") };
    }),
    cancel: "Keep " + cur
  }).then(function(v){
    if (!v || v === "__no") return;
    S.liftPick = S.liftPick || {};
    S.liftPick[slotId(sKey, i)] = v;
    save(); sfx("tap"); buzz(10);
    render({ keepScroll: true });
  });
}

function loggedToday(name){
  var e = (S.lifts || {})[today()];
  return e && e.ex ? e.ex[name] : null;
}

/* ------------------------------------------------------------------ rest
   Rest between sets is part of the programme, not a detail: two minutes on a
   heavy compound is what makes the next set heavy too, and thirty seconds is
   why a session stops working. So it is written down per exercise, shown on
   the row before he opens anything, and there is a clock.

   The clock outlives the sheet on purpose. He closes it, does the set, and the
   countdown is still there above the nav - resting is exactly when the phone
   goes back in a pocket. It survives a reload too (the service worker can
   restart the app under him), because it is an end time in localStorage rather
   than a number counting down in memory. */
var REST_KEY = "daylight.rest";
var REST_TICK = null, REST_WAS = 0;

function restOf(ex){ return (ex && ex[6]) || 90; }

function restLeft(){
  var until = 0;
  try { until = Number(localStorage.getItem(REST_KEY) || 0); } catch(e){}
  if (!until) return 0;
  var left = Math.ceil((until - Date.now()) / 1000);
  if (left <= 0){ try { localStorage.removeItem(REST_KEY); } catch(e){} return 0; }
  return left;
}
function restClock(n){
  var m = Math.floor(n / 60), r = n % 60;
  return m + ":" + (r < 10 ? "0" : "") + r;
}
function restStart(secs){
  try { localStorage.setItem(REST_KEY, String(Date.now() + secs * 1000)); } catch(e){}
  REST_WAS = secs;
  buzz(10); sfx("tick");
  restPaint(); restSync();
}
function restStop(quiet){
  try { localStorage.removeItem(REST_KEY); } catch(e){}
  REST_WAS = 0;
  if (!quiet) sfx("tap");
  restPaint(); restSync();
}
/* The interval only exists while something is actually counting. */
function restSync(){
  var live = restLeft() > 0;
  if (live && !REST_TICK) REST_TICK = setInterval(restPaint, 250);
  if (!live && REST_TICK){ clearInterval(REST_TICK); REST_TICK = null; }
}
function restPaint(){
  var el = document.getElementById("rest");
  if (!el) return;
  var left = restLeft();
  if (left <= 0){
    if (REST_WAS > 0){
      REST_WAS = 0;
      buzz([30, 70, 30, 70, 50]); sfx("done");
      toast("Rest is up. Next set.");
    }
    el.className = ""; el.innerHTML = "";
    restBtnPaint(0);
    restSync();
    return;
  }
  REST_WAS = left;
  /* One clock at a time. While the sheet is open it carries the countdown on
     its own button, and the floating bar sits exactly where that button is -
     two of them in the same place, one on top of the other. The bar is for
     after he closes it, which is when he actually needs it. */
  if (MODAL || ST || SESSION){
    el.className = ""; el.innerHTML = "";
    restBtnPaint(left);
    return;
  }
  el.className = "on" + (left <= 10 ? " soon" : "");
  el.innerHTML = "<span class='rb-l'>Rest</span>"
    + "<b class='rb-n mono'>" + restClock(left) + "</b>"
    + "<button class='rb-x' data-restskip='1'>Skip</button>";
  restBtnPaint(left);
}
/* The sheet keeps its own copy of the clock, written directly rather than by
   re-rendering: a full repaint four times a second would fight his thumb. */
function restBtnPaint(left){
  var sb = document.getElementById("ssRest");
  if (sb && SESSION){
    sb.textContent = left > 0 ? "Resting \u00b7 " + restClock(left) : "Rested. Next set when you are.";
    sb.className = "ssrest" + (left > 0 ? " going" : " done");
  }
  var b = document.getElementById("lfRest");
  if (!b || !LIFT) return;
  b.textContent = left > 0
    ? "Resting \u00b7 " + restClock(left)
    : "Start " + restClock(LIFT.rest) + " rest";
  b.className = "lfrest" + (left > 0 ? " going" : "");
}

/* A jump has to match the kit: two kilos is a sensible step on a dumbbell and
   meaningless on a leg press. Shared by the suggestion and by the + button, so
   they can never disagree about what one notch is. */
function stepFor(w){
  return w >= 60 ? 10 : w >= 30 ? 5 : w >= 15 ? 2.5 : w >= 8 ? 2 : 1;
}

/* The free-text parser went with the field it served. Nothing types a lift
   any more, so there is no string to be forgiving about. */

var LIFT = null;

function liftRow(label, value, unit, kind, i){
  return "<div class='lfr'>"
    + "<span class='lfl'>" + esc(label) + "</span>"
    + "<button class='lfb' data-lf='" + kind + ":-1:" + i + "' aria-label='Less'>&minus;</button>"
    + "<span class='lfv'>" + value + (unit ? "<i>" + unit + "</i>" : "") + "</span>"
    + "<button class='lfb' data-lf='" + kind + ":1:" + i + "' aria-label='More'>+</button>"
    + "</div>";
}

function paintLift(){
  var L = LIFT, body = document.getElementById("lfBody");
  if (!L || !body) return;
  var h = "<label>Weight</label>";
  h += liftRow("Load", L.w, "kg", "w", 0);
  h += "<label>Reps &middot; " + L.r.length + (L.r.length === 1 ? " set" : " sets")
     + (L.r.length > L.sets ? " &middot; " + (L.r.length - L.sets) + " extra" : "") + "</label>";
  L.r.forEach(function(n, i){
    h += liftRow("Set " + (i + 1), n, "", "r", i);
  });
  /* The stage prescribes a number of sets; it has never been a ceiling. If he
     has another one in him it should cost one tap, not a shrug. */
  h += "<div class='lfset'>"
    + "<button data-lf='add:0:0'>+ Add a set</button>"
    + (L.r.length > 1 ? "<button data-lf='del:0:0'>Remove set " + L.r.length + "</button>" : "")
    + "</div>";
  h += "<label>Rest between sets</label>";
  h += "<button id='lfRest' class='lfrest' data-lf='rest:0:0'></button>";
  body.innerHTML = h;
  restBtnPaint(restLeft());
}

function askLift(sKey, idx){
  var s = sessionFor(sKey); if (!s) return;
  var ex = s[1][idx]; if (!ex) return;
  var sets = stage()[3];
  var name = pickFor(sKey, idx);
  var t = nextTarget(ex, name), had = loggedToday(name);

  /* Where the dials start. The stage prescribes a number of sets, but if he
     chose to do more last time then that is the shape of this exercise for him
     now, so it opens on that. And when the weight is holding, the job is to
     beat last session's reps - so the rep dials open on last session's reps,
     set by set, rather than on the bottom of the range. */
  var prev = liftHistory(name, 1)[0];
  var w0 = had ? had.w : (t.w || 0);
  var want = had ? had.r.length : Math.max(sets, prev ? prev.r.length : 0);
  var holding = !t.reps && prev && prev.w === w0;
  var r0 = [];
  for (var i = 0; i < want; i++){
    if (had && had.r[i] != null){ r0.push(had.r[i]); continue; }
    if (holding && prev.r[i] != null){ r0.push(prev.r[i]); continue; }
    r0.push(t.reps || ex[2]);
  }
  LIFT = { w: w0, r: r0, sKey: sKey, name: name, sets: sets, rest: restOf(ex) };

  var el = document.getElementById("modal");
  el.innerHTML = "<div class='mw'><div class='grab'></div>"
    + "<h3>" + esc(name) + "</h3>"
    + "<p class='say'>" + esc(ex[4]) + " &middot; " + sets + " sets of "
    + (ex[2] === ex[3] ? ex[2] : ex[2] + "-" + ex[3])
    + "<br><b>" + esc(t.say) + "</b></p>"
    + "<div id='lfBody' class='lf'></div>"
    + "<div class='btns'><button class='btn pri' data-lf='ok:0:0'>Log it</button>"
    + "<button class='btn quiet' data-lf='no:0:0'>Not this one</button></div></div>";
  el.className = "on";
  document.body.style.overflow = "hidden";
  paintLift();
  sfx("tap");

  function close(){
    if (!MODAL) return;
    MODAL = null; LIFT = null;
    el.className = ""; el.innerHTML = "";
    document.body.style.overflow = "";
  }
  MODAL = { close: close };

  el.onclick = function(ev){
    if (ev.target === el){ close(); return; }
    var b = ev.target.closest ? ev.target.closest("[data-lf]") : null;
    if (!b) return;
    ev.stopPropagation();
    var p = b.dataset.lf.split(":"), kind = p[0], dir = Number(p[1]), at = Number(p[2]);
    if (kind === "no"){ sfx("tap"); close(); return; }
    if (kind === "ok"){
      var reps = LIFT.r.filter(function(n){ return n > 0; });
      if (!reps.length){ sfx("no"); toast("At least one set with reps in it."); return; }
      var k = today();
      S.lifts = S.lifts || {};
      S.lifts[k] = S.lifts[k] || { s: sKey, ex: {} };
      S.lifts[k].s = sKey;
      S.lifts[k].ex[LIFT.name] = { w: LIFT.w, r: reps };
      save(); buzz(14); sfx("tick");
      close();
      render({ keepScroll: true });
      return;
    }
    if (kind === "add"){
      LIFT.r.push(LIFT.r[LIFT.r.length - 1] || ex[2]);
      buzz(8); sfx("tap"); paintLift(); return;
    }
    if (kind === "del"){
      if (LIFT.r.length > 1) LIFT.r.pop();
      buzz(8); sfx("untick"); paintLift(); return;
    }
    if (kind === "rest"){
      if (restLeft() > 0) restStop(); else restStart(LIFT.rest);
      return;
    }
    if (kind === "w"){
      /* One notch is whatever a notch is at this load, and stepping down uses
         the step for the weight below so 30 -> 27.5 rather than 30 -> 25. */
      var st = dir > 0 ? stepFor(LIFT.w) : stepFor(Math.max(0, LIFT.w - 0.5));
      LIFT.w = Math.max(0, Math.round((LIFT.w + dir * st) * 2) / 2);
    } else if (kind === "r"){
      LIFT.r[at] = Math.max(0, Math.min(60, (Number(LIFT.r[at]) || 0) + dir));
    }
    buzz(6); sfx("tap");
    paintLift();
  };
}

/* Ending the session is what marks Trained, and one exercise is enough to
   count. The ten-minute rule is the whole reason this survives a bad day. */
function finishSession(){
  var t = today(), d = day(t);
  if (d.p.train){ toast("Already marked."); return; }
  var before = stage();
  var btn = document.querySelector("[data-finish]");
  tapPillar("train", btn);
  /* Marking Trained is what makes today count, so the stage is re-read after
     it. Announced late so it does not compete with the pillar's own fanfare. */
  setTimeout(function(){
    var after = stage();
    if (after !== before){
      celebrate(after[1], after[4]);
      render({ keepScroll: true });
    }
  }, reduced() ? 0 : 1500);
}

function askWaist(){
  var last = (S.waist || []).slice(-1)[0];
  ask({
    title: "Waist",
    say: "Tape at the navel, before you eat, same time each week. <b>This is the number that "
       + "answers your actual question</b> &mdash; it can fall while your weight rises.",
    field: { label: "Centimetres", value: last ? String(last[1]) : "", placeholder: "84", type: "number" },
    confirm: "Save", cancel: "Cancel"
  }).then(function(v){
    if (v === null || v === "__no") return;
    var n = Number(String(v).replace(/[^0-9.]/g, ""));
    if (!(n > 0)) return;
    S.waist = (S.waist || []).concat([[today(), n]]);
    save(); sfx("done"); buzz(16);
    toast("Waist logged.");
    render({ keepScroll: true });
  });
}

function askFoodOther(slot){
  ask({
    title: "Something else",
    say: "Roughly how much protein? A palm of meat or fish is about 25g.",
    field: { label: "What, and grams", value: "", placeholder: "Chicken salad 30", type: "text" },
    confirm: "Add", cancel: "Cancel"
  }).then(function(v){
    if (v === null || v === "__no") return;
    var m = String(v).match(/(\d+)/);
    if (!m) { toast("Give me a number of grams."); return; }
    var name = String(v).replace(/\s*\d+\s*g?\s*$/i, "").trim() || "Something";
    logFood(name, Number(m[1]), slot);
  });
}

/* ------------------------------------------------------------------ view */


/* Which anchor we are plausibly in, so the suggestion fits the hour. */
function nowSlot(){
  var m = new Date().getHours() * 60 + new Date().getMinutes();
  if (m < 12 * 60) return "morning";
  if (m < 16 * 60) return "midday";
  return "dinner";
}

/* Tapping an anchor offers what fits that slot, plus a way out. */
function askAnchor(slot){
  var pool = ORDERS.filter(function(o){ return o[2] === "any" || o[2] === slot; });
  var a = ANCHORS.filter(function(x){ return x[0] === slot; })[0];
  ask({
    title: a ? a[1] : "Add food",
    say: "Tap what you had. The number is protein, roughly.",
    options: pool.map(function(o){
      return { id: o[0], label: o[0], note: o[1] + "g" };
    }).concat([{ id: "__other", label: "Something else", note: "Type it" }]),
    cancel: "Cancel"
  }).then(function(v){
    if (v === null || v === "__no") return;
    if (v === "__other"){ askFoodOther(slot); return; }
    var o = ORDERS.filter(function(x){ return x[0] === v; })[0];
    if (o) logFood(o[0], o[1], slot);
  });
}


/* ------------------------------------------------------------- progress
   Is it working. Sessions a week for the last eight weeks, the best lift on
   the two movements that matter most to what he asked for, and the waist -
   read as a trend, not a number. */
function weekKeyOf(k){
  var d = new Date(k + "T00:00:00"), dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return iso(d);
}
function sessionsByWeek(n){
  var out = [], d = new Date(), dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow - 7 * (n - 1));
  var done = liftDays().filter(function(k){ return Object.keys(S.lifts[k].ex || {}).length; });
  for (var i = 0; i < n; i++){
    var wk = iso(d);
    out.push([wk, done.filter(function(k){ return weekKeyOf(k) === wk; }).length]);
    d.setDate(d.getDate() + 7);
  }
  return out;
}
/* The best across every variant of a slot, not just the one he is using
   now - a chest press machine PB is still his chest. */
function bestOf(names){
  var best = null;
  (Array.isArray(names) ? names : [names]).forEach(function(name){
    liftHistory(name, 60).forEach(function(h){
      var e = e1rm(h.w, topRep(h));
      if (!best || e > best.e) best = { e: e, w: h.w, r: topRep(h), k: h.k, name: name };
    });
  });
  return best;
}
function gymProgressHTML(){
  var weeks = sessionsByWeek(8), total = weeks.reduce(function(a, w){ return a + w[1]; }, 0);
  if (!total) return "";
  var h = "<div class='rulehead'><h3>Is it working</h3><span></span><em>8 weeks</em></div>";
  h += "<div class='wk7 gw'>";
  weeks.forEach(function(w, i){
    var n = w[1], on = n >= 3;
    h += "<div class='w7" + (on ? " on" : "") + (i === weeks.length - 1 ? " now" : "") + "'>"
      + "<span class='w7b'><i style='height:" + Math.max(4, Math.min(100, Math.round(n / 3 * 100))) + "%'></i></span>"
      + "<b>" + n + "</b><span class='w7d'>" + (i === weeks.length - 1 ? "now" : "w" + (i + 1)) + "</span></div>";
  });
  h += "</div>";
  var press = bestOf(swapNames(sessionFor("A")[1][1])), pull = bestOf(swapNames(sessionFor("B")[1][1]));
  var pressN = press ? press.name : "", pullN = pull ? pull.name : "";
  var ws = S.waist || [], w0 = ws[0], w1 = ws[ws.length - 1];
  h += facts([
    [press ? press.w + "kg" : "\u2014", press ? "best " + pressN.toLowerCase().split(" ")[0] : "chest", press ? "on" : ""],
    [pull ? pull.w + "kg" : "\u2014", pull ? "best " + pullN.toLowerCase().split(" ")[0] : "back", pull ? "on" : ""],
    [w1 ? (w0 && w0 !== w1 ? (w1[1] - w0[1] > 0 ? "+" : "") + (w1[1] - w0[1]).toFixed(1) + "cm" : w1[1] + "cm") : "\u2014",
     "waist", w1 && w0 && w1[1] < w0[1] ? "on" : ""]
  ]);
  h += "<p class='fine'>Three a week is the line. Strength is the estimated best on the chest and "
    + "back movements; waist is the change since the first measurement.</p>";
  return h;
}

/* ------------------------------------------------------------- how-to */
function askHow(sKey, idx){
  var ex = sessionFor(sKey)[1][idx], name = pickFor(sKey, idx);
  var steps = howFor(name, ex);
  tell(name, "<ol class='how'>" + steps.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>"
    + "<p class='fine'>" + esc(ex[4]) + " &middot; " + restClock(restOf(ex)) + " between sets.</p>");
}

/* ============================================================ the session
   One thing at a time. Warm up, then each movement in turn: what it is, how
   to do it, what to lift, a dial for the set, and the rest clock started for
   him the moment he taps Set done. Every set is written to the day's record
   as it happens, so a dropped phone loses nothing; the session itself is in
   S.sess so a reload lands him back where he was. */
var SESSION = null;

function startSession(key){
  var t = today();
  if (S.sess && S.sess.day === t && S.sess.key === key){
    SESSION = S.sess;
  } else {
    SESSION = S.sess = { day: t, key: key, i: 0, set: 0, warm: 0, started: Date.now(), extra: {} };
    save();
  }
  var el = document.getElementById("session");
  el.className = "on";
  document.body.style.overflow = "hidden";
  paintSession();
}
function closeSession(){
  var el = document.getElementById("session");
  if (el){ el.className = ""; el.innerHTML = ""; }
  document.body.style.overflow = "";
  SESSION = null;
  restPaint();
  render({ keepScroll: true });
}
function sessionList(){ return stageLifts(SESSION.key); }
function sessionSetsFor(name, ex){
  var extra = (SESSION.extra || {})[name] || 0;
  return stage()[3] + extra;
}
function sessionLogged(name){
  var e = (S.lifts || {})[SESSION.day];
  return e && e.ex && e.ex[name] ? e.ex[name] : null;
}

function paintSession(){
  var el = document.getElementById("session");
  if (!el || !SESSION) return;
  var list = sessionList(), n = list.length;
  var h = "<div class='ss'>";
  h += "<div class='sstop'><button class='ssx' data-sclose='1' aria-label='Leave'>&times;</button>"
    + "<span class='ssk'>Session " + SESSION.key + "</span>"
    + "<span class='ssp'>" + (SESSION.warm ? Math.min(SESSION.i + 1, n) + " of " + n : "warm-up") + "</span></div>";

  if (!SESSION.warm){
    h += "<div class='sshero'><div class='ssk2'>Before anything</div><h2>Warm up</h2>"
      + "<p>Five minutes of easy cardio &mdash; bike, rower, brisk walk on the treadmill. Then two "
      + "light sets of the first movement to find the weight. Not to failure. Not even close.</p></div>";
    h += "<div class='ssbig'>" + (restLeft() > 0
      ? "<div id='ssRest' class='ssrest going'>Warming up \u00b7 " + restClock(restLeft()) + "</div>"
      : "<button class='btn' data-sswarm='1'>Start a five-minute clock</button>") + "</div>";
    h += "<div class='btns'><button class='btn pri big' data-swarmdone='1'>Warm. Start the first movement</button></div>";
    h += "</div>";
    el.innerHTML = h;
    return;
  }

  if (SESSION.i >= n){ paintSummary(el); return; }

  var ex = list[SESSION.i], name = pickFor(SESSION.key, SESSION.i);
  var t = nextTarget(ex, name), had = sessionLogged(name);
  var sets = sessionSetsFor(name, ex), setNo = (had ? had.r.length : 0);
  var doneAll = setNo >= sets;
  var w = SESSION.w != null && SESSION.wFor === name ? SESSION.w : (had ? had.w : (t.w || 0));
  var reps = SESSION.r != null && SESSION.rFor === name ? SESSION.r
           : (had && had.r.length ? had.r[had.r.length - 1] : (t.reps || ex[2]));
  SESSION.w = w; SESSION.wFor = name; SESSION.r = reps; SESSION.rFor = name;

  h += "<div class='sshero'><div class='ssk2'>Movement " + (SESSION.i + 1) + " of " + n
    + " &middot; " + esc(ex[4]) + "</div><h2>" + esc(name) + "</h2>"
    + "<p class='sstarget'>" + esc(t.say) + "</p>"
    + "<div class='ssacts'><button class='btn quiet' data-how='" + SESSION.key + ":" + SESSION.i + "'>How to do it</button>"
    + "<button class='btn quiet' data-sswap='" + SESSION.i + "'>Swap the machine</button></div></div>";

  /* the sets so far, as pills */
  h += "<div class='sssets'>";
  for (var k = 0; k < sets; k++){
    var got = had && had.r[k] != null ? had.r[k] : null;
    h += "<span class='sspill" + (got != null ? " on" : k === setNo ? " now" : "") + "'>"
      + (got != null ? got : (k + 1)) + "</span>";
  }
  h += "<button class='sspill add' data-saddset='1' aria-label='Add a set'>+</button></div>";

  if (!doneAll){
    h += "<label class='sslab'>Set " + (setNo + 1) + " &middot; " + (t.w ? "" : "pick a weight, ") + "how many did you do</label>";
    h += "<div class='lf'>"
      + liftRow("Load", w, "kg", "sw", 0)
      + liftRow("Reps", reps, "", "sr", 0)
      + "</div>";
    h += "<div id='ssRest' class='ssrest" + (restLeft() > 0 ? " going" : "") + "'>"
      + (restLeft() > 0 ? "Resting \u00b7 " + restClock(restLeft()) : "") + "</div>";
    h += "<div class='btns'><button class='btn pri big' data-ssetdone='1'>Set " + (setNo + 1) + " done</button></div>";
  } else {
    h += "<div id='ssRest' class='ssrest done'>All " + sets + " sets in. " + esc(had.w) + "kg &middot; "
      + had.r.join(" \u00b7 ") + "</div>";
    h += "<div class='btns'><button class='btn pri big' data-snext='1'>"
      + (SESSION.i + 1 < n ? "Next movement" : "Finish the session") + "</button></div>";
  }
  h += "<div class='btns tight'><button class='btn quiet' data-sskip='1'>Skip this one</button></div>";
  h += "</div>";
  el.innerHTML = h;
}

function paintSummary(el){
  var list = sessionList(), h = "<div class='ss'>";
  h += "<div class='sstop'><button class='ssx' data-sclose='1' aria-label='Leave'>&times;</button>"
    + "<span class='ssk'>Session " + SESSION.key + "</span><span class='ssp'>done</span></div>";
  h += "<div class='sshero'><div class='ssk2'>That is the session</div><h2>Turned up. Lifted. Logged.</h2></div>";
  h += "<div class='recs'>";
  list.forEach(function(ex, i){
    var name = pickFor(SESSION.key, i), had = sessionLogged(name);
    h += "<div class='rec'><span class='rd'>" + (i + 1) + "</span><span class='rt'>" + esc(name) + "</span>"
      + "<b class='rv'>" + (had ? had.w + "kg \u00b7 " + had.r.join(",") : "skipped") + "</b></div>";
  });
  h += "</div>";
  h += "<div class='btns'><button class='btn pri big' data-sfinish='1'>Finish &mdash; mark Trained</button></div>";
  h += "<p class='fine' style='text-align:center'>Next time the app already knows what to suggest.</p>";
  h += "</div>";
  el.innerHTML = h;
}

/* the taps */
function sessionTap(ds, b){
  if (!SESSION) return false;
  var list = sessionList(), ex = list[SESSION.i], name = ex ? pickFor(SESSION.key, SESSION.i) : null;
  if (ds.sclose){ sfx("tap"); closeSession(); return true; }
  if (ds.sswarm){ restStart(300); paintSession(); return true; }
  if (ds.swarmdone){ SESSION.warm = 1; restStop(true); save(); sfx("tick"); buzz(10); paintSession(); return true; }
  if (ds.lf !== undefined){
    var p = ds.lf.split(":"), kind = p[0], dir = Number(p[1]);
    if (kind === "sw"){
      var st = dir > 0 ? stepFor(SESSION.w) : stepFor(Math.max(0, SESSION.w - 0.5));
      SESSION.w = Math.max(0, Math.round((SESSION.w + dir * st) * 2) / 2);
    } else if (kind === "sr"){
      SESSION.r = Math.max(0, Math.min(60, (Number(SESSION.r) || 0) + dir));
    } else return false;
    buzz(6); sfx("tap"); save(); paintSession(); return true;
  }
  if (ds.saddset){
    SESSION.extra = SESSION.extra || {}; SESSION.extra[name] = (SESSION.extra[name] || 0) + 1;
    save(); sfx("tap"); paintSession(); return true;
  }
  if (ds.ssetdone){
    var k = SESSION.day;
    S.lifts = S.lifts || {};
    S.lifts[k] = S.lifts[k] || { s: SESSION.key, ex: {} };
    S.lifts[k].s = SESSION.key;
    var e = S.lifts[k].ex[name] || { w: SESSION.w, r: [] };
    e.w = SESSION.w; e.r.push(Number(SESSION.r) || 0);
    S.lifts[k].ex[name] = e;
    save(); buzz(14); sfx("tick");
    if (b) burst(b, "#8FE3B4");
    var setsNow = sessionSetsFor(name, ex);
    if (e.r.length < setsNow) restStart(restOf(ex));
    paintSession(); return true;
  }
  if (ds.snext || ds.sskip){
    restStop(true);
    SESSION.i++; SESSION.w = null; SESSION.r = null;
    save(); sfx(ds.snext ? "done" : "untick");
    paintSession(); return true;
  }
  if (ds.sswap){
    askSwap(SESSION.key, Number(ds.sswap));
    /* askSwap re-renders the tab under us; repaint the session when it closes */
    var iv = setInterval(function(){ if (!MODAL){ clearInterval(iv); SESSION.w = null; SESSION.r = null; paintSession(); } }, 200);
    return true;
  }
  if (ds.sfinish){
    var day0 = day(SESSION.day);
    S.sess = null; save();
    closeSession();
    if (!day0.p.train) finishSession();
    return true;
  }
  return false;
}

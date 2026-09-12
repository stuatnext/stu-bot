/* ===================================================================== gym
   Sessions, lifts and the waist. Nothing else - he asked for Body to be about
   the gym and nothing but, and he was right that a tab holding training, food,
   water and sleep at once was four subjects wearing one hat. */

function viewGym(){
  var t = today(), h = "";
  var p = gymPlan(), sit = p.sit, key = p.key;
  var st = stage(), nx = nextStage(), list = stageLifts(key);
  var doneN = 0;
  list.forEach(function(ex, i){ if (loggedToday(pickFor(key, i))) doneN++; });
  var doneS = sessionsDone(), mins = sessionMinutes(key);
  var resume = S.sess && S.sess.day === t;
  var trained = !!day(t).p.train, walked = walkedToday();
  var lifting = p.mode !== "rest" && p.mode !== "walk";

  /* The tab opens on the answer to "what do I train today", in the hero's
     own voice: the session and how long it takes, or the honest word for a
     day the programme does not want a session on. */
  var kicker, big, unit, line, pct = null, cta = null;
  if (p.mode === "rest"){
    kicker = "Today \u00b7 rest";
    big = "Rest"; unit = "";
    line = "Session " + (p.last || "A") + " was yesterday, and the day after is when it is built. "
         + "A walk makes Trained.";
    cta = trained ? null : { attr: "data-walk='1'", label: walked ? "Walked \u00b7 " + walked + " min" : "Walked \u2014 mark Trained" };
  } else if (p.mode === "walk"){
    kicker = "This week \u00b7 lifting done";
    big = p.week; unit = "/ 3 this week";
    pct = Math.min(100, Math.round(100 * p.week / 3));
    line = "Legs, a push and a pull all covered since Monday. A walk makes Trained; "
         + "a fourth session is allowed, not asked.";
    cta = trained ? null : { attr: "data-walk='1'", label: walked ? "Walked \u00b7 " + walked + " min" : "Walked \u2014 mark Trained" };
  } else if (p.mode === "travel"){
    kicker = "Travel session \u00b7 " + esc(sit.city);
    big = doneN; unit = "/ " + list.length;
    pct = Math.round(100 * doneN / Math.max(1, list.length));
    line = doneN === list.length ? "Every move logged. That is the session."
         : doneN ? "moves logged \u2014 " + (list.length - doneN) + " to go"
         : list.length + " moves \u00b7 ~" + mins + " min \u00b7 a room and your own weight";
    cta = { attr: "data-startsession='T'",
            label: resume ? "Resume today\u2019s session" : doneN ? "Continue the session" : "Start the travel session" };
  } else {
    kicker = "Session " + key + " \u00b7 " + esc(st[1]);
    big = doneN; unit = "/ " + list.length;
    pct = Math.round(100 * doneN / Math.max(1, list.length));
    line = doneN === list.length ? "Every move logged. That is the session."
         : doneN ? "moves logged \u2014 " + (list.length - doneN) + " to go"
         : list.length + " moves \u00b7 ~" + mins + " min \u00b7 " + trainWhen();
    cta = { attr: "data-startsession='" + key + "'",
            label: resume ? "Resume today\u2019s session" : doneN ? "Continue the session" : "Start the session" };
  }
  h += hero({
    tone: "iron", icon: "dumb", kicker: kicker,
    big: big, unit: unit, line: line, pct: pct,
    foot: doneS ? num(doneS) + (doneS === 1 ? " session" : " sessions") + " logged all time"
        : "Turning up is the thing being trained. One move counts.",
    foot2: waistFoot(),
    cta: cta
  });
  if (!doneS && !doneN && lifting){
    h += "<p class='fine' style='text-align:center;margin:-4px 0 12px'>It tells you what to do, "
      + "set by set, and times the rests.</p>";
  }

  /* Away, the two things he cannot look up in his own history. */
  if (!sit.home){
    h += "<div class='btns tight'>"
      + "<button class='btn quiet' data-near='gym'>Find a gym in " + esc(sit.city) + "</button>"
      + (p.mode === "travel"
          ? "<button class='btn quiet' data-gymhere='1'>There is a gym here</button>"
          : (gymHere() ? "<button class='btn quiet' data-gymhere='0'>Back to the travel session</button>" : ""))
      + "</div>";
  }

  if (!lifting){
    /* A rest or walk day shows no list: the answer is not a list. The session
       stays one tap away, because the app suggests and he decides. */
    var names = stageLifts(p.key).map(function(x){ return x[0].toLowerCase(); }).join(", ");
    h += fold("nextmoves", "When you do lift", "Session " + p.key,
      "<p class='fine' style='margin:2px 0 10px'>" + esc(names) + ".</p>"
      + "<div class='btns'><button class='btn quiet' data-startsession='" + p.key + "'>"
      + "Lift anyway \u2014 Session " + p.key + "</button></div>", false);
  } else {
    h += "<div class='rulehead'><h3>" + (p.mode === "travel" ? "In the room" : "Today\u2019s moves")
      + "</h3><span></span>"
      + "<em>" + (doneN ? doneN + " of " + list.length + " logged" : "next up") + "</em></div>";

    /* The programme's own level used to sit here in a fold, repeating what the
       hero already says. What it alone knew - the next unlock - is one line. */
    if (nx && p.mode !== "travel"){
      h += "<p class='fine' style='margin:-2px 0 8px'>" + (nx[0] - doneS) + " more "
        + (nx[0] - doneS === 1 ? "session" : "sessions") + " unlocks <b>" + esc(nx[1]) + "</b>.</p>";
    }

    if (!doneN && !doneS){
      h += "<p class='fine' style='margin:0 0 10px'>Tap a move to log it. ? is how to do it, "
        + "&#8646; swaps the machine.</p>";
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
        + " &middot; " + stage()[3] + " x " + (ex[2] === ex[3] ? ex[2] : ex[2] + "-" + ex[3])
        + " &middot; " + restClock(restOf(ex)) + " rest</span></span>"
        + "<span class='lv'>" + (had
            ? kgOr(had.w) + "<em>" + had.r.join(" &middot; ") + "</em>"
            : (t2.w ? t2.w + "kg<em>" + esc(t2.tag || "") + "</em>"
                    : BODYWEIGHT[name] ? "body<em>" + esc(t2.tag || "") + "</em>"
                    : "<span class='new'>new</span>")) + "</span></button>";
      h += "<button class='swap' data-how='" + key + ":" + i + "' aria-label='How to do " + esc(name) + "'>" + svg("ask", 18) + "</button>"
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
  }

  /* the finisher: easy minutes after the lifts, from the third visit. A row
     that is not a move - no number, never counted, the first thing to skip */
  var fm = finMinutes(), ft = finToday();
  if (fm > 0 && lifting && key !== "T"){
    var onName = ft ? finLabel(ft.on) : finLabel(lastFinOn() || "Bike");
    h += "<div class='liftrow finrow'>"
      + "<button class='lift fin" + (ft ? " on" : "") + "' data-fin='1'>"
      + "<span class='lb2'><b>Finisher</b><span>" + esc(onName)
      + " &middot; " + (ft ? ft.min : fm) + " min &middot; talking pace</span></span>"
      + "<span class='lv'>" + (ft ? "in<em>" + ft.min + " min</em>" : fm + "<em>min</em>") + "</span></button>"
      + "<button class='swap' data-finwhy='1' aria-label='Why the finisher'>" + svg("ask", 18) + "</button></div>";
  }
  /* the question he actually asked, one tap away where he looks for the ab work */
  h += "<div class='btns tight bellywhy'><button class='btn quiet' data-finwhy='1'>"
    + "Why no crunches &mdash; and where the belly comes in</button></div>";

  if ((doneN || ft) && lifting){
    var already = day(t).p.train;
    h += "<div class='btns'><button class='btn" + (already ? " quiet" : " pri") + "' data-finish='1'>"
      + (already ? "Trained is marked" : "Finish &mdash; mark Trained") + "</button></div>";
  }

  /* --- the waist: the number that answers his actual question, read slowly.
     On a Sunday with no reading yet it stands open under the lifts; every
     other day it is a closed fold, and the hero carries the one-line read. */
  var ws = waistSorted(), w = ws[ws.length - 1], tr = waistTrend(), due = waistDue();
  var wh = "<div class='panel wst'><div class='pnum'><b>"
    + (w ? w[1] + "<small>cm</small>" : "&mdash;")
    + "</b><span>" + (w ? "measured " + esc(nice(w[0])) : "not measured yet") + "</span></div>";
  wh += "<p class='fine" + (tr && tr.dir === "down" ? " good" : "") + "'>" + esc(waistLine(tr, ws)) + "</p>";
  wh += "<p class='fine'>Not the scale \u2014 your weight is allowed to rise. Expect nothing here for "
    + "eight weeks; a centimetre every two months after that is winning.</p>"
    + "<div class='btns'><button class='btn' data-waist='1'>Measure</button></div></div>";

  h += gymProgressHTML();
  if (due){
    h += "<div class='rulehead'><h3>Tape day</h3><span></span><em>Sunday</em></div>"
      + "<p class='fine' style='margin:-2px 0 8px'>Navel, before you eat, same tape as last week.</p>" + wh;
  } else {
    h += fold("waist", "Waist", waistMeta(ws, tr), wh, false);
  }
  h += "<div class='btns'><button class='btn quiet' data-go='../docs/train.html'>The whole plan, on paper</button></div>";
  return h;
}

/* ==================================================================== lifts
   The point of this tab is that he should never have to remember a number:
   what he lifted last time decides what to lift today. (The food helpers
   that used to sit here moved to food.js, which owns them.)

   He has an SpLD around short-term memory and told me so. Everything here is
   built on the assumption that anything not written down is gone. */

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
  if (key === "T") return TRAVEL;
  return SESSIONS.filter(function(s){ return s[0] === key; })[0];
}
/* TRAVEL is deliberately not in SESSIONS: nextSessionKey looks the last letter
   up in that array, so a fortnight of hotel rooms leaves A - B - C exactly
   where he left it. */

/* ==================================================================== the plan
   "When I go to the gym app, I want to know exactly what to train." Before
   this the tab proposed the next letter of the rotation every single day,
   including the morning after a session and the fourth time in a week - so
   the honest answer to his question was sometimes "not this".

   Five answers, in this order, all derived from what is in the record:
     done    - the lifts are already logged today
     walk    - three sessions since Monday; the week's lifting is done
     rest    - he lifted yesterday, and the day after is when it is built
     travel  - he is not in Singapore and has not said there is a gym here
     session - the next letter, which is the normal answer
   None of them is a refusal: a session is always one tap away underneath. */
function liftsOn(k){
  var e = (S.lifts || {})[k];
  return !!(e && Object.keys(e.ex || {}).length);
}
function sessionsThisWeek(){
  if (typeof weekKey !== "function") return 0;
  return weekDays(weekKey()).filter(liftsOn).length;
}
/* Roughly how long it takes, so the hero can answer "have I got time". */
function sessionMinutes(key){
  var list = stageLifts(key), sets = stage()[3], m = 5;
  list.forEach(function(ex){ m += sets * 0.75 + (sets - 1) * restOf(ex) / 60; });
  if (key !== "T") m += finMinutes();
  return Math.max(10, Math.round(m / 5) * 5);
}
function gymHere(){
  var sit = situation();
  return !!(S.gymHere && S.gymHere === sit.city);
}
function gymPlace(){
  var sit = situation();
  return sit.home ? "24/7 Tanjong Pagar" : sit.city;
}
function gymPlan(){
  var t = today(), sit = situation();
  if (liftsOn(t)) return { mode: "done", key: todaySession() || nextSessionKey(), sit: sit };
  var wk = sessionsThisWeek();
  if (wk >= 3) return { mode: "walk", key: nextSessionKey(), week: wk, sit: sit };
  if (liftsOn(shift(-1))) return { mode: "rest", key: nextSessionKey(),
                                   last: (S.lifts[shift(-1)] || {}).s, sit: sit };
  if (!sit.home && !gymHere()) return { mode: "travel", key: "T", sit: sit };
  return { mode: "session", key: nextSessionKey(), sit: sit };
}
/* When today's training fits, in his own shift's words. */
function trainWhen(){
  var sh = shape();
  if (sh.noShift) return "No shift today. Earlier is more day.";
  if (sh.now < sh.start) return "Before Malta wakes at " + sh.startT + " \u00b7 " + dur(sh.start - sh.now) + " of yours";
  if (sh.working) return "Malta is on until " + sh.endT + ". Twenty minutes still counts.";
  return "Malta is closed. A short one now, or tomorrow before " + sh.startT + ".";
}
/* The one instruction, for the Today card, the pillar row and the brief. */
function gymAsk(){
  var p = gymPlan(), n = stageLifts(p.key).length, mins = sessionMinutes(p.key);
  var cta = { tab: "gym", label: p.mode === "travel" ? "Open the travel session" : "Open Session " + p.key };
  if (p.mode === "done"){
    var got = stageLifts(p.key).filter(function(ex, i){ return loggedToday(pickFor(p.key, i)); }).length;
    return { ask: "Session " + p.key + " is logged.", sub: got + " of " + n + " moves in. Mark Trained on the Gym tab.",
             row: "Session " + p.key + " \u00b7 " + got + " of " + n + " logged", cta: cta };
  }
  if (p.mode === "walk")
    return { ask: "Three in. Walk today.", sub: "Legs, a push and a pull all covered since Monday.",
             row: "Three sessions in this week \u2014 a walk is Trained" };
  if (p.mode === "rest")
    return { ask: "Rest day. Walk it.", sub: "Session " + p.last + " was yesterday. Session " + p.key + " tomorrow.",
             row: "Rest day \u2014 a walk is Trained" };
  if (p.mode === "travel")
    return { ask: "Travel session, " + mins + " min.", sub: p.sit.city + " \u00b7 the room is the gym. " + n + " moves, no kit.",
             row: "Travel session \u00b7 " + n + " moves \u00b7 ~" + mins + " min", cta: cta };
  return { ask: "Train. Session " + p.key + ", " + mins + " min.",
           sub: n + " moves \u00b7 " + trainWhen(),
           row: "Session " + p.key + " \u00b7 " + n + " moves \u00b7 ~" + mins + " min", cta: cta };
}
/* The same plan in the brief's voice, for today or tomorrow. */
function gymWords(k, key){
  var t = today();
  if (k === t){
    var p = gymPlan(), n = stageLifts(p.key).length;
    if (p.mode === "rest") return "Rest day \u2014 a walk is Trained";
    if (p.mode === "walk") return "Lifting done for the week \u2014 walk";
    if (p.mode === "travel") return "Travel session, " + n + " moves, ~" + sessionMinutes("T") + " min";
    return "Session " + p.key + ", " + n + " moves, ~" + sessionMinutes(p.key) + " min";
  }
  if (liftsOn(t)) return "Rest day \u2014 a walk is Trained";
  if (sessionsThisWeek() >= 3 && typeof weekKey === "function" && weekKeyOf(k) === weekKey())
    return "Lifting done for the week \u2014 walk";
  var sit = situation();
  var kk = (!sit.home && !gymHere()) ? "T" : (key || nextSessionKey());
  var nn = stageLifts(kk).length;
  return (kk === "T" ? "Travel session, " : "Session " + kk + ", ") + nn + " moves, ~" + sessionMinutes(kk) + " min";
}
/* A walk is Trained and always has been; before v39 there was nowhere to say
   so, so a rest day looked like a day the app had nothing for. */
function askWalk(btn){
  ask({
    title: "A walk",
    say: "Twenty minutes is a tick. Forty is the walk. It has always counted.",
    options: [{ id: "20", label: "20 minutes", note: "a tick" },
              { id: "40", label: "40 minutes", note: "the walk", pri: true },
              { id: "60", label: "An hour or more", note: "the long one" }],
    cancel: "Not today"
  }).then(function(v){
    if (!v || v === "__no") return;
    S.walks = S.walks || {};
    S.walks[today()] = Number(v);
    save();
    if (!day(today()).p.train) tapPillar("train", btn || document.querySelector("[data-walk]"));
    else { toast("Walked. " + v + " minutes on the record."); render({ keepScroll: true }); }
  });
}
function walkedToday(){ return Number((S.walks || {})[today()]) || 0; }
function walksIn(n){
  var out = 0, d = new Date();
  for (var i = 0; i < n; i++){ if ((S.walks || {})[iso(d)]) out++; d.setDate(d.getDate() - 1); }
  return out;
}

/* ------------------------------------------------------------ the finisher
   Easy minutes after the lifts, from the stage table's sixth column. It lives
   on the day's record as a sibling of ex, so nothing that counts lifts - the
   stage, the rotation, the PB search, the week's challenges - ever sees it.
   Never a move, never needed for Trained, the first thing to skip. */
function finMinutes(){ return stage()[5] || 0; }
function finToday(){ var e = (S.lifts || {})[today()]; return e && e.fin ? e.fin : null; }
function lastFinOn(){
  var ks = liftDays();
  for (var i = ks.length - 1; i >= 0; i--){
    var f = S.lifts[ks[i]].fin;
    if (f && f.on && f.on !== "any") return f.on;
  }
  return null;
}
function finLabel(id){
  var f = FINISHERS.filter(function(x){ return x[0] === id; })[0];
  return f ? f[1] : "Five minutes";
}
function logFinisher(min, on, key, dayKey){
  var k = dayKey || today();
  S.lifts = S.lifts || {};
  S.lifts[k] = S.lifts[k] || { s: key || todaySession() || nextSessionKey(), ex: {} };
  S.lifts[k].fin = { min: min, on: on };
  save(); buzz(14); sfx("tick");
}
/* One modal is the whole entry surface, from the row on the tab: which
   machine, or the five-minute floor. The overlay's Done logs without asking. */
function askFinisher(){
  var min = finMinutes(); if (!min) return;
  var had = finToday(), last = lastFinOn(), pick = had ? had.on : (last || "Bike");
  ask({
    title: "Finisher",
    say: min + " easy minutes after the lifts. Talking pace \u2014 a sentence, not a song. "
       + "It never gets harder; the lifts do.",
    options: FINISHERS.map(function(f){
      return { id: f[0], label: f[1], note: f[2], pri: pick === f[0] };
    }).concat([{ id: "any", label: "Five minutes, then left", note: "still counts" }]),
    cancel: had ? "Keep it" : "Not today"
  }).then(function(v){
    if (!v || v === "__no") return;
    logFinisher(v === "any" ? 5 : min, v);
    toast(v === "any" ? "Five minutes. That counts." : finLabel(v) + " \u00b7 " + min + " min. In.");
    render({ keepScroll: true });
  });
}
/* The question he actually asked, answered where he goes looking for the ab
   work. Six lines, from data.js, never auto-opened. */
function tellBelly(){
  tell("Where the belly comes in",
    "<ol class='how'>" + BELLY.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>");
}
/* A to B to C and round again, from whatever was logged last. */
function nextSessionKey(){
  var ks = liftDays();
  for (var i = ks.length - 1; i >= 0; i--){
    /* a finisher-only or walk-only day is a visit, not a session: it must not
       advance the rotation */
    if (!Object.keys(S.lifts[ks[i]].ex || {}).length) continue;
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

/* A load, or the word for not having one. Without this a hotel-room push-up
   reads "0kg" all the way through the copy. */
function kgOr(w){ return w ? w + "kg" : "body"; }
function nextTarget(ex, name){
  name = name || ex[0];
  var setsWant = stage()[3], lo = ex[2], hi = ex[3];
  var H = liftHistory(name, 3);

  /* Bodyweight: there is no dial to turn, so the progression is reps and then
     a harder variant. Every load branch below would otherwise compute a jump
     from zero and print nonsense. */
  if (BODYWEIGHT[name]){
    var last0 = H[0];
    if (!last0) return { first: true, w: 0, tag: "reps",
      say: "Bodyweight. Stop two reps short of failure \u2014 the number you are chasing is the reps." };
    var worst0 = lowRep(last0);
    if (last0.r.length >= setsWant && worst0 >= hi)
      return { w: 0, reps: hi, tag: "harder",
        say: "Every set at " + hi + ". Slow the lowering to three seconds, or take the harder version with the arrows." };
    return { w: 0, reps: null, tag: "add a rep",
      say: "Same again. Add a rep wherever you can \u2014 " + worst0 + " is the set to beat." };
  }

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
    say: "Stay at " + kgOr(last.w) + ". Add a rep wherever you can \u2014 "
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
var REST_TICK = null, REST_WAS = 0, REST_LAB = "";

function restOf(ex){ return (ex && ex[6]) || 90; }

/* The clock is stored as "endsAt:total" so a reload knows not just how long is
   left but how long it was, which is what the draining bar is drawn from. */
function restRaw(){
  var v = "";
  try { v = localStorage.getItem(REST_KEY) || ""; } catch(e){}
  return String(v).split(":");
}
function restTotal(){
  var n = Number(restRaw()[1]);
  return n > 0 ? n : (REST_WAS || 90);
}
function restLeft(){
  var until = Number(restRaw()[0] || 0);
  if (!until) return 0;
  var left = Math.ceil((until - Date.now()) / 1000);
  if (left <= 0){ try { localStorage.removeItem(REST_KEY); } catch(e){} return 0; }
  return left;
}
function restClock(n){
  var m = Math.floor(n / 60), r = n % 60;
  return m + ":" + (r < 10 ? "0" : "") + r;
}
function restStart(secs, label){
  REST_LAB = label || "";
  try { localStorage.setItem(REST_KEY, (Date.now() + secs * 1000) + ":" + secs + ":" + REST_LAB); } catch(e){}
  REST_WAS = secs;
  buzz(10); sfx("tick");
  restPaint(); restSync();
}
function restStop(quiet){
  try { localStorage.removeItem(REST_KEY); } catch(e){}
  REST_WAS = 0; REST_LAB = "";
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
  /* the label is read before restLeft() can clear the key at zero, so the end
     toast and the bar still know what just finished - and so does a reload */
  REST_LAB = restRaw()[2] || REST_LAB;
  var left = restLeft();
  if (left <= 0){
    if (REST_WAS > 0){
      REST_WAS = 0;
      buzz([30, 70, 30, 70, 50]); sfx("done");
      toast(REST_LAB ? REST_LAB + " done." : "Rest is up. Next set.");
    }
    el.className = ""; el.innerHTML = "";
    restBtnPaint(0);
    REST_LAB = "";
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
  el.innerHTML = "<span class='rb-l'>" + esc(REST_LAB || "Rest") + "</span>"
    + "<b class='rb-n mono'>" + restClock(left) + "</b>"
    + "<button class='rb-x' data-restskip='1'>Skip</button>";
  restBtnPaint(left);
}
/* The sheet keeps its own copy of the clock, written directly rather than by
   re-rendering: a full repaint four times a second would fight his thumb. */
function restBtnPaint(left){
  var sb = document.getElementById("ssRest");
  if (sb && SESSION){
    var tot = restTotal();
    sb.className = "ssrest" + (left > 0 ? " going" : " done");
    sb.style.setProperty("--rest", left > 0 ? (left / Math.max(1, tot)).toFixed(3) : "0");
    var lab = sb.querySelector("span");
    if (!lab){ sb.innerHTML = "<i></i><span></span>"; lab = sb.querySelector("span"); }
    lab.textContent = left > 0 ? (REST_LAB || "Resting") + " \u00b7 " + restClock(left)
      : (REST_LAB ? REST_LAB + " done." : "Rested. Next set when you are.");
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

/* ------------------------------------------------------------- the waist
   The number that answers his actual question, read slowly on purpose. A
   self-measured waist carries about a centimetre of noise, so the trend
   compares the mean of the two latest Sundays with the mean of the two
   nearest eight weeks earlier, and calls anything under a centimetre steady.
   A weekly delta would be the tape talking, not him. */
function waistSorted(){
  return (S.waist || []).slice().sort(function(a, b){ return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; });
}
function waistDue(){
  if (new Date().getDay() !== 0) return false;
  var wk = weekKeyOf(today());
  return !(S.waist || []).some(function(r){ return weekKeyOf(r[0]) === wk; });
}
function waistTrend(){
  var ws = waistSorted();
  if (ws.length < 4) return null;
  var latest = ws[ws.length - 1], d0 = new Date(latest[0] + "T00:00:00");
  /* readings from the eighth Sunday back and earlier: with weekly tapes the
     two pair-centres then sit eight weeks apart, which is what the copy says */
  var older = ws.filter(function(r){ return (d0 - new Date(r[0] + "T00:00:00")) / 86400000 >= 53; });
  if (older.length < 2) return null;
  var mean = function(a){ return (a[0][1] + a[1][1]) / 2; };
  var delta = mean(ws.slice(-2)) - mean(older.slice(-2));
  return { delta: delta, dir: delta <= -1 ? "down" : delta >= 1 ? "up" : "steady" };
}
function waistLine(tr, ws){
  if (!ws.length) return "Sunday morning, before you eat. One reading a week; the trend reads after ten.";
  if (ws.length < 4) return ws.length + " of 4 Sundays. The trend reads after ten.";
  if (!tr) return "Early days \u2014 the belly goes last. The trend reads after ten Sundays.";
  var x = Math.abs(tr.delta).toFixed(1);
  if (tr.dir === "down") return "Down " + x + "cm over eight weeks. That is it working.";
  if (tr.dir === "up") return "Up " + x + "cm over eight weeks. Weight up is the plan; waist up is not. "
    + "Keep the protein at three meals and give it two more Sundays before reading anything into it.";
  return "Steady over eight weeks. Under a centimetre is the tape, not you.";
}
function waistFoot(){
  var ws = waistSorted();
  if (!ws.length) return "The belly is measured on Sundays, not judged in the mirror.";
  var last = ws[ws.length - 1], tr = waistTrend(), tail;
  if (ws.length < 4) tail = ws.length + " of 4 Sundays";
  else if (!tr) tail = "early days, the belly goes last";
  else if (tr.dir === "steady") tail = "steady over eight weeks";
  else tail = tr.dir + " " + Math.abs(tr.delta).toFixed(1) + " over eight weeks"
    + (tr.dir === "up" ? " \u2014 weight up is the plan, the tape needs time" : "");
  return "Waist " + last[1] + "cm \u00b7 " + tail;
}
function waistMeta(ws, tr){
  if (!ws.length) return "not measured yet";
  var last = ws[ws.length - 1];
  if (tr) return last[1] + "cm \u00b7 " + (tr.dir === "steady" ? "steady"
    : (tr.delta > 0 ? "+" : "\u2212") + Math.abs(tr.delta).toFixed(1)) + " / 8 wks";
  return last[1] + "cm \u00b7 " + nice(last[0]);
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
  /* Eight weeks of turning up, as eight bars. It used to be eight tall blue
     capsules, which read as bottles of water on a gym screen; it is now one
     low iron chart, and it is folded away because it is history, not today. */
  var top = Math.max(3, weeks.reduce(function(m, w){ return Math.max(m, w[1]); }, 0));
  var inner = "<div class='gwk'>";
  weeks.forEach(function(w, i){
    var n = w[1], now = i === weeks.length - 1;
    inner += "<div class='gwb" + (n >= 3 ? " on" : "") + (now ? " now" : "") + "'>"
      + "<i style='height:" + Math.max(3, Math.round(n / top * 100)) + "%'></i>"
      + "<b>" + (now ? "now" : n) + "</b></div>";
  });
  inner += "</div>";

  var press = bestOf(swapNames(sessionFor("A")[1][1])), pull = bestOf(swapNames(sessionFor("B")[1][1]));
  var ws = waistSorted(), w0 = ws[0], w1 = ws[ws.length - 1];
  var bits = [];
  if (press) bits.push("chest " + press.w + "kg");
  if (pull) bits.push("back " + pull.w + "kg");
  /* the long view of the waist, in the same voice as the fold: under a
     centimetre is the tape, not him */
  if (w1){
    var wd = w0 && w0 !== w1 ? w1[1] - w0[1] : 0;
    bits.push("waist " + (Math.abs(wd) >= 1 ? (wd > 0 ? "+" : "\u2212") + Math.abs(wd).toFixed(1) + "cm"
      : (w0 && w0 !== w1 ? "steady" : w1[1] + "cm")));
  }
  var wlk = walksIn(56);
  if (wlk) inner += "<p class='fine'>" + wlk + (wlk === 1 ? " walk" : " walks") + " logged in the last eight weeks.</p>";
  inner += "<p class='fine'>Three a week is the line."
    + (bits.length ? " Best so far: " + bits.join(" · ") + "." : "") + "</p>";
  if (finMinutes() > 0){
    var sess = liftDays().filter(function(k){ return Object.keys(S.lifts[k].ex || {}).length; }).slice(-9);
    var withFin = sess.filter(function(k){ return !!S.lifts[k].fin; }).length;
    if (withFin) inner += "<p class='fine'>Finisher on " + withFin + " of the last " + sess.length + ".</p>";
  }

  var wk = weeks[weeks.length - 1][1];
  return fold("gymprog", "Is it working", wk + " this week", inner, false);
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
    + "<span class='ssk'>" + (SESSION.key === "T" ? "Travel session" : "Session " + SESSION.key) + "</span>"
    + "<span class='ssp'>" + (SESSION.warm ? Math.min(SESSION.i + 1, n) + " of " + n : "warm-up") + "</span></div>";

  if (!SESSION.warm){
    h += "<div class='sshero'><div class='ssk2'>Before anything</div><h2>Warm up</h2>"
      + "<p>Walked here? You are already warm &mdash; go straight to the two light sets. Otherwise five "
      + "minutes easy on a bike or rower, then two light sets of the first movement to find the weight. "
      + "Not to failure. Not even close.</p></div>";
    h += "<div class='ssbig'>" + (restLeft() > 0
      ? "<div id='ssRest' class='ssrest going' style='--rest:"
        + (restLeft() / Math.max(1, restTotal())).toFixed(3) + "'><i></i><span>Warm-up \u00b7 "
        + restClock(restLeft()) + "</span></div>"
      : "<button class='btn' data-sswarm='1'>Start a five-minute clock</button>") + "</div>";
    h += "<div class='btns'><button class='btn pri big' data-swarmdone='1'>Warm. Start the first movement</button></div>";
    h += "</div>";
    el.innerHTML = h;
    return;
  }

  if (SESSION.i >= n){
    var finDone = (S.lifts || {})[SESSION.day] && S.lifts[SESSION.day].fin;
    if (finMinutes() > 0 && !SESSION.fin && !finDone && SESSION.key !== "T"){ paintFinisher(el); return; }
    paintSummary(el); return;
  }

  var ex = list[SESSION.i], name = pickFor(SESSION.key, SESSION.i);
  var t = nextTarget(ex, name), had = sessionLogged(name);
  var sets = sessionSetsFor(name, ex), setNo = (had ? had.r.length : 0);
  var doneAll = setNo >= sets;
  var w = SESSION.w != null && SESSION.wFor === name ? SESSION.w : (had ? had.w : (t.w || 0));
  var reps = SESSION.r != null && SESSION.rFor === name ? SESSION.r
           : (had && had.r.length ? had.r[had.r.length - 1] : (t.reps || ex[2]));
  SESSION.w = w; SESSION.wFor = name; SESSION.r = reps; SESSION.rFor = name;

  h += "<div class='sshero'><div class='ssk2'>" + esc(ex[4]) + "</div><h2>" + esc(name) + "</h2>"
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
      + (BODYWEIGHT[name] ? "" : liftRow("Load", w, "kg", "sw", 0))
      + liftRow(BODYWEIGHT[name] && ex[2] >= 25 ? "Seconds" : "Reps", reps, "", "sr", 0)
      + "</div>";
    var rl = restLeft();
    h += "<div id='ssRest' class='ssrest" + (rl > 0 ? " going" : "") + "'"
      + " style='--rest:" + (rl > 0 ? (rl / Math.max(1, restTotal())).toFixed(3) : 0) + "'>"
      + "<i></i><span>" + (rl > 0 ? "Resting \u00b7 " + restClock(rl) : "") + "</span></div>";
    h += "<div class='btns'><button class='btn pri big' data-ssetdone='1'>Set " + (setNo + 1) + " done</button></div>";
  } else {
    h += "<div id='ssRest' class='ssrest done'><i></i><span>All " + sets + " sets in. "
      + esc(had.w) + "kg &middot; " + had.r.join(" \u00b7 ") + "</span></div>";
    h += "<div class='btns'><button class='btn pri big' data-snext='1'>"
      + (SESSION.i + 1 < n ? "Next movement" : "Finish the session") + "</button></div>";
  }
  h += "<div class='btns tight'><button class='btn quiet' data-sskip='1'>Skip this one</button></div>";
  h += "</div>";
  el.innerHTML = h;
}

/* The finisher step: after the last movement, before the summary, built from
   the warm-up step's parts. Done logs the machine he used last time (or the
   bike) in one tap - the row on the tab is where he changes it. Skipping
   costs nothing and the copy says so. */
function paintFinisher(el){
  var min = finMinutes(), on = lastFinOn() || "Bike";
  var h = "<div class='ss'>";
  h += "<div class='sstop'><button class='ssx' data-sclose='1' aria-label='Leave'>&times;</button>"
    + "<span class='ssk'>Session " + SESSION.key + "</span><span class='ssp'>last thing</span></div>";
  h += "<div class='sshero'><div class='ssk2'>Easy minutes</div><h2>Finisher</h2>"
    + "<p>" + min + " easy minutes on the bike, incline treadmill or rower. Talking pace \u2014 a "
    + "sentence, not a song. Phone out, podcast on. It never gets harder: the lifts get heavier, this "
    + "stays easy. Short on time? This is the thing to skip, never the first movement.</p></div>";
  var rl = restLeft();
  h += "<div class='ssbig'>" + (rl > 0
    ? "<div id='ssRest' class='ssrest going' style='--rest:" + (rl / Math.max(1, restTotal())).toFixed(3)
      + "'><i></i><span>Finisher \u00b7 " + restClock(rl) + "</span></div>"
    : "<button class='btn' data-sfinclock='1'>Start " + (min === 8 ? "an eight" : "a ten")
      + "-minute clock</button>") + "</div>";
  h += "<div class='btns'><button class='btn pri big' data-sfindone='1'>Done \u2014 "
    + esc(finLabel(on).toLowerCase()) + ", " + min + " min</button></div>";
  h += "<div class='btns tight'><button class='btn quiet' data-sfinskip='1'>Skip today</button></div>";
  h += "</div>";
  el.innerHTML = h;
}

function paintSummary(el){
  var list = sessionList(), h = "<div class='ss'>";
  h += "<div class='sstop'><button class='ssx' data-sclose='1' aria-label='Leave'>&times;</button>"
    + "<span class='ssk'>" + (SESSION.key === "T" ? "Travel session" : "Session " + SESSION.key)
    + "</span><span class='ssp'>done</span></div>";
  h += "<div class='sshero'><div class='ssk2'>That is the session</div><h2>Turned up. Lifted. Logged.</h2></div>";
  h += "<div class='recs'>";
  list.forEach(function(ex, i){
    var name = pickFor(SESSION.key, i), had = sessionLogged(name);
    h += "<div class='rec'><span class='rd'>" + (i + 1) + "</span><span class='rt'>" + esc(name) + "</span>"
      + "<b class='rv'>" + (had ? kgOr(had.w) + " \u00b7 " + had.r.join(",") : "skipped") + "</b></div>";
  });
  if (finMinutes() > 0 && SESSION.key !== "T"){
    var fe = (S.lifts || {})[SESSION.day], fin = fe && fe.fin ? fe.fin : null;
    h += "<div class='rec'><span class='rd'>+</span><span class='rt'>Finisher</span>"
      + "<b class='rv'>" + (fin ? esc(finLabel(fin.on)) + " \u00b7 " + fin.min + " min" : "skipped") + "</b></div>";
  }
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
  if (ds.sswarm){ restStart(300, "Warm-up"); paintSession(); return true; }
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
  if (ds.sfinclock){ restStart(finMinutes() * 60, "Finisher"); paintSession(); return true; }
  if (ds.sfindone){
    var onv = lastFinOn() || "Bike", mins = finMinutes();
    logFinisher(mins, onv, SESSION.key, SESSION.day);
    SESSION.fin = "done"; restStop(true); save();
    toast(finLabel(onv) + " \u00b7 " + mins + " min. Tap the row on the tab to change it.");
    paintSession(); return true;
  }
  if (ds.sfinskip){
    SESSION.fin = "skip"; restStop(true); save(); sfx("untick");
    toast("Skipped. The lifts were the session.");
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

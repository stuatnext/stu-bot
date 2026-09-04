/* ==================================================================== body
   Gym and food, in the one place. The point of this tab is that he should
   never have to remember a number: what he lifted last time decides what to
   lift today, and what he has eaten decides what to order next.

   He has an SpLD around short-term memory and told me so. Everything here is
   built on the assumption that anything not written down is gone. */

function kg(){ return Number(S.kg) > 0 ? Number(S.kg) : KG_DEFAULT; }
function proteinTarget(){ return Math.round(1.8 * kg()); }

/* ------------------------------------------------------------- the vitals
   Five basics, of which two were already being tracked. They compose into one
   score rather than five checkboxes, and none of them can break anything. */
function waterOn(k){ return Number((S.water || {})[k] || 0); }
function sleepOn(k){ return Number((S.sleep || {})[k] || 0); }
function outOn(k){ return !!(S.out || {})[k]; }

function vitalMet(key, k){
  if (key === "water")   return waterOn(k) >= WATER_GLASSES;
  if (key === "sleep")   return sleepOn(k) >= SLEEP_TARGET;
  if (key === "protein") return proteinOn(k) >= proteinTarget();
  if (key === "train")   return !!(S.days[k] && S.days[k].p && S.days[k].p.train);
  if (key === "out")     return outOn(k);
  return false;
}
function vitalsMet(k){
  return VITALS.filter(function(v){ return vitalMet(v[0], k); }).length;
}
/* A day where all five closed. Counted, never required. */
function clearDays(){
  var seen = {};
  Object.keys(S.water || {}).forEach(function(k){ seen[k] = 1; });
  Object.keys(S.sleep || {}).forEach(function(k){ seen[k] = 1; });
  Object.keys(S.days  || {}).forEach(function(k){ seen[k] = 1; });
  return Object.keys(seen).filter(function(k){ return vitalsMet(k) === VITALS.length; }).length;
}

function tapWater(n){
  var k = today(), was = waterOn(k);
  S.water = S.water || {};
  /* Tapping the glass you are already on empties it, so a mis-tap is one tap
     to undo rather than a trip through a menu. */
  S.water[k] = (was === n) ? n - 1 : n;
  if (S.water[k] <= 0) delete S.water[k];
  save();
  var now = waterOn(k);
  if (now > was){
    buzz(10);
    sfx(now >= WATER_GLASSES ? "done" : "tick");
    if (now === WATER_GLASSES) toast("Eight glasses. That is the day's water.");
  } else sfx("untick");
  render({ keepScroll: true });
}

function askSleep(){
  var k = today();
  ask({
    title: "Last night",
    say: "Hours actually asleep, roughly. Your shift ends late and this is the number "
       + "everything else is downstream of &mdash; including the headaches.",
    field: { label: "Hours", value: sleepOn(k) ? String(sleepOn(k)) : "", placeholder: "7.5", type: "number" },
    confirm: "Save", cancel: "Cancel"
  }).then(function(v){
    if (v === null || v === "__no") return;
    var n = Number(String(v).replace(/[^0-9.]/g, ""));
    if (!(n > 0) || n > 24) return;
    S.sleep = S.sleep || {};
    S.sleep[k] = n;
    save(); sfx("tick"); buzz(12);
    render({ keepScroll: true });
  });
}

function tapOut(){
  var k = today();
  S.out = S.out || {};
  if (S.out[k]){ delete S.out[k]; sfx("untick"); }
  else { S.out[k] = 1; sfx("tick"); buzz(12); }
  save();
  render({ keepScroll: true });
}

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
/* Double progression, which is the only progression rule he needs this year:
   hold the weight until every set reaches the top of the range, then add. */
function nextTarget(ex, name){
  var last = lastLift(name || ex[0]), sets = stage()[3];
  if (!last) return { first: true, say: "Pick something you could do two or three more than " + ex[2] + " with." };
  var allTop = last.r.length >= sets && last.r.every(function(n){ return n >= ex[3]; });
  if (allTop){
    /* A jump has to match the kit. Two kilos is a sensible step on a dumbbell
       and meaningless on a leg press, and the first version told him to find
       "the next dumbbell" while he was sitting on a machine. */
    var w = last.w;
    var step = w >= 60 ? 10 : w >= 30 ? 5 : w >= 15 ? 2.5 : w >= 8 ? 2 : 1;
    var up = Math.round((w + step) * 2) / 2;
    /* Judged on the movement actually being done, not on the slot's default -
       swapping to the leg press was still telling him to find a dumbbell. */
    var doing = (name || ex[0]).toLowerCase();
    var how = (doing.indexOf("dumbbell") >= 0 || doing.indexOf("goblet") >= 0
               || doing.indexOf("farmer") >= 0 || doing.indexOf("carry") >= 0)
            ? "Or the next dumbbell up." : "Or the next notch up.";
    return { w: up, reps: ex[2], say: "Up to " + up + "kg, back to " + ex[2] + ". " + how };
  }
  return { w: last.w, reps: null, say: "Stay at " + last.w + "kg. Add a rep wherever you can." };
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

/* One field, forgiving. "14 x 8,8,7" and "14 8 8 7" both work, and a single
   rep number is applied to every set - because typing three identical numbers
   at the end of a set is exactly the friction that stops people logging. */
function parseLift(text, sets){
  var nums = String(text || "").match(/\d+(\.\d+)?/g);
  if (!nums || !nums.length) return null;
  var w = Number(nums[0]);
  var reps = nums.slice(1).map(Number).filter(function(n){ return n > 0; });
  if (!reps.length) return null;
  while (reps.length < sets) reps.push(reps[reps.length - 1]);
  return { w: w, r: reps.slice(0, sets) };
}

function askLift(sKey, idx){
  var s = sessionFor(sKey); if (!s) return;
  var ex = s[1][idx]; if (!ex) return;
  var sets = stage()[3];
  var name = pickFor(sKey, idx);
  var t = nextTarget(ex, name), had = loggedToday(name);
  var pre = had ? had.w + "kg x " + had.r.join(",") : (t.w ? t.w + " x " : "");
  ask({
    title: name,
    say: esc(ex[4]) + " &middot; " + sets + " sets of " + (ex[2] === ex[3] ? ex[2] : ex[2] + "-" + ex[3])
       + "<br><b>" + esc(t.say) + "</b>",
    field: { label: "Weight and reps", value: pre, placeholder: "14 x 8,8,7", type: "number" },
    confirm: "Log it", cancel: "Not this one"
  }).then(function(v){
    if (v === null || v === "__no") return;
    var got = parseLift(v, sets);
    if (!got){ toast("Give me a weight and at least one rep count."); return; }
    var k = today();
    S.lifts = S.lifts || {};
    S.lifts[k] = S.lifts[k] || { s: sKey, ex: {} };
    S.lifts[k].s = sKey;
    S.lifts[k].ex[name] = got;
    save(); buzz(14); sfx("tick");
    render({ keepScroll: true });
  });
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
function viewBody(){
  var t = today(), h = "";
  var target = proteinTarget(), got = proteinOn(t);
  var pct = Math.min(100, Math.round(100 * got / target));
  var left = Math.max(0, target - got);

  /* --- the week first: it is the frame the day sits inside */
  h += questHTML();

  /* --- the day's condition, as one score rather than five checkboxes */
  var met = vitalsMet(t), clear = clearDays();
  h += "<div class='cond" + (met === VITALS.length ? " full" : "") + "'>"
    + "<div class='cring'>" + ring(met, VITALS.length, "gold") + "<b>" + met + "</b></div>"
    + "<div class='cbd'><h3>" + (met === VITALS.length ? "A clear day" : "Condition") + "</h3>"
    + "<span>" + met + " of " + VITALS.length + " basics closed"
    + (clear ? " &middot; " + num(clear) + " clear " + (clear === 1 ? "day" : "days") + " so far" : "")
    + "</span></div></div>";

  h += "<div class='vit'>";
  VITALS.forEach(function(v){
    var on = vitalMet(v[0], t);
    var act = v[0] === "water" ? "" : (v[0] === "sleep" ? " data-sleep='1'"
            : (v[0] === "out" ? " data-out='1'" : ""));
    var val = v[0] === "water"   ? waterOn(t) + "/" + WATER_GLASSES
            : v[0] === "sleep"   ? (sleepOn(t) ? sleepOn(t) + "h" : "&mdash;")
            : v[0] === "protein" ? num(proteinOn(t)) + "g"
            : v[0] === "train"   ? (on ? "done" : "&mdash;")
            : (on ? "yes" : "&mdash;");
    var tag = act ? "button" : "div";
    h += "<" + tag + " class='vc" + (on ? " on" : "") + "'" + act + ">"
      + "<span class='vv'>" + val + "</span>"
      + "<span class='vl'>" + esc(v[1]) + "</span></" + tag + ">";
  });
  h += "</div>";

  /* Water is eight taps, which is the whole reason it gets its own row. */
  var glasses = waterOn(t);
  h += "<div class='glass'>";
  for (var gi = 1; gi <= WATER_GLASSES; gi++){
    h += "<button class='gl" + (gi <= glasses ? " on" : "") + "' data-water='" + gi + "'"
      + " aria-label='Glass " + gi + "'><i></i></button>";
  }
  h += "</div>";
  var wsay = glasses >= WATER_GLASSES
      ? "That is roughly " + ((WATER_GLASSES * GLASS_ML) / 1000).toFixed(1) + " litres, before the kopi."
      : num(WATER_GLASSES - glasses) + " to go, about "
        + (((WATER_GLASSES - glasses) * GLASS_ML) / 1000).toFixed(1) + "L. Singapore is thirty degrees "
        + "all year and you eat once, so almost none of your water arrives with food. The honest "
        + "check is the colour, not the count.";
  h += "<p class='fine'>" + wsay + "</p>";

  /* --- protein */
  h += "<div class='panel prot" + (left === 0 ? " done" : "") + "'>"
    + "<div class='pnum'><b>" + num(got) + "</b><span>of " + num(target) + "g protein today</span></div>"
    + "<div class='pbar'><i style='width:" + pct + "%'></i></div>";
  var sug = suggestOrder(nowSlot());
  h += "<p class='fine'>" + (left === 0
      ? "Done. That is the single biggest lever in the whole plan, closed for today."
      : num(left) + "g to go" + (sug ? " &mdash; a " + esc(sug[0].toLowerCase()) + " would close it." : "."))
    + "</p></div>";

  /* --- the three anchors */
  h += "<div class='anch'>";
  ANCHORS.forEach(function(a){
    var on = anchorDone(t, a[0]);
    h += "<button class='an" + (on ? " on" : "") + "' data-slot='" + a[0] + "'>"
      + "<span class='ak'>" + esc(a[2]) + "</span>"
      + "<span class='av'>" + esc(a[1]) + "</span>"
      + "<span class='ad'>" + (on ? "logged" : "tap to add") + "</span></button>";
  });
  h += "</div>";

  if (foodOn(t).length){
    h += "<div class='recs'>";
    foodOn(t).slice().reverse().forEach(function(f){
      h += "<div class='rec'><span class='rd'>" + esc(f[2]) + "</span>"
        + "<span class='rt'>" + esc(f[0]) + "</span>"
        + "<b class='rv'>" + num(f[1]) + "g</b></div>";
    });
    h += "</div>";
    h += "<div class='btns tight'><button class='btn quiet' data-undofood='1'>Undo the last one</button></div>";
  }

  /* --- the session, at whatever stage he has unlocked */
  var open = todaySession(), key = open || nextSessionKey();
  var st = stage(), nx = nextStage(), list = stageLifts(key);
  var doneN = 0;
  list.forEach(function(ex, i){ if (loggedToday(pickFor(key, i))) doneN++; });

  h += "<div class='rulehead'><h3>Session " + key + "</h3><span></span>"
    + "<em>" + (doneN ? doneN + " of " + list.length + " logged" : "next up") + "</em></div>";

  /* Where the programme itself has got to, and what the next one costs. */
  var doneS = sessionsDone();
  h += "<div class='stg'>"
    + "<div class='sh'><b>" + esc(st[1]) + "</b>"
    + "<span>" + list.length + (list.length === 1 ? " move" : " moves")
    + " &middot; " + st[3] + " sets</span></div>"
    + "<p class='fine'>" + esc(st[4]) + "</p>";
  if (nx){
    var need = nx[0] - doneS, span = Math.max(1, nx[0] - st[0]);
    var pctS = Math.min(100, Math.round(100 * (doneS - st[0]) / span));
    h += "<div class='sbar'><i style='width:" + pctS + "%'></i></div>"
      + "<p class='fine'>" + need + " more " + (need === 1 ? "session" : "sessions")
      + " unlocks <b>" + esc(nx[1]) + "</b>.</p>";
  } else {
    /* The stage note already says nothing more is added, so this says the one
       thing it cannot: how many times he has turned up. */
    h += "<p class='fine'>" + num(doneS) + " sessions logged.</p>";
  }
  h += "</div>";

  if (!doneN && !doneS){
    h += "<p class='fine' style='margin:0 0 10px'>24/7 Fitness, Tanjong Pagar. Tap an exercise to "
      + "log it &mdash; the weight it suggests comes from what you did last time.</p>";
  }

  h += "<div class='lifts'>";
  list.forEach(function(ex, i){
    var name = pickFor(key, i);
    var had = loggedToday(name), t2 = nextTarget(ex, name);
    var swapped = name !== ex[0];
    h += "<div class='liftrow'>";
    h += "<button class='lift" + (had ? " on" : "") + "' data-lift='" + key + ":" + i + "'>"
      + "<span class='lb2'><b>" + esc(name) + "</b>"
      + "<span>" + esc(swapped ? "for " + ex[0].toLowerCase() : ex[4]) + "</span></span>"
      + "<span class='lv'>" + (had
          ? had.w + "kg<em>" + had.r.join(" &middot; ") + "</em>"
          : (t2.w ? t2.w + "kg<em>" + (t2.reps ? "x " + t2.reps : "add a rep") + "</em>"
                  : "<span class='new'>new</span>")) + "</span></button>";
    h += "<button class='swap' data-swap='" + key + ":" + i + "'"
      + " aria-label='Swap " + esc(name) + "'>&#8646;</button></div>";
  });
  h += "</div>";

  var held = sessionFor(key)[1].slice(list.length);
  if (held.length){
    h += "<div class='hold'>" + held.length + " more "
      + (held.length === 1 ? "move" : "moves") + " in this session, still sealed &mdash; "
      + esc(held.map(function(x){ return x[0].toLowerCase(); }).join(", ")) + ".</div>";
  }

  if (doneN){
    var already = day(t).p.train;
    h += "<div class='btns'><button class='btn" + (already ? " quiet" : " pri") + "' data-finish='1'>"
      + (already ? "Trained is marked" : "Finish &mdash; mark Trained") + "</button></div>";
    if (!already) h += "<p class='fine'>One exercise counts. Ten minutes counts. Turning up is the "
      + "thing you are training here.</p>";
  }

  /* --- waist */
  var w = (S.waist || []).slice(-1)[0];
  var prev = (S.waist || []).slice(-2)[0];
  h += "<div class='rulehead'><h3>Waist</h3><span></span><em>weekly</em></div>";
  h += "<div class='panel wst'><div class='pnum'><b>"
    + (w ? w[1] + "<small>cm</small>" : "&mdash;")
    + "</b><span>" + (w ? "measured " + esc(nice(w[0])) : "not measured yet") + "</span></div>";
  if (w && prev && prev[1] !== w[1]){
    var dlt = w[1] - prev[1];
    h += "<p class='fine " + (dlt < 0 ? "good" : "") + "'>"
      + (dlt < 0 ? "Down " + Math.abs(dlt).toFixed(1) : "Up " + dlt.toFixed(1))
      + "cm since " + esc(nice(prev[0])) + ".</p>";
  }
  h += "<p class='fine'>Not the scale. On this plan your weight is meant to rise &mdash; "
    + "the waist is the number that answers what you actually asked.</p>"
    + "<div class='btns'><button class='btn' data-waist='1'>Measure</button></div></div>";

  h += "<div class='btns'><button class='btn quiet' data-go='../docs/train.html'>"
    + "The whole plan, on paper</button></div>";
  return h;
}

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

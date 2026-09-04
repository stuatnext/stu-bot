/* ================================================================== basics
   Water, sleep and getting out of the flat, plus the week's challenges.

   He wanted hydration kept apart from the gym, and these belong with it: they
   are the floor of a day rather than a workout. Five basics compose into one
   score and none of them can break anything - the three pillars carry the
   streak, so being tired is never a fifth way to have failed. */

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
/* ------------------------------------------------------------------- view */
function viewBasics(){
  var t = today(), h = "";

  h += questHTML();

  var met = vitalsMet(t), clear = clearDays();
  h += "<div class='rulehead'><h3>Today</h3><span></span><em>five basics</em></div>";
  h += "<div class='cond" + (met === VITALS.length ? " full" : "") + "'>"
    + "<div class='cring'>" + ring(met, VITALS.length, "gold") + "<b>" + met + "</b></div>"
    + "<div class='cbd'><h3>" + (met === VITALS.length ? "A clear day" : "Condition") + "</h3>"
    + "<span>" + met + " of " + VITALS.length + " closed"
    + (clear ? " &middot; " + num(clear) + " clear " + (clear === 1 ? "day" : "days") + " so far" : "")
    + "</span></div></div>";

  h += "<div class='vit'>";
  VITALS.forEach(function(v){
    var on = vitalMet(v[0], t);
    var act = v[0] === "sleep" ? " data-sleep='1'" : (v[0] === "out" ? " data-out='1'" : "");
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

  h += "<div class='rulehead'><h3>Water</h3><span></span><em>"
    + ((WATER_GLASSES * GLASS_ML) / 1000).toFixed(1) + "L</em></div>";
  var glasses = waterOn(t);
  h += "<div class='glass'>";
  for (var gi = 1; gi <= WATER_GLASSES; gi++){
    h += "<button class='gl" + (gi <= glasses ? " on" : "") + "' data-water='" + gi + "'"
      + " aria-label='Glass " + gi + "'><i></i></button>";
  }
  h += "</div>";
  h += "<p class='fine'>" + (glasses >= WATER_GLASSES
      ? "That is roughly " + ((WATER_GLASSES * GLASS_ML) / 1000).toFixed(1) + " litres, before the kopi."
      : num(WATER_GLASSES - glasses) + " to go, about "
        + (((WATER_GLASSES - glasses) * GLASS_ML) / 1000).toFixed(1) + "L. Singapore is thirty degrees "
        + "all year and you eat once, so almost none of your water arrives with food. The honest "
        + "check is the colour, not the count.") + "</p>";
  return h;
}

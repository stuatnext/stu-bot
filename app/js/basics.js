/* ================================================================== basics
   The Water tab, and the five-basics model that Today summarises.

   The tab used to carry water, sleep, getting out, the condition ring and the
   week's challenges - which meant a hydration screen was showing him his
   protein, his gym sessions and how often he had called home. He asked for
   each tab to mind its own business, so it does: this screen is water and
   nothing else. The composite score and the challenges moved to Today, whose
   subject is the whole day rather than any one part of it.

   Five basics compose into one score and none of them can break anything -
   the three pillars carry the streak, so being tired is never a fifth way to
   have failed. */

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

/* Water's own history, so the tab has something to be about besides today's
   eight. Counted, never required - like everything else down here. */
function waterLast(days){
  var out = [], d = new Date();
  d.setDate(d.getDate() - (days - 1));
  for (var i = 0; i < days; i++){
    var k = iso(d);
    out.push([k, waterOn(k)]);
    d.setDate(d.getDate() + 1);
  }
  return out;
}
function waterHit(days){
  return waterLast(days).filter(function(x){ return x[1] >= WATER_GLASSES; }).length;
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
/* ------------------------------------------------- the day, for Today
   Five basics as one score, with sleep and getting out tappable where they
   are shown. This is a read on the whole day, so Today is where it belongs -
   it is the only screen whose subject is the day rather than one part of it. */
/* The header line when the five chips live inside a fold. */
function conditionMeta(){
  var t = today(), met = vitalsMet(t), clear = clearDays();
  return met + " of " + VITALS.length
    + (sleepOn(t) ? "" : " \u00b7 sleep?")
    + (clear ? " \u00b7 " + clear + " clear" : "");
}

/* ------------------------------------------------------------------- view
   Water. Only water. */
function viewBasics(){
  var t = today(), h = "";
  var gl = waterOn(t);
  var litres = ((gl * GLASS_ML) / 1000).toFixed(1);
  var full = ((WATER_GLASSES * GLASS_ML) / 1000).toFixed(1);
  var hit7 = waterHit(7);

  /* ------------------------------------------------------------ the room
     The bottle IS the tab. It was a thumbnail beside a paragraph with the
     eight marks and the week folded away behind two drawers, which is a
     settings page about drinking rather than a thing you drink from. Now it
     stands at the height of the screen, it is the tap target, and everything
     that was in a drawer is drawn underneath it where he can see it. */
  var level = Math.min(1, gl / WATER_GLASSES), top = 172 - level * 140;
  h += "<div class='stage water" + (gl >= WATER_GLASSES ? " full" : "") + "'>";
  h += "<button class='bt' data-water='" + Math.min(WATER_GLASSES, gl + 1) + "'"
    + " aria-label='Add a glass'" + (gl >= WATER_GLASSES ? " disabled" : "") + ">"
    + "<svg viewBox='0 0 100 200' aria-hidden='true'>"
    + "<defs><linearGradient id='waterGrad' x1='0' y1='0' x2='0' y2='1'>"
    + "<stop offset='0' stop-color='#7ED4FF'/><stop offset='1' stop-color='#1CB0F6'/></linearGradient>"
    + "<clipPath id='bodyClip'><path d='M32 34h36v10c8 6 14 16 14 28v98a12 12 0 0 1-12 12H30a12 12 0 0 1-12-12V72c0-12 6-22 14-28z'/></clipPath></defs>"
    + "<rect class='cap' x='34' y='14' width='32' height='22' rx='5'/>"
    + "<path class='glass-body' d='M32 34h36v10c8 6 14 16 14 28v98a12 12 0 0 1-12 12H30a12 12 0 0 1-12-12V72c0-12 6-22 14-28z'/>"
    + "<g clip-path='url(#bodyClip)'>"
    + "<rect class='liquid' x='0' y='" + top.toFixed(1) + "' width='100' height='200'/>"
    + (gl > 0 && gl < WATER_GLASSES
        ? "<path class='wave' d='M0 " + (top + 2).toFixed(1) + " q12 -6 25 0 t25 0 t25 0 t25 0 v8 H0z'/>" : "")
    + "</g>"
    + "<g class='ticks'>" + [1,2,3,4,5,6,7].map(function(i){ var y = 172 - i * 140 / 8;
        return "<line x1='20' y1='" + y + "' x2='28' y2='" + y + "'/>"; }).join("") + "</g>"
    + "</svg>"
    + "<span class='bt-n'>" + gl + "<small>/" + WATER_GLASSES + "</small></span>"
    + "</button>";
  h += "<div class='stage-l'>" + (gl >= WATER_GLASSES
      ? litres + "L. That is the day\u2019s water, before the kopi."
      : gameGoal("water") + " " + litres + "L of " + full + "L so far.") + "</div>";
  h += "<div class='stage-h'>" + (gl >= WATER_GLASSES ? "Done for today"
      : "Tap the bottle for a glass") + "</div>";

  /* the eight marks, on the page rather than behind a drawer: one tap fixes
     a mis-tap, which is the only reason they exist */
  h += "<div class='glass' aria-label='Glasses'>";
  for (var gi = 1; gi <= WATER_GLASSES; gi++){
    h += "<button class='gl" + (gi <= gl ? " on" : "") + "' data-water='" + gi + "'"
      + " aria-label='Glass " + gi + "'><i></i></button>";
  }
  h += "</div>";
  h += "</div>";

  /* What it pays, how long the run is, and how many of the five are in. The
     bottle IS the button here, so this game has no separate Start - it is
     the one mini game that is a single object with a single tap. */
  h += gameBar("water", "", "");

  /* the week, as seven bottles along the shelf - behind the one door, like
     every other tab's record. The start screen is the game; this is the
     cabinet you open afterwards. */
  var wk = "<div class='wk7'>";
  waterLast(7).forEach(function(row){
    var k = row[0], n = row[1], on = n >= WATER_GLASSES;
    var d = new Date(k + "T00:00:00");
    wk += "<div class='w7" + (on ? " on" : "") + (k === t ? " now" : "") + "'>"
      + "<span class='w7b'><i style='height:"
      + Math.max(5, Math.round(100 * Math.min(n, WATER_GLASSES) / WATER_GLASSES)) + "%'></i></span>"
      + "<b>" + n + "</b>"
      + "<span class='w7d'>" + "SMTWTFS"[d.getDay()] + "</span></div>";
  });
  wk += "</div><p class='fine'>Eight is the line. Missing it breaks nothing.</p>";
  h += drawers([ fold("waterweek", "The last week", hit7 + " of 7", wk, false) ]);
  return h;
}

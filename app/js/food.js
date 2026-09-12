/* ==================================================================== food
   Protein and the three eating occasions. Split out of Body because eating is
   not training: he asked for them apart, and he was right - one is a thing he
   does three times a day and the other is a thing he does three times a week.

   The diagnosis this exists to answer: no breakfast, no lunch, kopi through
   the day and one delivered meal at 23:30. About 30g of protein against a
   target near 130. Everything here is aimed at making there be three eating
   occasions instead of one. */

/* --------------------------------------------------------------- the food */
/* Always a list. A day written by an older build - or a hand-edited record -
   must not be able to take the screen down. */
function foodOn(k){ var v = (S.food || {})[k]; return Array.isArray(v) ? v : []; }

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
  /* One meal, not the whole day: aiming at the remaining gap meant that on an
     empty morning the app proposed the biggest thing on the list and printed
     "129g to go - a chicken rice does it", which was arithmetic nonsense. */
  var aim = Math.min(left, MEAL_CAP);
  var all = ordersNow();
  var own = all.filter(function(o){ return o[2] === slot; });
  var pool = own.length >= 2 ? own : all.filter(function(o){ return o[2] === "any" || o[2] === slot; });
  if (!pool.length) pool = all;
  var best = pool[0], gap = Math.abs(pool[0][1] - aim);
  pool.forEach(function(o){
    var g = Math.abs(o[1] - aim);
    if (g < gap){ gap = g; best = o; }
  });
  return best;
}

/* ==================================================================== when
   "When I go to the food app I want to know exactly what to eat and when."

   The three times used to be typed into the table - ~09:00, ~14:00, "Grab" -
   which was wrong for half the year in Singapore (the shift slides an hour in
   late October) and wrong every day of a trip. They are computed now, from
   when he wakes and where Malta's hours land on his clock.

   The third meal is the one this tab exists for: on a Singapore evening the
   shift runs to 23:00, so dinner goes INSIDE it, at eight, as a break rather
   than a delivery at half past eleven. */
var MEAL_GAP = 180, MEAL_CAP = 40;
function mealPlan(){
  var sh = shape(), sit = situation();
  var bed = t2m(S.bed || BED_DEFAULT);
  var m1 = sh.wake + 45, m2, m3;
  if (sh.noShift){
    m2 = Math.max(m1 + MEAL_GAP, 13 * 60);
    m3 = Math.max(m2 + MEAL_GAP, 19 * 60 + 30);
  } else {
    m3 = (sh.end + 30 <= 20 * 60) ? Math.max(sh.end + 30, 18 * 60) : 20 * 60;
    m2 = (sh.start - 60 >= m1 + MEAL_GAP) ? sh.start - 60
       : Math.round((m1 + m3) / 2 / 30) * 30;
    m2 = Math.max(m2, m1 + MEAL_GAP);
    m3 = Math.max(m3, m2 + MEAL_GAP);
  }
  m3 = Math.min(m3, bed - 90);
  if (m3 < m2 + 120) m3 = m2 + 120;
  var hotel = !sit.home && (sit.kind === "work" || sit.kind === "hq");
  var l1 = hotel ? "Hotel breakfast" : "First thing";
  var l2 = sh.noShift ? "Lunch"
         : m2 < sh.start ? "Before the shift"
         : m2 < sh.end ? "Mid-shift" : "Lunch, after the shift";
  var l3 = sh.noShift ? "Dinner"
         : m3 < sh.end ? "In the shift \u2014 a break, not a delivery"
         : m2 < sh.end ? "After the shift" : "Dinner";
  return [{ slot: "morning", label: l1, at: m1 },
          { slot: "midday",  label: l2, at: m2 },
          { slot: "dinner",  label: l3, at: m3 }];
}
/* Which anchor we are plausibly in - the midpoint between the meals, not a
   fixed clock split that knows nothing about the shift. */
function nowSlot(){
  var pl = mealPlan(), now = shape().now;
  if (now < (pl[0].at + pl[1].at) / 2) return "morning";
  if (now < (pl[1].at + pl[2].at) / 2) return "midday";
  return "dinner";
}
/* The next occasion he has not logged: the one to name. */
function nextMeal(){
  var pl = mealPlan(), t = today(), now = shape().now;
  var open = pl.filter(function(m){ return !anchorDone(t, m.slot); });
  if (!open.length) return null;
  var m = open[0];
  return { meal: m, late: now - m.at > 120,
           soon: now >= m.at || m.at - now <= 90,
           after: open[1] || null };
}
/* Twelve hawker dishes are no use in a Sheffield kitchen or a hotel with a
   menu. Three lists, one rule: where he is standing decides. */
function ordersNow(){
  var sit = situation();
  if (sit.kind === "home") return ORDERS;
  if (sit.kind === "family") return ORDERS_UK;
  return ORDERS_AWAY;
}
function ordersWord(){
  var sit = situation();
  return sit.kind === "home" ? "that close the gap"
       : sit.kind === "family" ? "in the UK" : "anywhere with a menu";
}
function mealLine(){
  var t = today(), left = Math.max(0, proteinTarget() - proteinOn(t));
  if (!left) return "Done for today.";
  var n = nextMeal();
  if (!n) return num(left) + "g short after three. A shake or a yoghurt closes it.";
  var o = suggestOrder(n.meal.slot);
  var what = o ? esc(o[0].toLowerCase()) + ", " + o[1] + "g. " : "";
  if (n.late)
    return "<b>Now</b> \u2014 you are past the " + hhmm(n.meal.at) + ". " + what
         + (n.after ? "Then " + hhmm(n.after.at) + " still stands." : num(left) + "g to go.");
  if (n.soon)
    return "<b>Now \u00b7 " + esc(n.meal.label) + "</b> \u2014 " + what + num(left) + "g to go.";
  return "<b>" + hhmm(n.meal.at) + " \u00b7 " + esc(n.meal.label) + "</b> \u2014 " + what + num(left) + "g to go.";
}

/* Tapping an anchor offers what fits that slot, plus a way out. */
function askAnchor(slot){
  var all = ordersNow();
  var pool = all.filter(function(o){ return o[2] === "any" || o[2] === slot; });
  var m = mealPlan().filter(function(x){ return x.slot === slot; })[0];
  var sug = suggestOrder(slot);
  ask({
    title: m ? m.label + " \u00b7 " + hhmm(m.at) : "Add food",
    say: "Tap what you had. The number is protein, roughly.",
    options: pool.map(function(o){
      return { id: o[0], label: o[0], note: o[1] + "g", pri: !!(sug && sug[0] === o[0]) };
    }).concat([{ id: "__other", label: "Something else", note: "Type it" }]),
    cancel: "Cancel"
  }).then(function(v){
    if (v === null || v === "__no") return;
    if (v === "__other"){ askFoodOther(slot); return; }
    var o = all.filter(function(x){ return x[0] === v; })[0];
    if (o) logFood(o[0], o[1], slot);
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

function proteinTarget(){ return Math.round(1.8 * kg()); }

function kg(){ return Number(S.kg) > 0 ? Number(S.kg) : KG_DEFAULT; }
/* ------------------------------------------------------------------- view */
function viewFood(){
  var t = today(), h = "";
  var target = proteinTarget(), got = proteinOn(t);
  var pct = Math.min(100, Math.round(100 * got / target));
  var left = Math.max(0, target - got);

  var plan = mealPlan(), sit = situation();
  /* The plate: one ring, one hue, the number in the middle. A single series
     needs no legend and the value wears ink, not green. */
  var R = 82, C = 2 * Math.PI * R, dash = (C * Math.min(1, got / target)).toFixed(1);
  h += "<div class='plate" + (left === 0 ? " done" : "") + "'>"
    + "<svg viewBox='0 0 200 200' aria-label='Protein today'>"
    + "<circle class='rim' cx='100' cy='100' r='" + R + "'/>"
    + "<circle class='rimx' cx='100' cy='100' r='" + (R - 12) + "'/>"
    + "<circle class='fill' cx='100' cy='100' r='" + R + "' transform='rotate(-90 100 100)'"
    + " stroke-dasharray='" + dash + " " + C.toFixed(1) + "'/></svg>"
    + "<div class='pc'><b>" + num(got) + "<small>/ " + num(target) + "g</small></b>"
    + "<span>protein today</span></div></div>";
  h += "<p class='pnote'>" + mealLine() + "</p>";

  var nx = nextMeal();
  h += "<div class='anch'>";
  plan.forEach(function(a){
    var on = anchorDone(t, a.slot);
    var now = !on && nx && nx.meal.slot === a.slot;
    h += "<button class='an" + (on ? " on" : "") + (now ? " next" : "") + "' data-slot='" + a.slot + "'>"
      + "<span class='ak'>" + hhmm(a.at) + "</span>"
      + "<span class='av'>" + esc(a.label) + "</span>"
      + "<span class='ad'>" + (on ? "logged" : now ? "next" : "+") + "</span></button>";
  });
  h += "</div>";

  /* Everything else the tab knows - what he has already eaten, the menu, the
     reason any of it is measured in protein - waits in the drawer list. */
  var log = "";
  if (foodOn(t).length){
    log = "<div class='recs'>";
    foodOn(t).slice().reverse().forEach(function(f){
      log += "<div class='rec'><span class='rd'>" + esc(f[2]) + "</span>"
        + "<span class='rt'>" + esc(f[0]) + "</span>"
        + "<b class='rv'>" + num(f[1]) + "g</b></div>";
    });
    log += "</div><div class='btns tight'><button class='btn quiet' data-undofood='1'>"
      + "Undo the last one</button></div>";
  }

  var ordl = "<div class='ordl'>";
  ordersNow().forEach(function(o){
    ordl += "<button class='ord' data-order='" + esc(o[0]) + "'>"
      + "<span class='on2'>" + esc(o[0]) + "</span>"
      + "<span class='og'>" + num(o[1]) + "g</span></button>";
  });
  ordl += "</div>";

  h += drawers([
    log ? fold("eaten", "What you have eaten", num(got) + "g today", log, false) : "",
    fold("orders", "What to order",
      (sit.home ? "" : esc(sit.city) + " \u00b7 ") + ordersNow().length + " " + ordersWord(), ordl, false),
    sit.home ? "" : "<button class='drow' data-near='" + (sit.kind === "family" ? "shop" : "eat")
      + "'>Find protein near you<i>" + svg("arrow", 16) + "</i></button>",
    "<button class='drow' data-go='../docs/train.html'>Why protein and not calories<i>"
      + svg("arrow", 16) + "</i></button>"
  ]);
  return h;
}

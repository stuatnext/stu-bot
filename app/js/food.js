/* ==================================================================== food
   Protein and the three eating occasions. Split out of Body because eating is
   not training: he asked for them apart, and he was right - one is a thing he
   does three times a day and the other is a thing he does three times a week.

   The diagnosis this exists to answer: no breakfast, no lunch, kopi through
   the day and one delivered meal at 23:30. About 30g of protein against a
   target near 130. Everything here is aimed at making there be three eating
   occasions instead of one. */

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

  var sug = suggestOrder(nowSlot());
  var slots = ANCHORS.filter(function(a){ return anchorDone(t, a[0]); }).length;
  h += hero({
    tone: "green", icon: "plate", kicker: "Protein today",
    big: num(got), unit: "/ " + num(target) + "g",
    line: left === 0
      ? "Done. The single biggest lever in the plan, closed."
      : num(left) + "g to go" + (sug ? " \u2014 a " + esc(sug[0].toLowerCase()) + " would close it" : ""),
    pct: pct,
    foot: slots + " of " + ANCHORS.length + " eating occasions so far today"
        + (slots < 2 ? " \u2014 one meal cannot carry " + num(target) + "g" : "")
  });
  h += facts([
    [num(got) + "g", "eaten", left === 0 ? "on" : ""],
    [num(left) + "g", "to go", left > target * .6 ? "warn" : ""],
    [slots + "/" + ANCHORS.length, "occasions", slots >= 2 ? "on" : ""]
  ]);

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
  } else {
    h += "<p class='fine'>Three occasions at 25 to 40g each gets you there without weighing "
      + "anything or giving anything up. You currently have one.</p>";
  }

  /* The whole list, so the answer to "what do I order" is never a decision. */
  h += "<div class='rulehead'><h3>What to order</h3><span></span><em>protein</em></div>";
  h += "<div class='ordl'>";
  ORDERS.forEach(function(o){
    h += "<button class='ord' data-order='" + esc(o[0]) + "'>"
      + "<span class='on2'>" + esc(o[0]) + "</span>"
      + "<span class='og'>" + num(o[1]) + "g</span></button>";
  });
  h += "</div>";

  h += "<div class='btns'><button class='btn quiet' data-go='../docs/train.html'>"
    + "Why protein and not calories</button></div>";
  return h;
}

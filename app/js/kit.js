"use strict";

/* ========================================================================
   kit.js - the things a step needs before it can be done.

   His words, v81: "It's asking me to moisturise in the shower, but if I
   don't have moisturiser, I can't complete it. This is how I am at level
   zero with a lot of these things, which is why I need to plan ahead. I
   need to buy things... And beyond that, I don't know what moisturiser I
   should buy."

   Two failures in one. Every morning the app asked for a step he had
   nothing to do it with, and it never said what to get. At level zero the
   first level is not the routine. It is the kit.

   So a step that needs something he has not got is held back - careDue
   says it is not due, the way sunscreen is not due in a Sheffield January
   - and one step takes its place: get the kit. Each thing comes with one
   pick (named, sized, priced, where it is sold), the other pick and when
   to choose it instead, and how to use it. Bought, and the step it was
   holding comes back, and the skill takes the XP. Getting the kit is the
   first level.

   Prices checked in September 2026 at FairPrice online; they move with
   offers. Everything here is sold at Watsons, Guardian and the bigger
   FairPrice stores, and in the UK at Boots.
   ======================================================================== */

var KIT = [
  { id: "moist", area: "skin", name: "Moisturiser", uses: ["skin", "night"],
    pick: "Neutrogena Hydro Boost Water Gel", size: "50g", cost: 29,
    price: "S$29, often on offer",
    why: "A light gel. It sinks in and does not sit greasy in Singapore heat.",
    alt: "CeraVe PM Facial Moisturising Lotion",
    altWhen: "if your skin feels tight or flaky after a shower",
    how: "A pea-sized blob, face and neck, before you towel off. The same one at night — no separate night cream yet.",
    lasts: "about two months" },
  { id: "spf", area: "skin", name: "Sunscreen", uses: ["sun"],
    pick: "Bioré UV Aqua Rich Watery Essence SPF50+", size: "70g", cost: 16,
    price: "about S$16",
    why: "Feels like water, leaves no white cast, and every Watsons has it.",
    alt: "La Roche-Posay Anthelios UVMune 400 Invisible Fluid",
    altWhen: "if the Bioré stings your eyes",
    how: "Last thing in the morning, after the moisturiser. Two finger-lengths for face and neck, and the backs of your hands.",
    lasts: "about six weeks" },
  { id: "wash", area: "skin", name: "Face wash", uses: ["cleanse"],
    pick: "CeraVe Foaming Cleanser", size: "236ml", cost: 30,
    price: "about S$25–32",
    why: "Takes off the sunscreen and the day without stripping your skin.",
    alt: "CeraVe Hydrating Cleanser",
    altWhen: "if your skin is dry rather than shiny",
    how: "At night. One pump on a wet face, thirty seconds, rinse with warm water, not hot.",
    lasts: "about three months" },
  { id: "am", area: "food", name: "Breakfast protein", uses: [], orders: ["Greek yoghurt", "Protein shake"],
    pick: "Greek yoghurt, a week of it", size: "five pots", cost: 15,
    price: "about S$3 a pot",
    why: "No cooking and two minutes, and the first meal already has its protein.",
    alt: "Whey protein and a shaker",
    altWhen: "if you would rather drink it — a tub lasts a month",
    how: "Buy the week in one trip. One pot with breakfast, logged as Greek yoghurt.",
    lasts: "a week" }
];
var KIT_XP = 30;       /* each thing got, to the skill it unlocks */

function kitRow(id){
  for (var i = 0; i < KIT.length; i++) if (KIT[i].id === id) return KIT[i];
  return null;
}
/* The thing a routine needs, if any. The wind-down needs nothing. */
function kitFor(key){
  for (var i = 0; i < KIT.length; i++) if (KIT[i].uses.indexOf(key) >= 0) return KIT[i];
  return null;
}
function kitForOrder(name){
  for (var i = 0; i < KIT.length; i++)
    if ((KIT[i].orders || []).indexOf(name) >= 0) return KIT[i];
  return null;
}

/* ------------------------------------------------------------ the record
   kit[id] = { s: "have" | "need", d: the day it was said }. Nothing said
   yet is "ask" - unless the record already shows him using it, in which
   case he plainly has it and nobody needs to ask. */
function kitState(id){
  var r = (S.kit || {})[id];
  if (r && (r.s === "have" || r.s === "need")) return r.s;
  return kitSeen(id) ? "have" : "ask";
}
function kitSeen(id){
  var it = kitRow(id);
  if (!it) return false;
  var d = new Date();
  for (var i = 0; i <= 30; i++){
    var k = iso(d);
    if (it.uses.some(function(u){ return careOn(k, u); })) return true;
    if (it.orders && typeof foodOn === "function"
        && foodOn(k).some(function(f){ return it.orders.indexOf(f[0]) >= 0; })) return true;
    d.setDate(d.getDate() - 1);
  }
  return false;
}
/* Whether a routine is held back today because its kit is missing. */
function kitBlocks(key){
  var it = kitFor(key);
  return !!it && kitState(it.id) !== "have";
}
function kitOrderOk(o){
  var it = kitForOrder(o[0]);
  return !it || kitState(it.id) === "have";
}
/* Everything not yet got, in one area or all of them. */
function kitWanted(area){
  return KIT.filter(function(it){ return (!area || it.area === area) && kitState(it.id) !== "have"; });
}
function kitNeed(area){
  return KIT.filter(function(it){ return (!area || it.area === area) && kitState(it.id) === "need"; });
}
/* XP for the things he said he got - said, not inferred, so a routine he
   was already doing does not pay twice. */
function kitXP(area){
  var n = 0;
  KIT.forEach(function(it){
    var r = (S.kit || {})[it.id];
    if (it.area === area && r && r.s === "have") n += KIT_XP;
  });
  return n;
}

/* Where to get it, from where he is. */
function kitWhere(area){
  var sit = typeof situation === "function" ? situation() : { kind: "home" };
  if (area === "food")
    return sit.kind === "home" ? "FairPrice or Cold Storage" : "any supermarket";
  return sit.kind === "home" ? "Watsons, Guardian or a big FairPrice"
       : sit.kind === "family" ? "Boots" : "any pharmacy";
}
/* One errand for a mixed list: a big FairPrice has the skin kit and the
   yoghurt both, so at home that is the one shop to name. */
function kitShop(list){
  var food = list.some(function(it){ return it.area === "food"; });
  var skin = list.some(function(it){ return it.area !== "food"; });
  if (!(food && skin)) return kitWhere(food ? "food" : "skin");
  var sit = typeof situation === "function" ? situation() : { kind: "home" };
  return sit.kind === "home" ? "A big FairPrice has all of it" : "A pharmacy and a supermarket";
}
function kitShopOne(list){
  var food = list.some(function(it){ return it.area === "food"; });
  var sit = typeof situation === "function" ? situation() : { kind: "home" };
  if (sit.kind !== "home") return food ? "supermarket" : sit.kind === "family" ? "Boots" : "pharmacy";
  return food ? "FairPrice" : "Watsons";
}
function kitNames(list){
  var n = list.map(function(it){ return it.name.toLowerCase(); });
  return n.length < 2 ? (n[0] || "") : n.slice(0, -1).join(", ") + " and " + n[n.length - 1];
}
function kitCost(list){
  return list.reduce(function(a, it){ return a + (it.cost || 0); }, 0);
}
function kitTab(list){
  return list.length && list.every(function(it){ return it.area === "food"; }) ? "food" : "skin";
}

/* ---------------------------------------------------------- the station
   What the Today card and the run say. Asked first, then shopped for. */
function kitLabel(list){
  return list.some(function(it){ return kitState(it.id) === "ask"; }) ? "Check your kit" : "Get the kit";
}
function kitWhy(list){
  var names = kitNames(list), cap = names.charAt(0).toUpperCase() + names.slice(1);
  if (list.some(function(it){ return kitState(it.id) === "ask"; }))
    return cap + " \u2014 which have you got? The steps that need them wait.";
  return cap + ". " + kitShop(list) + ". The steps start when you have "
    + (list.length === 1 ? "it." : "them.");
}

/* ------------------------------------------------------------ the writes */
function setKit(id, s, quiet){
  var it = kitRow(id);
  if (!it) return;
  var skill = it.area === "food" ? "diet" : "skin";
  var before = typeof skillLv === "function" ? skillLv(skill).level : 0;
  S.kit = S.kit || {};
  S.kit[id] = { s: s, d: today() };
  save();
  if (quiet) return;
  if (s === "have"){
    sfx("done"); buzz([14, 30, 14]);
    var after = typeof skillLv === "function" ? skillLv(skill) : null;
    if (after && after.level > before && typeof celebrate === "function")
      celebrate(skillDef(skill)[1] + " · Level " + after.level, it.name + " got. " + kitUnlockLine(it));
    else toast(it.name + " got. " + kitUnlockLine(it) + " +" + KIT_XP + " XP.", true);
  } else {
    sfx("tap"); buzz(8);
    toast(it.name + " is on the list.");
  }
  render({ keepScroll: true, animate: true });
}
function kitUnlockLine(it){
  if (it.id === "moist") return "The moisturiser step is back, morning and night.";
  if (it.id === "spf") return "Sunscreen is back in the morning.";
  if (it.id === "wash") return "Washing it off is back at night.";
  return "The breakfast pick is back on the menu.";
}

/* One thing at a time, the way the run asks - have you got it, or does it
   go on the list. Later stops, and nothing is lost. Resolves with how
   many he now has, so the run can tell a finished list from a closed one. */
function askKit(area){
  var list = kitWanted(area), i = 0, got = [], need = [];
  function finish(){
    if (got.length || need.length){
      var t = (got.length ? "Got: " + kitNames(got) + ". " : "")
            + (need.length ? "On the list: " + kitNames(need) + "." : "");
      toast(t.trim(), !!got.length);
      if (got.length){ sfx("done"); buzz([14, 30, 14]); }
    }
    render({ keepScroll: true, animate: true });
    return got.length;
  }
  function next(){
    if (i >= list.length) return Promise.resolve(finish());
    var it = list[i++], st = kitState(it.id);
    return ask({
      title: it.name + (list.length > 1 ? " · " + i + " of " + list.length : ""),
      html: kitCardHTML(it, 1),
      options: [
        { id: "have", label: st === "need" ? "Got it" : "I have one", pri: true },
        { id: "need", label: st === "need" ? "Still to buy" : "Need to buy it" }
      ],
      cancel: "Later"
    }).then(function(v){
      if (v === null || v === "__no") return finish();
      if (v === "have"){ setKit(it.id, "have", 1); got.push(it); }
      else if (v === "need"){ setKit(it.id, "need", 1); need.push(it); }
      return next();
    });
  }
  return next();
}

/* ------------------------------------------------------------- the view
   The answer to "I don't know what moisturiser I should buy": one name,
   the size, the price, why that one, the other one and when, how to use
   it, and where it is sold. */
function kitTint(area){ return area === "food" ? "#3FE0A0" : "#FF8FB3"; }
function kitCardHTML(it, sheet){
  return "<div class='kit-c" + (sheet ? " in-sheet" : "") + "' style='--kt:" + kitTint(it.area) + "'>"
    + "<div class='kit-pick'><em>The pick</em><b>" + esc(it.pick) + "</b>"
    + "<span>" + esc(it.size + " · " + it.price) + "</span></div>"
    + "<p class='kit-why'>" + esc(it.why) + "</p>"
    + "<p class='kit-alt'><em>Or</em>" + esc(it.alt + ", " + it.altWhen + ".") + "</p>"
    + "<p class='kit-how'><em>How</em>" + esc(it.how) + "</p>"
    + "<p class='kit-where'>" + svg("pin", 13) + esc(kitWhere(it.area) + " · lasts " + it.lasts) + "</p>"
    + "</div>";
}
/* The kit panel on a tab. Full cards for what is still to get; one line
   each for what he has, with Ran out for when it does. */
function kitPanelHTML(area, bare){
  var all = KIT.filter(function(it){ return it.area === area; });
  var want = kitWanted(area), have = all.length - want.length;
  var h = "<div class='" + (bare ? "kit bare" : "panel kit") + "' style='--kt:" + kitTint(area) + "'>";
  if (!bare)
    h += "<div class='kit-hd'><b>" + (area === "food" ? "In the kitchen" : "Your kit") + "</b>"
      + "<span>" + have + " of " + all.length + "</span></div>";
  if (want.length)
    h += "<p class='kit-lead'>" + (area === "food"
        ? "Stock it once and breakfast is decided before you wake up."
        : "Level zero starts here. Each step comes back the day you have what it needs.") + "</p>";
  all.forEach(function(it){
    var st = kitState(it.id);
    if (st === "have"){
      h += "<div class='kit-i have'><i class='kit-ok'>" + svg("tick", 14) + "</i>"
        + "<span class='kit-n'><b>" + esc(it.name) + "</b><small>" + esc(it.pick) + "</small></span>"
        + "<button class='kit-b quiet' data-kit='" + it.id + "' data-kitto='need'>Ran out</button></div>";
      return;
    }
    h += "<div class='kit-i " + st + "'>";
    h += "<div class='kit-top'><b>" + esc(it.name) + "</b><em class='kit-st'>"
      + (st === "need" ? "To buy" : "Got one?") + "</em></div>";
    h += kitCardHTML(it);
    h += "<div class='kit-acts'>"
      + "<button class='kit-b pri' data-kit='" + it.id + "' data-kitto='have'>"
      + (st === "need" ? "Got it" : "I have one") + "</button>"
      + (st === "ask" ? "<button class='kit-b' data-kit='" + it.id + "' data-kitto='need'>Need to buy it</button>" : "")
      + "</div></div>";
  });
  if (want.length > 1)
    h += "<p class='kit-sum'>About S$" + kitCost(want) + " for the " + (want.length === 2 ? "two" : want.length === 3 ? "three" : want.length)
      + " · " + esc(kitWhere(area)) + "</p>";
  return h + "</div>";
}

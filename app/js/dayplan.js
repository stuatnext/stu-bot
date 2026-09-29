"use strict";

/* ========================================================================
   dayplan.js - the day in order, and a week that goes somewhere.

   His words, v82: "Right now things aren't in order from when I wake up to
   when I start work. I'd obviously first come round, do something, maybe
   gym, go for a coffee, do some extra curricular work, life admin, learn
   something... I like to try new places for coffee but hate going during
   lunchtime. I'd love to make a start on having a community here,
   volunteering... start building or doing something with Strait Up
   Growth... learning Mandarin would be good also. But then other times I
   just want to vegetate. There's so much I wanna do with seemingly very
   little time or energy after work... I want the routine built
   chronologically, and I want each day of the week to help me towards my
   goals."

   The time he has is the morning. Malta starts at 16:00 (17:00 in the
   European winter) and he is up at 08:30: seven and a half hours that are
   his, and an evening not worth planning against. So everything that moves
   his life goes before the shift, in the order he gave it, and the evening
   asks for nothing but stopping on time.

   - THE WEEK. Each day has one focus - the business, community, Mandarin,
     his name - and Sunday is for vegetating, on purpose. Any day can be
     changed on the You tab.
   - THE DAY. dayPlan() lays it out from waking to bed. The run walks it in
     that order, the road draws its stations at those times, and "Your day"
     on Today shows the whole thing as a list.
   - VEGETATE. One tap turns the day's extras off. The three still count;
     nothing else is asked. Tired is allowed.

   Each focus is a quest line from level zero - the business starts with one
   sentence, not a website - and every step done is XP on the skill it
   belongs to.
   ======================================================================== */

var DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/* The week he starts with, by getDay(): f the focus, c coffee somewhere new,
   a life admin. */
/* v84: "I basically just want a new one to go to every day" - coffee
   somewhere new on every day but Sunday; any day can be switched off. */
var WEEK_DEFAULT = [
  { f: "veg",     c: 0, a: 0 },   /* Sunday: nothing to prove */
  { f: "biz",     c: 1, a: 0 },   /* Monday: the business, first thing in the week */
  { f: "zh",      c: 1, a: 1 },
  { f: "friends", c: 1, a: 0 },
  { f: "biz",     c: 1, a: 0 },
  { f: "name",    c: 1, a: 1 },
  { f: "friends", c: 1, a: 0 }    /* Saturday: out there */
];

/* [ name, short, icon, colour, minutes on a weekday ] */
var FOCI = {
  biz:     ["Strait Up Growth", "Business",  "case",   "#FFD84D", 90],
  friends: ["Community",        "People",    "people", "#5AC8F5", 90],
  zh:      ["Mandarin",         "Mandarin",  "zh",     "#FF7A66", 45],
  name:    ["Name & network",   "Network",   "star",   "#CE82FF", 60],
  us:      ["Tim & me",         "Tim",       "heart",  "#FF5A7A", 60],
  veg:     ["Vegetate",         "Rest",      "moon",   "#8FA3FF", 0]
};

/* The quest lines. Each step is [ what, how, the skill step it logs ]; when
   the line runs out, `again` is what keeping it going looks like. The acts
   are SKILL_ACTS ids in life.js, so each one pays that skill. */
var FOCUS_LINES = {
  biz: {
    steps: [
      ["Write the one-line offer", "Who Strait Up Growth is for and what it gets them, in one sentence you would say out loud. Everything else hangs off it.", "build"],
      ["List ten people who could hire or refer you", "Old colleagues, past clients, people who owe you a favour. Names, not companies.", "build"],
      ["Message two of the ten", "Not a pitch: what you are doing now, and would they have a coffee.", "lead"],
      ["Write one case study", "One piece of work: the problem, what you did, what changed. Nothing from NEXT — its deals and people stay inside NEXT.", "build"],
      ["Make LinkedIn say it", "Headline and About match the one-line offer. Ten minutes, then leave it alone.", "build"],
      ["Follow up everyone who has not replied", "Most work comes from the second message.", "follow"],
      ["Have one real conversation about work", "A call or a coffee with someone who could buy. Ask what is hard for them right now.", "lead"],
      ["Send one proposal", "Price and scope, in writing. Small is fine; the second one is easier.", "prop"]
    ],
    again: [
      ["Message two new people", "The list never finishes. Two more, the same short note.", "lead"],
      ["Follow up", "Everyone who went quiet. Short and friendly.", "follow"],
      ["Work on the business itself", "The offer, the site, a case study or the price. One of them, properly.", "build"]
    ]
  },
  friends: {
    steps: [
      ["Pick one place to volunteer", "Willing Hearts runs a soup kitchen with morning shifts, Food from the Heart packs and delivers food, and giving.sg lists hundreds more. Pick one that fits a morning.", "find"],
      ["Sign up for a first shift", "Put it in the calendar before you can talk yourself out of it.", "signup"],
      ["Find one group that meets when you are free", "A run club, a class, a meetup — mornings or weekends, because evenings belong to Malta.", "find"],
      ["Message one person here to meet up", "Someone you have met once is enough. Coffee counts.", "reach"],
      ["Go to the first shift", "Nobody expects you to know anything on day one.", "volunteer"],
      ["Go to the group", "Say your name to three people. That is the whole job.", "group"],
      ["Say yes to the next invite", "Especially when you do not feel like it.", "yes"]
    ],
    again: [
      ["Another shift", "The second time, people remember your name.", "volunteer"],
      ["Meet someone for coffee or food", "One person, one hour.", "met"],
      ["Back to the group", "Going back is how it becomes yours.", "group"]
    ]
  },
  zh: {
    steps: [
      ["Twenty minutes with the words you have", "The thirty in your bank, out loud. Saying them is the practice; reading them is not.", "study"],
      ["Learn to order kopi, then do it", "Kopi-o kosong: black, no sugar. Say it at the counter tomorrow.", "study"],
      ["Find a class or a tutor", "A community club course on OnePA, or online lessons on italki. One lesson a week is plenty.", "book"],
      ["Order in Mandarin", "One order, start to finish. They will switch to English; carry on anyway.", "use"],
      ["Your first lesson", "Tell the teacher what you actually need: work, ordering, small talk.", "lesson"]
    ],
    again: [
      ["Twenty minutes, out loud", "New words in the bank, and say each one.", "study"],
      ["A lesson", "Or the homework from the last one.", "lesson"],
      ["Use it with a person", "Order, ask, or thank someone in Mandarin.", "use"]
    ]
  },
  name: {
    steps: [
      ["Post one thing with your name on it", "LinkedIn: something you noticed in the industry this week, in four sentences. Nothing confidential.", "post"],
      ["Ask one person in the industry for a coffee", "Here or on a trip. A specific day and a specific place.", "intro"],
      ["Put one Singapore event in the calendar", "An industry night, a talk or a meetup this month. Booked, not bookmarked.", "plan"],
      ["Have the coffee", "Ask about them first. The rest follows.", "coffee"],
      ["Go to the event and talk to three people", "Three is the whole job. Then you can leave.", "event"]
    ],
    again: [
      ["Post again", "Once a week is a habit people notice.", "post"],
      ["Ask for, or make, an introduction", "The quickest way in anywhere.", "intro"],
      ["Coffee with someone in the industry", "Keep the list warm.", "coffee"]
    ]
  },
  us: {
    steps: [
      ["Plan the next date night", "A day and a place, in both calendars.", "plan"],
      ["An evening off work, together", "Laptop shut before dinner.", "offline"],
      ["Plan a trip together", "Even a weekend.", "trip"]
    ],
    again: [
      ["Plan the next date night", "Somewhere neither of you has been.", "plan"],
      ["An evening off work, together", "Phones in the other room.", "offline"]
    ]
  }
};

/* Coffee somewhere new. The well-known ones, described loosely on purpose,
   like the places in INSPIRE - check it is open, and tell me yours. The
   last three can be anywhere, so the list never runs dry. */
var COFFEE = [
  ["Nylon Coffee Roasters", "Everton Park", "Tiny and serious. Stand at the counter and ask what is good."],
  ["Chye Seng Huat Hardware", "Jalan Besar", "A roaster in an old hardware shop. Sit at the bar and watch the pour."],
  ["Apartment Coffee", "Lavender", "Quiet enough to read in, which is rare."],
  ["Common Man Coffee Roasters", "Martin Road", "Loud, busy and good. Go early."],
  ["Tiong Bahru Bakery", "Tiong Bahru", "A coffee and the kouign-amann, then a walk round the estate."],
  ["Tiong Hoe Specialty Coffee", "Queenstown", "A neighbourhood roaster, a long way from the tourist ones."],
  ["Atlas Coffeehouse", "Bukit Timah", "Big, bright and easy to stay in."],
  ["A kopitiam you have never sat in", "Anywhere", "Kopi-o kosong: black, no sugar, a dollar and change."],
  ["Kampong Glam, before it wakes up", "Kampong Glam", "Any café on a weekday morning, shutters half up."],
  ["A hawker centre coffee stall", "Wherever you are", "Order it the local way: kopi-c siew dai."]
];
/* The lunch crowd, which he hates: nothing social goes between these. */
var LUNCH_A = 11 * 60 + 45, LUNCH_B = 14 * 60;

/* ------------------------------------------------------------ breakfasts
   v84: "It'd be nice to have suggestions... things that can keep me
   inspired even if I don't buy it today." One idea a day on the breakfast
   step, and all of them on the Food tab. Protein first, because the day's
   target needs three meals and breakfast is the one that gets skipped.
   [ what, grams of protein, minutes, what it needs, how, tags ]
   home = built on what is already at home: the Greek yoghurt, the frozen
   fruit, and (v85) the Ninja and the protein. */
var BREAKFASTS = [
  ["Yoghurt and frozen berries", 20, 3, "Greek yoghurt, frozen fruit, honey",
    "A big bowl of yoghurt and a handful of frozen berries straight from the freezer. They thaw as you eat.", "home"],
  ["Berry smoothie", 25, 5, "Frozen fruit, Greek yoghurt, milk",
    "A cup of frozen fruit, three big spoons of yoghurt and a glass of milk. Thick enough to need a spoon.", "home"],
  ["Overnight oats", 20, 5, "Oats, Greek yoghurt, milk, fruit",
    "Oats, yoghurt and milk in a jar the night before, fruit on top. Breakfast is waiting when you wake.", "home"],
  ["Yoghurt, banana and peanut butter", 22, 3, "Greek yoghurt, a banana, peanut butter",
    "Sliced banana on the yoghurt, a spoon of peanut butter stirred through.", "home"],
  ["Yoghurt parfait with granola", 18, 3, "Greek yoghurt, granola, frozen fruit",
    "Layered in a glass: yoghurt, fruit, granola, again. The crunch is the point.", "home"],
  ["Mango lassi", 15, 5, "Frozen mango, Greek yoghurt, milk",
    "Blend frozen mango with yoghurt and milk, a pinch of cardamom if there is some.", "home"],
  ["Kaya toast and three soft-boiled eggs", 18, 15, "A kopitiam",
    "The Singapore breakfast, with a third egg to make it count. Soy sauce and white pepper on the eggs.", ""],
  ["Scrambled eggs on toast", 20, 10, "Three eggs, bread",
    "Low heat, keep stirring, and take it off while it still looks a little wet.", ""],
  ["Spinach and cheese omelette", 22, 10, "Three eggs, spinach, cheese",
    "Wilt the spinach first, pour the eggs over, cheese in the middle, fold.", ""],
  ["Chicken porridge with an egg", 20, 10, "A hawker stall",
    "Ask for an egg stirred in. Gentle, filling, and very good when you are under the weather.", ""],
  ["Cottage cheese and fruit", 20, 2, "Cottage cheese, fruit",
    "Straight from the tub with whatever fruit is in. Cold Storage has it.", ""],
  ["Smoked salmon on toast", 20, 5, "Smoked salmon, cream cheese, bread",
    "Cream cheese, salmon, black pepper, a squeeze of lemon.", ""],
  ["Protein pancakes", 25, 15, "A banana, two eggs, oats",
    "Blend them, fry small ones, top with yoghurt and berries. A weekend one.", ""],
  ["Tofu scramble", 18, 10, "Firm tofu, soy sauce, spring onion",
    "Crumble the tofu into a hot pan, soy sauce and pepper, spring onion at the end.", ""],
  ["Egg muffins, made on Sunday", 18, 2, "Eggs, peppers, spinach",
    "Bake twelve in a muffin tin on Sunday; two in the microwave each morning.", ""],
  ["Tuna on toast", 25, 5, "A tin of tuna, bread, a little mayo",
    "Tuna, mayo, black pepper, on toast. Cheap and very high in protein.", ""],
  ["Soy milk and a boiled-egg sandwich", 20, 10, "Unsweetened soy milk, eggs, bread",
    "Two boiled eggs mashed with pepper in bread, and a glass of soy milk.", ""],
  ["Chia pudding", 15, 5, "Chia seeds, milk, yoghurt, fruit",
    "Chia and milk in a jar the night before; yoghurt and fruit on top in the morning.", ""],
  ["A Japanese breakfast", 20, 10, "Rice, an egg, miso, a little salmon",
    "Rice, an onsen egg, miso soup and a bit of salmon. Plenty of caf\u00e9s here do it as a set.", ""],
  ["Breakfast burrito", 25, 15, "Eggs, a tortilla, cheese, beans",
    "Scrambled eggs, beans and cheese rolled in a tortilla. Hot sauce if you like it.", ""],
  ["Baked beans and eggs on toast", 22, 10, "A tin of beans, two eggs, bread",
    "A taste of home. Beans, two eggs any way, toast.", ""],
  ["Shakshuka", 20, 20, "Eggs, a tin of tomatoes, cumin, paprika",
    "Eggs poached in a spiced tomato sauce, bread to mop it up. A slow Saturday one.", ""],
  ["Peanut butter toast and a glass of milk", 15, 3, "Bread, peanut butter, milk",
    "The two-minute one for the days nothing else will happen.", ""],
  /* v85: "I also have a Ninja blender. I do enjoy a protein shake." */
  ["Protein shake, the Ninja way", 34, 3, "Frozen fruit, a scoop of protein, milk",
    "Frozen fruit, a scoop and a glass of cow\u2019s or soy milk, blended thick. The one you already love.", "home"],
  ["Greek yoghurt with honey and walnuts", 20, 2, "Greek yoghurt, honey, walnuts",
    "Thick yoghurt, a drizzle of honey, a handful of walnuts. Tastes like a holiday.", "home"]
];
/* The day's idea: every other day one built on what is already in the
   fridge, the rest something new to want. Same all day, different
   tomorrow. */
function breakfastIdea(k){
  k = k || today();
  var have = typeof kitState === "function" && kitState("am") === "have";
  if (have && hashOf("bfh" + k) % 2 === 0){
    var y = BREAKFASTS.filter(function(b){ return b[5] === "home"; });
    return y[hashOf("bfy" + k) % y.length];
  }
  return BREAKFASTS[hashOf("bf" + k) % BREAKFASTS.length];
}
function breakfastLine(b){ return b[0] + " \u2014 " + b[1] + "g of protein, " + b[2] + " minutes."; }
function breakfastListHTML(){
  var t = breakfastIdea();
  var h = "<div class='bf'>";
  [t].concat(BREAKFASTS.filter(function(b){ return b !== t; })).forEach(function(b, i){
    h += "<div class='bf-r" + (i === 0 ? " on" : "") + "'>"
      + (i === 0 ? "<em>Today\u2019s idea</em>" : "")
      + "<b>" + esc(b[0]) + "</b><span class='bf-n'>" + b[1] + "g \u00b7 " + b[2] + " min"
      + (b[5] === "home" ? " \u00b7 from what\u2019s at home" : "") + "</span>"
      + "<small>" + esc(b[4]) + "</small></div>";
  });
  return h + "</div>";
}

/* ---------------------------------------------------------------- shake
   v85: "I also have a Ninja blender. I do enjoy a protein shake... frozen
   fruit, some milk, usually oat milk... Don't know when I should do that
   in the day."

   When: straight after the gym on a gym day - it is the easiest time to
   remember and it fills the gap to the next meal - and on other days in
   the long stretch between breakfast and the meal before the shift. Either
   way it is one of the three or four protein moments his target needs; the
   hour matters far less than doing it.

   The milk is where the protein differs. Oat milk is not unhealthy, it is
   just not much protein (about 1g in 100ml against about 3.4g for cow's),
   and many brands add sugar and oil. [ name, grams in a 300ml glass, why ] */
var SHAKE_SCOOP = 24;
var SHAKE_MILK = {
  cow: ["Cow\u2019s milk", 10, "The most protein in the glass"],
  soy: ["Soy milk, unsweetened", 9, "Nearly as much, and no dairy"],
  oat: ["Oat milk", 3, "Fine for the taste, but little protein and often added sugar"]
};
function shakeOn(k){
  return typeof foodOn === "function" && foodOn(k || today()).some(function(f){
    return f[2] === "snack" && /^Protein shake/.test(f[0]); });
}
function askShake(){
  var pick = SHAKE_MILK[S.shakeMilk] ? S.shakeMilk : "cow";
  return ask({
    title: "Protein shake",
    say: "Frozen fruit, a scoop of protein, a glass of milk, the Ninja. Which milk? The scoop is about "
       + SHAKE_SCOOP + "g of protein; the milk is the rest.",
    options: ["cow", "soy", "oat"].map(function(m){
      var d = SHAKE_MILK[m];
      return { id: m, label: d[0], note: "About " + (SHAKE_SCOOP + d[1]) + "g in total \u00b7 " + d[2], pri: m === pick };
    }),
    cancel: "Not yet"
  }).then(function(v){
    if (!SHAKE_MILK[v]) return;
    S.shakeMilk = v;
    logFood("Protein shake, " + SHAKE_MILK[v][0].toLowerCase(), SHAKE_SCOOP + SHAKE_MILK[v][1], "snack");
  });
}

/* -------------------------------------------------------------- cleaning
   v84: "I need blocks of time... one day a week doing a massive clean, or
   each day I do a room." The approach that survives a job like his is the
   small daily one - fifteen minutes on one room, the same room on the same
   day, so the flat is never more than a week from clean and no day costs
   more than a quarter of an hour. The big weekly clean is there for anyone
   who would rather have one long block. Midday, when the cafés are full
   anyway. [ room, what, minutes ] by getDay() */
var CLEAN_ZONES = [
  null,
  ["Bathroom",    "Toilet, sink and mirror.", 15],
  ["Kitchen",     "Surfaces, the hob and the sink. Anything old in the fridge goes.", 20],
  ["Bedroom",     "Fresh sheets, and clear every surface.", 20],
  ["Living room", "Clear it, dust it, straighten the cushions.", 15],
  ["Bathroom",    "Toilet and shower. Towels in the wash.", 15],
  ["Floors",      "Hoover and mop, every room.", 30]
];
var CLEAN_BIG = ["The big clean", "Bathroom, kitchen, fresh sheets, then the floors. Music on.", 90];
function cleanMode(){ return S.cleanMode === "weekly" || S.cleanMode === "off" ? S.cleanMode : "daily"; }
function cleanToday(k){
  k = k || today();
  if (vegOn(k) || !atHome(k)) return null;
  var m = cleanMode(), d = dowOf(k);
  if (m === "off") return null;
  if (m === "weekly") return d === 3 ? CLEAN_BIG : null;     /* Wednesday */
  return CLEAN_ZONES[d];
}
function cleanWord(z){ return z === CLEAN_BIG ? z[0] : "Clean the " + z[0].toLowerCase(); }
/* Breakfast before the gym, or after - his call; before is how he likes it. */
function bfFirst(){ return S.bfFirst !== 0; }

/* ------------------------------------------------------------- the week */
function dowOf(k){ return new Date(k + "T12:00:00").getDay(); }
function weekDay(d){
  var o = (S.week || {})[d] || {}, b = WEEK_DEFAULT[d];
  return { f: FOCI[o.f] ? o.f : b.f,
           c: o.c === undefined ? b.c : o.c,
           a: o.a === undefined ? b.a : o.a };
}
/* Vegetating: said today, or a day the week gives to it. */
function vegOn(k){
  k = k || today();
  if (typeof sickOn === "function" && sickOn(k)) return true;   /* v83: ill is resting */
  var v = (S.veg || {})[k];
  if (v === 1) return true;
  if (v === 0) return false;
  return weekDay(dowOf(k)).f === "veg";
}
function atHome(k){
  var sit = typeof situation === "function" ? situation(k) : null;
  return !sit || !!sit.home;
}
/* The day's focus, or nothing - vegetating, or away, where the day is the
   trip and the plan is smaller. */
function dayFocus(k){
  k = k || today();
  if (vegOn(k) || !atHome(k)) return "";
  var f = weekDay(dowOf(k)).f;
  return FOCI[f] && f !== "veg" ? f : "";
}
function coffeeDay(k){ return !vegOn(k) && atHome(k) && !!weekDay(dowOf(k)).c; }
function adminDay(k){ return !vegOn(k) && atHome(k) && !!weekDay(dowOf(k)).a; }
/* Fifteen minutes of Mandarin on weekdays - the rule his study already ran
   on - except the day Mandarin is the focus, when the block is bigger. */
function zhDay(k){
  var d = dowOf(k);
  return !vegOn(k) && atHome(k) && d >= 1 && d <= 5 && dayFocus(k) !== "zh";
}
function weekReviewDay(k){ return dowOf(k) === 0; }
function dayName(k){
  k = k || today();
  var d = dowOf(k), f = weekDay(d).f;
  var what = !atHome(k) ? (situation(k).city || "Away")
    : vegOn(k) ? (f === "veg" ? "Vegetate" : "Vegetating") : FOCI[f][0];
  return DAY_LONG[d] + " · " + what;
}
function focusMins(k){
  var f = dayFocus(k);
  if (!f) return 0;
  return isWeekend(k) ? Math.max(90, FOCI[f][4]) + 30 : FOCI[f][4];
}

/* ------------------------------------------------------------ the record
   dayp[iso] = { wake, focus:{s,a,i}, admin, week } - what the plan's own
   steps did that no other record already holds. */
function dayRec(k, make){
  S.dayp = S.dayp || {};
  var r = S.dayp[k];
  if (!r && make) r = S.dayp[k] = {};
  return r || {};
}
function planTick(key){
  dayRec(today(), 1)[key] = 1;
  save(); render({ keepScroll: true });
}
function planUntick(key){
  var r = dayRec(today());
  if (!r[key]) return;
  delete r[key];
  save(); sfx("untick"); render({ keepScroll: true });
}

/* ------------------------------------------------------------ the focus */
function focusStep(skill){
  var line = FOCUS_LINES[skill];
  if (!line) return null;
  var i = (S.lines || {})[skill] || 0, n = line.steps.length;
  var row = i < n ? line.steps[i] : line.again[(i - n) % line.again.length];
  return { skill: skill, i: i, n: n, t: row[0], how: row[1], act: row[2], first: i < n };
}
/* Today's focus step: the one he did, if he did it, or the next one. */
function focusToday(k){
  k = k || today();
  var r = dayRec(k).focus;
  if (r && FOCUS_LINES[r.s]){
    var line = FOCUS_LINES[r.s], n = line.steps.length;
    var row = r.i < n ? line.steps[r.i] : line.again[(r.i - n) % line.again.length];
    return { skill: r.s, i: r.i, n: n, t: row[0], how: row[1], act: row[2], first: r.i < n, done: 1 };
  }
  var f = dayFocus(k);
  return f ? focusStep(f) : null;
}
function focusDoneOn(k){ return !!dayRec(k).focus; }
function focusWord(st){
  return FOCI[st.skill][0] + (st.first ? " · step " + (st.i + 1) + " of " + st.n : "");
}
function doFocus(){
  var k = today(), f = dayFocus(k), st = f ? focusStep(f) : null;
  if (!st || focusDoneOn(k)){ sfx("no"); return false; }
  dayRec(k, 1).focus = { s: f, a: st.act, i: st.i };
  S.lines = S.lines || {};
  S.lines[f] = st.i + 1;
  logLife(f, st.act);                 /* saves, pays the skill, repaints */
  return true;
}
function undoFocus(){
  var k = today(), r = dayRec(k).focus;
  if (!r) return;
  delete S.dayp[k].focus;
  S.lines = S.lines || {};
  S.lines[r.s] = r.i;
  undoLife(r.s, r.a);                 /* saves and repaints */
}

/* --------------------------------------------------------- the small ones */
function zhDone(k){
  return lifeEntries().some(function(e){ return e[0] === k && e[1] === "zh" && e[2] === "study"; });
}
function adminTodo(){ return todosAll().filter(function(t){ return !t.done; })[0] || null; }
function adminDone(k){ return !!dayRec(k).admin; }
function adminLabel(k){
  var r = dayRec(k).admin, t = null;
  if (r && r !== 1) todosAll().forEach(function(x){ if (x.id === r) t = x; });
  if (!r) t = adminTodo();
  return t ? t.l.replace(/\.$/, "") : "";
}
function doAdmin(){
  var k = today(), t = adminTodo();
  dayRec(k, 1).admin = t ? t.id : 1;
  if (t) toggleTodo(t.id);
  else { save(); sfx("tick"); render({ keepScroll: true }); }
}
function undoAdmin(){
  var k = today(), r = dayRec(k).admin;
  if (!r) return;
  delete S.dayp[k].admin;
  if (r !== 1) todosAll().forEach(function(t){ if (t.id === r) t.done = ""; });
  save(); sfx("untick"); render({ keepScroll: true });
}

/* ------------------------------------------------------------ the coffee */
function coffeeLog(){ return Array.isArray(S.coffee) ? S.coffee : []; }
function coffeeOn(k){ return coffeeLog().some(function(c){ return c[0] === k; }); }
function coffeeTried(name){ return coffeeLog().some(function(c){ return c[1] === name; }); }
function coffeePassport(){
  var s = {};
  coffeeLog().forEach(function(c){ s[c[1]] = 1; });
  return Object.keys(s).length;
}
/* v84: his own places, from his own area - "what you've recommended is a
   very standard, typical coffee place". Added on the You tab, or sent as
   screenshots and loaded in. They come first; the list above is only the
   fallback once his run out. */
function cafesOwn(){
  return (Array.isArray(S.cafes) ? S.cafes : []).map(function(c){
    return [c[0], c[1] || "", c[2] || "Somewhere new near you."];
  });
}
/* v89: a stock place he has put on his own list shows up once, as his */
function coffeeStock(){
  var have = {};
  cafesOwn().forEach(function(c){ have[c[0].toLowerCase()] = 1; });
  return COFFEE.filter(function(c){ return !have[c[0].toLowerCase()]; });
}
function coffeeList(){ return cafesOwn().concat(coffeeStock()); }
/* v88: which ones are a trip. His third batch of screenshots put him round
   Chinatown and Tanjong Pagar (Yue Hwa 1.2km, Plaza Singapura 2.9km), so the
   east coast and the north-east are an outing, not a coffee before work.
   Anything he adds himself counts as near unless it says trip, or (v89) a
   distance of 7km or more: "about 4km" is near, "about 9km" is a trip. */
var COFFEE_TRIP = ["kaki bukit", "joo chiat", "kembangan", "katong", "tanjong katong",
  "upper east coast", "bedok north", "macpherson", "marine parade", "ubi", "mountbatten",
  "haig road", "marymount", "buangkok", "kovan", "hougang", "seletar hills",
  "serangoon gardens", "serangoon"];
function cafeTrip(c){
  var a = String(c[1] || "").toLowerCase(), km = a.match(/(\d+(?:\.\d+)?)\s*km/);
  if (/trip/.test(a)) return true;
  if (km) return +km[1] >= 7;
  return COFFEE_TRIP.indexOf(a) >= 0;
}
/* the weekend has no shift after it, so that is when the trips go */
function coffeeTripDay(k){ var d = dowOf(k || today()); return d === 0 || d === 6; }
function cafeWhere(c){
  var a = c[1] || "";
  return cafeTrip(c) && !/trip/i.test(a) ? a + " \u00b7 a trip out" : a;
}
/* The day's pick: one he has not been to, the same all day, a new one
   tomorrow. His own before the stock ones; near ones on weekdays and the
   trips at the weekend, each falling back on the other once it runs out. */
function coffeePick(k){
  k = k || today();
  var h = hashOf("cf" + k), trip = coffeeTripDay(k);
  var fresh = function(c){ return !coffeeTried(c[0]); };
  var fits = function(c){ return cafeTrip(c) === trip; };
  var own = cafesOwn().filter(fresh), stock = coffeeStock().filter(fresh);
  var pools = [own.filter(fits), stock.filter(fits), own, stock];
  for (var i = 0; i < pools.length; i++) if (pools[i].length) return pools[i][h % pools[i].length];
  var all = coffeeList();
  return all[h % all.length];
}
/* what the pick says about when to go */
function coffeeWhen(c){
  return cafeTrip(c) ? "Make a morning of it, before the lunch crowd." : "Before the lunch crowd at twelve.";
}
function addCafes(text){
  var have = {}, added = 0;
  S.cafes = Array.isArray(S.cafes) ? S.cafes : [];
  S.cafes.forEach(function(c){ have[c[0].toLowerCase()] = 1; });
  String(text || "").split(/\n+/).forEach(function(line){
    var parts = line.split(/\s+[\u2014\u2013-]\s+|\s*\|\s*|\t/).map(function(x){ return x.trim(); }).filter(Boolean);
    var name = (parts[0] || "").replace(/^[\u2022*\d.)\s]+/, "").slice(0, 60);
    if (!name || have[name.toLowerCase()]) return;
    have[name.toLowerCase()] = 1;
    S.cafes.push([name, (parts[1] || "").slice(0, 40), (parts[2] || "").slice(0, 120)]);
    added++;
  });
  save();
  return added;
}
function askCafes(){
  return ask({
    title: "Your coffee places",
    say: "Paste the list, one place a line. <b>Name \u2014 area</b> if you like. Yours come first, "
       + "a new one each coffee day, and the ones you have been to stay in your passport.",
    field: { label: "Places", value: "", placeholder: "Kurasu \u2014 Tanjong Pagar", type: "area" },
    confirm: "Add them", cancel: "Close"
  }).then(function(v){
    if (typeof v !== "string" || !v.trim()) return;
    var n = addCafes(v);
    sfx(n ? "done" : "tap"); buzz(10);
    toast(n ? n + (n === 1 ? " place" : " places") + " added. " + cafesOwn().length + " of yours on the list."
            : "Those are already on the list.");
    render({ keepScroll: true });
  });
}
/* The window: the morning, before the lunch crowd - or, once that has
   gone, the afternoon after it, if the shift leaves room. */
function coffeeWindow(){
  var now = nowMin(), sh = shape();
  if (now < LUNCH_A) return [wakeMin(), LUNCH_A];
  if (sh.noShift) return [LUNCH_B, bedMin() - 120];
  return [LUNCH_B, Math.max(LUNCH_B + 30, sh.start - 30)];
}
function askCoffee(){
  var k = today(), c = coffeePick(k), now = nowMin();
  var lunch = now >= LUNCH_A && now < LUNCH_B;
  return ask({
    title: "Coffee somewhere new",
    html: "<div class='kit-c' style='--kt:#E0A15A'>"
      + "<div class='kit-pick'><em>Today’s pick</em><b>" + esc(c[0]) + "</b>"
      + "<span>" + esc(cafeWhere(c)) + "</span></div>"
      + "<p class='kit-why'>" + esc(c[2]) + "</p>"
      + "<p class='kit-how'><em>When</em>" + (lunch ? "It is the lunch crowd now. After two is quieter."
          : cafeTrip(c) ? "Make a morning of it: there by ten, away before the lunch crowd."
          : "Before 11:45. The lunch crowd arrives at twelve.") + "</p>"
      + "<p class='kit-where'>" + svg("cup", 13) + "Coffee passport: " + coffeePassport()
      + (coffeePassport() === 1 ? " place" : " places") + "</p></div>",
    options: [
      { id: "pick", label: "Went there", note: c[0], pri: true },
      { id: "other", label: "Somewhere else new", note: "Type the name" },
      { id: "list", label: "Add places to your list", note: cafesOwn().length ? cafesOwn().length + " of yours so far" : "Your own, from your area" }
    ],
    cancel: "Not today"
  }).then(function(v){
    if (v === "pick"){ logCoffee(c[0]); return; }
    if (v === "list"){ askCafes(); return; }
    if (v !== "other") return;
    return ask({ title: "Where did you go?",
      field: { label: "The place", value: "", placeholder: "Name of the café", type: "text" },
      confirm: "Log it", cancel: "Cancel" }).then(function(n){
        if (typeof n === "string" && n.trim()) logCoffee(n.trim().slice(0, 60));
      });
  });
}
function logCoffee(name){
  var k = today(), fresh = !coffeeTried(name);
  S.coffee = coffeeLog().concat([[k, name]]);
  save(); sfx("done"); buzz([14, 30, 14]);
  toast(fresh ? name + " — place " + coffeePassport() + " in your coffee passport."
              : name + ", again. Fair enough.", fresh);
  render({ keepScroll: true, animate: true });
}
function undoCoffee(){
  var k = today(), L = coffeeLog();
  for (var i = L.length - 1; i >= 0; i--) if (L[i][0] === k){ L.splice(i, 1); break; }
  S.coffee = L; save(); sfx("untick");
  render({ keepScroll: true });
}

/* -------------------------------------------------------------- the day
   Every block with its minute. The cursor walks the morning in his order;
   the things with their own clock - a meal plan, a family window, the
   shift, a date night, bed - sit at their own times. Station blocks share
   the station's id, so the road and the run can both read their minute. */
function dayPlan(k){
  k = k || today();
  var wins = winList(k), by = {};
  wins.forEach(function(w){ if (w.kind !== "pack") by[w.id] = w; });
  var sh = shape(), W = wakeMin(), B = bedMin();
  if (B <= W) B += 1440;
  var S0 = sh.noShift ? null : sh.start, E0 = sh.noShift ? null : sh.end;
  var gp = typeof gymPlan === "function" ? gymPlan() : { mode: "rest" };
  var lift = gp.mode === "session" || gp.mode === "travel" || gp.mode === "done";
  var out = [], t = W;
  function put(id, dur, at){
    var a = at == null ? t : at;
    out.push({ id: id, at: a, dur: dur });
    if (at == null || a >= t) t = Math.max(t, a + dur);
    return a;
  }
  put("wake", 15);
  /* v84: "wake up, come round, hydrate, have a coffee, have breakfast" -
     then the gym, then the shower and the routine */
  if (bfFirst()) put("m:morning", 30);   /* half an hour, so it settles before the gym */
  if (by["p:train"] && lift)
    put("p:train", (typeof sessionMinutes === "function" ? Math.round(sessionMinutes(gp.key)) : 45) + 20);
  if (by["c:skin"]) put("c:skin", 5);
  if (by["c:sun"]) put("c:sun", 5);
  if (!bfFirst()) put("m:morning", 20);
  /* v85: the shake straight after the gym, with the shower */
  var shake = atHome(k);
  if (shake && lift){ put("shake", 10); shake = false; }

  /* On a rest day the walk goes to the coffee: one trip, Trained on the way. */
  var walk = !!(by["p:train"] && !lift), cafe = !!by.coffee, kit = !!by.kit, later = false;
  if (cafe){
    if (t + (walk ? 60 : 45) <= LUNCH_A){
      if (walk){ put("p:train", 15); walk = false; }
      if (kit){ put("kit", 15); kit = false; }
      put("coffee", 45);
    } else later = true;
  }
  if (walk && !cafe){ put("p:train", 40); walk = false; }
  if (by.focus) put("focus", focusMins(k));
  /* ...or, on a day without the gym, in the long gap before the next meal */
  if (shake){ put("shake", 10); shake = false; }
  ["life", "todo", "card"].forEach(function(id){ if (by[id]) put(id, 20); });
  if (zhDay(k)) put("zh", 15);
  if (adminDay(k)) put("admin", 30);
  var cz = cleanToday(k);
  if (cz) put("clean", cz[2]);
  if (kit) put("kit", 30);
  if (later){
    var a2 = Math.max(t, LUNCH_B);
    if (walk){ put("p:train", 15, a2); a2 += 15; walk = false; }
    put("coffee", 45, a2);
  }
  if (walk) put("p:train", 40);
  if (by["p:family"]) put("p:family", 20, Math.max(t, by["p:family"].open));
  if (typeof mealPlan === "function")
    mealPlan().forEach(function(m){ if (m.slot !== "morning") put("m:" + m.slot, 30, m.at); });
  if (S0 !== null){ put("setup", 15, S0 - 15); put("work", Math.max(0, E0 - S0), S0); }
  if (by.date) put("date", 150, by.date.open);
  if (by["p:stop"]) put("p:stop", 10, E0 !== null ? E0 : by["p:stop"].open);
  if (weekReviewDay(k)) put("week", 10, 18 * 60);
  var n0 = Math.max(E0 !== null ? E0 + 10 : 0, B - 60);
  if (by["c:cleanse"]) put("c:cleanse", 5, n0);
  if (by["c:night"]) put("c:night", 5, n0 + 5);
  if (by["c:bed"]) put("c:bed", 15, Math.max(n0 + 10, B - 30));
  put("bed", 0, Math.max(B, n0 + 25));

  out.forEach(function(b, i){ b.n = i; });
  out.sort(function(a, b){ return a.at - b.at || a.n - b.n; });
  out.forEach(function(b){ planInfo(b, by, k, gp, lift); });
  return out;
}
/* The minute each station is planned for, laid on the stations themselves,
   so the road draws them in order and the card picks the one that is now. */
function planTimes(wins, k){
  var at = {};
  dayPlan(k).forEach(function(b){ at[b.id] = b.at; });
  wins.forEach(function(w){ if (at[w.id] != null) w.at = at[w.id]; });
  return wins;
}

/* What each block says. Station blocks borrow the station's own words;
   the plan's own blocks carry theirs. mark = a time, not a thing to do. */
function planInfo(b, by, k, gp, lift){
  var w = by[b.id], id = b.id;
  b.station = !!w;
  if (id === "wake"){ b.t = "Come round"; b.say = "Water first, then a coffee. Ten minutes before the phone."; b.ic = "rise"; b.col = "#FFC857"; b.done = !!dayRec(k).wake; }
  else if (id === "p:train"){
    var ga = typeof gymAsk === "function" ? gymAsk() : { ask: "Train.", sub: "" };
    b.t = lift ? ga.ask.replace(/\.$/, "") : (by.coffee ? "Rest day — walk to the coffee" : "Rest day — a walk");
    b.say = lift ? ga.sub : "A walk is Trained on a rest day.";
    b.ic = "run"; b.col = "#5AC8F5"; b.done = !!w.done;
  }
  else if (id === "c:skin" || id === "c:sun" || id === "c:cleanse" || id === "c:night" || id === "c:bed"){
    b.t = w.label; b.say = careSay(w.key, k); b.ic = "drop"; b.col = "#3FD9A0"; b.done = !!w.done;
  }
  else if (id.indexOf("m:") === 0){
    var slot = id.slice(2), m = (typeof mealPlan === "function" ? mealPlan() : []).filter(function(x){ return x.slot === slot; })[0];
    var sug = typeof suggestOrder === "function" ? suggestOrder(slot) : null;
    b.t = slot === "morning" ? "Breakfast" : m ? m.label : "A meal";
    b.say = slot === "morning" ? "Today’s idea: " + breakfastLine(breakfastIdea(k))
      : sug ? sug[0] + " — " + num(sug[1]) + "g of protein." : "Protein first.";
    b.ic = "plate"; b.col = "#3FE0A0"; b.done = anchorDone(k, slot);
  }
  else if (id === "coffee"){
    var c = coffeePick(k);
    b.t = "Coffee somewhere new"; b.say = c[0] + ", " + cafeWhere(c) + ". " + coffeeWhen(c);
    b.ic = "cup"; b.col = "#E0A15A"; b.done = coffeeOn(k);
  }
  else if (id === "focus"){
    var st = focusToday(k);
    b.t = st ? st.t : "The focus"; b.say = st ? focusWord(st) + ". " + st.how : "";
    b.ic = st ? FOCI[st.skill][2] : "star"; b.col = st ? FOCI[st.skill][3] : "#FFD84D";
    b.done = focusDoneOn(k);
  }
  else if (id === "zh"){ b.t = "Mandarin, fifteen minutes"; b.say = "Out loud: the words in your bank, or the next lesson."; b.ic = "zh"; b.col = "#FF7A66"; b.done = zhDone(k); }
  else if (id === "admin"){
    var al = adminLabel(k);
    b.t = al ? "Life admin: " + al.charAt(0).toLowerCase() + al.slice(1) : "Life admin";
    b.say = al ? "Thirty minutes on it, then stop." : "Bills, bookings, the thing you keep moving. Thirty minutes.";
    b.ic = "pen"; b.col = "#CE82FF"; b.done = adminDone(k);
  }
  else if (id === "shake"){
    b.t = "Protein shake";
    b.say = (lift ? "Straight after the gym" : "For the long gap before the next meal")
      + ": frozen fruit, a scoop, milk. About " + (SHAKE_SCOOP + (SHAKE_MILK[S.shakeMilk] || SHAKE_MILK.cow)[1]) + "g of protein.";
    b.ic = "blend"; b.col = "#3FE0A0"; b.done = shakeOn(k);
  }
  else if (id === "clean"){
    var zc = cleanToday(k);
    b.t = zc ? cleanWord(zc) : "Clean"; b.say = zc ? zc[1] + " " + zc[2] + " minutes, then stop." : "";
    b.ic = "broom"; b.col = "#7FD4C1"; b.done = !!dayRec(k).clean;
  }
  else if (id === "week"){ b.t = "Look at the week"; b.say = "Ten minutes: what each day is for. Then back to the sofa."; b.ic = "list"; b.col = "#8FA3FF"; b.done = !!dayRec(k).week; }
  else if (id === "setup"){ b.mark = 1; b.t = "Set up for Malta"; b.say = "Water, food, the desk."; b.ic = "case"; b.col = "#8FA3FF"; }
  else if (id === "work"){ b.mark = 1; b.t = "Malta"; b.say = "Until " + hhmm(b.at + b.dur) + ". Nothing else is asked of this part of the day."; b.ic = "case"; b.col = "#8FA3FF"; }
  else if (id === "bed"){ b.mark = 1; b.t = "Bed"; b.say = ""; b.ic = "moon"; b.col = "#8FA3FF"; }
  else if (w){
    b.t = w.kind === "kit" ? w.label : w.kind === "card" && w.card ? "The card: " + w.card.card[0]
        : w.kind === "life" && w.life ? w.life.act[1] : w.kind === "todo" && w.todo ? w.todo[1] : w.label;
    b.say = w.why || ""; b.ic = typeof scPin === "function" ? scPin(w) : "star"; b.col = w.col; b.done = !!w.done;
  }
  return b;
}

/* The block that is now: the first thing still to do that has not long
   gone - so opening the app at nine starts at coming round, and at two
   starts at two, not at a breakfast five hours cold. */
function planNow(plan){
  var now = nowMin(), W = wakeMin(), rel = function(m){ return ((m - W) % 1440 + 1440) % 1440; };
  var n = rel(now), first = null;
  for (var i = 0; i < plan.length; i++){
    var b = plan[i];
    if (b.mark || b.done) continue;
    if (!first) first = b;
    if (rel(b.at) + Math.max(b.dur, 30) + 30 >= n) return b;
  }
  return first;
}

/* ------------------------------------------------------------- your day
   The whole day as a list, from the button beside Start on Today. A row
   starts the run at that step; the marks are the shape of the day. */
function dayListHTML(k){
  k = k || today();
  var plan = dayPlan(k), now = planNow(plan), veg = vegOn(k), f = dayFocus(k);
  var h = "<div class='dp'>";
  var ill = typeof sickOn === "function" && sickOn(k);
  h += "<p class='dp-lead'>" + esc(ill ? "Ill today. Rest is the training: water, something hot, bed early. Family and Stop still make the day."
      : veg ? "Vegetating. The three still count; nothing else is asked."
      : !atHome(k) ? "Away, so the plan is smaller. The three, and the routine."
      : f ? "Today is for " + FOCI[f][0] + ". Everything that moves your life goes before Malta; the evening is yours."
      : "Everything that moves your life goes before Malta; the evening is yours.") + "</p>";
  h += "<ol class='dp-list'>";
  plan.forEach(function(b){
    if (b.mark){
      h += "<li class='dp-m'><time>" + hhmm(b.at) + "</time><span>" + svg(b.ic, 14)
        + esc(b.t) + (b.id === "work" ? " · until " + hhmm(b.at + b.dur) : "") + "</span></li>";
      return;
    }
    var cls = b.done ? "done" : now && b === now ? "now" : "";
    h += "<li class='dp-r " + cls + "' style='--c:" + b.col + "'><button data-mk='" + esc(b.id) + "'>"
      + "<time>" + hhmm(b.at) + "</time>"
      + "<i class='dp-ic'>" + svg(b.done ? "tick" : b.ic, 16) + "</i>"
      + "<span class='dp-t'><b>" + esc(b.t) + "</b>" + (b.say ? "<small>" + esc(b.say) + "</small>" : "") + "</span>"
      + (cls === "now" ? "<em>Now</em>" : "") + "</button></li>";
  });
  h += "</ol>";
  h += "<div class='dp-acts'>"
    + (ill ? "<button class='btn' data-mk='__sick'>Feeling better</button>"
       : weekDay(dowOf(k)).f === "veg" ? ""
       : "<button class='btn' data-mk='__veg'>" + (veg ? "Back on — plan the day" : "Vegetate today") + "</button>")
    + (ill ? "" : "<button class='btn quiet' data-mk='__ill'>I’m ill</button>")
    + "<button class='btn quiet' data-mk='__week'>The week</button></div>";
  return h + "</div>";
}
function askDay(){
  var k = today();
  return ask({ title: dayName(k), html: dayListHTML(k), cancel: "Close" }).then(function(v){
    if (!v || v === "__no") return;
    if (v === "__veg"){ toggleVeg(); return; }
    if (v === "__sick"){ setSick(0); return; }
    if (v === "__ill"){ askSick(); return; }
    if (v === "__week"){ go("you"); setTimeout(function(){
      var el = document.querySelector("#screen .wkp"); if (el) el.scrollIntoView({ block: "start" }); }, 80); return; }
    startRun("day", v);
  });
}
function toggleVeg(){
  var k = today();
  S.veg = S.veg || {};
  var on = !vegOn(k);
  S.veg[k] = on ? 1 : 0;
  if (S.notes) delete S.notes[k];        /* the bubble says the new day */
  save();
  sfx(on ? "tap" : "nav"); buzz(10);
  toast(on ? "Vegetating. The three still count; nothing else is asked." : "Back on. The plan is back.");
  render({ keepScroll: true, animate: true });
}

/* --------------------------------------------------------------- ill
   v83: "Today I have a cold. I'm really not feeling too well. I'm pretty
   tired as well because I went to bed late after work."

   The consistency he is building is turning up, and when he is ill the
   thing that turns up is rest. So an ill day carries Train the way the
   weekend carries Stop, the plan vegetates, and the words are the rule
   everyone quotes for training with a cold - above the neck, gently if you
   want to; below it, not at all. */
function askSick(){
  return ask({
    title: "Ill today?",
    say: "Rest is the training when you are ill. Train is carried, not owed, and nothing else is asked "
       + "today &mdash; Family and Stop still make the day.<br><br><b>Above the neck</b> (a blocked nose, a "
       + "scratchy throat) and you feel up to it: a gentle walk is fine. <b>Below the neck</b> (your chest, "
       + "a temperature, aches): rest, full stop. Water, something hot, and bed early tonight.",
    options: [
      { id: "rest", label: "Rest today", note: "Train carried. The run is safe.", pri: true },
      { id: "walk", label: "A gentle walk, then rest", note: "Only if it is above the neck. Twenty minutes, easy." }
    ],
    cancel: "I’m fine, actually"
  }).then(function(v){
    if (v === "rest") setSick(1);
    else if (v === "walk"){ setSick(1, 1); if (typeof askWalk === "function") askWalk(); }
  });
}
function setSick(on, quiet){
  var k = today();
  S.sick = S.sick || {};
  if (on) S.sick[k] = 1; else delete S.sick[k];
  if (S.notes) delete S.notes[k];
  save();
  sfx(on ? "tap" : "nav"); buzz(10);
  if (!quiet) toast(on ? "Rest is the training today. Train is carried; the run is safe."
                       : "Glad you are better. The day is back.");
  render({ keepScroll: true, animate: true });
}

/* ------------------------------------------------------------- the week
   On the You tab: seven rows, today lit, each one tappable to change what
   the day is for, and whether it has a coffee in it. */
function weekPanelHTML(){
  var t = dowOf(today());
  var h = "<div class='panel wkp'><div class='lf-hd'><h3>Your week</h3><span>"
    + coffeePassport() + " coffee" + (coffeePassport() === 1 ? "" : "s") + " found</span></div>";
  h += "<p class='lf-lead'>Each day has one thing it is for, before Malta starts. Tap a day to change it.</p>";
  [1, 2, 3, 4, 5, 6, 0].forEach(function(d){
    var w = weekDay(d), fo = FOCI[w.f];
    h += "<button class='wkp-r" + (d === t ? " on" : "") + "' data-weekday='" + d + "' style='--c:" + fo[3] + "'>"
      + "<span class='wkp-d'>" + DAY_SHORT[d] + "</span>"
      + "<i class='wkp-ic'>" + svg(fo[2], 16) + "</i>"
      + "<span class='wkp-t'><b>" + esc(fo[0]) + "</b><small>"
      + esc([w.f === "veg" ? "Nothing to prove" : focusLineWord(w.f), w.c ? "coffee somewhere new" : "", w.a ? "life admin" : "",
             cleanOnDay(d)].filter(Boolean).join(" · ")) + "</small></span></button>";
  });
  /* v84: the three things that shape every day, one tap each */
  h += "<div class='wkp-set'>"
    + "<button class='wkp-o' data-mornings='1'><b>Mornings</b><span>" + (bfFirst()
        ? "Coffee and breakfast, then the gym" : "The gym, then breakfast") + "</span></button>"
    + "<button class='wkp-o' data-cleanmode='1'><b>Cleaning</b><span>" + (cleanMode() === "weekly"
        ? "One big clean on Wednesday" : cleanMode() === "off" ? "Not in the plan" : "A room a day, fifteen minutes") + "</span></button>"
    + "<button class='wkp-o' data-cafes='1'><b>Coffee places</b><span>" + (cafesOwn().length
        ? cafesOwn().length + " of yours \u00b7 " + coffeePassport() + " found" : "Add your own, from your area") + "</span></button>"
    + "</div>";
  return h + "</div>";
}
function cleanOnDay(d){
  var m = cleanMode();
  if (m === "off") return "";
  if (m === "weekly") return d === 3 ? "the big clean" : "";
  var z = CLEAN_ZONES[d];
  return z ? "clean: " + z[0].toLowerCase() : "";
}
function askMornings(){
  return ask({
    title: "Mornings",
    say: "Either works for a session this size &mdash; what matters is the day&rsquo;s protein, not the order. "
       + "Pick the one you will actually do.",
    options: [
      { id: "bf", label: "Coffee and breakfast, then the gym", note: "Water, a coffee, breakfast, then train", pri: bfFirst() },
      { id: "gym", label: "The gym, then breakfast", note: "Straight out, and a proper breakfast after", pri: !bfFirst() }
    ],
    cancel: "Close"
  }).then(function(v){
    if (v !== "bf" && v !== "gym") return;
    S.bfFirst = v === "bf" ? 1 : 0;
    save(); sfx("tick"); render({ keepScroll: true });
  });
}
function askCleanMode(){
  var m = cleanMode();
  return ask({
    title: "Cleaning",
    say: "The small daily one is the version that survives a busy week: one room, the same room on the same day, "
       + "fifteen minutes at midday, and the flat is never more than a week from clean.",
    options: [
      { id: "daily", label: "A room a day", note: "Bathroom Mon and Fri, kitchen Tue, bedroom Wed, living room Thu, floors Sat", pri: m === "daily" },
      { id: "weekly", label: "One big clean on Wednesday", note: "Ninety minutes, the whole flat", pri: m === "weekly" },
      { id: "off", label: "Not in the plan", note: "Someone else has it covered", pri: m === "off" }
    ],
    cancel: "Close"
  }).then(function(v){
    if (v !== "daily" && v !== "weekly" && v !== "off") return;
    S.cleanMode = v;
    save(); sfx("tick"); render({ keepScroll: true });
  });
}
function focusLineWord(f){
  if (f === "veg" || !FOCUS_LINES[f]) return "";
  var st = focusStep(f);
  return st.first ? "next: " + st.t.charAt(0).toLowerCase() + st.t.slice(1) : "keeping it going";
}
function askWeekDay(d){
  var w = weekDay(d);
  var opts = Object.keys(FOCI).map(function(f){
    return { id: f, label: FOCI[f][0], pri: f === w.f,
             note: f === "veg" ? "Nothing to prove" : focusLineWord(f), icon: svg(FOCI[f][2], 18) };
  });
  opts.push({ id: "__cafe", label: w.c ? "Coffee somewhere new: on" : "Coffee somewhere new: off", note: "Tap to switch" });
  opts.push({ id: "__admin", label: w.a ? "Life admin: on" : "Life admin: off", note: "Tap to switch" });
  return ask({ title: DAY_LONG[d], say: "What is " + DAY_LONG[d] + " for?", options: opts, cancel: "Close" })
    .then(function(v){
      if (!v || v === "__no") return;
      S.week = S.week || {};
      var o = S.week[d] = S.week[d] || {};
      if (v === "__cafe") o.c = w.c ? 0 : 1;
      else if (v === "__admin") o.a = w.a ? 0 : 1;
      else if (FOCI[v]) o.f = v;
      save(); sfx("tick"); buzz(10);
      render({ keepScroll: true, animate: true });
    });
}

/* The day's stations with their planned minutes on them - what the road,
   the card and the minute tick all draw from. */
function planWins(k){
  k = k || today();
  var wins = winList(k);
  if (S.onboarded) planTimes(wins, k);
  return wins;
}

/* ------------------------------------------------------------ the run
   The plan's own steps, in the shape the runner takes. Station steps are
   built by the runner from the stations; these are the ones only the plan
   knows about. */
function planSteps(k, plan){
  var out = [];
  plan.forEach(function(b){
    if (b.mark || b.station) return;
    var part = b.id.indexOf("m:") === 0 || b.id === "shake" ? "Food" : b.id === "wake" ? "Morning" : b.id === "zh" ? "Mandarin"
             : b.id === "admin" ? "Life admin" : b.id === "week" ? "Sunday" : b.id === "clean" ? "Home" : "The day";
    out.push({ id: b.id, at: b.at, kicker: hhmm(b.at) + " · " + part, col: b.col,
      title: b.t + ".", say: b.say, op: b.id, done: !!b.done });
  });
  return out;
}

/* v84: things he told us, written into his phone once. "I've got some Greek
   yogurt with some fruit, some frozen fruit" - so breakfast protein is in. */
/* v86: his coffee places, read off the five Google Maps screenshots he sent -
   the east, Geylang and Kallang, up to Balestier and across to Bugis. The
   food courts, the low ratings and the places that are not really coffee are
   left out. The rating is Google's on the day he sent them. Areas are the
   neighbourhood each pin sits in, give or take a street.
   [ name, area, what it is ] */
var MY_CAFES = [
  /* specialty and cafés */
  ["Compound Coffee Co.", "Kaki Bukit", "Specialty coffee \u00b7 4.9 on Google"],
  ["Bolder Brews Coffeehouse", "Joo Chiat", "Specialty coffee \u00b7 4.9"],
  ["Analogue Anonymous", "Geylang", "Specialty coffee \u00b7 4.9"],
  ["Optional Coffee", "Boon Keng", "Specialty coffee \u00b7 5.0"],
  ["No. 36 Coffee", "Kembangan", "Coffee \u00b7 5.0"],
  ["Nami by Kyuukei Coffee", "Katong", "Japanese-style coffee \u00b7 4.7"],
  ["Common Man Coffee Roasters", "Joo Chiat", "A roaster, and loud in a good way \u00b7 4.3"],
  ["Dutch Colony Coffee Co.", "Upper East Coast", "Roaster \u00b7 4.3"],
  ["V Coffee", "Aljunied", "Coffee \u00b7 4.6"],
  ["Sec.cond Coffee", "Geylang Bahru", "Coffee, pick-up style \u00b7 4.9"],
  ["Fluid", "Bendemeer", "Coffee \u00b7 4.7"],
  ["Zerah Coffee Roasters", "Lavender", "Roaster \u00b7 4.8"],
  ["Genista Ln (Robusta)", "Jalan Besar", "Coffee, kopi and toast \u00b7 4.8"],
  ["Evan\u2019s Kitch", "Lavender", "Brunch caf\u00e9, big breakfasts \u00b7 4.9"],
  ["Symmetry", "Kampong Glam", "Caf\u00e9 \u00b7 4.3"],
  ["Coffee Donkee", "Bugis", "Coffee \u00b7 4.6"],
  ["Kurasu Singapore", "Rochor", "Japanese specialty coffee \u00b7 4.4"],
  ["am coffee co. @ The Secret Haven", "Rochor", "Coffee \u00b7 4.8"],
  ["Hideout Coffee Bar", "Little India", "Coffee bar \u00b7 4.3"],
  ["KerYi Coffee", "Farrer Park", "Coffee"],
  ["Madras Coffee House", "Race Course Road", "South Indian filter coffee \u00b7 4.8"],
  ["NCT Cafe", "Whampoa", "Caf\u00e9 \u00b7 4.8"],
  ["Now and then coffee @CHI", "Novena", "Coffee \u00b7 5.0"],
  ["MT Coffee", "Balestier", "Coffee \u00b7 4.7"],
  ["Han\u2019s craft coffee", "Marymount", "Craft coffee \u00b7 4.9"],
  ["Guerilla Coffee @ Suntec", "Suntec", "Coffee \u00b7 4.0"],
  ["Bacha Coffee", "Takashimaya, Orchard", "The fancy Moroccan one. A treat, not a habit \u00b7 3.8"],
  /* kopi, the local way */
  ["Lau Ka Kopitiam", "Bedok North", "Kopitiam \u00b7 4.7"],
  ["Soon Hong Coffee Stall", "MacPherson", "Kopi stall \u00b7 4.9"],
  ["148 Hot & Cold Drinks", "Guillemard", "Kopi stall \u00b7 4.8"],
  ["Marine Parade Coffee & Drinks", "Marine Parade", "Kopi stall \u00b7 5.0"],
  ["Chop Hua Heng", "MacPherson", "Kopi \u00b7 4.7"],
  ["Wang Coffee Town", "Ubi", "Kopitiam \u00b7 4.5"],
  ["Kang Siang Coffee Stall", "Mountbatten", "Kopi stall \u00b7 4.3"],
  ["Tong Bee Coffee Shop", "Bedok North", "Kopitiam \u00b7 4.3"],
  ["Tok Kong Coffee Shop", "Tanjong Katong", "Kopitiam \u00b7 4.3"],
  ["Jofa Coffee Shop", "Bedok North", "Kopitiam \u00b7 4.2"],
  ["Kedai Kopi @ Haig Road", "Haig Road", "Kopi \u00b7 4.1"],
  ["Sing Hiap Huat Coffee Shop", "Balestier", "Kopitiam \u00b7 4.1"],
  ["121 Brew Kopi", "Geylang", "Kopi \u00b7 4.0"],
  ["Coffee Queen", "Marine Parade", "Coffee \u00b7 4.0"],
  ["Wang Coffee Shop", "Balestier", "Kopitiam \u00b7 4.0"]
];
/* v87: the second batch - five more screenshots, north-east this time:
   Hougang, Kovan, Serangoon Gardens, Seletar Hills, Buangkok, and one trip
   out. Chains (Cotti, Luckin), food courts, groceries, low ratings and a
   drinks shop with four reviews left out; the Bendemeer map was a repeat. */
var MY_CAFES_2 = [
  ["TheDuckCoffee", "Buangkok", "Coffee \u00b7 5.0 on Google"],
  ["Saba\u2019 Coffee Co.", "Kovan", "Coffee \u00b7 5.0"],
  ["301 brews", "Hougang", "Home-based coffee, so message ahead \u00b7 4.9"],
  ["Cafe 2BL", "Seletar Hills", "Caf\u00e9 \u00b7 5.0"],
  ["Prox Coffee", "Seletar Hills", "Coffee \u00b7 4.5"],
  ["48 Richards Place Coffee", "Serangoon Gardens", "Coffee \u00b7 5.0"],
  ["Coffee Deli", "Serangoon Gardens", "Coffee \u00b7 4.7"],
  ["Coffee Room", "Serangoon", "Coffee \u00b7 4.9"],
  ["The Joy Kopi \u9f0e\u60a6\u8336\u5ba4", "Hougang", "Kopi \u00b7 4.8"],
  ["Yahava KoffeeWorks", "A trip out, about 12km", "Australian roaster: big mugs and cake \u00b7 4.5 from over a thousand reviews"]
];
/* v88: the third batch - lists, mostly suppliers this time. Three are real
   cafés and go in; left out: machine and bean suppliers (BrewRatio,
   Alliance, Speedy3dcreations), a powder wholesaler, Coffee Bean (a chain,
   3.5), Yue Hwa (a department store), and three places with a handful of
   reviews. Yahava and Compound were already in. Distances are from where the
   screenshots were taken. */
var MY_CAFES_3 = [
  ["Cowpresso Coffee Roasters", "A trip out, about 11km", "Roaster, about $5 a coffee \u00b7 4.7 from 1,291 reviews"],
  ["The Coffee Roaster Cafe", "A trip out, about 8km", "Caf\u00e9 \u00b7 4.5 from 277 reviews"],
  ["Homebody Caf\u00e9", "A trip out, about 15km", "Homemade matcha and coffee \u00b7 4.6"]
];
/* v89: the fourth batch, a list round home. Eight go in, including two
   from the stock list he picked for himself (Chye Seng Huat, Tiong Hoe),
   which now come up as his. Left out: three Coffee Beans and Kenangan
   (chains), Detian (3.8, a 24-hour kopitiam), Beanstro (3.4, $20-70) and
   Coffee Near Me (a takeaway stand 11km away). */
var MY_CAFES_4 = [
  ["Honest Cup Specialty Coffee", "Round the corner, 550m", "Specialty coffee, good tables for work \u00b7 4.8"],
  ["Kopi MORE", "About 4km away", "Kopi stall. Opens at 11: go at opening, before the hawker lunch \u00b7 4.4"],
  ["Chye Seng Huat Hardware", "Jalan Besar", "A roaster in an old hardware shop. Sit at the bar \u00b7 4.3 from 2,917 reviews"],
  ["Tiong Hoe Specialty Coffee", "Queenstown", "Neighbourhood roaster, shuts 16:45 \u00b7 4.6"],
  ["Italian Coffee Lab Pasir Panjang", "Pasir Panjang", "Coffee shop, shuts 17:00 \u00b7 4.7"],
  ["Homeground Coffee Roasters", "A trip out, about 9km", "Roastery, shuts 16:30 \u00b7 4.4 from 965 reviews"],
  ["P\u00d6ONSTI / Old Hen Coffee (NUS)", "NUS, about 8km", "Coffee and matcha, shuts 16:00 \u00b7 4.5"],
  ["Heritage Cafe", "A trip out, about 8km", "Caf\u00e9 with pastries, shuts 17:00 \u00b7 5.0 from 23 reviews"]
];
/* v90: the fifth batch, the streets round home. Four go in. Left out: two
   luckins and two Coffee Beans (chains, and one is a head office), a second
   Dimbulah, Tiong Hoe's VivoCity stand (the Queenstown one is in), Coffee
   Donkee (already in), and anything under 4 or with no reviews (Three
   Hands, 89 Coffee Stall, Five Oars, Ho Zheng). */
var MY_CAFES_5 = [
  ["Jewel Coffee (Tanjong Pagar Centre)", "Tanjong Pagar Centre, 400m", "Coffee \u00b7 4.0 from 197 reviews"],
  ["Dimbulah Coffee @ 137 Market Street", "Market Street, 1.2km", "Caf\u00e9, good desserts, shuts 18:00 \u00b7 4.0"],
  ["Oasis Bistro & Cafe", "About 3.8km away", "Bistro and caf\u00e9, more of a sit-down \u00b7 4.7 from 391 reviews"],
  ["The Community Coffee - Hamilton", "About 4.6km away", "Coffee shop, shuts 18:00 \u00b7 4.9 from 109 reviews"]
];
/* v91: the sixth batch, his own doorstep - the map zoomed right in on
   Tanjong Pagar Plaza, Kee Seng Street and Enggor Street. Ten, all within a
   walk. Left out: luckin 100AM (chain), Hill Street Coffee Shop (2.0), Old
   Chang Kee Coffee House (3.1), Chagee (tea chain), and a Viet iced coffee
   whose name was off the edge of the map. The Hive at Altez had its name
   cut off too; it is the 4.9 on Enggor Street. */
var MY_CAFES_6 = [
  ["Sojourner Coffee", "Round the corner, 300m", "Café, a good-looking room, shuts 18:00 · 4.7"],
  ["Foreground Coffee", "Tanjong Pagar Plaza", "Coffee, fair prices · 4.7"],
  ["Bill’s 8 Cafe", "Tanjong Pagar Plaza", "Café · 4.7"],
  ["Equate Coffee", "Tanjong Pagar Plaza", "Coffee · 4.6"],
  ["Vietgo coffee", "Tanjong Pagar Plaza", "Vietnamese coffee · 5.0"],
  ["22 Grams Coffee (KSC)", "Tanjong Pagar Plaza", "Coffee and matcha · 4.9"],
  ["Daily Milestone Coffee", "Onze, Kee Seng Street", "Coffee · 5.0"],
  ["Coffee Hive (Altez)", "Altez, Enggor Street, 150m", "Traditional local coffee and local food, shuts 19:00 · 4.9 from 208 reviews"],
  ["brewth coffee", "Enggor Street", "Coffee · 4.8"],
  ["Kyuukei Coffee | Maxwell", "Maxwell, 750m", "Japanese-style café, pour-overs and pastries, shuts 17:00 · 4.5"]
];
/* v92: the seventh batch, sorted by distance from his door (22 Grams is
   41m away). Six go in. Left out: Tiong Hoe's Tanjong Pagar stand (Tiong
   Hoe is already in), luckin (chain), Awake (a shop selling drip bags, not
   somewhere to sit) and Hill Street (2.0). 22 Grams and Vietgo were in. */
var MY_CAFES_7 = [
  ["Kafey Haus (Tanjong Pagar MRT)", "Tanjong Pagar MRT, 400m", "Coffee shop, try the oat salted caramel latte, shuts 16:00 · 4.6"],
  ["Han N Han Nanyang Coffeehouse 韩韩南洋咖啡馆", "400m away", "Nanyang kopi with a curry puff or pancake. The sign says nán yáng kā fēi guǎn · 4.7"],
  ["Alchemist International Plaza", "International Plaza, 400m", "Specialty coffee, Dark Matter beans, shuts 17:00 · 4.5 from 177 reviews"],
  ["Ton Coffee (Guoco Tower)", "Guoco Tower, 400m", "Tea and coffee, dark and bold · 4.1"],
  ["Flamingo Coffee & Wine", "750m away", "Café, shuts 16:30 · 4.8"],
  ["The Wired Monkey SG (The Hole)", "About 1.2km away", "Hole-in-the-wall specialty coffee, shuts 15:30 · 4.7 from 645 reviews"]
];
/* v93: the eighth batch, the last of the block - the list, by distance,
   was mostly places already in. Three new. Left out: luckin (chain), Old
   Chang Kee Coffee House (3.1), and JiuMao and no. 7 (no reviews). */
var MY_CAFES_8 = [
  ["Takagi Coffee 100 AM", "100 AM, 71m", "Japanese coffee house, since 1958 · 4.4 from 708 reviews"],
  ["Coffee and Chill", "Tanjong Pagar, 260m", "Set meals with kopi or teh, and nasi lemak, shuts 18:00 · 4.4"],
  ["Koffee Kollective (Tanjong Pagar)", "Tanjong Pagar, 270m", "Coffee stall, shuts 15:00 · 4.4 from 69 reviews"]
];
/* Names that turned out wrong, put right wherever they are - the list and
   the passport - so a visit already logged still counts. v93: the Hive's
   name was cut off in batch six; batch eight had it in full. */
var CAFE_RENAMES = {
  "Hive (Altez)": MY_CAFES_6.filter(function(c){ return c[0] === "Coffee Hive (Altez)"; })[0]
};
function fixCafeNames(){
  var changed = false, have = {};
  S.cafes = Array.isArray(S.cafes) ? S.cafes : [];
  S.cafes.forEach(function(c){ have[String(c[0]).toLowerCase()] = 1; });
  S.cafes = S.cafes.filter(function(c){
    var f = CAFE_RENAMES[c[0]];
    if (!f) return true;
    changed = true;
    if (have[f[0].toLowerCase()]) return false;   /* the right one is already there */
    have[f[0].toLowerCase()] = 1;
    c[0] = f[0]; c[1] = f[1]; c[2] = f[2];
    return true;
  });
  coffeeLog().forEach(function(v){
    var f = CAFE_RENAMES[v[1]];
    if (f){ v[1] = f[0]; changed = true; }
  });
  return changed;
}
function mergeCafes(rows){
  S.cafes = Array.isArray(S.cafes) ? S.cafes : [];
  var have = {};
  S.cafes.forEach(function(c){ have[String(c[0]).toLowerCase()] = 1; });
  rows.forEach(function(c){
    if (have[c[0].toLowerCase()]) return;
    have[c[0].toLowerCase()] = 1;
    S.cafes.push(c.slice());
  });
}
function seedOnce(){
  var changed = false;
  if (!S.seed84){
    S.kit = S.kit || {};
    if (!S.kit.am) S.kit.am = { s: "have", d: today() };
    S.seed84 = 1; changed = true;
  }
  /* v86: his places join his list once; anything he has added stays, and
     a place already there is not added twice */
  if (!S.seed86){ mergeCafes(MY_CAFES); S.seed86 = 1; changed = true; }
  /* each batch lands once, so a place he took off the list stays off */
  if (!S.seed87){ mergeCafes(MY_CAFES_2); S.seed87 = 1; changed = true; }
  if (!S.seed88){ mergeCafes(MY_CAFES_3); S.seed88 = 1; changed = true; }
  if (!S.seed89){ mergeCafes(MY_CAFES_4); S.seed89 = 1; changed = true; }
  if (!S.seed90){ mergeCafes(MY_CAFES_5); S.seed90 = 1; changed = true; }
  if (!S.seed91){ mergeCafes(MY_CAFES_6); S.seed91 = 1; changed = true; }
  if (!S.seed92){ mergeCafes(MY_CAFES_7); S.seed92 = 1; changed = true; }
  if (!S.seed93){ mergeCafes(MY_CAFES_8); S.seed93 = 1; changed = true; }
  if (fixCafeNames()) changed = true;
  if (changed) save();
}

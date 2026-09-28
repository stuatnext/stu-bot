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
var WEEK_DEFAULT = [
  { f: "veg",     c: 0, a: 0 },   /* Sunday: nothing to prove */
  { f: "biz",     c: 0, a: 0 },   /* Monday: the business, first thing in the week */
  { f: "zh",      c: 1, a: 1 },
  { f: "friends", c: 0, a: 0 },
  { f: "biz",     c: 1, a: 0 },
  { f: "name",    c: 0, a: 1 },
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
/* The week's pick: the first one he has not tried, starting somewhere the
   week chooses, so it is the same all week and different next week. */
function coffeePick(k){
  var n = COFFEE.length, s = hashOf(weekKeyOf(k || today())) % n;
  for (var i = 0; i < n; i++){
    var c = COFFEE[(s + i) % n];
    if (!coffeeTried(c[0])) return c;
  }
  return COFFEE[s];
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
      + "<div class='kit-pick'><em>This week’s pick</em><b>" + esc(c[0]) + "</b>"
      + "<span>" + esc(c[1]) + "</span></div>"
      + "<p class='kit-why'>" + esc(c[2]) + "</p>"
      + "<p class='kit-how'><em>When</em>" + (lunch ? "It is the lunch crowd now. After two is quieter."
          : "Before 11:45. The lunch crowd arrives at twelve.") + "</p>"
      + "<p class='kit-where'>" + svg("cup", 13) + "Coffee passport: " + coffeePassport()
      + (coffeePassport() === 1 ? " place" : " places") + "</p></div>",
    options: [
      { id: "pick", label: "Went there", note: c[0], pri: true },
      { id: "other", label: "Somewhere else new", note: "Type the name" }
    ],
    cancel: "Not today"
  }).then(function(v){
    if (v === "pick"){ logCoffee(c[0]); return; }
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
  if (by["p:train"] && lift)
    put("p:train", (typeof sessionMinutes === "function" ? Math.round(sessionMinutes(gp.key)) : 45) + 20);
  if (by["c:skin"]) put("c:skin", 5);
  if (by["c:sun"]) put("c:sun", 5);
  put("m:morning", 20);

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
  ["life", "todo", "card"].forEach(function(id){ if (by[id]) put(id, 20); });
  if (zhDay(k)) put("zh", 15);
  if (adminDay(k)) put("admin", 30);
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
  if (id === "wake"){ b.t = "Come round"; b.say = "Water, daylight, and ten minutes before the phone."; b.ic = "rise"; b.col = "#FFC857"; b.done = !!dayRec(k).wake; }
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
    b.say = sug ? sug[0] + " — " + num(sug[1]) + "g of protein." : "Protein first.";
    b.ic = "plate"; b.col = "#3FE0A0"; b.done = anchorDone(k, slot);
  }
  else if (id === "coffee"){
    var c = coffeePick(k);
    b.t = "Coffee somewhere new"; b.say = c[0] + ", " + c[1] + ". Before the lunch crowd.";
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
  h += "<p class='dp-lead'>" + esc(veg ? "Vegetating. The three still count; nothing else is asked."
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
    + (weekDay(dowOf(k)).f === "veg" ? ""
       : "<button class='btn' data-mk='__veg'>" + (veg ? "Back on — plan the day" : "Vegetate today") + "</button>")
    + "<button class='btn quiet' data-mk='__week'>The week</button></div>";
  return h + "</div>";
}
function askDay(){
  var k = today();
  return ask({ title: dayName(k), html: dayListHTML(k), cancel: "Close" }).then(function(v){
    if (!v || v === "__no") return;
    if (v === "__veg"){ toggleVeg(); return; }
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
  save();
  sfx(on ? "tap" : "nav"); buzz(10);
  toast(on ? "Vegetating. The three still count; nothing else is asked." : "Back on. The plan is back.");
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
      + esc([w.f === "veg" ? "Nothing to prove" : focusLineWord(w.f), w.c ? "coffee somewhere new" : "", w.a ? "life admin" : ""]
          .filter(Boolean).join(" · ")) + "</small></span></button>";
  });
  return h + "</div>";
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
    var part = b.id.indexOf("m:") === 0 ? "Food" : b.id === "wake" ? "Morning" : b.id === "zh" ? "Mandarin"
             : b.id === "admin" ? "Life admin" : b.id === "week" ? "Sunday" : "The day";
    out.push({ id: b.id, at: b.at, kicker: hhmm(b.at) + " · " + part, col: b.col,
      title: b.t + ".", say: b.say, op: b.id, done: !!b.done });
  });
  return out;
}

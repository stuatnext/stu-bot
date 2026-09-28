/* ==================================================================== plan
   "There is so much still coming up ... Gosh, chaos, uncertainty. And this
   is where things need to start getting a little bit more certain, a
   little bit more predictable, a little bit more consistent. That's
   exactly why this app exists."

   The road ahead, so the app knows before he does:
     - TRIPS with dates, a place and a kind. A holiday is a weekend that
       lasts longer (Stopped is carried, not owed); family and work trips
       keep the day's shape; the days he flies carry the run.
     - PLANS that do not have dates yet - a month, a season - waiting to be
       given them.
     - THINGS TO SORT before the road gets busy, each ticked when done.
     - DATE NIGHTS on the weekdays he picks, from the day he picks: an
       evening station on the road, and each one done is a Tim & me step.

   None of his actual plans are in this file. They arrive on the phone by
   a paste code, or are added in the app, and never leave it.
   ======================================================================== */

/* [ kind, word, colour ] */
var TRIP_KINDS = {
  holiday: ["Holiday", "#3FE0A0"],
  family:  ["Family",  "#FF8FA3"],
  work:    ["Work",    "#8FD4FF"],
  travel:  ["Travel",  "#FFC61F"]
};
var DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var MON_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function tripsAll(){ return Array.isArray(S.trips) ? S.trips : []; }
function plansAll(){ return Array.isArray(S.plans) ? S.plans : []; }
function todosAll(){ return Array.isArray(S.todos) ? S.todos : []; }
/* the trip covering a day; a later one wins where two touch (the day he flies) */
function tripOn(k){
  var hit = null;
  tripsAll().forEach(function(t){ if (t.a <= k && k <= t.b) hit = t; });
  return hit;
}
function tripsAhead(k){
  k = k || today();
  return tripsAll().filter(function(t){ return t.b >= k; })
    .sort(function(x, y){ return x.a < y.a ? -1 : x.a > y.a ? 1 : 0; });
}
function daysBetween(a, b){
  return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
}
function dayNice(k){
  var d = new Date(k + "T12:00:00");
  return d.getDate() + " " + MON_SHORT[d.getMonth()];
}
function rangeNice(a, b){
  if (a === b) return dayNice(a);
  var da = new Date(a + "T12:00:00"), db = new Date(b + "T12:00:00");
  return da.getMonth() === db.getMonth()
    ? da.getDate() + "–" + db.getDate() + " " + MON_SHORT[db.getMonth()]
    : dayNice(a) + " – " + dayNice(b);
}

/* ------------------------------------------------------------ date nights */
function nightsSet(){ var n = S.nights; return n && Array.isArray(n.w) && n.w.length ? n : null; }
function dateNightOn(k){
  var n = nightsSet();
  if (!n) return false;
  if (n.from && k < n.from) return false;
  return n.w.indexOf(new Date(k + "T12:00:00").getDay()) >= 0;
}
function dateNightDone(k){
  return lifeEntries().some(function(e){ return e[0] === k && e[1] === "us" && e[2] === "date"; });
}
function nightsWord(){
  var n = nightsSet();
  if (!n) return "Not set";
  return n.w.map(function(d){ return DAY_SHORT[d]; }).join(" & ")
    + (n.from && n.from > today() ? " from " + dayNice(n.from) : "");
}
function nightMin(){
  var n = nightsSet(), t = (n && n.t) || "19:30", p = t.split(":");
  return (Number(p[0]) || 19) * 60 + (Number(p[1]) || 0);
}

/* --------------------------------------------------------- the paste code
   DAYLIGHT1: followed by the plan as base64url JSON. Everything in it is
   checked, trimmed and merged - nothing in a code can run, and nothing it
   lacks is removed. */
function planFromCode(txt){
  txt = String(txt || "").trim();
  var body = txt.replace(/^DAYLIGHT1:/, "");
  try {
    var json = txt.charAt(0) === "{" ? txt
      : new TextDecoder().decode(b64uToBytes(body.replace(/\s+/g, "")));
    var o = JSON.parse(json);
    return o && typeof o === "object" ? o : null;
  } catch(e){ return null; }
}
var ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
function cleanText(s, n){ return String(s == null ? "" : s).replace(/[<>]/g, "").slice(0, n || 120); }
function mergePlan(o){
  var got = { trips: 0, plans: 0, todos: 0, focus: 0, goals: 0, nights: 0 };
  S.trips = tripsAll(); S.plans = plansAll(); S.todos = todosAll(); S.goals = S.goals || {};
  (Array.isArray(o.t) ? o.t : []).forEach(function(r){
    if (!Array.isArray(r) || !ISO_RE.test(r[0]) || !ISO_RE.test(r[1]) || r[1] < r[0]) return;
    var kind = TRIP_KINDS[r[3]] ? r[3] : "work", city = cleanText(r[2], 40);
    if (!city) return;
    if (S.trips.some(function(t){ return t.a === r[0] && t.c === city; })) return;
    S.trips.push({ a: r[0], b: r[1], c: city, k: kind, z: cleanText(r[5] || zoneFor(city), 40), n: cleanText(r[4], 80) });
    got.trips++;
  });
  (Array.isArray(o.p) ? o.p : []).forEach(function(r){
    if (!Array.isArray(r) || !r[0] || !r[1]) return;
    var id = cleanText(r[0], 30);
    if (S.plans.some(function(x){ return x.id === id; })) return;
    S.plans.push({ id: id, l: cleanText(r[1], 60), w: cleanText(r[2], 30),
                   k: TRIP_KINDS[r[3]] ? r[3] : "holiday", c: cleanText(r[4], 40) });
    got.plans++;
  });
  (Array.isArray(o.d) ? o.d : []).forEach(function(r){
    if (!Array.isArray(r) || !r[0] || !r[1]) return;
    var id = cleanText(r[0], 30);
    if (S.todos.some(function(x){ return x.id === id; })) return;
    S.todos.push({ id: id, l: cleanText(r[1], 90), by: ISO_RE.test(r[2] || "") ? r[2] : "", done: "" });
    got.todos++;
  });
  if (Array.isArray(o.f)){
    var f = o.f.filter(function(k){ return !!skillDef(k); }).slice(0, 3);
    if (f.length && f.join() !== focusList().join()){ S.focus = f; got.focus = f.length; }
  }
  if (o.g && typeof o.g === "object"){
    Object.keys(o.g).forEach(function(k){
      var gl = cleanText(o.g[k], 90);
      if (skillDef(k) && gl && S.goals[k] !== gl){ S.goals[k] = gl; got.goals++; }
    });
  }
  if (o.n && Array.isArray(o.n.w)){
    var w = o.n.w.map(Number).filter(function(d){ return d >= 0 && d <= 6; });
    if (w.length){
      var nn = { w: w, from: ISO_RE.test(o.n.from || "") ? o.n.from : "",
                 t: /^\d{2}:\d{2}$/.test(o.n.t || "") ? o.n.t : "19:30" };
      if (JSON.stringify(nn) !== JSON.stringify(S.nights || null)){ S.nights = nn; got.nights = 1; }
    }
  }
  save();
  return got;
}
function askPastePlan(){
  ask({ title: "Paste a plan",
        say: "A plan code starts <b>DAYLIGHT1:</b>. It adds trips, plans, things to sort and date nights "
           + "to this phone only. Nothing already here is removed.",
        field: { label: "The code", placeholder: "DAYLIGHT1:…" }, confirm: "Add it", cancel: "Not now" })
  .then(function(v){
    if (!v || v === "__no") return;
    var o = planFromCode(v);
    if (!o){ toast("That code did not read. Copy the whole thing, from DAYLIGHT1: to the end."); sfx("no"); return; }
    var g = mergePlan(o), bits = [];
    if (g.trips) bits.push(g.trips + (g.trips === 1 ? " trip" : " trips"));
    if (g.plans) bits.push(g.plans + " to date");
    if (g.todos) bits.push(g.todos + " to sort");
    if (g.nights) bits.push("date nights");
    if (g.focus) bits.push("your focus");
    if (g.goals && !bits.length) bits.push(g.goals + (g.goals === 1 ? " goal" : " goals"));
    toast(bits.length ? "Added " + bits.join(", ") + "." : "Nothing new in that one.", !!bits.length);
    sfx("rare"); buzz([14, 30, 14]);
    render({ keepScroll: true });
  });
}

/* ------------------------------------------------------------- his plan
   "Why do you need it private? I don't. It can be public."
   So it is built in: the road as he described it on 28 September 2026,
   loaded into the phone once, the first time this version opens. After
   that it is his to change - a trip he removes stays removed, because the
   seed never runs twice. The paste code is still there for the next one. */
var MY_PLAN = {
  /* trips: [ first day, last day, place, kind, note, time zone ] */
  t: [
    ["2026-10-10", "2026-10-16", "Cannes", "holiday", "With Tim", "Europe/Paris"],
    ["2026-10-17", "2026-10-19", "Sheffield", "family", "The weekend with family", "Europe/London"],
    ["2026-10-20", "2026-10-23", "New York", "work", "NEXT Predict", "America/New_York"],
    ["2026-10-23", "2026-10-24", "Doha", "travel", "On the way home", "Asia/Qatar"]
  ],
  /* to give dates to: [ id, what, when, kind, place ] */
  p: [
    ["nov-leave", "Some leave in November", "November", "holiday", ""],
    ["croatia", "Croatia", "Early December", "holiday", "Croatia"],
    ["christmas", "Christmas in Sheffield", "December", "family", "Sheffield"],
    ["ny-apr", "New York event", "April 2027", "work", "New York"],
    ["malta-may", "Malta event", "May 2027", "work", "Valletta"]
  ],
  /* to sort: [ id, what, by ] */
  d: [
    ["cannes-off", "Book the Cannes days off", "2026-10-05"],
    ["cannes-plan", "Plan Cannes with Tim", "2026-10-08"],
    ["sg-hours", "Ask to work Singapore hours on Mondays and Fridays", "2026-10-30"],
    ["nov-book", "Book the November leave", "2026-11-06"]
  ],
  /* focus, and his own line for each skill */
  f: ["us", "friends", "biz"],
  g: {
    us: "Date nights every Monday and Friday, from November",
    friends: "Friends and community in Singapore, and some volunteering",
    biz: "At least one more client, or a few freelance projects, before 2027",
    name: "Known in Singapore: events, posts, introductions"
  },
  /* date nights: weekdays (0 = Sunday), from, at */
  n: {"w": [1, 5], "from": "2026-11-02", "t": "19:30"}
};
function seedPlan(){
  if (S.planSeeded) return;
  mergePlan(MY_PLAN);
  S.planSeeded = 1;
  save();
}

/* ------------------------------------------------------------ editing */
function askTrip(i){
  var t = tripsAll()[i]; if (!t) return;
  ask({ title: t.c + " · " + rangeNice(t.a, t.b),
        say: esc(TRIP_KINDS[t.k][0]) + (t.n ? " · " + esc(t.n) : ""),
        options: [{ id: "dates", label: "Change the dates" }, { id: "kind", label: "It is a different kind of trip" },
                  { id: "del", label: "Remove it", note: "It is not happening" }],
        cancel: "Leave it" })
  .then(function(v){
    if (v === "dates") askDates(t.c, t.a, t.b).then(function(r){ if (r){ t.a = r[0]; t.b = r[1]; save(); render({ keepScroll: true }); } });
    else if (v === "kind") askKind().then(function(k){ if (k){ t.k = k; save(); render({ keepScroll: true }); } });
    else if (v === "del"){ S.trips.splice(i, 1); save(); toast("Removed."); render({ keepScroll: true }); }
  });
}
function askKind(){
  return ask({ title: "What kind of trip?",
    options: Object.keys(TRIP_KINDS).map(function(k){
      return { id: k, label: TRIP_KINDS[k][0], note: k === "holiday" ? "Time off: Stopped is carried, not owed"
             : k === "family" ? "With family, working or not" : k === "work" ? "Working away" : "Mostly in the air" };
    }), cancel: "Not now" }).then(function(v){ return v && v !== "__no" ? v : null; });
}
function askDates(what, a, b){
  return ask({ title: what + " · first day", field: { type: "date", label: "From", value: a || today() },
               confirm: "Next", cancel: "Not now" })
  .then(function(v1){
    if (!v1 || v1 === "__no" || !ISO_RE.test(v1)) return null;
    return ask({ title: what + " · last day", field: { type: "date", label: "To", value: b && b >= v1 ? b : v1 },
                 confirm: "Save", cancel: "Not now" })
    .then(function(v2){
      if (!v2 || v2 === "__no" || !ISO_RE.test(v2)) return null;
      return v2 < v1 ? [v2, v1] : [v1, v2];
    });
  });
}
function askAddTrip(){
  ask({ title: "Add a trip", field: { label: "Where", placeholder: "City or place" }, confirm: "Next", cancel: "Not now" })
  .then(function(city){
    city = cleanText(city, 40);
    if (!city || city === "__no") return;
    askDates(city).then(function(r){
      if (!r) return;
      askKind().then(function(k){
        S.trips = tripsAll();
        S.trips.push({ a: r[0], b: r[1], c: city, k: k || "work", z: zoneFor(city), n: "" });
        save(); toast(city + " is on the road.", true); render({ keepScroll: true });
      });
    });
  });
}
/* a plan with no dates yet becomes a trip the moment it gets them */
function datePlan(id){
  var P = plansAll(), i = -1;
  P.forEach(function(p, j){ if (p.id === id) i = j; });
  if (i < 0) return;
  var p = P[i];
  askDates(p.c || p.l).then(function(r){
    if (!r) return;
    S.trips = tripsAll();
    S.trips.push({ a: r[0], b: r[1], c: p.c || p.l, k: p.k, z: zoneFor(p.c || ""), n: p.c ? p.l : "" });
    P.splice(i, 1); S.plans = P;
    save(); toast("Dated. It is on the road now.", true); render({ keepScroll: true });
  });
}
function toggleTodo(id){
  todosAll().forEach(function(t){ if (t.id === id) t.done = t.done ? "" : today(); });
  save(); sfx("tick"); buzz(10);
  render({ keepScroll: true });
}
function askNights(){
  var n = nightsSet();
  ask({ title: "Date nights",
        say: "Evenings that are yours and Tim's. Each one done is a Tim &amp; me step.",
        options: [
          { id: "mf", label: "Monday and Friday", note: n ? "Now: " + nightsWord() : "" },
          { id: "f",  label: "Friday only" },
          { id: "now", label: "Start them this week", note: n && n.from > today() ? "Instead of " + dayNice(n.from) : "" },
          { id: "off", label: "Not for now" }
        ], cancel: "Leave it" })
  .then(function(v){
    if (!v || v === "__no") return;
    var cur = nightsSet() || { w: [1, 5], from: "", t: "19:30" };
    if (v === "mf") S.nights = { w: [1, 5], from: cur.from, t: cur.t };
    else if (v === "f") S.nights = { w: [5], from: cur.from, t: cur.t };
    else if (v === "now") S.nights = { w: cur.w, from: today(), t: cur.t };
    else if (v === "off") S.nights = null;
    save(); render({ keepScroll: true });
  });
}

/* ------------------------------------------------------------ the panel
   On You, under the levels: what is coming, in order, and what to sort. */
function roadAheadHTML(){
  var k = today(), ahead = tripsAhead(k), plans = plansAll(), todos = todosAll();
  var h = "<div class='panel ra'><div class='lf-hd'><h3>The road ahead</h3>"
    + "<span>" + (ahead.length ? ahead.length + (ahead.length === 1 ? " trip" : " trips") : "nothing booked") + "</span></div>";
  var nx = ahead[0];
  if (nx){
    var dd = daysBetween(k, nx.a), kd = TRIP_KINDS[nx.k] || TRIP_KINDS.work;
    h += "<div class='ra-next' style='--tk:" + kd[1] + "'><b>" + (dd <= 0 ? "Now" : dd === 1 ? "Tomorrow" : "In " + dd + " days")
      + "</b><span>" + esc(nx.c) + (nx.n ? " · " + esc(nx.n) : "") + "</span></div>";
  }
  if (ahead.length){
    h += "<ol class='ra-list'>";
    ahead.forEach(function(t){
      var i = tripsAll().indexOf(t), kd = TRIP_KINDS[t.k] || TRIP_KINDS.work, on = t.a <= k;
      h += "<li><button class='ra-trip" + (on ? " on" : "") + "' data-trip='" + i + "' style='--tk:" + kd[1] + "'>"
        + "<span class='ra-d'>" + esc(rangeNice(t.a, t.b)) + "</span>"
        + "<span class='ra-c'>" + esc(t.c) + (t.n ? "<small>" + esc(t.n) + "</small>" : "") + "</span>"
        + "<em>" + esc(kd[0]) + "</em></button></li>";
    });
    h += "</ol>";
  }
  if (plans.length){
    h += "<h4 class='nv-h'>To give dates to</h4>";
    plans.forEach(function(p){
      var kd = TRIP_KINDS[p.k] || TRIP_KINDS.holiday;
      h += "<div class='ra-plan' style='--tk:" + kd[1] + "'><span><b>" + esc(p.l) + "</b><small>" + esc(p.w) + "</small></span>"
        + "<button class='ra-btn' data-dateplan='" + esc(p.id) + "'>Set dates</button></div>";
    });
  }
  var open = todos.filter(function(t){ return !t.done; }), done = todos.filter(function(t){ return t.done; });
  if (todos.length){
    h += "<h4 class='nv-h'>To sort</h4>";
    open.concat(done).forEach(function(t){
      var late = !t.done && t.by && t.by < k;
      h += "<button class='ra-todo" + (t.done ? " done" : "") + "' data-todo='" + esc(t.id) + "'>"
        + "<i>" + (t.done ? svg("tick", 14) : "") + "</i><span>" + esc(t.l)
        + (t.by && !t.done ? "<small" + (late ? " class='late'" : "") + ">by " + esc(dayNice(t.by)) + "</small>" : "")
        + "</span></button>";
    });
  }
  h += "<button class='ra-nights' data-nights='1'><i>" + svg("heart", 16) + "</i><span><b>Date nights</b>"
    + "<small>" + esc(nightsWord()) + "</small></span>" + svg("arrow", 14) + "</button>";
  h += "<div class='btns tight ra-acts'><button class='btn quiet' data-addtrip='1'>Add a trip</button>"
    + "<button class='btn quiet' data-pasteplan='1'>Paste a plan</button></div>";
  return h + "</div>";
}

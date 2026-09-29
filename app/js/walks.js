/* =============================================================== walks
   v100: "I do really like to go for walks. I do really enjoy clearing my
   head with a good walk, but I generally stick to the Tanjong Pagar area.
   And I want to expand my horizons and stop being so lazy and locked in...
   If it requires me to wear mosquito patches... I'd like you to tell me
   that... whilst I venture out and have these walks, I can also go to a
   nearby coffee place suggested by you or a nearby place for lunch."

   A walk somewhere new, the way the coffee works: one pick a day, near
   home on a weekday (there and back before Malta), further out at the
   weekend, never one he has already done until they have all been done.
   Each says how to get there from Tanjong Pagar, whether it wants
   repellent, how it does on a hazy day, and where to have the coffee and
   the lunch at the end. The walks are researched, with their sources, in
   WALKS below. */

/* { id, n name, g "near"|"trip", area, start, end, get (from Tanjong Pagar),
     km, min, t type, shade, bug (repellent) 0/1, bugWhy, haze (fine on a
     moderate-haze day) 0/1, when, cafe [name, where, why], lunch [name,
     where, why], src [urls] } */
var WALKS = [];

function walkLog(){ return S.walked && typeof S.walked === "object" ? S.walked : {}; }
function walkDone(id){ return !!walkLog()[id]; }
function walkCount(){ return Object.keys(walkLog()).filter(function(id){ return !!walkById(id); }).length; }
function walkById(id){ return WALKS.filter(function(w){ return w.id === id; })[0] || null; }
/* the weekend has no shift after it: that is when the trips go */
function walkTripDay(k){ var d = dowOf(k || today()); return d === 0 || d === 6; }
/* The day's walk: one he has not done, near on a weekday and a trip at
   the weekend, each falling back on the other, the same all day. "Another
   one" moves it on, and that sticks for the day too. */
function walkPick(k){
  k = k || today();
  if (!WALKS.length) return null;
  var trip = walkTripDay(k), skip = dayRec(k).wskip || 0;
  var fits = function(w){ return (w.g === "trip") === trip; };
  var fresh = WALKS.filter(function(w){ return !walkDone(w.id); });
  var pools = [fresh.filter(fits), fresh, WALKS.filter(fits), WALKS];
  for (var i = 0; i < pools.length; i++)
    if (pools[i].length) return pools[i][(hashOf("wk" + k) + skip) % pools[i].length];
  return null;
}

/* ------------------------------------------------------------- the haze
   Read live from NEA through data.gov.sg when the app is on the web (never
   from a file, where it could only fail), once every half hour, and never
   waited on: the sheet says "check the PSI" until a reading is in. */
var PSI = null, PSI_AT = 0;
function psiFetch(){
  if (typeof fetch !== "function" || location.protocol !== "https:") return;
  if (Date.now() - PSI_AT < 30 * 60000) return;
  PSI_AT = Date.now();
  fetch("https://api-open.data.gov.sg/v2/real-time/api/psi").then(function(r){ return r.json(); }).then(function(j){
    var it = j && j.data && j.data.items && j.data.items[0];
    var p = it && it.readings && it.readings.psi_twenty_four_hourly;
    if (!p) return;
    var v = Number(p.south != null ? p.south : p.central != null ? p.central : p.national);
    if (!isFinite(v)) return;
    PSI = { v: v, national: Number(p.national), at: it.updatedTimestamp || it.timestamp || "" };
  }).catch(function(){});
}
/* NEA's bands for the 24-hour PSI, and what they mean for a walk */
function psiBand(v){
  return v <= 50 ? ["good", "Good for a walk."]
       : v <= 100 ? ["moderate", "Fine for a walk."]
       : v <= 200 ? ["unhealthy", "Keep it short and easy, or pick a sheltered one."]
       : v <= 300 ? ["very unhealthy", "Not today: stay in, or walk somewhere indoors."]
       : ["hazardous", "Not today. Stay in."];
}
function hazeLine(w){
  var ok = w && w.haze;
  if (PSI){
    var b = psiBand(PSI.v);
    return "Haze now: PSI " + Math.round(PSI.v) + ", " + b[0] + ". " + b[1]
      + (PSI.v > 100 && ok ? " This one is mostly sheltered." : "");
  }
  return "Haze: check the PSI first. Up to 100 is fine for a walk; over 100, keep it short"
    + (ok ? " (this one is mostly sheltered)" : " or pick a sheltered one") + ".";
}

/* ------------------------------------------------------------ the sheet */
function mapsLink(q, label){
  return "<a class='wk-map' target='_blank' rel='noopener' href='https://www.google.com/maps/search/?api=1&query="
    + encodeURIComponent(q + ", Singapore") + "'>" + esc(label || q) + "</a>";
}
function walkHTML(w){
  return "<div class='kit-c wk-c' style='--kt:#5AC8F5'>"
    + "<div class='kit-pick'><em>" + (w.g === "trip" ? "Further out" : "Near home") + "</em><b>" + esc(w.n) + "</b>"
    + "<span>" + esc(w.area) + " · " + w.km + " km · about " + w.min + " min</span></div>"
    + "<p class='kit-how'><em>Start</em>" + mapsLink(w.start) + "</p>"
    + "<p class='kit-how'><em>Getting there</em>" + esc(w.get) + "</p>"
    + "<p class='kit-how'><em>Finish</em>" + esc(w.end) + "</p>"
    + "<p class='wk-bug" + (w.bug ? " on" : "") + "'>" + (w.bug ? "<b>Bring repellent.</b> " : "<b>No repellent needed.</b> ")
    + esc(w.bugWhy) + "</p>"
    + "<p class='wk-haze'>" + esc(hazeLine(w)) + "</p>"
    + (w.when ? "<p class='kit-how'><em>When</em>" + esc(w.when) + "</p>" : "")
    + "<p class='kit-how'><em>Coffee after</em>" + mapsLink(w.cafe[0] + " " + w.cafe[1], w.cafe[0]) + " · " + esc(w.cafe[2]) + "</p>"
    + "<p class='kit-how'><em>Lunch</em>" + mapsLink(w.lunch[0] + " " + w.lunch[1], w.lunch[0]) + " · " + esc(w.lunch[2]) + "</p>"
    + "<p class='kit-where'>" + svg("run", 13) + "Walk passport: " + walkCount() + " of " + WALKS.length + "</p>"
    + "</div>";
}
function askWalkNew(id){
  psiFetch();
  var k = today(), w = id ? walkById(id) : walkPick(k);
  if (!w) return;
  return ask({
    title: "A walk somewhere new",
    html: walkHTML(w),
    options: [
      { id: "done", label: "Walked it", note: w.min + " minutes · Trained", pri: true },
      { id: "cafe", label: "Walked it, and had the coffee", note: w.cafe[0] + " goes in your coffee passport" },
      id ? null : { id: "next", label: "Another one", note: walkTripDay(k) ? "Another trip" : "Another near home" },
      { id: "all", label: "All the walks", note: walkCount() + " of " + WALKS.length + " walked" }
    ].filter(Boolean),
    cancel: "Not today"
  }).then(function(v){
    if (v === "done" || v === "cafe") logWalk(w, v === "cafe");
    else if (v === "next"){ dayRec(k, 1).wskip = (dayRec(k).wskip || 0) + 1; save(); askWalkNew(); }
    else if (v === "all") askWalks();
  });
}
function logWalk(w, cafe){
  var k = today(), fresh = !walkDone(w.id);
  S.walked = walkLog();
  if (fresh) S.walked[w.id] = k;
  S.walks = S.walks || {};
  S.walks[k] = Math.max(Number(S.walks[k]) || 0, w.min);
  if (cafe && typeof logCoffee === "function"){ save(); logCoffee(w.cafe[0]); }
  else save();
  if (!day(k).p.train && typeof tapPillar === "function") tapPillar("train");
  else render({ keepScroll: true, animate: true });
  if (!cafe) toast(fresh ? w.n + ": walk " + walkCount() + " in your passport." : w.n + ", again. Good.", fresh);
}
/* every walk, near first, the done ones ticked */
function walksListHTML(){
  var row = function(w){
    return "<button class='wk-r" + (walkDone(w.id) ? " done" : "") + "' data-mk='" + esc(w.id) + "'>"
      + "<i>" + svg(walkDone(w.id) ? "tick" : "run", 15) + "</i>"
      + "<span><b>" + esc(w.n) + "</b><small>" + esc(w.area) + " · " + w.min + " min" + (w.bug ? " · repellent" : "")
      + "</small></span></button>";
  };
  var near = WALKS.filter(function(w){ return w.g !== "trip"; }), trip = WALKS.filter(function(w){ return w.g === "trip"; });
  return "<div class='wk-list'><p class='dp-lead'>Near home for a weekday morning; further out for the weekend. "
    + "Tap one for how to get there, and where to have coffee and lunch after.</p>"
    + "<h4 class='cu-h'>Near home</h4>" + near.map(row).join("")
    + "<h4 class='cu-h'>Further out</h4>" + trip.map(row).join("") + "</div>";
}
function askWalks(){
  psiFetch();
  return ask({ title: "Walks", html: walksListHTML(), cancel: "Close" }).then(function(v){
    if (v && walkById(v)) askWalkNew(v);
  });
}
/* On You: the passport, today's pick, and the door to the list. */
function walksPanelHTML(){
  if (!WALKS.length) return "";
  var w = walkPick(today());
  return "<div class='panel wkp wkx'><div class='lf-hd'><h3>Walks</h3><span>" + walkCount() + " of " + WALKS.length
    + " walked</span></div>"
    + "<p class='lf-lead'>Somewhere new to walk, with coffee and lunch at the end. Near home on weekdays, further out at the weekend.</p>"
    + (w ? "<button class='wkp-o' data-walknew='1'><b>" + (walkTripDay() ? "This weekend: " : "Today: ") + esc(w.n)
      + "</b><span>" + esc(w.area) + " · " + w.min + " min" + (w.bug ? " · bring repellent" : "") + "</span></button>" : "")
    + "<button class='wkp-o' data-walks='1'><b>All the walks</b><span>" + WALKS.length + " walks, with how to get there</span></button>"
    + "</div>";
}

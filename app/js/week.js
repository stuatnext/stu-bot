/* ===================================================================== week
   The week is the unit.

   A daily streak punishes the life he actually has. He flies most months; a
   flame that dies on a Tuesday in an airport is not measuring consistency,
   it is measuring luck with flights, and the cost of it is that the app is
   worst exactly when the week is hardest. So the day stops being the thing
   that is kept or lost, and the week takes over.

   A week is kept on five full days out of seven. Five, not seven: two days
   can fall over - a flight, a late shift, a night out that was worth it -
   and the week still holds. That is the difference between a standard and a
   trap. What it costs is the daily pull; what it buys is a number that
   survives his actual year. */

var WEEK_LINE = 5;

/* Every day of a week, including the ones still to come. */
function weekAll(wk){
  var s = new Date(wk + "T00:00:00"), out = [];
  for (var i = 0; i < 7; i++){
    out.push(iso(new Date(s.getFullYear(), s.getMonth(), s.getDate() + i)));
  }
  return out;
}
function weekFull(wk){
  return weekAll(wk).filter(function(k){ return k <= today() && allThree(k); }).length;
}
/* A week is over once its last day is behind us. */
function weekOver(wk){ return weekAll(wk)[6] < today(); }
function weekKept(wk){ return weekFull(wk) >= WEEK_LINE; }

/* Where this week stands, in the terms it is judged by. */
function weekState(wk){
  wk = wk || weekKey();
  var days = weekAll(wk), full = weekFull(wk);
  var gone = days.filter(function(k){ return k < today(); }).length;
  var leftIncludingToday = 7 - gone;
  var need = Math.max(0, WEEK_LINE - full);
  return {
    key: wk, full: full, need: need, left: leftIncludingToday,
    kept: full >= WEEK_LINE,
    /* still reachable? it stops being reachable when the days left run out */
    alive: full >= WEEK_LINE || need <= leftIncludingToday,
    over: weekOver(wk)
  };
}

/* Every week that has any record in it at all, oldest first. */
function weekKeys(){
  var ks = Object.keys(S.days || {}).sort();
  if (!ks.length) return [];
  var out = [], seen = {}, d = weekKey(new Date(ks[0] + "T00:00:00"));
  var stop = weekKey();
  for (var i = 0; i < 400; i++){
    if (!seen[d]){ out.push(d); seen[d] = 1; }
    if (d === stop) break;
    var n = new Date(d + "T00:00:00");
    d = iso(new Date(n.getFullYear(), n.getMonth(), n.getDate() + 7));
  }
  return out;
}
function weeksKept(){
  return weekKeys().filter(function(w){ return weekOver(w) && weekKept(w); }).length;
}
/* Weeks kept back to back, ending with the last week that is actually over.
   This week does not break it while it is still winnable. */
function weekRun(){
  var ws = weekKeys().filter(weekOver).reverse(), n = 0;
  for (var i = 0; i < ws.length; i++){
    if (weekKept(ws[i])) n++; else break;
  }
  return n;
}
function bestWeekRun(){
  var ws = weekKeys().filter(weekOver), best = 0, run = 0;
  ws.forEach(function(w){ if (weekKept(w)){ run++; if (run > best) best = run; } else run = 0; });
  return best;
}

/* The shelf: the weeks behind him, newest first, as things rather than rows. */
function weekShelf(n){
  var ws = weekKeys().filter(weekOver).reverse().slice(0, n || 14);
  return ws.map(function(w){
    var d = new Date(w + "T00:00:00");
    return { key: w, full: weekFull(w), kept: weekKept(w),
             label: MONTHS_SHORT[d.getMonth()] + " " + d.getDate() };
  });
}
var MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* What the week meter says in words, which is the only place the standard is
   ever explained - it should never need a legend. */
function weekLine(){
  /* Terse on purpose: the sentence under this is the dispatch, and two lines
     saying the same thing is how the old screens got noisy. */
  var w = weekState();
  if (w.kept) return "kept";
  if (!w.alive) return "short this week";
  return w.need === 1 ? "one day off keeping it" : w.need + " days off keeping it";
}

/* =============================================================== challenges
   Three a week, drawn from the week itself so nothing has to be stored and
   two devices agree. Progress is measured against the record rather than
   counted up as it happens, which means it cannot drift, cannot be
   double-claimed, and repairs itself if a day is edited after the fact.

   The point of them is that they regenerate. Cards run out and stages cap;
   a week does not, and neither does a healthy life. */

function weekStart(d){
  var x = new Date(d || new Date());
  x = new Date(x.getFullYear(), x.getMonth(), x.getDate());
  var back = (x.getDay() + 6) % 7;          /* Monday is the start */
  x.setDate(x.getDate() - back);
  return x;
}
function weekKey(d){ return iso(weekStart(d)); }
function weekDays(k){
  var s = new Date(k + "T00:00:00"), out = [];
  for (var i = 0; i < 7; i++){
    var x = new Date(s.getFullYear(), s.getMonth(), s.getDate() + i);
    if (iso(x) > today()) break;            /* the future is not a shortfall */
    out.push(iso(x));
  }
  return out;
}
function allWeekDays(k){
  var s = new Date(k + "T00:00:00"), out = [];
  for (var i = 0; i < 7; i++){
    out.push(iso(new Date(s.getFullYear(), s.getMonth(), s.getDate() + i)));
  }
  return out;
}

/* A small stable hash, so the same week always draws the same three. */
function wHash(s){
  var h = 2166136261;
  for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function targetFor(c, tier){
  return Math.min(c[5], Math.round(c[3] + c[4] * tier));
}
/* The draw is the week and the tier; nothing else. Separated from questsFor so
   that working out the tier cannot end up asking for the tier again. */
function drawWeek(k, tier){
  var h = wHash(k), pool = CHALLENGES.slice(), out = [];
  for (var i = 0; i < 3 && pool.length; i++){
    h = Math.imul(h, 1664525) + 1013904223;
    var at = (h >>> 8) % pool.length;
    var c = pool.splice(at, 1)[0];
    out.push({ id: c[0], say: c[1], metric: c[2], need: targetFor(c, tier) });
  }
  return out;
}
function clearedWith(k, tier){
  var qs = drawWeek(k, tier), all = allWeekDays(k);
  return qs.length > 0 && qs.every(function(q){
    return metricCount(q.metric, all) >= q.need;
  });
}

/* Tiers are built forwards from the first week with anything in it, each week
   depending only on weeks strictly before it. The first version worked
   backwards and recursed forever - questsFor asked tierAt, which asked
   weekCleared, which asked questsFor - and the page never finished loading. */
var TIERS = null;
function tierTable(){
  if (TIERS) return TIERS;
  var keys = [];
  [S.days, S.lifts, S.water, S.sleep, S.out, S.food].forEach(function(o){
    Object.keys(o || {}).forEach(function(k){ keys.push(k); });
  });
  Object.keys(S.done || {}).forEach(function(n){ keys.push(S.done[n]); });
  keys = keys.filter(Boolean).sort();
  var cur = weekKey();
  var first = keys.length ? weekKey(new Date(keys[0] + "T00:00:00")) : cur;
  var t = {}, cleared = 0, s = new Date(first + "T00:00:00");
  for (var i = 0; i < 400; i++){
    var k = iso(new Date(s.getFullYear(), s.getMonth(), s.getDate() + i * 7));
    if (k > cur) break;
    t[k] = cleared;
    if (clearedWith(k, cleared)) cleared++;
  }
  if (t[cur] === undefined) t[cur] = cleared;
  TIERS = t;
  return t;
}
function tierAt(k){
  var t = tierTable();
  if (t[k] !== undefined) return t[k];
  /* A week after everything recorded inherits the running total. */
  var ks = Object.keys(t).sort();
  return ks.length ? t[ks[ks.length - 1]] : 0;
}
function questsFor(k){ return drawWeek(k, tierAt(k)); }

/* --------------------------------------------------------------- measuring */
function metricCount(metric, days){
  var n = 0;
  days.forEach(function(k){
    var d = S.days[k];
    if (metric === "full"   && allThree(k)) n++;
    if (metric === "sess"   && S.lifts && S.lifts[k] && Object.keys(S.lifts[k].ex || {}).length) n++;
    if (metric === "prot"   && proteinOn(k) >= proteinTarget()) n++;
    if (metric === "water"  && waterOn(k) >= WATER_GLASSES) n++;
    if (metric === "sleep"  && sleepOn(k) >= SLEEP_TARGET) n++;
    if (metric === "clear"  && vitalsMet(k) === VITALS.length) n++;
    if (metric === "out"    && outOn(k)) n++;
    if (metric === "bed"    && d && d.bedok === true) n++;
    if (metric === "fam"    && pDone(k, "family")) n++;
    if (metric === "stop"   && pDone(k, "stop")) n++;
  });
  if (metric === "place"){
    n = Object.keys(S.done || {}).filter(function(name){
      return days.indexOf(S.done[name]) >= 0;
    }).length;
  }
  if (metric === "beatlift") n = liftsBeaten(days);
  return n;
}

/* A lift is beaten when its weight goes above anything logged before that
   day - which is the only honest reading of "beat your own lift". */
function liftsBeaten(days){
  var n = 0;
  days.forEach(function(k){
    var e = (S.lifts || {})[k];
    if (!e || !e.ex) return;
    Object.keys(e.ex).forEach(function(name){
      var w = e.ex[name].w, best = 0;
      Object.keys(S.lifts).forEach(function(j){
        if (j >= k) return;
        var p = S.lifts[j].ex && S.lifts[j].ex[name];
        if (p && p.w > best) best = p.w;
      });
      if (best > 0 && w > best) n++;
    });
  });
  return n;
}

function questProgress(q, k){
  return Math.min(q.need, metricCount(q.metric, weekDays(k)));
}
function questDoneQ(q, k){ return questProgress(q, k) >= q.need; }
function weekCleared(k){ return clearedWith(k, tierAt(k)); }

/* --------------------------------------------------------------- the money */
/* Computed from the record like everything else in the pot, so it can never
   be claimed twice and never needs a claim button. */
function questEarned(){
  var r = rate(), total = 0, cur = weekKey();
  var s = new Date(cur + "T00:00:00");
  for (var i = 0; i <= 60; i++){
    var k = iso(new Date(s.getFullYear(), s.getMonth(), s.getDate() - i * 7));
    var qs = questsFor(k), got = 0;
    qs.forEach(function(q){
      if (metricCount(q.metric, allWeekDays(k)) >= q.need) got++;
    });
    total += got * r * CH_PAY;
    if (got === qs.length && qs.length) total += r * CH_SWEEP;
  }
  return total;
}

/* ------------------------------------------------------------------- view */
function questHTML(){
  var k = weekKey(), qs = questsFor(k), tier = tierAt(k);
  var done = qs.filter(function(q){ return questDoneQ(q, k); }).length;
  var endsIn = 7 - weekDays(k).length + 1;
  var h = "<div class='rulehead'><h3>This week</h3><span></span><em>"
    + (done === qs.length ? "swept" : done + " of " + qs.length) + "</em></div>";

  h += "<div class='qwk'>";
  qs.forEach(function(q){
    var got = questProgress(q, k), on = got >= q.need;
    var pct = Math.round(100 * got / q.need);
    h += "<div class='qq" + (on ? " on" : "") + "'>"
      + "<div class='qt'><b>" + esc(q.say.replace("%n", q.need)) + "</b>"
      + "<span>" + got + " of " + q.need + "</span></div>"
      + "<div class='qbar'><i style='width:" + pct + "%'></i></div></div>";
  });
  h += "</div>";

  h += "<p class='fine'>"
    + (done === qs.length
        ? "All three. That is " + money(rate() * (CH_PAY * qs.length + CH_SWEEP)) + " in the pot."
        : "Each one pays " + money(rate() * CH_PAY) + ", all three pays "
          + money(rate() * CH_SWEEP) + " more. "
          + (endsIn === 1 ? "Last day." : endsIn + " days left."))
    + (tier ? " Targets have climbed " + tier + " " + (tier === 1 ? "week" : "weeks")
            + " &mdash; they will keep climbing." : "")
    + "</p>";
  return h;
}

"use strict";

/* ========================================================================
   care.js - the three routines that are not pillars.

   His ask, in his words: "there's other things in life I want to achieve
   like a good skin care routine. I have been advised to use moisturiser in
   the shower. I also want to be better at doing stuff before bed + wearing
   sun screen each day when needed."

   Two design rules, both load-bearing:

   1. NONE OF THIS CAN BREAK ANYTHING. The three pillars carry the streak,
      the week and the pack. A missed moisturiser is a missed moisturiser.
      Same contract as the five basics next door - earn, never punish.

   2. IT ONLY ASKS AT THE HOUR IT MEANS. Sunscreen at 9pm is noise; a
      wind-down at breakfast is noise. Each routine has a window taken from
      his own wake and bed times, and the row on Today carries whichever
      routines are live right now - usually two, often one, sometimes none.
      That is also why this did not become a fourth tab or a fold: at any
      given minute it is one short line.

   "When needed" for sunscreen is answered by where he is standing rather
   than by asking him: inside the tropics it is every day, outside them it
   is that hemisphere's summer half. He travels constantly, so the answer
   changes under him without a setting to remember.
   ======================================================================== */

/* ------------------------------------------------------------- the place
   The where-record names a city, not a coordinate - the record never holds
   his position, which is the rule this app has had since the day location
   went in. PLACES already knows roughly where each named city is, and
   roughly is all a latitude band needs. */
function placeLat(city){
  for (var i = 0; i < PLACES.length; i++) if (PLACES[i][0] === city) return PLACES[i][1];
  return null;
}
/* Whether sunscreen is worth a thought today, where he is today. Unknown
   cities get the benefit of the doubt in summer and are left alone in
   winter, which is the same rule as everywhere else with less confidence. */
function sunNeeded(k){
  k = k || today();
  var sit = situation(k), lat = placeLat(sit.city);
  var m = Number(k.split("-")[1]);
  if (lat === null) lat = 51;                     /* somewhere European-ish */
  if (Math.abs(lat) <= TROPIC) return true;
  var months = lat >= 0 ? SUN_MONTHS_N : SUN_MONTHS_S;
  return months.indexOf(m) !== -1;
}
function sunWhy(k){
  k = k || today();
  var sit = situation(k), lat = placeLat(sit.city);
  if (lat !== null && Math.abs(lat) <= TROPIC)
    return "This close to the equator it is needed every day.";
  return sunNeeded(k) ? "It is the half of the year where it counts in " + sit.city + "."
                      : "Not in " + sit.city + " at this time of year.";
}

/* -------------------------------------------------------------- the windows
   Day runs from half an hour before he wakes to two and a half hours before
   he is meant to be down; night runs from there round to the morning. With
   his 08:30 and 23:45 that is 08:00-21:15 and 21:15-08:00. Both move with
   the times he sets, and both are read off the phone's own clock, so they
   follow him across time zones without a setting. */
function careWindow(){
  var n = new Date(), now = n.getHours() * 60 + n.getMinutes();
  var wake = t2m(S.wake || "08:30") - 30, bed = t2m(S.bed || BED_DEFAULT) - 150;
  if (bed <= wake) bed = wake + 600;
  return (now >= wake && now < bed) ? "day" : "night";
}
/* Ticking the wind-down before the bed time is also the honest answer to the
   "bed on time" challenge, which has been in the challenge table since v1
   with nothing on the phone able to set it. Now something can. */
function bedOnTime(){
  var n = new Date(), now = n.getHours() * 60 + n.getMinutes();
  var bed = t2m(S.bed || BED_DEFAULT);
  return now >= 240 && now <= bed;               /* 04:00 to lights-out */
}

/* ------------------------------------------------------------- the record
   care[iso] = { sun:1, skin:1, bed:1 }. Absent means not done; there is no
   "missed" to store, because nothing is owed. */
function careOn(k, key){ return !!((S.care || {})[k] || {})[key]; }
/* Whether a routine applies at all on a given day - only sunscreen can ever
   answer no, and it answers it from the map. */
function careDue(key, k){
  if (key === "sun") return sunNeeded(k || today());
  return true;
}
/* The routines live at this minute: due today, and in the window we are in. */
function careNow(){
  var w = careWindow(), t = today();
  return ROUTINES.filter(function(r){ return r[3] === w && careDue(r[0], t); });
}
/* Every routine that applies today, whatever the hour - for the mirror the
   push reads, which has to describe a day rather than a minute. */
function careOpen(part){
  var t = today();
  return ROUTINES.filter(function(r){
    return (!part || r[3] === part) && careDue(r[0], t) && !careOn(t, r[0]);
  }).map(function(r){ return r[1]; });
}
/* Days in a row, counting only days the routine applied on. A fortnight in a
   Sheffield January is not a fortnight of missed sunscreen - those days are
   stepped over, so a run survives the weather and the hemisphere. Today not
   being done yet is not a broken run either; it is still today. */
function careRun(key){
  var n = 0, d = new Date();
  for (var i = 0; i < 400; i++){
    var k = iso(d);
    if (!careDue(key, k)){ d.setDate(d.getDate() - 1); continue; }
    if (!careOn(k, key)){
      if (i === 0){ d.setDate(d.getDate() - 1); continue; }
      break;
    }
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function tapCare(key){
  var k = today(), row = null;
  for (var i = 0; i < ROUTINES.length; i++) if (ROUTINES[i][0] === key) row = ROUTINES[i];
  if (!row) return;
  S.care = S.care || {};
  var rec = S.care[k] || (S.care[k] = {});
  if (rec[key]){
    delete rec[key];
    if (key === "bed" && S.days[k]) delete S.days[k].bedok;
    sfx("untick");
  } else {
    rec[key] = 1;
    /* the wind-down, done before lights-out, is the bed-on-time answer */
    if (key === "bed") day(k).bedok = bedOnTime();
    sfx("tick"); buzz(12);
    /* the record already carries today, so careRun counts it */
    var run = careRun(key);
    if (run === 7)  toast(row[1] + ", seven days running. That is a routine now.");
    if (run === 30) toast(row[1] + ", thirty days. It is just what you do.");
  }
  if (!Object.keys(rec).length) delete S.care[k];
  save();
  render({ keepScroll: true });
}

/* --------------------------------------------------------- what it says
   The line a routine carries on the board. Usually just what to do - the
   exception is sunscreen away from home, where the card appears and
   disappears as he crosses latitudes and seasons, so on those days it says
   why it is there rather than what to do with it. */
function careSay(key, k){
  k = k || today();
  var row = null;
  for (var i = 0; i < ROUTINES.length; i++) if (ROUTINES[i][0] === key) row = ROUTINES[i];
  if (!row) return "";
  if (key === "sun" && !situation(k).home) return sunWhy(k);
  return row[2];
}

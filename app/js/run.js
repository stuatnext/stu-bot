"use strict";

/* ========================================================================
   run.js - the engine. The part this app never had.

   His brief, after five rounds of me repainting the same screen: "You're
   making such minor changes. Revamp entirely. I want something as sticky as
   Balatro or AdVenture Capitalist."

   He is right, and the diagnosis is mechanical rather than visual. Those two
   games are not sticky because of how they look:

     - Balatro escalates. Ante 1 is trivial and ante 8 is not, so the engine
       you built in the shop has to grow or the run ends. Jokers multiply
       each other, so the fun is discovering that two cards you already own
       combine into something absurd.
     - AdVenture Capitalist compounds. Every purchase raises the RATE, so the
       numbers do not climb, they accelerate, and there is always a next
       threshold sitting just out of reach.

   Daylight paid a flat rate and a flat 75 XP per day, forever, from the
   first day to the thousandth. Linear, no build, no stakes, nothing that
   changes. No amount of CSS was ever going to fix that.

   So: chips x mult, live, on the board.

     CHIPS  what he actually did today, from the record.
     MULT   what his consistency has earned, plus whatever the jokers add.
     SCORE  chips x mult, which is the number that grows, and the number the
            week's target is measured in.

   THE ONE RULE THIS FILE MUST NOT BREAK. Every number here is a pure
   function of the record. The game layer can read the ledger; it can never
   write to it. A multiplier is a way of SCORING days he actually had - it
   can never invent one, move one, or make a missed day count. That is the
   property the whole app has been built on since v4 and it is worth more
   than any mechanic: if the numbers can drift, they mean nothing, and a
   number that means nothing is not motivating for long.

   Which is also why the pot is deliberately NOT part of this. The pot is
   real money he pays himself at a rate he chose. Compounding it would mean
   the app quietly deciding a good month owes him three hundred pounds. The
   money stays linear and honest; the compounding lives in the score.
   ======================================================================== */

/* ------------------------------------------------------------- the chips
   What a day is worth before any multiplier: the three that carry the day,
   then the small things, each worth a little. Written as a table so the
   board can show its working - "where did 148 come from" has to be
   answerable by looking, the way Balatro shows every chip that scored. */
var CHIP = {
  pillar: 30,        /* each of the three */
  session: 15,       /* a gym session written down move by move */
  routine: 6,        /* sunscreen, moisturiser, the wind-down */
  vital: 4,          /* each of the five basics */
  card: 25,          /* the day's card, actually lived */
  person: 8          /* each person spoken to beyond the first */
};

/* Every line that scored today, in order, with what it paid. The board
   renders this directly; nothing computes a total the list cannot explain. */
function chipLines(k){
  k = k || today();
  var out = [];
  PILLARS.forEach(function(g){
    if (pDone(k, g[0])) out.push({ id: g[0], label: g[1], n: CHIP.pillar, pil: g[4] });
  });
  if (S.lifts && S.lifts[k] && Object.keys(S.lifts[k].ex || {}).length)
    out.push({ id: "sess", label: "Session logged", n: CHIP.session });
  if (typeof spokeToday === "function"){
    var extra = spokeToday(k).length - 1;
    if (extra > 0) out.push({ id: "ppl", label: extra + " more at home", n: CHIP.person * extra });
  }
  if (typeof ROUTINES !== "undefined" && typeof careOn === "function"){
    var r = ROUTINES.filter(function(x){ return careDue(x[0], k) && careOn(k, x[0]); });
    if (r.length) out.push({ id: "care", label: r.length === 1 ? r[0][1] : r.length + " routines",
                             n: CHIP.routine * r.length });
  }
  if (typeof VITALS !== "undefined" && typeof vitalMet === "function"){
    var v = VITALS.filter(function(x){ return vitalMet(x[0], k); });
    if (v.length) out.push({ id: "vit", label: v.length + " of the basics", n: CHIP.vital * v.length });
  }
  if (typeof questFor === "function"){
    var q = questFor(k);
    if (q && q.done) out.push({ id: "card", label: "Card lived", n: CHIP.card });
  }
  /* the jokers that pay in chips rather than mult, each on its own line so
     the board can show which card earned it */
  if (typeof jokersHeld === "function"){
    jokersHeld().forEach(function(j){
      if (j[5].kind !== "chips") return;
      var on = false;
      try { on = !!j[4](k); } catch(e){ on = false; }
      if (on) out.push({ id: "j:" + j[0], label: j[1], n: j[5].n, joker: 1 });
    });
  }
  return out;
}
function chipsOn(k){
  return chipLines(k).reduce(function(a, x){ return a + x.n; }, 0);
}
/* The most a day could pay, so the board can show how much is still on the
   table. Only counts what is actually available today - a Saturday has no
   shift to finish, and sunscreen in a Sheffield January is not owed. */
function chipsMax(k){
  k = k || today();
  var n = 0;
  PILLARS.forEach(function(g){ if (required(g[0], k) || pDone(k, g[0])) n += CHIP.pillar; });
  n += CHIP.session;
  if (typeof ROUTINES !== "undefined" && typeof careDue === "function")
    n += CHIP.routine * ROUTINES.filter(function(x){ return careDue(x[0], k); }).length;
  if (typeof VITALS !== "undefined") n += CHIP.vital * VITALS.length;
  if (typeof questFor === "function" && questFor(k)) n += CHIP.card;
  return n;
}

/* -------------------------------------------------------------- the mult
   Earned, never given. Each source is a fact about the record that he could
   verify by counting, which is the difference between a multiplier that
   motivates and one that patronises.

   It compounds the way AdVenture Capitalist compounds: the longer it runs,
   the more each further day is worth, so the cost of breaking it rises with
   every day it survives. That is the whole mechanic. */
/* Tuned so the caps are a month and two months of work rather than a
   fortnight - the ceiling has to be far enough away to be worth walking
   toward, and close enough that it is not a joke. Base mult tops out at
   4.4; the jokers are what take it past that, which is what makes them
   worth choosing between. */
var MULT_PER_DAY = 0.06, MULT_DAY_CAP = 1.8;
var MULT_PER_WEEK = 0.2, MULT_WEEK_CAP = 1.6;

/* The run ENTERING a day: consecutive full days strictly before it, with
   carried days passing the run across without counting.

   This matters more than it looks. The first cut read dayRun() - today's
   run - for every day it scored, so last Tuesday was scored with this
   morning's multiplier and the week total climbed every time he ticked
   something. A week's score has to be a fact about that week, not a number
   that moves under him, or the ante means nothing. */
function runBefore(k){
  var n = 0, d = new Date(k + "T00:00:00");
  for (var i = 0; i < 400; i++){
    d.setDate(d.getDate() - 1);
    var j = iso(d);
    if (allThree(j)) n++;
    else if (typeof carried === "function" && carried(j)) continue;
    else break;
  }
  return n;
}
/* Weeks kept strictly before the week k falls in. */
function weeksBefore(k){
  if (typeof weekKeys !== "function") return 0;
  var wk = weekKey(new Date(k + "T00:00:00"));
  return weekKeys().filter(function(x){ return x < wk && weekKept(x); }).length;
}
function multLines(k){
  k = k || today();
  var out = [{ id: "base", label: "Base", n: 1, kind: "add" }];
  /* rounded on the way out: 12 * 0.1 is 1.2000000000000002 in binary
     floating point, and the board prints these verbatim */
  var r2 = function(n){ return Math.round(n * 100) / 100; };
  var run = runBefore(k);
  if (run > 0) out.push({ id: "run", label: run + (run === 1 ? " day running" : " days running"),
                          n: r2(Math.min(MULT_DAY_CAP, run * MULT_PER_DAY)), kind: "add" });
  var wr = weeksBefore(k);
  if (wr > 0) out.push({ id: "weeks", label: wr + (wr === 1 ? " week kept" : " weeks kept"),
                         n: r2(Math.min(MULT_WEEK_CAP, wr * MULT_PER_WEEK)), kind: "add" });
  if (typeof jokerLines === "function") jokerLines(k).forEach(function(j){ out.push(j); });
  return out;
}
function multOn(k){
  var add = 0, times = 1;
  multLines(k).forEach(function(x){
    if (x.kind === "times") times *= x.n; else add += x.n;
  });
  return Math.round(add * times * 100) / 100;
}
function scoreOn(k){
  k = k || today();
  return Math.round(chipsOn(k) * multOn(k));
}
/* What the day would be worth if he finished everything still open. The
   number the board dangles, and the reason to come back to it at 22:00. */
function scoreCeiling(k){
  k = k || today();
  return Math.round(chipsMax(k) * multOn(k));
}

/* ------------------------------------------------------------- the ledger
   Score over any span, recomputed from the record every time. Nothing is
   stored, so a day edited after the fact corrects every total that depends
   on it - the property that has kept this app honest since v4. */
function scoreWeek(wk){
  if (typeof weekAll !== "function") return 0;
  var t = today();
  return weekAll(wk || weekKey()).reduce(function(a, k){
    return a + (k <= t ? scoreOn(k) : 0);
  }, 0);
}

/* ---------------------------------------------------------------- the ante
   Balatro's escalation, in a shape that suits a life rather than a card
   game: the week has a score target, and the target climbs with every week
   he keeps. Week two is gentle. Week thirty is not, and by then the engine
   has had thirty weeks to grow into it.

   Failing an ante resets the week multiplier and NOTHING else. The record is
   never touched, no day is taken away, and the app does not scold - a missed
   week on a bad fortnight is information, not a punishment. Stakes without
   punishment is the whole trick, and it is the one thing Balatro cannot
   teach this app, because Balatro is allowed to end your run. */
/* The target is measured against HIS OWN best week, not a blind exponential.

   The first cut was geometric - base 420 climbing 14% a week - and it broke
   in both directions. Week 52 asked for 335,270 against an engine that can
   produce about 4,000 on its best day, so the ladder became impossible some
   time in the spring; and early on it ignored what he was actually capable
   of. A target nobody can hit is not a stake, it is a countdown to quitting.

   So it tracks him: a bit under his best week so far, with a floor for the
   first few weeks before there is a best to speak of. It ratchets when he
   has a great week, stops climbing when he plateaus, and can never become
   unreachable - because he has, by definition, already reached it once. */
var ANTE_FLOOR = 450, ANTE_OF_BEST = 0.85;
function weekScores(){
  if (typeof weekKeys !== "function") return [];
  var t = today();
  return weekKeys().filter(function(wk){
    return weekAll(wk)[6] < t;                   /* finished weeks only */
  }).map(scoreWeek);
}
function bestWeekScore(){
  var all = weekScores();
  return all.length ? Math.max.apply(null, all) : 0;
}
function anteFor(){
  var best = bestWeekScore();
  return Math.max(ANTE_FLOOR, Math.ceil(best * ANTE_OF_BEST / 10) * 10);
}
function anteState(wk){
  wk = wk || (typeof weekKey === "function" ? weekKey() : null);
  var kept = typeof weeksKept === "function" ? weeksKept() : 0;
  var target = anteFor();
  var got = scoreWeek(wk);
  var days = typeof weekAll === "function" ? weekAll(wk) : [];
  var t = today();
  var left = days.filter(function(k){ return k > t; }).length;
  var pace = left > 0 ? Math.ceil((target - got) / (left + 1)) : Math.max(0, target - got);
  return {
    wk: wk, n: kept + 1, target: target, got: got,
    pct: Math.max(0, Math.min(100, Math.round(got / target * 100))),
    beat: got >= target, left: left,
    need: Math.max(0, target - got),
    pace: Math.max(0, pace)
  };
}

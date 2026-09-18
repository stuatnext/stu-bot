"use strict";

/* ========================================================================
   games.js - the five mini games.

   His words: "treat it like mini games. Each tab is a mini game. And the
   bigger game is consistency. And the prizes for consistency are the cards.
   We can also give prizes for each mini game too."

   That is the whole shape of the app, said in three sentences, and it is a
   better description than anything I had written down. So:

     - Gym, Food, Water, Skin and Work are five short games. Each one has a
       name, a thing you are trying to do, a prize, and a run of days behind
       it. Each one opens on a START SCREEN - the object, the goal, what it
       pays, and one button - and shows you nothing else until you start.
       He asked for that outright: "I want a start screen before seeing any
       exercises."

     - Consistency is the game those five sit inside, and its prizes are the
       cards. Nothing in here touches that: packs are still what the three
       pillars earned, and a card is still a card.

     - The mini games pay SPARES, which is the currency that finishes a set.
       So the small loop feeds the big one rather than running beside it.

   Two rules this file keeps:

   1. A win is DERIVED, never stored. "Cleared" is a question asked of the
      record - eight glasses are in it or they are not - so the prize cannot
      be claimed twice, cannot drift, and is already true for every day he
      logged before this file existed.

   2. Nothing in here writes. It reads the record and returns numbers and
      HTML. The tabs' own buttons do the writing, as they always have.
   ======================================================================== */

/* id, tab, name, what it asks, spares */
var GAMES = [
  ["gym",   "gym",    "The Session",   "Move through the session",        3],
  ["food",  "food",   "Three Plates",  "Log all three meals",             3],
  ["water", "basics", "Eight Glasses", "Eight glasses before lights-out", 3],
  ["skin",  "skin",   "The Routine",   "Every routine the day asks for",  3],
  ["work",  "work",   "One Sitting",   "Move one thing off the list",     3]
];
/* All five in a day. The sweep is the thing to chase - the parts are small
   on purpose, the way a hand is worth more than its cards. */
var SWEEP = 10;

function gameRow(id){
  for (var i = 0; i < GAMES.length; i++) if (GAMES[i][0] === id) return GAMES[i];
  return null;
}
function gameName(id){ var r = gameRow(id); return r ? r[2] : ""; }
function gamePrize(id){ var r = gameRow(id); return r ? r[4] : 0; }

/* ------------------------------------------------------------ the win
   One question per game, asked of the record. */
function gameClear(id, k){
  k = k || today();
  if (id === "gym")   return !!(S.days && S.days[k] && S.days[k].p && S.days[k].p.train);
  if (id === "water") return waterOn(k) >= WATER_GLASSES;
  if (id === "food"){
    return ["morning", "midday", "dinner"].every(function(s){ return anchorDone(k, s); });
  }
  if (id === "skin"){
    var due = ROUTINES.filter(function(r){ return careDue(r[0], k); });
    return due.length > 0 && due.every(function(r){ return careOn(k, r[0]); });
  }
  if (id === "work"){
    var w = S.work || {};
    return Object.keys(w).some(function(x){ return w[x] === k; });
  }
  return false;
}
function gamesClearedOn(k){
  k = k || today();
  return GAMES.filter(function(g){ return gameClear(g[0], k); }).length;
}
function gameSwept(k){ return gamesClearedOn(k) === GAMES.length; }

/* Days in a row, today included if it is already won and never counted
   against him while it is still today - the same contract the routines run
   on, because a streak that punishes you at breakfast is a threat. */
function gameStreak(id){
  var n = 0, d = new Date();
  for (var i = 0; i < 400; i++){
    var k = iso(d);
    if (!gameClear(id, k)){
      if (i === 0){ d.setDate(d.getDate() - 1); continue; }
      break;
    }
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* ----------------------------------------------------------- the prizes
   Summed over the whole record, so the number is a fact about his days
   rather than a balance something has to remember to credit. Cached like
   xp() is, and thrown away by save() for the same reason. */
var GMC = null;
function gamesPaid(){
  if (GMC !== null) return GMC;
  var seen = {};
  [S.days, S.water, S.care, S.food].forEach(function(o){
    Object.keys(o || {}).forEach(function(k){ seen[k] = 1; });
  });
  Object.keys(S.work || {}).forEach(function(x){ seen[S.work[x]] = 1; });
  var n = 0;
  Object.keys(seen).forEach(function(k){
    if (!/^\d{4}-\d\d-\d\d$/.test(k)) return;
    GAMES.forEach(function(g){ if (gameClear(g[0], k)) n += g[4]; });
    if (gameSwept(k)) n += SWEEP;
  });
  GMC = n;
  return n;
}
/* What today is worth so far, for the line on a start screen. */
function gamesPaidOn(k){
  k = k || today();
  var n = 0;
  GAMES.forEach(function(g){ if (gameClear(g[0], k)) n += g[4]; });
  if (gameSwept(k)) n += SWEEP;
  return n;
}

/* --------------------------------------------------------- the start screen
   The furniture every one of the five tabs wears under its object: what it
   pays, how long the run is, how many of the five are in today, and the one
   button. Identical on all five, because they are the same kind of thing.

   Whether there is a button at all is the tab's call, not this function's -
   Food, Skin and Work have nothing left to run once they are won, but a Gym
   day can be Trained by a walk and still have a session in it. */
function gameBar(id, label, attr){
  var k = today(), won = gameClear(id, k), row = gameRow(id);
  if (!row) return "";
  var st = gameStreak(id), got = gamesClearedOn(k), swept = gameSwept(k);
  var h = "<div class='gm-bar" + (won ? " on" : "") + "'>";
  h += "<span class='gm-w'>" + (won ? "Won · +" + row[4] + " spares"
                                    : "+" + row[4] + " spares") + "</span>";
  if (st) h += "<span class='gm-s'>" + num(st) + (st === 1 ? " day" : " days") + "</span>";
  h += "<span class='gm-n'>" + got + "/" + GAMES.length + " today</span>";
  h += "</div>";
  if (swept) h += "<div class='gm-sweep'>All five, in one day. +" + SWEEP + " spares.</div>";
  if (label && attr)
    h += "<div class='actionbar'><button " + attr + ">" + esc(label) + "</button></div>";
  return h;
}

/* The one line under the object, before he has started: what this game is.
   After it is won it says so instead. */
function gameGoal(id, wonLine){
  var row = gameRow(id);
  if (!row) return "";
  return gameClear(id, today()) ? (wonLine || "Won.") : row[3] + ".";
}

/* ---------------------------------------------------- the five, together
   On the Cards tab, because that is where his sentence lands: the mini
   games pay spares, the spares finish sets, and the sets are the prize for
   being consistent. One row, five names, what today has paid. */
function gamesRowHTML(){
  var k = today(), got = gamesClearedOn(k), paid = gamesPaidOn(k);
  var h = "<div class='rulehead'><h3>Today\u2019s five</h3><span></span><em>"
    + got + " of " + GAMES.length + (paid ? " \u00b7 +" + paid + " spares" : "") + "</em></div>";
  h += "<div class='gm-five'>";
  GAMES.forEach(function(g){
    var on = gameClear(g[0], k), st = gameStreak(g[0]);
    h += "<button class='gm-g" + (on ? " on" : "") + "' data-tab='" + esc(g[1]) + "'>"
      + "<span class='gm-gt'>" + esc(g[2]) + "</span>"
      + "<span class='gm-gs'>" + (on ? "won" : "+" + g[4]) + "</span>"
      + "<span class='gm-gr'>" + (st ? num(st) + "d" : "\u2014") + "</span>"
      + "</button>";
  });
  h += "</div>";
  if (gameSwept(k)) h += "<p class='fine'>All five, in one day. That is the sweep.</p>";
  else h += "<p class='fine'>Each one pays spares, and spares finish a set. "
    + "The cards are what consistency pays.</p>";
  return h;
}

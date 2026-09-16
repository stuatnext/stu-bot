"use strict";

/* ========================================================================
   jokers.js - the conditions.

   The word "joker" is gone from everything he can see, and the reason is his:
   "I didn't ask for a copy of Balatro." A card called a Joker sitting in a
   slot above an Ante is that game's furniture wearing his life. What is
   underneath it is not borrowed at all - these are standing facts about how
   he lives, and each one changes what a day is worth. So they are called
   conditions, like weather, which is what they are: things that are true of
   the world today whether he arranged them or not.

   The deck has 188 cards in it, written about his actual life - the hawker
   stalls, the Sheffield set, the Mandarin, the Malta shift - and every one
   of them sat in a binder doing nothing. A collection you cannot play with
   is wallpaper, and wallpaper is not a reason to open a pack.

   Balatro's jokers are sticky for one reason above all others: they combine.
   The joy is not owning a good card, it is noticing that two cards you have
   had for ten minutes multiply into something absurd. So these are written
   to overlap on purpose. "Eight Hours Behind" wants him to ring home before
   the shift; "Malta Shift" wants him to stop on time; "Red-Eye" makes the
   travel days that break both of those count anyway. Run all three and a
   week in Lisbon scores better than a week at home, which is exactly the
   week that used to be hardest.

   Rules they all obey:

     1. A joker can only ever read the record. None of them can mark a day,
        move a day, or make a missed day count. They change the SCORE of
        what happened, never what happened.
     2. Every condition is something he could check himself. No hidden rolls,
        no "lucky" cards - this is his life and the app does not get to
        invent facts about it.
     3. None of them can go negative. There is no card in here that punishes,
        because a habit app that fines you is one you delete.

   [ id, name, what it says, slot cost, test(k) -> bool, effect, short ]

   short is the label the chip on the board wears, and it is LAST on purpose:
   putting it second would have shifted every other column and every consumer
   that reads them. Taking the first word of the name instead was the first
   attempt and "The Room Is The Gym" rendered as "The".
   effect: { kind:"chips", n } adds flat chips
           { kind:"add",   n } adds to the multiplier
           { kind:"times", n } multiplies the multiplier - the rare ones */
var JOKERS = [
  ["malta", "Malta Shift",
   "The shift ends at 23:00 whether or not you do. Stop on time and the whole day scores half again.",
   1, function(k){ return pDone(k, "stop"); }, { kind: "times", n: 1.5 }, "Malta"],

  ["behind", "Eight Hours Behind",
   "Sheffield is asleep when you are working. Call home on a day you also trained: +60 chips.",
   1, function(k){ return pDone(k, "family") && pDone(k, "train"); }, { kind: "chips", n: 60 }, "8h back"],

  ["room", "The Room Is The Gym",
   "Trained, from somewhere that is not Singapore. +0.5 mult.",
   1, function(k){
     var sit = typeof situation === "function" ? situation(k) : null;
     return pDone(k, "train") && sit && !sit.home;
   }, { kind: "add", n: 0.5 }, "The room"],

  ["redeye", "Red-Eye",
   "A day in the air still scores. Travel days pay 80 chips even when nothing else lands.",
   1, function(k){ return typeof flying === "function" && flying(k); }, { kind: "chips", n: 80 }, "Red-eye"],

  ["kopi", "Kopi C, Siew Dai",
   "Protein before noon and eight glasses in. +0.4 mult.",
   1, function(k){
     return typeof vitalMet === "function" && vitalMet("protein", k) && vitalMet("water", k);
   }, { kind: "add", n: 0.4 }, "Kopi"],

  ["wed", "Mum\u2019s Day",
   "Wednesday, and you rang home. +0.75 mult.",
   1, function(k){
     return new Date(k + "T00:00:00").getDay() === 3 && pDone(k, "family");
   }, { kind: "add", n: 0.75 }, "Mum"],

  ["early", "Before Malta Wakes",
   "A session written down move by move. +45 chips.",
   1, function(k){
     return !!(S.lifts && S.lifts[k] && Object.keys(S.lifts[k].ex || {}).length);
   }, { kind: "chips", n: 45 }, "Early"],

  ["clean", "Clear Day",
   "All five basics met. Doubles the day.",
   2, function(k){
     return typeof vitalsMet === "function" && typeof VITALS !== "undefined"
       && vitalsMet(k) === VITALS.length;
   }, { kind: "times", n: 2 }, "Clear"],

  ["skin", "The Whole Routine",
   "Every routine the day asked for. +0.6 mult.",
   1, function(k){
     if (typeof ROUTINES === "undefined" || typeof careDue !== "function") return false;
     var due = ROUTINES.filter(function(x){ return careDue(x[0], k); });
     return due.length > 0 && due.every(function(x){ return careOn(k, x[0]); });
   }, { kind: "add", n: 0.6 }, "Routine"],

  ["weekend", "No Shift Today",
   "Saturday or Sunday, and the two that were owed both landed. +0.5 mult.",
   1, function(k){
     if (typeof isWeekend !== "function" || !isWeekend(k)) return false;
     return pDone(k, "train") && pDone(k, "family");
   }, { kind: "add", n: 0.5 }, "Weekend"],

  ["back", "The First Day Back",
   "A comeback pays for itself. Doubles the day you return.",
   2, function(k){ return typeof isComebackDay === "function" && isComebackDay(k); },
   { kind: "times", n: 2 }, "Back"],

  ["full", "Three Things Make A Day",
   "All three, every time. +0.5 mult.",
   1, function(k){ return typeof allThree === "function" && allThree(k); },
   { kind: "add", n: 0.5 }, "Three"]
];

var JOKER_SLOTS_BASE = 3, JOKER_SLOTS_MAX = 5;

/* Set when a pack grants one, read and cleared when the card ceremony ends -
   so the reveal lands on a clear screen instead of competing with the pull. */
var JOKER_PULLED = null;
function showJokerPull(){
  if (!JOKER_PULLED) return;
  var j = jokerById(JOKER_PULLED);
  JOKER_PULLED = null;
  if (!j) return;
  var inSlot = jokerHeld(j[0]);
  sfx("done"); buzz([20, 50, 30]);
  ask({
    title: "A new condition",
    say: "<b>" + esc(j[1]) + "</b><br>" + esc(j[2]) + "<br><br>"
       + (inSlot ? "It is in a slot already \u2014 it scores from today."
                 : "No room for it yet. Swap it in from the conditions sheet."),
    confirm: inSlot ? "Good" : "Choose a slot", cancel: "Later"
  }).then(function(v){ if (v && !inSlot) askJokers(); else render({ keepScroll: true }); });
}

function jokerById(id){
  for (var i = 0; i < JOKERS.length; i++) if (JOKERS[i][0] === id) return JOKERS[i];
  return null;
}
/* Owned: pulled from a pack. Held: equipped into a slot. The distinction is
   the whole point - owning everything and running everything would make the
   choice disappear, and the choice is the game. */
function jokersOwned(){ return Object.keys(S.jokers || {}); }
function jokersHeld(){
  return ((S.jokerSlots || []).map(jokerById).filter(Boolean));
}
function jokerSlots(){
  return Math.min(JOKER_SLOTS_MAX, JOKER_SLOTS_BASE + (Number(S.slotsBought) || 0));
}
function jokerSlotsUsed(){
  return jokersHeld().reduce(function(a, j){ return a + j[3]; }, 0);
}
function jokerOwns(id){ return !!(S.jokers || {})[id]; }
function jokerHeld(id){ return ((S.jokerSlots || []).indexOf(id) !== -1); }

/* What the equipped jokers pay today. Pure over the record, like everything
   else here - the board asks this on every render and it can never disagree
   with what the day actually was. */
function jokerLines(k){
  k = k || today();
  var out = [];
  jokersHeld().forEach(function(j){
    var on = false;
    try { on = !!j[4](k); } catch(e){ on = false; }
    if (!on) return;
    var e = j[5];
    if (e.kind === "chips") return;                 /* chips are added in chipLines' total */
    out.push({ id: "j:" + j[0], label: j[1], n: e.n, kind: e.kind, joker: 1 });
  });
  return out;
}
function jokerChips(k){
  k = k || today();
  var n = 0;
  jokersHeld().forEach(function(j){
    if (j[5].kind !== "chips") return;
    var on = false;
    try { on = !!j[4](k); } catch(e){ on = false; }
    if (on) n += j[5].n;
  });
  return n;
}
/* Which of the equipped ones are live right now, for the board to light up. */
function jokerLive(k){
  k = k || today();
  var live = {};
  jokersHeld().forEach(function(j){
    try { live[j[0]] = !!j[4](k); } catch(e){ live[j[0]] = false; }
  });
  return live;
}

/* --------------------------------------------------------------- earning
   Jokers come out of the packs that already drop for a full day, so the
   pack finally means something. Least-owned first so the set fills rather
   than repeating, and nothing is random enough to feel unfair. */
function jokerDue(){
  var owned = jokersOwned();
  if (owned.length >= JOKERS.length) return null;
  var pool = JOKERS.filter(function(j){ return !jokerOwns(j[0]); });
  var t = today();
  return pool[hashOf(t + ":" + owned.length) % pool.length];
}
function grantJoker(id){
  var j = jokerById(id);
  if (!j || jokerOwns(id)) return null;
  S.jokers = S.jokers || {};
  S.jokers[id] = today();
  /* straight into a slot while there is room, so the first ones need no
     explaining - he sees the mult move on the next tick */
  if (jokerSlotsUsed() + j[3] <= jokerSlots()){
    S.jokerSlots = (S.jokerSlots || []).concat([id]);
  }
  save();
  return j;
}
function equipJoker(id){
  var j = jokerById(id);
  if (!j || !jokerOwns(id)) return false;
  if (jokerHeld(id)){
    S.jokerSlots = (S.jokerSlots || []).filter(function(x){ return x !== id; });
    save(); return true;
  }
  if (jokerSlotsUsed() + j[3] > jokerSlots()) return false;
  S.jokerSlots = (S.jokerSlots || []).concat([id]);
  save(); return true;
}

/* ----------------------------------------------------------- the sheet
   Which ones he owns, which are in, and what each is doing today. Tapping
   one equips or unequips it - the choice is the game, so it has to be one
   tap and reversible. */
function jokerSheetHTML(){
  var k = today(), live = jokerLive(k);
  var slots = jokerSlots(), used = jokerSlotsUsed();
  var owned = JOKERS.filter(function(j){ return jokerOwns(j[0]); });
  var h = "<div class='jslots'>" + used + " of " + slots + " in play</div>";
  if (!owned.length){
    return h + "<p class='say'>None yet. Every streak pack carries one, and every "
      + "third day pack — so the packs are finally worth opening.</p>";
  }
  h += "<div class='jlist'>";
  owned.forEach(function(j){
    var inSlot = jokerHeld(j[0]), on = live[j[0]];
    h += "<button class='jcard" + (inSlot ? " in" : "") + (on && inSlot ? " live" : "") + "'"
      + " data-mk='j:" + esc(j[0]) + "'>"
      + "<span class='jc-h'><b>" + esc(j[1]) + "</b>"
      + "<span class='jc-v'>" + (j[5].kind === "times" ? "×" + j[5].n
          : j[5].kind === "add" ? "+" + j[5].n + " mult" : "+" + j[5].n + " chips") + "</span></span>"
      + "<span class='jc-d'>" + esc(j[2]) + "</span>"
      + "<span class='jc-s'>" + (inSlot ? (on ? "in play · true today" : "in play") : "set aside")
      + (j[3] > 1 ? " · " + j[3] + " slots" : "") + "</span>"
      + "</button>";
  });
  return h + "</div>";
}
async function askJokers(){
  for (var guard = 0; guard < 40; guard++){
    var v = await ask({
      title: "Conditions",
      say: "Standing facts about how you live. Each one changes what a day is worth - and they only ever score days you actually had. Tap one to put it in or take it out.",
      html: jokerSheetHTML(),
      cancel: "Done"
    });
    if (!v || v.indexOf("j:") !== 0) return;
    var id = v.slice(2);
    if (!equipJoker(id)){
      sfx("no");
      toast("No room. Take one out first.");
    } else { sfx("tick"); buzz(10); render({ keepScroll: true }); }
  }
}

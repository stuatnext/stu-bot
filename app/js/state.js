"use strict";

/* ========================================================================
   state.js - the save, the clock, and every rule of the game.

   All state lives in localStorage under one key that has not changed since
   v4: a nine-generation-old save opens in this build with its days, cards,
   pot and freezes intact. Every count here is recomputed from the record
   rather than incremented, so nothing can drift.
   ======================================================================== */
/* ---------------------------------------------------------------- storage
   v5 reads a v4 save untouched: every field the old app wrote still means the
   same thing, and the two new ones (crafted, spent spares) default empty. */
var KEY = "daylight.v4";
var S = load();

function load(){
  var d = { camp:"Singapore", wake:"08:30", bed:"23:45", done:{}, skip:{}, filter:0,
            days:{}, threads:{}, cards:{}, rewards:{}, claimed:{}, openedDay:0, openedStreak:0,
            theme:null, mute:false, rate:0, spends:[], freezes:{},
            crafted:{}, sparesSpent:0, seen:{}, booted:0, onboarded:0, cardsWhy:0 };
  try {
    var raw = localStorage.getItem(KEY);
    if (raw){ var p = JSON.parse(raw); for (var k in d) if (k in p) d[k] = p[k]; }
  } catch(e){}
  /* A save with history belongs to someone who already knows what the three
     are. Only a genuinely empty one gets the tutorial board. */
  if (!d.onboarded && Object.keys(d.days).length) d.onboarded = 1;
  return d;
}
function save(){ FD = null; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }

/* days[iso] = { p:{}, said:"...", kept:bool, bedok:bool, gap:"..." } */
function day(iso){
  var d = S.days[iso];
  if (!d){ d = S.days[iso] = { p:{} }; }
  if (!d.p) d.p = {};
  return d;
}

/* ---------------------------------------------------------------- dates */
function iso(d){
  return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-"
       + String(d.getDate()).padStart(2,"0");
}
function today(){ return iso(new Date()); }
function shift(n){ var d = new Date(); d.setDate(d.getDate()+n); return iso(d); }
function nice(s){
  var p = s.split("-"), m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return Number(p[2]) + " " + m[Number(p[1])-1];
}
/* Saturday and Sunday. There is no Malta shift on either, which is the whole
   reason the "Stopped" pillar behaves differently on them. */
function isWeekend(k){
  var d = new Date(k + "T00:00:00").getDay();
  return d === 0 || d === 6;
}

/* ---------------------------------------------------------------- day shape */
function t2m(s){ var p = s.split(":"); return Number(p[0])*60 + Number(p[1]); }
function hhmm(m){ m = ((m % 1440) + 1440) % 1440;
  return String(Math.floor(m/60)).padStart(2,"0") + ":" + String(m%60).padStart(2,"0"); }
function offset(){
  for (var i=0;i<CAMPS.length;i++) if (CAMPS[i][0] === S.camp) return CAMPS[i][1];
  return 480;
}
function shape(){
  var off = offset(), wake = t2m(S.wake);
  var w = workUTC(new Date());
  var start = w[0] + off, end = w[1] + off;
  var n = new Date(), nowLocal = n.getHours()*60 + n.getMinutes();
  return {
    start:start, end:end, wake:wake, now:nowLocal,
    startT:hhmm(start), endT:hhmm(end),
    morning:Math.max(0, start - wake),
    evening:Math.max(0, 1380 - end),
    untilWork:start - nowLocal,
    working: nowLocal >= start && nowLocal < end,
    late: end >= 1440,
    weekend: isWeekend(today())
  };
}
function dur(m){
  m = Math.max(0, Math.round(m));
  var h = Math.floor(m/60), r = m%60;
  if (h && r) return h + "h " + r + "m";
  return h ? h + "h" : r + "m";
}

/* ------------------------------------------------------------ the three
   A pillar is required on a day when it is possible to do it honestly.
   "Stopped" means finishing when the shift finishes, and at the weekend there
   is no shift to finish - so it is carried rather than owed. This is the same
   rule his Mandarin study already runs on: weekdays only, the weekend absorbed
   rather than counted as a failure. It only ever adds days; nothing he has
   already earned can go down. */
function required(key, k){
  if (key === "stop" && isWeekend(k)) return false;
  return true;
}
function pDone(k, key){
  var d = S.days[k];
  return !!(d && d.p && d.p[key]);
}
/* Satisfied for the purposes of a full day and a streak: either ticked, or not
   owed today. */
function pMet(k, key){ return pDone(k, key) || !required(key, k); }
function allThree(k){
  return PILLARS.every(function(g){ return pMet(k, g[0]); })
      && PILLARS.some(function(g){ return pDone(k, g[0]); });
}
function monthOf(k){ return k.slice(0, 7); }

/* The number the flame wears: consecutive full days ending today or
   yesterday, frozen days carrying the run without counting. */
function dayRun(){
  var n = 0, d = new Date(), k = iso(d);
  if (!allThree(k)){ d.setDate(d.getDate() - 1); k = iso(d); }
  while (allThree(k) || frozen(k)){
    if (allThree(k)) n++;
    d.setDate(d.getDate() - 1); k = iso(d);
  }
  return n;
}

/* The first day this pillar was ever recorded. Nothing before it counts as a
   miss - days before he started using the app are not failures. */
function firstDay(key){
  var ks = Object.keys(S.days).filter(function(k){ return pDone(k, key); }).sort();
  return ks.length ? ks[0] : null;
}

/* Freezes are spent by hand. An earlier version spent them the moment the
   streak walker found a gap, which meant they were gone before he knew a day
   had gone wrong - a safety net you cannot feel is not a safety net. */
function frozen(k){ return !!(S.freezes || {})[k]; }
function freezesUsed(month){
  return Object.keys(S.freezes || {}).filter(function(k){ return monthOf(k) === month; }).length;
}
function freezesLeft(month){
  return Math.max(0, FREEZES_PER_MONTH - freezesUsed(month || monthOf(today())));
}
function canFreeze(k){
  if (k > today() || allThree(k)) return false;
  return frozen(k) || freezesLeft(monthOf(k)) > 0;
}

/* Walk back from today. A frozen day carries the run across without counting
   toward it. A day the pillar was not owed on is skipped entirely. */
function streak(key){
  var first = firstDay(key);
  if (!first) return 0;
  var n = 0, now = new Date();
  for (var i = 0; i < 500; i++){
    var k = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
    if (k < first) break;
    if (pDone(k, key)){ n++; continue; }
    if (!required(key, k)) continue;        /* no shift to finish, so nothing owed */
    if (k === today()) continue;            /* today is not a miss until it is over */
    if (frozen(k)) continue;                /* spent deliberately, on this date */
    break;
  }
  return n;
}
function bestStreak(){
  return Math.max.apply(null, PILLARS.map(function(g){ return streak(g[0]); }));
}
function totalDone(key){
  var n = 0;
  Object.keys(S.days).forEach(function(k){ if (pDone(k, key)) n++; });
  return n;
}

/* Counted once per change rather than once per card per pack draw. */
var FD = null;
function fullDays(){
  if (FD === null) FD = Object.keys(S.days).filter(allThree).length;
  return FD;
}

/* --------------------------------------------------------------- the packs
   Recomputed from the record rather than incremented, so nothing can drift and
   nothing can be lost. That property is worth more than any urgency mechanic,
   which is why there are no timers and nothing expires. */
function packCounts(){
  var full = Object.keys(S.days).filter(allThree).sort();
  var streakPacks = 0, run = 0, prev = null;
  full.forEach(function(k){
    if (prev){
      var gap = Math.round((new Date(k) - new Date(prev)) / 86400000);
      run = gap === 1 ? run + 1 : 1;
    } else run = 1;
    if (run % 7 === 0) streakPacks++;
    prev = k;
  });
  return { day: full.length, streak: streakPacks };
}
function packsWaiting(){
  var e = packCounts();
  return { day: Math.max(0, e.day - (S.openedDay || 0)),
           streak: Math.max(0, e.streak - (S.openedStreak || 0)) };
}
function packsTotal(){ var w = packsWaiting(); return w.day + w.streak; }

/* Weights track the pool rather than a guess at it, so a common pull is not
   four commons deep before an uncommon appears. */
function poolWeights(){
  var n = [0,0,0], i;
  for (i = 0; i < CARDS.length; i++) if (inPool(CARDS[i])) n[CARDS[i][1]]++;
  var t = n[0] + n[1] + n[2];
  if (!t) return [62, 27, 11];
  /* A mild bias toward common, so rare stays worth something. */
  return [n[0] / t * 100 * 1.25, n[1] / t * 100, n[2] / t * 100 * 0.72];
}
function rollRarity(r, boosted){
  var w = poolWeights();
  if (boosted) w = [w[0] * 0.62, w[1] * 1.15, w[2] * 2.1];
  var total = w[0] + w[1] + w[2], x = r * total;
  if (x < w[0]) return 0;
  if (x < w[0] + w[1]) return 1;
  return 2;
}

/* Gold is earned by hand and locked sets are not his yet, so neither can turn
   up in a pack. Pulling a card for a set you cannot see is a bug that looks
   like a feature until you try to find it. */
function inPool(c){ return c[2] !== "gold" && setOpen(c[2]); }

function openPack(kind){
  var size = kind === "streak" ? STREAK_PACK_SIZE : PACK_SIZE;
  var boosted = kind === "streak";
  var got = [], seed = (Date.now() ^ (Math.random() * 4294967296)) >>> 0;
  for (var n = 0; n < size; n++){
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    var rar = rollRarity(((seed >>> 8) & 0xffff) / 65536, boosted);
    var tier = CARDS.filter(function(c){ return c[1] === rar && inPool(c); });
    if (!tier.length) tier = CARDS.filter(function(c){ return c[1] === 0 && inPool(c); });
    if (!tier.length) tier = CARDS.filter(inPool);
    if (!tier.length) break;
    var fresh = tier.filter(function(c){ return !(S.cards || {})[c[0]] && got.indexOf(c[0]) < 0; });
    var from = fresh.length ? fresh : tier.filter(function(c){ return got.indexOf(c[0]) < 0; });
    if (!from.length) from = tier;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    var card = from[seed % from.length];
    got.push(card[0]);
    S.cards = S.cards || {};
    S.cards[card[0]] = (S.cards[card[0]] || 0) + 1;
    S.seen = S.seen || {};
    if (S.cards[card[0]] === 1) S.seen[card[0]] = 0;   /* new, not yet looked at */
  }
  if (kind === "streak") S.openedStreak = (S.openedStreak || 0) + 1;
  else S.openedDay = (S.openedDay || 0) + 1;
  save();
  return got;
}

/* ---------------------------------------------------------------- spares
   Seventy-two per cent of everything he will ever pull is a card he already
   holds. That used to be worth nothing. Now a spare is worth spares, and
   spares finish a set.

   They are not money. They never appear on the Pot screen, nothing converts
   between the two, and they cannot buy a pack - a pack is what the three
   pillars earned or it is not a pack. Recomputed from the record, like
   everything else here, so the number cannot drift. */
function sparesEarned(){
  var n = 0, held = S.cards || {};
  CARDS.forEach(function(c){
    var have = held[c[0]] || 0;
    if (have > 1) n += (have - 1) * RARITY[c[1]][4];
  });
  return n;
}
function spares(){ return Math.max(0, sparesEarned() - (S.sparesSpent || 0)); }
function craftCost(c){ return RARITY[c[1]][5]; }
function canCraft(c){
  return !!c && c[1] !== 3 && !(S.cards || {})[c[0]] && setOpen(c[2]) && spares() >= craftCost(c);
}
function craft(name){
  var c = cardByName(name);
  if (!canCraft(c)) return false;
  S.sparesSpent = (S.sparesSpent || 0) + craftCost(c);
  S.cards = S.cards || {};
  S.cards[name] = 1;
  S.crafted = S.crafted || {};
  S.crafted[name] = today();
  S.seen = S.seen || {};
  S.seen[name] = 0;
  save();
  return true;
}
/* ------------------------------------------------------------- collection */
var BY_NAME = {};
CARDS.forEach(function(c){ BY_NAME[c[0]] = c; });
function cardByName(n){ return BY_NAME[n]; }
function setNeeds(key){
  var s = SETS.filter(function(x){ return x[0] === key; })[0];
  return s && s[3] ? s[3] : 0;
}
function setOpen(key){ return fullDays() >= setNeeds(key); }
function setCards(key){ return CARDS.filter(function(c){ return c[2] === key; }); }
function setHeld(key){
  return setCards(key).filter(function(c){ return (S.cards || {})[c[0]]; }).length;
}
function setsComplete(){
  return SETS.filter(function(s){ return setHeld(s[0]) === setCards(s[0]).length; }).length;
}
function heldCount(){ return Object.keys(S.cards || {}).length; }
function goldHeld(){
  return CARDS.filter(function(c){ return c[1] === 3 && (S.cards || {})[c[0]]; }).length;
}
function newCount(){
  var n = 0, seen = S.seen || {};
  Object.keys(S.cards || {}).forEach(function(k){ if (seen[k] === 0) n++; });
  return n;
}
/* The nearest set to finishing. "One more card" is a much better prompt than
   "collect them all". */
function nearestSet(){
  var best = null;
  SETS.forEach(function(s){
    if (s[0] === "gold" || !setOpen(s[0])) return;
    var total = setCards(s[0]).length, have = setHeld(s[0]);
    if (have === total || have === 0) return;
    var left = total - have;
    if (!best || left < best.left) best = { set: s, left: left, have: have, total: total };
  });
  return best;
}
function nextDoor(){
  return SETS.filter(function(s){ return !setOpen(s[0]); })
             .sort(function(a, b){ return a[3] - b[3]; })[0] || null;
}

/* --------------------------------------------------------------- progression */
function xp(){
  var n = 0, held = S.cards || {};
  CARDS.forEach(function(c){ if (held[c[0]]) n += RARITY[c[1]][3]; });
  Object.keys(S.days).forEach(function(k){ if (allThree(k)) n += 15; });
  n += Object.keys(S.done || {}).length * 20;
  n += setsComplete() * 100;
  return n;
}
function rank(){
  var x = xp(), i = 0;
  for (var j = 0; j < RANKS.length; j++) if (x >= RANKS[j][0]) i = j;
  var next = RANKS[i + 1] || null;
  return { level: i + 1, name: RANKS[i][1], xp: x,
           from: RANKS[i][0], to: next ? next[0] : null, nextName: next ? next[1] : null };
}

/* ------------------------------------------------------------------- the pot
   His idea and a better one than XP: a number in real money that builds while
   he is consistent and goes down when he spends it on himself.

   He sets the rate, because a rate the app picked would be the app deciding
   what his consistency is worth. Everything else is a multiple of it, so the
   whole economy moves when he changes one number. */
function rate(){ var r = Number(S.rate); return r > 0 ? r : RATE_DEFAULT; }
function potEarned(){
  var r = rate(), pc = packCounts();
  return {
    days:     pc.day * r,
    streaks:  pc.streak * r * 2,
    sets:     setsComplete() * r * 3,
    trophies: goldHeld() * r * 5
  };
}
function potSpent(){
  return (S.spends || []).reduce(function(a, s){ return a + Number(s[1] || 0); }, 0);
}
function potTotal(){
  var e = potEarned();
  return e.days + e.streaks + e.sets + e.trophies;
}
function pot(){ return potTotal() - potSpent(); }
function money(n){
  return "$" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
}
function num(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

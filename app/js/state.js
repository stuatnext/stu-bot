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
            crafted:{}, sparesSpent:0, seen:{}, booted:0, onboarded:0, cardsWhy:0,
            quests:{}, lived:{}, chips:{}, chipRewards:{}, lastBackup:0,
            monthSeen:{}, pushOn:0,
            lifts:{}, food:{}, waist:[], kg:0,
            water:{}, sleep:{}, out:{} };
  try {
    var raw = localStorage.getItem(KEY);
    if (raw){ var p = JSON.parse(raw); for (var k in d) if (k in p) d[k] = p[k]; }
  } catch(e){}
  /* A save with history belongs to someone who already knows what the three
     are. Only a genuinely empty one gets the tutorial board. */
  if (!d.onboarded && Object.keys(d.days).length) d.onboarded = 1;
  return d;
}
function save(){
  FD = null;
  if (typeof TIERS !== "undefined") TIERS = null;
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){}
  mirrorState();
}
/* A copy of today's shape where the service worker can reach it (it cannot
   read localStorage), so the evening push can say what is actually open
   instead of guessing. Fire-and-forget; the app never waits on it. */
function mirrorState(){
  try {
    if (typeof caches === "undefined") return;
    var t = today();
    var open = PILLARS.filter(function(g){ return required(g[0], t) && !pDone(t, g[0]); })
                      .map(function(g){ return g[1]; });
    caches.open("daylight-state").then(function(c){
      return c.put("state", new Response(
        JSON.stringify({ day: t, open: open, run: dayRun() }),
        { headers: { "Content-Type": "application/json" } }));
    }).catch(function(){});
  } catch(e){}
}

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
/* ------------------------------------------------------------- side quests
   One held card a day asks something of him. Completing it pays spares and
   XP - never money, the pot stays consistency-only - and marks the card
   "lived", which no pack can do. */
function cardDo(c){
  return CARD_DO[c[0]] || SET_DO[c[2]](c[0]);
}
function questFor(k){
  var q = (S.quests || {})[k];
  var held = CARDS.filter(function(c){ return (S.cards || {})[c[0]]; });
  if (!held.length) return null;
  var skip = q && q.swaps ? q.swaps : 0;
  var h = 0, str = k + "~q" + skip;
  for (var j = 0; j < str.length; j++) h = (h * 31 + str.charCodeAt(j)) >>> 0;
  var c = held[h % held.length];
  return { card: c, text: cardDo(c), done: !!(q && q.done), swaps: skip };
}
function questsDone(){
  var n = 0;
  Object.keys(S.quests || {}).forEach(function(k){ if (S.quests[k].done) n++; });
  return n;
}

/* --------------------------------------------------------------- the chips
   Earned at the longest run he has ever held; never taken back. */
function bestRunEver(){
  var keys = Object.keys(S.days).filter(allThree).sort();
  if (!keys.length) return 0;
  var best = 0, run = 0;
  var d = new Date(keys[0] + "T00:00:00");
  var end = new Date(keys[keys.length - 1] + "T00:00:00");
  while (d <= end){
    var k = iso(d);
    if (allThree(k)){ run++; if (run > best) best = run; }
    else if (!frozen(k)) run = 0;
    d.setDate(d.getDate() + 1);
  }
  return best;
}
function chipsEarned(){
  var b = Math.max(bestRunEver(), dayRun());
  return CHIPS.filter(function(c){ return b >= c[0]; });
}
/* the next chip not yet celebrated, if the current run has reached it */
function chipDue(){
  var run = dayRun();
  for (var i = 0; i < CHIPS.length; i++){
    var t = CHIPS[i][0];
    if (run >= t && !(S.chips || {})[t]) return CHIPS[i];
  }
  return null;
}
/* Chips earned before chips existed are marked quietly at startup - a
   ceremony for something he did weeks ago would be the app applauding
   itself. Only a run that crosses a threshold live gets the moment. */
function backfillChips(){
  var b = bestRunEver(), touched = 0;
  S.chips = S.chips || {};
  CHIPS.forEach(function(c){
    if (b >= c[0] && !S.chips[c[0]]){ S.chips[c[0]] = today(); touched = 1; }
  });
  if (touched) save();
}

/* ---------------------------------------------------------------- next up
   What the hour points at. The shift is the spine: train before Malta
   wakes, family in the Sheffield-friendly window, stop when it closes. */
function nextUp(){
  var t = today(), sh = shape(), h = new Date().getHours(), dw = new Date().getDay();
  var open = PILLARS.filter(function(g){ return required(g[0], t) && !pDone(t, g[0]); })
                    .map(function(g){ return g[0]; });
  if (!open.length) return null;
  if (open.indexOf("stop") >= 0 && !sh.weekend && sh.now >= sh.end) return "stop";
  if (open.indexOf("family") >= 0 && (dw === 3 || (h >= 13 && h < 19))) return "family";
  if (open.indexOf("train") >= 0 && (sh.weekend || sh.now < sh.start)) return "train";
  return open[0];
}
function tipFor(key){
  var pool = TIPS[key] || [];
  if (!pool.length) return "";
  var k = today() + key, h = 0;
  for (var j = 0; j < k.length; j++) h = (h * 33 + k.charCodeAt(j)) >>> 0;
  return pool[h % pool.length];
}

/* ------------------------------------------------------------- the months
   His call, against the clean-reset school: a bad month is not deleted, it
   is remembered, because the pattern in it is the lesson. Everything here
   derives from the record - nothing new is stored, so it can never drift. */
function monthsWithData(){
  var set = {};
  Object.keys(S.days).forEach(function(k){ set[k.slice(0, 7)] = 1; });
  Object.keys(S.freezes || {}).forEach(function(k){ set[k.slice(0, 7)] = 1; });
  return Object.keys(set).sort();
}
function monthName(ym){
  return ["January","February","March","April","May","June","July","August",
    "September","October","November","December"][Number(ym.slice(5, 7)) - 1] + " " + ym.slice(0, 4);
}
function monthLedger(ym){
  var t = today();
  var first = null;
  PILLARS.forEach(function(g){
    var f = firstDay(g[0]);
    if (f && (!first || f < first)) first = f;
  });
  var start = new Date(ym + "-01T00:00:00");
  var end = new Date(start); end.setMonth(end.getMonth() + 1); end.setDate(0);
  /* a run standing at the 1st carries in from last month - walk back so the
     month is credited with the run he was actually on */
  var run = 0, back = new Date(start);
  for (;;){
    back.setDate(back.getDate() - 1);
    var bk = iso(back);
    if (allThree(bk)) run++;
    else if (!frozen(bk)) break;
  }
  var full = 0, possible = 0, best = run, frozenUsed = 0;
  var missPW = { train:[0,0,0,0,0,0,0], family:[0,0,0,0,0,0,0], stop:[0,0,0,0,0,0,0] };
  var d = new Date(start);
  for (; d <= end; d.setDate(d.getDate() + 1)){
    var k = iso(d);
    if (k > t) break;
    if (!first || k < first) continue;
    /* today is still being played - it cannot have "broken" yet */
    if (k === t && !allThree(k)) break;
    possible++;
    if (allThree(k)){ full++; run++; if (run > best) best = run; }
    else if (frozen(k)){ frozenUsed++; }
    else {
      run = 0;
      var dw = new Date(k + "T00:00:00").getDay();
      PILLARS.forEach(function(g){
        if (required(g[0], k) && !pDone(k, g[0])) missPW[g[0]][dw]++;
      });
    }
  }
  var quests = Object.keys(S.quests || {}).filter(function(k){
    return k.slice(0, 7) === ym && S.quests[k].done;
  }).length;
  var chips = Object.keys(S.chips || {}).filter(function(c){
    return String((S.chips || {})[c]).slice(0, 7) === ym;
  }).map(Number).sort(function(a, b){ return a - b; });
  return { ym: ym, full: full, possible: possible, best: best,
           frozenUsed: frozenUsed, missPW: missPW, quests: quests, chips: chips,
           lesson: monthLesson(missPW, possible) };
}
/* One deterministic sentence per month: which pillar broke, and whether the
   breaks cluster on a weekday. Code, not model - the lesson never wobbles. */
function monthLesson(missPW, possible){
  if (!possible) return null;
  var worst = null, worstN = 0, totals = {};
  PILLARS.forEach(function(g){
    var n = missPW[g[0]].reduce(function(a, b){ return a + b; }, 0);
    totals[g[0]] = n;
    if (n > worstN){ worstN = n; worst = g; }
  });
  if (!worstN) return "Clean. Nothing to fix.";
  var w = missPW[worst[0]], top = 0;
  for (var i = 1; i < 7; i++) if (w[i] > w[top]) top = i;
  var line = worst[1] + " broke " + worstN + (worstN === 1 ? " time" : " times");
  if (w[top] >= 2 && w[top] * 2 >= worstN){
    line += " — " + w[top] + " of them on "
      + ["Sundays","Mondays","Tuesdays","Wednesdays","Thursdays","Fridays","Saturdays"][top] + ".";
  } else {
    line += ", spread across the week.";
  }
  return line;
}
function prevMonthKey(){
  var d = new Date(today() + "T00:00:00");
  d.setDate(0);
  return iso(d).slice(0, 7);
}
/* The recap that greets a new month, once: the month that just closed, held
   up before it is filed. */
function monthRecapDue(){
  var pm = prevMonthKey();
  if ((S.monthSeen || {})[pm]) return null;
  if (monthsWithData().indexOf(pm) < 0) return null;
  var L = monthLedger(pm);
  return L.possible ? L : null;
}

/* --------------------------------------------------------- the coach file
   The loop he asked for: download this, hand it to Claude, get the next
   tuning of the game back. Instructions ride inside the file so any future
   session knows what it is holding. */
function coachExport(){
  var derived = {
    months: monthsWithData().map(monthLedger),
    bestRunEver: bestRunEver(),
    currentRun: dayRun(),
    fullDays: fullDays(),
    questDaysOffered: Object.keys(S.quests || {}).length,
    questsDone: questsDone(),
    swapsUsed: Object.keys(S.quests || {}).filter(function(k){ return S.quests[k].swaps; }).length,
    livedCards: Object.keys(S.lived || {}),
    chips: S.chips || {},
    chipRewards: S.chipRewards || {},
    heldCards: heldCount(),
    totalCards: CARDS.length,
    spends: S.spends || [],
    rate: rate()
  };
  return "# Daylight coach file\n\n"
    + "Exported " + today() + " from build " + (typeof BUILD !== "undefined" ? BUILD : "?") + ".\n\n"
    + "**Stuart:** hand this file to Claude (claude.ai or Claude Code, repo stuatnext/stu-bot)\n"
    + "with a sentence on how the last stretch actually felt.\n\n"
    + "**Claude:** read `docs/coaching.md` in stuatnext/stu-bot if you can reach it. Either way:\n"
    + "analyse the JSON below. Find the weakest pillar and any weekday pattern in the month\n"
    + "ledgers; judge whether the tips, side quests and chips are pulling their weight (quest\n"
    + "completion rate, lived cards, named rewards); then propose the smallest change to the\n"
    + "game that would most improve his consistency. Tune, do not redesign - and check the\n"
    + "proposal against what he has already approved before building anything.\n\n"
    + "```json\n"
    + JSON.stringify({ exported: today(), derived: derived, save: S }, null, 1)
    + "\n```\n";
}

/* ------------------------------------------------------------- the record */
function exportSave(){ return JSON.stringify(S); }
function importSave(text){
  var p = JSON.parse(text);
  if (!p || typeof p !== "object" || !p.days) throw new Error("not a Daylight save");
  for (var k in S) if (k in p) S[k] = p[k];
  save();
}
function backupOverdue(){
  if (fullDays() < 7) return false;
  if (!S.lastBackup) return true;
  return (new Date(today() + "T00:00:00") - new Date(S.lastBackup + "T00:00:00")) / 86400000 > 30;
}

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
  n += questsDone() * 10;
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
  n += questsDone() * 20;
  return n;
}
/* Ranks do not run out. Past the last named one they keep going in numbered
   tiers, each costing half again as much as the last - because a healthy life
   has no completion screen, and a level bar that fills for the final time and
   then sits there is the app quietly announcing it is finished with you. */
var RANK_TOP_STEP = 5500;
function rankTier(n){
  /* n is 1-based beyond the named list: Ask him he'll know II, III, ... */
  var roman = ["II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
  return RANKS[RANKS.length - 1][1] + " " + (roman[n - 1] || (n + 1));
}
function rankFloor(n){
  /* Threshold of the nth tier past the named list, growing 1.5x each time. */
  var at = RANKS[RANKS.length - 1][0], step = RANK_TOP_STEP;
  for (var i = 0; i < n; i++){ at += step; step = Math.round(step * 1.5); }
  return at;
}
function rank(){
  var x = xp(), i = 0;
  for (var j = 0; j < RANKS.length; j++) if (x >= RANKS[j][0]) i = j;
  var last = RANKS.length - 1;
  if (i === last && x >= rankFloor(1)){
    var n = 1;
    while (x >= rankFloor(n + 1) && n < 60) n++;
    return { level: RANKS.length + n, name: rankTier(n), xp: x,
             from: rankFloor(n), to: rankFloor(n + 1), nextName: rankTier(n + 1) };
  }
  var next = RANKS[i + 1] || null;
  if (!next && i === last){
    return { level: i + 1, name: RANKS[i][1], xp: x,
             from: RANKS[i][0], to: rankFloor(1), nextName: rankTier(1) };
  }
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
    days:      pc.day * r,
    streaks:   pc.streak * r * 2,
    sets:      setsComplete() * r * 3,
    trophies:  goldHeld() * r * 5,
    challenges: typeof questEarned === "function" ? questEarned() : 0
  };
}
function potSpent(){
  return (S.spends || []).reduce(function(a, s){ return a + Number(s[1] || 0); }, 0);
}
/* Summed generically rather than by name. The first version listed the four
   keys it knew about, so adding challenges put money in the breakdown that
   never arrived in the pot - earned, displayed, and silently dropped. */
function potTotal(){
  var e = potEarned(), n = 0;
  for (var k in e) if (Object.prototype.hasOwnProperty.call(e, k)) n += Number(e[k]) || 0;
  return n;
}
function pot(){ return potTotal() - potSpent(); }
function money(n){
  return "$" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
}
function num(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

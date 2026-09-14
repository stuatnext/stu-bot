/* ================================================================= dispatch
   One written line a day, from the record.

   Every other number in this app is a number. This is the only place that
   says something. It is not a notification and not encouragement - it is an
   observation, the sort a person who had been keeping the ledger would make
   out loud: what is true today that was not true last week, or what has been
   true for so long it is worth naming.

   It is chosen once a day and then kept, in S.notes, which means it is stable
   for the whole day and - more to the point - that the year accumulates a
   written record of itself. That log is the thing, more than the line.

   Rules, not a model: this app is offline and the record never leaves the
   phone, so the writing is done here, in advance, and the record chooses
   which of it is true. Each entry is [ id, weight, test, write ]. Highest
   weight that tests true wins; ties break on the day, so it varies.

   ONE INVARIANT: write() must be total. It is only ever called in anger on a
   context its test() approved, but the suite renders every line against a
   bare context to prove none of them can throw on a thin record - so a
   writer that reaches into a nullable field has to carry its own fallback,
   even a fallback nobody will read. */

function dispatchCtx(k){
  var w = weekState(), run = weekRun();
  var sess = (typeof sessionsDone === "function") ? sessionsDone() : 0;
  var wkSess = 0, wkDays = weekAll(w.key).filter(function(d){ return d <= k; });
  wkDays.forEach(function(d){
    if (S.lifts && S.lifts[d] && Object.keys(S.lifts[d].ex || {}).length) wkSess++;
  });
  var sit = (typeof situation === "function") ? situation(k) : { home: true, city: "Singapore", day: 0 };
  return {
    k: k, w: w, run: run, best: bestWeekRun(), kept: weeksKept(),
    sess: sess, wkSess: wkSess, full: fullDays(),
    pot: (typeof potTotal === "function") ? potTotal() : 0,
    lived: (typeof livedCount === "function") ? livedCount() : 0,
    held: (typeof heldCount === "function") ? heldCount() : 0,
    fam: (typeof streak === "function") ? streak("family") : 0,
    stop: (typeof streak === "function") ? streak("stop") : 0,
    waist: (typeof waistTrend === "function") ? waistTrend() : null,
    sit: sit,
    /* the people, if he has named any */
    ppl: (typeof people === "function") ? people().length : 0,
    due: (typeof personDue === "function") ? personDue() : null,
    calls: (typeof people === "function") ? people().reduce(function(n, p){
      return n + (typeof spokeCount === "function" ? spokeCount(p.id) : 0); }, 0) : 0,
    /* a gap closed today: the only people-fact the Family row cannot show,
       because by the time it renders the gap is nought */
    closed: (typeof gapClosed === "function") ? gapClosed(k) : null
  };
}

/* The corpus. Written flat and specific: no exclamation, no second person
   cheerleading, nothing that would embarrass him if Tim read it over his
   shoulder. */
var DISPATCHES = [
  /* --- the week, which is now the thing being kept ----------------------- */
  ["w-kept-run", 95, function(c){ return c.w.kept && c.run >= 2; },
    function(c){ return "The week is kept, and that is " + num(c.run + 1) + " in a row."; }],
  ["w-kept-first", 92, function(c){ return c.w.kept && c.run === 0; },
    function(c){ return "The week is kept. The first one back is the one that counts."; }],
  ["w-one-off", 90, function(c){ return !c.w.kept && c.w.need === 1 && c.w.alive; },
    function(c){ return "One full day between here and a kept week."; }],
  ["w-tight", 78, function(c){ return !c.w.kept && c.w.need > 1 && c.w.need === c.w.left; },
    function(c){ return "Every day left has to land now. That is still a week you can keep."; }],
  ["w-lost-early", 60, function(c){ return !c.w.alive && c.w.left > 1; },
    function(c){ return "This one is gone, and nothing carries over. Monday is " + c.w.left
      + " days away and starts at nothing, same as every Monday."; }],
  ["w-best", 96, function(c){ return c.w.kept && c.run + 1 >= c.best && c.best >= 2; },
    function(c){ return "That is " + num(c.run + 1) + " weeks running, which is the longest you have held."; }],

  /* --- the gym ----------------------------------------------------------- */
  ["g-three", 88, function(c){ return c.wkSess >= 3; },
    function(c){ return "Three sessions this week. That is the line, and you are on it."; }],
  ["g-four", 93, function(c){ return c.wkSess >= 4; },
    function(c){ return num(c.wkSess) + " sessions this week. The plan asks for three."; }],
  ["g-first", 85, function(c){ return c.sess === 1; },
    function(c){ return "One session in the record. Everything after this is a comparison."; }],
  ["g-ten", 84, function(c){ return c.sess === 10 || c.sess === 25 || c.sess === 50 || c.sess === 100; },
    function(c){ return num(c.sess) + " sessions logged. None of them were the one you felt like doing."; }],
  ["g-waist", 86, function(c){ return c.waist && c.waist.dir === "down"; },
    function(c){ return "The tape has moved the right way. That is eight weeks of work showing up late, "
      + "which is how it always shows up."; }],

  /* --- the streaks on the other two pillars ------------------------------ */
  ["f-run", 87, function(c){ return c.fam >= 7; },
    function(c){ return num(c.fam) + " days of calling home. Sheffield is eight hours behind and you "
      + "have managed it anyway."; }],
  ["f-long", 80, function(c){ return c.fam >= 3 && c.fam < 7; },
    function(c){ return num(c.fam) + " days running with home. It is the one nobody else will chase you for."; }],
  ["s-stop", 79, function(c){ return c.stop >= 5; },
    function(c){ return num(c.stop) + " days finishing when you said you would. The shift ends at 23:00 "
      + "whether or not you do."; }],

  /* --- the people, once he has named them ---------------------------------
     Nothing here repeats "N days since Mum": the Family row already says that,
     in the right place, with her clock next to it. These are the things the
     row cannot say - a gap that just closed, a list with nobody adrift on it,
     a total nobody was counting. */
  ["h-closed", 94, function(c){ return c.closed && c.closed.was >= 14; },
    function(c){ var x = c.closed || { name: "home", was: 0, best: false };
      return "You rang " + x.name + " after " + x.was + " days. That is the longest gap "
        + "you have closed" + (x.best ? " yet" : " in a while") + "."; }],
  ["h-all-in", 86, function(c){ return c.ppl >= 2 && !c.due; },
    function(c){ return "Nobody on the list has drifted past their rhythm. That has not always "
      + "been true."; }],
  ["h-calls", 84, function(c){ return c.calls >= 25; },
    function(c){ return num(c.calls) + " conversations logged with home since you started "
      + "counting them. None of them happened by accident."; }],
  ["h-first", 88, function(c){ return c.calls === 1; },
    function(c){ return "One call on the record. The deck has had a card about this since the "
      + "day it was written."; }],

  /* --- where he is ------------------------------------------------------- */
  ["t-away", 76, function(c){ return !c.sit.home && c.sit.day === 1; },
    function(c){ return "Day one in " + c.sit.city + ". The week does not care where you are standing."; }],
  ["t-kept-away", 91, function(c){ return !c.sit.home && c.w.kept; },
    function(c){ return "A week kept from " + c.sit.city + ". Those are the ones that prove it."; }],
  ["t-home", 74, function(c){ return c.sit.home && c.sit.day === 0 && c.w.full >= 2; },
    function(c){ return "Back on home ground with " + num(c.w.full) + " full days already in the week."; }],

  /* --- the deck and the pot ---------------------------------------------- */
  ["c-lived", 82, function(c){ return c.lived >= 5; },
    function(c){ return num(c.lived) + " cards actually lived. Nothing checked a single one of them."; }],
  ["c-held", 70, function(c){ return c.held >= 30; },
    function(c){ return num(c.held) + " of the deck found. The year is filling in."; }],
  ["p-pot", 81, function(c){ return c.pot >= 100; },
    function(c){ return money(c.pot) + " in the pot, and every pound of it was a day you did the three things."; }],

  /* --- the long view ------------------------------------------------------ */
  ["l-full", 77, function(c){ return c.full >= 20; },
    function(c){ return num(c.full) + " full days on the record. That is the whole argument."; }],
  ["l-weeks", 83, function(c){ return c.kept >= 4; },
    function(c){ return num(c.kept) + " weeks kept since you started counting them."; }],

  /* --- the floor: always true, so there is always a line ------------------ */
  ["z-quiet-1", 10, function(){ return true; },
    function(c){ return c.w.full === 0 ? "Nothing in the week yet. The first one is the only hard one."
      : num(c.w.full) + (c.w.full === 1 ? " full day" : " full days") + " in the week so far."; }],
  ["z-quiet-2", 9, function(){ return true; },
    function(c){ return "The record is up to date. That is all it has to be today."; }],
  ["z-quiet-3", 8, function(){ return true; },
    function(c){ return "Nothing dramatic in the ledger today, which is what most of them look like."; }]
];

/* Chosen once, then kept - so the line does not change under him during the
   day, and so the year ends up with something written in it. */
function dispatchFor(k){
  k = k || today();
  S.notes = S.notes || {};
  if (S.notes[k]) return S.notes[k];
  var c = dispatchCtx(k);
  var live = DISPATCHES.filter(function(d){ try { return d[2](c); } catch(e){ return false; } });
  if (!live.length) return "";
  var top = Math.max.apply(null, live.map(function(d){ return d[1]; }));
  var best = live.filter(function(d){ return d[1] === top; });
  var pick = best[hashOf(k) % best.length];
  var line = "";
  try { line = pick[3](c); } catch(e){ line = ""; }
  if (!line) return "";
  S.notes[k] = line;
  /* the log is the point; it is never trimmed */
  save();
  return line;
}
function dispatchLog(n){
  var ks = Object.keys(S.notes || {}).sort().reverse();
  return ks.slice(0, n || 30).map(function(k){ return { day: k, line: S.notes[k] }; });
}

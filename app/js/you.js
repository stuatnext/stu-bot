"use strict";

/* ========================================================================
   you.js - the player.

   One calm screen for everything that is about him rather than about today:
   the rank the XP has bought, the pot and what it went on, the three
   streaks and the freezes that guard them, and the switches. Every word on
   it passes the stranger test - if a first-time reader cannot tell what a
   row does, the row is wrong.
   ======================================================================== */

function viewYou(){
  var r = rank(), have = pot(), h = "";

  /* who the days have made him */
  var into = r.xp - r.from, span = r.to ? r.to - r.from : Math.max(1, into);
  h += "<div class='panel yrank'>"
    + "<div class='yr-ring'>" + ring(into, span, "gold") + "<b>" + r.level + "</b></div>"
    + "<div class='yr-bd'><h3>" + esc(r.name) + "</h3>"
    + "<div class='dim'>" + num(r.xp) + " XP" + (r.to ? " &middot; " + num(r.to - r.xp) + " to " + esc(r.nextName) : "") + "</div>"
    + "<div class='dim'>" + num(fullDays()) + (fullDays() === 1 ? " full day" : " full days")
    + " &middot; " + num(heldCount()) + " of " + CARDS.length + " cards</div></div></div>";

  /* the pot */
  h += "<div class='vault'><div class='amt'>" + money(have) + "</div>"
    + "<div class='cap'>yours to spend</div>"
    + "<div class='btns'><button class='btn pri' data-spend='1'>Spent some</button>"
    + "<button class='btn' data-rate='1'>Change the rate</button></div>"
    + "<p class='fine'>Every full day pays " + money(rate()) + ". Real money, spent on real things "
    + "&mdash; the only rule is you log it, so the number stays true.</p></div>";
  if ((S.spends || []).length){
    h += "<div class='recs'>";
    S.spends.slice().reverse().slice(0, 4).forEach(function(s){
      h += "<div class='rec'><span class='rd'>" + esc(nice(s[0])) + "</span>"
        + "<span class='rt'>" + esc(s[2] || "Something") + "</span>"
        + "<b class='rv'>" + money(s[1]) + "</b></div>";
    });
    h += "</div>";
  }

  /* the streaks, and the net under them */
  h += "<div class='panel'><h3>Streaks</h3><div class='str3'>";
  PILLARS.forEach(function(g){
    h += "<div class='s1'><div class='si' style='color:" + g[4] + "'>" + svg(g[2], 20) + "</div>"
      + "<div class='sn'>" + streak(g[0]) + "</div>"
      + "<div class='sl'>" + esc(g[1]) + "</div></div>";
  });
  h += "</div>";
  var fixable = lastFixableDays();
  h += "<p class='dim' style='margin:10px 0 0'>" + freezesLeft() + " of " + FREEZES_PER_MONTH
    + " freezes left this month. A freeze covers a missed day so the streak survives "
    + "&mdash; it never spends itself.</p>";
  if (fixable.length && freezesLeft() > 0){
    h += "<div class='btns tight'><button class='btn quiet' data-freeze='1'>Cover a missed day</button></div>";
  }
  h += "</div>";

  /* the switches */
  h += "<div class='menu'>"
    + mrow("replay", "1", "pack", "How this works", "The three-tap tour, again")
    + mrow("sound", "1", "spare", "Sound", S.mute ? "Off" : "On")
    + mrow("camp", "1", "pin", "Where you are", S.camp)
    + "</div>";

  /* the paper that lives outside the game */
  h += "<div class='menu'>"
    + mrow("go", "../cal/", "gap", "Calendars", "Subscribe once in Apple Calendar")
    + mrow("go", "../docs/plan.html", "pen", "The plan on paper", "Why this app is shaped like this")
    + mrow("go", "../docs/admin.html", "clock", "The paperwork", "Company, pass, filings")
    + "</div>";

  h += "<div class='btns'><button class='btn quiet' data-reset='1'>Clear everything</button></div>";
  h += "<p class='dim' style='text-align:center;margin:16px 0 4px'>Daylight " + BUILD
    + " &middot; the training build</p>";
  return h;
}

/* one row of a settings list */
function mrow(attr, val, icon, title, sub){
  return "<button class='mi' data-" + attr + "='" + val + "'>"
    + "<span class='mic'>" + svg(icon, 18) + "</span>"
    + "<span class='mib'><b>" + esc(title) + "</b><span>" + esc(sub) + "</span></span>"
    + "<span class='mia'>" + svg("arrow", 15) + "</span></button>";
}

/* Days in the last two weeks that a freeze could still save. */
function lastFixableDays(){
  var out = [], d = new Date();
  for (var i = 1; i <= 14; i++){
    d.setDate(d.getDate() - 1);
    var k = iso(d);
    if (canFreeze(k) && !frozen(k)) out.push(k);
  }
  return out;
}

async function askFreeze(){
  var days = lastFixableDays();
  if (!days.length){ toast("Nothing recent needs covering."); return; }
  var v = await ask({
    title: "Cover a missed day",
    say: "A frozen day keeps the streak alive without counting as done - it earns no pack and no money. "
       + freezesLeft() + " left this month.",
    options: days.slice(0, 8).map(function(k){ return { id: k, label: nice(k) }; }),
    cancel: "Close"
  });
  if (!v) return;
  S.freezes = S.freezes || {};
  S.freezes[v] = 1;
  save(); sfx("done"); buzz(14);
  toast(nice(v) + " covered. The streak holds.");
  render({ keepScroll: true, animate: true });
}


/* ------------------------------------------------------------- the asks */
async function askSpend(){
  var amt = await ask({
    title: "Spent some",
    say: "The pot only stays true if you tell it. You have " + money(pot()) + ".",
    field: { label: "How much", value: "", placeholder: "18", type: "number" },
    confirm: "Next", cancel: "Cancel"
  });
  if (amt === null) return;
  var n = Number(String(amt).replace(/[^0-9.]/g, ""));
  if (!(n > 0)){ sfx("no"); return; }
  var what = await ask({
    title: "On what?",
    say: "In December this list is the part you will actually want.",
    field: { label: "What it bought", value: "", placeholder: "The good hawker centre across the island" },
    confirm: "Log it", cancel: "Cancel"
  });
  if (what === null) return;
  S.spends = S.spends || [];
  S.spends.push([today(), n, String(what).slice(0, 80)]);
  save(); sfx("money"); buzz(20);
  toast(money(n) + " spent. " + money(pot()) + " left.");
  render({ keepScroll: true, animate: true });
}

async function askRate(){
  var v = await ask({
    title: "What is one full day worth?",
    say: "You set this, because a rate the app picked would be the app deciding what your consistency "
       + "is worth. Everything else is a multiple of it: a seven-day run pays double, a finished set "
       + "triple, a trophy five times.",
    field: { label: "Dollars a day", value: String(rate()), placeholder: "5", type: "number" },
    confirm: "That is the rate", cancel: "Leave it"
  });
  if (v === null) return;
  var r = Number(String(v).replace(/[^0-9.]/g, ""));
  if (r > 0){ S.rate = r; save(); sfx("money"); render({ keepScroll: true, animate: true }); }
  else sfx("no");
}

async function askCamp(){
  var v = await ask({
    title: "Where are you standing?",
    say: "The shift is fixed to Malta. Moving changes what that lands as, not what it is.",
    options: CAMPS.map(function(c){ return { id: c[0], label: c[0], pri: c[0] === S.camp }; }),
    cancel: "Close"
  });
  if (v){ S.camp = v; save(); sfx("done"); render({ keepScroll: true }); }
}

async function askReset(){
  var ok = await ask({
    title: "Clear everything?",
    say: "Every day logged, every card held, every place, the pot and the trophies. There is no undo "
       + "and there is no backup.",
    confirm: "Clear it all", cancel: "Keep it", danger: true
  });
  if (!ok) return;
  var sure = await ask({
    title: "Really?",
    say: "This is the second ask because the first one is not enough for something that cannot be "
       + "reversed.",
    confirm: "Yes, clear it", cancel: "No", danger: true
  });
  if (!sure) return;
  S.done = {}; S.skip = {}; S.days = {}; S.threads = {}; S.cards = {}; S.claimed = {};
  S.openedDay = 0; S.openedStreak = 0; S.crafted = {}; S.sparesSpent = 0; S.seen = {};
  S.spends = []; S.freezes = {};
  save(); sfx("no");
  tab = "today"; render({ turn: true, animate: true });
}

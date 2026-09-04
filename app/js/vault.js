"use strict";

/* ========================================================================
   vault.js - the pot.

   He asked "where's the cash pot?", which was the right question and had an
   embarrassing answer: the gold chip in the HUD was hidden until the pot was
   non-zero, and the only screen it opened was buried a third of the way down
   You, behind the crest. So the one mechanic in the app that pays real money
   was invisible on a fresh install and hard to find on any other day.

   Now it is its own screen, the chip is always there, and the screen answers
   the three questions money asks: how much, where it came from, where it
   went.
   ======================================================================== */

var POT_PARTS = [
  ["days",       "Full days",        "tick",  "Every day all three pillars close"],
  ["streaks",    "Streak packs",     "flame", "One for every seventh day in a row"],
  ["sets",       "Sets completed",   "pack",  "Every set finished, all time"],
  ["trophies",   "Trophies claimed", "spare", "The ones that only happen by happening"],
  ["challenges", "Challenges",       "run",   "The week's four, cleared"]
];

function viewVault(){
  var have = pot(), earned = potEarned(), total = potTotal(), spent = potSpent();
  var r = rate(), h = "";

  h += "<button class='backrow' data-tab='today'>" + svg("arrow", 16)
     + "<span>Back to today</span></button>";

  /* how much */
  h += hero({
    tone: "gold", full: true, kicker: "The pot",
    big: money(have), line: "yours to spend, on whatever you like",
    foot: money(total) + " earned &middot; " + money(spent) + " spent"
  });

  h += "<div class='btns'><button class='btn pri' data-spend='1'>I spent some</button>"
     + "<button class='btn' data-rate='1'>Change the rate</button></div>";

  /* where it came from */
  h += "<div class='rulehead'><h3>Where it came from</h3><span></span>"
     + "<em>" + money(r) + " a day</em></div>";
  h += "<div class='src'>";
  var any = 0;
  POT_PARTS.forEach(function(p){
    var v = Number(earned[p[0]]) || 0;
    if (v > 0) any = 1;
    var pct = total > 0 ? Math.round(100 * v / total) : 0;
    h += "<div class='sr" + (v > 0 ? " on" : "") + "'>"
      + "<span class='si'>" + svg(p[2], 19) + "</span>"
      + "<span class='sb'><b>" + esc(p[1]) + "</b><span>" + esc(p[3]) + "</span>"
      + "<span class='srb'><i style='width:" + pct + "%'></i></span></span>"
      + "<b class='sv'>" + money(v) + "</b></div>";
  });
  h += "</div>";
  if (!any){
    h += "<p class='fine'>Nothing in it yet. Close all three pillars today and "
      + money(r) + " lands here tonight &mdash; then " + money(r) + " the day after, "
      + money(r * 2) + " on every seventh day in a row, and more every time a set "
      + "finishes. It is real money and it is yours; the app only counts it.</p>";
  }

  /* where it went */
  var sp = (S.spends || []).slice().reverse();
  h += "<div class='rulehead'><h3>Where it went</h3><span></span>"
     + "<em>" + (sp.length ? num(sp.length) + (sp.length === 1 ? " thing" : " things") : "nothing yet")
     + "</em></div>";
  if (sp.length){
    h += "<div class='recs'>";
    sp.slice(0, 20).forEach(function(s){
      h += "<div class='rec'><span class='rd'>" + esc(nice(s[0])) + "</span>"
        + "<span class='rt'>" + esc(s[2] || "Something") + "</span>"
        + "<b class='rv'>" + money(s[1]) + "</b></div>";
    });
    h += "</div>";
  } else {
    h += "<p class='fine'>The pot only stays true if you log what you take out of it. "
      + "Nothing checks and nothing is deducted automatically &mdash; that is the whole "
      + "arrangement, and it is why the number means something.</p>";
  }

  h += "<p class='fine' style='margin-top:16px'>Every full day pays " + money(r)
    + ". Real money, spent on real things. Change the rate to whatever a day is "
    + "actually worth to you &mdash; too low and it is a token, too high and you will "
    + "stop paying it.</p>";
  return h;
}

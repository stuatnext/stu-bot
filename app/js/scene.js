"use strict";

/* ========================================================================
   scene.js - Today, as a consistency-training screen.

   His own brief, in his own words: "like a training app - a consistency
   training app - probably a little like Duolingo," keeping the unlockables
   and the pot. So Today is the daily session: the hour on one living sky
   card, the week you are standing in, the three things as big pressable
   quest rows, and the chest that fills as they land. One viewport.
   ======================================================================== */

/* ------------------------------------------------------------ the sky card
   Daylight's soul, demoted from world to watch face: the hour's own
   gradient, a mini arc with the sun or moon at now, and the shift line. */
function arcPt(u){
  var x0 = 12, y0 = 58, cx = 62, cy = 2, x1 = 112, y1 = 58, v = 1 - u;
  return [v*v*x0 + 2*v*u*cx + u*u*x1, v*v*y0 + 2*v*u*cy + u*u*y1];
}
function arcSeg(a, b){
  var pts = [], n = Math.max(2, Math.round((b - a) * 40));
  for (var i = 0; i <= n; i++){
    var q = arcPt(a + (b - a) * i / n);
    pts.push(q[0].toFixed(1) + "," + q[1].toFixed(1));
  }
  return pts.join(" ");
}
function skyCardHTML(){
  var s = shape(), ph = skyPhase();
  var night = ph === "night" || ph === "deepnight" || ph === "dusk";
  var h = "<div class='skycard'>";
  h += "<svg viewBox='0 0 124 64' aria-hidden='true'>";
  h += "<polyline class='arc' points='" + arcSeg(0, 1) + "'/>";
  if (!s.weekend && s.end > s.start){
    h += "<polyline class='band' points='"
      + arcSeg(s.start / 1440, Math.min(s.end, 1439) / 1440) + "'/>";
  }
  var now = arcPt(s.now / 1440);
  h += "<circle class='orb" + (night ? " moon" : "") + "' cx='" + now[0].toFixed(1)
    + "' cy='" + now[1].toFixed(1) + "' r='6'/>";
  if (!night){
    for (var k = 0; k < 8; k++){
      var ra = k * Math.PI / 4;
      h += "<line class='ray' x1='" + (now[0] + Math.cos(ra) * 8.4).toFixed(1)
        + "' y1='" + (now[1] + Math.sin(ra) * 8.4).toFixed(1)
        + "' x2='" + (now[0] + Math.cos(ra) * 11.4).toFixed(1)
        + "' y2='" + (now[1] + Math.sin(ra) * 11.4).toFixed(1) + "'/>";
    }
  } else {
    h += "<circle class='cut' cx='" + (now[0] + 3.4).toFixed(1) + "' cy='"
      + (now[1] - 2.4).toFixed(1) + "' r='5.2'/>";
  }
  h += "</svg>";
  h += "<div class='skybd'><b>" + esc(niceToday()) + "</b>"
    + "<span>" + esc(dialLabel(s)) + "</span></div></div>";
  return h;
}
function dialLabel(s){
  if (s.weekend) return "No shift today";
  if (s.working) return "Malta until " + s.endT;
  if (s.now < s.start) return "Malta has " + s.startT + " \u2013 " + s.endT;
  return "Done at " + s.endT;
}
function niceToday(){
  var d = new Date();
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()]
    + " " + d.getDate() + " " + ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
}
function dayName(k){
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    [new Date(k + "T00:00:00").getDay()];
}

/* ------------------------------------------------------------ the week strip
   Seven dots ending on today: a full day burns green, a frozen one is ice,
   a miss is hollow, today is ringed. Consistency you can see at a glance. */
function weekHTML(){
  var h = "<div class='week'>", d = new Date();
  d.setDate(d.getDate() - 6);
  for (var i = 0; i < 7; i++){
    var k = iso(d), isToday = k === today();
    var full = allThree(k), ice = frozen(k);
    var cls = full ? "on" : ice ? "ice" : "";
    var started = PILLARS.some(function(g){ var f = firstDay(g[0]); return f && k >= f; });
    h += "<span class='wd " + cls + (isToday ? " now" : "") + (started ? "" : " off") + "'>"
      + "<i>" + (full ? svg("tick", 13) : ice ? svg("snow", 12) : "") + "</i>"
      + "<b>" + "SMTWTFS"[d.getDay()] + "</b></span>";
    d.setDate(d.getDate() + 1);
  }
  return h + "</div>";
}

/* ---------------------------------------------------------------- the chest */
function gemHTML(done, packs){
  var h = "<span class='gcore'>" + svg("pack", 30)
    + (packs > 1 ? "<b class='gn'>" + packs + "</b>" : "") + "</span>";
  h += "<span class='gbd'><b>" + (packs
      ? (packs === 1 ? "A pack is ready" : packs + " packs are ready")
      : "Today\u2019s pack") + "</b>"
    + "<span class='dcount'>" + (packs ? "Tap to open" : done + "<i>/3</i> to earn it") + "</span></span>";
  if (!packs){
    h += "<span class='gbar'><i style='width:" + Math.round(done / 3 * 100) + "%'></i></span>";
  }
  return h;
}

/* ==================================================================== TODAY */
function viewToday(){
  var t = today(), d = day(t);
  var w = packsWaiting(), packs = w.day + w.streak;
  var done = PILLARS.filter(function(g){ return pDone(t, g[0]); }).length;
  var h = "";

  /* one line, his */
  var owed = PILLARS.filter(function(g){ return required(g[0], t) && !pDone(t, g[0]); }).length;
  var ask, sub;
  if (packs){
    ask = packs === 1 ? "That is a pack." : packs + " packs waiting.";
    sub = "Earned, not given. Open it below.";
  } else if (allThree(t)){
    ask = "Today is in."; sub = "The streak holds. Back tomorrow.";
  } else if (!done){
    if (owed === 3){ ask = "Three things make a day."; sub = "Tick what you have done."; }
    else { ask = "Two things make a " + dayName(t) + "."; sub = "No shift to stop today."; }
  } else {
    ask = owed === 1 ? "One more." : owed + " to go.";
    sub = "All of them earns the pack.";
  }
  h += "<div class='hello'><p class='ask'>" + esc(ask) + "</p>"
    + "<p class='asksub'>" + esc(sub) + "</p></div>";

  h += skyCardHTML();
  h += weekHTML();

  /* the session: three big pressable rows */
  h += "<div class='quests'>";
  PILLARS.forEach(function(g){
    var on = pDone(t, g[0]), st = streak(g[0]), carried = !on && !required(g[0], t);
    h += "<button class='pil q" + g[0] + (on ? " on" : "") + (carried ? " carried" : "")
      + "' data-p='" + g[0] + "' style='--pil:" + g[4] + "' aria-pressed='" + (on ? "true" : "false") + "'>"
      + "<span class='qic'>" + svg(g[2], 24) + "</span>"
      + "<span class='qbd'><b>" + esc(g[1]) + "</b><span>"
      + esc(carried ? "No shift today \u2014 carried" : g[5]) + "</span></span>"
      + (st > 0 && !carried ? "<span class='qst'>" + svg("flame" in ICONS ? "flame" : "tick", 12) + st + "</span>" : "")
      + "<span class='qchk'>" + (on ? svg("tick", 20) : "") + "</span>"
      + "</button>";
  });
  h += "</div>";

  /* the chest */
  h += "<" + (packs ? "button" : "div") + " class='gem" + (packs ? " won" : "") + "'"
    + (packs ? " data-open='1'" : "") + ">" + gemHTML(done, packs)
    + "</" + (packs ? "button" : "div") + ">";
  return h;
}

/* The most important interaction in the app. When the third one lands, the
   celebration takes the screen and the pack drops onto the tile the thumb is
   still on - no navigation, no snackbar, and nothing opened on his behalf. */
function tapPillar(key, btn){
  var t = today(), d = day(t), wasFull = allThree(t);
  if (d.p[key]) delete d.p[key]; else d.p[key] = 1;
  save();
  var nowFull = allThree(t);

  if (!wasFull && nowFull){
    var w = packsWaiting();
    buzz([28, 60, 28, 60, 55]);
    sfx("full");
    celebrate(w.streak ? "Seven in a row" : "All three",
      w.streak ? "A streak pack. Five cards, better odds." : "That is a pack, and " + money(rate()) + " in the pot.");
    if (btn){
      btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
      burst(btn, "#3FD9A0");
      fly(btn, "#chipPot", "+" + money(rate()), "var(--gold2)");
    }
    setTimeout(function(){ render({ keepScroll: true, animate: true }); }, reduced() ? 0 : 620);
    return;
  }
  if (d.p[key]){ buzz(14); sfx("tick");
    if (btn){
      btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
      burst(btn, PILLARS.filter(function(g){ return g[0] === key; })[0][4]);
    }
  } else { sfx("untick"); }
  render({ keepScroll: true, animate: true });
}

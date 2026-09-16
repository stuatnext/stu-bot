"use strict";

/* ========================================================================
   scene.js - Today, as a consistency-training screen.

   His own brief, in his own words: "like a training app - a consistency
   training app - probably a little like Duolingo," keeping the unlockables
   and the pot. So Today is the daily session: the hour on one living sky
   card, the week you are standing in, the three things as big pressable
   quest rows, and the chest that fills as they land.

   It also carries the two things whose subject is the day rather than any
   one part of it - the five-basics condition score and the week's challenges
   - because every other tab now minds strictly its own business.
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
/* The clock, the date and where he is standing. Called with no arguments
   when the mission card underneath is carrying the instruction: the board
   used to say "Travel session, 20 min" here AND "Trained - Travel session,
   3 moves" in the row below it, which is the same order given twice in two
   large objects, and is most of why the screen read as padded. */
function skyCardHTML(ask, sub, cta){
  var s = shape(), ph = skyPhase();
  var night = ph === "night" || ph === "deepnight" || ph === "dusk";
  /* slim: no instruction to carry, so it is a clock and sized like one */
  var h = "<div class='skycard" + (ask ? "" : " slim") + "'>";
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
  var sit = situation();
  /* The city on the header is the thing that is wrong when it is wrong, so it
     is also the button that fixes it. iOS will only open its location prompt
     in answer to a tap, and forgets the permission when the app closes, so
     this tap is the whole mechanism rather than a fallback for one: while the
     day is still a guess from the clock it goes straight to the phone and
     wears a mark to say so. Once the day is answered it opens the list
     instead, for correcting an answer rather than getting one. */
  var guessed = !sit.home && typeof whereIsGuessed === "function" && whereIsGuessed();
  var slim = !ask;
  h += "<div class='skybd'><i>" + esc(slim ? shortToday() : niceToday())
    + (sit.home ? "" : " \u00b7 <button class='skyloc" + (guessed ? " ask" : "") + "' data-"
        + (guessed ? "locate" : "notthere") + "='1'>" + esc(sit.city)
        + (guessed ? "<span class='lm'>" + svg("pin", 13) + "</span>" : "") + "</button>")
    + " \u00b7 " + esc(slim ? shortDial(s) : dialLabel(s)) + "</i>"
    + (ask ? "<b>" + esc(ask) + "</b>" : "")
    + (sub ? "<span>" + esc(sub) + "</span>" : "")
    + (cta ? "<button class='skygo'"
        + (cta.act ? " data-cta='" + esc(cta.act) + "'" : " data-tab='" + esc(cta.tab) + "'")
        + "><span>" + esc(cta.label) + "</span><span class='gox'>"
        + svg("arrow", 15) + "</span></button>" : "")
    + "</div></div>";
  return h;
}
/* The slim clock has one line for the date, the city and the shift, so both
   halves lose their long forms. "Malta has 09:00 - 16:00" was always a
   slightly odd sentence anyway. */
function shortToday(){
  var d = new Date();
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]
    + " " + d.getDate() + " " + MONTHS_SHORT[d.getMonth()];
}
function shortDial(s){
  if (s.holiday) return "no shift";
  if (s.weekend) return "no shift";
  return "Malta " + s.startT + "\u2013" + s.endT;
}
function dialLabel(s){
  if (s.holiday) return "On holiday \u2014 no shift";
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
/* A ticked row said "done" three times over. Family can say who, which is
   the only one of the three where the answer is a person. */
function doneLine(key){
  if (key === "family" && typeof spokeToday === "function"){
    var did = spokeToday();
    if (did.length) return "spoke to " + did.map(function(p){ return p.name; }).join(" and ");
  }
  return "done";
}
function dayName(k){
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    [new Date(k + "T00:00:00").getDay()];
}

/* ------------------------------------------------------------ the week strip
   Seven dots ending on today: a full day burns green, a frozen one is ice,
   a miss is hollow, today is ringed. Consistency you can see at a glance. */
/* The week, as the thing that is kept. Seven marks with the line drawn at
   five, so the standard is visible rather than explained, and one sentence
   saying where that leaves him. */
function weekMeterHTML(){
  var w = weekState(), days = weekAll(w.key), run = weekRun(), t = today();
  var pct = Math.min(100, Math.round(w.full / WEEK_LINE * 100));
  var h = "<div class='wkm" + (w.kept ? " kept" : "") + (!w.alive ? " gone" : "") + "'>";

  /* Seven nodes on a rail. Seven identical grey rectangles is a form; a row
     of nodes you are moving along is a track, and the difference between
     those two readings is most of what "feels like a game" means here. */
  h += "<div class='wkm-row'>";
  days.forEach(function(k, i){
    var future = k > t, isToday = k === t;
    var full = !future && allThree(k), ice = !future && frozen(k);
    var miss = !future && !isToday && !full && !ice && startedBy(k);
    h += "<span class='wkm-d" + (full ? " on" : "") + (ice ? " ice" : "")
      + (miss ? " miss" : "") + (isToday ? " wkm-now" : "") + (future ? " soon" : "") + "'>"
      + "<i>" + (full ? svg("tick", 15) : ice ? svg("snow", 13) : "") + "</i>"
      + "<b>" + "MTWTFSS"[i] + "</b></span>";
  });
  h += "</div>";

  /* The goal, made visible. The standard has been five full days since v50
     and it was drawn as a hairline nobody could see - so here it is as a bar
     with the prize on the end of it. */
  h += "<div class='wkm-goal'>"
    + "<span class='wkm-bar'><i style='width:" + pct + "%'></i></span>"
    + "<span class='wkm-tro" + (w.kept ? " lit" : "") + "'>" + svg("pack", 17) + "</span>"
    + "</div>";

  /* A chip inside a fortnight is the most concrete reason to come back that
     the record can offer, so it takes the right-hand slot from the week run
     when one is close. Both at once is two counts in one line. */
  var chip = typeof chipNext === "function" ? chipNext() : null;
  var near = chip && chip.away > 0 && chip.away <= 14;
  h += "<div class='wkm-b'><span class='wkm-n'>" + w.full + "<em>/ " + WEEK_LINE + "</em></span>"
    + "<span class='wkm-t'>" + esc(weekLine()) + "</span>"
    + (near ? "<span class='wkm-r chip'>" + svg("lock", 11) + chip.away
        + (chip.away === 1 ? " day" : " days") + "</span>"
      : run > 0 ? "<span class='wkm-r'>" + svg("flame", 11) + run
        + (run === 1 ? " week" : " weeks") + "</span>" : "")
    + "</div></div>";
  return h;
}
/* A day only counts as missed once he had actually started - days before the
   record begins are not failures, and never have been in this app. */
function startedBy(k){
  return PILLARS.some(function(g){ var f = firstDay(g[0]); return f && k >= f; });
}

function weekHTML(){
  /* On day one the seven marks are seven blanks, which is a row of nothing
     across the top of the app. It appears once there is a day behind him. */
  var any = false, p0 = new Date();
  p0.setDate(p0.getDate() - 6);
  for (var j = 0; j < 7; j++){
    var kj = iso(p0);
    if (kj !== today() && (allThree(kj) || carried(kj))) any = true;
    p0.setDate(p0.getDate() + 1);
  }
  if (!any) return "";
  var h = "<div class='week'>", d = new Date();
  d.setDate(d.getDate() - 6);
  for (var i = 0; i < 7; i++){
    var k = iso(d), isToday = k === today();
    var full = allThree(k), ice = frozen(k), jet = !full && !ice && flying(k);
    var cls = full ? "on" : ice ? "ice" : jet ? "jet" : "";
    var started = PILLARS.some(function(g){ var f = firstDay(g[0]); return f && k >= f; });
    h += "<span class='wd " + cls + (isToday ? " wkm-now" : "") + (started ? "" : " off") + "'>"
      + "<i>" + (full ? svg("tick", 13) : ice ? svg("snow", 12) : jet ? svg("jet", 12) : "") + "</i>"
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

/* ================================================================ the engine
   Balatro shows you chips x mult before you play the hand. That is most of
   why it is sticky: the reward is legible in advance, so setting one up is
   the game. This app has had a real economy since v39 - a full day is worth
   the daily rate in the pot and 75 XP, a comeback pays both twice over, a
   kept week adds 100, three ticks drop a pack - and every number of it was
   invisible until after the fact.

   So: what today is worth, said before he does it. Computed from the same
   functions that actually pay out, never from a table, so it can never
   promise something the ledger will not honour. */
function todayPays(){
  var t = today(), r = rate();
  var come = typeof isComebackDay === "function" && isComebackDay(t);
  var w = typeof weekState === "function" ? weekState() : null;
  var keeps = !!(w && !w.kept && w.need === 1);          /* today would keep it */
  var out = {
    cash: r * (come ? 2 : 1),
    xp: (15 + STEADY.day) * 1 + (come ? 15 + STEADY.comeback : 0)
        + (keeps ? STEADY.goodWeek : 0),
    pack: 1, come: come, keeps: keeps,
    done: allThree(t)
  };
  return out;
}
function payoutHTML(){
  var p = todayPays(), t = today();
  var got = PILLARS.filter(function(g){ return pDone(t, g[0]); }).length;
  var need = PILLARS.filter(function(g){ return required(g[0], t); }).length || 3;
  var h = "<div class='pays" + (p.done ? " paid" : "") + "'>";
  h += "<div class='pays-k'>" + (p.done ? "Today paid" : "Today pays") + "</div>";
  h += "<div class='pays-row'>"
    + "<span class='pv cash'><b>" + money(p.cash) + "</b><i>pot</i></span>"
    + "<span class='pv xp'><b>" + num(p.xp) + "</b><i>xp</i></span>"
    /* a number, like the other three - an inline svg here sized itself to
       twice the tile and dragged the whole row with it */
    + "<span class='pv gv-pack'><b>" + p.pack + "</b><i>pack</i></span>"
    + "<span class='pv gv-got'><b>" + got + "<em>/" + need + "</em></b><i>done</i></span>"
    + "</div>";
  if (p.come || p.keeps){
    h += "<div class='pays-m'>"
      + (p.come ? "<span class='mlt'>\u00d72 comeback</span>" : "")
      + (p.keeps ? "<span class='mlt wk'>+" + STEADY.goodWeek + " keeps the week</span>" : "")
      + "</div>";
  }
  return h + "</div>";
}

/* ---------------------------------------------------------- the joker row
   Balatro keeps your jokers across the top of every screen; AdVenture
   Capitalist keeps every business you own in view. The deck here is the
   stickiest thing in the app and it lived on another tab, so from Today
   there was no evidence any of it existed. */
function shelfHTML(){
  var held = Object.keys(S.cards || {});
  if (!held.length) return "";
  /* newest first, because the last one found is the one he wants to see */
  held.sort(function(a, b){ return String(S.cards[b]).localeCompare(String(S.cards[a])); });
  var by = {};
  CARDS.forEach(function(c){ by[c[0]] = c; });
  var show = held.slice(0, 6).map(function(n){ return by[n]; }).filter(Boolean);
  if (!show.length) return "";
  var h = "<button class='gshelf' data-tab='cards' aria-label='Your cards'>";
  h += "<span class='gshelf-r'>";
  show.forEach(function(c, i){
    var art = c[2] === "zh" ? (c[4] || "\u8bcd") : (CARD_ART[c[0]] || SET_ART[c[2]] || "\u2b50");
    h += "<span class='gjk gr" + c[1] + "' style='--i:" + i + "'>" + esc(art) + "</span>";
  });
  h += "</span>";
  h += "<span class='gshelf-n'>" + held.length + "<em>/" + CARDS.length + "</em></span>";
  return h + "</button>";
}

/* ==================================================================== TODAY */
var TODAY_MORE = "";
function viewToday(){
  var t = today(), d = day(t);
  TODAY_MORE = "";
  var w = packsWaiting(), packs = w.day + w.streak;
  var done = PILLARS.filter(function(g){ return pDone(t, g[0]); }).length;
  var up = nextUp(), sit = situation(), pr = priority();
  var h = "";

  /* ------------------------------------------------------------ the clock */
  h += skyCardHTML(up ? "" : pr.ask, up ? "" : pr.sub, up ? null : pr.cta);

  /* A month just closed: hold it up once before it is filed. */
  var rec = S.onboarded ? monthRecapDue() : null;
  if (rec){
    h += "<div class='mrecap'>"
      + "<b>" + esc(monthName(rec.ym)) + ", filed.</b>"
      + "<span>" + rec.full + " of " + rec.possible + " full days &middot; best run "
      + rec.best + "</span>"
      + (rec.lesson ? "<span class='mles'>" + esc(rec.lesson) + "</span>" : "")
      + "<button class='mok' data-monthok='" + esc(rec.ym) + "'>Noted &middot; it keeps</button>"
      + "</div>";
  }

  /* ------------------------------------------------------------ the jokers
     Across the top, where Balatro keeps them, because what they are worth
     depends on the day and he should be able to see which ones are live
     before he decides what to do with the afternoon. */
  if (S.onboarded) h += jokerRowHTML(t);

  /* ------------------------------------------------------------- the score
     The centrepiece. chips x mult, live, moving as he ticks. */
  if (S.onboarded) h += scoreHTML(t);

  /* --------------------------------------------------------- the three
     Still the three things, still the mission card - but each row now wears
     what it is worth in chips, because a thing to do that tells you its
     price is a move in a game and a thing to do that does not is a chore. */
  h += "<ol class='index big'>";
  PILLARS.forEach(function(g){
    var on = pDone(t, g[0]), st = streak(g[0]), carry = !on && !required(g[0], t);
    var isUp = g[0] === up && !on && !carry;
    h += "<li class='ixr" + (on ? " on" : "") + (carry ? " carried" : "") + (isUp ? " up" : "") + "'>"
      + "<button class='ixb' data-p='" + g[0] + "' style='--pil:" + g[4] + "'"
      + " aria-pressed='" + (on ? "true" : "false") + "'>"
      + "<span class='po-i'>" + svg(g[2], isUp ? 24 : 19) + "</span>"
      + (isUp ? "<span class='po-k'>" + esc(g[1]) + "</span>" : "")
      + "<span class='po-t'>" + esc(isUp ? pr.ask : g[1]) + "</span>"
      + "<span class='po-s'>"
      + esc(carry ? (sit.kind === "holiday" ? "on holiday" : "no shift today")
            : isUp ? (pr.sub || planLine(g[0]))
            : on ? doneLine(g[0])
            : (g[0] === "family" && typeof peopleEmpty === "function" && !peopleEmpty())
              ? peopleLine()
            : g[5]) + "</span>"
      + (carry ? "" : "<span class='po-chip" + (on ? " got" : "") + "'>+" + CHIP.pillar + "</span>")
      + "<span class='po-c'>" + (on ? svg("tick", 19) : "") + "</span>"
      + "</button>"
      + (isUp && pr.cta ? "<button class='po-go'"
          + (pr.cta.act ? " data-cta='" + esc(pr.cta.act) + "'" : " data-tab='" + esc(pr.cta.tab) + "'")
          + " style='--pil:" + g[4] + "'>" + esc(pr.cta.label) + svg("arrow", 15) + "</button>" : "")
      + "</li>";
  });
  h += "</ol>";

  /* ------------------------------------------------------------- the ante
     The week, as a target that climbs. */
  if (S.onboarded) h += anteHTML();

  /* the pack, which now carries jokers and therefore matters */
  h += "<" + (packs ? "button" : "div") + " class='gem" + (packs ? " won" : "") + "'"
    + (packs ? " data-open='1'" : "") + ">" + gemHTML(done, packs)
    + "</" + (packs ? "button" : "div") + ">";

  /* --------------------------------------------------------- the small ones
     Everything that scores but is not one of the three. Chips on each, so
     the reason to bother is a number rather than a virtue. */
  if (S.onboarded){
    var cr = careHTML();
    if (cr){
      h += cr;
      var cl = careLine();
      if (cl) h += "<p class='care-l'>" + esc(cl) + "</p>";
    }
  }

  /* the day's card - the one genuine dare on the board */
  var hd = S.onboarded ? handDo() : [];
  if (hd.length){
    var a = hd[0];
    h += "<div class='quest'>"
      + "<span class='qgl'>" + svg("tick", 22) + "</span>"
      + "<span class='qtx'><b>To do \u00b7 " + esc(sizeWord(a[3])) + "</b>"
      + "<span>" + esc(a[1]) + ". " + esc(a[2]) + "</span></span>"
      + "<span class='qact'><button class='qgo' data-doit='" + a[0] + "'>Did it</button></span>"
      + "</div>";
  } else if (S.onboarded){
    var q = questFor(t);
    if (q){
      var qa = q.card[2] === "zh" ? (q.card[4] || "\u8bcd")
        : (CARD_ART[q.card[0]] || SET_ART[q.card[2]] || "\u2b50");
      h += "<div class='quest" + (q.done ? " qdone" : "") + "'>"
        + "<span class='qgl" + (q.card[2] === "zh" ? " zh" : "") + "'>" + esc(qa) + "</span>"
        + "<span class='qtx'><b>" + (q.done ? "Done \u00b7 " + esc(q.card[0]) : "Today\u2019s card \u00b7 " + esc(q.card[0])) + "</b>"
        + "<span>" + esc(q.done ? "+" + CHIP.card + " chips. That card is done." : q.text) + "</span></span>"
        + (q.done
            ? "<span class='qwin'>" + svg("tick", 18) + "</span>"
            : "<span class='qact'><span class='qpay'>+" + CHIP.card + " chips</span>"
              + "<button class='qgo' data-questdone='1'>Did it</button>"
              + (q.swaps ? "" : "<button class='qswap' data-questswap='1'>Swap</button>")
              + "</span>")
        + "</div>";
    }
  }

  h += conditionHTML(true);

  if (S.onboarded && done === PILLARS.length && typeof tomorrowLine === "function"){
    var tl = tomorrowLine();
    if (tl) h += "<div class='tmw'><span>Tomorrow</span><b>" + esc(tl) + "</b></div>";
  }

  if (S.onboarded){
    var dsp = dispatchFor(t);
    if (dsp) h += "<p class='dispatch'>" + esc(dsp) + "</p>";
  }
  h += TODAY_MORE;
  return h;
}

/* ---------------------------------------------------------------- the score
   Balatro's readout, and the reason this app now has an engine: two framed
   numbers with an operator between them and the result underneath, all of it
   moving as he ticks. The working is shown - every chip that scored and
   every multiplier that applied is a line he can read - because a number you
   cannot account for is a number you stop believing. */
function scoreHTML(k){
  var chips = chipsOn(k), mult = multOn(k), score = scoreOn(k);
  var ceil = scoreCeiling(k), maxc = chipsMax(k);
  var left = Math.max(0, ceil - score);
  var h = "<div class='sc" + (score > 0 ? " live" : "") + "'>";
  h += "<div class='sc-eq'>"
    + "<span class='sc-c'><b>" + num(chips) + "</b><i>chips</i></span>"
    + "<span class='sc-x'>\u00d7</span>"
    + "<span class='sc-m'><b>" + mult.toFixed(2).replace(/0$/, "") + "</b><i>mult</i></span>"
    + "</div>";
  h += "<div class='sc-out'><b>" + num(score) + "</b><i>today</i></div>";
  if (left > 0)
    h += "<div class='sc-left'>" + num(left) + " still on the table \u00b7 "
      + num(maxc - chips) + " chips unclaimed</div>";
  /* the working */
  var lines = chipLines(k), mlines = multLines(k).filter(function(x){ return x.id !== "base"; });
  if (lines.length || mlines.length){
    h += "<div class='sc-work'>";
    lines.forEach(function(x){
      h += "<span class='wk-l" + (x.joker ? " j" : "") + "'>" + esc(x.label)
        + "<em>+" + x.n + "</em></span>";
    });
    mlines.forEach(function(x){
      h += "<span class='wk-l m" + (x.joker ? " j" : "") + "'>" + esc(x.label)
        + "<em>" + (x.kind === "times" ? "\u00d7" + x.n : "+" + x.n) + "</em></span>";
    });
    h += "</div>";
  }
  return h + "</div>";
}

/* ---------------------------------------------------------------- the ante */
function anteHTML(){
  var a = anteState();
  var h = "<div class='ante" + (a.beat ? " beat" : "") + "'>";
  h += "<div class='ante-t'><span class='ante-k'>Week " + a.n + "</span>"
    + "<b>" + num(a.got) + "<em>/ " + num(a.target) + "</em></b>"
    + (a.beat ? "<span class='ante-w'>" + svg("tick", 13) + " beaten</span>"
              : "<span class='ante-n'>" + num(a.need) + " to go</span>")
    + "</div>";
  /* The seven days, inside the ante rather than as a panel of their own.
     The bar says how the week is scoring; the nodes say which days actually
     landed, and "did I do Tuesday" is still worth being able to answer at a
     glance. One instrument, two readings. */
  var days = weekAll(a.wk), t2 = today();
  h += "<div class='ante-days'>";
  days.forEach(function(k, i){
    var future = k > t2, isToday = k === t2;
    var full = !future && allThree(k), ice = !future && frozen(k);
    var miss = !future && !isToday && !full && !ice && startedBy(k);
    h += "<span class='and" + (full ? " on" : "") + (ice ? " ice" : "")
      + (miss ? " miss" : "") + (isToday ? " now" : "") + (future ? " soon" : "") + "'>"
      + "<i>" + (full ? svg("tick", 11) : ice ? svg("snow", 10) : "") + "</i>"
      + "<b>" + "MTWTFSS"[i] + "</b></span>";
  });
  h += "</div>";
  h += "<div class='ante-bar'><i style='width:" + a.pct + "%'></i></div>";
  h += "<div class='ante-s'>" + esc(a.beat
        ? "Beaten with " + (a.left === 0 ? "nothing" : a.left + (a.left === 1 ? " day" : " days"))
          + " to spare."
        : a.left === 0 ? "Last day of the week."
        : "About " + num(a.pace) + " a day for the rest of the week.") + "</div>";
  return h + "</div>";
}

/* ------------------------------------------------------------- the jokers */
function jokerRowHTML(k){
  var held = jokersHeld();
  var slots = jokerSlots(), used = jokerSlotsUsed();
  if (!held.length && !jokersOwned().length) return "";
  var live = jokerLive(k);
  var h = "<button class='jrow' data-jokers='1' aria-label='Your jokers'>";
  h += "<span class='jrow-r'>";
  held.forEach(function(j, i){
    var on = live[j[0]];
    h += "<span class='jkr" + (on ? " on" : "") + (j[3] > 1 ? " big" : "") + "' style='--i:" + i + "'>"
      + "<b>" + esc(j[6] || j[1]) + "</b>"
      + "<i>" + (j[5].kind === "times" ? "\u00d7" + j[5].n
               : j[5].kind === "add" ? "+" + j[5].n : "+" + j[5].n + "c") + "</i>"
      + "</span>";
  });
  for (var e = used; e < slots; e++)
    h += "<span class='jkr empty'><b>+</b></span>";
  h += "</span>";
  h += "<span class='jrow-n'>" + used + "<em>/" + slots + "</em></span>";
  return h + "</button>";
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
    /* A run crossing a chip threshold outranks the daily fanfare: the
       medallion ceremony takes the screen instead, and is never repeated.
       Except during the tutorial - the first pack is the lesson there, so
       day one's chip is minted quietly and waits in the case. */
    var due = chipDue();
    if (due && !S.onboarded){
      S.chips = S.chips || {};
      S.chips[due[0]] = t;
      save();
      due = null;
    }
    if (due){
      S.chips = S.chips || {};
      S.chips[due[0]] = t;
      save();
      setTimeout(function(){ showChip(due); }, reduced() ? 0 : 420);
    } else {
      celebrate(w.streak ? "Seven in a row" : "All three",
        w.streak ? "A streak pack. Five cards, better odds." : "That is a pack, and " + money(rate()) + " in the pot.");
    }
    /* the day's XP, flying to the crest the way the money flies to the pot */
    if (btn && !reduced()){
      setTimeout(function(){
        fly(btn, "#crest", "+" + (15 + STEADY.day) + " XP", "var(--gold2)");
      }, 200);
    }
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

/* ------------------------------------------------------------ the side quest */
function questDone(btn){
  var t = today(), q = questFor(t);
  if (!q || q.done){ sfx("no"); return; }
  S.quests = S.quests || {};
  S.quests[t] = { done: 1, swaps: q.swaps, card: q.card[0] };
  liveCard(q.card[0]);
  save();
  sfx("rare"); buzz([16, 40, 20]);
  if (btn) burst(btn, "#FFC800");
  render({ keepScroll: true, animate: true });
}
/* One swap a day. A quest you can reroll forever is a quest you never do. */
function questSwap(){
  var t = today(), q = questFor(t);
  if (!q || q.done || q.swaps){ sfx("no"); return; }
  S.quests = S.quests || {};
  S.quests[t] = { done: 0, swaps: 1 };
  /* Pin the swapped-to card, or a pack opened later would swap it again. */
  var nq = questFor(t);
  if (nq) S.quests[t].card = nq.card[0];
  save();
  sfx("tap"); buzz(10);
  render({ keepScroll: true, animate: true });
}

/* ================================================================= the chips
   The AA idea: a medallion for the run, handed over once, never taken back.
   Drawn inline so each chip's own metal carries through app and case. */
function medalSVG(chip, extra){
  var t = chip[0], face = chip[2], edge = chip[3], ink = chip[4];
  return "<svg class='medal" + (extra ? " " + extra : "") + "' viewBox='0 0 120 120' aria-hidden='true'>"
    + "<circle cx='60' cy='60' r='56' fill='" + edge + "'/>"
    + "<circle cx='60' cy='60' r='47' fill='" + face + "'/>"
    + "<circle cx='60' cy='60' r='41.5' fill='none' stroke='" + edge
      + "' stroke-width='1.8' stroke-dasharray='2.2 4.4'/>"
    + "<text x='60' y='" + (t > 99 ? 68 : 70) + "' text-anchor='middle' fill='" + ink
      + "' style='font:900 " + (t > 99 ? 34 : 40) + "px Nunito,sans-serif'>" + t + "</text>"
    + "<text x='60' y='88' text-anchor='middle' fill='" + ink
      + "' opacity='.72' style='font:800 10.5px Nunito,sans-serif;letter-spacing:.24em'>"
    + (t === 1 ? "DAY" : "DAYS") + "</text></svg>";
}

/* The ceremony. Bigger than a pack on purpose: this is the sober-chip moment,
   the thing he asked for by name, and it only ever happens live. */
function showChip(chip){
  var el = document.getElementById("chip");
  if (!el) return;
  var i = CHIPS.indexOf(chip);
  var reward = (S.chipRewards || {})[chip[0]];
  var line = reward
    ? "You named the reward. Collect it: " + reward
    : (CHIP_HINT[i]
        ? "Worth a real reward - say, " + CHIP_HINT[i].toLowerCase() + ". Name it in You."
        : "Chips are never taken back. This one is yours for good.");
  el.innerHTML = "<div class='chipw'>"
    + "<div class='chipk'>Chip earned</div>"
    + medalSVG(chip, "big")
    + "<h2>" + esc(chip[1]) + "</h2>"
    + "<p>" + esc(line) + "</p>"
    + "<button class='btn pri' data-chipdone='1'>Keep going</button></div>";
  el.className = "on";
  document.body.style.overflow = "hidden";
  sfx("level"); buzz([30, 60, 30, 60, 90]);
  confetti();
}
/* ------------------------------------------------------------- where he is
   One fold, only when he is not in Singapore: what the day here is, the two
   clocks that matter, and the three things the app cannot answer from his own
   record - what is around him, where exactly he is, and whether this is work
   or a holiday. */
function gapWord(){
  var g = offset() - ukOffset();
  var sign = g >= 0 ? "+" : "\u2212", m = Math.abs(g);
  return sign + Math.floor(m / 60) + "h" + (m % 60 ? String(m % 60) : "");
}
function whatChanges(sit){
  var sh = shape();
  if (sit.kind === "holiday")
    return "Two things make a holiday: move, and call home. There is no Malta shift to finish, "
         + "so Stopped is carried, the way it is on a Saturday. Nothing you have built can break here.";
  if (sit.kind === "family")
    return "Malta runs " + sh.startT + "\u2013" + sh.endT + " on this clock, so the mornings are yours. "
         + "Being in the room is the call. A walk with someone is Trained.";
  if (sit.kind === "hq")
    return "The shift is on your own clock for once: " + sh.startT + "\u2013" + sh.endT + ". "
         + "Train before it, call home after.";
  return "Move and call home are the same anywhere. Stopped is still Malta\u2019s close \u2014 "
       + sh.endT + " on this clock. Any gym counts, and a walk always has.";
}
function whereFoldHTML(sit){
  var sh = shape(), pin = pinToday();
  var inner = facts([
    [sh.noShift ? "\u2014" : sh.startT + "\u2013" + sh.endT, "Malta, here"],
    [gapWord(), "vs Sheffield"],
    ["day " + sit.day, "of the stay"]
  ]);
  inner += "<p class='fine'>" + whatChanges(sit) + "</p>";
  inner += "<div class='btns tight'>"
    + "<button class='btn quiet' data-near='eat'>Around you</button>"
    + (pin ? "<button class='btn quiet' data-pinme='1'>Pinned \u00b7 " + esc(pin.l || "here") + "</button>"
           : "<button class='btn quiet' data-pinme='1'>Pin me here</button>")
    + ((sit.kind === "work" || sit.kind === "holiday")
        ? "<button class='btn quiet' data-flip='1'>Actually a "
          + (sit.kind === "work" ? "holiday" : "work trip") + "</button>" : "")
    /* The clock can be wrong - a phone left on the old zone, a layover, a
       flight home the app has not caught up with. This is the way to say so
       without turning the clock off altogether. */
    + "<button class='btn quiet' data-locate='1'>Use my location</button>"
    + "<button class='btn quiet' data-notthere='1'>Not in " + esc(sit.city) + "</button>"
    + "</div>";
  return fold("where:" + sit.city.toLowerCase().replace(/[^a-z]+/g, ""),
    esc(sit.city) + " \u00b7 " + sit.word, "day " + sit.day, inner, sit.day === 1);
}

/* ------------------------------------------------------------- the level
   Crossing a rank used to be a 0.7-second scale pop on a 44px circle with a
   bare digit in it. His sentence was "I want to feel like I'm levelling up",
   so it takes the screen, in the chip's own grammar, and it names the reason:
   the days, not the cards. */
function crestSVG(level){
  return "<svg class='medal big' viewBox='0 0 120 120' aria-hidden='true'>"
    + "<circle cx='60' cy='60' r='56' fill='#E6A800'/>"
    + "<circle cx='60' cy='60' r='47' fill='#FFF4CC'/>"
    + "<circle cx='60' cy='60' r='41.5' fill='none' stroke='#E6A800' stroke-width='1.8' stroke-dasharray='2.2 4.4'/>"
    + "<text x='60' y='" + (level > 99 ? 68 : 70) + "' text-anchor='middle' fill='#7A5B00'"
    + " style='font:900 " + (level > 99 ? 34 : 40) + "px Nunito,sans-serif'>" + level + "</text>"
    + "<text x='60' y='88' text-anchor='middle' fill='#7A5B00' opacity='.72'"
    + " style='font:800 10.5px Nunito,sans-serif;letter-spacing:.24em'>LEVEL</text></svg>";
}
function showLevel(r){
  var el = document.getElementById("chip");
  if (!el) return;
  /* stamped before it is painted, so no close path can replay it */
  S.levelSeen = r.level; save();
  var dn = daysToNext(r), gw = goodWeeks();
  el.innerHTML = "<div class='chipw'>"
    + "<div class='chipk'>Level up</div>"
    + crestSVG(r.level)
    + "<h2>" + esc(r.name) + "</h2>"
    + "<p>" + num(fullDays()) + (fullDays() === 1 ? " full day" : " full days")
    + (gw ? " and " + gw + (gw === 1 ? " good week" : " good weeks") : "") + " did that."
    + (dn ? " Level " + (r.level + 1) + " in " + dn + (dn === 1 ? " full day." : " full days.") : "")
    + "</p>"
    + "<button class='btn pri' data-chipdone='1'>Keep going</button></div>";
  el.className = "on";
  document.body.style.overflow = "hidden";
  sfx("level"); buzz([30, 60, 30, 60, 90]);
  confetti();
}
function levelBusy(){
  return !!MODAL
    || (typeof ST !== "undefined" && !!ST)
    || (typeof SESSION !== "undefined" && !!SESSION)
    || (typeof COACH !== "undefined" && COACH.on)
    || !!document.getElementById("sheet").className
    || !!document.getElementById("stage").className
    || !!document.getElementById("chip").className
    || !!document.getElementById("fx").className;
}
/* Called at the end of every render, so a level earned from a pack, a card or
   a quest gets its moment once whatever was on top has closed. The first v39
   load stamps the number silently - a ceremony for work done weeks ago is the
   app applauding itself, which is the rule backfillChips already follows. */
function levelSync(){
  if (!S.onboarded || levelSync._on) return;
  var r = levelDue();
  if (!r) return;
  if (!Number(S.levelSeen)){ S.levelSeen = r.level; save(); return; }
  /* Wait for whatever is on top - the all-three confetti, a pack stage, a
     chip - and then take the screen. Ceremonies queue, they do not collide. */
  levelSync._on = 1;
  var tries = 0;
  setTimeout(function wait(){
    var rr = levelDue();
    if (!rr){ levelSync._on = 0; return; }
    if (levelBusy()){
      if (++tries > 40){ levelSync._on = 0; return; }   /* twenty seconds: leave it to the next render */
      setTimeout(wait, 500);
      return;
    }
    levelSync._on = 0;
    showLevel(rr);
  }, 420);
}
function closeChip(){
  var el = document.getElementById("chip");
  if (!el || !el.className) return;
  el.className = ""; el.innerHTML = "";
  document.body.style.overflow = "";
  sfx("tap");
  render({ keepScroll: true, animate: true });
}

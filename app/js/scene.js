"use strict";

/* ========================================================================
   scene.js - the play screen.

   One viewport, nothing below the fold. The sky arc says where the day is,
   the gem says what it pays, the three buttons say - on themselves - what
   makes it count. Tapping the third is the whole ceremony: burst, flash,
   coin to the pot, and the gem igniting under his thumb.
   ======================================================================== */

/* ================================================================== the gem
   What the day pays, floating in the middle of the scene. Three pips - one a
   pillar, in its own colour - light jade as each lands; all of them turns the
   centre gold and it becomes the button that opens the pack. */
function gemHTML(done, packs){
  var t = today();
  var h = "<span class='gcore'>" + svg("pack", 40)
    + (packs > 1 ? "<b class='gn'>" + packs + "</b>" : "") + "</span>";
  h += "<span class='pips'>";
  PILLARS.forEach(function(g){
    var on = pDone(t, g[0]), carried = !on && !required(g[0], t);
    h += "<i class='" + (on ? "on" : carried ? "na" : "") + "' style='--pil:" + g[4] + "'></i>";
  });
  h += "</span>";
  if (!packs) h += "<span class='dcount'>" + done + "<i>/3</i> for a pack</span>";
  return h;
}


/* ================================================================== TODAY
   Not a page any more. One viewport, no scrolling: the sky with the sun on
   it, the gem, one line, three buttons that say what they mean, and a book
   for everything else. A real game's home screen is a scene you stand in,
   not a column you read down. */
function viewToday(){
  var t = today(), d = day(t), y = day(shift(-1));
  var w = packsWaiting(), packs = w.day + w.streak;
  var done = PILLARS.filter(function(g){ return pDone(t, g[0]); }).length;
  var green = !S.onboarded;
  var h = "";

  h += "<div class='sky'>" + skyHTML() + "</div>";

  h += "<div class='gemwrap'><" + (packs ? "button" : "div") + " class='gem"
    + (packs ? " won" : "") + "'" + (packs ? " data-open='1'" : "") + ">"
    + gemHTML(done, packs) + "</" + (packs ? "button" : "div") + ">";

  /* one line, and only one - it sits with the gem, not somewhere below it */
  var owed = PILLARS.filter(function(g){ return required(g[0], t) && !pDone(t, g[0]); }).length;
  var ask, sub;
  if (packs){
    ask = packs === 1 ? "That is a pack." : packs + " packs.";
    sub = "Tap it to open.";
  } else if (allThree(t)){
    ask = "Today is in."; sub = "Back tomorrow for the next one.";
  } else if (!done){
    if (owed === 3){ ask = "Three things make a day."; sub = "Tap what you have done."; }
    else { ask = "Two things make a " + dayName(t) + ".";
           sub = "No shift to stop today. The other two still count."; }
  } else {
    ask = owed === 1 ? "One more." : owed + " to go.";
    sub = "All of them earns a pack.";
  }
  h += "<div class='askwrap'><p class='ask" + (packs ? " gold" : "") + "'>" + esc(ask) + "</p>"
    + "<p class='asksub'>" + esc(sub) + "</p></div></div>";

  /* the three, with their definitions on them */
  h += "<div class='triad'>";
  PILLARS.forEach(function(g){
    var on = pDone(t, g[0]), st = streak(g[0]), carried = !on && !required(g[0], t);
    h += "<button class='pil" + (on ? " on" : "") + (carried ? " carried" : "") + "' data-p='"
      + g[0] + "' style='--pil:" + g[4] + "' aria-pressed='" + (on ? "true" : "false") + "'>"
      + "<span class='disc'>" + svg(on ? "tick" : g[2], 27) + "</span>"
      + "<span class='lb'>" + esc(g[1]) + "</span>"
      + "<span class='gl'>" + esc(g[5]) + "</span>"
      + (st > 0 || carried
          ? "<span class='st'>" + (carried ? "no shift today" : st + (st === 1 ? " day" : " days")) + "</span>"
          : "")
      + "</button>";
  });
  h += "</div>";

  return h;
}
function dayName(k){
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    [new Date(k + "T00:00:00").getDay()];
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

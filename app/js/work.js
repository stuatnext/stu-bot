/* ==================================================================== work
   The job, kept away from the body. He asked for them separate and they are
   separate fights: the employer, his own company, and his name.

   When I made him rank the year, one thing came out on top - hours and pay
   changed. Everything here is that, or downstream of it. */

function workDone(id){ return !!(S.work || {})[id]; }
function toggleWork(id){
  S.work = S.work || {};
  if (S.work[id]){ delete S.work[id]; sfx("untick"); }
  else { S.work[id] = today(); buzz(12); sfx("tick"); }
  save();
  render({ keepScroll: true });
}
function workLeft(area){
  return WORKITEMS.filter(function(i){ return i[1] === area && !workDone(i[0]); }).length;
}

/* Days until a dated thing, so the October run-up is a countdown rather than
   a date he has to hold in his head. */
function daysTo(isoStr){
  var a = new Date(today() + "T00:00:00"), b = new Date(isoStr + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

function viewWork(){
  var h = "", t = today();

  /* The run-up, in order, with the one that has not happened yet at the top.
     The countdown is the hero because it is the only thing on this tab with a
     deadline attached - everything else is a list that waits. */
  var soon = WORKDATES.filter(function(d){ return daysTo(d[2]) >= 0; });
  var next = soon[0];
  var openN = WORKITEMS.filter(function(i){ return !workDone(i[0]); }).length;
  var doneN = WORKITEMS.length - openN;

  /* A calendar leaf for today, and the next thing beside it with the days
     counted. The dates after that run down a line. */
  var td = new Date(t + "T00:00:00");
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  /* ------------------------------------------------------------ the room
     The countdown is the tab. Everything on it waits for one date, so that
     date is the object: the number at the size of the thing it stands for,
     the day it lands on a torn calendar leaf beside it. It was a small panel
     next to a small panel. */
  h += "<div class='stage work" + (gameClear("work", t) ? " done" : "") + "'>";
  h += gameTop("work", doneN + " of " + WORKITEMS.length + " done");
  if (next){
    var n = daysTo(next[2]), nd = new Date(next[2] + "T00:00:00");
    h += "<div class='cd'>"
      + "<div class='cd-n'>" + (n === 0 ? "Today" : num(n)) + "</div>"
      + (n === 0 ? "" : "<div class='cd-u'>" + (n === 1 ? "day" : "days") + "</div>")
      + "</div>";
    h += "<div class='stage-n cd-t'>" + esc(next[1]) + "</div>";
    h += "<div class='stage-l'>" + esc(next[3]) + "</div>";
    h += "<div class='cd-d'>" + MON[nd.getMonth()] + " " + nd.getDate()
      + " \u00b7 " + esc(dayName(next[2])) + "</div>";
  } else {
    h += "<div class='cd'><div class='cd-n'>" + doneN + "</div>"
      + "<div class='cd-u'>of " + WORKITEMS.length + "</div></div>";
    h += "<div class='stage-l'>" + (openN ? openN
        + (openN === 1 ? " thing still open" : " things still open")
        : "Every one of them done.") + "</div>";
  }
  h += "<div class='fine'>Today is " + MON[td.getMonth()] + " " + td.getDate()
    + ", " + esc(dayName(t)) + "</div>";
  h += "</div>";

  /* One button that walks the open work, one item at a time. His words:
     "it's a hell of a lot of information on the work tab". It was three
     headed sections of fourteen items with a note under each, which is a
     backlog, and a backlog on a phone is a thing you close.

     Now the tab is a start screen: the date, what it pays, and the button.
     The items live inside the run, where he only ever sees one, and the
     run-up and the area lines wait behind the one door. */
  var openAll = typeof runCount === "function" ? runCount("work") : openN;
  h += gameBar("work", openAll ? "Work through them" : "", openAll ? "data-run='work'" : "");

  var rec = "";
  if (soon.length > 1){
    rec += "<div class='tl'>";
    soon.slice(1, 5).forEach(function(d){
      rec += "<div class='tli'><b>" + esc(d[1]) + "</b><span>" + esc(nice(d[2]))
        + " \u00b7 " + num(daysTo(d[2])) + " days</span></div>";
    });
    rec += "</div>";
  }
  rec += "<div class='runs'>";
  WORKAREAS.forEach(function(a){
    var items = WORKITEMS.filter(function(i){ return i[1] === a[0]; });
    var openItems = items.filter(function(i){ return !workDone(i[0]); });
    rec += "<div class='rr" + (openItems.length ? "" : " on") + "'>"
      + "<span class='rr-t'>" + esc(a[1]) + "</span>"
      + "<span class='rr-s'>" + esc(a[2]) + "</span>"
      + "<span class='rr-n'>" + (openItems.length ? openItems.length + " open" : "done") + "</span>"
      + "</div>";
  });
  rec += "</div>";
  h += drawers([ fold("thework", "The work", doneN + " of " + WORKITEMS.length + " done",
    rec, false) ]);
  return h;
}

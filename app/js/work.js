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
  h += "<div class='leafrow'>"
    + "<div class='leaf'><div class='lm'>" + MON[td.getMonth()] + "</div>"
    + "<div class='ld'>" + td.getDate() + "</div><div class='lw'>" + esc(dayName(t)) + "</div></div>";
  if (next){
    var n = daysTo(next[2]);
    h += "<div class='until'><b>" + (n === 0 ? "Today" : num(n) + "<i>" + (n === 1 ? "day" : "days") + "</i>") + "</b>"
      + "<div class='ut'>" + esc(next[1]) + "</div><div class='un'>" + esc(next[3]) + "</div></div>";
  } else {
    h += "<div class='until'><b>" + doneN + "<i>/ " + WORKITEMS.length + "</i></b>"
      + "<div class='ut'>" + (openN ? openN + (openN === 1 ? " thing still open" : " things still open") : "Every one of them done.") + "</div></div>";
  }
  h += "</div>";

  /* The three areas ARE this tab. Behind three doors they were a menu of the
     work rather than the work, so they are one list again - each area a small
     heading, its open items under it, and what is done counted rather than
     listed. The dates that follow are three lines, so they are three lines.
     The two documents moved to You, where the reading lives. */
  if (soon.length > 1){
    h += "<div class='rulehead'><h3>After that</h3><span></span><em>"
      + (soon.length - 1) + " more</em></div><div class='tl'>";
    soon.slice(1).forEach(function(d){
      h += "<div class='tli'><b>" + esc(d[1]) + "</b><span>" + esc(nice(d[2]))
        + " \u00b7 " + num(daysTo(d[2])) + " days</span></div>";
    });
    h += "</div>";
  }

  WORKAREAS.forEach(function(a){
    var items = WORKITEMS.filter(function(i){ return i[1] === a[0]; });
    var openItems = items.filter(function(i){ return !workDone(i[0]); });
    var doneCount = items.length - openItems.length;
    h += "<div class='rulehead'><h3>" + esc(a[1]) + "</h3><span></span><em>"
      + (openItems.length ? openItems.length + " open" : "all done") + "</em></div>";
    if (!openItems.length){
      h += "<p class='fine'>" + esc(a[2]) + "</p>";
      return;
    }
    h += "<div class='wk'>";
    openItems.forEach(function(i){
      h += "<button class='wi' data-work='" + i[0] + "'>"
        + "<span class='wbox'></span>"
        + "<span class='wb'><b>" + esc(i[2]) + "</b>"
        + "<span>" + esc(i[3]) + "</span></span></button>";
    });
    h += "</div>";
    if (doneCount){
      h += "<button class='donerow' data-workdone='" + a[0] + "'>"
        + doneCount + " done" + (S.showDone && S.showDone[a[0]] ? " \u00b7 hide" : "") + "</button>";
      if (S.showDone && S.showDone[a[0]]){
        h += "<div class='wk done'>";
        items.filter(function(i){ return workDone(i[0]); }).forEach(function(i){
          h += "<button class='wi on' data-work='" + i[0] + "'>"
            + "<span class='wbox'>&#10003;</span>"
            + "<span class='wb'><b>" + esc(i[2]) + "</b></span></button>";
        });
        h += "</div>";
      }
    }
  });
  return h;
}

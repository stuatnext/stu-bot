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
  var h = "";

  /* The run-up, in order, with the one that has not happened yet at the top.
     The countdown is the hero because it is the only thing on this tab with a
     deadline attached - everything else is a list that waits. */
  var soon = WORKDATES.filter(function(d){ return daysTo(d[2]) >= 0; });
  var next = soon[0];
  var openN = WORKITEMS.filter(function(i){ return !workDone(i[0]); }).length;
  var doneN = WORKITEMS.length - openN;

  if (next){
    var n = daysTo(next[2]);
    h += hero({
      tone: "violet", icon: "case",
      kicker: n === 0 ? "Today" : "Next up \u00b7 " + esc(nice(next[2])),
      big: n === 0 ? "Today" : num(n),
      unit: n === 0 ? "" : (n === 1 ? "day" : "days"),
      line: esc(next[1]),
      foot: esc(next[3])
    });
  } else {
    h += hero({
      tone: "violet", icon: "case", kicker: "The job",
      big: doneN, unit: "/ " + WORKITEMS.length,
      line: openN ? openN + (openN === 1 ? " thing still open" : " things still open")
                  : "Every one of them done.",
      pct: Math.round(100 * doneN / WORKITEMS.length)
    });
  }
  h += facts([
    [num(doneN), "done", doneN ? "on" : ""],
    [num(openN), "open", openN > WORKITEMS.length / 2 ? "warn" : ""],
    [num(soon.length), "dates ahead", ""]
  ]);

  if (soon.length > 1){
    h += "<div class='recs'>";
    soon.slice(1).forEach(function(d){
      h += "<div class='rec'><span class='rd'>" + esc(nice(d[2])) + "</span>"
        + "<span class='rt'>" + esc(d[1]) + "</span>"
        + "<b class='rv'>" + num(daysTo(d[2])) + "d</b></div>";
    });
    h += "</div>";
  }

  WORKAREAS.forEach(function(a){
    var items = WORKITEMS.filter(function(i){ return i[1] === a[0]; });
    var left = workLeft(a[0]);
    h += "<div class='rulehead'><h3>" + esc(a[1]) + "</h3><span></span>"
      + "<em>" + (left ? left + " open" : "all done") + "</em></div>";
    h += "<p class='fine' style='margin:0 0 9px'>" + esc(a[2]) + "</p>";
    h += "<div class='wk'>";
    items.forEach(function(i){
      var on = workDone(i[0]);
      h += "<button class='wi" + (on ? " on" : "") + "' data-work='" + i[0] + "'>"
        + "<span class='wbox'>" + (on ? "&#10003;" : "") + "</span>"
        + "<span class='wb'><b>" + esc(i[2]) + "</b>"
        + "<span>" + esc(i[3]) + "</span></span></button>";
    });
    h += "</div>";
  });

  h += "<div class='btns'><button class='btn quiet' data-go='../docs/proposal.html'>"
    + "The October document</button></div>";
  h += "<div class='btns'><button class='btn quiet' data-go='../docs/admin.html'>"
    + "Company, pass and filings</button></div>";
  return h;
}

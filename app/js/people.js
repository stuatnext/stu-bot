"use strict";

/* ========================================================================
   people.js - who "Family" actually means.

   The third pillar is "A conversation with someone at home. A message does
   not count." Until now the app's entire answer to that was a checkbox,
   which is odd, because the people are the only part of this that cannot be
   recovered later. A missed gym session is next week's gym session.

   His own deck says it better than a spec could. The Sheffield set is
   subtitled "Home, and the people you said you rarely speak to", and two of
   its cards are "A call, not a text - you said you rarely speak to them.
   This is the card that fixes it" and "Germany - the friend since primary
   school, kept alive on almost nothing." He told the app this. The app
   wrote it down and then went on offering him a tickbox.

   So: a roster. Each person has a place, and therefore a clock, and a
   rhythm - how often he actually wants to speak to them. The app holds all
   of it, which is the point: he has said his short-term memory is where the
   difficulty is, and "how long has it been since Mum" is exactly the kind
   of thing a memory drops and a ledger does not.

   Three rules this file keeps:

   1. IT NEVER INVENTS A PERSON. The only name seeded is Mum, because the
      app already knew about her before this file existed - briefFor marks
      Wednesday as "Mum's day". Everyone else he adds himself. Guessing at
      a man's family is not a feature.

   2. DRIFTING IS NOT FAILING. Nothing here can break the run, the week or
      the streak. It reports how long it has been. The pillar ticks the way
      it always did, and a person with no rhythm set is never "overdue".

   3. THE CLOCK IS THE HELP. He is eight hours ahead of Sheffield on a shift
      fixed to Malta, so the honest reason he does not call is that the
      window is genuinely narrow and moves twice a year. The app can do that
      arithmetic every time it renders; he cannot do it at 22:40 while
      still working.
   ======================================================================== */

/* ------------------------------------------------------------- the clock
   Intl does the whole job, DST included, for anywhere on earth - which
   matters because the people he might add are not all in one time zone and
   the UK and Singapore change on different dates, or in Singapore's case
   never. Returns minutes past midnight where they are, or null. */
function zoneMin(tz){
  if (!tz) return null;
  try {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var h = null, m = null;
    parts.forEach(function(p){
      if (p.type === "hour") h = Number(p.value);
      if (p.type === "minute") m = Number(p.value);
    });
    if (h === null || m === null) return null;
    return (h % 24) * 60 + m;
  } catch(e){ return null; }
}
function zoneDow(tz){
  if (!tz) return null;
  try {
    var wd = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short" })
      .format(new Date());
    var i = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(wd.slice(0, 3));
    return i < 0 ? null : i;
  } catch(e){ return null; }
}

/* What the hour where they are means for phoning them. Deliberately six
   states and not a number: the useful question is "can I ring now", and the
   answer is a sentence. */
var WINDOWS = {
  asleep: { rank: 0, word: "asleep" },
  early:  { rank: 2, word: "just up" },
  morning:{ rank: 3, word: "morning" },
  midday: { rank: 3, word: "midday" },
  after:  { rank: 3, word: "afternoon" },
  evening:{ rank: 4, word: "evening" },
  late:   { rank: 1, word: "late there" }
};
function windowAt(min){
  if (min === null) return null;
  if (min < 390 || min >= 1350) return "asleep";      /* 22:30 - 06:30 */
  if (min < 540)  return "early";                      /* 06:30 - 09:00 */
  if (min < 720)  return "morning";
  if (min < 1020) return "after";                      /* 12:00 - 17:00 */
  if (min < 1230) return "evening";                    /* 17:00 - 20:30 */
  return "late";
}
/* Minutes until they are reachable again, for the one line that says when. */
function untilAwake(min){
  if (min === null) return 0;
  if (windowAt(min) !== "asleep") return 0;
  return ((390 - min) % 1440 + 1440) % 1440;
}

/* ------------------------------------------------------------ the roster */
function people(){ return Array.isArray(S.people) ? S.people : []; }
function personBy(id){
  var ps = people();
  for (var i = 0; i < ps.length; i++) if (ps[i].id === id) return ps[i];
  return null;
}
/* Mum, and only Mum, and only when he first opens the roster - because
   briefFor has marked Wednesday as her day since long before this file. */
function seedPeople(){
  if (S.peopleSeeded) return;
  S.peopleSeeded = 1;
  if (!people().length){
    S.people = [{ id: "mum", name: "Mum", where: "Sheffield",
                  tz: "Europe/London", every: 7 }];
  }
  save();
}
function newPersonId(name){
  var base = String(name || "p").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 10) || "p";
  var id = base, n = 2;
  while (personBy(id)) id = base + (n++);
  return id;
}

/* --------------------------------------------------------- the record
   spoke[id] = ["2026-09-14", ...] newest first. Dates only: the app has
   never held a transcript of anything and is not starting now. */
function spokeList(id){
  var v = (S.spoke || {})[id];
  return Array.isArray(v) ? v : [];
}
function lastSpoke(id){ return spokeList(id)[0] || null; }
function spokeOn(id, k){ return spokeList(id).indexOf(k || today()) !== -1; }
function spokeToday(k){
  k = k || today();
  return people().filter(function(p){ return spokeOn(p.id, k); });
}
function daysSince(id){
  var l = lastSpoke(id);
  if (!l) return null;
  return Math.max(0, Math.round((new Date(today() + "T00:00:00")
    - new Date(l + "T00:00:00")) / 86400000));
}
function spokeCount(id){ return spokeList(id).length; }

/* How far past their own rhythm they are. A person with no rhythm is never
   late - some people you just ring when you ring. */
function personOver(p){
  if (!p || !(p.every > 0)) return 0;
  var d = daysSince(p.id);
  if (d === null) return 0;                 /* never logged: nothing to be late against */
  return Math.max(0, d - p.every);
}
/* Everyone, worst drift first, then longest since, then by name. */
function peopleByDrift(){
  return people().slice().sort(function(a, b){
    var oa = personOver(a), ob = personOver(b);
    if (oa !== ob) return ob - oa;
    var da = daysSince(a.id), db = daysSince(b.id);
    if (da === null && db === null) return String(a.name).localeCompare(b.name);
    if (da === null) return -1;
    if (db === null) return 1;
    if (da !== db) return db - da;
    return String(a.name).localeCompare(b.name);
  });
}
/* The one the app would mention if it could only mention one: furthest past
   their rhythm, and awake, beats furthest past their rhythm and asleep. */
function personDue(){
  var over = people().filter(function(p){ return personOver(p) > 0 && !spokeOn(p.id); });
  if (!over.length) return null;
  over.sort(function(a, b){
    var wa = windowAt(zoneMin(a.tz)), wb = windowAt(zoneMin(b.tz));
    var ra = wa ? WINDOWS[wa].rank : 2, rb = wb ? WINDOWS[wb].rank : 2;
    if ((ra > 1) !== (rb > 1)) return rb - ra;
    return personOver(b) - personOver(a);
  });
  return over[0];
}
/* Nobody logged yet and nobody added: the roster has never been opened. */
function peopleEmpty(){ return !people().length; }

/* ------------------------------------------------------------- the words */
function personClock(p){
  var m = zoneMin(p.tz);
  if (m === null) return "";
  return hhmm(m) + (p.where ? " in " + p.where : "");
}
function personState(p){
  var m = zoneMin(p.tz);
  if (m === null) return "";
  var w = windowAt(m);
  if (w === "asleep") return "asleep · " + dur(untilAwake(m)) + " until they are up";
  var dw = zoneDow(p.tz), wknd = dw === 0 || dw === 6;
  if (w === "early")   return "just up";
  if (w === "morning") return wknd ? "weekend morning" : "mid-morning";
  if (w === "after")   return "afternoon — they are about";
  if (w === "evening") return "evening — the best window";
  return "late there, but not gone to bed";
}
function sinceWord(id){
  var d = daysSince(id);
  if (d === null) return "not logged yet";
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 14) return d + " days";
  if (d < 70) return Math.round(d / 7) + " weeks";
  return Math.round(d / 30) + " months";
}
function rhythmWord(n){
  if (!(n > 0)) return "when you ring";
  if (n === 1) return "every day";
  if (n <= 4) return "every few days";
  if (n <= 8) return "about weekly";
  if (n <= 18) return "about fortnightly";
  return "about monthly";
}

/* The line the Family row wears. It is the single most useful sentence the
   app can write, so it gets the pillar's own subtitle rather than a box of
   its own: who, what o'clock there, and how long it has been. */
function peopleLine(){
  var sit = situation();
  if (sit.kind === "family") return "You are there. Sitting with someone is the call.";
  if (peopleEmpty()) return familyLine();
  var t = today();
  var did = people().filter(function(p){ return spokeOn(p.id, t); });
  if (did.length) return "Spoke to " + did.map(function(p){ return p.name; }).join(" and ") + " today.";
  var due = personDue();
  if (due){
    var st = personState(due), m = zoneMin(due.tz);
    return sinceWord(due.id) + " since " + due.name
      + (m === null ? "." : " · " + hhmm(m) + " there, " + (windowAt(m) === "asleep" ? "asleep" : st.split(" — ")[0]) + ".");
  }
  /* nobody overdue: name whoever is most reachable right now */
  var up = people().filter(function(p){ var m = zoneMin(p.tz); return m !== null && windowAt(m) !== "asleep"; });
  if (up.length){
    var p0 = peopleByDrift().filter(function(p){ return up.indexOf(p) !== -1; })[0] || up[0];
    return p0.name + " is up — " + hhmm(zoneMin(p0.tz)) + " there.";
  }
  return familyLine();
}

/* ------------------------------------------------------------- logging */
function logCall(id, btn){
  var p = personBy(id);
  if (!p) return;
  var k = today();
  S.spoke = S.spoke || {};
  var list = spokeList(id).slice();
  var at = list.indexOf(k);
  if (at !== -1){
    list.splice(at, 1);                       /* a mis-tap is one tap back */
    S.spoke[id] = list;
    if (!list.length) delete S.spoke[id];
    save(); sfx("untick");
    /* Once there is a roster, the pillar means "spoke to one of them", so
       taking the last name back takes the day back with it. Anything else
       leaves a ticked pillar with nobody behind it. */
    if (!spokeToday().length && pDone(k, "family")) tapPillar("family");
    else render({ keepScroll: true });
    return;
  }
  var was = daysSince(id);
  list.unshift(k);
  /* the record is dates, and a person is not a thousand of them */
  S.spoke[id] = list.slice(0, 400);
  save();
  /* the pillar it belongs to, through the normal door, so the pack, the
     chip ceremony and the XP all behave exactly as they always have */
  if (!pDone(k, "family")) tapPillar("family", btn);
  else { sfx("tick"); buzz(12); render({ keepScroll: true }); }
  if (was !== null && was >= 21)
    setTimeout(function(){ toast(sinceWord(id) === "today" ? "" : "That was " + was + " days. It is back to nought now."); }, 700);
}

/* -------------------------------------------------------------- the sheet
   One tap from Today. The whole interaction is: which of these did you
   speak to. Everything else on it is there to answer "can I ring them now",
   which is the question that actually stops him. */
function peopleSheetHTML(){
  var t = today(), h = "";
  h += "<div class='ppl'>";
  peopleByDrift().forEach(function(p){
    var on = spokeOn(p.id, t), m = zoneMin(p.tz), w = m === null ? null : windowAt(m);
    var over = personOver(p), d = daysSince(p.id);
    h += "<button class='pp" + (on ? " on" : "") + (over > 0 && !on ? " over" : "") + "'"
      + " data-mk='p:" + esc(p.id) + "'>"
      + "<span class='pp-c'>" + (on ? svg("tick", 15) : "") + "</span>"
      + "<span class='pp-b'>"
      + "<b>" + esc(p.name) + "</b>"
      + "<span class='pp-w'>" + (m === null ? esc(rhythmWord(p.every))
          : esc(hhmm(m) + (p.where ? " " + p.where : "") + " \u00b7 " + WINDOWS[w].word)) + "</span>"
      + "</span>"
      + "<span class='pp-d" + (over > 0 && !on ? " late" : "") + "'>"
      + esc(on ? "today" : (d === null ? "\u2014" : sinceWord(p.id))) + "</span>"
      + "</button>";
  });
  h += "</div>";
  h += "<div class='btns tight'>"
    + "<button class='btn quiet' data-mk='__add'>Add someone</button>"
    + (people().length ? "<button class='btn quiet' data-mk='__edit'>Rhythms</button>" : "")
    + "</div>";
  return h;
}

/* The sheet stays open after a tap, because "who did you speak to" often has
   more than one answer and closing after the first would make the second a
   second trip. */
async function askPeople(){
  /* The first time only: say what this is, and let him decline it outright.
     Declining is permanent-ish - the pillar goes back to being a box - and
     that has to stay on offer, because an app that insists on knowing about
     your family is a worse app than one with a checkbox. */
  if (!S.peopleSeeded && peopleEmpty()){
    var go = await ask({
      title: "Who is home?",
      say: "The third pillar is \u201ca conversation with someone at home\u201d, and the app "
         + "has been counting it for months without knowing who. Name them and it will hold "
         + "the rest: what o\u2019clock it is where they are, and how long it has actually been."
         + "<br><br>It starts with Mum, because Wednesday has been her day in here since the "
         + "beginning. Nothing about this can break a run.",
      confirm: "Go on then", cancel: "Just tick it"
    });
    S.peopleSeeded = 1; save();
    if (!go){ tapPillar("family"); return; }
    seedPeople();
  }
  if (peopleEmpty()){ tapPillar("family"); return; }
  for (var guard = 0; guard < 40; guard++){
    var v = await ask({
      title: "Who did you speak to?",
      say: "A call, not a text. Tapping a name ticks the day as well.",
      html: peopleSheetHTML(),
      cancel: "Done"
    });
    if (!v) return;
    if (v === "__add"){ await addPerson(); continue; }
    if (v === "__edit"){ await editPeople(); continue; }
    if (v.indexOf("p:") === 0){
      logCall(v.slice(2));
      /* the third pillar landing owns the screen; do not cover it with a list */
      if (allThree(today())) return;
    }
  }
}

async function addPerson(){
  var name = await ask({
    title: "Add someone",
    say: "A first name is plenty. This never leaves the phone.",
    field: { label: "Name", value: "", placeholder: "Dad" },
    confirm: "Next", cancel: "Cancel"
  });
  if (!name || name === "__no" || !String(name).trim()) return;
  name = String(name).trim().slice(0, 24);
  /* where they are, from the table the app already has, most likely first */
  var opts = [{ id: "Europe/London", label: "The UK", note: "Sheffield, London — the usual" }];
  var here = deviceZone();
  if (here && here !== "Europe/London")
    opts.push({ id: here, label: "Where you are", note: zoneCity(here) });
  opts.push({ id: "__other", label: "Somewhere else", note: "pick from the list" });
  var wz = await ask({
    title: "Where is " + name + "?",
    say: "So the app can tell you what o’clock it is there before you ring.",
    options: opts, cancel: "Skip"
  });
  var tz = "", where = "";
  if (wz === "__other"){
    var picked = await pickZone();
    if (picked){ tz = picked[0]; where = picked[1]; }
  } else if (wz && wz !== "__no"){
    tz = wz;
    where = ZONES[tz] ? ZONES[tz][0] : zoneCity(tz);
    if (tz === "Europe/London") where = "Sheffield";
  }
  var ev = await ask({
    title: "How often?",
    say: "How often you would like to actually speak. The app will say when it has been "
       + "longer — it never counts it as a failure.",
    options: [
      { id: "7",  label: "About weekly", pri: true },
      { id: "14", label: "About fortnightly" },
      { id: "30", label: "About monthly" },
      { id: "0",  label: "No rhythm", note: "never says you are late" }
    ], cancel: "Skip"
  });
  var every = (ev && ev !== "__no") ? Number(ev) : 0;
  S.people = people().concat([{ id: newPersonId(name), name: name, where: where,
                               tz: tz, every: every }]);
  S.peopleSeeded = 1;
  save(); sfx("done"); buzz(14);
  toast(name + " is on the list.");
}

/* The zone list, as the places the app already knows rather than 400 IANA
   strings. Sorted so the ones he actually goes to are at the top. */
async function pickZone(){
  var seen = {}, opts = [];
  Object.keys(ZONES).forEach(function(z){
    var c = ZONES[z][0];
    if (seen[c]) return;
    seen[c] = 1;
    opts.push({ id: z, label: c, kind: ZONES[z][1] });
  });
  opts.sort(function(a, b){
    var ra = a.kind === "home" ? 0 : a.kind === "family" ? 1 : a.kind === "hq" ? 2 : 3;
    var rb = b.kind === "home" ? 0 : b.kind === "family" ? 1 : b.kind === "hq" ? 2 : 3;
    if (ra !== rb) return ra - rb;
    return a.label.localeCompare(b.label);
  });
  var v = await ask({
    title: "Where are they?",
    say: "",
    html: "<div class='zlist'>" + opts.map(function(o){
      var m = zoneMin(o.id);
      return "<button class='zr' data-mk='" + esc(o.id) + "'><b>" + esc(o.label) + "</b>"
        + "<span>" + (m === null ? "" : hhmm(m)) + "</span></button>";
    }).join("") + "</div>",
    cancel: "Cancel"
  });
  if (!v || v === "__no") return null;
  return [v, ZONES[v] ? ZONES[v][0] : zoneCity(v)];
}

async function editPeople(){
  var ps = peopleByDrift();
  if (!ps.length) return;
  var v = await ask({
    title: "Rhythms",
    say: "How often you want to speak to each of them, and the clock the app uses.",
    options: ps.map(function(p){
      return { id: p.id, label: p.name,
               note: rhythmWord(p.every) + (p.where ? " · " + p.where : "")
                   + " · " + spokeCount(p.id) + " logged" };
    }),
    cancel: "Close"
  });
  if (!v || v === "__no") return;
  var p = personBy(v);
  if (!p) return;
  var what = await ask({
    title: p.name,
    say: esc(sinceWord(p.id) === "not logged yet" ? "No calls logged yet."
        : "Last spoken " + sinceWord(p.id) + " ago.")
       + (p.tz && zoneMin(p.tz) !== null ? " It is " + esc(hhmm(zoneMin(p.tz))) + " there." : ""),
    options: [
      { id: "every", label: "Change how often", note: rhythmWord(p.every) },
      { id: "where", label: "Change where they are", note: p.where || "not set" },
      { id: "gone",  label: "Remove " + p.name, note: "the log goes too" }
    ], cancel: "Close"
  });
  if (what === "every"){
    var ev = await ask({
      title: "How often?", say: "",
      options: [
        { id: "7", label: "About weekly" }, { id: "14", label: "About fortnightly" },
        { id: "30", label: "About monthly" }, { id: "0", label: "No rhythm" }
      ], cancel: "Cancel"
    });
    if (ev && ev !== "__no"){ p.every = Number(ev); save(); sfx("tick"); render({ keepScroll: true }); }
    return;
  }
  if (what === "where"){
    var pk = await pickZone();
    if (pk){ p.tz = pk[0]; p.where = pk[1]; save(); sfx("tick"); render({ keepScroll: true }); }
    return;
  }
  if (what === "gone"){
    var sure = await ask({
      title: "Remove " + p.name + "?",
      say: "The name and the call log both go. Nothing else changes — the days you "
         + "ticked stay ticked.",
      confirm: "Remove", cancel: "Keep", danger: true
    });
    if (sure === true || sure === "__ok"){
      S.people = people().filter(function(x){ return x.id !== p.id; });
      if (S.spoke) delete S.spoke[p.id];
      save(); sfx("no"); render({ keepScroll: true });
    }
  }
}

/* The longest gap he closed on a given day, and whether it is the longest he
   has ever closed. Only knowable from the two dates either side of a call,
   which is why nothing else in the app can say it. */
function gapClosed(k){
  k = k || today();
  var best = null;
  people().forEach(function(p){
    var l = spokeList(p.id), at = l.indexOf(k);
    if (at === -1 || at + 1 >= l.length) return;
    var was = Math.round((new Date(k + "T00:00:00") - new Date(l[at + 1] + "T00:00:00")) / 86400000);
    if (!best || was > best.was) best = { id: p.id, name: p.name, was: was };
  });
  if (!best) return null;
  /* was it the longest ever closed, across everyone? */
  var ever = 0;
  people().forEach(function(p){
    var l = spokeList(p.id);
    for (var i = 0; i + 1 < l.length; i++){
      if (l[i] === k) continue;
      var g = Math.round((new Date(l[i] + "T00:00:00") - new Date(l[i + 1] + "T00:00:00")) / 86400000);
      if (g > ever) ever = g;
    }
  });
  best.best = best.was >= ever;
  return best;
}

/* ------------------------------------------------------- on the You screen
   A quiet panel, so "who am I drifting from" is answerable without opening
   a sheet. Same clock, same arithmetic, no tap targets that log anything -
   logging happens where the pillar is. */
function peoplePanelHTML(){
  if (peopleEmpty()) return "";
  var t = today(), h = "<div class='panel'><h3>Home</h3><div class='pgrid'>";
  peopleByDrift().forEach(function(p){
    var m = zoneMin(p.tz), w = m === null ? null : windowAt(m);
    var over = personOver(p), on = spokeOn(p.id, t);
    h += "<div class='pcell" + (on ? " on" : over > 0 ? " over" : "") + "'>"
      + "<b>" + esc(p.name) + "</b>"
      + "<span class='pc-t'>" + (m === null ? "—" : esc(hhmm(m))) + "</span>"
      + "<span class='pc-w'>" + (w ? esc(WINDOWS[w].word) : esc(p.where || "")) + "</span>"
      + "<span class='pc-d'>" + esc(on ? "today" : sinceWord(p.id)) + "</span>"
      + "</div>";
  });
  h += "</div><p class='dim' style='margin:10px 0 0'>Their clock, and how long it has been. "
    + "Drifting is not failing — nothing here can break a run. "
    + "<button class='lnk' data-editpeople='1'>Rhythms</button></p></div>";
  return h;
}

/* ==================================================================== life
   "I like the idea of levelling up. The thing is that I feel like I'm at
   level zero with a lot of these things ... lots of things that aren't
   going to happen at once, but things that need to incrementally be given
   more focus. I don't expect these things to all come at once, but I do
   want them to be gradually moving in the right direction."

   So every part of his life has a level of its own, the way a game gives a
   character skills: nine of them, each starting where his record says it
   is, each climbing from small things done. Five are read straight from
   what the app already records - sessions, machines, protein, the skin
   routine, calls home. Four are new and are levelled by small steps he
   logs in one tap: evenings with Tim, friends and community, his name and
   network, and the business.

   Nothing needs to happen at once. He picks up to three to focus on, and
   each focus gets one small step a week on the road on Today. The rest keep
   their levels and wait their turn. Levels never go down.

   Anything specific - who, which client, which goal - lives on the phone,
   never in this file.
   ======================================================================== */

/* [ key, name, icon, colour, levelled by, what it is, where it lives ] */
var SKILLS = [
  ["gym",     "Gym routine",          "dumb",   "#FFC61F", "record", "Turning up, week after week.",         "gym"],
  ["craft",   "Gym know-how",         "bulb",   "#FF8A3D", "record", "Machines tried, moves unlocked.",      "gym"],
  ["diet",    "Diet",                 "plate",  "#3FE0A0", "record", "Protein at every meal, and keeping it.", "food"],
  ["skin",    "Skin",                 "drop",   "#FF8FB3", "record", "The routine, morning and night.",      "skin"],
  ["family",  "Family",               "phone",  "#FF8FA3", "record", "Real talks with home.",                "today"],
  ["us",      "Tim & me",             "heart",  "#FF5A7A", "steps",  "Date nights, and evenings that are yours.", ""],
  ["friends", "Friends & community",  "people", "#5AC8F5", "steps",  "People in Singapore, and giving time.", ""],
  ["name",    "Name & network",       "star",   "#CE82FF", "steps",  "Being known, and knowing people.",      ""],
  ["biz",     "The business",         "case",   "#FFD84D", "steps",  "Your own business, growing.",           ""]
];

/* The small steps that level the four new skills. Deliberately small at
   the bottom - a message counts - and the big ones worth a lot, because
   they are rare. [ id, what, XP, the note under it ] */
var SKILL_ACTS = {
  us: [
    ["date",    "Date night",                          60, "A proper evening, out or in, phones away"],
    ["plan",    "Planned the next date night",         15, "A day and a place, in both calendars"],
    ["offline", "An evening off work, together",       40, "Laptop shut before dinner"],
    ["trip",    "Planned a trip together",             30, "Even a weekend"]
  ],
  friends: [
    ["reach",     "Messaged someone to meet up",       10, "The first move counts"],
    ["met",       "Met a friend",                      35, "Coffee, food, a walk"],
    ["yes",       "Said yes to an invite",             25, "Especially when you did not feel like it"],
    ["group",     "Went to a group, class or club",    40, "A run club, a class, a meetup"],
    ["volunteer", "Volunteered",                       50, "Time given, here"],
    ["host",      "Hosted something",                  60, "Dinner, drinks, a walk you organised"]
  ],
  name: [
    ["post",   "Posted something with your name on it", 30, "LinkedIn, the newsletter, an article"],
    ["coffee", "Coffee with someone in the industry",    40, "Here, or on a trip"],
    ["event",  "Went to an event and spoke to three people", 45, "Three is the whole job"],
    ["intro",  "Asked for, or made, an introduction",    25, "The quickest way in"],
    ["stage",  "Spoke, was quoted, or sat on a panel",   90, "Your name in the room"]
  ],
  biz: [
    ["lead",   "Talked to a possible client",           45, "A real conversation, not a like"],
    ["follow", "Followed up a lead",                    15, "Most work comes from the second message"],
    ["prop",   "Sent a proposal",                       70, "Price and scope, in writing"],
    ["win",    "Won a client or a project",            300, "The big one"],
    ["build",  "Worked on the business itself",         20, "The offer, the site, a case study, the price"]
  ]
};
/* the ones too big to be a week's small step */
var SKILL_BIG = { win: 1, stage: 1, host: 1 };

function skillDef(key){
  for (var i = 0; i < SKILLS.length; i++) if (SKILLS[i][0] === key) return SKILLS[i];
  return null;
}
function lifeEntries(){ return Array.isArray(S.life) ? S.life : []; }
function actDef(skill, id){
  var a = SKILL_ACTS[skill] || [];
  for (var i = 0; i < a.length; i++) if (a[i][0] === id) return a[i];
  return null;
}

/* ------------------------------------------------------------- the XP
   The five record skills read what is already there, so on the day this
   arrived they did not start at zero: they started where he actually is. */
function recordXP(key){
  var n = 0;
  if (key === "gym"){
    var weeks = {};
    liftDays().forEach(function(k){
      if (!Object.keys((S.lifts[k] || {}).ex || {}).length) return;
      n += 25;
      var w = weekKeyOf(k); weeks[w] = (weeks[w] || 0) + 1;
    });
    Object.keys(weeks).forEach(function(w){ if (weeks[w] >= 3) n += 50; });
    n += Object.keys(S.walks || {}).length * 10;
  } else if (key === "craft"){
    var names = {};
    liftDays().forEach(function(k){
      Object.keys((S.lifts[k] || {}).ex || {}).forEach(function(nm){ names[nm] = 1; });
    });
    n += Object.keys(names).length * 10;
    if (typeof machinesUsed === "function") n += machinesUsed().length * 50;
    if (typeof stage === "function"){
      var st = stage(), i = STAGES.indexOf(st);
      if (i > 0) n += i * 40;
    }
  } else if (key === "diet"){
    Object.keys(S.food || {}).forEach(function(k){
      if (!foodOn(k).length) return;
      n += 8;
      if (proteinOn(k) >= proteinTarget()) n += 25;
    });
  } else if (key === "skin"){
    Object.keys(S.care || {}).forEach(function(k){
      var steps = Object.keys(S.care[k] || {}).filter(function(s){ return S.care[k][s]; }).length;
      if (steps) n += 12;
      if (steps >= 2) n += 10;
    });
  } else if (key === "family"){
    Object.keys(S.days || {}).forEach(function(k){ if (pDone(k, "family")) n += 25; });
    Object.keys(S.spoke || {}).forEach(function(id){
      n += Math.max(0, (S.spoke[id] || []).length) * 5;
    });
  }
  return n;
}
function stepsXP(key){
  var n = 0;
  lifeEntries().forEach(function(e){
    if (e[1] !== key) return;
    var a = actDef(e[1], e[2]);
    if (a) n += a[2];
  });
  return n;
}
function skillXP(key){ return recordXP(key) + stepsXP(key); }
/* Level n needs 25·n·(n+1): 50 for the first, 150 for the second, 300,
   500, 750 ... the first comes from one or two things done, and every one
   after asks a little more, which is how a habit actually grows. */
function skillLevelOf(x){
  var n = 0;
  while (25 * (n + 1) * (n + 2) <= x && n < 99) n++;
  var from = 25 * n * (n + 1), to = 25 * (n + 1) * (n + 2);
  return { level: n, xp: x, from: from, to: to, pct: Math.max(0, Math.min(1, (x - from) / (to - from))) };
}
function skillLv(key){ return skillLevelOf(skillXP(key)); }
/* Steps also count towards the level he already has, at half their worth:
   the record skills already reach it through the pillars. */
function lifeMainXP(){
  var n = 0;
  lifeEntries().forEach(function(e){ var a = actDef(e[1], e[2]); if (a) n += Math.round(a[2] / 2); });
  return n;
}

/* ------------------------------------------------------------- the focus */
function focusList(){
  var f = Array.isArray(S.focus) ? S.focus : [];
  return f.filter(function(k){ return !!skillDef(k); }).slice(0, 3);
}
function toggleFocus(key){
  var f = focusList(), at = f.indexOf(key);
  if (at >= 0) f.splice(at, 1);
  else {
    if (f.length >= 3){ toast("Three at a time. Take one off first."); sfx("no"); return; }
    f.push(key);
  }
  S.focus = f; save(); sfx("tap"); buzz(8);
  render({ keepScroll: true });
}
function lifeThisWeek(skill, k){
  var wk = weekKeyOf(k || today());
  return lifeEntries().filter(function(e){ return e[1] === skill && weekKeyOf(e[0]) === wk; });
}
/* This week's one small step: the first focus skill levelled by steps that
   has nothing logged this week, and a small thing from its list, chosen by
   the week so it is not the same thing every Monday. */
function lifeStep(k){
  k = k || today();
  var f = focusList().filter(function(key){ return skillDef(key)[4] === "steps"; });
  for (var i = 0; i < f.length; i++){
    if (lifeThisWeek(f[i], k).length) continue;
    /* a date night still to come this week IS the week's step for Tim & me */
    if (f[i] === "us" && typeof dateNightOn === "function" && nightLeftThisWeek(k)) continue;
    var small = (SKILL_ACTS[f[i]] || []).filter(function(a){ return !SKILL_BIG[a[0]]; });
    if (!small.length) continue;
    var a = small[hashOf(weekKeyOf(k) + f[i]) % small.length];
    return { skill: f[i], act: a };
  }
  return null;
}

function nightLeftThisWeek(k){
  var d = new Date(k + "T12:00:00"), wk = weekKeyOf(k);
  for (var i = 0; i < 7; i++){
    var x = iso(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i));
    if (weekKeyOf(x) !== wk) break;
    if (dateNightOn(x)) return true;
  }
  return false;
}

/* ------------------------------------------------------------- the log */
function logLife(skill, id, btn){
  var d = skillDef(skill), a = actDef(skill, id);
  if (!d || !a) return;
  var before = skillLv(skill).level;
  S.life = lifeEntries(); S.life.push([today(), skill, id]);
  save(); sfx("tick"); buzz([14, 30, 14]);
  if (btn && typeof burst === "function") burst(btn, d[3]);
  var after = skillLv(skill);
  if (after.level > before && typeof celebrate === "function"){
    celebrate(d[1] + " · Level " + after.level, levelWord(after.level));
  } else {
    toast("+" + a[2] + " " + d[1] + " · " + (after.to - after.xp) + " to level " + (after.level + 1), true);
  }
  render({ keepScroll: true });
}
/* the week's step, from the road or the run */
function lifeDoStep(btn){
  var s = lifeStep();
  if (!s){ sfx("no"); return; }
  logLife(s.skill, s.act[0], btn);
}
function undoLife(skill){
  var L = lifeEntries();
  for (var i = L.length - 1; i >= 0; i--){
    if (L[i][1] === skill){
      var a = actDef(L[i][1], L[i][2]);
      L.splice(i, 1); S.life = L; save(); sfx("untick");
      toast("Taken off: " + (a ? a[1].toLowerCase() : "the last one") + ".");
      render({ keepScroll: true });
      return;
    }
  }
}
function levelWord(n){
  return n === 1 ? "Off zero. The hardest one is done."
    : n < 4 ? "Moving. Small things, done again."
    : n < 8 ? "This is a habit now, not an effort."
    : "Nobody gets here by accident.";
}
/* One skill's sheet: what it is, his own goal for it if he set one, and
   the steps to log. A record skill points at the tab that levels it. */
function askLife(skill){
  var d = skillDef(skill); if (!d) return;
  var lv = skillLv(skill), goal = (S.goals || {})[skill];
  var say = esc(d[5]) + "<br><b>Level " + lv.level + "</b> &middot; " + num(lv.xp - lv.from) + " of "
    + num(lv.to - lv.from) + " XP to level " + (lv.level + 1)
    + (goal ? "<br><span class='lf-goal'>" + esc(goal) + "</span>" : "");
  if (d[4] === "record"){
    tell(d[1], say + "<p class='fine' style='margin:10px 0 0'>This one levels from what you already do in the app"
      + (d[6] && d[6] !== "today" ? " — the " + esc(TAB_NAMES[d[6]] || d[6]) + " tab." : ".") + "</p>");
    return;
  }
  var mine = lifeEntries().filter(function(e){ return e[1] === skill; }).length;
  var opts = (SKILL_ACTS[skill] || []).map(function(a){
    return { id: a[0], label: a[1], note: "+" + a[2] + " XP · " + a[3] };
  });
  if (mine) opts.push({ id: "__undo", label: "Take the last one off", note: "Logged by mistake" });
  ask({ title: d[1], say: say, options: opts, cancel: "Not now" }).then(function(v){
    if (!v || v === "__no") return;
    if (v === "__undo") undoLife(skill); else logLife(skill, v);
  });
}

/* ------------------------------------------------------------ the sheet
   The character sheet, on You: every skill with its level and how far to
   the next, the focused ones first, a star to focus or unfocus. */
function lifeSheetHTML(){
  var f = focusList();
  var order = SKILLS.slice().sort(function(a, b){
    var fa = f.indexOf(a[0]), fb = f.indexOf(b[0]);
    fa = fa < 0 ? 9 : fa; fb = fb < 0 ? 9 : fb;
    return fa - fb;
  });
  var total = 0;
  SKILLS.forEach(function(s){ total += skillLv(s[0]).level; });
  var h = "<div class='panel lf'><div class='lf-hd'><h3>Your levels</h3><span>" + num(total)
    + " levels in all</span></div>";
  h += "<p class='lf-lead'>" + (f.length
      ? "Focusing on " + f.map(function(k){ return skillDef(k)[1]; }).join(", ")
        + ". Each focus gets one small step a week on Today."
      : "Star up to three to focus on. Each focus gets one small step a week on Today; "
        + "the rest keep their levels and wait their turn.") + "</p>";
  order.forEach(function(s){
    var lv = skillLv(s[0]), on = f.indexOf(s[0]) >= 0, goal = (S.goals || {})[s[0]];
    var week = s[4] === "steps" && on ? lifeThisWeek(s[0]).length : 0;
    h += "<div class='lf-row" + (on ? " on" : "") + "' style='--sk:" + s[3] + "'>"
      + "<button class='lf-main' data-life='" + s[0] + "'>"
      + "<i class='lf-ic'>" + svg(s[2], 20) + "</i>"
      + "<span class='lf-bd'><span class='lf-nm'>" + esc(s[1]) + "<em>Lv " + lv.level + "</em></span>"
      + "<span class='lf-bar'><i style='width:" + (lv.pct * 100).toFixed(1) + "%'></i></span>"
      + (on && s[4] === "steps"
          ? "<span class='lf-sub due" + (week ? " done" : "") + "'>"
            + (week ? "✓ This week's step is done" : "One small step due this week, on Today") + "</span>"
          : "<span class='lf-sub'>" + esc(goal || s[5]) + "</span>")
      + "</span></button>"
      + "<button class='lf-star" + (on ? " on" : "") + "' data-focus='" + s[0] + "' aria-label='"
      + (on ? "Stop focusing on " : "Focus on ") + esc(s[1]) + "'>" + svg("star", 18) + "</button>"
      + "</div>";
  });
  return h + "</div>";
}

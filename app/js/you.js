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

  /* the record is only real if it survives the phone */
  if (backupOverdue()){
    h += "<button class='warnbar' data-backup='1'>"
      + "<b>" + num(fullDays()) + " days live only on this phone.</b>"
      + "<span>Back the record up &mdash; one tap, keep the file anywhere.</span></button>";
  }

  /* who the days have made him */
  var into = r.xp - r.from, span = r.to ? r.to - r.from : Math.max(1, into);
  h += "<div class='panel yrank'>"
    + "<div class='yr-ring'>" + ring(into, span, "gold") + "<b>" + r.level + "</b></div>"
    + "<div class='yr-bd'><h3>" + esc(r.name) + "</h3>"
    + "<div class='dim'>" + num(r.xp) + " XP"
    + (r.to ? " &middot; " + num(r.to - r.xp) + " to " + esc(r.nextName)
            + " &middot; about " + daysToNext(r) + (daysToNext(r) === 1 ? " full day" : " full days") : "") + "</div>"
    + "<div class='dim'>" + num(fullDays()) + (fullDays() === 1 ? " full day" : " full days")
    + " &middot; " + num(heldCount()) + " of " + CARDS.length + " cards</div></div></div>";

  /* The pot lives on its own screen now, reached from the gold chip that is
     always in the HUD. What stays here is the door to it, because You is
     where you look for anything that is about him rather than about today. */
  h += "<button class='potdoor' data-tab='vault'>"
    + "<span class='pd-a'>" + money(have) + "</span>"
    + "<span class='pd-b'><b>The pot</b><span>" + money(rate()) + " a day &middot; "
    + money(potTotal()) + " earned so far</span></span>"
    + "<span class='pd-c'>" + svg("arrow", 18) + "</span></button>";

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

  /* the chip case: the longest run he has ever held, minted. AA got this
     right decades ago - the medallion in the pocket outlasts the meeting. */
  var bestR = Math.max(bestRunEver(), dayRun());
  h += "<div class='panel'><h3>Chips</h3><div class='chipcase'>";
  CHIPS.forEach(function(c){
    var got = !!(S.chips || {})[c[0]] || bestR >= c[0];
    var rw = (S.chipRewards || {})[c[0]];
    h += "<button class='chp" + (got ? " got" : "") + "' data-chipreward='" + c[0] + "'>"
      + medalSVG(c)
      + "<b>" + esc(c[1]) + "</b>"
      + "<span>" + esc(rw || (got ? "Earned" : (c[0] - bestR) + " to go")) + "</span>"
      + "</button>";
  });
  h += "</div><p class='dim' style='margin:10px 0 0'>Your longest run ever mints these, and a chip "
    + "is never taken back. Each carries a reward you name &mdash; tap one to set it.</p></div>";

  /* the months: nothing resets, nothing is deleted. A bad month stays on
     the shelf because the pattern in it is the lesson - his call. */
  var mos = monthsWithData();
  if (mos.length){
    h += "<div class='panel'><h3>Months</h3><div class='mons'>";
    mos.slice().reverse().slice(0, 6).forEach(function(ym){
      var L = monthLedger(ym), cur = ym === today().slice(0, 7);
      var pct = L.possible ? Math.round(L.full / L.possible * 100) : 0;
      h += "<div class='mo'>"
        + "<div class='mo-t'><b>" + esc(monthName(ym)) + (cur ? " &middot; so far" : "") + "</b>"
        + "<span>" + L.full + "/" + L.possible + " &middot; run " + L.best + "</span></div>"
        + "<div class='mo-bar'><i style='width:" + pct + "%'></i></div>"
        + (L.lesson ? "<div class='mo-l'>" + esc(L.lesson) + "</div>" : "")
        + "</div>";
    });
    h += "</div><p class='dim' style='margin:10px 0 0'>Kept, not reset. The lesson line is computed "
      + "from the record &mdash; where it broke and on which day of the week.</p></div>";
  }

  h += fold("levels", "How the level works", "the crest",
    "<p class='fine'>Every full day is " + (15 + STEADY.day) + " XP. The first day back after a lapse "
    + "counts twice. Five full days in a week is " + STEADY.goodWeek + " on top, all seven "
    + STEADY.perfectWeek + " more, and " + SOLID_MONTH + " in a month " + STEADY.month + ". A chip pays "
    + "between " + STEADY.chips[1] + " and " + STEADY.chips[5] + " the day it is minted. Cards still count "
    + "for what they always did \u2014 but the crest is moved by turning up.</p>", false);

  /* the switches */
  h += "<div class='menu'>"
    + (isStandalone() ? "" :
        mrow("install", "1", "phone", "Put it on your Home Screen",
          "Full screen, its own icon — and it unlocks the nudge"))
    + mrow("push", "1", "clock", "The nudges",
        S.pushOn ? "On — 08:00 the day’s shape, 22:15 what is still open"
                 : "08:00 the day’s shape, 22:15 what is still open")
    + mrow("look", "1", "moon", "Night look",
        S.look === "dark" ? "Always dark" : S.look === "light" ? "Always light"
                          : "With the sky — dark from dusk to dawn")
    + mrow("badge", "1", "tick", "Icon badge",
        S.badge ? "Open pillars counted on the app icon" : "Off")
    + mrow("replay", "1", "ask", "How this works", "The three-tap tour, again")
    + mrow("sound", "1", "spare", "Sound", S.mute ? "Off" : "On")
    + mrow("camp", "1", "pin", "Where you are", whereSource())
    + "</div>";

  /* the record itself */
  h += "<div class='menu'>"
    + mrow("backup", "1", "save", "Back up the record",
        S.lastBackup ? "Last saved " + nice(S.lastBackup) : "Never saved out")
    + mrow("restore", "1", "load", "Restore a backup", "Paste a saved file back in")
    + mrow("coachx", "1", "pen", "Send the record to Claude",
        "A coach file — hand it back, get the next tuning")
    + "</div>";

  /* the paper that lives outside the game */
  h += "<div class='menu'>"
    + mrow("go", "../cal/", "gap", "Calendars", "Subscribe once in Apple Calendar")
    + mrow("go", "../docs/train.html", "run", "The training plan", "What Trained actually means")
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


/* Naming the reward is the whole trick: a chip that buys nothing is a badge,
   and badges stop working. Works on chips not yet earned, on purpose - the
   promise should be pulling before he gets there. */
async function askChipReward(t){
  var c = CHIPS.filter(function(x){ return x[0] === t; })[0];
  if (!c) return;
  var i = CHIPS.indexOf(c);
  var bestR = Math.max(bestRunEver(), dayRun());
  var got = !!(S.chips || {})[t] || bestR >= t;
  var away = t - bestR;
  var v = await ask({
    title: c[1] + " · " + t + (t === 1 ? " day" : " days"),
    say: got
      ? "Earned, and it stays earned. Name what it buys you - then go collect it."
      : away + (away === 1 ? " day" : " days") + " away. Name the reward now, so the chip is pulling before you reach it.",
    field: { label: "The reward", value: (S.chipRewards || {})[t] || "",
             placeholder: CHIP_HINT[i] || "Name it" },
    confirm: "Save it", cancel: "Close"
  });
  if (v === null) return;
  S.chipRewards = S.chipRewards || {};
  var s = String(v).trim().slice(0, 80);
  if (s) S.chipRewards[t] = s; else delete S.chipRewards[t];
  save(); sfx("done");
  render({ keepScroll: true });
}

/* --------------------------------------------------- the phone, properly
   A real game lives on the home screen, not in a browser tab - and on iOS
   the evening nudge is only allowed for installed apps, so this row is the
   door to that one too. */
function isStandalone(){
  try {
    return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  } catch(e){ return false; }
}
function isiOS(){ return /iPhone|iPad|iPod/.test(navigator.userAgent); }

async function askInstall(){
  if (typeof INSTALL_PROMPT !== "undefined" && INSTALL_PROMPT){
    sfx("tap");
    INSTALL_PROMPT.prompt();
    try { await INSTALL_PROMPT.userChoice; } catch(e){}
    INSTALL_PROMPT = null;
    return;
  }
  await ask({
    title: "Put Daylight on your Home Screen",
    say: isiOS()
      ? "In Safari: tap the Share button, then “Add to Home Screen”. Full screen, its own "
        + "icon, and iOS will then allow the evening nudge."
      : "In the browser menu, choose “Install app” or “Add to Home Screen”.",
    cancel: "Close"
  });
}

/* ---------------------------------------------------------- the nudge
   Real games interrupt you; this one earns the right once a night. The
   subscription is minted here, but the sender is the repo's scheduled
   Action - so the last step is one paste into a repo secret. Honest about
   its own architecture: no server, no account, nothing personal leaves
   the phone except the push address itself. */
/* ------------------------------------------------------- the nudge
   iPhone push, for a web app on the Home Screen. It has never sent, and the
   reason was structural: the public key was baked into two files and the
   private half lived nowhere he could find. So the phone makes its own pair
   now - WebCrypto, P-256, the curve web push wants - subscribes with it, and
   hands him ONE bundle: subscription, public key, private key. One paste into
   one repository secret, and the sender reads the lot. Nothing about push is
   in the repo any more. The bundle is kept on the phone too, so it can be
   shown again if the paste goes wrong. */
function b64uToBytes(s){
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  var bin = atob(s), out = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64u(bytes){
  var bin = "";
  for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
/* The key pair web push wants: the public half as a 65-byte uncompressed
   point, the private half as the 32-byte scalar. Both base64url. */
async function vapidPair(){
  var k = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  var pub = await crypto.subtle.exportKey("jwk", k.publicKey);
  var prv = await crypto.subtle.exportKey("jwk", k.privateKey);
  var x = b64uToBytes(pub.x), y = b64uToBytes(pub.y);
  var raw = new Uint8Array(65); raw[0] = 4; raw.set(x, 1); raw.set(y, 33);
  return { pub: bytesToB64u(raw), priv: prv.d };
}
function pushBundle(sub, keys){
  return JSON.stringify({ v: 1, made: today(), subscription: sub,
    vapidPublic: keys.pub, vapidPrivate: keys.priv });
}

async function askPush(){
  if (S.pushOn){
    var v = await ask({
      title: "The nudges",
      say: "On since " + esc(nice(S.pushMade || today())) + ". At 08:00 the game says what the "
         + "day looks like \u2014 which pillar first, tonight\u2019s session, today\u2019s card. Around "
         + "22:15 it names what is still open, or says the day is already in and asks nothing."
         + (S.pushBundle ? "<br><br>If the paste never happened, or GitHub lost it, show it again." : ""),
      options: S.pushBundle ? [{ id: "again", label: "Show the paste again" }] : [],
      confirm: "Turn it off", cancel: "Keep it"
    });
    if (v === "again"){ showBundle(S.pushBundle); return; }
    if (!v) return;
    try {
      var reg0 = await navigator.serviceWorker.ready;
      var old = await reg0.pushManager.getSubscription();
      if (old) await old.unsubscribe();
    } catch(e){}
    S.pushOn = 0; save(); sfx("tap");
    toast("Off. Nothing will arrive on this phone.");
    render({ keepScroll: true });
    return;
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)
      || !(window.crypto && crypto.subtle)){
    sfx("no");
    toast(isiOS() ? "iOS only allows this once Daylight is on the Home Screen." : "This browser cannot do push.");
    return;
  }
  if (isiOS() && !isStandalone()){
    sfx("no");
    toast("Home Screen first \u2014 iOS only allows the nudge for installed apps.");
    return;
  }
  var go = await ask({
    title: "The nudges",
    say: "Twice a day. 08:00: what the day looks like \u2014 which pillar first, tonight\u2019s "
       + "session, today\u2019s card. 22:15: what is still open, or that the day is already in. "
       + "Two steps \u2014 your phone asks permission now, then one paste into the repo so the "
       + "scheduler can reach this phone.",
    confirm: "Turn it on", cancel: "Not now"
  });
  if (!go) return;
  try {
    var perm = await Notification.requestPermission();
    if (perm !== "granted"){
      sfx("no"); toast("No permission, no nudge. Re-allow it in Settings if you change your mind.");
      return;
    }
    var keys = await vapidPair();
    var reg = await navigator.serviceWorker.ready;
    var prev = await reg.pushManager.getSubscription();
    if (prev) await prev.unsubscribe();
    var sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: b64uToBytes(keys.pub)
    });
    var bundle = pushBundle(sub.toJSON(), keys);
    S.pushOn = 1; S.pushMade = today(); S.pushBundle = bundle;
    save(); sfx("done"); buzz(14);
    render({ keepScroll: true });
    showBundle(bundle);
  } catch(e){
    sfx("no");
    toast("The phone refused the subscription. Nothing changed.");
  }
}

/* The one paste, with the exact route to where it goes, and two ways to
   carry it there: the clipboard, or the share sheet to a Mac. */
function showBundle(bundle){
  var el = document.getElementById("modal");
  el.innerHTML = "<div class='mw'><div class='grab'></div>"
    + "<h3>One paste, then it is live</h3>"
    + "<p class='say'>In GitHub, on any device: <b>stu-bot &rarr; Settings &rarr; Secrets and variables "
    + "&rarr; Actions &rarr; New repository secret</b>. Name it <b>PUSH_BUNDLE</b>, paste this in, "
    + "save. From the next 22:15 the nudge arrives on this phone. Nothing else to set.</p>"
    + "<textarea class='bundle' readonly spellcheck='false'>" + esc(bundle) + "</textarea>"
    + "<div class='btns'>"
    + "<button class='btn pri' data-pushcopy='1'>Copy</button>"
    + (navigator.share ? "<button class='btn' data-pushshare='1'>Share to a Mac</button>" : "")
    + "<button class='btn quiet' data-mk='__no'>Done</button></div></div>";
  el.className = "on";
  document.body.style.overflow = "hidden";
  function close(){ if (!MODAL) return; MODAL = null; el.className = ""; el.innerHTML = ""; document.body.style.overflow = ""; }
  MODAL = { close: close };
  el.onclick = function(ev){
    if (ev.target === el){ close(); return; }
    var b = ev.target.closest ? ev.target.closest("[data-mk],[data-pushcopy],[data-pushshare]") : null;
    if (!b) return;
    ev.stopPropagation();
    if (b.dataset.mk === "__no"){ sfx("tap"); close(); return; }
    if (b.dataset.pushcopy){
      navigator.clipboard.writeText(bundle).then(function(){ sfx("done"); toast("Copied. Paste it as PUSH_BUNDLE.", true); },
        function(){ var t = el.querySelector(".bundle"); if (t){ t.focus(); t.select(); } toast("Select all and copy."); });
      return;
    }
    if (b.dataset.pushshare){
      navigator.share({ title: "PUSH_BUNDLE", text: bundle }).then(function(){ sfx("done"); }, function(){});
    }
  };
}

/* ------------------------------------------------------ the coach file
   The other half of the loop he asked for: a file the game writes about
   itself, handed back to Claude, which comes back as the next tuning.
   Instructions ride inside the file. */
async function doCoachExport(){
  var text = coachExport(), name = "daylight-coach-" + today() + ".md";
  var how = null;
  if (navigator.canShare && window.File){
    try {
      var f = new File([text], name, { type: "text/markdown" });
      if (navigator.canShare({ files: [f] })){
        await navigator.share({ files: [f], title: "Daylight coach file" });
        how = "Sent. Hand it to Claude with a note on how the stretch felt.";
      }
    } catch(e){ if (e && e.name === "AbortError") return; }
  }
  if (!how){
    try {
      var a = document.createElement("a");
      a.href = "data:text/markdown;charset=utf-8," + encodeURIComponent(text);
      a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      how = "Downloaded. Hand it to Claude with a note on how the stretch felt.";
    } catch(e2){}
  }
  if (!how && navigator.clipboard){
    try {
      await navigator.clipboard.writeText(text);
      how = "Copied. Paste it to Claude with a note on how the stretch felt.";
    } catch(e3){}
  }
  if (!how){ sfx("no"); toast("This browser will not hand the file over."); return; }
  sfx("done"); buzz(14);
  toast(how);
}

/* ------------------------------------------------------- the record, out
   Share sheet where the platform has one (iOS: straight into Files or
   Telegram), a plain download elsewhere, the clipboard as the last door. */
async function doBackup(){
  var text = exportSave(), name = "daylight-" + today() + ".json";
  var how = null;
  if (navigator.canShare && window.File){
    try {
      var f = new File([text], name, { type: "application/json" });
      if (navigator.canShare({ files: [f] })){
        await navigator.share({ files: [f], title: "Daylight backup" });
        how = "Saved out. Keep it somewhere that is not this phone.";
      }
    } catch(e){ if (e && e.name === "AbortError") return; }
  }
  if (!how){
    try {
      var a = document.createElement("a");
      a.href = "data:application/json;charset=utf-8," + encodeURIComponent(text);
      a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      how = "Downloaded. Keep it somewhere that is not this phone.";
    } catch(e2){}
  }
  if (!how && navigator.clipboard){
    try {
      await navigator.clipboard.writeText(text);
      how = "Copied instead. Paste it into notes or an email now.";
    } catch(e3){}
  }
  if (!how){ sfx("no"); toast("This browser will not hand the file over."); return; }
  S.lastBackup = today(); save();
  sfx("done"); buzz(14);
  toast(how);
  render({ keepScroll: true });
}

async function askRestore(){
  var v = await ask({
    title: "Restore the record",
    say: "Open the backup file, copy everything inside, and paste it here. "
       + "What is on this phone now gets replaced.",
    field: { label: "The backup", value: "", placeholder: "{\"days\":{…" },
    confirm: "Check it", cancel: "Cancel"
  });
  if (v === null) return;
  var p;
  try {
    p = JSON.parse(String(v));
    if (!p || typeof p !== "object" || !p.days) throw 0;
  } catch(e){ sfx("no"); toast("That does not read as a Daylight backup."); return; }
  var nDays = Object.keys(p.days).length;
  var ok = await ask({
    title: "Replace everything?",
    say: "The backup holds " + nDays + (nDays === 1 ? " logged day" : " logged days")
       + ". Everything currently on this phone is overwritten, and there is no undo.",
    confirm: "Restore it", cancel: "Keep what I have", danger: true
  });
  if (!ok) return;
  importSave(String(v));
  S.lastBackup = today(); save();
  sfx("level"); buzz([20, 50, 30]);
  toast("The record is back.");
  tab = "today"; render({ turn: true, animate: true });
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

/* Since v39 the phone's clock answers this by itself. The list stays for the
   one case it cannot cover: a phone deliberately left on Singapore time. */
/* Which of the three answered: his own word, the ground, or the clock. */
function whereSource(){
  var rec = whereOn(today()) || {};
  var city = situation().city;
  if (rec.m) return city + " \u2014 set by you";
  if (rec.g) return city + " \u2014 from your location";
  if (S.autoZone === 0) return S.camp + " \u2014 set by hand";
  return city + " \u2014 from the phone\u2019s clock";
}

async function askCamp(){
  var sit = situation(), sh = shape(), auto = S.autoZone !== 0;
  var v = await ask({
    title: "Where you are",
    say: "The shift is fixed to Malta. Where you stand only changes what that lands as \u2014 "
       + "and the phone\u2019s clock already knows.",
    options: [
      { id: "__auto", label: "Follow the phone\u2019s clock",
        note: sit.city + " now \u00b7 Malta lands " + sh.startT + "\u2013" + sh.endT, pri: auto },
      { id: "__gps", label: "Use my location",
        note: "Asks the phone once. Names the city and centres the searches; the "
            + "coordinate stays on this phone and is forgotten tomorrow." }
    ].concat(CAMPS.map(function(c){
      return { id: c[0], label: c[0], note: "set by hand", pri: !auto && c[0] === S.camp };
    })),
    cancel: "Close"
  });
  if (!v || v === "__no") return;
  if (v === "__auto"){ S.autoZone = 1; save(); sfx("done"); render({ keepScroll: true }); return; }
  if (v === "__gps"){ locate(true); return; }
  S.autoZone = 0; S.camp = v; save(); sfx("done"); render({ keepScroll: true });
}
/* "I am not there." The clock said one thing and he says another; his answer
   wins, for today and back over the stay, and the clock is left switched on
   for the next time it is right. */
async function askWhere(){
  var sit = situation();
  var near = [];
  if (sit.city !== "Singapore") near.push({ id: "Singapore", label: "Singapore", note: "home", pri: true });
  ["Sheffield", "Malta"].forEach(function(c){
    if (c !== sit.city) near.push({ id: c, label: c, note: c === "Malta" ? "the office" : "family" });
  });
  CAMPS.forEach(function(c){
    var name = String(c[0]).replace(" / UK", "");
    if (name !== sit.city && !near.filter(function(x){ return x.id === name; }).length){
      near.push({ id: name, label: name, note: "" });
    }
  });
  var v = await ask({
    title: "Where are you really?",
    say: "The phone’s clock says " + sit.city + ". If that is wrong, say so — it fixes "
       + "this stay, not just today, and the clock keeps working for the next trip.",
    options: near,
    cancel: "Cancel"
  });
  if (!v || v === "__no") return;
  setWhere(v);
  sfx("done"); buzz(12);
  toast(v === "Singapore" ? "Home. The record says so too." : "Set to " + v + ".");
  render({ keepScroll: true });
}

/* One location read, on a tap, never at launch: an iPhone re-asks a
   home-screen app every time it is opened, so this is a button. Two decimals
   is about a kilometre - enough to centre a map search, not enough to name a
   street - and it is kept outside the save, so no backup and no coach file
   ever carries a coordinate. */
function pinMe(){ locate(false); }

/* Has he already said yes? If so the app can read the fix without a prompt,
   which is the whole difference between a feature he has to remember to use
   and one that simply works. Permissions.query is not on every browser, so a
   missing answer means "ask him", never "assume yes". */
async function geoGranted(){
  try {
    if (!navigator.permissions || !navigator.permissions.query) return false;
    var st = await navigator.permissions.query({ name: "geolocation" });
    return st && st.state === "granted";
  } catch(e){ return false; }
}
/* Quietly, on opening the app: if the ground is available for free, take it.
   Never prompts - a prompt on every open is exactly what made this a button
   in the first place - and never argues with a place he set himself. */
var GEO_LAST = 0;
async function autoLocate(){
  if (S.autoZone === 0) return;
  var rec = whereOn(today());
  if (rec && rec.m) return;                       /* his own word stands */
  if (Date.now() - GEO_LAST < 5 * 60 * 1000) return;
  if (!(await geoGranted())) return;
  GEO_LAST = Date.now();
  navigator.geolocation.getCurrentPosition(function(pos){
    var la = Math.round(pos.coords.latitude * 100) / 100;
    var lo = Math.round(pos.coords.longitude * 100) / 100;
    pinSave(la, lo);
    var hit = setWhereFromFix(la, lo);
    if (hit && hit.near && hit.changed){
      toast(hit.was ? hit.was + " → " + hit.city + "." : hit.city + ".");
      render({ keepScroll: true });
    }
  }, function(){}, { enableHighAccuracy: false, timeout: 8000, maximumAge: 900000 });
}


/* One location read, on a tap, never at launch: an iPhone re-asks a
   home-screen app every time it is opened, so this is a button. Two decimals
   is about a kilometre - enough to centre a map search and to tell one city
   from another, not enough to name a street - and it is kept outside the
   save, so no backup and no coach file ever carries a coordinate.

   The fix answers two questions at once: where to search from, and what
   city he is standing in. The second is the one the clock keeps getting
   wrong, and the ground cannot be wrong about it. */
function locate(setPlace){
  if (!navigator.geolocation){ toast("This browser will not say where it is."); return; }
  toast("Asking the phone…");
  navigator.geolocation.getCurrentPosition(function(pos){
    var la = Math.round(pos.coords.latitude * 100) / 100;
    var lo = Math.round(pos.coords.longitude * 100) / 100;
    var p = pinSave(la, lo);
    var hit = setPlace ? setWhereFromFix(la, lo) : placeFromFix(la, lo);
    sfx("done"); buzz(12);
    if (setPlace && hit && hit.near){
      toast(hit.changed ? (hit.was ? hit.was + " → " + hit.city + ". Fixed." : hit.city + ".")
                        : hit.city + ". That was right already.");
    } else if (setPlace){
      toast(hit ? "Nothing I know within " + hit.km + "km. Pick it by hand."
                : "No location given.");
    } else {
      toast(p.l ? "Near " + p.l + "." : "Pinned. Maps will search from here.");
    }
    render({ keepScroll: true });
  }, function(err){
    toast(err && err.code === 1
      ? "Location is off for this app. Settings → Daylight → Location."
      : "No location given. The clock still knows the city.");
  }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
}

/* A toast is no use for something he has to go and change in Settings. */
async function geoFailed(err){
  var denied = err && err.code === 1;
  var v = await ask({
    title: denied ? "Location is switched off" : "The phone would not say",
    say: denied
      ? "For an app on the Home Screen it is its own setting: Settings \u2192 Daylight "
        + "\u2192 Location \u2192 While Using. Until then, name the place yourself \u2014 "
        + "that works just as well and outranks everything."
      : "No fix came back \u2014 indoors, or the phone was slow. Try again, or name the "
        + "place yourself.",
    options: [{ id: "__hand", label: "Name it myself", pri: true },
              { id: "__retry", label: "Try again" }],
    cancel: "Leave it"
  });
  if (v === "__hand"){ askWhere(); return; }
  if (v === "__retry"){ locate(true); }
}

async function askReset(){
  var ok = await ask({
    title: "Clear everything?",
    say: "Every day logged, every card held, every chip, the pot and the trophies. There is no undo "
       + "&mdash; if you want a way back, back the record up first.",
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
  S.quests = {}; S.lived = {}; S.chips = {}; S.chipRewards = {}; S.lastBackup = 0;
  save(); sfx("no");
  tab = "today"; render({ turn: true, animate: true });
}

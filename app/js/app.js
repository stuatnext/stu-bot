"use strict";

/* ========================================================================
   app.js - the shell.

   Three tabs, one delegated tap handler, the front door, and the clock
   tick. Everything here is wiring; the feel lives in the other files.
   ======================================================================== */

/* ==================================================================== the HUD
   Rank, progress, the pot and the spares, on every screen, always. This is
   most of what separates a game client from a page: the furniture never
   leaves, so the app is a place you are in rather than a document you are
   reading. */
var HUD = { xp:0, pot:0, spares:0, level:0 };
function paintHud(animate){
  var r = rank(), pt = pot(), sp = spares();
  var pct = r.to ? (r.xp - r.from) / (r.to - r.from) : 1;
  var C = 2 * Math.PI * 19;

  /* The pot chip is never hidden. It used to disappear until the pot was
     non-zero, which meant the one mechanic that pays real money did not exist
     on a fresh install - he asked where it was, and the honest answer was
     nowhere. A chip reading $0 is an invitation; an absent chip is a secret.
     Spares still hide, because a spare with nothing to spend it on is only
     furniture. */
  var hasSpares = sparesEarned() > 0;
  var run = dayRun();
  document.getElementById("chipFlame").hidden = fullDays() === 0;
  document.getElementById("chipFlameN").textContent = run;
  document.getElementById("chipFlame").classList.toggle("cold", run === 0);
  document.getElementById("chipPot").classList.toggle("cold", potTotal() === 0);
  document.getElementById("chipShard").hidden = !hasSpares;
  document.getElementById("hud").classList.toggle("bare", r.xp === 0);

  var crest = document.getElementById("crest");
  crest.querySelector(".fg").setAttribute("stroke-dasharray", (C * pct).toFixed(1) + " " + C.toFixed(1));
  crest.querySelector("b").textContent = r.level;
  if (animate && r.level > HUD.level && HUD.level){
    crest.classList.remove("up"); void crest.offsetWidth; crest.classList.add("up");
  }

  var potEl = document.getElementById("chipPotN"), spEl = document.getElementById("chipShardN");
  if (animate) countTo(potEl, HUD.pot, pt, function(v){ return num(v); });
  else potEl.textContent = num(pt);
  if (animate) countTo(spEl, HUD.spares, sp, function(v){ return num(v); });
  else spEl.textContent = num(sp);

  HUD = { xp:r.xp, pot:pt, spares:sp, level:r.level };

  var w = packsWaiting(), packs = w.day + w.streak, nu = newCount();
  setBadge("cards", packs || nu, !!packs);
}
function setBadge(tab, n, pulse){
  var b = document.querySelector("#nav button[data-tab='" + tab + "']");
  if (!b) return;
  var old = b.querySelector(".badge");
  if (old) old.remove();
  if (!n) return;
  var s = document.createElement("span");
  s.className = "badge" + (pulse ? " pulse" : "");
  s.textContent = n > 99 ? "99+" : n;
  b.appendChild(s);
}


var BUILD = "v33";

/* Chrome/Android hand over an install prompt; hold it for the You row. */
var INSTALL_PROMPT = null;
window.addEventListener("beforeinstallprompt", function(e){
  e.preventDefault();
  INSTALL_PROMPT = e;
});
window.addEventListener("appinstalled", function(){
  INSTALL_PROMPT = null;
  toast("On the Home Screen. Open it from there.", true);
});

/* ------------------------------------------------------------------ router */
var TABS = { today: viewToday, gym: viewGym, food: viewFood, basics: viewBasics,
             work: viewWork, cards: viewDeck, vault: viewVault, you: viewYou };
var tab = "today";

function render(opts){
  opts = opts || {};
  var el = document.getElementById("screen");
  var keep = opts.keepScroll ? window.scrollY : null;
  /* Today is a scene: one viewport, no scrolling, staged entrance. The other
     two are lists and scroll like lists. */
  document.body.classList.toggle("scene", tab === "today");
  el.classList.toggle("arrive", !!opts.turn || !!opts.first);
  el.innerHTML = TABS[tab]();
  if (opts.turn){
    el.classList.remove("turn", "turn-back");
    void el.offsetWidth;
    el.classList.add(opts.back ? "turn-back" : "turn");
  }
  var nav = document.querySelectorAll("#nav button");
  for (var i = 0; i < nav.length; i++){
    nav[i].setAttribute("aria-current", nav[i].dataset.tab === tab ? "true" : "false");
  }
  paintHud(!!opts.animate);
  coachSync();
  if (keep === null) window.scrollTo(0, 0); else window.scrollTo(0, keep);
}
function go(next){
  if (next === tab) return;
  /* Matches the bar left to right, so a swipe goes the way the eye does. You is
   last because it is reached from the crest rather than the bar. */
var order = ["today", "gym", "food", "basics", "work", "cards", "vault", "you"];
  var back = order.indexOf(next) < order.indexOf(tab);
  tab = next;
  sfx("nav"); buzz(8);
  render({ turn: true, back: back });
}

/* ------------------------------------------------------------- the handler */
document.addEventListener("click", function(ev){
  var b = ev.target.closest ? ev.target.closest("button, .tc, [data-card]") : null;
  if (!b) return;
  var ds = b.dataset || {};

  if (ds.coachskip){ coachSkip(); return; }
  if (ds.tab){ go(ds.tab); return; }
  if (ds.p){ tapPillar(ds.p, b); return; }
  if (ds.slot){ askAnchor(ds.slot); return; }
  if (ds.undofood){ undoFood(); return; }
  if (ds.lift){ var lp = ds.lift.split(":"); askLift(lp[0], Number(lp[1])); return; }
  if (ds.swap){ var sp = ds.swap.split(":"); askSwap(sp[0], Number(sp[1])); return; }
  if (ds.finish){ finishSession(); return; }
  if (ds.startsession){ sfx("tap"); startSession(ds.startsession); return; }
  if (ds.how){ var hw = ds.how.split(":"); askHow(hw[0], Number(hw[1])); return; }
  if (typeof SESSION !== "undefined" && SESSION && sessionTap(ds, b)) return;
  if (ds.fold){ toggleFold(ds.fold); return; }
  if (ds.pushagain){ if (S.pushBundle) showBundle(S.pushBundle); return; }
  if (ds.restskip){ restStop(); return; }
  if (ds.waist){ askWaist(); return; }
  if (ds.water){ tapWater(Number(ds.water)); return; }
  if (ds.sleep){ askSleep(); return; }
  if (ds.out){ tapOut(); return; }
  if (ds.newseason){ askNewSeason(); return; }
  if (ds.work){ toggleWork(ds.work); return; }
  if (ds.order){ var od = ORDERS.filter(function(o){ return o[0] === ds.order; })[0];
    if (od) logFood(od[0], od[1], nowSlot()); return; }
  if (ds.open){ sfx("tap"); openStage(packsWaiting().streak ? "streak" : "day"); return; }
  if (ds.pack){ sfx("tap"); openStage(ds.pack); return; }
  if (ds.set){ DECKSET = ds.set; DECKFILTER = 0; sfx("tap"); render({ keepScroll: true }); return; }
  if (ds.df !== undefined){ DECKFILTER = Number(ds.df); sfx("tap"); render({ keepScroll: true }); return; }
  if (ds.cardswhy){ S.cardsWhy = 1; save(); sfx("done"); render({ keepScroll: true }); return; }
  if (ds.card){ openSheet(ds.card); return; }
  if (ds.liveit){ liveIt(ds.liveit); return; }
  if (ds.doit){ doItUI(ds.doit, b); return; }
  if (ds.keepin){ keepUI(ds.keepin, b); return; }
  if (ds.letgo){ letGoUI(ds.letgo); return; }
  if (ds.sealed){ var sl = ds.sealed.split("|"); openSealed(sl[0], sl[1]); return; }
  if (ds.craftr){ var cr = ds.craftr.split("|"); closeSheet(); doCraftR(cr[0], cr[1]); return; }
  if (ds.craft){ askCraft(ds.craft); return; }
  if (ds.claim){ askClaimTrophy(ds.claim); return; }
  if (ds.questdone){ questDone(b); return; }
  if (ds.questswap){ questSwap(); return; }
  if (ds.monthok){
    S.monthSeen = S.monthSeen || {};
    S.monthSeen[ds.monthok] = 1;
    save(); sfx("done"); buzz(10);
    render({ keepScroll: true, animate: true });
    return;
  }
  if (ds.install){ askInstall(); return; }
  if (ds.push){ askPush(); return; }
  if (ds.coachx){ doCoachExport(); return; }
  if (ds.chipdone){ closeChip(); return; }
  if (ds.chipreward){ askChipReward(Number(ds.chipreward)); return; }
  if (ds.backup){ doBackup(); return; }
  if (ds.restore){ askRestore(); return; }
  if (ds.spend){ askSpend(); return; }
  if (ds.rate){ askRate(); return; }
  if (ds.freeze){ askFreeze(); return; }
  if (ds.camp){ askCamp(); return; }
  if (ds.go){ location.href = ds.go; return; }
  if (ds.sound){
    S.mute = !S.mute; save(); if (!S.mute) sfx("done");
    render({ keepScroll: true }); return;
  }
  if (ds.replay){
    sfx("tap");
    tab = "today"; render();
    coachStart(true);
    return;
  }
  if (ds.reset){ askReset(); return; }
  if (b.id === "crest"){ sfx("tap"); go("you"); return; }   /* the crest is his rank, so it opens You */
  if (b.id === "chipFlame"){ sfx("tap"); go("today"); return; }
  if (b.id === "chipPot"){ sfx("tap"); go("vault"); return; }
  if (b.id === "chipShard"){ sfx("tap"); go("cards"); return; }
});

/* Back closes whatever is on top before it leaves the app. */
window.addEventListener("keydown", function(ev){
  if (ev.key !== "Escape") return;
  if (MODAL) MODAL.close(null);
  else if (typeof SESSION !== "undefined" && SESSION) closeSession();
  else if (document.getElementById("sheet").className) closeSheet();
  else if (document.getElementById("chip").className) closeChip();
  else if (ST) closeStage();
});



/* -------------------------------------------------------------- front door */
function everLoggedAnything(){
  return PILLARS.some(function(g){ return !!firstDay(g[0]); }) || !!S.onboarded;
}
function openGate(){
  var g = document.getElementById("gate");
  if (!g) return;
  if (everLoggedAnything()) return;         /* shown once, ever */
  g.hidden = false;
  g.addEventListener("click", function(){
    g.classList.add("going");
    sfx("done"); buzz(12);
    setTimeout(function(){ g.hidden = true; coachStart(); }, 520);
  }, { once: true });
}
/* The world arrives when the first pack has been opened, not before. */
function graduate(){
  if (typeof COACH !== "undefined" && COACH.on) coachStop();
  if (S.onboarded) return;
  S.onboarded = 1; save();
  toast("That is the loop. The rest is yours now.", true);
}

/* ------------------------------------------------------------------- start */
backfillChips();
paintSky();
render({ first: true });
paintHud();
openGate();
/* A rest running when the app was closed or reloaded is still running. */
restPaint();
restSync();

/* Opening the app answers the badge; keep the mirror warm for tonight. */
try { if (navigator.clearAppBadge) navigator.clearAppBadge(); } catch(e){}
mirrorState();

/* If the phone quietly revoked the nudge (permission pulled, subscription
   gone), the switch should say so rather than lie. */
if (S.pushOn && "serviceWorker" in navigator && "PushManager" in window){
  (async function(){
    try {
      if (Notification.permission !== "granted") throw 0;
      var reg = await navigator.serviceWorker.ready;
      var sub = await reg.pushManager.getSubscription();
      if (!sub) throw 0;
    } catch(e){
      S.pushOn = 0; save();
      if (tab === "you") render({ keepScroll: true });
    }
  })();
}

/* The sun moves whether he does or not - but repaint only the sky, never the
   screen: a full rebuild every minute silently eats anything half-typed. */
setInterval(function(){
  paintSky();
  if (tab !== "today" || ST || MODAL) return;
  var sk = document.querySelector("#screen .skycard");
  if (sk) sk.outerHTML = skyCardHTML();
}, 60000);

/* Hold the title card for a beat, then hand over. */
window.addEventListener("load", function(){
  setTimeout(function(){
    var b = document.getElementById("boot");
    if (b) b.classList.add("gone");
    S.booted = (S.booted || 0) + 1;
    save();
  }, reduced() ? 60 : 850);
});
setTimeout(function(){
  var b = document.getElementById("boot");
  if (b) b.classList.add("gone");
}, 2600);

/* Offline, installable - and, from v27, actually updatable.

   The bug this fixes: an app on the Home Screen that is resumed from the app
   switcher never navigates again. The service worker was already network-first,
   so it would have served fresh files happily - but nothing ever asked it for
   any, because the page had been sitting in memory since whenever it was last
   cold-started. He was looking at a build two releases old and there was no
   way for him or me to tell from inside the app.

   So: ask for an update whenever the app comes back to the foreground, and
   when a new worker takes over, reload once. Never on the first-ever install
   (there was no old build to replace), and never over the top of something he
   is in the middle of - a reload while a modal is open would eat what he was
   typing, so it waits for the next time he comes back. */
if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0){
  var HAD_SW = !!navigator.serviceWorker.controller;
  var RELOADING = false, RELOAD_WANTED = false;

  function busyNow(){
    return !!MODAL || !!ST || (typeof SESSION !== "undefined" && !!SESSION)
      || !!document.getElementById("sheet").className
      || !!document.getElementById("stage").className
      || !!document.getElementById("chip").className;
  }
  function takeUpdate(){
    if (RELOADING) return;
    if (busyNow()){ RELOAD_WANTED = true; return; }
    RELOADING = true;
    location.reload();
  }

  window.addEventListener("load", function(){
    navigator.serviceWorker.register("sw.js").then(function(reg){
      navigator.serviceWorker.addEventListener("controllerchange", function(){
        /* First install on a page that had no worker: nothing to replace. */
        if (!HAD_SW) return;
        takeUpdate();
      });
      function check(){
        if (RELOAD_WANTED){ takeUpdate(); return; }
        try { reg.update(); } catch(e){}
      }
      document.addEventListener("visibilitychange", function(){
        if (!document.hidden) check();
      });
      window.addEventListener("focus", check);
      setInterval(check, 30 * 60 * 1000);
    }).catch(function(){});
  });
}

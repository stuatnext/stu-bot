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

  /* Nothing in the HUD until it means something. Two chips reading zero on a
     first open is the app showing off furniture he has not earned. */
  var earnedAny = potTotal() > 0, hasSpares = sparesEarned() > 0;
  var run = dayRun();
  document.getElementById("chipFlame").hidden = fullDays() === 0;
  document.getElementById("chipFlameN").textContent = run;
  document.getElementById("chipFlame").classList.toggle("cold", run === 0);
  document.getElementById("chipPot").hidden = !earnedAny;
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


var BUILD = "v18";

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
var TABS = { today: viewToday, cards: viewDeck, body: viewBody, you: viewYou };
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
  var order = ["today", "cards", "body", "you"];
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
  if (ds.finish){ finishSession(); return; }
  if (ds.waist){ askWaist(); return; }
  if (ds.open){ sfx("tap"); openStage(packsWaiting().streak ? "streak" : "day"); return; }
  if (ds.pack){ sfx("tap"); openStage(ds.pack); return; }
  if (ds.set){ DECKSET = ds.set; DECKFILTER = 0; sfx("tap"); render({ keepScroll: true }); return; }
  if (ds.df !== undefined){ DECKFILTER = Number(ds.df); sfx("tap"); render({ keepScroll: true }); return; }
  if (ds.cardswhy){ S.cardsWhy = 1; save(); sfx("done"); render({ keepScroll: true }); return; }
  if (ds.card){ openSheet(ds.card); return; }
  if (ds.craftit){ closeSheet(); askCraftOne(ds.craftit); return; }
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
  if (b.id === "crest"){ sfx("tap"); go("cards"); return; }
  if (b.id === "chipFlame"){ sfx("tap"); go("today"); return; }
  if (b.id === "chipPot"){ sfx("tap"); go("you"); return; }
  if (b.id === "chipShard"){ sfx("tap"); go("cards"); return; }
});

/* Back closes whatever is on top before it leaves the app. */
window.addEventListener("keydown", function(ev){
  if (ev.key !== "Escape") return;
  if (MODAL) MODAL.close(null);
  else if (document.getElementById("sheet").className) closeSheet();
  else if (document.getElementById("chip").className) closeChip();
  else if (ST) closeStage();
});

/* Crafting one named card from its sheet. */
async function askCraftOne(name){
  var c = cardByName(name);
  if (!c || !canCraft(c)){ sfx("no"); toast("Not enough spares for that one."); return; }
  craft(name);
  sfx("craft"); buzz([16, 40, 16]);
  render({ keepScroll: true, animate: true });
  setTimeout(function(){ openSheet(name); }, 220);
}

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

/* Offline, and installable. Service workers only exist over https, so this
   is a no-op from file:// and never blocks the app. */
if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0){
  window.addEventListener("load", function(){
    navigator.serviceWorker.register("sw.js").catch(function(){});
  });
}

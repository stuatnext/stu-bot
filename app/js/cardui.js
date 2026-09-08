"use strict";

/* ========================================================================
   cardui.js - the pack ceremony and the card sheet.

   Opening a pack takes the screen: the sachet tears, the stage lights, and
   every card arrives face-down for the player to turn over - nothing here
   acts on his behalf. The sheet answers "what is this card" for a card he
   holds; for one he does not, the answer is the back, on purpose.
   ======================================================================== */

/* ================================================================= the stage
   One DOM for the whole ceremony, built once and mutated: the pack tears and
   drops, the stack rises out of it, each card lifts, teases if it is worth
   teasing, turns, lands, and flies to a tray at the bottom - so by the last
   one the whole pull is on the table. The old stage rebuilt innerHTML at
   every step, which is a slide show with sound effects. */
var ST = null;
function stageEl(){ return document.getElementById("stage"); }

function stageFrame(kind, n){
  var withPack = kind !== "one";
  var title = kind === "streak" ? "Streak Pack" : "Day Pack";
  return "<div class='rays'></div><div class='flash'></div>"
    + "<div class='step' id='stStep'>" + (withPack ? "Tap to open" : "Tap to turn over") + "</div>"
    + "<div class='arena' id='stArena'>"
    +   "<div class='stack" + (withPack ? "" : " up") + "' id='stStack'>" + ghostsHTML(n) + "</div>"
    +   (withPack
        ? "<button class='pk" + (kind === "streak" ? " big" : "") + "' id='stPack'>"
          + "<span class='pk-sheen'></span><span class='pk-strip'></span>"
          + "<span class='pk-body'><span class='pk-ttl'>" + title + "</span>"
          + "<span class='pk-sub'>" + n + (n === 1 ? " card" : " cards") + "</span></span></button>"
        : "")
    + "</div>"
    + "<div class='dots' id='stDots'></div>"
    + "<div class='tray' id='stTray'></div>"
    + "<div class='under' id='stUnder' style='visibility:hidden'><button id='stNext'>Next</button></div>";
}
/* The rest of the pack, as a real stack: each card back a little lower, a
   little turned, a little dimmer than the one on top of it. */
function ghostsHTML(n){
  var h = "";
  for (var k = n - 1; k >= 1; k--) h += "<div class='ghost' style='--k:" + k + "'></div>";
  return h;
}
function dotsHTML(){
  var h = "";
  for (var i = 0; i < ST.cards.length; i++){
    var e0 = ST.cards[i], seen = i < ST.i;
    var c0 = typeof e0 === "string" ? cardByName(e0) : null;
    h += "<i class='" + (seen ? (c0 && c0[1] >= 2 ? "on hi" : "on") : "") + "' data-dot='" + i + "'></i>";
  }
  return h;
}

function openStage(kind){
  var before = rank().level, sparesBefore = spares();
  var got = openPack(kind);
  ST = { cards: got, i: 0, kind: kind, lvlBefore: before, sparesBefore: sparesBefore };
  var el = stageEl();
  el.innerHTML = stageFrame(kind, got.length);
  el.className = "on";
  document.body.style.overflow = "hidden";
  document.getElementById("stDots").innerHTML = dotsHTML();
  document.getElementById("stPack").addEventListener("click", tearPack, { once: true });
}

function tearPack(){
  var pk = document.getElementById("stPack"), st = document.getElementById("stStack");
  sfx("tear"); buzz([12, 30, 18]);
  pk.classList.add("tear");
  stageEl().classList.add("lit");
  var fast = reduced();
  setTimeout(function(){ st.classList.add("up"); }, fast ? 0 : 220);
  setTimeout(dealNext, fast ? 0 : 640);
  /* The torn pack fades out but it was still there, invisible, on top of the
     card, taking the tap that should have turned it. Once it has dropped, it
     is gone. */
  setTimeout(function(){ if (pk.parentNode) pk.parentNode.removeChild(pk); }, fast ? 0 : 720);
}

/* The next card comes off the top of the stack, face down. */
function dealNext(){
  var st = document.getElementById("stStack");
  if (!ST || !st) return;
  var e = ST.cards[ST.i];
  var step = document.getElementById("stStep");
  if (step) step.textContent = "Tap to turn over \u00b7 " + (ST.i + 1) + " of " + ST.cards.length;
  var ghost = st.querySelector(".ghost");
  if (ghost) ghost.remove();
  st.insertAdjacentHTML("beforeend", entryFace(e, { down: true, lg: true, extra: " deal" }));
  var tc = st.querySelector(".tc.deal");
  if (!tc) return;
  tc.addEventListener("click", function(){ turnCard(tc, e); }, { once: true });
  tilt(tc);
  var u = document.getElementById("stUnder");
  if (u) u.style.visibility = "hidden";
  if (reduced()) turnCard(tc, e);
}
/* What kind of thing an entry is, and its rarity if it has one. */
function entryInfo(e){
  if (typeof e === "string"){ var c = cardByName(e); return { kind: "card", c: c, r: c ? c[1] : 0 }; }
  return { kind: e.k, c: null, r: -1 };
}

/* Lift, tease if it deserves it, turn, land. The rarer the card, the longer
   the moment before you know - that pause is the whole trade. */
function turnCard(tc, e){
  var info = entryInfo(e), r = info.r, fast = reduced();
  var tease = fast ? 0 : (r === 3 ? 640 : r === 2 ? 460 : 0);
  var flip = fast ? 0 : (r === 3 ? 1050 : r === 2 ? 860 : 620);
  tc.classList.remove("deal");
  tc.classList.add("lift");
  if (tease){ tc.classList.add("tease" + r); sfx("tease"); buzz([8, 60, 8, 60, 12]); }
  setTimeout(function(){
    tc.style.setProperty("--flipd", flip + "ms");
    tc.classList.remove("down");
    sfx("flip"); buzz(14);
    if (r >= 2 && !fast){
      /* the face ignites as it comes round */
      setTimeout(function(){
        var f = document.querySelector("#stage .flash");
        if (!f) return;
        f.classList.remove("go", "gold"); void f.offsetWidth;
        f.classList.add("go"); if (r === 3) f.classList.add("gold");
      }, Math.round(flip * 0.45));
    }
    setTimeout(function(){ landCard(tc, e); }, flip);
  }, tease);
}

function landCard(tc, e){
  var info = entryInfo(e), r = info.r, c = info.c, el = stageEl();
  if (!ST) return;
  tc.classList.remove("lift", "tease2", "tease3");
  tc.classList.add("land");
  el.classList.remove("burst2", "burst3"); void el.offsetWidth;
  if (r >= 2){
    el.classList.add("burst" + r);
    tc.classList.add("sweep");
    sparks(tc, r === 3 ? 26 : 16);
    sfx(r === 3 ? "gold" : "rare");
    buzz([20, 45, 25, 45, 40]);
  } else if (info.kind === "do"){
    tc.classList.add("sweep"); sfx("done"); buzz([14, 30, 14]);
  } else if (info.kind === "in"){
    sfx("tick"); buzz(10);
  } else {
    sfx("land");
  }
  var step = document.getElementById("stStep");
  if (step){
    if (c){
      var dup = S.cards[c[0]] > 1;
      step.textContent = RARITY[r][0] + (dup ? " \u00b7 spare \u00b7 +" + RARITY[r][4] : " \u00b7 new");
    } else {
      step.textContent = info.kind === "do" ? "A thing to do" : "A thought to keep";
    }
  }
  var dot = document.querySelector("[data-dot='" + ST.i + "']");
  if (dot) dot.className = r >= 2 ? "on hi" : "on";
  var u = document.getElementById("stUnder");
  if (u){
    u.style.visibility = "visible";
    var b = document.getElementById("stNext");
    var last = ST.i >= ST.cards.length - 1;
    b.textContent = last ? "Done" : "Next";
    b.className = last ? "pri" : "";
    b.onclick = function(){ sfx("tap"); if (last) showScore(); else advance(tc, e); };
  }
}

/* The turned card goes to the tray, and the next one comes off the stack. */
function trayAdd(e){
  var tray = document.getElementById("stTray");
  if (tray) tray.insertAdjacentHTML("beforeend",
    entryFace(e, { extra: " pop", attr: " aria-hidden='true'" }));
}
function advance(tc, e){
  if (!ST || ST.busy) return;
  /* Next stays visible for the length of the fly, and a second tap in that
     window used to run this again on a card that had already gone - and skip
     the next one. The button goes first. */
  ST.busy = true;
  var u = document.getElementById("stUnder"), b = document.getElementById("stNext");
  if (u) u.style.visibility = "hidden";
  if (b) b.onclick = null;
  tc.classList.add("fly");
  trayAdd(e);
  setTimeout(function(){
    if (tc.parentNode) tc.parentNode.removeChild(tc);
    ST.i++;
    ST.busy = false;
    dealNext();
  }, reduced() ? 0 : 380);
}

function sparks(host, n){
  if (reduced()) return;
  var b = document.createElement("div");
  b.className = "burst";
  var h = "";
  for (var i = 0; i < n; i++){
    var a = (i / n) * Math.PI * 2 + Math.random();
    var d = 70 + Math.random() * 90;
    h += "<i style='--dx:" + (Math.cos(a) * d).toFixed(0) + "px;--dy:"
       + (Math.sin(a) * d).toFixed(0) + "px;animation-delay:" + (i * 14) + "ms'></i>";
  }
  b.innerHTML = h;
  host.appendChild(b);
  setTimeout(function(){ if (b.parentNode) b.parentNode.removeChild(b); }, 1300);
}

/* The whole pull stays on the table under the score. */
function showScore(){
  var el = stageEl(), fresh = 0, gain = 0, nCards = 0, nDo = 0, nIn = 0;
  ST.cards.forEach(function(n){
    if (typeof n !== "string"){ if (n.k === "do") nDo++; else nIn++; return; }
    var c = cardByName(n);
    if (!c) return;
    nCards++;
    gain += RARITY[c[1]][3];
    if (S.cards[n] === 1) fresh++;
  });
  var spare = nCards - fresh;
  var gotSpares = spares() - ST.sparesBefore;
  var r = rank(), levelled = r.level > ST.lvlBefore;
  var w = packsWaiting(), more = w.day + w.streak;

  if (document.querySelector("#stage .stack .tc")) trayAdd(ST.cards[ST.i]);
  ["stArena", "stDots", "stStep"].forEach(function(id){
    var x = document.getElementById(id); if (x) x.remove();
  });
  var tray = document.getElementById("stTray");
  var score = document.createElement("div");
  score.className = "score";
  score.innerHTML = (levelled ? "<div class='lvlup'>" + esc(r.name) + "</div>" : "")
    + "<div class='big' id='stXP'>+0 XP</div>"
    + "<div class='sm'>" + fresh + " new" + (spare ? " &middot; " + spare + " spare" : "")
    + " &middot; " + heldCount() + " of " + CARDS.length + " held</div>"
    + (nDo || nIn ? "<div class='sm hand'>" + (nDo ? "something to do" : "")
        + (nDo && nIn ? " &middot; " : "") + (nIn ? "something to keep" : "") + " &middot; in your hand</div>" : "")
    + (gotSpares > 0 ? "<div class='shard'>+" + gotSpares + " spares</div>" : "");
  el.insertBefore(score, tray);
  el.classList.add("scored");

  var u = document.getElementById("stUnder");
  if (u){
    u.style.visibility = "visible";
    u.innerHTML = (more ? "<button id='stMore'>Open another</button>" : "")
      + "<button class='pri' id='stDone'>Done</button>";
    document.getElementById("stDone").onclick = closeStage;
    var m = document.getElementById("stMore");
    if (m) m.onclick = function(){ sfx("tap"); openStage(packsWaiting().streak ? "streak" : "day"); };
  }
  var xpEl = document.getElementById("stXP");
  if (reduced()) xpEl.textContent = "+" + gain + " XP";
  else countTo(xpEl, 0, gain, function(v){ return "+" + Math.round(v) + " XP"; }, 700);
  sfx(levelled ? "level" : "done");
  buzz(levelled ? [30, 60, 30, 60, 60] : 20);
}

function closeStage(){
  /* Opening the first pack is the end of the tutorial: he has done the loop
     once and been paid for it, so the rest of the app can appear. */
  graduate();
  if (typeof coachStop === "function") coachStop();
  sfx("tap");
  var el = stageEl();
  el.className = "";
  el.innerHTML = "";
  document.body.style.overflow = "";
  ST = null;
  paintHud();
  render();
}

/* One card, turned over on the stage: a crafted card, or a trophy. Same
   ceremony as a pack, minus the pack. */
function revealOne(entry){
  ST = { cards: [entry], i: 0, kind: "one", lvlBefore: rank().level, sparesBefore: spares() };
  var el = stageEl();
  el.innerHTML = stageFrame("one", 1);
  el.className = "on lit";
  document.body.style.overflow = "hidden";
  document.getElementById("stDots").innerHTML = dotsHTML();
  dealNext();
}

/* Tapping a sealed slot. It is a real question - "what is in there" - and it
   gets a real answer that is not the card: which set, which rarity, how many
   like it are still sealed, and the one thing spares can do about it. */
function openSealed(setKey, r){
  r = Number(r);
  var st = SETS.filter(function(s){ return s[0] === setKey; })[0];
  var n = craftPool(setKey, r).length;
  var cost = RARITY[r][5], can = canCraftR(setKey, r);
  var el = document.getElementById("sheet");
  el.innerHTML = "<div class='slot' id='shSlot'>" + sealedCard(r, true) + "</div>"
    + "<div class='meta'>" + esc(st ? st[1] : setKey) + " &middot; " + RARITY[r][0]
    + " &middot; not found yet</div>"
    + "<p class='fine' style='text-align:center;margin:2px 14px 0'>"
    + num(n) + " " + RARITY[r][0].toLowerCase() + (n === 1 ? "" : "s")
    + " still to find in this set. Packs find them. You can trade spares for one, "
    + "but the deck picks which.</p>"
    + "<div class='acts'>"
    + "<button class='" + (can ? "pri" : "") + "' " + (can ? "" : "disabled ")
    + "data-craftr='" + esc(setKey) + "|" + r + "'>"
    + (can ? "Trade " + cost + " spares for one"
           : cost + " spares (" + spares() + ")") + "</button>"
    + "<button id='shClose'>Close</button></div>";
  el.className = "on";
  sfx("tap");
  document.getElementById("shClose").onclick = closeSheet;
  el.onclick = function(ev){ if (ev.target === el) closeSheet(); };
}

/* ------------------------------------------------------------- card detail
   Tapping a card asks "what is this". For one he holds, that is the card. For
   one he does not, the honest answer is a sealed back and its rarity - he
   asked not to be shown the deck in advance, and a detail sheet that spells
   out the card is the same spoiler in a bigger font. */
function openSheet(name){
  var c = cardByName(name);
  if (!c) return;
  var held = (S.cards || {})[name];
  var st = SETS.filter(function(s){ return s[0] === c[2]; })[0];
  var el = document.getElementById("sheet");
  if (held && (S.seen || {})[name] === 0){ S.seen[name] = 1; save(); }

  var meta;
  if (held){
    meta = esc(st ? st[1] : "") + " &middot; " + RARITY[c[1]][0]
      + (held > 1 ? " &middot; " + held + " copies, " + ((held - 1) * RARITY[c[1]][4]) + " spares from them" : "")
      + ((S.crafted || {})[name] ? " &middot; crafted" : "");
  } else if (c[1] === 3){
    meta = esc(st ? st[1] : "") + " &middot; not in packs. This one only happens by happening.";
  } else {
    meta = esc(st ? st[1] : "") + " &middot; " + RARITY[c[1]][0] + " &middot; not found yet";
  }

  var canR = c[1] !== 3 && canCraftR(c[2], c[1]);
  var costR = c[1] !== 3 ? RARITY[c[1]][5] : 0;
  /* A held card asks something of you - otherwise it is wallpaper. The ask
     lives here on the sheet, and one of them is the day's side quest. */
  var lived = (S.lived || {})[name];
  /* The ask, and the button that answers it. Living a card used to be
     possible only on the day the hash picked it as the side quest; a card you
     can only act on when told to is not actionable, it is homework. */
  var tryLine = held
    ? "<div class='try" + (lived ? " done" : "") + "'><b>"
      + (lived ? "Done \u00b7 " + esc(nice(lived)) : "To do") + "</b>"
      + esc(cardDo(c))
      + (lived ? "" : "<button class='doit' data-liveit='" + esc(name)
          + "'>Did it &middot; +10 spares, +20 XP</button>")
      + "</div>"
    : "";
  /* He can still spend spares from here, but on a rarity out of this set
     rather than on this card - the deck picks, and turning it over is the
     point. Tapping a sealed slot is a question, not a shopping list. */
  el.innerHTML = "<div class='slot' id='shSlot'></div>"
    + "<div class='meta'>" + meta + "</div>"
    + tryLine
    + (held || c[1] === 3 ? "" :
        "<p class='fine' style='text-align:center;margin:2px 14px 0'>Not found yet. "
        + "You can trade spares for one, but the deck picks which.</p>")
    + "<div class='acts'>"
    + (!held && c[1] !== 3 && setOpen(c[2])
        ? "<button class='" + (canR ? "pri" : "") + "' " + (canR ? "" : "disabled ")
          + "data-craftr='" + esc(c[2]) + "|" + c[1] + "'>"
          + (canR ? "Trade " + costR + " spares for a " + RARITY[c[1]][0].toLowerCase()
                  : costR + " spares (" + spares() + ")")
          + "</button>"
        : "")
    + "<button id='shClose'>Close</button></div>";
  el.className = "on";
  document.getElementById("shSlot").innerHTML = tcard(c, held, { lg: true });
  var tc = el.querySelector(".tc");
  if (held) tilt(tc);
  sfx("tap");
  document.getElementById("shClose").onclick = closeSheet;
  el.onclick = function(ev){ if (ev.target === el) closeSheet(); };
}
function closeSheet(){
  var el = document.getElementById("sheet");
  el.className = ""; el.innerHTML = "";
}

/* Living a card from its own sheet. The card changes in front of him - foil,
   stamp, date - which is the reward, so the sheet stays open to show it. If
   it happened to be today's side quest as well, that is done too; the record
   is the lived card, and it pays once whichever way it was reached. */
function liveIt(name){
  if (!liveCard(name)){ sfx("no"); return; }
  var t = today(), q = questFor(t);
  if (q && q.card[0] === name && !q.done){
    S.quests = S.quests || {};
    S.quests[t] = { done: 1, swaps: q.swaps, card: name };
    save();
  }
  sfx("rare"); buzz([16, 40, 20]);
  openSheet(name);
  var tc = document.querySelector("#sheet .tc");
  if (tc){ tc.classList.add("sweep"); sparks(tc, 16); }
  render({ keepScroll: true, animate: true });
}

/* Trophies are not pulled, they are earned - but the moment should look the
   same, or claiming one feels like ticking a box. */
function claimTrophy(name){
  S.cards = S.cards || {};
  S.cards[name] = 1;
  S.seen = S.seen || {}; S.seen[name] = 0;
  save();
  revealOne(name);
}

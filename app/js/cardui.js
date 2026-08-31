"use strict";

/* ========================================================================
   cardui.js - the pack ceremony and the card sheet.

   Opening a pack takes the screen: the sachet tears, the stage lights, and
   every card arrives face-down for the player to turn over - nothing here
   acts on his behalf. The sheet is the one place "what is this card" gets
   answered, held or not.
   ======================================================================== */

/* ================================================================= the stage */
var ST = null;
function stageEl(){ return document.getElementById("stage"); }

function openStage(kind){
  var before = rank().level, sparesBefore = spares();
  var got = openPack(kind);
  ST = { cards: got, i: 0, kind: kind, lvlBefore: before, sparesBefore: sparesBefore };
  var el = stageEl();
  el.innerHTML =
      "<div class='rays'></div>"
    + "<div class='step'>Tap to open</div>"
    + "<button class='pk" + (kind === "streak" ? " big" : "") + "' id='stPack'>"
    +   "<span class='pk-sheen'></span><span class='pk-strip'></span>"
    +   "<span class='pk-body'><span class='pk-ttl'>"
    +     (kind === "streak" ? "Streak Pack" : "Day Pack") + "</span>"
    +   "<span class='pk-sub'>" + got.length + " cards</span></span>"
    + "</button>"
    + "<div class='under' style='visibility:hidden'></div>";
  el.className = "on";
  document.body.style.overflow = "hidden";
  document.getElementById("stPack").addEventListener("click", tearPack, { once: true });
}

function tearPack(){
  var pk = document.getElementById("stPack");
  sfx("tear"); buzz([12, 30, 18]);
  pk.classList.add("tear");
  stageEl().classList.add("lit");
  setTimeout(showSlot, reduced() ? 0 : 560);
}

function showSlot(){
  var el = stageEl(), left = ST.cards.length - ST.i;
  var dots = "", i;
  for (i = 0; i < ST.cards.length; i++){
    var c0 = cardByName(ST.cards[i]);
    var seen = i < ST.i;
    dots += "<i class='" + (seen ? (c0 && c0[1] >= 2 ? "on hi" : "on") : "") + "' data-dot='" + i + "'></i>";
  }
  el.innerHTML =
      "<div class='rays'></div>"
    + "<div class='step' id='stStep'>Tap to turn over &middot; " + (ST.i + 1)
    +   " of " + ST.cards.length + "</div>"
    + "<div class='slot' id='stSlot'>"
    +   (left > 2 ? "<div class='ghost g2'></div>" : "")
    +   (left > 1 ? "<div class='ghost g1'></div>" : "")
    + "</div>"
    + "<div class='dots'>" + dots + "</div>"
    + "<div class='under' id='stUnder' style='visibility:hidden'>"
    +   "<button id='stNext'>Next</button></div>";
  el.className = "on lit";

  var c = cardByName(ST.cards[ST.i]);
  var slot = document.getElementById("stSlot");
  slot.insertAdjacentHTML("beforeend", tcard(c, S.cards[c[0]], { down: true, lg: true }));
  var tc = slot.querySelector(".tc");
  tc.addEventListener("click", function(){ turnCard(tc, c); }, { once: true });
  tilt(tc);
  if (reduced()) turnCard(tc, c);
}

function turnCard(tc, c){
  tc.classList.remove("down");
  sfx("flip"); buzz(14);
  var delay = reduced() ? 0 : 340;
  setTimeout(function(){
    if (c[1] >= 2){
      tc.classList.add("sweep");
      sparks(tc, c[1] === 3 ? 22 : 14);
      sfx(c[1] === 3 ? "gold" : "rare");
      buzz([20, 45, 25, 45, 40]);
    }
    var st = document.getElementById("stStep");
    var dup = S.cards[c[0]] > 1;
    if (st) st.textContent = RARITY[c[1]][0] + (dup
      ? " · spare · +" + RARITY[c[1]][4]
      : " · new");
    var dot = document.querySelector("[data-dot='" + ST.i + "']");
    if (dot) dot.className = c[1] >= 2 ? "on hi" : "on";
    var u = document.getElementById("stUnder");
    if (u){
      u.style.visibility = "visible";
      var b = document.getElementById("stNext");
      var last = ST.i >= ST.cards.length - 1;
      b.textContent = last ? "Done" : "Next";
      if (last) b.className = "pri";
      b.onclick = function(){
        sfx("tap");
        if (last) showScore(); else { ST.i++; showSlot(); }
      };
    }
  }, delay);
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

function showScore(){
  var el = stageEl(), fresh = 0, gain = 0;
  ST.cards.forEach(function(n){
    var c = cardByName(n);
    if (!c) return;
    gain += RARITY[c[1]][3];
    if (S.cards[n] === 1) fresh++;
  });
  var spare = ST.cards.length - fresh;
  var gotSpares = spares() - ST.sparesBefore;
  var r = rank(), levelled = r.level > ST.lvlBefore;
  var w = packsWaiting(), more = w.day + w.streak;

  el.innerHTML =
      "<div class='rays'></div>"
    + (levelled ? "<div class='lvlup'>" + esc(r.name) + "</div>" : "")
    + "<div class='score'><div class='big'>+" + gain + " XP</div>"
    +   "<div class='sm'>" + fresh + " new" + (spare ? " &middot; " + spare + " spare" : "")
    +   " &middot; " + heldCount() + " of " + CARDS.length + " held</div>"
    +   (gotSpares > 0 ? "<div class='shard'>+" + gotSpares + " spares</div>" : "")
    + "</div>"
    + "<div class='under'>"
    +   (more ? "<button id='stMore'>Open another</button>" : "")
    +   "<button class='pri' id='stDone'>Done</button></div>";
  el.className = "on lit";
  sfx(levelled ? "level" : "done");
  buzz(levelled ? [30, 60, 30, 60, 60] : 20);
  document.getElementById("stDone").onclick = closeStage;
  var m = document.getElementById("stMore");
  if (m) m.onclick = function(){
    sfx("tap");
    openStage(packsWaiting().streak ? "streak" : "day");
  };
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

/* ------------------------------------------------------------- card detail
   Tapping a card shows you the card. Including one you do not hold - that is
   the only place the question "what is this" gets asked, and it used to be
   answered with a face-down back and the words "not found yet". */
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
    meta = esc(st ? st[1] : "") + " &middot; " + RARITY[c[1]][0] + " &middot; not held";
  }

  var can = canCraft(c), cost = craftCost(c);
  /* A held card asks something of you - otherwise it is wallpaper. The ask
     lives here on the sheet, and one of them is the day's side quest. */
  var lived = (S.lived || {})[name];
  var tryLine = held
    ? "<div class='try" + (lived ? " done" : "") + "'><b>"
      + (lived ? "Lived · " + esc(nice(lived)) : "Try") + "</b>"
      + esc(cardDo(c)) + "</div>"
    : "";
  el.innerHTML = "<div class='slot' id='shSlot'></div>"
    + "<div class='meta'>" + meta + "</div>"
    + tryLine
    + "<div class='acts'>"
    + (!held && c[1] !== 3 && setOpen(c[2])
        ? "<button class='" + (can ? "pri" : "") + "' " + (can ? "" : "disabled ")
          + "data-craftit='" + esc(name) + "'>"
          + (can ? "Make it &middot; " + cost + " spares" : cost + " spares (" + spares() + ")")
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

/* Trophies are not pulled, they are earned - but the moment should look the
   same, or claiming one feels like ticking a box. */
function claimTrophy(name){
  var before = rank().level;
  S.cards = S.cards || {};
  S.cards[name] = 1;
  S.seen = S.seen || {}; S.seen[name] = 0;
  save();
  ST = { cards: [name], i: 0, kind: "gold", lvlBefore: before, sparesBefore: spares() };
  var el = stageEl();
  el.className = "on lit";
  el.innerHTML = "";
  document.body.style.overflow = "hidden";
  showSlot();
}

"use strict";

/* ========================================================================
   collection.js - the cards.

   Packs to open at the top, then one set at a time behind a sticky rail,
   with the two questions a collector actually has - what am I missing, what
   do I hold - as filters. Duplicates become spares; spares make missing
   cards; the doors to sealed sets open on full days, and the ladder shows
   the road. Gold cards are never in packs.
   ======================================================================== */

/* ==================================================================== DECK
   One set at a time behind a rail that stays on screen. The old screen put all
   seventeen sets and 158 cards in a single column - sixteen thousand pixels of
   identical grey backs, which is a filing cabinet with the drawer taken out. */
var DECKSET = null, DECKFILTER = 0;   /* 0 all, 1 sealed, 2 held, 3 to live, 4 lived */

function viewDeck(){
  var fd = fullDays(), w = packsWaiting(), h = "";

  /* He asked, reasonably, what the cards actually do. The answer belongs on
     the screen, once, dismissible - not in a chat thread. */
  if (!S.cardsWhy){
    h += "<div class='panel whycards'><h3>What cards are</h3>"
      + "<p>Your Singapore year, as a deck \u2014 real dishes, places, phrases and milestones. "
      + "Full days earn packs, duplicates melt into spares, spares force a sealed card open, "
      + "and finishing a set pays the pot.</p>"
      + "<p><strong>Every card you hold is something to go and do.</strong> Tap one and it tells "
      + "you what. Do it, tap <em>Did it</em>, and the card is lived: foil, dated, and paid. "
      + "Nothing checks, which is exactly why it counts.</p>"
      + "<p>A card you have not found is a <strong>sealed back</strong> with its rarity on it. "
      + "You can see there is a rare missing from a set; you cannot see which one it is until "
      + "you turn it over. That is the whole game.</p>"
      + "<p>Two exceptions: the <strong>Mandarin</strong> set is real vocabulary \u2014 the "
      + "character, its tone drawn underneath, your own mnemonic on the back. And "
      + "<strong>Trophies</strong> are never in packs: you claim one yourself when the real "
      + "thing happens.</p>"
      + "<div class='btns tight'><button class='btn pri' data-cardswhy='1'>Got it</button></div></div>";
  }

  /* The deck is finished, so deal another one. This is the only place in the
     app where completing something starts it again rather than ending it. */
  if (deckComplete()){
    h += "<div class='panel newseason'>"
      + "<div class='sn'>Season " + season() + " complete</div>"
      + "<h3>All " + num(CARDS.filter(function(c){ return c[1] !== 3; }).length)
      + " of them, every set open.</h3>"
      + "<p>Deal a new deck and go again. Your trophies stay on the table, your rank, your "
      + "pot and your spares do not move, and every card you have collected is already in the "
      + "vault. The only thing that changes is that there is something to find again.</p>"
      + "<div class='btns'><button class='btn pri' data-newseason='1'>Deal Season "
      + (season() + 1) + "</button></div></div>";
  }

  if (season() > 1 || Object.keys(S.vault || {}).length){
    h += "<div class='seasonbar'><b>Season " + season() + "</b>"
      + "<span>" + num(Object.keys(S.vault || {}).length) + " in the vault &middot; "
      + num(setsCompleteEver()) + " sets completed all time</span></div>";
  }

  /* What is in his hand comes first: it is the part of the deck that is
     about today rather than about the collection. */
  h += handHTML();

  /* Packs first when there are packs, because that is what he came for. The
     hero only takes the top of the screen on a day with nothing to open. */
  if (!(w.streak || w.day)){
    var heldN = heldCount(), sealed = CARDS.length - heldN;
    h += hero({
      tone: "gold", icon: "cards", kicker: "Season " + season(),
      big: num(heldN), unit: "/ " + num(CARDS.length),
      line: sealed ? num(sealed) + (sealed === 1 ? " card still sealed" : " cards still sealed")
                   : "Every card in the deck, found.",
      pct: Math.round(100 * heldN / CARDS.length),
      foot2: heldN ? num(livedCount()) + " lived \u00b7 " + num(heldN - livedCount())
                     + " held and still to go and do" : null,
      foot: fd ? "Close all three pillars today and a pack lands tonight."
               : "A full day \u2014 all three pillars \u2014 earns the first pack."
    });
  }

  if (w.streak || w.day){
    h += "<div style='display:flex;gap:11px;justify-content:center;margin:8px 0 4px'>";
    if (w.streak) h += "<button class='pk big' data-pack='streak' style='flex:1 1 0;max-width:150px;margin:0'>"
      + "<span class='pk-sheen'></span><span class='pk-strip'></span>"
      + (w.streak > 1 ? "<span class='pk-n'>" + w.streak + "</span>" : "")
      + "<span class='pk-body'><span class='pk-ttl'>Streak Pack</span>"
      + "<span class='pk-sub'>Five cards &middot; better odds</span></span></button>";
    if (w.day) h += "<button class='pk' data-pack='day' style='flex:1 1 0;max-width:150px;margin:0'>"
      + "<span class='pk-sheen'></span><span class='pk-strip'></span>"
      + (w.day > 1 ? "<span class='pk-n'>" + w.day + "</span>" : "")
      + "<span class='pk-body'><span class='pk-ttl'>Day Pack</span>"
      + "<span class='pk-sub'>Three cards</span></span></button>";
    h += "</div>";
  }

  /* pick the set to show: last chosen, else the one nearest finishing */
  var open = SETS.filter(function(s){ return setOpen(s[0]); });
  if (!DECKSET || !open.filter(function(s){ return s[0] === DECKSET; }).length){
    var near = nearestSet();
    DECKSET = near ? near.set[0] : open[0][0];
  }

  /* the rail */
  h += "<div class='rail'>";
  SETS.forEach(function(s){
    var cs = setCards(s[0]), have = setHeld(s[0]), openS = setOpen(s[0]);
    h += "<button data-set='" + s[0] + "'" + (s[0] === DECKSET ? " aria-current='true'" : "")
      + (openS ? "" : " class='lock'") + ">"
      + (openS ? ring(have, cs.length) : "<span style='width:26px;display:flex;justify-content:center'>"
          + svg("lock", 18) + "</span>")
      + "<span>" + esc(s[1]) + "</span></button>";
  });
  h += "</div>";

  var st = SETS.filter(function(s){ return s[0] === DECKSET; })[0];
  var cs = setCards(DECKSET), have = setHeld(DECKSET), done = have === cs.length;

  h += "<div class='sethead'><div class='big'>" + have + "<small>of " + cs.length + "</small></div>"
    + "<div class='bd'><h3>" + esc(st[1]) + (done ? " &middot; complete" : "") + "</h3>"
    + "<p>" + esc(st[2]) + "</p></div></div>";

  if (DECKSET === "gold"){
    var unclaimed = cs.filter(function(c){ return !(S.cards || {})[c[0]]; });
    if (unclaimed.length){
      h += "<div class='panel ember'><h3>Claim one</h3>"
        + "<p class='dim' style='margin:6px 0 0'>Only when it has actually happened. These are not in "
        + "packs and they cannot be made.</p><div class='btns tight'>";
      unclaimed.forEach(function(c){
        h += "<button class='btn' data-claim='" + esc(c[0]) + "'>" + esc(c[0]) + "</button>";
      });
      h += "</div></div>";
    }
  } else {
    /* The two questions a collector has - what am I missing, what do I hold -
       and the two a person with a life has: what is there to do, what have I
       done. The deck is a to-do list for the year, and the filters say so. */
    var livedN = cs.filter(function(c){ return (S.cards || {})[c[0]] && (S.lived || {})[c[0]]; }).length;
    var todoN = have - livedN;
    function fb(i, label){
      return "<button data-df='" + i + "'" + (DECKFILTER === i ? " aria-pressed='true'" : "") + ">"
        + label + "</button>";
    }
    h += "<div class='filters'>"
      + fb(0, "All " + cs.length) + fb(1, "Sealed " + (cs.length - have)) + fb(2, "Held " + have)
      + fb(3, "To do " + todoN) + fb(4, "Lived " + livedN)
      + "</div>";
  }

  var show = cs.filter(function(c){
    var n = (S.cards || {})[c[0]], lv = !!(S.lived || {})[c[0]];
    if (DECKFILTER === 1) return !n;
    if (DECKFILTER === 2) return !!n;
    if (DECKFILTER === 3) return !!n && !lv;
    if (DECKFILTER === 4) return !!n && lv;
    return true;
  });
  if (show.length){
    h += "<div class='binder'>";
    show.forEach(function(c){
      var n = (S.cards || {})[c[0]];
      /* A sealed slot is addressed by set and rarity, never by name - the name
         would otherwise sit in the markup of a card he is not meant to know. */
      h += tcard(c, n, { attr: (!n && c[1] !== 3)
        ? " data-sealed=\"" + esc(c[2]) + "|" + c[1] + "\""
        : " data-card=\"" + esc(c[0]) + "\"" });
    });
    h += "</div>";
  } else {
    h += "<div class='empty'>" + (DECKFILTER === 1 ? "Nothing sealed here."
      : DECKFILTER === 3 ? (have ? "Every card you hold here, you have lived." : "Nothing held here yet.")
      : DECKFILTER === 4 ? "Nothing lived here yet. Tap a held card - it tells you what to do."
      : "Nothing held here yet.") + "</div>";
  }

  /* spares, under the set they would finish */
  var sp = spares();
  var missing = cs.filter(function(c){ return !(S.cards || {})[c[0]] && c[1] !== 3; });
  var affordable = missing.filter(function(c){ return craftCost(c) <= sp; });
  if (DECKSET !== "gold"){
    h += "<h2>Spares</h2><div class='panel'>";
    h += "<div style='display:flex;align-items:center;gap:13px'>"
      + "<span style='color:var(--jade);flex:none'>" + svg("spare", 30) + "</span>"
      + "<div style='flex:1'><div class='mono' style='font-size:26px;font-weight:800;letter-spacing:-.03em;color:var(--jade)'>"
      + num(sp) + "</div><div class='dim'>from " + num(sparesEarned()) + " earned</div></div></div>";
    h += "<p class='dim' style='margin:10px 0 0'>Every card you pull twice is worth spares: "
      + RARITY[0][4] + " for a common, " + RARITY[1][4] + " uncommon, " + RARITY[2][4] + " rare. "
      + "They force a sealed card open — " + RARITY[0][5] + ", " + RARITY[1][5] + " or "
      + RARITY[2][5] + " — and nothing else. You choose the set and the rarity; the deck "
      + "chooses the card. They are not money and they do not buy packs.</p>";
    if (missing.length){
      h += "<div class='btns'><button class='btn " + (affordable.length ? "go" : "quiet") + "'"
        + (affordable.length ? "" : " disabled") + " data-craft='" + DECKSET + "'>"
        + (affordable.length ? "Force one open" : "Not enough for anything in " + esc(st[1]))
        + "</button></div>";
    }
    h += "</div>";
  }

  /* the next door */
  var door = nextDoor();
  if (door){
    var dleft = door[3] - fd;
    h += "<div class='door'><span class='lk'>" + svg("lock", 18) + "</span>"
      + "<span class='bd'><b>" + esc(door[1]) + "</b><span>" + setCards(door[0]).length
      + " cards, sealed. They cannot turn up in a pack before then.</span></span>"
      + "<span class='at'>" + dleft + " full<br>" + (dleft === 1 ? "day" : "days") + "</span></div>";
  }
  /* the ladder lived on Today; progression belongs with the collection */
  if (fd >= 3) h += seasonHTML();
  return h;
}




/* ------------------------------------------------------------------ the hand
   Do cards until they are done, Inspire cards until they are kept or let go,
   and the last few he kept. The rest of the deck is a collection; this is
   the bit with a verb in it. */
function handHTML(){
  var hd = handDo(), hi = handIn(), h = "";
  if (hd.length || hi.length){
    h += "<div class='rulehead'><h3>In hand</h3><span></span><em>"
      + (hd.length + hi.length) + "</em></div><div class='hand'>";
    hd.forEach(function(a){
      h += "<div class='hc hd'>" + dcard(a, {})
        + "<div class='hcb'><b>" + esc(a[1]) + "</b><span>" + esc(a[2]) + "</span>"
        + "<div class='hca'><button class='btn pri' data-doit='" + a[0]
        + "'>Did it &middot; +10 spares, +20 XP</button></div></div></div>";
    });
    hi.forEach(function(i){
      h += "<div class='hc hi'>" + icard(i, {})
        + "<div class='hcb'><b>" + esc(i[2]) + "</b><span>" + esc(i[3]) + "</span>"
        + "<div class='hca'><button class='btn' data-keepin='" + i[0] + "'>Keep &middot; +5 XP</button>"
        + "<button class='btn quiet' data-letgo='" + i[0] + "'>Let it go</button></div></div></div>";
    });
    h += "</div>";
  }
  var kept = Object.keys(S.kept || {}).sort(function(a, b){ return S.kept[a] < S.kept[b] ? 1 : -1; });
  if (kept.length){
    h += "<div class='rulehead'><h3>Kept</h3><span></span><em>" + num(kept.length) + "</em></div>";
    h += "<div class='kept'>";
    kept.slice(0, 6).forEach(function(id){
      var i = inspireById(id); if (!i) return;
      h += "<div class='kp k-" + i[1] + "'><b>" + esc(i[2]) + "</b><span>" + esc(i[3]) + "</span></div>";
    });
    h += "</div>";
  }
  return h;
}
function doItUI(id, btn){
  if (!doIt(id)){ sfx("no"); return; }
  sfx("rare"); buzz([16, 40, 20]);
  if (btn) burst(btn, "#FFC800");
  toast("Done. +10 spares, +20 XP.", true);
  render({ keepScroll: true, animate: true });
}
function keepUI(id, btn){
  if (!keepIn(id)){ sfx("no"); return; }
  sfx("done"); buzz(12);
  if (btn) burst(btn, "#8FE3B4");
  render({ keepScroll: true, animate: true });
}
function letGoUI(id){
  if (!letGo(id)){ sfx("no"); return; }
  sfx("untick");
  render({ keepScroll: true });
}

/* The doors were always a progression track; they were just never drawn as
   one. Nothing new is being invented here - these are the same six gates. */
function seasonHTML(){
  var fd = fullDays(), locked = SETS.filter(function(s){ return s[3] > 0; })
    .sort(function(a,b){ return a[3] - b[3]; });
  if (!locked.length) return "";
  var next = locked.filter(function(s){ return fd < s[3]; })[0];
  var h = "<div class='season'><div class='top'><b>The long game</b>"
    + "<span class='mono'>" + heldCount() + " / " + CARDS.length + "</span></div>";
  h += "<p>" + (next
      ? esc((next[3] - fd) + " more full " + (next[3] - fd === 1 ? "day" : "days") + " opens "
            + next[1] + " — " + setCards(next[0]).length + " cards that cannot turn up before then.")
      : "Every set is open. What is left is the finding.") + "</p>";
  h += "<div class='nodes'>";
  locked.forEach(function(s){
    var open = fd >= s[3], isNext = next && next[0] === s[0];
    /* Two sets begin with "The", so the first word is not a label. */
    var w = s[1].split(" ");
    var lab = (w[0].toLowerCase() === "the" && w[1]) ? w[1] : w[0];
    h += "<div class='node" + (open ? " got" : isNext ? " next" : "") + "'>"
      + "<div class='d'>" + s[3] + "</div><div class='l'>" + esc(lab) + "</div></div>";
  });
  h += "</div></div>";
  return h;
}



/* ------------------------------------------------------------- the asks */
async function askClaimTrophy(name){
  var c = cardByName(name);
  var ok = await ask({
    title: name,
    say: esc(c ? c[3] : "") + "<br><br>Only claim this if it has actually happened. Nothing checks, "
       + "which is exactly why it counts.",
    confirm: "It happened", cancel: "Not yet"
  });
  if (ok) claimTrophy(name);
}

/* The one thing spares buy. He used to pick the card off a list, which meant
   the list had to name every card he was missing - the spoiler he asked me to
   take out. Now he picks a rarity out of the set and the deck picks the card,
   and it arrives face-down on the stage like anything else. Same cost, same
   odds of getting the one he wanted; what changes is that he finds out by
   turning it over. */
async function askCraft(setKey){
  var sp = spares(), st = SETS.filter(function(s){ return s[0] === setKey; })[0];
  var missing = setCards(setKey).filter(function(c){
    return !(S.cards || {})[c[0]] && c[1] !== 3;
  });
  if (!missing.length){ toast("Nothing missing in this one."); return; }
  var byR = {};
  missing.forEach(function(c){ byR[c[1]] = (byR[c[1]] || 0) + 1; });
  var v = await ask({
    title: "Force one open",
    say: "You have <strong>" + num(sp) + " spares</strong>. They came from cards you pulled twice, and "
       + "this is the only thing they do. Pick what you want out of <b>" + esc(st ? st[1] : setKey)
       + "</b> &mdash; which card it turns out to be is not yours to choose.",
    options: Object.keys(byR).sort().map(function(r){
      var cost = RARITY[r][5], n = byR[r], can = cost <= sp;
      return { id: String(r), label: RARITY[r][0] + "  ·  " + cost, pri: can,
               note: can ? n + " sealed in this set"
                         : n + " sealed &middot; " + (cost - sp) + " short" };
    }),
    cancel: "Close"
  });
  if (!v) return;
  doCraftR(setKey, v);
}

/* Shared by the set screen and by tapping a sealed card on the binder. */
function doCraftR(setKey, r){
  if (!canCraftR(setKey, r)){ sfx("no"); toast("Not enough spares for that one."); return; }
  var got = craftRandom(setKey, r);
  if (!got){ sfx("no"); toast("Nothing sealed at that rarity."); return; }
  sfx("craft"); buzz([16, 40, 16]);
  revealOne(got);
}

/* Rolling the deck is irreversible, so it is asked for rather than tapped. */
function askNewSeason(){
  var n = season() + 1;
  ask({
    title: "Deal Season " + n + "?",
    say: "Every card you hold goes into the vault and the deck starts again. "
       + "<b>Nothing is lost</b> &mdash; trophies stay, rank and pot and spares do not move, "
       + "and a card collected twice is worth more than a card collected once.",
    confirm: "Deal them", cancel: "Not yet"
  }).then(function(v){
    /* A confirm with no field resolves to true, not to "__ok" - the house
       convention elsewhere is a plain falsy check. */
    if (!v) return;
    var before = { xp: xp(), pot: pot(), spares: spares(), rank: rank().level };
    if (!rollSeason()) return;
    celebrate("Season " + n, "A new deck. Same life, more of it.");
    render({ keepScroll: false, animate: true });
    /* If any of these moved, the rollover ate something it should not have. */
    if (xp() < before.xp || pot() < before.pot || spares() < before.spares){
      toast("Something went backwards - tell Claude.");
    }
  });
}

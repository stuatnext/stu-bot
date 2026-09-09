"use strict";

/* ========================================================================
   art.js - every card face, drawn from the card's own name.

   Inline SVG generated from a hash of the name: no image files, the same
   face every time, and a whole deck that costs nothing to ship. The
   Mandarin set is the exception with a purpose - the character fills the
   window, the pinyin is the name, and the line under the character is its
   tone, because the study log says tones are what he drops.
   ======================================================================== */

/* =================================================================== the card
   Art, sound, and a pack opening that takes over the screen. Everything here
   exists because a card you cannot turn over is a paragraph with a border. */

function hashOf(s){
  var h = 2166136261;
  for (var i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

/* Behind every emblem sits one of eight backdrops, picked by the card's name.
   Without this a set of eleven hawker cards is eleven identical bowls, and a
   collection where everything looks the same is not worth collecting.
   Shifts are unsigned: hashOf returns a full uint32, and a signed >> on
   anything with the top bit set goes negative, which once quietly put half the
   deck's artwork off-card at 0.65 scale and 18 degrees off true. */
function backdrop(h){
  var kind = h % 8, o = "<g opacity='.17' stroke='currentColor' fill='none' stroke-width='1.4'>", i, j;
  if (kind === 0){
    for (i = 1; i <= 6; i++) o += "<circle cx='50' cy='50' r='" + (i * 9 + (h % 5)) + "'/>";
  } else if (kind === 1){
    for (i = -4; i < 12; i++) o += "<path d='M" + (i * 13) + " 0 L" + (i * 13 + 60) + " 100'/>";
  } else if (kind === 2){
    for (i = 0; i < 8; i++) for (j = 0; j < 8; j++)
      o += "<circle cx='" + (7 + i * 12.5) + "' cy='" + (7 + j * 12.5) + "' r='1.7' fill='currentColor' stroke='none'/>";
  } else if (kind === 3){
    for (i = 0; i < 26; i++)
      o += "<circle cx='" + ((h >>> (i % 12)) % 100) + "' cy='" + ((h >>> ((i + 5) % 13)) % 100)
         + "' r='" + (1 + (i % 4)) + "' fill='currentColor' stroke='none'/>";
  } else if (kind === 4){
    for (i = 0; i < 8; i++) o += "<path d='M0 " + (i * 15 - 6) + " L50 " + (i * 15 + 6) + " L100 " + (i * 15 - 6) + "'/>";
  } else if (kind === 5){
    for (i = -3; i < 10; i++){
      o += "<path d='M" + (i * 14) + " 0 L" + (i * 14 + 100) + " 100'/>";
      o += "<path d='M" + (i * 14) + " 100 L" + (i * 14 + 100) + " 0'/>";
    }
  } else if (kind === 6){
    for (i = 0; i < 16; i++){
      var a = i * 22.5 * Math.PI / 180;
      o += "<path d='M50 50 L" + (50 + Math.cos(a) * 78).toFixed(1) + " "
         + (50 + Math.sin(a) * 78).toFixed(1) + "'/>";
    }
  } else {
    for (i = 0; i < 7; i++)
      o += "<path d='M-10 " + (100 - i * 15) + " q60 -" + (26 + i * 3) + " 120 0'/>";
  }
  return o + "</g>";
}

/* ------------------------------------------------------------ tone contours
   His recorded weak spots are tone pairs - 2 against 3, 3 against 4, 4 against
   2 - and the note in his study log says he drops the rising lilt on the 2nd
   and flattens the dip on the 3rd. So the Mandarin card draws the shape of the
   tone under the character. It is the only decoration in the deck that is also
   the lesson. */
var TONE_MARKS = {
  "ā":1,"ē":1,"ī":1,"ō":1,"ū":1,"ǖ":1,
  "á":2,"é":2,"í":2,"ó":2,"ú":2,"ǘ":2,
  "ǎ":3,"ě":3,"ǐ":3,"ǒ":3,"ǔ":3,"ǚ":3,
  "à":4,"è":4,"ì":4,"ò":4,"ù":4,"ǜ":4
};
function tonesOf(pinyin){
  var out = [], i;
  for (i = 0; i < pinyin.length; i++){
    var t = TONE_MARKS[pinyin[i]];
    if (t) out.push(t);
  }
  return out;
}
/* One glyph per syllable, laid out across the foot of the art window. */
function toneArt(pinyin, hanzi){
  var tones = tonesOf(pinyin);
  var n = Math.max(tones.length, 1);
  /* a syllable with no mark is the neutral tone, drawn as a dot */
  if (!tones.length) tones = [5];
  var slots = Math.max(tones.length, hanzi ? hanzi.length : 1);
  while (tones.length < slots) tones.push(5);
  var w = 100 / slots, o = "<g opacity='.5' stroke='currentColor' fill='none' stroke-width='2.6' "
        + "stroke-linecap='round' stroke-linejoin='round'>";
  tones.forEach(function(t, i){
    var x0 = i * w + w * 0.24, x1 = i * w + w * 0.76, mid = (x0 + x1) / 2;
    var hi = 79, lo = 92;
    if (t === 1) o += "<path d='M" + x0 + " " + hi + " L" + x1 + " " + hi + "'/>";
    else if (t === 2) o += "<path d='M" + x0 + " " + lo + " L" + x1 + " " + hi + "'/>";
    else if (t === 3) o += "<path d='M" + x0 + " " + (hi + 3) + " Q" + mid + " " + (lo + 4)
      + " " + x1 + " " + (hi - 1) + "'/>";
    else if (t === 4) o += "<path d='M" + x0 + " " + hi + " L" + x1 + " " + lo + "'/>";
    else o += "<circle cx='" + mid + "' cy='" + ((hi + lo) / 2) + "' r='2.2' fill='currentColor' stroke='none'/>";
  });
  return o + "</g>";
}

/* ------------------------------------------------------------- the backdrop
   Emoji were the right call for the subject of a card - drawn by
   professionals, read at a glance, no bytes shipped - but an emoji floating
   on a gradient is not a card, it is a sticker. So each set gets an engraved
   motif behind the subject, the way a banknote or a trading card carries a
   ground: struck in the card's own ink at low opacity, turned and shifted by
   a hash of the card's name so no two in a set sit the same way.

   Each returns paths in a 100x100 box. Nothing here is random - the same card
   draws the same ground for ever. */
var BACK = {
  /* steam off a bowl */
  hawk: function(){ return "<path d='M30 62c0-9 9-9 9-18s-8-9-8-17'/>"
    + "<path d='M50 66c0-10 10-10 10-20s-9-10-9-19'/>"
    + "<path d='M70 62c0-9 9-9 9-18s-8-9-8-17'/>"
    + "<path d='M22 68h56a28 26 0 0 1-56 0Z'/><path d='M16 68h68'/>"; },
  /* a cup from above */
  kopi: function(){ return "<circle cx='50' cy='50' r='34'/><circle cx='50' cy='50' r='25'/>"
    + "<circle cx='50' cy='50' r='15'/><path d='M84 44c9 0 12 5 12 10s-4 10-12 10'/>"; },
  /* what a word looks like when it is said */
  slang: function(){ return "<path d='M22 30h56a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H44L28 82V70h-6a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8Z'/>"
    + "<path d='M32 46h22M32 56h34'/>"; },
  /* the island, as blocks */
  every: function(){ return "<path d='M8 84V56h14v28M26 84V40h16v44M46 84V62h12v22M62 84V34h18v50M84 84V52h10v32'/>"
    + "<path d='M4 84h94'/>"; },
  /* five-foot way: arched shophouse windows */
  herit: function(){ return "<path d='M16 78V44a10 10 0 0 1 20 0v34ZM40 78V38a10 10 0 0 1 20 0v40ZM64 78V44a10 10 0 0 1 20 0v34Z'/>"
    + "<path d='M10 78h80M26 44v34M50 38v40M74 44v34'/>"; },
  /* a frond */
  green: function(){
    var o = "<path d='M52 94C52 62 48 34 36 8'/>";
    for (var i = 0; i < 6; i++){
      var y = 78 - i * 12, x = 50 - i * 2.6, len = 26 - i * 2;
      o += "<path d='M" + x + " " + y + "q" + len + " -3 " + (len + 4) + " -17'/>"
         + "<path d='M" + x + " " + y + "q-" + len + " -5 -" + (len + 2) + " -18'/>";
    }
    return o; },
  /* water */
  isles: function(){ return "<path d='M4 40q12-8 24 0t24 0 24 0 24 0'/>"
    + "<path d='M4 56q12-8 24 0t24 0 24 0 24 0'/><path d='M4 72q12-8 24 0t24 0 24 0 24 0'/>"; },
  /* a flight path */
  region: function(){ return "<path d='M10 78q40-62 82-42' stroke-dasharray='5 7'/>"
    + "<path d='M78 28l14 8-14 9Z'/><circle cx='12' cy='76' r='4'/>"; },
  /* the road out, with two stops on it */
  road: function(){ return "<path d='M18 90c0-24 22-20 22-40S16 34 22 16'/>"
    + "<path d='M60 90c14-18 4-30 14-42s18-10 20-24' stroke-dasharray='4 8'/>"
    + "<circle cx='40' cy='50' r='5'/><circle cx='74' cy='48' r='5'/>"; },
  /* a roof over a roof */
  home: function(){ return "<path d='M14 56 50 26l36 30'/><path d='M22 74 50 50l28 24'/>"
    + "<path d='M50 90V50'/>"; },
  /* the practice grid a character is learned in */
  zh: function(){ return "<rect x='16' y='12' width='68' height='68' rx='2'/>"
    + "<g stroke-dasharray='4 5'><path d='M50 12v68M16 46h68M16 12l68 68M84 12l-68 68'/></g>"; },
  /* beans */
  bean: function(){ return "<g><ellipse cx='34' cy='38' rx='14' ry='10' transform='rotate(-20 34 38)'/>"
    + "<path d='M22 42q12 6 24-8' transform='rotate(-20 34 38)'/></g>"
    + "<g><ellipse cx='64' cy='64' rx='14' ry='10' transform='rotate(15 64 64)'/>"
    + "<path d='M52 68q12 6 24-8' transform='rotate(15 64 64)'/></g>"; },
  /* looking closer */
  deep: function(){ return "<circle cx='44' cy='44' r='26'/><circle cx='44' cy='44' r='17'/>"
    + "<path d='M63 63 88 88'/>"; },
  /* the hills he came from */
  sheff: function(){ return "<path d='M2 74q22-26 40-6t26-18 30 4'/><path d='M2 88q26-22 44-4t22-16 30 6'/>"
    + "<path d='M2 60q18-20 34-4'/>"; },
  /* columns of print */
  post: function(){ return "<path d='M14 16h72v68H14z'/><path d='M20 28h60M20 34h60'/>"
    + "<path d='M50 42v38'/>"
    + "<g opacity='.55'><path d='M20 50h24M20 58h24M20 66h24M56 50h24M56 58h24M56 66h24'/></g>"; },
  /* the ask, going up a step at a time */
  sug: function(){ return "<path d='M10 84h20V64h20V44h20V24h20'/><path d='M10 90h80'/>"; },
  /* the market */
  mkt: function(){ return "<path d='M14 86V60M32 86V44M50 86V52M68 86V28M86 86V38'/>"
    + "<path d='M8 86h84'/><path d='M14 56 32 40l18 8 18-24 18 10' stroke-dasharray='4 5'/>"; },
  /* a sunburst, for the ones he claims himself */
  gold: function(){ var o = "<circle cx='50' cy='50' r='17'/>";
    for (var i = 0; i < 12; i++){ var a = i * Math.PI / 6;
      o += "<path d='M" + (50 + Math.cos(a) * 25).toFixed(1) + " " + (50 + Math.sin(a) * 25).toFixed(1)
         + "L" + (50 + Math.cos(a) * 42).toFixed(1) + " " + (50 + Math.sin(a) * 42).toFixed(1) + "'/>"; }
    return o; }
};
function backdrop(setKey, seed){
  var f = BACK[setKey];
  if (!f) return "";
  /* the same card is always turned and shifted the same way */
  var ang = (seed % 11) - 5, dx = ((seed >>> 4) % 9) - 4, dy = ((seed >>> 8) % 9) - 4;
  var sc = 0.94 + ((seed >>> 12) % 13) / 100;
  return "<g class='tc-back' transform='translate(" + dx + " " + dy + ") rotate(" + ang
    + " 50 50) translate(" + (50 - 50 * sc).toFixed(2) + " " + (50 - 50 * sc).toFixed(2)
    + ") scale(" + sc.toFixed(2) + ")'>" + f() + "</g>";
}

/* Memoised: this used to regenerate 5,144 SVG nodes on every single render. */
var ART_CACHE = {};
/* The face: the set's engraved ground, and on it the subject. Mandarin keeps
   the character as the subject, with its tone drawn underneath, because there
   the face is also the lesson. */
function cardArt(c){
  if (ART_CACHE[c[0]]) return ART_CACHE[c[0]];
  var seed = hashOf(c[0] + "~b");
  var inner = backdrop(c[2], seed);
  var o;
  if (c[2] === "zh"){
    o = "<svg viewBox='0 0 100 100' fill='none' aria-hidden='true'>" + inner
      + toneArt(c[0], c[4]) + "</svg>";
  } else {
    o = "<svg viewBox='0 0 100 100' fill='none' aria-hidden='true'>" + inner + "</svg>"
      + "<span class='tc-glyph'>" + (CARD_ART[c[0]] || SET_ART[c[2]] || "⭐") + "</span>";
  }
  return (ART_CACHE[c[0]] = o);
}

/* The frame is the rarity and the art window is the card. Without this the
   eleven hawker cards were eleven grey bowls with slightly different
   backdrops, which is not a collection - it is a spreadsheet with rounded
   corners. Hue comes off the card's own name, so it never moves. */
/* A hue per set, chosen rather than hashed: eleven hawker cards in eleven
   unrelated colours is a rainbow, and a binder page should read as one family.
   Each is picked for its subject - chilli for the stalls, kopi brown for the
   kopitiam, park green for the parks, ink for the characters, temple red for
   the heritage - and no two sit within twelve degrees of each other. */
var SET_HUE = {
  hawk: 8, home: 22, kopi: 34, bean: 46, gold: 58, sug: 104, green: 130,
  mkt: 152, isles: 176, every: 198, zh: 216, post: 228, road: 244,
  region: 264, sheff: 282, deep: 300, slang: 322, herit: 346
};
function artTint(c){
  var h = hashOf(c[0] + "~t");
  var base = SET_HUE[c[2]];
  if (base === undefined) base = hashOf(c[2] + "~set") % 360;
  /* the card moves a few degrees inside its set, never out of it */
  var hue = (base + (h % 15) - 7 + 360) % 360;
  var sat = 26 + (h >>> 9) % 22;
  return "--artA:hsl(" + hue + "," + sat + "%,93%);"
       + "--artB:hsl(" + ((hue + 18) % 360) + "," + (sat + 10) + "%,79%);"
       + "--cink:hsl(" + hue + "," + Math.min(64, sat + 26) + "%,25%)";
}

/* A card. Face up or face down, small in the binder or large on the stage.

   No spoilers: a card he has not found yet is a back, not a muted face. He
   asked for that directly - knowing the whole deck in advance is knowing the
   ending. What the back does carry is the rarity, so a set can read as "there
   is a rare in here I am missing" without saying which. Trophies are the one
   exception, because they are goals he claims himself: you cannot claim a
   thing you are not allowed to see. */
function tcard(c, count, opts){
  opts = opts || {};
  var r = c[1];
  var hid = !count && r !== 3 && !opts.reveal;
  /* A lived card is one he went and did. It wears the foil whatever its
     rarity, and a stamp with the date - the card changing is the reward. */
  var lived = count ? (S.lived || {})[c[0]] : null;
  var cls = "tc r" + r + (opts.down || hid ? " down" : "")
          + (count || hid ? "" : " miss") + (hid ? " hid" : "")
          + (lived ? " lived" : "")
          + (opts.lg ? " lg" : "") + (opts.extra || "");
  if (hid) return sealedCard(r, opts.lg, opts.attr);
  var h = "<div class='" + cls + "'" + (opts.attr || "") + ">";
  h += "<div class='tc-i'>";
  h += "<div class='tc-f'><div class='tc-pane'>";
  h += "<div class='tc-nm'>" + esc(c[0]) + "</div>";
  h += "<div class='tc-art' style='" + artTint(c) + "'>" + cardArt(c);
  if (c[2] === "zh" && c[4]) h += "<div class='tc-han zh'>" + esc(c[4]) + "</div>";
  /* The texture layer: matte on a common, a specular band on an uncommon,
     refraction on a rare, foil on gold. It reads --px/--py/--ang from tilt(),
     so it moves under the thumb. The old holo overlay is kept for lived
     cards only; on a rare it was a second rainbow on top of the first. */
  if (count) h += "<div class='tc-fx'></div>";
  if (lived) h += "<div class='tc-holo'></div>";
  if (count > 1) h += "<span class='tc-cnt'>x" + count + "</span>";
  if (count && (S.seen || {})[c[0]] === 0) h += "<span class='tc-new'></span>";
  if (lived) h += "<span class='tc-stamp'><b>Done</b><i>" + esc(nice(lived)) + "</i></span>";
  h += "<div class='tc-gem'></div></div>";
  h += "<div class='tc-nt'>" + esc(c[3]) + "</div>";
  h += "<div class='tc-glare'></div>";
  h += "</div></div>";
  h += "<div class='tc-b'>" + BACKMARK + "</div>";
  h += "</div></div>";
  return h;
}
/* The two faces that are not collected. Same bones as a collectible - an
   inner that turns, a face, a back - so the stage does not know the
   difference. A Do card is a verb in large type; an Inspire card is a line
   set like a page, with a mark for what kind of door it is. */
function sizeWord(n){ return n === 1 ? "today" : n === 2 ? "this week" : "a plan"; }
function dcard(a, opts){
  opts = opts || {};
  var cls = "tc kd s" + a[3] + (opts.down ? " down" : "") + (opts.lg ? " lg" : "") + (opts.extra || "");
  return "<div class='" + cls + "'" + (opts.attr || "") + "><div class='tc-i'>"
    + "<div class='tc-f'><div class='tc-pane'>"
    + "<div class='tc-kind'>Do <i>" + esc(sizeWord(a[3])) + "</i></div>"
    + "<div class='tc-verb'>" + esc(a[1]) + "</div>"
    + "<div class='tc-det'>" + esc(a[2]) + "</div>"
    + "<div class='tc-mk'>" + svg("tick", 22) + "</div>"
    + "<div class='tc-fx'></div><div class='tc-glare'></div></div></div>"
    + "<div class='tc-b'>" + BACKMARK + "<span class='tc-pip'>Do</span></div>"
    + "</div></div>";
}
function icard(i, opts){
  opts = opts || {};
  var cls = "tc ki k-" + i[1] + (opts.down ? " down" : "") + (opts.lg ? " lg" : "") + (opts.extra || "");
  var mark = i[1] === "place" ? svg("pin", 22) : "\u201C";
  return "<div class='" + cls + "'" + (opts.attr || "") + "><div class='tc-i'>"
    + "<div class='tc-f'><div class='tc-pane'>"
    + "<div class='tc-kind'>" + (i[1] === "place" ? "A place" : i[1] === "idea" ? "An idea" : "A line") + "</div>"
    + "<div class='tc-mark'>" + mark + "</div>"
    + "<div class='tc-ttl'>" + esc(i[2]) + "</div>"
    + "<div class='tc-body'>" + esc(i[3]) + "</div>"
    + "<div class='tc-fx'></div><div class='tc-glare'></div></div></div>"
    + "<div class='tc-b'>" + BACKMARK + "<span class='tc-pip'>Inspire</span></div>"
    + "</div></div>";
}
/* One entry of a pack: a collectible by name, or {k:"do"|"in", id}. */
function entryFace(e, opts){
  if (typeof e === "string"){ var c = cardByName(e); return c ? tcard(c, (S.cards || {})[e], opts) : ""; }
  if (e && e.k === "do"){ var a = actionById(e.id); return a ? dcard(a, opts) : ""; }
  if (e && e.k === "in"){ var i = inspireById(e.id); return i ? icard(i, opts) : ""; }
  return "";
}

/* A sealed slot. It never learns which card it is - the name is not in the
   markup at all, so there is nothing to find by poking at the page either. All
   it knows is the set it belongs to and the rarity, which is all the screen
   needs to say and all he asked to be told. */
function sealedCard(r, lg, attr){
  return "<div class='tc r" + r + " down hid" + (lg ? " lg" : "") + "'"
       + (attr || "") + "><div class='tc-i'>"
       + "<div class='tc-f'></div>"
       + "<div class='tc-b'>" + BACKMARK
       + "<span class='tc-pip'>" + esc(RARITY[r][0]) + "</span></div>"
       + "</div></div>";
}

/* The back. One mark for the whole deck, so a face-down stack reads as a
   stack: the sun that runs through the app, not a letter. */
var BACKMARK = "<div class='tc-mark'><svg viewBox='0 0 100 100' fill='none' aria-hidden='true'>"
  + "<circle cx='50' cy='50' r='16' stroke='currentColor' stroke-width='4'/>"
  + "<path d='M50 14v10M50 76v10M14 50h10M76 50h10M24.5 24.5l7 7M68.5 68.5l7 7"
  + "M75.5 24.5l-7 7M31.5 68.5l-7 7' stroke='currentColor' stroke-width='4' stroke-linecap='round'/>"
  + "</svg></div>";

/* Touch the card and the foil moves. Rare cards should reward being looked at. */
function tilt(tc){
  if (reduced() || !tc) return;
  function at(ev){
    var t = (ev.touches && ev.touches[0]) || ev;
    var r = tc.getBoundingClientRect();
    var x = (t.clientX - r.left) / r.width - .5, y = (t.clientY - r.top) / r.height - .5;
    var inner = tc.querySelector(".tc-i");
    if (inner && !tc.classList.contains("down")){
      inner.style.transform = "rotateY(" + (x * 17).toFixed(1) + "deg) rotateX("
        + (-y * 17).toFixed(1) + "deg)";
    }
    tc.style.setProperty("--ang", ((x + .5) * 340).toFixed(0) + "deg");
    tc.style.setProperty("--px", (x + .5).toFixed(3));
    tc.style.setProperty("--py", (y + .5).toFixed(3));
  }
  function off(){
    var inner = tc.querySelector(".tc-i");
    if (inner && !tc.classList.contains("down")) inner.style.transform = "";
    tc.style.setProperty("--px", ".5"); tc.style.setProperty("--py", ".5");
  }
  tc.addEventListener("touchmove", function(e){ at(e); }, { passive: true });
  tc.addEventListener("touchend", off);
  tc.addEventListener("mousemove", at);
  tc.addEventListener("mouseleave", off);
}

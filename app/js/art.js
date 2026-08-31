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

/* Each set has its own emblem, varied per card by its name, so no two faces
   are identical and every card still reads as belonging somewhere.
   Memoised: this used to regenerate 5,144 SVG nodes on every single render. */
var ART_CACHE = {};
/* The face. "Plus they're ugly" ended the generated-squiggle era: every card
   now wears one big glyph from the platform's own emoji set - drawn by
   professionals, familiar at a glance, zero bytes shipped - over the tint
   hashed from its name. Mandarin keeps the character as the face, with its
   tone drawn underneath, because there the face is also the lesson. */
function cardArt(c){
  if (ART_CACHE[c[0]]) return ART_CACHE[c[0]];
  var o;
  if (c[2] === "zh"){
    o = toneArt(c[0], c[4]);
  } else {
    var g = CARD_ART[c[0]] || SET_ART[c[2]] || "\u2B50";
    o = "<span class='tc-glyph'>" + g + "</span>";
  }
  return (ART_CACHE[c[0]] = o);
}

/* The frame is the rarity and the art window is the card. Without this the
   eleven hawker cards were eleven grey bowls with slightly different
   backdrops, which is not a collection - it is a spreadsheet with rounded
   corners. Hue comes off the card's own name, so it never moves. */
function artTint(c){
  var h = hashOf(c[0] + "~t"), hue = h % 360;
  /* skip the muddy band where everything turns into the same olive */
  if (hue > 62 && hue < 96) hue += 40;
  var sat = 26 + (h >>> 9) % 22;
  return "--artA:hsl(" + hue + "," + sat + "%,93%);"
       + "--artB:hsl(" + ((hue + 18) % 360) + "," + (sat + 10) + "%,79%);"
       + "--cink:hsl(" + hue + "," + Math.min(64, sat + 26) + "%,25%)";
}

/* A card. Face up or face down, small in the binder or large on the stage.
   A card he does not hold in a set he can see is shown as its own face, muted
   - never as a back. He has to be able to ask what a card is, and the one
   place that question gets asked is the one place it used to be refused. */
function tcard(c, count, opts){
  opts = opts || {};
  var r = c[1];
  var cls = "tc r" + r + (opts.down ? " down" : "") + (count ? "" : " miss")
          + (opts.lg ? " lg" : "") + (opts.extra || "");
  var h = "<div class='" + cls + "'" + (opts.attr || "") + ">";
  h += "<div class='tc-i'>";
  h += "<div class='tc-f'><div class='tc-pane'>";
  h += "<div class='tc-nm'>" + esc(c[0]) + "</div>";
  h += "<div class='tc-art' style='" + artTint(c) + "'>" + cardArt(c);
  if (c[2] === "zh" && c[4]) h += "<div class='tc-han zh'>" + esc(c[4]) + "</div>";
  if (r >= 2 && count) h += "<div class='tc-holo'></div>";
  if (count > 1) h += "<span class='tc-cnt'>x" + count + "</span>";
  if (count && (S.seen || {})[c[0]] === 0) h += "<span class='tc-new'></span>";
  if (count && (S.lived || {})[c[0]]) h += "<span class='tc-lived'>" + svg("tick", 10) + "</span>";
  h += "<div class='tc-gem'></div></div>";
  h += "<div class='tc-nt'>" + esc(c[3]) + "</div>";
  h += "<div class='tc-glare'></div>";
  h += "</div></div>";
  h += "<div class='tc-b'>" + BACKMARK + "</div>";
  h += "</div></div>";
  return h;
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
  }
  function off(){
    var inner = tc.querySelector(".tc-i");
    if (inner && !tc.classList.contains("down")) inner.style.transform = "";
  }
  tc.addEventListener("touchmove", function(e){ at(e); }, { passive: true });
  tc.addEventListener("touchend", off);
  tc.addEventListener("mousemove", at);
  tc.addEventListener("mouseleave", off);
}

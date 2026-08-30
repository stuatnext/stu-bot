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
function cardArt(c){
  if (ART_CACHE[c[0]]) return ART_CACHE[c[0]];
  var h = hashOf(c[0]), k = c[2];
  var a = h % 97, b = (h >>> 7) % 89, d = (h >>> 13) % 73;
  var o = "<svg viewBox='0 0 100 100' preserveAspectRatio='xMidYMid meet' aria-hidden='true'>";
  o += backdrop(h);

  /* Mandarin: the character is the picture, and the tone is drawn under it. */
  if (k === "zh"){
    o += toneArt(c[0], c[4]);
    o += "</svg>";
    return (ART_CACHE[c[0]] = o);
  }

  var tx = ((h >>> 3) % 11) - 5, ty = ((h >>> 9) % 11) - 5;
  var rot = ((h >>> 17) % 13) - 6, sc = (0.82 + ((h >>> 21) % 18) / 100).toFixed(2);
  o += "<g transform='translate(" + (50 + tx) + " " + (50 + ty) + ") rotate(" + rot
     + ") scale(" + sc + ") translate(-50 -50)'>";
  var S1 = "stroke='currentColor' fill='none' stroke-linecap='round' stroke-linejoin='round'";
  var i, x, y;

  if (k === "hawk"){
    o += "<path " + S1 + " stroke-width='2.4' opacity='.85' d='M16 58 Q50 " + (86 + a % 7) + " 84 58 Z'/>";
    o += "<path " + S1 + " stroke-width='1.8' opacity='.5' d='M16 58 h68'/>";
    for (i = 0; i < 3; i++){
      x = 34 + i * 16;
      o += "<path " + S1 + " stroke-width='1.9' opacity='" + (.5 - i * .08) + "' d='M" + x + " 44 q" +
        (6 - (a + i * 5) % 11) + " -8 0 -15 q" + ((b + i * 7) % 11 - 5) + " -7 0 -13'/>";
    }
  } else if (k === "kopi"){
    o += "<circle " + S1 + " stroke-width='2.4' opacity='.8' cx='50' cy='52' r='" + (25 + a % 5) + "'/>";
    o += "<circle " + S1 + " stroke-width='1.5' opacity='.5' cx='50' cy='52' r='" + (17 + b % 5) + "'/>";
    o += "<circle " + S1 + " stroke-width='1.1' opacity='.32' cx='" + (26 + a % 9) + "' cy='" +
      (24 + b % 9) + "' r='" + (8 + d % 6) + "'/>";
    o += "<path " + S1 + " stroke-width='2' opacity='.55' d='M75 44 q11 3 11 11 t-11 11'/>";
  } else if (k === "slang"){
    o += "<rect " + S1 + " stroke-width='2.3' opacity='.8' x='14' y='22' rx='9' width='" +
      (52 + a % 14) + "' height='30'/>";
    o += "<path " + S1 + " stroke-width='2.3' opacity='.8' d='M26 52 l-3 12 l13 -12'/>";
    o += "<rect " + S1 + " stroke-width='1.8' opacity='.42' x='" + (34 + b % 10) +
      "' y='62' rx='7' width='" + (38 + d % 12) + "' height='22'/>";
  } else if (k === "every"){
    for (i = 0; i < 20; i++){
      x = 20 + (i % 5) * 14; y = 24 + Math.floor(i / 5) * 14;
      var lit = ((h >>> i) & 1) === 1;
      o += "<rect x='" + x + "' y='" + y + "' width='9' height='10' rx='1.5' " +
        (lit ? "fill='currentColor' opacity='.42'" : "fill='none' stroke='currentColor' stroke-width='1.3' opacity='.4'") + "/>";
    }
  } else if (k === "herit"){
    for (i = 0; i < 3; i++){
      x = 20 + i * 22;
      o += "<path " + S1 + " stroke-width='2.1' opacity='.75' d='M" + x + " 74 v-22 a10 10 0 0 1 20 0 v22'/>";
    }
    o += "<path " + S1 + " stroke-width='2.4' opacity='.85' d='M12 74 h76'/>";
    o += "<path " + S1 + " stroke-width='2' opacity='.55' d='M14 34 l36 -" + (14 + a % 8) + " l36 " + (14 + a % 8) + "'/>";
  } else if (k === "green"){
    for (i = 0; i < 5; i++){
      x = 22 + ((h >>> (i * 3)) % 56); y = 30 + ((h >>> (i * 5)) % 42);
      o += "<path " + S1 + " stroke-width='1.9' opacity='" + (.34 + (i % 3) * .14) +
        "' d='M" + x + " " + y + " q" + (9 + i) + " -" + (13 + i * 2) + " " + (18 + i * 2) + " 0 q-" +
        (9 + i) + " " + (13 + i * 2) + " -" + (18 + i * 2) + " 0 Z'/>";
    }
  } else if (k === "isles"){
    o += "<path " + S1 + " stroke-width='2.2' opacity='.7' d='M22 44 q10 -12 22 -4 q11 7 26 1 q8 -3 10 5 l-2 16 h-56 Z'/>";
    for (i = 0; i < 4; i++){
      y = 68 + i * 8;
      o += "<path " + S1 + " stroke-width='1.7' opacity='" + (.5 - i * .09) + "' d='M8 " + y + " q11 -5 22 0 t22 0 t22 0 t22 0'/>";
    }
  } else if (k === "region"){
    o += "<path " + S1 + " stroke-width='1.9' opacity='.55' stroke-dasharray='4 5' d='M16 74 Q50 " +
      (14 + a % 14) + " 84 44'/>";
    o += "<circle cx='16' cy='74' r='4' fill='currentColor' opacity='.7'/>";
    o += "<path d='M84 44 l-11 5 l3 -6 l-3 -6 Z' fill='currentColor' opacity='.75'/>";
    o += "<circle " + S1 + " stroke-width='1.4' opacity='.3' cx='50' cy='52' r='" + (30 + b % 7) + "'/>";
  } else if (k === "road"){
    var px = 14, py = 78, path = "M14 78";
    for (i = 0; i < 4; i++){
      px = 14 + (i + 1) * 18; py = 78 - (i + 1) * 12 + ((h >>> (i * 4)) % 13) - 6;
      path += " L" + px + " " + py;
    }
    o += "<path " + S1 + " stroke-width='2.3' opacity='.7' d='" + path + "'/>";
    for (i = 0; i < 5; i++){
      o += "<circle cx='" + (14 + i * 18) + "' cy='" + (78 - i * 12 + (i ? ((h >>> ((i - 1) * 4)) % 13) - 6 : 0)) +
        "' r='" + (i === 4 ? 4.5 : 3) + "' fill='currentColor' opacity='" + (i === 4 ? .8 : .45) + "'/>";
    }
  } else if (k === "home"){
    o += "<path " + S1 + " stroke-width='2.4' opacity='.8' d='M22 76 v-26 l28 -18 l28 18 v26'/>";
    o += "<rect " + S1 + " stroke-width='1.9' opacity='.5' x='42' y='58' width='16' height='18'/>";
    for (i = 0; i < 7; i++){
      x = 12 + i * 12 + (h >>> i) % 6;
      o += "<path " + S1 + " stroke-width='1.5' opacity='.3' d='M" + x + " " + (10 + (i * 5) % 14) +
        " l-3 " + (9 + i % 5) + "'/>";
    }
  } else if (k === "bean"){
    o += "<path " + S1 + " stroke-width='2.3' opacity='.8' d='M30 26 h40 l-9 22 h-22 Z'/>";
    o += "<path " + S1 + " stroke-width='1.6' opacity='.45' d='M50 48 v" + (10 + a % 7) + "'/>";
    o += "<path " + S1 + " stroke-width='2.3' opacity='.75' d='M32 66 h30 a4 4 0 0 1 0 -0 v10 " +
      "a8 8 0 0 1 -8 8 h-14 a8 8 0 0 1 -8 -8 Z'/>";
    o += "<path " + S1 + " stroke-width='1.9' opacity='.5' d='M62 68 q9 2 9 8 t-9 8'/>";
    o += "<ellipse " + S1 + " stroke-width='1.6' opacity='.4' cx='" + (22 + b % 10) + "' cy='" +
      (34 + d % 10) + "' rx='7' ry='4.5' transform='rotate(-28 " + (22 + b % 10) + " " + (34 + d % 10) + ")'/>";
  } else if (k === "deep"){
    o += "<path " + S1 + " stroke-width='2.2' opacity='.8' d='M38 30 h24 M50 30 v6'/>";
    o += "<ellipse " + S1 + " stroke-width='2.4' opacity='.8' cx='50' cy='54' rx='" +
      (17 + a % 5) + "' ry='18'/>";
    for (i = 0; i < 3; i++)
      o += "<path " + S1 + " stroke-width='1.3' opacity='.34' d='M" + (43 + i * 7) + " 37 v34'/>";
    o += "<path " + S1 + " stroke-width='2' opacity='.6' d='M50 72 v" + (8 + b % 8) + "'/>";
  } else if (k === "sheff"){
    o += "<path " + S1 + " stroke-width='2.3' opacity='.75' d='M6 70 q18 -" + (18 + a % 10) +
      " 34 -4 q16 -" + (14 + b % 9) + " 30 2 q12 5 24 -2'/>";
    o += "<path " + S1 + " stroke-width='1.8' opacity='.45' d='M6 82 q22 -12 42 -3 q18 8 46 -4'/>";
    o += "<path " + S1 + " stroke-width='2.1' opacity='.7' d='M" + (36 + d % 14) + " 62 v-12 h12 v12'/>";
    o += "<path " + S1 + " stroke-width='1.6' opacity='.4' d='M" + (40 + d % 14) + " 50 v-9'/>";
  } else if (k === "post"){
    o += "<path " + S1 + " stroke-width='2.3' opacity='.8' d='M28 20 h34 l12 12 v48 h-46 Z'/>";
    o += "<path " + S1 + " stroke-width='1.8' opacity='.5' d='M62 20 v12 h12'/>";
    for (i = 0; i < 5; i++)
      o += "<path " + S1 + " stroke-width='1.5' opacity='" + (.42 - i * .05) +
        "' d='M35 " + (44 + i * 8) + " h" + (20 + ((h >>> (i * 3)) % 22)) + "'/>";
  } else if (k === "sug"){
    for (i = 0; i < 4; i++){
      var bh = 12 + i * 13 + ((h >>> (i * 4)) % 9);
      o += "<rect " + S1 + " stroke-width='2' opacity='" + (.42 + i * .12) + "' x='" + (20 + i * 16) +
        "' y='" + (78 - bh) + "' width='11' height='" + bh + "'/>";
    }
    o += "<path " + S1 + " stroke-width='2.2' opacity='.75' d='M18 " + (52 + a % 8) + " L82 22'/>";
    o += "<path d='M82 22 l-12 1 l7 6 Z' fill='currentColor' opacity='.75'/>";
  } else if (k === "mkt"){
    o += "<path " + S1 + " stroke-width='1.5' opacity='.4' stroke-dasharray='5 5' d='M12 50 h76'/>";
    o += "<path " + S1 + " stroke-width='2.4' opacity='.8' d='M14 74 q18 2 26 -12 q9 -15 20 -4 q10 10 26 -30'/>";
    o += "<circle cx='" + (60 + a % 12) + "' cy='" + (30 + b % 14) + "' r='4.5' fill='currentColor' opacity='.75'/>";
    o += "<path " + S1 + " stroke-width='1.4' opacity='.32' d='M28 18 v64 M72 18 v64'/>";
  } else {
    for (i = 0; i < 8; i++){
      var ang = i * 45 + (a % 20);
      var rad = ang * Math.PI / 180;
      o += "<path " + S1 + " stroke-width='2' opacity='.6' d='M50 50 L" +
        (50 + Math.cos(rad) * 34).toFixed(1) + " " + (50 + Math.sin(rad) * 34).toFixed(1) + "'/>";
    }
    o += "<circle cx='50' cy='50' r='13' fill='currentColor' opacity='.55'/>";
    o += "<circle " + S1 + " stroke-width='2' opacity='.7' cx='50' cy='50' r='20'/>";
  }
  return (ART_CACHE[c[0]] = o + "</g></svg>");
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

"use strict";

/* ========================================================================
   audio.js - the game's voice, synthesised at runtime.

   No files to load, nothing to go missing offline. Nothing plays before the
   first tap, which is also the only way iOS allows it.
   ======================================================================== */

/* ==================================================================== sound
   Synthesised, so there are no files to load and nothing to go missing. It
   only ever starts on a tap, which is also the only way iOS allows it. */
var AC = null;
function actx(){
  if (S.mute) return null;
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
  } catch (e){ return null; }
  return AC;
}
function tone(f, t0, d, type, vol, to){
  var a = actx(); if (!a) return;
  var o = a.createOscillator(), g = a.createGain(), n = a.currentTime + t0;
  o.type = type || "sine";
  o.frequency.setValueAtTime(f, n);
  if (to) o.frequency.exponentialRampToValueAtTime(to, n + d);
  g.gain.setValueAtTime(0.0001, n);
  g.gain.exponentialRampToValueAtTime(vol || .16, n + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, n + d);
  o.connect(g); g.connect(a.destination);
  o.start(n); o.stop(n + d + .02);
}
function hiss(t0, d, vol, f0, f1){
  var a = actx(); if (!a) return;
  var len = Math.floor(a.sampleRate * d);
  var buf = a.createBuffer(1, len, a.sampleRate), ch = buf.getChannelData(0);
  for (var i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
  var src = a.createBufferSource(); src.buffer = buf;
  var flt = a.createBiquadFilter(); flt.type = "bandpass";
  var n = a.currentTime + t0;
  flt.frequency.setValueAtTime(f0 || 900, n);
  flt.frequency.exponentialRampToValueAtTime(f1 || 2600, n + d);
  var g = a.createGain(); g.gain.setValueAtTime(vol || .14, n);
  g.gain.exponentialRampToValueAtTime(0.0001, n + d);
  src.connect(flt); flt.connect(g); g.connect(a.destination);
  src.start(n); src.stop(n + d);
}
function sfx(name){
  if (S.mute) return;
  if (name === "tap")   { tone(620, 0, .05, "square", .06); }
  if (name === "nav")   { tone(430, 0, .05, "sine", .07); tone(660, .03, .07, "sine", .05); }
  if (name === "tick")  { tone(880, 0, .07, "triangle", .1, 1180); }
  if (name === "untick"){ tone(420, 0, .09, "triangle", .07, 300); }
  if (name === "tear")  { hiss(0, .42, .2, 500, 3400); tone(150, .02, .3, "sawtooth", .07, 70); }
  if (name === "flip")  { hiss(0, .1, .09, 1600, 500); tone(340, 0, .1, "triangle", .1, 560); }
  if (name === "rare")  { [523, 659, 784].forEach(function(f, i){ tone(f, i * .07, .34, "triangle", .13); }); }
  if (name === "gold")  { [523, 659, 784, 1047].forEach(function(f, i){ tone(f, i * .075, .5, "triangle", .15); });
                          hiss(.1, .5, .07, 3000, 7000); }
  if (name === "level") { [392, 523, 659, 784, 1047].forEach(function(f, i){ tone(f, i * .085, .42, "sine", .14); }); }
  if (name === "done")  { tone(587, 0, .16, "sine", .11); tone(784, .09, .26, "sine", .11); }
  if (name === "full")  { [523, 659, 784, 1047, 1319].forEach(function(f, i){ tone(f, i * .09, .55, "triangle", .15); });
                          hiss(.14, .6, .06, 2400, 7200); tone(131, 0, .7, "sine", .1); }
  if (name === "craft") { [330, 494, 659].forEach(function(f, i){ tone(f, i * .06, .3, "sine", .12); });
                          hiss(0, .3, .06, 1800, 5200); }
  if (name === "money") { tone(880, 0, .1, "triangle", .1); tone(1174, .07, .18, "triangle", .09); }
  if (name === "no")    { tone(220, 0, .12, "square", .06, 165); }
}
function buzz(p){ try { if (navigator.vibrate) navigator.vibrate(p); } catch (e){} }

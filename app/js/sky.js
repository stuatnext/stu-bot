"use strict";

/* ========================================================================
   sky.js - the time of day, painted.

   Seven phases from deep night to golden hour, re-checked every minute; the
   browser chrome follows via theme-color. The arc across the top of the
   scene is this file too: one bezier from midnight to midnight, noon at the
   apex, Malta's shift as the bright band, the sun - the moon once it is
   down - riding it at now.
   ======================================================================== */

/* ====================================================================== the sky
   Which hour of his day the app is lit by. Derived from the clock on the
   device, so it is the sky where he is standing rather than where his work is. */
function skyPhase(){
  var h = new Date().getHours();
  if (h < 5)  return "deepnight";
  if (h < 7)  return "dawn";
  if (h < 11) return "morning";
  if (h < 16) return "day";
  if (h < 19) return "gold";
  if (h < 21) return "dusk";
  return "night";
}
function paintSky(){
  document.documentElement.setAttribute("data-sky", skyPhase());
  /* Safari and Android tint the browser chrome with this, so the frame around
     the app follows the same sky as the app. */
  var tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute("content",
    getComputedStyle(document.documentElement).getPropertyValue("--sky1").trim() || "#080B12");
}


/* ------------------------------------------------------------- the arc */
function arcPt(u){
  var x0 = 22, y0 = 150, cx = 195, cy = 4, x1 = 368, y1 = 150, v = 1 - u;
  return [v*v*x0 + 2*v*u*cx + u*u*x1, v*v*y0 + 2*v*u*cy + u*u*y1];
}
function arcSeg(a, b){
  var pts = [], n = Math.max(2, Math.round((b - a) * 90));
  for (var i = 0; i <= n; i++){
    var q = arcPt(a + (b - a) * i / n);
    pts.push(q[0].toFixed(1) + "," + q[1].toFixed(1));
  }
  return pts.join(" ");
}
function skyHTML(){
  var s = shape();
  var h = "<svg viewBox='0 0 390 166' aria-hidden='true'>";
  h += "<polyline class='arc' points='" + arcSeg(0, 1) + "'/>";
  if (!s.weekend && s.end > s.start){
    h += "<polyline class='band' points='"
      + arcSeg(s.start / 1440, Math.min(s.end, 1439) / 1440) + "'/>";
  }
  [360, 720, 1080].forEach(function(m){
    var q = arcPt(m / 1440);
    h += "<circle class='hr' cx='" + q[0].toFixed(1) + "' cy='" + q[1].toFixed(1) + "' r='2.1'/>";
  });
  var now = arcPt(s.now / 1440), ph = skyPhase();
  var night = ph === "night" || ph === "deepnight" || ph === "dusk";
  h += "<circle class='orb" + (night ? " moon" : "") + "' cx='" + now[0].toFixed(1)
    + "' cy='" + now[1].toFixed(1) + "' r='9'/>";
  if (!night){
    for (var k = 0; k < 8; k++){
      var ra = k * Math.PI / 4;
      h += "<line class='ray' x1='" + (now[0] + Math.cos(ra) * 12.5).toFixed(1)
        + "' y1='" + (now[1] + Math.sin(ra) * 12.5).toFixed(1)
        + "' x2='" + (now[0] + Math.cos(ra) * 16.5).toFixed(1)
        + "' y2='" + (now[1] + Math.sin(ra) * 16.5).toFixed(1) + "'/>";
    }
  } else {
    h += "<circle class='cut' cx='" + (now[0] + 5).toFixed(1) + "' cy='"
      + (now[1] - 3.5).toFixed(1) + "' r='8'/>";
  }
  h += "</svg><span class='dtime'>" + esc(dialLabel(s)) + "</span>";
  return h;
}
function dialLabel(s){
  if (s.weekend) return "No shift today";
  if (s.working) return "Malta until " + s.endT;
  if (s.now < s.start) return "Malta has " + s.startT + " \u2013 " + s.endT;
  return "Done at " + s.endT;
}

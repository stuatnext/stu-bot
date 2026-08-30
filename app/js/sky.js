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



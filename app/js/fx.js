"use strict";

/* ========================================================================
   fx.js - everything the player feels.

   The toast, the one in-app dialog (no browser prompt anywhere), the
   full-screen celebration, the coin that flies to the HUD, the counter that
   ticks rather than jumps, and the burst of colour a pillar makes when it
   lands. All of it stands down under prefers-reduced-motion.
   ======================================================================== */

/* ---------------------------------------------------------------- helpers */
function esc(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
                  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function reduced(){
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e){ return false; }
}
function ring(have, total, cls){
  var C = 2 * Math.PI * 15, k = total ? have / total : 0;
  return "<svg class='rg" + (k >= 1 ? " done" : "") + (cls ? " " + cls : "")
    + "' viewBox='0 0 34 34' aria-hidden='true'>"
    + "<circle class='bg' cx='17' cy='17' r='15'></circle>"
    + "<circle class='fg' cx='17' cy='17' r='15' stroke-dasharray='"
    + (C * k).toFixed(1) + " " + C.toFixed(1) + "'></circle></svg>";
}
var ICONS = {
  clock: "<circle cx='11' cy='11.4' r='7.6' stroke='currentColor' stroke-width='1.9'/><path d='M11 6.8v4.8l3.2 2' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/>",
  tick:  "<path d='M4 12l5 5L18 6' stroke='currentColor' stroke-width='2.8' stroke-linecap='round' stroke-linejoin='round'/>",
  run:   "<path d='M12.6 4.6a1.7 1.7 0 1 0 0-.1M9 19l2.4-4.2-2-2.1L8 16M11.4 12.7 14 10l2.6 2.2 2.4.5M6.2 9.4 9.6 8l2.6.9 1.4 2.3' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/>",
  phone: "<path d='M6.6 3.8h3l1.5 3.7-1.9 1.3a11 11 0 0 0 4.9 4.9l1.3-1.9 3.7 1.5v3a1.7 1.7 0 0 1-1.9 1.7C10.4 17.3 5.9 12.8 5 5.7a1.7 1.7 0 0 1 1.6-1.9Z' stroke='currentColor' stroke-width='1.9' stroke-linejoin='round'/>",
  stop:  "<rect x='5.5' y='5.5' width='11' height='11' rx='2.2' stroke='currentColor' stroke-width='2'/>",
  pack:  "<rect x='4' y='6' width='18' height='15' rx='2.5' stroke='currentColor' stroke-width='2'/><path d='M4 11h18' stroke='currentColor' stroke-width='2'/><path d='M13 6v15' stroke='currentColor' stroke-width='2' opacity='.4'/>",
  lock:  "<rect x='5' y='9.5' width='12' height='8.5' rx='2' stroke='currentColor' stroke-width='1.9'/><path d='M8 9.5V7.4a3 3 0 0 1 6 0v2.1' stroke='currentColor' stroke-width='1.9'/>",
  spare: "<path d='M11 2.4 19.6 7v10L11 21.6 2.4 17V7z' stroke='currentColor' stroke-width='1.8' stroke-linejoin='round'/><path d='M11 7.3 15.4 10v4.4L11 16.8 6.6 14.4V10z' fill='currentColor' opacity='.4'/>",
  arrow: "<path d='M7 4l6 6-6 6' stroke='currentColor' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/>",
  moon:  "<path d='M17.4 12.6A7 7 0 0 1 9.4 4.6a7.2 7.2 0 1 0 8 8Z' stroke='currentColor' stroke-width='1.9' stroke-linejoin='round'/>",
  snow:  "<path d='M11 2.6v16.8M3.7 6.8l14.6 8.4M18.3 6.8 3.7 15.2' stroke='currentColor' stroke-width='1.9' stroke-linecap='round'/><path d='M8.4 4.6 11 6.7l2.6-2.1M8.4 17.4 11 15.3l2.6 2.1' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' fill='none'/>",
  gap:   "<rect x='3.2' y='4.6' width='15.6' height='13.8' rx='2.4' stroke='currentColor' stroke-width='1.9'/><path d='M3.2 9h15.6M7.3 2.8v3.4M14.7 2.8v3.4' stroke='currentColor' stroke-width='1.9' stroke-linecap='round'/><rect x='8.6' y='11.4' width='4.8' height='4' rx='1' fill='currentColor' opacity='.55'/>",
  pin:   "<path d='M11 19.4s6-5.1 6-9.6a6 6 0 1 0-12 0c0 4.5 6 9.6 6 9.6Z' stroke='currentColor' stroke-width='1.9' stroke-linejoin='round'/><circle cx='11' cy='9.6' r='2.2' stroke='currentColor' stroke-width='1.7'/>",
  pen:   "<path d='M14.6 3.4 18.6 7.4 8 18H4v-4Z' stroke='currentColor' stroke-width='1.9' stroke-linejoin='round'/><path d='M12.6 5.4 16.6 9.4' stroke='currentColor' stroke-width='1.7'/>"
};
function svg(name, size){
  var s = size || 22;
  return "<svg width='" + s + "' height='" + s + "' viewBox='0 0 22 22' fill='none' aria-hidden='true'>"
       + (ICONS[name] || "") + "</svg>";
}

/* ==================================================================== toast
   Kept for confirmations and undos only. The day-complete celebration is not a
   snackbar any more; it takes the screen. */
function toast(msg, gold){
  var el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = "";
  void el.offsetWidth;
  el.className = gold ? "gold on" : "on";
}

/* ============================================================ the modal system
   Every window.prompt() and window.confirm() is gone. Those dialogs render in
   whatever the browser feels like and say "web page" louder than anything else
   on the screen.

     ask({ title, say, field:{label,value,placeholder,type,prefix}, options:[...],
           confirm:"Do it", cancel:"Back", danger:true })
       -> Promise resolving to the typed value, the chosen option's id,
          true for a bare confirm, or null if dismissed. */
var MODAL = null;
function ask(opts){
  return new Promise(function(resolve){
    var el = document.getElementById("modal");
    var h = "<div class='mw'><div class='grab'></div>";
    h += "<h3>" + esc(opts.title || "") + "</h3>";
    if (opts.say) h += "<p class='say'>" + opts.say + "</p>";
    if (opts.pre) h += "<div class='pre'>" + esc(opts.pre) + "</div>";
    if (opts.field){
      var f = opts.field;
      if (f.label) h += "<label for='mkField'>" + esc(f.label) + "</label>";
      h += "<input id='mkField' type='" + (f.type === "number" ? "text" : "text") + "'"
        + (f.type === "number" ? " inputmode='decimal'" : "")
        + " value='" + esc(f.value == null ? "" : f.value) + "'"
        + " placeholder='" + esc(f.placeholder || "") + "'"
        + " autocomplete='off' autocapitalize='sentences'>";
    }
    if (opts.options && opts.options.length){
      h += "<div class='opts'>";
      opts.options.forEach(function(o){
        h += "<button class='btn" + (o.pri ? " pri" : "") + "' data-mk='" + esc(o.id) + "'>"
          + esc(o.label) + (o.note ? "<span style='display:block;font-weight:500;font-size:12.5px;opacity:.72;margin-top:2px'>" + esc(o.note) + "</span>" : "")
          + "</button>";
      });
      h += "</div>";
    }
    h += "<div class='btns'>";
    if (opts.confirm) h += "<button class='btn " + (opts.danger ? "" : "pri") + "' data-mk='__ok'>"
      + esc(opts.confirm) + "</button>";
    h += "<button class='btn quiet' data-mk='__no'>" + esc(opts.cancel || "Close") + "</button>";
    h += "</div></div>";
    el.innerHTML = h;
    el.className = "on";
    document.body.style.overflow = "hidden";
    sfx("tap");
    var input = document.getElementById("mkField");
    if (input) setTimeout(function(){ try { input.focus(); input.select(); } catch(e){} }, 260);

    function close(v){
      if (!MODAL) return;
      MODAL = null;
      el.className = "";
      el.innerHTML = "";
      document.body.style.overflow = "";
      resolve(v);
    }
    MODAL = { close: close };
    el.onclick = function(ev){
      if (ev.target === el){ close(null); return; }
      var b = ev.target.closest ? ev.target.closest("[data-mk]") : null;
      if (!b) return;
      var id = b.dataset.mk;
      sfx("tap"); buzz(10);
      if (id === "__no") return close(null);
      if (id === "__ok") return close(input ? input.value.trim() : true);
      close(id);
    };
    if (input) input.onkeydown = function(ev){
      if (ev.key === "Enter"){ ev.preventDefault(); close(input.value.trim()); }
    };
  });
}
function tell(title, say){ return ask({ title: title, say: say, cancel: "Right" }); }

/* ================================================== the full-screen celebration
   The third pillar landing is the most important moment in the app. It used to
   be a re-render and a green snackbar. */
function celebrate(headline, sub){
  if (reduced()){ toast(headline, true); return; }
  var el = document.getElementById("fx");
  var cols = ["#F2B735","#FFE38A","#3FD9A0","#7C6BFF","#FF7A3D","#EEF3F8"];
  var h = "<div class='flash'></div><div class='ann'><b>" + esc(headline) + "</b>"
        + (sub ? "<span>" + esc(sub) + "</span>" : "") + "</div>";
  for (var i = 0; i < 46; i++){
    var d = (Math.random() * .5).toFixed(2), t = (1.5 + Math.random() * 1.1).toFixed(2);
    h += "<i class='conf' style='left:" + (Math.random() * 100).toFixed(1) + "%;"
      + "background:" + cols[i % cols.length] + ";"
      + "--spin:" + Math.round(360 + Math.random() * 900) + "deg;"
      + "animation-duration:" + t + "s;animation-delay:" + d + "s'></i>";
  }
  el.innerHTML = h;
  el.className = "on";
  clearTimeout(celebrate._t);
  celebrate._t = setTimeout(function(){ el.className = ""; el.innerHTML = ""; }, 2900);
}

/* A number that flies from the thing that earned it to the chip that holds it.
   Small, and it is most of why a mobile game feels connected rather than
   stateful. */
function fly(fromEl, toSel, text, colour){
  if (reduced() || !fromEl) return;
  var to = document.querySelector(toSel);
  if (!to) return;
  var a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect();
  var n = document.createElement("div");
  n.className = "fly";
  n.textContent = text;
  if (colour) n.style.color = colour;
  n.style.left = (a.left + a.width / 2 - 20) + "px";
  n.style.top = (a.top + a.height / 2 - 10) + "px";
  document.body.appendChild(n);
  requestAnimationFrame(function(){
    n.style.transform = "translate(" + (b.left + b.width / 2 - a.left - a.width / 2) + "px,"
      + (b.top + b.height / 2 - a.top - a.height / 2) + "px) scale(.6)";
    n.style.opacity = "0";
  });
  setTimeout(function(){
    if (n.parentNode) n.parentNode.removeChild(n);
    to.classList.remove("bump"); void to.offsetWidth; to.classList.add("bump");
  }, 720);
}

/* A total that counts up rather than jumping. */
function countTo(el, from, to, fmt, ms){
  if (!el) return;
  if (reduced() || from === to){ el.textContent = fmt(to); return; }
  var t0 = performance.now(), d = ms || 700;
  function step(t){
    var k = Math.min(1, (t - t0) / d);
    var e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


/* Eight motes of the control's own colour, from the point of the tap. */
function burst(el, color){
  if (reduced() || !el) return;
  var fx = document.getElementById("fx");
  var r = el.getBoundingClientRect();
  var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (var i = 0; i < 8; i++){
    var a = (i / 8) * 2 * Math.PI + Math.random() * .5;
    var d = 34 + Math.random() * 26;
    var m = document.createElement("i");
    m.className = "mote";
    m.style.cssText = "left:" + cx.toFixed(0) + "px;top:" + cy.toFixed(0) + "px;background:" + color
      + ";--mx:" + (Math.cos(a) * d).toFixed(0) + "px;--my:" + (Math.sin(a) * d).toFixed(0) + "px";
    fx.appendChild(m);
  }
  setTimeout(function(){
    while (fx.firstChild && fx.firstChild.className === "mote") fx.removeChild(fx.firstChild);
  }, 700);
}
